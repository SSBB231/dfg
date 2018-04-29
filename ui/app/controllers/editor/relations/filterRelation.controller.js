sap.ui.controller("app.controllers.editor.relations.filterRelation", {
    onInit: function() {

    },
    onDataRefactor: function(data) {
        var _self = this;
        _self.conditionRows = data.filter.conditions;
        return $.extend(data, this.data);
    },
    onAfterRendering: function(html) {
        var _self = this;
        _self.view = $(html);
        _self.view.conditionWrapper = _self.view.find(".conditions-wrapper");
        _self.conditionControllers = [];
        _self.filter = _self.getData().filter || {};
        _self.bindElements();
    },
    bindElements: function() {
        var _self = this;
        _self._renderConditionRows(_self.conditionRows);
    },
    _renderConditionRows: function(conditionRows) {
        var _self = this;
        var newConditionRows = [];
        if (!conditionRows) {
            conditionRows = [{}];
        }
        var isFirstRow = false;
        var conditionElements = document.querySelectorAll(".condition-wrapper");
        if (conditionElements.length === 0) {
            isFirstRow = true;
        }
        conditionRows.forEach(function(conditionRow, index) {
            var conditionController = _self.view.conditionWrapper.bindRelationConditionRow({
                row: conditionRow,
                isFirstRow: index === 0 && isFirstRow
            });
            conditionController.parentController = _self;
            _self.conditionControllers.push(conditionController);
        });
        return newConditionRows;
    },
    addCondition: function(index) {
        var _self = this;
        _self._renderConditionRows([{

        }]);
        var newCondition;
        if (index !== undefined) {
            var conditionRows = document.querySelectorAll(".condition-wrapper");
            newCondition = conditionRows[conditionRows.length - 1];
            newCondition.parentNode.insertBefore(conditionRows[index], newCondition);
        }
    },
    getFilterData: function() {
        var _self = this;
        var filter = { conditions: [] };
        for (var i = 0; i < _self.conditionControllers.length; i++) {
            if (_self.conditionControllers[i].validateConditionData()) {
                filter.conditions.push(_self.conditionControllers[i].getConditionData());

            }
        }
        return filter;
    }
});
