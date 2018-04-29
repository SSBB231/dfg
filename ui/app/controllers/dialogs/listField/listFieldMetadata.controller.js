sap.ui.controller("app.controllers.dialogs.listField.listFieldMetadata", {
	onInit: function() {

	},
	onAfterRendering: function(html) {
		var _self = this;
		_self.view = $(html);
		_self.view.name = _self.view.find(".name-input");
		_self.view.structure = _self.view.find(".structure-select");
		_self.view.field = _self.view.find(".field-select");
		_self.view.addFieldBtn = _self.view.find(".add-field-btn");
		_self.view.fieldListContainer = _self.view.find(".field-list-container");
		_self.fields = [];
		_self.bindElements();
	},
	bindElements: function() {
		var _self = this;
		var data = _self.getData();
		_self.view.fieldListContainer.sortable({
			axis: "y",
			start: function(event, ui) {
				ui.item.lastIndex = ui.item.index();
			},
			stop: function(event, ui) {
				var newIndex = ui.item.index();
				var temp = _self.fields[ui.item.lastIndex];
				_self.fields[ui.item.lastIndex] = _self.fields[newIndex];
				_self.fields[newIndex] = temp;
			}
		});
		_self.view.name.ctrl = _self.view.name.bindBaseInput({
			required: true,
			tooltip: i18n("TILE LAYOUT NAME TOOLTIP"),
			placeholder: i18n("TILE LAYOUT NAME")
		});
		_self.view.structure.ctrl = _self.view.structure.bindBaseSelect({
			tooltip: i18n("FILE STRUCTURE TOOLTIP"),
			placeholder: i18n("FILE STRUCTURE"),
			onChange: _self.onChangeStructure.bind(_self),
			options: $.globalFunctions.getStructureOptions(_self.coreServices.structure)
		});
		_self.view.field.ctrl = _self.view.field.bindBaseAutocomplete({
			isLoading: true,
			tooltip: i18n("SELECT FIELD")
		});
		_self.view.addFieldBtn.bind("click", function(e) {
			_self.addToList();
		});
		if(data.column && data.column.listField && data.column.listField.fields){
		    _self.view.name.ctrl.setText(data.column.listField.name);
		    for(var f = 0; f< data.column.listField.fields.length; f++){
		        _self.addToList(data.column.listField.fields[f].id,data.column.listField.fields[f].idStructure);
		    }
		}
	},
	onChangeStructure: function(oldVal, newVal) {
		var _self = this;
		_self.view.field.empty();
		_self.view.field.ctrl = _self.view.field.bindBaseAutocomplete({
			options: Object.keys(_self.coreServices.structure[newVal.key].fields).map(function(f) {
				return {
					key: _self.coreServices.structure[newVal.key].fields[f].ID,
					name: _self.coreServices.structure[newVal.key].fields[f].label
				}
			})
		});
	},
	addToList: function(idField,idStructure) {
		var _self = this;
		if(!idField){
		   if (!_self.view.field.ctrl.getKey()) {
    			$.baseToast({
    				type: "w",
    				text: i18n("FILL ALL FIELDS")
    			});
			    return;
		    }
		}
		var field = _self.coreServices.structure[_self.view.structure.ctrl.getKey() || idStructure].fields[_self.view.field.ctrl.getKey() || idField];
		if (!field) {
			$.baseToast({
				type: "w",
				text: i18n("FIELD NOT FOUND")
			});
			return;
		}
		_self.fields.push({
			id: field.ID,
			idStructure: _self.view.structure.ctrl.getKey() || idStructure
		});
		var fieldContainer = document.createElement("div");
		fieldContainer.className = "list-field-wrapper";
		var label = document.createElement("div");
		label.className = "element-name";
		label.textContent = field.label + "-(" + _self.coreServices.structure[_self.view.structure.ctrl.getKey() || idStructure].title + ")";
		var removeBtn = document.createElement("div");
		removeBtn.className = "delete-icon";
		var icon = document.createElement("span");
		icon.className = "icon icon-font-Sign-and-Symbols icon-persign icon-btn btn flat trans";
		removeBtn.appendChild(icon);
		$(removeBtn).bind("click", function(e) {
			_self.fields.splice($(this).parent().index(), 1);
			$(this).parent().remove();

		});
		fieldContainer.appendChild(label);
		fieldContainer.appendChild(removeBtn);
		_self.view.fieldListContainer.append(fieldContainer);

	},
	validate: function() {
		var _self = this;
		return _self.view.name.ctrl.validate() && _self.fields.length;
	},
	getListFieldMetadata: function() {
		var _self = this;

		return {
			name: _self.view.name.ctrl.getText(),
			fields: _self.fields
		};

	}
});