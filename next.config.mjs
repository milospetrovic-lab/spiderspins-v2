/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['three'],
  // v2 is the experimental branch — skip strict type-check + lint during Vercel
  // build so deploys can ship even while polish is ongoing. Types still checked
  // locally via `tsc --noEmit` and in the editor.
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
