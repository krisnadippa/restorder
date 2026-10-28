import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>GLORIOUS RESTAURANT</h3>
        <p>Serving the best food since 2026.</p>
        <div style={{ marginTop: '2rem', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <span>&copy; {new Date().getFullYear()} Glorious Restaurant. All rights reserved.</span>
          <Link href="/admin/login" style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>Admin Login</Link>
        </div>
      </div>
    </footer>
  );
}
