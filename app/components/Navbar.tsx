"use client";

import Link from 'next/link';
import { useCart } from '../../context/CartContext';

export default function Navbar() {
  const { itemCount } = useCart();

  return (
    <nav className="navbar">
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" className="nav-logo">
          GLORIOUS
        </Link>
        <div className="nav-links">
          <Link href="/" className="nav-link">Menu</Link>
          <Link href="/cart" className="nav-link">
            Cart {itemCount > 0 && <span style={{ background: 'var(--primary)', color: 'white', padding: '2px 8px', borderRadius: '12px', marginLeft: '4px', fontSize: '0.8rem' }}>{itemCount}</span>}
          </Link>
          <Link href="/admin/login" className="nav-link" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Admin</Link>
        </div>
      </div>
    </nav>
  );
}
