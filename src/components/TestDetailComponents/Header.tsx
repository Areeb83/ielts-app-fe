// Header.tsx
import React from "react";
import "../../styles/TestPagesStyle.css";
import { ASSETS } from "../../constants";

interface HeaderProps {
    candidateId: string;
    connectionStatus?: "connected" | "disconnected";
    onMessagesClick?: () => void;
    onOptionsClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({
    candidateId,
    connectionStatus = "connected",
    onMessagesClick,
    onOptionsClick,
}) => {
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
                <span className="header__label">Test taker ID:</span>
                <span className="header__candidateId">{candidateId}</span>
            </div>

            {/* Connection Status */}
            <div className="header__connection">
                <span
                    className={`header__status ${connectionStatus === "connected" ? "connected" : "disconnected"
                        }`}
                    aria-live="polite"
                >
                    {connectionStatus === "connected" ? "Connected" : "Disconnected"}
                </span>
                <i
                    className={`fa fa-wifi ${connectionStatus === "connected" ? "connected" : "disconnected"
                        }`}
                    aria-hidden="true"
                />
            </div>

            {/* Action Buttons */}
            <div className="header__actions">
                <button onClick={onMessagesClick} aria-label="Messages">
                    <i className="fa fa-bell-o" aria-hidden="true"></i>
                </button>
                <button onClick={onOptionsClick} aria-label="Options">
                    <i className="fa fa-bars" aria-hidden="true"></i>
                </button>
            </div>
        </header>
    );
};

export default Header;