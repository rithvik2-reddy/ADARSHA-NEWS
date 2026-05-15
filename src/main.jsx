import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { ThemeProvider, LangProvider, NewsProvider } from './context/providers.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <ThemeProvider>
        <LangProvider>
          <NewsProvider>
            <BrowserRouter>
              <App />
              <Toaster position="top-right" toastOptions={{ style: { background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)' } }} />
            </BrowserRouter>
          </NewsProvider>
        </LangProvider>
      </ThemeProvider>
    </HelmetProvider>
  </React.StrictMode>
);
