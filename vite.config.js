import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'ui-vendor': ['lucide-react', 'clsx', 'tailwind-merge'],
          'markdown': ['react-markdown', 'remark-gfm'],
          'supabase': ['@supabase/supabase-js'],
        }
      }
    },
    // Increase chunk size warning limit since we're now splitting properly
    chunkSizeWarningLimit: 300,
    // Enable source maps for better debugging
    sourcemap: true
  },
  // Optimize deps - pre-bundle common dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'lucide-react',
      'clsx',
      'tailwind-merge'
    ]
  }
})