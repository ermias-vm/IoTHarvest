# 📤 Enviar Datos de Prueba al Servidor

## 📋 Requisitos Previos

### 🔹 Conexión a MongoDB

Asegúrate de haber configurado correctamente la conexión:
- Si utilizas un cluster de MongoDB, verifica que:
    - La conexión al cluster esté activa y accesible.
    - Las credenciales (usuario y contraseña) sean correctas y tengan los permisos necesarios.
    - La red y la configuración del cluster permitan la comunicación desde el entorno donde se ejecuta el script.

- También es posible probar de forma local:
    - Crea la base de datos Mongo local.
    - Selecciona cuál de las dos utilizar modificando la configuración en el archivo [server.js](../../backend/server.js).


### 🔹 Servidor Activo
Verifica que el servidor esté corriendo y que el endpoint `/api/sensores` esté disponible para recibir los datos. 
Consulta guia detallada  en  [SERVER_CONFIG.md](../../backend/SERVER_CONFIG.md).


---

## ⚙️ Configuración y Ejecución del Script de Envío

### 🔹 Configuración de Parámetros
Puedes especificar:
- El número de datos a enviar.
- El tiempo entre envíos.

Si no se especifica:
- Por defecto se enviarán 10 datos.
- El intervalo entre envíos será de 1 segundo.

### 🔹 Ejecución del Script
Accede a la carpeta `../tests/server_mongoDB` y ejecuta el siguiente comando:
```sh
./enviarDatosSensoresToServer.sh [número_de_envíos] [tiempo_entre_envíos]
```

📝 Ejemplo:
Para enviar 20 datos con una espera de 3 segundos entre cada uno:
```sh
./enviarDatosSensoresToServer.sh 20 3
```

---

## 🖥️ Verificación de Datos Enviados

### Último Dato Almacenado
- **Endpoint:** `/api/sensores/ultimo`
- **Método:** GET
- **Descripción:** Devuelve el último conjunto de datos enviado.
```sh
curl -X GET http://localhost:1500/api/sensores/ultimo
```

### Últimos X Datos
- **Endpoint:** `/api/sensores/ultimos/:cantidad`
- **Método:** GET
- **Descripción:** Devuelve los últimos X registros de datos.
```sh
curl -X GET http://localhost:1500/api/sensores/ultimos/10
```

### Todos los Datos Almacenados
- **Endpoint:** `/api/sensores`
- **Método:** GET
- **Descripción:** Devuelve todos los datos almacenados en la base de datos.
```sh
curl -X GET http://localhost:1500/api/sensores
```
