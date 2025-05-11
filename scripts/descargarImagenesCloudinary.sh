#!/bin/bash
# Uso: ./descargarImagenesCloudinary.sh [N]
# Descarga las últimas N imágenes de Cloudinary a backend/data/test/downloadImages (requiere contraseña admin)

N=${1:-1}
if [[ $N -gt 10 ]]; then N=10; fi

read -s -p "Introduce la contraseña de administrador: " PASS
echo

API_URL="http://localhost:8080/api/images/download-cloudinary"

RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" \
  -d "{\"password\":\"$PASS\", \"n\":$N}" \
  $API_URL)

echo "$RESPONSE"