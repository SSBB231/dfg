sap.ui.controller("app.controllers.dialogs.MultipleSelect", {

	onInit: function() {

	},

	onDataRefactor: function(data) {
        return $.extend(data, this.data);
    },

	onAfterRendering: function(html) {
		this.initServices();
		this.bindEvents();
	},

	bindEvents: function(){
		var _self = this;
	},

	initServices: function() {

		var _self = this;
		$("#MultipleSelect").bindBaseMultipleSelect({});

	}	
  
});