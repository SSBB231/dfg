sap.ui.controller("app.controllers.library.tabAN3", {
	onInit: function(){},
	onAfterRendering: function(html) {
		var _self = this;
		_self._view = $(html);
		_self._view.folders = _self._view.find(".layoutsFolders-wrapper");
		_self._view.folderShared = _self._view.find(".layoutsSharedFolders-wrapper");
		_self.renderElements();
	},
	renderElements: function() {
		var _self = this;
		_self.coreServices.renderAccordion("AN3", _self._view);
	}
});
