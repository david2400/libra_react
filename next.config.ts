import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const shouldEmitStandalone = process.env.NEXT_OUTPUT_STANDALONE === 'true';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // swcMinify: true,
  output: shouldEmitStandalone ? 'standalone' : undefined,
  transpilePackages: ['@repo/ui'],
};

export default withNextIntl(nextConfig);
