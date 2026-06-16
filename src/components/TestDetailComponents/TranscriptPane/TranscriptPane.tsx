import { type FC, type ReactNode } from "react";
import type { TranscriptSection } from "../../../data/transcriptMaps";
import "./TranscriptPane.css";

interface TranscriptPaneProps {
    section: TranscriptSection;
}

/** Parse text with <q id="N">answer</q> tags into React elements */
function renderTranscriptText(text: string): ReactNode[] {
    const parts: ReactNode[] = [];
    const regex = /<q id="(\d+)">(.*?)<\/q>/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
        // Text before the tag
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }
        // The highlighted answer
        const qId = match[1];
        const answer = match[2];
        parts.push(
            <span key={`q-${qId}-${match.index}`} className="transcript__answer">
                <span className="transcript__answer-label">Q{qId}</span>
                <span className="transcript__answer-text">{answer}</span>
            </span>
        );
        lastIndex = match.index + match[0].length;
    }

    // Remaining text after last tag
    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    return parts;
}

const TranscriptPane: FC<TranscriptPaneProps> = ({ section }) => {
    return (
        <div className="transcript-pane">
            <h3 className="transcript-pane__title">{section.title}</h3>
            <div className="transcript-pane__lines">
                {section.transcript.map((line, idx) => (
                    <div key={idx} className={`transcript-pane__line${!line.speaker ? " transcript-pane__line--full" : ""}`}>
                        {line.speaker && <span className="transcript-pane__speaker">{line.speaker}</span>}
                        <span className="transcript-pane__text">
                            {renderTranscriptText(line.text)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TranscriptPane;
