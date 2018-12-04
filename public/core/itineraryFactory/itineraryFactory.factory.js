
angular.module('itineraryFactory')

.factory('itineraryFactory', ['$http', function($http) {
	//TODO: if logged in, make GET request to get users liked itineraries
	// Test itinerary for development 

	var likedItineraries = []
	var currentItinerary = []
	var defaultLocation = {lat: 41.881855, lon: -87.627115};
	var settings = 
	{
	startTime: new Date(Date.now()),
	startLocation: defaultLocation,
	free: true,
	radius: 10,
	transport: 'DRIVING'
	};
	var service = {}


	//on load or dislike an itinerary: 
	service.getNewItinerary = function() {
		console.log(settings);
		return $http.post('/api/getitinerary', {settings});
	}



	service.saveSettings = function(userSettings) {
		settings = userSettings;
		if(settings['startLocation'] == undefined || settings['startLocation'] == '') {
			settings['startLocation'] = defaultLocation;
		}
		console.log('new settings');
		console.log(settings);
	}

	service.setTransport = function(transport) {
		setts.transport = transport;
	}


	service.getCurrentItinerary = function() {
		return currentItinerary
	}


	service.getSettings = function() {
		return settings;
	}

	service.setCurrentItinerary = function(current) {
		currentItinerary = current;
	}

	service.setLikedItineraries = function(likedItins) {
		likedItineraries = likedItins;
	}

	service.getLikedItineraries = function () {
		return $http.get('/api/getliked');
	}

	service.addToLikedItineraries = function () {
		console.log("got to add to liked itinfactory here");
		if(currentItinerary.length > 0){
			likedItineraries.push(currentItinerary);
			console.log("Adding itinerary...")
			console.log(currentItinerary);
			$http.post('/api/putliked', {likedItineraries}).then((data) => {
				console.log("Adding itineraries is a " + data.data.success);
			});
		} else {
			console.log("current itinerary is empty");
		}
	}


	return service
}])
