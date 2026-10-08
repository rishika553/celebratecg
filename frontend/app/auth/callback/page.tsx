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
  const [status, setStatus] = useState('Initializing...');
  const exchangeStarted = useRef(false);

  useEffect(() => {
    if (exchangeStarted.current) return;
    exchangeStarted.current = true;

    async function finishLogin() {
      if (!supabaseEnabled || !supabase) {
        setError('Google sign-in is not configured. SUPABASE_URL or PUBLISHABLE_KEY missing.');
        return;
      }

      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        const hashParams = new URLSearchParams(url.hash.replace('#', ''));
        const hashToken = hashParams.get('access_token');
        const errorParam = url.searchParams.get('error');
        const errorDesc = url.searchParams.get('error_description');

        if (errorParam) {
          throw new Error(`OAuth error: ${errorParam} - ${errorDesc || 'Unknown error'}`);
        }

        let accessToken: string | undefined;

        if (code) {
          setStatus('Exchanging authorization code...');
          const { data, error: exchangeError } = await supabase!.auth.exchangeCodeForSession(code);
          if (exchangeError) throw new Error(`Code exchange failed: ${exchangeError.message}`);
          accessToken = data.session?.access_token;
        } else if (hashToken) {
          setStatus('Reading session from redirect...');
          const { data, error: sessionError } = await supabase!.auth.getSession();
          if (sessionError) throw new Error(`Session read failed: ${sessionError.message}`);
          accessToken = data.session?.access_token;
        } else {
          setStatus('Waiting for auth session...');
          accessToken = await new Promise<string>((resolve, reject) => {
            const timeout = setTimeout(() => {
              sub.unsubscribe();
              reject(new Error('Timed out waiting for session. No code or token found in URL. Check Supabase redirect URL settings.'));
            }, 10000);
            const { data: { subscription: sub } } = supabase!.auth.onAuthStateChange((_event, session) => {
              if (session?.access_token) {
                clearTimeout(timeout);
                sub.unsubscribe();
                resolve(session.access_token);
              }
            });
          });
        }

        if (!accessToken) throw new Error('No access token received from Supabase.');

        setStatus('Signing in with CelebrateCG...');
        const storedRole = window.localStorage.getItem('celebratecg_oauth_role');
        const role = storedRole === 'vendor' ? 'vendor' : 'customer';
        const signup = window.localStorage.getItem('celebratecg_oauth_signup') === 'true';
        const adminOnly = window.localStorage.getItem('celebratecg_oauth_admin') === 'true';

        const signedIn = await api<User>('/auth/supabase', {
          method: 'POST',
          body: JSON.stringify({ access_token: accessToken, role, signup }),
        });

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

        setStatus('Redirecting to dashboard...');
        await refresh();
        router.replace('/dashboard');
      } catch (err) {
        setError((err as Error).message || 'Google sign-in failed.');
      }
    }
    void finishLogin();
  }, [refresh, router]);

  const needsSignup = error.toLowerCase().includes('create');

  return <main className="section empty-state auth-callback">
    <h1>{error ? 'Google sign-in failed' : 'Signing you in with Google...'}</h1>
    <p>{error || status}</p>
    {error && <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
      {needsSignup && <Link className="button button-primary" href="/signup">Create an account <ArrowRight size={16} /></Link>}
      <Link className={needsSignup ? 'button button-outline' : 'button button-primary'} href="/login">Back to sign in <ArrowRight size={16} /></Link>
    </div>}
  </main>;
}
