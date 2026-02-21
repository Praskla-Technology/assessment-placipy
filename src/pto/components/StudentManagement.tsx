import React, { useEffect, useState } from 'react';
import { FaUserGraduate, FaSearch, FaFilter, FaBuilding, FaSyncAlt } from 'react-icons/fa';
import PTOService from '../../services/pto.service';

interface Student {
  id: number;
  name: string;
  rollNumber: string;
  department: string;
  email: string;
  testsParticipated: number;
  avgScore: number;
}

const StudentManagement: React.FC = () => {
  const deptCodeFromValue = (value: string) => {
    const upper = String(value || '').trim().toUpperCase();
    const map: Record<string, string> = {
      CSE: 'CSE',
      CS: 'CSE',
      'COMPUTER SCIENCE': 'CSE',
      'COMPUTER SCIENCE ENGINEERING': 'CSE',
      'COMPUTER SCIENCE AND ENGINEERING': 'CSE',
      IT: 'IT',
      'INFORMATION TECHNOLOGY': 'IT',
      ECE: 'ECE',
      ELECTRONICS: 'ECE',
      'ELECTRONICS AND COMMUNICATION': 'ECE',
      EEE: 'EEE',
      'ELECTRICAL AND ELECTRONICS ENGINEERING': 'EEE',
      ME: 'ME',
      MECHANICAL: 'ME',
      'MECHANICAL ENGINEERING': 'ME',
      CE: 'CE',
      CIVIL: 'CE',
      'CIVIL ENGINEERING': 'CE'
    };
    if (!upper) return '';
    if (map[upper]) return map[upper];
    if (/^[A-Z]{2,4}$/.test(upper)) return upper;
    return upper.substring(0, 3);
  };
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [metricsLoading, setMetricsLoading] = useState<boolean>(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterAssessment, setFilterAssessment] = useState('all');
  const [assessments, setAssessments] = useState<Array<{ id: string; name: string; department: string; status?: string }>>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  const [departments, setDepartments] = useState<string[]>(['all']);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await PTOService.getStudents();
        const mapped: Student[] = data.map(s => ({
          id: Number((s.id || '').split('#').pop()) || Math.random(),
          name: s.name,
          rollNumber: s.rollNumber || '',
          department: s.department,
          email: s.email,
          testsParticipated: s.testsParticipated || 0,
          avgScore: s.avgScore || 0,
        }));
        setStudents(mapped);
        const catalog = await PTOService.getDepartmentCatalog();
        const codes = Array.isArray(catalog)
          ? catalog.map((d: any) => {
              if (typeof d === 'string') return d;
              if (d && typeof d === 'object') return String(d.code || '').toUpperCase();
              return String(d || '').toUpperCase();
            }).filter((c: string) => !!c && c !== '[OBJECT OBJECT]')
          : [];
        const unique = Array.from(new Set(codes));
        setDepartments(['all', ...unique]);
        try {
          const asses = await PTOService.getAssessments();
          const mappedAss = (asses || []).map((a: any) => ({ id: String(a.id || a.assessmentId || a.SK || ''), name: String(a.name || a.title || ''), department: String(a.department || (Array.isArray((a.target||{}).departments) ? (a.target as any).departments[0] : '')), status: String((a.status || '').toLowerCase()) }));
          setAssessments([{ id: 'all', name: 'All Assessments', department: '' }, ...mappedAss.filter(x => x.id && x.name)]);
        } catch {}
        try {
          const ann = await PTOService.listAnnouncements({ limit: 10 });
          const items = (ann.items || []).slice().sort((a: any, b: any) => String(b.createdAt || b.SK).localeCompare(String(a.createdAt || a.SK)));
          const uniq = Array.from(new Map(items.map((x: any) => [String(x.SK || x.id), x])).values());
          setAnnouncements(uniq);
        } catch {}
      } catch (e: any) {
        setError(e.message || 'Failed to load students');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const refreshMetrics = async () => {
    try {
      setMetricsLoading(true);
      const metrics = await PTOService.getStudentMetrics();
      setStudents(prev => prev.map(st => {
        const info = metrics[String(st.email || '').toLowerCase()];
        if (!info) return st;
        return {
          ...st,
          testsParticipated: Number(info.tests || 0),
          avgScore: Math.round(Number(info.avg || 0))
        };
      }));
    } catch (err) {
      const msg = (err as Error)?.message || 'Failed to refresh metrics';
      setError(msg);
    } finally {
      setMetricsLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || deptCodeFromValue(student.department) === deptCodeFromValue(filterDepartment);
    let matchesAssessment = true;
    if (filterAssessment !== 'all') {
      const selected = assessments.find(a => a.id === filterAssessment);
      const dept = selected?.department || '';
      matchesAssessment = !dept || deptCodeFromValue(student.department) === deptCodeFromValue(dept);
    }
    return matchesSearch && matchesDepartment && matchesAssessment;
  });



  return (
    <div className="pto-component-page">
      {error && <div className="admin-error"><p>{error}</p></div>}
      {loading && <div className="admin-loading"><div className="spinner"></div><p>Loading students...</p></div>}
      {/* Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <FaUserGraduate size={24} color="#9768E1" />
          <div className="stat-content">
            <h3>Total Students</h3>
            <p className="stat-value">{students.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <FaBuilding size={24} color="#9768E1" />
          <div className="stat-content">
            <h3>Departments</h3>
            <p className="stat-value">{new Set(students.map(s => s.department)).size}</p>
          </div>
        </div>
        <div className="stat-card">
          <FaFilter size={24} color="#9768E1" />
          <div className="stat-content">
            <h3>Active Tests</h3>
            <p className="stat-value">{assessments.filter(a => a.id !== 'all' && a.status === 'active').length}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons-section">
        <button
          className="secondary-btn"
          onClick={refreshMetrics}
          disabled={metricsLoading}
        >
          <FaSyncAlt /> {metricsLoading ? 'Refreshing…' : 'Refresh Metrics'}
        </button>
      </div>

      {/* Search and Filter */}
      <div className="search-filter-section">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, roll number, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-box">
          <FaFilter className="filter-icon" />
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>
                {dept === 'all' ? 'All Departments' : dept}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-box">
          <FaFilter className="filter-icon" />
          <select
            value={filterAssessment}
            onChange={(e) => setFilterAssessment(e.target.value)}
          >
            {assessments.map(a => (
              <option key={a.id} value={a.id}>
                {a.name || (a.id === 'all' ? 'All Assessments' : a.id)}
              </option>
            ))}
          </select>
        </div>
      </div>



      {/* Students Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Roll Number</th>
              <th>Department</th>
              <th>Email</th>
              <th>Tests Participated</th>
              <th>Average Score</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map(student => (
              <tr key={student.id}>
                <td>{student.name}</td>
                <td>{student.rollNumber}</td>
                <td>{student.department}</td>
                <td>{student.email}</td>
                <td>{student.testsParticipated}</td>
                <td>
                  <span className={`score-badge ${student.avgScore >= 80 ? 'high' : student.avgScore >= 70 ? 'medium' : 'low'}`}>
                    {student.avgScore}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>



      {/* Recent Announcements */}
      {announcements.length > 0 && (
        <div className="table-container" style={{ marginTop: 20 }}>
          <h3>Recent Announcements</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Message</th>
                <th>Tags</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {announcements.map((a: any) => (
                <tr key={a.SK}>
                  <td>{a.title}</td>
                  <td>{a.message}</td>
                  <td>{Array.isArray(a.tags) ? a.tags.join(', ') : ''}</td>
                  <td>
                    {new Date(a.createdAt).toLocaleString()}
                    <button className="icon-btn delete-btn" title="Delete" style={{ marginLeft: 12 }} onClick={async () => {
                      if (!window.confirm('Delete this announcement?')) return;
                      try {
                        await PTOService.deleteAnnouncement(a.id || a.SK);
                        setAnnouncements(prev => prev.filter(x => (x.id || x.SK) !== (a.id || a.SK)));
                      } catch (e) {
                        alert('Failed to delete announcement');
                      }
                    }}>✖</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;

