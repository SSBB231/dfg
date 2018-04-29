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
var config = core_api.configController;

$.import("timp.atr.server.api", "api");
var atr_api = $.timp.atr.server.api.api;
var modelStructure = atr_api.structure.table;
var tributoModel = atr_api.tributo.table;
var companyBranches = atr_api.companyBranches.table;

$.import("timp.dfg.server.models", "digitalFile");
var modelDigitalFile = $.timp.dfg.server.models.digitalFile;
var modelDigitalFileXBranch = $.timp.dfg.server.models.digitalFile.digitalFileXBranch;
var modelDigitalFileXUf = $.timp.dfg.server.models.digitalFile.digitalFileXUf;
$.import("timp.dfg.server.models", "setting");
var modelSetting = $.timp.dfg.server.models.setting.table;

$.import("timp.dfg.server.models", "settingVersion");
var modelSettingVersion = $.timp.dfg.server.models.settingVersion.table;

$.import("timp.dfg.server.models", "layout");
var modelLayout = $.timp.dfg.server.models.layout.table;

$.import("timp.dfg.server.models", "layoutXStructure");
var modelLayoutXStructure = $.timp.dfg.server.models.layoutXStructure.table;

$.import('timp.dfg.server.controllers', 'digitalFileType');
var controllerDigitalFileType = $.timp.dfg.server.controllers.digitalFileType;

$.import('timp.dfg.server.models', 'digitalFileTypeText');
var modelDigitalFileTypeText = $.timp.dfg.server.models.digitalFileTypeText;

$.import('timp.dfg.server.controllers', 'external');
var controllerExternal = $.timp.dfg.server.controllers.external;

$.import("timp.dfg.server.models", "layoutVersion");
var modelLayoutVersion = $.timp.dfg.server.models.layoutVersion.table;

$.import('timp.dfg.server.controllers', 'util');
var utilDFG = $.timp.dfg.server.controllers.util;

$.import('timp.dfg.server.controllers', 'log');
var logDFG = $.timp.dfg.server.controllers.log.Supervisor;


$.import('timp.dfg.server.controllers', 'xmlDigitalFile');
var xmlDigitalFile = $.timp.dfg.server.controllers.xmlDigitalFile;

this.status = {
	ACTIVE: 100,
	ISSUED: 200,
	OFFICIAL: 300,
	SENT: 400,
	RECTIFIED: 500
};

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
	sent: "status",
	rectifier: "rectifier"
};

