sap.ui.controller("app.controllers.executor.progressIndication", {
    onInit: function() {

    },
    onAfterRendering: function(html) {
        var _self = this;
        _self.view = $(html);
        _self.view.executionDescription = _self.view.find(".description-execution");
        _self.view.progressBarContainer = _self.view.find(".progress-bar");
        _self.bindComponents();
    },
    bindComponents: function() {
        var _self = this;
        _self.progressBar = new sap.ui.commons.ProgressIndicator(this.createId("ProgInd"), {
            width: "300px",
            percentValue: 0,
            displayValue: "",
            barColor: sap.ui.core.BarColor.POSITIVE
        });
        _self.progressBar.placeAt(_self.view.progressBarContainer);
        console.log(_self.progressBar)
    },
    updateProgress: function(description, percentValue, displayValue) {
        var _self = this;
        _self.progressBar.setPercentValue(percentValue);
        _self.view.executionDescription.text(description);
    }
});
