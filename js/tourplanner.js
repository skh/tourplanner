// a place is anything that is returned by Yelp 
// and will be displayed on the map
var Place = function () {};

var Map = function () {
	this.init = function () {
		this.map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 8
  });
	}
};

// Main data will be directly kept in the ViewModel object
var ViewModel = function () {
	this.init = function () {
		// if there is localStorage, read data from that
		// if not, set up with hard-coded data
		this.city = ko.observable("Nuremberg");
		this.map = new Map();
		$.getScript("https://maps.googleapis.com/maps/api/js?key="
		+ config.maps_api_key + "&callback=vm.map.init", (function () {
			console.log(this);
		}).bind(this));

	};

	this.init();
}

var vm = new ViewModel();
ko.applyBindings (vm);
