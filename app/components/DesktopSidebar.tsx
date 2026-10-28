"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { formatIDR } from '../../lib/utils';

export default function DesktopSidebar() {
  const pathname = usePathname();
  const { itemCount, cartTotal } = useCart();

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="desktop-sidebar">
      {/* Brand Header */}
      <div style={{ padding: '1.75rem 1.5rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 900,
            fontSize: '1.4rem',
            boxShadow: '0 4px 12px rgba(201, 42, 42, 0.35)',
            flexShrink: 0
          }}>
            G
          </div>
          <div>
            <span style={{ fontSize: '1.35rem', fontWeight: 900, color: '#c92a2a', letterSpacing: '-0.5px', lineHeight: 1 }}>
              GLORIOUS
            </span>
            <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.3px', marginTop: '2px' }}>
              Resto &amp; Culinary Experience
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav style={{ padding: '1.25rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', flexGrow: 1 }}>
        
        {/* Home */}
        <Link 
          href="/" 
          className={`sidebar-nav-item ${isActive('/') ? 'active' : ''}`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill={isActive('/') ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span>Beranda (Home)</span>
        </Link>

        {/* Menu Section */}
        <Link 
          href="/"
          onClick={(e) => {
            if (pathname === '/') {
              const el = document.getElementById('menu-section');
              if (el) {
                e.preventDefault();
                el.scrollIntoView({ behavior: 'smooth' });
              }
            }
          }}
          className="sidebar-nav-item"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
          </svg>
          <span>Daftar Menu</span>
        </Link>

        {/* Promo Section */}
        <a 
          href="#promo-section"
          onClick={(e) => {
            if (pathname === '/') {
              const el = document.getElementById('promo-section');
              if (el) {
                e.preventDefault();
                el.scrollIntoView({ behavior: 'smooth' });
              }
            }
          }}
          className="sidebar-nav-item"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 12 20 22 4 22 4 12" />
            <rect x="2" y="7" width="20" height="5" />
            <line x1="12" y1="22" x2="12" y2="7" />
            <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
            <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
          </svg>
          <span>Promo Spesial</span>
        </a>

        {/* Cart */}
        <Link 
          href="/cart" 
          className={`sidebar-nav-item ${isActive('/cart') ? 'active' : ''}`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <span style={{ flexGrow: 1 }}>Keranjang Belanja</span>
          {itemCount > 0 && (
            <span style={{
              background: '#c92a2a',
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '12px',
            }}>
              {itemCount}
            </span>
          )}
        </Link>

        {/* Admin Login */}
        <Link 
          href="/admin/login" 
          className={`sidebar-nav-item ${isActive('/admin/login') ? 'active' : ''}`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>Portal Admin</span>
        </Link>
      </nav>

      {/* Cart Quick Summary Widget (when items in cart) */}
      {itemCount > 0 && pathname !== '/cart' && !pathname.startsWith('/checkout') && (
        <div style={{ padding: '0 1rem 1rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #fff5f5 0%, #ffe3e3 100%)',
            border: '1px solid #ffc9c9',
            borderRadius: '14px',
            padding: '1rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.78rem', color: '#c92a2a', fontWeight: 800 }}>KERANJANG ANDA</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#495057' }}>{itemCount} Menu</span>
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '0.75rem' }}>
              {formatIDR(cartTotal)}
            </div>
            <Link 
              href="/checkout"
              className="btn-primary"
              style={{ width: '100%', padding: '0.65rem', fontSize: '0.85rem' }}
            >
              Checkout Sekarang ➔
            </Link>
          </div>
        </div>
      )}

      {/* Restaurant Information Card */}
      <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', background: 'var(--surface-alt)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <span style={{ fontSize: '0.85rem' }}>🕒</span>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)' }}>Jam Buka: 10.00 - 22.00</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem' }}>📍</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Makan di Tempat &amp; Bawa Pulang</span>
        </div>
        <a 
          href="https://wa.me/"
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            padding: '0.5rem',
            borderRadius: '8px',
            background: '#ffffff',
            border: '1px solid var(--border)',
            fontSize: '0.78rem',
            fontWeight: 700,
            color: '#2b8a3e',
            textDecoration: 'none'
          }}
        >
          <span>💬</span> Chat / Panggil Pelayan
        </a>
      </div>
    </aside>
  );
}
