sap.ui.controller("app.controllers.xmlEditor.dialogs.ParamManual", {
	onInit: function() {
	},

	onAfterRendering: function(html) {
		var _self = this;
		_self.view = $(html);
		_self.services = _self.getData().services;
		_self.layoutObject = _self.coreServices.layoutObject;
		_self.currentLevel = {};
		_self.initTempParam();
		_self.initInputs();
	},

	initInputs: function(){
		var _self = this;
		_self.coreServices.inputLabel = $('#dfg-ParamManual .label.inputs').bindBaseInput({
			required: true,
			validator: function(value){
				return value;
			}
		});
		_self.coreServices.inputLength = $('#dfg-ParamManual .length.inputs').bindBaseInput({
			required: true,
			validator: function(value){
				return !isNaN(value) && value !== "" && value > 0;
			}
		});

		_self.coreServices.inputType = $('#dfg-ParamManual .type.inputs').bindBaseSelect({
			options: [
				{key: 'NVARCHAR', name: i18n('STRING')},
				{key: 'DECIMAL', name: i18n('NUMBER')},
				{key: 'TIMESTAMP', name: i18n('DATE')}
			]
		});
	},

	initTempParam: function(){
		var _self = this;
		_self.paramObject = {};
		_self.paramObject.blocks = {}
		
		for(var i in _self.layoutObject.blocks){
			_self.paramObject.blocks[i] = {}
			_self.paramObject.blocks[i].records = {};
			for(var j in _self.layoutObject.blocks[i].records){
				//console.log(_self.paramObject.blocks[i].records);
				_self.paramObject.blocks[i].records[j] = {};
				_self.paramObject.blocks[i].records[j].columns = {};
				for(var k in _self.layoutObject.blocks[i].records[j].columns){
					if(_self.layoutObject.blocks[i].records[j].columns[k].fieldId == null && _self.layoutObject.blocks[i].records[j].columns[k].manualParam){
						_self.paramObject.blocks[i].records[j].columns[k] = {manualParam: {}};
						
						_self.paramObject.blocks[i].records[j].columns[k].manualParam.id = _self.layoutObject.blocks[i].records[j].columns[k].manualParam.id;
						_self.paramObject.blocks[i].records[j].columns[k].manualParam.label = _self.layoutObject.blocks[i].records[j].columns[k].manualParam.label;
						_self.paramObject.blocks[i].records[j].columns[k].manualParam.type = _self.layoutObject.blocks[i].records[j].columns[k].manualParam.type;
						_self.paramObject.blocks[i].records[j].columns[k].manualParam.length = _self.layoutObject.blocks[i].records[j].columns[k].manualParam.length;
					}
				}
			}
		}
	},


	updateParamObject: function(){
		var _self = this;

		if(!_self.coreServices.inputLabel.validate()){
			$.baseToast({
				text: i18n("REQUIRED FILL"),
				isError: true
			});
			return false;
		}

		if(!_self.coreServices.inputLength.validate()){
			$.baseToast({
				text: i18n("DFG102011"),
				isError: true
			});
			return false;
		}

		var paramColum = _self.paramObject.blocks[_self.getData().initLevel.blockId].records[_self.getData().initLevel.recordId].columns[_self.getData().initLevel.columnId];

		paramColum.manualParam.id = _self.getData().initLevel.columnId;
		paramColum.manualParam.label = _self.coreServices.inputLabel.getText();
		paramColum.manualParam.type = _self.coreServices.inputType.getKey();
		paramColum.manualParam.length = _self.coreServices.inputLength.getText();
		return true;
	},

	getParamManualData: function(){
		var _self = this;
		return _self.paramObject;
	},
});