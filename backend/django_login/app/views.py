from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.utils import timezone
from .models import User
from datetime import timedelta
import uuid
import boto3
import mimetypes
from django.conf import settings
import jwt
from datetime import datetime, timedelta
import os

# AWS S3 Configuration
def initialize_s3():
    s3=boto3.resource(
    service_name=settings.SERVICE_NAME,
    region_name=settings.REGION_NAME,
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
    )
    return s3
 
#JWT 
def create_jwt_token(user):
    """
    Create a JWT token for the user
    """
    payload = {
        'user_id': user.id,
        'email': user.email,
        'exp': datetime.utcnow() + timedelta(hours=10),  # Set expiration for 1 hour
        'iat': datetime.utcnow(),  # Issue time
    }

    access_token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')

    # Refresh token (longer expiry, e.g., 7 days)
    refresh_payload = {
        'user_id': user.id,
        'exp': datetime.utcnow() + timedelta(days=7),  # Set expiration for 7 days
        'iat': datetime.utcnow(),
    }
    refresh_token = jwt.encode(refresh_payload, settings.SECRET_KEY, algorithm='HS256')

    return access_token, refresh_token

# Register User
@api_view(['POST'])
def register(request):
    email = request.data.get('email')
    password = request.data.get('password')
    
    if User.objects.filter(email=email).exists():
        return JsonResponse({'error': 'User with this email already exists'}, status=400)
    
    user = User.objects.create(email=email)
    user.set_password(password)
    user.email_token = str(uuid.uuid4())
    user.save()
    
    return JsonResponse({'message': 'User registered successfully'}, status=201)

# Verify Email
@api_view(['GET'])
def verifyEmail(request, token):
    try:
        user = User.objects.get(email_token=token)
        if timezone.now() > user.date_joined + timedelta(hours=3):
            return JsonResponse({'error': 'Verification token expired'}, status=400)
        user.is_validUser = True
        user.email_token = ''
        user.save()
        return JsonResponse({'message': 'Email verified successfully'}, status=200)
    except User.DoesNotExist:
        return JsonResponse({'error': 'Invalid token'}, status=400)

# User Login
@api_view(['POST'])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')
    print(email,password)
    user = User.objects.get(email=email)
    passwordValidate=User.check_password(user,password)
    print(user ,"   ",passwordValidate)
    
    if user and passwordValidate and not user.isGoogle:
        access_token, refresh_token = create_jwt_token(user)
        return JsonResponse({
            'refresh_token': refresh_token,
            'access_token': access_token,
        })
        
    return JsonResponse({'error': 'Invalid credentials'}, status=401)

# Google Sign-In
@api_view(['POST'])
def google_signIn(request):
    email = request.data.get('email')
    user, created = User.objects.get_or_create(email=email, defaults={'isGoogle': True, 'email': email})
    if created:
        user.set_password(str(uuid.uuid4()))
        user.save()
    
    access_token, refresh_token = create_jwt_token(user)
    return JsonResponse({
           'refresh_token': refresh_token,
            'access_token': access_token,
    })

#GET Profile
@api_view(['GET'])
def get_profile(request):
    token = request.headers.get('Authorization', None)

    if not token:
        return JsonResponse({'error': 'Authorization token not provided'}, status=400)

    try:
        # Token format should be "Bearer <token>"
        token = token.split(' ')[1]

        # Decode the token using the SECRET_KEY from settings
        decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])

        # Get the user ID from the decoded token
        user_id = decoded_token.get('user_id')

        if not user_id:
            return JsonResponse({'error': 'Invalid token payload'}, status=401)

        # Fetch the user from the database using the user_id from the token
        
        user = User.objects.get(id=user_id)
        print("get-user ",user)
        user_data = {
            'name':user.name,
            'id': user.id,
            'email': user.email,
            'phone':user.phone,
            'bio':user.bio,
            'profile_image': user.profile_image,  # Assuming these fields exist
            # Add any other user fields you need to include
        }

        return JsonResponse(user_data, status=200)

        

    except jwt.ExpiredSignatureError:
        return JsonResponse({'error': 'Token has expired'}, status=401)
    except jwt.InvalidTokenError:
        return JsonResponse({'error': 'Invalid token'}, status=401)
    except user.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)

    
