'use client';

import { NAV_LINKS } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="footer-grid" style={{ padding: '3rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--gold)', fontWeight: 500 }}>
        Lovely <span style={{ color: 'var(--rose)' }}>Nails</span>
      </div>
      <div style={{ display: 'flex', gap: '2rem' }}>
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textDecoration: 'none', transition: 'color 0.3s' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--gold)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-dim)'; }}
          >
            {link.label}
          </a>
        ))}
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textDecoration: 'none', transition: 'color 0.3s' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--gold)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-dim)'; }}
        >
          Instagram
        </a>
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>© 2026 Lovely Nails. Guam, USA. All rights reserved.</div>
    </footer>
  );
}
