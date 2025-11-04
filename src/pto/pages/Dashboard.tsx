import React, { useState, useEffect, useMemo, memo } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaBuilding,
  FaUser,
  FaClipboardList,
  FaUserGraduate,
  FaChartBar,
  FaUserCircle,
  FaSignOutAlt,
  FaBell
} from 'react-icons/fa';
import DashboardHome from '../components/DashboardHome';
import DepartmentManagement from '../components/DepartmentManagement';
import StaffManagement from '../components/StaffManagement';
import AssessmentManagement from '../components/AssessmentManagement';
import StudentManagement from '../components/StudentManagement';
import ReportsAnalytics from '../components/ReportsAnalytics';
import Profile from '../components/Profile';
import '../styles/Dashboard.css';
import { useUser } from '../../contexts/UserContext';

const PTODashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useUser();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsCount] = useState(3);

  const navItems = useMemo(() => [
    { id: 'dashboard', label: 'Dashboard', path: '/pto', icon: FaTachometerAlt },
    { id: 'departments', label: 'Departments', path: '/pto/departments', icon: FaBuilding },
    { id: 'staff', label: 'Staff Management', path: '/pto/staff', icon: FaUser },
    { id: 'assessments', label: 'Assessments', path: '/pto/assessments', icon: FaClipboardList },
    { id: 'students', label: 'Students', path: '/pto/students', icon: FaUserGraduate },
    { id: 'reports', label: 'Reports & Analytics', path: '/pto/reports', icon: FaChartBar },
    { id: 'profile', label: 'Profile', path: '/pto/profile', icon: FaUserCircle },
  ], []);

  useEffect(() => {
    const currentPath = location.pathname;
    
    // Redirect root path "/" to "/pto"
    if (currentPath === '/') {
      navigate('/pto', { replace: true });
      return;
    }
    
    const matchedItem = navItems.find(item => {
      if (item.path === '/pto' && (currentPath === '/pto' || currentPath === '/pto/')) return true;
      if (item.path !== '/pto' && currentPath.startsWith(item.path)) return true;
      return false;
    });
    if (matchedItem) {
      setActiveTab(matchedItem.id);
    } else {
      setActiveTab('dashboard');
    }
  }, [location, navItems]);

  const handleLogout = () => {
    navigate('/');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Profile dropdown content with loading state
  const profileDropdownContent = useMemo(() => {
    if (loading) {
      return (
        <div className="profile-header">
          <h3>Loading...</h3>
          <p>Placement Training Officer</p>
        </div>
      );
    }

    return (
      <>
        <div className="profile-header">
          <h3>{user?.name || 'John Smith'}</h3>
          <p>{user?.role || 'Placement Training Officer'}</p>
        </div>
        <div className="profile-content">
          <Link
            to="/pto/profile"
            className="profile-link"
            onClick={() => setProfileDropdownOpen(false)}
          >
            View Profile
          </Link>
          <button className="logout-btn-small" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </>
    );
  }, [user, loading, handleLogout]);

  return (
    <div className="pto-dashboard">
      {/* Hamburger Menu Button (Mobile) */}
      <button className="hamburger-menu" onClick={toggleSidebar}>
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Sidebar Navigation */}
      <nav className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <FaUserCircle size={48} color="#ffffff" />
          </div>
          <h2>PTO Portal</h2>
        </div>
        <ul className="sidebar-menu">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className={`sidebar-link ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    closeSidebar();
                  }}
                >
                  <IconComponent className="sidebar-icon" />
                  <span className="sidebar-label">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={() => {
            handleLogout();
            closeSidebar();
          }}>
            <FaSignOutAlt className="sidebar-icon" />
            <span className="sidebar-label">Logout</span>
          </button>
        </div>
      </nav>

      {/* Overlay for mobile */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

      {/* Main Content Area */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-actions">
            <div 
              className="notification-bell" 
              title="Notifications"
              onClick={toggleNotifications}
              style={{ position: 'relative', cursor: 'pointer' }}
              ref={notificationsRef}
            >
              <FaBell />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
              {notificationsOpen && (
                <div className="notifications-dropdown" style={{ position: 'absolute', right: 0, top: '120%', zIndex: 10, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, width: 320, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderBottom: '1px solid #F3F4F6' }}>
                    <strong>Notifications</strong>
                    <button onClick={markAllNotificationsRead} style={{ fontSize: 12, color: '#6B7280' }}>Mark all read</button>
                  </div>
                  <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: 16, color: '#6B7280' }}>You're all caught up!</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} style={{ padding: '10px 12px', display: 'flex', gap: 10, alignItems: 'flex-start', background: n.read ? '#fff' : '#F9FAFB' }}>
                          <div style={{ marginTop: 2, color: n.read ? '#9CA3AF' : '#9768E1' }}>•</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600 }}>{n.title}</div>
                            {n.detail && <div style={{ fontSize: 12, color: '#6B7280' }}>{n.detail}</div>}
                            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>{n.timestamp}</div>
                          </div>
                          <button onClick={() => dismissNotification(n.id)} style={{ fontSize: 12, color: '#6B7280' }}>Dismiss</button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="profile-dropdown-container">
              <div
                className="user-avatar"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              >
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} style={{ width: 32, height: 32, borderRadius: '50%' }} />
                ) : (
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#EDE9FE', color: '#5B21B6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    {user.name.split(' ').map(n => n[0]).slice(0,2).join('')}
                  </div>
                )}
              </div>
              {profileDropdownOpen && (
                <div className="profile-dropdown">
                  {profileDropdownContent}
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          <Routes>
            <Route index element={<DashboardHome />} />
            <Route path="departments" element={<DepartmentManagement />} />
            <Route path="staff" element={<StaffManagement />} />
            <Route path="assessments" element={<AssessmentManagement />} />
            <Route path="students" element={<StudentManagement />} />
            <Route path="reports" element={<ReportsAnalytics />} />
            <Route path="profile" element={<Profile />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default memo(PTODashboard);