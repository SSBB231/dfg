$.import("timp.core.server.api", "api");
var coreApi = $.timp.core.server.api.api;
var util = coreApi.util;
var fileShare = coreApi.fileShareController;
var fileCRUDF = coreApi.fileCRUDFController;
var fileCRUDFNew = coreApi.fileCRUDFNew;
var fileExplorer = coreApi.fileExplorerController;
var usersModel = coreApi.users;
var objectTypeModel = coreApi.objectTypes;
var fileFavsModel = coreApi.fileFavs;
var fileShareModel = coreApi.fileShare;
var user = coreApi.usersController;
var fileSystem = coreApi.fileSystem;
$.import("timp.atr.server.api", "api");
var atrApi = $.timp.atr.server.api.api;
var modelStructure = atrApi.structure.table;
var structureGroupModel = atrApi.structureGroup;
var controllerStructure = atrApi.structureController;

$.import("timp.dfg.server.models", "layout");
var modelLayout = $.timp.dfg.server.models.layout;

$.import("timp.dfg.server.models", "layoutVersion");
var modelLayoutVersion = $.timp.dfg.server.models.layoutVersion;
var modelLayoutVersiontable = $.timp.dfg.server.models.layoutVersion.table;

$.import("timp.dfg.server.models", "layoutXStructure");
var modelLayoutXStructure = $.timp.dfg.server.models.layoutXStructure;

$.import('timp.dfg.server.controllers', 'digitalFileType');
var controllerDigitalFileType = $.timp.dfg.server.controllers.digitalFileType;

$.import('timp.dfg.server.models', 'digitalFileTypeText');
var modelDigitalFileTypeText = $.timp.dfg.server.models.digitalFileTypeText.table;

$.import('timp.dfg.server.controllers', 'external');
var controllerExternal = $.timp.dfg.server.controllers.external;

$.import('timp.dfg.server.controllers', 'util');
var utilDFG = $.timp.dfg.server.controllers.util;

$.import('timp.dfg.server.controllers', 'log');
var logDFG = $.timp.dfg.server.controllers.log.Supervisor;

const _ = $.lodash;
const _filters = [{
        field: 'id',
        type: 'number'
    },
    {
        field: 'code',
        type: 'text'
    },
    {
        field: 'name',
        type: 'text'
    }
];

$.import('timp.brb.server.api', 'api');
var brbAPI = $.timp.brb.server.api.api;
var brbOutputCtrl = brbAPI.controllerOutput;

this.status = {
	ACTIVE: 100,
	EMITTED: 200,
	OFFICIAL: 300,
	SENT: 400
};

//Filters for Layout Version Table
this.searchKeys = {
	id: "id",
	creationUser: "creationUser",
	creationDateTo: "creationDate",
	creationDateFrom: "creationDate",
	modificationDateTo: "modificationDate",
	modificationDateFrom: "modificationDate",
	structureGroup: "groupStructure",
	structure: "idStructure"
};

//Filters for Layout Table
this.searchKeysLayout = {
    id: "id",
	name: "name",
	type: "idDigitalFileType",
	structureGroup: "idStructureGroup"
};

