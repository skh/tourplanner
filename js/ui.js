// this file contains UI-specific code that is not part of the actual application

$(function() {
  var activePanel = $('#location-panel');

  var enablePanel = function (panel) {
    activePanel.hide();
    activePanel = $(panel);
    activePanel.show();
  };

  var enableTab = function (el) {
    $("li.active").removeClass("active");
    $(el).parent().addClass("active");
  };

  $('#location-tab').click(function (e) {
    enableTab(e.target);
    enablePanel('#location-panel');
  });

  $('#places-tab').click(function (e) {
    enableTab(e.target);
    enablePanel('#places-panel');
  });
});

