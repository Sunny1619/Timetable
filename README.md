# Routine Management System

Lightweight full‑stack app to collect teacher timeslot preferences, auto‑generate a conflict‑free timetable, and publish it publicly.

- Backend: Django REST + JWT (MySQL)
- Frontend: React + Vite + Axios

## Quick start

### Prerequisites
- Python 3.10+ with `venv`
- Node.js 18+ and npm
- MySQL Server running locally with a database you can access

### 1) Backend setup
```zsh
cd timetable_backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Configure MySQL in `timetable_project/settings.py` (defaults shown in repo):
```python
DATABASES = {
  'default': {
    'ENGINE': 'django.db.backends.mysql',
    'NAME': 'timetable_db',
    'USER': 'root',
    'PASSWORD': '97082',  # change to your local password
    'HOST': 'localhost',
    'PORT': '3306',
  }
}
```
Create the database in MySQL if it doesn’t exist, then migrate and create an admin:
```zsh
python manage.py migrate
python manage.py createsuperuser
```
Set the created user's role to admin (required by API permissions):
```zsh
python manage.py shell <<'PY'
from timetable.models import User
u = User.objects.get(username=input('Admin username: '))
u.role = 'admin'
u.is_staff = True
u.save()
print('Updated role=is_admin and is_staff=True')
PY
```
Run the server:
```zsh
python manage.py runserver
```
Our API is at http://127.0.0.1:8000/api/

Useful endpoints:
- `POST /api/auth/login/` → JWT tokens
- `GET /api/public/timetable/` → public timetable
- `GET/POST /api/teacher/preferences/` (teacher)
- `POST /api/admin/create_teacher/` (admin)
- `POST /api/admin/generate_timetable/` (admin)

### 2) Frontend setup
```zsh
cd ../timetable_frontend
npm install
npm run dev
```
App runs at the printed Vite URL (typically http://127.0.0.1:5173/). The API base URL is hard‑coded to `http://127.0.0.1:8000/api/` in `src/api/axiosConfig.js`.

## Project layout
- `timetable_backend/` — Django REST API (custom user model, pref CRUD, timetable generator)
- `timetable_frontend/` — React SPA (public timetable, teacher/admin dashboards)

## Roles and login
- Admin: create teachers and run the generator. Must have `User.role='admin'` and `is_staff=True`.
- Teacher: sign in and submit preferences.
