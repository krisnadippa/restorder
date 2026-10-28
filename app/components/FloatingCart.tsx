"use client";

import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import { formatIDR } from '../../lib/utils';
import { usePathname } from 'next/navigation';

export default function FloatingCart() {
  const { itemCount, cartTotal } = useCart();
  const pathname = usePathname();

  // Don't show cart button on the cart/checkout page itself or admin pages
  if (itemCount === 0 || pathname === '/cart' || pathname.startsWith('/checkout') || pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.5rem',
      left: '0',
      right: '0',
      zIndex: 999,
      display: 'flex',
      justifyContent: 'center',
      padding: '0 1rem',
      pointerEvents: 'none'
    }}>
      <Link 
        id="floating-cart-btn"
        href="/cart" 
        style={{
          background: 'var(--primary)',
          color: 'white',
          padding: '1rem 1.5rem',
          borderRadius: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 8px 24px rgba(201, 42, 42, 0.4)',
          textDecoration: 'none',
          pointerEvents: 'auto',
          transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)' }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'none' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ 
            background: 'rgba(255,255,255,0.2)', 
            width: '28px', height: '28px', 
            borderRadius: '50%', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '0.9rem'
          }}>
            {itemCount}
          </div>
          <span style={{ fontWeight: 600 }}>Cek Keranjang</span>
        </div>
        <div style={{ fontWeight: 800 }}>
          {formatIDR(cartTotal)}
        </div>
      </Link>
    </div>
  );
}
