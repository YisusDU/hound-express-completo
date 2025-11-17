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

## Modales y general State

Como el estado general y los modales funcionan con la estructura de las guías anterior, antes de porder volver a ver un poco de claridad, debo refactorizarlos

### GeneralState

Parace que general state estaba bastante sencillo, solo un conteo de las guías de las que hacemos fetch, pero no veré la luz hasta que corrija  los modales, o los comente todos gg

- \proyect-partner-company-m66\01-frontend\houndxpress2\src\components\GeneralState\index.tsx

```ts
import React, { useState, useEffect } from "react";
import Gift from "../../assets/IMG/Animacion-beneficios-sistema-v2.gif";
import {
  GeneralStateContainer,
  StateContainer,
  StateElement,
  StateGroup,
  StatePicture,
} from "./styles";
import { useAppSelector } from "../../hooks/useStoreTypes";

const GeneralState = () => {
  //Local state
  const [guideActive, setGuideActive] = useState<number>(0);
  const [guideDelivered, setGuideDelivered] = useState<number>(0);
  const [guidePending, setGuidePending] = useState<number>(0);
  const [guideTransit, setGuideTransit] = useState<number>(0);

  //Redux state
  const guides = useAppSelector((state) => state.guides.guides);

  //AutoUpdate the general numbers
  useEffect(() => {
    const active = guides.filter((e) => e.current_status != "Entregado").length;
    const delivered = guides.filter(
      (e) => e.current_status === "Entregado"
    ).length;
    const pending = guides.filter(
      (guide) => guide.current_status === "Pendiente"
    ).length;
    const transit = guides.length - delivered - pending;

    // Ahora sí, los logs mostrarán los valores correctos
    /* console.log("guías activas", active);
    console.log("guías entregadas", delivered);
    console.log("guías pendientes", pending);
    console.log("guías en tránsito", transit); */

    setGuideActive(active);
    setGuideDelivered(delivered);
    setGuidePending(pending);
    setGuideTransit(transit);
  }, [guides]);

  return (
    /* <!--Panel de estado general--> */
    <GeneralStateContainer id="general__state" className="state">
      <StateContainer className="state__container">
        <h2 className="state__title">Estado general</h2>
        <hr />
        <StateElement className="state__element">
          <StateGroup className="state__group">
            <h2 className="state__subject">Número total de guías activas</h2>
            <p
              data-testid="totalGuidesActive"
              className="state__info totalGuidesActive"
            >
              {guideActive}
            </p>
          </StateGroup>
          <StateGroup className="state__group">
            <h2 className="state__subject">Guías en tránsito</h2>
            <p
              data-testid="onTransitGuides"
              className="state__info onTransitGuides"
            >
              {guideTransit}
            </p>
          </StateGroup>
          <StateGroup className="state__group">
            <h2 className="state__subject">Guías entregadas</h2>
            <p
              data-testid="deliveredGuides"
              className="state__info deliveredGuides"
            >
              {guideDelivered}
            </p>
          </StateGroup>
        </StateElement>
      </StateContainer>
      <StatePicture className="state__picture">
        <img
          className="state__img"
          src={Gift}
          alt="Almacenamiento, envío y rastreo por Hound Express"
        />
      </StatePicture>
    </GeneralStateContainer>
  );
};

export default GeneralState;

```

### Modal History HistoryPath

Para refactorizar este modal, crearé un nuevo thunk que haga peticiones get para listar estados de la guía filtrando por número de guía

#### actionTypes

Creamos un action types para las etapas

- \proyect-partner-company-m66\01-frontend\houndxpress2\src\constants\actionTypes.ts

```ts
// También se puede hacer con objetos, es tan solo una variante
export const CREATE_GUIDE = "guide/createGuide";
export const FETCH_GUIDES = "guide/fetchGuides";
export const FETCH_STAGES = "guide/fetchStages"; // <-- Stages

```

Creamos el tipado para esta petición

- \proyect-partner-company-m66\01-frontend\houndxpress2\src\state\types.ts

```ts
// Lo que devuelve la API al listar estados
export interface ApiStagesPayload {
  id: number;
  guide_detail: ApiGuidePayload;
  guide_status: string;
  timestamp: string;
}

// Lo que le pasamos a a la api para listar estados
export type StagePayload = string;
```

Creamos el thunk junto con sus extrareducers

- \proyect-partner-company-m66\01-frontend\houndxpress2\src\state\guides.slice.ts

```ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  ApiError,
  ApiGuidePayload,
  ApiStagesPayload,
  GuideFormPayload,
  GuidesState,
  InfoModalData,
  StagePayload,
} from "./types";
import { Guide } from "../types/guides";
import { GuideStage } from "../components/GuideReguister/types";
import {
  CREATE_GUIDE,
  FETCH_GUIDES,
  FETCH_STAGES,
} from "../constants/actionTypes";
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

// Listar estados de una guía
export const fetchStages = createAsyncThunk<
  ApiStagesPayload[],
  StagePayload,
  { rejectValue: ApiError | string }
>(FETCH_STAGES, async (guideNumber, { rejectWithValue }) => {
  try {
    const response = await api.get<ApiStagesPayload[]>(
      `/api/v1/estatus/by-tracking/${guideNumber}/`
    );
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
  stages: [],
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
      })
      // Listar estados
      .addCase(fetchStages.pending, (state) => {
        state.status = ASYNC_STATUS.PENDING;
      })
      .addCase(fetchStages.fulfilled, (state, action) => {
        state.status = ASYNC_STATUS.FULFILLED;
        state.stages = action.payload;
      })
      .addCase(fetchStages.rejected, (state, action) => {
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

Y finalmente el componente,

- \proyect-partner-company-m66\01-frontend\houndxpress2\src\components\Modals\ModalHistory\HistoryPath\index.tsx

```ts
import React, { useEffect } from "react";
import Paw from "../../../../assets/IMG/paw-solid.svg";
import {
  ModalHistoryPath,
  ModalPathContent,
  ModalSVGContainer,
} from "./styles";
import {
  useAppDispatch,
  useAppSelector,
} from "../../../../hooks/useStoreTypes";
import { ASYNC_STATUS } from "../../../../constants/asyncStatus";
import ServerError from "../../../ServerError";
import { fetchStages } from "../../../../state/guides.slice";

const HistoryPath = () => {
  //Redux state
  const dispatch = useAppDispatch();

  const guides = useAppSelector((state) => state.guides.guides);
  const status = useAppSelector((state) => state.guides.status);
  const stages = useAppSelector((state) => state.guides.stages);
  const error = useAppSelector((state) => state.guides.error);
  const guideNumber = useAppSelector(
    (state) => state.guides.modalData.guideNumber
  );

  // Disparamos la operación asíncrona para listar guías
  useEffect(() => {
    if (guideNumber) {
      dispatch(fetchStages(guideNumber));
    }
  }, [dispatch, guideNumber]);

  return (
    <section>
      {/* Dinamics paths of following  */}
      {status == ASYNC_STATUS.FULFILLED &&
        (stages && stages.length >= 1 ? (
          <>
            {stages.map((stage, idx) => {
              const dateObj = new Date(stage.timestamp);
              // 'es-MX' usa el formato DD/MM/YYYY
              const fecha = dateObj.toLocaleDateString("es-MX", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              });
              const hora = dateObj.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              });
              return (
                <ModalHistoryPath key={idx}>
                  <ModalSVGContainer>
                    <img src={Paw} alt="paw-icon" />
                  </ModalSVGContainer>
                  <ModalPathContent>
                    <h3
                      className={
                        stage.guide_status === "Pendiente"
                          ? "status--pending"
                          : stage.guide_status === "En tránsito"
                          ? "status--transit"
                          : stage.guide_status === "Entregado"
                          ? "status--delivered"
                          : ""
                      }
                    >
                      {stage.guide_status}
                    </h3>
                    <div>
                      <span>{`${fecha} ${hora} | `}</span>
                      <span>
                        {stage.guide_status === "Pendiente" &&
                          "Tu envío está en preparación"}
                        {stage.guide_status === "En tránsito" &&
                          "Tu envío está en camino"}
                        {stage.guide_status === "Entregado" &&
                          "¡Tu envío fue entregado!"}
                      </span>
                    </div>
                    <hr />
                  </ModalPathContent>
                </ModalHistoryPath>
              );
            })}
          </>
        ) : (
          <p>No hay valores para mostrar</p>
        ))}
      {status === ASYNC_STATUS.PENDING && (
        <div>
          <h2>Loading... 🥱</h2>
        </div>
      )}
      {status === ASYNC_STATUS.REJECTED && <ServerError error={error} />}
    </section>
  );
};

export default HistoryPath;

```

### ModalHistory HistoryTable

Se ajusta un poco el subcomponente HistoryTable

- \proyect-partner-company-m66\01-frontend\houndxpress2\src\components\Modals\ModalHistory\HistoryTable\index.tsx

```ts
import React from "react";
import useDraggTable from "../../../../hooks/useDraggTable";
import { HistoryTableContainer } from "./styles";
import { useAppSelector } from "../../../../hooks/useStoreTypes";

