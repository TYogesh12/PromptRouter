"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Thread } from "@/lib/api";
import {
  Zap,
  MessageSquare,
  LayoutDashboard,
  Coins,
  ChevronLeft,
  LogOut,
  Plus,
} from "lucide-react";

interface AppSidebarProps {
  displayName: string;
  initials: string;
  threads?: Thread[];
  activeThreadId?: string | null;
  onThreadSelect?: (id: string) => void;
  onNewChat?: () => void;
  onCollapseChange?: (collapsed: boolean) => void;
  isCollapsed?: boolean;
}

export default function AppSidebar({
  displayName,
  initials,
  threads,
  activeThreadId,
  onThreadSelect,
  onNewChat,
  onCollapseChange,
  isCollapsed: externalIsCollapsed
}: AppSidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const isCollapsed = externalIsCollapsed !== undefined ? externalIsCollapsed : internalCollapsed;

  const handleCollapseToggle = () => {
    const newValue = !isCollapsed;
    setInternalCollapsed(newValue);
    onCollapseChange?.(newValue);
  };
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const navItems = [
    { label: "Chat", icon: MessageSquare, href: "/" },
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Cost Savings", icon: Coins, href: "/cost-savings" },
  ];

  return (
    <aside
      className="relative h-screen flex flex-col z-40 bg-[#031723] backdrop-blur-3xl border-r border-white/5 overflow-hidden"
      style={{
        width: isCollapsed ? 72 : 280,
        transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        flexShrink: 0,
      }}
    >
      {/* Collapse toggle */}
      <div className="px-4 pt-3">
        <button
          onClick={handleCollapseToggle}
          className="flex items-center justify-center w-8 h-8 text-slate-400 hover:text-emerald-400 rounded-md hover:bg-white/5"
        >
          <ChevronLeft
            size={16}
            style={{
              transform: isCollapsed ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        </button>
      </div>

      {/* Brand */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-1 overflow-hidden">
        <div className="w-8 h-8 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 rounded-xl flex-shrink-0 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.15)] text-emerald-500">
          <Zap size={16} />
        </div>
        <div
          className="flex-1 min-w-0 overflow-hidden whitespace-nowrap"
          style={{ opacity: isCollapsed ? 0 : 1, transition: "opacity 0.2s ease" }}
        >
          <h1 className="text-lg font-bold tracking-tighter text-slate-100 font-headline">
            NexusAI
          </h1>
          <p className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold opacity-70">
            The Digital Curator
          </p>
        </div>
      </div>

      {/* Navigation - Pinned */}
      <nav className="px-3 space-y-1 mt-4">
        {navItems.map(({ label, icon: Icon, href }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-headline font-semibold text-sm overflow-hidden whitespace-nowrap transition-all duration-200 border-l-2 ${isActive
                ? "border-emerald-500 bg-white/5 text-emerald-500"
                : "border-transparent text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
            >
              <Icon size={18} className="flex-shrink-0" />
              <span
                style={{ opacity: isCollapsed ? 0 : 1, transition: "opacity 0.2s ease" }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Recent History */}
      {threads && (
        <div
          className="flex-1 flex flex-col mt-1 min-h-0"
          style={{
            maxHeight: isCollapsed ? 0 : 1000,
            opacity: isCollapsed ? 0 : 1,
            transition: "max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease"
          }}
        >
          {/* New Chat - Pinned above scroll */}
          <div className="pb-1 px-3 flex-shrink-0">
            <button onClick={onNewChat} className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-emerald-400 hover:bg-white/5 border-l-2 border-transparent rounded-[10px] font-headline font-semibold text-sm overflow-hidden whitespace-nowrap transition-colors">
              <Plus size={18} className="flex-shrink-0" />
              <span className="truncate">New Chat</span>
            </button>
          </div>

          <div className="pt-3 pb-3 flex-shrink-0">
            <p className="px-5 text-[11px] font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap">Your Chats</p>
          </div>

          {/* Actual Scrollable Threads Area */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-0.5 px-2 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {threads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => onThreadSelect?.(thread.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-headline font-medium text-[13px] overflow-hidden transition-all duration-200 border-l-2 ${activeThreadId === thread.id ? 'bg-white/5 border-emerald-500 text-emerald-500' : 'border-transparent text-zinc-500 hover:text-white hover:bg-white/5'}`}
              >
                <span className="truncate w-full text-left">{thread.title}</span>
              </button>
            ))}
            {threads.length === 0 && (
              <p className="px-4 py-2 text-xs text-slate-500">No chats yet</p>
            )}
          </div>
        </div>
      )}

      {/* User profile */}
      <div className="px-3 pb-4 mt-auto pt-4">
        <div className="flex flex-col items-center gap-2 py-3 px-2 overflow-hidden">
          <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700/50 text-slate-400 font-bold flex flex-shrink-0 items-center justify-center text-xs shadow-sm">
            {initials}
          </div>
          <div
            className="w-full text-center overflow-hidden whitespace-nowrap"
            style={{
              maxHeight: isCollapsed ? 0 : 40,
              opacity: isCollapsed ? 0 : 1,
              transition: "max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease",
            }}
          >
            <p className="text-[12px] font-bold text-slate-300 truncate">{displayName}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-slate-500 hover:text-red-400 transition-colors p-1.5 hover:bg-white/5 rounded-md"
            title="Logout"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
