//==========================================================================
//========================Global Variables==================================
//==========================================================================
var addPlayerLockout = false;
var myPlayerID;



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

// testing that js file and firebase are set up properly
console.log("we are live!!")

//when user enters name and clicks start, initialize

$("#start-btn").on("click", function(){
    event.preventDefault()

    //if addPlayerLockout flag is true, don't continue with the function
    if(addPlayerLockout){return;}

    console.log("start clicked! Let's get started")
    if(!$("#name-input").val()){
        console.log("enter a name")
        return;
    }
    userName = $("#name-input").val()
    console.log("user name is: " + userName)
    //if no playerss exist, generate new player called player one
    database.ref().once('value').then(function(snapshot){
        console.log("snapshot", snapshot.val());
        console.log("players child exists: ", snapshot.child("players").exists());
        

        if (snapshot.val() == null || !snapshot.child("players").exists()){
            console.log("no players yet - you are player 1")
            // generate name, losses, wins, and choice for this player
            database.ref("/players").update({
                1:{
                    name: userName,
                    choice: "empty",
                    wins: 0,
                    losses: 0
                }
            })
            myPlayerID = 1;
            addPlayerLockout = true;
            //save id of player 1 to this browsers local storage/session storage
        }else if(snapshot.child("players").numChildren()<2){
            console.log("number of children in players", snapshot.child("players").numChildren())
            console.log("1 exists: ", snapshot.child("players").child("1").exists())
            
            if(snapshot.child("players").child("1").exists()){
                console.log("great, you are player 2")
                database.ref("/players").update({
                    2:{
                        name: userName,
                        choice: "empty",
                        wins: 0,
                        losses: 0
                    }
                })
                myPlayerID = 2;
                addPlayerLockout = true;
            }else{
                console.log("great, you are player 1")
                database.ref("/players").update({
                    1:{
                        name: userName,
                        choice: "empty",
                        wins: 0,
                        losses: 0
                    }
                })
                myPlayerID = 1;
                addPlayerLockout = true;
            }
        }else{
            console.log("sorry, we already have 2 players")
            //return;
        }
        console.log("myPlayerID: ", myPlayerID)

        if(myPlayerID === 1){
            console.log("yellow")
        }
        
        if(myPlayerID === 2){
            console.log("blue")
        }

        //placing this up here so that th code waits for "myPlayerID" to get a value before settin ghte onDisconnect event
        var targeRef = "/players/" + myPlayerID;
        console.log("targetRef: ", targeRef);
        database.ref(targeRef).onDisconnect().remove();

        //if one player exists, generat new player called palyer two
        // generate name, losses, wins, and choice for this player
        //save id to local/session storage
        //if there are already two users, do not allow any more people to connect 
    })

    
        
})

// var playerRef = database.ref("/players/"+ myPlayerID);
// console.log("down here")
// console.log(playerRef);




