'use client';

import { GALLERY_ITEMS } from '@/lib/constants';
import { ScrollReveal } from './scroll-reveal';

export function Gallery() {
  const doubled = [...GALLERY_ITEMS, ...GALLERY_ITEMS];

  return (
    <section id="gallery" style={{ padding: '3rem 0', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 3rem', marginBottom: '3rem' }}>
        <div style={{ textAlign: 'center' }}>
          <ScrollReveal>
            <div style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--rose)', fontWeight: 600, marginBottom: '1rem' }}>Our Work</div>
          </ScrollReveal>
          <ScrollReveal delay={1}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 500, lineHeight: 1.2, color: 'var(--heading)', marginBottom: '1rem' }}>
              A gallery of <em style={{ fontStyle: 'italic', color: 'var(--rose-light)' }}>masterpieces.</em>
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={2}>
            <p style={{ fontSize: '1rem', color: 'var(--text-muted)', maxWidth: 550, margin: '0 auto', lineHeight: 1.8, fontWeight: 300 }}>
              Every set of nails is a work of art. Browse our latest creations by our talented technicians.
            </p>
          </ScrollReveal>
        </div>
      </div>

      <div className="gallery-grid" style={{ display: 'flex', gap: '1.5rem', overflow: 'hidden', maskImage: 'linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)', WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)' }}>
        <div style={{ display: 'flex', gap: '1.5rem', flexShrink: 0, animation: 'marquee 40s linear infinite' }}>
          {doubled.map((item, i) => (
            <div
              key={`${item.label}-${i}`}
              style={{ width: 300, height: 380, flexShrink: 0, borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)', position: 'relative', transition: 'all 0.4s' }}
              onMouseEnter={(e) => { const el = e.currentTarget; el.style.borderColor = 'rgba(212,165,116,0.3)'; el.style.transform = 'scale(1.02)'; }}
              onMouseLeave={(e) => { const el = e.currentTarget; el.style.borderColor = 'var(--border)'; el.style.transform = 'scale(1)'; }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.imageUrl} alt={item.alt} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.85)' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.5rem', background: 'linear-gradient(to top, rgba(10,6,8,0.9), transparent)' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--cream)', fontWeight: 500 }}>{item.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
