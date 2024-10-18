import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import svgr from 'vite-plugin-svgr';
import path from "path"

export default defineConfig({
    base: '/',
    plugins: [react(), svgr()],
    build: {
        outDir: 'build'
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
})