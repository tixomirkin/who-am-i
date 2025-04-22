import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import path from "path"

import dotenv from 'dotenv';
dotenv.config();

// https://vite.dev/config/
export default defineConfig(() => {
    return {plugins: [
        TanStackRouterVite({ target: 'react', autoCodeSplitting: true }),
        react(),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:1999',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '')
            }
        }
    },
    define: {
        __APP_ENV__: process.env.VITE_VERCEL_ENV,
    }
}})
