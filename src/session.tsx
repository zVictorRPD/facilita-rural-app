import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, clearSession, hasSession, logout } from "./api";

export type Account = {
  id: number;
  name: string;
  email: string;
  avatar: string;
  emailVerified: boolean;
};

const SessionContext = createContext<{
  user: Account | null;
  ready: boolean;
  refreshUser: () => Promise<void>;
  setUser: (user: Account | null) => void;
  signOut: () => Promise<void>;
}>({
  user: null,
  ready: false,
  refreshUser: async () => undefined,
  setUser: () => undefined,
  signOut: async () => undefined,
});

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Account | null>(null);
  const [ready, setReady] = useState(false);

  const refreshUser = async () => {
    const account = await api<Account>("/me");
    setUser(account);
  };

  useEffect(() => {
    hasSession()
      .then((signed) => (signed ? refreshUser() : null))
      .catch(() => clearSession())
      .finally(() => setReady(true));
  }, []);

  const signOut = async () => {
    await logout();
    setUser(null);
  };

  return (
    <SessionContext.Provider value={{ user, ready, refreshUser, setUser, signOut }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
