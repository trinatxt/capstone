#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <Adafruit_NeoPixel.h>
#include <time.h>
#include "WiFiProv.h"

// =====================================================
// CONFIGURATION - MOVE THESE TO A SEPARATE CONFIG FILE
// =====================================================

// ========== WIFI CONFIG ==========
const char* ssid     = "jjjddd";
const char* password = "abc12345";
#define SERVICE_NAME "SmartPod-Provision"
#define POP "abcd1234"


// ========== AWS CONFIG ==========
const char* aws_endpoint = "a33r8ftlbjdg0c-ats.iot.ap-southeast-2.amazonaws.com";
const int   aws_port     = 8883;

// Logical pod identity (also used as MQTT clientId)
const char* pod_id = "delta-pod-1";

// Keep this FALSE for production
const bool SKIP_CERT_VERIFY = false;

// ========== CERTIFICATES ==========
// WARNING: These should be moved to a separate .h file in production
const char* aws_root_ca_pem = \
"-----BEGIN CERTIFICATE-----\n" \
"MIIDQTCCAimgAwIBAgITBmyfz5m/jAo54vB4ikPmljZbyjANBgkqhkiG9w0BAQsF\n" \
"ADA5MQswCQYDVQQGEwJVUzEPMA0GA1UEChMGQW1hem9uMRkwFwYDVQQDExBBbWF6\n" \
"b24gUm9vdCBDQSAxMB4XDTE1MDUyNjAwMDAwMFoXDTM4MDExNzAwMDAwMFowOTEL\n" \
"MAkGA1UEBhMCVVMxDzANBgNVBAoTBkFtYXpvbjEZMBcGA1UEAxMQQW1hem9uIFJv\n" \
"b3QgQ0EgMTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBALJ4gHHKeNXj\n" \
"ca9HgFB0fW7Y14h29Jlo91ghYPl0hAEvrAIthtOgQ3pOsqTQNroBvo3bSMgHFzZM\n" \
"9O6II8c+6zf1tRn4SWiw3te5djgdYZ6k/oI2peVKVuRF4fn9tBb6dNqcmzU5L/qw\n" \
"IFAGbHrQgLKm+a/sRxmPUDgH3KKHOVj4utWp+UhnMJbulHheb4mjUcAwhmahRWa6\n" \
"VOujw5H5SNz/0egwLX0tdHA114gk957EWW67c4cX8jJGKLhD+rcdqsq08p8kDi1L\n" \
"93FcXmn/6pUCyziKrlA4b9v7LWIbxcceVOF34GfID5yHI9Y/QCB/IIDEgEw+OyQm\n" \
"jgSubJrIqg0CAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAOBgNVHQ8BAf8EBAMC\n" \
"AYYwHQYDVR0OBBYEFIQYzIU07LwMlJQuCFmcx7IQTgoIMA0GCSqGSIb3DQEBCwUA\n" \
"A4IBAQCY8jdaQZChGsV2USggNiMOruYou6r4lK5IpDB/G/wkjUu0yKGX9rbxenDI\n" \
"U5PMCCjjmCXPI6T53iHTfIUJrU6adTrCC2qJeHZERxhlbI1Bjjt/msv0tadQ1wUs\n" \
"N+gDS63pYaACbvXy8MWy7Vu33PqUXHeeE6V/Uq2V8viTO96LXFvKWlJbYK8U90vv\n" \
"o/ufQJVtMVT8QtPHRh8jrdkPSHCa2XV4cdFyQzR1bldZwgJcJmApzyMZFo6IQ6XU\n" \
"5MsI+yMRQ+hDKXJioaldXgjUkK642M4UwtBV8ob2xJNDd2ZhwLnoQdeXeGADbkpy\n" \
"rqXRfboQnoZsG4q5WTP468SQvvG5\n" \
"-----END CERTIFICATE-----\n";

