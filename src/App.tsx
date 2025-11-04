import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import PTSModule from "./pts/PTSModule";
import StudentDashboard from './student/pages/Dashboard';
import AdminDashboard from './company-admin/pages/Dashboard';
import PTODashboard from "./pto/pages/Dashboard";

import UnauthorizedPage from './pages/UnauthorizedPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route
            path="/student/*"
            element={
              <ProtectedRoute allowedRoles={['Student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pto/*"
            element={
              <ProtectedRoute allowedRoles={['PTO']}>
                <PTODashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pts/*"
            element={
              <ProtectedRoute allowedRoles={['PTS']}>
                <PTSModule />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company-admin/*"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
