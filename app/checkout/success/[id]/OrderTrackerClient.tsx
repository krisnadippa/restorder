"use client";

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

// Order Tracker Component for Mobile and Desktop
export default function OrderTrackerClient({ orderId }: { orderId: string }) {
  const [status, setStatus] = useState<string>("New Order");
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial fetch
    fetchOrderStatus();

    // Poll every 5 seconds for updates
    const interval = setInterval(fetchOrderStatus, 5000);
    return () => clearInterval(interval);
  }, [orderId]);

  const fetchOrderStatus = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (!res.ok) return;
      const data = await res.json();
      setStatus(data.status);
      setOrderData(data);
      setLoading(false);
    } catch (err) {
      console.error("Gagal mendapatkan status", err);
    }
  };

  const downloadInvoicePDF = async () => {
    if (!invoiceRef.current || !orderData) return;
    
    // Dynamically import to prevent SSR issues
    const html2canvas = (await import('html2canvas')).default;
    const jsPDF = (await import('jspdf')).default;

    try {
      // Temporarily show the invoice for canvas capture
      const originalDisplay = invoiceRef.current.style.display;
      invoiceRef.current.style.display = 'block';
      invoiceRef.current.style.position = 'absolute';
      invoiceRef.current.style.top = '-9999px';
      invoiceRef.current.style.left = '-9999px';

      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // Restore original display
      invoiceRef.current.style.display = originalDisplay;
      invoiceRef.current.style.position = 'static';
      invoiceRef.current.style.top = 'auto';
      invoiceRef.current.style.left = 'auto';

      // A4 dimensions: 210 x 297 mm
      const imgWidth = 210; 
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const doc = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      doc.save(`Invoice-Glorious-${orderId.substring(15)}.pdf`);
    } catch (err) {
      console.error("Gagal mengunduh invoice", err);
      alert("Terjadi kesalahan saat membuat PDF invoice.");
    }
  };

  const statusSteps = [
    { key: "New Order", label: "Pesanan Diterima", icon: "📝" },
    { key: "Preparing", label: "Sedang Disiapkan", icon: "🍳" },
    { key: "Ready", label: "Siap Disajikan", icon: "🔔" },
    { key: "Completed", label: "Selesai", icon: "✅" }
  ];

  const currentStepIndex = statusSteps.findIndex(s => s.key === status);

  if (loading) {
    return (
      <div style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        Memuat status pesanan...
      </div>
    );
  }

  return (
    <div className="mobile-px" style={{ padding: '1.25rem 1rem 3rem 1rem' }}>
      
      <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '0.25rem' }}>Status Pesanan ⏱️</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Order Ref: #{orderId.substring(0, 8).toUpperCase()}</p>
      </div>

      <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
          
          {/* Vertical Timeline Track */}
          <div style={{ position: 'absolute', left: '26px', top: '15px', bottom: '15px', width: '3px', background: 'var(--border)', zIndex: 0 }}>
            {/* Active Track Fill */}
            <div style={{ 
              background: 'var(--primary)', 
              width: '100%', 
              height: currentStepIndex > 0 ? `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` : '0%',
              transition: 'height 0.4s ease'
             }} />
          </div>

          {statusSteps.map((step, index) => {
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            
            return (
              <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
                
                {/* Circle Icon */}
                <div style={{ 
                  width: '56px', height: '56px', 
                  borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
                  background: isCompleted ? 'var(--primary)' : 'white',
                  border: isCompleted ? 'none' : '2px solid var(--border)',
                  color: isCompleted ? 'white' : 'var(--text-muted)',
                  boxShadow: isCurrent ? '0 0 0 4px rgba(201, 42, 42, 0.2)' : 'none',
                  transition: 'all 0.3s ease'
                }}>
                  {step.icon}
                </div>
                
                <div>
                  <h3 style={{ 
                    margin: 0, fontSize: '1.1rem',
                    color: isCompleted ? 'var(--text-main)' : 'var(--text-muted)',
                    fontWeight: isCompleted ? 700 : 500
                  }}>
                    {step.label}
                  </h3>
                  {isCurrent && (
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--primary)' }}>Status saat ini</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
          Halaman ini akan diperbarui secara otomatis.<br/>Tunggu di meja Anda atau area tunggu.
        </p>

        <div style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: '300px' }}>
          <button onClick={downloadInvoicePDF} className="btn-secondary" style={{ flex: 1, padding: '0.75rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <span>📄</span> Unduh Invoice PDF
          </button>
        </div>

        <Link href="/" className="btn-primary" style={{ display: 'inline-block', width: '100%', maxWidth: '300px' }}>
          Pesan Menu Lain
        </Link>
      </div>

      {/* Hidden Invoice Template for PDF Generation */}
      {orderData && (
        <div 
          ref={invoiceRef} 
          style={{ 
            display: 'none', 
            width: '800px', 
            minHeight: '1131px', 
            background: 'white', 
            fontFamily: 'Arial, Helvetica, sans-serif', 
            color: '#333',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Angled background banner thicker on left, thinner on right */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: '350px',
            background: 'linear-gradient(135deg, #a5ecc8 0%, #6cd4eb 100%)',
            clipPath: 'polygon(0 0, 100% 0, 100% 40%, 0% 90%)',
            zIndex: 0
          }} />

          <div style={{ position: 'relative', zIndex: 1, padding: '60px' }}>
            {/* Header: Left (Title + Info), Right (Logo + Company) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ width: '50%' }}>
                <h1 style={{ fontSize: '42px', fontWeight: 400, color: '#111', margin: '0 0 40px 0', letterSpacing: '1px' }}>INVOICE</h1>
                
                <div style={{ display: 'flex', gap: '50px' }}>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#111', margin: '0 0 5px 0' }}>DATE</p>
                    <p style={{ fontSize: '15px', color: '#111', margin: 0 }}>{new Date(orderData.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#111', margin: '0 0 5px 0' }}>INVOICE NO</p>
                    <p style={{ fontSize: '15px', color: '#111', margin: 0 }}>{orderData.id.substring(15)}</p>
                  </div>
                </div>

                <div style={{ marginTop: '70px' }}>
                  <p style={{ fontSize: '15px', color: '#111', margin: '0 0 2px 0', fontWeight: 600 }}>{orderData.customerName}</p>
                  <p style={{ fontSize: '14px', color: '#111', margin: 0 }}>{orderData.tableOrAddress}</p>
                </div>
              </div>

              <div style={{ width: '50%', textAlign: 'left', paddingLeft: '50px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                  <div style={{ width: '45px', height: '45px', border: '3px solid #111', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#111', fontWeight: 800, fontSize: '24px' }}>
                    <div style={{ width: '25px', height: '25px', border: '3px solid #111', borderTop: 'none', borderRight: 'none' }}></div>
                  </div>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0, color: '#111', lineHeight: 1 }}>Logo</h2>
                    <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0, color: '#111', lineHeight: 1 }}>Name</h2>
                  </div>
                </div>
                
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111', margin: '0 0 5px 0' }}>Glorious Culinary</h3>
                <p style={{ fontSize: '14px', color: '#222', margin: '0 0 2px 0', lineHeight: 1.5 }}>
                  Jl. Sudirman No 45<br/>
                  Jakarta Pusat, 10220<br/>
                  (021) 123-4567<br/>
                  hello@glorious.com
                </p>
              </div>
            </div>

            {/* Info Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', border: '1px solid #ddd', marginTop: '50px', marginBottom: '40px' }}>
              <div style={{ padding: '12px 10px', textAlign: 'center', borderRight: '1px solid #ddd' }}>
                <p style={{ color: '#276955', fontWeight: 600, margin: '0 0 5px 0', fontSize: '14px' }}>Client</p>
                <p style={{ margin: 0, fontSize: '13px', color: '#111' }}>{orderData.customerName}</p>
              </div>
              <div style={{ padding: '12px 10px', textAlign: 'center', borderRight: '1px solid #ddd' }}>
                <p style={{ color: '#276955', fontWeight: 600, margin: '0 0 5px 0', fontSize: '14px' }}>Location</p>
                <p style={{ margin: 0, fontSize: '13px', color: '#111' }}>{orderData.tableOrAddress}</p>
              </div>
              <div style={{ padding: '12px 10px', textAlign: 'center', borderRight: '1px solid #ddd' }}>
                <p style={{ color: '#276955', fontWeight: 600, margin: '0 0 5px 0', fontSize: '14px' }}>Payment Terms</p>
                <p style={{ margin: 0, fontSize: '13px', color: '#111' }}>Due on Receipt</p>
              </div>
              <div style={{ padding: '12px 10px', textAlign: 'center' }}>
                <p style={{ color: '#276955', fontWeight: 600, margin: '0 0 5px 0', fontSize: '14px' }}>Due date</p>
                <p style={{ margin: 0, fontSize: '13px', color: '#111' }}>{new Date(orderData.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
              </div>
            </div>

            {/* Main Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
              <thead>
                <tr>
                  <th style={{ padding: '15px 10px', textAlign: 'left',  borderBottom: '2px solid #276955', borderTop: '1px solid #ddd', color: '#276955', fontSize: '14px', fontWeight: 600, width: '40%' }}>Item</th>
                  <th style={{ padding: '15px 10px', textAlign: 'left', borderBottom: '2px solid #276955', borderTop: '1px solid #ddd', color: '#276955', fontSize: '14px', fontWeight: 600 }}>Unit Price</th>
                  <th style={{ padding: '15px 10px', textAlign: 'left', borderBottom: '2px solid #276955', borderTop: '1px solid #ddd', color: '#276955', fontSize: '14px', fontWeight: 600 }}>Qty</th>
                  <th style={{ padding: '15px 10px', textAlign: 'right', borderBottom: '2px solid #276955', borderTop: '1px solid #ddd', color: '#276955', fontSize: '14px', fontWeight: 600 }}>Line Total</th>
                </tr>
              </thead>
              <tbody>
                {orderData.orderItems?.map((item: any, i: number) => (
                  <tr key={i}>
                    <td style={{ padding: '20px 10px', borderBottom: '1px solid #ddd', verticalAlign: 'top', borderRight: '1px solid #ddd', borderLeft: '1px solid #ddd' }}>
                      <strong style={{ fontSize: '14px', color: '#111' }}>{item.menuItem?.name}</strong>
                      {item.note && <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>{item.note}</div>}
                    </td>
                    <td style={{ padding: '20px 10px', borderBottom: '1px solid #ddd', textAlign: 'left', verticalAlign: 'top', fontWeight: 700, fontSize: '14px', borderRight: '1px solid #ddd' }}>{item.price.toLocaleString('id-ID')}</td>
                    <td style={{ padding: '20px 10px', borderBottom: '1px solid #ddd', textAlign: 'left', verticalAlign: 'top', fontWeight: 700, fontSize: '14px', borderRight: '1px solid #ddd' }}>{item.quantity}</td>
                    <td style={{ padding: '20px 10px', borderBottom: '1px solid #ddd', textAlign: 'right', verticalAlign: 'top', fontWeight: 700, fontSize: '14px', borderRight: '1px solid #ddd' }}>{(item.price * item.quantity).toLocaleString('id-ID')}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals table aligned with Line Total column */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '40px' }}>
              <div style={{ width: '40%' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '10px 15px', borderBottom: '1px solid #ddd', color: '#333', fontSize: '14px', textAlign: 'right', width: '50%' }}>Subtotal</td>
                      <td style={{ padding: '10px 15px', borderBottom: '1px solid #ddd', color: '#111', fontSize: '14px', textAlign: 'right', borderLeft: '1px solid #ddd' }}>{orderData.totalAmount.toLocaleString('id-ID')}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '10px 15px', borderBottom: '1px solid #ddd', color: '#333', fontSize: '14px', textAlign: 'right' }}>Sales Tax</td>
                      <td style={{ padding: '10px 15px', borderBottom: '1px solid #ddd', color: '#111', fontSize: '14px', textAlign: 'right', borderLeft: '1px solid #ddd' }}>{(orderData.totalAmount * 0.05).toLocaleString('id-ID')}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '10px 15px', color: '#333', fontSize: '14px', textAlign: 'right' }}>Total</td>
                      <td style={{ padding: '10px 15px', color: '#111', fontSize: '14px', textAlign: 'right', borderLeft: '1px solid #ddd' }}>{(orderData.totalAmount * 1.05).toLocaleString('id-ID')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ marginTop: '50px', textAlign: 'right' }}>
              <p style={{ fontSize: '13px', color: '#1751d9', margin: 0 }}>Create an invoice with Glorious</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
