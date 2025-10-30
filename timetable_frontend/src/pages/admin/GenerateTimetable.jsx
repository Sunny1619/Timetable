import { useState } from 'react';
import { generateTimetable } from '../../services/api';
import './GenerateTimetable.css';

const GenerateTimetable = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);

    try {
      const data = await generateTimetable();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: error.response?.data?.message || 'Failed to generate timetable',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="generate-timetable-container">
      <div className="page-header">
        <h1>🎯 Generate Timetable</h1>
        <p>Create a new timetable based on teacher preferences</p>
      </div>

      <div className="generate-card">
        <div className="info-section">
          <h2>📝 How it works</h2>
          <ul className="info-list">
            <li>The system will analyze all teacher preferences</li>
            <li>It will assign subjects to time slots based on priorities</li>
            <li>Rooms will be allocated for each class</li>
            <li>Conflicts will be automatically resolved</li>
            <li>The new timetable will replace the current active one</li>
          </ul>
        </div>

        <div className="action-section">
          <button 
            onClick={handleGenerate} 
            className="btn-generate"
            disabled={loading}
          >
            {loading ? '⏳ Generating...' : '✨ Generate New Timetable'}
          </button>
        </div>

        {result && (
          <div className={`result-section ${result.success ? 'success' : 'error'}`}>
            <h3>{result.success ? '✅ Success!' : '❌ Error'}</h3>
            <p>{result.message}</p>
            
            {result.conflicts && result.conflicts.length > 0 && (
              <div className="conflicts">
                <h4>⚠️ Conflicts Detected:</h4>
                <ul>
                  {result.conflicts.map((conflict, index) => (
                    <li key={index}>{conflict}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.stats && (
              <div className="stats">
                <h4>📊 Statistics:</h4>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">Total Classes:</span>
                    <span className="stat-value">{result.stats.total_classes}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Teachers:</span>
                    <span className="stat-value">{result.stats.teachers}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Subjects:</span>
                    <span className="stat-value">{result.stats.subjects}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Rooms Used:</span>
                    <span className="stat-value">{result.stats.rooms_used}</span>
                  </div>
                </div>
              </div>
            )}

            {result.success && (
              <div className="success-actions">
                <p className="success-message">
                  The new timetable is now active and visible on the homepage!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateTimetable;
