import { NextRequest, NextResponse } from 'next/server';
import { getPublicClient } from '@/lib/contractViem';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contractViem';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const publicClient = getPublicClient();

    // Lấy thông tin case
    const caseData = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'getCase',
      args: [id],
    }) as any;

    // Lấy danh sách evidence trong case
    const evidenceIds = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'getEvidenceByCase',
      args: [id],
    }) as string[];

    // Lấy chi tiết từng evidence
    const evidences = await Promise.all(
      evidenceIds.map(async (evId) => {
        try {
          const evidence = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: 'getEvidence',
            args: [evId],
          }) as any;
          return {
            evidenceId: evidence.evidenceId,
            caseId: evidence.caseId,
            status: Number(evidence.status),
            createdAt: Number(evidence.createdAt),
          };
        } catch {
          return null;
        }
      })
    );

    const validEvidences = evidences.filter(ev => ev !== null);

    return NextResponse.json({
      success: true,
      case: {
        caseId: caseData.caseId,
        title: caseData.title,
        description: caseData.description,
        officer: caseData.officer,
        status: Number(caseData.status),
        createdAt: Number(caseData.createdAt),
        closedAt: Number(caseData.closedAt),
      },
      evidences: validEvidences,
    });

  } catch (error: any) {
    console.error('Error fetching case:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch case' },
      { status: 500 }
    );
  }
}