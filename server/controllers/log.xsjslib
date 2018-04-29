// CORE
$.import('timp.log.server.api', 'api');
var Log = $.timp.log.server.api.api;
//var Log = core_api.log;

// function Detail(action_detail) {
// 	this.action_detail = action_detail;
// }

function DetailForChanges(property, property_category, old_value, new_value, action_detail) {
	this.property = "" + property;
	this.property_category = "" + property_category;
	this.old_value = "" + old_value;
	this.new_value = "" + new_value;
	this.action_detail = "" + action_detail;
}

function Registro(action, id_object, object_type) {
	this.component = "DFG";
	this.action = action;
	this.id_object = parseInt(id_object, 10);
	this.object_type = object_type;
	this.details = [];
	this.userId = $.getUserID();
}

Registro.prototype.addDetail = function(newDetail) {
	this.details.push(newDetail);
};

Registro.prototype.addMultiDetails = function(listDetails) {
	for (var item in listDetails) {
		this.details.push(listDetails[item]);
	}
};

//CLASS Supervisor 
function Supervisor() {}
//--LAYOUT--
Supervisor.prototype.createLayout = function(layout) {
	return Log.createEvent({
	    componentName: "DFG",
	    messageCode: 'LOG209001',
	    objectId: layout.id 
	});
};

Supervisor.prototype.readLayout = function(layout) {
/*	return Log.createEvent({
	    componentName: "DFG",
	    json: [{name: layout.name,description: layout.description}],
	    messageCode: 'LOG209002',
	    objectId: layout.id 
	});*/
}; 

Supervisor.prototype.updateLayout = function(layout,details) {
	
	return Log.createEvent({
	    componentName: "DFG",
	    json: {details: details},
	    messageCode: 'LOG209000',
	    objectId: layout.id
	});

};
Supervisor.prototype.trashLayout = function(id){
    
	return Log.createEvent({
	    componentName: "DFG", 
	    messageCode: 'LOG209049',
	    objectId: id
	});

};
Supervisor.prototype.restoreLayout = function(id){
    
	return Log.createEvent({
	    componentName: "DFG", 
	    messageCode: 'LOG209051',
	    objectId: id
	});

};
Supervisor.prototype.deleteLayout = function(id){
    
	return Log.createEvent({
	    componentName: "DFG", 
	    messageCode: 'LOG209037',
	    objectId: id
	});

};
//--SETTING--
Supervisor.prototype.createSetting = function(newSetting) {
	return Log.createEvent({
	    componentName: "DFG",
	    messageCode: 'LOG209003',
	    objectId: newSetting.id 
	}); 
};

Supervisor.prototype.readSetting = function(setting) {
/*	return Log.createEvent({
	    componentName: "DFG",
	    json: [{name: setting.name,description: setting.description}],
	    messageCode: 'LOG209004',
	    objectId: setting.id 
	}); 
	*/
};

Supervisor.prototype.updateSetting = function(setting) {
	return Log.createEvent({
	    componentName: "DFG",
	    messageCode: 'LOG209005',
	    objectId: setting.id 
	}); 
};
Supervisor.prototype.trashSetting = function(id){
    
	return Log.createEvent({
	    componentName: "DFG", 
	    messageCode: 'LOG209050',
	    objectId: id
	});

};
Supervisor.prototype.restoreSetting = function(id){
    
	return Log.createEvent({
	    componentName: "DFG", 
	    messageCode: 'LOG209052',
	    objectId: id
	});

};
Supervisor.prototype.deleteSetting = function(id){
    
	return Log.createEvent({
	    componentName: "DFG",
	    messageCode: 'LOG209038',
	    objectId: id
	});

};
Supervisor.prototype.executeSetting = function(setting) {
/*	return Log.createEvent({
	    componentName: "DFG",
	    messageCode: 'LOG209006',
	    objectId: setting.id 
	}); 
	*/
};

//--DIGITAL FILE--
 Supervisor.prototype.issueDigitalFile = function(digitalFile) {
     	return Log.createEvent({
	    componentName: "DFG",
	    messageCode: 'LOG209007',
	    objectId: digitalFile.id 
	}); 
// 	var registro = new Registro("digitalFile.issue", digitalFile.id, "DFG::DigitalFile");
// 	return Log.registerAction(registro);
};

 Supervisor.prototype.officializeDigitalFile = function(digitalFile) {
// 	var registro = new Registro('digitalFile.officialize', digitalFile.id, 'DFG::DigitalFile');
// 	return Log.registerAction(registro);
 };

 Supervisor.prototype.sendDigitalFile = function(digitalFile) {
// 	var registro = new Registro("digitalFile.send", digitalFile.id, "DFG::DigitalFile");
// 	return Log.registerAction(registro);
 };

 Supervisor.prototype.rectify = function(digitalFile) {
// 	var registro = new Registro("digitalFile.rectify", digitalFile.id, "DFG::DigitalFile");
// 	return Log.registerAction(registro);
 };

 Supervisor.prototype.executeDigitalFile = function(digitalFile) {
// 	var registro = new Registro("executeDigitalFile", digitalFile.id, "DFG::DigitalFile");
// 	return Log.registerAction(registro);
};

Supervisor.prototype.readDigitalFiles = function(digitalFiles) {
// 	var ids = [];
// 	for (var i = 0; i < digitalFiles.length; i++) {
// 		ids.push(digitalFiles[i].id);
// 	}
// 	var registro = new Registro("digitalFile.read", ids, "DFG::DigitalFile");
// 	return Log.registerAction(registro);
};

