sap.ui.controller("app.controllers.xmlEditor.xmlEditorContent", {

	onDataRefactor: function(data) {
		return $.extend(data, this.data);
	},

	onInit: function() {
		var _self = this;
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
						if (!blockId || !recordId || !columnId)
							return;
						var data = _self.formulaDialog.getInnerController().getFormulaData();
						var actualMP = data.blocks[blockId].records[recordId].columns[columnId].formula;
						if (actualMP.idStructure === undefined && !actualMP.label) {
							$('[data-id="' + columnId + '"] .label-wrapper .label-container .field-close').click();

						}

					}
                }, {
					name: i18n('APPLY'),
					click: function() {
						_self.formulaDialog.getInnerController().updateFormulaObject();
						var currentLevel = _self.formulaDialog.getInnerController().currentLevel;
						_self.updateFormulaData(_self.formulaDialog.getInnerController().getFormulaData());
						var column = _self.coreServices.layoutObject.blocks[currentLevel.blockId].records[currentLevel.recordId].columns[currentLevel.columnId];
						if (field)
							field.setLabel(column.formula.label);
						_self.formulaDialog.close();
						_self.coreServices.hasChanged = true;

						// 		_self.initialFocus('#toolbarSecund > div > ul.library-toolbar-items > li:nth-child(3) > button');

					},
					tooltip: i18n('CLICK PRESS CONFIRM')
                }]
			});
			_self.formulaDialog.open();
		}

		_self.coreServices.openFormatDialog = function(blockId, recordId, columnId, isNewRefPeriod) {

			var viewData = {};
			if (blockId) {
				viewData = {
					initLevel: {
						blockId: blockId,
						recordId: recordId,
						columnId: columnId
					}
				};
			}
			_self.formatDialog = $.baseDialog({
				title: i18n('FORMAT'),
				modal: true,
				size: "big",
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
						// 		_self.initialFocus('#toolbarSecund > div > ul.library-toolbar-items > li:nth-child(4) > button');
					}
                }, {
					name: i18n('APPLY'),
					click: function() {
						_self.formatDialog.getInnerController().updateFormatObject();
						_self.updateFormatData(_self.formatDialog.getInnerController().getFormatData());
						_self.formatDialog.close();
						_self.coreServices.hasChanged = true;
						// 		_self.initialFocus('#toolbarSecund > div > ul.library-toolbar-items > li:nth-child(4) > button');
					},
					tooltip: i18n('CLICK PRESS CONFIRM')
                }]
			});
			_self.formatDialog.open();
		}
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
					click: function() {
						_self.fillerDialog.getInnerController().updateFillerObject();
						var fillerData = _self.fillerDialog.getInnerController().getFillerData(true);
						if (!fillerData)
							return;
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
						var data = _self.dfgDialog.getInnerController().getOutputData();
						var output = _self.coreServices.layoutObject.blocks[blockId].records[recordId].columns[columnId].output;
						if (!output.fieldId) {
							$('[data-id="' + columnId + '"] .label-wrapper .label-container .field-close').click();

						}
					}
                }, {
					name: i18n('APPLY'),
					click: function() {
						var outputData = _self.dfgDialog.getInnerController().getOutputData(true);
						if (!outputData)
							return;
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
						// 		_self.initialFocus('#toolbarSecund > div > ul.library-toolbar-items > li:nth-child(2) > button');
					}
                }, {
					name: i18n("APPLY"),
					click: function() {
						var innerCtrl = _self.openGroupsDialog.getInnerController();
						if (innerCtrl.validate()) {
							var groupData = innerCtrl.getGroups();

							if (!_self.coreServices.layoutObject.groups.blocks[groupData.block]) {
								_self.coreServices.layoutObject.groups.blocks[groupData.block] = {
									records: {

									}
								}
							}
							if (!_self.coreServices.layoutObject.groups.blocks[groupData.block].records[groupData.record]) {
								_self.coreServices.layoutObject.groups.blocks[groupData.block].records[groupData.record] = {
									structures: {

									}
								}
							}
							_self.coreServices.layoutObject.groups.blocks[groupData.block].records[groupData.record].structures[groupData.structureId] = {
								groups: groupData.groups,
								last_groupID: groupData.last_groupID
							}
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
						// 		_self.initialFocus('#toolbarSecund > div > ul.library-toolbar-items > li:nth-child(2) > button');
					}

                }]
			});
			_self.openGroupsDialog.open();
		}
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
						// 		_self.initialFocus('#toolbarSecund > div > ul.library-toolbar-items > li.leftButton.library-toolbar-item.first > button');
					}
                }, {
					name: i18n('APPLY'),
					click: function() {

						_self.filtersDialog.getInnerController().updateFiltersObject();
						if (_self.filtersDialog.getInnerController().validateFilters()) {
							console.log(_self.filtersDialog.getInnerController().getFiltersData())
							_self.updateFiltersData(_self.filtersDialog.getInnerController().getFiltersData());
							_self.filtersDialog.close();
							_self.coreServices.hasChanged = true;
						}
						// 		_self.initialFocus('#toolbarSecund > div > ul.library-toolbar-items > li.leftButton.library-toolbar-item.first > button');
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
				size: "big",
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
		}

		_self.coreServices.removeFromOutPutList = function(columnId) {
			_self.removeFromOutPutList(columnId);
		}

		_self.coreServices.deleteCascadeOutputs = function(deletedField) {
			_self.deleteCascadeOutputs(deletedField);
		}

		_self.coreServices.removeFromManualParamList = function(columnId) {
			_self.removeFromManualParamList(columnId);
		}

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
					click: function() {
						_self.updateArchiveCounts(_self.totalsDialog.getInnerController().getTotalSwitches());
						_self.totalsDialog.close();
						_self.coreServices.hasChanged = true;
					},
					tooltip: i18n('CLICK PRESS CONFIRM')
                }]
			});
			_self.totalsDialog.open();
		}

		_self.coreServices.openHideRuleDialog = function(blockId, recordId, columnId) {
			_self.hideRuleDialog = $.baseDialog({
				title: i18n('HIDE RULE'),
				modal: true,
				size: 'medium',
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
						// 		_self.initialFocus('#toolbarSecund > div > ul.library-toolbar-items > li:nth-child(9) > button');
					}

                }, {
					name: i18n('APPLY'),
					click: function() {
						var hidingData = _self.hideRuleDialog.getInnerController().getHideRulesData();
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
									}

								}
							}

							_self.hideRuleDialog.close();
							// 			_self.initialFocus('#toolbarSecund > div > ul.library-toolbar-items > li:nth-child(9) > button');
						}

					},
					tooltip: i18n('CLICK PRESS CONFIRM')
                }]
			});
			_self.hideRuleDialog.open();
		}
		_self.coreServices.openCopyRecordDialog = function(blockId, recordId, columnId) {
			_self.copyRecordDialog = $.baseDialog({
				title: i18n('COPY BLOCK/RECORD'),
				modal: true,
				size: 'medium',
				outerClick: 'disabled',
				viewName: 'app.views.dialogs.copyRecord',
				viewData: {},
				buttons: [{
					name: i18n('CANCEL'),
					isCloseButton: true,
					tooltip: i18n('CLICK PRESS CANCEL'),
					click: function() {
						// 		_self.initialFocus('#toolbarSecund > div > ul.library-toolbar-items > li:nth-child(9) > button');

					}

                }, {
					name: i18n('APPLY'),
					click: function() {
						var dialogCtrl = _self.copyRecordDialog.getInnerController();
						if (!dialogCtrl.validateCopy()) {
							$.baseToast({
								text: i18n("FILL ALL FIELDS"),
								type: 'w'
							});
						} else {
							var copyData = dialogCtrl.getCopyData();
							if (copyData.copyType === 1) {
								var originalBlock = _self.coreServices.layoutObject.blocks[copyData.elementId];
								for (var i in originalBlock.records) {
									delete originalBlock.records[i].format;
									delete originalBlock.records[i].filters;
									delete originalBlock.records[i].rules;
									if (!copyData.copyFields) {
										originalBlock.records[i].columns = {};
										originalBlock.records[i].positions = [];
										originalBlock.records[i].idStructure = Object.keys(_self.coreServices.structure)[0];;
									}
								}
								if (!copyData.copyFilters) {
									delete originalBlock.filters;
								}
								if (!copyData.copyFormats) {
									delete originalBlock.format;
								}
								_self.addBlock(originalBlock);
							} else {
								var originalRecord = _self.coreServices.layoutObject.blocks[copyData.elementId.split(";")[0]].records[copyData.elementId.split(
									";")[1]];
								if (!copyData.copyFields) {
									originalRecord.columns = {};
									originalRecord.positions = [];
									originalRecord.idStructure = Object.keys(_self.coreServices.structure)[0];;

								} else {
									for (var i in originalRecord.columns) {
										delete originalRecord.format;
										delete originalRecord.filters;
									}
								}
								if (!copyData.copyFilters) {
									delete originalRecord.filters;
								}
								if (!copyData.copyFormats) {
									delete originalRecord.format;
								}
								_self.coreServices.addCopyRecord(copyData.elementId.split(";")[0], originalRecord);

							}
							_self.copyRecordDialog.close();
							// 			_self.initialFocus('#toolbarSecund > div > ul.library-toolbar-items > li:nth-child(9) > button');
						}

					},
					tooltip: i18n('CLICK PRESS CONFIRM')
                }]
			});
			_self.copyRecordDialog.open();
		}

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
					click: function() {
						// 		_self.initialFocus('#toolbarSecund > div > ul.library-toolbar-items > li:nth-child(7) > button');
					}
                }, {
					name: i18n('APPLY'),
					click: function() {
						var concatData = _self.concatDialog.getInnerController().getConcatData();
						var column = _self.coreServices.layoutObject.blocks[concatData.block.key].records[concatData.record.key].columns[concatData.field.key];
						_self.updateConcatData(concatData, column);
						_self.removeConcatenatedFields(concatData.columns);
						_self.concatDialog.close();
						// 		_self.initialFocus('#toolbarSecund > div > ul.library-toolbar-items > li:nth-child(7) > button');
					},
					tooltip: i18n('CLICK PRESS CONFIRM')
                }]
			});
			_self.concatDialog.open();
		}

		_self.coreServices.openRelationsDialog = function() {
			_self.relationsDialog = $.baseDialog({
				title: i18n('RECORD RELATIONS'),
				modal: true,
				size: 'big',
				outerClick: 'disabled',
				viewName: 'app.views.dialogs.RecordRelations',
				viewData: {
					// layoutObject: _self.coreServices.layoutObject
				},
				buttons: [{
					name: i18n('CANCEL'),
					isCloseButton: true,
					tooltip: i18n('CLICK PRESS CANCEL')
                }, {
					name: i18n('APPLY'),
					click: function() {
						_self.coreServices.layoutObject.relations = _self.relationsDialog.getInnerController().getRelationChanges();
						_self.relationsDialog.close();
					},
					tooltip: i18n('CLICK PRESS CONFIRM')
                }]
			});
			_self.relationsDialog.open();
		}

		_self.coreServices.totals = {
			records: false,
			blocks: false,
			all: false,
			blockStarter: false
		};
	},

	onAfterRendering: function(html) {
		var controller = this;
		controller.addServices();
		controller.general = html;
		controller.general.test = controller.general.find('#test');
		controller.general.toolbar = controller.general.find('.toolbar');
		controller.general.filter = controller.general.find('.filters');
		controller.general.advancedFilters = controller.general.find('#advanced-filters');
		controller.general.list = controller.general.find('#content-list');
		controller.general.list.listView = controller.general.list.find('#list');
		controller.general.list.loader = controller.general.list.baseLoader({
			modal: true,
		});
		controller.general.leftContent = $('#left-content');
		controller.general.loader = $(".main-content").baseLoader({
			modal: true,
		});
		var params = {
			id: Number.parseInt(window.parameters.id)
		}
		controller.canSaveExecute = false;
		controller.hasChanged = false;
		controller.general.loader.open();
		Data.endpoints.dfg.xmlFile.getFileByID.post(params).success(function(data) {
			controller.coreServices.xmlFileData = data;
			controller.coreServices.filledFieldsArrayOriginal = JSON.parse(data[0].executionData);
			controller.coreServices.filledFieldsArrayOriginal === undefined || controller.coreServices.filledFieldsArrayOriginal === null ?
				controller.coreServices.filledFieldsArrayOriginal = [] : '';
			var params2 = {
				id: controller.coreServices.xmlFileData[0].idLayout,
				structure: true
			}
			Data.endpoints.dfg.layout.read.post(params2).success(function(serviceData) {
				var _isEmited = false;
				var _idVersion = serviceData.internalVersion[serviceData.internalVersion.length - 1].id;
				var _json = serviceData.internalVersion[serviceData.internalVersion.length - 1].json;

				if (JSON.parse(_json).hasOwnProperty('blocks')) {
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
					serviceData.configIdRecord = serviceData.json.configIdRecord === undefined ? 0 : serviceData.json.configIdRecord;
					serviceData.filters = serviceData.json.filters;
					serviceData.outputs = serviceData.json.outputs;
					serviceData.manualParams = serviceData.json.manualParams;
					serviceData.fixedFields = serviceData.json.fixedFields;
				} else {
					serviceData.json = {};
					serviceData.blocks = {
						0: {
							name: "XMLB1",
							records: {
								0: {
									name: "XMLR1",
									columns: {},
									positions: [],
									idStructure: [],
									isDistinct: false
								}
							},
							positions: ["0"]
						}
					};
					serviceData.positions = ["0"];
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
				controller.coreServices.layoutObject = serviceData;
				controller.addManualParams();
				controller.addFixedFields();
				controller.coreServices.layoutObject.idVersion = _idVersion;
				controller.coreServices.layoutObject.structure = serviceData.structure;
				controller.coreServices.initDataStructure(controller.coreServices.layoutObject.structure);
				controller.coreServices.filledFields = 0;
				controller.bindElements();
				var originalKeys = Object.keys(controller.coreServices.filledFieldsArrayOriginal);
				var isNewFile = true;
				originalKeys.map(function(element) {
					isNewFile = !controller.coreServices.filledFieldsArrayOriginal[element].hasOwnProperty("fieldData");
				});
				for (var i = 0; i < controller.coreServices.layoutObject.blocks["0"].records["0"].positions.length; i++) {
					if (controller.coreServices.layoutObject.blocks["0"].records["0"].positions[i] === "newline") {
						controller.coreServices.layoutObject.blocks["0"].records["0"].positions.splice(i, 1);
						i--;
					}
				}
				var params3 = {
					zipParentFileID: data[0].schemaZipID
				}
				Data.endpoints.mdr.SchemasProperties.listSchemasPropertiesBy.post(params3).success(function(data2) {
					controller.coreServices.SchemasProperties = data2;
					controller.coreServices.xmlBasicDataTypes = [
                                "decimal", "float", "double", "integer", "positiveInteger", "negativeInteger", "nonPositiveInteger",
            					"nonNegativeInteger", "long", "int", "short",
                                "byte", "unsignedLong", "unsignedInt", "unsignedShort", "unsignedByte", "dateTime", "date", "gYearMonth",
						"gYear",
            					"duration", "gMonthDay", "gDay",
                                "gMonth", "string", "normalizedString", "token", "language", "NMTOKEN", "NMTOKENS", "Name", "NCName", "ID",
						"IDREFS",
            					"ENTITY", "ENTITIES", "QName",
                                "boolean", "hexBinary", "base64Binary", "anyURI", "notation"
                            ];
					controller.coreServices.findxmlBasicDataType = function(typeName) {
						var length = controller.coreServices.xmlBasicDataTypes.length;
						for (var i = 0; i < length; i++) {
							if (controller.coreServices.xmlBasicDataTypes[i] === typeName) {
								return true;
							}
						}
						return false;
					};
					if (isNewFile) {
						controller.generateXML(data[0].schemaZipID, data[0].schemaFileID);
					} else {
						controller.coreServices.restrictions = JSON.parse(JSON.stringify(controller.coreServices.filledFieldsArrayOriginal));
						controller.renderXML();
					}
					originalKeys.map(function(element, index) {
						if (controller.coreServices.filledFieldsArrayOriginal[element].hasOwnProperty("fieldData")) {
							controller.coreServices.layoutObject.blocks[0].records[0].positions[index] = controller.coreServices.filledFieldsArrayOriginal[
								element].fieldData.id;
						} else {
							controller.coreServices.layoutObject.blocks[0].records[0].positions[index] = undefined;
						}
					});
					controller.canExecute = true;
					controller.general.toolbar.ctrl.enableButton(1);
				}).error(function(error) {
					$.baseToast({
						text: error,
						isError: true
					});
				});
			}).error(function(error) {
				if (error === "unauthorized") {
					if ($.timpUserData.layout.read) {
						window.location = "#/library";
					} else {
						window.location = '/timp/tkb/';
					}
				} else {
					$.baseToast({
						text: error,
						isError: true
					});
				}
				// $.baseToast({
				// 	isError: true,
				// 	text: error
				// });
			});
		}).error(function(error) {
			$.baseToast({
				isError: true,
				text: error
			});
		});
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
						layoutObject.blocks[i].records[j].columns[k].manualParam = {};
						layoutObject.blocks[i].records[j].columns[k].manualParam.id = paramObject.blocks[i].records[j].columns[k].manualParam.id;
						layoutObject.blocks[i].records[j].columns[k].manualParam.label = paramObject.blocks[i].records[j].columns[k].manualParam.label;
						layoutObject.blocks[i].records[j].columns[k].manualParam.type = paramObject.blocks[i].records[j].columns[k].manualParam.type;
						layoutObject.blocks[i].records[j].columns[k].manualParam.length = paramObject.blocks[i].records[j].columns[k].manualParam.length;
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

	addToOutputList: function(column, columnId, recordId, blockId) {
		var _self = this;
		if (!_self.coreServices.layoutObject.outputs)
			_self.coreServices.layoutObject.outputs = [];
		var outputs = _self.coreServices.layoutObject.outputs;
		var output = {
			column: column,
			columnId: columnId,
			recordId: recordId,
			blockId: blockId
		}
		for (var i = 0; i < outputs.length; i++) {
			if (outputs[i].columnId === columnId) {
				outputs[i] = output;
				return;
			}
		}

		_self.coreServices.layoutObject.outputs.push(output);
	},

	removeFromOutPutList: function(columnId) {
		var _self = this;
		if (!_self.coreServices.layoutObject.outputs)
			_self.coreServices.layoutObject.outputs = [];
		var outputs = _self.coreServices.layoutObject.outputs;
		for (var i = 0; i < outputs.length; i++) {
			if (outputs[i].columnId === columnId) {
				outputs.splice(i, 1);
				return;
			}
		}
	},

	deleteCascadeOutputs: function(deletedField) {
		var _self = this;
		if (!_self.coreServices.layoutObject.outputs) {
			_self.coreServices.layoutObject.outputs = [];
		}
		var outputs = _self.coreServices.layoutObject.outputs;
		for (var i = 0; i < outputs.length; i++) {
			let field = outputs[i].column.output;
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
		var _self = this;
		var manualParams = _self.coreServices.layoutObject.manualParams === undefined ? _self.coreServices.layoutObject.manualParams = [] : "";
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
		var _self = this;
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
		var _self = this;
		var fixedFields = _self.coreServices.layoutObject.fixedFields;
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

		_self.coreServices.layoutObject.fixedFields.push(fixedField);
	},

	removeFromFixedFieldList: function(columnId) {
		var _self = this;
		var fixedFields = _self.coreServices.layoutObject.fixedFields;
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
				if (layoutObject.groups) {
					if (layoutObject.groups.blocks[i]) {
						if (layoutObject.groups.blocks[i].records[j]) {
							for (var k in layoutObject.groups.blocks[i].records[j].structures) {
								for (var l = 0; l < layoutObject.groups.blocks[i].records[j].structures[k].groups.length; l++) {
									layoutObject.groups.blocks[i].records[j].structures[k].groups[l].filters = filtersObject.blocks[i].records[j].structures[k].groups[
										l].filters;
								}
							}
						}
					}
				}
			}
		}

	},

	saveData: function(isLibraryLocation) {
		var controller = this;
		var params = {
			id: controller.coreServices.xmlFileData[0].id,
			executionData: JSON.stringify(controller.coreServices.restrictions),
			xmlFileText: controller.coreServices.xmlText
		};
		controller.general.loader.open();
		var bool = true;
		controller.coreServices.updateLayoutObject();
		var length = controller.coreServices.layoutObject.blocks["0"].records["0"].positions.length - 1;
		controller.coreServices.layoutObject.blocks["0"].records["0"].columns.newline = {
			fieldId: null,
			isLineBreak: true
		};
		for (var i = 0; i < length; i++) {
			controller.coreServices.layoutObject.blocks["0"].records["0"].positions.splice((i * 2) + 1, 0, "newline");
		}
		$.each(controller.coreServices.layoutObject.blocks, function(index, element) {
			if (element.name === "") {
				bool = false;
			}
			$.each(element.records, function(index2, element2) {
				if (element2.name === "") {
					bool = false;
				}
			});
		});
		var _dataSend = {
			json: {
				blocks: controller.coreServices.layoutObject.blocks,
				positions: controller.coreServices.layoutObject.positions,
				format: controller.coreServices.layoutObject.format,
				rules: controller.coreServices.layoutObject.rules,
				fields: controller.coreServices.layoutObject.fields,
				groups: controller.coreServices.layoutObject.groups,
				separator: controller.coreServices.layoutObject.separator,
				mapConfig: controller.coreServices.layoutObject.mapConfig,
				relations: controller.coreServices.layoutObject.relations,
				configIdRecord: controller.coreServices.layoutObject.configIdRecord,
				filters: controller.coreServices.layoutObject.filters,
				outputs: controller.coreServices.layoutObject.outputs,
				manualParams: controller.coreServices.layoutObject.manualParams
			},
			id: controller.coreServices.layoutObject.id,
			name: controller.coreServices.layoutObject.name,
			description: controller.coreServices.layoutObject.description,
			idVersion: controller.coreServices.layoutObject.idVersion,
			internalVersion: controller.coreServices.layoutObject.internalVersion,
			legalVersion: controller.coreServices.layoutObject.legalVersion
		};
		var idVersion = _dataSend.idVersion;
		var hasInitDate = true;
		_dataSend.internalVersion.forEach(function(version) {
			if (version.id === idVersion) {
				if (!version.validityStart) {
					hasInitDate = false;
					return;
				}
			}
		});
		for (var i = 0; i < _dataSend.json.blocks["0"].records["0"].positions.length; i++) {
			if (_dataSend.json.blocks["0"].records["0"].positions[i] === undefined) {
				_dataSend.json.blocks["0"].records["0"].positions.splice(i, 1);
				i--;
			}
			if (_dataSend.json.blocks["0"].records["0"].positions[i] === "newline" && _dataSend.json.blocks["0"].records["0"].positions[i + 1] ===
				"newline") {
				_dataSend.json.blocks["0"].records["0"].positions.splice(i, 1);
				i--;
			}
		}
		if (!hasInitDate) {
			$.baseToast({
				text: i18n("DFG102012"),
				isError: true
			});
			return;
		}
		if (bool) {
			Data.endpoints.dfg.layout.update.post(_dataSend).success(function(serviceData) {
				controller.coreServices.hasChanged = false;
				Data.endpoints.dfg.xmlFile.updateDigitalFile.post(params).success(function(data) {
					$.baseToast({
						isSuccess: true,
						text: i18n('FILE SAVED SUCCESSFULLY')
					});
					controller.hasChanged = false;
					controller.general.toolbar.ctrl.disableButton(0);
					if (isLibraryLocation) {
						controller.saveBeforeLibraryDialog.close();
						window.location = "#/library";
					}
					controller.general.loader.close();
				}).error(function(error) {
					if (isLibraryLocation) {
						controller.saveBeforeLibraryDialog.close();
					}
					controller.general.loader.close();
					$.baseToast({
						isError: true,
						text: error
					});
				});
				// $.baseToast({
				// 	text: i18n['DFG1010022'],
				// 	isSuccess: true
				// });
			}).error(function(error) {
				controller.general.loader.close();
				if (isLibraryLocation) {
					controller.saveBeforeLibraryDialog.close();
				}
				$.baseToast({
					isError: true,
					text: error
				});
			});
		} else {
			$.baseToast({
				text: i18n('NO NAMES'),
				isSuccess: false
			});
		}
	},

	updateLayoutObject: function() {
		var _self = this;
		// layout is default before proved otherwise
		_self.coreServices.layoutObject.isDefault = true;
		// Get all updated data before Save
		var layoutObject = _self.coreServices.layoutObject;
		//part of the rules 
		if (typeof(_self.coreServices.rulesObj) !== "undefined") {
			layoutObject.blocks["0"].records["0"].rules = {};
			$.each(_self.coreServices.rulesObj, function(index, val) {
				var name = Object.keys(val)[0];
				layoutObject.blocks["0"].records["0"].rules[name] = val[name];
			});
		}
		// besides putting rule to each record, I need to add an array with the rule ids 
		// to send to bre  
		if (typeof(_self.coreServices.rulesObj) !== "undefined") {
			layoutObject.rules = $.map(_self.coreServices.rulesObj, function(val) {
				return parseInt(Object.keys(val)[0]);
			});
			$.unique(layoutObject.rules);
		}
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
				if (newBlockId === i) {
					found = false;
				}
			}
		}
		return newBlockId + "";
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

	bindElements: function() {
		var controller = this;
		controller.renderToolbar();
		controller.general.saveButton = $(".saveButton");
		controller.general.executeButton = $(".executeButton");
	},

	findD: function(deletedFiles, fileName) {
		for (var i = 0; i < deletedFiles.length; i++) {
			var element = deletedFiles[i];
			if (element.innerText.trim() === fileName) {
				return true;
			}
			return false;
		}
	},

	renderList: function(text) {
		var controller = this;
		if (text !== undefined) {
			text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/ /g, '&nbsp;').replace(/\n/g, '<br />');
			var counter = 0;
			controller.coreServices.restrictions = {};
			controller.coreServices.xmlText = "";
			while (text.indexOf("**") !== -1) {
				var val1 = text.indexOf("**");
				var temp1 = text.substr(0, val1);
				var temp2 = text.substr(val1 + 2);
				var val2 = temp2.indexOf("**");
				var temp3 = temp2.substr(0, val2);
				temp2 = temp2.substring(val2 + 2);
				text = temp1 +
					"<div id=\"Field" + counter +
					"\" class=\"field-list-wrapper register-fields ui-sortable ui-droppable\"><div class=\"field-list-label\"><div class=\"draghere\">" +
					i18n("DROP FIELDS") + "</div></div></div>" + temp2;
				controller.coreServices.restrictions["Field" + counter] = {
					restriction: temp3
				};
				counter++;
			}
			var keys = Object.keys(controller.coreServices.restrictions);
			controller.coreServices.xmlText = text;
			keys.map(function(element) {
				controller.coreServices.xmlText = controller.coreServices.xmlText.replace("<div id=\"" + element +
					"\" class=\"field-list-wrapper register-fields ui-sortable ui-droppable\"><div class=\"field-list-label\"><div class=\"draghere\">" +
					i18n("DROP FIELDS") + "</div></div></div>", element);
			});
			text = "&lt;?xml version=\"1.0\" encoding=\"UTF-8\"?&gt;" + text;
			controller.coreServices.xmlText = "&lt;?xml version=\"1.0\" encoding=\"UTF-8\"?&gt;" + controller.coreServices.xmlText;
		} else {
			controller.coreServices.xmlText = text = "No elements are defined in this schema.";
		}
		controller.general.list.listView.empty();
		controller.general.list.listView.append(text);
		controller.general.fieldList = controller.general.find('.field-list-wrapper');
		controller.general.fieldList.droppable({
			accept: '.field-wrapper',
			hoverClass: 'droppable-active',
			activeClass: 'droppable-active',
			drop: function(e, ui) {
				var field = $(ui.draggable).data();
				if ($(ui.draggable).find('.field-label')[0]) {
					field.label = $(ui.draggable).find('.field-label')[0].innerHTML;
				}
				var target = $(e.target);
				controller.buildField(field, target, false);
				controller._sortableFields();
				$('.record-field-wrapper').attr('tabindex', 0);
				$('#list .field-label').off('click');
				$('.icon.field-close').attr('tabindex', 0);
				$('.icon.field-close').css('visibility', 'visible');
				$('.icon.field-close').keydown(function(ev) {
					if (ev.keyCode === 32 || ev.keyCode === 13) {
						this.click();
					}
				});
				$('.icon.field-close').off('click');
				$('.icon.field-close').on("click", function(ev) {
					controller.removeField(ev.target.parentNode.parentNode.parentNode.parentNode.id, ev.target.parentNode.parentNode.parentNode);
				});
				var originalKeys = Object.keys(controller.coreServices.filledFieldsArrayOriginal);
				var actualKeys = Object.keys(controller.coreServices.restrictions);
				var isSame = (originalKeys.length === actualKeys.length);
				if (isSame) {
					originalKeys.map(function(element) {
						if (controller.coreServices.filledFieldsArrayOriginal[element].hasOwnProperty("fieldData") && controller.coreServices.restrictions[
							element].hasOwnProperty("fieldData")) {
							controller.canExecute = true;
							if (controller.coreServices.filledFieldsArrayOriginal[element].fieldData.fieldId !== controller.coreServices.restrictions[
									element]
								.fieldData.fieldId ||
								controller.coreServices.filledFieldsArrayOriginal[element].fieldData.idStructure !== controller.coreServices.restrictions[
									element].fieldData.idStructure) {
								isSame = false;
							}
						} else {
							if (controller.coreServices.filledFieldsArrayOriginal[element].hasOwnProperty("fieldData") || controller.coreServices.restrictions[
								element].hasOwnProperty("fieldData")) {
								isSame = false;
							}
						}
					});
				}
				if (!isSame) {
					controller.coreServices.hasChanged = true;
					controller.general.toolbar.ctrl.enableButton(0);
					controller.canExecute = true;
					controller.general.toolbar.ctrl.enableButton(1);
				} else {
					controller.coreServices.hasChanged = false;
					controller.general.toolbar.ctrl.disableButton(0);
					controller.canExecute = false;
					controller.general.toolbar.ctrl.disableButton(1);
				}
				if (target.context.children.length > 1) {
					$("#" + target.context.id).droppable("disable");
				}
			}
		});
		controller.general.list.listView.css("top", "90px");
		controller.general.list.listView.css("left", "3.5%");
		controller.general.list.listView.css("right", "3.5%");
		controller.general.list.listView.css("width", "96.5%");
		controller.general.list.listView.css("position", "absolute");
		controller.general.list.listView.css("display", "inline-block");
		controller.general.list.listView.css("background", "90px");
		controller.general.list.loader.close();
	},

	renderXML: function() {
		var controller = this;
		controller.general.loader.close();
		controller.general.list.loader.open();
		var text = controller.coreServices.xmlFileData[0].xmlFileText;
		var keys = Object.keys(JSON.parse(controller.coreServices.xmlFileData[0].executionData));
		controller.coreServices.xmlText = text;
		keys.map(function(element) {
			text = text.replace(element, "<div id=\"" + element +
				"\" class=\"field-list-wrapper register-fields ui-sortable ui-droppable\"><div class=\"field-list-label\"><div class=\"draghere\">" +
				i18n("DROP FIELDS") + "</div></div></div>");
		});
		controller.general.list.listView.empty();
		controller.general.list.listView.append(text);
		controller.general.fieldList = controller.general.find('.field-list-wrapper');
		controller.general.fieldList.droppable({
			accept: '.field-wrapper',
			hoverClass: 'droppable-active',
			activeClass: 'droppable-active',
			drop: function(e, ui) {
				var field = $(ui.draggable).data();
				if ($(ui.draggable).find('.field-label')[0]) {
					field.label = $(ui.draggable).find('.field-label')[0].innerHTML;
				}
				var target = $(e.target);
				controller.buildField(field, target, false);
				controller._sortableFields();
				$('.record-field-wrapper').attr('tabindex', 0);
				$('#list .field-label').off('click');
				$('.icon.field-close').attr('tabindex', 0);
				$('.icon.field-close').css('visibility', 'visible');
				$('.icon.field-close').keydown(function(ev) {
					if (ev.keyCode === 32 || ev.keyCode === 13) {
						this.click();
					}
				});
				$('.icon.field-close').off('click');
				$('.icon.field-close').on("click", function(ev) {
					controller.removeField(ev.target.parentNode.parentNode.parentNode.parentNode.id, ev.target.parentNode.parentNode.parentNode);
				});
				var originalKeys = Object.keys(controller.coreServices.filledFieldsArrayOriginal);
				var actualKeys = Object.keys(controller.coreServices.restrictions);
				var isSame = (originalKeys.length === actualKeys.length);
				if (isSame) {
					originalKeys.map(function(element) {
						if (controller.coreServices.filledFieldsArrayOriginal[element].hasOwnProperty("fieldData") && controller.coreServices.restrictions[
							element].hasOwnProperty("fieldData")) {
							controller.canExecute = true;
							if (controller.coreServices.filledFieldsArrayOriginal[element].fieldData.fieldId !== controller.coreServices.restrictions[
									element]
								.fieldData.fieldId ||
								controller.coreServices.filledFieldsArrayOriginal[element].fieldData.idStructure !== controller.coreServices.restrictions[
									element].fieldData.idStructure) {
								isSame = false;
							}
						} else {
							if (controller.coreServices.filledFieldsArrayOriginal[element].hasOwnProperty("fieldData") || controller.coreServices.restrictions[
								element].hasOwnProperty("fieldData")) {
								isSame = false;
							}
						}
					});
				}
				if (!isSame) {
					controller.coreServices.hasChanged = true;
					controller.general.toolbar.ctrl.enableButton(0);
					controller.canExecute = true;
					controller.general.toolbar.ctrl.enableButton(1);
				} else {
					controller.coreServices.hasChanged = false;
					controller.general.toolbar.ctrl.disableButton(0);
					controller.canExecute = false;
					controller.general.toolbar.ctrl.disableButton(1);
				}
				if (target.context.children.length > 1) {
					$("#" + target.context.id).droppable("disable");
				}
			}
		});
		controller.general.list.listView.css("top", "90px");
		controller.general.list.listView.css("left", "3.5%");
		controller.general.list.listView.css("right", "3.5%");
		controller.general.list.listView.css("width", "96.5%");
		controller.general.list.listView.css("position", "absolute");
		controller.general.list.listView.css("display", "inline-block");
		controller.general.list.listView.css("background", "90px");
		keys.map(function(element) {
			var target = $('#' + element);
			if (controller.coreServices.filledFieldsArrayOriginal[element].hasOwnProperty("fieldData")) {
				var fieldData = controller.coreServices.filledFieldsArrayOriginal[element].fieldData;
				fieldData.hasOwnProperty("fieldId") ? fieldData.id = fieldData.fieldId : "";
				fieldData.hasOwnProperty("idStructure") ? fieldData.idstructure = fieldData.idStructure : "";
				controller.buildField(fieldData, target, true);
				target.droppable("disable");
			}
		});
		controller.general.list.loader.close();
	},
	buildField: function(field, ele, isLoadData) {
		var _self = this;
		var fieldData = {};
		var currentColumns = _self.coreServices.layoutObject.blocks["0"].records["0"].columns;
		var currentColumnsParam = _self.coreServices.layoutObject.blocks["0"].records["0"].columns;
		var id = ele[0].id.replace("Field", "");
		if (typeof field.id === "string") {
			if (field.id === 'formula' || field.id.search("fx") !== -1) {
				fieldData.id = "fx" + id;
				fieldData.label = i18n('FORMULA') + ' ' + fieldData.id;
				fieldData.iconFont = 'Finance-and-Office';
				fieldData.icon = 'function';
				currentColumns[fieldData.id] === undefined ? currentColumns[fieldData.id] = {
					fieldId: null,
					formula: {}
				} : "";
			} else if (field.id === 'recordId' || field.id.search("recordId") !== -1) {
				fieldData.id = field.id + id;
				fieldData.label = i18n('RECORDID');
				fieldData.iconFont = 'Finance-and-Office';
				fieldData.icon = 'tableview';
				currentColumns[fieldData.id] = {
					recordId: {}
				};
			} else if (field.id === "filler" || field.id.search("f00") !== -1) {
				fieldData.id = "f00" + id;
				fieldData.label = i18n("FILLER") + ' ' + fieldData.id;
				fieldData.iconFont = 'File-and-Folders';
				fieldData.icon = 'fullbox';
				currentColumns[fieldData.id] === undefined ? currentColumns[fieldData.id] = {
					fieldId: null,
					filler: {}
				} : "";
			} else if (field.id === 'manualParam' || field.id.search("m00") !== -1) {
				fieldData.id = "m00" + id;
				fieldData.label = i18n("PARAMETRO") + ' ' + fieldData.id;
				fieldData.iconFont = 'Formatting-and-Tool';
				fieldData.icon = 'textandtext';
				currentColumns[fieldData.id] === undefined ? currentColumns[fieldData.id] = {
					fieldId: null,
					manualParam: {}
				} : "";
			} else if (field.id === 'fixedField' || field.id.search("fxf00") !== -1) {
				fieldData.id = "fxf00" + id;
				fieldData.label = i18n("FIXED FIELD") + ' ' + fieldData.id;
				fieldData.iconFont = 'Sign-and-Symbols';
				fieldData.icon = 'locked';
				currentColumns[fieldData.id] === undefined ? currentColumns[fieldData.id] = {
					fieldId: null,
					fixedField: {}
				} : "";
			} else if (field.id === 'fixedManualField' || field.id.search("fmf00") !== -1) {
				fieldData.id = "fmf00" + id;
				fieldData.label = i18n("FIXED MANUAL FIELD") + ' ' + fieldData.id;
				fieldData.iconFont = 'Display-and-Setting';
				fieldData.icon = 'orderedlist';
				currentColumns[fieldData.id] === undefined ? currentColumns[fieldData.id] = {
					fieldId: null,
					fixedManualField: {}
				} : "";
			} else if (field.id === "version" || field.id.search("v00") !== -1) {
				fieldData.id = "v00" + id;
				fieldData.label = i18n("VERSION") + ' ' + fieldData.id;
				currentColumns[fieldData.id] === undefined ? currentColumns[fieldData.id] = {
					fieldId: null,
					version: {}
				} : "";
			} else if (field.id === "referencePeriod" || field.id.search("sp00") !== -1) {
				fieldData.id = "sp00" + id;
				fieldData.label = i18n("REFERENCE PERIOD") + ' ' + (id === 0 ? '' : id);
				currentColumns[fieldData.id] === undefined ? currentColumns[fieldData.id] = {
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
				} : "";
			} else if (field.id === "newline") {
				fieldData.id = field.id;
				fieldData.label = i18n("NEWLINE");
				currentColumns[fieldData.id] === undefined ? currentColumns[fieldData.id] = {
					fieldId: null,
					isLineBreak: true
				} : "";
			} else if (field.id == 'blockTotal') {
				fieldData.id = field.id;
				fieldData.label = i18n('BLOCKTOTAL');
				currentColumns[fieldData.id] === undefined ? currentColumns[fieldData.id] = {
					fieldId: null,
					isBlocksTotal: true
				} : "";
			} else if (field.id === 'recordsTotals') {
				fieldData.id = field.id;
				fieldData.label = i18n('RECORDTOTAL');
				currentColumns[fieldData.id] === undefined ? currentColumns[fieldData.id] = {
					fieldId: null,
					isRecordsTotals: true
				} : "";
			} else if (field.id === 'initialDateReference') {
				fieldData.id = field.id;
				fieldData.label = i18n('INITDATEREFERENCE');
				currentColumns[fieldData.id] === undefined ? currentColumns[fieldData.id] = {
					fieldId: null,
					isInitialDateReference: true
				} : "";
			} else if (field.id === 'DTE') {
				fieldData = {
					id: 'DTE',
					label: i18n('DT_EXECUCAO')
				};
				currentColumns[fieldData.id] === undefined ? currentColumns[fieldData.id] = {
					fieldId: fieldData.id
				} : "";
			} else if (field.id === 'HRE') {
				fieldData = {
					id: 'HRE',
					label: i18n('HR_EXECUCAO')
				};
				currentColumns[fieldData.id] === undefined ? currentColumns[fieldData.id] = {
					fieldId: fieldData.id
				} : "";
			} else if (field.id === 'finalDateReference') {
				fieldData.id = field.id;
				fieldData.label = i18n('FINALDATEREFERENCE');
				currentColumns[fieldData.id] === undefined ? currentColumns[fieldData.id] = {
					fieldId: null,
					isFinalDateReference: true
				} : "";
			} else if (field.id === 'output' || field.id.search("out00") !== -1) {
				fieldData.id = 'out00' + id;
				fieldData.label = i18n('OUTPUT') + " " + fieldData.id;
				fieldData.iconFont = 'DataManager';
				fieldData.icon = 'downloadtodataset';
				currentColumns[fieldData.id] === undefined ? currentColumns[fieldData.id] = {
					fieldId: null,
					isDFGOutput: true,
					output: {
						fieldId: null,
						idStructure: null,
						isFormula: null
					}
				} : "";
			} else if (field.id === 'totalsAll') {
				fieldData.id = field.id;
				fieldData.label = i18n("TOTALALL");
				currentColumns[fieldData.id] === undefined ? currentColumns[fieldData.id] = {
					fieldId: null,
					isTotalsAll: true
				} : "";
			} else if (field.id === 'blockStarter') {
				fieldData.id = field.id;
				fieldData.label = i18n("BLOCKSTARTER");
				currentColumns[fieldData.id] === undefined ? currentColumns[fieldData.id] = {
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
				} : "";
			}
		} else {
			var currStructure = field.idstructure;
			if ((currStructure !== null && currStructure !== undefined && currStructure !== "") && Object.keys(_self.coreServices.layoutObject.blocks[
				"0"].records["0"].columns).length === 0) {
				_self.coreServices.layoutObject.blocks["0"].records["0"].idStructure = [];
				_self.coreServices.layoutObject.blocks["0"].records["0"].idStructure.push(currStructure);
			} else {
				if ((currStructure !== null && currStructure !== undefined && currStructure !== "") && _self.coreServices.layoutObject.blocks["0"].records[
					"0"].idStructure.indexOf(currStructure) === -1) {
					_self.coreServices.layoutObject.blocks["0"].records["0"].idStructure.push(currStructure);
				}
			}
			if (field.type === "BRB:OUTPUT") {
				var allOutputs = _self.coreServices.layoutObject.blocks["0"].records["0"].outputs;
				if (allOutputs === undefined) {
					allOutputs = [];
				}
				var idOutput = "O00" + id;
				allOutputs.push(idOutput);
				fieldData = _self.coreServices.outputs[field.id];
				fieldData.label = field.label;
				fieldData.outputId = fieldData.id;
				fieldData.id = idOutput;
				fieldData.isBRBOutput = true;
				currentColumns[idOutput] === undefined ? currentColumns[idOutput] = {
					output: fieldData
				} : "";

				_self.coreServices.layoutObject.blocks["0"].records["0"].outputs = allOutputs;
			} else if (field.type === "TCC_Output") {
				var allOutputs = _self.coreServices.layoutObject.blocks["0"].records["0"].outputs;
				if (allOutputs === undefined) {
					allOutputs = [];
				}
				var idOutput = "TCC_00" + id;
				allOutputs.push(idOutput);
				fieldData.label = field.label;
				fieldData.id = idOutput;
				currentColumns[idOutput] === undefined ? currentColumns[idOutput] = {
					fieldId: null,
					isTCCOutput: true,
					label: fieldData.label,
					id: idOutput,
					output: {
						outputId: field.id
					}
				} : "";
				_self.coreServices.layoutObject.blocks["0"].records["0"].outputs = allOutputs;
			} else {
				fieldData = _self.coreServices.structure[currStructure].fields[field.id];
				currentColumns[fieldData.id] === undefined ? currentColumns[fieldData.id] = {
					fieldId: fieldData.id,
					idStructure: fieldData.idStructure
				} : "";
			}
		}

		var newField = _self.loadField(ele, fieldData);

		_self.coreServices.layoutObject.blocks["0"].records["0"].positions[parseInt(id)] = fieldData.id;
		_self._sortableFields();
		if (!isLoadData) {
			_self.coreServices.restrictions[ele[0].id].fieldData = newField.getData().fieldData;
			if (field.type !== "BRB:OUTPUT" && field.type !== "TCC_Output") {
				_self.coreServices.layoutObject.fields[fieldData.id] = fieldData;
			} else {
				_self.coreServices.updateLayoutObject();
			}
			if (currentColumns[fieldData.id].formula) {
				_self.coreServices.updateLayoutObject();
				_self.coreServices.openFormulaDialog("0", "0", fieldData.id, true, newField);
			}
			if (currentColumns[fieldData.id].hasOwnProperty("recordId")) {
				_self.coreServices.updateLayoutObject();
				if (_self.coreServices.layoutObject.configIdRecord === undefined || _self.coreServices.layoutObject.configIdRecord === 0) {
					_self.coreServices.openIdRecordDialog("0", "0", fieldData.id, newField, true);
				} else {
					newField.setIdRecordConfig(_self.coreServices.layoutObject.configIdRecord);
				}
			}
			if (currentColumns[fieldData.id].filler) {
				_self.coreServices.updateLayoutObject();
				_self.coreServices.openFillerDialog("0", "0", fieldData.id, newField);
			}

			if (currentColumns[fieldData.id].isDFGOutput) {
				_self.coreServices.updateLayoutObject();
				_self.coreServices.openDfgOutputDialog("0", "0", fieldData.id, newField);
			}

			if (currentColumnsParam[fieldData.id].manualParam) {
				_self.coreServices.updateLayoutObject();

				_self.coreServices.openParamDialog("0", "0", fieldData.id, newField);
			}
			if (currentColumns[fieldData.id].fixedField) {
				_self.coreServices.updateLayoutObject();
				_self.coreServices.openFixedFieldDialog("0", "0", fieldData.id, newField);
			}
			if (currentColumns[fieldData.id].fixedManualField) {
				_self.coreServices.updateLayoutObject();
				_self.coreServices.openFixedManualFieldDialog("0", "0", fieldData.id, newField, true);
			}
			if (currentColumns[fieldData.id].version) {
				_self.coreServices.updateLayoutObject();
				_self.coreServices.openVersionDialog("0", "0", fieldData.id);
			}

			if (currentColumns[fieldData.id].isReferencePeriod || fieldData.id === "DTE" || fieldData.id === "HRE") {
				_self.coreServices.updateLayoutObject();
				_self.coreServices.openFormatDialog("0", "0", fieldData.id, true);
			}
		}

		$('.record-field-wrapper').attr('tabindex', 0);
		$('.icon.field-close').attr('tabindex', 0);
		$('.icon.field-close').css('visibility', 'visible');
		$('.icon.field-close').keydown(function(ev) {
			if (ev.keyCode == 32 || ev.keyCode == 13) {
				this.click();
			}
		});
		$('.icon.field-close').off('click');
		$('.icon.field-close').on("click", function(ev) {
			_self.removeField(ev.target.parentNode.parentNode.parentNode.parentNode.id, ev.target.parentNode.parentNode.parentNode);
		});
		return newField;
	},

	loadField: function(target, fieldData) {
		var _self = this;
		var newField = $(target).bindDFGFieldUnit({
			fieldData: fieldData,
			blockId: "0",
			recordId: "0",
			services: {}
		});
		//this.columns[fieldData.id] = newField;
		return newField;
	},

	_sortableFields: function() {
		var _self = this;
		_self.general.fieldList.sortable({
			helper: function(e, ui) {
				var _clone = $(ui).html();
				var holder = $('<div>').addClass('field-sortable-helper').addClass('record-field-wrapper').width($(ui).outerWidth());
				holder.append(_clone);
				this.holder = holder;
				return holder;
			},
			items: '.record-field-wrapper',
			containment: _self.general.fieldList,
			placeholder: 'record-field-placeholder'
		});
	},

	removeField: function(fieldID, view) {
		var _self = this;
		var canDelete = true;
		var fieldDataID = _self.coreServices.restrictions[fieldID].fieldData.id;
		var field = _self.coreServices.layoutObject.blocks["0"].records["0"].columns[fieldDataID];
		var id = parseInt(fieldID.replace("Field", ""));
		if (canDelete) {
			view.remove();
			delete _self.coreServices.restrictions[fieldID].fieldData;
			_self.coreServices.layoutObject.blocks["0"].records["0"].positions[id] = undefined;
			$("#" + fieldID).droppable("enable");
			var originalKeys = Object.keys(_self.coreServices.filledFieldsArrayOriginal);
			var actualKeys = Object.keys(_self.coreServices.restrictions);
			var isSame = (originalKeys.length === actualKeys.length);
			if (isSame) {
				originalKeys.map(function(element) {
					if (_self.coreServices.filledFieldsArrayOriginal[element].hasOwnProperty("fieldData") && _self.coreServices.restrictions[element].hasOwnProperty(
						"fieldData")) {
						_self.canExecute = true;
						if (_self.coreServices.filledFieldsArrayOriginal[element].fieldData.fieldId !== _self.coreServices.restrictions[element].fieldData
							.fieldId ||
							_self.coreServices.filledFieldsArrayOriginal[element].fieldData.idStructure !== _self.coreServices.restrictions[element].idStructure
						) {
							isSame = false;
						}
					} else {
						if (_self.coreServices.filledFieldsArrayOriginal[element].hasOwnProperty("fieldData") || _self.coreServices.restrictions[element]
							.hasOwnProperty(
								"fieldData")) {
							isSame = false;
						}
					}
				});
			}
			if (field) {
				if (field.fieldId) {
					_self.coreServices.deleteCascadeOutputs({
						blockId: "0",
						recordId: "0",
						fieldId: field.fieldId
					});
				}
				if (field.isDFGOutput) {
					_self.coreServices.removeFromOutPutList(fieldDataID);
				}
				if (field.manualParam) {
					_self.coreServices.removeFromManualParamList(fieldDataID);
				}
				delete _self.coreServices.layoutObject.blocks[0].records[0].columns[fieldDataID];
				delete _self.coreServices.layoutObject.fields[fieldDataID];
				var allOutputs = _self.coreServices.layoutObject.blocks[0].records[0].outputs;
				if (allOutputs !== undefined) {
					for (var i = 0; i < allOutputs.length; i++) {
						if (allOutputs[i] === fieldDataID) {
							_self.coreServices.layoutObject.blocks[0].records[0].outputs.splice(i, 1);
							break;
						}
					}
				}
			}
			if (!isSame) {
				_self.coreServices.hasChanged = true;
				_self.general.toolbar.ctrl.enableButton(0);
				_self.canExecute = true;
				_self.general.toolbar.ctrl.enableButton(1);
			} else {
				_self.coreServices.hasChanged = false;
				_self.general.toolbar.ctrl.disableButton(0);
				_self.canExecute = false;
				_self.general.toolbar.ctrl.disableButton(1);
			}
		}
	},

	renderToolbar: function() {
		var controller = this;
		controller.general.toolbar.empty();
		controller.general.toolbar.ctrl = controller.general.toolbar.bindBaseLibraryToolbar({
			leftButtons: [{
				onPress: function() {
					controller.saveData(false);
				},
				enabled: controller.hasChanged,
				icon: "floppydisc",
				iconFont: "Finance-and-Office",
				class: "saveButton",
				tooltip: i18n('CLICK PRESS') + i18n('TO') + " " + i18n('SAVE'),
				text: i18n('SAVE')
			}, {
				onPress: function() {
					controller.saveBeforeExecutorDialog = $.baseDialog({
						title: i18n('SYSTEM ALERT'),
						modal: true,
						size: "small",
						outerClick: 'disabled',
						viewName: "app.views.dialogs.Alert",
						cssClass: "dfg-alert",
						viewData: {
							text: i18n['DFG02008']
						},
						buttons: [{
							name: i18n('NO'),
							isCloseButton: true,
							click: function() {
								window.location = "#/xmlExecutor?id=" + window.parameters.id;
							},
							tooltip: i18n('CLICK PRESS CANCEL')
                            }, {
							name: i18n('YES'),
							click: function() {
								controller.saveData(false);
								window.location = "#/xmlExecutor?id=" + window.parameters.id;
							},
							tooltip: i18n('CLICK PRESS CONFIRM')
                        }]
					});
					if (controller.hasChanged) {
						controller.saveBeforeExecutorDialog.open();
					} else {
						window.location = "#/xmlExecutor?id=" + window.parameters.id;;
					}
				},
				enabled: controller.canSaveExecute,
				icon: "play",
				iconFont: "Media",
				class: "executeButton",
				tooltip: i18n('CLICK PRESS') + i18n('TO') + " " + i18n('EXECUTE'),
				text: i18n('EXECUTE')
			}],
			rightButtons: [{
				text: i18n('GO TO LIBRARY'),
				tooltip: i18n('GO TO LIBRARY TOOLTIP'),
				onPress: function() {
					controller.saveBeforeLibraryDialog = $.baseDialog({
						title: i18n('SYSTEM ALERT'),
						modal: true,
						size: "small",
						outerClick: 'disabled',
						viewName: "app.views.dialogs.Alert",
						cssClass: "dfg-alert",
						viewData: {
							text: i18n['DFG02008']
						},
						buttons: [{
							name: i18n('NO'),
							isCloseButton: true,
							click: function() {
								window.location = "#/library";
							},
							tooltip: i18n('CLICK PRESS CANCEL')
                            }, {
							name: i18n('YES'),
							click: function() {
								controller.saveData(true);
							},
							tooltip: i18n('CLICK PRESS CONFIRM')
                        }]
					});
					if (controller.hasChanged) {
						controller.saveBeforeLibraryDialog.open();
					} else {
						window.location = "#/library";
					}
				},
				isButton: true,
				iconFont: "Sign-and-Symbols",
				icon: "toright",
				enabled: true
            }],
			hideGrid: true
		});
	},

	getLockFile: function(id, action) {
		var _self = this;
		this.getLock({
			id: id,
			objectType: 'ATR::XMLFile',
			callback: function(_data) {
				if (_data.response === false) {
					window.location = "#xmlSchemasList?id=" + id;
				} else {
					_self.coreServices.lock = _data.controller;
					action();
				}
			}
		});
	},

	generateXML: function(zipParentFileID, schemaID) {
		var controller = this;
		controller.general.loader.close();
		controller.general.list.loader.open();
		// 		var params = {
		// 			zipParentFileID: zipParentFileID
		// 		};
		// 		Data.endpoints.mdr.SchemasProperties.listSchemasPropertiesBy.post(params).success(function(data) {
		// 			controller.coreServices.SchemasProperties = data;
		// 			controller.coreServices.xmlBasicDataTypes = [
		//                     "decimal", "float", "double", "integer", "positiveInteger", "negativeInteger", "nonPositiveInteger",
		// 					"nonNegativeInteger", "long", "int", "short",
		//                     "byte", "unsignedLong", "unsignedInt", "unsignedShort", "unsignedByte", "dateTime", "date", "gYearMonth", "gYear",
		// 					"duration", "gMonthDay", "gDay",
		//                     "gMonth", "string", "normalizedString", "token", "language", "NMTOKEN", "NMTOKENS", "Name", "NCName", "ID", "IDREFS",
		// 					"ENTITY", "ENTITIES", "QName",
		//                     "boolean", "hexBinary", "base64Binary", "anyURI", "notation"
		//                 ];
		// 			controller.coreServices.findxmlBasicDataType = function(typeName) {
		// 				var length = controller.coreServices.xmlBasicDataTypes.length;
		// 				for (var i = 0; i < length; i++) {
		// 					if (controller.coreServices.xmlBasicDataTypes[i] === typeName) {
		// 						return true;
		// 					}
		// 				}
		// 				return false;
		// 			};
		var filterFunction = function(object) {
			if (object.parentFileID === this.id) {
				return object;
			}
		};
		var xmlText = "";
		var errors = [];
		controller.coreServices.accordionStructure = {
			accordion: []
		};
		var dataSubArray = controller.coreServices.SchemasProperties.filter(filterFunction, {
			id: schemaID
		});
		var length = dataSubArray.length;
		controller.coreServices.tagsOccurrences = {};
		controller.choiceCounter = 0;
		for (var j = 0; j < length; j++) {
			var properties = {};
			var currentProperty = dataSubArray[j];
			try {
				if (currentProperty.type === "element") {
					properties = JSON.parse(currentProperty.properties);
					properties.name = currentProperty.name;
					var xmlTextTemp = controller.handleElement(properties, "", "", currentProperty.id, false);
					xmlTextTemp = xmlTextTemp.replace(/##/g, "").replace(/%&/g, "").replace(/&&/g, "").replace(/@@/g, "");
					xmlText += xmlTextTemp;
				}
			} catch (error) {
				errors.push({
					error: error
				});
			}
		}
		// 		var xmlTextArrayCopy = JSON.parse(JSON.stringify(xmlTextArray));
		// 		for (var i = 0; i < xmlTextArray.length; i++) {
		// 			for (var j = 0; j < xmlTextArray.length; j++) {
		// 				if (i !== j) {
		// 					if (xmlTextArrayCopy[i] !== undefined && xmlTextArrayCopy[j] !== undefined && xmlTextArrayCopy[i].search(xmlTextArrayCopy[j]) !== -1) {
		// 						xmlTextArrayCopy[j] = undefined;
		// 					}
		// 				}
		// 			}
		// 		}
		// 		xmlText = xmlTextArrayCopy.find(function(object) {
		// 			return object !== undefined;
		// 		});
		//	xmlText = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" + xmlTextArray;
		controller.renderList(xmlText);
		// 		}).error(function(error) {
		// 			controller.general.list.loader.close();
		// 			$.baseToast({
		// 				isError: true,
		// 				text: error
		// 			});
		// 		});
	},

	findProperty: function(properties, type, id) {
		for (var i = 0; i < properties.length; i++) {
			var element = properties[i];
			if (element.name === type && element.id !== id) {
				return element;
			}
		}
	},

	checkForElementTypeReferences: function(type, xmlText, parentElementName, parentElementID, isAttribute) {
		var controller = this;
		type = type.substring(type.lastIndexOf(":") + 1);
		var typeProperty = controller.findProperty(controller.coreServices.SchemasProperties, type, parentElementID);
		if (typeProperty !== undefined) {
			if (typeProperty.properties.length > 0) {
				var prop = JSON.parse(typeProperty.properties);
				if (prop.hasOwnProperty("restriction") || prop.hasOwnProperty("list") || prop.hasOwnProperty("union")) {
					xmlText = controller.handleSimpleType(prop, xmlText, typeProperty.name, typeProperty.id, isAttribute);
				} else {
					xmlText = controller.handleComplexType(prop, xmlText, typeProperty.name, typeProperty.id, isAttribute);
				}
			}
		} else {
			if (controller.coreServices.findxmlBasicDataType(type)) {
				xmlText = xmlText.replace("%%", "**TYPE:" + type + "**");
			} else {
				var error = i18n("MDR101032").replace("***", type);
				throw error;
			}
		}
		return xmlText;
	},

	handleElement: function(element, xmlText, parentElementName, parentElementID, isAttribute) {
		var controller = this;
		var elementName = "";
		if (xmlText !== "") {
			xmlText = xmlText.replace(/\&+/, "");
			if (isAttribute === true) {
				xmlText = xmlText.replace("%%", "\n<" + element.name + "&&>%%</" + element.name + ">");
			} else if ((isAttribute === "seq" && element.name !== undefined) || (isAttribute === "choice seq" && element.name !== undefined)) {
				xmlText = xmlText.replace("##", "\n<" + element.name + "&&>%%</" + element.name + ">##");
			} else if (isAttribute === "choice" && element.name !== undefined) {
				xmlText = xmlText.replace("##", "<" + element.name + "&&>%%</" + element.name + ">\n##");
			}
		} else {
			xmlText = ("\n<" + element.name + "&&>%%\n</" + element.name + ">");
		}
		if (element.hasOwnProperty("type")) {
			elementName = element.type;
			xmlText = controller.checkForElementTypeReferences(element.type, xmlText, element.name, parentElementID, isAttribute);
		}
		if (element.hasOwnProperty("fixed")) {
			xmlText = xmlText.replace("%%", element.fixed);
		}
		if (element.hasOwnProperty("ref")) {
			var ref = element.ref.substring(element.ref.lastIndexOf(":") + 1);
			elementName = ref;
			var refElement = controller.findProperty(controller.coreServices.SchemasProperties, ref, parentElementID, isAttribute);
			if (refElement !== undefined) {
				var properties = JSON.parse(refElement.properties);
				properties.name = refElement.name;
				if (element.hasOwnProperty("minOccurs")) {
					properties.minOccurs = element.minOccurs;
				}
				if (element.hasOwnProperty("maxOccurs")) {
					properties.maxOccurs = element.maxOccurs;
				}
				xmlText = controller.handleElement(properties, xmlText, ref, refElement.id, isAttribute);
			} else {
				var error = i18n("MDR101033").replace("***", element.ref);
				throw error;
			}
		}
		if (element.hasOwnProperty("complexType")) {
			if (element.hasOwnProperty("minOccurs")) {
				element.complexType.minOccurs = element.minOccurs;
			}
			if (element.hasOwnProperty("maxOccurs")) {
				element.complexType.maxOccurs = element.maxOccurs;
			}
			if (elementName === "") {
				elementName = element.complexType.name;
			}
			xmlText = controller.handleComplexType(element.complexType, xmlText, element.name, parentElementID, isAttribute);
		} else if (element.hasOwnProperty("simpleType")) {
			if (element.hasOwnProperty("minOccurs")) {
				element.simpleType.minOccurs = element.minOccurs;
			}
			if (element.hasOwnProperty("maxOccurs")) {
				element.simpleType.maxOccurs = element.maxOccurs;
			}
			if (elementName === "") {
				elementName = element.simpleType.name;
			}
			xmlText = controller.handleSimpleType(element.simpleType, xmlText, element.name, parentElementID, isAttribute);
		}
		if (element.hasOwnProperty("minOccurs") || element.hasOwnProperty("maxOccurs")) {
			controller.coreServices.tagsOccurrences[elementName] = {};
			if (element.hasOwnProperty("minOccurs") && Number.parseInt(element.minOccurs) > 1) {
				controller.coreServices.tagsOccurrences[elementName].minOccurs = element.minOccurs;
				for (var i = 0; i < Number.parseInt(element.minOccurs) - 1; i++) {
					controller.handleElement(element, xmlText, parentElementName, parentElementID, isAttribute);
				}
			}
			if (element.hasOwnProperty("maxOccurs")) {
				controller.coreServices.tagsOccurrences[elementName].maxOccurs = element.maxOccurs;
			}
		}
		return xmlText;
	},

	handleSequence: function(sequence, xmlText, parentElementName, parentElementID, isAttribute) {
		var controller = this;
		var length = sequence.sequenceArray.length;
		// 		if(sequence.hasOwnProperty("minOccurs")){
		// 		    controller.coreServices.tagsOccurrences[element.name] = {
		// 		        minOccurs: sequence.minOccurs
		// 		    };
		// 		} else if(sequence.hasOwnProperty("maxOccurs")){
		// 		    controller.coreServices.tagsOccurrences[sequence.name] = {
		// 		        maxOccurs: sequence.maxOccurs
		// 		    };
		// 		}
		for (var i = 0; i < length; i++) {
			if (sequence.sequenceArray[i].hasOwnProperty("element")) {
				if (xmlText.search("%%") !== -1 && xmlText.search("##") === -1) {
					xmlText = xmlText.replace("%%", "##");
				}
				if (isAttribute === "choice") {
					isAttribute = "choice seq";
				}
				xmlText = controller.handleElement(sequence.sequenceArray[i].element, xmlText, parentElementName, parentElementID, isAttribute);
			} else if (sequence.sequenceArray[i].hasOwnProperty("group")) {
				xmlText = controller.handleGroup(sequence.sequenceArray[i].group, xmlText, parentElementName, parentElementID, isAttribute);
			} else if (sequence.sequenceArray[i].hasOwnProperty("choice")) {
				xmlText = controller.handleChoice(sequence.sequenceArray[i].choice, xmlText, parentElementName, parentElementID, isAttribute);
			} else if (sequence.sequenceArray[i].hasOwnProperty("sequence")) {
				xmlText = controller.handleSequence(sequence.sequenceArray[i].sequence, xmlText, parentElementName, parentElementID, isAttribute);
			}
		}
		//xmlText = xmlText.replace(/\#+/, "");
		return xmlText;
	},

	handleChoice: function(choice, xmlText, parentElementName, parentElementID, isAttribute) {
		var controller = this;
		var length = choice.choiceArray.length;
		xmlText = xmlText.replace("##", "@@##");
		controller.choiceCounter++;
		for (var i = 0; i < length; i++) {
			if (choice.choiceArray[i].hasOwnProperty("element")) {
				xmlText = controller.handleElement(choice.choiceArray[i].element, xmlText, parentElementName, parentElementID, "choice");
			} else if (choice.choiceArray[i].hasOwnProperty("group")) {
				xmlText = controller.handleGroup(choice.choiceArray[i].group, xmlText, parentElementName, parentElementID, isAttribute);
			} else if (choice.choiceArray[i].hasOwnProperty("choice")) {
				xmlText = controller.handleChoice(choice.choiceArray[i].choice, xmlText, parentElementName, parentElementID, isAttribute);
			} else if (choice.choiceArray[i].hasOwnProperty("sequence")) {
				xmlText = controller.handleSequence(choice.choiceArray[i].sequence, xmlText, parentElementName, parentElementID, isAttribute);
			}
		}
		xmlText = xmlText.replace("\n##", "@@##");
		return xmlText;
	},

	handleExtension: function(extension, xmlText, parentElementName, parentElementID, isAttribute) {
		var controller = this;
		extension.base = extension.base.substring(extension.base.lastIndexOf(":") + 1);
		var baseElement = controller.findProperty(controller.coreServices.SchemasProperties, extension.base, parentElementID);
		if (extension.hasOwnProperty("attributesArray")) {
			for (var i = 0; i < extension.attributesArray.length; i++) {
				if (extension.attributesArray[i].hasOwnProperty("elementType") && extension.attributesArray[i].elementType === "attributeGroup") {
					xmlText = controller.handleAttributeGroup(extension.attributesArray[i], xmlText, parentElementName, parentElementID, isAttribute);
				} else {
					xmlText = controller.handleAttribute(extension.attributesArray[i], xmlText, parentElementName, parentElementID, true);
				}
			}
		}
		if (baseElement !== undefined) {
			var properties = JSON.parse(baseElement.properties);
			if (baseElement.type === "complexType") {
				xmlText = controller.handleComplexType(properties, xmlText, parentElementName, baseElement.id, isAttribute);
			} else {
				xmlText = controller.handleSimpleType(properties, xmlText, parentElementName, baseElement.id, isAttribute);
			}
		} else {
			if (controller.coreServices.findxmlBasicDataType(extension.base)) {
				xmlText = xmlText.replace("%%", "**" + extension.base + "**");
			} else {
				var error = i18n("MDR101033").replace("***", extension.base);
				throw error;
			}
		}
		return xmlText;
	},

	handleGroup: function(group, xmlText, parentElementName, parentElementID, isAttribute) {
		var controller = this;
		if (group.hasOwnProperty("ref")) {
			var refGroup = controller.findProperty(controller.coreServices.SchemasProperties, group.ref, parentElementID);
			if (refGroup !== undefined) {
				var properties = JSON.parse(refGroup.properties);
				properties.name = refGroup.name;
				xmlText = controller.handleGroup(properties, xmlText, refGroup.name, refGroup.id, isAttribute);
			} else {
				var error = i18n("MDR101033").replace("***", group.ref);
				throw error;
			}
		}

		if (group.hasOwnProperty("choice")) {
			xmlText = controller.handleChoice(group.choice, xmlText, parentElementName, parentElementID, isAttribute);
		} else if (group.hasOwnProperty("sequence")) {
			xmlText = controller.handleSequence(group.sequence, xmlText, parentElementName, parentElementID, isAttribute);
		} else if (group.hasOwnProperty("all")) {
			xmlText = controller.handleAll(group.all, xmlText, parentElementName, parentElementID, isAttribute);
		}

		if (group.hasOwnProperty("minOccurs") && Number.parseInt(group.minOccurs) > 1) {
			for (var i = 0; i < Number.parseInt(group.minOccurs) - 1; i++) {
				controller.handleGroup(group, xmlText, parentElementName, parentElementID, isAttribute);
			}
		}
		return xmlText;
	},

	handleAttributeGroup: function(attributeGroup, xmlText, parentElementName, parentElementID, isAttribute) {
		var controller = this;
		//debugger;
		var length = attributeGroup.array.length;
		if (attributeGroup.hasOwnProperty("ref")) {
			var refAttributeGroup = controller.findProperty(controller.coreServices.SchemasProperties, attributeGroup.ref, parentElementID);
			if (refAttributeGroup !== undefined) {
				var properties = JSON.parse(refAttributeGroup.properties);
				properties.name = refAttributeGroup.name;
				xmlText = controller.handleAttributeGroup(properties, xmlText, refAttributeGroup.name, refAttributeGroup.id, isAttribute);
			} else {
				var error = i18n("MDR101033").replace("***", attributeGroup.ref);
				throw error;
			}
		}
		for (var i = 0; i < length; i++) {
			if (attributeGroup.array[i].hasOwnProperty("elementType") && attributeGroup.array[i].elementType === "attributeGroup") {
				xmlText = controller.handleAttributeGroup(attributeGroup.array[i], xmlText, parentElementName, parentElementID, isAttribute);
			} else {
				xmlText = controller.handleAttribute(attributeGroup.array[i], xmlText, parentElementName, parentElementID, true);
			}
		}
		return xmlText;
	},

	handleAttribute: function(attribute, xmlText, parentElementName, parentElementID, isAttribute) {
		var controller = this;
		var use = attribute.hasOwnProperty("use");
		if (attribute.hasOwnProperty("ref")) {
			var refAttribute = controller.findProperty(controller.coreServices.SchemasProperties, attribute.ref, parentElementID);
			if (refAttribute !== undefined) {
				var properties = JSON.parse(refAttribute.properties);
				properties.name = refAttribute.name;
				if (use) {
					properties.use = attribute.use;
				}
				xmlText = controller.handleAttribute(properties, xmlText, refAttribute.name, refAttribute.id, true);
			} else {
				var error = i18n("MDR101033").replace("***", attribute.ref);
				throw error;
			}
		} else if (attribute.hasOwnProperty("type")) {
			attribute.type = attribute.type.substring(attribute.type.lastIndexOf(":") + 1);
			var typeProperty = controller.findProperty(controller.coreServices.SchemasProperties, attribute.type, parentElementID);
			if (typeProperty === undefined) {
				if (controller.coreServices.findxmlBasicDataType(attribute.type)) {
					if (attribute.hasOwnProperty("fixed")) {
						xmlText = xmlText.replace("&&", " " + attribute.name + '=\'' + attribute.fixed + '\'&&');
					} else {
						if (use && attribute.use === "required") {
							xmlText = xmlText.replace("&&", " " + attribute.name + '=\'**REQUIRED TYPE:' + attribute.type + '**\'&&');
						} else {
							xmlText = xmlText.replace("&&", " " + attribute.name + '=\'**TYPE:' + attribute.type + '**\'&&');
						}
					}
				} else {
					var error = i18n("MDR101032").replace("***", attribute.type);
					throw error;
				}
			} else {
				xmlText = xmlText.replace("&&", " " + attribute.name + '=\'%&\'&&');
				var properties = JSON.parse(typeProperty.properties);
				properties.name = typeProperty.name;
				if (use) {
					properties.use = attribute.use;
				}
				xmlText = controller.handleSimpleType(properties, xmlText, typeProperty.name, typeProperty.id, true);
			}
		} else if (attribute.hasOwnProperty("simpleType")) {
			xmlText = xmlText.replace("&&", " " + attribute.name + '=\'%&\'&&');
			attribute.simpleType.name = attribute.name;
			xmlText = controller.handleSimpleType(attribute.simpleType, xmlText, attribute.name, parentElementID, true);
		} else {
			xmlText = xmlText.replace("&&", " " + attribute.name + '=\'%&\'&&');
			if (attribute.hasOwnProperty("default")) {
				xmlText = xmlText.replace("%&", "**DEFAULT:" + attribute.default+"**");
			} else if (attribute.hasOwnProperty("fixed")) {
				xmlText = xmlText.replace("%&", attribute.fixed);
			}
		}
		return xmlText;
	},

	handleComplexType: function(complexType, xmlText, parentElementName, parentElementID, isAttribute) {
		var controller = this;
		if (complexType.hasOwnProperty("simpleContent")) {
			if (complexType.hasOwnProperty("minOccurs")) {
				complexType.simpleContent.minOccurs = complexType.minOccurs;
			}
			if (complexType.hasOwnProperty("maxOccurs")) {
				complexType.simpleContent.maxOccurs = complexType.maxOccurs;
			}
			xmlText = controller.handleSimpleComplexContent(complexType.simpleContent, xmlText, parentElementName, parentElementID, isAttribute);
		} else if (complexType.hasOwnProperty("complexContent")) {
			if (complexType.hasOwnProperty("minOccurs")) {
				complexType.complexContent.minOccurs = complexType.minOccurs;
			}
			if (complexType.hasOwnProperty("maxOccurs")) {
				complexType.complexContent.maxOccurs = complexType.maxOccurs;
			}
			xmlText = controller.handleSimpleComplexContent(complexType.complexContent, xmlText, parentElementName, parentElementID, isAttribute);
		} else {
			if (complexType.attributesArray.length > 0) {
				var length = complexType.attributesArray.length;
				for (var i = 0; i < length; i++) {
					if (complexType.attributesArray[i].hasOwnProperty("elementType") && complexType.attributesArray[i].elementType === "attribute") {
						xmlText = controller.handleAttribute(complexType.attributesArray[i], xmlText, parentElementName, parentElementID, true);
					} else if (complexType.attributesArray[i].hasOwnProperty("elementType") && complexType.attributesArray[i].elementType ===
						"attributeGroup") {
						xmlText = controller.handleAttributeGroup(complexType.attributesArray[i], xmlText, parentElementName, parentElementID, isAttribute);
					}
				}
			}
			if (complexType.hasOwnProperty("group")) {
				xmlText = controller.handleGroup(complexType.group, xmlText, parentElementName, parentElementID, isAttribute);
			} else if (complexType.hasOwnProperty("choice")) {
				xmlText = controller.handleChoice(complexType.choice, xmlText, parentElementName, parentElementID, "choice");
			} else if (complexType.hasOwnProperty("sequence")) {
				if (isAttribute === "elementType") {
					xmlText = xmlText.replace("##", "#+");
					xmlText = controller.handleSequence(complexType.sequence, xmlText, parentElementName, parentElementID, "seq");
					xmlText = xmlText.replace("#+", "##");
				} else {
					xmlText = controller.handleSequence(complexType.sequence, xmlText, parentElementName, parentElementID, "seq");
				}
			}
		}

		return xmlText;
	},

	handleSimpleType: function(simpleType, xmlText, parentElementName, parentElementID, isAttribute) {
		var controller = this;
		if (simpleType.hasOwnProperty("list")) {
			if (simpleType.list.hasOwnProperty("itemType")) {
				if (isAttribute === true) {
					if (simpleType.hasOwnProperty("use") && simpleType.use === "required") {
						xmlText = xmlText.replace("%&", "**REQUIRED LIST:" + simpleType.list.itemType.substring(simpleType.list.itemType.lastIndexOf(":") +
								1) +
							"**");
					} else {
						xmlText = xmlText.replace("%&", "**LIST:" + simpleType.list.itemType.substring(simpleType.list.itemType.lastIndexOf(":") + 1) +
							"**");
					}
				} else {
					xmlText = xmlText.replace("%%", "**LIST:" + simpleType.list.itemType.substring(simpleType.list.itemType.lastIndexOf(":") + 1) +
						"**");
				}
			} else {
				xmlText = controller.handleSimpleType(simpleType.list.simpleType, xmlText, parentElementName, parentElementID, isAttribute);
			}
		} else if (simpleType.hasOwnProperty("restriction")) {
			if (isAttribute === true) {
				if (simpleType.hasOwnProperty("use") && simpleType.use === "required") {
					xmlText = xmlText.replace("%&", "**REQUIRED RESTRICT:" + JSON.stringify(simpleType.restriction) + "**");
				} else {
					xmlText = xmlText.replace("%&", "**RESTRICT:" + JSON.stringify(simpleType.restriction) + "**");
				}
			} else {
				xmlText = xmlText.replace("%%", "**RESTRICT:" + JSON.stringify(simpleType.restriction) + "**");
			}
		} else if (simpleType.hasOwnProperty("union")) {
			if (simpleType.union.hasOwnProperty("memberTypes")) {
				if (isAttribute === true) {
					if (simpleType.hasOwnProperty("use") && simpleType.use === "required") {
						xmlText = xmlText.replace("%&", "**REQUIRED UNION:" + simpleType.union.memberTypes + "**");
					} else {
						xmlText = xmlText.replace("%&", "**UNION:" + simpleType.union.memberTypes + "**");
					}
				} else {
					xmlText = xmlText.replace("%%", "**UNION:" + simpleType.union.memberTypes + "**");
				}
			}
		}
		
		if(simpleType.hasOwnProperty("minOccurs")){
		    var required = {
		        minOccurs: Number.parseInt(simpleType.minOccurs)
		    };
		    xmlText = xmlText.replace("**", "**OCCURS:" + JSON.stringify(required) + " ");
		}
		// 		if (parentElementName !== "") {
		// 			xmlText = xmlText.replace("**", "**NAME:" + parentElementName + " ");
		// 		}
		if (isAttribute === "choice" || isAttribute === "choice seq") {
			xmlText = xmlText.replace("**", "**CHOICE" + controller.choiceCounter + " ");
		}
		return xmlText;
	},

	handleSimpleComplexContent: function(simpleComplexContent, xmlText, parentElementName, parentElementID, isAttribute) {
		var controller = this;
		if (simpleComplexContent.hasOwnProperty("extension")) {
			xmlText = controller.handleExtension(simpleComplexContent.extension, xmlText, parentElementName, parentElementID, isAttribute);
		} else if (simpleComplexContent.hasOwnProperty("restriction")) {
			xmlText = xmlText.replace("%%", "**RESTRICT:" + JSON.stringify(simpleComplexContent.restriction) + "**");
		}
		return xmlText;
	},

	extractValue: function(xmlText) {
		var xmlTextToShow = xmlText;
		while (xmlTextToShow.indexOf("**") !== -1) {
			var val1 = xmlTextToShow.indexOf("**");
			var temp1 = xmlTextToShow.substr(0, val1);
			var temp2 = xmlTextToShow.substr(val1 + 2);
			var val2 = temp2.indexOf("**");
			temp2 = temp2.substring(val2 + 2);
			xmlTextToShow = temp1 + "%%" + temp2;
		}
		return xmlTextToShow;
	}
});