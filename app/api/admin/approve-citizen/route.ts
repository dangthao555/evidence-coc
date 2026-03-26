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

    try {
      jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { userId } = await request.json();

    const { data: user, error } = await supabase
      .from('users')
      .update({
        is_active: true,
        approved_at: new Date().toISOString()
      })
      .eq('id', userId)
      .eq('is_active', false)
      .select()
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'Không tìm thấy user' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Đã duyệt tài khoản ${user.full_name}`
    });

  } catch (error) {
    console.error('Approve citizen error:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}