from django.contrib import admin
from app.models import User
class UserModelAdmin(admin.ModelAdmin):
    list_display=['id','email','bio','phone','profile_image','email_token','is_validUser','isGoogle','password']
# Register your models here.
admin.site.register(User,UserModelAdmin)