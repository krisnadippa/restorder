"use client";

import { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useRouter } from 'next/navigation';
import { formatIDR } from '../../lib/utils';
import Link from 'next/link';

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const router = useRouter();
  
  const [customerName, setCustomerName] = useState('');
  const [tableOrAddress, setTableOrAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'QRIS' | 'BANK_TRANSFER' | 'EWALLET'>('QRIS');
  const [orderType, setOrderType] = useState<'DINE_IN' | 'TAKEAWAY'>('DINE_IN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (cart.length === 0 && !loading) {
      router.push('/cart');
    }
  }, [cart.length, loading, router]);

  if (cart.length === 0 && !loading) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const items = cart.map(item => ({
        menuItemId: item.id,
        quantity: item.quantity,
        price: item.price,
        note: item.note
      }));

      const locationDetails = orderType === 'DINE_IN' 
        ? `[Dine-In] ${tableOrAddress}` 
        : `[Takeaway] ${tableOrAddress}`;

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          tableOrAddress: locationDetails,
          notes,
          items
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Gagal mengirim pesanan');
      }

      const order = await response.json();
      clearCart();
      
      if (paymentMethod !== 'CASH') {
        if (order.invoiceUrl) {
          window.location.href = order.invoiceUrl;
        } else {
          router.push(`/checkout/payment/${order.id}`);
        }
      } else {
        router.push(`/checkout/success/${order.id}`);
      }

    } catch (err) {
      console.error(err);
      setError('Terjadi kendala saat memproses pesanan. Silakan coba lagi.');
      setLoading(false);
    }
  };

  const totalBill = cartTotal * 1.05;

  return (
    <div className="mobile-px" style={{ padding: '1rem 1rem 2.5rem' }}>
      
      {/* Top Navigation */}
      <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/cart" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.88rem' }}>
          <span>←</span> Keranjang
        </Link>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Langkah 2 dari 2</span>
      </div>

      <h1 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '1.25rem', color: 'var(--text-main)', letterSpacing: '-0.3px' }}>
        Konfirmasi Pesanan 📝
      </h1>
      
      {error && (
        <div style={{ background: '#ffe3e3', color: '#c92a2a', padding: '0.85rem 1rem', borderRadius: '12px', marginBottom: '1rem', border: '1px solid #ffc9c9', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="checkout-layout-responsive">
        
        {/* Left Column: Order details & Payment */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Tipe Pemesanan: Dine In vs Takeaway */}
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1.1rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.65rem' }}>
            Tipe Layanan
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
            <button
              type="button"
              onClick={() => setOrderType('DINE_IN')}
              style={{
                padding: '0.75rem',
                borderRadius: '12px',
                border: '1.5px solid',
                borderColor: orderType === 'DINE_IN' ? '#c92a2a' : 'var(--border)',
                background: orderType === 'DINE_IN' ? '#fff5f5' : '#faf7f2',
                color: orderType === 'DINE_IN' ? '#c92a2a' : 'var(--text-main)',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem'
              }}
            >
              <span>🍽️</span> Makan di Tempat (Dine-In)
            </button>

            <button
              type="button"
              onClick={() => setOrderType('TAKEAWAY')}
              style={{
                padding: '0.75rem',
                borderRadius: '12px',
                border: '1.5px solid',
                borderColor: orderType === 'TAKEAWAY' ? '#c92a2a' : 'var(--border)',
                background: orderType === 'TAKEAWAY' ? '#fff5f5' : '#faf7f2',
                color: orderType === 'TAKEAWAY' ? '#c92a2a' : 'var(--text-main)',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem'
              }}
            >
              <span>🥡</span> Bawa Pulang (Takeaway)
            </button>
          </div>
        </div>

        {/* Informasi Pemesan Card */}
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1.25rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
            Data Pemesan
          </h3>

          <div>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-main)' }}>
              Nama Pemesan *
            </label>
            <input 
              type="text" 
              className="input-field" 
              required 
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              placeholder="Contoh: Budi Santoso"
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-main)' }}>
              {orderType === 'DINE_IN' ? 'Nomor Meja *' : 'Alamat Pengantaran / No. HP *'}
            </label>
            <input 
              type="text" 
              className="input-field" 
              required 
              value={tableOrAddress}
              onChange={e => setTableOrAddress(e.target.value)}
              placeholder={orderType === 'DINE_IN' ? 'Contoh: Meja 08' : 'Contoh: 08123456789 (Ambil di Kasir)'}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-main)' }}>
              Catatan Pesanan (Opsional)
            </label>
            <textarea 
              className="input-field" 
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Misal: Jangan terlalu pedas, saus dipisah..."
            />
          </div>
        </div>

        {/* Metode Pembayaran Card */}
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1.25rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Metode Pembayaran
            </h3>
            <span style={{ fontSize: '0.72rem', color: '#2b8a3e', background: '#d3f9d8', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
              Instan &amp; Aman
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            
            {/* QRIS OPTION (RECOMMENDED) */}
            <div 
              onClick={() => setPaymentMethod('QRIS')}
              style={{
                border: '2px solid',
                borderColor: paymentMethod === 'QRIS' ? '#c92a2a' : 'var(--border)',
                background: paymentMethod === 'QRIS' ? '#fff5f5' : '#ffffff',
                borderRadius: '12px',
                padding: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid', borderColor: paymentMethod === 'QRIS' ? '#c92a2a' : '#adb5bd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {paymentMethod === 'QRIS' && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#c92a2a' }} />}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>QRIS (Semua E-Wallet &amp; M-Banking)</strong>
                    <span style={{ background: '#c92a2a', color: 'white', fontSize: '0.62rem', fontWeight: 800, padding: '1px 6px', borderRadius: '6px' }}>REKOMENDASI</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>GoPay, OVO, DANA, ShopeePay, BCA, Livin, BRImo</span>
                </div>
              </div>
              <span style={{ fontSize: '1.2rem' }}>📱</span>
            </div>

            {/* CASH OPTION */}
            <div 
              onClick={() => setPaymentMethod('CASH')}
              style={{
                border: '1.5px solid',
                borderColor: paymentMethod === 'CASH' ? '#c92a2a' : 'var(--border)',
                background: paymentMethod === 'CASH' ? '#fff5f5' : '#ffffff',
                borderRadius: '12px',
                padding: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid', borderColor: paymentMethod === 'CASH' ? '#c92a2a' : '#adb5bd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {paymentMethod === 'CASH' && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#c92a2a' }} />}
                </div>
                <div>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Bayar di Kasir (Tunai / EDC)</strong>
                  <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)' }}>Lakukan pembayaran langsung ke kasir</span>
                </div>
              </div>
              <span style={{ fontSize: '1.2rem' }}>💵</span>
            </div>

          </div>
        </div>
      </div>

      {/* Right Column: Sticky Summary Card (on desktop/iPad) */}
      <div className="summary-sticky-desktop">
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1.25rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.85rem', color: 'var(--text-main)' }}>
            Ringkasan Item
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.85rem' }}>
            {cart.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>{item.quantity}x {item.name}</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{formatIDR(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)', display: 'block' }}>Total Bayar:</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Sudah termasuk pajak 5%</span>
            </div>
            <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#c92a2a', letterSpacing: '-0.3px' }}>
              {formatIDR(totalBill)}
            </span>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading} 
            style={{ width: '100%', marginTop: '1.25rem', padding: '1rem', fontSize: '1.05rem' }}
          >
            {loading ? 'Memproses Pesanan...' : `Konfirmasi & Bayar • ${formatIDR(totalBill)}`}
          </button>
        </div>
      </div>

      </form>
    </div>
  );
}
