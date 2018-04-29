$.import("timp.core.server.api", "api");
var core_api = $.timp.core.server.api.api;
var util = core_api.util;
var fileShare = core_api.fileShareController;
var fileCRUDF = core_api.fileCRUDFController;
var fileCRUDFNew = core_api.fileCRUDFNew;
var usersModel = core_api.users;
var fileFavsModel = core_api.fileFavs;
var fileShareModel = core_api.fileShare;
var objectTypeModel = core_api.objectTypes;
var user = core_api.usersController;
var fileSystem = core_api.fileSystem;

$.import("timp.dfg.server.models", "digitalFile");
var modelDigitalFile = $.timp.dfg.server.models.digitalFile;

$.import("timp.dfg.server.models", "digitalFileTypeText");
var modelDigitalFileType = $.timp.dfg.server.models.digitalFileTypeText.table;

$.import("timp.dfg.server.models", "an3");
var modelAn3 = $.timp.dfg.server.models.an3;

$.import("timp.dfg.server.controllers", "AN3");
var controllerAn3 = $.timp.dfg.server.controllers.AN3;

$.import("timp.dfg.server.models", "panel");
var modelPanel = $.timp.dfg.server.models.panel;

$.import('timp.dfg.server.controllers', 'util');
var utilDFG = $.timp.dfg.server.controllers.util;

$.import('timp.dfg.server.controllers', 'log');
var logDFG = $.timp.dfg.server.controllers.log.Supervisor;



$.import('timp.dfg.server.controllers', 'external');
var controllerExternal = $.timp.dfg.server.controllers.external;

$.import('timp.dfg.server.controllers', 'digitalFileType');
var controllerDigitalFileType = $.timp.dfg.server.controllers.digitalFileType;

$.import("timp.atr.server.api", "api");
var atr_api = $.timp.atr.server.api.api;
var companyBranches = atr_api.companyBranches.table;

$.import("timp.dfg.server.models.views", "cvAN3");
var cvAn3 = $.timp.dfg.server.models.views.cvAN3.table;
$.import("timp.dfg.server.controllers", "util");
var dfgUtil = $.timp.dfg.server.controllers.util;
this.searchKeys = {
	id: "id",
	nombre: "nombre",
	name: "name",
	type: "idDigitalFileType",
	company: "idCompany",
	branch: "idBranch",
	uf: "uf",
	tax: "idTax",
	status: "status",
	creationDateTo: "creationDate",
	creationDateFrom: "creationDate",
	modificationDateTo: "modificationDate",
	modificationDateFrom: "modificationDate",
	month: "month",
	year: "year",
	subperiod: "subperiod",
	sent: "status"
};

