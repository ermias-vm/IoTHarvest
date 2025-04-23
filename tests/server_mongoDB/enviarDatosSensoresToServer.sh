#!/bin/bash

# Configuración por defecto
NUM_ENVIOS=10  # Número de envíos por defecto
INTERVALO=1    # Intervalo entre envíos en segundos
SERVER_URL="http://localhost:1500/api/sensores"

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

# Inicialización de la batería
BATERIA=100
ENVIOS_DESDE_ULTIMA_BAJA=0

# Envío de datos
for ((i=1; i<=NUM_ENVIOS; i++)); do
    TEMPERATURA=$((RANDOM % 11 + 20))         # Aleatorio entre 20 y 30
    HUMEDAD_AIRE=$((RANDOM % 21 + 40))        # Aleatorio entre 40 y 60
    HUMEDAD_SUELO=$((RANDOM % 31 + 30))       # Aleatorio entre 30 y 60

    JSON_PAYLOAD=$(jq -n \
        --arg temp "$TEMPERATURA" \
        --arg h_aire "$HUMEDAD_AIRE" \
        --arg h_suelo "$HUMEDAD_SUELO" \
        --arg bat "$BATERIA" \
        '{
            temperatura: ($temp | tonumber),
            humedad_aire: ($h_aire | tonumber),
            humedad_suelo: ($h_suelo | tonumber),
            bateria: ($bat | tonumber)
        }')

    echo "Enviando datos: $JSON_PAYLOAD"
    curl -X POST -H "Content-Type: application/json" -d "$JSON_PAYLOAD" $SERVER_URL

    # Reducir batería cada 3 envíos
    ((ENVIOS_DESDE_ULTIMA_BAJA++))
    if [[ $ENVIOS_DESDE_ULTIMA_BAJA -eq 3 ]]; then
        BATERIA=$((BATERIA - 1))
        ENVIOS_DESDE_ULTIMA_BAJA=0
    fi

    # Esperar antes del próximo envío
    sleep $INTERVALO
done

echo "Datos enviados con éxito."
