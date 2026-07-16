import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  // .env file load karo
  const env = loadEnv(mode, process.cwd(), '');

  const backendUrl = env.VITE_BACKEND_URL || 'http://localhost:2911';

  return {
    plugins: [react(), tailwindcss()],

    server: {
      port: 1304,
      strictPort: true,

      // Dev proxy — CORS issues avoid honge
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
        },
        '/oauth2': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
        },
        '/login/oauth2': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
        },
      },
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    build: {
      outDir: 'dist',
      sourcemap: false,
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          manualChunks: {
            // React core alag chunk mein
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            // Video player alag chunk mein (sabse bada)
            'video-vendor': ['video.js'],
            // UI libraries alag chunk mein
            'ui-vendor': ['lucide-react', 'react-toastify', 'flowbite-react'],
            // State management
            'state-vendor': ['zustand', 'axios'],
          },
        },
      },
    },
  };
});
