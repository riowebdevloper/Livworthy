import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

import { NycSalaryCalculator } from './components/calculator/NycSalaryCalculator.tsx';
import { isSupportedLocale } from './lib/i18n';

const CORE_CALCULATOR_PATHS = new Set([
  'salary-worth',
  'salary-needed',
  'salary-after-tax',
  'cost-of-living',
  'compare',
  'job-offers',
]);

function isInteractiveAppPath(rawPath: string): boolean {
  const clean = rawPath.replace(/^\/+|\/+$/g, '').replace(/index\.html$/, '').replace(/\/+$/, '');
  if (!clean) return true; // root '/'

  const segments = clean.split('/');
  if (segments.length === 1) {
    // Bare locale root ('es', 'fr', etc.) OR core calculator tool ('compare', 'salary-worth', etc.)
    return isSupportedLocale(segments[0]) || CORE_CALCULATOR_PATHS.has(segments[0]);
  }
  if (segments.length === 2) {
    // Localized calculator tool: 'es/compare', 'de/salary-worth', etc.
    return isSupportedLocale(segments[0]) && CORE_CALCULATOR_PATHS.has(segments[1]);
  }
  return false;
}

const pathname = window.location.pathname;
const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');
const isInteractiveApp = isInteractiveAppPath(pathname);

const rootEl = document.getElementById('root');

if (isAdminRoute && rootEl) {
  import('./components/admin/AdminApp.tsx').then(({ AdminApp }) => {
    createRoot(rootEl).render(
      <StrictMode>
        <AdminApp />
      </StrictMode>,
    );
  });
} else if (isInteractiveApp && rootEl) {
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

