import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { ListeningTestsPage } from "./pages/ListeningTestsPage";``
import { ReadingTestsPage } from "./pages/ReadingTestsPage";
import { WritingTestsPage } from "./pages/WritingTestsPage";
import { SpeakingTestsPage } from "./pages/SpeakingTestsPage";
import { PricingPage } from "./pages/PricingPage";
import { ScrollToTop } from "./components/ScrollToTop";
import { Navbar } from "./components/Navbar";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/listening"
          element={<ListeningTestsPage />}
        />
        <Route path="/reading" element={<ReadingTestsPage />} />
        <Route path="/writing" element={<WritingTestsPage />} />
        <Route
          path="/speaking"
          element={<SpeakingTestsPage />}
        />
        <Route path="/pricing" element={<PricingPage />} />
      </Routes>
    </BrowserRouter>
  );
}