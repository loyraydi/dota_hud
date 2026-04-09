import React from 'react';

interface PauseOverlayProps {
    show: boolean;
    message?: string;
}

const PauseOverlay: React.FC<PauseOverlayProps> = ({ show, message = 'ИГРОК ПРИОСТАНОВИЛ ИГРУ' }) => {
    if (!show) return null;

    return (
        <div className="pause-overlay">
            <div className="pause-message">
                {message}
            </div>
        </div>
    );
};

export default PauseOverlay;
