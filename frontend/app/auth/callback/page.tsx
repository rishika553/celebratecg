'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { api, User } from '@/lib/api';
import { supabase, supabaseEnabled } from '@/lib/supabase';
import { useSession } from '@/components/session';

export default function SupabaseCallbackPage() {
  const router = useRouter();
  const { refresh } = useSession();
  const [error, setError] = useState('');
  const exchangeStarted = useRef(false);

  useEffect(() => {
    if (exchangeStarted.current) return;
    exchangeStarted.current = true;
    async function finishLogin() {
      if (!supabaseEnabled || !supabase) {
        setError('Google sign-in is not configured yet.');
        return;
      }
      try {
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        const accessToken = data.session?.access_token;
        if (!accessToken) throw new Error('Supabase did not return a sign-in session.');
        const storedRole = window.localStorage.getItem('celebratecg_oauth_role');
        const role = storedRole === 'vendor' ? 'vendor' : 'customer';
        const signup = window.localStorage.getItem('celebratecg_oauth_signup') === 'true';
        const adminOnly = window.localStorage.getItem('celebratecg_oauth_admin') === 'true';
        const signedIn = await api<User>('/auth/supabase', { method: 'POST', body: JSON.stringify({ access_token: accessToken, role, signup }) });
        window.localStorage.removeItem('celebratecg_oauth_role');
        window.localStorage.removeItem('celebratecg_oauth_signup');
        window.localStorage.removeItem('celebratecg_oauth_admin');
        if (adminOnly && signedIn.role !== 'admin') {
          await api('/auth/logout', { method: 'POST' });
          throw new Error('This sign-in page is restricted to platform administrators.');
        }
        if (!signup && !adminOnly && signedIn.role === 'admin') {
          await api('/auth/logout', { method: 'POST' });
          throw new Error('Administrators must sign in through the admin portal.');
        }
        await refresh();
        router.replace('/dashboard');
      } catch (err) {
        setError((err as Error).message || 'Google sign-in failed. Please try again.');
      }
    }
    void finishLogin();
  }, [refresh, router]);

  return <main className="section empty-state auth-callback"><h1>{error ? 'Google sign-in needs attention.' : 'Signing you in with Google…'}</h1><p>{error || 'Please wait while we finish your CelebrateCG session.'}</p>{error && <Link className="button button-primary" href="/login">Back to sign in <ArrowRight size={16} /></Link>}</main>;
}
