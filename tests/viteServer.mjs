import { createServer as createViteServer } from 'vite'

// Node 24のnative loaderでWindows sandboxの反復起動時のrealpathエラーを避ける。
export const createServer = options => createViteServer({
  ...options,
  configLoader: process.platform === 'win32' ? 'native' : options.configLoader,
})
