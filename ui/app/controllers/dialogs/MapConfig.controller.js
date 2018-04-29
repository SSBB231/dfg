sap.ui.controller("app.controllers.dialogs.MapConfig", {
    onInit: function() {},

    onAfterRendering: function(html) {
        var _self = this;
        _self.view = $(html);
        var _mpConfig = _self.coreServices.layoutObject.mapConfig;
        var _mpVacio = false;
        if (_mpConfig == undefined) {
            _mpVacio = true;
            _self.coreServices.layoutObject.mapConfig = {};
            _mpConfig = _self.coreServices.layoutObject.mapConfig;
        }

        //Creating Structure Select
        var structureOptions = [];
        var _objOld = [];
        var defaultStructure;
        for (var i in _self.coreServices.structure) {
            if (!defaultStructure) {
                defaultStructure = i;
            }
            structureOptions.push({
                key: i,
                name: _self.coreServices.structure[i].title
            });
            if (_mpVacio)
                _mpConfig[i] = {
                    company: 0,
                    branch: 0,
                    state: 0,
                    validDate: 0
                };
        }
        var _optionsStruct = _self.setStructureFields(defaultStructure);
        _self.view.find('.inputCompany').html('');
        _self.inputCompany = _self.view.find('.inputCompany').bindBaseAutocomplete({
            options: _optionsStruct,
            tooltip: i18n('COMPANY AUTOCOMPLETE TOOLTIP')
        });
        _self.view.find('.inputBranch').html('');
        _self.inputBranch = _self.view.find('.inputBranch').bindBaseAutocomplete({
            options: _optionsStruct,
            tooltip: i18n('BRANCH AUTOCOMPLETE TOOLTIP')
        });
        _self.view.find('.inputState').html('');
        _self.inputState = _self.view.find('.inputState').bindBaseAutocomplete({
            options: _optionsStruct,
            tooltip: i18n('STATE AUTOCOMPLETE TOOLTIP')
        });
        _self.view.find('.inputValidDate').html('');
        _self.inputValidDate = _self.view.find('.inputValidDate').bindBaseAutocomplete({
            options: _optionsStruct,
            tooltip: i18n('DATE AUTOCOMPLETE TOOLTIP')
        });

        _self.view.find('.inputStructure').html('');
        _self.inputStructure = _self.view.find('.inputStructure').bindBaseAutocomplete({
            options: structureOptions,
            onChange: function(oldVal, newVal) {
                if (oldVal.key == undefined) {} else {
                    if (!_mpConfig[oldVal.key]) {
                        _mpConfig[oldVal.key] = {};
                    }
                    _mpConfig[oldVal.key].company = _self.inputCompany.getKey();
                    _mpConfig[oldVal.key].state = _self.inputState.getKey();
                    _mpConfig[oldVal.key].branch = _self.inputBranch.getKey();
                    _mpConfig[oldVal.key].validDate = _self.inputValidDate.getKey();
                }
                _self.structureKey = newVal.key;
                _self.inputCompany.setText("");
                _self.inputState.setText("");
                _self.inputBranch.setText("");
                _self.inputValidDate.setText("");
                // if(!_mpConfig[oldVal.key]){
                // 	_mpConfig[newVal.key] = {};
                // }

                if (_mpConfig[newVal.key] !== undefined) {

                    if (_mpConfig[newVal.key].company !== undefined)
                        _self.inputCompany.setKey(_mpConfig[newVal.key].company);
                    if (_mpConfig[newVal.key].state !== undefined)
                        _self.inputState.setKey(_mpConfig[newVal.key].state);
                    if (_mpConfig[newVal.key].branch !== undefined)
                        _self.inputBranch.setKey(_mpConfig[newVal.key].branch);
                    if (_mpConfig[newVal.key].validDate !== undefined)
                        _self.inputValidDate.setKey(_mpConfig[newVal.key].validDate);
                }
            },
            tooltip: i18n('STRUCTURE AUTOCOMPLETE TOOLTIP')
        }).setKey(defaultStructure);
        _self.structureKey = defaultStructure;

        _self.initData();
    },
    setStructureFields: function(newVal) {
        var _self = this;
        var _val;
        for (var i = 0; i < _self.coreServices.layoutObject.structure.length; i++) {
            if (newVal == _self.coreServices.layoutObject.structure[i].id) {
                _val = i;
                break;
            }
        }
        var fields = _self.coreServices.layoutObject.structure[_val].fields;
        var returnFields = [];
        for (var i in fields) {
            returnFields.push({
                key: i,
                name: fields[i].label
            });
        }
        return returnFields;
    },
    getStructureFields: function() {
        var _self = this;
        var fields = _self.coreServices.layoutObject.structure.fields;
        var returnFields = [];
        for (var i in fields) {
            returnFields.push({
                key: i,
                name: fields[i].label
            });
        }
        return returnFields;
    },
    updateConfigData: function() {
        var _self = this;
        var newVal = _self.inputStructure.getKey();
        var _mpConfig = _self.coreServices.layoutObject.mapConfig;
        if (_mpConfig[newVal] === undefined) {
            _mpConfig[newVal] = {};

        }
  

        _mpConfig[newVal].company = _self.inputCompany.getKey();
        _mpConfig[newVal].state = _self.inputState.getKey();
        _mpConfig[newVal].branch = _self.inputBranch.getKey();
        _mpConfig[newVal].validDate = _self.inputValidDate.getKey();

    },
    initData: function() {
        var _self = this;
        if (_self.coreServices.layoutObject.mapConfig && _self.coreServices.layoutObject.mapConfig[_self.structureKey] !== undefined) {

            if (_self.coreServices.layoutObject.mapConfig[_self.structureKey].company) {
                _self.inputCompany.setKey(parseInt(_self.coreServices.layoutObject.mapConfig[_self.structureKey].company));
            }
            if (_self.coreServices.layoutObject.mapConfig[_self.structureKey].branch) {
                _self.inputBranch.setKey(_self.coreServices.layoutObject.mapConfig[_self.structureKey].branch);
            }
            if (_self.coreServices.layoutObject.mapConfig[_self.structureKey].state) {
                _self.inputState.setKey(_self.coreServices.layoutObject.mapConfig[_self.structureKey].state);
            }
            if (_self.coreServices.layoutObject.mapConfig[_self.structureKey].validDate) {
                _self.inputValidDate.setKey(_self.coreServices.layoutObject.mapConfig[_self.structureKey].validDate);
            }
        }
    }
});
