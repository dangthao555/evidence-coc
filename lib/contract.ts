import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './contractViem';

export const getContract = async (withSigner: boolean = false) => {
  // Nếu đang ở server-side, dùng provider mặc định
  if (typeof window === 'undefined') {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  }

  const ethereum = (window as any).ethereum;

  // Nếu không có MetaMask, dùng RPC provider
  if (!ethereum) {
    console.log('MetaMask not installed, using RPC provider');
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  }

  try {
    const provider = new ethers.BrowserProvider(ethereum);

    if (withSigner) {
      const signer = await provider.getSigner();
      return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    }
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  } catch (error) {
    console.error('Failed to get contract:', error);
    // Fallback: dùng RPC provider
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  }
};