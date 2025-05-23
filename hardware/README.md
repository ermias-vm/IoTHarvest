# 🔌 Hardware - Código ESP32 para IoTHarvest

Este directorio contiene el código fuente para los microcontroladores ESP32 utilizados en el sistema IoTHarvest. Los dispositivos ESP32 actúan como nodos de sensores que recopilan datos ambientales y capturan imágenes de los cultivos.

---

## 📋 Archivos Disponibles

### 📷 **esp32Cam_ToServer.ino**
**Descripción**: Código para ESP32-CAM que captura y envía imágenes directamente al servidor via WiFi.

**Funcionalidades:**
- Captura de imágenes con cámara integrada
- Conexión WiFi para transmisión
- Envío HTTP POST al endpoint `/api/images`
- Configuración de calidad y resolución de imagen
- Gestión de errores de conectividad

**Hardware Requerido:**
- ESP32-CAM (AI Thinker)
- Antena WiFi
- Fuente de alimentación 5V

**Configuración:**
```cpp
const char* ssid = "TU_RED_WIFI";
const char* password = "TU_CONTRASEÑA";
const char* serverUrl = "http://TU_SERVIDOR:PUERTO/api/images";
```

**Pines de Cámara (AI Thinker):**
- PWDN: GPIO 32
- RESET: -1 (no conectado)
- XCLK: GPIO 0
- SIOD/SIOC: GPIO 26/27
- Datos: GPIO 35,34,39,36,21,19,18,5
- VSYNC/HREF/PCLK: GPIO 25,23,22

---

### 📡 **receiver_postServer.ino**
**Descripción**: Código para ESP32 que actúa como receptor y gateway WiFi. Recibe datos de sensores y los reenvía al servidor.

**Funcionalidades:**
- Recepción de datos de sensores
- Conexión WiFi para retransmisión
- Envío HTTP POST al endpoint `/api/sensores`
- Procesamiento de datos JSON

**Hardware Requerido:**
- ESP32 DevKit
- Antena WiFi

**Configuración:**
```cpp
const char* ssid = "TU_RED_WIFI";
const char* password = "TU_CONTRASEÑA";
const char* serverUrl = "http://TU_SERVIDOR:PUERTO/api/sensores";
```

---

### 🌡️ **sender.ino**
**Descripción**: Código para ESP32 con sensores ambientales que envía datos al servidor.

**Funcionalidades:**
- Lectura de sensor DHT11/DHT22 (temperatura y humedad)
- Sensor de humedad de suelo (opcional)
- Transmisión de datos al servidor
- Modo de bajo consumo entre transmisiones

**Hardware Requerido:**
- ESP32 DevKit
- Sensor DHT11 o DHT22
- Sensor de humedad de suelo (opcional)

**Configuración de Sensores:**
```cpp
#define DHTTYPE DHT11    // o DHT22
#define DHTPIN 17        // Pin del sensor DHT
```

---

## 🏗️ Arquitectura del Sistema

### **Topología de Red**
```
[Sensor Nodes]     [Gateway]          [Backend Server]
     │                 │                     │
┌─────────┐       ┌─────────┐         ┌─────────────┐
│ ESP32   │       │ ESP32   │         │   Node.js   │
│ + DHT11 │◄─────►│ Receiver├──WiFi──►│   Backend   │
│ + Soil  │       │         │         │             │
└─────────┘       └─────────┘         └─────────────┘
                                              │
┌─────────┐                                   │
│ESP32-CAM│──────────WiFi─────────────────────┘
│         │
└─────────┘
```

### **Flujo de Datos**
1. **Nodos Sensores** (`sender.ino`) leen datos ambientales
2. **Transmisión** a receptor central via WiFi/HTTP
3. **Gateway** (`receiver_postServer.ino`) recibe y retransmite al servidor
4. **ESP32-CAM** (`esp32Cam_ToServer.ino`) envía imágenes directamente
5. **Backend** procesa y almacena todos los datos
