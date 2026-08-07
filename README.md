# Pomodoro Clocker — UI Redesign

This version keeps the existing Pomodoro timer JavaScript logic and redesigns the interface to match the provided reference style: clean white cards, soft gray background, red accents, top navigation, dashboard analytics, session history, login and registration screens, and a settings screen.

## What was changed

- Redesigned the main dashboard UI.
- Kept `static/js/timer.js` as the timer logic and preserved its existing DOM hooks.
- Added a responsive layout for desktop and mobile.
- Added visual pages for:
  - Login
  - Register
  - Dashboard / Analytics
  - Session History
  - Settings
- Added navigation between the visual pages.
- The existing timer still supports Pomodoro, Short Break, Long Break, Start/Pause, and Reset.

## Run locally

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Open `http://127.0.0.1:8000/` in a browser.

## Important note

This redesign intentionally does not introduce new authentication or analytics business logic. The Login, Register, History, and Settings screens are visual UI templates. The existing Pomodoro timer logic remains in `static/js/timer.js`.
