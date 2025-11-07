import axios from 'axios';
import AuthService from './auth.service';

export interface AdminProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  designation: string;
  department: string;
  employeeId: string;
  joiningDate: string;
  bio: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  profilePicture?: string;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

export interface AdminPreferences {
  theme: 'light' | 'dark';
  language: string;
  timezone: string;
  dateFormat: string;
  emailDigest: 'disabled' | 'daily' | 'weekly' | 'monthly';
  notificationSound: boolean;
  autoLogout: number;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

class ProfileService {
  private apiUrl = '/api/users';

  /**
   * Get authentication headers with access token
   */
  private getAuthHeaders() {
    const token = AuthService.getAccessToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  /**
   * Get user profile
   */
  async getProfile(): Promise<AdminProfile> {
    try {
      const response = await axios.get(`${this.apiUrl}/profile`, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        return response.data.profile;
      } else {
        throw new Error(response.data.message || 'Failed to fetch profile');
      }
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData: Partial<AdminProfile>): Promise<AdminProfile> {
    try {
      const response = await axios.put(`${this.apiUrl}/profile`, profileData, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        return response.data.profile;
      } else {
        throw new Error(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  /**
   * Change password
   */
  async changePassword(passwordData: PasswordChangeRequest): Promise<void> {
    try {
      const { confirmPassword, ...requestData } = passwordData;
      
      if (passwordData.newPassword !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const response = await axios.put(`${this.apiUrl}/profile/password`, requestData, {
        headers: this.getAuthHeaders()
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  /**
   * Get user preferences
   */
  async getPreferences(): Promise<AdminPreferences> {
    try {
      const response = await axios.get(`${this.apiUrl}/profile/preferences`, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        return response.data.preferences;
      } else {
        throw new Error(response.data.message || 'Failed to fetch preferences');
      }
    } catch (error) {
      console.error('Get preferences error:', error);
      throw error;
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(preferences: AdminPreferences): Promise<AdminPreferences> {
    try {
      const response = await axios.put(`${this.apiUrl}/profile/preferences`, preferences, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        return response.data.preferences;
      } else {
        throw new Error(response.data.message || 'Failed to update preferences');
      }
    } catch (error) {
      console.error('Update preferences error:', error);
      throw error;
    }
  }

  /**
   * Get security settings
   */
  async getSecuritySettings(): Promise<SecuritySettings> {
    try {
      const response = await axios.get(`${this.apiUrl}/profile/security`, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        return response.data.settings;
      } else {
        throw new Error(response.data.message || 'Failed to fetch security settings');
      }
    } catch (error) {
      console.error('Get security settings error:', error);
      throw error;
    }
  }

  /**
   * Update security settings
   */
  async updateSecuritySettings(settings: SecuritySettings): Promise<SecuritySettings> {
    try {
      const response = await axios.put(`${this.apiUrl}/profile/security`, settings, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        return response.data.settings;
      } else {
        throw new Error(response.data.message || 'Failed to update security settings');
      }
    } catch (error) {
      console.error('Update security settings error:', error);
      throw error;
    }
  }

  /**
   * Update profile picture with static image URL
   */
  async updateProfilePicture(profilePictureUrl: string): Promise<string> {
    try {
      const response = await axios.put(`${this.apiUrl}/profile/picture`, 
        { profilePictureUrl }, 
        {
          headers: this.getAuthHeaders()
        }
      );

      if (response.data.success) {
        return response.data.profilePictureUrl;
      } else {
        throw new Error(response.data.message || 'Failed to update profile picture');
      }
    } catch (error) {
      console.error('Update profile picture error:', error);
      throw error;
    }
  }

  /**
   * Get current user info from auth service
   */
  async getCurrentUser() {
    const token = AuthService.getAccessToken();
    if (token) {
      return await AuthService.getUserProfile(token);
    }
    return null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return AuthService.isAuthenticated();
  }

  /**
   * Get user role
   */
  async getUserRole() {
    const token = AuthService.getAccessToken();
    if (token) {
      return await AuthService.getUserRole(token);
    }
    return null;
  }
}

export default new ProfileService();