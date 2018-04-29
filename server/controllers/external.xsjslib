$.import("timp.core.server.api", "api");
var core_api = $.timp.core.server.api.api;
var coreOutputModel = core_api.outputModel;
var util = core_api.util;

$.import('timp.atr.server.api','api');
var atr_api = $.timp.atr.server.api.api;
var structureController = atr_api.structureController;
var structureModel = atr_api.structure.table;
var structureFieldMappingController = atr_api.structureFieldMappingController;
var cvMovimiento = atr_api.cvCentralizacaoMovimento.table;
var tributoModel = atr_api.tributo.table;
var tributoAgrupamento = atr_api.tributoAgrupamento.tributoAgrupamento;
var structure = atr_api.structureController;

$.import('timp.dfg.server.controllers', 'util');
var utilDFG = $.timp.dfg.server.controllers.util; 

$.import("timp.bfb.server.api","api");
var bfb_api = $.timp.bfb.server.api.api;
var outputController = bfb_api.outputController;
$.import('timp.brb.server.api', 'api');
var brbAPI = $.timp.brb.server.api.api;
var brb = brbAPI.controllerOutput;
$.import('timp.tcc.server.api', 'api');
var tcc_api = $.timp.tcc.server.api.api;
var tccController = tcc_api.external;

$.import('timp.bcb.server.api', 'api');
var bcb_api = $.timp.bcb.server.api.api;
var bcbExecutionModel = bcb_api.builderExecutionModel;
var bcbBuilderConfigurationModel = bcb_api.builderConfigurationModel;
var bcbHierarchyConfigurationModel = bcb_api.hierarchyConfigurationModel;
var bcbOutputModel = bcb_api.bcbOutputModel;

