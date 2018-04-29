sap.ui.controller("app.controllers.editor.groups.groupContainer", {
    onInit: function() {

    },
    onAfterRendering: function(html) {
        var _self = this;
        _self.view = $(html);
        _self.view.fieldsPanel = _self.view.find(".fields-panel-container");
        _self.view.nameInput = _self.view.find(".name-input");
        _self.view.groupByDateBtn = _self.view.find(".date-group");
        _self.view.groupDrop = _self.view.find(".groupBy-droppable");
        _self.view.totalDrop = _self.view.find(".totals-droppable");
        _self.bindComponents();
    },
    bindComponents: function() {
        var _self = this;
        var data = _self.getData();
        var fields = data.fields;
        var group = data.group;
        _self.view.nameInput.ctrl = _self.view.nameInput.bindBaseInput({
            tooltip: i18n("FILL NAME"),
            placeholder: i18n("FILL NAME PLACEHOLDER"),
            required: true
        });
        _self.coreServices.groupFields = fields;
        _self.coreServices.validateTotalType = _self.validateTotalType;
        _self.view.fieldsPanel.bindFieldPanel({ fields: fields });
        _self.addDroppable();
        _self.view.groupByDateBtn.baseTooltip({
            class: 'dark',
            position: 'top',
            text: i18n('GROUP BY DATE TOOLTIP')
        });
        _self.view.groupByDateBtn.bind("click",_self.openGBDateDialog.bind(_self));
        if (group) {
            _self.bindGroupData();
        }
    },
    bindGroupData: function() {
        var _self = this;
        var data = _self.getData();
        var group = data.group;
        var groupDropSelector = document.querySelectorAll('.groupBy-droppable')[0];
        var totalDropSelector = document.querySelectorAll('.totals-droppable')[0];
        _self.view.nameInput.ctrl.setText(group.name);
        for (var i = 0; i < group.groupBy.length; i++) {
            if (document.querySelectorAll('.group-field[data-id="' + group.groupBy[i] + '"]')[0])
                groupDropSelector.appendChild(document.querySelectorAll('.group-field[data-id="' + group.groupBy[i] + '"]')[0]);
        }
        for (var i = 0; i < group.totals.length; i++) {
            if (document.querySelectorAll('.group-field[data-id="' + group.totals[i] + '"]')[0])
                totalDropSelector.appendChild(document.querySelectorAll('.group-field[data-id="' + group.totals[i] + '"]')[0]);
        }
        _self.groupByDate = group.groupByDate;

    },
    addDroppable: function() {
        var _self = this;
        var groupDropSelector = document.querySelectorAll('.groupBy-droppable')[0];
        var totalDropSelector = document.querySelectorAll('.totals-droppable')[0];

        groupDropSelector.addEventListener('dragenter', function(e) {

            this.classList.add('over');
            e.preventDefault();
            return true;
        }, false);
        groupDropSelector.addEventListener('drop', function(e) {

            this.classList.remove('over');

            groupDropSelector.appendChild(document.querySelectorAll('.group-field[data-id="' + _self.coreServices.currentFieldDragId + '"]')[0]);
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            return false;
        }, false);
        groupDropSelector.addEventListener('dragleave', function(e) {
            if (e.toElement.parentNode.className !== "groupBy-droppable over") {
                this.classList.remove('over');
            }

            if (e.stopPropagation) {
                e.stopPropagation();
            }
            return false;
        }, false);
        groupDropSelector.addEventListener('dragover', function(e) {

            if (e.preventDefault) {
                e.preventDefault();
            }
            e.dataTransfer.dropEffect = 'move';
            return false;
        }, false);
        totalDropSelector.addEventListener('dragenter', function(e) {
            this.classList.add('over');
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            return false;
        }, false);
        totalDropSelector.addEventListener('drop', function(e) {
            this.classList.remove('over');

            if (_self.coreServices.validateTotalType(_self.coreServices.currentFieldDragId)) {
                totalDropSelector.appendChild(document.querySelectorAll('.group-field[data-id="' + _self.coreServices.currentFieldDragId + '"]')[0]);

            } else {
                $.baseToast({
                    text: i18n("INVALID FIELD TYPE"),
                    type: "W"
                });
            }
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            return false;
        }, false);
        totalDropSelector.addEventListener('dragleave', function(e) {

            if (e.toElement.parentNode.className !== "totals-droppable over")
                this.classList.remove('over');
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            return false;
        }, false);
        totalDropSelector.addEventListener('dragover', function(e) {

            if (e.preventDefault) {
                e.preventDefault();
            }
            e.dataTransfer.dropEffect = 'move';
            return false;
        }, false);
    },
    validateTotalType: function(fieldId) {
        var _self = this;
        if (_self.groupFields[fieldId].type === "NUMBER") {
            return true;
        }
        return false;
    },
    validateGroup: function() {
        var _self = this;
        if (_self.view.nameInput.ctrl.getText() === "") {
            return false;
        }

        if (_self.view.totalDrop.find(".group-field").length === 0 && _self.view.groupDrop.find(".group-field").length === 0 ) {
            return false;
        }
        return true;
    },
    getGroupData: function() {
        var _self = this;
        var _data = _self.getData();
        var groupData = {
            groupBy: [],
            groupByDate: _self.groupByDate,
            totals: []
        };
        if(_data.group){
            groupData.filters = _data.group.filters;
            groupData.columnFilters = _data.group.columnFilters;
        }
        groupData.name = _self.view.nameInput.ctrl.getText();
        var groupBys = document.querySelectorAll('.groupBy-droppable .group-field');
        [].forEach.call(groupBys, function(groupBy) {
            groupData.groupBy.push(groupBy.getAttribute('data-id'));
        });
        var totals = document.querySelectorAll('.totals-droppable .group-field');
        [].forEach.call(totals, function(groupBy) {
            groupData.totals.push(groupBy.getAttribute('data-id'));
        });
        return groupData;
    },
    openGBDateDialog: function(){
        var _self = this;
        var dialog = $.baseDialog({
            title: i18n("DATE GROUPING"),
            modal: true,
            size: "medium",
            disableOuterClcik: true,
            viewName: "app.views.editor.groups.groupByDate",
            viewData: {
                idStructure: _self.getData().idStructure,
                groupByDate: _self.groupByDate
            },
            buttons: [{
                name: i18n("CANCEL"), 
                isCloseButton: true,
                tooltip: i18n("CLICK PRESS CANCEL")
                
            },{
                name: i18n("APPLY"),
                tooltip: i18n("CLICK PRESS APPLY"),
                click: function(){
                    var innerCtrl = dialog.getInnerController();
                    if(innerCtrl.isValid()){
                        _self.groupByDate = innerCtrl.getGroupByDate();
                        dialog.close();
                    }else{
                        $.baseToast({
                            text: i18n("FILL ALL FIELDS"),
                            type: "W"
                        });
                    }
                }
            }]
        });
        dialog.open();
    }
});
