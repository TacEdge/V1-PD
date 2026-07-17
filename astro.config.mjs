import { defineConfig } from 'astro/config';

// Static documentation site — no server runtime, no database.
export default defineConfig({
  output: 'static',
  site: 'https://v1-pd.tacedge.internal',
  trailingSlash: 'never',
  build: {
    format: 'file',
  },
});