$.import("timp.mdr.server.api","api");
var mdr_api = $.timp.mdr.server.api.api;
this.getBCBOutputs = function() {
	try {
	

		var outputs = bcbBuilderConfigurationModel.builderConfiguration.READ({
			fields: ["id"],
			join: [{
				table: bcbHierarchyConfigurationModel.hierarchyConfiguration,
				alias: 'hierarchy',
				fields: ["id","name"],
				on: [{
					left: 'idHierarchy',
					right: 'id'
                }]
             }, 
    //          {
				// table: bcbExecutionModel.builderExecution,
				// alias: 'execution',
				// fields: [],
				// on: [{
				// 	left_table: bcbBuilderConfigurationModel.builderConfiguration,
				// 	left: "id",
				// 	right: "idConfiguration"
    //             }]
    //         }, {
				// table: bcbExecutionModel.builderExecutionVersion,
				// alias: 'version',
				// fields: [],
				// on: [{
				// 	left_table: bcbExecutionModel.builderExecution,
				// 	left: "id",
				// 	right: "idExecution"
    //             }]
    //         }, 
            {
				table: bcbOutputModel.table,
				alias: "outputs",
				fields: ["id", "name"],
				on: [{
				// 	left_table: bcbBuilderConfigurationModel.builderConfiguration,
					left: "id",
					right: "idConfiguration"
                },{
                    field:'idCompany',
                    oper:'IS NULL'
                }]
            }]
		});
		outputs.forEach(function(output) {
// 			output.id = output.configuration[0].id;
            output.name = output.hierarchy[0].name;
			delete output.hierarchy;
		});
		return outputs;

	} catch (e) {
		return [];
	}

};
this.getBFBOutputs = function() {
    return outputController.getOutputs();
};
this.executeBCBOutput = function(object) {
	try {
	    var bcbOutputController = bcb_api.bcbOutputController;
	    var id = object.id;
		var outputValue = 0;
		var filterOutput = {
		    id:id
		};
		if (object.hasOwnProperty("eefi") && object.eefi) {
			if (object.eefi.hasOwnProperty("idCompany") && object.eefi.idCompany) {
				filterOutput.idCompany = object.eefi.idCompany;
			}
			if (object.eefi.hasOwnProperty("idBranch") && object.eefi.idBranch) {
			    filterOutput.idBranch = object.eefi.idBranch;
			}
			if (object.eefi.hasOwnProperty("uf") && object.eefi.uf) {
			    filterOutput.uf = object.eefi.uf;
			}
			if (object.eefi.hasOwnProperty("idTax") && object.eefi.idTax) {
			    filterOutput.taxCode = object.eefi.idTax;
			}
			if (object.eefi.hasOwnProperty("month") && object.eefi.month) {
			    filterOutput.month = object.eefi.month;
			}
			if (object.eefi.hasOwnProperty("year") && object.eefi.year) {
			    filterOutput.year = object.eefi.year;
			}
			if (object.eefi.hasOwnProperty("subPeriod") && object.eefi.subPeriod) {
			    filterOutput.subperiod = object.eefi.subPeriod;
			}
			if (object.eefi.hasOwnProperty("subperiod") && object.eefi.subperiod) {
			    filterOutput.subperiod = object.eefi.subperiod;
			}
		}
		var output = bcbOutputController.getOutput(filterOutput);
		if(!output){
		    return {outputValue:0};
		}
		return output;
	} catch (e) {
		$.messageCodes.push({
			"code": "BFB202006",
			"type": 'E',
			"errorInfo": util.parseError(e)
		});
		return {
			outputValue: null
		};
	}
};
this.executeBFBOutput = function(object) {
	try {
		var where = [];
		
		if (object.hasOwnProperty("id") && object.id) {
		    if(typeof object.id === "string"){
		        if(object.id.indexOf("BFBID_") > -1){
		             object.id = object.id.split("BFBID_")[1];
		        }
		    }
			where.push({
				field: "idOutput",
				oper: "=",
				value: object.id
			});
		}
		if (object.hasOwnProperty("eefi") && object.eefi) {
			if (object.eefi.hasOwnProperty("idCompany") && object.eefi.idCompany) {
				where.push({
					field: "idCompany",
					oper: "=",
					value: object.eefi.idCompany
				});
			}
			if (object.eefi.hasOwnProperty("idBranch") && object.eefi.idBranch) {
				where.push({
					field: "idBranch",
					oper: "=",
					value: object.eefi.idBranch
				});
			}

			if (object.eefi.hasOwnProperty("uf") && object.eefi.uf) {
				where.push({
					field: "uf",
					oper: "=",
					value: object.eefi.uf
				});
			}
            
// 			if (object.eefi.hasOwnProperty("idTax") && object.eefi.idTax) {
// 				where.push({
// 					field: "idTax",
// 					oper: "=",
// 					value: object.eefi.idTax
// 				});
// 			}
			if (object.eefi.hasOwnProperty("month") && object.eefi.month) {
				where.push({
					field: "month",
					oper: "=",
					value: object.eefi.month
				});
			}
			if (object.eefi.hasOwnProperty("year") && object.eefi.year) {
				where.push({
					field: "year",
					oper: "=",
					value: object.eefi.year
				});
			}
			if (object.eefi.hasOwnProperty("subPeriod") && object.eefi.subPeriod) {
				where.push({
					field: "subperiod",
					oper: "=",
					value: object.eefi.subPeriod 
				});
			}
		}
		var result = coreOutputModel.outputValue.READ({
			fields: ["value"],
			where: where
		});
		var validResult = [];
		for(var i = 0; i < result.length; i++){
		    if(object.eefi.hasOwnProperty("idTax") && object.eefi.idTax === "00" && result[i].idTax === "01"){
		        validResult = [result[i]];
		        break;
		    }else if(object.eefi.hasOwnProperty("idTax") && result[i].idTax ===  object.eefi.idTax){
		        validResult = [result[i]];
		        break;
		    } 
		}
		if (result.length == 0 || result[0] == null || result[0]  === undefined || result[0].value  === undefined || result[0].value === "undefined") {

			return 0;
		}
		return result[0].value;
	} catch (e) {
        $.trace.error(e);
	}
	return 0;
};
this.getAllStructures = function(){
    try {
        var allStructures = structureController.listStructuresName2();
        var allSubStructures=[];
        
        for(var i =0; i<allStructures.length;i++){
            for(var j =0;j<allStructures[i].sub.length;j++){
                // allStructures[i].sub[j] =structureModel.getStructure(allStructures[i].sub[j].id);
                allSubStructures.push(structureModel.getStructure(allStructures[i].sub[j].id));
                allStructures[i].sub=allSubStructures;
                allStructures[i].sub[0].levels=[];
                allStructures[i].sub[0].inputParameters=[];
                return allStructures[i].sub;
            }
            
        }
        return allStructures[0];
    } catch (e) {
        // Ocorreu um erro ao tentar obter todas as estruturas
        // An error occurred while trying to get all structures
        $.messageCodes.push({"code": "DFG202001", "type": 'E',"errorInfo": util.parseError(e)});
        return null;
    }
};
this.getCentralizedBranches = function(object){
    var centralizedBranches = [];
    
    try{
        var date1 =  utilDFG.toJSONDate(new Date(object.subPeriod.startDate));
        var date2 =  utilDFG.toJSONDate(new Date(object.subPeriod.endDate));
        var centralization = mdr_api.centralizacaoMovimentoController.getMovementCentralization({
            idCompany: object.company,
            uf: object.uf,
            taxCode: object.tax,
            idBranch: object.branch,
            centralizedCentralizer:{centralized: object.branch},
            startDate: date1.year+"-"+date1.month+"-"+date1.day+"T23:59:59.999Z",
            endDate: date2.year+"-"+date2.month+"-"+date2.day+"T00:00:00.000Z"
        });
 	  var isCentralized = false;
 	  var centralizadora = "";

 	  centralization.map(function(c){
 	      if(Array.isArray(object.branch)){
 	          if(object.branch.indexOf(c.codFilial) !== -1 && object.branch.indexOf(c.codFilialCentralizadora) === -1){
 	              isCentralized = true;
 	              centralizadora = c.codFilialCentralizadora;
 	          }
 	          if(object.branch.indexOf(c.codFilialCentralizadora)){
 	              if(centralizedBranches.indexOf(c.codFilial) === -1){
 	                  centralizedBranches.push(c.codFilial);
 	              }
 	          }
 	      }else{
 	          if(object.branch === c.codFilial && object.branch !== c.codFilialCentralizadora){
 	              isCentralized = true;
 	              centralizadora = c.codFilialCentralizadora;
 	          }
 	          if(object.branch === c.codFilialCentralizadora){
 	              if(centralizedBranches.indexOf(c.codFilial) === -1){
 	                  centralizedBranches.push(c.codFilial);
 	              }
 	          }
 	      }
 	      
 	  });
 	  
 	 
    }catch(e){
        
    }
     return {isCentralized:isCentralized,centralizedBranches: centralizedBranches, centralizadora: centralizadora};
};
this.getStructureByConfig = function(id){
    try {
        var config = settingController.get(id);
        var structures = config.json.structures;
        var structuresByConfig=[];
        // return structures
        var allStructures = structureController.listStructuresName2();
        for(var i =0;i<structures.length;i++){
            if(allStructures[structures[i].structureId]){
                structuresByConfig.push({title:allStructures[structures[i].structureId].title, sub:[structureModel.getStructure(structures[i].subStructrureId)]});
            }
        }
       
        return structuresByConfig;
    } catch (e) {
        // Ocorreu um erro ao tentar obter a estrutura por configuração
        // An error occurred while trying to get the structure by configuration
        $.messageCodes.push({"code": "DFG202002", "type": 'E',"errorInfo": util.parseError(e)});
        return null;
    }
};