const char* aws_device_cert_pem = \
"-----BEGIN CERTIFICATE-----\n" \
"MIIDWTCCAkGgAwIBAgIUVW4CO0etbA96Wbk5aqgTTKtYMBEwDQYJKoZIhvcNAQEL\n" \
"BQAwTTFLMEkGA1UECwxCQW1hem9uIFdlYiBTZXJ2aWNlcyBPPUFtYXpvbi5jb20g\n" \
"SW5jLiBMPVNlYXR0bGUgU1Q9V2FzaGluZ3RvbiBDPVVTMB4XDTI2MDMwNTE0NTcz\n" \
"MFoXDTQ5MTIzMTIzNTk1OVowHjEcMBoGA1UEAwwTQVdTIElvVCBDZXJ0aWZpY2F0\n" \
"ZTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBALjg7X4KybfrOffvs1AX\n" \
"6KZl55kCJwPz706AmtIiKKPiGHd4JT6oEX/pjXAOz+fJ/Yt47Krjn4vZFWKqXmuH\n" \
"/Efvz3WbxkG5i3ERlYUiySePqmslHfoxogoiQWMnMoBEQXHxZBtkHHPvOjA963YL\n" \
"ET1NxHrSCd++m/VmFJ1YVrSpA2Ic31KZHURrgbdbjNZktGAUbE0FJ7BfL2SJG62c\n" \
"xzx7ufzWamFkh7xznMJZtZw322MhkidZzrWhxz7UBWwcWWW3lLvGfBIq/AWbmLGg\n" \
"amS2kL4PAUlsOoWCuetYAoOOTYjvyxBZ6wV/I7bAGB63XKElZKEZq2OJbweIgk0e\n" \
"iG0CAwEAAaNgMF4wHwYDVR0jBBgwFoAUjf+lMfy5nRocv4LOH9IX6DyK0jgwHQYD\n" \
"VR0OBBYEFC7keC9HwUgEOTNS3QXijxGgPjMhMAwGA1UdEwEB/wQCMAAwDgYDVR0P\n" \
"AQH/BAQDAgeAMA0GCSqGSIb3DQEBCwUAA4IBAQBLoSrw9bPzynVKX31DjqNcBoMj\n" \
"nwsq7Y5QI+NDjO8CYqJfH255KQgQ4CqDYnkulwaCOdt6kfYgXuyooVLFJClj1LRV\n" \
"Vw1SWZqYvPhOzukBrpiqAU6LmM6PM6sV6gracOEslypiJdgQAKOkjthxJ0+55tmQ\n" \
"f1N38aIlB0BKuWuzMfC8awfp/v+R3gyUvaSliLj8RCpX8t37SzYEEac7KG2ddiHq\n" \
"vz3IiVQ/I6OTQjg0EM7jTViFdVg1j70gBv2avCkiuPLr29M3Lz5y55iOOdFD/Xcr\n" \
"e3Uyd36vV9TtmU/cffI/n3diVLAdA8apziBd5/bRLYgrsnU9ismRIw0uAFI1\n" \
"-----END CERTIFICATE-----\n";

const char* aws_device_private_key_pem = \
"-----BEGIN RSA PRIVATE KEY-----\n" \
"MIIEpQIBAAKCAQEAuODtfgrJt+s59++zUBfopmXnmQInA/PvToCa0iIoo+IYd3gl\n" \
"PqgRf+mNcA7P58n9i3jsquOfi9kVYqpea4f8R+/PdZvGQbmLcRGVhSLJJ4+qayUd\n" \
"+jGiCiJBYycygERBcfFkG2Qcc+86MD3rdgsRPU3EetIJ376b9WYUnVhWtKkDYhzf\n" \
"UpkdRGuBt1uM1mS0YBRsTQUnsF8vZIkbrZzHPHu5/NZqYWSHvHOcwlm1nDfbYyGS\n" \
"J1nOtaHHPtQFbBxZZbeUu8Z8Eir8BZuYsaBqZLaQvg8BSWw6hYK561gCg45NiO/L\n" \
"EFnrBX8jtsAYHrdcoSVkoRmrY4lvB4iCTR6IbQIDAQABAoIBAFXnjfLnKFvhXQor\n" \
"wvIQafYHm9mo+mAH1MZxU38YiDG+OQgqN4QprBf3edT7zPczEDDie3XcVqIwuJMj\n" \
"/sOQaFU0xP0s6K5ZfMWJGiTGyRks1E787DT5IwX6bM+Zwwl+rbo4I//mQKJOIoeP\n" \
"/fzXn6cQn59CQXxJoUYhrKqABanjpAUdY83b8PXVDs+BKAiq9QXdZBFWS+2xPxNi\n" \
"seYvNq4dw5CyJOiVBBABStyTcmMbMun+jAezHOnROY7seNEj7TSTJK2bw53Wc4w7\n" \
"7B0tTGCH+lLhqZdmlZm2AbXk3bVMxDAWmCrFdyiLNLY7lakPyWNoAIbc4txn/um0\n" \
"v4/KgDECgYEA6nA8aoFSc5nVRxJdygohuyu4jyh/+W2JwISVmjStVsmGSfV2bMpn\n" \
"EEAJCrYrQcVWecBukJEJ9kqikCI26vT5vhSRdHPMqLALLy8Nd8Kml8eHEqP5+W50\n" \
"zcqirghkG7qhG61JBdZwLFbm0Nbs8qgH14SHlHC92/YmX+h+G4/OgqcCgYEAyeHT\n" \
"Mx4Dp5mn2BR2yYqhe97125tFE9081Ccw9uxMk/KaF+f8pNN35Wcvu7qeCNn18aYM\n" \
"tIeOlm8/4njeRiqg0lN3W48GfiBMpYGEisf1AEOACcNb6WoL7bgwN6K826Lfu0h6\n" \
"R7hNVLUZRYMuRov+Jva9ubxeSL3U5CHNBZ7/YssCgYEAxjVoTx/Rhx1LvdAgbb5N\n" \
"MINRge/a6xaafaNbHMpmt1ag7AzVODuUEaAiROUqA2yFpWB12lJWGt6VPMlApzvB\n" \
"ntyi8dMp+IEGo7jjaRqwYOj4IWFz6lhh9s/Y5M0BXpRWvCCw+XeI1WQPuAfOw4Yf\n" \
"Qy6wtmbvjnY5kaLuY/0cu0cCgYEAi57X3zl505bsQv/cK4TqK+5GYQwgmR1gLWWx\n" \
"coR4bbXSJoh17VSnTguwMohdNcfwVaC+lrhNv/LO3wUyzJo8wVmiabsgBWi3OZu6\n" \
"m/Swl+8XBSmMToDeIRlKl5/AN7KMQ01b7HAlY1kgUjfocDfvnOj2zBbfqjVHoENU\n" \
"NPgCrkMCgYEAzSLhZndWAkeZYHJ0zSP79SJVmRus5R5ATuOE3FHyWG9JHOS9/Vfj\n" \
"HbRIXwtXN7hJeVlWZt375iWkW0cDZ/UKVjXU2xhA62FDkVBRm2SvVQn/4OF/ufF5\n" \
"nCV1+nhUGDCvWHAVYO/vMiLmidnPaJdnI+Uj86Ja98Zrfoqw51imc1g=\n" \
"-----END RSA PRIVATE KEY-----\n";

