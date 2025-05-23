
# 🗄️ Instalación y Configuración de MongoDB

## 📋 Requisitos Previos
### 🔹 Sistema Operativo
- Debian 12 (o compatible).

### 🔹 Enlace para la instalación de MongoDB
Para instalar MongoDB, sigue los pasos detallados en la documentación oficial de MongoDB para Linux:
[Instalar MongoDB en Linux](https://www.mongodb.com/docs/manual/administration/install-on-linux/)

### 🔹 Enlace para instalar MongoDB Compass (Interfaz gráfica)
Si prefieres usar una interfaz gráfica para interactuar con MongoDB, puedes descargar MongoDB Compass desde aquí:
[Descargar MongoDB Compass](https://www.mongodb.com/try/download/compass)

---

## 🚀 Instalación de MongoDB
### 1. **Configurar MongoDB para escuchar en todas las interfaces**
Edita el archivo de configuración de MongoDB para permitir conexiones desde todas las interfaces de red. Abre el archivo uno de los siguientes comandos:
```sh
sudo nano /etc/mongod.conf
sudo vim /etc/mongod.conf
```

Busca la línea que contiene `bindIp` y cámbiala a `0.0.0.0`, para permitir conexiones remotas:
```yaml
net:
  port: 27017
  bindIp: 0.0.0.0
```

Guarda los cambios y reinicia el servicio de MongoDB para que tome efecto:
```sh
sudo systemctl restart mongod
```

---

## ⚙️ Acceso a MongoDB
### 1. **Conectar a MongoDB**
Accede al shell de MongoDB usando `mongosh`:
```sh
mongosh
```

### 2. **Obtener el enlace de conexión**
Una vez dentro de `mongosh`,copia el enlace de conexión a la base de datos. Un ejemplo sería:
```
mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.4.2
```

### 3. **Seleccionar la base de datos**
Selecciona  o crea (si no existe) la base de datos `iotharvest`, usa el siguientee comando:
```sh
use iotharvest
```

### 4. **Verificar las bases de datos existentes**
Puedes verificar que la base de datos fue creada correctamente con el siguiente comando:
```sh
show dbs
```

### 5. **Crear la colección `sensorsData`**
Si no tienes la colección `sensorsData`, créala con el siguiente comando:
```sh
db.createCollection("sensorsData")
```

### 6. **Verificar las colecciones**
Para verificar que la colección fue creada correctamente, utiliza el siguiente comando:
```sh
show collections
```

### 7. **Insertar un dato de prueba**
Para insertar un dato de prueba en la colección `sensorsData`, puedes usar el siguiente comando:
```sh
db.sensorsData.insertOne({ temperatura: 22, humedad: 55 })
```

### 8. **Consultar los datos almacenados**
Para ver los datos almacenados en la colección `sensorsData`, utiliza el siguiente comando:
```sh
db.sensorsData.find()
```

---

### 9. **Ahora ya puedes configurar el servidor**
Continúa con la configuración del servidor en [SERVER-CONFIG.md](./SERVER-CONFIG.md). Busca la sección **"⚙️ Configuración del Modo de Conexión"** para configurar el modo de base de datos (Local o Cluster).


