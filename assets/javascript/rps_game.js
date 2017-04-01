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

  // Is turn 1 or turn 2?
  var theTurn = 0;
  // has a game started?
  var isGameStarted = false;
  // is this the beginning of a new round?
  var isFreshRound = false;
  // are there two players logged in?
  var isTwoPlayers = false;
  // is the client a spectator - does not get to interact
  var isSpectator = true;
  // are the login buttons drawn?
  var loginPrepped = false;
  // is there a player1
  var isaPlayer1 = false;
  // is there a player 2
  var isaPlayer2 = false;
  // are there no players logged in
  var noPlayers = false;
  // is the client playing in the game?
  var clientIsPlayer = false;
  // which player is the client
  var clientPlayerNum = 0;
  // which player is the opponent
  var otherPlayerNum = 0;

  // testing for initial auto read of db on page load
  var initialRead = true;

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

function dropPlayerOnDisconnect() {
  console.log('watching for disconnect to drop player');
  console.log('/players/'+clientPlayerNum+'/');
  var presenceRef = database.ref('/players/'+clientPlayerNum+'/');
  presenceRef.onDisconnect().remove();
}

function listenForConnection() {
  console.log('listening for client connection to db');
  var connectedRef = database.ref('/.info/connected');
  connectedRef.on('value', function(snap) {
    if (snap.val() === true) {
      console.log('client connected to db');
    } else {
        console.log('client not connected to db');
    }
  });
}

// check for existing players and initialize them on client
function initExistingPlayers(snap) {
    console.log("initializing existing players");
    // if player 1 exists - assign its properties to the client side
    // p1 object
    if (snap != null) {

    //if ( snap.child('players/1').exists() ) {
      if (snap[1] != null) {
        console.log('player 1 exists');
        p1.name = snap[1].name;
        p1.wins = snap[1].wins;
        p1.losses = snap[1].losses;
        noPlayers = false;
      //  p1.choice = snap[1].choice;
        /*
        p1.name = snap.child('players/1/name').val();
        p1.wins = snap.child('players/1/wins').val();
        p1.losses = snap.child('players/1/losses').val();
        p1.choice = snap.child('players/1/choice').val();*/
        console.log("p1 is now -->");
        console.log(p1);
        isaPlayer1 = true;
    } else {
        isaPlayer1 = false;
      }

    // if player 2 exists - assign its properties to the client side p2 object
    //if ( snap.child('players/2').exists() ) {
      if (snap[2] !=null) {
        console.log("player 2 exists");
        p2.name = snap[2].name;
        p2.wins = snap[2].wins;
        p2.losses = snap[2].losses;
        noPlayers = false;
      //  p2.choice = snap[2].choice;
        /*
        p2.name = snap.child('players/2/name').val();
        p2.wins = snap.child('players/2/wins').val();
        p2.losses = snap.child('players/2/losses').val();
        p2.choice = snap.child('players/2/choice').val();*/
        console.log("p2 is now --> ");
        console.log(p2);
        isaPlayer2 = true;
    } else {
        isaPlayer2 = false;
      }
    // what turn is it
    /*if ( snap.child('turn/').exists() ) {
        theTurn = snap.child('turn/').val();
        console.log('the turn on init -->');
        console.log(snap.child('turn/').val())
    }*/
  }

       // set flags to control game play and login
      setGameFlags();
}

// set flags to control game play and login
function setGameFlags() {
  console.log("setting game flags");
  // the game has 2 players and is full
  if ((isaPlayer1) && (isaPlayer2)) {
    console.log("the game is full, removing start button and login box");
    //isSpectator = true;
    isTwoPlayers = true;
    //clientPlayerNum = 0;
    //clientIsPlayer = false;
    isGameStarted = true;
    // get rid of the buttons so client can't login
    $('#login-container').find('#login-box').remove();
    $('#login-container').find('#start-button').remove();
    loginPrepped = false;
  } else if (isaPlayer1) {
      console.log("player 1 is taken, player 2 is open");
      isTwoPlayers = false;
      //isaPlayer2 = false;
      isGameStarted = false;
    } else if (isaPlayer2) {
        console.log("player 2 is taken, player 1 is open");
        isTwoPlayers = false;
        isGameStarted = false;
      } else {
          console.log("there are no players in the game");
          noPlayers = true;
          isTwoPlayers = false;
         // isaPlayer1 = false;
          isGameStarted = false;
        } // end check if game has zero players


  // check if there's an open spot
      if ((isTwoPlayers === false) && (clientIsPlayer === false)) {
        // give the client option to log in
        clientOkToJoin();
      }
}

// draw the start button and login box
function drawStartButton() {
  console.log('drawing the start button');
  var newBox = $('<input>');
  newBox.attr('id','login-box');
  var newStart = $('<input>');
  newStart.attr('type','submit');
  newStart.attr('id','start-button');
  $('#login-container').append(newBox);
  $('#login-container').append(newStart);
  loginPrepped = true;
}

