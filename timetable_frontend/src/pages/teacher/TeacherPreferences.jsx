import { useState, useEffect } from 'react';
import { 
  getPreferences, 
  createPreference, 
  updatePreference, 
  deletePreference,
  getSubjects,
  getTimeSlots 
} from '../../services/api';
import './TeacherPreferences.css';

const TeacherPreferences = () => {
  const [preferences, setPreferences] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPref, setEditingPref] = useState(null);
  const [formData, setFormData] = useState({
    subject: '',
    semester: '',
    time_slot: '',
    preference_number: 1,
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prefsData, subjectsData, timeSlotsData] = await Promise.all([
        getPreferences(),
        getSubjects(),
        getTimeSlots(),
      ]);
      setPreferences(prefsData);
      setSubjects(subjectsData);
      setTimeSlots(timeSlotsData);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load data' });
      console.error(error);
    } finally {
      setLoading(false);
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
    setMessage({ type: '', text: '' });

    try {
      if (editingPref) {
        await updatePreference(editingPref.id, formData);
        setMessage({ type: 'success', text: 'Preference updated successfully!' });
      } else {
        await createPreference(formData);
        setMessage({ type: 'success', text: 'Preference created successfully!' });
      }
      
      resetForm();
      fetchData();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.detail || 'Failed to save preference' 
      });
    }
  };

  const handleEdit = (pref) => {
    setEditingPref(pref);
    setFormData({
      subject: pref.subject,
      semester: pref.semester,
      time_slot: pref.time_slot,
      preference_number: pref.preference_number,
    });
    setShowForm(true);
    setMessage({ type: '', text: '' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this preference?')) {
      return;
    }

    try {
      await deletePreference(id);
      setMessage({ type: 'success', text: 'Preference deleted successfully!' });
      fetchData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete preference' });
    }
  };

  const resetForm = () => {
    setFormData({
      subject: '',
      semester: '',
      time_slot: '',
      preference_number: 1,
    });
    setEditingPref(null);
    setShowForm(false);
  };

  const getSubjectName = (id) => {
    const subject = subjects.find(s => s.id === id);
    return subject ? `${subject.subject_code} - ${subject.subject_name}` : id;
  };

  const getTimeSlotName = (id) => {
    const slot = timeSlots.find(s => s.id === id);
    return slot ? `${slot.day_of_week} ${slot.start_time} - ${slot.end_time}` : id;
  };

  if (loading) {
    return (
      <div className="teacher-preferences-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="teacher-preferences-container">
      <div className="page-header">
        <h1>⭐ My Preferences</h1>
        <p>Manage your teaching preferences</p>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="actions-bar">
        <button 
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }} 
          className="btn-add"
        >
          {showForm ? '❌ Cancel' : '➕ Add Preference'}
        </button>
      </div>

      {showForm && (
        <div className="preference-form-card">
          <h2>{editingPref ? 'Edit Preference' : 'Add New Preference'}</h2>
          
          <form onSubmit={handleSubmit} className="preference-form">
            <div className="form-group">
              <label htmlFor="subject">Subject *</label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
              >
                <option value="">Select a subject</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.subject_code} - {subject.subject_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="semester">Semester *</label>
              <input
                type="number"
                id="semester"
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                required
                min="1"
                max="8"
                placeholder="Enter semester (1-8)"
              />
            </div>

            <div className="form-group">
              <label htmlFor="time_slot">Time Slot *</label>
              <select
                id="time_slot"
                name="time_slot"
                value={formData.time_slot}
                onChange={handleChange}
                required
              >
                <option value="">Select a time slot</option>
                {timeSlots.map(slot => (
                  <option key={slot.id} value={slot.id}>
                    {slot.day_of_week} {slot.start_time} - {slot.end_time}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="preference_number">Preference Priority *</label>
              <input
                type="number"
                id="preference_number"
                name="preference_number"
                value={formData.preference_number}
                onChange={handleChange}
                required
                min="1"
                placeholder="1 = highest priority"
              />
              <small>Lower numbers indicate higher priority (1 is highest)</small>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-submit">
                {editingPref ? 'Update Preference' : 'Add Preference'}
              </button>
              <button type="button" onClick={resetForm} className="btn-cancel">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="preferences-list">
        <h2>My Current Preferences</h2>
        
        {preferences.length === 0 ? (
          <div className="no-data">
            <p>You haven't added any preferences yet.</p>
          </div>
        ) : (
          <div className="preferences-grid">
            {preferences.map((pref) => (
              <div key={pref.id} className="preference-card">
                <div className="pref-header">
                  <span className="preference-number">#{pref.preference_number}</span>
                </div>
                
                <div className="pref-body">
                  <div className="pref-field">
                    <span className="label">Subject:</span>
                    <span className="value">{getSubjectName(pref.subject)}</span>
                  </div>
                  <div className="pref-field">
                    <span className="label">Semester:</span>
                    <span className="value">{pref.semester}</span>
                  </div>
                  <div className="pref-field">
                    <span className="label">Time Slot:</span>
                    <span className="value">{getTimeSlotName(pref.time_slot)}</span>
                  </div>
                </div>

                <div className="pref-actions">
                  <button onClick={() => handleEdit(pref)} className="btn-edit">
                    ✏️ Edit
                  </button>
                  <button onClick={() => handleDelete(pref.id)} className="btn-delete">
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherPreferences;
