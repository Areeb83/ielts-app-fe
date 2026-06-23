import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSetAtom } from "jotai";
import { IoClose } from "react-icons/io5";
import { isNavbarFooterVisibleAtom } from "../../store/uiStore";
import ReportMistakeButton from "../../components/TestDetailComponents/ReportMistakeButton";
import Footer, { type FooterPart } from "../../components/TestDetailComponents/Footer";
import QuestionRenderer from "../../components/TestDetailComponents/QuestionTypes/QuestionRenderer";
import ReadingPassage from "../../components/TestDetailComponents/TestDetailContainer/ReadingPassage";
import SplitPane from "../../components/ui/SplitPane/SplitPane";
import { getTestData } from "../../data/testDataMaps";
import { getAnswerKey } from "../../data/answerKeys";
import { getTranscript } from "../../data/transcriptMaps";
import TranscriptPane from "../../components/TestDetailComponents/TranscriptPane/TranscriptPane";
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

    // Build footer parts from test sections
    const footerParts: FooterPart[] = testData.sections.map((section, idx) => {
        const firstGroup = section.questionGroups[0];
        const lastGroup = section.questionGroups[section.questionGroups.length - 1];
        const start = firstGroup?.startQuestion ?? 1;
        const end = lastGroup?.endQuestion ?? start;

        const mergedRanges: [number, number][] = [];
        for (const group of section.questionGroups) {
            if (group.type === 'MULTIPLE_CHOICE' && group.data && 'questions' in group.data) {
                for (const q of (group.data as any).questions) {
                    if (q.multiple) {
                        const match = q.id.match(/^(\d+)\s*[–-]\s*(\d+)$/);
                        if (match) {
                            mergedRanges.push([Number(match[1]), Number(match[2])]);
                        }
                    }
                }
            }
        }

        return {
            id: idx + 1,
            label: `Part ${idx + 1}`,
            questions: Array.from({ length: end - start + 1 }, (_, i) => start + i),
            ...(mergedRanges.length > 0 ? { mergedRanges } : {}),
        };
    });

    const [activeQuestion, setActiveQuestion] = useState(
        currentSection?.questionGroups[0]?.startQuestion ?? 1
    );

    // Find the actual DOM element for a question number (same logic as test detail page)
    const findQuestionElement = (q: number): Element | null => {
        const qStr = String(q);

        const placeholderSelectors = [
            '.fake-placeholder',
            '.table-completion__fake-placeholder',
            '.summary-fake-placeholder',
        ];
        for (const selector of placeholderSelectors) {
            const els = document.querySelectorAll(selector);
            for (const el of els) {
                if (el.textContent?.trim() === qStr) {
                    return el.closest('.input-wrapper, .table-completion__input-wrapper, .summary-input-wrapper') || el;
                }
            }
        }

        const diagNums = document.querySelectorAll('.diagram-labelling__num');
        for (const el of diagNums) {
            if (el.textContent?.trim() === qStr) {
                return el.closest('.diagram-labelling__row') || el;
            }
        }

        const radio = document.querySelector(`input[name="question-${q}"]`);
        if (radio) return radio.closest('tr') || radio;

        const otherSelectors = [
            '.mc-question__number',
            '.paragraph-matching__num',
            '.map-diagram__q-num',
            '.matching-feature__q-num',
            '.sc-dnd__question-number',
            '.dropzone__placeholder',
            '.review-q-num',
        ];
        for (const selector of otherSelectors) {
            const els = document.querySelectorAll(selector);
            for (const el of els) {
                if (el.textContent?.trim() === qStr) {
                    return el.closest('.mc-question, .paragraph-matching__row, .sc-dnd__sentence-row, .flow-chart__step, .dropzone, .review-answer-item') || el;
                }
            }
        }

        return null;
    };

    const handleSelectQuestion = (q: number) => {
        setActiveQuestion(q);
        const sectionIdx = testData.sections.findIndex((section) => {
            const first = section.questionGroups[0]?.startQuestion ?? 0;
            const last = section.questionGroups[section.questionGroups.length - 1]?.endQuestion ?? 0;
            return q >= first && q <= last;
        });

        const scrollTo = () => {
            const el = findQuestionElement(q);
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        };

        if (sectionIdx !== -1 && sectionIdx !== currentSectionIndex) {
            setCurrentSectionIndex(sectionIdx);
            setTimeout(scrollTo, 100);
        } else {
            scrollTo();
        }
    };

    // Build question status map: { "1": "correct", "2": "wrong", ... }
    const questionStatus: Record<string, 'correct' | 'wrong'> = {};
    // Build correct answer map: { "1": ["B"], "2": ["TRUE"], ... }
    const correctAnswerMap: Record<string, string[]> = {};
    if (scoreResult) {
        for (const r of scoreResult.results) {
            questionStatus[String(r.questionNumber)] = r.isCorrect ? 'correct' : 'wrong';
            correctAnswerMap[String(r.questionNumber)] = r.correctAnswers;
        }
    }

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
                            questionStatus={questionStatus}
                            correctAnswerMap={correctAnswerMap}
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

    // Load transcript for listening tests
    const transcriptData = isListening && testId ? getTranscript(testId) : null;

    // ─── Left pane: Reading passage or Listening transcript ──────────────
    const renderPassagePane = () => {
        // Listening: show transcript if available
        if (isListening) {
            const transcriptSection = transcriptData?.sections.find(
                (s) => s.sectionNumber === currentSection?.sectionNumber
            );
            if (transcriptSection) {
                return <TranscriptPane section={transcriptSection} />;
            }
            return (
                <div className="flex items-center justify-center h-full text-gray-400 p-10">
                    <p>Transcript not available yet</p>
                </div>
            );
        }

        // Reading: show passage
        if (!currentSection?.passage) {
            return (
                <div className="flex items-center justify-center h-full text-gray-400 p-10">
                    <p>No passage available</p>
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
                questionStatus={questionStatus}
                isReview={true}
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
                parts={footerParts}
                answers={userAnswers}
                currentQuestion={activeQuestion}
                onSelectQuestion={handleSelectQuestion}
            />
        </div>
    );
};

export default ReviewPage;
