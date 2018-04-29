//--------------------------------------------------------------------$.import("timp.core.server.api", "api");
var coreApi = $.timp.core.server.api.api;
var util = coreApi.util;
var sql = coreApi.sql;
var fileShare = coreApi.fileShareController;
var fileCRUDF = coreApi.fileCRUDFController;
var fileCRUDFNew = coreApi.fileCRUDFNew;
var fileExplorer = coreApi.fileExplorerController;
var usersModel = coreApi.users;
var user = coreApi.usersController;
var objectTypeModel = coreApi.objectTypes;
var fileFavsModel = coreApi.fileFavs;
var fileShareModel = coreApi.fileShare;
var schema = coreApi.schema.default;
var tableLib = coreApi.table_lib;
$.import("timp.atr.server.api", "api");
var atrApi = $.timp.atr.server.api.api;
var modelStructure = atrApi.structure.table;
var controllerStructure = atrApi.structureController;
var tablesCvFilials = atrApi.cvFiliais.table;
var tributoModel = atrApi.tributo.table;
var tributoAgrupamento = atrApi.tributoAgrupamento.tributoAgrupamento;
var centralizacaoMovimento = atrApi.centralizacaoMovimento;
var structureRelationController = atrApi.structureRelationController;
var companyBranches = atrApi.companyBranches.table;
//RULES
$.import('timp.bre.server.api', 'api');
var breApi = $.timp.bre.server.api.api;
var rules = breApi.rules;
var rulesController = breApi.rulesController;
var createUsage = breApi.createUsage;
var releaseUsage = breApi.releaseUsage;

const _ = $.lodash;

$.import("timp.dfg.server.models", "setting");
var modelSetting = $.timp.dfg.server.models.setting;

$.import("timp.dfg.server.models", "digitalFileTypeText");
var modelDigitalFileTypeText = $.timp.dfg.server.models.digitalFileTypeText;

$.import("timp.dfg.server.models", "settingXEefi");
var modelSettingXEefi = $.timp.dfg.server.models.settingXEefi;

$.import("timp.dfg.server.models", "settingVersion");
var modelSettingVersion = $.timp.dfg.server.models.settingVersion.table;
var controllerSettingVersion = $.timp.dfg.server.models.settingVersion;

$.import("timp.dfg.server.models", "layout");
var modelLayout = $.timp.dfg.server.models.layout.table;

$.import("timp.dfg.server.models", "layoutVersion");
var modelLayoutVersion = $.timp.dfg.server.models.layoutVersion.table;

$.import("timp.dfg.server.models", "layoutXStructure");
var modelLayoutXStructure = $.timp.dfg.server.models.layoutXStructure.table;

$.import("timp.dfg.server.models", "centralizationOfMoviment");
var modelCentralization = $.timp.dfg.server.models.centralizationOfMoviment;

$.import('timp.dfg.server.controllers', 'digitalFileType');
var controllerDigitalFileType = $.timp.dfg.server.controllers.digitalFileType;

$.import('timp.dfg.server.controllers', 'layout');
var controllerLayout = $.timp.dfg.server.controllers.layout;
$.import("timp.dfg.server.controllers", "SPED");
var controllerSPED = $.timp.dfg.server.controllers.SPED;
$.import('timp.dfg.server.controllers', 'external');
var controllerExternal = $.timp.dfg.server.controllers.external;

$.import('timp.dfg.server.controllers', 'util');
var utilDFG = $.timp.dfg.server.controllers.util;

$.import('timp.dfg.server.controllers', 'log');
var logDFG = $.timp.dfg.server.controllers.log.Supervisor;



$.import("timp.dfg.server.recordLogic", "recordLogic");
var DFGExecutor = $.timp.dfg.server.recordLogic.recordLogic.DFGExecutor;
// constants 
this.status = {
    ACTIVE: 100,
    EMITTED: 200,
    OFFICIAL: 300,
    SENT: 400,
    LOCKED: 500
};

this.folderCats = {
    STANDARD: 0,
    PUBLIC: 1,
    FAVORITE: 2,
    MYFOLDERS: 3,
    SHARED: 4
};

this.fileStatusTypes = {
    STANDARD: 0,
    ACTIVE: 1,
    TRASH: 2,
    DELETED: 3,
    PUBLIC: 4
};

this.searchKeys = {
    fileType: "idDigitalFileType",
    name: "name",
    id: "id",
    creationDateTo: "creationDate",
    creationUser: "creationUser",
    modificationUser: "modificationUser",
    creationDateFrom: "creationDate",
    modificationDateTo: "modificationDate",
    modificationDateFrom: "modificationDate"
};