/*
    service to list the panels (without folder structure)
    object = {
        idDigitalFileType: integer || [integer] (optional)
        idCompany: string || [string] (optional)
        uf: string || [string] (optional)
        idBranch: string || [string] (optional)
        idTax: string || [string] (optional)
    }
*/
this.listFiles = function(object) {
	var response = {};
	try {
		var files = [];
		var lang = object.lang ? object.lang : ($.request.cookies.get("Content-Language") === "enus") ? "enus" : "ptrbr";
		var objectType = null;
		var isSetting = (object.hasOwnProperty("key") && object.key === "SETTING");
		if (isSetting === false && object.key === "JUSTIFY") {
		    var where = [];
		    
			 
		    
			 
		  if (object.hasOwnProperty("searchParams")) {
				var searchOR = [];
            	for (var p in object.searchParams) {
            		if (this.searchKeys.hasOwnProperty(p) && this.searchKeys[p] && object.searchParams[p]!=="") {
            			switch (this.searchKeys[p]) {
            				case "creationDate":
            				case "modificationDate":
            					where.push({
            						field: this.searchKeys[p],
            						oper: ">=",
            						value: object.searchParams[p].split("T")[0] + "T00:00.000Z"
            					});
            					where.push({
            						field: this.searchKeys[p],
            						oper: "<=",
            						value: object.searchParams[p].split("T")[0] + "T23:59.999Z"
            					});
            					break;
            				case "idCompany":
            				case "idBranch":
            				case "uf":
            				case "idTax":
            				case "month":
            				case "year":
            					where.push({
            					    table: cvAn3,
            						field: this.searchKeys[p],
            						oper: "=",
            						value: object.searchParams[p]
             					});
            					break;
            				default:
            					//if we receive a name filter, we'll push it as an id
                            			if (!isNaN(object.searchParams[p]) && !object.searchParams.hasOwnProperty("id")) {
                            				searchOR.push({
                            					field: "id",
                            					oper: "=",
                            					value: parseInt(object.searchParams[p])
                            				});
                            
                            			}
                            			/*
                            			searchOR.push({
                            				field: "justify",
                            				oper: isNaN(object.searchParams[p]) ? "LIKE" : "=",
                            				value: isNaN(object.searchParams[p]) ? ("%" + object.searchParams[p].toUpperCase() + "%") : object.searchParams[p],
                            				maskFn: 'UPPER'
                            			});
                            			*/
            			}
            
            		}
            	}
            	
            	searchOR.push({
					field: "lang",
					oper: "=",
					value: lang
				});
				
            	if (searchOR.length) {
                    where.push(searchOR);
                }
			} else {
			    where = [{
					field: "lang",
					oper: "=",
					value: lang
		        }];
			}
			response.list = this.readJustify({
				where: [where]
			});
			response.pageCount = response.list.pageCount;
		} else {
			if (isSetting === false && object.key !== "JUSTIFY") {
				objectType = this.getIdObjectType("DFG::Panel");
			} else if (isSetting && object.key === "SETTING") {
				objectType = this.getIdObjectType("DFG::PanelSetting");
			}
			object.idUser = user.getTimpUser().id;
			if (object.idFolder) {
				files = fileCRUDFNew.listFilesByFolder({
					idUser: object.idUser,
					idFolder: object.idFolder,
					objectType: (!isSetting) ? "DFG::Panel" : "DFG::PanelSetting",
					fields: ["idObject", "status"]
				});
			} else {
				files = fileCRUDFNew.listFilesByStatus({
					status: object.key,
					objectType: (!isSetting) ? "DFG::Panel" : "DFG::PanelSetting",
					fields: ["idObject", "status", "creationUser"]
				});
			}
			if (files.length > 0) {
				var whereOptions = [[]];
				for (var index in files) {
					if (files.hasOwnProperty(index) && !isNaN(Number(files[index].idObject))) {
						whereOptions[0].push({
							field: "id",
							oper: "=",
							value: files[index].idObject
						});
					}
				}
				var join = [];
				if (isSetting === false) {
					join = [{
						table: usersModel,
						alias: "creationUser",
						fields: ["id", "name", "last_name"],
						on: [{
							left_table: modelPanel.panelTable,
							left: "creationUser",
							right: "id"
        				}],
						outer: "left"
        			}, {
						table: modelPanel.panelCommentTable,
						alias: "justify",
						on: [{
							left_table: modelPanel.panelTable,
							left: "id",
							right: "idPanel"
        				}, {
							left_table: modelPanel.panelTable,
							left: "idReport",
							right: "idReport"
        				}],
						outer: "left"
        			}, {
						table: usersModel,
						alias: "modificationUser",
						rename: "A",
						fields: ["id", "name", "last_name"],
						on: [{
							left_table: modelPanel.panelTable,
							left: "modificationUser",
							right: "id"
        				}],
						outer: "left"
        			}, {
						table: modelAn3.an3Report,
						alias: "report",
						fields: ["id", "name", "description"],
						on: [{
							left_table: modelPanel.panelTable,
							left: "idReport",
							right: "id"
        				}],
						outer: "left"
        			}, {
						table: cvAn3,
						alias: "AN3",
						fields: ["id", "origin", "idDigitalFile", "idDigitalFileType", "idLayoutVersion", "idExternalFile", "idCompany", "idBranch", "uf",
							"idTax", "subperiod",
     					"month", "year"],
						on: [{
							left_table: modelPanel.panelTable,
							left: "idDigitalFile",
							right: "id"
        				}],
						outer: "left"
        			}, {
						table: modelDigitalFileType,
						alias: "digitalFileTypeText",
						fields: ["name"],
						on: [{
							left_table: cvAn3,
							left: "idDigitalFileType",
							right: "idDigitalFileType"
                        }, {
							field: "lang",
							oper: "=",
							value: lang
     		            }]
     	            }, {
						table: fileFavsModel,
						alias: "favorite",
						fields: ["id"],
						on: [{
							left_table: modelPanel.panelTable,
							left: "id",
							right: "idObject"
        				}, {
							field: ["idObjectType"],
							oper: "=",
							value: objectType
        				}, {
							field: ["idUser"],
							oper: "=",
							value: object.idUser
        				}],
						outer: (object.key !== "FAVORITE") ? "left" : "right"
        			}, {
						table: modelPanel.panelStatusTextTable,
						alias: "statusText",
						fields: ["id", "name", "lang", "idPanelStatus"],
						on: [{
							left_table: modelPanel.panelTable,
							left: "status",
							right: "idPanelStatus"
        				}, {
							field: ["lang"],
							oper: "=",
							value: lang
        				}],
						outer: "left"
        			}];
					if (object.key === "SHARED") {
						join.push({
							table: fileShareModel,
							alias: "share",
							fields: ["id"],
							on: [{
								left_table: modelPanel.panelTable,
								left: "id",
								right: "idObject"
        					}, {
								field: ["idObjectType"],
								oper: "=",
								value: objectType
        					}, {
								field: ["idUser"],
								oper: "=",
								value: object.idUser
        					}],
							outer: "right"
						});
					}
					if (object.hasOwnProperty("searchParams")) {
						this.evalSearchParams(object.searchParams, whereOptions);
					}
					if (object.hasOwnProperty("order_by") && object.order_by) {
						var order_by = object.order_by;
					}
					var Panels = modelPanel.readPanel({
						fields: ["id", "status", "creationDate", "modificationDate", "idDigitalFile", "idReport"],
						join: join,
						where: whereOptions,
						// simulate:true,
						paginate: {
							size: 10,
							number: Number(object.number),
							count: true
						},
						order_by: order_by ? order_by : ['id']
					});
					response.pageCount = Panels.pageCount;
					for (index in Panels) {
						if (Panels.hasOwnProperty(index)) {
							Panels = Panels.map(function(element, index) {
								for (var index2 = 0; index2 < files.length; index2++) {
									if (files[index2].idObject === element.id) {
										element.fileStatus = files[index2].status;
										// element.AN3 = controllerAn3.read({id: element.idDigitalFile, lang: lang});
										if (element.hasOwnProperty("AN3") && element.AN3) {
											delete element.AN3.layoutVersion;
											delete element.AN3.structure;
											delete element.AN3.externalFile;
											delete element.AN3.reports;
										}
										return element;
									}
								}
							});
						}
					}
					response.list = Panels;
				} else {
					join = [{
						table: usersModel,
						alias: "creationUser",
						fields: ["id", "name", "last_name"],
						on: [{
							left_table: modelPanel.panelSettingTable,
							left: "creationUser",
							right: "id"
        				}],
						outer: "left"
        			}, {
						table: usersModel,
						alias: "modificationUser",
						rename: "A",
						fields: ["id", "name", "last_name"],
						on: [{
							left_table: modelPanel.panelSettingTable,
							left: "modificationUser",
							right: "id"
        				}],
						outer: "left"
        			}, {
						table: modelDigitalFileType,
						alias: "digitalFileType",
						fields: ["id", "name", "description"],
						on: [{
							left_table: modelPanel.panelSettingTable,
							left: "idDigitalFileType",
							right: "idDigitalFileType"
        				}],
						outer: "left"
        			}, {
						table: fileFavsModel,
						alias: "favorite",
						fields: ["id"],
						on: [{
							left_table: modelPanel.panelSettingTable,
							left: "id",
							right: "idObject"
        				}, {
							field: ["idObjectType"],
							oper: "=",
							value: objectType
        				}, {
							field: ["idUser"],
							oper: "=",
							value: object.idUser
        				}],
						outer: (object.key !== "FAVORITE") ? "left" : "right"
        			}];
					var PanelSetting = modelPanel.readPanelSetting({
						fields: ["id", "idDigitalFileType", "idTax", "creationDate", "modificationDate", "link", "origin", "description"],
						join: join,
						where: whereOptions,
						paginate: {
							size: 10,
							number: Number(object.number),
							count: true
						},
						order_by: order_by ? order_by : ['id']
					});
					response.pageCount = PanelSetting.pageCount;
					for (index in PanelSetting) {
						if (PanelSetting.hasOwnProperty(index)) {
							PanelSetting = PanelSetting.map(function(element, index) {
								for (var index2 = 0; index2 < files.length; index2++) {
									if (files[index2].idObject === element.id) {
										return element;
									}
								}
							});
						}
					}
					response.list = PanelSetting;
				}
			} else {
				response.list = [];
			}
			var statusFiltered = {
				1: object.lang === "enus" ? 'Generated process' : 'Proceso de geração',
				2: object.lang === "enus" ? 'Interrupted' : 'Interrompido',
			//	3: object.lang === "enus" ? 'Validating PVA' : 'Validaçao no PVA',
				4: object.lang === "enus" ? 'Digital signed' : 'Assinado digital',
				5: object.lang === "enus" ? 'PVA Approved' : 'Aprovado no PVA',
			//	6: object.lang === "enus" ? 'PVA Approved' : 'Aprovado no PVA',
			//	7: object.lang === "enus" ? 'Assinado digital' : 'Assinado digital',
				8: object.lang === "enus" ? 'File transmitted' : 'Arquivo transmitido',
				9: object.lang === "enus" ? 'File saved' : 'Arquivo armazenado'
			};
			var tmpStatus = Object.keys(statusFiltered);
			response.filterOptions = {
				status: tmpStatus.map(function(d, i) {
					return {
						key: parseInt(d),
						name: statusFiltered[d]
					};
				}),
				company: companyBranches.getCompanyBranchesFilter(),
				// company: controllerExternal.listCompany(),
				// UF: controllerExternal.listUF(),
				// branch: controllerExternal.listBranch(),
				tax: controllerExternal.listTax(),
				users: user.listAllUsers(),
				month: dfgUtil.getMonths(),
				year: dfgUtil.getYears()
			};
		}
		if (object.hasOwnProperty("counter") && object.counter) {
			var counterOptions = {
				objectType: "DFG::Panel",
				counter: true
			};
			if (typeof object.counter === "object") {
				for (var key in object.counter) {
					if (object.counter.hasOwnProperty(key)) {
						counterOptions[key] = object.counter[key];
					}
				}

				response.counters = this.getPanelCounters(object);
			} else {
				response.counters = this.getPanelCounters(object);
			}
		}
	} catch (e) {
		$.trace.error(e);
		$.messageCodes.push({
			code: "DFG209000",
			type: "E",
			errorInfo: util.parseError(e)
		});
	}
	return response;
};

