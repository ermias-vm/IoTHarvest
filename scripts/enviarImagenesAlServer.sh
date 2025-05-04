#!/bin/bash
# Uso:
#   ./enviarImagenesAlServer.sh [NUM_IMAGENES] [INTERVALO]
# - NUM_IMAGENES: número total de imágenes a enviar (por defecto 1)
# - INTERVALO: segundos entre cada envío (por defecto 1)
# Ejemplo: ./enviarImagenesAlServer.sh 7 10

IN_DIR="../tests/testImages"
SERVER_URL="http://localhost:8080/api/images"
INTERVAL=1
NUM_IMAGES=1

if [[ $# -ge 1 ]]; then
  NUM_IMAGES=$1
fi

if [[ $# -ge 2 ]]; then
  INTERVAL=$2
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