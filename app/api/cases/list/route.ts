import { NextResponse } from 'next/server';
import { getPublicClient } from '@/lib/contractViem';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contractViem';

export async function GET() {
  try {
    const publicClient = getPublicClient();

    // 👉 Lấy tất cả case IDs từ contract (dùng hàm mới)
    const caseIds = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'getAllCaseIds',
      args: [],
    }) as string[];

    // Lấy thông tin từng case
    const cases = await Promise.all(
      caseIds.map(async (caseId) => {
        try {
          const caseData = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: 'getCase',
            args: [caseId],
          }) as any;

          return {
            caseId: caseData.caseId,
            title: caseData.title,
            description: caseData.description,
            officer: caseData.officer,
            status: Number(caseData.status),
            createdAt: Number(caseData.createdAt),
            closedAt: Number(caseData.closedAt),
          };
        } catch (error) {
          console.error(`Error fetching case ${caseId}:`, error);
          return null;
        }
      })
    );

    const validCases = cases.filter(c => c !== null);

    // Sắp xếp theo thứ tự tạo (mới nhất trước)
    validCases.sort((a, b) => b!.createdAt - a!.createdAt);

    return NextResponse.json({
      success: true,
      data: validCases,
    });

  } catch (error: any) {
    console.error('Error fetching cases:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch cases' },
      { status: 500 }
    );
  }
}