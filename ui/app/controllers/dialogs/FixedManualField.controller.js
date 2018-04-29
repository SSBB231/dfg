/*global i18n*/
sap.ui.controller("app.controllers.dialogs.FixedManualField", {
	onInit: function() {

	},
	onDataRefactor: function(data) {

	},
	onAfterRendering: function(html) {
		var _self = this;
		_self.services = _self.getData().services;
		_self.layoutObject = _self.coreServices.layoutObject;
		_self.options = [];
		_self.view = $(html);
		_self.view.fieldInput = _self.view.find(".field-input");
		_self.view.requiredCheckbox = _self.view.find(".required-checkbox");
		_self.view.optionInput = _self.view.find(".option-input");
		_self.view.descriptionInput = _self.view.find(".description-input");
		_self.view.lengthInput = _self.view.find(".length-input");
		_self.view.optionsTable = _self.view.find(".options-table");
		_self.view.addButton = _self.view.find(".add-button");
		_self.modified = false;
		_self.optionNumber = 0;
		_self._bindComponents();
		_self._bindTable(_self.options);
		_self.addEvents();
	},
	_bindComponents: function() {
		var _self = this;
		var fixedField = _self.getData().initLevel.column;

		_self.view.fieldInput.ctrl = _self.view.fieldInput.bindBaseInputKat({
			required: true,
			placeholder: i18n("ADD FIX FIELD NAME PLACEHOLDER"),
			tooltip: i18n("ADD FIX FIELD NAME TOOLTIP"),
			errorMsg: i18n("INVALID LENGTH"),
		});
		_self.view.fieldInput.ctrl.input._input.attr('maxlength', 40);

		_self.view.requiredCheckbox.ctrl = _self.view.requiredCheckbox.bindBaseCheckbox({
			id: 1,
			text: i18n('REQUIRED FILL')
		});
		_self._bindOptionDescription();
	},
	_bindOptionDescription: function() {
		var _self = this;

		_self.view.optionInput.ctrl = _self.view.optionInput.bindBaseInputKat({
			tooltip: i18n("ADD OPTION VALUE PLACEHOLDER"),
			placeholder: i18n("ADD OPTION VALUE PLACEHOLDER"),
			errorMsg: i18n("INVALID LENGTH"),
		});

		_self.view.descriptionInput.ctrl = _self.view.descriptionInput.bindBaseInputKat({
			tooltip: i18n("OPTION DESCRIPTION"),
			placeholder: i18n("OPTION DESCRIPTION"),
			errorMsg: i18n("INVALID LENGTH"),
			onChange: function(oldVal, newVal) {
			}
		});
		_self.view.lengthInput.ctrl = _self.view.lengthInput.bindBaseInputKat({
			tooltip: i18n("OPTION DESCRIPTION LENGTH"),
			placeholder: i18n("OPTION DESCRIPTION LENGTH"),
			onChange: function(oldVal, newVal) {
				if (!isNaN(newVal) && newVal !== "") {
					_self.view.lengthInput.ctrl.hideError();
					_self.view.descriptionInput.ctrl.input._input.attr('maxlength', newVal);
					if (_self.view.descriptionInput.ctrl.getText().length > parseInt(newVal, 10)) {
						_self.view.descriptionInput.ctrl.showError();
					} else {
						_self.view.descriptionInput.ctrl.hideError();
					}
				} else {
					_self.view.lengthInput.ctrl.showError();
				}
			}
		});
		_self.view.lengthInput.ctrl.setText(150);
		_self.view.optionInput.ctrl.input._input.attr('maxlength', 12);
		_self.view.descriptionInput.ctrl.input._input.attr('maxlength', 150);

	}, 
	_bindTable: function(options) {
		var _self = this;
		var options = _self.prepareOptions(options);
		_self.view.optionsTable.empty();

		_self.view.optionsTable.ctrl = _self.view.optionsTable.bindBaseTable({
			hasCheckboxes: true,
			hasActions: true,
			hasFlags: true,

			headers: [
				{
					text: i18n('OPTION NUMBER'),
					width: "70px",
					sort: true,
					type: "number"
            }, {
					text: i18n('OPTION'),
					width: "70px",
					type: "text"
            }, {
					text: i18n('DESCRIPTION'),
					width: "330px",
					type: "text"
            }
            ],

			body: options
		});
		_self.view.optionsTable.checkboxHeader = _self.view.optionsTable.find('.checkbox-header .header-wrapper');
		_self.view.optionsTable.checkboxHeader.empty();
		_self.view.optionsTable.checkboxHeader.html("Default");
		_self.view.optionsTable.checkboxes = _self.view.optionsTable.find(".td.checkbox>input");

		_self.checkboxValue();
		_self.addTableEvents();

		$(".tbody").sortable({
			placeholder: ("placeholderOption"),
			start: function(event, ui) {
				ui.item.startPos = ui.item.index();
			},
			stop: function(event, ui) {
				var startPosition = ui.item.startPos;
				var newPosition = ui.item.index();
				var option_Number = 0;

				var temporal = _self.options.splice(startPosition, 1);
				_self.options.splice(newPosition, 0, temporal[0]);

				for (var i = 0; i < _self.options.length; i++) {
					option_Number = option_Number + 1;
					_self.options[i].optionNumber = option_Number;
				}
				_self.view.optionsTable.empty();
				_self._bindTable(_self.options);
			}
		}).disableSelection();
	},
	onCheckboxClick: function() {
		var _self = this;
		_self.view.optionsTable.checkboxes.removeAttr('checked');
		for (var i = 0; i < _self.options.length; i++) {
			_self.options[i].checked = false;
		}
	},
	addEvents: function() {
		var _self = this;
		var action = [];

		_self.view.addButton.on('click', function() {
			if (_self.view.lengthInput.ctrl.getText() === "" || isNaN(_self.view.lengthInput.ctrl.getText())) {
				$.baseToast({
					type: "W",
					text: i18n("FILL WITH A VALID LENGTH")
				});
				return;
			}
			if (parseInt(_self.view.lengthInput.ctrl.getText(), 10) < _self.view.descriptionInput.ctrl.getText().length) {
				$.baseToast({
					type: "W",
					text: i18n("INVALID DESCRIPTION LENGTH")
				});
				return;
			}
			var option_Number = 0;
			for (var i = 0; i <= _self.options.length; i++) {
				option_Number = option_Number + 1;
			}

			_self.optionNumber = option_Number;
			var newOption = {
				optionNumber: _self.optionNumber,
				option: _self.view.optionInput.ctrl.getText(),
				description: _self.view.descriptionInput.ctrl.getText(),
				descriptionLength: parseInt(_self.view.lengthInput.ctrl.getText(), 10)
			};

			_self.options.push(newOption);
			_self._bindTable(_self.options);
			_self.view.optionInput.empty();
			_self.view.descriptionInput.empty();
			_self.view.lengthInput.empty();
			_self._bindOptionDescription();
		});
		if(!_self._data.initLevel.isNew){
		    _self.setFixedManualFieldData(_self._data.initLevel.column.fixedManualField);
		}
	},
	addTableEvents: function() {
		var _self = this;
		_self.view.optionsTable.checkboxes.unbind("click");
		_self.view.optionsTable.find('.td.checkbox').unbind('dblclick');

		_self.view.optionsTable.checkboxes.on('click', function(event) {
			var rowindex = $(this).closest('.tr').index();

			var isChecked = $(this).is(':checked');
			_self.onCheckboxClick();
			if (isChecked) {
				$(this).prop('checked', 'checked');
				_self.options[rowindex].checked = true;
			}
			event.stopPropagation();
		});

		_self.view.optionsTable.find('.td.checkbox').on('dblclick', function(event) {
			var rowindex = $(this).closest('.tr').index();

			var isChecked = $(this).find('input').is(':checked');
			_self.onCheckboxClick();
			if (!isChecked) {
				$(this).find('input').attr('checked', 'checked');
				_self.options[rowindex].checked = true;
			}
			event.stopPropagation();
		});
	},
	prepareOptions: function(options) {
		var id = 0;
		var _self = this;

		var processedOptions = options.map(function(element) {
			var option = {};
			option.actions = [];
			option.id = id++;
			option.actions.push({
				iconFont: "Finance-and-Office",
				icon: "trash",
				onPress: function() {
					_self.deleteField(option.id);
				},
				color: "#1B425E",
				tooltip: i18n('TRASH'),
				text: i18n('DELETE')
			});
			option.actions.push({
				iconFont: "Formatting-and-Tool",
				icon: "pensil",
				onPress: function() {
					_self.editField(option.id);
				},
				color: "#1B425E",
				tooltip: i18n('EDIT'),
				text: i18n('EDIT')
			});

			option.content = [];
			option.content.push(element.optionNumber);
			option.content.push(element.option);
			option.content.push(element.description);
			return option;
		});

		return processedOptions;
	},
	validate: function(){
	    return this.validateFixedManualField();
	},
	getColumnData: function(){
	  var _self = this; 
	  return  {
	      fixedManualField: _self.getOwnData()
	  };  
	},
	validateFixedManualField: function() {
		var _self = this;
		if (_self.view.fieldInput.ctrl.getText() === "") {
			return false;
		}
		if (_self.options.length <= 0) {
			return false;
		}
		return true;
	},
	getFixedManualFieldData: function() {
		var _self = this;
		if (_self.validateFixedManualField()) {
			return _self.getOwnData();
		}
		$.baseToast({
			type: 'W',
			text: i18n('FILL ALL REQUIRED FIELDS')
		});

	},
	getOwnData: function() {
		var _self = this;
		var data = {
			name: _self.view.fieldInput.ctrl.getText(),
			required: _self.view.requiredCheckbox.ctrl.getChecked(),
			options: _self.options
		}
		return data;
	},
	setFixedManualFieldData: function(fixedManualField) {
		var _self = this;
		if (fixedManualField) {
			_self.view.fieldInput.ctrl.setText(fixedManualField.name);
			_self.view.requiredCheckbox.ctrl.setChecked(fixedManualField.required);
			_self.options = fixedManualField.options;
			_self._bindTable(_self.options);
			_self.updateCheckboxes();
		}
	},
	updateCheckboxes: function() {
		var _self = this;
		var rows = _self.view.find('.tr');
		for (let i = 0; i < _self.options.length; i++) {
			if (_self.options[i].checked) {
				rows.eq(i + 1).find('.td.checkbox>input').attr('checked', 'checked');;
				return;
			}
		}
	},
	deleteField: function(idRow) {
		var _self = this;
		var id = 0;
		var option_Number = 0;
		_self.options.map(function(element) {
			if (idRow === id) {
				_self.options.splice(id, 1)
			}
			id++;
		});

		for (var i = 0; i < _self.options.length; i++) {
			option_Number = option_Number + 1;
			_self.options[i].optionNumber = option_Number;

		}
		_self.view.optionsTable.empty();
		_self._bindTable(_self.options);
	},
	editField: function(idRow) {
		var _self = this;
		var numberOption = _self.options[idRow].optionNumber;
		var checked = false;
		if (_self.options[idRow].checked === true) {
			checked = true;
		}

		var dialog = $.baseDialog({
			title: i18n('EDIT FIXED FIELD'),
			modal: true,
			size: "medium",
			disableOuterClick: true,
			viewName: "app.views.dialogs.editFixedManualField",
			viewData: _self.options[idRow],
			text: i18n('EDIT FIXED FIELD'),
			buttons: [{
				name: i18n('CANCEL'),
				isCloseButton: true,
				tooltip: i18n('CLICK PRESS CANCEL')
          }, {
				name: i18n('APPLY'),
				tooltip: i18n('CLICK PRESS CONFIRM'),
				click: function() {
					if (dialog.getInnerController().validate()) {
						var newOption = dialog.getInnerController().getOwnData();
						_self.options[idRow] = newOption;
						newOption.optionNumber = numberOption;
						newOption.checked = checked;
						_self.view.optionsTable.empty();
						_self._bindTable(_self.options);
						dialog.close();
					}
				}
          }]
		});
		dialog.open();
	},
	checkboxValue: function() {
		var _self = this;
		for (var i = 0; i < _self.options.length; i++) {
			if (_self.options[i].checked === true) {
				$("#cb_" + i).click();
			}
		}
	}

});