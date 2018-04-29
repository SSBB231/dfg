sap.ui.controller("app.controllers.xmlExecutor.rightContent", {
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
		_self.renderToolbar();
		_self.loader = $("#right-content > div > .executor-wrapper").baseLoader({
			modal: true
		});
		_self.firstTimeLoaded = true;
		_self.id = parseInt(window.parameters.id);
		Data.endpoints.dfg.xmlFile.getFileByID.post({
			id: _self.id
		}).success(function(xmlFileData) {
			_self.xmlFileData = xmlFileData[0];
			var params = {
				zipParentFileID: _self.xmlFileData.schemaZipID
			};
			Data.endpoints.mdr.SchemasProperties.listSchemasPropertiesBy.post(params).success(function(data) {
				_self.coreServices.SchemasProperties = data;
				_self.coreServices.xmlBasicDataTypes = [
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
				_self.coreServices.findxmlBasicDataType = function(typeName) {
					var length = _self.coreServices.xmlBasicDataTypes.length;
					for (var i = 0; i < length; i++) {
						if (_self.coreServices.xmlBasicDataTypes[i] === typeName) {
							return true;
						}
					}
					return false;
				};
				_self.openExecuteLateral();
				_self.getLayoutData();
				_self.fileStatus = {
					ACTIVE: "100",
					ISSUED: "200",
					OFFICIAL: "300",
					SENT: "400",
					RECTIFICATION: "500"
				};
			}).error(function(error) {

			});
		}).error(function(error) {

		});

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
		// 		var issueBtn = {
		// 			text: i18n("SAVE"),
		// 			isButton: true,
		// 			enabled: true,
		// 			iconFont: "Finance-and-Office",
		// 			icon: "floppydisc",
		// 			tooltip: i18n("CLICK PRESS TO") + i18n("SAVE DIGITAL FILE"),
		// 			onPress: function() {
		// 				if (!_self.coreServices.executionFileFlag) {
		// 					$.baseToast({
		// 						type: "W",
		// 						text: i18n("WARNING EXECUTE FIRST")
		// 					});
		// 					return;
		// 				}
		// 				var digitalFileEEFI = _self.coreServices.getDataGenParams();
		// 				var object = JSON.parse(JSON.stringify(_self.services.layoutObject.headerData));
		// 				if (_self.manualParams) {
		// 					object.manualParams = _self.manualParams;
		// 				}
		// 				object.idSettingVersion = _self.services.layoutObject.headerData.version.id;
		// 				object.name = _self.services.layoutObject.headerData.name;
		// 				object.description = _self.services.layoutObject.headerData.description;
		// 				object.idCompany = digitalFileEEFI.company;
		// 				object.uf = digitalFileEEFI.uf;
		// 				object.idBranch = digitalFileEEFI.branch;
		// 				object.idTax = digitalFileEEFI.tax;
		// 				object.year = digitalFileEEFI.subPeriod.year;
		// 				object.month = digitalFileEEFI.subPeriod.month;
		// 				object.subperiod = digitalFileEEFI.subPeriod.subperiod;
		// 				object.digitalFile = _self.coreServices.executionFileData;
		// 				object.idDigitalFileType = _self.services.layoutObject.headerData.digitalFileType.id;
		// 				object.months = JSON.stringify(digitalFileEEFI.subPeriod.months);
		// 				Data.endpoints.dfg.digitalFile.issue.post(object).success(function(data) {
		// 					$.baseToast({
		// 						type: "S",
		// 						text: i18n("SUCCESS SAVING FILE")
		// 					});
		// 				});
		// 			},
		// 			"class": "exe-tb-execute"
		// 		};

		// 		var officialize = {
		// 			text: i18n("OFFICIALIZE FILE"),
		// 			isButton: true,
		// 			enabled: true,
		// 			tooltip: i18n("CLICK PRESS TO") + i18n("OFFICIALIZE FILE"),
		// 			onPress: function() {
		// 				if (!_self.coreServices.executionFileFlag) {
		// 					$.baseToast({
		// 						type: "W",
		// 						text: "WARNING EXECUTE FIRST EXECUTE"
		// 					});
		// 					return;
		// 				}
		// 				Data.endpoints.dfg.digitalFile.officialize.post({
		// 					id: _self.services.layoutObject.headerData.id
		// 				}).success(function(response) {
		// 					if (response) {
		// 						$.baseToast({
		// 							type: "S",
		// 							text: i18n("SUCCESS OFFICIALIZE")
		// 						});
		// 						_self.toolbar.enableButton(4);
		// 						_self.toolbar.removeButton(3);
		// 					} else {
		// 						$.baseToast({
		// 							text: i18n("OFFICIALIZE FAILED"),
		// 							isError: true
		// 						});
		// 					}
		// 				});
		// 			},
		// 			"class": "exe-tb-execute officializeFile",
		// 			iconFont: "File-and-Folders",
		// 			icon: "groupdocschecked"
		// 		};

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

		var leftButtons = [{
			text: i18n("EXECUTE"),
			onPress: function() {
				_self.loader.open();
				_self.executeDigitalFile();
			},
			isButton: true,
			iconFont: "Media",
			icon: "play",
			enabled: true,
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
			enabled: true,
			tooltip: i18n("LIBRARY DETAIL TOOLTIP")
        }, {
			text: i18n("EXPORT"),
			onPress: function() {
				_self.dialogExport = $.baseDialog({
					title: i18n('EXPORT FILE'),
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

							_self.download();

							_self.dialogExport.close();
						}
                    }]
				});
				_self.dialogExport.open();
			},
			isButton: true,
			iconFont: "DataManager",
			icon: "download",
			enabled: true,
			tooltip: i18n("EXPORT TOOLTIP")
        }, {
			text: i18n("SETTINGS"),
			onPress: function() {
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
			},
			isButton: true,
			iconFont: "Display-and-Setting",
			icon: "setting",
			enabled: true,
			tooltip: i18n("SETTING TAB TOOLTIP")
        }];

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
				enabled: true,
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
		var locationString;
		locationString = "#/xmlEditor?id=" + _self.id;
		window.location = locationString;
	},
	getLayoutData: function() {
		var _self = this;
		var idLayout = _self.xmlFileData.idSetting;
		// 		var idVersion = window.parameters.idSettingVersion;
		var idFile = window.parameters.idFile;
		//_self.loader.open();
		_self.loader.open();
		var objectType = (window.parameters.executed) ? "digitalFile" : "setting";
		Data.endpoints.dfg[objectType].read.post({
			id: idLayout,
			// 			idSettingVersion: idVersion,
			structure: true
		}).success(function(versionData) {
			_self.services.layoutObject.headerData = versionData;
			_self.coreServices.eefi = versionData.eefi;
			_self.coreServices.idStructure = [];
			for (var index = 0; index < versionData.structure.length; index++) {
				_self.coreServices.idStructure.push(versionData.structure[index].id);
			}
			_self.coreServices.allVersionData = versionData;
			versionData.json = JSON.parse(versionData.layoutVersion[0].json);
			versionData.blocks = versionData.json.blocks;
			versionData.positions = versionData.json.positions;
			versionData.fields = versionData.json.fields;
			versionData.format = versionData.json.format;
			versionData.mapConfig = versionData.json.mapConfig;
			versionData.rules = versionData.json.rules;
			versionData.separator = versionData.json.separator;
			_self.idLayout = versionData.layout.id;
			var object = {
				idLayout: idLayout,
				idVersion: versionData.id
			};
			_self.idVersion = versionData.id;
			_self.versionData = versionData;
			_self.idSetting = _self.xmlFileData.idSetting;
			_self.abas();
			if (!idFile) {
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
	},
	/**
	 * [download description]
	 * Exports the current digitalFile to a simpleText document or to xml format
	 */
	download: function(option) {
		var _self = this;
		var downloadFile = function(fileName, urlData) {
			var aLink = document.createElement("a");
			var evt = document.createEvent("HTMLEvents");
			evt.initEvent("click");
			aLink.download = fileName;
			aLink.href = urlData;
			aLink.dispatchEvent(evt);
		};
		var xmlFile = _self.xmlFile.replace(/<br \/>/g,"").replace(/<br\/>/g,"").replace(/&lt;/g, "<").replace(/&gt;/g,">").replace(/<span style=\"color:#990000;font-style:italic\">ERROR<\/span>/g, "ERROR");
		downloadFile("xmlFile.xml", "data:text/xml;charset=UTF-8," + encodeURIComponent(xmlFile));

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
	goToLibrary: function() {
		window.location = "#/library/";
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
			var objectParams = {
				id: _self.idSetting
				// idSettingVersion: _self.idVersion
			};
			if (_self.configData && _self.versionData.mapConfig && (_self.configData.company || _self.configData.branch || _self.configData.area ||
				_self.configData.executionDate)) {
				objectParams.params = _self.prepareParams();
			}

			var generalParamsDataObject = _self.coreServices.getDataGenParams();

			if (generalParamsDataObject.company !== undefined && generalParamsDataObject.uf !== undefined &&
				generalParamsDataObject.branch !== undefined && generalParamsDataObject.tax !== undefined &&
				generalParamsDataObject.subPeriod.idCompany !== undefined) {

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
				if ($(_self.view).find("#chkExecuteAn3").attr("checked") == "checked")
					objectParams.rules = "true";
				// if ($(_self.view).find("#chkMovementCentralization").attr("checked") == "checked")
				//     objectParams.movementCentralization = "true";
				_self.loader.open();
				Data.endpoints.dfg.setting.execute.post(objectParams).success(function(serviceData) {
					afterEndpoint(serviceData);
				}).error(function(response) {
					_self.loader.close();
				});
			} else {
				$.baseToast({
					text: i18n("EMPTY FIELDS ERROR"),
					isError: true
				});
			}
		}
	},
	createDigitalFileTabs: function(hasErrors) {
		var _self = this;
		$(".executor-wrapper .digitalFileAba").empty();
		if (hasErrors) {
			$(".executor-wrapper .digitalFileAba").bindBaseTabs({
				tab: [{
					title: i18n("EXECUTION"),
					viewName: "app.views.executor.digitalFile",
					viewData: {
						text: "TAB 1"
					}
            }, {
					title: i18n("ERRORS"),
					viewName: "app.views.xmlExecutor.errors",
					viewData: {
						text: "TAB 2"
					}
            }],
				type: "boxes",
				wrapperClass: "wrapperClass"
			});
		} else {
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
		}
	},
	createDigitalFile: function(serviceData, linesToCheck) {
		var _self = this;
		var rawFile = serviceData.rawFile.split("&&::0&:0")[0];
		var lines = rawFile.split("\r\n");
		_self.restrictions = JSON.parse(_self.xmlFileData.executionData);
		var xmlText = _self.xmlFileData.xmlFileText;
		_self.fieldsPositions = [];
		_self.versionData.blocks["0"].records["0"].positions.map(function(element, index) {
			if (element !== "newline") {
				_self.fieldsPositions.push(element);
			}
		});
		var errors = [];
		$.each(_self.fieldsPositions, function(index, element) {
			var temporaryLine = lines[index].replace(/ /g, '\u00a0');
			var templine = temporaryLine.split(/(&&)/g)[0];
			templine === "" ? templine = " " : "";
			var restrictionFieldId = _self.findRestriction(index);
			var restriction = _self.restrictions[restrictionFieldId].restriction.replace(/&nbsp;/g, " ");
			var isRequired = false;
			var fieldReg = new RegExp(/Field[\d]+/);
			if (restriction.search("REQUIRED") !== -1) {
				isRequired = true;
				restriction = restriction.replace("REQUIRED", "");
			}
			if (restriction !== undefined) {
				try {
					var restrictionObject = {};
					if (restriction.search("RESTRICT:") !== -1) {
						restriction = restriction.replace("RESTRICT:", "").trim();
						restrictionObject = JSON.parse(restriction);
						_self.validateInput(restrictionObject, templine);
						xmlText = xmlText.replace(restrictionFieldId, templine);
					}
				} catch (e) {
					errors.push("ERROR @ " + _self.restrictions[restrictionFieldId].fieldData.label + ": " + e);
					xmlText = xmlText.replace(restrictionFieldId, '<span style="color:#990000;font-style:italic">' + "ERROR" + "</span>");
				}
			} else {
				restrictionFieldId = xmlText.substr(xmlText.search(/Field[\d]+/), fieldReg.exec(xmlText).length);
				errors.push("ERROR @ " + _self.restrictions[restrictionFieldId].fieldData.label + ": Tag or Property can't be empty");
			}
		});
		if (errors.length > 0) {
		    _self.hasErrors = true;
		    _self.toolbar.disableButton(2);
			_self.createDigitalFileTabs(true);
			var errorsContainer = $(".editable.executarArquivo.errors");
			$(errorsContainer).empty();
			var errorsList = document.createElement("ul");
			errorsList.setAttribute("class", "ul");
			$(errorsList).appendTo(errorsContainer);
			for (var i = 0; i < errors.length; i++) {
				var spam = document.createElement("span");
				var li = document.createElement("li");
				$(li).attr("line-id", i + 1);
				spam.innerHTML = errors[i];
				$(spam).appendTo(li);
				$(li).appendTo(errorsList);
			}
			// 			$.baseToast({
			// 				text: errors,
			// 				isError: true
			// 			});
		} else {
		    _self.toolbar.enableButton(2);
		}
		var container = $(".editable.executarArquivo:not(.errors)");
		$(container).empty();
		var list = document.createElement("ul");
		list.setAttribute("class", "ul");
		$(list).appendTo(container);
		var span = document.createElement("span");
		var li = document.createElement("li");
		span.innerHTML = xmlText;
		_self.xmlFile = xmlText;
		$(span).appendTo(li);
		$(li).appendTo(list);
		// 		if (linesToCheck.length > 0)
		// 			_self.checkLines(linesToCheck, list);
	},

	findRestriction: function(index) {
		var _self = this;
		var restrictionsKeys = Object.keys(_self.restrictions);
		var length = restrictionsKeys.length;
		for (var i = 0; i < length; i++) {
			if (_self.restrictions[restrictionsKeys[i]].hasOwnProperty("fieldData") && _self.restrictions[restrictionsKeys[i]].fieldData.id ===
				_self.fieldsPositions[index]) {
				return restrictionsKeys[i];
			}
		}
		return -1;
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

	validateInput: function(restriction, input, flag) {
		var controller = this;
		var base = restriction.base.substring(restriction.base.indexOf(":") + 1);
		var valuesArray = [];
		if (flag === "LIST" || flag === "UNION") {
			valuesArray = input.split(" ");
		} else {
			valuesArray.push(input);
		}
		var length = valuesArray.length;
		for (var i = 0; i < length; i++) {
			if (restriction.enumeration !== undefined) {
				var validation = false;
				for (var j = 0; j < restriction.enumeration.length; j++) {
					if (valuesArray[i] === restriction.enumeration[j]) {
						validation = true;
						break;
					}
				}
				if (!validation) {
					throw "Input Error: Value is not part of the defined values for this element.";
				}
			} else if (restriction.fractionDigits !== undefined) {
				var validation = valuesArray[i].split(".");
				if (validation.length > 1) {
					if (validation[1].length > Number.parseInt(restriction.fractionDigits)) {
						throw "Input Error: Value fraction digits exceed max value possible (" + restriction.fractionDigits + ").";
					}
				}
			} else if (restriction.length !== undefined) {
				if (flag === "LIST" || flag === "UNION") {
					if (length > Number.parseInt(restriction.length)) {
						throw "Input Error: List exceeds the maximum length of items defined (" + restriction.length + ").";
					}
				} else {
					if (valuesArray[i].length > Number.parseInt(restriction.length)) {
						throw "Input Error: Value length exceeds the maximum length of items defined (" + restriction.length + ").";
					}
				}
			} else if (restriction.maxExclusive !== undefined) {
				validation = Number.parseFloat(valuesArray[i]);
				if (validation >= Number.parseInt(restriction.maxExclusive)) {
					throw "Input Error: Value exceeds max value possible (" + restriction.maxExclusive + ").";
				}
			} else if (restriction.maxInclusive !== undefined) {
				validation = Number.parseFloat(valuesArray[i]);
				if (validation > Number.parseInt(restriction.maxInclusive)) {
					throw "Input Error: Value exceeds max value possible (" + restriction.maxInclusive + ").";
				}
			} else if (restriction.maxLength !== undefined) {
				if (flag === "LIST" || flag === "UNION") {
					if (length > Number.parseInt(restriction.maxLength)) {
						throw "Input Error: List exceeds max length possible (" + restriction.maxLength + ").";
					}
				} else {
					if (valuesArray[i].length > Number.parseInt(restriction.maxLength)) {
						throw "Input Error: Value exceeds max length possible (" + restriction.maxLength + ").";
					}
				}
			} else if (restriction.minExclusive !== undefined) {
				validation = Number.parseFloat(valuesArray[i]);
				if (validation <= Number.parseInt(restriction.minExclusive)) {
					throw "Input Error: Value is lower than the minimum value required (" + restriction.minExclusive + ").";
				}
			} else if (restriction.minInclusive !== undefined) {
				validation = Number.parseFloat(valuesArray[i]);
				if (validation >= Number.parseInt(restriction.minInclusive)) {
					throw "Input Error: Value is lower than the minimum value required " + restriction.minInclusive + ").";
				}
			} else if (restriction.minLength !== undefined) {
				if (flag === "LIST" || flag === "UNION") {
					if (length < Number.parseInt(restriction.minLength)) {
						throw "Input Error: List has less values that the minimum length required (" + restriction.minLength + ").";
					}
				} else {
					if (valuesArray[i].length < Number.parseInt(restriction.minLength)) {
						throw "Input Error: Value length is lower than the minimum length required (" + restriction.minLength + ").";
					}
				}
			} else if (restriction.pattern !== undefined) {
				validation = new RegExp(restriction.pattern);
				if (!validation.test(valuesArray[i])) {
					throw "Input Error: Value does not meet the pattern indicated in the rule.";
				}
			} else if (restriction.totalDigits !== undefined) {
				validation = valuesArray[i].split(".");
				var digitsLength = 0;
				if (validation.length > 1) {
					digitsLength = validation[0].length + validation[1].length;
				} else {
					digitsLength = validation[0].length;
				}
				if (digitsLength > Number.parseInt(restriction.totalDigits)) {
					throw "Input Error: Value exceeds total digits value (" + restriction.totalDigits + ").";
				}
			} else if (restriction.whiteSpace !== undefined) {
				var value;
				if (restriction.whiteSpace === "preserve") {
					// Do Nothing    
				} else if (restriction.whiteSpace === "replace") {
					value = value.replace("\n", " ").replace("\s", " ").replace("\t", " ").replace("\r", " ");
				} else if (restriction.whiteSpace === "collapse") {
					value = value.replace("\t", "").replace("\s", "").replace(/(^\s+|\s+$)/g, "").replace("\n", " ").replace(/\s\s+/g, " ");
				}
			}
			valuesArray[i] = controller.validateValue(base, valuesArray[i]); 
		}
		return true;
	},

	validateValue: function(base, value) {
		var controller = this;
		var type = controller.findProperty(controller.coreServices.SchemasProperties, base);
		if (type !== undefined) {
			if (type.hasOwnProperty("restriction")) {
				controller.validateInput(type.restriction, value);
			} else if (type.hasOwnProperty("union")) {
				var membersCount = 0;
				var members = [];
				var values = value.split(" ");
				if (type.union.hasOwnProperty("memberTypes")) {
					members = type.union.memberTypes.split(" ");
				}
				if (members.length !== values.length) {
					throw "Input Error: Union member values and union member types doesn't match";
				} else {
					for (var j = 0; j < members.length; j++) {
						controller.validateValue(members[j], values[j]);
					}
				}
			} else if (type.hasOwnProperty("list")) {

			}
		} else if (controller.coreServices.findxmlBasicDataType(base)) {
			if (base === "integer" || base === "int") {
				if (isNaN(value)) {
					throw "Input Error: Value is Not a Number.";
				} else {
					value = Number.parseInt(value);
				}
			} else if (base === "positiveInteger") {
				if (!isNaN(value) && Number.parseInt(value) > 0) {
					value = Number.parseInt(value);
				} else {
					throw "Input Error: Value is not a Positive Integer.";
				}
			} else if (base === "negativeInteger") {
				if (!isNaN(value) && Number.parseInt(value) < 0) {
					value = Number.parseInt(value);
				} else {
					throw "Input Error: Value is not a Negative Integer.";
				}
			} else if (base === "nonPositiveInteger") {
				if (!isNaN(value) && Number.parseInt(value) <= 0) {
					value = Number.parseInt(value);
				} else {
					throw "Input Error: Value is not a Non Positive Integer.";
				}
			} else if (base === "nonNegativeInteger") {
				if (!isNaN(value) && Number.parseInt(value) >= 0) {
					value = Number.parseInt(value);
				} else {
					throw "Input Error: Value is not a Non Negative Integer.";
				}
			} else if (base === "byte") {
				if (!isNaN(value) && (Number.parseInt(value) >= -128 && Number.parseInt(value) <= 127)) {
					value = Number.parseInt(value);
				} else {
					throw "Input Error: Value is not in Value Type (" + base + ") range.";
				}
			} else if (base === "long") {
				if (!isNaN(value) && (Number.parseInt(value) >= -(Math.pow(2, 64)) && Number.parseInt(value) <= (Math.pow(2, 64)) - 1)) {
					value = Number.parseInt(value);
				} else {
					throw "Input Error: Value is not in Value Type (" + base + ") range.";
				}
			} else if (base === "short") {
				if (!isNaN(value) && (Number.parseInt(value) >= -(Math.pow(2, 15)) && Number.parseInt(value) <= (Math.pow(2, 15)) - 1)) {
					value = Number.parseInt(value);
				} else {
					throw "Input Error: Value is not in Value Type (" + base + ") range.";
				}
			} else if (base === "unsignedLong") {
				if (!isNaN(value) && (Number.parseInt(value) >= 0 && Number.parseInt(value) <= (Math.pow(2, 64)) - 1)) {
					value = Number.parseInt(value);
				} else {
					throw "Input Error: Value is not in Value Type (" + base + ") range.";
				}
			} else if (base === "unsignedInt") {
				if (!isNaN(value) && (Number.parseInt(value) >= 0)) {
					value = Number.parseInt(value);
				} else {
					throw "Input Error: Value is not in Value Type (" + base + ") range.";
				}
			} else if (base === "unsignedShort") {
				if (!isNaN(value) && (Number.parseInt(value) >= 0 && Number.parseInt(value) <= (Math.pow(2, 15)) - 1)) {
					value = Number.parseInt(value);
				} else {
					throw "Input Error: Value is not in Value Type (" + base + ") range.";
				}
			} else if (base === "unsignedByte") {
				if (!isNaN(value) && (Number.parseInt(value) >= 0 && Number.parseInt(value) <= 127)) {
					value = Number.parseInt(value);
				} else {
					throw "Input Error: Value is not in Value Type (" + base + ") range.";
				}
			} else if (base === "dateTime" || base === "date" || base === "gYearMonth" ||
				base === "gYear" || base === "gMonthDay" || base === "gDay" || base === "gMonth") {
				if (isNaN(Date.parse(value))) {
					throw "Input Error: Value is not a Date or a Date property value.";
				}
			} else if (base === "duration") {
				var durationRegex =
					/^(-)?P(?:(-?[0-9,.]*)Y)?(?:(-?[0-9,.]*)M)?(?:(-?[0-9,.]*)W)?(?:(-?[0-9,.]*)D)?(?:T(?:(-?[0-9,.]*)H)?(?:(-?[0-9,.]*)M)?(?:(-?[0-9,.]*)S)?)?$/;
				if (!durationRegex.test(value)) {
					throw "Input Error: Value is not a duration.";
				}
			} else if (base === "string" || base === "normalizedString" || base === "token") {
				//To Do
			} else if (base === "language") {
				//To Do
			} else if (base === "boolean") {
				if (value !== "true" && value !== "1" && value !== "false" && value !== "0") {
					throw "Input Error: Value is not a boolean input (true, false, 1, 0).";
				}
			} else if (base === "hexBinary") {
				//To Do
			} else if (base === "base64Binary") {
				//To Do
			} else if (base === "anyURI") {
				//To Do
			}
		} else {
			throw "Input Error: Input is not a basic data type or a defined value.";
		}
		return value;
	},

	findProperty: function(properties, type, id) {
		for (var i = 0; i < properties.length; i++) {
			var element = properties[i];
			if (element.name === type && element.id !== id) {
				return element;
			}
		}
	},
});