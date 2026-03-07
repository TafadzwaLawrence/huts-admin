/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
        pathname: '/f/**',
      },
      {
        protocol: 'https',
        hostname: '*.ufs.sh',
        pathname: '/f/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
}
