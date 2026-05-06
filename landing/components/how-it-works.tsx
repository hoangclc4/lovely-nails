'use client';

import { STEPS } from '@/lib/constants';
import { ScrollReveal } from './scroll-reveal';

export function HowItWorks() {
  return (
    <section id="how" style={{ padding: '7rem 3rem' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <ScrollReveal>
            <div style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--rose)', fontWeight: 600, marginBottom: '1rem' }}>How It Works</div>
          </ScrollReveal>
          <ScrollReveal delay={1}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 500, lineHeight: 1.2, color: 'var(--heading)' }}>
              Book your perfect <em style={{ fontStyle: 'italic', color: 'var(--rose-light)' }}>session.</em>
            </h2>
          </ScrollReveal>
        </div>
        <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }}>
          {STEPS.map((step, i) => (
            <ScrollReveal key={step.number} delay={(i + 1) as 1 | 2 | 3 | 4}>
              <div
                style={{
                  textAlign: 'center',
                  padding: '2.5rem 1.5rem',
                  borderRadius: 20,
                  border: '1px solid var(--border)',
                  background: 'var(--bg-card)',
                  transition: 'all 0.5s',
                }}
                onMouseEnter={(e) => { const el = e.currentTarget; el.style.borderColor = 'rgba(232,69,107,0.2)'; el.style.transform = 'translateY(-5px)'; }}
                onMouseLeave={(e) => { const el = e.currentTarget; el.style.borderColor = 'var(--border)'; el.style.transform = 'translateY(0)'; }}
              >
                <div style={{ width: 50, height: 50, borderRadius: '50%', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--rose), #c93a5a)', fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
                  {step.number}
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 500, color: 'var(--heading)', marginBottom: '0.8rem' }}>{step.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>{step.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
