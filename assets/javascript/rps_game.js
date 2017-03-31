/****************************
*
*    INITIALIZE FIREBASE
*
*****************************/
// Initialize Firebase
  var config = {
    apiKey: "AIzaSyC6DHVycinIDWEaTrspT0F3k8m8bnf_lus",
    authDomain: "rps-multiplayer-1781e.firebaseapp.com",
    databaseURL: "https://rps-multiplayer-1781e.firebaseio.com",
    projectId: "rps-multiplayer-1781e",
    storageBucket: "rps-multiplayer-1781e.appspot.com",
    messagingSenderId: "299624045874"
  };
  firebase.initializeApp(config);

/***************************************
*
*       GLOBALS
*
****************************************/

  // the database
  var database = firebase.database();

  // reference to top level of database
  var dbTopRef = database.ref();

  /*---- FLAGS ----*/
  // what player number am I?
  var playerNum = 0;
  // Is turn 1 or turn 2?
  var theTurn = 0;
  // has a game started?
  var isGameStarted = false;
  // is this the beginning of a new round?
  var isFreshRound = false;
  // are there two players logged in?
  var isTwoPlayers = true;
  // is the client a spectator - does not get to interact
  var isSpectator = true;

  // the first player object
  var p1 = {
    "id"     : 1,
    "name"   : "",
    "wins"   : 0,
    "losses" : 0
  };

  // the second player object
  var p2 = {
    "id"     : 2,
    "name"   : "",
    "wins"   : 0,
    "losses" : 0
  };

/*******************************
*
*   FUNCTION DECLARATIONS
*
****************************** */

// initialize the variables to match the game state in the DB
function gameInit() {

}

// retrieve the login name
function getName() {
  event.preventDefault();
  var name = $('#login-box').val().trim();
  $('#login-box').val("");
  console.log("just entered username: "+name);
}

// build the glowing border around active player box
function drawGlowBoxfunc(playerFlag) {
    var glowBox= $('<div>');
    glowBox.addClass('player-box yellow-border cover-box');
    $('#player'+playerFlag).append(glowBox);
}

// build the rock paper scissors choice buttons and put them in an array
function drawRPSfunc(playerFlag) {
    var buttonR= $('<button>');
    var buttonP= $('<button>');
    var buttonS= $('<button>');

    buttonR.addClass('rps-button');
    buttonP.addClass('rps-button');
    buttonS.addClass('rps-button');

    buttonR.text('Rock');
    buttonP.text('Paper');
    buttonS.text('Scissors');

    buttonR.val('Rock');
    buttonP.val('Paper');
    buttonS.val('Scissors');

    $('#player'+playerFlag).append(buttonR);
    $('#player'+playerFlag).append(buttonP);
    $('#player'+playerFlag).append(buttonS);
}


// retrieve the player's choice
function getChoice(event) {
  event.preventDefault();
  var target = $(event.target);
  var choice = target.text();
  console.log("just picked: "+choice);
  return choice;
}

function compareChoicesFunc(p1Choice,p2Choice){
  var choices = ["rock","paper","scissors","rock"];

  if (p1Choice === p2Choice) {
          return 0;
          }
          else if (choices[p1Choice+1] === choices[p2Choice]) {
            return 2;
            /*
            p2.wins++;
            database.ref('players/2/wins/')set(p2.wins); */
            }
            else {
              return 1;
              /*
              p1.wins++;
              database.ref('players/1/wins/')set(p1.wins); */
              }
}

function getChatMessage(){
  event.preventDefault();
  var chat = $('#send-button').val().trim();
  $('#chat-form').val("");
  console.log("just entered chat: "+chat);
}





// drive the main functionality
function RPSengine () {






}



/* TESTING GET LOGIN NAME
$('#start-button').on('click',getName);
*/


/*  TESTING THE GET CHOICE FUNCTIONALITY
var player = 1;

drawRPSfunc(player);

$('#player'+player).on("click",function (event) {
  var playerChoice = getChoice(event);
  console.log(playerChoice);
});
*/


/*    TESTING READING AND WRITING TO THE DB

var thePlayers = {
    players : {
                1 : {
                        name : 'jack',
                        choice : 'rock',
                        wins : 0
                    },
                2 : {
                        name : 'robert',
                        choice : 'scissors',
                        wins : 0
                    }
              },
    turn : 1
};

database.ref().set(thePlayers);



database.ref().on("child_added",function(snapshot){
    console.log(snapshot.val());
    console.log(snapshot.child('1/name').val());
});

*/

