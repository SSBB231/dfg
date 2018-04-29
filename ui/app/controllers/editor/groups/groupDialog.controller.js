/*global i18n*/
sap.ui.controller("app.controllers.editor.groups.groupDialog", {
    onInit: function() {},
    onAfterRendering: function(html) {
        var _self = this;
        _self.view = $(html);
        _self.view.blockSelect = _self.view.find(".block-select");
        _self.view.recordSelect = _self.view.find(".record-select");
        _self.view.structureSelect = _self.view.find(".structure-select");
        _self.view.newGroupBtn = _self.view.find(".createGroupBtn");
        _self.view.groupContainer = _self.view.find(".groups-rows-container");
        _self.globalGroups = _self.coreServices.layoutObject.groups;
        var positions = _self.coreServices.layoutObject.positions;
        _self.groups = [];
        _self.blocks = [];
        _self.last_groupID = 0;
        for (var i = 0; i < positions.length; i++) {
            var tempBlock = JSON.parse(JSON.stringify(_self.coreServices.layoutObject.blocks[positions[i]]));
            tempBlock.key = positions[i];
            tempBlock.records = [];
            var nameCount = {};
            var blockPositions = tempBlock.positions;
            for (var j = 0; j < blockPositions.length; j++) {
                var tempRecord = JSON.parse(JSON.stringify(_self.coreServices.layoutObject.blocks[positions[i]].records[blockPositions[j]]));
                tempRecord.key = blockPositions[j];
                if (!nameCount[tempRecord.name]) {
                    nameCount[tempRecord.name] = 1;
                } else {
                    nameCount[tempRecord.name]++;
                }
                if (nameCount[tempRecord.name] !== 1) {
                    tempRecord.name += "(" + nameCount[tempRecord.name] + ")";
                }
                tempBlock.records.push(tempRecord);
            }
            _self.blocks.push(tempBlock);
        }
        _self.bindComponents();
        _self.bindEvents();
    },
    bindComponents: function() {
        var _self = this;
        _self.view.blockSelect.ctrl = _self.view.blockSelect.bindBaseSelect({
            options: _self.blocks,
            disableSort: true,
            placeholder: i18n("SELECT BLOCK PLACEHOLDER"),
            tooltip: i18n("SELECT BLOCK"),
            onChange: _self.onChangeBlock.bind(this)
        });
        _self.view.recordSelect.ctrl = _self.view.recordSelect.bindBaseSelect({
            options: [],
            isDisabled: true,
            isLoading: true,
            placeholder: i18n("SELECT RECORD PLACEHOLDER"),
            tooltip: i18n("SELECT RECORD")
        });
        _self.view.structureSelect.ctrl = _self.view.structureSelect.bindBaseSelect({
            options: [],
            isDisabled: true,
            isLoading: true,
            placeholder: i18n("SELECT STRUCTURE PLACEHOLDER"),
            tooltip: i18n("SELECT STRUCTURE")
        });
        _self.view.newGroupBtn.bindBaseTooltip({
            text: i18n("ADD GROUP BTN TOOLTIP"),
            position: 'top',
            width: 300,
            class: "dark"
        });
    },
    bindEvents: function() {
        var _self = this;
        _self.view.newGroupBtn.bind("click", function() {
            var flag = _self.fields !== undefined;
            if (flag) {
                flag = Object.keys(_self.fields).length > 0;
            }
            if (flag) {
                _self.openGroupBuilder();
            } else {
                if (_self.view.blockSelect.ctrl.getKey() === undefined || _self.view.recordSelect.ctrl.getKey() === undefined || _self.view.structureSelect.ctrl.getKey()) {
                    $.baseToast({
                        text: i18n("FILL ALL FIELDS"),
                        type: 'W'
                    });
                } else {
                    $.baseToast({
                        text: i18n("NO GROUP FIELDS"),
                        type: 'W'
                    });
                }
            }
        });
    },
    bindGroupRow: function(group) {
        var _self = this;
        var groupRow = document.createElement("div");
        groupRow.setAttribute("class", "groupRow");
        groupRow.setAttribute("data-id", group.ID);
        var groupName = document.createElement("label");
        groupName.textContent = group.name;
        var icons = document.createElement("div");
        var editDiv = document.createElement("div");
        editDiv.setAttribute("class", "editIcon");
        var deleteDiv = document.createElement("div");
        deleteDiv.setAttribute("class", "deleteIcon");
        icons.setAttribute("class", "row-icons");
        var editIcon = document.createElement("span");
        editIcon.setAttribute("class", "icon icon-font-Formatting-and-Tool icon-pensil icon-btn btn");
        $(editIcon).bind("click", function() {
            var tempGroup;
            for (var i = 0; i < _self.groups.length; i++) {
                if (_self.groups[i].ID === group.ID) {
                    tempGroup = _self.groups[i];
                    break;
                }
            }
            _self.editGroup(tempGroup);
        });
        $(editDiv).bindBaseTooltip({
            text: i18n("EDIT GROUP TOOLTIP"),
            class: "dark",
            position: "top",
            width: 300
        });
        editDiv.appendChild(editIcon);
        var deleteIcon = document.createElement("span");
        deleteIcon.setAttribute("class", "icon icon-font-Sign-and-Symbols icon-persign icon-btn btn");
        $(deleteIcon).bind("click", function() {
            for (var i = 0; i < _self.groups.length; i++) {
                if (_self.groups[i].ID === group.ID) {
                    _self.groups.splice(i, 1);
                    groupRow.remove();
                    break;
                }
            }
        });
        $(deleteDiv).bindBaseTooltip({
            text: i18n("DELETE GROUP TOOLTIP"),
            class: "dark",
            position: "top",
            width: 300
        });
        deleteDiv.appendChild(deleteIcon);
        icons.appendChild(editDiv);
        icons.appendChild(deleteDiv);
        groupRow.appendChild(groupName);
        groupRow.appendChild(icons);
        _self.view.groupContainer.append(groupRow);
    },
    openGroupBuilder: function(currentGroup) {
        var _self = this;
        var groupDialog = $.baseDialog({
            title: i18n("GROUP"),
            modal: true,
            size: "wide",
            outerClick: 'disabled',
            viewName: "app.views.editor.groups.groupContainer",
            viewData: {
                fields: _self.fields,
                group: currentGroup,
                idStructure: _self.view.structureSelect.ctrl.getKey()
            },
            buttons: [{
                name: i18n("CANCEL"),
                isCloseButton: true,
                tooltip: i18n("CLICK PRESS CANCEL")
            }, {
                name: i18n("APPLY"),
                tooltip: i18n("CLICK PRESS APPLY"),
                click: function() {
                    var innerCtrl = groupDialog.getInnerController();
                    if (innerCtrl.validateGroup()) {
                        if (currentGroup) {
                            for (var i = 0; i < _self.groups.length; i++) {
                                if (_self.groups[i].ID === currentGroup.ID) {
                                    currentGroup = innerCtrl.getGroupData();
                                    var nameLabel = document.querySelectorAll('.groupRow[data-id="' + _self.groups[i].ID + '"] label')[0];
                                    nameLabel.textContent = currentGroup.name;
                                    currentGroup.ID = _self.groups[i].ID;
                                    _self.groups[i] = currentGroup;
                                    break;
                                }
                            }
                        } else {
                            var group = innerCtrl.getGroupData();
                            group.ID = _self.last_groupID;
                            _self.last_groupID++;
                            _self.groups.push(group);
                            _self.bindGroupRow(group);
                        }
                        groupDialog.close();
                    } else {
                        $.baseToast({
                            text: i18n("INVALID GROUP"),
                            type: 'W'
                        });
                    }
                }
            }]
        });
        groupDialog.open();
    },
    editGroup: function(group) {
        var _self = this;
        console.log(group)
        _self.openGroupBuilder(group);
    },
    onChangeBlock: function(oldVal, newVal) {
        var _self = this;
        _self.view.groupContainer.empty();
        _self.groups = [];
        _self.view.recordSelect.empty();
        _self.view.recordSelect.ctrl = _self.view.recordSelect.bindBaseSelect({
            options: newVal.records,
            disableSort: true,
            placeholder: i18n("SELECT RECORD PLACEHOLDER"),
            tooltip: i18n("SELECT RECORD"),
            onChange: _self.onChangeRecord.bind(this)
        });
    },
    onChangeRecord: function(oldVal, newVal) {
        var _self = this;
        var structureOptions = [];
        _self.view.groupContainer.empty();
        _self.groups = [];
        var addedStructure = [];
        for (var i = 0; i < newVal.idStructure.length && Object.keys(newVal.columns).length > 0; i++) {
            if (_self.coreServices.structure[newVal.idStructure[i]] && addedStructure.indexOf(newVal.idStructure[i] + "") === -1) {
                structureOptions.push({
                    key: newVal.idStructure[i],
                    name: _self.coreServices.structure[newVal.idStructure[i]].title,
                    fields: {}
                });
                addedStructure.push(newVal.idStructure[i] + "");
                for (var j in newVal.columns) {
                    if (newVal.columns[j].fieldId !== null && newVal.columns[j].fieldId) {
                        if (Number(newVal.columns[j].idStructure) === Number(newVal.idStructure[i])) {
                            var field = _self.coreServices.structure[newVal.idStructure[i]].fields[newVal.columns[j].fieldId];
                            structureOptions[structureOptions.length - 1].fields[j] = {
                                label: newVal.columns[j].uniqueId ? field.label + " (" + (parseInt(newVal.columns[j].uniqueId, 10) + 1) + ")" : field.label,
                                type: field.simpleType,
                                hanaName: field.hanaName
                            };
                        }
                    } else {
                        if (newVal.columns[j].formula) {
                            if (Array.isArray(newVal.columns[j].idStructure)) {
                                var found = false;
                                for (var s = 0; s < newVal.columns[j].idStructure.length; s++) {
                                    if (Number(newVal.columns[j].idStructure[s]) === Number(newVal.idStructure[i])) {
                                        found = true;
                                        break;
                                    }
                                }
                                if (found) {
                                    structureOptions[structureOptions.length - 1].fields[j] = {
                                        label: newVal.columns[j].formula.label,
                                        type: newVal.columns[j].formula.type === "NVARCHAR" ? "STRING" : (newVal.columns[j].formula.type === "DECIMAL" ? "NUMBER" : "TIME"),
                                        hanaName: newVal.columns[j].formula.label
                                    };
                                }
                            } else if (Number(newVal.columns[j].idStructure) === Number(newVal.idStructure[i])) {
                                structureOptions[structureOptions.length - 1].fields[j] = {
                                    label: newVal.columns[j].formula.label,
                                    type: newVal.columns[j].formula.type === "NVARCHAR" ? "STRING" : (newVal.columns[j].formula.type === "DECIMAL" ? "NUMBER" : "TIME"),
                                    hanaName: newVal.columns[j].formula.label
                                };
                            }
                        }
                    }
                }
                if (Object.keys(structureOptions[structureOptions.length - 1].fields).length === 0) {
                    structureOptions.splice(structureOptions.length - 1, 1);
                }
            }
        }

        _self.view.structureSelect.empty();
        _self.view.structureSelect.ctrl = _self.view.structureSelect.bindBaseSelect({
            options: structureOptions,
            disableSort: true,
            placeholder: i18n("SELECT STRUCTURE PLACEHOLDER"),
            tooltip: i18n("SELECT STRUCTURE"),
            onChange: _self.onChangeStructure.bind(this)
        });
    },
    onChangeStructure: function(oldVal, newVal) {
        var _self = this;
        _self.fields = newVal.fields;
        _self.view.groupContainer.empty();
        _self.groups = [];
        console.log(_self.globalGroups)
        if (_self.globalGroups.blocks[_self.view.blockSelect.ctrl.getKey()]) {
            if (_self.globalGroups.blocks[_self.view.blockSelect.ctrl.getKey()].records[_self.view.recordSelect.ctrl.getKey()]) {
                if (_self.globalGroups.blocks[_self.view.blockSelect.ctrl.getKey()].records[_self.view.recordSelect.ctrl.getKey()].structures[newVal.key]) {
                    _self.groups = _self.globalGroups.blocks[_self.view.blockSelect.ctrl.getKey()].records[_self.view.recordSelect.ctrl.getKey()].structures[newVal.key].groups;
                    _self.last_groupID = _self.globalGroups.blocks[_self.view.blockSelect.ctrl.getKey()].records[_self.view.recordSelect.ctrl.getKey()].structures[newVal.key].last_groupID;
                    for (var i = 0; i < _self.groups.length; i++) {
                        _self.bindGroupRow(_self.groups[i]);
                    }
                }
            }
        }
    },
    validate: function() {
        var _self = this;
        if (!_self.view.blockSelect.ctrl.getKey()) {
            return false;
        }
        if (!_self.view.recordSelect.ctrl.getKey()) {
            return false;
        }
        if (!_self.view.structureSelect.ctrl.getKey()) {
            return false;
        }
        return true;
    },
    getGroups: function() {
        var _self = this;
        var block = _self.view.blockSelect.ctrl.getKey();
        var record = _self.view.recordSelect.ctrl.getKey();
        var structureId = _self.view.structureSelect.ctrl.getKey();
        return {
            block: block,
            record: record,
            structureId: structureId,
            groups: _self.groups,
            last_groupID: _self.last_groupID
        };
    }
});