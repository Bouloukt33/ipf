import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    // Standalone output pour Docker : produit un serveur autonome sans node_modules
    output: 'standalone',
}

export default nextConfig
