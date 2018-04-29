sap.ui.controller("app.controllers.dialogs.dateDialog", {
	onInit: function() {
	},

	onAfterRendering: function(html) {
		var _self = this;
		_self.view = $(html);
		_self.services = _self.getData().services;
		_self.layoutObject = _self.coreServices.layoutObject;
		_self.currentLevel = {};
		_self.initDateParam();
		_self.initSelect();
	},

	initSelect: function(){
		var _self = this;
		console.log(_self.getData())
		_self.coreServices.inputLabel = $('#dfg-Date .label.inputs').bindBaseSelect({
			options: _self.getData().manualDates,
			required: true
		});
	},

	initDateParam: function(){
		var _self = this;
		_self.dateParamObject = {};
		_self.dateParamObject.blocks = {};
		
		for(var i in _self.layoutObject.blocks){
			_self.dateParamObject.blocks[i] = {};
			_self.dateParamObject.blocks[i].records = {};
			for(var j in _self.layoutObject.blocks[i].records){
				_self.dateParamObject.blocks[i].records[j] = {};
				_self.dateParamObject.blocks[i].records[j].columns = {};
				for(var k in _self.layoutObject.blocks[i].records[j].columns){
					if(_self.layoutObject.blocks[i].records[j].columns[k].date){
						_self.dateParamObject.blocks[i].records[j].columns[k] = {date: {}};						
						_self.dateParamObject.blocks[i].records[j].columns[k].date.id = _self.layoutObject.blocks[i].records[j].columns[k].date.id;
						_self.dateParamObject.blocks[i].records[j].columns[k].date.value = _self.layoutObject.blocks[i].records[j].columns[k].date.value;
					}
				}
			}
		}
	},


	updateDateParamObject: function(){
		var _self = this;
		var dateColumn = _self.dateParamObject.blocks[_self.getData().initLevel.blockId].records[_self.getData().initLevel.recordId].columns[_self.getData().initLevel.columnId];
		dateColumn.date.id = _self.getData().initLevel.columnId;
		dateColumn.date.value = _self.coreServices.inputLabel.getKey();
	},

	getDateParamData: function(){
		var _self = this;
		return _self.dateParamObject;
	},
});