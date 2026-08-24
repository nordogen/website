import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  outputFileTracingIncludes: { '/**': ['./content/**'] },
  async redirects() {
    return [{ source: '/', destination: '/sr', permanent: true }]
  },
}

export default nextConfig