/*
    service to list the layouts (without folder structure)
    object = {
        idDigitalFileType: integer || [integer] (optional)
        idStructure: integer || [integer] (optional)
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
		var join = controllerDigitalFileType.tableJoin({
			field: 'idDigitalFileType'
		});
		join.push({
			outer: 'left',
			table: modelLayoutXStructure.table,
			alias: 'layoutXStructure',
			on: [{
				left: 'id',
				right: 'idLayout'
        }]
		}, {
			outer: 'left',
			table: modelStructure,
			alias: 'structure',
			fields: ['id', 'title'],
			on: [{
				left_table: modelLayoutXStructure.table,
				left: 'idStructure',
				right: 'id'
        }]
		});
		var where = [{
			field: 'status',
			oper: '=',
			value: this.status.ACTIVE
    }];
		// filter by idDigitalFileType
		var typesWhere = [];
		utilDFG.propertyArrayOrSingle({
			instance: object,
			property: 'idDigitalFileType',
			callback: function(object) {
				typesWhere.push({
					field: object.property,
					oper: '=',
					value: object.value
				});
			}
		});
		if (object.filters !== undefined) {
			if (object.filters.hasOwnProperty('type')) {
				where.push({
					field: 'idDigitalFileType',
					oper: '=',
					value: object.filters.type
				});

			} else {
			    _.forEach(_filters, function(item) {
			        var whereOr = [];
                    if(object.filters.hasOwnProperty(item.field)){
                       
                        whereOr.push({
        					field: item.field,
        					oper: '=',
        					value: object[item.field]
        				});
    				    where.push(
        					whereOr
        				);
                    }
                    
                });
                
			}
		}
        where.push(
    		{
    			field: 'id',
				oper: '=',
				value: 2
    		}
		);
		// query to get the ids of the layouts with the filter by idStructure
		var idsWhere = [];
		utilDFG.propertyArrayOrSingle({
			instance: object,
			property: 'idStructure',
			callback: function(object) {
				idsWhere.push({
					field: object.property,
					oper: '=',
					value: object.value
				});
			}
		});
		if (idsWhere.length) {
			var ids = modelLayoutXStructure.readLayoutXStructure({
				distinct: true,
				fields: ['idLayout'],
				where: idsWhere
			});
			var idsOr = [];
			for (var i = 0; i < ids.length; i++) {
				idsOr.push({
					field: 'id',
					oper: '=',
					value: ids[i].idLayout
				});
			}
			where.push(idsOr);
		}
		// read the layouts

		var layouts = modelLayout.readLayout({
			fields: ['id', 'idDigitalFileType', 'legalVersion', 'name', 'description', 'status', 'creationDate', 'creationUser',
				'modificationDate',
			'modificationUser'],
			join: join,
			where: where,
			// simulate: true,
			order_by: ['name']
		});

		if (layouts) {
			for (var l = 0; l < layouts.length; l++) {

				if (layouts[l].digitalFileType.length > 0)
					layouts[l].digitalFileType = {
						id: layouts[l].digitalFileType[0].id,
						iconFont: layouts[l].digitalFileType[0].iconFont,
						icon: layouts[l].digitalFileType[0].icon,
						name: layouts[l].digitalFileTypeText[0].name,
						description: layouts[l].digitalFileTypeText[0].description
					};

				var idFile = fileCRUDF.list({
					idObject: layouts[l].id,
					objectType: "DFG::Layout"
				});
				var sharedFile = fileShare.listFileShare({
					objectType: "DFG::Layout"
				});

				if (idFile.length > 0) {
					layouts[l].idFile = idFile[0].id;
					if (sharedFile.length > 0) {
						if (layouts[l].idFile == sharedFile[0].idFile) {
							layouts[l].shared = 'Shared';
						} else {
							layouts[l].shared = idFile[0].status;
						}
					} else {
						layouts[l].shared = idFile[0].status;
					}
				}
				// layouts[l].ownerId= user.getTimpUser().id;
				layouts[l].is = {
					favorite: false,
					deleted: false
				};
				delete layouts[l].digitalFileTypeText;
				delete layouts[l].layoutXStructure;
				// if(layouts[l].id === 98){
				//     return layouts[l];
				// }
			}
		}
		for (var currentList = 0; currentList < layouts.length; currentList++) {
			var creationUser = usersModel.READ({
				fields: ['id', 'name', 'last_name'],
				where: [{
					field: 'id',
					oper: '=',
					value: layouts[currentList].creationUser
            }]
			})[0];
			if (creationUser) {
				layouts[currentList].creationUser = creationUser.name + ' ' + creationUser.last_name;
				layouts[currentList].ownerId = creationUser.id;
			}
			var modificationUser = usersModel.READ({
				fields: ['id', 'name', 'last_name'],
				where: [{
					field: 'id',
					oper: '=',
					value: layouts[currentList].modificationUser
            }]
			})[0];
			if (modificationUser) {
				layouts[currentList].modificationUser = modificationUser.name + ' ' + modificationUser.last_name;
			}
		}
		var _list = [];
		var favorites = fileCRUDF.listFavoriteFile({
			objectType: "DFG::Layout"
		});

		var favoritesIds = [];
		for (var _i = 0; _i < favorites.length; _i++) {
			favoritesIds.push(favorites[_i].idFile);
		}
		var shares = fileShare.listShareFilesCreationUser({
			objectType: "DFG::Layout"
		});
		var sharedIds = [];
		for (var _i = 0; _i < shares.length; _i++) {
			sharedIds.push(shares[_i].idFile);
		}

		if (object.hasOwnProperty("ids")) {
			for (var _i = 0; _i < object.ids.length; _i++) {
				for (var _items = 0; _items < layouts.length; _items++) {
					if (object.ids[_i] == layouts[_items].id) {
						if (favoritesIds.indexOf(layouts[_items].idFile) >= 0) {
							layouts[_items].is.favorite = true;
						}
						if (sharedIds.indexOf(layouts[_items].idFile) >= 0) {
							layouts[_items].shared = "Shared";
						}
						_list.push(layouts[_items]);
					}
				}
			}
			layouts = _list;
		} else if (object.key == "FAVORITE") {
			// var favorites = fileCRUDF.listFavoriteFile({objectType:"DFG::Layout"});
			for (var i = 0; i < layouts.length; i++) {
				if (favoritesIds.indexOf(layouts[i].idFile) >= 0) {
					layouts[i].is.favorite = true;
					if (sharedIds.indexOf(layouts[i].idFile) >= 0) {
						layouts[i].shared = "Shared";
					}
					_list.push(layouts[i]);
				}

			}
		} else if (object.key == "STANDARD") {
			var files = fileCRUDF.listFiles({
				status: ['Standard'],
				objectType: "DFG::Layout"
			});
			for (var i = 0; i < layouts.length; i++) {
				for (var j = 0; j < files.length; j++) {
					if (layouts[i].idFile == files[j].id) {
						if (favoritesIds.indexOf(layouts[i].idFile) >= 0) {
							layouts[i].is.favorite = true;
						}
						_list.push(layouts[i]);
					}
				}
			}
		} else if (object.key == "PUBLIC") {
			var files = fileCRUDF.listFiles({
				status: ['Public'],
				objectType: "DFG::Layout"
			})
			for (var i = 0; i < layouts.length; i++) {
				for (var j = 0; j < files.length; j++) {
					if (layouts[i].idFile == files[j].id) {
						if (favoritesIds.indexOf(layouts[i].idFile) >= 0) {
							layouts[i].is.favorite = true;
						}
						_list.push(layouts[i]);
					}
				}
			}
		} else if (object.key == "TRASH") {
			var files = fileCRUDF.listFiles({
				status: ['Trash'],
				objectType: "DFG::Layout"
			});
			for (var i = 0; i < layouts.length; i++) {
				for (var j = 0; j < files.length; j++) {
					if (layouts[i].idFile == files[j].id) {
						_list.push(layouts[i]);
					}
				}
			}
		} else if (object.key == "ACTIVE") {
			var files = fileCRUDF.listFiles({
				status: ['Active'],
				objectType: "DFG::Layout"
			});
			for (var i = 0; i < layouts.length; i++) {
				for (var j = 0; j < files.length; j++) {
					if (layouts[i].idFile == files[j].id) {
						if (favoritesIds.indexOf(layouts[i].id) >= 0) {
							layouts[i].is.favorite = true;
						}
						_list.push(layouts[i]);
					}
				}
			}
		} else if (object.key == "SHARED") {
			var files = fileShare.listFileShare({
				objectType: "DFG::Layout"
			})
			for (var i = 0; i < layouts.length; i++) {
				for (var j = 0; j < files.length; j++) {
					if (layouts[i].idFile == files[j].file[0].id) {
						if (favoritesIds.indexOf(layouts[i].idFile) >= 0) {
							layouts[i].is.favorite = true;
						}
						layouts[i].shared = "Shared";
						_list.push(layouts[i]);
					}
				}
			}
		} else if (_list.length == 0) {
			var favoritesFiles = fileCRUDF.listFavoriteFile({
				objectType: "DFG::Layout"
			});
			var files = fileCRUDF.listFiles({
				status: ['Standard', 'Public'],
				objectType: "DFG::Layout"
			});
			var sharedFiles = fileShare.listFileShare({
				objectType: "DFG::Layout"
			});
			var privateFiles = fileCRUDF.listAllUserFiles();
			files = files.concat(privateFiles);
			for (var i = 0; i < layouts.length; i++) {
				for (var j = 0; j < files.length; j++) {
					if (layouts[i].idFile == files[j].id) {
						if (JSON.stringify(_list).indexOf(JSON.stringify(layouts[i])) == -1) {
							_list.push(layouts[i]);
						}
					}
				}
				for (var j = 0; j < favoritesFiles.length; j++) {
					if (layouts[i].idFile == files[j].id) {
						if (JSON.stringify(_list).indexOf(JSON.stringify(layouts[i])) == -1) {
							_list.push(layouts[i]);
						}
					}
				}
				for (var j = 0; j < sharedFiles.length; j++) {
					if (layouts[i].idFile == files[j].id) {
						if (JSON.stringify(_list).indexOf(JSON.stringify(layouts[i])) == -1) {
							_list.push(layouts[i]);
						}
					}
				}
			}
		}
		var counters = fileCRUDF.getCounters({
			objectType: "DFG::Layout"
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
		$.trace.error(e);
		$.messageCodes.push({
			code: "DFG209000",
			type: "E",
			errorInfo: util.parseError(e)
		});
	}
};

this.CounterFolders = function(object) {
	var root;
	var shared;
	try {
		var folders = fileCRUDFNew.listFolders({
			idFolder: -1,
			objectType: object.objectType
		});
		root = {
			id: -1,
			name: 'ROOT',
			files: this.CountFiles({
				idFolder: -1,
				objectType: object.objectType
			})[0],
			folders: folders.length > 0
		};
		if (object.shared) {
			shared = {
				id: 0,
				name: 'SHARED',
				files: 0,
				folders: fileCRUDFNew.listSharedFolders(object).length > 0
			};
			return [root, shared];
		}
		return [root];
	} catch (e) {
		$.trace.error(e);
		$.messageCodes.push({
			type: 'E',
			code: 'CORE009062',
			errorInfo: util.parseError(e)
		});
	}
};

this.CountFiles = function(object) {
	try {
		var idObjectType = this.getIdObjectType(object.objectType);
		var userID = user.getTimpUser().id;
		var files = fileSystem.readFile({
			distinct: true,
			join: [{
				table: fileShareModel,
				alias: 'shared',
				fields: ['idFile'],
				outer: 'left',
				on: [{
					left: 'id',
					right: 'idFile'
                }]
            }],
			where: [{
					field: 'idFolder',
					oper: '=',
					value: object.idFolder
                },
                [{
					field: 'status',
					oper: '=',
					value: 'Active'
                }, {
					field: 'status',
					oper: '=',
					value: 'Public'
                }],
                [{
						field: 'creationUser',
						oper: '=',
						value: userID
                },
                [{
						table: fileShareModel,
						field: 'idUser',
						oper: '=',
						value: userID
                }, {
						table: fileShareModel,
						field: 'idUser',
						oper: 'IS NULL',
						not: true
                }]
            ], {
					field: 'idObjectType',
					oper: '=',
					value: idObjectType
            }]
		});
		var whereFile = this.createWhere(files);
		var CountVersionsFiles = [];
		if (whereFile[0].length > 0) {
			CountVersionsFiles = modelLayoutVersion.readLayoutVersion({
				count: true,
				where: whereFile
			});
		}
		return whereFile[0].length > 0 ? CountVersionsFiles : [0];
	} catch (e) {
		$.trace.error(e);
		$.messageCodes.push({
			type: 'E',
			code: 'CORE009000000',
			errorInfo: util.parseError(e)
		});
	}
};

this.getLayouts = function(object) {
	try {
		var activedFiles = fileCRUDFNew.listFilesByStatus({
			objectType: "DFG::Layout",
			status: "ACTIVE"
		});

		var allFilesId = activedFiles.map(function(file) {
			return {
				field: 'id',
				oper: '=',
				value: file.idObject
			};
		});
		if (allFilesId.length === 0) {
			return [];
		}
		var join = controllerDigitalFileType.tableJoin({
			field: 'idDigitalFileType'
		});
		join.push({
			fields: ["id", "version"],
			alias: "layoutVersions",
			table: modelLayoutVersion.table,
			on: [{
				left: "id",
				right: "idLayout"
            }]
		});
		if (!object || !object.noStructure) {
			join.push({
				outer: 'left',
				table: modelLayoutXStructure.table,
				alias: 'layoutXStructure',
				on: [{
					left: 'id',
					right: 'idLayout'
                }]
			}, {
				outer: 'left',
				table: modelStructure,
				alias: 'structure',
				fields: ['id', 'title'],
				on: [{
					left_table: modelLayoutXStructure.table,
					left: 'idStructure',
					right: 'id'
                }]
			});
		}
		var options = {
			join: join,
			fields: ["id", "name"],
			isDistinct: true,
			order_by: ["id"]
		};

		options.where = [allFilesId];

		if (object && object.idDigitalFileType) {
			options.where.push({
				field: 'idDigitalFileType',
				oper: "=",
				value: object.idDigitalFileType
			});

		}
		return modelLayout.readLayout(options);
	} catch (e) {
		$.trace.error(e);
		$.messageCodes.push({
			type: 'E',
			code: 'DFG209000',
			errorInfo: util.parseError(e)
		});
	}
};

this.filters = function(object) {
	try {
		object = object || $.request.parameters.get("object");
		if (typeof object === "string") {
			object = JSON.parse(object);
		}
		var response = {
			digitalFileTypes: controllerDigitalFileType.list(),
			structures: controllerStructure.listStructuresName2()
		};
		return response;
	} catch (e) {
		$.trace.error(e);
		$.messageCodes.push({
			type: 'E',
			code: 'DFG209017',
			errorInfo: util.parseError(e)
		});
	}
};

/*
    service to return the informations for the creation dialog
*/
this.createDialog = function(object) {
	try {
		return {
			digitalFileTypes: controllerDigitalFileType.list(),
			structures: structureGroupModel.getStructureGroup(),
			list: this.getLayouts()
		};
	} catch (e) {
		$.trace.error(e);
		$.messageCodes.push({
			type: 'E',
			code: 'DFG209013',
			errorInfo: util.parseError(e)
		});
	}
};

