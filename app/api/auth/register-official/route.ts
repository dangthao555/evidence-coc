import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { fullName, email, idNumber, department, position, walletAddress } = await request.json();

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

    // Kiểm tra ví đã được đăng ký chưa
    const { data: existingWallet } = await supabase
      .from('users')
      .select('wallet_address')
      .eq('wallet_address', walletAddress)
      .single();

    if (existingWallet) {
      return NextResponse.json({ error: 'Địa chỉ ví đã được đăng ký' }, { status: 400 });
    }

    // Lưu user với role = 0 (NONE), is_active = false, user_type = 'official'
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        full_name: fullName,
        email,
        id_number: idNumber,
        department,
        position,
        wallet_address: walletAddress,
        role: 0, // NONE ban đầu
        user_type: 'official',
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
    console.error('Register official error:', error);
    return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 });
  }
}