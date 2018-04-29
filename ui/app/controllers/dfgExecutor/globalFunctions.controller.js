//------------------------------------KBARA 05/06/2017---------------------------------------------------------//
/*
This controller it's made to remove all repetitive functions in the component, so please use it instead of writing same code multiple times.
You may add/modify any necessary function (Delete if you're really sure it isn't used in any other controller)
FUNCTIONS 
getColumnName {
    @column (object),
    @withUnique (boolean),
    @return (string)
}
***Use it in case you need the name for any column (structure or special), if you add a new special field PLEASE ADD IT TO THIS FUNCTION!!!
getColumnType {
    @column (object),
    @structures (object),
    @asSimpleType(boolean)
    @return (string)
}
***Use it in case you need the field type for any column (structure or special), if you add a new special field PLEASE ADD IT TO THIS FUNCTION!!!
verifyStructureField {
    @column (object)
    @return (boolean)
}
***Use it in case you need to identify an structure field
getBlockOptions {
    @jsonLayout (object),
    @withRecords (boolean|optional),
    @withColumns (boolean|optional)
}
***Use it in case you need options for a select/multipleSelect for blocks
getRecordOptions {
    @block (object),
    @withColumns (boolean|optional)
}
***Use it in case you need options for a select/multipleSelect for records
getColumnOptions{
    @record (object)
}
***Use it in case you need options for a select/multipleSelect for columns
*/
sap.ui.controller("app.controllers.dfgExecutor.globalFunctions", {
	setStructure: function(structure) {
		var _self = this;
		_self.structure = structure;
	},
	getColumnName: function(column, withUnique, isXML) {
		var name;
		var _self = this;
		if (column.fieldId) {
			if ((column.fieldId + "").match(new RegExp(/HRE[0-9]*/g))) {
				if (isXML) {
					name = "HR_EXECUCAO";
				} else {
					name = i18n("HR_EXECUCAO");
				}
			} else if ((column.fieldId + "").match(new RegExp(/DTE[0-9]*/g))) {
				if (isXML) {
					name = "DT_EXECUCAO";
				} else {
					name = i18n("DT_EXECUCAO");
				}

			} else {
				var fieldId = column.fieldId;
				if (!isXML) {
					name = sessionStorage.lang !== "enus" ? _self.structure[column.idStructure].fields[fieldId].labelPT : _self.structure[column.idStructure]
						.fields[column.fieldId].labelEN;
					if (withUnique && column.uniqueId) {
						name += " (" + (parseInt(column.uniqueId, 10) + 1) + ")";
					}
				} else {
					name = _self.structure[column.idStructure].fields[fieldId].hanaName;
				}
			}
		} else {
			if (column.hasOwnProperty('manualParam')) {
				name = column.manualParam.label;
			}
			if (column.hasOwnProperty('formula')) {
				name = column.formula.label;
			}
			if (column.hasOwnProperty('fixedManualField')) {
				name = column.fixedManualField.name;
			}
			if (column.hasOwnProperty('fixedField')) {
				name = column.fixedField.name;
			}
			if(column.hasOwnProperty("groupedLines")){
			    name = column.label;
			}
			if (column.isInitialDateReference === true) {
				if (isXML) {
					name = "INITDATEREFERENCE";
				} else {
					name = column.label || i18n("INITDATEREFERENCE");
				}

			}
			if (column.isFinalDateReference === true) {
				if (isXML) {
					name = "FINALDATEREFERENCE";
				} else {
					name = column.label || i18n("FINALDATEREFERENCE");
				}

			}
			if (column.id && (column.id + "").match(new RegExp(/HRE/g))) {
				if (isXML) {
					name = "HR_EXECUCAO";
				} else {
					name = column.label || i18n('HR_EXECUCAO');
				}

			}
			if (column.hasOwnProperty('recordId')) {
				if (typeof(column.recordId) !== "object") {
					name = "ID " + i18n("RECORD");
				} else {
					if (column.recordId.hasOwnProperty("blockId")) {
						name = "ID " + i18n("BLOCK") + (column.recordId.hasOwnProperty("recordId") ? " + ID" + i18n("RECORD") : "");
					} else {
						name = "ID " + i18n("RECORD");
					}
				}
			}
			if (column.hasOwnProperty('filler')) {
				name = column.filler.name;
			}
			if (column.hasOwnProperty('version')) {
				name = column.version.id;
			}
			if (column.hasOwnProperty('output')) {
				name = column.output.label;
			}
			if (column.isRecordsTotals) {
				if (isXML) {
					name = "RECORDTOTAL";
				} else {
					name = i18n("RECORDTOTAL");
				}

			}
			if (column.isBlocksTotal) { 
				if (isXML) {
					name = "BLOCKTOTAL";
				} else {
					name = i18n("BLOCKTOTAL");
				}
			}
			if (column.isTotalsAll) {
				if (isXML) {
					name = "TOTALALL";
				} else {
					name = i18n("TOTALALL");
				}
			}
			if (column.isChildTotal) {
				if (isXML) {
					name = "TOTALCHILDRECORD";
				} else {
					name = i18n("TOTALCHILDRECORD");
				}
			}
			if (column.isRecordCounter) {
				if (isXML) {
					name = "RECORDCOUNTER";
				} else {
					name = i18n("RECORDCOUNTER");
				}
			}
			if (column.recordList) {
				if (isXML) {
					name = "RECORDLIST";
				} else {
					name = i18n("RECORDLIST");
				}
			}
			if (column.isReferencePeriod) {
				name = column.label;
			}
			if (column.hasOwnProperty("sequenceField")) {
				if (isXML) {
					name = "SEQUENCE";
				} else {
					name = column.label || i18n("SEQUENCE");
				}
			}

		}
		if (isXML && name) {
			name = name.toUpperCase();
			var newName = name.split(new RegExp(/( )+/g));
			name = [];
			for (var n = 0; n < newName.length; n++) {
				if (!newName[n].match(new RegExp(/( )+/g))) {
					name.push(newName[n]);
				}
			}
			name = name.join("_");
		}
		return name;
	},
	getColumnType: function(column, structures, asSimpleType) {
		var _self = this;
		var type = "";
		if (_self.verifyStructureField(column) && !column.hasOwnProperty('formula')) {
			type = structures[column.idStructure].fields[column.fieldId].simpleType;
		} else {

			if (column.hasOwnProperty('manualParam')) {
				type = column.manualParam.type;

			}
			if (column.hasOwnProperty('formula')) {
				type = column.formula.type;
			}
			if (column.hasOwnProperty('fixedManualField')) {
				type = "STRING";

			}
			if(column.hasOwnProperty("groupedLines")){
			    type = "NUMBER";
			} 
			if (column.hasOwnProperty('fixedField')) {
				type = column.fixedField.type;

			}
			if (column.hasOwnProperty('format')) {

				if (column.format && column.format.date) {
					type = "DATE";
				}
			}
			if (column.isInitialDateReference ||
				column.isFinalDateReference ||
				column.isExecutionDate)             {
				type = 'DATE';
			}
			if (column.isExecutionHour) {
				type = "HOUR";
			}
			if (column.hasOwnProperty('recordId')) {
				type = 'STRING';
			}
			if (column.hasOwnProperty('sequenceField')) {
				type = 'NUMBER';
			}
			if (column.hasOwnProperty('filler')) {
				type = 'STRING';
			}
			if (column.hasOwnProperty('version')) {
				type = 'STRING';
			}
			if (column.isRecordsTotals || column.isBlocksTotal || column.isTotalsAll || column.isRecordCounter || column.isChildTotal) {
				type = 'NUMBER';
			}

			if (column.hasOwnProperty('output')) {
				type = "NUMBER";
			}
			
			if (column.hasOwnProperty('recordList')) {
			    type = 'STRING';
			}

		}
		if (type === 'NVARCHAR') {
			type = 'STRING';
		}
		if (type === 'DECIMAL') {
			type = 'NUMBER';
		}
		if (type === 'TIMESTAMP') {
			type = 'DATE';
		}
		if (asSimpleType) {
			if (type === 'NVARCHAR') {
				type = 'STRING';
			}
			if (type === 'DECIMAL') {
				type = 'NUMBER';
			}
			if (type === 'TIMESTAMP') {
				type = 'DATE';
			}
		}
		return type;
	},
	verifyStructureField: function(column) {
		if (column) {
		    if(column.formula){
		        return true;
		    }
			var fieldId = column.fieldId;
			if (!fieldId) {
				return false;
			}

			if (!isNaN(parseInt(fieldId, 10))) {
				return true;
			}
			return false;
		}
	},
	getBlockOptions: function(jsonLayout, withRecords, withColumns, formalID) {
		var _self = this;
		var blockOptions = [];
		if (jsonLayout && jsonLayout.positions) {
			for (var i = 0; i < jsonLayout.positions.length; i++) {
				var block = jsonLayout.blocks[jsonLayout.positions[i]];
				if (block) {
					blockOptions.push({
						key: jsonLayout.positions[i],
						name: block.name || i,
						records: withRecords ? _self.getRecordOptions(block, withColumns, formalID) : undefined
					});
				}
			}
		}
		return blockOptions;
	},
	getStructureOptions: function(structure) {
		return Object.keys(structure).map(function(k) {
			return {
				key: k,
				name: structure[k].title
			};
		});
	},
	getRecordOptions: function(block, withColumns, formalID) {
		var _self = this;
		var recordOptions = [];
		if (block && block.positions) {
			var recordCount = {};
			for (var i = 0; i < block.positions.length; i++) {
				var record = block.records[block.positions[i]];
				if (record) {
					recordCount[record.name] = recordCount[record.name] || 0;
					recordCount[record.name]++;
					recordOptions.push({
						key: block.positions[i],
						name: (record.name || i) + (recordCount[record.name] === 1 ? "" : " (" + recordCount[record.name] + ")"),
						columns: withColumns ? _self.getColumnOptions(record, formalID) : undefined
					});
				}
			}
		}
		return recordOptions;
	},
	getColumnOptions: function(record, formalID) {
		var _self = this;
		var columnOptions = [];
		if (record && record.positions) {
			for (var i = 0; i < record.positions.length; i++) {
				var column = record.columns[record.positions[i]];
				if (column) {
					if (_self.verifyStructureField(column)) {
						columnOptions.push({
							key: record.positions[i],
							fieldId: column.fieldId,
							name: _self.getColumnName(column, true),
							idStructure: column.idStructure
						});
					} else {
						columnOptions.push({
							key: record.positions[i],
							name: _self.getColumnName(column)
						});
					}
				}
			}
			return columnOptions;
		}
	},
	getFieldColumnOptions: function(jsonLayout, blockId) {
		var columnFields = [];
		var structures = {};
		jsonLayout.structure.map(function(s) {
			structures[s.id] = s.fields;
		});
		var getFieldColumnXBlock = function(blockId) {
			for (var r in jsonLayout.blocks[blockId].records) {
				for (var c in jsonLayout.blocks[blockId].records[r].columns) {
					var column = jsonLayout.blocks[blockId].records[r].columns[c];
					if (column.fieldId && !column.isExecutionDate && !column.isExecutionHour && (column.fieldId+"").match(/DTE/) === null && (column.fieldId+"").match(/HRE/) === null) {
						if (columnFields.indexOf(column.fieldId + "_" + column.idStructure) === -1) {
							columnFields.push(column.fieldId + "_" + column.idStructure);
						}
					}
				}
			}
		};
		if (blockId) {
			getFieldColumnXBlock(blockId);
		} else {
			for (var b in jsonLayout.blocks) {
				getFieldColumnXBlock(b);
			}
		}
		columnFields = columnFields.map(function(cf) {
			var field = structures[cf.split("_")[1]][cf.split("_")[0]];
			return {
				key: cf,
				name: field.label,
				isGeneralField: true,
				type: field.simpleType
			};
		});
		return columnFields;

	},
	organizeJSON: function(layoutJSON) {
		var _self = this;

		//COLOCA DE FORMA CORRECTO LOS ID'S DE ESTRUCTURAS EN LAYOUT VIEJOS
		for (var i = 0; i < layoutJSON.positions.length; i++) {
			var block = layoutJSON.blocks[layoutJSON.positions[i]];
			for (var r = 0; r < block.positions.length; r++) {
				var record = block.records[block.positions[r]];
				var counters = {};
				var countersSpecial = {
					"sf": null,
					"blockTotal": null,
					"recordsTotals": null,
					"f": null,
					"fmf": null,
					"fxf": null,
					"v": null,
					"sp": null,
					"HRE": null,
					"DTE": null,
					"totalsAll": null,
					"initialDateReference": null,
					"finalDateReference": null
				};
				var newPositions = [];
				var newColumns = {};
				var groups = {};
				var newColId = "";
				var newSpedMapping = {};
				for (var c = 0; c < record.positions.length; c++) {

					if (record.columns[record.positions[c]]) {
						var column = JSON.parse(JSON.stringify(record.columns[record.positions[c]]));
						if (column.formula && column.formula.raw) {
							column.formula.raw = column.formula.raw.replace(new RegExp(/BRB_/, "g"), "BRBID_");
							column.formula.raw = column.formula.raw.replace(new RegExp(/BFB_/, "g"), "BFBID_");
							column.formula.raw = column.formula.raw.replace(new RegExp(/BCB_/, "g"), "BCBID_");
							if (column.formula.hana) {
								column.formula.hana = column.formula.hana.replace(new RegExp(/BRB_/, "g"), "BRBID_");
								column.formula.hana = column.formula.hana.replace(new RegExp(/BFB_/, "g"), "BFBID_");
								column.formula.hana = column.formula.hana.replace(new RegExp(/BCB_/, "g"), "BCBID_");
							}
							if (column.formula.outputs) {
								for (var c2 in column.formula.outputs) {
									var outputMetadata = JSON.parse(JSON.stringify(column.formula.outputs[c2]));
									delete column.formula.outputs[c2];
									var outputId = c2.replace(new RegExp(/BRB_/, "g"), "BRBID_");
									outputId = outputId.replace(new RegExp(/BFB_/, "g"), "BFBID_");
									outputId = outputId.replace(new RegExp(/BCB_/, "g"), "BCBID_");
									column.formula.outputs[outputId] = outputMetadata;
									if (column.formula.text) {
										if (outputMetadata.metadata && outputMetadata.metadata.sourceId) {
											var matches = column.formula.text.match(new RegExp("\\[" + outputMetadata.metadata.name + "-BRB" + outputMetadata.metadata.sourceId +
												"\\]", "g"));
											if (matches !== null) {
												for (var m = 0; m < matches.length; m++) {
													var newT = matches[m].replace(new RegExp(/-BRB\d+/, "g"), "");
													newT = newT[0] + outputId.split("BRBID_")[1] + "-" + newT.substring(1);
													column.formula.text = column.formula.text.replace(new RegExp("\\" + matches[m].substring(0, matches[m].length - 1) + "\\]",
														"g"), newT);
												}
											}
										}
										if (outputId.indexOf("BFBID_") !== -1) {
											if (layoutJSON.outputsBFB) {
												var outputSearch = "";
												for (var o = 0; o < layoutJSON.outputsBFB.length; o++) {
													for (var out = 0; out < layoutJSON.outputsBFB[o].outputs.length; out++) {
														if (layoutJSON.outputsBFB[o].outputs[out].id + "" === outputId.split("BFBID_")[1]) {
															outputSearch = layoutJSON.outputsBFB[o].outputs[out].name + "-BFB" + layoutJSON.outputsBFB[o].id;
														}
													}
												}
												console.log(outputSearch)
												matches = column.formula.text.match(new RegExp("\\$" + outputSearch + "\\$", "g"));
												console.log(matches);
												if (matches !== null) {
													for (var m = 0; m < matches.length; m++) {
														var newT = matches[m].replace(new RegExp(/-BFB\d+/, "g"), "");
														newT = "{" + outputId.split("BFBID_")[1] + "-" + newT.substring(1, newT.length - 1) + "}";
														column.formula.text = column.formula.text.replace(new RegExp("\\" + matches[m].substring(0, matches[m].length - 1) + "\\$",
															"g"), newT);
													}
												}
											}
										}
										if (outputId.indexOf("BCBID_") !== -1) {
											if (layoutJSON.outputsBCB) {
												var outputSearch;
												for (var o = 0; o < layoutJSON.outputsBCB.length; o++) {
													for (var out = 0; out < layoutJSON.outputsBCB[o].outputs.length; out++) {
														if (layoutJSON.outputsBCB[o].outputs[out].id + "" === outputId.split("BCBID_")[1]) {
															outputSearch = layoutJSON.outputsBCB[o].outputs[out].name + "-BCB" + layoutJSON.outputsBCB[o].id;
														}
													}
												}

												matches = column.formula.text.match(new RegExp("\\|" + outputSearch + "\\|", "g"));
												if (matches !== null) {
													for (var m = 0; m < matches.length; m++) {
														var newT = matches[m].replace(new RegExp(/-BCB\d+/, "g"), "");
														newT = "{" + outputId.split("BCBID_")[1] + "-" + newT.substring(1, newT.length - 1) + "}";
														column.formula.text = column.formula.text.replace(new RegExp("\\" + matches[m].substring(0, matches[m].length - 1) + "\\|",
															"g"), newT);
													}
												}
											}
										}
									}
								}
							}

							column.formula.originalFormula = column.formula.originalFormula || column.formula.text;
						}
						if (column.fieldId && ((column.fieldId + "").match(new RegExp(/^[0-9]+$/g)) || (column.fieldId + "").match(new RegExp(
							/[0-9]+S[0-9]+C[0-9]+/g)))) {
							if (!counters[column.idStructure]) {
								counters[column.idStructure] = {};
							}
							if (!counters[column.idStructure][column.fieldId]) {
								counters[column.idStructure][column.fieldId] = 0;
							}
							newPositions.push(column.idStructure + "S" + column.fieldId + "C" + counters[column.idStructure][column.fieldId]);
							newColumns[column.idStructure + "S" + column.fieldId + "C" + counters[column.idStructure][column.fieldId]] = column;
							newColumns[column.idStructure + "S" + column.fieldId + "C" + counters[column.idStructure][column.fieldId]].uniqueId = counters[
								column.idStructure][column.fieldId];
							newColId = column.idStructure + "S" + column.fieldId + "C" + counters[column.idStructure][column.fieldId];
							counters[column.idStructure][column.fieldId]++;
						} else {
							var columnId = record.positions[c];
							if ((columnId + "").match(new RegExp(
									/^(HRE|(sp|sf|blockTotal|recordsTotals|f|v|fmf|fxf|initialDateReference|finalDateReference)(\d*NaN)|DTE|totalsAll|initialDateReference|finalDateReference)$/g
								)) && !
								column.formula) {
								if ((columnId + "").match(/\d*NaN/)) {
									columnId = (columnId + "").split(/\d*NaN/)[0];
								}
								for (var counter in countersSpecial) {
									if (columnId === counter) {
										var allCommonIds = [];
										var regex = counter + "[0-9]+$";
										if (countersSpecial[counter] === null) {
											for (var temp = 0; temp < record.positions.length; temp++) {
												if ((record.positions[temp] + "").match(new RegExp(regex, "g"))) {
													allCommonIds.push(parseInt(record.positions[temp].split(counter)[1], 10));
												}
											}
											allCommonIds.sort(function(a, b) {
												return a - b;
											});
											if (allCommonIds.length) {
												countersSpecial[counter] = allCommonIds[allCommonIds.length - 1] + 1;
											} else {
												countersSpecial[counter] = 0;
											}
										}
										newPositions.push(columnId + countersSpecial[counter]);
										newColumns[columnId + countersSpecial[counter]] = column;
										countersSpecial[counter]++;
										break;
									}
								}

							} else {
								newColumns[record.positions[c]] = column;
								newPositions.push(record.positions[c]);
								newColId = record.positions[c];
							}
						}
						if (record.spedMapping) {
							for (var f in record.spedMapping) {
								if (record.spedMapping[f] === record.positions[c]) {
									newSpedMapping[f] = newColId;
								}
							}
						}
						if (layoutJSON.groups && layoutJSON.groups.blocks && layoutJSON.groups.blocks[layoutJSON.positions[i]]) {
							if (layoutJSON.groups.blocks[layoutJSON.positions[i]].records[block.positions[r]] && layoutJSON.groups.blocks[
								layoutJSON.positions[i]].records[
								block.positions[r]].structures) {
								if (layoutJSON.groups.blocks[layoutJSON.positions[i]].records[block.positions[r]].structures[column.idStructure]) {
									if (!groups[column.idStructure]) {
										groups[column.idStructure] = {
											groups: [],
											last_groupID: layoutJSON.groups.blocks[layoutJSON.positions[i]].records[
												block.positions[r]].structures[column.idStructure].last_groupID
										};
									}
									var groupsAll = layoutJSON.groups.blocks[layoutJSON.positions[i]].records[
										block.positions[r]].structures[column.idStructure].groups;

									for (var g = 0; g < groupsAll.length; g++) {
										if (!groups[column.idStructure].groups[g]) {
											groups[column.idStructure].groups[g] = {
												ID: groupsAll[g].ID,
												name: groupsAll[g].name,
												filters: groupsAll[g].filters,
												groupBy: [],
												columnFilters: {},
												groupByDate: groupsAll[g].groupByDate,
												totals: []
											};
										}
										if (groupsAll[g].groupBy.indexOf(parseInt(record.positions[c], 10)) !== -1 || groupsAll[g].groupBy.indexOf(record.positions[c] +
											"") !== -1) {
											groups[column.idStructure].groups[g].groupBy.push(newColId);
										}
										if (groupsAll[g].totals.indexOf(parseInt(record.positions[c], 10)) !== -1 || groupsAll[g].totals.indexOf(record.positions[c] +
											"") !== -1) {
											groups[column.idStructure].groups[g].totals.push(newColId);
										}
										if (groupsAll[g].columnFilters && groupsAll[g].columnFilters[record.positions[c]]) {
											groups[column.idStructure].groups[g].columnFilters[newColId] = groupsAll[g].columnFilters[record.positions[c]];
										}
									}
								}
							}
						}
					}
				}
				record.columns = newColumns;
				record.positions = newPositions;
				record.spedMapping = newSpedMapping;
				var idStructure = [];
				if (!Array.isArray(record.idStructure)) {
					if (!record.idStructure) {
						record.idStructure = [];
					} else if (!isNaN(parseInt(record.idStructure, 10))) {
						record.idStructure = [record.idStructure];
					}

				}
				record.idStructure.map(function(s) {
					if (idStructure.indexOf(s + "") === -1 && idStructure.indexOf(s) === -1) {
						idStructure.push(s);
					}
				});
				record.idStructure = idStructure;
				if (record.orderBy && record.orderBy.columns) {
					var newOrderByColumns = [];
					for (var o = 0; o < record.orderBy.columns.length; o++) {
						if ((record.orderBy.columns[o] + "").match(new RegExp(/^[0-9]+$/g))) {
							var newColumnId = "";
							var regex = "[0-9]+S" + record.orderBy.columns[o] + "C[0-9]+";
							for (var c in newColumns) {
								if ((c + "").match(new RegExp(regex, "g"))) {
									newOrderByColumns.push(c);
									break;
								}
							}
						} else {
							newOrderByColumns.push(record.orderBy.columns[o]);
						}
					}
					record.orderBy.columns = newOrderByColumns;
				}
				if (Object.keys(groups).length) {

					if (layoutJSON.groups && layoutJSON.groups.blocks && layoutJSON.groups.blocks[layoutJSON.positions[i]]) {
						if (layoutJSON.groups && layoutJSON.groups.blocks && layoutJSON.groups.blocks[layoutJSON.positions[i]]) {
							if (layoutJSON.groups.blocks[layoutJSON.positions[i]].records[block.positions[r]] && layoutJSON.groups.blocks[
								layoutJSON.positions[i]].records[
								block.positions[r]].structures) {
								layoutJSON.groups.blocks[layoutJSON.positions[i]].records[
									block.positions[r]].structures = JSON.parse(JSON.stringify(groups));
							}
						}
					}
				}

			}
		}
		//CORRIGE LOS ID'S DE LOS CAMPOS EN EL RELACIONAMENTO
		if (layoutJSON.relations) {
			for (var r = 0; r < layoutJSON.relations.length; r++) {
				for (var k = 0; k < layoutJSON.relations[r].keys.length; k++) {
					var key = layoutJSON.relations[r].keys[k];
					if (key.fatherKey && key.fatherKey.ID && key.fatherKey.idStructure && !isNaN(parseInt(key.fatherKey.ID, 10))) {
						key.fatherKey.id = key.fatherKey.idStructure + "S" + key.fatherKey.ID + "C0";
						var nKey = key.fatherKey.key.split(";");
						nKey[2] = key.fatherKey.id;
						key.fatherKey.key = nKey.join(";");
					}
					if (key.sonKey && key.sonKey.ID && key.sonKey.idStructure && !isNaN(parseInt(key.sonKey.ID, 10))) {
						key.sonKey.id = key.sonKey.idStructure + "S" + key.sonKey.ID + "C0";
						var nKey = key.sonKey.key.split(";");
						nKey[2] = key.sonKey.id;
						key.sonKey.key = nKey.join(";");
					}
				}
			}
		}

	},
	toXML: function(rawFile, layoutJSON) {
		var _self = this;
		var xml = '<?xml version="1.0" ?><dfg>';
		var lines = rawFile.split("\r\n");
		var separator = layoutJSON.separator;
		separator.value = separator.value + String.fromCharCode(8204);
		var index = 0,
			block, record, line, lineTemp, columns;
		for (index; index < lines.length - 1; index++) {
			line = lines[index];
			lineTemp = line.split("&&::");
			block = lineTemp[1].split("&:")[0];
			record = lineTemp[1].split("&:")[1];
			line = lineTemp[0];
			columns = line.split(separator.value);
			if (separator.inFirst) {
				columns.splice(0, 1);
			}
			if (separator.inLast) {
				columns.splice(columns.length - 1, 1);
			}

			for (var pos = 0; pos < layoutJSON.blocks[block].records[record].positions.length; pos++) {
				var position = layoutJSON.blocks[block].records[record].positions[pos];
				if (layoutJSON.blocks[block].records[record].columns[position]) {
					var tagName = _self.getColumnName(layoutJSON.blocks[block].records[record].columns[position], false, true);
					if (tagName) {
						xml += "<" + tagName + ">" + columns[pos] + "</" + tagName + ">";
					}
				}
			}
		}
		xml += "</dfg>";
		return xml;
	},
	toCSV: function(rawfile, layoutJSON) {
		if (typeof layoutJSON === "string") {
			layoutJSON = JSON.parse(layoutJSON);
		}
		var separator = layoutJSON.separator.value;

		var CSV = "\"sep=|\"\n";
		var data = rawfile.split(String.fromCharCode(8204) + separator);
		var values;
		for (var i = 0; i < data.length; i++) {
			if (data[i].indexOf("\r\n") > -1) {
				values = data[i].split("\r\n");
				for (var j = 0; j < values.length; j++) {
					if (!isNaN(Number(values[j]))) {
						values[j] = "=\"" + values[j] + "\"|";
					} else {
						values[j] = "\"" + values[j] + "\"|";
					}

				}
				CSV += values.join("\r\n");
			} else {
				if (!isNaN(Number(data[i]))) {
					CSV += "=\"" + data[i] + "\"|";
				} else {
					CSV += "\"" + data[i] + "\"|";
				}

			}
		} 

		return CSV;
	}

});