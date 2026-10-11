import { defineConfig } from 'vite';

export default defineConfig(async () => {
  let plugins = [];
  try {
    const { default: vinext } = await import('vinext');
    plugins.push(vinext());
  } catch {
    // vinext dynamically resolved in Cloudflare build environment
  }

  return {
    plugins,
  };
});
