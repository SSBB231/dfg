$.import("timp.core.server.api", "api");
var core_api = $.timp.core.server.api.api;
var util = core_api.util;
var users = core_api.usersController;
var file = core_api.file;
var fileFavsModel = core_api.fileFavs;
var fileShareModel = core_api.fileShare;
var fileShare = core_api.fileShareController;
var fileCRUDFNew = core_api.fileCRUDFNew;
var fileCRUDF = core_api.fileCRUDFController;
var fileExplorer = core_api.fileExplorerController;
var usersModel = core_api.users;
var objectTypeModel = core_api.objectTypes;
$.import("timp.atr.server.api", "api");
var atr_api = $.timp.atr.server.api.api; 
var modelStructure = atr_api.structure.table;
var controllerStructure = atr_api.structureController;
var tributoModel = atr_api.tributo.table;

$.import('timp.bre.server.api', 'api');
var bre_api = $.timp.bre.server.api.api;
var rules = bre_api.rulesController;
var rulesModel = bre_api.rules;

const _ = $.lodash;

//Controller
$.import('timp.dfg.server.controllers', 'setting');
var setting = $.timp.dfg.server.controllers.setting;

$.import("timp.dfg.server.models", "setting");
var modelSetting = $.timp.dfg.server.models.setting.table;

$.import("timp.dfg.server.models", "settingVersion");
var modelSettingVersion = $.timp.dfg.server.models.settingVersion.table;

$.import('timp.dfg.server.controllers', 'layout');
var layout = $.timp.dfg.server.controllers.layout;
$.import("timp.dfg.server.models", "layout");
var modelLayout = $.timp.dfg.server.models.layout.table;
$.import("timp.dfg.server.models", "layoutVersion");
var modelLayoutVersion = $.timp.dfg.server.models.layoutVersion.table;

$.import('timp.dfg.server.controllers', 'digitalFileType');
var controllerDigitalFileType = $.timp.dfg.server.controllers.digitalFileType;

//Model
$.import('timp.dfg.server.models', 'digitalFile');
var modelDigitalFile = $.timp.dfg.server.models.digitalFile;
$.import('timp.dfg.server.models', 'digitalFileAN4');
var modelDigitalFileAn4 = $.timp.dfg.server.models.digitalFileAN4;
$.import('timp.dfg.server.models', 'digitalFileAN4Eefi');
var modelDigitalFileAn4eefi = $.timp.dfg.server.models.digitalFileAN4Eefi.table;
$.import('timp.dfg.server.models', 'digitalFileAN4Favorite');
var modelDigitalFileAn4Favorite = $.timp.dfg.server.models.digitalFileAN4Favorite.table;
$.import('timp.dfg.server.controllers', 'external');
var controllerExternal = $.timp.dfg.server.controllers.external;



