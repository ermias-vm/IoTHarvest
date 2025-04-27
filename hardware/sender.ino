//Librerías protocolo LoRa
#include <SPI.h>
#include <LoRa.h>

//Librería sensor
#include<DHT.h>

//Librerías pantalla OLED
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>


// Configuración sensor DHT
#define DHTTYPE  DHT11 
#define DHTPIN   17   
DHT dht(DHTPIN, DHTTYPE);

//pines para protocolo LoRa
#define SCK 5
#define MISO 19
#define MOSI 27
#define SS 18
#define RST 14
#define DIO0 26

//866E6 para Europa (freqüencia comunicación)
#define BAND 868E6

//pines OLED
#define OLED_SDA 4
#define OLED_SCL 15 
#define OLED_RST 16
#define SCREEN_WIDTH 128 // OLED display width, in pixels
#define SCREEN_HEIGHT 64 // OLED display height, in pixels

//contador paquetes
int counter = 0;

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RST);

void setup() {
  Serial.begin(115200);
  Serial.println("prova port serie");

  //reset OLED display via software
  pinMode(OLED_RST, OUTPUT);
  digitalWrite(OLED_RST, LOW);
  delay(20);
  digitalWrite(OLED_RST, HIGH);

  //inicio pantalla OLED
  Wire.begin(OLED_SDA, OLED_SCL);
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3c, false, false)) {
    Serial.println(F("SSD1306 allocation failed"));
    for(;;);
  }
  
  display.clearDisplay();
  display.setTextColor(WHITE);
  display.setTextSize(1);
  display.setCursor(0,0);
  display.print("LORA SENDER ");
  display.display();
  
  Serial.println("LoRa Sender Test");

  //SPI LoRa pins
  SPI.begin(SCK, MISO, MOSI, SS);
  LoRa.setPins(SS, RST, DIO0);
  
  if (!LoRa.begin(BAND)) {
    Serial.println("Starting LoRa failed!");
    while (1);
  }
  Serial.println("LoRa Initializing OK!");
  display.setCursor(0,10);
  display.print("LoRa Initializing OK!");
  display.setCursor(0,20);
  display.print("Starting lecutres...");
  display.display();
  delay(2000);

  dht.begin();
}

void loop() {
  //lectura sensor temperatura
  float temperatura = dht.readTemperature();
  float humitat = dht.readHumidity();

  String lectures = String(temperatura) + ";" + String(humitat);

  //envío de paquete LoRa a placa receptora
  LoRa.beginPacket();
  LoRa.print(lectures);
  LoRa.endPacket();
  
  display.clearDisplay();
  display.setCursor(0,0);
  display.println("LORA SENDER");
  display.setCursor(0,20);
  display.setTextSize(1);
  display.print("LoRa packet sent: ");
  display.setCursor(0,30);
  display.print(temperatura);
  display.setCursor(0,50);
  display.print("ID:");
  display.setCursor(20,50);
  display.print(counter);      
  display.display();

  counter++;
  
  delay(7000);
}