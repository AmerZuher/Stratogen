import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Use defineConfig with a function to access environment variables
export default defineConfig(({ mode }) => {
  // Load env file based on the current mode (e.g., 'development', 'production')
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      outDir: "dist",
      emptyOutDir: true,
    },
    server: {
      proxy: {
        // This will proxy any request starting with /api
        '/api': {
          // Use the environment variable for the target URL
          target: env.VITE_API_BASE_URL || 'http://backend:8000',
          changeOrigin: true, // Recommended for virtual hosted sites
          secure: false,      // Optional: if your backend is not using HTTPS
          // Optional: rewrite path if your backend doesn't have /api prefix
          // rewrite: (path) => path.replace(/^\/api/, ''), 
        },
      },
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
    },
  };
});
