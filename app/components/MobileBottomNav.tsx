"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '../../context/CartContext';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { itemCount } = useCart();

  // Hide on admin routes
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const isActive = (path: string) => pathname === path;

  return (
    <nav 
      className="mobile-bottom-nav"
      aria-label="Mobile Navigation"
      style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '480px',
        height: '74px',
        background: '#ffffff',
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px',
        boxShadow: '0 -6px 25px rgba(0, 0, 0, 0.07)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '0 0.5rem',
        zIndex: 990,
        borderTop: '1px solid rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* 1. HOME */}
      <Link 
        href="/" 
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '3px',
          width: '58px',
          textDecoration: 'none',
          color: isActive('/') ? '#c92a2a' : '#8c8e90',
          transition: 'color 0.2s',
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill={isActive('/') ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        <span style={{ fontSize: '0.68rem', fontWeight: isActive('/') ? 700 : 500 }}>Home</span>
      </Link>

      {/* 2. MENU */}
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
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '3px',
          width: '58px',
          textDecoration: 'none',
          color: '#8c8e90',
          transition: 'color 0.2s',
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
        </svg>
        <span style={{ fontSize: '0.68rem', fontWeight: 500 }}>Menu</span>
      </Link>

      {/* 3. CENTER ELEVATED CART BUTTON (KFC STYLE) */}
      <Link 
        id="floating-cart-btn"
        href="/cart"
        style={{
          position: 'relative',
          top: '-14px',
          width: '58px',
          height: '58px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #e03131 0%, #c92a2a 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          boxShadow: '0 8px 20px rgba(201, 42, 42, 0.45)',
          border: '4px solid #ffffff',
          textDecoration: 'none',
          transition: 'transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}
        onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.92)'; }}
        onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        onTouchStart={(e) => { e.currentTarget.style.transform = 'scale(0.92)'; }}
        onTouchEnd={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>

        {/* Counter Badge */}
        {itemCount > 0 && (
          <div style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            background: '#ffd43b',
            color: '#111827',
            minWidth: '20px',
            height: '20px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.72rem',
            fontWeight: 800,
            padding: '0 4px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            border: '2px solid #ffffff',
          }}>
            {itemCount}
          </div>
        )}
      </Link>

      {/* 4. PROMO / OFFERS */}
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
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '3px',
          width: '58px',
          textDecoration: 'none',
          color: '#8c8e90',
          transition: 'color 0.2s',
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 12 20 22 4 22 4 12" />
          <rect x="2" y="7" width="20" height="5" />
          <line x1="12" y1="22" x2="12" y2="7" />
          <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
          <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
        </svg>
        <span style={{ fontSize: '0.68rem', fontWeight: 500 }}>Promo</span>
      </a>

      {/* 5. ADMIN / LOGIN */}
      <Link 
        href="/admin/login" 
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '3px',
          width: '58px',
          textDecoration: 'none',
          color: isActive('/admin/login') ? '#c92a2a' : '#8c8e90',
          transition: 'color 0.2s',
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span style={{ fontSize: '0.68rem', fontWeight: 500 }}>Admin</span>
      </Link>
    </nav>
  );
}
