sap.ui.controller("app.controllers.editor.relations.conditionFilter", {
    onInit: function() {

    },
    onAfterRendering: function(html) {
        var _self = this;
        _self.view = $(html);
        _self.valueList = { values: [] };
        _self.view.logicOperator = _self.view.find(".logic-operator");
        _self.view.operator = _self.view.find(".operator");
        _self.view.valueInput = _self.view.find(".value-input");
        _self.view.listBtn = _self.view.find(".list");
        _self.view.listBtn.hide();
        _self.view.deleteBtn = _self.view.find(".delete-icon");
        _self.view.addBtn = _self.view.find(".add-icon");
        _self.view.attr("data-id", _self.view.index());

        _self.bindComponents();
    },
    bindComponents: function() {
        var _self = this;
        var data = _self.getData();
        if (data.isFirstRow) {

            _self.view.logicOperator.hide();
        }
        _self.view.addBtn.attr('tabindex', '0');
        _self.view.addBtn.baseTooltip({
            class: "dark",
            position: "top",
            text: i18n('ADD VALUE TOOLTIP'),
            width: 300
        });
        _self.view.addBtn.bind("click", function() {
            _self.parentController.addCondition(_self.view.index());
        });
        _self.view.addBtn.keydown(function(ev) {
            if (ev.keyCode == 32 || ev.keyCode == 13) {
                this.click();
            }
        });

        _self.view.deleteBtn.attr('tabindex', '0');
        _self.view.deleteBtn.baseTooltip({
            class: "dark",
            position: "top",
            text: i18n('DELETE VALUE TOOLTIP'),
            width: 300
        });
        _self.view.deleteBtn.bind("click", function(evt) {
            var conditionRow = $(evt.currentTarget).parents(".condition-wrapper");
            var conditionIndex = conditionRow.index();
            if (conditionRow.siblings().length !== 0) {
                conditionRow.detach();
                _self.parentController.conditionControllers.splice(conditionIndex, 1);
            } else {
                //_self.condition = {}; Limpiar los inputs

            }
        });
        _self.view.deleteBtn.keydown(function(ev) {
            if (ev.keyCode == 32 || ev.keyCode == 13) {
                this.click();
            }
        });
        _self.view.logicOperator.ctrl = _self.view.logicOperator.bindBaseSelect({
            options: [{ key: "AND", name: i18n("AND") },
                { key: "OR", name: i18n("OR") }
            ],
            disableSort: true,
            onChange: function(oldVal, newVal) {},
            tooltip: i18n('LOGIC OPERATOR SELECT TOOLTIP')
        });
        _self.view.operator.ctrl = _self.view.operator.bindBaseSelect({
            options: [{ key: "=", name: "=" },
                { key: "!=", name: "≠" },
                { key: ">", name: ">" },
                { key: ">=", name: "≥" },
                { key: "<", name: "<" },
                { key: "<=", name: "≤" },
                { key: "IN", name: i18n('IN') },
                { key: "NOT IN", name: i18n('NOT IN') },
                { key: "CONTAINS", name: i18n('CONTAINS') },
                { key: "NOT CONTAINS", name: i18n('NOT CONTAINS') },
                { key: "BW", name: i18n('BW') },
                { key: "NOT BW", name: i18n('NOT BW') },
                { key: "FW", name: i18n('FW') },
                { key: "NOT FW", name: i18n('NOT FW') }
            ],
            disableSort: true,
            onChange: function(oldVal, newVal) {
                if (newVal.key === 'IN' || newVal.key === 'NOT IN') {
                    _self.renderListButton();
                } else {
                    _self.renderInput();
                }
            },
            tooltip: i18n('OPERATOR SELECT TOOLTIP')
        });
        _self.view.valueInput.ctrl = _self.view.valueInput.bindBaseInput({
            onChange: function(oldVal, newVal) {},
            tooltip: i18n('CONSTANT INPUT TOOLTIP')
        });
        
        if(data.row){
        	_self.valueList = data.row.listValues || { values: [] };
        	_self.view.logicOperator.ctrl.setKey(data.row.logicOperator);
        	_self.view.operator.ctrl.setKey(data.row.operator);
        	_self.view.valueInput.ctrl.setText(data.row.value);
        }
        _self.initListDialog();
    },
    renderListButton: function() {
        var _self = this;
        _self.view.valueInput.hide();
        _self.view.listBtn.show();
        _self.view.listBtn.bind('click', _self.openListDialog.bind(this));
    },
    renderInput: function() {
        var _self = this;
        _self.view.listBtn.hide();
        _self.view.valueInput.show();
    },
    openListDialog: function() {
        var _self = this;
        _self.dialog.open();
        _self.dialog._dialog.height(350);
        _self.dialog._content.height(260);
    },
    initListDialog: function() {
        var _self = this;
        _self.dialog = $.baseDialog({
            title: i18n('COND LIST DIALOG TITLE'),
            modal: true,
            disableOuterClick: true,
            cssClass: "list-dialog",
            size: 'medium',
            viewName: "app.views.dialogs.filters.ValueList",
            disableOuterClick: true,
            viewData: {
                operatorsOptions: _self.view.operator.ctrl._data.options,
                valueList: _self.valueList.values
            },
            buttons: [{
                name: i18n('CANCEL'),
                isCloseButton: true,
                click: function() {
                    _self.dialog.close();
                },
                tooltip: i18n('CLICK PRESS CANCEL')
            }, {
                name: i18n('APPLY'),
                click: function() {
                    _self.valueList = _self.dialog._innerView.ctrl.getValues();
                    _self.dialog.close();
                },
                tooltip: i18n('CLICK PRESS CONFIRM')
            }]
        });
    },
    validateConditionData: function() {
        var _self = this;
        var data = _self.getData();
        var valid = true;
        if (!data.isFirstRow) {
            valid = _self.view.logicOperator.ctrl.validate();
        }
        valid = _self.view.operator.ctrl.validate();
        return valid;
    },
    getConditionData: function() {
        var _self = this;
        var item = {
            logicOperator: _self.view.logicOperator.ctrl.getKey(),
            value: _self.view.valueInput.ctrl.getText(),
            operator: _self.view.operator.ctrl.getKey(),
            listValues: _self.valueList
        };
        return item;
    }
});
