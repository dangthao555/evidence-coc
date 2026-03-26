import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import jwt from 'jsonwebtoken';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    console.log('Token received:', token ? 'Yes' : 'No');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - No token' }, { status: 401 });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
      console.log('Decoded token:', decoded);
    } catch (err) {
      console.error('Token verification failed:', err);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Lấy danh sách citizen chờ duyệt
    const { data: users, error } = await supabase
      .from('users')
      .select('id, full_name, email, id_number, username, created_at')
      .eq('is_active', false)
      .eq('user_type', 'citizen')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('Found pending citizens:', users?.length || 0);

    return NextResponse.json({ users });

  } catch (error) {
    console.error('Get pending citizens error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}