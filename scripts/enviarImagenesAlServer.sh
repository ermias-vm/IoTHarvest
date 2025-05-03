#!/bin/bash

IN_DIR="../tests/incomingImages"
SERVER_URL="http://localhost:8080/api/upload-image"
INTERVAL=10

if [[ $# -ge 1 ]]; then
  INTERVAL=$1
fi

if [ ! -d "$IN_DIR" ]; then
  echo "Directorio $IN_DIR no existe."
  exit 1
fi

for img in $(ls "$IN_DIR" | sort); do
  FILE="$IN_DIR/$img"
  if [[ "$img" == *.jpg || "$img" == *.jpeg ]]; then
    echo "Enviando $FILE..."
    curl -X POST -F "imagen=@$FILE" $SERVER_URL
    sleep $INTERVAL
  fi
done