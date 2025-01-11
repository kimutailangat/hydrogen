import path from 'node:path';
import { defineConfig } from 'vite';
import { vitePlugin as remix } from '@remix-run/dev';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';

const { INIT_CWD, GEN_DOCS_PATH } = process.env;

// Validate environment variables
const docsPath = GEN_DOCS_PATH ?? path.join(INIT_CWD, 'docs/generated/generated_docs_data.json');
if (!fs.existsSync(docsPath)) {
  throw new Error(`The file ${docsPath} does not exist. Please set GEN_DOCS_PATH correctly.`);
}

export default defineConfig({
  plugins: [
    remix({
      ignoredRouteFiles: ['**/.*'],
      future: {
        v3_fetcherPersist: false,
        v3_relativeSplatPath: false,
        v3_throwAbortReason: false,
      },
    }),
    tsconfigPaths(),
    tailwindcss(),
    {
      name: 'docs:preview',
      resolveId(id) {
        if (id.startsWith('virtual:docs.json')) {
          return { id: docsPath };
        }
      },
    },
  ],
});
