"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  // Simple hardcoded auth check wrapper could go here or in middleware
  // For this prototype, we just render the admin layout wrapper
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    // Call server to clear the HttpOnly cookie
    await fetch('/api/auth/logout', { method: 'POST' });
    // Also clear the old localStorage just in case
    localStorage.removeItem('admin_auth');
    // Force a full replace so the middleware catches it and redirect to login
    window.location.href = '/admin/login';
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8f9fa' }}>
      {/* Sidebar */}
      <aside style={{ width: '250px', background: 'var(--surface)', borderRight: '1px solid var(--border)', padding: '2rem 1rem', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ color: 'var(--primary)', marginBottom: '2rem', textAlign: 'center' }}>Admin Panel</h2>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexGrow: 1 }}>
          <Link href="/admin" className={`btn-secondary ${pathname === '/admin' ? 'active' : ''}`} style={{ textAlign: 'left', border: 'none', background: pathname === '/admin' ? 'var(--primary)' : 'transparent', color: pathname === '/admin' ? 'white' : 'inherit' }}>
            Dashboard
          </Link>
          <Link href="/admin/menu" className={`btn-secondary ${pathname === '/admin/menu' ? 'active' : ''}`} style={{ textAlign: 'left', border: 'none', background: pathname === '/admin/menu' ? 'var(--primary)' : 'transparent', color: pathname === '/admin/menu' ? 'white' : 'inherit' }}>
            Menu Management
          </Link>
          <Link href="/admin/reports" className={`btn-secondary ${pathname === '/admin/reports' ? 'active' : ''}`} style={{ textAlign: 'left', border: 'none', background: pathname === '/admin/reports' ? 'var(--primary)' : 'transparent', color: pathname === '/admin/reports' ? 'white' : 'inherit' }}>
            Laporan & Analitik
          </Link>
        </nav>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button 
            onClick={handleLogout}
            style={{ width: '100%', padding: '0.5rem', background: '#ffe3e3', color: '#c92a2a', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
          >
            Logout
          </button>
          <Link href="/" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', display: 'block' }}>Visit Public Site →</Link>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flexGrow: 1, padding: '2rem', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
