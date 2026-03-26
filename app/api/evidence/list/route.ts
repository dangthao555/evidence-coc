import { NextResponse } from 'next/server';
import { getPublicClient } from '@/lib/contractViem';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contractViem';

// Helper function để chuyển đổi BigInt thành số
const serializeEvidence = (evidence: any) => {
  return {
    evidenceId: evidence.evidenceId,
    caseId: evidence.caseId,
    fileHash: evidence.fileHash,
    fileURI: evidence.fileURI,
    creator: evidence.creator,
    createdAt: Number(evidence.createdAt), //
    status: Number(evidence.status),       //
  };
};

export async function GET() {
  try {
    const publicClient = getPublicClient();

    // Lấy tất cả evidence IDs
    const evidenceIds = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'getAllEvidenceIds',
      args: [],
    }) as string[];

    // Lấy chi tiết từng evidence
    const evidences = await Promise.all(
      evidenceIds.map(async (id) => {
        try {
          const evidence = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: 'getEvidence',
            args: [id],
          });
          return serializeEvidence(evidence); // 👈 Serialize trước khi trả về
        } catch (err) {
          console.error(`Error fetching evidence ${id}:`, err);
          return null;
        }
      })
    );

    // Lọc bỏ các evidence bị lỗi
    const validEvidences = evidences.filter(ev => ev !== null);

    return NextResponse.json({
      success: true,
      data: validEvidences,
      total: validEvidences.length
    });

  } catch (error: any) {
    console.error('Error fetching evidence list:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch evidences' },
      { status: 500 }
    );
  }
}