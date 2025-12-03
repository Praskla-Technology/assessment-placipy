import axios from 'axios';

const API_BASE_URL = '/api/student/notifications';

export interface Notification {
    PK?: string;
    SK?: string;
    userId?: string;
    email?: string;
    type: 'assessment_published' | 'result_published' | 'announcement';
    title: string;
    message: string;
    link: string;
    priority: 'high' | 'medium' | 'low';
    isRead: boolean;
    createdAt: string;
    metadata?: any;
}

class NotificationService {
    private getAuthHeaders() {
        const token = localStorage.getItem('accessToken');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }

    /**
     * Get all notifications for the current user
     */
    async getNotifications(limit: number = 50, lastKey?: string): Promise<{ items: Notification[]; lastKey?: string }> {
        try {
            const params: any = { limit };
            if (lastKey) {
                params.lastKey = JSON.stringify(lastKey);
            }

            const response = await axios.get(API_BASE_URL, {
                headers: this.getAuthHeaders(),
                params
            });

            return {
                items: response.data.data || [],
                lastKey: response.data.lastKey
            };
        } catch (error: any) {
            console.error('Error fetching notifications:', error);
            if (error.response?.status === 404) {
                return { items: [] };
            }
            throw new Error(error.response?.data?.message || 'Failed to fetch notifications');
        }
    }

    /**
     * Mark a notification as read
     */
    async markAsRead(notificationId: string): Promise<void> {
        try {
            await axios.post(
                `${API_BASE_URL}/${notificationId}/read`,
                {},
                { headers: this.getAuthHeaders() }
            );
        } catch (error: any) {
            console.error('Error marking notification as read:', error);
            throw new Error(error.response?.data?.message || 'Failed to mark notification as read');
        }
    }

    /**
     * Mark all notifications as read
     */
    async markAllAsRead(): Promise<number> {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/mark-all`,
                {},
                { headers: this.getAuthHeaders() }
            );
            return response.data.count || 0;
        } catch (error: any) {
            console.error('Error marking all notifications as read:', error);
            throw new Error(error.response?.data?.message || 'Failed to mark all notifications as read');
        }
    }
}

export default new NotificationService();

