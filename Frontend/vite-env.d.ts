// vite-env.d.ts (at the root of src/ or project root)
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ADMIN_DASHBOARD_URL: string;
  // more environment variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
