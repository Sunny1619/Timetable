import { useState, useEffect } from 'react';
import { getSubjects } from '../../services/api';
import axios from 'axios';
import './ManageSubjects.css';

const ManageSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [formData, setFormData] = useState({
    subject_code: '',
    subject_name: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const data = await getSubjects();
      setSubjects(data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      };

      if (editingId) {
        await axios.put(
          `http://localhost:8000/api/subjects/${editingId}/`,
          formData,
          config
        );
        setMessage({ type: 'success', text: 'Subject updated successfully!' });
      } else {
        await axios.post(
          'http://localhost:8000/api/subjects/',
          formData,
          config
        );
        setMessage({ type: 'success', text: 'Subject created successfully!' });
      }

      setFormData({ subject_code: '', subject_name: '' });
      setEditingId(null);
      fetchSubjects();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.detail || 'Failed to save subject'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (subject) => {
    setEditingId(subject.id);
    setFormData({
      subject_code: subject.subject_code,
      subject_name: subject.subject_name,
    });
    setMessage({ type: '', text: '' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:8000/api/subjects/${id}/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );
      setMessage({ type: 'success', text: 'Subject deleted successfully!' });
      fetchSubjects();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete subject' });
    }
  };

  const handleCancel = () => {
    setFormData({ subject_code: '', subject_name: '' });
    setEditingId(null);
    setMessage({ type: '', text: '' });
  };

  return (
    <div className="manage-subjects-container">
      <div className="page-header">
        <h1>📚 Manage Subjects</h1>
        <p>Add and manage subjects in the system</p>
      </div>

      <div className="content-wrapper">
        <div className="form-section">
          <div className="subject-form-card">
            <h2>{editingId ? 'Edit Subject' : 'Add New Subject'}</h2>

            {message.text && (
              <div className={`alert alert-${message.type}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="subject-form">
              <div className="form-group">
                <label htmlFor="subject_code">Subject Code *</label>
                <input
                  type="text"
                  id="subject_code"
                  name="subject_code"
                  value={formData.subject_code}
                  onChange={handleChange}
                  required
                  placeholder="e.g., CS101"
                  disabled={loading}
                  maxLength="10"
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject_name">Subject Name *</label>
                <input
                  type="text"
                  id="subject_name"
                  name="subject_name"
                  value={formData.subject_name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Introduction to Computer Science"
                  disabled={loading}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? 'Saving...' : editingId ? 'Update Subject' : 'Add Subject'}
                </button>
                {editingId && (
                  <button type="button" onClick={handleCancel} className="btn-cancel">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="list-section">
          <div className="subjects-list-card">
            <h2>All Subjects ({subjects.length})</h2>

            {subjects.length === 0 ? (
              <div className="no-data">
                <p>No subjects found. Add your first subject!</p>
              </div>
            ) : (
              <div className="subjects-table-wrapper">
                <table className="subjects-table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Subject Name</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((subject) => (
                      <tr key={subject.id} className={editingId === subject.id ? 'editing' : ''}>
                        <td className="code-cell">{subject.subject_code}</td>
                        <td>{subject.subject_name}</td>
                        <td className="actions-cell">
                          <button
                            onClick={() => handleEdit(subject)}
                            className="btn-edit"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(subject.id)}
                            className="btn-delete"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageSubjects;
