
import { NextResponse } from 'next/server';
import { getPricingData, PricingRow } from '@/lib/googleSheets';
import { FALLBACK_PRICING, MODEL_IMAGE_MAP } from '@/lib/constants';

export const dynamic = 'force-dynamic';

interface ModelSummary {
    id: string;
    name: string;
    image: string;
    maxPrice: number;
}

export async function GET() {
    try {
        let pricingData: PricingRow[];
        try {
            pricingData = await getPricingData();
            if (pricingData.length === 0) pricingData = FALLBACK_PRICING;
        } catch {
            pricingData = FALLBACK_PRICING;
        }

        // Group by model
        const modelMap = new Map<string, number>(); // Model Name -> Max Price

        pricingData.forEach(row => {
            const currentMax = modelMap.get(row.model) || 0;
            if (row.price > currentMax) {
                modelMap.set(row.model, row.price);
            }
        });

        // Convert to ModelSummary array
        const models: ModelSummary[] = Array.from(modelMap.entries()).map(([name, maxPrice]) => {
            return {
                id: name,
                name: name,
                maxPrice: maxPrice,
                image: MODEL_IMAGE_MAP[name.trim()] || MODEL_IMAGE_MAP['iPhone 12'] || '', // Fallback image
            };
        });

        // Sort by maxPrice descending (Premium first)
        const sortedModels = models.sort((a, b) => b.maxPrice - a.maxPrice);

        return NextResponse.json({ success: true, data: sortedModels });

    } catch (error) {
        console.error('Error in GET /api/models:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
