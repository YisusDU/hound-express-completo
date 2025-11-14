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

## CORS

Como aprendimos en el proyecto pasado, es necesario instalar CORS antes de intentar peticiones desde el frontend al backend, pues será bloqueadas por el el navegador

Comando para instalar cors en el backend, con la consola del contenedor y debemos añadirlo al listado de requerimientos

> `pip install django-cors-headers`

Lo añadimos a los requerimientos

- proyect-partner-company-m66\02-backend\houndxpress3\pyproject.toml

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
  "django-cors-headers==4.9.0"
]

[tool.ruff]
line-length = 79

[tool.ruff.lint]
extend-select = ["I", "SIM"]

```

Lo añadimos en el settings a las apps instaladas

- \proyect-partner-company-m66\02-backend\houndxpress3\src\config\settings.py

```python
# Application definitions
INSTALLED_APPS = [
    'corsheaders', #<--- Para cors
    "rest_framework", 
    "api.apps.ApiConfig", 
    "houndexpress.apps.HoundexpressConfig", 
    "pages.apps.PagesConfig",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]
```

Lo añadimos al middleware del mismo settings.py

- \proyect-partner-company-m66\02-backend\houndxpress3\src\config\settings.py

```python
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    'corsheaders.middleware.CorsMiddleware', # <--- CORS
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]
```

Y los dominios permitidos

- \proyect-partner-company-m66\02-backend\houndxpress3\src\config\settings.py

```python
# Lista de dominios que pueden hacer peticiones
CORS_ALLOWED_ORIGINS = [
    "https://yisusdu.github.io",  # Tu frontend en producción
    "http://localhost:3000",         # Tu frontend local
]
```

# Crear guías

Considero que podemos hacer primero lo necesario para hacer las peticiones HTTP Post para crear guías, con el mismo formulario, peeero modificandolo un poco,pues la hora y el día se agregan en automático

### Serializer

Hice una pequeña correción en el serializer para que el campo de created_at no sea parte del formulario pero sí sea visible

- \proyect-partner-company-m66\02-backend\houndxpress3\src\houndexpress\serializers.py

```python
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
        read_only_fields = ['id', "current_status", "created_at",]
```

### Carpeta para evitar hardcodear términos

He copiado y agregado a src la carpeta que usamos para constantes y acciones asíncronas

### Carpeta con dirección url base de la API

Para evitar repetir la dirección de la api todo el tiempo, creamos una carpeta api en src con el siguiente archivo el cual nos pide instalar axios

- \proyect-partner-company-m66\01-frontend\houndxpress2\src\api\index.ts

```ts
import axios from "axios";

// 1. Obtenemos la variable de entorno (versión CRA)
const API_URL = process.env.REACT_APP_API_BASE_URL;

// 2. Validamos que exista
if (!API_URL) {
  console.error(
    "¡Error! REACT_APP_API_BASE_URL no está definida en el archivo .env"
  );
  // Lanzar un error detiene la ejecución de la app si la API es crítica
  throw new Error(
    "Configuración de entorno faltante: REACT_APP_API_BASE_URL"
  );
}

// 3. Si existe, la usamos con confianza
const api = axios.create({
  baseURL: API_URL,
});

export default api;
```

#### .env

Para el archivo anterior, dependemos de un archivo de entorno, el cual creamos  y deifinimos en src

- \proyect-partner-company-m66\01-frontend\houndxpress2\.env

```env
REACT_APP_API_BASE_URL=http://127.0.0.1:8000
```

Y añadimos la excepción al gitignore

- \proyect-partner-company-m66\01-frontend\houndxpress2\.gitignore

```gitignore
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# production
/build

# misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Variables de entorno locales
.env

```

Ahora sí instalamos axios

> npm install axios

### guides.slices.ts

Se crea el thunk para crear Guías

- \proyect-partner-company-m66\01-frontend\houndxpress2\src\state\guides.slice.ts

```ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  ApiCreateGuide,
  ApiError,
  GuideFormPayload,
  GuidesState,
  InfoModalData,
} from "./types";
import { Guide } from "../types/guides";
import { GuideStage } from "../components/GuideReguister/types";
import { CREATE_GUIDE } from "../constants/actionTypes";
import axios from "axios";
import api from "../api";
import { ASYNC_STATUS } from "../constants/asyncStatus";

// Peticiones asíncronas
export const createGuide = createAsyncThunk<
  ApiCreateGuide,
  GuideFormPayload,
  { rejectValue: ApiError | string }
>(CREATE_GUIDE, async (guidePayload, { rejectWithValue }) => {
  try {
    const response = await api.post<ApiCreateGuide>(
      "/api/v1/guides/",
      guidePayload
    );
    return response.data;
  } catch (error) {
    // 1. Verificamos si es un error de Axios
    if (axios.isAxiosError(error)) {
      // 2. Si NO hay 'error.response', es un error de red
      if (!error.response) {
        return rejectWithValue(error.message); // error.message es un string
      }

      // 3. Si SÍ hay 'error.response', es un error del backend (4xx, 5xx)
      // Sabemos que 'error.response.data' será de tipo 'ApiError'
      return rejectWithValue(error.response.data as ApiError);
    } else {
      // No es un error de Axios (ej. un error de sintaxis en el 'try')
      return rejectWithValue("Ocurrió un error inesperado");
    }
  }
});

