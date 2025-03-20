# Configuración del Servidor (Backend)

## Requisitos Previos
- Sistema operativo: Debian 12 (o compatible).
- Node.js y npm instalados:
```sh
sudo apt install -y nodejs npm
```

- Instala las dependencias necesarias para el servidor y la conexión a MongoDB.<br>
Desde la carpeta raiz del proyecto:

```sh
cd backend
npm install express mongoose
```
- MongoDB instalado y configurado ver [MONGODB_CONFIG.md](./MONGODB_CONFIG.md)