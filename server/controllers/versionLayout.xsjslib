$.import("timp.core.server.api", "api");
var core_api = $.timp.core.server.api.api;
var util = core_api.util;
var user = core_api.usersController;

$.import('timp.core.server.models', 'fileSystem');
var fileSystem = $.timp.core.server.models.fileSystem;
var fileShareModel = fileSystem.fileShare;

$.import('timp.dfg.server.controllers', 'fileCRUDFNew');
var fileCRUDFNew = $.timp.core.server.controllers.fileCRUDFNew;
var listFolders = fileCRUDFNew.listFolders;
var listSharedFolders = fileCRUDFNew.listSharedFolders;

$.import("timp.dfg.server.models", "layoutVersion");
var modelLayoutVersion = $.timp.dfg.server.models.layoutVersion;

this.CounterFolders = function(object) {
	object = object || $.request.parameters.get('object');
	var root;
	var shared;
	try {
	    if (typeof object === 'string') {
			object = util.__parse__(object);
		}
		var folders = listFolders({
			idFolder: -1,
			objectType: object.objectType
		});
	    
 
	        root  = {
                id: -1,
                name: 'ROOT',
                files : this.CountFiles({
                            idFolder: -1,
                            objectType: object.objectType
                        })[0],
                folders: folders.length > 0 //this.getChildren({ idFolder: -1 }
                    };
          
            if (object.shared) {
                    shared = {
                    id: 0,
                    name: 'SHARED',
                    files: 0,
                    folders:listSharedFolders(object).length > 0
            };
            return [root, shared];
        }
        return [root];

	} catch (e) {
		// return (util.parseError(e));
		$.trace.error(e);
		$.messageCodes.push({
			type: 'E',
			code: 'CORE009062',
			errorInfo: util.parseError(e)
		});
	}
};

this.CountFiles = function(object){
 try{

        if (typeof object === 'string') {
            object = util.__parse__(object);
        }

        var idObjectType = this.getIdObjectType(object.objectType);
        var userID = user.getTimpUser().id;

        var files = fileSystem.readFile({
            //simulate: true,
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
                }
            ]
        });
      
      var whereFile = this.createWhere(files) ;
      var CountVersionsFiles = modelLayoutVersion.readLayoutVersion({
                count: true,
                where: whereFile
       });
    
     
      return CountVersionsFiles;

 }
 catch(e){  
    $.trace.error(e);
        $.messageCodes.push({
            type: 'E',
            code: 'CORE009000000',
            errorInfo: util.parseError(e)
        });
    }
};

this.createWhere = function(TypeFile) {
    
    try{
        
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
       
        }
    catch(e){
        $.messageCodes.push({
            code: "DFG209000",
            type: "E",
            errorInfo: util.parseError(e)
        });

    }
        

    
};