/*global i18n Data _ getTDFServiceLocation enableBackTabIndex disableBackTabIndex*/
sap.ui.controller("app.controllers.executorSPED.rightContent", {
	onInit: function() {},
	onDataRefactor: function(data) {
		return $.extend(data, this.data);
	},
	onAfterRendering: function(html) {
		var _self = this;
		if (_self.privileges && !_self.privileges.Access) {
			$.baseToast({
				type: "W",
				text: i18n("NO ACCESS PRIVILEGES FOUND")
			});
			window.location = "/timp/tkb/#/content";
		}
		$(".right-content").css("overflow-y", "hidden");
		_self.taskInfo = {};
		if (window.parameters.idTask) {
			Data.endpoints.bpma.getTaskInfo.post({
				idTask: window.parameters.idTask
			}).success(function(taskInfo) {
				_self.taskInfo = taskInfo;
				_self.taskInfo.processID = !_.isUndefined(taskInfo.instances[0]) ? JSON.parse(taskInfo.instances[0].json) : {};
				_self.taskInfo.processID = _self.taskInfo.processID.processID || 0;
			});
		}
		_self.configData = {};
		_self.versionData = {};
		_self.view = html;
		_self.loader = $("#right-content > div > .executor-wrapper").baseLoader({
			modal: true
		});
		if (!window.parameters.calculationBlocks) {
			$("#overlapRight").hide();
		} else {
			_self.openExecuteLateral();
		}
		_self.firstTimeLoaded = true;
		var spedID = window.parameters.id;
		var eSocial = window.parameters.eSocial;
		var eSocialType = window.parameters.eSocialType;
		_self.view.calendarECF = _self.view.find(".calendarECF");
		_self.coreServices.quizAnswer = [];
		_self.loader.open();
		var callBack = function() {
			let endpoint = 'spedFile';
			if (!_.isNil(eSocial)) {
				endpoint = 'eSocial';
			}
			Data.endpoints.dfg.sped.list[endpoint].post({
				ids: spedID,
				type: !_.isNil(eSocial) ? eSocial : [1, 2, 3, 4],
				layoutData: true,
				subType: eSocialType,
				structure: window.parameters.calculationBlocks !== undefined,
				variantData: true
			}).success(function(data) {
				_self.herarchy = data.herarchy;
				_self.header = data.header;
				_self.subheader = data.type;
				_self.queries = data.queries;
				_self.fileData = data.list[0] || data.list;
				_self.fileData.type = _self.fileData.type || Number(eSocial);
				_self.fileData.subType = _self.fileData.subType || eSocialType;
				_self.coreServices.validData = {
					validFrom: _self.fileData.validFrom,
					validTo: _self.fileData.validTo
				};
				_self.variants = data.variants || [];
				if (!_self.fileData) {
					_self.goToLibrary();
				}
				_self.renderToolbar();
				_self.clendarECF();
				if (!window.parameters.calculationBlocks) {
					_self.renderTabs(_self.fileData.type || 0, eSocialType || '');
				} else {
					_self.loader.close();
					_self.eefiInfo = {};
					_self.fileData.EEFI.map(function(eefi) {
						if (!_self.eefiInfo[eefi.idCompany]) {
							_self.eefiInfo[eefi.idCompany] = {
								uf: {},
								name: eefi.idCompany,
								key: eefi.idCompany
							};
						}
						if (!_self.eefiInfo[eefi.idCompany].uf[eefi.uf]) {
							_self.eefiInfo[eefi.idCompany].uf[eefi.uf] = {
								idBranch: {},
								name: eefi.uf,
								key: eefi.uf
							};
						}
						if (!_self.eefiInfo[eefi.idCompany].uf[eefi.uf].idBranch[eefi.idBranch]) {
							_self.eefiInfo[eefi.idCompany].uf[eefi.uf].idBranch[eefi.idBranch] = {
								name: eefi.idBranch,
								key: eefi.idBranch,
								idTax: {}
							};
						}
						if (!_self.eefiInfo[eefi.idCompany].uf[eefi.uf].idBranch[eefi.idBranch].idTax[eefi.idTax]) {
							_self.eefiInfo[eefi.idCompany].uf[eefi.uf].idBranch[eefi.idBranch].idTax[eefi.idTax] = {
								key: eefi.idTax,
								name: eefi.taxName,
								isTaxGroup: eefi.isTaxGroup
							};
						}
					});
					_self.services.layoutObject.headerData = _self.fileData;
					_self.coreServices.idStructure = [];
					_self.fileData.structure = _self.fileData.structure.map(function(s) {
						_self.coreServices.idStructure.push(s.id);
						var structure = JSON.parse(s.structure);
						return {
							id: s.id,
							fields: structure.fields,
							hanaPackage: structure.hanaPackage,
							hanaName: structure.hanaName,
							inputParameters: structure.inputParameters,
							description: s.title
						};
					});
					_self.versionData = JSON.parse(_self.fileData.layout[0].json);
					_self.abas();
					if (window.parameters.subperiod) {
						setTimeout(function() {
							$("#settings-execute button").click();
						}, 500);
					}
				}
			}).error(function() {
				if (!_.isNil(eSocial) && _self.privileges.sped.eSocialRead === false) {
					$.baseToast({
						type: "e",
						text: i18n("NO READ PRIVILEGE FOR") + ' ' + 'e-Social'
					});
				}
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
	openExecuteLateral: function() {
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
		});
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
		$('.inputs').find('label').baseTooltip({
			class: 'dark',
			position: 'top',
			text: i18n('CENTRALIZATION TOOLTIP')
		});
		$("#settings-close").on('keydown', function() {
			var keyPressed = Number(event.keyCode || event.which);
			if (keyPressed === 13) {
				_self.closeButtonClick();
				disableBackTabIndex($("#overlapRight"));
				$("#overlapRight").hide();
			}
		});
		$("#executarArquivo .footer #settings-reset").click(function() {
			_self.tabController.getInnerController(0).clearFields();
			_self.tabController.getInnerController(1).clearFields();
		});
		$("#executarArquivo .footer #settings-execute button").unbind("click").bind("click", function() {
			_self.configData = _self.tabController.getInnerController(0).getOwnData();
			_self.manualParams = _self.tabController.getInnerController(1).getOwnData();
			var callback = function(response) {
				_self.coreServices.mapConfigs = response;
				if (response.length === 0) {
					$.baseToast({
						text: i18n('NO MAP CONFIG FOUND'),
						isError: false,
						type: 'W'
					});
				} else if (response.length !== _self.coreServices.idStructure.length) {
					var responseStructure = response.map(function(r) {
						return r.structureId;
					});
					for (var i = 0; i < _self.coreServices.idStructure.length; i++) {
						if (responseStructure.indexOf(_self.coreServices.idStructure[i]) === -1) {
							var structureName;
							for (var j = 0; j < _self.fileData.structure.length; j++) {
								if (_self.fileData.structure[j].id === _self.coreServices.idStructure[i]) {
									structureName = _self.fileData.structure[j].description;
									break;
								}
							}
							$.baseToast({
								text: i18n("NO MAP CONFIG FOUND FOR") + " " + structureName,
								type: 'W'
							});
						}
					}
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
						Data.endpoints.centralizationMovement.getCentralizedBranches.post(_self.configData).success(function(data) {
							if (_self.configData.centralizationMovement) {
								if (data.isCentralized && data.centralizedBranches.length === 0) {
									$.baseToast({
										text: i18n("CENTRALIZED BRANCH CASE 2") + " " + data.centralizadora
									});
									return;
								} else if (data.centralizedBranches.length) {
									$.baseToast({
										text: i18n("CENTRALIZED BRANCH CASE 1")
									});
									_self.configData.branch = data.centralizedBranches;
								}
								_self.configData.idMap = mappingId;
								$(_self.loader._mask).css('background-color', '');
								$(_self.loader._mask).find(".base-loader").css("visibility", "visible");
								// var validFromChek = $('#inputValidFrom input').val();
								// var validToChek = $('#inputValidTo input').val();
								_self.testePadrao = false;
								_self.executeCalculationBlock();
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

											// var validFromChek = $('#inputValidFrom input').val();
											// var validToChek = $('#inputValidTo input').val();
											_self.testePadrao = false;
											_self.executeCalculationBlock();
											_self.closeExecuteLateral();
											disableBackTabIndex($('#overlapRight'));
											$('#overlapRight').hide();
											enableBackTabIndex($('.library-toolbar-items-right'));
										},
										clickCancel: function() {}
									});
								} else {
									_self.configData.idMap = mappingId;
									$(_self.loader._mask).css('background-color', '');
									$(_self.loader._mask).find(".base-loader").css("visibility", "visible");
									// var validFromChek = $('#inputValidFrom input').val();
									// var validToChek = $('#inputValidTo input').val();
									_self.testePadrao = false;
									_self.executeCalculationBlock();
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
				tooltip: i18n("GENERAL PARAMETER TOOLTIP"),
				viewData: {
					eefiInfo: _self.eefiInfo
				}
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
	renderToolbar: function() {
		var _self = this;
		var executePrivilege = false;
		var exportPrivilege = false;
		if (_self.fileData.type === "EFD ICMS / IPI") {
			executePrivilege = _self.privileges.sped.executeEFDICMSIPI;
		}
		if (_self.fileData.type === "EFD Contributions") {
			executePrivilege = _self.privileges.sped.executeEFDContributions;
		}
		if (_self.fileData.type === "ECD") {
			executePrivilege = _self.privileges.sped.executeECD;
		}
		if (_self.fileData.type === "ECF") {
			executePrivilege = _self.privileges.sped.executeECF;
		}
		if (_self.fileData.type === "ECF") {
			executePrivilege = _self.privileges.sped.sendESocial;
		}
		if (_self.fileData.type === "EFD ICMS / IPI") {
			exportPrivilege = _self.privileges.sped.exportEFDICMSIPI;
		}
		if (_self.fileData.type === "EFD Contributions") {
			exportPrivilege = _self.privileges.sped.exportEFDContributions;
		}
		if (_self.fileData.type >= 6) {
			exportPrivilege = _self.privileges.sped.exportESocial;
		}
		var leftButtons = [];
		if (!window.parameters.calculationBlocks) {
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
            }, {
				text: i18n("CREATE VARIANT"),
				onPress: function() {
					_self.createVariant();
				},
				isButton: true,
				iconFont: 'Sign-and-Symbols',
				icon: 'plussign',
				enabled: true,
				tooltip: i18n("CREATE VARIANT TOOLTIP")
            }, {
				text: i18n("VISUALIZE FILES"),
				onPress: function() {
					_self.visualizeFiles();
				},
				isButton: true,
				iconFont: 'Display-and-Setting',
				icon: 'preview',
				enabled: exportPrivilege,
				tooltip: i18n("EXPORT TOOLTIP")
            }];
			if (_self.fileData.type >= 6) {
				leftButtons = [{
						text: i18n('SEND'),
						onPress: function() {
							_self.sendESocial();
						},
						isButton: true,
						iconFont: "Media",
						icon: "play",
						enabled: _self.privileges.sped.eSocialSend,
						tooltip: i18n("SEND TOOLTIP")
                },
					/*{
                    text: i18n("SAVE"),
                    onPress: function() {
                        _self.saveESocial();
                    },
                    isButton: true,
                    iconFont: 'Finance-and-Office',
                    icon: 'floppydisc',
                    enabled: true,
                    tooltip: i18n("SAVE TOOLTIP")
                }, */
					{
						text: i18n("EXPORT"),
						onPress: function() {
							_self.exportESocial();
						},
						isButton: true,
						iconFont: 'DataManager',
						icon: 'download',
						enabled: _self.privileges.sped.eSocialExport,
						tooltip: i18n("EXPORT TOOLTIP")
                }];
			}
		} else {
			leftButtons = [{
				text: i18n("EXECUTE"),
				onPress: function() {
					_self.executeCalculationBlock();
				},
				isButton: true,
				iconFont: "Media",
				icon: "play",
				enabled: executePrivilege,
				tooltip: i18n("EXECUTE TOOLTIP")
            }, {
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
				text: i18n("VISUALIZE") + " " + "AN3",
				isButton: true,
				enabled: true,
				tooltip: i18n("CLICK PRESS TO") + i18n("VISUALIZE") + "AN3",
				onPress: function() {
					_self.createAN3();
				},
				iconFont: "File-and-Folders",
				icon: "reportdoc"
            }, {
				text: i18n("UPDATE STRUCTURES"),
				onPress: function() {
					_self.updateTMFTables();
				},
				isButton: true,
				iconFont: 'Finance-and-Office',
				icon: 'floppydisc',
				enabled: true,
				tooltip: i18n("CLICK PRESS TO") + i18n("UPDATE STRUCTURES")
            }, {
				text: i18n("SETTINGS"),
				onPress: function() {
					_self.openExecuteLateral();
				},
				isButton: true,
				iconFont: "Display-and-Setting",
				icon: "setting",
				enabled: true,
				tooltip: i18n("SETTING TAB TOOLTIP")
            }];
		}
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
		if (window.parameters.visualizeFile) {
			_self.visualizeFiles();
		}
	},
	renderTabs: function(type, subType) {
		var _self = this;
		var onChangeTab = function() {};
		var idCompany = [],
			uf = [],
			idBranch = [],
			idTax = [];
		var tabs = [];
		$(".executor-wrapper .digitalFileAba").empty();
		if (type === 'EFD ICMS / IPI') {
			tabs.push({
				title: i18n("EXECUTION"),
				viewName: "app.views.executorSPED.EFDICMSIPI.executeForm",
				viewData: {
					fileData: _self.fileData,
					variants: _self.variants
				}
			});
		} else if (type === "EFD Contributions") {
			tabs.push({
				title: i18n("EXECUTION"),
				viewName: "app.views.executorSPED.EFD-Contributions.executeForm",
				viewData: {
					fileData: _self.fileData,
					variants: _self.variants
				}
			});
		} else if (type === "ECD") {
			tabs.push({
				title: i18n("GENERAL DATA"),
				viewName: "app.views.executorSPED.ECD.generalData",
				viewData: {
					fileData: _self.fileData,
					variants: _self.variants
				}
			}, {
				title: i18n("CREATION FILE CONTROL"),
				viewName: "app.views.executorSPED.ECD.creationFileControl",
				viewData: {
					fileData: _self.fileData,
					variants: _self.variants
				}
			}, {
				title: i18n("INPUT DATA"),
				viewName: "app.views.executorSPED.ECD.InputData",
				viewData: {
					fileData: _self.fileData,
					variants: _self.variants
				}
			});
		} else if (type === "ECF") {
			var val = true;
			tabs.push({
				title: i18n("EXECUTE"),
				viewName: "app.views.executorSPED.ECF.execute",
				viewData: {
					fileData: _self.fileData,
					variants: _self.variants
				}
			}, {
				title: i18n("QUIZ"),
				viewName: "app.views.executorSPED.ECF.quiz",
				viewData: {
					fileData: _self.fileData,
					variants: _self.variants
				}
			}, {
				title: i18n("REPORT'S"),
				viewName: "app.views.executorSPED.ECF.reports",
				viewData: {
					fileData: _self.fileData,
					variants: _self.variants
				}
			}, {
				title: i18n("CHECKLIST"),
				viewName: "app.views.executorSPED.ECF.checklist",
				viewData: {
					fileData: _self.fileData,
					variants: _self.variants
				}
			});
			onChangeTab = function(element, index) {
				if (index === 2 && val === true) {
					_self.tabs.getInnerControllers()[index].bindContentTable();
					this.tabs.getInnerControllers()[index].view.table.ctrl.executeAdjustColumns();
					//  this.tabs.getInnerControllers()[index].view.table2.ctrl.executeAdjustColumns();
					val = false;
				}
			};
		} else if (type >= 6) {
			let tableName = type === 6 ? 'S1070' : '';
			tableName += ' ' + (subType.substring(5).toUpperCase());
			tabs.push({
				title: i18n(tableName),
				viewName: "app.views.executorSPED.eSocial.executeForm",
				viewData: {
					type: type,
					subType: subType,
					herarchy: _self.herarchy,
					queries: _self.queries,
					header: _self.header,
					subheader: _self.subheader
				}
			});
		}
		if (type === "ECD") {
			idCompany = [];
			uf = [];
			idBranch = [];
			idTax = [];
			_self.fileData.EEFI.map(function(eefi) {
				if (idCompany.indexOf(eefi.idCompany) === -1) {
					idCompany.push(eefi.idCompany);
				}
				if (uf.indexOf(eefi.uf) === -1) {
					uf.push(eefi.uf);
				}
				if (idBranch.indexOf(eefi.idBranch) === -1) {
					idBranch.push(eefi.idBranch);
				}
				if (idTax.indexOf(eefi.idTax) === -1) {
					idTax.push(eefi.idTax);
				}
			});
			_self.loader.open();
			Data.endpoints.dfg.sped.createDialogECDVariant.post({
				idCompany: idCompany,
				idBranch: idBranch,
				idTax: idTax,
				uf: _self.uf
			}).success(function(data) {
				_self.coreServices.requiredInformation = data;
				_self.tabs = $(".executor-wrapper .digitalFileAba").bindBaseTabs({
					tab: tabs,
					type: "boxes",
					wrapperClass: "wrapperClass",
					onChange: onChangeTab.bind(_self)
				});
				_self.tabs.getInnerControllers()[0].siblingCtrl = _self.tabs.getInnerControllers()[1];
				_self.tabs.getInnerControllers()[0].renderSubperiod();
				_self.tabs.getInnerControllers()[1].siblingCtrl = _self.tabs.getInnerControllers()[0];
				_self.loader.close();
			});
		} else if (type === "ECF") {
			idCompany = [];
			uf = [];
			idBranch = [];
			idTax = [];
			_self.fileData.EEFI.map(function(eefi) {
				if (idCompany.indexOf(eefi.idCompany) === -1) {
					idCompany.push(eefi.idCompany);
				}
				if (uf.indexOf(eefi.uf) === -1) {
					uf.push(eefi.uf);
				}
				if (idBranch.indexOf(eefi.idBranch) === -1) {
					idBranch.push(eefi.idBranch);
				}
				if (idTax.indexOf(eefi.idTax) === -1) {
					idTax.push(eefi.idTax);
				}
			});
			_self.loader.open();
			Data.endpoints.dfg.sped.getReportFilesSPED.post({
				idSped: 14,
				page: 1
			}).success(function(data) {
				_self.coreServices.reportFilesECF = data;
			});
			Data.endpoints.dfg.sped.createDialogEFCVariant.post({
				idCompany: idCompany,
				idBranch: idBranch,
				idTax: idTax,
				uf: _self.uf
			}).success(function(data) {
				_self.coreServices.requiredInformation = data;
				_self.tabs = $(".executor-wrapper .digitalFileAba").bindBaseTabs({
					tab: tabs,
					type: "boxes",
					wrapperClass: "wrapperClass",
					onChange: onChangeTab.bind(_self)
				});
				_self.tabs.getInnerControllers()[0].siblingCtrl = _self.tabs.getInnerControllers()[1];
				_self.tabs.getInnerControllers()[1].siblingCtrl = _self.tabs.getInnerControllers()[0];
				//_self.tabs.getInnerControllers()[0].renderSubperiod();
				_self.loader.close();
			});
		} else {
			_self.tabs = $(".executor-wrapper .digitalFileAba").bindBaseTabs({
				tab: tabs,
				type: "boxes",
				wrapperClass: "wrapperClass",
				onChange: onChangeTab.bind(_self)
			});
			_self.loader.close();
		}
	},
	execute: function() {
		var _self = this;
		var executionData;
		var executeType = "";
		var reportType = "";
		var serviceName = "";
		if (_self.fileData.type !== "ECD") {
			if (_self.tabs.getInnerControllers(0)[0].validateForm()) {
				executionData = _self.tabs.getInnerControllers(0)[0].getFormData();
			} else {
				return;
			}
		} else {
			if (_self.validateFormECD()) {
				executionData = _self.getFormData();
			}
		}
		switch (_self.fileData.type) {
			case "EFD ICMS / IPI":
				executeType = "executeEFDICMSIPI";
				serviceName = "TMFEFDReportRun";
				reportType = "EFDReportRunReturn";
				_.forEach(executionData, function(execution) {
					delete execution['tmf:EFDReportRun'].ISUBPERIOD;
					delete execution['tmf:EFDReportRun'].SUBPERIODEXEC;
				});
				break;
			case "EFD Contributions":
				executeType = "executeEFDContributions";
				reportType = "PCOReportRunReturn";
				serviceName = "TMFPCOReportRun";
				delete executionData['tmf:PCOReportRun'].SUBPERIOD;
				break;
			case "ECD":
				executeType = "executeECD";
				reportType = "ECDReportRunReturn";
				serviceName = "TMFECDReportRun";
				//delete executionData['tmf:ECDReportRun'].SUBPERIOD;
				break;
			case "ECF":
				executeType = "executeECF";
				serviceName = "TMFECFreportExecutionSyncIn";
				reportType = "ECFReportRunReturn";
				break;
			default:
				break;
		}
		//_self.loader.open();
		var callBack = function(adapter, location) {
			Data.endpoints.dfg.sped.execute.post({
				data: executionData,
				fileData: _self.fileData,
				adapterId: adapter,
				location: location
			}).success(function(response) {
				var runIds = [];
				if (!response.Envelope) {
					for (var r in response) {
						if (_.isObjectLike(response[r]) && response[r].Envelope.Body[reportType] && response[r].Envelope.Body[reportType].ReturnTable.ID ===
							"/TMF/SPED") {
							$.baseToast({
								isSuccess: true,
								text: i18n("EXECUTION SUCCESS") + " (" + r + ")"
							});
							runIds.push(response[r].Envelope.Body[reportType].ReturnTable.RUN_ID);
						} else {
							$.baseToast({
								isError: true,
								text: i18n("EXECUTION ERROR") + " (" + r + ")"
							});
							_self.loader.close();
						}
					}
				} else {
					if (response.Envelope && response.Envelope.Body && response.Envelope.Body[reportType] && response.Envelope.Body[reportType].ReturnTable
						.ID === "/TMF/SPED") {
						$.baseToast({
							isSuccess: true,
							text: i18n("EXECUTION SUCCESS")
						});
						runIds.push(response.Envelope.Body[reportType].ReturnTable.RUN_ID);
					} else {
						$.baseToast({
							isError: true,
							text: i18n("EXECUTION ERROR")
						});
						_self.loader.close();
					}
				}
				if (runIds.length) {
					Data.endpoints.dfg.sped.saveRunId.post({
						RUN_ID: runIds,
						idSped: _self.fileData.id,
						idTask: window.parameters.idTask,
						idProcess: _self.taskInfo.processID
					}).success(function(responseEndpo) {
						if (responseEndpo === null) {
							$.baseToast({
								type: 'E',
								text: i18n("SAVE REPORT RUN ERROR")
							});
						}
						_self.loader.close();
					}).error(function() {
						$.baseToast({
							type: 'E',
							text: i18n("SAVE REPORT RUN ERROR")
						});
						_self.loader.close();
					});
				}
			}).error(function() {
				$.baseToast({
					type: 'E',
					text: i18n("EXECUTION ERROR")
				});
				_self.loader.close();
			});
		};
		//      var dialog = $.baseWebServiceDialog({
		//          title: i18n('SERVICE'),
		//          viewData: {
		//              serviceName: serviceName,
		//              callBack: function(formData, location) {
		//                  callBack(formData.adapter, location);
		//              }
		//          }
		//      });
		getTDFServiceLocation(
			serviceName,
			function(adapterId, location) {
				_self.loader.close();
				callBack(adapterId, location);
			},
			function() {
				_self.loader.close();
			}
		);

	},
	visualizeFiles: function() {
		var _self = this;
		Data.endpoints.dfg.sped.getReportFilesSPED.post({
			idSped: window.parameters.id,
			page: 1
		}).success(function(data) {
			if (data.files.length) {
				var dialog = $.baseDialog({
					title: i18n("VISUALIZE"),
					modal: true,
					size: "wide",
					disableOuterClick: true,
					cssClass: "newFile",
					viewName: "app.views.library.sped.exportFiles",
					viewData: {
						files: data.files,
						pageCount: data.pageCount,
						filterOptions: data.filterOptions,
						id: window.parameters.id,
						isVisualization: true
					},
					buttons: [{
						name: i18n("CLOSE"),
						isCloseButton: true,
						tooltip: i18n("CLICK PRESS CLOSE"),
						click: function() {
							dialog.close();
						}
                    }]
				});
				dialog.open();
			} else {
				$.baseToast({
					type: "w",
					text: i18n("NO FILES TO DOWNLOAD")
				});
			}
		});
	},
	goToLibrary: function() {
		window.location = "#/library?restoreSettings=1";
	},
	goToTaskBoard: function() {
		window.location = "/timp/tkb/";
	},
	createVariant: function() {
		var _self = this;
		var createVariantDialog = $.baseDialog({
			title: i18n("CREATE VARIANT"),
			modal: true,
			size: "medium",
			outerClick: "disabled",
			viewName: "app.views.executorSPED.variant",
			buttons: [{
				name: i18n("CANCEL"),
				isCloseButton: true
            }, {
				name: i18n("CREATE"),
				click: function() {
					var object;
					var innerController = createVariantDialog.getInnerController();
					if (innerController.validateVariant()) {
						var data = innerController.getVariantData();
						var formData = _self.tabs.getInnerControllers(0)[0].getFormData();
						_self.loader.open();
						var createVariantType;
						switch (_self.fileData.type) {
							case "EFD ICMS / IPI":
								createVariantType = "createVariantEFDICMSIPI";
								object = {};
								_.forEach(formData, function(dataForm, f) {
									// for (var f in formData) {
									object[f] = dataForm['tmf:EFDReportRun'];
									object[f].DESCRIPTION = data.DESCRIPTION;
									object[f].name = data.name + " (" + f + ")";
									object[f].REGISTER_LOW = object[f].REGISTER_RANGE.LOW;
									object[f].REGISTER_HIGH = object[f].REGISTER_RANGE.HIGH;
									object[f].type = _self.getFileType();
								});
								break;
							case "EFD Contributions":
								createVariantType = "createVariantEFDContributions";
								object = formData['tmf:PCOReportRun'];
								object.description = data.DESCRIPTION;
								object.REGISTER_LOW = object.REGISTER_RANGE.LOW;
								object.REGISTER_HIGH = object.REGISTER_RANGE.HIGH;
								object.name = data.name;
								object.type = _self.getFileType();
								break;
							default:
								break;
						}
						Data.endpoints.dfg.sped.createVariant.post({
							variants: object
						}).success(function() {
							$.baseToast({
								isSuccess: true,
								text: i18n("VARIANT CREATED")
							});
							_self.loader.close();
						}).error(function() {
							_self.loader.close();
						});
						createVariantDialog.close();
					} else {
						$.baseToast({
							type: 'w',
							text: i18n("FILL ALL FIELDS")
						});
					}
				}
            }]
		});
		createVariantDialog.open();
	},
	getFileType: function() {
		var _self = this;
		var type;
		switch (_self.fileData.type) {
			case "EFD ICMS / IPI":
				{
					type = 1;
					break;
				}
			case "EFD Contributions":
				{
					type = 2;
					break;
				}
			case "ECD":
				{
					type = 3;
					break;
				}
			case "ECF":
				{
					type = 4;
					break;
				}
		}
		return type;
	},
	executeCalculationBlock: function() {
		var _self = this;
		var flag = true;
		if (!_self.configData.company || _self.configData.branch.length === 0 || _self.configData.uf.length === 0) {
			flag = false;
		}
		if (!_self.configData.initSubPeriod || !_self.configData.endSubPeriod) {
			flag = false;
		}
		var afterEndpoint = function(serviceData) {
			_self.coreServices.executionFileData = JSON.parse(JSON.stringify(serviceData));
			_self.loader.close();
			var linhas = [];
			_self.createDigitalFileTabs();
			if (typeof(serviceData.typeRules) !== "undefined") {
				linhas = _self.getLinesToCheck(serviceData.typeRules);
			}
			if (serviceData.rawFile !== "") {
				_self.createDigitalFile(serviceData, linhas);
			}
			if (linhas.length > 0) {
				_self.createRodape(serviceData.typeRules, linhas);
			}
			_self.loader.close();
		};
		var generalParamsDataObject = _self.configData || _self.coreServices.getDataGenParams();
		$.dfgExecutor.setRequiredData({
			generalParamsDataObject: generalParamsDataObject,
			manualParams: _self.manualParams,
			configData: _self.configData,
			idStructure: _self.coreServices.idStructure,
			layoutJSON: _self.versionData,
			layoutObject: _self.services.layoutObject,
			mapConfigs: _self.coreServices.mapConfigs,
			idLayoutVersion: _self.fileData.idLayoutVersion,
			createDigitalFileTabs: _self.createDigitalFileTabs,
			loader: _self.loader
		});
		var assingRawFile = function(rawFile) {
			_self.rawFile = rawFile;
			if (window.parameters.subperiod) {
				_self.updateTMFTables();
			}
		};
		$.dfgExecutor.getExecutionResult(assingRawFile);
	},
	createDigitalFileTabs: function() {
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
		var templine;
		$(lista).appendTo(container);
		$.each(linhas, function(index) {
			var spam = document.createElement("span");
			var li = document.createElement("li");
			$(li).attr("line-id", index + 1);
			let temporaryLine = linhas[index].replace(/ /g, '\u00a0');
			templine = temporaryLine.split(/(&&)/g)[0];
			templine = templine.replace(/</g, "&lt");
			templine = templine.replace(/>/g, "&gt");
			spam.innerHTML = templine;
			$(spam).appendTo(li);
			$(li).appendTo(lista);
		});
		if (linesToCheck.length > 0) {
			_self.checkLines(linesToCheck, lista);
		}
	},
	sendESocial: function() {
	    var _self = this;
	    var spedID = window.parameters.id;
		var eSocial = window.parameters.eSocial;
		var eSocialType = window.parameters.eSocialType;


		Data.endpoints.dfg.sped.eSocialSend.post({
			ids: spedID,
			type: !_.isNil(eSocial) ? eSocial : [1, 2, 3, 4],
			layoutData: true,
			subType: eSocialType,
			data: _self.fileData,
			structure: window.parameters.calculationBlocks !== undefined,
			variantData: true
		}).success(function(response) {
		    console.log(response);

		});
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
		_.forEach(typeRules, function(type, i) {
			var tr = $(".rodape").find("[rule-id=" + type.linha + "]");
			var message = document.createElement("div");
			message.setAttribute("class", "td");
			$(message).html(i.split("-")[0]);
			$(message).appendTo(tr);
		});
	},
	checkLines: function(linesToCheck) {
		$.each(linesToCheck, function(index, item) {
			var li = $(".editable.executarArquivo ul [line-id=" + item + "]");
			$(li).addClass("redCircle");
		});
	},
	exportESocial: function() {
		let _self = this;
		let eSocialType = window.parameters.eSocialType;
		Data.endpoints.dfg.sped.exportXML.post({
			data: _self.fileData,
			subType: eSocialType
		}).success(function(response) {
			_self.download(_self.fileData, response.data);
		});
	},
	download: function(object, text) {
		let _self = this;
		let eSocialType = window.parameters.eSocialType;
		let element = document.createElement('a');
		eSocialType[0] = eSocialType.toUpperCase();
		let filename = "eSocialEvent-" + eSocialType + "-" + object.id + ".xml";
		element.setAttribute('href', 'data:text/xml;charset=utf-8,' + encodeURIComponent(_self.formatXml(text)));
		element.setAttribute('download', filename);
		element.style.display = 'none';
		document.body.appendChild(element);
		element.click();
		document.body.removeChild(element);
	},
	formatXml: function(xml) {
		var formatted = '';
		var reg = /(>)(<)(\/*)/g;
		xml = xml.replace(reg, '$1\r\n$2$3');
		var pad = 0;
		jQuery.each(xml.split('\r\n'), function(index, node) {
			var indent = 0;
			if (node.match(/.+<\/\w[^>]*>$/)) {
				indent = 0;
			} else if (node.match(/^<\/\w/)) {
				if (pad !== 0) {
					pad -= 1;
				}
			} else if (node.match(/^<\w([^>]*[^\/])?>.*$/)) {
				indent = 1;
			} else {
				indent = 0;
			}

			var padding = '';
			for (var i = 0; i < pad; i++) {
				padding += '  ';
			}

			formatted += padding + node + '\r\n';
			pad += indent;
		});

		return formatted;
	},

	getLinesToCheck: function(typeRules) {
		var linesToCheck = [];
		$.each(typeRules, function(index, val) {
			linesToCheck = linesToCheck.concat(val.linha);
		});

		function sortUnique(arr) {
			return arr.sort(function(a, b) {
				return (a > b) ? 1 : -1;
			}).filter(function(el, i, a) {
				return (i === a.indexOf(el));
			});
		}
		var temp = sortUnique(linesToCheck);
		return temp;
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
	},
	updateTMFTables: function() {
		var _self = this;
		_self.configData.rawFile = _self.rawFile;
		_self.configData.ids = window.parameters.id;
		_self.configData.idSped = window.parameters.id;
		_self.configData.type = _self.getFileType();
		_self.configData.layoutData = true;
		Data.endpoints.dfg.sped.updateSPEDTables.post(_self.configData).success(function(data) {
			if (Object.keys(data.errors).length !== 0) {
				_.forEach(data.errors, function(error, i) {
					$.baseToast({
						type: "W",
						text: i18n(error) + " " + i
					});
				});
			} else {
				$.baseToast({
					isSuccess: true,
					text: i18n("UPDATED STRUCTURES")
				});
			}
		}).error(function() {

		});
	},
	saveSPED: function() {
		var _self = this;
		if (!_self.rawFile) {
			$.baseToast({
				type: "W",
				text: i18n("WARNING EXECUTE FIRST")
			});
			return;
		}
		var digitalFileEEFI = _self.coreServices.getDataGenParams();
		var object = JSON.parse(JSON.stringify(_self.fileData));
		if (_self.manualParams) {
			object.manualParams = _self.manualParams;
		}
		object.idSettingVersion = _self.fileData.id;
		object.name = _self.fileData.name + " " + digitalFileEEFI.company + " " + digitalFileEEFI.branch + " ";
		object.description = _self.fileData.description;
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
		object.digitalFile = {
			rawFile: _self.rawFile
		};
		object.idDigitalFileType = _self.fileData.layoutName.idDigitalFileType;
		object.months = JSON.stringify(digitalFileEEFI.subPeriod.months);
		object.json = JSON.stringify(_self.versionData);
		object.isSPED = 1;
		Data.endpoints.dfg.digitalFile.issue.post(object).success(function(data) {
			$.baseToast({
				type: "S",
				text: i18n("SUCCESS SAVING FILE")
			});
		});
	},
	createAN3: function() {
		var _self = this;
		if (!_self.rawFile) {
			$.baseToast({
				type: "W",
				text: i18n("WARNING EXECUTE FIRST")
			});
			return;
		}
		var digitalFileEEFI = _self.coreServices.getDataGenParams();
		var object = JSON.parse(JSON.stringify(_self.fileData));
		if (_self.manualParams) {
			object.manualParams = _self.manualParams;
		}
		object.idSettingVersion = _self.fileData.id;
		object.name = _self.fileData.name + " " + digitalFileEEFI.company + " " + digitalFileEEFI.branch + " ";
		object.description = _self.fileData.description;
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
		object.digitalFile = {
			rawFile: _self.rawFile
		};
		object.idDigitalFileType = _self.fileData.layoutName.idDigitalFileType;
		object.months = JSON.stringify(digitalFileEEFI.subPeriod.months);
		object.json = JSON.stringify(_self.versionData);
		object.isSPED = 1;
		_self.loader.open();
		Data.endpoints.bre.rule.DFGAN3Rules.post({
			idLayout: _self.fileData.idLayoutVersion
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
						idLayoutVersion: _self.fileData.idLayoutVersion,
						digitalFile: object
					},
					buttons: [{
						name: i18n("CANCEL"),
						isCloseButton: true,
						tooltip: i18n('CLICK PRESS CANCEL')
                    }, {
						name: i18n("CREATE"),
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
	//-------------------------------------------------------------//
	validateFormECD: function() {
		var _self = this;
		var periodValue = _self.tabs.getInnerControllers()[0].view.period.ctrl.getValue();
		if (periodValue.subperiod === "" || !periodValue.subperiod) {
			$.baseToast({
				type: 'w',
				text: i18n("MUST FILL SUBPERIOD")
			});
			return false;
		}
		if (!_self.tabs.getInnerControllers()[0].view.ledger.ctrl.getKey()) {
			$.baseToast({
				type: 'w',
				text: i18n("MUST FILL LEDGER")
			});
			return false;
		}
		if (!_self.tabs.getInnerControllers()[1].view.bookkeepingType.ctrl.getKey()) {
			$.baseToast({
				type: 'w',
				text: i18n("MUST FILL BOOKKEEPING TYPE")
			});
			return false;
		}
		if (!_self.tabs.getInnerControllers()[1].view.financialVersion.ctrl.getText()) {
			$.baseToast({
				type: 'w',
				text: i18n("MUST FILL FINANCIAL VERSION")
			});
			return false;
		}
		/*  if (!_self.tabs.getInnerControllers()[1].view.layoutVersion.ctrl.getKey()) {
            $.baseToast({
                type: 'w',
                text: i18n("MUST FILL LAYOUT VERSION")
            });
            return false;
        }*/
		if (!_self.tabs.getInnerControllers()[1].view.closingDocumentType.ctrl.getText()) {
			$.baseToast({
				type: 'w',
				text: i18n("MUST FILL CLOSING DOCUMENT")
			});
			return false;
		}
		if (!_self.tabs.getInnerControllers()[1].view.startingSituation.ctrl.getKey()) {
			$.baseToast({
				type: 'w',
				text: i18n("MUST FILL STARTING SITUATION")
			});
			return false;
		}
		if (!_self.tabs.getInnerControllers()[2].view.LargeBusinessIndicator.ctrl.getKey()) {
			$.baseToast({
				type: 'w',
				text: i18n("MUST FILL LARGE BUSINESS INDICATOR")
			});
			return false;
		}
		if (!_self.tabs.getInnerControllers()[2].view.FiscalYearClosingDate.ctrl.getValue().timpDate) {
			$.baseToast({
				type: 'w',
				text: i18n("MUST FILL FISCAL YEAR CLOSING DATE")
			});
			return false;
		}
		if (!_self.tabs.getInnerControllers()[0].view.company.ctrl.getKey()) {
			$.baseToast({
				type: 'w',
				text: i18n("MUST FILL FISCAL COMPANY")
			});
			return false;
		}
		return true;
	},
	getFormData: function() {
		var _self = this;

		function date(f) {
			var newDate = f.jsonDate.ptrbr.reverse().join("");
			return newDate;
		}
		var data = {
			'tmf:ECDReportRun': {
				REPORT_ID: '0000000002',
				REPORT_KEY: '',
				ESTR_BALANCO: '',
				DESCRIPTION: '',
				REP_SHADOW_E: ''
			}
		};
		data['tmf:ECDReportRun'].REGISTER_RANGE = {
			SIGN: '',
			OPTION: '',
			LOW: _self.tabs.getInnerControllers()[0].view.initialRecord.ctrl.getKey() ? _self.tabs.getInnerControllers()[0].view.initialRecord.ctrl
				.getKey() : '',
			HIGH: _self.tabs.getInnerControllers()[0].view.finalRecord.ctrl.getKey() ? _self.tabs.getInnerControllers()[0].view.finalRecord.ctrl.getKey() : ''
		};
		data['tmf:ECDReportRun'].RUN_ID = '';
		var periodValue = _self.tabs.getInnerControllers()[0].view.period.ctrl.getValue();
		var periodValueLow = new Date(periodValue.startDate.split("GMT")[0]);
		var periodValueHigh = new Date(periodValue.endDate.split("GMT")[0]);
		var datePeriodValueLow = Date.toJSONDate(periodValueLow);
		var datePeriodValueHigh = Date.toJSONDate(periodValueHigh);
		data['tmf:ECDReportRun'].YEAR = periodValue.year;
		data['tmf:ECDReportRun'].MONTH_LOW = datePeriodValueLow.month;
		data['tmf:ECDReportRun'].MONTH_HIGH = datePeriodValueHigh.month;

		if (_self.tabs.getInnerControllers()[0].view.organizationalParams.cnpj.getChecked()) {
			data['tmf:ECDReportRun'].CNPJ = _self.tabs.getInnerControllers()[0].view.cnpj.ctrl.getKey() ? _self.tabs.getInnerControllers()[0].view.cnpj
				.ctrl.getKey() : '';
			data['tmf:ECDReportRun'].BUKRS = data['tmf:ECDReportRun'].CNPJ;
		} else {
			data['tmf:ECDReportRun'].BUKRS = _self.tabs.getInnerControllers()[0].view.company.ctrl.getKey() ? _self.tabs.getInnerControllers()[0].view
				.company.ctrl.getKey() : '';
		}
		data['tmf:ECDReportRun'].COD_CTA_INI = _self.tabs.getInnerControllers()[0].view.initialAccount.ctrl.getKey() ? _self.tabs.getInnerControllers()[
			0].view.initialAccount.ctrl.getKey() : '';
		data['tmf:ECDReportRun'].COD_CTA_FIN = _self.tabs.getInnerControllers()[0].view.finalAccount.ctrl.getKey() ? _self.tabs.getInnerControllers()[
			0].view.finalAccount.ctrl.getKey() : '';
		data['tmf:ECDReportRun'].LEDGER = _self.tabs.getInnerControllers()[0].view.ledger.ctrl.getKey() ? _self.tabs.getInnerControllers()[0].view
			.ledger
			.ctrl.getKey() : '';

		if (_self.tabs.getInnerControllers()[0].view.organizationalParams.company.getChecked()) {
			data['tmf:ECDReportRun'].ORGSTR_PARAM = 'CE';
		} else {
			data['tmf:ECDReportRun'].ORGSTR_PARAM = 'ROOT';
		}
		data['tmf:ECDReportRun'].DT_INI = datePeriodValueLow.year + datePeriodValueLow.month + datePeriodValueLow.day;
		data['tmf:ECDReportRun'].DT_FIN = datePeriodValueHigh.year + datePeriodValueHigh.month + datePeriodValueHigh.day;
		data['tmf:ECDReportRun'].DESCRIPTION = _self.fileData.description ? _self.fileData.description : '';
		data['tmf:ECDReportRun'].CTAALT = '';
		data['tmf:ECDReportRun'].CODVER = '';
		data['tmf:ECDReportRun'].CLUCRO = '';

		data['tmf:ECDReportRun'].INDESC = _self.tabs.getInnerControllers()[1].view.bookkeepingType.ctrl.getKey() ? _self.tabs.getInnerControllers()[
			1]
			.view.bookkeepingType.ctrl.getKey() : '';
		data['tmf:ECDReportRun'].INDTIP = _self.tabs.getInnerControllers()[1].view.demonstrativeType.ctrl.getKey() ? _self.tabs.getInnerControllers()[
			1].view.demonstrativeType.ctrl.getKey() : '';
		data['tmf:ECDReportRun'].INDPUR = _self.tabs.getInnerControllers()[1].view.bookkeepingFinality.ctrl.getKey() ? _self.tabs.getInnerControllers()[
			1].view.bookkeepingFinality.ctrl.getKey() : '';
		data['tmf:ECDReportRun'].LAYOUT = _self.tabs.getInnerControllers()[1].view.layoutVersion.ctrl.getKey() ? _self.tabs.getInnerControllers()[
			1].view
			.layoutVersion.ctrl.getKey() : '';
		data['tmf:ECDReportRun'].TIPECD = _self.tabs.getInnerControllers()[1].view.ecdType.ctrl.getKey() ? _self.tabs.getInnerControllers()[1].view
			.ecdType
			.ctrl.getKey() : '';
		data['tmf:ECDReportRun'].CODSCP = _self.tabs.getInnerControllers()[1].view.scpCode.ctrl.getText() ? _self.tabs.getInnerControllers()[1].view
			.scpCode
			.ctrl.getText() : '';
		data['tmf:ECDReportRun'].ESTRBA = _self.tabs.getInnerControllers()[1].view.financialVersion.ctrl.getText() ? _self.tabs.getInnerControllers()[
			1].view.financialVersion.ctrl.getText() : '';
		data['tmf:ECDReportRun'].CLSDOC = _self.tabs.getInnerControllers()[1].view.closingDocumentType.ctrl.getText() ? _self.tabs.getInnerControllers()[
			1].view.closingDocumentType.ctrl.getText() : '';
		data['tmf:ECDReportRun'].INDPSI = _self.tabs.getInnerControllers()[1].view.startingSituation.ctrl.getKey() ? _self.tabs.getInnerControllers()[
			1].view.startingSituation.ctrl.getKey() : '';
		data['tmf:ECDReportRun'].DTRES = _self.tabs.getInnerControllers()[1].view.activationDate.ctrl.getValue().timpDate !== undefined ?
			date(_self.tabs.getInnerControllers()[1].view.activationDate.ctrl.getValue()) : '';
		if (_self.tabs.getInnerControllers()[1].view.runRb.test.getChecked()) {
			data['tmf:ECDReportRun'].OFFICIAL_RUN = '';
		} else {
			data['tmf:ECDReportRun'].OFFICIAL_RUN = 'X';
		}

		data['tmf:ECDReportRun'].DTARQ = _self.tabs.getInnerControllers()[2].view.CompanyOpeningDate.ctrl.getValue().timpDate !== undefined ?
			date(_self.tabs.getInnerControllers()[2].view.CompanyOpeningDate.ctrl.getValue()) : '';
		data['tmf:ECDReportRun'].DTCONV = _self.tabs.getInnerControllers()[2].view.LastModificationSharehold.ctrl.getValue().timpDate !==
			undefined ?
			date(_self.tabs.getInnerControllers()[2].view.LastModificationSharehold.ctrl.getValue()) : '';
		data['tmf:ECDReportRun'].INDNIR = '';
		data['tmf:ECDReportRun'].NIRESB = _self.tabs.getInnerControllers()[2].view.NIRESubBookkeeping.ctrl.getText() ? _self.tabs.getInnerControllers()[
			2].view.NIRESubBookkeeping.ctrl.getText() : '';
		data['tmf:ECDReportRun'].HASHSB = _self.tabs.getInnerControllers()[2].view.HashSubBookkeeping.ctrl.getText() ? _self.tabs.getInnerControllers()[
			2].view.HashSubBookkeeping.ctrl.getText() : '';
		data['tmf:ECDReportRun'].GRDPRT = _self.tabs.getInnerControllers()[2].view.LargeBusinessIndicator.ctrl.getKey() ? _self.tabs.getInnerControllers()[
			2].view.LargeBusinessIndicator.ctrl.getKey() : '';
		data['tmf:ECDReportRun'].NUMORD = _self.tabs.getInnerControllers()[2].view.BookNumber.ctrl.getText() ? _self.tabs.getInnerControllers()[
			2].view
			.BookNumber.ctrl.getText() : '';
		data['tmf:ECDReportRun'].NATLIV = _self.tabs.getInnerControllers()[2].view.BookPurpose.ctrl.getText() ? _self.tabs.getInnerControllers()[
			2].view
			.BookPurpose.ctrl.getText() : '';

		data['tmf:ECDReportRun'].DTEXSO = _self.tabs.getInnerControllers()[2].view.FiscalYearClosingDate.ctrl.getValue().timpDate !== "" ?
			date(_self.tabs.getInnerControllers()[2].view.FiscalYearClosingDate.ctrl.getValue()) : '';
		data['tmf:ECDReportRun'].IDDEM = _self.tabs.getInnerControllers()[2].view.IdentificationStatementAccounting.ctrl.getKey() ?
			_self.tabs.getInnerControllers()[2].view.IdentificationStatementAccounting.ctrl.getKey() : '';
		data['tmf:ECDReportRun'].CABDEM = _self.tabs.getInnerControllers()[2].view.AccountingStatementHead.ctrl.getText() ? _self.tabs.getInnerControllers()[
			2].view.AccountingStatementHead.ctrl.getText() : '';
		data['tmf:ECDReportRun'].APIN = '';
		console.log(data);
		return data;
	},
	clendarECF: function() {
		var _self = this;
		var startMonth = "";
		var startDay = "";
		var endMonth = "";
		var endDay = ""
		if (_self.fileData.type === "ECF") {
			var calendar = document.createElement("div");
			calendar.classList.add("calendar");
			calendar.ctrl = $(calendar).bindBaseRangePicker({
				required: true,
				onChange: function(oldVal, newVal) {
					console.log(newVal);
					_self.view.find(".containerFiles").remove();
					if (newVal.startDate.month < 10) {
						startMonth = 0 + "" + newVal.startDate.month;
					}
					if (newVal.startDate.date < 10) {
						startDay = 0 + "" + newVal.startDate.date;
					}
					if (newVal.endDate.month < 10) {
						endMonth = 0 + "" + newVal.startDate.date;
					}
					if (newVal.endDate.date < 10) {
						endDay = 0 + "" + newVal.startDate.date;
					}
					var startDate = newVal.startDate.year + startMonth + startDay;
					var endDate = newVal.endDate.year + endMonth + endDay;
					var calendarECFwraper = document.createElement("div");
					calendarECFwraper.classList.add("calendarECFwraper");
					for (var i = 0; i < _self.coreServices.requiredInformation.cnpjRootOptions.length; i++) {
						if (_self.coreServices.requiredInformation.cnpjRootOptions[i].validFrom <= startDate && _self.coreServices.requiredInformation.cnpjRootOptions[
							i].validTo >= endDate) {
							var containerFiles = document.createElement("div");
							containerFiles.classList.add("containerFiles");
							containerFiles.crtl = $(containerFiles).bindFileECF(
								_self.coreServices.requiredInformation.cnpjRootOptions[i]
							);
							calendarECFwraper.appendChild(containerFiles);
						}
					}
					_self.view.calendarECF[0].appendChild(calendarECFwraper);
					_self.renderECF();
				},
				tooltip: ''
			});
			_self.view.calendarECF[0].appendChild(calendar);
		}
	},
	renderECF: function() {
		var _self = this;
		_self.view.find("div.cnpjContainer").click(function() {
			var cnpjText = $(this).find("div.textCnpj")[0].textContent;
			var companyText = $(this).find("div.textCompany")[0].textContent;
			for (var i = 0; i < _self.coreServices.requiredInformation.cnpjRootOptions.length; i++) {
				if (_self.coreServices.requiredInformation.cnpjRootOptions[i].key === cnpjText && _self.coreServices.requiredInformation.cnpjRootOptions[
					i].idCompany === companyText) {
					_self.tabs.getInnerControllers()[0].view.runSpedECF[0].textContent = "Run SPED ECF - " + _self.coreServices.requiredInformation.cnpjRootOptions[
						i].key;
					_self.tabs.getInnerControllers()[0].view.CompanyCode.ctrl.setText(_self.coreServices.requiredInformation.cnpjRootOptions[i].idCompany);
					console.log(cnpjText, companyText);
					_self.coreServices.quizAnswer = _self.coreServices.requiredInformation.cnpjRootOptions[i].questionaries;
					if (_self.tabs.getInnerControllers()[0].view.period.ctrl.getValue().hasOwnProperty("startDate")) {
						_self.tabs.getInnerControllers()[0].executeQuiz();
					}
				}
			}
		});
	}
});