Supervisor.prototype.analyzeDigitalFile = function(digitalFile) {
// 	var registro = new Registro("digitalFile.analyze", digitalFile.id, "DFG::DigitalFile");
// 	return Log.registerAction(registro);
};

//--AN4--
Supervisor.prototype.createAN4 = function(an4) {
	return Log.createEvent({
	    componentName: "DFG",
	    messageCode: 'LOG209014',
	    objectId: an4.id 
	}); 
};

// Supervisor.prototype.readAN4 = function(digitalFile) {
// 	var registro = new Registro('an4.read', digitalFile.id, 'DFG::AN4');
// 	return Log.registerAction(registro);
// };
//---AN3---
Supervisor.prototype.createAN3 = function(an3) {
	return Log.createEvent({
	    componentName: "DFG",
	    messageCode: 'LOG209016',
	    objectId: an3.id 
	}); 
};

// Supervisor.prototype.readAN3 = function(an3) {
// 	var registro = new Registro('an4.read', an3.id, 'DFG::AN3');
// 	return Log.registerAction(registro);
// };
//--SPED--
Supervisor.prototype.createSPED = function(sped){
    return Log.createEvent({
	    componentName: "DFG",
	    messageCode: 'LOG209035',
	    objectId: sped.id 
	}); 
};
Supervisor.prototype.deleteSPED = function(sped){
     return Log.createEvent({
	    componentName: "DFG",
	    messageCode: 'LOG209036',
	    objectId: sped.id 
	}); 
};

Supervisor.prototype.executeFile = function(file){
    return Log.createEvent({
	    componentName: "DFG",
	    messageCode: 'LOG209034',
	    objectId: file.id 
	}); 
};
Supervisor.prototype.executeSPEDFile = function(file, messageCode){
    return Log.createEvent({
        componentName: "DFG",
        messageCode: messageCode,
        objectId: file.id,
        objectName: file.name
    });
};
Supervisor.prototype.updateSPEDStructure = function(){
    return Log.createEvent({
        componentName: "DFG",
        messageCode: "LOG209057"
    });
};
//------------------ERROR HANDLING----------------------------//
Supervisor.prototype.errorCreateLayout = function(trace){
    return Log.createErrorEvent({
        componentName: "DFG",
        messageCode: 'LOG209039',
        json: trace
    });
};
Supervisor.prototype.errorCreateSetting = function(trace){
    return Log.createErrorEvent({
        componentName: "DFG",
        messageCode: 'LOG209042',
        json: trace
    });
};
Supervisor.prototype.errorCreateSPED = function(trace){
    return Log.createErrorEvent({
        componentName: "DFG",
        messageCode: 'LOG209045',
        json: trace
    });
};
Supervisor.prototype.errorEditLayout = function(id,trace){
    return Log.createErrorEvent({
        componentName: "DFG",
        messageCode: 'LOG209040',
        objectId: id,
        json: trace
    });
};
Supervisor.prototype.errorEditSetting = function(id,trace){
    return Log.createErrorEvent({
        componentName: "DFG",
        messageCode: 'LOG209043',
        objectId: id,
        json: trace
    });
};
Supervisor.prototype.errorEditSPED = function(id,trace){
    return Log.createErrorEvent({
        componentName: "DFG",
        messageCode: 'LOG209046',
        objectId: id,
        json: trace
    });
};
Supervisor.prototype.errorTrashLayout = function(id,trace){
    return Log.createErrorEvent({
        componentName: "DFG",
        messageCode: 'LOG209053',
        objectId: id,
        json: trace
    });
};
Supervisor.prototype.errorTrashSetting = function(id,trace){
    return Log.createErrorEvent({
        componentName: "DFG",
        messageCode: 'LOG209054',
        objectId: id,
        json: trace
    });
};
Supervisor.prototype.errorRestoreLayout = function(id,trace){
    return Log.createErrorEvent({
        componentName: "DFG",
        messageCode: 'LOG209055',
        objectId: id,
        json: trace
    });
};
Supervisor.prototype.errorRestoreSetting = function(id,trace){
    return Log.createErrorEvent({
        componentName: "DFG",
        messageCode: 'LOG209056',
        objectId: id,
        json: trace
    });
};
Supervisor.prototype.errorDeleteLayout = function(id,trace){
    return Log.createErrorEvent({
        componentName: "DFG",
        messageCode: 'LOG209041',
        objectId: id,
        json: trace
    });
};
Supervisor.prototype.errorDeleteSetting = function(id,trace){
    return Log.createErrorEvent({
        componentName: "DFG",
        messageCode: 'LOG209044',
        objectId: id,
        json: trace
    });
}; 
Supervisor.prototype.errorDeleteSPED = function(id,trace){
    return Log.createErrorEvent({
        componentName: "DFG",
        messageCode: 'LOG209047',
        objectId: id,
        json: trace
    });
};
Supervisor.prototype.errorExecuteFile = function(id,trace){
    return Log.createErrorEvent({
        componentName: "DFG",
        messageCode: 'LOG209048', 
        objectId: id,
        json: trace
    });
};
Supervisor.prototype.errorUpdateSPEDStructure = function(trace){
    return Log.createEvent({
        componentName: "DFG",
        messageCode: "LOG209058",
        json: trace
    });
};
this.Supervisor = Supervisor;