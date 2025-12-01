
Culture Guessr README.md
Culture Guessr Video Demo: https://drive.google.com/file/d/1HGE4qitowqzsCjBbtz92oiViupdxlNW1/view?usp=share_link

HOW TO RUN PROJECT 
1. In Main Folder
    cd backend
    python -m venv venv *(if not already in an virtual enviroment)*
    source venv/bin/activate
    pip install -r requirements.txt
    python manage.py migrate
    python manage.py loaddata games/fixtures/uic_events_with_images.json *(Loads game event data/pictures only need to do this once)*
    python manage.py createsuperuser *(Creates your admin acount, input your username/password information)*
    python manage.py runserver  *(Runs the Django Server)*

2. In a seperate terminal *(In Main Project)*
    cd frontend
    npm install
    npm run dev

BACKEND FUNCTIONALITY:
After running the Django server (after entering python manage.py runserver)

The searchbar should display http://127.0.0.1:8000, type */admin* to the end of the url to go to the admin page.
 http://127.0.0.1:8000/admin

 You will be in the login screen of the admin page put in the username/password you inputed in the *python createsuperuser* command. 

 Under *Accounts*/*User profiles* you see a list of all player accounts, thier emails, thier best score, number of games played and user creation date. 

 Under *Games*/*Uic events* you should see all uic events for players to guess. Press 'ADD UIC EVENT' on the top right to create a new event for users. You will need to enter the events name,picture, point values for a correct guess, .jpeg/.png/.gif for the event, and set of correct answers. 

DATASTRUCTURES: 
Our Project implements Trie Data structure and Iterative Depth - Deepening First Search algorithm. Implemented under backend/games/utils/trie.py and backend/games/utils/fuzzy_finder.py respectivly. backend/games/utils/fuzz_finder shows the way we use these structures, we create a trie of all possible answers (inputed by admin so for example: "Movie under the Stars", "movie under the stars") we then search this trie with the players input, if the players input is an exact match player gets full points, else we check preform a try search to see if the input prefix is the same, else the IDDFS algorithm is called (fuzzy_finder.py) and partial points are assigned to the user. 











