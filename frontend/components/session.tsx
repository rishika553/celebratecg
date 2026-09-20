'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { api, Health, User } from '@/lib/api';

const Context = createContext<{ user: User | null; loading: boolean; health: Health | null; refresh: () => Promise<void> }>({ user: null, loading: true, health: null, refresh: async () => {} });
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState<Health | null>(null);
  async function refresh() { try { setUser(await api<User>('/auth/me')); } catch { setUser(null); } finally { setLoading(false); } }
  useEffect(() => { void refresh(); api<Health>('/health').then(setHealth).catch(() => {}); }, []);
  return <Context.Provider value={{ user, loading, health, refresh }}>{children}</Context.Provider>;
}
export const useSession = () => useContext(Context);
