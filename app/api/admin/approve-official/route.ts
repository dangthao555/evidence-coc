import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { assignRole } from '@/lib/contractViem';
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

    const { userId, role } = await request.json();

    // Lấy thông tin user
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError || !user) {
      return NextResponse.json({ error: 'Không tìm thấy user' }, { status: 400 });
    }

    // Gán role trên contract
    const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY;
    if (!adminPrivateKey) {
      throw new Error('ADMIN_PRIVATE_KEY not set');
    }

    console.log('Assigning role:', { walletAddress: user.wallet_address, role });

    const receipt = await assignRole(adminPrivateKey, user.wallet_address, role);
    console.log('Transaction confirmed:', receipt.transactionHash);

    // Cập nhật database
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        is_active: true,
        role: role,
        approved_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    const roleName = role === 1 ? 'OFFICER' : role === 2 ? 'ANALYST' : 'COURT';

    return NextResponse.json({
      success: true,
      message: `Đã duyệt tài khoản ${user.full_name} với vai trò ${roleName}`,
      transactionHash: receipt.transactionHash
    });

  } catch (error: any) {
    console.error('Approve official error:', error);
    return NextResponse.json({ error: error.message || 'Có lỗi xảy ra' }, { status: 500 });
  }
}