//<-----------------------------------Refactor-------------------------------------------------->
/**
 * @param {object} searchParams - endPoint Filters
 * @param {array} where - query Where Clause
 **/
this.evalSearchParams = function(searchParams, where) {
    var searchOR = [];
	for (var p in searchParams) {
		if (this.searchKeys.hasOwnProperty(p) && this.searchKeys[p] && searchParams[p]!=="") {
			switch (this.searchKeys[p]) {
				case "creationDate":
				case "modificationDate":
					where.push({
						field: this.searchKeys[p],
						oper: ">=",
						value: searchParams[p].split("T")[0] + "T00:00.000Z"
					});
					where.push({
						field: this.searchKeys[p],
						oper: "<=",
						value: searchParams[p].split("T")[0] + "T23:59.999Z"
					});
					break;
				case "idCompany":
				case "idBranch":
				case "uf":
				case "idTax":
				case "month":
				case "year":
					where.push({
					    table: cvAn3,
						field: this.searchKeys[p],
						oper: "=",
						value: searchParams[p]
 					});
					break;
				default:
					//if we receive a name filter, we'll push it as an id
                			if (!isNaN(searchParams[p]) && !searchParams.hasOwnProperty("id")) {
                				searchOR.push({
                					"field": "id",
                					"alias": "an4CV",
                					"operator": "=",
                					"value": searchParams[p]
                				});
                
                			}
                			searchOR.push({
                				"field": this.searchKeys[p],
                				"operator": p === "name" ? "LIKE" : "=",
                				"alias": "an4CV",
                				"value": p === "name" ? ("%" + searchParams[p].toUpperCase() + "%") : searchParams[p],
                				"maskFn": 'UPPER'
                			});
			}

		}
	}
	if (searchOR.length) {
        where.push(searchOR);
    }
};

