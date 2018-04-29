sap.ui.controller("app.controllers.dialogs.fixField", {
    onInit: function() {

    },
    onDataRefactor: function(data) {

    },
    onAfterRendering: function(html) {
        var _self = this;
        _self.services = _self.getData().services;
        _self.layoutObject = _self.coreServices.layoutObject;
        _self.view = $(html);
        _self.view.name = _self.view.find(".name-field");
        _self.view.type = _self.view.find(".type-field");
        _self.view.size = _self.view.find(".size-field");
        _self.view.addOption = _self.view.find(".addOption");
        _self.view.optionContainer = _self.view.find(".option-container");
        _self.view.optionsControllers = [];
        _self.modified = false;
        _self._bindComponents();
        _self.lastSizeValue;
        _self.initFixedField();
    },
    initFixedField: function() {
        var _self = this;
        _self.fixedFieldObject = {};
        _self.fixedFieldObject.blocks = {};
        for (var i in _self.layoutObject.blocks) {
            _self.fixedFieldObject.blocks[i] = {};
            _self.fixedFieldObject.blocks[i].records = {};
            for (var j in _self.layoutObject.blocks[i].records) {
                _self.fixedFieldObject.blocks[i].records[j] = {};
                _self.fixedFieldObject.blocks[i].records[j].columns = {};
                for (var k in _self.layoutObject.blocks[i].records[j].columns) {
                    if (_self.layoutObject.blocks[i].records[j].columns[k].fieldId === null && _self.layoutObject.blocks[i].records[j].columns[k].fixedField) {
                        _self.fixedFieldObject.blocks[i].records[j].columns[k] = { fixedField: {} };
                        _self.fixedFieldObject.blocks[i].records[j].columns[k].fixedField.id = _self.layoutObject.blocks[i].records[j].columns[k].fixedField.id;
                        _self.fixedFieldObject.blocks[i].records[j].columns[k].fixedField.name = _self.layoutObject.blocks[i].records[j].columns[k].fixedField.name;
                        _self.fixedFieldObject.blocks[i].records[j].columns[k].fixedField.type = _self.layoutObject.blocks[i].records[j].columns[k].fixedField.type;
                        _self.fixedFieldObject.blocks[i].records[j].columns[k].fixedField.size = _self.layoutObject.blocks[i].records[j].columns[k].fixedField.size;
                        _self.fixedFieldObject.blocks[i].records[j].columns[k].fixedField.values = _self.layoutObject.blocks[i].records[j].columns[k].fixedField.values;
                    }
                }
            }
        }
        if(!_self.fixedFieldObject.blocks[_self._data.initLevel.blockId].records[_self._data.initLevel.recordId].columns[_self._data.initLevel.columnId]){
           _self.fixedFieldObject.blocks[_self._data.initLevel.blockId].records[_self._data.initLevel.recordId].columns[_self._data.initLevel.columnId] =  _self._data.initLevel.column;     
        }
    },
    _bindComponents: function() {
        var _self = this;
        
        _self.view.name.ctrl = _self.view.name.bindBaseInput({
            tooltip: i18n("ADD FIX FIELD NAME TOOLTIP"),
            placeholder: i18n("ADD FIX FIELD NAME PLACEHOLDER"),
            required: true
        });
        _self.view.type.ctrl = _self.view.type.bindBaseSelect({
            tooltip: i18n("ADD FIX FIELD TYPE TOOLTIP"),
            placeholder: i18n("ADD FIX FIELD TYPE PLACEHOLDER"),
            required: true,
            options: [
                { key: 'NVARCHAR', name: i18n('STRING') },
                { key: 'DECIMAL', name: i18n('NUMBER') },
                { key: 'TIMESTAMP', name: i18n('DATE') }
            ],
            disableSort: true,
            onChange: _self.onChangeType.bind(this),

        });
        _self.view.size.ctrl = _self.view.size.bindBaseInput({
            tooltip: i18n("ADD FIX FIELD LENGTH TOOLTIP"),
            placeholder: i18n("ADD FIX FIELD LENGTH PLACEHOLDER"),
            onChange: _self.validateSize.bind(this),
            validatorType: 'number',
            errorMsg: i18n("INVALID LENGTH"),
            required: true,
            validator: function(value) {
                if (value === "")
                    return false;
                if (isNaN(value)) {
                    return false;
                }
                if (parseInt(value, 10) <= 0) {
                    return false;
                }
                return true;
            }

        });
        _self.view.addOption.click(function() {
            _self.addOptionRow();
        });
        if(!_self._data.initLevel.isNew){
            var column = _self._data.initLevel.column;
            _self.setFixedFieldData(column.fixedField);
            
        }
    },
    addOptionRow: function(optionValue) {
        var _self = this;
        var rowContainer = document.createElement("div");
        rowContainer.setAttribute("class", "option-row");
        var value = document.createElement("div");
        value.setAttribute("class", "option-input");
        var tempCtrl;
        var type = _self.view.type.ctrl.getKey();

        if (!optionValue) {
            tempCtrl = $(value).bindBaseInput({
                tooltip: i18n("ADD OPTION VALUE TOOLTIP"),
                placeholder: i18n("ADD OPTION VALUE PLACEHOLDER")
            });
            if (optionValue) {

                tempCtrl.setValue(optionValue);

            }
            tempCtrl = _self.addValidations(type, tempCtrl, value);
        } else {
            if (typeof optionValue === 'object') {
                tempCtrl = $(value).bindBaseDatePicker({
                    tooltip: i18n("ADD OPTION VALUE TOOLTIP")
                });

            } else {
                tempCtrl = $(value).bindBaseInput({
                    tooltip: i18n("ADD OPTION VALUE TOOLTIP"),
                    placeholder: i18n("ADD OPTION VALUE PLACEHOLDER")
                });
            }
            tempCtrl.setValue(optionValue);
        }

        rowContainer.setAttribute("data-id", _self.view.optionsControllers.length);
        _self.view.optionsControllers.push(tempCtrl);
        var deleteIcon = document.createElement("div");
        $(deleteIcon).click(function() {
            _self.view.optionsControllers.splice(rowContainer.getAttribute("data-id"), 1);
            rowContainer.remove();
            _self.updateDataIds();

        });
        $(deleteIcon).baseTooltip({
            class: 'dark',
            position: 'top',
            text: i18n("DELETE OPTION TOOLTIP")
        });
        deleteIcon.setAttribute("id", "delete-icon");
        deleteIcon.setAttribute("class", "delete-icon");
        $(deleteIcon).append("<span class='icon icon-font-Sign-and-Symbols icon-persign icon-btn btn flat trans'></span>")
        rowContainer.appendChild(value);
        rowContainer.appendChild(deleteIcon);
        _self.view.optionContainer.append(rowContainer);

    },
    updateFixedFieldObject: function() {
        var _self = this;
        var fixedFieldColumn = _self.fixedFieldObject.blocks[_self.getData().initLevel.blockId].records[_self.getData().initLevel.recordId].columns[_self.getData().initLevel.columnId];
        fixedFieldColumn.fixedField.id = _self.getData().initLevel.columnId;
        fixedFieldColumn.fixedField.name = _self.view.name.ctrl.getText();
        fixedFieldColumn.fixedField.type = _self.view.type.ctrl.getKey();
        fixedFieldColumn.fixedField.size = _self.view.size.ctrl.getText();
        fixedFieldColumn.fixedField.values = [];
        _self.lastSizeValue = _self.view.size.ctrl.getText();
        for (var i = 0; i < _self.view.optionsControllers.length; i++) {

            fixedFieldColumn.fixedField.values.push(_self.view.optionsControllers[i].getValue());
        }

    },
    updateDataIds: function() {
        var _self = this;
        var optionRows = $('.option-row');

        for (var i = 0; i < optionRows.length; i++) {

            optionRows[i].setAttribute("data-id", i);
        }
    },
    validateFixedField: function() {
        var _self = this;
        if (_self.view.name.ctrl.getText() === "") {
            return false;
        }
        if (_self.view.type.ctrl.getKey() === undefined || _self.view.type.ctrl.getKey() == null) {
            return false;
        }
        if (!_self.view.size.ctrl.isValid()) {
            return false;
        }
        if (_self.view.optionsControllers.length === 0) {
            return false;
        }
        for (var i = 0; i < _self.view.optionsControllers.length; i++) {
            if (!_self.view.optionsControllers[i].isValid()) {
                return false;
            }
        }
        return true;
    },
    validate: function(){
      return this.validateFixedField();  
    },
    getColumnData: function(){
      var _self = this; 
      _self.updateFixedFieldObject();
      return  _self.fixedFieldObject.blocks[_self.getData().initLevel.blockId].records[_self.getData().initLevel.recordId].columns[_self.getData().initLevel.columnId];

    },
    getFixedFieldData: function(flag) {
        var _self = this;
        if (_self.validateFixedField() || flag) {
            return _self.fixedFieldObject;
        }
        $.baseToast({
            type: 'W',
            text: i18n('FILL ALL FIELDS')
        });

    },
    setFixedFieldData: function(fixedField) {
        var _self = this;

        if (fixedField) {
            _self.view.name.ctrl.setText(fixedField.name);

            for (var i = 0; i < fixedField.values.length; i++) {
                _self.addOptionRow(fixedField.values[i]);
            }

            _self.view.type.ctrl.setKey(fixedField.type);
            _self.view.size.ctrl.setText(fixedField.size);
            _self.lastSizeValue = fixedField.size;
            _self.modified = true;

        }
    },
    validateSize: function() {
        var _self = this;
        try {

            for (var i = 0; i < _self.view.optionsControllers.length; i++) {
                _self.view.optionsControllers[i].validate();
            }
        } catch (e) {

        }

    },
    onChangeType: function(oldVal, newVal) {
        var _self = this;
        var value;
        var options = $(".option-input");
        if (oldVal.key !== newVal.key) {
            for (var i = 0; i < _self.view.optionsControllers.length; i++) {

                _self.view.optionsControllers[i] = _self.addValidations(newVal.key, _self.view.optionsControllers[i], options[i],_self.view.optionsControllers[i].getValue());
            }
        }
    },
    addValidations: function(type, controller, option,value1) {
        var _self = this;
        var newController = controller;
        switch (type) {
            case 'DECIMAL':

                value = controller.getValue();
                if (typeof value === "object") {
                    _self.view.size.ctrl.enable();
                    _self.view.size.ctrl.setText(_self.lastSizeValue);
                    $(option).empty();
                    newController = $(option).bindBaseInput({
                        tooltip: i18n("ADD OPTION VALUE TOOLTIP"),
                        placeholder: i18n("ADD OPTION VALUE PLACEHOLDER")
                    });
                } else {


                    newController.setValidator(function(optionValue) {
                        var size = _self.view.size.ctrl.getValue();
                        if (optionValue === "") {
                            return false;
                        }
                        if (isNaN(optionValue)) {
                            newController.setErrorMsg(i18n("FIXED FIELD TYPE ERROR"));
                            return false;
                        }

                        if (("" + optionValue).length > parseInt(size, 10)) {
                            newController.setErrorMsg(i18n("FIXED FIELD SIZE ERROR"));
                            return false;
                        }
                        return true;
                    });
                    newController.setValidatorType("number");

                }
                break;
            case 'NVARCHAR':
                value = newController.getValue();
                if (typeof value === "object") {
                    $(option).empty();
                    _self.view.size.ctrl.enable();
                    _self.view.size.ctrl.setText(_self.lastSizeValue);
                    newController = $(option).bindBaseInput({
                        tooltip: i18n("ADD OPTION VALUE TOOLTIP"),
                        placeholder: i18n("ADD OPTION VALUE PLACEHOLDER")
                    });

                    newController.setText(value.timpDate);
                }

                newController.setValidator(function(optionValue) {
                    var size = _self.view.size.ctrl.getValue();
                    if (("" + optionValue).length > parseInt(size, 10)) {
                        newController.setErrorMsg(i18n("FIXED FIELD SIZE ERROR"));
                        return false;
                    }
                    return true;
                });
                newController.setValidatorType("string");


                break;
            case 'TIMESTAMP':
                value = newController.getValue();

                _self.view.size.ctrl.setText("10");

                _self.view.size.ctrl.disable();
                $(option).empty();
                newController = $(option).bindBaseDatePicker({
                    tooltip: i18n("ADD OPTION VALUE TOOLTIP"),
                    placeholder: i18n("ADD OPTION VALUE PLACEHOLDER")
                });

                if(typeof value1 === 'object'){
                    newController.setValue(value1);
                }
                break;
        }
        return newController;
    },
    isModified: function() {
        var self = this;
        return self.modified;
    }
});