/*
    service to list the digitalFiles (without folder structure)
    object = {
        idDigitalFileType: integer || [integer] (optional)
        idCompany: string || [string] (optional)
        uf: string || [string] (optional)
        idBranch: string || [string] (optional)
        idTax: string || [string] (optional)
    }
*/
this.list = function(object) {
	try {
		object = object || $.request.parameters.get("object");
		if (typeof object === "string") {
			object = JSON.parse(object);
		}
		var root, shared;

		if (object.hasOwnProperty("root")) {
			root = fileCRUDF.listFolderTree(object.root);
		}
		if (object.hasOwnProperty("shared")) {
			shared = fileCRUDF.listFolderTree(object.shared);
		}
		if (object.hasOwnProperty("ids")) {
			object.ids = fileCRUDF.listFile(object.ids);

		}
		var join = [{
			outer: 'left',
			table: modelSettingVersion,
			alias: 'version',
			on: [{
				left: 'idSettingVersion',
				right: 'id'
        }]
    }, {
			outer: 'left',
			table: modelSetting,
			alias: 'setting',
			on: [{
				left_table: modelSettingVersion,
				left: 'idSetting',
				right: 'id'
        }]
    }];
		controllerDigitalFileType.tableJoin({
			table: modelSetting,
			field: 'idDigitalFileType',
			array: join
		});
		// return join
		var where = [];
		// filter by idDigitalFileType
		var typesWhere = [];
		utilDFG.propertyArrayOrSingle({
			instance: object,
			property: 'idDigitalFileType',
			callback: function(object) {
				typesWhere.push({
					field: object.property,
					oper: '=',
					value: object.value,
					table: modelSetting
				});
			}
		});
		if (typesWhere.length) {
			where.push(typesWhere);
		}
		// query to get the ids of the layouts with the filter by eefi
		var filters = ['idCompany', 'uf', 'idBranch', 'idTax'];
		for (var i = 0; i < filters.length; i++) {
			var filtersWhere = [];
			utilDFG.propertyArrayOrSingle({
				instance: object,
				property: filters[i],
				callback: function(object) {
					filtersWhere.push({
						field: object.property,
						oper: '=',
						value: object.value
					});
				}
			});
			if (filtersWhere.length) {
				where.push(filtersWhere);
			}
		}
		if (object.filters !== undefined) {
			if (object.filters.hasOwnProperty('type')) {
				where.push({
					field: 'idDigitalFileType',
					oper: '=',
					value: object.filters.type,
					table: modelSetting
				});
			}
		}
		// read the digitalFiles
		// return where
		var digitalFiles = modelDigitalFile.table.READ({
			join: join,
			where: where,
			order_by: ['name']
		});

		if (digitalFiles) {
			for (var l = 0; l < digitalFiles.length; l++) {
				if (digitalFiles[l].digitalFileType[0] !== undefined) {
					digitalFiles[l].digitalFileType = {
						id: digitalFiles[l].digitalFileType[0].id,
						iconFont: digitalFiles[l].digitalFileType[0].iconFont,
						icon: digitalFiles[l].digitalFileType[0].icon,
						name: digitalFiles[l].digitalFileTypeText[0].name,
						description: digitalFiles[l].digitalFileTypeText[0].description
					}

				}

				digitalFiles[l].version = {
					id: digitalFiles[l].version[0].id,
					idSetting: digitalFiles[l].version[0].idSetting,
					idLayout: digitalFiles[l].version[0].idLayout,
					legalVersion: digitalFiles[l].version[0].legalVersion,
					validFrom: digitalFiles[l].version[0].validFrom,
					pageLimit: digitalFiles[l].version[0].pageLimit,
					status: digitalFiles[l].version[0].status,
					creationDate: digitalFiles[l].version[0].creationDate,
					creationUser: digitalFiles[l].version[0].creationUser,
					modificationDate: digitalFiles[l].version[0].modificationDate,
					modificationUser: digitalFiles[l].version[0].modificationUser
				};
				if (digitalFiles[l].setting[0] !== undefined) {
					digitalFiles[l].setting = {
						id: digitalFiles[l].setting[0].id,
						idDigitalFileType: digitalFiles[l].setting[0].idDigitalFileType,
						name: digitalFiles[l].setting[0].name,
						description: digitalFiles[l].setting[0].description,
						creationDate: digitalFiles[l].setting[0].creationDate,
						creationUser: digitalFiles[l].setting[0].creationUser,
						modificationDate: digitalFiles[l].setting[0].modificationDate,
						modificationUser: digitalFiles[l].setting[0].modificationUser
					};

				}
				var idFile = fileCRUDF.list({
					idObject: digitalFiles[l].id,
					objectType: "DFG::DigitalFile"
				});
				var sharedFile = fileShare.listFileShare({
					objectType: "DFG::DigitalFile"
				});

				if (idFile.length > 0) {
					digitalFiles[l].idFile = idFile[0].id;
					if (sharedFile.length > 0) {
						if (digitalFiles[l].idFile == sharedFile[0].idFile) {
							digitalFiles[l].shared = 'Shared';
						} else {
							digitalFiles[l].shared = idFile[0].status;
						}
					} else {
						digitalFiles[l].shared = idFile[0].status;
					}
				}

				digitalFiles[l].is = {
					favorite: false,
					deleted: false
				};
				delete digitalFiles[l].digitalFileTypeText;
				delete digitalFiles[l].layoutXStructure;
			}
		}
		for (var currentList = 0; currentList < digitalFiles.length; currentList++) {
			var creationUser = usersModel.READ({
				fields: ['id', 'name', 'last_name'],
				where: [{
					field: 'id',
					oper: '=',
					value: digitalFiles[currentList].creationUser
            }]
			})[0];
			if (creationUser) {
				digitalFiles[currentList].creationUser = creationUser.name + ' ' + creationUser.last_name;
			}
			var modificationUser = usersModel.READ({
				fields: ['id', 'name', 'last_name'],
				where: [{
					field: 'id',
					oper: '=',
					value: digitalFiles[currentList].modificationUser
            }]
			})[0];
			if (modificationUser) {
				digitalFiles[currentList].modificationUser = modificationUser.name + ' ' + modificationUser.last_name;
			}
			digitalFiles[currentList].ownerId = creationUser ? creationUser.id : null;
		}

		var _list = [];
		var favorites = fileCRUDF.listFavoriteFile({
			objectType: "DFG::DigitalFile"
		});
		var favoritesIds = [];
		for (var _i = 0; _i < favorites.length; _i++) {
			favoritesIds.push(favorites[_i].idFile);
		}
		var shares = fileShare.listShareFilesCreationUser({
			objectType: "DFG::DigitalFile"
		});
		var sharedIds = [];
		for (var _i = 0; _i < shares.length; _i++) {
			sharedIds.push(shares[_i].idFile)
		}

		if (object.hasOwnProperty("ids")) {
			for (var _i = 0; _i < object.ids.length; _i++) {
				for (var _items = 0; _items < digitalFiles.length; _items++) {
					if (object.ids[_i] == digitalFiles[_items].id) {
						if (favoritesIds.indexOf(digitalFiles[_items].idFile) >= 0) {
							digitalFiles[_items].is.favorite = true;
						}
						if (sharedIds.indexOf(digitalFiles[_items].idFile) >= 0) {
							digitalFiles[_items].shared = "Shared"
						}
						_list.push(digitalFiles[_items]);
					}
				}
			}
			digitalFiles = _list;
		} else if (object.key == "FAVORITE") {
			// var favorites = fileCRUDF.listFavoriteFile({objectType:"DFG::DigitalFile"});
			for (var i = 0; i < digitalFiles.length; i++) {
				if (favoritesIds.indexOf(digitalFiles[i].idFile) >= 0) {
					digitalFiles[i].is.favorite = true;
					if (sharedIds.indexOf(digitalFiles[i].idFile) >= 0) {
						digitalFiles[i].shared = "Shared";
					}
					_list.push(digitalFiles[i]);
				}
			}
		} else if (object.key == "STANDARD") {
			var files = fileCRUDF.listFiles({
				status: ['Standard'],
				objectType: "DFG::DigitalFile"
			})
			for (var i = 0; i < digitalFiles.length; i++) {
				for (var j = 0; j < files.length; j++) {
					if (digitalFiles[i].idFile == files[j].id) {
						if (favoritesIds.indexOf(digitalFiles[i].idFile) >= 0) {
							digitalFiles[i].is.favorite = true;
						}
						_list.push(digitalFiles[i]);
					}
				}
			}
		} else if (object.key == "PUBLIC") {
			var files = fileCRUDF.listFiles({
				status: ['Public'],
				objectType: "DFG::DigitalFile"
			})
			for (var i = 0; i < digitalFiles.length; i++) {
				for (var j = 0; j < files.length; j++) {
					if (digitalFiles[i].idFile == files[j].id) {
						if (favoritesIds.indexOf(digitalFiles[i].idFile) >= 0) {
							digitalFiles[i].is.favorite = true;
						}
						_list.push(digitalFiles[i]);
					}
				}
			}
		} else if (object.key == "TRASH") {
			var files = fileCRUDF.listFiles({
				status: ['Trash']
			})
			for (var i = 0; i < digitalFiles.length; i++) {
				for (var j = 0; j < files.length; j++) {
					if (digitalFiles[i].idFile == files[j].id) {
						_list.push(digitalFiles[i]);
					}
				}
			}
		} else if (object.key == "ACTIVE") {
			var files = fileCRUDF.listFiles({
				status: ['Active']
			})
			for (var i = 0; i < digitalFiles.length; i++) {
				for (var j = 0; j < files.length; j++) {
					if (digitalFiles[i].idFile == files[j].id) {
						_list.push(digitalFiles[i]);
					}
				}
			}
		} else if (object.key == "SHARED") {
			var files = fileShare.listFileShare({
				objectType: "DFG::DigitalFile"
			})
			for (var i = 0; i < digitalFiles.length; i++) {
				for (var j = 0; j < files.length; j++) {
					if (digitalFiles[i].idFile == files[j].file[0].id) {
						if (favoritesIds.indexOf(digitalFiles[i].idFile) >= 0) {
							digitalFiles[i].is.favorite = true;
						}
						digitalFiles[i].shared = "Shared";
						_list.push(digitalFiles[i]);
					}
				}
			}
		} else if (_list.length == 0) {
			var favoritesFiles = fileCRUDF.listFavoriteFile({
				objectType: "DFG::DigitalFile"
			});
			var files = fileCRUDF.listFiles({
				status: ['Standard', 'Public'],
				objectType: "DFG::DigitalFile"
			});
			var sharedFiles = fileShare.listFileShare({
				objectType: "DFG::DigitalFile"
			});
			var privateFiles = fileCRUDF.listAllUserFiles();
			files = files.concat(privateFiles);

			for (var i = 0; i < digitalFiles.length; i++) {
				for (var j = 0; j < files.length; j++) {
					if (digitalFiles[i].idFile == files[j].id) {
						if (JSON.stringify(_list).indexOf(JSON.stringify(digitalFiles[i])) < 0) {
							_list.push(digitalFiles[i]);
						}
					}
				}
				for (var j = 0; j < favoritesFiles.length; j++) {
					if (digitalFiles[i].idFile == favoritesFiles[j].file[0].id) {
						if (JSON.stringify(_list).indexOf(JSON.stringify(digitalFiles[i])) < 0) {
							_list.push(digitalFiles[i]);
						}
					}
				}
				for (var j = 0; j < sharedFiles.length; j++) {
					if (digitalFiles[i].idFile == sharedFiles[j].file[0].id) {
						if (JSON.stringify(_list).indexOf(JSON.stringify(digitalFiles[i])) < 0) {
							_list.push(digitalFiles[i]);
						}
					}
				}

			}
		}

		var counters = fileCRUDF.getCounters({
			objectType: "DFG::DigitalFile"
		});

		var response = {
			list: _list,
			filters: this.filters(),
			counter: counters,
			root: root,
			shared: shared
		};
		return response;
	} catch (e) {
		$.messageCodes.push({
			"code": "DFG204020",
			"type": 'E'
		});
	}
};

