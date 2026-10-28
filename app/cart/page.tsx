"use client";

import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import { formatIDR } from '../../lib/utils';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, updateItemNote, cartTotal } = useCart();
  const router = useRouter();

  if (cart.length === 0) {
    return (
      <div className="mobile-px" style={{ padding: '2rem 1rem 4rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem' }}>
            <span>←</span> Kembali ke Menu
          </Link>
        </div>
        <div style={{ background: '#ffffff', borderRadius: '20px', padding: '3.5rem 1.5rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🛍️</div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Keranjang Masih Kosong</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.75rem', lineHeight: 1.5 }}>
            Anda belum memilih makanan atau minuman lezat dari menu kami.
          </p>
          <button onClick={() => router.push('/')} className="btn-primary" style={{ width: '100%', maxWidth: '260px' }}>
            Pesan Menu Sekarang ➔
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-px" style={{ padding: '1rem 1rem 2rem' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.88rem' }}>
          <span style={{ fontSize: '1.1rem' }}>←</span> Kembali ke Menu
        </Link>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#c92a2a', background: '#fff5f5', padding: '3px 10px', borderRadius: '12px' }}>
          {cart.reduce((sum, item) => sum + item.quantity, 0)} Item
        </span>
      </div>

      <h1 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '1.25rem', color: 'var(--text-main)', letterSpacing: '-0.3px' }}>
        Pesanan Anda 🛒
      </h1>
      
      <div className="cart-layout-responsive">
        
        {/* Item List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {cart.map(item => (
            <div 
              key={item.id} 
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '0.85rem',
                border: '1px solid var(--border-light)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}
            >
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {/* Image */}
                <div style={{ width: '70px', height: '70px', borderRadius: '12px', background: '#f5f1eb', overflow: 'hidden', flexShrink: 0 }}>
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#adb5bd' }}>No Img</div>
                  )}
                </div>

                {/* Details */}
                <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 2px 0', lineHeight: 1.25 }}>
                        {item.name}
                      </h4>
                      <span style={{ fontSize: '0.78rem', color: '#c92a2a', fontWeight: 700 }}>
                        {formatIDR(item.price)}
                      </span>
                    </div>
                    
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      style={{ color: '#adb5bd', background: 'none', padding: '0 4px', fontSize: '1.25rem', lineHeight: 1 }}
                      title="Hapus Item"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Quantity Stepper */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {formatIDR(item.price * item.quantity)}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#faf7f2', padding: '3px 8px', borderRadius: '20px', border: '1px solid var(--border)' }}>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'white', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                      >
                        -
                      </button>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, minWidth: '16px', textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#c92a2a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Special Note Input */}
              <div>
                <input
                  type="text"
                  placeholder="Catatan khusus (misal: pedas sedang, tanpa es...)"
                  value={item.note || ''}
                  onChange={(e) => updateItemNote(item.id, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: '#faf7f2',
                    fontSize: '0.78rem',
                    color: 'var(--text-main)',
                    fontFamily: 'inherit',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Order Payment Summary */}
        <div className="summary-sticky-desktop">
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '1.25rem',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)'
          }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-main)' }}>
            Ringkasan Tagihan
          </h3>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <span>Subtotal Menu</span>
            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{formatIDR(cartTotal)}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.85rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <span>Pajak Restoran (5%)</span>
            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{formatIDR(cartTotal * 0.05)}</span>
          </div>

          <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', display: 'block' }}>Total Pembayaran</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Termasuk pajak &amp; layanan</span>
            </div>
            <span style={{ fontSize: '1.35rem', fontWeight: 900, color: '#c92a2a', letterSpacing: '-0.3px' }}>
              {formatIDR(cartTotal * 1.05)}
            </span>
          </div>

          <button 
            onClick={() => router.push('/checkout')} 
            className="btn-primary" 
            style={{ width: '100%', marginTop: '1.25rem', padding: '0.95rem', fontSize: '1rem' }}
          >
            Lanjut ke Pembayaran ➔
          </button>
        </div>
      </div>

      </div>
    </div>
  );
}
