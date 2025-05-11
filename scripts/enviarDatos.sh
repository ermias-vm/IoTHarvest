#!/bin/bash
# filepath: scripts/enviarDatosSensoresToServer.sh
# Uso:
#   ./enviarDatosSensoresToServer.sh [NUM_ENVIOS] [INTERVALO] [STATUS]
# - NUM_ENVIOS: número total de envíos a realizar (por defecto 10, máximo 300)
# - INTERVALO: segundos entre cada envío (por defecto 1, máximo 60)
# - STATUS: valor del campo status a enviar (por defecto 0)
# Ejemplo: ./enviarDatos.sh 20 5 3

# Configuración por defecto
NUM_ENVIOS=10
INTERVALO=1
STATUS=0
SERVER_URL="http://localhost:8080/api/sensores"

# Verificar argumentos
if [[ $# -ge 1 ]]; then
    if [[ $1 -ge 1 && $1 -le 300 ]]; then
        NUM_ENVIOS=$1
    else
        echo "Número de envíos fuera de rango (1-300). Usando valor por defecto: $NUM_ENVIOS"
    fi
fi

if [[ $# -ge 2 ]]; then
    if [[ $2 -ge 1 && $2 -le 60 ]]; then
        INTERVALO=$2
    else
        echo "Intervalo fuera de rango (1-60 segundos). Usando valor por defecto: $INTERVALO"
    fi
fi

if [[ $# -ge 3 ]]; then
    STATUS=$3
fi

# Envío de datos
for ((i=1; i<=NUM_ENVIOS; i++)); do
    TEMPERATURA=$((RANDOM % 11 + 20))         # Aleatorio entre 20 y 30
    HUMEDAD_AIRE=$((RANDOM % 21 + 40))        # Aleatorio entre 40 y 60
    HUMEDAD_SUELO=$((RANDOM % 31 + 30))       # Aleatorio entre 30 y 60

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
curl -X POST -H "Content-Type: application/json" -H "X-Test-Data: true" -d "$JSON_PAYLOAD" $SERVER_URL

    sleep $INTERVALO
done

echo "Datos enviados con éxito."