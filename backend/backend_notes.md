# Backend Dev Notes
Conor McJannett, Sammy Ammra

## Data Structures:
**Group 1:** Priority Queue
- Stores user scores
- Easy ordered recall for frontend

**Group 2:** Cuckoo Hashing
- Hash images with string keys
- Keys correspond to images' correct answers


## Tasks to be split:
- [ ] Setup Django backend skeleton
- [ ] Argon2id setup
- [ ] Gathering photos/event names (just a few for early app demo)
    - Gather photographer names if possible to give credit in-app
- [x] Set up Render for project deployment
https://render.com/docs/deploy-django
We will keep our project code on GitHub and connect the repository to Render. Any time we push updates to the `main` branch, Render will automatically rebuild and redeploy the app. This makes updates simple and keeps the deployment consistent with the latest version of our code.
- [ ] Setting up Allauth
We plan on allowing users to create accounts on our website in order to streamline user registrations, and authentication we plan on using Django Allauth, a free and opensource API that manages account registrations, email verifications, forgotton password recovery, and sign ups through third-party social media, such as signing up with an google account. This will manage our email verifications for account creation on our website.    
- [ ] Initialize PostgreSQL Database
