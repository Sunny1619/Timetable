import { useState, useEffect } from 'react';
import { getPreferences } from '../../services/api';
import './ViewPreferences.css';

const ViewPreferences = () => {
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const data = await getPreferences();
      setPreferences(data);
      setError('');
    } catch (err) {
      setError('Failed to load preferences');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="view-preferences-container">
        <div className="loading">Loading preferences...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="view-preferences-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="view-preferences-container">
      <div className="page-header">
        <h1>📋 Teacher Preferences</h1>
        <p>View all teacher preferences grouped by teacher</p>
      </div>

      {preferences.length === 0 ? (
        <div className="no-data">
          <h3>No Preferences Found</h3>
          <p>Teachers haven't submitted their preferences yet.</p>
        </div>
      ) : (
        <div className="preferences-list">
          {preferences.map((group, index) => (
            <div key={index} className="teacher-group">
              <div className="teacher-header">
                <h2>👨‍🏫 {group.teacher}</h2>
                <span className="pref-count">{group.preferences.length} preferences</span>
              </div>

              <div className="preferences-grid">
                {group.preferences.map((pref) => (
                  <div key={pref.id} className="preference-card">
                    <div className="pref-header">
                      <span className="subject">{pref.subject}</span>
                      <span className="preference-number">#{pref.preference_number}</span>
                    </div>
                    <div className="pref-details">
                      <div className="pref-detail">
                        <span className="label">📅 Time Slot:</span>
                        <span className="value">{pref.time_slot}</span>
                      </div>
                      <div className="pref-detail">
                        <span className="label">📚 Semester:</span>
                        <span className="value">{pref.semester}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewPreferences;
