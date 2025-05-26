#!/bin/bash
#
# updateSensores.sh - Actualiza la caché de sensores con los datos más recientes de MongoDB
#
# Este script compara la fecha del dato más reciente en la caché local con
# el dato más reciente de MongoDB (sensorDataOptimized). Si el dato de MongoDB es más reciente,
# lo envía al servidor para ser añadido a la caché automáticamente.
# Se ejecuta en un bucle infinito revisando periódicamente.
#
# Uso: ./updateSensores.sh [password] [intervalo]
# - password: Contraseña de administrador para MongoDB (opcional)
# - intervalo: Segundos entre comprobaciones (por defecto 30)

# Configuración
CACHE_FILE="../backend/data/cache/sensorCache.json"
SERVER_URL="http://localhost:8080/api/sensores"
MONGO_API_URL="http://localhost:8080/api/sensores/ultimos/1"

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
  echo "$(date '+%Y-%m-%d %H:%M:%S') - Iniciando comprobación de datos de sensores..."
  
  # Obtener el dato más reciente de la caché local
  if [ -f "$CACHE_FILE" ]; then
    echo "Verificando dato más reciente en caché..."
    # Usamos jq para obtener el timestamp más reciente de la caché
    LATEST_CACHE_TIME=$(jq -r 'map(.timeServer) | max' "$CACHE_FILE")
    echo "Dato más reciente en caché: $LATEST_CACHE_TIME"
  else
    echo "No se encontró el archivo de caché: $CACHE_FILE"
    LATEST_CACHE_TIME="2000-01-01T00:00:00.000Z" # Fecha antigua para que cualquier dato sea más reciente
  fi
  
  # Obtener el dato más reciente de MongoDB
  echo "Obteniendo dato más reciente de MongoDB..."
  MONGO_RESPONSE=$(curl -s -X GET $MONGO_API_URL)
  
  # Verificar si la petición fue exitosa y extraer el timestamp del dato más reciente
  if [[ "$MONGO_RESPONSE" == *"Error"* || "$MONGO_RESPONSE" == *"error"* ]]; then
    echo "Error al obtener los datos de MongoDB: $MONGO_RESPONSE"
    return 1
  fi
  
  # Extraer el timestamp y los datos del sensor más reciente (ahora es un array)
  LATEST_MONGO_TIME=$(echo $MONGO_RESPONSE | jq -r '.[0].timeServer')
  
  # Verificar si es dato de prueba (isTestData)
  IS_TEST_DATA=$(echo $MONGO_RESPONSE | jq -r '.[0].isTestData')
  echo "Dato más reciente en MongoDB: $LATEST_MONGO_TIME"
  
  # Comparar timestamps
  echo "Comparando timestamps: MongoDB ($LATEST_MONGO_TIME) vs Caché ($LATEST_CACHE_TIME)"
  
  if [[ "$LATEST_MONGO_TIME" > "$LATEST_CACHE_TIME" ]]; then
    echo "El dato de MongoDB es más reciente."
    
    # Verificar si el dato es de prueba (isTestData: true)
    if [[ "$IS_TEST_DATA" == "true" ]]; then
      echo "El dato es de prueba (isTestData: true). No se enviará al servidor."
      return 0
    fi
    
    echo "Enviando al servidor..."
    
    # Extraer los datos del sensor de la respuesta de MongoDB (ahora es un array con el primer elemento)
    TEMPERATURA=$(echo $MONGO_RESPONSE | jq -r '.[0].temperatura')
    HUMEDAD_AIRE=$(echo $MONGO_RESPONSE | jq -r '.[0].humedad_aire')
    HUMEDAD_SUELO=$(echo $MONGO_RESPONSE | jq -r '.[0].humedad_suelo')
    STATUS=$(echo $MONGO_RESPONSE | jq -r '.[0].status')
    
    # Crear el JSON payload
    JSON_PAYLOAD=$(jq -n \
      --arg temp "$TEMPERATURA" \
      --arg h_aire "$HUMEDAD_AIRE" \
      --arg h_suelo "$HUMEDAD_SUELO" \
      --arg status "$STATUS" \
      '{
        temperatura: ($temp | tonumber),
        humedad_aire: ($h_aire | tonumber),
        humedad_suelo: ($h_suelo | tonumber),
        status: ($status | tonumber)
      }')
    
    echo "Enviando datos: $JSON_PAYLOAD"
    RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -H "X-Test-Data: true" -d "$JSON_PAYLOAD" $SERVER_URL)
    echo "Respuesta del servidor: $RESPONSE"
    echo "Datos enviados al servidor con éxito. La caché se actualizará automáticamente."
  else
    echo "El dato en caché es más reciente o igual que el de MongoDB. No se requiere actualización."
  fi
  
  echo "Comprobación finalizada"
}

# Bucle infinito
echo "Iniciando monitoreo continuo de datos de sensores cada $INTERVAL segundos."
while true; do
  check_and_update
  echo "Esperando $INTERVAL segundos para la próxima comprobación..."
  sleep $INTERVAL
done
