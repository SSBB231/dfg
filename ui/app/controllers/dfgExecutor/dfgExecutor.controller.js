/*globals i18n _ Data*/
sap.ui.controller("app.controllers.dfgExecutor.dfgExecutor", {
    filterFunctions: {
        getOperator: function(operator) {
            if (operator === "&lt;=") {
                return "<=";
            }
            if (operator === "&lt;") {
                return "<";
            }
            if (operator === "&gt;=") {
                return ">=";
            }
            if (operator === "IN") {
                operator = "";
            } else if (operator === "NOT IN") {
                operator = " NOT";
            } else if (/[a-zA-Z]/.test(operator) && (operator !== "<>" && operator !== '&lt;&gt;')) {
                operator = 'LIKE_REGEXPR';
            } else if (operator === "<>" || operator === '&lt;&gt;') {
                operator = "!=";
            }
            return operator;
        },
        getValue: function(value, operator, fieldName) {
            var _self = this;
            if (operator === "IN" || operator === "NOT IN") {
                var newValue = "(";
                for (var i = 0; i < value.values.length; i++) {
                    if (i > 0) {
                        newValue += " AND ";
                    }
                    newValue += fieldName + " " + _self.getOperator(value.values[i].oper) + " " + _self.getValue(value.values[i].name, value.values[i].oper);
                }
                newValue = newValue + ")";
                return newValue;
            }
            if (operator === "CONTAINS") {
                value = ".*" + value + ".*";
            } else if (operator === "NOT CONTAINS") {
                value = "^((?!" + value + ").)*$";
            } else if (operator === "BW") {
                value = "^" + value + ".*";
            } else if (operator === "NOT BW") {
                value = "^(?!^" + value + ").*$";
            } else if (operator === "FW") {
                value = value + "$";
            } else if (operator === "NOT FW") {
                value = "^(?!.*" + value + "$).*$";
            }
            return "'" + value + "'";
        },
        processCondition: function(conditions, fieldName, fieldType) {
            var conditionResult = "";
            for (var j = 0; j < conditions.length; j++) {
                if (conditions[j].operator) {
                    var value = this.getValue(conditions[j].value, conditions[j].operator, fieldName);
                    var operator = this.getOperator(conditions[j].operator);
                    if (conditions[j].logicOperator) {
                        conditionResult += " " + conditions[j].logicOperator + " ";
                    }
                    if (conditions[j].operator === "IN" || conditions[j].operator === "NOT IN") {
                        conditionResult += " " + operator + " " + value;
                    } else {
                        conditionResult += fieldName + " " + operator + " " + value;
                        if (value === "" || value === "''") {
                            if (operator === "=") {
                                conditionResult += " OR " + fieldName + " IS NULL";
                            } else if (operator === "!=") {
                                conditionResult += " AND " + fieldName + " IS NOT NULL";
                            }
                            if (fieldType === "TIMESTAMP") {
                                if (operator === "=") {
                                    conditionResult += " OR " + fieldName + " = '00000000'";
                                } else if (operator === "!=") {
                                    conditionResult += " AND " + fieldName + "!= '00000000'";
                                }
                            }
                        }
                    }
                }
            }
            return conditionResult;
        },
        getFieldName: function(fieldId, structureId) {
            var structureField = this.structureData[structureId][fieldId];
            var fieldName = structureField.hanaName;
            return fieldName;
        },
        getFieldType: function(fieldId, structureId) {
            var structureField = this.structureData[structureId][fieldId];
            var fieldType = structureField.type;
            return fieldType;
        },
        processGroupFilter: function(group, structureId) {
            var groupQ = [];
            if (group) {
                for (var i = 0; i < group.length; i++) {
                    var structureField;
                    if (this.structureData[structureId]) {
                        structureField = this.structureData[structureId][group[i].fieldId];
                        var fieldName = structureField.hanaName;
                        if (!this.data.queryInfo.fields[group[i].fieldId]) {
                            this.data.queryInfo.fields[group[i].fieldId] = structureField;
                        }
                        var conditions = group[i].conditions;
                        var conditionResult = this.processCondition(conditions, fieldName);
                        if (conditionResult) {
                            groupQ.push(conditionResult);
                        }
                    }
                }
            }
            return groupQ.join(" AND ");
        },
        processStructureFilters: function(structureGroup, idStructure) {
            var filterR = [];
            for (var k = 0; k < structureGroup.length; k++) {
                var group = structureGroup[k].group;
                var groupResult = this.processGroupFilter(group, idStructure);
                if (groupResult) {
                    filterR.push(" ( " + groupResult + ") ");
                }
            }
            return filterR.join(" AND ");
        },
        mergeFilters: function(globalFilters, mainFilters) {
            if (!globalFilters) {
                return mainFilters;
            }
            if (!mainFilters) {
                return globalFilters;
            }
            var newFilters = JSON.parse(JSON.stringify(mainFilters));

            for (var i in globalFilters) {
                if (globalFilters.hasOwnProperty(i)) {
                    if (!newFilters[i]) {
                        newFilters[i] = globalFilters[i];
                    } else {
                        for (var j = 0; j < globalFilters[i].length; j++) {
                            var filter = JSON.parse(JSON.stringify(globalFilters[i][j]));
                            for (var k = 0; k < globalFilters[i][j].group.length; k++) {
                                var found = false;
                                for (var m = 0; m < mainFilters[i].length; m++) {
                                    for (var l = 0; l < mainFilters[i][m].group.length; l++) {
                                        if (mainFilters[i][m].group[l].fieldId === globalFilters[i][j].group[k].fieldId) {
                                            found = true;
                                            break;
                                        }
                                    }
                                    if (found) {
                                        break;
                                    }
                                }
                                if (found) {
                                    filter.group[k] = undefined;
                                }
                            }
                            filter.group = filter.group.filter(function(g) {
                                if (g) {
                                    return true;
                                }
                                return false;
                            });
                            if (filter.group.length > 0) {
                                newFilters[i].push(filter);
                            }
                        }
                    }
                }
            }
            return newFilters;
        },
        getColumnFilters: function(columns, idStructure, layoutFilters) {
            var _self = this;
            var column;
            for (var c in columns) {
                column = columns[c];
                if (column.fieldId !== null && !isNaN(parseInt(column.fieldId, 10)) && column.filters) {
                    if (Number(column.idStructure) === Number(idStructure)) {
                        var filters = "(" + _self.processStructureFilters(column.filters, idStructure) + ")";
                        if (layoutFilters.indexOf(filters) === -1) {
                            layoutFilters.push(filters);
                        }
                    }
                }
            }
        },
        getGroupFilters: function(groups, layoutFilters, actualFilters, idStructure, fields, structureData, data) {
            var _self = this;
            for (var g = 0; g < groups.length; g++) {
                var mergedFilters = _self.mergeFilters(actualFilters, groups[g].filters);
                if (mergedFilters && mergedFilters[idStructure]) {
                    var filters = "(" + _self.processStructureFilters(mergedFilters[idStructure], idStructure) + ")";
                    if (layoutFilters.indexOf(filters) === -1) {
                        layoutFilters.push(filters);
                    }
                }
                // for (var cf in groups[g].columnFilters) {
                //  var tempFilter = {};
                //  tempFilter[idStructure] = groups[g].columnFilters[cf];
                //  var mergedFilters2 = _self.mergeFilters(actualFilters, tempFilter);
                //  if (mergedFilters2 && mergedFilters2[idStructure]) {
                //      var filters = "(" + _self.processStructureFilters(mergedFilters2[idStructure], idStructure) + ")";
                //      if (layoutFilters.indexOf(filters) === -1)
                //          layoutFilters.push(filters);
                //  }
                // }
                if (groups[g].groupByDate) {
                    if (!fields[groups[g].groupByDate.fieldId]) {
                        fields[groups[g].groupByDate.fieldId] =
                            structureData[idStructure][groups[g].groupByDate.fieldId];
                    }
                }
            }
        }
    },
    setRequiredData: function(_data) {
        var _self = this;
        _self.generalParamsDataObject = _data.generalParamsDataObject;
        _self.manualParams = _data.manualParams;
        _self.digitalFile = _data.digitalFile;
        _self.configData = _data.configData;
        _self.idStructure = _data.idStructure;
        _self.layoutJSON = _data.layoutJSON;
        _self.layoutObject = _data.layoutObject;
        _self.mapConfigs = _data.mapConfigs;
        _self.idLayoutVersion = _data.idLayoutVersion;
        _self.createDigitalFileTabs = _data.createDigitalFileTabs;
        _self.loader = _data.loader;
        _self.isSCANCExecution = _data.isSCANCExecution;
        _self.logErrors = [];
    },
    getExecutionResult: function(assingRawFile) {
        var _self = this;
        this.recordCounter = 0;
        this.recordList = [];
        var objectParams = {
            id: window.parameters.id,
            idSettingVersion: window.parameters.idSettingVersion
        };
        var generalParamsDataObject = _self.configData || _self.generalParamsDataObject;
        var isValid = true;
        if (_self.isSCANCExecution) {
            isValid = generalParamsDataObject.company !== undefined;
        } else {
            isValid = generalParamsDataObject.company !== undefined && generalParamsDataObject.uf !== undefined &&
                generalParamsDataObject.branch !== undefined && generalParamsDataObject.tax !== undefined;
        }
        if (isValid) {
            objectParams.idCompany = generalParamsDataObject.company;
            objectParams.uf = generalParamsDataObject.uf;
            objectParams.idBranch = generalParamsDataObject.branch;
            objectParams.idTax = generalParamsDataObject.tax;
            objectParams.year = generalParamsDataObject.subPeriod.year;
            objectParams.month = generalParamsDataObject.subPeriod.month;
            objectParams.subPeriod = generalParamsDataObject.subPeriod.subperiod;
            objectParams.idMap = _self.configData.idMap;
            objectParams.initSubPeriod = _self.configData.initSubPeriod;
            objectParams.endSubPeriod = _self.configData.endSubPeriod;
            if (_self.manualParams) {
                objectParams.manualParams = _self.manualParams;
            }
            if (_self.configData.executionDate) {
                objectParams.executionDate = _self.configData.executionDate;
            }
            _self.loader.open();
            var callback = function() {
                var layoutJSON = JSON.parse(JSON.stringify(_self.layoutJSON));
                var relationKeys = {};
                if (layoutJSON.relations && layoutJSON.relations.length) {
                    for (var i = 0; i < layoutJSON.relations.length; i++) {
                        if (layoutJSON.relations[i].hasHierarchy) {
                            if (!relationKeys[layoutJSON.relations[i].father.record]) {
                                relationKeys[layoutJSON.relations[i].father.record] = {
                                    keys: {},
                                    fields: []
                                };
                            }
                            for (var k = 0; k < layoutJSON.relations[i].son.record.length; k++) {
                                if (!relationKeys[layoutJSON.relations[i].son.record[k]]) {
                                    relationKeys[layoutJSON.relations[i].son.record[k]] = {
                                        keys: {},
                                        fields: []
                                    };
                                }
                            }
                            for (var j = 0; j < layoutJSON.relations[i].keys.length; j++) {
                                var keyIdentifier = i + "_" + j;
                                relationKeys[layoutJSON.relations[i].father.record].keys[keyIdentifier] = layoutJSON.relations[i].keys[j];
                                relationKeys[layoutJSON.relations[i].father.record].keys[keyIdentifier].hideParent = layoutJSON.relations[i].hideParent;
                                if (relationKeys[layoutJSON.relations[i].father.record].fields.indexOf(layoutJSON.relations[i].keys[j].fatherKey.key.split(";")[2]) === -1) {
                                    relationKeys[layoutJSON.relations[i].father.record].fields.push(layoutJSON.relations[i].keys[j].fatherKey.key.split(";")[2]);
                                }
                                relationKeys[layoutJSON.relations[i].keys[j].sonKey.record].keys[keyIdentifier] = layoutJSON.relations[i].keys[j];
                                if (relationKeys[layoutJSON.relations[i].keys[j].sonKey.record].fields.indexOf(layoutJSON.relations[i].keys[j].sonKey.key.split(";")[2]) === -1) {
                                    relationKeys[layoutJSON.relations[i].keys[j].sonKey.record].fields.push(layoutJSON.relations[i].keys[j].sonKey.key.split(";")[2]);
                                }
                            }
                        }
                    }
                }
                var businessRules = {};
                for (var b in layoutJSON.blocks) {
                    for (var r in layoutJSON.blocks[b].records) {
                        _self.recordList.push(layoutJSON.blocks[b].records[r].name);
                        if (layoutJSON.blocks[b].records[r].businessRules) {
                            businessRules[b + "_" + r] = layoutJSON.blocks[b].records[r].businessRules;
                        }
                    }
                }
                var dialog = $.baseDialog({
                    title: i18n('PROGRESS DETAIL'),
                    modal: true,
                    size: "medium",
                    viewName: "app.views.executor.progressIndication",
                    viewData: {},
                    buttons: [{
                        name: i18n("CLOSE"),
                        isCloseButton: true
                    }]
                });
                dialog.open();
                var totalExecutions = 0;
                for (var b in layoutJSON.blocks) {
                    totalExecutions += layoutJSON.blocks[b].positions.length;
                }
                var executionCount = 0;
                if (_self.createDigitalFileTabs) {
                    _self.createDigitalFileTabs();
                }
                var container = $(".editable.executarArquivo");
                $(container).empty();
                var lista = document.createElement("ul");
                var totalForm = 0;
                var totalBlock = 0;
                lista.setAttribute("class", "ul");
                container[0].appendChild(lista);
                var allLines = [];
                var count;
                var totalLines = 0;
                var recordLines = 0;
                var layoutFilters = layoutJSON.filters;
                var layoutFormat = layoutJSON.format;
                var blockFormat;
                var blockFilters;
                var mergedFormat = {};
                var allTotals = {};
                var blockRecordLines = {};
                var blockRecordChildren = {};
                var blockRecordPositions = [];
                var mergedFilters;
                var recordData;
                var hidingRule;
                var addLines = function(data) {
                    var lines = data.recordRawFile.split(new RegExp("&&::[0-9]+&:[0-9]+\r\n", "g"));
                    totalForm += lines.length - 1;
                    totalBlock += lines.length - 1;
                };
                var organizeLines = function(blockRecordLines, blockRecordPositions, relationKeys) {
                    var evaluatedRelations = [];
                    var positions = [];
                    totalForm = 0;
                    console.log('blockRecordLines', blockRecordLines);
                    console.log('blockRecordPositions', blockRecordPositions);
                    console.log('relationKeys', relationKeys);
                    for (var pos in blockRecordLines) {
                        for (var tTemp in blockRecordLines[pos].lines) {
                            if (blockRecordLines[pos].lines[tTemp].length) {
                                totalForm++;
                            }
                        }
                    }
                    var evaluateOp = function(operator, value1, value2, value3) {
                        switch (operator) {
                            case "!=":
                                return value2 !== value1 && value3 !== value1;
                            case ">":
                                return value2 > value1 && value3 > value1;
                            case "<":
                                return value2 < value1 && value3 < value1;
                            case ">=":
                                return value2 >= value1 && value3 >= value1;
                            case "<=":
                                return value2 <= value1 && value3 <= value1;
                            case "CONTAINS":
                                return ("" + value2).match(new RegExp(value1, "g")) !== null && ("" + value3).match(new RegExp(value1, "g"));
                            case "NOT CONTAINS":
                                return !(("" + value2).match(new RegExp(value1, "g")) !== null && ("" + value3).match(new RegExp(value1, "g")));
                            case "BW":
                                return ("" + value2).match(new RegExp("^" + value1, "g")) !== null && ("" + value3).match(new RegExp("^" + value1, "g"));
                            case "NOT BW":
                                return !(("" + value2).match(new RegExp("^" + value1, "g")) !== null && ("" + value3).match(new RegExp("^" + value1, "g")));
                            case "BW":
                                return ("" + value2).match(new RegExp("^" + value1, "g")) !== null && ("" + value3).match(new RegExp("^" + value1, "g"));
                            case "NOT BW":
                                return !(("" + value2).match(new RegExp("^" + value1, "g")) !== null && ("" + value3).match(new RegExp("^" + value1, "g")));
                            case "FW":
                                return ("" + value2).match(new RegExp(value1 + "$", "g")) !== null && ("" + value3).match(new RegExp("^" + value1 + "$", "g"));
                            case "NOT FW":
                                return !(("" + value2).match(new RegExp(value1 + "$", "g")) !== null && ("" + value3).match(new RegExp("^" + value1 + "$", "g")));
                        }
                    };
                    var parentHasChildren = {};
                    for (var rk in relationKeys) {
                        for (var key in relationKeys[rk].keys) {
                            if (relationKeys[rk].keys[key].hideParent) {
                                parentHasChildren[relationKeys[rk].keys[key].fatherKey.record] = {};
                            }
                        }
                    }
                    for (var i = 0; i < blockRecordPositions.length; i++) {
                        //Colocar los totales
                        var blockIndex = blockRecordPositions[i].split(";")[0];
                        var recordIndex = blockRecordPositions[i].split(";")[1];
                        var hasTotalField = false;
                        for (var c in layoutJSON.blocks[blockIndex].records[recordIndex].columns) {
                            if (layoutJSON.blocks[blockIndex].records[recordIndex].columns[c].isRecordsTotals || layoutJSON.blocks[blockIndex].records[
                                    recordIndex].columns[c].isBlocksTotal || layoutJSON.blocks[blockIndex].records[recordIndex].columns[c].isTotalsAll ||
                                layoutJSON.blocks[blockIndex].records[recordIndex].columns[c].sequenceField || layoutJSON.blocks[blockIndex].records[recordIndex].columns[c].isRecordCounter) {
                                hasTotalField = true;
                                break;
                            }
                        }
                        if (hasTotalField) {
                            for (var line in blockRecordLines[blockRecordPositions[i]].lines) {
                                for (var value = 0; value < blockRecordLines[blockRecordPositions[i]].lines[line].length; value++) {
                                    if (blockRecordLines[blockRecordPositions[i]].lines[line][value] && blockRecordLines[blockRecordPositions[i]].lines[line][value].match) {
                                        if (blockRecordLines[blockRecordPositions[i]].lines[line][value].match(/TOTAL_RECORD/g) || blockRecordLines[
                                                blockRecordPositions[i]].lines[line][value].match(/TOTAL_BLOCK/g) || blockRecordLines[blockRecordPositions[i]].lines[line][
                                                value
                                            ].match(/TOTAL_FILE/g) || blockRecordLines[blockRecordPositions[i]].lines[line][value].match(/SEQUENCE/g) || 
                                            blockRecordLines[blockRecordPositions[i]].lines[line][value].match(/RECORD_COUNTER/g)) {
                                            var column = layoutJSON.blocks[blockIndex].records[recordIndex].columns[blockRecordLines[blockRecordPositions[i]].lineXPositions[
                                                line][value]];
                                            var v = "";
                                            if (blockRecordLines[blockRecordPositions[i]].lines[line][value].match(/RECORD_COUNTER/g)) {
                                                v = _self.recordCounter;
                                            } else if (!blockRecordLines[blockRecordPositions[i]].lines[line][value].match(/SEQUENCE/g)) {
                                                var bI = column.totalData && column.totalData.block ? column.totalData.block : blockIndex;
                                                var rI = column.totalData && column.totalData.record ? column.totalData.record : recordIndex;
                                                if (blockRecordLines[blockRecordPositions[i]].lines[line][value].match(/TOTAL_RECORD/g)) {
                                                    if (column.recordIds) {
                                                        v = 0;
                                                        column.recordIds.map(function(recordId) {
                                                            let key = recordId.indexOf && recordId.indexOf('_') !== -1 ? recordId : (bI + "_" + recordId);
                                                            v += allTotals[key] ? allTotals[key].recordLines : 0;
                                                        });
                                                    } else {
                                                        v = allTotals[bI + "_" + rI] ? allTotals[bI + "_" + rI].recordLines : 0;
                                                    }
                                                } else if (blockRecordLines[blockRecordPositions[i]].lines[line][value].match(/TOTAL_BLOCK/g)) {
                                                    if (column.blockIds || column.blockId) {
                                                        let blockIds = column.blockIds || [column.blockId];
                                                        v = 0;
                                                        _.forEach(allTotals, function(total, totalKey) {
                                                            if (totalKey && totalKey.substring && blockIds.indexOf(totalKey.substring(0, totalKey.indexOf('_'))) !== -1) {
                                                                v += total.recordLines || 0;
                                                            }
                                                        });
                                                    } else {
                                                        v = allTotals[bI + "_" + rI] ? allTotals[bI + "_" + rI].blockLines : 0;
                                                    }
                                                    if (column.notInclude) {
                                                        v -= allTotals[bI + "_" + rI] ? allTotals[bI + "_" + rI].recordLines : 0;
                                                    }
                                                } else {
                                                    v = totalForm;
                                                }
                                            } else {
                                                v = parseInt(line, 10) + 1;
                                            }
                                            if (column.format && column.format.number) {
                                                var format = column.format.number;
                                                var decimal = format.decimal;
                                                var decimalSeparator = format.decimalSeparator;
                                                var miliarSeparator = format.miliarSeparator;
                                                var size = parseInt(format.size, 10) - v.toString().length;
                                                var sizeDecimal, sizeMiliar;
                                                var align = format.align;
                                                if (align === undefined) {
                                                    align = 1;
                                                }
                                                var alignQuery;
                                                var originalField = v;
                                                var searchFor = format.searchFor;
                                                var replaceWith = format.replaceWith;
                                                var completeCase = 0;
                                                var complement = format.complement;
                                                if (!size) {
                                                    size = v.toString().length;
                                                    sizeDecimal = v.toFixed(decimal).length;
                                                    sizeMiliar = 0;
                                                } else {
                                                    completeCase = 1;
                                                    sizeMiliar = size;
                                                    sizeDecimal = size;
                                                }
                                                if (complement && !align) {
                                                    align = 0;
                                                }
                                                if (!complement) {
                                                    complement = "";
                                                } else if (complement === "space") {
                                                    complement = " ";
                                                }
                                                if (align === 1) {
                                                    alignQuery = 'LPAD';
                                                } else if (align === 0) {
                                                    alignQuery = 'RPAD';
                                                }
                                                if (decimal) {
                                                    var toLength = v.toFixed(2).length + decimal;
                                                    if (decimal !== '0') {
                                                        toLength++;
                                                    }
                                                    v = v.toFixed(decimal);
                                                    for (var i1 = 0; i1 < toLength; i1++) {
                                                        if (align === 1) {
                                                            v = "0" + v;
                                                        } else {
                                                            v = v + "0";
                                                        }
                                                    }
                                                    size = sizeDecimal;
                                                }
                                                if (decimalSeparator) {
                                                    v = v.replace(new RegExp(/\./g), decimalSeparator);
                                                }
                                                if (searchFor) {
                                                    if (typeof searchFor === "string") {
                                                        searchFor = [searchFor];
                                                    }
                                                    if (replaceWith) {
                                                        if (typeof replaceWith === "string") {
                                                            replaceWith = [replaceWith];
                                                        }
                                                        for (var i1 = 0; i1 < searchFor.length; i1++) {
                                                            if (searchFor[i1]) {
                                                                v = v.replace(new RegExp("/" + searchFor[i1] + "/g"), replaceWith[i]);
                                                            }
                                                        }
                                                    } else {
                                                        for (var i1 = 0; i1 < searchFor.length; i1++) {
                                                            if (searchFor[i1]) {
                                                                v = v.replace(new RegExp("/" + searchFor[i1] + "/g"), "");
                                                            }
                                                        }
                                                    }
                                                }
                                                if (alignQuery) {
                                                    for (var i1 = 0; i1 < size; i1++) {
                                                        if (align === 1) {
                                                            v = complement + v;
                                                        } else {
                                                            v = v + complement;
                                                        }
                                                    }
                                                }
                                                if (!column.hasHidingRule) {
                                                    if (completeCase === 1) {
                                                        if (!originalField) {
                                                            v = "";
                                                        }
                                                    }
                                                } else {
                                                    if (!originalField) {
                                                        v = "";
                                                    }
                                                }
                                            }
                                            blockRecordLines[blockRecordPositions[i]].lines[line][value] = v;
                                        }
                                    }
                                }
                            }
                        }
                        if (relationKeys[blockRecordPositions[i]]) { //Si tiene relacionamentos
                            var relations = {};
                            for (var keyI in relationKeys[blockRecordPositions[i]].keys) {
                                var sonRecord = relationKeys[blockRecordPositions[i]].keys[keyI].sonKey.record;
                                if (!relations[keyI.split("_")[0] + "_" + sonRecord]) {
                                    relations[keyI.split("_")[0] + "_" + sonRecord] = {};
                                }
                                relations[keyI.split("_")[0] + "_" + sonRecord][keyI.split("_")[1]] = relationKeys[blockRecordPositions[i]].keys[keyI];
                            }
                            var addedLines = false;
                            var frequency = {};
                            var positionLines = [];
                            for (var l in blockRecordLines[blockRecordPositions[i]].lines) {
                                frequency[l] = 0;
                                
                                if (parentHasChildren[blockRecordPositions[i]])
                                    parentHasChildren[blockRecordPositions[i]][blockRecordPositions[i] + ";" + l] = false;
                                if (positions.indexOf(blockRecordPositions[i] + ";" + l) === -1)
                                    positions.push(blockRecordPositions[i] + ";" + l);
                            }
                            for (var r in relations) {
                                if (evaluatedRelations.indexOf(r) === -1) {
                                    var recordSon = r.split("_")[1];
                                    for (var l2 in blockRecordLines[recordSon].lines) {
                                        if (positions.indexOf(recordSon + ";" + l2) === -1) {
                                            positionLines = Object.keys(frequency);
                                            for (var pos = 1; pos < positionLines.length; pos++) {
                                                for (var pos2 = 0; pos2 < positionLines.length - pos; pos2++) {
                                                    if (frequency[positionLines[pos2]] > frequency[positionLines[pos2 + 1]]) {
                                                        var temp = positionLines[pos2 + 1];
                                                        positionLines[pos2 + 1] = positionLines[pos2];
                                                        positionLines[pos2] = temp;
                                                    }
                                                }
                                            }
                                            for (var p = 0; p < positionLines.length; p++) {
                                                var l = positionLines[p];
                                                if (positions.indexOf(blockRecordPositions[i] + ";" + l) === -1)
                                                    positions.push(blockRecordPositions[i] + ";" + l);
                                                var isRelated = true;
                                                for (var k in relations[r]) {
                                                    var fatherField = relations[r][k].fatherKey.key.split(";")[2];
                                                    var sonField = relations[r][k].sonKey.key.split(";")[2];
                                                    var filter = relations[r][k].filter;
                                                    var fatherValue = blockRecordLines[blockRecordPositions[i]].relationFieldsValues[l][fatherField];
                                                    var sonValue = blockRecordLines[recordSon].relationFieldsValues[l2][sonField];
                                                    blockRecordChildren[blockRecordPositions[i]] = blockRecordChildren[blockRecordPositions[i]] || {};
                                                    if (filter && filter.conditions && filter.conditions.length) {
                                                        var isValid = true;
                                                        for (var c = 0; c < filter.conditions.length; c++) {
                                                            var flag = true;
                                                            if (filter.conditions[c].operator.match(/[\w]+/g) === null) {
                                                                flag = evaluateOp(filter.conditions[c].operator, filter.conditions[c].value, fatherValue, sonValue);
                                                            } else {
                                                                if (filter.conditions[c].operator === "IN" || filter.conditions[c].operator === "NOT IN") {
                                                                    for (var v in filter.conditions[c].listValues) {
                                                                        flag = flag && evaluateOp(filter.conditions[c].listValues[v].oper, filter.conditions[c].listValues[v].name,
                                                                            fatherValue, sonValue);
                                                                    }
                                                                    if (filter.conditions[c].operator === "NOT IN") {
                                                                        flag = !flag;
                                                                    }
                                                                } else if (filter.conditions[c].operator === "CONTAINS" || filter.conditions[c].operator === "NOT CONTAINS") {
                                                                    flag = ("" + fatherValue).match(new RegExp(filter.conditions[c].value, "g")) !== null && ("" + sonValue).match(new RegExp(
                                                                        filter.conditions[c].value, "g"));
                                                                    if (filter.conditions[c].operator === "NOT CONTAINS") {
                                                                        flag = !flag;
                                                                    }
                                                                } else if (filter.conditions[c].operator === "BW" || filter.conditions[c].operator === "NOT BW") {
                                                                    flag = ("" + fatherValue).match(new RegExp("^" + filter.conditions[c].value, "g")) !== null && ("" + sonValue).match(
                                                                        new RegExp("^" + filter.conditions[c].value, "g"));
                                                                    if (filter.conditions[c].operator === "NOT CONTAINS") {
                                                                        flag = !flag;
                                                                    }
                                                                } else if (filter.conditions[c].operator === "FW" || filter.conditions[c].operator === "NOT FW") {
                                                                    flag = ("" + fatherValue).match(new RegExp(filter.conditions[c].value + "$", "g")) !== null && ("" + sonValue).match(
                                                                        new RegExp("^" + filter.conditions[c].value + "$", "g"));
                                                                    if (filter.conditions[c].operator === "NOT FW") {
                                                                        flag = !flag;
                                                                    }
                                                                }
                                                            }
                                                            if (filter.conditions[c].logicOperator) {
                                                                if (filter.conditions[c].logicOperator === "AND") {
                                                                    isValid = isValid && flag;
                                                                } else {
                                                                    isValid = isValid || flag;
                                                                }
                                                            } else {
                                                                isValid = flag;
                                                            }
                                                        }
                                                        if (!isValid) {
                                                            isRelated = false;
                                                            break;
                                                        }
                                                    } else {
                                                        if (fatherValue !== sonValue) {
                                                            isRelated = false;
                                                            break;
                                                        }
                                                    }
                                                }
                                                if (isRelated) {
                                                    frequency[positionLines[p]]++;
                                                    blockRecordChildren[blockRecordPositions[i]][l] = blockRecordChildren[blockRecordPositions[i]][l] || 0;
                                                    blockRecordChildren[blockRecordPositions[i]][l]++;
                                                    positions.splice(positions.indexOf(blockRecordPositions[i] + ";" + l) + frequency[positionLines[p]], 0, recordSon + ";" + l2);
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                    addedLines = true;
                                    for (var f = 0; f < positionLines.length; f++) {
                                        if (parentHasChildren[blockRecordPositions[i]] && !parentHasChildren[blockRecordPositions[i]][blockRecordPositions[i] + ";" +
                                                positionLines[f]
                                            ]) {
                                            parentHasChildren[blockRecordPositions[i]][blockRecordPositions[i] + ";" + positionLines[f]] = frequency[positionLines[f]] !==
                                                0;
                                        }
                                    }
                                }
                                evaluatedRelations.push(r);
                            }
                            if (!addedLines) {
                                for (var l in blockRecordLines[blockRecordPositions[i]].lines) {
                                    if (positions.indexOf(blockRecordPositions[i] + ";" + l) === -1)
                                        positions.push(blockRecordPositions[i] + ";" + l); //Posicion
                                }
                            }
                        } else {
                            for (var l in blockRecordLines[blockRecordPositions[i]].lines) {
                                if (positions.indexOf(blockRecordPositions[i] + ";" + l) === -1)
                                    positions.push(blockRecordPositions[i] + ";" + l); //Posicion
                            }
                        }
                    }
                    var newRawFile = "";
                    if (layoutJSON.separator.value.indexOf(String.fromCharCode(8204)) === -1) {
                        layoutJSON.separator.value += String.fromCharCode(8204);
                    }
                    var allLines = [];
                    console.log('blockRecordChildren', blockRecordChildren);
                    console.log('blockRecordLines', blockRecordLines);
                    for (var p = 0; p < positions.length; p++) {
                        let recordPosition = positions[p].split(";")[0] + ";" + positions[p].split(";")[1];
                        var line = positions[p].split(";")[2];
                        var k = positions[p].split(";");
                        if (blockRecordLines[recordPosition].lines[line] && blockRecordLines[recordPosition].lines[line].indexOf('TOTAL_CHILD_RECORD') !== -1) {
                            let totalChildIndex = blockRecordLines[recordPosition].lines[line].indexOf('TOTAL_CHILD_RECORD');
                            blockRecordChildren[recordPosition] = blockRecordChildren[recordPosition] || {};
                            blockRecordLines[recordPosition].lines[line][totalChildIndex] = blockRecordChildren[recordPosition][line] || 0;
                        }
                        // positions[p] = positions[p].replace('/TOTAL_CHILD_RECORD/g', 0);
                        k.splice(2, 1);
                        k = k.join(";");
                        var considerLine = true;
                        if (parentHasChildren[k] && !parentHasChildren[k][positions[p]]) {
                            considerLine = false;
                        }
                        if (considerLine) {
                            var lineResult = blockRecordLines[recordPosition].lines[line];
                            var x = "";
                            if (lineResult.length) {
                                if (layoutJSON.separator.inFirst) {
                                    x += layoutJSON.separator.value;
                                }
                                x += lineResult.join(layoutJSON.separator.value);
                                if (layoutJSON.separator.inLast) {
                                    x += layoutJSON.separator.value;
                                }
                                allLines.push(x + "&&::" + positions[p].split(";")[0] + "&:" + positions[p].split(";")[1] + "\r\n");
                                newRawFile += x + "\r\n";
                                var li, span;
                                li = document.createElement("li");
                                span = document.createElement("span");
                                span.textContent = x;
                                span.textContent = span.textContent.replace(/ /g, '\u00a0');
                                li.appendChild(span);
                                lista.appendChild(li);
                            }
                        }
                    }
                    var rawFile = allLines.join("");
                    rawFile.replace(new RegExp("TOTAL_FILE", "g"), allLines.length);
                    assingRawFile(rawFile);
                };
                objectParams.getCount = true;
                count = 0;
                objectParams.offset = 0;
                objectParams.limit = 500;
                objectParams.idLayoutVersion = _self.idLayoutVersion;
                objectParams.structureMapCache = _self.structureMapCache;
                var totalExecutionTime = 0;
                var executeRecord = function(block, record) {
                    if (!blockRecordLines[block + ";" + record]) {
                        blockRecordLines[block + ";" + record] = {
                            lines: {},
                            unformattedLines: {},
                            lineXPositions: {},
                            relationFieldsValues: {}
                        };
                        blockRecordPositions.push(block + ";" + record);
                    }
                    blockFormat = layoutJSON.blocks[block] ? layoutJSON.blocks[block].format : undefined;
                    blockFilters = layoutJSON.blocks[block] ? layoutJSON.blocks[block].filters : undefined;
                    mergedFilters = _self.filterFunctions.mergeFilters(layoutFilters, blockFilters);
                    hidingRule = layoutJSON.hidingRule || (layoutJSON.blocks[block] ? layoutJSON.blocks[block].hidingRule : undefined);
                    if (!layoutFormat && blockFormat) {
                        mergedFormat = blockFormat;
                    } else if (layoutFormat && !blockFormat) {
                        mergedFormat = layoutFormat;
                    } else if (layoutFormat && blockFormat) {
                        mergedFormat.number = blockFormat.number || layoutFormat.number;
                        mergedFormat.string = blockFormat.string || layoutFormat.string;
                        mergedFormat.date = blockFormat.date || layoutFormat.date;
                    }
                    recordData = layoutJSON.blocks[block] ? (layoutJSON.blocks[block].records[record] || {}) : {};
                    recordData.hidingRule = recordData.hidingRule || hidingRule;
                    let hr = recordData.hidingRule;
                    if (!hr || (!hr.hide && !hr.hideValue && !hr.hideAllLine && !hr.hideField)) {
                        recordData.hidingRule = hidingRule;
                    }
                    //get all dependent fields between records
                    var dependentFields = {};
                    let dependentStructures = [];
                    for (var c in recordData.columns) {
                        if (recordData.columns[c] && recordData.columns[c].formula) {
                            if (recordData.columns[c].formula.outputs) {
                                for (var id in recordData.columns[c].formula.outputs) {
                                    if (id.match(/^\`ID_\d+-\d+-.+\`$/g)) {
                                        var blockId = id.split("ID_")[1].split("-")[0];
                                        var recordId = id.split("-")[1];
                                        var columnId = id.split("-")[2].split("`")[0];
                                        if (!dependentFields[blockId]) {
                                            dependentFields[blockId] = {};
                                        }
                                        if (!dependentFields[blockId][recordId]) {
                                            dependentFields[blockId][recordId] = [];
                                        }
                                        if (dependentFields[blockId][recordId].indexOf(columnId) === -1) {
                                            dependentFields[blockId][recordId].push(columnId);
                                            if (layoutJSON.groups.blocks && layoutJSON.groups.blocks[blockId] && layoutJSON.blocks[blockId].records[recordId] &&
                                            layoutJSON.blocks[blockId].records[recordId].groups && layoutJSON.blocks[blockId].records[recordId].groups.structures &&
                                            layoutJSON.blocks[blockId].records[recordId].groups.structures && layoutJSON.blocks[blockId].records[recordId].groups.structures[recordData.columns[c].formula.idStructure.toString()] && 
                                            layoutJSON.blocks[blockId].records[recordId].groups.structures[recordData.columns[c].formula.idStructure.toString()].groups) {
                                                let grps = layoutJSON.blocks[blockId].records[recordId].groups.structures[recordData.columns[c].formula.idStructure.toString()].groups;
                                                _.forEach(grps, function(grp) {
                                                    if (_.isArray(grp.groupBy) && !_.isEmpty(grp.groupBy)) {
                                                        _.forEach(grp.groupBy, function(grpBy) {
                                                            if (_.indexOf(dependentFields[blockId][recordId], grpBy) === -1) {
                                                                dependentFields[blockId][recordId].push(grpBy);
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                            if (_.indexOf(dependentStructures, recordData.columns[c].formula.idStructure) === -1) {
                                                dependentStructures.push(Number(recordData.columns[c].formula.idStructure));
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    // getting records groupers for makes join in formulas that use fields from other records
                    if (_.isNil(_self.groupers)) {
                        _self.groupers = {};
                        if (layoutJSON.groups && layoutJSON.groups.blocks) {
                            _.forEach(layoutJSON.groups.blocks, function(layoutBlock, idBlock) {
                                if (layoutBlock && layoutBlock.records) {
                                    _.forEach(layoutBlock.records, function(layoutRecord, idRecord) {
                                        _self.groupers[idBlock + '_' + idRecord] = [];
                                        if (layoutRecord && layoutRecord.structures) {
                                            _.forEach(layoutRecord.structures, function(layoutStructure) {
                                                if (layoutStructure.groups) {
                                                    _.forEach(layoutStructure.groups, function(layoutGroup) {
                                                        if (layoutGroup.groupBy) {
                                                            _.forEach(layoutGroup.groupBy, function(grouper) {
                                                                if (_.indexOf(_self.groupers[idBlock + '_' + idRecord], grouper) === -1) {
                                                                    _self.groupers[idBlock + '_' + idRecord].push(grouper);
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    }
                    var dependentFieldsValues = {};
                    var dependentFieldsDimensions = {};
                    if (Object.keys(dependentFields).length) {
                        for (var blockt in dependentFields) {
                            if (Object.keys(dependentFields[blockt]).length) {
                                dependentFieldsValues[blockt] = {};
                                dependentFieldsDimensions[blockt] = {};
                                for (var recordt in dependentFields[blockt]) {
                                    if (blockRecordLines[blockt + ";" + recordt]) {
                                        dependentFieldsValues[blockt][recordt] = [];
                                        dependentFieldsDimensions[blockt][recordt] = {};
                                        for (var line in blockRecordLines[blockt + ";" + recordt].lines) {
                                            var values = {};
                                            for (var columnId = 0; columnId < dependentFields[blockt][recordt].length; columnId++) {
                                                var column = dependentFields[blockt][recordt][columnId];
                                                if (!dependentFieldsDimensions[blockt][recordt][column]) {
                                                    if (_self.layoutJSON.blocks[blockt].records[recordt].columns[column].fieldId) {
                                                        dependentFieldsDimensions[blockt][recordt][column] = _self.structureMapCache[_self.layoutJSON.blocks[blockt].records[recordt].columns[column].idStructure].type[_self.layoutJSON.blocks[blockt].records[recordt].columns[column].fieldId];
                                                    } else {
                                                        var columnType = $.globalFunctions.getColumnType(_self.layoutJSON.blocks[blockt].records[recordt].columns[column], _self.filterFunctions.structureData);
                                                        columnType = columnType === "NUMBER" ? "DECIMAL" : columnType;
                                                        columnType = columnType === "STRING" ? "NVARCHAR" : columnType;
                                                        columnType = columnType === "DATE" ? "TIMESTAMP" : columnType;
                                                        var dimension = {
                                                            type: columnType
                                                        };
                                                        if (columnType === "NVARCHAR") {
                                                            dimension.dimension = 40;
                                                        } else if (columnType === "TIMESTAMP") {
                                                            dimension.dimension = 8;
                                                        } else if (columnType === "DECIMAL") {
                                                            dimension.dimension = 15;
                                                            dimension.precision = 6;
                                                        }
                                                        dependentFieldsDimensions[blockt][recordt][column] = dimension;
                                                    }
                                                }
                                                var columnCopy = column;
                                                if (columnCopy.match(/\d+S\d+C\d+/g)) {
                                                    columnCopy += "S" + columnCopy.split("S")[0];
                                                }
                                                if (blockRecordLines[blockt + ";" + recordt].lineXPositions[line] && blockRecordLines[blockt + ";" + recordt].lineXPositions[line].indexOf(columnCopy) !== -1) {
                                                    var columnPosition = blockRecordLines[blockt + ";" + recordt].lineXPositions[line].indexOf(columnCopy);
                                                    values[column] = blockRecordLines[blockt + ";" + recordt].unformattedLines[line][columnPosition];
                                                }
                                            }
                                            if (Object.keys(values).length) {
                                                dependentFieldsValues[blockt][recordt].push(values);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    recordData.dependentFieldsValues = dependentFieldsValues;
                    recordData.dependentFieldsDimensions = dependentFieldsDimensions;
                    recordData.groupers = _self.groupers;
                    if (!recordData.format) {
                        recordData.format = mergedFormat;
                    } else {
                        recordData.format.number = recordData.format.number || mergedFormat.number;
                        recordData.format.string = recordData.format.string || mergedFormat.string;
                        recordData.format.date = recordData.format.date || recordData.format.date;
                    }
                    recordData.filters = _self.filterFunctions.mergeFilters(mergedFilters, recordData.filters);
                    if (layoutJSON.groups && layoutJSON.groups.blocks) {
                        if (layoutJSON.groups.blocks[block] && layoutJSON.groups.blocks[block].records && layoutJSON.groups.blocks[block].records[record]) {
                            recordData.groups = layoutJSON.groups.blocks[block].records[record];
                        }
                    }
                    recordData.relationsInfo = relationKeys[block + ";" + record];
                    objectParams.layoutFilters = layoutFilters;
                    objectParams.recordData = recordData;
                    objectParams.separator = layoutJSON.separator;
                    objectParams.actualBlock = block;
                    objectParams.actualRecord = record;
                    objectParams.lineCount = Object.keys(blockRecordLines[block + ";" + record].lines).length;
                    if (_self.isSCANCExecution) {
                        if (_self.manualParams && _self.manualParams[block] && _self.manualParams[block].records[record]) {
                            objectParams.manualParams = _self.manualParams[block].records[record];
                        }
                    }
                    objectParams.id = window.parameters.id;
                    //  objectParams.recordData = {};
                    _self.recordCounter += 1;
                    objectParams.recordList = _self.recordList;
                    Data.endpoints.dfg.setting.executeDF.post(objectParams).success(function(serviceData) {
                        totalExecutionTime += serviceData.totalTime;
                        totalLines += Object.keys(serviceData.originalRecordLines).length;
                        recordLines += Object.keys(serviceData.newRecordLines).length;
                        var line1 = JSON.stringify(blockRecordLines[block + ";" + record].lines).substring(0, JSON.stringify(blockRecordLines[block +
                            ";" + record].lines).length - 1);
                        var unformattedLine1 = JSON.stringify(blockRecordLines[block + ";" + record].unformattedLines).substring(0, JSON.stringify(blockRecordLines[block +
                            ";" + record].unformattedLines).length - 1);
                        var lineP1 = JSON.stringify(blockRecordLines[block + ";" + record].lineXPositions).substring(0, JSON.stringify(blockRecordLines[
                            block +
                            ";" + record].lineXPositions).length - 1);
                        var relationFieldsValues1 = JSON.stringify(blockRecordLines[block + ";" + record].relationFieldsValues).substring(0, JSON.stringify(
                            blockRecordLines[block + ";" + record].relationFieldsValues).length - 1);
                        if (line1[line1.length - 1] === "{") {
                            blockRecordLines[block + ";" + record].lines = serviceData.newRecordLines;
                            blockRecordLines[block + ";" + record].unformattedLines = serviceData.newUnformattedRecordLines;
                            blockRecordLines[block + ";" + record].lineXPositions = serviceData.newRecordLinesXPositions;
                        } else {
                            if (Object.keys(serviceData.newRecordLines).length) {
                                var line2 = JSON.stringify(serviceData.newRecordLines);
                                var unformattedLine2 = JSON.stringify(serviceData.newUnformattedRecordLines);
                                var lineP2 = JSON.stringify(serviceData.newRecordLinesXPositions);
                                line1 += "," + line2.substring(1, line2.length);
                                unformattedLine1 += "," + unformattedLine2.substring(1, unformattedLine2.length);
                                lineP1 += "," + lineP2.substring(1, lineP2.length);
                                blockRecordLines[block + ";" + record].lines = JSON.parse(line1);
                                blockRecordLines[block + ";" + record].unformattedLines = JSON.parse(unformattedLine1);
                                blockRecordLines[block + ";" + record].lineXPositions = JSON.parse(lineP1);
                            }
                        }
                        if (relationFieldsValues1[relationFieldsValues1.length - 1] === "{" && serviceData.relationFieldsValues) {
                            blockRecordLines[block + ";" + record].relationFieldsValues = serviceData.relationFieldsValues;
                        } else {
                            if (serviceData.relationFieldsValues && Object.keys(serviceData.relationFieldsValues).length) {
                                var relationFieldsValues2 = JSON.stringify(serviceData.relationFieldsValues);
                                relationFieldsValues1 += "," + relationFieldsValues2.substring(1, relationFieldsValues2.length);
                                blockRecordLines[block + ";" + record].relationFieldsValues = JSON.parse(relationFieldsValues1);
                            }
                        }
                        if (objectParams.getCount) {
                            count = serviceData.count;
                        }
                        addLines(serviceData);
                        objectParams.offset += 500;
                        if (objectParams.offset < count && Object.keys(serviceData.newRecordLines).length) {
                            objectParams.getCount = false;
                            executeRecord(block, record);
                        } else {
                            allTotals[block + "_" + record] = {};
                            allTotals[block + "_" + record].recordLines = recordLines;
                            // lista.innerText = lista.innerText.replace(new RegExp("TOTAL_RECORD", "g"), recordLines);
                            executionCount++;
                            objectParams.offset = 0;
                            objectParams.getCount = true;
                            count = 0;
                            totalLines = 0;
                            recordLines = 0;
                            var progressResult = parseInt((executionCount / totalExecutions) * 100, 10);
                            var text = i18n("EXECUTING:") + " " + progressResult.toFixed(2) + "%";
                            if (layoutJSON.blocks[block].positions.indexOf(record) === layoutJSON.blocks[block].positions.length - 1) {
                                layoutJSON.blocks[block].positions.map(function(pos) {
                                    allTotals[block + "_" + pos].blockLines = totalBlock;
                                });
                                var nextValidRecord = undefined;
                                var nextValidBlock = undefined;
                                for (var i = layoutJSON.positions.indexOf(block) + 1; i < layoutJSON.positions.length; i++) {
                                    if (layoutJSON.blocks[layoutJSON.positions[i]].positions.length) {
                                        var blockPos = layoutJSON.blocks[layoutJSON.positions[i]].positions;
                                        for (var j = 0; j < blockPos.length; j++) {
                                            if (layoutJSON.blocks[layoutJSON.positions[i]].records[blockPos[j]].positions.length) {
                                                nextValidRecord = blockPos[j];
                                                break;
                                            }
                                        }
                                        if (nextValidRecord) {
                                            nextValidBlock = layoutJSON.positions[i];
                                            break;
                                        }
                                    }
                                }
                                if (nextValidBlock && nextValidRecord) {
                                    dialog.getInnerController().updateProgress(text, Number(progressResult), progressResult.toFixed(2) + "%");
                                    executeRecord(nextValidBlock, nextValidRecord);
                                } else {
                                    if (Object.keys(businessRules).length) {
                                        Data.endpoints.dfg.setting.evaluateBusinessRules.post({
                                            blockRecordLines: blockRecordLines,
                                            businessRules: businessRules
                                        }).success(function(data) {
                                            _self.loader.close();
                                            _self.blockRecordLines = data.blockRecordLines;
                                            organizeLines(data.blockRecordLines, blockRecordPositions, relationKeys);
                                        });
                                    } else {
                                        _self.loader.close();
                                        _self.blockRecordLines = blockRecordLines;
                                        organizeLines(blockRecordLines, blockRecordPositions, relationKeys);
                                    }
                                    Data.endpoints.dfg.setting.deleteCache.post({
                                        caches: _self.structureMapCache,
                                        id: window.parameters.id
                                    }).success(function(data) {
                                        delete _self.structureMapCache;
                                        delete _self.groupers;
                                        dialog.getInnerController().progressBar.destroy();
                                    });
                                    dialog.close();
                                    console.log("EXECUTION TIME:" + totalExecutionTime / 1000 + " seconds");
                                }
                            } else {
                                record = layoutJSON.blocks[block].positions[layoutJSON.blocks[block].positions.indexOf(record) + 1];
                                dialog.getInnerController().updateProgress(text, Number(progressResult), progressResult.toFixed(2) + "%");
                                executeRecord(block, record);
                            }
                        }
                    }).error(function(data) {
                        Data.endpoints.dfg.setting.deleteCache.post(_self.structureMapCache).success(function(data) {
                            delete _self.structureMapCache;
                            delete _self.groupers;
                            dialog.getInnerController().progressBar.destroy();
                        });
                        dialog.close();
                        _self.loader.close();
                    });
                };
                var block = layoutJSON.positions[0];
                var record = layoutJSON.blocks[block].positions[0];
                var text = i18n("EXECUTING:") + " 0%";
                dialog.getInnerController().updateProgress(text, (executionCount / totalExecutions) * 100, "0%");
                executeRecord(block, record);
            };
            if (_self.structureMapCache && Object.keys(_self.structureMapCache).length) {
                callback();
            } else {
                if (!_self.mandt) {
                    Data.endpoints.atr.getMandt.post().success(function(data) {
                        _self.mandt = data.map(function(d) {
                            return d.mandt;
                        });
                        _self.formStructureCache(callback);
                    }).error(function(err) {
                    });
                } else {
                    _self.formStructureCache(callback);
                }
            }
        } else {
            $.baseToast({
                text: i18n("EMPTY FIELDS ERROR"),
                isError: true
            });
        }
    },
    getEEFIFilters: function(idStructure, structureKeys) {
        var _self = this;
        var mapConfig = {};
        for (var i = 0; i < _self.mapConfigs.length; i++) {
            if (Number(_self.mapConfigs[i].structureId) === Number(idStructure)) {
                mapConfig = _self.mapConfigs[i].mapping;
                mapConfig.structureKeys = structureKeys;
                break;
            }
        }
        return mapConfig;
    },
    getFromClause: function(structureIndex) {
        var _self = this;
        var fromClause = "",
            inputParameters, inputParam;
        var structure = _self.layoutObject.headerData.structure[structureIndex];
        inputParameters = structure.inputParameters;
        fromClause = "\"_SYS_BIC\".\"" + _self.layoutObject.headerData.structure[structureIndex].hanaPackage + "/";
        fromClause += _self.layoutObject.headerData.structure[structureIndex].hanaName + "\"";
        var params = [];
        // if (inputParameters && inputParameters.length) {
        //     fromClause += ' (\'PLACEHOLDER\' = (';
        //     for (inputParam = 0; inputParam < inputParameters.length; inputParam++) {
        //         var p;
        //         if (inputParameters[inputParam].hanaName !== 'IP_MANDANTE') {
        //             p = '\'$$' + inputParameters[inputParam].hanaName + '$$\',';
        //             if (inputParameters[inputParam].hasOwnProperty("value") && inputParameters[inputParam].value) {
        //                 p += '\'' + inputParameters[inputParam].value + '\'';
        //             } else {
        //                 p += '\'*\'';
        //             }
        //         } else {
        //             p = '\'$$' + inputParameters[inputParam].hanaName + '$$\',' + '\'' + _self.mandt[0] + "\'";
        //         }
        //         params.push(p);
        //     }
        //     fromClause += params.toString() + ")) ";
        // }
        return fromClause;
    },
    getViewName: function(structureIndex) {
        var _self = this;
        var fromClause = "",
            inputParameters, inputParam;
        var structure = _self.layoutObject.headerData.structure[structureIndex];
        inputParameters = structure.inputParameters;
        fromClause = "\"_SYS_BIC\".\"" + _self.layoutObject.headerData.structure[structureIndex].hanaPackage + "/";
        fromClause += _self.layoutObject.headerData.structure[structureIndex].hanaName + "\"";
        return fromClause;
    },
    fillFields: function(columns, idStructure, structureData, fields) {
        for (var c in columns) {
            if (columns[c].fieldId !== null && !isNaN(Number(columns[c].fieldId))) {
                if (Number(columns[c].idStructure) === Number(idStructure) && !fields[columns[c].fieldId]) {
                    fields[columns[c].fieldId] = structureData[idStructure][columns[c].fieldId];
                }
            } else {
                if (columns[c].formula) {
                    var found = !Array.isArray(columns[c].idStructure);
                    if (!found) {
                        for (var s = 0; s < columns[c].idStructure.length; s++) {
                            if (Number(columns[c].idStructure[s]) === Number(idStructure)) {
                                found = true;
                                break;
                            }
                        }
                    } else {
                        found = false;
                    }
                    if (found || (!Array.isArray(columns[c].idStructure) && Number(columns[c].idStructure) === Number(idStructure))) {
                        var ids = columns[c].formula.raw.match(/ID_[0-9]+(_[0-9]+)?/g);
                        if (ids && ids !== null && ids.length) {
                            for (var id = 0; id < ids.length; id++) {
                                if (ids[id].match(/ID_[0-9]+_[0-9]+/g)) {
                                    if (parseInt(ids[id].split("_")[2], 10) === Number(idStructure)) {
                                        if (!fields[ids[id].split("_")[1]]) {
                                            fields[ids[id].split("_")[1]] = structureData[idStructure][ids[id].split("_")[1]];
                                        }
                                    }
                                } else {
                                    if (!fields[ids[id].split("ID_")[1]]) {
                                        fields[ids[id].split("ID_")[1]] = structureData[idStructure][ids[id].split("ID_")[1]];
                                    }
                                }
                            }
                        }
                    }
                } else if (columns[c].listField) {
                    for (var f = 0; f < columns[c].listField.fields.length; f++) {
                        var field = columns[c].listField.fields[f];
                        if (Number(field.idStructure) === idStructure && !fields[field.id]) {
                            fields[field.id] = structureData[idStructure][field.id];
                        }
                    }
                }
            }
        }
    },
    getStructureRelations: function(blocks) {
        var _self = this;
        var structureRelations = [];
        for (var b in blocks) {
            for (var r in blocks[b].records) {
                if (blocks[b].records[r].structureRelation) {
                    for (var sr = 0; sr < blocks[b].records[r].structureRelation.length; sr++) {
                        if (structureRelations.indexOf(blocks[b].records[r].structureRelation[sr]) === -1) {
                            structureRelations.push(blocks[b].records[r].structureRelation[sr]);
                        }
                    }
                }
            }
        }
        return structureRelations;
    },
    formStructureCache: function(callback) {
        var _self = this;
        _self.structureMapCache = {};
        if (!$.globalFunctions) {
            $.globalFunctions = sap.ui.controller("app.controllers.dfgExecutor.globalFunctions");
        }
        $.globalFunctions.organizeJSON(_self.layoutJSON);
        var generalParamsDataObject = _self.generalParamsDataObject;
        var data = {
            eefi: {}
        };
        var structureData = {};
        data.eefi.idCompany = generalParamsDataObject.company;
        data.eefi.uf = generalParamsDataObject.uf;
        data.eefi.idBranch = generalParamsDataObject.branch;
        data.eefi.idTax = generalParamsDataObject.tax;
        data.eefi.year = generalParamsDataObject.subPeriod.year;
        data.eefi.month = generalParamsDataObject.subPeriod.month;
        data.eefi.subPeriod = generalParamsDataObject.subPeriod.subperiod;
        data.eefi.idMap = _self.configData.idMap;
        data.eefi.initSubPeriod = _self.configData.initSubPeriod;
        data.eefi.endSubPeriod = _self.configData.endSubPeriod;
        data.offset = 0;
        data.limit = 5000;
        var idStructure = _self.idStructure.length ? _self.idStructure[0] : 0;
        var layoutJSON = _self.layoutJSON;
        var structureIndex = 0;
        var count = 0;
        var allFilters = layoutJSON.filters;
        var structureKeys = [];
        var whereLayoutFields = [];
        structureData[idStructure] = {};
        _self.layoutObject.headerData.structure[structureIndex].fields.map(function(f) {
            structureData[idStructure][f.ID] = f;
            if (f.isKey) {
                structureKeys.push(f.hanaName);
            }
        });
        _self.filterFunctions.data = data;
        _self.filterFunctions.structureData = structureData;
        var addFilter = function(level, filter, filterLevels, idStructure) {
            if (filter) {
                var levels = level.split("_");
                for (var f = 0; f < filter.length; f++) {
                    var group = filter[f].group;
                    for (var g = 0; g < group.length; g++) {
                        if (group[g].conditions) {
                            if (!filterLevels[group[g].fieldId]) {
                                filterLevels[group[g].fieldId] = {
                                    subLevels: {}
                                };
                            }
                            var actualSubLevel = filterLevels[group[g].fieldId].subLevels;
                            for (var l = 0; l < levels.length; l++) {
                                if (l !== levels.length - 1) {
                                    if (!actualSubLevel[levels[l]]) {
                                        actualSubLevel[levels[l]] = {
                                            subLevels: {}
                                        };
                                    }
                                    actualSubLevel = actualSubLevel[levels[l]].subLevels;
                                } else {
                                    if (!actualSubLevel[levels[l]]) {
                                        actualSubLevel[levels[l]] = {
                                            filterClause: _self.filterFunctions.processCondition(group[g].conditions, _self.filterFunctions.getFieldName(group[g].fieldId,
                                                idStructure), _self.filterFunctions.getFieldType(group[g].fieldId,
                                                idStructure)),
                                            subLevels: {}
                                        };
                                    } else {
                                        actualSubLevel[levels[l]].filterClause += " AND " + _self.filterFunctions.processCondition(group[g].conditions, _self.filterFunctions.getFieldName(group[g].fieldId,
                                            idStructure), _self.filterFunctions.getFieldType(group[g].fieldId,
                                            idStructure));
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };
        var addStructureFilters = function(allKeys, filterLevels) {
            var validFilters = [];
            for (var fieldId in filterLevels) {
                var filterByKeys = {};
                var keys = [].concat(allKeys);
                for (var k = 0; k < keys.length; k++) {
                    var levels = keys[k].split("_");
                    var filterClause = "";
                    var actualSubLevel = JSON.parse(JSON.stringify(filterLevels[fieldId]));
                    for (var l = 0; l < levels.length; l++) {
                        if (actualSubLevel.subLevels[levels[l]] && actualSubLevel.subLevels[levels[l]].filterClause) {
                            filterClause = actualSubLevel.subLevels[levels[l]].filterClause;
                        }
                        if (actualSubLevel.subLevels[levels[l]]) {
                            actualSubLevel = actualSubLevel.subLevels[levels[l]];
                        } else {
                            break;
                        }
                    }
                    filterByKeys[keys[k]] = filterClause;
                }
                var areCommon = true;
                var mainFilterClause = filterByKeys[Object.keys(filterByKeys)[0]];
                for (var k in filterByKeys) {
                    if (filterByKeys[k] !== mainFilterClause) {
                        areCommon = false;
                        break;
                    }
                }
                if (areCommon) {
                    validFilters.push(mainFilterClause);
                }
            }
            return validFilters;
        };
        var formCache = function(idStructure, isInit) {
            if (isInit) {
                data.offset = 0;
                data.getCount = isInit;
                data.idStructure = idStructure;
                var actualFilters;
                data.queryInfo = {
                    fields: {},
                    fromClause: "",
                    eefiFilters: _self.getEEFIFilters(idStructure, structureKeys),
                    layoutFilters: []
                };
                var filterLevels = {};
                var allKeys = [];
                if (allFilters && allFilters[idStructure]) {
                    addFilter("ALL", allFilters[idStructure], filterLevels, idStructure);
                }
                whereLayoutFields = [];
                var b, r, c, record;
                do {
                    data.queryInfo.fromClause = _self.getFromClause(structureIndex);
                    data.queryInfo.viewName = _self.getViewName(structureIndex);
                    for (b in layoutJSON.blocks) {
                        if (layoutJSON.blocks[b].filters && layoutJSON.blocks[b].filters[idStructure]) {
                            addFilter("ALL_" + b, layoutJSON.blocks[b].filters[idStructure], filterLevels, idStructure);
                        }
                        actualFilters = _self.filterFunctions.mergeFilters(allFilters, layoutJSON.blocks[b].filters);
                        for (r in layoutJSON.blocks[b].records) {
                            record = layoutJSON.blocks[b].records[r];
                            if (record.idStructure.indexOf("" + idStructure) !== -1 || record.idStructure.indexOf(idStructure) !== -1) {
                                if (record.filters && record.filters[idStructure]) {
                                    addFilter("ALL_" + b + "_" + r, record.filters[idStructure], filterLevels, idStructure);
                                }
                                allKeys.push("ALL_" + b + "_" + r);
                                actualFilters = _self.filterFunctions.mergeFilters(actualFilters, record.filters);
                                _self.filterFunctions.getColumnFilters(record.columns, idStructure, data.queryInfo.layoutFilters);
                                if (layoutJSON.groups && layoutJSON.groups.blocks[b] && layoutJSON.groups.blocks[b].records[r] && layoutJSON.groups.blocks[b].records[
                                        r].structures[idStructure] && layoutJSON.groups.blocks[b].records[r].structures[idStructure].groups && layoutJSON.groups.blocks[b].records[r].structures[idStructure].groups.length) {
                                    var groups = layoutJSON.groups.blocks[b].records[r].structures[idStructure].groups;
                                    for (var gr = 0; gr < groups.length; gr++) {
                                        if (groups[gr].columnFilters) {
                                            for (var cf in groups[gr].columnFilters) {
                                                for (var cf1 = 0; cf1 < groups[gr].columnFilters[cf].length; cf1++) {
                                                    for (var gr2 = 0; gr2 < groups[gr].columnFilters[cf][cf1].group.length; gr2++) {
                                                        if (!data.queryInfo.fields[groups[gr].columnFilters[cf][cf1].group[gr2].fieldId]) {
                                                            data.queryInfo.fields[groups[gr].columnFilters[cf][cf1].group[gr2].fieldId] = structureData[idStructure][groups[gr].columnFilters[
                                                                cf][cf1].group[
                                                                gr2].fieldId];
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    _self.filterFunctions.getGroupFilters(groups, data.queryInfo.layoutFilters, actualFilters, idStructure, data.queryInfo.fields,
                                        structureData, data);
                                } else {
                                    if (actualFilters && actualFilters[idStructure]) {
                                        var filters = "(" + _self.filterFunctions.processStructureFilters(actualFilters[idStructure], idStructure) + ")";
                                        if (data.queryInfo.layoutFilters.indexOf(filters) === -1)
                                            data.queryInfo.layoutFilters.push(filters);
                                    }
                                }
                                _self.fillFields(record.columns, idStructure, structureData, data.queryInfo.fields);
                                if (_self.structureRelations && _self.structureRelations.length) {
                                    for (var sr = 0; sr < _self.structureRelations.length; sr++) {
                                        if (_self.structureRelations[sr].structureId1 === idStructure || _self.structureRelations[sr].structureId2 === idStructure) {
                                            for (var f in _self.structureRelations[sr].fields) {
                                                if (_self.structureRelations[sr].structureId1 === idStructure) {
                                                    if (!data.queryInfo.fields[_self.structureRelations[sr].fields[f].field1.id]) {
                                                        data.queryInfo.fields[_self.structureRelations[sr].fields[f].field1.id] = structureData[idStructure][_self.structureRelations[
                                                            sr].fields[f].field1.id];
                                                    }
                                                } else {
                                                    if (!data.queryInfo.fields[_self.structureRelations[sr].fields[f].field2.id]) {
                                                        data.queryInfo.fields[_self.structureRelations[sr].fields[f].field2.id] = structureData[idStructure][_self.structureRelations[
                                                            sr].fields[f].field2.id];
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    data.queryInfo.layoutFilters = addStructureFilters(allKeys, filterLevels);
                    if (Object.keys(data.queryInfo.fields).length === 0) {
                        if (structureIndex !== _self.idStructure.length - 1) {
                            structureIndex++;
                            idStructure = _self.idStructure[structureIndex];
                            data.idStructure = idStructure;
                            structureData[idStructure] = {};
                            structureKeys = [];
                            _self.layoutObject.headerData.structure[structureIndex].fields.map(function(f) {
                                structureData[idStructure][f.ID] = f;
                                if (f.isKey) {
                                    structureKeys.push(f.hanaName);
                                }
                            });
                            data.queryInfo.eefiFilters = _self.getEEFIFilters(idStructure, structureKeys);
                            _self.filterFunctions.data = data;
                            _self.filterFunctions.structureData = structureData;
                        } else {
                            structureIndex = -1;
                            idStructure = -1;
                        }
                    } else {
                        _self.structureMapCache[idStructure] = {
                            mapConfigFields: {}
                        };
                        if (data.queryInfo.eefiFilters) {
                            for (var i in structureData[idStructure]) {
                                if (data.queryInfo.eefiFilters.empresa && structureData[idStructure][i].hanaName === data.queryInfo.eefiFilters.empresa[0]) {
                                    if (!data.queryInfo.fields[structureData[idStructure][i].ID]) {
                                        data.queryInfo.fields[structureData[idStructure][i].ID] = structureData[idStructure][i];
                                    }
                                    _self.structureMapCache[idStructure].mapConfigFields.idCompany = {
                                        id: structureData[idStructure][i].ID,
                                        hanaName: structureData[idStructure][i].hanaName
                                    };
                                    continue;
                                }
                                if (data.queryInfo.eefiFilters.ufFilial && structureData[idStructure][i].hanaName === data.queryInfo.eefiFilters.ufFilial[0]) {
                                    if (!data.queryInfo.fields[structureData[idStructure][i].ID]) {
                                        data.queryInfo.fields[structureData[idStructure][i].ID] = structureData[idStructure][i];
                                    }
                                    _self.structureMapCache[idStructure].mapConfigFields.uf = {
                                        id: structureData[idStructure][i].ID,
                                        hanaName: structureData[idStructure][i].hanaName
                                    };
                                    continue;
                                }
                                if (data.queryInfo.eefiFilters.filial && structureData[idStructure][i].hanaName === data.queryInfo.eefiFilters.filial[0]) {
                                    if (!data.queryInfo.fields[structureData[idStructure][i].ID]) {
                                        data.queryInfo.fields[structureData[idStructure][i].ID] = structureData[idStructure][i];
                                    }
                                    _self.structureMapCache[idStructure].mapConfigFields.idBranch = {
                                        id: structureData[idStructure][i].ID,
                                        hanaName: structureData[idStructure][i].hanaName
                                    };
                                    continue;
                                }
                                if (data.queryInfo.eefiFilters && data.queryInfo.eefiFilters.hasOwnProperty("data") && data.queryInfo.eefiFilters.data.length) {
                                    if (structureData[idStructure][i].hanaName === data.queryInfo.eefiFilters.data[0]) {
                                        if (!data.queryInfo.fields[structureData[idStructure][i].ID]) {
                                            data.queryInfo.fields[structureData[idStructure][i].ID] = structureData[idStructure][i];
                                        }
                                        _self.structureMapCache[idStructure].mapConfigFields.data1 = {
                                            id: structureData[idStructure][i].ID,
                                            hanaName: structureData[idStructure][i].hanaName
                                        };
                                        continue;
                                    }
                                }
                                if (data.queryInfo.eefiFilters && data.queryInfo.eefiFilters.hasOwnProperty("dataVigencia") && data.queryInfo.eefiFilters.dataVigencia
                                    .length) {
                                    if (structureData[idStructure][i].hanaName === data.queryInfo.eefiFilters.dataVigencia[0]) {
                                        if (!data.queryInfo.fields[structureData[idStructure][i].ID]) {
                                            data.queryInfo.fields[structureData[idStructure][i].ID] = structureData[idStructure][i];
                                        }
                                        _self.structureMapCache[idStructure].mapConfigFields.data1 = {
                                            id: structureData[idStructure][i].ID,
                                            hanaName: structureData[idStructure][i].hanaName
                                        };
                                        continue;
                                    }
                                    if (structureData[idStructure][i].hanaName === data.queryInfo.eefiFilters.dataVigencia[1]) {
                                        if (!data.queryInfo.fields[structureData[idStructure][i].ID]) {
                                            data.queryInfo.fields[structureData[idStructure][i].ID] = structureData[idStructure][i];
                                        }
                                        _self.structureMapCache[idStructure].mapConfigFields.data2 = {
                                            id: structureData[idStructure][i].ID,
                                            hanaName: structureData[idStructure][i].hanaName
                                        };
                                        continue;
                                    }
                                }
                            }
                        }
                    }
                } while (Object.keys(data.queryInfo.fields).length === 0 && idStructure !== -1)
            } else {
                data.getCount = false;
                delete data.queryInfo;
            }
            if (idStructure !== -1) {
                var toHex = function(str, hex) {
                    try {
                        hex = unescape(encodeURIComponent(str))
                            .split('').map(function(v) {
                                return v.charCodeAt(0).toString(16);
                            }).join('');
                    } catch (e) {
                        hex = str;
                        console.log('invalid text input: ' + str);
                    }
                    return hex;
                }
                data.fromClause = toHex(data.fromClause);
                data.viewName = toHex(data.viewName);
                data.idLayoutVersion = _self.idLayoutVersion;
                Data.endpoints.dfg.setting.formCache.post(data).success(function(response) {
                    //seguir con la siguiente estructura
                    _self.structureMapCache[idStructure].tableName = response.tableName;
                    _self.structureMapCache[idStructure].type = response.type;
                    data.offset = 0;
                    if (structureIndex !== _self.idStructure.length - 1) {
                        structureIndex++;
                        idStructure = _self.idStructure[structureIndex];
                        data.idStructure = idStructure;
                        structureData[idStructure] = {};
                        structureKeys = [];
                        _self.layoutObject.headerData.structure[structureIndex].fields.map(function(f) {
                            structureData[idStructure][f.ID] = f;
                            if (f.isKey) {
                                structureKeys.push(f.hanaName);
                            }
                        });
                        formCache(idStructure, true);
                    } else {
                        callback();
                    }
                }).error(function(data) {
                    console.log(data);
                });
            } else {
                callback();
            }
        };
        var structureRelations = _self.getStructureRelations(layoutJSON.blocks);
        if (structureRelations.length !== 0) {
            Data.endpoints.atr.getStructureRelations.post({
                id: structureRelations
            }).success(function(data) {
                _self.structureRelations = data;
                formCache(idStructure, true);
            });
        } else {
            formCache(idStructure, true);
        }
    },
    parseLineDataToObject: function(blockNumber, recordNumber, lineNumber) {
        let record = this.blockRecordLines[blockNumber + ';' + recordNumber];
        let structures = _.reduce(this.filterFunctions.structureData, function(prev, structure, i) {
            prev[i] = {
                fields: structure
            };
            return prev;
        }, {});
        $.globalFunctions.setStructure(structures);
        if (!_.isNil(record)) {
            let line = record.lines[lineNumber];
            if (!_.isNil(this.layoutJSON)) {
                let block = this.layoutJSON.blocks[blockNumber];
                if (!_.isNil(block)) {
                    let _record = block.records[recordNumber];
                    if (!_.isNil(_record) && !_.isNil(_record.columns) && !_.isNil(_record.positions)) {
                        let fields = _.reduce(line, function(prev, value, i) {
                            let column = _record.columns[_record.positions[i]];
                            if (!_.isNil(column)) {
                                let field = structures[column.idStructure] ? structures[column.idStructure].fields[column.fieldId] : null;
                                let type = field ? field.type : 'NVARCHAR';
                                let columnName = $.globalFunctions.getColumnName(column);
                                prev[_.camelCase(columnName)] = {
                                    label: columnName,
                                    value: value,
                                    type: type
                                };
                            }
                            return prev;
                        }, {});
                        let blockName = block.name;
                        let recordName = _record.name;
                        return {
                            block: blockName,
                            record: recordName,
                            line: lineNumber,
                            fields: fields
                        };
                    }
                }
            }
        }
    }
});