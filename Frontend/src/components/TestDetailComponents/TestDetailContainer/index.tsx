import React, { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PiClockLight } from "react-icons/pi";
import Header from "../Header";
import Footer, { type FooterPart } from "../Footer";
import ListeningOverlay from "../ListeningOverlay";
import QuestionRenderer from "../QuestionTypes/QuestionRenderer";
import type { TestData, QuestionGroup, AnswerMap, MatchingHeadingData } from "../../../types/question";
import SplitPane from "../../ui/SplitPane/SplitPane";
import ReadingPassage from "./ReadingPassage";
import HighlightableContainer from "../../Highlightable/HighlightableContainer";
import type { ContainerHighlight } from "../../Highlightable/HighlightableContainer";
import { useAutoScroll } from "../../../hooks";
import audioDurations from "../../../data/audio-durations.json";
import axiosInstance from "../../../api/axiosInstance";
import { getAccessToken } from "../../../api/axiosInstance";
import { toast } from "sonner";
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
    const navigate = useNavigate();
    const { examType, testId: routeTestId } = useParams<{ examType: string; testId: string }>();
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [answers, setAnswers] = useState<AnswerMap>({});
    const [draggingWordId, setDraggingWordId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [activeQuestion, setActiveQuestion] = useState(1);

    // Listening overlay & audio
    const [showListeningOverlay, setShowListeningOverlay] = useState(testType === 'listening');
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const [elapsedTime, setElapsedTime] = useState("--:--");
    const [timeUp, setTimeUp] = useState(false);
    const [volume, setVolume] = useState(() => {
        const saved = localStorage.getItem('ielts_volume');
        return saved !== null ? parseFloat(saved) : 1;
    });

    // Set audio volume on initial load
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, []);

    const handleVolumeChange = useCallback((v: number) => {
        setVolume(v);
        localStorage.setItem('ielts_volume', String(v));
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
                if (remaining === 0 && !timeUp) {
                    setTimeUp(true);
                }
            }
        }, 500);
        return () => clearInterval(interval);
    }, [testType, totalDuration, timeUp]);

    // Auto-submit when time runs out
    useEffect(() => {
        if (timeUp && !submitting) {
            const timer = setTimeout(() => {
                handleSubmit();
            }, 3000); // 3 second countdown before auto-submit
            return () => clearTimeout(timer);
        }
    }, [timeUp]);

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

    // Build footer parts from test sections
    const footerParts: FooterPart[] = testData.sections.map((section, idx) => {
        const firstGroup = section.questionGroups[0];
        const lastGroup = section.questionGroups[section.questionGroups.length - 1];
        const start = firstGroup?.startQuestion ?? 1;
        const end = lastGroup?.endQuestion ?? start;

        // Detect multi-select MC questions to merge in footer
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

    // Find the actual DOM element for a question number
    // Returns { scrollTarget, focusTarget } — scrollTarget for scrollIntoView, focusTarget for .focus()
    const findQuestionElement = (q: number) => {
        const qStr = String(q);

        // 1. Text inputs: fake-placeholder spans sit next to the <input> inside a wrapper
        const placeholderSelectors = [
            '.fake-placeholder',
            '.table-completion__fake-placeholder',
            '.summary-fake-placeholder',
        ];
        for (const selector of placeholderSelectors) {
            const els = document.querySelectorAll(selector);
            for (const el of els) {
                if (el.textContent?.trim() === qStr) {
                    const wrapper = el.closest('.input-wrapper, .table-completion__input-wrapper, .summary-input-wrapper');
                    const input = wrapper?.querySelector('input') as HTMLElement | null;
                    return { scrollTarget: wrapper || el, focusTarget: input };
                }
            }
        }

        // 2. DiagramLabelling: number span next to input in a row
        const diagNums = document.querySelectorAll('.diagram-labelling__num');
        for (const el of diagNums) {
            if (el.textContent?.trim() === qStr) {
                const row = el.closest('.diagram-labelling__row');
                const input = row?.querySelector('input') as HTMLElement | null;
                return { scrollTarget: row || el, focusTarget: input };
            }
        }

        // 3. Radio inputs (MatchingFeature, MapDiagramLabelling)
        const radio = document.querySelector(`input[name="question-${q}"]`);
        if (radio) return { scrollTarget: radio.closest('tr') || radio, focusTarget: null };

        // 4. Other non-input types (MC, ParagraphMatching, DragDrop, etc.)
        const otherSelectors = [
            '.mc-question__number',
            '.paragraph-matching__num',
            '.map-diagram__q-num',
            '.matching-feature__q-num',
            '.sc-dnd__question-number',
            '.dropzone__placeholder',
        ];
        for (const selector of otherSelectors) {
            const els = document.querySelectorAll(selector);
            for (const el of els) {
                const text = el.textContent?.trim() ?? '';
                // Exact match (e.g. "27") or range match (e.g. "25 – 26" contains 25)
                const rangeMatch = text.match(/^(\d+)\s*[–-]\s*(\d+)$/);
                const matches = rangeMatch
                    ? q >= Number(rangeMatch[1]) && q <= Number(rangeMatch[2])
                    : text === qStr;
                if (matches) {
                    return { scrollTarget: el.closest('.mc-question, .paragraph-matching__row, .sc-dnd__sentence-row, .flow-chart__step, .dropzone') || el, focusTarget: null };
                }
            }
        }

        return null;
    };

    // Find which section a question belongs to, switch section, scroll to it, focus input
    const handleSelectQuestion = (q: number) => {
        setActiveQuestion(q);
        const sectionIdx = testData.sections.findIndex((section) => {
            const first = section.questionGroups[0]?.startQuestion ?? 0;
            const last = section.questionGroups[section.questionGroups.length - 1]?.endQuestion ?? 0;
            return q >= first && q <= last;
        });

        const scrollAndFocus = () => {
            const result = findQuestionElement(q);
            if (result) {
                result.scrollTarget?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Focus the input after scroll settles
                if (result.focusTarget) {
                    setTimeout(() => (result.focusTarget as HTMLElement).focus(), 300);
                }
            }
        };

        if (sectionIdx !== -1 && sectionIdx !== currentSectionIndex) {
            setCurrentSectionIndex(sectionIdx);
            setTimeout(scrollAndFocus, 100);
        } else {
            scrollAndFocus();
        }
    };

    const handleAnswerChange = (questionId: string, value: string) => {
        setAnswers((prev) => ({ ...prev, [questionId]: value }));
        const qNum = Number(questionId);
        if (!isNaN(qNum)) setActiveQuestion(qNum);
        // If an answer is changed, any active drag is effectively complete.
        // Clearing it here is much more robust than relying on onDragEnd events
        // which can be lost when elements are unmounted during a move.
        setDraggingWordId(null);
    };

    const handleSubmit = async () => {
        if (submitting) return;

        // Stop audio if playing
        if (audioRef.current) {
            audioRef.current.pause();
        }

        // Calculate time spent in seconds
        let timeSpentSecs = 0;
        if (testType === 'listening' && audioRef.current) {
            timeSpentSecs = Math.floor(audioRef.current.currentTime);
        } else if (testType === 'reading' && readingStartRef.current) {
            timeSpentSecs = Math.floor((Date.now() - readingStartRef.current) / 1000);
        }

        const timeSpentStr = `${String(Math.floor(timeSpentSecs / 60)).padStart(2, '0')}:${String(timeSpentSecs % 60).padStart(2, '0')}`;

        // Try server-side scoring if logged in
        const hasToken = !!getAccessToken();
        if (hasToken && routeTestId) {
            setSubmitting(true);
            try {
                const bookSlug = routeTestId.split('-test-')[0];
                const testSlug = `test-${routeTestId.split('-test-')[1]}`;
                const { data } = await axiosInstance.post(
                    `/${testType}/${examType}/books/${bookSlug}/tests/${testSlug}/submit`,
                    { answers, timeSpent: timeSpentSecs }
                );
                const serverResult = data.data;

                navigate(`/${examType}/${testType}/${routeTestId}/result`, {
                    state: {
                        testTitle: testData.title,
                        testType,
                        totalQuestions: testData.totalQuestions,
                        timeSpent: timeSpentStr,
                        userAnswers: answers,
                        bandScore: serverResult.bandScore,
                        correctAnswers: serverResult.correctAnswers,
                        results: serverResult.results,
                    },
                });
                return;
            } catch (err) {
                console.error('Server submit failed, falling back to client scoring:', err);
                toast.error('Could not save to server. Scoring locally.');
            } finally {
                setSubmitting(false);
            }
        }

        // Fallback: client-side scoring
        navigate(`/${examType}/${testType}/${routeTestId}/result`, {
            state: {
                testTitle: testData.title,
                testType,
                totalQuestions: testData.totalQuestions,
                timeSpent: timeSpentStr,
                userAnswers: answers,
            },
        });
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
                            <div key={`${currentSection.sectionNumber}-${index}`}>
                                <QuestionRenderer
                                    group={group}
                                    answers={answers}
                                    onAnswerChange={handleAnswerChange}
                                    testType={testType}
                                    activeQuestion={activeQuestion}
                                    draggingWordId={draggingWordId}
                                    onDragStart={setDraggingWordId}
                                    onDragEnd={() => setDraggingWordId(null)}
                                />
                            </div>
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
                activeQuestion={activeQuestion}
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
                    <div className="bg-white rounded-lg py-[60px] px-[60px] text-center w-full max-w-[650px] flex flex-col items-center">
                        <PiClockLight size={60} className="text-gray-700 mb-3" />
                        <h2 className="text-2xl font-bold mb-3">Time's Up!</h2>
                        <p className="text-gray-500 mb-6">Your test will be submitted automatically in a few seconds...</p>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="bg-black text-white border-none rounded px-8 py-3 text-base font-semibold cursor-pointer hover:bg-gray-900 disabled:bg-gray-400"
                        >
                            {submitting ? 'Submitting...' : 'Submit Now'}
                        </button>
                    </div>
                </div>
            )}

            {/* Hidden audio element for listening tests */}
            {testType === 'listening' && audioSrc && (
                <audio
                    ref={(el) => { audioRef.current = el; if (el) el.volume = volume; }}
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

            {/* Footer — IELTS question navigation */}
            <Footer
                parts={footerParts}
                answers={answers}
                currentQuestion={activeQuestion}
                onSelectQuestion={handleSelectQuestion}
                onSubmit={handleSubmit}
            />
        </div>
    );
};

export default TestDetailContainer;