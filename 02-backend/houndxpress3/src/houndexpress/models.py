from django.db import models
from django.utils import timezone

from django.contrib.auth.models import User


# Create your models here.
class Guia(models.Model):
    guide_number  = models.CharField(max_length=15, unique=True)
    guide_origin = models.CharField(max_length=100)
    guide_destination = models.CharField(max_length=100)
    guide_recipient = models.CharField(max_length=100)
    current_status = models.CharField(max_length=20)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.guide_number} - {self.current_status}"

# Simplificamos el modelo Usuario al importar el que Django ya tiene construido

class Estatus(models.Model):
    guide_data = models.ForeignKey(Guia, on_delete=models.CASCADE, related_name='status_history')
    guide_status = models.CharField(max_length=20)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Estatus'
        verbose_name_plural = 'Estatus'
        #Constraint que evita duplicados de estatus para la misma guia
        constraints = [
            models.UniqueConstraint(
                fields=['guide_data', 'guide_status'],
                name='unique_guide_status'
            )
        ]
    
    def __str__(self):
        return f"{self.guide_data.guide_number} - {self.guide_status}"