$.import("timp.core.server.api","api");
var core_api = $.timp.core.server.api.api;
var util = core_api.util;
var def_table = core_api.table_lib;

//$.import('timp.schema.server.api','api');
//var schema_api = $.timp.schema.server.api.api;
//var schema = schema_api.schema;
var schema = core_api.schema;

var table = new def_table.Table({
    component: 'DFG',
	name: schema.default +'."DFG::DigitalFileTypeText"',
	default_fields: 'common',
	fields:{
	    id: new def_table.AutoField({
			name: 'ID',
			pk:true,
			auto: schema.default +'."DFG::DigitalFileTypeText::ID".nextval',
			type: $.db.types.INTEGER
		}),
        idDigitalFileType: new def_table.Field({
			name: 'ID_DIGITAL_FILE_TYPE',
			type: $.db.types.INTEGER
		}),
        name: new def_table.Field({
			name: 'NAME',
			type: $.db.types.NVARCHAR,
			dimension: 100
		}),
		description: new def_table.Field({
			name: 'DESCRIPTION',
			type: $.db.types.NVARCHAR,
			dimension: 250
		}),
		lang: new def_table.Field({
			name: 'LANG',
			type: $.db.types.NVARCHAR,
			dimension: 5
		})
    }
});
this.table = table;