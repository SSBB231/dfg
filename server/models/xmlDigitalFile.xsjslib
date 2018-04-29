$.import("timp.core.server.api", "api");
var core_api = $.timp.core.server.api.api;
var util = core_api.util;
var def_table = core_api.table_lib;
var schema = core_api.schema;

var table = new def_table.Table({
	component: 'DFG',
	name: schema.default+'."DFG::XMLFile"',
	default_fields: 'common',
	fields: {
		id: new def_table.AutoField({
			name: 'ID',
			pk: true,
			auto: schema.default+'."DFG::XMLFile::ID".nextval',
			type: $.db.types.INTEGER
		}),
		fileName: new def_table.Field({
			name: 'FILE_NAME',
			type: $.db.types.NVARCHAR,
			dimension: 100
		}),
		description: new def_table.Field({
			name: 'DESCRIPTION',
			type: $.db.types.NVARCHAR,
			dimension: 250
		}),
		schemaZipID: new def_table.Field({
			name: 'SCHEMA_ZIP_ID',
			type: $.db.types.INTEGER
		}),
		schemaFileID: new def_table.Field({
			name: 'SCHEMA_FILE_ID',
			type: $.db.types.INTEGER
		}),
		idLayout: new def_table.Field({
		    name: "ID_LAYOUT",
		    type: $.db.types.INTEGER
		}),
		idSetting: new def_table.Field({
		    name: "ID_SETTING",
		    type: $.db.types.INTEGER
		}),
		idStructureGroup: new def_table.Field({
			name: "ID_STRUCTURE_GROUP",
			type: $.db.types.INTEGER
		}),
		structuresID: new def_table.Field({
			name: "STRUCTURES_ID",
			type: $.db.types.NCLOB
		}),
		// 		month: new def_table.Field({
		// 			name: 'MONTH',
		// 			type: $.db.types.NVARCHAR,
		// 			dimension: 2
		// 		}),
		// 		months: new def_table.Field({
		// 		   name: 'MONTHS' ,
		// 		   type: $.db.types.NCLOB
		// 		}),
		// 		year: new def_table.Field({
		// 			name: 'YEAR',
		// 			type: $.db.types.NVARCHAR,
		// 			dimension: 4
		// 		}),
		// 		subperiod: new def_table.Field({
		// 			name: 'SUBPERIOD',
		// 			type: $.db.types.NVARCHAR,
		// 			dimension: 2
		// 		}),
		companiesID: new def_table.Field({
			name: 'COMPANIES_ID',
			type: $.db.types.NCLOB
		}),
		ufsID: new def_table.Field({
			name: 'UFS_ID',
			type: $.db.types.NCLOB
		}),
		branchesID: new def_table.Field({
			name: 'BRANCHES_ID',
			type: $.db.types.NCLOB
		}),
		idTax: new def_table.Field({
			name: 'ID_TAX',
			type: $.db.types.NVARCHAR,
			dimension: 128
		}),
		xmlFileText: new def_table.Field({
		    name: 'XML_FILE_TEXT',
		    type: $.db.types.NCLOB
		}),
		executionData: new def_table.Field({
		   name: 'EXECUTION_DATA',
		   type: $.db.types.NCLOB
		}),
		status: new def_table.Field({
		    name: 'STATUS',
		    type: $.db.types.INTEGER
		})
	}

});
this.table = table;
//Status
// 	ACTIVE: 100,
// 	TRASH: 200,
// 	DELETED: 300,
// 

this.read = function(object) {
	try {
		return this.table.READ(object);
	} catch (e) {
		return util.parseError(e);
	}
};

this.createDigitalFile = function(object) {
	try {
		return this.table.CREATE(object);
	} catch (e) {
		return util.parseError(e);
	}
};

this.updateDigitalFile = function(object, where) {
	try {
		if (where !== undefined) {
			return this.table.UPDATEWHERE(object, where);
		}
		return this.table.UPDATE(object);
	} catch (e) {
		return util.parseError(e);
	}
};

this.deleteDigitalFile = function(object) {
	try {
		return this.updateDigitalFile(object);
	} catch (e) {
		return util.parseError(e);
	}
};

this.getFileByID = function(object) {
	try {
		return this.table.READ(object);
	} catch (e) {
		return util.parseError(e);
	}
};