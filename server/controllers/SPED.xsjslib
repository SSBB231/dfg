//CORE
$.import("timp.core.server.api", "api");
var coreApi = $.timp.core.server.api.api;
var user = coreApi.usersController;
var componentsTable = coreApi.components;
var config = coreApi.configController;
var sql = coreApi.sql;

var usersModel = coreApi.users;
var util = coreApi.util;
//ATR
$.import("timp.atr.server.api", "api");
var atrApi = $.timp.atr.server.api.api;
var modelATRSetting = atrApi.settings;
var modelStructure = atrApi.structure.table;
var tributoModel = atrApi.tributo.table;
var tributoAgrupamento = atrApi.tributoAgrupamento.tributoAgrupamento;
//DFG
$.import("timp.dfg.server.models", "SPED");
var modelSPED = $.timp.dfg.server.models.SPED;
var runSPEDTable = modelSPED.runSPEDTable;
$.import("timp.dfg.server.models", "SPEDXEefi");
var modelSPEDXEefi = $.timp.dfg.server.models.SPEDXEefi;
$.import("timp.dfg.server.models", "layoutVersion");
var modelLayoutVersion = $.timp.dfg.server.models.layoutVersion;
$.import("timp.dfg.server.models", "layout");
var modelLayout = $.timp.dfg.server.models.layout;
$.import("timp.dfg.server.models", "layoutXStructure");
var modelLayoutXStructure = $.timp.dfg.server.models.layoutXStructure.table;
$.import("timp.dfg.server.controllers", 'layout');
var controllerLayout = $.timp.dfg.server.controllers.layout;
$.import('timp.dfg.server.controllers', 'external');
var controllerExternal = $.timp.dfg.server.controllers.external;

$.import("timp.dfg.server.models", "variants");
var modelEFDICMSIPIVariant = $.timp.dfg.server.models.variants.EFD_ICMSIPI_Variant;
var modelEFDContributionsVariant = $.timp.dfg.server.models.variants.EFD_Contributions_Variant;

$.import("timp.dfg.server.models", "SPED_TDFTables");
var modelSPEDTDFTables = $.timp.dfg.server.models.SPED_TDFTables.table;
$.import('timp.dfg.server.models', 'config');
var configModel = $.timp.dfg.server.models.config;

$.import('timp.dfg.server.controllers', 'log');
$.import("timp.dfg.server.models", "job_SPEDExecutions");
var modelJobSPEDExecutions = $.timp.dfg.server.models.job_SPEDExecutions;

$.import("timp.dfg.server.models.views", "cvReportFiles");
var cvReportFiles = $.timp.dfg.server.models.views.cvReportFiles.table;
$.import("timp.dfg.server.models", "digitalFile");
var modelDigitalFile = $.timp.dfg.server.models.digitalFile;
var logDFG = $.timp.dfg.server.controllers.log.Supervisor;

const _ = $.lodash;

this.status = {
	ACTIVE: 1,
	TRASH: 2,
	DELETED: 3
};
this.spedTypes = ['EFD ICMS / IPI', 'EFD Contributions', 'ECD', 'ECF', 'SCANC'];
this.searchKeys = {
	name: "name",
	id: "id",
	number: "id",
	rules: "idRule",
	company: "idCompany",
	UF: "uf",
	branch: "idBranch",
	tax: "idTax",
	empresa: "empresa",
	filial: "filial",
	creationUser: "creationIdUser",
	modificationUser: "modificationIdUser",
	creationDateTo: "creationDate",
	creationDateFrom: "creationDate",
	modificationDateTo: "modificationDate",
	modificationDateFrom: "modificationDate"
};
/** 
 * list function
 * object: {
     type: spedType (Number),
     searchKeys: {},
     ids: Number | [Number]
     status: number,
     layoutData: bool,
     variantData: bool,
     getFiltersData: bool,
     number: integer,
     counter: bool
 }
 * 
 **/
this.dropSPEDLabels = function(object) {
	var schema = coreApi.schema;
	try {
		var query = {
			query: "DROP TABLE " + schema.default+'."DFG::SPED_Labels"'
		};
		sql.EXECUTE(query);
		query.query = "DROP SEQUENCE " + schema.default+'."DFG::SPED_Labels::ID"';
		sql.EXECUTE(query);
		return 1;
	} catch (e) {
		return 0;
	}
};
this.dropSPEDTDFTables = function(object) {
	var schema = coreApi.schema;
	try {
		var query = {
			query: "DROP TABLE " + schema.default+'."DFG::SPED_TDFTables"'
		};
		sql.EXECUTE(query);
		query.query = "DROP SEQUENCE " + schema.default+'."DFG::SPED_TDFTables::ID"';
		sql.EXECUTE(query);
		return 1;
	} catch (e) {
		return 0;
	}
};

