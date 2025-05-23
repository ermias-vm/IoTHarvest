#!/bin/bash
# Script para facilitar el uso de Docker Compose con IoTHarvest
# Comandos disponibles:
# ./docker.sh start - Inicia todos los contenedores definidos en docker-compose.yml
# ./docker.sh stop - Detiene y elimina todos los contenedores activos
# ./docker.sh restart - Reinicia todos los contenedores sin recrearlos
# ./docker.sh build - Reconstruye las imágenes de los contenedores
# ./docker.sh build-verbose - Reconstruye con salida detallada del proceso
# ./docker.sh logs - Muestra los logs de todos los servicios en tiempo real
# ./docker.sh backend - Muestra los logs del servicio backend
# ./docker.sh frontend - Muestra los logs del servicio frontend
# ./docker.sh model - Muestra los logs del servicio model
# ./docker.sh status - Muestra el estado actual de todos los contenedores
# ./docker.sh rm-containers - Elimina todos los contenedores relacionados con IoTHarvest
# ./docker.sh rm-images - Elimina todas las imágenes de IoTHarvest
# ./docker.sh create - Crea las imágenes sin iniciar los contenedores
# ./docker.sh check-env - Verifica la existencia y contenido de los archivos .env
# ./docker.sh help - Muestra esta ayuda

# Colores para terminal
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
CYAN="\033[0;36m"
RED="\033[0;31m"
NC="\033[0m" # No Color

# Rutas de archivos importantes
DOCKER_DIR="./docker"
BACKEND_ENV="./backend/.env"
DOCKER_ENV="${DOCKER_DIR}/.env"

echo -e "${CYAN}IoTHarvest Docker${NC} - Script de gestión"
echo "--------------------------------"

function show_help() {
  echo -e "Uso: ${YELLOW}./docker.sh${NC} [OPCIÓN]"
  echo ""
  echo "Opciones:"
  echo -e "  ${GREEN}start${NC}          Inicia todos los servicios"
  echo -e "  ${GREEN}stop${NC}           Detiene todos los servicios"
  echo -e "  ${GREEN}restart${NC}        Reinicia todos los servicios"
  echo -e "  ${GREEN}build${NC}          Reconstruye los contenedores (desde cero)"
  echo -e "  ${GREEN}build-verbose${NC}  Reconstruye mostrando detalles del proceso"
  echo -e "  ${GREEN}create${NC}         Crea las imágenes sin iniciar los contenedores"
  echo -e "  ${GREEN}rm-containers${NC}  Elimina todos los contenedores relacionados con IoTHarvest"
  echo -e "  ${GREEN}rm-images${NC}      Elimina todas las imágenes de IoTHarvest"
  echo -e "  ${GREEN}logs${NC}           Muestra los logs de todos los servicios"
  echo -e "  ${GREEN}backend${NC}        Muestra los logs del backend"
  echo -e "  ${GREEN}frontend${NC}       Muestra los logs del frontend"
  echo -e "  ${GREEN}model${NC}          Muestra los logs del servicio model"
  echo -e "  ${GREEN}status${NC}         Muestra el estado de los contenedores"
  echo -e "  ${GREEN}check-env${NC}      Verifica las variables de entorno"
  echo -e "  ${GREEN}help${NC}           Muestra esta ayuda"
}

# Verificar que Docker y Docker Compose estén instalados
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker no está instalado.${NC}"
    exit 1
fi

if ! docker compose version &> /dev/null; then
    echo -e "${RED}Error: Docker Compose no está instalado.${NC}"
    exit 1
fi

# Variables ya definidas arriba
# DOCKER_DIR="./docker" 
# BACKEND_ENV="./backend/.env" 
# DOCKER_ENV="${DOCKER_DIR}/.env"

# Función para copiar el archivo .env si existe
function ensure_env_file() {
  if [ -f "$BACKEND_ENV" ]; then
    echo -e "${CYAN}Copiando archivo .env de backend a docker...${NC}"
    cp "$BACKEND_ENV" "$DOCKER_ENV"
    echo -e "${GREEN}¡Archivo .env copiado correctamente!${NC}"
  else
    echo -e "${YELLOW}No se encontró archivo .env en backend. Verificar configuración.${NC}"
    if [ ! -f "$DOCKER_ENV" ]; then
      echo -e "${RED}¡Advertencia! No existe archivo .env en docker ni en backend.${NC}"
      echo -e "${RED}Las variables de entorno no estarán disponibles para los contenedores.${NC}"
    fi
  fi
}

