const MOBILE_LOGO_BASE_NAME = 'lovely-nails-transparent-stacked';
const DESKTOP_LOGO_BASE_NAME = 'lovely-nails-transparent-horizontal';
const COLLAPSED_DESKTOP_LOGO_BASE_NAME = 'lovely-nails-transparent-icon';

export const LIGHT_LOGO_SUFFIX = 'light';
export const DARK_LOGO_SUFFIX = 'dark';

type LogoSuffix = typeof LIGHT_LOGO_SUFFIX | typeof DARK_LOGO_SUFFIX;

export function buildLogoSrc(baseName: string, suffix: LogoSuffix) {
  return `/assets/logos/${baseName}-${suffix}.svg`;
}

export function getDesktopLogoBaseName(isCollapsed: boolean) {
  if (isCollapsed) {
    return COLLAPSED_DESKTOP_LOGO_BASE_NAME;
  }

  return DESKTOP_LOGO_BASE_NAME;
}

export function getMobileLogoBaseName() {
  return MOBILE_LOGO_BASE_NAME;
}