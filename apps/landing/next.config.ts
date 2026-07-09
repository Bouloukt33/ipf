import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  output: 'standalone',
  // Monorepo npm workspaces : le file tracing doit partir de la racine du repo
  // pour embarquer les dépendances hoistées dans le node_modules racine.
  outputFileTracingRoot: path.join(__dirname, '../../'),
}

export default nextConfig
