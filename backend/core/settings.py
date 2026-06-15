import pymysql
import os
from dotenv import load_dotenv
from pathlib import Path
from datetime import timedelta

pymysql.install_as_MySQLdb()

BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(BASE_DIR / '.env')

# ── Bảo mật ──
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-change-me-in-env')
DEBUG = os.environ.get('DEBUG', 'True') == 'True'
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '127.0.0.1,localhost').split(',')

# ── Ứng dụng ──
INSTALLED_APPS = [
    'corsheaders',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'education',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR.parent / 'Frontend'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'

# ── Database ──
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME':     os.environ.get('DB_NAME', 'japanese_center_db'),
        'USER':     os.environ.get('DB_USER', 'root'),
        'PASSWORD': os.environ.get('DB_PASSWORD', ''),
        'HOST':     os.environ.get('DB_HOST', '127.0.0.1'),
        'PORT':     os.environ.get('DB_PORT', '3306'),
    }
}

# ── REST Framework ──
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    )
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ── Internationalisation ──
LANGUAGE_CODE = 'en-us'
TIME_ZONE     = 'Asia/Ho_Chi_Minh'
USE_I18N = True
USE_TZ   = True

# ── Static & Media ──
STATIC_URL       = 'static/'
STATICFILES_DIRS = [BASE_DIR.parent / 'Frontend']
MEDIA_URL        = '/media/'
MEDIA_ROOT       = BASE_DIR / 'media'

AUTH_USER_MODEL = 'education.User'

# ── CORS ──
_cors_origins = os.environ.get('CORS_ALLOWED_ORIGINS', '')
if _cors_origins:
    CORS_ALLOWED_ORIGINS   = [o.strip() for o in _cors_origins.split(',') if o.strip()]
    CORS_ALLOW_ALL_ORIGINS = False
else:
    CORS_ALLOW_ALL_ORIGINS = True   # fallback dev: cho phép tất cả

# ── JWT ──
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME':  timedelta(minutes=int(os.environ.get('JWT_ACCESS_MINUTES', '60'))),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=int(os.environ.get('JWT_REFRESH_DAYS', '30'))),
    'ROTATE_REFRESH_TOKENS':  True,
    'BLACKLIST_AFTER_ROTATION': True,
}

# ── VNPay ──
VNPAY_TMN_CODE    = os.environ.get('VNPAY_TMN_CODE', '')
VNPAY_HASH_SECRET = os.environ.get('VNPAY_HASH_SECRET', '')
VNPAY_PAYMENT_URL = os.environ.get('VNPAY_PAYMENT_URL', 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html')
VNPAY_RETURN_URL  = os.environ.get('VNPAY_RETURN_URL', 'http://127.0.0.1:8000/educations/vnpay/return/')
VNPAY_IPN_URL     = os.environ.get('VNPAY_IPN_URL', 'http://127.0.0.1:8000/educations/vnpay/ipn/')
VNPAY_FRONTEND_RETURN_URL = os.environ.get('VNPAY_FRONTEND_RETURN_URL', 'http://127.0.0.1:8000/Frontend/cart.html')

# ── Gemini chatbot ──
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', os.environ.get('GEMINI_KEY', ''))
GEMINI_MODEL   = os.environ.get('GEMINI_MODEL', 'gemini-1.5-flash')