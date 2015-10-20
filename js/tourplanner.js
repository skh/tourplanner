// Google Maps object and helper functions
var GMap = function () {
	this.zoomLevel = 15;
	this.init = function () {
		this.here = new google.maps.LatLng(49.45314515020171,11.081171035766602);
		this.map = new google.maps.Map(document.getElementById('map'), {
			center: this.here,
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
		this.service = new google.maps.places.PlacesService(this.map);
		this.geocoder = new google.maps.Geocoder();
	};

	$.getScript("https://maps.googleapis.com/maps/api/js?key="
		+ config.maps_api_key + "&callback=gmap.init&libraries=places");

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

	this.nearbySearch = function (places, query) {
		var request = {
			location: this.here,
			radius: '200',
			query: query
		};
		this.service.textSearch(request, (function (data) {
			data.forEach((function (item) {
				var place = new Place(item.name, 
					item.geometry.location.lat(),
					item.geometry.location.lng());
				places.push(place);
				place.toggleMarker(this);
			}).bind(this));
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

var Place = function (name, lat, lng) {
	this.name = name;
	this.lat = lat;
	this.lng = lng;
	this.marker = new google.maps.Marker({
			position: new google.maps.LatLng(this.lat, this.lng),
			title: this.name
		});
	this.markerVisible = false;

	this.toggleMarker = function (gmap) {
		this.markerVisible = !this.markerVisible;
		if (this.markerVisible == true) {
			this.marker.setMap(gmap.map);
		} else {
			this.marker.setMap(null);
		}
		
	};
};

// Main data will be directly kept in the ViewModel object
var ViewModel = function (gmap) {
	this.gmap = gmap;
	this.init = function () {
		this.places = ko.observableArray();
		this.foursquare = new Foursquare();
	};
	this.showCity = function () {
		this.map.showCity(this.city());
	};
	this.loadBookstores = function () {
		this.places.removeAll();
		this.gmap.nearbySearch(this.places, "bookstore");
		this.showAllMarkers();
	};
	this.loadCoffeeshops = function () {
		this.places.removeAll();
		this.gmap.nearbySearch(this.places, "coffee");
	};
	this.showAllMarkers = function () {
		ko.utils.arrayForEach(this.places(), function (item) {
			console.log(item.name);
		});
	};
	this.toggleMarker = (function (item) {
		item.toggleMarker(this.gmap);
	}).bind(this);

	this.init();
}
var gmap = new GMap();
ko.applyBindings (new ViewModel(gmap));