/**
 * @param {object} object - Endpoint parameter
 * @param {number} object.idDigitalFile - Digital File ID to be inserted
 * @param {number} object.idFolder - Folder
 * @return {object} response - Resulting Panel created in the database
 */
this.createPanel = function(object) {

	object = object || $.request.parameters.get("object");
	if (typeof object === "string") {
		object = JSON.parse(object);
	}
	var panelFound = modelPanel.panelTable.READ({
		where: [{
			field: "idDigitalFile",
			oper: "=",
			value: object.idDigitalFile
        }, {
			field: "idReport",
			oper: "=",
			value: object.idReport
        }]
	});
	var panel;
	if (panelFound.length > 0) {
		object.id = panelFound[0].id;
		panel = this.updatePanel(object);
		return object;
	} else {
		object.idFolder = object.idFolder || -1;
		panel = modelPanel.createPanel(object);
		if (object.idFolder && panel.id) {
			var objectToCreateFile = {
				file: {
					id_folder: object.idFolder,
					id_object: panel.id,
					objectType: "DFG::Panel"
				}
			};
			fileCRUDF.createFile(objectToCreateFile);
		}
	}
	return panel;
};

this.settingDialog = function(object) {
	let response = {
		taxes: [],
		digitalFileTypes: []
	};
	object = object || $.request.parameters.get("object");
	if (typeof object === "string") {
		object = JSON.parse(object);
	}

	response.digitalFileTypes = controllerDigitalFileType.list();
	response.taxes = controllerExternal.listTax();
	return response;
};

