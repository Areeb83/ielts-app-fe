import { Routes, Route } from "react-router-dom";
import { HomePage } from "../pages/HomePage";
import { ListeningTestsPage } from "../pages/ListeningTestsPage";
import { ReadingTestsPage } from "../pages/ReadingTestsPage";
import { WritingTestsPage } from "../pages/WritingTestsPage";
import { SpeakingTestsPage } from "../pages/SpeakingTestsPage";
import { AcademicTestsPage } from "../pages/AcademicTestsPage";
import { GeneralTestsPage } from "../pages/GeneralTestsPage";
import { PricingPage } from "../pages/PricingPage";

const NormalRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />

            {/* Dynamic exam type routes: :examType will be "academic" or "general" */}
            <Route path="/:examType/listening" element={<ListeningTestsPage />} />
            <Route path="/:examType/reading" element={<ReadingTestsPage />} />
            <Route path="/:examType/writing" element={<WritingTestsPage />} />
            <Route path="/:examType/speaking" element={<SpeakingTestsPage />} />

            <Route path="/academic" element={<AcademicTestsPage />} />
            <Route path="/general" element={<GeneralTestsPage />} />
            <Route path="/pricing" element={<PricingPage />} />

            <Route path="*" element={<HomePage />} />
        </Routes>
    );
};

export default NormalRoutes;