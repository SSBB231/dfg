/*global i18n Data _*/
sap.ui.controller("app.controllers.editor.body.MainContent", {
    onInit: function() {
        this.data = {
            adicionar: {
                text: i18n('ADD BLOCK'),
                class: "highlighted",
                hasTransition: true,
                icon: "plussign",
                iconFont: "Sign-and-Symbols"
            }
        };
    },
    _sortableBlocks: function() {
        // var _self = this;
        $('.builder-wrapper').sortable({
            handle: '.block-head',
            axis: 'y',
            helper: function(e, ui) {
                var _clone = $(ui).html();
                var holder = $('<div>').addClass('block-sortable-helper').addClass('block-wrapper').width($(ui).width());
                holder.append(_clone);
                this.holder = holder;
                return holder;
            },
            items: '.block-wrapper',
            containment: $('.builder-wrapper'),
            placeholder: 'block-placeholder'
        });
        var sizeBlocks = $('.block-wrapper').size();
        var sizeRegister = $('.register-wrapper').size();
        $('div.controladoresTop .totalblocks .num').html(sizeBlocks);
        $('div.controladoresTop .totalrecords .num').html(sizeRegister);
    },
    onDataRefactor: function(data) {
        return $.extend(data, this.data);
    },
    onAfterRendering: function(html) {
        var _self = this;
        _self._view = html;
        _self.deleteBtn = _self._view.find('.block-head .delete-block');
        this.isPreview = this.coreServices.exhibition;
        _self.addServices();
        _self.renderToolbar();
        _self.getLayoutData();
        _self.initDialogs();
        _self.bindEvents();
        _self.inputFind();
        _self.blocosOpenClose();
        _self.recordsOpenClose();
        if (_self.getData().exhibition) {
            _self.services.exhibition = _self.getData().exhibition;
            _self.processExhibition();
        }
        $('.builder-head .btn.highlighted.trans').baseTooltip({
            class: 'dark',
            position: 'top',
            text: i18n('ADD BLOCK TOOLTIP')
        });
    },
    initialFocus: function(buttonPress) {
        $(buttonPress).focus();
    },
    addServices: function() {
        var _self = this;
        _self.coreServices.openFormulaDialog = function(blockId, recordId, columnId, isNew, field) {
            _self.formulaDialog = $.baseDialog({
                outerClick: "disabled",
                title: i18n('FORMULA BUILDER'),
                modal: true,
                size: "big",
                cssClass: "brb-dialog formula-dialog newFile dfg-formula-dialog",
                viewName: "app.views.editor.DesignFormula",
                viewData: {
                    initLevel: {
                        blockId: blockId,
                        recordId: recordId,
                        columnId: columnId,
                        isNew: isNew
                    }
                },
                buttons: [{
                    name: i18n('CANCEL'),
                    isCloseButton: true,
                    tooltip: i18n('CLICK PRESS CANCEL'),
                    click: function() {
                        _self.initialFocus('#toolbarSecund > div > ul.library-toolbar-items > li:nth-child(3) > button');
                        if (!blockId || !recordId || !columnId) {
                            return;
                        }
                        var data = _self.formulaDialog.getInnerController().getFormulaData();
                        var actualMP = data.blocks[blockId].records[recordId].columns[columnId].formula;
                        if (actualMP.idStructure === undefined && !actualMP.label) {
                            $('[data-id="' + columnId + '"] .label-wrapper .label-container .field-close').click();
                        }
                    }
                }, {
                    name: i18n('APPLY'),
                    enabled: !_self.isPreview,
                    click: function() {
                        if (_self.formulaDialog.getInnerController().columnInput ? _self.formulaDialog.getInnerController().columnInput.getText() === "" :
                            _self.formulaDialog.getInnerController().comboColumns.getKey() === undefined) {
                            $.baseToast({
                                text: i18n("FILL ALL FIELDS"),
                                type: 'W'
                            });
                        } else {
                            _self.formulaDialog.getInnerController().updateFormulaObject();
                            var currentLevel = _self.formulaDialog.getInnerController().currentLevel;
                            _self.updateFormulaData(_self.formulaDialog.getInnerController().getFormulaData());
                            var column = _self.coreServices.layoutObject.blocks[currentLevel.blockId].records[currentLevel.recordId].columns[currentLevel.columnId];
                            if (field) {
                                field.setLabel(column.formula.label);
                            }
                            _self.formulaDialog.close();
                            _self.coreServices.hasChanged = true;
                            _self.initialFocus('#toolbarSecund > div > ul.library-toolbar-items > li:nth-child(3) > button');
                        }
                    },
                    tooltip: i18n('CLICK PRESS CONFIRM')
                }]
            });
            _self.formulaDialog.open();
        };
        _self.coreServices.openFormatDialog = function(blockId, recordId, columnId, isNewRefPeriod, field, isRef) {
            var viewData = {};
            if (blockId) {
                viewData = {
                    initLevel: {
                        blockId: blockId,
                        recordId: recordId,
                        columnId: columnId,
                        canEditColumnName: isRef
                    }
                };
            }
            _self.formatDialog = $.baseDialog({
                title: i18n('FORMAT'),
                modal: true,
                size: "wide",
                outerClick: 'disabled',
                disableOuterClick: isNewRefPeriod,
                cssClass: "newFile",
                viewName: "app.views.dialogs.format.Format",
                viewData: viewData,
                buttons: [{
                    name: i18n('CANCEL'),
                    isCloseButton: true,
                    tooltip: i18n('CLICK PRESS CANCEL'),
                    click: function() {
                        if (isNewRefPeriod) {
                            $('[data-id="' + columnId + '"] .label-wrapper .label-container .field-close').click();
                        }
                        _self.initialFocus('#toolbarSecund > div > ul.library-toolbar-items > li:nth-child(4) > button');
                    }
                }, {
                    name: i18n('APPLY'),
                    enabled: !_self.isPreview,
                    click: function() {
                        _self.formatDialog.getInnerController().updateFormatObject();
                        _self.updateFormatData(_self.formatDialog.getInnerController().getFormatData());
                        _self.formatDialog.close();
                        _self.coreServices.hasChanged = true;
                        if (field) {
                            var column = _self.coreServices.layoutObject.blocks[blockId].records[recordId].columns[columnId];
                            field.setLabel(column.label);
                        }
                        _self.initialFocus('#toolbarSecund > div > ul.library-toolbar-items > li:nth-child(4) > button');
                    },
                    tooltip: i18n('CLICK PRESS CONFIRM')
                }]
            });
            _self.formatDialog.open();
        };
        _self.coreServices.openParamDialog = function(blockId, recordId, columnId, field) {
            _self.parametroDialog = $.baseDialog({
                outerClick: "disabled",
                title: i18n('PARAMETRO'),
                modal: true,
                size: "big",
                cssClass: "dfg-dialog parametro-dialog newFile",
                viewName: "app.views.dialogs.ParamManual",
                viewData: {
                    initLevel: {
                        blockId: blockId,
                        recordId: recordId,
                        columnId: columnId
                    }
                },
                buttons: [{
                    name: i18n('CANCEL'),
                    isCloseButton: true,
                    tooltip: i18n('CLICK PRESS CANCEL'),
                    click: function() {
                        var data = _self.parametroDialog.getInnerController().getParamManualData();
                        var actualMP = data.blocks[blockId].records[recordId].columns[columnId].manualParam;
                        if (actualMP.id === undefined) {
                            $('[data-id="' + columnId + '"] .label-wrapper .label-container .field-close').click();
                        }
                    }
                }, {
                    name: i18n('APPLY'),
                    enabled: !_self.isPreview,
                    click: function() {
                        var updated = _self.parametroDialog.getInnerController().updateParamObject();
                        if (updated) {
                            var data = _self.parametroDialog.getInnerController().getParamManualData();
                            _self.updateParamData(data);
                            var column = _self.coreServices.layoutObject.blocks[blockId].records[recordId].columns[columnId];
                            field.setLabel(column.manualParam.label);
                            _self.addToManualParamList(column, columnId, recordId, blockId);
                            _self.parametroDialog.close();
                        }
                    },
                    tooltip: i18n('CLICK PRESS CONFIRM')
                }]
            });
            _self.coreServices.parametroDialog = _self.parametroDialog;
            _self.parametroDialog.open();
        };
        _self.coreServices.openSequenceFieldDialog = function(blockId, recordId, columnId, field) {
            _self.sequenceFieldDialog = $.baseDialog({
                outerClick: "disabled",
                title: i18n("SEQUENCE"),
                modal: true,
                size: "medium",
                viewName: "app.views.dialogs.sequenceFieldDialog",
                viewData: {
                    initLevel: {
                        blockId: blockId,
                        recordId: recordId,
                        columnId: columnId,
                        field: field
                    }
                },
                buttons: [{
                    name: i18n('CANCEL'),
                    isCloseButton: true,
                    tooltip: i18n('CLICK PRESS CANCEL'),
                    click: function() {
                        if (!_self.coreServices.layoutObject.blocks[blockId].records[recordId].columns[columnId].sequenceField) {
                            $('[data-id="' + columnId + '"] .label-wrapper .label-container .field-close').click();
                        }
                    }
                }, {
                    name: i18n('APPLY'),
                    enabled: !_self.isPreview,
                    click: function() {
                        if (!_self.coreServices.layoutObject.blocks[blockId].records[recordId].columns[columnId].sequenceField) {
                            field.setLabel(i18n("SEQUENCE"));
                        }
                        var data = _self.sequenceFieldDialog.getInnerController().getSequenceField();
                        _self.coreServices.layoutObject.blocks[blockId].records[recordId].columns[columnId].label = data.label || _self.coreServices.layoutObject.blocks[blockId].records[recordId].columns[columnId].label;
                        field.setLabel(data.label);
                        delete data.label;
                        _self.coreServices.layoutObject.blocks[blockId].records[recordId].columns[columnId].sequenceField = data;
                        _self.sequenceFieldDialog.close();
                    },
                    tooltip: i18n('CLICK PRESS CONFIRM')
                }]
            });
            _self.coreServices.sequenceFieldDialog = _self.sequenceFieldDialog;
            _self.sequenceFieldDialog.open();
        };
        _self.coreServices.openListFieldDialog = function(blockId, recordId, columnId, field) {
            _self.listFieldDialog = $.baseDialog({
                outerClick: "disabled",
                title: i18n("LIST FIELD"),
                modal: true,
                size: "wide",
                viewName: "app.views.dialogs.listField.listFieldDialog",
                viewData: {
                    initLevel: {
                        blockId: blockId,
                        recordId: recordId,
                        columnId: columnId
                    }
                },
                buttons: [{
                    name: i18n("CANCEL"),
                    isCloseButton: true,
                    tooltip: i18n("CLICK PRESS CANCEL"),
                    click: function() {
                        if (!_self.coreServices.layoutObject.blocks[blockId].records[recordId].columns[columnId].listField) {
                            $('[data-id="' + columnId + '"] .label-wrapper .label-container .field-close').click();
                        }
                    }
                }, {
                    name: i18n("APPLY"),
                    enabled: !_self.isPreview,
                    click: function() {
                        //  _self.listFieldDialog.getInnerController().updateListFieldObject();
                        var listFieldData = _self.listFieldDialog.getInnerController().getListFieldData(true);
                        if (!listFieldData) {
                            return;
                        }
                        field.setLabel(listFieldData.blocks[blockId].records[recordId].columns[columnId].listField.name);
                        _self.updateListFieldData(listFieldData);
                        _self.listFieldDialog.close();
                    }
                }]
            });
            _self.coreServices.listFieldDialog = _self.listFieldDialog;
            _self.listFieldDialog.open();
        };
        _self.coreServices.openFillerDialog = function(blockId, recordId, columnId, field) {
            _self.fillerDialog = $.baseDialog({
                outerClick: "disabled",
                title: i18n("FILLER"),
                modal: true,
                size: "medium",
                viewName: "app.views.dialogs.Filler",
                viewData: {
                    initLevel: {
                        blockId: blockId,
                        recordId: recordId,
                        columnId: columnId
                    }
                },
                buttons: [{
                    name: i18n('CANCEL'),
                    isCloseButton: true,
                    tooltip: i18n('CLICK PRESS CANCEL'),
                    click: function() {
                        var data = _self.fillerDialog.getInnerController().getFillerData();
                        var actualMP = data.blocks[blockId].records[recordId].columns[columnId].filler;
                        if (actualMP.id === undefined) {
                            $('[data-id="' + columnId + '"] .label-wrapper .label-container .field-close').click();
                        }
                    }
                }, {
                    name: i18n('APPLY'),
                    enabled: !_self.isPreview,
                    click: function() {
                        _self.fillerDialog.getInnerController().updateFillerObject();
                        var fillerData = _self.fillerDialog.getInnerController().getFillerData(true);
                        if (!fillerData) {
                            return;
                        }
                        field.setLabel(fillerData.blocks[blockId].records[recordId].columns[columnId].filler.name);
                        _self.updateFillerData(fillerData);
                        _self.fillerDialog.close();
                    },
                    tooltip: i18n('CLICK PRESS CONFIRM')
                }]
            });
            _self.coreServices.fillerDialog = _self.fillerDialog;
            _self.fillerDialog.open();
        };
        _self.coreServices.openDfgOutputDialog = function(blockId, recordId, columnId, field) {
            _self.dfgDialog = $.baseDialog({
                outerClick: "disabled",
                title: i18n("OUTPUT"),
                modal: true,
                size: "big",
                viewName: "app.views.dialogs.DfgOutput",
                viewData: {
                    initLevel: {
                        blockId: blockId,
                        recordId: recordId,
                        columnId: columnId
                    }
                },
                buttons: [{
                    name: i18n('CANCEL'),
                    isCloseButton: true,
                    tooltip: i18n('CLICK PRESS CANCEL'),
                    click: function() {
                        // var data = _self.dfgDialog.getInnerController().getOutputData();
                        var output = _self.coreServices.layoutObject.blocks[blockId].records[recordId].columns[columnId].output;
                        if (!output.fieldId) {
                            $('[data-id="' + columnId + '"] .label-wrapper .label-container .field-close').click();
                        }
                    }
                }, {
                    name: i18n('APPLY'),
                    enabled: !_self.isPreview,
                    click: function() {
                        var outputData = _self.dfgDialog.getInnerController().getOutputData(true);
                        if (!outputData) {
                            return;
                        }
                        var column = _self.coreServices.layoutObject.blocks[blockId].records[recordId].columns[columnId];
                        _self.updateDfgOutputData(outputData, column);
                        field.setLabel(outputData.name);
                        _self.addToOutputList(column, columnId, recordId, blockId);
                        _self.dfgDialog.close();
                    },
                    tooltip: i18n('CLICK PRESS CONFIRM')
                }]
            });
            _self.coreServices.dfgDialog = _self.dfgDialog;
            _self.dfgDialog.open();
        };
        _self.coreServices.openVersionDialog = function(blockId, recordId, columnId, id) {
            _self.versionDialog = $.baseDialog({
                outerClick: "disabled",
                title: i18n('VERSION'),
                modal: true,
                size: "medium",
                viewName: "app.views.dialogs.VersionField",
                viewData: {
                    initLevel: {
                        blockId: blockId,
                        recordId: recordId,
                        columnId: columnId
                    }
                },
                buttons: [{
                    name: i18n('CANCEL'),
                    isCloseButton: true,
                    tooltip: i18n('CLICK PRESS CANCEL'),
                    click: function() {
                        var data = _self.versionDialog.getInnerController().getVersionData();
                        var actualMP = data.blocks[blockId].records[recordId].columns[columnId].version;
                        if (actualMP.id === undefined) {
                            $('[data-id="' + columnId + '"] .label-wrapper .label-container .field-close').click();
                        }
                    }
                }, {
                    name: i18n('APPLY'),
                    enabled: !_self.isPreview,
                    click: function() {
                        _self.versionDialog.getInnerController().updateVersionObject();
                        _self.updateVersionData(_self.versionDialog.getInnerController().getVersionData());
                        _self.versionDialog.close();
                    },
                    tooltip: i18n('CLICK PRESS CONFIRM')
                }]
            });
            _self.coreServices.versionDialog = _self.versionDialog;
            _self.versionDialog.open();
        };
        _self.coreServices.openGroupsDialog = function(blockId, recordId) {
            _self.openGroupsDialog = $.baseDialog({
                title: i18n('GROUPS'),
                modal: true,
                size: "big",
                outerClick: 'disabled',
                cssClass: "GroupDialog newFile",
                viewName: "app.views.editor.groups.groupDialog",
                viewData: {
                    initLevel: {
                        blockId: blockId,
                        recordId: recordId
                    }
                },
                buttons: [{
                    name: i18n('CANCEL'),
                    isCloseButton: true,
                    tooltip: i18n("CLICK PRESS CANCEL"),
                    click: function() {
                        _self.initialFocus('#toolbarSecund > div > ul.library-toolbar-items > li:nth-child(2) > button');
                    }
                }, {
                    name: i18n("APPLY"),
                    enabled: !_self.isPreview,
                    tooltip: i18n("CLICK PRESS APPLY"),
                    click: function() {
                        var innerCtrl = _self.openGroupsDialog.getInnerController();
                        if (innerCtrl.validate()) {
                            var groupData = innerCtrl.getGroups();
                            if (!_self.coreServices.layoutObject.groups.blocks[groupData.block]) {
                                _self.coreServices.layoutObject.groups.blocks[groupData.block] = {
                                    records: {}
                                };
                            }
                            if (!_self.coreServices.layoutObject.groups.blocks[groupData.block].records[groupData.record]) {
                                _self.coreServices.layoutObject.groups.blocks[groupData.block].records[groupData.record] = {
                                    structures: {}
                                };
                            }
                            _self.coreServices.layoutObject.groups.blocks[groupData.block].records[groupData.record].structures[groupData.structureId] = {
                                groups: groupData.groups,
                                last_groupID: groupData.last_groupID
                            };
                            _self.openGroupsDialog.close();
                            $.baseToast({
                                text: i18n("GROUPS CREATED SUCCESSFULLY"),
                                type: 'S'
                            });
                        } else {
                            $.baseToast({
                                text: i18n("FILL ALL FIELDS WARNING"),
                                type: 'W'
                            });
                        }
                        _self.initialFocus('#toolbarSecund > div > ul.library-toolbar-items > li:nth-child(2) > button');
                    }
                }]
            });
            _self.openGroupsDialog.open();
        };
        _self.coreServices.openFiltersDialog = function(blockId, recordId) {
            _self.filtersDialog = $.baseDialog({
                title: i18n('FILTERS'),
                modal: true,
                size: "big",
                outerClick: 'disabled',
                cssClass: "ConditionBuilder newFile",
                viewName: "app.views.dialogs.filters.ConditionBuilder",
                viewData: {
                    initLevel: {
                        blockId: blockId,
                        recordId: recordId
                    }
                },
                buttons: [{
                    name: i18n('CANCEL'),
                    isCloseButton: true,
                    tooltip: i18n('CLICK PRESS CANCEL'),
                    click: function() {
                        _self.initialFocus('#toolbarSecund > div > ul.library-toolbar-items > li.leftButton.library-toolbar-item.first > button');
                    }
                }, {
                    name: i18n('APPLY'),
                    enabled: !_self.isPreview,
                    click: function() {
                        _self.filtersDialog.getInnerController().updateFiltersObject();
                        if (_self.filtersDialog.getInnerController().validateFilters()) {
                            _self.updateFiltersData(_self.filtersDialog.getInnerController().getFiltersData());
                            _self.filtersDialog.close();
                            _self.coreServices.hasChanged = true;
                        }
                        _self.initialFocus('#toolbarSecund > div > ul.library-toolbar-items > li.leftButton.library-toolbar-item.first > button');
                    },
                    tooltip: i18n('CLICK PRESS CONFIRM')
                }]
            });
            _self.filtersDialog.open();
        };
        _self.coreServices.openIdRecordDialog = function(blockId, recordId, columnId, field, isNew) {
            _self.recordDialog = $.baseDialog({
                outerClick: "disabled",
                title: "ID " + i18n('RECORD'),
                modal: true,
                size: "small",
                disableOuterClick: isNew,
                viewName: "app.views.dialogs.IdRecordDialog",
                viewData: {
                    blockId: blockId,
                    recordId: recordId,
                    columnId: columnId,
                    field: field
                },
                buttons: [{
                    name: i18n('CANCEL'),
                    isCloseButton: true,
                    tooltip: i18n('CLICK PRESS CANCEL'),
                    click: function() {
                        if (isNew) {
                            field.removeField();
                        }
                    }
                }, {
                    name: i18n('APPLY'),
                    enabled: !_self.isPreview,
                    click: function() {
                        var saved = _self.recordDialog.getInnerController().updateIdRecord();
                        if (saved) {
                            _self.recordDialog.close();
                        }
                    },
                    tooltip: i18n('CLICK PRESS CONFIRM')
                }]
            });
            _self.coreServices.recordDialog = _self.recordDialog;
            _self.recordDialog.open();
        };
        _self.coreServices.openFixedManualFieldDialog = function(blockId, recordId, columnId, field, isNew) {
            _self.fixedManualFieldDialog = $.baseDialog({
                outerClick: "disabled",
                title: i18n('FIXED MANUAL FIELD'),
                modal: true,
                size: "wide",
                cssClass: "dfg-dialog parametro-dialog newFile",
                viewName: "app.views.dialogs.FixedManualField",
                viewData: {
                    initLevel: {
                        blockId: blockId,
                        recordId: recordId,
                        columnId: columnId
                    }
                },
                buttons: [{
                    name: i18n('CANCEL'),
                    isCloseButton: true,
                    tooltip: i18n('CLICK PRESS CANCEL'),
                    click: function() {
                        if (isNew) {
                            $('[data-id="' + columnId + '"] .label-wrapper .label-container .field-close').click();
                        }
                    }
                }, {
                    name: i18n('APPLY'),
                    enabled: !_self.isPreview,
                    click: function() {
                        //_self.fixedManualFieldDialog.getInnerController().updateFixedFieldObject();
                        var updated = _self.fixedManualFieldDialog.getInnerController().getFixedManualFieldData();
                        if (updated) {
                            var column = _self.coreServices.layoutObject.blocks[blockId].records[recordId].columns[columnId];
                            column.fixedManualField = updated;
                            field.setLabel(updated.name);
                            _self.fixedManualFieldDialog.close();
                        }
                    },
                    tooltip: i18n('CLICK PRESS CONFIRM')
                }]
            });
            _self.coreServices.fixedManualFieldDialog = _self.fixedManualFieldDialog;
            _self.fixedManualFieldDialog.open();
        };
        _self.coreServices.openFixedFieldDialog = function(blockId, recordId, columnId, field) {
            _self.fixedFieldDialog = $.baseDialog({
                outerClick: "disabled",
                title: i18n('FIXED FIELD'),
                modal: true,
                size: "big",
                cssClass: "dfg-dialog parametro-dialog newFile",
                viewName: "app.views.dialogs.fixField",
                viewData: {
                    initLevel: {
                        blockId: blockId,
                        recordId: recordId,
                        columnId: columnId
                    }
                },
                buttons: [{
                    name: i18n('CANCEL'),
                    isCloseButton: true,
                    tooltip: i18n('CLICK PRESS CANCEL'),
                    click: function() {
                        if (!_self.fixedFieldDialog.getInnerController().isModified()) {
                            $('[data-id="' + columnId + '"] .label-wrapper .label-container .field-close').click();
                        }
                    }
                }, {
                    name: i18n('APPLY'),
                    enabled: !_self.isPreview,
                    click: function() {
                        _self.fixedFieldDialog.getInnerController().updateFixedFieldObject();
                        var updated = _self.fixedFieldDialog.getInnerController().getFixedFieldData();
                        if (updated) {
                            _self.updateFixedFieldData(updated);
                            var column = _self.coreServices.layoutObject.blocks[blockId].records[recordId].columns[columnId];
                            field.setLabel(column.fixedField.name);
                            _self.addToFixedFieldList(column, columnId, recordId, blockId);
                            _self.fixedFieldDialog.close();
                        }
                    },
                    tooltip: i18n('CLICK PRESS CONFIRM')
                }]
            });
            _self.coreServices.fixedFieldDialog = _self.fixedFieldDialog;
            _self.fixedFieldDialog.open();
        };
        _self.coreServices.updateLayoutObject = function() {
            _self.updateLayoutObject();
        };
        _self.coreServices.removeFromOutPutList = function(columnId) {
            _self.removeFromOutPutList(columnId);
        };
        _self.coreServices.deleteCascadeOutputs = function(deletedField) {
            _self.deleteCascadeOutputs(deletedField);
        };
        _self.coreServices.removeFromManualParamList = function(columnId) {
            _self.removeFromManualParamList(columnId);
        };
        _self.coreServices.openTotalsDialog = function(blockId, recordId) {
            _self.totalsDialog = $.baseDialog({
                title: i18n('RECORD TOTALS'),
                modal: true,
                size: 'big',
                outerClick: 'disabled',
                viewName: 'app.views.dialogs.RecordsTotals',
                viewData: {
                    initLevel: {
                        blockId: blockId,
                        recordId: recordId
                    }
                },
                buttons: [{
                    name: i18n('CANCEL'),
                    isCloseButton: true,
                    tooltip: i18n('CLICK PRESS CANCEL')
                }, {
                    name: i18n('APPLY'),
                    enabled: !_self.isPreview,
                    click: function() {
                        _self.updateArchiveCounts(_self.totalsDialog.getInnerController().getTotalSwitches());
                        _self.totalsDialog.close();
                        _self.coreServices.hasChanged = true;
                    },
                    tooltip: i18n('CLICK PRESS CONFIRM')
                }]
            });
            _self.totalsDialog.open();
        };
        _self.coreServices.openTotalSelectionDialog = function(blockId, recordId, columnId, isRecordTotal, isEdit) {
            _self.totalSelectionDialog = $.baseDialog({
                title: isRecordTotal ? i18n("RECORDTOTAL") : i18n("BLOCKTOTAL"),
                modal: true,
                size: "medium",
                outerClick: "disabled",
                viewName: "app.views.dialogs.totalSelection",
                viewData: {
                    recordTotal: isRecordTotal,
                    initLevel: {
                        blockId: blockId,
                        recordId: recordId,
                        columnId: columnId
                    },
                    isEdit: isEdit
                },
                buttons: [{
                    name: i18n("CANCEL"),
                    isCloseButton: true,
                    tooltip: i18n("CLICK PRESS CANCEL")
                }, {
                    name: i18n("APPLY"),
                    enabled: !_self.isPreview,
                    click: function() {
                        if (_self.totalSelectionDialog.getInnerController().validateTotalData()) {
                            _self.coreServices.layoutObject.blocks[blockId].records[recordId].columns[columnId].totalData = _self.totalSelectionDialog.getInnerController()
                                .getTotalData();
                            _self.totalSelectionDialog.close();
                        } else {
                            $.baseToast({
                                type: 'w',
                                text: i18n("FILL ALL FIELDS")
                            });
                        }
                    }
                }]
            });
            _self.totalSelectionDialog.open();
        };
        _self.coreServices.openHideRuleDialog = function(blockId, recordId, columnId) {
            _self.hideRuleDialog = $.baseDialog({
                title: i18n('HIDE RULE'),
                modal: true,
                size: 'wide',
                outerClick: 'disabled',
                viewName: 'app.views.dialogs.hideRule',
                viewData: {
                    initLevel: {
                        blockId: blockId,
                        recordId: recordId
                    }
                },
                buttons: [{
                    name: i18n('CANCEL'),
                    isCloseButton: true,
                    tooltip: i18n('CLICK PRESS CANCEL'),
                    click: function() {
                        _self.initialFocus('#toolbarSecund > div > ul.library-toolbar-items > li:nth-child(9) > button');
                    }
                }, {
                    name: i18n('APPLY'),
                    enabled: !_self.isPreview,
                    click: function() {
                        var hidingData = _self.hideRuleDialog.getInnerController().getHideRulesData();
                        console.log('hidingData', hidingData)
                        var valid = true;
                        if (!hidingData.block) {
                            valid = false;
                        } else {
                            if (hidingData.block !== "all" && !hidingData.record) {
                                valid = false;
                            } else {
                                if (hidingData.block !== "all" && hidingData.record !== "all" && !hidingData.field) {
                                    valid = false;
                                }
                            }
                        }
                        if (!valid) {
                            $.baseToast({
                                text: i18n("FILL ALL FIELDS"),
                                type: 'w'
                            });
                        } else {
                            if (hidingData.block === "all") {
                                _self.coreServices.layoutObject.hidingRule = hidingData.rule;
                            } else {
                                if (hidingData.record === "all") {
                                    _self.coreServices.layoutObject.blocks[hidingData.block].hidingRule = hidingData.rule;
                                } else {
                                    if (hidingData.field === "all") {
                                        _self.coreServices.layoutObject.blocks[hidingData.block].records[hidingData.record].hidingRule = hidingData.rule;
                                    } else {
                                        var column = _self.coreServices.layoutObject.blocks[hidingData.block].records[hidingData.record].columns[hidingData.field];
                                        column.hidingRule = hidingData.rule;
                                        $.blockBuilder.updateColumnReference(hidingData.block, hidingData.record, hidingData.field, JSON.parse(JSON.stringify(column)));
                                    }
                                }
                            }
                            _self.hideRuleDialog.close();
                            _self.initialFocus('#toolbarSecund > div > ul.library-toolbar-items > li:nth-child(9) > button');
                        }
                    },
                    tooltip: i18n('CLICK PRESS CONFIRM')
                }]
            });
            _self.hideRuleDialog.open();
        };
        _self.coreServices.openCopyRecordDialog = function(blockId, recordId, columnId) {
            _self.copyRecordDialog = $.baseDialog({
                title: i18n('COPY BLOCK/RECORD'),
                modal: true,
                size: 'big',
                outerClick: 'disabled',
                viewName: 'app.views.dialogs.copyRecord',
                viewData: {},
                buttons: [{
                    name: i18n('CANCEL'),
                    isCloseButton: true,
                    tooltip: i18n('CLICK PRESS CANCEL'),
                    click: function() {
                        _self.initialFocus('#toolbarSecund > div > ul.library-toolbar-items > li:nth-child(9) > button');
                    }
                }, {
                    name: i18n('APPLY'),
                    enabled: !_self.isPreview,
                    click: function() {
                        var dialogCtrl = _self.copyRecordDialog.getInnerController();
                        if (!dialogCtrl.validateCopy()) {
                            $.baseToast({
                                text: i18n("FILL ALL FIELDS"),
                                type: 'w'
                            });
                        } else {
                            var copyData = dialogCtrl.getCopyData();
                            // debugger;
                            if (copyData.copyType === 1) {
                                var originalBlock = JSON.parse(JSON.stringify(_self.coreServices.layoutObject.blocks[copyData.elementId]));
                                for (var i in originalBlock.records) {
                                    delete originalBlock.records[i].format;
                                    delete originalBlock.records[i].filters;
                                    delete originalBlock.records[i].rules;
                                    if (!copyData.copyFields) {
                                        originalBlock.records[i].columns = {};
                                        originalBlock.records[i].positions = [];
                                        originalBlock.records[i].idStructure = Object.keys(_self.coreServices.structure)[0];
                                    }
                                }
                                if (!copyData.copyFilters) {
                                    delete originalBlock.filters;
                                }
                                if (!copyData.copyFormats) {
                                    delete originalBlock.format;
                                }
                                var copiedGroups;
                                if (copyData.copyFields && copyData.copyGroups) {
                                    var blockId = copyData.elementId;
                                    if (_self.coreServices.layoutObject.groups && _self.coreServices.layoutObject.groups.blocks[blockId]) {
                                        copiedGroups = _.cloneDeep(_self.coreServices.layoutObject.groups.blocks[blockId]);
                                    }
                                }
                                $.blockBuilder.addBlock(originalBlock, copiedGroups);
                            } else {
                                var originalRecord = JSON.parse(JSON.stringify(_self.coreServices.layoutObject.blocks[copyData.elementId.split(";")[0]].records[
                                    copyData.elementId.split(";")[1]]));
                                if (!copyData.copyFields) {
                                    originalRecord.columns = {};
                                    originalRecord.positions = [];
                                    originalRecord.idStructure = Object.keys(_self.coreServices.structure)[0];
                                } else {
                                    var copiedGroups;
                                    if (copyData.copyGroups) {
                                        var blockId = copyData.elementId.split(";")[0];
                                        var recordId = copyData.elementId.split(";")[1];
                                        if (_self.coreServices.layoutObject.groups && _self.coreServices.layoutObject.groups.blocks[blockId] && _self.coreServices.layoutObject.groups.blocks[blockId].records[recordId]) {
                                            copiedGroups = _.cloneDeep(_self.coreServices.layoutObject.groups.blocks[blockId].records[recordId]);
                                        }
                                    }
                                    if (!copyData.copyFilters) {
                                        for (i in originalRecord.columns) {
                                            originalRecord.columns[i].format = {
                                                number: null,
                                                string: null,
                                                date: null
                                            };
                                        }
                                    }
                                }
                                if (!copyData.copyFilters) {
                                    delete originalRecord.filters;
                                }
                                if (!copyData.copyFormats) {
                                    delete originalRecord.format;
                                }
                                if (copyData.toBlocks.length) {
                                    copyData.toBlocks.map(function(block) {
                                        $.blockBuilder.addRecord(block, JSON.parse(JSON.stringify(originalRecord)), copiedGroups);
                                    });
                                } else {
                                    $.blockBuilder.addRecord(copyData.elementId.split(";")[0], JSON.parse(JSON.stringify(originalRecord)), copiedGroups);
                                }
                            }
                            _self.copyRecordDialog.close();
                            _self.initialFocus('#toolbarSecund > div > ul.library-toolbar-items > li:nth-child(9) > button');
                        }
                    },
                    tooltip: i18n('CLICK PRESS CONFIRM')
                }]
            });
            _self.copyRecordDialog.open();
        };
        _self.coreServices.openSpedMappingDialog = function() {
            _self.spedMappingDialog = $.baseDialog({
                title: i18n("SPED MAPPING"),
                modal: true,
                size: 'wide',
                outerClick: 'disabled',
                viewName: 'app.views.editor.spedMapping',
                buttons: [{
                    name: i18n('CANCEL'),
                    isCloseButton: true,
                    tooltip: i18n('CLICK PRESS CANCEL'),
                    click: function() {}
                }, {
                    name: i18n('APPLY'),
                    enabled: !_self.isPreview,
                    click: function() {
                        var mapping = _self.spedMappingDialog.getInnerController().getColumnMapping();
                        if (mapping) {
                            _self.coreServices.layoutObject.blocks[mapping.block].records[mapping.record].spedMapping = mapping.mapping;
                            $.baseToast({
                                isSuccess: true,
                                text: i18n("SPED MAPPING CREATED")
                            });
                            _self.spedMappingDialog.close();
                        } else {
                            $.baseToast({
                                type: 'w',
                                text: i18n("RECORD TABLE DOESN'T EXISTS")
                            });
                        }
                    },
                    tooltip: i18n('CLICK PRESS CONFIRM')
                }]
            });
            _self.spedMappingDialog.open();
        };
        _self.coreServices.openConcatDialog = function(blockId, recordId, columnId) {
            _self.concatDialog = $.baseDialog({
                title: i18n('CONCATENATION'),
                modal: true,
                size: 'big',
                outerClick: 'disabled',
                viewName: 'app.views.dialogs.concat.concat',
                viewData: {
                    initLevel: {
                        blockId: blockId,
                        recordId: recordId
                    }
                },
                buttons: [{
                    name: i18n('CANCEL'),
                    isCloseButton: true,
                    tooltip: i18n('CLICK PRESS CANCEL'),
                    click: function() {}
                }, {
                    name: i18n('APPLY'),
                    enabled: !_self.isPreview,
                    click: function() {
                        var concatData = _self.concatDialog.getInnerController().getConcatData();
                        var column = _self.coreServices.layoutObject.blocks[concatData.block.key].records[concatData.record.key].columns[concatData.field.fieldData.columnId];
                        _self.updateConcatData(concatData, column);
                        _self.removeConcatenatedFields(concatData.columns);
                        _self.concatDialog.close();
                    },
                    tooltip: i18n('CLICK PRESS CONFIRM')
                }]
            });
            _self.concatDialog.open();
        };
        _self.coreServices.totals = {
            records: false,
            blocks: false,
            all: false,
            blockStarter: false
        };
    },
    bindEvents: function() {
        var _self = this;
        if (!this.isPreview) {
            _self._view.find('.builder-head > button').click(function() {
                $.blockBuilder.addBlock();
                //          _self.addBlock(undefined,true);
                //          _self._sortableBlocks();
                _self.coreServices.hasChanged = true;
            });
        } else {
            _self._view.find('.builder-head > button').off('click').addClass('disabled').removeClass('highlighted');
        }
    },
    renderToolbar: function() {
        var _self = this;
        $("#toolbarSecund").bindBaseLibraryToolbar({
            leftButtons: [{
                    text: i18n('FILTER'),
                    onPress: function() {
                        _self.initialFocus(false);
                        _self.updateLayoutObject();
                        _self.coreServices.openFiltersDialog();
                    },
                    isButton: true,
                    iconFont: "Formatting-and-Tool",
                    icon: "filter",
                    enabled: true,
                    tooltip: i18n('FILTER TOOLTIP')
                }, {
                    text: i18n('GROUP'),
                    onPress: function() {
                        _self.updateLayoutObject();
                        _self.coreServices.openGroupsDialog();
                    },
                    isButton: true,
                    iconFont: "Formatting-and-Tool",
                    icon: "grouping",
                    enabled: true,
                    tooltip: i18n("GROUP TOOLTIP")
                }, {
                    text: i18n('FORMULA'),
                    onPress: function() {
                        _self.updateLayoutObject();
                        _self.coreServices.openFormulaDialog();
                    },
                    isButton: true,
                    iconFont: "Finance-and-Office",
                    icon: "function",
                    enabled: true,
                    tooltip: i18n('FORMULA TOOLTIP')
                }, {
                    text: i18n('FORMAT'),
                    onPress: function() {
                        _self.updateLayoutObject();
                        _self.coreServices.openFormatDialog();
                    },
                    isButton: true,
                    iconFont: "Finance-and-Office",
                    icon: "coin",
                    enabled: true,
                    tooltip: i18n('FORMAT TOOLTIP')
                }, {
                    text: i18n('SEPARATOR'),
                    onPress: function() {
                        _self.separatorDialog.open();
                    },
                    isButton: true,
                    iconFont: "Display-and-Setting",
                    icon: "coverflow",
                    enabled: true,
                    tooltip: i18n('SEPARATOR TOOLTIP')
                },
                //rightButtons:[
                //{
                //     text: i18n('SEQUENCE'),
                //     onPress: function() {
                //         _self.sequenceDialog.open();
                //     },
                //     isButton: true,
                //     iconFont: "Sign-and-Symbols",
                //     icon: "workflow",
                //     enabled: true,
                //     tooltip: i18n('SEQUENCE TOOLTIP')
                // },
                {
                    text: i18n('CONCATENATION'),
                    onPress: function() {
                        _self.coreServices.openConcatDialog();
                    },
                    isButton: true,
                    iconFont: 'Sign-and-Symbols',
                    icon: 'organizationchartB',
                    enabled: true,
                    tooltip: i18n('CONCATENATION TOOLTIP')
                }, {
                    text: i18n('BUSINESS RULES'),
                    onPress: function() {
                        _self.coreServices.showBusinessRuleDialog.open();
                    },
                    isButton: true,
                    iconFont: "Finance-and-Office",
                    icon: "wallet",
                    enabled: true,
                    tooltip: i18n('CLICK PRESS TO') + i18n('SHOW BUSINESS RULES')
                }, {
                    text: i18n('HIDE RULE'),
                    onPress: function() {
                        _self.coreServices.openHideRuleDialog();
                    },
                    isButton: true,
                    iconFont: "Display-and-Setting",
                    icon: "hide",
                    enabled: true,
                    tooltip: i18n('CLICK PRESS TO') + i18n('SHOW HIDE RULES')
                }, {
                    text: i18n('COPY BLOCK/RECORD'),
                    onPress: function() {
                        _self.coreServices.openCopyRecordDialog();
                    },
                    isButton: true,
                    iconFont: "File-and-Folders",
                    icon: "copydoc",
                    enabled: true,
                    tooltip: i18n('CLICK PRESS TO') + i18n('COPY BLOCK/RECORD')
                }, {
                    text: i18n("SPED MAPPING"),
                    onPress: function() {
                        _self.coreServices.openSpedMappingDialog();
                    },
                    isButton: true,
                    iconFont: "Sign-and-Symbols",
                    icon: "organizationchartE",
                    enabled: true,
                    tooltip: i18n("CLICK PRESS TO") + i18n("SHOW SPED MAPPING")
                }
            ],
            hideGrid: true
        });
    },
    inputFind: function() {
        var _self = this;
        $("#inputFind").bindBaseInput({
            placeholder: "Find, bloco, registro e campo",
            icon: "magnifier",
            iconFont: "Sign-and-Symbols",
            iconLeft: true,
            onChange: function(oldVal, newVal) {
                if (oldVal !== newVal) {
                    _self.coreServices.hasChanged = true;
                }
            }
        });
    },
    addBlock: function(copy, log) {
        var _self = this;
        var newBlockId = _self.getBlockId();
        if (!copy) {
            _self.coreServices.layoutObject.blocks[newBlockId] = {
                name: "",
                records: {},
                positions: []
            };
        } else {
            _self.coreServices.layoutObject.blocks[newBlockId] = copy;
        }
        var newBlock = $('#block-list-wrapper').bindDFGBlockUnit({
            parentBlockId: newBlockId
        });
        if (log) {
            _self.coreServices.lastChanges.push({
                message: {
                    enus: "A new block was added",
                    ptrbr: "Um novo bloco foi adicionado"
                },
                blockId: newBlockId,
                type: 1
            });
        }
        _self.coreServices.blocks.push(newBlock);
        if (_self.coreServices.totals.records) {
            newBlock.addCountRecord();
        }
        return newBlock;
    },
    getBlockId: function() {
        var _self = this;
        var blocks = _self.coreServices.layoutObject.blocks;
        var newBlockId = -1;
        var found = false;
        while (!found) {
            newBlockId++;
            found = true;
            for (var i in blocks) {
                if (newBlockId == i) {
                    found = false;
                }
            }
        }
        return newBlockId + "";
    },
    renderLayout: function() {
        var _self = this;
        $('#block-list-wrapper').empty();
        var layoutData = _self.coreServices.layoutObject;
        _self.getRules();
        _self.coreServices.blocks = [];
        for (var i = 0; i < layoutData.positions.length; i++) {
            //for (var i in layoutData.blocks) {
            _self.coreServices.blocks[i] = $('#block-list-wrapper').bindDFGBlockUnit({
                parentBlockId: layoutData.positions[i]
            });
            if (layoutData.blocks[layoutData.positions[i]].isTotal) {
                _self.coreServices.totals.blocksView = _self.coreServices.blocks[i];
            }
        }
        _self._sortableBlocks();
    },
    getRules: function() {
        var _self = this;
        var layoutData = _self.coreServices.layoutObject;
        if (typeof(_self.coreServices.rulesObj) === "undefined") {
            _self.coreServices.rulesObj = [];
        }
        $.each(layoutData.blocks, function(blockIndex, block) {
            $.each(block.records, function(recordIndex, record) {
                if (typeof(record.rules) !== "undefined") {
                    Object.keys(record.rules).forEach(function(name) {
                        _self.coreServices.rulesObj.push({
                            parentRecordId: recordIndex,
                            parentBlockId: blockIndex
                        });
                        _self.coreServices.rulesObj[_self.coreServices.rulesObj.length - 1][name] = record.rules[name];
                    });
                }
            });
        });
    },
    getLayoutData: function() {
        var _self = this;
        var idLayout = window.parameters.id;
        var idVersion = window.parameters.idVersion;
        Data.endpoints.dfg.layout.read.post({
            id: idLayout,
            idVersion: idVersion,
            structure: true
        }).success(function(serviceData) {
            var _json;
            var _idVersion;
            var _isEmited = false;
            _self.coreServices.lastChanges = [];
            if (!idVersion) {
                _idVersion = serviceData.internalVersion[serviceData.internalVersion.length - 1].id;
                _json = serviceData.internalVersion[serviceData.internalVersion.length - 1].json;
            } else {
                _idVersion = idVersion;
                var _found;
                serviceData.internalVersion.forEach(function(item, index) {
                    if (item.id == idVersion) {
                        _found = index;
                        _isEmited = item.hasOwnProperty('idDigitalFile');
                        return;
                    }
                });
                _json = serviceData.internalVersion[_found].json;
            }
            if (JSON.parse(_json).hasOwnProperty('blocks')) {
                //REMUEVE CARACTERES &gt; y &lt;
                var temp = JSON.stringify(_json);
                temp = temp.replace(/&gt;/g, ">");
                temp = temp.replace(/&lt;/g, "<");
                _json = JSON.parse(temp);
                serviceData.json = JSON.parse(_json);
                serviceData.blocks = serviceData.json.blocks;
                serviceData.positions = serviceData.json.positions;
                serviceData.fields = serviceData.json.fields;
                serviceData.format = serviceData.json.format;
                serviceData.mapConfig = serviceData.json.mapConfig;
                serviceData.rules = serviceData.json.rules;
                serviceData.separator = serviceData.json.separator;
                serviceData.relations = serviceData.json.relations;
                serviceData.groups = serviceData.json.groups;
                if (!serviceData.groups) {
                    serviceData.groups = {
                        blocks: {}
                    };
                }
                serviceData.configIdRecord = serviceData.json.configIdRecord === undefined ? 0 : serviceData.json.configIdRecord;
                serviceData.filters = serviceData.json.filters;
                serviceData.outputs = serviceData.json.outputs;
                serviceData.manualParams = [];
                serviceData.fixedFields = [];
            } else {
                serviceData.json = {};
                serviceData.blocks = {};
                serviceData.positions = [];
                serviceData.fields = {};
                serviceData.format = {};
                serviceData.mapConfig = {};
                serviceData.rules = [];
                serviceData.relations = [];
                serviceData.groups = {
                    blocks: {}
                };
                serviceData.outputs = [];
                serviceData.manualParams = [];
                serviceData.fixedFields = [];
                serviceData.separator = {
                    value: "",
                    inFirst: false,
                    inLast: false
                };
            }
            _self.coreServices.layoutObject = serviceData;
            $("#main-title").html(_self.coreServices.layoutObject.name);
            _self.coreServices.showVersionsDialog = $.baseDialog({
                title: "ID " + i18n('RECORD'),
                modal: true,
                size: "big",
                outerClick: 'disabled',
                viewName: "app.views.dialogs.VersionData",
                cssClass: "newFile",
                viewData: {
                    allVersions: true,
                    dataVersions: _self.coreServices.layoutObject.internalVersion
                },
                buttons: [{
                    name: i18n('CLOSE'),
                    isCloseButton: true,
                    tooltip: i18n('CLICK PRESS CLOSE'),
                    click: function() {
                        _self.initialFocus('#right-content > div > div.toolbar-top > div > ul.library-toolbar-items > li:nth-child(5) > button');
                    }
                }]
            });
            _self.addManualParams();
            _self.addFixedFields();
            _self.coreServices.layoutObject.idVersion = _idVersion;
            $.globalFunctions.organizeJSON(_self.coreServices.layoutObject);
            _self.coreServices.renderLayout = function() {
                $.blockBuilder.coreServices = _self.coreServices;
                $.blockBuilder.structure = _self.coreServices.layoutObject.structure;
                $.blockBuilder.setData(_self.coreServices.layoutObject.json, $('#block-list-wrapper'));
                //_self.renderLayout();
            };
            _self.coreServices.initDataStructure(_self.coreServices.layoutObject.structure);
            if (_isEmited) {
                var _targetToolbar = $(".toolbar-top .leftButton").eq(0);
                _targetToolbar.addClass('disabled');
                _targetToolbar.find("button").unbind("click");
                _targetToolbar.find('button').attr('tabindex', -1);
            }
            
            _self.coreServices.visualization.setMapping(serviceData.json.visualization);
            _self.coreServices.visualization.renderTable(serviceData); 
            $('.overlay').remove();
        }).error(function(response) {
            if (!_self.privileges.layout.read) {
                $.baseToast({
                    text: i18n("NO READ PRIVILEGE FOR") + " " + i18n("LAYOUTS"),
                    type: "W"
                });
                _self.goToLibrary();
                return;
            }
            if (response === "unauthorized") {
                if ($.timpUserData.layout.read) {
                    _self.goToLibrary();
                } else {
                    _self.goToTaskBoard();
                }
            } else {
                $.baseToast({
                    text: response,
                    isError: true
                });
            }
        });
    },
    initDialogs: function() {
        var _self = this;
        let buttons = [{
            name: i18n('CANCEL'),
            isCloseButton: true,
            tooltip: i18n('CLICK PRESS CANCEL'),
            click: function() {
                _self.initialFocus('#toolbarSecund > div > ul.library-toolbar-items > li:nth-child(5) > button');
            }
        }];
        if (!this.isPreview) {
            buttons.push({
                name: i18n('APPLY'),
                click: function() {
                    _self.coreServices.layoutObject.separator = _self.separatorDialog.getInnerController().getOwnData();
                    _self.separatorDialog.close();
                    _self.coreServices.hasChanged = true;
                    _self.initialFocus('#toolbarSecund > div > ul.library-toolbar-items > li:nth-child(5) > button');
                },
                tooltip: i18n('CLICK PRESS CONFIRM')
            });
        }
        _self.separatorDialog = $.baseDialog({
            title: i18n('SEPARATOR'),
            modal: true,
            size: "medium",
            outerClick: 'disabled',
            cssClass: "newFile",
            viewName: "app.views.dialogs.Separator",
            viewData: {},
            buttons: buttons
        });
        
        buttons = [{
            name: i18n('CLOSE'),
            isCloseButton: true,
            tooltip: i18n("CLICK PRESS CLOSE"),
            click: function() {}
        }];
        if (!this.isPreview) {
            buttons.push({
                name: i18n('APPLY'),
                click: function() {
                    var innerController = _self.coreServices.showRelationDialog.getInnerController();
                    var r = innerController.getRelations();
                    _self.coreServices.layoutObject.relations = r.relations;
                    _self.coreServices.layoutObject.hasHierarchy = r.hasHierarchy;
                    _self.coreServices.showRelationDialog.close();
                },
                tooltip: i18n("CLICK PRESS CONFIRM")
            });
        }
        _self.coreServices.showRelationDialog = $.baseDialog({
            title: i18n('RELATIONS'),
            modal: true,
            size: "wide",
            outerClick: 'disabled',
            viewName: "app.views.dialogs.relationDialog",
            viewData: {},
            buttons: buttons
        });
        
        buttons = [{
            name: i18n('CLOSE'),
            isCloseButton: true,
            tooltip: i18n("CLICK PRESS CLOSE"),
            click: function() {}
        }];
        if (!this.isPreview) {
            buttons.push({
                name: i18n('APPLY'),
                click: function() {
                    var innerController = _self.coreServices.showBusinessRuleDialog.getInnerController();
                    if (innerController.isValid()) {
                        var ruleObject = innerController.getRuleData();
                        _self.coreServices.showBusinessRuleDialog.close();
                        if (!_self.coreServices.layoutObject.blocks[ruleObject.block].records[ruleObject.record].businessRules) {
                            _self.coreServices.layoutObject.blocks[ruleObject.block].records[ruleObject.record].businessRules = {};
                        }
                        if (ruleObject.idRule === 'DR') {
                            delete _self.coreServices.layoutObject.blocks[ruleObject.block].records[ruleObject.record].businessRules[ruleObject.field];
                        } else {
                            _self.coreServices.layoutObject.blocks[ruleObject.block].records[ruleObject.record].businessRules[ruleObject.field] = {
                                idRule: ruleObject.idRule
                            };
                        }
                    } else {
                        $.baseToast({
                            type: 'W',
                            text: i18n("FILL ALL FIELDS")
                        });
                    }
                },
                tooltip: i18n("CLICK PRESS CONFIRM")
            });
        }
        _self.coreServices.showBusinessRuleDialog = $.baseDialog({
            title: i18n('BUSINESS RULES'),
            modal: true,
            size: "big",
            outerClick: 'disabled',
            viewName: "app.views.dialogs.businessRuleDialog",
            viewData: {},
            buttons: buttons
        });
        _self.configDialog = $.baseDialog({
            title: i18n('MAP CONFIG'),
            modal: true,
            size: "big",
            outerClick: 'disabled',
            viewName: "app.views.dialogs.MapConfig",
            cssClass: "newFile dfg-dialog",
            viewData: {},
            buttons: [{
                name: i18n('CANCEL'),
                isCloseButton: true,
                tooltip: i18n('CLICK PRESS CANCEL')
            }, {
                name: i18n('APPLY'),
                click: function() {
                    _self.configDialog.getInnerController().updateConfigData();
                    _self.configDialog.close();
                },
                tooltip: i18n('CLICK PRESS CONFIRM')
            }]
        });
        
        buttons = [{
            name: i18n('CLOSE'),
            isCloseButton: true,
            tooltip: i18n("CLICK PRESS CLOSE"),
            click: function() {}
        }];
        if (!this.isPreview) {
            buttons.push({
                name: i18n('APPLY'),
                click: function() {
                    _self.sequenceDialog.getInnerController().updateSequence();
                    _self.sequenceDialog.close();
                    _self.coreServices.hasChanged = true;
                },
                tooltip: i18n('CLICK PRESS CONFIRM')
            });
        }
        _self.sequenceDialog = $.baseDialog({
            title: i18n('SEQUENCE'),
            modal: true,
            size: "big",
            outerClick: 'disabled',
            viewName: "app.views.dialogs.Sequence",
            cssClass: "Sequence newFile dfg-dialog",
            viewData: {},
            buttons: buttons
        });
    },
    /* This method updates the layout information and it is after that saved.*/
    updateLayoutObject: function() {
        var _self = this;
        // layout is default before proved otherwise
        _self.coreServices.layoutObject.isDefault = true;
        // Get all updated data before Save
        var layoutObject = _self.coreServices.layoutObject;
        _self.coreServices.layoutObject.relations = _self.verifyRelations();
        $.globalFunctions.organizeJSON(_self.coreServices.layoutObject);
        if (typeof(_self.coreServices.rulesObj) !== "undefined") {
            layoutObject.rules = $.map(_self.coreServices.rulesObj, function(val) {
                return parseInt(Object.keys(val)[0]);
            });
            $.unique(layoutObject.rules);
        }
    },
    verifyRelations: function() {
        var _self = this;
        var relations = _self.coreServices.layoutObject.relations;
        var blocks = _self.coreServices.layoutObject.blocks;
        var positions = _self.coreServices.layoutObject.positions;
        if (Object.keys(blocks).length > 0 && relations) {
            for (var i = 0; i < relations.length; i++) {
                var fatherBlock = relations[i].father.block;
                var sonBlock;
                var fatherRecord = relations[i].father.record.split(";")[1];
                var indexFatherBlock = positions.indexOf(fatherBlock);
                var indexSonBlock;
                var recordPositions = blocks[fatherBlock].positions;
                var indexFatherRecord = recordPositions.indexOf(fatherRecord);
                var indexSonRecord;
                if (indexFatherBlock === -1) {
                    relations[i] = undefined;
                    continue;
                }
                if (indexFatherRecord === -1) {
                    relations[i] = undefined;
                    continue;
                }
                for (var j = 0; relations[i] && j < relations[i].son.block.length && relations[i]; j++) {
                    sonBlock = relations[i].son.block[j];
                    var sonRecord = relations[i].son.record;
                    indexSonBlock = positions.indexOf(sonBlock);
                    if (indexSonBlock === -1) {
                        relations[i] = undefined;
                        break;
                    }
                    if (fatherBlock != sonBlock) { //Verifies if the fatherBlock is still the father after any remove
                        if (indexSonBlock < indexFatherBlock) {
                            relations[i] = undefined;
                            break;
                        }
                    } else {
                        for (var k = 0; relations[i] && k < sonRecord.length; k++) {
                            indexSonRecord = recordPositions.indexOf(sonRecord[k].split(";")[1]);
                            if (indexSonRecord === -1) {
                                relations[i] = undefined;
                                break;
                            }
                            if (indexSonRecord < indexFatherRecord) {
                                relations[i] = undefined;
                                break;
                            }
                            if (relations[i]) {
                                var keys = relations[i].keys;
                                for (var j = 0; j < keys.length; j++) {
                                    var sonKey = keys[j].sonKey;
                                    var fatherKey = keys[j].fatherKey;
                                    if (!blocks[fatherBlock].records[fatherRecord].columns[fatherKey.key.split(";")[2]]) {
                                        keys[j] = false;
                                    }
                                    if (!blocks[sonBlock].records[sonRecord[k].split(";")[1]].columns[sonKey.key.split(";")[2]]) {
                                        keys[j] = false;
                                    }
                                }
                                keys = keys.filter(function(e) {
                                    if (e) {
                                        return true;
                                    }
                                    return false;
                                });
                                if (keys.length === 0) {
                                    relations[i] = undefined;
                                }
                            }
                        }
                    }
                }
            }
        }
        if (relations) {
            relations = relations.filter(function(r) {
                if (r) {
                    return true;
                }
                return false;
            });
            if (relations.length > 0) {
                return relations;
            }
        }
    },
    updateFormulaData: function(formulaObject) {
        var _self = this;
        var layoutObject = _self.coreServices.layoutObject;
        for (var i in layoutObject.blocks) {
            for (var j in layoutObject.blocks[i].records) {
                for (var k in layoutObject.blocks[i].records[j].columns) {
                    if (layoutObject.blocks[i].records[j].columns[k].fieldId == null && layoutObject.blocks[i].records[j].columns[k].formula) {
                        layoutObject.blocks[i].records[j].columns[k].formula = {};
                        layoutObject.blocks[i].records[j].idStructure = formulaObject.blocks[i].records[j].idStructure;
                        layoutObject.blocks[i].records[j].columns[k].formula.idStructure = formulaObject.blocks[i].records[j].columns[k].formula.idStructure;
                        layoutObject.blocks[i].records[j].columns[k].idStructure = formulaObject.blocks[i].records[j].columns[k].formula.idStructure;
                        layoutObject.blocks[i].records[j].columns[k].formula.label = formulaObject.blocks[i].records[j].columns[k].formula.label;
                        layoutObject.blocks[i].records[j].columns[k].formula.raw = formulaObject.blocks[i].records[j].columns[k].formula.raw;
                        layoutObject.blocks[i].records[j].columns[k].formula.text = formulaObject.blocks[i].records[j].columns[k].formula.text;
                        layoutObject.blocks[i].records[j].columns[k].formula.hana = formulaObject.blocks[i].records[j].columns[k].formula.hana;
                        layoutObject.blocks[i].records[j].columns[k].formula.type = formulaObject.blocks[i].records[j].columns[k].formula.type;
                        layoutObject.blocks[i].records[j].columns[k].formula.outputs = formulaObject.blocks[i].records[j].columns[k].formula.outputs;
                        layoutObject.blocks[i].records[j].columns[k].formula.idManualParams = formulaObject.blocks[i].records[j].columns[k].formula.idManualParams;
                    }
                }
            }
        }
        _self.coreServices.layoutObject.blocks = layoutObject.blocks;
    },
    updateParamData: function(paramObject) {
        var _self = this;
        var layoutObject = _self.coreServices.layoutObject;
        for (var i in layoutObject.blocks) {
            for (var j in layoutObject.blocks[i].records) {
                for (var k in layoutObject.blocks[i].records[j].columns) {
                    if (layoutObject.blocks[i].records[j].columns[k].fieldId === null && layoutObject.blocks[i].records[j].columns[k].manualParam) {
                        layoutObject.blocks[i].records[j].columns[k].manualParam = paramObject.blocks[i].records[j].columns[k].manualParam;
                    }
                }
            }
        }
        _self.coreServices.layoutObject.blocks = layoutObject.blocks;
    },
    updateDfgOutputData: function(outputData, column) {
        column.output.fieldId = outputData.field.key;
        column.output.fieldName = outputData.field.name;
        column.output.idStructure = outputData.structure.key;
        column.output.blockId = outputData.block.key;
        column.output.recordId = outputData.record.key;
        column.output.name = outputData.name;
        column.output.operation = outputData.operation.key;
    },
    updateConcatData: function(data, column) {
        column.concat = {
            positions: data.positions,
            columns: data.columns
        };
    },
    removeConcatenatedFields: function(fields) {
        for (var colId in fields) {
            $('[data-id="' + colId + '"] .label-wrapper .label-container .field-close').click();
        }
    },
    addToOutputList: function(column, columnId, recordId, blockId) {
        if (!_self.coreServices.layoutObject.outputs) {
            _self.coreServices.layoutObject.outputs = [];
        }
        var outputs = _self.coreServices.layoutObject.outputs;
        var output = {
            column: column,
            columnId: columnId,
            recordId: recordId,
            blockId: blockId
        };
        for (var i = 0; i < outputs.length; i++) {
            if (outputs[i].columnId === columnId) {
                outputs[i] = output;
                return;
            }
        }
        _self.coreServices.layoutObject.outputs.push(output);
    },
    removeFromOutPutList: function(columnId) {
        if (!_self.coreServices.layoutObject.outputs) {
            _self.coreServices.layoutObject.outputs = [];
        }
        var outputs = _self.coreServices.layoutObject.outputs;
        for (var i = 0; i < outputs.length; i++) {
            if (outputs[i].columnId === columnId) {
                outputs.splice(i, 1);
                return;
            }
        }
    },
    deleteCascadeOutputs: function(deletedField) {
        if (!_self.coreServices.layoutObject.outputs) {
            _self.coreServices.layoutObject.outputs = [];
        }
        var outputs = _self.coreServices.layoutObject.outputs;
        for (var i = 0; i < outputs.length; i++) {
            var field = outputs[i].column.output;
            if (field.blockId === deletedField.blockId &&
                field.recordId === deletedField.recordId &&
                field.fieldId === deletedField.fieldId) {
                $('[data-id="' + outputs[i].columnId + '"] .label-wrapper .label-container .field-close').click();
                return;
            }
        }
    },
    addManualParams: function() {
        var _self = this;
        var layoutObject = _self.coreServices.layoutObject;
        var manualParams = _self.coreServices.layoutObject.manualParams;
        for (var i in layoutObject.blocks) {
            for (var j in layoutObject.blocks[i].records) {
                for (var k in layoutObject.blocks[i].records[j].columns) {
                    if (layoutObject.blocks[i].records[j].columns[k].fieldId === null && layoutObject.blocks[i].records[j].columns[k].manualParam) {
                        manualParams.push({
                            column: layoutObject.blocks[i].records[j].columns[k],
                            columnId: k,
                            recordId: j,
                            blockId: i
                        });
                    }
                }
            }
        }
    },
    addToManualParamList: function(column, columnId, recordId, blockId) {
        var manualParams = _self.coreServices.layoutObject.manualParams;
        var manualParam = {
            column: column,
            columnId: columnId,
            recordId: recordId,
            blockId: blockId
        };
        for (var i = 0; i < manualParams.length; i++) {
            if (manualParams[i].columnId === columnId) {
                manualParams[i] = manualParam;
                return;
            }
        }
        _self.coreServices.layoutObject.manualParams.push(manualParam);
    },
    removeFromManualParamList: function(columnId) {
        var manualParams = _self.coreServices.layoutObject.manualParams;
        for (var i = 0; i < manualParams.length; i++) {
            if (manualParams[i].columnId === columnId) {
                manualParams.splice(i, 1);
                return;
            }
        }
    },
    addFixedFields: function() {
        var _self = this;
        var layoutObject = _self.coreServices.layoutObject;
        var fixedFields = _self.coreServices.layoutObject.fixedFields;
        for (var i in layoutObject.blocks) {
            for (var j in layoutObject.blocks[i].records) {
                for (var k in layoutObject.blocks[i].records[j].columns) {
                    if (layoutObject.blocks[i].records[j].columns[k].fieldId === null && layoutObject.blocks[i].records[j].columns[k].fixedField) {
                        fixedFields.push({
                            column: layoutObject.blocks[i].records[j].columns[k],
                            columnId: k,
                            recordId: j,
                            blockId: i
                        });
                    }
                }
            }
        }
    },
    addToFixedFieldList: function(column, columnId, recordId, blockId) {
        var fixedFields = this.coreServices.layoutObject.fixedFields;
        var fixedField = {
            column: column,
            columnId: columnId,
            recordId: recordId,
            blockId: blockId
        };
        for (var i = 0; i < fixedFields.length; i++) {
            if (fixedFields[i].columnId === columnId) {
                fixedFields[i] = fixedField;
                return;
            }
        }
        this.coreServices.layoutObject.fixedFields.push(fixedField);
    },
    removeFromFixedFieldList: function(columnId) {
        var fixedFields = this.coreServices.layoutObject.fixedFields;
        for (var i = 0; i < fixedFields.length; i++) {
            if (fixedFields[i].columnId === columnId) {
                fixedFields.splice(i, 1);
                return;
            }
        }
    },
    updateFixedFieldData: function(fixedFieldObject) {
        var _self = this;
        var layoutObject = _self.coreServices.layoutObject;
        for (var i in layoutObject.blocks) {
            for (var j in layoutObject.blocks[i].records) {
                for (var k in layoutObject.blocks[i].records[j].columns) {
                    if (layoutObject.blocks[i].records[j].columns[k].fieldId === null && layoutObject.blocks[i].records[j].columns[k].fixedField) {
                        layoutObject.blocks[i].records[j].columns[k].fixedField = {};
                        layoutObject.blocks[i].records[j].columns[k].fixedField.id = fixedFieldObject.blocks[i].records[j].columns[k].fixedField.id;
                        layoutObject.blocks[i].records[j].columns[k].fixedField.name = fixedFieldObject.blocks[i].records[j].columns[k].fixedField.name;
                        layoutObject.blocks[i].records[j].columns[k].fixedField.type = fixedFieldObject.blocks[i].records[j].columns[k].fixedField.type;
                        layoutObject.blocks[i].records[j].columns[k].fixedField.size = fixedFieldObject.blocks[i].records[j].columns[k].fixedField.size;
                        layoutObject.blocks[i].records[j].columns[k].fixedField.values = fixedFieldObject.blocks[i].records[j].columns[k].fixedField.values;
                    }
                }
            }
        }
        _self.coreServices.layoutObject.blocks = layoutObject.blocks;
    },
    updateFillerData: function(fillerObject) {
        var _self = this;
        var layoutObject = _self.coreServices.layoutObject;
        for (var i in layoutObject.blocks) {
            for (var j in layoutObject.blocks[i].records) {
                for (var k in layoutObject.blocks[i].records[j].columns) {
                    if (layoutObject.blocks[i].records[j].columns[k].fieldId === null && layoutObject.blocks[i].records[j].columns[k].filler) {
                        layoutObject.blocks[i].records[j].columns[k].filler = {};
                        layoutObject.blocks[i].records[j].columns[k].filler.id = fillerObject.blocks[i].records[j].columns[k].filler.id;
                        layoutObject.blocks[i].records[j].columns[k].filler.value = fillerObject.blocks[i].records[j].columns[k].filler.value;
                        layoutObject.blocks[i].records[j].columns[k].filler.name = fillerObject.blocks[i].records[j].columns[k].filler.name;
                    }
                }
            }
        }
        _self.coreServices.layoutObject.blocks = layoutObject.blocks;
    },
    updateListFieldData: function(listFieldObject) {
        var _self = this;
        var layoutObject = _self.coreServices.layoutObject;
        for (var i in layoutObject.blocks) {
            for (var j in layoutObject.blocks[i].records) {
                for (var k in layoutObject.blocks[i].records[j].columns) {
                    if (layoutObject.blocks[i].records[j].columns[k].fieldId === null && layoutObject.blocks[i].records[j].columns[k].listField) {
                        layoutObject.blocks[i].records[j].columns[k].listField = {};
                        layoutObject.blocks[i].records[j].columns[k].listField.id = listFieldObject.blocks[i].records[j].columns[k].listField.id;
                        layoutObject.blocks[i].records[j].columns[k].listField.fields = listFieldObject.blocks[i].records[j].columns[k].listField.fields;
                        layoutObject.blocks[i].records[j].columns[k].listField.name = listFieldObject.blocks[i].records[j].columns[k].listField.name;
                    }
                }
            }
        }
    },
    updateVersionData: function(paramObject) {
        var _self = this;
        var layoutObject = _self.coreServices.layoutObject;
        for (var i in layoutObject.blocks) {
            for (var j in layoutObject.blocks[i].records) {
                for (var k in layoutObject.blocks[i].records[j].columns) {
                    if (layoutObject.blocks[i].records[j].columns[k].fieldId === null && layoutObject.blocks[i].records[j].columns[k].version) {
                        layoutObject.blocks[i].records[j].columns[k].version = {};
                        layoutObject.blocks[i].records[j].columns[k].version.id = paramObject.blocks[i].records[j].columns[k].version.id;
                        layoutObject.blocks[i].records[j].columns[k].version.label = paramObject.blocks[i].records[j].columns[k].version.label;
                    }
                }
            }
        }
        _self.coreServices.layoutObject.blocks = layoutObject.blocks;
    },
    updateFormatData: function(formatObject) {
        var _self = this;
        var layoutObject = _self.coreServices.layoutObject;
        layoutObject.format = formatObject.format;
        for (var i in layoutObject.blocks) {
            layoutObject.blocks[i].format = formatObject.blocks[i].format;
            for (var j in layoutObject.blocks[i].records) {
                layoutObject.blocks[i].records[j].format = formatObject.blocks[i].records[j].format;
                for (var k in layoutObject.blocks[i].records[j].columns) {
                    layoutObject.blocks[i].records[j].columns[k].format = formatObject.blocks[i].records[j].columns[k].format;
                    $.blockBuilder.updateColumnReference(i, j, k, JSON.parse(JSON.stringify(layoutObject.blocks[i].records[j].columns[k])));
                }
            }
        }
        _self.coreServices.layoutObject.format = layoutObject.format;
    },
    updateFiltersData: function(filtersObject) {
        var _self = this;
        var layoutObject = _self.coreServices.layoutObject;
        layoutObject.filters = filtersObject.filters;
        for (var i in layoutObject.blocks) {
            layoutObject.blocks[i].filters = filtersObject.blocks[i].filters;
            for (var j in layoutObject.blocks[i].records) {
                layoutObject.blocks[i].records[j].filters = filtersObject.blocks[i].records[j].filters;
                if (filtersObject.blocks[i].records[j].columns) {
                    for (var k in layoutObject.blocks[i].records[j].columns) {
                        if (filtersObject.blocks[i].records[j].columns[k]) {
                            layoutObject.blocks[i].records[j].columns[k].filters = filtersObject.blocks[i].records[j].columns[k].filters;
                            $.blockBuilder.updateColumnReference(i, j, k, JSON.parse(JSON.stringify(layoutObject.blocks[i].records[j].columns[k])));
                        }
                    }
                }
                if (layoutObject.groups) {
                    if (layoutObject.groups.blocks[i]) {
                        if (layoutObject.groups.blocks[i].records[j]) {
                            for (var k in layoutObject.groups.blocks[i].records[j].structures) {
                                for (var l = 0; l < layoutObject.groups.blocks[i].records[j].structures[k].groups.length; l++) {
                                    layoutObject.groups.blocks[i].records[j].structures[k].groups[l].filters = filtersObject.blocks[i].records[j].structures[k].groups[
                                        l].filters;
                                    layoutObject.groups.blocks[i].records[j].structures[k].groups[l].columnFilters = filtersObject.blocks[i].records[j].structures[k]
                                        .groups[
                                            l].columnFilters || {};
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    updateArchiveCounts: function(data) {
        var _self = this;
        function addRecordToBlock(blockController, recordName) {
            var newRecordId = blockController.getRecordId();
            var initialStructure = Object.keys(_self.coreServices.structure)[0];
            _self.coreServices.layoutObject.blocks[blockController.getData().parentBlockId].records[newRecordId] = {
                name: recordName,
                columns: {},
                positions: [],
                idStructure: initialStructure,
                isDistinct: false
            };
            var recordController = blockController.addRecord(blockController.getData().parentBlockId, newRecordId);
            blockController._sortableRegisters();
            $('.delete-record').live('click', function() {
                var sizeBlocks = $('.block-wrapper').size();
                var sizeRegister = $('.register-wrapper').size();
                $('div.controladoresTop .totalblocks .num').html(sizeBlocks);
                $('div.controladoresTop .totalrecords .num').html(sizeRegister);
            });
            recordController.buildField({
                id: 'recordId',
                label: i18n('RECORDID')
            }, recordController.view.fieldList);
            if (recordName == '900') {
                recordController.buildField({
                    id: 'recordsTotals',
                    label: i18n('RECORD TOTALS')
                }, recordController.view.fieldList);
            }
            if (recordName == '999') {
                recordController.buildField({
                    id: 'totalsAll',
                    label: i18n('TOTALALL')
                }, recordController.view.fieldList);
            } else if (recordName == '990') {
                recordController.buildField({
                    id: 'blockTotal',
                    label: i18n('BLOCKTOTAL')
                }, recordController.view.fieldList);
            }
            return recordController;
        }
        var countBlockPresent = _self.coreServices.totals.blocks || _self.coreServices.totals.all;
        function addCountBlock() {
            if (!countBlockPresent) {
                _self.coreServices.totals.blocksView = _self.addBlock();
                _self._sortableBlocks();
                countBlockPresent = true;
                _self.coreServices.layoutObject.blocks[_self.coreServices.totals.blocksView.getData().parentBlockId].isTotal = true;
                _self.coreServices.totals.blocksView._html.find('.block-head .block-input input').val('9');
            }
        }
        if (_self.coreServices.totals.blocks != data.blocks) {
            if (data.blocks) {
                addCountBlock();
                _self.coreServices.totals.blockRecord = addRecordToBlock(_self.coreServices.totals.blocksView, '900');
            } else {
                if (_self.coreServices.totals.blockRecord) {
                    _self.coreServices.totals.blockRecord.removeRegister();
                }
            }
        }
        if (_self.coreServices.totals.all != data.all) {
            if (data.all) {
                addCountBlock();
                _self.coreServices.totals.allRecord = addRecordToBlock(_self.coreServices.totals.blocksView, '999');
            } else {
                if (_self.coreServices.totals.allRecord) {
                    _self.coreServices.totals.allRecord.removeRegister();
                }
            }
        }
        if (_self.coreServices.totals.records != data.records) {
            $.each(_self.coreServices.blocks, function(ind, block) {
                var blockParentId = block.getData().parentBlockId;
                if (_self.coreServices.layoutObject.blocks[blockParentId]) {
                    if (data.records) {
                        block.addCountRecord();
                    } else {
                        block.removeCountRecord();
                    }
                }
            });
        }
        if (!data.blocks && !data.all && _self.coreServices.totals.blocksView) {
            _self.coreServices.totals.blocksView.removeCountRecord();
            _self.coreServices.totals.blocksView.removeBlock();
        }
        if (_self.coreServices.totals.blockStarter != data.blockStarter) {
            var blockParentId;
            _self.coreServices.blocks.forEach(function(block, ind) {
                blockParentId = block.getData().parentBlockId;
                if (_self.coreServices.layoutObject.blocks[blockParentId]) {
                    if (data.blockStarter) {
                        block.addBlockStarter();
                    } else {
                        block.removeBlockStarter();
                    }
                }
            });
        }
        $.extend(_self.coreServices.totals, data);
    },
    blocosOpenClose: function() {
        $('div.controladoresTop .totalblocks.close').on('click', function() {
            $(this).removeClass('close');
            $(this).addClass('open');
            $(this).find('.icon').removeClass('icon-down');
            $(this).find('.icon').addClass('icon-up');
            $('.block-wrapper').each(function() {
                $(this).addClass('collapsed');
            });
        });
        $('div.controladoresTop .totalblocks.open').on('click', function() {
            $(this).removeClass('open');
            $(this).addClass('close');
            $(this).find('.icon').removeClass('icon-up');
            $(this).find('.icon').addClass('icon-down');
            $('.block-wrapper').each(function() {
                $(this).removeClass('collapsed');
            });
        });
    },
    recordsOpenClose: function() {
        $('div.controladoresTop .totalrecords.close').on('click', function() {
            $(this).removeClass('close');
            $(this).addClass('open');
            $(this).find('.icon').removeClass('icon-down');
            $(this).find('.icon').addClass('icon-up');
            $('.register-wrapper').each(function() {
                $(this).addClass('collapsed');
            });
        });
        $('div.controladoresTop .totalrecords.open').on('click', function() {
            $(this).removeClass('open');
            $(this).addClass('close');
            $(this).find('.icon').removeClass('icon-up');
            $(this).find('.icon').addClass('icon-down');
            $('.register-wrapper').each(function() {
                $(this).removeClass('collapsed');
            });
        });
    },
    processExhibition: function() {
        var mainCrystal = $('<div>').addClass('dfg-crystal').addClass('dfg-main');
        $('#dfg .builder-wrapper').append(mainCrystal);
    },
    goToTaskBoard: function() {
        window.location = '/timp/tkb/';
    }
});