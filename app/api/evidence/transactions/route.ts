import { NextResponse } from 'next/server';

// Event signatures từ contract của bạn
const EVENT_SIGNATURES: Record<string, { name: string; icon: string; color: string }> = {
  '0x8c719a2dc21b18fa16e860dfb4e65ae274b696fb974205a5b6bedf792e517701': {
    name: 'Tạo bằng chứng',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    color: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
  },
  '0x3482ce4ef7c36effb5b351a475850e3fc01cfafb099b488a3baecc919cf04ae4': {
    name: 'Bắt đầu review',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    color: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30',
  },
  '0x233928db574858608d5633b09a08b173f4c9a099ad04398d32bea32063844623': {
    name: 'Xác thực hoàn tất',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    color: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30',
  },
  '0x90356d3abe47c875cf5b52eeadd6bbb4ed7d8e4716e8b9691726e98bf591a6ef': {
    name: 'Từ chối',
    icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    color: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30',
  },
  '0x9741af78655283c33c9c436648b79bebf6f00b36c94b441061cc8fcb9f422ae3': {
    name: 'Lưu trữ',
    icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4',
    color: 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700',
  },
  '0x4ac36fa53f167ceb85964be512e01de2a3b8bdb9862f917da079deeeff689b38': {
    name: 'Phân quyền',
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    color: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30',
  },
};

const DEFAULT = {
  name: 'Giao dịch',
  icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  color: 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700',
};

export async function GET() {
  try {
    const apiKey = process.env.ETHERSCAN_API_KEY;
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

    if (!apiKey) {
      return NextResponse.json({
        success: true,
        data: [],
        total: 0,
      });
    }

    const url = `https://api.etherscan.io/v2/api?chainid=11155111&module=logs&action=getLogs&address=${contractAddress}&fromBlock=0&toBlock=latest&apikey=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== '1') {
      return NextResponse.json({
        success: true,
        data: [],
        total: 0,
      });
    }

    const logs = data.result || [];
    console.log(`Found ${logs.length} logs from Etherscan`);

    // Decode từng log dựa trên topics[0]
    const transactions = logs.map((log: any) => {
      const topics = log.topics || [];
      const signature = topics[0];
      const eventInfo = EVENT_SIGNATURES[signature] || DEFAULT;

      return {
        id: log.transactionHash,
        type: eventInfo.name,
        icon: eventInfo.icon,
        iconColor: eventInfo.color,
        timestamp: Number(log.timeStamp),
        hash: log.transactionHash,
        blockNumber: Number(log.blockNumber),
      };
    });

    // Sắp xếp mới nhất trước - fix lỗi TypeScript
    transactions.sort((a: { blockNumber: number }, b: { blockNumber: number }) => b.blockNumber - a.blockNumber);

    return NextResponse.json({
      success: true,
      data: transactions.slice(0, 50),
      total: transactions.length,
    });

  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}