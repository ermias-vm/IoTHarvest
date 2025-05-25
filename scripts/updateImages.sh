#!/bin/bash
#
# updateImages.sh - Actualiza la caché de imágenes con la imagen más reciente de Cloudinary
#
# Este script compara la fecha de la imagen más reciente en la caché local con
# la imagen más reciente de Cloudinary. Si la imagen de Cloudinary es más reciente,
# la añade a la caché. Si la caché tiene más de 14 imágenes, elimina la más antigua.
#
# Uso: ./updateImages.sh [password]

# Directorios
CACHE_DIR="../backend/data/cache/imageCache"
DOWNLOAD_DIR="../backend/data/test/downloadImages"
MAX_CACHE_IMAGES=14

# Asegurar que los directorios existan
mkdir -p "$CACHE_DIR"
mkdir -p "$DOWNLOAD_DIR"

# Verificar contraseña
if [ -z "$1" ]; then
  read -s -p "Introduce la contraseña de administrador: " ADMIN_PASS
  echo
else
  ADMIN_PASS="$1"
fi

# Obtener la última imagen de cloudinary
echo "Descargando la imagen más reciente de Cloudinary..."
API_URL="http://localhost:8080/api/images/download-cloudinary"

RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" \
  -d "{\"password\":\"$ADMIN_PASS\", \"n\":1}" \
  $API_URL)

# Verificar si la descarga fue exitosa
if [[ "$RESPONSE" == *"Error"* || "$RESPONSE" == *"error"* ]]; then
  echo "Error al descargar la imagen: $RESPONSE"
  exit 1
fi
ls

# Obtener la imagen más reciente de la caché (basada en el nombre del archivo con formato fecha)
LATEST_CACHE_IMAGE=$(ls -t "$CACHE_DIR" 2>/dev/null | head -n 1)
if [ -z "$LATEST_CACHE_IMAGE" ]; then
  echo "No se encontraron imágenes en la caché"
  LATEST_CACHE_DATE="2000-01-01-00-00-00" # Fecha antigua para que cualquier imagen sea más reciente
else
  echo "Imagen más reciente en caché: $LATEST_CACHE_IMAGE"
  # Extraer solo la fecha del nombre del archivo (sin extensión)
  LATEST_CACHE_DATE="${LATEST_CACHE_IMAGE%.*}"
fi

# Obtener la imagen más reciente descargada de Cloudinary
LATEST_DOWNLOADED_IMAGE=$(ls -t "$DOWNLOAD_DIR" 2>/dev/null | head -n 1)
if [ -z "$LATEST_DOWNLOADED_IMAGE" ]; then
  echo "No se encontraron imágenes descargadas de Cloudinary"
  exit 1
fi

echo "Imagen más reciente descargada: $LATEST_DOWNLOADED_IMAGE"
# Extraer fecha del nombre del archivo descargado (sin extensión)
LATEST_DOWNLOADED_DATE="${LATEST_DOWNLOADED_IMAGE%.*}"

# Comparar fechas (formato: YYYY-MM-DD-HH-MM-SS)
echo "Comparando fechas: $LATEST_DOWNLOADED_DATE vs $LATEST_CACHE_DATE"

if [[ "$LATEST_DOWNLOADED_DATE" > "$LATEST_CACHE_DATE" ]]; then
  echo "La imagen de Cloudinary es más reciente. Añadiendo a la caché..."
  # Copiar la imagen descargada a la caché
  cp "$DOWNLOAD_DIR/$LATEST_DOWNLOADED_IMAGE" "$CACHE_DIR/"
  
  # Verificar si la caché tiene más de MAX_CACHE_IMAGES imágenes
  CACHE_COUNT=$(ls "$CACHE_DIR" | wc -l)
  if [ "$CACHE_COUNT" -gt "$MAX_CACHE_IMAGES" ]; then
    echo "La caché contiene más de $MAX_CACHE_IMAGES imágenes. Eliminando la más antigua..."
    OLDEST_IMAGE=$(ls -t "$CACHE_DIR" | tail -n 1)
    rm "$CACHE_DIR/$OLDEST_IMAGE"
    echo "Imagen eliminada: $OLDEST_IMAGE"
  fi
  
  echo "Actualización completada con éxito"
else
  echo "La imagen en caché es más reciente o igual que la de Cloudinary. No se requiere actualización."
fi

echo "Proceso finalizado"