// Panel handling
var closePanel = function () {
	var $togglebutton = $('#toggle');
	var $map = $('#map');
	var $panel = $('#panel');
	$map.css({right: 0});
	$panel.css({right: -284});
	google.maps.event.trigger(map, 'resize');
	$togglebutton.find('span')
		.removeClass('glyphicon-triangle-right')
		.addClass('glyphicon-triangle-left');
	$togglebutton
		.removeClass('open')
		.addClass('closed')
		.unbind('click', closePanel)
		.bind('click', openPanel);
};
var openPanel = function () {
	var $togglebutton = $('#toggle');
	var $map = $('#map');
	var $panel = $('#panel');
	$map.css({right: 284});
	$panel.css({right: 0});
	google.maps.event.trigger(map, 'resize');
	$togglebutton.find('span')
		.removeClass('glyphicon-triangle-left')
		.addClass('glyphicon-triangle-right');
	$togglebutton
		.removeClass('closed')
		.addClass('open')
		.unbind('click', openPanel)
		.bind('click', closePanel);
};
var closePanelIfSmallScreen = function() {
	if ($(window).width() < 400) {
		closePanel();
	}
};
$(document).ready(function () {
	var $togglebutton = $('#toggle');
	$togglebutton.click(closePanel);	
});

// Google Maps object and helper functions
var GAPI = function (location, zoomLevel) {
	this.zoomLevel = zoomLevel;
	this.location = location;
	this.types = [
		{"name": "Cafe", "type": "cafe"},
		{"name": "ATM", "type": "atm"},
		{"name": "Museum", "type": "museum"},
		{"name": "Library", "type": "library"},
		{"name": "Book store", "type": "book_store"},
		{"name": "Restaurant", "type": "restaurant"},
		{"name": "Movie theater", "type": "movie_theater"},
		{"name": "Hotel", "type": "hotel"},
		{"name": "Park", "type": "park"}
	];

	this.init = function () {
		this.map = new google.maps.Map(document.getElementById('map'), {
			zoom: this.zoomLevel,
			mapTypeControl: false,
			streetViewControl: false,
			zoomControl: true,
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
		this.showLocation(this.location);
	};

	$.getScript("https://maps.googleapis.com/maps/api/js?key=" + config.maps_api_key + "&callback=gapi.init&libraries=places");

	this.showLocation = function (location) {
		this.geocoder.geocode( { 'address': location}, (function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				this.here = results[0].geometry.location;
				this.bounds = results[0].geometry.bounds;
				this.map.setCenter(this.here);
				/*var marker = new google.maps.Marker({
					map: this.map,
					position: results[0].geometry.location
				});*/
			} else {
				alert('Geocode was not successful for the following reason: ' + status);
			}
		}).bind(this));
	};

	this.nearbySearch = function (places, query, cb) {
		var request = {
			bounds: this.map.getBounds(),
			radius: '1000',
			keyword: query
		};
		this.service.nearbySearch(request, (function (data) {
			data.forEach((function (item) {
				var place = new Place(item.name, 
					item.geometry.location.lat(),
					item.geometry.location.lng(),
					item.place_id);
				places.push(place);
			}).bind(this));
			cb();
		}).bind(this));
	};

	this.setCenter = function (lat, lng) {
  		this.map.setCenter({lat: lat, lng: lng});
  	};

};

