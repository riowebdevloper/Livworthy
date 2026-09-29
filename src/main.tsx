import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// The React SPA is only mounted on the homepage (/).
// Prerendered institutional and SEO pages (/about, /methodology, /countries/*, etc.)
// are standalone static documents and must NOT be replaced by the SPA calculator.
const isHomepage = typeof window !== 'undefined' && (window.location.pathname === '/' || window.location.pathname === '');
if (isHomepage) {
  const rootEl = document.getElementById('root');
  if (rootEl) {
    createRoot(rootEl).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  }
}

