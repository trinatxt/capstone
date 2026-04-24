# SmartPod — Capstone Project

A smart IoT office pod management system built with React Native (Android), Node.js/Express, PostgreSQL, and an ESP32-S3 firmware that communicates over AWS IoT Core MQTT.

## Project Structure

```
capstone/
  frontend/                React Native mobile app
  backend/                 Node.js/Express REST API
  withble_wifi_fixed.ino   ESP32-S3 firmware
```

---

## Prerequisites

Install the following on your development machine before starting:

- **Node.js** (v18 or later) — https://nodejs.org
- **npm** (comes with Node.js)
- **Java JDK 17** — required for Android builds
- **Android Studio** with Android SDK (API 33+) and an Android emulator, OR a physical Android device with USB debugging enabled
- **Arduino IDE** (only required if flashing the ESP32 firmware) with ESP32 board support installed

---

## First-Time Setup

### 1. Clone the repository

```sh
git clone <repo-url>
cd capstone
```

### 2. Backend setup

```sh
cd backend
npm install
```

Create a `.env` file inside the `backend/` folder with the following environment variables (ask the project owner for the actual values):

```
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<db>
AWS_IOT_DATA_ENDPOINT=<your-endpoint>-ats.iot.<region>.amazonaws.com
AWS_IOT_CERT=-----BEGIN CERTIFICATE-----\n...
AWS_IOT_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----\n...
AWS_IOT_ROOT_CA=-----BEGIN CERTIFICATE-----\n...
PORT=5000
```

> **Note:** The AWS IoT cert/key/CA must each be on a single line with `\n` as literal characters for line breaks inside the `.env` file.

Start the backend:

```sh
node index.js
```

You should see `Server running on port 5000`.

### 3. Find your local Wi-Fi IP address

The mobile app on your phone/emulator needs to reach the backend running on your laptop, so it must be told your laptop's IP address on the local network.

**Windows (PowerShell / cmd):**

```sh
ipconfig
```

Look for the `IPv4 Address` under the `Wireless LAN adapter Wi-Fi:` section (e.g. `192.168.1.12` or `172.20.10.3`).

**macOS / Linux:**

```sh
ifconfig | grep "inet "
```

Or:

```sh
ip addr show
```

### 4. Update the API URL in the frontend

Open [frontend/src/api/apiClient.ts](frontend/src/api/apiClient.ts) and replace the IP address with your laptop's IP from the previous step:

```ts
export const API_URL = "http://<YOUR_LAPTOP_IP>:5000";
```

> **Important:** Every time you connect to a new Wi-Fi network (or switch between home Wi-Fi and a mobile hotspot), your laptop's IP will change and you must update this file again. Your phone and your laptop must be on the **same network** for the app to reach the backend.

### 5. Frontend setup

Open a new terminal and run:

```sh
cd frontend
npm install
```

Start Metro (the JavaScript bundler):

```sh
npm start
```

In another terminal, with an Android emulator running or a physical device connected via USB:

```sh
cd frontend
npm run android
```

The app should build and launch on your device/emulator.

---

## ESP32 Firmware (Optional)

Required only if you are setting up a physical pod unit.

1. Open `withble_wifi_fixed.ino` in the Arduino IDE
2. Install the required libraries via Library Manager:
   - `Adafruit NeoPixel`
   - `PubSubClient`
   - `ArduinoJson`
3. At the top of the file, set your Wi-Fi credentials:
   ```cpp
   const char* ssid     = "YOUR_HOTSPOT_NAME";
   const char* password = "YOUR_HOTSPOT_PASSWORD";
   ```
4. Select **ESP32S3 Dev Module** as the board, connect the ESP32 via USB, and flash the code
5. Open Serial Monitor at 115200 baud — you should see Wi-Fi connect, NTP time sync, and AWS IoT MQTT connection messages

The pod will subscribe to:
- `pods/delta-pod-1/commands` — control commands (brightness, fan speed, mode, Wi-Fi switching)
- `pods/delta-pod-1/knock` — knock LED triggers

---

## Running the Full System

Once everything is set up, to run the whole system you need **three processes**:

1. **Backend** — `cd backend && node index.js`
2. **Metro bundler** — `cd frontend && npm start`
3. **Android app** — `cd frontend && npm run android` (only needed on first run, or to rebuild)

The ESP32 runs independently once flashed.

---

## Troubleshooting

### App shows "Could not connect to server"
- Check that the backend is running (`node index.js` in `backend/` folder)
- Check that your phone and laptop are on the **same Wi-Fi network**
- Re-run `ipconfig` — your laptop's IP may have changed — and update `frontend/src/api/apiClient.ts`
- Disable any firewall blocking port 5000 on your laptop

### Metro bundler fails
- Clear the cache: `npm start -- --reset-cache`

### Android build fails
- Clean and rebuild: `cd frontend/android && ./gradlew clean`, then `npm run android` from `frontend/`

### ESP32 "WiFi disconnected" loop
- The hardcoded SSID and password in `withble_wifi_fixed.ino` don't match an active network
- Update credentials and re-flash, or send new credentials via the Wi-Fi settings page in the app

### Pod not responding to control commands
- Check Serial Monitor — the ESP32 must show `✅ MQTT connected` and `Subscribed: pods/delta-pod-1/commands`
- Confirm the AWS IoT certs in the backend `.env` are valid and on a single line with `\n` escapes

---

## Folder Structure

```
frontend/
  src/
    api/           apiClient.ts — backend URL configuration
    screens/       App screens (Home, Dashboard, Controls, MakeBooking, etc.)
    navigation/    Tab and stack navigators
    components/    Reusable components (modals, etc.)
    context/       UserContext provider
    images/        Image assets
  android/         Android native project
  App.tsx          Root component

backend/
  index.js         Express app + all routes + DB init
  .env             Environment variables (not committed)
  package.json
```
