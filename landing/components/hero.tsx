'use client';

import { BOOKING_URL } from '@/lib/constants';
import { ScrollReveal } from './scroll-reveal';

export function Hero() {
  return (
    <section
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        padding: '8rem 3rem 4rem',
      }}
    >
      {/* Background image */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1600&q=80"
          alt="Nail salon"
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.25) saturate(0.6)' }}
        />
      </div>

      {/* Gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          background: `
            radial-gradient(ellipse 80% 60% at 30% 40%, rgba(232,69,107,0.12), transparent),
            radial-gradient(ellipse 60% 50% at 70% 60%, rgba(212,165,116,0.08), transparent),
            linear-gradient(to bottom, rgba(10,6,8,0.3) 0%, rgba(10,6,8,0.6) 50%, var(--bg) 100%)
          `,
        }}
      />

      {/* Floating blur orbs */}
      <div
        style={{
          position: 'absolute',
          width: 520,
          height: 520,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 40% 40%, rgba(232,69,107,0.55), rgba(212,165,116,0.2) 55%, transparent 78%)',
          filter: 'blur(70px)',
          top: '5%',
          left: '2%',
          animation: 'float-drift 9s ease-in-out infinite',
          zIndex: 1,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 380,
          height: 380,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 60% 60%, rgba(212,165,116,0.5), rgba(232,69,107,0.2) 55%, transparent 78%)',
          filter: 'blur(60px)',
          bottom: '15%',
          right: '2%',
          animation: 'float-drift 11s ease-in-out infinite',
          animationDelay: '-4s',
          zIndex: 1,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 260,
          height: 260,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(232,69,107,0.4), rgba(212,165,116,0.18) 50%, transparent 75%)',
          filter: 'blur(50px)',
          top: '38%',
          right: '12%',
          animation: 'float-subtle 7s ease-in-out infinite',
          animationDelay: '-2s',
          zIndex: 1,
        }}
      />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: 900 }}>
        <ScrollReveal>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1.2rem',
              borderRadius: '100px',
              border: '1px solid var(--border)',
              background: 'rgba(212,165,116,0.06)',
              fontSize: '0.75rem',
              fontWeight: 500,
              letterSpacing: '0.12em',
              textTransform: 'uppercase' as const,
              color: 'var(--gold)',
              marginBottom: '2rem',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--rose)',
                display: 'inline-block',
                animation: 'pulse-dot 2s ease infinite',
              }}
            />
            Premium Nail Salon — Guam
          </div>
        </ScrollReveal>

        <ScrollReveal delay={1}>
          <h1
            className="hero-title"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.8rem, 7vw, 5.5rem)',
              fontWeight: 500,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: 'var(--cream)',
              marginBottom: '1.5rem',
            }}
          >
            Where{' '}
            <em style={{ fontStyle: 'italic', color: 'var(--rose-light)' }}>elegance</em>
            <br />
            meets your{' '}
            <span style={{ color: 'var(--gold)' }}>fingertips.</span>
          </h1>
        </ScrollReveal>

        <ScrollReveal delay={2}>
          <p
            className="hero-sub"
            style={{
              fontSize: '1.15rem',
              color: 'rgba(225, 205, 200, 0.75)',
              maxWidth: 550,
              margin: '0 auto 2.5rem',
              lineHeight: 1.8,
              fontWeight: 300,
            }}
          >
            Experience luxury nail care crafted by skilled artisans.
            From classic manicures to stunning nail art — every visit is a masterpiece.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={3}>
          <div className="hero-buttons" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' as const }}>
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '0.9rem 2.5rem',
                borderRadius: '100px',
                background: 'linear-gradient(135deg, var(--rose), #c93a5a)',
                fontSize: '0.85rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase' as const,
                color: '#fff',
                textDecoration: 'none',
                display: 'inline-block',
                transition: 'all 0.4s',
              }}
            >
              Book Appointment
            </a>
            <a
              href="#services"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector('#services')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              style={{
                padding: '0.9rem 2.5rem',
                borderRadius: '100px',
                background: 'transparent',
                border: '1px solid var(--border)',
                fontSize: '0.85rem',
                fontWeight: 500,
                letterSpacing: '0.08em',
                textTransform: 'uppercase' as const,
                color: 'var(--text)',
                textDecoration: 'none',
                display: 'inline-block',
                transition: 'all 0.4s',
              }}
            >
              View Services
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