//Global Initial State
const initialState: GuidesState = {
  guides: [
    {
      guide__number: "12345678",
      guide__origin: "Detroit",
      guide__destination: "Atlanta",
      guide__recipient: "Rick",
      guide__stage: [
        {
          guide__date: "2025-05-25",
          guide__status: "Pendiente",
          guide__hour: "12:34",
        },
      ],
    },
    {
      guide__number: "12345",
      guide__origin: "Ciudad A",
      guide__destination: "Ciudad B",
      guide__recipient: "Persona X",
      guide__stage: [
        {
          guide__date: "2023-10-01",
          guide__status: "Pendiente",
          guide__hour: "09:15",
        },
        {
          guide__date: "2023-10-02",
          guide__status: "En tránsito",
          guide__hour: "17:42",
        },
      ],
    },
    {
      guide__number: "67890",
      guide__origin: "Ciudad C",
      guide__destination: "Ciudad D",
      guide__recipient: "Persona Y",
      guide__stage: [
        {
          guide__date: "2023-10-01",
          guide__status: "Pendiente",
          guide__hour: "08:23",
        },
        {
          guide__date: "2023-10-02",
          guide__status: "En tránsito",
          guide__hour: "19:08",
        },
      ],
    },
    {
      guide__number: "54321",
      guide__origin: "Ciudad E",
      guide__destination: "Ciudad F",
      guide__recipient: "Persona Z",
      guide__stage: [
        {
          guide__date: "2023-09-28",
          guide__status: "Pendiente",
          guide__hour: "10:55",
        },
        {
          guide__date: "2023-09-29",
          guide__status: "En tránsito",
          guide__hour: "14:27",
        },
        {
          guide__date: "2023-09-30",
          guide__status: "Entregado",
          guide__hour: "18:36",
        },
      ],
    },
    {
      guide__number: "98765",
      guide__origin: "Ciudad G",
      guide__destination: "Ciudad H",
      guide__recipient: "Persona N",
      guide__stage: [
        {
          guide__date: "2023-10-03",
          guide__status: "Pendiente",
          guide__hour: "15:02",
        },
      ],
    },
  ],
  menuDisplay: false,
  modalData: { guideNumber: "", typeModal: "" },
  status: ASYNC_STATUS.IDLE,
  error: null,
};

const guidesSlice = createSlice({
  name: "guidesState",
  initialState,
  reducers: {
    addGuide: (state, action: PayloadAction<Guide>) => {
      state.guides.unshift(action.payload);
    },
    updateGuide: (state, action: PayloadAction<GuideStage>) => {
      const guide = state.guides.find(
        (g) => g.guide__number === state.modalData.guideNumber
      );
      if (guide) {
        guide.guide__stage.push(action.payload);
      }
    },
    toggleMenu: (state, action: PayloadAction<boolean>) => {
      state.menuDisplay = action.payload;
    },
    changeModalData: (state, action: PayloadAction<InfoModalData>) => {
      state.modalData = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createGuide.pending, (state) => {
        state.status = ASYNC_STATUS.PENDING;
      })
      .addCase(createGuide.fulfilled, (state) => {
        state.status = ASYNC_STATUS.FULFILLED;
      })
      .addCase(createGuide.rejected, (state, action) => {
        state.status = ASYNC_STATUS.REJECTED;
        // Si usas rejectWithValue, el error viene en .payload
        if (action.payload) {
          state.error = action.payload;
        } else {
          // Si es un error no manejado, usa .error.message
          state.error = action.error.message || "Ocurrió un error desconocido";
        }
      });
  },
});

//Actions by name
export const { addGuide, toggleMenu, changeModalData, updateGuide } =
  guidesSlice.actions;

//Reducer for the store
export default guidesSlice.reducer;

```

### types de redux

Se actualizó el archivo de tipos para permitir a redux saber el tipado del thunk

- \proyect-partner-company-m66\01-frontend\houndxpress2\src\state\types.ts

```ts
import { Guide } from "../types/guides";

export interface GuidesState {
  guides: Guide[];
  menuDisplay: boolean;
  modalData: InfoModalData;
  status: string;
  error: ApiError | null,
}

export interface InfoModalData {
  guideNumber: string | "";
  typeModal: "History" | "Update" | "";
}

// Lo que la API devuelve al crear una guía
export interface ApiCreateGuide {
  id: number;
  guide_number: string;
  guide_origin: string;
  guide_destination: string;
  guide_recipient: string;
  current_status: string;
  created_at: string;
  updated_at: string;
}

// Lo que el formulario envía (el payload)
// Nota: no enviamos 'id' ni 'current_status'
export type GuideFormPayload = {
  guide_number: string;
  guide_origin: string;
  guide_destination: string;
  guide_recipient: string;
};

export interface ApiError {
  [key: string]: string[] | string;
}

```

### Custom hook useGuideRegister.ts

Este hook se utiliza para validar el formulario antes de enviarse y llama la el thunk para crear guias, se recortó y ajustó para las nuevas mecánicas

- \proyect-partner-company-m66\01-frontend\houndxpress2\src\hooks\useGuideRegister.ts

```ts
import React from "react";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "./useStoreTypes";
import { addGuide, createGuide } from "../state/guides.slice";
import validateFields from "./useValidateFields";
import { Guide } from "../types/guides";
import { ApiError, GuideFormPayload } from "../state/types";

