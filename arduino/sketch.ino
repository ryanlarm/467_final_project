#include <SparkFunMAX31855k.h>
#include <SPI.h>
#define FILTER_WINDOW 5
#define DELAY 500

// Buffer for rolling average filter
float temps[FILTER_WINDOW];
int index = 0;
int filled = 0;

// First Thermocouple
const uint8_t FCHIP_SELECT_PIN = 10;
const uint8_t FVCC = 14;
const uint8_t FGND = 15;
SparkFunMAX31855k probe(FCHIP_SELECT_PIN, FVCC, FGND);

void setup() {
  Serial.begin(9600);
  delay(DELAY);
}

void loop() {
  float temp = probe.readTempF();
  temps[index % FILTER_WINDOW] = temp;

  // Binary flag indicating buffer is completely filled
  if(!filled && (index % FILTER_WINDOW) == 0) {
    filled = 1;
  }

  // Buffer is filled, calculate average
  if(filled) {
    float sum = 0.0;
    for(int i = 0; i < FILTER_WINDOW; ++i) {
      sum += temps[i];
    }
    sum = sum / FILTER_WINDOW;

   // Send temp to pi
   Serial.println(sum);
   
  }
  delay(DELAY);
  index++;
  
}
