// scripts/test-sheets.ts
// Usable via: npx tsx scripts/test-sheets.ts (need to install tsx first or use ts-node)
// For now, we will run it by compiling or using safe generic node if possible, 
// but since it imports typescript files from src, we might need tsx. 
// Let's assume we can run it with `npx tsx` inside the project.

import { getPricingData, getConfigData } from '../src/lib/googleSheets';
import { calculatePrice } from '../src/lib/pricing';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
    console.log('--- TESTING GOOGLE SHEETS INTEGRATION ---');
    console.log('Sheet ID:', process.env.GOOGLE_SHEET_ID ? 'OK' : 'MISSING');
    console.log('Service Account:', process.env.GOOGLE_SERVICE_ACCOUNT_PATH ? 'OK' : 'MISSING');

    try {
        console.log('\nFetching Pricing Data...');
        const pricing = await getPricingData();
        console.log(`Success! Found ${pricing.length} rows.`);
        if (pricing.length > 0) console.log('Sample:', pricing[0]);

        console.log('\nFetching Config Data...');
        const config = await getConfigData();
        console.log(`Success! Found ${config.length} rows.`);
        if (config.length > 0) console.log('Sample:', config[0]);

        // Test Calculation if data exists
        if (pricing.length > 0) {
            console.log('\n--- TESTING PRICING LOGIC ---');
            const testReq = {
                model: pricing[0].model,
                storage: pricing[0].storage,
                batteryHealth: 88,
                hasBox: true,
                boxMatchesImei: true,
                screenCondition: 'flawless' as const,
                bodyCondition: 'light_scratches' as const
            };
            console.log('Scenario:', testReq);

            const result = calculatePrice(testReq, pricing, config);
            console.log('Result:', JSON.stringify(result, null, 2));
        } else {
            console.warn('Cannot test pricing logic: No data found in Sheets.');
            console.warn('Hint: Make sure the Sheet has "Pricing" and "Config" tabs with data.');
        }

    } catch (error) {
        console.error('TEST FAILED:', error);
    }
}

main();
