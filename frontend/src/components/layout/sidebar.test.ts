import { describe, expect, it } from 'vitest';
import { buildLogoSrc, getDesktopLogoBaseName } from '../../lib/sidebar-logo';

describe('sidebar logo selection', () => {
  it('uses icon logo when desktop sidebar is collapsed', () => {
    expect(getDesktopLogoBaseName(true)).toBe('lovely-nails-transparent-icon');
  });

  it('builds the dark icon logo path for collapsed desktop mode', () => {
    expect(buildLogoSrc(getDesktopLogoBaseName(true), 'dark')).toBe(
      '/assets/logos/lovely-nails-transparent-icon-dark.svg',
    );
  });
});