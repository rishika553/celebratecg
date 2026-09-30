'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { supabase, supabaseEnabled } from '@/lib/supabase';
import { useSession } from '@/components/session';

export default function SupabaseCallbackPage() {
  const router = useRouter();
  const { refresh } = useSession();
  const [error, setError] = useState('');

  useEffect(() => {
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
        await api('/auth/supabase', { method: 'POST', body: JSON.stringify({ access_token: accessToken, role }) });
        window.localStorage.removeItem('celebratecg_oauth_role');
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
