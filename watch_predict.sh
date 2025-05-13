#!/bin/bash
# watch_predict.sh (Versión Simplificada)
# Vigila la carpeta de imágenes y ejecuta el script de predicción usando el venv.

# Rutas relativas a la raíz del proyecto (donde se espera que esté este script)
TARGET_DIR_RELATIVE="backend/data/leaf_classification/last_image"
PREDICT_SCRIPT_RELATIVE="model/predict_mv.py"
VENV_DIR_RELATIVE="model/venv"

# Obtener la ruta absoluta del directorio donde se encuentra este script (raíz del proyecto)
SCRIPT_DIR_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)

# Construir rutas absolutas
TARGET_DIR="$SCRIPT_DIR_ROOT/$TARGET_DIR_RELATIVE"
PREDICT_SCRIPT_FULL_PATH="$SCRIPT_DIR_ROOT/$PREDICT_SCRIPT_RELATIVE"
PYTHON_CMD_IN_VENV="$SCRIPT_DIR_ROOT/$VENV_DIR_RELATIVE/bin/python3"

# --- Verificaciones Mínimas ---
if ! command -v inotifywait &> /dev/null; then
    echo "[ERROR] $(date): inotifywait no está instalado. Salir." >&2
    exit 1
fi

if [ ! -x "$PYTHON_CMD_IN_VENV" ]; then
    echo "[ERROR] $(date): Python del venv ($PYTHON_CMD_IN_VENV) no encontrado o no ejecutable. Salir." >&2
    exit 1
fi

if [ ! -f "$PREDICT_SCRIPT_FULL_PATH" ]; then
    echo "[ERROR] $(date): Script de predicción ($PREDICT_SCRIPT_FULL_PATH) no encontrado. Salir." >&2
    exit 1
fi

if [ ! -d "$TARGET_DIR" ]; then
  echo "[INFO] $(date): Creando directorio vigilado: $TARGET_DIR"
  mkdir -p "$TARGET_DIR"
  if [ $? -ne 0 ]; then
    echo "[ERROR] $(date): No se pudo crear $TARGET_DIR. Salir." >&2
    exit 1
  fi
fi

echo "[INFO] $(date): Iniciando vigilancia simplificada en $TARGET_DIR."
echo "[INFO] $(date): Usando Python: $PYTHON_CMD_IN_VENV"
echo "[INFO] $(date): Script a ejecutar: $PREDICT_SCRIPT_FULL_PATH"
echo "--- Presiona Ctrl+C para detener ---"

# Bucle principal
while true; do
  # Espera a que se cree un archivo en el directorio.
  # -e create: solo reacciona a la creación de archivos.
  # --format '%w%f': emite la ruta completa del archivo creado.
  # El timeout es opcional, pero puede ayudar a que el script no se bloquee indefinidamente
  # si algo va mal con inotifywait o para permitir interrupciones periódicas.
  inotifywait -q -e create --format '%w%f' -t 60 "$TARGET_DIR" |
  while IFS= read -r filepath; do # Lee cada archivo detectado
    if [ -n "$filepath" ]; then # Asegurarse de que filepath no esté vacío
        filename=$(basename "$filepath")
        echo "[EVENT] $(date): Archivo '$filename' detectado."
        echo "[ACTION] $(date): Ejecutando: $PYTHON_CMD_IN_VENV $PREDICT_SCRIPT_FULL_PATH"
        
        # Ejecutar el script de predicción.
        # La salida del script de Python irá a donde esté configurada la salida de watch_predict.sh
        # (stdout/stderr de la terminal si se ejecuta directamente, o al log si start_server.sh lo redirige).
        "$PYTHON_CMD_IN_VENV" "$PREDICT_SCRIPT_FULL_PATH"
        
        # Aquí no se captura el código de salida para simplificar,
        # pero se podría añadir si se necesita un logging más detallado de errores.
        echo "[ACTION_DONE] $(date): Ejecución de predicción finalizada para '$filename'."
    fi
  done
  # Pequeña pausa para evitar consumo excesivo de CPU si inotifywait sale inmediatamente
  # (ej. si el directorio vigilado se elimina y se recrea rápidamente).
  sleep 1
done