/*
    service to create a layout
    object = {
        idDigitalFileType: integer
        idStructure: integer || [integer]
        name: string
        description: string
        legalVersion: string
    }
*/
this.create = function(object) {
	try {
		object = object || $.request.parameters.get("object");
		if (typeof object === "string") {
			object = JSON.parse(object);
		}

		// when creating adds the new layout as ACTIVE
		object.status = this.status.ACTIVE;
		object.json = "{}";
		var layout = modelLayout.createLayout(object);

		var layoutVersion = modelLayoutVersion.createLayoutVersion({
			idLayout: layout.id,
			version: "1.0",
			json: "{}",
			validityStart: object.validFrom || null,
			validityFinish: object.validTo || null
		});

		if (object.idFolder && layout.id) {
			var objectToCreateFile = {
				file: {
					id_folder: object.idFolder,
					id_object: layout.id,
					objectType: "DFG::Layout"
				}
			};
			var createFile = fileCRUDF.createFile(objectToCreateFile);
		}

		var insertLayoutXStructure = function(object) {
			var layoutXStructure = {
				idLayout: object.idLayout,
				idStructure: object.idStructure
			};
			modelLayoutXStructure.createLayoutXStructure(layoutXStructure);
		};
		utilDFG.propertyArrayOrSingle({
			instance: object,
			property: 'idStructure',
			callback: function(object) {
				insertLayoutXStructure({
					idLayout: layout.id,
					idStructure: object.value
				});
			}
		});
		// LOG
		var logRegister = new logDFG();
		var register = logRegister.createLayout(layout);
		return layout;
	} catch (e) {
		$.trace.error(e);
		var logRegister = new logDFG();
		var register = logRegister.errorCreateLayout($.trace.error(e));
		$.messageCodes.push({
			type: 'E',
			code: 'DFG209014',
			errorInfo: util.parseError(e)
		});
	}
};

/*
    service to update a layout
    object = {
        id: integer
        name: string
        description: string
        json: string
    }
*/
this.update = function(object) {
	try {
		object = object || $.request.parameters.get("object");
		if (typeof object === "string") {
			object = JSON.parse(object);
		}

		var layout = modelLayout.readLayout({
			where: [{
				field: 'id',
				oper: '=',
				value: object.id
        }, {
				field: 'status',
				oper: '=',
				value: this.status.ACTIVE
        }]
		});
		if (layout && layout.length) {
			layout = layout[0];
			var where = [{
				field: 'id',
				oper: '=',
				value: object.id
            }];
			var updateLayout = {
				name: object.name || layout.name,
				description: object.description || layout.description,
				json: object.json || layout.json,
				legalVersion: object.legalVersion || layout.legalVersion
			};
			layout = modelLayout.updateLayout(updateLayout, where);
			if (object.newStructs && object.newStructs.length) {
				var insertLayoutXStructure = function(object) {
					var layoutXStructure = {
						idLayout: object.idLayout,
						idStructure: object.idStructure
					};
					modelLayoutXStructure.createLayoutXStructure(layoutXStructure);
				};
				for (var n = 0; n < object.newStructs.length; n++) {
					insertLayoutXStructure({
						idLayout: object.id,
						idStructure: object.newStructs[n]
					});
				}
			}
			if (object.hasOwnProperty("idVersion")) {
				var _object = {
					json: object.json
				};
				for (var tmp in object.internalVersion) {
					if (object.idVersion == object.internalVersion[tmp].id) {
						if (object.internalVersion[tmp].hasOwnProperty("description")) {
							_object.description = object.internalVersion[tmp].description;
						}
						if (object.internalVersion[tmp].hasOwnProperty("validityStart")) {
							if (object.internalVersion[tmp].validityStart) {
								_object.validityStart = new Date(object.internalVersion[tmp].validityStart.toString());
							}
						}
						if (object.internalVersion[tmp].hasOwnProperty("validityFinish")) {
							_object.validityFinish = new Date(object.internalVersion[tmp].validityFinish.toString());
						}
						break;
					}
				}
				// {json: object.json}
				var layoutVersion = modelLayoutVersion.updateLayoutVersion(_object, {
					field: "id",
					oper: "=",
					value: object.idVersion
				});
			}

			// LOG
			var logRegister = new logDFG();
			var register = logRegister.updateLayout(object, object.lastChanges || []);
		} else {
			layout = false;
		}
		return layout;
	} catch (e) {

		$.trace.error(e);
		var logRegister = new logDFG();
		var register = logRegister.errorUpdateLayout(object.id, $.trace.error(e));
		$.messageCodes.push({
			type: 'E',
			code: 'DFG209016',
			errorInfo: util.parseError(e)
		});
	}
};

