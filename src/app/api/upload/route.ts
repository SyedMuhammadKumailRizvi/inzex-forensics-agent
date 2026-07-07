import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const case_number = formData.get('case_number') as string;
    const title = formData.get('title') as string;
    const summary = formData.get('summary') as string;
    const investigator_name = formData.get('investigator_name') as string;
    const organization = formData.get('organization') as string;
    const os_profile = formData.get('os_profile') as string;

    if (!file || !case_number || !title || !investigator_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Create the Case
    const { data: caseData, error: caseError } = await supabase
      .from('Cases')
      .insert([
        {
          case_number,
          title,
          summary,
          investigator_name,
          organization,
          os_profile,
          status: 'pending_upload'
        }
      ])
      .select()
      .single();

    if (caseError) throw new Error(caseError.message);
    const caseId = caseData.id;

    // 2. Upload the file to Storage
    const storagePath = `uploads/${case_number}/${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('cridex.vmem')
      .upload(storagePath, file);

    if (uploadError) throw new Error(uploadError.message);

    // 3. Create the Evidence Record
    const { error: evidenceError } = await supabase
      .from('Evidence')
      .insert([
        {
          case_id: caseId,
          file_name: file.name,
          file_size: file.size,
          storage_path: storagePath,
          upload_status: 'complete'
        }
      ]);

    if (evidenceError) throw new Error(evidenceError.message);

    // 4. Update Case status
    await supabase.from('Cases').update({ status: 'analyzing' }).eq('id', caseId);

    // Returns the UUID for redirecting
    return NextResponse.json({ success: true, caseId: caseId });
  } catch (err: any) {
    console.error('Upload Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
