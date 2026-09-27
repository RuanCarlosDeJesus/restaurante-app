import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // No GitHub Pages o site fica em /<nome-do-repo>/ (definido no workflow de deploy)
  base: process.env.BASE_PATH ?? '/',
  plugins: [react(), tailwindcss()],
})
