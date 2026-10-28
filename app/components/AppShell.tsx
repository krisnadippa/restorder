"use client";

import { usePathname } from 'next/navigation';
import MobileBottomNav from './MobileBottomNav';
import DesktopSidebar from './DesktopSidebar';
import ScrollToTop from './ScrollToTop';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    return <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>{children}</div>;
  }

  return (
    <div className="responsive-app-container">
      {/* Desktop & iPad Sidebar (visible on screens >= 768px) */}
      <DesktopSidebar />

      {/* Main Content Area */}
      <div className="main-content-wrapper">
        <main style={{ minHeight: '100vh' }}>
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (visible only on mobile < 768px) */}
      <MobileBottomNav />

      {/* Smooth Scroll to Top Floating Button */}
      <ScrollToTop />
    </div>
  );
}
