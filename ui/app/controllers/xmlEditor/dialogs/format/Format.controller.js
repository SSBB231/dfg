sap.ui.controller("app.controllers.xmlEditor.dialogs.format.Format", {


    onInit: function() {

    },

    onDataRefactor: function(data) {
        return $.extend(data, this.data);
    },

    onAfterRendering: function(html) {
        var _self = this;
        this.initServices();
        this.bindEvents();
        if (_self.coreServices.exhibition) {
            _self.processExhibition();
        }
        if (_self.getData().initLevel) {
            _self.initValues();
        }
    },

    bindEvents: function() {
        var _self = this;
    },

    initServices: function() {
        var _self = this;
        // _self.layoutObject = _self.coreServices.layoutObject;
        //Initialize temporary objects
        _self.initTempFormat();

        var comboOptions = [];
        comboOptions.push({
            key: null,
            name: i18n('ALL')
        });
        // for (var i in _self.coreServices.layoutObject.blocks) {
        //     var currVal = {};
        //     currVal.key = i;
        //     if (!_self.coreServices.layoutObject.blocks[i].name) {
        //         currVal.name = i;
        //     } else {
        //         currVal.name = _self.coreServices.layoutObject.blocks[i].name;
        //     }
        //     comboOptions.push(currVal);
        // }

        // _self.comboBlocks = $('#comboBlocks').bindBaseSelect({
        //     options: comboOptions,
        //     onChange: function(oldVal, newVal) {
        //         if (oldVal.key != newVal.key && oldVal.key != '') {
        //             _self.updateFormatObject();
        //             if (newVal.key != null) {
        //                 var comboOptions = [];
        //                 comboOptions.push({
        //                     key: null,
        //                     name: i18n('ALL')
        //                 });
        //                 $('#comboRecords').html('');
        //                 for (var i in _self.coreServices.layoutObject.blocks[newVal.key].records) {
        //                     var currVal = {};
        //                     currVal.key = i;
        //                     if (!_self.coreServices.layoutObject.blocks[newVal.key].records[i].name) {
        //                         currVal.name = i;
        //                     } else {
        //                         currVal.name = _self.coreServices.layoutObject.blocks[newVal.key].records[i].name;
        //                     }
        //                     comboOptions.push(currVal);
        //                 }
        //                 _self.comboRecords = $('#comboRecords').bindBaseSelect({
        //                     tooltip: i18n('RECORD SELECT TOOLTIP'),
        //                     options: comboOptions,
        //                     onChange: function(oldVal, newVal) {
        //                         if (oldVal.key != newVal.key && oldVal.key != '') {
        //                             _self.updateFormatObject();
        //                             if (newVal.key != null) {
        //                                 var comboOptions = [];
        //                                 comboOptions.push({
        //                                     key: null,
        //                                     name: i18n('ALL')
        //                                 });
        //                                 $('#comboColumns').html('');
        //                                 var currColumns = _self.coreServices.layoutObject.blocks[_self.comboBlocks.getKey()].records[newVal.key].columns;
        //                                 _self.coreServices.currColumns = currColumns;
        //                                 for (var i in currColumns) {
        //                                     if (currColumns[i].fieldId) {
        //                                         var currVal = {};
        //                                         currVal.key = i;

        //                                         if (currColumns[i].fieldId === 'HRE') {
        //                                             currVal.name = i18n("HR_EXECUCAO");
        //                                         } else if (currColumns[i].fieldId === 'DTE') {
        //                                             currVal.name = i18n("DT_EXECUCAO");
        //                                         } else {
        //                                             currVal.name = _self.coreServices.structure[currColumns[i].idStructure].fields[currColumns[i].fieldId].label;
        //                                         }
        //                                         comboOptions.push(currVal);
        //                                     } else {
        //                                         var currVal = {};
        //                                         currVal.key = i;
        //                                         if (currColumns[i].hasOwnProperty('manualParam')) {
        //                                             currVal.name = currColumns[i].manualParam.label;
        //                                         }
        //                                         if (currColumns[i].hasOwnProperty('formula')) {
        //                                             currVal.name = i;
        //                                         }
        //                                         if (currColumns[i].hasOwnProperty('fixedManualField')) {
        //                                             currVal.name = currColumns[i].fixedManualField.name;
        //                                         }
        //                                         if (currColumns[i].hasOwnProperty('fixedField')) {
        //                                             currVal.name = currColumns[i].fixedField.name;
        //                                         }
        //                                         if (currColumns[i].isInitialDateReference === true) {
        //                                             currVal.name = i18n("INITDATEREFERENCE");
        //                                         }
        //                                         if (currColumns[i].isFinalDateReference === true) {
        //                                             currVal.name = i18n("FINALDATEREFERENCE");
        //                                         }
        //                                         if (currColumns[i].id === "HRE") {
        //                                             currVal.name = i18n('HR_EXECUCAO');
        //                                         }
        //                                         if (currColumns[i].hasOwnProperty('recordId')) {
        //                                             if (typeof(currColumns[i].recordId) !== "object") {
        //                                                 currVal.name = "ID " + i18n("RECORD");
        //                                             } else {
        //                                                 if (currColumns[i].recordId.hasOwnProperty("blockId")) {
        //                                                     currVal.name = "ID " + i18n("BLOCK") + (currColumns[i].recordId.hasOwnProperty("recordId") ? " + ID" + i18n("RECORD") : "");
        //                                                 } else {
        //                                                     currVal.name = "ID " + i18n("RECORD");
        //                                                 }
        //                                             }
        //                                         }
        //                                         if (currColumns[i].hasOwnProperty('filler')) {
        //                                             currVal.name = currColumns[i].filler.id;
        //                                         }
        //                                         if (currColumns[i].hasOwnProperty('version')) {
        //                                             currVal.name = currColumns[i].version.id;
        //                                         }
        //                                         if (currColumns[i].hasOwnProperty('output')) {
        //                                             currVal.name = currColumns[i].output.label;
        //                                         }
        //                                         if (currColumns[i].isRecordsTotals) {
        //                                             currVal.name = i18n("RECORDTOTAL");
        //                                         }
        //                                         if (currColumns[i].isBlocksTotal) {
        //                                             currVal.name = i18n("BLOCKTOTAL");
        //                                         }
        //                                         if (currColumns[i].isTotalsAll) {
        //                                             currVal.name = i18n("TOTALALL");
        //                                         }
        //                                         if (currColumns[i].isReferencePeriod) {
        //                                             currVal.name = currColumns[i].label;
        //                                         }
        //                                         comboOptions.push(currVal);

        //                                     }
        //                                 }
        //                                 _self.comboColumns = $('#comboColumns').bindBaseSelect({
        //                                     options: comboOptions,
        //                                     tooltip: i18n('FIELD SELECT TOOLTIP'),
        //                                     onChange: function(oldVal, newVal) {
        //                                         if (oldVal.key != newVal.key && oldVal.key != '') {
        //                                             _self.updateFormatObject();
        //                                             _self.currentLevel = _self.getCurrentLevel();

        //                                             _self.renderTabData();
        //                                         }
        //                                     }
        //                                 });
        //                                 _self.comboColumns.setKey(null);
        //                             } else {
        //                                 $('#comboColumns').html('');
        //                                 _self.comboColumns = $('#comboColumns').bindBaseSelect({
        //                                     options: [],
        //                                     isDisabled: true,
        //                                     tooltip: i18n('FIELD SELECT TOOLTIP'),
        //                                     onChange: function(oldVal, newVal) {}
        //                                 });
        //                             }
        //                             _self.currentLevel = _self.getCurrentLevel();
        //                             _self.renderTabData();
        //                         }
        //                     }
        //                 });
        //                 _self.comboRecords.setKey(null);
        //             } else {
        //                 $('#comboRecords').html('');
        //                 _self.comboRecords = $('#comboRecords').bindBaseSelect({
        //                     options: comboOptions,
        //                     tooltip: i18n('RECORD SELECT TOOLTIP'),
        //                     isDisabled: true,
        //                     onChange: function(oldVal, newVal) {}
        //                 });
        //             }
        //             $('#comboColumns').html('');
        //             _self.comboColumns = $('#comboColumns').bindBaseSelect({
        //                 options: [],
        //                 isDisabled: true,
        //                 tooltip: i18n('FIELD SELECT TOOLTIP'),
        //                 onChange: function(oldVal, newVal) {}
        //             });
        //             _self.currentLevel = _self.getCurrentLevel();
        //             _self.renderTabData();
        //         }
        //     },
        //     tooltip: i18n('BLOCK SELECT TOOLTIP')
        // });
        // _self.comboBlocks.setKey(null);

        // _self.comboRecords = $('#comboRecords').bindBaseSelect({
        //     options: comboOptions,
        //     isDisabled: true,
        //     onChange: function(oldVal, newVal) {},
        //     //tooltip: i18n('RECORD SELECT TOOLTIP')
        // });

        // _self.comboColumns = $('#comboColumns').bindBaseSelect({
        //     options: comboOptions,
        //     isDisabled: true,
        //     onChange: function(oldVal, newVal) {},
        //     //tooltip: i18n('FIELD SELECT TOOLTIP')
        // });
        // _self.renderTabData();
        // _self.currentLevel = _self.getCurrentLevel();
    },
    getCurrentLevel: function() {
        var _self = this;
        var returnObject = {};
        if (_self.comboBlocks.getKey() && _self.comboRecords.getKey() && _self.comboColumns.getKey()) {
            returnObject.level = "FIELD";
        } else if (_self.comboBlocks.getKey() && _self.comboRecords.getKey()) {
            returnObject.level = "RECORD";
        } else if (_self.comboBlocks.getKey()) {
            returnObject.level = "BLOCK";
        } else {
            returnObject.level = "ALL";
        }
        returnObject.blockId = _self.comboBlocks.getKey();
        returnObject.recordId = _self.comboRecords.getKey();
        returnObject.columnId = _self.comboColumns.getKey();
        if (returnObject.level === "FIELD") {
            returnObject.idStructure = _self.coreServices.layoutObject.blocks[returnObject.blockId].records[returnObject.recordId].columns[returnObject.columnId].idStructure;
        }
        return returnObject;
    },
    initValues: function() {
        var _self = this;
        var _data = _self.getData();
        // _self.comboBlocks.setKey(_data.initLevel.blockId);
        // _self.comboRecords.setKey(_data.initLevel.recordId);
        // _self.comboColumns.setKey(_data.initLevel.columnId);
        // _self.comboBlocks.disable();
        // _self.comboRecords.disable();
        // _self.comboColumns.disable();
    },
    getFormatData: function() {
        var _self = this;
        return _self.formatObject;
    },
    renderTabData: function() {
        var _self = this;
        var currFormat = {
            string: null,
            number: null,
            date: null,
            hour: null
        };
        var isHourFormat = false;
        // var currentLevel = _self.getCurrentLevel();
        var currentLevel = {
            level: 'ALL'
        };
        $('#dfg-format-dialog .tab-content').html('');
        switch (currentLevel.level) {
            case 'ALL':
                if (_self.formatObject.format) {
                    currFormat = _self.formatObject.format;
                }
                break;
            // case 'BLOCK':
            //     if (_self.formatObject.blocks[currentLevel.blockId].format) {
            //         currFormat = _self.formatObject.blocks[currentLevel.blockId].format;
            //     }
            //     break;
            // case 'RECORD':
            //     if (_self.formatObject.blocks[currentLevel.blockId].records[currentLevel.recordId].format) {
            //         currFormat = _self.formatObject.blocks[currentLevel.blockId].records[currentLevel.recordId].format;
            //     }
            //     break;
            case 'FIELD':
                var type;
                if (currentLevel.idStructure && _self.coreServices.structure.hasOwnProperty(currentLevel.idStructure) && _self.coreServices.structure[currentLevel.idStructure].fields[currentLevel.columnId] !== undefined) {
                    type = _self.coreServices.structure[currentLevel.idStructure].fields[currentLevel.columnId].simpleType;
                } else {

                    if (_self.coreServices.currColumns[currentLevel.columnId].hasOwnProperty('manualParam')) {
                        type = _self.coreServices.currColumns[currentLevel.columnId].manualParam.type;

                    }
                    if (_self.coreServices.currColumns[currentLevel.columnId].hasOwnProperty('formula')) {
                        type = _self.coreServices.currColumns[currentLevel.columnId].formula.type;
                    }
                    if (_self.coreServices.currColumns[currentLevel.columnId].hasOwnProperty('fixedManualField')) {
                        type = "STRING";

                    }
                    if (_self.coreServices.currColumns[currentLevel.columnId].hasOwnProperty('fixedField')) {
                        type = _self.coreServices.currColumns[currentLevel.columnId].fixedField.type;

                    }
                    if (_self.coreServices.currColumns[currentLevel.columnId].hasOwnProperty('format')) {

                        if (_self.coreServices.currColumns[currentLevel.columnId].format && _self.coreServices.currColumns[currentLevel.columnId].format.date) {
                            type = "DATE";
                        }
                    }
                    if (_self.coreServices.currColumns[currentLevel.columnId].isInitialDateReference ||
                        _self.coreServices.currColumns[currentLevel.columnId].isFinalDateReference ||
                        _self.coreServices.currColumns[currentLevel.columnId].fieldId === 'DTE') {
                        type = 'DATE';
                    }
                    if (_self.coreServices.currColumns[currentLevel.columnId].fieldId === 'HRE') {
                        type = "HOUR";
                    }
                    if (_self.coreServices.currColumns[currentLevel.columnId].hasOwnProperty('recordId')) {
                        type = 'STRING';
                    }
                    if (_self.coreServices.currColumns[currentLevel.columnId].hasOwnProperty('filler')) {
                        type = 'STRING';
                    }
                    if (_self.coreServices.currColumns[currentLevel.columnId].hasOwnProperty('version')) {
                        type = 'STRING';
                    }
                    if (_self.coreServices.currColumns[currentLevel.columnId].isRecordsTotals || _self.coreServices.currColumns[currentLevel.columnId].isBlocksTotal || _self.coreServices.currColumns[currentLevel.columnId].isTotalsAll) {
                        type = 'NUMBER';
                    }

                    if (_self.coreServices.currColumns[currentLevel.columnId].hasOwnProperty('output')) {
                        var outputId = _self.coreServices.currColumns[currentLevel.columnId].output.metadata.elementId;
                        type = _self.coreServices.currColumns[currentLevel.columnId].output.fields[outputId].type;
                    }

                }
                if (currentLevel.columnId === "HRE") {
                    type = 'HOUR';
                }
                if (type === 'NVARCHAR')
                    type = 'STRING';
                if (type === 'DECIMAL')
                    type = 'NUMBER';
                if (type === 'TIMESTAMP')
                    type = 'DATE';
                if (_self.formatObject.blocks[currentLevel.blockId].records[currentLevel.recordId].columns[currentLevel.columnId].format) {
                    if (type == "STRING") {
                        currFormat.string = _self.formatObject.blocks[currentLevel.blockId].records[currentLevel.recordId].columns[currentLevel.columnId].format.string;
                    }
                    if (type == "NUMBER") {
                        currFormat.number = _self.formatObject.blocks[currentLevel.blockId].records[currentLevel.recordId].columns[currentLevel.columnId].format.number;
                    }
                    if (type == "DATE") {
                        currFormat.date = _self.formatObject.blocks[currentLevel.blockId].records[currentLevel.recordId].columns[currentLevel.columnId].format.date;
                    }
                    if (type == "HOUR") {
                        currFormat.hour = _self.formatObject.blocks[currentLevel.blockId].records[currentLevel.recordId].columns[currentLevel.columnId].format.hour;
                    }
                }
            default:
        }
        if (currentLevel.level == 'ALL' || currentLevel.level == 'BLOCK' || currentLevel.level == 'RECORD') {
            _self.tabController = $('#dfg-format-dialog .tab-content').bindBaseTabs({
                tab: [{
                    title: i18n('STRING'),
                    icon: "string",
                    iconColor: "white",
                    iconFont: "Sign-and-Symbols",
                    viewName: "app.views.dialogs.format.FormatString",
                    viewData: {
                        format: currFormat.string
                    },
                    tooltip: i18n('STRING TAB TOOLTIP')
                }, {
                    title: i18n('NUMBER'),
                    icon: "number",
                    iconColor: "white",
                    iconFont: "Sign-and-Symbols",
                    viewName: "app.views.dialogs.format.FormatNumber",
                    viewData: {
                        format: currFormat.number
                    },
                    tooltip: i18n('NUMBER TAB TOOLTIP')
                }, {
                    title: i18n('DATE'),
                    icon: "calendar",
                    iconColor: "white",
                    iconFont: "Time-and-Date",
                    viewName: "app.views.dialogs.format.FormatDate",
                    viewData: {
                        format: currFormat.date,
                    },
                    tooltip: i18n('DATE TAB TOOLTIP')
                }, {
                    title: i18n('HOUR'),
                    icon: "clock",
                    iconColor: "white",
                    iconFont: "Time-and-Date",
                    viewName: "app.views.dialogs.format.FormatDate",
                    viewData: {
                        format: currFormat.hour,
                        isHourFormat: true
                    },
                    tooltip: i18n('HOUR TAB TOOLTIP')
                }],
                type: "boxes",
                wrapperClass: "wrapperClass"
            })
        } else {
            var tabs = [];
            var type;
            if (currentLevel.idStructure && _self.coreServices.structure.hasOwnProperty(currentLevel.idStructure) && _self.coreServices.structure[currentLevel.idStructure].fields[currentLevel.columnId] !== undefined) {
                type = _self.coreServices.structure[currentLevel.idStructure].fields[currentLevel.columnId].simpleType;
            } else {


                if (_self.coreServices.currColumns[currentLevel.columnId].hasOwnProperty('manualParam')) {
                    type = _self.coreServices.currColumns[currentLevel.columnId].manualParam.type;
                }
                if (_self.coreServices.currColumns[currentLevel.columnId].hasOwnProperty('formula')) {
                    type = _self.coreServices.currColumns[currentLevel.columnId].formula.type;
                }
                if (_self.coreServices.currColumns[currentLevel.columnId].hasOwnProperty('recordId')) {
                    type = 'STRING';
                }
            }
            if (currentLevel.columnId === "HRE") {
                type = 'HOUR';
            }
            if (type === 'NVARCHAR')
                type = 'STRING';
            if (type === 'DECIMAL')
                type = 'NUMBER';
            if (type === 'TIMESTAMP')
                type = 'DATE';
            if (type == "STRING") {
                tabs.push({
                    title: i18n('STRING'),
                    icon: "string",
                    iconColor: "white",
                    iconFont: "Sign-and-Symbols",
                    viewName: "app.views.dialogs.format.FormatString",
                    viewData: {
                        services: _self.services,
                        format: currFormat.string
                    }
                });
            }
            if (type == "NUMBER") {
                tabs.push({
                    title: i18n('NUMBER'),
                    icon: "number",
                    iconColor: "white",
                    iconFont: "Sign-and-Symbols",
                    viewName: "app.views.dialogs.format.FormatNumber",
                    viewData: {
                        format: currFormat.number
                    }
                });
            }
            if (type == "DATE") {
                tabs.push({
                    title: i18n('DATE'),
                    icon: "calendar",
                    iconColor: "white",
                    iconFont: "Time-and-Date",
                    viewName: "app.views.dialogs.format.FormatDate",
                    viewData: {
                        format: currFormat.date
                    }
                });
            }
            if (type == "HOUR") {
                tabs.push({
                    title: i18n('HOUR'),
                    icon: "calendar",
                    iconColor: "white",
                    iconFont: "Time-and-Date",
                    viewName: "app.views.dialogs.format.FormatDate",
                    viewData: {
                        format: currFormat.hour,
                        isHourFormat: true
                    }
                });
            }
            _self.tabController = $('#dfg-format-dialog .tab-content').bindBaseTabs({
                tab: tabs,
                type: "boxes",
                wrapperClass: "wrapperClass"
            })

        }
        if (_self.coreServices.exhibition) {
            _self.processExhibition();
        }
    },
    updateFormatObject: function() {
        var _self = this;
        var currentLevel = _self.currentLevel;
        switch (currentLevel.level) {
            case 'ALL':
                _self.formatObject.format = {};
                _self.formatObject.format.string = _self.tabController.getInnerController(0).getOwnData();
                _self.formatObject.format.number = _self.tabController.getInnerController(1).getOwnData();
                _self.formatObject.format.date = _self.tabController.getInnerController(2).getOwnData();
                _self.formatObject.format.hour = _self.tabController.getInnerController(3).getOwnData();
                break;
            case 'BLOCK':
                _self.formatObject.blocks[currentLevel.blockId].format = {};
                _self.formatObject.blocks[currentLevel.blockId].format.string = _self.tabController.getInnerController(0).getOwnData();
                _self.formatObject.blocks[currentLevel.blockId].format.number = _self.tabController.getInnerController(1).getOwnData();
                _self.formatObject.blocks[currentLevel.blockId].format.date = _self.tabController.getInnerController(2).getOwnData();
                _self.formatObject.blocks[currentLevel.blockId].format.hour = _self.tabController.getInnerController(3).getOwnData();
                break;
            case 'RECORD':
                _self.formatObject.blocks[currentLevel.blockId].records[currentLevel.recordId].format = {};
                _self.formatObject.blocks[currentLevel.blockId].records[currentLevel.recordId].format.string = _self.tabController.getInnerController(0).getOwnData();
                _self.formatObject.blocks[currentLevel.blockId].records[currentLevel.recordId].format.number = _self.tabController.getInnerController(1).getOwnData();
                _self.formatObject.blocks[currentLevel.blockId].records[currentLevel.recordId].format.date = _self.tabController.getInnerController(2).getOwnData();
                _self.formatObject.blocks[currentLevel.blockId].records[currentLevel.recordId].format.hour = _self.tabController.getInnerController(3).getOwnData();
                break;
            case 'FIELD':
                _self.formatObject.blocks[currentLevel.blockId].records[currentLevel.recordId].columns[currentLevel.columnId].format = {
                    string: null,
                    number: null,
                    date: null,
                    hour: null
                };
                var type;
                if (currentLevel.idStructure && _self.coreServices.structure.hasOwnProperty(currentLevel.idStructure) && _self.coreServices.structure[currentLevel.idStructure].fields[currentLevel.columnId] !== undefined) {
                    type = _self.coreServices.structure[currentLevel.idStructure].fields[currentLevel.columnId].simpleType;
                } else {
                    if (_self.coreServices.currColumns[currentLevel.columnId].hasOwnProperty('manualParam')) {
                        type = _self.coreServices.currColumns[currentLevel.columnId].manualParam.type;
                    }
                    if (_self.coreServices.currColumns[currentLevel.columnId].hasOwnProperty('formula')) {
                        type = _self.coreServices.currColumns[currentLevel.columnId].formula.type;
                    }
                    if (_self.coreServices.currColumns[currentLevel.columnId].hasOwnProperty('recordId')) {
                        type = 'STRING';
                    }
                    if (_self.coreServices.currColumns[currentLevel.columnId].isInitialDateReference === true ||
                        _self.coreServices.currColumns[currentLevel.columnId].isFinalDateReference === true ||
                        _self.coreServices.currColumns[currentLevel.columnId].fieldId === 'DTE') {
                        type = 'DATE';
                    }

                    if (_self.coreServices.currColumns[currentLevel.columnId].fieldId === 'HRE') {
                        type = "HOUR"
                    }
                    if (_self.coreServices.currColumns[currentLevel.columnId].hasOwnProperty('format')) {
                        if (_self.coreServices.currColumns[currentLevel.columnId].format && _self.coreServices.currColumns[currentLevel.columnId].format.date) {
                            type = "DATE";
                        }
                    }
                    if (_self.coreServices.currColumns[currentLevel.columnId].hasOwnProperty('filler')) {
                        type = 'STRING';
                    }
                    if (_self.coreServices.currColumns[currentLevel.columnId].hasOwnProperty('version')) {
                        type = 'STRING';
                    }
                    if (_self.coreServices.currColumns[currentLevel.columnId].hasOwnProperty('output')) {
                        var outputId = _self.coreServices.currColumns[currentLevel.columnId].output.metadata.elementId;
                        type = _self.coreServices.currColumns[currentLevel.columnId].output.fields[outputId].type;
                    }
                }
                if (type === 'NVARCHAR')
                    type = 'STRING';
                if (type === 'DECIMAL')
                    type = 'NUMBER';
                if (type === 'TIMESTAMP')
                    type = 'DATE';


                if (type == "STRING") {
                    _self.formatObject.blocks[currentLevel.blockId].records[currentLevel.recordId].columns[currentLevel.columnId].format.string = _self.tabController.getInnerController(0).getOwnData();
                }
                if (type == "NUMBER") {
                    _self.formatObject.blocks[currentLevel.blockId].records[currentLevel.recordId].columns[currentLevel.columnId].format.number = _self.tabController.getInnerController(0).getOwnData();
                }
                if (type == "DATE") {
                    _self.formatObject.blocks[currentLevel.blockId].records[currentLevel.recordId].columns[currentLevel.columnId].format.date = _self.tabController.getInnerController(0).getOwnData();
                }
                if (type == "HOUR") {
                    _self.formatObject.blocks[currentLevel.blockId].records[currentLevel.recordId].columns[currentLevel.columnId].format.hour = _self.tabController.getInnerController(0).getOwnData();
                }
                if (!(_self.formatObject.blocks[currentLevel.blockId].records[currentLevel.recordId].columns[currentLevel.columnId].format.string ||
                        _self.formatObject.blocks[currentLevel.blockId].records[currentLevel.recordId].columns[currentLevel.columnId].format.number ||
                        _self.formatObject.blocks[currentLevel.blockId].records[currentLevel.recordId].columns[currentLevel.columnId].format.date ||
                        _self.formatObject.blocks[currentLevel.blockId].records[currentLevel.recordId].columns[currentLevel.columnId].format.hour)) {
                    delete _self.formatObject.blocks[currentLevel.blockId].records[currentLevel.recordId].columns[currentLevel.columnId].format;
                }

            default:
        }
    },
    initTempFormat: function() {
        var _self = this;
        _self.formatObject = {};
        _self.formatObject.blocks = {}
        _self.formatObject.format = _self.coreServices.layoutObject.format;
        for (var i in _self.layoutObject.blocks) {
            _self.formatObject.blocks[i] = {}
            _self.formatObject.blocks[i].format = _self.layoutObject.blocks[i].format
            _self.formatObject.blocks[i].records = {};
            for (var j in _self.layoutObject.blocks[i].records) {
                _self.formatObject.blocks[i].records[j] = {};
                _self.formatObject.blocks[i].records[j].format = _self.layoutObject.blocks[i].records[j].format;
                _self.formatObject.blocks[i].records[j].columns = {};
                for (var k in _self.layoutObject.blocks[i].records[j].columns) {
                    _self.formatObject.blocks[i].records[j].columns[k] = {};
                    _self.formatObject.blocks[i].records[j].columns[k].format = _self.layoutObject.blocks[i].records[j].columns[k].format;
                }
            }
        }
    },
    processExhibition: function() {
        var mainCrystal = $('<div>').addClass('dfg-crystal').addClass('dfg-format');
        $('.newFile .dialog-content #baseTabs-wrapper').append(mainCrystal);
    }

});
