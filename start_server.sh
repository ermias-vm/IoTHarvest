#!/bin/bash
# filepath: start_server.sh
# 
# USO DEL SCRIPT:
#   ./start_server.sh                # (por defecto) pull y arranca backend y frontend
#   ./start_server.sh --frontend     # pull y arranca solo frontend
#   ./start_server.sh --backend      # pull y arranca solo backend
#   ./start_server.sh --reset        # para todo, pull y arranca backend y frontend
#   ./start_server.sh --test         # arranca backend y frontend SIN pull previo
#   ./start_server.sh --stop         # para backend y frontend si están ejecutándose

BACKEND_DIR="./backend"
FRONTEND_DIR="./frontend/my-app"

BACKEND_PID=""
FRONTEND_PID=""

function start_backend() {
  cd "$BACKEND_DIR" || exit 1
  node server.js &
  BACKEND_PID=$!
  cd - > /dev/null
}

function start_frontend() {
  cd "$FRONTEND_DIR" || exit 1
  npm run dev &
  FRONTEND_PID=$!
  cd - > /dev/null
}

function stop_all() {
  echo "Cerrando backend (puerto 8080)..."
  fuser -k 8080/tcp 2>/dev/null && echo "Backend detenido." || echo "Backend no estaba en ejecución."
  echo "Cerrando frontend (puerto 8081)..."
  fuser -k 8081/tcp 2>/dev/null && echo "Frontend detenido." || echo "Frontend no estaba en ejecución."
}

function do_pull() {
  echo "Comprobando estado del repositorio..."
  git fetch --all
  STATUS_OUTPUT=$(git status)
  if echo "$STATUS_OUTPUT" | grep -q "Your branch is up to date"; then
    echo "El repositorio ya está actualizado. No se realiza git pull ni se espera."
  else
    echo "El repositorio no está actualizado o hay cambios pendientes."
    echo "Ejecutando git pull..."
    PULL_OUTPUT=$(git pull -v)
    echo "$PULL_OUTPUT"
    echo "Esperando 10 segundos para finalizar el pull..."
    sleep 10
  fi
}

function start_both() {
  start_backend
  start_frontend
  wait $BACKEND_PID $FRONTEND_PID
}

case "$1" in
  --frontend)
    do_pull
    start_frontend
    wait $FRONTEND_PID
    ;;
  --backend)
    do_pull
    start_backend
    wait $BACKEND_PID
    ;;
  --reset)
    stop_all
    do_pull
    start_both
    ;;
  --test)
    start_both
    ;;
  --stop)
    stop_all
    ;;
  *)
    do_pull
    start_both
    ;;
esac