var Place = function (name, lat, lng, placeId) {
	this.name = name;
	this.lat = lat;
	this.lng = lng;
	this.placeId = placeId;
	this.website = "";
	this.picture_url = "/img/placeholder.jpg";
	this.status = "unknown";
	this.foursquareHereNow = "unknown";
	this.foursquareCheckinsCount = "unknown";

	this.getClickHandler = function () {
		var place = this;
		return function (e) {
			viewModel.selectPlace(place);
		};
	};
	
	this.marker = new google.maps.Marker({
		position: new google.maps.LatLng(this.lat, this.lng),
		title: this.name
	});
	this.markerVisible = false;
	this.marker.addListener('click', this.getClickHandler());

	this.infowindow = new google.maps.InfoWindow({
    	content: ""
  	});

  	this.infowindow.addListener('closeclick', this.getClickHandler());

	this.hideMarker = function (gapi) {
		this.marker.setMap(null);
	};

	this.showMarker = function (gapi) {
		this.marker.setMap(gapi.map);
	};

	this.startMarkerAnimation = function () {
		this.marker.setAnimation(google.maps.Animation.BOUNCE);
	};

	this.stopMarkerAnimation = function () {
		this.marker.setAnimation(null);
	};

	this.generateDetails = function (gapi) {
		this._getPlacesDetails(gapi);
		this._getFoursquareDetails(this.lat, this.lng, this.name);
	};

	this.showInfoWindow = function (gapi) {
		this.infowindow.setContent(this._getContentString());
		this.infowindow.open(gapi.map, this.marker);
	};

	this.hideInfoWindow = function () {
		this.infowindow.close();
	};

	this._getPlacesDetails = function (gapi) {
		var request = {
			placeId: this.placeId
		};
		gapi.service.getDetails(request, (function (result, status) {
			if (status == google.maps.places.PlacesServiceStatus.OK) {
				this.website = result.website || "";
				if (result.photos) {
					this.picture_url = result.photos[0].getUrl({'maxWidth': 132, 'maxHeight': 96});
					this.status = result.opening_hours.open_now ? "Open" : "Closed";
				}
			}
		}).bind(this));
	};

	this._getFoursquareDetails = function (lat, lng, query) {			
		var explore_url = "https://api.foursquare.com/v2/venues/search";		
		explore_url += "?client_id=" + config.foursquare_client_id;		
		explore_url += "&client_secret=" + config.foursquare_client_secret;		
		explore_url += "&v=20151017";
		explore_url += "&ll=" + lat + "," + lng;		
		explore_url += "&radius=50";		
		explore_url += "&limit=1";
		explore_url += "&query=" + query;		
		
		$.getJSON(explore_url, (function (data) {		
			var venues = data.response.venues;		
			venues.forEach(function (venue) {	
				this.foursquareHereNow = venue.hereNow.count;
				this.foursquareCheckinsCount = venue.stats.checkinsCount;	
			}, this);		
		}).bind(this));		
	};	

	this._getContentString = function () {
		var content = "<h4>" + this.name + "</h4>";
		content += "<img class=\"thumbnail\" src=" + this.picture_url + ">";
		content += "<p>";
		if (this.website.length > 0) {
			content += "<a target=\"_blank\" href=\"" + this.website + "\">Website</a> | "; 
		}
		content += "Status: " + this.status + "</p>";
		content += "<p>Here now: " + this.foursquareHereNow;
		content += " | Total checkins: " + this.foursquareCheckinsCount + "</p>";
		return content;
	};

};


// Main data will be directly kept in the ViewModel object
var ViewModel = function (gapi) {
	
	this.init = function (gapi) {
		// Google Maps API object.
		this.gapi = gapi;

		// The location is the area in which to search
		// The user can change this in the UI
		this.location = ko.observable(gapi.location);

		// Google Places API types
		// Available in the UI in a dropdown menu
		this.types = ko.observableArray(gapi.types);
		this.selectedType = ko.observable();

		// Google Places API places
		// The result of the search for a specific type of place
		this.places = ko.observableArray();
		this.selectedPlace = ko.observable(undefined);

		// Plain string to filter the search result from the Places API
		this.filter = ko.observable("");

		// The result of applying the filter to the result list
		this.filteredPlaces = ko.computed(function () {
			var filter = this.filter().toLowerCase();
			if (this.filter().length === 0) {
				return this.places();
			} else {
				return ko.utils.arrayFilter(this.places(), function (place) {
					return place.name.toLowerCase().indexOf(filter) != -1;
				});
			}
		}, this);
	};

	this.showLocation = function () {
		this.hideAllMarkers();
		this.places.removeAll();
		this.gapi.showLocation(this.location());
	};

	this.selectPlace = (function (place) {
		if (this.selectedPlace()) {
			this.selectedPlace().stopMarkerAnimation();
			this.selectedPlace().hideInfoWindow();
		}

		if (place != this.selectedPlace()) {
			place.startMarkerAnimation();
			place.showInfoWindow(this.gapi);
			closePanelIfSmallScreen();
			this.selectedPlace(place);
		} else {
			// second click on the same place unselects it.
			this.selectedPlace(undefined);
		}

	}).bind(this);

	this.hideAllMarkers = function () {
		this.places().forEach(function (place) {
			place.hideMarker();
		});
	};

	this.loadPlaces = function () {
		this.hideAllMarkers();
		this.places.removeAll();
		this.gapi.nearbySearch(this.places, this.selectedType(), (function () {
			this.filteredPlaces().forEach(function (place) {
				place.showMarker(this.gapi);
				place.generateDetails(this.gapi);
			}, this);
		}).bind(this));
	};

	this.clearPlaces = function () {
		this.hideAllMarkers();
		this.places.removeAll();
	};

	this.init(gapi);
};

var initialLocation = "Mountain View";
var initialZoomLevel = 15;
var gapi = new GAPI(initialLocation, initialZoomLevel);
var viewModel = new ViewModel(gapi);
ko.applyBindings (viewModel);