const HistoryTable = () => {
  //Redux state
  const guides = useAppSelector((state) => state.guides.guides);
  const guideNumber = useAppSelector(
    (state) => state.guides.modalData.guideNumber
  );
  const currentGuide = guides.find((g) => g.guide_number === guideNumber);
  //Verify if the current guide has stages, if not, it will be an empty array
  const stages = useAppSelector((state) => state.guides.stages);
  //Function to dragg the table on scroll, it needs styles of overflow
  const tableRef = useDraggTable();

  return (
    <HistoryTableContainer ref={tableRef}>
      <table className="tableHistory__currentGuide">
        <thead className="tableHistory__currentGuide--header">
          <tr className="tableHistory__modalUptade--row">
            <th className="tableHistory__table--modal">Número de guía</th>
            <th className="tableHistory__table--modal">Estado actual</th>
            <th className="tableHistory__table--modal">Origen</th>
            <th className="tableHistory__table--modal">Destino</th>
            <th className="tableHistory__table--modal">Destinatario</th>
          </tr>
        </thead>
        <tbody className="tableHistory__currentGuide--body">
          {currentGuide ? (
            <tr>
              <td data-label="Número de guía">{currentGuide.guide_number}</td>
              <td data-label="Estado">
                {currentGuide.current_status}
              </td>
              <td data-label="Origen">{currentGuide.guide_origin}</td>
              <td data-label="Destino">{currentGuide.guide_destination}</td>
              <td data-label="Destinatario">{currentGuide.guide_recipient}</td>
            </tr>
          ) : (
            <tr>
              <td>No hay valores para mostrar</td>
            </tr>
          )}
        </tbody>
      </table>
    </HistoryTableContainer>
  );
};

export default HistoryTable;

```

## ModalUpdate UpdateForm

Al comenzar a integrar el thunk, noté que sería lógico haberlo hecho con el siguiente órden

### actionType

Definimos el nuevo actiontype para actualizar estados

- \proyect-partner-company-m66\01-frontend\houndxpress2\src\constants\actionTypes.ts

```ts
// También se puede hacer con objetos, es tan solo una variante
export const CREATE_GUIDE = "guide/createGuide";
export const FETCH_GUIDES = "guide/fetchGuides";
export const FETCH_STAGES = "guide/fetchStages";
export const UPDATE_STATUS = "guide/updateStatus" //Se añade nuevo action

```

### Types

Definimos los tipos que vamos a enviar por la api

- \proyect-partner-company-m66\01-frontend\houndxpress2\src\state\types.ts

```ts
// Lo que envíamos para actualizar estados
export type UpdatePayload = {
  id: number;
  guide_status: string;
};

```

### Thunk en Slices

Creamos el thunk con sus extrareducers

- \proyect-partner-company-m66\01-frontend\houndxpress2\src\state\guides.slice.ts

```ts
// Actualizar guías
export const updateStatus = createAsyncThunk<
  ApiStagesPayload,
  UpdatePayload,
  { rejectValue: ApiError | string }
