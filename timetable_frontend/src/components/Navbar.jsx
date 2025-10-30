import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Debug: Log user object
  console.log('Current user:', user);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          📅 Timetable System
        </Link>
        
        <ul className="navbar-menu">
          <li className="navbar-item">
            <Link to="/" className="navbar-link">Home</Link>
          </li>
          
          {user && user.role === 'admin' && (
            <>
              <li className="navbar-item">
                <Link to="/admin/teachers" className="navbar-link">Manage Teachers</Link>
              </li>
              <li className="navbar-item">
                <Link to="/admin/subjects" className="navbar-link">Manage Subjects</Link>
              </li>
              <li className="navbar-item">
                <Link to="/admin/timeslots" className="navbar-link">Manage Time Slots</Link>
              </li>
              <li className="navbar-item">
                <Link to="/admin/rooms" className="navbar-link">Manage Rooms</Link>
              </li>
              <li className="navbar-item">
                <Link to="/admin/preferences" className="navbar-link">View Preferences</Link>
              </li>
              <li className="navbar-item">
                <Link to="/admin/generate" className="navbar-link">Generate Timetable</Link>
              </li>
            </>
          )}
          
          {user && user.role === 'teacher' && (
            <li className="navbar-item">
              <Link to="/teacher/preferences" className="navbar-link">My Preferences</Link>
            </li>
          )}
        </ul>

        <div className="navbar-auth">
          {user ? (
            <div className="user-info">
              <span className="user-role">{user.role}</span>
              <span className="user-name">{user.username}</span>
              <button onClick={handleLogout} className="btn-logout">Logout</button>
            </div>
          ) : (
            <Link to="/login" className="btn-login">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
