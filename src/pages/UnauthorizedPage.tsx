import React from 'react';
import { useNavigate } from 'react-router-dom';

const UnauthorizedPage: React.FC = () => {
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate('/');
    };

    return (
        <div className="unauthorized-page">
            <div className="unauthorized-container">
                <h1>Access Denied</h1>
                <p>You do not have permission to access this page.</p>
                <button onClick={handleGoBack} className="back-button">
                    Go Back to Login
                </button>
            </div>
        </div>
    );
};

export default UnauthorizedPage;