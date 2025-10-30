from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, Subject, Room, TimeSlot, TeacherPreference, ActiveTimetable


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Add custom claims
        token['username'] = user.username
        token['role'] = user.role
        token['short_form'] = user.short_form
        
        return token


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'short_form']


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = '__all__'


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = '__all__'


class TimeSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeSlot
        fields = '__all__'


class TeacherPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeacherPreference
        fields = '__all__'
        read_only_fields = ['teacher']


class ActiveTimetableSerializer(serializers.ModelSerializer):
    teacher = serializers.SerializerMethodField()
    subject_code = serializers.SerializerMethodField()
    subject_name = serializers.SerializerMethodField()
    room_number = serializers.SerializerMethodField()
    day = serializers.SerializerMethodField()
    start_time = serializers.SerializerMethodField()
    end_time = serializers.SerializerMethodField()

    class Meta:
        model = ActiveTimetable
        fields = [
            "id", "teacher", "subject_code", "subject_name", "semester",
            "room_number", "day", "start_time", "end_time", "short_form"
        ]

    def get_teacher(self, obj):
        return obj.teacher.username

    def get_subject_code(self, obj):
        return obj.subject.subject_code

    def get_subject_name(self, obj):
        return obj.subject.subject_name

    def get_room_number(self, obj):
        return obj.room.room_number

    def get_day(self, obj):
        return obj.time_slot.day_of_week

    def get_start_time(self, obj):
        return obj.time_slot.start_time.strftime("%H:%M")

    def get_end_time(self, obj):
        return obj.time_slot.end_time.strftime("%H:%M")
