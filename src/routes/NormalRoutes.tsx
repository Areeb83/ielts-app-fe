import { Routes, Route } from "react-router-dom";
import { HomePage } from "../pages/HomePage";
import { ListeningTestsPage } from "../pages/ListeningTestsPage";
import { ReadingTestsPage } from "../pages/ReadingTestsPage";
import { WritingTestsPage } from "../pages/WritingTestsPage";
import { SpeakingTestsPage } from "../pages/SpeakingTestsPage";
import { AcademicTestsPage } from "../pages/AcademicTestsPage";
import { GeneralTestsPage } from "../pages/GeneralTestsPage";
import { PricingPage } from "../pages/PricingPage";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { ForgotPasswordPage } from "../pages/ForgotPasswordPage";
import { ProfilePage } from "../pages/ProfilePage";
import { ProgressPage } from "../pages/ProgressPage";
import { ListeningTestActualPage } from "../pages/ListeningTestPage/ListeningTestActualPage";
import { ReadingTestActualPage } from "../pages/ReadingTestPage/ReadingTestActualPage";
import TestResultPage from "../pages/TestResultPage/TestResultPage";
import ReviewPage from "../pages/ReviewPage/ReviewPage";
import { ROUTES } from "../constants";

const NormalRoutes = () => {
    return (
        <Routes>
            <Route path={ROUTES.HOME} element={<HomePage />} />
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
            <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
            <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
            <Route path={ROUTES.PROGRESS} element={<ProgressPage />} />

            {/* Dynamic exam type routes: :examType will be "academic" or "general" */}
            <Route path={ROUTES.LISTENING} element={<ListeningTestsPage />} />
            <Route path={ROUTES.LISTENING_TEST} element={<ListeningTestActualPage />} />
            <Route path={ROUTES.READING} element={<ReadingTestsPage />} />
            <Route path={ROUTES.READING_TEST} element={<ReadingTestActualPage />} />
            <Route path={ROUTES.LISTENING_RESULT} element={<TestResultPage />} />
            <Route path={ROUTES.READING_RESULT} element={<TestResultPage />} />
            <Route path={ROUTES.LISTENING_REVIEW} element={<ReviewPage />} />
            <Route path={ROUTES.READING_REVIEW} element={<ReviewPage />} />
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