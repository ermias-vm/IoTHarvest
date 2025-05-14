
# 🌿 Modelo de Clasificación de Hojas

## 📋 Descripción
Este modelo de inteligencia artificial está diseñado para analizar y clasificar el estado de salud de las hojas de cultivos.
Utiliza una arquitectura de red neuronal convolucional **DenseNet121** de Keras para determinar si una hoja está sana o enferma.

## 🧠 Características del modelo
- **Arquitectura:** DenseNet121 (pre-entrenada y ajustada a nuestro caso)
- **Clasificación binaria:** Sano / Enfermo

## 🚀 Entrenamiento del modelo

### Requisitos previos
- Python 3.10+ con TensorFlow/Keras
- Dataset organizado según esta estructura:
```
dataset/
    ├── healthy/     # Imágenes de hojas sanas
    └── unhealthy/   # Imágenes de hojas enfermas
```

### Pasos para el entrenamiento

1. **Preparación de imágenes:**
   ```bash
   python3 patcher.py
   ```
   > Este script procesa todas las imágenes del dataset, recortándolas y centrándolas para que el modelo se enfoque en la textura y patrones de las hojas más que en su forma general.

2. **Entrenamiento del modelo:**
   ```bash
   python3 model_training2.py
   ```
   > - El número de épocas de entrenamiento se puede modificar a través de la variable `EPOCHS` en el script.
   > - El proceso puede tardar varios minutos dependiendo del tamaño del dataset y la potencia de su hardware.
   > - Al finalizar, el script generará una matriz de confusión que indica la precisión del modelo.
   > - El modelo entrenado se guardará como `leaf_patch_model.h5`

## 🔍 Uso del modelo para predicciones

En el entorno de producción, el modelo se utiliza a través del script `predict-mv.py` que está configurado para trabajar con el sistema IoTHarvest de la siguiente manera:

1. **Vigilancia de nuevas imágenes:**
   - El script `watch-predict.sh` monitorea continuamente el directorio:
     ```
     backend/data/leaf_classification/last_image/
     ```
   - Cuando se detecta una nueva imagen, se activa automáticamente el proceso de predicción.

2. **Proceso de predicción:**
   ```bash
   python3 predict-mv.py
   ```
   - Carga la imagen del directorio vigilado
   - La preprocesa (redimensiona y normaliza)
   - Realiza la predicción usando el modelo entrenado
   - Guarda el resultado en `last_prediction.txt`
   - Mueve la imagen analizada al directorio de imágenes procesadas

3. **Códigos de salida:**
   - `0`: Error - No se encontró ninguna imagen
   - `1`: La hoja está saludable
   - `2`: La hoja está enferma
   - `3`: Error indeterminado durante el proceso

## 🐳 Uso en Docker

En el entorno Docker, se utiliza una versión adaptada:
- Script: `predict-mv-docker.py`
- Monitor: `watch-predict-docker.sh`

Los resultados se comparten con el backend a través de volúmenes Docker configurados en `docker-compose.yml`.

