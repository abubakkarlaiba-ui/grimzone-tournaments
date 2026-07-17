import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'
from config.wsgi import application
