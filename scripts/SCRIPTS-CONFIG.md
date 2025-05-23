# 🧪 Scripts de Pruebas y Configuración - IoTHarvest

Este directorio contiene scripts utilitarios para realizar pruebas, envío de datos y gestión del sistema IoTHarvest.

---

## 📋 **Requisitos Previos**

### 🔹 **Servidor Backend Activo**
Asegúrate de que el servidor esté ejecutándose:
```bash
# Desde el directorio raíz del proyecto
./docker.sh start
# O usando el script de servidor:
./server.sh --test
# O manualmente:
cd backend && node server.js
```

### 🔹 **Configuración de Variables de Entorno**
Verifica que el archivo `backend/.env` contenga:
- `MONGODB_URL`: URL de conexión a MongoDB
- `JWT_SECRET`: Clave secreta para JWT
- `ADMIN_SCRIPT_PASS`: Contraseña de administrador
- `CLOUDINARY_*`: Credenciales de Cloudinary

### 🔹 **Permisos de Ejecución**
Otorga permisos de ejecución a los scripts:
```bash
chmod +x *.sh
```

---

## 📋 Lista de Scripts Disponibles

### 🚀 **Scripts de Pruebas Principales**

#### `test-all.sh` - Pruebas Automáticas Completas
**Descripción:** Script principal que ejecuta pruebas automatizadas del sistema completo.

**Funcionalidad:**
- Ejecuta envío de imágenes y datos de sensores en paralelo
- Prueba la conectividad con el backend
- Valida el funcionamiento de los endpoints principales

**Uso:**
```bash
./test-all.sh
```

---

### 📊 **Scripts de Envío de Datos**

#### `enviarDatos.sh` - Envío de Datos de Sensores
**Descripción:** Envía datos simulados de sensores al servidor para pruebas.

**Parámetros:**
- `NUM_ENVIOS`: Número total de envíos (1-300, defecto: 10)
- `INTERVALO`: Segundos entre envíos (1-60, defecto: 1)
- `STATUS`: Valor del campo status (defecto: 0)

**Uso:**
```bash
./enviarDatos.sh [NUM_ENVIOS] [INTERVALO] [STATUS]
```

**Ejemplos:**
```bash
# Enviar 20 datos con 5 segundos de intervalo
./enviarDatos.sh 20 5

# Enviar 50 datos con 2 segundos de intervalo y status 3
./enviarDatos.sh 50 2 3
```

#### `enviarImagenes.sh` - Envío de Imágenes de Prueba
**Descripción:** Envía imágenes desde el directorio de pruebas al servidor.

**Parámetros:**
- `NUM_IMAGENES`: Número de imágenes a enviar (defecto: 1)
- `INTERVALO`: Segundos entre envíos (defecto: 10)

**Directorio de origen:** `./backend/data/test/testImages`

**Uso:**
```bash
./enviarImagenes.sh [NUM_IMAGENES] [INTERVALO]
```

**Ejemplos:**
```bash
# Enviar 7 imágenes con 10 segundos de intervalo
./enviarImagenes.sh 7 10

# Enviar 1 imagen (por defecto)
./enviarImagenes.sh
```

---

### 🔐 **Scripts de Autenticación**

#### `testUserAuth.sh` - Pruebas de Autenticación
**Descripción:** Script interactivo para probar el sistema de registro y login de usuarios.

**Funcionalidades:**
- Crear nuevas cuentas de usuario
- Iniciar sesión con credenciales
- Probar endpoints protegidos con JWT
- Validación de tokens de autenticación

**Uso:**
```bash
./testUserAuth.sh
```

**Requisitos:**
- Archivo `.env` configurado en `../backend/.env`
- Variable `ADMIN_SCRIPT_PASS` definida
- Servidor backend ejecutándose en `http://localhost:8080`

---

### ☁️ **Scripts de Gestión de Archivos**

#### `descargarImagenesCloudinary.sh` - Descarga de Imágenes
**Descripción:** Descarga las últimas imágenes almacenadas en Cloudinary.

**Parámetros:**
- `N`: Número de imágenes a descargar (máximo: 10, defecto: 1)

**Directorio de destino:** `backend/data/test/downloadImages`

**Uso:**
```bash
./descargarImagenesCloudinary.sh [N]
```

**Ejemplos:**
```bash
# Descargar las últimas 5 imágenes
./descargarImagenesCloudinary.sh 5

# Descargar la última imagen
./descargarImagenesCloudinary.sh
```

**Requisitos:**
- Contraseña de administrador
- Configuración de Cloudinary en el backend
- Servidor backend ejecutándose

---


## 🔧 **Endpoints de Verificación**

### **Datos de Sensores**
```bash
# Último dato almacenado
curl -X GET http://localhost:8080/api/sensores/ultimo

# Últimos 10 registros
curl -X GET http://localhost:8080/api/sensores/ultimos/10

# Todos los datos
curl -X GET http://localhost:8080/api/sensores
```
---

## 📁 **Estructura de Directorios de Prueba**

```
backend/data/
├── test/
    ├── testImages/          # Imágenes para enviar con enviarImagenes.sh
    └── downloadImages/      # Imágenes descargadas de Cloudinary
```

---

**💡 Tip:** Ejecuta `./test-all.sh` para una prueba completa del sistema antes de realizar cambios importantes.