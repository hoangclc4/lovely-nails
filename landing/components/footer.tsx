'use client';

import { useEffect, useState } from 'react';
import { NAV_LINKS } from '@/lib/constants';

export function Footer() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const sync = () => setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const logoSrc = isDark
    ? '/assets/logos/lovely-nails-transparent-horizontal-light.svg'
    : '/assets/logos/lovely-nails-transparent-horizontal-dark.svg';

  return (
    <footer className="footer-grid" style={{ padding: '3rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
      <div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} alt="Lovely Nails" style={{ height: 40, width: 'auto', display: 'block' }} />
      </div>
      <div className="footer-links" style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
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