// ================== PIN DEFINITIONS ==================
#define LED_PWR_PIN        5
#define AMBIENT_DATA_PIN   6
#define KNOCK_DATA_PIN     7
#define MANUAL_DATA_PIN    8
#define MANUAL_SWITCH_PIN  9
#define FAN1_PWM_PIN       17
#define FAN2_PWM_PIN       18

#define AMBIENT_LEDS       300
#define KNOCK_LEDS         50
#define MANUAL_LEDS        60

// PWM configuration for fans
#define FAN_PWM_FREQ       25000
#define FAN_PWM_RES        8

#if ESP_ARDUINO_VERSION < ESP_ARDUINO_VERSION_VAL(3, 0, 0)
  #define FAN1_PWM_CH        0
  #define FAN2_PWM_CH        1
#endif

// Topics
const char* topic_sync = "pods/sync";
String topic_commands_str;
String topic_knock_str;

// ================== GLOBAL OBJECTS ==================
WiFiClientSecure secureClient;
PubSubClient mqttClient(secureClient);

volatile bool g_wifiConnected = false;
volatile bool g_provFinished = false;
volatile bool wifiSwitching = false;
String pendingSsid = "";
String pendingPass = "";

Adafruit_NeoPixel ambientStrip(AMBIENT_LEDS, AMBIENT_DATA_PIN, NEO_GRB + NEO_KHZ800);
Adafruit_NeoPixel knockStrip(KNOCK_LEDS, KNOCK_DATA_PIN, NEO_GRB + NEO_KHZ800);
Adafruit_NeoPixel manualStrip(MANUAL_LEDS, MANUAL_DATA_PIN, NEO_GRB + NEO_KHZ800);

// ================== APP STATE ==================
enum AmbientMode {
  MODE_OFF,
  MODE_FOCUS,
  MODE_PRESENTATION,
  MODE_RELAX,
  MODE_PARTY
};

AmbientMode currentAmbientMode = MODE_OFF;
uint8_t ambientBrightness = 75;
bool ambientLightsOn = true;
uint8_t ambientRed = 80;
uint8_t ambientGreen = 120;
uint8_t ambientBlue = 255;

// knock state
bool knockActive = false;
String knockPattern = "flash";
unsigned long knockStartMs = 0;
unsigned long knockDurationMs = 0;
unsigned long knockLastStepMs = 0;
bool knockPhase = false;

// manual strip state
bool manualStripEnabled = false;
bool lastSwitchState = HIGH;

// party animation state
unsigned long ambientAnimMs = 0;
uint16_t partyOffset = 0;

// both fans use one control value
int fanSpeedLevel = 1;

// ================== FORWARD DECLARATIONS ==================
void connectToWiFi();
bool ensureWiFiProvisionedAndConnected();
void SysProvEvent(arduino_event_t *sys_event);
void syncTime();
void setupAWSIoT();
bool connectToMQTT();
void mqttCallback(char* topic, byte* payload, unsigned int length);
void handleCommand(JsonDocument& doc);
void handleKnock(JsonDocument& doc);
void sync();
void publishMessage(const char* topic, const char* message);
void publishMessage(const char* topic, String message);
bool performFullSetup();

