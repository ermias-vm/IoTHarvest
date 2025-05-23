# 🎨 Configuración del Frontend (Interfaz Web)

## 📋 Requisitos Previos
### 🔹 Sistema Operativo
- Debian 12 (o compatible).

### 🔹 Instalación de Node.js y npm
Si aún no tienes Node.js y npm instalados, ejecuta:
```sh
sudo apt install -y nodejs npm
```

**Nota:** Si ya configuraste el backend, este paso ya está completado.

---

## ⚙️ Instalación de Dependencias del Frontend

### 🔹 Caso 1: Ya tienes package.json y package-lock.json
Desde la carpeta raíz del proyecto, accede al directorio del frontend e instala las dependencias ya definidas:
```sh
cd frontend/my-app
npm install
```

### 🔹 Caso 2: Instalación desde cero (si no tienes package.json)
Si necesitas crear el proyecto desde cero:
```sh
cd frontend/my-app
npm init -y
npm install react react-dom @vitejs/plugin-react vite
npm install --save-dev @types/react @types/react-dom typescript
```

---

## 🚀 Ejecución del Frontend

### 🔹 Modo Desarrollo
Para iniciar el servidor de desarrollo con recarga automática:
```sh
cd frontend/my-app
npm run dev
```

Si la ejecución es correcta, verás en la terminal un mensaje similar a:
```
  Local:   http://localhost:8081/
  Network: http://192.168.x.x:8081/
```

---

## 🌐 Acceso a la Aplicación Web

Una vez iniciado el servidor de desarrollo, puedes acceder a la interfaz web mediante:

- **Acceso local:** http://localhost:8081
- **Acceso desde la red local:** http://[tu-ip-local]:8081

### 🔹 Funcionalidades Principales
La interfaz web permite:
- 📊 **Visualización de datos de sensores** en tiempo real
- 📈 **Gráficos interactivos** con histórico de mediciones
- 🖼️ **Galería de imágenes** enviadas por los dispositivos IoT
- 🤖 **Resultados del análisis de IA** sobre el estado de las plantas

<br>
✅ ¡El frontend ya está listo para funcionar! 🎯