/** @type {import('next').NextConfig} */
const defaultBackendApiUrl = 'https://camila-automation.duckdns.org/api'

const nextConfig = {
  // La API de FastAPI usa una barra final. Evita que Next/Vercel responda 308
  // antes de aplicar el rewrite y mantiene intacto el POST multipart + SSE.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    const backendApiUrl = (
      process.env.BACKEND_API_URL || defaultBackendApiUrl
    ).replace(/\/$/, '')

    return [
      {
        source: '/api/upload',
        destination: `${backendApiUrl}/upload/`,
      },
    ]
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'standalone',
}

export default nextConfig
