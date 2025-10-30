from django.db import models
from django.contrib.auth.models import AbstractUser

# ----------------------------
# Custom User Model
# ----------------------------
class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('teacher', 'Teacher'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    short_form = models.CharField(max_length=10, null=True, blank=True)

    def __str__(self):
        return f"{self.username} ({self.role})"


# ----------------------------
# Subject
# ----------------------------
class Subject(models.Model):
    subject_code = models.CharField(max_length=10, unique=True)
    subject_name = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.subject_code} - {self.subject_name}"


# ----------------------------
# Room
# ----------------------------
class Room(models.Model):
    room_number = models.CharField(max_length=20, unique=True)
    capacity = models.PositiveIntegerField(null=True, blank=True)

    def __str__(self):
        return self.room_number


# ----------------------------
# TimeSlot
# ----------------------------
class TimeSlot(models.Model):
    DAYS = [
        ('Monday', 'Monday'),
        ('Tuesday', 'Tuesday'),
        ('Wednesday', 'Wednesday'),
        ('Thursday', 'Thursday'),
        ('Friday', 'Friday'),
        ('Saturday', 'Saturday'),
    ]
    day_of_week = models.CharField(max_length=10, choices=DAYS)
    start_time = models.TimeField()
    end_time = models.TimeField()

    class Meta:
        unique_together = ('day_of_week', 'start_time', 'end_time')

    def __str__(self):
        return f"{self.day_of_week} {self.start_time.strftime('%H:%M')}–{self.end_time.strftime('%H:%M')}"


# ----------------------------
# Teacher Preferences
# ----------------------------
class TeacherPreference(models.Model):
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'teacher'})
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    semester = models.IntegerField()
    time_slot = models.ForeignKey(TimeSlot, on_delete=models.CASCADE)
    preference_number = models.IntegerField()

    class Meta:
        unique_together = ('teacher', 'subject', 'time_slot')

    def __str__(self):
        return f"{self.teacher.short_form} - {self.subject.subject_code} ({self.time_slot})"


# ----------------------------
# Active Timetable
# ----------------------------
class ActiveTimetable(models.Model):
    teacher = models.ForeignKey(User, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    semester = models.IntegerField()
    time_slot = models.ForeignKey(TimeSlot, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    short_form = models.CharField(max_length=10)

    def __str__(self):
        return f"{self.short_form} - {self.subject.subject_code} ({self.time_slot})"

