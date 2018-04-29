sap.ui.controller("app.controllers.dialogs.DfgOutput", {

	onInit: function() {
		this.data = {
			block: {},
			record: {},
			structure: {},
			field: {},
			operation: {},
			name: null
		}
	},

	onDataRefactor: function(data) {
		var init = data.initLevel;
		var column = _self.coreServices.layoutObject.blocks[init.blockId].records[init.recordId].columns[init.columnId];
		this.data.block = {key: column.output.blockId};
		this.data.record = {key: column.output.recordId};
		this.data.structure = {key: column.output.idStructure};
		this.data.field = {key:column.output.fieldId};
		this.data.operation = {key:column.output.operation};
		this.data.name = column.output.name;
        return $.extend(data, this.data);
    },

	onAfterRendering: function(html) {
		var _self = this;
		_self.view = $(html);
		this.initServices();
	},

	initServices: function() {
		var _self = this;
		_self.layoutObject = _self.coreServices.layoutObject;
		//Prepare Blocks
		var comboOptions = $.globalFunctions.getBlockOptions(_self.coreServices.layoutObject,true);

		_self.renderInputName();
		_self.renderOperationSelect();

		_self.comboBlocks = $('#comboBlocks').bindBaseSelect({
			options: comboOptions,
			onChange: function(oldVal, newVal) {
				if(newVal.key == null){
					$('#comboRecords').html('');
					_self.comboRecords = $('#comboRecords').bindBaseSelect({
						options: comboOptions,
						isDisabled: true,
						onChange: function(oldVal, newVal) {
							_self.data.record = newVal;
						}
					});
				}else{
					_self.data.block = newVal;
					_self.renderRecordSelect(newVal.key,newVal.records);
				}
			},
			tooltip: i18n('BLOCK SELECT TOOLTIP')
		});
		_self.comboRecords = $('#comboRecords').bindBaseSelect({
			options: comboOptions,
			isDisabled: true,
			onChange: function(oldVal, newVal) {
			},
			tooltip: i18n('RECORD SELECT TOOLTIP')
		});
		_self.comboField = $('#comboField').bindBaseSelect({
			options: comboOptions,
			isDisabled: true,
			onChange: function(oldVal, newVal) {
			},
			tooltip: i18n('FIELD SELECT TOOLTIP')
		});
		
		//Prepare Structure Select
		var structureOptions = [];
		var defaultStructure;
		for(var i in _self.coreServices.structure){
			if(!defaultStructure){
				defaultStructure = i;
			}
			structureOptions.push({
				key: i,
				name: _self.coreServices.structure[i].title
			});
		}
		$('#comboStructure').html('');
		_self.comboStructure = $('#comboStructure').bindBaseSelect({
			options: structureOptions,
			onChange: function(oldVal, newVal) {
				_self.data.structure = newVal;
			},
			tooltip: i18n('STRUCTURE TOOLTIP')
		});
		_self.coreServices.deleteGroup = function(groupIndex){
			_self.deleteGroup(groupIndex);
		}
		_self.comboStructure.setKey(defaultStructure);
		if(_self.data.structure.key)
			_self.comboStructure.setKey(_self.data.structure.key);
		_self.comboBlocks.setKey(_self.data.block.key);
		_self.comboRecords.setKey(_self.data.record.key);
		_self.comboField.setKey(_self.data.field.key);
	},
	renderRecordSelect: function(blockId,records){
		var _self = this;
		var comboOptions = records;
		$('#comboRecords').html('');
		for(var i in _self.layoutObject.blocks[blockId].records){
			var currVal = {};
			currVal.key = i;
			if(!_self.layoutObject.blocks[blockId].records[i].name){
				currVal.name = i;
			}else{
				currVal.name = _self.layoutObject.blocks[blockId].records[i].name;
			}
			comboOptions.push(currVal);
		}
		_self.comboRecords = $('#comboRecords').bindBaseSelect({
			options: comboOptions,
			onChange: function(oldVal, newVal) {
				_self.data.record = newVal;
				if(newVal)
					_self.renderFieldSelect();
			},
			tooltip: i18n('RECORD SELECT TOOLTIP')
		});
		_self.comboRecords.setKey(null);
	},
	renderFieldSelect: function(){
		var _self = this;
		var comboOptions = _self.getRecordFields().map(function(field) {
			return {
				key: field.id,
				name: field.label,
				fieldData: field
			}
		});
		$('#comboField').html('');
		_self.comboField = $('#comboField').bindBaseSelect({
			options: comboOptions,
			onChange: function(oldVal, newVal) {
				_self.data.field = newVal;
			},
			tooltip: i18n('FIELD SELECT TOOLTIP')
		});
		_self.comboField.setKey(null);
	},
	renderInputName: function() {
		var _self = this;
		$('#inputName').empty();
		_self.input = $('#inputName').bindBaseInput({
			validator: function(value){
				var regex = /^([A-Za-z0-9 ])+$/i;
				return regex.test(value);
			},
			onChange: function(value) {
				_self.data.name = _self.input.getText();
			},
			required: true
		});
		_self.input.setText(_self.data.name);
	},
	getStructureFields: function(){
		var _self = this;
		var fields = _self.coreServices.structure[_self.currentLevel.idStructure].fields;
		var returnFields = [];
		for(var i in fields){
			returnFields.push(fields[i]);
		}
		return returnFields;
	},
	getRecordFields: function(){
		var _self = this;
		var idStructure = _self.data.structure.key;
		var blockId = _self.data.block.key;
		var recordId = _self.data.record.key;
			
		var fields = _self.coreServices.structure[idStructure].fields;
		var returnFields = [];
		for(var k in _self.layoutObject.blocks[blockId].records[recordId].columns){
			if(_self.layoutObject.blocks[blockId].records[recordId].columns[k].fieldId && _self.layoutObject.blocks[blockId].records[recordId].columns[k].fieldId != 'recordId'){
			    var type = $.globalFunctions.getColumnType(_self.layoutObject.blocks[blockId].records[recordId].columns[k],_self.coreServices.structure,true);
				if(type === "NUMBER"){
					returnFields.push(fields[_self.layoutObject.blocks[blockId].records[recordId].columns[k].fieldId]);
				}
			}
		}
		return returnFields;
	},
	renderOperationSelect: function() {
		var _self = this;

		var operationOptions = [
			{
				key: "AVG",
				name:i18n('AVG')
			},
			{
				key: "MIN",
				name: i18n('MIN')
			},
			{
				key: "MAX",
				name: i18n('MAX')
			},
			{
				key: "COUNT",
				name: i18n('COUNT')
			},
			{
				key: "SUM",
				name: i18n('SUM')
			}
		];
		_self.comboOperation = $('#comboOperation').bindBaseSelect({
			options: operationOptions,
			onChange: function(oldVal, newVal) {
				_self.data.operation = newVal;
			},
			tooltip: i18n('OPERATION SELECT TOOLTIP')
		});
		_self.comboOperation.setKey(_self.data.operation.key);
	},
	getOutputData: function(validate) {
		if(validate){
			for(var prop in this.data){
				if(this.data.hasOwnProperty(prop)){
					if(!this.data[prop]){
						$.baseToast({
							text: i18n("REQUIRED FILL"),
							isError: true
						});
						return false;
					}
				}
			}
		}
		return this.data;
	}
});