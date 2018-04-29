sap.ui.controller("app.controllers.executoran3.rightContent", {
	onInit: function() {},
	onDataRefactor: function(data) {
		return $.extend(data, this.data);
	},
	onAfterRendering: function(html) {
		var _self = this;
		if(_self.privileges && !_self.privileges.Access){
		    $.baseToast({
		        type: "W",
		        text: i18n("NO ACCESS PRIVILEGES FOUND")
		    });
		    window.location = "/timp/tkb/#/content";
		} 
		$("#overlapRight").hide();
		_self.view = $(html);
		_self.view.toolbar = _self.view.find("#toolbarTop");
		_self.view.executorWrapper = _self.view.find(".executor-wrapper");
		_self.view.reportContainer = _self.view.find(".rule-report-container");
		_self.view.rulePaginator = _self.view.find(".rule-paginator");
		_self.view.filterCB = _self.view.find(".cb-filter");
		_self.view.paginator = _self.view.find(".paginator");
		_self.hiddenColumnsXRules = {};
		_self.loader = _self.view.find(".rule-report-container").baseLoader({
			modal: true
		});
		_self.view.rulePaginator.ctrl = _self.view.rulePaginator.bindBasePaginator({
			totalPages: 1,
			actualPage: 1,
		});
		_self.view.paginator.ctrl = _self.view.paginator.bindBasePaginator({
			totalPages: 1,
			actualPage: 1,
		});
	
		_self.view.filterCB.validComparisons = _self.view.filterCB.bindBaseRadioButton({
			id: 1,
			text: i18n("SHOW VALID COMPARISONS"),
			tooltip: i18n("CLICK TO SHOW VALID COMPARISONS"),
			name: 'filter',
			//class: 'warning',
			onChange: _self.showValidComparisons.bind(_self)
		});
		_self.view.filterCB.allComparisons = _self.view.filterCB.bindBaseRadioButton({
			id: 1,
			text: i18n("SHOW ALL COMPARISONS"),
			tooltip: i18n("CLICK TO SHOW ALL COMPARISONS"),
			name: 'filter',
			//class: 'warning',
			onChange: _self.showAllComparisons.bind(_self)
		});
		_self.renderToolbar();
		_self.loader.open();
		_self.addServices();
		Data.endpoints.dfg.an3.read.post({
			id: window.parameters.id
		}).success(function(data) {
			var itemPanel = {
				panel: {
					properties: [{
						field: "idDigitalFile",
						value: parseInt(window.parameters.id)
                    }]
				}
			};
			if (window.parameters.idReport)
				itemPanel.panel.properties.push({
					field: "idReport",
					value: parseInt(window.parameters.idReport)
				});
			itemPanel.setting = {
				origin: data.origin,
				idDigitalFile: data.idDigitalFile,
				digitalFileTypeText: data.digitalFileTypeText.name,
				idTax: data.idTax
			};
			_self.an3 = data;
			
			_self.layoutJSON = JSON.parse(data.layoutVersion.json);
			Data.endpoints.dfg.panel.readSettingPanel.post(itemPanel).success(function(panel) {
				_self.panel = panel.panel;
				_self.settingPanel = panel.setting;
				if (_self.panel.length && _self.panel[0].status === "VALIDATING")
					_self.view.toolbar.ctrl.enableButton(3);
				_self.structure = {};
				var tempFields;
				data.structure.map(function(s) {
					_self.structure[s.id] = JSON.parse(s.structure);
					tempFields = {};
					_self.structure[s.id].fields.map(function(f) {
						tempFields[f.ID] = f;
					});
					_self.structure[s.id].fields = tempFields;
				});
				_self.abas();
				if(window.parameters.calendar){
        		    _self.execute();
        		}
				if (data.reports && data.reports.length > 0 && !window.parameters.calendar) {
					if (window.parameters.idReport) {
						var repor;
						var id = parseInt(window.parameters.idReport);
						for (var i = 0; i < data.reports.length; i++) {
							if (parseInt(data.reports[i].id) === id) {
								repor = JSON.parse(data.reports[i].report);
								break;
							}
						}
						_self.renderReport();
						_self.renderExecutedReport(repor, id);
					} else {
						_self.reportsDialog = $.baseDialog({
							title: i18n("REPORT ALREADY EXISTS"),
							modal: true,
							size: "big",
							outerClick: "disabled",
							viewName: "app.views.executoran3.listReports",
							viewData: {
								renderExecutedReport: _self.renderExecutedReport,
								reports: data.reports
							},
							buttons: [{
								name: i18n("NO"),
								onPress: _self.renderReport(),
								isCloseButton: true
                            }]
						});
						_self.reportsDialog.open();
					}
				} else {
					_self.renderReport();
				}

				_self.loader.close();
			}).error(function() {
				window.location = "#/library?restoreSettings=1";
			});
		}).error(function(data) {
			window.location = "#/library?restoreSettings=1";
		});
	},
	addServices: function() {
		var _self = this;
		_self.coreServices.renderExecutedReport = function(report, id) {
			_self.renderExecutedReport(report, id);
		}
	},
	renderReport: function() {
		var _self = this;
		_self.view.reportContainer.empty();
		var date = new Date();
		_self.reportHeader = {
			digitalFileType: _self.an3.digitalFileTypeText.name,
			auditoryDate: date.toLocaleDateString(sessionStorage.lang !== "enus" ? "pt-BR" : "en-US"),
			auditoryHour: date.toLocaleTimeString(sessionStorage.lang !== "enus" ? "pt-BR" : "en-US"),
			idLayout: "ID" + _self.an3.layoutVersion.idLayout,
			idSetting: _self.an3.setting.idSetting ? "ID" + _self.an3.setting.idSetting : "",
			origin: _self.an3.origin != "DFG" ? i18n(_self.an3.origin) : "DFG",
			company: _self.an3.idCompany,
			branch: _self.an3.idBranch
		};
		_self.view.report = _self.view.reportContainer.bindAn3Report({
			header: _self.reportHeader,
			reportTable: {
				columns: {
					"resultColumn": {
						name: i18n("RESULT"),
						columnClass: "header"
					}
				},
				columnPositions: ["resultColumn"]
			},
			an3: _self.an3,
			parentController: this
		});
	},
	addHiddenColumns: function(idRule, hiddenColumns){
	    var _self = this;
	    if(!_self.hiddenColumnsXRules[idRule]){
	        _self.hiddenColumnsXRules[idRule] = [];
	    }
	    _self.hiddenColumnsXRules[idRule] = _self.hiddenColumnsXRules[idRule].concat(hiddenColumns);
	    for(var i = 0 ; i < _self.pagesByRule[idRule].length; i++){
	        for(var pos = 0; pos < hiddenColumns.length; pos++){
	            if(_self.pagesByRule[idRule][i].reportTable.columns[hiddenColumns[pos]]){
	                _self.pagesByRule[idRule][i].reportTable.columns[hiddenColumns[pos]].hide = true; 
	            }
	                                  
	        }
	    }
	},
	removeHiddenColumn: function(idRule,idField){
	    var _self = this;
	    if(_self.hiddenColumnsXRules[idRule]){
	        var index = _self.hiddenColumnsXRules[idRule].indexOf(idField);
	        if(index > -1){
	            _self.hiddenColumnsXRules[idRule].splice(index,1);
	        }
	        for(var i = 0 ; i < _self.pagesByRule[idRule].length; i++){
    	        if(_self.pagesByRule[idRule][i].reportTable.columns[idField]){
    	                delete _self.pagesByRule[idRule][i].reportTable.columns[idField].hide; 
    	            }
    	    }
	    }
	},
	renderToolbar: function() {
		var _self = this;
		var saveBtn = {
			text: i18n("SAVE"),
			isButton: true,
			enabled: false,
			iconFont: "Finance-and-Office",
			icon: "floppydisc",
			tooltip: i18n("CLICK PRESS TO") + i18n("SAVE AN3 REPORT"),
			onPress: _self.saveReport.bind(_self)
		};

		var executeBtn = {
			text: i18n("EXECUTE"),
			onPress: _self.execute.bind(_self),
			isButton: true,
			iconFont: "Media",
			icon: "play",
			enabled: _self.privileges.an3.execute,
            tooltip: i18n('EXECUTE TOOLTIP')
		};
		var approveBtn = {
			text: i18n("APPROVE"),
			onPress: _self.approve.bind(_self),
			isButton: true,
			iconFont: "File-and-Folders",
			icon: "checkeddoc",
			enabled: false,
			tooltip: i18n("APPROVE TOOLTIP")
		};
		var pvaBtn = {
			text: "PVA",
			onPress: _self.pva.bind(_self),
			isButton: true,
			iconFont: "File-and-Folders",
			icon: "analysisdoc",
			enabled: false,
			tooltip: i18n("APPROVE TOOLTIP") + " PVA"
		};
		var exportBtn = {
			text: i18n("EXPORT"),
			onPress: _self.export.bind(_self),
			isButton: true,
			iconFont: "DataManager",
			icon: "download",
			enabled: false,
			tooltip: i18n("EXPORT TOOLTIP")
		};
		var printBtn = {
			text: i18n("PRINT"),
			onPress: _self.print.bind(_self),
			isButton: true,
			iconFont: "Finance-and-Office",
			icon: "Printer",
			enabled: false,
			tooltip: i18n("PRINT TOOLTIP")
		};
		var settingPanelBtn = {
			text: i18n("SETTINGS"),
			onPress: _self.openSettingPanel.bind(_self),
			isButton: true,
			iconFont: "Display-and-Setting",
			icon: "setting",
			enabled: true,
			tooltip: i18n("SETTING TAB TOOLTIP")
		};
		var leftButtons = [saveBtn, executeBtn, settingPanelBtn, pvaBtn, approveBtn,
            exportBtn, printBtn
        ];
		var rightButtons = [{
			text: i18n("GO TO LIBRARY"),
			onPress: function() {
				_self.goToLibrary();
			},
			isButton: true,
			enabled: true,
			"class": "nav-button",
			iconFont: "Sign-and-Symbols",
			icon: "toleft",
			tooltip: i18n("GO TO LIBRARY TOOLTIP")
        }];

		_self.view.toolbar.ctrl = _self.view.toolbar.bindBaseLibraryToolbar({
			leftButtons: leftButtons,
			rightButtons: rightButtons,
			hideGrid: true
		});
		
	},
	execute: function() {
		var _self = this;
		_self.loader.open();
		Data.endpoints.dfg.an3.execute.post({
			idLayoutVersion: _self.an3.idLayoutVersion,
			origin: _self.an3.origin,
			idDigitalFile: _self.an3.idDigitalFile,
			idExternalFile: _self.an3.idExternalFile,
			idRule: _self.an3.rule.map(function(r) {
				return r.id;
			})
		}).success(function(data) {
			_self.loader.close();
			if (_self.privileges.an3.createReport) {
				_self.view.toolbar.ctrl.enableButton(0);
			}

			_self.view.toolbar.ctrl.enableButton(5);
			_self.view.toolbar.ctrl.enableButton(6);

			if (Object.keys(data.rulesResult).length > 1) {
				$.baseToast({
					text: i18n("ANALYSIS CONTINUES")
				});
			}
			_self.reportResult = data;
			_self.pages = _self.renderReportPages();
			_self.seperatePagesbyRule();
			_self.view.rulePaginator.empty();
			_self.view.rulePaginator.ctrl = _self.view.rulePaginator.bindBasePaginator({
				totalPages: Object.keys(_self.pagesByRule).length,
				actualPage: 1,
				onPageChange: _self.onRulePageChange.bind(_self)
			});
			_self.onRulePageChange(0, 1);
			_self.view.paginator.empty();
			_self.view.paginator.ctrl = _self.view.paginator.bindBasePaginator({
				totalPages: _self.pagesByRule[Object.keys(_self.pagesByRule)[0]] ? _self.pagesByRule[Object.keys(_self.pagesByRule)[0]].length : 0,
				actualPage: 1,
				onPageChange: _self.onPageChange.bind(_self)
			});
			_self.onPageChange(0, 1);
		}).error(function(data) {
			_self.loader.close();
			if (data) {
				$.baseToast({
					type: "E",
					text: i18n(data.errorRule) + " " + _self.layoutJSON.blocks[data.block].name + "/" + _self.layoutJSON.blocks[data.block].records[
						data.record].name
				});
			}
		});
	},
	seperatePagesbyRule: function() {
		var _self = this;
		_self.pagesByRule = {};
		for (var r in _self.pages) {
			if (!_self.pagesByRule[_self.pages[r].metadata.ruleCode]) {
				_self.pagesByRule[_self.pages[r].metadata.ruleCode] = [];
			}
			_self.pagesByRule[_self.pages[r].metadata.ruleCode].push(_self.pages[r]);
		}
	},
	renderExecutedReport: function(report, id) {
		var _self = this;
		_self.an3.executedReportId = id;
		if (_self.privileges.an3.createReport) {
			_self.view.toolbar.ctrl.enableButton(0);
		}
		_self.view.toolbar.ctrl.enableButton(5);
		_self.view.toolbar.ctrl.enableButton(6);
		_self.pages = report;
		_self.seperatePagesbyRule();
		_self.view.paginator.empty();
		_self.view.rulePaginator.empty();
		_self.view.rulePaginator.ctrl = _self.view.rulePaginator.bindBasePaginator({
			totalPages: Object.keys(_self.pagesByRule).length,
			actualPage: 1,
			onPageChange: _self.onRulePageChange.bind(_self)
		});
		_self.onRulePageChange(0, 1);
		_self.view.paginator.empty();
		_self.view.paginator.ctrl = _self.view.paginator.bindBasePaginator({
			totalPages: _self.pagesByRule[Object.keys(_self.pagesByRule)[0]] ? _self.pagesByRule[Object.keys(_self.pagesByRule)[0]].length : 0,
			actualPage: 1,
			onPageChange: _self.onPageChange.bind(_self)
		});
		_self.onPageChange(0, 1);
		if (_self.reportsDialog){
			_self.reportsDialog.close();
		}
	
	    for(var p in report){
	        _self.hiddenColumnsXRules[report[p].metadata.ruleCode] = [];
	        for(var c in report[p].reportTable.columns){
	            if(report[p].reportTable.columns[c].hide){
	                _self.hiddenColumnsXRules[report[p].metadata.ruleCode].push(c);
	            }
	        }
	    }
	},
	renderReportPages: function() {
		var _self = this;
		var blockData = _self.reportResult.blocksData;
		var lineMapping = _self.reportResult.lineMapping;
		var ruleResult = _self.reportResult.rulesResult;
		var pages = {};
		var r, p, l, c;
		var block, record;
		var columns, columnPositions;
		for (r in ruleResult) {

			for (p in ruleResult[r].pathResults) {
				var values = {};
				for (var linePath in ruleResult[r].pathResults[p].messageResult) {
					block = lineMapping[linePath].split(".")[0];
					record = lineMapping[linePath].split(".")[1];
					if (!pages["R" + r + "P" + p + "B" + block + "R" + record]) {
						pages["R" + r + "P" + p + "B" + block + "R" + record] = {
							header: _self.reportHeader,
							metadata: {
								ruleCode: "ID" + r,
								block: _self.layoutJSON.blocks[block].name,
								record: _self.layoutJSON.blocks[block].records[record].name,
								ruleName: ruleResult[r].name,
								foundResult: Object.keys(ruleResult[r].pathResults[p].messageResult).length
							},
							reportTable: {
								columns: {},
								columnPositions: [],
								values: {}
							}
						};
						values = JSON.parse(JSON.stringify(blockData[block].records[record].lines));
					}
				}
				
				for(var message in ruleResult[r].pathResults[p].messageResult){
				    var newLine = false;
				    if(Object.keys(ruleResult[r].pathResults[p].messageResult[message].invalidConditions).length && Object.keys(ruleResult[r].pathResults[p].messageResult[message].validConditions).length ){
				        newLine = true;
				    }
				    
				    if(newLine){
				        var newVal = JSON.parse(JSON.stringify(values[message]));
				        newVal["messageColumn"] = "";
				        for(var c in ruleResult[r].pathResults[p].messageResult[message].invalidConditions){
				            newVal["CONDITION_"+c] = ruleResult[r].pathResults[p].messageResult[message].invalidConditions[c].join("\n\r");
				        }
				        values[message+"."+ruleResult[r].pathResults[p].messageResult[message].invalidLines.join(".")] = newVal;
				        var newVal2 = JSON.parse(JSON.stringify(values[message]));
				        newVal2["messageColumn"] = ruleResult[r].pathResults[p].messageResult[message].message;
				         for(var c in ruleResult[r].pathResults[p].messageResult[message].validConditions){
				            newVal2["CONDITION_"+c] = ruleResult[r].pathResults[p].messageResult[message].validConditions[c].join("\n\r");
				        }
				        values[message+"."+ruleResult[r].pathResults[p].messageResult[message].validLines.join(".")] = newVal2;
				        delete values[message];
				    }else if(Object.keys(ruleResult[r].pathResults[p].messageResult[message].invalidConditions).length){
				            var newVal = JSON.parse(JSON.stringify(values[message]));
        				    newVal["messageColumn"] = "";
        				    for(var c in ruleResult[r].pathResults[p].messageResult[message].invalidConditions){
        				        newVal["CONDITION_"+c] = ruleResult[r].pathResults[p].messageResult[message].invalidConditions[c].join("\n\r");
        				    }
        				    values[message+"."+ruleResult[r].pathResults[p].messageResult[message].invalidLines.join(".")] = newVal;
        				    delete values[message];
				    }else if(Object.keys(ruleResult[r].pathResults[p].messageResult[message].validConditions).length){
				        var newVal2 = JSON.parse(JSON.stringify(values[message]));
    				        newVal2["messageColumn"] = ruleResult[r].pathResults[p].messageResult[message].message;
    				         for(var c in ruleResult[r].pathResults[p].messageResult[message].validConditions){
    				            newVal2["CONDITION_"+c] = ruleResult[r].pathResults[p].messageResult[message].validConditions[c].join("\n\r");
    				        }
    				        values[message+"."+ruleResult[r].pathResults[p].messageResult[message].validLines.join(".")] = newVal2;
    				        delete values[message];
    				    }
				    
				}

	
				pages["R" + r + "P" + p + "B" + block + "R" + record].reportTable.values = JSON.parse(JSON.stringify(values));
				columns = _self.layoutJSON.blocks[block].records[record].columns;
				columnPositions = _self.layoutJSON.blocks[block].records[record].positions;
				for (c = 0; c < columnPositions.length; c++) {
					var columnAlreadyExists = false;
					var repeatedColumn = "";
					if (!columns[columnPositions[c]].isLineBreak) {
						for (var c2 in pages["R" + r + "P" + p + "B" + block + "R" + record].reportTable.columns) {
							if (pages["R" + r + "P" + p + "B" + block + "R" + record].reportTable.columns[c2].name === _self.getColumnName(columns[
								columnPositions[c]], columnPositions[c])) {
								columnAlreadyExists = true;
								repeatedColumn = c2;
								break;
							}
						}
						if (!columnAlreadyExists) {
							pages["R" + r + "P" + p + "B" + block + "R" + record].reportTable.columns[columnPositions[c]] = {
								name: _self.getColumnName(columns[columnPositions[c]], columnPositions[c]),
								columnClass: "header"
							};
							pages["R" + r + "P" + p + "B" + block + "R" + record].reportTable.columnPositions.push(columnPositions[c]);
				 		}
				//else {
				// 			var temp;
				// 			for (var v in pages["R" + r + "P" + p + "B" + block + "R" + record].reportTable.values) {
				// 				temp = pages["R" + r + "P" + p + "B" + block + "R" + record].reportTable.values[v][columnPositions[c]];
				// 				if (temp) {
				// 					pages["R" + r + "P" + p + "B" + block + "R" + record].reportTable.values[v][repeatedColumn] = temp;
				// 					delete pages["R" + r + "P" + p + "B" + block + "R" + record].reportTable.values[v][columnPositions[c]];
				// 				}

				// 			}
				// 		}

					}

				}
				for (var condition in ruleResult[r].pathResults[p].pathComparisons) {
					pages["R" + r + "P" + p + "B" + block + "R" + record].reportTable.columns["CONDITION_" + condition] = {
						name: ruleResult[r].pathResults[p].pathComparisons[condition].metadata.pa + " " + ruleResult[r].pathResults[p].pathComparisons[
							condition].metadata.oper + " " + ruleResult[r].pathResults[p].pathComparisons[condition].metadata.pb,
						columnClass: "header"
					};
					pages["R" + r + "P" + p + "B" + block + "R" + record].reportTable.columnPositions.push("CONDITION_" + condition);
				}
				pages["R" + r + "P" + p + "B" + block + "R" + record].reportTable.columns.messageColumn = {
					name: i18n("MESSAGE"),
					columnClass: "header"
				};
				pages["R" + r + "P" + p + "B" + block + "R" + record].reportTable.columnPositions.push("messageColumn");
			}
		}

		return pages;
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
				name = sessionStorage.lang !== "enus"? _self.structure[column.idStructure].fields[column.fieldId].labelPT : _self.structure[column.idStructure]
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
	onRulePageChange: function(lastpage, actualpage) {
		var _self = this;
		var renderPage = _self.pagesByRule[Object.keys(_self.pagesByRule)[actualpage - 1]];
		_self.ruleActualPage = actualpage;
		if (renderPage) {
			_self.view.paginator.empty();
			_self.view.paginator.ctrl = _self.view.paginator.bindBasePaginator({
				totalPages: _self.pagesByRule[Object.keys(_self.pagesByRule)[actualpage - 1]].length,
				actualPage: 1,
				onPageChange: _self.onPageChange.bind(_self)
			});
			_self.view.paginator.find(".page-number").click();
			if(_self.view.filterCB.allComparisons.getChecked()){
			   	_self.showAllComparisons();
			}else{
			    _self.showValidComparisons();
			}
		
		}
	},
	onPageChange: function(lastpage, actualpage) {
		var _self = this;
		var rulePages = _self.pagesByRule[Object.keys(_self.pagesByRule)[_self.ruleActualPage - 1]];
		var renderPage = rulePages ? rulePages[Object.keys(rulePages)[actualpage - 1]] : undefined;
		if (renderPage) {
			if (actualpage === 1 && renderPage.header) {
				_self.view.report.renderReportHeader(renderPage.header);
			}
			_self.view.report.renderReportMetadata(renderPage.metadata);
			_self.view.report.renderReportTable(renderPage.reportTable);
			if(_self.view.filterCB.allComparisons.getChecked()){
			   	_self.showAllComparisons();
			}else{
			    _self.showValidComparisons();
			}
		
		} else {
			$.baseToast({
				type: "w",
				text: i18n("NO RESULTS")
			});
		}
	},
	showAllComparisons: function() {
        var messageColumns = $(".message-column");
        messageColumns.parent().show();
	},
	showValidComparisons: function() {
        jQuery.extend(
				jQuery.expr[':'], {
					regex: function(a, i, m, r) {
						var r = new RegExp(m[3], 'i');
						return r.test(jQuery(a).text());
					}
				}
	    );
	    var messageColumns = $(".message-column:regex('^$')");
	    messageColumns.parent().css("display","none");
        //messageColumns.parent().hide();
	},
	saveReport: function() {
		var _self = this;
		var saveDialog = $.baseDialog({
			title: i18n("CREATE AN3 REPORT"),
			modal: true,
			size: "medium",
			outerClick: "disabled",
			viewName: "app.views.executoran3.createReportDialog",
			buttons: [{
				name: i18n("CANCEL"),
				isCloseButton: true
            }, {
				name: i18n("CREATE"),
				click: function() {
					if (saveDialog.getInnerController().validate()) {
						var item = saveDialog.getInnerController().getItem();
						item.idAN3 = _self.an3.id;
						item.report = JSON.stringify(_self.pages);
						_self.loader.open();
						Data.endpoints.dfg.an3.createReport.post(item).success(function(data) {
							Data.endpoints.dfg.panel.create.post({
								idDigitalFile: _self.an3.id,
								status: 1,
								idFolder: -1,
								idReport: data.id
							}).success(function(_data) {
								_self.view.toolbar.ctrl.enableButton(4);
								_self.an3.panel = _data;
								_self.an3.executedReportId = data.id;
								$.baseToast({
									isSuccess: true,
									text: i18n("SUCCESS CREATING AN3 REPORT")
								});
								_self.loader.close();
							}).error(function(data) {
								_self.loader.close();
							});
						}).error(function(data) {
							_self.loader.close();
						});
						saveDialog.close();
					} else {
						$.baseToast({
							type: "w",
							text: i18n("FILL ALL FIELDS")
						});
					}
				}
            }]
		});
		saveDialog.open();
	},
	approve: function() {
		var _self = this;
		for (var i = 0; i < _self.an3.reports.length; i++) {
			if (_self.an3.reports[i].id === _self.an3.executedReportId) {
				_self.an3.title = _self.an3.reports[i].name;
				break;
			}
		}
		_self.approvedDialog = $.baseDialog({
			title: i18n("APPROVE"),
			modal: true,
			size: "big",
			outerClick: "disabled",
			viewName: "app.views.executoran3.approveDialog",
			viewData: {
				AN3: _self.an3
			},
			buttons: [{
				name: i18n("CANCEL"),
				isCloseButton: true
            }, {
				name: i18n("APPLY"),
				click: function() {
					if (_self.approvedDialog.getInnerController().validate()) {
						_self.loader.open();
						var item = _self.approvedDialog.getInnerController().getItem();
						Data.endpoints.dfg.panel.approve.post({item:item}).success(function(data) {
							$.baseToast({
								isSuccess: true,
								text: i18n("SUCCESS APPROVE PANEL")
							});
							_self.loader.close();
							_self.approvedDialog.close();
						}).error(function() {
							_self.loader.close();
						});
					} else {
						$.baseToast({
							type: "w",
							text: i18n("FILL ALL FIELDS")
						});
					}
				}
            }]
		});
		_self.approvedDialog.open();
	},
	pva: function() {
		var _self = this;
		var item = {
			id: (_self.panel && _self.panel.length) ? _self.panel[0].id : 0,
			status: 5
		};
		_self.loader.open();
		Data.endpoints.dfg.panel.update.post(item).success(function(data) {
			if (_self.settingPanel && _self.settingPanel.length)
				window.open(_self.settingPanel[0].link, '_blank');
			$.baseToast({
				isSuccess: true,
				text: i18n("SUCCESS APPROVE PANEL") + " PVA"
			});
			_self.loader.close();
		}).error(function() {
			_self.loader.close();
		});
	},
	openSettingPanel: function() {
		var _self = this;
		_self.openExecuteLateral();
	},
	export: function() {
		var _self = this;
		var allReports = [];
		var reportPage;

		for (var p in _self.pages) {
			reportPage = document.createElement("div");
			reportPage.className = "rule-report-container";
			$(reportPage).bindAn3Report({
				header: _self.reportHeader,
				metadata: _self.pages[p].metadata,
				reportTable: _self.pages[p].reportTable
			});
			allReports.push(reportPage);
		}
		var uri = 'data:application/vnd.ms-excel;base64,',
			tmplWorkbookXML =
			'<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">' +
			'<DocumentProperties xmlns="urn:schemas-microsoft-com:office:office"><Author>Axel Richter</Author><Created>{created}</Created></DocumentProperties>' +
			'<Styles>' + '<Style ss:ID="Currency"><NumberFormat ss:Format="Currency"></NumberFormat></Style>' +
			'<Style ss:ID="Date"><NumberFormat ss:Format="Medium Date"></NumberFormat></Style>' + '</Styles>' + '{worksheets}</Workbook>',
			tmplWorksheetXML = '<Worksheet ss:Name="{nameWS}"><Table>{rows}</Table></Worksheet>',
			tmplCellXML = '<Cell{attributeStyleID}{attributeFormula}><Data ss:Type="{nameType}">{data}</Data></Cell>',
			base64 = function(s) {
				return window.btoa(unescape(encodeURIComponent(s)))
			},
			format = function(s, c) {
			    
				return s.replace(/{(\w+)}/g, function(m, p) {
					return c[p];
				});
			}
		var tablesToExcel = function(reportPages, layoutJSON, appname) {
			var cell = "";
			var ctrl = {};
			var workBookXML = "";
			var worksheetsXML = "";
			var rowsXML = "";
			var headerTable;
			var metadataTable;
			var reportTable;
			var headerRows, headerCells;
			var metadataRows, metadataCells;
			var reportRows, reportCells;
			for (var i = 0; i < reportPages.length; i++) {
				headerTable = $(reportPages[i]).find(".header table")[0];
				metadataTable = $(reportPages[i]).find(".report-metadata table")[0];
				reportTable = $(reportPages[i]).find(".report-table table")[0];
				//ADD HEADER ROWS 
				for (headerRows = 0; headerRows < headerTable.rows.length; headerRows++) {
					rowsXML += "<Row>";
					for (headerCells = 0; headerCells < headerTable.rows[headerRows].cells.length; headerCells++) {
						var dataType = headerTable.rows[headerRows].cells[headerCells].getAttribute("data-type");
						var dataStyle = headerTable.rows[headerRows].cells[headerCells].getAttribute("data-style");
						var dataValue = headerTable.rows[headerRows].cells[headerCells].getAttribute("data-value");
						dataValue = (dataValue) ? dataValue : headerTable.rows[headerRows].cells[headerCells].innerHTML;
						
						var dataFormula = headerTable.rows[headerRows].cells[headerCells].getAttribute("data-formula");
						dataFormula = (dataFormula) ? dataFormula : (appname == 'Calc' && dataType == 'DateTime') ? dataValue : null;
						cell = {
							attributeStyleID: (dataStyle == 'Currency' || dataStyle == 'Date') ? ' ss:StyleID="' + dataStyle + '"' : '',
							nameType: 'String',
							data: (dataFormula) ? '' : dataValue,
							attributeFormula: (dataFormula) ? ' ss:Formula="' + dataFormula + '"' : ''
						};
						rowsXML += format(tmplCellXML, cell);
					}
					rowsXML += "</Row>";
				}
				rowsXML += "<Row></Row>";
				rowsXML += "<Row></Row>";
				rowsXML += "<Row></Row>";
				rowsXML += "<Row></Row>";
				// ADD METADATA ROWS
				for (metadataRows = 0; metadataRows < metadataTable.rows.length; metadataRows++) {
					rowsXML += "<Row>";
					for (metadataCells = 0; metadataCells < metadataTable.rows[metadataRows].cells.length; metadataCells++) {
						var dataType = metadataTable.rows[metadataRows].cells[metadataCells].getAttribute("data-type");
						var dataStyle = metadataTable.rows[metadataRows].cells[metadataCells].getAttribute("data-style");
						var dataValue = metadataTable.rows[metadataRows].cells[metadataCells].getAttribute("data-value");
						dataValue = (dataValue) ? dataValue : metadataTable.rows[metadataRows].cells[metadataCells].innerHTML;
						var dataFormula = metadataTable.rows[metadataRows].cells[metadataCells].getAttribute("data-formula");
						dataFormula = (dataFormula) ? dataFormula : (appname == 'Calc' && dataType == 'DateTime') ? dataValue : null;
						cell = {
							attributeStyleID: (dataStyle == 'Currency' || dataStyle == 'Date') ? ' ss:StyleID="' + dataStyle + '"' : '',
							nameType: 'String',
							data: (dataFormula) ? '' : dataValue,
							attributeFormula: (dataFormula) ? ' ss:Formula="' + dataFormula + '"' : ''
						};
						rowsXML += format(tmplCellXML, cell);
					}
					rowsXML += "</Row>";
				}
				rowsXML += "<Row></Row>";
				rowsXML += "<Row></Row>";
				rowsXML += "<Row></Row>";
				rowsXML += "<Row></Row>";
				// ADD REPORT ROWS
				for (reportRows = 0; reportRows < reportTable.rows.length; reportRows++) {
				     if( $("tr[line-id='"+reportTable.rows[reportRows].getAttribute("line-id")+"']").css("display") !== "none"){
    					rowsXML += "<Row>";
    					for (reportCells = 0; reportCells < reportTable.rows[reportRows].cells.length; reportCells++) {
    					    if( reportTable.rows[reportRows].cells[reportCells].style.display !== "none"){
        						var dataType = reportTable.rows[reportRows].cells[reportCells].getAttribute("data-type");
        						var dataStyle = reportTable.rows[reportRows].cells[reportCells].getAttribute("data-style");
        						var dataValue = reportTable.rows[reportRows].cells[reportCells].getAttribute("data-value");
        					   
        						
        						dataValue = (dataValue) ? dataValue : reportTable.rows[reportRows].cells[reportCells].innerHTML;
        						 if( dataValue && dataValue.indexOf("<br><br>")!==-1){
        						    dataValue = dataValue.replace(new RegExp(/<br><br>/g),"");
        						}
        						var dataFormula = reportTable.rows[reportRows].cells[reportCells].getAttribute("data-formula");
        						dataFormula = (dataFormula) ? dataFormula : (appname == 'Calc' && dataType == 'DateTime') ? dataValue : null;
        						cell = {
        							attributeStyleID: (dataStyle == 'Currency' || dataStyle == 'Date') ? ' ss:StyleID="' + dataStyle + '"' : '',
        							nameType: 'String',
        							data: (dataFormula) ? '' : dataValue,
        							attributeFormula: (dataFormula) ? ' ss:Formula="' + dataFormula + '"' : ''
        						};
        						rowsXML += format(tmplCellXML, cell);
    					    }
    					}
    					rowsXML += "</Row>";
				     }
				}
				ctrl = {
					rows: rowsXML,
					nameWS: i18n("RESULT") + "-" + (i + 1)
				};
				worksheetsXML += format(tmplWorksheetXML, ctrl);
				rowsXML = "";

			}
			ctrl = {
				created: (new Date()).getTime(),
				worksheets: worksheetsXML
			};
			workbookXML = format(tmplWorkbookXML, ctrl);
			var link = document.createElement("A");
			link.href = uri + base64(workbookXML);
			link.download = i18n("RESULT") + " AN3";
			link.target = '_blank';
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}

		tablesToExcel(allReports, _self.layoutJSON, 'Excel');
	},
	print: function() {
		var _self = this;
		var printElement = document.createElement("div");
		var reportPage, wrapper;
		for (var p in _self.pages) {
			wrapper = document.createElement("div");
			wrapper.className = "executor-wrapperprint";
			reportPage = document.createElement("div");
			reportPage.className = "rule-report-container";
			$(reportPage).bindAn3Report({
				header: _self.reportHeader,
				metadata: _self.pages[p].metadata,
				reportTable: _self.pages[p].reportTable
			});
			$(reportPage).find("nav").remove();
			wrapper.appendChild(reportPage);
			printElement.appendChild(wrapper);
			if(p === Object.keys(_self.pages)[Object.keys(_self.pages).length -1]){
			    setTimeout(function(){$(printElement).print();},1000);
			    	
			}
		}
		
	
		       
        
		
	},
	goToLibrary: function() {
		window.location = "#/library?restoreSettings=1";
	},
	// setting's executor lateral panel (ew)
	openExecuteLateral: function() {
		$(".right-content").css("overflow-y", "hidden");
		var _self = this;
		var noMapConfig = false;
		$("#settings-close").prop('tabindex', 0);
		$("#settings-execute").prop('tabindex', 0);
		$("#overlapRight").removeClass("novisible").addClass("visible");
		$("#overlapRight").show();
		
		$('.inputs').find('label').baseTooltip({
            class: 'dark',
            position: 'top',
            text: i18n('CENTRALIZATION TOOLTIP')
        });

		disableBackTabIndex('.library-toolbar-items-right');
		enableBackTabIndex($("#overlapRight"));
		$("#executarArquivo .title #settings-close button").on("click", function() {
			_self.closeButtonClick();
			disableBackTabIndex($("#overlapRight"));
			enableBackTabIndex($('.library-toolbar-items-right'));
			$("#overlapRight").hide();
			$(".right-content").css("overflow-y", "auto");

		});
		$("#settings-close").on('keydown', function() {

			var keyPressed = event.keyCode || event.which;

			if (keyPressed == 13) {
				_self.closeButtonClick();
				disableBackTabIndex($("#overlapRight"));
				$("#overlapRight").hide();
				$(".right-content").css("overflow-y", "auto");
			};
		});

		$("#executarArquivo .footer #settings-reset").hide();

		$("#executarArquivo .footer #settings-execute button").hide();
		$(".input-an3").hide();
	},
	abas: function() {
		var _self = this;
		_self.coreServices.allVersionData = {
			idCompany: _self.an3.idCompany,
			idBranch: _self.an3.idBranch,
			uf: _self.an3.uf,
			idTax: [_self.an3.taxInfo],
			subperiod: _self.an3.subperiod,
			month: _self.an3.month,
			year: _self.an3.year
		};
		$(_self.loader._mask).css("background-color", "rgba(255, 255, 255, 0.4)");
		$(_self.loader._mask).find(".base-loader").css("visibility", "hidden");
		_self.tabController = $("#settings-tabs").bindBaseTabs({
			tab: [{
				title: i18n("GENERAL PARAMS"),
				icon: "gear",
				iconColor: "white",
				iconFont: "Display-and-Setting",
				viewName: "app.views.dialogs.executarArquivo",
				tooltip: i18n("GENERAL PARAMETER TOOLTIP"),
				viewData: {
					eefiInfo: _self.eefiInfo
				}
            }],
			type: "boxes",
			wrapperClass: "wrapperClass"
		});
	},
	closeExecuteLateral: function() {
		$("#overlapRight").removeClass("visible").addClass("novisible");
	},
	closeButtonClick: function() {
		var _self = this;
		$(_self.loader._mask).css("background-color", "");
		$(_self.loader._mask).find(".base-loader").css("visibility", "visible");
		_self.closeExecuteLateral();
	}
});