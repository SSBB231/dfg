 $.import("timp.core.server.api", "api");
 var core_api = $.timp.core.server.api.api;
 var util = core_api.util;
 var user = core_api.usersController;
 var sql = core_api.sql;
 var fileCRUDFNew = core_api.fileCRUDFNew;
 var fileSystem = core_api.fileSystem;
 this.statusTypes = fileSystem.statusTypes;
 var fileFavsModel = core_api.fileFavs;
 var fileShareModel = core_api.fileShare;
 
 $.import("timp.atr.server.api", "api");
 var atr_api = $.timp.atr.server.api.api;
 var modelStructure = atr_api.structure.table;
 var structureGroupModel = atr_api.structureGroup;
 var controllerStructure = atr_api.structureController;
 var tributoModel = atr_api.tributo.table;
 var companyBranches = atr_api.companyBranches.table;

 $.import('timp.dfg.server.controllers', 'external');
 var controllerExternal = $.timp.dfg.server.controllers.external;

 $.import('timp.dfg.server.controllers', 'digitalFileType');
 var controllerDigitalFileType = $.timp.dfg.server.controllers.digitalFileType;
 //SETTING 
 $.import("timp.dfg.server.models", "settingVersion");
 var modelSettingVersionTable = $.timp.dfg.server.models.settingVersion.table;
 //LAYOUT VERSION
 $.import("timp.dfg.server.models", "layoutVersion");
 var modelLayoutVersiontable = $.timp.dfg.server.models.layoutVersion.table;
 $.import("timp.dfg.server.models", "layoutXStructure");
 var modelLayoutXStructure = $.timp.dfg.server.models.layoutXStructure;
 //DIGITAL FILE TYPE TEXT
 $.import("timp.dfg.server.models", "digitalFileTypeText");
 var modelDigitalFileTypeTextTable = $.timp.dfg.server.models.digitalFileTypeText.table;
 //DIGITAL FILE
 $.import("timp.dfg.server.models", "digitalFile");
 var modelDigitalFile = $.timp.dfg.server.models.digitalFile;
 $.import("timp.dfg.server.controllers","digitalFile");
 var digitalFileCtrl = $.timp.dfg.server.controllers.digitalFile;
 $.import('timp.dfg.server.controllers', 'log');
 var logDFG = $.timp.dfg.server.controllers.log.Supervisor;
 //AN3 MODELS
 $.import("timp.dfg.server.models", "an3");
 var an3 = $.timp.dfg.server.models.an3;
 var modelAN3 = $.timp.dfg.server.models.an3.an3Table;
 var modelAN3XBFBLayout = $.timp.dfg.server.models.an3.an3XBFBLayout;
 var modelAN3XDigitalFile = $.timp.dfg.server.models.an3.an3XDigitalFile;
 var modelAN3XExternalFile = $.timp.dfg.server.models.an3.an3XExternalFile;
 var modelAN3XRule = $.timp.dfg.server.models.an3.an3XRule;
 var modelAN3Report = $.timp.dfg.server.models.an3.an3Report;
 
 //BRE
 $.import('timp.bre.server.api', 'api');
 var bre_api = $.timp.bre.server.api.api;
 var rules = bre_api.rulesController;
 var rulesModel = bre_api.rules;
 
 //BFB
 $.import("timp.bfb.server.api", 'api');
 var bfb_api = $.timp.bfb.server.api.api;
 var BFBlayoutModel = bfb_api.layoutTable;
 
 //VIEWS 
 $.import("timp.dfg.server.models.views", "cvAN3");
 var cvAn3 = $.timp.dfg.server.models.views.cvAN3.table;

 var DFG = {};
 this.status = {
 	ACTIVE: 100,
 	EMITTED: 200,
 	OFFICIAL: 300,
 	SENT: 400,
 	LOCKED: 500
 };

 this.searchKeys = {
 	name: "name",
 	id: "id",
 	number: "id",
 	rules: "idRule",
 	company: "idCompany",
 	UF: "uf",
 	origin: "origin",
 	branch: "idBranch",
 	tax: "idTax",
 	creationUser: "creationIdUser",
 	modificationUser: "modificationIdUser",
 	creationDateTo: "creationDate",
 	creationDateFrom: "creationDate",
 	modificationDateTo: "modificationDate",
 	modificationDateFrom: "modificationDate"
 };
 /**
  *@param {String} action - Needed action for privilege
  *
  **/
 function getAccess(action) {
 	var hasAccess = true;

 	return hasAccess;
 }


 /**
  *@param {object} object - Endpoint parameter
  * @param {number} object.id - AN3's id
  **/
 this.read = function(object) {
 	var an3File;
 	 const schema = $.schema.slice(1, -1);
 	try {
 		const an3CVModel = $.createBaseRuntimeModel("_SYS_BIC", "timp.dfg.modeling/CV_AN3", true);
 		const an3XRuleModel = $.createBaseRuntimeModel(schema, "DFG::AN3XRule");
 		const ruleModel = $.createBaseRuntimeModel(schema, "BRE::Rule");
 		const modelLayoutVersion = $.createBaseRuntimeModel(schema, "DFG::LayoutVersion");
 		const modelSettingVersion = $.createBaseRuntimeModel(schema, "DFG::SettingVersion");
 		const modelDigitalFileTypeText = $.createBaseRuntimeModel(schema, "DFG::DigitalFileTypeText");
 		const modelAN3ExternalFile = $.createBaseRuntimeModel(schema, "DFG::AN3XExternalFile");
 		const modelAN3Report = $.createBaseRuntimeModel(schema, "DFG::AN3Report");
 		const modelLayoutXStructure = $.createBaseRuntimeModel(schema, "DFG::LayoutXStructure");
 		const modelStructure = $.createBaseRuntimeModel(schema, "ATR::Structure");
 		const modelTribute = $.createBaseRuntimeModel(schema, "ATR::Tributo");
 		if (object.hasOwnProperty("id")) {
 			object.lang = $.getSessionLanguage();
 			var aliases = [{
 				"name": "an3CV",
 				"collection": an3CVModel.getIdentity(),
 				"isPrimary": true
             }, {
 				"name": "an3XRule",
 				"collection": an3XRuleModel.getIdentity()
             }, {
 				"name": "rule",
 				"collection": ruleModel.getIdentity()
             }, {
 				"name": "layoutVersion",
 				"collection": modelLayoutVersion.getIdentity()
             }, {
 				"name": "setting",
 				"collection": modelSettingVersion.getIdentity()
             }, {
 				"name": "digitalFileTypeText",
 				"collection": modelDigitalFileTypeText.getIdentity()
             }, {
 				"name": "externalFile",
 				"collection": modelAN3ExternalFile.getIdentity()
             }, {
 				"name": "an3Report",
 				"collection": modelAN3Report.getIdentity()
             }, {
 				"name": "structure",
 				"collection": modelStructure.getIdentity()
             }, {
 				"name": "tribute",
 				"collection": modelTribute.getIdentity()
             }, {
 				"name": "layoutXStructure",
 				"collection": modelLayoutXStructure.getIdentity()
             }];
 			//AN3 Fields
 			var select = [{
 					"field": "ID",
 					"as": "id",
 					"alias": "an3CV"
                     }, {
 					"field": "NAME",
 					"as": "name",
 					"alias": "an3CV"
                     }, {
 					"field": "DESCRIPTION",
 					"as": "description",
 					"alias": "an3CV"
                     }, {

 					"field": "DIGITAL_FILE_NAME",
 					"as": "digitalFileName",
 					"alias": "an3CV"
                 },
 				{
 					"field": "ID_DIGITAL_FILE",
 					"as": "idDigitalFile",
 					"alias": "an3CV"
                 }, {
 					"field": "ID_EXTERNAL_FILE",
 					"as": "idExternalFile",
 					"alias": "an3CV"
                 }, {
 					"field": "EXTERNAL_FILE_NAME",
 					"as": "externalFileName",
 					"alias": "an3CV"
                 }, {
 					"field": "ORIGIN",
 					"as": "origin",
 					"alias": "an3CV"
                 }, {
 					"field": "CREATION_USER",
 					"as": "creationUser",
 					"alias": "an3CV"
                 }, {
 					"field": "CREATION_ID_USER",
 					"as": "creationIdUser",
 					"alias": "an3CV"
                 }, {
 					"field": "CREATION_DATE",
 					"as": "creationDate",
 					"alias": "an3CV"
                 }, {
 					"field": "MODIFICATION_USER",
 					"as": "modificationUser",
 					"alias": "an3CV"
                 }, {
 					"field": "MODIFICATION_ID_USER",
 					"as": "modificationIdUser",
 					"alias": "an3CV"
                 }, {
 					"field": "MODIFICATION_DATE",
 					"as": "modificationDate",
 					"alias": "an3CV"
                 }, {
 					"field": "ID_SETTING_VERSION",
 					"as": "idSettingVersion",
 					"alias": "an3CV"
                 }, {
 					"field": "ID_DIGITAL_FILE_TYPE",
 					"as": "idDigitalFileType",
 					"alias": "an3CV"
                 }, {
 					"field": "STATUS",
 					"as": "status",
 					"alias": "an3CV"
                 }, {
 					"field": "MONTH",
 					"as": "month",
 					"alias": "an3CV"
                 }, {
 					"field": "YEAR",
 					"as": "year",
 					"alias": "an3CV"
                 }, {
 					"field": "SUBPERIOD",
 					"as": "subperiod",
 					"alias": "an3CV"
                 }, {
 					"field": "ID_COMPANY",
 					"as": "idCompany",
 					"alias": "an3CV"
                 }, {
 					"field": "ID_BRANCH",
 					"as": "idBranch",
 					"alias": "an3CV"
                 }, {
 					"field": "UF",
 					"as": "uf",
 					"alias": "an3CV"
                 }, {
 					"field": "ID_TAX",
 					"as": "idTax",
 					"alias": "an3CV"
                 }, {
 					"field": "ID_LAYOUT_VERSION",
 					"as": "idLayoutVersion",
 					"alias": "an3CV"
                 }];
 			select.push({
 				"field": "ID",
 				"as": "id",
 				"alias": "rule"
 			}, {
 				"field": "NAME",
 				"as": "name",
 				"alias": "rule"
 			}, {
 				"field": "JSON",
 				"as": "json",
 				"alias": "layoutVersion"
 			}, {
 				"field": "ID_LAYOUT",
 				"as": "idLayout",
 				"alias": "layoutVersion"
 			}, {
 				"field": "ID_SETTING",
 				"as": "idSetting",
 				"alias": "setting"
 			}, {
 				"field": "NAME",
 				"as": "name",
 				"alias": "digitalFileTypeText"
 			}, {
 				"field": "EXTERNAL_FILE",
 				"as": "externalFile",
 				"alias": "externalFile"
 			}, {
 				"field": "ID",
 				"as": "id",
 				"alias": "an3Report"
 			}, {
 				"field": "NAME",
 				"as": "name",
 				"alias": "an3Report"
 			}, {
 				"field": "DESCRIPTION",
 				"as": "description",
 				"alias": "an3Report"
 			}, {
 				"field": "REPORT",
 				"as": "report",
 				"alias": "an3Report"
 			}, {
 				"field": "ID",
 				"as": "id",
 				"alias": "structure"
 			}, {
 				"field": object.lang === "PTRBR" ? "NAME_PTBR" : "NAME_ENUS",
 				"as": "title",
 				"alias": "structure"
 			}, {
 				"field": "JSON",
 				"as": "structure",
 				"alias": "structure"
 			}, {
 				"field": "COD_TRIBUTO",
 				"as": "codTributo",
 				"alias": "tribute"
 			}, {
 				"field": "DESCR_COD_TRIBUTO_LABEL",
 				"as": "descrCodTributoLabel",
 				"alias": "tribute"
 			});
 			var join = [{
 				alias: "an3XRule",
 				type: "inner",
 				on: [{
 					field: "ID_AN3",
 					"alias": "an3XRule",
 					operator: "$eq",
 					"value": {
 						"field": "ID",
 						"alias": "an3CV"
 					}
             }]
         }, {
 				alias: "rule",
 				map: "rule",
 				type: "inner",
 				on: [{
 					"field": "ID",
 					"alias": "rule",
 					"operator": "$eq",
 					"value": {
 						"field": "ID_RULE",
 						"alias": "an3XRule"
 					}
             }]
         }, {
 				alias: "layoutVersion",
 				map: "layoutVersion",
 				type: "inner",
 				on: [{
 					field: "ID",
 					alias: "layoutVersion",
 					"operator": "$eq",
 					"value": {
 						"field": "ID_LAYOUT_VERSION",
 						"alias": "an3CV"
 					}
             }]
         }, {
 				alias: "layoutXStructure",
 				"map": "layoutXStructure",
 				"type": "inner",
 				"on": [{
 					"field": "ID_LAYOUT",
 					"alias": "layoutXStructure",
 					"operator": "$eq",
 					"value": {
 						"field": "ID_LAYOUT",
 						"alias": "layoutVersion"
 					}
             }]
         }, {
 				alias: "setting",
 				type: "left",
 				map: "setting",
 				on: [{
 					field: "ID",
 					"alias": "setting",
 					"operator": "$eq",
 					"value": {
 						"field": "ID_SETTING_VERSION",
 						"alias": "an3CV"
 					}
             }]
         }, {
 				alias: "digitalFileTypeText",
 				map: "digitalFileTypeText",
 				type: "inner",
 				on: [{
 					field: "ID_DIGITAL_FILE_TYPE",
 					"alias": "digitalFileTypeText",
 					"operator": "$eq",
 					value: {
 						"field": "ID_DIGITAL_FILE_TYPE",
 						"alias": "an3CV"
 					}
             }, {
 					field: "LANG",
 					"alias": "digitalFileTypeText",
 					operator: "$eq",
 					value: object.lang
             }]
         }, {
 				alias: "externalFile",
 				map: "externalFile",
 				type: "left",
 				on: [{
 					field: "ID",
 					"alias": "externalFile",
 					"operator": "$eq",
 					"value": {
 						"field": "ID_EXTERNAL_FILE",
 						"alias": "an3CV"
 					}
             }]
         }, {
 				alias: "an3Report",
 				type: "left",
 				map: "reports",
 				on: [{
 					field: "ID_AN3",
 					alias: "an3Report",
 					"operator": "$eq",
 					"value": {
 						"field": "ID",
 						"alias": "an3CV"
 					}
             }, {
 					field: "CREATION_USER",
 					"alias": "an3Report",
 					operator: "$eq",
 					value: $.getUserID()
             }]
         }, {
 				"alias": "structure",
 				"type": "left",
 				"map": "structure",
 				"on": [{
 					"field": "ID",
 					"alias": "structure",
 					"operator": "$eq",
 					"value": {
 						"field": "ID_STRUCTURE",
 						"alias": "layoutXStructure"
 					}
             }]
         }, {
 				"alias": "tribute",
 				"type": "left",
 				"map": "taxInfo",
 				"on": [{
 					"field": "COD_TRIBUTO",
 					"alias": "tribute",
 					"operator": "$eq",
 					"value": {
 						"field": "ID_TAX",
 						"alias": "an3CV"
 					}
             }]
         }];
 			var where = [{
 				"field": "ID",
 				"alias": "an3CV",
 				"operator": "$eq",
 				"value": Number(object.id)
         }];
 			an3File = an3CVModel.find({
 				"aliases": aliases,
 				"select": select,
 				"join": join,
 				"where": where
 			});
 			if(an3File.results[0]){
 			    an3File = an3File.results[0];
 			    //To send the original format
 			    an3File.layoutVersion = an3File.layoutVersion[0];
 			    an3File.layoutVersion.json = JSON.stringify(an3File.layoutVersion.json);
 			    an3File.structure = an3File.structure.map(function(structure){
 			        structure.structure = JSON.stringify(structure.structure);
 			        return structure;
 			    });
 			    an3File.origin = an3File.origin === 1 ? "DFG" : "EXTERNAL";
 			    an3File.digitalFileTypeText = an3File.digitalFileTypeText[0];
 			    an3File.setting = an3File.setting[0];
 			    an3File.taxInfo = an3File.taxInfo[0];
 			    return an3File;
 			}
 			return undefined;
 		}
 	} catch (e) {
 		$.trace.error(e);
 		$.messageCodes.push({
 			type: "E",
 			code: "DFG215015",
 			errorInfo: util.parseError(e)
 		});
 	}
 };
 /**
  * @param {object} object - Endpoint parameter
  * @param {string} object.key - Key used to identify the type of listing to be done
  * @param {boolean | optional} object.counter - Optional parameter brings count results for all types of AN4 Files
  * @param {object | optional} object.counter - Optional parameter brings the count for a specified type of AN4 Files
  * @return {object} object.counter - Array with list of counters for specified AN4 Files types
  */
 this.listFiles = function(object) {
 	var response = {
 		list: []
 	};
 	try {
 		if (!getAccess("read")) {
 			$.messageCodes.push({
 				"code": "DFG215000",
 				"type": "E"
 			});
 			return response;
 		}
 		var where = [];
 		var join = [];

 		if (object.hasOwnProperty("key") && object.key) {
 			var statusValue = [];
 			switch (object.key) {
 				case "PUBLIC":
 					statusValue.push(this.statusTypes.PUBLIC);
 					break;
 				case "CREATE":
 				case "ACTIVE":
 					statusValue.push(this.statusTypes.ACTIVE);
 					statusValue.push(this.statusTypes.PUBLIC);
 					where.push({
 						field: "creationIdUser",
 						oper: "=",
 						value: $.getUserID()
 					});
 					break;
 				case "TRASH":
 					statusValue.push(this.statusTypes.TRASH);
 					where.push({
 						field: "creationIdUser",
 						oper: "=",
 						value: $.getUserID()
 					});
 					break;
 				case "STANDARD":
 					statusValue.push(this.statusTypes.STANDARD);
 					break;
 				case "FAVORITE":
 					join.push({
 						table: fileFavsModel,
 						alias: "favorite",
 						fields: ["id"],
 						on: [{
 							left: "idCoreFile",
 							right: "idFile"
        				}, {
 							field: ["idUser"],
 							oper: "=",
 							value: $.getUserID()
        				}],
 						outer: "right"
 					});
 					where.push({
 						field: "status",
 						oper: "!=",
 						value: this.statusTypes.TRASH
 					});
 					where.push({
 						field: "status",
 						oper: "!=",
 						value: this.statusTypes.DELETED
 					});
 					break;
 				case "SHARED":
 					join.push({
 						table: fileShareModel,
 						alias: "share",
 						fields: ["id"],
 						on: [{
 							left: "idCoreFile",
 							right: "idFile"
        					}, {
 							field: ["idUser"],
 							oper: "=",
 							value: $.getUserID()
        					}],
 						outer: "right"
 					});
 					where.push({
 						field: "status",
 						oper: "!=",
 						value: this.statusTypes.TRASH
 					});
 					where.push({
 						field: "status",
 						oper: "!=",
 						value: this.statusTypes.DELETED
 					});
 					break;

 			}
 			if (object.key !== "FAVORITE") {
 				join.push({
 					table: fileFavsModel,
 					alias: "favorite",
 					fields: ["id"],
 					on: [{
 						left: "idCoreFile",
 						right: "idFile"
        				}, {
 						field: ["idUser"],
 						oper: "=",
 						value: $.getUserID()
        				}],
 					outer: "left"
 				});
 			}
 			if (statusValue.length > 0) {
 				where.push({
 					field: "status",
 					oper: "=",
 					value: statusValue
 				});
 			}

 		}
 		if (object.hasOwnProperty("idFolder") && object.idFolder) {
 			where.push({
 				field: "idFolder",
 				oper: "=",
 				value: object.idFolder
 			});
 			where.push({
 				field: "status",
 				oper: "!=",
 				value: this.statusTypes.TRASH
 			});
 			where.push({
 				field: "status",
 				oper: "!=",
 				value: this.statusTypes.DELETED
 			});
 			where.push({
 				field: "creationIdUser",
 				oper: "=",
 				value: $.getUserID()
 			});
 		}
 		if (object.searchParams) {
 		    var searchOR = [];
 			for (var p in object.searchParams) {
 				if (this.searchKeys.hasOwnProperty(p) && this.searchKeys[p]&& object.searchParams[p]!=="") {
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
 						default:
 							//if we receive a name filter, we'll push it as an id
                        			if (!isNaN(object.searchParams[p]) && !object.searchParams.hasOwnProperty("id")) {
                        				searchOR.push({
                        					field: "id",
                        					oper: "=",
                        					value: object.searchParams[p]
                        				});
                        
                        			}
                        			searchOR.push({
                        				field: this.searchKeys[p],
                        				oper: p === "name" ? "LIKE" : "=",
                        				value: p === "name" ? ("%" + object.searchParams[p].toUpperCase() + "%") : object.searchParams[p],
                        				maskFn: 'UPPER'
                        			});
 					}
 				
 				}
 			}
 			
 			if (searchOR.length) {
                        where.push([[searchOR]]);
                	}
 		}
 		if (object.hasOwnProperty("searchParams") && object.key === "FOLDER") {
 			where.push({
 				field: "status",
 				oper: "!=",
 				value: this.statusTypes.TRASH
 			});
 			where.push({
 				field: "status",
 				oper: "!=",
 				value: this.statusTypes.DELETED
 			});
 			where.push({
 				field: "creationIdUser",
 				oper: "=",
 				value: $.getUserID()
 			});
 		}
 		join.push({
 			table: modelAN3XRule,
 			fields: [],
 			alias: "an3XRule",
 			on: [{
 				left: "id",
 				right: "idAN3"
	       }]
 		}, {
 			table: rulesModel,
 			alias: "rule",
 			fields: ["id", "name"],
 			on: [{
 				left_table: modelAN3XRule,
 				left: "idRule",
 				right: "id"
				}]
 		},{
 				table: modelLayoutVersiontable,
 				alias: "layoutVersion",
 				fields: ["idLayout"], 
 				on: [{
 					left: "idLayoutVersion",
 					right: "id"
 		            }]
 		        }, {
 				table: modelSettingVersionTable,
 				outer: "left",
 				alias: "setting",
 				fields: ["idSetting"],
 				on: [{
 					left: "idSettingVersion",
 					right: "id"
 		            }]
 		        });
 		var readObject = {
 			fields: ["id", "name", "description", "bfbLayoutName", "idBFBLayout", "digitalFileName", "idDigitalFile", "idExternalFile",
 				"externalFileName", "origin", "creationUser", "creationIdUser", "creationDate",
	        "modificationUser", "modificationIdUser", "modificationDate", "idSettingVersion", "idDigitalFileType", "status", "month", "year",
 				"subperiod", "idCompany", "idBranch", "uf", "idTax", "idLayoutVersion","isSPED"],
 			paginate: {
 				size: 15,
 				number: Number(object.number),
 				count: true
 			}
 		};
 		if (object.key && object.key === "CREATE") {
 			readObject.fields = ["id", "name", "description", "idBFBLayout", "idLayoutVersion", "idDigitalFile", "idSettingVersion",
 				"idDigitalFileType", "idExternalFile", "externalFileName", "origin", "month", "year", "subperiod", "idCompany", "idBranch", "uf",
 				"idTax"];
 			delete readObject.paginate;
 		}
 		if (where.length > 0) {
 			readObject.where = where;

 		}
 		if (join.length > 0) {
 			readObject.join = join;
 		}
 		var order_by;
 		if (object.hasOwnProperty("order_by") && object.order_by) {
 			order_by = object.order_by;
 		}
 		readObject.order_by = order_by ? order_by : ['id'];
 		var an3Files = cvAn3.READ(readObject);
 		response.pageCount = an3Files.pageCount;
 		response.list = an3Files;
 		if (object.hasOwnProperty("counter") && object.counter) {
 			var parameters = {
 				objectType: "DFG::AN3",
 				counter: true
 			};
 			if (typeof object.counter === "object") {
 				for (var key in object.counter) {
 					if (object.counter.hasOwnProperty(key)) {
 						parameters[key] = object.counter[key];
 					}
 				}
 				response.counters = fileCRUDFNew.getFileCounters(parameters);
 			} else {
 				response.counters = fileCRUDFNew.getFileCounters(parameters);
 			}
 			response.filterOptions = this.filters();
 		}

 	} catch (e) {
 		$.trace.error(e);
 		$.messageCodes.push({
 			type: "E",
 			code: "DFG215007",
 			errorInfo: util.parseError(e)
 		});
 	}
 	return response;
 };

 this.createDialog = function() {
 	var response = {
 		an3: [],
 		digitalFileTypes: []
 	};
 	try {
 		response.an3 = this.listFiles({
 			key: "CREATE"
 		}).list;
 		response.digitalFileTypes = controllerDigitalFileType.list();
 	} catch (e) {
 		$.trace.error(e);
 		$.messageCodes.push({
 			type: "E",
 			code: "DFG213002",
 			errorInfo: util.parseError(e)
 		});
 	}
 	return response;
 };
 /**
  * @param{object} object - Endpoint parameter
  * @param{string} object.name
  * @param{string} object.description
  * @param{number} object.idLayoutVersion
  * @param{number} object.origin
  * @param{number | optional} object.idBFBLayout
  * @param{string | optional} object.externalFile
  * @param{number | optional} object.digitalFile
  * @param{array<Integer>} object.idRules
  */
 this.create = function(object) {
 	var response;
 	try {
 		if (!getAccess("create")) {
 			$.messageCodes.push({
 				"code": "DFG215001",
 				"type": "E"
 			});
 			return response;
 		}
 		if(object.digitalFile){
 		    var digitalFile = digitalFileCtrl.issue(object.digitalFile);
 		    object.idDigitalFile = digitalFile.id;
 		    delete object.digitalFile;
 		}
 		response = an3.createAN3(object);
 		if (object.idFolder === undefined) {
 			object.idFolder = -1;
 		}
 		if (object.idFolder && response.id) {
 			var objectToCreateFile = {
 				idFolder: object.idFolder,
 				idObject: response.id,
 				objectType: "DFG::AN3"

 			};
 			fileCRUDFNew.createFile(objectToCreateFile);
 		}
 		var logRegister = new logDFG();
 		logRegister.createAN3(response);
 	} catch (e) {
 		$.messageCodes.push({
 			"code": "DFG215008",
 			"type": "E",
 			errorInfo: util.parseError(e)
 		});
 	}
 	return response;
 };
 /**
  * @param {object} object - Endpoint object
  * @param {number} object.idAN3
  * @param {object} object.report
  * @param {string} object.name
  * @param {string} object.description
  **/
 this.createAN3Report = function(object) {
 	var response;
 	try {
 		if (!getAccess("createReport")) {
 			$.messageCodes.push({
 				"code": "DFG215016",
 				"type": "E"
 			});
 			return response;
 		}
 		response = modelAN3Report.createAN3Report(object);
 	} catch (e) {
 		$.messageCodes.push({
 			"code": "DFG215017",
 			"type": "E",
 			errorInfo: util.parseError(e)
 		});
 	}
 	return response;
 };
 /**
 * @param{object} object - Endpoint parameter
 * @param{string} object.name
 * @param{string} object.description

 */
 this.update = function(object) {
 	var response;
 	try {
 		if (!getAccess("update")) {
 			$.messageCodes.push({
 				"code": "DFG215001",
 				"type": "E"
 			});
 			return response;
 		}
 		var where = [{
 			field: "id",
 			oper: "=",
 			value: object.id
		}];
 		response = an3.updateAN3(object, where);

 	} catch (e) {
 		$.messageCodes.push({
 			"code": "DFG215009",
 			"type": "E",
 			errorInfo: util.parseError(e)
 		});
 	}
 	return response;
 };
 /**
  * @param {object} searchParams - endPoint Filters
  * @param {array} where - query Where Clause
  * @param {number} searchParams.rule - idRule
  * @param {date}  searchParams.creationDateFrom - first range for the creationDate clause
  * @param {date} searchParams.creationDateTo - second range for the creationDate clause
  * @param {date}  searchParams.modificationDateFrom - first range for the modificationDate clause
  * @param {date} searchParams.modificationDateTo - second range for the modificationDate clause
  **/
 this.evalSearchParams = function(searchParams, where) {
 	for (var i in searchParams) {
 		if (this.searchKeys[i] !== "creationDate" && this.searchKeys[i] !== "modificationDate") {
 			where.push({
 				field: this.searchKeys[i],
 				oper: i === "name" ? "LIKE" : "=",
 				value: i === "name" ? ("%" + searchParams[i] + "%") : searchParams[i]
 			});
 		} else {
 			var date = searchParams[i].split("T")[0];
 			where.push({
 				field: this.searchKeys[i],
 				oper: (i === "creationDateFrom" || i === "modificationDateFrom") ? ">=" : "<=",
 				value: date
 			});
 		}

 	}
 };

 /**
  * @param {object} object - Endpoint parameter.
  * @param {number array} object.idObject - Array of file IDs
  * @return {object array} response - Array with all files added to favorites
  */
 this.setFavorite = function(object) {
 	 var unFavorites = [];
        var favorites = [];
        for(var element = 0; element < object.ids.length; element++){
            if(object.ids[element].status){
                favorites.push(object.ids[element].id);
            }else{
                unFavorites.push(object.ids[element].id);
            }
        }
        var result = {};
        if(unFavorites.length){
        	result.favorites =  fileCRUDFNew.markFavorite({
        		objectType: "DFG::AN3",
        		idObject: unFavorites
        	});
        }
        if(favorites.length){
            result.unFavorites = fileCRUDFNew.unmarkFavorite({
        		objectType: "DFG::AN3", 
        		idObject: favorites
        	});
        } 
        return result;
 };

 /**
  * @param {object} object - Endpoint parameter.
  * @param {number array} object.idObject - Array of file IDs
  * @return {object array} response - Array with all files removed from favorites
  */
 this.removeFavorite = function(object) {
 	return fileCRUDFNew.unmarkFavorite({
 		objectType: "DFG::AN3",
 		idObject: object.idObject
 	});
 };

 this.updateFile = function(object) {
 	var response;
 	try {
 		switch (object.status) {
 			case 1:
 				{
 					if (!getAccess("restore")) {
 						$.messageCodes.push({
 							"code": "DFG215004",
 							"type": "E"
 						});
 						return response;
 					}
 					break;
 				}
 			case 2:
 				{
 					if (!getAccess("trash")) {
 						$.messageCodes.push({
 							"code": "DFG215006",
 							"type": "E"
 						});
 						return response;
 					}
 					break;
 				}
 			case 3:
 				{
 					if (!getAccess("delete")) {
 						$.messageCodes.push({
 							"code": "DFG215005",
 							"type": ""
 						});
 						return response;
 					}
 				}
 		}
 		object.objectType = "DFG::AN3";
 		response = fileCRUDFNew.updateFileStatus(object);
 	} catch (e) {
 		$.trace.error(e);
 		$.messageCodes.push({
 			code: "DFG215009",
 			"type": "E",
 			errorInfo: util.parseError(e)
 		});
 	}
 	return response;
 };
 /**
  * @param {string} objectType - Name of the object that you need.
  * @return {number} - ID of object in CORE::ObjectType
  */

 this.filters = function(object) {
 	object = object || $.request.parameters.get("object");
 	if (typeof object === "string") {
 		object = JSON.parse(object);
 	}

 	var response = {
 		company: companyBranches.getCompanyBranchesFilter(),
//  		company: controllerExternal.listCompany(),
//  		UF: controllerExternal.listUF(),
//  		branch: controllerExternal.listBranch(),
 		tax: controllerExternal.listTax(),
 		origin: [{
 			id: 1,
 			name: "DFG"
		}, {
 			id: 2,
 			name: "External"
		}],
 		users: user.listAllUsers()
 	};
 	return response;
 };

 //--------------------------EXECUTOR ---------------------------------------------------------// (KBARA 04-11-2016)
 /**
  * @param {object} object - Endpoint parameter
  * @param {string} origin - DFG/EXTERNAL
  * @param {number | optional} idDigitalFile
  * @param {number | optional} idExternalFile
  * @param {number array} idRule - Array of all rules
  * @param {number array} idLayoutVersion - version of the AN3's Layout
  **/

 this.allRules = {};
 this.allRulesParams = {};
 this.rule_cache = {};
 this.structure_cache = {};
 this.structure_dimensions = {};
 this.structure_types = {};
 this.structure_hanaName = {};
 this.ruleError = "";
 this.execute = function(object) {
 	try {
 		var layoutVersion = modelLayoutVersiontable.READ({
 			fields: ["json"],
 			where: [{
 				field: "id",
 				oper: "=",
 				value: object.idLayoutVersion
				}]
 		})[0];
 		var layoutJSON = JSON.parse(layoutVersion.json);
 		var digitalFile;
 		var type = 1;
 		var structures = [];
 		var requiredFieldsStructure = {};
 		for (var b in layoutJSON.blocks) {
 			for (var r in layoutJSON.blocks[b].records) {
 				for (var c in layoutJSON.blocks[b].records[r].columns) {
 					if (layoutJSON.blocks[b].records[r].columns[c].fieldId != null && !isNaN(parseInt(layoutJSON.blocks[b].records[r].columns[c].fieldId,
 						10))) {
 						if (structures.indexOf(layoutJSON.blocks[b].records[r].columns[c].idStructure) === -1 && layoutJSON.blocks[b].records[r].columns[c].idStructure) {
 							structures.push(layoutJSON.blocks[b].records[r].columns[c].idStructure);

 						}
 						if (!requiredFieldsStructure[layoutJSON.blocks[b].records[r].columns[c].idStructure]) {
 							requiredFieldsStructure[layoutJSON.blocks[b].records[r].columns[c].idStructure] = {
 								fields: []
 							};
 						}
 						if (requiredFieldsStructure[layoutJSON.blocks[b].records[r].columns[c].idStructure].fields.indexOf(layoutJSON.blocks[b].records[r].columns[
 							c].fieldId) === -1) {
 							requiredFieldsStructure[layoutJSON.blocks[b].records[r].columns[c].idStructure].fields.push(layoutJSON.blocks[b].records[r].columns[
 								c].fieldId);
 						}
 						if (!this.structure_types[layoutJSON.blocks[b].records[r].columns[c].idStructure]) {
 							this.structure_types[layoutJSON.blocks[b].records[r].columns[c].idStructure] = {};
 						}

 					}
 				}
 			}
 		}
 		if (object.hasOwnProperty("origin")) {
 			if (object.origin === "DFG" && object.idDigitalFile) {
 				digitalFile = modelDigitalFile.table.READ({
 					fields: ["digitalFile"],
 					where: [{
 						field: "id",
 						oper: "=",
 						value: object.idDigitalFile
                    }]
 				})[0].digitalFile;
 				digitalFile = JSON.parse(digitalFile).rawFile;
 			} else {
 				digitalFile = modelAN3XExternalFile.READ({
 					fields: ["externalFile"],
 					where: [{
 						field: "id",
 						oper: "=",
 						value: object.idExternalFile
                    }]
 				})[0].externalFile;
 				type = 2;
 				this.fillStructureDimensions(structures, requiredFieldsStructure);
 			}

 		}
 		return this.getExecutionResult({
 			json: layoutJSON,
 			digitalFile: digitalFile,
 			idRule: object.idRule,
 			type: type
 		});
 	} catch (e) {
 		$.trace.error(e);
 		$.messageCodes.push({
 			code: 'DFG215010',
 			type: "E",
 			errorInfo: util.parseError(e)
 		});
 		return this.ruleError;
 	}
 	return {};
 };
 this.fillStructureDimensions = function(structures, requiredFields) {
 	var structure;
 	var lang = ($.request.cookies.get("Content-Language") === "enus") ? "enus" : "ptrbr";
 	var query = {};
 	var structure_dimensions = {};
 	var structure_types = {};
 	var structure_hanaName = {};
 	var dimensions;
 	var fields = [];

 	for (var i = 0; i < structures.length; i++) {
 		structure = modelStructure.getStructure(structures[i]);
 		this.structure_cache[structures[i]] = structure;
 		if (requiredFields[structures[i]] && requiredFields[structures[i]].fields.length > 0) {
 			structure_types[structures[i]] = {};
 			structure_hanaName[structures[i]] = {};
 			requiredFields[structures[i]].fields.map(function(f) {
 				for (var p = 0; p < structure.fields.length; p++) {
 					if (structure.fields[p].ID === parseInt(f, 10)) {
 						structure_hanaName[structures[i]][structure.fields[p].ID] = structure.fields[p].hanaName;
 						fields.push("\'" + structure.fields[p].hanaName + "\'");
 						structure_types[structures[i]][f] = structure.fields[p].type;
 						break;
 					}
 				}
 			});
 			query.query = "SELECT COLUMN_NAME, LENGTH FROM VIEW_COLUMNS WHERE SCHEMA_NAME='_SYS_BIC' AND VIEW_NAME=\'" + structure.hanaPackage +
 				"/" + structure.hanaName + "\'";
 			query.query += " AND COLUMN_NAME IN (" + fields.toString() + ")";
 			dimensions = sql.SELECT(query);
 			structure_dimensions[structures[i]] = {};
 			dimensions.map(function(d) {
 				structure_dimensions[structures[i]][d[0]] = d[1];
 			});
 		}

 	}
 	this.structure_types = structure_types;
 	this.structure_dimensions = structure_dimensions;
 	this.structure_hanaName = structure_hanaName;
 };
 this.getExecutionResult = function(object) {
 	var json = object.json;
 	var result;
 	var digitalFile = object.digitalFile;
 	var type = object.type;
 	var idRule = object.idRule;
 	var lines = digitalFile.split("\r\n");
 	var blockDataResponse = this.getBlockData({
 		json: json,
 		type: type,
 		lines: lines
 	});
 	var blockData = blockDataResponse.blockData;
 	var lineMapping = blockDataResponse.lineMapping;
 	this.fillRuleCache(idRule);
 	this.formatValues(blockData,json);
 	result = this.evaluateAN3Rules(blockData);

 	return {
 		rulesResult: result,
 		blocksData: blockData,
 		lineMapping: lineMapping
 	};
 };
 this.getBlockData = function(object) {
 	var json = object.json;
 	var type = object.type;
 	var separator = json.separator;
 	if (type === 1) {
 		separator.value = separator.value + String.fromCharCode(8204);
 	}
 	var response = {};
 	var lines = object.lines;
 	var line;
 	var index = 0;
 	var index2 = 0;
 	var block, record;
 	var recordXColumns;
 	var lineTemp, columns, recordPositions;
 	var lineMapping = {};
 	var actualBlock, actualRecord;
 	var blockPositions = json.positions;
 	var actualBlock = blockPositions[0];
 	var recordPositions = json.blocks[actualBlock].positions;
 	var actualRecord = recordPositions[0];
 	var identified;
 	for (index; index < lines.length - 1; index++) {
 		line = lines[index];
 		if (type === 1) { //If the digitalFile is generated by DFG
 			lineTemp = line.split("&&::");
 			block = lineTemp[1].split("&:")[0];
 			record = lineTemp[1].split("&:")[1];
 			line = lineTemp[0];
 			lineMapping[index] = block + "." + record;
 		} else { //MUST FIND A WAY TO IDENTIFY BLOCK AND RECORD FOR EXTENRAL DIGITALFILES

 			if (separator.value !== "") {
 				var columns = line.split(separator.value);
 				if (separator.inFirst) {
 					columns.splice(0, 1);
 				}
 				if (separator.inLast) {
 					columns.splice(columns.length - 1, 1);
 				}
 				identified = this.identifyRecordbyColumns(columns, json, actualBlock, actualRecord, lines.length - 1);
 			} else {
 				identified = this.identifyRecord(line, json, actualBlock, actualRecord, lines.length - 1);
 			}
 			if (!identified) {
 				continue;
 			} else {
 				block = identified.actualBlock;
 				record = identified.actualRecord;
 				lineMapping[index] = block + "." + record;
 				actualBlock = identified.actualBlock;
 				actualRecord = identified.actualRecord;
 			}
 		}
 		if (!response[block]) {
 			response[block] = {
 				records: {

 				}
 			};
 		}
 		if (!response[block].records[record]) {
 			response[block].records[record] = {
 				lines: {}
 			};
 		}
 		if (identified) {
 			response[block].records[record].lines[index] = identified.lineValues;
 			continue;
 		}
 		columns = line.split(separator.value);
 		recordPositions = json.blocks[block].records[record].positions;
 		recordXColumns = json.blocks[block].records[record].columns;
 		if (separator.inFirst) {
 			columns.splice(0, 1);
 		}
 		if (separator.inLast) {
 			columns.splice(columns.length - 1, 1);
 		}
 		response[block].records[record].lines[index] = {};
 		index2 = 0;
 		for (index2; index2 < recordPositions.length; index2++) {
 			response[block].records[record].lines[index][recordPositions[index2]] = columns[index2];
 		}
 	}
 	return {
 		blockData: response,
 		lineMapping: lineMapping
 	};

 };
 this.identifyRecord = function(line, json, actualBlock, actualRecord, totalLines) {
 	var lineTotalDimension = line.length;
 	var recordDimension = 0;
 	var columnPositions = json.blocks[actualBlock].records[actualRecord].positions;
 	var columns = json.blocks[actualBlock].records[actualRecord].columns;
 	var size = 0;
 	var format = json.format;
 	var numberFormat = null;
 	var stringFormat = null;
 	var dateFormat = null;
 	if (json.blocks[actualBlock].format && json.blocks[actualBlock].format !== null) {
 		format = json.blocks[actualBlock].format;
 		if (format.number !== null) {
 			numberFormat = format.number;
 		}
 		if (format.string !== null) {
 			stringFormat = format.string;
 		}
 		if (format.date !== null) {
 			dateFormat = format.date;
 		}
 	}
 	if (json.blocks[actualBlock].records[actualRecord].format && json.blocks[actualBlock].records[actualRecord].format !== null) {
 		format = json.blocks[actualBlock].records[actualRecord].format;
 		if (format.number !== null) {
 			numberFormat = format.number;
 		}
 		if (format.string !== null) {
 			stringFormat = format.string;
 		}
 		if (format.date !== null) {
 			dateFormat = format.date;
 		}
 	}

 	var columnType;
 	var hanaName;
 	var initialIndex = 0;
 	var finalIndex = 1;
 	var position = 0;

 	var column = columns[columnPositions[position]];
 	var values = {};
 	var correctRecord = true;
 	var isNewLine = false;
 	do {
 		correctRecord = true;
 		while (finalIndex < line.length && position < columnPositions.length && correctRecord) {
 			if (column.recordId) {
 				var recordName = "";
 				if (typeof column.recordId === "object") {
 					if (column.recordId.blockId) {
 						recordName += json.blocks[actualBlock].name;
 					}
 					if (column.recordId.recordId) {
 						recordName += json.blocks[actualBlock].records[actualRecord].name;
 					}
 				} else {
 					recordName += json.blocks[actualBlock].records[actualRecord].name;
 				}
 				finalIndex += recordName.length - 1;
 				if (finalIndex > line.length || line.substring(initialIndex, finalIndex) !== recordName) {
 					correctRecord = false;
 				} else {
 					values[columnPositions[position]] = recordName;
 					position++;
 					initialIndex = finalIndex;
 					finalIndex++;
 					if (columnPositions.length !== position) {
 						column = columns[columnPositions[position]];
 					}

 				}
 			} else if (column.fieldId !== null && !isNaN(parseInt(column.fieldId, 10))) {
 				columnType = this.structure_types[column.idStructure][column.fieldId];
 				switch (columnType) {
 					case "NVARCHAR":
 					case "VARCHAR":
 						columnType = "string";
 						break;
 					case "DECIMAL":
 					case "INTEGER":
 						columnType = "number";
 						break;
 					case "TIMESTAMP":
 						columnType = "date";
 						break;
 				}
 				var size = 0;
 				var temp;
 				if (column.format && column.format !== null) {
 					temp = getSize(columnType, {
 						number: column.format.number !== null ? column.format.number : numberFormat,
 						string: column.format.string !== null ? column.format.string : stringFormat,
 						date: column.format.date !== null ? column.format.date : dateFormat
 					});
 					if (!temp) {
 						hanaName = this.structure_hanaName[column.idStructure][column.fieldId];
 						size = parseInt(this.structure_dimensions[column.idStructure][hanaName], 10);
 					} else {
 						size = parseInt(temp, 10);
 					}
 				} else {
 					temp = getSize(columnType, {
 						number: numberFormat,
 						string: stringFormat,
 						date: dateFormat
 					});
 					if (!temp) {
 						hanaName = this.structure_hanaName[column.idStructure][column.fieldId];
 						size = parseInt(this.structure_dimensions[column.idStructure][hanaName], 10);
 					} else {
 						size = parseInt(temp, 10);
 					}
 				}
 				finalIndex += size - 1;
 				if (finalIndex > line.length) {
 					correctRecord = false;
 				} else {
 					values[columnPositions[position]] = line.substring(initialIndex, finalIndex);
 					position++;
 					if (columnPositions.length !== position) {
 						column = columns[columnPositions[position]];
 					}
 					initialIndex = finalIndex;
 					finalIndex++;
 				}
 			} else if (column.filler) {
 				finalIndex += column.filler.value.length - 1;
 				if (finalIndex > line.index || line.substring(initialIndex, finalIndex) !== column.filler.value) {
 					correctRecord = false;
 				} else {
 					values[columnPositions[position]] = column.filler.value;
 					position++;
 					initialIndex = finalIndex;
 					finalIndex++;
 					if (columnPositions.length !== position) {
 						column = columns[columnPositions[position]];
 					}

 				}
 			} else if (column.isReferencePeriod || column.finalDateReference || column.initialDateReference || column.fieldId === "DTE") {
 				var size = 0;
 				var separatorCount = -1;
 				if (column.format && column.format !== null && column.format.date !== null) {
 					if (column.format.date.day !== "blank") {
 						size += column.format.date.day.length;
 						separatorCount++;
 					}
 					if (column.format.date.month !== "blank") {
 						size += column.format.date.month.length;
 						separatorCount++;
 					}
 					if (column.format.date.year !== "blank") {
 						size += column.format.date.year.length;
 						separatorCount++;
 					}
 					if (column.format.date.separator !== "" && separatorCount !== -1) {
 						size += separatorCount;
 					}
 				} else {
 					if (dateFormat && dateFormat !== null) {
 						if (dateFormat.day !== "blank") {
 							size += dateFormat.day.length;
 							separatorCount++;
 						}
 						if (dateFormat.month !== "blank") {
 							size += dateFormat.month.length;
 							separatorCount++;
 						}
 						if (dateFormat.year !== "blank") {
 							size += dateFormat.year.length;
 							separatorCount++;
 						}
 						if (dateFormat.separator !== "" && separatorCount !== -1) {
 							size += separatorCount;
 						}
 					} else {
 						correctRecord = false;
 					}
 				}
 				if (correctRecord) {
 					finalIndex += size - 1;
 					if (finalIndex > line.length) {
 						correctRecord = false;
 					} else {
 						values[columnPositions[position]] = line.substring(initialIndex, finalIndex);
 						position++;
 						if (columnPositions.length !== position) {
 							column = columns[columnPositions[position]];
 						}
 						initialIndex = finalIndex;
 						finalIndex++;
 					}
 				}

 			} else if (column.fixedManualField) {
 				var found = false;
 				for (var o = 0; o < column.fixedManualField.options.length; o++) {
 					if (line.substring(initialIndex, finalIndex + column.fixedManualField.options[o].option.length - 1) === column.fixedManualField.options[
 						o].option) {
 						found = true;
 						values[columnPositions[position]] = line.substring(initialIndex, finalIndex + column.fixedManualField.options[o].option.length - 1);
 						initialIndex = finalIndex + column.fixedManualField.options[o].option.length - 1;
 						finalIndex += column.fixedManualField.options[o].option.length;
 						break;
 					}
 				}
 				if (!found && column.fixedManualField.required) {
 					correctRecord = false;
 				} else {
 					position++;
 					if (columnPositions.length !== position) {
 						column = columns[columnPositions[position]];
 					}
 				}

 			} else if (column.manualParam) {
 				finalIndex += parseInt(column.manualParam.length, 10) - 1;
 				if (finalIndex > line.length) {
 					correctRecord = false;
 				} else {
 					values[columnPositions[position]] = line.substring(initialIndex, finalIndex);
 					position++;
 					if (columnPositions.length !== position) {
 						column = columns[columnPositions[position]];
 					}
 					initialIndex = finalIndex;
 					finalIndex++;
 				}
 			} else if (column.isTotalsAll) {
 				finalIndex += ("" + totalLines).length - 1;
 				if (finalIndex > line.length && line.substring(initialIndex, finalIndex) !== "" + totalLines) {
 					correctRecord = false;
 				} else {
 					values[columnPositions[position]] = line.substring(initialIndex, finalIndex);
 					position++;
 					if (columnPositions.length !== position) {
 						column = columns[columnPositions[position]];
 					}
 					initialIndex = finalIndex;
 					finalIndex++;
 				}
 			} else if (column.version) {
 				finalIndex += column.version.label.length - 1;
 				if (finalIndex > line.length || column.version.label !== line.substring(initialIndex, finalIndex)) {
 					correctRecord = false;
 				} else {
 					values[columnPositions[position]] = line.substring(initialIndex, finalIndex);
 					position++;
 					if (columnPositions.length !== position) {
 						column = columns[columnPositions[position]];
 					}
 					initialIndex = finalIndex;
 					finalIndex++;
 				}
 			} else if (column.fieldId === "HRE") {
 				var size = 0;
 				var separatorCount = -1;
 				if (column.format && column.format !== null && column.format.hour !== null) {
 					if (column.format.hour.day !== "blank") {
 						size += column.format.hour.day.length;
 						separatorCount++;
 					}
 					if (column.format.hour.month !== "blank") {
 						size += column.format.hour.month.length;
 						separatorCount++;
 					}
 					if (column.format.hour.year !== "blank") {
 						size += column.format.hour.year.length;
 						separatorCount++;
 					}
 					if (column.format.hour.separator !== "" && separatorCount !== -1) {
 						size += separatorCount;
 					}
 				} else {
 					correctRecord = false;
 				}
 				if (correctRecord) {
 					finalIndex += size - 1;
 					if (finalIndex > line.length) {
 						correctRecord = false;
 					} else {
 						values[columnPositions[position]] = line.substring(initialIndex, finalIndex);
 						position++;
 						if (columnPositions.length !== position) {
 							column = columns[columnPositions[position]];
 						}
 						initialIndex = finalIndex;
 						finalIndex++;
 					}
 				}
 			} else if (column.formula) {
 				columnType = column.formula.type;
 				switch (columnType) {
 					case "NVARCHAR":
 					case "VARCHAR":
 						columnType = "string";
 						break;
 					case "DECIMAL":
 					case "INTEGER":
 						columnType = "number";
 						break;
 					case "TIMESTAMP":
 						columnType = "date";
 						break;
 				}
 				var size = 0;
 				var temp;
 				if (column.format && column.format !== null) {
 					temp = getSize(columnType, {
 						number: column.format.number !== null ? column.format.number : numberFormat,
 						string: column.format.string !== null ? column.format.string : stringFormat,
 						date: column.format.date !== null ? column.format.date : dateFormat
 					});
 					if (!temp) {
 						correctRecord = false;
 					} else {
 						size = parseInt(temp, 10);
 					}
 				} else {
 					temp = getSize(columnType, {
 						number: numberFormat,
 						string: stringFormat,
 						date: dateFormat
 					});
 					if (!temp) {
 						correctRecord = false;
 					} else {
 						size = parseInt(temp, 10);
 					}
 				}
 				if (correctRecord) {
 					finalIndex += size - 1;
 					if (finalIndex > line.length) {
 						correctRecord = false;
 					} else {
 						values[columnPositions[position]] = line.substring(initialIndex, finalIndex);
 						position++;
 						if (columnPositions.length !== position) {
 							column = columns[columnPositions[position]];
 						}
 						initialIndex = finalIndex;
 						finalIndex++;
 					}
 				}
 			} else if (column.output || column.sequenceField || column.isRecordsTotals || column.isBlocksTotals) {
 				var size = 0;
 				var temp;
 				if (column.format && column.format !== null) {
 					temp = getSize("number", {
 						number: column.format.number !== null ? column.format.number : numberFormat,
 						string: column.format.string !== null ? column.format.string : stringFormat,
 						date: column.format.date !== null ? column.format.date : dateFormat
 					});
 					if (!temp) {
 						correctRecord = false;
 					} else {
 						size = parseInt(temp, 10);
 					}
 				} else {
 					temp = getSize("number", {
 						number: numberFormat,
 						string: stringFormat,
 						date: dateFormat
 					});
 					if (!temp) {
 						correctRecord = false;
 					} else {
 						size = parseInt(temp, 10);
 					}
 				}
 				if (correctRecord) {
 					finalIndex += size - 1;
 					if (finalIndex > line.length) {
 						correctRecord = false;
 					} else {
 						values[columnPositions[position]] = line.substring(initialIndex, finalIndex);
 						position++;
 						if (columnPositions.length !== position) {
 							column = columns[columnPositions[position]];
 						}
 						initialIndex = finalIndex;
 						finalIndex++;
 					}
 				}
 			} else if (column.fixedField) {
 				var found = false;
 				for (var o = 0; o < column.fixedField.values.length; o++) {
 					if (line.substring(initialIndex, finalIndex + column.fixedField.values[o].length - 1) === column.fixedField.values[
 						o]) {
 						found = true;
 						values[columnPositions[position]] = line.substring(initialIndex, finalIndex + column.fixedField.values[o].length - 1);
 						initialIndex = finalIndex + column.fixedField.values[o].length - 1;
 						finalIndex += column.fixedField.values[o].length;
 						break;
 					}
 				}
 				if (!found) {
 					correctRecord = false;
 				} else {
 					position++;
 					if (columnPositions.length !== position) {
 						column = columns[columnPositions[position]];
 					}
 				}
 			} else {
 				correctRecord = false;
 			}

 		}
 		if (finalIndex < line.length) {
 			correctRecord = false;
 		}
 		initialIndex = 0;
 		finalIndex = 1;
 		if (columnPositions.length - 1 > position) {
 			for (position; position < columnPositions.length; position++) {
 				column = columns[columnPositions[position]];
 				if (column.isLineBreak) {
 					isNewLine = true;
 					break;
 				}
 			}

 		}
 		if (!correctRecord && !isNewLine) {
 			position = 0;
 			var indexRecord = json.blocks[actualBlock].positions.indexOf(actualRecord);
 			if (indexRecord === json.blocks[actualBlock].positions.length - 1) {
 				var indexBlock = json.positions.indexOf(actualBlock);
 				if (indexBlock === json.positions.length - 1) {
 					correctRecord = false;
 					actualBlock++;
 					actualRecord++;
 				} else {
 					actualBlock = json.positions[indexBlock + 1];
 					actualRecord = json.blocks[actualBlock].positions[0];
 				}
 			} else {
 				actualRecord = json.blocks[actualBlock].positions[indexRecord + 1];
 			}
 			if (json.blocks[actualBlock] && json.blocks[actualBlock].records[actualRecord]) {
 				columnPositions = json.blocks[actualBlock].records[actualRecord].positions;
 				columns = json.blocks[actualBlock].records[actualRecord].columns;
 				column = columns[columnPositions[position]];
 			}
 		} else {
 			if (isNewLine && !correctRecord) {
 				position++;
 				if (position === columnPositions.length) {
 					position = 0;
 					var indexRecord = json.blocks[actualBlock].positions.indexOf(actualRecord);
 					if (indexRecord === json.blocks[actualBlock].positions.length - 1) {
 						var indexBlock = json.positions.indexOf(actualBlock);
 						if (indexBlock === json.positions.length - 1) {
 							correctRecord = false;
 						} else {
 							actualBlock = json.positions[indexBlock + 1];
 							actualRecord = json.blocks[actualBlock].positions[0];
 						}
 					} else {
 						actualRecord = json.blocks[actualBlock].positions[indexRecord + 1];
 					}
 					if (json.blocks[actualBlock].records[actualRecord]) {
 						columnPositions = json.blocks[actualBlock].records[actualRecord].positions;
 						columns = json.blocks[actualBlock].records[actualRecord].columns;
 						column = columns[columnPositions[position]];
 					}
 				} else {
 					column = columns[columnPositions[position]];
 					isNewLine = false;
 				}
 			}
 		}
 		if (!correctRecord) {
 			values = {};
 		}
 	} while (!correctRecord && json.blocks[actualBlock] && json.blocks[actualBlock].records[actualRecord]);
 	if (correctRecord) {
 		return {
 			actualBlock: actualBlock,
 			actualRecord: actualRecord,
 			lineValues: values
 		};
 	}

 };
 this.identifyRecordbyColumns = function(columns, json, actualBlock, actualRecord, totalLines) {
 	var recordDimension = 0;
 	var actualColumnPositions = json.blocks[actualBlock].records[actualRecord].positions;
 	var actualColumns = json.blocks[actualBlock].records[actualRecord].columns;
 	var size = 0;
 	var values = {};
 	var correctRecord = true;
 	var isNewLine = false;
 	var positionIndex = 0;
 	var newLineIndex;
 	do {
 		correctRecord = false;
 		values = {};
 		newLineIndex = actualColumnPositions.indexOf("newline", positionIndex);
 		if (newLineIndex > -1) {
 			if (newLineIndex - positionIndex === columns.length) {
 				for (var i = positionIndex; i < newLineIndex; i++) {
 					values[actualColumnPositions[i]] = columns[i - positionIndex];
 				}
 				correctRecord = true;
 			} else {
 				positionIndex = newLineIndex + 1;
 			}
 		} else {
 			if (actualColumnPositions.length - positionIndex === columns.length) {
 			    
 				for (var i = positionIndex; i < actualColumnPositions.length; i++) {
 					values[actualColumnPositions[i]] = columns[i - positionIndex];
 				}
 				var recordIdColumn = actualColumnPositions.toString().match(new RegExp(/recordId[0-9]+/g));
 			    if(recordIdColumn){
 			        var positionRecordColumn = actualColumnPositions.indexOf(recordIdColumn[0]);
 			        if(positionRecordColumn !== -1){
 			            if(columns[positionRecordColumn-positionIndex] !== json.blocks[actualBlock].records[actualRecord].name){
 			                correctRecord = false;
 			                positionIndex = actualColumnPositions.length + 1;
 			            }else{
 			                correctRecord = true;
 			            }
 			        }else{
 			            correctRecord = true;
 			        }
 			    }else{
 			        correctRecord = true;
 			    }
 				
 			} else {
 				positionIndex = actualColumnPositions.length + 1;
 			}
 		}
 		if (!correctRecord) {
 			if (positionIndex >= actualColumnPositions.length) {
 				positionIndex = 0;
 				var indexRecord = json.blocks[actualBlock].positions.indexOf(actualRecord);
 				if (indexRecord === json.blocks[actualBlock].positions.length - 1) {
 					var indexBlock = json.positions.indexOf(actualBlock);
 					if (indexBlock === json.positions.length - 1) {
 						correctRecord = false;
 						actualBlock++;
 						actualRecord++;
 					} else {
 						actualBlock = json.positions[indexBlock + 1];
 						actualRecord = json.blocks[actualBlock].positions[0];
 					}
 				} else {
 					actualRecord = json.blocks[actualBlock].positions[indexRecord + 1];
 				}
 				if (json.blocks[actualBlock] && json.blocks[actualBlock].records[actualRecord]) {
 					actualColumnPositions = json.blocks[actualBlock].records[actualRecord].positions;
 				}
 			}
 		}
 	} while (!correctRecord && json.blocks[actualBlock] && json.blocks[actualBlock].records[actualRecord]);
 	if (correctRecord) {
 		return {
 			actualBlock: actualBlock,
 			actualRecord: actualRecord,
 			lineValues: values
 		};
 	}

 };

 function getSize(type, format) {

 	if (type == "number") {
 		if (format && format != null && format.number !== null && format.number.size != "") {
 			return format.number.size;
 		} else {
 			return;
 		}
 	}
 	if (type == "string") {
 		if (format && format != null && format.string !== null && format.string.size != "") {
 			return format.string.size;
 		} else {
 			return;
 		}
 	}
 	if (type == "date") {
 		if (format && format != null && format.date !== null && format.date.size != "") {
 			return format.date.size;
 		} else {
 			return;
 		}
 	}
 }
 this.fillRuleCache = function(AN3Rules) {
 	for (var i = 0; i < AN3Rules.length; i++) {
 		if (!this.rule_cache[AN3Rules[i]]) {
 			this.rule_cache[AN3Rules[i]] = rulesModel.getRule(Number(AN3Rules[i]));
 		}
 		this.allRules[AN3Rules[i]] = this.rule_cache[AN3Rules[i]];
 		this.allRulesParams[AN3Rules[i]] = this.allRules[AN3Rules[i]].getParameters();
 	}
 };
 this.evaluateAN3Rules = function(parsedData) {
 	var ruleResults = {};
 	var rule, path;
 	for (rule in this.allRules) {
 		if (this.allRules.hasOwnProperty(rule)) {
 			ruleResults[rule] = {
 				pathResults: {},
 				name: this.allRules[rule].name
 			};
 			for (path = 0; path < this.allRules[rule].paths.length; path++) {
 				ruleResults[rule].pathResults[path] = this.comparePath(this.allRules[rule].paths[path], parsedData);
 			}
 		}
 	}

 	//Evaluate each rule, compare each line

 	return ruleResults;
 };
 this.comparePath = function(path, parsedData) {
 	var result = {};
 	var condition;
 	var messageResult = {};
 	var pathComparisons = {};
 	for (condition = 0; condition < path.conditions.length; condition++) {
 		pathComparisons[condition] = {};
 		var res = this.compareConditions(path.conditions[condition], parsedData, pathComparisons[condition]);
 		result[condition] = res.result;
 		pathComparisons[condition] = res.conditionData;
 	}

 	var conflictLine, conflictLine2;
 	var allLines = [];
 	for (var r in result) {
 		for (var c in result[r]) {
 			if (c.split(".").length > 1) {
 				conflictLine = c.split(".")[1];
 			} else {
 				conflictLine = "*";
 			}
 			if (!messageResult[c.split(".")[0]]) {
 				messageResult[c.split(".")[0]] = {
 					message: "",
 					conflictLines: {},
 					isValid: {}
 				};
 			}
 			if (allLines.indexOf(c.split(".")[0]) === -1) {
 				allLines.push(c.split(".")[0]);
 			}
 			if (conflictLine && !messageResult[c.split(".")[0]].conflictLines[conflictLine]) {
 				messageResult[c.split(".")[0]].conflictLines[conflictLine] = [];
 				messageResult[c.split(".")[0]].isValid[conflictLine] = result[r][c];
 			}
 			messageResult[c.split(".")[0]].conflictLines[conflictLine].push(pathComparisons[r].lines[conflictLine === "*" ? c + ".*" : c]);
 			messageResult[c.split(".")[0]].isValid[conflictLine] = messageResult[c.split(".")[0]].isValid[conflictLine] && result[r][c];

 		}
 	}
 	for (var line = 0; line < allLines.length; line++) {
 		if (messageResult[allLines[line]] && messageResult[allLines[line]].conflictLines["*"]) {
 			var deleteAllLines = false;
 			for (var valid in messageResult[allLines[line]].isValid) {
 				if (valid !== "*") {
 					messageResult[allLines[line]].isValid[valid] = messageResult[allLines[line]].isValid[valid] && messageResult[allLines[line]].isValid[
 						"*"];
 					messageResult[allLines[line]].conflictLines[valid] = messageResult[allLines[line]].conflictLines[valid].concat(messageResult[allLines[
 						line]].conflictLines["*"]);
 					deleteAllLines = true;
 				}
 			}
 			if (deleteAllLines) {
 				delete messageResult[allLines[line]].isValid["*"];
 				delete messageResult[allLines[line]].conflictLines["*"];
 			}
 		}
 	}
 	var results = {};
 	for (var m in messageResult) {
 		results[m] = {
 			validLines: [],
 			invalidLines: [],
 			validConditions: {},
 			invalidConditions: {},
 			message: path.message.value
 		};
 		for (var v in messageResult[m].isValid) {
 			if (messageResult[m].isValid[v]) {
 				results[m].validLines.push(v);
 				for (var c = 0; c < messageResult[m].conflictLines[v].length; c++) {
 					var condition = messageResult[m].conflictLines[v][c].pa + " " + messageResult[m].conflictLines[v][c].oper + " " + messageResult[m].conflictLines[
 						v][c].pb;
 					if (!results[m].validConditions[c]) {
 						results[m].validConditions[c] = [];

 					}
 					if (results[m].validConditions[c].indexOf(condition) === -1) {
 						results[m].validConditions[c].push(condition);
 					}
 				}
 			} else {
 				results[m].invalidLines.push(v);
 				for (var c = 0; c < messageResult[m].conflictLines[v].length; c++) {
 					var condition = messageResult[m].conflictLines[v][c].pa + " " + messageResult[m].conflictLines[v][c].oper + " " + messageResult[m].conflictLines[
 						v][c].pb;
 					if (!results[m].invalidConditions[c]) {
 						results[m].invalidConditions[c] = [];

 					}
 					if (results[m].invalidConditions[c].indexOf(condition) === -1) {
 						results[m].invalidConditions[c].push(condition);
 					}
 				}
 			}
 		}
 	}

 	return {
 		messageResult: results,
 		pathComparisons: pathComparisons
 	};
 };
 this.formatValues = function(parseData,json){
     for(var b in parseData){
         for(var r in parseData[b].records){
             for(var l in parseData[b].records[r].lines){
                 for(var c in parseData[b].records[r].lines[l]){
                      if(json.blocks[b] &&json.blocks[b].records[r] &&  json.blocks[b].records[r].columns[c] &&json.blocks[b].records[r].columns[c].fieldId !== null && !isNaN(parseInt(json.blocks[b].records[r].columns[c].fieldId,10)) ){
                          if(this.structure_types[json.blocks[b].records[r].columns[c].idStructure] && this.structure_types[json.blocks[b].records[r].columns[c].idStructure][json.blocks[b].records[r].columns[c].fieldId] === "DECIMAL"){
                              parseData[b].records[r].lines[l][c] = parseInt(parseData[b].records[r].lines[l][c],10)+"";
                          }
                          
                      }
                 }
             }
         }
     }
 };
 this.compareConditions = function(condition, parseData, conditionData) {
 	var json = $.request.parameters.get("object");
 	if (typeof json === "string") {
 		json = JSON.parse(json);
 	}
 	conditionData.metadata = {};
 	var pa = condition.pa;
 	var pb = condition.pb;
 	conditionData.metadata.pa = pa.name || pa.value;
 	conditionData.metadata.pb = pb.name || pb.value;
 	conditionData.metadata.oper = condition.oper;
 	conditionData.lines = {};
 	var block1, record1, column1, block2, record2, column2;
 	var blockRecords1, blockRecords2;
 	var oper = condition.oper;
 	var columnKey;
 	var value1, value2;
 	var formulaResult;
 	var result = {};
 	var line1, line2;
 	if (pa.formula) {

 		formulaResult = this.getFormulaResult(pa.formula, parseData);
 		block1 = formulaResult.block;
 		record1 = formulaResult.record;
 		value1 = formulaResult.value;
 		blockRecords1 = formulaResult.blockRecords;
 	} else {
 		if (pa.id) {
 			columnKey = pa.id;
 			block1 = columnKey.split("B")[0];
 			record1 = columnKey.split("B")[1].split("R")[0];
 			if(columnKey.match(new RegExp(/[0-9]+B[0-9]+R[0-9]+S[0-9]+C[0-9]+C/g))){
 			    column1 = columnKey.split("B")[1].split("R")[1].split("C")[0]+"C"+columnKey.split("B")[1].split("R")[1].split("C")[1];
 			}else{
 			    column1 = columnKey.split("B")[1].split("R")[1].split("C")[0];
 			}
 			
 			if (parseData[block1]) {
 				if (parseData[block1].records[record1]) {
 					if (Object.keys(parseData[block1].records[record1].lines).length) {
 						line1 = Object.keys(parseData[block1].records[record1].lines)[0];
 						value1 = parseData[block1].records[record1].lines[line1][column1];
 					}
 				}
 			}
 		} else {
 			value1 = pa.value;
 		}
 	}
 	if (pb.formula) {

 		formulaResult = this.getFormulaResult(pb.formula, parseData);
 		block2 = formulaResult.block;
 		record2 = formulaResult.record;
 		value2 = formulaResult.value;
 		blockRecords2 = formulaResult.blockRecords;

 	} else {
 		if (pb.id) {
 			columnKey = pb.id;
 			block2 = columnKey.split("B")[0];
 			record2 = columnKey.split("B")[1].split("R")[0];
 			if(columnKey.match(new RegExp(/[0-9]+B[0-9]+R[0-9]+S[0-9]+C[0-9]+C/g))){
 			    column2 = columnKey.split("B")[1].split("R")[1].split("C")[0]+"C"+columnKey.split("B")[1].split("R")[1].split("C")[1];
 			}else{
 			    column2 = columnKey.split("B")[1].split("R")[1].split("C")[0];
 			}
 			if (parseData[block2]) {
 				if (parseData[block2].records[record2]) {
 					if (Object.keys(parseData[block2].records[record2].lines).length) {
 						line2 = Object.keys(parseData[block2].records[record2].lines)[0];
 						value2 = parseData[block2].records[record2].lines[line2][column2];
 					}
 				}
 			}
 		} else {
 			value2 = pb.value;
 		}
 	}
 	//FIRST LINE IS EVALUATED THAT WAY, BECAUSE YOU CAN KNOW WHICH BLOCK,RECORD,COLUMN IS BEEN USED - KBARA(07/11/2016)

 	if (block1 === undefined && block2 === undefined) {
 		return result;
 	}
 	if (block1 === undefined) {
 	    var evaluateBlockRecord2 = (function(){
 	        if (!parseData[block2].records[record2]) {
     			this.ruleError = {
     				errorRule: "ERROR WITH RECORD: ",
     				block: block2,
     				record: record2
     			};
     		}
     		for (line2 in parseData[block2].records[record2].lines) {
     			if (pb.formula) {
     				value2 = this.getFormulaResult(pb.formula, parseData, line2).value;
     			} else {
     				value2 = parseData[block2].records[record2].lines[line2][column2];
     			}
    
     			result[line2] = condition.operators[oper](value1, value2);
     			conditionData.lines["*." + line2] = {
     				pa: value1,
     				oper: oper,
     				pb: value2
     			};
     		}
 	    }).bind(this);
 	    if(!blockRecords2 || blockRecords2.length === 0){
     		evaluateBlockRecord2();
 	    }else{
 	        for(var br = 0; br < blockRecords2.length;br++){
 	             block2 = blockRecords2[br].split("_")[0];
 	             record2 = blockRecords2[br].split("_")[1];
 	             evaluateBlockRecord2();
 	        }
 	    }
 	} else {
 		if (block2 === undefined) {
 		    var evaluateBlockRecord1 = (function(){
     			if (!parseData[block1].records[record1]) {
     				this.ruleError = {
     					errorRule: "ERROR WITH RECORD: ",
     					block: block1,
     					record: record1
     				};
     			}
     			//DEJAR ASI!!! NO VALIDAR SI EXISTE EL OBJETO, DEBE DE DAR ERROR 
     			for (line1 in parseData[block1].records[record1].lines) {
     				if (pa.formula) {
     					value1 = this.getFormulaResult(pa.formula, parseData, line1).value;
     				} else {
     					value1 = parseData[block1].records[record1].lines[line1][column1];
     				}
    
     				result[line1] = condition.operators[oper](value1, value2);
     				conditionData.lines[line1 + ".*"] = {
     					pa: value1,
     					oper: oper,
     					pb: value2
     				};
     			}
 		    }).bind(this);
 		    if(!blockRecords1 || blockRecords1.length === 0){
 		        evaluateBlockRecord1();
 		    }else{
 		        for(var br = 0; br < blockRecords1.length; br++){
 		            block1 = blockRecords1[br].split("_")[0];
 		            record1 = blockRecords1[br].split("_")[1];
 		            evaluateBlockRecord1();
 		        }
 		    }
 		} else {
 			delete result[line1];
 			
 			var evaluateNestedBlockRecords2 = (function(){
 			    for (line2 in parseData[block2].records[record2].lines) {
 					if (block2 === block1 && record2 === record1 && line2 === line1) {
 						continue;
 					}
 					if (pb.formula) {
 						value2 = this.getFormulaResult(pb.formula, parseData, line2).value;
 					} else {
 						value2 = parseData[block2].records[record2].lines[line2][column2];
 					}
 					result[line1 + "." + line2] = condition.operators[oper](value1, value2);
 					conditionData.lines[line1 + "." + line2] = {
 						pa: value1,
 						oper: oper,
 						pb: value2
 					};
 				}
 			}).bind(this);
 			var evaluateNestedBlockRecords1 = (function(){
 			    if (!parseData[block1].records[record1]) {
     				this.ruleError = {
     					errorRule: "ERROR WITH RECORD: ",
     					block: block1,
     					record: record1
     				};
     			}
     			for (line1 in parseData[block1].records[record1].lines) {
     				if (pa.formula) {
     					value1 = this.getFormulaResult(pa.formula, parseData, line1).value;
     				} else {
     					value1 = parseData[block1].records[record1].lines[line1][column1];
     				}
     				if (!parseData[block2].records[record2]) {
     					this.ruleError = {
     						errorRule: "ERROR WITH RECORD: ",
     						block: block2,
     						record: record2
     					};
     				}
     				if(!blockRecords2 || blockRecords2.length === 0){
                 		evaluateNestedBlockRecords2();
             	    }else{
             	        for(var br = 0; br < blockRecords2.length;br++){
             	             block2 = blockRecords2[br].split("_")[0];
             	             record2 = blockRecords2[br].split("_")[1];
             	             evaluateNestedBlockRecords2();
             	        }
             	    }
     				
     			}
 			}).bind(this);
 			if(!blockRecords1 || blockRecords1.length === 0){
 		        evaluateNestedBlockRecords1();
 		    }else{
 		        for(var br = 0; br < blockRecords1.length; br++){
 		            block1 = blockRecords1[br].split("_")[0];
 		            record1 = blockRecords1[br].split("_")[1];
 		            evaluateNestedBlockRecords1();
 		        }
 		    }
 		}
 	}
 	return {
 		result: result,
 		conditionData: conditionData
 	};
 };

 this.getFormulaResult = function(formula, parseData, lineIndex) {
 	var json = $.request.parameters.get("object");
 	if (typeof json == "string") {
 		json = JSON.parse(json);
 	}
 	var lang = json.lang;
 	var block1, record1, column1, columnKey;
 	var blockRecords = [];
 	var formulaParams = formula.params;
 	var formulaValues = {};
 	for (var i = 0; i < formulaParams.length; i++) {
 	    if(formulaParams[i].id){
     		columnKey = formulaParams[i].id;
     		block1 = columnKey.match(/[0-9]+B/g)[0].split("B")[0];
     		record1 = columnKey.match(/[0-9]+R/g)[0].split("R")[0];
     		if(blockRecords.indexOf(block1+"_"+record1) === -1){
     		    blockRecords.push(block1+"_"+record1);
     		}
     		column1 = columnKey.split(new RegExp(/[0-9]+B[0-9]+R/g))[1];
     		column1 = column1.substring(0,column1.length-1);
     		if (!lineIndex) {
     			lineIndex = Object.keys(parseData[block1].records[record1].lines)[0];
     		}
     		if (formula.oper === "SUM" || formula.oper === "COUNT") {
     			var values = [];
     			var value;
     			if (parseData[block1]) {
     				if (parseData[block1].records[record1]) {
     					for (var line in parseData[block1].records[record1].lines) {
     						value = parseData[block1].records[record1].lines[line][column1];
     						if (typeof value === "string") {
     							if (lang === "enus") {
     								value = value.replace(",", "");
     							} else {
     								value = value.replace(".", "");
     								value = value.replace(",", ".");
     							}
     							value = parseFloat(value);
     						}
     						values.push(value);
     					}
     				}
     			}
     			if (formula.oper === "COUNT") {
     				formulaValues["S" + columnKey] = values.length;
     			} else {
     				var total = 0;
     				for (var v = 0; v < values.length; v++) {
     					total += values[v];
     				}
     				formulaValues["S" + columnKey] = total;
     			}
    
     		} else {
     			if (parseData[block1]) {
     				if (parseData[block1].records[record1]) {
     					formulaValues["S" + columnKey] = parseData[block1].records[record1].lines[lineIndex][column1];
     				}
     			}
     		}
 	    }else if(formulaParams[i].params){//if it has another formula
 	        var temp = this.getFormulaResult(formulaParams[i],parseData,lineIndex);
 	        for(var fv in temp.formulaValues){
 	            formulaValues[fv] = temp.formulaValues[fv];
 	        }
 	        for(var br = 0; br < temp.blockRecords.length; br++){
 	            if(blockRecords.indexOf(temp.blockRecords[br]) === -1){
 	                blockRecords.push(temp.blockRecords[br]); 
 	            }
 	        }
 	        block1 = block1 || temp.block;
 	        record1 = record1 || temp.record;
 	    } 
 	}
 	return {
 		block: block1,
 		record: record1,
 		value: formula.getValue(formulaValues),
 		blockRecords: blockRecords,
 		formulaValues: formulaValues

 	};
 };
 //--------------------------VIEWER ---------------------------------------------------------// (KBARA 16-11-2016)
 /**
  * @param {object} object - Endpoint parameter
  * @param {string} origin - DFG/EXTERNAL
  * @param {number | optional} idDigitalFile
  * @param {number | optional} idExternalFile
  * @param {number object} eefiData - Array of all rules
  * @param {number array} idDFGLayoutVersion - version of the AN3's Layout
  * @param {number array} idBFBLayout - BFB Layout for AN3's Layout
  **/
 this.visualize = function(object) {
 	try {
 		var layoutVersion = modelLayoutVersiontable.READ({
 			fields: ["json"],
 			where: [{
 				field: "id",
 				oper: "=",
 				value: object.idLayoutVersion
				}]
 		})[0];
 		var eefiData = object.eefiData;
 		var layoutJSON = JSON.parse(layoutVersion.json);
 		var bfbLayout = BFBlayoutModel.table.READ({
 			fields: ["json"],
 			where: [{
 				field: "id",
 				oper: "=",
 				value: object.idBFBLayout
 		    }]
 		})[0];
 		var digitalFile;
 		var type = 1;
 		var bfbLayoutJSON = JSON.parse(bfbLayout.json);
 		var structures = [];
 		var requiredFieldsStructure = {};
 		for (var b in layoutJSON.blocks) {
 			for (var r in layoutJSON.blocks[b].records) {
 				for (var c in layoutJSON.blocks[b].records[r].columns) {
 					if (layoutJSON.blocks[b].records[r].columns[c].fieldId != null && !isNaN(parseInt(layoutJSON.blocks[b].records[r].columns[c].fieldId,
 						10))) {
 						if (structures.indexOf(layoutJSON.blocks[b].records[r].columns[c].idStructure) === -1 && layoutJSON.blocks[b].records[r].columns[c].idStructure) {
 							structures.push(layoutJSON.blocks[b].records[r].columns[c].idStructure);

 						}
 						if (!requiredFieldsStructure[layoutJSON.blocks[b].records[r].columns[c].idStructure]) {
 							requiredFieldsStructure[layoutJSON.blocks[b].records[r].columns[c].idStructure] = {
 								fields: []
 							};
 						}
 						if (requiredFieldsStructure[layoutJSON.blocks[b].records[r].columns[c].idStructure].fields.indexOf(layoutJSON.blocks[b].records[r].columns[
 							c].fieldId) === -1) {
 							requiredFieldsStructure[layoutJSON.blocks[b].records[r].columns[c].idStructure].fields.push(layoutJSON.blocks[b].records[r].columns[
 								c].fieldId);
 						}
 						if (!this.structure_types[layoutJSON.blocks[b].records[r].columns[c].idStructure]) {
 							this.structure_types[layoutJSON.blocks[b].records[r].columns[c].idStructure] = {};
 						}

 					}
 				}
 			}
 		}
 		if (object.hasOwnProperty("origin")) {
 			if (object.origin === "DFG" && object.idDigitalFile) {
 				digitalFile = modelDigitalFile.table.READ({
 					fields: ["digitalFile"],
 					where: [{
 						field: "id",
 						oper: "=",
 						value: object.idDigitalFile
                    }]
 				})[0].digitalFile;
 				digitalFile = JSON.parse(digitalFile).rawFile;
 			} else {
 				digitalFile = modelAN3XExternalFile.READ({
 					fields: ["externalFile"],
 					where: [{
 						field: "id",
 						oper: "=",
 						value: object.idExternalFile
                    }]
 				})[0].externalFile;
 				type = 2;
 				this.fillStructureDimensions(structures, requiredFieldsStructure);
 			}

 		}
 		var lines = digitalFile.split("\r\n");
 		var blockDataResponse = this.getBlockData({
 			json: layoutJSON,
 			type: type,
 			lines: lines
 		});
 		var blockData = blockDataResponse.blockData;
 		var lineMapping = blockDataResponse.lineMapping;
 		var requiredFields = this.getRequiredFieldsBFB(bfbLayoutJSON);
 		var pages = this.getPages(blockData, requiredFields, layoutJSON, eefiData);
 		return pages;
 	} catch (e) {
 		$.trace.error(e);
 		$.messageCodes.push({
 			code: 'DFG215010',
 			type: "E",
 			errorInfo: util.parseError(e)
 		});
 	}
 	return [];
 };
 this.getRequiredFieldsBFB = function(layout) {
 	var requiredFields = {};
 	var fieldId;
 	for (var b = 0; b < layout.blockFields.length; b++) {
 		if (layout.blockFields[b].field) {
 			requiredFields[b] = {};
 			fieldId = layout.blockFields[b].field.id;
 			requiredFields[b].block = fieldId.split("B")[1].split("R")[0]; //Me equivoque con el orden en BFB ...
 			requiredFields[b].record = fieldId.split("B")[1].split("R")[1].split("C")[0];
 			requiredFields[b].column = fieldId.substring(fieldId.indexOf("C") + 1);
 			requiredFields[b].fieldId = fieldId;
 		}
 		if (layout.blockFields[b].formula) {
 			requiredFields[b] = {};
 			requiredFields[b].isFormula = true;
 			requiredFields[b].rawFormula = layout.blockFields[b].formula.raw;
 			requiredFields[b].fields = {};
 			for (var f in layout.blockFields[b].formula.fields) {
 				requiredFields[b].fields[f] = {};
 				if (layout.blockFields[b].formula.fields[f].hanaName) {
 					fieldId = layout.blockFields[b].formula.fields[f].hanaName;
 					requiredFields[b].fields[f].block = fieldId.split("B")[1].split("R")[0];
 					requiredFields[b].fields[f].record = fieldId.split("B")[1].split("R")[1].split("C")[0];
 					requiredFields[b].fields[f].column = fieldId.substring(fieldId.indexOf("C") + 1);
 					requiredFields[b].fields[f].fieldId = fieldId;
 				} else {
 					requiredFields[b].fields[f] = layout.blockFields[b].formula.fields[f];
 				}

 			}
 		}
 	}
 	return requiredFields;
 };
 var obj2list = function(obj) {
 	var list = [];
 	for (var key in obj) {
 		if (obj.hasOwnProperty(key)) {
 			list.push({
 				name: key,
 				val: obj[key]
 			});
 		}
 	}
 	return list;
 };

 var cloneObj = function(obj) {
 	return JSON.parse(JSON.stringify(obj));
 };

 var iterateAndPopulateCombo = function(currentObj, listToIterate, result) {
 	if (listToIterate.length === 0) {
 		result.push(currentObj);
 	} else {
 		listToIterate[0].val.forEach(function(d) {
 			var newObj = cloneObj(currentObj);
 			newObj[listToIterate[0].name] = d;
 			iterateAndPopulateCombo(newObj, listToIterate.slice(1), result);
 		});
 	}
 };
 this.getPages = function(blockData, requiredFields, json, eefiData) {
 	var pages = [];
 	var allValues = {};
 	var page = {};
 	var fieldId = {};
 	var block, record, column, fieldId;
 	var format;
 	for (var r in requiredFields) {
 		if (!requiredFields[r].isFormula) {
 			block = requiredFields[r].block;
 			record = requiredFields[r].record;
 			column = requiredFields[r].column;
 			fieldId = requiredFields[r].fieldId;

 			allValues[fieldId] = [];
 			if (blockData[block].records[record]) {
 				for (var l in blockData[block].records[record].lines) {
 					if (allValues[fieldId].indexOf(blockData[block].records[record].lines[l][column]) < 0 && blockData[block].records[record].lines[l][
 						column]) {
 						allValues[fieldId].push(blockData[block].records[record].lines[l][column]);
 					}
 				}
 			}
 		}
 	}
 	for (var v in allValues) {
 		if (allValues[v].length === 0) {
 			allValues[v].push("");
 		}
 	}
 	var list = obj2list(allValues);
 	var result = [];
 	iterateAndPopulateCombo({}, list, result);
 	for (var r = 0; r < result.length; r++) {
 		page = {};
 		page.fieldIds = [];
 		page.tables = [];
 		for (var f in result[r]) {
 			fieldId = {
 				id: {
 					data: f
 				},
 				value: result[r][f]
 			};
 			page.fieldIds.push(fieldId);
 		}
 		pages.push(page);
 	}
 	return pages;
 };

 this.unFormatValue = function(value, format) {

 };