import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import svgr from 'vite-plugin-svgr';
import path from "path";
import { plugin as mdPlugin, Mode} from 'vite-plugin-markdown'

export default defineConfig({
  base: "/",
  plugins: [react(), svgr(), mdPlugin({
    mode: [Mode.HTML],
    markdownIt: {
      html: true,
      linkify: true,
      typographer: true
    }
  })],
  build: {
    outDir: "build",
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
})