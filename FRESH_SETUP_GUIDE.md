# Fresh Setup Guide for Image Binary Storage

## For New Developers Pulling from GitHub

Follow these steps to get the exact same database state with all images:

### Step 1: Install Dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Step 2: Configure Environment Variables

```bash
cp .env.example .env
# Edit .env with your database credentials and settings
```

### Step 3: Create Database

```bash
# Create PostgreSQL database
psql postgres
CREATE DATABASE uicguessr_db;
CREATE USER uicadmin WITH PASSWORD 'secure_password_123';
GRANT ALL PRIVILEGES ON DATABASE uicguessr_db TO uicadmin;
\q
```

### Step 4: Run Migrations

```bash
python manage.py migrate
```

### Step 5: Load Events WITH Images (The Critical Step!)

```bash
# This loads all 4 UIC events with their binary image data
python manage.py loaddata games/fixtures/uic_events_with_images.json
```

### Step 6: Create Superuser (Optional, for admin access)

```bash
python manage.py createsuperuser
```

### Step 7: Run Server

```bash
python manage.py runserver
```

---

## Why This Works

1. **Database Migrations**: `python manage.py migrate` applies the schema changes (adds `image_data` and `image_format` fields)
2. **Fixture Loading**: `python manage.py loaddata` loads the fixture file which contains all 4 UIC events with their binary image data already included

The fixture file (`games/fixtures/uic_events_with_images.json`) is **3.1 MB** and includes:
- ✅ All 4 UIC events
- ✅ Event names, descriptions, organizations
- ✅ Binary image data (base64 encoded in JSON)
- ✅ Image formats (jpg, png)
- ✅ Acceptable answers for each event
- ✅ Points values

---

## What's in the Fixture File

The file is automatically generated from the database using:
```bash
python manage.py dumpdata games.uicevent > games/fixtures/uic_events_with_images.json
```

It contains the exact database state, so everyone gets:
- ✅ Chicago Marathon Cheers (jpg)
- ✅ Latin American Music Festival (png)
- ✅ Movie Under the Stars (jpg)
- ✅ Recfest (png)

With all binary image data included!

---

## Troubleshooting

### Error: "Fixture file not found"

Make sure you're in the backend directory:
```bash
cd backend
python manage.py loaddata games/fixtures/uic_events_with_images.json
```

### Error: "Could not deserialize object"

Your migrations may not be applied. Run:
```bash
python manage.py migrate
```

Then try loading again.

### Events loaded but no images showing

Clear your browser cache or use incognito mode, then:
1. Login to the app
2. Start a new game
3. Images should display from database binary data

---

## Quick Copy-Paste Setup (For Fresh Clone)

```bash
# From repo root
cd backend

# Setup
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env

# Database (assumes PostgreSQL is running)
psql postgres -c "CREATE DATABASE uicguessr_db;"
psql postgres -c "CREATE USER uicadmin WITH PASSWORD 'secure_password_123';"
psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE uicguessr_db TO uicadmin;"

# Django setup
python manage.py migrate
python manage.py loaddata games/fixtures/uic_events_with_images.json
python manage.py createsuperuser

# Run
python manage.py runserver
```

---

**Last Updated**: November 20, 2025
