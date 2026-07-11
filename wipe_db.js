import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function wipeDatabase() {
    console.log("Wiping all cases from database...");
    const { data, error } = await supabase
        .from('cases')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete everything
    
    if (error) {
        console.error("Error wiping database:", error);
    } else {
        console.log("Database wiped successfully! Cascading deletes handled evidence and findings.");
    }
}

wipeDatabase();
