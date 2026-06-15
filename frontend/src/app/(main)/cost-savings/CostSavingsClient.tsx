"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { fetchHistory, HistoryItems } from "@/lib/api";
import { getModelColor, getComplexityColor } from "@/lib/ui-utils";

function ComplexityPill({ complexity }: { complexity: string }) {
  const color = getComplexityColor(complexity);
  return (
    <span 
      className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize border"
      style={{
        backgroundColor: `${color}10`,
        color: color,
        borderColor: `${color}20`
      }}
    >
      {complexity}
    </span>
  );
}

export default function CostSavingsClient() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [history, setHistory] = useState<HistoryItems[]>([]);
  const [loadTime] = useState(() => Date.now());

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      const h = await fetchHistory();
      setHistory(h || []);
      setIsLoading(false);
    };
    init();
  }, [router]);

  const filtered = history;

  // Hero stats
  const totalSpent = filtered.reduce((s, h) => s + (h.estimated_cost ?? 0), 0);
  const totalSaved = filtered.reduce((s, h) => s + (h.savings ?? 0), 0);
  const wouldHaveCost = totalSpent + totalSaved;
  const savingsRate = wouldHaveCost > 0 ? Math.round((totalSaved / wouldHaveCost) * 100) : 0;

  // Per-model breakdown
  const modelStats = useMemo(() => {
    const map: Record<string, { count: number; cost: number; saved: number; tokens: number }> = {};
    filtered.forEach((h) => {
      const m = h.model_used || "Unknown";
      if (!map[m]) map[m] = { count: 0, cost: 0, saved: 0, tokens: 0 };
      map[m].count++;
      map[m].cost += h.estimated_cost ?? 0;
      map[m].saved += h.savings ?? 0;
      map[m].tokens += (h.input_tokens ?? 0) + (h.output_tokens ?? 0);
    });
    return Object.entries(map).sort((a, b) => b[1].count - a[1].count);
  }, [filtered]);

  // Most expensive prompts
  const expensivePrompts = useMemo(() => {
    return [...filtered]
      .sort((a, b) => (b.estimated_cost ?? 0) - (a.estimated_cost ?? 0))
      .slice(0, 10);
  }, [filtered]);

  if (isLoading) {
    return (
      <div className="relative z-10 flex-1 px-8 py-6 max-w-7xl w-full mx-auto space-y-6 overflow-y-auto h-screen">
        <div className="h-8 w-40 bg-white/5 rounded-md animate-pulse"></div>
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-7 shadow-sm border border-white/10 h-[140px] animate-pulse">
          <div className="h-12 w-1/3 bg-white/10 rounded mb-4"></div>
          <div className="h-4 w-1/2 bg-white/5 rounded"></div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/5 backdrop-blur-xl rounded-2xl p-5 shadow-sm border border-white/10 h-[180px] animate-pulse">
              <div className="h-4 w-20 bg-white/10 rounded mb-4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 flex-1 px-8 py-6 max-w-7xl w-full mx-auto space-y-6 overflow-y-auto h-screen">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold font-headline text-slate-100 tracking-tight">Financial Savings</h2>
      </div>

      {/* ROI Victory Banner */}
      <div className="relative bg-emerald-500/[0.03] backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-emerald-500/20 overflow-hidden">
        {/* Animated background glow */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/10 blur-[100px] rounded-full -mr-48 -mt-48 transition-all duration-1000" />
        <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-emerald-500/5 blur-[80px] rounded-full -ml-24 -mb-24" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Total Savings Achieved</span>
            </div>
            <h1 className="text-6xl font-black font-headline tracking-tighter text-white">
              ₹{totalSaved.toFixed(2)}
            </h1>
            <p className="text-slate-400 max-w-md text-sm leading-relaxed">
              The intelligent routing infrastructure has successfully captured <span className="text-emerald-400 font-bold">{savingsRate}%</span> more efficiency compared to basic top-tier model usage.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 shrink-0 min-w-[320px]">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Actual Spend</p>
              <p className="text-xl font-bold text-slate-100">₹{totalSpent.toFixed(2)}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Saved Rate</p>
              <p className="text-xl font-bold text-emerald-400">{savingsRate}%</p>
            </div>
            <div className="col-span-2 p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Unoptimized Cost</p>
                <p className="text-sm font-medium text-slate-400 line-through opacity-50">₹{wouldHaveCost.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <div className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">LIFETIME ROI</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {modelStats.length === 0 ? (
          <div className="col-span-3 text-center text-sm text-slate-500 py-8">No billing data found.</div>
        ) : (
          modelStats.map(([model, stats]) => (
            <div
              key={model}
              className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-white/10 relative overflow-hidden group hover:bg-white/[0.08] transition-all duration-300"
            >
              <div className="absolute top-0 left-0 w-full h-[3px]" style={{ backgroundColor: getModelColor(model), boxShadow: `0 0 10px ${getModelColor(model)}` }} />
              <p className="text-sm font-bold font-headline text-slate-100 mb-5">{model}</p>
              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Total Volume</span>
                  <span className="font-bold text-slate-200">{stats.count} calls</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Cumulative Cost</span>
                  <span className="font-bold text-slate-200">₹{stats.cost.toFixed(4)}</span>
                </div>
                <div className="flex justify-between text-xs pt-2 border-t border-white/10 mt-2">
                  <span className="text-slate-400 font-medium">Net Efficiency Captured</span>
                  <span className="font-bold text-emerald-400">₹{stats.saved.toFixed(4)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-sm border border-white/10 overflow-hidden mt-4">
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <p className="text-sm font-bold font-headline text-slate-100">Top 10 High-Impact Savings</p>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Individual Prompt Analysis</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white/[0.02]">
                <th className="text-left text-[10px] font-bold uppercase tracking-wider text-slate-400 px-6 py-4">Prompt Context</th>
                <th className="text-left text-[10px] font-bold uppercase tracking-wider text-slate-400 px-4 py-4">Complexity</th>
                <th className="text-left text-[10px] font-bold uppercase tracking-wider text-slate-400 px-4 py-4">Routing</th>
                <th className="text-left text-[10px] font-bold uppercase tracking-wider text-slate-400 px-4 py-4">Efficiency</th>
                <th className="text-right px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {expensivePrompts.map((h) => (
                <tr key={h.id} className="hover:bg-white/[0.03] transition-colors group">
                  <td className="px-6 py-4">
                    <p className="text-xs font-medium text-slate-200 truncate max-w-sm">
                      {h.prompt}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <ComplexityPill complexity={h.predicted_complexity || "simple"} />
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-xs text-slate-300 font-medium">{h.model_used}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-xs font-bold text-emerald-400 font-mono">
                      ₹{(h.savings ?? 0).toFixed(4)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => router.push(`/?thread=${h.thread_id}`)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[10px] rounded-lg"
                    >
                      View Thread
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
