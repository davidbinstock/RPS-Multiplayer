//==========================================================================
//======================Initializing Firebase===============================
//==========================================================================
var config = {
    apiKey: "AIzaSyCH6USdYFj1LWqS4rFF-883EzhbKrVNOPM",
    authDomain: "multiplayer-rps-ab374.firebaseapp.com",
    databaseURL: "https://multiplayer-rps-ab374.firebaseio.com",
    projectId: "multiplayer-rps-ab374",
    storageBucket: "",
    messagingSenderId: "873209146797"
};
firebase.initializeApp(config);
//==========================================================================

var database = firebase.database();

console.log("we are live!!")
database.ref().set({
    test: "will this work?!"
})
