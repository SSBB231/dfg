$.import("timp.core.server.api", "api");
var core_api = $.timp.core.server.api.api;
var util = core_api.util;
var file = core_api.file;
var fileShare = core_api.fileShareController;
var fileCRUDF = core_api.fileCRUDFController;
var fileExplorer = core_api.fileExplorerController;
var usersModel = core_api.users;

$.import("timp.atr.server.api", "api");
var atr_api = $.timp.atr.server.api.api;
var modelStructure = atr_api.structure.table;
var controllerStructure = atr_api.structureController;

$.import('timp.bre.server.api', 'api');
var bre_api = $.timp.bre.server.api.api;
var rules = bre_api.rulesController;

//Controller
$.import('timp.dfg.server.controllers', 'setting');
var setting = $.timp.dfg.server.controllers.setting;
$.import('timp.dfg.server.controllers', 'layout');
var layout = $.timp.dfg.server.controllers.layout;
$.import('timp.dfg.server.controllers', 'digitalFileType');
var controllerDigitalFileType = $.timp.dfg.server.controllers.digitalFileType;

//Model
$.import('timp.dfg.server.models', 'digitalFile');
var modelDigitalFile = $.timp.dfg.server.models.digitalFile.table;
$.import('timp.dfg.server.models', 'digitalFileAN4');
var modelDigitalFileAn4 = $.timp.dfg.server.models.digitalFileAN4.table;
$.import('timp.dfg.server.models', 'digitalFileAN4Eefi');
var modelDigitalFileAn4eefi = $.timp.dfg.server.models.digitalFileAN4Eefi.table;
$.import('timp.dfg.server.models', 'digitalFileAN4Favorite');
var modelDigitalFileAn4Favorite = $.timp.dfg.server.models.digitalFileAN4Favorite.table;

$.import('timp.dfg.server.controllers', 'external');
var controllerExternal = $.timp.dfg.server.controllers.external;



