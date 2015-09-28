// a place is anything that is returned by Yelp 
// and will be displayed on the map
var Place = function () {};

// Main data will be directly kept in the ViewModel object
var ViewModel = function () {
	this.init = function () {
		// if there is localStorage, read data from that
		// if not, set up with hard-coded data
		this.city = ko.observable("Nuremberg");
	};

	this.init();
}

ko.applyBindings (new ViewModel());