from django.contrib import admin

# Register your models here.
from .models import Guia, Estatus

admin.site.register(Guia)
admin.site.register(Estatus)