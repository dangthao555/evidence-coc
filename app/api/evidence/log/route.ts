import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const { evidenceId, caseId, fileHash, fileURI, transactionHash } = await request.json();

    await supabase.from('transactions').insert({
      user_id: decoded.userId,
      function_name: 'addEvidence',
      evidence_id: evidenceId,
      case_id: caseId,
      file_hash: fileHash,
      file_uri: fileURI,
      transaction_hash: transactionHash,
      status: 'confirmed'
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save log error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}