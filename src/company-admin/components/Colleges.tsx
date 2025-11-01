import React, { useState } from 'react';

interface College {
  id: number;
  name: string;
  domain: string;
  ptoName: string;
  ptoEmail: string;
  students: number;
  assessments: number;
  active: boolean;
}

const Colleges: React.FC = () => {
  // Dummy data
  const [colleges, setColleges] = useState<College[]>([
    { id: 1, name: 'KSR College', domain: '@ksrit.edu.in', ptoName: 'John Doe', ptoEmail: 'pto@ksrit.edu.in', students: 320, assessments: 12, active: true },
    { id: 2, name: 'SNS College', domain: '@snsct.org', ptoName: 'Jane Smith', ptoEmail: 'pto@snsct.org', students: 280, assessments: 10, active: false },
    { id: 3, name: 'PSG College', domain: '@psgtech.ac.in', ptoName: 'Robert Johnson', ptoEmail: 'pto@psgtech.ac.in', students: 450, assessments: 18, active: true },
    { id: 4, name: 'KCT College', domain: '@kct.ac.in', ptoName: 'Emily Davis', ptoEmail: 'pto@kct.ac.in', students: 380, assessments: 15, active: true },
    { id: 5, name: 'Kumaraguru College', domain: '@kct.ac.in', ptoName: 'Michael Brown', ptoEmail: 'pto@kct.ac.in', students: 290, assessments: 11, active: false },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollege, setEditingCollege] = useState<College | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    ptoName: '',
    ptoEmail: '',
  });

  const handleAddNew = () => {
    setEditingCollege(null);
    setFormData({ name: '', domain: '', ptoName: '', ptoEmail: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (college: College) => {
    setEditingCollege(college);
    setFormData({
      name: college.name,
      domain: college.domain,
      ptoName: college.ptoName,
      ptoEmail: college.ptoEmail,
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingCollege) {
      // Update existing college
      setColleges(colleges.map(col => 
        col.id === editingCollege.id
          ? { ...col, ...formData }
          : col
      ));
    } else {
      // Add new college
      const newCollege: College = {
        id: Math.max(...colleges.map(c => c.id)) + 1,
        ...formData,
        students: 0,
        assessments: 0,
        active: true,
      };
      setColleges([...colleges, newCollege]);
    }
    setIsModalOpen(false);
    setEditingCollege(null);
    setFormData({ name: '', domain: '', ptoName: '', ptoEmail: '' });
  };

  const handleToggleStatus = (id: number) => {
    setColleges(colleges.map(col =>
      col.id === id ? { ...col, active: !col.active } : col
    ));
  };

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <h2 className="admin-page-title">Colleges Management</h2>
        <button className="admin-btn-primary" onClick={handleAddNew}>
          Add New College
        </button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>College Name</th>
              <th>Domain</th>
              <th>PTO Name</th>
              <th>PTO Email</th>
              <th>Students</th>
              <th>Assessments</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {colleges.map((college) => (
              <tr key={college.id}>
                <td>{college.name}</td>
                <td>{college.domain}</td>
                <td>{college.ptoName}</td>
                <td>{college.ptoEmail}</td>
                <td>{college.students}</td>
                <td>{college.assessments}</td>
                <td>
                  <span className={`admin-status-badge ${college.active ? 'active' : 'inactive'}`}>
                    {college.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className="admin-action-buttons">
                    <button 
                      className="admin-btn-edit"
                      onClick={() => handleEdit(college)}
                    >
                      Edit
                    </button>
                    <button
                      className={`admin-btn-toggle ${college.active ? 'disable' : 'enable'}`}
                      onClick={() => handleToggleStatus(college.id)}
                    >
                      {college.active ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editingCollege ? 'Edit College' : 'Add New College'}</h3>
              <button className="admin-modal-close" onClick={() => setIsModalOpen(false)}>
                ×
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form-group">
                <label>College Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter college name"
                />
              </div>
              <div className="admin-form-group">
                <label>Domain</label>
                <input
                  type="text"
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  placeholder="@college.edu.in"
                />
              </div>
              <div className="admin-form-group">
                <label>PTO Name</label>
                <input
                  type="text"
                  value={formData.ptoName}
                  onChange={(e) => setFormData({ ...formData, ptoName: e.target.value })}
                  placeholder="Enter PTO name"
                />
              </div>
              <div className="admin-form-group">
                <label>PTO Email</label>
                <input
                  type="email"
                  value={formData.ptoEmail}
                  onChange={(e) => setFormData({ ...formData, ptoEmail: e.target.value })}
                  placeholder="pto@college.edu.in"
                />
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn-secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button className="admin-btn-primary" onClick={handleSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Colleges;

