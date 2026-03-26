import { createPublicClient, createWalletClient, http, formatEther, parseEther } from 'viem';
import { sepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

export const CONTRACT_ABI = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_evidenceId",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_caseId",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_fileHash",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_fileURI",
				"type": "string"
			}
		],
		"name": "addEvidence",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_id",
				"type": "string"
			}
		],
		"name": "archiveEvidence",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_user",
				"type": "address"
			},
			{
				"internalType": "enum EvidenceManagement.Role",
				"name": "_role",
				"type": "uint8"
			}
		],
		"name": "assignRole",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_id",
				"type": "string"
			}
		],
		"name": "markVerified",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "evidenceId",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "creator",
				"type": "address"
			}
		],
		"name": "EvidenceAdded",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "evidenceId",
				"type": "string"
			}
		],
		"name": "EvidenceArchived",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "evidenceId",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "analyst",
				"type": "address"
			}
		],
		"name": "EvidenceVerified",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "evidenceId",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "analyst",
				"type": "address"
			}
		],
		"name": "ReviewStarted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "enum EvidenceManagement.Role",
				"name": "role",
				"type": "uint8"
			}
		],
		"name": "RoleAssigned",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_id",
				"type": "string"
			}
		],
		"name": "startReview",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "admin",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "allEvidenceIds",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getAllEvidenceIds",
		"outputs": [
			{
				"internalType": "string[]",
				"name": "",
				"type": "string[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_id",
				"type": "string"
			}
		],
		"name": "getCustodyHistory",
		"outputs": [
			{
				"components": [
					{
						"internalType": "address",
						"name": "actor",
						"type": "address"
					},
					{
						"internalType": "string",
						"name": "action",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "timestamp",
						"type": "uint256"
					}
				],
				"internalType": "struct EvidenceManagement.CustodyRecord[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_id",
				"type": "string"
			}
		],
		"name": "getEvidence",
		"outputs": [
			{
				"components": [
					{
						"internalType": "string",
						"name": "evidenceId",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "caseId",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "fileHash",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "fileURI",
						"type": "string"
					},
					{
						"internalType": "address",
						"name": "creator",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "createdAt",
						"type": "uint256"
					},
					{
						"internalType": "enum EvidenceManagement.EvidenceStatus",
						"name": "status",
						"type": "uint8"
					}
				],
				"internalType": "struct EvidenceManagement.Evidence",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_caseId",
				"type": "string"
			}
		],
		"name": "getEvidenceByCase",
		"outputs": [
			{
				"internalType": "string[]",
				"name": "",
				"type": "string[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "roles",
		"outputs": [
			{
				"internalType": "enum EvidenceManagement.Role",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_hash",
				"type": "string"
			}
		],
		"name": "verifyEvidence",
		"outputs": [
			{
				"internalType": "bool",
				"name": "exists",
				"type": "bool"
			},
			{
				"internalType": "string",
				"name": "evidenceId",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

export const getPublicClient = () => {
  const rpcUrl = process.env.RPC_URL || 'https://rpc.sepolia.org';
  return createPublicClient({
    chain: sepolia,
    transport: http(rpcUrl),
  });
};

export const getWalletClient = (privateKey: string) => {
  const account = privateKeyToAccount(privateKey as `0x${string}`);
  const rpcUrl = process.env.RPC_URL || 'https://rpc.sepolia.org';
  return createWalletClient({
    account,
    chain: sepolia,
    transport: http(rpcUrl),
  });
};

export const assignRole = async (privateKey: string, userAddress: string, role: number) => {
  const walletClient = getWalletClient(privateKey);
  const publicClient = getPublicClient();

  const { request } = await publicClient.simulateContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'assignRole',
    args: [userAddress, role],
    account: walletClient.account,
  });

  const hash = await walletClient.writeContract(request);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  return receipt;
};
