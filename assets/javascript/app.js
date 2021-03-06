//==========================================================================
//========================Global Variables==================================
//==========================================================================
var addPlayerLockout = false;
var userName;
var myPlayerID;
var localTurn;
var startAgainTimeoutID;



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

//==========================================================================
//==========================Initial State===================================
//==========================================================================
$("#js-name-entry-div").show();
$("#js-in-play-div").hide();
$("#js-player1-rps-btns").hide();
$("#js-player2-rps-btns").hide();

//==========================================================================
//=============================Game Play====================================
//==========================================================================

//Add Player Click Event Triggers the Game Start
//when user enters name and clicks start, initialize
$("#start-btn").on("click", function(){
    event.preventDefault()

    //-------------------------------Game Setup-----------------------------------

    //if addPlayerLockout flag is true, return
    if(addPlayerLockout){return;}

    console.log("start button was clicked! Let's get started")
    
    //data validation - if name input is empty, return
    if(!$("#name-input").val()){
        console.log("enter a name")
        return;
    }
    
    //set text input to variable "userName"
    userName = $("#name-input").val()
    console.log("user name entered: " + userName)

    

    //grab a snapshot of the database to check current values
    database.ref().once('value').then(function(snapshot){
        console.log("snapshot: ", snapshot.val());
        console.log("players child exists: ", snapshot.child("players").exists());
        
        //Scenario 1:
        //if no playerss exist, generate a "players" object with a child object named "1" containting relavent player data
        if (snapshot.val() == null || !snapshot.child("players").exists()){
            //inform the user that they are player 1
            console.log("No players yet - you are player 1");
            $("#js-player-indicator").html("Hello " + userName + "! You are Player 1")
            $("#js-player1-title").html(userName)
            //hide the name input form and the start button; show the player indicator and instructions
            $("#js-name-entry-div").hide();
            $("#js-in-play-div").show();
            //pop-up welcome
            $("#pop-up-title").html("Welcome " + userName + "! You are Player 1")
            $("#pop-up-text").html("Let's play some Rock Paper Scissors!")
            $("#pop-up-window").modal("show")
            //save id of player to "myPlayerID" variable (scope: global)
            myPlayerID = 1;
            //set "addPlayerLockout" to false to prevent user from enter another name
            //note: this becomes unnecessary/redundant if the add name form is hidden
            addPlayerLockout = true;
            // generate name, losses, wins, and choice for this player
            database.ref("/players").update({
                1:{
                    name: userName,
                    choice: "empty",
                    wins: 0,
                    losses: 0
                }
            })

        //Scenario 2:
        //if players already exists and there is only 1 (i.e. less than 2), then the user can enter the game as the second player
        }else if(snapshot.child("players").numChildren()<2){
            //console logs for development purposes. Checking number of children and wheather or not player 1 exists
            console.log("number of children in players: ", snapshot.child("players").numChildren())
            console.log("Player 1 exists: ", snapshot.child("players").child("1").exists())
            
            //if player one already exists, make this user player 2
            if(snapshot.child("players").child("1").exists()){
                console.log("Great, you are player 2")
                $("#js-player-indicator").html("Hello " + userName + "! You are Player 2")
                $("#js-player2-title").html(userName)
                //hide the name input form and the start button; show the player indicator and instructions
                $("#js-name-entry-div").hide();
                $("#js-in-play-div").show();
                //pop-up welcome
                $("#pop-up-title").html("Welcome " + userName + "! You are Player 2")
                $("#pop-up-text").html("Let's play some Rock Paper Scissors!")
                $("#pop-up-window").modal("show")
                // generate name, losses, wins, and choice for this player
                myPlayerID = 2;
                addPlayerLockout = true;
                database.ref("/players").update({
                    2:{
                        name: userName,
                        choice: "empty",
                        wins: 0,
                        losses: 0
                    }
                })
            //otherwise, the other user is player 2, so make this user player 1
            }else{
                console.log("Great, you are player 1")
                $("#js-player-indicator").html("Hello " + userName + "! You are Player 1")
                $("#js-player1-title").html(userName)
                //hide the name input form and the start button; show the player indicator and instructions
                $("#js-name-entry-div").hide();
                $("#js-in-play-div").show();
                //pop-up welcome
                $("#pop-up-title").html("Welcome " + userName + "! You are Player 1")
                $("#pop-up-text").html("Let's play some Rock Paper Scissors!")
                $("#pop-up-window").modal("show")
                // generate name, losses, wins, and choice for this player
                myPlayerID = 1;
                addPlayerLockout = true;
                database.ref("/players").update({
                    1:{
                        name: userName,
                        choice: "empty",
                        wins: 0,
                        losses: 0
                    }
                })
            }
            //now that second player has been entered, create a variable called "turn" in firebase and set equal to 1
            //this will also reset the value if a player leaves in the middle of a game and a new player signs in
            database.ref().update({
                turn:1
            })

        //Scenario 3:
        //there are already 2 players. Inform the user they must wait to play
        }else{
            console.log("sorry, we already have 2 players")
            //pop-up window
            $("#pop-up-title").html("Game is Full")
            $("#pop-up-text").html("Sorry,  " + userName + ". There are already 2 players. You may join once someone has left")
            $("#pop-up-window").modal("show")
            
            //return;
        }

        console.log("myPlayerID: ", myPlayerID)

        //--------------------End of Game Setup------------------------------

        //initialize an "onDisconnect" event listener to remove player from data base once they disconnect
        //placing this up here so that th code waits for "myPlayerID" to get a value before setting the onDisconnect event
        var targeRef = "/players/" + myPlayerID;
        // console.log("targetRef: ", targeRef);
        database.ref(targeRef).onDisconnect().remove();
        //also remove messages to clear board
        database.ref("/messages").onDisconnect().remove();
    })

})