$.import('timp.dfg.server.controllers', 'log');
var logDFG = $.timp.dfg.server.controllers.log.Supervisor;

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
	rules: "idRule",
	file1: "idLeftFile",
	file2: "idRightFile",
	creationDateTo: "creationDate",
	creationDateFrom: "creationDate",
	modificationDateTo: "modificationDate",
	modificationDateFrom: "modificationDate"
};
/*
Usage:
    list({
        uf: [<ufs>],
        idBranch: [<idBranch>],
        idCompany: [<idCompany>],
        idTax: [<idTax>],
        isFavorite: true,
        idRule: [<idRule>]
    })
*/
this.list = function(object) {
	var index, index2, idFile, sharedFile, files;
	var root, shared;
	object = object || $.request.parameters.get("object");
	if (typeof object === 'string') {
		object = util.__parse__(object);
	}
	if (object.hasOwnProperty("root")) {
		root = fileCRUDF.listFolderTree(object.root);
	}
	if (object.hasOwnProperty("shared")) {
		shared = fileCRUDF.listFolderTree(object.shared);
	}
	if (object.hasOwnProperty("ids")) {
		object.ids = fileCRUDF.listFile(object.ids);

	}
	try {
		object = object || $.request.parameters.get("object");
		if (typeof object === "string") {
			if (Object.keys(JSON.parse(object)).length > 1000) {
				throw "Limit exceeded on JSON length: " + JSON.stringify(object);
			}
			object = JSON.parse(object);
		}
		var options = {};
		options.where = [];

		var filters = {};
		if (object.hasOwnProperty("filters")) {
			filters = object.filters;
		}

		// AN4 Table Read
		if (filters.hasOwnProperty("rule")) {
			options.where.push({
				field: "idRule",
				oper: "=",
				value: filters.rule
			});
		}
		if (filters.hasOwnProperty("file1")) {
			options.where.push({
				field: "idLeftFile",
				oper: "=",
				value: filters.file1
			})
		}
		if (filters.hasOwnProperty("file2")) {
			options.where.push({
				field: "idRightFile",
				oper: "=",
				value: filters.file2
			})
		}
		options.join = [{
			alias: "LeftFile",
			table: file.table,
			on: [{
				left: "idLeftFile",
				right: "id"
            }]
        }, {
			alias: "RightFile",
			table: file.table,
			rename: "RigthFile",
			on: [{
				left: "idRightFile",
				right: "id"
            }]
        }];

		if (object.hasOwnProperty("fields")) {
			options.fields = object.fields;
		}
		var response = {};

		response.list = modelDigitalFileAn4.readAN4(options);
		response.filterOptions = this.filters();
		// return response.filters;
		response.counter = {};
		//FILES

		if (response.list) {
			for (index = 0; index < response.list.length; index++) {
				idFile = fileCRUDF.list({
					idObject: response.list[index].id,
					objectType: "DFG::AN4"
				});
				sharedFile = fileShare.listFileShare({
					objectType: "DFG::AN4"
				});
				if (idFile.length > 0) {
					response.list[index].idFile = idFile[0].id;
					if (sharedFile.length > 0) {
						if (response.list[index].idFile === sharedFile[0].idFile) {
							response.list[index].shared = "Shared";
						} else {
							response.list[index].shared = idFile[0].status;
						}
					} else {
						response.list[index].shared = idFile[0].status;
					}
				}
				response.list[index].is = {
					favorite: false,
					deleted: false
				};
			}
		}
		// for (var currentList = 0; currentList < response.list.length; currentList++) {
		//     var creationUser = usersModel.READ({
		//         fields: ["id", "name", "last_name"],
		//         where: [{
		//             field: "id",
		//             oper: "=",
		//             value: response.list[currentList].creationUser
		//         }]
		//     })[0];
		//     if (creationUser) {
		//         response.list[currentList].creationUser = creationUser.name + " " + creationUser.last_name;
		//     }
		//     var modificationUser = usersModel.READ({
		//         fields: ["id", "name", "last_name"],
		//         where: [{
		//             field: "id",
		//             oper: "=",
		//             value: response.list[currentList].modificationUser
		//         }]
		//     })[0];
		//     if (modificationUser) {
		//         response.list[currentList].modificationUser = modificationUser.name + " " + modificationUser.last_name;
		//     }
		//     var ruleName = rulesModel.READ({
		//         fields: ["id","name"],
		//         where: [{
		//             field:"id",
		//             oper: "=",
		//             value: response.list[currentList].idRule
		//         }]
		//     })[0];
		//     if(ruleName){
		//         response.list[currentList].Rule = ruleName;
		//     }
		//     response.list[currentList].ownerId = creationUser ? creationUser.id : null;
		// }
		var _list = [];
		var favorites = fileCRUDF.listFavoriteFile({
			objectType: "DFG::AN4"
		});
		var favoritesIds = [];
		for (index = 0; index < favorites.length; index++) {
			favoritesIds.push(favorites[index].idFile);
		}
		var shares = fileShare.listShareFilesCreationUser({
			objectType: "DFG::AN4"
		});
		var sharedIds = [];
		for (index = 0; index < shares.length; index++) {
			sharedIds.push(shares[index].idFile);
		}

		if (object.hasOwnProperty("ids")) {
			for (var _i = 0; _i < object.ids.length; _i++) {
				for (var _items = 0; _items < response.list.length; _items++) {
					if (object.ids[_i] === response.list[_items].id) {
						if (favoritesIds.indexOf(response.list[_items].idFile) >= 0) {
							response.list[_items].is.favorite = true;
						}
						if (sharedIds.indexOf(response.list[_items].idFile) >= 0) {
							response.list[_items].shared = "Shared";
						}
						_list.push(response.list[_items]);
					}
				}
			}
			response.list = _list;
		} else if (object.key === "FAVORITE") {
			// var favorites = fileCRUDF.listFavoriteFile({objectType:"DFG::Layout"});
			for (index = 0; index < response.list.length; index++) {
				if (favoritesIds.indexOf(response.list[index].idFile) >= 0) {
					response.list[index].is.favorite = true;
					if (sharedIds.indexOf(response.list[index].idFile) >= 0) {
						response.list[index].shared = "Shared";
					}
					_list.push(response.list[index]);
				}

			}
		} else if (object.key === "STANDARD") {
			files = fileCRUDF.listFiles({
				status: ["Standard"],
				objectType: "DFG::AN4"
			});
			for (index = 0; index < response.list.length; index++) {
				for (index2 = 0; index2 < files.length; index2++) {
					if (response.list[index].idFile === files[index2].id) {
						if (favoritesIds.indexOf(response.list[index].idFile) >= 0) {
							response.list[index].is.favorite = true;
						}
						_list.push(response.list[index]);
					}
				}
			}
		} else if (object.key === "PUBLIC") {
			files = fileCRUDF.listFiles({
				status: ["Public"],
				objectType: "DFG::AN4"
			});
			for (index = 0; index < response.list.length; index++) {
				for (index2 = 0; index2 < files.length; index2++) {
					if (response.list[index].idFile === files[index2].id) {
						if (favoritesIds.indexOf(response.list[index].idFile) >= 0) {
							response.list[index].is.favorite = true;
						}
						_list.push(response.list[index]);
					}
				}
			}
		} else if (object.key === "TRASH") {
			files = fileCRUDF.listFiles({
				status: ["Trash"],
				objectType: "DFG::AN4"
			});
			for (index = 0; index < response.list.length; index++) {
				for (index2 = 0; index2 < files.length; index2++) {
					if (response.list[index].idFile === files[index2].id) {
						_list.push(response.list[index]);
					}
				}
			}
		} else if (object.key === "ACTIVE") {
			files = fileCRUDF.listFiles({
				status: ["Active"],
				objectType: "DFG::AN4"
			});
			for (index = 0; index < response.list.length; index++) {
				for (index2 = 0; index2 < files.length; index2++) {
					if (response.list[index].idFile === files[index2].id) {
						if (favoritesIds.indexOf(response.list[index].id) >= 0) {
							response.list[index].is.favorite = true;
						}
						_list.push(response.list[index]);
					}
				}
			}
		} else if (object.key === "SHARED") {
			files = fileShare.listFileShare({
				objectType: "DFG::AN4"
			});
			for (index = 0; index < response.list.length; index++) {
				for (index2 = 0; index2 < files.length; index2++) {
					if (response.list[index].idFile === files[index2].file[0].id) {
						if (favoritesIds.indexOf(response.list[index].idFile) >= 0) {
							response.list[index].is.favorite = true;
						}
						response.list[index].shared = "Shared";
						_list.push(response.list[index]);
					}
				}
			}
		} else if (_list.length === 0) {
			var favoritesFiles = fileCRUDF.listFavoriteFile({
				objectType: "DFG::AN4"
			});
			files = fileCRUDF.listFiles({
				status: ["Standard", "Public"],
				objectType: "DFG::AN4"
			});
			var sharedFiles = fileShare.listFileShare({
				objectType: "DFG::AN4"
			});
			var privateFiles = fileCRUDF.listAllUserFiles();
			files = files.concat(privateFiles);
			for (index = 0; index < response.list.length; index++) {
				for (index2 = 0; index2 < files.length; index2++) {
					if (response.list[index].idFile === files[index2].id) {
						if (JSON.stringify(_list).indexOf(JSON.stringify(response.list[index])) === -1) {
							_list.push(response.list[index]);
						}
					}
				}
				for (index2 = 0; index2 < favoritesFiles.length; index2++) {
					if (response.list[index].idFile === files[index2].id) {
						if (JSON.stringify(_list).indexOf(JSON.stringify(response.list[index])) === -1) {
							_list.push(response.list[index]);
						}
					}
				}
				for (index2 = 0; index2 < sharedFiles.length; index2++) {
					if (response.list[index].idFile === files[index2].id) {
						if (JSON.stringify(_list).indexOf(JSON.stringify(response.list[index])) === -1) {
							_list.push(response.list[index]);
						}
					}
				}
			}
		}
		response.list = _list;
		var counters = fileCRUDF.getCounters({
			objectType: "DFG::AN4"
		});
		response.counter = counters;
		//FILES
		if (response.list.length > 0) {
			for (index = 0; index < response.list.length; index++) {
				files = response.list[index];
				options.where = [];
				options.join = [];
				options.join.push({
					alias: "DigitalFile",
					table: modelDigitalFile.table,
					on: [{
						left: "idObject",
						right: "id"
                    }]
				});
				options.where.push({
					field: "id",
					oper: "=",
					value: files.LeftFile[0].id
				});
				var leftDigitalFile = file.READ(options);
				files.LeftFile[0].name = leftDigitalFile[0].DigitalFile[0].name;
				options.where.push({
					field: "id",
					oper: "=",
					value: files.RightFile[0].id
				});
				var rightDigitalFile = file.READ(options);
				files.RightFile[0].name = rightDigitalFile[0].DigitalFile[0].name;
			}
		}
		response.root = root;
		response.shared = shared;
		return response;
	} catch (e) {
		$.messageCodes.push({
			"code": "DFG201005", //FIX MESSAGECODE
			"type": "E",
			"errorInfo": util.parseError(e)
		});
	}
};

