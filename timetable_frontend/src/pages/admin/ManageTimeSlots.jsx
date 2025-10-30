import { useState, useEffect } from 'react';
import { getTimeSlots } from '../../services/api';
import axios from 'axios';
import './ManageTimeSlots.css';

const ManageTimeSlots = () => {
  const [timeSlots, setTimeSlots] = useState([]);
  const [formData, setFormData] = useState({
    day_of_week: '',
    start_time: '',
    end_time: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editingId, setEditingId] = useState(null);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    fetchTimeSlots();
  }, []);

  const fetchTimeSlots = async () => {
    try {
      const data = await getTimeSlots();
      setTimeSlots(data);
    } catch (error) {
      console.error('Error fetching time slots:', error);
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
          `http://localhost:8000/api/time-slots/${editingId}/`,
          formData,
          config
        );
        setMessage({ type: 'success', text: 'Time slot updated successfully!' });
      } else {
        await axios.post(
          'http://localhost:8000/api/time-slots/',
          formData,
          config
        );
        setMessage({ type: 'success', text: 'Time slot created successfully!' });
      }

      setFormData({ day_of_week: '', start_time: '', end_time: '' });
      setEditingId(null);
      fetchTimeSlots();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.detail || error.response?.data?.non_field_errors?.[0] || 'Failed to save time slot'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (slot) => {
    setEditingId(slot.id);
    setFormData({
      day_of_week: slot.day_of_week,
      start_time: slot.start_time,
      end_time: slot.end_time,
    });
    setMessage({ type: '', text: '' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this time slot?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:8000/api/time-slots/${id}/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );
      setMessage({ type: 'success', text: 'Time slot deleted successfully!' });
      fetchTimeSlots();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete time slot' });
    }
  };

  const handleCancel = () => {
    setFormData({ day_of_week: '', start_time: '', end_time: '' });
    setEditingId(null);
    setMessage({ type: '', text: '' });
  };

  // Group time slots by day
  const groupedSlots = timeSlots.reduce((acc, slot) => {
    if (!acc[slot.day_of_week]) {
      acc[slot.day_of_week] = [];
    }
    acc[slot.day_of_week].push(slot);
    return acc;
  }, {});

  return (
    <div className="manage-timeslots-container">
      <div className="page-header">
        <h1>⏰ Manage Time Slots</h1>
        <p>Add and manage class time slots</p>
      </div>

      <div className="content-wrapper">
        <div className="form-section">
          <div className="timeslot-form-card">
            <h2>{editingId ? 'Edit Time Slot' : 'Add New Time Slot'}</h2>

            {message.text && (
              <div className={`alert alert-${message.type}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="timeslot-form">
              <div className="form-group">
                <label htmlFor="day_of_week">Day of Week *</label>
                <select
                  id="day_of_week"
                  name="day_of_week"
                  value={formData.day_of_week}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="">Select a day</option>
                  {daysOfWeek.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="start_time">Start Time *</label>
                  <input
                    type="time"
                    id="start_time"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="end_time">End Time *</label>
                  <input
                    type="time"
                    id="end_time"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? 'Saving...' : editingId ? 'Update Time Slot' : 'Add Time Slot'}
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
          <div className="timeslots-list-card">
            <h2>All Time Slots ({timeSlots.length})</h2>

            {timeSlots.length === 0 ? (
              <div className="no-data">
                <p>No time slots found. Add your first time slot!</p>
              </div>
            ) : (
              <div className="timeslots-by-day">
                {daysOfWeek.map(day => (
                  groupedSlots[day] && groupedSlots[day].length > 0 && (
                    <div key={day} className="day-group">
                      <h3>{day}</h3>
                      <div className="slots-grid">
                        {groupedSlots[day]
                          .sort((a, b) => a.start_time.localeCompare(b.start_time))
                          .map(slot => (
                            <div 
                              key={slot.id} 
                              className={`slot-card ${editingId === slot.id ? 'editing' : ''}`}
                            >
                              <div className="slot-time">
                                {slot.start_time} - {slot.end_time}
                              </div>
                              <div className="slot-actions">
                                <button
                                  onClick={() => handleEdit(slot)}
                                  className="btn-edit"
                                  title="Edit"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => handleDelete(slot.id)}
                                  className="btn-delete"
                                  title="Delete"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageTimeSlots;
