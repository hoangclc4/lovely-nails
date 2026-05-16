'use client';

import { ABOUT_FEATURES } from '@/lib/constants';
import { ScrollReveal } from './scroll-reveal';

export function About() {
  return (
    <section id="about" style={{ padding: '3rem', position: 'relative', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="about-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>

          <ScrollReveal variant="reveal-left">
            <div style={{ position: 'relative', height: 550 }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '75%', height: '80%', borderRadius: 20, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80" alt="Nail salon interior" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.85)' }} />
              </div>
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: '55%', height: '50%', borderRadius: 16, overflow: 'hidden', border: '2px solid rgba(212,165,116,0.2)', boxShadow: '0 15px 50px rgba(0,0,0,0.6)', animation: 'float-subtle 6s ease-in-out infinite' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://images.unsplash.com/photo-1457972729786-0411a3b2b626?w=600&q=80" alt="Nail technician at work" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.9) saturate(0.9)' }} />
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal variant="reveal-right">
            <div>
              <div style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--rose)', fontWeight: 600, marginBottom: '1rem' }}>The Experience</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 500, lineHeight: 1.2, color: 'var(--heading)', marginBottom: '1rem' }}>
                Crafted with <em style={{ fontStyle: 'italic', color: 'var(--rose-light)' }}>love,</em><br />perfected with care.
              </h2>
              <p style={{ fontSize: '1rem', color: 'var(--text-muted)', maxWidth: 550, lineHeight: 1.8, fontWeight: 300, marginBottom: '2.5rem' }}>
                At Lovely Nails, we believe every pair of hands tells a story. Our team of 5 expert technicians brings years of artistry and passion to every appointment, creating a warm and welcoming space on the beautiful island of Guam.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {ABOUT_FEATURES.map((feature) => (
                  <div
                    key={feature.title}
                    style={{
                      display: 'flex',
                      gap: '1rem',
                      alignItems: 'flex-start',
                      padding: '1.2rem 1.5rem',
                      borderRadius: 14,
                      border: '1px solid var(--border)',
                      background: 'var(--bg-card)',
                      transition: 'all 0.4s',
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget;
                      el.style.borderColor = 'rgba(232,69,107,0.2)';
                      el.style.background = 'var(--bg-card-hover)';
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget;
                      el.style.borderColor = 'var(--border)';
                      el.style.background = 'var(--bg-card)';
                    }}
                  >
                    <div style={{ width: 40, height: 40, minWidth: 40, borderRadius: 10, background: 'linear-gradient(135deg, var(--rose-glow), rgba(212,165,116,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                      {feature.icon}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '0.95rem', color: 'var(--heading)', fontWeight: 500, marginBottom: '0.3rem' }}>{feature.title}</h3>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

        </div>
      </div>
    </section>
  );
}
