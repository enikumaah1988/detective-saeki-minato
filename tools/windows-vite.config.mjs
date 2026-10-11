import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({ plugins: [react()], resolve: { preserveSymlinks: true }, ssr: { external: ['react', 'react-dom'] } })
