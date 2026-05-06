'use client';

import { useEffect, useRef } from 'react';
import { STATS } from '@/lib/constants';
import { ScrollReveal } from './scroll-reveal';

function AnimatedStat({ animateTo, display, label, delay }: {
  animateTo: number | null;
  display: string;
  label: string;
  delay: 1 | 2 | 3 | 4;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!animateTo || !ref.current) return;
    const el = ref.current;
    let counted = false;
    let timer: ReturnType<typeof setInterval>;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && !counted) {
        counted = true;
        const isDecimal = animateTo < 10;
        const increment = animateTo / 60;
        let current = 0;

        timer = setInterval(() => {
          current += increment;
          if (current >= animateTo) {
            current = animateTo;
            clearInterval(timer);
          }
          el.textContent = isDecimal
            ? `${current.toFixed(1)}★`
            : `${Math.floor(current).toLocaleString()}+`;
        }, 20);
      }
    }, { threshold: 0.5 });

    observer.observe(el);
    return () => {
      observer.disconnect();
      clearInterval(timer);
    };
  }, [animateTo]);

  return (
    <ScrollReveal delay={delay}>
      <div style={{ textAlign: 'center' }}>
        <div
          ref={ref}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2.5rem',
            fontWeight: 600,
            background: 'var(--stat-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {display}
        </div>
        <div style={{ fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)', marginTop: '0.3rem' }}>
          {label}
        </div>
      </div>
    </ScrollReveal>
  );
}

export function Stats() {
  return (
    <div
      className="stats-grid"
      style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '4rem',
        flexWrap: 'wrap',
        padding: '3rem',
        background: 'var(--stats-bg)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {STATS.map((stat, i) => (
        <AnimatedStat
          key={stat.label}
          animateTo={stat.animateTo}
          display={stat.number}
          label={stat.label}
          delay={(i + 1) as 1 | 2 | 3 | 4}
        />
      ))}
    </div>
  );
}
