// Header.tsx
import React, { useState, useCallback } from "react";
import { FaVolumeUp, FaVolumeDown, FaVolumeMute } from "react-icons/fa";
import { GoAlert } from "react-icons/go";
import { PiClockLight } from "react-icons/pi";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogDescription, DialogFooter, DialogClose,
} from "../ui/dialog";
import "../../styles/TestPagesStyle.css";
import { ASSETS } from "../../constants";

interface HeaderProps {
    candidateId: string;
    testType?: 'listening' | 'reading';
    isAudioPlaying?: boolean;
    elapsedTime?: string;
    volume?: number;
    onVolumeChange?: (volume: number) => void;
}

const Header: React.FC<HeaderProps> = ({
    candidateId,
    testType = 'listening',
    isAudioPlaying = false,
    elapsedTime = "--:--",
    volume = 1,
    onVolumeChange,
}) => {
    const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        onVolumeChange?.(parseFloat(e.target.value));
    }, [onVolumeChange]);

    const VolumeIcon = volume === 0 ? FaVolumeMute : volume < 0.5 ? FaVolumeDown : FaVolumeUp;

    const [reportOpen, setReportOpen] = useState(false);
    const [reportType, setReportType] = useState("");
    const [reportQuestion, setReportQuestion] = useState("");
    const [reportDescription, setReportDescription] = useState("");

    const handleReportSubmit = useCallback(() => {
        console.log("Report submitted:", { reportType, reportQuestion, reportDescription });
        setReportType("");
        setReportQuestion("");
        setReportDescription("");
        setReportOpen(false);
    }, [reportType, reportQuestion, reportDescription]);

    return (
        <header className="header">
            {/* Logo */}
            <div className="header__logo">
                <img
                    src={ASSETS.IELTS_LOGO}
                    alt="IELTS Logo"
                />
            </div>

            {/* Candidate Info */}
            <div className="header__candidate">
                <div>
                    <span className="header__label">Test taker ID:</span>
                    <span className="header__candidateId">{candidateId}</span>
                </div>
                {testType === 'listening' && isAudioPlaying && (
                    <div className="header__audio-status">
                        <FaVolumeUp size={13} />
                        <span>Audio is Playing</span>
                    </div>
                )}
            </div>

            {/* Timer */}
            <div className="header__timer">
                <PiClockLight size={28} />
                <span>{elapsedTime}</span>
                <span className="header__timer-remaining">minutes remaining</span>
            </div>

            {/* Volume Control — listening only */}
            {testType === 'listening' && (
                <div className="header__volume">
                    <VolumeIcon size={18} className="header__volume-icon" />
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="header__volume-slider"
                        style={{ '--volume-percent': `${volume * 100}%` } as React.CSSProperties}
                        aria-label="Volume"
                    />
                </div>
            )}

            {/* Report Mistake */}
            <div className="header__actions">
                <button
                    onClick={() => setReportOpen(true)}
                    aria-label="Report a mistake"
                    className="header__report-btn"
                >
                    <GoAlert size={20} />
                </button>
            </div>

            <Dialog open={reportOpen} onOpenChange={setReportOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Found a mistake? Let us know!</DialogTitle>
                        <DialogDescription>
                            Help us improve by reporting errors in questions, answers, or audio.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="report-form">
                        <div className="report-form__field">
                            <label htmlFor="report-type">Issue Type</label>
                            <select
                                id="report-type"
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value)}
                            >
                                <option value="">Select an issue type</option>
                                <option value="wrong-answer">Wrong Answer</option>
                                <option value="typo">Typo / Spelling Error</option>
                                <option value="audio-issue">Audio Issue</option>
                                <option value="missing-content">Missing Content</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className="report-form__field">
                            <label htmlFor="report-question">Question Number (optional)</label>
                            <input
                                id="report-question"
                                type="text"
                                placeholder="e.g. 14"
                                value={reportQuestion}
                                onChange={(e) => setReportQuestion(e.target.value)}
                            />
                        </div>

                        <div className="report-form__field">
                            <label htmlFor="report-description">Description</label>
                            <textarea
                                id="report-description"
                                rows={4}
                                placeholder="Describe the issue..."
                                value={reportDescription}
                                onChange={(e) => setReportDescription(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <button className="report-form__cancel-btn">Cancel</button>
                        </DialogClose>
                        <button
                            className="report-form__submit-btn"
                            onClick={handleReportSubmit}
                            disabled={!reportType || !reportDescription}
                        >
                            Submit Report
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </header>
    );
};

export default Header;