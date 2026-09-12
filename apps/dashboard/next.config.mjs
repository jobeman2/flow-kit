/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@onboardflow/database', '@onboardflow/web'],
};

export default nextConfig;
