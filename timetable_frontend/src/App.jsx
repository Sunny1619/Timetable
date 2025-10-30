import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import ManageTeachers from './pages/admin/ManageTeachers';
import ManageSubjects from './pages/admin/ManageSubjects';
import ManageTimeSlots from './pages/admin/ManageTimeSlots';
import ManageRooms from './pages/admin/ManageRooms';
import ViewPreferences from './pages/admin/ViewPreferences';
import GenerateTimetable from './pages/admin/GenerateTimetable';
import TeacherPreferences from './pages/teacher/TeacherPreferences';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              
              {/* Admin Routes */}
              <Route 
                path="/admin/teachers" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ManageTeachers />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/subjects" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ManageSubjects />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/timeslots" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ManageTimeSlots />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/rooms" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ManageRooms />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/preferences" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ViewPreferences />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/generate" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <GenerateTimetable />
                  </ProtectedRoute>
                } 
              />
              
              {/* Teacher Routes */}
              <Route 
                path="/teacher/preferences" 
                element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <TeacherPreferences />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
