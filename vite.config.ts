import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vitest/config';

const filename = fileURLToPath(import.meta.url);
const rootDir = dirname(filename);

export default defineConfig({
  test: {
    setupFiles: ['./test/expectExtensions.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': join(rootDir, './'),
    },
  },
});
