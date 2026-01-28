
import { NextResponse, NextRequest } from 'next/server';
import { getPricingData, PricingRow } from '@/lib/googleSheets';
import { FALLBACK_PRICING, MODEL_IMAGE_MAP } from '@/lib/constants';

export const dynamic = 'force-dynamic';

interface ModelSummary {
    id: string;
    name: string;
    image: string;
    maxPrice: number;
    displayPrice: string;
}

export async function GET(request: NextRequest) {
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

        // Construct Base URL
        const host = request.headers.get('host') || 'localhost:3000';
        const protocol = host.includes('localhost') ? 'http' : 'https';
        const baseUrl = `${protocol}://${host}`;

        // Convert to ModelSummary array
        const models: ModelSummary[] = Array.from(modelMap.entries()).map(([name, maxPrice]) => {
            const imagePath = MODEL_IMAGE_MAP[name.trim()] || MODEL_IMAGE_MAP['iPhone 12'] || '';
            const fullImageUrl = imagePath ? `${baseUrl}${imagePath}` : '';

            return {
                id: name,
                name: name,
                maxPrice: maxPrice,
                displayPrice: maxPrice.toLocaleString('id-ID'),
                image: fullImageUrl,
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
