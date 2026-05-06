import { BOOKING_URL } from '@/lib/constants';
import { ScrollReveal } from './scroll-reveal';

export function CTA() {
  return (
    <section style={{ position: 'relative', overflow: 'hidden', padding: '8rem 3rem', textAlign: 'center' }}>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,69,107,0.1), transparent 60%)', filter: 'blur(60px)' }} />
      <div style={{ position: 'relative', zIndex: 2 }}>
        <ScrollReveal>
          <div style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--rose)', fontWeight: 600, marginBottom: '1rem' }}>Ready?</div>
        </ScrollReveal>
        <ScrollReveal delay={1}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 500, lineHeight: 1.2, color: 'var(--heading)', marginBottom: '1.5rem' }}>
            Your nails deserve<br />the <em style={{ fontStyle: 'italic', color: 'var(--rose-light)' }}>Lovely</em> treatment.
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={2}>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', maxWidth: 550, margin: '0 auto 2.5rem', lineHeight: 1.8, fontWeight: 300 }}>
            Book your appointment today and experience the difference that passion and precision make.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={3}>
          <div className="cta-buttons" style={{ display: 'flex', justifyContent: 'center' }}>
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
                textTransform: 'uppercase',
                color: '#fff',
                textDecoration: 'none',
                display: 'inline-block',
                transition: 'all 0.4s',
              }}
            >
              Book Your Appointment
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
