sap.ui.controller("app.controllers.dialogs.ParamManual", {
	onInit: function() {},

	onAfterRendering: function(html) {
		var _self = this;
		_self.view = $(html);
		_self.services = _self.getData().services;
		_self.layoutObject = _self.coreServices.layoutObject;
		_self.currentLevel = {};
		_self.initTempParam();
		_self.initInputs();
	},

	initInputs: function() {
		var _self = this;
		_self.coreServices.inputLabel = $('#dfg-ParamManual .label.inputs').bindBaseInput({
			required: true,
			validator: function(value) {
				return value;
			}
		});
		_self.coreServices.inputLength = $('#dfg-ParamManual .length.inputs').bindBaseInput({
			required: true,
			validator: function(value) {
				return !isNaN(value) && value !== "" && value > 0;
			}
		});

		_self.coreServices.inputType = $('#dfg-ParamManual .type.inputs').bindBaseSelect({
			options: [
				{
					key: 'NVARCHAR',
					name: i18n('STRING')
				},
				{
					key: 'DECIMAL',
					name: i18n('NUMBER')
				},
				{
					key: 'TIMESTAMP',
					name: i18n('DATE')
				}
			],
            disableSort: true
		});
		_self.inputAlign = _self.view.find('.input-align').bindBaseSelect({
			options: [{
				key: 0,
				name: i18n('LEFT')
			}, {
				key: 1,
				name: i18n('RIGHT')
			}],
            disableSort: true,
			tooltip: i18n('ALIGN SELECT TOOLTIP')
		});
		_self.inputFill = _self.view.find('.input-fill').bindBaseInput({
			tooltip: i18n('COMPLEMENT INPUT TOOLTIP'),
			placeholder: i18n('FILL')
		});
		if(_self.layoutObject.blocks[_self._data.initLevel.blockId].records[_self._data.initLevel.recordId].columns[_self._data.initLevel.columnId]){
		    var param = _self._data.initLevel.column;
		    _self.coreServices.inputLabel.setText(param.manualParam.label);
		    _self.coreServices.inputType.setKey(param.manualParam.type);
		    _self.coreServices.inputLength.setText(param.manualParam.length);
		    _self.inputFill.setText(param.manualParam.fill);
		    _self.inputAlign.setKey(param.manualParam.align);
		}
	},

	initTempParam: function() {
		var _self = this;
		_self.paramObject = {};
		_self.paramObject.blocks = {}

		for (var i in _self.layoutObject.blocks) {
			_self.paramObject.blocks[i] = {}
			_self.paramObject.blocks[i].records = {};
			for (var j in _self.layoutObject.blocks[i].records) {
				//console.log(_self.paramObject.blocks[i].records);
				_self.paramObject.blocks[i].records[j] = {};
				_self.paramObject.blocks[i].records[j].columns = {};
				for (var k in _self.layoutObject.blocks[i].records[j].columns) {
					if (_self.layoutObject.blocks[i].records[j].columns[k].fieldId == null && _self.layoutObject.blocks[i].records[j].columns[k].manualParam) {
						_self.paramObject.blocks[i].records[j].columns[k] = {
							manualParam: {}
						};

						_self.paramObject.blocks[i].records[j].columns[k].manualParam.id = _self.layoutObject.blocks[i].records[j].columns[k].manualParam.id;
						_self.paramObject.blocks[i].records[j].columns[k].manualParam.label = _self.layoutObject.blocks[i].records[j].columns[k].manualParam
							.label;
						_self.paramObject.blocks[i].records[j].columns[k].manualParam.type = _self.layoutObject.blocks[i].records[j].columns[k].manualParam.type;
						_self.paramObject.blocks[i].records[j].columns[k].manualParam.length = _self.layoutObject.blocks[i].records[j].columns[k].manualParam
							.length;
						_self.paramObject.blocks[i].records[j].columns[k].manualParam.fill = _self.layoutObject.blocks[i].records[j].columns[k].manualParam.fill;
						_self.paramObject.blocks[i].records[j].columns[k].manualParam.align = _self.layoutObject.blocks[i].records[j].columns[k].manualParam
							.align;
					}
				}
			}
		}
		if (!_self.paramObject.blocks[_self.getData().initLevel.blockId].records[_self.getData().initLevel.recordId].columns[_self.getData().initLevel
			.columnId]) {
			_self.paramObject.blocks[_self.getData().initLevel.blockId].records[_self.getData().initLevel.recordId].columns[_self.getData().initLevel
				.columnId] = {
				"manualParam": {
					id: "",
					label: "",
					type: "",
					length: "",
					fill: "",
					align: ""
				}
			};

		}

	},
	validate: function() {
		var _self = this;

		if (!_self.coreServices.inputLabel.validate()) {
			$.baseToast({
				text: i18n("REQUIRED FILL"),
				isError: true
			});
			return false;
		}

		if (!_self.coreServices.inputLength.validate()) {
			$.baseToast({
				text: i18n("DFG102011"),
				isError: true
			});
			return false;
		}
		return true;
	},
	getColumnData: function() {
		var _self = this;
		_self.updateParamObject();
		return _self.paramObject.blocks[_self.getData().initLevel.blockId].records[_self.getData().initLevel.recordId].columns[_self.getData().initLevel
			.columnId];

	},
	updateParamObject: function() {
		var _self = this;

		if (!_self.coreServices.inputLabel.validate()) {
			$.baseToast({
				text: i18n("REQUIRED FILL"),
				isError: true
			});
			return false;
		}

		if (!_self.coreServices.inputLength.validate()) {
			$.baseToast({
				text: i18n("DFG102011"),
				isError: true
			});
			return false;
		}

		var paramColum = _self.paramObject.blocks[_self.getData().initLevel.blockId].records[_self.getData().initLevel.recordId].columns[_self.getData()
			.initLevel.columnId];

		paramColum.manualParam.id = _self.getData().initLevel.columnId;
		paramColum.manualParam.label = _self.coreServices.inputLabel.getText();
		paramColum.manualParam.type = _self.coreServices.inputType.getKey();
		paramColum.manualParam.length = _self.coreServices.inputLength.getText();
		paramColum.manualParam.fill = _self.inputFill.getText();
		paramColum.manualParam.align = _self.inputAlign.getKey();
		return true;
	},
	bindParamInfo: function(param) {
		var _self = this;
		_self.inputFill.setText(param.fill);
		_self.inputAlign.setKey(param.align);
	},
	getParamManualData: function() {
		var _self = this;
		return _self.paramObject;
	},
});