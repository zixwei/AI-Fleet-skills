import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  plugins: [react()],
  build: { license: { fileName: 'THIRD_PARTY_LICENSES.md' } },
});
