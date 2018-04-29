sap.ui.controller("app.controllers.dialogs.businessRuleDialog", {
    onInit: function() {

    },
    onDataRefactor: function(data) {

    },
    onAfterRendering: function(html) {
        var _self = this;
        _self.view = $(html);
        _self.view.blockSelect = _self.view.find(".block-select");
        _self.view.recordSelect = _self.view.find(".record-select");
        _self.view.fieldSelect = _self.view.find(".field-select");
        _self.view.ruleSelect = _self.view.find(".rule-select");
        _self.bindComponents();

    },
    bindComponents: function() {
        var _self = this;
        var data = _self.getData();

        var blockOptions = $.globalFunctions.getBlockOptions(_self.coreServices.layoutObject,true,true);

        Data.endpoints.bre.rule.DFGBusinessRules.post({ idLayout: _self.coreServices.layoutObject.idVersion}).success(function(data) {
            _self.view.blockSelect.ctrl = _self.view.blockSelect.bindBaseSelect({
                options: blockOptions,
                required: true,
                tooltip: i18n("SELECT BLOCK"),
                onChange: function(oldVal, newVal) {
                    _self.onChangeBlock(oldVal, newVal);
                }
            });
            _self.view.recordSelect.ctrl = _self.view.recordSelect.bindBaseSelect({
                options: [],
                required: true,
                isDisabled: true,
                tooltip: i18n("SELECT RECORD"),
                onChange: function(oldVal, newVal) {
                    _self.onChangeRecord(oldVal, newVal);
                }
            });
            _self.view.fieldSelect.ctrl = _self.view.fieldSelect.bindBaseSelect({
                options: [],
                required: true,
                isDisabled: true,
                tooltip: i18n("SELECT FIELD")
            });
            var ruleOptions = data.map(function(rule) {
                return {
                    key: rule.id,
                    name: rule.name
                }
            });
            ruleOptions.push({
                key: 'DR',
                name: i18n("NO RULE")
            });
            _self.view.ruleSelect.ctrl = _self.view.ruleSelect.bindBaseSelect({
                options: ruleOptions,
                tooltip: i18n("FILE RULE TOOLTIP"),
                required: true
            });
        });

    },
    onChangeBlock: function(oldVal, newVal) {
        var _self = this;

        var recordOptions = newVal.records;
        _self.view.recordSelect.empty();
        _self.view.recordSelect.ctrl = _self.view.recordSelect.bindBaseSelect({
            options: recordOptions,
            required: true,
            tooltip: i18n("SELECT RECORD"),
            onChange: function(oldVal, newVal) {
                _self.onChangeRecord(oldVal, newVal);
            }
        });
    },
    onChangeRecord: function(oldVal, newVal) {
        var _self = this;
        var fieldOptions = newVal.columns;
        var field;
        _self.view.fieldSelect.empty();
        _self.view.fieldSelect.ctrl = _self.view.fieldSelect.bindBaseSelect({
            options: fieldOptions,
            required: true,
            tooltip: i18n("SELECT FIELD"),
            onChange: function(oldVal, newVal) {
                _self.onChangeField(oldVal, newVal);
            }
        });
    },
    onChangeField: function(oldVal, newVal) {
        var _self = this;
        var businessRules = _self.coreServices.layoutObject.blocks[_self.view.blockSelect.ctrl.getKey()].records[_self.view.recordSelect.ctrl.getKey()].businessRules ? _self.coreServices.layoutObject.blocks[_self.view.blockSelect.ctrl.getKey()].records[_self.view.recordSelect.ctrl.getKey()].businessRules[newVal.key] : undefined;
        if (businessRules) {
            _self.view.ruleSelect.ctrl.setKey(businessRules.idRule);
        }
    },
    isValid: function() {
        var _self = this;
        if (_self.view.fieldSelect.ctrl.getKey() === undefined || _self.view.fieldSelect.ctrl.getKey() === null) {
            return false;
        }
        if (_self.view.ruleSelect.ctrl.getKey() === undefined || _self.view.ruleSelect.ctrl.getKey() === null) {
            return false;
        }
        return true;
    },
    getRuleData: function() {
        var _self = this;

        var ruleData = {
            block: _self.view.blockSelect.ctrl.getKey(),
            record: _self.view.recordSelect.ctrl.getKey(),
            field: _self.view.fieldSelect.ctrl.getKey(),
            idRule: _self.view.ruleSelect.ctrl.getKey()
        };
        return ruleData;


    }

});
