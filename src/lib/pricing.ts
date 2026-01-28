import { PricingRow, ConfigRow } from './googleSheets';

export interface PriceCalculationRequest {
    model: string;
    storage: string;
    batteryHealth: number;
    hasBox: boolean;
    boxMatchesImei: boolean;
    screenCondition: 'flawless' | 'light_scratches' | 'heavy_scratches' | 'cracked';
    bodyCondition: 'flawless' | 'light_scratches' | 'heavy_scratches' | 'dented';
}

export interface PriceCalculationResult {
    estimatedPriceInternal: number;
    minPrice: number;
    maxPrice: number;
    isHardReject: boolean;
    rejectionReason?: string;
    rank?: string;
    breakdown?: {
        basePrice: number;
        deductions: {
            reason: string;
            amount: number;
        }[];
    }
}

const DEFAULT_CONFIG: Record<string, number> = {
    'deduction_no_box': 3000,
    'deduction_battery_80_84': 3000,
    'deduction_rank_s': 3000,
    'deduction_rank_a_plus': 4500,
    'deduction_rank_a': 6000,
};

// Rank Logic based on Matrix
// S+: Screen Flawless, Body Flawless
// S : Screen Flawless, Body Light Scratches
// A+: Screen Light Scratches, Body Flawless OR Light Scratches
// A : Everything else (Screen Heavy, Body Heavy, Dent) unless hard reject
function determineRank(screen: string, body: string): 'S+' | 'S' | 'A+' | 'A' | 'B' {
    if (screen === 'flawless') {
        if (body === 'flawless') return 'S+';
        if (body === 'light_scratches') return 'S';
        if (body === 'heavy_scratches') return 'A'; // Mulus + Lecet Banyak -> A
    }

    if (screen === 'light_scratches') {
        if (body === 'flawless') return 'A+';
        if (body === 'light_scratches') return 'A+';
        if (body === 'heavy_scratches') return 'A';
    }

    if (screen === 'heavy_scratches') {
        // Any body condition with heavy screen scratches is A (based on matrix implication "Lecet banyak" rows)
        return 'A';
    }

    // Dent Logic: "Kalau ada dent langsung masuk A"
    if (body === 'dented') {
        return 'A';
    }

    return 'B'; // Should not happen if inputs are valid, or marks a lower tier
}

export function calculatePrice(
    request: PriceCalculationRequest,
    pricingData: PricingRow[],
    configData: ConfigRow[]
): PriceCalculationResult {

    // 1. Convert ConfigRow[] to Map
    const config = configData.reduce((acc, row) => {
        acc[row.key] = row.value;
        return acc;
    }, { ...DEFAULT_CONFIG });

    // 2. HARD REJECT CHECKS
    if (request.batteryHealth < 80) {
        return {
            estimatedPriceInternal: 0, minPrice: 0, maxPrice: 0,
            isHardReject: true, rejectionReason: 'BATTERY_HEALTH_LOW'
        };
    }
    // Only Cracked Screen is Hard Reject now. Dent is Rank A.
    if (request.screenCondition === 'cracked') {
        return {
            estimatedPriceInternal: 0, minPrice: 0, maxPrice: 0,
            isHardReject: true, rejectionReason: 'SCREEN_CRACKED'
        };
    }

    // 3. Find Base Price
    const device = pricingData.find(p =>
        p.model.toLowerCase() === request.model.toLowerCase() &&
        p.storage.toLowerCase() === request.storage.toLowerCase()
    );

    if (!device) {
        return {
            estimatedPriceInternal: 0, minPrice: 0, maxPrice: 0,
            isHardReject: true, rejectionReason: 'MODEL_NOT_FOUND'
        };
    }

    let currentPrice = device.price;
    const deductions = [];

    // 4. Calculate Deductions

    // Condition Rank
    const rank = determineRank(request.screenCondition, request.bodyCondition);

    if (rank === 'S+') {
        // Base Price, no deduction
    } else if (rank === 'S') {
        const amount = config['deduction_rank_s'] || 3000;
        currentPrice -= amount;
        deductions.push({ reason: 'Rank S Condition', amount });
    } else if (rank === 'A+') {
        const amount = config['deduction_rank_a_plus'] || 4500;
        currentPrice -= amount;
        deductions.push({ reason: 'Rank A+ Condition', amount });
    } else if (rank === 'A') {
        const amount = config['deduction_rank_a'] || 6000;
        currentPrice -= amount;
        deductions.push({ reason: 'Rank A Condition', amount });
    } else {
        // Fallback for B or unknown, treat as A for now or custom B logic
        const amount = config['deduction_rank_a'] || 6000; // max deduction for now
        currentPrice -= amount;
        deductions.push({ reason: 'Condition Below A', amount });
    }

    // Battery
    if (request.batteryHealth < 95) {
        const steps = Math.ceil((95 - request.batteryHealth) / 5);
        // Ensure deduction_battery_step exists, else default 3000
        const stepAmount = config['deduction_battery_step'] || 3000;
        const amount = stepAmount * steps;
        currentPrice -= amount;
        deductions.push({ reason: `Battery Health ${request.batteryHealth}%`, amount });
    }

    // Box
    if (!request.hasBox || !request.boxMatchesImei) {
        const amount = config['deduction_no_box'] || 3000;
        currentPrice -= amount;
        deductions.push({ reason: 'No Original Box', amount });
    }

    // 5. Final Output
    currentPrice = Math.max(0, currentPrice);

    return {
        estimatedPriceInternal: currentPrice,
        minPrice: currentPrice - 5000,
        maxPrice: currentPrice,
        isHardReject: false,
        rank: rank,
        breakdown: {
            basePrice: device.price,
            deductions
        }
    };
}
