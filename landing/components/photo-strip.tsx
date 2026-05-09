'use client';

import { ScrollReveal } from './scroll-reveal';

const BENTO_IMAGES = [
  {
    src: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=800&q=80',
    alt: 'Pink manicure',
    label: 'Manicure',
  },
  {
    src: 'https://images.unsplash.com/photo-1519415387722-a1c3bbef716c?w=500&q=80',
    alt: 'Pedicure spa',
    label: 'Pedicure',
  },
  {
    src: 'https://images.pexels.com/photos/4210343/pexels-photo-4210343.jpeg?auto=compress&cs=tinysrgb&w=500&q=80',
    alt: 'Kids manicure',
    label: 'Kids',
  },
  {
    src: 'https://images.pexels.com/photos/3998013/pexels-photo-3998013.jpeg?auto=compress&cs=tinysrgb&w=500&q=80',
    alt: 'Waxing service',
    label: 'Waxing',
  },
  {
    src: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=500&q=80',
    alt: 'Nail art gel polish',
    label: 'Nail Art',
  },
] as const;

export function PhotoStrip() {
  return (
    <section style={{ padding: '0 3rem 6rem', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <ScrollReveal>
          <div
            className="photo-bento"
            style={{
              display: 'grid',
              gridTemplateColumns: '1.6fr 1fr 1fr',
              gridTemplateRows: '240px 240px',
              gap: '0.625rem',
              borderRadius: 20,
              overflow: 'hidden',
            }}
          >
            {/* Big left image — spans 2 rows */}
            <div style={{ gridRow: 'span 2', position: 'relative', overflow: 'hidden' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={BENTO_IMAGES[0].src}
                alt={BENTO_IMAGES[0].alt}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.05)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'; }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,6,8,0.55) 0%, transparent 50%)' }} />
              <div style={{ position: 'absolute', bottom: '1.25rem', left: '1.5rem' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontStyle: 'italic', color: '#fff', fontWeight: 500 }}>
                  {BENTO_IMAGES[0].label}
                </span>
              </div>
            </div>

            {/* 4 smaller images */}
            {BENTO_IMAGES.slice(1).map((img) => (
              <div key={img.label} style={{ position: 'relative', overflow: 'hidden' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.src}
                  alt={img.alt}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.07)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'; }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,6,8,0.5) 0%, transparent 55%)' }} />
                <div style={{ position: 'absolute', bottom: '1rem', left: '1.1rem' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontStyle: 'italic', color: '#fff', fontWeight: 500 }}>
                    {img.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
