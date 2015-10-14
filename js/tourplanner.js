// a place is anything that is returned by Yelp 
// and will be displayed on the map
var Place = function () {};

var Map = function () {
	this.init = function () {
		this.geocoder = new google.maps.Geocoder();
		this.map = new google.maps.Map(document.getElementById('map'), {
			center: {lat: -34.397, lng: 150.644},
			zoom: 8
		});
		this.geocoder.geocode( { 'address': 'Nuernberg'}, (function(results, status) {
			console.log (this);
			if (status == google.maps.GeocoderStatus.OK) {
				this.map.setCenter(results[0].geometry.location);
				var marker = new google.maps.Marker({
					map: this.map,
					position: results[0].geometry.location
				});
			} else {
				alert('Geocode was not successful for the following reason: ' + status);
			}
		}).bind(this));
	};
	$.getScript("https://maps.googleapis.com/maps/api/js?key="
		+ config.maps_api_key + "&callback=map.init");
};

// Main data will be directly kept in the ViewModel object
var ViewModel = function (map) {
	this.map = map
	this.init = function () {
		// if there is localStorage, read data from that
		// if not, set up with hard-coded data
		this.city = ko.observable("Nuremberg");
	};

	this.init();
}
var map = new Map();
ko.applyBindings (new ViewModel(map));
