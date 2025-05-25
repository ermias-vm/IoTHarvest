#!/bin/bash
# Uso:
#   ./enviarImagenes.sh [NUM_IMAGENES] [INTERVALO] [PATH_IMAGEN]
# - NUM_IMAGENES: número total de imágenes a enviar (por defecto 1)
# - INTERVALO: segundos entre cada envío (por defecto 10)
# - PATH_IMAGEN: ruta específica a una imagen (opcional)
# Ejemplo: ./enviarImagenes.sh 7 10
# Ejemplo con path: ./enviarImagenes.sh 1 0 /ruta/a/imagen.jpg

IN_DIR="../backend/data/test/testImages"
SERVER_URL="http://localhost:8080/api/images"
INTERVAL=10
NUM_IMAGES=1
SPECIFIC_IMAGE=""

if [[ $# -ge 1 ]]; then
  NUM_IMAGES=$1
fi

if [[ $# -ge 2 ]]; then
  INTERVAL=$2
fi

if [[ $# -ge 3 ]]; then
  SPECIFIC_IMAGE=$3
  # Si se proporciona una imagen específica, usamos esa directamente
  if [ -f "$SPECIFIC_IMAGE" ]; then
    echo "Enviando imagen específica: $SPECIFIC_IMAGE"
    curl -X POST -F "imagen=@$SPECIFIC_IMAGE" $SERVER_URL
    echo "Envío de imagen específica completado."
    exit 0
  else
    echo "El archivo $SPECIFIC_IMAGE no existe."
    exit 1
  fi
fi

if [ ! -d "$IN_DIR" ]; then
  echo "Directorio $IN_DIR no existe."
  exit 1
fi

# Obtener lista ordenada de imágenes jpg/jpeg
IMAGES=($(ls "$IN_DIR" | grep -Ei '\.jpe?g$' | sort))
NUM_FILES=${#IMAGES[@]}

if [[ $NUM_FILES -eq 0 ]]; then
  echo "No hay imágenes JPG en $IN_DIR."
  exit 1
fi

for ((i=0; i<NUM_IMAGES; i++)); do
  idx=$((i % NUM_FILES))
  FILE="$IN_DIR/${IMAGES[$idx]}"
  echo "Enviando $FILE... ($((i+1))/$NUM_IMAGES)"
  curl -X POST -F "imagen=@$FILE" $SERVER_URL
  if [[ $i -lt $((NUM_IMAGES-1)) ]]; then
    sleep $INTERVAL
  fi
done

echo "Envío de imágenes completado."