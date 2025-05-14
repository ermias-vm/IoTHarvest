#!/bin/bash
# test-all.sh - Script para ejecutar pruebas automatizadas en el sistema IoTHarvest
# Ejecuta envío de imágenes y datos de sensores en paralelo

# Colores para terminal
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
CYAN="\033[0;36m"
RED="\033[0;31m"
NC="\033[0m" # No Color

SCRIPTS_DIR="./scripts"
IMG_SCRIPT="${SCRIPTS_DIR}/enviarImagenes.sh"
DATA_SCRIPT="${SCRIPTS_DIR}/enviarDatos.sh"

echo -e "${CYAN}IoTHarvest${NC} - Script de pruebas automatizadas"
echo "----------------------------------------"

# Verificar que los scripts existen y son ejecutables
if [ ! -x "$IMG_SCRIPT" ]; then
    echo -e "${RED}Error: ${IMG_SCRIPT} no existe o no es ejecutable.${NC}"
    chmod +x "$IMG_SCRIPT" 2>/dev/null || { echo "No se pudo hacer ejecutable. Abortando."; exit 1; }
fi

if [ ! -x "$DATA_SCRIPT" ]; then
    echo -e "${RED}Error: ${DATA_SCRIPT} no existe o no es ejecutable.${NC}"
    chmod +x "$DATA_SCRIPT" 2>/dev/null || { echo "No se pudo hacer ejecutable. Abortando."; exit 1; }
fi

# Función para ejecutar pruebas de envío de imágenes
function ejecutar_prueba_imagenes() {
    echo -e "${GREEN}[$(date +"%H:%M:%S")]${NC} Iniciando envío de imágenes: 5 imágenes, cada 10 segundos..."
    "$IMG_SCRIPT" 5 10 &
    IMG_PID=$!
    echo -e "${CYAN}[$(date +"%H:%M:%S")]${NC} Proceso de envío de imágenes iniciado con PID: $IMG_PID"
}

# Función para ejecutar pruebas iniciales de datos (status=0)
function ejecutar_prueba_datos_inicial() {
    echo -e "${GREEN}[$(date +"%H:%M:%S")]${NC} Iniciando envío de datos: 3 lecturas con status=0, cada 5 segundos..."
    "$DATA_SCRIPT" 3 5 0 &
    DATOS_PID=$!
    echo -e "${CYAN}[$(date +"%H:%M:%S")]${NC} Proceso de envío de datos inicial iniciado con PID: $DATOS_PID"
    
    # Esperamos a que termine el envío inicial de datos
    wait $DATOS_PID
    echo -e "${GREEN}[$(date +"%H:%M:%S")]${NC} Finalizado envío inicial de datos."
}

# Función para ejecutar pruebas secuenciales de datos (status=1 hasta 7)
function ejecutar_prueba_datos_secuencial() {
    echo -e "${GREEN}[$(date +"%H:%M:%S")]${NC} Iniciando envío de datos secuencial..."
    
    for status in {1..7}; do
        echo -e "${YELLOW}[$(date +"%H:%M:%S")]${NC} Enviando datos con status=$status..."
        "$DATA_SCRIPT" 1 5 $status
        echo -e "${GREEN}[$(date +"%H:%M:%S")]${NC} Envío con status=$status completado."
    done
    
    echo -e "${GREEN}[$(date +"%H:%M:%S")]${NC} Finalizada secuencia de envíos de datos."
}

# Ejecutar pruebas en paralelo
echo -e "${YELLOW}Iniciando pruebas...${NC}"

# Iniciar prueba de imágenes en segundo plano
ejecutar_prueba_imagenes

# Iniciar la prueba inicial de datos en segundo plano
ejecutar_prueba_datos_inicial

# Esperar 15 segundos antes de iniciar las pruebas secuenciales
# (para dar tiempo a que terminen los 3 envíos iniciales de datos que tardan 15s)
echo -e "${CYAN}[$(date +"%H:%M:%S")]${NC} Esperando a que finalice el envío inicial de datos..."

# Ejecutar pruebas secuenciales de datos
ejecutar_prueba_datos_secuencial

# Esperar a que termine el proceso de imágenes
wait $IMG_PID
echo -e "${GREEN}[$(date +"%H:%M:%S")]${NC} Proceso de envío de imágenes finalizado."

echo -e "${GREEN}¡Todas las pruebas han finalizado correctamente!${NC}"
echo "----------------------------------------"
