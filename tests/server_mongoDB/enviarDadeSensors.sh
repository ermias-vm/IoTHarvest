#!/bin/bash


echo "Enviando datos al servidor..."

curl -X POST -H "Content-Type: application/json" -d '{"temperatura": 22, "humedad": 55}' http://localhost:3000/api/sensores
sleep 1

curl -X POST -H "Content-Type: application/json" -d '{"temperatura": 23, "humedad": 58}' http://localhost:3000/api/sensores
sleep 1

curl -X POST -H "Content-Type: application/json" -d '{"temperatura": 24, "humedad": 60}' http://localhost:3000/api/sensores
sleep 1

curl -X POST -H "Content-Type: application/json" -d '{"temperatura": 25, "humedad": 62}' http://localhost:3000/api/sensores
sleep 1

curl -X POST -H "Content-Type: application/json" -d '{"temperatura": 26, "humedad": 65}' http://localhost:3000/api/sensores

echo "Datos enviados con éxito."