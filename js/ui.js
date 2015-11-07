// this file contains UI-specific code that is not part of the actual application



$(function() {
	// allow the user to drag the panel out of the way
	$("#panel").draggable();

  var activePanel = $('#city-panel');

  var enablePanel = function (panel) {
    activePanel.hide();
    activePanel = $(panel);
    activePanel.show();
  };

  var enableTab = function (el) {
    $(".tab.active").removeClass("active");
    $(el).addClass("active");
  };

  $('#city-tab').click(function (e) {
    enableTab(e.target);
    enablePanel('#city-panel');
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

