import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSetAtom } from "jotai";
import { FaUser, FaHome, FaRedo } from "react-icons/fa";
import { isNavbarFooterVisibleAtom } from "../../store/uiStore";
import { fetchAnswerKey } from "../../data/answerKeys";
import { scoreTest } from "../../utils/scoring";
import type { ScoreResult } from "../../utils/scoring";
import type { AnswerMap } from "../../types/question";

interface ResultState {
    testTitle: string;
    testType: "listening" | "reading";
    totalQuestions: number;
    timeSpent: string;
    userAnswers: AnswerMap;
    // Server-scored (present when user is authenticated)
    bandScore?: number;
    correctAnswers?: number;
    results?: { questionNumber: number; isCorrect: boolean }[];
}

/** Circular progress ring — matches the test listing page style */
const CircleProgress: React.FC<{
    value: number;
    max: number;
    label: string;
    display: string;
    subLabel?: string;
    colorClass: string;
}> = ({ value, max, label, display, subLabel, colorClass }) => {
    const r = 45;
    const circumference = 2 * Math.PI * r;
    const percent = max > 0 ? Math.max(0, Math.min(100, Math.round((value / max) * 100))) : 0;
    const dashOffset = circumference * (1 - percent / 100);

    return (
        <div className="flex flex-col items-center gap-3">
            <div className="relative w-28 h-28">
                <svg className="absolute inset-0" viewBox="0 0 100 100" aria-hidden>
                    <circle
                        cx="50" cy="50" r={r}
                        stroke="currentColor" strokeWidth="10"
                        fill="none" className="text-gray-200"
                    />
                    <circle
                        cx="50" cy="50" r={r}
                        stroke="currentColor" strokeWidth="10"
                        strokeLinecap="round"
                        fill="none"
                        className={colorClass}
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                        style={{ transition: 'stroke-dashoffset 600ms ease' }}
                        transform="rotate(-90 50 50)"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <div className="text-lg font-bold text-gray-900">{display}</div>
                    {subLabel && <div className="text-xs text-gray-500 mt-0.5">{subLabel}</div>}
                </div>
            </div>
            <span className="text-sm font-medium text-gray-600">{label}</span>
        </div>
    );
};

const TestResultPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { examType, testId } = useParams<{ examType: string; testId: string }>();

    const setNavbarFooterVisible = useSetAtom(isNavbarFooterVisibleAtom);

    useEffect(() => {
        setNavbarFooterVisible(false);
        return () => setNavbarFooterVisible(true);
    }, [setNavbarFooterVisible]);

    const state = location.state as ResultState | undefined;

    const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);

    useEffect(() => {
        if (!state || !testId) return;

        // If server already scored it, use that directly
        if (state.bandScore !== undefined && state.correctAnswers !== undefined) {
            setScoreResult({
                correct: state.correctAnswers,
                total: state.totalQuestions,
                bandScore: state.bandScore,
                results: (state.results ?? []).map((r) => ({
                    questionNumber: r.questionNumber,
                    isCorrect: r.isCorrect,
                    userAnswer: '',
                    correctAnswers: [],
                })),
            });
            return;
        }

        // Fallback: client-side scoring
        fetchAnswerKey(testId, state.testType).then((answerKey) => {
            if (answerKey) setScoreResult(scoreTest(state.userAnswers, answerKey));
        });
    }, [state, testId]);

    if (!state) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <h2 className="text-xl font-semibold mb-4">No results found</h2>
                    <button
                        onClick={() => navigate("/")}
                        className="bg-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors cursor-pointer"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    const { testTitle, testType, totalQuestions, timeSpent, userAnswers } = state;
    const correctAnswers = scoreResult?.correct ?? 0;
    const bandScore = scoreResult?.bandScore ?? 0;

    const isListening = testType === "listening";
    const ringColor = isListening ? "text-orange-500" : "text-green-700";
    const accentBg = isListening ? "bg-orange-500 hover:bg-orange-600 border-orange-500" : "bg-green-700 hover:bg-green-800 border-green-700";
    const accentOutline = isListening
        ? "bg-white text-orange-600 border-orange-500 hover:bg-orange-50"
        : "bg-white text-green-700 border-green-700 hover:bg-green-50";

    const bookMatch = testId?.match(/^(book-\d+)(?:-reading)?-(test-\d+)$/);
    const bookNum = bookMatch ? bookMatch[1].replace("book-", "C") : null;
    const testNum = bookMatch ? bookMatch[2].replace("test-", "Test ") : null;
    const headerTitle = bookNum && testNum
        ? `${bookNum} ${isListening ? "Listening" : "Reading"} ${testNum} Academic`
        : testTitle ?? "Test Result";

    const handleHome = () => navigate("/");
    const handleRetake = () => {
        const route = isListening
            ? `/${examType}/listening/${testId}`
            : `/${examType}/reading/${testId}`;
        navigate(route);
    };
    const handleReview = () => {
        navigate(`/${examType}/${testType}/${testId}/review`, {
            state: {
                testTitle,
                testType,
                userAnswers,
                scoreResult,
            },
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <header className="bg-white border-b-2 border-gray-100 px-6 py-4 flex items-center justify-between">
                <h1 className="text-lg font-bold text-gray-800">{headerTitle}</h1>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleHome}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors border-2 cursor-pointer ${accentOutline}`}
                    >
                        <FaHome size={14} />
                        Home
                    </button>
                    <button
                        onClick={handleRetake}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors border-2 text-white cursor-pointer ${accentBg}`}
                    >
                        <FaRedo size={12} />
                        Retake
                    </button>
                </div>
            </header>

            {/* Content */}
            <div className="max-w-3xl mx-auto py-12 px-6">
                {/* User Profile */}
                <div className="flex flex-col items-center mb-10">
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-3">
                        <FaUser size={28} className="text-gray-500" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-800">Test Taker</h2>
                </div>

                {/* Score Card */}
                <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm p-8">
                    <h3 className="text-center text-xl font-bold text-gray-800 mb-8">Your Score</h3>

                    {/* Score Circles */}
                    <div className="flex justify-center gap-16 mb-10">
                        <CircleProgress
                            value={correctAnswers}
                            max={totalQuestions}
                            label="Correct Answers"
                            display={`${correctAnswers}/${totalQuestions}`}
                            colorClass={ringColor}
                        />
                        <CircleProgress
                            value={bandScore}
                            max={9}
                            label="Band Score"
                            display={bandScore > 0 ? bandScore.toFixed(1) : "--"}
                            colorClass={ringColor}
                        />
                        <CircleProgress
                            value={1}
                            max={1}
                            label="Time Spent"
                            display={timeSpent}
                            colorClass={ringColor}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-center gap-3">
                        <button
                            onClick={handleReview}
                            className={`px-6 py-2.5 rounded-lg font-medium transition-colors border-2 text-white cursor-pointer ${accentBg}`}
                        >
                            Enter Review & Explanations
                        </button>
                        <button
                            onClick={handleHome}
                            className="px-6 py-2.5 rounded-lg font-medium transition-colors border-2 border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer"
                        >
                            Back to Homepage
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestResultPage;
