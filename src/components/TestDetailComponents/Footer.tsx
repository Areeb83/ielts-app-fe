// Footer.tsx
import React from "react";
import "../../styles/TestPagesStyle.css";

interface FooterProps {
    currentQuestion: number;
    totalQuestions: number;
    onPrevious?: () => void;
    onNext?: () => void;
    onQuestionClick?: (qNumber: number) => void;
    onSubmit?: () => void;
}

const Footer: React.FC<FooterProps> = ({
    currentQuestion,
    totalQuestions,
    onPrevious,
    onNext,
    onQuestionClick,
    onSubmit,
}) => {
    return (
        <footer className="footer">
            {/* Navigation buttons */}
            <div className="footer__navButtons">
                <button
                    onClick={onPrevious}
                    disabled={currentQuestion === 1}
                    aria-label="Previous"
                >
                    <i className="fa fa-arrow-left" aria-hidden="true"></i>
                </button>
                <button
                    onClick={onNext}
                    disabled={currentQuestion === totalQuestions}
                    aria-label="Next"
                >
                    <i className="fa fa-arrow-right" aria-hidden="true"></i>
                </button>
            </div>

            {/* Question navigator */}
            <nav className="footer__questionNav" aria-label="Questions">
                {Array.from({ length: totalQuestions }, (_, i) => i + 1).map((q) => (
                    <button
                        key={q}
                        className={`footer__questionNo ${currentQuestion === q ? "active" : ""
                            }`}
                        onClick={() => onQuestionClick && onQuestionClick(q)}
                        aria-label={`Question ${q}`}
                    >
                        {q}
                    </button>
                ))}
            </nav>

            {/* Submit / Review button */}
            <div className="footer__submit">
                <button onClick={onSubmit} aria-label="Review your answers">
                    <i className="fa fa-check" aria-hidden="true"></i> Submit
                </button>
            </div>
        </footer>
    );
};

export default Footer;