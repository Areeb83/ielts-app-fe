import { useEffect } from "react";
import { BrowserRouter, useLocation } from "react-router-dom";
import { useAtomValue } from "jotai";
import { ScrollToTop } from "./components/ScrollToTop";
import { Navbar } from "./components/Navbar";
import BaseRoutes from './routes';
import { Footer } from './components/Footer';
import { isNavbarFooterVisibleAtom, isFooterVisibleAtom } from './store/uiStore';
import { useAuth } from './hooks/useAuth';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from 'sonner';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Pages that should never show navbar and footer
const HIDE_NAVBAR_FOOTER_PATHS = ['/login', '/register', '/forgot-password'];
// Pages that should hide only the footer
const HIDE_FOOTER_PATHS = ['/profile', '/progress'];

function AppContent() {
  const isVisible = useAtomValue(isNavbarFooterVisibleAtom);
  const isFooterVisible = useAtomValue(isFooterVisibleAtom);
  const { hydrate } = useAuth();
  const { pathname } = useLocation();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Check route-level overrides (no flicker — computed synchronously on render)
  const hideNavbarFooter = HIDE_NAVBAR_FOOTER_PATHS.includes(pathname);
  const hideFooterOnly = HIDE_FOOTER_PATHS.includes(pathname);

  const showNavbar = !hideNavbarFooter && isVisible;
  const showFooter = !hideNavbarFooter && !hideFooterOnly && isVisible && isFooterVisible;

  return (
    <>
      <ScrollToTop />
      {showNavbar && <Navbar />}
      <BaseRoutes />
      {showFooter && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <ErrorBoundary>
        <BrowserRouter>
          <AppContent />
          <Toaster position="bottom-right" richColors />
        </BrowserRouter>
      </ErrorBoundary>
    </GoogleOAuthProvider>
  );
}
