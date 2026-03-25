# Meeting Pod App — Capstone Project

A smart IoT meeting pod management app built with React Native (Android).

## Project Structure

```
capstone/
  frontend/    React Native mobile app
  backend/     Server / API (coming soon)
```

---

## Frontend (React Native)

All frontend commands must be run from inside the `frontend/` folder.

```sh
cd frontend
```

### Install dependencies

```sh
npm install
```

### Start Metro (JS bundler)

```sh
npm start
```

### Run on Android

Make sure an Android emulator is running or a device is connected, then in a new terminal:

```sh
cd frontend
npm run android
```

### Folder structure

```
frontend/
  src/
    screens/       App screens (Home, Dashboard, Controls, Events, etc.)
    navigation/    Tab and stack navigators
    components/    Reusable components (modals, etc.)
    images/        Image assets
  android/         Android native project
  App.tsx          Root component
  index.js         Entry point
```

---

## Backend

```sh
cd backend
```

Backend setup coming soon.

---

## Troubleshooting

- If Metro fails, try clearing the cache: `npm start -- --reset-cache`
- If the Android build fails, run `cd frontend/android && ./gradlew clean` then retry
- Make sure all commands are run from `frontend/`, not the repo root