/*
 * The function receives as input the configurations according to 2 layouts and 
 * returns the digital files that meet the given criteria and their sharing properties
 * 
 * @param  object  contains the properties:
 * {
	idRule: [<idRule>],                       
	idLayout1: [<idLayout>],
	idLayout2: [<idLayout>],
	idLayoutVersion1: [<idLayoutVersion>],
	idLayoutVersion2: [<idLayoutVersion>],
	uf: [<ufs>],
    idBranch: [<idBranch>],
    idCompany: [<idCompany>],
    idTax: [<idTax>],
	year: [<year>],
	month: [<month>],
	subPeriod:[<subPeriod>]
 * }
 * @return      The list of digital Files according to their layout and EEFI configs
*/
this.listFilesByRule = function(object) {
	object = object || (typeof $.request.parameters.get("object") === "string") ? JSON.parse($.request.parameters.get("object")) : $.request.parameters
		.get("object");

	if (object.hasOwnProperty("idRule")) {
		var response = {
			leftFiles: [],
			rightFiles: []
		};
		var leftFile = this.prepareFile({
			idLayout: object.idLayout1,
			layoutVersion: object.idLayoutVersion1,
			idCompany: object.idCompany,
			uf: object.uf,
			idBranch: object.idBranch,
			idTax: object.idTax,
			year: object.year,
			month: object.month,
			subPeriod: object.subPeriod
		});

		var rightFile = this.prepareFile({
			idLayout: object.idLayout2,
			layoutVersion: object.idLayoutVersion2,
			idCompany: object.idCompany,
			uf: object.uf,
			idBranch: object.idBranch,
			idTax: object.idTax,
			year: object.year,
			month: object.month,
			subPeriod: object.subPeriod
		});

		response.leftFiles = this.evaluateStatus(leftFile);
		response.rightFiles = this.evaluateStatus(rightFile);
		return response;
	} else {
		return false;

	}
};
this.evaluateStatus = function(file) {
	var i, idFile, sharedFile;
	var files = [];
	for (i = 0; i < file.length; i++) {
		idFile = fileCRUDF.list({
			idObject: file[i].id,
			objectType: "DFG::DigitalFile"
		});
		sharedFile = fileShare.listFileShare({
			objectType: "DFG::DigitalFile"
		});
		if (idFile.length > 0) {
			file[i].idFile = idFile[0].id;
			if (sharedFile.length > 0) {
				if (file[i].idFile === sharedFile[0].idFile) {
					files.push({
						id: file[i].idFile,
						name: file[i].name
					});
				} else {
					if (idFile[0].status === "Public") {
						files.push({
							id: file[i].idFile,
							name: file[i].name
						});
					}
				}
			} else {
				if (idFile[0].status === "Public") {
					files.push({
						id: file[i].idFile,
						name: file[i].name
					});
				}
				if (idFile[0].status === "Active") {
					files.push({
						id: file[i].idFile,
						name: file[i].name
					});
				}
			}
		}
	}
	return files;

}

/*
 * The function receives as input the configurations for a digitalFile and returns
 * the digitalFiles that meet the given criteria. 
 * 
 * @param  object  contains the properties:
 * {
	idRule: [<idRule>],                       
	idLayout: [<idLayout>],
	idLayoutVersion: [<idLayoutVersion>],
	uf: [<ufs>],
    idBranch: [<idBranch>],
    idCompany: [<idCompany>],
    idTax: [<idTax>],
	year: [<year>],
	month: [<month>],
	subPeriod:[<subPeriod>]
 * }
 * @return      The list of digital Files according to their layout, layoutVersion and EEFI configs
*/
this.prepareFile = function(object) {
	var join = [];
	var where = [];
	var bool = false;
	if (object.idCompany !== undefined) {
		bool = true;
	}

	join.push({
		fields: ["id"],
		table: modelSettingVersion,
		alias: "settingVersion",
		on: [{
			left: "idSettingVersion",
			right: "id"
        }]
	});
	join.push({
		fields: ["id"],
		table: modelSetting,
		alias: "setting",
		on: [{
			left_table: modelSettingVersion,
			left: "idSetting",
			right: "id"
        }]
	});
	var on = [{
		left_table: modelSetting,
		left: "idLayoutVersion",
		right: "id"
        }, {
		field: "idLayout",
		oper: "=",
		value: object.idLayout,
		table: modelLayoutVersion
        }];
	if (bool) {
		on.push({
			field: "version",
			oper: "=",
			value: object.layoutVersion,
			table: modelLayoutVersion
		});
		where.push({
			"field": "month",
			"oper": "=",
			"value": object.month
		}, {
			"field": "year",
			"oper": "=",
			"value": object.year
		}, {
			"field": "subperiod",
			"oper": "=",
			"value": object.subPeriod
		}, {
			"field": "idCompany",
			"oper": "=",
			"value": object.idCompany
		}, {
			"field": "uf",
			"oper": "=",
			"value": object.uf
		}, {
			"field": "idBranch",
			"oper": "=",
			"value": object.idBranch
		}, {
			"field": "idTax",
			"oper": "=",
			"value": object.idTax
		});
	}
	join.push({
		fields: ["id"],
		table: modelLayoutVersion,
		alias: "layoutVersion",
		on: on
	});

	var options = {
		join: join,
		where: where,
		fields: ["id", "name"]
	};

	return modelDigitalFile.readDigitalFile(options);
};

