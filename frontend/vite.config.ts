import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // 백엔드(Nest)는 글로벌 prefix 없이 /auth, /search 로 열려 있어 경로 그대로 프록시한다.
    // refresh 토큰 쿠키 path가 /auth/refresh 이므로 경로를 바꾸지 않는다.
    proxy: {
      '/auth': 'http://localhost:3000',
      '/search': 'http://localhost:3000',
    },
  },
})
