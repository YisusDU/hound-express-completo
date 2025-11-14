# Proyecto Empresa Aliada - M66 Entregable 12

## ¿Qué tal practicar?

**Descripción**

En esta entrega, integrarás el trabajo realizado en el frontend con los endpoints desarrollados en el backend. El objetivo es garantizar que la aplicación funcione de manera completa y coherente, permitiendo a los usuarios interactuar con el sistema en tiempo real. Esto incluye consumir los endpoints creados con Django desde React, realizar las operaciones CRUD necesarias, y verificar que la integración sea estable y funcional.

**Antes de comenzar**

* Revisa que tanto el frontend como el backend estén completamente funcionales por separado.
* Asegúrate de que los endpoints desarrollados en el backend cumplan con las especificaciones definidas anteriormente (GET, POST, PUT).
* Configura los entornos locales para que el frontend pueda realizar solicitudes al backend. Puedes usar herramientas como CORS o proxies para resolver problemas de conexión entre servidores.

**Paso a paso:**

#### 1. Preparar el entorno

* Configura Axios, para centralizar la comunicación entre el frontend y el backend. Define una instancia que utilice la URL base del backend para facilitar las solicitudes en toda la aplicación.
* Realiza pruebas básicas para confirmar que el frontend puede consumir los endpoints del backend correctamente.

#### 2. Conectar los endpoints con los componentes

* **Formulario de Registro de Guías** :
* Integra el endpoint para registrar nuevas guías mediante solicitudes POST. Los datos capturados en el formulario se enviarán al backend y, tras una respuesta exitosa, se reflejarán en la interfaz.
* Asegúrate de que las validaciones implementadas en el frontend, como evitar duplicados o campos vacíos ,coincidan con las restricciones en el backend.
* **Panel de Estado General** :
* Usa el endpoint para obtener todas las guías registrada y calcula datos, como:
  * El número total de guías activas.
  * La cantidad de guías en tránsito.
  * Las guías entregadas.
* Los datos del backend deben ser consultados al cargar este componente y deben actualizarse automáticamente tras realizar cambios.
* **Lista de Guías** :
* Conecta el endpoint que permite listar todas las guías. Este componente mostrará la información detallada de cada guía, como el estado actual, el origen y el destino.
* Implementa la opción en cada guia para actualizar su estado usando el endpoint PUT
* **Interacción entre componentes** :
* Garantiza que los cambios realizados en un componente, como registrar una nueva guía desde el formulario o actualizar el estado desde la lista, se reflejen automáticamente en otros componentes relacionados como el Panel de Estado General

#### 3. Pruebas

* Verifica que todas las interacciones entre el frontend y el backend funcionen como se espera:
  * Registrar una nueva guía y verla reflejada en la lista y el panel de estado.
  * Actualizar el estado de una guía desde la lista y comprobar que los contadores en el panel de estado se ajusten.
* Asegúrate de manejar los errores, como fallos de conexión o respuestas inválidas del backend, mostrando mensajes claros y útiles al usuario.
* Realiza pruebas de flujo completas para simular el uso real de la aplicación, asegurando que cada sección del frontend se comunique correctamente con el backend.

**¿Cómo presentar su entrega?**

La URL de la aplicación desplegada y el repositorio actualizado con los cambios de la integración, Asegurate que tus commits sean coherentes y que incluyas solo los archivos y carpetas requeridas.

**Tiempo estimado de resolución: **60 minutos

---

## Comenzando

Primero comenzaré analizando la estructura del estado inicial en el frontend, de la lista de ordenes activas, para contrastar su estructura con la estructura que está mandando la api y hacer ajustes antes de configurar el thunk para hacer peticiones.

Esto es como el dilema de los jugadores del algún juego que hace una copia del progreso en local y otra en la nube, cuando se va la conexión de red, pero sigues jugando, entonces el progreso deja de estar sincronizado y te da la opción de mantener el local y sobrescribir el remoto o viceversa, en este caso, mantendré lo más fiel posible la estructura del frontend y modificaré el backend.

### Backend - Modelos

Como dije, todo lo que modifiqué fue del backend por ahora, he decidido eliminar la asociación con el usuario pues mi app frontend no fue diseñada para eso aún e implementar un sistema de autenticación sería muuuuy tardado, por lo que así es como he dejado el backend por ahora

- \proyect-partner-company-m66\02-backend\houndxpress3\src\houndexpress\models.py

```python
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
```

### Serializers.py

- \proyect-partner-company-m66\02-backend\houndxpress3\src\houndexpress\serializers.py

