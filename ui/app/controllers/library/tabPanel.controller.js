sap.ui.controller("app.controllers.library.tabPanel", {
	onInit: function(){},
	onAfterRendering: function(html) {
		var _self = this;
		_self._view = $(html);
		_self._view.folders = _self._view.find(".panelFolders-wrapper");
		_self._view.folderShared = _self._view.find(".panelSharedFolders-wrapper");
		_self.renderElements();
	},
	renderElements: function() {
		var _self = this;
		_self.coreServices.renderAccordion("PANEL", _self._view);
	}
});

