import { createRoot } from 'react-dom/client';
import { configureHttp } from '@/core/api';
import { App } from '@/web/App';
import '@/web/styles.css';

// La web habla con la API en el mismo dominio (Vite hace de proxy en desarrollo).
configureHttp({ baseUrl: import.meta.env.VITE_API_URL ?? '/api/v1' });

createRoot(document.getElementById('root')!).render(<App />);
