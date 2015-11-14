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
		{"name": "Park", "type": "park"},
		{"name": "Taxis", "type": "taxi_stand"}
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

	$.getScript("https://maps.googleapis.com/maps/api/js?key="
		+ config.maps_api_key + "&callback=gapi.init&libraries=places");

	this.setZoom = function (zoom) {
		this.map.setZoom(zoom);
	};

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

	this.nearbySearch = function (places, query) {
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
				place.toggleMarker(this);
			}).bind(this));
		}).bind(this));
	};

};

var Place = function (name, lat, lng, placeId) {
	this.name = name;
	this.lat = lat;
	this.lng = lng;
	this.placeId = placeId;
	this.website = "";

	this.getClickHandler = function () {
		// closure! yeehaa!
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

	this.toggleMarker = function (gapi) {
		this.markerVisible = !this.markerVisible;
		if (this.markerVisible == true) {
			this.marker.setMap(gapi.map);
		} else {
			this.marker.setMap(null);
		}		
	};
	this.startMarkerAnimation = function () {
		this.marker.setAnimation(google.maps.Animation.BOUNCE);
	};

	this.stopMarkerAnimation = function () {
		this.marker.setAnimation(null);
	};

	this.generateDetails = function (gapi) {
		var request = {
				placeId: this.placeId
		};
		gapi.service.getDetails(request, (function (result, status) {
			if (status == google.maps.places.PlacesServiceStatus.OK) {
				this.website = result.website;
				if (result.photos) {
					this.picture_url = result.photos[0];
				}
				this.infowindow.setContent(this._getContentString());
			}
		}).bind(this));
		this.getFoursquareDetails();
	};

	this.getFoursquareDetails = function () {

	};

	this.showInfoWindow = function (gapi) {
		this.infowindow.open(gapi.map, this.marker);
	};

	this.hideInfoWindow = function () {
		this.infowindow.close();
	};

	this._getContentString = function () {
		var content = "<a href=\"" + this.website + "\">"+ this.name + "</a>";
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
		// A list of previous locations is kept for convenience
		this.location = ko.observable(gapi.location);
		this.previousLocation = this.location();
		this.recentLocations = ko.observableArray();
		this.recentLocations.push(this.location());

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
		this.filteredPlaces = ko.computed(function () {
			var filter = this.filter().toLowerCase();
			if (!filter || this.filter().length == 0) {
				return this.places();
			} else {
				return ko.utils.arrayFilter(this.places(), function (place) {
					return place.name.toLowerCase().indexOf(filter) != -1;
				});
			}
		}, this);
	};

	this.showLocation = function () {
		this.toggleAllMarkers();
		this.places.removeAll();
		this.gapi.showLocation(this.location());
		this.gapi.setZoom(this.initialZoomLevel);
		this.zoomLevel(this.initialZoomLevel);
		if (this.recentLocations().indexOf(this.location()) == -1) {
			this.recentLocations.push(this.location());
		}
	};

	this.clearLocations = function () {
		console.log(this);
	};

	this.selectLocation = (function (data) {
		this.location(data);
		this.showLocation();
	}).bind(this);

	this.selectPlace = (function (place) {
		if (this.selectedPlace()) {
			this.selectedPlace().stopMarkerAnimation();
			this.selectedPlace().hideInfoWindow();
		}

		if (place != this.selectedPlace()) {
			place.startMarkerAnimation();
			place.generateDetails(this.gapi);
			place.showInfoWindow(this.gapi);
			this.selectedPlace(place);
		} else {
			// second click on the same place unselects it.
			this.selectedPlace(undefined);
		}

	}).bind(this);

	this.toggleAllMarkers = function () {
		this.places().forEach(function (place) {
			place.toggleMarker();
		});
	};

	this.loadPlaces = function () {
		this.toggleAllMarkers();
		this.places.removeAll();
		this.gapi.nearbySearch(this.places, this.selectedType());
	};

	this.clearPlaces = function () {
		this.toggleAllMarkers();
		this.places.removeAll();
	};

	this.init(gapi);
}

var initialLocation = "Nuremberg, Germany";
var initialZoomLevel = 15;
var gapi = new GAPI(initialLocation, initialZoomLevel);
var viewModel = new ViewModel(gapi);
ko.applyBindings (viewModel);