const useGuideRegister = () => {
  const error = useAppSelector((state) => state.guides.error);
  const status = useAppSelector((state) => state.guides.status);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  //Redux dispatch:
  const dispatch = useAppDispatch();
  const guides = useAppSelector((state) => state.guides.guides);

  const handleValidate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    //Validate the guide number
    const guideNumber = (formData.get("guide__number") as string)?.trim();

    const existingGuide = guides.some(
      (guide: Guide) => guide["guide__number"] === guideNumber
    );
    // console.log("existingGuide", existingGuide);

    if (existingGuide) {
      // console.log("existingGuide", existingGuide);
      // console.log("The guide number is valid?", isValidNumber)
      setErrors({ guide__number: "El número de guía ya existe" });
      return;
    } else {
      // console.log("the guide number is valid")
    }

    //validate all the fields empty
    const requiredFields = [
      "guide__number",
      "guide__origin",
      "guide__destination",
      "guide__recipient",
    ];

    const { isValid } = validateFields(requiredFields, formData, setErrors);

    //Validate if the form is valid to go ahead
    // console.log("Formulario válido:", validForm ? "true" : "false");
    if (!isValid) {
      e.preventDefault();
      return;
    }

    //Take the info into an object
    const guideData: GuideFormPayload = {
      guide_number: (formData.get("guide__number") as string)?.trim() || "",
      guide_origin: (formData.get("guide__origin") as string)?.trim() || "",
      guide_destination:
        (formData.get("guide__destination") as string)?.trim() || "",
      guide_recipient:
        (formData.get("guide__recipient") as string)?.trim() || "",
    };

    //Redux dispatch:
    // dispatch(addGuide(guideData));

    try {
      await dispatch(createGuide(guideData)).unwrap();
      alert("Guía registrada con éxito");
      //clean the form
      form.reset();
    } catch (rejectedValue) {
      console.error("Falló al crear la guía:", rejectedValue);
      alert("There was an error creating your order. Please try again.");
      if (typeof rejectedValue === "object" && rejectedValue !== null) {
        // Transforma el ApiError en el estado de errores local
        const backendErrors: { [key: string]: string } = {};
        for (const [key, value] of Object.entries(rejectedValue as ApiError)) {
          // Asumimos que los nombres de campo coinciden (ej. guide_number)
          // y tomamos solo el primer mensaje de error
          const newKey = `guide__${key.split("_")[1]}`; // Transforma 'guide_number' a 'guide__number'
          if (Array.isArray(value)) {
            backendErrors[newKey] = value[0];
          }
        }
        setErrors(backendErrors);
      } else {
        // Es un error de string genérico, no lo podemos poner en un campo
        // 'renderServerError' lo mostrará de todas formas.
        console.log("Error de servidor genérico:", rejectedValue);
      }
    }
  };

  // Esta función decide cómo renderizar el error
  const renderServerError = () => {
    // Si no hay error, no renderiza nada
    if (!error) return null;

    // --- CASO 1: El error es un string simple ---
    // (Ej: "Network Error", "No encontrado", etc.)
    if (typeof error === "string") {
      return (
        <div className="server-error" role="alert">
          {error}
        </div>
      );
    }

    // --- CASO 2: El error es un objeto ApiError ---
    // (Ej: { guide_number: ["Este campo..."], ... })
    // Lo recorremos y mostramos cada error de campo
    return (
      <div className="server-error" role="alert">
        <strong>Por favor, corrige los siguientes errores:</strong>
        <ul>
          {Object.entries(error).map(([field, messages]) => (
            <li key={field}>
              {/* `messages` puede ser string[] o string (para "detail") */}
              {Array.isArray(messages) ? (
                messages.map((msg, idx) => <span key={idx}>{msg}</span>)
              ) : (
                <span>{messages}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return { errors, handleValidate, setErrors, renderServerError };
};

export { useGuideRegister };

```

### Componente GuideRegister

El componente se actualizó para eliminar los campos innecesarios como de la fecha hora y estado inicial, pues se definen en automático por el backend

- \proyect-partner-company-m66\01-frontend\houndxpress2\src\components\GuideReguister\index.tsx

```ts
import React from "react";
import Paws from "../../assets/IMG/paw-solid.svg";
import { useGuideRegister } from "../../hooks/useGuideRegister";
import {
  GuideRegisterContainer,
  GuideContainer,
  GuideForm,
  GuideSubmit,
  GuideAnimation,
} from "./styles";
import { useCleanErrorOnFocus } from "../../hooks/useCleanErrorOnFocus";
import { useAppSelector } from "../../hooks/useStoreTypes";
import { ASYNC_STATUS } from "../../constants/asyncStatus";

const GuideRegister = () => {
  const { errors, handleValidate, setErrors, renderServerError } = useGuideRegister();
  const cleanErrorOnFocus = useCleanErrorOnFocus(errors, setErrors);
  

  return (
    <GuideRegisterContainer className="guide__register" id="guide__register">
      {/* <!--Formulario--> */}
      <GuideContainer className="guide__container">
        <h2 className="guide__title">Registro de guías</h2>
        <GuideForm
          className="guide__form"
          action="#"
          onSubmit={handleValidate}
          role="form"
        >
          <label className="guide__form--label" htmlFor="guide__number">
            Número de guía:
          </label>
          <input
            className="guide__form--input"
            id="guide__number"
            name="guide__number"
            type="text"
            inputMode="numeric"
            pattern="\d{1,8}"
            maxLength={8}
            placeholder="Número de guía:"
            aria-label="Añade un número de guía de máximo 8 caracteres"
            title="Añade un número de guía de máximo 8 caracteres"
            onFocus={cleanErrorOnFocus}
            aria-required="true"
            aria-invalid={errors.guide__number ? "true" : "false"}
            aria-describedby={
              errors.guide__number ? errors.guide__number : undefined
            }
          />
          <span className="error-message" role="alert" aria-live="polite">
            {errors.guide__number}
          </span>

          <label className="guide__form--label" htmlFor="guide__origin">
            Origen del envío:
          </label>
          <input
            className="guide__form--input"
            id="guide__origin"
            name="guide__origin"
            type="text"
            inputMode="text"
            maxLength={30}
            placeholder="Origen del envío:"
            aria-label="Origen del envío:"
            title="Añade la ciudad de origen"
            onFocus={cleanErrorOnFocus}
            aria-required="true"
            aria-invalid={errors.guide__origin ? "true" : "false"}
            aria-describedby={
              errors.guide__origin ? errors.guide__origin : undefined
            }
          />
          <span className="error-message" role="alert" aria-live="polite">
            {errors.guide__origin}
          </span>

          <label className="guide__form--label" htmlFor="guide__destination">
            Destino del envío:
          </label>
          <input
            className="guide__form--input"
            id="guide__destination"
            name="guide__destination"
            type="text"
            inputMode="text"
            maxLength={30}
            placeholder="Destino del envío:"
            aria-label="Añade el destino del envío:"
            title="Añade la ciudad de destino"
            onFocus={cleanErrorOnFocus}
            aria-required="true"
            aria-invalid={errors.guide__destination ? "true" : "false"}
            aria-describedby={
              errors.guide__destination ? errors.guide__destination : undefined
            }
          />
          <span className="error-message" role="alert" aria-live="polite">
            {errors.guide__destination}
          </span>

          <label className="guide__form--label" htmlFor="guide__recipient">
            Destinatario:
          </label>
          <input
            className="guide__form--input"
            id="guide__recipient"
            name="guide__recipient"
            type="text"
            inputMode="text"
            maxLength={30}
            placeholder="Destinatario:"
            aria-label="Añade el nombre y apellido del destinatario"
            title="Añade el nombre y apellido del destinatario"
            onFocus={cleanErrorOnFocus}
            aria-required="true"
            aria-invalid={errors.guide__recipient ? "true" : "false"}
            aria-describedby={
              errors.guide__recipient ? errors.guide__recipient : undefined
            }
          />
          <span className="error-message" role="alert" aria-live="polite">
            {errors.guide__recipient}
          </span>
          <br />
          <GuideSubmit
            className="guide__form--submit"
            type="submit"
            role="button"
            aria-label="Enviar formulario"
            title="Enviar formulario"
          >
            Enviar
          </GuideSubmit>
        </GuideForm>
      </GuideContainer>

      {/* <!--Animacion--> */}
      <GuideAnimation className="guide__animation">
        <img
          className="guide__svg guide__svg--left"
          src={Paws}
          alt="Huella de perro"
          aria-hidden="true"
        />
        <img
          className="guide__svg guide__svg--right"
          src={Paws}
          alt="Huella de perro"
          aria-hidden="true"
        />
        <img
          className="guide__svg guide__svg--left"
          src={Paws}
          alt="Huella de perro"
          aria-hidden="true"
        />
        <img
          className="guide__svg guide__svg--right"
          src={Paws}
          alt="Huella de perro"
          aria-hidden="true"
        />
        <img
          className="guide__svg guide__svg--left"
          src={Paws}
          alt="Huella de perro"
          aria-hidden="true"
        />
      </GuideAnimation>
      {status === ASYNC_STATUS.REJECTED && renderServerError()}
    </GuideRegisterContainer>
  );
};

export default GuideRegister;

```

### Tests de App

Dado que modificamos el estado inicial del Slice, me fallaron las pruebas de la app y no me dejó reenderizar hasta corregirlo, por lo que añadí los campos que faltaban

- \proyect-partner-company-m66\01-frontend\houndxpress2\src\App\__test__\App.test.tsxconst defaultState: GuidesState = {

## Listar guías

Creí que listar guías sería un buen siguiente paso, pero creo que comenzarlo, significa refactorizar todo lo demás, ni modo, tarde o temprano se tendría que hacer

### actionTypes.ts

se agrega el nuevo action type para fetchGuides

- \proyect-partner-company-m66\01-frontend\houndxpress2\src\constants\actionTypes.ts

```ts
// También se puede hacer con objetos, es tan solo una variante
export const CREATE_GUIDE = "guide/createGuide";
export const FETCH_GUIDES = "guide/fetchGuides";

```

### Guides.Slices

Añadí el thunk junto con sus extrareducers y comenté las acciones addGuide y updateGuide

- \proyect-partner-company-m66\01-frontend\houndxpress2\src\state\guides.slice.ts

```ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  ApiError,
  ApiGuidePayload,
  GuideFormPayload,
  GuidesState,
  InfoModalData,
} from "./types";
import { Guide } from "../types/guides";
import { GuideStage } from "../components/GuideReguister/types";
import { CREATE_GUIDE, FETCH_GUIDES } from "../constants/actionTypes";
import axios from "axios";
import api from "../api";
import { ASYNC_STATUS } from "../constants/asyncStatus";

// Peticiones asíncronas

// Crear guías
export const createGuide = createAsyncThunk<
  ApiGuidePayload,
  GuideFormPayload,
  { rejectValue: ApiError | string }
>(CREATE_GUIDE, async (guidePayload, { rejectWithValue }) => {
  try {
    const response = await api.post<ApiGuidePayload>(
      "/api/v1/guides/",
      guidePayload
    );
    return response.data;
  } catch (error) {
    // 1. Verificamos si es un error de Axios
    if (axios.isAxiosError(error)) {
      // 2. Si NO hay 'error.response', es un error de red
      if (!error.response) {
        return rejectWithValue(error.message); // error.message es un string
      }

      // 3. Si SÍ hay 'error.response', es un error del backend (4xx, 5xx)
      // Sabemos que 'error.response.data' será de tipo 'ApiError'
      return rejectWithValue(error.response.data as ApiError);
    } else {
      // No es un error de Axios (ej. un error de sintaxis en el 'try')
      return rejectWithValue("Ocurrió un error inesperado");
    }
  }
});

// Listar guías
export const fetchGuides = createAsyncThunk<
  ApiGuidePayload[],
  void,
  { rejectValue: ApiError | string }
>(FETCH_GUIDES, async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<ApiGuidePayload[]>("/api/v1/guides/");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue(error.response.data as ApiError);
    } else {
      return rejectWithValue("Ocurrió un error inesperado");
    }
  }
});

//Global Initial State
const initialState: GuidesState = {
  guides: [],
  menuDisplay: false,
  modalData: { guideNumber: "", typeModal: "" },
  status: ASYNC_STATUS.IDLE,
  error: null,
};

const guidesSlice = createSlice({
  name: "guidesState",
  initialState,
  reducers: {
    // addGuide: (state, action: PayloadAction<Guide>) => {
    //   state.guides.unshift(action.payload);
    // },
    // updateGuide: (state, action: PayloadAction<GuideStage>) => {
    //   const guide = state.guides.find(
    //     (g) => g.guide_number === state.modalData.guideNumber
    //   );
    //   if (guide) {
    //     guide.guide_stage.push(action.payload);
    //   }
    // },
    toggleMenu: (state, action: PayloadAction<boolean>) => {
      state.menuDisplay = action.payload;
    },
    changeModalData: (state, action: PayloadAction<InfoModalData>) => {
      state.modalData = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Crear guías
      .addCase(createGuide.pending, (state) => {
        state.status = ASYNC_STATUS.PENDING;
      })
      .addCase(createGuide.fulfilled, (state) => {
        state.status = ASYNC_STATUS.FULFILLED;
      })
      .addCase(createGuide.rejected, (state, action) => {
        state.status = ASYNC_STATUS.REJECTED;
        // Si usas rejectWithValue, el error viene en .payload
        if (action.payload) {
          state.error = action.payload;
        } else {
          // Si es un error no manejado, usa .error.message
          state.error = action.error.message || "Ocurrió un error desconocido";
        }
      })
      // Listar guías
      .addCase(fetchGuides.pending, (state) => {
        state.status = ASYNC_STATUS.PENDING;
      })
      .addCase(fetchGuides.fulfilled, (state, action) => {
        state.status = ASYNC_STATUS.FULFILLED;
        state.guides = action.payload;
      })
      .addCase(fetchGuides.rejected, (state, action) => {
        state.status = ASYNC_STATUS.REJECTED;
        if (action.payload) {
          state.error = action.payload;
        } else {
          state.error = action.error.message || "Ocurrió un error desconocido";
        }
      });
  },
});

//Actions by name
export const { /* addGuide, */ toggleMenu, changeModalData /* updateGuide */ } =
  guidesSlice.actions;

//Reducer for the store
export default guidesSlice.reducer;

```

### Types.ts

Ajustamos un poco los tipos para que coincidan con la petición fetchGuides

- \proyect-partner-company-m66\01-frontend\houndxpress2\src\state\types.ts

```ts
import { Guide } from "../types/guides";

export interface GuidesState {
  guides: ApiGuidePayload[];
  menuDisplay: boolean;
  modalData: InfoModalData;
  status: string;
  error: ApiError | string | null,
}

export interface InfoModalData {
  guideNumber: string | "";
  typeModal: "History" | "Update" | "";
}

// Lo que la API devuelve al crear una guía
export interface ApiGuidePayload {
  id: number;
  guide_number: string;
  guide_origin: string;
  guide_destination: string;
  guide_recipient: string;
  current_status: string;
  created_at: string;
  updated_at: string;
}

// Lo que el formulario envía (el payload)
// Nota: no enviamos 'id' ni 'current_status'
export type GuideFormPayload = {
  guide_number: string;
  guide_origin: string;
  guide_destination: string;
  guide_recipient: string;
};

export interface ApiError {
  [key: string]: string[] | string;
}

```

### GuideList.ts

Actualizamos el componente para que lea correctamente las propiedades de cada guía con la nueva estructura y utilice un componente para reenderizar posibles errores del servidor

- \proyect-partner-company-m66\01-frontend\houndxpress2\src\components\GuideList\index.tsx

```tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  GuideListContainer,
  GuideFilter,
  GuideTable,
  TableHeader,
  TableData,
  TableButtonsContainer,
} from "./styles";
import useDraggTable from "../../hooks/useDraggTable";
import { useAppSelector, useAppDispatch } from "../../hooks/useStoreTypes";
import { changeModalData, fetchGuides } from "../../state/guides.slice";
import { useModalGuides } from "../../hooks/useModalGuides";
import { ASYNC_STATUS } from "../../constants/asyncStatus";
import ServerError from "../ServerError";

const GuideList = () => {
  //Variables to aply some filter
  const [filter, setFilter] = useState<string>("");

  //Function to dragg the table on scroll, it needs styles of overflow
  const tableRef = useDraggTable();

  //Redux state
  const guides = useAppSelector((state) => state.guides.guides);
  const status = useAppSelector((state) => state.guides.status);
  const error = useAppSelector((state) => state.guides.error);
  const dispatch = useAppDispatch();
  const updateButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  type ModalType = "History" | "Update";

  const openModal = (guide: string, type: ModalType) => {
    dispatch(changeModalData({ guideNumber: guide, typeModal: type }));

    // Guardar el botón activo para usarlo luego
  };

  // Disparamos la operación asíncrona para listar guías
  useEffect(() => {
    status === ASYNC_STATUS.IDLE && dispatch(fetchGuides());
  }, [dispatch, status]);

  // Filtrar guías por estatus
  const filteredGuides = useMemo(() => {
    const cleanFilter = filter.toLowerCase();

    // Si el filtro está vacío, devuelve todas
    if (cleanFilter === "") {
      return guides;
    }

    // Si no, filtra por coincidencia exacta
    return guides.filter((g) => g.current_status.toLowerCase() === cleanFilter);
  }, [guides, filter]);

  //Function for accesibility of aria-expanded
  const [ariaExpanded, setAriaExpanded] = useState(false);
  const modalFilled1 = useAppSelector(
    (state) => state.guides.modalData.guideNumber
  );
  const modalFilled2 = useAppSelector(
    (state) => state.guides.modalData.typeModal
  );

  useEffect(() => {
    if (modalFilled1 === "" && modalFilled2 === "") {
      setAriaExpanded(false);
    } else {
      setAriaExpanded(true);
    }
  }, [modalFilled1, modalFilled2]);

  return (
    /* <!--Lista de guías--> */
    <GuideListContainer className="guide__list" id="guide__list">
      <h2 className="list__title">Lista de guías</h2>
      <GuideFilter role="form" action="#" onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="filterState">Filtrar por estado de envío:</label>
        <select
          name="filterState"
          id="filterState"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          aria-controls="mainTable"
          aria-label="Filtrar por estado de envío:"
          title="Filtrar por estado de envío:"
        >
          <option value="">Mostrar todos</option>
          <option value="Pendiente">Pendientes</option>
          <option value="En tránsito">En tránsito</option>
          <option value="Entregado">Entregados</option>
        </select>
        <button
          type="button"
          onClick={() => setFilter("")}
          role="button"
          aria-label="Limpiar filtro"
          title="Limpiar filtro"
          aria-controls="mainTable"
        >
          Limpiar filtro
        </button>
      </GuideFilter>
      <section ref={tableRef} className="list__tableContainer">
        <GuideTable id="mainTable" className="guide__table" cellPadding={5}>
          <TableHeader className="table__header">
            <tr className="table__header--row">
              <th className="guide__table--header">Número de guía</th>
              <th className="guide__table--header">Estado actual</th>
              <th className="guide__table--header">Origen</th>
              <th className="guide__table--header">Destino</th>
              <th className="guide__table--header">Destinatario</th>
              <th className="guide__table--header">
                Fecha de la última actualización.
              </th>
              <th className="guide__table--header">Opciones</th>
            </tr>
          </TableHeader>
          <tbody data-testid="table-body" className="table__body">
            {status === ASYNC_STATUS.FULFILLED &&
              filteredGuides.map((g, index) => (
                <tr className="guide__table--row" key={g.guide_number}>
                  <TableData
                    className="guide__table--data"
                    data-label="Número de guía"
                  >
                    {g.guide_number}
                  </TableData>

                  <TableData
                    className="guide__table--data"
                    data-label="Estado actual"
                  >
                    {g.current_status}
                  </TableData>

                  <TableData className="guide__table--data" data-label="Origen">
                    {g.guide_origin}
                  </TableData>

                  <TableData
                    className="guide__table--data"
                    data-label="Destino"
                  >
                    {g.guide_destination}
                  </TableData>

                  <TableData
                    className="guide__table--data"
                    data-label="Destinatario"
                  >
                    {g.guide_recipient}
                  </TableData>

                  <TableData className="guide__table--data" data-label="Fecha">
                    {g.updated_at}
                  </TableData>

                  <TableButtonsContainer
                    className="guide__table--data list__buttonsContainer"
                    data-label="Opciones"
                  >
                    <button
                      ref={(el) => {
                        updateButtonRefs.current[index] = el;
                      }}
                      className="guide__button guideButton--seeHistory"
                      onClick={() => openModal(g.guide_number, "History")}
                      type="button"
                      role="button"
                      aria-label={`Ver historial de la guía ${g.guide_number}`}
                      title={`Ver historial de la guía ${g.guide_number}`}
                      aria-haspopup="dialog"
                      aria-controls="modalHistory"
                      aria-expanded={ariaExpanded ? true : false}
                    >
                      Ver Historial
                    </button>
                    <button
                      ref={(el) => {
                        updateButtonRefs.current[index] = el;
                      }}
                      className="guide__button guide__button--updateState"
                      onClick={() => openModal(g.guide_number, "Update")}
                      type="button"
                      role="button"
                      aria-label={`Actualizar estado de la guía ${g.guide_number}`}
                      title={`Actualizar estado de la guía ${g.guide_number}`}
                      aria-haspopup="dialog"
                      aria-controls="modalUpdate"
                      aria-expanded={ariaExpanded ? true : false}
                    >
                      Actualizar Estado
                    </button>
                  </TableButtonsContainer>
                </tr>
              ))}
            {status === ASYNC_STATUS.PENDING && (
              <div>
                <h2>Loading... 🥱</h2>
              </div>
            )}
            {status === ASYNC_STATUS.REJECTED && <ServerError error={error} />}
          </tbody>
        </GuideTable>
      </section>
    </GuideListContainer>
  );
};

export default GuideList;

```

### Correción de hook useGuideRegister

Dado que cambiamos el tipado de initial state para las guías, fue necesario decir al hook el nuevo tipado y además removimos la función que retornaba un tsx para volverla un componente

- \proyect-partner-company-m66\01-frontend\houndxpress2\src\hooks\useGuideRegister.tsx

```ts
import React from "react";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "./useStoreTypes";
import { /* addGuide, */ createGuide } from "../state/guides.slice";
import validateFields from "./useValidateFields";
import { ApiError, ApiGuidePayload, GuideFormPayload } from "../state/types";

const useGuideRegister = () => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  //Redux dispatch:
  const dispatch = useAppDispatch();
  const guides = useAppSelector((state) => state.guides.guides);

  const handleValidate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    //Validate the guide number
    const guideNumber = (formData.get("guide__number") as string)?.trim();

    const existingGuide = guides.some(
      (guide: ApiGuidePayload) => guide["guide_number"] === guideNumber
    );
    // console.log("existingGuide", existingGuide);

    if (existingGuide) {
      // console.log("existingGuide", existingGuide);
      // console.log("The guide number is valid?", isValidNumber)
      setErrors({ guide__number: "El número de guía ya existe" });
      return;
    } else {
      // console.log("the guide number is valid")
    }

    //validate all the fields empty
    const requiredFields = [
      "guide__number",
      "guide__origin",
      "guide__destination",
      "guide__recipient",
    ];

    const { isValid } = validateFields(requiredFields, formData, setErrors);

    //Validate if the form is valid to go ahead
    // console.log("Formulario válido:", validForm ? "true" : "false");
    if (!isValid) {
      e.preventDefault();
      return;
    }

    //Take the info into an object
    const guideData: GuideFormPayload = {
      guide_number: (formData.get("guide__number") as string)?.trim() || "",
      guide_origin: (formData.get("guide__origin") as string)?.trim() || "",
      guide_destination:
        (formData.get("guide__destination") as string)?.trim() || "",
      guide_recipient:
        (formData.get("guide__recipient") as string)?.trim() || "",
    };

    //Redux dispatch:
    // dispatch(addGuide(guideData));

    try {
      await dispatch(createGuide(guideData)).unwrap();
      alert("Guía registrada con éxito");
      //clean the form
      form.reset();
    } catch (rejectedValue) {
      console.error("Falló al crear la guía:", rejectedValue);
      alert("There was an error creating your order. Please try again.");
      if (typeof rejectedValue === "object" && rejectedValue !== null) {
        // Transforma el ApiError en el estado de errores local
        const backendErrors: { [key: string]: string } = {};
        for (const [key, value] of Object.entries(rejectedValue as ApiError)) {
          // Asumimos que los nombres de campo coinciden (ej. guide_number)
          // y tomamos solo el primer mensaje de error
          const newKey = `guide__${key.split("_")[1]}`; // Transforma 'guide_number' a 'guide__number'
          if (Array.isArray(value)) {
            backendErrors[newKey] = value[0];
          }
        }
        setErrors(backendErrors);
      } else {
        // Es un error de string genérico, no lo podemos poner en un campo
        // 'renderServerError' lo mostrará de todas formas.
        console.log("Error de servidor genérico:", rejectedValue);
      }
    }
  };

  return { errors, handleValidate, setErrors };
};

