// Header.tsx
import React, { useCallback } from "react";
import { FaVolumeUp, FaVolumeDown, FaVolumeMute } from "react-icons/fa";
import { PiClockLight } from "react-icons/pi";
import ReportMistakeButton from "./ReportMistakeButton";
import "../../styles/TestPagesStyle.css";
import { ASSETS } from "../../constants";

interface HeaderProps {
    candidateId: string;
    testType?: 'listening' | 'reading' | 'writing';
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
                <ReportMistakeButton />
            </div>
        </header>
    );
};

export default Header;
