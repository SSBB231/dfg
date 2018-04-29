sap.ui.controller("app.controllers.dialogs.concat.concat", {

	onInit: function() {
		this.data = {
			block: {},
			record: {},
			structure: {},
			field: {},
			operation: {},
			name: null,
			positions: [],
			columns: {}
		}
	},

	onDataRefactor: function(data) {
        return $.extend(data, this.data);
    },

	onAfterRendering: function(html) {
		var _self = this;
		_self.view = $(html);
		this.initServices();
		_self.renderTab();
	},

	renderTab: function() {
		var _self = this;
		_self.tabController = $('#tabs-wrapper').bindBaseTabs({
            tab: [{
                title: i18n('FIELDS'),
                icon: "organizationchartB",
                iconColor: "white",
                iconFont: "Sign-and-Symbols",
                viewName: "app.views.dialogs.concat.fieldList",
                viewData: {
                	comboOptions: this.comboOptions,
                	parentData: _self.data
                },
                tooltip: i18n('CLICK PRESS ENTER TO') + " " + i18n('SELECT') + " " + i18n('FIELDS')
            }],
            type: "boxes",
            wrapperClass: "wrapperClass"
        });
	},

	initServices: function() {
		var _self = this;
		_self.layoutObject = _self.coreServices.layoutObject;
		//Prepare Blocks
		var comboOptions = [];
		for(var i in _self.layoutObject.blocks){
			var currVal = {};
			currVal.key = i;
			if(!_self.layoutObject.blocks[i].name){
				currVal.name = i;
			}else{
				currVal.name = _self.layoutObject.blocks[i].name;
			}
			comboOptions.push(currVal);
		}

		_self.blockSelect = $('#blockSelect').bindBaseSelect({
			options: comboOptions,
            disableSort: true,
			onChange: function(oldVal, newVal) {
				if(newVal.key == null){
					$('#recordSelect').html('');
					_self.recordSelect = $('#recordSelect').bindBaseSelect({
						options: comboOptions,
                        disableSort: true,
						isDisabled: true,
						onChange: function(oldVal, newVal) {
							_self.data.record = newVal;
						}
					});
				}else{
					if(oldVal.key !== newVal.key){
						_self.coreServices.deleteAllFields();
						_self.coreServices.comboOptions.fields = [];
						_self.data.block = newVal;
						_self.renderRecordSelect(newVal.key);
						_self.coreServices.renderMainFieldSelect(null);
					}
				}
			},
			tooltip: i18n('BLOCK SELECT TOOLTIP')
		});
		_self.recordSelect = $('#recordSelect').bindBaseSelect({
			options: comboOptions,
            disableSort: true,
			isDisabled: true,
			onChange: function(oldVal, newVal) {
			},
			tooltip: i18n('RECORD SELECT TOOLTIP')
		});
		_self.comboField = $('#comboField').bindBaseSelect({
			options: comboOptions,
            disableSort: true,
			isDisabled: true,
			onChange: function(oldVal, newVal) {
			},
			tooltip: i18n('FIELD SELECT TOOLTIP')
		});
		_self.coreServices.comboOptions = {
			fields: []
		}
		
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
		_self.coreServices.getRecordFields = function() {
			var comboOptions = _self.getRecordFields().map(function(field) {
				return _self.parseField(field);
			});
			return comboOptions;
		}
		$('#comboStructure').html('');
		_self.comboStructure = $('#comboStructure').bindBaseSelect({
			options: structureOptions,
            disableSort: true,
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
		_self.blockSelect.setKey(_self.data.block.key);
		_self.recordSelect.setKey(_self.data.record.key);
		_self.comboField.setKey(_self.data.field.key);
	},
	renderRecordSelect: function(blockId){
		var _self = this;
		var comboOptions = [];
		$('#recordSelect').html('');
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
		_self.recordSelect = $('#recordSelect').bindBaseSelect({
			options: comboOptions,
            disableSort: true,
			onChange: function(oldVal, newVal) {
				_self.data.record = newVal;
				if(newVal.key !==  oldVal.key){
					_self.coreServices.deleteAllFields();
					_self.renderFieldSelect();
					_self.coreServices.renderMainFieldSelect(null);
				}
			},
			tooltip: i18n('RECORD SELECT TOOLTIP')
		});
		_self.recordSelect.setKey(null);
		_self.comboField.setKey(null);
	},
	renderFieldSelect: function(){
		var _self = this;
		var comboOptions = _self.coreServices.getRecordFields();
		_self.coreServices.comboOptions.fields = comboOptions;
		$('#comboField').html('');
		_self.comboField = $('#comboField').bindBaseSelect({
			options: comboOptions,
            disableSort: true,
			onChange: function(oldVal, newVal) {
				_self.coreServices.comboOptions.fields = _self.coreServices.getRecordFields();
				_self.coreServices.deleteAllFields();
				_self.data.field = newVal;
				_self.coreServices.renderMainFieldSelect(newVal.key);
				_self.setDefaults();
			},
			tooltip: i18n('FIELD SELECT TOOLTIP')
		});
		_self.comboField.setKey(null);
	},
	getRecordFields: function(){
		var _self = this;
		var idStructure = _self.data.structure.key;
		var blockId = _self.data.block.key;
		var recordId = _self.data.record.key;
		
		var fields = _self.coreServices.structure[idStructure].fields;
		var returnFields = [];
		for(var k in _self.layoutObject.blocks[blockId].records[recordId].columns){
			var field = {};
			if(_self.layoutObject.blocks[blockId].records[recordId].columns[k].fieldId && _self.layoutObject.blocks[blockId].records[recordId].columns[k].fieldId != 'recordId'){
				field = $.extend({}, fields[_self.layoutObject.blocks[blockId].records[recordId].columns[k].fieldId]);
				field.columnId = k;
			}else{
				field = $.extend({}, _self.layoutObject.blocks[blockId].records[recordId].columns[k]);
				field.columnId = k;
			}
			if(_self.isFieldConcatenable(field)){
				returnFields.push(field);
			}
		}
		return returnFields;
	},
	isFieldConcatenable: function(field) {
		return (field.manualParam || field.id || field.formula ||  field.output || field.fixedField);
	},
	getFieldData: function() {
		var _self = this;
		if(_self.data.field.key)
			return _self.layoutObject.blocks[_self.data.block.key].records[_self.data.record.key].columns[_self.data.field.fieldData.columnId].concat;
		return null;
	},
	setDefaults: function() {
		var _self = this;
		if(_self.getFieldData()){
			var columns = _self.getFieldData().positions;
			for (var i = 0; i < columns.length; i++) {
				_self.coreServices.comboOptions.fields.push(_self.parseField(_self.getFieldData().columns[columns[i]]));
			}
			for (var i = 0; i < columns.length; i++) {
				_self.coreServices.concatenateField(columns[i]);
			}
		}
	},
	parseField: function(field) {
		var _self = this;
		if(field.id){
			field.fieldId = field.id;
			return {
				key: field.id,
				name: field.label,
				fieldData: field
			}
		}else if(field.manualParam){
			return {
				key: field.manualParam.id,
				name: field.manualParam.label,
				fieldData: field
			}
		}else if(field.formula){
			return {
				key: field.columnId,
				name: field.columnId,
				fieldData: field
			}
		}else if(field.output){
			return {
				key: field.columnId,
				name: field.output.label,
				fieldData: field
			}
		}else if(field.fixedField){
			return {
				key: field.columnId,
				name: field.fixedField.name,
				fieldData: field
			}
		}
	},
	getConcatData: function() {
		var _self = this;
		var concatFields = _self.coreServices.getFields();
		for (var i = 0; i < concatFields.length; i++) {
			var fieldData = concatFields[i].getOwnData().fieldData;
			var fieldId = !isNaN(fieldData.columnId) ? Number(fieldData.columnId) : fieldData.columnId;
			this.data.positions.push(fieldId);
			this.data.columns[fieldData.columnId] = fieldData;
		}
		return this.data;
	}
});