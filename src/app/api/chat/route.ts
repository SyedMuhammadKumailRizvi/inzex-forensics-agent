import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { findingId, comment } = await request.json();

    if (!findingId || !comment) {
      return NextResponse.json({ error: 'Missing findingId or comment' }, { status: 400 });
    }

    const supabase = await createClient();

    // Write comment to Finding_Threads
    const { data, error } = await supabase
      .from('Finding_Threads')
      .insert([
        {
          finding_id: findingId,
          content: comment,
          author: 'analyst'
        }
      ])
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Trigger Gemma 3 to evaluate the new context (simulated)
    return NextResponse.json({ success: true, thread: data[0] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
