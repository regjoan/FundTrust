import {
  BrowserProvider,
  JsonRpcProvider,
  Contract,
  type BrowserProvider as BrowserProviderType,
  type JsonRpcProvider as JsonRpcProviderType,
} from "ethers";

import FundTrustABI from "../abi/FundTrust.json";

// ===============================
// CONFIG
// ===============================

export const CONTRACT_ADDRESS = "0xC92a46Ce8907a1D2F8070B06F98700E7cfB39Efc";

export const RPC_URL = "https://rpc.bohr.life";

export const CHAIN_ID = 968;

// ABI
const ABI = (FundTrustABI as any).abi ?? FundTrustABI;

// ===============================
// PUBLIC PROVIDER (NO METAMASK)
// ===============================

export const publicProvider: JsonRpcProviderType = new JsonRpcProvider(RPC_URL);

// ===============================
// PUBLIC CONTRACT
// ===============================

export const publicContract = new Contract(
  CONTRACT_ADDRESS,
  ABI,
  publicProvider,
);

// ===============================
// CONNECT WALLET
// ===============================
export async function connectWallet() {
  const ethereum = (window as any).ethereum;

  if (!ethereum) {
    throw new Error("MetaMask is not installed.");
  }

  const provider = new BrowserProvider(ethereum);

  await provider.send("eth_requestAccounts", []);

  const signer = await provider.getSigner();

  const address = await signer.getAddress();

  const contract = new Contract(CONTRACT_ADDRESS, ABI, signer);

  return {
    provider,
    signer,
    address,
    contract,
  };
}

// ===============================
// CREATE PROGRAM
// ===============================

export async function createProgram(
  title: string,
  description: string,
  totalFund: number | bigint,
) {
  const { contract } = await connectWallet();

  const tx = await contract.createProgram(title, description, totalFund);

  await tx.wait();

  const programId = await contract.programCounter();

  return Number(programId);
}

// ===============================
// GET PROGRAM
// ===============================

// ===============================
// GET PROGRAM
// ===============================

export async function getProgram(programId: number) {
  const [
    id,
    creator,
    title,
    description,
    totalFund,
    depositedFund,
    remainingFund,
    active,
  ] = await publicContract.getProgram(programId);

  return {
    id: Number(id),
    creator,
    title,
    description,
    totalFund,
    depositedFund,
    remainingFund,
    active,
  };
}
// ===============================
// GET CONTRACT BALANCE
// ===============================

export async function getContractBalance() {
  return await publicContract.getContractBalance();
}

// ===============================
// GET RECIPIENTS
// ===============================

export async function getProgramRecipients(programId: number) {
  return await publicContract.getProgramRecipients(programId);
}

// ===============================
// GET ALLOCATION
// ===============================

export async function getAllocation(programId: number, recipient: string) {
  return await publicContract.getAllocation(programId, recipient);
}

// ===============================
// EVENT LOGS
// ===============================

export async function getProgramTimeline(programId: number) {
  const created = await publicContract.queryFilter(
    publicContract.filters.ProgramCreated(programId),
  );

  const deposited = await publicContract.queryFilter(
    publicContract.filters.FundDeposited(programId),
  );

  const allocated = await publicContract.queryFilter(
    publicContract.filters.FundAllocated(programId),
  );

  const released = await publicContract.queryFilter(
    publicContract.filters.FundReleased(programId),
  );

  const claimed = await publicContract.queryFilter(
    publicContract.filters.AidClaimed(programId),
  );

  return {
    created,
    deposited,
    allocated,
    released,
    claimed,
  };
}
