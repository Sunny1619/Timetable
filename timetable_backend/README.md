# Backend for Routine Management System

Django REST API that manages academic timetable data, teacher preferences, and generates a conflict‑free active timetable. Uses JWT for auth and exposes a public endpoint for viewing the current timetable.

- Frameworks: Django 5.2, Django REST Framework, SimpleJWT, CORS Headers
- Database: MySQL (configured in `settings.py`), using custom user model
- App layout: `timetable_backend/`


### Setup (PowerShell)

Open PowerShell:
- python - m venv venv  
- venv\Scripts\activate  
- pip install -r requirements.txt  
- python manage.py migrate  
- python manage.py createsuperuser  
- python manage.py shell  
- from timetable.models import User  
- admin = User.objects.get(username='your_admin_username')  
- admin.role = 'admin'  
- admin.save()  
- python manage.py runserver  


## Project structure and roles

- `manage.py` — Standard Django management entry.
- `timetable_project/`
  - `settings.py` — Core config: custom user model, MySQL DB, REST framework (JWT auth, IsAuthenticated default), CORS enabled.
  - `urls.py` — Site URLs: Django admin, app router at `/api/`, JWT endpoints at `/api/auth/login/` and `/api/auth/refresh/`.
  - `asgi.py`, `wsgi.py` — Deployment adapters.
- `timetable/` (main app)
  - `models.py` — Database schema (see details below).
  - `serializers.py` — DRF serializers; notably `ActiveTimetableSerializer` flattens related fields for client consumption.
  - `views.py` — CRUD viewsets for Subjects, Rooms, TimeSlots; teacher preferences endpoint; admin actions for teacher creation, generation, and fetching active timetable; `public_timetable` read‑only endpoint.
  - `permissions.py` — Simple role‑based permissions `IsAdmin` and `IsTeacher` using the custom `User.role` field.
  - `urls.py` — DRF router exposing endpoints under `/api/` and `public/timetable/`.
  - `utils/generator.py` — Greedy timetable generation algorithm that avoids teacher/room slot conflicts and attempts alternative days.
  - `migrations/0001_initial.py` — Initial schema.
  - `admin.py` — Empty (models not registered in Django admin UI yet).
  - `tests.py` — Placeholder.

## Authentication and permissions
- Auth: JWT (SimpleJWT). Obtain with `POST /api/auth/login/` → `{access, refresh}`.
- Default permission: `IsAuthenticated` globally; specific endpoints relax or restrict:
  - `public_timetable` → `AllowAny` (no auth).
  - `TeacherPreferenceViewSet` → `IsTeacher | IsAdmin` (teachers see/edit own; admins see grouped view via `list`).
  - `SubjectViewSet`, `RoomViewSet`, `TimeSlotViewSet` → `IsTeacher | IsAdmin`.
  - `AdminViewSet` → `IsAdmin` (requires `User.role == 'admin'`).

Admin note: `TeacherPreferenceViewSet.list` treats `user.is_staff` as admin for grouping behavior. Ensure admin accounts have both `role='admin'` and `is_staff=True` for consistent behavior across endpoints.

## API surface
All paths below are prefixed by `/api/`.

- Auth
  - `POST auth/login/` → JWT access/refresh pair.
  - `POST auth/refresh/` → obtain new access token.

- Public
  - `GET public/timetable/` → returns current active timetable rows in a flattened shape.

- Teacher preferences
  - `GET teacher/preferences/` →
    - If teacher: list own preferences (raw serializer fields).
    - If admin: grouped summary per teacher (custom aggregation shape).
  - `POST teacher/preferences/` → create preference; `teacher` set automatically to `request.user`.
  - `PUT/PATCH/DELETE teacher/preferences/:id/` → modify/delete owned preference (teacher), or any (admin).

- Catalogs
  - `GET/POST/PUT/PATCH/DELETE subjects/` → Subject CRUD.
  - `GET/POST/PUT/PATCH/DELETE rooms/` → Room CRUD.
  - `GET/POST/PUT/PATCH/DELETE time-slots/` → TimeSlot CRUD.

- Admin
  - `POST admin/create_teacher/` → create a new teacher `{username, password, short_form?}`.
  - `POST admin/generate_timetable/` → compute and persist active timetable; returns `{ success, timetable, deadlocks }`.
  - `GET admin/timetable/` → list persisted `ActiveTimetable` in a flattened serializer format.

## Database schema

Custom user model is configured via `AUTH_USER_MODEL = 'timetable.User'`.

### `timetable_user` (class `User` extends `AbstractUser`)
- `id` (bigint, PK)
- Inherited auth fields: `username` (unique), `password`, `email`, `first_name`, `last_name`, `is_staff`, `is_active`, `is_superuser`, `last_login`, `date_joined`, groups/permissions M2M.
- `role` (varchar(10), choices: `admin` | `teacher`, required)
- `short_form` (varchar(10), nullable)

