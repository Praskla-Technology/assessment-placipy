import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';

const NotificationBell: React.FC = () => {
    const navigate = useNavigate();
    const { unreadCount, notifications } = useNotifications();

    // Determine badge color based on priority
    const getBadgeColor = (): string => {
        if (unreadCount === 0) return 'transparent';
        
        const unreadNotifications = notifications.filter(n => !n.isRead);
        const hasHigh = unreadNotifications.some(n => n.priority === 'high');
        const hasMedium = unreadNotifications.some(n => n.priority === 'medium');
        
        if (hasHigh) return '#EF4444'; // red
        if (hasMedium) return '#F59E0B'; // orange
        return '#6B7280'; // gray
    };

    const badgeColor = getBadgeColor();

    return (
        <div
            style={{
                position: 'relative',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px',
                transition: 'background-color 0.2s'
            }}
            onClick={() => navigate('/student/notifications')}
            onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.backgroundColor = '#F3F4F6';
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent';
            }}
        >
            <Bell 
                size={24} 
                color="#374151"
                style={{ display: 'block' }}
            />
            {unreadCount > 0 && (
                <div
                    style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        minWidth: '18px',
                        height: '18px',
                        borderRadius: '9px',
                        backgroundColor: badgeColor,
                        color: 'white',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 4px',
                        border: '2px solid white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                >
                    {unreadCount > 99 ? '99+' : unreadCount}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;

