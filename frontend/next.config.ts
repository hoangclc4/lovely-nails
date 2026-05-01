import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

process.env.TZ = 'Pacific/Guam';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  output: 'standalone',
};

export default withNextIntl(nextConfig);
