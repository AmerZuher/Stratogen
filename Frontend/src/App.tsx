// src/App.tsx

import { AppRouter } from './routes';
import { Toaster } from './components/ui/toaster';

function App() {
  return (
    <>
      <Toaster />
      <AppRouter />
    </>
  );
}

export default App;