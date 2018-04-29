sap.ui.controller("app.controllers.library.tabSettings", {
	onInit: function(){},
	onAfterRendering: function(html) {
		var _self = this;
		_self._view = $(html);
		_self._view.folders = _self._view.find(".settingFolders-wrapper");
		_self._view.folderShared = _self._view.find(".settingSharedFolders-wrapper");
		_self.renderElements();
	},
	renderElements: function() {
		var _self = this;
		_self.coreServices.renderAccordion("SETTING", _self._view);
	}
});