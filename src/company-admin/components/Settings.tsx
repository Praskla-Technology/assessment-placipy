import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AdminService from '../../services/admin.service';
import { useUser } from '../../contexts/UserContext';

interface AdminProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface BrandingSettings {
  logo?: string;
  companyName: string;
  primaryColor: string;
  secondaryColor: string;
  theme: 'light' | 'dark';
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: 'welcome' | 'assessment' | 'notification' | 'reminder';
}

type TabType = 'profile' | 'branding' | 'email-templates';

const Settings: React.FC = () => {
  const { user, refreshUser } = useUser();
  const location = useLocation();
  
  // Default to profile tab if accessed via profile route
  const getInitialTab = (): TabType => {
    if (location.pathname.includes('/profile')) {
      return 'profile';
    }
    return 'profile'; // Default to profile for better UX
  };
  
  const [activeTab, setActiveTab] = useState<TabType>(getInitialTab());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Profile management states
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    department: '',
    phone: ''
  });
  const [passwordForm, setPasswordForm] = useState<PasswordChangeData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  
  // Branding management states
  const [brandingSettings, setBrandingSettings] = useState<BrandingSettings>({
    companyName: 'Placipy Assessment Platform',
    primaryColor: '#9768E1',
    secondaryColor: '#523C48',
    theme: 'light'
  });
  const [logoPreview, setLogoPreview] = useState<string>('');
  
  // Email templates management states
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    subject: '',
    content: '',
    type: 'welcome' as EmailTemplate['type']
  });

  useEffect(() => {
    loadAllData();
  }, [user]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading admin settings data...');
      
      await Promise.all([
        loadAdminProfile(),
        loadBrandingSettings(),
        loadEmailTemplates()
      ]);
      
      console.log('Admin settings data loaded successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to load settings data');
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAdminProfile = async () => {
    try {
      if (!user?.email) {
        console.log('No user email available, skipping profile load');
        return;
      }
      
      console.log('Loading admin profile for:', user.email);
      const profile = await AdminService.getAdminProfile(user.email);
      console.log('Admin profile loaded:', profile);
      
      setAdminProfile(profile);
      setProfileForm({
        name: profile.name || '',
        email: profile.email || '',
        department: profile.department || '',
        phone: profile.phone || ''
      });
    } catch (error) {
      console.error('Error loading admin profile:', error);
    }
  };

  const loadBrandingSettings = async () => {
    try {
      const settings = await AdminService.getBrandingSettings();
      setBrandingSettings({
        companyName: settings.companyName || 'Placipy Assessment Platform',
        primaryColor: settings.primaryColor || '#9768E1',
        secondaryColor: settings.secondaryColor || '#523C48',
        theme: settings.theme || 'light',
        logo: settings.logo
      });
      if (settings.logo) {
        setLogoPreview(settings.logo);
      }
    } catch (error) {
      console.error('Error loading branding settings:', error);
    }
  };

  const loadEmailTemplates = async () => {
    try {
      const templates = await AdminService.getEmailTemplates();
      setEmailTemplates(templates);
    } catch (error) {
      console.error('Error loading email templates:', error);
    }
  };

  // Profile management functions
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      
      await AdminService.updateAdminProfile(profileForm);
      await loadAdminProfile();
      await refreshUser();
      
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (passwordForm.newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      await AdminService.changeAdminPassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
      setSuccess('Password changed successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  // Branding management functions
  const handleBrandingUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      
      await AdminService.updateBrandingSettings(brandingSettings);
      
      setSuccess('Branding settings updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update branding settings');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      setError('Logo file size must be less than 2MB');
      return;
    }
    
    try {
      setSaving(true);
      const logoUrl = await AdminService.uploadLogo(file);
      setBrandingSettings(prev => ({ ...prev, logo: logoUrl }));
      setLogoPreview(logoUrl);
      setSuccess('Logo uploaded successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to upload logo');
    } finally {
      setSaving(false);
    }
  };

  // Email template management functions
  const handleTemplateCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      
      const newTemplate = await AdminService.createEmailTemplate(templateForm);
      setEmailTemplates(prev => [...prev, newTemplate]);
      setTemplateForm({ name: '', subject: '', content: '', type: 'welcome' });
      setShowTemplateForm(false);
      
      setSuccess('Email template created successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to create email template');
    } finally {
      setSaving(false);
    }
  };

  const handleTemplateUpdate = async (template: EmailTemplate) => {
    try {
      setSaving(true);
      setError(null);
      
      const updatedTemplate = await AdminService.updateEmailTemplate(template.id, template);
      setEmailTemplates(prev => prev.map(t => t.id === template.id ? updatedTemplate : t));
      setSelectedTemplate(null);
      
      setSuccess('Email template updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update email template');
    } finally {
      setSaving(false);
    }
  };

  const handleTemplateDelete = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this email template?')) return;
    
    try {
      setSaving(true);
      await AdminService.deleteEmailTemplate(templateId);
      setEmailTemplates(prev => prev.filter(t => t.id !== templateId));
      
      setSuccess('Email template deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete email template');
    } finally {
      setSaving(false);
    }
  };

  // Helper function to clear messages
  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="tab-content">
            <div className="profile-section">
              <h3>Admin Profile Information</h3>
              <form onSubmit={handleProfileUpdate} className="profile-form">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    value={profileForm.department}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, department: e.target.value }))}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="form-input"
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? 'Updating...' : 'Update Profile'}
                  </button>
                </div>
              </form>
            </div>

            <div className="password-section">
              <h3>Password Management</h3>
              {!showPasswordForm ? (
                <button 
                  className="btn-secondary"
                  onClick={() => setShowPasswordForm(true)}
                >
                  Change Password
                </button>
              ) : (
                <form onSubmit={handlePasswordChange} className="password-form">
                  <div className="form-group">
                    <label>Current Password *</label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>New Password *</label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      required
                      minLength={8}
                      className="form-input"
                    />
                    <small className="form-help">Password must be at least 8 characters long</small>
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password *</label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn-primary" disabled={saving}>
                      {saving ? 'Changing...' : 'Change Password'}
                    </button>
                    <button 
                      type="button" 
                      className="btn-secondary"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                        clearMessages();
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {adminProfile && (
              <div className="profile-info">
                <h3>Account Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Account Created</label>
                    <span>{adminProfile.createdAt ? new Date(adminProfile.createdAt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <label>Last Updated</label>
                    <span>{adminProfile.updatedAt ? new Date(adminProfile.updatedAt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <label>Role</label>
                    <span className="role-badge">{adminProfile.role}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'branding':
        return (
          <div className="tab-content">
            <div className="branding-section">
              <h3>Company Branding</h3>
              <form onSubmit={handleBrandingUpdate} className="branding-form">
                <div className="form-group">
                  <label>Company Name *</label>
                  <input
                    type="text"
                    value={brandingSettings.companyName}
                    onChange={(e) => setBrandingSettings(prev => ({ ...prev, companyName: e.target.value }))}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Primary Color</label>
                    <div className="color-input-group">
                      <input
                        type="color"
                        value={brandingSettings.primaryColor}
                        onChange={(e) => setBrandingSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="color-input"
                      />
                      <input
                        type="text"
                        value={brandingSettings.primaryColor}
                        onChange={(e) => setBrandingSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="color-text-input"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Secondary Color</label>
                    <div className="color-input-group">
                      <input
                        type="color"
                        value={brandingSettings.secondaryColor}
                        onChange={(e) => setBrandingSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
                        className="color-input"
                      />
                      <input
                        type="text"
                        value={brandingSettings.secondaryColor}
                        onChange={(e) => setBrandingSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
                        className="color-text-input"
                      />
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label>Theme</label>
                  <select
                    value={brandingSettings.theme}
                    onChange={(e) => setBrandingSettings(prev => ({ ...prev, theme: e.target.value as 'light' | 'dark' }))}
                    className="form-select"
                  >
                    <option value="light">Light Theme</option>
                    <option value="dark">Dark Theme</option>
                  </select>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? 'Updating...' : 'Update Branding'}
                  </button>
                </div>
              </form>
            </div>

            <div className="logo-section">
              <h3>Company Logo</h3>
              <div className="logo-upload">
                {logoPreview && (
                  <div className="logo-preview">
                    <img src={logoPreview} alt="Company Logo" />
                  </div>
                )}
                <div className="upload-controls">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="file-input"
                    id="logo-upload"
                  />
                  <label htmlFor="logo-upload" className="upload-btn">
                    {logoPreview ? 'Change Logo' : 'Upload Logo'}
                  </label>
                  <small className="form-help">Maximum file size: 2MB. Recommended: 200x80px</small>
                </div>
              </div>
            </div>
          </div>
        );

      case 'email-templates':
        return (
          <div className="tab-content">
            <div className="templates-header">
              <h3>Email Templates</h3>
              <button 
                className="btn-primary"
                onClick={() => setShowTemplateForm(true)}
              >
                Create New Template
              </button>
            </div>

            {showTemplateForm && (
              <div className="template-form-section">
                <h4>Create Email Template</h4>
                <form onSubmit={handleTemplateCreate} className="template-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Template Name *</label>
                      <input
                        type="text"
                        value={templateForm.name}
                        onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                        required
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Template Type *</label>
                      <select
                        value={templateForm.type}
                        onChange={(e) => setTemplateForm(prev => ({ ...prev, type: e.target.value as EmailTemplate['type'] }))}
                        required
                        className="form-select"
                      >
                        <option value="welcome">Welcome</option>
                        <option value="assessment">Assessment</option>
                        <option value="notification">Notification</option>
                        <option value="reminder">Reminder</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Subject Line *</label>
                    <input
                      type="text"
                      value={templateForm.subject}
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, subject: e.target.value }))}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Content *</label>
                    <textarea
                      value={templateForm.content}
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, content: e.target.value }))}
                      required
                      rows={10}
                      className="form-textarea"
                      placeholder="Use [STUDENT_NAME], [ASSESSMENT_NAME], [DATE], etc. as placeholders"
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn-primary" disabled={saving}>
                      {saving ? 'Creating...' : 'Create Template'}
                    </button>
                    <button 
                      type="button" 
                      className="btn-secondary"
                      onClick={() => {
                        setShowTemplateForm(false);
                        setTemplateForm({ name: '', subject: '', content: '', type: 'welcome' });
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="templates-list">
              {emailTemplates.map((template) => (
                <div key={template.id} className="template-card">
                  <div className="template-header">
                    <h4>{template.name}</h4>
                    <span className={`template-type-badge ${template.type}`}>
                      {template.type}
                    </span>
                  </div>
                  <div className="template-content">
                    <p><strong>Subject:</strong> {template.subject}</p>
                    <p className="template-preview">{template.content.substring(0, 150)}...</p>
                  </div>
                  <div className="template-actions">
                    <button 
                      className="btn-edit"
                      onClick={() => setSelectedTemplate(template)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleTemplateDelete(template.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="admin-settings">
      <div className="admin-header">
        <h2>Admin Settings</h2>
        <p>Manage your profile, branding, and system configurations</p>
      </div>

      {error && (
        <div className="admin-alert admin-alert-error">
          <span className="alert-icon">⚠️</span>
          <span>{error}</span>
          <button className="alert-close" onClick={() => setError(null)}>×</button>
        </div>
      )}

      {success && (
        <div className="admin-alert admin-alert-success">
          <span className="alert-icon">✅</span>
          <span>{success}</span>
          <button className="alert-close" onClick={() => setSuccess(null)}>×</button>
        </div>
      )}

      <div className="settings-tabs">
        <div className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile Management
          </button>
          <button 
            className={`tab-btn ${activeTab === 'branding' ? 'active' : ''}`}
            onClick={() => setActiveTab('branding')}
          >
            Branding
          </button>
          <button 
            className={`tab-btn ${activeTab === 'email-templates' ? 'active' : ''}`}
            onClick={() => setActiveTab('email-templates')}
          >
            Email Templates
          </button>
        </div>

        <div className="tab-content-container">
          {renderTabContent()}
        </div>
      </div>

      {/* Template Edit Modal */}
      {selectedTemplate && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Edit Email Template</h3>
              <button 
                className="modal-close"
                onClick={() => setSelectedTemplate(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={(e) => {
                e.preventDefault();
                handleTemplateUpdate(selectedTemplate);
              }}>
                <div className="form-group">
                  <label>Template Name</label>
                  <input
                    type="text"
                    value={selectedTemplate.name}
                    onChange={(e) => setSelectedTemplate(prev => prev ? { ...prev, name: e.target.value } : null)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Subject Line</label>
                  <input
                    type="text"
                    value={selectedTemplate.subject}
                    onChange={(e) => setSelectedTemplate(prev => prev ? { ...prev, subject: e.target.value } : null)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Email Content</label>
                  <textarea
                    value={selectedTemplate.content}
                    onChange={(e) => setSelectedTemplate(prev => prev ? { ...prev, content: e.target.value } : null)}
                    rows={10}
                    className="form-textarea"
                  />
                </div>
                <div className="modal-actions">
                  <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? 'Updating...' : 'Update Template'}
                  </button>
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => setSelectedTemplate(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
