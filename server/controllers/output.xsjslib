// ----------< General Imports >----------
$.import('timp.core.server.api','api');
var core_api = $.timp.core.server.api.api;
var util = core_api.util;

$.import('timp.atr.server.api','api');
var atr_api = $.timp.atr.server.api.api;

// ----------< Methdos Definition >----------

this.listOutputType = function(){
    try {
        var response = core_api.listOutputType();
        return response;
    }catch(e){
        $.messageCodes.push({
            "code": "DFG212001",
            "type": 'E',
            "errorInfo": util.parseError(e)
        });
        return null;    
    }
};

this.listCompany = function(){
    try {
        var response = atr_api.companylist();
        return response;
    }catch(e){
        $.messageCodes.push({
            "code": "DFG212002",
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
            "code": "DFG212003",
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
            "code": "DFG212004",
            "type": 'E',
            "errorInfo": util.parseError(e)
        });
        return null;    
    }
};

this.listTax = function(){
    try {
        var response = atr_api.taxList();
        return response;
    }catch(e){
        $.messageCodes.push({
            "code": "DFG212005",
            "type": 'E',
            "errorInfo": util.parseError(e)
        });
        return null;    
    }
};

this.listValues = function(object){
    try {
        var response;
        if (object.objectType === 1){
            object.values = true;
            object.objectType = 55;
            response = core_api.outputList(object);
            return response;    
        } else {
            throw "obejctType is empty or invalid objectType "
        }
    }catch(e){
        $.messageCodes.push({
            "code": "DFG212006",
            "type": 'E',
            "errorInfo": util.parseError(e)
        });
        return null;    
    }
};