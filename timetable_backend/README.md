Open PowerShell:  
1.python -m venv venv  
2.venv\Scripts\activate  
3.pip install -r requirements.txt  
4.python manage.py migrate  
5.python manage.py createsuperuser  
6.python manage.py shell  
7.from timetable.models import User  
8.admin = User.objects.get(username='your_admin_username')  
9.admin.role = 'admin'  
10.admin.save()  
11.python manage.py runserver  
