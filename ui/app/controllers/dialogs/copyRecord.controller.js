sap.ui.controller('app.controllers.dialogs.copyRecord', {
	onInit: function() {

	},
	onAfterRendering: function(html) {
		var _self = this;
		_self.view = $(html);
		_self.view.copySelect = _self.view.find(".copy-select");
		_self.view.elementSelect = _self.view.find(".element-select");
		_self.view.fieldCB = _self.view.find(".field-option");
		_self.view.filterCB = _self.view.find(".filter-option");
		_self.view.formatCB = _self.view.find(".format-option");
		_self.view.groupCB = _self.view.find(".group-option");
		_self.view.find(".toBlock-wrapper").hide();
		_self.view.toBlockSelect = _self.view.find(".toBlock-select");
		_self.coreServices.updateLayoutObject();
		_self.bindComponents();

	},
	bindComponents: function() {
		var _self = this;
		_self.view.copySelect.ctrl = _self.view.copySelect.bindBaseSelect({
			tooltip: i18n("COPY OPTION TOOLTIP"),
			placeholder: i18n("COPY OPTION PLACEHOLDER"),
			options: [{
				key: 1,
				name: i18n("BLOCK")
            }, {
				key: 2,
				name: i18n("RECORD")
            }],
            disableSort: true,
			onChange: _self.onChangeCopy.bind(this)
		});
		_self.view.elementSelect.ctrl = _self.view.elementSelect.bindBaseSelect({
			tooltip: i18n("BLOCK/RECORD TOOLTIP"),
			placeholder: i18n("BLOCK/RECORD PLACEHOLDER"),
			isDisabled: true,
			required: true
		});
		_self.view.toBlockSelect.ctrl = _self.view.toBlockSelect.bindBaseMultipleSelect3({
			tooltip: i18n("TO BLOCK TOOLTIP"),
			placeholder: i18n("TO BLOCK PLACEHOLDER"),
			options: $.globalFunctions.getBlockOptions(_self.coreServices.layoutObject),
            disableSort: true
		});
		_self.view.fieldCB.ctrl = _self.view.fieldCB.bindBaseCheckbox({
			id: 1,
			text: i18n("FIELDS"),
			tooltip: i18n('FIELDS OPTION TOOLTIP'),
			onChange: function(oldVal, newVal) {

			}
		});
		_self.view.filterCB.ctrl = _self.view.filterCB.bindBaseCheckbox({
			id: 2,
			text: i18n("FILTERS"),
			tooltip: i18n('FILTERS OPTION TOOLTIP'),
			onChange: function(oldVal, newVal) {

			}
		});
		_self.view.formatCB.ctrl = _self.view.formatCB.bindBaseCheckbox({
			id: 3,
			text: i18n("FORMATS"),
			tooltip: i18n('FORMATS OPTION TOOLTIP'),
			onChange: function(oldVal, newVal) {

			}
		});
		_self.view.groupCB.ctrl = _self.view.groupCB.bindBaseCheckbox({
			id: 4,
			text: i18n("GROUPS "),
			tooltip: i18n("GROUPS OPTION TOOLTIP"),
			onChange: function(oldVal, newVal) {
 
			}
		});
	},
	onChangeCopy: function(oldVal, newVal) {
		var _self = this;
		var newOptions = [];
		if (newVal.key === 1) {
			newOptions = $.globalFunctions.getBlockOptions(_self.coreServices.layoutObject);
			_self.view.find(".toBlock-wrapper").hide();
		} else {
			_self.view.find(".toBlock-wrapper").show();
			for (i in _self.coreServices.layoutObject.blocks) {
				for (j in _self.coreServices.layoutObject.blocks[i].records) {
					newOptions.push({
						key: i + ";" + j,
						name: _self.coreServices.layoutObject.blocks[i].records[j].name
					});
				}
			}
		}
		_self.view.elementSelect.empty();
		_self.view.elementSelect.ctrl = _self.view.elementSelect.bindBaseSelect({
			tooltip: i18n("BLOCK/RECORD TOOLTIP"),
			placeholder: i18n("BLOCK/RECORD PLACEHOLDER"),
			options: newOptions,
            disableSort: true,
			required: true
		});
	},
	validateCopy: function() {
		var self = this;
		if (self.view.copySelect.ctrl.getKey() === undefined) {
			return false;
		}
		if (self.view.elementSelect.ctrl.getKey() === undefined) {
			return false;
		}
		return true;
	},
	getCopyData: function() {
		var self = this;
		var data = {};
		data.copyType = self.view.copySelect.ctrl.getKey();
		data.elementId = self.view.elementSelect.ctrl.getKey();
		data.copyFields = self.view.fieldCB.ctrl.getChecked();
		data.copyFilters = self.view.filterCB.ctrl.getChecked();
		data.copyFormat = self.view.formatCB.ctrl.getChecked();
		data.copyGroups = self.view.groupCB.ctrl.getChecked();
		data.toBlocks = self.view.toBlockSelect.ctrl.getKeys();
		return data;
	}
})