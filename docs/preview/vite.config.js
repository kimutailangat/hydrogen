import path from 'node:path';
import fs from 'fs';
import { defineConfig } from 'vite';
import { vitePlugin as remix } from '@remix-run/dev';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';

// Destructure required environment variables
const { INIT_CWD, GEN_DOCS_PATH } = process.env;

// Helper function to resolve the docs path
function resolveDocsPath() {
  const resolvedPath = GEN_DOCS_PATH || path.join(INIT_CWD || process.cwd(), 'docs/generated/generated_docs_data.json');

  // Ensure the resolved path exists
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(
      `The required docs file does not exist at the resolved path: ${resolvedPath}. ` +
      'Please ensure the GEN_DOCS_PATH environment variable is correctly set or the docs file exists in the default location.'
    );
  }

  return resolvedPath;
}

// Resolved docs path for use in plugins
const docsPath = resolveDocsPath();

// Define Vite configuration
export default defineConfig({
  plugins: [
    // Remix plugin with future flags enabled
    remix({
      ignoredRouteFiles: ['**/.*'], // Ignore hidden files
      future: {
        v3_fetcherPersist: false,
        v3_relativeSplatPath: false,
        v3_throwAbortReason: false,
      },
    }),
    // Automatically resolve paths from `tsconfig.json`
    tsconfigPaths(),
    // Add Tailwind CSS support
    tailwindcss(),
    // Custom plugin to handle virtual docs path
    {
      name: 'docs:preview',
      resolveId(id) {
        if (id.startsWith('virtual:docs.json')) {
          return {
            id: docsPath, // Return the resolved docs path
          };
        }
      },
      load(id) {
        if (id === docsPath) {
          // Return the content of the docs file
          return fs.readFileSync(docsPath, 'utf-8');
        }
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // Example alias for cleaner imports
    },
  },
  build: {
    sourcemap: true, // Enable sourcemaps for easier debugging
    target: 'esnext', // Target modern browsers
    outDir: 'dist', // Output directory for the build
    rollupOptions: {
      output: {
        chunkFileNames: 'chunks/[name]-[hash].js', // Custom chunk naming
      },
    },
  },
  server: {
    port: 3000, // Specify the development server port
    open: true, // Automatically open the browser
    strictPort: true, // Fail if the port is already in use
  },
});
