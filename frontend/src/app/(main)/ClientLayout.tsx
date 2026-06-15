"use client";

import { Suspense } from "react";
import { ChatProvider, useChat } from "@/lib/ChatContext";
import AppSidebar from "@/components/AppSidebar";
import AuroraBg from "@/components/AuroraBg";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { 
    displayName, 
    initials, 
    threads, 
    activeThreadId, 
    loadThread, 
    startNewChat,
    isSidebarCollapsed,
    setSidebarCollapsed
  } = useChat();

  return (
    <div className="bg-slate-950 min-h-screen text-slate-200 flex overflow-hidden">
      <AppSidebar 
        displayName={displayName} 
        initials={initials} 
        threads={threads} 
        activeThreadId={activeThreadId} 
        onThreadSelect={loadThread} 
        onNewChat={startNewChat} 
        onCollapseChange={setSidebarCollapsed}
      />
      <main className="flex-1 flex flex-col relative h-screen w-full min-w-0 bg-slate-950 overflow-hidden">
        {/* We keep AuroraBg here so the background stays steady across route transitions */}
        <AuroraBg />
        {/* Render child pages seamlessly */}
        {children}
      </main>
    </div>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <ChatProvider>
        <LayoutContent>{children}</LayoutContent>
      </ChatProvider>
    </Suspense>
  );
}
