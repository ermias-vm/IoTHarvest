# 📌 Configuración del Servidor (Backend)

## 📋 Requisitos Previos
### 🔹 Sistema Operativo
- Debian 12 (o compatible).

### 🔹 Instalación de Node.js y npm
Ejecuta el siguiente comando para instalar Node.js y npm:
```sh
sudo apt install -y nodejs npm
```

### 🔹 Configuración del Entorno Python para el Modelo de IA
El proyecto incluye un modelo de machine learning para clasificación de hojas que requiere Python. Para configurar el entorno necesario:

#### Instalación de herramientas del sistema
```sh
# Actualizar la lista de paquetes del sistema
sudo apt update

# Instalar inotify-tools (necesario para monitorear cambios en archivos)
sudo apt install inotify-tools

# Instalar Python pip y herramientas de entorno virtual
sudo apt install python3-pip python3-venv -y
```

#### Configuración del entorno virtual Python
```sh
# Navegar al directorio del modelo
cd model/

# Crear un entorno virtual de Python
python3 -m venv venv

# Activar el entorno virtual
source venv/bin/activate

# Instalar las dependencias del modelo desde requirements.txt
pip install -r requirements.txt
```


### 🔹 Instalación de Dependencias del Backend

#### Caso 1: Ya tienes package.json y package-lock.json
Desde la carpeta raíz del proyecto, accede al directorio `backend` e instala las dependencias ya definidas:
```sh
cd backend
npm install
```

#### Caso 2: No tienes package.json y necesitas instalar las dependencias desde cero
Desde la carpeta raíz del proyecto, accede al directorio `backend`, inicializa el proyecto y luego instala las dependencias necesarias:
```sh
cd backend
npm init -y
npm install express mongoose dotenv multer bcrypt jsonwebtoken nodemailer cors cloudinary
```

### 🔹 Configuración de MongoDB
Asegúrate de tener MongoDB instalado y configurado. Consulta la guía detallada en [MONGODB-CONFIG.md](./MONGODB-CONFIG.md).<br><br><br>

---

## ⚙️ Configuración del Modo de Conexión
El servidor puede ejecutarse en dos modos distintos:
- **Modo Local** (MongoDB en la misma máquina).
- **Modo Cluster** (MongoDB en un servidor remoto).

Para seleccionar el modo, edita el archivo `server.js` y asigna el valor correspondiente a `USED_DB`:
```js
// Para usar una base de datos local:
const USED_DB = LOCAL;

// Para usar un clúster remoto:
const USED_DB = CLUSTER;
```

---

## 🚀 Ejecución del Servidor

Para iniciar el servidor, accede al directorio `backend` y ejecuta:
```sh
cd backend
node server.js
```

Si la ejecución es correcta, verás en la terminal un mensaje similar a:
```
Servidor corriendo en puerto 1500
Conectado a MongoDB [XXXX]
```
donde `XXXX` indicará si la conexión se ha realizado en **modo LOCAL** o **modo CLUSTER**, según la configuración elegida.

---


✅ ¡El servidor ya está listo para funcionar! 🎯
