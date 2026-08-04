// scripts/deploy.js
// Deploy FundTrust contract using ethers.js
// Ensure you have ethers installed: npm i ethers
// Create a .env file with PRIVATE_KEY and RPC_URL (or edit the variables below)
require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Load compiled ABI and bytecode (run `npm run compile` first)
const abiPath = path.resolve(__dirname, '..', 'build', 'FundTrust_sol_FundTrust.abi');
const binPath = path.resolve(__dirname, '..', 'build', 'FundTrust_sol_FundTrust.bin');
if (!fs.existsSync(abiPath) || !fs.existsSync(binPath)) {
  console.error('ABI or bytecode not found. Run `npm run compile` first.');
  process.exit(1);
}
const abi = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
const bytecode = fs.readFileSync(binPath, 'utf8').trim();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "YOUR_PRIVATE_KEY";
const RPC_URL = process.env.RPC_URL || "https://rpc.bohr.life";

(async () => {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  console.log('Deploying from address:', wallet.address);
  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const contract = await factory.deploy();
  await contract.waitForDeployment();
  console.log('✅ FundTrust deployed to:', contract.target);
})();
