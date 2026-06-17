"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchThreads, createThread, Thread } from "@/lib/api";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface ChatContextType {
  threads: Thread[];
  activeThreadId: string | null;
  loadThread: (id: string) => void;
  startNewChat: () => void;
  refreshThreads: () => Promise<void>;
  displayName: string;
  initials: string;
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("User");
  const [initials, setInitials] = useState("U");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const currentUrlThread = pathname === "/chat" ? (searchParams?.get("thread") || null) : null;
  const [prevUrlThread, setPrevUrlThread] = useState<string | null>(currentUrlThread);

  if (currentUrlThread !== prevUrlThread) {
    setPrevUrlThread(currentUrlThread);
    setActiveThreadId(currentUrlThread);
  }

  useEffect(() => {
    const initData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const email = session.user.email || "User";
      const name = email.split('@')[0].replace(/[^a-zA-Z]/g, ' ');
      const dn = name.charAt(0).toUpperCase() + name.slice(1);
      setDisplayName(dn);
      setInitials(dn.substring(0, 2).toUpperCase());

      const fetchedThreads = await fetchThreads();
      setThreads(fetchedThreads);
    };
    initData();
  }, []);

  const refreshThreads = async () => {
    const fetchedThreads = await fetchThreads();
    setThreads(fetchedThreads);
  };

  const loadThread = (id: string) => {
    setActiveThreadId(id);
    if (pathname !== "/chat") {
      router.push(`/chat?thread=${id}`);
    } else {
      window.history.pushState(null, '', `/chat?thread=${id}`);
    }
  };

  const startNewChat = () => {
    setActiveThreadId(null);
    if (pathname !== "/chat") {
      router.push("/chat");
    } else {
      window.history.pushState(null, '', "/chat");
    }
  };

  return (
    <ChatContext.Provider value={{
      threads,
      activeThreadId,
      loadThread,
      startNewChat,
      refreshThreads,
      displayName,
      initials,
      isSidebarCollapsed,
      setSidebarCollapsed: setIsSidebarCollapsed
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
