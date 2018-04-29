sap.ui.controller('app.controllers.library.dialogs.NewFolder', {
	onInit: function() {
	},

	onDataRefactor: function(data) {
		return $.extend(data, this.data);
	},

	onAfterRendering: function(html) {
		var _self = this;
		_self.view = $(html);
		this.initServices();
		this.bindEvents();
		if(_self.getData().folderId){
			Data.endpoints.core.folders.list.post({id:_self.getData().folderId})
			.success(function(folderData){
				_self.inputName.setText(folderData[0].name);
				_self.view.find('#inputDescription').val(folderData[0].description);

			})
			.error(function(){
				$.baseToast({text: i18n['DFG02001'], isError: true});
				return null;
			})
		}
	},

	bindEvents: function(){
		var _self = this;
	},

	initServices: function() {
		var _self = this;
		_self.inputName = $("#inputName").bindBaseInput({
			required: true
		});

	},
	getOwnData: function(){
		var _self = this;
		var returnObject = {};
		returnObject.name = _self.inputName.getText();
		returnObject.description = _self.view.find('#inputDescription').val();
		return returnObject;
	}
})
