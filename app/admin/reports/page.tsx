"use client";

import { useEffect, useState } from 'react';
import { formatIDR } from '../../../lib/utils';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

export default function AdminReports() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Date Filters (Default to current month)
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const [startDate, setStartDate] = useState(firstDay.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

  const COLORS = ['#c92a2a', '#e67700', '#2b8a3e', '#1c7ed6', '#fcc419'];

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/reports?startDate=${startDate}&endDate=${endDate}`);
      if (!res.ok) throw new Error("Gagal mengambil data laporan");
      const d = await res.json();
      setData(d);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Sebuah kesalahan terjadi.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ color: 'var(--text-main)', margin: 0 }}>Laporan & Analitik</h1>
        
        {/* Date Filter Controls */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'white', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <input 
            type="date" 
            className="input-field" 
            style={{ width: 'auto', padding: '0.5rem' }}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>s/d</span>
          <input 
            type="date" 
            className="input-field" 
            style={{ width: 'auto', padding: '0.5rem' }}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <button onClick={fetchReports} className="btn-primary" style={{ padding: '0.5rem 1rem' }}>Terapkan</button>
        </div>
      </div>

      {error && <div style={{ background: '#ffe3e3', color: '#c92a2a', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>{error}</div>}

      {loading ? (
        <h2>Memuat Analisis...</h2>
      ) : data ? (
        <>
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            <div className="card" style={{ padding: '2rem', borderTop: '5px solid var(--primary)' }}>
              <h4 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px' }}>Total Pendapatan Kategori Ini</h4>
              <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{formatIDR(data.summary.totalRevenue)}</span>
            </div>
            <div className="card" style={{ padding: '2rem', borderTop: '5px solid var(--accent)' }}>
              <h4 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px' }}>Total Pesanan Sukses (Lunas)</h4>
              <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{data.summary.totalOrders} <span style={{ fontSize: '1rem', fontWeight: 400 }}>Transaksi</span></span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            
            {/* Sales Timeline Line Chart */}
            <div className="card" style={{ padding: '1.5rem', minHeight: '350px' }}>
              <h3 style={{ marginBottom: '1.5rem', color: 'var(--secondary)' }}>Tren Penjualan Harian</h3>
              {data.charts.timelineData.length === 0 ? (
                 <p style={{ color: 'var(--text-muted)' }}>Tidak ada data pada rentang tanggal ini.</p>
              ) : (
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <LineChart data={data.charts.timelineData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                      <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis 
                         tickFormatter={(value) => `Rp ${value / 1000}k`} 
                         tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                         axisLine={false} tickLine={false}
                         width={80}
                      />
                      <Tooltip 
                         formatter={(value: any) => [formatIDR(value), 'Pendapatan']}
                         labelStyle={{ color: 'var(--text-main)', fontWeight: 'bold', marginBottom: '0.5rem' }}
                         contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Line type="monotone" dataKey="amount" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--primary)', strokeWidth: 2, stroke: 'white' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Category Pie Chart */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1.5rem', color: 'var(--secondary)' }}>Proporsi Kategori Menu</h3>
              {data.charts.categoryData.length === 0 ? (
                 <p style={{ color: 'var(--text-muted)' }}>Tidak ada data pada rentang tanggal ini.</p>
              ) : (
                <div style={{ width: '100%', height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={data.charts.categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {data.charts.categoryData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                         formatter={(value: any) => [`${value} Porsi`, 'Terjual']}
                         contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Top Seller Bar Chart */}
            <div className="card" style={{ padding: '1.5rem', gridColumn: '1 / -1' }}>
              <h3 style={{ marginBottom: '1.5rem', color: 'var(--secondary)' }}>Top 5 Menu Terlaris</h3>
               {data.charts.topItemsData.length === 0 ? (
                 <p style={{ color: 'var(--text-muted)' }}>Tidak ada data pada rentang tanggal ini.</p>
              ) : (
                <div style={{ width: '100%', height: 350 }}>
                  <ResponsiveContainer>
                    <BarChart data={data.charts.topItemsData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#eee" />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} />
                      <YAxis type="category" dataKey="name" width={150} tick={{ fill: 'var(--text-main)', fontWeight: 500, fontSize: 13 }} axisLine={false} tickLine={false}/>
                      <Tooltip 
                         cursor={{fill: '#f0f0f0'}}
                         formatter={(value: any) => [`${value} Porsi`, 'Terjual']}
                         contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Bar dataKey="value" fill="var(--accent)" radius={[0, 4, 4, 0]} barSize={30}>
                        {data.charts.topItemsData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--primary)' : 'var(--accent)'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

          </div>
        </>
      ) : null}
    </div>
  );
}