```python
from rest_framework.serializers import ModelSerializer, ValidationError, CharField
from rest_framework import serializers

from .models import Guia, Estatus
from django.contrib.auth.models import User


class GuideSerializer(ModelSerializer):
    class Meta:
        model = Guia
        fields = [
            "id",
            "guide_number",
            "guide_origin",
            "guide_destination",
            "guide_recipient",
            "current_status",
            "created_at",
            "updated_at"
        ]
        extra_kwargs = {
            'guide_number': {'label': 'Número de Seguimiento'},
            'guide_origin': {'label': 'Origen'},
            'guide_destination': {'label': 'Destino'},
            'current_status': {'label': 'Estado Actual'},
        }
        read_only_fields = ['id', "current_status"]

    def validate(self, data):
        """Validación de múltiples campos"""
        if self.instance:
            # En UPDATE (PUT/PATCH)
            origin = data.get('guide_origin', self.instance.guide_origin)
            destination = data.get('guide_destination', self.instance.guide_destination)
        origin = data.get('guide_origin')
        destination = data.get('guide_destination')

        # Validar solo si ambos tienen valor
        if origin and destination and origin == destination:
            raise ValidationError("Origen y destino no pueden ser iguales")
        return data
  
      
class UserSerializer(ModelSerializer):
    password2 = CharField(
        style = { 'input_type': 'password' }, 
        label = "Contraseña (Repita)",
        write_only = True, 
        required = False
    )
  
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "password",
            "password2"
        ]
        extra_kwargs = {
            "username": {"label": "Nombre"},
            "email": {"label": "Correo"},
            "password": { "write_only": True, "label": "Contraseña", "required": False,  "style": {'input_type': 'password'}, },
        }
        read_only_fields = ['id']

    def validate_username(self, value):
        #Django no permite usuarios con el mismo username
        """Validar que el username sea único"""
        user = self.instance  # None en creación, User instance en update
      
        # Si es update y el username no cambió, permitirlo
        if user and user.username == value:
            return value
        # Verificar si ya existe
        query = User.objects.filter(username=value)
      
        # Si es update, excluir el usuario actual de la búsqueda
        if user:
            query = query.exclude(pk=user.pk)
      
        if query.exists():
            raise serializers.ValidationError(
                "Este nombre de usuario ya está en uso."
            )
        return value

    def validate(self, data):
        password = data.get('password')
        password2 = data.get('password2')
        is_create = not self.instance
        changing_password = password or password2
      
        if is_create or changing_password:
            # Validar que ambas contraseñas estén presentes
            if not password or not password2:
                raise ValidationError({
                    'password': 'Se requieren ambas contraseñas'
                })
          
            # Validar que coincidan
            if password != password2:
                raise ValidationError({
                    'password2': 'Las contraseñas no coinciden'
                })
      
        return data   
       

    def validate_email(self, value):
        """Validar que email sea único (en creación y actualización)"""
        value = value.lower().strip()  # Normalizar
        qs = User.objects.filter(email=value)
      
        # Excluir instancia actual en updates
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
      
        if qs.exists():
            raise ValidationError('Este email ya está registrado')  # Formato correcto
      
        return value
  
    def create(self, validated_data):
        """Crear nuevo usuario"""
        validated_data.pop('password2')
        password = validated_data.pop('password')

        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user
     
  
    def update(self, instance, validated_data):
        """Actualizar usuario existente"""
        validated_data.pop('password2', None)  # Limpiar password2
        password = validated_data.pop('password', None)
      
        # loop en lugar de asignaciones manuales
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
      
        if password:
            instance.set_password(password)
      
        instance.save()
        return instance
   
class EstatusSerializer(ModelSerializer):
    guide_detail = GuideSerializer(source='guide_data', read_only=True)
  
    guide_data = serializers.PrimaryKeyRelatedField(
        queryset=Guia.objects.all(),
        write_only=True,
        label = "Número de rastreo",
        error_messages={
            'does_not_exist': 'La guía con ID {pk_value} no existe en el sistema',
            'incorrect_type': 'El ID de la guía debe ser un número entero',
            'required': 'El campo guía es obligatorio'
        }
    )
  
    class Meta:
        model = Estatus
        fields = [
            'id',
            'guide_data',
            'guide_detail',
            'guide_status',
            'timestamp',
        ]
        read_only_fields = ['timestamp', 'id']
        extra_kwargs = {
            'guide_status': {'label': 'Estado'},
        }
  
    def validate_status(self, value):
        """Validar que el status sea válido"""
        VALID_STATUSES = [
            'Pendiente',
            'En tránsito',
            'Entregado',
            'Cancelado'
        ]
      
        if value not in VALID_STATUSES:
            raise ValidationError(
                f"Status inválido. Valores permitidos: {', '.join(VALID_STATUSES)}"
            )
      
        return value
  
    def validate_guide(self, value):
        """Validación del campo guide"""
        # Solo validar en CREATE (no en UPDATE)
        if not self.instance:
            if value.current_status == 'Cancelado':
                raise ValidationError(
                    "No se puede crear estatus para una guía cancelada"
                )
          
            if value.current_status == 'Entregado':
                raise ValidationError(
                    "No se puede crear estatus para una guía ya entregada"
                )
      
        return value
  
    def validate(self, attrs):
        """Validar que no exista un Estatus duplicado para la misma guía"""
        guide = attrs.get('guide_data')
        new_status = attrs.get('guide_status')
      
        # En CREATE: validar que no exista ya un estatus con el mismo status para esta guía
        if not self.instance and guide and new_status:
            existe_duplicado = Estatus.objects.filter(
                guide=guide,
                status=new_status
            ).exists()
          
            if existe_duplicado:
                raise ValidationError({
                    'status': f'Ya existe un registro de estatus "{new_status}" para la guía {guide.guide_number}'
                })
      
        # En UPDATE: validar que no se duplique con otro registro (excepto el mismo)
        if self.instance and guide and new_status:
            existe_duplicado = Estatus.objects.filter(
                guide=guide,
                status=new_status
            ).exclude(id=self.instance.id).exists()
          
            if existe_duplicado:
                raise ValidationError({
                    'status': f'Ya existe otro registro de estatus "{new_status}" para la guía {guide.guide_number}'
                })
      
        return attrs
  
    def create(self, validated_data):
        """Crear estatus y actualizar currentStatus de la guía automáticamente"""
        # Crear el estatus
        estatus = Estatus.objects.create(**validated_data)
      
        # Actualizar el currentStatus de la guía
        guia = estatus.guide_data
        guia.current_status = estatus.guide_status
        guia.save()
      
        return estatus
  
    def update(self, instance, validated_data):
        """Actualizar estatus y currentStatus de la guía"""
        # Actualizar los campos del estatus
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
      
        # Si cambió el status, actualizar la guía
        if 'status' in validated_data:
            guia = instance.guide_data
            guia.current_status = instance.guide_status
            guia.save()
      
        return instance
```
