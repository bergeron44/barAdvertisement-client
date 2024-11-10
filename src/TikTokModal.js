import React from 'react';

const TikTokModal = ({ bar, onClose, onLike }) => {
    return (
        <div style={modalStyles}>
            <button onClick={onClose} style={closeButtonStyles}>Close</button>
            <h2>{bar.name}</h2>
            {bar.videoUrl && (
                <video width="100%" controls>
                    <source src={bar.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            )}
            {bar.website && (
                <div>
                    <a href={bar.website} target="_blank" rel="noopener noreferrer">
                        Visit Bar Website
                    </a>
                </div>
            )}
            {bar.instagram && (
                <div>
                    <a href={bar.instagram} target="_blank" rel="noopener noreferrer">
                        Visit Instagram
                    </a>
                </div>
            )}
            <div>
                <button onClick={() => onLike(bar.id)}>Like</button>
                <p>Likes: {bar.likes}</p>
            </div>
        </div>
    );
};

// Simple styles for modal
const modalStyles = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
};

const closeButtonStyles = {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'red',
    color: 'white',
    border: 'none',
    padding: '5px 10px',
    cursor: 'pointer',
};

export default TikTokModal;
