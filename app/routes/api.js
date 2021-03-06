var User = require("../models/user");
const request = require('request');
var qs = require('querystring');
var Itinerary = require("../models/itinerary");
var mongoose = require("mongoose");
var spawn = require("child_process").spawn;
var app = require("express");
var jwt = require('jsonwebtoken'); // Import JWT Package
var router = app.Router();
var secret = 'itingen'; // Create custom secret to use with JWT



router.post('/getitinerary', function(req, res) {
	var userSettings = req.body.settings;
	console.log(userSettings);
	var startTime = userSettings.startTime;
	var startLocation = userSettings.startLocation;
	console.log(startLocation);
	var lat = startLocation.lat;
	var lon = startLocation.lng;
	var free = userSettings.free;
	var radius = userSettings.radius;
	var transport = userSettings.transport;
	//res.json({success: true, itinerary: oneItin});
	var query = qs.stringify({ startTime, lat, lon, free, radius, transport});
	console.log(query);
	request('http://localhost:5000/?' + query, function(err, res2, body) {  
		if(err) res.json({success:false});
		else {
			if(res2.statusCode == 200)
				res.json({success: true, itinerary: body});
			else
				res.json({success: false});
		}
	});
});


// Middleware for Routes that checks for token - Place all routes after this route that require the user to already be logged in
router.use(function(req, res, next) {
	var token = req.body.token || req.body.query || req.headers['x-access-token']; // Check for token in body, URL, or headers

	// Check if token is valid and not expired  
	if (token) {
		// Function to verify token
		jwt.verify(token, secret, function(err, decoded) {
			if (err) {
				res.json({ success: false, message: 'Token invalid' }); // Token has expired or is invalid
			} else {
				req.decoded = decoded;
				console.log("IN DECODED");
				console.log(decoded);
				next(); // Required to leave middleware
			}
		});
	} else {
		res.json({ success: false, message: 'No token provided' }); // Return error if no token was provided in the request
	}
});

// Route to get the currently logged in user    
router.post('/me', function(req, res) {
	res.json({success : true, user: req.decoded}); // Return the token acquired from middleware
});

// Route to get users liked itineraries
router.get('/getliked', function(req, res) {
	console.log("GOT HERE");
	User.findOne({ email: req.decoded.email}).exec(function(err, user) {
		if (err) {
			res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });	
		} else {
			console.log("in get liked");
			if (!user) {
				console.log("IN HEREz");
				res.json({ success: false, message: 'No user was found' }); // Return error
			} else {
				if(user){
					console.log("Found user");
					res.json({ success: true, message: 'found itineraries', itineraries: user.liked});
				} else {
					console.log("IN HEREz");
					res.json({success: false, message: 'No itineraries were found'});	
				}
			}	
		}
	});
});

// Route to append to a users like itineraries
router.post('/putliked', (req, res) => {
	var itins = req.body.likedItineraries;
	var userEmail = req.decoded.email;
	var itinsStr = '';
	console.log("IN PUTLIKED");
	if(itins.length > 0){
		itinsStr = JSON.stringify(itins);
		console.log(itinsStr);
		User.findOneAndUpdate({email : userEmail}, {email : userEmail, liked : itinsStr}, function(err) {
			if (err) { 
				console.log(err)
				res.json({success : false});
				return; 
			}
			res.json({success : true});
		});
	}
	else {
		res.json({success : false});
	}
	// let user = new User();
	// user.liked = itins;
	// user.userEmail = userEmail;
	// delete user._id;

});

module.exports = router;