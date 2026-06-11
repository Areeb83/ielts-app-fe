import React, { useState, useRef, useCallback, useEffect } from "react";
import { PiClockLight } from "react-icons/pi";
import Header from "../Header";
import Footer from "../Footer";
import ListeningOverlay from "../ListeningOverlay";
import QuestionRenderer from "../QuestionTypes/QuestionRenderer";
import type { TestData, QuestionGroup, AnswerMap, MatchingHeadingData } from "../../../types/question";
import SplitPane from "../../ui/SplitPane/SplitPane";
import ReadingPassage from "./ReadingPassage";
import HighlightableContainer from "../../Highlightable/HighlightableContainer";
import type { ContainerHighlight } from "../../Highlightable/HighlightableContainer";
import { useAutoScroll } from "../../../hooks";
import audioDurations from "../../../data/audio-durations.json";
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

    // Listening overlay & audio
    const [showListeningOverlay, setShowListeningOverlay] = useState(testType === 'listening');
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const [elapsedTime, setElapsedTime] = useState("--:--");
    const [timeUp, setTimeUp] = useState(false);
    const [volume, setVolume] = useState(1);

    const handleVolumeChange = useCallback((v: number) => {
        setVolume(v);
        if (audioRef.current) {
            audioRef.current.volume = v;
        }
    }, []);

    const handlePlay = useCallback(() => {
        setShowListeningOverlay(false);
        if (audioRef.current) {
            audioRef.current.play().catch(() => {});
        }
    }, []);

    // Countdown timer — listening: based on audio duration, reading: fixed 60 minutes
    const totalDuration = testType === 'listening'
        ? ((audioDurations as Record<string, number>)[testData.testId] ?? 0) + 30
        : 60 * 60;

    const readingStartRef = useRef<number | null>(null);

    useEffect(() => {
        if (testType === 'reading') {
            readingStartRef.current = Date.now();
        }
    }, [testType]);

    const formatRemaining = (seconds: number): string => {
        const m = Math.floor(seconds / 60);
        if (seconds <= 180) {
            const s = seconds % 60;
            return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        }
        return `${m}`;
    };

    useEffect(() => {
        const interval = setInterval(() => {
            let remaining = -1;
            if (testType === 'listening') {
                const audio = audioRef.current;
                if (audio && !audio.paused && totalDuration > 0) {
                    remaining = Math.max(0, Math.floor(totalDuration - audio.currentTime));
                }
            } else if (testType === 'reading' && readingStartRef.current) {
                const elapsed = Math.floor((Date.now() - readingStartRef.current) / 1000);
                remaining = Math.max(0, totalDuration - elapsed);
            }
            if (remaining >= 0) {
                setElapsedTime(formatRemaining(remaining));
                if (remaining === 0) setTimeUp(true);
            }
        }, 500);
        return () => clearInterval(interval);
    }, [testType, totalDuration]);

    // Question-side highlights — scoped per section via sectionIndex
    const [qHighlights, setQHighlights] = useState<(ContainerHighlight & { sectionIndex: number })[]>([]);
    const addQHighlight = (segments: { start: number; end: number }[]) => {
        const groupId = crypto.randomUUID();
        setQHighlights(prev => [
            ...prev,
            ...segments.map(seg => ({
                id: crypto.randomUUID(),
                groupId,
                sectionIndex: currentSectionIndex,
                start: seg.start,
                end: seg.end,
            })),
        ]);
    };
    const removeQHighlight = (groupId: string) => {
        setQHighlights(prev => prev.filter(h => h.groupId !== groupId));
    };

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

    const renderQuestionsPane = () => {
        const content = (
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

        return (
            <HighlightableContainer
                highlights={qHighlights.filter(h => h.sectionIndex === currentSectionIndex)}
                onAdd={addQHighlight}
                onRemove={removeQHighlight}
            >
                {content}
            </HighlightableContainer>
        );
    };


    const renderReadingPassage = () => {
        if (!currentSection || !currentSection.passage) {
            return (
                <div style={{ padding: 40, textAlign: 'center', color: '#718096' }}>
                    <p>No passage content available for this section.</p>
                </div>
            );
        }

        // Build a lookup from Roman numeral id → display text for MATCHING_HEADING questions
        const headingLookup: Record<string, string> = {};
        for (const group of currentSection.questionGroups) {
            if (group.type === 'MATCHING_HEADING') {
                const headingData = group.data as MatchingHeadingData;
                for (const heading of headingData.headings) {
                    const match = heading.match(/^([ivxlc]+)\s+/i);
                    if (match) {
                        const romanId = match[1].toLowerCase();
                        headingLookup[romanId] = heading.replace(/^[ivxlc]+\s+/i, '').trim();
                    }
                }
            }
        }

        return (
            <ReadingPassage
                testId={testData.testId}
                sectionIndex={currentSectionIndex}
                data={currentSection.passage}
                answers={answers}
                onAnswerChange={handleAnswerChange}
                draggingWordId={draggingWordId}
                onDragStart={setDraggingWordId}
                onDragEnd={() => setDraggingWordId(null)}
                headingLookup={headingLookup}
            />
        );
    };

    // Build audio path from testData (e.g. "book-11-test-1" → "/audios/academic/book-11/test-1.mp3")
    const audioSrc = testData.audioSrc || (() => {
        const parts = testData.testId.match(/^(book-\d+)-(test-\d+)$/);
        return parts ? `/audios/academic/${parts[1]}/${parts[2]}.mp3` : '';
    })();

    return (
        <div className="listening-test-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            {/* Listening overlay */}
            {showListeningOverlay && <ListeningOverlay onPlay={handlePlay} />}

            {/* Time's up overlay */}
            {timeUp && (
                <div className="fixed inset-0 bg-black/75 z-[200] flex items-center justify-center">
                    <div className="bg-white rounded-lg py-[60px] px-[60px] text-center w-full max-w-[600px] flex flex-col items-center">
                        <PiClockLight size={60} className="text-gray-700 mb-3" />
                        <h2 className="text-2xl font-bold mb-6">Time's Up!</h2>
                        <button
                            onClick={handleSubmit}
                            className="bg-black text-white border-none rounded px-8 py-3 text-base font-semibold cursor-pointer hover:bg-gray-900"
                        >
                            Submit Test
                        </button>
                    </div>
                </div>
            )}

            {/* Hidden audio element for listening tests */}
            {testType === 'listening' && audioSrc && (
                <audio
                    ref={audioRef}
                    src={audioSrc}
                    preload="auto"
                    onPlay={() => setIsAudioPlaying(true)}
                    onPause={() => setIsAudioPlaying(false)}
                    onEnded={() => setIsAudioPlaying(false)}
                />
            )}

            {/* Header */}
            <Header candidateId={candidateId} testType={testType} isAudioPlaying={isAudioPlaying} elapsedTime={elapsedTime} volume={volume} onVolumeChange={handleVolumeChange} />

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