// Google Maps object and helper functions
var GAPI = function () {
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
		+ config.maps_api_key + "&callback=gapi.init&libraries=places");

	this.showCity = function (city, zoomLevel) {
		this.geocoder.geocode( { 'address': city}, (function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				this.here = results[0].geometry.location;
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
			location: this.here,
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
	
	this.marker = new google.maps.Marker({
		position: new google.maps.LatLng(this.lat, this.lng),
		title: this.name
	});

	this.infowindow = new google.maps.InfoWindow({
    content: ""
  });

	this.markerVisible = false;

	this.toggleMarker = function (gapi) {
		this.markerVisible = !this.markerVisible;
		if (this.markerVisible == true) {
			this.marker.setMap(gapi.map);
		} else {
			this.marker.setMap(null);
		}		
	};
	this.toggleAnimateMarker = function () {
		if (this.marker.getAnimation() != null) {
			this.marker.setAnimation(null);
		} else {
			this.marker.setAnimation(google.maps.Animation.BOUNCE);
		}
	};

	this.getDetails = function (gapi) {
		console.log("x");
		var request = {
				placeId: this.placeId
		};
		gapi.service.getDetails(request, (function (result, status) {
			if (status == google.maps.places.PlacesServiceStatus.OK) {
				this.website = result.website;
				this.picture_url = result.photos[0];
				this.infowindow.setContent(this._getContentString());
			}
		}).bind(this));
	};

	this.showInfoWindow = function (gapi) {
		this.infowindow.open(gapi.map, this.marker);
	};

	this._getContentString = function () {
		var content = "<a href=\"" + this.website + "\">"+ this.name + "</a>";
		return content;
	};
};


// Main data will be directly kept in the ViewModel object
var ViewModel = function (gapi, city) {
	
	this.init = function (gapi, city) {
		this.gapi = gapi;
		this.places = ko.observableArray();
		this.city = ko.observable(city)
	};

	this.showCity = function () {
		this.toggleAllMarkers();
		this.places.removeAll();
		this.gapi.showCity(this.city());
	};

	this.loadBookstores = function () {
		this.toggleAllMarkers();
		this.places.removeAll();
		this.gapi.nearbySearch(this.places, "bookstore");
	};

	this.loadCoffeeshops = function () {
		this.toggleAllMarkers();
		this.places.removeAll();
		this.gapi.nearbySearch(this.places, "coffee");
	};

	this.toggleAllMarkers = function () {
		this.places().forEach(function (place) {
			place.toggleMarker();
		});
	};

	this.onClickHandler = (function (item) {
		item.toggleAnimateMarker();
		item.getDetails(this.gapi);
		item.showInfoWindow(this.gapi);
	}).bind(this);

	this.init(gapi, city);
}
var gapi = new GAPI();
var initialCity = "Nuremberg, Germany";
var viewModel = new ViewModel(gapi, initialCity);
ko.applyBindings (viewModel);