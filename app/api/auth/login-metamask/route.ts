import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import jwt from 'jsonwebtoken';

const ADMIN_WALLET = '0x60D4A659B61e7DD9f771dB0BBB447289e78BD31E';

export async function POST(request: Request) {
  try {
    const { walletAddress } = await request.json();

    console.log('=== LOGIN METAMASK API ===');
    console.log('Wallet:', walletAddress);

    // Tìm user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .ilike('wallet_address', walletAddress)
      .single();

    if (error || !user) {
      console.error('User not found:', error);
      return NextResponse.json({ error: 'Tài khoản không tồn tại' }, { status: 401 });
    }

    console.log('User found:', user.full_name, 'is_active:', user.is_active);

    // Kiểm tra active
    if (!user.is_active && !user.is_admin) {
      return NextResponse.json({ error: 'Tài khoản đang chờ duyệt' }, { status: 401 });
    }

    // Cập nhật last_login
    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id);

    // Tạo token
    const tokenPayload = {
      userId: user.id,
      walletAddress: user.wallet_address,
      role: user.role,
      fullName: user.full_name,
      userType: user.user_type,
      isAdmin: user.is_admin || false
    };

    console.log('Token payload:', tokenPayload);

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET!, { expiresIn: '7d' });

    console.log('Token created, length:', token.length);

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        role: user.role,
        userType: user.user_type,
        walletAddress: user.wallet_address,
        isAdmin: user.is_admin || false
      }
    });

  } catch (error) {
    console.error('Login metamask error:', error);
    return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 });
  }
}