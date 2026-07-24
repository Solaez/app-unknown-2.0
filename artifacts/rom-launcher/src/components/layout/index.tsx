import React from 'react';
import Sidebar from './sidebar';
import Topbar from './topbar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-background text-foreground selection:bg-primary/30">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 bg-aurora relative z-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
}
