import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testSubmitLead() {
    console.log('--- TESTING LEADS SUBMISSION (DIRECT SUPABASE) ---');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    if (!supabaseUrl || !supabaseKey) {
        console.error('Supabase credentials missing!');
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const mockLead = {
        device_model: 'iPhone 13 - TEST',
        storage: '128GB',
        rank: 'S',
        condition_json: { battery: 90, box: true },
        estimated_price_internal: 80000,
        estimated_price_range_min: 75000,
        estimated_price_range_max: 80000,
        name: 'Test Setup User',
        phone: '08123456789',
        source: 'test_script'
    };

    console.log('Submitting mock lead:', mockLead);

    const { data, error } = await supabase
        .from('leads')
        .insert([mockLead])
        .select()
        .single();

    if (error) {
        console.error('FAILED to submit lead:', error.message);
    } else {
        console.log('SUCCESS! Lead stored in DB.');
        console.log('ID:', data.id);
        console.log('Created At:', data.created_at);
    }

    // Optional: Cleanup
    if (data?.id) {
        console.log('Cleaning up test data...');
        const { error: delError } = await supabase.from('leads').delete().eq('id', data.id);
        if (delError) console.warn('Failed to cleanup:', delError.message);
        else console.log('Cleanup successful.');
    }
}

testSubmitLead();
