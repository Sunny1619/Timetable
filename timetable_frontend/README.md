# Timetable Management System - Frontend

A beautiful and functional React-based frontend for the Timetable Management System.

## Features

### 🏠 Home Page
- Displays the current active timetable
- Beautiful grid layout showing all classes organized by day and time
- Color-coded cards for easy reading
- Publicly accessible (no login required)

### 👤 User Roles

#### Admin Features
1. **Manage Teachers** (`/admin/teachers`)
   - Add new teachers to the system
   - Set username, password, and short form identifier
   
2. **View Preferences** (`/admin/preferences`)
   - View all teacher preferences grouped by teacher
   - See preference priorities and details
   
3. **Generate Timetable** (`/admin/generate`)
   - Generate new timetable based on teacher preferences
   - View statistics and conflicts
   - Automatically replaces the current active timetable

#### Teacher Features
1. **My Preferences** (`/teacher/preferences`)
   - View all personal preferences
   - Add new preferences (subject, semester, time slot, priority)
   - Edit existing preferences
   - Delete preferences

## Setup and Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Backend server running on `http://localhost:8000`

### Installation

1. Navigate to the frontend directory:
```bash
cd timetable_frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:5173
```

## Project Structure

```
timetable_frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx            # Navigation bar component
│   │   ├── Navbar.css
│   │   └── ProtectedRoute.jsx    # Route protection wrapper
│   ├── context/
│   │   └── AuthContext.jsx       # Authentication context
│   ├── pages/
│   │   ├── Home.jsx              # Public timetable view
│   │   ├── Home.css
│   │   ├── Login.jsx             # Login page
│   │   ├── Login.css
│   │   ├── admin/
│   │   │   ├── ManageTeachers.jsx
│   │   │   ├── ManageTeachers.css
│   │   │   ├── ViewPreferences.jsx
│   │   │   ├── ViewPreferences.css
│   │   │   ├── GenerateTimetable.jsx
│   │   │   └── GenerateTimetable.css
│   │   └── teacher/
│   │       ├── TeacherPreferences.jsx
│   │       └── TeacherPreferences.css
│   ├── services/
│   │   └── api.js                # API service layer
│   ├── App.jsx                   # Main app component
│   ├── App.css
│   ├── main.jsx                  # Entry point
│   └── index.css                 # Global styles
├── package.json
└── vite.config.js
```

## API Integration

The frontend connects to the Django backend at `http://localhost:8000/api/`.

### Endpoints Used:
- `POST /api/auth/login/` - User login
- `GET /api/public/timetable/` - Get active timetable (public)
- `POST /api/admin/create_teacher/` - Create new teacher (admin)
- `POST /api/admin/generate_timetable/` - Generate timetable (admin)
- `GET /api/admin/timetable/` - Get timetable (admin)
- `GET /api/teacher/preferences/` - Get preferences
- `POST /api/teacher/preferences/` - Create preference
- `PUT /api/teacher/preferences/:id/` - Update preference
- `DELETE /api/teacher/preferences/:id/` - Delete preference
- `GET /api/subjects/` - Get all subjects
- `GET /api/time-slots/` - Get all time slots

## Default Credentials

Make sure you have created users in the backend before trying to login.

### Creating Admin User (Backend):
```bash
python manage.py createsuperuser
```

### Creating Teacher User (Backend):
Can be done through the admin interface at `/admin/teachers` after logging in as admin.

## Design Features

- **Modern UI**: Clean, professional design with gradient backgrounds
- **Responsive**: Works on desktop, tablet, and mobile devices
- **Color-coded**: Different elements use consistent color coding
- **Interactive**: Hover effects and smooth transitions
- **User-friendly**: Clear navigation and intuitive interfaces

## Technologies Used

- **React 19.1** - UI library
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API calls
- **Vite** - Build tool and dev server
- **CSS3** - Styling with modern features (gradients, flexbox, grid)

## Color Scheme

- Primary: `#667eea` (Purple-blue)
- Secondary: `#764ba2` (Purple)
- Success: `#28a745` (Green)
- Error: `#e74c3c` (Red)
- Background: Linear gradient from `#f5f7fa` to `#c3cfe2`

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Troubleshooting

### Cannot connect to backend
- Make sure the Django backend is running on `http://localhost:8000`
- Check CORS settings in the backend

### Login not working
- Verify credentials
- Check browser console for errors
- Ensure JWT tokens are being set correctly

### Timetable not showing
- Ensure timetable has been generated by admin
- Check if backend API is accessible

