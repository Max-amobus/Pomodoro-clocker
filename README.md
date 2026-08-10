# Pomodoro Clocker

A full-stack Pomodoro timer web application built with Django and vanilla JavaScript. It helps users maintain focus using the Pomodoro technique, track their productivity analytics, and customize their workflow.

## Features

- **User Authentication:** Registration, login, and secure sessions.
- **Guest Mode:** Unauthenticated users can use the timer, with sessions temporarily saved in the browser's LocalStorage.
- **Focus Timer:** Pomodoro, Short Break, and Long Break modes.
- **Customizable Workspace:** Users can change timer durations, toggle auto-start for consecutive sessions, and enable sound notifications.
- **Analytics Dashboard:** Visual charts and statistics tracking total focus time, completed sessions, and active days.
- **Session History:** A detailed log of all past focus sessions and breaks.
- **PWA Support:** Installable as a standalone application on desktop and mobile devices.

## Tech Stack

- **Backend:** Python, Django, SQLite
- **Frontend:** HTML, CSS, JavaScript (Vanilla)
- **Architecture:** MVT (Model-View-Template) with asynchronous Fetch API calls for timer data.

## Run locally

```bash
# Create a virtual environment
python -m venv venv

# Activate it (Windows)
venv\Scripts\activate
# Activate it (macOS / Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Apply database migrations
python manage.py migrate

# Run the development server
python manage.py runserver