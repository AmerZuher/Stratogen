// src/config/env.ts

interface EnvConfig {
  ADMIN_DASHBOARD_URL: string;
}

const env: EnvConfig = {
  ADMIN_DASHBOARD_URL: import.meta.env.VITE_ADMIN_DASHBOARD_URL || 'http://164.92.172.11:5000',
};

export default env;
