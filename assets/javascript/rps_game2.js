
  /**************************
            GLOBALS
  ***************************/

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

  // the database
  var database = firebase.database();
  // reference to top level of database
  var dbTopRef = database.ref();
  // reference to allClients
  var dbAllClients = database.ref('/allClients/');


  /*---- FLAGS ----*/

  // Is turn 1 or turn 2?
  var theTurn = 1;
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
  // the name client entered
  // var clientPlayerName = "";

  // testing for initial auto read of db on page load
  var initialRead = true;
  var promptClientChoice = "It's Your Turn!";
  var gameFeed = "";

 var theView = {
      p1Name : "Waiting for Player 1",
      p2Name : "Waiting for Player 2",
      score1 : 0,
      losses1 : 0,
      score2 : 0,
      losses2 : 0,
      p1Pick : "",
      p2Pick : "",
      //winner : "",
      gameFeed : "",
      rpsButton : "",
      chat : "",
      chatButton : "",
      loginWindow : "",
      loginButton : "",
      turn : 3
    }

      /****************************************
        ASYNC HANDLING THE DB
        ---------------------

        click events change the database
        nothing here updates the DOM or theView,
        theView and DOM are updated by the database

        * turn=3 means there aren't 2 players
          which means login is possible
        * turn=1 means it's player 1 turn
        * turn=2 means it's player 2 turn

      *****************************************/

      // PARENT FUNCTION LISTENS FOR CLICKS AND
      // TRIGGERS CHANGES TO THE DB ACCORDINGLY
      function asyncUpdateDB() {

        //------------------ RPS BUTTON ----------------------
        // set a click event for RPS buttons when they exist
        // if client isn't playing, there are no buttons
        // if it's not client's turn, there are no buttons
        // when client clicks an RPS BUTTON, these things happen
        $('#rps-action').on('click','.rps-button',function(event){
            //event.preventDefault();
            console.log('client just clicked an RPS button');
            var choice = getChoice(event);
            var fanoutObject1 = {};
            fanoutObject1['/allClients/p'+clientPlayerNum+'Pick/'] = choice;
            fanoutObject1['/players/'+clientPlayerNum+'/choice/'] = choice;
            var nextTurn = getNextPlayerTurn();
            database.ref().update(fanoutObject1);
            // DON'T DO THIS IF IT'S THE 2ND PLAYERS TURN- COMPARECHOICES
            // IS SUPPOSED TO UPDATE THE TURN
            // update the turn in the database because player just made pick
            if (nextTurn != 1) {
              var fanoutObject2 = {};
              fanoutObject2['/allClients/turn/'] = nextTurn;
              database.ref().update(fanoutObject2);
            }
        });

        //------------------- START BUTTON ----------------------
        // click event listener attached to login container
        // clicking this button means the player just joined the game
        // when client clicks a START BUTTON, these things happen
        $('#login-container').on('click','#start-button',function(event){
          event.preventDefault();
          var clientPlayerName = getName(event);
          console.log("client just entered "+clientPlayerName+" as their name");
          assignPlayerNum(clientPlayerName);
        });

        // --------------- CHAT BUTTON -------------------
        // click event listener for the chat box
        // when client clicks a CHAT BUTTON, these things happen
        $('#chat-form-container').on('click','#send-button',function(){
          event.preventDefault();
          var newChat = getChatMessage();
          var name = theView['p'+clientPlayerNum+'Name'];
          database.ref('/allClients/').update({ chat : name+': '+newChat });
        });

      } //---- end of asyncUpdateDB()


      //--------------- DB HELPER FUNCTIONS -----------------

      function assignPlayerNum(name) {
        var newTurn = 3;
        // initialize fan out with update to turn at root because new player joined
        var fanoutObject3 = { turn : newTurn };
        console.log('just passed : '+name+' : to assignPlayerNum');
        database.ref().once('value')
          .then(function(snapshot) {
            var theDB = snapshot.val();
            // if theDB/players/ exists then there's at least 1 existing player
            if (theDB.players != undefined){
              switch (undefined) {
                // player 1 doesn't exist
                case (theDB.players[1]) :
                  // client takes the player 1 spot
                  clientPlayerNum = 1;
                  // now have player 1 and player 2, it's player 1's turn
                  newTurn = 1;
                  break;
                // player 2 doesn't exist
                case (theDB.players[2]) :
                  // client takes the player 2 spot
                  clientPlayerNum = 2;
                  // now have player 1 and player 2, it's player 1's turn
                  newTurn = 1;
                  break;
                  // neither players[1] or players[2] showed undefined
                  default : console.log("there was a problem with assignPlayerNum, the DB /players/ has a p1 and p1");
              }
            }
              // theDB/players/ does not exist (ie, there are no existing players)
              else{
                // client is the only player logged in and takes the player 1 spot
                clientPlayerNum = 1;
                // not enough players to start the game
                newTurn = 3;
                // clear chat because nobody is playing
                fanoutObject3['/allClients/chat/'] = "";
              }
              console.log("CLIENT IS PLAYER NUMBER "+clientPlayerNum);
            // onDisconnect should always be assigned before any writes to the DB
            dropPlayerOnDisconnect(theDB);
            // update the client's entered name in the DB
            fanoutObject3['/allClients/p'+clientPlayerNum+'Name/'] = name;
            fanoutObject3['/players/'+clientPlayerNum+'/name/'] = name;
            // update the turn in allClients/ because new player joined
            fanoutObject3['/allClients/turn/'] = newTurn;
            database.ref().update(fanoutObject3);
          });

      }

      function dropPlayerOnDisconnect() {
        console.log('watching for disconnect to drop player');
        console.log('/players/'+clientPlayerNum+'/');
        var presenceRef = database.ref('/players/'+clientPlayerNum+'/');
        var fanoutObject = {};
        fanoutObject['/allClients/p'+clientPlayerNum+'Name/'] = "Waiting for Player "+clientPlayerNum;
        fanoutObject['/allClients/p'+clientPlayerNum+'Pick/'] = "";
        fanoutObject['/allClients/score'+clientPlayerNum+'/'] = 0;
        fanoutObject['/allClients/losses'+clientPlayerNum+'/'] = 0;
        fanoutObject['/allClients/chat/'] = "";
        fanoutObject['/allClients/turn/'] = 3;
        fanoutObject['/turn/'] = 3;
        presenceRef.onDisconnect().remove();
        database.ref().onDisconnect().update(fanoutObject);
      }



      function getOtherPlayerNum(){
        if (clientPlayerNum === 1) {
          return 2;
        } else {
            return 1;
          }
      }

      // retrieve the player's choice
      function getChoice(event) {
        console.log('getting the player choice');
        var target = $(event.target);
        var choice = target.text();
        console.log("just picked: "+choice);
        return choice;
      }

      function getNextPlayerTurn(){
        switch (theView.turn) {
          case (1) :
            return 2;
            break;
          case (2) :
            return 1;
            break
          default :
            return 3;
        }
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
            return false;
          }
      }

      function getChatMessage(){
        console.log('getting a chat message');
        var chat = $('#chat-form').val().trim();
        $('#chat-form').val("");
        console.log("just entered chat: "+chat);
        return chat;
      }

      /*********************************************
        ASYNC HANDLING THE DOM
        ----------------------

          * database changes change the DOM
          * database changes change theView
          * theView does not change the database

          * turn=3 means there aren't 2 players which means login is possible
          * turn=1 means it's player 1 turn
          * turn=2 means it's player 2 turn
          * player= 1 | 2 | 0:spectator

      *********************************************/

      // PARENT FUNCTION TRIGGERS WATCHING THE DB FOR VALUE CHANGE
      // TO INITIATE A DOM CHANGE AS NEEDED
      // FIRST DB CHECK RUNS ON INITIAL PAGE LOAD
      // WHEN DB CHANGES, THESE THINGS HAPPEN
      function asyncUpdateView() {
        // Get a snapshot when the DB changes and update the client side data
        // and the DOM as needed
        database.ref().on('value',function(theDB){
          theStorage = theDB.val();
          for (var key in theStorage.allClients) {
            compare(key,theStorage.allClients[key]);
          }

        }); //----- end DOM update
      }


      // playerNum is the client's status in the game
      // player 1, player 2, or player 0:spectator
      function updateDOM(key,value,playerNum=0) {
        switch(key) {
          // DOM updates for all clients
          case ("p1Name") :
            //update p1name
            $('#player1-instruct').html(value);
            // remove the login boxes if the client is a player
            // if name just updated, client could have been the
            // one that entered a name
            if (playerNum != 0) {
              $('#login-container').find('#login-box').remove();
              $('#login-container').find('#start-button').remove();
            }
           break;
          case ("p2Name") :
            //update p2name
            $('#player2-instruct').html(value);
            // remove the login boxes if the client is a player
            // if name just updated, client could have been the
            // one that entered a name
            if (playerNum != 0) {
              $('#login-container').find('#login-box').remove();
              $('#login-container').find('#start-button').remove();
            }
           break;
         /* case ("winner") :
            //update winner message
            $('#results').html(value);
            break; */
          case ("chat") :
            //add chat message
            $('#chat-window').append('<p>'+value+'</p>');
            break;
          case ("score1") :
            //update p1 score
            $('#player1-score').text('Wins: '+value+' ');
            break;
          case ("score2") :
            //update p2 score
            $('#player2-score').text('Wins: '+value+' ');
            break;
          case ("losses1") :
            //update p1 score
            $('#player1-losses').html('Losses: '+value);
            break;
          case ("losses2") :
            //update p2 score
            $('#player2-losses').html('Losses: '+value);
            break;
          case ("p2Pick") :
            // remove the boxes
            removeRPS(2);
            //show player 2 pick
            $('#player2-pick').html(value);
            // don't want to compare choices if it's blank
            if (value != "") {
              compareChoicesFunc();
            }
            break;
          // DOM updates requiring special treatment
          // --------------------------------------------
          // playerNum is the client's status in the game
          // player 1, player 2, or player 0/spectator
          case ("p1Pick") :
            setPickDisplay(key,value,playerNum);
            break;
          case ("gameFeed") :
            setGameFeed(key,value,playerNum);
            break;
          case ("turn") :
            // turn values are 1 2 or 3(not enough players)
            newTurnDOMops(key,value,playerNum);
            break;
          default : console.log("invalid updateDOM key:"+key);
        }
      }

      function compareChoicesFunc(){
        database.ref().once('value')
          .then(function(snapshot){
            var theDB = snapshot.val();
            var name1 = theDB.allClients.p1Name;
            var name2 = theDB.allClients.p2Name;
            var p1score = theDB.allClients.score1;
            var p1loss = theDB.allClients.losses1;
            console.log("score1 is... ");
            console.log(theDB.allClients.score1);
            var p2score = theDB.allClients.score2;
            var p2loss = theDB.allClients.losses2;
            console.log("score2 is... ");
            console.log(theDB.allClients.score2);
            var p1Choice = theDB.allClients.p1Pick;
            var p2Choice = theDB.allClients.p2Pick;
            console.log("p1 choice is: "+p1Choice);
            console.log("p2 choice is: "+p2Choice);
            console.log('comparing player choices');

            var choices = ["Rock","Paper","Scissors","Rock"];
            var p1choiceIndex = choices.indexOf(p1Choice);
            var p2choiceIndex = choices.indexOf(p2Choice);

            if (p1Choice === p2Choice) {
              $('#results').html("<h1>Tie Game!</h1>");
            }
              else if (choices[p1choiceIndex+1] === p2Choice) {
                $('#results').html("<h1>"+name2+" Wins!</h1>");
                p2score++;
                p1loss++;
                var fanoutObject1 = {};
                fanoutObject1['/allClients/score2/'] = p2score;
                fanoutObject1['/allClients/losses1/'] = p1loss;
                fanoutObject1['/players/2/wins/'] = p2score;
                fanoutObject1['/players/1/losses/'] = p1loss;
                // clear the players picks so you can reevaluate in next round
                fanoutObject1['/players/2/choice/'] = "";
                fanoutObject1['/allClients/p2Pick/'] = "";
                database.ref().update(fanoutObject1);
                // do I need to update theView.allClients.score2 here?
              }
              else {
                $('#results').html("<h1>"+name1+" Wins!</h1>");
                p1score++;
                p2loss++;
                var fanoutObject1 = {};
                fanoutObject1['/allClients/score1/'] = p1score;
                fanoutObject1['/allClients/losses2/'] = p2loss;
                fanoutObject1['/players/1/wins/'] = p1score;
                fanoutObject1['/players/2/losses/'] = p2loss;
                // clear the players picks so you can reevaluate in next round
                fanoutObject1['/players/2/choice/'] = "";
                fanoutObject1['/allClients/p2Pick/'] = "";
                database.ref().update(fanoutObject1);
                // do I need to update theView.allClients.score1 here?
              }
              setTimeout(function(){
                           var fanoutObject2 = { turn : 1 };
                           fanoutObject2['/allClients/turn/'] = 1;
                           console.log("updating the DB turn after compare");
                           database.ref().update(fanoutObject2);
                         }
                         , 6000);
          });
      }

      function newTurnDOMops(key,turnNum,playerNum) {
        console.log("the turn has changed in the DB");
        switch (turnNum) {
          // turn is 3 when two players haven't joined or someone drops
          case (3) :
            // remove any RPS buttons, remove any glow boxes,
            // kill the game feed and erase the chat
            removeRPS(1);
            removeRPS(2);
            removeGlowBox();
            $('#results').html("");
            $('#game-feed').html("");
            //$('#chat-form-container').html("");
            //$('#chat-form-container').find('#chat-form').remove();
            //$('#chat-form-container').find('#send-button').remove();
            console.log('newTurnDOMops case 3');
            drawStartButton();
          break;
          case(1) :
            if (clientPlayerNum === 0) {
              $('#login-container').find('#login-box').remove();
              $('#login-container').find('#start-button').remove();
            }
            // clear the results box
            $('#results').html("");
            // new round, clear the players picks
            $('#player1-pick').html("");
            $('#player2-pick').html("");
            // remove the glow box if it exists
            removeGlowBox();
            // draw a glow box around the player whose turn it is
            drawGlowBoxfunc(turnNum);
            // draw the RPS buttons in the client's box
            // if the client is a player and its client's turn
            setRPSbuttonsDisplay(playerNum);
          // turn is 2
          default :
            // if the turn isn't 3 the game has enough players to start
            // if client isn't playing need to remove the login elements
            if (clientPlayerNum === 0) {
              $('#login-container').find('#login-box').remove();
              $('#login-container').find('#start-button').remove();
            }
            // clear the results box
            $('#results').html("");
            // remove the glow box if it exists
            removeGlowBox();
            // draw a glow box around the player whose turn it is
            drawGlowBoxfunc(turnNum);
            // draw the RPS buttons in the client's box
            // if the client is a player and its client's turn
            setRPSbuttonsDisplay(playerNum);
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
        $('#login-container').html(newBox);
        $('#login-container').append(newStart);
        loginPrepped = true;
      }

      // build the glowing border around active player box
      function drawGlowBoxfunc(playerFlag) {
          console.log('drawing glow box');
          var glowBox= $('<div>');
          glowBox.attr('id','glow-box');
          glowBox.addClass('player-box yellow-border under-box');
          $('#player'+playerFlag).append(glowBox);
      }

      function removeGlowBox(playerFlag=6) {
        if (playerFlag != 6) {
          $('#player'+playerFlag).find('#glow-box').remove();
        } else {
          $('#player1').find('#glow-box').remove();
          $('#player2').find('#glow-box').remove();
        }
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

      function removeRPS(playerFlag) {
        $('#player'+playerFlag).find('.rps-button').remove();
      }

      // displays game instruction for players
      // displays nothing for spectators
      function setGameFeed(key,value,playerNum) {
        switch(playerNum) {
          // client is playing and it's client's turn
          case (theView.turn) :
            $('#player'+playerNum+'-instruct').html("It's Your Turn!");
            break;
          // client isn't playing, nothing is displayed
          case (0) :
            $('#player1-instruct').html("");
            break;
          default :
          // client is playing but it's not client's turn
            $('#player'+playerNum+'-instruct').html("Waiting for other player");
        }
      }

      function setRPSbuttonsDisplay(clientPlayerNum) {
        switch (clientPlayerNum) {
          // if it's the client's turn then draw the buttons
          // for the player whose turn it is
          case (theView.turn) :
            // clear the buttons if they exist in case
            // db is updated multiple times before player can
            // pick. Cannot clear the html in drawRPSfunc when placing first
            // button bcz buttons overlap additional html that must remain
            removeRPS(clientPlayerNum);
            drawRPSfunc(clientPlayerNum);
            break;
          default :
          // if it's not the client's turn, the client isn't logged in,
          // or there aren't 2 players, remove the buttons
          // if buttons don't exist then nothing happens
          // goes to the player box at playerNum if it exists and finds
          // the buttons then removes them if they exist
          // if client isn't playing then playerNum is 0 and nothing happens
            removeRPS(clientPlayerNum);
        }
      }

      function setPickDisplay(key,value,playerNum) {
        // if playerNum is 1 or 0(for spectator), show the pick
        switch(playerNum) {
          case (0) :
            $('#player1-pick').html(value);
          break;
          case (1) :
            $('#player1-pick').html(value);
          break;
          case (2) :
            $('#player1-pick').html("");
          break;
          default :
            console.log("invalid setPickDisplay playerNum: "+playerNum);
        }
      }

      // clientPlayerNum = 1 | 2 | 0-spectator
      function compare(key,value) {
        if (theView[key] != value) {
          theView[key] = value;
          updateDOM(key,value,clientPlayerNum);
        }
      }

/****************************************
*****************************************
*
*           GAME ENGINE
*           -----------
*
*          runs the primary
*          game functions
*
*----------------------------------------
* ***************************************/

  function rpsGameEngine() {
    asyncUpdateView();
    asyncUpdateDB();

  }

/*----- START THE GAME ---------*/
  rpsGameEngine();




