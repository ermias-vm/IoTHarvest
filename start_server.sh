#!/bin/bash

BACKEND_DIR="./backend"
FRONTEND_DIR="./frontend/my-app"

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

function pull_and_start() {
  echo "Realizando git pull..."
  git pull -v
  echo "Esperando 10 segundos para finalizar el pull..."
  sleep 10
  start_backend
  start_frontend
  wait $BACKEND_PID $FRONTEND_PID
}

function start_all() {
  start_backend
  start_frontend
  wait $BACKEND_PID $FRONTEND_PID
}

case "$1" in
  --pull)
    pull_and_start
    ;;
  --all)
    start_all
    ;;
  *)
    start_backend
    wait $BACKEND_PID
    ;;
esac