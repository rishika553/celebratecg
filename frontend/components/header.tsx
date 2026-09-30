'use client';
import Link from 'next/link';
import CelebrationMark from '@/components/celebration-mark';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useSession } from './session';
export default function Header() {
  const { user } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  return <header className={`header ${menuOpen ? 'menu-open' : ''}`}>
    <Link href="/" className="brand" onClick={closeMenu}><span className="brand-icon"><CelebrationMark size={28} /></span>celebrate<span className="brand-cg">cg</span><span className="brand-dot">.</span></Link>
    <nav className="main-nav" aria-label="Main navigation">
      <Link href="/" onClick={closeMenu}>Home</Link>
      <Link href="/find-venue" onClick={closeMenu}>Find a venue</Link>
      <Link href="/categories" onClick={closeMenu}>Categories</Link>
      <Link href="/#services" onClick={closeMenu}>Services</Link>
      <Link href="/cities" onClick={closeMenu}>Cities &amp; map</Link>
      <Link href="/contact" onClick={closeMenu}>Contact</Link>
      <Link href={user?.role === 'vendor' ? '/dashboard' : '/signup?role=vendor'} className="mobile-nav-link" onClick={closeMenu}>List your space <ArrowUpRight size={15} /></Link>
      <Link href="/terms" className="mobile-nav-link" onClick={closeMenu}>Terms &amp; Conditions</Link>
      <Link href="/privacy" className="mobile-nav-link" onClick={closeMenu}>Privacy Policy</Link>
    </nav>
    <div className="header-actions">
      <Link className="host-link" href={user?.role === 'vendor' ? '/dashboard' : '/signup?role=vendor'}>List your space <ArrowUpRight size={15} /></Link>
      <Link className="button button-outline small account-link" href={user ? '/dashboard' : '/login'}>{user ? 'My dashboard' : 'Sign in'}</Link>
      <button className="mobile-menu-button" type="button" aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(open => !open)}>{menuOpen ? <X size={21} /> : <Menu size={21} />}</button>
    </div>
  </header>;
}
