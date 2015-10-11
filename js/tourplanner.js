// a place is anything that is returned by Yelp 
// and will be displayed on the map
var Place = function () {};

var Map = function () {
	this.init = function () {
		this.map = new google.maps.Map(document.getElementById('map'), {
			center: {lat: -34.397, lng: 150.644},
			zoom: 8
		});
	};
	$.getScript("https://maps.googleapis.com/maps/api/js?key="
		+ config.maps_api_key, (function () {
			console.log(this);
			this.init();
		}).bind(this));
};

// Main data will be directly kept in the ViewModel object
var ViewModel = function () {
	this.init = function () {
		// if there is localStorage, read data from that
		// if not, set up with hard-coded data
		this.city = ko.observable("Nuremberg");
		this.map = new Map();


	};

	this.init();
}

ko.applyBindings (new ViewModel());