void bootAnimation();
void updateAmbientStrip();
void updateKnockStrip();
void updateManualStrip();
void startKnockEffect(const String& pattern, unsigned long durationMs);
void setBothFansSpeed(int level);
void setAllPixels(uint8_t r, uint8_t g, uint8_t b);
void clearStrip();
void clearStrip(Adafruit_NeoPixel& strip);
void fillStrip(Adafruit_NeoPixel& strip, uint8_t r, uint8_t g, uint8_t b);
void setAmbientAll(uint8_t r, uint8_t g, uint8_t b);

// ================== HELPERS ==================
uint32_t colorWheel(Adafruit_NeoPixel& strip, uint8_t pos) {
  pos = 255 - pos;
  if (pos < 85) {
    return strip.Color(255 - pos * 3, 0, pos * 3);
  }
  if (pos < 170) {
    pos -= 85;
    return strip.Color(0, pos * 3, 255 - pos * 3);
  }
  pos -= 170;
  return strip.Color(pos * 3, 255 - pos * 3, 0);
}

void fillStrip(Adafruit_NeoPixel& strip, uint8_t r, uint8_t g, uint8_t b) {
  for (int i = 0; i < strip.numPixels(); i++) {
    strip.setPixelColor(i, strip.Color(r, g, b));
  }
  strip.show();
}

void clearStrip(Adafruit_NeoPixel& strip) {
  strip.clear();
  strip.show();
}

void clearStrip() {
  ambientStrip.clear();
  knockStrip.clear();
  manualStrip.clear();
  ambientStrip.show();
  knockStrip.show();
  manualStrip.show();
}

void setAllPixels(uint8_t r, uint8_t g, uint8_t b) {
  fillStrip(ambientStrip, r, g, b);
  fillStrip(knockStrip, r, g, b);
  fillStrip(manualStrip, r, g, b);
}

void setAmbientAll(uint8_t r, uint8_t g, uint8_t b) {
  for (int i = 0; i < ambientStrip.numPixels(); i++) {
    ambientStrip.setPixelColor(i, ambientStrip.Color(r, g, b));
  }
  ambientStrip.show();
}

uint8_t speedLevelToDuty(int level) {
  level = constrain(level, 1, 5);

  switch (level) {
    case 1: return 20;
    case 2: return 40;
    case 3: return 60;
    case 4: return 80;
    case 5: return 100;
    default: return 20;
  }
}

void setBothFansSpeed(int level) {
  fanSpeedLevel = constrain(level, 1, 5);

  uint8_t percent = speedLevelToDuty(fanSpeedLevel);
  uint8_t pwmValue = map(percent, 0, 100, 0, 255);

  #if ESP_ARDUINO_VERSION >= ESP_ARDUINO_VERSION_VAL(3, 0, 0)
    ledcWrite(FAN1_PWM_PIN, pwmValue);
    ledcWrite(FAN2_PWM_PIN, pwmValue);
  #else
    ledcWrite(FAN1_PWM_CH, pwmValue);
    ledcWrite(FAN2_PWM_CH, pwmValue);
  #endif

  Serial.print("Both fans speed level = ");
  Serial.print(fanSpeedLevel);
  Serial.print(" percent = ");
  Serial.print(percent);
  Serial.print("% pwmValue = ");
  Serial.println(pwmValue);
}

// ================== SETUP ==================
void setup() {
  Serial.begin(115200);
  delay(800);

  pinMode(LED_PWR_PIN, OUTPUT);
  // digitalWrite(LED_PWR_PIN, HIGH);

  pinMode(MANUAL_SWITCH_PIN, INPUT_PULLUP);

  ambientStrip.begin();
  knockStrip.begin();
  manualStrip.begin();

  ambientStrip.clear();
  knockStrip.clear();
  manualStrip.clear();

  ambientStrip.show();
  knockStrip.show();
  manualStrip.show();

  digitalWrite(LED_PWR_PIN, HIGH);

  ambientStrip.setBrightness(ambientBrightness);
  knockStrip.setBrightness(115);
  manualStrip.setBrightness(115);

  #if ESP_ARDUINO_VERSION >= ESP_ARDUINO_VERSION_VAL(3, 0, 0)
    ledcAttach(FAN1_PWM_PIN, FAN_PWM_FREQ, FAN_PWM_RES);
    ledcAttach(FAN2_PWM_PIN, FAN_PWM_FREQ, FAN_PWM_RES);
  #else
    ledcSetup(FAN1_PWM_CH, FAN_PWM_FREQ, FAN_PWM_RES);
    ledcAttachPin(FAN1_PWM_PIN, FAN1_PWM_CH);

    ledcSetup(FAN2_PWM_CH, FAN_PWM_FREQ, FAN_PWM_RES);
    ledcAttachPin(FAN2_PWM_PIN, FAN2_PWM_CH);
  #endif

  setBothFansSpeed(1);

  bootAnimation();

  topic_commands_str = String("pods/") + pod_id + "/commands";
  topic_knock_str    = String("pods/") + pod_id + "/knock";

  WiFi.onEvent(SysProvEvent);
  WiFi.mode(WIFI_STA);

  Serial.println();
  Serial.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  Serial.println("  SmartPod ESP32-S3");
  Serial.println("  3 LED Strips + Knock + 2 Fans");
  Serial.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  Serial.print("Pod ID        : ");
  Serial.println(pod_id);
  Serial.print("Commands topic: ");
  Serial.println(topic_commands_str);
  Serial.print("Knock topic   : ");
  Serial.println(topic_knock_str);

  while (!performFullSetup()) {
    Serial.println("Setup failed. Retrying in 5 seconds...");
    delay(5000);
  }

  currentAmbientMode = MODE_FOCUS;
}

