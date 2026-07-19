import { defineConfig } from 'vite';

export default defineConfig({
  // Em produção no GitHub Pages, o app fica na subpasta /burger-stock-manager/
  // Em desenvolvimento local, usa a raiz '/'
  base: process.env.NODE_ENV === 'production' ? '/burger-stock-manager/' : '/',
});
