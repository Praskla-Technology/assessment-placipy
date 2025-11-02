import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../services/auth.service';

const PTODashboard: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    // Verify user role on component mount
    useEffect(() => {
        const verifyRole = async () => {
            try {
                if (!AuthService.isAuthenticated()) {
                    navigate('/');
                    return;
                }

                const token = AuthService.getAccessToken();
                if (!token) {
                    navigate('/');
                    return;
                }

                const userRole = await AuthService.getUserRole(token);
                if (userRole !== 'PTO') {
                    navigate('/unauthorized');
                    return;
                }

                setIsLoading(false);
            } catch (error) {
                console.error('Role verification failed:', error);
                navigate('/');
            }
        };

        verifyRole();
    }, [navigate]);

    const handleLogout = () => {
        AuthService.logout();
        navigate('/');
    };

    if (isLoading) {
        return <div className="loading">Verifying access...</div>;
    }

    return (
        <div className="pto-dashboard">
            <header>
                <h1>PTO Dashboard</h1>
                <button onClick={handleLogout}>Logout</button>
            </header>
            <main>
                <div className="dashboard-content">
                    <h2>Welcome, Placement Training Officer!</h2>
                    <p>This is the dashboard for PTO users.</p>
                    {/* Add PTO-specific content here */}
                </div>
            </main>
        </div>
    );
};

export default PTODashboard;