export { useGuideRegister };

```

### GuideRegister

Y reajustamos GuideRegister para utilizar el nuevo componente para reenderizar los errores

- \proyect-partner-company-m66\01-frontend\houndxpress2\src\components\GuideReguister\index.tsx

```tsx
import React from "react";
import Paws from "../../assets/IMG/paw-solid.svg";
import { useGuideRegister } from "../../hooks/useGuideRegister";
import {
  GuideRegisterContainer,
  GuideContainer,
  GuideForm,
  GuideSubmit,
  GuideAnimation,
} from "./styles";
import { useCleanErrorOnFocus } from "../../hooks/useCleanErrorOnFocus";
import { useAppSelector } from "../../hooks/useStoreTypes";
import { ASYNC_STATUS } from "../../constants/asyncStatus";
import ServerError from "../ServerError";

const GuideRegister = () => {
  const { errors, handleValidate, setErrors } = useGuideRegister();
  const cleanErrorOnFocus = useCleanErrorOnFocus(errors, setErrors);
  const status = useAppSelector((state) => state.guides.status);

  return (
    <GuideRegisterContainer className="guide__register" id="guide__register">
      {/* <!--Formulario--> */}
      <GuideContainer className="guide__container">
        <h2 className="guide__title">Registro de guías</h2>
        <GuideForm
          className="guide__form"
          action="#"
          onSubmit={handleValidate}
          role="form"
        >
          <label className="guide__form--label" htmlFor="guide__number">
            Número de guía:
          </label>
          <input
            className="guide__form--input"
            id="guide__number"
            name="guide__number"
            type="text"
            inputMode="numeric"
            pattern="\d{1,8}"
            maxLength={8}
            placeholder="Número de guía:"
            aria-label="Añade un número de guía de máximo 8 caracteres"
            title="Añade un número de guía de máximo 8 caracteres"
            onFocus={cleanErrorOnFocus}
            aria-required="true"
            aria-invalid={errors.guide__number ? "true" : "false"}
            aria-describedby={
              errors.guide__number ? errors.guide__number : undefined
            }
          />
          <span className="error-message" role="alert" aria-live="polite">
            {errors.guide__number}
          </span>

          <label className="guide__form--label" htmlFor="guide__origin">
            Origen del envío:
          </label>
          <input
            className="guide__form--input"
            id="guide__origin"
            name="guide__origin"
            type="text"
            inputMode="text"
            maxLength={30}
            placeholder="Origen del envío:"
            aria-label="Origen del envío:"
            title="Añade la ciudad de origen"
            onFocus={cleanErrorOnFocus}
            aria-required="true"
            aria-invalid={errors.guide__origin ? "true" : "false"}
            aria-describedby={
              errors.guide__origin ? errors.guide__origin : undefined
            }
          />
          <span className="error-message" role="alert" aria-live="polite">
            {errors.guide__origin}
          </span>

          <label className="guide__form--label" htmlFor="guide__destination">
            Destino del envío:
          </label>
          <input
            className="guide__form--input"
            id="guide__destination"
            name="guide__destination"
            type="text"
            inputMode="text"
            maxLength={30}
            placeholder="Destino del envío:"
            aria-label="Añade el destino del envío:"
            title="Añade la ciudad de destino"
            onFocus={cleanErrorOnFocus}
            aria-required="true"
            aria-invalid={errors.guide__destination ? "true" : "false"}
            aria-describedby={
              errors.guide__destination ? errors.guide__destination : undefined
            }
          />
          <span className="error-message" role="alert" aria-live="polite">
            {errors.guide__destination}
          </span>

          <label className="guide__form--label" htmlFor="guide__recipient">
            Destinatario:
          </label>
          <input
            className="guide__form--input"
            id="guide__recipient"
            name="guide__recipient"
            type="text"
            inputMode="text"
            maxLength={30}
            placeholder="Destinatario:"
            aria-label="Añade el nombre y apellido del destinatario"
            title="Añade el nombre y apellido del destinatario"
            onFocus={cleanErrorOnFocus}
            aria-required="true"
            aria-invalid={errors.guide__recipient ? "true" : "false"}
            aria-describedby={
              errors.guide__recipient ? errors.guide__recipient : undefined
            }
          />
          <span className="error-message" role="alert" aria-live="polite">
            {errors.guide__recipient}
          </span>
          <br />
          <GuideSubmit
            className="guide__form--submit"
            type="submit"
            role="button"
            aria-label="Enviar formulario"
            title="Enviar formulario"
          >
            Enviar
          </GuideSubmit>
        </GuideForm>
        {status === ASYNC_STATUS.REJECTED && <ServerError error={errors} />}
      </GuideContainer>

      {/* <!--Animacion--> */}
      <GuideAnimation className="guide__animation">
        <img
          className="guide__svg guide__svg--left"
          src={Paws}
          alt="Huella de perro"
          aria-hidden="true"
        />
        <img
          className="guide__svg guide__svg--right"
          src={Paws}
          alt="Huella de perro"
          aria-hidden="true"
        />
        <img
          className="guide__svg guide__svg--left"
          src={Paws}
          alt="Huella de perro"
          aria-hidden="true"
        />
        <img
          className="guide__svg guide__svg--right"
          src={Paws}
          alt="Huella de perro"
          aria-hidden="true"
        />
        <img
          className="guide__svg guide__svg--left"
          src={Paws}
          alt="Huella de perro"
          aria-hidden="true"
        />
      </GuideAnimation>
    </GuideRegisterContainer>
  );
};

