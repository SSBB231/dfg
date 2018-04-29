/*global i18n Data getTDFServiceLocation*/
sap.ui.controller("app.controllers.executor.rightContent", {
	onInit: function() {},
	onDataRefactor: function(data) {
		return $.extend(data, this.data);
	},
	onAfterRendering: function(html) {
	    
		var _self = this;

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
                    	_self.filtersDialog.close();
                    }
                }, {
                    name: i18n('APPLY'),
                    enabled: false,
                    click: function() {
                    	_self.filtersDialog.close();
                    },
                    tooltip: i18n('CLICK PRESS CONFIRM')
                }]
            });
            _self.filtersDialog.open();
        };
		if(_self.privileges && !_self.privileges.Access){
		    $.baseToast({
		        type: "W",
		        text: i18n("NO ACCESS PRIVILEGES FOUND")
		    });
		    window.location = "/timp/tkb/#/content";
		} 
		$(".right-content").css("overflow-y", "hidden");
		_self.configData = {};
		_self.versionData = {};
		_self.view = html;
		_self.renderToolbar();
		_self.loader = $("#right-content > div > .executor-wrapper").baseLoader({
			modal: true
		});

		_self.firstTimeLoaded = true;
		if (window.parameters.idSPEDFile === undefined && window.parameters.idSPED === undefined)
			_self.openExecuteLateral();

		_self.getLayoutData();
		_self.fileStatus = {
			ACTIVE: "100",
			ISSUED: "200",
			OFFICIAL: "300",
			SENT: "400",
			RECTIFICATION: "500"
		};

	},
	abas: function() {
		var _self = this;
		$(_self.loader._mask).css("background-color", "rgba(255, 255, 255, 0.4)");
		$(_self.loader._mask).find(".base-loader").css("visibility", "hidden");
		_self.tabController = $("#settings-tabs").bindBaseTabs({
			tab: [{
				title: i18n("GENERAL PARAMS"),
				icon: "gear",
				iconColor: "white",
				iconFont: "Display-and-Setting",
				viewName: "app.views.dialogs.executarArquivo",
				tooltip: i18n("GENERAL PARAMETER TOOLTIP")
            }, {
				title: i18n("MANUAL PARAMS"),
				icon: "coin",
				iconColor: "white",
				iconFont: "Finance-and-Office",
				viewName: "app.views.dialogs.executarParamsManual",
				tooltip: i18n("MANUAL PARAMETER TOOLTIP"),
				viewData: _self.versionData
            }],
			type: "boxes",
			wrapperClass: "wrapperClass"
		});

	},
	showSettingDetail: function() {
		var _self = this;
		_self.coreServices.allVersionData.tax = _self.coreServices.allVersionData.idTax.descrCodTributoLabel;
		var dialog = $.baseDialog({
			title: i18n('LIBRARY DETAIL'),
			modal: true,
			size: "big",
			outerClick: 'disabled',
			cssClass: "newFile",
			viewName: "app.views.dialogs.NewFile",
			viewData: {
				isView: true,
				isEdit: false,
				setting: _self.coreServices.allVersionData,
				type: 'setting'
			},
			buttons: [{
				name: i18n('CLOSE'),
				isCloseButton: true,
				click: function() {
					_self.loader.close();
				},
				tooltip: i18n('CLICK PRESS CLOSE'),

            }]
		});
		dialog.open();
	},
	renderToolbar: function() {
		var _self = this;
		var issueBtn = {
			text: i18n("SAVE"),
			isButton: true,
			enabled: window.parameters.idSPEDFile === undefined && window.parameters.idSPED === undefined,
			iconFont: "Finance-and-Office",
			icon: "floppydisc",
			tooltip: i18n("CLICK PRESS TO") + i18n("SAVE DIGITAL FILE"),
			onPress: function() {
				if (!_self.coreServices.executionFileFlag) {
					$.baseToast({
						type: "W",
						text: i18n("WARNING EXECUTE FIRST")
					});
					return;
				}
				var digitalFileEEFI = _self.coreServices.getDataGenParams();
				var object = JSON.parse(JSON.stringify(_self.services.layoutObject.headerData));
				if (_self.manualParams) {
					object.manualParams = _self.manualParams;
				}
				object.idSettingVersion = _self.services.layoutObject.headerData.version.id;
				object.name = _self.services.layoutObject.headerData.name + " " + digitalFileEEFI.company + " " + digitalFileEEFI.branch + " ";

				object.description = _self.services.layoutObject.headerData.description;
				object.idCompany = digitalFileEEFI.company;
				object.uf = digitalFileEEFI.uf;
				object.idBranch = digitalFileEEFI.branch;
				object.idTax = digitalFileEEFI.tax;
				object.year = digitalFileEEFI.subPeriod.year;
				object.month = digitalFileEEFI.subPeriod.month;
				object.subperiod = digitalFileEEFI.subPeriod.subperiod;
				if (object.subperiod.match(/[0-9]+[AY]/g) !== null) {
					object.name += object.year;
				} else {
					object.name += object.month + "-" + object.year;
				}
				object.digitalFile = _self.coreServices.executionFileData;
				object.idDigitalFileType = _self.services.layoutObject.headerData.digitalFileType.id;
				object.months = JSON.stringify(digitalFileEEFI.subPeriod.months);
				Data.endpoints.dfg.digitalFile.issue.post(object).success(function(data) {
					$.baseToast({
						type: "S",
						text: i18n("SUCCESS SAVING FILE")
					});
				});
			},
			"class": "exe-tb-execute"
		};
		var visualizeAN3 = {
			text: i18n("VISUALIZE") + " " + "AN3",
			isButton: true,
			enabled: true,
			tooltip: i18n("CLICK PRESS TO") + i18n("VISUALIZE") + "AN3",
			onPress: function() {
				if (!_self.coreServices.executionFileFlag) {
					$.baseToast({
						type: "W",
						text: i18n("WARNING EXECUTE FIRST")
					});
					return;
				}
				var digitalFileEEFI = _self.coreServices.getDataGenParams();
				var object = JSON.parse(JSON.stringify(_self.services.layoutObject.headerData));
				if (_self.manualParams) {
					object.manualParams = _self.manualParams;
				}
				object.idSettingVersion = _self.services.layoutObject.headerData.version.id;
				object.name = _self.services.layoutObject.headerData.name + " " + digitalFileEEFI.company + " " + digitalFileEEFI.branch + " ";

				object.description = _self.services.layoutObject.headerData.description;
				object.idCompany = digitalFileEEFI.company;
				object.uf = digitalFileEEFI.uf;
				object.idBranch = digitalFileEEFI.branch;
				object.idTax = digitalFileEEFI.tax;
				object.year = digitalFileEEFI.subPeriod.year;
				object.month = digitalFileEEFI.subPeriod.month;
				object.subperiod = digitalFileEEFI.subPeriod.subperiod;
				if (object.subperiod.match(/[0-9]+[AY]/g) !== null) {
					object.name += object.year;
				} else {
					object.name += object.month + "-" + object.year;
				}
				object.digitalFile = _self.coreServices.executionFileData;
				object.idDigitalFileType = _self.services.layoutObject.headerData.digitalFileType.id;
				object.months = JSON.stringify(digitalFileEEFI.subPeriod.months);
				_self.loader.open();
				Data.endpoints.bre.rule.DFGAN3Rules.post({
					idLayout: _self.services.layoutObject.headerData.layoutVersion[0].id
				}).success(function(data) {
					if (data.length === 0) {
						$.baseToast({
							type: "w",
							text: i18n("NO AN3 RULES FOUND")
						});
					} else {
						var dialog = $.baseDialog({
							title: i18n("CREATE AN3"),
							modal: true,
							size: "big",
							disableOuterClick: true,
							viewName: "app.views.executor.an3Dialog.an3Dialog",
							viewData: {
								rules: data,
								idLayoutVersion: _self.services.layoutObject.headerData.layoutVersion[0].id,
								digitalFile: object
							},
							buttons: [{
								name: i18n("CANCEL"),
								isCloseButton: true,
								tooltip: i18n('CLICK PRESS CANCEL')
                        	}, {
								name: i18n("ATTRIBUTE"),
								tooltip: i18n('CLICK PRESS CONFIRM'),
								click: function() {
									_self.createAN3Dialog.getInnerController().createAN3();
								}
                        	}]
						});
						_self.createAN3Dialog = dialog;
						dialog.open();

					}
					_self.loader.close();
				}).error(function(data) {
					_self.loader.close();
				});
			},
			iconFont: "File-and-Folders",
			icon: "reportdoc"
		};
		var officialize = {
			text: i18n("OFFICIALIZE FILE"),
			isButton: true,
			enabled: true,
			tooltip: i18n("CLICK PRESS TO") + i18n("OFFICIALIZE FILE"),
			onPress: function() {
				if (!_self.coreServices.executionFileFlag) {
					$.baseToast({
						type: "W",
						text: "WARNING EXECUTE FIRST EXECUTE"
					});
					return;
				}
				Data.endpoints.dfg.digitalFile.officialize.post({
					id: _self.services.layoutObject.headerData.id
				}).success(function(response) {
					if (response) {
						$.baseToast({
							type: "S",
							text: i18n("SUCCESS OFFICIALIZE")
						});
						_self.toolbar.enableButton(4);
						_self.toolbar.removeButton(3);
					} else {
						$.baseToast({
							text: i18n("OFFICIALIZE FAILED"),
							isError: true
						});
					}
				});
			},
			"class": "exe-tb-execute officializeFile",
			iconFont: "File-and-Folders",
			icon: "groupdocschecked"
		};

		var analyze = {
			text: i18n("ANALIZED"),
			isButton: true,
			enabled: true,
			onPress: function() {
				Data.endpoints.dfg.digitalFile.analyze.post(_self.services.layoutObject.headerData).success(function(data) {
					$.baseToast({
						type: "S",
						text: ""
					});
				});
			},
			"class": "exe-tb-execute analyzeFile",
			iconFont: "Sign-and-Symbols",
			icon: "check-44"
		};
		var viewData = {
			text: i18n("VIEW DATA"),
			isButton: true,
			enabled: true,
			tooltip: i18n("CLICK PRESS TO") + ' ' + i18n("VIEW DATA"),
			onPress: function() {
				if (!_self.coreServices.executionFileFlag) {
					$.baseToast({
						type: "W",
						text: "WARNING: EXECUTE FIRST"
					});
					return;
				}
				_self.createDataVisualizationTab();
			},
			"class": "exe-tb-execute view-data",
			iconFont: "Display-and-Setting",
			icon: "menu"
		};

		var filterData = {
			text: i18n("FILTER"),
			isButton: true,
			enabled: _self.coreServices.structure,
			tooltip: i18n("CLICK PRESS TO") + ' ' + i18n("FILTER TOOLTIP"),
			onPress: function() {
				_self.coreServices.openFiltersDialog();
			},
			"class": "exe-tb-execute view-data",
			iconFont: "Formatting-and-Tool",
			icon: "filter"
		};
		
		var leftButtons = [{
			text: i18n("EXECUTE"),
			onPress: function() {
				_self.loader.open();
				_self.executeDigitalFile();
			},
			isButton: true,
			iconFont: "Media",
			icon: "play",
			enabled: window.parameters.idSPEDFile === undefined && window.parameters.idSPED === undefined,
			tooltip: i18n("EXECUTE TOOLTIP")
        }, {
			text: i18n("LIBRARY DETAIL"),
			onPress: function() {
				_self.loader.open();
				_self.showSettingDetail();
			},
			isButton: true,
			iconFont: "Sign-and-Symbols",
			icon: "magnifierplus",
			enabled: window.parameters.idSPEDFile === undefined && window.parameters.idSPED === undefined,
			tooltip: i18n("LIBRARY DETAIL TOOLTIP")
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
				if (window.parameters.idSPEDFile === undefined && window.parameters.idSPED === undefined) {
					_self.dialogExport.open();
				} else {
					_self.download();
				}
			},
			isButton: true,
			iconFont: "DataManager",
			icon: "download",
			tooltip: i18n("EXPORT TOOLTIP")
        }, {
			text: i18n("SETTINGS"),
			onPress: function() {
				if (!window.parameters.idSPEDFile && window.parameters.idSPED === undefined) {
					if (_self.firstTimeLoaded) {

						_self.openExecuteLateral();

					} else {
						if ($("#overlapRight").hasClass("novisible")) {
							$("#overlapRight").show();
							_self.openExecuteLateral();
						} else {
							disableBackTabIndex($("#overlapRight"));
							$("#overlapRight").hide();
							_self.closeExecuteLateral();
						}
					}
				}
			},
			isButton: true,
			iconFont: "Display-and-Setting",
			icon: "setting",
			enabled: window.parameters.idSPEDFile === undefined && window.parameters.idSPED === undefined,
			tooltip: i18n("SETTING TAB TOOLTIP")
        }];

		if (window.parameters.executed) {
			leftButtons.push(officialize);
		} else {
			leftButtons.push(issueBtn);
			leftButtons.push(visualizeAN3);
		}
		leftButtons.push(viewData);
		leftButtons.push(filterData);
		if (window.parameters.analyze) {
			leftButtons.push(analyze);
		}


		_self.toolbar = $("#toolbarTop").bindBaseLibraryToolbar({
			leftButtons: leftButtons,
			rightButtons: [{
				text: i18n("EDITOR"),
				onPress: function() {
					_self.goToEditor();
				},
				isButton: true,
				enabled: window.parameters.idSPEDFile === undefined && window.parameters.idSPED === undefined,
				"class": "nav-button",
				iconFont: "File-and-Folders",
				icon: "layout",
				tooltip: i18n("EDITOR TOOLTIP")
            }, {
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
	goToEditor: function() {
		var _self = this;
		var idVersion = _self.coreServices.allVersionData.idLayoutVersion;
		var locationString;
		locationString = "#/editor?id=" + _self.idLayout;
		if (idVersion) {
			locationString += "&idVersion=" + idVersion;
		}
		window.location = locationString;
	},
	getLayoutData: function() {
		var _self = this;
		var object;
		var idLayout = window.parameters.id;
		var idVersion = window.parameters.idSettingVersion;
		var idFile = window.parameters.idFile;
		//_self.loader.open();
		_self.loader.open();

		var objectType = (window.parameters.executed) ? "digitalFile" : "setting";
		if (!window.parameters.idSPEDFile && window.parameters.idSPED === undefined) {
			Data.endpoints.dfg[objectType].read.post({
				id: idLayout,
				idSettingVersion: idVersion,
				structure: true
			}).success(function(versionData) {
				_self.services.layoutObject.headerData = versionData;
				let structureMap = {}; 
				_self.coreServices.exhibition = true;
				_.forEach(versionData.structure, function(structure){
					structureMap[structure.id] = {};
					structureMap[structure.id].fields = {};
					_.forEach(structure.fields, function(field){
						structureMap[structure.id].fields[field.ID] = _.cloneDeep(field);
					});
				}); 

				$.globalFunctions.setStructure(structureMap);
				_self.coreServices.structure  = versionData.structure;
				_self.coreServices.eefi = versionData.eefi;
				_self.coreServices.idStructure = [];
				for (var index = 0; index < versionData.structure.length; index++) {
					_self.coreServices.idStructure.push(versionData.structure[index].id);
				}
				_self.coreServices.allVersionData = versionData;
				versionData.json = JSON.parse(versionData.layoutVersion ? versionData.layoutVersion[0].json : versionData.layout.json);
				_self.coreServices.layoutObject = versionData.json;
				versionData.blocks = versionData.json.blocks;
				versionData.positions = versionData.json.positions;
				versionData.fields = versionData.json.fields;
				versionData.format = versionData.json.format;
				versionData.mapConfig = versionData.json.mapConfig;
				versionData.rules = versionData.json.rules;
				versionData.separator = versionData.json.separator;

				_self.idLayout = versionData.layout.id;

				var callBack = function() {
					if (!idVersion) {
						object = {
							idLayout: idLayout,
							idVersion: versionData.id
						};
						_self.idVersion = versionData.id;
						_self.versionData = versionData;
						_self.abas();
						if (!idFile) {
							_self.openExecuteLateral();
						} else {
							Data.endpoints.crud.readDigitalFile.post({
								id: idFile
							}).success(function(configData) {
								_self.configData = configData[0];
								console.log(_self.configData);
								_self.configData.validFrom = _self.configData.validFrom === null ? "" : parseDate(_self.configData.validFrom);
								_self.configData.validTo = _self.configData.validTo === null ? "" : parseDate(_self.configData.validTo);
								_self.executeDigitalFile();
								_self.abas();
							}).error(function(response) {
								_self.services.processMessages(JSON.parse(response.responseText));
								if (response.status == 401) {
									if (_self.privileges.layout.read) {
										_self.goToLibrary();
									} else {
										_self.goToTaskBoard();
									}
								}
								_self.loader.close();
							});
						}
					} else {

						object = {
							idLayout: idLayout,
							idVersion: versionData.id
						};
						_self.idVersion = versionData.id;
						_self.versionData = versionData;
						_self.abas();
						if (!idFile) {
							//_self.openExecuteDialog();
							_self.openExecuteLateral();
						} else {
							Data.endpoints.crud.readDigitalFile.post({
								id: idFile
							}).success(function(configData) {
								_self.configData = configData[0];
								_self.configData.validFrom = _self.configData.validFrom === null ? "" : parseDate(_self.configData.validFrom);
								_self.configData.validTo = _self.configData.validTo === null ? "" : parseDate(_self.configData.validTo);
								_self.executeDigitalFile();
								_self.abas();
							}).error(function(response) {
								if (response.status == 401) {
									if (_self.privileges.layout.read) {
										_self.goToLibrary();
									} else {
										_self.goToTaskBoard();
									}
								}
								_self.loader.close();
							});
						}
					}
				}
				if (window.parameters.subperiod) {

					Data.endpoints.tfpEndpoint.subperiod.getSubperiod.post({
						id: window.parameters.subperiod
					}).success(function(data2) {
						_self.coreServices.subPeriodData = data2[0];
						callBack();
					});
				} else {
					callBack();
				}
				_self.rectification = $.baseDialog({
					outerClick: "disabled",
					title: i18n("RECTIFICATION"),
					modal: true,
					size: "medium",
					viewName: "app.views.dialogs.Rectification",
					viewData: {
						layoutData: _self.services.layoutObject.headerData
					},
					buttons: [{
						name: i18n('CANCEL'),
						isCloseButton: true,
						tooltip: i18n('CLICK PRESS CANCEL')
                    }, {
						name: i18n('SAVE'),
						click: function() {
							_self.coreServices.rectifyDigitalFile();
							_self.rectification.close();
						},
						tooltip: i18n('CLICK PRESS CONFIRM')
                    }]
				});
				if (_self.coreServices.allVersionData.digitalFile) {
					versionData.digitalFile = JSON.parse(versionData.digitalFile || "{}");
					_self.loader.open();
					_self.executeDigitalFile();
				}
				if (versionData.status === _self.fileStatus.OFFICIAL) {
					_self.toolbar.removeButton(3);
					_self.toolbar.addButton({
						text: i18n("SEND FILE"),
						isButton: true,
						enabled: true,
						tooltip: i18n("CLICK PRESS TO") + i18n("SEND FILE"),
						onPress: function() {
							Data.endpoints.dfg.digitalFile.send.post({
								id: _self.services.layoutObject.headerData.id
							}).success(function(response) {
								if (response) {
									$.baseToast({
										type: "S",
										text: i18n("SEND SUCCESSFUL")
									});
									_self.toolbar.addButton({
										text: i18n("FILE SENT"),
										isButton: false,
										enabled: true,
										tooltip: i18n("FILE SENT"),
										"class": "exe-tb-execute",
										iconFont: "Sign-and-Symbols",
										icon: "check-44"
									});
									/*_self.toolbar.addButton({
                                        text: i18n("RECTIFICATION"),
                                        isButton: true,
                                        enabled: true,
                                        tooltip: i18n("RECTIFICATION TOOLTIP"),
                                        onPress: function(){
                                            _self.rectification.open();
                                        },
                                        "class": "exe-tb-execute",
                                        iconFont: "File-and-Folders",
                                        icon: "docversion"
                                    });*/
									_self.toolbar.removeButton(3);

								} else {
									$.baseToast({
										type: "E",
										text: i18n("SEND FAILED"),
										isError: true
									});
								}
							});
						},
						"class": "exe-tb-execute sendFile",
						iconFont: "Communication",
						icon: "send"
					});
				}
				if (versionData.status === _self.fileStatus.SENT) {
					_self.toolbar.addButton({
						text: i18n("FILE SENT"),
						isButton: false,
						enabled: true,
						tooltip: i18n("FILE SENT"),
						"class": "exe-tb-execute",
						iconFont: "Sign-and-Symbols",
						icon: "check-44"
					});
					/*_self.toolbar.addButton({
                        text: i18n("RECTIFICATION"),
                        isButton: true,
                        enabled: true,
                        tooltip: i18n("RECTIFICATION TOOLTIP"),
                        onPress: function(){
                            _self.rectification.open();
                        },
                        "class": "exe-tb-execute",
                        iconFont: "File-and-Folders",
                        icon: "docversion"
                    });*/
					_self.toolbar.removeButton(3);
				}
			}).error(function(response) {
				if (response.status == 401) {
					if (_self.privileges.layout.read) {
						_self.goToLibrary();
					} else {
						_self.goToTaskBoard();
					}
				}
				_self.loader.close();
			});
		} else {
		    var exportTomFile = function(){
		        Data.endpoints.dfg.sped.getTOMFileMetadata.post({
					idFile: window.parameters.idSPEDFile,
					idProcess: _self.taskInfo ? _self.taskInfo.processID : undefined
				}).success(function(data) {
					_self.file = data;
					var callBack = function(formData) {
						Data.endpoints.dfg.sped.exportTOMFile.post({
							idFile: window.parameters.idSPEDFile || _self.file.idFile,
							adapter: formData.adapter,
							destination: formData.destination
						}).success(function(data) {

							if (data.file) {
								_self.file.rawFile = data.file;
								_self.createDigitalFileTabs();
								_self.createDigitalFile({
									rawFile: data.file
								}, []);
							} else {
								$.baseToast({
									text: i18n("COULD NOT DOWNLOAD FILE"),
									type: "e"
								});
								_self.goToLibrary();
							}
							_self.loader.close();
						}).error(function() {
							_self.loader.close();
							$.baseToast({
								text: i18n("ERROR GETTING FILE"),
								type: "e"
							});
							_self.goToLibrary();
						});
					};
				// 	$.baseWebServiceDialog({
				// 		title: i18n('SERVICE'),
				// 		viewData: {
				// 			serviceName: "TMFTOMExportFile",
				// 			noLocation: true,
				// 			callBack: function(formData) {
				// 				callBack(formData);
				// 			}
				// 		}
				// 	});
					getTDFServiceLocation(
            		    "TMFTOMExportFile",
            			function(adapterId,location,destination){
            			    callBack({
            			        adapter:adapterId,
            			        destination:destination
            			    });
            			},
            			function(){
            			},
            			true
            		);
				}).error(function(data) {
					$.baseToast({
						text: i18n("COULD NOT DOWNLOAD FILE"),
						type: "e"
					});
					_self.goToLibrary();
				});
		    };
		    if(window.parameters.idTask){
    			Data.endpoints.bpma.getTaskInfo.post({
    				idTask: window.parameters.idTask
    			}).success(function(taskInfo) {
    				_self.taskInfo = taskInfo;
    				_self.taskInfo.processID = !_.isUndefined(taskInfo.instances[0]) ? JSON.parse(taskInfo.instances[0].json) : {};
    				_self.taskInfo.processID = _self.taskInfo.processID.processID || 0;
    				exportTomFile();
    			});
		    }else{ 
		        exportTomFile();
		    }

		}
	},
	/**
	 * [download description]
	 * Exports the current digitalFile to a simpleText document or to xml format
	 */
	download: function(option) {
		var _self = this;

		var fileName = "";
		var downloadFile = function(fileName, urlData) {
			var a = document.createElement('a');
			document.body.appendChild(a);
			a.download = fileName;
			a.href = urlData;
			a.click();
		};
		if (window.parameters.idSPEDFile === undefined && window.parameters.idSPED === undefined) {
			var digitalFileEEFI = _self.coreServices.getDataGenParams();
			fileName = _self.services.layoutObject.headerData.name + " " + digitalFileEEFI.company + " " + digitalFileEEFI.branch + " ";
			if (digitalFileEEFI.subPeriod.subperiod.match(/[0-9]+[AY]/g) !== null) {
				fileName += digitalFileEEFI.subPeriod.year;
			} else {
				fileName += digitalFileEEFI.subPeriod.month + "-" + digitalFileEEFI.subPeriod.year;
			}
		} else {
			fileName = _self.file.fileName;
			 var blob = new Blob([_self.file.rawFile],{
                type: 'data:text/csv;charset=UTF-8,'
            });
            saveAs(blob,fileName);
		//downloadFile(fileName, "data:text/csv;charset=ansi," + encodeURIComponent(_self.file.rawFile));
			return;
		}

		if (option === "text") {
			var string = _self.coreServices.executionFileData.rawFile.replace(/&&::\d+&:\d+/g, "");
			string = string.replace(new RegExp(String.fromCharCode(8204), 'g'), "");
            var blob = new Blob([string],{
                type: 'data:text/csv;charset=UTF-8,'
            });
            saveAs(blob,fileName+".txt");
		//	downloadFile(fileName + ".txt", "data:text/csv;charset=ansi," + encodeURIComponent(string));
		} else {
			if (option === "xml") {
				downloadFile(fileName + ".xml", "data:text/csv;charset=UTF-8," + encodeURIComponent(_self.toXML(_self.coreServices.allVersionData.layout
					.json, _self.coreServices.executionFileData.rawFile)));

			} else {
				var BOM = '\uFEFF';
				var dataBlob = BOM += _self.toCSV(_self.coreServices.allVersionData.layout.json, _self.coreServices.executionFileData.rawFile.replace(
					/&&::\d+&:\d+/g, ""));

				var blob = new Blob([dataBlob], {
					type: 'text/plain;charset=utf-8'
				});
				saveAs(blob, fileName + '.xls');

			}

		}
	},
	toXML: function(json, rawFile) {
		var xml = '<?xml version="1.0" ?>\r\n\t<rawfile>';
		json = JSON.parse(json);
		var records = rawFile.match(/[^\r\n]+/g);

		var separator = json.separator.value;

		if (separator === "") {
			separator = ";";
		}

		for (var i = 0; i < records.length; i++) {
			xml = xml + "\r\n\t\t<record id='" + (i + 1) + "'>";
			var x = records[i].split('&&::');
			var fields = x[0].split(separator);
			if (json.separator.inFirst) {
				fields.splice(0, 1);
			}
			if (json.separator.inLast) {
				fields.splice(fields.length - 1, 1);
			}

			var br = x[1].split('&:');
			var positions = json.blocks[br[0]].records[br[1]].positions;
			for (var j = 0; j < fields.length; j++) {
				var tag = "";
				if (positions[j] === "recordId") {
					tag = positions[j];
				} else {
					tag = json.fields[positions[j]].hanaName;
					tag = tag.replace(new RegExp(" ", "g"), "_");
				}
				xml = xml + "\r\n\t\t\t<" + tag + ">" + fields[j] + "</" + tag + ">";
			}

			xml = xml + "\r\n\t\t</record>";
		}
		xml = xml + '\r\n\t</rawfile>';
		return xml;
	},
	toCSV: function(json, rawfile) {
		if (typeof json === "string") {
			json = JSON.parse(json);
		}
		var separator = json.separator.value;

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
	},
	goToLibrary: function() {
		window.location = "#/library?restoreSettings=1";
	},

	closeExecuteLateral: function() {
		$("#overlapRight").removeClass("visible").addClass("novisible");
	},
	closeButtonClick: function() {
		var _self = this;
		$(_self.loader._mask).css("background-color", "");
		$(_self.loader._mask).find(".base-loader").css("visibility", "visible");
		_self.closeExecuteLateral();
		_self.disableToolbarButtons();
		_self.loader.close();
	},
	disableToolbarButtons: function() {
		var _self = this;
		_self.toolbar.disableButton(0);
		_self.toolbar.disableButton(2);
		_self.toolbar.disableButton(3);
	},
	enableToolbarButtons: function() {
		var _self = this;
		_self.toolbar.enableButton(0);
		_self.toolbar.enableButton(1);
		if (_self.privileges.digitalFile.generate == 1)
			_self.toolbar.enableButton(2);
	},
	openExecuteLateral: function() {

		var _self = this;
		var noMapConfig = false;
		$("#settings-close").prop('tabindex', 0);
		$("#settings-execute").prop('tabindex', 0);
		$("#settings-execute").baseTooltip({
			class: 'dark',
			position: 'top',
			text: i18n('EXECUTE TOOLTIP')
		});

		$('#settings-reset').find('.btn').baseTooltip({
			class: 'dark',
			position: 'top',
			text: i18n('RESET SETTINGS TOOLTIP')
		});

		if (!(_self.versionData.hasOwnProperty("mapConfig") && _self.versionData.mapConfig)) {
			noMapConfig = true;
		}

		$("#overlapRight").removeClass("novisible").addClass("visible");
		$("#overlapRight").show();

		disableBackTabIndex('.library-toolbar-items-right');
		enableBackTabIndex($("#overlapRight"));

		$("#executarArquivo .title #settings-close button").on("click", function() {
			_self.closeButtonClick();
			disableBackTabIndex($("#overlapRight"));
			enableBackTabIndex($('.library-toolbar-items-right'));
			$("#overlapRight").hide();

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
			};
		});

		$("#executarArquivo .footer #settings-reset").click(function() {
			_self.tabController.getInnerController(0).clearFields();
			_self.tabController.getInnerController(1).clearFields();
		});

		$("#executarArquivo .footer #settings-execute button").unbind("click").bind("click", function() {
			_self.configData = _self.tabController.getInnerController(0).getOwnData();
			_self.manualParams = _self.tabController.getInnerController(1).getOwnData();
			_self.loader.open();
			var callback = function(response) {
				_self.coreServices.mapConfigs = response;
				if (response.length === 0) {
					$.baseToast({
						text: i18n('NO MAP CONFIG FOUND'),
						isError: false,
						type: 'W'
					});
					_self.loader.close();
				} else if (response.length !== _self.coreServices.idStructure.length) {
					var responseStructure = response.map(function(r) {
						return r.structureId;
					});
					for (var i = 0; i < _self.coreServices.idStructure.length; i++) {
						if (responseStructure.indexOf(_self.coreServices.idStructure[i]) === -1) {
							var structureName;
							for (var j = 0; j < _self.coreServices.allVersionData.structure.length; j++) {
								if (_self.coreServices.allVersionData.structure[j].id === _self.coreServices.idStructure[i]) {
									structureName = _self.coreServices.allVersionData.structure[j].description;
									break;
								}
							}
							$.baseToast({
								text: i18n("NO MAP CONFIG FOUND FOR") + " " + structureName,
								type: 'W'
							});
						}
					}
					_self.loader.close();
				} else {
					var proceedExecution = true;
					var mappingId = [];
					for (var index = 0; index < response.length; index++) {
						if (mappingId.indexOf(response[index].id) === -1) {
							mappingId.push(response[index].id);
						} else {
							proceedExecution = false;
							$.baseToast({
								text: i18n('MANY MAP CONFIG FOUND'),
								isError: false,
								type: 'W'
							});
							_self.loader.close();
						}
					}
					if (proceedExecution) {

						Data.endpoints.centralizationMovement.getCentralizedBranches.post(_self.configData).success(function(data) {
							if (_self.configData.centralizationMovement) {
								if (data.isCentralized && data.centralizedBranches.length === 0) {
									$.baseToast({
										text: i18n("CENTRALIZED BRANCH CASE 2") + " " + data.centralizadora
									})
									return;
								} else if (data.centralizedBranches.length) {
									$.baseToast({
										text: i18n("CENTRALIZED BRANCH CASE 1")
									})

									_self.configData.branch = data.centralizedBranches;

								}
								_self.configData.idMap = mappingId;
								$(_self.loader._mask).css('background-color', '');
								$(_self.loader._mask).find(".base-loader").css("visibility", "visible");
								_self.enableToolbarButtons();
								var validFromChek = $('#inputValidFrom input').val();
								var validToChek = $('#inputValidTo input').val();
								_self.testePadrao = false;
								_self.executeDigitalFile();
								_self.closeExecuteLateral();
								disableBackTabIndex($('#overlapRight'));
								$('#overlapRight').hide();
								enableBackTabIndex($('.library-toolbar-items-right'));
							} else {
								if (data.isCentralized || data.centralizedBranches.length) {
									$.baseAlert({
										okText: i18n('YES'),
										cancelText: i18n('NO'),
										text: i18n('CENTRALIZED BRANCH CASE 3'),
										clickOk: function() {
											_self.configData.idMap = mappingId;
											$(_self.loader._mask).css('background-color', '');
											$(_self.loader._mask).find(".base-loader").css("visibility", "visible");
											_self.enableToolbarButtons();
											var validFromChek = $('#inputValidFrom input').val();
											var validToChek = $('#inputValidTo input').val();
											_self.testePadrao = false;
											_self.executeDigitalFile();
											_self.closeExecuteLateral();
											disableBackTabIndex($('#overlapRight'));
											$('#overlapRight').hide();
											enableBackTabIndex($('.library-toolbar-items-right'));
										},
										clickCancel: function() {

										}
									});
								} else {
									_self.configData.idMap = mappingId;
									$(_self.loader._mask).css('background-color', '');
									$(_self.loader._mask).find(".base-loader").css("visibility", "visible");
									_self.enableToolbarButtons();
									var validFromChek = $('#inputValidFrom input').val();
									var validToChek = $('#inputValidTo input').val();
									_self.testePadrao = false;
									_self.executeDigitalFile();
									_self.closeExecuteLateral();
									disableBackTabIndex($('#overlapRight'));
									$('#overlapRight').hide();
									enableBackTabIndex($('.library-toolbar-items-right'));
								}
							}

						});

					}
				}
			};
			if (_self.configData.subPeriod.subperiod === undefined) {
				$.baseToast({
					text: i18n('EMPTY SUBPERIOD'),
					isError: false,
					type: 'W'
				});

			} else if (_self.manualParams !== false) {
				_self.tabController.getInnerController(0).validateMappingSubPeriod(callback);

			}
		});

		$("#settings-execute").on('keydown', function() {

			var keyPressed = event.keyCode || event.which;

			if (keyPressed == 13) {
				_self.configData = _self.tabController.getInnerController(0).getOwnData();
				_self.manualParams = _self.tabController.getInnerController(1).getOwnData();
				var callback = function(response) {
					if (response.length === 0) {
						$.baseToast({
							text: i18n('NO MAP CONFIG FOUND'),
							isError: false,
							type: 'W'
						});
					} else {
						var proceedExecution = true;
						var mappingId = [];
						for (var index = 0; index < response.length; index++) {
							if (mappingId.indexOf(response[index].id) === -1) {
								mappingId.push(response[index].id);
							} else {
								proceedExecution = false;
								$.baseToast({
									text: i18n('MANY MAP CONFIG FOUND'),
									isError: false,
									type: 'W'
								});
							}
						}
						if (proceedExecution) {
							_self.configData.idMap = mappingId;
							$(_self.loader._mask).css('background-color', '');
							$(_self.loader._mask).find(".base-loader").css("visibility", "visible");
							_self.enableToolbarButtons();
							var validFromChek = $('#inputValidFrom input').val();
							var validToChek = $('#inputValidTo input').val();
							_self.testePadrao = false;
							_self.executeDigitalFile();
							_self.closeExecuteLateral();
							disableBackTabIndex($('#overlapRight'));
							$('#overlapRight').hide();
							enableBackTabIndex($('.library-toolbar-items-right'));

						}
					}
				};
				if (_self.configData.subPeriod.subperiod === undefined) {
					$.baseToast({
						text: i18n('EMPTY SUBPERIOD'),
						isError: false,
						type: 'W'
					});

				} else if (_self.manualParams !== false) {
					_self.tabController.getInnerController(0).validateMappingSubPeriod(callback);

				}

			};
		});

	},

	executeDigitalFile: function() {
		var _self = this;
		var afterEndpoint = function(serviceData) {
			_self.coreServices.executionFileFlag = true;
			_self.coreServices.executionFileData = JSON.parse(JSON.stringify(serviceData));

			_self.firstTimeLoaded = false;
			_self.loader.close();
			var linhas = [];
			_self.createDigitalFileTabs();
			if (typeof(serviceData.typeRules) != "undefined")
				linhas = _self.getLinesToCheck(serviceData.typeRules);
			if (serviceData.rawFile !== "")
				_self.createDigitalFile(serviceData, linhas);
			if (linhas.length > 0)
				_self.createRodape(serviceData.typeRules, linhas);
			_self.loader.close();
		};
		if (_self.coreServices.allVersionData.digitalFile) {
			afterEndpoint(_self.coreServices.allVersionData.digitalFile);
		} else {
			var generalParamsDataObject = _self.configData || _self.coreServices.getDataGenParams();
			$.dfgExecutor.setRequiredData({
				generalParamsDataObject: generalParamsDataObject,
				manualParams: _self.manualParams,
				configData: _self.configData,
				idStructure: _self.coreServices.idStructure,
				layoutJSON: _self.coreServices.allVersionData.json,
				layoutObject: _self.services.layoutObject,
				mapConfigs: _self.coreServices.mapConfigs,
				idLayoutVersion: _self.coreServices.allVersionData.idLayoutVersion,
				createDigitalFileTabs: _self.createDigitalFileTabs,
				loader: _self.loader
			});
			var assingRawFile = function(rawFile) {
				_self.coreServices.executionFileData = {
					rawFile: rawFile
				};
				_self.coreServices.executionFileFlag = true;

			};
			$.dfgExecutor.getExecutionResult(assingRawFile);
		}
	},
	createDigitalFileTabs: function() {
		var _self = this;
		$(".executor-wrapper .digitalFileAba").empty();
		$(".executor-wrapper .digitalFileAba").bindBaseTabs({
			tab: [{
				title: i18n("EXECUTION"),
				viewName: "app.views.executor.digitalFile",
				viewData: {
					text: "TAB 1"
				}
            }],
			type: "boxes",
			wrapperClass: "wrapperClass"
		});
	},
	createDigitalFile: function(serviceData, linesToCheck) {
		var _self = this;
		var linhas = serviceData.rawFile.match(/[^\r\n]+/g);
		var container = $(".editable.executarArquivo");
		$(container).empty();
		var lista = document.createElement("ul");
		lista.setAttribute("class", "ul");
		var tempLine;
		$(lista).appendTo(container);
		$.each(linhas, function(index, x) {
			var spam = document.createElement("span");
			var li = document.createElement("li");
			$(li).attr("line-id", index + 1);
			temporaryLine = linhas[index].replace(/ /g, '\u00a0');
			var templine = temporaryLine.split(/(&&)/g)[0];
			templine = templine.replace(/</g, "&lt");
			templine = templine.replace(/>/g, "&gt");
			spam.innerHTML = templine;
			$(spam).appendTo(li);
			$(li).appendTo(lista);
		});
		if (window.parameters.line_id) {
			if (window.parameters.line_id.split(".").length > 0) {
				var lines = window.parameters.line_id.split(".");
				for (var line = 0; line < lines.length; line++) {
					if (!isNaN(parseInt(lines[line], 10))) {
						$("[line-id='" + (parseInt(lines[line], 10) + 1) + "']").css("background-color", "yellow");
					}
				}

			} else {
				var line1 = window.parameters.line_id;
				$("[line-id='" + (parseInt(line1, 10) + 1) + "']").css("background-color", "yellow");
			}
		}
		if (linesToCheck.length > 0)
			_self.checkLines(linesToCheck, lista);

	},
	createRodape: function(typeRules, linhas) {
		var _self = this;
		$(document.querySelectorAll("[rule-id]")).remove();
		$(".executor-wrapper .rodape").css("display", "block");
		$.each(linhas, function(index, item) {
			var linha = document.createElement("div");
			linha.setAttribute("class", "td");
			console.log(item)
			$(linha).html(item.toString());
			var tr = document.createElement("div");
			tr.setAttribute("class", "tr");
			$(tr).attr("rule-id", item);
			$(linha).appendTo(tr);
			$(tr).appendTo(".executor-wrapper .rodape");
		});

		_self.marcaRegrasRodape(typeRules);
	},
	marcaRegrasRodape: function(typeRules) {
		var _self = this;
		for (var i in typeRules) {
			var tr = $(".rodape").find("[rule-id=" + typeRules[i].linha + "]");
			var message = document.createElement("div");
			message.setAttribute("class", "td");
			$(message).html(i.split("-")[0]);
			$(message).appendTo(tr);
		}

	},
	checkLines: function(linesToCheck, lista) {
		var _self = this;
		$.each(linesToCheck, function(index, item) {
			var li = $(".editable.executarArquivo ul [line-id=" + item + "]");
			$(li).addClass("redCircle");
		});
	},
	getLinesToCheck: function(typeRules) {
		var _self = this;
		var linesToCheck = [];
		var resp;
		$.each(typeRules, function(index, val) {
			linesToCheck = linesToCheck.concat(val.linha);
		});

		function sort_unique(arr) {
			return arr.sort(function(a, b) {
				return (a > b) ? 1 : -1;
			}).filter(function(el, i, a) {
				return (i == a.indexOf(el));
			});
		}
		var temp = sort_unique(linesToCheck);
		return temp;
	},
	saveConfig: function() {
		var _self = this;
		_self.configData.idLayout = _self.idLayout;
		_self.configData.idVersion = _self.idVersion;
		if (_self.configData.validFrom) {
			_self.configData.validFrom = _self.configData.validFrom.replace(/^(\d{2})\/(\d{2})\/(\d{4})$/, "$3-$2-$1");
		}
		if (_self.configData.validFrom) {
			_self.configData.validTo = _self.configData.validTo.replace(/^(\d{2})\/(\d{2})\/(\d{4})$/, "$3-$2-$1");
		}
		_self.configData.period = "";
		_self.configData.file = $(".executor-wrapper textarea").html();
		Data.endpoints.generateDigitalFile.post(_self.configData).success(function(serviceData) {
			$.baseToast({
				text: i18n.DFG103001,
				isSuccess: true
			});
		}).error(function(serviceData) {
			_self.getData().services.processMessages(JSON.parse(serviceData.responseText));
			_self.loader.close();
		});
		delete _self.configData.period;
		_self.configData.validFrom = _self.configData.validFrom.replace(/^(\d{4})\-(\d{2})\-(\d{2})$/, "$3/$2/$1");
		_self.configData.validTo = _self.configData.validTo.replace(/^(\d{4})\-(\d{2})\-(\d{2})$/, "$3/$2/$1");
	},
	prepareParams: function() {
		var _self = this;
		console.log("Params", _self.versionData.mapConfig);
		var currGroup;
		var params = {};
		for (var i in _self.versionData.mapConfig) {
			params[i] = {
				name: "Default Params " + i,
				group: []
			};
			currGroup = {};
			if (_self.versionData.mapConfig[i].company && _self.configData.company) {
				currGroup = {
					fieldId: _self.versionData.mapConfig[i].company,
					conditions: [{
						operator: "=",
						value: _self.configData.company
                    }]
				};
				params[i].group.push(currGroup);
			}
			if (_self.versionData.mapConfig[i].branch && _self.configData.branch) {
				currGroup = {
					fieldId: _self.versionData.mapConfig[i].branch,
					conditions: [{
						operator: "=",
						value: _self.configData.branch
                    }]
				};
				params[i].group.push(currGroup);
			}
			if (_self.versionData.mapConfig[i].state && _self.configData.area) {
				currGroup = {
					fieldId: _self.versionData.mapConfig[i].state,
					conditions: [{
						operator: "=",
						value: _self.configData.area
                    }]
				};
				params[i].group.push(currGroup);
			}
			if (_self.versionData.mapConfig[i].validDate && _self.configData.validFrom && _self.configData.validTo) {
				currGroup = {
					fieldId: _self.versionData.mapConfig[i].validDate,
					conditions: [{
						operator: ">=",
						value: _self.configData.validFrom
                    }, {
						logicOperator: "AND",
						operator: "<=",
						value: _self.configData.validTo
                    }]
				};
				params[i].group.push(currGroup);
			}
			params[i] = [params[i]];
		}
		return params;
	},
	goToTaskBoard: function() {
		window.location = "/timp/tkb/";
	},
	createDataVisualizationTab: function() {
	    $(".executor-wrapper .digitalFileAba").empty();
		$(".executor-wrapper .data-visualization-mode").empty();
		$(".executor-wrapper .data-visualization-mode").bindBaseTabs({
			tab: [{
				title: i18n("DISPLAY TABLE"),
				viewName: "app.views.executor.displayTable",
				viewData: {
					text: "TAB 1"
				}
            }, {
				title: i18n("VIEW DATA"),
				viewName: "app.views.executor.dataVisualizationMode",
				viewData: {
					text: "TAB 2"
				}
            }],
			type: "boxes",
			wrapperClass: "wrapperClass"
		});
	}
});