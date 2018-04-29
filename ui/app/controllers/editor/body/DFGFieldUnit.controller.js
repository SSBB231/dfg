sap.ui.controller("app.controllers.editor.body.DFGFieldUnit", {

    onInit: function() {},

    onAfterRendering: function(html) {
        var _self = this;
        _self.view = $(html);

        _self.view.find('.field-close').click(function(e) {
            _self.removeField();
        });
        _self.view.label = _self.view.find('.field-label');

        _self.view.label.click(function(e) {
            var idBlock = _self._data.blockId;
            var idRecord = _self._data.recordId;
            var idField = _self.getData().fieldData.id;
            var formula = false;
            var column = _self.coreServices.layoutObject.blocks[idBlock].records[idRecord].columns[idField];
            if (column.formula) {
                formula = true;
            }
            var isReferenceDate = _self._data.fieldData.id === "initialDateReference" || _self._data.fieldData.id === "finalDateReference";

            _self.editParameter();
            _self.editVersion();

            if (formula) {
                _self.editFormula();
            } else if(_self._data.fieldData.id.indexOf('recordsTotals') !== -1){
                _self.editRecordsTotals();
            }else if(_self._data.fieldData.id.indexOf('blockTotal') !== -1){
                _self.editBlocksTotal();
            }else if (_self._data.fieldData.id.indexOf('recordId') !== -1) {
                _self.editIdRecord();
            } else if (_self._data.fieldData.id.indexOf('out') !== -1) {
                _self.editDfgOutput(); 
            } else if (column.fixedManualField) {
                _self.editFixedManualField(); 
            } else if (column.fixedField) {
                _self.editFixedField();
            } else if (_self._data.fieldData.id.indexOf('sp') !== -1 || _self._data.fieldData.id.match(new RegExp(/DTE[0-9]*/g)) || _self._data.fieldData.id.match(new RegExp(/HRE[0-9]*/g)) || column.isInitialDateReference || column.isFinalDateReference) {
                _self.editReferencePeriod(idBlock, idRecord, idField);
            } else if (column.sequenceField){
                _self.relation = column.sequenceField.relation;
                _self.recordSequence = column.sequenceField.recordSequence;
                _self.lineSequence = column.sequenceField.lineSequence;
                _self.editSequenceField(idBlock,idRecord,idField,_self);
            } else if (column.listField){
                _self.editListField(idBlock,idRecord,idField,column.listField);
            }else if(!isReferenceDate) {
                _self.editFiller();
            }
        });
        this.alive = true;
        $('.overlay').remove();
        _self.renderTooltip();
    },
    renderTooltip: function() {
        var _self = this;
        if (_self._data.fieldData.isOutputField) {
            _self.view.ctrl = _self.view.baseTooltip({
                class: "dark",
                position: "right",
                width: 300,
                text: _self._data.fieldData.metadata.sourceId + ' - ' + _self._data.fieldData.metadata.reportName
            });
        } else if (!isNaN(_self._data.fieldData.idStructure)) {
            _self.view.ctrl = _self.view.baseTooltip({
                class: "dark",
                position: "right",
                width: 300,
                text: _self.coreServices.structure[_self._data.fieldData.idStructure].title
            });
        }
    },
    editVersion: function() {
        var _self = this;

        if (_self.getData().fieldData.id.indexOf("v") > -1) {
            var _self = this;
            _self.coreServices.updateLayoutObject();
            _self.coreServices.openVersionDialog(_self.getData().blockId, _self.getData().recordId, _self.getData().fieldData.id);

            var block = _self.coreServices.versionDialog.getInnerController().getVersionData().blocks[_self.getData().blockId];
            var record = block.records[_self.getData().recordId];
            var param = record.columns[_self.getData().fieldData.id].version;


            _self.coreServices.inputLabel.setText(param.label);
        }
    },

    editParameter: function() {
        var _self = this;
        if (_self.getData().fieldData.id.match(/^m[0-9]*$/g)) {
            _self.editManualParameter();
        }

    },
    editReferencePeriod: function(idBlock, idRecord, idField) {
        var _self = this;
        _self.coreServices.openFormatDialog(idBlock, idRecord, idField,false,_self,idField.indexOf("sp") !== -1);
    },
    setLabel: function(newText) {
        var _self = this;
        _self._data.fieldData.label = newText;
        _self.view.label.html(newText);
    },
    setIdRecordConfig: function(newIdConfig) {
        var _self = this;
        _self.typeConfigIdRecord = {
            NONE: 0,
            ONLY_BLOCK: 1,
            ONLY_RECORD: 2,
            BOTH: 3,
        };
        var block = _self.coreServices.layoutObject.blocks[_self.getData().blockId];
        var record = block.records[_self.getData().recordId];
        var column = record.columns[_self.getData().fieldData.id];
        if (!column.hasOwnProperty("recordId")) {
            return;
        }
        switch (newIdConfig) {
            case _self.typeConfigIdRecord.ONLY_BLOCK:
                column.recordId = {
                    blockId: block.name
                };
                this.setLabel("ID " + i18n("BLOCK"));
                break;
            case _self.typeConfigIdRecord.ONLY_RECORD:
                column.recordId = record.name;
                this.setLabel("ID " + i18n("RECORD"));
                break;
            case _self.typeConfigIdRecord.BOTH:
                column.recordId = {
                    recordId: record.name,
                    blockId: block.name
                };
                this.setLabel("ID " + i18n("BLOCK") + " + ID " + i18n("RECORD"));
                break;

        }
    },
    editFiller: function() {
        var _self = this;


        if (_self.getData().fieldData.id.match(/^f[0-9]*$/g)) {
            _self.coreServices.updateLayoutObject();
            _self.coreServices.openFillerDialog(_self.getData().blockId, _self.getData().recordId, _self.getData().fieldData.id, _self);

            var block = _self.coreServices.fillerDialog.getInnerController().getFillerData().blocks[_self.getData().blockId];
            var record = block.records[_self.getData().recordId];
            var param = record.columns[_self.getData().fieldData.id].filler;

            _self.coreServices.inputLabel.setText(param.value);
            _self.coreServices.inputName.setText(param.name);
        }
    },
    editSequenceField: function(idBlock,idRecord,idField,sequenceField) {
        var _self = this;
        if (_self.getData().fieldData.id.match(/^sf[0-9]*$/g)) {
            _self.coreServices.updateLayoutObject();
            _self.coreServices.openSequenceFieldDialog(idBlock,idRecord,idField,sequenceField);
        }
    },
    editListField: function(idBlock, idRecord, idField, listField){
        var _self = this;
        if(_self.getData().fieldData.id.match(/^lf[0-9]*$/g)){
            _self.coreServices.updateLayoutObject();
            _self.coreServices.openListFieldDialog(idBlock,idRecord,idField,_self);
        } 
    },
    editFixedManualField: function() {
        var _self = this;
        if (_self.getData().fieldData.id.match(/^fmf[0-9]*$/g)) {
            _self.coreServices.updateLayoutObject();
            _self.coreServices.openFixedManualFieldDialog(_self.getData().blockId, _self.getData().recordId, _self.getData().fieldData.id, _self);
            var column = _self.coreServices.layoutObject.blocks[_self.getData().blockId].records[_self.getData().recordId].columns[_self.getData().fieldData.id];
            _self.coreServices.fixedManualFieldDialog.getInnerController().setFixedManualFieldData(column.fixedManualField);
        }
    },
    editFixedField: function() {
        var _self = this;
        if (_self.getData().fieldData.id.match(/^fxf[0-9]*$/g).length > -1) {
            _self.coreServices.updateLayoutObject();
            _self.coreServices.openFixedFieldDialog(_self.getData().blockId, _self.getData().recordId, _self.getData().fieldData.id, _self);

            var block = _self.coreServices.fixedFieldDialog.getInnerController().getFixedFieldData(true).blocks[_self.getData().blockId];
            var record = block.records[_self.getData().recordId];
            var fixedField = record.columns[_self.getData().fieldData.id].fixedField;
            _self.coreServices.fixedFieldDialog.getInnerController().setFixedFieldData(fixedField);


        }
    },
    editIdRecord: function() {
        var _self = this;
        var _data = _self._data;
        _self.coreServices.openIdRecordDialog(_data.blockId, _data.recordId, _data.fieldData.id, _self);
    },
    editManualParameter: function() {
        var _self = this;
        _self.coreServices.updateLayoutObject();
        _self.coreServices.openParamDialog(_self.getData().blockId, _self.getData().recordId, _self.getData().fieldData.id, _self);

        var block = _self.coreServices.parametroDialog.getInnerController().getParamManualData().blocks[_self.getData().blockId];
        var record = block.records[_self.getData().recordId];
        var param = record.columns[_self.getData().fieldData.id].manualParam;
        
        _self.coreServices.inputLabel.setText(param.label);
        _self.coreServices.inputType.setKey(param.type);
        _self.coreServices.inputLength.setText(param.length);
        _self.coreServices.parametroDialog.getInnerController().bindParamInfo(param);
    },

    editDfgOutput: function() {
        var _self = this;
        _self.coreServices.updateLayoutObject();
        _self.coreServices.openDfgOutputDialog(_self._data.blockId, _self._data.recordId, _self._data.fieldData.id, _self);
    },

    editFormula: function() {
        var _self = this;
        _self.coreServices.updateLayoutObject();
        _self.coreServices.openFormulaDialog(_self.getData().blockId, _self.getData().recordId, _self.getData().fieldData.id, true, _self);
    },
    editRecordsTotals: function(){
        var _self = this;
        _self.coreServices.updateLayoutObject();
        _self.coreServices.openTotalSelectionDialog(_self.getData().blockId, _self.getData().recordId, _self.getData().fieldData.id, true, true);
    },
    editBlocksTotal: function(){
        var _self = this;
        _self.coreServices.updateLayoutObject();
        _self.coreServices.openTotalSelectionDialog(_self.getData().blockId, _self.getData().recordId, _self.getData().fieldData.id, false, true);
    },
    /* This should only remove a field from the columns object if 
       it doesn't exists on the positions array.*/
    removeField: function() {
        var _self = this;
        var canDelete = true;
        var blockName =  _self.coreServices.layoutObject.blocks[_self.getData().blockId].name;
        var recordName =  _self.coreServices.layoutObject.blocks[_self.getData().blockId].records[_self.getData().recordId].name;
        var fieldName = $.globalFunctions.getColumnName( _self.coreServices.layoutObject.blocks[_self.getData().blockId].records[_self.getData().recordId].columns[_self.getData().fieldData.id]);
        var field = _self.coreServices.layoutObject.blocks[_self.getData().blockId].records[_self.getData().recordId].columns[_self.getData().fieldData.id]
        var currentRecord = _self.coreServices.layoutObject.blocks[_self.getData().blockId].records[_self.getData().recordId];
        var positions = currentRecord.positions;
        if (_self.coreServices.layoutObject.groups) {
            if (_self.coreServices.layoutObject.groups.blocks[_self.getData().blockId]) {
                if (_self.coreServices.layoutObject.groups.blocks[_self.getData().blockId].records[_self.getData().recordId]) {
                    if (_self.coreServices.layoutObject.groups.blocks[_self.getData().blockId].records[_self.getData().recordId].structures[field.idStructure]) {
                        var group = _self.coreServices.layoutObject.groups.blocks[_self.getData().blockId].records[_self.getData().recordId].structures[field.idStructure].groups;
                        console.log(group)
                        if (group) {
                            for (var i = 0; i < group.length; i++) {

                                if (group[i].groupBy.indexOf(Number(field.fieldId)) > -1 || group[i].totals.indexOf(Number(field.fieldId)) > -1) {
                                    $.baseToast({
                                        text: i18n("FIELD IN GROUP WARNING"),
                                        type: 'W'
                                    });
                                    canDelete = false;
                                    break;
                                }
                            }

                        }

                    }
                }
            }
        }
        if (canDelete) {
            _self.view.remove();
            _self.coreServices.lastChanges.push({message:{
                enus: "A field was removed",
                ptrbr: "Um campo foi removido"
            },
            blockName: blockName, recordName: recordName, fieldName: fieldName, type: 6});  
            currentRecord.positions.splice(currentRecord.positions.indexOf(_self.getData().fieldData.id),1);
            delete _self.coreServices.blocks[_self.getData().blockId].records[_self.getData().recordId].columns[_self.getData().fieldData.id];

            if (field) {
                if (field.fieldId)
                    _self.coreServices.deleteCascadeOutputs({
                        blockId: _self.getData().blockId,
                        recordId: _self.getData().recordId,
                        fieldId: field.fieldId
                    });
                if (field.isDFGOutput)
                    _self.coreServices.removeFromOutPutList(_self.getData().fieldData.id);
                if (field.manualParam)
                    _self.coreServices.removeFromManualParamList(_self.getData().fieldData.id);
                // if(false){
                delete _self.coreServices.layoutObject.blocks[_self.getData().blockId].records[_self.getData().recordId].columns[_self.getData().fieldData.id];
        
                var allOutputs = _self.coreServices.layoutObject.blocks[_self.getData().blockId].records[_self.getData().recordId].outputs;
                if (allOutputs !== undefined) {
                    for (var i = 0; i < allOutputs.length; i++) {
                        if (allOutputs[i] === _self.getData().fieldData.id) {
                            _self.coreServices.layoutObject.blocks[_self.getData().blockId].records[_self.getData().recordId].outputs.splice(i, 1);
                            break;
                        }
                    }
                }
            }
            this.alive = false;

            var target = _self.coreServices;

            var fieldId = _self.getData().fieldData.id;
            if (typeof fieldId === "string") {
                if (fieldId.charAt(0) === "r") {
                    var rules = currentRecord.rules;
                    fieldId = parseInt(fieldId.substring(1, fieldId.length));
                    for (var i = 0; i < target.rulesObj.length; i++) {
                        if (parseInt(Object.keys(target.rulesObj[i])[0]) === fieldId) {
                            target.rulesObj.splice(target.rulesObj.indexOf(target.rulesObj[i]), 1);
                            delete rules[fieldId];
                        }
                    }
                    currentRecord.rules = rules;
                }
            }
            _self.coreServices.hasChanged = true;
            _self.coreServices.layoutObject.blocks[_self.getData().blockId].records[_self.getData().recordId] = _self.updateRecordStructure(currentRecord);
        }
    },

    updateRecordStructure: function(currentRecord) {
        var _self = this;
        if (_self.coreServices.layoutObject.structure.length > 1) {
            var structures = [];
            for (var column in currentRecord.columns) {
                if (currentRecord.columns[column].hasOwnProperty("idStructure")) {
                    if (!isNaN(Number(currentRecord.columns[column].idStructure)) && structures.indexOf(Number(currentRecord.columns[column].idStructure)) === -1) {
                        structures.push(Number(currentRecord.columns[column].idStructure));
                    }
                }
            }
            currentRecord.idStructure = structures;
        }
        if (Object.keys(currentRecord.positions).length === 0) {
            currentRecord.idStructure = [];
            currentRecord.columns = {};
            currentRecord.outputs = [];
            currentRecord.rules = {};
            currentRecord.idDistinct = false;
        }
        return currentRecord;
    }
});