# Función para verificar variables de entorno críticas en el archivo .env
function validate_env_variables() {
  local ENV_FILE=$1
  if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}Error: Archivo $ENV_FILE no encontrado.${NC}"
    return 1
  fi
  
  echo -e "${CYAN}Verificando variables de entorno críticas...${NC}"
  
  # Lista de variables críticas que deben estar definidas
  local REQUIRED_VARS=("MONGODB_URL" "JWT_SECRET" "ADMIN_SCRIPT_PASS")
  local MISSING_VARS=()
  
  for var in "${REQUIRED_VARS[@]}"; do
    if ! grep -q "^${var}=" "$ENV_FILE" && ! grep -q "^${var} =" "$ENV_FILE"; then
      MISSING_VARS+=("$var")
    fi
  done
  
  if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo -e "${YELLOW}¡Advertencia! Las siguientes variables críticas no están definidas en $ENV_FILE:${NC}"
    for var in "${MISSING_VARS[@]}"; do
      echo -e "  - ${RED}$var${NC}"
    done
    echo -e "${YELLOW}El funcionamiento de la aplicación puede verse afectado.${NC}"
    return 1
  else
    echo -e "${GREEN}¡Todas las variables críticas están definidas!${NC}"
    return 0
  fi
}

case "$1" in
  start)
    ensure_env_file
    validate_env_variables "$DOCKER_ENV"
    
    echo -e "${GREEN}Iniciando servicios IoTHarvest...${NC}"
    docker compose -f ${DOCKER_DIR}/docker-compose.yml up -d
    echo -e "${CYAN}Servicios iniciados:${NC}"
    docker compose -f ${DOCKER_DIR}/docker-compose.yml ps

    # Obtener la IP pública si está disponible
    PUBLIC_IP=$(curl -s https://api.ipify.org || echo "localhost")
    
    echo -e "\n${GREEN}¡IoTHarvest está disponible!${NC}"
    echo -e "${YELLOW}Acceso a los servicios:${NC}"
    echo -e "  • ${CYAN}Frontend:${NC} http://localhost:8081 o http://$PUBLIC_IP:8081"
    echo -e "  • ${CYAN}Backend API:${NC} http://localhost:8080 o http://$PUBLIC_IP:8080"
    echo -e "${GREEN}¡Servicios listos para usar!${NC}"
    ;;
  stop)
    echo -e "${YELLOW}Deteniendo servicios IoTHarvest...${NC}"
    docker compose -f ${DOCKER_DIR}/docker-compose.yml down
    echo -e "${GREEN}¡Servicios detenidos!${NC}"
    ;;
  restart)
    echo -e "${YELLOW}Reiniciando servicios IoTHarvest...${NC}"
    docker compose -f ${DOCKER_DIR}/docker-compose.yml restart
    echo -e "${GREEN}¡Servicios reiniciados!${NC}"
    docker compose -f ${DOCKER_DIR}/docker-compose.yml ps
    ;;
  build)
    ensure_env_file
    validate_env_variables "$DOCKER_ENV"
    
    echo -e "${YELLOW}Reconstruyendo contenedores IoTHarvest...${NC}"
    docker compose -f ${DOCKER_DIR}/docker-compose.yml build
    echo -e "${GREEN}¡Construcción completada!${NC}"
    ;;
  build-verbose)
    ensure_env_file
    validate_env_variables "$DOCKER_ENV"
    
    echo -e "${YELLOW}Reconstruyendo contenedores IoTHarvest con salida detallada...${NC}"
    docker compose -f ${DOCKER_DIR}/docker-compose.yml build --progress=plain
    echo -e "${GREEN}¡Construcción completada!${NC}"
    ;;
  logs)
    echo -e "${CYAN}Mostrando logs de todos los servicios (Ctrl+C para salir):${NC}"
    docker compose -f ${DOCKER_DIR}/docker-compose.yml logs -f
    ;;
  backend)
    echo -e "${CYAN}Mostrando logs del backend (Ctrl+C para salir):${NC}"
    docker compose -f ${DOCKER_DIR}/docker-compose.yml logs -f backend
    ;;
  frontend)
    echo -e "${CYAN}Mostrando logs del frontend (Ctrl+C para salir):${NC}"
    docker compose -f ${DOCKER_DIR}/docker-compose.yml logs -f frontend
    ;;
  model)
    echo -e "${CYAN}Mostrando logs del servicio model (Ctrl+C para salir):${NC}"
    docker compose -f ${DOCKER_DIR}/docker-compose.yml logs -f model
    ;;
  status)
    echo -e "${CYAN}Estado de los servicios:${NC}"
    docker compose -f ${DOCKER_DIR}/docker-compose.yml ps
    ;;
  create)
    ensure_env_file
    validate_env_variables "$DOCKER_ENV"
    
    echo -e "${YELLOW}Creando imágenes IoTHarvest desde cero sin iniciar contenedores...${NC}"
    docker compose -f ${DOCKER_DIR}/docker-compose.yml build --no-cache
    echo -e "${GREEN}¡Creación de imágenes completada!${NC}"
    echo -e "${CYAN}Imágenes creadas:${NC}"
    docker images "iotharvest-*"
    ;;
  rm-containers)
    echo -e "${YELLOW}Verificando si hay contenedores activos para detener...${NC}"
    if docker ps -q --filter "name=iotharvest" | grep -q .; then
      echo -e "${YELLOW}Deteniendo contenedores activos...${NC}"
      docker compose -f ${DOCKER_DIR}/docker-compose.yml down
    fi
    echo -e "${YELLOW}Eliminando todos los contenedores de IoTHarvest...${NC}"
    CONTAINERS=$(docker ps -a -q --filter "name=iotharvest")
    if [ -n "$CONTAINERS" ]; then
      docker rm $CONTAINERS
      echo -e "${GREEN}¡Contenedores eliminados correctamente!${NC}"
    else
      echo -e "${GREEN}No se encontraron contenedores para eliminar.${NC}"
    fi
    ;;
  rm-images)
    echo -e "${YELLOW}Eliminando imágenes de IoTHarvest...${NC}"
    # Primero, verifica si hay contenedores usando estas imágenes
    if docker ps -a -q --filter "ancestor=iotharvest-frontend" --filter "ancestor=iotharvest-backend" --filter "ancestor=iotharvest-model" | grep -q .; then
      echo -e "${YELLOW}Hay contenedores que usan estas imágenes. Eliminando contenedores primero...${NC}"
      # Ejecutar la acción de rm-containers
      if docker ps -q --filter "name=iotharvest" | grep -q .; then
        echo -e "${YELLOW}Deteniendo contenedores activos...${NC}"
        docker compose -f ${DOCKER_DIR}/docker-compose.yml down
      fi
      CONTAINERS=$(docker ps -a -q --filter "name=iotharvest")
      if [ -n "$CONTAINERS" ]; then
        docker rm $CONTAINERS
        echo -e "${GREEN}¡Contenedores eliminados correctamente!${NC}"
      fi
    fi
    
    # Ahora intenta eliminar las imágenes con --force
    IMAGES=$(docker images "iotharvest-*" -q)
    if [ -n "$IMAGES" ]; then
      docker rmi --force $IMAGES
      echo -e "${GREEN}¡Imágenes eliminadas correctamente!${NC}"
    else
      echo -e "${GREEN}No se encontraron imágenes para eliminar.${NC}"
    fi
    ;;
  check-env)
    echo -e "${CYAN}Verificando archivos de variables de entorno...${NC}"
    
    # Verificar la existencia de los archivos .env
    if [ -f "$BACKEND_ENV" ]; then
      echo -e "${GREEN}✓ Archivo .env de backend encontrado en:${NC} $BACKEND_ENV"
    else
      echo -e "${RED}✗ Archivo .env de backend NO encontrado en:${NC} $BACKEND_ENV"
    fi
    
    if [ -f "$DOCKER_ENV" ]; then
      echo -e "${GREEN}✓ Archivo .env de docker encontrado en:${NC} $DOCKER_ENV"
    else
      echo -e "${RED}✗ Archivo .env de docker NO encontrado en:${NC} $DOCKER_ENV"
      echo -e "${YELLOW}   Intentando copiar desde backend...${NC}"
      ensure_env_file
    fi
    
    # Si existe el archivo .env en docker, validar su contenido
    if [ -f "$DOCKER_ENV" ]; then
      echo -e "\n${CYAN}Variables de entorno definidas en Docker:${NC}"
      
      # Lista de variables esperadas
      ENVVARS=("MONGODB_URL" "JWT_SECRET" "ADMIN_SCRIPT_PASS" "MAIL_FROM" "MAIL_HOST" 
              "MAIL_PORT" "MAIL_PASS" "CLOUDINARY_CLOUD_NAME" "CLOUDINARY_API_KEY" 
              "CLOUDINARY_API_SECRET")
      
      for var in "${ENVVARS[@]}"; do
        if grep -q "^${var}=" "$DOCKER_ENV" || grep -q "^${var} =" "$DOCKER_ENV"; then
          # Mostrar solo que está definida, pero no el valor real
          echo -e "  ${GREEN}✓${NC} $var: ${YELLOW}[definida]${NC}"
        else
          echo -e "  ${RED}✗${NC} $var: ${RED}[no definida]${NC}"
        fi
      done
      
      echo -e "\n${YELLOW}Nota: Los valores reales no se muestran por seguridad.${NC}"
    fi
    ;;
    
  help|*)
    show_help
    ;;
esac

exit 0
