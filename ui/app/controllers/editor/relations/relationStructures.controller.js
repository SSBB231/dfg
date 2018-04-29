sap.ui.controller('app.controllers.editor.relations.relationStructures', {

	onInit: function() {

	},
	onDataRefactor: function(data) {
		var _self = this;
		_self.keyRows = data.row.keys;
		return $.extend(data, this.data);

	},
	onAfterRendering: function(html) {
		var _self = this;
		var data = _self.getData();
		_self.view = $(html);

		_self.services = data.services;
		_self.view.structureWrapper = _self.view.find('.structure-wrapper');

		_self.view.fatherSelect = _self.view.find('.father-select');
		_self.view.hideFatherCB = _self.view.find(".hide-cb-parent");
		_self.view.fatherBtn = _self.view.find('.father-br');
		_self.view.sonSelect = _self.view.find('.son-select');
		_self.view.sonBtn = _self.view.find('.son-br');
		_self.view.addRelation = _self.view.find('#add-icon');
		_self.view.removeRelation = _self.view.find('#delete-icon');
		_self.view.keysWrapper = _self.view.find('.keys-wrapper');
		_self.view.keysWrapper.attr("data-id", _self.view.index());
		_self.keysController = [];

		var positions = _self.coreServices.layoutObject.positions;
		_self.blocks = [];
		for (var i = 0; i < positions.length; i++) {
			var tempBlock = JSON.parse(JSON.stringify(_self.coreServices.layoutObject.blocks[positions[i]]));
			tempBlock.key = positions[i];
			tempBlock.records = [];
			var blockPositions = tempBlock.positions;
			for (var j = 0; j < blockPositions.length; j++) {
				var tempRecord = JSON.parse(JSON.stringify(_self.coreServices.layoutObject.blocks[positions[i]].records[blockPositions[j]]));
				tempRecord.key = positions[i] + ";" + blockPositions[j];
				tempBlock.records.push(tempRecord);
			}

			_self.blocks.push(tempBlock);
		}
		_self.relation = _self.getData().row ? _self.getData().row : {};
		_self.initServices();
		_self.bindElements();
		_self.bindEvents();

	},
	initServices: function() {
		var _self = this;
		_self.coreServices.addNewKey = function(index) {
			_self.addNewKey(index);
		}
	},
	showFilterBtn: function(flag) {
		var _self = this;
		_self.hasHierarchy = flag;
		for (var k = 0; k < _self.keysController.length; k++) {
			_self.keysController[k].showFilterBtn(flag);
		}
	},
	bindElements: function() {
		var _self = this;
		_self.view.fatherSelect.ctrl = _self.view.fatherSelect.bindBaseInput({

		});
		_self.view.sonSelect.ctrl = _self.view.sonSelect.bindBaseInput({

		});
		_self.view.hideFatherCB.ctrl = _self.view.hideFatherCB.bindBaseCheckbox({
			id: "H" + _self.view.index(),
			text: i18n("APPLY HIDE RULE")
		});
		if (_self.blocks.length > 0) {
			if (_self.relation.father) {
				var value = "";
				if (_self.relation.father.block) {
					value += i18n('BLOCK') + "-" + _self.coreServices.layoutObject.blocks[_self.relation.father.block].name;
				}
				if (_self.relation.father.record) {
					value += ", " + i18n('RECORD') + "-" + _self.coreServices.layoutObject.blocks[_self.relation.father.block].records[_self.relation.father
						.record.split(";")[1]].name;
				}
				_self.view.fatherSelect.ctrl.setText(value);
				_self.getColumnKeys(true);
			}
			if (_self.relation.son) {
				var value = i18n('BLOCK') + "-";
				if (_self.relation.son.block) {
					for (var i = 0; i < _self.relation.son.block.length; i++) {
						if (i !== 0) {
							value += ",";
						}
						value += _self.coreServices.layoutObject.blocks[_self.relation.son.block[i]].name;

					}
				}
				if (_self.relation.son.record) {
					value += ", " + i18n('RECORD') + "-";
					for (var i = 0; i < _self.relation.son.record.length; i++) {
						if (i !== 0) {
							value += ",";
						}
						value += _self.coreServices.layoutObject.blocks[_self.relation.son.record[i].split(";")[0]].records[_self.relation.son.record[i].split(
							";")[1]].name;

					}
				}
				_self.view.sonSelect.ctrl.setText(value);
				_self.getColumnKeys(false);
			}
			if (_self.relation.hideParent) {
				_self.view.hideFatherCB.ctrl.setChecked(true);
			}
		}

		_self._renderKeyRows(_self.keyRows);

	},
	bindEvents: function() {
		var _self = this;
		_self.view.fatherBtn.click(function() {
			_self.openBRDialog(true);
		});
		_self.view.fatherBtn.baseTooltip({
			class: 'dark',
			position: 'top',
			text: i18n('SELECT FATHER TOOLTIP')
		});
		_self.view.sonBtn.baseTooltip({
			class: 'dark',
			position: 'top',
			text: i18n('SELECT SON TOOLTIP')
		});
		_self.view.sonBtn.click(function() {
			_self.openBRDialog(false);
		});
		_self.view.removeRelation.click(_self.removeRelation.bind(this));
		_self.view.removeRelation.baseTooltip({
			class: 'dark',
			position: 'top',
			text: i18n('REMOVE RELATION TOOLTIP')
		});
		_self.view.removeRelation.keydown(function(ev) {
			if (ev.keyCode === 13 || ev.keyCode === 32) {
				this.click();
			}
		});
		_self.view.addRelation.click(_self.addRelation.bind(this));
		_self.view.addRelation.baseTooltip({
			class: 'dark',
			position: 'top',
			text: i18n('ADD RELATION TOOLTIP')
		});
		_self.view.addRelation.keydown(function(ev) {
			if (ev.keyCode === 13 || ev.keyCode === 32) {
				this.click();
			}
		});

	},
	addRelation: function() {
		var _self = this;

		_self.coreServices.addRelationRow(_self.view.index());
	},
	removeRelation: function(evt) {
		var _self = this;
		var relationRow = $(evt.currentTarget).parents(".relation-wrapper");
		var relationIndex = relationRow.index();
		if (relationRow.siblings().length !== 0) {
			relationRow.detach();
			_self.parentController.relationControllers.splice(relationIndex, 1);
		} else {
			_self.relation = {};
			_self.view.fatherSelect.ctrl.setText('');
			_self.view.sonSelect.ctrl.setText('');
		}
	},
	addNewKey: function(index) {
		var _self = this;
		_self._renderKeyRows([{

        }]);
		var newKey;
		if (index !== undefined) {
			var parentIndex = _self.view.index();
			var keyRows = document.querySelectorAll(".keys-wrapper[data-id='" + parentIndex + "'] .key-wrapper");
			newKey = keyRows[keyRows.length - 1];
			newKey.parentNode.insertBefore(keyRows[index], newKey);
		}
	},
	_renderKeyRows: function(keyRows) {
		var _self = this;
		var newKeyRows = [];
		if (!keyRows) {
			keyRows = [{}];
		}
		keyRows.forEach(function(keyRow) {

			var keyController = _self.view.keysWrapper.bindKeyRow({
				row: keyRow,
				fatherColumns: _self.fatherColumns,
				sonColumns: _self.sonColumns
			});
			keyController.parentController = _self;
			_self.keysController.push(keyController);
			newKeyRows.push(keyController);
			if (_self.hasHierarchy) {
				keyController.showFilterBtn(true);
			} else {
				keyController.showFilterBtn(false);
			}
		});
		return keyRows;
	},
	openBRDialog: function(father) {
		var _self = this;
		var blocks = [];
		if (father) {
			if (_self.relation.son) {
				var record, block;
				if (_self.relation.son.block) {
					block = _self.relation.son.block;
					if (_self.relation.son.record) {
						record = _self.relation.son.record;
					}
				}
				for (var i = 0; i < _self.blocks.length; i++) {
					if (!record) {
						if (_self.blocks[i].key === block) {
							break;
						} else {
							blocks.push(_self.blocks[i]);
						}
					} else {
						if (_self.blocks[i].key === block) {
							var tempBlock = JSON.parse(JSON.stringify(_self.blocks[i]));
							tempBlock.records = [];
							for (var j = 0; j < _self.blocks[i].records.length; j++) {
								if (_self.blocks[i].records[j].key === record) {
									break;
								} else {
									tempBlock.records.push(_self.blocks[i].records[j]);
								}
							}
							if (tempBlock.records.length > 0) {
								blocks.push(tempBlock);
							}
						} else {
							if (i === 0) {
								blocks.push(_self.blocks[i]);
							} else {
								if (_self.blocks[i - 1].key !== block)
									blocks.push(_self.blocks[i]);
								else
									break;
							}

						}
					}
				}

			} else {
				blocks = _self.blocks;
			}
		} else {
			if (_self.relation.father) {
				var block, record;
				if (_self.relation.father.block) {
					block = _self.relation.father.block;
					if (_self.relation.father.record) {
						record = _self.relation.father.record;
					}
				}

				for (var i = _self.blocks.length - 1; i >= 0; i--) {
					if (!record) {
						if (_self.blocks[i].key === block) {
							break;
						} else {
							blocks.push(_self.blocks[i])
						}
					} else {

						if (_self.blocks[i].key === block) {
							var tempBlock = JSON.parse(JSON.stringify(_self.blocks[i]));
							tempBlock.records = [];
							for (var j = _self.blocks[i].records.length - 1; j >= 0; j--) {

								if (_self.blocks[i].records[j].key === record) {

									break;
								} else {
									tempBlock.records.push(_self.blocks[i].records[j]);
								}
							}
							tempBlock.records.reverse();
							if (tempBlock.records.length > 0)
								blocks.push(tempBlock);

						} else {
							if (i === _self.blocks.length - 1) {
								blocks.push(_self.blocks[i]);
							} else {
								if (_self.blocks[i + 1].key !== block)
									blocks.push(_self.blocks[i]);
								else
									break;
							}

						}
					}
				}
			} else {
				blocks = _self.blocks;
			}
		}
		var BRDialog = $.baseDialog({
			title: i18n('BLOCK-RECORDS'),
			modal: true,
			size: "medium",
			outerClick: 'disabled',
			viewName: "app.views.editor.relations.structureDialog",
			viewData: {
				blocks: blocks,
				structure: father ? _self.relation.father : _self.relation.son,
				father: father
			},
			buttons: [{
				name: i18n('CANCEL'),
				isCloseButton: true,
				click: function() {

				}
            }, {
				name: i18n('APPLY'),
				click: function() {

					var innerController = BRDialog.getInnerController();
					if (father) {

						_self.relation.father = innerController.getSelectedStructure();
						values = innerController.getNameStructure();
						var value = "";
						if (values.block) {
							value += i18n('BLOCK') + "-" + values.block;
						}
						if (values.record) {
							value += ", " + i18n('RECORD') + "-" + values.record
						}

						_self.view.fatherSelect.ctrl.setText(value);
						_self.getColumnKeys(true);

					} else {
						_self.relation.son = innerController.getSelectedStructure();
						values = innerController.getNameStructure();

						var value = "";
						if (values.block) {
							value += i18n('BLOCK') + "-" + values.block;
						}
						if (values.record) {
							value += ", " + i18n('RECORD') + "-" + values.record
						}
						_self.view.sonSelect.ctrl.setText(value);
						_self.getColumnKeys(false);
					}
					BRDialog.close();
				}
            }]
		})
		BRDialog.open();
	},
	getColumnKeys: function(father) {
		var _self = this;
		var columns = [];
		var block, record;

		var layoutObjectBlocks = _self.coreServices.layoutObject.blocks;
		if (father) {

			if (_self.relation.father) {

				if (_self.relation.father.block) {
					block = _self.relation.father.block;
					if (_self.relation.father.record) {
						record = _self.relation.father.record;

					}

				}
			}

		} else {
			if (_self.relation.son) {

				if (_self.relation.son.block) {
					block = _self.relation.son.block;
					if (_self.relation.son.record) {
						record = _self.relation.son.record;

					}

				}
			}
		}
		if (block) {
			if (!Array.isArray(block)) {
				block = [block];
			}
			var blockObject
			for (var b = 0; b < block.length; b++) {
				blockObject = JSON.parse(JSON.stringify(layoutObjectBlocks[block[b]]));

				if (record) {
					var recordObject;
					var structures = {};
					if (!Array.isArray(record)) {
						record = [record];
					}

					for (var r = 0; r < record.length; r++) {
						if (record[r].split(";")[0] === block[b]) {
							recordObject = JSON.parse(JSON.stringify(layoutObjectBlocks[block[b]].records[record[r].split(";")[1]]));
							structures = {};
							recordObject.idStructure.map(function(s) {
								structures[s] = _self.coreServices.structure[s];
							})

							for (var i = 0; i < recordObject.positions.length; i++) {
								if (recordObject.columns[recordObject.positions[i]].fieldId && recordObject.columns[recordObject.positions[i]].fieldId !== null &&
									!isNaN(parseInt(recordObject.columns[recordObject.positions[i]].fieldId, 10))) {
									var column = JSON.parse(JSON.stringify(structures[recordObject.columns[recordObject.positions[i]].idStructure].fields[
										recordObject.columns[recordObject.positions[i]].fieldId]));
									if (column) { 
										column.position = i;
										column.key = record[r] + ";" + recordObject.positions[i];
										column.name = column.label + ";" + layoutObjectBlocks[block[b]].name + "-" + recordObject.name;
										column.record = record[r];
										columns.push(column)
									}
								} else {
									var column = recordObject.columns[recordObject.positions[i]];
									column.position = i;
									column.key = record[r] + ";" + recordObject.positions[i];
									column.name = _self.getColumnName(column, i) + ";" + layoutObjectBlocks[block[b]].name + "-" + recordObject.name;
									column.record = record[r];
									columns.push(column);
								}

							}
						}
					}

				} else {
					for (var i in blockObject.records) {
						var structure = _self.coreServices.structure[blockObject.records[i].idStructure];
						for (var j = 0; j < blockObject.records[i].positions.length; j++) {
							var column = structure.fields[blockObject.records[i].positions[j]];
							if (column) {
								column.position = j;
								column.record = i;
								column.name = column.label + ";" + layoutObjectBlocks[block[b]].name + "-" + recordObject.name;
								column.record = record[r];
								columns.push(column);
							} else {

								column.position = i;
								column.key = record[r] + ";" + recordObject.positions[i];
								column.name = _self.getColumnName(column, i) + ";" + layoutObjectBlocks[block[b]].name + "-" + recordObject.name;
								column.record = record[r];
								columns.push(column);
							}

						}

					}
				}
			}
		}
		if (father) {
			_self.fatherColumns = columns;
		} else {
			_self.sonColumns = columns;
		}
		_self.keysController.forEach(function(e) {
			e.addKeyOptions(father, columns);
		});
	},
	getColumnName: function(column, i) {
		var name;
		var _self = this;
		if (column.fieldId) {
			if (column.fieldId === 'HRE') {
				name = i18n("HR_EXECUCAO");
			} else if (column.fieldId === 'DTE') {
				name = i18n("DT_EXECUCAO");
			} else {
				name = sessionStorage.lang !== "enus" ? _self.structure[column.idStructure].fields[column.fieldId].labelPT : _self.structure[column.idStructure]
					.fields[column.fieldId].labelEN;
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
			if (column.isInitialDateReference === true) {
				name = i18n("INITDATEREFERENCE");
			}
			if (column.isFinalDateReference === true) {
				name = i18n("FINALDATEREFERENCE");
			}
			if (column.id === "HRE") {
				name = i18n('HR_EXECUCAO');
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
				name = i18n("RECORDTOTAL");
			}
			if (column.isBlocksTotal) {
				name = i18n("BLOCKTOTAL");
			}
			if (column.isTotalsAll) {
				name = i18n("TOTALALL");
			}
			if (column.isReferencePeriod) {
				name = column.label;
			}
			if (column.hasOwnProperty("sequenceField")) {
				name = i18n("SEQUENCE");
			}

		}
		return name;
	},
	getRelation: function() {
		var _self = this;
		_self.relation.keys = []
		_self.relation.hideParent = _self.view.hideFatherCB.ctrl.getChecked();
		_self.relation.hasHierarchy = _self.hasHierarchy;
		for (var i = 0; i < _self.keysController.length; i++) {
			var key = _self.keysController[i];
			if (key.isValid()) {
				_self.relation.keys.push(key.getKey());
			}
		}
		return _self.relation;
	},
	isValid: function() {
		var _self = this;
		return _self.relation.father && _self.relation.son;
	}

});