>(UPDATE_STATUS, async (newGuideStage, { rejectWithValue }) => {
  try {
    const response = await api.post<ApiStagesPayload>(
      "/api/v1/estatus/",
      newGuideStage
    );
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


// Actualizar estado
      .addCase(updateStatus.pending, (state) => {
        state.status = ASYNC_STATUS.PENDING;
      })
      .addCase(updateStatus.fulfilled, (state) => {
        state.status = ASYNC_STATUS.FULFILLED;
      })
      .addCase(updateStatus.rejected, (state, action) => {
        state.status = ASYNC_STATUS.REJECTED;
        // Si usas rejectWithValue, el error viene en .payload
        if (action.payload) {
          state.error = action.payload;
        } else {
          // Si es un error no manejado, usa .error.message
          state.error = action.error.message || "Ocurrió un error desconocido";
        }
      });
```

### Lógica de update form

La mayoría de la lógica está encapsulada en un hook , por lo que  lo ajustamos para manejar las acciones asincrónicas

- \proyect-partner-company-m66\01-frontend\houndxpress2\src\hooks\useUpdateForm.ts

```ts
import { SetStateAction, useState } from "react";
import validateFields from "./useValidateFields";
import { Guide } from "../components/GuideReguister/types";
import { useAppDispatch, useAppSelector } from "./useStoreTypes";
import { ApiError } from "../state/types";
import { updateStatus } from "../state/guides.slice";
// import { updateGuide } from "../state/guides.slice";

const useUpdateForm = () => {
  //Redux state
  const dispatch = useAppDispatch();

  //Set errors from the form
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Encontrar la guía actual
  const guides = useAppSelector((state) => state.guides.guides);
  const guideNumber = useAppSelector(
    (state) => state.guides.modalData.guideNumber
  );
  const currentGuide = guides.find((g) => g.guide_number === guideNumber);

  //Validate the form on submit
  const handleValidate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    //validate all the fields empty
    const requiredFields = ["guide__date", "guide__hour", "guide__status"];
    const { isValid } = validateFields(requiredFields, formData, setErrors);

    // console.log("Formulario válido:", validForm ? "true" : "false");
    if (!isValid) {
      return;
    }

    // Validar que se encontró la guía
    if (!currentGuide) {
      return console.error("Guía no encontrada");
    }

    //Take the info into an object
    const newGuideStage = {
      id: currentGuide.id,
      guide_status: (formData.get("guide__status") as string)?.trim() || "",
    };

    try {
      await dispatch(updateStatus(newGuideStage)).unwrap();
      alert("Guía actualizada con éxito");
      //clean the form
      form.reset();
    } catch (rejectedValue) {
      console.error("Falló al actualiar la guía:", rejectedValue);
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
  return { handleValidate, errors, setErrors, currentGuide };
};

export { useUpdateForm };

```

### UpdateForm / index.ts

Por último, aplicamos los cambios al index del componente y nos aseguramos de recibir todo lo que nos manda el hook

> Nota
>
> Adicionalmente borramos los componentes que ya no usaremos de los estilos, los reenderizados serán desde react, no desde los estilos

- \proyect-partner-company-m66\01-frontend\houndxpress2\src\components\Modals\ModalUpdate\UpdateForm\index.tsx

```ts
import React from "react";
import { useUpdateForm } from "../../../../hooks/useUpdateForm";
import {
  ModalUpdateContainer,
  ModalForm,
  ModalSelect,
  ModalFormSubmit,
  ModalMessage,
} from "./styles";
import { useCleanErrorOnFocus } from "../../../../hooks/useCleanErrorOnFocus";
import { useAppSelector } from "../../../../hooks/useStoreTypes";

interface RefEls {
  focusableEls: HTMLElement[];
}

const UpdateForm = ({ focusableEls }: RefEls) => {
  //Redux state
  const UpdateModalOpen = useAppSelector(
    (state) => state.guides.modalData.typeModal
  );

  const { handleValidate, errors, setErrors, currentGuide } = useUpdateForm();
  /* useEffect(()=> {
    console.log("currentGuideUpdate", currentGuide)
  }) */
  //Function to clear errors on focus
  const clearErrosOnFocus = useCleanErrorOnFocus(errors, setErrors);


  //Make a focus trap for the links container
  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key !== "Tab" || focusableEls.length === 0) return;
    const first = focusableEls[0];
    const last = focusableEls[focusableEls.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  return (
    <ModalUpdateContainer>
      {currentGuide?.current_status !== "Entregado" && (
        <ModalForm
          action="#"
          className="tableModal__form"
          onSubmit={handleValidate}
          onKeyDown={UpdateModalOpen === "Update" ? handleKeyDown : undefined}
        >
          <label className="table__form--label" htmlFor="guide__newStatus">
            Nuevo estado:
          </label>
          <ModalSelect
            className="tableModal__form--select tableModal__input"
            id="guide__newStatus"
            name="guide__status"
            title="Selecciona el estado actualizado del envío"
            aria-label="Selecciona el estado actualizado del envío"
            onFocus={clearErrosOnFocus}
          >
            <option className="tableModal__form--option option--1" value="">
              Nuevo estado:
            </option>
            <option
              className="tableModal__form--option option--2"
              value="Pentiente"
            >
              Pentiente 📦
            </option>
            <option
              className="tableModal__form--option option--2"
              value="En tránsito"
            >
              En tránsito 🚚
            </option>
            <option
              className="tableModal__form--option option--3"
              value="Entregado"
            >
              Entregado ✅
            </option>
            <option
              className="tableModal__form--option option--2"
              value="Cancelado"
            >
              Cancelado ❌
            </option>
          </ModalSelect>
          <span className="error-message">{errors.guide__status}</span>
          <br />
          <ModalFormSubmit
            className="tableModal__form--submit"
            type="submit"
            aria-label={`Actualizar estado de la guía ${currentGuide?.guide_number}`}
            title={`Actualizar estado de la guía ${currentGuide?.guide_number}`}
          >
            Actualizar
          </ModalFormSubmit>
        </ModalForm>
      )}
      {currentGuide?.current_status === "Entregado" && (
        <ModalMessage>
          *Tu envío ya fue entregado, no es posible actualizar su estado*
        </ModalMessage>
      )}
    </ModalUpdateContainer>
  );
};

export default UpdateForm;

```

## ModalUpdate /UpdateTable

Se actualiza el subcomponente UpdateTable y se añade lógica para descomponer la fecha y hora

- \proyect-partner-company-m66\01-frontend\houndxpress2\src\components\Modals\ModalUpdate\UpdateTable\index.tsx

```ts
import React from "react";
import { Guide } from "../../../../types/guides";
import { UpdateTableContainer } from "./styles";
import useDraggTable from "../../../../hooks/useDraggTable";
import { useAppSelector } from "../../../../hooks/useStoreTypes";

export interface UpdateGuide {
  guideIndex: number;
  currentGuide: Guide;
}

const UpdateTable = () => {
  //Redux state
  const guides = useAppSelector((state) => state.guides.guides);
  const guideNumber = useAppSelector(
    (state) => state.guides.modalData.guideNumber
  );
  const currentGuide = guides.find((g) => g.guide_number === guideNumber);

  //Function to dragg the table on scroll, it needs styles of overflow
  const tableRef = useDraggTable();

  let fecha: string | null = null;
  let hora: string | null = null;

  if (currentGuide) {
    const dateObj = new Date(currentGuide.updated_at);
    // 'es-MX' usa el formato DD/MM/YYYY
    fecha = dateObj.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    hora = dateObj.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  return (
    <UpdateTableContainer ref={tableRef}>
      <table className="table__currentGuide">
        <thead className="table__currentGuide--header">
          <tr className="table__modalUptade--row">
            <th className="guide__table--modal">Número de guía</th>
            <th className="guide__table--modal">Estado actual</th>
            <th className="guide__table--modal">Origen</th>
            <th className="guide__table--modal">Destino</th>
            <th className="guide__table--modal">Destinatario</th>
            <th className="guide__table--modal">
              Fecha de la última actualización.
            </th>
            <th className="guide__table--modal">Hora de actualización</th>
          </tr>
        </thead>
        <tbody className="table__currentGuide--body">
          {currentGuide ? (
            <tr>
              <td data-label="Número de guía">{currentGuide.guide_number}</td>
              <td data-label="Estado">{currentGuide.current_status}</td>
              <td data-label="Origen">{currentGuide.guide_origin}</td>
              <td data-label="Destino">{currentGuide.guide_destination}</td>
              <td data-label="Destinatario">{currentGuide.guide_recipient}</td>
              <td data-label="Fecha">{fecha}</td>
              <td data-label="Hora">{hora}</td>
            </tr>
          ) : (
            <tr>
              <td>No hay valores para mostrar</td>
            </tr>
          )}
        </tbody>
      </table>
    </UpdateTableContainer>
  );
};

export default UpdateTable;

```

## Debuggin

Iniciamos la etapa de debugeo y pulido general

### filteredGuides.map is not a function

Lo primero que me salta al cargar la app con el backend corriendo es el error encabezado, el backend responde con estatus 200 por lo que creo que es la forma en la que el backend está devolviendo las respuestas, en una lista con data seguido de otra lista con la info

Como lo sospechaba, la respuesta envuelta del backend en data estaba perjudicando mi app, por lo que estandaricé las respuestás exitosas

- \proyect-partner-company-m66\02-backend\houndxpress3\src\api\views.py

```python
from django.shortcuts import render
from rest_framework import status 
from rest_framework.response import Response 
from rest_framework.viewsets import ViewSet #<-- import ViewSet
from django.shortcuts import get_object_or_404 #<-- import get_object_or_404
from rest_framework.decorators import action

from houndexpress.models import Guia, Estatus
from django.contrib.auth.models import User

from houndexpress.serializers import GuideSerializer, UserSerializer, EstatusSerializer

# ViewSet for Guia model
class GuideViewSet(ViewSet):
    """ViewSet para listar guias"""
    serializer_class = GuideSerializer

    def list(self, request):
        """"Lista todas las guías"""
        guides = Guia.objects.all()
        serializer = self.serializer_class(guides, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
  

    def create(self, request):
        """Crea una guia"""
        serializer = self.serializer_class(data = request.data)

        if not serializer.is_valid():
            data = serializer.errors
            return Response({"data": data}, status=status.HTTP_400_BAD_REQUEST)
    
        serializer.save(current_status="Creado")
        return Response(serializer.data, status=status.HTTP_201_CREATED)
  
    def retrieve(self, request, pk=None):
        """Maneja obtener una guia por su ID"""
        guide = get_object_or_404(Guia, pk=pk)  
        message = f"Obteniendo la guia por su ID {pk}"
        data = GuideSerializer(guide).data
    
        return Response(data, status=status.HTTP_200_OK)
  
    def update(self, request, pk=None):
        """Maneja la actualización de una guia por su ID"""
        guide = get_object_or_404(Guia, pk=pk)  
        serializer = self.serializer_class(guide, data=request.data, partial=False)
    
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.data, status=status.HTTP_200_OK)
  
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
        return Response(serializer.data, status=status.HTTP_200_OK)

  
    def create(self, request):
        """Crear un nuevo estatus"""
        serializer = self.serializer_class(data=request.data)  
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
    
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
  
    def retrieve(self, request, pk=None):
        """Obtener un estatus específico"""
        queryset = Estatus.objects.select_related('guide', 'updatedBy').all()
        estatus = get_object_or_404(queryset, pk=pk)
        serializer = self.serializer_class(estatus)  
        return Response(serializer.data, status=status.HTTP_200_OK)
  
    def update(self, request, pk=None):
        """Actualizar completamente un estatus"""
        queryset = Estatus.objects.select_related('guide', 'updatedBy').all()
        estatus = get_object_or_404(queryset, pk=pk)
    
        serializer = self.serializer_class(estatus, data=request.data, partial=False)  
    
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
    
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
        queryset = Estatus.objects.select_related('guide_data').filter(
            guide_data__guide_number__iexact=tracking
        ).order_by('-timestamp')
    
        if not queryset.exists():
            return Response(
                {'error': f'No se encontraron estatus para el tracking: {tracking}'},
                status=status.HTTP_404_NOT_FOUND
            )
    
        serializer = self.serializer_class(queryset, many=True)  
    
        return Response(serializer.data)
```

### Bug al intentar actualizar estado

Había un error en la forma en que estaba nombrando e campo que manda el id de la guía por actualizar, lo renombramos en Front Y Backen a guide_id pero en backend le añadimos un campo source que apunta a guide_data por debajo para que funcione, solo es  por saber qué se esta mandando

- \proyect-partner-company-m66\02-backend\houndxpress3\src\houndexpress\serializers.py

```python
class EstatusSerializer(ModelSerializer):
    guide_detail = GuideSerializer(source='guide_data', read_only=True)
  
    guide_id = serializers.PrimaryKeyRelatedField(
        queryset=Guia.objects.all(),
        write_only=True,
        label = "Número de rastreo",
        source='guide_data',
        error_messages={
            'does_not_exist': 'La guía con ID {pk_value} no existe en el sistema',
            'incorrect_type': 'El ID de la guía debe ser un número entero',
            'required': 'El campo Número de rastreo es obligatorio'
        }
    )
  
```

Adicionalmente, la función que valida el formulario del nuevo estado estaba buscando campos que ya no existen, por lo que fallaba, los eliminamos

- \proyect-partner-company-m66\01-frontend\houndxpress2\src\hooks\useUpdateForm.ts

```ts
//Validate the form on submit
  const handleValidate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    console.log("Se llamó handleValidate")

    //validate all the fields empty
    const requiredFields = ["guide__status"];
    const { isValid } = validateFields(requiredFields, formData, setErrors);
```

### Manejo de errores

Lo ví venir, y me ha alcanzado, dado que todas las peticiones que hacemos guardan sus errores en la misma variable del estado error, si falla el crear una guía, el error se ve abajo del formulario y en la lista de guías, quiza podemos generar una variable para que cada acción asíncrona para sus errores, tipo errorList, errorCreate,errorUpdate

Para conservar la estructura del proyectom decidí seguir manejando todo en un mismo Slice, pero con estados y errores individuales para cada acción, comenzando por los tipos

- \proyect-partner-company-m66\01-frontend\houndxpress2\src\state\types.ts

```ts 
export interface GuidesState {
  guides: ApiGuidePayload[];
  menuDisplay: boolean;
  modalData: InfoModalData;
  stages: ApiStagesPayload[];
  
  // --- Estados Sectorizados ---

  // Sector para LISTAR (fetchGuides)
  listStatus: string;
  listError: ApiError | string | null;

  // Sector para CREAR (createGuide)
  createStatus: string;
  createError: ApiError | string | null;

  // Sector para ACTUALIZAR (updateStatus)
  updateStatus: string;
  updateError: ApiError | string | null;
  
  // Sector para HISTORIAL (fetchStages)
  stagesStatus: string;
  stagesError: ApiError | string | null;
}
```

Corrigiendo el Slcie

- \proyect-partner-company-m66\01-frontend\houndxpress2\src\state\guides.slice.ts

```ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  ApiError,
  ApiGuidePayload,
  ApiStagesPayload,
  GuideFormPayload,
  GuidesState,
  InfoModalData,
  StagePayload,
  UpdatePayload,
} from "./types";
import { Guide } from "../types/guides";
import { GuideStage } from "../components/GuideReguister/types";
import {
  CREATE_GUIDE,
  FETCH_GUIDES,
  FETCH_STAGES,
  UPDATE_STATUS,
} from "../constants/actionTypes";
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

// Listar estados de una guía
export const fetchStages = createAsyncThunk<
  ApiStagesPayload[],
  StagePayload,
  { rejectValue: ApiError | string }
>(FETCH_STAGES, async (guideNumber, { rejectWithValue }) => {
  try {
    const response = await api.get<ApiStagesPayload[]>(
      `/api/v1/estatus/by-tracking/${guideNumber}/`
    );
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

// Actualizar guías
export const updateStatus = createAsyncThunk<
  ApiStagesPayload,
  UpdatePayload,
  { rejectValue: ApiError | string }
>(UPDATE_STATUS, async (newGuideStage, { rejectWithValue }) => {
  try {
    const response = await api.post<ApiStagesPayload>(
      "/api/v1/estatus/",
      newGuideStage
    );
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
  stages: [],
  menuDisplay: false,
  modalData: { guideNumber: "", typeModal: "" },

  listStatus: ASYNC_STATUS.IDLE,
  listError: null,

  createStatus: ASYNC_STATUS.IDLE,
  createError: null,

  updateStatus: ASYNC_STATUS.IDLE,
  updateError: null,

  stagesStatus: ASYNC_STATUS.IDLE,
  stagesError: null,
};

const guidesSlice = createSlice({
  name: "guidesState",
  initialState,
  reducers: {
    toggleMenu: (state, action: PayloadAction<boolean>) => {
      state.menuDisplay = action.payload;
    },
    changeModalData: (state, action: PayloadAction<InfoModalData>) => {
      state.modalData = action.payload;
    },
    // Acción para resetear el estado del formulario de CREACIÓN
    resetCreateStatus: (state) => {
      state.createStatus = ASYNC_STATUS.IDLE;
      state.createError = null;
    },
    // Acción para resetear el estado del formulario de ACTUALIZACIÓN
    resetUpdateStatus: (state) => {
      state.updateStatus = ASYNC_STATUS.IDLE;
      state.updateError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Crear guías
      .addCase(createGuide.pending, (state) => {
        state.createStatus = ASYNC_STATUS.PENDING;
        state.createError = null;
      })
      .addCase(createGuide.fulfilled, (state, action) => {
        state.createStatus = ASYNC_STATUS.FULFILLED;
        // Actualizamos el estado de 'guides'
        state.guides.unshift(action.payload);
      })
      .addCase(createGuide.rejected, (state, action) => {
        state.createStatus = ASYNC_STATUS.REJECTED;
        state.createError =
          (action.payload as ApiError | string) || "Error al crear la guía";
      })
      // Listar guías
      .addCase(fetchGuides.pending, (state) => {
        state.listStatus = ASYNC_STATUS.PENDING;
        state.listError = null;
      })
      .addCase(fetchGuides.fulfilled, (state, action) => {
        state.listStatus = ASYNC_STATUS.FULFILLED;
        state.guides = action.payload;
      })
      .addCase(fetchGuides.rejected, (state, action) => {
        state.listStatus = ASYNC_STATUS.REJECTED;
        state.listError =
          (action.payload as ApiError | string) || "Error al listar guías";
      })
      // Listar estados
      .addCase(fetchStages.pending, (state) => {
        state.stagesStatus = ASYNC_STATUS.PENDING;
        state.stagesError = null;
      })
      .addCase(fetchStages.fulfilled, (state, action) => {
        state.stagesStatus = ASYNC_STATUS.FULFILLED;
        state.stages = action.payload;
      })
      .addCase(fetchStages.rejected, (state, action) => {
        state.stagesStatus = ASYNC_STATUS.REJECTED;
        state.stagesError =
          (action.payload as ApiError | string) || "Error al cargar historial";
      })
      // Actualizar estado
      .addCase(updateStatus.pending, (state) => {
        state.updateStatus = ASYNC_STATUS.PENDING;
        state.updateError = null;
      })
      .addCase(updateStatus.fulfilled, (state) => {
        state.updateStatus = ASYNC_STATUS.FULFILLED;
      })
      .addCase(updateStatus.rejected, (state, action) => {
        state.updateStatus = ASYNC_STATUS.REJECTED;
        state.updateError =
          (action.payload as ApiError | string) || "Error al actualizar";
      });
  },
});

export const {
  toggleMenu,
  changeModalData,
  resetCreateStatus, 
  resetUpdateStatus, 
} = guidesSlice.actions;

//Reducer for the store
export default guidesSlice.reducer;

```

Y actualizando las referencia al estado de redux de cada componente

Realmente fue algo facíl lo de actualizar la referencia de estado y error, así que no pegaré el codigo

### GuideList Fecha y hora

He nota que la fecha y hora aún se muestran en un formato un poco técnico, lo voy a simplificar

- \proyect-partner-company-m66\01-frontend\houndxpress2\src\components\GuideList\index.tsx

```ts
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
  const status = useAppSelector((state) => state.guides.listStatus);
  const error = useAppSelector((state) => state.guides.listError);
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
              filteredGuides.map((g, index) => {
                const dateObj = new Date(g.updated_at);
                const fecha = dateObj.toLocaleDateString("es-MX", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                });
                const hora = dateObj.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                });

                return (
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

                    <TableData
                      className="guide__table--data"
                      data-label="Origen"
                    >
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

                    <TableData
                      className="guide__table--data"
                      data-label="Fecha"
                    >
                      {`${fecha} ${hora}`}
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
                );
              })}
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

### Actualizar estado cuando El modal Updata es exitoso

Cuando hacemos un post, y es exitoso, sale el mensaje de que se actualizó la guía, pero seguimos viendo que tiene el mismo estado, es por eso que forzamos un dispatch de fetchGuides en el try cath, esto obliga a recargar las guías, que es de donde se toman los datos para el modal, a la vez que actualiza el listado de guías ante actualizaciones

- \proyect-partner-company-m66\01-frontend\houndxpress2\src\hooks\useUpdateForm.ts

```
try {
      await dispatch(updateStatus(newGuideStage)).unwrap();
      await dispatch(fetchGuides());
      alert("Guía actualizada con éxito");
```

### Actualización de GuideList en cambio de estado

Le he preguntado a gemini que hacer y me ha dado dos buenas opciones, una instantánea y otra para el futuro, por ahora solo haré la instantéa que es quitar la dependencia del estado para despachar el fetchGuides, la otra opcion es usar RTK Query

>
> #### La Solución Profesional: RTK Query (Refetch on Focus)
>
> Este es mi consejo de 10 rupias. La herramienta que ya estás usando (Redux Toolkit) tiene una "herramienta hermana" para reemplazar tus `createAsyncThunk` manuales. Se llama  **RTK Query** .
>
> En lugar de escribir  *thunks* , *reducers* de `pending/fulfilled/rejected` y `initialState` para los errores... simplemente defines un  *endpoint* :
>
> const api = createApi({
>   // ...
>   endpoints: (builder) => ({
>     getGuides: builder.query<ApiGuidePayload[], void>({
>       query: () => "/api/v1/guides/",
>     }),
>   }),
> });

Solo haré este pequeño cambio de momento, pero es bueno conocer otros horizontes

- [ ] \proyect-partner-company-m66\01-frontend\houndxpress2\src\components\GuideList\index.tsx

```ts
  // Disparamos la operación asíncrona para listar guías
  useEffect(() => {
    dispatch(fetchGuides());
  }, [dispatch, ]);
```

### Bug en Estado General

He notado que la nueva introducción de estados Creado y Cancelado está generando ruido a la hora de calcular las guías activas

- \proyect-partner-company-m66\01-frontend\houndxpress2\src\components\GeneralState\index.tsx

```ts
 useEffect(() => {
    const active = guides.filter(
      (e) =>
        e.current_status !== "Entregado" && e.current_status !== "Cancelado"
    ).length;
    const delivered = guides.filter(
      (e) => e.current_status === "Entregado"
    ).length;
    const pending = guides.filter(
      (guide) => guide.current_status === "Pendiente"
    ).length;

    const cancelled = guides.filter(
      (g) => g.current_status === "Cancelado"
    ).length;
    const transit = guides.filter(
      (g) => g.current_status === "En tránsito"
    ).length;

    setGuideActive(active);
    setGuideDelivered(delivered);
    setGuidePending(pending);
    setGuideTransit(transit);
  }, [guides]);
```

### Filtrar por número de guía
