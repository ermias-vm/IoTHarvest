#!/bin/bash
# filepath: start_server.sh
# 
# USO DEL SCRIPT:
#   ./start_server.sh                # (por defecto) pull y arranca backend y frontend (frontend solo localhost)
#   ./start_server.sh expose         # pull y arranca backend y frontend (frontend expuesto en red)
#   ./start_server.sh --frontend     # pull y arranca solo frontend (solo localhost)
#   ./start_server.sh --frontend expose # pull y arranca solo frontend (expuesto en red)
#   ./start_server.sh --backend      # pull y arranca solo backend
#   ./start_server.sh --reset        # para todo, pull y arranca backend y frontend
#   ./start_server.sh --test         # arranca backend y frontend SIN pull previo
#   ./start_server.sh --stop         # para backend y frontend si están ejecutándose

BACKEND_DIR="./backend"
FRONTEND_DIR="./frontend/my-app"
WATCH_PREDICT_SCRIPT="./watch_predict.sh"
WATCH_PREDICT_PID_FILE="./watch_predict.pid"
WATCH_PREDICT_LOG_FILE="./watch_predict.log" # Para referencia del usuario

BACKEND_PID=""
FRONTEND_PID=""
# WATCH_PREDICT_PID no se almacena aquí, se lee del archivo PID

# Función para iniciar el script de vigilancia y predicción
function start_watch_predict() {
  if [ -f "$WATCH_PREDICT_PID_FILE" ]; then
    EXISTING_PID=$(cat "$WATCH_PREDICT_PID_FILE")
    if ps -p "$EXISTING_PID" > /dev/null; then
      echo "[INFO] El script watch_predict.sh ya está en ejecución (PID: $EXISTING_PID)."
      return 0
    else
      echo "[WARN] Se encontró un archivo PID ($WATCH_PREDICT_PID_FILE) pero el proceso no existe. Eliminando archivo PID."
      rm -f "$WATCH_PREDICT_PID_FILE"
    fi
  fi

  if [ ! -f "$WATCH_PREDICT_SCRIPT" ]; then
    echo "[ERROR] El script $WATCH_PREDICT_SCRIPT no se encuentra. No se iniciará el vigilante de predicción."
    return 1
  fi
  
  echo "[INFO] Iniciando $WATCH_PREDICT_SCRIPT en segundo plano..."
  nohup bash "$WATCH_PREDICT_SCRIPT" > /dev/null 2>&1 &
  
  sleep 2 
  if [ -f "$WATCH_PREDICT_PID_FILE" ]; then
    CURRENT_WATCH_PID=$(cat "$WATCH_PREDICT_PID_FILE")
    echo "[INFO] $WATCH_PREDICT_SCRIPT iniciado (PID: $CURRENT_WATCH_PID). Log en $WATCH_PREDICT_LOG_FILE"
  else
    echo "[ERROR] No se pudo iniciar $WATCH_PREDICT_SCRIPT o no se encontró el archivo PID después de iniciar."
    return 1
  fi
  return 0
}

# Función para detener el script de vigilancia y predicción
function stop_watch_predict() {
  echo "[INFO] Intentando detener watch_predict.sh..."
  if [ -f "$WATCH_PREDICT_PID_FILE" ]; then
    PID_TO_KILL=$(cat "$WATCH_PREDICT_PID_FILE")
    if ps -p "$PID_TO_KILL" > /dev/null; then
      echo "[INFO] Deteniendo watch_predict.sh (PID: $PID_TO_KILL)..."
      kill "$PID_TO_KILL"
      sleep 2
      if ps -p "$PID_TO_KILL" > /dev/null; then
         echo "[WARN] No se pudo detener watch_predict.sh (PID: $PID_TO_KILL) con kill normal. Intentando kill -9..."
         kill -9 "$PID_TO_KILL"
         sleep 1
      fi
      if ps -p "$PID_TO_KILL" > /dev/null; then
        echo "[ERROR] No se pudo detener el proceso watch_predict.sh (PID: $PID_TO_KILL) incluso con kill -9."
      else
        echo "[INFO] watch_predict.sh (PID: $PID_TO_KILL) detenido."
      fi
    else
      echo "[INFO] El proceso de watch_predict.sh (PID: $PID_TO_KILL según el archivo PID) no estaba en ejecución."
    fi
    rm -f "$WATCH_PREDICT_PID_FILE"
  else
    echo "[INFO] No se encontró el archivo PID para watch_predict.sh. No se puede detener selectivamente."
    PIDS_WATCH=$(pgrep -f "$WATCH_PREDICT_SCRIPT")
    if [ -n "$PIDS_WATCH" ]; then
        echo "[WARN] No hay archivo PID, pero se encontraron procesos que coinciden con $WATCH_PREDICT_SCRIPT. Intentando detenerlos..."
        kill $PIDS_WATCH
        sleep 1
        kill -9 $PIDS_WATCH 2>/dev/null
        echo "[INFO] Procesos coincidentes con $WATCH_PREDICT_SCRIPT detenidos."
    else
        echo "[INFO] No se encontraron procesos en ejecución para $WATCH_PREDICT_SCRIPT."
    fi
  fi
}