DFG.execute = function() {};
DFG.execute.prototype._readDigitalFile_ = function(object) {
	var coreFile = file.READ({
		where: [{
			field: "id",
			oper: "=",
			value: object.id
        }]
	})[0];
	var digitalFile = modelDigitalFile.readDigitalFile({
		where: [{
			field: "id",
			oper: "=",
			value: coreFile.idObject
        }],
		join: [{
			alias: "SettingVersion",
			table: modelSettingVersion,
			on: [{
				left: "idSettingVersion",
				right: "id"
            }]
        }]
	})[0];
	return digitalFile;
};
DFG.execute.prototype._readRule_ = function(object) {
	var rule = rulesModel.READ({
		where: [{
			field: 'id',
			oper: '=',
			value: object.id
        }]
	})[0];
	return rule;
};
DFG.execute.prototype._prepareData_ = function(date) {
	// Create JSON response
	var res = {};
	res[date.SettingVersion[0].idLayout] = {};

	var rawFile = JSON.parse(date.digitalFile);
	rawFile = rawFile.rawFile;
	var raw = rawFile.split("\r\n");
	var json = JSON.parse(date.json);
	var separador = (json.separator.value === "") ? "\\&" : json.separator.value;
	// for create OBjects
	for (var i = 0; i < raw.length; i++) {
		var blocksFile = raw[i].split("&&::");
		if (blocksFile[1] !== undefined) {
			var blocksRegs = blocksFile[1].split("&:");
			if (!res[date.SettingVersion[0].idLayout].hasOwnProperty(blocksRegs[0])) {
				res[date.SettingVersion[0].idLayout][blocksRegs[0]] = {};
				res[date.SettingVersion[0].idLayout][blocksRegs[0]][blocksRegs[1]] = [];

				var bf = blocksFile[0].split(separador);
				res[date.SettingVersion[0].idLayout][blocksRegs[0]][blocksRegs[1]].push(bf);
			} else {
				if (!res[date.SettingVersion[0].idLayout][blocksRegs[0]].hasOwnProperty(blocksRegs[1])) {
					res[date.SettingVersion[0].idLayout][blocksRegs[0]][blocksRegs[1]] = [];
					var bf = blocksFile[0].split(separador);
					res[date.SettingVersion[0].idLayout][blocksRegs[0]][blocksRegs[1]].push(bf);
				} else {
					var bf = blocksFile[0].split(separador);
					res[date.SettingVersion[0].idLayout][blocksRegs[0]][blocksRegs[1]].push(bf);
				}
			}
		}
	}
	return res;
};
DFG.execute.prototype._prepareRule_ = function(rule) {
	rule = JSON.parse(rule.rule);
	var rules = [];
	var conditions = Object.keys(rule.conditions);
	// if(simples conditions)
	for (var i = 0; i < conditions.length; i++) {
		var message = rule.paths.filter(function(entry) {
			return entry.conditions.indexOf(+conditions[i]) !== -1;
		});

		var ref = message[0].references;

		message = rule.messages[message[0].message.id];
		var ruleCond = rule.conditions[conditions[i]];
		rules.push([ruleCond.pa.id, ruleCond.oper, ruleCond.pb.id, message, ref]);
	}
	return rules;
};
DFG.execute.prototype._getFields_ = function(object) {
	var layout = object.layout;
	var block = object.block;
	var record = object.record;
	layout.json = JSON.parse(layout.json);
	layout.digitalFile = JSON.parse(layout.digitalFile);
	var records = layout.digitalFile.rawFile.split(/\r\n/);
	var positions = [];
	var response = [];
	for (var i = 0; i < records.length; i++) {
		var x = records[i].split('&&::');
		positions.push(x[1]);
		records[i] = x[0];

	}

	for (i = 0; i < positions.length; i++) {
		if (positions[i] !== undefined) {
			if (positions[i][0] === block && positions[i][3] === record) {
				response.push(records[i]);
			}
		}
	}
	return response;

};
DFG.execute.prototype._getBlockPositions_ = function(object) {
	var pa = object.pa;
	var layout = object.layout;
	var keyblock = object.keyblock;
	var response = {};

	for (var y = 0; y < keyblock.length; y++) {

		if (layout.json.blocks[keyblock[y]].name === pa[1]) {
			response.blockposition = keyblock[y];
			response.keyrecord = Object.keys(layout.json.blocks[response.blockposition].records);
			break;
		}

	}
	return response;

};
DFG.execute.prototype._getRecordPositions_ = function(object) {
	var pa = object.pa;
	var layout = object.layout;
	var keyrecord = object.keyrecord;
	var blockposition = object.blockposition;
	var recordposition;
	for (var y = 0; y < keyrecord.length; y++) {

		if (layout.json.blocks[blockposition].records[keyrecord[y]].name === pa[2]) {
			recordposition = keyrecord[y];
			break;
		}

	}
	return recordposition;
};
DFG.execute.prototype._getIds_ = function(object) {
	var ap = object;

	if (ap.hasOwnProperty('_')) {
		if (typeof ap.params[0].id === 'number') {
			for (var n = 0; n < ap.params.length; n++) {
				if (typeof ap.params[n].id !== "number") {
					return ap.params[n].id.split('-');

				}
			}
		} else {
			return ap.params[0].id.split('-');
		}

	} else {
		return ap;
	}

};
DFG.execute.prototype._getPositions_ = function(object) {
	var response = {};
	var x = this._getBlockPositions_({
		pa: object.pa,
		ap: object.temp1,
		layout: object.layout,
		keyblock: object.keyblock

	}); //Gets the blockposition needed and the key record

	response.recordposition = this._getRecordPositions_({
		pa: object.pa,
		ap: object.temp1,
		layout: object.layout,
		keyrecord: x.keyrecord,
		blockposition: x.blockposition

	});
	response.blockposition = x.blockposition;
	return response;

};
DFG.execute.prototype._evaluateReferences_ = function(object) {
	var ref = object.ref;
	var keys1 = object.keys1;
	var keys2 = object.keys2;
	var pa = object.pa;
	var pb = object.pb;
	var records1 = object.records1;
	var records2 = object.records2;
	var layout = object.layout1;
	var layout2 = object.layout2;
	var pairs = object.pairs;
	for (var j = 0; j < ref.length; j++) {

		var reffield1 = {};
		reffield1.id = ref[j].id.split('_')[0];
		reffield1.block = ref[j].block1;
		reffield1.record = ref[j].record1;
		reffield1.field = ref[j].id.split('_')[3];
		var reffield2 = {};
		reffield2.block = ref[j].block2;
		reffield2.record = ref[j].record2;
		reffield2.id = ref[j].id2.split('_')[0];
		reffield2.field = ref[j].id2.split('_')[3];
		var bool2 = reffield1.id === pa[0];

		var valid = this._verifyReference_({
			reference1: bool2 ? reffield1 : reffield2,
			reference2: bool2 ? reffield2 : reffield1,
			keys1: keys1,
			keys2: keys2,
			field1: pa,
			field2: pb,
			records1: records1,
			records2: records2
		}); //Verifies that both of the fields in the reference are in the right block and record

		if (valid) {

			//If the reference is valid, evaluate it
			pairs = this._filterbyReference_({
				pairs: pairs,
				index1: keys1.indexOf(bool2 ? reffield1.field : reffield2.field),
				index2: keys2.indexOf(bool2 ? reffield2.field : reffield1.field),
				json1: layout.json,
				json2: layout2.json
			});
		}

	}
	return pairs;

};
DFG.execute.prototype._compareDocs_ = function(object) {

	var rules = object.rules;
	var layout = object.layout;
	layout.json = JSON.parse(layout.json);
	var layout2 = object.layout2;

	layout2.json = JSON.parse(layout2.json);

	var response = [];
	var calculated = object.calculated;

	for (var i = 0; i < rules.length; i++) {

		var ap;
		var bp;

		if (typeof rules[i][0] === 'number') {
			ap = calculated[rules[i][0]].value;

		} else {
			ap = rules[i][0].split("-");
		}
		if (typeof rules[i][2] === 'number') {
			bp = calculated[rules[i][2]].value;

		} else {
			bp = rules[i][2].split("-");
		}

		var oper = rules[i][1];
		var message = rules[i][3];
		var ref = rules[i][4];
		var bool = false;
		var pa;
		var pb;
		var temp1 = this._getIds_(ap);
		var temp2 = this._getIds_(bp);

		if (layout.SettingVersion[0].idLayout === parseInt(temp1[0])) {
			pa = temp1;
			pb = temp2;
			bool = true; // True when the first id corresponds to the first Layout
		} else {
			pa = temp2;
			pb = temp1;
		}
		var x, y;

		//--------LAYOUT 1------

		if (bool) {
			x = this._getPositions_({
				pa: pa,
				ap: temp1,
				layout: layout,
				keyblock: Object.keys(layout.json.blocks)
			});

			y = this._getPositions_({
				pa: pb,
				ap: temp2,
				layout: layout2,
				keyblock: Object.keys(layout2.json.blocks)
			});

		} else {
			x = this._getPositions_({
				pa: pa,
				ap: temp2,
				layout: layout,
				keyblock: Object.keys(layout.json.blocks)
			});
			y = this._getPositions_({
				pa: pb,
				ap: temp1,
				layout: layout2,
				keyblock: Object.keys(layout2.json.blocks)
			});

		}
		var records1 = this._getFields_({
			layout: layout,
			block: x.blockposition,
			record: x.recordposition
		}); //gets the records  from the rawfile

		var keys1 = Object.keys(layout.json.blocks[x.blockposition].records[x.recordposition].columns);

		var records2 = this._getFields_({
			layout: layout2,
			block: y.blockposition,
			record: y.recordposition
		});

		var keys2 = Object.keys(layout2.json.blocks[y.blockposition].records[y.recordposition].columns);
		var pairs = this._getPairs_({
			records1: records1,
			records2: records2
		});

		pairs = this._evaluateReferences_({
			ref: ref,
			keys1: keys1,
			keys2: keys2,
			pa: pa,
			pb: pb,
			records1: records1,
			records2: records2,
			pairs: pairs,
			layout1: layout,
			layout2: layout2
		});

		//After evaluating the reference, evaluate the path

		if (pairs) {

			var result = this._filterbyPath_({
				matched: pairs,
				index1: keys1.indexOf(pa[3]),
				index2: keys2.indexOf(pb[3]),
				json1: layout.json,
				json2: layout2.json,
				oper: oper,
				message: message.value,
				ap: ap,
				bp: bp,
				keys1: keys1,
				keys2: keys2,
				type1: layout.json.fields[pa[3]].simpleType,
				type2: layout2.json.fields[pb[3]].simpleType
			});

			result.field1 = typeof rules[i][0] === 'number' ? calculated[rules[i][0]].name : layout.json.fields[pa[3]].label;
			result.field2 = typeof rules[i][2] === 'number' ? calculated[rules[i][2]].name : layout2.json.fields[pb[3]].label;
			result.oper = oper;
			response.push(result);

		}
	}
	return response;
};
DFG.execute.prototype._getPairs_ = function(object) {
	var records1 = object.records1;
	var records2 = object.records2;
	var response = [];
	for (var i = 0; i < records1.length; i++) {
		for (var j = 0; j < records2.length; j++) {
			response.push({
				record1: records1[i],
				record2: records2[j]
			});
		}

	}
	return response;

}
DFG.execute.prototype._getCalculatedField_ = function(object) {
	var params = object.params;
	var oper = object.oper;
	var keys = object.keys;
	var record = object.record;
	var result;
	for (var i = 0; i < params.length; i++) {
		var value;
		if (params[i]['_'] === "Formula") {
			value = this._getCalculatedField_({
				params: params[i].params,
				keys: keys,
				record: record,
				oper: params[i].oper
			});
		} else {
			if (typeof params[i].id === "number") {
				value = params[i].id;
			} else {
				var index = keys.indexOf(params[i].id.split('-')[3]);
				if (isNaN(Number(record[index]))) {
					value = record[index];
				} else {
					value = Number(record[index]);
				}

			}

		}

		if (i === 0) {
			result = record[index];
		} else {
			switch (oper) {
				case '+':
					result += value;
					break;
				case '-':
					result -= value;
					break;
				case '*':
					result = result * value;
					break;
				case '/':
					result = result / value;
					break;
			}
		}
	}

	return result;
};
DFG.execute.prototype._filterbyPath_ = function(object) {
	var matched = object.matched;
	var index1 = object.index1;
	var index2 = object.index2;
	var type1 = object.type1;
	var type2 = object.type2;
	var oper = object.oper;
	var message = object.message;
	var response = {
		result: []
	};
	var keys1 = object.keys1;
	var keys2 = object.keys2;
	var ap = object.ap;
	var bp = object.bp;
	var json1 = object.json1;
	var json2 = object.json2;
	var separator1 = json1.separator.value;
	if (separator1 === undefined || separator1 === "") {
		separator1 = ";";
	}
	var separator2 = json2.separator.value;
	if (separator2 === undefined || separator2 === "") {
		separator2 = ";";
	}

	for (var i = 0; i < matched.length; i++) {
		var record1 = matched[i].record1.split(separator1);
		if (json1.separator.inFirst) {
			record1.splice(0, 1);
		}
		if (json1.separator.inLast) {
			record1.splice(record1.length - 1, 1);
		}
		var record2 = matched[i].record2.split(separator2);
		if (json2.separator.inFirst) {
			record2.splice(0, 1);
		}
		if (json2.separator.inLast) {
			record2.splice(record2.length - 1, 1);
		}
		var fieldleft, fieldright;
		//validate if there are any calculated field
		if (ap.hasOwnProperty('_')) {

			fieldleft = this._getCalculatedField_({
				record: record1,
				keys: keys1,
				params: ap.params,
				oper: ap.oper
			}); //calculates the field 
		} else {
			if (type1 === "NUMBER") {
				fieldleft = parseFloat(record1[index1]);
			} else {
				fieldleft = record1[index1];
			}

		}

		if (bp.hasOwnProperty('_')) {

			fieldright = this._getCalculatedField_({
				record: record2,
				keys: keys2,
				params: bp.params,
				oper: bp.oper
			});
		} else {
			if (type2 === "NUMBER") {

				fieldright = parseFloat(record2[index2]);
			} else {
				fieldright = record2[index2];
			}

		}
		switch (oper) {
			case "=":
				if (fieldleft === fieldright) {
					response.result.push({
						record1: matched[i].record1,
						record2: matched[i].record2,
						message: message
					});
				}
				break;
			case "<":
				if (fieldleft < fieldright) {
					response.result.push({
						record1: matched[i].record1,
						record2: matched[i].record2,
						message: message
					});
				}
				break;
			case ">":
				if (fieldleft > fieldright) {
					response.result.push({
						record1: matched[i].record1,
						record2: matched[i].record2,
						message: message
					});
				}
				break;
			case "≤":
				if (fieldleft <= fieldright) {
					response.result.push({
						record1: matched[i].record1,
						record2: matched[i].record2,
						message: message
					});
				}
				break;
			case "≥":
				if (fieldleft >= fieldright) {
					response.result.push({
						record1: matched[i].record1,
						record2: matched[i].record2,
						message: message
					});
				}
				break;
			case "≠":
				if (fieldleft !== fieldright) {
					response.result.push({
						record1: matched[i].record1,
						record2: matched[i].record2,
						message: message
					});
				}
				break;
		}

	}
	return response;

};
DFG.execute.prototype._filterbyReference_ = function(object) {

	var pairs = object.pairs;
	var index1 = object.index1; //represents the position of the first reference field
	var index2 = object.index2;
	var json1 = object.json1;
	var json2 = object.json2;
	var separator1 = json1.separator.value;
	if (separator1 === undefined || separator1 === "") {
		separator1 = ";";
	}
	var separator2 = json2.separator.value;
	if (separator2 === undefined || separator2 === "") {
		separator2 = ";";
	}

	var response = [];
	for (var i = 0; i < pairs.length; i++) {
		var record1 = pairs[i].record1.split(separator1);
		var record2 = pairs[i].record2.split(separator2);
		if (json1.separator.inFirst) {
			record1.splice(0, 1);
		}
		if (json1.separator.inLast) {
			record1.splice(record1.length - 1, 1);
		}
		if (json2.separator.inFirst) {
			record2.splice(0, 1);
		}
		if (json2.separator.inLast) {
			record2.splice(record2.length - 1, 1);
		}
		if (record1[index1] === record2[index2]) {
			response.push({
				record1: pairs[i].record1,
				record2: pairs[i].record2
			});
		}
	}

	//searchs for the matching records depending by the reference
	return response;

};
DFG.execute.prototype._verifyReference_ = function(object) {
	var reference1 = object.reference1;
	var reference2 = object.reference2;
	var keys1 = object.keys1;
	var keys2 = object.keys2;
	var field1 = object.field1;
	var field2 = object.field2;
	var index1 = keys1.indexOf(reference1.field);
	var index2 = keys2.indexOf(reference2.field);
	if (reference1.block !== field1[1] || reference1.record !== field1[2] || reference2.block !== field2[1] || reference2.record !== field2[2]) {
		return false;
	}
	//verifies that each reference is in the block and the record of the fields
	if (index1 === -1 || index2 === -1) {
		return false;
	}
	//verifies that the field of each reference is in the keys
	return true; //the reference is valid to filtrate the records
};
/*
Usage:
    execute({
        id_1: <id AN1>,
        id_2: <id DFG2>,
        id_regra: <id DFG2>
    })
*/
this.execute = function(object) {
	object = object || $.request.parameters.get("object");
	if (typeof object === "string") {
		object = JSON.parse(object);
	}
	try {
		var read = this.read(object);
		var execute = new DFG.execute();
		var digitalFile1 = execute._readDigitalFile_({
			id: read.idLeftFile
		});

		var digitalFile2 = execute._readDigitalFile_({
			id: read.idRightFile
		});
		var rule = execute._readRule_({
			id: read.idRule
		});
		var data1 = execute._prepareData_(digitalFile1);
		var data2 = execute._prepareData_(digitalFile2);
		var rules = execute._prepareRule_(rule);
		var calculated = JSON.parse(rule.rule).calculated;
		var result = execute._compareDocs_({
			rules: rules,
			file: data1,
			file2: data2,
			layout: digitalFile1,
			layout2: digitalFile2,
			calculated: calculated
		});
		return result;
	} catch (e) {

		$.messageCodes.push({
			"type": "E",
			"errorInfo": util.parseError(e)
		});
	}
};
/*
Usage:
    read({
        id: <id AN4>
    })
*/
this.read = function(object) {
	try {
		object = object || $.request.parameters.get("object");
		if (typeof object === "string") {
			object = JSON.parse(object);
		}

		var response = modelDigitalFileAn4.readAN4({
			where: [{
				field: 'id',
				oper: '=',
				value: object.id
            }]
		})[0];

		var leftFile = file.READ({
			fields: ['idObject'],
			where: [{
				field: 'id',
				oper: '=',
				value: response.idLeftFile
            }]
		})[0];
		leftFile = modelDigitalFile.readDigitalFile({
			fields: ["id", "name"],
			where: [{
				field: "id",
				oper: "=",
				value: leftFile.idObject
            }]
		});
		response.leftFile = leftFile;
		var rightFile = file.READ({
			fields: ['idObject'],
			where: [{
				field: 'id',
				oper: '=',
				value: response.idRightFile
            }]
		})[0];
		rightFile = modelDigitalFile.readDigitalFile({
			fields: ["id", "name"],
			where: [{
				field: "id",
				oper: "=",
				value: rightFile.idObject
            }]
		});
		response.rightFile = rightFile;

		// LOG
		var logRegister = new logDFG();
		logRegister.readAN4(response);
		return response;
	} catch (e) {
		$.messageCodes.push({
			"code": "DFG201005", //FIX MESSAGECODE
			"type": 'E',
			"errorInfo": util.parseError(e)
		});
	}

};
/*
Usage:
    createDialog()
*/
this.listCompanies = function() {
	var response = controllerExternal.listCompany();
	return response;
};
this.listLayoutsbyRule = function(object) {
	object = object || $.request.parameters.get("object");
	object = (typeof object === "string") ? JSON.parse(object) : object;
	var response = {};
	var result = {
		leftLayout: {},
		rightLayout: {}
	};
	response = rulesModel.READ({
		fields: ["rule"],
		where: [{
			field: 'id',
			oper: '=',
			value: Number(object.id)
		}]
	})[0];
	response.rule = JSON.parse(response.rule);
	result.leftLayout.id = response.rule.leftFile;
	result.rightLayout.id = response.rule.rightFile;
	result.leftLayout.name = modelLayout.READ({
		fields: ["name"],
		where: [{
			field: 'id',
			oper: '=',
			value: result.leftLayout.id
        }]
	})[0].name;
	result.rightLayout.name = modelLayout.READ({
		fields: ["name"],
		where: [{
			field: 'id',
			oper: '=',
			value: result.rightLayout.id
        }]
	})[0].name;
	return result;

};
this.createDialog = function() {
	try {
		var response = {};
		response.rules = rules.listRules({
			type: "AN4",
			fields: ['id', 'name']
		});
		response.list = this.list({}).list;
		return response;
	} catch (e) {
		$.messageCodes.push({
			"code": "DFG201005", //FIX MESSAGECODE
			"type": 'E',
			"errorInfo": util.parseError(e)
		});
	}
};
/*
Usage:
    create({
        name: <nome>,
        description: <description>,
        idRule: <id da rule>,
        idLeftFile: 1,
        idRightFile: 2,
        eefi: [{
            company: <id de company>,
            uf: <uf de estado>,
            branch: <id Filial>,
            tax: <id taxa>
        }]
    })
*/
this.create = function(object) {
	try {
		object = object || $.request.parameters.get("object");
		if (typeof object === "string") {
			object = JSON.parse(object);
		}

		object.isDeleted = 0;
		object.status = this.status.ACTIVE;
		var response = {};
		response.AN4 = modelDigitalFileAn4.createAN4(object);
		if (object.idFolder && response.AN4.id) {
			var objectToCreateFile = {
				file: {
					id_folder: object.idFolder,
					id_object: response.AN4.id,
					objectType: "DFG::AN4"
				}
			};
			var createFile = fileCRUDF.createFile(objectToCreateFile);
		}
		// LOG
		var logRegister = new logDFG();
		var register = logRegister.createAN4(response);
		return response;
	} catch (e) {
		$.messageCodes.push({
			"code": "DFG201009",
			"type": 'E',
			"errorInfo": util.parseError(e)
		});
	}
};
this.saveRawFile = function(object) {
	try {
		object = object || $.request.parameters.get("object");
		if (typeof object === "string") {
			object = JSON.parse(object);
		}

		var response = modelDigitalFileAn4.updateAN4(object);
		return response;
	} catch (e) {
		$.messageCodes.push({
			"code": "DFG201005", //FIX MESSAGECODE
			"type": 'E',
			"errorInfo": util.parseError(e)
		});
	}
};
/*
Usage:
    update({
        id: <id>,
        name: <nome>,
        description: <description>,
        idRule: <id da rule>,
        idLeftFile: 1,
        idRightFile: 2,
        eefi: [{
            id: <id>,
            company: <id de company>,
            uf: <uf de estado>,
            branch: <id Filial>,
            tax: <id taxa>
        }]
    })
*/
this.update = function(object) {
	object = object || $.request.parameters.get("object");
	if (typeof object === "string") {
		object = JSON.parse(object);
	}
	try {
		var response = modelDigitalFileAn4.updateAN4(object);
		return response;
	} catch (e) {
		$.messageCodes.push({
			"code": "DFG201005", //FIX MESSAGECODE
			"type": 'E',
			"errorInfo": util.parseError(e)
		});
	}
};

