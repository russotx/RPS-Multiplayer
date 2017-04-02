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
  var ref = database.ref();
  var resetthedb = {
    turn : 3,
    allClients : {
        p1Name : "Waiting for Player 1",
        p2Name : "Waiting for Player 2",
        score1 : 0,
        losses1 : 0,
        score2 : 0,
        losses2 : 0,
        p1Pick : "",
        p2Pick : "",
       // winner : "",
        gameFeed : "",
        rpsButton : "",
        chat : "",
        chatButton : "",
        loginWindow : "",
        loginButton : "",
        turn : 3
    }

  }

 ref.set(resetthedb);
