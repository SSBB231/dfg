sap.ui.controller("app.controllers.xmlEditor.dialogs.Filler", {
	onInit: function() {},

	onAfterRendering: function(html) {
		var _self = this;
		_self.view = $(html);
		_self.services = _self.getData().services;
		_self.restrictions = _self.coreServices.restrictions;
		_self.currentLevel = {};
		_self.initFiller();
		_self.initInputs();
	},

	initInputs: function() {
		var _self = this;
		_self.coreServices.inputLabel = $('#dfg-Filler .label.inputs').bindBaseInput({
			validator: function(value) {
				var regex = /^([A-Za-z0-9 ])+$/i;
				return regex.test(value);
			},
			required: true
		});
		_self.coreServices.inputName = $('#dfg-Filler .label.inputName').bindBaseInput({
			validator: function(value) {
				var regex = /^([A-Za-z0-9 ])+$/i;
				return regex.test(value);
			},
			required: true
		});
	},

	initFiller: function() {
		var _self = this;
		_self.fillerObject = {};
		for (var i in _self.restrictions) {
			if (_self.restrictions[i].fieldData.fieldId === "filler" && _self.restrictions[i].fieldData.filler) {
				_self.fillerObject[i] = {
					filler: {}
				};
				_self.fillerObject[i].filler.id = _self.restrictions[i].fieldData.filler.id;
				_self.fillerObject[i].filler.value = _self.restrictions[i].fieldData.filler.value;
				_self.fillerObject[i].filler.name = _self.restrictions[i].fieldData.filler.name;
			}
		}
	},

	updateFillerObject: function() {
		var _self = this;
		var fillerColumn = _self.fillerObject[_self.getData().initLevel.columnId];
		fillerColumn.filler.id = _self.getData().initLevel.columnId;
		fillerColumn.filler.value = _self.coreServices.inputLabel.getText();
		fillerColumn.filler.name = _self.coreServices.inputName.getText();
	},

	getFillerData: function(validate) {
		var _self = this;
		var value = _self.coreServices.inputLabel.getText();
		var name = _self.coreServices.inputName.getText();
		if ((!value || !name) && validate) {
			$.baseToast({
				type: 'W',
				text: i18n('FILL ALL FIELDS')
			});
			return false;
		}
		return _self.fillerObject;
	},
});