this.listCompany = function(){
    try {
        var response = atr_api.companylist();
        return response;
    }catch(e){
        $.messageCodes.push({
            "code": "BFB209002",
            "type": 'E',
            "errorInfo": util.parseError(e)
        });
        return null;    
    }
};

this.listUF = function(object){
    try {
        var response = atr_api.ufList(object);
        return response;
    }catch(e){
        $.messageCodes.push({
            "code": "BFB209003",
            "type": 'E',
            "errorInfo": util.parseError(e)
        });
        return null;    
    }
};

this.listBranch = function(object){
    try {
        var response = atr_api.branchlist(object);
        return response;
    }catch(e){
        $.messageCodes.push({
            "code": "BFB209004",
            "type": 'E',
            "errorInfo": util.parseError(e)
        });
        return null;    
    }
};

this.listTax = function(){
    try {
        var response = [];
        var lang = ($.request.cookies.get("Content-Language") === "enus") ? "enus" : "ptrbr";
        var tributos = tributoModel.READ({
            fields: ['codTributo','descrCodTributoLabel'],
            distinct: true
        });
        var tributosGroups = tributoAgrupamento.READ({
           fields: ["id","nomeAgrupamento"],
           distinct: true 
        });
        for(var i = 0; i < tributos.length; i++){
            response.push({
                key: tributos[i].codTributo,
                name: tributos[i].descrCodTributoLabel
            });
        }
        tributosGroups.map(function(t){
            response.push({
                key: t.id+"G",
                name: t.nomeAgrupamento + "-"+(lang === "enus" ? "Group" : "Grupo")
            });
        });
        return response;
    }catch(e){
        $.messageCodes.push({
            "code": "BFB209005",
            "type": 'E',
            "errorInfo": util.parseError(e)
        });
        return null;    
    }
};

this.getStructureFieldMapping = function(object){
     try {
        var response = structureFieldMappingController.getStructureFieldMapping(object);
        return response;
    }catch(e){
        $.messageCodes.push({
            "code": "BFB209006",
            "type": 'E',
            "errorInfo": util.parseError(e)
        });
        return null;    
    }
};
this.listStructureFieldMapping = function(object){
    try{
        var response = structureFieldMappingController.listStructureFieldMapping(object);
        return response;
    }catch(e){
        $.messageCodes.push({
            "code": "BFB209007",
            "type": 'E',
            "errorInfo": util.parseError(e)
        });
        return null; 
    }
};
this.executeOutputs = function(idOutput, parameters,externalExecution) {
    var response = {};
    try {
        if (idOutput && parameters) {
            response = brb.executeOutput(idOutput, parameters,externalExecution);
        } else if (idOutput) {
            response = brb.executeOutput(idOutput);
        } else {
            return 'Please insert Output Id';
        }
        if (response !== undefined || response !== null) {
            return response;
        }else {
            return [];
        }
    } catch (e) {
        // throw 'Impossible to execute service: executeOutput' + idOutput + '\n' + e.toString();
        // Ocorreu um erro ao tentar executar o campo de saída
        // An error occurred while trying to execute the output
        $.messageCodes.push({"code": "BFB202002", "type": 'E',"errorInfo": util.parseError(e)});
        return null;
    }
};
this.executeTCCOutput = function(id){
    return tccController.getOutput({
        id:id
    });
};
this.getTCCOutputs = function(){
    return tccController.outputModel.table.READ();
};

this.getCommonFilters = function(){
    var response = {
        company: this.listCompany(),
        uf: this.listUF({}),
        branch: this.listBranch(),
        tax: this.listTax()
    };
    return response;
};


//<----------Refactor---------->