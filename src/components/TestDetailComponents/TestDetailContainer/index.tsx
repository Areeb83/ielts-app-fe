import React, { useState } from "react";
import Header from "../Header";
import Footer from "../Footer";
import QuestionRenderer from "../QuestionTypes/QuestionRenderer";
import type { TestData, QuestionGroup, AnswerMap } from "../../../types/question";
import SplitPane from "../../ui/SplitPane/SplitPane";
import ReadingPassage from "./ReadingPassage";
import { useAutoScroll } from "../../../hooks";
import "../../../styles/TestPagesStyle.css";

interface TestDetailContainerProps {
    candidateId: string;
    testData: TestData;
    testType?: 'listening' | 'reading';
}

/**
 * Flattens all question groups across all sections into a single ordered list.
 * This lets us navigate between groups as "pages" in the footer.
 */
function flattenGroups(testData: TestData): QuestionGroup[] {
    const groups: QuestionGroup[] = [];
    for (const section of testData.sections) {
        for (const group of section.questionGroups) {
            groups.push(group);
        }
    }
    return groups;
}

const TestDetailContainer: React.FC<TestDetailContainerProps> = ({
    candidateId,
    testData,
    testType = 'listening',
}) => {
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [answers, setAnswers] = useState<AnswerMap>({});
    const [draggingWordId, setDraggingWordId] = useState<string | null>(null);

    useAutoScroll(!!draggingWordId, { hotZoneTop: testType === 'reading' ? 150 : 90 });

    const totalSections = testData.sections.length;
    const currentSection = testData.sections[currentSectionIndex];

    // ─── Handlers ────────────────────────────────────────────────────────

    const handlePrevious = () => {
        setCurrentSectionIndex((prev) => Math.max(prev - 1, 0));
    };

    const handleNext = () => {
        setCurrentSectionIndex((prev) => Math.min(prev + 1, totalSections - 1));
    };

    const handleSectionClick = (sectionNumber: number) => {
        setCurrentSectionIndex(sectionNumber - 1);
    };

    const handleAnswerChange = (questionId: string, value: string) => {
        setAnswers((prev) => ({ ...prev, [questionId]: value }));
        // If an answer is changed, any active drag is effectively complete.
        // Clearing it here is much more robust than relying on onDragEnd events
        // which can be lost when elements are unmounted during a move.
        setDraggingWordId(null);
    };

    const handleSubmit = () => {
        console.log("User Answers:", answers);
        alert("Submitted! Check the console for your answers.");
    };

    // ─── Render ──────────────────────────────────────────────────────────

    const renderQuestionsPane = () => (
        <div style={{ padding: testType === 'reading' ? '0 10px' : '0' }}>
            {/* Section title banner (Only for Listening or if not handled at top) */}
            {testType === 'listening' && currentSection && (
                <div className="section-header-banner" style={{ marginBottom: 24 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: "#333", margin: 0 }}>
                        {currentSection.title} — Questions {currentSection.questionGroups[0]?.startQuestion}–{currentSection.questionGroups[currentSection.questionGroups.length - 1]?.endQuestion}
                    </h2>
                </div>
            )}

            {/* Question Group Renderers */}
            <div className="section-questions-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {currentSection?.sectionHeading && (
                    <h2 className="section-sub-heading">
                        {currentSection.sectionHeading}
                    </h2>
                )}
                {currentSection ? (
                    currentSection.questionGroups.map((group, index) => (
                        <QuestionRenderer
                            key={`${currentSection.sectionNumber}-${index}`}
                            group={group}
                            answers={answers}
                            onAnswerChange={handleAnswerChange}
                            testType={testType}
                            draggingWordId={draggingWordId}
                            onDragStart={setDraggingWordId}
                            onDragEnd={() => setDraggingWordId(null)}
                        />
                    ))
                ) : (
                    <p>No questions found.</p>
                )}
            </div>
        </div>
    );


    const renderReadingPassage = () => {
        if (!currentSection || !currentSection.passage) {
            return (
                <div style={{ padding: 40, textAlign: 'center', color: '#718096' }}>
                    <p>No passage content available for this section.</p>
                </div>
            );
        }

        return (
            <ReadingPassage
                data={currentSection.passage}
                answers={answers}
                onAnswerChange={handleAnswerChange}
                draggingWordId={draggingWordId}
                onDragStart={setDraggingWordId}
                onDragEnd={() => setDraggingWordId(null)}
            />
        );
    };

    return (
        <div className="listening-test-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            {/* Header */}
            <Header candidateId={candidateId} />

            {/* Main Content */}
            <main className="test-content" style={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {testType === 'reading' && currentSection && (
                    <div className="section-header-banner" >
                        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#333", margin: 0 }}>
                            {currentSection.title} — Questions {currentSection.questionGroups[0]?.startQuestion}–{currentSection.questionGroups[currentSection.questionGroups.length - 1]?.endQuestion}
                        </h2>
                    </div>
                )}

                <div style={{ flexGrow: 1, overflow: 'hidden', overflowY: testType === 'reading' ? 'hidden' : 'auto' }}>
                    {testType === 'reading' ? (
                        <SplitPane
                            leftPane={renderReadingPassage()}
                            rightPane={renderQuestionsPane()}
                        />
                    ) : (
                        renderQuestionsPane()
                    )}
                </div>
            </main>

            {/* Footer — navigates by section */}
            <Footer
                currentQuestion={currentSectionIndex + 1}
                totalQuestions={totalSections}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onQuestionClick={handleSectionClick}
                onSubmit={handleSubmit}
            />
        </div>
    );
};

export default TestDetailContainer;