//when a value in the data base changes, do the following. entering a new user into the firebase will thus trigger this event.
database.ref().on("value", function(snapshot){
    console.log("value change event listener")
    //if there are no players (at first page initialization or when both players disconnect), don't do anything (return)
    if(snapshot.val() == null || !snapshot.child("players").exists()){
        console.log("value event listener: no players yet")
        return;
    //if there is only one player, tell them we are wiating for the other player
    }else if(snapshot.child("players").numChildren()<2){
        console.log("value event listener: 1 player present")
        //scenario 1: 1 is the only player update
        if(snapshot.child("players").child("1").exists()){
            var player1Name = snapshot.child("players").child("1").child("name").val();
            console.log(player1Name)
            $("#js-player1-title").html(player1Name);
            $("#js-instructions").html("waiting for Player 2")
            $("#js-player2-title").html("No Player 2")
            // $("#js-player2-card-text").html("(waiting for player to join")
        //scenario 2: 2 is the only player update
        }else{
            var player2Name = snapshot.child("players").child("2").child("name").val();
            console.log(player2Name)
            $("#js-player2-title").html(player2Name);
            $("#js-instructions").html("waiting for Player 1")
            $("#js-player1-title").html("No Player 1")
            // $("#js-player1-card-text").html("(waiting for player to join")

        }
    //Otherwise there are two players, continue to the game
    }else{
        console.log("value event listener: 2 players present")
        //determine the turn number
        localTurn = snapshot.child("turn").val();
        console.log("turn #: ", localTurn);
        //determine scores
        var p1wins = snapshot.child("players").child("1").child("wins").val();
        var p1losses = snapshot.child("players").child("1").child("losses").val();
        var p2wins = snapshot.child("players").child("2").child("wins").val();
        var p2losses = snapshot.child("players").child("2").child("losses").val();
        $("#player1-wins").html(p1wins)
        $("#player1-losses").html(p1losses)
        $("#player2-wins").html(p2wins)
        $("#player2-losses").html(p2losses)

        //display names
        var player1Name = snapshot.child("players").child("1").child("name").val();
        var player2Name = snapshot.child("players").child("2").child("name").val();
        $("#js-player1-title").html(player1Name);
        $("#js-player2-title").html(player2Name);

        //if turn = 1, it's player 1's turn to choose
        if(localTurn === 1){
            console.log("myPlayerID:", myPlayerID)
            console.log("value event listener: turn 1")
            //instructions for player 1 browser
            if(myPlayerID === 1){
                $("#js-instructions").html("It's your turn. Make a selection.")
                $("#js-player1-rps-btns").show();
            //instructions for player 2 browser
            }else{
                $("#js-instructions").html("It's Player 1's turn. Waiting for Player 1 to choose.")
                $("#js-player2-rps-btns").hide();
            }
        //if turn = 2, it's player 2's turn to choose
        }else if(localTurn === 2){
            console.log("value event listener: turn 2")
            //instructions for player 1 browser
            if(myPlayerID === 1){
                $("#js-instructions").html("It's Player 2's turn. Waiting for Player 2 to choose.")
                $("#js-player1-rps-btns").hide();
            //instructions for player 2 browser
            }else{
                $("#js-instructions").html("It's your turn. Make a selection.")
                $("#js-player2-rps-btns").show();
            }
        //if turn = 3, then both have chosen. Compare choices and display result. Tally wins and losses accordingly
        }else if(localTurn === 3){
            console.log("value event listener: turn 3")
            $("#js-player1-rps-btns").hide();
            $("#js-player2-rps-btns").hide();
            var p1Choice = snapshot.child("players").child("1").child("choice").val();
            var p2Choice = snapshot.child("players").child("2").child("choice").val();
            console.log("p1: ", p1Choice)
            console.log("p2: ", p2Choice)

            var result;
            //compare choices
            //check if they chose the same
            if(p1Choice == p2Choice){
                result = "Tie"
                console.log("Tie")
            //if player 1 chose rock
            }else if(p1Choice == "rock"){
                if(p2Choice == "scissors"){
                    result = "Player 1 wins"
                    console.log("Player 1 wins")
                    p1wins++;
                    p2losses++;
                }else{
                    result = "Player 2 wins"
                    console.log("Player 2 wins")
                    p2wins++;
                    p1losses++;
                }
            //else if player 1 chose paper
            }else if(p1Choice == "paper"){
                if(p2Choice == "rock"){
                    result = "Player 1 wins"
                    console.log("Player 1 wins")
                    p1wins++;
                    p2losses++;
                }else{
                    result = "Player 2 wins"
                    console.log("Player 2 wins")
                    p2wins++;
                    p1losses++;
                }
            //else player1 chose scissors
            }else{
                if(p2Choice == "paper"){
                    result = "Player 1 wins"
                    console.log("Player 1 wins")
                    p1wins++;
                    p2losses++;
                }else{
                    result = "Player 2 wins"
                    console.log("Player 2 wins")
                    p2wins++;
                    p1losses++;
                }
            }
            $("#js-result-display-title").html(result)
            $("#js-result-display-card-text").html(
                "player 1 chose: " + p1Choice +"<br>"
                + "player2 chose: " + p2Choice + "<br>"
                + "result: " + result
            )
            

            //after 3 seconds start game over
            startAgainTimeoutID = setTimeout(function(){
                //clear results
                $("#js-result-display-title").empty();
                $("#js-result-display-card-text").empty();
                //set turn back to 1
                database.ref().update({
                    turn: 1
                })
                //update wins and losses
                database.ref("/players/1").update({
                    wins: p1wins,
                    losses: p1losses
                })
                database.ref("/players/2").update({
                    wins: p2wins,
                    losses: p2losses
                })

            }, 2000)
            

        

        

        }

    }   
})

