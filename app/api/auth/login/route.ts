import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'Sai tên đăng nhập hoặc mật khẩu' }, { status: 401 });
    }

    // Chỉ citizen mới được đăng nhập bằng username/password
    if (user.user_type !== 'citizen') {
      return NextResponse.json({ error: 'Vui lòng đăng nhập bằng MetaMask' }, { status: 401 });
    }

    if (!user.is_active) {
      return NextResponse.json({
        error: 'Tài khoản đang chờ admin xác nhận. Vui lòng liên hệ quản trị viên.'
      }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: 'Sai tên đăng nhập hoặc mật khẩu' }, { status: 401 });
    }

    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id);

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
        fullName: user.full_name,
        userType: user.user_type
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        role: user.role,
        userType: user.user_type
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 });
  }
}