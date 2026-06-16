import { BrowserRouter } from "react-router-dom";
import { useAtomValue } from "jotai";
import { ScrollToTop } from "./components/ScrollToTop";
import { Navbar } from "./components/Navbar";
import BaseRoutes from './routes';
import { Footer } from './components/Footer';
import { isNavbarFooterVisibleAtom } from './store/uiStore';
import ErrorBoundary from './components/ErrorBoundary';

function AppContent() {
  const isVisible = useAtomValue(isNavbarFooterVisibleAtom);

  return (
    <>
      <ScrollToTop />
      {isVisible && <Navbar />}
      <BaseRoutes />
      {isVisible && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ErrorBoundary>
  );
}