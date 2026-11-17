import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@/types';
import { authService } from '@/services/api';
import { KEYS, storage } from '@/services/storage';

interface AuthCtx {
  user: User | null;
  isAuthed: boolean;
  logout: () => void;
}

const Ctx = createContext<AuthCtx>({ user: null, isAuthed: false, logout: () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => authService.current());
  useEffect(() => {
    const sync = () => setUser(authService.current());
    const a = storage.subscribe(KEYS.session, sync);
    const b = storage.subscribe(KEYS.users, sync);
    return () => {
      a();
      b();
    };
  }, []);
  return <Ctx.Provider value={{ user, isAuthed: !!user, logout: authService.logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
