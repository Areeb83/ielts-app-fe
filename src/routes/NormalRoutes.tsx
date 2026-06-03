import { Routes, Route } from "react-router-dom";
import { HomePage } from "../pages/HomePage";
import { ListeningTestsPage } from "../pages/ListeningTestsPage";
import { ReadingTestsPage } from "../pages/ReadingTestsPage";
import { WritingTestsPage } from "../pages/WritingTestsPage";
import { SpeakingTestsPage } from "../pages/SpeakingTestsPage";
import { AcademicTestsPage } from "../pages/AcademicTestsPage";
import { GeneralTestsPage } from "../pages/GeneralTestsPage";
import { PricingPage } from "../pages/PricingPage";
import { ListeningTestActualPage } from "../pages/ListeningTestPage/ListeningTestActualPage";
import { ReadingTestActualPage } from "../pages/ReadingTestPage/ReadingTestActualPage";
import { ROUTES } from "../constants";

const NormalRoutes = () => {
    return (
        <Routes>
            <Route path={ROUTES.HOME} element={<HomePage />} />

            {/* Dynamic exam type routes: :examType will be "academic" or "general" */}
            <Route path={ROUTES.LISTENING} element={<ListeningTestsPage />} />
            <Route path={ROUTES.LISTENING_TEST} element={<ListeningTestActualPage />} />
            <Route path={ROUTES.READING} element={<ReadingTestsPage />} />
            <Route path={ROUTES.READING_TEST} element={<ReadingTestActualPage />} />
            <Route path={ROUTES.WRITING} element={<WritingTestsPage />} />
            <Route path={ROUTES.SPEAKING} element={<SpeakingTestsPage />} />

            <Route path={ROUTES.ACADEMIC} element={<AcademicTestsPage />} />
            <Route path={ROUTES.GENERAL} element={<GeneralTestsPage />} />
            <Route path={ROUTES.PRICING} element={<PricingPage />} />

            <Route path="*" element={<HomePage />} />
        </Routes>
    );
};

export default NormalRoutes;