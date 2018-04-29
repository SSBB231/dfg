sap.ui.controller("app.controllers.executoran4.rightContent", {
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
        _self.view.paginator = _self.view.find(".paginator");
        _self.view.filterCB = _self.view.find(".cb-filter");
    	_self.hiddenColumnsXRules = {};
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
        _self.renderToolbar();
        _self.loader.open();
        _self.addServices();
        Data.endpoints.dfg.an4.read.post({
            id: window.parameters.id
        }).success(function(data) {
            _self.an4 = data;
            _self.layoutJSONReference = data.layoutVersionReference[0].json;
            _self.layoutJSONComparison = data.layoutVersionComparison[0].json;
            _self.structure = {};
            var tempFields;
            data.structure.map(function(s) {
                _self.structure[s.id] = s.structure;
                tempFields = {};
                _self.structure[s.id].fields.map(function(f) {
                    tempFields[f.ID] = f;
                });
                _self.structure[s.id].fields = tempFields;
            });
            _self.abas();
            if (data.reports && data.reports.length > 0) {
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
            } else {
                _self.renderReport();
            }

            _self.loader.close();
        }).error(function(data) {
            window.location = "#/library?restoreSettings=1";
        });

    },
    addServices: function() {
        var _self = this;
        _self.coreServices.renderExecutedReport = function(report) {
            _self.renderExecutedReport(report);
        }
    },
    renderReport: function() {
        var _self = this;
        _self.view.reportContainer.empty();
        var date = new Date();
        _self.an4.digitalFileTypeTextReference = _self.an4.digitalFileTypeTextReference[0];
        _self.an4.digitalFileTypeTextComparison = _self.an4.digitalFileTypeTextComparison[0];
        _self.an4.layoutVersionReference = _self.an4.layoutVersionReference[0];
        _self.an4.layoutVersionComparison = _self.an4.layoutVersionComparison[0];
        _self.an4.settingReference = _self.an4.settingReference[0];
        _self.an4.settingComparison = _self.an4.settingComparison[0];
        _self.an4.originReference =  _self.an4.originReference === 1 ? "DFG" : "EXTERNAL";
        _self.an4.originComparison =  _self.an4.originComparison === 1 ? "DFG" : "EXTERNAL";
        _self.reportHeader = {
            digitalFileTypeReference: _self.an4.digitalFileTypeTextReference.name,
            digitalFileTypeComparison: _self.an4.digitalFileTypeTextComparison.name,
            auditoryDate: date.toLocaleDateString(sessionStorage.lang !== "enus" ? "pt-BR" : "en-US"),
            auditoryHour: date.toLocaleTimeString(sessionStorage.lang !== "enus" ? "pt-BR" : "en-US"),
            fileNameReference: _self.an4.digitalFileNameReference != null ? _self.an4.digitalFileNameReference : _self.an4.externalFileNameReference,
            fileNameComparison: _self.an4.digitalFileNameComparison != null ? _self.an4.digitalFileNameComparison : _self.an4.externalFileNameComparison,
            idLayoutReference: "ID" + _self.an4.layoutVersionReference.idLayout,
            idLayoutComparison: "ID" + _self.an4.layoutVersionComparison.idLayout,
            idSettingReference: _self.an4.settingReference && _self.an4.settingReference.idSetting ? "ID" + _self.an4.settingReference.idSetting : "",
            idSettingComparison: _self.an4.settingComparison &&  _self.an4.settingComparison.idSetting ? "ID" + _self.an4.settingComparison.idSetting : "",
            originReference: _self.an4.originReference !== "DFG" ? i18n(_self.an4.originReference) : "DFG",
            originComparison: _self.an4.originComparison !== "DFG" ? i18n(_self.an4.originComparison) : "DFG",
            company: _self.an4.idCompanyReference,
            branch: _self.an4.idBranchReference
        };
        _self.view.report = _self.view.reportContainer.bindAn4Report({
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
            an4: _self.an4,
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
            tooltip: i18n("CLICK PRESS TO") + i18n("SAVE AN4 REPORT"),
            onPress: _self.saveReport.bind(_self)
        };

        var executeBtn = {
            text: i18n("EXECUTE"),
            onPress: _self.execute.bind(_self),
            isButton: true,
            iconFont: "Media",
            icon: "play",
            enabled: _self.privileges.an4.execute,
            tooltip: i18n('EXECUTE TOOLTIP')
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
        var leftButtons = [saveBtn, executeBtn, settingPanelBtn,
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
        Data.endpoints.dfg.an4.execute.post({
            idLayoutVersionReference: _self.an4.idLayoutVersionReference,
            idLayoutVersionComparison: _self.an4.idLayoutVersionComparison,
            originReference: _self.an4.originReference,
            originComparison: _self.an4.originComparison,
            idDigitalFileReference: _self.an4.idDigitalFileReference,
            idDigitalFileComparison: _self.an4.idDigitalFileComparison,
            idExternalFileReference: _self.an4.idExternalFileReference,
            idExternalFileComparison: _self.an4.idExternalFileComparison,
            idRule: _self.an4.rule.map(function(r) {
                return r.id
            })
        }).success(function(data) {
            _self.loader.close();
            if (_self.privileges.an4.createReport) {
                _self.view.toolbar.ctrl.enableButton(0);
            }

            _self.view.toolbar.ctrl.enableButton(3);
            _self.view.toolbar.ctrl.enableButton(4);
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
            setTimeout(function(){
                _self.showValidComparisons();
            },100);
            
            _self.view.paginator.empty();
            _self.view.paginator.ctrl = _self.view.paginator.bindBasePaginator({
                totalPages: _self.pagesByRule[Object.keys(_self.pagesByRule)[0]] ? _self.pagesByRule[Object.keys(_self.pagesByRule)[0]].length:0,
                actualPage: 1,
                onPageChange: _self.onPageChange.bind(_self)
            });
            _self.onPageChange(0, 1);
        }).error(function(data) {
            _self.loader.close();
        });
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
    renderExecutedReport: function(report) {
        var _self = this;
        if (_self.privileges.an4.createReport) {
            _self.view.toolbar.ctrl.enableButton(0);
        }
        _self.view.toolbar.ctrl.enableButton(3);
        _self.view.toolbar.ctrl.enableButton(4);
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
            totalPages: _self.pagesByRule[Object.keys(_self.pagesByRule)[0]].length,
            actualPage: 1,
            onPageChange: _self.onPageChange.bind(_self)
        });
        _self.onPageChange(0, 1);
        _self.reportsDialog.close();
    },
    renderReportPages: function() {
        var _self = this;
        var blockDataReference = _self.reportResult.blocksDataReference;
        var lineMappingReference = _self.reportResult.lineMappingReference;
        var blockDataComparison = _self.reportResult.blocksDataComparison;
        var lineMappingComparison = _self.reportResult.lineMappingComparison;
        var ruleResult = _self.reportResult.rulesResult;
        var pages = {};
        var r, p, l, c, pr;
        var blockReference, recordReference;
        var blockComparison, recordComparison;
        var columnsReference, columnPositionsReference;
        var columnsComparison, columnPositionsComparison;
        for (r in ruleResult) {
            for (p in ruleResult[r].pathResults) {
                for (l in ruleResult[r].pathResults[p]) {
                    if (lineMappingReference[l]) {
                        blockReference = lineMappingReference[l].split(".")[0];
                        recordReference = lineMappingReference[l].split(".")[1];
                        blockComparison = lineMappingComparison[ruleResult[r].pathResults[p][l].conflictLine].split(".")[0];
                        recordComparison = lineMappingComparison[ruleResult[r].pathResults[p][l].conflictLine].split(".")[1];
                        columnsReference = _self.layoutJSONReference.blocks[blockReference].records[recordReference].columns;
                        columnPositionsReference = _self.layoutJSONReference.blocks[blockReference].records[recordReference].positions;
                        columnsComparison = _self.layoutJSONComparison.blocks[blockComparison].records[recordComparison].columns;
                        columnPositionsComparison = _self.layoutJSONComparison.blocks[blockComparison].records[recordComparison].positions;
                        var lineKey = "R" + r + "B" + blockReference + "R" + recordReference + "B" + blockComparison + "R" + recordComparison;
                        if (!pages[lineKey]) {
                            pages[lineKey] = {
                                header: _self.reportHeader,
                                metadata: {
                                    ruleCode: "ID" + r,
                                    // block: _self.layoutJSONReference.blocks[blockReference].name,
                                    // record: _self.layoutJSONReference.blocks[blockReference].records[recordReference].name,
                                    ruleName: ruleResult[r].name,
                                    foundResult: 0
                                },
                                reportTable: {
                                    columns: {
                                        "blockNameReference": {
                                            name: i18n("BLOCK") + " " + i18n("REFERENCE"),
                                            columnClass: "header"
                                        },
                                        "recordNameReference": {
                                            name: i18n("RECORD") + " " + i18n("REFERENCE"),
                                            columnClass: "header"
                                        },
                                        "blockNameComparison": {
                                            name: i18n("BLOCK") + " " + i18n("COMPARISON"),
                                            columnClass: "header"
                                        },
                                        "recordNameComparison": {
                                            name: i18n("RECORD") + " " + i18n("COMPARISON"),
                                            columnClass: "header"
                                        }
                                    },
                                    columnPositions: ["blockNameReference", "recordNameReference"],
                                    values: {}
                                }
                            };

                            for (c = 0; c < columnPositionsReference.length; c++) {
                                var columnAlreadyExists = false;
                                var repeatedColumn = "";
                                if (!columnsReference[columnPositionsReference[c]].isLineBreak) {
                                    for (var c2 in pages[lineKey].reportTable.columns) {
                                        if (pages[lineKey].reportTable.columns[c2].name === _self.getColumnName(columnsReference[columnPositionsReference[c]], columnPositionsReference[c])) {
                                            columnAlreadyExists = true;
                                            repeatedColumn = c2;
                                            break;
                                        }
                                    }
                                    if (!columnAlreadyExists) {
                                        pages[lineKey].reportTable.columns[columnPositionsReference[c] + "R"] = {
                                            name: _self.getColumnName(columnsReference[columnPositionsReference[c]], columnPositionsReference[c]),
                                            columnClass: "header"
                                        };
                                        pages[lineKey].reportTable.columnPositions.push(columnPositionsReference[c] + "R");
                                    } else {
                                        var temp;
                                        for (var v in blockDataReference[blockReference].records[recordReference].lines) {
                                            temp = blockDataReference[blockReference].records[recordReference].lines[v][columnPositionsReference[c]];
                                            if (temp) {
                                                blockDataReference[blockReference].records[recordReference].lines[v][repeatedColumn.substring(0, repeatedColumn.length - 1)] = temp;
                                                delete blockDataReference[blockReference].records[recordReference].lines[v][columnPositions[c]];
                                            }

                                        }
                                    }

                                }

                            }
                            pages[lineKey].reportTable.columns.statusColumn = {
                                name: i18n("STATUS"),
                                columnClass: "header"
                            };
                            pages[lineKey].reportTable.columnPositions.push("statusColumn");
                            pages[lineKey].reportTable.columnPositions.push("blockNameComparison");
                            pages[lineKey].reportTable.columnPositions.push("recordNameComparison");

                            for (c = 0; c < columnPositionsComparison.length; c++) {
                                var columnAlreadyExists = false;
                                var repeatedColumn = "";
                                if (!columnsComparison[columnPositionsComparison[c]].isLineBreak) {
                                    for (var c2 in pages[lineKey].reportTable.columns) {
                                        if (c2.charAt(c2.length - 1) != "R" && pages[lineKey].reportTable.columns[c2].name === _self.getColumnName(columnsComparison[columnPositionsComparison[c]], columnPositionsComparison[c])) {
                                            columnAlreadyExists = true;
                                            repeatedColumn = c2;
                                            break;
                                        }
                                    }
                                    if (!columnAlreadyExists) {
                                        pages[lineKey].reportTable.columns[columnPositionsComparison[c] + "C"] = {
                                            name: _self.getColumnName(columnsComparison[columnPositionsComparison[c]], columnPositionsComparison[c]),
                                            columnClass: "header"
                                        };
                                        pages[lineKey].reportTable.columnPositions.push(columnPositionsComparison[c] + "C");
                                    } else {
                                        var temp;
                                        for (var v in blockDataComparison[blockComparison].records[recordComparison].lines) {
                                            temp = blockDataComparison[blockComparison].records[recordComparison].lines[v][columnPositionsComparison[c]];
                                            if (temp) {
                                                blockDataComparison[blockComparison].records[recordComparison].lines[v][repeatedColumn.substring(0, repeatedColumn.length - 1)] = temp;
                                                delete blockDataComparison[blockComparison].records[recordComparison].lines[v][columnPositionsComparison[c]];
                                            }

                                        }
                                    }

                                }

                            }
                            pages[lineKey].reportTable.columns.messageColumn = {
                                name: i18n("OBSERVATION"),
                                columnClass: "header"
                            };
                            pages[lineKey].reportTable.columnPositions.push("messageColumn");
                        }
                        if (Object.keys(pages[lineKey].reportTable.values).length === 0) {
                            var lineReference, lineComparison;
                            var newValueLine;
                            for (var lineReference in blockDataReference[blockReference].records[recordReference].lines) {
                                newValueLine = {
                                    blockNameReference: _self.layoutJSONReference.blocks[blockReference].name,
                                    recordNameReference: _self.layoutJSONReference.blocks[blockReference].records[recordReference].name,
                                    blockNameComparison: _self.layoutJSONComparison.blocks[blockComparison].name,
                                    recordNameComparison: _self.layoutJSONComparison.blocks[blockComparison].records[recordComparison].name
                                };
                                for (var c = 0; c < columnPositionsReference.length; c++) {
                                    newValueLine[columnPositionsReference[c] + "R"] = blockDataReference[blockReference].records[recordReference].lines[lineReference][columnPositionsReference[c]];
                                }
                                for (var c = 0; c < columnPositionsComparison.length; c++) {
                                    newValueLine[columnPositionsComparison[c] + "C"] = blockDataComparison[blockComparison].records[recordComparison].lines[ruleResult[r].pathResults[p][l].conflictLine][columnPositionsComparison[c]];
                                }
                                pages[lineKey].reportTable.values[lineReference + "." + ruleResult[r].pathResults[p][l].conflictLine] = newValueLine;
                                if (lineReference + "." + ruleResult[r].pathResults[p][l].conflictLine !== l + "." + ruleResult[r].pathResults[p][l].conflictLine) {
                                    pages[lineKey].reportTable.values[lineReference + "." + ruleResult[r].pathResults[p][l].conflictLine].statusColumn = i18n("OK");
                                }

                            }

                        }

                        if (!pages[lineKey].reportTable.values[l + "." + ruleResult[r].pathResults[p][l].conflictLine].messageColumn) {
                            pages[lineKey].reportTable.values[l + "." + ruleResult[r].pathResults[p][l].conflictLine].messageColumn = [];
                        }
                        pages[lineKey].reportTable.values[l + "." + ruleResult[r].pathResults[p][l].conflictLine].messageColumn.push(ruleResult[r].pathResults[p][l].message);
                        pages[lineKey].reportTable.values[l + "." + ruleResult[r].pathResults[p][l].conflictLine].statusColumn = i18n("NOT OK");
                        pages[lineKey].metadata.foundResult++;
                    }
                }
            }
        }
        console.log(pages);
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
                name = sessionStorage.lang !== "enus" ? _self.structure[column.idStructure].fields[column.fieldId].labelPT : _self.structure[column.idStructure].fields[column.fieldId].labelEN;
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
        }
    },
    onPageChange: function(lastpage, actualpage) {
        var _self = this;
        var rulePages = _self.pagesByRule[Object.keys(_self.pagesByRule)[_self.ruleActualPage - 1]];
        if(rulePages){
            var renderPage = rulePages[Object.keys(rulePages)[actualpage - 1]];
            if (renderPage) {
                if (actualpage === 1 && renderPage.header) {
                    _self.view.report.renderReportHeader(renderPage.header);
                }
                _self.view.report.renderReportMetadata(renderPage.metadata);
                _self.view.report.renderReportTable(renderPage.reportTable);
            } else {
                $.baseToast({
                    type: "w",
                    text: i18n("NO RESULTS")
                });
            }
        }else {
                $.baseToast({
                    type: "w",
                    text: i18n("NO RESULTS")
                });
            }

    },
    saveReport: function() {
        var _self = this;
        var saveDialog = $.baseDialog({
            title: i18n("CREATE AN4 REPORT"),
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
                        item.idAN4 = _self.an4.id;
                        item.report = JSON.stringify(_self.pages);
                        _self.loader.open();
                        Data.endpoints.dfg.an4.createReport.post(item).success(function(data) {
                            $.baseToast({
                                isSuccess: true,
                                text: i18n("SUCCESS CREATING AN4 REPORT")
                            });
                            _self.loader.close();
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
            $(reportPage).bindAn4Report({
                header: _self.reportHeader,
                metadata: _self.pages[p].metadata,
                reportTable: _self.pages[p].reportTable
            });
            allReports.push(reportPage);
        }
        var uri = 'data:application/vnd.ms-excel;base64,',
            tmplWorkbookXML = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">' + '<DocumentProperties xmlns="urn:schemas-microsoft-com:office:office"><Author>Axel Richter</Author><Created>{created}</Created></DocumentProperties>' + '<Styles>' + '<Style ss:ID="Currency"><NumberFormat ss:Format="Currency"></NumberFormat></Style>' + '<Style ss:ID="Date"><NumberFormat ss:Format="Medium Date"></NumberFormat></Style>' + '</Styles>' + '{worksheets}</Workbook>',
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
                    rowsXML += "<Row>";
                    for (reportCells = 0; reportCells < reportTable.rows[reportRows].cells.length; reportCells++) {
                        var dataType = reportTable.rows[reportRows].cells[reportCells].getAttribute("data-type");
                        var dataStyle = reportTable.rows[reportRows].cells[reportCells].getAttribute("data-style");
                        var dataValue = reportTable.rows[reportRows].cells[reportCells].getAttribute("data-value");
                        dataValue = (dataValue) ? dataValue : reportTable.rows[reportRows].cells[reportCells].innerHTML;
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
                    rowsXML += "</Row>";
                }
                ctrl = { rows: rowsXML, nameWS: i18n("RESULT") + "-" + (i + 1) };
                worksheetsXML += format(tmplWorksheetXML, ctrl);
                rowsXML = "";

            }
            ctrl = { created: (new Date()).getTime(), worksheets: worksheetsXML };
            workbookXML = format(tmplWorkbookXML, ctrl);
            var link = document.createElement("A");
            link.href = uri + base64(workbookXML);
            link.download = i18n("RESULT") + " AN4";
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
            $(reportPage).bindAn4Report({
                header: _self.reportHeader,
                metadata: _self.pages[p].metadata,
                reportTable: _self.pages[p].reportTable
            });
            wrapper.appendChild(reportPage);
            printElement.appendChild(wrapper);
        }
        $(printElement).print();
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
        disableBackTabIndex('.library-toolbar-items-right');
        enableBackTabIndex($("#overlapRight"));
        $("#executarArquivo .title #settings-close button").on("click", function() {
            _self.closeButtonClick();
            disableBackTabIndex($("#overlapRight"));
            enableBackTabIndex($('.library-toolbar-items-right'));
            $("#overlapRight").hide();
            $(".right-content").css("overflow-y", "auto");


        });
        $('.inputs').find('label').baseTooltip({
            class: 'dark',
            position: 'top',
            text: i18n('CENTRALIZATION TOOLTIP')
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
        $(".input-an4").hide();
    },
    abas: function() {
        var _self = this;
        _self.coreServices.allVersionData = {
            idCompany: _self.an4.idCompanyReference,
            idBranch: _self.an4.idBranchReference,
            uf: _self.an4.ufReference,
            idTax: [_self.an4.taxInfoReference],
            subperiod: _self.an4.subperiodReference,
            month: _self.an4.monthReference,
            year: _self.an4.yearReference
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
                viewData: { eefiInfo: _self.eefiInfo }
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
