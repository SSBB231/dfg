sap.ui.controller("app.controllers.dialogs.format.Format", {

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
		_self.layoutObject = _self.coreServices.layoutObject;
		//Initialize temporary objects
		_self.initTempFormat();

		var comboOptions = [{
			key: null,
			name: i18n('ALL')
        }].concat($.globalFunctions.getBlockOptions(_self.layoutObject, true, true));

		_self.comboBlocks = $('#comboBlocks').bindBaseSelect({
			options: comboOptions,
            disableSort: true,
			onChange: function(oldVal, newVal) {
				if (oldVal.key != newVal.key) {
					_self.updateFormatObject();
					if (newVal.key != null) {
						var comboOptions = [{
							key: null,
							name: i18n('ALL')
                        }].concat(newVal.records);

						$('#comboRecords').html('');
						_self.comboRecords = $('#comboRecords').bindBaseSelect({
							tooltip: i18n('RECORD SELECT TOOLTIP'),
							options: comboOptions,
                            disableSort: true,
							onChange: function(oldVal, newVal) {
								if (oldVal.key != newVal.key) {
									_self.updateFormatObject();
									if (newVal.key != null) {
										var comboOptions = [{
											key: null,
											name: i18n('ALL')
                                        }].concat(newVal.columns);
										$('#comboColumns').html('');
										_self.comboColumns = $('#comboColumns').bindBaseSelect({
											options: comboOptions,
                                            disableSort: true,
											tooltip: i18n('FIELD SELECT TOOLTIP'),
											onChange: function(oldVal, newVal) {
												if (oldVal.key != newVal.key && oldVal.key != '') {
													_self.updateFormatObject();
													_self.currentLevel = _self.getCurrentLevel();

													_self.renderTabData();
												}
											}
										});
										_self.comboColumns.setKey(null);
									} else {
										$('#comboColumns').html('');
										var fieldOptions = $.globalFunctions.getFieldColumnOptions(_self.layoutObject, _self.comboBlocks.getKey());
										if (fieldOptions.length) {
											_self.comboColumns = $('#comboColumns').bindBaseSelect({
												options: fieldOptions,
                                                disableSort: true,
												tooltip: i18n('FIELD SELECT TOOLTIP'),
												onChange: function(oldVal, newVal) {
													_self.updateFormatObject(true);
													_self.currentLevel = _self.getCurrentLevel(true);
													_self.currentLevel.columnData = newVal;
													_self.renderTabData();
												}
											});
										} else {
											_self.comboColumns = $('#comboColumns').bindBaseSelect({
												options: [],
												isDisabled: true,
												tooltip: i18n('FIELD SELECT TOOLTIP'),
												onChange: function(oldVal, newVal) {}
											});
										}

									}
									_self.currentLevel = _self.getCurrentLevel();
									_self.renderTabData();
								}
							}
						});
						_self.comboRecords.setKey(null); 
					} else {
						$('#comboRecords').html('');
						_self.comboRecords = $('#comboRecords').bindBaseSelect({
							options: comboOptions,
                            disableSort: true,
							tooltip: i18n('RECORD SELECT TOOLTIP'),
							isDisabled: true,
							onChange: function(oldVal, newVal) {}
						});
						$('#comboColumns').html('');
                        var fieldOptions = $.globalFunctions.getFieldColumnOptions(_self.layoutObject);
                        if (fieldOptions.length) {
                            _self.comboColumns = $('#comboColumns').bindBaseSelect({
                                options: fieldOptions,
                                disableSort: true,
                                tooltip: i18n('FIELD SELECT TOOLTIP'),
                                onChange: function(oldVal, newVal) {
                                    _self.updateFormatObject(true);
                                    _self.currentLevel = _self.getCurrentLevel(true);
                                    _self.currentLevel.columnData = newVal;
                                    _self.renderTabData();
                                }
                            });
                        }else{
                            $('#comboColumns').html('');
        					_self.comboColumns = $('#comboColumns').bindBaseSelect({
        						options: [],
        						isDisabled: true,
        						tooltip: i18n('FIELD SELECT TOOLTIP'),
        						onChange: function(oldVal, newVal) {}
        					});
                        }
					}
					
					_self.currentLevel = _self.getCurrentLevel();
					_self.renderTabData();
				}
			},
			tooltip: i18n('BLOCK SELECT TOOLTIP')
		});

		_self.comboRecords = $('#comboRecords').bindBaseSelect({
			options: comboOptions,
            disableSort: true,
			isDisabled: true,
			onChange: function(oldVal, newVal) {},
			//tooltip: i18n('RECORD SELECT TOOLTIP')
		});

		_self.comboColumns = $('#comboColumns').bindBaseSelect({
			options: comboOptions,
            disableSort: true,
			isDisabled: true,
			onChange: function(oldVal, newVal) {},
			//tooltip: i18n('FIELD SELECT TOOLTIP')
		});
		_self.renderTabData();
		_self.currentLevel = _self.getCurrentLevel();
		_self.comboBlocks.setKey(null);
	},
	getCurrentLevel: function(isGeneralField) {
		var _self = this;
		var returnObject = {};
		if (_self.comboColumns.getKey()) {
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
		returnObject.isGeneralField = isGeneralField;
		if (returnObject.level === "FIELD" && !isGeneralField) {
			returnObject.idStructure = _self.coreServices.layoutObject.blocks[returnObject.blockId].records[returnObject.recordId].columns[
				returnObject.columnId].idStructure;
		}
		return returnObject;
	},
	initValues: function() {
		var _self = this;
		var _data = _self.getData();
		if(_data.initLevel){ 
    		_self.comboBlocks.setKey(_data.initLevel.blockId);
    		_self.comboRecords.setKey(_data.initLevel.recordId);
		}
		if (_data.initLevel && _data.initLevel.canEditColumnName) {
			$('#comboColumns').html('');
			_self.comboColumns = $('#comboColumns').bindBaseInput({
				tooltip: i18n('CLICK/PRESS ENTER TO FILL COLUMN NAME'),
				required: true
			});
			_self.updateFormatObject();
			_self.currentLevel = _data.initLevel;
			_self.currentLevel.level = "FIELD";
			_self.renderTabData(_self.currentLevel);
			var column = _self.layoutObject.blocks[_data.initLevel.blockId].records[_data.initLevel.recordId].columns[_data.initLevel
				.columnId] || _self._data.initLevel.column || {};
			_self.comboColumns.setText(column.label || "");
		} else {
		    if(_data.initLevel){
    			_self.comboColumns.setKey(_data.initLevel.columnId);
    			_self.comboColumns.disable();
		    }
		}

		_self.comboBlocks.disable();
		_self.comboRecords.disable();

	},
	validate: function(){
	    var _self = this;  
	    var _data = _self._data;
	    if(_data.initLevel && _data.initLevel.canEditColumnName){
	        return _self.comboColumns.getText().length !== 0;
	    }
	    return true;
	},
	getColumnData: function(){
	    var _self = this;
	    _self.updateFormatObject();
	    _self._data.initLevel.column.format = _self.formatObject.blocks[_self._data.initLevel.blockId].records[_self._data.initLevel.recordId].columns[_self._data.initLevel.columnId].format;
	    return _self._data.initLevel.column;
	},
	getFormatData: function() {
		var _self = this;
		return _self.formatObject;
	},
	renderTabData: function(currentLevel) {
		var _self = this;
		var currFormat = {
			string: null,
			number: null,
			date: null,
			hour: null
		};
		var isHourFormat = false;
		var currentLevel = _self.currentLevel || _self.getCurrentLevel();
		$('#dfg-format-dialog .tab-content').html('');
		var type = "";
		switch (currentLevel.level) {
			case 'ALL':
				if (_self.formatObject.format) {
					currFormat = _self.formatObject.format;
				}
				break;
			case 'BLOCK':
				if (_self.formatObject.blocks[currentLevel.blockId].format) {
					currFormat = _self.formatObject.blocks[currentLevel.blockId].format;
				}
				break;
			case 'RECORD':
				if (_self.formatObject.blocks[currentLevel.blockId].records[currentLevel.recordId].format) {
					currFormat = _self.formatObject.blocks[currentLevel.blockId].records[currentLevel.recordId].format;
				}
				break;
			case 'FIELD':
				var column;
				if (currentLevel.isGeneralField) {
					type = currentLevel.columnData.type;
					var commonFormat = null;
					var areCommon = true;
                    var setFormat = function(blockId){
                        for(var r in  _self.layoutObject.blocks[blockId].records){
                            if(!areCommon){
                                break;
                            }
                            for(var c in _self.layoutObject.blocks[blockId].records[r].columns){
                                var column = _self.layoutObject.blocks[blockId].records[r].columns[c];
                                if(!column && _self._data.initLevel){
                                    column = _self._data.initLevel.column || {};
                                }
                                if(column.fieldId+"" === currentLevel.columnId.split("_")[0] && column.idStructure+"" === currentLevel.columnId.split("_")[1]){
                                    if(_self.formatObject.blocks[blockId].records[r].columns[c].format){
                                        if(!commonFormat){
                                            commonFormat = _self.formatObject.blocks[blockId].records[r].columns[c].format[type.toLowerCase()];
                                        }else{
                                            if(JSON.stringify(commonFormat) !== JSON.stringify(_self.formatObject.blocks[blockId].records[r].columns[c].format[type.toLowerCase()])){
                                                commonFormat = null;
                                                areCommon = false;
                                                break;
                                            }
                                        }
                                    }
                                    break;
                                }
                            }
                        }
                    };
                    if(currentLevel.blockId){
                        setFormat(currentLevel.blockId);
                    }else{
                        for(var b in _self.layoutObject.blocks){
                             if(!areCommon){
                                break;
                            }
                            setFormat(b);
                        }
                    }
                    currFormat[type.toLowerCase()] = commonFormat;
				} else {
					column = _self.coreServices.layoutObject.blocks[currentLevel.blockId].records[currentLevel.recordId].columns[currentLevel.columnId];
					if(!column && _self._data.initLevel){
					    column = _self._data.initLevel.column || {};
					}
					type = $.globalFunctions.getColumnType(column, _self.coreServices.structure, true);
					if (_self.formatObject.blocks[currentLevel.blockId].records[currentLevel.recordId].columns[currentLevel.columnId].format) {
						if (type === "STRING") {
							currFormat.string = _self.formatObject.blocks[currentLevel.blockId].records[currentLevel.recordId].columns[currentLevel.columnId].format
								.string;
						}
						if (type === "NUMBER") {
							currFormat.number = _self.formatObject.blocks[currentLevel.blockId].records[currentLevel.recordId].columns[currentLevel.columnId].format
								.number;
						}
						if (type === "DATE") {
							currFormat.date = _self.formatObject.blocks[currentLevel.blockId].records[currentLevel.recordId].columns[currentLevel.columnId].format
								.date;
						}
						if (type === "HOUR") {
							currFormat.hour = _self.formatObject.blocks[currentLevel.blockId].records[currentLevel.recordId].columns[currentLevel.columnId].format
								.hour;
						}
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
			if (type === "STRING") {
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
			if (type === "NUMBER") {
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
			if (type === "DATE") {
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
			if (type === "HOUR") {
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
			});
 
		}
		if (_self.coreServices.exhibition) {
			_self.processExhibition();
		}

	},
	updateFormatObject: function() {
		var _self = this;
		var _data = _self._data;
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
				_self.formatObject.blocks[currentLevel.blockId].records[currentLevel.recordId].format.string = _self.tabController.getInnerController(
					0).getOwnData();
				_self.formatObject.blocks[currentLevel.blockId].records[currentLevel.recordId].format.number = _self.tabController.getInnerController(
					1).getOwnData();
				_self.formatObject.blocks[currentLevel.blockId].records[currentLevel.recordId].format.date = _self.tabController.getInnerController(2)
					.getOwnData();
				_self.formatObject.blocks[currentLevel.blockId].records[currentLevel.recordId].format.hour = _self.tabController.getInnerController(3)
					.getOwnData();
				break;
			case 'FIELD':
				var assignFormat = function(format, type) {
					var assignFormatXBlock = function(blockId) {
						for (var r in _self.layoutObject.blocks[blockId].records) {
							for (var c in _self.layoutObject.blocks[blockId].records[r].columns) {
								var column = JSON.parse(JSON.stringify(_self.layoutObject.blocks[blockId].records[r].columns[c]));
								if(!column && _self._data.initLevel){
								    column = _self._data.initLevel.column || {};
								} 
								if (column.fieldId) {
									if (column.fieldId+"" === currentLevel.columnId.split("_")[0] && column.idStructure+"" === currentLevel.columnId.split("_")[1]) {
										if (!_self.formatObject.blocks[blockId].records[r].columns[c].format) {
											_self.formatObject.blocks[blockId].records[r].columns[c].format = {};
										}
										switch (type) { 
											case "STRING":
												_self.formatObject.blocks[blockId].records[r].columns[c].format.string = format;
												break;
											case "NUMBER":
												_self.formatObject.blocks[blockId].records[r].columns[c].format.number = format;
												break;
											case "DATE":
												_self.formatObject.blocks[blockId].records[r].columns[c].format.date = format;
												break;
											case "HOUR":
												_self.formatObject.blocks[blockId].records[r].columns[c].format.hour = format;
												break;
										}
									}
								}
							}
						}
					};
					if (currentLevel.blockId) {
						assignFormatXBlock(currentLevel.blockId);
					} else {
						for (var b in _self.layoutObject.blocks) {
							assignFormatXBlock(b);
						}
					}
				};
				if (!currentLevel.isGeneralField) {
					_self.formatObject.blocks[currentLevel.blockId].records[currentLevel.recordId].columns[currentLevel.columnId].format = {
						string: null,
						number: null,
						date: null,
						hour: null
					};
				} else {
					assignFormat(null, "STRING");
					assignFormat(null, "NUMBER");
					assignFormat(null, "DATE");
					assignFormat(null, "HOUR");
				}
				var column, type;
				if (currentLevel.isGeneralField) {
					type = currentLevel.columnData.type;
				} else {
					column = _self.coreServices.layoutObject.blocks[currentLevel.blockId].records[currentLevel.recordId].columns[currentLevel.columnId];
					if(!column && _self._data.initLevel){
					    column = _self._data.initLevel.column || {};
					}
				}

				if (_data.initLevel && _data.initLevel.canEditColumnName && _self.comboColumns.getText()) {
					column.label = _self.comboColumns.getText();
				}
				type = type || $.globalFunctions.getColumnType(column, _self.coreServices.structure, true);
				var format = _self.tabController.getInnerController(0).getOwnData();
				if (type === "STRING") {
					if (currentLevel.isGeneralField) {
						assignFormat(format, type);
					} else {
						_self.formatObject.blocks[currentLevel.blockId].records[currentLevel.recordId].columns[currentLevel.columnId].format.string = format;
					}

				}
				if (type === "NUMBER") {
					if (currentLevel.isGeneralField) {
						assignFormat(format, type);
					} else {
						_self.formatObject.blocks[currentLevel.blockId].records[currentLevel.recordId].columns[currentLevel.columnId].format.number = format;
					}
				}
				if (type === "DATE") {
					if (currentLevel.isGeneralField) {
						assignFormat(format, type);
					} else {
						_self.formatObject.blocks[currentLevel.blockId].records[currentLevel.recordId].columns[currentLevel.columnId].format.date = format;
					}
				}
				if (type === "HOUR") {
					if (currentLevel.isGeneralField) {
						assignFormat(format, type);
					} else {
						_self.formatObject.blocks[currentLevel.blockId].records[currentLevel.recordId].columns[currentLevel.columnId].format.hour = format;
					}
				}
				if (!currentLevel.isGeneralField) {
					if (!(_self.formatObject.blocks[currentLevel.blockId].records[currentLevel.recordId].columns[currentLevel.columnId].format.string ||
						_self.formatObject.blocks[currentLevel.blockId].records[currentLevel.recordId].columns[currentLevel.columnId].format.number ||
						_self.formatObject.blocks[currentLevel.blockId].records[currentLevel.recordId].columns[currentLevel.columnId].format.date ||
						_self.formatObject.blocks[currentLevel.blockId].records[currentLevel.recordId].columns[currentLevel.columnId].format.hour)) {
						delete _self.formatObject.blocks[currentLevel.blockId].records[currentLevel.recordId].columns[currentLevel.columnId].format;
					}
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
		if(_self._data.initLevel){
    		if(!_self.formatObject.blocks[_self._data.initLevel.blockId].records[_self._data.initLevel.recordId].columns[_self._data.initLevel.columnId]){
    		    _self.formatObject.blocks[_self._data.initLevel.blockId].records[_self._data.initLevel.recordId].columns[_self._data.initLevel.columnId] = {
    		        "format": {}
    		    };
    		}
		}
	},
	processExhibition: function() {
		var mainCrystal = $('<div>').addClass('dfg-crystal').addClass('dfg-format');
		$('.newFile .dialog-content #baseTabs-wrapper').append(mainCrystal);
	}

});