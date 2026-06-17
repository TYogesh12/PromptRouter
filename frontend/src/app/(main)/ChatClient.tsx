"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { submitPrompt, fetchHistory, PromptResponse, HistoryItems, createThread } from "@/lib/api";
import { ArrowUp, User, Sparkles, Check, TrendingDown } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { useChat } from "@/lib/ChatContext";

type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
  analytics?: PromptResponse;
};

export default function ChatClient() {
  const { activeThreadId, isSidebarCollapsed, displayName, refreshThreads } = useChat();
  const [isLoading, setIsLoading] = useState(true);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [fullHistory, setFullHistory] = useState<HistoryItems[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingStep, setTypingStep] = useState(0);
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isTypingRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const prevThreadIdRef = useRef<string | null>(null);

  // Keep ref in sync so effects can read it without depending on it
  useEffect(() => { isTypingRef.current = isTyping; }, [isTyping]);

  // Frame-perfect Scroll logic
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    if (prevThreadIdRef.current !== activeThreadId) {
      el.style.scrollBehavior = "auto";
      el.scrollTop = 0;
      prevThreadIdRef.current = activeThreadId;
    }

    // Use requestAnimationFrame for zero-flicker scrolling
    const scroll = () => {
      el.style.scrollBehavior = "smooth";
      el.scrollTop = el.scrollHeight;
    };

    requestAnimationFrame(scroll);
  }, [messages, activeThreadId]);

  useEffect(() => {
    if (isTyping) {
      setTypingStep(0);
      const timer1 = setTimeout(() => setTypingStep(1), 400); // Classifying
      const timer2 = setTimeout(() => setTypingStep(2), 800); // Checking cost
      const timer3 = setTimeout(() => setTypingStep(3), 1200); // Routing
      return () => { clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3); };
    }
  }, [isTyping]);

  useEffect(() => {
    const initData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push("/login");
          return;
        }
        const fetchedHistory = await fetchHistory();
        setFullHistory(fetchedHistory);
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    initData();
  }, []);

  // SYNC: Load thread messages when the activeThreadId changes or when history is initially loaded
  useEffect(() => {
    if (activeThreadId) {
      const threadMessages = fullHistory
        .filter((h) => h.thread_id === activeThreadId)
        .reverse()
        .flatMap((h) => [
          { id: `${h.id}-user`, role: "user" as const, content: h.prompt },
          { id: h.id, role: "ai" as const, content: h.response, analytics: h as PromptResponse }
        ] as Message[]);
      setMessages(threadMessages);
    } else {
      setMessages([]);
    }
  }, [activeThreadId, fullHistory.length === 0]);


  const handleSend = async (e?: React.FormEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userText = input;
    const userMessageId = `user-${Date.now()}`;
    const aiMessageId = `ai-${Date.now()}`;

    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setMessages((prev) => [...prev, { id: userMessageId, role: "user", content: userText }]);
    setIsTyping(true);

    try {
      let currentThreadId = activeThreadId;
      const startTime = Date.now();

      if (!currentThreadId) {
        const title = userText.length > 30 ? userText.substring(0, 30) + "..." : userText;
        const newThread = await createThread(title);
        currentThreadId = newThread.id;
        window.history.pushState(null, '', `/chat?thread=${currentThreadId}`);
        await refreshThreads();
      }

      const data = await submitPrompt(userText, currentThreadId);

      const elapsed = Date.now() - startTime;
      if (elapsed < 1200) {
        await new Promise(resolve => setTimeout(resolve, 1200 - elapsed));
      }

      // 2. Finalize: ensure the stable DB ID is used for the response
      const stableMsgId = data.id || aiMessageId;
      setMessages((prev) => [...prev, { id: stableMsgId, role: "ai", content: data.response, analytics: data }]);

      setFullHistory(prev => [{
        ...data,
        id: stableMsgId,
        thread_id: currentThreadId,
        prompt: userText,
        created_at: new Date().toISOString()
      } as HistoryItems, ...prev]);

    } catch {
      setMessages((prev) => [...prev, { id: `err-${Date.now()}`, role: "ai", content: "Error connecting to router module." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const getSavingsDisplay = (analytics: PromptResponse) => {
    const s = analytics.savings || 0;
    const c = analytics.estimated_cost || 0;

    let percentage = 0.0;
    if (s > 0 || c > 0) {
      const topCost = c + s;
      percentage = (s / topCost) * 100;
    }

    return (
      <span className="flex items-center gap-1.5">
        <TrendingDown size={12} /> Saved {percentage.toFixed(1)}%
      </span>
    );
  };

  if (isLoading) return <div className="h-full bg-transparent flex items-center justify-center text-zinc-500">Loading...</div>;

  return (
    <>
      <div ref={scrollContainerRef} className="relative z-10 flex-1 overflow-y-auto px-8 pb-40 pt-6 w-full">
        <div className="w-full max-w-3xl mx-auto space-y-12">
          {messages.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center mt-32 min-h-[300px]">
              <div className="w-16 h-16 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] flex items-center justify-center text-emerald-500 mb-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50" />
                <Sparkles size={28} />
              </div>
              <h2 className="text-3xl font-extralight font-headline text-slate-100 tracking-tight mb-2">
                Good evening, <span className="font-bold text-emerald-400">{displayName}</span>
              </h2>
              <p className="text-zinc-400 text-[15px] font-medium mb-12">
                What would you like to build today?
              </p>

              <div className="grid grid-cols-2 gap-4 w-full max-w-2xl px-4">
                <button onClick={() => setInput("How do I migrate my Next.js 12 app to Next.js 14 App Router? Please list step-by-step.")} className="text-left bg-white/5 hover:bg-white/10 border border-white/5 border-t-white/10 p-5 rounded-2xl backdrop-blur-xl transition-all duration-300 group hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20">
                  <p className="text-[13px] font-semibold text-slate-200 mb-1 leading-snug">Migrate Next.js App Router</p>
                  <p className="text-[11px] text-zinc-500 group-hover:text-emerald-500 transition-colors">Complex architecture help →</p>
                </button>
                <button onClick={() => setInput("Write a Python script to resize all images in a folder to 1080p width.")} className="text-left bg-white/5 hover:bg-white/10 border border-white/5 border-t-white/10 p-5 rounded-2xl backdrop-blur-xl transition-all duration-300 group hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20">
                  <p className="text-[13px] font-semibold text-slate-200 mb-1 leading-snug">Write a Python image resizer</p>
                  <p className="text-[11px] text-zinc-500 group-hover:text-emerald-500 transition-colors">Simple utility script →</p>
                </button>
              </div>
            </motion.div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`flex gap-5 w-full ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className="flex-shrink-0 mt-1">
                  {msg.role === "user" ? (
                    <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-700/50 shadow-sm">
                      <User size={16} />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                      <Sparkles size={16} />
                    </div>
                  )}
                </div>
                <div className={`flex-1 pt-1 min-w-0 ${msg.role === "user" ? "flex flex-col items-end" : "space-y-2"}`}>
                  {msg.role === "user" ? (
                    <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-slate-50 shadow-[0_4px_20px_rgba(16,185,129,0.2)] px-5 py-3 rounded-[24px] rounded-tr-[4px] inline-block max-w-[85%] text-[15px] font-medium whitespace-pre-wrap text-left border border-white/10">
                      {msg.content}
                    </div>
                  ) : (
                    <>
                      <div className="prose prose-invert prose-emerald max-w-full w-full overflow-x-auto break-words text-[15px] text-zinc-200 leading-relaxed bg-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_4px_20_rgba(0,0,0,0.1)] backdrop-blur-xl border border-white/5 p-5 pt-4 rounded-[24px] rounded-tl-[4px]">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                      {msg.analytics && (
                        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="ml-2 inline-flex items-center gap-4 py-4 px-4 bg-transparent backdrop-blur-md text-[11px] font-medium text-zinc-400 shadow-sm mt-1">
                          <div className="flex gap-1.5 items-center">
                            <Sparkles size={10} className="text-emerald-500" />
                            <span className="text-slate-200 font-semibold">{msg.analytics.model_used}</span>
                          </div>
                          <div className="w-px h-3 bg-white/10" />
                          <div className="flex gap-1.5 items-center">
                            <span className="opacity-60">Latency:</span>
                            <span className="text-slate-200 font-semibold">{msg.analytics.response_time}s</span>
                          </div>
                          <div className="w-px h-3 bg-white/10" />
                          <div className="flex gap-1.5 items-center">
                            <span className="text-emerald-400 font-bold">{getSavingsDisplay(msg.analytics)}</span>
                          </div>
                        </motion.div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))
          )}

          {isTyping && (
            <div className="flex gap-5 w-full">
              <div className="flex-shrink-0 mt-1">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.15)] animate-pulse">
                  <Sparkles size={16} className="text-emerald-500" />
                </div>
              </div>
              <div className="flex-1 pt-0">
                <div className="bg-white/5 backdrop-blur-xl border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_4px_20px_rgba(0,0,0,0.1)] p-5 pt-4 pb-5 rounded-[24px] rounded-tl-[4px] inline-flex flex-col gap-3 min-w-[280px] min-h-[148px]">
                  {typingStep >= 0 && (
                    <motion.div initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 text-zinc-300 text-[13px] font-medium">
                      {typingStep > 0 ? <Check size={14} className="text-emerald-500 font-bold" /> : <div className="w-3.5 h-3.5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin shrink-0" />}
                      <span className={typingStep > 0 ? "text-zinc-500" : ""}>Classifying intent...</span>
                    </motion.div>
                  )}
                  {typingStep >= 1 && (
                    <motion.div initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 text-zinc-300 text-[13px] font-medium">
                      {typingStep > 1 ? <Check size={14} className="text-emerald-500 font-bold" /> : <div className="w-3.5 h-3.5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin shrink-0" />}
                      <span className={typingStep > 1 ? "text-zinc-500" : ""}>Analyzing complexity & cost...</span>
                    </motion.div>
                  )}
                  {typingStep >= 2 && (
                    <motion.div initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 text-zinc-300 text-[13px] font-medium">
                      {typingStep > 2 ? <Check size={14} className="text-emerald-500 font-bold" /> : <div className="w-3.5 h-3.5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin shrink-0" />}
                      Routing to optimal model...
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          )}
          <div className="h-1" aria-hidden="true" />
        </div>
      </div>

      <div
        className="fixed bottom-0 right-0 flex flex-col items-center pb-8 pt-12 px-8 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent pointer-events-none z-20"
        style={{
          width: `calc(100% - ${isSidebarCollapsed ? 72 : 280}px)`,
          transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        }}
      >
        <form className="w-full max-w-3xl relative pointer-events-auto" onSubmit={handleSend}>
          <div className="bg-white/5 backdrop-blur-2xl rounded-full flex items-center p-2 focus-within:ring-1 focus-within:ring-emerald-500/50 shadow-2xl border border-white/10 transition-colors">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (input.trim() && !isTyping) {
                    handleSend(e);
                  }
                }
              }}
              rows={1}
              readOnly={isTyping}
              placeholder="Message NexusAI... (Shift+Enter for new line)"
              className="flex-1 bg-transparent border-none focus:ring-0 px-6 py-3 text-slate-100 placeholder:text-slate-500 text-[15px] outline-none w-full resize-none min-h-[48px] max-h-40 overflow-y-auto leading-relaxed"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="w-12 h-12 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:shadow-none"
              style={{ transition: "transform 0.15s ease, all 0.2s ease" }}
              onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.95)")}
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <ArrowUp size={20} strokeWidth={3} />
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