/*
    service to read a layout
    object = {
        id: integer
        structure: boolean (optional)
        form: boolean (optional)
    }
*/
this.read = function(object) {
	try {
		object = object || $.request.parameters.get("object");
		if (typeof object === "string") {
			object = JSON.parse(object);
		}

		var join = controllerDigitalFileType.tableJoin({
			field: 'idDigitalFileType'
		});
		join.push({
			table: modelLayoutXStructure.table,
			alias: 'layoutXStructure',
			on: [{
				left: 'id',
				right: 'idLayout'
            }]
		}, {
			table: modelStructure,
			alias: 'structure',
			fields: object.structure ? ['id', 'title', 'structure'] : ['id', 'title'],
			on: [{
				left_table: modelLayoutXStructure.table,
				left: 'idStructure',
				right: 'id'
            }]
		}, {
			table: modelLayoutVersion.table,
			alias: "internalVersion",
			on: [{
				left: "id",
				right: "idLayout"
            }],
			outer: 'left'
		});
		var where = [{
			field: 'status',
			oper: '=',
			value: this.status.ACTIVE
        }, {
			field: 'id',
			oper: '=',
			value: object.id
        }];
		var layout = modelLayout.readLayout({
			join: join,
			where: where

		});

		if (layout && layout.length > 0) {
			layout = layout[0];

			if (layout.digitalFileType.length > 0) {
				layout.digitalFileType = {
					id: layout.digitalFileType[0].id,
					iconFont: layout.digitalFileType[0].iconFont,
					icon: layout.digitalFileType[0].icon,
					name: layout.digitalFileTypeText[0].name,
					description: layout.digitalFileTypeText[0].description
				};
			}
			delete layout.digitalFileTypeText;
			delete layout.layoutXStructure;
			for (var index = 0; index < layout.structure.length; index++) {
				if (layout.structure[index].structure) {
					layout.structure[index].structure = controllerStructure.getStructure({
						id: layout.structure[index].id
					});
				}
			}
			var structureIds = [];
			for (var i = 0; i < layout.structure.length; i++) {
				structureIds.push(layout.structure[i].id);
				if (layout.structure[i].structure) {
					var structure = JSON.parse(layout.structure[i].structure);
					structure.id = layout.structure[i].id;
					structure.title = layout.structure[i].title;
					layout.structure[i] = structure;
				}
			}
			layout.reports = brbOutputCtrl.listByOutput();
			layout.outputsBCB = controllerExternal.getBCBOutputs();
			layout.outputsBFB = controllerExternal.getBFBOutputs();
			layout.outputsTCC = {};

			var outputsTcc = controllerExternal.getTCCOutputs();
			for (var i = 0; i < outputsTcc.length; i++) {
				var objectType = outputsTcc[i].objectType;
				if (!layout.outputsTCC.hasOwnProperty(objectType)) {
					layout.outputsTCC[objectType] = [];
				}
				layout.outputsTCC[objectType].push({
					id: outputsTcc[i].id,
					name: outputsTcc[i].name,
					key: outputsTcc[i].key,
					description: outputsTcc[i].description,
					objectType: outputsTcc[i].objectType
				});
			}
			// LOG
			var logRegister = new logDFG();
			logRegister.readLayout(layout);
		} else {
			layout = false;
		}
		return layout;
	} catch (e) {
		$.trace.error(e);
		$.messageCodes.push({
			type: 'E',
			code: 'DFG209015',
			errorInfo: util.parseError(e)
		});
	}
};
this.getLastVersion = function(object) {

	try {
		var where = [{
			field: 'idLayout',
			oper: '=',
			value: object.id
                        }];

		var layoutVersion = modelLayoutVersion.readLayoutVersion({
			top: 1,
			fields: ["id", "idDigitalFile"],
			where: where,
			order_by: ["-id"],
			descending: true

		});
		return layoutVersion[0];
	} catch (e) {
		$.trace.error(e);
		$.messageCodes.push({
			code: "DFG209012",
			type: "E",
			errorInfo: util.parseError(e)
		});
	}
};
//<-----------------------------------Refactor----------------------------------->
this.createLayoutVersion = function(object) {
	var NewLayoutVersion;
	object = object || $.request.parameters.get("object");
	if (typeof object === "string") {
		object = JSON.parse(object);
	}

	try {

		var layoutVersion = modelLayoutVersiontable.READ({
			// simulate: true,
			where: [{
				field: "id",
				oper: "=",
				value: object.idVersionOld
				}]
		})[0];

		layoutVersion.idDigitalFile = null;
		layoutVersion.version = object.versionNew;
		layoutVersion.validityStart = object.validFrom;
		layoutVersion.validityFinish = object.validTo || null;
		layoutVersion.description = object.description;
		NewLayoutVersion = modelLayoutVersiontable.CREATE(layoutVersion);
		return NewLayoutVersion;
	} catch (e) {
		$.messageCodes.push({
			"code": "DFG209012",
			"type": 'E'
		});
	}

};
this.listFiles = function(object) {
    var response = {};
	try {
		var files = [];
		var lang = ($.request.cookies.get("Content-Language") === "enus") ? "enus" : "ptrbr";
		var objectType = this.getIdObjectType("DFG::Layout");
		object.idUser = user.getTimpUser().id;
		if (object.idFolder) {
			files = fileCRUDFNew.listFilesByFolder({
				idUser: object.idUser,
				idFolder: object.idFolder,
				objectType: "DFG::Layout",
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
				status: [object.key],
				objectType: "DFG::Layout",
				fields: ["idObject", "status", "creationUser"]
			});
		} 
		if (files.length > 0) {
			var whereOptions = [[]];
			for (var index in files) {
				if (files.hasOwnProperty(index) && !isNaN(Number(files[index].idObject))) {
					whereOptions[0].push({
						field: "idLayout",
						oper: "=",
						value: files[index].idObject
					});
				}
			}
			var join = [
				{
					table: modelLayout.table,
					alias: "Layout",
					fields: ["id", "name", "description", "idStructureGroup", "legalVersion"],
					on: [{
						left_table: modelLayoutVersion.table,
						left: "idLayout",
						right: "id"
				    }],
					outer: "right"
				},

				{
					table: modelDigitalFileTypeText,
					alias: "type",
					fields: ["name"],
					on: [{
						left_table: modelLayout.table,
						left: "idDigitalFileType",
						right: "idDigitalFileType"
				}, {
						field: "lang",
						oper: "=",
						value: lang,
						table: modelDigitalFileTypeText
				}],
					outer: "left"
			},

				{
					table: usersModel,
					alias: "creationUser",
					fields: ["id", "name", "last_name"],
					on: [{
						left_table: modelLayoutVersion.table,
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
						left_table: modelLayoutVersion.table,
						left: "modificationUser",
						right: "id"
				}],
					outer: "left"
			}, {
					table: fileFavsModel,
					alias: "favorite",
					fields: ["id"],
					on: [{
						left_table: modelLayout.table,
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
			}
				, {
					outer: 'left',
					fields: [""],
					table: modelLayoutXStructure.table,
					alias: 'layoutXStructure',
					on: [{
						left: 'idLayout',
						right: 'idLayout'
                }]
        	}
				];

			if (object.key === "SHARED") {
				join.push({
					table: fileShareModel,
					alias: "share",
					fields: ["id"],
					on: [{
						left_table: modelLayout.table,
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
				this.evalSearchParams(object.searchParams, whereOptions, join);
			}
			if (object.hasOwnProperty("order_by") && object.order_by) {
				var order_by = object.order_by;
			}
			var layouts = modelLayoutVersion.readLayoutVersion({
				fields: ["id", "idLayout", "creationDate", "modificationDate", "idDigitalFile", "validityStart", "validityFinish", "version"],
				join: join,
				where: whereOptions,
				distinct: true,
				//simulate:true,
				paginate: {
					size: 15,
					number: Number(object.number),
					count: true
				},
				order_by: order_by ? order_by : ['id']
			});
			response.pageCount = layouts.pageCount;
			for (index in layouts) {
				if (layouts.hasOwnProperty(index)) {
					layouts = layouts.map(function(element, index) {
						for (var index2 = 0; index2 < files.length; index2++) {
							if (files[index2].idObject === element.idLayout) {
								element.fileStatus = files[index2].status;
								return element;
							}
						}
					});
				}
			}
			response.list = layouts;
		} else {
			response.list = [];
		}
		response.filterOptions = {
			type: controllerDigitalFileType.list(),
			users: usersModel.READ(),
			structureGroup: structureGroupModel.getStructureGroup(0, ["id", "title"])
		};
		if (object.hasOwnProperty("counter") && object.counter) {
			var counterOptions = {
				objectType: "DFG::Layout",
				counter: true
			};
			if (typeof object.counter === "object") {
				for (var key in object.counter) {
					if (object.counter.hasOwnProperty(key)) {
						counterOptions[key] = object.counter[key];
					}
				}

				response.counters = this.getLayoutCounters(object);
			} else {
				response.counters = this.getLayoutCounters(object);
			}
		}
	} catch (e) {
		$.trace.error(e);
		$.messageCodes.push({
			code: "DFG209000",
			type: "E",
			errorInfo: util.parseError(e)
		});
		return {
		    error: util.parseError(e)
		};
	}
	return response;
};
this.filterRequiredInformation = function(object) {
	return {
		type: controllerDigitalFileType.list().map(function(t) {
			return {
				key: t.id,
				name: t.name
			};
		})
	};
};
this.getDefaultFilters = function(object) {
	try {
		var response = {};
		//  return structureGroupModel.getStructureGroup(0, ["id", "title"]);
		if (object.eef) {
			var validCompanies = atrApi.companylist().map(function(c) {
				return c.id;
			});
			var validUF = atrApi.ufList({
				idCompany: validCompanies
			}).map(function(u) {
				return u.id;
			});
			var companies = {};
			var branches = atrApi.branchlist({
				idCompany: validCompanies,
				uf: validUF
			});
			branches.map(function(b) {
				if (!companies[b.idCompany]) {
					companies[b.idCompany] = {};
				}
				if (!companies[b.idCompany][b.uf]) {
					companies[b.idCompany][b.uf] = [];
				}
				if (companies[b.idCompany][b.uf].indexOf(b.id) === -1) {
					companies[b.idCompany][b.uf].push(b.id);
				}
			});
			var companyOptions = [];
			for (var c in companies) {
				var ufOptions = [];
				for (var u in companies[c]) {
					var branchOptions = companies[c][u].map(function(b) {
						return {
							name: b,
							key: b
						};
					});
					ufOptions.push({
						key: u,
						name: u,
						branch: branchOptions
					});
				}
				companyOptions.push({
					key: c,
					name: c,
					state: ufOptions
				});
			}
			response.company = companyOptions;
		}
		if (object.tax) {
			response.tax = controllerExternal.listTax();
		}
		if (object.structure) {
			if (typeof object.structure === "object" && object.structure.structureGroup) {
				response.structureGroup = structureGroupModel.getStructureGroup(0, ["id", "title", "hash"]).map(function(sg) {
					return {
						key: sg.id,
						name: sg.title,
						structure: sg.structure.map(function(s) {
							return {
								key: s.id,
								name: s.title,
								hash: s.hash
							};
						})
					};
				});
			} else {
				response.structure = atrApi.structureController.listStructure().map(function(s) {
					return {
						key: s.id,
						name: s.title,
						hash: s.hash
					};
				});
			}
		}
		if (object.creationUser || object.modificationUser) {
			var users = coreApi.usersController.listAllUsers().map(function(user) {
				return {
					key: user.id,
					name: user.name
				};
			});
			if (object.creationUser) {
				response.creationUser = users;
			}
			if (object.modificationUser) {
				response.modificationUser = users;
			}
		}
		return response;
	} catch (e) {
		return e;
	}
	return {};
};
this.listSPEDFiles = function(isScanc) {
	var response = {};
	try {
		var files = [];
		var lang = ($.request.cookies.get("Content-Language") === "enus") ? "enus" : "ptrbr";
		files = fileCRUDFNew.listFilesByStatus({
			status: ["ACTIVE"],
			objectType: "DFG::Layout",
			fields: ["idObject"]
		});
		if (files.length > 0) {
			var whereOptions = [
	            [],
				{
					field: "idDigitalFileType",
					oper: "=",
					value: isScanc ? 16 : 2
			}
	        ];
			for (var index in files) {
				if (files.hasOwnProperty(index) && !isNaN(Number(files[index].idObject))) {
					whereOptions[0].push({
						field: "id",
						oper: "=",
						value: files[index].idObject
					});
				}
			}

			var join = [{
				table: modelLayoutVersion.table,
				alias: "version",
				fields: ["id", "version"],
				on: [{
					left: "id",
					right: "idLayout"
	            }],
				outer: "right"
	        }];

			var layouts = modelLayout.readLayout({
				fields: ["id", "name"],
				join: join,
				where: whereOptions,
				order_by: ['id']
			});

			response.list = layouts;
		} else {
			response.list = [];
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

this.getValidDates = function(object) {
	try {
		object = typeof object === 'string' ? JSON.parse(object) : object;
		var dates = modelLayoutVersion.readLayoutVersion({
			//simulate : true ,
			fields: ["validityStart", "validityFinish"],
			where: [{
				field: "id",
				oper: "=",
				value: object.idVersion
		}]
		});
		return dates;
	} catch (e) {
		$.messageCodes.push({
			"code": "DFG210015",
			"type": 'E',
			"errorInfo": util.parseError(e)
		});
	}

};
this.getLayoutCounters = function(object) {
	var response = {};
	try {
		var objectType = this.getIdObjectType("DFG::Layout");
		object.idUser = user.getTimpUser().id;

		var PublicLayout = fileSystem.readFile({
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
		if (PublicLayout.length > 0) {
			var wherePublic = this.createWhere(PublicLayout);
			response.public = modelLayoutVersion.readLayoutVersion({
				simulate: true,
				count: true,
				where: wherePublic
			})[0];
		} else {
			response.public = 0;
		}
		var StandardLayout = fileSystem.readFile({
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
		if (StandardLayout.length > 0) {
			var whereStandard = this.createWhere(StandardLayout);
			response.standard = modelLayoutVersion.readLayoutVersion({
				count: true,
				where: whereStandard
			})[0];
		} else {
			response.standard = 0;
		}
		var TrashLayout = fileSystem.readFile({
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
		if (TrashLayout.length > 0) {
			var whereTrash = this.createWhere(TrashLayout);
			response.trash = modelLayoutVersion.readLayoutVersion({
				count: true,
				where: whereTrash
			})[0];
		} else {
			response.trash = 0;
		}
		var FavoriteLayout = fileFavsModel.READ({
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
		if (FavoriteLayout.length > 0) {
			var whereFavorite = this.createWhere(FavoriteLayout);
			response.favorite = modelLayoutVersion.readLayoutVersion({
				count: true,
				where: whereFavorite
			})[0];
		} else {
			response.favorite = 0;
		}
		var SharedLayout = fileShareModel.READ({
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
		if (SharedLayout.length > 0) {
			var whereShared = this.createWhere(SharedLayout);
			response.shared = modelLayoutVersion.readLayoutVersion({
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

this.createWhere = function(TypeFile) {
	try {
		var where = [[]];
		for (var index in TypeFile) {
			if (TypeFile.hasOwnProperty(index) && !isNaN(Number(TypeFile[index].idObject))) {
				where[0].push({
					field: "idLayout",
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

/**
 * @param {object} object - Endpoint parameter.
 * @param {number array} object.idObject - Array of file IDs
 * @return {object array} response - Array with copied layouts
 */
this.copy = function(object) {
	var response = [];
	try {

		var lang = ($.request.cookies.get("Content-Language") === "enus") ? "enus" : "ptrbr";
		if (object.hasOwnProperty("idObject")) {
			var index = 0;
			var readOptions = {};
			readOptions.where = [[]];
			for (index = 0; index < object.idObject.length; index++) {
				readOptions.where[0].push({
					field: "id",
					oper: "=",
					value: object.idObject[index]
				});
			}
			var layouts = modelLayout.readLayout(readOptions);

			for (index = 0; index < layouts.length; index++) {
				let json = "{}";
				if (object.idLayoutVersion) {
					let versions = modelLayoutVersion.table.READ({
						fields: ["id", "json", "idLayout"],
						where: [{
							field: "idLayout",
							oper: "=",
							value: object.idObject[0]
                		}, {
							field: 'id',
							oper: '=',
							value: object.idLayoutVersion
                		}]
					});
					if (versions.length > 0) {
						json = versions[0].json;
					}
				}
				var element = layouts[index];
				element.name = (object.name) ? object.name : ((lang === "enus") ? "Copy of " : "Cópia de ") + element.name;
				element.description = (object.description) ? object.description : element.description;
				element.validFrom = (object.validFrom) ? object.validFrom : element.validFrom;
				element.validTo = (object.validTo) ? object.validTo : element.validTo;
				element.json = json;
				var layout = modelLayout.createLayout(element);
				response.push(layout);
				modelLayoutVersion.createLayoutVersion({
					idLayout: layout.id,
					version: "1.0",
					json: json
				});
				var layoutXStructure = modelLayoutXStructure.readLayoutXStructure({
					fields: ["idLayout", "idStructure"],
					where: [{
						field: "idLayout",
						oper: "=",
						value: element.id
					}]
				});
				var createOptions = {};
				for (var index2 = 0; index2 < layoutXStructure.length; index2++) {
					createOptions = {
						idLayout: layout.id,
						idStructure: layoutXStructure[index2].idStructure
					};
					modelLayoutXStructure.createLayoutXStructure(createOptions);
				}
				createOptions = {
					idFolder: -1,
					idObject: layout.id,
					objectType: "DFG::Layout"
				};
				fileCRUDFNew.createFile(createOptions);
				var logRegister = new logDFG();
				logRegister.createLayout(layout);
			}
			return response[0];
		}
	} catch (e) {
		$.trace.error(e);
		$.messageCodes.push({
			code: "DFG209005",
			type: "E",
			errorInfo: util.parseError(e)
		});
		return response;
	}
};

/**
 * @param {object} object - Endpoint parameter.
 * @param {number array} object.idObject - Array of file IDs
 * @return {object array} response - Array with all files added to favorites
 */
this.setFavorite = function(object) {
	try {
		var unFavorites = [];
		var favorites = [];
		for (var element = 0; element < object.ids.length; element++) {
			if (object.ids[element].status) {
				favorites.push(object.ids[element].id);
			} else {
				unFavorites.push(object.ids[element].id);
			}
		}
		var result = {};
		if (unFavorites.length) {
			result.favorites = fileCRUDFNew.markFavorite({
				objectType: "DFG::Layout",
				idObject: unFavorites
			});
		}
		if (favorites.length) {
			result.unFavorites = fileCRUDFNew.unmarkFavorite({
				objectType: "DFG::Layout",
				idObject: favorites
			});
		}
		return result;
	} catch (e) {
		$.trace.error(e);
		$.messageCodes.push({
			type: 'E',
			code: 'DFG209018',
			errorInfo: util.parseError(e)
		});
	}
};

this.favorite = function(object) {
	var result = {};
	try {
		if (object.elements && object.elements.length) {
			var idLayouts = {};
			var elements = object.elements;
			modelLayoutVersion.table.READ({
				fields: ["id", "idLayout"],
				where: [{
					field: "id",
					oper: "=",
					value: object.elements.map(function(e) {
						return e.id;
					})
             }]
			}).map(function(version) {
				idLayouts[version.id] = version.idLayout;
			});
			var unFavorites = [];
			var favorites = [];
			elements.map(function(e) {
				if (!e.isFavorite) {
					unFavorites.push(idLayouts[e.id]);
				} else {
					favorites.push(idLayouts[e.id]);
				}
			});
			if (unFavorites.length) {
				result.favorites = fileCRUDFNew.markFavorite({
					objectType: "DFG::Layout",
					idObject: unFavorites
				});
			}
			if (favorites.length) {
				result.unFavorites = fileCRUDFNew.unmarkFavorite({
					objectType: "DFG::Layout",
					idObject: favorites
				});
			}
			return result;
		}
	} catch (e) {
		$.trace.error(e);
		$.messageCodes.push({
			type: 'E',
			code: 'DFG209018',
			errorInfo: util.parseError(e)
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
	try {
		return fileCRUDFNew.unmarkFavorite({
			objectType: "DFG::Layout",
			idObject: object.idObject
		});
	} catch (e) {
		$.trace.error(e);
		$.messageCodes.push({
			type: 'E',
			code: 'DFG209019',
			errorInfo: util.parseError(e)
		});
	}
};

/**
 * @param {object} object - Endpoint parameter.
 * @param {number array} object.idObject - Array of file IDs
 * @param {number} object.status - Status the file is to be updated to (1. Active/Private, 2. Trashed, 3. Deleted)
 * @return {object array} response - Array with all updated files
 */
this.updateFile = function(object) {
	try {
		var canProceed = true;
		object.objectType = "DFG::Layout";
		var response = fileCRUDFNew.updateFileStatus(object);
		var logRegister = new logDFG();
		if(!$.lodash.isArray(object.idObject)){
		    object.idObject = [object.idObject];
		}
		object.idObject.map(function(id){
		   if(object.status === 1){
    		    logRegister.restoreLayout(id);
    		}else if(object.status === 2){
    		    logRegister.trashLayout(id);
    		}else if(object.status === 3){
    		    logRegister.deleteLayout(id);
    		} 
		});
		
		return response;

	} catch (e) {
		$.trace.error(e);
		var logRegister = new logDFG();
		if(object.status === 1){
		    logRegister.errorRestoreLayout(object.id, $.trace.error(e));
		}else if(object.status === 2){
		    logRegister.errorTrashLayout(object.id, $.trace.error(e));
		}else if (object.status === 3) {
			logRegister.errorDeleteLayout(object.id, $.trace.error(e));
		}
		$.messageCodes.push({
			type: 'E',
			code: 'DFG209016',
			errorInfo: util.parseError(e)
		});
	}

};
this.trash = function(object) {
	var result = {};
	try {
		var canProceed = true;
		if (canProceed) {
			var idLayouts = {};
			var idObject = [];
			var elements = object.elements;
			modelLayoutVersion.table.READ({
				fields: ["id", "idLayout"],
				where: [{
					field: "id",
					oper: "=",
					value: object.elements.map(function(e) {
						return e.id;
					})
             }]
			}).map(function(version) {
				idLayouts[version.id] = version.idLayout;
				idObject.push(version.idLayout);
			});
			var favorites = [];
			elements.map(function(e) {
				if (e.isFavorite) {
					favorites.push(idLayouts[e.id]);
				}
			});
			if (favorites.length) {
				fileCRUDFNew.unmarkFavorite({
					objectType: "DFG::Layout",
					idObject: favorites
				});
			}
			return fileCRUDFNew.updateFileStatus({
				objectType: "DFG::Layout",
				idObject: idObject,
				"status": 2
			});
		} else {
			return canProceed;
		}
	} catch (e) {
		$.trace.error(e);
		if (object.status === 3) {
			//$.trace.error(e);
			var logRegister = new logDFG();
			var register = logRegister.errorDeleteLayout(object.id, $.trace.error(e));
		}
		$.messageCodes.push({
			type: 'E',
			code: 'DFG209016',
			errorInfo: util.parseError(e)
		});
	}
};
this.restore = function(object) {
	var result = {};
	try {
		var canProceed = true;
		if (canProceed) {
			var idObject = [];
			var elements = object.elements;
			modelLayoutVersion.table.READ({
				fields: ["id", "idLayout"],
				where: [{
					field: "id",
					oper: "=",
					value: object.elements.map(function(e) {
						return e.id;
					})
	            }]
			}).map(function(version) {
				idObject.push(version.idLayout);
			});
			return fileCRUDFNew.updateFileStatus({
				objectType: "DFG::Layout",
				idObject: idObject,
				"status": 1
			});
		} else {
			return canProceed;
		}
	} catch (e) {
		$.trace.error(e);
		$.messageCodes.push({
			type: 'E',
			code: 'DFG209016',
			errorInfo: util.parseError(e)
		});
	}
};
this.delete = function(object) {
	var result = {};
	try {
		var canProceed = true;
		if (canProceed) {
			var idObject = [];
			var elements = object.elements;
			modelLayoutVersion.table.READ({
				fields: ["id", "idLayout"],
				where: [{
					field: "id",
					oper: "=",
					value: object.elements.map(function(e) {
						return e.id;
					})
	            }]
			}).map(function(version) {
				idObject.push(version.idLayout);
			});
			return fileCRUDFNew.updateFileStatus({
				objectType: "DFG::Layout",
				idObject: idObject,
				"status": 3
			});
		} else {
			return canProceed;
		}
	} catch (e) {
		$.trace.error(e);
		if (object.status === 3) {
			//$.trace.error(e);
			var logRegister = new logDFG();
			var register = logRegister.errorDeleteLayout(object.id, $.trace.error(e));
		}
		$.messageCodes.push({
			type: 'E',
			code: 'DFG209016',
			errorInfo: util.parseError(e)
		});
	}
};
/**
 * @param {object} searchParams - Endpoint Filters
 * @param {array} where - query Where Clause
 * @param {date}  searchParams.creationDateFrom - first range for the creationDate clause
 * @param {date} searchParams.creationDateTo - second range for the creationDate clause
 * @param {date}  searchParams.modificationDateFrom - first range for the modificationDate clause
 * @param {date} searchParams.modificationDateTo - second range for the modificationDate clause
 **/
this.evalSearchParams = function(searchParams, where, join) {
	var searchOR = [];

	
	for (var i in searchParams) {
	    
        if (_.isNil(searchParams[i]) || searchParams[i] === '') {
            continue;
	    }
	    
		if (this.searchKeysLayout.hasOwnProperty(i)) {
			//if we receive a name filter, we'll push it as an id
			if (!isNaN(searchParams[i]) && !searchParams.hasOwnProperty("id")) {
				searchOR.push({
					field: "id",
					oper: "=",
					value: searchParams[i]
				});

			}
			searchOR.push({
				field: this.searchKeysLayout[i],
				oper: i === "name" ? "LIKE" : "=",
				value: i === "name" ? ("%" + searchParams[i].toUpperCase() + "%") : searchParams[i],
				maskFn: 'UPPER'
			});

		} else if (this.searchKeys[i] === "groupStructure") {
			join.push({
				table: modelLayoutXStructure.table,
				alias: "layoutStructure",
				on: [{
					left: "id",
					right: "idLayout"
				}]
			}, {
				table: structureGroupModel.structureGroupXStructure,
				alias: "structureGroup",
				on: [{
					left_table: modelLayoutXStructure.table,
					left: "idStructure",
					right: "structureId"
				}, {
					table: structureGroupModel.structureGroupXStructure,
					field: "structureGroupId",
					oper: "=",
					value: searchParams[i]
				}]
			});
		} else if (this.searchKeys[i] !== "creationDate" && this.searchKeys[i] !== "modificationDate" && this.searchKeys[i] !== "idStructure") {
			where.push({
				field: this.searchKeys[i],
				oper: "=",
				value: searchParams[i]
			});
		} else if (this.searchKeys[i] === "idStructure") {
			where.push({
				table: modelLayoutXStructure.table,
				field: this.searchKeys[i],
				oper: "=",
				value: searchParams[i]
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
	//We push the Or array
		if (searchOR.length) {
            join[0].on.push(searchOR);
		}
};

/**
 * @param {string} objectType - Name of the object that you need.
 * @return {number} - ID of object in CORE::ObjectType
 */
this.getIdObjectType = function(objectType) {
	var object = objectTypeModel.READ({
		fields: ["id"],
		where: [{
			field: "name",
			oper: "=",
			value: objectType
		}]
	})[0];

	if (object === undefined) {
		throw "ObjectType Not Found";
	}
	return object.id;
};

/**
 * @param {number} - ID of Layout's structure
 * @return {object array} - Array of Layouts (Just id and Name)
 */
this.getLayoutsbyStructure = function(idStructure) {
	var userID = $.getUserID();
	var objectType = this.getIdObjectType("DFG::Layout");
	var response = [];
	var where = [];
	var join = [{
		fields: ["id", "version"],
		alias: "layoutVersions",
		table: modelLayoutVersion.table,
		on: [{
			left: "id",
			right: "idLayout"
        }]
	}];
	var canProceed = true;
	var files = [];
	files = fileCRUDFNew.listFilesByStatus({
		status: "ACTIVE",
		objectType: "DFG::Layout",
		fields: ["idObject"]
	});
	if (files.length) {
		where.push([]);
		for (var index in files) {
			if (files.hasOwnProperty(index)) {
				where[0].push({
					field: "id",
					oper: "=",
					value: files[index].idObject
				});
			}
		}
	}
	if (idStructure) {
		join.push({
			outer: 'right',
			fields: [""],
			table: modelLayoutXStructure.table,
			alias: 'layoutXStructure',
			on: [{
				left: 'id',
				right: 'idLayout'
		        }, {
				field: 'idStructure',
				oper: '=',
				value: idStructure
		    }]
		});
	}

	var layouts = modelLayout.readLayout({
		fields: ['id', 'name'],
		where: where,
		join: join,
		order_by: ['id']
	});
	return layouts;
};

this.getLayoutVersion = function(idLayoutVersion, originalJson) {
	var privileges =true;
	var join = [{
		table: modelLayout.table,
		alias: "layout",
		fields: originalJson ? ["name", "json"] : ["name"],
		on: [{
			left: "idLayout",
			right: "id"
	    }]
	}];
	if (idLayoutVersion) {
		var where = [{
			field: "id",
			oper: "=",
			value: idLayoutVersion
    	}];
		return modelLayoutVersion.table.READ({
			join: join,
			where: where
		})[0];
	}
	return modelLayoutVersion.table.READ({
		join: join,
		where: where
	});

};

this.testTimeout = function() {
	var x = true;
	while (x) {

	}
	return false;
};

/*******NEW LIBRARY BUILDER TEST*********/
this.listStandard = function(object) {
	var response = {};
	try {
		var canProceed = true;
		var files = [];
		var lang = ($.request.cookies.get("Content-Language") === "enus") ? "enus" : "ptrbr";
		var objectType = this.getIdObjectType("DFG::Layout");
		object.idUser = user.getTimpUser().id;
		if (object.idFolder) {
			files = fileCRUDFNew.listFilesByFolder({
				idUser: object.idUser,
				idFolder: object.idFolder,
				objectType: "DFG::Layout",
				fields: ["idObject", "status"]
			});
		} else {
			files = fileCRUDFNew.listFilesByStatus({
				status: object.key,
				objectType: "DFG::Layout",
				fields: ["idObject", "status", "creationUser"]
			});
		}
		if (files.length > 0) {
			var whereOptions = [
                []
            ];
			for (var index in files) {
				if (files.hasOwnProperty(index) && !isNaN(Number(files[index].idObject))) {
					whereOptions[0].push({
						field: "idLayout",
						oper: "=",
						value: files[index].idObject
					});
				}
			}
			var join = [{
					table: modelLayout.table,
					alias: "Layout",
					fields: ["id", "name", "description", "idStructureGroup", "legalVersion"],
					on: [{
						left_table: modelLayoutVersion.table,
						left: "idLayout",
						right: "id"
                    }],
					outer: "right"
                }, {
					fields: ["title"],
					outer: "left",
					table: structureGroupModel.structureGroup,
					alias: "structureGroup",
					on: [{
						left_table: modelLayout.table,
						left: "idStructureGroup",
						right: "id"
                    }]
                },

				{
					table: modelDigitalFileTypeText,
					alias: "type",
					fields: ["name"],
					on: [{
						left_table: modelLayout.table,
						left: "idDigitalFileType",
						right: "idDigitalFileType"
                    }, {
						field: "lang",
						oper: "=",
						value: lang,
						table: modelDigitalFileTypeText
                    }],
					outer: "left"
                },

				{
					table: usersModel,
					alias: "creationUser",
					fields: ["id", "name", "last_name"],
					on: [{
						left_table: modelLayoutVersion.table,
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
						left_table: modelLayoutVersion.table,
						left: "modificationUser",
						right: "id"
                    }],
					outer: "left"
                }, {
					table: fileFavsModel,
					alias: "favorite",
					fields: ["id"],
					on: [{
						left_table: modelLayout.table,
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
					fields: ["idStructure"],
					table: modelLayoutXStructure.table,
					alias: 'layoutXStructure',
					on: [{
						left: 'idLayout',
						right: 'idLayout'
                    }]
                }, {
					fields: ["id", "title"],
					table: modelStructure,
					alias: "structure",
					on: [{
						left_table: modelLayoutXStructure.table,
						left: "idStructure",
						right: "id"
                    }]
                }
            ];

			if (object.key === "SHARED") {
				join.push({
					table: fileShareModel,
					alias: "share",
					fields: ["id"],
					on: [{
						left_table: modelLayout.table,
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
				this.evalSearchParams(object.searchParams, whereOptions, join);
			}
			if (object.hasOwnProperty("order_by") && object.order_by) {
				var order_by = object.order_by;
			}
			var layouts = modelLayoutVersion.readLayoutVersion({
				fields: ["id", "idLayout", "creationDate", "modificationDate", "idDigitalFile", "validityStart", "validityFinish", "version"],
				join: join,
				where: whereOptions,
				distinct: true,
				//   simulate:true,
				paginate: object.paginate,
				order_by: order_by ? order_by : ['id']
			});
			response.pageCount = layouts.pageCount;
			for (index in layouts) {
				if (layouts.hasOwnProperty(index)) {
					layouts = layouts.map(function(element, index) {
						for (var index2 = 0; index2 < files.length; index2++) {
							if (files[index2].idObject === element.idLayout) {
								element.fileStatus = files[index2].status;
								return element;
							}
						}
					});
				}
			}
			layouts = layouts.map(function(layout) {
				var structure = [];
				if (Array.isArray(layout.structure)) {
					for (var s = 0; s < layout.structure.length; s++) {
						structure.push(layout.structure[s].title);
					}
				} else {
					if (layout.structure.title) {
						structure.push(layout.structure.title);
					}
				}
				layout.creationDate.toLocaleDateString()
				return {
					id: layout.id,
					idLayout: layout.Layout[0].id,
					name: layout.Layout[0].name,
					description: layout.Layout[0].description,
					structureGroup: layout.structureGroup.title,
					structure: structure,
					version: layout.version,
					type: layout.type.name,
					fileStatus: layout.fileStatus,
					isFavorite: layout.favorite && (layout.favorite.id || (layout.favorite.length && layout.favorite[0] && layout.favorite[0].id)),
					effectiveDateFrom: layout.validityStart !== null ? layout.validityStart.toLocaleDateString().split("/")[1] + "/" + layout.validityStart
						.toLocaleDateString().split("/")[0] + "/" + layout.validityStart.toLocaleDateString().split("/")[2] : "",
					effectiveDateTo: layout.validityFinish !== null ? layout.validityFinish.toLocaleDateString().split("/")[1] + "/" + layout.validityFinish
						.toLocaleDateString().split("/")[0] + "/" + layout.validityFinish.toLocaleDateString().split("/")[2] : "",
					creationUser: (layout.creationUser && layout.creationUser.length ? layout.creationUser[0].name + " " + layout.creationUser[0].last_name :
						""),
					idCreationUser: (layout.creationUser && layout.creationUser.length ? layout.creationUser[0].id : -1),
					creationDate: layout.creationDate.toLocaleDateString().split("/")[1] + "/" + layout.creationDate.toLocaleDateString().split("/")[0] +
						"/" + layout.creationDate.toLocaleDateString().split("/")[2],
					modificationUser: (layout.modificationUser && layout.modificationUser.length ? layout.modificationUser[0].name + " " + layout.modificationUser[
						0].last_name : ""),
					idModificationUser: (layout.modificationUser && layout.modificationUser.length ? layout.modificationUser[0].id : -1),
					modificationDate: layout.modificationDate.toLocaleDateString().split("/")[1] + "/" + layout.modificationDate.toLocaleDateString().split(
						"/")[0] + "/" + layout.modificationDate.toLocaleDateString().split("/")[2]
				};
			});

			response.list = layouts;
		} else {
			response.list = [];
		}

		var counterOptions = {
			objectType: "DFG::Layout",
			counter: true
		};
		if (typeof object.counter === "object") {
			for (var key in object.counter) {
				if (object.counter.hasOwnProperty(key)) {
					counterOptions[key] = object.counter[key];
				}
			}

			response.counters = this.getLayoutCounters(object);
		} else {
			response.counters = this.getLayoutCounters(object);
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

/*
*@method structureMigration
*@param object = {
    @param {integer} "layoutId",
    @param {integer} "sourceStructureHash",
    @param {integer} "sourceStructureId",
    @param  {integer} "targetStructureHash",
    @param {integer} "targetStructureId"
}
*
*/
this.structureMigration = function(object){
    try{
        var modelLayoutVersion = $.createBaseRuntimeModel($.schema.slice(1,-1),"DFG::LayoutVersion");
        var modelLayoutStructure = $.createBaseRuntimeModel($.schema.slice(1,-1),"DFG::LayoutStructure");
        var layoutVersions = modelLayoutVersion.find({
            "select": [{
                "field": "JSON",
                "as": "json"
            },{
                "field": "ID",
                "as": "id"
            }],
            "where": [{
                "field": "ID_LAYOUT",
                "operator": "$eq",
                "value": object.layoutId
            }]
        });
        layoutVersions = layoutVersions.results;
        layoutVersions.map(function(version){
           var fieldIds = [];
           var backUpJSON = JSON.parse(JSON.stringify(version.json));
           for(var b in version.blocks){
               for(var r in version.blocks[b].records){
                   for(var c in version.blocks[b].records[r].columns){
                       var column = version.blocks[b].records[r].columns[c];
                       if(_.isValidInteger(column.fieldId) && _.isValidInteger(column.idStructure)){
                           if(column.idStructure === object.sourceStructureId){
                               if(fieldIds.indexOf(parseInt(column.fieldId,10)) === -1){
                                   fieldIds.push(column.fieldId);
                               }
                           }
                       }
                   }
               }
           }
           var structureMigrationMapping;
           if(atrApi.getStructureMigrationMapping){
               structureMigrationMapping =  atrApi.getStructureMigrationMapping({
                   sourceStructureHash: object.sourceStructureHash,
                   targetStructureHash: object.targetStructureHash,
                   fieldIds: fieldIds
               });
           }else{
               const structureMappingModel = $.createBaseRuntimeModel($.schema.slice(1,-1),"ATR::STRUCTURE_MAPPING");
               structureMigrationMapping = structureMappingModel.find({
                   "select": [{
                       "field": "SOURCE_FIELD_ID",
                       "as":"sourceFieldId"
                   },{
                       "field": "TARGET_FIELD_ID",
                       "as": "targetFieldId"
                   }],
                   "where": [{
                       "field": "SOURCE_STRUCTURE_HASH",
                       "operator": "$eq",
                       "value": object.sourceStructureHash
                   },{
                       "field": "TARGET_STRUCTURE_HASH",
                       "operator": "$eq",
                       "value": object.targetStructureHash
                   }]
               });
               var fields = {};
               structureMigrationMapping.results.map(function(map){
                   fields[map.sourceFieldId] = {
                       "ID": map.targetFieldId
                   };
               });
               structureMigrationMapping = {
                   fields: fields
               };
           }
           var verifyFilter = function(filters){
               if(filters){
                   filters.map(function(filter){
                       for(var g = 0; g < filter.group.length; g++){
                            if(filter.group[g].fieldId && structureMigrationMapping.fields[filter.group[g].fieldId]){
                                filter.group[g].fieldId = structureMigrationMapping.fields[filter.group[g].fieldId].ID;
                            }else{
                                filter.group[g] = undefined;
                            }
                        }
                        filter.group = filter.group.filter(function(group){
                            return group !== undefined;
                        });
                   });
                   filters = filters.filter(function(filter){
                       return filter.group.length;
                   });
               }
           };
           if(version.json.filters && version.json.filters[object.sourceStructureId]){
               if(version.json.filters[object.sourceStructureId] && version.json.filters[object.sourceStructureId].length){
                   verifyFilter(version.json.filters[object.sourceStructureId]);
                   version.json.filters[object.targetStructureId] = JSON.parse(JSON.stringify(version.json.filters[object.sourceStructureId]));
               }
               delete version.json.filters[object.sourceStructureId];
           }
           for(var b in version.json.blocks){
               if(version.json.blocks[b].filters && version.json.blocks[b].filters[object.sourceStructureId]){
                   if(version.json.blocks[b].filters[object.sourceStructureId] && version.json.blocks[b].filters[object.sourceStructureId].length){
                       verifyFilter(version.json.blocks[b].filters[object.sourceStructureId]);
                       version.json.blocks[b].filters[object.targetStructureId] = JSON.parse(JSON.stringify(version.json.blocks[b].filters[object.sourceStructureId]));
                   }
                   delete version.json.blocks[b].filters[object.sourceStructureId]; 
               }
               for(var r in version.json.blocks[b].records){
                   if(version.json.blocks[b].records[r].filters && version.json.blocks[b].records[r].filters[object.sourceStructureId].length){
                       if(version.json.blocks[b].records[r].filters[object.sourceStructureId] && version.json.blocks[b].records[r].filters[object.sourceStructureId].length){
                           verifyFilter(version.json.blocks[b].records[r].filters[object.sourceStructureId]);
                           version.json.blocks[b].records[r].filters[object.targetStructureId] = JSON.parse(JSON.stringify(version.json.blocks[b].records[r].filters[object.sourceStructureId]));
                       }
                       delete version.json.blocks[b].records[r].filters[object.sourceStructureId]; 
                   }
                   for(var c in version.json.blocks[b].records[r].columns){
                       var column = JSON.parse(JSON.stringify(version.json.blocks[b].records[r].columns[c]));
                       if(_.isValidInteger(column.fieldId) && _.isValidInteger(column.idStructure)){
                           if(column.idStructure === object.sourceStructureId){
                               if(structureMigrationMapping.fields[column.fieldId]){
                                   column.idStructure = object.targetStructureId;
                                   column.fieldId = structureMigrationMapping.fields[column.fieldId].ID;
                                   verifyFilter(column.filters);
                                   var newColumnId = object.targetStructureId + "S"+ column.fieldId +"C"+c.split("C")[1];
                                   var columnPosition = version.json.blocks[b].records[r].positions.indexOf(c);
                                   version.json.blocks[b].records[r].positions[columnPosition] = newColumnId;
                                   version.json.blocks[b].records[r].columns[newColumnId] = column;
                                   delete version.json.blocks[b].records[r].columns[c];
                                   if(version.json.groups && version.json.groups.blocks && version.json.groups.blocks[b] && version.json.groups.blocks[b].records[r]){
                                       if(version.json.groups.blocks[b].records[r].structures[object.sourceStructureId] && version.json.groups.blocks[b].records[r].structures[object.sourceStructureId].groups){
                                           version.json.groups.blocks[b].records[r].structures[object.sourceStructureId].groups.map(function(g){
                                               if(g.groupBy.indexOf(c) !== -1){
                                                   g.groupBy[g.groupBy.indexOf(c)] = newColumnId;
                                               }else if(g.totals.indexOf(c) !== -1){
                                                   g.totals[g.totals.indexOf(c)] = newColumnId;
                                               }
                                               if(g.columnFilters[c]){
                                                    verifyFilter(g.columnFilters[c]);
                                                    g.columnFilters[newColumnId] = JSON.parse(JSON.stringify(g.columnFilters[c]));
                                                    delete g.columnFilters[c];
                                               }
                                           });
                                       }
                                   }
                               }else{
                                   var columnPosition = version.json.blocks[b].records[r].positions.indexOf(c);
                                   version.json.blocks[b].records[r].positions.splice(columnPosition ,1);
                                   delete version.json.blocks[b].records[r].columns[c];
                               }
                           }
                       }
                   }
                   if(version.json.groups && version.json.groups.blocks && version.json.groups.blocks[b] && version.json.groups.blocks[b].records[r]){
                        if(version.json.groups.blocks[b].records[r].structures[object.sourceStructureId] ){
                            version.json.groups.blocks[b].records[r].structures[object.targetStructureId] = JSON.parse(JSON.stringify(version.json.groups.blocks[b].records[r].structures[object.sourceStructureId]));
                            delete version.json.groups.blocks[b].records[r].structures[object.sourceStructureId];
                        } 
                   }
                   var structurePosition = -1;
                   version.json.blocks[b].records[r].idStructure.map(function(idStructure,index){
                       if(idStructure+"" === object.sourceStructureId+""){
                           structurePosition = index;
                       }
                   });
                   version.json.blocks[b].records[r].idStructure.splice(structurePosition,1);
                   version.json.blocks[b].records[r].idStructure.push(object.targetStructureId);
               }
           }
           
     //      return version.json;
           
           /*
           modelLayoutVersion.update({
               JSON: version.json,
               BACKUP_JSON: backUpJSON
           },{
               "where": [{
                   "field": "ID",
                   "operator": "$eq",
                   "value": version.id 
               }]
           });
           */
        });
      /*  modelLayoutStructure.update({
            "ID_STRUCTURE": object.targetStructureId
        },{
            "where": [{
                "field": "ID_LAYOUT",
                "operator": "$eq",
                "value": object.layoutId
            }]
        });
        */
        return true;
    }catch(e){
        throw e;
    }
    
};