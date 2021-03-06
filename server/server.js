const express = require('express')
const app = express();
// const jsonParser = bodyParser.json();
const path = require('path');
const mongoose = require('mongoose');
const User = require('./model/usermodel');
const Event = require('./model/eventmodel');
const Testdata = require('./model/database');
const http = require('http').Server(app);
var io = require('socket.io')(http);
const fs = require('fs');
const bodyparser = require('body-parser');
const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
const passport = require('passport');
const UserController = require('./controllers/UserController');
const AuthenticationController = require('./controllers/AuthenticationController');
const GuestController = require('./controllers/GuestController');
const EventController = require('./controllers/EventController');
const HistoryController = require('./controllers/HistoryController');
const QueueController = require('./controllers/QueueController')
const creds = require('../app.config');
const session = require('express-session');
const cookieParser = require('cookie-parser')
mongoose.connect('mongodb://localhost/yockette', () => {
	console.log("mongoose connected");
});
// const oauth = require('./google-passport');

app.use( express.static(path.join(__dirname, 'dist')));
app.use( session({ path: '*', secret: 'YukeBox', httpOnly: true, secure: false, maxAge: null }));
app.use( cookieParser() );
app.use(bodyparser.json());
// CORS headers
app.use((req,res,next) =>{
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
	next();
});

passport.use(new GoogleStrategy({
    clientID:     creds.GOOGLE_CLIENT_ID,
    clientSecret: creds.GOOGLE_CLIENT_SECRET,
    callbackURL: creds.CALLBACK_URL,
    passReqToCallback   : true
  },
  function(req, accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
			const query = {google_id: profile.id};
			const update = {google_id: profile.id, username: profile.name.givenName};
			const options = {new: true, upsert: true};
			console.log('hi');
      User.findOneAndUpdate(query, update, options).then(user => {
				console.log('Got it!');
				done(null, user);
			}).catch (err => {
				console.log('Error in adding User: ', err);
				done(err);
			});
			// if (err) {
      //     console.log(err);
      //     done();
      //   }
      //   if (!user) {
      //     user = new User({
      //       google_id: profile.id,
      //       username: profile.name.givenName,
      //       favlist: []
      //   })
      //     user.save();
      //   }
      //   if (user) {
      //     return done(null, user);
      //   }
      });
  }
));

app.use( passport.initialize());
app.use( passport.session());

passport.serializeUser(function(user, done) {
  console.log('Serializing');
  done(null, {
    google_id: user.google_id,
    username: user.username
  });
});

passport.deserializeUser(function(user, done) {
  console.log('Deserializing');
  User.findOne({google_id: user.google_id}, function(err, user) {
    done(err, user);
  });
});

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', (
    	passport.authenticate( 'google', {
    		successRedirect: '/',
    		failureRedirect: '/login'
})));

// Future Login and Logout Logic

app.get('/', AuthenticationController.isAuthenticated, (req, res, next) => {
  res.status(200).sendFile(path.join(__dirname, '../dist/index.html'));
})

app.get('/bundle.js', (req, res, next) => {
  res.status(200).sendFile(path.join(__dirname, '../dist/bundle.js'));
})

app.post('/create-event', EventController.addToList)

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/login');
});


// Easter egg for API server <3 YOCKET LIST
app.get('/login', (req, res) => {
  res.status(200).sendFile(path.join(__dirname, '../dist/login.html'));
});

app.post('/queue/:id', (req, res) => {
  QueueController.add(req.params.id, req.body.link);
  // io.emit('newdata', {songs: req.body, history: HistoryController.list, guests: GuestController.list});
});

app.post('/queue', (req, res) => {
  // Testdata.queue.push(req.body);
  io.emit('newdata', {songs: req.body, history: HistoryController.list, guests: GuestController.list});

});


app.post('/joinevent', EventController.joinEvent, GuestController.addToList)


/* Socket and Server Setup */
io.on('connect', (socket) => {
  socket.on('newsong', (roomID) => QueueController.nextSong(roomID));
  console.log(`User connected ${socket.id}`);
  socket.emit('connectestablished', socket.id);
})

http.listen(3000, () => {
  console.log("Server started on port 3000");
});

/** Socket Event Spec
 * This is a list of socket events and their triggers
 * Emit ['newdata']: notifies subscribers to query for new data
 *  - when any user saves an item to the database
 *  - when a player window deletes an item from the database
 */

module.exports = app;
