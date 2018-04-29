sap.ui.controller("app.controllers.dialogs.filters.ConditionBuilder", {

	onInit: function() {
		this.data = {
			addCase: {
				text: i18n('ADD GROUP'),
				class: "highlighted",
				icon: "plussign",
				iconFont: "Sign-and-Symbols",
				hasTransition: true
			}
		};
	},

	onDataRefactor: function(data) {
		return $.extend(data, this.data);
	},

	onAfterRendering: function(html) {
		var _self = this;
		_self.view = $(html);
		_self.groups = $('.list-groups');
		_self.groupsRef = [];
		this.initServices();
		this.bindEvents();
		if (_self.coreServices.exhibition) {
			_self.processExhibition();
		}
	},

	initServices: function() {
		var _self = this;

		_self.layoutObject = _self.coreServices.layoutObject;
		//Initialize temporary objects
		_self.initTempFilters();
		//Prepare Blocks
		var comboOptions = [{
			key: null,
			name: i18n('ALL')
		}].concat($.globalFunctions.getBlockOptions(_self.layoutObject,true,true));
		_self.comboBlocks = $('#comboBlocks').bindBaseSelect({
			options: comboOptions,
            disableSort: true,
			onChange: function(oldVal, newVal) {
                _self.renderColumnSelect();
				if (newVal.key === null) {
					$('#comboRecords').html('');
                    _self.comboColumns.disable();
					_self.comboRecords = $('#comboRecords').bindBaseSelect({
						options: comboOptions,
                        disableSort: true,
						isDisabled: true,
						onChange: function(oldVal, newVal) {
							_self.groupId = null;
							_self.recordId = newVal.key;
						}
					});
				} else {

					_self.renderRecordSelect(newVal.key,newVal.records);
				}
				_self.blockId = newVal.key;
				_self.renderGroupSelect();
				_self.groupId = null;
				_self.recordId = null;
				_self.updateFiltersObject();
				_self.currentLevel = _self.getCurrentLevel();
				_self.recoverFilters();
			},
			tooltip: i18n('BLOCK SELECT TOOLTIP')
		});
		_self.comboRecords = $('#comboRecords').bindBaseSelect({
			options: comboOptions,
			isDisabled: true,
			onChange: function(oldVal, newVal) {
				_self.groupId = null;
				_self.recordId = newVal.key;
			},
			tooltip: i18n('RECORD SELECT TOOLTIP')
		});
		_self.comboColumns = $("#comboColumns").bindBaseSelect({
			isDisabled: true,
			tootlip: i18n("FIELD SELECT TOOTIP")
		});
		//Prepare Structure Select
		var structureOptions = $.globalFunctions.getStructureOptions(_self.coreServices.structure);
		var defaultStructure;
		if(structureOptions.length){
		    defaultStructure = structureOptions[structureOptions.length-1].key;
		}
		$('#comboStructure').html('');
		_self.comboStructure = $('#comboStructure').bindBaseSelect({
			options: structureOptions,
			onChange: function(oldVal, newVal) {
				if (oldVal) {
				
					_self.structureId = newVal.key;
					_self.groupId = null;
					_self.renderGroupSelect();
					_self.updateFiltersObject();
					_self.currentLevel = _self.getCurrentLevel();
					_self.recoverFilters();
					_self.comboColumns.setKey(null);
				//	_self.comboColumns.disable();
					_self.columnId = null;
				}
			},
			tooltip: i18n('STRUCTURE TOOLTIP')
		});

		_self.comboGroup = $('#comboGroup').bindBaseSelect({
			options: [],
			isDisabled: true
		});
		_self.currentLevel = _self.getCurrentLevel();
		_self.coreServices.deleteGroup = function(groupIndex) {
			_self.deleteGroup(groupIndex);
		};
		//_self.recoverFilters();
		_self.comboStructure.setKey(defaultStructure);
		_self.structureId = defaultStructure;
		_self.comboBlocks.setKey(null);
	},

	renderGroupSelect: function(idColumn) {
		var _self = this;

		var groupOptions = [];
		if (_self.structureId && _self.blockId && _self.blockId !== null && _self.recordId && _self.recordId !== null) {

			if (_self.layoutObject.groups) {
				if (_self.layoutObject.groups.blocks) {
					if (_self.layoutObject.groups.blocks[_self.blockId]) {
						if (_self.layoutObject.groups.blocks[_self.blockId].records) {
							if (_self.layoutObject.groups.blocks[_self.blockId].records[_self.recordId]) {
								if (_self.layoutObject.groups.blocks[_self.blockId].records[_self.recordId].structures) {
									if (_self.layoutObject.groups.blocks[_self.blockId].records[_self.recordId].structures[_self.structureId]) {
										if (_self.layoutObject.groups.blocks[_self.blockId].records[_self.recordId].structures[_self.structureId].groups) {
											for (var i = 0; i < _self.layoutObject.groups.blocks[_self.blockId].records[_self.recordId].structures[_self.structureId].groups
												.length; i++) {
												var group = _self.layoutObject.groups.blocks[_self.blockId].records[_self.recordId].structures[_self.structureId].groups[i];

												if(idColumn){
												    if(group.groupBy.indexOf(idColumn+"") !== -1 || group.totals.indexOf(idColumn+"") !== -1 || group.groupBy.indexOf(idColumn) !== -1 || group.totals.indexOf(idColumn) !== -1 ){
												        groupOptions.push({
    													    key: i,
    													    name: _self.layoutObject.groups.blocks[_self.blockId].records[_self.recordId].structures[_self.structureId].groups[i].name
    												    });
												    }
												}else{
												    groupOptions.push({
													    key: i,
													    name: _self.layoutObject.groups.blocks[_self.blockId].records[_self.recordId].structures[_self.structureId].groups[i].name,
													    fields: group.groupBy.concat(group.totals)
												    });
												}
												
											}
										}
									}
								}
							}
						}
					}
				}
			}

		}
		if (groupOptions.length > 0) {
			$("#comboGroup").empty();
			_self.comboGroup = $("#comboGroup").bindBaseSelect({
				options: groupOptions,
                disableSort: true,
				tooltip: i18n("SELECT GROUP"),
				onChange: function(oldVal, newVal) {
				    if(newVal.fields && newVal.fields.length){
                        _self.renderColumnSelect(_self.blockId, _self.recordId,newVal.fields);
				    }
					_self.groupId = newVal.key;
					_self.updateFiltersObject();
					_self.currentLevel = _self.getCurrentLevel();

					_self.recoverFilters();

				}
			});
		} else {
			$("#comboGroup").empty();
			_self.comboGroup = $('#comboGroup').bindBaseSelect({
				options: [],
				isDisabled: true
			});
		}
	},

	renderRecordSelect: function(blockId,recordOptions ){
		var _self = this;
		var comboOptions = [{
			key: null,
			name: i18n('ALL')
		}].concat(recordOptions);
		$('#comboRecords').html('');
		_self.comboRecords = $('#comboRecords').bindBaseSelect({
			options: comboOptions,
            disableSort: true,
			onChange: function(oldVal, newVal) {

				_self.groupId = null;
				_self.recordId = newVal.key;
				_self.comboStructure.enable();
				_self.renderGroupSelect();
				if(newVal.key !== null){
			    	_self.renderColumnSelect(blockId,newVal.key,newVal.columns);
				}else{
				    _self.comboColumns.disable();
				}
				_self.updateFiltersObject();
				_self.currentLevel = _self.getCurrentLevel();
				_self.recoverFilters();
				console.log(_self.filtersObject)

			},
			tooltip: i18n('RECORD SELECT TOOLTIP')
		});
		_self.comboRecords.setKey(null);
	},
	renderColumnSelect: function(blockId, recordId,fields) {
		var _self = this;
		$("#comboColumns").empty();
		if(!blockId  || !recordId){ 
		    _self.comboColumns = $('#comboColumns').bindBaseSelect({
		        disabled: true
		    });
		    return ;
		}
		
		var comboOptions =  [];
		
    	var record = _self.layoutObject.blocks[blockId].records[recordId];
    	for(var i = 0; i < record.positions.length; i++){
    		    var column = record.columns[record.positions[i]];
    		    if(column){
    		        if($.globalFunctions.verifyStructureField(column)){
    		            if(fields){
    		                if(fields.indexOf(record.positions[i]) !== -1 || fields.indexOf(record.positions[i]+"")){
            		            comboOptions.push({
            		                name: $.globalFunctions.getColumnName(column,true),
            		                key: record.positions[i],
            		                idStructure: column.idStructure
            		            });
    		                }else{
    		                    comboOptions.push({
            		                name: $.globalFunctions.getColumnName(column,true),
            		                key: record.positions[i],
            		                idStructure: column.idStructure
            		            });
    		                }
    		            }
    		        }
    		    }
    		}
		
		_self.comboColumns = $('#comboColumns').bindBaseSelect({
			options: comboOptions,
            disableSort: true,
			onChange: function(oldVal, newVal) {
				_self.groupId = null;
				_self.columnId = newVal.key;
				_self.structureId = newVal.idStructure;
				if(_self.groupId === null){
				    _self.renderGroupSelect(newVal.key);

				}
				_self.updateFiltersObject();
				_self.comboStructure.setKey(newVal.idStructure,true);
				_self.currentLevel = _self.getCurrentLevel();
				_self.recoverFilters();

			},
			tooltip: i18n('FIELD SELECT TOOLTIP')
		}); 
		

	},
	bindEvents: function() {
		var _self = this;
		_self.addGroupBtn = $('.addGroup button').click(function(e) {
			_self.addGroup();
		})
		_self.addGroupBtn.baseTooltip({
			class: 'dark',
			position: 'top',
			text: i18n('ADD GROUP TOOLTIP')
		});
	},
	addGroup: function(data) {
		var _self = this;

		_self.groupsRef.push(_self.groups.bindCBGroup({
			groupData: data,
			structureFields: _self.getStructureFields(),
			recordFields: _self.getRecordFields()
		}));
	},
	updateFiltersObject: function() {
		var _self = this;
		var processedFilters
		switch (_self.currentLevel.level) {
			case 'ALL':
				if (!_self.filtersObject.filters) {
					_self.filtersObject.filters = {};
				}
				processedFilters = _self.processFilters();
				if (processedFilters.length !== 0)
					_self.filtersObject.filters[_self.currentLevel.idStructure] = processedFilters;
				else if (_self.currentLevel.idStructure)
					_self.filtersObject.filters[_self.currentLevel.idStructure] = undefined;
				// console.log(_self.filtersObject);
				break;
			case 'BLOCK':
				if (!_self.filtersObject.blocks[_self.currentLevel.blockId].filters) {
					_self.filtersObject.blocks[_self.currentLevel.blockId].filters = {};
				}
				processedFilters = _self.processFilters();
				if (processedFilters.length !== 0)
					_self.filtersObject.blocks[_self.currentLevel.blockId].filters[_self.currentLevel.idStructure] = processedFilters;
				else
					_self.filtersObject.blocks[_self.currentLevel.blockId].filters[_self.currentLevel.idStructure] = undefined;
				break;
			case 'RECORD':
				if (!_self.filtersObject.blocks[_self.currentLevel.blockId].records[_self.currentLevel.recordId].filters) {
					_self.filtersObject.blocks[_self.currentLevel.blockId].records[_self.currentLevel.recordId].filters = {};
				}
				processedFilters = _self.processFilters();
				if (processedFilters.length !== 0)
					_self.filtersObject.blocks[_self.currentLevel.blockId].records[_self.currentLevel.recordId].filters[_self.currentLevel.idStructure] =
					processedFilters;
				else
					_self.filtersObject.blocks[_self.currentLevel.blockId].records[_self.currentLevel.recordId].filters[_self.currentLevel.idStructure] = undefined;
				break;
			case "COLUMN":
			    if (!_self.filtersObject.blocks[_self.currentLevel.blockId].records[_self.currentLevel.recordId].columns[_self.currentLevel.columnId].filters) {
					_self.filtersObject.blocks[_self.currentLevel.blockId].records[_self.currentLevel.recordId].columns[_self.currentLevel.columnId].filters = {};
				}
				processedFilters = _self.processFilters();
				if (processedFilters.length !== 0)
					_self.filtersObject.blocks[_self.currentLevel.blockId].records[_self.currentLevel.recordId].columns[_self.currentLevel.columnId].filters =
					processedFilters;
				else
					_self.filtersObject.blocks[_self.currentLevel.blockId].records[_self.currentLevel.recordId].columns[_self.currentLevel.columnId].filters = undefined;
			    break;
			case 'GROUP':
				if (!_self.filtersObject.blocks[_self.currentLevel.blockId].records[_self.currentLevel.recordId].structures[_self.currentLevel.idStructure]
					.groups[_self.currentLevel.groupId].filters) {

					_self.filtersObject.blocks[_self.currentLevel.blockId].records[_self.currentLevel.recordId].structures[_self.currentLevel.idStructure]
						.groups[_self.currentLevel.groupId].filters = {};
				}
				processedFilters = _self.processFilters();
				if (processedFilters.length !== 0)
					_self.filtersObject.blocks[_self.currentLevel.blockId].records[_self.currentLevel.recordId].structures[_self.currentLevel.idStructure]
					.groups[_self.currentLevel.groupId].filters[_self.currentLevel.idStructure] = processedFilters;
				else
					_self.filtersObject.blocks[_self.currentLevel.blockId].records[_self.currentLevel.recordId].structures[_self.currentLevel.idStructure]
					.groups[_self.currentLevel.groupId].filters = undefined;
				break;
			case "GROUP COLUMN":
			    if (!_self.filtersObject.blocks[_self.currentLevel.blockId].records[_self.currentLevel.recordId].structures[_self.currentLevel.idStructure]
                    .groups[_self.currentLevel.groupId].columnFilters) {
                
                    _self.filtersObject.blocks[_self.currentLevel.blockId].records[_self.currentLevel.recordId].structures[_self.currentLevel.idStructure]
                        .groups[_self.currentLevel.groupId].columnFilters = {};
                }
                processedFilters = _self.processFilters();
                if (processedFilters.length !== 0)
                    _self.filtersObject.blocks[_self.currentLevel.blockId].records[_self.currentLevel.recordId].structures[_self.currentLevel.idStructure]
                    .groups[_self.currentLevel.groupId].columnFilters[_self.currentLevel.columnId] = processedFilters;
                else
                    _self.filtersObject.blocks[_self.currentLevel.blockId].records[_self.currentLevel.recordId].structures[_self.currentLevel.idStructure]
                    .groups[_self.currentLevel.groupId].columnFilters[_self.currentLevel.columnId] = undefined;
                break;
			default:
			    break;
		}
	}, 
	recoverFilters: function() {
		var _self = this;
		var filterTarget;
		_self.groupsRef = [];
		_self.groups.html('');

		switch (_self.currentLevel.level) {
			case 'ALL':
				if (_self.filtersObject.filters) {
					filterTarget = _self.filtersObject.filters[_self.currentLevel.idStructure];
				}
				break;
			case 'BLOCK':
				if (_self.filtersObject.blocks[_self.currentLevel.blockId].filters) {
					filterTarget = _self.filtersObject.blocks[_self.currentLevel.blockId].filters[_self.currentLevel.idStructure];
				}
				break;
			case 'RECORD':
				if (_self.filtersObject.blocks[_self.currentLevel.blockId].records[_self.currentLevel.recordId].filters) {
					filterTarget = _self.filtersObject.blocks[_self.currentLevel.blockId].records[_self.currentLevel.recordId].filters[_self.currentLevel
						.idStructure];
				}
				break;
			case 'COLUMN':
			    if (_self.filtersObject.blocks[_self.currentLevel.blockId].records[_self.currentLevel.recordId].columns[_self.currentLevel.columnId].filters) {
					filterTarget = _self.filtersObject.blocks[_self.currentLevel.blockId].records[_self.currentLevel.recordId].columns[_self.currentLevel.columnId].filters;
			    }
			    break;
			case 'GROUP':

				if (_self.filtersObject.blocks[_self.currentLevel.blockId].records[_self.currentLevel.recordId].structures[_self.currentLevel.idStructure]
					.groups[_self.currentLevel.groupId].filters) {

					filterTarget = _self.filtersObject.blocks[_self.currentLevel.blockId].records[_self.currentLevel.recordId].structures[_self.currentLevel
						.idStructure].groups[_self.currentLevel.groupId].filters[_self.currentLevel.idStructure];
				}
				break;
			case "GROUP COLUMN":
			    if (_self.filtersObject.blocks[_self.currentLevel.blockId].records[_self.currentLevel.recordId].structures[_self.currentLevel.idStructure]
					.groups[_self.currentLevel.groupId].columnFilters) {

					filterTarget = _self.filtersObject.blocks[_self.currentLevel.blockId].records[_self.currentLevel.recordId].structures[_self.currentLevel
						.idStructure].groups[_self.currentLevel.groupId].columnFilters[_self.currentLevel.columnId]; 
				}
				break;
			default:
		}

		if (filterTarget) {
			for (var i = 0; i < filterTarget.length; i++) {
				_self.addGroup(filterTarget[i]);
			}
		} else {
			_self.groups.empty();
		}
	},
	getCurrentLevel: function() {
		var _self = this;
		var returnObject = {};
        if(_self.blockId !== null && _self.blockId !== undefined && _self.recordId !== null && _self.recordId !== undefined && _self.groupId !==
			undefined && _self.groupId !== null&&_self.columnId !==
			undefined && _self.columnId !== null){
            returnObject.level = "GROUP COLUMN";
        }
        else if (_self.blockId !== null && _self.blockId !== undefined && _self.recordId !== null && _self.recordId !== undefined && _self.groupId !==
			undefined && _self.groupId !== null) {
			returnObject.level = "GROUP";
		}else if (_self.blockId !== null && _self.blockId !== undefined && _self.recordId !== null && _self.recordId !== undefined && _self.columnId !== null && _self.columnId !== undefined) {
			returnObject.level = "COLUMN";
		}  else if (_self.blockId !== null && _self.blockId !== undefined && _self.recordId !== null && _self.recordId !== undefined) {
			returnObject.level = "RECORD";
		} else if (_self.blockId !== null && _self.blockId !== undefined) {
			returnObject.level = "BLOCK";
		} else {
			returnObject.level = "ALL";
		}

		returnObject.groupId = _self.comboGroup.getKey();

		returnObject.blockId = _self.comboBlocks.getKey();
		returnObject.recordId = _self.comboRecords.getKey();
		returnObject.columnId = _self.comboColumns.getKey(); 
		returnObject.idStructure = _self.comboStructure.getKey();
		return returnObject; 
	},
	getFiltersData: function() { 
		var _self = this;
		return _self.filtersObject;
	},
	processFilters: function() {
		var _self = this;
		var returnObject = [];
		//clear tooltips on exit;
		$('#base-baseTooltip-wrapper').remove();
		//var allGroups = _self.view.find('li.filter-group');
		for (var i = 0; i < _self.groupsRef.length; i++) {
			returnObject.push(_self.groupsRef[i].getOwnData());
		}
		return returnObject;
	},
	getStructureFields: function() {
		var _self = this;
		var fields = _self.coreServices.structure[_self.currentLevel.idStructure].fields;
		var returnFields = [];
		for (var i in fields) {
			returnFields.push(fields[i]);
		}
		return returnFields;
	},
	getRecordFields: function() {
		var _self = this;

		if (_self.currentLevel.level == 'RECORD') {
			var fields = _self.coreServices.structure[_self.currentLevel.idStructure].fields;
			var returnFields = [];
			for (var k in _self.layoutObject.blocks[_self.currentLevel.blockId].records[_self.currentLevel.recordId].columns) {
				if (_self.layoutObject.blocks[_self.currentLevel.blockId].records[_self.currentLevel.recordId].columns[k].fieldId && _self.layoutObject
					.blocks[_self.currentLevel.blockId].records[_self.currentLevel.recordId].columns[k].fieldId != 'recordId') {
					returnFields.push(fields[_self.layoutObject.blocks[_self.currentLevel.blockId].records[_self.currentLevel.recordId].columns[k].fieldId]);
				}
			}
			return returnFields;
		} else {
			return;
		}

	},
	deleteGroup: function(groupIndex) {
		var _self = this;
		var newRef = []
		for (var i = 0; i < _self.groupsRef.length; i++) {
			if (i != groupIndex) {
				newRef.push(_self.groupsRef[i]);
			}
		}
		_self.groupsRef = newRef;
	},
	initTempFilters: function() {
		var _self = this;
		_self.filtersObject = {};
		_self.filtersObject.blocks = {}
		_self.filtersObject.filters = _self.layoutObject.filters;
		for (var i in _self.layoutObject.blocks) {
			_self.filtersObject.blocks[i] = {}
			_self.filtersObject.blocks[i].filters = _self.layoutObject.blocks[i].filters
			_self.filtersObject.blocks[i].records = {};
			for (var j in _self.layoutObject.blocks[i].records) {
				_self.filtersObject.blocks[i].records[j] = {};
				_self.filtersObject.blocks[i].records[j].filters = _self.layoutObject.blocks[i].records[j].filters;
				_self.filtersObject.blocks[i].records[j].columns = {};
				for(var k in _self.layoutObject.blocks[i].records[j].columns){
				     if($.globalFunctions.verifyStructureField(_self.layoutObject.blocks[i].records[j].columns[k])){
						_self.filtersObject.blocks[i].records[j].columns[k] = {}; 
						_self.filtersObject.blocks[i].records[j].columns[k].filters = _self.layoutObject.blocks[i].records[j].columns[k].filters || {};                                          
					} 
				}
				if (_self.layoutObject.groups.blocks) {
					if (_self.layoutObject.groups.blocks[i]) {
						if (_self.layoutObject.groups.blocks[i].records[j]) {
							_self.filtersObject.blocks[i].records[j].structures = {};
							for (var k in _self.layoutObject.groups.blocks[i].records[j].structures) {
								_self.filtersObject.blocks[i].records[j].structures[k] = {
									groups: {}
								};
								for (var l = 0; l < _self.layoutObject.groups.blocks[i].records[j].structures[k].groups.length; l++) {

									_self.filtersObject.blocks[i].records[j].structures[k].groups[l] = {};

									_self.filtersObject.blocks[i].records[j].structures[k].groups[l].filters = _self.layoutObject.groups.blocks[i].records[j].structures[
										k].groups[l].filters;
									_self.filtersObject.blocks[i].records[j].structures[k].groups[l].columnFilters = _self.layoutObject.groups.blocks[i].records[j].structures[
										k].groups[l].columnFilters || {};
								}
							}
						 
						}
					}
				}
			}
		}
	},
	processExhibition: function() {
		var mainCrystal = $('<div>').addClass('dfg-crystal').addClass('dfg-filters');
		$(this.view).find('.filter-conditions').append(mainCrystal);
	},
	validateGroups: function(filters){
	    for(var f = 0; f < filters.length; f++){
	        var filter = filters[f];
	        if(filter.group.length === 0){
	            $.baseToast({
	                text: i18n("FILTER WITHOUT GROUPS"),
	                type: "e"
	            });
	            return false;
	        } 
	        for(var g = 0; g < filter.group.length; g++){
	            var group = filter.group[g];
	            if(group.conditions.length === 0){
	                $.baseToast({
	                    text: i18n("GROUP WITHOUT CONDITIONS"),
	                    type: "e"
	                });
	                return false;
	            }else if(group.fieldId === undefined){
	                $.baseToast({
	                    text: i18n("GROUP WITHOUT FIELD"),
	                    type: "e" 
	                });
	                return false;
	            }else{
	                for(var c = 0 ; c < group.conditions.length; c++){
	                    var condition = group.conditions[c];
	                    if(condition.operator === "IN" || condition.operator === "NOT IN"){
	                        if(!condition.value || !condition.value.values || condition.value.values.length === 0){
	                            $.baseToast({
	                                text: i18n("CONDITION WITHOUT LIST VALUES"),
	                                type: "e"
	                            }); 
	                            return false;
	                        } 
	                        var idStructure = this.currentLevel.idStructure;
	                        var idField = group.fieldId;
	                        var type = this.coreServices.structure[idStructure].fields[idField].type;
	                        if(type === "DECIMAL" || type === "INTEGER" || type === "DOUBLE"){
	                            for(var v = 0; v < condition.value.values.length; v++){
	                                if((condition.value.values[v].name) || condition.value.values[v].name === ""){
	                                    $.baseToast({
    	                                    text: i18n("INVALID PROCEDURE"),
    	                                    type: "e"
    	                                });
    	                                return false;
	                                }
	                            }
	                        }
	                    }else{
	                        var idStructure = this.currentLevel.idStructure;
	                        var idField = group.fieldId;
	                        var type = this.coreServices.structure[idStructure].fields[idField].type;
	                        if(type === "DECIMAL" || type === "INTEGER" || type === "DOUBLE"){
	                            if(isNaN(condition.value) || condition.value === ""){
	                                $.baseToast({
	                                    text: i18n("INVALID PROCEDURE"),
	                                    type: "e"
	                                });
	                                return false;
	                            }
	                        }
	                    }
	                }
	            }
	            
	        }
	    }
	    return true;
	},
	validateFilters: function() {
		var _self = this;
		var layoutFilters;
		var globalFilters;
		var recordFilters;
		var columnFilters;
		var type;
		var newFilters;
        
       
		if (_self.blockId === null || _self.blockId === undefined) {
			type = 0;

		} else {
			if (_self.recordId === null || _self.recordId === undefined) {
				type = 1;
			} else {
				if(_self.columnId !== null && _self.columnId !== undefined && _self.groupId === null && _self.groupId === undefined){
				    type = 4;
				}else if (_self.columnId !== null && _self.columnId !== undefined && _self.groupId !== null && _self.groupId !== undefined){
				    type = 5;
				}else if (_self.groupId === null || _self.groupId === undefined)
					type = 2;
				else {
				    type = 3;
				}
					
			}
		}

		switch (type) {
			case 0:
				newFilters = _self.filtersObject.filters ? _self.filtersObject.filters[_self.structureId] : undefined;
				break;
			case 1:
				layoutFilters = _self.layoutObject.filters ? _self.layoutObject.filters[_self.structureId] : undefined;
				newFilters = _self.filtersObject.blocks[_self.blockId].filters ? _self.filtersObject.blocks[_self.blockId].filters[_self.structureId] :
					undefined;
				break;
			case 2:
				layoutFilters = _self.layoutObject.blocks[_self.blockId].filters ? _self.layoutObject.blocks[_self.blockId].filters[_self.structureId] :
					undefined;
				globalFilters = _self.layoutObject.filters ? _self.layoutObject.filters[_self.structureId] : undefined;
				newFilters = _self.filtersObject.blocks[_self.blockId].records[_self.recordId].filters ? _self.filtersObject.blocks[_self.blockId].records[
					_self.recordId].filters[_self.structureId] : undefined;
				break;
			case 3:
				recordFilters = _self.layoutObject.blocks[_self.blockId].records[_self.recordId].filters ? _self.layoutObject.blocks[_self.blockId].records[
					_self.recordId].filters[_self.structureId] : undefined;
				layoutFilters = _self.layoutObject.blocks[_self.blockId].filters ? _self.layoutObject.blocks[_self.blockId].filters[_self.structureId] :
					undefined;
				globalFilters = _self.layoutObject.filters ? _self.layoutObject.filters[_self.structureId] : undefined;
				newFilters = _self.filtersObject.blocks[_self.blockId].records[_self.recordId].structures[_self.structureId].groups[_self.groupId].filters ?
					_self.filtersObject.blocks[_self.blockId].records[_self.recordId].structures[_self.structureId].groups[_self.groupId].filters[_self.structureId] :
					undefined;
				break;
			case 4:
			 //   columnFilters = _self.layoutObject.blocks[_self.blockId].records[_self.recordId].columns[_self.columnId].filters ? _self.layoutObject.blocks[_self.blockId].records[
				// 	_self.recordId].columns[_self.columnId]: undefined;
			    recordFilters = _self.layoutObject.blocks[_self.blockId].records[_self.recordId].filters ? _self.layoutObject.blocks[_self.blockId].records[
					_self.recordId].filters[_self.structureId] : undefined;
				layoutFilters = _self.layoutObject.blocks[_self.blockId].filters ? _self.layoutObject.blocks[_self.blockId].filters[_self.structureId] :
					undefined;
				globalFilters = _self.layoutObject.filters ? _self.layoutObject.filters[_self.structureId] : undefined;
				newFilters = _self.filtersObject.blocks[_self.blockId].records[_self.recordId].columns[_self.columnId].filters ?
					_self.filtersObject.blocks[_self.blockId].records[_self.recordId].columns[_self.columnId].filters :
					undefined;
				break;
			case 5:
			     recordFilters = _self.layoutObject.blocks[_self.blockId].records[_self.recordId].filters ? _self.layoutObject.blocks[_self.blockId].records[
					_self.recordId].filters[_self.structureId] : undefined;
				layoutFilters = _self.layoutObject.blocks[_self.blockId].filters ? _self.layoutObject.blocks[_self.blockId].filters[_self.structureId] :
					undefined;
				globalFilters = _self.layoutObject.filters ? _self.layoutObject.filters[_self.structureId] : undefined;
				newFilters = _self.filtersObject.blocks[_self.blockId].records[_self.recordId].structures[_self.structureId].groups[_self.groupId].columnFilters ?
					_self.filtersObject.blocks[_self.blockId].records[_self.recordId].structures[_self.structureId].groups[_self.groupId].columnFilters[_self.columnId] :
					undefined;
			    break;
			    
		}

		if (newFilters) {
             if(!_self.validateGroups(newFilters)){
                return false;
            }else{
    			for (var i = 0; i < newFilters.length; i++) {
    
    				for (var j = 0; j < newFilters[i].group.length; j++) {
    					var actualGroup = newFilters[i].group[j];
    
    					if (layoutFilters) {
    						if (!_self.compareGroups(actualGroup, layoutFilters)) {
    							$.baseToast({
    								text: i18n("FILTER CONFRONTATION"),
    								type: 'W'
    							});
    							return false;
    						}
    					}
    					if (globalFilters) {
    						if (!_self.compareGroups(actualGroup, globalFilters)) {
    							$.baseToast({
    								text: i18n("FILTER CONFRONTATION"),
    								type: 'W'
    							});
    							return false;
    						}
    					}
    					if (recordFilters) {
    						if (!_self.compareGroups(actualGroup, recordFilters)) {
    							$.baseToast({
    								text: i18n("FILTER CONFRONTATION"),
    								type: 'W'
    							});
    							return false;
    						}
    					}
    					if(columnFilters){
    					    if (!_self.compareGroups(actualGroup, columnFilters)) {
    							$.baseToast({
    								text: i18n("FILTER CONFRONTATION"),
    								type: 'W'
    							});
    							return false;
    						}
    					}
    
    				}
    			}
    			if (type !== 3 && type !== 5) {
    
    				if (!_self.validateGroupFilters(type, newFilters)) {
    					return false;
    				}
    			}
            } 
		}
		return true;
	},
	validateGroupFilters: function(type, actualGroup) {
		var _self = this;
		var idBlock = _self.blockId;
		var idRecord = _self.recordId;
		var idColumn = _self.columnId;
		if (type === 0) {

			for (var i in _self.layoutObject.groups.blocks) {
				for (var j in _self.layoutObject.groups.blocks[i].records) {
					for (var k in _self.layoutObject.groups.blocks[i].records[j].structures) {
						for (var l = 0; l < _self.layoutObject.groups.blocks[i].records[j].structures[k].groups.length; l++) {
							var groupFilter = _self.layoutObject.groups.blocks[i].records[j].structures[k].groups[l].filters;
							if (groupFilter) {
								for (var n = 0; n < groupFilter[_self.structureId].length; n++)
									for (var m = 0; m < groupFilter[_self.structureId][n].group.length; m++) {
										if (!_self.compareGroups(groupFilter[_self.structureId][n].group[m], actualGroup)) {
											$.baseToast({
												text: i18n("FILTER CONFRONTATION GROUP START") + " " + _self.layoutObject.blocks[i].records[j].name + " " + i18n(
													"FILTER CONFRONTATION GROUP END"),
												type: 'W'
											});
											return false;
										}
									}

							}
						}
					}
				}
			}

		}
		if (type === 1) {

			if (_self.layoutObject.groups.blocks[idBlock])
				for (var j in _self.layoutObject.groups.blocks[idBlock].records) {
					for (var k in _self.layoutObject.groups.blocks[idBlock].records[j].structures) {
						for (var l = 0; l < _self.layoutObject.groups.blocks[idBlock].records[j].structures[k].groups.length; l++) {
							var groupFilter = _self.layoutObject.groups.blocks[idBlock].records[j].structures[k].groups[l].filters;
							if (groupFilter) {
								for (var n = 0; n < groupFilter[_self.structureId].length; n++)
									for (var m = 0; m < groupFilter[_self.structureId][n].group.length; m++) {
										if (!_self.compareGroups(groupFilter[_self.structureId][n].group[m], actualGroup)) {
											$.baseToast({
												text: i18n("FILTER CONFRONTATION GROUP START") + " " + _self.layoutObject.blocks[idBlock].records[j].name + " " + i18n(
													"FILTER CONFRONTATION GROUP END"),
												type: 'W'
											});
											return false;
										}
									}
							}
						}
					}
				}

		}
		if (type === 2) {

			if (_self.layoutObject.groups.blocks[idBlock])
				if (_self.layoutObject.groups.blocks[idBlock].records[idRecord])
					for (var k in _self.layoutObject.groups.blocks[idBlock].records[idRecord].structures) {
						for (var l = 0; l < _self.layoutObject.groups.blocks[idBlock].records[idRecord].structures[k].groups.length; l++) {
							var groupFilter = _self.layoutObject.groups.blocks[idBlock].records[idRecord].structures[k].groups[l].filters;

							if (groupFilter) {
								for (var n = 0; n < groupFilter[_self.structureId].length; n++)
									for (var m = 0; m < groupFilter[_self.structureId][n].group.length; m++) {
										if (!_self.compareGroups(groupFilter[_self.structureId][n].group[m], actualGroup)) {
											$.baseToast({
												text: i18n("FILTER CONFRONTATION GROUP START") + " " + _self.layoutObject.blocks[idBlock].records[idRecord].name + " " + i18n(
													"FILTER CONFRONTATION GROUP END"),
												type: 'W'
											});
											return false;
										}
									}
							}
						}
					}
		}
	
		return true;
	},
	compareGroups: function(actualGroup, otherFilters) {
		var _self = this;
		for (var k = 0; k < otherFilters.length; k++) {
			for (var l = 0; l < otherFilters[k].group.length; l++) {
				var layoutGroup = otherFilters[k].group[l];

				if (actualGroup.fieldId === layoutGroup.fieldId) {
					var possibleValues = {
						"=": [],
						"<>": [],
						">": [],
						">=": [],
						"<": [],
						"<=": [],
						"IN": [],
						"NOT IN": [],
						"CONTAINS": [],
						"NOT CONTAINS": [],
						"BW": [],
						"NOT BW": [],
						"FW": [],
						"NOT FW": [],

					};

					for (var m = 0; m < layoutGroup.conditions.length; m++) {
						if (layoutGroup.conditions[m].operator === "IN" || layoutGroup.conditions[m].operator === "NOT IN") {
							possibleValues[layoutGroup.conditions[m].operator] = layoutGroup.conditions[m].value.values;
						} else {
							possibleValues[layoutGroup.conditions[m].operator].push(layoutGroup.conditions[m].value);
						}

					}
					console.log(possibleValues);
					console.log(layoutGroup);
					console.log(actualGroup)
					for (var m = 0; m < actualGroup.conditions.length; m++) {

						switch (actualGroup.conditions[m].operator) {

							case "IN":
								for (var n = 0; n < actualGroup.conditions[m].value.values.length; n++) {
									if (possibleValues[actualGroup.conditions[m].value.values[n].oper].length > 0 && possibleValues[actualGroup.conditions[m].value.values[
										n].oper].indexOf(actualGroup.conditions[m].value.values[n]) === -1) {
										return false;
									}
									for (var l = 0; l < possibleValues["IN"].length; l++) {
										if (possibleValues["IN"][l].oper !== actualGroup.conditions[m].value.values[n].oper && possibleValues["IN"][l].name ===
											actualGroup.conditions[m].value.values[n].name) {
											return false;
										}

									}
									for (var l = 0; l < possibleValues["NOT IN"].length; l++) {
										if (possibleValues["NOT IN"][l].oper === actualGroup.conditions[m].value.values[n].oper && possibleValues["NOT IN"][l].name ===
											actualGroup.conditions[m].value.values[n].name) {
											return false;
										}

									}
								}
								break;
							case "NOT IN":
								for (var n = 0; n < actualGroup.conditions[m].value.values.length; n++) {
									if (possibleValues[actualGroup.conditions[m].value.values[n].oper].length > 0 && possibleValues[actualGroup.conditions[m].value.values[
										n].oper].indexOf(actualGroup.conditions[m].value.values[n]) === -1) {
										return false;
									}
									for (var l = 0; l < possibleValues["NOT IN"].length; l++) {
										if (possibleValues["NOT IN"][l].oper !== actualGroup.conditions[m].value.values[n].oper && possibleValues["NOT IN"][l].name ===
											actualGroup.conditions[m].value.values[n].name) {
											return false;
										}

									}
									for (var l = 0; l < possibleValues["IN"].length; l++) {
										if (possibleValues["IN"][l].oper === actualGroup.conditions[m].value.values[n].oper && possibleValues["IN"][l].name ===
											actualGroup.conditions[m].value.values[n].name) {
											return false;
										}

									}
								}
								break;
							default:
								if (possibleValues[actualGroup.conditions[m].operator].length > 0 && possibleValues[actualGroup.conditions[m].operator].indexOf(
									actualGroup.conditions[m].value) === -1) {
									return false;
								} 
								for (var l = 0; l < possibleValues["NOT IN"].length; l++) {
									if (possibleValues["NOT IN"][l].oper === actualGroup.conditions[m].operator && possibleValues["NOT IN"][l].name === actualGroup.conditions[
										m].value) {
										return false;
									}

								}
								var isContained = false;
								for (var l = 0; l < possibleValues["IN"].length; l++) {
									if (possibleValues["IN"][l].oper !== actualGroup.conditions[m].operator && possibleValues["IN"][l].name === actualGroup.conditions[
										m].value) {
										return false;
									}
									if (possibleValues["IN"][l].name === actualGroup.conditions[m].value && possibleValues["IN"][l].oper === actualGroup.conditions[m]
										.operator) {
										isContained = true;
									}

								}

								if (!isContained && possibleValues["IN"].length > 0) {
									return false
								}
								break;

						}

					}
				}
			}
		}
		return true;

	}
});