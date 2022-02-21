# Wordle VS
[![Deploy to Firebase](https://github.com/scottblechman/wordle-vs/actions/workflows/firebase-hosting-merge.yml/badge.svg)](https://github.com/scottblechman/wordle-vs/actions/workflows/firebase-hosting-merge.yml)

Based on the original [Wordle](https://www.nytimes.com/games/wordle/index.html), Wordle VS lets you create your own Wordle games to challenge your friends. You can play Wordle VS right now at [wordle-vs.web.app](https://wordle-vs.web.app/), or host your own instance on Firebase using the steps in this document.

## Features
- Create Wordle challenges with any 5-letter word
- Send challenges to friends, and solve challenges sent to you
- One-click account creation (with a Google account)

## Self-Hosting
Use the following steps to deploy your own instance of Wordle VS to Firebase. WSL2 is highly recommended if running on Windows.

- Create a new [Firebase](https://firebase.google.com/) project and add a web app.
- Run the following commands in your preferred directory:
```
git clone https://github.com/scottblechman/wordle-vs
cd wordle-vs
npm install
```
- Delete `.firebaserc`, `.github`, and `firebase.json`; setting up hosting will generate new files.
- Replace the Firebase options inside `initializeApp` in `src/App.tsx` with the values for your own Firebase project.
- If using WSL2, use these commands to run locally, otherwise only the last command is needed. The app will run on localhost:3000.
```
netsh interface portproxy add v4tov4 listenport=3000 listenaddress=0.0.0.0 connectport=3000 connectaddress=<WSL IP>
npm run start
```
- Follow steps in the Firebase docs to set up Hosting and deploy the project.

## License
Wordle VS is licensed under the [MIT License](https://raw.githubusercontent.com/scottblechman/wordle-vs/main/LICENSE). The original Wordle was created by Josh Wardle and is published by The New York Times Company.
