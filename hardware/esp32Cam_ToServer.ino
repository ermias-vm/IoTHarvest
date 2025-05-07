#include "esp_camera.h"
#include <WiFi.h>
#include <HTTPClient.h>

// Configura tus credenciales WiFi
const char* ssid = "xxx";
const char* password = "xxx";

// Dirección IP del servidor y puerto
const char* serverUrl = "http://nattech.fib.upc.edu:40480/api/images";

// Configuración de la cámara AI Thinker
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

void startCamera() {
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer   = LEDC_TIMER_0;
  config.pin_d0       = Y2_GPIO_NUM;
  config.pin_d1       = Y3_GPIO_NUM;
  config.pin_d2       = Y4_GPIO_NUM;
  config.pin_d3       = Y5_GPIO_NUM;
  config.pin_d4       = Y6_GPIO_NUM;
  config.pin_d5       = Y7_GPIO_NUM;
  config.pin_d6       = Y8_GPIO_NUM;
  config.pin_d7       = Y9_GPIO_NUM;
  config.pin_xclk     = XCLK_GPIO_NUM;
  config.pin_pclk     = PCLK_GPIO_NUM;
  config.pin_vsync    = VSYNC_GPIO_NUM;
  config.pin_href     = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn     = PWDN_GPIO_NUM;
  config.pin_reset    = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;

  // Cambio de resolución: ahora se usa XGA (1024x768)
  config.frame_size   = FRAMESIZE_SXGA;
  config.jpeg_quality = 10;
  config.fb_count     = 1;

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    //Serial.printf("Error al iniciar la cámara: 0x%x", err);
    return;
  }
}

void sendPhoto() {
  camera_fb_t* fb = esp_camera_fb_get();
  if (!fb) {
    //Serial.println("Error capturando imagen");
    return;
  }

  WiFiClient client;
  HTTPClient http;

  if (http.begin(client, serverUrl)) {
    String boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW";
    String head = "--" + boundary + "\r\n" +
                  "Content-Disposition: form-data; name=\"imagen\"; filename=\"foto.jpg\"\r\n" +
                  "Content-Type: image/jpeg\r\n\r\n";
    String tail = "\r\n--" + boundary + "--\r\n";

    int bodyLen = head.length() + fb->len + tail.length();
    uint8_t *body = (uint8_t *)malloc(bodyLen);
    if (!body) {
      //Serial.println("No hay suficiente memoria para el cuerpo HTTP");
      esp_camera_fb_return(fb);
      return;
    }

    memcpy(body, head.c_str(), head.length());
    memcpy(body + head.length(), fb->buf, fb->len);
    memcpy(body + head.length() + fb->len, tail.c_str(), tail.length());

    http.addHeader("Content-Type", "multipart/form-data; boundary=" + boundary);
    int httpCode = http.POST(body, bodyLen);

    if (httpCode > 0) {
      //Serial.printf("Imagen enviada. Código HTTP: %d\n", httpCode);
      //Serial.println(http.getString());
    } else {
      //Serial.printf("Error al enviar imagen: %s\n", http.errorToString(httpCode).c_str());
    }

    free(body);
    http.end();
  } else {
    //Serial.println("Error al conectar con el servidor");
  }

  esp_camera_fb_return(fb);
}

void setup() {
  //Serial.begin(115200);
  WiFi.begin(ssid, password);

  //Serial.print("Conectando a WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    //Serial.print(".");
  }
  //Serial.println("¡Conectado a WiFi!");

  startCamera();
  sendPhoto();
}

void loop() {
  delay(3600000); // Espera 60 minutos

  sendPhoto();  // Toma y envía una nueva imagen
}
