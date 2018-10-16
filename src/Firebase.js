import firebase from 'firebase';

var config = {
  apiKey: 'AIzaSyD4TW2J4-t2zSVE3qbZGoCHKgzp6zugP0k',
  authDomain: 'screen-time-74f3e.firebaseapp.com',
  databaseURL: 'https://screen-time-74f3e.firebaseio.com',
  projectId: 'screen-time-74f3e',
  storageBucket: 'screen-time-74f3e.appspot.com',
  messagingSenderId: '122041990449',
};

firebase.initializeApp(config);
export default firebase;
