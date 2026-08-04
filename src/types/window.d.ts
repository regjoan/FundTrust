// src/types/window.d.ts
// Global declaration to inform TypeScript about the optional `ethereum` object injected by MetaMask.

interface Window {
  ethereum?: any;
}
