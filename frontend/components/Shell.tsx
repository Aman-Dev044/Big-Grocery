'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import LoginModal from './LoginModal';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const LoginPromptContext = createContext<() => void>(() => {});

/** Lets any page open the shared login dialog, e.g. the Import button. */
export function useLoginPrompt() {
  return useContext(LoginPromptContext);
}

/**
 * Holds the login dialog so the top bar ("Admin Login"), the sidebar's locked
 * "Upload" entry and page-level buttons all open the same one.
 */
export default function Shell({ children }: { children: ReactNode }) {
  const [loginOpen, setLoginOpen] = useState(false);
  const open = useCallback(() => setLoginOpen(true), []);
  const value = useMemo(() => open, [open]);

  return (
    <LoginPromptContext.Provider value={value}>
      <div className="flex min-h-screen">
        <Sidebar onRequestLogin={open} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar onRequestLogin={open} />
          <main className="flex-1 px-6 py-6">{children}</main>
        </div>
        <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      </div>
    </LoginPromptContext.Provider>
  );
}
