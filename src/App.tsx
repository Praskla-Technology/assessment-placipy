import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import PTSModule from "./pts/PTSModule";
import StudentDashboard from './student/pages/Dashboard';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/student/*" element={<StudentDashboard />} />
          <Route path="/dashboard/*" element={<StudentDashboard />} />
          <Route path="/pts/*" element={<PTSModule />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;