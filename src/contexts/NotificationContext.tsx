import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import NotificationService from '../services/notification.service';
import type { Notification } from '../services/notification.service';

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    fetchNotifications: () => Promise<void>;
    markAsRead: (notificationId: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    lastNotificationId: string | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
    children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [lastNotificationId, setLastNotificationId] = useState<string | null>(null);
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const popupShownRef = useRef<Set<string>>(new Set());
    const retryCountRef = useRef(0);
    const pollingDelayRef = useRef(20000); // Start with 20 seconds

    // Fetch notifications
    const fetchNotifications = useCallback(async () => {
        try {
            const result = await NotificationService.getNotifications(50);
            const fetchedNotifications = result.items || [];
            
            // Reset retry count on successful fetch
            retryCountRef.current = 0;
            pollingDelayRef.current = 20000; // Reset to 20 seconds
            
            // Sort by createdAt descending (newest first)
            fetchedNotifications.sort((a, b) => {
                const dateA = new Date(a.createdAt).getTime();
                const dateB = new Date(b.createdAt).getTime();
                return dateB - dateA;
            });

            // Check for new notifications
            if (lastNotificationId && fetchedNotifications.length > 0) {
                const newestId = fetchedNotifications[0].SK || fetchedNotifications[0].createdAt;
                if (newestId !== lastNotificationId) {
                    // Find new notifications
                    const newNotifications = fetchedNotifications.filter(notif => {
                        const notifId = notif.SK || notif.createdAt;
                        return notifId !== lastNotificationId && !notif.isRead && !popupShownRef.current.has(notifId);
                    });

                    // Show popup for new unread notifications
                    if (newNotifications.length > 0) {
                        const newest = newNotifications[0];
                        const notifId = newest.SK || newest.createdAt;
                        if (!popupShownRef.current.has(notifId)) {
                            popupShownRef.current.add(notifId);
                            // Trigger popup event
                            window.dispatchEvent(new CustomEvent('newNotification', { detail: newest }));
                        }
                    }
                }
            } else if (fetchedNotifications.length > 0) {
                // First load - set last notification ID
                const newestId = fetchedNotifications[0].SK || fetchedNotifications[0].createdAt;
                setLastNotificationId(newestId);
            }

            setNotifications(fetchedNotifications);
            setUnreadCount(fetchedNotifications.filter(n => !n.isRead).length);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            // Implement exponential backoff on error
            retryCountRef.current += 1;
            pollingDelayRef.current = Math.min(20000 * Math.pow(2, retryCountRef.current), 300000); // Max 5 minutes
            console.log(`Will retry in ${pollingDelayRef.current / 1000} seconds`);
        } finally {
            setLoading(false);
        }
    }, [lastNotificationId]);

    // Mark notification as read
    const markAsRead = useCallback(async (notificationId: string) => {
        try {
            await NotificationService.markAsRead(notificationId);
            setNotifications(prev => 
                prev.map(notif => 
                    (notif.SK === notificationId || notif.createdAt === notificationId)
                        ? { ...notif, isRead: true }
                        : notif
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    }, []);

    // Mark all notifications as read
    const markAllAsRead = useCallback(async (): Promise<void> => {
        try {
            await NotificationService.markAllAsRead();
            setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchNotifications();
    }, []);

    // Poll for new notifications with dynamic delay based on errors
    useEffect(() => {
        const startPolling = () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
            
            pollingIntervalRef.current = setInterval(() => {
                fetchNotifications();
            }, pollingDelayRef.current);
        };
        
        startPolling();

        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, [fetchNotifications]);

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                loading,
                fetchNotifications,
                markAsRead,
                markAllAsRead,
                lastNotificationId
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}

