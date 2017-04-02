 // Initialize Firebase
  var config = {
    apiKey: "AIzaSyB7MRp3-HF_g-yEQ8eScC86V6F_PL-GAp4",
    authDomain: "promises-268a0.firebaseapp.com",
    databaseURL: "https://promises-268a0.firebaseio.com",
    projectId: "promises-268a0",
    storageBucket: "promises-268a0.appspot.com",
    messagingSenderId: "65250725229"
  };
  firebase.initializeApp(config);

database = firebase.database();

var fanoutObject = {};

fanoutObject['/test/prop3/'] = 'pasta';
fanoutObject['/trash/doc2/'] = 'paper';

//database.ref().update(fanoutObject);

database.ref('/test/').update({prop3:'popcorn'});

/*
var theView = {
      p1Name : "Waiting for Player 1",
      p2Name : "Waiting for Player 2",
      score1 : 0,
      losses1 : 0,
      score2 : 0,
      losses2 : 0,
      p1Pick : "",
      p2Pick : "",
      winner : "",
      gameFeed : "",
      rpsButton : "",
      chat : "",
      chatButton : "",
      loginWindow : "",
      loginButton : "",
      turn : 3
    } */
