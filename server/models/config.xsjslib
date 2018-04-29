$.import("timp.core.server.api","api");
var core_api = $.timp.core.server.api.api;
var util = core_api.util;

//general configurations
this.version = '1.10.7';

//default services

this.hasError = function(){
    if($.messageCodes.length>0){
        return true;
    }
    return false;
};

//atribuir determinados valores default para o response:
// type: notPermission - bloquear usuário sem permissão
//       objectVerify  - má formação no objeto enviado pela url
// e: informações sobre o erro retornado pelo try - catch
this.setResponse = function(type,e){
    
    switch(type){
        case "notPermission":
            e = 'Not permission.';
            $.messageCodes.push({code: "DFG201001", type: 'E', errorInfo: e});
            $.response.status = 401;
            break;
        case "objectVerify":
            $.messageCodes.push({code: "DFG201002", type: 'E', errorInfo: e});
            break;
    }
    
    return true;
};

//********************************//


//log service
var component = 'DFG';

this.component = component;

function DetailForChanges(property, property_category, old_value, new_value,
		action_detail) {
	this.property = ""+property;
	this.property_category = ""+property_category;
	this.old_value = ""+old_value;
	this.new_value = ""+new_value;
	this.action_detail = ""+action_detail;
}

this._compareObjects = function(oldObject, newObject) {
    
    //oldObject = oldObject[0];
	var details = [];
	
	delete oldObject.creationDate;
	delete oldObject.modificationDate;
	delete oldObject.creationUser;
	delete oldObject.modificationUser;
	
	for(var iOld in oldObject){
		if(!newObject[iOld]){
			newObject[iOld] = null;
		}
	}
	
	for ( var i in newObject) {
	    
		if ((oldObject[i] && newObject[i])) {
			
			if (newObject[i].constructor == Object
					|| newObject[i].constructor == Array) {
				var otherDetails = this._compareObjects(oldObject[i],
						newObject[i]);
				for ( var j = 0; j < otherDetails.length; j++) {
					otherDetails[j].property = i + ' >> ' + otherDetails[j].property;
					details.push(otherDetails[j]);
				}
			} else {
				if (newObject[i] != oldObject[i]) {
					var detail = new DetailForChanges(i, i, oldObject[i],
							newObject[i], i + ' has change');
					details.push(detail);
				}
			}
		} else if ((newObject[i] && !oldObject[i]) || (!newObject[i] && oldObject[i])) {
			
			if(!newObject[i]){
				oldObject[i] = 'has the attribute ';
				newObject[i] = 'does not have attribute';
			}else{
				oldObject[i] = 'does not have attribute';
				newObject[i] = 'has the attribute ';	
			}
			
			var detail = new DetailForChanges(i, i, oldObject[i],
					newObject[i], i + ' has change');
			details.push(detail);
		}
	}

	return details;
}

this.createLog = function(object,type){
    
    try{
        
        var response = {};
        var details;
        var idObject;
        var objectLog = {};
        
        if(type==='update'){
            
            if(!object.hasOwnProperty("oldModificationDate") && !object.hasOwnProperty("newModificationDate")){
                
                details = this._compareObjects(object.oldObject, object.newObject);
                idObject = object.newObject.id;
                
            }else{
                
                details = [];
                details.push({
        				property: 'modificationDate',
        				property_category: 'meta',
        				old_value: object.oldModificationDate + "",
        				new_value: object.newModificationDate + "",
        				action_detail: "Changing modificationDate"
        			    });
                idObject = parseInt(object.id);
            }
            
        }else{ //create, read, delete, copy...
            details = [];
            idObject = parseInt(object.id);
        }
        
        // var executeLog = Log.registerAction({
        //     component: object.component,
        //     action: object.action,
        //     id_object : idObject,
        //     details: details,
        //     objectType: object.objectType
        // });
        
        // response.result = executeLog;
        return response;
        
    }catch(e){
        $.messageCodes.push({code: "DFG201004", type: 'E', errorInfo: util.parseError(e)});
        response = null;
        return response;
    }
};