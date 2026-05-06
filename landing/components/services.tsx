'use client';

import { SERVICES } from '@/lib/constants';
import { ScrollReveal } from './scroll-reveal';

export function Services() {
  return (
    <section id="services" className="section-container" style={{ padding: '7rem 3rem', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <ScrollReveal>
            <div style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--rose)', fontWeight: 600, marginBottom: '1rem' }}>
              Our Services
            </div>
          </ScrollReveal>
          <ScrollReveal delay={1}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 500, lineHeight: 1.2, color: 'var(--heading)', marginBottom: '1rem' }}>
              Artistry at every <em style={{ fontStyle: 'italic', color: 'var(--rose-light)' }}>detail.</em>
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={2}>
            <p style={{ fontSize: '1rem', color: 'var(--text-muted)', maxWidth: 550, margin: '0 auto', lineHeight: 1.8, fontWeight: 300 }}>
              From timeless classics to bold statements — our technicians bring precision and creativity to every service.
            </p>
          </ScrollReveal>
        </div>

        <div className="services-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {SERVICES.map((service, i) => (
            <ScrollReveal key={service.name} delay={(i + 1) as 1 | 2 | 3 | 4}>
              <div
                style={{
                  borderRadius: 20,
                  overflow: 'hidden',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-card)',
                  transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1)',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.borderColor = 'rgba(212,165,116,0.25)';
                  el.style.transform = 'translateY(-8px)';
                  el.style.boxShadow = '0 20px 60px rgba(0,0,0,0.4)';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.borderColor = 'var(--border)';
                  el.style.transform = 'translateY(0)';
                  el.style.boxShadow = 'none';
                }}
              >
                <div style={{ height: 220, overflow: 'hidden', position: 'relative' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={service.imageUrl}
                    alt={service.imageAlt}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.85) saturate(0.9)' }}
                  />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', background: 'linear-gradient(to top, var(--bg-card), transparent)' }} />
                </div>
                <div style={{ padding: '1.5rem 1.8rem 2rem' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 500, color: 'var(--heading)', marginBottom: '0.5rem' }}>{service.name}</div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>{service.description}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--gold)' }}>{service.price}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', letterSpacing: '0.05em' }}>{service.duration}</div>
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
