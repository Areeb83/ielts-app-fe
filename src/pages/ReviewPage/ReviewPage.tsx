import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSetAtom } from "jotai";
import { IoClose } from "react-icons/io5";
import { isNavbarFooterVisibleAtom } from "../../store/uiStore";
import ReportMistakeButton from "../../components/TestDetailComponents/ReportMistakeButton";
import Footer from "../../components/TestDetailComponents/Footer";
import QuestionRenderer from "../../components/TestDetailComponents/QuestionTypes/QuestionRenderer";
import ReadingPassage from "../../components/TestDetailComponents/TestDetailContainer/ReadingPassage";
import SplitPane from "../../components/ui/SplitPane/SplitPane";
import { getTestData } from "../../data/testDataMaps";
import { getAnswerKey } from "../../data/answerKeys";
import { scoreTest } from "../../utils/scoring";
import type { AnswerMap, MatchingHeadingData } from "../../types/question";
import type { ScoreResult, QuestionResult } from "../../utils/scoring";
import "../../styles/TestPagesStyle.css";
import "./ReviewPage.css";

interface ReviewState {
    testTitle: string;
    testType: "listening" | "reading";
    userAnswers: AnswerMap;
    scoreResult: ScoreResult;
}

/** Clean answer list shown below each question group */
const ReviewAnswerList: React.FC<{
    startQuestion: number;
    endQuestion: number;
    results: QuestionResult[];
}> = ({ startQuestion, endQuestion, results }) => {
    const groupResults = results.filter(
        r => r.questionNumber >= startQuestion && r.questionNumber <= endQuestion
    );
    if (groupResults.length === 0) return null;

    return (
        <div className="review-answer-group">
            <div className="review-answer-heading">
                Answers {startQuestion}–{endQuestion}
            </div>
            <div className="review-answer-list">
                {groupResults.map((r) => (
                    <div
                        key={r.questionNumber}
                        className={`review-answer-item ${r.isCorrect ? "review-correct" : "review-incorrect"}`}
                    >
                        <div className="review-answer-row">
                            <span className="review-q-num">{r.questionNumber}</span>
                            <span className="review-answer-text">
                                <span className="review-label">Answer: </span>
                                {r.correctAnswers.join(" | ")}
                            </span>
                        </div>
                        {!r.isCorrect && r.userAnswer && (
                            <div className="review-your-answer">
                                Your answer: <span>{r.userAnswer}</span>
                            </div>
                        )}
                        <div className="review-actions">
                            <button className="review-action-btn">Explain</button>
                            <button className="review-action-btn">Locate</button>
                            <button className="review-action-btn">Report</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ReviewPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { examType, testId } = useParams<{ examType: string; testId: string }>();

    const setNavbarFooterVisible = useSetAtom(isNavbarFooterVisibleAtom);

    useEffect(() => {
        setNavbarFooterVisible(false);
        return () => setNavbarFooterVisible(true);
    }, [setNavbarFooterVisible]);

    const state = location.state as ReviewState | undefined;

    // Load test data and score — infer testType from URL if state is missing
    const testType = state?.testType ?? (location.pathname.includes("/listening/") ? "listening" : "reading");
    const testData = testId ? getTestData(testId, testType) : null;
    const userAnswers = state?.userAnswers ?? {};

    const scoreResult = useMemo(() => {
        if (state?.scoreResult) return state.scoreResult;
        if (!testId) return null;
        const answerKey = getAnswerKey(testId, testType);
        if (!answerKey) return null;
        return scoreTest(userAnswers, answerKey);
    }, [state, testId, testType, userAnswers]);

    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

    if (!testData || !scoreResult) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <h2 className="text-xl font-semibold mb-4">No review data found</h2>
                    <button
                        onClick={() => navigate("/")}
                        className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-900 cursor-pointer"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    const isListening = testType === "listening";
    const bookMatch = testId?.match(/^(book-\d+)(?:-reading)?-(test-\d+)$/);
    const bookNum = bookMatch ? bookMatch[1].replace("book-", "C") : null;
    const testNum = bookMatch ? bookMatch[2].replace("test-", "Test ") : null;
    const headerTitle = bookNum && testNum
        ? `${bookNum} ${isListening ? "Listening" : "Reading"} ${testNum} Academic — Review`
        : `${state?.testTitle ?? "Test"} — Review`;

    const handleClose = () => navigate(-1);

    const currentSection = testData.sections[currentSectionIndex];
    const totalSections = testData.sections.length;

    // No-op for review mode — answers are read-only
    const noOp = () => {};

    // ─── Right pane: Clean answer list ───────────────────────────────────
    const handlePrevious = () => setCurrentSectionIndex(prev => Math.max(prev - 1, 0));
    const handleNext = () => setCurrentSectionIndex(prev => Math.min(prev + 1, totalSections - 1));
    const handleSectionClick = (sectionNumber: number) => setCurrentSectionIndex(sectionNumber - 1);

    const renderQuestionsPane = () => (
        <div style={{ padding: '0 10px' }}>
            {/* Section header */}
            {currentSection && (
                <div className="section-header-banner" style={{ marginBottom: 24 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: "#333", margin: 0 }}>
                        {currentSection.title} — Questions {currentSection.questionGroups[0]?.startQuestion}–{currentSection.questionGroups[currentSection.questionGroups.length - 1]?.endQuestion}
                    </h2>
                </div>
            )}

            {/* Question groups + answer list */}
            <div className="flex flex-col gap-5">
                {currentSection?.questionGroups.map((group, index) => (
                    <div key={`${currentSection.sectionNumber}-${index}`}>
                        <QuestionRenderer
                            group={group}
                            answers={userAnswers}
                            onAnswerChange={noOp}
                            testType={testType}
                            reviewMode
                        />
                        <ReviewAnswerList
                            startQuestion={group.startQuestion}
                            endQuestion={group.endQuestion}
                            results={scoreResult.results}
                        />
                    </div>
                ))}
            </div>
        </div>
    );

    // ─── Left pane: Reading passage ─────────────────────────────────────
    const renderPassagePane = () => {
        if (!currentSection?.passage) {
            return (
                <div className="flex items-center justify-center h-full text-gray-400 p-10">
                    <p>{isListening ? "Transcript not available yet" : "No passage available"}</p>
                </div>
            );
        }

        const headingLookup: Record<string, string> = {};
        for (const group of currentSection.questionGroups) {
            if (group.type === 'MATCHING_HEADING') {
                const headingData = group.data as MatchingHeadingData;
                for (const heading of headingData.headings) {
                    const match = heading.match(/^([ivxlc]+)\s+/i);
                    if (match) {
                        headingLookup[match[1].toLowerCase()] = heading.replace(/^[ivxlc]+\s+/i, '').trim();
                    }
                }
            }
        }

        return (
            <ReadingPassage
                testId={testData.testId}
                sectionIndex={currentSectionIndex}
                data={currentSection.passage}
                answers={userAnswers}
                onAnswerChange={noOp}
                draggingWordId={null}
                onDragStart={noOp}
                onDragEnd={noOp}
                headingLookup={headingLookup}
            />
        );
    };

    return (
        <div className="listening-test-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            {/* Navbar */}
            <header className="header">
                <h1 className="text-lg font-bold text-gray-800">{headerTitle}</h1>
                <div className="flex items-center gap-3" style={{ marginLeft: 'auto' }}>
                    <ReportMistakeButton />
                    <button
                        onClick={handleClose}
                        aria-label="Close review"
                        className="header__report-btn"
                    >
                        <IoClose size={20} />
                    </button>
                </div>
            </header>

            {/* Content */}
            <main className="test-content" style={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ flexGrow: 1, overflow: 'hidden' }}>
                    <SplitPane
                        leftPane={renderPassagePane()}
                        rightPane={renderQuestionsPane()}
                    />
                </div>
            </main>

            {/* Footer */}
            <Footer
                currentQuestion={currentSectionIndex + 1}
                totalQuestions={totalSections}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onQuestionClick={handleSectionClick}
            />
        </div>
    );
};

export default ReviewPage;
