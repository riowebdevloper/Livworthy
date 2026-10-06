import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { LocaleProvider } from './i18n/runtime.tsx';

import { NycSalaryCalculator } from './components/calculator/NycSalaryCalculator.tsx';

const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
const isHomepage = pathname === '/' || pathname === '';
const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');

const rootEl = document.getElementById('root');

if (isAdminRoute && rootEl) {
  import('./components/admin/AdminApp.tsx').then(({ AdminApp }) => {
    createRoot(rootEl).render(
      <StrictMode>
        <AdminApp />
      </StrictMode>,
    );
  });
} else if (isHomepage && rootEl) {
  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} else {
  // Mount interactive calculator island into designated landing page container.
  // Prerendered institutional and SEO pages remain standalone static documents.
  const calcEl = document.getElementById('interactive-salary-calculator');
  if (calcEl) {
    createRoot(calcEl).render(
      <StrictMode>
        <NycSalaryCalculator />
      </StrictMode>,
    );
  }
}
