#!/bin/bash
# filepath: start_server.sh

BACKEND_DIR="./backend"

function start_backend() {
  cd "$BACKEND_DIR" || exit 1
  node server.js
}

function pull_and_start() {
  echo "Realizando git pull..."
  git pull
  echo "Esperando 10 segundos para finalizar el pull..."
  sleep 10
  start_backend
}

case "$1" in
  --pull)
    pull_and_start
    ;;
  *)
    start_backend
    ;;
esac