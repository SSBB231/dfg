/*global i18n*/
sap.ui.controller("app.controllers.editor.body.DFGRegisterUnit", {
    onDataRefactor: function(data) {
        return $.extend(data, this.data);
    },
    onInit: function() {
        this.data = {
            subRegister: {
                text: i18n('ADD SUBRECORD'),
                class: "btn-text",
                iconFont: "Sign-and-Symbols",
                icon: "plussign",
                hasTransition: false
            }
        };
    },
    onAfterRendering: function(html) {
        var _self = this;
        _self.loader = $("body").baseLoader({
            modal: true
        });
        _self.layoutObject = _self.coreServices.layoutObject;
        _self.unique = false;
        this.view = $(html);
        $(this.view).data('id', _self.getData().parentRecordId);
        this.view.input = this.view.find('.register-head .register-input');
        this.view.addRegisterBtn = this.view.find('.register-body .btn-add-subregister');
        this.view.registerList = this.view.find('.register-body .register-list-wrapper');
        this.view.fieldList = this.view.find('.register-body .field-list-wrapper');
        this.view.expandBtn = this.view.find('.register-head .btn-expand');
        this.view.collapseBtn = this.view.find('.register-head .btn-collapse');
        this.view.deleteBtn = this.view.find('.register-head .delete-record');
        this.view.addRuleBtn = this.view.find('.btn-add-regra');
        this.view.orderByBtn = this.view.find(".btn-add-order-by");
        this.view.addStructureRelationBtn = this.view.find(".btn-add-structure-relation");
        this.columns = {};
        this.businessRules = [];
        this.renderFields();
        this.renderSubRecord();
        this.bindElements();
        this.bindEvents();
        this.addServices();
    },

    /* This method is used to render a sub-record that is saved on the database.
       It binds the correct sub-record view on its parent record. */
    addServices: function() {
        var _self = this;
        this.coreServices.buildField = function(field, ele) {
            _self.buildField(field, ele);
        }
    },
    renderSubRecord: function() {
        _self = this;

        if (_self.coreServices.layoutObject.blocks[_self.getData().parentBlockId].records[_self.getData().parentRecordId].subRecord) {
            _self.unique = true;

            var child_name = _self.coreServices.layoutObject.blocks[_self.getData().parentBlockId].records[_self.getData().parentRecordId].subRecord.child

            var child_id = _self.findChildId(child_name);

            var subView = new sap.ui.view({
                viewName: "app.views.editor.body.DFGSubview",
                type: sap.ui.core.mvc.ViewType.HTML
            });



            _self.view.registerList.bindView(subView, {
                register: _self,
                services: _self.services,
                parentBlockId: _self.getData().parentBlockId,
                parentRecordId: _self.getData().parentRecordId,
                recordId: child_id
            });
        }
    },

    /* This method searches for the id of a record with a certain name.
    It receives the name of the desired record and returns it's id. 
    If it doesn't find anything, it returns -1. */

    findChildId: function(wantedName) {

        var block = _self.coreServices.layoutObject.blocks[_self.getData().parentBlockId];

        var count = 0;

        // Separeted block so I can get the length of records object.
        var length = 0;
        for (record in block.records) {
            if (block.records.hasOwnProperty(record)) {
                length++;
            }
        }


        // Runs until if finds the result or get to the end of records.
        while (!resultId && count < length) {
            if (block.records[count].name == wantedName) {
                var resultId = count;
                return resultId;
            }
            count++;
        }
        return -1
    },

    bindElements: function() {
        var _self = this;
        //_self.coreServices.rulesObj = [];

        _self.view.input.ctrl = _self.view.input.bindBaseInput({
            tooltip: i18n('RECORD INPUT TOOLTIP'),
            onChange: function(oldVal, newVal) {
                if (newVal !== _self.coreServices.layoutObject.blocks[_self.getData().parentBlockId].records[_self.getData().parentRecordId].name) {
                    _self.coreServices.hasChanged = true;
                }
            }
        }).setText(_self.coreServices.layoutObject.blocks[_self.getData().parentBlockId].records[_self.getData().parentRecordId].name);
        _self.view.fieldList.droppable({
            accept: '.item-wrapper.child-item ',
            // activeClass: "",
            hoverClass: 'droppable-active',
            activeClass: 'droppable-active',
            drop: function(e, ui) {
                var field = $(ui.draggable).data();
                console.log(field);
                if ($(ui.draggable).find('.field-label')[0]) {
                    console.log($(ui.draggable));
                    field.label = $(ui.draggable).find('.field-label')[0].innerHTML;

                }
                var target = $(e.target);
                // var fieldData = {
                //  id: $(field).data('id'),
                //  label: $(field).find('.field-label')[0].innerHTML,
                //  type: $(field).data('type'),
                //  hanaName: $(field).data('hananame')
                // }
                _self.buildField(field, target, true);
                _self.coreServices.updateLayoutObject();
                _self.coreServices.hasChanged = true;
            }
        });
        _self.view.deleteBtn.attr('tabindex', '0');
        _self.view.deleteBtn.baseTooltip({
            class: 'dark',
            position: 'top',
            text: i18n('DELETE RECORD TOOLTIP')
        });
        _self.view.addRuleBtn.attr('tabindex', '0');
        _self.view.addRuleBtn.baseTooltip({
            class: 'dark',
            position: 'top',
            text: i18n('ADD RULE TOOLTIP')
        });
        _self.view.orderByBtn.attr('tabindex', '0');
        _self.view.orderByBtn.baseTooltip({
            class: 'dark',
            position: 'top',
            text: i18n('ADD ORDER BY TOOLTIP')
        });
        _self.view.addStructureRelationBtn.attr("tabindex", '0');
        _self.view.addStructureRelationBtn.baseTooltip({
            class: "dark",
            position: "top",
            text: i18n("ADD RELATION STRUCTURE TOOLTIP")
        });

    },

    _sortableFields: function() {
        var _self = this;
        _self.view.fieldList.sortable({
            // handle: '.icon-drag',
            helper: function(e, ui) {
                var _clone = $(ui).html();
                var holder = $('<div>').addClass('field-sortable-helper').addClass('record-field-wrapper').width($(ui).outerWidth());
                holder.append(_clone);

                return holder;
            },
            items: '.record-field-wrapper',
            containment: _self.view.fieldList,
            placeholder: 'record-field-placeholder',
        });
    },
    getLastIdRecordField: function() {
        var newId = 0;
        var _self = this;
        var currentColumn = _self.layoutObject.blocks[_self.getData().parentBlockId].records[_self.getData().parentRecordId].columns;
        var newKeys = {};
        for (var key in currentColumn) {
            if (key.indexOf("recordId") !== -1) {
                newKeys["recordId" + newId] = currentColumn[key];
                delete currentColumn[key];
                newId++;
            }
        }
        $.extend(currentColumn, newKeys);
        return newId;
    },
    buildField: function(field, ele, log) {

        var _self = this;
        var fieldData = {};
        var manualDates = [];
        var currentColumns = _self.layoutObject.blocks[_self.getData().parentBlockId].records[_self.getData().parentRecordId].columns;
        var currentColumnsParam = _self.layoutObject.blocks[_self.getData().parentBlockId].records[_self.getData().parentRecordId].columns;
        if (field.id === 'formula') {
            fieldData.id = "f" + _self.getFormulaId();
            fieldData.label = i18n('FORMULA') + ' ' + fieldData.id;
            fieldData.iconFont = 'Finance-and-Office';
            fieldData.icon = 'function';
            currentColumns[fieldData.id] = {
                fieldId: null,
                formula: {}
            };
        } else if (field.id === 'recordId') {
            fieldData.id = field.id + _self.getLastIdRecordField();
            fieldData.label = i18n('RECORDID');
            fieldData.iconFont = 'Finance-and-Office';
            fieldData.icon = 'tableview';
            currentColumns[fieldData.id] = {
                recordId: {}
            };
        } else if (field.id === "filler") {
            fieldData.id = "f" + _self.getData().parentBlockId + _self.getData().parentRecordId + _self.getFillerId();
            fieldData.label = i18n("FILLER") + ' ' + fieldData.id;
            fieldData.iconFont = 'File-and-Folders';
            fieldData.icon = 'fullbox';
            currentColumns[fieldData.id] = {
                fieldId: null,
                filler: {}
            };
        } else if (field.id === "sequenceField") {
            fieldData.id = "sf" + _self.getData().parentBlockId + _self.getData().parentRecordId + _self.getSequenceFieldId();
            fieldData.label = i18n("SEQUENCE") + ' ' + fieldData.id;
            fieldData.iconFont = 'Sign-and-Symbols';
            fieldData.icon = 'flow';
            currentColumns[fieldData.id] = {
                fieldId: null,
                label: fieldData.label,
                sequenceField: {}
            };
        } else if (field.id === "listField") {
            fieldData.id = "lf" + _self.getData().parentBlockId + _self.getData().parentRecordId + _self.getListFieldId();
            fieldData.label = i18n("LIST FIELD") + ' ' + fieldData.id;
            fieldData.iconFont = "Display-and-Setting";
            fieldData.icon = "thumblist";
            currentColumns[fieldData.id] = {
                fieldId: null,
                listField: {

                }
            };
        } else if (field.id === 'manualParam') {
            fieldData.id = "m" + _self.getData().parentBlockId + _self.getData().parentRecordId + _self.getmanualParamId();
            fieldData.label = i18n("PARAMETRO") + ' ' + fieldData.id;
            fieldData.iconFont = 'Formatting-and-Tool';
            fieldData.icon = 'textandtext';
            currentColumns[fieldData.id] = {
                fieldId: null,
                manualParam: {}
            };
        } else if (field.id === 'fixedField') {
            fieldData.id = "fxf" + _self.getData().parentBlockId + _self.getData().parentRecordId + _self.getFixedFieldId();
            fieldData.label = i18n("FIXED FIELD") + ' ' + fieldData.id;
            fieldData.iconFont = 'Sign-and-Symbols';
            fieldData.icon = 'locked';
            currentColumns[fieldData.id] = {
                fieldId: null,
                fixedField: {}
            };
        } else if (field.id === 'fixedManualField') {
            fieldData.id = "fmf" + _self.getData().parentBlockId + _self.getData().parentRecordId + _self.getFixedManualFieldId();
            fieldData.label = i18n("FIXED MANUAL FIELD") + ' ' + fieldData.id;
            fieldData.iconFont = 'Display-and-Setting';
            fieldData.icon = 'orderedlist';
            currentColumns[fieldData.id] = {
                fieldId: null,
                fixedManualField: {}
            };
        } else if (field.id === "version") {
            fieldData.id = "v" + _self.getData().parentBlockId + _self.getData().parentRecordId + _self.getVersionId();
            fieldData.label = i18n("VERSION") + ' ' + fieldData.id;
            fieldData.iconFont = 'File-and-Folders';
            fieldData.icon = 'docversion';
            currentColumns[fieldData.id] = {
                fieldId: null,
                version: {}
            };
        } else if (field.id === "referencePeriod") {
            var lastReferencePeriod = _self.getReferencePeriodId();
            fieldData.id = "sp" + _self.getData().parentBlockId + _self.getData().parentRecordId + lastReferencePeriod;
            fieldData.label = i18n("REFERENCE PERIOD") + ' ' + (lastReferencePeriod === 0 ? '' : lastReferencePeriod);
            fieldData.iconFont = 'Time-and-Date';
            fieldData.icon = 'calendar';
            currentColumns[fieldData.id] = {
                fieldId: null,
                isReferencePeriod: true,
                label: fieldData.label,
                format: {
                    date: {
                        separator: null,
                        day: null,
                        month: null,
                        year: null
                    }
                }
            };
        } else if (field.id === "newline") {
            fieldData.id = field.id + _self.getNewLineId();
            fieldData.label = i18n("NEWLINE");
            fieldData.iconFont = 'Display-and-Setting';
            fieldData.icon = 'indent';
            currentColumns[fieldData.id] = {
                fieldId: null,
                isLineBreak: true
            };
        } else if (field.id == 'blockTotal') {
            fieldData.id = field.id + _self.getData().parentBlockId + _self.getData().parentRecordId + _self.getBlockTotalId();
            fieldData.label = i18n('BLOCKTOTAL');
            fieldData.iconFont = 'Sign-and-Symbols';
            fieldData.icon = 'number';
            currentColumns[fieldData.id] = {
                fieldId: null,
                isBlocksTotal: true
            };
        } else if (field.id === 'recordsTotals') {
            fieldData.id = field.id + _self.getData().parentBlockId + _self.getData().parentRecordId + _self.getRecordsTotalId();
            fieldData.label = i18n('RECORDTOTAL');
            fieldData.iconFont = 'Sign-and-Symbols';
            fieldData.icon = 'number';
            currentColumns[fieldData.id] = {
                fieldId: null,
                isRecordsTotals: true
            };
        } else if (field.id === 'initialDateReference') {
            fieldData.id = field.id + _self.getInitialDateReferenceId();
            fieldData.label = i18n('INITDATEREFERENCE');
            fieldData.iconFont = 'Time-and-Date';
            fieldData.icon = 'calendar';
            currentColumns[fieldData.id] = {
                fieldId: null,
                isInitialDateReference: true
            };
        } else if (field.id.match && field.id.match(new RegExp(/DTE[0-9]*/g))) {
            fieldData = {
                id: 'DTE' + _self.getExecutionDateId(),
                label: i18n('DT_EXECUCAO'),
                iconFont: 'Time-and-Date',
                icon: 'calendar'
            };
            currentColumns[fieldData.id] = {
                fieldId: null,
                isExecutionDate: true
            };
        } else if (field.id.match && field.id.match(new RegExp(/HRE[0-9]*/g))) {
            fieldData = {
                id: 'HRE' + _self.getExecutionHourId(),
                label: i18n('HR_EXECUCAO'),
                iconFont: 'Time-and-Date',
                icon: 'clock'
            };
            currentColumns[fieldData.id] = {
                fieldId: null,
                isExecutionHour: true
            };
        } else if (field.id === 'finalDateReference') {
            fieldData.id = field.id + _self.getFinalDateReferenceId();
            fieldData.label = i18n('FINALDATEREFERENCE');
            fieldData.iconFont = 'Time-and-Date';
            fieldData.icon = 'calendar';
            currentColumns[fieldData.id] = {
                fieldId: null,
                isFinalDateReference: true
            };
        } else if (field.id === 'output') {
            fieldData.id = 'out' + _self.getData().parentBlockId + _self.getData().parentRecordId + _self.getDfgOutputId();
            fieldData.label = i18n('OUTPUT') + " " + fieldData.id;
            fieldData.iconFont = 'DataManager';
            fieldData.icon = 'downloadtodataset';
            currentColumns[fieldData.id] = {
                fieldId: null,
                isDFGOutput: true,
                output: {
                    fieldId: null,
                    idStructure: null,
                    isFormula: null
                }
            };
        } else if (field.id === 'totalsAll') {
            fieldData.id = field.id + _self.getTotalsAllId();
            fieldData.label = i18n("TOTALALL");
            fieldData.iconFont = 'Sign-and-Symbols';
            fieldData.icon = 'number';
            currentColumns[fieldData.id] = {
                fieldId: null,
                isTotalsAll: true
            };
        } else if (field.id === 'blockStarter') {
            fieldData.id = field.id;
            fieldData.label = i18n("BLOCKSTARTER");
            currentColumns[fieldData.id] = {
                fieldId: null,
                blockStarter: true,
                format: {
                    number: {
                        size: 10,
                        align: 1,
                        complement: 0,
                        searchFor: '',
                        replaceWith: '',
                        decimal: '',
                        decimalSeparator: '',
                        miliarSeparator: ''
                    }
                }
            };
        } else {
            var currStructure = field.idstructure;
            if ((currStructure !== null && currStructure !== undefined && currStructure !== "") && Object.keys(_self.layoutObject.blocks[_self.getData().parentBlockId].records[_self.getData().parentRecordId].columns).length === 0) {
                _self.layoutObject.blocks[_self.getData().parentBlockId].records[_self.getData().parentRecordId].idStructure = [];
                _self.layoutObject.blocks[_self.getData().parentBlockId].records[_self.getData().parentRecordId].idStructure.push(currStructure);
            } else {
                if ((currStructure !== null && currStructure !== undefined && currStructure !== "") && (_self.layoutObject.blocks[_self.getData().parentBlockId].records[_self.getData().parentRecordId].idStructure.indexOf(currStructure) === -1 || _self.layoutObject.blocks[_self.getData().parentBlockId].records[_self.getData().parentRecordId].idStructure.indexOf(currStructure + "") === -1)) {
                    _self.layoutObject.blocks[_self.getData().parentBlockId].records[_self.getData().parentRecordId].idStructure.push(currStructure);
                }
            }
            if (field.type === "BRB:OUTPUT") {
                var allOutputs = _self.layoutObject.blocks[_self.getData().parentBlockId].records[_self.getData().parentRecordId].outputs;
                if (allOutputs === undefined) {
                    allOutputs = [];
                }
                var idOutput = "O" + _self.getData().parentBlockId + _self.getData().parentRecordId + field.id;
                allOutputs.push(idOutput);
                fieldData = JSON.parse(JSON.stringify(_self.coreServices.outputs[field.id]));
                fieldData.label = field.label;
                fieldData.outputId = fieldData.id;
                fieldData.id = idOutput;
                fieldData.isBRBOutput = true;
                // fieldData: field.id,
                currentColumns[idOutput] = {
                    output: fieldData
                };

                _self.layoutObject.blocks[_self.getData().parentBlockId].records[_self.getData().parentRecordId].outputs = allOutputs;
            } else if (field.type === "TCC_Output") {
                var allOutputs = _self.layoutObject.blocks[_self.getData().parentBlockId].records[_self.getData().parentRecordId].outputs;
                if (allOutputs === undefined) {
                    allOutputs = [];
                }
                var idOutput = "TCC_" + _self.getData().parentBlockId + _self.getData().parentRecordId + field.id;
                allOutputs.push(idOutput);
                // fieldData = _self.coreServices.outputs[field.id];
                fieldData.label = field.label;
                // fieldData.outputId = field.id;
                fieldData.id = idOutput;
                // fieldData: field.id,
                currentColumns[idOutput] = {
                    fieldId: null,
                    isTCCOutput: true,
                    label: fieldData.label,
                    id: idOutput,
                    output: {
                        outputId: field.id
                    }
                };
                _self.layoutObject.blocks[_self.getData().parentBlockId].records[_self.getData().parentRecordId].outputs = allOutputs;

            } else if (field.type === "BCB:OUTPUT") {
                var allOutputs = _self.layoutObject.blocks[_self.getData().parentBlockId].records[_self.getData().parentRecordId].outputs;
                if (allOutputs === undefined) {
                    allOutputs = [];
                }
                var idOutput = "BCB_" + _self.getData().parentBlockId + _self.getData().parentRecordId + field.id;
                allOutputs.push(idOutput);
                fieldData = JSON.parse(JSON.stringify(_self.coreServices.outputsBCB[field.id]));
                fieldData.label = field.label;
                fieldData.outputId = fieldData.id;
                fieldData.id = idOutput;
                fieldData.isBCBOutput = true;
                // fieldData: field.id,
                currentColumns[idOutput] = {
                    output: fieldData
                };

                _self.layoutObject.blocks[_self.getData().parentBlockId].records[_self.getData().parentRecordId].outputs = allOutputs;

            } else if (field.type === "BFB:OUTPUT") {
                var allOutputs = _self.layoutObject.blocks[_self.getData().parentBlockId].records[_self.getData().parentRecordId].outputs;
                if (allOutputs === undefined) {
                    allOutputs = [];
                }
                var idOutput = "BFB_" + _self.getData().parentBlockId + _self.getData().parentRecordId + field.id;
                allOutputs.push(idOutput);
                fieldData = JSON.parse(JSON.stringify(_self.coreServices.outputsBFB[field.id]));
                fieldData.label = field.label;
                fieldData.outputId = fieldData.id;
                fieldData.id = idOutput;
                fieldData.isBFBOutput = true;
                // fieldData: field.id,
                currentColumns[idOutput] = {
                    output: fieldData
                };

                _self.layoutObject.blocks[_self.getData().parentBlockId].records[_self.getData().parentRecordId].outputs = allOutputs;

            } else {
                fieldData = JSON.parse(JSON.stringify(_self.coreServices.structure[currStructure].fields[field.id]));
                fieldData.idStructure = currStructure;
                var counter = 0;
                for (var c in currentColumns) {
                    if (currentColumns[c].idStructure && parseInt(currentColumns[c].idStructure, 10) === parseInt(fieldData.idStructure, 10)) {
                        if (currentColumns[c].fieldId && !isNaN(parseInt(currentColumns[c].fieldId), 10) && parseInt(currentColumns[c].fieldId, 10) === parseInt(fieldData.id)) {
                            if (currentColumns[c].uniqueId !== undefined) {
                                if (counter < parseInt(currentColumns[c].uniqueId, 10)) {
                                    counter = currentColumns[c].uniqueId + 1;
                                } else {
                                    currentColumns[c].uniqueId = counter;
                                    counter++;
                                }
                            }
                        }
                    }
                }
                currentColumns[fieldData.idStructure + "S" + fieldData.id + "C" + counter] = {
                    fieldId: JSON.parse(JSON.stringify(fieldData.id)),
                    idStructure: fieldData.idStructure,
                    uniqueId: counter
                };
                fieldData.id = fieldData.idStructure + "S" + fieldData.id + "C" + counter;
            }
        }
        if (log) {
            var fieldName = $.globalFunctions.getColumnName(currentColumns[fieldData.id]);
            _self.coreServices.lastChanges.push({
                message: {
                    enus: "A new field was added",
                    ptrbr: "Um novo campo foi adicionado"
                },
                blockId: _self.getData().parentBlockId,
                recordId: _self.getData().parentRecordId,
                fieldName: fieldName,
                type: 3
            });
        }
        var newField = _self.loadField(ele, fieldData);

        if (field.type !== "BRB:OUTPUT" && field.type !== "TCC_Output" && field.type !== "BCB:OUTPUT" && field.type !== "BFB:OUTPUT") {
            _self.layoutObject.fields[fieldData.id] = fieldData;
        } else {
            _self.coreServices.updateLayoutObject();
        }
        _self._sortableFields();
        if (currentColumns[fieldData.id].formula) {
            _self.coreServices.updateLayoutObject();
            _self.coreServices.openFormulaDialog(_self.getData().parentBlockId, _self.getData().parentRecordId, fieldData.id, true, newField);
        }
        if (currentColumns[fieldData.id].hasOwnProperty("recordId")) {
            _self.coreServices.updateLayoutObject();
            if (_self.coreServices.layoutObject.configIdRecord === undefined || _self.coreServices.layoutObject.configIdRecord === 0) {
                _self.coreServices.openIdRecordDialog(_self.getData().parentBlockId, _self.getData().parentRecordId, fieldData.id, newField, true);
            } else {
                newField.setIdRecordConfig(_self.coreServices.layoutObject.configIdRecord);
            }
        }
        if (currentColumns[fieldData.id].filler) {
            _self.coreServices.updateLayoutObject();
            _self.coreServices.openFillerDialog(_self.getData().parentBlockId, _self.getData().parentRecordId, fieldData.id, newField);
        }

        if (currentColumns[fieldData.id].isDFGOutput) {
            _self.coreServices.updateLayoutObject();
            _self.coreServices.openDfgOutputDialog(_self.getData().parentBlockId, _self.getData().parentRecordId, fieldData.id, newField);
        }

        if (currentColumnsParam[fieldData.id].manualParam) {
            _self.coreServices.updateLayoutObject();

            _self.coreServices.openParamDialog(_self.getData().parentBlockId, _self.getData().parentRecordId, fieldData.id, newField);
        }
        if (currentColumns[fieldData.id].sequenceField) {
            _self.coreServices.updateLayoutObject();
            _self.coreServices.openSequenceFieldDialog(_self.getData().parentBlockId, _self.getData().parentRecordId, fieldData.id, newField);
        }
        if (currentColumns[fieldData.id].listField) {
            _self.coreServices.updateLayoutObject();
            _self.coreServices.openListFieldDialog(_self.getData().parentBlockId, _self.getData().parentRecordId, fieldData.id, newField);
        }
        if (currentColumns[fieldData.id].fixedField) {
            _self.coreServices.updateLayoutObject();
            _self.coreServices.openFixedFieldDialog(_self.getData().parentBlockId, _self.getData().parentRecordId, fieldData.id, newField);
        }
        if (currentColumns[fieldData.id].fixedManualField) {
            _self.coreServices.updateLayoutObject();
            _self.coreServices.openFixedManualFieldDialog(_self.getData().parentBlockId, _self.getData().parentRecordId, fieldData.id, newField, true);
        }
        if (currentColumns[fieldData.id].version) {
            _self.coreServices.updateLayoutObject();
            _self.coreServices.openVersionDialog(_self.getData().parentBlockId, _self.getData().parentRecordId, fieldData.id);
        }
        if (fieldData.id.match) {
            if (currentColumns[fieldData.id].isReferencePeriod || fieldData.id.match(new RegExp(/DTE[0-9]+/g)) || fieldData.id.match(new RegExp(/HRE[0-9]*/g)) || currentColumns[fieldData.id].isInitialDateReference || currentColumns[fieldData.id].isFinalDateReference) {
                _self.coreServices.updateLayoutObject();
                _self.coreServices.openFormatDialog(_self.getData().parentBlockId, _self.getData().parentRecordId, fieldData.id, true, newField, currentColumns[fieldData.id].isReferencePeriod);
            }
        }
        if (currentColumns[fieldData.id].isRecordsTotals) {
            _self.coreServices.updateLayoutObject();
            _self.coreServices.openTotalSelectionDialog(_self.getData().parentBlockId, _self.getData().parentRecordId, fieldData.id, true);
        }
        if (currentColumns[fieldData.id].isBlocksTotal) {
            _self.coreServices.updateLayoutObject();
            _self.coreServices.openTotalSelectionDialog(_self.getData().parentBlockId, _self.getData().parentRecordId, fieldData.id, false);
        }

        $('.record-field-wrapper').attr('tabindex', 0);

        $('.icon.field-close').attr('tabindex', 0);
        $('.icon.field-close').css('visibility', 'visible');
        $('.icon.field-close').keydown(function(ev) {
            if (ev.keyCode == 32 || ev.keyCode == 13) {
                this.click();
            }
        });
        return newField;
    },

    loadField: function(target, fieldData) {
        var _self = this;
        var newField = $(target).bindDFGFieldUnit({
            fieldData: fieldData,
            blockId: _self.getData().parentBlockId,
            recordId: _self.getData().parentRecordId,
            services: _self.services
        });
        this.columns[fieldData.id] = newField;
        return newField;
    },

    bindEvents: function() {
        var _self = this;
        /*
        This next method is responsible for creating a new sub-record when the 'Add Sub Record'
        is pressed.
        */

        _self.view.addRegisterBtn.click(function() {
            if (!_self.unique) {
                _self.unique = true;

                var subRecordId = _self.getRecordId();

                //Creating the new sub record inside the records object
                _self.coreServices.layoutObject.blocks[_self.getData().parentBlockId]
                    .records[subRecordId] = {
                        name: "",
                        columns: {},
                        positions: [],
                        businessRules: [],
                        subRecord: {}
                    }

                var subView = new sap.ui.view({
                    viewName: "app.views.editor.body.DFGSubview",
                    type: sap.ui.core.mvc.ViewType.HTML
                });
                _self.view.registerList.bindView(subView, {
                    register: _self,
                    services: _self.services,
                    parentBlockId: _self.getData().parentBlockId,
                    parentRecordId: _self.getData().parentRecordId,
                    recordId: subRecordId
                });

                // _self.view.registerList.bindDFGRegisterUnit({});
            } else {
                // console.log("Already clicked.");
            }
        });
        this.view.collapseBtn.click(function() {
            _self.view.addClass('collapsed');
        })
        this.view.expandBtn.click(function() {
            _self.view.removeClass('collapsed');
        })
        var sizeRegister = $('.register-wrapper').size();
        $('div.controladoresTop .totalrecords .num').html(sizeRegister);
        _self.view.deleteBtn.click(function() {
            var blockName = _self.coreServices.layoutObject.blocks[_self.getData().parentBlockId].name;
            var recordName = _self.coreServices.layoutObject.blocks[_self.getData().parentBlockId].records[_self.getData().parentRecordId].name;
            _self.coreServices.lastChanges.push({
                message: {
                    enus: "A record was removed",
                    ptrbr: "Um registro foi removido"
                },
                blockName: blockName,
                recordName: recordName,
                type: 5
            });
            _self.removeRegister();
            _self.coreServices.hasChanged = true;
        });
        _self.view.deleteBtn.keydown(function(ev) {
            if (ev.keyCode == 32 || ev.keyCode == 13) {
                this.click();
            }
        });
        _self.view.addRuleBtn.keydown(function(ev) {
            if (ev.keyCode == 32 || ev.keyCode == 13) {
                this.click();
            }
        });
        _self.view.addRuleBtn.click(function() {
            _self.idEstrutura = _self.coreServices.layoutObject.blocks[_self.getData().parentBlockId].records[_self.getData().parentRecordId].idStructure;
            _self.designRulesDialog();
        });
        _self.view.orderByBtn.keydown(function(ev) {
            if (ev.keyCode == 32 || ev.keyCode == 13) {
                this.click();
            }
        });
        _self.view.addStructureRelationBtn.keydown(function(ev) {
            if (ev.keyCode === 32 || ev.keyCode === 13) {
                this.click();
            }
        });
        _self.view.orderByBtn.click(function() {
            _self.orderByDialog();
        });
        _self.view.addStructureRelationBtn.click(function() {
            _self.addStructureRelationDialog();
        });
    },
    getRecordId: function() {
        var _self = this;
        var blocks = _self.coreServices.layoutObject.blocks[_self.getData().parentBlockId].records;
        // console.log(blocks);
        var newRecordId = -1;
        var found = false;
        while (!found) {
            newRecordId++;
            found = true;
            for (var i in blocks) {
                if (newRecordId == i) {
                    found = false;
                }
            }
        }
        return newRecordId + "";
    },

    getRulesFromRulesObj: function() {
        var _self = this;
        _self._selected_rules = [];
        if (typeof(_self.coreServices.rulesObj) != "undefined") {
            $.each(_self.coreServices.rulesObj, function(index, val) {
                if (_self.getData().parentBlockId == val.parentBlockId && val.parentRecordId == _self.getData().parentRecordId) {
                    //_self._selected_rules.push()
                    var temp = Object.keys(val)[0];
                    temp = parseInt(temp);
                    _self._selected_rules.push(temp);
                }
            });
        }
    },
    createRulesObject: function() {
        var _self = this;

        if (typeof(_self.coreServices.rulesObj) == "undefined")
            _self.coreServices.rulesObj = [];
        $.each(_self._selected_rules, function(index, val) {
            var temp = val.toString();
            //limpar os rulesObj já existentes ao record e o block sleecionados para nao ocorrer dados duplicados
            if (index == 0) {
                _self.coreServices.rulesObj = $(_self.coreServices.rulesObj).filter(function(index, val) {
                    if (val.parentRecordId != _self.getData().parentRecordId || val.parentBlockId != _self.getData().parentBlockId)
                        return true;
                });
            }
            //adicionar o block e o record novos
            _self.coreServices.rulesObj.push({
                parentRecordId: _self.getData().parentRecordId,
                parentBlockId: _self.getData().parentBlockId
            });
            _self.coreServices.rulesObj[_self.coreServices.rulesObj.length - 1][temp] = {
                type: 0
            };
        });
    },
    designRulesDialog: function() {
        var _self = this;

        _self.getRulesFromRulesObj();
        _self.DesignRules = $.baseDialog({
            title: i18n("RULES"),
            modal: true,
            size: "wide",
            outerClick: 'disabled',
            viewName: "app.views.editor.DesignRules",
            cssClass: "newFile Rules",
            viewData: {
                services: _self.services,
                estrutura: _self.idEstrutura,
                _selected_rules: _self._selected_rules
            },
            buttons: [{
                name: i18n('CANCEL'),
                click: function() {
                    _self.DesignRules.close();
                },
                tooltip: i18n('CLICK PRESS CANCEL')
            }, {
                name: i18n('NEXT'),
                click: function() {
                    if (_self.getRules()) {
                        _self.createRulesDescScreen();
                    }
                },
                tooltip: i18n('CLICK PRESS CONFIRM')
            }]
        });
        _self.DesignRules.open();
        _self.firstButton = $(_self.DesignRules._buttons).find("button")[0];
        _self.secondButton = $(_self.DesignRules._buttons).find("button")[1];
    },
    orderByDialog: function() {
        var _self = this;

        _self.orderBy = $.baseDialog({
            title: i18n("ORDER BY"),
            modal: true,
            size: "medium",
            outerClick: 'disabled',
            viewName: "app.views.editor.orderByDialog",
            viewData: {
                parentRecordId: _self.getData().parentRecordId,
                parentBlockId: _self.getData().parentBlockId
            },
            buttons: [{
                name: i18n('CANCEL'),
                click: function() {
                    _self.orderBy.close();
                },
                tooltip: i18n('CLICK PRESS CANCEL')
            }, {
                name: i18n('APPLY'),
                click: function() {
                    if (_self.orderBy.getInnerController().validate()) {
                        _self.coreServices.layoutObject.blocks[_self.getData().parentBlockId].records[_self.getData().parentRecordId].orderBy = _self.orderBy.getInnerController().getOrderData();

                        _self.orderBy.close();
                    } else {
                        $.baseToast({
                            type: "w",
                            text: i18n("FILL ALL FIELDS")
                        });
                    }
                },
                tooltip: i18n('CLICK PRESS CONFIRM')
            }]
        });
        _self.orderBy.open();

    },
    addStructureRelationDialog: function() {
        var _self = this;
        _self.structureRelationDialog = $.baseDialog({
            title: i18n("STRUCTURE RELATION"),
            modal: true,
            size: "medium",
            outerClick: "disabled",
            viewName: "app.views.editor.relationStructureDialog",
            viewData: {
                parentRecordId: _self.getData().parentRecordId,
                parentBlockId: _self.getData().parentBlockId
            },
            buttons: [{
                name: i18n('CANCEL'),
                click: function() {
                    _self.structureRelationDialog.close();
                },
                tooltip: i18n('CLICK PRESS CANCEL')
            }, {
                name: i18n('APPLY'),
                click: function() {
                    if (_self.structureRelationDialog.getInnerController().validate()) {
                        _self.coreServices.layoutObject.blocks[_self.getData().parentBlockId].records[_self.getData().parentRecordId].structureRelation = _self.structureRelationDialog.getInnerController().getStructureRelation();

                        _self.structureRelationDialog.close();
                    } else {
                        $.baseToast({
                            type: "w",
                            text: i18n("FILL ALL FIELDS")
                        });
                    }
                },
                tooltip: i18n('CLICK PRESS CONFIRM')
            }]
        });
        _self.structureRelationDialog.open();
    },
    setButtonsClick: function(obj) {
        var _self = this;

        if (obj.first) {
            $(_self.firstButton).unbind("click").on("click", obj.first);
        }
        if (obj.second) {
            $(_self.secondButton).unbind("click").on("click", obj.second);
        }
    },
    changeButtonsLabel: function(obj) {
        var _self = this;
        if (obj.first) {
            $(_self.firstButton).text(obj.first)
        }
        if (obj.second) {
            $(_self.secondButton).text(obj.second);
        }
    },
    addRulesScreen: function() {
        var _self = this;

        function afterEndpoint() {
            // _self.dialog._title.text(_self.listItemSelected.find("label").text());
            _self.DesignRules.open();
        }
        _self._temp_rules = [];
        _self.loader.open();
        Data.endpoints.bre.rule.list.post({
            structure: _self.idEstrutura,
            type: "AN3"
        }).success(function(_data_structures) {
            _self.descData = [];
            if (_data_structures) {
                _data_structures.map(function(_rule) {
                    _self._temp_rules[_rule.id] = _rule;
                });
            }

            Data.endpoints.bre.rule.transcripts.post({
                lang: _self.lang,
                rules: _self._selected_rules
            }).success(function(data) {

                _self.loader.close();
                if (data) {
                    Object.keys(data).forEach(function(_t) {
                        _self.descData.push({
                            id: _t,
                            name: _self._temp_rules[_t].name,
                            description: _self._temp_rules[_t].description,
                            formula: data[_t]
                        })
                    });
                }

                afterEndpoint();
            }).error(function(data) {
                _self.loader.close();

            })
            //call endpoint!
        }).error(function(data) {
            _self.loader.close();
            // console.log(data);
        });
    },

    createRulesDescScreen: function() {
        var _self = this;

        function afterEndpoint() {
            _self.DesignRulesDesc = $.baseDialog({
                title: i18n("RULES"),
                modal: true,
                size: "wide",
                outerClick: 'disabled',
                viewName: "app.views.editor.DesignRulesDesc",
                cssClass: "newFile Rules",
                viewData: {
                    services: _self.services,
                    data: _self.descData
                },
                buttons: [{
                    name: i18n('BACK'),
                    click: function() {
                        _self.addRulesScreen();
                        _self.DesignRulesDesc.close()
                    },
                    tooltip: i18n('CLICK PRESS CANCEL')
                }, {
                    name: i18n('APPLY'),
                    click: function() {
                        _self.createRulesObject();
                        _self.DesignRulesDesc.close();
                    },
                    tooltip: i18n('CLICK PRESS CONFIRM')
                }]
            });
            _self.DesignRulesDesc.open();


            // _self.descView = new sap.ui.view({
            //     viewName: "app.views.editor.DesignRulesDesc",
            //     type: sap.ui.core.mvc.ViewType.HTML

            // });

            // _self.descController = _self.DesignRules._content.bindView(_self.descView, _self.descData);
            // // console.log(_self.descController)
            // console.log(_self.descView)
            //     // console.log(_self.descData)
            //     // console.log(_self.DesignRules)
            // _self.DesignRules.open();

        }
        _self._temp_rules = [];

        var _data_structures = _self.coreServices.rules;
        _self.descData = [];
        if (_data_structures) {
            _data_structures.map(function(_rule) {
                _self._temp_rules[_rule.id] = _rule;
            });
        }

        //SHOW FIELDS FOR RULES
        var target = _self.view.fieldList;

        target.children().each(function(i, val) {
            if (val.getAttribute("data-id") !== undefined && val.getAttribute("data-id") !== null && val.getAttribute("data-id").slice(0, 1) === "r") {
                $(val).remove();
            }
        });

        _self._selected_rules.forEach(function(index) {
            if ($(target).find("[data-id='r" + index + "']").length === 0) {
                _self.loadField(target, {
                    id: "r" + index,
                    label: i18n("RULE") + index
                });
            }
        })

        Data.endpoints.bre.rule.transcripts.post({
            lang: _self.lang,
            rules: _self._selected_rules
        }).success(function(data) {
            _self.loader.close();

            if (data) {
                Object.keys(data).forEach(function(_t) {
                    _self.descData.push({
                        id: _t,
                        name: _self._temp_rules[_t].name,
                        description: _self._temp_rules[_t].description,
                        formula: data[_t]
                    })
                });
            }

            afterEndpoint();
        }).error(function(data) {
            _self.loader.close();
            // console.log(data);
        });

        //call endpoint!
    },
    getRules: function() {
        var _self = this;
        var result = true;
        _self._selected_rules = [];
        var tableRules = $("#TableRules");
        tableRules.find('.base-table .tbody .tr').each(function(_index, _val) {
            if ($(_val).find('.td.checkbox input').prop("checked")) {
                var _rule_id = $(_val).data('id');
                _self._selected_rules.push($(_val).data('id'));
            }
        });
        if (_self._selected_rules.length == 0) {
            $.baseToast({
                text: i18n['WARNING NO ' + (_self.paramJson_rules ? 'RULE' : 'REGULATION')],
                isWarning: true
            });
            result = false;
        }
        return result;
    },
    removeRegister: function() {
        var _self = this;
        _self.view.remove();
        if (_self.coreServices.layoutObject.blocks[_self.getData().parentBlockId]) {
            delete _self.coreServices.layoutObject.blocks[_self.getData().parentBlockId].records[_self.getData().parentRecordId];
        }
        var sizeRegister = $('.register-wrapper').size();
        $('div.controladoresTop .totalrecords .num').html(sizeRegister);
    },
    renderFields: function() {
        var _self = this;
        var currentRecord = _self.coreServices.layoutObject.blocks[_self.getData().parentBlockId].records[_self.getData().parentRecordId];
        var fields = _self.loadFieldData(currentRecord);
        var target = _self.view.fieldList;

        var positions = currentRecord.positions;
        var counters = {};
        for (var i = 0; i < positions.length; i++) {
            var currCol = currentRecord.columns[positions[i]];
            if (currCol && (currCol.idStructure === undefined || currCol.idStructure === null)) {
                if (currentRecord && currentRecord.idStructure) {
                    currCol.idStructure = "" + currentRecord.idStructure;
                }
            }
            if (typeof currCol != "undefined") {
                if (currCol.hasOwnProperty("recordId")) {
                    var label = "";
                    if (typeof(currCol.recordId) !== 'object') {
                        label = "ID " + i18n("RECORD");
                    } else {
                        var hasBlockId = currCol.recordId.hasOwnProperty("blockId");
                        var hasRecordId = currCol.recordId.hasOwnProperty("recordId");
                        if (hasBlockId) {
                            label = "ID " + i18n("BLOCK") + (hasRecordId ? ' + ' : '');
                        }
                        if (hasRecordId) {
                            label += "ID " + i18n("RECORD");
                        }
                    }
                    _self.loadField(target, {
                        id: positions[i],
                        label: label
                    });
                } else if (currCol.fieldId && (currCol.fieldId + "").match(new RegExp(/HRE[0-9]*/g)) || currCol.isExecutionHour) {
                    _self.loadField(target, {
                        id: positions[i],
                        label: i18n('HR_EXECUCAO')
                    });
                } else if (currCol.fieldId && (currCol.fieldId + "").match(new RegExp(/DTE[0-9]*/g)) || currCol.isExecutionDate) {
                    _self.loadField(target, {
                        id: positions[i],
                        label: i18n('DT_EXECUCAO')
                    });
                } else if (currCol.fieldId) {
                    if (Object.keys(fields).indexOf(currCol.idStructure) === -1) {
                        fields = _self.loadFieldData(currentRecord);
                    }
                    if (!fields[currCol.idStructure] || !fields[currCol.idStructure][currCol.fieldId]) {

                        continue;
                    }
                    if (currCol.uniqueId === undefined) {
                        if (!counters[currCol.idStructure]) {
                            counters[currCol.idStructure] = {};
                        }
                        if (!counters[currCol.idStructure][currCol.fieldId]) {
                            counters[currCol.idStructure][currCol.fieldId] = 0;
                            for (var j = 0; j < positions.length; j++) {
                                if (i !== j) {
                                    if (currentRecord.columns[positions[i]].fieldId === currCol.fieldId) {
                                        if (currentRecord.columns[positions[i]].idStructure === currCol.idStructure) {
                                            if (currentRecord.columns[positions[i]].uniqueId !== undefined) {
                                                if (counters[currCol.idStructure][currCol.fieldId] < parseInt(currentRecord.columns[positions[i]].uniqueId, 10)) {
                                                    counters[currCol.idStructure][currCol.fieldId] = parseInt(currentRecord.columns[positions[i]].uniqueId, 10) + 1;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        currCol.uniqueId = counters[currCol.idStructure][currCol.fieldId];
                        positions[i] = currCol.idStructure + "S" + currCol.fieldId + "C" + currCol.uniqueId;
                        counters[currCol.idStructure][currCol.fieldId]++;

                    }
                    var field = JSON.parse(JSON.stringify(fields[currCol.idStructure][currCol.fieldId]));
                    field.id = currCol.idStructure + "S" + currCol.fieldId + "C" + currCol.uniqueId;
                    _self.loadField(target, field);
                } else if (currCol.formula) {

                    _self.loadField(target, {
                        id: positions[i],
                        label: currCol.formula.label ? currCol.formula.label : i18n('FORMULA') + ' ' + positions[i],
                        iconFont: 'Finance-and-Office',
                        icon: 'function'
                    });
                } else if (currCol.manualParam) {
                    _self.loadField(target, {
                        id: positions[i],
                        label: currCol.manualParam.label ? currCol.manualParam.label : i18n('PARAMETRO') + ' ' + positions[i],
                        iconFont: 'Formatting-and-Tool',
                        icon: 'textandtext'
                    });
                } else if (currCol.fixedField) {
                    _self.loadField(target, {
                        id: positions[i],
                        label: currCol.fixedField.name ? currCol.fixedField.name : i18n('FIXED FIELD') + ' ' + positions[i],
                        iconFont: 'Sign-and-Symbols',
                        icon: 'locked'
                    });
                } else if (currCol.fixedManualField) {
                    _self.loadField(target, {
                        id: positions[i],
                        label: currCol.fixedManualField.name,
                        iconFont: 'Display-and-Setting',
                        icon: 'orderedlist'
                    });
                } else if (currCol.isBlocksTotal) {
                    _self.loadField(target, {
                        id: positions[i],
                        label: i18n('BLOCKTOTAL')
                    });
                } else if (currCol.isTotalsAll) {
                    _self.loadField(target, {
                        id: positions[i],
                        label: i18n('TOTALALL')
                    });
                } else if (currCol.isRecordsTotals) {
                    _self.loadField(target, {
                        id: positions[i],
                        label: i18n('RECORDTOTAL')
                    });
                } else if (currCol.blockStarter) {
                    _self.loadField(target, {
                        id: positions[i],
                        label: i18n('BLOCKSTARTER')
                    });
                } else if (currCol.filler) {
                    _self.loadField(target, {
                        id: positions[i],
                        label: currCol.filler.name ? currCol.filler.name : i18n('FILLER') + ' ' + positions[i],
                        iconFont: 'File-and-Folders',
                        icon: 'fullbox'
                    });
                } else if (currCol.sequenceField) {
                    _self.loadField(target, {
                        id: positions[i],
                        label: currCol.label || i18n('SEQUENCE'),
                        iconFont: 'Sign-and-Symbols',
                        icon: 'flow'
                    });
                } else if (currCol.listField) {
                    _self.loadField(target, {
                        id: positions[i],
                        label: currCol.listField.name || i18n('FILLER') + ' ' + positions[i],
                        iconFont: 'Display-and-Setting',
                        icon: 'thumblist'
                    });
                } else if (currCol.isLineBreak) {
                    _self.loadField(target, {
                        id: positions[i],
                        label: i18n("NEWLINE")
                    });
                } else if (currCol.isReferencePeriod) {
                    if (!currCol.label) {
                        var indexSubPeriod = positions[i].substring(("sp" + _self.getData().parentBlockId + '' + _self.getData().parentRecordId).length, positions[i].length);
                        currCol.label = i18n("REFERENCE PERIOD") + ' ' + (indexSubPeriod === 0 ? '' : parseInt(indexSubPeriod));
                    }
                    _self.loadField(target, {
                        id: positions[i],
                        label: currCol.label !== undefined ? currCol.label : i18n("REFERENCE PERIOD") + ' ' + positions[i]
                    });
                } else if (currCol.version) {
                    _self.loadField(target, {
                        id: positions[i],
                        label: i18n('VERSION') + ' ' + positions[i]
                    });
                } else if (currCol.isInitialDateReference) {
                    _self.loadField(target, {
                        id: positions[i],
                        label: i18n('INITDATEREFERENCE')
                    });
                } else if (currCol.isFinalDateReference) {
                    _self.loadField(target, {
                        id: positions[i],
                        label: i18n('FINALDATEREFERENCE')
                    });
                } else if (currCol.isDFGOutput) {
                    _self.loadField(target, {
                        id: positions[i],
                        label: currCol.output.name ? currCol.output.name : i18n('OUTPUT') + " " + positions[i],
                        iconFont: 'DataManager',
                        icon: 'downloadtodataset'
                    });
                } else if (currCol.isTCCOutput) {
                    currCol.id = positions[i];
                    _self.loadField(target, currCol);

                } else if (currCol.output !== undefined) {
                    _self.loadField(target, {
                        id: positions[i],
                        label: currCol.output.label,
                        metadata: currCol.output.metadata,
                        isOutputField: true
                    });
                }
            }

        }
        //SHOW FIELDS FOR RULES
        var target = _self.view.fieldList;

        if (currentRecord.rules !== undefined) {
            for (var idRule in currentRecord.rules) {
                _self.loadField(target, {
                    id: "r" + idRule,
                    label: i18n("RULE") + idRule
                });
            }
        }


        _self._sortableFields();
    },

    getFormulaId: function() {
        var _self = this;
        var currColumns = _self.layoutObject.blocks[_self.getData().parentBlockId].records[_self.getData().parentRecordId].columns;
        var newFormulaCols = {};
        var max = 0;
        var first = true;
        for (var i in currColumns) {
            if (currColumns[i].formula) {
                var value = Number(i.split(/f/)[1]);
                first = false;
                if (value > max) {
                    max = value;
                }
            }
            if (currColumns[i].concat) {
                var value = _self.getMaxInConcat(currColumns[i].concat, "formula", /f/);
                first = value === -1 && first;
                if (value > max) {
                    max = value;
                }
            }
        }
        if (first)
            return 0;
        return max + 1;
    },
    getOutputId: function() {
        var _self = this;
        var currColumns = _self.layoutObject.blocks[_self.getData().parentBlockId].records[_self.getData().parentRecordId].columns;
        var allOutputs = _self.layoutObject.blocks[_self.getData().parentBlockId].records[_self.getData().parentRecordId].outputs;
        if (allOutputs !== undefined) {
            var newOutputs = {};
            var newArrayOutputs = [];
            // for (var i = 0; i < allOutputs.length; i++) {
            allOutputs.forEach(function(item, i) {
                var newCode;
                if (currColumns[item]) {
                    if (currColumns[item].output) {
                        if (currColumns[item].output.isTCCOutput) {
                            newCode = "TCC_";
                        } else if (currColumns[item].output.isBCBOutput) {
                            newCode = "BCB_";
                        } else if (currColumns[item].output.isBFBOutput) {
                            newCode = "BFB_";
                        } else {
                            newCode = "O";

                        }
                    }
                    if (newCode) {
                        newCode += _self.getData().parentBlockId + _self.getData().parentRecordId + i;
                        newOutputs[newCode] = currColumns[item];
                        newArrayOutputs.push(newCode);

                    }
                }

            });
            newArrayOutputs.forEach(function(item, i) {
                delete currColumns[item];
            });
            for (var i in newOutputs) {
                currColumns[i] = newOutputs[i];
            }
            return newArrayOutputs.length;
        }
        return 0;
    },
    getmanualParamId: function() {
        var _self = this;
        var currColumns = _self.layoutObject.blocks[_self.getData().parentBlockId].records[_self.getData().parentRecordId].columns;
        var newFormulaCols = {};
        var max = 0;
        var first = true;
        for (var i in currColumns) {
            if (currColumns[i].manualParam) {
                var value = Number(i.split(/m\d\d/)[1]);
                first = false;
                if (value > max) {
                    max = value;
                }
            }
            if (currColumns[i].concat) {
                var value = _self.getMaxInConcat(currColumns[i].concat, "manualParam", /m\d\d/);
                first = value === -1 && first;
                if (value > max) {
                    max = value;
                }
            }
        }
        if (first)
            return 0;
        return max + 1;
    },
    getMaxInConcat: function(concatenatedFields, property, idRegex) {
        var max = -1;
        for (var fieldId in concatenatedFields.columns) {
            if (concatenatedFields.columns[fieldId][property]) {
                var value = Number(fieldId.split(idRegex)[1]);
                if (value > max)
                    max = value;
            }
        }
        return max;
    },
    getFixedManualFieldId: function() {
        var _self = this;
        var currColumns = _self.layoutObject.blocks[_self.getData().parentBlockId].records[_self.getData().parentRecordId].columns;
        var max = 0;
        var first = true;
        for (var i in currColumns) {
            if (currColumns[i].fixedManualField) {
                var value = Number(i.split(/fmf\d\d/)[1]);
                first = false;
                if (value > max) {
                    max = value;
                }
            }
            if (currColumns[i].concat) {
                var value = _self.getMaxInConcat(currColumns[i].concat, "fixedManualField", /fmf\d\d/);
                first = value === -1 && first;
                if (value > max) {
                    max = value;
                }
            }
        }
        if (first)
            return 0;
        return max + 1;
    },
    getFixedFieldId: function() {
        var _self = this;
        var currColumns = _self.layoutObject.blocks[_self.getData().parentBlockId].records[_self.getData().parentRecordId].columns;
        var newFormulaCols = {};
        var max = 0;
        var first = true;
        for (var i in currColumns) {
            if (currColumns[i].fixedField) {
                var value = Number(i.split(/fxf\d\d/)[1]);
                first = false;
                if (value > max) {
                    max = value;
                }
            }
            if (currColumns[i].concat) {
                var value = _self.getMaxInConcat(currColumns[i].concat, "fixedField", /fxf\d\d/);
                first = value === -1 && first;
                if (value > max) {
                    max = value;
                }
            }
        }
        if (first)
            return 0;
        return max + 1;
    },
    getDfgOutputId: function() {
        var _self = this;
        var currColumns = _self.layoutObject.blocks[_self.getData().parentBlockId].records[_self.getData().parentRecordId].columns;
        var newFormulaCols = {};
        var max = 0;
        var first = true;
        for (var i in currColumns) {
            if (currColumns[i].isDFGOutput) {
                var value = Number(i.substr(-1));
                first = false;
                if (value > max) {
                    max = value;
                }
            }
        }
        if (first)
            return 0;
        return max + 1;
    },
    getVersionId: function() {
        var _self = this;
        var blockColumns = _self.layoutObject.blocks[_self.getData().parentBlockId].records[_self.getData().parentRecordId].columns;
        var ids = [];
        for (var f in blockColumns) {
            if (blockColumns[f].version) {
                ids.push(parseInt(f.split(/v\d\d/)[1], 10));
            }
        }
        ids.sort(function(a, b) {
            return a - b;
        });

        return ids.length ? ids[ids.length - 1] + 1 : 0;
    },
    getReferencePeriodId: function() {
        var _self = this;
        var blockColumns = _self.layoutObject.blocks[_self.getData().parentBlockId].records[_self.getData().parentRecordId].columns;
        var ids = [];
        for (var f in blockColumns) {
            if (blockColumns[f].isReferencePeriod) {
                ids.push(parseInt(f.split(/sp\d\d/)[1], 10));
            }
        }
        ids.sort(function(a, b) {
            return a - b;
        });

        return ids.length ? ids[ids.length - 1] + 1 : 0;
    },
    getFillerId: function() {
        var _self = this;
        var blockColumns = _self.layoutObject.blocks[_self.getData().parentBlockId].records[_self.getData().parentRecordId].columns;
        var ids = [];
        for (var f in blockColumns) {
            if (blockColumns[f].filler) {
                ids.push(parseInt(f.split(/f\d\d/)[1], 10));
            }
        }
        ids.sort(function(a, b) {
            return a - b;
        });

        return ids.length ? ids[ids.length - 1] + 1 : 0;
    },
    getRecordsTotalId: function() {
        var _self = this;
        var blockColumns = _self.layoutObject.blocks[_self.getData().parentBlockId].records[_self.getData().parentRecordId].columns;
        var ids = [];
        for (var f in blockColumns) {
            if (blockColumns[f].isRecordsTotals) {
                ids.push(parseInt(f.split(/recordsTotals\d\d/)[1], 10));
            }
        }
        ids.sort(function(a, b) {
            return a - b;
        });

        return ids.length ? ids[ids.length - 1] + 1 : 0;
    },
    getBlockTotalId: function() {
        var _self = this;
        var blockColumns = _self.layoutObject.blocks[_self.getData().parentBlockId].records[_self.getData().parentRecordId].columns;
        var ids = [];

        for (var f in blockColumns) {
            if (blockColumns[f].isBlocksTotal) {
                ids.push(parseInt(f.split(/blockTotal\d\d/)[1], 10));
            }
        }
        ids.sort(function(a, b) {
            return a - b;
        });

        return ids.length ? ids[ids.length - 1] + 1 : 0;

    },
    getSequenceFieldId: function() {
        var _self = this;
        var blockColumns = _self.layoutObject.blocks[_self.getData().parentBlockId].records[_self.getData().parentRecordId].columns;
        var ids = [];

        for (var f in blockColumns) {
            if (blockColumns[f].sequenceField) {
                ids.push(parseInt(f.split(/sf\d\d/)[1], 10));
            }
        }
        ids.sort(function(a, b) {
            return a - b;
        });

        return ids.length ? ids[ids.length - 1] + 1 : 0;
    },
    getNewLineId: function() {
        var _self = this;
        var blockColumns = _self.layoutObject.blocks[_self.getData().parentBlockId].records[_self.getData().parentRecordId].columns;
        var ids = [];

        for (var f in blockColumns) {
            if (f.match(new RegExp(/newline/g)) !== null) {
                ids.push(parseInt(f.split("newline")[1], 10));
            }
        }
        ids.sort(function(a, b) {
            return a - b;
        });

        return ids.length ? ids[ids.length - 1] + 1 : 0;
    },
    getTotalsAllId: function() {
        var _self = this;
        var blockColumns = _self.layoutObject.blocks[_self.getData().parentBlockId].records[_self.getData().parentRecordId].columns;
        var ids = [];

        for (var f in blockColumns) {
            if (f.match(new RegExp(/totalsAll/g)) !== null) {
                ids.push(parseInt(f.split("totalsAll")[1], 10));
            }
        }
        ids.sort(function(a, b) {
            return a - b;
        });

        return ids.length ? ids[ids.length - 1] + 1 : 0;
    },

    getInitialDateReferenceId: function() {
        var _self = this;
        var blockColumns = _self.layoutObject.blocks[_self.getData().parentBlockId].records[_self.getData().parentRecordId].columns;
        var ids = [];
        for (var f in blockColumns) {
            if (f.match(new RegExp(/initialDateReference/g)) !== null) {
                ids.push(parseInt(f.split("initialDateReference")[1], 10));
            }
        }
        ids.sort(function(a, b) {
            return a - b;
        });

        return ids.length ? ids[ids.length - 1] + 1 : 0;
    },
    getFinalDateReferenceId: function() {
        var _self = this;
        var blockColumns = _self.layoutObject.blocks[_self.getData().parentBlockId].records[_self.getData().parentRecordId].columns;
        var ids = [];
        for (var f in blockColumns) {
            if (f.match(new RegExp(/finalDateReference/g)) !== null) {
                ids.push(parseInt(f.split("finalDateReference")[1], 10));
            }
        }
        ids.sort(function(a, b) {
            return a - b;
        });

        return ids.length ? ids[ids.length - 1] + 1 : 0;
    },
    getExecutionDateId: function() {
        var _self = this;
        var _self = this;
        var blockColumns = _self.layoutObject.blocks[_self.getData().parentBlockId].records[_self.getData().parentRecordId].columns;
        var ids = [];
        for (var f in blockColumns) {
            if (f.match && f.match(new RegExp(/DTE[0-9]*/g)) !== null) {
                ids.push(parseInt(f.split("DTE")[1], 10));
            }
        }
        ids.sort(function(a, b) {
            return a - b;
        });

        return ids.length ? ids[ids.length - 1] + 1 : 0;
    },
    getExecutionHourId: function() {
        var _self = this;
        var _self = this;
        var blockColumns = _self.layoutObject.blocks[_self.getData().parentBlockId].records[_self.getData().parentRecordId].columns;
        var ids = [];
        for (var f in blockColumns) {
            if (f.match && f.match(new RegExp(/HRE[0-9]*/g)) !== null) {
                ids.push(parseInt(f.split("HRE")[1], 10));
            }
        }
        ids.sort(function(a, b) {
            return a - b;
        });

        return ids.length ? ids[ids.length - 1] + 1 : 0;
    },
    getListFieldId: function() {
        var _self = this;
        var blockColumns = _self.layoutObject.blocks[_self.getData().parentBlockId].records[_self.getData().parentRecordId].columns;
        var ids = [];

        for (var f in blockColumns) {
            if (blockColumns[f].listField) {
                ids.push(parseInt(f.split(/lf\d\d/)[1], 10));
            }
        }
        ids.sort(function(a, b) {
            return a - b;
        });

        return ids.length ? ids[ids.length - 1] + 1 : 0;
    },
    addBlockStarter: function() {
        var _self = this;
        _self.blockStarter = _self.buildField({
            id: 'blockStarter',
            label: i18n('BLOCKSTARTER')
        }, _self.view.fieldList);
    },
    removeBlockStarter: function() {
        if (this.blockStarter) {
            this.blockStarter.removeRegister();
        }
    },
    loadFieldData: function(currentRecord) {
        var _self = this;
        var fields = {};
        if (typeof currentRecord.idStructure === "number") {
            currentRecord.idStructure = [currentRecord.idStructure];
        }
        if (typeof currentRecord.idStructure === "string") {
            currentRecord.idStructure = [Number(currentRecord.idStructure)];
        }

        for (var index = 0; index < currentRecord.idStructure.length; index++) {
            if (_self.coreServices.structure[currentRecord.idStructure[index]])
                fields[currentRecord.idStructure[index]] = _self.coreServices.structure[currentRecord.idStructure[index]].fields;
        }
        return fields;
    }
});