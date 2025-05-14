#!/bin/bash
# Versión Docker de watch-predict.sh

# Definir rutas para el entorno Docker
TARGET_DIR="/app/backend/data/leaf_classification/last_image"
PREDICT_SCRIPT_FULL_PATH="/app/model/predict-mv.py"
PYTHON_CMD="python"
PID_FILE="/app/watch-predict.pid"
LOG_FILE="/app/backend/data/leaf_classification/logs/watch-predict.log"

# Escribir PID en archivo para gestión
echo $$ > $PID_FILE

# Verificar herramientas requeridas
if ! command -v inotifywait &> /dev/null; then
    echo "[ERROR] $(date): inotifywait no está instalado. Saliendo." >&2
    exit 1
fi

if [ ! -f "$PREDICT_SCRIPT_FULL_PATH" ]; then
    echo "[ERROR] $(date): Script de predicción ($PREDICT_SCRIPT_FULL_PATH) no encontrado. Saliendo." >&2
    exit 1
fi

# Asegurar que el directorio objetivo existe
if [ ! -d "$TARGET_DIR" ]; then
  echo "[INFO] $(date): Creando directorio vigilado: $TARGET_DIR"
  mkdir -p "$TARGET_DIR"
  if [ $? -ne 0 ]; then
    echo "[ERROR] $(date): No se pudo crear $TARGET_DIR. Saliendo." >&2
    exit 1
  fi
fi

echo "[INFO] $(date): Iniciando servicio de vigilancia Docker en $TARGET_DIR."
echo "[INFO] $(date): Usando Python: $PYTHON_CMD"
echo "[INFO] $(date): Script a ejecutar: $PREDICT_SCRIPT_FULL_PATH"
echo "--- Presiona Ctrl+C para detener ---"

# Bucle principal de monitoreo
while true; do
  # Esperar eventos de creación de archivos en el directorio objetivo
  inotifywait -q -e create --format '%w%f' -t 60 "$TARGET_DIR" |
  while IFS= read -r filepath; do
    if [ -n "$filepath" ]; then
        filename=$(basename "$filepath")
        echo "[EVENT] $(date): Archivo '$filename' detectado."
        
        # Esperar 3 segundos para asegurar que el archivo está completamente escrito
        # y para darle tiempo al backend para finalizar sus operaciones
        echo "[WAIT] $(date): Esperando 3 segundos para completar el archivo..."
        sleep 3
        
        # Verificar que el archivo todavía existe
        if [ ! -f "$filepath" ]; then
            echo "[ERROR] $(date): El archivo '$filename' ya no existe. Omitiendo predicción."
            continue
        fi
        
        echo "[ACTION] $(date): Ejecutando: $PYTHON_CMD $PREDICT_SCRIPT_FULL_PATH"
        
        # Ejecutar el script de predicción
        $PYTHON_CMD $PREDICT_SCRIPT_FULL_PATH
        
        echo "[ACTION_DONE] $(date): Ejecución de predicción finalizada para '$filename'."
    fi
  done
  sleep 1
done
