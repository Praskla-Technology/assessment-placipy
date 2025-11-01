import React, { useState } from "react";

interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  employeeId: string;
  designation: string;
  joiningDate: string;
  bio: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface SecuritySettings {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  twoFactorEnabled: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

interface PreferencesSettings {
  theme: string;
  language: string;
  timezone: string;
  dateFormat: string;
  defaultAssessmentDuration: number;
  autoSave: boolean;
  emailDigest: string;
  notificationSound: boolean;
}

const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'personal' | 'security' | 'preferences' | 'activity'>('personal');
  const [isEditing, setIsEditing] = useState<{[key: string]: boolean}>({});
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Personal Information State
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    firstName: "Dr. Sarah",
    lastName: "Wilson",
    email: "sarah.wilson@university.edu",
    phone: "+1 (555) 123-4567",
    department: "Computer Science",
    employeeId: "EMP001234",
    designation: "PTS Administrator",
    joiningDate: "2020-08-15",
    bio: "Experienced educator and assessment specialist with over 8 years in academic administration and placement training.",
    address: "123 University Drive",
    city: "Tech City",
    state: "California",
    zipCode: "90210",
    country: "United States"
  });

  // Security Settings State
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: true,
    emailNotifications: true,
    smsNotifications: false
  });

  // Preferences State
  const [preferences, setPreferences] = useState<PreferencesSettings>({
    theme: "light",
    language: "English",
    timezone: "America/Los_Angeles",
    dateFormat: "MM/DD/YYYY",
    defaultAssessmentDuration: 60,
    autoSave: true,
    emailDigest: "daily",
    notificationSound: true
  });

  // Activity Log State
  const [activityLog] = useState([
    { id: 1, action: "Created assessment 'React Fundamentals'", timestamp: "2025-11-01 09:30 AM", ip: "192.168.1.100" },
    { id: 2, action: "Updated profile information", timestamp: "2025-10-31 02:15 PM", ip: "192.168.1.100" },
    { id: 3, action: "Scheduled assessment for CSE batch", timestamp: "2025-10-30 11:45 AM", ip: "192.168.1.101" },
    { id: 4, action: "Generated analytics report", timestamp: "2025-10-29 04:20 PM", ip: "192.168.1.100" },
    { id: 5, action: "Changed password", timestamp: "2025-10-28 10:15 AM", ip: "192.168.1.102" },
  ]);

  const departments = ["Computer Science", "Information Technology", "Electronics", "Mechanical", "Civil", "Mathematics", "Physics"];
  const designations = ["PTS Administrator", "Senior Administrator", "Assessment Coordinator", "Training Manager", "Academic Head"];
  const themes = ["light", "dark", "auto"];
  const languages = ["English", "Spanish", "French", "German", "Hindi"];
  const timezones = ["America/Los_Angeles", "America/New_York", "Europe/London", "Asia/Kolkata", "Australia/Sydney"];
  const dateFormats = ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD", "DD-MMM-YYYY"];
  const emailDigestOptions = ["disabled", "daily", "weekly", "monthly"];

  const handlePersonalInfoChange = (field: keyof PersonalInfo, value: string) => {
    setPersonalInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSecurityChange = (field: keyof SecuritySettings, value: any) => {
    setSecuritySettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreferencesChange = (field: keyof PreferencesSettings, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleEdit = (section: string) => {
    setIsEditing(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
    setErrorMessage("");
  };

  const saveChanges = async (section: string) => {
    setIsSaving(true);
    setErrorMessage("");

    try {
      // Validation
      if (section === 'security') {
        if (securitySettings.newPassword && securitySettings.newPassword !== securitySettings.confirmPassword) {
          throw new Error("New passwords do not match");
        }
        if (securitySettings.newPassword && securitySettings.newPassword.length < 8) {
          throw new Error("Password must be at least 8 characters long");
        }
      }

      if (section === 'personal') {
        if (!personalInfo.firstName.trim() || !personalInfo.lastName.trim() || !personalInfo.email.trim()) {
          throw new Error("First name, last name, and email are required");
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalInfo.email)) {
          throw new Error("Please enter a valid email address");
        }
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      setSuccessMessage(`${section.charAt(0).toUpperCase() + section.slice(1)} information updated successfully!`);
      setIsEditing(prev => ({
        ...prev,
        [section]: false
      }));

      // Reset security form if password was changed
      if (section === 'security' && securitySettings.newPassword) {
        setSecuritySettings(prev => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        }));
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);

    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "An error occurred while saving");
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEdit = (section: string) => {
    setIsEditing(prev => ({
      ...prev,
      [section]: false
    }));
    setErrorMessage("");
    
    // Reset security form
    if (section === 'security') {
      setSecuritySettings(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      }));
    }
  };

  const renderPersonalTab = () => (
    <div className="pts-fade-in">
      <div className="pts-form-container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
          <h3 className="pts-form-title">Personal Information</h3>
          {!isEditing.personal ? (
            <button
              className="pts-btn-primary"
              onClick={() => toggleEdit('personal')}
            >
              Edit Profile
            </button>
          ) : (
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                className="pts-btn-secondary"
                onClick={() => cancelEdit('personal')}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                className="pts-btn-primary"
                onClick={() => saveChanges('personal')}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>

        {/* Profile Picture Section */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: "30px", padding: "20px", background: "#f8f9fa", borderRadius: "12px" }}>
          <div style={{ position: "relative", marginRight: "20px" }}>
            <img
              src="https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop&crop=face"
              alt="Profile"
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                border: "4px solid #9768E1"
              }}
            />
            {isEditing.personal && (
              <button
                style={{
                  position: "absolute",
                  bottom: "0",
                  right: "0",
                  background: "#9768E1",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "30px",
                  height: "30px",
                  cursor: "pointer",
                  fontSize: "14px"
                }}
                title="Change Profile Picture"
              >
                📷
              </button>
            )}
          </div>
          <div>
            <h4 style={{ margin: "0 0 5px 0", color: "#523C48" }}>
              {personalInfo.firstName} {personalInfo.lastName}
            </h4>
            <p style={{ margin: "0", color: "#A4878D" }}>
              {personalInfo.designation} • {personalInfo.department}
            </p>
            <p style={{ margin: "5px 0 0 0", color: "#A4878D", fontSize: "0.9rem" }}>
              Employee ID: {personalInfo.employeeId}
            </p>
          </div>
        </div>

        {/* Basic Information */}
        <div className="pts-form-grid">
          <div className="pts-form-group">
            <label className="pts-form-label">First Name *</label>
            {isEditing.personal ? (
              <input
                type="text"
                className="pts-form-input"
                value={personalInfo.firstName}
                onChange={(e) => handlePersonalInfoChange('firstName', e.target.value)}
              />
            ) : (
              <div className="pts-form-display">{personalInfo.firstName}</div>
            )}
          </div>

          <div className="pts-form-group">
            <label className="pts-form-label">Last Name *</label>
            {isEditing.personal ? (
              <input
                type="text"
                className="pts-form-input"
                value={personalInfo.lastName}
                onChange={(e) => handlePersonalInfoChange('lastName', e.target.value)}
              />
            ) : (
              <div className="pts-form-display">{personalInfo.lastName}</div>
            )}
          </div>

          <div className="pts-form-group">
            <label className="pts-form-label">Email Address *</label>
            {isEditing.personal ? (
              <input
                type="email"
                className="pts-form-input"
                value={personalInfo.email}
                onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
              />
            ) : (
              <div className="pts-form-display">{personalInfo.email}</div>
            )}
          </div>

          <div className="pts-form-group">
            <label className="pts-form-label">Phone Number</label>
            {isEditing.personal ? (
              <input
                type="tel"
                className="pts-form-input"
                value={personalInfo.phone}
                onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
              />
            ) : (
              <div className="pts-form-display">{personalInfo.phone}</div>
            )}
          </div>

          <div className="pts-form-group">
            <label className="pts-form-label">Department</label>
            {isEditing.personal ? (
              <select
                className="pts-form-select"
                value={personalInfo.department}
                onChange={(e) => handlePersonalInfoChange('department', e.target.value)}
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            ) : (
              <div className="pts-form-display">{personalInfo.department}</div>
            )}
          </div>

          <div className="pts-form-group">
            <label className="pts-form-label">Designation</label>
            {isEditing.personal ? (
              <select
                className="pts-form-select"
                value={personalInfo.designation}
                onChange={(e) => handlePersonalInfoChange('designation', e.target.value)}
              >
                {designations.map(designation => (
                  <option key={designation} value={designation}>{designation}</option>
                ))}
              </select>
            ) : (
              <div className="pts-form-display">{personalInfo.designation}</div>
            )}
          </div>

          <div className="pts-form-group">
            <label className="pts-form-label">Employee ID</label>
            <div className="pts-form-display">{personalInfo.employeeId}</div>
          </div>

          <div className="pts-form-group">
            <label className="pts-form-label">Joining Date</label>
            <div className="pts-form-display">{new Date(personalInfo.joiningDate).toLocaleDateString()}</div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="pts-form-group">
          <label className="pts-form-label">Bio</label>
          {isEditing.personal ? (
            <textarea
              className="pts-form-textarea"
              value={personalInfo.bio}
              onChange={(e) => handlePersonalInfoChange('bio', e.target.value)}
              rows={3}
              placeholder="Tell us about yourself..."
            />
          ) : (
            <div className="pts-form-display">{personalInfo.bio}</div>
          )}
        </div>

        {/* Address Section */}
        <h4 style={{ color: "#523C48", marginTop: "30px", marginBottom: "20px" }}>Address Information</h4>
        <div className="pts-form-grid">
          <div className="pts-form-group">
            <label className="pts-form-label">Street Address</label>
            {isEditing.personal ? (
              <input
                type="text"
                className="pts-form-input"
                value={personalInfo.address}
                onChange={(e) => handlePersonalInfoChange('address', e.target.value)}
              />
            ) : (
              <div className="pts-form-display">{personalInfo.address}</div>
            )}
          </div>

          <div className="pts-form-group">
            <label className="pts-form-label">City</label>
            {isEditing.personal ? (
              <input
                type="text"
                className="pts-form-input"
                value={personalInfo.city}
                onChange={(e) => handlePersonalInfoChange('city', e.target.value)}
              />
            ) : (
              <div className="pts-form-display">{personalInfo.city}</div>
            )}
          </div>

          <div className="pts-form-group">
            <label className="pts-form-label">State</label>
            {isEditing.personal ? (
              <input
                type="text"
                className="pts-form-input"
                value={personalInfo.state}
                onChange={(e) => handlePersonalInfoChange('state', e.target.value)}
              />
            ) : (
              <div className="pts-form-display">{personalInfo.state}</div>
            )}
          </div>

          <div className="pts-form-group">
            <label className="pts-form-label">ZIP Code</label>
            {isEditing.personal ? (
              <input
                type="text"
                className="pts-form-input"
                value={personalInfo.zipCode}
                onChange={(e) => handlePersonalInfoChange('zipCode', e.target.value)}
              />
            ) : (
              <div className="pts-form-display">{personalInfo.zipCode}</div>
            )}
          </div>

          <div className="pts-form-group">
            <label className="pts-form-label">Country</label>
            {isEditing.personal ? (
              <input
                type="text"
                className="pts-form-input"
                value={personalInfo.country}
                onChange={(e) => handlePersonalInfoChange('country', e.target.value)}
              />
            ) : (
              <div className="pts-form-display">{personalInfo.country}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="pts-fade-in">
      {/* Password Change Section */}
      <div className="pts-form-container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
          <h3 className="pts-form-title">Password & Security</h3>
          {!isEditing.security ? (
            <button
              className="pts-btn-primary"
              onClick={() => toggleEdit('security')}
            >
              Change Password
            </button>
          ) : (
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                className="pts-btn-secondary"
                onClick={() => cancelEdit('security')}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                className="pts-btn-primary"
                onClick={() => saveChanges('security')}
                disabled={isSaving}
              >
                {isSaving ? "Updating..." : "Update Password"}
              </button>
            </div>
          )}
        </div>

        {isEditing.security && (
          <div className="pts-form-grid">
            <div className="pts-form-group">
              <label className="pts-form-label">Current Password</label>
              <input
                type="password"
                className="pts-form-input"
                value={securitySettings.currentPassword}
                onChange={(e) => handleSecurityChange('currentPassword', e.target.value)}
                placeholder="Enter current password"
              />
            </div>

            <div className="pts-form-group">
              <label className="pts-form-label">New Password</label>
              <input
                type="password"
                className="pts-form-input"
                value={securitySettings.newPassword}
                onChange={(e) => handleSecurityChange('newPassword', e.target.value)}
                placeholder="Enter new password (min 8 characters)"
              />
            </div>

            <div className="pts-form-group">
              <label className="pts-form-label">Confirm New Password</label>
              <input
                type="password"
                className="pts-form-input"
                value={securitySettings.confirmPassword}
                onChange={(e) => handleSecurityChange('confirmPassword', e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
          </div>
        )}
      </div>

      {/* Security Settings */}
      <div className="pts-form-container">
        <h3 className="pts-form-title">Security Settings</h3>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "15px",
            background: "#f8f9fa",
            borderRadius: "8px"
          }}>
            <div>
              <h4 style={{ margin: "0 0 5px 0", color: "#523C48" }}>Two-Factor Authentication</h4>
              <p style={{ margin: "0", color: "#A4878D", fontSize: "0.9rem" }}>
                Add an extra layer of security to your account
              </p>
            </div>
            <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={securitySettings.twoFactorEnabled}
                onChange={(e) => handleSecurityChange('twoFactorEnabled', e.target.checked)}
                style={{ marginRight: "8px" }}
              />
              <span style={{ color: securitySettings.twoFactorEnabled ? "#28a745" : "#6c757d" }}>
                {securitySettings.twoFactorEnabled ? "Enabled" : "Disabled"}
              </span>
            </label>
          </div>

          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "15px",
            background: "#f8f9fa",
            borderRadius: "8px"
          }}>
            <div>
              <h4 style={{ margin: "0 0 5px 0", color: "#523C48" }}>Email Notifications</h4>
              <p style={{ margin: "0", color: "#A4878D", fontSize: "0.9rem" }}>
                Receive security alerts via email
              </p>
            </div>
            <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={securitySettings.emailNotifications}
                onChange={(e) => handleSecurityChange('emailNotifications', e.target.checked)}
                style={{ marginRight: "8px" }}
              />
              <span style={{ color: securitySettings.emailNotifications ? "#28a745" : "#6c757d" }}>
                {securitySettings.emailNotifications ? "Enabled" : "Disabled"}
              </span>
            </label>
          </div>

          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "15px",
            background: "#f8f9fa",
            borderRadius: "8px"
          }}>
            <div>
              <h4 style={{ margin: "0 0 5px 0", color: "#523C48" }}>SMS Notifications</h4>
              <p style={{ margin: "0", color: "#A4878D", fontSize: "0.9rem" }}>
                Receive security alerts via SMS
              </p>
            </div>
            <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={securitySettings.smsNotifications}
                onChange={(e) => handleSecurityChange('smsNotifications', e.target.checked)}
                style={{ marginRight: "8px" }}
              />
              <span style={{ color: securitySettings.smsNotifications ? "#28a745" : "#6c757d" }}>
                {securitySettings.smsNotifications ? "Enabled" : "Disabled"}
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="pts-fade-in">
      <div className="pts-form-container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
          <h3 className="pts-form-title">Application Preferences</h3>
          {!isEditing.preferences ? (
            <button
              className="pts-btn-primary"
              onClick={() => toggleEdit('preferences')}
            >
              Edit Preferences
            </button>
          ) : (
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                className="pts-btn-secondary"
                onClick={() => cancelEdit('preferences')}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                className="pts-btn-primary"
                onClick={() => saveChanges('preferences')}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Preferences"}
              </button>
            </div>
          )}
        </div>

        <div className="pts-form-grid">
          <div className="pts-form-group">
            <label className="pts-form-label">Theme</label>
            {isEditing.preferences ? (
              <select
                className="pts-form-select"
                value={preferences.theme}
                onChange={(e) => handlePreferencesChange('theme', e.target.value)}
              >
                {themes.map(theme => (
                  <option key={theme} value={theme}>
                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </option>
                ))}
              </select>
            ) : (
              <div className="pts-form-display">
                {preferences.theme.charAt(0).toUpperCase() + preferences.theme.slice(1)}
              </div>
            )}
          </div>

          <div className="pts-form-group">
            <label className="pts-form-label">Language</label>
            {isEditing.preferences ? (
              <select
                className="pts-form-select"
                value={preferences.language}
                onChange={(e) => handlePreferencesChange('language', e.target.value)}
              >
                {languages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            ) : (
              <div className="pts-form-display">{preferences.language}</div>
            )}
          </div>

          <div className="pts-form-group">
            <label className="pts-form-label">Timezone</label>
            {isEditing.preferences ? (
              <select
                className="pts-form-select"
                value={preferences.timezone}
                onChange={(e) => handlePreferencesChange('timezone', e.target.value)}
              >
                {timezones.map(tz => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            ) : (
              <div className="pts-form-display">{preferences.timezone}</div>
            )}
          </div>

          <div className="pts-form-group">
            <label className="pts-form-label">Date Format</label>
            {isEditing.preferences ? (
              <select
                className="pts-form-select"
                value={preferences.dateFormat}
                onChange={(e) => handlePreferencesChange('dateFormat', e.target.value)}
              >
                {dateFormats.map(format => (
                  <option key={format} value={format}>{format}</option>
                ))}
              </select>
            ) : (
              <div className="pts-form-display">{preferences.dateFormat}</div>
            )}
          </div>

          <div className="pts-form-group">
            <label className="pts-form-label">Default Assessment Duration (minutes)</label>
            {isEditing.preferences ? (
              <input
                type="number"
                className="pts-form-input"
                value={preferences.defaultAssessmentDuration}
                onChange={(e) => handlePreferencesChange('defaultAssessmentDuration', parseInt(e.target.value) || 60)}
                min="15"
                max="300"
              />
            ) : (
              <div className="pts-form-display">{preferences.defaultAssessmentDuration} minutes</div>
            )}
          </div>

          <div className="pts-form-group">
            <label className="pts-form-label">Email Digest Frequency</label>
            {isEditing.preferences ? (
              <select
                className="pts-form-select"
                value={preferences.emailDigest}
                onChange={(e) => handlePreferencesChange('emailDigest', e.target.value)}
              >
                {emailDigestOptions.map(option => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            ) : (
              <div className="pts-form-display">
                {preferences.emailDigest.charAt(0).toUpperCase() + preferences.emailDigest.slice(1)}
              </div>
            )}
          </div>
        </div>

        {/* Toggle Preferences */}
        <h4 style={{ color: "#523C48", marginTop: "30px", marginBottom: "20px" }}>Application Settings</h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "15px",
            background: "#f8f9fa",
            borderRadius: "8px"
          }}>
            <div>
              <h4 style={{ margin: "0 0 5px 0", color: "#523C48" }}>Auto-Save</h4>
              <p style={{ margin: "0", color: "#A4878D", fontSize: "0.9rem" }}>
                Automatically save form data as you type
              </p>
            </div>
            <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={preferences.autoSave}
                onChange={(e) => handlePreferencesChange('autoSave', e.target.checked)}
                disabled={!isEditing.preferences}
                style={{ marginRight: "8px" }}
              />
              <span style={{ color: preferences.autoSave ? "#28a745" : "#6c757d" }}>
                {preferences.autoSave ? "Enabled" : "Disabled"}
              </span>
            </label>
          </div>

          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "15px",
            background: "#f8f9fa",
            borderRadius: "8px"
          }}>
            <div>
              <h4 style={{ margin: "0 0 5px 0", color: "#523C48" }}>Notification Sounds</h4>
              <p style={{ margin: "0", color: "#A4878D", fontSize: "0.9rem" }}>
                Play sounds for notifications and alerts
              </p>
            </div>
            <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={preferences.notificationSound}
                onChange={(e) => handlePreferencesChange('notificationSound', e.target.checked)}
                disabled={!isEditing.preferences}
                style={{ marginRight: "8px" }}
              />
              <span style={{ color: preferences.notificationSound ? "#28a745" : "#6c757d" }}>
                {preferences.notificationSound ? "Enabled" : "Disabled"}
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderActivityTab = () => (
    <div className="pts-fade-in">
      <div className="pts-form-container">
        <h3 className="pts-form-title">Account Activity</h3>
        <p style={{ color: "#A4878D", marginBottom: "25px" }}>
          Recent activities on your account for security monitoring
        </p>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {activityLog.map((activity) => (
            <div key={activity.id} style={{
              padding: "20px",
              border: "1px solid #e9ecef",
              borderRadius: "8px",
              background: "white"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: "0 0 8px 0", color: "#523C48" }}>
                    {activity.action}
                  </h4>
                  <div style={{ display: "flex", gap: "20px", fontSize: "0.9rem", color: "#A4878D" }}>
                    <span>📅 {activity.timestamp}</span>
                    <span>🌐 {activity.ip}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "30px", padding: "20px", background: "#fff3cd", borderRadius: "8px", border: "1px solid #ffeaa7" }}>
          <h4 style={{ margin: "0 0 10px 0", color: "#856404" }}>Security Notice</h4>
          <p style={{ margin: "0", color: "#856404", fontSize: "0.9rem" }}>
            If you notice any suspicious activity, please contact the system administrator immediately.
            You can also enable two-factor authentication for enhanced security.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="pts-fade-in">
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="pts-success">
          {successMessage}
        </div>
      )}
      
      {errorMessage && (
        <div className="pts-error">
          {errorMessage}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="pts-form-container">
        <div style={{ display: "flex", gap: "10px", marginBottom: "0", flexWrap: "wrap" }}>
          {[
            { key: 'personal', label: 'Personal Info', icon: '👤' },
            { key: 'security', label: 'Security', icon: '🔒' },
            { key: 'preferences', label: 'Preferences', icon: '⚙️' },
            { key: 'activity', label: 'Activity Log', icon: '📊' },
          ].map(tab => (
            <button
              key={tab.key}
              className={activeTab === tab.key ? "pts-btn-primary" : "pts-btn-secondary"}
              onClick={() => {
                setActiveTab(tab.key as any);
                setErrorMessage("");
                // Cancel any active edits when switching tabs
                if (isEditing[tab.key]) {
                  cancelEdit(tab.key);
                }
              }}
              style={{ marginBottom: "10px" }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'personal' && renderPersonalTab()}
      {activeTab === 'security' && renderSecurityTab()}
      {activeTab === 'preferences' && renderPreferencesTab()}
      {activeTab === 'activity' && renderActivityTab()}
    </div>
  );
};

export default Profile;