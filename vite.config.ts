import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path";

export default defineConfig({
  plugins: [react()],
  // base: '/app/',
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('react-router-dom')) {
            return 'react-vendor';
          }

          if (id.includes('@tanstack/react-query') || id.includes('/axios/') || id.includes('/zustand/') || id.includes('/zod/')) {
            return 'data-vendor';
          }

          if (id.includes('/framer-motion/')) {
            return 'motion-vendor';
          }

          if (id.includes('/lucide-react/')) {
            return 'icons-vendor';
          }

          if (id.includes('/recharts/')) {
            return 'charts-vendor';
          }

          if (id.includes('@fullcalendar')) {
            return 'calendar-vendor';
          }

          return undefined;
        },
      },
    },
  },
})
