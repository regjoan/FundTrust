import fs from 'fs';
import path from 'path';

const appPath = path.resolve('src/app/App.tsx');
const appCode = fs.readFileSync(appPath, 'utf8');

const pvStartIdx = appCode.indexOf('function PublicVerification');
const explorerStartIdx = appCode.indexOf('// ─── Screen: Explorer');

if (pvStartIdx === -1 || explorerStartIdx === -1) {
    console.error("Could not find PublicVerification block");
    process.exit(1);
}

let pvCode = appCode.slice(pvStartIdx, explorerStartIdx).trim();

// Replace the function signature and state
const replacementTop = `export default function PublicVerification({ onBack }: { onBack: () => void }) {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const [program, setProgram] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith("/verify/")) {
      const idStr = path.split("/verify/")[1];
      if (idStr) {
        setQuery(idStr);
        handleSearch(idStr);
      }
    }
  }, []);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery) return;
    setSearched(true);
    setLoading(true);
    try {
      const idStr = searchQuery.replace(/[^0-9]/g, "");
      const id = Number(idStr);
      if (isNaN(id) || id <= 0) {
        setProgram(null);
        setLoading(false);
        return;
      }

      const prog = await getProgram(id);
      const recipients = await getProgramRecipients(id);
      
      const totalFund = Number(prog[3]);
      const remainingFund = Number(prog[5]);
      const released = totalFund - remainingFund;
      
      setProgram({
        id: \`PRG-\${String(id).padStart(3, '0')}\`,
        name: prog[1] || "Unknown Program",
        description: prog[2],
        budget: totalFund,
        released: released,
        beneficiaries: recipients.length,
        status: remainingFund === 0 && totalFund > 0 ? "completed" : "active",
        txId: "0x0000000000000000000000000000000000000000"
      });
    } catch (err) {
      console.error("Verification error:", err);
      setProgram(null);
    }
    setLoading(false);
  };`;

// We find the original return statement and replace everything above it inside the function
const returnIdx = pvCode.indexOf('return (');
const originalBody = pvCode.slice(0, returnIdx);

pvCode = pvCode.replace(originalBody, replacementTop + '\n\n  ');

// Update the search input onChange and button onClick to call handleSearch
pvCode = pvCode.replace('onClick={() => setSearched(true)}', 'onClick={() => handleSearch(query)} disabled={loading}');
pvCode = pvCode.replace('onKeyDown={e => { if (e.key === "Enter") setSearched(true); }}', 'onKeyDown={e => { if (e.key === "Enter") handleSearch(query); }}');

// Replace TRANSACTIONS map with an empty array or simple mapped display if needed, but the original used TRANSACTIONS.
// I'll just remove the transaction mock or replace it with a placeholder array.
pvCode = pvCode.replace('TRANSACTIONS.slice(0, 3).map(tx =>', '[].map((tx: any) =>');

const fullComponent = \`import { useState, useEffect } from "react";
import { ArrowLeft, Shield, Globe, Search, CheckCircle2, Check, Clock, ExternalLink, Copy, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { getProgram, getProgramRecipients } from "./contract";

const fmt = (n: number) => n >= 1000000 ? \`$$\${(n / 1000000).toFixed(1)}M\` : n >= 1000 ? \`$$\${(n / 1000).toFixed(0)}K\` : \`$$\${n}\`;
const pct = (a: number, b: number) => b === 0 ? 0 : Math.round((a / b) * 100);

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; text: string; dot: string }> = {
    active: { label: "Active", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
    completed: { label: "Completed", bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" },
    pending: { label: "Pending", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
    confirmed: { label: "Confirmed", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
    failed: { label: "Failed", bg: "bg-red-50", text: "text-red-600", dot: "bg-red-500" },
  };
  const s = map[status] ?? map.pending;
  return (
    <span className={\`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium \${s.bg} \${s.text}\`}>
      <span className={\`w-1.5 h-1.5 rounded-full \${s.dot}\`} />
      {s.label}
    </span>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="p-1.5 rounded-md hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
    >
      {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
    </button>
  );
}

\${pvCode}
\`;

fs.writeFileSync(path.resolve('src/app/components/blockchain/PublicVerification.tsx'), fullComponent);

// Now update App.tsx to remove the local PublicVerification and use the imported one
let newAppCode = appCode.replace(appCode.slice(pvStartIdx, explorerStartIdx), '');

// Add the import if not present
if (!newAppCode.includes('import PublicVerification')) {
  newAppCode = newAppCode.replace('import QRCodeGenerator from "./components/blockchain/QRCodeGenerator";', 'import QRCodeGenerator from "./components/blockchain/QRCodeGenerator";\\nimport PublicVerification from "./components/blockchain/PublicVerification";');
}

// Update the initial state of \`screen\` to check the URL
newAppCode = newAppCode.replace(
  'const [screen, setScreen] = useState<Screen>("landing");',
  \`const [screen, setScreen] = useState<Screen>(() => {
    if (typeof window !== "undefined" && window.location.pathname.startsWith("/verify/")) return "verification";
    return "landing";
  });\`
);

fs.writeFileSync(appPath, newAppCode);

console.log("Success");
