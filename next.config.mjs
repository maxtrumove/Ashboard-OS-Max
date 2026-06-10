/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      // God Mode is the headline experience — send the bare domain straight to it.
      { source: "/", destination: "/god-mode", permanent: false },
    ];
  },
};

export default nextConfig;
