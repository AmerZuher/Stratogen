import { createRoot } from "react-dom/client";
import { ThemeProvider } from "./providers/ThemeContext.tsx";
import { AuthProvider } from "./providers/AuthContext.tsx";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from "./App.tsx";
import "./styles/index.css";
const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <App />
        
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);
