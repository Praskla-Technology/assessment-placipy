import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import DashboardHome from '../components/DashboardHome';
import Assessments from '../components/Assessments';
import ResultsReports from '../components/ResultsReports';
import Profile from '../components/Profile';
import Notifications from '../components/Notifications';
import { ProfileDropdown } from '../components/Profile';
import '../styles/Dashboard.css';
import AuthService from '../../services/auth.service';

// Student Dashboard Component
const StudentDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Navigation items (removed profile)
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/student' },
    { id: 'assessments', label: 'Assessments', path: '/student/assessments' },
    { id: 'results', label: 'Results & Reports', path: '/student/results' },
    { id: 'notifications', label: 'Notifications', path: '/student/notifications' },
  ];

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
        if (userRole !== 'Student') {
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

  // Update active tab based on current location
  useEffect(() => {
    const currentPath = location.pathname;

    // Handle both /student and /dashboard paths
    const normalizedPath = currentPath.replace('/dashboard', '/student');

    // Find exact match first
    const exactMatch = navItems.find(item => item.path === normalizedPath);
    if (exactMatch) {
      setActiveTab(exactMatch.id);
      return;
    }

    // Special cases for root paths
    if (normalizedPath === '/student' || normalizedPath === '/student/') {
      setActiveTab('dashboard');
      return;
    }

    // Default to dashboard if no match
    setActiveTab('dashboard');
  }, [location]);

  const handleLogout = () => {
    AuthService.logout();
    navigate('/');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  if (isLoading) {
    return <div className="loading">Verifying access...</div>;
  }

  return (
    <div className="student-dashboard">
      {/* Hamburger Menu Button (Visible on mobile) */}
      <button className="hamburger-menu" onClick={toggleSidebar}>
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Sidebar Navigation */}
      <nav className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Student Portal</h2>
        </div>
        <ul className="sidebar-menu">
          {navItems.map((item) => (
            <li key={item.id}>
              <Link
                to={item.path}
                className={`sidebar-link ${activeTab === item.id ? 'active' : ''} sidebar-link-${item.id}`}
                onClick={() => {
                  setActiveTab(item.id);
                  closeSidebar();
                }}
              >
                <span className="sidebar-label">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={() => {
            handleLogout();
            closeSidebar();
          }}>
            <span className="sidebar-label">Logout</span>
          </button>
        </div>
      </nav>

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

      {/* Main Content Area */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>Welcome, Student!</h1>
          <ProfileDropdown />
        </header>

        <div className="dashboard-content">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/assessments" element={<Assessments />} />
            <Route path="/results" element={<ResultsReports />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/notifications" element={<Notifications />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;