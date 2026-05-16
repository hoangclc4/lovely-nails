'use client';

import { TESTIMONIALS } from '@/lib/constants';
import { ScrollReveal } from './scroll-reveal';

export function Testimonials() {
  return (
    <section id="reviews" style={{ padding: '3rem', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <ScrollReveal>
            <div style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--rose)', fontWeight: 600, marginBottom: '1rem' }}>Client Love</div>
          </ScrollReveal>
          <ScrollReveal delay={1}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 500, lineHeight: 1.2, color: 'var(--heading)', marginBottom: '1rem' }}>
              What our clients <em style={{ fontStyle: 'italic', color: 'var(--rose-light)' }}>say.</em>
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={2}>
            <p style={{ fontSize: '1rem', color: 'var(--text-muted)', maxWidth: 550, margin: '0 auto', lineHeight: 1.8, fontWeight: 300 }}>
              Real stories from real people who trust Lovely Nails for their nail care.
            </p>
          </ScrollReveal>
        </div>
        <div className="testimonials-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          {TESTIMONIALS.map((t, i) => (
            <ScrollReveal key={t.name} delay={(i + 1) as 1 | 2 | 3}>
              <div
                style={{
                  padding: '2rem',
                  borderRadius: 20,
                  border: '1px solid var(--border)',
                  background: 'var(--bg-card)',
                  transition: 'all 0.5s',
                  height: '100%',
                }}
                onMouseEnter={(e) => { const el = e.currentTarget; el.style.borderColor = 'rgba(212,165,116,0.2)'; el.style.transform = 'translateY(-5px)'; }}
                onMouseLeave={(e) => { const el = e.currentTarget; el.style.borderColor = 'var(--border)'; el.style.transform = 'translateY(0)'; }}
              >
                <div style={{ color: 'var(--gold)', fontSize: '0.9rem', letterSpacing: 2, marginBottom: '1rem' }}>{'★'.repeat(t.stars)}</div>
                <p style={{ fontSize: '0.95rem', color: 'var(--text)', lineHeight: 1.8, fontStyle: 'italic', marginBottom: '1.5rem', fontFamily: 'var(--font-display)', fontWeight: 400 }}>{t.text}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, var(--rose-glow), rgba(212,165,116,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--gold)', fontWeight: 600 }}>{t.initials}</div>
                  <div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--heading)', fontWeight: 500 }}>{t.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{t.meta}</div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
