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

export const CONTRACT_ADDRESS =
    "0x07da61c70a82BB9CA1c81937cD6a9a5B419487DA";

export const RPC_URL = "https://rpc.bohr.life";

export const CHAIN_ID = 968;

// Jika JSON hasil Hardhat/Remix berbentuk
// {
//    abi: [...]
// }
// maka ambil field abi.
// Kalau JSON hanya berupa array ABI,
// maka gunakan langsung.
const ABI = (FundTrustABI as any).abi ?? FundTrustABI;

// ===============================
// PUBLIC PROVIDER (NO METAMASK)
// ===============================

export const publicProvider: JsonRpcProviderType =
    new JsonRpcProvider(RPC_URL);

// ===============================
// PUBLIC CONTRACT
// ===============================

export const publicContract = new Contract(
    CONTRACT_ADDRESS,
    ABI,
    publicProvider
);

// ===============================
// CONNECT WALLET
// ===============================

export async function connectWallet() {
    if (!window.ethereum) {
        throw new Error("MetaMask is not installed.");
    }

    const provider = new BrowserProvider(window.ethereum);

    await provider.send("eth_requestAccounts", []);

    const signer = await provider.getSigner();

    const contract = new Contract(
        CONTRACT_ADDRESS,
        ABI,
        signer
    );

    return {
        provider,
        signer,
        contract,
    };
}

// ===============================
// CREATE PROGRAM
// ===============================

export async function createProgram(
    title: string,
    description: string,
    totalFund: number | bigint
) {
    const { contract } = await connectWallet();

    const tx = await contract.createProgram(
        title,
        description,
        totalFund
    );

    await tx.wait();

    // Program ID terbaru
    const programId = await contract.programCounter();

    return Number(programId);
}

// ===============================
// GET PROGRAM
// ===============================

export async function getProgram(programId: number) {
    return await publicContract.getProgram(programId);
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

export async function getProgramRecipients(
    programId: number
) {
    return await publicContract.getProgramRecipients(
        programId
    );
}

// ===============================
// GET ALLOCATION
// ===============================

export async function getAllocation(
    programId: number,
    recipient: string
) {
    return await publicContract.getAllocation(
        programId,
        recipient
    );
}

// ===============================
// EVENT LOGS
// ===============================

export async function getProgramTimeline(
    programId: number
) {
    const created =
        await publicContract.queryFilter(
            publicContract.filters.ProgramCreated(programId)
        );

    const deposited =
        await publicContract.queryFilter(
            publicContract.filters.FundDeposited(programId)
        );

    const allocated =
        await publicContract.queryFilter(
            publicContract.filters.FundAllocated(programId)
        );

    const released =
        await publicContract.queryFilter(
            publicContract.filters.FundReleased(programId)
        );

    const claimed =
        await publicContract.queryFilter(
            publicContract.filters.AidClaimed(programId)
        );

    return {
        created,
        deposited,
        allocated,
        released,
        claimed,
    };
}