this.filters = function(object) {
	object = object || $.request.parameters.get("object");
	if (typeof object === "string") {
		object = JSON.parse(object);
	}
	var response = {};
	response.rules = rules.listRules({
		type: "AN4",
		fields: ['id', 'name']
	});

	var files = modelDigitalFile.readDigitalFile({
		fields: ["id", "name"]
	});
	for (var i = 0; i < files.length; i++) {
		var idFile = fileCRUDF.list({
			idObject: files[i].id,
			objectType: "DFG::DigitalFile"
		});
		if (idFile.length) {
			files[i].id = idFile[0].id;
		}

	}
	response.files = files;
	return response;
};
//<-----------------------------------Refactor-------------------------------------------------->
/**
 * @param {object} object - Endpoint parameter
 * @param {string} object.key - Key used to identify the type of listing to be done
 * @param {boolean | optional} object.counter - Optional parameter brings count results for all types of AN4 Files
 * @param {object | optional} object.counter - Optional parameter brings the count for a specified type of AN4 Files
 * @return {object} object.counter - Array with list of counters for specified AN4 Files types
 */
this.listFiles = function(object) {
	var response = {};
	try {
		var files = [];
		var index = 0;
		var objectType = this.getIdObjectType("DFG::AN4");
		object.idUser = users.getTimpUser().id;
		if (object.idFolder !== undefined && object.idFolder !== null) {
			files = fileCRUDFNew.listFilesByFolder({
				idUser: object.idUser,
				idFolder: object.idFolder,
				objectType: "DFG::AN4",
				fields: ["idObject", "status"]
			});
		} else {
			files = fileCRUDFNew.listFilesByStatus({
				status: object.key,
				objectType: "DFG::AN4",
				fields: ["idObject", "status", "creationUser"]
			});
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
			var join = [{
				table: usersModel,
				alias: "creationUser",
				fields: ["id", "name", "last_name"],
				on: [{
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
					left: "modificationUser",
					right: "id"
				}],
				outer: "left"
			}, {
				table: fileFavsModel,
				alias: "favorite",
				fields: ["id"],
				on: [{
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
				table: file.table,
				fields: ["idObject"],
				alias: "leftFile",
				on: [{
					left: "idLeftFile",
					right: "id"
				}],
				outer: "right"
			}, {
				table: file.table,
				alias: "rightFile",
				rename: "B",
				fields: ["idObject"],
				on: [{
					left: "idRightFile",
					right: "id"
				}],
				outer: "right"
			}, {
				table: rulesModel,
				alias: "rule",
				fields: ["id", "name"],
				on: [{
					left: "idRule",
					right: "id"
				}]
			}];
			if (object.key === "SHARED") {
				join.push({
					table: fileShareModel,
					alias: "share",
					fields: ["id"],
					on: [{
						left_table: modelDigitalFileAn4.table,
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
			if(object.hasOwnProperty("order_by") && object.order_by){
			    var order_by = object.order_by;
			}
			var an4Files = modelDigitalFileAn4.readAN4({
				fields: ["id", "name", "description", "creationDate", "modificationDate"],
				join: join,
				where: whereOptions,
				order_by:order_by ? order_by:['id'],
				paginate: {
					size: 10,
					number: Number(object.number),
					count: true
				}
			});
			response.pageCount = an4Files.pageCount;
			for (index in an4Files) {
				if (an4Files.hasOwnProperty(index)) {
					an4Files = an4Files.map(function(element) {
						for (var index2 = 0; index2 < files.length; index2++) {
							if (files[index2].idObject === element.id) {
								element.fileStatus = files[index2].status;
							}
						}
					    element.leftFile = modelDigitalFile.readDigitalFile({
					        fields: ["id", "name"],
					        where: [{
					            field: "id",
					            oper: "=",
					            value: element.leftFile.idObject
					        }] 
					    });
					    element.rightFile = modelDigitalFile.readDigitalFile({
					        fields: ["id", "name"],
			                where: [{
			                    field: "id",
			                    oper: "=",
			                    value: element.rightFile.idObject
			                }] 
					    });
						return element;
					});
				}
			}
			for (index in an4Files) {
				if (an4Files.hasOwnProperty(index)) {
					an4Files = an4Files.map(function(element) {
						for (var index2 = 0; index2 < files.length; index2++) {
							if (files[index2].idObject === element.id) {
								element.fileStatus = files[index2].status;
								return element;
							}
						}
					});
				}
			}
			response.list = an4Files;
		} else {
			response.list = [];
		}
		if (object.hasOwnProperty("counter") && object.counter) {
			var parameters = {
				objectType: "DFG::AN4",
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
		}
		
        response.filterOptions = this.filters();

	} catch (e) {
		$.trace.error(e);
		$.messageCodes.push({type: "E", code: "DFG213002", errorInfo: util.parseError(e)});
	}
	return response;
};

/**
 * @param {object} object - Endpoint parameter.
 * @param {number array} object.idObject - Array of file IDs
 * @return {object array} response - Array with copied layouts
 */
this.copy = function (object) {
	var response = [];
	try {

		var lang = ($.request.cookies.get("Content-Language") === "enus" ) ? "enus" : "ptrbr";
		if (object.hasOwnProperty("idObject")){
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
			var an4Files = modelDigitalFileAn4.readAN4(readOptions);
			for (index = 0; index < an4Files.length; index++) {
				var element = an4Files[index];
				element.name = (object.name) ? object.name : ((lang === "enus") ? "Copy of " : "Cópia de ") + element.name;
				element.description = (object.description) ? object.description : element.description;
				delete element.digitalFile;
				var an4 = modelDigitalFileAn4.createAN4(element);
				var createOptions = {
					idFolder: -1,
					idObject: an4.id,
					objectType: "DFG::AN4"
				};
				fileCRUDFNew.createFile(createOptions);
				var logRegister = new logDFG();
				logRegister.createAN4({
				    AN4: an4
				});
			}
			return response;
		}
	} catch (e) {
		$.trace.error(e);
		$.messageCodes.push({code: "DFG209005", type: "E", errorInfo: util.parseError(e)});
		return response;
	}
};

/**
 * @param {object} searchParams - endPoint Filters
 * @param {array} where - query Where Clause
 * @param {number} searchParams.rule - idRule
 * @param {number} searchParams.file1 - idLeftFile
 * @param {number} searchParams.file2 - idRightFile
 * @param {date}  searchParams.creationDateFrom - first range for the creationDate clause
 * @param {date} searchParams.creationDateTo - second range for the creationDate clause
 * @param {date}  searchParams.modificationDateFrom - first range for the modificationDate clause
 * @param {date} searchParams.modificationDateTo - second range for the modificationDate clause
 **/
this.evalSearchParams = function(searchParams, where) {
    var searchOR = [];
	for (var i in searchParams) {
	    if (_.isNil(searchParams[i]) || searchParams[i] === '') {
            continue;
	    }
		if (this.searchKeys[i] !== "creationDate" && this.searchKeys[i] !== "modificationDate") {
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
		} else {
			var date = searchParams[i].split("T")[0];
			where.push({
				field: this.searchKeys[i],
				oper: (i === "creationDateFrom" || i === "modificationDateFrom") ? ">=" : "<=",
				value: date
			});
		}

	}
}

//We push the Or array
		if (searchOR.length) {
            where.push(searchOR);
		}
};

/**
 * @param {object} object - Endpoint parameter.
 * @param {number array} object.idObject - Array of file IDs
 * @param {number} object.status - Status the file is to be updated to (1. Active/Private, 2. Trashed, 3. Deleted)
 * @return {object array} response - Array with all updated files
 */
this.updateFile = function(object) {
    var canProceed = true;
    object.objectType = "DFG::AN4";

    return (canProceed) ? fileCRUDFNew.updateFileStatus(object) : canProceed;
};

/**
 * @param {object} object - Endpoint parameter.
 * @param {number array} object.idObject - Array of file IDs
 * @return {object array} response - Array with all files added to favorites
 */
this.setFavorite = function(object) {
	return fileCRUDFNew.markFavorite({
		objectType: "DFG::AN4",
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
		objectType: "DFG::AN4",
		idObject: object.idObject
	});
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
		throw 'ObjectType Not Found';
	}
	return object.id;
};