export default function Loading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 h-screen w-full">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
        </div>
      </div>
      <p className="mt-8 text-slate-500 text-xs font-bold uppercase tracking-[0.3em] animate-pulse">
        Getting Router Ready
      </p>
    </div>
  );
}
