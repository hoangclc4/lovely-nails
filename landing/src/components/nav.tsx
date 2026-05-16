'use client';

import { useEffect, useState } from 'react';
import { PHONE_NUMBER, NAV_LINKS } from '@/lib/constants';

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    const syncUiState = () => {
      setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
      setIsMobile(window.matchMedia('(max-width: 767px)').matches);
    };

    syncUiState();
    window.addEventListener('resize', syncUiState);
    return () => window.removeEventListener('resize', syncUiState);
  }, []);

  const toggleTheme = () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const logoSrc = isMobile
    ? (isDark
      ? '/assets/logos/lovely-nails-transparent-stacked-light.svg'
      : '/assets/logos/lovely-nails-transparent-stacked-dark.svg')
    : (isDark
      ? '/assets/logos/lovely-nails-transparent-horizontal-light.svg'
      : '/assets/logos/lovely-nails-transparent-horizontal-dark.svg');

  const logoClassName = isMobile ? 'logo-icon' : 'logo-horizontal';

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMenuOpen(false);
    const target = document.querySelector(href);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: scrolled ? '0.4rem 3rem' : '0.75rem 3rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: scrolled ? 'var(--nav-bg-scrolled)' : 'var(--nav-bg)',
        backdropFilter: 'blur(20px) saturate(1.8)',
        borderBottom: '1px solid var(--border)',
        transition: 'all 0.4s ease',
      }}
    >
      <div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} alt="Lovely Nails" className={logoClassName} />
      </div>

      <div className="nav-links-desktop">
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={(e) => handleSmoothScroll(e, link.href)}
            style={{
              fontSize: '0.85rem',
              fontWeight: 500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              textDecoration: 'none',
              transition: 'color 0.3s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--gold)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            {link.label}
          </a>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: '1px solid var(--border)',
            background: 'transparent',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            transition: 'color 0.3s, border-color 0.3s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--gold)'; e.currentTarget.style.borderColor = 'var(--gold)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
        >
          <svg className="theme-icon-moon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
          <svg className="theme-icon-sun" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
        </button>

        <a
          href={`tel:${PHONE_NUMBER}`}
          className="nav-book-desktop"
          style={{
            padding: '0.65rem 1.8rem',
            borderRadius: '100px',
            background: 'linear-gradient(135deg, var(--rose), #c93a5a)',
            fontSize: '0.8rem',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#fff',
            textDecoration: 'none',
            transition: 'all 0.3s',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget;
            el.style.transform = 'translateY(-2px)';
            el.style.boxShadow = '0 8px 30px rgba(232,69,107,0.3)';
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget;
            el.style.transform = 'translateY(0)';
            el.style.boxShadow = 'none';
          }}
        >
          Call Now
        </a>
      </div>

      <button
        className="nav-hamburger"
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-label="Toggle menu"
      >
        <span style={{ display: 'block', width: 24, height: 2, background: 'var(--text)', borderRadius: 2 }} />
        <span style={{ display: 'block', width: 24, height: 2, background: 'var(--text)', borderRadius: 2 }} />
        <span style={{ display: 'block', width: 24, height: 2, background: 'var(--text)', borderRadius: 2 }} />
      </button>

      <div className={`nav-mobile-menu${menuOpen ? ' open' : ''}`}>
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={(e) => handleSmoothScroll(e, link.href)}
            style={{
              fontSize: '1.1rem',
              fontWeight: 500,
              letterSpacing: '0.06em',
              color: 'var(--text-muted)',
              textDecoration: 'none',
              transition: 'color 0.3s',
              padding: '0.5rem 0',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--gold)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            {link.label}
          </a>
        ))}
        <a
          href={`tel:${PHONE_NUMBER}`}
          style={{
            padding: '0.9rem 2.5rem',
            borderRadius: '100px',
            background: 'linear-gradient(135deg, var(--rose), #c93a5a)',
            fontSize: '0.85rem',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#fff',
            textDecoration: 'none',
            display: 'block',
            textAlign: 'center',
            marginTop: '0.5rem',
          }}
        >
          Call Now
        </a>
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            width: '100%',
            padding: '0.6rem',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            background: 'transparent',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 500,
            marginTop: '0.5rem',
          }}
        >
          <svg className="theme-icon-moon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
          <svg className="theme-icon-sun" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
          <span className="theme-label-moon">Dark Mode</span>
          <span className="theme-label-sun">Light Mode</span>
        </button>
      </div>
    </nav>
  );
}