var DFG = {};
this.status = {
    ACTIVE: 100,
    EMITTED: 200,
    OFFICIAL: 300,
    SENT: 400,
    LOCKED: 500
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
    object = object || $.request.parameters.get("object");
    if (typeof object === "string") {
        object = JSON.parse(object);
    }
    try {
        var options = {};
        var optionsEefi = {};
        if (object.hasOwnProperty('uf')) {
            optionsEefi.where.push({
                field: 'uf',
                oper: '=',
                value: object.uf
            });
        }
        if (object.hasOwnProperty('idBranch')) {
            optionsEefi.where.push({
                field: 'idBranch',
                oper: '=',
                value: object.idBranch
            });
        }
        if (object.hasOwnProperty('idCompany')) {
            optionsEefi.where.push({
                field: 'idCompany',
                oper: '=',
                value: object.idCompany
            });
        }
        if (object.hasOwnProperty('idTax')) {
            optionsEefi.where.push({
                field: 'idTax',
                oper: '=',
                value: object.idTax
            });
        }
        if (optionsEefi.hasOwnProperty('where')) {
            optionsEefi.group_by = ['idAN4'];
            var eefi = modelDigitalFileAn4eefi.READ(optionsEefi);
            var ids = [];
            for (var i = 0; i < eefi.length; i++) {
                ids.push(eefi[i].idAN4);
            }
            options.where.push({
                field: 'id',
                oper: '=',
                value: ids
            });
        }
        // AN4 Table Read
        if (object.hasOwnProperty('idRule')) {
            options.where.push({
                field: 'idRule',
                oper: '=',
                value: object.idRule
            });
        }
        options.join = [{
            alias: 'eefi',
            table: modelDigitalFileAn4eefi,
            on: [{
                left: 'id',
                right: 'idAN4'
            }],
            outer: 'left'
        },{
            alias: 'LeftFile',
            table: file.table,
            on: [{
                left: 'idLeftFile',
                right: 'id'
            }],
            outer: 'left'
        },{
            alias: 'RightFile',
            table: file.table,
            rename: 'RigthFile',
            on: [{
                left: 'idRightFile',
                right: 'id'
            }],
            outer: 'left'
        }];
        var response = {};
        response.list = modelDigitalFileAn4.READ(options);
        response.filterOptions = this.filters();
        response.counter =  {};
        
        //FILES
        if (response.list) {
        for (var l = 0; l < response.list.length; l++) {
            var idFile = fileCRUDF.list({
                idObject: response.list[l].id,
                objectType: "DFG::AN4"
            });
            var sharedFile = fileShare.listFileShare({
                objectType: "DFG::AN4"
            });

            if (idFile.length > 0) {
                response.list[l].idFile = idFile[0].id;
                if (sharedFile.length > 0) {
                    if (response.list[l].idFile == sharedFile[0].idFile) {
                        response.list[l].shared = 'Shared';
                    } else {
                        response.list[l].shared = idFile[0].status;
                    }
                } else {
                    response.list[l].shared = idFile[0].status;
                }
            }
            response.list[l].is = {
                favorite: false,
                deleted: false
            };
            delete response.list[l].digitalFileTypeText;
            delete response.list[l].layoutXStructure;
        }
    }
    for (var currentList = 0; currentList < response.list.length; currentList++) {
        var creationUser = usersModel.READ({
            fields: ['id', 'name', 'last_name'],
            where: [{
                field: 'id',
                oper: '=',
                value: response.list[currentList].creationUser
            }]
        })[0];
        if (creationUser) {
            response.list[currentList].creationUser = creationUser.name + ' ' + creationUser.last_name;
        }
        var modificationUser = usersModel.READ({
            fields: ['id', 'name', 'last_name'],
            where: [{
                field: 'id',
                oper: '=',
                value: response.list[currentList].modificationUser
            }]
        })[0];
        if (modificationUser) {
            response.list[currentList].modificationUser = modificationUser.name + ' ' + modificationUser.last_name;
        }
        response.list[currentList].ownerId = creationUser.id;
    }
    var _list = [];
    var favorites = fileCRUDF.listFavoriteFile({
        objectType: "DFG::AN4"
    });

    var favoritesIds = [];
    for (var _i = 0; _i < favorites.length; _i++) {
        favoritesIds.push(favorites[_i].idFile);
    }
    var shares = fileShare.listShareFilesCreationUser({
        objectType: "DFG::AN4"
    });
    var sharedIds = [];
    for (var _i = 0; _i < shares.length; _i++) {
        sharedIds.push(shares[_i].idFile);
    }

    if (object.hasOwnProperty("ids")) {
        for (var _i = 0; _i < object.ids.length; _i++) {
            for (var _items = 0; _items < response.list.length; _items++) {
                if (object.ids[_i] == response.list[_items].id) {
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
    } else if (object.key == "FAVORITE") {
        // var favorites = fileCRUDF.listFavoriteFile({objectType:"DFG::Layout"});
        for (var i = 0; i < response.list.length; i++) {
            if (favoritesIds.indexOf(response.list[i].idFile) >= 0) {
                response.list[i].is.favorite = true;
                if (sharedIds.indexOf(response.list[i].idFile) >= 0) {
                    response.list[i].shared = "Shared";
                }
                _list.push(response.list[i]);
            }

        }
    } else if (object.key == "STANDARD") {
        var files = fileCRUDF.listFiles({
            status: ['Standard'],
            objectType: "DFG::AN4"
        });
        for (var i = 0; i < response.list.length; i++) {
            for (var j = 0; j < files.length; j++) {
                if (response.list[i].idFile == files[j].id) {
                    if (favoritesIds.indexOf(response.list[i].idFile) >= 0) {
                        response.list[i].is.favorite = true;
                    }
                    _list.push(response.list[i]);
                }
            }
        }
    } else if (object.key == "PUBLIC") {
        var files = fileCRUDF.listFiles({
            status: ['Public'],
            objectType: "DFG::AN4"
        })
        for (var i = 0; i < response.list.length; i++) {
            for (var j = 0; j < files.length; j++) {
                if (response.list[i].idFile == files[j].id) {
                    if (favoritesIds.indexOf(response.list[i].idFile) >= 0) {
                        response.list[i].is.favorite = true;
                    }
                    _list.push(response.list[i]);
                }
            }
        }
    } else if (object.key == "TRASH") {
        var files = fileCRUDF.listFiles({
            status: ['Trash'],
            objectType: "DFG::AN4"
        });
        for (var i = 0; i < response.list.length; i++) {
            for (var j = 0; j < files.length; j++) {
                if (response.list[i].idFile == files[j].id) {
                    _list.push(response.list[i]);
                }
            }
        }
    } else if (object.key == "ACTIVE") {
        var files = fileCRUDF.listFiles({
            status: ['Active'],
            objectType: "DFG::AN4"
        });
        for (var i = 0; i < response.list.length; i++) {
            for (var j = 0; j < files.length; j++) {
                if (response.list[i].idFile == files[j].id) {
                    if (favoritesIds.indexOf(response.list[i].id) >= 0) {
                        response.list[i].is.favorite = true;
                    }
                    _list.push(response.list[i]);
                }
            }
        }
    } else if (object.key == "SHARED") {
        var files = fileShare.listFileShare({
            objectType: "DFG::AN4"
        })
        for (var i = 0; i < response.list.length; i++) {
            for (var j = 0; j < files.length; j++) {
                if (response.list[i].idFile == files[j].file[0].id) {
                    if (favoritesIds.indexOf(response.list[i].idFile) >= 0) {
                        response.list[i].is.favorite = true;
                    }
                    response.list[i].shared = "Shared";
                    _list.push(response.list[i]);
                }
            }
        }
    } else if (_list.length == 0) {
        var favoritesFiles = fileCRUDF.listFavoriteFile({
            objectType: "DFG::AN4"
        });
        var files = fileCRUDF.listFiles({
            status: ['Standard', 'Public'],
            objectType: "DFG::AN4"
        });
        var sharedFiles = fileShare.listFileShare({
            objectType: "DFG::AN4"
        });
        var privateFiles = fileCRUDF.listAllUserFiles();
        files = files.concat(privateFiles);
        for (var i = 0; i < response.list.length; i++) {
            for (var j = 0; j < files.length; j++) {
                if (response.list[i].idFile == files[j].id) {
                    if (JSON.stringify(_list).indexOf(JSON.stringify(response.list[i])) == -1) {
                        _list.push(response.list[i]);
                    }
                }
            }
            for (var j = 0; j < favoritesFiles.length; j++) {
                if (response.list[i].idFile == files[j].id) {
                    if (JSON.stringify(_list).indexOf(JSON.stringify(response.list[i]))== -1) {
                        _list.push(response.list[i]);
                    }
                }
            }
            for (var j = 0; j < sharedFiles.length; j++) {
                if (response.list[i].idFile == files[j].id) {
                    if (JSON.stringify(_list).indexOf(JSON.stringify(response.list[i])) == -1) {
                        _list.push(response.list[i]);
                    }
                }
            }
        }
    }
    var counters = fileCRUDF.getCounters({
        objectType: "DFG::AN4"
    });
    response.counter = counters;
    //FILES
        
        return response;
    } catch (e) {
        $.messageCodes.push({
            "code": "DFG201005", //FIX MESSAGECODE
            "type": 'E',
            "errorInfo": util.parseError(e)
        });
    }
};
DFG.executer = function(){};
DFG.executer.prototype._readDigitalFile_ = function(object){
    object = object || $.request.parameters.get("object");
    if (typeof object === "string") {
        object = JSON.parse(object);
    }
    var digitalFile = modelDigitalFile.READ({
        where: [{
                field: 'id',
                oper: '=',
                value: 27
            }]
    })[0];
    return digitalFile
};
DFG.executer.prototype._preperData_ = function(date){
    var rawFile = JSON.parse(date.digitalFile);
    rawFile = rawFile.rawFile.splice("\r\n")
    throw rawFile
    var jsonResponse = {};
    
    for(var i = 0; i < rawFile.length; i++){
        
    }
};
/*
Usage:
    execute({
        id_1: <id AN1>,
        id_2: <id DFG2>,
        id_regra: <id DFG2>
    })
*/
this.execute_2 = function(){
    // try{
        var execute = new DFG.executer();
        throw "ok"
        var digitalFile1 = execute._readDigitalFile_();
        // var digitalFile2 = execute._readDigitalFile_({id:object.id_1});
        var data = execute._organizeData_(digitalFile1);
        
    // } catch (e) {
    //     $.messageCodes.push({
    //         "code": "DFG201005", //FIX MESSAGECODE
    //         "type": 'E',
    //         "errorInfo": util.parseError(e)
    //     });
    // }
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

        var response = modelDigitalFileAn4.READ({
            join: [{
                alias: 'eefi',
                table: modelDigitalFileAn4eefi,
                on: [{
                    left: 'id',
                    right: 'idAN4'
                }],
                outer: 'left'
            }],
            where: [{
                field: 'id',
                oper: '=',
                value: object.id
            }]
        });
        // LOG
        var logRegister = new logDFG();
        var register = logRegister.readAN4(setting);
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
this.createDialog = function() {
    try {
        var response = {};
        response.rules = rules.listRules({
            type: "AN4"
        });
        response.list = this.list({}).list;
        response.layouts = layout.list({}).list;
        response.companies = controllerExternal.listCompany();
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

        var eefi = object.eefi;
        delete object.eefi;
        object.isDeleted = 0;
        object.status = this.status.ACTIVE;
        var response = {};
        response.AN4 = modelDigitalFileAn4.CREATE(object);
        response.eefi = [];
        for (var i = 0; i < eefi.length; i++) {
            eefi[i].idAN4 = response.AN4.id;
            response.eefi.push(modelDigitalFileAn4eefi.CREATE(eefi[i]));
        }
        if (object.idFolder && layout.id) {
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
        // var logRegister = new logDFG();
        // var register = logRegister.createAN4(response);
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
    try {
        var eefi = [];
        for (var i = 0; i < object.eefi.length; i++) {
            eefi.push(object.eefi[i].id);
        }
        var an4Eefi = modelDigitalFileAn4eefi.READ({
            where: [{
                field: 'idAN4',
                oper: '=',
                value: object.id
            }]
        });
        for (i = 0; i < an4Eefi.length; i++) {
            if (eefi.indexOf(an4Eefi[i].id) == -1) {
                try {
                    modelDigitalFileAn4eefi.DELETE({
                        where: [{
                            field: 'id',
                            oper: '=',
                            value: an4Eefi[i].id
                        }]
                    });
                } catch (e) {
                    $.messageCodes.push({
                        "code": "DFG201005", //FIX MESSAGECODE
                        "type": 'E',
                        "errorInfo": util.parseError(e)
                    });
                }
            } else {
                try {
                    modelDigitalFileAn4eefi.UPDATE(object.eefi[i]);
                } catch (e) {
                    $.messageCodes.push({
                        "code": "DFG201005", //FIX MESSAGECODE
                        "type": 'E',
                        "errorInfo": util.parseError(e)
                    });
                }
            }
        }
        delete object.eefi;
        var response = modelDigitalFileAn4.UPDATE(object);
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
    favorite({
        id[<ids>]
    })
*/
this.favorite = function(object) {
    try {
        var response = [];
        for (var i = 0; i < object.id.length; i++) {
            response.push(modelDigitalFileAn4Favorite.CREATE({
                idAN4: object.id[i]
            }));
        }
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
    unmarkfavorite({
        id[<ids>]
    })
*/
this.unmarkfavorite = function(object) {
    try {
        var response = [];
        var ids = modelDigitalFileAn4Favorite.READ({
                where: [{
                    field: 'idAN4',
                    oper: '=',
                    value: object.id
                }, {
                    field: 'creationUser',
                    oper: '=',
                    value: $.getUserID()
                }]
            });
        for (var i = 0; i < ids.length; i++) {
            response.push(modelDigitalFileAn4Favorite.DELETE(ids[i].id));
        }
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
    copy({
        id:<id>
    })
*/
this.copy = function(object) {
    try {
        var an4 = modelDigitalFileAn4.READ({
            where: [{
                fields: ['id', 'name', 'description', 'idLeftFile', 'idRightFile', 'idRule'],
                field: 'id',
                oper: '=',
                value: object.id
            }]
        })[0];
        var an4Eefi = modelDigitalFileAn4eefi.READ({
            fields: ['idAN4', 'idCompany', 'uf', 'idBranch', 'idTax'],
            where: [{
                field: 'idAN4',
                oper: '=',
                value: an4.id
            }]
        });
        return an4;
        if (an4.hasOwnProperty('name')) {
            an4.name = object.name || an4.name;
            an4.description = object.description || an4.description;
           
            for (var i = 0; i < an4Eefi.length; i++) {
                an4Eefi[i].idAN4 = an4.id;
                modelDigitalFileAn4eefi.CREATE(an4Eefi[i]);
            }
            delete an4.id;
            var response = modelDigitalFileAn4.CREATE(an4);
        }
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
    recyclebin({
        id: [<ids>]
    })
*/
this.recyclebin = function(object) {
    try {
        var response = [];
        for (var i = 0; i < object.id.length; i++) {
            response.push(
                modelDigitalFileAn4.UPDATE({
                    id: object.id[i],
                    isDeleted: 1
                })
            );
        }
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
    delete({
        id: [<ids>]
    })
*/
this.delete = function(object) {
    try {
        var response = [];
        for (var i = 0; i < object.id.length; i++) {
            var an4 = modelDigitalFileAn4.READ({
                where: [{
                    field: 'id',
                    oper: '=',
                    value: object.id[i]
                }]
            })[0];
            if (an4.isDeleted == 1) {
                response.push(
                    modelDigitalFileAn4.UPDATE({
                        id: object.id[i],
                        isDeleted: 2
                    })
                );
            }
        }
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
    restore({
        id: [<ids>]
    })
*/
this.restore = function(object) {
    try {
        var response = [];
        for (var i = 0; i < object.id.length; i++) {
            var an4 = modelDigitalFileAn4.READ({
                where: [{
                    field: 'id',
                    oper: '=',
                    value: object.id[i]
                }]
            })[0];
            if (an4.isDeleted == 1 || an4.isDeleted == 2) {
                response.push(
                    modelDigitalFileAn4.UPDATE({
                        id: object.id[i],
                        isDeleted: 0
                    })
                );
            }
        }
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
    var response = {
        rules: rules.listRules({type: "AN4"}),
        digitalFileTypes: controllerDigitalFileType.list(),
        structures: controllerStructure.listStructuresName2()
    };
    return response;
};