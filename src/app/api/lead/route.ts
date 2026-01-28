
import { NextResponse, NextRequest } from 'next/server';
import { appendLead } from '@/lib/googleSheets';
import { calculatePrice, PriceCalculationRequest, PriceCalculationResult } from '@/lib/pricing';
import { getPricingData, getConfigData, PricingRow, ConfigRow } from '@/lib/googleSheets';
import { FALLBACK_PRICING, FALLBACK_CONFIG } from '@/lib/constants';

async function triggerN8nWebhook(leadData: Record<string, unknown>, quote: PriceCalculationResult) {
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    if (!webhookUrl) {
        console.log('N8N_WEBHOOK_URL not set, skipping webhook trigger.');
        return;
    }

    try {
        const payload = {
            ...leadData,
            calculatedQuote: quote,
            submittedAt: new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Tokyo' }).replace('T', ' '),
        };

        // Fire and forget, but await fetch dispatch
        fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        }).catch(err => console.error('Error sending webhook:', err));

    } catch (error) {
        console.error('Error preparing n8n webhook:', error);
    }
}

export async function POST(request: NextRequest) {
    try {
        const leadData = await request.json();
        console.log('Lead Submission:', leadData);

        // 1. Re-calculate price to ensure validity and get current rank/price
        // Map input to PriceCalculationRequest
        const model = leadData.model as string;
        const storage = leadData.storage as string;
        const batteryHealth = Number(leadData.batteryHealth || 100);

        // Box Logic
        const boxCondition = leadData.boxCondition as string;
        let hasBox = true;
        let boxMatchesImei = true;

        if (boxCondition === 'unit_only') {
            hasBox = false;
            boxMatchesImei = false;
        } else if (boxCondition === 'non_original') {
            hasBox = true;
            boxMatchesImei = false;
        }

        // Screen Logic
        const screenConditionStr = leadData.screenCondition as string;
        const lcdConditionStr = leadData.lcdCondition as string;
        let mappedScreen: 'flawless' | 'light_scratches' | 'heavy_scratches' | 'cracked' = 'flawless';

        if (screenConditionStr === 'light_scratches') mappedScreen = 'light_scratches';
        if (screenConditionStr === 'heavy_scratches') mappedScreen = 'heavy_scratches';
        if (screenConditionStr === 'cracked' || (lcdConditionStr && lcdConditionStr !== 'normal')) mappedScreen = 'cracked';

        // Body Logic
        const bodyConditionStr = leadData.bodyCondition as string;
        let mappedBody: 'flawless' | 'light_scratches' | 'heavy_scratches' | 'dented' = 'flawless';

        if (bodyConditionStr === 'light_scratches') mappedBody = 'light_scratches';
        if (bodyConditionStr === 'heavy_scratches') mappedBody = 'heavy_scratches';
        if (bodyConditionStr === 'dent' || bodyConditionStr === 'dented') mappedBody = 'dented';

        const calculationRequest: PriceCalculationRequest = {
            model,
            storage,
            batteryHealth,
            hasBox,
            boxMatchesImei,
            screenCondition: mappedScreen,
            bodyCondition: mappedBody,
        };

        // Fetch Data for calculation
        let pricingData: PricingRow[];
        let configData: ConfigRow[];
        try {
            const [pData, cData] = await Promise.all([
                getPricingData(),
                getConfigData()
            ]);
            pricingData = pData.length > 0 ? pData : FALLBACK_PRICING;
            configData = cData.length > 0 ? cData : FALLBACK_CONFIG;
        } catch {
            pricingData = FALLBACK_PRICING;
            configData = FALLBACK_CONFIG;
        }

        const quote = calculatePrice(calculationRequest, pricingData, configData);

        // 2. Append to Google Sheets
        const timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
        const success = await appendLead({
            timestamp,
            name: (leadData.contactName as string) || '-',
            whatsapp: (leadData.contactWhatsapp as string) || '-',
            model,
            storage,
            batteryHealth,
            screenCondition: screenConditionStr || '-',
            bodyCondition: bodyConditionStr || '-',
            boxCondition: boxCondition || '-',
            rank: quote.rank || '-',
            priceMin: quote.minPrice,
            priceMax: quote.maxPrice,
        });

        if (!success) {
            return NextResponse.json({ success: false, error: 'Failed to save lead data' }, { status: 500 });
        }

        // 3. Trigger N8N
        await triggerN8nWebhook(leadData, quote);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error in POST /api/lead:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