function start_backend() {
  echo "[INFO] Iniciando backend..."
  cd "$BACKEND_DIR" || { echo "[ERROR] No se pudo cambiar al directorio $BACKEND_DIR"; exit 1; }
  node server.js &
  BACKEND_PID=$!
  cd - > /dev/null
  echo "[INFO] Backend iniciado (PID: $BACKEND_PID)."
  start_watch_predict
}

function start_frontend() {
  local expose_flag="$1"
  echo "[INFO] Iniciando frontend..."
  cd "$FRONTEND_DIR" || { echo "[ERROR] No se pudo cambiar al directorio $FRONTEND_DIR"; exit 1; }
  if [ "$expose_flag" == "expose" ]; then
    echo "[INFO] Frontend expuesto en red (--host activado)"
    npm run dev -- --host &
  else
    echo "[INFO] Frontend solo accesible en localhost"
    npm run dev &
  fi
  FRONTEND_PID=$!
  cd - > /dev/null
  echo "[INFO] Frontend iniciado (PID: $FRONTEND_PID)."
}

function stop_all() {
  echo "[INFO] Deteniendo todos los servicios..."
  stop_watch_predict

  if [ -n "$BACKEND_PID" ] && ps -p "$BACKEND_PID" > /dev/null; then
    echo "[INFO] Deteniendo backend (PID: $BACKEND_PID)..."
    kill "$BACKEND_PID"
  else
    echo "[INFO] Backend (PID: $BACKEND_PID guardado) no estaba en ejecución o PID desconocido. Intentando por puerto 8080..."
    fuser -k 8080/tcp 2>/dev/null && echo "[INFO] Proceso en puerto 8080 detenido." || echo "[INFO] Ningún proceso encontrado en puerto 8080."
  fi
  
  if [ -n "$FRONTEND_PID" ] && ps -p "$FRONTEND_PID" > /dev/null; then
    echo "[INFO] Deteniendo frontend (PID: $FRONTEND_PID)..."
    kill "$FRONTEND_PID"
  else
    echo "[INFO] Frontend (PID: $FRONTEND_PID guardado) no estaba en ejecución o PID desconocido. Intentando por puerto 8081..."
    fuser -k 8081/tcp 2>/dev/null && echo "[INFO] Proceso en puerto 8081 detenido." || echo "[INFO] Ningún proceso encontrado en puerto 8081."
  fi
  
  BACKEND_PID=""
  FRONTEND_PID=""
  echo "[INFO] Todos los servicios principales detenidos."
}

function do_pull() {
  echo "[INFO] Comprobando estado del repositorio..."
  git fetch --all
  STATUS_OUTPUT=$(git status)
  if echo "$STATUS_OUTPUT" | grep -q "Your branch is up to date"; then
    echo "[INFO] El repositorio ya está actualizado. No se realiza git pull ni se espera."
  else
    echo "[INFO] El repositorio no está actualizado o hay cambios pendientes."
    echo "[INFO] Ejecutando git pull..."
    PULL_OUTPUT=$(git pull -v)
    echo "$PULL_OUTPUT"
    echo "[INFO] Esperando 10 segundos para finalizar el pull..."
    sleep 10
  fi
}

function start_both() {
  local expose_flag="$1"
  start_backend
  start_frontend "$expose_flag"
}

trap 'echo "[INFO] Interrupción recibida (Ctrl+C), deteniendo todos los servicios..."; stop_all; exit 0' SIGINT SIGTERM

case "$1" in
  --frontend)
    do_pull
    start_frontend "$2"
    echo "[INFO] Frontend iniciado. Este script terminará, pero el frontend seguirá en segundo plano."
    echo "[INFO] Para detenerlo, usa './start_server.sh --stop' o Ctrl+C si se ejecuta en primer plano."
    ;;
  --backend)
    do_pull
    start_backend
    echo "[INFO] Backend y watch_predict iniciados. Este script terminará, pero seguirán en segundo plano."
    echo "[INFO] Para detenerlos, usa './start_server.sh --stop' o Ctrl+C si se ejecuta en primer plano."
    ;;
  --reset)
    echo "[INFO] Reiniciando servicios..."
    stop_all
    do_pull
    start_both "$2"
    echo "[INFO] Servidores reiniciados y corriendo en segundo plano."
    ;;
  --test)
    echo "[INFO] Iniciando servicios en modo test (sin git pull)..."
    start_both "$2"
    echo "[INFO] Servidores iniciados en modo test y corriendo en segundo plano."
    ;;
  --stop)
    stop_all
    ;;
  *)
    do_pull
    start_both "$1"
    echo "[INFO] Servidores iniciados y corriendo en segundo plano."
    ;;
esac

exit 0