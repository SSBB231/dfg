sap.ui.controller("app.controllers.dialogs.FileName", {

	onInit: function() {
		this.data = {
			description:{
				class: "textarea-class",
				id: "textarea-id"
			}
		}
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

		$("#inputTextName").bindBaseInput({
			placeholder: "Enter name",
			//required: true,
			onChange: function (oldVal, newVal) {
				
			}
		});
	}	
  
});