import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  }
})