this.createSettingPanel = function(object) {

	object = object || $.request.parameters.get("object");
	if (typeof object === "string") {
		object = JSON.parse(object);
	}
	object.idFolder = object.idFolder || -1;
	var panelSetting = modelPanel.createPanelSetting(object);
	if (object.idFolder && panelSetting.id) {
		var objectToCreateFile = {
			file: {
				id_folder: object.idFolder,
				id_object: panelSetting.id,
				objectType: "DFG::PanelSetting"
			}
		};
		fileCRUDF.createFile(objectToCreateFile);
	}
	return panelSetting;
};
this.updateSettingPanel = function(object) {

	object = object || $.request.parameters.get("object");
	if (typeof object === "string") {
		object = JSON.parse(object);
	}
	return modelPanel.updatePanelSetting(object);
};

/**
 * @param {object} object - Endpoint parameter
 * @param {number} object.idDigitalFile - Digital File ID to be inserted
 * @param {number} object.idFolder - Folder
 * @return {object} response - Resulting Panel created in the database
 */
this.approve = function(object) {

	object = object || $.request.parameters.get("object");
	if (typeof object === "string") {
		object = JSON.parse(object);
	}
	// 	this.updatePanel({id: object.idPanel, status: 4});
	return modelPanel.createCommentPanel(object);
};

this.approvePVA = function(object) {

	object = object || $.request.parameters.get("object");
	if (typeof object === "string") {
		object = JSON.parse(object);
	}
	this.updatePanel(object);
	return modelPanel.createApprovePanel(object);
};

/**
 *@param {object} object - Endpoint parameter
 * @param {number} object.id - Panel's id
 **/
this.readPanel = function(object) {
	var panelFile;
	try {
		object = object || $.request.parameters.get("object");
		if (typeof object === "string") {
			object = JSON.parse(object);
		}
		if (object.hasOwnProperty("id")) {
			panelFile = modelPanel.panelTable.READ({
				where: [{
					field: "id",
					oper: "=",
					value: object.id
                  }]
			})[0];
			// var logRegister = new logDFG();
			// logRegister.readPanel(panelFile);
		} else {
			panelFile = modelPanel.readPanel(object);
		}
	} catch (e) {
		$.trace.error(e);
		$.messageCodes.push({
			type: "E",
			code: "DFG216003",
			errorInfo: util.parseError(e)
		});
	}
	return panelFile;
};

