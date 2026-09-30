'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import CelebrationMark from '@/components/celebration-mark';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { supabase, supabaseEnabled } from '@/lib/supabase';
import { useSession } from './session';

export default function AuthForm({ signup = false }: { signup?: boolean }) {
  const router = useRouter();
  const { refresh } = useSession();
  const [role, setRole] = useState<'customer' | 'vendor'>('customer');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('role') === 'vendor') setRole('vendor');
  }, []);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const values = Object.fromEntries(new FormData(e.currentTarget));
    try {
      await api(signup ? '/auth/signup' : '/auth/login', { method: 'POST', body: JSON.stringify(signup ? { ...values, role } : values) });
      await refresh();
      router.push('/dashboard');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function signInWithGoogle() {
    setError('');
    if (!supabaseEnabled || !supabase) {
      setError('Google sign-in is not configured yet. Add your Supabase URL and anon key first.');
      return;
    }
    setGoogleBusy(true);
    try {
      window.localStorage.setItem('celebratecg_oauth_role', signup ? role : 'customer');
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (oauthError) throw oauthError;
    } catch (e) {
      setError((e as Error).message);
      setGoogleBusy(false);
    }
  }

  return <main className="auth-page"><div className="auth-story"><CelebrationMark size={48} /><span className="eyebrow">A LITTLE CLOSER TO A GREAT MEMORY</span><h1>Good people.<br />Great places.<br /><em>Your next chapter.</em></h1><p>Your corner of Chhattisgarh’s celebrations.</p></div><div className="auth-card"><span className="eyebrow">{signup ? 'LET’S MAKE SOMETHING MEMORABLE' : 'GOOD TO SEE YOU AGAIN'}</span><h2>{signup ? 'Make yourself at home.' : 'Welcome back.'}</h2><p className="muted">{signup ? 'Find your next venue, or share a space of your own.' : 'Sign in to keep your celebration moving.'}</p><button type="button" className="button google-button full" onClick={() => void signInWithGoogle()} disabled={googleBusy || busy}>{googleBusy ? 'Opening Google…' : signup ? 'Continue with Google' : 'Sign in with Google'}</button><div className="auth-divider"><span>or</span></div><form onSubmit={submit}>{signup && <><label>Your name<input name="name" autoComplete="name" minLength={2} maxLength={150} required placeholder="Your full name" /></label><fieldset className="role-picker"><legend>I’m here to</legend><button type="button" className={role === 'customer' ? 'active' : ''} onClick={() => setRole('customer')}>Plan a celebration</button><button type="button" className={role === 'vendor' ? 'active' : ''} onClick={() => setRole('vendor')}>List my space</button></fieldset></>}<label>Email address<input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></label><label>Password<input name="password" type="password" autoComplete={signup ? 'new-password' : 'current-password'} minLength={signup ? 10 : 1} maxLength={128} required placeholder={signup ? 'At least 10 characters' : 'Your password'} /></label>{signup && role === 'vendor' && <p className="form-note">Our team reviews host accounts before you can add a venue.</p>}{error && <p className="error-message" role="alert">{error}</p>}<button className="button button-primary full" disabled={busy || googleBusy}>{busy ? 'Just a moment…' : signup ? 'Create account' : 'Sign in'}<ArrowRight size={17} /></button></form><p className="auth-switch">{signup ? 'Already part of the celebration?' : 'New around here?'} <Link href={signup ? '/login' : '/signup'}>{signup ? 'Sign in' : 'Create an account'}</Link></p></div></main>;
}
