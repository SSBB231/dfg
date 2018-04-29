sap.ui.controller('app.controllers.dialogs.concat.concatFieldSelect', {
	onInit: function() {
		var _self = this;
	},
	onBeforeRendering: function() {

	},

	onDataRefactor: function(data) {
        return $.extend(data, this.data);
    },
	onAfterRendering: function(html) {
		var _self = this;
		this.view = $(html);
		_self.valuesRef = [];
		_self.dialogs = {};
		_self.fieldData = _self.getData().fieldData;
		_self.selectedOption = _self.getData().selectedOption;
		_self.parentData = _self._data.parentData;
		_self.renderField();
		_self.bindEvents();
		_self.registerDialogs();
	},
	renderField: function() {
		var _self = this;
		this.view.find('.field-select').empty();
		var filteredOptions = _self.coreServices.comboOptions.fields.filter(function(element) {
			return !element.fieldData.concat;
		});
		_self.comboField = this.view.find('.field-select').bindBaseSelect({
			options: filteredOptions,
            disableSort: true,
			onChange: function(oldVal, newVal) {
				_self.selectedOption = newVal;
			},
			tooltip: i18n('FIELD SELECT TOOLTIP')
		});
		_self.comboField.setKey(_self.selectedOption);
	},
	bindEvents: function() {
		var _self = this;
		$('.icon-add-concat').unbind( "click" );
		$('.icon-delete-concat').unbind( "click" );
		$('.icon-edit-concat').unbind( "click" );
		_self.addFieldBtn = $('.icon-add-concat').click(function(e){
			_self.getData().parentAddField();
		})

		_self.removeFieldBtn = $('.icon-delete-concat').click(function(e){
			_self.coreServices.deleteField($(this).closest('.concat-field-wrapper').index());
			$(this).closest('.concat-field-wrapper').remove();
		});
		_self.editFieldBtn = $('.icon-edit-concat').click(function(e){
			var index = $(this).closest('.concat-field-wrapper').index();
			if(index >= 0)
				_self.coreServices.getFields()[index].edit();
		});
	},
	deleteValue: function(valueIndex){
		var _self = this;
	},
	getOwnData: function(){
		var _self = this;
		return _self.selectedOption;
	},
	edit: function() {
		var _self = this;
		if(!_self.selectedOption){
			return ;
		}

		if(_self.selectedOption.fieldData.manualParam){
			_self.dialogs.openParamDialog();
		}else if(_self.selectedOption.fieldData.formula){
			_self.dialogs.openFormulaDialog();
		}else if(_self.selectedOption.fieldData.fixedField){
			_self.dialogs.openFixedFieldDialog();
		}
	},
	registerDialogs: function() {
		var _self = this;
		_self.dialogs.openParamDialog = function() {
			_self.parametroDialog = $.baseDialog({
	            outerClick: "disabled",
	            title: i18n('PARAMETRO'),
	            modal: true,
	            size: "big",
	            cssClass: "dfg-dialog parametro-dialog newFile",
	            viewName: "app.views.dialogs.ParamManual",
	            viewData: {
	                initLevel: {}
	            },
	            buttons: [{
	                name: i18n('CANCEL'),
	                isCloseButton: true,
	                tooltip: i18n('CLICK PRESS CANCEL')
	            }, {
	                name: i18n('APPLY'),
	                click: function() {
	                	var data = _self.selectedOption.fieldData.manualParam;
						data.label = _self.coreServices.inputLabel.getText();
						data.type = _self.coreServices.inputType.getKey();
						data.length = _self.coreServices.inputLength.getText();
						_self.parametroDialog.close();
						_self.selectedOption.name = data.label;
						_self.selectedOption.value = data.label;
						_self.selectedOption = _self.selectedOption.key;
						_self.renderField();
	                },
	                tooltip: i18n('CLICK PRESS CONFIRM')
	            }]
	        });
	        _self.parametroDialog.open();
	        var data = _self.selectedOption.fieldData.manualParam;
	        _self.coreServices.inputLabel.setText(data.label);
	        _self.coreServices.inputType.setKey(data.type);
	        _self.coreServices.inputLength.setText(data.length);
		};

		_self.dialogs.openFormulaDialog = function() {
            _self.formulaDialog = $.baseDialog({
                outerClick: "disabled",
                title: i18n('FORMULA BUILDER'),
                modal: true,
                size: "big",
                cssClass: "brb-dialog formula-dialog newFile dfg-formula-dialog",
                viewName: "app.views.editor.DesignFormula",
                viewData: {
                    initLevel: {}
                },
                buttons: [{
                    name: i18n('CANCEL'),
                    isCloseButton: true,
                    tooltip: i18n('CLICK PRESS CANCEL')
                }, {
                    name: i18n('APPLY'),
                    click: function() {
                        var formulaColumn = _self.selectedOption.fieldData;
                        var formulaValue = _self.formulaDialog.getInnerController().formulaValue;
                        formulaColumn.formula.raw = formulaValue.value;
						formulaColumn.formula.text = formulaValue.formula;
						formulaColumn.formula.hana = formulaValue.hanaValue;
						formulaColumn.formula.outputs = formulaValue.outputs;
						if(formulaValue.isMathFormula){
							formulaColumn.formula.type = "DECIMAL";
						}else{
							formulaColumn.formula.type = "NVARCHAR";
						}
						_self.formulaDialog.close();
                    },
                    tooltip: i18n('CLICK PRESS CONFIRM')
                }]
            });
            _self.formulaDialog.open();
            _self.formulaDialog.getInnerController().comboBlocks.disable();
            _self.formulaDialog.getInnerController().comboBlocks.setKey(_self.parentData.block.key);
            _self.formulaDialog.getInnerController().comboRecords.disable();
            _self.formulaDialog.getInnerController().comboRecords.setKey(_self.parentData.record.key);
            _self.formulaDialog.getInnerController().comboColumns.disable();
            _self.formulaDialog.getInnerController().comboStructure.setKey(_self.parentData.structure.key);
            var data = _self.selectedOption.fieldData.formula;
            _self.formulaDialog.getInnerController().textarea.val(data.text);
            _self.formulaDialog.getInnerController().formulaActive(true);
        };
        _self.dialogs.openFixedFieldDialog = function() {
            _self.fixedFieldDialog = $.baseDialog({
                outerClick: "disabled",
                title: i18n('FIXED FIELD'),
                modal: true,
                size: "big",
                cssClass: "dfg-dialog parametro-dialog newFile",
                viewName: "app.views.dialogs.fixField",
                viewData: {
                    initLevel: {}
                },
                buttons: [{
                    name: i18n('CANCEL'),
                    isCloseButton: true,
                    tooltip: i18n('CLICK PRESS CANCEL')
                }, {
                    name: i18n('APPLY'),
                    click: function() {
                    	var dialogCtrl = _self.fixedFieldDialog.getInnerController();
                        var updated = dialogCtrl.getFixedFieldData();
                        var fixedField = _self.selectedOption.fieldData.fixedField;
                        if (updated) {
                        	fixedField.id = dialogCtrl.getData().initLevel.columnId;
					        fixedField.name = dialogCtrl.view.name.ctrl.getText();
					        fixedField.type = dialogCtrl.view.type.ctrl.getKey();
					        fixedField.size = dialogCtrl.view.size.ctrl.getText();
					        fixedField.values = [];
					        dialogCtrl.lastSizeValue = dialogCtrl.view.size.ctrl.getText();
					        for (var i = 0; i < dialogCtrl.view.optionsControllers.length; i++) {

					            fixedField.values.push(dialogCtrl.view.optionsControllers[i].getValue());
					        }
                            _self.fixedFieldDialog.close();
                            _self.selectedOption.name = fixedField.name;
							_self.selectedOption.value = fixedField.name;
							_self.selectedOption = _self.selectedOption.key;
							_self.renderField();
                        }
                    },
                    tooltip: i18n('CLICK PRESS CONFIRM')
                }]
            });
            _self.fixedFieldDialog.open();
            var fixedField = _self.selectedOption.fieldData.fixedField;
            _self.fixedFieldDialog.getInnerController().setFixedFieldData(fixedField);
        };
	}
});