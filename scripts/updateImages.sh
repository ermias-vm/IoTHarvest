#!/bin/bash
#
# updateImages.sh - Actualiza la caché de imágenes con la imagen más reciente de Cloudinary
#
# Este script compara la fecha de la imagen más reciente en la caché local con
# la imagen más reciente de Cloudinary. Si la imagen de Cloudinary es más reciente,
# la envía al servidor para ser añadida a la caché automáticamente.
# Se ejecuta en un bucle infinito revisando periódicamente.
#
# Uso: ./updateImages.sh [password] [intervalo]
# - password: Contraseña de administrador para Cloudinary (opcional)
# - intervalo: Segundos entre comprobaciones (por defecto 30)

# Directorios
CACHE_DIR="../backend/data/cache/imageCache"
DOWNLOAD_DIR="../backend/data/test/downloadImages"

# Asegurar que los directorios existan
mkdir -p "$CACHE_DIR"
mkdir -p "$DOWNLOAD_DIR"

# Configuración de tiempo de espera entre iteraciones (en segundos)
INTERVAL=30
if [[ $# -ge 2 ]]; then
  INTERVAL=$2
fi

# Verificar contraseña
if [ -z "$1" ]; then
  read -s -p "Introduce la contraseña de administrador: " ADMIN_PASS
  echo
else
  ADMIN_PASS="$1"
fi

# Función para verificar y actualizar la caché
check_and_update() {
  echo "$(date '+%Y-%m-%d %H:%M:%S') - Iniciando comprobación de imágenes..."
  
  # Obtener la última imagen de Cloudinary
  echo "Descargando la imagen más reciente de Cloudinary..."
  API_URL="http://localhost:8080/api/images/download-cloudinary"
  
  RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" \
    -d "{\"password\":\"$ADMIN_PASS\", \"n\":1}" \
    $API_URL)
  
  # Verificar si la descarga fue exitosa
  if [[ "$RESPONSE" == *"Error"* || "$RESPONSE" == *"error"* ]]; then
    echo "Error al descargar la imagen: $RESPONSE"
    return 1
  fi
  
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
    return 1
  fi
  
  echo "Imagen más reciente descargada: $LATEST_DOWNLOADED_IMAGE"
  # Extraer fecha del nombre del archivo descargado (sin extensión)
  LATEST_DOWNLOADED_DATE="${LATEST_DOWNLOADED_IMAGE%.*}"
  
  # Comparar fechas (formato: YYYY-MM-DD-HH-MM-SS)
  echo "Comparando fechas: $LATEST_DOWNLOADED_DATE vs $LATEST_CACHE_DATE"
  
  if [[ "$LATEST_DOWNLOADED_DATE" > "$LATEST_CACHE_DATE" ]]; then
    echo "La imagen de Cloudinary es más reciente. Enviando al servidor..."
    
    # En lugar de copiar directamente a la caché, enviamos la imagen al servidor
    # usando el script enviarImagenes.sh modificado
    DOWNLOAD_PATH="$DOWNLOAD_DIR/$LATEST_DOWNLOADED_IMAGE"
    ./enviarImagenes.sh 1 0 "$DOWNLOAD_PATH"
    
    echo "Imagen enviada al servidor con éxito. La caché se actualizará automáticamente."
  else
    echo "La imagen en caché es más reciente o igual que la de Cloudinary. No se requiere actualización."
  fi
  
  echo "Comprobación finalizada"
}

# Bucle infinito
echo "Iniciando monitoreo continuo de imágenes cada $INTERVAL segundos. Presiona CTRL+C para detener."
while true; do
  check_and_update
  echo "Esperando $INTERVAL segundos para la próxima comprobación..."
  sleep $INTERVAL
done