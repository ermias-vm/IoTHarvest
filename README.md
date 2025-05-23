# 🌱 IoTHarvest


**IoTHarvest** es un sistema inteligente de monitoreo agrícola basado en tecnologías IoT que optimiza la gestión de cultivos mediante la integración de sensores ambientales, análisis de imágenes con inteligencia artificial y alertas automáticas en tiempo real.

## 🎯 Objetivo del Proyecto

Desarrollar una plataforma completa que permita a los agricultores optimizar el cuidado de sus cultivos mediante:

- 📊 **Monitoreo continuo** de condiciones ambientales
- 🤖 **Análisis automático** del estado de las plantas usando IA
- 📱 **Interfaz web intuitiva** para visualización de datos
- 🚨 **Sistema de alertas** para eventos críticos
- 📈 **Análisis histórico** para la toma de decisiones

---

## 🏗️ Arquitectura del Sistema

### 🔧 Hardware IoT
- **Placas ESP32** con conectividad WiFi
- **Sensores ambientales** para temperatura, humedad del aire y suelo
- **Cámaras integradas** para captura de imágenes de cultivos
- **Transmisión HTTP/HTTPS** para datos de sensores e imágenes

### 💾 Almacenamiento de Datos
- **MongoDB**: Base de datos principal (local o cluster) para datos de sensores y metadatos
- **Cloudinary**: Almacenamiento en la nube para imágenes de cultivos
- **Sistema de caché local**: Optimización de rendimiento y redundancia

### 🤖 Inteligencia Artificial
- **Modelo de Machine Learning** entrenado para clasificación de hojas
- **Análisis automático** del estado de salud de las plantas
- **Detección de enfermedades** y problemas en los cultivos


### 🌐 Plataforma Web
- **API RESTful** desarrollada en Node.js con Express
- **Frontend responsivo** construido con React y TypeScript
- **Gráficos interactivos** usando Chart.js para visualización de datos
- **Autenticación segura** con JWT
- **Sistema de notificaciones** por correo electrónico

### 🔒 Seguridad y Escalabilidad
- **Containerización completa** con Docker y Docker Compose
- **Variables de entorno** para gestión segura de credenciales
- **Arquitectura modular** para fácil mantenimiento y escalado
- **Encriptación de contraseñas** con bcrypt para protección de contraseñas
- **Tokens JWT seguros** para sesiones de usuario y autenticación API

---

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** + Express.js - Servidor y API
- **MongoDB** - Base de datos principal
- **Mongoose** - ODM para MongoDB
- **Cloudinary** - Almacenamiento de imágenes
- **Nodemailer** - Sistema de correos
- **JWT** - Autenticación segura
- **Bcrypt** - Encriptación de contraseñas

### Frontend
- **React 18** - Biblioteca de interfaz usuario
- **TypeScript** - Tipado estático
- **Vite** - Herramienta de desarrollo

### Machine Learning
- **Python 3** - Lenguaje principal para IA
- **TensorFlow/Keras** - Framework de deep learning
- **Pillow (PIL)** - Procesamiento de imágenes
- **NumPy** - Manipulación de arrays (incluido con TensorFlow)
- **Scikit-learn** - Métricas y utilidades de ML
- **Matplotlib** - Visualización durante entrenamiento

### DevOps y Deployment
- **Docker** - Containerización
- **Docker Compose** - Orquestación de servicios
- **Git** - Control de versiones

### Hardware
- **ESP32** - Microcontrolador principal
- **WiFi** - Comunicación inalámbrica
- **Sensores DHT22** - Temperatura y humedad
- **Sensores de humedad de suelo** - Monitoreo del sustrato



---

## 📑 Enlaces a los Archivos de Configuración

- [Configuración del Servidor](./backend/SERVER-CONFIG.md): Aquí puedes encontrar toda la configuración necesaria para el servidor que gestiona los datos de los sensores y las imágenes.
<br><br>
- [Configuración de MongoDB](./backend/MONGODB-CONFIG.md): En este archivo se explica cómo instalar y configurar MongoDB para el almacenamiento de los datos.
<br><br>
- [Configuración del Frontend](./frontend/FRONTEND-CONFIG.md): Aquí se describen las dependencias y como de visualizar la página web.
<br><br>
- [Configuración de Docker](./docker/README.md): Documentación completa sobre la containerización del proyecto, instalación de Docker y orquestación de servicios.

---

## 🚀 Guía de Inicio Rápido

- [Scripts de Inicio y Gestión](./START-SCRIPTS.md): Guía completa para ejecutar y gestionar el proyecto con scripts automatizados.
<br><br>
- [Scripts de Pruebas y Configuración](./scripts/SCRIPTS-CONFIG.md): Scripts utilitarios para pruebas, envío de datos y gestión del sistema.

---

## 👥 Créditos 

Este proyecto ha sido desarrollado como parte del **Proyecto de Tecnologías de la Información** de la **Facultat d'Informàtica de Barcelona (FIB)**.

### Equipo de Desarrollo

- [Marc De Rialp](https://github.com/Derri725)
- [David Franco](https://github.com/david-franco-escribano)
- [Pau Quílez](https://github.com/pau-quilez)
- [Ermias Valls](https://github.com/ermias-vm)
- [Anna Vincken](https://github.com/avincken)




