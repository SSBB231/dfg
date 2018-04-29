/*
@author: Kathia Barahona
09/11/2017
v.1.0
*/
/* global _ i18n*/
sap.ui.controller("app.controllers.editor.blockBuilder.blockBuilder", {
    setData: function(json, view) {
        var _self = this;
        _self.fieldDefinitions = {
            "^[0-9]+S[0-9]+C[0-9]*$": {
                "columnType": "StructureFieldColumn"
            },
            "^(recordId)[0-9]*$": {
                "columnType": "RecordIdColumn",
                "dialog": {
                    title: "ID " + i18n('RECORD'),
                    modal: true,
                    size: "small",
                    viewName: "app.views.dialogs.IdRecordDialog"
                },
                "sequence": "recordId",
                "defaultColumn": {
                    "recordId": {}
                },
                "label": "ID " + i18n('RECORD'),
                "iconFont": "Finance-and-Office",
                "icon": "tableview"
            },
            "^m[0-9]*$": {
                "columnType": "ManualParamColumn",
                "dialog": {
                    title: i18n('PARAMETRO'),
                    modal: true,
                    size: "big",
                    cssClass: "dfg-dialog parametro-dialog newFile",
                    viewName: "app.views.dialogs.ParamManual"
                },
                "label": {
                    "manualParam": {
                        "label": true
                    }
                },
                "iconFont": "Formatting-and-Tool",
                "icon": "textandtext",
                "sequence": "m",
                "defaultColumn": {
                    "fieldId": null,
                    "manualParam": {}
                }
            },
            "^fmf[0-9]*$": {
                "columnType": "FixedManualFieldColumn",
                "dialog": {
                    title: i18n('FIXED MANUAL FIELD'),
                    modal: true,
                    size: "wide",
                    cssClass: "dfg-dialog parametro-dialog newFile",
                    viewName: "app.views.dialogs.FixedManualField"
                },
                "iconFont": "Display-and-Setting",
                "icon": "orderedlist",
                "sequence": "fmf",
                "label": {
                    "fixedManualField": {
                        "name": true
                    }
                },
                "defaultColumn": {
                    "fieldId": null,
                    "fixedManualField": {}
                }
            },
            "^fxf[0-9]*$": {
                "columnType": "FixedFieldColumn",
                "dialog": {
                    title: i18n('FIXED FIELD'),
                    modal: true,
                    size: "big",
                    cssClass: "dfg-dialog parametro-dialog newFile",
                    viewName: "app.views.dialogs.fixField"
                },
                "iconFont": "Sign-and-Symbols",
                "icon": "locked",
                "sequence": "fxf",
                "label": {
                    "fixedField": {
                        "name": true
                    }
                },
                "defaultColumn": {
                    "fieldId": null,
                    "fixedField": {}
                }
            },
            "^sf[0-9]*$": {
                "columnType": "SequenceFieldColumn",
                "dialog": {
                    title: i18n("SEQUENCE"),
                    modal: true,
                    size: "medium",
                    viewName: "app.views.dialogs.sequenceFieldDialog"
                },
                "iconFont": "Sign-and-Symbols",
                "icon": "flow",
                "sequence": "sf",
                "label": {
                    "sequenceField": {
                        "label": true
                    }
                },
                "defaultColumn": {
                    "fieldId": null,
                    "sequenceField": {
                        "label": i18n("SEQUENCE")
                    }
                }
            },
            "^f[0-9]*$": {
                "columnType": "FillerColumn",
                "dialog": {
                    title: i18n("FILLER"),
                    modal: true,
                    size: "medium",
                    viewName: "app.views.dialogs.Filler"
                },
                "iconFont": "File-and-Folders",
                "icon": "fullbox",
                "sequence": "f",
                "defaultColumn": {
                    "fieldId": null,
                    "filler": {}
                },
                "label": {
                    "filler": {
                        "name": true
                    }
                }
            },
            "^v[0-9]*$": {
                "columnType": "VersionColumn",
                "dialog": {
                    title: i18n('VERSION'),
                    modal: true,
                    size: "medium",
                    viewName: "app.views.dialogs.VersionField"
                },
                "iconFont": "File-and-Folders",
                "icon": "docversion",
                "sequence": "v",
                "label": {
                    "version": {
                        "label": true
                    }
                },
                "defaultColumn": {
                    "fieldId": null,
                    "version": {}
                }
            },
            "^sp[0-9]*$": {
                "columnType": "ReferencePeriodColumn",
                "dialog": {
                    title: i18n('FORMAT'),
                    modal: true,
                    size: "wide",
                    outerClick: 'disabled',
                    disableOuterClick: true,
                    cssClass: "newFile",
                    viewName: "app.views.dialogs.format.Format"
                },
                "iconFont": "Time-and-Date",
                "icon": "calendar",
                "sequence": "sp",
                "label": true,
                "defaultColumn": {
                    fieldId: null,
                    isReferencePeriod: true,
                    label: i18n("REFERENCE PERIOD"),
                    format: {
                        date: {
                            separator: null,
                            day: null,
                            month: null,
                            year: null
                        }
                    }
                }
            },
            "^recordsTotals[0-9]*$": {
                "columnType": "RecordTotalColumn",
                "iconFont": "Sign-and-Symbols",
                "icon": "number",
                "sequence": "recordsTotals",
                "label": i18n("RECORDTOTAL"),
                "defaultColumn": {
                    fieldId: null,
                    isRecordsTotals: true
                },
                "dialog": {
                    title: i18n('RECORDTOTAL'),
                    modal: true,
                    size: "small",
                    outerClick: 'disabled',
                    disableOuterClick: true,
                    cssClass: "newFile",
                    viewName: "app.views.dialogs.totalRecord"
                }
            },
            "^initialDateReference[0-9]*$": {
                "columnType": "InitialDateReferenceColumn",
                "dialog": {
                    title: i18n('FORMAT'),
                    modal: true,
                    size: "wide",
                    outerClick: 'disabled',
                    disableOuterClick: true,
                    cssClass: "newFile",
                    viewName: "app.views.dialogs.format.Format"
                },
                "iconFont": "Time-and-Date",
                "icon": "calendar",
                "sequence": "initialDateReference",
                "label": true,
                "defaultColumn": {
                    fieldId: null,
                    "label": i18n("INITDATEREFERENCE"),
                    isInitialDateReference: true
                }
            },
            "^finalDateReference[0-9]*$": {
                "columnType": "FinalDateReferenceColumn",
                "dialog": {
                    title: i18n('FORMAT'),
                    modal: true,
                    size: "wide",
                    outerClick: 'disabled',
                    disableOuterClick: true,
                    cssClass: "newFile",
                    viewName: "app.views.dialogs.format.Format"
                },
                "iconFont": "Time-and-Date",
                "icon": "calendar",
                "sequence": "finalDateReference",
                "label": true,
                "defaultColumn": {
                    fieldId: null,
                    "label": i18n("FINALDATEREFERENCE"),
                    isFinalDateReference: true
                }
            },
            "^blockTotal[0-9]*$": {
                "columnType": "BlockTotalColumn",
                "iconFont": "Sign-and-Symbols",
                "icon": "number",
                "sequence": "blockTotal",
                "dialog": {
                    title: i18n('BLOCKTOTAL'),
                    modal: true,
                    size: "small",
                    outerClick: 'disabled',
                    disableOuterClick: true,
                    cssClass: "newFile",
                    viewName: "app.views.dialogs.totalBlock"
                },
                "label": i18n("BLOCKTOTAL"),
                "defaultColumn": {
                    fieldId: null,
                    isBlocksTotal: true,
                    notInclude: false
                }
            },
            "^totalsAll[0-9]*$": {
                "columnType": "TotalAllColumn",
                "iconFont": "Sign-and-Symbols",
                "icon": "number",
                "sequence": "totalsAll",
                "label": i18n("TOTALALL"),
                "defaultColumn": {
                    fieldId: null,
                    isTotalsAll: true
                }
            },
            "^totalChildRecord[0-9]*$": {
                "columnType": "TotalChildRecord",
                "iconFont": "Sign-and-Symbols",
                "icon": "number",
                "sequence": "totalChildRecord",
                "label": i18n("TOTALCHILDRECORD"),
                "defaultColumn": {
                    fieldId: null,
                    isChildTotal: true
                }
            },
            "^recordCounter[0-9]*$": {
                "columnType": "RecordCounter",
                "iconFont": "Sign-and-Symbols",
                "icon": "number",
                "sequence": "recordCounter",
                "label": i18n("RECORDCOUNTER"),
                "defaultColumn": {
                    fieldId: null,
                    isRecordCounter: true
                }
            },
            "^recordList[0-9]*$": {
                "columnType": "RecordList",
                "iconFont": "Display-and-Setting",
                "icon": "orderedlist",
                "sequence": "recordList",
                "label": i18n("RECORDLIST"),
                "defaultColumn": {
                    fieldId: null,
                    recordList: {},
                    manualParam: {}
                }
            },
            "^newline[0-9]*$": {
                "columnType": "LineBreakColumn",
                "iconFont": "Display-and-Setting",
                "icon": "indent",
                "sequence": "newline",
                "defaultColumn": {
                    fieldId: null,
                    isLineBreak: true
                },
                "label": i18n("NEWLINE")
            },
            "^DTE[0-9]*$": {
                "columnType": "ExecutionDateColumn",
                "dialog": {
                    title: i18n('FORMAT'),
                    modal: true,
                    size: "wide",
                    outerClick: 'disabled',
                    disableOuterClick: true,
                    cssClass: "newFile",
                    viewName: "app.views.dialogs.format.Format"
                },
                "iconFont": "Time-and-Date",
                "icon": "calendar",
                "sequence": "DTE",
                "label": true,
                "defaultColumn": {
                    fieldId: null,
                    "label": i18n("EXECUTION DATE"),
                    isExecutionDate: true
                }
            },
            "^HRE[0-9]*$": {
                "columnType": "ExecutionHourColumn",
                "dialog": {
                    title: i18n('FORMAT'),
                    modal: true,
                    size: "wide",
                    outerClick: 'disabled',
                    disableOuterClick: true,
                    cssClass: "newFile",
                    viewName: "app.views.dialogs.format.Format"
                },
                "iconFont": "Time-and-Date",
                "icon": "clock",
                "sequence": "HRE",
                "label": true,
                "defaultColumn": {
                    fieldId: null,
                    "label": i18n("EXECUTION HOUR"),
                    isExecutionHour: true
                }
            },
            "^O[0-9]*$": {
                "columnType": "OutputColumn",
                "iconFont": "File-and-Folders",
                "icon": "reportdoc",
                "sequence": "O",
                "label": {
                    "output": {
                        "label": true
                    }
                },
                "defaultColumn": {
                    "output": {

                    }
                }
            },
            "^BCB_[0-9]*$": {
                "columnType": "OutputColumn",
                "iconFont": "File-and-Folders",
                "icon": "reportdoc",
                "sequence": "BCB_",
                "label": {
                    "output": {
                        "label": true
                    }
                },
                "defaultColumn": {
                    "output": {

                    }
                }
            },
            "^BFB_[0-9]*$": {
                "columnType": "OutputColumn",
                "iconFont": "File-and-Folders",
                "icon": "reportdoc",
                "sequence": "BFB_",
                "label": {
                    "output": {
                        "label": true
                    }
                },
                "defaultColumn": {
                    "output": {

                    }
                }
            },
            "^lf[0-9]*$": {
                "columnType": "ListFieldColumn",
                "dialog": {
                    title: i18n("LIST FIELD"),
                    modal: true,
                    size: "wide",
                    viewName: "app.views.dialogs.listField.listFieldDialog"
                },
                "iconFont": "Display-and-Setting",
                "icon": "thumblist",
                "sequence": "lf",
                "label": {
                    "listField": {
                        "name": true
                    }
                },
                "defaultColumn": {
                    "fieldId": null,
                    "listField": {

                    }
                }
            },
            "^groupedLines[0-9]*$": {
                "columnType": "GroupedLinesColumn",
                "dialog": {
                    "title": i18n("GROUPED LINES FIELD"),
                    "modal": true,
                    "size": "medium",
                    "viewName": "app.views.dialogs.groupedLinesDialog"
                },
                "iconFont": "Sign-and-Symbols",
                "icon": "number",
                "sequence": "groupedLines",
                "label": true,
                "defaultColumn": {
                    "fieldId": null,
                    "label": i18n("GROUPED LINES FIELD"),
                    "groupedLines": {
                        "structureId": -1,
                        "groupId": -1
                    }
                }

            }
        };
        _self.json = json;
        _self.blockReferences = {};
        if (_self.structure) {
            _self.id_structure = {};
            _self.structureId_fields = {};
            _self.structure.map(function(structure) {
                _self.structureId_fields[structure.id] = structure.fields;
                _self.id_structure[structure.id] = structure;
            });
        }
        if (_self.json && _self.json.positions) {
            for (var p = 0; p < _self.json.positions.length; p++) {
                _self.json.positions[p] += "";
                for (var r = 0; r < _self.json.blocks[_self.json.positions[p]].positions.length; r++) {
                    _self.json.blocks[_self.json.positions[p]].positions[r] += "";
                }
            }
        }
        _self.view = view[0];
        _self.renderBlocks(_self.json, view);
        _self.bindBlockNavigator();
    },
    renderBlocks: function(json, view) {
        var _self = this;
        var documentFragment = document.createDocumentFragment();
        _self.lastBlockId = 0;
        if (_.isObjectLike(json) && _.isArray(json.positions) && _.isObjectLike(json.blocks)) {
            for (var pos = 0; pos < json.positions.length; pos++) {
                if (_self.lastBlockId <= parseInt(json.positions[pos], 10)) {
                    _self.lastBlockId = parseInt(json.positions[pos], 10) + 1;
                }
                _self.buildBlock(json.positions[pos], json.blocks[json.positions[pos]], documentFragment);
            }
        }
        _self.updateCounts();
        view.append(documentFragment);
    },
    addBlock: function(block, groups) {
        var _self = this;
        if (!_self.json.positions) {
            _self.json.positions = [];
        }
        if (!_self.json.blocks) {
            _self.json.blocks = {};
        }
        _self.json.positions.push(_self.lastBlockId + "");
        _self.json.blocks[_self.lastBlockId + ""] = block || {
            "name": "",
            "positions": [],
            "records": {}
        };
        if (groups && _self.json.groups) {
            _self.json.groups.blocks[_self.lastBlockId] = groups;
        }
        _self.buildBlock(_self.lastBlockId, _self.json.blocks[_self.lastBlockId], _self.view);
        var mainContainer = _self.blockReferences[_self.lastBlockId].blockReference.parent().parent();
        var blockContainer = $(".block-wrapper[block-id='" + _self.lastBlockId + "']");
        var scrollTop = mainContainer.scrollTop() + blockContainer.offset().top - blockContainer.height();
        _self.blockReferences[_self.lastBlockId].blockReference.parent().parent().animate({
            scrollTop: scrollTop
        }, 500);
        _self.lastBlockId++;
        _self.bindBlockNavigator();
        _self.updateCounts();
        _self.coreServices.visualization.renderTable(); 
    },
    addRecord: function(blockId, record, groups) {
        var _self = this;
        if (blockId && _self.json.blocks[blockId]) {
            var recordId = _self.blockReferences[blockId].lastRecordId + "";
            if (groups && _self.json.groups) {
                if (!_self.json.groups.blocks[blockId]) {
                    _self.json.groups.blocks[blockId] = {
                        records: {}
                    };
                }
                _self.json.groups.blocks[blockId].records[recordId] = groups;
            }
            _self.coreServices.lastChanges.push({
                message: {
                    enus: "A new record was added",
                    ptrbr: "Um novo registro foi adicionado"
                },
                blockId: blockId,
                recordId: recordId,
                type: 2
            });
            _self.json.blocks[blockId].positions.push(_self.blockReferences[blockId].lastRecordId + "");
            _self.json.blocks[blockId].records[_self.blockReferences[blockId].lastRecordId + ""] = record;
            var page = Math.ceil(_self.json.blocks[blockId].positions.length / 10);
            var paginator = _self.blockReferences[blockId].paginator._html.parent();
            paginator.empty();
            _self.blockReferences[blockId].paginator = paginator.bindBasePaginator({
                totalPages: Math.ceil(_self.json.blocks[blockId].positions.length / 10),
                blockId: blockId,
                onPageChange: function(oldVal, newVal) {
                    var startIndex = (newVal - 1) * 10;
                    var endIndex = startIndex + (10);
                    var block = _self.json.blocks[this.blockId];
                    _self.blockReferences[this.blockId].blockReference.find(".records-container").empty();
                    _self.blockReferences[this.blockId].positions = [];
                    for (var pos = startIndex; pos < endIndex; pos++) {
                        if (block.positions.length > pos) {
                            _self.buildRecord(this.blockId, block.positions[pos], block.records[block.positions[pos]], _self.blockReferences[this.blockId].blockReference
                                .find(".records-container")[0]);
                            if (pos === endIndex - 1) {
                                _self.blockReferences[blockId].loader.close();
                            }
                        } else {
                            _self.blockReferences[blockId].loader.close();
                            break;
                        }
                    }
                    _self.updateJSON();
                    _self.coreServices.visualization.renderTable(); 
                }
            });
            _self.blockReferences[blockId].paginator.moveToPage(page);
            setTimeout(function(e) {
                var mainContainer = _self.blockReferences[blockId].blockReference.parent().parent();
                var blockContainer = $(".block-wrapper[block-id='" + blockId + "']");
                var recordContainer = $(".record-wrapper[block-id='" + blockId + "'][record-id='" + recordId +
                    "']");
                var scrollTop = mainContainer.scrollTop() + recordContainer.offset().top - recordContainer.height();
                _self.blockReferences[blockId].blockReference.parent().parent().animate({
                    scrollTop: scrollTop
                }, 500);
            }, 500);
            _self.updateCounts();
            _self.bindBlockNavigator();
            _self.blockReferences[blockId].lastRecordId++;
        }
        
    },
    buildBlock: function(blockId, block, view) {
        var _self = this;
        let isPreview = this.coreServices.exhibition;
        //-----------------MAIN CONTAINER CREATION------------------------//
        var blockContainer = document.createElement("div");
        view.appendChild(blockContainer);
        blockContainer.classList.add("block-wrapper");
        blockContainer.setAttribute("block-id", blockId + "");
        _self.blockReferences[blockId] = {
            records: {},
            positions: []
        };
        _self.blockReferences[blockId].loader = $(blockContainer).baseLoader();
        _self.blockReferences[blockId].blockReference = $(blockContainer);

        //-----------------HEADER CONTAINER CREATION--------------------------//
        var blockHeader = document.createElement("div");
        blockHeader.classList.add("block-header");
        var blockInnerHeader = document.createElement("div");
        blockInnerHeader.classList.add("block-inner-header");
        blockHeader.appendChild(blockInnerHeader);
        var blockLabel = document.createElement("div");
        blockLabel.classList.add("block-label");
        blockLabel.textContent = i18n("BLOCK");
        blockInnerHeader.appendChild(blockLabel);
        // name input
        var blockNameInput = document.createElement("div");
        blockNameInput.classList.add("block-name");
        _self.blockReferences[blockId].blockNameCtrl = $(blockNameInput).bindBaseInputKat({
            isDisabled: isPreview,
            "tooltip": i18n('BLOCK INPUT PLACEHOLDER'),
            "placeholder": i18n('BLOCK INPUT TOOLTIP'),
            "blockId": blockId,
            "onChange": function(oldVal, newVal) {
                _self.json.blocks[blockId].name = newVal;
                $(".navigator-list .block-li[block-id='" + this.blockId + "'] .block-li-header .name")[0].textContent = i18n("BLOCK") + ": " + newVal;
                _self.coreServices.visualization.renderTable(); 
            },
            "type": "string"
        });
        _self.blockReferences[blockId].blockNameCtrl.setText(block.name, true);
        blockInnerHeader.appendChild(blockNameInput);
        //add recordBtn
        var addRecordBtnWrapper = document.createElement("div");
        addRecordBtnWrapper.classList.add("add-record-wrapper");
        var addRecordBtn = document.createElement("button");
        addRecordBtn.textContent = i18n("ADD RECORD");
        addRecordBtn.classList.add("btn", "trans", "btn-add-register");
        addRecordBtnWrapper.appendChild(addRecordBtn);
        addRecordBtnWrapper.onclick = function(evt) {
            var blockId = this.parentElement.parentElement.parentElement.getAttribute("block-id");
            _self.addRecord(blockId, {
                "columns": {},
                "name": "",
                "positions": [],
                "idStructure": []
            });
        };
        if (!isPreview) {
            blockInnerHeader.appendChild(addRecordBtnWrapper);
        }

        //delete block btn
        var blockDelete = document.createElement("div");
        blockDelete.classList.add("block-delete-btn");
        var blockSpan = document.createElement("span");
        blockSpan.classList.add("icon", "icon-font-Sign-and-Symbols", "icon-persign");
        blockDelete.appendChild(blockSpan);
        blockDelete.onclick = function(evt) {
            var blockContainer = this.parentElement.parentElement.parentElement;
            var blockId = blockContainer.getAttribute("block-id");
            _self.json.positions.splice(_self.json.positions.indexOf(blockId), 1);
            _self.blockReferences[blockId].blockReference.remove();
            _self.coreServices.lastChanges.push({
                message: {
                    enus: "A block was removed",
                    ptrbr: "Um bloco foi removido"
                },
                blockName: _self.json.blocks[blockId].name,
                type: 4
            });
            delete _self.blockReferences[blockId];
            delete _self.json.blocks[blockId];
            _self.bindBlockNavigator();
            _self.updateCounts();
            _self.coreServices.visualization.renderTable();
            _self.coreServices.visualization.deleteBlock(blockId);
        };
        if (!isPreview) {
            blockInnerHeader.appendChild(blockDelete);
        }

        //expand block btn
        var blockExpand = document.createElement("div");
        blockExpand.classList.add("block-expand-btn");
        var blockExpandIcon = document.createElement("span");
        blockExpandIcon.classList.add("icon", "icon-font-Sign-and-Symbols", "icon-upmenu");
        blockExpand.appendChild(blockExpandIcon);
        blockExpand.onclick = function(evt) {
            var blockContainer = this.parentElement.parentElement.parentElement;
            var span = $(this).find("span")[0];
            if (span.classList.contains("icon-downmenu")) {
                $(blockContainer).find(".records-container").slideDown();
                span.classList.remove("icon-downmenu");
                span.classList.add("icon-upmenu");
            } else {
                $(blockContainer).find(".records-container").slideUp();
                span.classList.remove("icon-upmenu");
                span.classList.add("icon-downmenu");
            }
        };
        blockInnerHeader.appendChild(blockExpand);
        blockContainer.appendChild(blockHeader);
        //------------------RECORDS CONTAINER CREATION-----------------------------//
        var recordsContainer = document.createElement("div");
        recordsContainer.classList.add("records-container");
        _self.blockReferences[blockId].lastRecordId = 0;
        block.positions.map(function(p) {
            if (_self.blockReferences[blockId].lastRecordId <= parseInt(p, 10)) {
                _self.blockReferences[blockId].lastRecordId = parseInt(p, 10) + 1;
            }
        });
        _self.blockReferences[blockId].loader.open();
        for (var pos = 0; pos < 10; pos++) {
            if (block.positions.length > pos) {
                _self.buildRecord(blockId, block.positions[pos], block.records[block.positions[pos]], recordsContainer);
                if (pos === 9) {
                    _self.blockReferences[blockId].loader.close();
                }
            } else {
                _self.blockReferences[blockId].loader.close();
                break;
            }
        }
        blockContainer.appendChild(recordsContainer);
        //-------------------PAGINATOR CREATION-------------------------------------//
        var paginatorContainer = document.createElement("div");
        paginatorContainer.classList.add("paginator-container");
        _self.blockReferences[blockId].paginator = $(paginatorContainer).bindBasePaginator({
            totalPages: Math.ceil(block.positions.length / 10),
            actualPage: 1,
            blockId: blockId,
            onPageChange: function(oldVal, newVal) {
                var startIndex = (newVal - 1) * 10;
                var endIndex = startIndex + 10;
                var block = _self.json.blocks[this.blockId];
                _self.blockReferences[this.blockId].blockReference.find(".records-container").empty();
                _self.blockReferences[blockId].loader.open();
                _self.blockReferences[this.blockId].positions = [];
                for (var pos = startIndex; pos < endIndex; pos++) {
                    if (block.positions.length > pos) {
                        _self.buildRecord(this.blockId, block.positions[pos], block.records[block.positions[pos]], _self.blockReferences[this.blockId].blockReference
                            .find(".records-container")[0]);
                        if (pos === endIndex - 1) {
                            _self.blockReferences[blockId].loader.close();
                        }
                    } else {
                        _self.blockReferences[blockId].loader.close();
                        break;
                    }
                }
                _self.updateJSON();
            }
        });
        blockContainer.appendChild(paginatorContainer);

        _self.updateJSON();
    },
    buildRecord: function(blockId, recordId, record, view) {
        var _self = this;
        let isPreview = this.coreServices.exhibition;
        _self.visitedSpedMappingKey = {};
        //-----------------MAIN CONTAINER CREATION------------------------//
        var recordContainer = document.createElement("div");
        recordContainer.classList.add("record-wrapper");
        recordContainer.setAttribute("record-id", recordId + "");
        recordContainer.setAttribute("block-id", blockId + "");
        _self.blockReferences[blockId].positions.push(recordId + "");
        _self.blockReferences[blockId].records[recordId + ""] = {
            columns: {},
            positions: [],
            columnCounters: {}
        };
        _self.blockReferences[blockId].records[recordId].recordReference = $(recordContainer);

        //-----------------HEADER CONTAINER CREATION--------------------------//
        var recordHeader = document.createElement("div");
        recordHeader.classList.add("record-header");
        var recordInnerHeader = document.createElement("div");
        recordInnerHeader.classList.add("record-inner-header");
        recordHeader.appendChild(recordInnerHeader);
        var recordLabel = document.createElement("div");
        recordLabel.classList.add("record-label");
        recordLabel.textContent = i18n("RECORD");
        recordInnerHeader.appendChild(recordLabel);
        // name input
        var recordNameInput = document.createElement("div");
        recordNameInput.classList.add("record-name");
        _self.blockReferences[blockId].records[recordId].recordNameCtrl = $(recordNameInput).bindBaseInputKat({
            isDisabled: isPreview,
            "tooltip": i18n('RECORD INPUT PLACEHOLDER'),
            "placeholder": i18n('RECORD INPUT TOOLTIP'),
            "blockId": blockId,
            "recordId": recordId,
            "onChange": function(oldVal, newVal) {
                _self.json.blocks[blockId].records[recordId].name = newVal;
                $(".navigator-list .record-list .record-li[block-id='" + blockId + "'][record-id='" + recordId + "']")[0].textContent = i18n("RECORD") +
                    ": " + newVal;
                    
                _self.coreServices.visualization.renderTable(); 
            },
            "type": "string"
        });
        _self.blockReferences[blockId].records[recordId].recordNameCtrl.setText(record.name, true);
        recordInnerHeader.appendChild(recordNameInput);
        var distinctCB = document.createElement("div");
        distinctCB.classList.add("distinct-cb");
        $(distinctCB).bindBaseCheckbox({
            id: blockId + "-" + recordId + "distinct",
            reference: recordContainer,
            text: i18n("DISTINCT"),
            onChange: function(oldVal, newVal) {
                _self.json.blocks[this._data.reference.getAttribute("block-id")].records[this._data.reference.getAttribute("record-id")].isDistinct =
                    newVal;
            },
            isChecked: record.isDistinct
        });
        if (!isPreview) {
            recordInnerHeader.appendChild(distinctCB);
        }
        //order by 
        var orderByBtn = document.createElement("div");
        orderByBtn.classList.add("btn-add-order-by");
        orderByBtn.textContent = i18n("ORDER BY");
        orderByBtn.onclick = function() {
            var blockId = this.parentElement.parentElement.parentElement.parentElement.getAttribute("block-id");
            var recordId = this.parentElement.parentElement.parentElement.parentElement.getAttribute("record-id");
            _self.orderBy = $.baseDialog({
                title: i18n("ORDER BY"),
                modal: true,
                size: "medium",
                outerClick: 'disabled',
                viewName: "app.views.editor.orderByDialog",
                viewData: {
                    parentRecordId: recordId,
                    parentBlockId: blockId
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
                            _self.coreServices.layoutObject.blocks[blockId].records[recordId].orderBy = _self.orderBy.getInnerController().getOrderData();
                            _self.json.blocks[blockId].records[recordId].orderBy = _self.orderBy.getInnerController().getOrderData();
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
        };
        if (!isPreview) {
            distinctCB.appendChild(orderByBtn);
        }
        //delete record btn
        var recordDelete = document.createElement("div");
        recordDelete.classList.add("record-delete-btn");
        var recordSpan = document.createElement("span");
        recordSpan.classList.add("icon", "icon-font-Sign-and-Symbols", "icon-persign");
        recordDelete.appendChild(recordSpan);
        recordDelete.onclick = function(evt) {
            var recordContainer = this.parentElement.parentElement.parentElement;
            var blockId = recordContainer.getAttribute("block-id");
            var recordId = recordContainer.getAttribute("record-id");
            _self.json.blocks[blockId].positions.splice(_self.json.blocks[blockId].positions.indexOf(recordId), 1);
            _self.blockReferences[blockId].positions.splice(_self.blockReferences[blockId].positions.indexOf(recordId), 1);
            _self.coreServices.lastChanges.push({
                message: {
                    enus: "A record was removed",
                    ptrbr: "Um registro foi removido"
                },
                blockName: _self.json.blocks[blockId].name,
                recordName: _self.json.blocks[blockId].records[recordId].name,
                type: 5
            });
            delete _self.json.blocks[blockId].records[recordId];
            delete _self.blockReferences[blockId].records[recordId];
            _self.coreServices.visualization.renderTable(); 
            _self.coreServices.visualization.deleteRecord(blockId, recordId);
            $(recordContainer).remove();
            var actualPage = _self.blockReferences[blockId].paginator.getActualPage();
            var paginator = _self.blockReferences[blockId].paginator._html.parent();
            paginator.empty();
            _self.blockReferences[blockId].paginator = paginator.bindBasePaginator({
                totalPages: Math.ceil(_self.json.blocks[blockId].positions.length / 10),
                actualPage: -1,
                blockId: blockId,
                onPageChange: function(oldVal, newVal) {
                    var startIndex = (newVal - 1) * 10;
                    var endIndex = startIndex + (10);
                    var block = _self.json.blocks[this.blockId];
                    _self.blockReferences[this.blockId].blockReference.find(".records-container").empty();
                    _self.blockReferences[this.blockId].positions = [];
                    for (var pos = startIndex; pos < endIndex; pos++) {
                        if (block.positions.length > pos) {
                            _self.buildRecord(this.blockId, block.positions[pos], block.records[block.positions[pos]], _self.blockReferences[this.blockId].blockReference
                                .find(".records-container")[0]);
                            if (pos === endIndex - 1) {
                                _self.blockReferences[blockId].loader.close();
                            }
                        } else {
                            _self.blockReferences[blockId].loader.close();
                            break;
                        }
                    }
                    _self.updateJSON();
                }
            });
            _self.blockReferences[blockId].paginator.moveToPage(actualPage);
            _self.updateCounts();
            _self.bindBlockNavigator();
        };
        if (!isPreview) {
            recordInnerHeader.appendChild(recordDelete);
        }

        //expand record btn
        var recordExpand = document.createElement("div");
        recordExpand.classList.add("record-expand-btn");
        var recordExpandIcon = document.createElement("span");
        recordExpandIcon.classList.add("icon", "icon-font-Sign-and-Symbols", "icon-upmenu");
        recordExpand.appendChild(recordExpandIcon);
        recordExpand.onclick = function(evt) {
            var recordContainer = this.parentElement.parentElement.parentElement;
            var span = $(this).find("span")[0];
            if (span.classList.contains("icon-downmenu")) {
                $(recordContainer).find(".columns-container").slideDown(300);
                span.classList.remove("icon-downmenu");
                span.classList.add("icon-upmenu");
            } else {
                $(recordContainer).find(".columns-container").slideUp(300);
                span.classList.remove("icon-upmenu");
                span.classList.add("icon-downmenu");
            }
        };
        recordInnerHeader.appendChild(recordExpand);
        recordContainer.appendChild(recordHeader);
        //------------------FIELDS CONTAINER CREATION-----------------------------//
        var columnsContainer = document.createElement("div");
        columnsContainer.classList.add("columns-container");
        var columnsWrapper = document.createElement("div");
        columnsWrapper.classList.add("columns-wrapper");
        columnsContainer.appendChild(columnsWrapper);
        record.positions.map(function(pos) {
            _self.buildColumn(blockId, recordId, pos, record.columns[pos], columnsWrapper);
        });
        $(columnsWrapper).sortable({
            cursor: "move",
            placeholder: 'record-field-placeholder',
            stop: function(evt, ui) {
                var blockId = ui.item[0].getAttribute("block-id");
                var recordId = ui.item[0].getAttribute("record-id");
                var columnId = ui.item[0].getAttribute("column-id");
                var index = ui.item.index();
                var lastIndex = _self.blockReferences[blockId].records[recordId].positions.indexOf(columnId);
                _self.blockReferences[blockId].records[recordId].positions.splice(lastIndex, 1);
                _self.blockReferences[blockId].records[recordId].positions.splice(index, 0, columnId);
                _self.json.blocks[blockId].records[recordId].positions.splice(lastIndex, 1);
                _self.json.blocks[blockId].records[recordId].positions.splice(index, 0, columnId);
            }
        });
        $(columnsWrapper).droppable({
            accept: '.item-wrapper.child-item ',
            hoverClass: 'droppable-active',
            activeClass: 'droppable-active',
            drop: _self.dropField.bind(_self),
            classes: {
                "ui-droppable": "highlight"
            }
        });
        recordContainer.appendChild(columnsContainer);
        view.appendChild(recordContainer);
    },
    dropField: function(e, ui) {
        var _self = this;
        var blockId = e.target.parentElement.parentElement.getAttribute("block-id");
        var recordId = e.target.parentElement.parentElement.getAttribute("record-id");
        var columnId = ui.draggable[0].getAttribute("data-id");
        var columnType = ui.draggable[0].getAttribute("data-columnType");
        var columnDefinition;
        if (columnType !== "FormulaColumn" && columnType !== "StructureFieldColumn" && columnType !== "OutputColumn") {
            columnDefinition = _self.getColumnDefinition(columnId);
        } else if (columnType !== "StructureFieldColumn" && columnType !== "OutputColumn") {
            columnDefinition = {
                "dialog": {
                    "title": i18n('FORMULA BUILDER'),
                    "modal": true,
                    "size": "big",
                    "cssClass": "brb-dialog formula-dialog newFile dfg-formula-dialog",
                    "viewName": "app.views.editor.DesignFormula"
                },
                "defaultColumn": {
                    "fieldId": null,
                    "formula": {

                    }
                },
                "sequence": "f"
            };
        } else {
            columnDefinition = {};
        }
        if (!_self.blockReferences[blockId].records[recordId].columnCounters[columnType]) {
            _self.blockReferences[blockId].records[recordId].columnCounters[columnType] = 0;
        }
        if (columnDefinition.dialog) {
            if (columnType === "FormulaColumn") {
                columnId = columnDefinition.sequence + _self.blockReferences[blockId].records[recordId].columnCounters[columnType];
            } else {
                columnId = columnDefinition.sequence + blockId + recordId + _self.blockReferences[blockId].records[recordId].columnCounters[columnType];
            }
            _self.openDialog(blockId, recordId, columnId, JSON.parse(JSON.stringify(columnDefinition.defaultColumn)), columnDefinition.dialog, e.target,
                false, true);
        } else {
            var column = columnDefinition.defaultColumn;
            if (columnType === "StructureFieldColumn") {
                column = {
                    "fieldId": parseInt(columnId, 10),
                    "idStructure": parseInt(ui.draggable[0].getAttribute("data-idstructure"), 10)
                };
                if (_self.blockReferences[blockId].records[recordId].columnCounters[column.idStructure + "S" + column.fieldId] === undefined) {
                    _self.blockReferences[blockId].records[recordId].columnCounters[column.idStructure + "S" + column.fieldId] = 0;
                }
                columnId = column.idStructure + "S" + column.fieldId + "C" + _self.blockReferences[blockId].records[recordId].columnCounters[column.idStructure +
                    "S" + column.fieldId];
                _self.blockReferences[blockId].records[recordId].columnCounters[column.idStructure + "S" + column.fieldId]++;
            } else if (columnType === "OutputColumn") {
                var outputType = ui.draggable[0].getAttribute("data-type");
                column = {
                    output: JSON.parse(ui.draggable[0].getAttribute("data-outputMetadata"))
                };
                if (outputType === "BRB:OUTPUT") {
                    column.output.label = column.output.metadata.name;
                    columnId = "O" + blockId + recordId + _self.blockReferences[blockId].records[recordId].columnCounters[columnType];
                } else if (outputType === "BCB:OUTPUT") {
                    column.output.label = column.output.name;
                    columnId = "BCB_" + blockId + recordId + _self.blockReferences[blockId].records[recordId].columnCounters[columnType];
                } else {
                    column.output.label = column.output.name;
                    columnId = "BFB_" + blockId + recordId + _self.blockReferences[blockId].records[recordId].columnCounters[columnType];
                }
            } else {
                columnId = columnDefinition.sequence + blockId + recordId + _self.blockReferences[blockId].records[recordId].columnCounters[columnType];
            }
            _self.buildColumn(blockId, recordId, columnId, JSON.parse(JSON.stringify(column)), e.target, true);
            _self.updateJSON();
        }
    },
    buildColumn: function(blockId, recordId, columnId, column, view, dropped) {
        var _self = this;
        var columnDefinition = _self.getColumnDefinition(columnId);
        var icon, iconFont, label, onclick;
        var tooltip;
        let isPreview = this.coreServices.exhibition;
        if (columnDefinition) {
            if (columnDefinition.columnType === "OutputColumn") {
                var count = parseInt(columnId.split(columnDefinition.sequence + blockId + recordId)[1], 10);
                if (_self.blockReferences[blockId].records[recordId].columnCounters[columnDefinition.columnType] === undefined) {
                    _self.blockReferences[blockId].records[recordId].columnCounters[columnDefinition.columnType] = count + 1;
                } else if (_self.blockReferences[blockId].records[recordId].columnCounters[columnDefinition.columnType] < count) {
                    _self.blockReferences[blockId].records[recordId].columnCounters[columnDefinition.columnType] = count + 1;
                }
            }
            if (columnDefinition.columnType !== "StructureFieldColumn" && !_.isObjectLike(column.formula)) {
                _self.visitedSpedMappingKey = _self.visitedSpedMappingKey || {};
                let record = _self.json.blocks[blockId].records[recordId];
                let spedMappingKeys = _.filter(_.keys(record.spedMapping), function(key) {
                    return record.spedMapping[key] === columnId && !_self.visitedSpedMappingKey[key];
                });
                if (!_self.blockReferences[blockId].records[recordId].columnCounters[columnDefinition.columnType]) {
                    _self.blockReferences[blockId].records[recordId].columnCounters[columnDefinition.columnType] = 0;
                }
                columnId = columnDefinition.sequence + blockId + recordId + _self.blockReferences[blockId].records[recordId].columnCounters[
                    columnDefinition.columnType];
                _.forEach(spedMappingKeys, function(key) {
                    record.spedMapping[key] = columnId;
                    _self.visitedSpedMappingKey[key] = true;
                });
                icon = columnDefinition.icon;
                iconFont = columnDefinition.iconFont;
                if (typeof columnDefinition.label === "string") {
                    label = columnDefinition.label;
                } else if (columnDefinition.label === true) {
                    label = column.label || columnDefinition.defaultColumn.label;
                } else {
                    var prop = columnDefinition.label;
                    var columnCopy = JSON.parse(JSON.stringify(column));
                    var defaultColumnCopy = JSON.parse(JSON.stringify(columnDefinition.defaultColumn));
                    while (prop[Object.keys(prop)[0]] !== true) {
                        columnCopy = columnCopy[Object.keys(prop)[0]];
                        defaultColumnCopy = defaultColumnCopy[Object.keys(prop)[0]];
                        prop = prop[Object.keys(prop)[0]];
                    }
                    label = columnCopy[Object.keys(prop)[0]] || defaultColumnCopy[Object.keys(prop)[0]];
                }
                _self.blockReferences[blockId].records[recordId].columnCounters[columnDefinition.columnType]++;
            } else if (_.isObjectLike(column.formula)) {
                if (!_self.blockReferences[blockId].records[recordId].columnCounters.FormulaColumn) {
                    _self.blockReferences[blockId].records[recordId].columnCounters.FormulaColumn = parseInt(columnId.split("f")[1], 10);
                } else if (parseInt(columnId.split("f")[1], 10) > _self.blockReferences[blockId].records[recordId].columnCounters.FormulaColumn) {
                    _self.blockReferences[blockId].records[recordId].columnCounters.FormulaColumn = parseInt(columnId.split("f")[1], 10);
                }
                columnDefinition = {
                    "dialog": {
                        "title": i18n('FORMULA BUILDER'),
                        "modal": true,
                        "size": "big",
                        "cssClass": "brb-dialog formula-dialog newFile dfg-formula-dialog",
                        "viewName": "app.views.editor.DesignFormula"
                    },
                    "sequence": "f"
                };
                _self.blockReferences[blockId].records[recordId].columnCounters.FormulaColumn++;
                if (!_self.json.blocks[blockId].records[recordId].idStructure) {
                    _self.json.blocks[blockId].records[recordId].idStructure = [];
                }
                if (!_.isArray(column.formula.idStructure)) {
                    if (_self.json.blocks[blockId].records[recordId].idStructure.indexOf(parseInt(column.formula.idStructure, 10)) === -1 && _self.json.blocks[
                            blockId].records[recordId].idStructure.indexOf(column.formula.idStructure + "") === -1) {
                        _self.json.blocks[blockId].records[recordId].idStructure.push(parseInt(column.formula.idStructure, 10));
                    }
                } else {
                    column.formula.idStructure.map(function(idStructure) {
                        if (_self.json.blocks[blockId].records[recordId].idStructure.indexOf(parseInt(idStructure, 10)) === -1 && _self.json.blocks[blockId]
                            .records[recordId].idStructure.indexOf(idStructure + "") === -1) {
                            _self.json.blocks[blockId].records[recordId].idStructure.push(parseInt(idStructure, 10));
                        }
                    });
                }
                label = column.formula.label;
                iconFont = "Finance-and-Office";
                icon = "function";
            }
            if (columnDefinition.columnType === "StructureFieldColumn") {
                var count = parseInt(columnId.split("C")[1], 10);
                if (_self.blockReferences[blockId].records[recordId].columnCounters[column.idStructure + "S" + column.fieldId] === undefined) {
                    _self.blockReferences[blockId].records[recordId].columnCounters[column.idStructure + "S" + column.fieldId] = count + 1;
                } else if (_self.blockReferences[blockId].records[recordId].columnCounters[column.idStructure + "S" + column.fieldId] < count) {
                    _self.blockReferences[blockId].records[recordId].columnCounters[column.idStructure + "S" + column.fieldId] = count + 1;
                }
                if (!_self.json.blocks[blockId].records[recordId].idStructure) {
                    _self.json.blocks[blockId].records[recordId].idStructure = [];
                }
                if (_self.json.blocks[blockId].records[recordId].idStructure.indexOf(parseInt(column.idStructure, 10)) === -1 && _self.json.blocks[
                        blockId].records[recordId].idStructure.indexOf(column.idStructure + "") === -1) {
                    _self.json.blocks[blockId].records[recordId].idStructure.push(parseInt(column.idStructure, 10));
                }
                tooltip = {
                    class: "dark",
                    "text": _self.id_structure[column.idStructure].title,
                    "position": "top"
                };
                label = _self.structureId_fields[column.idStructure][column.fieldId].label;
                switch (_self.structureId_fields[column.idStructure][column.fieldId].simpleType) {
                    case "NUMBER":
                        iconFont = "Sign-and-Symbols";
                        icon = "number";
                        break;
                    case "STRING":
                        iconFont = "Sign-and-Symbols";
                        icon = "string";
                        break;
                    case "DATE":
                        iconFont = "Time-and-Date";
                        icon = "calendar";
                        break;
                }
            }
            _self.blockReferences[blockId].records[recordId].positions.push(columnId);
            _self.blockReferences[blockId].records[recordId].columns[columnId] = {
                "column": column
            };

            //------------------BUILDING FIELD-----------------//
            var fieldContainer = document.createElement("div");
            if (columnDefinition.dialog && !isPreview) {
                $(fieldContainer).off('click').on('click', function(e) {
                    var columnId = this.getAttribute("column-id");
                    var blockId = this.parentElement.parentElement.parentElement.getAttribute("block-id");
                    var recordId = this.parentElement.parentElement.parentElement.getAttribute("record-id");
                    var column = _self.json.blocks[blockId].records[recordId].columns[columnId];
                    var columnDefinition = _self.getColumnDefinition(columnId);
                    if (column.formula) {
                        columnDefinition = {
                            "dialog": {
                                "title": i18n('FORMULA BUILDER'),
                                "modal": true,
                                "size": "big",
                                "cssClass": "brb-dialog formula-dialog newFile dfg-formula-dialog",
                                "viewName": "app.views.editor.DesignFormula"
                            },
                            "sequence": "f"
                        };
                    }
                    _self.openDialog(blockId, recordId, columnId, column, columnDefinition.dialog, this.parentElement, true);
                });
            }
            fieldContainer.classList.add("field-container", "hvr-hollow");
            fieldContainer.setAttribute("column-id", columnId);
            fieldContainer.setAttribute("record-id", recordId);
            fieldContainer.setAttribute("block-id", blockId);
            if (tooltip) {
                $(fieldContainer).baseTooltip(tooltip);
            }
            _self.blockReferences[blockId].records[recordId].columns[columnId].columnReference = $(fieldContainer);
            var fieldWrapper = document.createElement("div");
            fieldWrapper.classList.add("field-wrapper");
            fieldContainer.appendChild(fieldWrapper);
            //-- field icon--///
            var iconC = document.createElement("div");
            iconC.classList.add("type-icon");
            var iconSpan = document.createElement("span");
            iconSpan.classList.add("icon", "icon-font-" + iconFont, "icon-" + icon);
            iconC.appendChild(iconSpan);
            fieldWrapper.appendChild(iconC);
            //--field label--//
            var fieldLabel = document.createElement("div");
            fieldLabel.classList.add("field-label");
            fieldLabel.textContent = label;
            if (dropped) {
                _self.coreServices.lastChanges.push({
                    message: {
                        enus: "A new field was added",
                        ptrbr: "Um novo campo foi adicionado"
                    },
                    blockId: blockId,
                    recordId: recordId,
                    fieldName: label,
                    type: 3
                });
            }
            fieldWrapper.appendChild(fieldLabel);
            //---field delete--//
            var iconDelete = document.createElement("div");
            iconDelete.classList.add("icon-delete");
            var deleteSpan = document.createElement("span");
            deleteSpan.classList.add("icon", "icon-font-Sign-and-Symbols", "icon-persign");
            iconDelete.appendChild(deleteSpan);
            iconDelete.onclick = function(e) {
                var fieldContainer = this.parentElement.parentElement;
                var blockId = fieldContainer.getAttribute("block-id");
                var recordId = fieldContainer.getAttribute("record-id");
                var columnId = fieldContainer.getAttribute("column-id");
                _self.coreServices.lastChanges.push({
                    message: {
                        enus: "A field was removed",
                        ptrbr: "Um campo foi removido"
                    },
                    blockName: _self.json.blocks[blockId].name,
                    recordName: _self.json.blocks[blockId].records[recordId].name,
                    fieldName: $(fieldContainer).find(".field-label")[0].textContent,
                    type: 6
                });
                delete _self.json.blocks[blockId].records[recordId].columns[columnId];
                _self.json.blocks[blockId].records[recordId].positions.splice(_self.json.blocks[blockId].records[recordId].positions.indexOf(columnId),
                    1);
                _self.blockReferences[blockId].records[recordId].positions.splice(_self.blockReferences[blockId].records[recordId].positions.indexOf(
                    columnId), 1);
                _self.blockReferences[blockId].records[recordId].columns[columnId].columnReference.remove();
                delete _self.blockReferences[blockId].records[recordId].columns[columnId];
                e.stopImmediatePropagation();
            };
            if (!isPreview) {
                fieldWrapper.appendChild(iconDelete);
            }
            view.appendChild(fieldContainer);
        }
    },
    openDialog: function(blockId, recordId, columnId, column, dialogData, view, isUpdate, dropped) {
        var _self = this;
        var dialog = dialogData;
        var dialogCtrl;
        dialog.outerClick = "disabled";
        dialog.viewData = {
            initLevel: {
                blockId: blockId,
                recordId: recordId,
                columnId: columnId,
                column: column,
                canEditColumnName: true,
                isNew: !isUpdate
            }
        };

        dialog.buttons = [{
            name: i18n('CANCEL'),
            isCloseButton: true,
            enabled: true,
            tooltip: i18n('CLICK PRESS CANCEL'),
            click: function() {
                dialogCtrl.close();
            }
        }, {
            name: i18n('APPLY'),
            enabled: true,
            click: function() {
                var innerCtrl = dialogCtrl.getInnerController();
                if (innerCtrl.validate()) {
                    var column = innerCtrl.getColumnData();
                    if (!isUpdate) {
                        _self.buildColumn(blockId, recordId, columnId, column, view, dropped);
                    } else {
                        var columnDefinition = _self.getColumnDefinition(columnId);
                        var label;
                        if (!column.formula) {
                            if (columnDefinition.label === true) {
                                label = column.label || columnDefinition.defaultColumn.label;
                            } else if (typeof columnDefinition.label === "object") {
                                var prop = columnDefinition.label;
                                var columnCopy = JSON.parse(JSON.stringify(column));
                                while (prop[Object.keys(prop)[0]] !== true) {
                                    columnCopy = columnCopy[Object.keys(prop)[0]];
                                    prop = prop[Object.keys(prop)[0]];
                                }
                                label = columnCopy[Object.keys(prop)[0]];
                            } else {
                                label = columnDefinition.label || "";
                            }
                        } else {
                            label = column.formula.label;
                        }
                        if (label) {
                            $(".field-container[block-id='" + blockId + "'][record-id='" + recordId + "'][column-id='" + columnId + "'] .field-label")[0].textContent =
                                label;
                            _self.json.blocks[blockId].records[recordId].columns[columnId] = column;
                            _self.blockReferences[blockId].records[recordId].columns[columnId].column = column;
                        }
                    }
                    _self.updateJSON();
                    dialogCtrl.close();
                } else {
                    $.baseToast({
                        text: i18n("FILL ALL FIELDS"),
                        type: 'W'
                    });
                }
            },
            tooltip: i18n('CLICK PRESS CONFIRM')
        }];
        dialogCtrl = $.baseDialog(dialog);
        dialogCtrl.open();
    },
    updateColumnReference: function(blockId, recordId, columnId, column) {
        var _self = this;
        if (_self.blockReferences[blockId] && _self.blockReferences[blockId].records[recordId] && _self.blockReferences[blockId].records[
                recordId].columns[columnId]) {
            _self.blockReferences[blockId].records[recordId].columns[columnId].column = column;
        }
    },
    updateJSON: function() {
        var _self = this;
        for (var block in _self.blockReferences) {
            for (var record in _self.blockReferences[block].records) {
                _self.json.blocks[block].records[record].columns = {};
                _self.json.blocks[block].records[record].positions = JSON.parse(JSON.stringify(_self.blockReferences[block].records[record].positions));
                _self.json.blocks[block].records[record].positions.map(function(position) {
                    _self.json.blocks[block].records[record].columns[position] = JSON.parse(JSON.stringify(_self.blockReferences[block].records[record].columns[
                        position].column));
                });
            }
        }
        _self.coreServices.layoutObject.blocks = _self.json.blocks;
        _self.coreServices.layoutObject.positions = _self.json.positions;
    },
    getColumnDefinition: function(columnId) {
        for (var regex in this.fieldDefinitions) {
            if (columnId.match(new RegExp(regex)) !== null) {
                return this.fieldDefinitions[regex];
            }
        }
    },
    bindBlockNavigator: function() {
        var _self = this;
        var rightContent = document.getElementById("right-content");
        rightContent.style.width = "70%";
        var rightPanel = document.getElementsByClassName("right-panel")[0];
        rightPanel.style.width = "30%";
        rightPanel.style.border = "1px solid #E2E2E2";
        $(rightPanel).empty();

        var navigator = document.createElement("div");
        navigator.classList.add("block-navigator");
        var navigatorHeader = document.createElement("div");
        navigatorHeader.classList.add("navigator-header");
        var navigatorTitle = document.createElement("span");
        navigatorTitle.textContent = i18n("NAVIGATION PANEL");
        navigatorHeader.appendChild(navigatorTitle);
        navigator.appendChild(navigatorHeader);
        rightPanel.appendChild(navigator);
        var documentFragment = document.createDocumentFragment();
        //---------BLOCK BINDING-----------------// 
        var container = document.createElement("ol");
        $(container).sortable({
            placeholder: "ui-state-highlight",
            stop: function(evt, ui) {
                var newIndex = ui.item.index();
                var blockId = ui.item[0].getAttribute("block-id");
                var lastIndex = _self.json.positions.indexOf(blockId);
                _self.json.positions.splice(_self.json.positions.indexOf(blockId), 1);
                _self.json.positions.splice(newIndex, 0, blockId);
                var blocks = $(".block-wrapper");
                var currentBlock = $($(".block-wrapper")[lastIndex]);
                if (newIndex !== 0) {
                    currentBlock.insertAfter(blocks[newIndex]);
                } else {
                    currentBlock.insertBefore(blocks[0]);
                }
            }
        });
        container.classList.add("navigator-list");
        var blockName = {};
        if (_self.json.positions) {
            _self.json.positions.map(function(position) {
                var blockLi = document.createElement("li");
                blockLi.classList.add("block-li");
                blockLi.setAttribute("block-id", position);
                var blockLiHeader = document.createElement("div");
                blockLiHeader.classList.add("block-li-header");
                var blockLiHeaderName = document.createElement("div");
                if (!blockName[_self.json.blocks[position].name]) {
                    blockName[_self.json.blocks[position].name] = 0;
                }
                blockLiHeaderName.textContent = i18n("BLOCK") + ": " + _self.json.blocks[position].name +
                    (blockName[_self.json.blocks[position].name] ? " (" + blockName[_self.json.blocks[position].name] + ")" : "");
                blockLiHeaderName.classList.add("name");
                blockLiHeader.appendChild(blockLiHeaderName);
                blockName[_self.json.blocks[position].name]++;
                var blockLiExpandIcon = document.createElement("div");
                blockLiExpandIcon.classList.add("block-expand-icon");
                var blockLiExpandSpan = document.createElement("span");
                blockLiExpandSpan.classList.add("icon", "icon-font-Display-and-Setting", "icon-collapse");
                blockLiExpandIcon.appendChild(blockLiExpandSpan);
                blockLiExpandIcon.onclick = function() {
                    var span = $(this).find("span");
                    var recordParentList = this.parentElement.parentElement;
                    if (span[0].classList.contains("icon-collapse")) {
                        $(recordParentList).find(".record-list").slideUp();
                        span[0].classList.remove("icon-collapse");
                        span[0].classList.add("icon-expand");
                    } else {
                        $(recordParentList).find(".record-list").slideDown();
                        span[0].classList.remove("icon-expand");
                        span[0].classList.add("icon-collapse");
                    }
                };
                blockLi.appendChild(blockLiHeader);
                blockLiHeader.appendChild(blockLiExpandIcon);
                var recordOl = document.createElement("ol");
                $(recordOl).sortable({
                    connectWith: ".record-list",
                    placeholder: "ui-state-highlight",
                    stop: function(evt, ui) {
                        var record = ui.item[0];
                        var block = ui.item[0].parentElement.parentElement;
                        var blockId, recordId;
                        if (record.getAttribute("block-id") === block.getAttribute("block-id")) {
                            recordId = record.getAttribute("record-id");
                            blockId = record.getAttribute("block-id");
                            var newIndex = ui.item.index();
                            _self.blockReferences[blockId].positions.splice(_self.blockReferences[blockId].positions.indexOf(recordId + ""), 1);
                            _self.blockReferences[blockId].positions.splice(newIndex, 0, recordId);
                            _self.json.blocks[blockId].positions.splice(_self.json.blocks[blockId].positions.indexOf(recordId), 1);
                            _self.json.blocks[blockId].positions.splice(newIndex, 0, recordId);
                        } else {
                            blockId = block.getAttribute("block-id");
                            recordId = _self.blockReferences[blockId].lastRecordId + "";
                            var newIndex = ui.item.index();
                            var oldRecordId = record.getAttribute("record-id");
                            var oldBlockId = record.getAttribute("block-id");

                            var newRecord = JSON.parse(JSON.stringify(_self.json.blocks[oldBlockId].records[oldRecordId]));
                            //remove record from old block
                            delete _self.blockReferences[oldBlockId].records[oldRecordId];
                            if (_self.blockReferences[oldBlockId].positions.indexOf(oldRecordId) !== -1) {
                                _self.blockReferences[oldBlockId].positions.splice(_self.blockReferences[oldBlockId].positions.indexOf(oldRecordId), 1);
                            }
                            var group;
                            var layoutObject = _self.coreServices.layoutObject;
                            if (layoutObject && layoutObject.groups && layoutObject.groups.blocks && layoutObject.groups.blocks[oldBlockId] && layoutObject.groups
                                .blocks[oldBlockId].records && layoutObject.groups.blocks[oldBlockId].records[oldRecordId]) {
                                group = JSON.parse(JSON.stringify(layoutObject.groups.blocks[oldBlockId].records[oldRecordId]));
                                delete layoutObject.groups.blocks[oldBlockId].records[oldRecordId];
                            }
                            delete _self.json.blocks[oldBlockId].records[oldRecordId];
                            $(".record-wrapper[block-id='" + oldBlockId + "'][record-id='" + oldRecordId + "']").remove();
                            _self.json.blocks[oldBlockId].positions.splice(_self.json.blocks[oldBlockId].positions.indexOf(oldRecordId), 1);
                            //add record to new block
                            record.setAttribute("record-id", recordId);
                            record.setAttribute("block-id", blockId);
                            _self.json.blocks[blockId].records[recordId] = JSON.parse(JSON.stringify(newRecord));
                            _self.json.blocks[blockId].positions.splice(newIndex, 0, recordId);
                            if (group) {
                                if (!layoutObject.groups.blocks[blockId]) {
                                    layoutObject.groups.blocks[blockId] = {
                                        records: {

                                        }
                                    };
                                }
                                layoutObject.groups.blocks[blockId].records[recordId] = group;
                            }
                            _self.blockReferences[blockId].lastRecordId++;

                        }
                        var index = _self.json.blocks[blockId].positions.indexOf(recordId) + 1;
                        var page = Math.ceil(index / 10);
                        _self.blockReferences[blockId].paginator.moveToPage(page);
                        var mainContainer = _self.blockReferences[blockId].blockReference.parent().parent();
                        var recordContainer = $(".record-wrapper[block-id='" + blockId + "'][record-id='" + recordId + "']");
                        var scrollTop = mainContainer.scrollTop() + recordContainer.offset().top - recordContainer.height();
                        _self.blockReferences[blockId].blockReference.parent().parent().animate({
                            scrollTop: scrollTop
                        }, 500);
                    }
                });
                //------------------------------ RECORD BINDING----------------------------//
                recordOl.classList.add("record-list");
                var recordName = {};
                _self.json.blocks[position].positions.map(function(recordPosition) {
                    var recordLi = document.createElement("li");
                    recordLi.setAttribute("record-id", recordPosition);
                    recordLi.setAttribute("block-id", position);
                    if (!recordName[_self.json.blocks[position].records[recordPosition].name]) {
                        recordName[_self.json.blocks[position].records[recordPosition].name] = 0;
                    }
                    recordLi.textContent = i18n("RECORD") + ": " + _self.json.blocks[position].records[recordPosition].name +
                        (recordName[_self.json.blocks[position].records[recordPosition].name] ? " (" + recordName[_self.json.blocks[position].records[
                            recordPosition].name] + ")" : "");
                    recordName[_self.json.blocks[position].records[recordPosition].name]++;
                    recordLi.classList.add("record-li");
                    recordLi.onclick = function() {
                        if (_self.selectedRecord) {
                            _self.selectedRecord.classList.remove("selected-record");
                        }
                        _self.selectedRecord = this;
                        this.classList.add("selected-record");
                    };
                    recordLi.ondblclick = function(evt) {
                        var blockId = this.parentElement.parentElement.getAttribute("block-id");
                        var recordId = this.getAttribute("record-id");
                        var index = _self.json.blocks[blockId].positions.indexOf(recordId) + 1;
                        var page = Math.ceil(index / 10);
                        if (page + "" !== _self.blockReferences[blockId].paginator.getActualPage() + "") {
                            _self.blockReferences[blockId].paginator.moveToPage(page);
                        }
                        var mainContainer = _self.blockReferences[blockId].blockReference.parent().parent();
                        var recordContainer = $(".record-wrapper[block-id='" + blockId + "'][record-id='" + recordId + "']");
                        var scrollTop = mainContainer.scrollTop() + recordContainer.offset().top - recordContainer.height();
                        _self.blockReferences[blockId].blockReference.parent().parent().animate({
                            scrollTop: scrollTop
                        }, 500);

                    };
                    recordOl.appendChild(recordLi);
                });
                blockLi.appendChild(recordOl);
                container.appendChild(blockLi);
            });
        }
        documentFragment.appendChild(container);
        navigator.appendChild(documentFragment);
    },
    updateCounts: function() {
        var _self = this;
        if (_self.json.positions) {
            var blockCount = _self.json.positions.length;
            var recordCount = 0;
            _self.json.positions.map(function(pos) {
                recordCount += _self.json.blocks[pos].positions.length;
            });
            $(".totalblocks.close .num").text(blockCount);
            $(".totalrecords.close .num").text(recordCount);
        }
    }
});