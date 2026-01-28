
import { NextResponse, NextRequest } from 'next/server';
import { getPricingData, PricingRow } from '@/lib/googleSheets';
import { FALLBACK_PRICING } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const modelName = searchParams.get('model');

        if (!modelName) {
            return NextResponse.json({ success: false, error: 'Model name is required' }, { status: 400 });
        }

        let pricingData: PricingRow[];
        try {
            pricingData = await getPricingData();
            if (pricingData.length === 0) pricingData = FALLBACK_PRICING;
        } catch {
            pricingData = FALLBACK_PRICING;
        }

        const options = pricingData
            .filter(p => p.model.toLowerCase() === modelName.toLowerCase())
            .map(p => ({ storage: p.storage, price: p.price }));

        // Deduplicate: take max price for same storage
        const headerMap = new Map<string, number>();
        options.forEach(opt => {
            const current = headerMap.get(opt.storage) || 0;
            if (opt.price > current) {
                headerMap.set(opt.storage, opt.price);
            }
        });

        const uniqueOptions = Array.from(headerMap.entries()).map(([storage, price]) => ({ storage, price }));

        // Sort by storage size (numeric)
        uniqueOptions.sort((a, b) => {
            const aVal = parseInt(a.storage.replace(/\D/g, '')) || 0;
            const bVal = parseInt(b.storage.replace(/\D/g, '')) || 0;

            // Special handling if units differ (GB vs TB), roughly TB > GB
            const aUnit = a.storage.toLowerCase().includes('tb') ? 1000 : 1;
            const bUnit = b.storage.toLowerCase().includes('tb') ? 1000 : 1;

            return (aVal * aUnit) - (bVal * bUnit);
        });

        return NextResponse.json({ success: true, data: uniqueOptions });

    } catch (error) {
        console.error('Error in GET /api/storage:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
