# 🌱 PTI - FIB
## Projecte de Tecnologies de la Informació

Este proyecto tiene como objetivo desarrollar un sistema inteligente de monitoreo de cultivos basado en IoT. Utilizando sensores conectados a placas TTGO T-Beam ESP32, se recolectarán datos ambientales que se transmitirán mediante LoRa y HTTPS a un servidor web. Además, se integrará una cámara para enviar imágenes de los cultivos al servidor, donde serán evaluadas mediante machine learning para analizar su estado.

Los datos de los sensores se almacenarán en MongoDB, y las imágenes en AWS S3. La visualización se realizará mediante gráficos en la plataforma web, utilizando MongoDB Charts y herramientas como Chart.js. El sistema contará con una API en Node.js, contará con seguridad avanzada y estará dockerizado para garantizar su escalabilidad.

Además, se implementarán alertas automáticas sobre el estado de los cultivos y eventos críticos, optimizando la toma de decisiones en la gestión agrícola.

---

## 📑 Enlaces a los Archivos de Configuración

- [Configuración del Servidor](./backend/SERVER-CONFIG.md): Aquí puedes encontrar toda la configuración necesaria para el servidor que gestiona los datos de los sensores y las imágenes.
<br><br>
- [Configuración de MongoDB](./backend/MONGODB-CONFIG.md): En este archivo se explica cómo instalar y configurar MongoDB para el almacenamiento de los datos.
<br><br>
- [Configuración del Frontend](./frontend/FRONTEND-CONFIG.md): Aquí se describen las dependencias y como de visualizar la página web.