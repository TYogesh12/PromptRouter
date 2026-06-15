"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { fetchHistory, HistoryItems } from "@/lib/api";
import { getModelColor, getComplexityColor } from "@/lib/ui-utils";



export default function DashboardClient() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [history, setHistory] = useState<HistoryItems[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedComplexity, setSelectedComplexity] = useState<string | null>(null);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
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

  const filtered = useMemo(() => {
    return history.filter((h) => {
      const modelMatch = !selectedModel || h.model_used === selectedModel;
      const complexityMatch = !selectedComplexity || h.predicted_complexity?.toLowerCase() === selectedComplexity.toLowerCase();
      return modelMatch && complexityMatch;
    });
  }, [history, selectedModel, selectedComplexity]);

  // Stats
  const totalPrompts = filtered.length;
  const totalCost = filtered.reduce((s, h) => s + (h.estimated_cost ?? 0), 0);
  const totalSaved = filtered.reduce((s, h) => s + (h.savings ?? 0), 0);
  const avgResponseTime =
    filtered.length > 0
      ? filtered.reduce((s, h) => s + (h.response_time ?? 0), 0) / filtered.length
      : 0;
  const savingsRate =
    totalCost + totalSaved > 0
      ? Math.round((totalSaved / (totalCost + totalSaved)) * 100)
      : 0;

  // Prompts per day (Rolling Last 7 Days)
  const last7Days = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(loadTime - i * 24 * 60 * 60 * 1000);
      days.push({
        label: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dateStr: d.toISOString().split('T')[0],
        dayNum: d.getDate()
      });
    }
    return days;
  }, [loadTime]);

  const promptsPerDay = useMemo(() => {
    const counts = Array(7).fill(0);
    filtered.forEach((h) => {
      const hDate = new Date(h.created_at).toISOString().split('T')[0];
      const idx = last7Days.findIndex(d => d.dateStr === hDate);
      if (idx !== -1) counts[idx]++;
    });
    return counts;
  }, [filtered, last7Days]);

  const maxBar = Math.max(...promptsPerDay, 5);

  const complexityCounts = useMemo(() => {
    const counts: Record<string, number> = { simple: 0, moderate: 0, hard: 0 };
    filtered.forEach((h) => {
      const c = (h.predicted_complexity || "simple").toLowerCase();
      if (c in counts) counts[c]++;
    });
    return counts;
  }, [filtered]);
  const totalC = complexityCounts.simple + complexityCounts.moderate + complexityCounts.hard || 1;

  const modelUsage = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach((h) => {
      const m = h.model_used || "Unknown";
      map[m] = (map[m] || 0) + 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([model, count]) => ({ model, count, pct: Math.round((count / (totalPrompts || 1)) * 100) }));
  }, [filtered, totalPrompts]);

  if (isLoading) {
    return (
      <div className="relative z-10 flex-1 px-8 py-6 max-w-7xl w-full mx-auto space-y-6 overflow-y-auto h-screen">
        <div className="flex items-center justify-between">
          <div className="h-8 w-40 bg-white/5 rounded-md animate-pulse"></div>
          <div className="h-8 w-32 bg-white/5 rounded-xl animate-pulse"></div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white/5 backdrop-blur-xl rounded-2xl p-5 shadow-sm border border-white/10 h-[120px] animate-pulse">
              <div className="h-3 w-20 bg-white/10 rounded mb-4"></div>
              <div className="h-8 w-28 bg-white/10 rounded mb-4"></div>
              <div className="h-4 w-24 bg-white/10 rounded-full"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 bg-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-white/10 h-[220px] animate-pulse">
            <div className="h-4 w-32 bg-white/10 rounded mb-6"></div>
            <div className="h-28 w-full bg-white/5 rounded"></div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-white/10 h-[220px] animate-pulse">
            <div className="h-4 w-32 bg-white/10 rounded mb-6"></div>
            <div className="w-24 h-24 rounded-full bg-white/5 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 flex-1 px-8 py-6 max-w-7xl w-full mx-auto space-y-6 overflow-y-auto h-screen">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold font-headline text-slate-100 tracking-tight">Dashboard</h2>
          {(selectedModel || selectedComplexity) && (
            <button
              onClick={() => { setSelectedModel(null); setSelectedComplexity(null); }}
              className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase transition-all hover:bg-emerald-500/20"
            >
              Clear Filters ×
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: "Total Prompts",
            value: totalPrompts.toLocaleString(),
            sub: `${savingsRate}% savings rate`,
            subColor: "text-emerald-400",
            subBg: "bg-emerald-500/10 border border-emerald-500/20",
          },
          {
            label: "Total Cost",
            value: `₹${totalCost.toFixed(2)}`,
            sub: `vs ₹${(totalCost + totalSaved).toFixed(2)} top model`,
            subColor: "text-amber-400",
            subBg: "bg-amber-500/10 border border-amber-500/20",
          },
          {
            label: "Total Saved",
            value: `₹${totalSaved.toFixed(2)}`,
            sub: `${savingsRate}% savings rate`,
            subColor: "text-emerald-400",
            subBg: "bg-emerald-500/10 border border-emerald-500/20",
          },
          {
            label: "Avg Response Time",
            value: `${avgResponseTime.toFixed(1)}s`,
            sub: "across all models",
            subColor: "text-slate-400",
            subBg: "bg-white/5 border border-white/10",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white/5 backdrop-blur-xl rounded-2xl p-5 shadow-sm border border-white/10"
          >
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              {card.label}
            </p>
            <p className="text-3xl font-bold font-headline text-slate-100 tracking-tight mb-3">
              {card.value}
            </p>
            <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${card.subColor} ${card.subBg}`}>
              {card.sub}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-white/10">
          <p className="text-sm font-bold font-headline text-slate-100 mb-4">Prompts per day</p>
          <div className="flex items-end gap-2 h-36 relative">
            {promptsPerDay.map((count, i) => (
              <div
                key={i}
                className="flex-1 flex flex-col items-center justify-end h-full gap-1.5 group cursor-default"
                onMouseEnter={() => setHoveredDay(i)}
                onMouseLeave={() => setHoveredDay(null)}
              >
                <div className="relative w-full flex-1 flex flex-col justify-end">
                  {hoveredDay === i && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 px-2 py-1 rounded text-[10px] font-bold text-white whitespace-nowrap z-50 shadow-2xl">
                      {count} prompts
                    </div>
                  )}
                  <div
                    className="w-full rounded-t-[4px] transition-all duration-500 ease-out"
                    style={{
                      height: `${(count / maxBar) * 100}%`,
                      minHeight: count > 0 ? 4 : 2,
                      backgroundColor: "#10b981",
                      opacity: count === 0 ? 0.1 : 0.9,
                      boxShadow: count > 0 ? "0 0 15px rgba(16,185,129,0.3)" : "none"
                    }}
                  />
                </div>
                <div className="flex flex-col items-center shrink-0">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{last7Days[i].label}</span>
                  <span className="text-[8px] text-slate-500 font-medium">{last7Days[i].dayNum}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-white/10">
          <p className="text-sm font-bold font-headline text-slate-100 mb-4">Complexity split</p>
          <div className="flex items-center gap-4">
            <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90" style={{ flexShrink: 0 }}>
              {(() => {
                const segments = [
                  { key: "simple", color: "#10b981" },
                  { key: "moderate", color: "#f59e0b" },
                  { key: "hard", color: "#9e3f4e" },
                ];
                let offset = 0;
                return segments.map(({ key, color }) => {
                  const pct = complexityCounts[key] / totalC;
                  const dash = pct * 100;
                  const el = (
                    <circle
                      key={key}
                      cx="18" cy="18" r="15.9"
                      fill="transparent"
                      stroke={color}
                      strokeWidth="4"
                      strokeDasharray={`${dash} ${100 - dash}`}
                      strokeDashoffset={-offset}
                    />
                  );
                  offset += dash;
                  return el;
                });
              })()}
            </svg>
            <div className="space-y-2">
              {[
                { label: "Simple", key: "simple", color: "#10b981" },
                { label: "Moderate", key: "moderate", color: "#f59e0b" },
                { label: "Hard", key: "hard", color: "#9e3f4e" },
              ].map(({ label, key, color }) => (
                <button
                  key={key}
                  onClick={() => setSelectedComplexity(selectedComplexity === key ? null : key)}
                  className={`flex items-center gap-2 w-full px-2 py-1 rounded-lg transition-all ${selectedComplexity === key ? 'bg-white/10 ring-1 ring-white/20' : 'hover:bg-white/5'}`}
                >
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }} />
                  <span className="text-xs text-slate-400 flex-1 text-left">
                    {label}{" "}
                    <span className="font-bold text-slate-200">
                      {Math.round((complexityCounts[key] / totalC) * 100)}%
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-white/10">
        <p className="text-sm font-bold font-headline text-slate-100 mb-5">Model usage</p>
        <div className="space-y-3">
          {modelUsage.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">No data matching filters.</p>
          ) : (
            modelUsage.map(({ model, pct, count }) => (
              <button
                key={model}
                onClick={() => setSelectedModel(selectedModel === model ? null : model)}
                className={`flex items-center gap-4 w-full p-2 rounded-xl transition-all group ${selectedModel === model ? 'bg-white/10 ring-1 ring-white/20' : 'hover:bg-white/5'}`}
              >
                <span className="text-xs font-semibold text-slate-300 w-36 truncate shrink-0 text-left">{model}</span>
                <div className="flex-1 bg-white/10 rounded-full h-1.5 overflow-hidden shadow-inner border border-white/5">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, backgroundColor: getModelColor(model) }}
                  />
                </div>
                <div className="flex items-center gap-3 w-20 justify-end">
                  <span className="text-[10px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{count} calls</span>
                  <span className="text-xs font-bold text-slate-300">{pct}%</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <p className="text-sm font-bold font-headline text-slate-100">Recent Activity</p>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{filtered.length} matching entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01]">
                <th className="px-6 py-3 font-semibold text-slate-400">Prompt</th>
                <th className="px-6 py-3 font-semibold text-slate-400">Complexity</th>
                <th className="px-6 py-3 font-semibold text-slate-400">Model Used</th>
                <th className="px-6 py-3 font-semibold text-slate-400">Savings</th>
                <th className="px-6 py-3 font-semibold text-slate-400"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.slice(0, 10).map((h) => (
                <tr key={h.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4 max-w-sm">
                    <p className="text-slate-200 line-clamp-1">{h.prompt}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{new Date(h.created_at).toLocaleDateString()} {new Date(h.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: `${getComplexityColor(h.predicted_complexity || 'simple')}20`, color: getComplexityColor(h.predicted_complexity || 'simple') }}>
                      {h.predicted_complexity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-300">{h.model_used}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={h.savings && h.savings > 0 ? "text-emerald-400 font-bold" : "text-slate-500"}>
                      {h.savings && h.savings > 0 ? `+₹${h.savings.toFixed(2)}` : "--"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => router.push(`/?thread=${h.thread_id}`)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[10px] rounded-lg"
                    >
                      View Chat
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">No prompts found for selected filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 10 && (
          <div className="px-6 py-3 bg-white/[0.01] border-t border-white/5 text-center">
            <p className="text-[11px] text-slate-500 font-medium italic">Showing 10 of {filtered.length} entries</p>
          </div>
        )}
      </div>
    </div>
  );
}
