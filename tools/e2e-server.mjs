import { createServer } from 'vite'
const server = await createServer({
  configLoader: process.platform === 'win32' ? 'native' : undefined,
  cacheDir: '.cache/e2e-vite',
  server: { host: '127.0.0.1', port: Number(process.env.SAEKI_E2E_PORT ?? 5290), strictPort: true },
})
await server.listen()
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, async () => { await server.close(); process.exit(0) })