this.readSettingPanel = function(object) {
	var panel = {};
	var lang = ($.request.cookies.get("Content-Language") === "enus") ? "enus" : "ptrbr";
	try {
		object = object || $.request.parameters.get("object");
		if (typeof object === "string") {
			object = JSON.parse(object);
		}
		panel.panel = this.readPanel(object.panel);
		let whereOptions = [{
			field: "origin",
			oper: "=",
			value: object.setting.origin
 		}];
		let settings = modelPanel.panelSettingTable.READ({
			where: whereOptions,
			join: [{
				table: modelDigitalFileType,
				alias: "digitalFileType",
				fields: ["id", "idDigitalFileType", "name", "description", "lang"],
				on: [{
					left_table: modelPanel.panelSettingTable,
					left: "idDigitalFileType",
					right: "idDigitalFileType"
				}, {
					field: "lang",
					oper: "=",
					value: lang,
					table: modelDigitalFileType
				}, {
					field: "name",
					oper: "=",
					value: object.setting.digitalFileTypeText,
					table: modelDigitalFileType
				}],
				outer: "left"
			}]
		});
		var sett = [];
		for (var j = 0; j < settings.length; j++) {
			var taxes = JSON.parse(settings[j].idTax);
			if (taxes.indexOf(object.setting.idTax) > -1) {
				sett.push(settings[j]);
			}
		}
		panel.setting = sett;
	} catch (e) {
		$.trace.error(e);
		$.messageCodes.push({
			type: "E",
			code: "DFG216003",
			errorInfo: util.parseError(e)
		});
	}
	return panel;
};

/**
 *@param {object} object - Endpoint parameter
 * @param {number} object.id - Panel's id
 **/
this.readComment = function(object) {
	var panelCommentFile;
	try {
		panelCommentFile = modelPanel.readCommentTable(object);
		// var logRegister = new logDFG();
		// logRegister.readPanel(panelFile);
	} catch (e) {
		$.trace.error(e);
		$.messageCodes.push({
			type: "E",
			code: "DFG216005",
			errorInfo: util.parseError(e)
		});
	}
	return panelCommentFile;
};

/**
 * @param {object} object - Endpoint parameter
 * @param {number} object.id - Panel id to be updated
 * @param {number} object.idDigitalFile - Digital File ID to be inserted
 * @param {number} object.idFolder - Folder
 * @return {object} response - Resulting Panel created in the database
 */
this.updatePanel = function(object) {

	object = object || $.request.parameters.get("object");
	if (typeof object === "string") {
		object = JSON.parse(object);
	}
	var panel = modelPanel.updatePanel(object);
	return panel;
};

/**
 * @param {object} object - Endpoint parameter.
 * @param {number array} object.idObject - Array of file IDs
 * @param {number} object.status - status the file is to be updated to
 * @return {object array} response - Array with all updated files
 */
this.updateFile = function(object) {

	return fileCRUDFNew.updateFileStatus(object);
};

/**
 * @param {object} object - Endpoint parameter.
 * @param {number array} object.idObject - Array of file IDs
 * @return {object array} response - Array with all files added to favorites
 */
this.setFavorite = function(object) {
	return fileCRUDFNew.markFavorite({
		objectType: "DFG::Panel",
		idObject: object.idObject
	});
};

/**
 * @param {object} object - Endpoint parameter.
 * @param {number array} object.idObject - Array of file IDs
 * @return {object array} response - Array with all files removed from favorites
 */
this.removeFavorite = function(object) {
	return fileCRUDFNew.unmarkFavorite({
		objectType: "DFG::Panel",
		idObject: object.idObject
	});
};

/**
 * @param {string} objectType - Name of the object that you need.
 * @return {number} - ID of object in CORE::ObjectType
 */
this.getIdObjectType = function(objectType) {
	var object = objectTypeModel.READ({
		fields: ['id'],
		where: [{
			field: 'name',
			oper: '=',
			value: objectType
		}]
	})[0];

	if (object === undefined) {
		throw 'ObjectType Not Found';
	}
	return object.id;
};

