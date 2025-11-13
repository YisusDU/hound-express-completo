from django.db import models
from django.utils import timezone

from django.contrib.auth.models import User


# Create your models here.
class Guia(models.Model):
    trackingNumber  = models.CharField(max_length=15, unique=True)
    origin = models.CharField(max_length=100)
    destination = models.CharField(max_length=100)
    createdAt = models.DateTimeField(default=timezone.now)
    updatedAt = models.DateTimeField(auto_now=True)
    currentStatus = models.CharField(max_length=20)

    def __str__(self):
        return f"{self.trackingNumber} - {self.currentStatus}"

# Simplificamos el modelo Usuario al importar el que Django ya tiene construido

class Estatus(models.Model):
    guide = models.ForeignKey(Guia, on_delete=models.CASCADE, related_name='status_history')
    status = models.CharField(max_length=20)
    timestamp = models.DateTimeField(auto_now_add=True)
    updatedBy = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL,
        null=True,
        related_name='status_updates'
    )
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Estatus'
        verbose_name_plural = 'Estatus'
        #Constraint que evita duplicados de estatus para la misma guia
        constraints = [
            models.UniqueConstraint(
                fields=['guide', 'status'],
                name='unique_guide_status'
            )
        ]
    
    def __str__(self):
        return f"{self.guide.trackingNumber} - {self.status}"