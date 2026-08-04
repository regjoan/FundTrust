import { useState, useEffect } from "react";
import { ArrowLeft, Shield, Globe, Search, CheckCircle2, Check, Clock, ExternalLink, Copy } from "lucide-react";
import { motion } from "motion/react";
import { getProgram, getProgramRecipients, getProgramTimeline } from "./contract";

const fmt = (n: number) => n >= 1000000 ? `$${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${n}`;
const pct = (a: number, b: number) => b === 0 ? 0 : Math.round((a / b) * 100);

function formatDateUTC(ts: number | undefined): string {
  if (!ts) return "—";
  return new Date(ts * 1000).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function truncateHash(h: string): string {
  if (!h || h.length < 10) return h;
  return `${h.slice(0, 10)}...${h.slice(-8)}`;
}

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

export default function PublicVerification({ onBack }: { onBack: () => void }) {
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

      const [prog, recipients, timeline] = await Promise.all([
        getProgram(id),
        getProgramRecipients(id),
        getProgramTimeline(id).catch(() => null),
      ]);

      const totalFund = Number(prog[3]);
      const remainingFund = Number(prog[5]);
      const released = totalFund - remainingFund;

      // --- Extract real txId from ProgramCreated event ---
      let txId = "Pending on-chain indexing";
      let createdDate: string | undefined;
      if (timeline && timeline.created.length > 0) {
        const ev = timeline.created[0];
        txId = (ev as any).transactionHash ?? txId;
        try {
          const block = await ev.getBlock();
          if (block?.timestamp) createdDate = formatDateUTC(Number(block.timestamp));
        } catch { /* ignore */ }
      }

      // --- Extract allocate/release/claim dates from events ---
      let allocatedDate: string | undefined;
      let releasedDate: string | undefined;
      let claimedDate: string | undefined;

      if (timeline) {
        if (timeline.allocated.length > 0) {
          try { const b = await timeline.allocated[0].getBlock(); if (b?.timestamp) allocatedDate = formatDateUTC(Number(b.timestamp)); } catch { /* ignore */ }
        }
        if (timeline.released.length > 0) {
          try { const b = await timeline.released[0].getBlock(); if (b?.timestamp) releasedDate = formatDateUTC(Number(b.timestamp)); } catch { /* ignore */ }
        }
        if (timeline.claimed.length > 0) {
          try { const b = await timeline.claimed[timeline.claimed.length - 1].getBlock(); if (b?.timestamp) claimedDate = formatDateUTC(Number(b.timestamp)); } catch { /* ignore */ }
        }
      }

      // --- Build recent transactions from FundReleased events ---
      const recentTxs: any[] = [];
      if (timeline && timeline.released.length > 0) {
        const sliced = timeline.released.slice(-5).reverse();
        for (const ev of sliced) {
          let time = "—";
          try {
            const b = await ev.getBlock();
            if (b?.timestamp) time = formatDateUTC(Number(b.timestamp));
          } catch { /* ignore */ }
            recentTxs.push({
              id: (ev as any).transactionHash ?? "—",
              amount: (ev as any).args ? Number((ev as any).args[2]) : 0,
              recipient: (ev as any).args ? String((ev as any).args[1]) : "—",
              time,
              status: "confirmed",
            });
        }
      }

      setProgram({
        id: `PRG-${String(id).padStart(3, "0")}`,
        name: prog[1] || "Unknown Program",
        description: prog[2],
        budget: totalFund,
        released: released,
        beneficiaries: recipients.length,
        status: remainingFund === 0 && totalFund > 0 ? "completed" : "active",
        txId,
        createdDate: createdDate ?? "—",
        allocatedDate: allocatedDate ?? "—",
        releasedDate: releasedDate ?? "—",
        claimedDate,
        recentTxs,
      });
    } catch (err) {
      console.error("Verification error:", err);
      setProgram(null);
    }
    setLoading(false);
  };

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
          <p className="text-slate-500 text-sm mb-8">Enter a Program ID to look up its on-chain record</p>
          <div className="flex gap-2 max-w-xl mx-auto">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="e.g. 1 or PRG-001…"
                className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#102A43] focus:ring-1 focus:ring-[#102A43]/20 transition-all"
                onKeyDown={e => { if (e.key === "Enter") handleSearch(query); }}
              />
            </div>
            <button
              onClick={() => handleSearch(query)}
              disabled={loading}
              className="px-5 py-3 bg-[#102A43] text-white text-sm font-medium rounded-xl hover:bg-[#1a3a57] transition-all disabled:opacity-50"
            >
              {loading ? "Searching…" : "Verify"}
            </button>
          </div>
        </div>

        {/* Not found state */}
        {searched && !loading && !program && (
          <div className="text-center py-16 text-slate-400">
            <Search size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No program found. Make sure you entered a valid Program ID.</p>
          </div>
        )}

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
                    { label: "Created", date: program.createdDate, done: true },
                    { label: "Allocated", date: program.allocatedDate, done: program.allocatedDate !== "—" },
                    { label: "Released", date: program.releasedDate, done: program.releasedDate !== "—" },
                    { label: "Confirmed", date: program.claimedDate ?? "Pending", done: !!program.claimedDate },
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
                    { label: "Transaction ID", value: truncateHash(program.txId), mono: true },
                    { label: "Network", value: "BOT Chain Testnet", mono: false },
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
                  <a
                    href={`https://explorer.bohr.life/tx/${program.txId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    <ExternalLink size={13} />
                    View on Explorer
                  </a>
                  <CopyButton text={program.txId} />
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900">Recent Transactions</h3>
                <span className="text-xs text-slate-400">{program.recentTxs.length} shown</span>
              </div>
              <div className="divide-y divide-slate-100">
                {program.recentTxs.length === 0 ? (
                  <div className="py-10 text-center text-slate-400 text-xs">No fund release transactions recorded yet.</div>
                ) : (
                  program.recentTxs.map((tx: any) => (
                    <div key={tx.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-mono text-slate-600 truncate">{tx.id.slice(0, 32)}…</p>
                        <p className="text-xs text-slate-400 mt-0.5">{tx.time} · {tx.recipient.slice(0, 10)}…</p>
                      </div>
                      <p className="text-sm font-semibold text-slate-800 whitespace-nowrap">${tx.amount.toLocaleString()}</p>
                      <StatusBadge status={tx.status} />
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}