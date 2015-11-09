// this file contains UI-specific code that is not part of the actual application



$(function() {
	// allow the user to drag the panel out of the way
	$("#panel").draggable();

  var activePanel = $('#location-panel');

  var enablePanel = function (panel) {
    activePanel.hide();
    activePanel = $(panel);
    activePanel.show();
  };

  var enableTab = function (el) {
    $(".tab.active").removeClass("active");
    $(el).addClass("active");
  };

  $('#location-tab').click(function (e) {
    enableTab(e.target);
    enablePanel('#location-panel');
  });

  $('#places-tab').click(function (e) {
    enableTab(e.target);
    enablePanel('#places-panel');
  });

  $('#bookmarks-tab').click(function (e) {
    enableTab(e.target);
    enablePanel('#bookmarks-panel');
  });
});

