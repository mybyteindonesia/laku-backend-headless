
import { NextResponse, NextRequest } from 'next/server';
import { calculatePrice, PriceCalculationRequest, PriceCalculationResult } from '@/lib/pricing';
import { getPricingData, getConfigData, PricingRow, ConfigRow } from '@/lib/googleSheets';
import { FALLBACK_PRICING, FALLBACK_CONFIG } from '@/lib/constants';

export async function POST(request: NextRequest) {
    try {
        const body: PriceCalculationRequest = await request.json();

        // Validation (Basic)
        if (!body.model || !body.storage) {
            return NextResponse.json({ success: false, error: 'Missing model or storage' }, { status: 400 });
        }

        // 1. Fetch Data
        let pricingData: PricingRow[];
        let configData: ConfigRow[];

        try {
            const [pData, cData] = await Promise.all([
                getPricingData(),
                getConfigData()
            ]);
            pricingData = pData.length > 0 ? pData : FALLBACK_PRICING;
            configData = cData.length > 0 ? cData : FALLBACK_CONFIG;
        } catch (e) {
            console.warn('Google Sheets fetch failed, using fallback data:', e);
            pricingData = FALLBACK_PRICING;
            configData = FALLBACK_CONFIG;
        }

        // 2. Calculate Price
        const result: PriceCalculationResult = calculatePrice(body, pricingData, configData);

        return NextResponse.json({ success: true, data: result });

    } catch (error) {
        console.error('Error in POST /api/quote:', error);
        return NextResponse.json({ success: false, error: 'Failed to calculate price.' }, { status: 500 });
    }
}
