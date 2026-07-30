import { useState, useEffect, useRef } from "react";
import {
  Shield,
  ChevronRight,
  ArrowRight,
  Check,
  Search,
  Bell,
  Download,
  ExternalLink,
  Copy,
  QrCode,
  LayoutDashboard,
  Users,
  Wallet,
  FileText,
  Activity,
  Settings,
  LogOut,
  Plus,
  Filter,
  ChevronDown,
  Globe,
  Lock,
  Zap,
  Eye,
  BarChart3,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Menu,
  X,
  ArrowUpRight,
  Link2,
  Hash,
  Layers,
  ArrowLeft,
  Database,
  Server,
  Network,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// ─── Types ──────────────────────────────────────────────────────────────────
type Screen = "landing" | "how-it-works" | "features" | "why-blockchain" | "dashboard" | "beneficiary" | "verification" | "explorer";
type WalletState = "disconnected" | "connecting" | "wrong-network" | "connected" | "no-metamask";
type TxState = "idle" | "pending" | "confirmed" | "failed";

// ─── Mock Data ───────────────────────────────────────────────────────────────
const PROGRAMS = [
  { id: "PRG-001", name: "Emergency Food Relief Q3", status: "active", budget: 2400000, released: 1820000, beneficiaries: 3420, created: "2024-07-01", txId: "0x4f3a...e92b" },
  { id: "PRG-002", name: "Rural Education Stipend", status: "active", budget: 890000, released: 445000, beneficiaries: 1230, created: "2024-06-15", txId: "0x7b2c...f81a" },
  { id: "PRG-003", name: "Flood Victims Housing Aid", status: "completed", budget: 5100000, released: 5100000, beneficiaries: 892, created: "2024-05-10", txId: "0x9d1e...c43f" },
  { id: "PRG-004", name: "Small Farmer Subsidy", status: "pending", budget: 1200000, released: 0, beneficiaries: 2150, created: "2024-07-20", txId: "0x2a8d...b17c" },
];

const TRANSACTIONS = [
  { id: "0x4f3ae92b1c2d5f6a7b8e9c0d1e2f3a4b", program: "Emergency Food Relief Q3", amount: 12400, recipient: "0x7f3a...b29e", time: "2 min ago", status: "confirmed", block: 18924501 },
  { id: "0x7b2cf81a3d4e5f6a7b8c9d0e1f2a3b4c", program: "Rural Education Stipend", amount: 3600, recipient: "0x2c1d...a83f", time: "14 min ago", status: "confirmed", block: 18924488 },
  { id: "0x9d1ec43f5a6b7c8d9e0f1a2b3c4d5e6f", program: "Emergency Food Relief Q3", amount: 8750, recipient: "0x5e4f...d92c", time: "1 hr ago", status: "confirmed", block: 18924321 },
  { id: "0x2a8db17c4d5e6f7a8b9c0d1e2f3a4b5c", program: "Small Farmer Subsidy", amount: 24000, recipient: "0x8b7c...e41d", time: "3 hr ago", status: "pending", block: null },
  { id: "0x1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c", program: "Flood Victims Housing Aid", amount: 57200, recipient: "0x3d2e...f50a", time: "6 hr ago", status: "failed", block: null },
];

const ACTIVITY = [
  { action: "Funds released", program: "Emergency Food Relief Q3", detail: "$12,400 to 0x7f3a...b29e", time: "2 min ago", type: "release" },
  { action: "Program created", program: "Small Farmer Subsidy", detail: "Budget: $1.2M allocated", time: "2 hr ago", type: "create" },
  { action: "Receipt confirmed", program: "Rural Education Stipend", detail: "0x2c1d...a83f confirmed", time: "5 hr ago", type: "confirm" },
  { action: "Verification request", program: "Flood Victims Housing Aid", detail: "QR scan from Lagos, NG", time: "1 day ago", type: "verify" },
];

// ─── Utilities ───────────────────────────────────────────────────────────────
const fmt = (n: number) => n >= 1000000 ? `$${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${n}`;
const pct = (a: number, b: number) => b === 0 ? 0 : Math.round((a / b) * 100);
const truncate = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

// ─── Components ──────────────────────────────────────────────────────────────

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
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function ProgressBar({ value, color = "#2BB673" }: { value: number; color?: string }) {
  return (
    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
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

function BackButton({ label = "Back", onClick }: { label?: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all group"
    >
      <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
      {label}
    </button>
  );
}

// ─── Wallet State Components ──────────────────────────────────────────────────

function WalletConnectModal({ onClose, onConnect }: { onClose: () => void; onConnect: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 border border-slate-100"
        initial={{ scale: 0.95, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 16 }}
        transition={{ type: "spring", duration: 0.35 }}
      >
        <button onClick={onClose} className="absolute top-5 right-5 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
          <X size={16} />
        </button>
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-[#102A43] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Wallet size={24} className="text-white" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-1.5">Connect your wallet</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Connect your MetaMask wallet to sign blockchain transactions and manage programs.
          </p>
        </div>
        <button
          onClick={onConnect}
          className="w-full flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:border-[#102A43] hover:bg-slate-50 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-orange-100 flex items-center justify-center text-orange-500 font-bold text-sm">
            MM
          </div>
          <div className="text-left flex-1">
            <p className="text-sm font-medium text-slate-900">MetaMask</p>
            <p className="text-xs text-slate-400">Connect using browser extension</p>
          </div>
          <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
        </button>
        <p className="text-xs text-center text-slate-400 mt-5">
          By connecting, you agree to our{" "}
          <a href="#" className="text-[#2BB673] hover:underline">Terms of Service</a>
        </p>
      </motion.div>
    </motion.div>
  );
}

function WalletButton({ walletState, address, onConnect, onDisconnect }: {
  walletState: WalletState;
  address: string;
  onConnect: () => void;
  onDisconnect: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setMenuOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (walletState === "connected") {
    return (
      <div className="relative" ref={ref}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-2.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-300 transition-all"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#2BB673] to-[#102A43] flex items-center justify-center text-white text-xs font-bold">
            {address.slice(2, 4).toUpperCase()}
          </div>
          <span className="text-sm font-medium text-slate-700 hidden sm:block">{truncate(address)}</span>
          <ChevronDown size={14} className="text-slate-400" />
        </button>
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50"
            >
              <div className="p-3 border-b border-slate-100">
                <p className="text-xs text-slate-400 mb-0.5">Connected wallet</p>
                <p className="text-sm font-medium text-slate-800 font-mono">{truncate(address)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  <span className="text-xs text-emerald-600">BOT Chain Testnet</span>
                </div>
              </div>
              <div className="p-1">
                <button className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
                  <ExternalLink size={14} className="text-slate-400" />
                  View on Explorer
                </button>
                <button className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
                  <Copy size={14} className="text-slate-400" />
                  Copy Address
                </button>
                <button
                  onClick={() => { setMenuOpen(false); onDisconnect(); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut size={14} />
                  Disconnect
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <button
      onClick={onConnect}
      className="flex items-center gap-2 px-4 py-2 bg-[#102A43] text-white text-sm font-medium rounded-xl hover:bg-[#1a3a57] transition-all"
    >
      <Wallet size={15} />
      <span>Connect Wallet</span>
    </button>
  );
}

function TxToast({ state, onClose }: { state: TxState; onClose: () => void }) {
  useEffect(() => {
    if (state === "confirmed" || state === "failed") {
      const t = setTimeout(onClose, 4000);
      return () => clearTimeout(t);
    }
  }, [state, onClose]);

  if (state === "idle") return null;

  const configs = {
    pending: { icon: <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />, text: "Transaction pending…", bg: "bg-amber-50 border-amber-200", textColor: "text-amber-800" },
    confirmed: { icon: <CheckCircle2 size={16} className="text-emerald-500" />, text: "Transaction confirmed", bg: "bg-emerald-50 border-emerald-200", textColor: "text-emerald-800" },
    failed: { icon: <XCircle size={16} className="text-red-500" />, text: "Transaction failed", bg: "bg-red-50 border-red-200", textColor: "text-red-800" },
  };
  const cfg = configs[state as keyof typeof configs];

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg ${cfg.bg}`}
    >
      {cfg.icon}
      <span className={`text-sm font-medium ${cfg.textColor}`}>{cfg.text}</span>
      <button onClick={onClose} className="ml-2 text-slate-400 hover:text-slate-600"><X size={14} /></button>
    </motion.div>
  );
}

// ─── Shared page shell ────────────────────────────────────────────────────────

function PageShell({ onBack, children }: { onBack: () => void; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-[Inter,sans-serif]">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center gap-4">
          <BackButton onClick={onBack} label="Back" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#102A43] rounded-md flex items-center justify-center">
              <Shield size={12} className="text-[#2BB673]" />
            </div>
            <span className="text-sm font-semibold text-slate-900">FundTrust</span>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}

// ─── Screen: How It Works ─────────────────────────────────────────────────────

function HowItWorksPage({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const steps = [
    {
      num: "01",
      title: "Program Created On-Chain",
      icon: FileText,
      color: "bg-[#102A43]",
      desc: "A government agency or NGO submits a fund distribution program through FundTrust. The program name, budget, beneficiary count, eligibility criteria, and start date are all encoded into a blockchain record — creating an immutable reference point that cannot be altered later.",
      detail: [
        "Program metadata stored permanently on BOT Chain",
        "Unique Program ID generated and anchored to the blockchain",
        "QR code issued for public verification from day one",
        "Transaction ID published as proof of creation",
      ],
    },
    {
      num: "02",
      title: "Budget Locked & Allocated",
      icon: Lock,
      color: "bg-[#486581]",
      desc: "Once a program is created, the approved budget is cryptographically locked. No funds can move without a signed transaction from an authorized program manager. The allocation is visible to the public in real time — showing exactly how much is set aside and for whom.",
      detail: [
        "Budget locked in a verifiable on-chain record",
        "No funds movable without multi-signature approval",
        "Allocation breakdown visible publicly",
        "Oversight bodies notified automatically",
      ],
    },
    {
      num: "03",
      title: "Funds Distributed to Beneficiaries",
      icon: ArrowUpRight,
      color: "bg-[#2BB673]",
      desc: "Program managers approve individual releases to beneficiary digital identities. Each release is a separate blockchain transaction — time-stamped, signed, and instantly verifiable. Bulk releases are supported, with every sub-transaction publicly traceable.",
      detail: [
        "Each release signed by authorized program manager",
        "Real-time timestamps recorded on the blockchain",
        "Individual and bulk distributions supported",
        "Amounts, recipients, and timing all publicly visible",
      ],
    },
    {
      num: "04",
      title: "Recipients Confirm. Citizens Verify.",
      icon: CheckCircle2,
      color: "bg-emerald-600",
      desc: "Beneficiaries confirm receipt using their digital identity wallet — adding a final cryptographic signature to close the transaction loop. Any citizen, journalist, or auditor can independently verify any step of this process by scanning a QR code or entering a Transaction ID.",
      detail: [
        "Beneficiary confirmation recorded on-chain",
        "QR scan verification requires no account or wallet",
        "Full audit trail available to any citizen",
        "Immutable record — cannot be disputed or deleted",
      ],
    },
  ];

  return (
    <PageShell onBack={() => onNavigate("landing")}>
      {/* Hero */}
      <section className="relative overflow-hidden pt-16 pb-20 px-5 sm:px-8 bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-semibold tracking-widest text-[#2BB673] uppercase mb-4">How It Works</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-[#102A43] leading-tight mb-5">
            Four steps.<br />Fully transparent.
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed max-w-xl mx-auto">
            Every aid transaction follows the same verifiable path — from creation to confirmation — recorded permanently on the blockchain.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 px-5 sm:px-8">
        <div className="max-w-4xl mx-auto flex flex-col gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row">
                <div className={`${step.color} p-8 sm:w-64 flex-shrink-0 flex flex-col justify-between`}>
                  <span className="text-6xl font-bold text-white/20 leading-none">{step.num}</span>
                  <div>
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                      <step.icon size={20} className="text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-white leading-snug">{step.title}</h2>
                  </div>
                </div>
                <div className="p-8 flex-1">
                  <p className="text-sm text-slate-600 leading-relaxed mb-6">{step.desc}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {step.detail.map(d => (
                      <div key={d} className="flex items-start gap-2.5">
                        <div className="w-4 h-4 bg-[#2BB673]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check size={9} className="text-[#2BB673]" />
                        </div>
                        <span className="text-xs text-slate-500 leading-relaxed">{d}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-5 sm:px-8 bg-[#102A43]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-3">See it live on the blockchain.</h2>
          <p className="text-slate-300 text-sm mb-8">Verify any active program right now — no account, no wallet, no sign-up required.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => onNavigate("verification")} className="flex items-center justify-center gap-2 px-6 py-3 bg-[#2BB673] text-white font-medium rounded-xl hover:bg-[#22a063] transition-all">
              Verify a Program <ArrowRight size={16} />
            </button>
            <button onClick={() => onNavigate("explorer")} className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-all border border-white/20">
              Browse Explorer <ExternalLink size={15} />
            </button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

// ─── Screen: Features ─────────────────────────────────────────────────────────

function FeaturesPage({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const features = [
    {
      icon: Shield,
      category: "Security",
      title: "Tamper-Proof Records",
      desc: "Every transaction written to the blockchain is cryptographically sealed. No government, administrator, or hacker can edit or delete a record once it's confirmed — the math makes it impossible.",
      tags: ["Immutable ledger", "SHA-256 hashing", "Consensus verified"],
    },
    {
      icon: Eye,
      category: "Transparency",
      title: "Public Verification",
      desc: "Any citizen can verify fund distribution using a QR code — no account, wallet, or technical knowledge required. Point. Scan. Confirm. It takes under 10 seconds.",
      tags: ["QR code access", "No login required", "Works on any device"],
    },
    {
      icon: Zap,
      category: "Speed",
      title: "Instant Releases",
      desc: "Funds are released to beneficiaries the moment a program manager signs the transaction. No bank processing delays, no manual wire transfers, no bureaucratic queues.",
      tags: ["< 3 second finality", "No manual processing", "Real-time notification"],
    },
    {
      icon: Globe,
      category: "Accessibility",
      title: "Universal Access",
      desc: "FundTrust is designed for communities with limited digital infrastructure. It works on low-end smartphones, slow connections, and supports multiple languages. No smartphone? A printed QR code works too.",
      tags: ["Mobile-first", "Low-bandwidth mode", "Offline QR verification"],
    },
    {
      icon: Lock,
      category: "Authorization",
      title: "Cryptographic Authorization",
      desc: "Only verified program managers can approve fund releases — enforced by digital signatures, not passwords. Each action requires a private key that cannot be forged, shared, or guessed.",
      tags: ["MetaMask signing", "Role-based access", "Non-custodial"],
    },
    {
      icon: BarChart3,
      category: "Oversight",
      title: "Real-Time Audit Trail",
      desc: "Every action — creation, allocation, release, confirmation — appears instantly on the public audit trail. Oversight bodies, journalists, and citizens see the same data at the same time.",
      tags: ["Live transaction feed", "Exportable CSV", "Open explorer API"],
    },
    {
      icon: QrCode,
      category: "Distribution",
      title: "QR-Based Verification",
      desc: "Each program generates a unique QR code that links directly to its blockchain record. Print it. Share it. Post it in communities. Any scan reveals the complete, unalterable distribution history.",
      tags: ["Unique per program", "Printable", "Shareable link"],
    },
    {
      icon: Users,
      category: "Identity",
      title: "Digital Identity Wallets",
      desc: "Beneficiaries are registered by their digital identity — a secure wallet address that acts as their unique identifier. No national ID needed. No paperwork. Just a cryptographic proof.",
      tags: ["Pseudonymous", "Self-sovereign", "Portable"],
    },
    {
      icon: Activity,
      category: "Monitoring",
      title: "Live Program Dashboard",
      desc: "Program managers get a real-time overview of every active program — budget utilization, release history, beneficiary confirmation rates, and verification requests — all in one place.",
      tags: ["Real-time updates", "Export reports", "Multi-program view"],
    },
  ];

  const categories = ["All", "Security", "Transparency", "Speed", "Accessibility", "Authorization", "Oversight", "Distribution", "Identity", "Monitoring"];
  const [active, setActive] = useState("All");

  const shown = active === "All" ? features : features.filter(f => f.category === active);

  return (
    <PageShell onBack={() => onNavigate("landing")}>
      <section className="relative pt-16 pb-20 px-5 sm:px-8 bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-semibold tracking-widest text-[#2BB673] uppercase mb-4">Features</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-[#102A43] leading-tight mb-5">
            Built for public trust.<br />Designed for everyone.
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed max-w-xl mx-auto">
            Every feature in FundTrust exists to make public fund distribution more transparent, more accessible, and more accountable.
          </p>
        </div>
      </section>

      {/* Filter tabs */}
      <div className="sticky top-16 bg-[#F8FAFC]/95 backdrop-blur-md border-b border-slate-200 z-10">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-3 flex gap-2 overflow-x-auto scrollbar-none">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                active === c ? "bg-[#102A43] text-white" : "bg-white border border-slate-200 text-slate-500 hover:border-slate-300"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <section className="py-12 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {shown.map((f, i) => (
              <motion.div
                key={f.title}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-[#102A43]/20 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-[#102A43]/6 rounded-xl flex items-center justify-center group-hover:bg-[#102A43] transition-colors">
                    <f.icon size={18} className="text-[#102A43] group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-xs font-medium text-slate-400 px-2 py-1 bg-slate-50 rounded-full">{f.category}</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">{f.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {f.tags.map(t => (
                    <span key={t} className="text-xs text-[#486581] bg-[#486581]/8 px-2 py-0.5 rounded-full">{t}</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      <section className="py-16 px-5 sm:px-8 bg-white border-t border-slate-200">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-[#102A43] mb-3">Ready to see it in action?</h2>
          <p className="text-slate-500 text-sm mb-8">Launch the app or verify a real program on the blockchain right now.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => onNavigate("dashboard")} className="flex items-center justify-center gap-2 px-6 py-3 bg-[#102A43] text-white font-medium rounded-xl hover:bg-[#1a3a57] transition-all">
              Launch App <ArrowRight size={16} />
            </button>
            <button onClick={() => onNavigate("verification")} className="flex items-center justify-center gap-2 px-6 py-3 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-all">
              Verify a Program <ExternalLink size={15} />
            </button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

// ─── Screen: Why Blockchain ───────────────────────────────────────────────────

function WhyBlockchainPage({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const pillars = [
    {
      icon: Database,
      title: "Immutability",
      subtitle: "Records that cannot be changed",
      color: "bg-[#102A43]",
      body: "Once a transaction is confirmed on the blockchain, it is mathematically impossible to alter. No government official, system administrator, or bad actor can edit, hide, or delete it. This is not a policy — it is an architectural guarantee baked into the mathematics of cryptography.",
      contrast: "Traditional systems: Database admins can edit records. Audit logs can be cleared. Files can be deleted.",
      blockchain: "Blockchain: Every write is signed, hashed, and chained. Changing one character would invalidate every subsequent block.",
    },
    {
      icon: Network,
      title: "Decentralization",
      subtitle: "No single point of failure or control",
      color: "bg-[#486581]",
      body: "FundTrust runs on BOT Chain — a distributed network of independent nodes around the world. There is no central server to hack, no single database to corrupt, no single authority that can shut it down. If one node goes offline, thousands of others continue the record.",
      contrast: "Traditional systems: Central servers are targets. Government portals go down. Backups get corrupted.",
      blockchain: "Blockchain: 10,000+ independent nodes. No single point of control. 99.99% uptime by design.",
    },
    {
      icon: Eye,
      title: "Transparency",
      subtitle: "Public by default, private where needed",
      color: "bg-[#2BB673]",
      body: "Every fund movement on FundTrust is publicly visible — not just to auditors with special access, but to any citizen with an internet connection. This radical transparency creates accountability without bureaucracy. Anyone can verify. Anyone can report. No insider access needed.",
      contrast: "Traditional systems: Reports are released months later. Freedom of information requests take years.",
      blockchain: "Blockchain: Every transaction visible in real time. Any citizen can audit any program from their phone.",
    },
    {
      icon: Lock,
      title: "Cryptographic Authorization",
      subtitle: "Math replaces trust in institutions",
      color: "bg-emerald-600",
      body: "Authorization in FundTrust is enforced by cryptographic keys — not by policies, seniority, or goodwill. Only a wallet holding the correct private key can sign a release transaction. This cannot be faked, delegated improperly, or bypassed by social engineering.",
      contrast: "Traditional systems: Authorization relies on passwords, roles, and human compliance.",
      blockchain: "Blockchain: Authorization is a mathematical proof. No key, no action. No exceptions.",
    },
  ];

  const [active, setActive] = useState(0);

  return (
    <PageShell onBack={() => onNavigate("landing")}>
      <section className="pt-16 pb-20 px-5 sm:px-8 bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-semibold tracking-widest text-[#2BB673] uppercase mb-4">Why Blockchain</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-[#102A43] leading-tight mb-5">
            Accountability that<br />can't be switched off.
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed max-w-xl mx-auto">
            Traditional aid systems rely on trust in institutions. FundTrust relies on mathematics.
            Here's why that distinction matters.
          </p>
        </div>
      </section>

      {/* Core quote */}
      <section className="py-16 px-5 sm:px-8 bg-[#102A43]">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-3xl sm:text-4xl font-bold text-white leading-snug mb-6">
            "Don't trust us.<br />
            <span className="text-[#2BB673]">Verify it yourself."</span>
          </p>
          <p className="text-slate-300 text-base max-w-lg mx-auto leading-relaxed">
            This isn't a marketing slogan. It's a technical guarantee. FundTrust is designed so that you never have to take anyone's word for anything. Every claim is a proof. Every record is verifiable.
          </p>
        </div>
      </section>

      {/* Four pillars — tabbed */}
      <section className="py-16 px-5 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-[#102A43] mb-8 text-center">The four pillars of blockchain accountability</h2>
          <div className="flex flex-col lg:flex-row gap-5">
            {/* Tab list */}
            <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible lg:w-56 flex-shrink-0">
              {pillars.map((p, i) => (
                <button
                  key={p.title}
                  onClick={() => setActive(i)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left whitespace-nowrap lg:whitespace-normal transition-all ${
                    active === i ? `${p.color} text-white shadow-lg` : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <p.icon size={16} className={active === i ? "text-white" : "text-slate-400"} />
                  {p.title}
                </button>
              ))}
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
                className="flex-1 bg-white rounded-2xl border border-slate-200 overflow-hidden"
              >
                <div className={`${pillars[active].color} px-8 py-6`}>
                  <p className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-1">{pillars[active].subtitle}</p>
                  <h3 className="text-2xl font-bold text-white">{pillars[active].title}</h3>
                </div>
                <div className="p-8">
                  <p className="text-sm text-slate-600 leading-relaxed mb-8">{pillars[active].body}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                      <p className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                        <XCircle size={12} /> Traditional Systems
                      </p>
                      <p className="text-xs text-slate-600 leading-relaxed">{pillars[active].contrast}</p>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                      <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                        <CheckCircle2 size={12} /> With Blockchain
                      </p>
                      <p className="text-xs text-slate-600 leading-relaxed">{pillars[active].blockchain}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="py-16 px-5 sm:px-8 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-[#102A43] mb-8 text-center">Traditional vs. Blockchain Aid Systems</h2>
          <div className="bg-[#F8FAFC] rounded-2xl border border-slate-200 overflow-hidden">
            <div className="grid grid-cols-3 border-b border-slate-200">
              <div className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">Capability</div>
              <div className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wide border-l border-slate-200">Traditional</div>
              <div className="p-4 text-xs font-semibold text-[#2BB673] uppercase tracking-wide border-l border-slate-200">FundTrust</div>
            </div>
            {[
              ["Audit access", "Restricted to officials", "Open to every citizen"],
              ["Record modification", "Possible by admins", "Mathematically impossible"],
              ["Verification time", "Weeks via FOIA", "Seconds via QR scan"],
              ["Downtime risk", "Server outages possible", "Decentralized — always on"],
              ["Fraud detection", "Post-hoc internal audit", "Real-time public visibility"],
              ["Beneficiary proof", "Paper receipts", "Cryptographic on-chain signature"],
            ].map(([cap, trad, block], i) => (
              <div key={cap} className={`grid grid-cols-3 border-b border-slate-200 last:border-0 ${i % 2 === 0 ? "bg-white" : ""}`}>
                <div className="p-4 text-sm font-medium text-slate-700">{cap}</div>
                <div className="p-4 text-sm text-slate-500 border-l border-slate-200 flex items-center gap-2">
                  <XCircle size={13} className="text-red-400 flex-shrink-0" /> {trad}
                </div>
                <div className="p-4 text-sm text-slate-700 border-l border-slate-200 flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-[#2BB673] flex-shrink-0" /> {block}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-5 sm:px-8 bg-[#102A43]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Ready to verify the math?</h2>
          <p className="text-slate-300 text-sm mb-8">Every claim on this page is backed by a live blockchain record. See for yourself.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => onNavigate("verification")} className="flex items-center justify-center gap-2 px-6 py-3 bg-[#2BB673] text-white font-medium rounded-xl hover:bg-[#22a063] transition-all">
              Verify a Program <ArrowRight size={16} />
            </button>
            <button onClick={() => onNavigate("explorer")} className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-all border border-white/20">
              Browse Explorer <ExternalLink size={15} />
            </button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

// ─── Screen: Landing Page ─────────────────────────────────────────────────────

function LandingPage({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    { icon: Shield, title: "Tamper-Proof Records", desc: "Every transaction is recorded on the blockchain and cannot be modified or deleted by anyone." },
    { icon: Eye, title: "Public Verification", desc: "Any citizen can verify fund distribution using a QR code — no account or wallet required." },
    { icon: Zap, title: "Instant Releases", desc: "Funds reach beneficiaries immediately upon approval. No manual processing, no delays." },
    { icon: Globe, title: "Universal Access", desc: "Works on any device. Designed for communities with limited digital infrastructure." },
    { icon: Lock, title: "Cryptographic Proof", desc: "Digital signatures ensure only authorized program managers can approve distributions." },
    { icon: BarChart3, title: "Real-Time Audit Trail", desc: "Live dashboard gives oversight bodies instant visibility into every allocation." },
  ];

  const steps = [
    { num: "01", title: "Program Created", desc: "A government agency creates a fund distribution program with budget, criteria, and beneficiary list — recorded on the blockchain." },
    { num: "02", title: "Funds Allocated", desc: "Budget is locked into a blockchain record. No funds can be moved without a verifiable transaction." },
    { num: "03", title: "Distribution Released", desc: "Program managers approve releases. Each transaction is time-stamped and publicly recorded instantly." },
    { num: "04", title: "Receipt Confirmed", desc: "Beneficiaries confirm receipt via their digital identity. Citizens verify by scanning a QR code." },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-[Inter,sans-serif]">
      {/* Nav */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#102A43] rounded-lg flex items-center justify-center">
              <Shield size={16} className="text-[#2BB673]" />
            </div>
            <span className="text-base font-semibold text-slate-900">FundTrust</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            {[
              { label: "How It Works", screen: "how-it-works" as Screen },
              { label: "Features", screen: "features" as Screen },
              { label: "Why Blockchain", screen: "why-blockchain" as Screen },
            ].map(l => (
              <button key={l.label} onClick={() => onNavigate(l.screen)} className="text-sm text-slate-500 hover:text-slate-900 transition-colors">{l.label}</button>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate("verification")} className="hidden sm:block text-sm text-slate-500 hover:text-slate-900 transition-colors">
              Verify a Program
            </button>
            <button
              onClick={() => onNavigate("dashboard")}
              className="px-4 py-2 bg-[#102A43] text-white text-sm font-medium rounded-xl hover:bg-[#1a3a57] transition-all"
            >
              Launch App
            </button>
            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-slate-200 bg-white overflow-hidden"
            >
              <div className="px-5 py-4 flex flex-col gap-3">
                {[
                  { label: "How It Works", screen: "how-it-works" as Screen },
                  { label: "Features", screen: "features" as Screen },
                  { label: "Why Blockchain", screen: "why-blockchain" as Screen },
                ].map(l => (
                  <button key={l.label} onClick={() => { onNavigate(l.screen); setMobileMenuOpen(false); }} className="text-sm text-left text-slate-600 py-1">{l.label}</button>
                ))}
                <button onClick={() => onNavigate("verification")} className="text-sm text-left text-slate-600 py-1">Verify a Program</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-28 px-5 sm:px-8">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#102A43]/8 to-[#2BB673]/5 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#2BB673]/6 to-[#102A43]/4 blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#102A43]/6 border border-[#102A43]/12 rounded-full text-xs font-medium text-[#102A43] mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2BB673] inline-block" />
              Powered by BOT Chain — Built for Citizens
            </div>
            <h1 className="text-[3.25rem] sm:text-[4.5rem] font-bold text-[#102A43] leading-[1.07] tracking-tight mb-6">
              Transparent Public<br />
              <span className="text-[#2BB673]">Fund Distribution</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed mb-3">
              Verify every aid transaction directly on the blockchain with a single QR scan.
              No middlemen. No hidden ledgers. No trust required.
            </p>
            <p className="text-sm font-mono text-slate-400 tracking-wider mb-10">
              "Don't trust us. Verify it yourself."
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => onNavigate("dashboard")}
                className="flex items-center gap-2 px-6 py-3.5 bg-[#102A43] text-white font-medium rounded-xl hover:bg-[#1a3a57] transition-all shadow-lg shadow-[#102A43]/20 w-full sm:w-auto justify-center"
              >
                Launch App <ArrowRight size={16} />
              </button>
              <button
                onClick={() => onNavigate("verification")}
                className="flex items-center gap-2 px-6 py-3.5 bg-white text-slate-700 font-medium rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all w-full sm:w-auto justify-center"
              >
                Verify a Program <ExternalLink size={15} />
              </button>
            </div>
          </motion.div>

          {/* Stats strip */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-16 grid grid-cols-3 gap-6 max-w-2xl mx-auto"
          >
            {[
              { val: "$24.8M", label: "Funds Distributed" },
              { val: "47,200", label: "Verified Recipients" },
              { val: "100%", label: "Publicly Auditable" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-[#102A43]">{s.val}</p>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-5 sm:px-8 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold tracking-widest text-[#2BB673] uppercase mb-3">How It Works</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#102A43]">Four steps. Fully transparent.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative p-6 bg-[#F8FAFC] rounded-2xl border border-slate-200"
              >
                <span className="text-4xl font-bold text-slate-200 block mb-4">{s.num}</span>
                <h3 className="text-base font-semibold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
                {i < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ChevronRight size={16} className="text-slate-300" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold tracking-widest text-[#2BB673] uppercase mb-3">Features</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#102A43]">Built for public trust.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="p-6 bg-white rounded-2xl border border-slate-200 hover:border-[#102A43]/20 hover:shadow-lg transition-all group"
              >
                <div className="w-10 h-10 bg-[#102A43]/6 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#102A43] transition-colors">
                  <f.icon size={18} className="text-[#102A43] group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Blockchain */}
      <section className="py-24 px-5 sm:px-8 bg-[#102A43]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs font-semibold tracking-widest text-[#2BB673] uppercase mb-4">Why Blockchain</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 leading-tight">
              Accountability that can't be switched off.
            </h2>
            <p className="text-slate-300 leading-relaxed mb-8">
              Traditional aid systems rely on trust in institutions. FundTrust relies on mathematics.
              Every transaction is cryptographically signed, time-stamped, and permanently recorded —
              accessible to any citizen with an internet connection.
            </p>
            <div className="flex flex-col gap-4">
              {[
                "Every record is permanent — no editing, no deletion",
                "Transactions verified by thousands of independent nodes",
                "Open-source code, publicly auditable smart contracts",
                "Works even when institutions are compromised",
              ].map(pt => (
                <div key={pt} className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-[#2BB673]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check size={11} className="text-[#2BB673]" />
                  </div>
                  <span className="text-sm text-slate-300">{pt}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[#1a3a57] rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-slate-400">Live Blockchain Record</span>
              <span className="flex items-center gap-1.5 text-xs text-[#2BB673]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2BB673] animate-pulse" />
                Block #18,924,501
              </span>
            </div>
            {TRANSACTIONS.slice(0, 3).map(tx => (
              <div key={tx.id} className="flex items-center justify-between py-3 border-b border-white/8 last:border-0">
                <div>
                  <p className="text-xs font-mono text-slate-300">{tx.id.slice(0, 18)}…</p>
                  <p className="text-xs text-slate-500 mt-0.5">{tx.program.slice(0, 24)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">${tx.amount.toLocaleString()}</p>
                  <StatusBadge status={tx.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-5 sm:px-8 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#102A43] mb-4">
            Ready to verify?
          </h2>
          <p className="text-slate-500 mb-8">
            No account needed. Scan any FundTrust QR code or enter a Transaction ID to verify a distribution instantly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => onNavigate("verification")}
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#2BB673] text-white font-medium rounded-xl hover:bg-[#22a063] transition-all shadow-lg shadow-[#2BB673]/20"
            >
              Verify a Program <ArrowRight size={16} />
            </button>
            <button
              onClick={() => onNavigate("dashboard")}
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#102A43] text-white font-medium rounded-xl hover:bg-[#1a3a57] transition-all"
            >
              Launch App <ArrowUpRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#102A43] rounded-lg flex items-center justify-center">
              <Shield size={13} className="text-[#2BB673]" />
            </div>
            <span className="text-sm font-semibold text-slate-700">FundTrust</span>
          </div>
          <p className="text-xs text-slate-400">
            Built on BOT Chain · Open Source · All transactions publicly verifiable
          </p>
          <div className="flex items-center gap-4">
            {["Privacy", "Terms", "Docs", "GitHub"].map(l => (
              <a key={l} href="#" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Screen: Program Manager Dashboard ───────────────────────────────────────

function Dashboard({ walletState, walletAddress, onConnect, onDisconnect, onBack }: {
  walletState: WalletState;
  walletAddress: string;
  onConnect: () => void;
  onDisconnect: () => void;
  onBack: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"overview" | "programs" | "transactions" | "activity">("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showQR, setShowQR] = useState<string | null>(null);

  const filteredPrograms = PROGRAMS.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const stats = [
    { label: "Total Programs", value: "4", sub: "+1 this month", icon: Layers, color: "bg-[#102A43]" },
    { label: "Beneficiaries", value: "7,692", sub: "Across all programs", icon: Users, color: "bg-[#486581]" },
    { label: "Funds Released", value: "$8.4M", sub: "of $9.6M total", icon: BarChart3, color: "bg-[#2BB673]" },
    { label: "Pending Verifications", value: "142", sub: "Last 24 hours", icon: Clock, color: "bg-amber-500" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-[Inter,sans-serif]">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-slate-200 fixed h-full z-30">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <button onClick={onBack} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 mr-1"><ArrowLeft size={15} /></button>
            <div className="w-8 h-8 bg-[#102A43] rounded-lg flex items-center justify-center">
              <Shield size={15} className="text-[#2BB673]" />
            </div>
            <span className="text-sm font-semibold text-slate-900">FundTrust</span>
          </div>
        </div>
        <nav className="flex-1 p-3 flex flex-col gap-1">
          {[
            { icon: LayoutDashboard, label: "Overview", tab: "overview" },
            { icon: FileText, label: "Programs", tab: "programs" },
            { icon: Activity, label: "Transactions", tab: "transactions" },
            { icon: Bell, label: "Activity", tab: "activity" },
          ].map(item => (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab as typeof activeTab)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                activeTab === item.tab
                  ? "bg-[#102A43] text-white font-medium"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-100">
          <button className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all">
            <Settings size={16} />
            Settings
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 lg:ml-60">
        {/* Topbar */}
        <header className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-200 z-20">
          <div className="px-5 sm:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={onBack} className="lg:hidden p-1.5 rounded-xl hover:bg-slate-100 text-slate-400"><ArrowLeft size={16} /></button>
              <div>
                <h1 className="text-base font-semibold text-slate-900 capitalize">
                  {activeTab === "overview" ? "Dashboard" : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </h1>
                <p className="text-xs text-slate-400 hidden sm:block">Program Manager · BOT Chain Testnet</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 relative">
                <Bell size={17} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <WalletButton walletState={walletState} address={walletAddress} onConnect={onConnect} onDisconnect={onDisconnect} />
            </div>
          </div>
        </header>

        <main className="p-5 sm:p-8 max-w-7xl">
          {/* Mobile nav tabs */}
          <div className="flex lg:hidden overflow-x-auto gap-2 mb-6 pb-1">
            {[
              { icon: LayoutDashboard, label: "Overview", tab: "overview" },
              { icon: FileText, label: "Programs", tab: "programs" },
              { icon: Activity, label: "Transactions", tab: "transactions" },
              { icon: Bell, label: "Activity", tab: "activity" },
            ].map(item => (
              <button
                key={item.tab}
                onClick={() => setActiveTab(item.tab as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === item.tab
                    ? "bg-[#102A43] text-white"
                    : "bg-white border border-slate-200 text-slate-500"
                }`}
              >
                <item.icon size={14} />
                {item.label}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="bg-white rounded-2xl border border-slate-200 p-5"
                  >
                    <div className={`w-9 h-9 ${s.color} rounded-xl flex items-center justify-center mb-3`}>
                      <s.icon size={16} className="text-white" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
                    <p className="text-xs text-[#2BB673] mt-2 font-medium">{s.sub}</p>
                  </motion.div>
                ))}
              </div>

              {/* Programs + Activity */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                {/* Programs */}
                <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between p-5 border-b border-slate-100">
                    <h2 className="text-sm font-semibold text-slate-900">Active Programs</h2>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#102A43] text-white text-xs font-medium rounded-lg hover:bg-[#1a3a57] transition-all"
                    >
                      <Plus size={13} />
                      New Program
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {PROGRAMS.slice(0, 3).map(p => (
                      <div key={p.id} className="flex items-start gap-4 p-4 hover:bg-slate-50/50 transition-colors">
                        <div className="w-9 h-9 bg-[#102A43]/6 rounded-xl flex items-center justify-center flex-shrink-0">
                          <FileText size={15} className="text-[#102A43]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="text-sm font-medium text-slate-900 truncate">{p.name}</p>
                            <StatusBadge status={p.status} />
                          </div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-xs text-slate-400">{fmt(p.released)} of {fmt(p.budget)}</span>
                            <span className="text-xs text-slate-400">·</span>
                            <span className="text-xs text-slate-400">{p.beneficiaries.toLocaleString()} recipients</span>
                          </div>
                          <ProgressBar value={pct(p.released, p.budget)} />
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => setShowQR(p.id)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                            <QrCode size={14} />
                          </button>
                          <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                            <ExternalLink size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-slate-100">
                    <button onClick={() => setActiveTab("programs")} className="text-xs text-[#2BB673] font-medium hover:underline flex items-center gap-1">
                      View all programs <ChevronRight size={12} />
                    </button>
                  </div>
                </div>

                {/* Activity */}
                <div className="bg-white rounded-2xl border border-slate-200">
                  <div className="p-5 border-b border-slate-100">
                    <h2 className="text-sm font-semibold text-slate-900">Recent Activity</h2>
                  </div>
                  <div className="p-3 flex flex-col gap-1">
                    {ACTIVITY.map((a, i) => {
                      const colors: Record<string, string> = { release: "bg-[#2BB673]/10 text-[#2BB673]", create: "bg-[#102A43]/10 text-[#102A43]", confirm: "bg-emerald-100 text-emerald-600", verify: "bg-amber-100 text-amber-600" };
                      return (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${colors[a.type]}`}>
                            {a.type === "release" && <ArrowUpRight size={13} />}
                            {a.type === "create" && <Plus size={13} />}
                            {a.type === "confirm" && <CheckCircle2 size={13} />}
                            {a.type === "verify" && <Eye size={13} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-slate-800">{a.action}</p>
                            <p className="text-xs text-slate-400 truncate">{a.detail}</p>
                          </div>
                          <span className="text-xs text-slate-300 whitespace-nowrap">{a.time}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Programs Tab */}
          {activeTab === "programs" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search programs…"
                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#102A43] focus:ring-1 focus:ring-[#102A43]/20 transition-all"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value)}
                      className="appearance-none pl-3 pr-8 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none cursor-pointer"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="pending">Pending</option>
                    </select>
                    <Filter size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-[#102A43] text-white text-sm font-medium rounded-xl hover:bg-[#1a3a57] transition-all whitespace-nowrap"
                  >
                    <Plus size={14} />
                    New Program
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="hidden md:grid grid-cols-[1.5fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-slate-100 text-xs font-medium text-slate-400 uppercase tracking-wide">
                  <span>Program</span>
                  <span>Budget</span>
                  <span>Progress</span>
                  <span>Status</span>
                  <span>Actions</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {filteredPrograms.map(p => (
                    <div key={p.id} className="flex flex-col md:grid md:grid-cols-[1.5fr_1fr_1fr_1fr_auto] gap-2 md:gap-4 md:items-center px-5 py-4 hover:bg-slate-50/50 transition-colors">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{p.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-slate-400 font-mono">{p.id}</span>
                          <span className="text-xs text-slate-300">·</span>
                          <span className="text-xs text-slate-400">{p.beneficiaries.toLocaleString()} recipients</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{fmt(p.budget)}</p>
                        <p className="text-xs text-slate-400">{fmt(p.released)} released</p>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <ProgressBar value={pct(p.released, p.budget)} />
                        <span className="text-xs text-slate-400">{pct(p.released, p.budget)}% complete</span>
                      </div>
                      <StatusBadge status={p.status} />
                      <div className="flex gap-1">
                        <button onClick={() => setShowQR(p.id)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors" title="Generate QR">
                          <QrCode size={15} />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors" title="View on Explorer">
                          <ExternalLink size={15} />
                        </button>
                        <CopyButton text={p.txId} />
                      </div>
                    </div>
                  ))}
                  {filteredPrograms.length === 0 && (
                    <div className="py-16 text-center text-slate-400">
                      <Search size={32} className="mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No programs match your search</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Transactions Tab */}
          {activeTab === "transactions" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">All Transactions</h2>
                <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-600 hover:bg-slate-50 transition-all">
                  <Download size={13} />
                  Export CSV
                </button>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-slate-100 text-xs font-medium text-slate-400 uppercase tracking-wide">
                  <span>Transaction ID</span>
                  <span>Program</span>
                  <span>Amount</span>
                  <span>Status</span>
                  <span>Block</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {TRANSACTIONS.map(tx => (
                    <div key={tx.id} className="flex flex-col md:grid md:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-2 md:gap-4 md:items-center px-5 py-4 hover:bg-slate-50/50 transition-colors">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-mono text-slate-700">{tx.id.slice(0, 20)}…</span>
                          <CopyButton text={tx.id} />
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{tx.time} · {tx.recipient}</p>
                      </div>
                      <p className="text-xs text-slate-600 truncate">{tx.program.slice(0, 22)}…</p>
                      <p className="text-sm font-medium text-slate-800">${tx.amount.toLocaleString()}</p>
                      <StatusBadge status={tx.status} />
                      <span className="text-xs text-slate-400 font-mono">{tx.block ? `#${tx.block.toLocaleString()}` : "–"}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Activity Tab */}
          {activeTab === "activity" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-900">Activity Feed</h2>
              <div className="space-y-3">
                {[...ACTIVITY, ...ACTIVITY].map((a, i) => {
                  const colors: Record<string, string> = { release: "bg-[#2BB673]/10 text-[#2BB673]", create: "bg-[#102A43]/10 text-[#102A43]", confirm: "bg-emerald-100 text-emerald-600", verify: "bg-amber-100 text-amber-600" };
                  return (
                    <div key={i} className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-all">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[a.type]}`}>
                        {a.type === "release" && <ArrowUpRight size={16} />}
                        {a.type === "create" && <Plus size={16} />}
                        {a.type === "confirm" && <CheckCircle2 size={16} />}
                        {a.type === "verify" && <Eye size={16} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-slate-800">{a.action}</p>
                          <span className="text-xs text-slate-400">{a.time}</span>
                        </div>
                        <p className="text-sm text-[#2BB673] font-medium">{a.program}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{a.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </main>
      </div>

      {/* Create Program Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
            <motion.div
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-100 overflow-hidden"
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Create New Program</h2>
                  <p className="text-xs text-slate-400 mt-0.5">This will create an on-chain blockchain record</p>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X size={16} /></button>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { label: "Program Name", placeholder: "e.g. Emergency Food Relief Q4", type: "text" },
                  { label: "Total Budget (USD)", placeholder: "e.g. 2,400,000", type: "number" },
                  { label: "Number of Beneficiaries", placeholder: "e.g. 3,420", type: "number" },
                  { label: "Program Start Date", placeholder: "", type: "date" },
                ].map(field => (
                  <div key={field.label}>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">{field.label}</label>
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#102A43] focus:ring-1 focus:ring-[#102A43]/20 transition-all"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Describe the program objective and eligibility criteria…"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#102A43] resize-none"
                  />
                </div>
              </div>
              <div className="px-6 pb-6 flex gap-3">
                <button onClick={() => setShowCreateModal(false)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-all">
                  Cancel
                </button>
                <button onClick={() => setShowCreateModal(false)} className="flex-1 py-2.5 bg-[#102A43] text-white text-sm font-medium rounded-xl hover:bg-[#1a3a57] transition-all flex items-center justify-center gap-2">
                  <Lock size={14} />
                  Sign & Deploy
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Modal */}
      <AnimatePresence>
        {showQR && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowQR(null)} />
            <motion.div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center border border-slate-100" initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}>
              <button onClick={() => setShowQR(null)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X size={16} /></button>
              <div className="w-48 h-48 mx-auto bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center mb-5">
                <div className="grid grid-cols-5 gap-0.5 p-3 opacity-60">
                  {Array.from({ length: 25 }, (_, i) => (
                    <div key={i} className={`w-full aspect-square rounded-sm ${Math.random() > 0.5 ? "bg-[#102A43]" : "bg-transparent"}`} />
                  ))}
                </div>
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-1">Verification QR Code</h3>
              <p className="text-xs text-slate-400 mb-5">Program <span className="font-mono">{showQR}</span></p>
              <p className="text-xs text-slate-500 mb-5">Scan this QR code to instantly verify fund distribution for this program on any device — no account required.</p>
              <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#102A43] text-white text-sm font-medium rounded-xl hover:bg-[#1a3a57] transition-all">
                <Download size={15} />
                Download QR Code
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Screen: Beneficiary Portal ───────────────────────────────────────────────

function BeneficiaryPortal({ walletState, walletAddress, onConnect, onDisconnect, onBack }: {
  walletState: WalletState;
  walletAddress: string;
  onConnect: () => void;
  onDisconnect: () => void;
  onBack: () => void;
}) {
  const [txState, setTxState] = useState<TxState>("idle");

  const handleConfirm = () => {
    setTxState("pending");
    setTimeout(() => setTxState("confirmed"), 3000);
    setTimeout(() => setTxState("idle"), 7000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-[Inter,sans-serif]">
      <AnimatePresence>
        <TxToast state={txState} onClose={() => setTxState("idle")} />
      </AnimatePresence>

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400"><ArrowLeft size={16} /></button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#102A43] rounded-lg flex items-center justify-center">
                <Shield size={13} className="text-[#2BB673]" />
              </div>
              <span className="text-sm font-semibold text-slate-900">FundTrust</span>
            </div>
          </div>
          <WalletButton walletState={walletState} address={walletAddress} onConnect={onConnect} onDisconnect={onDisconnect} />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-10 space-y-6">
        {/* Wallet Status */}
        {walletState !== "connected" ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-200 p-8 text-center"
          >
            <div className="w-16 h-16 bg-[#102A43]/6 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Wallet size={28} className="text-[#102A43]" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Connect your digital identity</h2>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6 leading-relaxed">
              Connect your MetaMask wallet to view your eligible programs and confirm receipt of funds.
            </p>
            <button onClick={onConnect} className="flex items-center justify-center gap-2 px-6 py-3 bg-[#102A43] text-white font-medium rounded-xl hover:bg-[#1a3a57] transition-all mx-auto">
              <Wallet size={16} />
              Connect Wallet
            </button>
            <p className="text-xs text-slate-400 mt-4">
              Public verification doesn't require a wallet.{" "}
              <a href="#" className="text-[#2BB673] hover:underline">Learn more</a>
            </p>
          </motion.div>
        ) : (
          <>
            {/* Connected Status */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-[#102A43] rounded-2xl p-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-300 mb-1">Connected digital identity</p>
                  <p className="font-mono text-sm text-white">{truncate(walletAddress)}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="w-1.5 h-1.5 bg-[#2BB673] rounded-full animate-pulse" />
                    <span className="text-xs text-[#2BB673]">Verified · BOT Chain Testnet</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2BB673] to-[#486581] flex items-center justify-center text-white font-bold text-lg">
                  {walletAddress.slice(2, 4).toUpperCase()}
                </div>
              </div>
            </motion.div>

            {/* Eligible Programs */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h2 className="text-sm font-semibold text-slate-900">Your Eligible Programs</h2>
                <p className="text-xs text-slate-400 mt-0.5">Programs you are registered to receive aid from</p>
              </div>
              <div className="divide-y divide-slate-100">
                {PROGRAMS.slice(0, 2).map((p, i) => (
                  <div key={p.id} className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{p.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{p.id} · {p.beneficiaries.toLocaleString()} participants</p>
                      </div>
                      <StatusBadge status={i === 0 ? "active" : "pending"} />
                    </div>
                    <div className="flex items-center gap-4 mb-3">
                      <div>
                        <p className="text-xs text-slate-400">Your allocation</p>
                        <p className="text-base font-semibold text-slate-900">$3,600</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Expected release</p>
                        <p className="text-sm font-medium text-slate-700">Aug 15, 2024</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Receipt status</p>
                        <p className="text-sm font-medium text-[#2BB673]">{i === 0 ? "Ready to confirm" : "Pending release"}</p>
                      </div>
                    </div>
                    {i === 0 && (
                      <button
                        onClick={handleConfirm}
                        disabled={txState === "pending"}
                        className="w-full py-2.5 bg-[#2BB673] text-white text-sm font-medium rounded-xl hover:bg-[#22a063] disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                      >
                        {txState === "pending" ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            Confirming on blockchain…
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={16} />
                            Confirm Receipt
                          </>
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Timeline */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl border border-slate-200 p-5">
              <h2 className="text-sm font-semibold text-slate-900 mb-5">Distribution Timeline</h2>
              <div className="flex flex-col gap-0">
                {[
                  { label: "Program Created", date: "Jul 1, 2024", done: true, desc: "Emergency Food Relief Q3 created" },
                  { label: "Funds Allocated", date: "Jul 3, 2024", done: true, desc: "$2.4M locked on blockchain" },
                  { label: "Funds Released", date: "Aug 5, 2024", done: true, desc: "$1.82M distributed to recipients" },
                  { label: "Receipt Confirmed", date: "Pending", done: false, desc: "Awaiting your confirmation" },
                ].map((step, i) => (
                  <div key={step.label} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${step.done ? "bg-[#2BB673] border-[#2BB673]" : "bg-white border-slate-300"}`}>
                        {step.done ? <Check size={13} className="text-white" /> : <Clock size={12} className="text-slate-400" />}
                      </div>
                      {i < 3 && <div className={`w-0.5 h-8 my-1 ${step.done ? "bg-[#2BB673]" : "bg-slate-200"}`} />}
                    </div>
                    <div className="pb-6">
                      <p className="text-sm font-medium text-slate-900">{step.label}</p>
                      <p className="text-xs text-slate-400">{step.date}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </main>
    </div>
  );
}

// ─── Screen: Public Verification ─────────────────────────────────────────────

function PublicVerification({ onBack }: { onBack: () => void }) {
  const [query, setQuery] = useState("PRG-001");
  const [searched, setSearched] = useState(true);

  const program = PROGRAMS.find(p => p.id === query || p.name.toLowerCase().includes(query.toLowerCase())) ?? PROGRAMS[0];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-[Inter,sans-serif]">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400"><ArrowLeft size={16} /></button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#102A43] rounded-lg flex items-center justify-center">
                <Shield size={13} className="text-[#2BB673]" />
              </div>
              <span className="text-sm font-semibold text-slate-900">FundTrust</span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full">
            <Globe size={12} className="text-slate-400" />
            <span className="text-xs text-slate-500">Public Verification — No account required</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 py-10">
        {/* Search */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[#102A43] mb-2">Verify Fund Distribution</h1>
          <p className="text-slate-500 text-sm mb-8">Enter a Program ID, Transaction ID, or digital identity address</p>
          <div className="flex gap-2 max-w-xl mx-auto">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="PRG-001 or Transaction ID…"
                className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#102A43] focus:ring-1 focus:ring-[#102A43]/20 transition-all"
                onKeyDown={e => { if (e.key === "Enter") setSearched(true); }}
              />
            </div>
            <button
              onClick={() => setSearched(true)}
              className="px-5 py-3 bg-[#102A43] text-white text-sm font-medium rounded-xl hover:bg-[#1a3a57] transition-all"
            >
              Verify
            </button>
          </div>
        </div>

        {searched && program && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            {/* Verification Badge */}
            <div className="bg-white rounded-2xl border-2 border-[#2BB673]/30 p-6">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#2BB673]/10 rounded-2xl flex items-center justify-center">
                    <Shield size={24} className="text-[#2BB673]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <CheckCircle2 size={16} className="text-[#2BB673]" />
                      <span className="text-sm font-semibold text-[#2BB673]">Blockchain Verified</span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">{program.name}</h2>
                    <p className="text-xs text-slate-400 mt-0.5 font-mono">{program.id}</p>
                  </div>
                </div>
                <StatusBadge status={program.status} />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Total Budget", value: fmt(program.budget) },
                { label: "Funds Released", value: fmt(program.released) },
                { label: "Beneficiaries", value: program.beneficiaries.toLocaleString() },
                { label: "Progress", value: `${pct(program.released, program.budget)}%` },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
                  <p className="text-xl font-bold text-[#102A43]">{s.value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Timeline + Blockchain Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Timeline */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-5">Verification Timeline</h3>
                <div className="flex flex-col gap-0">
                  {[
                    { label: "Created", date: "Jul 1, 2024", done: true },
                    { label: "Allocated", date: "Jul 3, 2024", done: true },
                    { label: "Released", date: "Aug 5, 2024", done: true },
                    { label: "Confirmed", date: program.status === "completed" ? "Aug 12, 2024" : "Pending", done: program.status === "completed" },
                  ].map((step, i) => (
                    <div key={step.label} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${step.done ? "bg-[#2BB673]" : "bg-slate-100 border border-slate-200"}`}>
                          {step.done ? <Check size={11} className="text-white" /> : <Clock size={10} className="text-slate-400" />}
                        </div>
                        {i < 3 && <div className={`w-0.5 h-7 my-1 ${step.done ? "bg-[#2BB673]" : "bg-slate-100"}`} />}
                      </div>
                      <div className="pb-5">
                        <p className="text-sm font-medium text-slate-800">{step.label}</p>
                        <p className="text-xs text-slate-400">{step.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Blockchain Details */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Blockchain Record</h3>
                <div className="space-y-3">
                  {[
                    { label: "Transaction ID", value: program.txId, mono: true },
                    { label: "Network", value: "BOT Chain Testnet", mono: false },
                    { label: "Block Number", value: "#18,924,501", mono: true },
                    { label: "Timestamp", value: "2024-07-01 09:14:22 UTC", mono: false },
                    { label: "Record Type", value: "Cannot Be Modified", mono: false },
                  ].map(item => (
                    <div key={item.label} className="flex items-start justify-between gap-3">
                      <span className="text-xs text-slate-400 flex-shrink-0">{item.label}</span>
                      <span className={`text-xs text-slate-700 text-right ${item.mono ? "font-mono" : "font-medium"}`}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 pt-4 border-t border-slate-100 flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-600 hover:bg-slate-50 transition-all">
                    <ExternalLink size={13} />
                    View on Explorer
                  </button>
                  <CopyButton text={program.txId} />
                </div>
              </div>
            </div>

            {/* Transactions */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900">Recent Transactions</h3>
                <button className="flex items-center gap-1.5 text-xs text-[#2BB673] font-medium hover:underline">
                  View all <ChevronRight size={12} />
                </button>
              </div>
              <div className="divide-y divide-slate-100">
                {TRANSACTIONS.slice(0, 3).map(tx => (
                  <div key={tx.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono text-slate-600 truncate">{tx.id.slice(0, 32)}…</p>
                      <p className="text-xs text-slate-400 mt-0.5">{tx.time} · {tx.recipient}</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-800 whitespace-nowrap">${tx.amount.toLocaleString()}</p>
                    <StatusBadge status={tx.status} />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

// ─── Screen: Explorer ─────────────────────────────────────────────────────────

function Explorer({ onBack }: { onBack: () => void }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const filters = ["all", "confirmed", "pending", "failed"];

  const filtered = TRANSACTIONS.filter(tx => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = tx.id.includes(q) || tx.program.toLowerCase().includes(q) || tx.recipient.toLowerCase().includes(q);
    const matchesFilter = activeFilter === "all" || tx.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-[Inter,sans-serif]">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400"><ArrowLeft size={16} /></button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#102A43] rounded-lg flex items-center justify-center">
                <Shield size={13} className="text-[#2BB673]" />
              </div>
              <span className="text-sm font-semibold text-slate-900">FundTrust Explorer</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#2BB673]/10 border border-[#2BB673]/20 rounded-full">
            <span className="w-1.5 h-1.5 bg-[#2BB673] rounded-full animate-pulse" />
            <span className="text-xs font-medium text-[#2BB673]">Block #18,924,501</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#102A43] mb-1">Blockchain Explorer</h1>
          <p className="text-sm text-slate-500">Browse all on-chain transactions, wallets, and program records</p>
        </div>

        {/* Network Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Transactions", value: "128,492", icon: Activity },
            { label: "Wallets Active", value: "47,210", icon: Wallet },
            { label: "Programs On-Chain", value: "182", icon: Layers },
            { label: "Volume (30d)", value: "$24.8M", icon: BarChart3 },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <s.icon size={14} className="text-slate-400" />
                <span className="text-xs text-slate-400">{s.label}</span>
              </div>
              <p className="text-xl font-bold text-[#102A43]">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by Transaction ID, wallet, or program…"
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#102A43] transition-all"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-2 rounded-xl text-xs font-medium capitalize whitespace-nowrap transition-all ${
                  activeFilter === f
                    ? "bg-[#102A43] text-white"
                    : "bg-white border border-slate-200 text-slate-500 hover:border-slate-300"
                }`}
              >
                {f === "all" ? "All Transactions" : f}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2.5 border border-slate-200 bg-white rounded-xl text-xs text-slate-600 hover:bg-slate-50 transition-all whitespace-nowrap">
            <Download size={13} />
            Export CSV
          </button>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="hidden sm:grid grid-cols-[2.5fr_1.5fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-slate-100 text-xs font-medium text-slate-400 uppercase tracking-wide">
            <span>Transaction ID</span>
            <span>Program</span>
            <span>Amount</span>
            <span>Status</span>
            <span>Block</span>
            <span>Actions</span>
          </div>
          <div className="divide-y divide-slate-100">
            {filtered.map(tx => (
              <motion.div
                key={tx.id}
                layout
                className="flex flex-col sm:grid sm:grid-cols-[2.5fr_1.5fr_1fr_1fr_1fr_auto] gap-2 sm:gap-4 sm:items-center px-5 py-4 hover:bg-slate-50/50 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <Hash size={12} className="text-slate-300 flex-shrink-0" />
                    <span className="text-xs font-mono text-slate-700 truncate">{tx.id.slice(0, 22)}…</span>
                    <CopyButton text={tx.id} />
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 ml-4.5">{tx.time}</p>
                </div>
                <p className="text-xs text-slate-600 truncate">{tx.program}</p>
                <p className="text-sm font-semibold text-slate-800">${tx.amount.toLocaleString()}</p>
                <StatusBadge status={tx.status} />
                <p className="text-xs text-slate-400 font-mono">{tx.block ? `#${tx.block.toLocaleString()}` : <span className="text-amber-500">–</span>}</p>
                <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                  <ExternalLink size={13} />
                </button>
              </motion.div>
            ))}
            {filtered.length === 0 && (
              <div className="py-16 text-center text-slate-400">
                <Search size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">No transactions found</p>
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-5">
          <p className="text-xs text-slate-400">{filtered.length} transactions</p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>
            {[1, 2, 3].map(p => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                  currentPage === p ? "bg-[#102A43] text-white" : "border border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => p + 1)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-500 hover:bg-slate-50 transition-all"
            >
              Next
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Screen: Wallet Onboarding States ────────────────────────────────────────

function WalletOnboarding({ state, onSwitch, onRetry }: { state: WalletState; onSwitch: () => void; onRetry: () => void }) {
  if (state === "wrong-network") {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-5 font-[Inter,sans-serif]">
        <div className="bg-white rounded-2xl border border-slate-200 p-10 max-w-sm w-full text-center shadow-xl">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <AlertCircle size={28} className="text-amber-500" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Wrong Network</h2>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            FundTrust requires <strong className="text-slate-700">BOT Chain Testnet</strong>. You're currently connected to a different network.
          </p>
          <button onClick={onSwitch} className="w-full py-3 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 transition-all mb-3">
            Switch to BOT Chain Testnet
          </button>
          <button className="w-full py-2 text-sm text-slate-400 hover:text-slate-600 transition-colors">
            Learn how to switch networks
          </button>
        </div>
      </div>
    );
  }

  if (state === "no-metamask") {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-5 font-[Inter,sans-serif]">
        <div className="bg-white rounded-2xl border border-slate-200 p-10 max-w-sm w-full text-center shadow-xl">
          <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Wallet size={28} className="text-orange-400" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">MetaMask not found</h2>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            You'll need the MetaMask browser extension to connect your digital identity and sign transactions.
          </p>
          <a
            href="https://metamask.io/download"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 bg-[#102A43] text-white font-medium rounded-xl hover:bg-[#1a3a57] transition-all mb-3"
          >
            Install MetaMask <ArrowUpRight size={16} />
          </a>
          <button onClick={onRetry} className="w-full py-2 text-sm text-slate-400 hover:text-slate-600 transition-colors">
            I've installed it, try again
          </button>
        </div>
      </div>
    );
  }

  return null;
}

// ─── Navigation Bar ───────────────────────────────────────────────────────────

function NavBar({ current, onChange }: { current: Screen; onChange: (s: Screen) => void }) {
  const items: { screen: Screen; label: string; icon: typeof Shield }[] = [
    { screen: "landing", label: "Home", icon: Shield },
    { screen: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { screen: "beneficiary", label: "Beneficiary", icon: Users },
    { screen: "verification", label: "Verify", icon: Eye },
    { screen: "explorer", label: "Explorer", icon: Hash },
  ];
  const isSubPage = ["how-it-works", "features", "why-blockchain"].includes(current);

  if (isSubPage) return null;

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-[#102A43]/95 backdrop-blur-md border border-white/10 rounded-2xl px-2 py-2 flex items-center gap-1 shadow-2xl">
        {items.map(item => (
          <button
            key={item.screen}
            onClick={() => onChange(item.screen)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              current === item.screen
                ? "bg-[#2BB673] text-white"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <item.icon size={14} />
            <span className="hidden sm:block">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [walletState, setWalletState] = useState<WalletState>("disconnected");
  const [walletAddress] = useState("0x7f3aB29E4C2D5F6A7B8E9C0D1E2F3A4B5C6D7E8");
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [txState, setTxState] = useState<TxState>("idle");

  const handleConnect = () => setShowConnectModal(true);

  const handleMetaMaskConnect = () => {
    setShowConnectModal(false);
    setWalletState("connecting");
    setTimeout(() => setWalletState("connected"), 1500);
  };

  const handleDisconnect = () => setWalletState("disconnected");

  if (walletState === "wrong-network") {
    return (
      <>
        <WalletOnboarding state="wrong-network" onSwitch={() => setWalletState("connected")} onRetry={() => {}} />
        <NavBar current={screen} onChange={setScreen} />
      </>
    );
  }

  if (walletState === "no-metamask") {
    return (
      <>
        <WalletOnboarding state="no-metamask" onSwitch={() => {}} onRetry={() => setWalletState("disconnected")} />
        <NavBar current={screen} onChange={setScreen} />
      </>
    );
  }

  return (
    <div className="relative" style={{ fontFamily: "'Inter', sans-serif" }}>
      <AnimatePresence>
        <TxToast state={txState} onClose={() => setTxState("idle")} />
      </AnimatePresence>

      <AnimatePresence>
        {showConnectModal && (
          <WalletConnectModal
            onClose={() => setShowConnectModal(false)}
            onConnect={handleMetaMaskConnect}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {screen === "landing" && (
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <LandingPage onNavigate={setScreen} />
          </motion.div>
        )}
        {screen === "how-it-works" && (
          <motion.div key="how-it-works" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
            <HowItWorksPage onNavigate={setScreen} />
          </motion.div>
        )}
        {screen === "features" && (
          <motion.div key="features" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
            <FeaturesPage onNavigate={setScreen} />
          </motion.div>
        )}
        {screen === "why-blockchain" && (
          <motion.div key="why-blockchain" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
            <WhyBlockchainPage onNavigate={setScreen} />
          </motion.div>
        )}
        {screen === "dashboard" && (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <Dashboard
              walletState={walletState}
              walletAddress={walletAddress}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              onBack={() => setScreen("landing")}
            />
          </motion.div>
        )}
        {screen === "beneficiary" && (
          <motion.div key="beneficiary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <BeneficiaryPortal
              walletState={walletState}
              walletAddress={walletAddress}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              onBack={() => setScreen("landing")}
            />
          </motion.div>
        )}
        {screen === "verification" && (
          <motion.div key="verification" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <PublicVerification onBack={() => setScreen("landing")} />
          </motion.div>
        )}
        {screen === "explorer" && (
          <motion.div key="explorer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <Explorer onBack={() => setScreen("landing")} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pb-24">
        <NavBar current={screen} onChange={setScreen} />
      </div>
    </div>
  );
}
