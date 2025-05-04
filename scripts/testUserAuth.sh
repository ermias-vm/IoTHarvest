#!/bin/bash
# Script interactivo para probar /api/register y /api/login del backend

SERVER_URL="http://localhost:8080"
TOKEN=""
LOGGED_IN=0

# Leer contraseña de admin desde .env
ENV_PATH="../backend/.env"
if [ ! -f "$ENV_PATH" ]; then
  echo "No se encontró el archivo .env en $ENV_PATH"
  exit 1
fi
ADMIN_PASS=$(grep '^ADMIN_SCRIPT_PASS=' "$ENV_PATH" | cut -d'=' -f2-)
if [ -z "$ADMIN_PASS" ]; then
  echo "No se encontró ADMIN_SCRIPT_PASS en .env"
  exit 1
fi

read -s -p "Introduce la contraseña de administrador para usar este script: " INPUT_PASS
echo
if [[ "$INPUT_PASS" != "$ADMIN_PASS" ]]; then
  echo "Contraseña incorrecta. Saliendo."
  exit 1
fi

function show_menu() {
  echo ""
  if [[ $LOGGED_IN -eq 0 ]]; then
    echo "Opciones:"
    echo "1) Crear cuenta"
    echo "2) Login"
    echo "3) Salir"
  else
    echo "Opciones:"
    echo "1) Ver token"
    echo "2) Logout"
    echo "3) Salir"
  fi
  echo ""
}

function register() {
  read -p "Usuario: " USERNAME
  while true; do
    read -s -p "Contraseña: " PASSWORD1
    echo
    read -s -p "Repite la contraseña: " PASSWORD2
    echo
    if [[ "$PASSWORD1" != "$PASSWORD2" ]]; then
      echo "Las contraseñas no coinciden. Intenta de nuevo."
    else
      break
    fi
  done
  RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" \
    -d "{\"username\":\"$USERNAME\", \"password\":\"$PASSWORD1\"}" \
    "$SERVER_URL/api/register")
  echo "Respuesta del servidor: $RESPONSE"
}

function login() {
  read -p "Usuario: " USERNAME
  read -s -p "Contraseña: " PASSWORD
  echo
  RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" \
    -d "{\"username\":\"$USERNAME\", \"password\":\"$PASSWORD\"}" \
    "$SERVER_URL/api/login")
  TOKEN=$(echo "$RESPONSE" | grep -o '"token":"[^"]*' | cut -d':' -f2 | tr -d '"')
  if [[ -n "$TOKEN" ]]; then
    echo "Login correcto. Token recibido."
    LOGGED_IN=1
  else
    echo "Error en login: $RESPONSE"
    LOGGED_IN=0
  fi
}

function show_token() {
  if [[ -n "$TOKEN" ]]; then
    echo "Token actual:"
    echo "$TOKEN"
  else
    echo "No hay token disponible."
  fi
}

function logout() {
  TOKEN=""
  LOGGED_IN=0
  echo "Sesión cerrada."
}

while true; do
  show_menu
  if [[ $LOGGED_IN -eq 0 ]]; then
    read -p "Selecciona una opción: " OPCION
    case $OPCION in
      1) register ;;
      2) login ;;
      3) echo "Saliendo..."; exit 0 ;;
      *) echo "Opción no válida." ;;
    esac
  else
    read -p "Selecciona una opción: " OPCION
    case $OPCION in
      1) show_token ;;
      2) logout ;;
      3) echo "Saliendo..."; exit 0 ;;
      *) echo "Opción no válida." ;;
    esac
  fi
done