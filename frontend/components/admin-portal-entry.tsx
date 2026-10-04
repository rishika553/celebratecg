'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthForm from '@/components/auth-form';
import { useSession } from '@/components/session';

export default function AdminPortalEntry() {
  const router = useRouter();
  const { user, loading } = useSession();

  useEffect(() => {
    if (user?.role === 'admin') router.replace('/dashboard');
  }, [router, user]);

  if (loading || user?.role === 'admin') {
    return <main className="section loading-page">Opening the admin portal…</main>;
  }
  return <AuthForm adminOnly />;
}