// ========== FULL SETUP SEQUENCE ==========
bool performFullSetup() {
  Serial.println("[1/4] Connecting to WiFi...");
  connectToWiFi();
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi failed. Will retry full setup.");
    return false;
  }

  Serial.println("\n[2/4] Syncing time (NTP)...");
  syncTime();

  Serial.println("\n[3/4] Configuring TLS + MQTT...");
  setupAWSIoT();

  Serial.println("\n[4/4] Connecting to AWS IoT Core...");
  bool ok = connectToMQTT();

  Serial.println("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  if (ok) {
    Serial.println("✅ CONNECTED to AWS IoT Core!");
    Serial.println("Sending initial sync request...");
    sync();
    Serial.println("Now listening for commands + knocks...");
    Serial.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    setAllPixels(0, 40, 0);
    delay(300);
    clearStrip();

    return true;
  } else {
    Serial.println("❌ FAILED to connect to AWS IoT Core.");
    Serial.println("   Most common causes:");
    Serial.println("   - Policy blocks clientId");
    Serial.println("   - Cert not ACTIVE / wrong cert/key pair");
    Serial.println("   - Time not synced (TLS fails)");
    Serial.println("   Will retry full setup.");
    Serial.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    setAllPixels(50, 0, 0);
    delay(300);
    clearStrip();

    return false;
  }
}

// ================== LOOP ==================
void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    static unsigned long lastWifiRetry = 0;
    if (millis() - lastWifiRetry > 5000) {
      lastWifiRetry = millis();
      if (wifiSwitching) {
        // Wait for disconnect to fully settle before calling begin
        unsigned long waitStart = millis();
        while (WiFi.status() != WL_DISCONNECTED && millis() - waitStart < 3000) {
          delay(100);
        }
        Serial.print("📶 Connecting to new WiFi: ");
        Serial.println(pendingSsid);
        WiFi.mode(WIFI_STA);
        WiFi.begin(pendingSsid.c_str(), pendingPass.c_str());
        unsigned long t = millis();
        while (WiFi.status() != WL_CONNECTED && millis() - t < 20000) {
          delay(500);
          Serial.print(".");
        }
        Serial.println();
        if (WiFi.status() == WL_CONNECTED) {
          Serial.println("✅ Switched WiFi successfully");
          wifiSwitching = false;
        } else {
          Serial.println("❌ Switch failed, retrying...");
        }
      } else {
        Serial.println("⚠️ WiFi disconnected. Reconnecting...");
        connectToWiFi();
      }
    }
  }

  if (WiFi.status() == WL_CONNECTED) {
    if (!mqttClient.connected()) {
      if (connectToMQTT()) {
        sync();
      }
    }
    mqttClient.loop();
  }

  updateAmbientStrip();
  updateKnockStrip();
  updateManualStrip();
}

// ========== WIFI ==========
void connectToWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  Serial.print("  SSID: ");
  Serial.println(ssid);
  Serial.print("  Status: Connecting");

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println(" ✅");
    Serial.print("  IP: ");
    Serial.println(WiFi.localIP());
    Serial.print("  RSSI: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
  } else {
    Serial.println(" ❌");
  }
}