this.list = function(object) {
	var response = {};
	object = object || $.request.parameters.get("object");
	if (typeof object === "string") {
		object = JSON.parse(object);
	}
	response.list = [];
	try {
		var list = true;
		if (object.hasOwnProperty("type")) {
			// type 6 = e social items
			if (object.type >= 6) {
				return this.listESocial(object);
			}
			if (!Array.isArray(object.type)) {
				object.type = [object.type];
			}
			for (let t = 0; t < object.type.length; t++) {
				list = this.verifyReadPrivileges(object.type[t]);
				if (!list) {
					break;
				}
			}
			if (list) {
				let where = this.getSearchFiltersData(object.searchKeys);
				if (object.hasOwnProperty("searchParams") && object.searchParams) {
					where = this.evalSearchParams(object.searchParams);
				}
				where.push({
					field: "type",
					oper: "=",
					value: object.type
				});
				let speds = [];
				let join = [];
				let fields = ["id", "name", "description", "type", "status", "idLayout", "idLayoutVersion", "validTo", "validFrom", "creationDate",
					"creationUser",
					"modificationDate", "modificationUser"
				];

				if (object.hasOwnProperty("status")) {
					where.push({
						field: "status",
						oper: "=",
						value: object.status
					});
				}
				if (object.hasOwnProperty("ids")) {
					where.push({
						field: "id",
						oper: "=",
						value: object.ids
					});
				}
				let layoutFields = ["id", "version"];
				if (object.hasOwnProperty("layoutData") && object.layoutData) {
					layoutFields.push("json");
				}
				join.push({
					table: modelLayoutVersion.table,
					fields: layoutFields,
					alias: "layout",
					on: [{
						left: "idLayoutVersion",
						right: "id"
					}],
					outer: 'left'
				});
				join.push({
					table: modelLayout.table,
					fields: ["name", "idDigitalFileType"],
					alias: "layoutName",
					on: [{
						left: "idLayout",
						right: "id"
					}]
				});

				if (object.hasOwnProperty("layoutData") && object.layoutData) {
					join.push({
						table: modelLayoutXStructure,
						alias: 'layoutXStructure',
						on: [{
							left_table: modelLayout.table,
							left: 'id',
							right: 'idLayout'
						}]
					}, {
						table: modelStructure,
						alias: 'structure',
						fields: object.structure ? ['id', 'title', 'structure'] : ['id', 'title'],
						on: [{
							left_table: modelLayoutXStructure,
							left: 'idStructure',
							right: 'id'
						}]
					});
				}
				join.push({
					table: usersModel,
					alias: "creationUserData",
					fields: ["id", "name", "last_name"],
					on: [{
						left: "creationUser",
						right: "id"
					}],
					outer: "left"
				}, {
					table: usersModel,
					alias: "modificationUserData",
					rename: "A",
					fields: ["id", "name", "last_name"],
					on: [{
						left: "modificationUser",
						right: "id"
					}],
					outer: "left"
				});
				if (object.searchParams) {
				    var searchOR = [];
					for (var p in object.searchParams) {
						if (this.searchKeys.hasOwnProperty(p) && this.searchKeys[p] && object.searchParams[p] !== "") {
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
								case "idTax":
								case "uf":
									break;
								default:
                        			//if we receive a name filter, we'll push it as an id
                        			if (!isNaN(searchParams[p]) && !searchParams.hasOwnProperty("id")) {
                        				searchOR.push({
                        					field: "id",
                        					oper: "=",
                        					value: searchParams[p]
                        				});
                        
                        			}
                        			searchOR.push({
                        				field: this.searchKeys[p],
                        				oper: p === "name" ? "LIKE" : "=",
                        				value: p === "name" ? ("%" + searchParams[p].toUpperCase() + "%") : searchParams[p],
                        				maskFn: 'UPPER'
                        			});
                            
                            		
							}
						}
					}
					if (searchOR.length) {
                        where.push(searchOR);
                	}
				}
				let options = {
					order_by: object.order_by !== null ? object.order_by : ['id'],
					fields: fields,
					where: where,
					join: join
				};
				if (object.hasOwnProperty("number") && object.number !== undefined) {
					options.paginate = {
						size: 15,
						number: Number(object.number),
						count: true
					};
				}
				speds = modelSPED.readSPED(options);
				response.pageCount = speds.pageCount;
				if (speds.length) {
					speds = this.addEEFIInformation(speds, object.searchParams);
				}
				response.list = speds;
				if (object.hasOwnProperty("counter") && object.counter !== undefined && object.counter) {
					$.import("timp.mdr.server.api", "api");
					var mdrApi = $.timp.mdr.server.api.api;
					//var count = [];
					let eSocialCounter = _.reduce(mdrApi.eSocialEvents.getCounters(), function(res, counter, i) {
						res.push([i + 6, counter.created, counter.edited, counter.deleted]);
						return res;
					}, []);
					response.counter = modelSPED.getSPEDCounter(object.type);
					response.counter = _.concat(response.counter, eSocialCounter);
					
					
					let eSocialCounter2 = _.reduce(mdrApi.temporaryRemovalController.getCounters(), function(res, counter, i) {
						res.push([i + 7, counter.created, counter.edited, counter.deleted]);
						return res;
					}, []);
					response.counter = _.concat(response.counter, eSocialCounter2);
					
					
					// response.counter = eSocialCounter;
				}
				if (object.hasOwnProperty("getFiltersData") && object.getFiltersData) {
					response.filters = this.filters();
				}
				if (object.hasOwnProperty("variantData") && object.variantData) {
					response.variants = this.getVariant(response.list[0].type);
				}
			} else {
				$.messageCodes.push({
					code: "DFG214004",
					type: 'E'
				});
			}
			
			
		} else {
		    
		    // filters
		    
				let where = this.getSearchFiltersData(object.searchKeys);
				
				if (object.hasOwnProperty("searchParams") && object.searchParams) {
					where = this.evalSearchParams(object.searchParams);
				}
				
				if (object.searchParams) {
				    var searchOR = [];
					for (var p in object.searchParams) {
						if (this.searchKeys.hasOwnProperty(p) && this.searchKeys[p] && object.searchParams[p] !== "") {
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
								case "idTax":
								case "uf":
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
				let speds = [];
				let join = [];
				let fields = ["id", "name", "description", "type", "status", "idLayout", "idLayoutVersion", "validTo", "validFrom", "creationDate",
					"creationUser",
					"modificationDate", "modificationUser"
				];

				if (object.hasOwnProperty("status")) {
					where.push({
						field: "status",
						oper: "=",
						value: object.status
					});
				}
				if (object.hasOwnProperty("ids")) {
					where.push({
						field: "id",
						oper: "=",
						value: object.ids
					});
				}
				let layoutFields = ["id", "version"];
				if (object.hasOwnProperty("layoutData") && object.layoutData) {
					layoutFields.push("json");
				}
				join.push({
					table: modelLayoutVersion.table,
					fields: layoutFields,
					alias: "layout",
					on: [{
						left: "idLayoutVersion",
						right: "id"
					}],
					outer: 'left'
				});
				join.push({
					table: modelLayout.table,
					fields: ["name", "idDigitalFileType"],
					alias: "layoutName",
					on: [{
						left: "idLayout",
						right: "id"
					}]
				});

				if (object.hasOwnProperty("layoutData") && object.layoutData) {
					join.push({
						table: modelLayoutXStructure,
						alias: 'layoutXStructure',
						on: [{
							left_table: modelLayout.table,
							left: 'id',
							right: 'idLayout'
						}]
					}, {
						table: modelStructure,
						alias: 'structure',
						fields: object.structure ? ['id', 'title', 'structure'] : ['id', 'title'],
						on: [{
							left_table: modelLayoutXStructure,
							left: 'idStructure',
							right: 'id'
						}]
					});
				}
				join.push({
					table: usersModel,
					alias: "creationUserData",
					fields: ["id", "name", "last_name"],
					on: [{
						left: "creationUser",
						right: "id"
					}],
					outer: "left"
				}, {
					table: usersModel,
					alias: "modificationUserData",
					rename: "A",
					fields: ["id", "name", "last_name"],
					on: [{
						left: "modificationUser",
						right: "id"
					}],
					outer: "left"
				});
				
				let options = {
					order_by: object.order_by !== null ? object.order_by : ['id'],
					fields: fields,
					where: where,
					join: join
				};
				if (object.hasOwnProperty("number") && object.number !== undefined) {
					options.paginate = {
						size: 15,
						number: Number(object.number),
						count: true
					};
				}
				speds = modelSPED.readSPED(options);
				response.pageCount = speds.pageCount;
				if (speds.length) {
					speds = this.addEEFIInformation(speds, object.searchParams);
				}
				response.list = speds;
					$.import("timp.mdr.server.api", "api");
					var mdrApi = $.timp.mdr.server.api.api;
					let eSocialCounter = _.reduce(mdrApi.eSocialEvents.getCounters(), function(res, counter, i) {
						res.push([i + 6, counter.created, counter.edited, counter.deleted]);
						return res;
					}, []);
					response.counter = modelSPED.getSPEDCounter(1);
					response.counter = _.concat(response.counter, eSocialCounter);
					
					// response.counter = eSocialCounter;
				
				
				response.filters = this.filters();
				
				if (object.hasOwnProperty("variantData") && object.variantData) {
					response.variants = this.getVariant(response.list[0].type);
				}
		    
		}
	} catch (e) {
		$.trace.error(e);
		$.messageCodes.push({
			type: 'E',
			code: 'DFG214000',
			errorInfo: util.parseError(e)
		});
	}
	return response;
};

this.listESocial = function(object) {
    var events = {
        6: {
            cadastro: 'eSocialEvents'
        },
        7: {
            cadastro: 'temporaryRemovalController'
        }
    };
	$.import("timp.mdr.server.api", "api");
	const mdrApi = $.timp.mdr.server.api.api;
	const eSocialEvents = mdrApi[events[object.type].cadastro];
	// const eSocialChecked = $.createBaseRuntimeModel($.schema.slice(1, -1), 'DFG::E_SOCIAL_CHECKED');
	let response = {
		list: [],
		pageCount: 1
	};
	let params = {
		dfgType: object.subType
	};
	if (!_.isNil(object.number)) {
		params.page = Number(object.number) || 1;
	}
	if (!_.isNil(object.number)) {
		params.searchParams = object.searchParams;
	}
	if (!_.isNil(object.id)) {
		params.id = Number(object.id);
	}
	if (!_.isNil(object.ids)) {
		params.id = Number(object.ids);
	}
	// let idFilters = eSocialChecked.find({
	//     select: [{
	//         field: 'ID'
	//     }]
	// });
	var where = [];
	
	
	
  		
  	
        
	let data = eSocialEvents.list(params);
	
	
	
	
	if (!_.isNil(object.id) || !_.isNil(object.ids)) {
		let metadata = this.getESocialQuery(object, data, true);
		response.queries = _.map(metadata.queries, function(query) {
			return query.insertQuery;
		});
		response.herarchy = metadata.herarchy;
		response.header = metadata.header;
		response.type = metadata.type;
		response.list = data;
		response.tdf = data.tdf;
	} else {
		response.list = data.data;
		response.pageCount = data.pageCount;
	}
	return response;
};

this.getReportFiles = function(object) {
	try {
		if (object.idSped) {
			var joins = [{
				table: cvReportFiles,
				alias: "reportFiles",
				on: [{
					left: "idRun",
					right: "idRun"
				}]
			}];
			var reportFiles = runSPEDTable.READ({
				join: joins,
				where: [{
					field: "idSped",
					oper: "=",
					value: object.idSped
				}]
			});
			return reportFiles;
		}
	} catch (e) {

	}
	return {};
};
this.getVariant = function(type) {
	if (type === "EFD ICMS / IPI") {
		return modelEFDICMSIPIVariant.READ();
	}
	if (type === "EFD Contributions") {
		return modelEFDContributionsVariant.READ();
	}
};
this.getSPEDs = function(object) {
	var speds = [];
	try {
		var options = {
			fields: ["id", "name", "idLayoutVersion"],
			join: [{
				outer: 'left',
				table: modelSPEDXEefi.table,
				alias: 'eefi',
				on: [{
					left: 'id',
					right: 'idSPED'
				}]
			}]
		};
		if (object.idLayoutVersion) {
			options.where = [{
				field: "idLayoutVersion",
				oper: "=",
				value: object.idLayoutVersion
			}];
		}
		speds = modelSPED.readSPED(options);
	} catch (e) {
		$.messageCodes.push({
			code: "DFG214016",
			type: "E"
		});
	}
	return speds;
};
this.filters = function(object) {
	object = object || $.request.parameters.get("object");
	if (typeof object === "string") {
		object = JSON.parse(object);
	}
	var response = {
		company: controllerExternal.listCompany(),
		UF: object.reportFiles ? undefined : controllerExternal.listUF(),
		branch: controllerExternal.listBranch(),
		tax: object.reportFiles ? undefined : controllerExternal.listTax(),
		users: user.listAllUsers()
	};
	return response;
};
/**
 * addEEFIInformation function
 * speds: Array of sped files
 * searchParams: {
     idCompany: string,
     idBranch: string,
     uf: string,
     idTax: string
 }
 **/
this.addEEFIInformation = function(speds, searchParams) {
	var response = [];
	var lang = ($.request.cookies.get("Content-Language") === "enus") ? "enus" : "ptrbr";
	let searchKeysEEFI = {
		company: "idCompany",
		UF: "uf",
		branch: "idBranch"
	};
	try {
		var readOptions = {
			where: [
				[]
			]
		};
		for (var i = 0; i < speds.length; i++) {
			readOptions.where[0].push({
				field: "idSPED",
				oper: "=",
				value: speds[i].id
			});
		}
		readOptions.fields = ["idSPED", "idCompany", "uf", "idBranch", "idTax", "isTaxGroup"];
		var spedsXEefi = modelSPEDXEefi.readSPEDXEefi(readOptions);
		speds.map(function(sped) {
			sped.EEFI = [];
			spedsXEefi = spedsXEefi.filter(function(element) {
				if (element.idSPED === sped.id) {
					//Check Filters EFFI
					if (searchParams !== undefined) {
						for (let key in searchKeysEEFI) {
							if (searchParams.hasOwnProperty(key)) {
								if (searchParams[key] !== "" && searchParams[key] !== element[searchKeysEEFI[key]]) {
									element = null;
									break;
								}
							}
						}
						if (element !== null) {
							sped.EEFI.push(element);
							return false;
						}
					} else {
						sped.EEFI.push(element);
						return false;
					}
				}
				return true;
			});
			if (sped.EEFI.length > 0) {
				response.push(sped);
			}
			return sped;
		});
		var taxes = tributoModel.READ({});
		var taxGroups = tributoAgrupamento.READ({});
		var taxMap = new Map();
		for (var index = 0; index < taxes.length; index++) {
			//Check Filter for tax
			if (searchParams !== undefined && searchParams.hasOwnProperty("tax")) {
				if (searchParams.tax !== "" && taxes[index].codTributo === searchParams.tax) {
					taxMap.set(taxes[index].codTributo, taxes[index].descrCodTributoLabel);
				}
			} else {
				taxMap.set(taxes[index].codTributo, taxes[index].descrCodTributoLabel);
			}
		}
		for (var index = 0; index < taxGroups.length; index++) {
			//Check Filter for tax
			if (searchParams !== undefined && searchParams.hasOwnProperty("tax") && searchParams.tax !== "") {
				if (taxes[index].id + "G" === searchParams.tax) {
					taxMap.set(taxGroups[index].id + "G", taxGroups[index].nomeAgrupamento + "-" + (lang === "enus" ? "Group" : "Grupo"));
				}
			} else {
				taxMap.set(taxGroups[index].id + "G", taxGroups[index].nomeAgrupamento + "-" + (lang === "enus" ? "Group" : "Grupo"));
			}
		}
		var filteredResponse = [];
		response = response.map(function(sped) {
			var filteredConfigurations = [];
			sped.EEFI = sped.EEFI.map(function(configuration) {
				if (searchParams !== undefined && searchParams.hasOwnProperty("tax") && searchParams.tax !== "") {
					if (taxMap.get(configuration.idTax) !== undefined) {
						if (configuration.isTaxGroup) {
							configuration.taxName = taxMap.get(configuration.idTax + "G");
						} else {
							configuration.taxName = taxMap.get(configuration.idTax);
						}

						filteredConfigurations.push(configuration);
					}
				} else {
					if (configuration.isTaxGroup) {
						configuration.taxName = taxMap.get(configuration.idTax + "G");
					} else {
						configuration.taxName = taxMap.get(configuration.idTax);
					}

					filteredConfigurations.push(configuration);
				}
				return configuration;
			});
			if (filteredConfigurations.length > 0) {
				sped.EEFI = filteredConfigurations;
				filteredResponse.push(sped);
			}
			return sped;
		});
	} catch (e) {
		$.trace.error(e);
		$.messageCodes.push({
			code: "DFG210013",
			type: "E",
			errorInfo: util.parseError(e)
		});
	}
	return filteredResponse;
};

/**
  * getSearchFiltersData function
  * searchKeys: {
      k1 : v1,
      k2 : [v1,v2]
    }
  * 
  *
 **/
this.evalSearchParams = function(searchParams) {
	var where = [];
	try {
		if (searchParams.hasOwnProperty("id") && searchParams.id) {
			where.push({
				field: "id",
				oper: "=",
				value: searchParams.id
			});
		}
		/*
		if (searchParams.hasOwnProperty("name") && searchParams.name) {
			where.push({
				field: "name",
				oper: "LIKE",
				maskFn: 'UPPER',
				value: '%' + searchParams.name.toUpperCase() + '%'
			});
		}
		*/
		if (searchParams.hasOwnProperty("creationUser") && searchParams.creationUser) {
			where.push({
				field: "creationUser",
				oper: "=",
				value: searchParams.creationUser
			});
		}
		if (searchParams.hasOwnProperty("modificationUser") && searchParams.modificationUser) {
			where.push({
				field: "creationUser",
				oper: "=",
				value: searchParams.modificationUser
			});
		}
		if (searchParams.hasOwnProperty("type") && searchParams.type) {
			where.push({
				field: "type",
				oper: "=",
				value: searchParams.type
			});
		}
		if (searchParams.hasOwnProperty("creationDateFrom") && searchParams.creationDateFrom) {
			where.push({
				field: "creationDate",
				oper: ">=",
				value: searchParams.creationDate
			});
		}
		if (searchParams.hasOwnProperty("modificationDateFrom") && searchParams.modificationDateFrom) {
			where.push({
				field: "modificationDate",
				oper: ">=",
				value: searchParams.modificationDate
			});
		}
	} catch (e) {
		$.trace.error(e);
		$.messageCodes.push({
			type: 'E',
			code: 'DFG214001',
			errorInfo: util.parseError(e)
		});
	}
	return where;
};
this.getSearchFiltersData = function(searchKeysXValues) {
	var searchData = [];
	try {
		if (searchKeysXValues !== undefined && searchKeysXValues !== null) {
			for (var key in searchKeysXValues) {
				if ((key === "validFrom" || key === "validTo") && Array.isArray(searchKeysXValues[key])) {
					searchData.push([{
						field: this.searchKeys[key],
						oper: ">=",
						value: searchKeysXValues[key][0]
					}, {
						field: this.searchKeys[key],
						oper: "<=",
						value: searchKeysXValues[key][1]
					}]);
				} else {
					searchData.push({
						field: this.searchKeys[key],
						oper: "=",
						value: searchKeysXValues[key]
					});
				}
			}
		}
	} catch (e) {
		$.trace.error(e);
		$.messageCodes.push({
			type: 'E',
			code: 'DFG214001',
			errorInfo: util.parseError(e)
		});
	}
	return searchData;
};
/**
 * verifyReadPrivileges
 * type: Number
 * returns if user has privilege to read
 * **/
this.verifyReadPrivileges = function(type) {
	var canProceed = "";
	var list = true;
	return list;
};
/**
 * create function
 * object = {
     name: string,
     description: string,
     idLayoutVersion: integer,
     type: integer,
     validFrom: date,
     validTo: date or undefined,
     eefi: {}
 }
 * 
 **/
this.create = function(object) {
	let result = null;
	try {
		object = object || $.request.parameters.get("object");
		if (typeof object === "string") {
			object = JSON.parse(object);
		}
		let create;
		if (object.hasOwnProperty("type")) {
			create = this.verifyCreatePrivileges(object.type);
		}
		if (create) {
			object.status = this.status.ACTIVE;
			result = modelSPED.createSPED(object);
			if (object.hasOwnProperty("eefi") && object.eefi) {
				for (var eefi in object.eefi) {
					if (object.eefi.hasOwnProperty(eefi)) {
						var SPEDXEefi = {
							idSPED: result.id,
							idCompany: object.eefi[eefi].idCompany,
							uf: object.eefi[eefi].uf,
							idBranch: object.eefi[eefi].idBranch,
							idTax: object.eefi[eefi].idTax,
							isTaxGroup: object.eefi[eefi].isTaxGroup
						};
						modelSPEDXEefi.table.CREATE(SPEDXEefi);
					}
				}
			}
			var logRegister = new logDFG();
			logRegister.createSPED(object);
		} else {
			$.messageCodes.push({
				code: "DFG214003",
				type: 'E'
			});
		}

	} catch (e) {
		$.trace.error(e);
		var logRegister = new logDFG();
		var register = logRegister.errorCreateSPED($.trace.error(e));
		$.messageCodes.push({
			type: 'E',
			code: 'DFG214002',
			errorInfo: util.parseError(e)
		});
	}
	return result;
};
/**
 * verifyCreatePrivileges
 * type: Number
 * returns if user has privileges to create
 **/
this.verifyCreatePrivileges = function(type) {
	var canProceed = "";
	var create = true;
	return create;
};

/**
 * update function
 * object = {
 *   id: integer,
     name: string,
     description: string,
     validTo: date,
     type: number
 }
 * 
 **/
this.update = function(object) {
	let result = false;
	try {
		let update;
		if (object.hasOwnProperty("type") && object.type) {
			update = this.verifyUpdatePrivileges(object.type);
		}
		if (update) {
			if (object.hasOwnProperty("id") && object.id) {
				let where = [{
					field: "id",
					oper: "=",
					value: object.id
				}];
				let p;
				let options = {};
				for (p in object) {
					if (p !== "id" && p !== "type") {
						options[p] = object[p];
					}
				}
				result = this.modelSPED.updateSPED(options, where);
			}
		} else {

			$.messageCodes.push({
				type: 'E',
				code: 'DFG214005'
			});
		}
	} catch (e) {
		$.trace.error(e);
		var logRegister = new logDFG();
		var register = logRegister.errorUpdateSPED(object.id, $.trace.error(e));
		$.messageCodes.push({
			type: 'E',
			code: 'DFG214009',
			errorInfo: util.parseError(e)
		});
	}
	return result;
};
/**
 *verifyUpdatePrivileges
 * type: Number
 * returns if user has privileges to update
 **/
this.verifyUpdatePrivileges = function(type) {
	var canProceed = "";
	var update = true;
	return update;
};
/**
 *delete function 
 * object = {
     ids: array of Integer or Integer,
     type: integer
 }
 **/
this.deleteSPED = function(object) {
	let result = false;
	try {
		let deleteFlag;
		if (object.hasOwnProperty("type")) {
			deleteFlag = this.verifyDeletePrivileges(object.type);
		}
		if (deleteFlag) {
			if (object.hasOwnProperty("ids") && object.ids) {
				if (!Array.isArray(object.ids)) {
					object.ids = [object.ids];
				}
				let where = [{
					"field": "id",
					"oper": "=",
					"value": object.ids
				}];
				let options = {
					status: this.status.DELETED
				};
				result = modelSPED.updateSPED(options, where);
			}
			var logRegister = new logDFG();
			for (var id = 0; id < object.ids.length; id++) {
				logRegister.deleteSPED(object.ids[id]);
			}

		} else {
			$.messageCodes.push({
				type: 'E',
				code: 'DFG214007'
			});
		}
	} catch (e) {
		$.trace.error(e);

		var logRegister = new logDFG();
		for (var id = 0; id < object.ids.length; id++) {
			logRegister.errorDeleteSPED(object.ids[id]);
		}
		$.messageCodes.push({
			type: 'E',
			code: 'DFG214011',
			errorInfo: util.parseError(e)
		});
	}
	return result;
};
/**
 * verifyDeletePrivileger
 * type: Number
 * returns if user has permission to delete
 **/
this.verifyDeletePrivileges = function(type) {
	var canProceed = "";
	var deleteFlag = true;
	return deleteFlag;
};
/**
 *sendToTrash function 
 * object = {
     ids: array of Integer or Integer,
     type: integer
 }
 **/

this.exportXML = function(object) {
	let _self = this;
	if (_.has(object, 'data')) {
		let data = _self.mapXMLFields(object.data, object.subType);
		var xml = util.converterJSON({
			json: data
		});
		if (_.isString(xml)) {
			xml = xml.replace(/&#x2F;/g, '/');
		}
		return {
			data: xml
		};
	}
};

this.mapXMLFields = function(objectData, subType) {
	let _self = this;
	let result = {};
	let metadata = _self.getDictionaryXML(6, subType);
	let dictionary = metadata.dictionary;
	_.forEach(dictionary, function(element, property) {
		_.forEach(element.path, function(path) {
			let keys = path.split('.');
			let origin = result;

			_.forEach(keys, function(key) {
				if (!origin[key]) {
					origin[key] = {};
				}

				origin = origin[key];
			});

			let fieldName = element.field;

			if (!_.isEmpty(fieldName)) {
				if (element.formatType === 'date') {
					if (!_.isNil(objectData[fieldName])) {
						origin[property] = "" + $.moment(objectData[fieldName]).format(element.format);
					} else {
						origin[property] = 'null';
					}
				} else {
					origin[property] = (_.isPlainObject(objectData[fieldName]) ? objectData[fieldName].key : objectData[fieldName]);
				}
			} else if (!_.isEmpty(element.value)) {
				origin[property] = element.value;
			} else {
				origin[property] = ' ';
			}
		});
	});

	return result;
};

this.getDictionaryXML = function(type, subType) {
	let data = {};
	let eSocialType = '';
	switch (type) {
		case 6:
			eSocialType = 's1070';
			break;
	}
	data.s1070 = {
		s1070Insert: {
			header: {
				type: 'S1070',
				version: 'S2.4'
			},
			subHeader: true,
			dictionary: {
				'Id': {
					'field': '',
					'value': 'S1070',
					'formatType': '',
					'format': '',
					'path': ['eSocial.evtTabProcesso']
				},
				'procEmi': {
					'field': '',
					'value': '1',
					'formatType': '',
					'format': '',
					'path': ['eSocial.evtTabProcesso.ideEvento']
				},
				'iniValid': {
					'field': 'effectiveDateFrom',
					'value': '',
					'formatType': 'date',
					'format': 'YYYY-MM',
					'path': ['eSocial.evtTabProcesso.infoProcesso.inclusao.ideProcesso']
				},
				'fimValid': {
					'field': 'effectiveDateTo',
					'value': '',
					'formatType': 'date',
					'format': 'YYYY-MM',
					'path': ['eSocial.evtTabProcesso.infoProcesso.inclusao.ideProcesso']
				},
				'tpProc': {
					'field': 'processTypeValue',
					'value': '',
					'formatType': '',
					'format': '',
					'path': ['eSocial.evtTabProcesso.infoProcesso.inclusao.ideProcesso']
				},
				'nrProc': {
					'field': 'processNumber',
					'value': '',
					'formatType': '',
					'format': '',
					'path': ['eSocial.evtTabProcesso.infoProcesso.inclusao.ideProcesso']
				},
				'indAutoria': {
					'field': 'authorshipTypeValue',
					'value': '',
					'formatType': '',
					'format': '',
					'path': ['eSocial.evtTabProcesso.infoProcesso.inclusao.dadosProc']
				},
				'indMatProc': {
					'field': 'processClassValue',
					'value': '',
					'formatType': '',
					'format': '',
					'path': ['eSocial.evtTabProcesso.infoProcesso.inclusao.dadosProc']
				},
				'ufVara': {
					'field': 'uf',
					'value': '',
					'formatType': '',
					'format': '',
					'path': ['eSocial.evtTabProcesso.infoProcesso.inclusao.dadosProc.dadosProcJud']
				},
				'codMunic': {
					'field': 'countyCode',
					'value': '',
					'formatType': '',
					'format': '',
					'path': ['eSocial.evtTabProcesso.infoProcesso.inclusao.dadosProc.dadosProcJud']
				},
				'codSusp': {
					'field': 'suspensionCode',
					'value': '',
					'formatType': '',
					'format': '',
					'path': ['eSocial.evtTabProcesso.infoProcesso.inclusao.dadosProc.codSusp']
				},
				'indSusp': {
					'field': 'suspensionIndicativeValue',
					'value': '',
					'formatType': '',
					'format': '',
					'path': ['eSocial.evtTabProcesso.infoProcesso.inclusao.dadosProc.codSusp']
				},
				'indDeposito': {
					'field': 'integralDeposit',
					'value': '',
					'formatType': '',
					'format': '',
					'path': ['eSocial.evtTabProcesso.infoProcesso.inclusao.dadosProc.codSusp']
				},
				'tpAmb': {
					'field': '',
					'value': '',
					'formatType': '',
					'format': '',
					"path": ['eSocial.evtTabProcesso.ideEvento']
				},
				'verProc': {
					'field': '',
					'value': 'SAP_HRCBR',
					'formatType': '',
					'format': '',
					'path': ['eSocial.evtTabProcesso.ideEvento']
				},
				'tpInsc': {
					'field': '',
					'value': '1',
					'formatType': '',
					'format': '',
					'path': ['eSocial.evtTabProcesso.ideEmpregador']
				},
				'nrInsc': {
					'field': '',
					'value': '',
					'formatType': '',
					'format': '',
					'path': ['eSocial.evtTabProcesso.ideEmpregador']
				},
				'idVara': {
					'field': 'judicialRod',
					'value': '',
					'formatType': '',
					'format': '',
					'path': ['eSocial.evtTabProcesso.infoProcesso.inclusao.dadosProc.dadosProcJud']
				},
				'dtDecisao': {
					'field': 'publicationDate',
					'value': '',
					'formatType': 'date',
					'format': 'YYYYDDMM',
					'path': ['eSocial.evtTabProcesso.infoProcesso.inclusao.dadosProc.codSusp']
				}
			}
		},
		s1070Update: {
			header: {
				type: 'S1070',
				version: 'S2.4'
			},
			subHeader: true,
			dictionary: {
				'Id': {
					'field': '',
					'value': 'S1070',
					'formatType': '',
					'format': '',
					'path': ['eSocial.evtTabProcesso']
				},
				'procEmi': {
					'field': '',
					'value': '1',
					'formatType': '',
					'format': '',
					'path': ['eSocial.evtTabProcesso.ideEvento']
				},
				'iniValid': {
					'field': 'effectiveDateFrom',
					'value': '',
					'formatType': 'date',
					'format': 'YYYY-MM',
					'path': ['eSocial.evtTabProcesso.infoProcesso.inclusao.ideProcesso',
    					'eSocial.evtTabProcesso.infoProcesso.inclusao.dadosProc.novaValidade'
    				]
				},
				'fimValid': {
					'field': 'effectiveDateTo',
					'value': '',
					'formatType': 'date',
					'format': 'YYYY-MM',
					'path': ['eSocial.evtTabProcesso.infoProcesso.inclusao.ideProcesso',
    					'eSocial.evtTabProcesso.infoProcesso.inclusao.dadosProc.novaValidade'
    				]
				},
				'tpProc': {
					'field': 'processTypeValue',
					'value': '',
					'formatType': '',
					'format': '',
					'path': ['eSocial.evtTabProcesso.infoProcesso.inclusao.ideProcesso']
				},
				'nrProc': {
					'field': 'processNumber',
					'value': '',
					'formatType': '',
					'format': '',
					'path': ['eSocial.evtTabProcesso.infoProcesso.inclusao.ideProcesso']
				},
				'indAutoria': {
					'field': 'authorshipTypeValue',
					'value': '',
					'formatType': '',
					'format': '',
					'path': ['eSocial.evtTabProcesso.infoProcesso.inclusao.dadosProc']
				},
				'indMatProc': {
					'field': 'processClassValue',
					'value': '',
					'formatType': '',
					'format': '',
					'path': ['eSocial.evtTabProcesso.infoProcesso.inclusao.dadosProc']
				},
				'ufVara': {
					'field': 'uf',
					'value': '',
					'formatType': '',
					'format': '',
					'path': ['eSocial.evtTabProcesso.infoProcesso.inclusao.dadosProc.dadosProcJud']
				},
				'codMunic': {
					'field': 'countyCode',
					'value': '',
					'formatType': '',
					'format': '',
					'path': ['eSocial.evtTabProcesso.infoProcesso.inclusao.dadosProc.dadosProcJud']
				},
				'codSusp': {
					'field': 'suspensionCode',
					'value': '',
					'formatType': '',
					'format': '',
					'path': ['eSocial.evtTabProcesso.infoProcesso.inclusao.dadosProc.codSusp']
				},
				'indSusp': {
					'field': 'suspensionIndicativeValue',
					'value': '',
					'formatType': '',
					'format': '',
					'path': ['eSocial.evtTabProcesso.infoProcesso.inclusao.dadosProc.codSusp']
				},
				'indDeposito': {
					'field': 'integralDeposit',
					'value': '',
					'formatType': '',
					'format': '',
					'path': ['eSocial.evtTabProcesso.infoProcesso.inclusao.dadosProc.codSusp']
				},
				'tpAmb': {
					'field': '',
					'value': '',
					'formatType': '',
					'format': '',
					"path": ['eSocial.evtTabProcesso.ideEvento']
				},
				'verProc': {
					'field': '',
					'value': 'SAP_HRCBR',
					'formatType': '',
					'format': '',
					'path': ['eSocial.evtTabProcesso.ideEvento']
				},
				'tpInsc': {
					'field': '',
					'value': '1',
					'formatType': '',
					'format': '',
					'path': ['eSocial.evtTabProcesso.ideEmpregador']
				},
				'nrInsc': {
					'field': '',
					'value': '',
					'formatType': '',
					'format': '',
					'path': ['eSocial.evtTabProcesso.ideEmpregador']
				},
				'idVara': {
					'field': 'judicialRod',
					'value': '',
					'formatType': '',
					'format': '',
					'path': ['eSocial.evtTabProcesso.infoProcesso.inclusao.dadosProc.dadosProcJud']
				},
				'dtDecisao': {
					'field': 'publicationDate',
					'value': '',
					'formatType': 'date',
					'format': 'YYYYDDMM',
					'path': ['eSocial.evtTabProcesso.infoProcesso.inclusao.dadosProc.codSusp']
				}
			}
		},
		s1070Delete: {
			header: {
				type: 'S1070',
				version: 'S2.4'
			},
			subHeader: true,
			dictionary: {
				'Id': {
					'field': '',
					'value': 'S1070',
					'formatType': '',
					'format': '',
					'path': ['eSocial.evtTabProcesso']
				},
				'procEmi': {
					'field': '',
					'value': '1',
					'formatType': '',
					'format': '',
					'path': ['eSocial.evtTabProcesso.ideEvento']
				},
				'iniValid': {
					'field': 'effectiveDateFrom',
					'value': '',
					'formatType': 'date',
					'format': 'YYYY-MM',
					'path': ['eSocial.evtTabProcesso.infoProcesso.exclusao.ideProcesso']
				},
				'fimValid': {
					'field': 'effectiveDateTo',
					'value': '',
					'formatType': 'date',
					'format': 'YYYY-MM',
					'path': ['eSocial.evtTabProcesso.infoProcesso.exclusao.ideProcesso']
				},
				'tpProc': {
					'field': 'processTypeValue',
					'value': '',
					'formatType': '',
					'format': '',
					'path': ['eSocial.evtTabProcesso.infoProcesso.exclusao.ideProcesso']
				},
				'nrProc': {
					'field': 'processNumber',
					'value': '',
					'formatType': '',
					'format': '',
					'path': ['eSocial.evtTabProcesso.infoProcesso.exclusao.ideProcesso']
				},
				'tpAmb': {
					'field': '',
					'value': '',
					'formatType': '',
					'format': '',
					"path": ['eSocial.evtTabProcesso.ideEvento']
				},
				'verProc': {
					'field': '',
					'value': 'SAP_HRCBR',
					'formatType': '',
					'format': '',
					'path': ['eSocial.evtTabProcesso.ideEvento']
				},
				'tpInsc': {
					'field': '',
					'value': '1',
					'formatType': '',
					'format': '',
					'path': ['eSocial.evtTabProcesso.ideEmpregador']
				},
				'nrInsc': {
					'field': '',
					'value': '',
					'formatType': '',
					'format': '',
					'path': ['eSocial.evtTabProcesso.ideEmpregador']
				}
			}
		}
	};

	return data[eSocialType][subType];
};

this.sendToTrashSPED = function(object) {
	let result = false;
	try {
		let sendToTrash;
		if (object.hasOwnProperty("type")) {
			sendToTrash = this.verifySendTrashPrivileges(object.type);
		}
		if (sendToTrash) {
			if (object.hasOwnProperty("ids") && object.ids) {
				if (!Array.isArray(object.ids)) {
					object.ids = [object.ids];
				}
				let where = [{
					"field": "id",
					"oper": "=",
					"value": object.ids
				}];
				let options = {
					status: this.status.TRASH
				};
				result = modelSPED.updateSPED(options, where);
			}
		} else {
			$.messageCodes.push({
				type: 'E',
				code: 'DFG214006'
			});
		}
	} catch (e) {
		$.trace.error(e);
		$.messageCodes.push({
			type: 'E',
			code: 'DFG214010',
			errorInfo: util.parseError(e)
		});
	}
	return result;
};
/**
 * verifySendTrashPrivilege
 * type: Number
 * returns if user has permission to send to trash
 **/
this.verifySendTrashPrivileges = function(type) {
	var canProceed = "";
	var sendToTrash = true;
	return sendToTrash;
};
/**
 *restore function 
 * object = {
     ids: array of Integer or Integer,
     type: integer
 }
 **/
this.restoreSPED = function(object) {
	let result = false;
	try {
		let restore;
		if (object.hasOwnProperty("type")) {
			restore = this.verifyRestorePrivileges(object.type);
		}
		if (restore) {
			if (object.hasOwnProperty("ids") && object.ids) {
				if (!Array.isArray(object.ids)) {
					object.ids = [object.ids];
				}
				let where = [{
					"field": "id",
					"oper": "=",
					"value": object.ids
				}];
				let options = {
					status: this.status.ACTIVE
				};
				result = modelSPED.updateSPED(options, where);
			}
		} else {
			$.messageCodes.push({
				type: 'E',
				code: 'DFG214008'
			});
		}
	} catch (e) {
		$.trace.error(e);
		$.messageCodes.push({
			type: 'E',
			code: 'DFG214012',
			errorInfo: util.parseError(e)
		});
	}
	return result;
};
/**
 * verifyRestorePrivilege
 * type: Number
 * returns if user has permission to send to trash
 **/
this.verifyRestorePrivileges = function(type) {
	var canProceed = "";
	var restore = true;
	return restore;
};

/**
 *createDialog 
 * object = {
     type: Number
 }
 * returns required information for creating SPED files
 **/

this.createDialog = function(object) {
	let response = {
		copyFrom: [],
		layouts: [],
		companies: [],
		taxes: []
	};
	try {
		object = object || $.request.parameters.get("object");
		if (typeof object === "string") {
			object = JSON.parse(object);
		}
		let create;
		if (object.hasOwnProperty("type")) {
			create = this.verifyCreatePrivileges(object.type);
		}
		if (create) {
			let copyFrom = this.list({
				type: object.type,
				status: this.status.ACTIVE,
				layoutData: false,
				getFiltersData: false
			}).list;
			response.copyFrom = copyFrom.map(function(s) {
				return {
					key: s.id,
					name: s.name,
					data: s
				};
			});
			let layouts = controllerLayout.listSPEDFiles(object.type === 5).list;
			let versions = [];
			response.layouts = layouts.map(function(l) {
				versions = l.version.map(function(v) {
					return {
						key: v.id,
						name: v.version
					};
				});
				return {
					key: l.id,
					name: "ID" + l.id + "-" + l.name,
					versions: versions
				};
			});
			let companies = controllerExternal.listCompany();
			var addedCompanies = [];
			response.companies = [];
			companies.map(function(c) {
				if (addedCompanies.indexOf(c.id) === -1) {
					response.companies.push({
						key: c.id,
						name: c.name
					});
					addedCompanies.push(c.id);
				}
			});
			response.taxes = controllerExternal.listTax();

		} else {
			$.messageCodes.push({
				code: "DFG214003",
				type: 'E'
			});
		}

	} catch (e) {
		$.trace.error(e);
		$.messageCodes.push({
			code: "DFG214013",
			type: 'E'
		});
	}
	return response;
};

this.execute = function(object) {
	try {
		var response = {};

		for (var xml in object.data) {
			if (object.data.hasOwnProperty(xml)) {
				var xml2 = util.converterJSON({
					json: object.data[xml]
				});
				if (coreApi.lodash.isString(xml2)) {
					xml2 = xml2.replace(/&#x2F;/g, '/');
				}
				//call service
				var externalCallResponse = coreApi.executeTDFExternalService("POST", object.adapterId, object.location, xml2);
				response[xml] = coreApi.util.converterXML({
					xml: externalCallResponse.xml
				});
			}
		}
		var logRegister = new logDFG();
		logRegister.executeSPEDFile(object.fileData, 'LOG209030');
		//  logRegister.executeEFDICMSIPI(object);
		return response;
	} catch (e) {
		$.trace.error(e);
	}
};

this.executeEFDContributions = function(object) {
	try {
		var componentName = configModel.component;
		var comp = componentsTable.READ({
			fields: ['version'],
			where: [{
				field: 'name',
				oper: '=',
				value: componentName
			}]
		})[0];
		var componentVersion = comp ? comp.version : configModel.version;
		//      var response = tis.tdfServices.makeExternalCallToSystem({
		//          data: object.data, //send the respective data, make sure the data is in the correct format
		//          serviceName: 'TMFPCOReportRun', //name of the service you whant to call
		//          componentName: componentName,
		//          componentVersion: componentVersion,
		//          message: 'Execute SPED EFD Contributions'
		//      });
		var logRegister = new logDFG();
		logRegister.executeSPEDFile(object.fileData, 'LOG209031');
		return response;
	} catch (e) {
		$.trace.error(e);
		return e;
	}
};
this.executeECD = function(object) {
	try {
		var componentName = configModel.component;
		var comp = componentsTable.READ({
			fields: ['version'],
			where: [{
				field: 'name',
				oper: '=',
				value: componentName
			}]
		})[0];
		var componentVersion = comp ? comp.version : configModel.version;
		//      var response = tis.tdfServices.makeExternalCallToSystem({
		//          data: object.data, //send the respective data, make sure the data is in the correct format
		//          serviceName: 'TMFECDReportRun', //name of the service you whant to call
		//          componentName: componentName,
		//          componentVersion: componentVersion,
		//          message: 'Execute SPED ECD'
		//      });
		var logRegister = new logDFG();
		logRegister.executeSPEDFile(object.fileData, 'LOG209032');
		return response;
	} catch (e) {
		$.trace.error(e);
		return e;
	}
};
this.executeECF = function(object) {
	try {
		var componentName = configModel.component;
		var comp = componentsTable.READ({
			fields: ['version'],
			where: [{
				field: 'name',
				oper: '=',
				value: componentName
			}]
		})[0];
		var componentVersion = comp ? comp.version : configModel.version;
		//      var response = tis.tdfServices.makeExternalCallToSystem({
		//          data: object.data, //send the respective data, make sure the data is in the correct format
		//          serviceName: 'TMFECFreportExecutionSyncIn', //name of the service you whant to call
		//          componentName: componentName,
		//          componentVersion: componentVersion,
		//          message: 'Execute SPED ECF'
		//      });
		var logRegister = new logDFG();
		logRegister.executeSPEDFile(object.fileData, 'LOG209033');
		return response;
	} catch (e) {
		$.trace.error(e);
		return e;
	}
};

this.getTableColumns = function(object) {
	try {
		var recordName = object.recordName;
		var tmfTable = modelSPEDTDFTables.READ({
			fields: ["tdfTable"],
			where: [{
				field: "registerName",
				oper: "=",
				value: recordName
			}]
		})[0];
		var tdfSchema = coreApi.getSystemConfiguration({
			componentName: "CORE",
			keys: ["TDF::SCHEMA"]
		})[0].value;
		var getColumns;
		if (!object.keys) {
			getColumns = {
				query: "SELECT COLUMN_NAME FROM TABLE_COLUMNS where SCHEMA_NAME = \'" + tdfSchema + "\' AND TABLE_NAME=\'" + tmfTable.tdfTable + "\'"
			};
		} else {
			getColumns = {
				query: "SELECT COLUMN_NAME,INDEX_TYPE,DATA_TYPE_NAME FROM TABLE_COLUMNS where SCHEMA_NAME = \'" + tdfSchema + "\' AND TABLE_NAME=\'" +
					tmfTable.tdfTable +
					"\'"
			};
		}
		var columns = sql.SELECT(getColumns);

		var result = [];
		if (!object.keys) {
			columns.map(function(c) {
				if (c[0] !== "MANDT") {
					result.push({
						key: c[0],
						name: c[0]
					});
				}
			});
		} else {
			columns.map(function(c) {
				result.push({
					isKey: c[1] === "FULL",
					type: c[2],
					name: c[0]
				});
			});
		}
		return result;

	} catch (e) {
		$.trace.error(e);
	}
};
this.updateSPEDTables = function(object) {
	try {
		var tdfSchema = coreApi.getSystemConfiguration({
			componentName: "CORE",
			keys: ["TDF::SCHEMA"]
		})[0].value;
		object.idCompany = object.company;
		object.idBranch = object.branch[0];
		object.subperiod = object.subPeriod.month + "/" + object.subPeriod.year + ", " + object.subPeriod.subperiod;
		var rawFile = object.rawFile;
		var layoutData = this.list(object).list[0];
		var json = JSON.parse(layoutData.layout[0].json || "{}");
		var separator = json.separator.value + String.fromCharCode(8204);
		var data = rawFile.split("\r\n");
		var line, lineData;
		var block, record;
		var tmfTable;
		var verifyExistence = {};
		var columns = [];
		var spedMapping;
		var errors = {};
		var whereClause = [];
		var positions;
		var flagInsert;
		var existenceResult;
		var recordName = "";
		var lastRecord = false;
		var MANDT = coreApi.getAdaptersByType("TDF", true)[0].client;
		if (tdfSchema === undefined || tdfSchema === "" || tdfSchema === null) {
			errors["."] = "TDFSCHEMA NOT FOUND";
		}
		var tablesInsert = {};
		var tablesDelete = {};

		for (var i = 0; i < data.length; i++) {
			if (data[i].split("&&::").length > 1) {
				line = data[i].split("&&::")[0];
				lineData = line.split(separator);
				if (json.separator.inFirst) {
					lineData.splice(0, 1);
				}
				if (json.separator.inLast) {
					lineData.splice(lineData.length - 1, 1);
				}
				block = data[i].split("&&::")[1].split("&:")[0];
				record = data[i].split("&&::")[1].split("&:")[1];
				spedMapping = json.blocks[block].records[record].spedMapping;
				positions = json.blocks[block].records[record].positions;
				if (spedMapping === undefined) {
					errors[json.blocks[block].records[record].name.trim()] = "SPED MAPPING NOT FOUND FOR RECORD";

				} else {
					if (recordName !== json.blocks[block].records[record].name.trim()) {
						tmfTable = modelSPEDTDFTables.READ({
							fields: ["tdfTable"],
							where: [{
								field: "registerName",
								oper: "=",
								value: json.blocks[block].records[record].name.trim()
							}]
						})[0];
						recordName = json.blocks[block].records[record].name.trim();
						lastRecord = false;
					} else {
						lastRecord = true;
					}
					if (tmfTable == undefined || tmfTable == null) {
						errors[json.blocks[block].records[record].name.trim()] = "RECORD TABLE DOESN'T EXISTS";

					} else {
						if (!tablesInsert[tmfTable.tdfTable]) {
							tablesInsert[tmfTable.tdfTable] = {
								columns: [],
								values: {},
								schema: tdfSchema
							};
							tablesDelete[tmfTable.tdfTable] = {
								keys: {},
								schema: tdfSchema
							};

						}

						if (!lastRecord) {
							columns = this.getTableColumns({
								recordName: json.blocks[block].records[record].name.trim(),
								keys: true
							});
						}
						flagInsert = true;
						whereClause = [];
						var values = {};
						var key = "";
						columns.map(function(c) {
							if (tablesInsert[tmfTable.tdfTable].columns.length !== columns.length) {
								tablesInsert[tmfTable.tdfTable].columns.push(c);
							}
							if (c.name === "MANDT") {
								values[c.name] = "" + MANDT + "";
							} else {
								if (lineData[positions.indexOf(spedMapping[c.name])]) {
									values[c.name] = "" + lineData[positions.indexOf(spedMapping[c.name])] + "";
								} else {
									if (c.type === "INTEGER" || c.type === "DOUBLE" || c.type === "DECIMAL") {
										values[c.name] = 0;
									} else {
										values[c.name] = '';
									}
								}

							}
							if (c.isKey) {
								if (spedMapping[c.name] === undefined && c.name !== "MANDT") {
									flagInsert = false;
								} else {
									if (positions.indexOf(spedMapping[c.name]) > -1) {
										whereClause.push(c.name + "=\'" + lineData[positions.indexOf(spedMapping[c.name])] + "\'");
										key += lineData[positions.indexOf(spedMapping[c.name])];
									} else {

										if (c.name === "MANDT") {
											whereClause.push(c.name + "=\'" + MANDT + "\'");

										} else {
											flagInsert = false;
										}

									}

								}

							}
						});
						if (flagInsert) {
							tablesInsert[tmfTable.tdfTable].values[key] = values;
							verifyExistence.query = "SELECT * FROM \"" + tdfSchema + "\"." + "\"" + tmfTable.tdfTable + "\" WHERE " + whereClause.join(" AND ");
							if (!tablesDelete[tmfTable.tdfTable].keys[key]) {
								existenceResult = sql.SELECT(verifyExistence);
								if (existenceResult.length) {
									tablesDelete[tmfTable.tdfTable].keys[key] = whereClause.join(" AND ");
								}
							}
							//  sql.EXECUTE(query);
						} else {
							errors[json.blocks[block].records[record].name.trim()] = "ALL TABLE KEYS NOT FOUND";
						}

					}

				}
			}
		}
		if (Object.keys(errors).length === 0) {
			var tablesDelete2 = this.verifyJOBUpdate(object);
			if (tablesDelete2 && Object.keys(tablesDelete2).length) {
				for (var table in tablesDelete2) {
					if (!tablesDelete[table]) {
						tablesDelete[table] = tablesDelete2[table];
					} else {
						for (var k in tablesDelete2[table].keys) {
							if (!tablesDelete[table].keys) {
								tablesDelete[table].keys = {};
							}
							if (!tablesDelete[table].keys[k]) {
								tablesDelete[table].keys[k] = tablesDelete2[table].keys[k];
							}
						}
					}
				}
			}
			modelJobSPEDExecutions.createSpedExecution({
				executionData: JSON.stringify({
					tablesInsert: tablesInsert,
					tablesDelete: tablesDelete
				}),
				idSped: object.idSped,
				idCompany: object.idCompany,
				idBranch: object.idBranch,
				subperiod: object.subperiod
			}, object.subPeriod);
		}
		return {
			errors: errors
		};
	} catch (e) {
		$.messageCodes.push({
			code: "DFG214015",
			type: "E",
			errorInfo: util.parseError(e)
		});

	}
};
this.evaluateSpedExecutions = function() {
	var spedExecutions = modelJobSPEDExecutions.readSpedExecutions({
		where: [{
			field: "status",
			oper: "=",
			value: 1
		}]
	});
	var spedExecutionsXStatus = {};
	var spedExecutionsXTables = {};
	if (spedExecutions) {
		var queriesByTable = {};

		for (var i = 0; i < spedExecutions.length; i++) {
			spedExecutionsXStatus[spedExecutions[i].id] = 2;
			spedExecutionsXTables[spedExecutions[i].id] = {};
			var executionQueries = JSON.parse(spedExecutions[i].executionData);
			for (var table in executionQueries.tablesDelete) {
				var whereClause = [];
				for (var key in executionQueries.tablesDelete[table].keys) {
					whereClause.push("(" + executionQueries.tablesDelete[table].keys[key] + ")");
				}
				if (whereClause.length) {
					sql.EXECUTE({
						query: "DELETE FROM \"" + executionQueries.tablesDelete[table].schema + "\".\"" + table + "\" WHERE " + whereClause.join(" OR ")
					});
				}

			}
			for (var table in executionQueries.tablesInsert) {
				spedExecutionsXTables[spedExecutions[i].id][table] = 1;
				if (!queriesByTable[table]) {
					var columns = [];
					var values = {};
					for (var c in executionQueries.tablesInsert[table].columns) {
						if (executionQueries.tablesInsert[table].columns.hasOwnProperty(c)) {
							columns.push(executionQueries.tablesInsert[table].columns[c]);
						}
					}
					for (var k in executionQueries.tablesInsert[table].values) {
						values[k] = [];
						for (var c = 0; c < columns.length; c++) {
							if (columns[c]) {
								values[k].push(executionQueries.tablesInsert[table].values[k][columns[c].name]);
							}
						}
					}
					queriesByTable[table] = {
						columns: columns,
						values: values,
						schema: executionQueries.tablesInsert[table].schema
					};
				} else {
					for (var v in executionQueries.tablesInsert[table].values) {
						if (executionQueries.tablesInsert[table].values.hasOwnProperty(v)) {
							queriesByTable[table].values[v] = [];
							for (var c = 0; c < queriesByTable[table].columns.length; c++) {
								queriesByTable[table].values[v].push(executionQueries.tablesInsert[table].values[v][queriesByTable[table].columns[c].name]);
							}
						}
					}
				}
			}

		}
		for (var table in queriesByTable) {
			var tableName = "\"" + queriesByTable[table].schema + "\".\"" + table + "\"";
			var fields = queriesByTable[table].columns.map(function(c) {
				return {
					name: c.name,
					type: $.db.types[c.type]
				};
			});

			var values = [];
			for (var value in queriesByTable[table].values) {
				values.push(queriesByTable[table].values[value]);
			}
			try {
				sql.BATCH_INSERT({
					table: tableName,
					fields: fields,
					values: values
				});
				var logRegister = new logDFG();
				logRegister.updateSPEDStructure();
			} catch (e) {
				for (var s in spedExecutionsXTables) {
					if (spedExecutionsXTables.hasOwnProperty(s) && spedExecutionsXTables[s].hasOwnProperty(table)) {
						spedExecutionsXStatus[s] = 3;
					}
				}
				$.trace.error(e);
				var logRegister = new logDFG();
				logRegister.errorUpdateSPEDStructure($.trace.error(e));
			}
		}
		for (var s in spedExecutionsXStatus) {
			if (spedExecutionsXStatus.hasOwnProperty(s)) {
				modelJobSPEDExecutions.updateSpedExecutionStatus(s, spedExecutionsXStatus[s]);
			}
		}

	}
};
this.getSpedExecutions = function(object) {
	try {
		var ids = [];
		var where = [{
			field: "idSped",
			oper: "=",
			value: object.idSped
		}];
		if (object.searchParams) {
			if (object.searchParams.status) {
				where.push({
					"field": "status",
					"oper": "=",
					"value": object.searchParams.status
				});
			}
			if (object.searchParams.creationUser) {
				where.push({
					"field": "creationUser",
					"oper": "=",
					"value": object.searchParams.creationUser
				});
			}
			if (object.searchParams.executionDate) {
				var date = object.searchParams.executionDate.split("T")[0];
				where.push({
					"field": "creationDate",
					"oper": ">=",
					"value": date + "T00:00:00Z"
				}, {
					"field": "creationDate",
					"oper": "<=",
					"value": date + "T23:59:59Z"
				});
			}
			if (object.searchParams.subperiod) {
				where.push({
					"field": "subperiod",
					"oper": "=",
					"value": object.searchParams.subperiod
				});
			}
			if (object.searchParams.company) {
				where.push({
					"field": "idCompany",
					"oper": "=",
					"value": object.searchParams.company
				});
			}
			if (object.searchParams.branch || object.searchParams.uf) {
				var where2 = [];
				if (object.searchParams.branch) {
					where2.push({
						"field": "idBranch",
						"oper": "=",
						"value": object.searchParams.branch
					});
				}
				if (object.searchParams.uf) {
					where2.push({
						"field": "uf",
						"oper": "=",
						"value": object.searchParams.uf
					});
				}
				var ids2 = modelJobSPEDExecutions.job_spedExecutionsEEFITable.READ({
					"distinct": true,
					"fields": ["idSpedExecution"],
					"where": where2
				}).map(function(eefi) {
					return eefi.idSpedExecution;
				});
				where.push({
					"field": "id",
					"oper": "=",
					"value": ids2.length ? ids2 : -1
				});
			}
		}
		var spedExecutions = modelJobSPEDExecutions.readSpedExecutions({
			fields: ["id", "idCompany", "idBranch", "subperiod", "creationUser", "creationDate", "status"],
			where: where,
			join: [{
				table: usersModel,
				alias: "creationUserData",
				fields: ["id", "name", "last_name"],
				on: [{
					left: "creationUser",
					right: "id"
				}],
				outer: "left"
			}],
			paginate: {
				size: 6,
				number: Number(object.page || 1),
				count: true
			}
		});
		var pageCount = parseInt(spedExecutions.pageCount, 10);
		spedExecutions = spedExecutions.map(function(element) {
			ids.push(element.id);
			return {
				id: element.id,
				idCompany: element.idCompany,
				idBranch: [element.idBranch],
				subperiod: element.subperiod,
				uf: [],
				idTax: [],
				creationUser: element.creationUserData && element.creationUserData[0] ? element.creationUserData[0].name + " " + element.creationUserData[
					0].last_name : "",
				creationDate: element.creationDate,
				status: element.status
			};
		});
		if (ids.length) {
			var spedEEFIExecutions = modelJobSPEDExecutions.job_spedExecutionsEEFITable.READ({
				"distinct": true,
				"fields": ["idSpedExecution", "idCompany", "uf", "idBranch", "idTax"],
				"where": [{
					"field": "idSpedExecution",
					"oper": "=",
					"value": ids
				}]
			});
			var eefi_id = {};
			spedEEFIExecutions.map(function(eefi) {
				if (!eefi_id[eefi.idSpedExecution]) {
					eefi_id[eefi.idSpedExecution] = {
						idCompany: "",
						uf: [],
						idBranch: [],
						idTax: ""
					};
				}
				eefi_id[eefi.idSpedExecution].idCompany = eefi.idCompany;
				if (eefi_id[eefi.idSpedExecution].uf.indexOf(eefi.uf)) {
					eefi_id[eefi.idSpedExecution].uf.push(eefi.uf);
				}
				if (eefi_id[eefi.idSpedExecution].idBranch.indexOf(eefi.idBranch)) {
					eefi_id[eefi.idSpedExecution].idBranch.push(eefi.idBranch);
				}
				eefi_id[eefi.idSpedExecution].idTax = eefi.idTax;
			});
			for (var id in eefi_id) {
				var spedExecution = spedExecutions[ids.indexOf(parseInt(id, 10))];
				spedExecution.idCompany = eefi_id[id].idCompany;
				spedExecution.uf = eefi_id[id].uf;
				spedExecution.idBranch = eefi_id[id].idBranch;
				spedExecution.idTax = eefi_id[id].idTax;
			}
		}
		var filterOptions = {};
		if (object.filterOptions) {
			filterOptions.users = user.listAllUsers();
			filterOptions.subperiod = modelJobSPEDExecutions.readSpedExecutions({
				distinct: true,
				fields: ["subperiod"]
			}).map(function(r) {
				return {
					id: r.subperiod,
					name: r.subperiod
				};
			});
		}
		return {
			files: spedExecutions,
			pageCount: pageCount,
			filterOptions: filterOptions
		};
	} catch (e) {
		$.messageCodes.push({
			code: "DFG214017",
			type: "E",
			errorInfo: util.parseError(e)
		});
	}

};
//-------03/03/2017 - KBARA-----//
//SAVE REPORT RUNID
this.saveRunId = function(object) {
	try {
		var result = [];
		if (object.RUN_ID && object.idSped) {
			if (Array.isArray(object.RUN_ID)) {
				for (var r = 0; r < object.RUN_ID.length; r++) {
					result.push(
						runSPEDTable.createRun({
							idRun: object.RUN_ID[r],
							idSped: object.idSped,
							idTask: object.idTask,
							idProcess: object.idProcess
						})
					);
				}
			} else {
				result.push(
					runSPEDTable.createRun({
						idRun: object.RUN_ID,
						idSped: object.idSped,
						idTask: object.idTask,
						idProcess: object.idProcess
					})
				);
			}
			return result;

		}
		return null;
	} catch (e) {

	}
};
this.getTOMFileMetadata = function(object) {
	var response = {};
	try {
		if (object.idFile) {
			response = cvReportFiles.READ({
				where: [{
					field: "idFile",
					oper: "=",
					value: object.idFile
				}]
			})[0];
		} else if (object.idTask) {
			response = cvReportFiles.READ({
				where: [{
					field: "idTask",
					oper: "=",
					value: object.idTask
				}]
			});
			return response[response.length - 1];
		} else if (object.idProcess) {
			response = cvReportFiles.READ({
				where: [{
					field: "idProcess",
					oper: "=",
					value: object.idProcess
				}]
			});
			return response[response.length - 1];
		}
	} catch (e) {
		return e;
	}
	return response;
};
this.getReportFilesSPED = function(object) {
	var response = {};
	try {
		var where = [];
		if (object.idSped) {
			var where = [{
				field: "idSped",
				oper: "=",
				value: object.idSped
			}];
		}
		if (object.searchParams) {
			for (var p in object.searchParams) {
				if (this.searchKeys.hasOwnProperty(p) && this.searchKeys[p] && object.searchParams[p] !== "") {
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
						case "name":
							where.push({
								table: cvReportFiles,
								field: "fileName",
								oper: "LIKE",
								value: "%" + object.searchParams[p] + "%"
							});
							break;
						case "idCompany":
						case "idBranch":
							where.push({
								table: cvReportFiles,
								field: this.searchKeys[p],
								oper: '=',
								value: object.searchParams[p]
							});
					}
				}
			}
		}

		response = runSPEDTable.READ({
			join: [{
				table: cvReportFiles,
				alias: "reportFiles",
				on: [{
					left: "idRun",
					right: "idRun"
				}]
			}, {
				table: usersModel,
				alias: "creationUserData",
				fields: ["id", "name", "last_name"],
				on: [{
					left: "creationUser",
					right: "id"
				}],
				outer: "left"
			}, {
				table: usersModel,
				alias: "modificationUserData",
				rename: "A",
				fields: ["id", "name", "last_name"],
				on: [{
					left: "modificationUser",
					right: "id"
				}],
				outer: "left"
			}],
			where: where.length ? where : undefined,
			paginate: {
				size: 5,
				number: Number(object.page || 1),
				count: true
			}
		});
		//   response = [{reportFiles: [{idFile:'0EF0825C851D1ED78ABD9082865BB4D3',fileName: "chuchis.txt"}],creationUserData:[{}],modificationUserData:[{}]}];
	} catch (e) {
		return e;
	}
	var pageCount = parseInt(response.pageCount || 1, 10);
	return {
		files: response,
		pageCount: pageCount,
		filterOptions: object.noFilters ? undefined : this.filters({
			reportFiles: true
		})
	};
};
this.exportTOMFile = function(object) {
	var response2 = coreApi.executeTOMExternalService("GET", object.adapter, object.destination, object.idFile);

	return {
		file: response2.xml
	};
};

//------05/09/2017  - KBARA-----//
this.verifyJOBUpdate = function(object) {
	try {
		if (object.idCompany && object.idBranch && object.subperiod) {
			var jobs = modelJobSPEDExecutions.readSpedExecutions({
				fields: ["id", "executionData", "status"],
				where: [{
					field: "idCompany",
					oper: "=",
					value: object.idCompany
				}, {
					field: "idBranch",
					oper: "=",
					value: object.idBranch
				}, {
					field: "subperiod",
					oper: "=",
					value: object.subperiod
				}, {
					field: "status",
					oper: "=",
					value: 2
				}]
			});
			if (jobs.length) {
				var deletes = {};
				for (var j = 0; j < jobs.length; j++) {
					var executionData = JSON.parse(jobs[j].executionData);
					if (executionData.tablesInsert) {
						for (var table in executionData.tablesInsert) {
							if (!deletes[table]) {
								deletes[table] = {
									keys: {},
									schema: executionData.tablesInsert[table].schema
								};
							}
							for (var v in executionData.tablesInsert[table].values) {
								if (!deletes[table].keys[v]) {
									var whereClause = [];
									for (var c = 0; c < executionData.tablesInsert[table].columns.length; c++) {
										if (executionData.tablesInsert[table].columns[c].isKey) {
											whereClause.push(executionData.tablesInsert[table].columns[c].name + " = \'" + executionData.tablesInsert[table].values[v][
												executionData.tablesInsert[table].columns[c].name
											] + "\'");
										}
									}
									deletes[table].keys[v] = whereClause.join(" AND ");
								}
							}
						}
					}
					modelJobSPEDExecutions.updateSpedExecutionStatus(jobs[j].id, 4);
				}
				return deletes;
			}
			return {};
		}
	} catch (e) {
		$.messageCodes.push({
			code: "DFG214018",
			type: "E",
			errorInfo: util.parseError(e)
		});
	}
	return {};
};

this.eSocialSend = function(object) {
	let response = {};
	try {
		if (!_.isNil(object)) {
			let queries = this.getESocialQuery(object, object.data, true).queries;
			let queriesExecute = this.executeESocialQueries(queries);
			let send = true;
			let errors = [];
			_.forEach(queriesExecute, function(query) {
				send = send && (!_.isNil(query.errors) && !_.isEmpty(query.errors));
				errors = _.concat(errors, query.errors || []);
			});
			response.queriesResponse = queriesExecute;
			response.send = send;
			response.errors = errors;
		}
	} catch (e) {
		response.errors = [util.parseError(e)];
		response.send = false;
		$.messageCodes.push({
			code: "DFG214020",
			type: "E",
			errorInfo: util.parseError(e)
		});
	}
	return response;
};

this.getESocialQuery = function(object, data, isForExecute) {
	let coreConfigModel = $.createBaseRuntimeModel($.schema.slice(1, -1), 'CORE::CONFIGURATION', false, true);
	let configuration = coreConfigModel.find({
		select: [{
			field: 'key'
		}, {
			field: 'value'
		}],
		where: [{
			field: 'key',
			operator: '$in',
			value: ['ECC::CLIENT', 'TIMP::TDFIntegration', 'TDF::SCHEMA']
		}]
	}).results;
	if (!_.isNil(configuration) && !_.isEmpty(configuration)) {
		let mandt, tdf, schema, params;

		_.forEach(configuration, function(item) {
			switch (item.key) {
				case 'ECC::CLIENT':
					mandt = item.value;
					break;
				case 'TIMP::TDFIntegration':
					tdf = [true, 'true'].indexOf(item.value) !== -1;
					break;
				case 'TDF::SCHEMA':
					schema = item.value;
					break;
			}
		});
		params = this.getESocialDictionary(Number(object.type) || 6, object.subType, mandt, schema);
		if (tdf) {

			let queries = this.eSocialParserQueries(schema, params, data);
			return {
				queries: queries,
				herarchy: params.relations,
				header: params.header,
				type: params.type
			};
		} else {
			throw {};
		}
	} else {
		$.messageCodes.push({
			code: "DFG214019",
			type: "E",
			errorInfo: 'Core Configuration not Found'
		});
		data.tdf = false;
		return [];
	}
};

this.executeESocialQueries = function(queries) {
	let response = [];
	_.forEach(queries, function(query) {
		let queryResponse = $.execute(query.masterQuery, null, false);
		if (_.isEmpty(queryResponse.errors)) {
			if (_.isEmpty(queryResponse.results)) {
				queryResponse = $.execute(query.insertQuery, null, true);
			} else {
				queryResponse = $.execute(query.updateQuery, null, true);
			}
		}
		response.push(queryResponse);
	});
	return response;
};

this.getESocialDictionary = function(type, subType, mandt, schema) {
	let data = {};
	let eSocialType = '';
	switch (type) {
		case 6:
			eSocialType = 's1070';
			break;
	}

	let dictionary = {
		'MANDT': {
			'field': '',
			'value': mandt,
			'formatType': '',
			'format': ''
		},
		'ID_EVENTO': {
			'field': '',
			'value': '',
			'formatType': '',
			'format': '',
			'transform': {
				parameters: ['id'],
				tableParameters: ['type'],
				execute: function(id, type) {
					if (type) {
						return "'" + id + "-" + eSocialType.toUpperCase() + "-" + (subType === 's1070Insert' ? 'I' : subType === 's1070Delete' ? "E" : "A") +
							"-" + type + "'";
					} else {
						return "'" + id + "-" + eSocialType.toUpperCase() + "-" + (subType === 's1070Insert' ? 'I' : subType === 's1070Delete' ? "E" : "A") +
							"'";
					}
				}
			}
		},
		'ACTION_TYPE': {
			'field': '',
			'value': subType === 's1070Insert' ? 'I' : subType === 's1070Delete' ? "E" : "A",
			'formatType': '',
			'format': ''
		},
		'PROC_EMI': {
			'field': '',
			'value': '1',
			'formatType': '',
			'format': ''
		},
		'INI_VALID': {
			'field': 'effectiveDateFrom',
			'value': 1,
			'formatType': 'date',
			'format': 'YYYYMM'
		},
		'FIM_VALID': {
			'field': 'effectiveDateTo',
			'value': 1,
			'formatType': 'date',
			'format': 'YYYYMM'
		},
		'RECORD_ID_1': {
			'field': '',
			'value': '033',
			'formatType': '',
			'format': '',
			'rename': 'RECORD_ID'
		},
		'RECORD_ID_2': {
			'field': '',
			'value': '045',
			'formatType': '',
			'format': '',
			'rename': 'RECORD_ID'
		},
		'RECORD_ID_3': {
			'field': '',
			'value': '046',
			'formatType': '',
			'format': '',
			'rename': 'RECORD_ID'
		},
		'TP_PROC': {
			'field': 'processTypeValue',
			'value': '',
			'formatType': '',
			'format': ''
		},
		'NR_PROC': {
			'field': 'processNumber',
			'value': '',
			'formatType': '',
			'format': ''
		},
		'IND_AUTORIA': {
			'field': 'authorshipTypeValue',
			'value': '',
			'formatType': '',
			'format': ''
		},
		'IND_MAT_PROC': {
			'field': 'processClassValue',
			'value': '',
			'formatType': '',
			'format': ''
		},
		'UF_VARA': {
			'field': 'uf',
			'value': '',
			'formatType': '',
			'format': ''
		},
		'COD_MUNIC': {
			'field': 'countyCode',
			'value': '',
			'formatType': '',
			'format': ''
		},
		'PARENT_ID': {
			'field': '',
			'value': '033',
			'formatType': '',
			'format': ''
		},
		'COD_SUSP': {
			'field': 'suspensionCode',
			'value': '',
			'formatType': '',
			'format': ''
		},
		'IND_SUSP': {
			'field': 'suspensionIndicativeValue',
			'value': '',
			'formatType': '',
			'format': ''
		},
		'DT_DECISAO': {
			'field': 'publicationDate',
			'value': '',
			'formatType': 'date',
			'format': 'YYYYMM'
		},
		'IND_DEPOSITO': {
			'field': 'integralDeposit',
			'value': '',
			'formatType': '',
			'format': ''
		},
		'EVENT_TYPE': {
			'field': '',
			'value': 'S1070',
			'formatType': '',
			'format': ''
		},
		'VERSAO': {
			'field': '',
			'value': '',
			'formatType': '',
			'format': ''
		},
		'STATUS': {
			'field': '',
			'value': subType === 's1070Insert' ? 'C' : subType === 's1070Delete' ? "E" : "A",
			'formatType': '',
			'format': ''
		},
		'LOGSYS': {
			'field': '',
			'value': '',
			'formatType': '',
			'format': '',
			'table': {
				"name": '/TMF/MD_LOGSYS',
				"schema": schema,
				'conditions': {
					'MANDT': mandt
				},
				'field': 'LOGSYS'
			}
		},
		'CREATION_TIME': {
			'field': 'creationDate',
			'value': '',
			'formatType': 'date',
			'format': 'H'
		},
		'CREATION_USER': {
			'field': 'creationUsername',
			'value': '',
			'formatType': '',
			'format': ''
		},
		'TP_AMB': {
			'field': '',
			'value': '',
			'formatType': '',
			'format': '',
			'table': {
				"name": 'T5F99K2',
				'schema': schema,
				"where": {
					'conditions': [{
						'MOLGA': 37,
						'OPTIO': 'EFDET',
						'MANDT': mandt
					}]
				},
				'results': {
					'true': 1,
					'false': 2
				}
			}
		},
		'VER_PROC': {
			'field': '',
			'value': 'SAP_HRCBR',
			'formatType': '',
			'format': ''
		},
		'TP_INSC_EVT': {
			'field': '',
			'value': '1',
			'formatType': '',
			'format': ''
		},
		'NR_INSC_EVT': {
			'field': '',
			'value': '',
			'formatType': '',
			'format': '',
			'table': {
				"name": '/TMF/MD_CERTCFG-NR_INSCRICAO',
				"where": {
					'conditions': [{
						'MANDT': mandt
					}]
				},
				'field': 'CNPJ'
			}
		},
		'ID_VARA': {
			'field': 'judicialRod',
			'value': '',
			'formatType': '',
			'format': ''
		}
	};

	data.s1070 = {
		s1070Insert: {
			header: {
				type: 'S1070',
				version: 'S2.4'
			},
			type: {
				subname: 'I',
				name: 'insert'
			},
			subHeader: true,
			master: '/TMF/HDSEVENTO',
			masterKeys: ['MANDT', 'ID_EVENTO'],
			relations: [{
				table: '/TMF/MDSEVENTO',
				children: [{
					table: '/TMF/HDSEVENTO',
					children: [{
						table: '/TMF/HDSTPROCESS 033',
						children: [{
							table: '/TMF/HDSTSUSPINF 045'
						}, {
							table: '/TMF/HDSTSUSPINF 046'
						}]
					}]
				}]
			}],
			dictionary: dictionary,
			inserts: [{
				table: '/TMF/HDSEVENTO',
				fields: ['MANDT', 'ID_EVENTO', 'ACTION_TYPE', 'PROC_EMI', 'INI_VALID', 'FIM_VALID'],
				params: {}
			}, {
				table: '/TMF/HDSTPROCESS',
				fields: ['MANDT', 'ID_EVENTO', 'RECORD_ID_1', 'TP_PROC', 'NR_PROC', 'IND_AUTORIA', 'IND_MAT_PROC', 'UF_VARA', 'COD_MUNIC', 'ID_VARA'],
				params: {}
			}, {
				table: '/TMF/HDSTSUSPINF',
				fields: ['MANDT', 'ID_EVENTO', 'RECORD_ID_2', 'PARENT_ID', 'COD_SUSP', 'IND_SUSP', 'DT_DECISAO', 'IND_DEPOSITO'],
				params: {
					type: '046'
				}
			}, {
				table: '/TMF/HDSTSUSPINF',
				fields: ['MANDT', 'ID_EVENTO', 'RECORD_ID_3', 'PARENT_ID', 'COD_SUSP', 'IND_SUSP', 'DT_DECISAO', 'IND_DEPOSITO'],
				params: {
					type: '045'
				},
			}, {
				table: '/TMF/MDSEVENTO',
				fields: ['MANDT', 'ID_EVENTO', 'EVENT_TYPE', 'VERSAO', 'STATUS', 'LOGSYS', 'CREATION_TIME', 'CREATION_USER', 'TP_AMB', 'VER_PROC',
					'TP_INSC_EVT', 'NR_INSC_EVT'
				],
				params: {}
			}]
		},
		s1070Delete: {
			header: {
				type: 'S1070',
				version: 'S2.4'
			},
			type: {
				subname: 'E',
				name: 'delete'
			},
			subHeader: true,
			master: '/TMF/HDSEVENTO',
			masterKeys: ['MANDT', 'ID_EVENTO'],
			relations: [{
				table: '/TMF/MDSEVENTO',
				children: [{
					table: '/TMF/HDSEVENTO',
					children: [{
						table: '/TMF/HDSTPROCESS 033',
						children: [{
							table: '/TMF/HDSTSUSPINF 045'
						}, {
							table: '/TMF/HDSTSUSPINF 046'
						}]
					}]
				}]
			}],
			dictionary: dictionary,
			inserts: [{
				table: '/TMF/HDSEVENTO',
				fields: ['MANDT', 'ID_EVENTO', 'ACTION_TYPE', 'PROC_EMI', 'INI_VALID', 'FIM_VALID'],
				params: {}
			}, {
				table: '/TMF/HDSTPROCESS',
				fields: ['MANDT', 'ID_EVENTO', 'RECORD_ID_1', 'TP_PROC', 'NR_PROC'],
				params: {}
			}, {
				table: '/TMF/HDSTSUSPINF',
				fields: ['MANDT', 'ID_EVENTO', 'RECORD_ID_2', 'PARENT_ID', 'COD_SUSP', 'IND_SUSP', 'DT_DECISAO', 'IND_DEPOSITO'],
				params: {}
			}, {
				table: '/TMF/HDSTSUSPINF',
				fields: ['MANDT', 'ID_EVENTO', 'RECORD_ID_3', 'PARENT_ID', 'COD_SUSP', 'IND_SUSP', 'DT_DECISAO', 'IND_DEPOSITO'],
				params: {}
			}, {
				table: '/TMF/MDSEVENTO',
				fields: ['MANDT', 'ID_EVENTO', 'EVENT_TYPE', 'VERSAO', 'STATUS', 'LOGSYS', 'CREATION_TIME', 'CREATION_USER', 'TP_AMB', 'VER_PROC',
					'TP_INSC_EVT', 'NR_INSC_EVT'
				],
				params: {}
			}]
		},
		s1070Update: {
			header: {
				type: 'S1070',
				version: 'S2.4'
			},
			type: {
				subname: 'A',
				name: 'update'
			},
			subHeader: true,
			master: '/TMF/HDSEVENTO',
			masterKeys: ['MANDT', 'ID_EVENTO'],
			relations: [{
				table: '/TMF/MDSEVENTO',
				children: [{
					table: '/TMF/HDSEVENTO',
					children: [{
						table: '/TMF/HDSTPROCESS 033',
						children: [{
							table: '/TMF/HDSTSUSPINF 045'
						}, {
							table: '/TMF/HDSTSUSPINF 046'
						}]
					}]
				}]
			}],
			dictionary: dictionary,
			inserts: [{
				table: '/TMF/HDSEVENTO',
				fields: ['MANDT', 'ID_EVENTO', 'ACTION_TYPE', 'PROC_EMI', 'INI_VALID', 'FIM_VALID', 'INI_VALID_ANT', 'FIM_VALID_ANT'],
				params: {}
			}, {
				table: '/TMF/HDSTPROCESS',
				fields: ['MANDT', 'ID_EVENTO', 'RECORD_ID_1', 'TP_PROC', 'NR_PROC', 'IND_AUTORIA', 'IND_MAT_PROC', 'UF_VARA', 'COD_MUNIC', 'ID_VARA'],
				params: {}
			}, {
				table: '/TMF/HDSTSUSPINF',
				fields: ['MANDT', 'ID_EVENTO', 'RECORD_ID_2', 'PARENT_ID', 'COD_SUSP', 'IND_SUSP', 'DT_DECISAO', 'IND_DEPOSITO'],
				params: {}
			}, {
				table: '/TMF/HDSTSUSPINF',
				fields: ['MANDT', 'ID_EVENTO', 'RECORD_ID_3', 'PARENT_ID', 'COD_SUSP', 'IND_SUSP', 'DT_DECISAO', 'IND_DEPOSITO'],
				params: {}
			}, {
				table: '/TMF/MDSEVENTO',
				fields: ['MANDT', 'ID_EVENTO', 'EVENT_TYPE', 'VERSAO', 'STATUS', 'LOGSYS', 'CREATION_TIME', 'CREATION_USER', 'TP_AMB', 'VER_PROC',
					'TP_INSC_EVT', 'NR_INSC_EVT'
				],
				params: {}
			}]
		}
	};

	return data[eSocialType][subType];
};

this.eSocialParserQueries = function(schema, metadata, objectData) {
	let queries = [];

	_.forEach(metadata.inserts, function(data) {
		let masterQuery = 'SELECT ' + metadata.masterKeys.join(",") + ' FROM "' + schema + '"."' + data.table + '"';
		let updateQuery = 'UPDATE "' + schema + '"."' + data.table + '" SET ';
		let values = [],
			insertParams = [],
			updateParams = [],
			whereParams = [];

		let insertQuery = 'INSERT INTO "' + schema + '"."' + data.table + '" (';

		_.forEach(data.fields, function(field) {
			if (metadata.dictionary[field]) {
				let name = metadata.dictionary[field].rename || field;
				let value = "";

				if (!_.isEmpty(metadata.dictionary[field].field)) {
					let fieldName = metadata.dictionary[field].field;
					if (_.isEmpty(metadata.dictionary[field].formatType)) {
						insertParams.push(name);
						value = _.isPlainObject(objectData[fieldName] || "") ? "'" + objectData[fieldName].key + "'" : "'" + objectData[fieldName] + "'";
						updateParams.push(name + " = " + value);
						values.push(value);
					} else {
						if (metadata.dictionary[name].formatType === 'date') {
							if (!_.isNil(objectData[fieldName])) {
								value = " '" + $.moment(objectData[fieldName]).format(metadata.dictionary[field].format) + "' ";
								values.push(value);
							} else {
								value = "''";
								values.push(value);
							}
							updateParams.push(name + " = " + value);
							insertParams.push(name);
						}
					}

					if (metadata.masterKeys.indexOf(name) !== -1) {
						whereParams.push(name + " = " + value);
					}
				} else if (!_.isEmpty(metadata.dictionary[field].value)) {
					value = " '" + metadata.dictionary[field].value + "' ";
					values.push(value);
					insertParams.push(name);
					updateParams.push(name + " = " + value);

					if (metadata.masterKeys.indexOf(field) !== -1) {
						whereParams.push(name + " = " + value);
					}
				} else if (!_.isEmpty(metadata.dictionary[field].table)) {
					let table = metadata.dictionary[field].table;
					let conditions = _.map(table.conditions, function(keyValue, keyName) {
						return keyName + " = '" + keyValue + "'";
					}).join(" AND ");

					let existTableQuery = 'SELECT TABLE_NAME AS Table FROM  M_CS_TABLES  WHERE  TABLE_NAME = ' + table.name;
					let existsQuery = $.execute(existTableQuery, null, false);
					let queryValue = "''";

					if (!_.isEmpty(existsQuery.results)) {
						let tableQuery = 'SELECT ' + table.field + ' from "' + table.schema + '"."' + table.name + '" WHERE ' + conditions;
						let query = $.execute(tableQuery, null, false);

						if (_.has(table, 'results')) {
							if (!_.isEmpty(query.results)) {
								queryValue = "'" + table.results['true'] + "'";
							} else {
								queryValue = "'" + table.results['false'] + "'";
							}
							
						} else {
							if (!_.isEmpty(query.results)) {
								queryValue = "'" + query.results[0][table.field] + "'";
							}
						}
					} else {
						if (_.has(table, 'results')) {
							queryValue = "'" + table.results['false'] + "'";
						}
					}

					values.push(queryValue);
					insertParams.push(name);
					updateParams.push(name + " = " + queryValue);

					if (metadata.masterKeys.indexOf(name) !== -1) {
						whereParams.push(name + " = " + queryValue);
					}
				} else if (!_.isEmpty(metadata.dictionary[field].transform)) {
					let transform = metadata.dictionary[field].transform;
					let parameters = _.map(transform.parameters, function(parameter) {
						return objectData[parameter];
					});

					let tableParameters = _.map(transform.tableParameters, function(parameter) {
						return data.params[parameter];
					});

					parameters = parameters.concat(tableParameters);
					let valueResult = transform.execute(...parameters);
					values.push(valueResult);
					insertParams.push(name);
					updateParams.push(name + " = " + valueResult);

					if (metadata.masterKeys.indexOf(name) !== -1) {
						whereParams.push(name + " = " + valueResult);
					}
				}
			}
		});

		insertQuery += insertParams.join(',');
		insertQuery += ") VALUES (";
		insertQuery += values.join(',');
		insertQuery += ")";
		updateQuery += " " + updateParams.join(',');
		updateQuery += " WHERE " + whereParams.join(' AND ');
		masterQuery += " WHERE " + whereParams.join(' AND ');
		queries.push({
			insertQuery: insertQuery,
			updateQuery: updateQuery,
			masterQuery: masterQuery
		});
	});
	return queries;
};