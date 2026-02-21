import React, { useEffect, useState } from 'react';
import { User, Camera } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import PTOService from '../../services/pto.service';
import ProfileService from '../../services/profile.service';

const Profile: React.FC = () => {
  const { user, refreshUser } = useUser();
  const [activeTab, setActiveTab] = useState<'personal'>('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profilePicture, setProfilePicture] = useState<string>(
    localStorage.getItem('ptoProfilePictureUrl') ||
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
  );
  const [showImageSelector, setShowImageSelector] = useState(false);
  
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    designation: 'Placement Training Officer',
    email: '',
    phone: '',
    contact: '',
    department: '',
    employeeId: ''
  });

  const [deptOptions, setDeptOptions] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await PTOService.getProfile();
        const name = String(data.name || '').trim();
        const parts = name.split(' ');
        const first = parts[0] || '';
        const last = parts.slice(1).join(' ') || '';
        const sk = String((data.SK || '') as string);
        const empId = sk.startsWith('PTO#') ? sk.replace('PTO#','') : '';
        setProfileData({
          firstName: first,
          lastName: last,
          designation: String(data.designation || 'Placement Training Officer'),
          email: String(data.email || user?.email || ''),
          phone: String(data.phone || ''),
          contact: '',
          department: String(data.department || ''),
          employeeId: String((data.employeeId || empId) || '')
        });
        const stored = localStorage.getItem('ptoProfilePictureUrl');
        if (stored) setProfilePicture(stored);
      } catch {
        setError('Failed to load profile');
      }
    };
    load();
    const loadDepartments = async () => {
      try {
        const catalog = await PTOService.getDepartmentCatalog();
        const codes = Array.isArray(catalog)
          ? catalog
              .map((d: string | { code?: string }) => {
                if (typeof d === 'string') return d;
                if (d && typeof d === 'object') return String(d.code || '').toUpperCase();
                return String(d || '').toUpperCase();
              })
              .filter((c: string) => !!c && c !== '[OBJECT OBJECT]')
          : [];
        const unique = Array.from(new Set(codes));
        setDeptOptions(unique);
      } catch {
        setError('Failed to load departments');
      }
    };
    loadDepartments();
  }, [user]);



  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveDetails = async () => {
    setError('');
    setSuccess('');
    const firstName = String(profileData.firstName || '').trim();
    const lastName = String(profileData.lastName || '').trim();
    const email = String(profileData.email || '').trim();
    const phone = String(profileData.phone || '').trim();
    if (!firstName || !lastName) {
      setError('First name and last name are required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    try {
      const payload = {
        firstName,
        lastName,
        email,
        phone,
        designation: profileData.designation,
        department: profileData.department,
        employeeId: profileData.employeeId
      };
      await PTOService.updateProfile(payload);
      setSuccess('Profile updated successfully');
      setIsEditing(false);
      setIsSaving(false);
      await refreshUser();
      const updated = await PTOService.getProfile();
      const parts = String(updated.name || `${firstName} ${lastName}`).trim().split(' ');
        setProfileData({
          firstName: parts[0] || '',
          lastName: parts.slice(1).join(' ') || '',
          designation: String(updated.designation || 'Placement Training Officer'),
          email: String(updated.email || email),
          phone: String(updated.phone || ''),
          contact: '',
          department: String(updated.department || ''),
          employeeId: String((updated.employeeId || (String(updated.SK || '').startsWith('PTO#') ? String(updated.SK || '').replace('PTO#','') : '')) || '')
        });
        setTimeout(() => setSuccess(''), 2500);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to update profile';
      setError(msg);
      setIsSaving(false);
    }
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    setError('');
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setError('');
  };

  return (
    <div className="pts-fade-in">
      {success && (<div className="pts-success">{success}</div>)}
      {error && (<div className="pts-error">{error}</div>)}
      
      <div className="pts-form-container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
          <h3 className="pts-form-title">Personal Information</h3>
          {!isEditing ? (
            <button
              className="pts-btn-primary"
              onClick={toggleEdit}
            >
              Edit Profile
            </button>
          ) : (
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                className="pts-btn-secondary"
                onClick={cancelEdit}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                className="pts-btn-primary"
                onClick={handleSaveDetails}
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
            <div
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                border: "4px solid #9768E1",
                background: "linear-gradient(135deg, #9768E1 0%, #7B4FC4 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "40px",
                fontWeight: "bold",
                color: "white",
                textTransform: "uppercase"
              }}
            >
              {profileData.firstName ? profileData.firstName.charAt(0) : "U"}
            </div>
            {isEditing && (
              <div
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
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px"
                }}
                title="Profile Picture"
              >
                <Camera size={14} />
              </div>
            )}
          </div>
          <div>
            <h4 style={{ margin: "0 0 5px 0", color: "#523C48" }}>
              {profileData.firstName} {profileData.lastName}
            </h4>
            <p style={{ margin: "0", color: "#A4878D" }}>
              {profileData.designation} • {profileData.department}
            </p>
            <p style={{ margin: "5px 0 0 0", color: "#A4878D", fontSize: "0.9rem" }}>
              Employee ID: {profileData.employeeId}
            </p>
          </div>
        </div>

        {/* Personal Information Form */}
        <div className="pts-form-grid">
          <div className="pts-form-group">
            <label className="pts-form-label">First Name *</label>
            {isEditing ? (
              <input
                type="text"
                className="pts-form-input"
                name="firstName"
                value={profileData.firstName}
                onChange={handleInputChange}
                placeholder="Enter first name"
              />
            ) : (
              <div className="pts-form-display">{profileData.firstName}</div>
            )}
          </div>

          <div className="pts-form-group">
            <label className="pts-form-label">Last Name *</label>
            {isEditing ? (
              <input
                type="text"
                className="pts-form-input"
                name="lastName"
                value={profileData.lastName}
                onChange={handleInputChange}
                placeholder="Enter last name"
              />
            ) : (
              <div className="pts-form-display">{profileData.lastName}</div>
            )}
          </div>

          <div className="pts-form-group">
            <label className="pts-form-label">Email Address *</label>
            {isEditing ? (
              <input
                type="email"
                className="pts-form-input"
                name="email"
                value={profileData.email}
                onChange={handleInputChange}
                placeholder="Enter email"
              />
            ) : (
              <div className="pts-form-display">{profileData.email}</div>
            )}
          </div>

          <div className="pts-form-group">
            <label className="pts-form-label">Phone Number</label>
            {isEditing ? (
              <input
                type="tel"
                className="pts-form-input"
                name="phone"
                value={profileData.phone}
                onChange={handleInputChange}
                placeholder="Enter phone number"
              />
            ) : (
              <div className="pts-form-display">{profileData.phone || 'Not specified'}</div>
            )}
          </div>

          <div className="pts-form-group">
            <label className="pts-form-label">Department</label>
            <div className="pts-form-display" style={{ backgroundColor: '#f5f5f5' }}>
              {profileData.department}
            </div>
          </div>

          <div className="pts-form-group">
            <label className="pts-form-label">Designation</label>
            <div className="pts-form-display" style={{ backgroundColor: '#f5f5f5' }}>
              {profileData.designation}
            </div>
          </div>

          <div className="pts-form-group">
            <label className="pts-form-label">Employee ID</label>
            <div className="pts-form-display" style={{ backgroundColor: '#f5f5f5' }}>
              {profileData.employeeId}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

