from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import Subject, Room, TimeSlot, TeacherPreference, ActiveTimetable, User
from .serializers import *
from .permissions import IsAdmin, IsTeacher
from .utils.generator import generate_timetable
from rest_framework.permissions import AllowAny
from .serializers import ActiveTimetableSerializer, CustomTokenObtainPairSerializer
from collections import defaultdict


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class TeacherPreferenceViewSet(viewsets.ModelViewSet):
    serializer_class = TeacherPreferenceSerializer
    permission_classes = [IsTeacher | IsAdmin]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:  # Admin
            return TeacherPreference.objects.select_related("teacher", "subject", "time_slot").all()
        return TeacherPreference.objects.filter(teacher=user)

    def list(self, request, *args, **kwargs):
        user = request.user

        # If teacher -> return only their preferences normally
        if not user.is_staff:
            queryset = self.get_queryset()
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)

        # If admin -> return grouped by teacher
        queryset = self.get_queryset()
        grouped = defaultdict(list)
        for pref in queryset:
            grouped[pref.teacher.username].append({
                "id": pref.id,
                "subject": f"{pref.subject.subject_code} - {pref.subject.subject_name}",
                "semester": pref.semester,
                "time_slot": f"{pref.time_slot.day_of_week} {pref.time_slot.start_time.strftime('%H:%M')}–{pref.time_slot.end_time.strftime('%H:%M')}",
                "preference_number": pref.preference_number,
            })

        grouped_data = [
            {"teacher": teacher, "preferences": prefs}
            for teacher, prefs in grouped.items()
        ]

        return Response(grouped_data)

    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)


class AdminViewSet(viewsets.ViewSet):
    permission_classes = [IsAdmin]

    @action(detail=False, methods=['post'])
    def create_teacher(self, request):
        data = request.data
        user = User.objects.create_user(
            username=data['username'],
            password=data['password'],
            role='teacher',
            short_form=data.get('short_form')
        )
        return Response(UserSerializer(user).data)

    @action(detail=False, methods=['post'])
    def generate_timetable(self, request):
        result = generate_timetable()
        status_code = status.HTTP_200_OK if result["success"] else status.HTTP_400_BAD_REQUEST
        return Response(result, status=status_code)

    @action(detail=False, methods=['get'])
    def timetable(self, request):
        timetable = ActiveTimetable.objects.all()
        serializer = ActiveTimetableSerializer(timetable, many=True)
        return Response(serializer.data)

# Subject CRUD
# ----------------------------
class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [IsAdmin | IsTeacher]


# ----------------------------
# Room CRUD
# ----------------------------
class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = [IsAdmin | IsTeacher]


# ----------------------------
# TimeSlot CRUD
# ----------------------------
class TimeSlotViewSet(viewsets.ModelViewSet):
    queryset = TimeSlot.objects.all()
    serializer_class = TimeSlotSerializer
    permission_classes = [IsAdmin | IsTeacher]


@api_view(['GET'])
@permission_classes([AllowAny])  # 🚀 Anyone can access
def public_timetable(request):
    """Public endpoint to fetch the current active timetable."""
    timetable = ActiveTimetable.objects.select_related(
        'teacher', 'subject', 'room', 'time_slot'
    ).all()

    serializer = ActiveTimetableSerializer(timetable, many=True)
    return Response({
        "success": True,
        "count": len(serializer.data),
        "timetable": serializer.data
    })