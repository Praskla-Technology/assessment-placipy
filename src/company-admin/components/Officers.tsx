import React, { useState } from 'react';

interface Officer {
  id: number;
  name: string;
  email: string;
  college: string;
  active: boolean;
}

const Officers: React.FC = () => {
  // Dummy data
  const [officers, setOfficers] = useState<Officer[]>([
    { id: 1, name: 'John Doe', email: 'john.doe@ksrit.edu.in', college: 'KSR College', active: true },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@snsct.org', college: 'SNS College', active: true },
    { id: 3, name: 'Robert Johnson', email: 'robert.j@psgtech.ac.in', college: 'PSG College', active: false },
    { id: 4, name: 'Emily Davis', email: 'emily.d@kct.ac.in', college: 'KCT College', active: true },
    { id: 5, name: 'Michael Brown', email: 'michael.b@kct.ac.in', college: 'Kumaraguru College', active: true },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState<Officer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    college: '',
  });

  const colleges = ['KSR College', 'SNS College', 'PSG College', 'KCT College', 'Kumaraguru College'];

  const handleCreate = () => {
    setEditingOfficer(null);
    setFormData({ name: '', email: '', college: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (officer: Officer) => {
    setEditingOfficer(officer);
    setFormData({
      name: officer.name,
      email: officer.email,
      college: officer.college,
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingOfficer) {
      // Update existing officer
      setOfficers(officers.map(off =>
        off.id === editingOfficer.id
          ? { ...off, ...formData }
          : off
      ));
    } else {
      // Add new officer
      const newOfficer: Officer = {
        id: Math.max(...officers.map(o => o.id)) + 1,
        ...formData,
        active: true,
      };
      setOfficers([...officers, newOfficer]);
    }
    setIsModalOpen(false);
    setEditingOfficer(null);
    setFormData({ name: '', email: '', college: '' });
  };

  const handleToggleStatus = (id: number) => {
    setOfficers(officers.map(off =>
      off.id === id ? { ...off, active: !off.active } : off
    ));
  };

  const handleResetPassword = (id: number) => {
    // In real app, this would call an API
    alert(`Password reset email sent to officer #${id}`);
  };

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <h2 className="admin-page-title">Placement Training Officers</h2>
        <button className="admin-btn-primary" onClick={handleCreate}>
          Create Officer
        </button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>College</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {officers.map((officer) => (
              <tr key={officer.id}>
                <td>{officer.name}</td>
                <td>{officer.email}</td>
                <td>{officer.college}</td>
                <td>
                  <span className={`admin-status-badge ${officer.active ? 'active' : 'inactive'}`}>
                    {officer.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className="admin-action-buttons">
                    <button
                      className="admin-btn-edit"
                      onClick={() => handleEdit(officer)}
                    >
                      Edit
                    </button>
                    <button
                      className="admin-btn-reset"
                      onClick={() => handleResetPassword(officer.id)}
                    >
                      Reset Password
                    </button>
                    <button
                      className={`admin-btn-toggle ${officer.active ? 'deactivate' : 'activate'}`}
                      onClick={() => handleToggleStatus(officer.id)}
                    >
                      {officer.active ? 'Deactivate' : 'Activate'}
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
              <h3>{editingOfficer ? 'Edit Officer' : 'Create New Officer'}</h3>
              <button className="admin-modal-close" onClick={() => setIsModalOpen(false)}>
                ×
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter officer name"
                />
              </div>
              <div className="admin-form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="officer@college.edu.in"
                />
              </div>
              <div className="admin-form-group">
                <label>College</label>
                <select
                  value={formData.college}
                  onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                >
                  <option value="">Select College</option>
                  {colleges.map((college) => (
                    <option key={college} value={college}>
                      {college}
                    </option>
                  ))}
                </select>
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

export default Officers;

