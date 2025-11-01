import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import PTSModule from "./pts/PTSModule";
import StudentDashboard from './student/pages/Dashboard';
import AdminDashboard from './company-admin/pages/Dashboard';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/student/*" element={<StudentDashboard />} />
          <Route path="/dashboard/*" element={<StudentDashboard />} />
          <Route path="/pts/*" element={<PTSModule />} />
          <Route path="/company-admin/*" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;