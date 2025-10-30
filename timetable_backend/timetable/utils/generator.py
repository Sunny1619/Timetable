from django.db import transaction
from timetable.models import TeacherPreference, Room, TimeSlot, ActiveTimetable

def is_time_conflict(slot1, slot2):
    """Check if two time slots overlap on the same day."""
    return (
        slot1.day_of_week == slot2.day_of_week and
        slot1.start_time < slot2.end_time and
        slot2.start_time < slot1.end_time
    )

def generate_timetable():
    preferences = TeacherPreference.objects.select_related('teacher', 'subject', 'time_slot').order_by('preference_number')
    rooms = list(Room.objects.all())
    all_slots = list(TimeSlot.objects.all())

    if not preferences.exists() or not rooms:
        return {"success": False, "timetable": [], "deadlocks": ["No preferences or rooms available."]}

    teacher_schedule = {}
    room_schedule = {}
    assignments = []
    deadlocks = []

    for pref in preferences:
        teacher = pref.teacher
        pref_slot = pref.time_slot
        assigned = False

        teacher_busy_slots = teacher_schedule.get(teacher.id, [])

        # 🧠 Step 1: Try same-day assignment first
        for room in rooms:
            room_busy_slots = room_schedule.get(room.id, [])
            teacher_conflict = any(is_time_conflict(pref_slot, ts) for ts in teacher_busy_slots)
            room_conflict = any(is_time_conflict(pref_slot, ts) for ts in room_busy_slots)

            if not teacher_conflict and not room_conflict:
                assignments.append(
                    ActiveTimetable(
                        teacher=teacher,
                        subject=pref.subject,
                        semester=pref.semester,
                        time_slot=pref_slot,
                        room=room,
                        short_form=teacher.short_form or teacher.username
                    )
                )
                teacher_schedule.setdefault(teacher.id, []).append(pref_slot)
                room_schedule.setdefault(room.id, []).append(pref_slot)
                assigned = True
                break

        # 🧠 Step 2: If same-day failed, try other days with same timing
        if not assigned:
            for alt_slot in all_slots:
                if (
                    alt_slot.start_time == pref_slot.start_time and
                    alt_slot.end_time == pref_slot.end_time and
                    alt_slot.day_of_week != pref_slot.day_of_week
                ):
                    for room in rooms:
                        teacher_conflict = any(is_time_conflict(alt_slot, ts) for ts in teacher_busy_slots)
                        room_conflict = any(is_time_conflict(alt_slot, ts) for ts in room_schedule.get(room.id, []))

                        if not teacher_conflict and not room_conflict:
                            assignments.append(
                                ActiveTimetable(
                                    teacher=teacher,
                                    subject=pref.subject,
                                    semester=pref.semester,
                                    time_slot=alt_slot,
                                    room=room,
                                    short_form=teacher.short_form or teacher.username
                                )
                            )
                            teacher_schedule.setdefault(teacher.id, []).append(alt_slot)
                            room_schedule.setdefault(room.id, []).append(alt_slot)
                            assigned = True
                            break
                    if assigned:
                        break

        # ❌ Step 3: Mark as deadlock if all failed
        if not assigned:
            deadlocks.append({
                "teacher": teacher.username,
                "subject": pref.subject.subject_code,
                "preferred_day": pref_slot.day_of_week,
                "start_time": pref_slot.start_time.strftime("%H:%M"),
                "end_time": pref_slot.end_time.strftime("%H:%M"),
                "reason": "No available room or time slot on any day"
            })

    # 🧱 Step 4: Save results
    if not assignments:
        return {"success": False, "timetable": [], "deadlocks": deadlocks}

    with transaction.atomic():
        ActiveTimetable.objects.all().delete()
        ActiveTimetable.objects.bulk_create(assignments)

    result = [
        {
            "teacher": a.teacher.username,
            "subject": a.subject.subject_code,
            "room": a.room.room_number,
            "day": a.time_slot.day_of_week,
            "start_time": a.time_slot.start_time.strftime("%H:%M"),
            "end_time": a.time_slot.end_time.strftime("%H:%M"),
        }
        for a in assignments
    ]

    return {"success": True, "timetable": result, "deadlocks": deadlocks}
