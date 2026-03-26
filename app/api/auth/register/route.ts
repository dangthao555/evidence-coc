import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { fullName, email, idNumber, username, password } = await request.json();

    // Kiểm tra email
    const { data: existingEmail } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single();

    if (existingEmail) {
      return NextResponse.json({ error: 'Email đã được đăng ký' }, { status: 400 });
    }

    // Kiểm tra CCCD
    const { data: existingId } = await supabase
      .from('users')
      .select('id_number')
      .eq('id_number', idNumber)
      .single();

    if (existingId) {
      return NextResponse.json({ error: 'Số CCCD đã được đăng ký' }, { status: 400 });
    }

    // Kiểm tra username
    const { data: existingUsername } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .single();

    if (existingUsername) {
      return NextResponse.json({ error: 'Tên đăng nhập đã tồn tại' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Lưu user với is_active = false (chờ duyệt)
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        full_name: fullName,
        email,
        id_number: idNumber,
        username,
        password_hash: hashedPassword,
        role: 0, // NONE
        user_type: 'citizen',
        is_active: false
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Đăng ký thành công! Vui lòng chờ admin xác nhận.'
    });

  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 });
  }
}