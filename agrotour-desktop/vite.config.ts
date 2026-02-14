import { defineConfig } from 'vite'
import path from 'node:path'
import electron from 'vite-plugin-electron/simple'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    base: './', // Critical for Electron (relative paths for file:// protocol)
    plugins: [
        react(),
        electron({
            main: {
                entry: 'electron/main.ts',
            },
            preload: {
                input: 'electron/preload.ts',
            },
            renderer: {},
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@shared': path.resolve(__dirname, '../shared'),
        },
    },
})
