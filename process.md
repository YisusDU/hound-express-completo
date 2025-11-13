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
