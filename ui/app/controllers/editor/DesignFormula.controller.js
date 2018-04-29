/*global i18n*/
sap.ui.controller("app.controllers.editor.DesignFormula", {
    onInit: function() {},
    onAfterRendering: function(renderedTarget) {
        var _self = this;
        _self.view = $(renderedTarget);
        _self.view.formulaBrowser = _self.view.find(".formula-browser");
        _self.layoutObject = _self.coreServices.layoutObject.json;
        _self.currentLevel = {};
        _self.initTempFormula();
        _self.structureXFields = {};
        for (var i in _self.coreServices.structure) {
            _self.structureXFields[i] = [];
            for (var j in _self.coreServices.structure[i].fields) {
                var field = JSON.parse(JSON.stringify(_self.coreServices.structure[i].fields[j]));
                field.label += " - " + _self.coreServices.structure[i].title;
                _self.structureXFields[i].push({
                    id: "ID_" + field.ID + "_" + i,
                    name: field.label,
                    type: field.type,
                    dataType: field.simpleType === "NUMBER" ? "number" : field.simpleType === "STRING" ? "text" : "date",
                    value: "\"" + field.label + "-" + _self.coreServices.structure[i].title + "\""
                });
            }
        }
        _self.recordsFields = {};
        var stop = false;
        for (var b = 0; b < _self.layoutObject.positions.length; b++) {
            var block = _self.layoutObject.blocks[_self.layoutObject.positions[b]];
            if (stop) {
                break;
            }

            for (var r = 0; r < block.positions.length; r++) {
                var record = block.records[block.positions[r]];
                _self.recordsFields[_self.layoutObject.positions[b] + "_" + block.positions[r]] = [];
                if (Number(block.positions[r]) === (Number(_self._data.initLevel.recordId) + 1) && _self.layoutObject.positions[b] === _self._data.initLevel.blockId) {
                    stop = true;
                    break;
                }
                for (var c = 0; c < record.positions.length; c++) {
                    if (block.positions[r] === _self._data.initLevel.recordId && _self.layoutObject.positions[b] === _self._data.initLevel.blockId) {
                        if (_self._data.initLevel.columnId && _self._data.initLevel.columnId === record.positions[c]) {
                            continue;
                        }
                    }
                    var column = record.columns[record.positions[c]];
                    var columnName = $.globalFunctions.getColumnName(column, true);
                    var columnType = $.globalFunctions.getColumnType(column, _self.coreServices.structure);
                    _self.recordsFields[_self.layoutObject.positions[b] + "_" + block.positions[r]].push({
                        id: "`ID_" + _self.layoutObject.positions[b] + "-" + block.positions[r] + "-" + record.positions[c] + "`",
                        name: columnName + " (" + i18n("BLOCK") + " " + block.name + "-" + i18n("RECORD") + " " + record.name + ")",
                        type: columnType,
                        dataType: $.globalFunctions.getColumnType(column, _self.coreServices.structure, true).toLowerCase(),
                        value: "\`" + columnName + " (" + i18n("BLOCK") + " " + block.name + "-" + i18n("RECORD") + " " + record.name + ") \`",
                        isFromOtherRegister: true
                    });
                }
            }
        }
        console.log(_self.recordsFields);
        _self.renderBrowser();
        this.renderSelects();

    },
    recoverFormula: function() {
        var _self = this;
        if (this.currentLevel.columnId) {
            _self.currentFormula = _self.formulaObject.blocks[_self.currentLevel.blockId].records[_self.currentLevel.recordId].columns[_self.currentLevel
                .columnId].formula;
        }
    },
    renderSelects: function() {
        var _self = this;
        var comboOptions = [];
        for (var i in _self.layoutObject.blocks) {
            var currVal = {};
            currVal.key = i;
            if (!_self.layoutObject.blocks[i].name) {
                currVal.name = i;
            } else {
                currVal.name = _self.layoutObject.blocks[i].name;
            }
            comboOptions.push(currVal);
        }

        _self.comboBlocks = $('#comboBlocks').bindBaseSelect({
            options: comboOptions,
            disableSort: true,
            onChange: function(oldVal, newVal) {
                _self.updateFormulaObject();
                _self.renderRecordSelect(newVal.key);
                _self.currentLevel = _self.getCurrentLevel();
                _self.formulaActive(false);
            },
            isDisabled: _self.getData().initLevel && _self.getData().initLevel.isNew,
            tooltip: i18n('BLOCK SELECT TOOLTIP')
        });
        var onChangeStructure = function(newVal) {
            if (!_self.hasStructureFields) {
                _self.formulaObject.idStructure = newVal.map(function(e) {
                    return e.key;
                });
                _self.updateFormulaObject();
                _self.recoverFormula();
                _self.renderBrowser();
            } else {
                var notValid = false;
                var keys = newVal.map(function(nv) {
                    return nv.key;
                });
                if (Array.isArray(_self.formulaObject)) {
                    for (var i = 0; i < _self.formulaObject.idStructure.length; i++) {
                        if (keys.indexOf(_self.formulaObject.idStructure[i]) === -1) {
                            notValid = true;
                            break;
                        }
                    }
                }
                if (notValid) {
                    _self.comboStructure.setKey(_self.formulaObject.idStructure);
                    $.baseToast({
                        isError: true,
                        text: i18n("DFG102009")
                    });
                }
            }
        };
        var structuresOptions = _self.coreServices.layoutObject.structure.map(function(item, index) {
            return {
                key: item.id,
                name: item.title
            };
        });

        if (_self.getData().initLevel && _self.getData().initLevel.blockId) {

            _self.comboStructure = $('#comboStructure').bindBaseMultipleSelect3({
                options: structuresOptions,
                placeholder: i18n("FILE STRUCTURE"),
                tooltip: i18n("FILE STRUCTURE TOOLTIP"),
                onChange: onChangeStructure
            });
            _self.currentLevel.blockId = _self.getData().initLevel.blockId;
            _self.comboBlocks.setKey(_self.getData().initLevel.blockId)
            _self.renderRecordSelect(_self.getData().initLevel.blockId);
            if (_self.getData().initLevel.recordId) {
                _self.currentLevel.recordId = _self.getData().initLevel.recordId;
                _self.comboRecords.setKey(_self.getData().initLevel.recordId);
                _self.renderColumnSelect(_self.getData().initLevel.blockId, _self.getData().initLevel.recordId);
                if (_self.getData().initLevel.columnId) {
                    _self.currentLevel.columnId = _self.getData().initLevel.columnId;
                    var formulaRecord = _self.formulaObject.blocks[_self.currentLevel.blockId].records[_self.currentLevel.recordId];
                    var formulaColumn = formulaRecord.columns[_self.currentLevel.columnId];
                    if (!_self.getData().initLevel || !_self.getData().initLevel.isNew) {
                        _self.comboColumns.setKey(_self.getData().initLevel.columnId);
                    } else {

                        _self.columnInput.setText(formulaColumn.formula.label ? formulaColumn.formula.label : i18n('FORMULA') + ' ' + _self.currentLevel.columnId);
                    }
                    if (formulaColumn.formula.idStructure) {
                        _self.comboStructure.setKey(!Array.isArray(formulaColumn.formula.idStructure) ? [formulaColumn.formula.idStructure] : formulaColumn.formula
                            .idStructure);
                    } else {
                        _self.comboStructure.setKey([structuresOptions[0].key]);
                    }
                    _self.comboStructure.enable();
                }
            }
        } else {
            _self.comboRecords = $('#comboRecords').bindBaseSelect({
                options: comboOptions,
                disableSort: true,
                isDisabled: true,
                onChange: function(oldVal, newVal) {},
                tooltip: i18n('RECORD SELECT TOOLTIP')
            });

            if (_self.getData().initLevel && _self.getData().initLevel.isNew) {
                _self.columnInput = $('#comboColumns').bindBaseInput({
                    onChange: function(oldVal, newVal) {

                    },
                    tooltip: i18n('FIELD SELECT TOOLTIP')
                });
            } else {
                _self.comboColumns = $('#comboColumns').bindBaseSelect({
                    options: comboOptions,
                    disableSort: true,
                    isDisabled: true,
                    onChange: function(oldVal, newVal) {},
                    tooltip: i18n('FIELD SELECT TOOLTIP')
                });
            }

            _self.comboStructure = $('#comboStructure').bindBaseMultipleSelect3({
                options: structuresOptions,
                isDisabled: true,
                onChange: onChangeStructure,
                tooltip: i18n('FIELD SELECT TOOLTIP')
            });
        }

    },
    renderRecordSelect: function(blockId) {
        var _self = this;
        var comboOptions = [];

        $('#comboRecords').html('');
        for (var i in _self.layoutObject.blocks[blockId].records) {
            var currVal = {};
            currVal.key = i;
            if (!_self.layoutObject.blocks[blockId].records[i].name) {
                currVal.name = i;
            } else {
                currVal.name = _self.layoutObject.blocks[blockId].records[i].name;
            }
            comboOptions.push(currVal);
        }
        _self.comboRecords = $('#comboRecords').bindBaseSelect({
            options: comboOptions,
            disableSort: true,
            onChange: function(oldVal, newVal) {
                _self.updateFormulaObject();
                _self.renderColumnSelect(blockId, newVal.key);
                _self.currentLevel = _self.getCurrentLevel();
                _self.formulaActive(false);
            },
            isDisabled: _self.getData().initLevel && _self.getData().initLevel.isNew,
            tooltip: i18n('RECORD SELECT TOOLTIP')
        });
        if (!_self.getData().initLevel || !_self.getData().initLevel.isNew) {
            $('#comboColumns').html('');
            _self.comboColumns = $('#comboColumns').bindBaseSelect({
                options: [],
                isDisabled: true,
                onChange: function(oldVal, newVal) {},
                tooltip: i18n('FIELD SELECT TOOLTIP')
            });
        }
    },
    renderColumnSelect: function(blockId, recordId) {
        var _self = this;
        //_self.updateFormulaObject();
        if (_self.getData().initLevel && _self.getData().initLevel.isNew) {
            $('#comboColumns').html('');
            _self.columnInput = $('#comboColumns').bindBaseInput({
                onChange: function(oldVal, newVal) {},
                tooltip: i18n('FIELD SELECT TOOLTIP'),
                required: true
            });
            return;
        }
        var comboOptions = [];
        $('#comboColumns').html('');
        var currColumns = _self.layoutObject.blocks[blockId].records[recordId].columns;

        for (var i in currColumns) {
            if (currColumns[i].formula) {
                var currVal = {};
                currVal.key = i;
                currVal.name = currColumns[i].formula.label ? currColumns[i].formula.label : i18n('FORMULA') + ' ' + i;
                comboOptions.push(currVal);
            }
        }
        _self.comboColumns = $('#comboColumns').bindBaseSelect({
            options: comboOptions,
            disableSort: true,
            onChange: function(oldVal, newVal) {
                _self.currentLevel = _self.getCurrentLevel();
                _self.recoverFormula();
                var idStructure = _self.formulaObject.blocks[_self.currentLevel.blockId].records[_self.currentLevel.recordId].columns[newVal.key].formula
                    .idStructure;
                if (idStructure && !Array.isArray(idStructure)) {
                    idStructure = [idStructure];
                }
                if (idStructure) {
                    _self.comboStructure.setKey(idStructure);
                }
                _self.updateFormulaObject();

                //              _self.formulaActive(true);

                _self.comboStructure.enable();
            },
            tooltip: i18n('FIELD SELECT TOOLTIP')
        });
        _self.currentLevel = _self.getCurrentLevel();
    },

    addBrowserValue: function(val) {
        if (this.lastType == undefined) {
            if (val.type != "c") {
                $.baseAlert("Primeiro tem que adicionar uma coluna!");
            } else {
                this.lastType = "c";
                this.addValue(val);
            }
        } else {
            if (this.lastType == val.type) {
                if (this.lastType == "c" && this.lastType == val.type)
                    $.baseAlert("Nao pode adicionar uma columa depois de outra coluna!");
                else if (this.lastType == "m" && this.lastType == val.type)
                    $.baseAlert("Nao pode adicionar um operador depois de outro operador!");
            } else {
                this.lastType = val.type;
                this.addValue(val);
            }
        }
    },

    addValue: function(val) {
        var allText = this.textarea.val();
        if (val.type == "c") {
            allText = allText + (allText == '' ? '"' : ' "') + this.idToValMap[val.value] + '"';
        } else if (val.type == "m") {
            allText = allText + (allText == '' ? '' : ' ') + val.value;
        } else if (val.type == "d") {
            allText = allText + (allText == '' ? '{' : ' {') + val.value + '}';
        } else if (val.type === 'bcb') {
            allText = allText + (allText == '' ? '|' : ' |') + val.value + '|';
        } else if (val.type === 'bfb') {
            allText = allText + (allText == '' ? '$' : ' $') + val.value + '$';
        }
        this.textarea.val(allText);

        this.validate();
    },
    renderBrowser: function(renderedTarget) {
        var _self = this;
        var idStructures = _self.comboStructure ? _self.comboStructure.getKeys() : [];
        var columns = [];
        for (var i = 0; i < idStructures.length; i++) {
            columns = columns.concat(_self.structureXFields[idStructures[i]]);
        }
        var recordColumns = [];
        for (var recordId in _self.recordsFields) {
            recordColumns = recordColumns.concat(_self.recordsFields[recordId]);
        }
        _self.view.formulaBrowser.empty();
        var sections = [{
            id: 1,
            name: i18n("FIELDS"),
            options: columns
        }];
        if (recordColumns.length) {
            sections.push({
                id: 2,
                name: i18n("RECORD FIELDS"),
                options: recordColumns
            });
            console.log(sections);
        }
        _self.formulaBuilder = _self.view.formulaBrowser.bindBaseFormulaBuilder({
            hasBRBOutputs: true,
            hasBCBOutputs: true,
            hasBFBOutputs: true,
            hasFunctions: true,
            hasStringFunctions: true,
            hasLogicalOperators: true,
            hasComparisonOperators: true,
            formulaCalculation: {
                formula: _self.currentFormula
            },
            sections: sections
        });

    },
    updateFormulaObject: function() {
        var _self = this;
        _self.formulaValue = _self.formulaBuilder.formulaValue;
        console.log( _self.formulaValue);
        
        if (_self.currentLevel.columnId && _self.formulaValue) {
            var formulaRecord = _self.formulaObject.blocks[_self.currentLevel.blockId].records[_self.currentLevel.recordId];
            if (!formulaRecord.idStructure) {
                formulaRecord.idStructure = [];
            }
            if (!Array.isArray(_self.formulaObject.idStructure) && formulaRecord.idStructure.indexOf(_self.formulaObject.idStructure) === -1) {
                formulaRecord.idStructure.push(_self.formulaObject.idStructure);
            } else {
                for (var s = 0; s < _self.formulaObject.idStructure.length; s++) {
                    if (formulaRecord.idStructure.indexOf(_self.formulaObject.idStructure[s]) === -1) {
                        formulaRecord.idStructure.push(_self.formulaObject.idStructure[s]);
                    }
                }
            }
            var formulaColumn = formulaRecord.columns[_self.currentLevel.columnId];
            formulaColumn.formula.idStructure = Array.isArray(_self.formulaObject.idStructure) && _self.formulaObject.idStructure.length === 1 ?
                _self.formulaObject.idStructure[0] : _self.formulaObject.idStructure;
            formulaColumn.formula.label = _self.columnInput ? _self.columnInput.getText() : formulaColumn.formula.label;
            formulaColumn.formula.raw = _self.formulaValue.value;
            formulaColumn.formula.text = _self.formulaValue.formula;
            formulaColumn.formula.originalFormula = _self.formulaValue.formula;
            formulaColumn.formula.hana = _self.formulaValue.hanaValue;
            formulaColumn.formula.outputs = _self.formulaValue.fields;
            formulaColumn.formula.idManualParams = _self.formulaValue.idManualParams;
            if (_self.formulaValue.isMathFormula) {
                formulaColumn.formula.type = "DECIMAL";
            } else {
                formulaColumn.formula.type = "NVARCHAR";
            }
        } else if (_self.currentLevel.columnId) {
            var formulaRecord = _self.formulaObject.blocks[_self.currentLevel.blockId].records[_self.currentLevel.recordId];
            var formulaColumn = formulaRecord.columns[_self.currentLevel.columnId];
            formulaColumn.formula.idStructure = Array.isArray(_self.formulaObject.idStructure) && _self.formulaObject.idStructure.length === 1 ?
                _self.formulaObject.idStructure[0] : _self.formulaObject.idStructure;
            formulaColumn.formula.label = _self.columnInput ? _self.columnInput.getText() : formulaColumn.formula.label;
        }
    },
    getCurrentLevel: function() {
        var _self = this;
        var returnObject = {};
        if (_self.comboBlocks.getKey() && _self.comboRecords.getKey() && _self.getColumnId) {
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
        returnObject.columnId = _self.getColumnId();
        return returnObject;
    },
    getColumnId: function() {
        var _self = this;
        if (_self.getData().initLevel && _self.getData().initLevel.isNew) {
            return _self.currentLevel.columnId;
        }
        return _self.comboColumns.getKey();
    },
    getColumns: function() {
        var _self = this;
        var returnColumns = [];
        if (_self.currentLevel.blockId && _self.currentLevel.recordId) {
            var idStructure = _self.layoutObject.blocks[_self.currentLevel.blockId].records[_self.currentLevel.recordId].idStructure[0];
            if (!idStructure) {
                idStructure = _self.coreServices.layoutObject.structure[0].id;
            }
            _self.fields = _self.coreServices.structure[idStructure].fields;
            var currColumns = _self.layoutObject.blocks[_self.currentLevel.blockId].records[_self.currentLevel.recordId].columns;
            for (var i in currColumns) {
                if (currColumns[i].fieldId) {
                    returnColumns.push(_self.fields[currColumns[i].fieldId]);
                }
            }
        }
        return returnColumns;
    },
    initTempFormula: function() {
        var _self = this;
        _self.formulaObject = {};
        _self.formulaObject.blocks = {};
        for (var i in _self.layoutObject.blocks) {
            _self.formulaObject.blocks[i] = {}
            _self.formulaObject.blocks[i].records = {};
            for (var j in _self.layoutObject.blocks[i].records) {
                _self.formulaObject.blocks[i].records[j] = {};
                _self.formulaObject.blocks[i].records[j].columns = {};
                for (var k in _self.layoutObject.blocks[i].records[j].columns) {
                    if (_self.layoutObject.blocks[i].records[j].columns[k].fieldId == null && _self.layoutObject.blocks[i].records[j].columns[k].formula) {
                        _self.formulaObject.blocks[i].records[j].columns[k] = {
                            formula: {}
                        };
                        _self.formulaObject.blocks[i].records[j].idStructure = _self.layoutObject.blocks[i].records[j].idStructure;
                        _self.formulaObject.blocks[i].records[j].columns[k].formula = _self.layoutObject.blocks[i].records[j].columns[k].formula;
                    }
                }
            }
        }
        if (_self._data.initLevel) {
            if (_self._data.initLevel.columnId && _self._data.initLevel.isNew) {
                _self.formulaObject.blocks[_self._data.initLevel.blockId].records[_self._data.initLevel.recordId].columns[_self._data.initLevel.columnId] = {
                    formula: {}
                };
            }
        }
    },
    formulaActive: function(active) {
        var _self = this;
        if (active) {
            _self.formulaBuilder.textarea.removeAttr('disabled');
            _self.formulaBuilder.textarea.removeClass('disabled');
        } else {
            _self.formulaBuilder.textarea.attr('disabled', 'disabled');
            _self.formulaBuilder.textarea.addClass('disabled');
            _self.formulaBuilder.textarea.val('');
        }
    },
    validate: function() {
        return this.formulaBuilder.getFormula().isValid;
    },
    getColumnData: function() {
        var _self = this;
        _self.updateFormulaObject();
        var column = {
            "fieldId": null,
            "formula": _self.formulaObject.blocks[_self._data.initLevel.blockId].records[_self._data.initLevel.recordId].columns[_self._data.initLevel
                .columnId].formula,
            "idStructure": _self.formulaObject.blocks[_self._data.initLevel.blockId].records[_self._data.initLevel.recordId].columns[_self._data.initLevel
                .columnId].formula.idStructure
        };
        return column;
    },
    getFormulaData: function() {
        var _self = this;
        return _self.formulaObject;
    },
    processExhibition: function() {
        var mainCrystal = $('<div>').addClass('dfg-crystal').addClass('dfg-formula');
        $('.formula-dialog .dialog-content').append(mainCrystal);
    }
});