this.searchKeysEEFI = {
    company: "idCompany",
    UF: "uf",
    branch: "idBranch"
};
/*
    service to list the settings (without folder structure)
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
                left: 'id',
                right: 'idSetting'
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
        }, {
            outer: 'left',
            table: modelSettingXEefi.table,
            alias: 'eefi',
            on: [{
                left_table: modelSettingVersion,
                left: 'id',
                right: 'idSettingVersion'
            }]
        }];
        var digitalFileTypeJoin = controllerDigitalFileType.tableJoin({
            table: modelLayout,
            field: 'idDigitalFileType'
        });
        var where = [];
        if (digitalFileTypeJoin) {
            for (var i = 0; i < digitalFileTypeJoin.length; i++) {
                join.push(digitalFileTypeJoin[i]);
            }
        }

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
                    table: modelLayout
                });
            }
        });
        if (typesWhere.length) {
            where.push(typesWhere);
        }
        // query to get the ids of the settings with the filter by eefi
        var idsWhere = [];
        var filters = ['idCompany', 'uf', 'idBranch', 'idTax'];
        for (var i = 0; i < filters.length; i++) {
            var filtersWhere = [];
            utilDFG.propertyArrayOrSingle({
                instance: object.filters,
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
                idsWhere.push(filtersWhere);
            }
        }
        if (object.filters !== undefined) {
            if (object.filters.hasOwnProperty("company")) {
                where.push({
                    field: "idCompany",
                    oper: "=",
                    value: object.filters.company,
                    table: modelSettingXEefi.table
                });
            }
            if (object.filters.hasOwnProperty("uf")) {
                where.push({
                    field: "uf",
                    oper: "=",
                    value: object.filters.uf,
                    table: modelSettingXEefi.table
                });
            }
            if (object.filters.hasOwnProperty("branch")) {
                where.push({
                    field: "idBranch",
                    oper: "=",
                    value: object.filters.branch,
                    table: modelSettingXEefi.table
                });
            }
            if (object.filters.hasOwnProperty("tax")) {
                where.push({
                    field: "idTax",
                    oper: "=",
                    value: object.filters.tax,
                    table: modelSettingXEefi.table
                });
            }
        }
        if (idsWhere.length) {
            var ids = modelSettingXEefi.table.READ({
                distinct: true,
                join: [{
                    outer: 'left',
                    table: modelSettingVersion,
                    alias: 'layout',
                    fields: ['idSetting'],
                    on: [{
                        left: 'idSettingVersion',
                        right: 'id'
                    }]
                }],
                where: idsWhere
            });

            var idsOr = [];
            for (var i = 0; i < ids.length; i++) {
                idsOr.push({
                    field: 'id',
                    oper: '=',
                    value: ids[i].idSettingVersion
                });
            }
            // where.push(idsOr);
        }
        // read the settings
        var readOptions = {
            join: join,
            order_by: ['name']
        };
        if (where.length) {
            readOptions.where = where;
        }
        var settings = modelSetting.readSetting(readOptions);
        if (settings) {
            for (var l = 0; l < settings.length; l++) {
                settings[l].version = {
                    id: settings[l].version[0].id,
                    idSetting: settings[l].version[0].idSetting,
                    idLayout: settings[l].version[0].idLayout,
                    legalVersion: settings[l].version[0].legalVersion,
                    validFrom: settings[l].version[0].validFrom,
                    validTo: settings[l].version[0].validTo,
                    pageLimit: settings[l].version[0].pageLimit,
                    status: settings[l].version[0].status,
                    creationDate: settings[l].version[0].creationDate,
                    creationUser: settings[l].version[0].creationUser,
                    modificationDate: settings[l].version[0].modificationDate,
                    modificationUser: settings[l].version[0].modificationUser
                };
                settings[l].layout = {
                    id: settings[l].layout[0].id,
                    idDigitalFileType: settings[l].layout[0].idDigitalFileType,
                    legalVersion: settings[l].layout[0].legalVersion,
                    name: settings[l].layout[0].name,
                    description: settings[l].layout[0].description,
                    status: settings[l].layout[0].status,
                    creationDate: settings[l].layout[0].creationDate,
                    creationUser: settings[l].layout[0].creationUser,
                    modificationDate: settings[l].layout[0].modificationDate,
                    modificationUser: settings[l].layout[0].modificationUser
                };
                settings[l].digitalFileType = {
                    id: settings[l].digitalFileType[0].id,
                    iconFont: settings[l].digitalFileType[0].iconFont,
                    icon: settings[l].digitalFileType[0].icon,
                    name: settings[l].digitalFileTypeText[0].name,
                    description: settings[l].digitalFileTypeText[0].description
                };
                var idFile = fileCRUDF.list({
                    idObject: settings[l].id,
                    objectType: "DFG::Setting"
                });
                var sharedFile = fileShare.listFileShare({
                    objectType: "DFG::Setting"
                });

                if (idFile.length > 0) {
                    settings[l].idFile = idFile[0].id;
                    if (sharedFile.length > 0) {
                        if (settings[l].idFile == sharedFile[0].idFile) {
                            settings[l].shared = 'Shared'
                        } else {
                            settings[l].shared = idFile[0].status;
                        }
                    } else {
                        settings[l].shared = idFile[0].status;
                    }
                }

                settings[l].is = {
                    favorite: false,
                    deleted: false
                };
                delete settings[l].digitalFileTypeText;
                delete settings[l].layoutXStructure;
            }
        }
        for (var currentList = 0; currentList < settings.length; currentList++) {
            var creationUser = usersModel.READ({
                fields: ['id', 'name', 'last_name'],
                where: [{
                    field: 'id',
                    oper: '=',
                    value: settings[currentList].creationUser
                }]
            })[0];
            if (creationUser) {
                settings[currentList].creationUser = creationUser.name + ' ' + creationUser.last_name;
            }
            var modificationUser = usersModel.READ({
                fields: ['id', 'name', 'last_name'],
                where: [{
                    field: 'id',
                    oper: '=',
                    value: settings[currentList].modificationUser
                }]
            })[0];

            if (modificationUser) {
                settings[currentList].modificationUser = modificationUser.name + ' ' + modificationUser.last_name;
            }

            var tax = tributoModel.READ({
                fields: ['descrCodTributoLabel'],
                where: [{
                    field: 'codTributo',
                    oper: '=',
                    value: settings[currentList].eefi[0].idTax
                }]
            })[0];

            if (tax) {
                settings[currentList].tax = tax.descrCodTributoLabel;
            }

            settings[currentList].ownerId = creationUser ? creationUser.id : null;
        }

        var _list = [];
        var favorites = fileCRUDF.listFavoriteFile({
            objectType: "DFG::Setting"
        });
        var favoritesIds = [];
        for (var _i = 0; _i < favorites.length; _i++) {
            favoritesIds.push(favorites[_i].idFile);
        }
        var shares = fileShare.listShareFilesCreationUser({
            objectType: "DFG::Setting"
        });
        var sharedIds = [];
        for (var _i = 0; _i < shares.length; _i++) {
            sharedIds.push(shares[_i].idFile)
        }

        if (object.hasOwnProperty("ids")) {
            for (var _i = 0; _i < object.ids.length; _i++) {
                for (var _items = 0; _items < settings.length; _items++) {
                    if (object.ids[_i] == settings[_items].id) {
                        if (favoritesIds.indexOf(settings[_items].idFile) >= 0) {
                            settings[_items].is.favorite = true;
                        }
                        if (sharedIds.indexOf(settings[_items].idFile) >= 0) {
                            settings[_items].shared = "Shared"
                        }
                        _list.push(settings[_items]);
                    }
                }
            }
            settings = _list;
        } else if (object.key == "FAVORITE") {
            // var favorites = fileCRUDF.listFavoriteFile({objectType:"DFG::Setting"});
            for (var i = 0; i < settings.length; i++) {
                if (favoritesIds.indexOf(settings[i].idFile) >= 0) {
                    settings[i].is.favorite = true;
                    if (sharedIds.indexOf(settings[i].idFile) >= 0) {
                        settings[i].shared = "Shared"
                    }
                    _list.push(settings[i])
                }
            }
        } else if (object.key == "STANDARD") {
            var files = fileCRUDF.listFiles({
                status: ['Standard'],
                objectType: "DFG::Setting"
            })
            for (var i = 0; i < settings.length; i++) {
                for (var j = 0; j < files.length; j++) {
                    if (settings[i].idFile == files[j].id) {
                        if (favoritesIds.indexOf(settings[i].idFile) >= 0) {
                            settings[i].is.favorite = true;
                        }
                        _list.push(settings[i])
                    }
                }
            }
        } else if (object.key == "PUBLIC") {
            var files = fileCRUDF.listFiles({
                status: ['Public'],
                objectType: "DFG::Setting"
            })
            for (var i = 0; i < settings.length; i++) {
                for (var j = 0; j < files.length; j++) {
                    if (settings[i].idFile == files[j].id) {
                        if (favoritesIds.indexOf(settings[i].idFile) >= 0) {
                            settings[i].is.favorite = true;
                        }
                        _list.push(settings[i])
                    }
                }
            }
        } else if (object.key == "TRASH") {
            var files = fileCRUDF.listFiles({
                status: ['Trash'],
                objectType: "DFG::Setting"
            })
            for (var i = 0; i < settings.length; i++) {
                for (var j = 0; j < files.length; j++) {
                    if (settings[i].idFile == files[j].id) {
                        _list.push(settings[i])
                    }
                }
            }
        } else if (object.key == "SHARED") {
            var files = fileShare.listFileShare({
                objectType: "DFG::Setting"
            })
            for (var i = 0; i < settings.length; i++) {
                for (var j = 0; j < files.length; j++) {
                    if (settings[i].idFile == files[j].file[0].id) {
                        if (favoritesIds.indexOf(settings[i].idFile) >= 0) {
                            settings[i].is.favorite = true;
                        }
                        settings[i].shared = "Shared"
                        _list.push(settings[i])
                    }
                }
            }
        } else if (object.key == "ACTIVE") {
            var files = fileCRUDF.listFiles({
                status: ['Active'],
                objectType: "DFG::Setting"
            })
            for (var i = 0; i < settings.length; i++) {
                for (var j = 0; j < files.length; j++) {
                    if (settings[i].idFile == files[j].id) {
                        _list.push(settings[i])
                    }
                }
            }
        } else if (_list.length == 0) {
            var favoritesFiles = fileCRUDF.listFavoriteFile({
                objectType: "DFG::Setting"
            });
            var files = fileCRUDF.listFiles({
                status: ['Standard', 'Public'],
                objectType: "DFG::Setting"
            })
            var sharedFiles = fileShare.listFileShare({
                objectType: "DFG::Setting"
            })
            var privateFiles = fileCRUDF.listAllUserFiles();
            files = files.concat(privateFiles)

            for (var i = 0; i < settings.length; i++) {
                for (var j = 0; j < files.length; j++) {
                    if (settings[i].idFile == files[j].id) {
                        if (JSON.stringify(_list).indexOf(JSON.stringify(settings[i])) < 0) {
                            _list.push(settings[i])
                        }
                    }
                }
                for (var j = 0; j < favoritesFiles.length; j++) {
                    if (settings[i].idFile == favoritesFiles[j].file[0].id) {
                        if (JSON.stringify(_list).indexOf(JSON.stringify(settings[i])) < 0) {
                            _list.push(settings[i])
                        }
                    }
                }
                for (var j = 0; j < sharedFiles.length; j++) {
                    if (settings[i].idFile == sharedFiles[j].file[0].id) {
                        if (JSON.stringify(_list).indexOf(JSON.stringify(settings[i])) < 0) {
                            _list.push(settings[i])
                        }
                    }
                }
            }
        }

        var counters = fileCRUDF.getCounters({
            objectType: "DFG::Setting"
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
            "code": "DFG210000",
            "type": 'E'
        });
    }
};
var validateDates = function(dates1, dates2) {

    if (dates2.validityStart !== null) {
        var validityStart = ((new Date(dates2.validityStart)).toISOString()).split("T")[0];
        var validityFinish = dates2.validityFinish === null || !dates2.validityFinish ? null : ((new Date(dates2.validityFinish)).toISOString())
            .split("T")[0];
        var periodStart = ((new Date(dates1.validFrom)).toISOString()).split("T")[0];
        var periodFinish = !dates1.validTo ? null : ((new Date(dates1.validTo)).toISOString()).split("T")[0];
        if (periodStart < validityStart) {
            return false;
        } else {
            if (validityFinish !== null) {
                if (periodStart > validityFinish) {
                    return false;
                }
            }
        }

        if (periodFinish === null && validityFinish !== null) {
            return false;
        } else {
            if (periodFinish !== null && validityFinish !== null) {
                if (periodFinish > validityFinish) {
                    return false;
                }
            }
        }
    }
    return true;
};

this.filters = function(object) {
    try {
        object = object || $.request.parameters.get("object");
        if (typeof object === "string") {
            object = JSON.parse(object);
        }
        var response = {
            fileType: controllerDigitalFileType.list(),
            //      structures: controllerStructure.listStructuresName2(),
            //      company: controllerExternal.listCompany(),
            //      UF: controllerExternal.listUF(),
            //      branch: controllerExternal.listBranch(),
            tax: controllerExternal.listTax(),
            company: companyBranches.getCompanyBranchesFilter()
        };
        return response;
    } catch (e) {
        $.messageCodes.push({
            "code": "DFG210022",
            "type": 'E'
        });
    }
};

/*
    service to return the informations for the creation dialog
*/
this.getSettings = function(object) {
    try {
        var activedFiles = fileCRUDFNew.listFilesByStatus({
            objectType: "DFG::Setting",
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

        var join = [{
            outer: 'left',
            table: modelSettingVersion,
            alias: 'version',
            on: [{
                left: 'id',
                right: 'idSetting'
            }]
        }, {
            outer: 'left',
            table: modelSettingXEefi.table,
            alias: 'eefi',
            on: [{
                left_table: modelSettingVersion,
                left: 'id',
                right: 'idSettingVersion'
            }]
        }, {
            outer: "left",
            table: modelLayoutVersion,
            alias: "layout",
            fields: ["idLayout"],
            on: [{
                left: "idLayoutVersion",
                right: "id"
            }]
        }];
        var options = {
            join: join,
            fields: ["id", "name", "idLayoutVersion"]
        };

        options.where = [allFilesId];
        if (object && object.idLayoutVersion) {
            options.where.push({
                field: "idLayoutVersion",
                oper: "=",
                value: object.idLayoutVersion
            });
        }
        if (object && object.withSPEDs) {
            return {
                SPEDs: controllerSPED.getSPEDs(object),
                settings: modelSetting.readSetting(options)
            };
        }
        return modelSetting.readSetting(options);
    } catch (e) {
        $.messageCodes.push({
            "code": "DFG210000",
            "type": 'E'
        });
    }
};
this.createDialog = function(object) {
    try {
        var createDialog = {
            list: this.getSettings(),
            layouts: controllerLayout.getLayouts(),
            companies: controllerExternal.listCompany()
        };
        return createDialog;
    } catch (e) {
        $.messageCodes.push({
            "code": "DFG210018",
            "type": 'E'
        });
    }
};
this.editDialog = function(object) {
    try {
        var editDialog = {};
        editDialog.layouts = controllerLayout.list();
        return editDialog;
    } catch (e) {
        $.messageCodes.push({
            "code": "DFG210018",
            "type": 'E'
        });
    }
};

this.getVersions = function(object) {
    try {
        var versions = modelLayoutVersion.READ({
            fields: ["id", "version", "json", "idLayout"],
            where: [{
                field: "idLayout",
                oper: "=",
                value: object.idLayout
            }]
        });
        return versions;
    } catch (e) {
        $.messageCodes.push({
            "code": "DFG210024",
            "type": 'E'
        });
    }
};
this.getValidDates = function(object) {
    try {
        var dates = modelLayout.READ({
            //simulate : true ,
            fields: ["validFrom", "validTo"],
            where: [{
                field: "id",
                oper: "=",
                value: object.id
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

this.create = function(object) {
    try {
        // throw object
        // when creating adds the new setting as ACTIVE
        object.status = this.status.ACTIVE;
        var layoutVersion = modelLayoutVersion.READ({
            //simulate: true,
            where: [{
                field: "id",
                oper: "=",
                value: object.idLayoutVersion
            }]
        })[0];

        if (!validateDates(object, layoutVersion)) {
            $.messageCodes.push({
                "code": "DFG210005",
                "type": 'E'
            });
            return false;
        }

        var setting = modelSetting.createSetting(object);

        if (object.idFolder && setting.id) {
            var objectToCreateFile = {
                file: {
                    id_folder: object.idFolder,
                    id_object: setting.id,
                    objectType: "DFG::Setting"
                }
            };
            var createFile = fileCRUDF.createFile(objectToCreateFile);
        }

        object.idSetting = setting.id;

        this.createVersion(object);
        // LOG
        var logRegister = new logDFG();
        var register = logRegister.createSetting(setting);
        return setting;
    } catch (e) {
        $.trace.error(e);
        var logRegister = new logDFG();
        var register = logRegister.errorCreateSetting(util.parseError(e));
        $.messageCodes.push({
            "code": "DFG210019",
            "type": 'E'
        });
    }
};

this.createVersion = function(object) {
    var version = modelSettingVersion.READ({
        where: [{
            field: 'idSetting',
            oper: '=',
            value: object.idSetting
        }, {
            field: 'status',
            oper: '=',
            value: this.status.ACTIVE
        }]
    });
    if (version && version.length) {
        version = version[0];
        var where = [{
            field: 'id',
            oper: '=',
            value: version.id
        }];
        var updateSettingVersion = {
            status: this.status.LOCKED,
            validTo: object.validFrom ? new Date(object.validFrom - 24 * 60 * 60 * 1000) : version.validTo
        };
        modelSettingVersion.UPDATEWHERE(updateSettingVersion, where);
    }
    // when creating adds the new version as ACTIVE
    object.status = this.status.ACTIVE;
    var version = modelSettingVersion.CREATE(object);
    for (var i = 0; i < object.eefi.length; i++) {
        var settingXEefi = {
            idSettingVersion: version.id,
            idCompany: object.eefi[i].idCompany,
            uf: object.eefi[i].uf,
            idBranch: object.eefi[i].idBranch,
            idTax: object.eefi[i].idTax,
            isTaxGroup: object.eefi[i].isTaxGroup ? 1 : 0
        };
        modelSettingXEefi.table.CREATE(settingXEefi);
    }
    return version;
};

this.updateSettingData = function(object) {
    try {
        object = object || $.request.parameters.get("object");

        if (typeof object === "string") {
            object = JSON.parse(object);
        }
        var where = [{
            field: 'id',
            oper: '=',
            value: object.id
        }];

        var setting = modelSetting.readSetting({
            join: [{
                outer: 'left',
                table: modelSettingVersion,
                alias: 'version',
                on: [{
                    left: 'id',
                    right: 'idSetting'
                }]
            }],
            where: where
        });

        if (setting && setting.length) {
            setting = setting[0];
            where = [{
                field: 'id',
                oper: '=',
                value: object.id
            }];

            var updateSetting = {
                name: object.name,
                description: object.description,
                idLayoutVersion: object.idLayoutVersion ? object.idLayoutVersion : setting.idLayoutVersion
            };

            modelSetting.updateSetting(updateSetting, where);

            if (object.version.length) {
                where = [{
                    field: 'id',
                    oper: '=',
                    value: object.version[0].id
                }];

                var updateSettingVersion = {
                    idLayout: object.version[0].idLayout,
                    validFrom: object.version[0].validFrom,
                    validTo: object.version[0].validTo
                };

                setting = modelSettingVersion.UPDATEWHERE(updateSettingVersion, where);
            }

            if (object.newEEFI && object.newEEFI.length) {
                object.EEFI.forEach(function(value) {
                    where = [{
                        field: 'id',
                        oper: '=',
                        value: value.id
                    }];
                    modelSettingXEefi.deleteSettingXEefi(where);
                });

                object.newEEFI.forEach(function(value) {
                    modelSettingXEefi.createSettingXEefi(value);
                });
            }

            // LOG
            var logRegister = new logDFG();
            var register = logRegister.updateSetting(object);
        } else {
            setting = false;
        }
        return setting;
    } catch (e) {
        $.messageCodes.push({
            "code": "DFG210021",
            "type": 'E'
        });
    }
};

this.update = function(object) {
    try {
        object = object || $.request.parameters.get("object");
        if (typeof object === "string") {
            object = JSON.parse(object);
        }

        var where = [{
            field: 'id',
            oper: '=',
            value: object.id
        }];
        if (object.hasOwnProperty('idSettingVersion') && object.idSettingVersion) {
            where.push({
                field: 'id',
                oper: '=',
                value: object.idSettingVersion,
                table: modelSettingVersion
            });
        } else {
            where.push({
                field: 'status',
                oper: '=',
                value: this.status.ACTIVE,
                table: modelSettingVersion
            });
        }
        var setting = modelSetting.readSetting({
            join: [{
                outer: 'left',
                table: modelSettingVersion,
                alias: 'version',
                on: [{
                    left: 'id',
                    right: 'idSetting'
                }]
            }],
            where: where
        });
        if (setting && setting.length) {
            setting = setting[0];
            var where = [{
                field: 'id',
                oper: '=',
                value: object.id
            }];
            var updateSetting = {
                name: object.name || setting.name,
                description: object.description || setting.description,
                idLayoutVersion: object.idLayoutVersion || setting.idLayoutVersion
                // json: object.json || setting.version.json
            };

            modelSetting.updateSetting(updateSetting, where);
            where = [{
                field: 'id',
                oper: '=',
                value: setting.version[0].id
            }];
            updateSetting = {
                // name: object.name || setting.name,
                // description: object.description || setting.description
                json: object.json || setting.version[0].json,
                validTo: object.validTo || setting.version[0].validTo,
                idLayout: object.idLayout || setting.version[0].idLayout
            };
            setting = modelSettingVersion.UPDATEWHERE(updateSetting, where);
            // LOG
            var logRegister = new logDFG();
            var register = logRegister.updateSetting(object);
        } else {
            setting = false;
        }
        return setting;
    } catch (e) {
        $.trace.error(e);
        var logRegister = new logDFG();
        var register = logRegister.errorUpdateSetting(object.id, util.parseError(e));
        $.messageCodes.push({
            "code": "DFG210021",
            "type": 'E'
        });
    }
};

this.read = function(object) {
    try {
        object = object || $.request.parameters.get("object");
        if (typeof object === "string") {
            object = JSON.parse(object);
        }

        var join = [{
            outer: 'left',
            table: modelSettingVersion,
            alias: 'version',
            on: [{
                left: 'id',
                right: 'idSetting'
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
        }, {
            outer: 'left',
            table: modelSettingXEefi.table,
            alias: 'eefi',
            on: [{
                left_table: modelSettingVersion,
                left: 'id',
                right: 'idSettingVersion'
            }]
        }, {
            outer: 'left',
            table: modelLayoutVersion,
            alias: 'layoutVersion',
            on: [{
                left: 'idLayoutVersion',
                right: 'id'
            }]
        }];
        controllerDigitalFileType.tableJoin({
            table: modelLayout,
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
        if (object.hasOwnProperty('idSettingVersion') && object.idSettingVersion) {
            where.push({
                field: 'id',
                oper: '=',
                value: object.idSettingVersion,
                table: modelSettingVersion
            });
        }

        var readOptions = {
            join: join
        };
        if (where.length) {
            readOptions.where = where;
        }
        var setting = modelSetting.readSetting(readOptions);
        if (setting && setting.length) {
            setting = setting[0];
            setting.version = {
                id: setting.version[0].id,
                idSetting: setting.version[0].idSetting,
                idLayout: setting.version[0].idLayout,
                legalVersion: setting.version[0].legalVersion,
                validFrom: setting.version[0].validFrom,
                validTo: setting.version[0].validTo,
                json: setting.version[0].json,
                pageLimit: setting.version[0].pageLimit,
                status: setting.version[0].status,
                creationDate: setting.version[0].creationDate,
                creationUser: setting.version[0].creationUser,
                modificationDate: setting.version[0].modificationDate,
                modificationUser: setting.version[0].modificationUser
            };
            setting.layout = {
                id: setting.layout[0].id,
                idDigitalFileType: setting.layout[0].idDigitalFileType,
                legalVersion: setting.layout[0].legalVersion,
                name: setting.layout[0].name,
                description: setting.layout[0].description,
                json: setting.layout[0].json,
                status: setting.layout[0].status,
                creationDate: setting.layout[0].creationDate,
                creationUser: setting.layout[0].creationUser,
                modificationDate: setting.layout[0].modificationDate,
                modificationUser: setting.layout[0].modificationUser
            };
            setting.digitalFileType = {
                id: setting.digitalFileType[0].id,
                iconFont: setting.digitalFileType[0].iconFont,
                icon: setting.digitalFileType[0].icon,
                name: setting.digitalFileTypeText[0].name,
                description: setting.digitalFileTypeText[0].description
            };
            delete setting.digitalFileTypeText;
            delete setting.layoutXStructure;
            for (var i = 0; i < setting.structure.length; i++) {
                if (setting.structure[i].structure) {
                    var structure = JSON.parse(setting.structure[i].structure);
                    structure.id = setting.structure[i].id;
                    structure.title = setting.structure[i].title;
                    setting.structure[i] = structure;
                }
            }
            var tax;
            if (!setting.eefi[0].isTaxGroup) {
                tax = tributoModel.READ({
                    fields: ['codTributo', 'descrCodTributoLabel'],
                    where: [{
                        field: 'codTributo',
                        oper: '=',
                        value: setting.eefi[0].idTax
                    }]
                })[0];
            } else {
                tax = tributoAgrupamento.READ({
                    fields: ["id", "nomeAgrupamento"],
                    where: [{
                        field: 'id',
                        oper: '=',
                        value: setting.eefi[0].idTax
                    }]
                })[0];
                tax.codTributo = tax.id;
                delete tax.id;
                tax.descrCodTributoLabel = tax.nomeAgrupamento + "-" + (object.lang === "enus" ? "Group" : "Grupo");
                delete tax.nomeAgrupamento;
                tax.isTaxGroup = true;
            }

            if (tax) {
                setting.idTax = tax;
            }
            // LOG
            var logRegister = new logDFG();
            var register = logRegister.readSetting(setting);
        } else {
            setting = false;
        }
        return setting;
    } catch (e) {
        $.messageCodes.push({
            "code": "DFG210020",
            "type": 'E'
        });
    }
};

this._verifyRules = function(rawFile) {
    var response = {};
    var lin = rawFile.split('\r\n');
    var linOrig = rawFile.split('\r\n');
    var linRules = {};
    var typeRules = {};
    var teste = [];

    for (var i = 0; i < lin.length; i++) {
        while (lin[i].search('{') !== -1) {
            var iniRule = lin[i].search('{');
            var fimRule = lin[i].search('}');
            var countRule = fimRule - iniRule;
            var completeRule = JSON.stringify(lin[i].substr(iniRule, countRule + 1));
            var ruleStr = lin[i].substr(iniRule + 1, countRule - 1);
            var messagesRule = ruleStr.split(',');
            linRules[parseInt(i, 10) + 1] = messagesRule;
            lin[i] = lin[i].replace(JSON.parse(completeRule), '');
        }
    }
    response.rawFile = lin.join("\r\n");
    response.linRules = linRules;
    return response;
};

this.setting = {};
//<---READ----
this.setting.read = function(object) {
    try {
        var infoSetting = setting.READ({
            where: [{
                "field": "id",
                "oper": "=",
                "value": object.id
            }]
        })[0];

        var infoSettingEefi = settingEefi.READ({
            where: [{
                "field": "idSetting",
                "oper": "=",
                "value": object.id
            }]
        });

        var infoDigitalFile = digitalFile.READ({
            where: [{
                "field": "idSetting",
                "oper": "=",
                "value": object.id
            }]
        });

        var response = {};
        var responseJson = {};
        //if(infoSetting){
        response.id = infoSetting.id;
        response.name = infoSetting.name;
        responseJson = JSON.parse(infoSetting.json);
        response.description = infoSetting.description;
        response.creationDate = infoSetting.creationDate;
        response.creationUser = infoSetting.creationUser;
        response.modificationDate = infoSetting.modificationDate;
        response.modificationUser = infoSetting.modificationUser;
        //}

        response.is = {
            favorite: false,
            deleted: false
        };

        // if(infoDigitalFile){
        var digitalFileArry = [];
        for (var i = 0; i < infoDigitalFile.length; i++) {
            digitalFileArry.push({
                id: infoDigitalFile[i].id,
                name: infoDigitalFile[i].name,
                description: infoDigitalFile[i].description,
                iconFont: "",
                icon: ""
            });
        }
        response.digitalFile = digitalFileArry;
        // }

        //(infoSettingEefi){
        var company = [];
        var uf = [];
        var branch = [];
        for (var j = 0; j < infoSettingEefi.length; j++) {
            company.push({
                id: infoSettingEefi[j].idCompany,
                name: infoSettingEefi[j].idCompany
            });

            uf.push({
                id: infoSettingEefi[j].idUf,
                name: infoSettingEefi[j].idUf
            });

            branch.push({
                id: infoSettingEefi[j].idBranch,
                name: infoSettingEefi[j].idUf,
                description: "",
                company: "",
                uf: ""
            });
        }
        response.company = company;
        response.uf = uf;
        response.branch = branch;
        //}
        //ADD Proporty Of Field JSON
        if (responseJson) {
            for (var property in responseJson) {
                response[property] = responseJson[property];
            }
        }
        return response;
    } catch (e) {
        $.messageCodes.push({
            "code": "DFG201005",
            "type": 'E',
            "errorInfo": util.parseError(e)
        });
    }
};

function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) {
            copy[attr] = obj[attr];
        }
    }
    return copy;
}

//<-----------------------------------Refactor----------------------------------->
function addEEFIInformation(settings, searchParams) {
    var response = [];
    let searchKeysEEFI = {
        company: "idCompany",
        UF: "uf",
        branch: "idBranch"
    };
    var lang = ($.request.cookies.get("Content-Language") === "enus") ? "enus" : "ptrbr";
    try {
        var readOptions = {
            where: [
                []
            ]
        };
        for (var i = 0; i < settings.length; i++) {
            readOptions.where[0].push({
                field: "idSettingVersion",
                oper: "=",
                value: settings[i].version[0].id
            });
        }
        var settingsXEefi = modelSettingXEefi.readSettingXEefi(readOptions);
        settings.map(function(setting) {
            setting.EEFI = [];
            settingsXEefi = settingsXEefi.filter(function(version) {
                if (version.idSettingVersion === setting.version[0].id) {
                    //Check Filters EFFI
                    if (searchParams !== undefined) {
                        for (let key in searchKeysEEFI) {
                            if (searchParams.hasOwnProperty(key)) {
                                if (searchParams[key] !== version[searchKeysEEFI[key]]) {
                                    version = null;
                                }
                            }
                        }
                        if (version !== null) {
                            setting.EEFI.push(version);
                            return false;
                        }
                    } else {
                        setting.EEFI.push(version);
                        return false;
                    }
                }
                return true;
            });
            if (setting.EEFI.length > 0) {
                response.push(setting);
            }
            return setting;
        });
        var taxes = tributoModel.READ({});
        var taxGroups = tributoAgrupamento.READ({});
        var taxMap = new Map();
        for (var index = 0; index < taxes.length; index++) {
            //Check Filter for tax
            if (searchParams !== undefined && searchParams.hasOwnProperty("tax")) {
                if (taxes[index].codTributo === searchParams.tax) {
                    taxMap.set(taxes[index].codTributo, taxes[index].descrCodTributoLabel);
                }
            } else {
                taxMap.set(taxes[index].codTributo, taxes[index].descrCodTributoLabel);
            }
        }
        for (var index = 0; index < taxGroups.length; index++) {
            //Check Filter for tax
            if (searchParams !== undefined && searchParams.hasOwnProperty("tax")) {
                if (taxes[index].id + "G" === searchParams.tax) {
                    taxMap.set(taxGroups[index].id + "G", taxGroups[index].nomeAgrupamento + "-" + (lang === "enus" ? "Group" : "Grupo"));
                }
            } else {
                taxMap.set(taxGroups[index].id + "G", taxGroups[index].nomeAgrupamento + "-" + (lang === "enus" ? "Group" : "Grupo"));
            }
        }
        var filteredResponse = [];
        response = response.map(function(setting) {
            var filteredConfigurations = [];
            setting.EEFI = setting.EEFI.map(function(configuration) {
                if (searchParams !== undefined && searchParams.hasOwnProperty("tax")) {
                    if (taxMap.get(configuration.idTax) !== undefined) {
                        if (configuration.isTaxGroup) {
                            configuration.idTax = taxMap.get(configuration.idTax + "G");
                        } else {
                            configuration.idTax = taxMap.get(configuration.idTax);
                        }

                        filteredConfigurations.push(configuration);
                    }
                } else {
                    if (configuration.isTaxGroup) {
                        configuration.idTax = taxMap.get(configuration.idTax + "G");
                    } else {
                        configuration.idTax = taxMap.get(configuration.idTax);
                    }
                    filteredConfigurations.push(configuration);
                }
                return configuration;
            });
            if (filteredConfigurations.length > 0) {
                setting.EEFI = filteredConfigurations;
                filteredResponse.push(setting);
            }
            return setting;
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
}

this.listFiles = function(object) {
    var response = {};
    try {
        var files = [];
        var lang = ($.request.cookies.get("Content-Language") === "enus") ? "enus" : "ptrbr";
        var objectType = this.getIdObjectType("DFG::Setting");
        object.idUser = user.getTimpUser().id;
        if (object.idFolder) {
            files = fileCRUDFNew.listFilesByFolder({
                idUser: object.idUser,
                idFolder: object.idFolder,
                objectType: "DFG::Setting",
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
                status: object.key,
                objectType: "DFG::Setting",
                fields: ["idObject", "status", "creationUser"]
            });
        }
        if (files.length) {
            var whereOptions = [
                []
            ];
            for (var index in files) {
                if (files.hasOwnProperty(index)) {
                    whereOptions[0].push({
                        field: "id",
                        oper: "=",
                        value: files[index].idObject
                    });
                }
            }
            var join = [{
                outer: "left",
                table: modelSettingVersion,
                alias: "version",
                on: [{
                    left: "id",
                    right: "idSetting"
                }]
            }, {
                table: modelDigitalFileTypeText.table,
                alias: "type",
                fields: ["name"],
                on: [{
                    left_table: modelSetting.table,
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
                    left_table: modelSetting.table,
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
                    left_table: modelSetting.table,
                    left: "modificationUser",
                    right: "id"
                }],
                outer: "left"
            }, {
                table: fileFavsModel,
                alias: "favorite",
                fields: ["id"],
                on: [{
                    left_table: modelSetting.table,
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
                        left_table: modelSetting.table,
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
            var settings = modelSetting.readSetting({
                fields: ["id", "name", "description", "creationDate", "modificationDate"],
                join: join,
                where: whereOptions,
                order_by: order_by ? order_by : ['id'],
                paginate: {
                    size: 15,
                    number: Number(object.number),
                    count: true
                }
            });

            response.pageCount = settings.pageCount;
            if (settings.length) {
                settings = addEEFIInformation(settings, object.searchParams);
            }
            for (index in settings) {
                if (settings.hasOwnProperty(index)) {
                    settings = settings.filter(function(element, index) {
                        for (var index2 = 0; index2 < files.length; index2++) {
                            if (files[index2].idObject === element.id) {
                                element.fileStatus = files[index2].status;
                                return element;
                            }
                        }
                    });
                }
            }
            response.list = settings;
        } else {
            response.list = [];
        }
        response.filterOptions = this.filters();
        if (object.hasOwnProperty("counter") && object.counter) {
            var counterOptions = {
                objectType: "DFG::Setting",
                counter: true
            };
            if (typeof object.counter === "object") {
                for (var key in object.counter) {
                    if (object.counter.hasOwnProperty(key)) {
                        counterOptions[key] = object.counter[key];
                    }
                }
                response.counters = fileCRUDFNew.getFileCounters(counterOptions);
            } else {
                response.counters = fileCRUDFNew.getFileCounters(counterOptions);
            }
        }
    } catch (e) {
        $.trace.error(e);
        $.messageCodes.push({
            code: "DFG210000",
            type: "E",
            errorInfo: util.parseError(e)
        });
    }
    return response;
};

/**
 * @param {object} object - Endpoint parameter.
 * @param {number array} object.idObject - Array of file IDs
 * @return {object array} response - Array with copied layouts
 */
this.copy = function(object) {
    var response = [];
    try {
        if (object.hasOwnProperty("idObject")) {
            var index = 0;
            var readOptions = {};
            readOptions.where = [
                []
            ];
            for (index = 0; index < object.idObject.length; index++) {
                readOptions.where[0].push({
                    field: "id",
                    oper: "=",
                    value: object.idObject[index]
                });
            }
            var settings = modelSetting.readSetting(readOptions);
            for (index = 0; index < settings.length; index++) {
                var settingVersion = controllerSettingVersion.readSettingVersion({
                    where: [{
                        field: "idSetting",
                        oper: "=",
                        value: settings[index].id
                    }]
                })[0];
                var settingXEefi = modelSettingXEefi.readSettingXEefi({
                    where: [{
                        field: "idSettingVersion",
                        oper: "=",
                        value: settingVersion.id
                    }]
                });
                settings[index].name = (object.name) ? object.name : settings[index].name;
                settings[index].description = (object.name) ? object.description : settings[index].description;
                var setting = modelSetting.createSetting(settings[index]);
                settingVersion.idSetting = setting.id;
                settingVersion.validFrom = (object.validFrom) ? object.validFrom : settingVersion.validFrom;
                settingVersion.validTo = (object.validTo) ? object.validTo : settingVersion.validTo;
                var copySettingVersion = controllerSettingVersion.createSettingVersion(settingVersion);
                for (var index2 = 0; index2 < settingXEefi.length; index2++) {
                    settingXEefi[index2].idSettingVersion = copySettingVersion.id;
                    modelSettingXEefi.createSettingXEefi(settingXEefi[index2]);
                }
                var createOptions = {
                    idFolder: -1,
                    idObject: setting.id,
                    objectType: "DFG::Setting"
                };
                fileCRUDFNew.createFile(createOptions);
                var logRegister = new logDFG();
                logRegister.createSetting(setting);
            }
            return response;
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
 * @param {number} object.status - Status the file is to be updated to (1. Active/Private, 2. Trashed, 3. Deleted)
 * @return {object array} response - Array with all updated files
 */
this.updateFile = function(object) {
    try {
        var canProceed = true;
        object.objectType = "DFG::Setting";
        var response = fileCRUDFNew.updateFileStatus(object);
        var logRegister = new logDFG();
        if (!$.lodash.isArray(object.idObject)) {
            object.idObject = [object.idObject];
        }
        object.idObject.map(function(id) {
            if (object.status === 1) {
                logRegister.restoreSetting(id);
            } else if (object.status === 2) {
                logRegister.trashSetting(id);
            } else if (object.status === 3) {
                logRegister.deleteSetting(id);
            }
        });
        return response;
    } catch (e) {
        $.trace.error(e);
        var logRegister = new logDFG();
        if (object.status === 1) {
            logRegister.errorRestoreSetting(object.id, $.trace.error(e));
        } else if (object.status === 2) {
            logRegister.errorTrashSetting(object.id, $.trace.error(e));
        } else if (object.status === 3) {
            logRegister.errorDeleteSetting(object.id, $.trace.error(e));
        }
        $.messageCodes.push({
            type: 'E',
            code: 'DFG209016',
            errorInfo: util.parseError(e)
        });
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
                objectType: "DFG::Setting",
                idObject: unFavorites
            });
        }
        if (favorites.length) {
            result.unFavorites = fileCRUDFNew.unmarkFavorite({
                objectType: "DFG::Setting",
                idObject: favorites
            });
        }
        return result;
    } catch (e) {
        $.trace.error(e);
        $.messageCodes.push({
            "code": "DFG210016",
            "type": 'E'
        });
    }
};

/**
 * @param {object} object - Endpoint parameter.
 * @param {number array} object.idObject - Array of file IDs
 * @return {object array} response - Array with all files removed from favorites
 */
this.removeFavorite = function(object) {
    return fileCRUDFNew.unmarkFavorite({
        objectType: "DFG::Setting",
        idObject: object.idObject
    });
};

/**
 * @param {object} searchParams - Endpoint Filters
 * @param {array} where - query Where Clause
 * @param {array} join - query JOIN Clause
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
            
            if (this.searchKeys.hasOwnProperty(i)) {
			//if we receive a name filter, we'll push it as an id
			if (!isNaN(searchParams[i]) && !searchParams.hasOwnProperty("id")) {
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



//NEW DFG EXECUTOR --- KBARA 30/11/2016
this.executeDF = function(object) {
    var response = {};
    try {
        object = typeof object === "string" ? JSON.parse(object) : object;
        var initTTime = new Date();
        var mappingReadTime, structureReadTime, executeTime;
        var initTime;
        var block = object.actualBlock;
        var record = object.actualRecord;
        var executedData = object.executedData;
        var recordData = object.recordData;
        recordData.blockId = block;
        recordData.recordId = record;
        var structureCache = {};
        initTime = new Date();
        if (!object.structureMapCache) {
            recordData.idStructure.map(function(s, id) {
                var structure = modelStructure.getStructure(s, lang);
                if (structure) {
                    structureCache[s] = JSON.parse(JSON.stringify(structure));
                    structureCache[s].fields = {};
                    structure.fields.map(function(f, i) {
                        structureCache[s].fields[f.ID] = structure.fields[i];
                    });
                }
            });
        }
        structureReadTime = new Date() - initTime;
        initTime = new Date();
        var eefiConditions = Object.keys(structureCache).length !== 0 || object.structureMapCache ? this.getEEFIConditionsMultipleStructure(
            object, structureCache, object.structureMapCache,
            recordData.idStructure) : {
            eefiKeys: []
        };

        mappingReadTime = new Date() - initTime;
        initTime = new Date();
        this.cleanRecordData(recordData);
        if (recordData.structureRelation && recordData.structureRelation.length) {
            recordData.structureRelation = structureRelationController.getStructureRelations({
                id: recordData.structureRelation
            });
        }
        var recordObject = new DFGExecutor.Record({
            eefi: object,
            structureMapCache: object.structureMapCache,
            manualParameters: object.manualParams,
            structureCache: structureCache,
            eefiConditions: eefiConditions,
            executedData: executedData,
            layoutFilters: object.layoutFilters,
            separator: object.separator
        }, recordData);
        var resultRecord = recordObject.getQueries();
        var hasListRecord = recordObject.hasListRecord || false;
        var queries = resultRecord.queries;
        var groupTableCache = resultRecord.groupTableCache;
        var dependentRecordsCache = resultRecord.dependentRecordsCache;
        var listFieldsTable = resultRecord.listFieldsTable;
        var count = 0;
        var resultQueries = [];
        var getDataTime = new Date();
        var unformattedQueries = [];
        var registerMap = {};
        for (var i = 0; i < queries.length; i++) {
            var resultQuery = sql.SELECT(queries[i]);
            var formattedlines = [];
            var unformattedlines = [];
            resultQuery.map(function(line) {
                let formattedLine = line.splice(0, object.getCount ? resultRecord.columnAmount + 1 : resultRecord.columnAmount);
                let formattedLineString = formattedLine.join(';');
                let registerData = {};
                if (!recordData.isDistinct || _.isNil(registerMap[formattedLineString])) {
                    formattedlines.push(formattedLine);
                    registerMap[formattedLineString] = true;
                }
                unformattedlines.push(line);
            });

            resultQueries.push(formattedlines);
            unformattedQueries.push(unformattedlines);
        }
        for (var i = 0; i < groupTableCache.length; i++) {
            sql.EXECUTE({
                query: "DROP TABLE " + groupTableCache[i]
            });
            sql.EXECUTE({
                query: "DROP SEQUENCE " + groupTableCache[i].substring(0, groupTableCache[i].length - 1) + "::ID\""
            });
        }
        if (dependentRecordsCache && Object.keys(dependentRecordsCache).length) {
            for (var block in dependentRecordsCache) {
                for (var record in dependentRecordsCache[block]) {
                    sql.EXECUTE({
                        query: "DROP TABLE " + dependentRecordsCache[block][record]
                    });
                    sql.EXECUTE({
                        query: "DROP SEQUENCE " + dependentRecordsCache[block][record].substring(0, dependentRecordsCache[block][record].length - 1) + "::ID\""
                    });
                }
            }
        }
        getDataTime = (new Date() - getDataTime) / 1000;
        var rRecordLines = {};
        var unformattedRRecordLines = {};
        var relationFieldsValues = {};
        var nRecordLines = {};
        var unformattedNRecordLines = {};
        var nRecordLinesXPositions = {};
        var nlineIndex = object.lineCount;
        var rlineIndex = object.lineCount;
        var firstTime = true;
        if (object.recordData.isDistinct && resultQueries.length > 1) {
            for (var f = 0; f < resultQueries.length; f++) {
                for (var t = 0; t < resultQueries[f].length; t++) {
                    var line = resultQueries[f][t].join("");
                    var unformattedLine = unformattedQueries[f][t].join("");
                    for (var f2 = f + 1; f2 < resultQueries.length; f2++) {
                        var newA = [];
                        var newUnformattedA = [];
                        for (var t2 = 0; t2 < resultQueries[f2].length; t2++) {
                            if (resultQueries[f2][t2].join("") !== line) {
                                newA.push(resultQueries[f2][t2]);
                            }
                            if (unformattedQueries[f2][t2].join("") !== unformattedLine) {
                                newUnformattedA.push(unformattedQueries[f2][t2]);
                            }
                        }
                        resultQueries[f2] = newA;
                        newUnformattedA[f2] = newUnformattedA;
                    }
                }
            }
        }
        for (var i = 0; i < resultQueries.length; i++) {
            firstTime = true;
            for (var j = 0; j < resultQueries[i].length; j++) {
                rRecordLines[rlineIndex] = resultQueries[i][j];
                unformattedRRecordLines[rlineIndex] = unformattedQueries[i][j];
                if (firstTime && object.getCount) {
                    count += Number(rRecordLines[rlineIndex][rRecordLines[rlineIndex].length - 1]);
                    firstTime = false;
                }
                if (object.getCount) {
                    rRecordLines[rlineIndex] = rRecordLines[rlineIndex].slice(0, rRecordLines[rlineIndex].length - 1);
                }
                if (recordData.relationsInfo) {
                    var temp = rRecordLines[rlineIndex].splice(rRecordLines[rlineIndex].length - Object.keys(recordData.relationsInfo.fields).length,
                        resultQueries[i][j].length);
                    relationFieldsValues[rlineIndex] = {};
                    for (var t = 0; t < temp.length; t++) {
                        relationFieldsValues[rlineIndex][recordData.relationsInfo.fields[t]] = temp[t];
                    }
                }
                rlineIndex++;
            }
        }
        this.evaluateHidingRules(recordObject.record.columns, recordObject.record.positions, rRecordLines, object.separator, relationFieldsValues, unformattedRRecordLines);
        let filterRecordLine = function(nliIndex, lin) {
            nRecordLines[nliIndex] = [];
            _.forEach(rRecordLines[lin], function(item) {
                if (_.isEqual(item, 'NO SHOW') === false) {
                    nRecordLines[nliIndex].push(item);
                }
            });
            if (_.isEmpty(nRecordLines[nliIndex])) {
                delete nRecordLines[nliIndex];
            }
        };
        for (var line in rRecordLines) {
            if (rRecordLines[line].indexOf("LINE_BREAK") > -1) {
                var lastIndex = 0,
                    k = -1;
                while ((k = rRecordLines[line].indexOf("LINE_BREAK", k + 1)) != -1) {
                    var newLine = rRecordLines[line].slice(lastIndex, k);
                    var unformattedNewLine = unformattedRRecordLines[line].slice(lastIndex, k);
                    if (newLine.indexOf("HIDE") === -1) {
                        filterRecordLine(nlineIndex, newLine);
                        // nRecordLines[nlineIndex] = newLine;
                        unformattedNRecordLines[nlineIndex] = unformattedNewLine;
                        relationFieldsValues[nlineIndex] = relationFieldsValues[line];
                        nRecordLinesXPositions[nlineIndex] = [];
                        for (var index = lastIndex; index < k; index++) {
                            nRecordLinesXPositions[nlineIndex].push(recordObject.record.positions[index]);
                        }
                        nlineIndex++;
                    } else {
                        delete relationFieldsValues[line];
                    }

                    lastIndex = k + 1;
                }
                if (lastIndex < rRecordLines[line].length && rRecordLines[line].slice(lastIndex, rRecordLines[line].length).indexOf("HIDE") === -1) {
                    nRecordLinesXPositions[nlineIndex] = [];
                    for (var index = lastIndex; index < rRecordLines[line].length; index++) {
                        nRecordLinesXPositions[nlineIndex].push(recordObject.record.positions[index]);
                    }
                    nRecordLines[nlineIndex] = rRecordLines[line].slice(lastIndex, rRecordLines[line].length);
                    unformattedNRecordLines[nlineIndex] = unformattedRRecordLines[line].slice(lastIndex, unformattedRRecordLines[line].length);
                    nlineIndex++;
                }
            } else {
                if (rRecordLines[line].indexOf("HIDE") === -1) {
                    filterRecordLine(nlineIndex, line);
                    unformattedNRecordLines[nlineIndex] = unformattedRRecordLines[line];
                    nRecordLinesXPositions[nlineIndex] = [];
                    for (var index = 0; index < recordObject.record.positions.length; index++) {
                        if (isNaN(parseInt(recordObject.record.positions[index], 10))) {
                            nRecordLinesXPositions[nlineIndex].push(recordObject.record.positions[index]);
                            relationFieldsValues[nlineIndex] = relationFieldsValues[line];
                        } else {
                            nRecordLinesXPositions[nlineIndex].push(recordObject.record.positions[index] + "S" + recordObject.record.columns[recordObject.record
                                .positions[index]].raw.idStructure);
                        }
                    }
                    nlineIndex++;
                } else {
                    delete relationFieldsValues[line];
                }
            }
        }
        
        if (hasListRecord && object.recordList && object.recordList.length) {
            let tmpObject = this.proccessListRecord({
                rRecordLines: rRecordLines,
                unformattedRRecordLines: unformattedRRecordLines,
                nRecordLines: nRecordLines,
                unformattedNRecordLines: unformattedNRecordLines,
                nRecordLinesXPositions: nRecordLinesXPositions,
                relationFieldsValues: relationFieldsValues,
                recordList: object.recordList
            });
            rRecordLines = tmpObject.rRecordLines;
            unformattedRRecordLines = tmpObject.unformattedRRecordLines;
            nRecordLines = tmpObject.nRecordLines;
            unformattedNRecordLines = tmpObject.unformattedNRecordLines;
            nRecordLinesXPositions = tmpObject.nRecordLinesXPositions;
            relationFieldsValues = tmpObject.relationFieldsValues;
            count = count * object.recordList.length;
        }

        executeTime = new Date() - initTime;

        return {
            originalRecordLines: rRecordLines,
            originalUnformattedRecordLines: unformattedRRecordLines,
            newRecordLines: nRecordLines,
            newUnformattedRecordLines: unformattedNRecordLines,
            recordRawFile: this.generateRecordRawFile(nRecordLines, object.separator, block, record),
            newRecordLinesXPositions: nRecordLinesXPositions,
            relationFieldsValues: relationFieldsValues,
            count: count,
            structureReadTime: structureReadTime + "ms",
            mappingReadTime: mappingReadTime + "ms",
            executeTime: executeTime + "ms",
            totalTime: (new Date() - initTTime),
            hasListRecord: hasListRecord || false
        };
    } catch (e) {
        $.messageCodes.push({
            code: "DFG210014",
            type: "E",
            errorInfo: util.parseError(e)
        });
        $.trace.error(e);
        var logRegister = new logDFG();
        var register = logRegister.errorExecuteFile(object.id, util.parseError(e));
        return {
            structureReadTime: structureReadTime + "ms",
            mappingReadTime: mappingReadTime + "ms",
            executeTime: executeTime + "ms",
            totalTime: (new Date() - initTTime) + "ms"
        };
    }
};

this.proccessListRecord = function(object) {
    let props = ['rRecordLines', 'unformattedRRecordLines', 'nRecordLines', 'unformattedNRecordLines', 'nRecordLinesXPositions', 'relationFieldsValues'];
    let resp = {
        rRecordLines: {},
        unformattedRRecordLines: {},
        nRecordLines: {},
        unformattedNRecordLines: {},
        nRecordLinesXPositions: {},
        relationFieldsValues: {}
    };
    for (var i = 0; i < object.recordList.length; i++) {
        let record = object.recordList[i];
        _.forEach(props, function(prop) {
            _.forEach(object[prop], function(array) {
                let key = _.keys(resp[prop]).length;
                resp[prop][key] = [];
                _.forEach(array, function(item) {
                    if (item && item.match && item.match('LIST_RECORD') !== null) {
                        resp[prop][key].push(record);
                    } else {
                        resp[prop][key].push(item);
                    }
                });
            });
        });
    }
    return resp;
};

this.getField = function(column) {
    let response = {
        columnName: column.name
    };
    switch (column.type) {
        case 1:
        case 2:
        case 3:
        case 4:
            response.type = 'integer';
            break;
        case 5:
        case 6:
        case 7:
            response.type = 'decimal';
            response.size = 16;
            response.precision = 4;
            break;
        case 14:
        case 15:
            response.type = 'date';
            break;
        case 16:
            response.type = 'datetime';
            break;
        case 25:
        case 26:
        case 27:
            response.type = 'json';
            break;
        default:
            response.type = 'string';
            response.size = 500;
    }
    return response;
};

this.filterRecordLine = function() {
    
};

this.cleanRecordData = function(recordData) {
    var newPositions = [];
    var newColumns = {};
    for (var p = 0; p < recordData.positions.length; p++) {
        if (recordData.columns[recordData.positions[p]]) {
            newPositions.push(recordData.positions[p]);
            if (!newColumns[recordData.positions[p]]) {
                newColumns[recordData.positions[p]] = recordData.columns[recordData.positions[p]];
            }
        }
    }
    recordData.positions = newPositions;
    recordData.columns = newColumns;
    if (recordData.groups && recordData.groups.structures) {
        for (var s in recordData.groups.structures) {
            if (recordData.groups.structures.hasOwnProperty(s) && recordData.groups.structures[s].groups) {
                var groups = [];
                for (var g = 0; g < recordData.groups.structures[s].groups.length; g++) {
                    var group = recordData.groups.structures[s].groups[g];
                    var groupBy = [];
                    var totals = [];
                    for (var gb = 0; gb < group.groupBy.length; gb++) {
                        if (newColumns[group.groupBy[gb]]) {
                            groupBy.push(group.groupBy[gb]);
                        }
                    }
                    for (var t = 0; t < group.totals.length; t++) {
                        if (newColumns[group.totals[t]]) {
                            totals.push(group.totals[t]);
                        }
                    }
                    if (groupBy.length || totals.length) {
                        group.groupBy = groupBy;
                        group.totals = totals;
                        groups.push(group);
                    }
                }
                if (groups.length) {
                    recordData.groups.structures[s].groups = groups;
                } else {
                    delete recordData.groups.structures[s];
                }
            }
        }
    }
};
this.formCache = function(object) {
    try {
        //Se tiene que hacer la query, se tiene que crear la tabla cache e insertar
        var queryClause = {
            query: "SELECT "
        };
        var fields = [];
        var eefiFields = [];
        var hasCompanyField = object.queryInfo && object.queryInfo.eefiFilters && object.queryInfo.eefiFilters.empresa && object.queryInfo.eefiFilters.empresa[0];
        var layoutFilterFields = [];
        var hanaNameXType = {};
        var fromHex = function(hex, str) {
            try {
                str = decodeURIComponent(hex.replace(/(..)/g, '%$1'));
            } catch (e) {
                str = hex;
            }
            return str;
        };
        var fieldNames = [];
        if (!object.hasCompanyField) {
            object.queryInfo.fields.Company = {
                name: "company",
                hanaName: "\'" + object.eefi.idCompany + "\'",
                type: "NVARCHAR",
                dimension: 4,
                isExtraField: true
            };
        }
        for (var f in object.queryInfo.fields) {
            if (object.queryInfo.fields.hasOwnProperty(f)) {
                if (object.queryInfo.fields[f].type === "DATE" || object.queryInfo.fields[f].type === "TIMESTAMP") {
                    fields.push("TO_CHAR(to_timestamp(\"" + object.queryInfo.fields[f].hanaName + "\"), \'YYYYMMDD\') ");
                } else {
                    fields.push(object.queryInfo.fields[f].hanaName);
                }

                if (!object.queryInfo.fields[f].isExtraField) {
                    fieldNames.push('\'' + object.queryInfo.fields[f].hanaName + '\'');
                    hanaNameXType[object.queryInfo.fields[f].hanaName] = object.queryInfo.fields[f].type === "DATE" ? "TIMESTAMP" : object.queryInfo.fields[f].type;
                }
            }
        }

        object.queryInfo.fromClause = fromHex(object.queryInfo.fromClause);
        object.queryInfo.viewName = fromHex(object.queryInfo.viewName);
        var query = {};
        if (fieldNames.length) {
            query.query = "SELECT COLUMN_NAME, LENGTH, DATA_TYPE_NAME, SCALE FROM VIEW_COLUMNS WHERE SCHEMA_NAME='_SYS_BIC' AND VIEW_NAME=" + object
                .queryInfo.viewName.split('"_SYS_BIC".')[1].replace(new RegExp(/\"/g), "\'");
            query.query += " AND COLUMN_NAME IN (" + fieldNames.toString() + ")";
            var dimensions = sql.SELECT(query);
            for (var i = 0; i < dimensions.length; i++) {
                for (var f in object.queryInfo.fields) {
                    if (object.queryInfo.fields.hasOwnProperty(f)) {
                        if (object.queryInfo.fields[f].hanaName === dimensions[i][0]) {
                            object.queryInfo.fields[f].dimension = dimensions[i][1];
                            object.queryInfo.fields[f].type = hanaNameXType[object.queryInfo.fields[f].hanaName];
                            object.queryInfo.fields[f].precision = dimensions[i][3] || 2;
                            if (object.queryInfo.fields[f].type === "DATE" || object.queryInfo.fields[f].type === "TIMESTAMP") {
                                object.queryInfo.fields[f].format = "YYYYMMDD";
                            }
                            break;
                        }
                    }
                }
            }

            queryClause.query += fields.join(",") + ", COUNT(1) OVER()";
            var limit = 10000;
            var fromClause = " FROM " + object.queryInfo.fromClause;
            var viewPlaceholder = $.getViewPlaceholder(['IP_MANDANTE', 'IP_DATE_FROM', 'IP_LANGUAGE', 'IP_YEAR_FROM', 'IP_YEAR2_FROM']);
            var whereClause = "";
            var eefiWhere = [];
            fromClause += ' ' + viewPlaceholder;
            if (object.queryInfo.eefiFilters && object.eefi) {
                if (object.queryInfo.eefiFilters.empresa && object.queryInfo.eefiFilters.empresa[0] && object.eefi.idCompany) {
                    eefiWhere.push(object.queryInfo.eefiFilters.empresa[0] + "= " + object.eefi.idCompany + "");
                }
                if (object.queryInfo.eefiFilters.ufFilial && object.queryInfo.eefiFilters.ufFilial[0] && object.eefi.uf) {
                    var ufFilters = [];
                    for (var i = 0; i < object.eefi.uf.length; i++) {
                        ufFilters.push(object.queryInfo.eefiFilters.ufFilial[0] + "= \'" + object.eefi.uf[i] + "\'");
                    }
                    if (ufFilters.length) {
                        eefiWhere.push("(" + ufFilters.join(" OR ") + " )");
                    }
                }
                if (object.queryInfo.eefiFilters.filial && object.queryInfo.eefiFilters.filial[0] && object.eefi.idBranch) {
                    var filialFilters = [];
                    for (var i = 0; i < object.eefi.idBranch.length; i++) {
                        filialFilters.push(object.queryInfo.eefiFilters.filial[0] + "= \'" + object.eefi.idBranch[i] + "\'");
                    }
                    if (filialFilters.length) {
                        eefiWhere.push("(" + filialFilters.join(" OR ") + " )");
                    }
                }
                var date1, date2;
                if (object.queryInfo.eefiFilters && object.queryInfo.eefiFilters.hasOwnProperty("data")) {
                    for (let index2 = 0; index2 < object.queryInfo.eefiFilters.data.length; index2++) {
                        if (object.eefi.initSubPeriod) {
                            date1 = utilDFG.toJSONDate(new Date(object.eefi.initSubPeriod));
                            eefiWhere.push("to_date(" + object.queryInfo.eefiFilters.data[index2] + ")  >= '" + date1.year +
                                "-" +
                                date1.month + "-" + date1.day + "'");
                        }
                        if (object.eefi.endSubPeriod) {
                            date2 = utilDFG.toJSONDate(new Date(object.eefi.endSubPeriod));
                            eefiWhere.push("(to_date(" + object.queryInfo.eefiFilters.data[index2] + ") <= '" + date2.year +
                                "-" + date2
                                .month + "-" + date2.day + "' OR " + object.queryInfo.eefiFilters.data[index2] + " IS NULL) ");
                        }
                    }
                }
                if (object.queryInfo.eefiFilters && object.queryInfo.eefiFilters.structureKeys) {
                    for (var i = 0; i < object.queryInfo.eefiFilters.structureKeys.length; i++) {
                        eefiWhere.push(object.queryInfo.eefiFilters.structureKeys[i] + " IS NOT NULL");
                    }
                }
                if (object.queryInfo.eefiFilters && object.queryInfo.eefiFilters.hasOwnProperty("dataVigencia") && object.queryInfo.eefiFilters.dataVigencia
                    .length) {
                    if (object.eefi.initSubPeriod) {
                        date1 = utilDFG.toJSONDate(new Date(object.eefi.initSubPeriod));
                        eefiWhere.push("to_date(" + object.queryInfo.eefiFilters.dataVigencia[0] + ") <= '" + date1.year +
                            "-" +
                            date1.month + "-" + date1.day +
                            "'");
                    }
                    if (object.eefi.endSubPeriod) {
                        date2 = utilDFG.toJSONDate(new Date(object.eefi.endSubPeriod));
                        eefiWhere.push("(to_date(" + object.queryInfo.eefiFilters.dataVigencia[1] + ") >= '" + date2.year +
                            "-" +
                            date2.month + "-" + date2.day +
                            "' OR " + object.queryInfo.eefiFilters.dataVigencia[1] + " IS NULL )");
                    }
                }
            }
            if (eefiWhere.length) {
                whereClause += " WHERE " + eefiWhere.join(" AND ");
            }

            //Se aplican los filtros del layout
            var layoutWhere = [];
            if (object.queryInfo.layoutFilters && object.queryInfo.layoutFilters.length) {
                object.queryInfo.layoutFilters.map(function(f) {
                    if (layoutWhere.indexOf(f) === -1) {
                        layoutWhere.push(f.replace(new RegExp(/&gt;/g), '>').replace(new RegExp(/&lt;/g), '<'));
                    }
                });
                if (!eefiWhere.length && layoutWhere.length) {
                    whereClause += " WHERE (";
                } else if (eefiWhere.length && layoutWhere.length) {
                    whereClause += " AND (";
                }
                if (layoutWhere.length) {
                    whereClause += layoutWhere.join(" OR ");
                    whereClause += " )";
                }
            }
            queryClause.query += fromClause + whereClause + " LIMIT " + limit + " OFFSET 0";
            var tableData = sql.SELECT(queryClause);
            var totalLines = tableData[0] ? tableData[0][tableData[0].length - 1] : 0;
            var createdTable = this.createCacheTable({
                tableData: tableData,
                idStructure: object.idStructure,
                idLayoutVersion: object.idLayoutVersion,
                fields: object.queryInfo.fields
            });
            var pageCount = Math.ceil(parseInt(totalLines, 10) / limit);
            this.insertIntoCacheTable(tableData, createdTable.table, createdTable.fields, createdTable.table_fields_array, 0, true);
            queryClause.query = queryClause.query.split(", COUNT(1) OVER()").join(" ");
            for (var p = 1; p < pageCount; p++) {
                queryClause.query = queryClause.query.split("OFFSET")[0] + "OFFSET " + (p * limit);
                tableData = sql.SELECT(queryClause);
                this.insertIntoCacheTable(tableData, createdTable.table, createdTable.fields, createdTable.table_fields_array, p * limit);
            }
            return {
                tableName: createdTable.tableName,
                type: createdTable.type
            };
        }
        return {};
    } catch (e) {
        $.messageCodes.push({
            code: "DFG210014",
            type: "E",
            errorInfo: util.parseError(e)
        });
    }
};
this.deleteOldCache = function(object) {
    try {
        var executionTime = new Date();
        var execString = "" + executionTime.getFullYear();
        if (executionTime.getMonth() + 1 < 10) {
            execString += "0" + (executionTime.getMonth() + 1);
        } else {
            execString += (executionTime.getMonth() + 1);
        }
        if (executionTime.getDate() < 10) {
            execString += "0" + executionTime.getDate();
        } else {
            if (object && object.fromToday) {
                execString += (executionTime.getDate() + 1);
            } else {
                execString += (executionTime.getDate());
            }
        }
        var query = {
            query: ""
        };
        query.query += "SELECT STRING_AGG( CONCAT(CONCAT(CONCAT(CONCAT(CONCAT('drop sequence " + schema + ".\"', TABLE_NAME), '::ID\"'), ''),";
        query.query += "'@'), CONCAT(CONCAT(CONCAT('drop table " + schema + ".\"', TABLE_NAME), '\"'), '')),'@') FROM ";
        query.query +=
            "( SELECT DISTINCT TABLE_NAME FROM table_columns WHERE SCHEMA_NAME = '" + schema.substring(1, schema.length - 1) + "' AND TABLE_NAME LIKE_REGEXPR 'DFG::Cache_[0-9]+'";
        query.query += "HAVING SUBSTRING(TABLE_NAME,LENGTH(TABLE_NAME)-7,LENGTH(TABLE_NAME)) < \'" + execString + "\')";
        var queries = sql.SELECT(query);
        if (queries.length) {
            queries = queries[0][0];
            if (queries !== null) {
                queries = queries.split('@');
                for (var q = 0; q < queries.length; q++) {
                    try {
                        sql.EXECUTE({
                            query: queries[q]
                        });
                    } catch (e) {}
                }
            }
        }
        return 1;
    } catch (e) {
        return 0;
    }
};
this.createCacheTable = function(object) {
    var executionTime = new Date();
    var execString = "" + executionTime.getFullYear();
    if (executionTime.getMonth() + 1 < 10) {
        execString += "0" + (executionTime.getMonth() + 1);
    } else {
        execString += (executionTime.getMonth() + 1);
    }
    if (executionTime.getDate() < 10) {
        execString += "0" + executionTime.getDate();
    } else {
        execString += executionTime.getDate();
    }
    var tableName = schema + '."DFG::Cache_' + $.getUserID() + object.idStructure + object.idLayoutVersion + executionTime.getTime() + "_" +
        execString + '"'; //Unique name for table;
    var sequenceName = schema + '."DFG::Cache_' + $.getUserID() + object.idStructure + object.idLayoutVersion + executionTime.getTime() + "_" +
        execString + '::ID"';

    var options = {
        name: tableName,
        fields: {
            id: new tableLib.AutoField({
                name: 'ID',
                auto: sequenceName + '.nextval',
                type: $.db.types.INTEGER,
                pk: true
            })
        }
    };
    var type = {};
    var insertPositions = [];
    for (var f in object.fields) {
        if (object.fields.hasOwnProperty(f)) {
            type[f] = {
                type: object.fields[f].type,
                dimension: object.fields[f].dimension,
                precision: object.fields[f].precision
            };
            options.fields[f] = new tableLib.Field({
                name: "C_" + f,
                type: $.db.types[object.fields[f].type],
                dimension: object.fields[f].dimension,
                precision: object.fields[f].precision
            });
            insertPositions.push(f);
        }
    }
    insertPositions.push("id");
    var table = new tableLib.Table(options);
    var create = table.CREATE_STATEMENT();
    var table_fields_array = Object.keys(table.fields);
    sql.EXECUTE({
        query: create
    });
    sql.EXECUTE({
        query: "CREATE SEQUENCE " + sequenceName
    });
    var fields = [];
    for (var i = 0; i < insertPositions.length; i++) {
        fields.push(table.fields[insertPositions[i]]);
    }
    return {
        tableName: tableName,
        table_fields_array: table_fields_array,
        table: table,
        fields: fields,
        type: type
    };
};
this.insertIntoCacheTable = function(tableData, table, fields, table_fields_array, id, hasCount) {

    if ((tableData && tableData.length > 0) && table) {
        for (var i = 0; i < tableData.length; i++) {
            if (hasCount) {
                tableData[i].splice(tableData[i].length - 1, 1);
            }
            if (tableData[i].concat) {
                tableData[i] = tableData[i].concat([id + 1]);
                id++;
            }
            for (var column = 0; column < tableData[i].length; column++) {
                if (Array.isArray(tableData[i][column])) {
                    tableData[i][column] = JSON.stringify(tableData[i][column]);
                }
                if (table.fields[table_fields_array[column]].type === $.db.types.INTEGER) {
                    tableData[i][column] = parseInt(tableData[i][column], 10);
                }
                if (table.fields[table_fields_array[column]].type === $.db.types.DECIMAL) {
                    tableData[i][column] = parseFloat(tableData[i][column]);
                }
                // if (table.fields[table_fields_array[column]].type === $.db.types.TIMESTAMP  ||table.fields[table_fields_array[column]].type === $.db.types.DATE ) {
                //     if(new Date(tableData[i][column]) !== "Invalid Date"){
                //         tableData[i][column] = new Date(tableData[i][column]);
                //     }
                // }
            }
        }

        sql.BATCH_INSERT({
            table: table.name,
            fields: fields,
            values: tableData
        });
    }
};
this.deleteCacheTable = function(object) {
    for (var i in object.caches) {
        if (object.caches[i].tableName) {
            var tableName = object.caches[i].tableName;
            sql.EXECUTE({
                query: "DROP TABLE " + tableName
            });
            sql.EXECUTE({
                query: 'DROP SEQUENCE ' + tableName.substring(0, tableName.length - 1) + "::ID" + "\""
            });
        }
    }
    var logRegister = new logDFG();
    logRegister.executeFile({
        id: object.id
    });
    return 1;
};
this.evaluateHidingRules = function(columns, columnPositions, rRecordLines, separator, relationValues, unformattedRRecordLines) {
    var recordLines = {};
    var lineIndex = 0;
    var columnPositions2 = JSON.parse(JSON.stringify(columnPositions));

    for (var r in rRecordLines) {
        var valuesHidden = 0;
        var hideAllLine = false;
        var numericColumns = 0;
        for (var c = 0; c < columnPositions2.length; c++) {
            if (columns[columnPositions2[c]]) {
                if (columns[columnPositions2[c]].getColumnType() === "number") {
                    numericColumns++;
                }
                if (columns[columnPositions2[c]].raw.hidingRule && (columns[columnPositions2[c]].raw.hidingRule.hide || columns[columnPositions2[c]].raw
                        .hidingRule.hideValue || columns[columnPositions2[c]].raw.hidingRule.hideAllLine || columns[columnPositions2[c]].raw.hidingRule.hideField)) {
                    hideAllLine = columns[columnPositions2[c]].raw.hidingRule.hideAllLine;
                    if (rRecordLines[r][c] && rRecordLines[r][c] !== null && (rRecordLines[r][c].indexOf && rRecordLines[r][c].indexOf(String.fromCharCode(
                            8205)) !== -1)) {
                        var values = rRecordLines[r][c].split(separator.value + String.fromCharCode(8205));
                        var allZeros = true;
                        var validValues = [];
                        var unformattedValues = unformattedRRecordLines[r][c].split(separator.value + String.fromCharCode(8205));
                        var unformattedValidValues = [];
                        for (var v = 0; v < values.length; v++) {
                            if (parseInt(values[v], 10) !== 0) {
                                allZeros = false;
                                validValues.push(values[v]);
                                unformattedValidValues.push(unformattedValues[v]);
                            } else {
                                validValues.push("");
                                unformattedValidValues.push("");
                            }
                        }
                        if (allZeros) {
                            if (hideAllLine) {
                                // rRecordLines[r].splice(c, 1);
                                //  columnPositions2.splice(c, 1);
                                //  c--;
                                if (columns[columnPositions2[c]].getColumnType() === "number") {
                                    valuesHidden++;
                                }
                            } else {
                                rRecordLines[r][c] = "";
                                unformattedRRecordLines[r][c] = "";
                                // Evaluate if the keep separator is not marked to remove the value
                                if (!columns[columnPositions2[c]].raw.hidingRule.keepSeparator) {
                                    if (columns[columnPositions2[c]].raw.hidingRule.hideValue) {
                                        rRecordLines[r][c] = "HIDE";
                                        unformattedRRecordLines[r][c] = "HIDE";
                                    } else if (columns[columnPositions2[c]].raw.hidingRule.hideField) {
                                        rRecordLines[r][c] = 'NO SHOW';
                                        unformattedRRecordLines[r][c] = 'NO SHOW';
                                    }
                                }
                            }
                        } else {
                            rRecordLines[r][c] = validValues.join(separator.value);
                            unformattedRRecordLines[r][c] = unformattedValidValues.join(separator.values);
                        }
                    } else {
                        if (rRecordLines[r][c] === undefined || rRecordLines[r][c] === null || rRecordLines[r][c] === "" || parseInt(rRecordLines[r][c], 10) === 0) {
                            if (hideAllLine) {
                                // rRecordLines[r].splice(c, 1);
                                //  columnPositions2.splice(c, 1);
                                //  c--;
                                if (columns[columnPositions2[c]].getColumnType() === "number") {
                                    valuesHidden++;
                                }
                            } else {
                                rRecordLines[r][c] = "";
                                unformattedRRecordLines[r][c] = "";
                                // Evaluate if the keep separator is not marked to remove the value
                                if (!columns[columnPositions2[c]].raw.hidingRule.keepSeparator) {
                                    if (columns[columnPositions2[c]].raw.hidingRule.hideValue) {
                                        rRecordLines[r][c] = "HIDE";
                                        unformattedRRecordLines[r][c] = "HIDE";
                                    } else if (columns[columnPositions2[c]].raw.hidingRule.hideField) {
                                        rRecordLines[r][c] = 'NO SHOW';
                                        unformattedRRecordLines[r][c] = 'NO SHOW';
                                    }
                                }
                            }
                        }
                    }
                    if (columns[columnPositions2[c]].raw.hidingRule.hideValue) {
                        // Evaluate if the keep separator is not marked to remove the value
                        if (!columns[columnPositions2[c]].raw.hidingRule.keepSeparator) {
                            rRecordLines[r].splice(c, 1);
                            unformattedRRecordLines[r].splice(c, 1);
                            columnPositions2.splice(c, 1);
                            c--;
                        }
                    }
                } else if (columns[columnPositions2[c]].raw.hidingRule && columns[columnPositions2[c]].raw.hidingRule.size && columns[columnPositions2[c]].raw.hidingRule.character) {
                    if (rRecordLines[r][c] === undefined || rRecordLines[r][c] === null || rRecordLines[r][c] === "" || parseInt(rRecordLines[r][c], 10) === 0) {
                        var newVal = "";
                        var size = parseInt(columns[columnPositions2[c]].raw.hidingRule.size, 10);
                        var character = columns[columnPositions2[c]].raw.hidingRule.character;
                        for (var s = 0; s < size; s++) {
                            newVal += character;
                        }
                        rRecordLines[r][c] = newVal;
                        unformattedRRecordLines[r][c] = newVal;
                    }
                }
            }
        }
        if (hideAllLine && numericColumns !== 0 && valuesHidden === numericColumns) {
            delete rRecordLines[r];
            delete unformattedRRecordLines[r];
        }
        columnPositions2 = JSON.parse(JSON.stringify(columnPositions));
    }
};
this.generateRecordRawFile = function(recordLines, separator, block, record) {
    var rawFile = "";
    if (separator.value.indexOf(String.fromCharCode(8204)) === -1) {
        separator.value += String.fromCharCode(8204);
    }
    var recordTotal = Object.keys(recordLines).length;
    if (Object.keys(recordLines).length !== 0) {
        for (var l in recordLines) {
            if (separator.inFirst) {
                rawFile += separator.value;
            }
            rawFile += recordLines[l].join(separator.value);
            if (separator.inLast) {
                rawFile += separator.value;
            }
            rawFile += "&&::" + block + "&:" + record + "\r\n";
        }
    }

    let breakRegex = new RegExp("LINE_BREAK", "g");
    rawFile = rawFile.replace(breakRegex, "\r\n");
    return rawFile;
};

var setFieldIds = function(fields, object) {
    for (var i in object) {
        if (object[i] && object[i].field) {
            if (i !== 'subPeriod') {
                for (var j in fields) {
                    if (object[i].field === fields[j].hanaName) {
                        object[i].fieldId = j;
                        object[i].type = fields[j].type;
                        object[i].hanaName = object[i].field;
                        break;
                    }
                }
            } else {
                object[i].fieldId = [];
                object[i].subPeriodType = object[i].type;
                object[i].type = [];
                object[i].hanaName = [];
                for (var k = 0; k < object[i].field.length; k++) {
                    for (var j in fields) {
                        if (object[i].field[k] === fields[j].hanaName) {
                            object[i].fieldId.push(j);
                            object[i].type.push(fields[j].type);
                            object[i].hanaName.push(object[i].field[k]);
                            break;
                        }
                    }
                }
            }
        }
    }
};
var getBRBParameters = function(object) {
    var BRBParameters = [];
    var i, parameter;
    for (i in object) {
        if (object[i] && object[i].fieldId) {
            if (i !== "subPeriod") {
                parameter = {
                    fieldId: object[i].fieldId,
                    type: object[i].type,
                    hanaName: object[i].hanaName,
                    conditions: []
                };
                if (Array.isArray(object[i].value)) {
                    for (var j = 0; j < object[i].value.length; j++) {
                        if (j == 0) {
                            parameter.conditions.push({
                                logicOperator: null,
                                operator: '=',
                                value: object[i].value[j]
                            });
                        } else {
                            parameter.conditions.push({
                                logicOperator: "OR",
                                operator: '=',
                                value: object[i].value[j]
                            });
                        }
                    }
                } else {
                    parameter.conditions.push({
                        logicOperator: null,
                        operator: '=',
                        value: object[i].value
                    });
                }
                BRBParameters.push(parameter);
            } else {
                var date1;
                if (object[i].subPeriodType === 0) {
                    parameter = {
                        fieldId: object[i].fieldId[0],
                        type: object[i].type[0],
                        hanaName: object[i].hanaName[0],
                        conditions: []
                    };
                    if (object[i].initSubPeriod) {
                        date1 = utilDFG.toJSONDate(new Date(object[i].initSubPeriod));
                        parameter.conditions.push({
                            logicOperator: null,
                            operator: '>=',
                            value: "" + date1.year + date1.month + date1.day
                        });
                    }
                    if (object[i].endSubPeriod) {
                        date1 = utilDFG.toJSONDate(new Date(object[i].endSubPeriod));
                        parameter.conditions.push({
                            logicOperator: "AND",
                            operator: '<=',
                            value: "" + date1.year + date1.month + date1.day
                        });
                    }
                    BRBParameters.push(parameter);
                } else {
                    if (object[i].initSubPeriod) {
                        parameter = {
                            fieldId: object[i].fieldId[0],
                            type: object[i].type[0],
                            hanaName: object[i].hanaName[0],
                            conditions: []
                        };
                        date1 = utilDFG.toJSONDate(new Date(object[i].initSubPeriod));
                        parameter.conditions.push({
                            logicOperator: null,
                            operator: '>=',
                            value: "" + date1.year + date1.month + date1.day
                        });
                        BRBParameters.push(parameter);
                    }
                    if (object[i].endSubPeriod) {
                        parameter = {
                            fieldId: object[i].fieldId[1],
                            type: object[i].type[1],
                            hanaName: object[i].hanaName[1],
                            conditions: []
                        };
                        date1 = utilDFG.toJSONDate(new Date(object[i].endSubPeriod));
                        parameter.conditions.push({
                            logicOperator: null,
                            operator: '<=',
                            value: "" + date1.year + date1.month + date1.day
                        });
                        BRBParameters.push(parameter);
                    }
                }
            }
        }
    }
    return BRBParameters;
};
this.getMapConfig = function(eefi, structureData) {
    var mapping = controllerExternal.getStructureFieldMapping({
        idStructure: Object.keys(structureData),
        idTax: eefi.idTax,
        startDate: eefi.initSubPeriod,
        endDate: eefi.endSubPeriod
    });

    if (mapping.length) {
        return mapping;
    }
    return [];
};
this.getEEFIConditionsMultipleStructure = function(eefi, structureData, structureMapCache, structureIds) {
    var where = {};
    var BRBParameters = {};
    var mapConfigFields = {};
    var mapConfig = structureMapCache ? undefined : this.getMapConfig(eefi, structureData);
    var eefiKeys = [];
    if (typeof eefi.uf === "object") {
        for (let index3 = 0; index3 < eefi.uf.length; index3++) {
            var newEefiKey = eefi.idCompany + ";" + eefi.uf[index3] + ";";
            if (typeof eefi.idBranch === "object") {
                for (let index2 = 0; index2 < eefi.idBranch.length; index2++) {
                    eefiKeys.push(newEefiKey + eefi.idBranch[index2]);
                }
            } else {
                eefiKeys.push(newEefiKey + eefi.idBranch);
            }
        }
    } else {
        var newEefiKey = eefi.idCompany + ";" + eefi.uf + ";";
        if (typeof eefi.idBranch === "object") {
            for (let index2 = 0; index2 < eefi.idBranch.length; index2++) {
                eefiKeys.push(newEefiKey + eefi.idBranch[index2]);
            }
        } else {
            eefiKeys.push(newEefiKey + eefi.idBranch);
        }
    }
    if (mapConfig) {
        for (var index = 0; index < mapConfig.length; index++) {
            let objBRBP = {};
            mapConfigFields[mapConfig[index].structureId] = {
                company: mapConfig[index].mapping.empresa[0],
                uf: mapConfig[index].mapping.ufFilial[0],
                filial: mapConfig[index].mapping.filial[0]
            };
            for (var keys = 0; keys < eefiKeys.length; keys++) {
                var k = eefiKeys[keys];
                where[mapConfig[index].structureId + "S" + k] = [];
                for (var field in structureData[mapConfig[index].structureId].fields) {
                    if (structureData[mapConfig[index].structureId].fields[field].isKey) {
                        where[mapConfig[index].structureId + "S" + k].push(structureData[mapConfig[index].structureId].fields[field].hanaName +
                            " IS NOT NULL ");
                    }
                }
                if (mapConfig[index].mapping && mapConfig[index].mapping.hasOwnProperty("empresa")) {
                    if (typeof mapConfig[index].mapping.empresa === "object") {
                        objBRBP.company = {
                            field: mapConfig[index].mapping.empresa.length ? mapConfig[index].mapping.empresa[0] : undefined,
                            value: eefi.idCompany
                        };
                        for (let index2 = 0; index2 < mapConfig[index].mapping.empresa.length; index2++) {
                            where[mapConfig[index].structureId + "S" + k].push(mapConfig[index].mapping.empresa[index2] + " = '" + k.split(";")[0] + "'");
                        }
                    } else {
                        if (typeof mapConfig[index].mapping.empresa === "string" && mapConfig[index].mapping.empresa !== "") {
                            objBRBP.company = {
                                field: mapConfig[index].mapping.empresa,
                                value: eefi.idCompany
                            };
                            where[mapConfig[index].structureId + "S" + k].push(mapConfig[index].mapping.empresa + " = '" + k.split(";")[0] + "'");
                        }
                    }
                }
                if (mapConfig[index].mapping && mapConfig[index].mapping.hasOwnProperty("ufFilial")) {
                    if (typeof mapConfig[index].mapping.ufFilial === "object") {
                        objBRBP.uf = {
                            field: mapConfig[index].mapping.ufFilial.length ? mapConfig[index].mapping.ufFilial[0] : undefined,
                            value: eefi.uf
                        };
                        for (let index2 = 0; index2 < mapConfig[index].mapping.ufFilial.length; index2++) {
                            where[mapConfig[index].structureId + "S" + k].push(mapConfig[index].mapping.ufFilial[index2] + " = '" + k.split(";")[1] + "'");
                        }
                    } else {
                        if (typeof mapConfig[index].mapping.ufFilial === "string" && mapConfig[index].mapping.ufFilial !== "") {
                            objBRBP.uf = {
                                field: mapConfig[index].mapping.ufFilial,
                                value: eefi.uf
                            };
                            where[mapConfig[index].structureId + "S" + k].push(mapConfig[index].mapping.ufFilial + " = '" + k.split(";")[1] + "'");
                        }
                    }
                }
                if (mapConfig[index].mapping && mapConfig[index].mapping.hasOwnProperty("filial")) {
                    if (typeof mapConfig[index].mapping.filial === "object") {
                        objBRBP.branch = {
                            field: mapConfig[index].mapping.filial.length ? mapConfig[index].mapping.filial[0] : undefined,
                            value: eefi.idBranch
                        };
                        var whereBranch = [];
                        for (let index2 = 0; index2 < mapConfig[index].mapping.filial.length; index2++) {
                            where[mapConfig[index].structureId + "S" + k].push(mapConfig[index].mapping.filial[index2] + " = '" + k.split(";")[2] + "'");
                        }
                    } else {
                        if (typeof mapConfig[index].mapping.filial === "string" && mapConfig[index].mapping.filial !== "") {
                            objBRBP.branch = {
                                field: mapConfig[index].mapping.filial,
                                value: eefi.idBranch
                            };
                            where[mapConfig[index].structureId + "S" + k].push(mapConfig[index].mapping.filial + " = '" + k.split(";")[2] + "'");
                        }
                    }
                }
                var date1, date2;
                if (mapConfig[index].mapping.data.length > 0 && mapConfig[index].mapping.dataVigencia.length > 0) {
                    mapConfig[index].mapping.dataVigencia.splice(0, 0, mapConfig[index].mapping.data[0]);
                    mapConfig[index].mapping.data.splice(0, 1);
                }
                objBRBP.subPeriod = {
                    field: mapConfig[index].mapping.data.length > 0 ? mapConfig[index].mapping.data : mapConfig[index].mapping.dataVigencia,
                    type: mapConfig[index].mapping.data.length > 0 ? 0 : 1,
                    initSubPeriod: eefi.initSubPeriod,
                    endSubPeriod: eefi.endSubPeriod
                };
                if (mapConfig[index].mapping && mapConfig[index].mapping.hasOwnProperty("data")) {
                    for (let index2 = 0; index2 < mapConfig[index].mapping.data.length; index2++) {
                        if (eefi.initSubPeriod) {
                            date1 = utilDFG.toJSONDate(new Date(eefi.initSubPeriod));
                            where[mapConfig[index].structureId + "S" + k].push("to_date(" + mapConfig[index].mapping.data[index2] + ")  >= '" + date1.year +
                                "-" +
                                date1.month + "-" + date1.day + "'");
                        }
                        if (eefi.endSubPeriod) {
                            date2 = utilDFG.toJSONDate(new Date(eefi.endSubPeriod));
                            where[mapConfig[index].structureId + "S" + k].push("(to_date(" + mapConfig[index].mapping.data[index2] + ") <= '" + date2.year +
                                "-" + date2
                                .month + "-" + date2.day + "' OR " + mapConfig[index].mapping.data[index2] + " IS NULL) ");
                        }
                    }
                }
                if (mapConfig[index].mapping && mapConfig[index].mapping.hasOwnProperty("dataVigencia") && mapConfig[index].mapping.dataVigencia.length) {
                    if (eefi.initSubPeriod) {
                        date1 = utilDFG.toJSONDate(new Date(eefi.initSubPeriod));
                        where[mapConfig[index].structureId + "S" + k].push("to_date(" + mapConfig[index].mapping.dataVigencia[0] + ") <= '" + date1.year +
                            "-" +
                            date1.month + "-" + date1.day +
                            "'");
                    }
                    if (eefi.endSubPeriod) {
                        date2 = utilDFG.toJSONDate(new Date(eefi.endSubPeriod));
                        where[mapConfig[index].structureId + "S" + k].push("(to_date(" + mapConfig[index].mapping.dataVigencia[1] + ") >= '" + date2.year +
                            "-" +
                            date2.month + "-" + date2.day +
                            "' OR " + mapConfig[index].mapping.dataVigencia[1] + " IS NULL )");
                    }
                }
            }
            setFieldIds(structureData[mapConfig[index].structureId].fields, objBRBP);
            BRBParameters[mapConfig[index].structureId] = getBRBParameters(objBRBP);
        }
    } else {
        if (structureIds) {
            for (var index = 0; index < structureIds.length; index++) {
                let objBRBP = {};
                if (structureMapCache[structureIds[index]] && structureMapCache[structureIds[index]].tableName) {
                    mapConfigFields[structureIds[index]] = {
                        company: structureMapCache[structureIds[index]].mapConfigFields.idCompany ? "C_" + structureMapCache[structureIds[index]].mapConfigFields
                            .idCompany
                            .id : undefined,
                        uf: structureMapCache[structureIds[index]].mapConfigFields.uf ? "C_" + structureMapCache[structureIds[index]].mapConfigFields.uf.id : undefined,
                        filial: structureMapCache[structureIds[index]].mapConfigFields.idBranch ? "C_" + structureMapCache[structureIds[index]].mapConfigFields
                            .idBranch
                            .id : undefined
                    };
                    for (var keys = 0; keys < eefiKeys.length; keys++) {
                        var k = eefiKeys[keys];
                        where[structureIds[index] + "S" + k] = [];
                        if (structureMapCache[structureIds[index]].mapConfigFields.idCompany) {
                            objBRBP.company = {
                                field: structureMapCache[structureIds[index]].mapConfigFields.idCompany ? structureMapCache[structureIds[index]].mapConfigFields.idCompany
                                    .hanaName : undefined,
                                value: eefi.idCompany
                            };
                            where[structureIds[index] + "S" + k].push("C_" + structureMapCache[structureIds[index]].mapConfigFields.idCompany.id + " = '" + k.split(
                                ";")[0] + "'");
                        }
                        if (structureMapCache[structureIds[index]].mapConfigFields.uf) {
                            objBRBP.company = {
                                field: structureMapCache[structureIds[index]].mapConfigFields.uf ? structureMapCache[structureIds[index]].mapConfigFields.uf.hanaName : undefined,
                                value: eefi.uf
                            };
                            where[structureIds[index] + "S" + k].push("C_" + structureMapCache[structureIds[index]].mapConfigFields.uf.id + " = '" + k.split(";")[
                                1] + "'");
                        }
                        if (structureMapCache[structureIds[index]].mapConfigFields.idBranch) {
                            objBRBP.company = {
                                field: structureMapCache[structureIds[index]].mapConfigFields.idBranch ? structureMapCache[structureIds[index]].mapConfigFields.idBranch
                                    .hanaName : undefined,
                                value: eefi.idBranch
                            };
                            where[structureIds[index] + "S" + k].push("C_" + structureMapCache[structureIds[index]].mapConfigFields.idBranch.id + " = '" + k.split(
                                ";")[2] + "'");
                        }
                        objBRBP.subPeriod = {
                            field: structureMapCache[structureIds[index]].mapConfigFields.data2 ? [structureMapCache[structureIds[index]].mapConfigFields.data1,
                                structureMapCache[structureIds[index]].mapConfigFields.data2
                            ] : [structureMapCache[structureIds[index]].mapConfigFields.data2],
                            type: structureMapCache[structureIds[index]].mapConfigFields.data2 ? 1 : 0,
                            initSubPeriod: eefi.initSubPeriod,
                            endSubPeriod: eefi.endSubPeriod
                        };
                    }
                }
            }
        }
    }
    return {
        where: where,
        mapConfigFields: mapConfigFields,
        BRBParameters: BRBParameters,
        eefiKeys: eefiKeys
    };
};
this.evaluateBusinessRules = function(object) {
    try {
        var businessRules = object.businessRules;
        rules = breApi.rules;
        var rulesData = [],
            allRules = [],
            allRulesParams = [],
            rule_cache = [];
        var i;
        var currentData = {};
        for (i in businessRules) {
            for (var f in businessRules[i]) {
                if (!rulesData[businessRules[i][f].idRule]) {
                    rulesData[businessRules[i][f].idRule] = {
                        positions: []
                    };
                    if (!rule_cache[businessRules[i][f].idRule]) {
                        rule_cache[businessRules[i][f].idRule] = rules.getRule(Number(businessRules[i][f].idRule));
                    }
                    allRules[businessRules[i][f].idRule] = rule_cache[businessRules[i][f].idRule];
                    allRulesParams[businessRules[i][f].idRule] = allRules[businessRules[i][f].idRule].getParameters();
                }
                rulesData[businessRules[i][f].idRule].positions.push(businessRules[i][f].position);
            }
        }
        var block, record, column, idStructure;
        var actualBlock, actualRecord, actualColumn;
        var valuesXLines = {};
        for (var br in businessRules) {
            actualBlock = br.split("_")[0];
            actualRecord = br.split("_")[1];
            for (var field in businessRules[br]) {
                valuesXLines = {};
                for (var param in allRulesParams[businessRules[br][field].idRule]) {
                    if (allRulesParams[businessRules[br][field].idRule].hasOwnProperty(param)) {
                        idStructure = param.match(/s[0-9]+/g);
                        block = param.match(/B[0-9]+/g);
                        record = param.match(/R[0-9]+/g);
                        column = param.split("C").slice(1).join("C");
                        if (block) {
                            block = block[0].split("B")[1];
                        }
                        if (record) {
                            record = record[0].split("R")[1];
                        }
                        if (idStructure) {
                            idStructure = idStructure[0].split("s")[1];
                        }
                        if (block === actualBlock && record === actualRecord) {
                            if (object.blockRecordLines[block + ";" + record]) {
                                for (var l in object.blockRecordLines[block + ";" + record].lineXPositions) {
                                    if (!valuesXLines[l]) {
                                        valuesXLines[l] = {};
                                        var index = object.blockRecordLines[block + ";" + record].lineXPositions[l].indexOf(column + "S" + idStructure);
                                        if (index > -1) {
                                            valuesXLines[l][param] = object.blockRecordLines[block + ";" + record].lines[l][index];
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                for (var l in valuesXLines) {
                    var index = object.blockRecordLines[actualBlock + ";" + actualRecord].lineXPositions[l].indexOf(field);
                    if (index > -1) {
                        var message = allRules[businessRules[br][field].idRule].validate(valuesXLines[l]).messages.toString();
                        if (object.blockRecordLines[actualBlock + ";" + actualRecord].lines[l][index].match(/\*FXF[0-9]+\*/g) !== null) {
                            object.blockRecordLines[actualBlock + ";" + actualRecord].lines[l][index] = "";
                        }
                        object.blockRecordLines[actualBlock + ";" + actualRecord].lines[l][index] = message || object.blockRecordLines[actualBlock + ";" +
                            actualRecord].lines[l][index];
                    }
                }
            }
        }
        return object;
    } catch (e) {
        $.messageCodes.push({
            "code": "DFG210023",
            "type": 'E'
        });
    }
};
this.getMandt = function() {
    return {
        mandt: coreApi.getSystemConfiguration({
            componentName: "CORE",
            keys: ["ECC::CLIENT"]
        })[0].value
    };
};
//--------------------------------------------------------------------