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
	name: schema.default +'."DFG::SPED_TDFTables"',
	default_fields: 'common',
	fields:{
	    id: new def_table.AutoField({
			name: 'ID',
			pk:true,
			auto: schema.default +'."DFG::SPED_TDFTables::ID".nextval',
			type: $.db.types.INTEGER
		}),
        registerName: new def_table.Field({
			name: 'REGISTER_NAME',
			type: $.db.types.NVARCHAR,
			pk:true,
			dimension: 10
		}), 
        tdfTable: new def_table.Field({
			name: 'TDF_TABLE',
			type: $.db.types.NVARCHAR,
			dimension: 50
		})
    }
});
this.table = table;