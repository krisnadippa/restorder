"use client";

import { useEffect, useState, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { formatIDR } from '../../../../lib/utils';
import Link from 'next/link';
import QRCode from 'qrcode';

export default function MockPaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/orders/${orderId}`)
      .then(res => res.json())
      .then(async data => {
        setOrder(data);
        setLoading(false);

        // Generate authentic EMVCo QRIS dummy payload string
        const totalAmount = Math.round(data.totalAmount * 1.05);
        const dummyPayload = `00020101021226590014ID.CO.QRIS.WWW0118936009990000000001021500000000000000052045812530336054${totalAmount}5802ID5919GLORIOUS RESTO CAFE6007JAKARTA6304${orderId.substring(0, 4).toUpperCase()}`;
        
        try {
          const url = await QRCode.toDataURL(dummyPayload, {
            width: 320,
            margin: 1,
            errorCorrectionLevel: 'M',
            color: {
              dark: '#111827',
              light: '#ffffff'
            }
          });
          setQrDataUrl(url);
        } catch (err) {
          console.error("QR Code generation error:", err);
        }
      })
      .catch(err => {
        console.error("Failed to load order:", err);
        setLoading(false);
      });
  }, [orderId]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyQRString = () => {
    if (!order) return;
    const totalAmount = Math.round(order.totalAmount * 1.05);
    const dummyPayload = `00020101021226590014ID.CO.QRIS.WWW0118936009990000000001021500000000000000052045812530336054${totalAmount}5802ID5919GLORIOUS RESTO CAFE6007JAKARTA6304${orderId.substring(0, 4).toUpperCase()}`;
    navigator.clipboard.writeText(dummyPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSimulatePayment = async () => {
    setPaying(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/pay`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PAID' })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Pembayaran gagal diproses");
      }
      
      setTimeout(() => {
        router.push(`/checkout/success/${orderId}`);
      }, 1200);
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Simulasi pembayaran gagal.");
      setPaying(false);
    }
  };

  if (loading) return (
    <div className="container" style={{ padding: '5rem 1rem', textAlign: 'center' }}>
      <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      <h2 style={{ marginTop: '1.5rem', color: 'var(--text-main)' }}>Menyiapkan QRIS Pembayaran...</h2>
      <style dangerouslySetInnerHTML={{__html: `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}} />
    </div>
  );

  if (!order) return (
    <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
      <h2>Pesanan tidak ditemukan.</h2>
      <Link href="/" className="btn-primary" style={{ display: 'inline-block', marginTop: '1rem' }}>Kembali ke Menu</Link>
    </div>
  );

  const totalBill = order.totalAmount * 1.05;

  return (
    <div className="mobile-px" style={{ padding: '1rem 1rem 3rem' }}>
      
      {/* Back button */}
      <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>←</span> Kembali ke Menu
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff3cd', color: '#856404', padding: '0.35rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>
          <span>⏱️ Batas Waktu:</span>
          <span style={{ fontFamily: 'monospace', fontSize: '0.95rem' }}>{formatTimer(timeLeft)}</span>
        </div>
      </div>

      {/* DUMMY QRIS STAND CARD */}
      <div 
        ref={cardRef}
        style={{ 
          background: '#ffffff', 
          borderRadius: '16px', 
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)', 
          overflow: 'hidden',
          border: '1px solid #e9ecef',
          animation: 'slideUp 0.3s ease-out'
        }}
      >
        {/* QRIS OFFICIAL HEADER BANNER */}
        <div style={{ 
          background: 'linear-gradient(135deg, #c92a2a 0%, #e03131 100%)', 
          color: '#ffffff', 
          padding: '1.25rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ 
                background: '#ffffff', 
                color: '#c92a2a', 
                fontWeight: 900, 
                fontSize: '1.15rem', 
                padding: '2px 8px', 
                borderRadius: '4px',
                letterSpacing: '1px'
              }}>
                QRIS
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', opacity: 0.95 }}>
                QR Standar Pembayaran Nasional
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', margin: '4px 0 0 0', opacity: 0.85 }}>Gerbang Pembayaran Indonesia (GPN)</p>
          </div>
          
          <div style={{ 
            background: 'rgba(255,255,255,0.2)', 
            padding: '4px 10px', 
            borderRadius: '6px', 
            fontSize: '0.75rem', 
            fontWeight: 800,
            letterSpacing: '1px'
          }}>
            GPN
          </div>
        </div>

        {/* MERCHANT DETAILS */}
        <div style={{ padding: '1.25rem 1.5rem 0.5rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.2rem', letterSpacing: '-0.3px' }}>
            GLORIOUS RESTO & CAFE
          </h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', fontSize: '0.78rem', color: '#6c757d', flexWrap: 'wrap' }}>
            <span>NMID: <strong>ID1020268899120</strong></span>
            <span>•</span>
            <span>A.O: <strong>MOCK-GATEWAY</strong></span>
            <span>•</span>
            <span>Ref: <strong>#{orderId.substring(0, 8).toUpperCase()}</strong></span>
          </div>
        </div>

        {/* QR CODE CONTAINER WITH AUTHENTIC BADGE */}
        <div style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
          <div style={{ 
            position: 'relative',
            display: 'inline-block', 
            padding: '1rem', 
            background: '#ffffff', 
            borderRadius: '16px', 
            border: '2px solid #e9ecef',
            boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
          }}>
            {qrDataUrl ? (
              <div style={{ position: 'relative', display: 'inline-block', lineHeight: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={qrDataUrl} 
                  alt="QRIS Payment Code" 
                  style={{ width: '260px', height: '260px', display: 'block', borderRadius: '8px' }} 
                />
                
                {/* Authentic QRIS Center Icon */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: '#ffffff',
                  border: '3px solid #c92a2a',
                  borderRadius: '8px',
                  padding: '4px 8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ fontWeight: 900, fontSize: '0.85rem', color: '#c92a2a', letterSpacing: '0.5px' }}>QRIS</span>
                </div>
              </div>
            ) : (
              <div style={{ width: '260px', height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa' }}>
                <span>Membuat QR Code...</span>
              </div>
            )}

            {/* Corner Markers decoration for authentic look */}
            <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: '#495057', fontWeight: 600 }}>
              Pindai QR ini dengan Aplikasi E-Wallet / Mobile Banking Anda
            </div>
          </div>
        </div>

        {/* BILL AMOUNT SUMMARY */}
        <div style={{ 
          background: '#f8f9fa', 
          margin: '0.5rem 1.5rem 1.5rem 1.5rem', 
          padding: '1.25rem', 
          borderRadius: '12px',
          border: '1px solid #e9ecef'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            <span>Pemesan: <strong style={{ color: 'var(--text-main)' }}>{order.customerName}</strong></span>
            <span>Meja/Alamat: <strong style={{ color: 'var(--text-main)' }}>{order.tableOrAddress}</strong></span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #ced4da', paddingTop: '0.75rem' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>Total Tagihan (Termasuk Pajak):</span>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.5px' }}>
              {formatIDR(totalBill)}
            </span>
          </div>
        </div>

        {/* SUPPORTED WALLETS LOGOS BAR */}
        <div style={{ padding: '0 1.5rem 1.25rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', color: '#868e96', marginBottom: '0.6rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Menerima Pembayaran Melalui
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            {['GoPay', 'OVO', 'DANA', 'ShopeePay', 'BCA Mobile', 'Livin Mandiri', 'BRImo', 'LinkAja'].map(wallet => (
              <span key={wallet} style={{
                background: '#ffffff',
                border: '1px solid #dee2e6',
                borderRadius: '6px',
                padding: '0.3rem 0.6rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#495057'
              }}>
                {wallet}
              </span>
            ))}
          </div>
        </div>

        {/* NOTICE: CLEAR DUMMY / SIMULATION BADGE */}
        <div style={{ 
          background: '#e7f5ff', 
          borderTop: '1px solid #d0ebff', 
          padding: '0.75rem 1.25rem',
          fontSize: '0.8rem',
          color: '#1864ab',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          lineHeight: 1.4
        }}>
          <span style={{ fontSize: '1.1rem' }}>ℹ️</span>
          <span>
            <strong>Mode Simulasi / Dummy QRIS:</strong> Ini adalah simulasi transaksi contoh. Anda dapat memindai QR (terisi data EMVCo) atau langsung klik tombol simulasi di bawah untuk menyelesaikan pesanan.
          </span>
        </div>

      </div>

      {/* ACTIONS */}
      <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <button
          onClick={handleSimulatePayment}
          disabled={paying}
          style={{
            width: '100%',
            padding: '1.1rem',
            background: paying ? '#74c0fc' : 'linear-gradient(135deg, #2b8a3e 0%, #2f9e44 100%)',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '1.05rem',
            border: 'none',
            borderRadius: '12px',
            boxShadow: '0 4px 14px rgba(43, 138, 62, 0.3)',
            cursor: paying ? 'wait' : 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          {paying ? (
            <>
              <div style={{ width: '18px', height: '18px', border: '3px solid white', borderTop: '3px solid transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
              <span>Memverifikasi Pembayaran...</span>
            </>
          ) : (
            <>
              <span>✅</span>
              <span>Simulasikan Pembayaran Berhasil</span>
            </>
          )}
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <button
            onClick={handleCopyQRString}
            style={{
              padding: '0.75rem 1rem',
              background: '#ffffff',
              border: '1px solid #ced4da',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#495057',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
          >
            <span>{copied ? '✓' : '📋'}</span>
            <span>{copied ? 'Tersalin!' : 'Salin String QRIS'}</span>
          </button>

          {qrDataUrl && (
            <a
              href={qrDataUrl}
              download={`QRIS-Glorious-${orderId.substring(0, 6)}.png`}
              style={{
                padding: '0.75rem 1rem',
                background: '#ffffff',
                border: '1px solid #ced4da',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#495057',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                textDecoration: 'none'
              }}
            >
              <span>📥</span>
              <span>Unduh QR Code</span>
            </a>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}} />

    </div>
  );
}
