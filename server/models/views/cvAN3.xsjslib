$.import('timp.core.server.api', 'api');
var core_api = $.timp.core.server.api.api;
var util = core_api.util;
var sql = core_api.sql;
var view_lib = core_api.view_lib;

// $.import('timp.schema.server.api','api');
// var schema_api = $.timp.schema.server.api.api;
// var schema = schema_api.schema;
var schema = core_api.schema;

var table = new view_lib.View({
	component: 'DFG',
	name: '"_SYS_BIC"."timp.dfg.modeling/CV_AN3"',
	fields: {
		id: new view_lib.Field({
			name: "ID",
			type: $.db.types.INTEGER
		}),
		idLayoutVersion: new view_lib.Field({
			name: "ID_LAYOUT_VERSION",
			type: $.db.types.INTEGER
		}),
		bfbLayoutName: new view_lib.Field({
			name: "BFB_LAYOUT_NAME",
			type: $.db.types.NVARCHAR,
			dimension: 100
		}),
		idBFBLayout: new view_lib.Field({
			name: "ID_BFB_LAYOUT",
			type: $.db.types.INTEGER
		}),
		digitalFileName: new view_lib.Field({
			name: "DIGITAL_FILE_NAME",
			type: $.db.types.NVARCHAR,
			dimension: 100
		}),
		idDigitalFile: new view_lib.Field({
			name: "ID_DIGITAL_FILE",
			type: $.db.types.INTEGER
		}),
		idExternalFile: new view_lib.Field({
			name: "ID_EXTERNAL_FILE",
			type: $.db.types.INTEGER
		}),
		externalFileName: new view_lib.Field({
			name: "EXTERNAL_FILE_NAME",
			type: $.db.types.NVARCHAR,
			dimension: 100
		}),
		idCoreFile: new view_lib.Field({
			name: "ID_CORE_FILE",
			type: $.db.types.INTEGER
		}),
		idFolder: new view_lib.Field({
			name: "ID_FOLDER",
			type: $.db.types.INTEGER
		}),

		idDigitalFileType: new view_lib.Field({
			name: "ID_DIGITAL_FILE_TYPE",
			type: $.db.types.INTEGER
		}),
		idSettingVersion: new view_lib.Field({
			name: "ID_SETTING_VERSION",
			type: $.db.types.INTEGER
		}),
		isSPED: new view_lib.Field({
		    name: "IS_SPED",
		    type: $.db.types.INTEGER
		}),
		status: new view_lib.Field({
			name: "STATUS",
			type: $.db.types.TINYINT,
			translate: {
				0: 'Standard',
				1: 'Active',
				2: 'Trash',
				3: 'Deleted',
				4: 'Public'
			}
		}),
		origin: new view_lib.Field({
			name: "ORIGIN",
			type: $.db.types.INTEGER,
			translate: {
				1: 'DFG',
				2: 'EXTERNAL'
			}
		}),
		name: new view_lib.Field({
			name: "NAME",
			type: $.db.types.NVARCHAR,
			dimension: 100
		}),
		description: new view_lib.Field({
			name: "DESCRIPTION",
			type: $.db.types.NVARCHAR,
			dimension: 250
		}),
		creationIdUser: new view_lib.Field({
			name: "CREATION_ID_USER",
			type: $.db.types.INTEGER
		}),
		creationUser: new view_lib.Field({
			name: "CREATION_USER",
			type: $.db.types.NVARCHAR,
			dimension: 50
		}),
		modificationIdUser: new view_lib.Field({
			name: "MODIFICATION_ID_USER",
			type: $.db.types.INTEGER
		}),
		modificationUser: new view_lib.Field({
			name: "MODIFICATION_USER",
			type: $.db.types.NVARCHAR,
			dimension: 50
		}),
		creationDate: new view_lib.Field({
			name: "CREATION_DATE",
			type: $.db.types.TIMESTAMP
		}),
		modificationDate: new view_lib.Field({
			name: "MODIFICATION_DATE",
			type: $.db.types.TIMESTAMP
		}),
		month: new view_lib.Field({
			name: 'MONTH',
			type: $.db.types.NVARCHAR,
			dimension: 2
		}),

		year: new view_lib.Field({
			name: 'YEAR',
			type: $.db.types.NVARCHAR,
			dimension: 4
		}),
		subperiod: new view_lib.Field({
			name: 'SUBPERIOD',
			type: $.db.types.NVARCHAR,
			dimension: 2
		}),
		idCompany: new view_lib.Field({
			name: 'ID_COMPANY',
			type: $.db.types.NVARCHAR,
			dimension: 4
		}),
		uf: new view_lib.Field({
			name: 'UF',
			type: $.db.types.NVARCHAR,
			dimension: 2
		}),
		idBranch: new view_lib.Field({
			name: 'ID_BRANCH',
			type: $.db.types.NVARCHAR,
			dimension: 4
		}),
		idTax: new view_lib.Field({
			name: 'ID_TAX',
			type: $.db.types.NVARCHAR,
			dimension: 3
		})

	}
});
this.table = table;