# Edit Profile
@api_view(['PUT'])
def edit_profile(request):
    token = request.headers.get('Authorization', None)
    if not token:
        return JsonResponse({'error': 'Authorization token not provided'}, status=400)

    try:
        # Extract token
        token = token.split(' ')[1]
        decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        user_id = decoded_token.get('user_id')

        if not user_id:
            return JsonResponse({'error': 'Invalid token payload'}, status=401)

        # Fetch user
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)

        updated = False  # Track if any changes were made

        # Update fields only if different
        bio = request.data.get('bio', user.bio)
        name=request.data.get('name',user.name)
        phone = request.data.get('phone', user.phone)
        email = request.data.get('email', user.email)
        password = request.data.get('password')

        if bio:
            user.bio = bio
            updated = True
        if name:
            user.name=name
            updated= True

        if phone:
            user.phone = phone
            updated = True

        if email:
            user.email = email
            updated = True

        if password:
           user.set_password(request.data['password'])  # Hash password
           updated = True

        # Handle image upload
        if 'image' in request.FILES:
            image = request.FILES['image']
            file_extension = image.name.split('.')[-1]
            filename = f'user_{user_id}_profile.{file_extension}'

            # Local storage (for temporary storage before S3)
            save_path = os.path.join(settings.MEDIA_ROOT, 'profile_images', filename)
            os.makedirs(os.path.dirname(save_path), exist_ok=True)

            with open(save_path, 'wb') as f:
                for chunk in image.chunks():
                    f.write(chunk)
            mime_type, _ = mimetypes.guess_type(save_path)
            if mime_type is None:
                mime_type = 'application/octet-stream'
            # Upload to S3
            s3 = initialize_s3()
            s3_key = f'user-profile-images/{user_id}/{filename}'
            s3.Bucket(settings.AWS_STORAGE_BUCKET_NAME).upload_file(
                Filename=save_path,
                Key=s3_key,
                ExtraArgs = {
                "ContentType": mime_type,  # Change the type to match your image format
                "ContentDisposition": "inline"  # This will make the image viewable inline in the browser
}
            )

            # Get S3 image URL
            image_url = f'https://{settings.AWS_STORAGE_BUCKET_NAME}.s3.{settings.REGION_NAME}.amazonaws.com/{s3_key}'

            if image_url:
                user.profile_image = image_url
                updated = True

        # Save only if changes were made
        if updated:
            user.save()
            return JsonResponse({'message': 'Profile updated successfully'}, status=200)
        else:
            return JsonResponse({'message': 'No changes detected'}, status=200)

    except jwt.ExpiredSignatureError:
        return JsonResponse({'error': 'Token has expired'}, status=401)
    except jwt.InvalidTokenError:
        return JsonResponse({'error': 'Invalid token'}, status=401)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# Upload Image to S3
# @api_view(['PUT'])
# def upload_image(request):
  

        # Fetch the user from the database using the user_id from the token
        
    #     user = User.objects.get(id=user_id)

    #     # Check if an image was provided in the request
    #     if 'image' not in request.FILES:
    #         return JsonResponse({'error': 'No image provided'}, status=400)

    #     # Get the image from the request
    #     image = request.FILES['image']
    #      # Get the file extension and create a valid filename
    #     file_extension = image.name.split('.')[-1]
    #     filename = f'user_{user_id}_profile.{file_extension}'

    #     # Specify the directory to save the image
    #     save_path = os.path.join(settings.MEDIA_ROOT, 'profile_images', filename)
    #     print("save_path",save_path)

    #     # Create the directory if it doesn't exist
    #     os.makedirs(os.path.dirname(save_path), exist_ok=True)
    #     print("save_path2",save_path)

    #     # Save the image to the specified path
    #     with open(save_path, 'wb') as f:
    #         for chunk in image.chunks():
    #             f.write(chunk)

    #     print("save_path3",save_path)
    #     # Construct the file URL (make sure MEDIA_URL is correctly set in settings.py)
    #     image_url = fr'{settings.MEDIA_ROOT}/profile_images/{filename}'
    #     print("image_url",image_url)
    #     s3=initialize_s3()
    #     # Upload the image to S3 bucket
    #     s3_key = f'user-profile-images/{user_id}/{image.name}'
    #     print("s3_key",s3_key)
    #     # s3_client.upload_fileobj(image, settings.AWS_STORAGE_BUCKET_NAME, s3_file_path, ExtraArgs={'ACL': 'public-read'})
    #     s3.Bucket(settings.AWS_STORAGE_BUCKET_NAME).upload_file(
    #     Filename=image_url,
    #     Key=s3_key)

    #     # Get the URL of the uploaded image
    #     image_url2 = f'https://{settings.AWS_STORAGE_BUCKET_NAME}.s3.{settings.REGION_NAME}.amazonaws.com/{s3_key}'
    #     print("image_url2",image_url2)
    #     # Update the user's profile image URL
    #     user.profile_image = image_url2
    #     user.save()

    #     return JsonResponse({'message': 'Image uploaded successfully', 'image_url': image_url2}, status=200)

    # except jwt.ExpiredSignatureError:
    #     return JsonResponse({'error': 'Token has expired'}, status=401)
    # except jwt.InvalidTokenError:
    #     return JsonResponse({'error': 'Invalid token'}, status=401)
    # except user.DoesNotExist:
    #     return JsonResponse({'error': 'User not found'}, status=404)