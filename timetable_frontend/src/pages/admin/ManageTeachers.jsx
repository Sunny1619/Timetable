import { useState } from 'react';
import { createTeacher } from '../../services/api';
import './ManageTeachers.css';

const ManageTeachers = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    short_form: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

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
      await createTeacher(formData);
      setMessage({ type: 'success', text: 'Teacher created successfully!' });
      setFormData({ username: '', password: '', short_form: '' });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.detail || 'Failed to create teacher' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="manage-teachers-container">
      <div className="page-header">
        <h1>👨‍🏫 Manage Teachers</h1>
        <p>Add new teachers to the system</p>
      </div>

      <div className="teacher-form-card">
        <h2>Add New Teacher</h2>

        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="teacher-form">
          <div className="form-group">
            <label htmlFor="username">Username *</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Enter username"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter password"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="short_form">Short Form *</label>
            <input
              type="text"
              id="short_form"
              name="short_form"
              value={formData.short_form}
              onChange={handleChange}
              required
              placeholder="e.g., JD, MS"
              disabled={loading}
              maxLength="10"
            />
            <small>A short identifier for the teacher (max 10 characters)</small>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Teacher'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ManageTeachers;
