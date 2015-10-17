// Google Maps object and helper functions
var Map = function () {
	this.zoomLevel = 15;
	this.init = function () {
		this.map = new google.maps.Map(document.getElementById('map'), {
			center: {lat: 49.45314515020171, lng: 11.081171035766602},
			zoom: this.zoomLevel,
			mapTypeControl: false,
			streetViewControl: false,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			styles: [
				{
    			featureType: "transit",
    			stylers: [{ visibility: "off" }]   
  			}, {
  				featureType: "poi",
  				stylers: [{visibility: "off"}]
  			}]
		});

		
		this.geocoder = new google.maps.Geocoder();
		//this.showCity("Nuremberg");
	};

	$.getScript("https://maps.googleapis.com/maps/api/js?key="
		+ config.maps_api_key + "&callback=map.init");

	this.showCity = function (city, zoomLevel) {
		this.geocoder.geocode( { 'address': city}, (function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				this.map.setCenter(results[0].geometry.location);
				/*var marker = new google.maps.Marker({
					map: this.map,
					position: results[0].geometry.location
				});*/
			} else {
				alert('Geocode was not successful for the following reason: ' + status);
			}
		}).bind(this));
	};
};

var Foursquare = function () {
	this.loadPlaces = function (places, query) {
		console.log(config);
		var explore_url = "https://api.foursquare.com/v2/venues/search";
		explore_url += "?client_id=" + config.foursquare_client_id;
		explore_url += "&client_secret=" + config.foursquare_client_secret;
		explore_url += "&v=20151017"
		explore_url += "&ll=49.45314515020171,11.081171035766602";
		explore_url += "&radius=1000";
		explore_url += "&limit=50"
		explore_url += "&query=" + query;

		$.getJSON(explore_url, function (data) {
			var venues = data.response.venues;
			venues.forEach(function (venue) {
				console.log(venue.name);
			});
		});
	};
};

var Place = function () {};

// Main data will be directly kept in the ViewModel object
var ViewModel = function (map) {
	this.map = map;
	this.init = function () {
		this.places = ko.observableArray();
		this.foursquare = new Foursquare();
	};
	this.showCity = function () {
		this.map.showCity(this.city());
	};
	this.loadPlaces = function () {
		this.foursquare.loadPlaces(this.places, "museum")
	};

	this.init();
}
var map = new Map();
ko.applyBindings (new ViewModel(map));