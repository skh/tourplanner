// this file contains UI-specific code that is not part of the actual application



$(function() {
	// allow the user to drag the panel out of the way
	$("#panel").draggable();
	// enable tabbed navigation on panel
	$(document).foundation({
    tab: {
      callback : function (tab) {
        console.log(tab);
      }
    }
  });
});

