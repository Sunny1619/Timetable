import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth APIs
export const login = async (username, password) => {
  const response = await axios.post(`${API_BASE_URL}/auth/login/`, { username, password });
  return response.data;
};

export const refreshToken = async (refresh) => {
  const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, { refresh });
  return response.data;
};

// Public APIs
export const getPublicTimetable = async () => {
  const response = await axios.get(`${API_BASE_URL}/public/timetable/`);
  return response.data;
};

// Admin APIs
export const createTeacher = async (teacherData) => {
  const response = await api.post('/admin/create_teacher/', teacherData);
  return response.data;
};

export const generateTimetable = async () => {
  const response = await api.post('/admin/generate_timetable/');
  return response.data;
};

export const getAdminTimetable = async () => {
  const response = await api.get('/admin/timetable/');
  return response.data;
};

// Teacher Preference APIs
export const getPreferences = async () => {
  const response = await api.get('/teacher/preferences/');
  return response.data;
};

export const createPreference = async (preferenceData) => {
  const response = await api.post('/teacher/preferences/', preferenceData);
  return response.data;
};

export const updatePreference = async (id, preferenceData) => {
  const response = await api.put(`/teacher/preferences/${id}/`, preferenceData);
  return response.data;
};

export const deletePreference = async (id) => {
  const response = await api.delete(`/teacher/preferences/${id}/`);
  return response.data;
};

// Subject APIs
export const getSubjects = async () => {
  const response = await api.get('/subjects/');
  return response.data;
};

// Room APIs
export const getRooms = async () => {
  const response = await api.get('/rooms/');
  return response.data;
};

// TimeSlot APIs
export const getTimeSlots = async () => {
  const response = await api.get('/time-slots/');
  return response.data;
};

export default api;
