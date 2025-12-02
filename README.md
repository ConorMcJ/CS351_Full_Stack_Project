# Student-Life Guessr

**Full-stack interactive guessing game based on UIC events!**  
Built with **Django** and **React + Vite**

---

## Demo Video
Watch app tutorial here: https://drive.google.com/file/d/1HGE4qitowqzsCjBbtz92oiViupdxlNW1/view?usp=share_link  

---

## How to Run Project

### Backend Setup (Django)
```bash
cd backend
python -m venv venv
source venv/bin/activate    # Mac/Linux
# On Windows: venv/Scripts/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py loaddata games/fixtures/uic_events_with_images.json    # Loads game event data/pictures
python manage.py createsuperuser
python manage.py runserver
```

After running `runserver`, open backend at:  
**http://127.0.0.1:8000**

To access Django Admin:  
Go to: `http://127.0.0.1:8000/admin`
Log in using username & password you created with `createsuperuser`

In admiin panel:
- **Accounts -> User Profiles** - View emails, best scores, games played, signup date  
- **Games -> UIC Events** - Add/edit campus events for the game (with images + answers + point value)  

---

### Frontend Setup (React)
Open a **second terminal**:

```bash
cd frontend
npm install
npm run dev
```

Frontend will launch via Vite at:  
**http://localhost:5173**

The application includes:  
- Login Page: Register/Sign in with an email + password 
- Main Menu: View logged in user + Log out + View leaderboard + Sync data + Start new game  
- Game Screen: Guess UIC events based on pictures + Gain points + Return to Main Menu to end early  
- Game Over: View points earned + Reason game ended + Guess accuracy + Start new game or returt to Main Menu

---

## Data Structures & Game Logic

### Trie + Fuzzy Searching (IDDFS)

The gameplay engine includes:  
- Trie Data Structure: For fast lookup of valid event names and prefixes  
- IDDFS Algorithm: Fuzzy matching for partial credit when users are close  

**Relevant Files:**  
```
backend/games/utils/trie.py
backend/games/utils/fuzzy_finder.py
```

### Scoring Logic:
1. Exact match -> Full points
2. Prefix match -> Partial points
3. Name is close (fuzzy match) -> Some points