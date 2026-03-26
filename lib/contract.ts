import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './contractViem';

export const getContract = async (withSigner: boolean = false) => {
  if (typeof window === 'undefined') return null;

  const ethereum = (window as any).ethereum;
  if (!ethereum) {
    console.error('MetaMask not installed');
    return null;
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
    return null;
  }
};