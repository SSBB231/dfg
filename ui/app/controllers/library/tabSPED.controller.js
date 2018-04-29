sap.ui.controller("app.controllers.library.tabSPED", {
    onInit: function() {},
    onAfterRendering: function(html) {
        this._view = $(html);
        this.renderElements();
    },
    renderElements: function() {
        this.coreServices.renderAccordion("SPED", this._view);
    }
});