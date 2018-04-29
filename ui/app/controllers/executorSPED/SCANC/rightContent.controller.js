 sap.ui.controller("app.controllers.executorSPED.SCANC.rightContent", {
 	onInit: function() {},
 	onDataRefactor: function(data) {
 		return $.extend(data, this.data);
 	},
 	onAfterRendering: function(html) {
 		var _self = this;
 		$(".right-content").css("overflow-y", "hidden");
 		_self.configData = {};
 		_self.versionData = {};
 		_self.view = html;
 		_self.view.tabs = _self.view.find(".scanc-tabs");
 		_self.loader = _self.view.find(".executor-wrapper").baseLoader({
 			modal: true
 		});
 		var spedID = window.parameters.id;
 		_self.loader.open();
 		var callBack = function() {
 			Data.endpoints.dfg.sped.list.spedFile.post({
 				ids: spedID,
 				type: [1, 2, 3, 4, 5],
 				layoutData: true,
 				structure: true,
 				variantData: true
 			}).success(function(data) {

 				_self.fileData = data.list[0];
 				_self.coreServices.validData = {
 					validFrom: _self.fileData.validFrom,
 					validTo: _self.fileData.validTo
 				};
 				if (!_self.fileData) {
 					_self.goToLibrary();
 				}
 				_self.renderToolbar();

 				_self.eefiInfo = {};
 				_self.fileData.EEFI.map(function(eefi) {
 					if (!_self.eefiInfo[eefi.idCompany]) {
 						_self.eefiInfo[eefi.idCompany] = {
 							idBranch: {},
 							name: eefi.idCompany,
 							key: eefi.idCompany
 						};
 					}
 					if (!_self.eefiInfo[eefi.idCompany].idBranch[eefi.idBranch]) {
 						_self.eefiInfo[eefi.idCompany].idBranch[eefi.idBranch] = {
 							uf: {},
 							name: eefi.idBranch,
 							key: eefi.idBranch
 						};
 					}
 					if (!_self.eefiInfo[eefi.idCompany].idBranch[eefi.idBranch].uf[eefi.uf]) {
 						_self.eefiInfo[eefi.idCompany].idBranch[eefi.idBranch].uf[eefi.uf] = {
 							name: eefi.uf,
 							key: eefi.uf,
 							idTax: {}
 						};
 					}
 					if (!_self.eefiInfo[eefi.idCompany].idBranch[eefi.idBranch].uf[eefi.uf].idTax[eefi.idTax]) {
 						_self.eefiInfo[eefi.idCompany].idBranch[eefi.idBranch].uf[eefi.uf].idTax[eefi.idTax] = {
 							key: eefi.idTax,
 							name: eefi.taxName,
 							isTaxGroup: eefi.isTaxGroup
 						};
 					}
 				});
 				_self.services.layoutObject.headerData = _self.fileData;
 				_self.coreServices.idStructure = [];
 				var st = {};
 				_self.fileData.structure = _self.fileData.structure.map(function(s) {
 					_self.coreServices.idStructure.push(s.id);
 					var structure = JSON.parse(s.structure);
 					st[s.id] = {
 						id: s.id,
 						fields: {},
 						hanaPackage: structure.hanaPackage,
 						hanaName: structure.hanaName,
 						title: structure.title,
 						inputParameters: structure.inputParameters
 					}
 					structure.fields.map(function(f){
 					    st[s.id].fields[f.ID] = f;
 					});
 					return {
 						id: s.id,
 						fields: structure.fields,
 						hanaPackage: structure.hanaPackage,
 						hanaName: structure.hanaName,
 						title: structure.title,
 						inputParameters: structure.inputParameters
 					};
 				});
 				$.globalFunctions.setStructure(st);
 				_self.versionData = JSON.parse(_self.fileData.layout[0].json);
 				_self.renderTabs();
 				_self.loader.close();
 				if (window.parameters.subperiod) {

 				}

 			}).error(function() {
 				_self.loader.close();
 				_self.goToLibrary();
 			});
 		};
 		if (window.parameters.subperiod && window.parameters.calculationBlocks) {
 			Data.endpoints.tfpEndpoint.subperiod.getSubperiod.post({
 				id: window.parameters.subperiod
 			}).success(function(data2) {
 				_self.coreServices.subPeriodData = data2[0];
 				callBack();
 			});
 		} else {
 			callBack();
 		}

 	},
 	renderToolbar: function() {
 		var _self = this;
 		var executePrivilege = false;
 		var exportPrivilege = false;
 		exportPrivilege = _self.privileges.sped.exportSCANC;
 		executePrivilege = _self.privileges.sped.executeSCANC;
 		var leftButtons = [];

 		leftButtons = [{
 			text: i18n("EXECUTE"),
 			onPress: function() {
 				_self.execute();
 			},
 			isButton: true,
 			iconFont: "Media",
 			icon: "play",
 			enabled: executePrivilege,
 			tooltip: i18n("EXECUTE TOOLTIP")
        },{
				text: i18n("SAVE"),
				isButton: true,
				enabled: true,
				iconFont: "Finance-and-Office",
				icon: "floppydisc",
				tooltip: i18n("CLICK PRESS TO") + i18n("SAVE DIGITAL FILE"),
				onPress: function() {
					_self.saveSPED();
				}
            }, {
 			text: i18n("EXPORT"),
 			onPress: function() {
 				_self.dialogExport = $.baseDialog({
 					title: i18n('EXPORT'),
 					modal: true,
 					size: 'medium',
 					outerClick: 'disabled',
 					viewName: "app.views.dialogs.exportArquivo",
 					viewData: {},
 					buttons: [{
 						name: i18n('CANCEL'),
 						isCloseButton: true
                    }, {
 						name: i18n('EXPORT'),
 						click: function() {
 							_self.download(_self.dialogExport.getInnerController().getSelection());

 							_self.dialogExport.close();
 						}
                    }]
 				});
 				_self.dialogExport.open();
 				
 			},
 			isButton: true,
 			iconFont: "DataManager",
 			icon: "download",
 			tooltip: i18n("EXPORT TOOLTIP")
        }];

 		_self.toolbar = $("#toolbarTop").bindBaseLibraryToolbar({
 			leftButtons: leftButtons,
 			rightButtons: [{
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
            }],
 			hideGrid: true
 		});

 	},
 	renderTabs: function() {
 		var _self = this;
 		_self.view.tabs.empty();
 		_self.tabs = _self.view.tabs.bindBaseTabs({
 			type: "boxes",
 			wrapperClass: "wrapperClass",
 			tab: [{
 				title: i18n("GENERAL PARAMS"),
 				icon: "gears",
 				iconColor: "white",
 				iconFont: "Display-and-Setting",
 				viewName: "app.views.executorSPED.SCANC.form.generalParams",
 				viewData: {
 					fileData: _self.fileData,
 					eefiInfo: _self.eefiInfo
 				}
        	}, {
 				title: i18n("EXECUTION RESULT"),
 				icon: "filleddocument",
 				iconColor: "white",
 				iconFont: "File-and-Folders",
 				viewName: "app.views.executor.digitalFile"
        	}]
 		});

 	},
 	execute: function() {
 		var _self = this;
 		var generalParamsCtrl = _self.tabs.getInnerControllers()[0];
 		if (generalParamsCtrl.validate()) {
 			var orgParams = generalParamsCtrl.getOrganizationParams();
 			var manualParams = generalParamsCtrl.getManualParams();
 			console.log(orgParams);
 			console.log(manualParams);
 			Data.endpoints.structures.getMapping.post({
 				idStructure: _self.coreServices.idStructure,
 				startDate: orgParams.initSubPeriod,
 				idTax: orgParams.tax,
 				endDate: orgParams.endSubPeriod
 			}).success(function(response) {
 				var canProceed = true;
 				if (response.length === 0) {
 					$.baseToast({
 						text: i18n('NO MAP CONFIG FOUND'),
 						isError: false,
 						type: 'W'
 					});
 					canProceed = false;
 				} else {
 					var responseStructure = [];
 					response.map(function(r) {
 						if (responseStructure.indexOf(r.structureId) === -1) {
 							responseStructure.push(r.structureId);
 						}
 					});
 					for (var i = 0; i < _self.coreServices.idStructure.length; i++) {
 						if (responseStructure.indexOf(_self.coreServices.idStructure[i]) === -1) {
 							var structureName;
 							for (var j = 0; j < _self.fileData.structure.length; j++) {
 								if (_self.fileData.structure[j].id === _self.coreServices.idStructure[i]) {
 									structureName = _self.fileData.structure[j].title;
 									break;
 								}
 							}
 							$.baseToast({
 								text: i18n("NO MAP CONFIG FOUND FOR") + " " + structureName,
 								type: 'W'
 							});
 						}
 					}
 				}
 				var mappingId = [];
 				var rs = [];
 				for (var index = 0; index < response.length; index++) {
 					if (rs.indexOf(response[index].structureId) === -1) {
 						mappingId.push(response[index].id);
 						rs.push(response[index].structureId);
 					} else {
 						canProceed = false;
 						$.baseToast({
 							text: i18n('MANY MAP CONFIG FOUND'),
 							isError: false,
 							type: 'W'
 						});
 					}
 				}
 				if (canProceed) {
 					_self.coreServices.mapConfigs = response;
 					_self.configData = orgParams;
 					_self.manualParams = manualParams;
 					_self.configData.idMap = mappingId;
 					_self.executeSCANC();
 				}

 			});
 		}
 	},
 	executeSCANC: function() {
 		var _self = this;
 		$.dfgExecutor.setRequiredData({
 			generalParamsDataObject: _self.configData,
 			manualParams: _self.manualParams,
 			configData: _self.configData,
 			idStructure: _self.coreServices.idStructure,
 			layoutJSON: JSON.parse(_self.fileData.layout[0].json),
 			layoutObject: _self.services.layoutObject,
 			mapConfigs: _self.coreServices.mapConfigs,
 			idLayoutVersion: _self.fileData.idLayoutVersion,
 			isSCANCExecution: true,
 			loader: _self.loader
 		});
 		var assingRawFile = function(rawFile) {
 			_self.coreServices.executionFileData = {
 				rawFile: rawFile
 			};
 			_self.coreServices.executionFileFlag = true;

 		};
 		$.dfgExecutor.getExecutionResult(assingRawFile);
 	},
 	download: function(option) {
 		var _self = this;

 		var fileName = _self.fileData.layoutName.name;
 		var downloadFile = function(fileName, urlData) {
 			var a = document.createElement('a');
 			document.body.appendChild(a);
 			a.download = fileName;
 			a.href = urlData;
 			a.click();
 		};
 		fileName += _self.configData.company + " " ;
 		if(_self.configData.branch){
 		    fileName +=  _self.configData.branch + " ";
 		}
 		if (_self.configData.subPeriod.subperiod.match(/[0-9]+[AY]/g) !== null) {
 			fileName += _self.configData.subPeriod.year;
 		} else {
 			fileName += _self.configData.subPeriod.month + "-" + _self.configData.subPeriod.year;
 		}
 
 		if (option === "text") {
 			var string = _self.coreServices.executionFileData.rawFile.replace(/&&::\d+&:\d+/g, "");
 			string = string.replace(new RegExp(String.fromCharCode(8204), 'g'), "");

 			downloadFile(fileName + ".txt", "data:text/csv;charset=ansi," + encodeURIComponent(string));
 		} else {
 			if (option === "xml") {
 				downloadFile(fileName + ".xml", "data:text/csv;charset=UTF-8," + encodeURIComponent($.globalFunctions.toXML(_self.coreServices.executionFileData
 					.rawFile, JSON.parse(_self.fileData.layout[0].json))));

 			} else {
 				var BOM = '\uFEFF';
 				var dataBlob = BOM += $.globalFunctions.toCSV(_self.coreServices.executionFileData.rawFile.replace(
 					/&&::\d+&:\d+/g, ""), JSON.parse(_self.fileData.layout[0].json));

 				var blob = new Blob([dataBlob], {
 					type: 'text/plain;charset=utf-8'
 				});
 				saveAs(blob, fileName + '.xls');

 			}

 		}
 	},
 	saveSPED: function() {
	    var _self = this;
		if (!_self.coreServices.executionFileFlag) {
			$.baseToast({
				type: "W",
				text: i18n("WARNING EXECUTE FIRST")
			});
			return;
		}
		var digitalFileEEFI = _self.configData;
		var object = JSON.parse(JSON.stringify(_self.fileData));
		if (_self.manualParams) {
			object.manualParams = _self.manualParams;
		}
		object.idSettingVersion = _self.fileData.id;
		object.name = _self.fileData.name + " " + digitalFileEEFI.company + " ";
		if(digitalFileEEFI.branch){
		    object.name += digitalFileEEFI.branch + " ";
		}
		object.description = _self.fileData.description;
		object.idCompany = digitalFileEEFI.company;
		object.uf = digitalFileEEFI.uf||"";
		object.idBranch = digitalFileEEFI.branch||"";
		object.idTax = digitalFileEEFI.tax || "";
		object.year = digitalFileEEFI.subPeriod.year;
		object.month = digitalFileEEFI.subPeriod.month;
		object.subperiod = digitalFileEEFI.subPeriod.subperiod;
		if (object.subperiod.match(/[0-9]+[AY]/g) !== null) {
			object.name += object.year;
		} else {
			object.name += object.month + "-" + object.year;
		}
		object.digitalFile =_self.coreServices.executionFileData;
		object.idDigitalFileType = _self.fileData.layoutName.idDigitalFileType;
		object.months = JSON.stringify(digitalFileEEFI.subPeriod.months);
		object.isSPED = 1; 
		object.json = _self.fileData.layout[0].json;
		Data.endpoints.dfg.digitalFile.issue.post(object).success(function(data) {
			$.baseToast({
				type: "S",
				text: i18n("SUCCESS SAVING FILE")
			});
		});
	},
 	goToLibrary: function() {
 		window.location = "#/library?restoreSettings=1";
 	},
 	goToTaskBoard: function() {
 		window.location = "/timp/tkb/";
 	}
 });