bool ensureWiFiProvisionedAndConnected() {
  g_wifiConnected = (WiFi.status() == WL_CONNECTED);
  g_provFinished = false;

  if (g_wifiConnected) {
    Serial.println("WiFi already connected.");
    return true;
  }

  Serial.println("Starting BLE provisioning service / reconnect flow...");

  WiFiProv.beginProvision(
    NETWORK_PROV_SCHEME_BLE,
    NETWORK_PROV_SCHEME_HANDLER_FREE_BTDM,
    NETWORK_PROV_SECURITY_1,
    POP,
    SERVICE_NAME
  );

  Serial.println("Use your mobile app to scan the BLE device and send WiFi credentials.");
  Serial.println("If credentials were already stored, ESP32 should reconnect automatically.");

  unsigned long start = millis();
  const unsigned long timeoutMs = 120000;

  while (millis() - start < timeoutMs) {
    if (WiFi.status() == WL_CONNECTED) {
      g_wifiConnected = true;
      Serial.println("✅ WiFi connected");
      Serial.print("IP: ");
      Serial.println(WiFi.localIP());
      return true;
    }
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("❌ WiFi connect/provision timeout");
  return false;
}

// ========== TIME SYNC ==========
void syncTime() {
  configTime(0, 0, "pool.ntp.org", "time.nist.gov");

  Serial.print("  Syncing");
  time_t now = time(nullptr);
  int retries = 0;

  while (now < 1700000000 && retries < 30) {
    delay(500);
    Serial.print(".");
    now = time(nullptr);
    retries++;
  }
  Serial.println();

  Serial.print("  Epoch: ");
  Serial.println((long)now);

  if (now < 1700000000) {
    Serial.println("  ⚠️ Time sync may have failed. TLS may fail.");
  } else {
    Serial.println("  ✅ Time is set.");
  }
}

// ========== AWS IOT / TLS SETUP ==========
void setupAWSIoT() {
  Serial.print("  Endpoint: ");
  Serial.println(aws_endpoint);

  secureClient.setCertificate(aws_device_cert_pem);
  secureClient.setPrivateKey(aws_device_private_key_pem);

  if (SKIP_CERT_VERIFY) {
    Serial.println("  ⚠️ SKIP_CERT_VERIFY=true -> setInsecure()");
    secureClient.setInsecure();
  } else {
    secureClient.setCACert(aws_root_ca_pem);
  }

  mqttClient.setServer(aws_endpoint, aws_port);
  mqttClient.setCallback(mqttCallback);
  mqttClient.setKeepAlive(60);
  mqttClient.setSocketTimeout(30);
  mqttClient.setBufferSize(2048);

  Serial.print("  TCP test : ");
  WiFiClient testClient;
  if (testClient.connect(aws_endpoint, aws_port)) {
    Serial.println("✅ reachable");
    testClient.stop();
  } else {
    Serial.println("❌ not reachable (network/hotspot blocking 8883?)");
  }
}

// ========== MQTT CONNECT ==========
bool connectToMQTT() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("  ❌ WiFi not connected.");
    return false;
  }

  const char* clientId = pod_id;

  Serial.print("  Client ID: ");
  Serial.println(clientId);

  Serial.print("  Connecting");
  bool connected = false;

  unsigned long start = millis();
  while (millis() - start < 10000) {
    if (mqttClient.connect(clientId)) {
      connected = true;
      break;
    }
    delay(250);
    Serial.print(".");
  }

  if (!connected) {
    Serial.println(" ❌");
    Serial.print("  mqttClient.state(): ");
    Serial.println(mqttClient.state());
    return false;
  }

  Serial.println(" ✅");

  if (mqttClient.subscribe(topic_commands_str.c_str())) {
    Serial.print("  Subscribed: ");
    Serial.println(topic_commands_str);
  } else {
    Serial.println("  ⚠️ Subscribe failed for commands topic.");
  }

  if (mqttClient.subscribe(topic_knock_str.c_str())) {
    Serial.print("  Subscribed: ");
    Serial.println(topic_knock_str);
  } else {
    Serial.println("  ⚠️ Subscribe failed for knock topic.");
  }

  return true;
}

// ========== SYNC ==========
void sync() {
  StaticJsonDocument<256> doc;
  doc["pod_id"] = pod_id;
  doc["action"] = "sync_request";
  doc["timestamp_ms"] = (uint32_t)millis();

  String payload;
  serializeJson(doc, payload);

  publishMessage(topic_sync, payload);

  Serial.print("Sync request sent to ");
  Serial.print(topic_sync);
  Serial.print(": ");
  Serial.println(payload);
}

// ========== PUBLISH ==========
void publishMessage(const char* topic, const char* message) {
  if (!mqttClient.connected()) return;

  bool ok = mqttClient.publish(topic, message);
  if (!ok) {
    Serial.print("Publish failed to ");
    Serial.println(topic);
  } else {
    Serial.print("Published to ");
    Serial.print(topic);
    Serial.print(": ");
    Serial.println(message);
  }
}

void publishMessage(const char* topic, String message) {
  publishMessage(topic, message.c_str());
}

