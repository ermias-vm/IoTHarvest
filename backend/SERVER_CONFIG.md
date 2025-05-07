# 📌 Configuración del Servidor (Backend)

## 📋 Requisitos Previos
### 🔹 Sistema Operativo
- Debian 12 (o compatible).

### 🔹 Instalación de Node.js y npm
Ejecuta el siguiente comando para instalar Node.js y npm:
```sh
sudo apt install -y nodejs npm
```

### 🔹 Instalación de Dependencias

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
npm install express mongoose dotenv multer bcrypt jsonwebtoken  nodemailer
```

### 🔹 Configuración de MongoDB
Asegúrate de tener MongoDB instalado y configurado. Consulta la guía detallada en [MONGODB_CONFIG.md](./MONGODB_CONFIG.md).<br><br><br>

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

## 📤 Enviar Datos de Prueba

Para enviar datos de prueba al servidor y almacenarlos, ejecuta el script de envío siguiendo las instrucciones disponibles en [ENVIAR_DATOS_PRUEBA.md](../scripts/ENVIAR_DATOS_PRUEBA.md).

---

## 🖥️ Acceso a los Endpoints

### Últimos Datos Almacenados en Caché
- **Endpoint:** `/api/sensores/ultimo`  
- **Método:** GET  
- **Descripción:** Devuelve el último conjunto de datos recibido y almacenado en caché.
```sh
curl -X GET http://localhost:8080/api/sensores/ultimo
```

### Últimos X Datos
- **Endpoint:** `/api/sensores/ultimos/:cantidad`  
- **Método:** GET  
- **Descripción:** Devuelve los últimos X registros almacenados en la base de datos.
```sh
curl -X GET http://localhost:8080/api/sensores/ultimos/5
```

### Todos los Datos Almacenados
- **Endpoint:** `/api/sensores`  
- **Método:** GET  
- **Descripción:** Devuelve todos los datos almacenados en la base de datos.
```sh
curl -X GET http://localhost:8080/api/sensores
```

✅ ¡El servidor ya está listo para funcionar! 🎯
