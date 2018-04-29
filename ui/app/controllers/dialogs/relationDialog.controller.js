sap.ui.controller('app.controllers.dialogs.relationDialog', {
    onInit: function() {

    },
    onDataRefactor: function(data) {
        var _self = this;


        return $.extend(data, this.data);
    },
    onAfterRendering: function(html) {
        var _self = this;
        _self.view = $(html);
        _self.view.relationsWrapper = _self.view.find('.relations-wrapper');
        _self.relationControllers = [];
        _self.coreServices.updateLayoutObject();
        _self.relationRows = _self.coreServices.layoutObject.relations;
        
        _self.hasHierarchy = _self.coreServices.layoutObject.hasHierarchy;
        if(_self.coreServices.layoutObject.relations && _self.coreServices.layoutObject.relations.length){
            _self.hasHierarchy = _self.coreServices.layoutObject.relations[0].hasHierarchy;
        }
        _self.view.cb = _self.view.find(".cb");

        _self.initServices();
        _self.bindElements();
        _self.services = {};

    },
    initServices: function() {
        var _self = this;
        _self.coreServices.addRelationRow = function(index) {
            _self.addNewRelation(index);
        }
    },
    bindElements: function() {
        var _self = this;
        _self.view.cb.ctrl = _self.view.cb.bindBaseCheckbox({
            id: 1,
            text: i18n("HIERARCHY"),
            tooltip: i18n('HIERARCHY TOOLTIP'),
            onChange: _self.addFilterBtn.bind(this)
        });
        _self.view.cb.ctrl.setChecked(_self.hasHierarchy)
        _self._renderRelationRows(_self.relationRows);
    },
    addFilterBtn(oldValue, newValue) {
        var _self = this;
        _self.hasHierarchy = newValue;
        for (var i = 0; i < _self.relationControllers.length; i++) {
            _self.relationControllers[i].showFilterBtn(newValue);
        }
    },
    addRelation: function(index) {
        var _self = this;
        _self.addNewRelation(index);
    },
    addNewRelation: function(index) {
        var _self = this;
        _self._renderRelationRows([{

        }]);
        var newRelation;
        if (index !== undefined) {
            var relationRows = document.querySelectorAll(".relation-wrapper");
            newRelation = relationRows[relationRows.length - 1];

            newRelation.parentNode.insertBefore(newRelation, relationRows[index].nextSibling);
        }
    },
    _renderRelationRows: function(relationRows) {
        var _self = this;
        var newRelationRows = [];
        if (!relationRows) {
            relationRows = [{}];
        }
        relationRows.forEach(function(relationRow) {
            var relationController = _self.view.relationsWrapper.bindRelationRow({
                row: relationRow,
                services: _self.services
            });

            relationController.parentController = _self;
            _self.relationControllers.push(relationController);
            newRelationRows.push(relationController);
            if (_self.hasHierarchy) {
                relationController.showFilterBtn(true);
            } else {
                relationController.showFilterBtn(false);
            }
        });
        return relationRows;
    },
    getRelations: function() {
        var _self = this;
        var relations = [];
        for (var i = 0; i < _self.relationControllers.length; i++) {
            var relation = _self.relationControllers[i];
            if (relation.isValid()) {
                relations.push(relation.getRelation());
            }
        }
        return {
            relations: relations,
            hasHierarchy: _self.hasHierarchy
        };
    }

});