//rock paper scissor click events
$(".js-rps").on("click", "button", function(){
    $("#js-player1-rps-btns").hide();
    $("#js-player2-rps-btns").hide();
    var currentTurn;
    console.log("you clicked a rps button");
    var myChoice = $(this).val();
    console.log("you chose ", myChoice);
    var myRef = "players/"+myPlayerID;
    database.ref(myRef).update({
        choice: myChoice
    })
    database.ref().once('value').then(function(snapshot){
        currentTurn = snapshot.child("turn").val();
        console.log(currentTurn);
        currentTurn++;
        console.log(currentTurn);
        database.ref().update({
            turn: currentTurn
        })
    })
    
})


//==========================================================================
//==========================Message Board===================================
//==========================================================================

//message send button click event
$("#message-send-btn").on("click", function(){
    event.preventDefault()
    console.log("message-send button clicked")
    var newMessage = $("#message-input").val();
    $("#message-input").val("");
    
    if(!userName){
        console.log("gotta sign in before sending a message")
        return;
    }
    if(!newMessage){
        console.log("no text entered");
        return;
    }
    database.ref("/messages").push({
        sentBy: userName,
        content: newMessage
    })

})

//update message board when message added
database.ref("/messages").on("child_added", function(snapshot){
    var message = snapshot.child("content").val();
    var sender = snapshot.child("sentBy").val();
    // console.log(sender+": "+message)
    var newMessageContent = "<b>"+sender+": "+"</b>"+message
    var newMessageDiv = $("<div>").html(newMessageContent)
    $("#js-message-board-display").append(newMessageDiv);
})

