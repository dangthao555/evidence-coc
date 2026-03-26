import { createPublicClient, createWalletClient, custom, http } from 'viem';
import { sepolia } from 'viem/chains';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './contractViem';
import detectEthereumProvider from '@metamask/detect-provider';

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || process.env.RPC_URL || 'https://rpc.sepolia.org';

export const addEvidence = async (
  evidenceId: string,
  caseId: string,
  fileHash: string,
  fileURI: string
) => {
  const provider = await detectEthereumProvider();
  if (!provider) throw new Error('Vui lòng cài MetaMask!');

  const ethereum = provider as any;
  const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

  const walletClient = createWalletClient({
    account: accounts[0] as `0x${string}`,
    chain: sepolia,
    transport: custom(ethereum),
  });

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(RPC_URL, { timeout: 30000 }),
  });

  // Switch sang Sepolia nếu cần
  const chainId = await ethereum.request({ method: 'eth_chainId' });
  if (chainId !== '0xaa36a7') {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0xaa36a7' }],
    });
  }

  const { request } = await publicClient.simulateContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'addEvidence',
    args: [evidenceId, caseId, fileHash, fileURI],
    account: walletClient.account,
  });

  try {
    const hash = await walletClient.writeContract(request);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    return receipt;
  } catch (error: any) {
    // Bắt lỗi user từ chối ký
    if (error.message?.includes('User rejected') ||
        error.message?.includes('denied transaction signature') ||
        error.code === 4001) {
      throw new Error('Bạn đã từ chối ký giao dịch trong MetaMask.');
    }
    throw error;
  }
};

export const startReview = async (evidenceId: string) => {
  const provider = await detectEthereumProvider();
  if (!provider) throw new Error('Vui lòng cài MetaMask!');

  const ethereum = provider as any;
  const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

  const walletClient = createWalletClient({
    account: accounts[0] as `0x${string}`,
    chain: sepolia,
    transport: custom(ethereum),
  });

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(RPC_URL, { timeout: 30000 }),
  });

  // Switch sang Sepolia nếu cần
  const chainId = await ethereum.request({ method: 'eth_chainId' });
  if (chainId !== '0xaa36a7') {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0xaa36a7' }],
    });
  }

  const { request } = await publicClient.simulateContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'startReview',
    args: [evidenceId],
    account: walletClient.account,
  });

  try {
    const hash = await walletClient.writeContract(request);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    return receipt;
  } catch (error: any) {
    if (error.message?.includes('User rejected')) {
      throw new Error('Bạn đã từ chối ký giao dịch trong MetaMask.');
    }
    throw error;
  }
};

export const markVerified = async (evidenceId: string) => {
  const provider = await detectEthereumProvider();
  if (!provider) throw new Error('Vui lòng cài MetaMask!');

  const ethereum = provider as any;
  const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

  const walletClient = createWalletClient({
    account: accounts[0] as `0x${string}`,
    chain: sepolia,
    transport: custom(ethereum),
  });

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(RPC_URL, { timeout: 30000 }),
  });

  // Switch sang Sepolia nếu cần
  const chainId = await ethereum.request({ method: 'eth_chainId' });
  if (chainId !== '0xaa36a7') {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0xaa36a7' }],
    });
  }

  const { request } = await publicClient.simulateContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'markVerified',
    args: [evidenceId],
    account: walletClient.account,
  });

  try {
    const hash = await walletClient.writeContract(request);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    return receipt;
  } catch (error: any) {
    if (error.message?.includes('User rejected')) {
      throw new Error('Bạn đã từ chối ký giao dịch trong MetaMask.');
    }
    throw error;
  }
};