// ================== BOOT ANIMATION ==================
void bootAnimation() {
  fillStrip(ambientStrip, 0, 0, 30);
  fillStrip(knockStrip, 0, 0, 30);
  fillStrip(manualStrip, 0, 0, 30);
  delay(200);

  clearStrip(ambientStrip);
  clearStrip(knockStrip);
  clearStrip(manualStrip);
}

// ================== MQTT CALLBACK ==================
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String msg;
  msg.reserve(length + 1);

  for (unsigned int i = 0; i < length; i++) {
    msg += (char)payload[i];
  }

  Serial.print("Message on ");
  Serial.print(topic);
  Serial.print(": ");
  Serial.println(msg);

  StaticJsonDocument<768> doc;
  DeserializationError error = deserializeJson(doc, msg);

  if (error) {
    Serial.print("JSON parse error: ");
    Serial.println(error.c_str());
    return;
  }

  if (strcmp(topic, topic_commands_str.c_str()) == 0) {
    handleCommand(doc);
    return;
  }

  if (strcmp(topic, topic_knock_str.c_str()) == 0) {
    handleKnock(doc);
    return;
  }
}

void SysProvEvent(arduino_event_t *sys_event) {
  switch (sys_event->event_id) {
    case ARDUINO_EVENT_PROV_START:
      Serial.println("BLE provisioning started");
      Serial.print("Service name: ");
      Serial.println(SERVICE_NAME);
      break;

    case ARDUINO_EVENT_PROV_CRED_RECV:
      Serial.println("WiFi credentials received from app");
      break;

    case ARDUINO_EVENT_PROV_CRED_SUCCESS:
      Serial.println("WiFi credentials applied successfully");
      break;

    case ARDUINO_EVENT_PROV_CRED_FAIL:
      Serial.println("WiFi provisioning failed");
      break;

    case ARDUINO_EVENT_PROV_END:
      Serial.println("Provisioning session ended");
      g_provFinished = true;
      break;

    case ARDUINO_EVENT_WIFI_STA_CONNECTED:
      Serial.println("WiFi connected to AP");
      break;

    case ARDUINO_EVENT_WIFI_STA_GOT_IP:
      Serial.print("WiFi got IP: ");
      Serial.println(WiFi.localIP());
      g_wifiConnected = true;
      break;

    case ARDUINO_EVENT_WIFI_STA_DISCONNECTED:
      Serial.println("WiFi disconnected");
      g_wifiConnected = false;
      break;

    default:
      break;
  }
}

// ================== MAIN COMMAND HANDLER ==================
void handleCommand(JsonDocument& doc) {
  Serial.println("Processing command...");

  if (doc.containsKey("lights_on")) {
    ambientLightsOn = doc["lights_on"].as<bool>();
    Serial.print("lights_on = ");
    Serial.println(ambientLightsOn ? "true" : "false");

    if (!ambientLightsOn) {
      currentAmbientMode = MODE_OFF;
      clearStrip(ambientStrip);
    }
  }

  if (doc.containsKey("brightness")) {
    ambientBrightness = constrain(doc["brightness"].as<int>(), 0, 64);
    ambientStrip.setBrightness(ambientBrightness);

    Serial.print("brightness = ");
    Serial.println(ambientBrightness);
  }

  if (doc.containsKey("theme_id")) {
    String theme = doc["theme_id"].as<String>();
    theme.toLowerCase();

    ambientLightsOn = true;

    if (theme == "off") {
      currentAmbientMode = MODE_OFF;
      ambientLightsOn = false;
    } else if (theme == "focus") {
      currentAmbientMode = MODE_FOCUS;
      ambientRed = 80; ambientGreen = 120; ambientBlue = 255;
    } else if (theme == "presentation") {
      currentAmbientMode = MODE_PRESENTATION;
    } else if (theme == "relax") {
      currentAmbientMode = MODE_RELAX;
    } else if (theme == "party") {
      currentAmbientMode = MODE_PARTY;
    } else {
      currentAmbientMode = MODE_OFF;
      ambientLightsOn = false;
    }

    Serial.print("theme_id = ");
    Serial.println(theme);
  }

  if (doc.containsKey("fan_speed")) {
    int speed = constrain(doc["fan_speed"].as<int>(), 1, 5);
    setBothFansSpeed(speed);
  }

  if (doc.containsKey("unlock") && doc["unlock"].as<bool>()) {
    Serial.println("unlock = true (TODO: unlock hardware)");
  }

  if (doc.containsKey("wifi_ssid") && doc.containsKey("wifi_password")) {
    String newSsid = doc["wifi_ssid"].as<String>();
    String newPass = doc["wifi_password"].as<String>();
    Serial.print("Switching WiFi to: ");
    Serial.println(newSsid);
    pendingSsid = newSsid;
    pendingPass = newPass;
    wifiSwitching = true;
    WiFi.disconnect(true);
    // loop() detects the drop and calls WiFi.begin(pendingSsid, pendingPass)
  }
}

