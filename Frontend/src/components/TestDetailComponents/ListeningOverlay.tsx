import React from 'react';
import { FaHeadphones } from 'react-icons/fa';

interface ListeningOverlayProps {
    onPlay: () => void;
}

const ListeningOverlay: React.FC<ListeningOverlayProps> = ({ onPlay }) => {
    return (
        <div style={styles.backdrop}>
            <div style={styles.content}>
                {/* Headphone icon */}
                <div style={styles.iconWrapper}>
                    <FaHeadphones size={80} color="white" />
                </div>

                <p style={styles.message}>
                    You will be listening to an audio clip during this test. You will not be permitted to pause or rewind the audio while answering the questions.
                </p>

                <p style={styles.subMessage}>To continue, click Play.</p>

                <button style={styles.playButton} onClick={onPlay}>
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="white"
                    >
                        <polygon points="5,3 19,12 5,21" />
                    </svg>
                    <span>Play</span>
                </button>
            </div>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    backdrop: {
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        maxWidth: '100%',
        padding: '0 24px',
        textAlign: 'center',
    },
    iconWrapper: {
        marginBottom: 8,
    },
    message: {
        color: '#fff',
        fontSize: 15,
        lineHeight: 1.6,
        margin: 0,
        fontWeight: 400,
    },
    subMessage: {
        color: '#fff',
        fontSize: 15,
        margin: 0,
        fontWeight: 400,
    },
    playButton: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#000',
        color: '#fff',
        border: 'none',
        borderRadius: 4,
        padding: '12px 28px',
        fontSize: 16,
        fontWeight: 600,
        cursor: 'pointer',
        marginTop: 8,
        letterSpacing: 0.3,
    },
};

export default ListeningOverlay;
