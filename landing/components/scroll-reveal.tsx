'use client';

import { useEffect, useRef, type ReactNode } from 'react';

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  variant?: 'reveal' | 'reveal-left' | 'reveal-right';
  delay?: 1 | 2 | 3 | 4 | 5;
};

export function ScrollReveal({ children, className = '', variant = 'reveal', delay }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0, rootMargin: '0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const delayClass = delay ? `stagger-${delay}` : '';

  return (
    <div ref={ref} className={`${variant} ${delayClass} ${className}`.trim()}>
      {children}
    </div>
  );
}
