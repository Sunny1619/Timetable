import { useState, useEffect } from 'react';
import { getPublicTimetable } from '../services/api';
import './Home.css';

const Home = () => {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const data = await getPublicTimetable();
      setTimetable(data.timetable || []);
      setError('');
    } catch (err) {
      setError('Failed to load timetable');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = [...new Set(timetable.map(item => `${item.start_time}-${item.end_time}`))].sort();

  const getTimetableCell = (day, timeSlot) => {
    const [startTime, endTime] = timeSlot.split('-');
    return timetable.filter(
      item => item.day === day && item.start_time === startTime && item.end_time === endTime
    );
  };

  if (loading) {
    return (
      <div className="home-container">
        <div className="loading">Loading timetable...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>📚 Current Active Timetable</h1>
        <p>View the current semester timetable schedule</p>
      </div>

      {timetable.length === 0 ? (
        <div className="no-data">
          <h3>No Timetable Available</h3>
          <p>The timetable has not been generated yet. Please check back later.</p>
        </div>
      ) : (
        <div className="timetable-wrapper">
          <table className="timetable">
            <thead>
              <tr>
                <th className="time-column">Time</th>
                {days.map(day => (
                  <th key={day}>{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map(timeSlot => (
                <tr key={timeSlot}>
                  <td className="time-cell">{timeSlot}</td>
                  {days.map(day => {
                    const classes = getTimetableCell(day, timeSlot);
                    return (
                      <td key={`${day}-${timeSlot}`} className="schedule-cell">
                        {classes.map((cls, idx) => (
                          <div key={idx} className="class-card">
                            <div className="subject-code">{cls.subject_code}</div>
                            <div className="subject-name">{cls.subject_name}</div>
                            <div className="class-details">
                              <span className="teacher">👨‍🏫 {cls.short_form}</span>
                              <span className="room">🏛️ {cls.room_number}</span>
                              <span className="semester">Sem {cls.semester}</span>
                            </div>
                          </div>
                        ))}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Home;