this.getPanelCounters = function(object) {
	var response = {};
	try {
		var objectType = this.getIdObjectType("DFG::Panel");
		var objectTypeSetting = this.getIdObjectType("DFG::PanelSetting");
		object.idUser = user.getTimpUser().id;

		var PublicPanel = fileSystem.readFile({
			fields: ["idObject"],
			where: [{
				field: "idObjectType",
				oper: "=",
				value: objectType
                }, {
				field: "status",
				oper: "=",
				value: 4
                }]
		});
		var SettingPanel = fileSystem.readFile({
			fields: ["idObject"],
			where: [{
				field: "idObjectType",
				oper: "=",
				value: objectTypeSetting
            }]
		});
		response.setting = SettingPanel.length;

		response.justify = this.readJustify({
			where: [{
				field: "lang",
				oper: "=",
				value: object.lang ? object.lang : ($.request.cookies.get("Content-Language") === "enus") ? "enus" : "ptrbr"
	        }]
		}).length;
		if (PublicPanel.length > 0) {
			var wherePublic = this.createWhere(PublicPanel);
			response.public = modelPanel.readPanel({
				simulate: true,
				count: true,
				where: wherePublic
			})[0];
		} else {
			response.public = 0;
		}
		var StandardPanel = fileSystem.readFile({
			fields: ["idObject"],
			where: [{
				field: "idObjectType",
				oper: "=",
				value: objectType
                }, {
				field: "status",
				oper: "=",
				value: 0
                }]
		});
		if (StandardPanel.length > 0) {
			var whereStandard = this.createWhere(StandardPanel);
			response.standard = modelPanel.readPanel({
				count: true,
				where: whereStandard
			})[0];
		} else {
			response.standard = 0;
		}
		var TrashPanel = fileSystem.readFile({
			fields: ["idObject"],
			where: [{
				field: "idObjectType",
				oper: "=",
				value: objectType
                }, {
				field: "creationUser",
				oper: "=",
				value: object.idUser
                }, {
				field: "status",
				oper: "=",
				value: 2
                }]
		});
		if (TrashPanel.length > 0) {
			var whereTrash = this.createWhere(TrashPanel);
			response.trash = modelPanel.readPanel({
				count: true,
				where: whereTrash
			})[0];
		} else {
			response.trash = 0;
		}
		var FavoritePanel = fileFavsModel.READ({
			fields: ["idObject"],
			where: [{
				field: "idUser",
				oper: "=",
				value: object.idUser
                }, {
				field: "idObjectType",
				oper: "=",
				value: objectType
                }]
		});
		if (FavoritePanel.length > 0) {
			var whereFavorite = this.createWhere(FavoritePanel);
			response.favorite = modelPanel.readPanel({
				count: true,
				where: whereFavorite
			})[0];
		} else {
			response.favorite = 0;
		}
		var SharedPanel = fileShareModel.READ({
			fields: ["idObject"],
			where: [{
				field: "idUser",
				oper: "=",
				value: object.idUser
                }, {
				field: "idObjectType",
				oper: "=",
				value: objectType
                }]
		});
		if (SharedPanel.length > 0) {
			var whereShared = this.createWhere(SharedPanel);
			response.shared = modelPanel.readPanel({
				count: true,
				where: whereShared
			})[0];
		} else {
			response.shared = 0;
		}
	} catch (e) {
		$.trace.error(e);
		$.messageCodes.push({
			code: "DFG209011",
			type: "E",
			errorInfo: util.parseError(e)
		});
	}
	return response;
};

//Justify panel
this.createJustify = function(object) {

	object = object || $.request.parameters.get("object");
	if (typeof object === "string") {
		object = JSON.parse(object);
	}
	var panel = modelPanel.createJustifyPanel(object);
	return panel;
};
this.readJustify = function(object) {
	var panelJustifyFile;
	try {
		object = object || $.request.parameters.get("object");
		if (object.lang) {
			object = {
				where: [{
					field: 'lang',
					oper: '=',
					value: object.lang
 	            }]
			};
		}
		panelJustifyFile = modelPanel.readJustifyPanel(object);
	} catch (e) {
		$.trace.error(e);
		$.messageCodes.push({
			type: "E",
			code: "DFG216005",
			errorInfo: util.parseError(e)
		});
	}
	return panelJustifyFile;
};

this.createWhere = function(TypeFile) {
	try {
		var where = [[]];
		for (var index in TypeFile) {
			if (TypeFile.hasOwnProperty(index) && !isNaN(Number(TypeFile[index].idObject))) {
				where[0].push({
					field: "id",
					oper: "=",
					value: TypeFile[index].idObject
				});
			}
		}
		return where;
	} catch (e) {
		$.messageCodes.push({
			code: "DFG209000",
			type: "E",
			errorInfo: util.parseError(e)
		});
	}
};