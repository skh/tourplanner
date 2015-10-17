// a place is anything that is returned by Yelp 
// and will be displayed on the map



var Place = function () {};

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

// Main data will be directly kept in the ViewModel object
var ViewModel = function (map) {
	this.map = map
	this.init = function () {
		// if there is localStorage, read data from that
		// if not, set up with hard-coded data
		this.city = ko.observable("Nuremberg");
	};
	this.showCity = function () {
		this.map.showCity(this.city());
	};

	this.init();
}
var map = new Map();
ko.applyBindings (new ViewModel(map));
console.log(sights);