### `timetable_subject` (class `Subject`)
- `id` (bigint, PK)
- `subject_code` (varchar(10), unique)
- `subject_name` (varchar(100))

### `timetable_room` (class `Room`)
- `id` (bigint, PK)
- `room_number` (varchar(20), unique)
- `capacity` (positive int, nullable)

### `timetable_timeslot` (class `TimeSlot`)
- `id` (bigint, PK)
- `day_of_week` (enum-like varchar(10): Monday–Saturday)
- `start_time` (time)
- `end_time` (time)
- Unique constraint: (`day_of_week`, `start_time`, `end_time`)

### `timetable_teacherpreference` (class `TeacherPreference`)
- `id` (bigint, PK)
- `teacher_id` → FK to `timetable_user` (restricted to users where `role='teacher'`)
- `subject_id` → FK to `timetable_subject`
- `semester` (int)
- `time_slot_id` → FK to `timetable_timeslot`
- `preference_number` (int)
- Unique constraint: (`teacher_id`, `subject_id`, `time_slot_id`)

### `timetable_activetimetable` (class `ActiveTimetable`)
- `id` (bigint, PK)
- `teacher_id` → FK to `timetable_user`
- `subject_id` → FK to `timetable_subject`
- `semester` (int)
- `time_slot_id` → FK to `timetable_timeslot`
- `room_id` → FK to `timetable_room`
- `short_form` (varchar(10)) — usually from `User.short_form`

Relationships:
- A `TeacherPreference` connects a Teacher + Subject + TimeSlot + Semester with a priority (`preference_number`).
- `ActiveTimetable` stores generated assignments: Teacher + Subject + TimeSlot + Room (+ Semester/short_form).

## Serializers
- `UserSerializer` → id, username, email, role, short_form.
- `SubjectSerializer`, `RoomSerializer`, `TimeSlotSerializer` → all fields.
- `TeacherPreferenceSerializer` → all fields, `teacher` is read‑only (inferred from request).
- `ActiveTimetableSerializer` → flattens relations into:
  - `teacher` (username)
  - `subject_code`, `subject_name`
  - `room_number`
  - `day`, `start_time`, `end_time`
  - plus `semester`, `short_form`

## Views and business rules

### `TeacherPreferenceViewSet`
- Permissions: `IsTeacher | IsAdmin`.
- `get_queryset()`:
  - If admin (`user.is_staff`), returns all; else returns only current user's preferences.
- `list()` override:
  - If teacher: regular serialized list.
  - If admin: groups preferences by teacher username into an array: `{ teacher, preferences: [...] }` with human‑readable strings for subject/time_slot.
- `perform_create()`:
  - Sets `teacher` on the serializer to `request.user` (prevents spoofing).

### `AdminViewSet`
- Permissions: `IsAdmin` (`request.user.role == 'admin'`).
- Actions:
  - `POST create_teacher` → creates a user with role `teacher` (and optional `short_form`).
  - `POST generate_timetable` → runs generator; returns 200 on success, 400 on failure.
  - `GET timetable` → returns persisted `ActiveTimetable` with flattened serializer.

### Catalog ViewSets
- `SubjectViewSet`, `RoomViewSet`, `TimeSlotViewSet` — Full CRUD guarded by `IsTeacher | IsAdmin`.

### Public endpoint
- `public_timetable` (`GET public/timetable/`, `AllowAny`) returns:
  ```json
  {
    "success": true,
    "count": <int>,
    "timetable": [
      {
        "teacher": "...",
        "subject_code": "...",
        "subject_name": "...",
        "semester": 1,
        "room_number": "...",
        "day": "Monday",
        "start_time": "09:00",
        "end_time": "10:00",
        "short_form": "..."
      }
    ]
  }
  ```

## Timetable generation algorithm (`utils/generator.py`)
- Inputs: all `TeacherPreference` rows ordered by `preference_number` (ascending), all `Room`s, all `TimeSlot`s.
- Strategy:
  1. Try to assign each preference to the exact preferred `TimeSlot` in any free `Room` without conflicts.
     - Conflict defined if teacher or room has an overlapping slot on the same day.
  2. If not possible, attempt alternate days with the same start/end times.
  3. If still not possible, record a deadlock item including teacher, subject, preferred slot, and reason.
  4. If at least one assignment exists, replace all existing `ActiveTimetable` rows with new assignments in a transaction; else return failure with deadlocks.
- Output example:
  ```json
  {
    "success": true,
    "timetable": [
      {"teacher":"t1","subject":"CS101","room":"R1","day":"Monday","start_time":"09:00","end_time":"10:00"}
    ],
    "deadlocks": []
  }
  ```

## Configuration and environment
- DB: MySQL configuration in `settings.py` under `DATABASES['default']`. Update `NAME`, `USER`, `PASSWORD`, `HOST`, `PORT` as appropriate.
- CORS: `CORS_ALLOW_ALL_ORIGINS = True` for development.
- Auth model: `AUTH_USER_MODEL = 'timetable.User'`.
