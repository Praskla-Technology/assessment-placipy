import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Filter, X, Save } from 'lucide-react';

interface Student {
  email: string;                 // Primary identifier - college email (@ksrce.ac.in)
  name: string;                  // Full name
  rollNumber: string;            // Roll number
  department: string;            // Department
  phone?: string;                // Phone number (optional)
  status: 'Active' | 'Inactive'; // Student status
  createdAt: string;             // When student was added
  createdBy?: string;            // PTS user who added this student
}

const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    rollNumber: '',
    department: 'Computer Science',
    phone: '',
    status: 'Active' as 'Active' | 'Inactive'
  });

  const departments = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Information Technology'];

  const handleAddStudent = () => {
    // Validate email domain
    if (!formData.email.endsWith('@ksrce.ac.in')) {
      alert('Email must be from @ksrce.ac.in domain');
      return;
    }

    // Check if email already exists
    if (students.some(s => s.email === formData.email)) {
      alert('A student with this email already exists');
      return;
    }

    // Check if roll number already exists
    if (students.some(s => s.rollNumber === formData.rollNumber)) {
      alert('A student with this roll number already exists');
      return;
    }

    const newStudent: Student = {
      ...formData,
      createdAt: new Date().toISOString(),
      createdBy: 'Current PTS User' // Will be replaced with actual user from context
    };
    setStudents([...students, newStudent]);
    resetForm();
    setShowAddModal(false);
    alert('Student added successfully!');
  };

  const handleEditStudent = () => {
    if (selectedStudent) {
      // Check if roll number changed and if new roll number already exists
      if (formData.rollNumber !== selectedStudent.rollNumber) {
        if (students.some(s => s.email !== selectedStudent.email && s.rollNumber === formData.rollNumber)) {
          alert('A student with this roll number already exists');
          return;
        }
      }

      setStudents(students.map(s => 
        s.email === selectedStudent.email 
          ? { ...s, ...formData }
          : s
      ));
      resetForm();
      setShowEditModal(false);
      setSelectedStudent(null);
      alert('Student updated successfully!');
    }
  };

  const handleDeleteStudent = (email: string) => {
    const student = students.find(s => s.email === email);
    if (window.confirm(`Are you sure you want to delete ${student?.name}?`)) {
      setStudents(students.filter(s => s.email !== email));
      alert('Student deleted successfully!');
    }
  };

  const toggleStudentStatus = (email: string) => {
    setStudents(prev =>
      prev.map(student =>
        student.email === email
          ? { ...student, status: student.status === 'Active' ? 'Inactive' : 'Active' }
          : student
      )
    );
  };

  const openEditModal = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      email: student.email,
      name: student.name,
      rollNumber: student.rollNumber,
      department: student.department,
      phone: student.phone || '',
      status: student.status
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      email: '',
      name: '',
      rollNumber: '',
      department: 'Computer Science',
      phone: '',
      status: 'Active'
    });
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhoneChange = (value: string) => {
    // Allow only numbers, spaces, +, -, and ()
    const phoneRegex = /^[0-9+\-\s()]*$/;
    if (phoneRegex.test(value)) {
      setFormData(prev => ({ ...prev, phone: value }));
    }
  };

  const handleEmailChange = (value: string) => {
    // Auto-add domain if user types just the username
    let email = value.toLowerCase();
    
    // If email doesn't contain @ and user is typing, just update
    if (!email.includes('@')) {
      setFormData(prev => ({ ...prev, email }));
    } else if (email.includes('@') && !email.endsWith('@ksrce.ac.in')) {
      // If @ is present but not the right domain, suggest correction
      const username = email.split('@')[0];
      setFormData(prev => ({ ...prev, email: `${username}@ksrce.ac.in` }));
    } else {
      setFormData(prev => ({ ...prev, email }));
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || student.department === filterDepartment;
    const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  return (
    <div className="pts-fade-in">
      {/* Header Actions */}
      <div className="action-buttons-section" style={{ marginBottom: '20px' }}>
        <button className="pts-btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={18} /> Add New Student
        </button>
      </div>

      {/* Search and Filters */}
      <div className="pts-form-container" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div className="pts-form-group">
            <label className="pts-form-label">
              <Search size={16} /> Search
            </label>
            <input
              type="text"
              className="pts-form-input"
              placeholder="Search by name, roll number, or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="pts-form-group">
            <label className="pts-form-label">
              <Filter size={16} /> Department
            </label>
            <select
              className="pts-form-select"
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div className="pts-form-group">
            <label className="pts-form-label">Status</label>
            <select
              className="pts-form-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="pts-form-container">
        <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="pts-form-title">Students List</h3>
          <div style={{ color: '#A4878D', fontSize: '0.9rem' }}>
            Showing {filteredStudents.length} of {students.length} students
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e9ecef' }}>
                <th style={{ padding: '12px', textAlign: 'left', color: '#523C48' }}>Email</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#523C48' }}>Roll No</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#523C48' }}>Name</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#523C48' }}>Department</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#523C48' }}>Phone</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#523C48' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'center', color: '#523C48' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#A4878D' }}>
                    No students found
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.email} style={{ borderBottom: '1px solid #e9ecef' }}>
                    <td style={{ padding: '12px', color: '#A4878D', fontSize: '0.9rem' }}>{student.email}</td>
                    <td style={{ padding: '12px', color: '#523C48', fontWeight: '500' }}>{student.rollNumber}</td>
                    <td style={{ padding: '12px', color: '#523C48' }}>{student.name}</td>
                    <td style={{ padding: '12px', color: '#523C48' }}>{student.department}</td>
                    <td style={{ padding: '12px', color: '#A4878D', fontSize: '0.9rem' }}>{student.phone || '-'}</td>
                    <td style={{ padding: '12px' }}>
                      <button
                        onClick={() => toggleStudentStatus(student.email)}
                        style={{
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '0.85rem',
                          fontWeight: '500',
                          background: student.status === 'Active' ? '#d4edda' : '#f8d7da',
                          color: student.status === 'Active' ? '#155724' : '#721c24',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                        title="Click to toggle status"
                      >
                        {student.status}
                      </button>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        className="pts-btn-secondary"
                        style={{ 
                          padding: '6px 12px', 
                          marginRight: '5px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onClick={() => openEditModal(student)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '0.7';
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '1';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                        title="Edit student"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="pts-btn-secondary"
                        style={{ 
                          padding: '6px 12px', 
                          background: '#f8d7da', 
                          color: '#721c24',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onClick={() => handleDeleteStudent(student.email)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '0.7';
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '1';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                        title="Delete student"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 className="pts-form-title">Add New Student</h3>
              <button
                onClick={() => { setShowAddModal(false); resetForm(); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A4878D' }}
              >
                <X size={24} />
              </button>
            </div>

            <div className="pts-form-grid">
              <div className="pts-form-group">
                <label className="pts-form-label">Email (College ID) *</label>
                <input
                  type="email"
                  className="pts-form-input"
                  value={formData.email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="john.doe@ksrce.ac.in"
                  onBlur={(e) => {
                    // Auto-complete domain on blur if not present
                    if (e.target.value && !e.target.value.includes('@')) {
                      handleEmailChange(`${e.target.value}@ksrce.ac.in`);
                    }
                  }}
                />
                <small style={{ color: '#6c757d', fontSize: '0.85rem' }}>Must end with @ksrce.ac.in</small>
              </div>

              <div className="pts-form-group">
                <label className="pts-form-label">Roll Number *</label>
                <input
                  type="text"
                  className="pts-form-input"
                  value={formData.rollNumber}
                  onChange={(e) => handleFormChange('rollNumber', e.target.value)}
                  placeholder="CS2024001"
                />
              </div>

              <div className="pts-form-group">
                <label className="pts-form-label">Full Name *</label>
                <input
                  type="text"
                  className="pts-form-input"
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  placeholder="John Doe"
                />
              </div>

              <div className="pts-form-group">
                <label className="pts-form-label">Department *</label>
                <select
                  className="pts-form-select"
                  value={formData.department}
                  onChange={(e) => handleFormChange('department', e.target.value)}
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div className="pts-form-group">
                <label className="pts-form-label">Phone</label>
                <input
                  type="tel"
                  className="pts-form-input"
                  value={formData.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="+91 1234567890"
                  maxLength={15}
                />
                <small style={{ color: '#6c757d', fontSize: '0.85rem' }}>Numbers, +, -, spaces, () only</small>
              </div>

              <div className="pts-form-group">
                <label className="pts-form-label">Status</label>
                <select
                  className="pts-form-select"
                  value={formData.status}
                  onChange={(e) => handleFormChange('status', e.target.value as 'Active' | 'Inactive')}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
              <button
                className="pts-btn-secondary"
                onClick={() => { setShowAddModal(false); resetForm(); }}
              >
                Cancel
              </button>
              <button
                className="pts-btn-primary"
                onClick={handleAddStudent}
                disabled={!formData.email || !formData.name || !formData.rollNumber}
              >
                <Save size={16} /> Add Student
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditModal && selectedStudent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 className="pts-form-title">Edit Student</h3>
              <button
                onClick={() => { setShowEditModal(false); setSelectedStudent(null); resetForm(); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A4878D' }}
              >
                <X size={24} />
              </button>
            </div>

            <div className="pts-form-grid">
              <div className="pts-form-group">
                <label className="pts-form-label">Email (College ID) *</label>
                <input
                  type="email"
                  className="pts-form-input"
                  value={formData.email}
                  disabled
                  style={{ background: '#f8f9fa', cursor: 'not-allowed', color: '#6c757d' }}
                />
                <small style={{ color: '#6c757d', fontSize: '0.85rem' }}>Email cannot be changed</small>
              </div>

              <div className="pts-form-group">
                <label className="pts-form-label">Roll Number *</label>
                <input
                  type="text"
                  className="pts-form-input"
                  value={formData.rollNumber}
                  onChange={(e) => handleFormChange('rollNumber', e.target.value)}
                />
              </div>

              <div className="pts-form-group">
                <label className="pts-form-label">Full Name *</label>
                <input
                  type="text"
                  className="pts-form-input"
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                />
              </div>

              <div className="pts-form-group">
                <label className="pts-form-label">Department *</label>
                <select
                  className="pts-form-select"
                  value={formData.department}
                  onChange={(e) => handleFormChange('department', e.target.value)}
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div className="pts-form-group">
                <label className="pts-form-label">Phone</label>
                <input
                  type="tel"
                  className="pts-form-input"
                  value={formData.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="+91 1234567890"
                  maxLength={15}
                />
                <small style={{ color: '#6c757d', fontSize: '0.85rem' }}>Numbers, +, -, spaces, () only</small>
              </div>

              <div className="pts-form-group">
                <label className="pts-form-label">Status</label>
                <select
                  className="pts-form-select"
                  value={formData.status}
                  onChange={(e) => handleFormChange('status', e.target.value as 'Active' | 'Inactive')}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
              <button
                className="pts-btn-secondary"
                onClick={() => { setShowEditModal(false); setSelectedStudent(null); resetForm(); }}
              >
                Cancel
              </button>
              <button
                className="pts-btn-primary"
                onClick={handleEditStudent}
                disabled={!formData.email || !formData.name || !formData.rollNumber}
              >
                <Save size={16} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
