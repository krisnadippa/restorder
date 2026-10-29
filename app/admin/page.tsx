"use client";

import { useEffect, useState } from 'react';
import { Order, OrderItem } from '../../types';
import { formatIDR } from '../../lib/utils';

interface OrderWithItems extends Order {
  orderItems: (OrderItem & { menuItem: { name: string } })[];
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [knownOrderIds, setKnownOrderIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Initial fetch
    fetchOrders(true);
    // Refresh orders every 10 seconds for prototype real-time feel
    const interval = setInterval(() => fetchOrders(false), 10000);
    return () => clearInterval(interval);
  }, []);

  const playNotificationSound = () => {
    try {
      // 3 beeps using Web Audio API as it doesn't require uploading MP3 assets
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      let startTime = audioCtx.currentTime;
      
      for (let i = 0; i < 3; i++) {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, startTime); // 800Hz beep
        
        gainNode.gain.setValueAtTime(0.1, startTime); // Volume
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.3);
        
        startTime += 0.5; // Gap between beeps
      }
    } catch (e) {
      console.error("Audio playback restricted by browser", e);
    }
  };

  const fetchOrders = (isInitialLoad: boolean = false) => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) {
          setOrders([]);
          setLoading(false);
          return;
        }
        setOrders(data);
        setLoading(false);
        
        // Notification logic
        if (!isInitialLoad && data.length > 0) {
          const newOrderIds = new Set<string>(data.map((o: any) => o.id));
          
          // Check if there are any new orders we haven't seen yet
          setKnownOrderIds(prev => {
            // Wait until previous isn't empty to play sound (to prevent sound storm on refresh)
            if (prev.size > 0) {
              const hasNew = data.some((o: any) => !prev.has(o.id));
              if (hasNew) {
                playNotificationSound();
              }
            }
            return newOrderIds;
          });
        } else if (isInitialLoad && data.length > 0) {
          // Just silently store the known IDs on first load
          setKnownOrderIds(new Set<string>(data.map((o: any) => o.id)));
        }
      })
      .catch(err => {
        console.error("Failed to fetch orders", err);
        setLoading(false);
      });
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
       await fetch(`/api/orders/${orderId}/status`, {
         method: 'PATCH',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ status: newStatus })
       });
       fetchOrders(); // Refresh to get the latest
    } catch (error) {
       console.error("Failed to update status", error);
       alert("Failed to update status");
    }
  };

  const updatePaymentStatus = async (orderId: string, newPaymentStatus: string) => {
    try {
       await fetch(`/api/orders/${orderId}/pay`, {
         method: 'PATCH',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ status: newPaymentStatus })
       });
       fetchOrders(); // Refresh to get the latest
    } catch (error) {
       console.error("Failed to update payment status", error);
       alert("Failed to update payment status");
    }
  };

  if (loading) return <h2>Loading Dashboard...</h2>;

  const totalSales = orders
    .filter(o => o.status === 'Completed')
    .reduce((sum, order) => sum + order.totalAmount, 0);

  const activeOrders = orders.filter(o => o.status !== 'Completed');
  const pastOrders = orders.filter(o => o.status === 'Completed');

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'New Order': return 'var(--primary)';
      case 'Preparing': return 'var(--accent)';
      case 'Ready': return 'var(--success)';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div>
      <h1 style={{ color: 'var(--text-main)', marginBottom: '2rem' }}>Dashboard Overview</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
          <h4 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Active Orders</h4>
          <span style={{ fontSize: '2rem', fontWeight: 700 }}>{activeOrders.length}</span>
        </div>
        <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--success)' }}>
          <h4 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Sales (Completed)</h4>
          <span style={{ fontSize: '2rem', fontWeight: 700 }}>{formatIDR(totalSales)}</span>
        </div>
        <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--text-muted)' }}>
          <h4 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Orders Today</h4>
          <span style={{ fontSize: '2rem', fontWeight: 700 }}>{orders.length}</span>
        </div>
      </div>

      <h2 style={{ marginBottom: '1.5rem', color: 'var(--secondary)' }}>Active Orders</h2>
      
      {activeOrders.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', marginBottom: '3rem' }}>No active orders right now.</p>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem', marginBottom: '3rem' }}>
          {activeOrders.map(order => (
            <div key={order.id} className="card" style={{ padding: '1.5rem' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem', marginBottom: '1rem', flexWrap: 'wrap', gap: '1.5rem' }}>
                  <div style={{ flex: '1 1 min-content' }}>
                   <h3 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                     Order #{order.id.slice(15)}
                   </h3>
                   <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                     <strong>Customer:</strong> {order.customerName} <br />
                     <strong>Table/Address:</strong> {order.tableOrAddress}
                   </div>
                 </div>
                 
                 <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    
                    {/* Kitchen Status Block */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: '#f8f9fa', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status Dapur</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ 
                          background: getStatusColor(order.status), color: 'white', 
                          padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600
                        }}>
                          {order.status}
                        </span>
                        <select 
                          value={order.status} 
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          className="input-field"
                          style={{ width: 'auto', padding: '0.25rem', fontSize: '0.8rem', margin: 0 }}
                        >
                          <option value="New Order">New Order</option>
                          <option value="Preparing">Preparing</option>
                          <option value="Ready">Ready</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>
                    </div>

                    {/* Payment Status Block */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: '#f8f9fa', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status Pembayaran</span>
                      <select 
                        value={order.paymentStatus || 'PENDING'} 
                        onChange={(e) => updatePaymentStatus(order.id, e.target.value)}
                        className="input-field"
                        style={{ 
                           width: 'auto', padding: '0.25rem', fontSize: '0.8rem', margin: 0,
                           background: order.paymentStatus === 'PAID' ? '#d3f9d8' : order.paymentStatus === 'FAILED' ? '#ffe3e3' : '#fff3bf',
                           color: order.paymentStatus === 'PAID' ? '#2b8a3e' : order.paymentStatus === 'FAILED' ? '#c92a2a' : '#e67700',
                           border: `1px solid ${order.paymentStatus === 'PAID' ? '#b2f2bb' : order.paymentStatus === 'FAILED' ? '#ffc9c9' : '#ffe066'}`,
                           fontWeight: 700,
                           cursor: 'pointer'
                        }}
                      >
                        <option value="PENDING">⏳ BELUM LUNAS</option>
                        <option value="PAID">💰 LUNAS</option>
                        <option value="FAILED">❌ GAGAL</option>
                      </select>
                    </div>

                 </div>
               </div>

               <div style={{ paddingLeft: '1rem' }}>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                    {order.orderItems.map((item, i) => (
                      <li key={i} style={{ padding: '0.5rem 0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <span style={{ fontWeight: 500 }}>{item.quantity}x {item.menuItem?.name}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{formatIDR(item.price * item.quantity)}</span>
                        </div>
                        {item.note && (
                          <div style={{ fontSize: '0.85rem', color: '#c92a2a', marginTop: '0.25rem', paddingLeft: '1.5rem', fontStyle: 'italic' }}>
                            ↳ Catatan: {item.note}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                  {order.notes && (
                    <div style={{ marginTop: '1rem', background: '#ffe8cc', padding: '0.5rem 1rem', borderRadius: '4px', fontSize: '0.9rem', color: 'var(--primary-hover)' }}>
                      <strong>Notes:</strong> {order.notes}
                    </div>
                  )}
               </div>
               
               <div style={{ textAlign: 'right', marginTop: '1rem', fontWeight: 700, fontSize: '1.1rem' }}>
                 Total: {formatIDR(order.totalAmount)}
               </div>
            </div>
          ))}
        </div>
      )}

      {pastOrders.length > 0 && (
        <>
          <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>Recent Completed Orders</h2>
          <div className="card" style={{ padding: '1rem', background: 'white' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: '0.5rem' }}>ID</th>
                  <th style={{ padding: '0.5rem' }}>Customer</th>
                  <th style={{ padding: '0.5rem' }}>Time</th>
                  <th style={{ padding: '0.5rem' }}>Payment</th>
                  <th style={{ padding: '0.5rem' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {pastOrders.slice(0, 10).map((order) => (
                  <tr key={order.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.5rem', fontSize: '0.9rem' }}>#{order.id.slice(15)}</td>
                    <td style={{ padding: '0.5rem' }}>{order.customerName}</td>
                    <td style={{ padding: '0.5rem' }}>{new Date(order.createdAt).toLocaleTimeString()}</td>
                     <td style={{ padding: '0.5rem' }}>
                       <span style={{ 
                           fontSize: '0.75rem', 
                           padding: '2px 8px', 
                           borderRadius: '12px', 
                           background: order.paymentStatus === 'PAID' ? '#d3f9d8' : order.paymentStatus === 'FAILED' ? '#ffe3e3' : '#fff3bf',
                           color: order.paymentStatus === 'PAID' ? '#2b8a3e' : order.paymentStatus === 'FAILED' ? '#c92a2a' : '#e67700',
                           fontWeight: 700
                        }}>
                           {order.paymentStatus || 'CASH'} 
                        </span>
                     </td>
                    <td style={{ padding: '0.5rem' }}>{formatIDR(order.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
