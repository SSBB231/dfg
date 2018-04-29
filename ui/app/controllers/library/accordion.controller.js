sap.ui.controller("app.controllers.library.accordion", {
	onInit: function() {
	},

	onAfterRendering: function(html) {
		$(".accordion > h2.folder").click(function(e) {
	        if ($(this).hasClass("current") && $(this).next().queue().length === 0) {
	            $(this).next('.pane').slideUp();
	            $(this).children('div').removeClass('icon-down').removeClass('icon-folder');
	            $(this).children('div').addClass('icon-right').addClass('icon-Closedfolder');
	            $(this).removeClass("current");
	        } else if (!$(this).hasClass("current") && $(this).next().queue().length === 0) {
	            $(this).next('.pane').slideDown();
	            $(this).children('div').removeClass('icon-right').removeClass('icon-Closedfolder');
	            $(this).children('div').addClass('icon-down').addClass('icon-folder');
	            $(this).addClass("current");
	        }
	    });
	}
});