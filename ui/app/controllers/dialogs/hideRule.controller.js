/*global i18n _*/
sap.ui.controller("app.controllers.dialogs.hideRule", {
    onInit: function() {},
    onAfterRendering: function(html) {
        var _self = this;
        _self.view = $(html);
        this.initServices();
        _self.renderTab();
        _self.resizeDialog();
    },
    resizeDialog: function() {
        $('.base-dialog.medium').width(560);
        $('.dialog-buttons button').width('50%');
    },
    renderTab: function() {
        var _self = this;
        _self.tabController = $('#tabs-wrapper').bindBaseTabs({
            tab: [{
                title: '',
                icon: "hide",
                iconColor: "white",
                iconFont: "Display-and-Setting",
                viewName: "app.views.dialogs.hideRuleTab",
                viewData: {},
                tooltip: ''
            }],
            type: "boxes",
            wrapperClass: "wrapperClass"
        });
    },
    initServices: function() {
        var _self = this;
        _self.layoutObject = _self.coreServices.layoutObject;
        var comboOptions = [{
            name: i18n("ALL"),
            key: "all"
        }].concat($.globalFunctions.getBlockOptions(_self.layoutObject, true));

        _self.blockSelect = $('#blockSelect').bindBaseSelect({
            options: comboOptions,
            disableSort: true,
            onChange: function(oldVal, newVal) {
                if (_.isNil(newVal.key)) {
                    $('#recordSelect').html('');
                    _self.recordSelect = $('#recordSelect').bindBaseSelect({
                        options: comboOptions,
                        disableSort: true,
                        isDisabled: true
                    });
                } else {
                    if (oldVal.key !== newVal.key) {
                        _self.renderRecordSelect(newVal.key, newVal.records);
                    }
                }
            },
            tooltip: i18n('BLOCK SELECT TOOLTIP')
        });
        _self.recordSelect = $('#recordSelect').bindBaseSelect({
            options: comboOptions,
            disableSort: true,
            isDisabled: true,
            tooltip: i18n('RECORD SELECT TOOLTIP')
        });
        _self.comboField = $('#comboField').bindBaseSelect({
            options: comboOptions,
            disableSort: true,
            isDisabled: true,
            tooltip: i18n('FIELD SELECT TOOLTIP')
        });

        //Prepare Structure Select
        var structureOptions = $.globalFunctions.getStructureOptions(_self.coreServices.structure);
        var defaultStructure;
        if (structureOptions.length) {
            defaultStructure = structureOptions[0].key;
        }
        _self.coreServices.getRecordFields = function() {
            comboOptions = _self.getRecordFields().map(function(field) {
                return _self.parseField(field);
            });
            return comboOptions;
        };
    },
    renderRecordSelect: function(blockId, records) {
        var _self = this;
        var hidingRule;
        var comboOptions = [{
            name: i18n("ALL"),
            key: 'all'
        }].concat(records);
        $('#recordSelect').html('');
        if (blockId !== 'all') {
            _self.tabController.Tabs.innerControllers[0].hideHideLine();
        } else {
            _self.comboField.disable();
            _self.comboField.setKey(undefined);
            _self.tabController.Tabs.innerControllers[0].setRuleConfig(undefined);
            _self.coreServices.needsSize = true;
            _self.tabController.Tabs.innerControllers[0].enableSizeInput();

            hidingRule = _self.layoutObject.hidingRule;
            if (hidingRule) {
                _self.tabController.Tabs.innerControllers[0].setRuleConfig(hidingRule);
            }
            _self.tabController.Tabs.innerControllers[0].showHideLine();
        }
        comboOptions = comboOptions.filter(function(option) {
            if (option) {
                return true;
            }
            return false;
        });
        _self.recordSelect = $('#recordSelect').bindBaseSelect({
            options: comboOptions,
            disableSort: true,
            onChange: function(oldVal, newVal) {
                if (newVal.key !== "all") {
                    console.log("estoy vivooo")
                    _self.renderFieldSelect();
                    _self.tabController.Tabs.innerControllers[0].hideHideLine();
                } else {
                    _self.comboField.disable();
                    _self.comboField.setKey(undefined);
                    _self.tabController.Tabs.innerControllers[0].setRuleConfig(undefined);
                    _self.coreServices.needsSize = true;
                    _self.tabController.Tabs.innerControllers[0].enableSizeInput();
                    _self.tabController.Tabs.innerControllers[0].showHideLine();
                    hidingRule = _self.layoutObject.blocks[_self.blockSelect.getKey()].hidingRule;
                    if (hidingRule) {
                        _self.tabController.Tabs.innerControllers[0].setRuleConfig(hidingRule);
                    }
                }
            },
            isDisabled: blockId === 'all',
            tooltip: i18n('RECORD SELECT TOOLTIP')
        });
    },
    renderFieldSelect: function() {
        var _self = this;
        var comboOptions = _self.coreServices.getRecordFields();
        comboOptions.splice(0, 0, {
            name: i18n("ALL"),
            key: "all"
        });

        $('#comboField').empty();
        _self.comboField = $('#comboField').bindBaseSelect({
            options: comboOptions,
            disableSort: true,
            onChange: function(oldVal, newVal) {
                if (newVal.key === "all") {
                    _self.tabController.Tabs.innerControllers[0].enableSizeInput();
                    _self.tabController.Tabs.innerControllers[0].showHideLine();
                    var hidingRule = _self.layoutObject.blocks[_self.blockSelect.getKey()].records[_self.recordSelect.getKey()].hidingRule;
                    _self.tabController.Tabs.innerControllers[0].setRuleConfig(undefined);
                    if (hidingRule) {
                        _self.tabController.Tabs.innerControllers[0].setRuleConfig(hidingRule);
                    }
                    return;
                } else {
                    _self.tabController.Tabs.innerControllers[0].hideHideLine();
                }
                if (newVal.needsSize) {
                    _self.coreServices.needsSize = true;
                    _self.tabController.Tabs.innerControllers[0].enableSizeInput();
                } else {
                    _self.coreServices.needsSize = false;
                    _self.tabController.Tabs.innerControllers[0].disableSizeInput();
                }
                var column = _self.getColumn();
                if (column.hidingRule) {
                    _self.tabController.Tabs.innerControllers[0].setRuleConfig(column.hidingRule);
                } else {
                    _self.tabController.Tabs.innerControllers[0].setRuleConfig(undefined);
                }
            },
            tooltip: i18n('FIELD SELECT TOOLTIP')
        });
    },
    getRecordFields: function() {
        var _self = this;
        var blockId = _self.blockSelect.getKey();
        var recordId = _self.recordSelect.getKey();
        var returnFields = [];
        _.forEach(_self.layoutObject.blocks[blockId].records[recordId].columns, function(column, k) {
            var field = {};
            if (column.fieldId && column.fieldId !== 'recordId') {
                var fields = _self.coreServices.structure[column.idStructure].fields;
                field = $.extend({}, fields[column.fieldId]);
                field.columnId = k;
            } else {
                field = $.extend({}, column);
                field.columnId = k;
            }
            if (_self.isFieldHideable(field)) {
                returnFields.push(field);
            }
        });
        return returnFields;
    },
    getColumn: function() {
        var _self = this;
        var blockId = _self.blockSelect.getKey();
        var recordId = _self.recordSelect.getKey();
        var columnId = _self.comboField.getKey();

        return _self.layoutObject.blocks[blockId].records[recordId].columns[columnId];
    },
    isFieldHideable: function(field) {
        return ((field.manualParam && !field.recordList) || field.id || field.formula || field.output || field.fixedField || field.isRecordsTotals);
    },
    getFieldData: function() {
        var _self = this;
        if (_self.data.field.key) {
            return _self.layoutObject.blocks[_self.data.block.key].records[_self.data.record.key].columns[_self.data.field.key].hide;
        }
        return null;
    },
    setDefaults: function() {
        var _self = this;
        if (_self.getFieldData()) {
            var columns = _self.getFieldData().positions;
            for (var i = 0; i < columns.length; i++) {
                _self.coreServices.comboOptions.fields.push(_self.parseField(_self.getFieldData().columns[columns[i]]));
            }
            for (i = 0; i < columns.length; i++) {
                _self.coreServices.concatenateField(columns[i]);
            }
        }
    },
    parseField: function(field) {
        if (field.id) {
            field.fieldId = field.id;
            return {
                key: field.columnId,
                name: field.label,
                needsSize: true,
                fieldData: field
            };
        } else if (field.manualParam) {
            return {
                key: field.manualParam.id,
                name: field.manualParam.label,
                fieldData: field
            };
        } else if (field.formula) {
            return {
                key: field.columnId,
                needsSize: true,
                name: field.columnId,
                fieldData: field
            };
        } else if (field.output) {
            return {
                key: field.columnId,
                needsSize: true,
                name: field.output.label,
                fieldData: field
            };
        } else if (field.fixedField) {
            return {
                key: field.columnId,
                needsSize: true,
                name: field.fixedField.name,
                fieldData: field
            };
        }else if(field.isRecordsTotals){
            return {
                key: field.columnId,
                needsSize: false,
                name: i18n('TOTAL RECORD'),
                fieldData: field
            };
        }
        
        //console.log(field);
    },
    getHideRulesData: function() {
        var _self = this;
        var data = {
            block: _self.blockSelect.getKey(),
            record: _self.recordSelect.getKey(),
            field: _self.comboField.getKey(),
            rule: _self.tabController.Tabs.innerControllers[0].getRuleConfig()
        };
        if (_self.coreServices.needsSize) {
            if (!data.rule.hide && !data.rule.hideValue && !data.rule.hideAllLine && !data.rule.hideField && !data.rule.keepSeparator && (data.rule.size === "" || data.rule.size < 0)) {
                return {
                    block: _self.blockSelect.getKey(),
                    record: _self.recordSelect.getKey(),
                    field: _self.comboField.getKey()
                };
            }
        }
        return data;
    }
});