this.filters = function(object) {
	var response = {
		digitalFileTypes: controllerDigitalFileType.list(),
		companies: controllerExternal.listCompany(),
		status: {
			100: "NEW",
			200: "NEW",
			300: "STATUS COMPLETED",
			400: "STATUS COMPLETED",
			500: "ERROR"
		}
	};
	return response;
};

/*
    service to read a setting
    object = {
        id: integer
        structure: boolean (optional)
    }
*/
this.read = function(object) {
	object = object || $.request.parameters.get("object");
	if (typeof object === "string") {
		object = JSON.parse(object);
	}

	var join = [{
		outer: 'left',
		table: modelSettingVersion,
		alias: 'version',
		on: [{
			left: 'idSettingVersion',
			right: 'id'
        }]
    }, {
		outer: 'left',
		table: modelSetting,
		alias: 'setting',
		on: [{
			left_table: modelSettingVersion,
			left: 'idSetting',
			right: 'id'
        }]
    }, {
		outer: 'left',
		table: modelLayout,
		alias: 'layout',
		on: [{
			left_table: modelSettingVersion,
			left: 'idLayout',
			right: 'id'
        }]
    }];
	controllerDigitalFileType.tableJoin({
		table: modelDigitalFile.table,
		field: 'idDigitalFileType',
		array: join
	});
	join.push({
		table: modelLayoutXStructure,
		alias: 'layoutXStructure',
		on: [{
			left_table: modelLayout,
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
	var where = [{
		field: 'id',
		oper: '=',
		value: object.id
    }];
	var digitalFile = modelDigitalFile.table.READ({
		join: join,
		where: where
	});

	if (digitalFile && digitalFile.length) {
		digitalFile = digitalFile[0];
		digitalFile.digitalFileType = {
			id: digitalFile.digitalFileType[0].id,
			iconFont: digitalFile.digitalFileType[0].iconFont,
			icon: digitalFile.digitalFileType[0].icon,
			name: digitalFile.digitalFileTypeText[0].name,
			description: digitalFile.digitalFileTypeText[0].description
		};
		digitalFile.version[0] = core_api.usersController.getUserFullName(digitalFile.version[0]);
		digitalFile.version = {
			id: digitalFile.version[0].id,
			idSetting: digitalFile.version[0].idSetting,
			idLayout: digitalFile.version[0].idLayout,
			legalVersion: digitalFile.version[0].legalVersion,
			validFrom: digitalFile.version[0].validFrom,
			validTo: digitalFile.version[0].validTo,
			json: digitalFile.version[0].json,
			pageLimit: digitalFile.version[0].pageLimit,
			status: digitalFile.version[0].status,
			creationDate: digitalFile.version[0].creationDate,
			creationUser: digitalFile.version[0].creationUser,
			modificationDate: digitalFile.version[0].modificationDate,
			modificationUser: digitalFile.version[0].modificationUser
		};
		digitalFile.layout[0] = core_api.usersController.getUserFullName(digitalFile.layout[0]);
		digitalFile.layout = {
			id: digitalFile.layout[0].id,
			idDigitalFileType: digitalFile.layout[0].iddigitalFileType,
			legalVersion: digitalFile.layout[0].legalVersion,
			name: digitalFile.layout[0].name,
			description: digitalFile.layout[0].description,
			json: digitalFile.layout[0].json,
			status: digitalFile.layout[0].status,
			creationDate: digitalFile.layout[0].creationDate,
			creationUser: digitalFile.layout[0].creationUser,
			modificationDate: digitalFile.layout[0].modificationDate,
			modificationUser: digitalFile.layout[0].modificationUser
		};
		delete digitalFile.digitalFileTypeText;
		delete digitalFile.layoutXStructure;
		for (var i = 0; i < digitalFile.structure.length; i++) {
			if (digitalFile.structure[i].structure) {
				var structure = JSON.parse(digitalFile.structure[i].structure);
				structure.id = digitalFile.structure[i].id;
				structure.title = digitalFile.structure[i].title;
				digitalFile.structure[i] = structure;
			}
		}
		// LOG
		var logRegister = new logDFG();
		logRegister.executeDigitalFile(digitalFile);
	} else {
		digitalFile = false;
	}
	if (digitalFile.hasOwnProperty("idTax")) {
		digitalFile.idTax = tributoModel.READ({
			fields: ['codTributo', 'descrCodTributoLabel'],
			distinct: true,
			where: [{
				field: 'codTributo',
				oper: '=',
				value: digitalFile.idTax
            }]
		});
	}
	return digitalFile;
};

//<-----------------------------------Refactor-------------------------------------------------->
/**
 * @param {object} object - Endpoint parameter
 * @param {number} object.idUser - Optional ID of user to list user permitted files
 * @param {string} object.key - Key used to identify the type of listing to be done
 * @param {boolean | optional} object.counter - Optional parameter brings count results for all types of Digtial files
 * @param {object | optional} object.counter - Optional parameter brings the count for a specified type of Digital File
 * @return {object} object.list - Array with list of Digital Files depending on type
 * @return {object} object.counter - Array with list of counters for specified Digital File types
 */
this.listFiles = function(object) {
	var response = {};
	try {

		var files = [];
		var lang = ($.request.cookies.get("Content-Language") === "enus") ? "enus" : "ptrbr";
		var index = 0;
		var objectType = this.getIdObjectType("DFG::DigitalFile");
		object.idUser = user.getTimpUser().id;
		if (object.idFolder !== undefined && object.idFolder !== null) {
			files = fileCRUDFNew.listFilesByFolder({
				idUser: object.idUser,
				idFolder: object.idFolder,
				objectType: "DFG::DigitalFile",
				fields: ["idObject", "status"]
			});
		} else if(object.key === "FOLDER"){
			files = fileCRUDFNew.listFilesByUser({
				idUser: object.idUser,
				objectType: "DFG::Layout",
				fields: ["idObject", "status", "creationUser"]
			});
		} else {
			files = fileCRUDFNew.listFilesByStatus({
				status: (object.key === "OFFICIAL") ? "ACTIVE ONLY" : object.key,
				objectType: "DFG::DigitalFile",
				fields: ["idObject", "status", "creationUser"]
			});
			if (object.key === "OFFICIAL") {
				files = files.concat(fileCRUDFNew.listFilesByStatus({
					status: "PUBLIC",
					objectType: "DFG::DigitalFile",
					fields: ["idObject", "status"]
				}));
			}
		}
		if (files.length > 0) {
			var whereOptions = [[]];
			for (index = 0; index < files.length; index++) {
				whereOptions[0].push({
					field: "id",
					oper: "=",
					value: files[index].idObject
				});
			}
			if (object.key === "OFFICIAL") {
				whereOptions.push({
					field: "status",
					oper: "!=",
					value: "100"
				}, {
					field: "status",
					oper: "!=",
					value: "200"
				});
			}
			var join = [{
				outer: 'left',
				table: modelDigitalFileXBranch,
				alias: "idBranch2",
				on: [{
					left: "id",
					right: "idDigitalFile"
			    }]
			}, {
				outer: 'left',
				table: modelDigitalFileXUf,
				alias: "uf2",
				on: [{
					left_table: modelDigitalFile.table,
					left: "id",
					right: "idDigitalFile"
			    }]
			}, {
				table: modelDigitalFileTypeText.table,
				alias: "type",
				fields: ["name"],
				on: [{
					left_table: modelDigitalFile.table,
					left: "idDigitalFileType",
					right: "idDigitalFileType"
			    }, {
					field: "lang",
					oper: "=",
					value: lang,
					table: modelDigitalFileTypeText.table
				}],
				outer: "left"
			}, {
				table: usersModel,
				alias: "creationUser",
				fields: ["id", "name", "last_name"],
				on: [{
					left_table: modelDigitalFile.table,
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
					left_table: modelDigitalFile.table,
					left: "modificationUser",
					right: "id"
            	}],
				outer: "left"
            }, {
				table: fileFavsModel,
				alias: "favorite",
				fields: ["id"],
				on: [{
					left_table: modelDigitalFile.table,
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
			if (object.key === "SHARED") {
				join.push({
					table: fileShareModel,
					alias: "share",
					fields: ["id"],
					on: [{
						left_table: modelDigitalFile.table,
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
			var digitalFiles = modelDigitalFile.readDigitalFile({
				fields: ["id", "name", "description", "idCompany", "uf", "idBranch", "year", "month", "months", "subperiod", "status", "dateSent",
					"rectifier",
					"originalFile", "creationDate", "modificationDate"],
				join: join,
				where: whereOptions,
				order_by: order_by ? order_by : ['id'],
				paginate: {
					size: 15,
					number: Number(object.number),
					count: true
				}
			});
			response.pageCount = digitalFiles.pageCount;
			for (index in digitalFiles) {
				if (digitalFiles.hasOwnProperty(index)) {
					digitalFiles = digitalFiles.map(function(element) {
						if (element.idBranch2 && element.idBranch2.length) {
							var branches = element.idBranch2.map(function(b) {
								return b.idBranch;
							});
							element.idBranch = branches.join("\n");
						}
						if (element.uf2 && element.uf2.length) {
							var ufs = element.uf2.map(function(b) {
								return b.uf;
							});
							element.uf = ufs.join("\n");
						}
						for (var index2 = 0; index2 < files.length; index2++) {
							if (files[index2].idObject === element.id) {
								element.fileStatus = files[index2].status;
								return element;
							}
						}
					});
				}
			}
			response.list = digitalFiles;
		} else {
			response.list = [];
		}
		if (object.hasOwnProperty("counter") && object.counter) {
			var parameters = {
				objectType: "DFG::DigitalFile",
				counter: true
			};
			if (typeof object.counter === "object") {
				for (var key in object.counter) {
					if (object.counter.hasOwnProperty(key)) {
						parameters[key] = object.counter[key];
					}
				}
				response.counters = fileCRUDFNew.getFileCounters(parameters);
				if (parameters.official) {
					response.counters.official = this.getOfficialCounters();
				}
			} else {
				response.counters = fileCRUDFNew.getFileCounters(parameters);
				response.counters.official = this.getOfficialCounters();
			}
			response.showXMLTab = false;

		}
		response.filterOptions = {
			users: usersModel.READ(),
			type: controllerDigitalFileType.list(),
			company: companyBranches.getCompanyBranchesFilter(),
// 			company: controllerExternal.listCompany(),
// 			uf: controllerExternal.listUF(),
// 			branch: controllerExternal.listBranch(),
			rectifier: modelDigitalFile.readDigitalFile({
				fields: ["id", "name"]
			}),
			status: [{
				key: 1,
				name: "NEW"
		    }, {
				key: 2,
				name: "COMPLETED"
		    }, {
				key: 3,
				name: "ERROR"
		    }]
		};
	} catch (e) {
		$.trace.error(e);
		$.messageCodes.push({
			code: "DFG204020",
			type: "E",
			errorInfo: util.parseError(e)
		});
	}
	return response;
};

/**
 * @param {object} searchParams - endPoint Filters
 * @param {array} where - query Where Clause
 **/
this.evalSearchParams = function(searchParams, where) {
    var searchOR = [];
	for (var i in searchParams) {
	    if ( searchParams[i] === undefined || searchParams[i] === '') {
            continue;
	    }
		if (this.searchKeys[i] !== "creationDate" && this.searchKeys[i] !== "modificationDate") {
			if (i === "status") {
				if (searchParams[i] === 1) {
					where.push([{
						field: this.searchKeys[i],
						oper: "=",
						value: 100
                    }, {
						field: this.searchKeys[i],
						oper: "=",
						value: 200
                    }]);
				} else if (searchParams[i] === 2) {
					where.push([{
						field: this.searchKeys[i],
						oper: "=",
						value: 300
                    }, {
						field: this.searchKeys[i],
						oper: "=",
						value: 400
                    }]);
				} else {
					where.push({
						field: this.searchKeys[i],
						oper: "=",
						value: 500
					});
				}
			} else {
			    if (this.searchKeys.hasOwnProperty(i)) {
			//if we receive a name filter, we'll push it as an id
			if ( !isNaN(searchParams[i]) && !searchParams.hasOwnProperty("id") ) {
				searchOR.push({
					field: "id",
					oper: "=",
					value: searchParams[i]
				});

			}
			searchOR.push({
				field: this.searchKeys[i],
				oper: i === "name" ? "LIKE" : "=",
				value: i === "name" ? ("%" + searchParams[i].toUpperCase() + "%") : searchParams[i],
				maskFn: 'UPPER'
			});

		}
			}
		} else {
			var date = searchParams[i].split("T")[0];
			where.push({
				field: this.searchKeys[i],
				oper: (i === "creationDateFrom" || i === "modificationDateFrom") ? ">=" : "<=",
				value: date
			});
			
			
		}

	}
	if (searchOR.length) {
            where.push(searchOR);
		}
};

/**
 * @param {object} object - Endpoint parameter
 * @param {string} object.name - Digital File Name
 * @param {string} object.description - Digital File Description
 * @param {string} object.idCompany - Digital File Company for EEFI configutation
 * @param {string} object.uf - Digital File UF for EEFI configutation
 * @param {string} object.idTax - Digital File Tax for EEFI configutation
 * @param {string} object.year - Digital File Year for Fiscal Subperiod configuration
 * @param {string} object.month - Digital File Month for Fiscal Subperiod configuration
 * @param {string} object.subperiod - Digital File SubPeriod code for Fiscal Subperiod Configuration
 * @param {string} object.digitalFile - RawFile in string format result of the executed setting
 * @param {string} object.json - Layout Structure used in execution of the setting
 * @return {object} response - Resulting Digital File created in the database
 */
this.issue = function(object) {
	var response = {};

	try {
		object.digitalFile = JSON.stringify(object.digitalFile);
		object.status = this.status.ISSUED;
		response = modelDigitalFile.createDigitalFile(object);
		var layoutVersion = modelLayoutVersion.READ({
			where: [{
				field: "id",
				oper: "=",
				value: object.idLayoutVersion
				}]
		})[0];
		//var nextVersion = (parseInt(layoutVersion.version.split(".").join(""), 10) + 1).toString().replace(/\d/g, function(a, i, str) {
		//return a + (i === str.length - 1 ? "" : ".");
		//	});
		if (layoutVersion.idDigitalFile === null) {
			modelLayoutVersion.UPDATEWHERE({
				idDigitalFile: response.id
			}, {
				field: "id",
				oper: "=",
				value: object.idLayoutVersion
			});

		}
		if (!object.isSPED && object.version.idSetting) {
			var idFolder = fileCRUDFNew.getFile({
				idObject: object.version.idSetting,
				objectType: "DFG::Setting"
			})[0];
			var objectToCreateFile = {
				idFolder: idFolder.idFolder,
				idObject: response.id,
				objectType: "DFG::DigitalFile"
			};
			fileCRUDFNew.createFile(objectToCreateFile);
		} else {
			var objectToCreateFile = {
				idFolder: -1,
				idObject: response.id,
				objectType: "DFG::DigitalFile"
			};
			fileCRUDFNew.createFile(objectToCreateFile);
		}
		var logRegister = new logDFG();
		logRegister.issueDigitalFile(response);
	} catch (e) {
		$.trace.error(e);
		$.messageCodes.push({
			type: "E",
			code: "DFG204023",
			errorInfo: util.parseError(e)
		});
	}
	return response;
};

/**
 * @param {object} object - Endpoint parameter
 * @param {number} object.id - Digital File ID to be marked as sent
 * @return {object} response - Resulting Digital File created in the database
 */

this.send = function(object) {

	object = object || $.request.parameters.get("object");
	if (typeof object === "string") {
		object = JSON.parse(object);
	}
	var readOptions = {
		where: [{
			field: "id",
			oper: "=",
			value: object.id
        }, {
			field: "status",
			oper: "=",
			value: this.status.OFFICIAL
        }]
	};
	var digitalFile = modelDigitalFile.readDigitalFile(readOptions);
	if (digitalFile && digitalFile.length) {
		digitalFile = digitalFile[0];
		var where = [{
			field: "id",
			oper: "=",
			value: object.id
        }];
		var updateOptions = {
			status: this.status.SENT,
			dateSent: new Date(Date.now())
		};
		digitalFile = modelDigitalFile.updateDigitalFile(updateOptions, where);
		var logRegister = new logDFG();
		logRegister.sendDigitalFile(object);
	} else {
		$.messageCodes.push({
			"code": "DFG204024",
			"type": 'E'
		});
		return {};
	}
	return digitalFile;
};

/**
 * @param {object} object - Endpoint parameter
 * @param {number} object.id - Digital File ID to be marked as sent
 * @return {object} response - Resulting Digital File updated in the database
 */
this.officialize = function(object) {
	object = object || $.request.parameters.get("object");
	if (typeof object === "string") {
		object = JSON.parse(object);
	}

	var digitalFile = modelDigitalFile.readDigitalFile({
		where: [{
			field: "id",
			oper: '=',
			value: object.id
        }, {
			field: "status",
			oper: "=",
			value: this.status.ISSUED
        }]
	})[0];
	if (digitalFile && digitalFile.length) {
		var where = [{
			field: "id",
			oper: "=",
			value: object.id
        }];
		var updateForm = {
			status: this.status.OFFICIAL
		};
		digitalFile = modelDigitalFile.updateDigitalFile(updateForm, where);
		var logRegister = new logDFG();
		logRegister.officializeDigitalFile(object);
	} else {
		$.messageCodes.push({
			"code": "DFG204012",
			"type": 'E'
		});
		digitalFile = false;
	}
	return digitalFile;
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
 * @param {number} object.id - ID of DigitalFile to be exported
 * @return {object} result - Digital File
 * @return {object} result.id - ID of DigitalFile
 * @return {object} result.digitalFile - Raw file containing digital file
 * @return {object} result.json - Layout Structure definition
 */
this.export = function(object) {

	var result = {};
	try {
		object = object || $.request.parameters.get("object");
		if (typeof object === 'string') {
			object = util.__parse__(object);
		}
		return modelDigitalFile.readDigitalFile({
			fields: ["id", "digitalFile", "json"],
			where: [{
				field: "id",
				oper: "=",
				value: object.id
		        }]
		})[0];
	} catch (e) {
		$.trace.error(e);
		$.messageCodes.push({
			type: "E",
			code: "DFG204018",
			errorInfo: util.parseError(e)
		});
	}
	return result;
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
        		objectType: "DFG::DigitalFile",
        		idObject: unFavorites
        	});
        }
        if(favorites.length){
            result.unFavorites = fileCRUDFNew.unmarkFavorite({
        		objectType: "DFG::DigitalFile",
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
		objectType: "DFG::DigitalFile",
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

/**
 *  No parameters
 */
this.getOfficialCounters = function() {
	var count = 0;
	try {
		var files = [];
		var whereOptions = [];
		files = fileCRUDFNew.listFilesByStatus({
			status: "ACTIVE ONLY",
			objectType: "DFG::DigitalFile",
			fields: ["idObject", "status"]
		});
		files = files.concat(fileCRUDFNew.listFilesByStatus({
			status: "PUBLIC",
			objectType: "DFG::DigitalFile",
			fields: ["idObject", "status"]
		}));
		if (files.length === 0) {
			return count;
		} else {
			whereOptions.push([]);
		}
		for (var index in files) {
			if (files.hasOwnProperty(index)) {
				whereOptions[0].push({
					field: "id",
					oper: "=",
					value: files[index].idObject
				});
			}
		}
		whereOptions.push({
			field: "status",
			oper: "!=",
			value: "100"
		}, {
			field: "status",
			oper: "!=",
			value: "200"
		});
		count = modelDigitalFile.readDigitalFile({
			count: true,
			where: whereOptions
		})[0];
	} catch (e) {
		$.trace.error(e);
		$.messageCodes.push({
			type: "E",
			code: "DFG204021",
			errorInfo: util.parseError(e)
		});
	}
	return count;
};

this.getDigitalFiles = function(object) {
	var files = fileCRUDFNew.listFilesByStatus({
		status: "ACTIVE",
		objectType: "DFG::DigitalFile",
		fields: ["idObject", "status", "creationUser"]
	});
	var allFilesId = files.map(function(file) {
		return {
			field: 'id',
			oper: '=',
			value: file.idObject
		};
	});
	if (allFilesId.length === 0) {
		return [];
	}
	var options = {
		fields: ["id", "name"]
	};
	options.where = [allFilesId];
	if (object) {
		if (object.idSettingVersion) {
			options.where.push({
				field: "idSettingVersion",
				oper: "=",
				value: object.idSettingVersion
			});
		}
		if (object.idCompany) {
			options.where.push({
				field: "idCompany",
				oper: "=",
				value: object.idCompany
			});
		}
		if (object.uf) {
			options.where.push({
				field: "uf",
				oper: "=",
				value: object.uf
			});
		}
		if (object.idBranch) {
			options.where.push({
				field: "idBranch",
				oper: "=",
				value: object.idBranch
			});
		}
		if (object.idTax) {
			options.where.push({
				field: "idTax",
				oper: "=",
				value: object.idTax
			});
		}
		if (object.month) {
			options.where.push({
				field: "month",
				oper: "=",
				value: object.month
			});
		}
		if (object.year) {
			options.where.push({
				field: "year",
				oper: "=",
				value: object.year
			});
		}
		if (object.subperiod) {
			options.where.push({
				field: "subperiod",
				oper: "=",
				value: object.subperiod
			});
		}
	}
	return modelDigitalFile.readDigitalFile(options);
};

