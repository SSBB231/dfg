sap.ui.controller("app.controllers.dialogs.listField.listFieldDialog", {
	onInit: function() {

	},
	onDataRefactor: function() {

	},
	onAfterRendering: function(html) {
		var _self = this;
		_self.view = $(html);
		_self.view.tabContainer = _self.view.find(".tab-container");
		_self.layoutObject = _self.coreServices.layoutObject;
		_self.initListField();
		_self.bindElements();
	},
	bindElements: function() {
		var _self = this;
		var _data = _self.getData();
		var column;
		if (_data.initLevel && _data.initLevel.column) {
			column = _data.initLevel.column;
		}
		_self.view.tabContainer.ctrl = _self.view.tabContainer.bindBaseTabs({
			tab: [{
					title: i18n("LIST FIELD METADATA"),
					icon: "textandtext",
					iconFont: "Formatting-and-Tool",
					viewName: "app.views.dialogs.listField.listFieldMetadata",
					viewData: {
						column: column
					}
         }
            ],
			type: "boxes",
			wrapperClass: "wrapperClass"
		});
	},
	initListField: function() {
		var _self = this;
		_self.listFieldObject = {};
		_self.listFieldObject.blocks = {};

		for (var i in _self.layoutObject.blocks) {
			_self.listFieldObject.blocks[i] = {};
			_self.listFieldObject.blocks[i].records = {};
			for (var j in _self.layoutObject.blocks[i].records) {
				_self.listFieldObject.blocks[i].records[j] = {};
				_self.listFieldObject.blocks[i].records[j].columns = {};
				for (var k in _self.layoutObject.blocks[i].records[j].columns) {
					if (_self.layoutObject.blocks[i].records[j].columns[k].fieldId === null && _self.layoutObject.blocks[i].records[j].columns[k].listField) {
						_self.listFieldObject.blocks[i].records[j].columns[k] = {
							listField: {}
						};
						_self.listFieldObject.blocks[i].records[j].columns[k].listField.id = _self.layoutObject.blocks[i].records[j].columns[k].listField.id;
						_self.listFieldObject.blocks[i].records[j].columns[k].listField.fields = _self.layoutObject.blocks[i].records[j].columns[k].listField
							.fields;
						_self.listFieldObject.blocks[i].records[j].columns[k].listField.name = _self.layoutObject.blocks[i].records[j].columns[k].listField.name;
					}
				}
			}
		}
		if (!_self.listFieldObject.blocks[_self._data.initLevel.blockId].records[_self._data.initLevel.recordId].columns[_self._data.initLevel.columnId]) {
			_self.listFieldObject.blocks[_self._data.initLevel.blockId].records[_self._data.initLevel.recordId].columns[_self._data.initLevel.columnId] =
				_self._data.initLevel.column;
		}
	},
	validate: function() {
		var _self = this;
		var ctrls = _self.view.tabContainer.ctrl.getInnerControllers();
		return ctrls[0].validate();
	},
	getColumnData: function() {
		var _self = this;
		_self.updateListFieldObject();
		return _self._data.initLevel.column;
	},
	updateListFieldObject: function() {
		var _self = this;
		var ctrls = _self.view.tabContainer.ctrl.getInnerControllers();
		var metadata = ctrls[0].getListFieldMetadata();
		var listFieldColumn = _self.listFieldObject.blocks[_self.getData().initLevel.blockId].records[_self.getData().initLevel.recordId].columns[
			_self.getData().initLevel.columnId];
		listFieldColumn.listField.id = _self.getData().initLevel.columnId;
		listFieldColumn.listField.fields = metadata.fields;
		listFieldColumn.listField.name = metadata.name;
	},
	getListFieldData: function() {
		var _self = this;

		if (!_self.validate()) {
			return undefined;
		}
		_self.updateListFieldObject();
		return _self.listFieldObject;
	}
});