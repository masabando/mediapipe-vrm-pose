import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import basicSsl from '@vitejs/plugin-basic-ssl'


// https://vite.dev/config/
export default defineConfig({
  // eslint-disable-next-line
  base: process.env.VITE_BUILD ? '/mediapipe-vrm-pose/' : './',
  server: {
    host: true
  },
  build: {
    outDir: 'docs',
  },
  plugins: [react(), basicSsl()],
})
