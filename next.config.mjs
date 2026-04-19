/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**"
      }
    ]
  },
  experimental: {
    cpus: 1,
    workerThreads: true,
    imgOptTimeoutInSeconds: 20
  }
};

export default nextConfig;
