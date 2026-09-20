'use client';
import Link from 'next/link';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { useSession } from './session';
export default function Header() {
  const { user, health } = useSession();
  return <><header className="header"><Link href="/" className="brand"><span className="brand-icon"><Sparkles size={22} /></span>celebrate<span className="brand-cg">cg</span><span className="brand-dot">.</span></Link><nav aria-label="Main navigation"><Link href="/#venues">Find a venue</Link><Link href="/#categories" className="desktop-link">Categories</Link><Link href="/#cities" className="desktop-link extra-nav">Cities & map</Link><Link href="/#contact" className="desktop-link extra-nav">Contact</Link></nav><div className="header-actions"><Link className="desktop-link host-link" href={user?.role === 'vendor' ? '/dashboard' : '/signup?role=vendor'}>List your space <ArrowUpRight size={15} /></Link><Link className="button button-outline small" href={user ? '/dashboard' : '/login'}>{user ? 'My dashboard' : 'Sign in'}</Link></div></header>{health?.demo_mode && <div className="demo-bar">LOCAL PREVIEW <span>Explore sample venues. Reservations are unpaid until Razorpay is connected.</span></div>}</>;
}
