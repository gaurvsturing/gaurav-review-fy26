import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// For GitHub Pages: set BASE env var to your repo name when building
//   BASE=/gaurav-review-fy26/ npm run build
// For Netlify or root deploys: leave it unset (defaults to '/')
export default defineConfig({
  plugins: [react()],
  base: process.env.BASE || '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
