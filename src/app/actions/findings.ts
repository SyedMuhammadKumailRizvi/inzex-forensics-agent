'use server';

import { createClient } from '@/lib/supabase/server';
import { Finding } from '@/types/database';

/**
 * Fetches all findings for a specific case ID.
 * The results include the volatility_raw_json explicitly typed as Record<string, any> (JSONB equivalent).
 */
export async function getFindingsForCase(caseId: string): Promise<{ data: Finding[] | null; error: string | null }> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('findings')
      .select('*')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch error:', error);
      return { data: null, error: error.message };
    }

    // Type casting here isn't strictly necessary if Supabase types are perfectly generated,
    // but this ensures the return type explicitly matches your frontend interface requirements.
    return { data: data as Finding[], error: null };
  } catch (err) {
    console.error('Unexpected error fetching findings:', err);
    return { data: null, error: 'An unexpected error occurred while fetching findings.' };
  }
}
