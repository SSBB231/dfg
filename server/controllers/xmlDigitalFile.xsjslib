$.import("timp.core.server.api", "api");
var core_api = $.timp.core.server.api.api;
var util = core_api.util;
var config = core_api.configController;

$.import('timp.dfg.server.controllers', 'external');
var controllerExternal = $.timp.dfg.server.controllers.external;



$.import('timp.dfg.server.models', 'xmlDigitalFile');
var xmlDigitalFiles = $.timp.dfg.server.models.xmlDigitalFile;

$.import('timp.brb.server.api', 'api');
var brbAPI = $.timp.brb.server.api.api;
var brbOutputCtrl = brbAPI.controllerOutput;

$.import("timp.atr.server.api", "api");
var atr_api = $.timp.atr.server.api.api;
var modelStructure = atr_api.structure.table;
var tributos = atr_api.tributo.table;

$.import("timp.mdr.server.api", "api");
var mdr_api = $.timp.mdr.server.api.api;
var zips = mdr_api.zipFiles;

// constants 

this.canShowXMLTab = function() {
	try {
		var response = config.getParameter("DFG", "showXmlTab");
		if (response === null) {
			return false;
		} else {
			return true;
		}
	} catch (e) {
		return false;
	}
};

this.list = function() {
	try {
		var options = {
			join: [{
				outer: 'left',
				table: tributos,
				alias: 'tributo',
				on: [{
					left: 'idTax',
					right: 'codTributo'
		        }]
		        }, {
				outer: 'left',
				table: zips.table,
				alias: 'zip',
				on: [{
					left: 'schemaZipID',
					right: 'id'
		        }]
	        }],
			where: [{
				field: 'status',
				oper: '=',
				value: 100
	        }]
		};
		return xmlDigitalFiles.read(options);
	} catch (e) {
		return util.parseError(e);
	}
};

this.createDigitalFile = function(object) {
	try {
		return xmlDigitalFiles.createDigitalFile(object);
	} catch (e) {
		return util.parseError(e);
	}
};

this.updateDigitalFile = function(object, where) {
	try {
		return xmlDigitalFiles.updateDigitalFile(object, where);
	} catch (e) {
		return util.parseError(e);
	}
};

this.deleteDigitalFile = function(object) {
	try {
		var params = {
			id: object.id,
			status: 300
		};
		return xmlDigitalFiles.deleteDigitalFile(params);
	} catch (e) {
		return util.parseError(e);
	}
};

this.getFileByID = function(object) {
	try {
		var options = {
			where: [{
				field: "id",
				oper: "=",
				value: object.id
		}],
			join: [{
				outer: 'left',
				table: tributos,
				alias: 'tributo',
				on: [{
					left: 'idTax',
					right: 'codTributo'
		        }]
		        }, {
				outer: 'left',
				table: zips.table,
				alias: 'zip',
				on: [{
					left: 'schemaZipID',
					right: 'id'
		        }]
	        }]
		};
		return xmlDigitalFiles.getFileByID(options);
	} catch (e) {
		return util.parseError(e);
	}
};

this.getStructuresAndReportsByFile = function(object) {
	var response = {};
	var data = this.getFileByID(object);
	var structuresArray = JSON.parse(data[0].structuresID);
	var structuresList = modelStructure.listStructuresById({
		ids: structuresArray
	});
	response.structures = {};
	for (var i = 0; i < structuresList.length; i++) {
		response.structures[structuresList[i].id] = structuresList[i];
	}
	response.reports = brbOutputCtrl.listByOutput();
	response.outputsTCC = {};

	var outputsTcc = controllerExternal.getTCCOutputs();
	for (var i = 0; i < outputsTcc.length; i++) {
		var objectType = outputsTcc[i].objectType;
		if (!response.outputsTCC.hasOwnProperty(objectType)) {
			response.outputsTCC[objectType] = [];
		}
		response.outputsTCC[objectType].push({
			id: outputsTcc[i].id,
			name: outputsTcc[i].name,
			key: outputsTcc[i].key,
			description: outputsTcc[i].description,
			objectType: outputsTcc[i].objectType
		});
	}

	return response;
};

this.getXMLFilesCounter = function() {
	try {
		return xmlDigitalFiles.read().length;
	} catch (e) {
		return util.parseError(e);
	}
};

