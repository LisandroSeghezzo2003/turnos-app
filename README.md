# Sistema de Reservas de Turnos

Aplicación web para la gestión de turnos desarrollada con **FastAPI**, **MongoDB** y **JavaScript**.

Permite a los usuarios solicitar turnos y a los administradores gestionar reservas mediante un panel con calendario interactivo.

---

## Funcionalidades

### Usuario

* Solicitar turno con:

  * Nombre y apellido
  * Fecha (selector visual)
  * Horario disponible
  * Contacto y email
* Validación de horarios ocupados
* Interfaz moderna y responsive

### Administrador

* Login con autenticación real (JWT + cookies)
* Panel de administración protegido
* Visualización de turnos en:

  * Tabla
  * Calendario interactivo
* Cancelación de turnos
* Visualización de detalles en modal
* Configuración de credenciales (usuario y contraseña)
* Cierre de sesión

---

## Tecnologías utilizadas

### Backend

* FastAPI
* MongoDB
* PyJWT
* pwdlib (hash de contraseñas con Argon2)

### Frontend

* HTML
* CSS
* JavaScript
* FullCalendar
* Flatpickr

---

## Estructura del proyecto

```
turnos_app/
├── backend/
│   └── main.py
└── frontend/
    ├── pages/
    │   ├── index.html
    │   ├── admin.html
    │   ├── dashboard.html
    │   └── configuracion.html
    ├── css/
    │   └── styles.css
    └── js/
        ├── script.js
        ├── admin.js
        ├── dashboard.js
        └── configuracion.js
```

## Instalación y ejecución

### 1. Clonar el repositorio

```
git clone https://github.com/lisandroseghezzo/turnos-app.git
```
### 2. Crear entorno virtual (opcional)

```
python -m venv venv
venv\Scripts\activate
```

### 3. Instalar dependencias

```
pip install fastapi uvicorn pymongo pyjwt pwdlib[argon2]
```

### 4. Ejecutar MongoDB

### 5. Ejecutar el servidor

```
python -m uvicorn backend.main:app --reload
```

---

## Credenciales iniciales

Se crea automáticamente un usuario de administrador si no existe:

```
usuario: admin
contraseña: 1234
```

Se recomienda cambiar estas credenciales desde la sección **Configuración**.

---

## Seguridad

* Autenticación con JWT
* Cookies HttpOnly
* Contraseñas hasheadas (Argon2)
* Rutas protegidas en backend

---

## Características destacadas

* UI moderna (modo oscuro)
* Calendario tipo Google Calendar
* Manejo de disponibilidad en tiempo real
* Separación clara entre frontend y backend
* Arquitectura escalable

---

## Posibles mejoras futuras

* Envío de emails de confirmación
* Notificaciones automáticas
* Soporte multiusuario (roles)
* Deploy en la nube (Render / Railway)
* Versión mobile

---
## Uso de Inteligencia Artificial

Durante el desarrollo de este proyecto se utilizó inteligencia artificial como herramienta de apoyo para:

- Asistencia
- Resolución de errores
- Mejora de la interfaz de usuario
- Optimización del código

Todas las decisiones finales, implementación y adaptación del sistema fueron realizadas de forma manual.
--
## Autor

Proyecto desarrollado por **Lisandro Seghezzo**.
