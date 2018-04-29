sap.ui.controller("app.controllers.library.tabExecuted", {
    onInit: function(){},
    onAfterRendering: function(html) {
        var _self = this;
        _self._view = $(html);
        _self._view.folders = _self._view.find(".an4Folders-wrapper");
        _self._view.folderShared = _self._view.find(".an4SharedFolders-wrapper");
        _self.renderElements();
    },
    renderElements: function() {
        var _self = this;
        _self.coreServices.renderAccordion("DIGITAL FILE", _self._view);
    },
});
