# Proyecto Empresa Aliada - M64 Entregable 11

## ¿Qué tal practicar?

**Descripción: Creación de los Endpoints **

Para esta tercera entrega, vas a generar el código requerido en los archivos [**views.py**](http://views.py/) y [**urls.py**](http://urls.py/) en los cuales se va a exponer los diferentes tipos de *Endpoints* que estarán enfocado a realizar todas las operaciones CRUD necesarias sobre las tablas definidas. Esto nos posibilitará crear un punto de entrada desde el sistema frontal e incluso desde otros sistemas que deseen utilizar tu API. __.

**Paso a paso: **

Los siguientes pasos serán adiciones que se harán al proyecto generado previamente para poder crear los *Endpoints* que serán utilizados por el sistema frontal los cuales tendrán el prefijo **api/** y este será definido en el archivo [**urls.py**](http://urls.py/) principal

* Crear cada una de las vista utilizando los **viewsets** en el archivo [**views.py**](http://views.py/)
* Configurar las URLs necesarias para las vistas creadas en el archivo [**urls.py**](http://urls.py/) del proyecto:
  * crear-guia
  * actualizar-guia
  * obtener-guia
  * eliminar-guia ( *En caso de que se desee eliminar una guía* )
* Probar los endpoints haciendo uso de Postman o alguna otra herramienta similar haciendo el llamado a los endpoints de acuerdo con la información que recibirá cada uno de ellos, por ejemplo:
  * Para crear una guía
    * Llamar al endpoint **api/crear-guia** y pasar en el cuerpo del llamado los datos requeridos por esta.
    * Llamar al endpoint **api/actualizar-guia/ID-GUIA** y pasar en el cuerpo del llamado los datos requeridos por esta.
    * Llamar al endpoint **api/actualizar-guia/ID-GUIA** y pasar en el cuerpo del llamado los datos requeridos por esta.
    * Llamar al endpoint **api/obtener-guia/ID-GUIA** para recibir los datos de la guía de acuerdo a su ID.
    * Llamar al endpoint **api/eliminar-guia/ID-GUIA** para eliminar de la base de datos la guía con el ID especificado..

**¿Cómo presentar su entrega? **

Proyecto comprimido en Zip o bien la url hacia el repositorio

**Tiempo estimado de resolución: **160 minutos

---

## Comenzando

### Instalando rest_framework

Para hacer uso de los viewsets que piden los requerimientos, es necesario instalar la librería rest_framework en las dependencias del proyecto

- houndxpress3\pyproject.toml

```toml
[project]
name = "hello"
version = "0.1.0"
description = "An example Django app running in Docker."
readme = "README.md"
requires-python = ">=3.13"
dependencies = [
  "django==5.2.4",
  "celery==5.5.3",
  "django-debug-toolbar==6.0.0",
  "gunicorn==23.0.0",
  "psycopg==3.2.9",
  "redis==6.2.0",
  "ruff==0.12.7",
  "setuptools==80.9.0",
  "whitenoise==6.9.0",
  "djangorestframework==3.16.1",
]

[tool.ruff]
line-length = 79

[tool.ruff.lint]
extend-select = ["I", "SIM"]

```

Para cumplir con la indicación "los *Endpoints* que serán utilizados por el sistema frontal los cuales tendrán el prefijo **api/** y este será definido en el archivo [**urls.py**](http://urls.py/) principal" considero necesario crear una app llamada api

### Creando app api

Crearemos la app api, primero levantando los contenedores pero usando --build para que se instale la dependencia anterior

```
docker compose up --build
docker ps
docker exec -it hellodjango-web-1 bash
python manage.py startapp api
```

Adicionalmente ejecutamos pip freeze desde el contenedor corriendo para verificar las dependencias

```
pip freeze
```

> amqp==5.3.1
> asgiref==3.8.1
> billiard==4.2.1
> celery==5.5.3
> click==8.1.8
> click-didyoumean==0.3.1
> click-plugins==1.1.1
> click-repl==0.3.0
> Django==5.2.4
> django-debug-toolbar==6.0.0
> djangorestframework==3.16.1 # <---- aqui está rest_framework
> gunicorn==23.0.0
> kombu==5.5.2
> packaging==24.2
> prompt_toolkit==3.0.50
> psycopg==3.2.9
> python-dateutil==2.9.0.post0
> redis==6.2.0
> ruff==0.12.7
> setuptools==80.9.0
> six==1.17.0
> sqlparse==0.5.3
> tzdata==2025.2
> vine==5.1.0
> wcwidth==0.2.13
> whitenoise==6.9.0

y añadimos la app las apps instaladas

- \houndxpress3\src\config\settings.py

```python
# Application definitions
INSTALLED_APPS = [
    "api.apps.ApiConfig" # <--- añadimos la app "api"
    "pages.apps.PagesConfig",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]
```

### Configurando rest_framework

Para que DRF funcione correctamente, es necesario añadirlo a las apps instaladas

- \houndxpress3\src\config\settings.py

```python
# Application definitions
INSTALLED_APPS = [
    "rest_framework", # <---- necesario para DRF
    "api.apps.ApiConfig", 
    "pages.apps.PagesConfig",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]
```

y ya que estamos aqui, agregaré comentado la configuración del renderer para producción

- \houndxpress3\src\config\settings.py

```python
#REST_FRAMEWORK = {
#     'DEFAULT_RENDERER_CLASSES': [
#         'rest_framework.renderers.JSONRenderer',
#     ]
# }
```

### Vistas básicas

Primero crearé las bases para las vistas antes de agregar la verdadera funcionalidad

- \houndxpress3\src\api\views.py

```python
from django.shortcuts import render
from rest_framework import status 
from rest_framework.response import Response 
from rest_framework.viewsets import ViewSet #<-- import ViewSet

# ViewSet for User model
class GuideViewSet(ViewSet):
    """ViewSet para listar guias"""
    def list(self, request):
        message = "Lista de guias"
        return Response({"message": message}, status=status.HTTP_200_OK)
  

    def create(self, request):
        """Crea una guia"""
        message = "Creando una guia"
        return Response({"message": message}, status=status.HTTP_201_CREATED)
  
    def retrieve(self, request, pk=None):
        """Maneja obtener una guia por su ID"""
        message = f"Obteniendo la guia por su ID {pk}"
        return Response({"message": message}, status=status.HTTP_200_OK)
  
    def update(self, request, pk=None):
        """Maneja la actualización de una guia por su ID"""
        message = f"Actualizando la guia con ID {pk}"
        return Response({"message": message}, status=status.HTTP_200_OK)
  
    def partial_update(self, request, pk=None):
        """Maneja la actualización parcial de una guia por su ID"""
        message = f"Actualizando parcialmente la guia con ID {pk}"
        return Response({"message": message}, status=status.HTTP_200_OK)
  
    def destroy(self, request, pk=None):
        """Maneja la eliminación de una guia por su ID"""
        message = f"Eliminando la guia con ID {pk}"
        return Response({"message": message}, status=status.HTTP_200_OK)

```

### Crando las urls

Creamos un archivo urls.py en la app "api" y le cargamos el router

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GuideViewSet

router = DefaultRouter()
router.register("guide-viewset", GuideViewSet, basename="guide-viewset")

urlpatterns = [
    path("", include(router.urls))
]
```

Adicionalmente, añadimos esta urls locales a las globales

- \houndxpress3\src\config\urls.py

```python
urlpatterns = [
    path("up/", include("up.urls")),
    path("", include("pages.urls")),
    path("admin/", admin.site.urls),
    path("api/v1/", include("api.urls")) # <----
]
```

## Pruebas beta

### Visitando el endpoint en el navegador

- http://localhost:8000/api/v1/guide-viewset/

En esta primera imagen estamos haciendo un get, aunque no tenemos guías, y nos da la opción de hacer un post, entonces tenemos List y Create de los viewsets

![1760756125046](image/readme/1760756125046.png)

Y probamos a pasarle un id en el endpoint

- http://localhost:8000/api/v1/guide-viewset/1/

En esta nueva imagen ya tenemos el retrive, update, partial_update y destroy en forma de get, put, patch y delete

![1760756343667](image/readme/1760756343667.png)

## Creando serializers

Con las pruebas exitosas, pasamos a crear los serializers para comenzar a añadir una verdadera funcionalidad

### Serializer del modelo Guia

Me parece conveniente crear los serializers en su app original e importarlos a la app "api"m, para lo que creamos el archivo "serializers.py"

- \houndxpress3\src\houndexpress\serializers.py

Para crear el primer serializer, estuve basandome bastante en los campos del modelo y noté que podía haber algunas problematicas si no los corregía, así que apliqué algunos cambios

- 52-django-RF-auth\09-ninth-version-partner-company\houndxpress3\src\houndexpress\models.py

```python
from django.db import models
from django.utils import timezone

# Create your models here.
class Guia(models.Model):
    trackingNumber  = models.CharField(max_length=15, unique=True)
    origin = models.CharField(max_length=100)
    destination = models.CharField(max_length=100)
    createdAt = models.DateTimeField(default=timezone.now)
    updatedAt = models.DateTimeField(auto_now=True)
    currentStatus = models.CharField(max_length=20)

class Usuario(models.Model):
    name = models.CharField(max_length=50)
    email = models.CharField(max_length=50, unique=True)
    password = models.CharField(max_length=128)
    createdAt = models.DateTimeField(default=timezone.now)
    updatedAt = models.DateTimeField(auto_now=True) 

class Estatus(models.Model):
    guide = models.ForeignKey(Guia,on_delete=models.CASCADE,related_name='status_history')
    status = models.CharField(max_length=20)
    timestamp = models.DateTimeField(auto_now_add=True)
    updatedBy = models.ForeignKey(Usuario,on_delete=models.SET_NULL,null=True,related_name='status_updates')
```

y ahora sí estuve más tranquilo para trabajar con el serializer

- \houndxpress3\src\houndexpress\serializers.py

```python
from rest_framework.serializers import ModelSerializer, ValidationError

from .models import Guia

class GuideSerializer(ModelSerializer):
    class Meta:
        model = Guia
        fields = [
	    "id",
            "trackingNumber",
            "origin",
            "destination",
            "currentStatus"
        ]
        read_only_fields = ['id']

    def validate(self, data):
        """Validación de múltiples campos"""
        if self.instance:
            # Es UPDATE (PUT/PATCH)
            origin = data.get('origin', self.instance.origin)
            destination = data.get('destination', self.instance.destination)
        origin = data.get('origin')
        destination = data.get('destination')

        # Validar solo si ambos tienen valor
        if origin and destination and origin == destination:
            raise ValidationError("Origen y destino no pueden ser iguales")
        return data
  
  

```

## Vistas funcionales

Ahora añadiré verdadera funcionalidad a las vistas

- \houndxpress3\src\api\views.py

```python
from django.shortcuts import render
from rest_framework import status 
from rest_framework.response import Response 
from rest_framework.viewsets import ViewSet #<-- import ViewSet
from django.shortcuts import get_object_or_404 #<-- import get_object_or_404

from houndexpress.models import Guia
from houndexpress.serializers import GuideSerializer

# ViewSet for Guia model
class GuideViewSet(ViewSet):
    """ViewSet para listar guias"""
    serializer_class = GuideSerializer

    def list(self, request):
        """"Lista todas las guías"""
        guides = Guia.objects.all()
        serializer = self.serializer_class(guides, many=True)
        message = "Lista de guias"
        data = serializer.data
        return Response({"message": message, "data": data}, status=status.HTTP_200_OK)
  

    def create(self, request):
        """Crea una guia"""
        serializer = self.serializer_class(data = request.data)

        if not serializer.is_valid():
            data = serializer.errors
            return Response({"data": data}, status=status.HTTP_400_BAD_REQUEST)
  
        serializer.save()
        message = "Creando una guia"
        data = serializer.data
        return Response({"message": message, "data": data}, status=status.HTTP_201_CREATED)
  
    def retrieve(self, request, pk=None):
        """Maneja obtener una guia por su ID"""
        guide = get_object_or_404(Guia, pk=pk)  
        message = f"Obteniendo la guia por su ID {pk}"
        data = GuideSerializer(guide).data
  
        return Response({"message": message, "data": data}, status=status.HTTP_200_OK)
  
    def update(self, request, pk=None):
        """Maneja la actualización de una guia por su ID"""
        guide = get_object_or_404(Guia, pk=pk)  
        serializer = self.serializer_class(guide, data=request.data, partial=False)
  
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
  
        message = f"Actualizando la guia con ID {pk}"
        serializer.save()
        data = serializer.data
        return Response({"message": message, "data": data}, status=status.HTTP_200_OK)
  
    def partial_update(self, request, pk=None):
        """Maneja la actualización parcial de una guia por su ID"""
        guide = get_object_or_404(Guia, pk=pk)  
        serializer = self.serializer_class(guide, data=request.data, partial=True)
  
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
  
        message = f"Actualizando la guia con ID {pk}"
        serializer.save()
        data = serializer.data
        return Response({"message": message, "data": data}, status=status.HTTP_200_OK)
  
    def destroy(self, request, pk=None):
        """Maneja la eliminación de una guia por su ID"""
        guide = get_object_or_404(Guia, pk=pk)
        guide.delete()
        message = f"La guia con ID {pk} se eliminó correctamente"
        return Response({"message": message}, status=status.HTTP_200_OK)

```

## Debug

Al intentar levantar el contenedor, me arrojó el error de que la app houndexpress no estaba registrada, asi que la resgistramos en el settings

- \houndxpress3\src\config\settings.py

```python
# Application definitions
INSTALLED_APPS = [
    "rest_framework", 
    "api.apps.ApiConfig", 
    "houndexpress.apps.HoundexpressConfig", #<-- faltaba esto
    "pages.apps.PagesConfig",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]
```

Adicionalmente nos daba este error:

> # ProgrammingError at /api/v1/guide-viewset/
>
> ```
> relation "houndexpress_guia" does not exist
> LINE 1: ...atedAt", "houndexpress_guia"."currentStatus" FROM "houndexpr...
>                                                              ^
> ```
>
> | Request Method:  | GET                                         |
> | ---------------- | ------------------------------------------- |
> | Request URL:     | http://localhost:8000/api/v1/guide-viewset/ |
> | Django Version:  | 5.2.4                                       |
> | Exception Type:  | ProgrammingError                            |
> | Exception Value: |                                             |
>
> ```
> relation "houndexpress_guia" does not exist
> LINE 1: ...atedAt", "houndexpress_guia"."currentStatus" FROM "houndexpr...
>                                                              ^
> ```
>
> |
> | Exception Location: |**/home/python/.local/lib/python3.13/site-packages/psycopg/cursor.py**, line 97, in execute                                                                                                                                                                                                          |
> | Raised during:      | api.views.GuideViewSet                                                                                                                                                                                                                                                                               |
> | Python Executable:  | /home/python/.local/bin/python                                                                                                                                                                                                                                                                       |
> | Python Version:     | 3.13.5                                                                                                                                                                                                                                                                                               |
> | Python Path:        |
>
> ```
> ['/app/src',
>  '/home/python/.local/bin',
>  '/app/src',
>  '/usr/local/lib/python313.zip',
>  '/usr/local/lib/python3.13',
>  '/usr/local/lib/python3.13/lib-dynload',
>  '/home/python/.local/lib/python3.13/site-packages',
>  '/home/python/.local/lib/python3.13/site-packages/setuptools/_vendor']
> ```
>
> |
> | Server time:        | Sun, 19 Oct 2025 04:26:51 +0000

Y resulta que no había creado las migraciones

```
python manage.py makemigrations
python manage.py migrate
```

## Probando

Cuando comencé las pruebas noté que no estaban registrados los modelos en el admin, así que lo corregí rápidamente

- \houndxpress3\src\houndexpress\admin.py

```python
from django.contrib import admin

# Register your models here.
from .models import Guia, Estatus

admin.site.register(Guia)
admin.site.register(Estatus)
```

Una vez con los modelos registrados, entramos al admin para verificar que estaba vacio

- http://localhost:8000/admin/houndexpress/guia/

![1760851366944](image/readme/1760851366944.png)

### Revizando el método list

- http://localhost:8000/api/v1/guide-viewset/

![1760851426339](image/readme/1760851426339.png)

### Probando el método create

- http://localhost:8000/api/v1/guide-viewset/

![1760851484263](image/readme/1760851484263.png)

### Probando el método retrive

- http://localhost:8000/api/v1/guide-viewset/2/

![1760852002157](image/readme/1760852002157.png)

### Probando método upate

- http://localhost:8000/api/v1/guide-viewset/2/

![1760852150754](image/readme/1760852150754.png)

### Probando método partial_update

- http://localhost:8000/api/v1/guide-viewset/2/

![1760852232843](image/readme/1760852232843.png)

### Probando método destroy

- http://localhost:8000/api/v1/guide-viewset/2/

![1760852272779](image/readme/1760852272779.png)

![1760852287147](image/readme/1760852287147.png)

![1760852305824](image/readme/1760852305824.png)

## Puliendo las etiquetas de los campos

Luego de hacer las pruebas, quise cambiar la etiqueta de los campos

- houndxpress3\src\houndexpress\serializers.py

```python
from rest_framework.serializers import ModelSerializer, ValidationError

from .models import Guia

class GuideSerializer(ModelSerializer):
    class Meta:
        model = Guia
        fields = [
            "id",
            "trackingNumber",
            "origin",
            "destination",
            "currentStatus"
        ]
        extra_kwargs = {
            'trackingNumber': {'label': 'Número de Seguimiento'},
            'origin': {'label': 'Origen'},
            'destination': {'label': 'Destino'},
            'currentStatus': {'label': 'Estado Actual'},
        }
        read_only_fields = ['id']

    def validate(self, data):
        """Validación de múltiples campos"""
        if self.instance:
            # Es UPDATE (PUT/PATCH)
            origin = data.get('origin', self.instance.origin)
            destination = data.get('destination', self.instance.destination)
        origin = data.get('origin')
        destination = data.get('destination')

        # Validar solo si ambos tienen valor
        if origin and destination and origin == destination:
            raise ValidationError("Origen y destino no pueden ser iguales")
        return data
  
    

```

![1760853170651](image/readme/1760853170651.png)

## Agregando los otros serializers (usuarios y estatus)

Creo que ya podemos proceder con los otros serializadores, desconozco si son requeridos en la práctica, pero sé que los voy a necesitar, y nosé, me he entusiasmado por que funcione todo bien

- \houndxpress3\src\houndexpress\serializers.py

```python
      
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
    guide_detail = GuideSerializer(source='guide', read_only=True)
    updated_by_detail = UserSerializer(source='updatedBy', read_only=True)
  
    guide = serializers.PrimaryKeyRelatedField(
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
            'guide',
            'guide_detail',
            'status',
            'timestamp',
            'updated_by_detail'
        ]
        read_only_fields = ['timestamp', 'id']
        extra_kwargs = {
            'status': {'label': 'Estado'},
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
            if value.currentStatus == 'Cancelado':
                raise ValidationError(
                    "No se puede crear estatus para una guía cancelada"
                )
          
            if value.currentStatus == 'Entregado':
                raise ValidationError(
                    "No se puede crear estatus para una guía ya entregada"
                )
      
        return value
  
    def validate(self, attrs):
        """Validar que no exista un Estatus duplicado para la misma guía"""
        guide = attrs.get('guide')
        new_status = attrs.get('status')
      
        # En CREATE: validar que no exista ya un estatus con el mismo status para esta guía
        if not self.instance and guide and new_status:
            existe_duplicado = Estatus.objects.filter(
                guide=guide,
                status=new_status
            ).exists()
          
            if existe_duplicado:
                raise ValidationError({
                    'status': f'Ya existe un registro de estatus "{new_status}" para la guía {guide.trackingNumber}'
                })
      
        # En UPDATE: validar que no se duplique con otro registro (excepto el mismo)
        if self.instance and guide and new_status:
            existe_duplicado = Estatus.objects.filter(
                guide=guide,
                status=new_status
            ).exclude(id=self.instance.id).exists()
          
            if existe_duplicado:
                raise ValidationError({
                    'status': f'Ya existe otro registro de estatus "{new_status}" para la guía {guide.trackingNumber}'
                })
      
        return attrs
  
    def create(self, validated_data):
        """Crear estatus y actualizar currentStatus de la guía automáticamente"""
        # Crear el estatus
        estatus = Estatus.objects.create(**validated_data)
      
        # Actualizar el currentStatus de la guía
        guia = estatus.guide
        guia.currentStatus = estatus.status
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
            guia = instance.guide
            guia.currentStatus = instance.status
            guia.save()
      
        return instance
```

## Creando vistas para los usuarios y los Estatus

- \houndxpress3\src\api\views.py

La vista de Estatus incluye un path para buscar todos los números de rastreo que coincidan

```python

# ViewSet for User model
class UserViewSet(ViewSet):
    """ViewSet para listar usuarios"""
    serializer_class = UserSerializer #<-- we can use the ProductSerializer for simplicity
    def list(self, request):
        """Lista todos los usuarios"""
        users = User.objects.all()
        serializer = self.serializer_class(users, many=True)
        message = [
            "Lista de usuarios",
             serializer.data  
            ]
        return Response({"message": message}, status=status.HTTP_200_OK)

    def create(self, request):
        """Crea un mensaje de saludo"""
        serializer = self.serializer_class(data = request.data)
        if serializer.is_valid():
            serializer.save()
            data = serializer.data
            message = [
                "Creando un usuario con los siguientes datos:",
                data
            ]
            return Response({"message": message}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
  
    def retrieve(self, request, pk=None):
        """Maneja obtener un objeto por su ID"""
        user = get_object_or_404(User, pk=pk)
        message = {
            "message": "Obteniendo un usuario por su ID",
            "data": {
                "id": pk,
                "serializer": UserSerializer(user).data
            }
        }
        return Response({"message": message}, status=status.HTTP_200_OK)
  

    def update(self, request, pk=None):
        """Maneja la actualización completa de un objeto por su ID"""
        user = get_object_or_404(User, pk=pk)
        serializer = self.serializer_class(user, data=request.data, partial=False)
  
        if not serializer.is_valid():
            return Response(
                serializer.errors, 
                status=status.HTTP_400_BAD_REQUEST
            )
  
        user = serializer.save()
  
        return Response({
            "message": f"Usuario con ID {pk} actualizado correctamente",
            "data": UserSerializer(user).data
        }, status=status.HTTP_200_OK)


    def partial_update(self, request, pk=None):
        """Maneja la actualización parcial de un objeto por su ID"""
        user = get_object_or_404(User, pk=pk)
        serializer = self.serializer_class(user, data=request.data, partial=True)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        data = serializer.validated_data
        message = [
            f"Actualizando parcialmente el usuario con ID {pk}",
            data
        ]
        return Response({"message": message}, status=status.HTTP_200_OK)
  
    def destroy(self, request, pk=None):
        """Maneja la eliminación de un objeto por su ID"""
        user = get_object_or_404(User, pk=pk)
        user.delete()
        message = f"Eliminando el usuario con ID {pk}"
        return Response({"message": message}, status=status.HTTP_200_OK)
  
class EstatusViewSet(ViewSet):
    """ViewSet para listar los Estatus"""
    serializer_class = EstatusSerializer  
  
    def list(self, request):
        """Listar todos los estatus"""
        estatus = Estatus.objects.all()
        serializer = self.serializer_class(estatus, many = True)
        message = "Lista de Estatus"
        return Response({"message": message, "data": serializer.data}, status=status.HTTP_200_OK)

  
    def create(self, request):
        """Crear un nuevo estatus"""
        serializer = self.serializer_class(data=request.data)  
        if serializer.is_valid():
            message = "Estatus creado con éxito"
            serializer.save(updatedBy=request.user)
            return Response({"message": message, "data": serializer.data}, status=status.HTTP_201_CREATED)
      
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
  
    def retrieve(self, request, pk=None):
        """Obtener un estatus específico"""
        queryset = Estatus.objects.select_related('guide', 'updatedBy').all()
        estatus = get_object_or_404(queryset, pk=pk)
        serializer = self.serializer_class(estatus)  
        message = "Estatus obtenido con éxito"
        return Response({"message": message, "data": serializer.data}, status=status.HTTP_200_OK)
  
    def update(self, request, pk=None):
        """Actualizar completamente un estatus"""
        queryset = Estatus.objects.select_related('guide', 'updatedBy').all()
        estatus = get_object_or_404(queryset, pk=pk)
      
        serializer = self.serializer_class(estatus, data=request.data, partial=False)  
      
        if serializer.is_valid():
            serializer.save(updatedBy=request.user)
            message = f"Estatus con id {pk} actualizado con éxito"
            return Response({"message": message, "data": serializer.data}, status=status.HTTP_200_OK)
      
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
  
   # Dado que solo manejamos un campo en realidad, no tiene sentido usar partial_update
  
    def destroy(self, request, pk=None):
        """Eliminar un estatus"""
        queryset = Estatus.objects.all()
        estatus = get_object_or_404(queryset, pk=pk)
      
        estatus.delete()
      
        return Response(
            {'message': f'Estatus con id {pk} eliminado correctamente'},
            status=status.HTTP_204_NO_CONTENT
        )
    # Una url especial para hacer retrive por el trackingNumber
    @action(detail=False, methods=['get'], url_path='by-tracking/(?P<tracking>[^/.]+)')
    def by_tracking(self, request, tracking=None):
        """Endpoint dedicado para buscar por tracking"""
        queryset = Estatus.objects.select_related('guide', 'updatedBy').filter(
            guide__trackingNumber__iexact=tracking
        ).order_by('-timestamp')
      
        if not queryset.exists():
            return Response(
                {'error': f'No se encontraron estatus para el tracking: {tracking}'},
                status=status.HTTP_404_NOT_FOUND
            )
      
        serializer = self.serializer_class(queryset, many=True)  
      
        return Response({
            'tracking': tracking,
            'count': queryset.count(),
            'results': serializer.data
        })

```

## Agregando las nuevas urls con routers

- \houndxpress3\src\api\urls.py

Agregamos las rutas para las vistas Estatus y User

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GuideViewSet,UserViewSet, EstatusViewSet

router = DefaultRouter()

router.register('guides', GuideViewSet, basename='guide')
router.register('users', UserViewSet, basename='user')
router.register('estatus', EstatusViewSet, basename='estatus')

urlpatterns = [
    path('', include(router.urls)),
]
```

## Probando 2

### Probando las vistas UserViewSet

#### Prueba del método list

- http://localhost:8000/api/v1/users/

![1760926765739](image/readme/1760926765739.png)

classEstatusViewSet(ViewSet):

    """ViewSet para listar los Estatus"""

    serializer_class = EstatusSerializer

    deflist(self, request):

    """Listar todos los estatus"""

    estatus = Estatus.objects.all()

    serializer = self.serializer_class(estatus, many = True)

    message = "Lista de Estatus"

    returnResponse({"message": message, "data": serializer.data}, status=status.HTTP_200_OK)

    defcreate(self, request):

    """Crear un nuevo estatus"""

    serializer = self.serializer_class(data=request.data)

    ifserializer.is_valid():

    message = "Estatus creado con éxito"

    serializer.save(updatedBy=request.user)

    returnResponse({"message": message, "data": serializer.data}, status=status.HTTP_201_CREATED)

    returnResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    defretrieve(self, request, pk=None):

    """Obtener un estatus específico"""

    queryset = Estatus.objects.select_related('guide', 'updatedBy').all()

    estatus = get_object_or_404(queryset, pk=pk)

    serializer = self.serializer_class(estatus)

    message = "Estatus obtenido con éxito"

    returnResponse({"message": message, "data": serializer.data}, status=status.HTTP_200_OK)

    defupdate(self, request, pk=None):

    """Actualizar completamente un estatus"""

    queryset = Estatus.objects.select_related('guide', 'updatedBy').all()

    estatus = get_object_or_404(queryset, pk=pk)

    serializer = self.serializer_class(estatus, data=request.data, partial=False)

    ifserializer.is_valid():

    serializer.save(updatedBy=request.user)

    message = f"Estatus con id {pk} actualizado con éxito"

    returnResponse({"message": message, "data": serializer.data}, status=status.HTTP_200_OK)

    returnResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Dado que solo manejamos un campo en realidad, no tiene sentido usar partial_update

    defdestroy(self, request, pk=None):

    """Eliminar un estatus"""

    queryset = Estatus.objects.all()

    estatus = get_object_or_404(queryset, pk=pk)

    estatus.delete()

    returnResponse(

    {'message': f'Estatus con id {pk} eliminado correctamente'},

    status=status.HTTP_204_NO_CONTENT

    )

    # Una url especial para hacer retrive por el trackingNumber

    @action(detail=False, methods=['get'], url_path='by-tracking/(?P`<tracking>`[^/.]+)')

    defby_tracking(self, request, tracking=None):

    """Endpoint dedicado para buscar por tracking"""

    queryset = Estatus.objects.select_related('guide', 'updatedBy').filter(

    guide__trackingNumber__iexact=tracking

    ).order_by('-timestamp')

    ifnotqueryset.exists():

    returnResponse(

    {'error': f'No se encontraron estatus para el tracking: {tracking}'},

    status=status.HTTP_404_NOT_FOUND

    )

    serializer = self.serializer_class(queryset, many=True)

    returnResponse({

    'tracking': tracking,

    'count': queryset.count(),

    'results': serializer.data

    })

#### Prueba del método create

- http://localhost:8000/api/v1/users/

![1760926869110](image/readme/1760926869110.png)

![1760926934577](image/readme/1760926934577.png)

![1760926962423](image/readme/1760926962423.png)

Probando los campos de contraseña

![1760927053434](image/readme/1760927053434.png)

![1760927082283](image/readme/1760927082283.png)

Probando el campo email

![1760927120145](image/readme/1760927120145.png)

#### Probando método update

- http://localhost:8000/api/v1/users/2/

Antes

![1760927243127](image/readme/1760927243127.png)

Después

![1760927274754](image/readme/1760927274754.png)

![1760927303338](image/readme/1760927303338.png)

Validando campos nuevamente

Campo email

![1760927387855](image/readme/1760927387855.png)

Campos de contraseñas

![1760927456048](image/readme/1760927456048.png)

![1760927476573](image/readme/1760927476573.png)

#### Prueba del método partial_update

- http://localhost:8000/api/v1/users/2/

Probamos con un email no valido

![1760927731574](image/readme/1760927731574.png)

![1760927750342](image/readme/1760927750342.png)

Probamos con un email válido

![1760927811746](image/readme/1760927811746.png)

![1760927863562](image/readme/1760927863562.png)

![1760927938189](image/readme/1760927938189.png)

#### Prueba del método destroy

- http://localhost:8000/api/v1/users/2/

![1760927997650](image/readme/1760927997650.png)

![1760928012371](image/readme/1760928012371.png)

- http://localhost:8000/api/v1/users/

Ya no está el ID 2

![1760928057670](image/readme/1760928057670.png)


### Probando las vistas EstatusViewset

#### Probando método list

- http://localhost:8000/api/v1/estatus/

![1760928159808](image/readme/1760928159808.png)

Probamos el path para listar los tracking

- http://localhost:8000/api/v1/estatus/by-tracking/1111111111/

![1760928246260](image/readme/1760928246260.png)

#### Probando método create

- http://localhost:8000/api/v1/estatus/

![1760928400858](image/readme/1760928400858.png)

![1760928416211](image/readme/1760928416211.png)

![1760928443227](image/readme/1760928443227.png)

Probamos un estatus no valido

![1760928516790](image/readme/1760928516790.png)

#### Probando método retrive

- http://localhost:8000/api/v1/estatus/61/

![1760928592355](image/readme/1760928592355.png)

#### Probando el método update

- http://localhost:8000/api/v1/estatus/61/

![1760928719647](image/readme/1760928719647.png)

![1760928773149](image/readme/1760928773149.png)

#### Probando el método destroy

- http://localhost:8000/api/v1/estatus/61/

![1760929050113](image/readme/1760929050113.png)

![1760929067691](image/readme/1760929067691.png)

![1760929186076](image/readme/1760929186076.png)

## Uso de renderers

Dejaré los renderers preparados para producción para cuando esté integrando este backend con el fronted, aqui solo probaré que funcionan, pero al terminar los comentaré

- \houndxpress3\src\config\settings.py

```
REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ]
}
```

![1760929373793](image/readme/1760929373793.png)


![1760929482936](image/readme/1760929482936.png)

![1760929505298](image/readme/1760929505298.png)

## Notas adicionales

Podríamos ir más allá e incluir paginación, y autorización por JWT, pero quiza me he explayado en esta activida, lo dejaré pendiente
