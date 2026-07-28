import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: '/', destination: '/sr', permanent: true }]
  },
}

export default nextConfig
