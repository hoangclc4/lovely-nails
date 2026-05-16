import { TAGS } from '@/lib/constants';

export function TagsMarquee() {
  const doubled = [...TAGS, ...TAGS];

  return (
    <div style={{ padding: '2rem 0', overflow: 'hidden', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', gap: '1rem', animation: 'marquee 30s linear infinite' }}>
        {doubled.map((tag, i) => (
          <span
            key={`${tag}-${i}`}
            style={{
              flexShrink: 0,
              padding: '0.6rem 1.5rem',
              borderRadius: '100px',
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              whiteSpace: 'nowrap',
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
