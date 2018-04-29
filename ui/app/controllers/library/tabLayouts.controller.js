sap.ui.controller("app.controllers.library.tabLayouts", {
    onInit: function() {},
    onAfterRendering: function(html) {
        this._view = $(html);
        this._view.folders = this._view.find(".layoutsFolders-wrapper");
        this._view.folderShared = this._view.find(".layoutsSharedFolders-wrapper");
        this.renderElements();
    },
    renderElements: function() {
        this.coreServices.renderAccordion("LAYOUT", this._view);
    }
});