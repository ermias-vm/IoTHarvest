#!/bin/bash
# filepath: start_server.sh

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
  if [[ -n "$BACKEND_PID" ]] && kill -0 $BACKEND_PID 2>/dev/null; then
    kill $BACKEND_PID
    echo "Backend detenido."
  fi
  if [[ -n "$FRONTEND_PID" ]] && kill -0 $FRONTEND_PID 2>/dev/null; then
    kill $FRONTEND_PID
    echo "Frontend detenido."
  fi
}

function do_pull() {
  echo "Comprobando cambios remotos con git pull..."
  PULL_OUTPUT=$(git pull -v)
  echo "$PULL_OUTPUT"
  if [[ "$PULL_OUTPUT" == *"Already up to date."* ]]; then
    echo "No hay cambios nuevos en el repositorio remoto."
  else
    echo "Se han descargado cambios del repositorio remoto."
  fi
  echo "Esperando 10 segundos para finalizar el pull..."
  sleep 10
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