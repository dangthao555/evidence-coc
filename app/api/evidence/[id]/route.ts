import { NextRequest, NextResponse } from 'next/server';
import { getPublicClient } from '@/lib/contractViem';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contractViem';

interface Evidence {
  evidenceId: string;
  caseId: string;
  fileHash: string;
  fileURI: string;
  creator: string;
  createdAt: bigint;
  status: number;
}

const serializeEvidence = (evidence: any) => {
  return {
    evidenceId: evidence.evidenceId,
    caseId: evidence.caseId,
    fileHash: evidence.fileHash,
    fileURI: evidence.fileURI,
    creator: evidence.creator,
    createdAt: Number(evidence.createdAt),
    status: Number(evidence.status),
  };
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Lấy ID từ params (await vì params là Promise)
    const { id } = await params;

    if (!id || id === 'undefined' || id === '') {
      return NextResponse.json(
        { error: 'Mã bằng chứng không hợp lệ' },
        { status: 400 }
      );
    }

    // Decode ID
    let decodedId = id;
    try {
      decodedId = decodeURIComponent(id);
    } catch (e) {
      // ID is already decoded
    }

    const publicClient = getPublicClient();

    // Kiểm tra contract có tồn tại không
    const code = await publicClient.getBytecode({
      address: CONTRACT_ADDRESS,
    });

    if (!code || code === '0x') {
      return NextResponse.json(
        { error: 'Contract không tồn tại' },
        { status: 500 }
      );
    }

    // Lấy evidence từ contract - ép kiểu về Evidence
    const evidence = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'getEvidence',
      args: [decodedId],
    }) as Evidence;

    return NextResponse.json({
      success: true,
      data: serializeEvidence(evidence),
    });

  } catch (error: any) {
    console.error('Error fetching evidence:', error);

    // Kiểm tra lỗi evidence không tồn tại
    if (error.message?.includes('Evidence not found') ||
        error.message?.includes('execution reverted')) {
      return NextResponse.json(
        { error: 'Không tìm thấy bằng chứng' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to fetch evidence' },
      { status: 500 }
    );
  }
}