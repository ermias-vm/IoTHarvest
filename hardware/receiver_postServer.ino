#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

#include <SPI.h>
#include <LoRa.h>

#define SS 18
#define RST 23
#define DI0 26

WiFiClient  client;

unsigned long canal = 1;

// Definiciones de WiFi y la URL del servidor
const char* ssid = "ASUS";          // nombre red Wi-Fi
const char* password = "Croquetadejam0n";  // contraseña Wi-Fi
const char* serverUrl = "http://nattech.fib.upc.edu:40480/api/sensores"; // URL endpoint servidor web

unsigned long lastTime = 0;
unsigned long timerDelay = 10000;

// Función para conectar el ESP32 a Wi-Fi
void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Conectando a WiFi");
  
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println(" Conectado OK");
}

void setup_LoRa() {
  Serial.println("Iniciando LoRa receptor...");
  LoRa.setPins(SS, RST, DI0);

  if (!LoRa.begin(868E6)) { // Frecuencia 868 MHz para Europa
      Serial.println("Error al iniciar LoRa");
      while (1);
  }
  Serial.println("LoRa receptor inicializado correctamente");
}

void setup() {
  Serial.begin(115200);  
  while(!Serial);

  setup_LoRa();
  setup_wifi();
}

void loop() {
  float temp;
  float hum;

  int packetSize = LoRa.parsePacket();
  if (packetSize) {
    String receivedData = "";
    while (LoRa.available()) {
        receivedData += (char)LoRa.read();
    }

    int separatorIndex = receivedData.indexOf(';');
    if (separatorIndex != -1) {
      String tempStr = receivedData.substring(0, separatorIndex);
      String humStr = receivedData.substring(separatorIndex + 1);
      
      temp = tempStr.toFloat();
      hum = humStr.toFloat();
    }

    if ((millis() - lastTime) > timerDelay) {

      // Reconnecta WiFi, en cas que connexió perduda o desactivada
      if(WiFi.status() != WL_CONNECTED){
        Serial.print("Connectant...\n");
        while(WiFi.status() != WL_CONNECTED){
          WiFi.begin(ssid, password); 
          delay(5000);     
        } 
        Serial.println("\nConnectat.");
      }

      // Crear el objeto JSON
      StaticJsonDocument<128> doc;  // Crear un objeto JSON con contenido de la lectura recibida
      doc["temperatura"] = temp;
      doc["humedad_aire"] = hum;
      doc["humedad_suelo"] = 0.0;
      doc["bateria"] = 1;

      // Serializar el objeto JSON en un buffer
      char jsonBuffer[256];
      serializeJson(doc, jsonBuffer);

      // Enviar el JSON al servidor web
      if (WiFi.status() == WL_CONNECTED) {  // Verificar si está conectado a Wi-Fi
        HTTPClient http;  // Crear un objeto HTTPClient
        http.begin(serverUrl);  // Iniciar la conexión HTTP con la URL del servidor
        
        // Establecer cabeceras para el tipo de contenido
        http.addHeader("Content-Type", "application/json");
        
        // Enviar el JSON en la solicitud POST
        int httpResponseCode = http.POST(jsonBuffer);
        
        // Verificar la respuesta del servidor
        if (httpResponseCode > 0) {
          Serial.print("Código de respuesta: ");
          Serial.println(httpResponseCode);
        } else {
          Serial.print("Error en la solicitud HTTP: ");
          Serial.println(httpResponseCode);
        }
        
        http.end();  // Finalizar la conexión HTTP
      } 
      else {
        Serial.println("Error: No hay conexión WiFi");
      }
      Serial.println("Se tendría que haber enviado:");
      Serial.print("Temperatura: ");
      Serial.print(temp);
      Serial.println("ºC");

      Serial.print("Humitat: ");
      Serial.print(hum);
      Serial.println("%");
      lastTime = millis();  
    }
  }
}
