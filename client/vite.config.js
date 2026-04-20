import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,         // Required for Docker/Termux
    port: 5173,         // Standard Vite port
    allowedHosts: true, // Crucial for zrok tunnels
    strictPort: true    // Keeps it on 5173
  }
})