// ================== KNOCK HANDLER ==================
void handleKnock(JsonDocument& doc) {
  Serial.println("Processing knock...");

  const char* fromPod = doc["from_pod"] | "unknown";

  Serial.print("from_pod = ");
  Serial.println(fromPod);

  startKnockEffect("pulse", 2000);
}

// ================== AMBIENT STRIP ==================
void updateAmbientStrip() {
  static AmbientMode lastMode = MODE_OFF;
  static uint8_t lastBrightness = 255;
  static bool lastLightsOn = true;
  static uint8_t lastRed = 0, lastGreen = 0, lastBlue = 0;

  ambientStrip.setBrightness(ambientBrightness);

  if (!ambientLightsOn || currentAmbientMode == MODE_OFF) {
    if (lastLightsOn || lastMode != MODE_OFF) {
      clearStrip(ambientStrip);
      lastLightsOn = false;
      lastMode = MODE_OFF;
      lastBrightness = ambientBrightness;
    }
    return;
  }

  if (currentAmbientMode == MODE_PARTY) {
    if (millis() - ambientAnimMs > 40) {
      ambientAnimMs = millis();

      for (int i = 0; i < ambientStrip.numPixels(); i++) {
        ambientStrip.setPixelColor(
          i,
          colorWheel(ambientStrip, (i * 256 / ambientStrip.numPixels() + partyOffset) & 255)
        );
      }

      ambientStrip.show();
      partyOffset++;
    }

    lastLightsOn = true;
    lastMode = MODE_PARTY;
    lastBrightness = ambientBrightness;
    return;
  }

  bool changed =
    currentAmbientMode != lastMode ||
    ambientBrightness != lastBrightness ||
    lastLightsOn != ambientLightsOn ||
    ambientRed != lastRed ||
    ambientGreen != lastGreen ||
    ambientBlue != lastBlue;

  if (changed) {
    switch (currentAmbientMode) {
      case MODE_OFF:
        clearStrip(ambientStrip);
        break;

      case MODE_FOCUS:
        setAmbientAll(ambientRed, ambientGreen, ambientBlue);
        break;

      case MODE_PRESENTATION:
        setAmbientAll(255, 180, 80);
        break;

      case MODE_RELAX:
        setAmbientAll(255, 200, 40);
        break;

      case MODE_PARTY:
        break;
    }

    lastMode = currentAmbientMode;
    lastBrightness = ambientBrightness;
    lastLightsOn = ambientLightsOn;
    lastRed = ambientRed;
    lastGreen = ambientGreen;
    lastBlue = ambientBlue;
  }
}

// ================== KNOCK STRIP ==================
void startKnockEffect(const String& pattern, unsigned long durationMs) {
  knockActive = true;
  knockPattern = pattern;
  knockDurationMs = durationMs;
  knockStartMs = millis();
  knockLastStepMs = 0;
  knockPhase = false;
}

void updateKnockStrip() {
  static bool wasActive = false;

  if (!knockActive) {
    if (wasActive) {
      clearStrip(knockStrip);
      wasActive = false;
    }
    return;
  }

  wasActive = true;
  unsigned long now = millis();

  if (now - knockStartMs >= knockDurationMs) {
    knockActive = false;
    clearStrip(knockStrip);
    return;
  }

  if (knockPattern == "pulse") {
    if (now - knockLastStepMs > 180) {
      knockLastStepMs = now;
      knockPhase = !knockPhase;
      if (knockPhase) fillStrip(knockStrip, 255, 140, 0);
      else clearStrip(knockStrip);
    }
  } else if (knockPattern == "fast") {
    if (now - knockLastStepMs > 80) {
      knockLastStepMs = now;
      knockPhase = !knockPhase;
      if (knockPhase) fillStrip(knockStrip, 255, 180, 0);
      else clearStrip(knockStrip);
    }
  } else {
    if (now - knockLastStepMs > 150) {
      knockLastStepMs = now;
      knockPhase = !knockPhase;
      if (knockPhase) fillStrip(knockStrip, 255, 255, 255);
      else clearStrip(knockStrip);
    }
  }
}

// ================== MANUAL STRIP ==================
void updateManualStrip() {
  bool switchState = digitalRead(MANUAL_SWITCH_PIN);

  if (switchState == LOW) {
    manualStripEnabled = true;
  } else {
    manualStripEnabled = false;
  }

  static bool lastManualStripEnabled = false;

  if (manualStripEnabled != lastManualStripEnabled) {
    if (manualStripEnabled) {
      fillStrip(manualStrip, 255, 255, 180);
    } else {
      clearStrip(manualStrip);
    }

    lastManualStripEnabled = manualStripEnabled;
  }
}