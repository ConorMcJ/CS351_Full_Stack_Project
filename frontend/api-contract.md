# StudentLife-Guessr — API Contract

**Base URL:** `${VITE_API_BASE_URL}/api/v1`  
**Headers:** `Content-Type: application/json`  
**Auth:** Email + password (session cookie or mock)  

**Error shape:**  
```json
{ "ok": false, "error": { "code": "BAD_REQUEST", "message": "Reason here" } }  
```
## 1) Login - POST /auth/login  

Request:  
```json
{ "email": "student@uic.edu", "password": "password123"}  
```
Response 200:  
```json
{ "ok": true, "user": { "id": "u_123", "username": "troy" } }  
```
Error 401:  
```json
{ "ok": false, "error": {"code": "UNAUTHORIZED", "message": "Invalid credentials" } } 
```
## 2) Logout - POST /auth/logout  

Response 200:  
```json
{ "ok": true }  
```  

## 3) Leaderboard - GET /leaderboard?range=week|all&limit10  

Response 200:  
```json
{
    "ok": true,
    "items": [  
        { "rank": 1, "username": "alice", "score": 120 },  
        { "rank": 2, "username": "bob", "score": 95 }  
    ]  
}  
```
## 4) Fetch Round - GET /round  

Response 200:  
```json
{
    "ok": true,
    "id": "r_001",
    "imageUrl": "/images/event1.jpg",
    "hint": "Annual cultural event festival hosted at the Quad.",
    "guessesAllowed": 3
}  
```  

## 5) Submit Guess - POST /guess  

Request:
```json
{ "id": "r_001", "guess": "UIC Cultural Fair" }  
```  
Response (round continues):  
```json
{ "ok": true, "correct": false, "remaining": 2, "scoreDelta": 0 }  
```  
Response (round ends):  
```json
{
    "ok": true,  
    "correct": true,  
    "remaining": 1,  
    "scoreDelta": 100,  
    "final": true,  
    "finalScore": 320  
}  
```  

# Status Codes  

##Code -> Meaning  
200 -> Success  
400 -> Bad request  
401 -> Unauthenticated  
404 -> Not found  
500 -> Server error  

# Frontend Flow  

** 1. Login** -> POST /auth/login -> navigate to /menu  
** 2. Main Menu** -> GET /leaderboard for range=week and range=all  
** 3. Game Screen** -> GET /round then POST /guess to submit answers  
** 4. Game Over** -> Show finalScore, allow "New Game" or "Return to Menu"  



