import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Windows sandboxではnative realpathを使わず、worktreeの実パスを維持する。
  resolve: { preserveSymlinks: process.platform === 'win32' },
  ssr: { external: ['react', 'react-dom'] },
})
