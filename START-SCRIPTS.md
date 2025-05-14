# 🌱 Guía de Scripts de IoTHarvest

Este documento describe cómo utilizar los scripts de inicio para ejecutar la aplicación IoTHarvest tanto en modo nativo como en contenedores Docker.

## 📜 Scripts Disponibles

El proyecto IoTHarvest incluye dos scripts principales de inicio:

1. **server.sh** 🖥️: Para ejecutar la aplicación en modo nativo (directamente en el sistema host)
2. **docker.sh** 🐳: Para ejecutar la aplicación en contenedores Docker

## 🖥️ Ejecución en Modo Nativo con `server.sh`

El script `server.sh` permite iniciar los servicios de backend y frontend directamente en el sistema host.

### Requisitos previos para el Modo Nativo

- Node.js 18+ 📦
- npm 📦
- Python 3.10+ 🐍
- Paquetes de Python requeridos (ver `model/requirements.txt`)

### Uso de `server.sh`

```bash
# Iniciar backend y frontend (con pull del repositorio)
./server.sh

# Iniciar solo el frontend
./server.sh --frontend

# Iniciar solo el backend
./server.sh --backend

# Reiniciar servicios (detiene todo, hace pull, y arranca de nuevo)
./server.sh --reset

# Iniciar servicios sin hacer pull del repositorio
./server.sh --test

# Detener todos los servicios
./server.sh --stop
```

## 🐳 Ejecución con Docker usando `docker.sh`

El script `docker.sh` facilita la gestión de contenedores Docker para el proyecto.

### Requisitos previos para Docker

- [Docker](https://docs.docker.com/engine/install/) 🐳
- [Docker Compose](https://docs.docker.com/compose/install/) 🐳

### Uso de `docker.sh`

```bash
# Iniciar todos los servicios
./docker.sh start

# Detener todos los servicios
./docker.sh stop

# Reiniciar los servicios
./docker.sh restart

# Reconstruir los contenedores (si se han realizado cambios)
./docker.sh build

# Reconstruir los contenedores con salida detallada
./docker.sh build-verbose

# Crear imágenes desde cero sin iniciar los contenedores
./docker.sh create

# Eliminar todos los contenedores relacionados con IoTHarvest
./docker.sh rm-containers

# Eliminar todas las imágenes de IoTHarvest
./docker.sh rm-images

# Ver los logs de todos los servicios
./docker.sh logs

# Ver los logs de un servicio específico (backend, frontend, model)
./docker.sh backend
./docker.sh frontend
./docker.sh model

# Ver el estado de los contenedores
./docker.sh status
```

### 🔄 Ejemplos de Flujos de Trabajo con Docker

#### Flujo de trabajo para reconstrucción completa

Si necesita reconstruir completamente el entorno desde cero:

1. **Eliminar todos los contenedores**:
   ```bash
   ./docker.sh rm-containers
   ```

2. **Eliminar todas las imágenes**:
   ```bash
   ./docker.sh rm-images
   ```

3. **Crear imágenes desde cero**:
   ```bash
   ./docker.sh create
   ```

4. **Iniciar todos los servicios**:
   ```bash
   ./docker.sh start
   ```

#### Flujo de trabajo para desarrollo

Durante el desarrollo, es posible que desee:

1. **Realizar cambios en el código** en su entorno local

2. **Reconstruir servicios específicos**:
   ```bash
   ./docker.sh build
   ```

3. **Reiniciar los servicios**:
   ```bash
   ./docker.sh restart
   ```

4. **Verificar logs para detectar errores**:
   ```bash
   ./docker.sh logs
   ```

## 🏗️ Estructura de Contenedores Docker

El proyecto IoTHarvest con Docker se ejecuta en 3 contenedores:

1. **iotharvest-backend** 🖥️: Servicio Node.js que gestiona la API y las solicitudes de datos
2. **iotharvest-frontend** 🖌️: Aplicación React/Vite que proporciona la interfaz de usuario
3. **iotharvest-model** 🧠: Servicio Python que ejecuta predicciones de Machine Learning sobre imágenes

## 📁 Archivos de Configuración Docker

Todos los archivos de configuración Docker están ubicados en la carpeta `/docker`:

- `docker/Dockerfile.backend`: Configuración para el servicio backend
- `docker/Dockerfile.frontend`: Configuración para el servicio frontend
- `docker/Dockerfile.model`: Configuración para el servicio de predicción
- `docker/docker-compose.yml`: Archivo de orquestación de servicios
- `docker/watch-predict-docker.sh`: Script adaptado para el entorno Docker
- `docker/predict-mv-docker.py`: Script de predicción adaptado para Docker

## 🔗 Acceso a los Servicios

Una vez iniciados los servicios (ya sea en modo nativo o Docker), podrá acceder a:

- **Frontend**: http://localhost:8081 🌐
- **Backend API**: http://localhost:8080 🔌

## 💾 Persistencia de Datos

En la configuración Docker, se utilizan volúmenes para mantener los datos persistentes:

- `./backend/data:/app/backend/data`: Comparte la carpeta de datos entre el host y los contenedores, incluyendo imágenes, logs y predicciones
