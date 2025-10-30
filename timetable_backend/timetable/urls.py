from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TeacherPreferenceViewSet, AdminViewSet
from .views import public_timetable
from .views import (
    TeacherPreferenceViewSet,
    AdminViewSet,
    SubjectViewSet,
    RoomViewSet,
    TimeSlotViewSet,
)

router = DefaultRouter()
router.register(r'teacher/preferences', TeacherPreferenceViewSet, basename='teacher-preferences')
router.register(r'admin', AdminViewSet, basename='admin')
router.register(r'subjects', SubjectViewSet, basename='subjects')
router.register(r'rooms', RoomViewSet, basename='rooms')
router.register(r'time-slots', TimeSlotViewSet, basename='time-slots')

urlpatterns = [
    path('', include(router.urls)),
    path('public/timetable/', public_timetable, name='public-timetable'),
]