// assign the client to a player and initialize
function initClientPlayer(clientName){
  console.log('assigning client to a player');
  isSpectator = false;
  clientIsPlayer = true;
  console.log('inside initCLientPlayer, test isaPlayers.. p1= '+isaPlayer1+' ... p2= '+isaPlayer2);
  // testing to see if fanout can stop multiple value events from messing
  // shit up
  /*var updatedTurn = {turn : 1};
  var fanoutObject = {};*/
  // --- continued in conditional statement ----

  // assign client to a player
  // zero players or player 2 is already taken
  if ((noPlayers) || (isaPlayer2)) {
    // assign the name from the login box to a player
    p1.name = clientName;
    p1.wins = 0;
    p1.losses = 0;
    // flag the client player number
    clientPlayerNum = 1;
    console.log('locally assigned client to player '+clientPlayerNum);
    /*fanoutObject['/players/1/'] = p1;
    fanoutObject['/turn/'] = updatedTurn;
    database.ref().update(fanoutObject);*/
    console.log('about to fire db update at players for client login');
    database.ref('/players/1/').update(p1);
    console.log('client assigned to player 1');
  } else  // only remaining option is client be player 2
    {
      p2.name = clientName;
      p2.wins = 0;
      p2.losses = 0;
      // flag the client player number
      clientPlayerNum = 2;
      /*fanoutObject['/players/2/'] = p2;
      fanoutObject['/'] = updatedTurn;
      database.ref().update(fanoutObject);*/
      database.ref('/players/2/').update(p2);
      console.log('client assigned to player 2');
    }

  // update client player score
  updateScoresDisplay(clientPlayerNum,0,0);
  // remove the login box and start button
  console.log('removing the start button and login box');
  $('#login-container').find('#login-box').remove();
  $('#login-container').find('#start-button').remove();
  loginPrepped = false;
  console.log('establishing ondisconnect kill player');
  dropPlayerOnDisconnect();
  // ********** this db update might be messing things up
  //database.ref().update({turn : 1});
}

// find out if there's an open spot and create login box for client
// to join the game
function clientOkToJoin() {
    console.log("giving client opportunity to log in");
    // create the start button
    if (loginPrepped === false){
      drawStartButton();
    }

    // start event listener for start button
    $('#login-container').off().on('click','#start-button',function(event){
      event.preventDefault();
    //  event.stopPropagation();
      console.log('start button was clicked');
      // get the name from the box
      var clientName = getName(event);
      // make sure user entered a name
      if (clientName != "") {
        $('#login-container').off('click','#start-button');
        $('#login-box').css({"background-color":"white"});
        // assign the client to a player
        initClientPlayer(clientName);
      } else {
          console.log("entered a blank name");
          $('#login-box').css({"background-color":"#FD7B94"});
          $('#login-box').val("must enter a name");
      }
      $('#login-box').val("");

    }); // end of start button listener
}

// retrieve the login name
function getName(event) {
  console.log('retrieving login name');
  if ($('#login-box').val() != undefined) {
    var name = $('#login-box').val().trim();
    // empty the login box
    console.log("just entered username: "+name);
    return name;
  } else {
      return "";
  }

}

// build the glowing border around active player box
function drawGlowBoxfunc(playerFlag) {
    console.log('drawing glow box');
    var glowBox= $('<div>');
    glowBox.addClass('player-box yellow-border cover-box');
    $('#player'+playerFlag).append(glowBox);
}

// update the scoreboard for a player
// pass in the player number, player wins, and player losses
function updateScoresDisplay(whichPlayer,wins,losses) {
  console.log('updating player '+whichPlayer+' score.');
  $('#player'+whichPlayer+'-score').html('wins: '+wins+' losses: '+losses);
}

// build the rock paper scissors choice buttons and put them in an array
function drawRPSfunc(playerFlag) {
    console.log('drawing the RPS buttons for player'+playerFlag);
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
  console.log('getting the player choice');
  event.preventDefault();
  var target = $(event.target);
  var choice = target.text();
  console.log("just picked: "+choice);
  return choice;
}

function compareChoicesFunc(p1Choice,p2Choice){
  console.log('comparing player choices');
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
  console.log('getting a chat message');
  event.preventDefault();
  var chat = $('#send-button').val().trim();
  $('#chat-form').val("");
  console.log("just entered chat: "+chat);
}

// initialize the variables to match the game state in the DB
function gameInit() {
  console.log("gameInit started");
  var playersref = database.ref('players/');
  //listenForConnection();
  var ref = database.ref();
  // check DB one time
  /*ref.once('value')
    .then(function(snapshot){ */
    playersref.on('value',function(snapshot){
      /* console.log("initial checking db one time"); */
      if (initialRead) {
        console.log("auto loading the db snapshot for first read");
      } else{
          console.log('a db value has changed at players/');
        }
        initialRead = false;
      /*playersref.on('value')
        .then(function(snap){*/
          console.log("grabbed snapshot of the db");
          // initialize local copies of exiting players in the DB
          // flag isaPlayer variables for existing players
          var changedPlayersData = snapshot.val();
          console.log(changedPlayersData);
          initExistingPlayers(changedPlayersData);
        //});


    });

}
//----- end of game init

// drive the main functionality
function RPSengine () {
  console.log("running RPSengine");
  // initializes variables, checks for existing players,
  // draws login box & start button if needed
  gameInit();

  // start value listeners
/*
  database.ref().on("value",function(snapshot){
    // remove start button and box if has child 1 and 2
    // reset isSpectator flag
    //
  });
*/

}


RPSengine();



/* TESTING .once()

var thePlayers = {
    players : {

                2 : {
                        name : 'joseph',
                        choice : 'scissors',
                        wins : 0
                    }
              },
    turn : 1
};

var replace = { name:'herald' };

// TEST UPDATE

database.ref('/players/2/').update(replace);

var ref = database.ref();
ref.once('value')
  .then(function(snapshot){
    if (snapshot.child('players/1').exists()) {
    console.log(snapshot.val());
    console.log(snapshot.child('players/1/name').val());
  } else
    { console.log("not here"); }
  });
*/


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

