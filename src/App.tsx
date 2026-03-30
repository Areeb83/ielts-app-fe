import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { ListeningTestsPage } from "./pages/ListeningTestsPage";
import { ReadingTestsPage } from "./pages/ReadingTestsPage";
import { WritingTestsPage } from "./pages/WritingTestsPage";
import { SpeakingTestsPage } from "./pages/SpeakingTestsPage";
import { AcademicTestsPage } from "./pages/AcademicTestsPage";
import { GeneralTestsPage } from "./pages/GeneralTestsPage";
import { PricingPage } from "./pages/PricingPage";
import { ScrollToTop } from "./components/ScrollToTop";
import { Navbar } from "./components/Navbar";
import BaseRoutes from './routes';
import { Footer } from './components/Footer';

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Navbar />
      <BaseRoutes />
      <Footer />
    </BrowserRouter>
  );
}