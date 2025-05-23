# 🐳 Docker - Containerización de IoTHarvest

Este directorio contiene todos los archivos de configuración necesarios para ejecutar IoTHarvest en contenedores Docker.

---

## 🔧 Instalación de Docker

### 📦 **Instalación en Debian 12**

#### Paso 1: Actualizar el sistema
```bash
sudo apt update
sudo apt upgrade -y
```

#### Paso 2: Instalar dependencias
```bash
sudo apt install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release
```

#### Paso 3: Agregar la clave GPG oficial de Docker
```bash
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
```

#### Paso 4: Configurar el repositorio de Docker
```bash
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

#### Paso 5: Instalar Docker Engine
```bash
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

#### Paso 6: Configurar permisos de usuario
```bash
sudo usermod -aG docker $USER
newgrp docker
```

#### Paso 7: Verificar la instalación
```bash
docker --version
docker compose version
```

### 🌐 **Instalación para Otros Sistemas Operativos**

Para instrucciones detalladas de instalación en otros sistemas operativos, consulta la documentación oficial de Docker:

**🔗 [Documentación Oficial de Docker](https://docs.docker.com/get-docker/)**

- **Windows**: [Install Docker Desktop on Windows](https://docs.docker.com/desktop/windows/install/)
- **macOS**: [Install Docker Desktop on Mac](https://docs.docker.com/desktop/mac/install/)
- **Ubuntu**: [Install Docker Engine on Ubuntu](https://docs.docker.com/engine/install/ubuntu/)
- **CentOS/RHEL**: [Install Docker Engine on CentOS](https://docs.docker.com/engine/install/centos/)
- **Fedora**: [Install Docker Engine on Fedora](https://docs.docker.com/engine/install/fedora/)

---

## 🚀 Uso de los Contenedores

### **Inicio Rápido**
```bash
# Desde el directorio raíz del proyecto
./docker.sh start
```

### **Comandos Principales**
```bash
# Construir todas las imágenes
./docker.sh build

# Ver logs de todos los servicios
./docker.sh logs

# Ver logs de un servicio específico
./docker.sh backend
./docker.sh frontend
./docker.sh model

# Detener todos los servicios
./docker.sh stop

# Eliminar contenedores e imágenes
./docker.sh rm-containers
./docker.sh rm-images
```

### **Acceso a los Servicios**
Una vez iniciados los contenedores:
- **Frontend**: http://localhost:8081
- **Backend API**: http://localhost:8080

---

## 🔄 Arquitectura de Contenedores

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Frontend     │    │     Backend     │    │     Model       │
│   React + TS    │    │  Node.js + API  │    │  Python + ML    │
│   Puerto 8081   │◄──►│   Puerto 8080   │◄──►│   Procesamiento │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                        ┌─────────────────┐
                        │   Volúmenes     │
                        │   Compartidos   │
                        │ backend/data    │
                        └─────────────────┘
```

---

## 📂 Volúmenes y Persistencia

### **Datos Compartidos**
- `../backend/data:/app/backend/data` - Datos de sensores, imágenes y predicciones

### **Estructura de Datos**
```
backend/data/
├── images/              # Imágenes recibidas del ESP32
├── leaf_classification/ # Procesamiento del modelo IA
│   ├── last_image/      # Última imagen para analizar
│   ├── predicted_images/# Imágenes ya procesadas
│   └── last_prediction.txt # Resultado de la última predicción
├── sensors/             # Datos de sensores por fecha
├── cache/               # Cache del sistema
├── mail/                # Plantillas de correo
└── test/                # Datos de prueba
```

---

## 🔧 Variables de Entorno

Asegúrate de tener configurado el archivo `.env` en `/docker/.env` con:

```bash
MONGODB_URL=mongodb://...
JWT_SECRET=tu_clave_secreta
ADMIN_SCRIPT_PASS=contraseña_admin
MAIL_FROM=correo@ejemplo.com
MAIL_PASS=contraseña_correo
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
CLOUDINARY_CLOUD_NAME=tu_cloud
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

---

## 📋 Contenido de la Carpeta

### 🏗️ **Archivos de Construcción (Dockerfiles)**

#### `Dockerfile.backend`
- **Descripción**: Configura el contenedor para el servidor Node.js del backend
- **Base**: Node.js 18 Alpine
- **Puerto**: 8080
- **Funcionalidades**:
  - Servidor API REST con Express
  - Conexión a MongoDB
  - Gestión de imágenes con Cloudinary
  - Sistema de autenticación JWT
  - Envío de notificaciones por correo

#### `Dockerfile.frontend`
- **Descripción**: Configura el contenedor para la aplicación web React
- **Base**: Node.js 18 Alpine + servidor estático
- **Puerto**: 8081
- **Funcionalidades**:
  - Aplicación React con TypeScript
  - Build optimizado con Vite
  - Interfaz de usuario responsiva
  - Dashboards y gráficos interactivos

#### `Dockerfile.model`
- **Descripción**: Configura el contenedor para el modelo de Machine Learning
- **Base**: Python 3.10 Slim
- **Funcionalidades**:
  - Modelo de clasificación de hojas con TensorFlow
  - Procesamiento automático de imágenes
  - Monitoreo de directorios con inotify
  - Scripts de predicción en tiempo real

### ⚙️ **Archivos de Configuración**

#### `docker-compose.yml`
- **Descripción**: Orquestación de todos los servicios
- **Servicios incluidos**:
  - `backend`: API Node.js (puerto 8080)
  - `frontend`: Aplicación React (puerto 8081) 
  - `model`: Servicio de Machine Learning
- **Características**:
  - Variables de entorno compartidas
  - Volúmenes para persistencia de datos
  - Dependencias entre servicios
  - Reinicio automático de contenedores

### 🐍 **Scripts Python para Docker**

#### `predict-mv-docker.py`
- **Descripción**: Script de predicción adaptado para el entorno Docker
- **Funcionalidades**:
  - Carga del modelo TensorFlow desde contenedor
  - Procesamiento de imágenes en el volumen compartido
  - Escritura de resultados para el backend
  - Manejo de errores específico para Docker

#### `watch-predict-docker.sh`
- **Descripción**: Monitor de archivos para el contenedor del modelo
- **Funcionalidades**:
  - Vigilancia del directorio de imágenes
  - Activación automática de predicciones
  - Logs específicos para Docker
  - Gestión de señales del contenedor

---