export default GuideRegister;

```

### ServerError

El componente en cuestión que reenderiza errores, este componente es ampiamente reutilizable

- \proyect-partner-company-m66\01-frontend\houndxpress2\src\components\ServerError\index.tsx

```tsx
// ServerError.tsx
import React from "react";
import { ApiError } from "../../state/types";

// 1. Es un componente, recibe 'error' como prop
type ServerErrorProps = {
  error: ApiError | string | null;
};

// 2. No es un hook, es un componente normal
const ServerError = ({ error }: ServerErrorProps) => {
  // 3. ¡Ya no necesita 'useAppSelector'!

  // Si no hay error, no renderiza nada
  if (!error) return null;

  // --- CASO 1: El error es un string simple ---
  if (typeof error === "string") {
    return (
      <div className="server-error" role="alert">
        {error}
      </div>
    );
  }

  // --- CASO 2: El error es un objeto ApiError ---
  return (
    <div className="server-error" role="alert">
      <strong>Por favor, corrige los siguientes errores:</strong>
      <ul>
        {Object.entries(error).map(([field, messages]) => (
          <li key={field}>
            {Array.isArray(messages) ? (
              messages.map((msg, idx) => <span key={idx}>{msg}</span>)
            ) : (
              <span>{messages}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ServerError; // Export como default es común para componentes

```

### Modales y general State

Como el estado general y los modales funcionan con la estructura de las guías anterior, antes de porder volver a ver un poco de claridad, debo refactorizarlos
