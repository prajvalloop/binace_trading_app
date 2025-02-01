from django.db import models
import uuid
from django.contrib.auth.hashers import make_password

# User Model
class User(models.Model):
    name=models.TextField(blank=True, null=True)
    email = models.EmailField(unique=True)
    bio = models.TextField(blank=True, null=True)
    phone = models.CharField(max_length=15, blank=True, null=True)
    profile_image = models.URLField(blank=True, null=True)
    email_token = models.CharField(max_length=255, blank=True, null=True)
    is_validUser = models.BooleanField(default=False)
    isGoogle = models.BooleanField(default=False)
    password = models.CharField(max_length=255,null=True)  # Add password field

    def set_password(self, password):
        self.password = make_password(password)

    def check_password(self, password):
        from django.contrib.auth.hashers import check_password
        return check_password(password, self.password)