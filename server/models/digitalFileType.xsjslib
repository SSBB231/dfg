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
	name: schema.default +'."DFG::DigitalFileType"',
	default_fields: 'common',
	fields: {
		id: new def_table.AutoField({
			name: 'ID',
			pk: true,
			auto: schema.default +'."DFG::DigitalFileType::ID".nextval',
			type: $.db.types.INTEGER
		}),
		iconFont: new def_table.Field({
			name: 'ICON_FONT',
			type: $.db.types.NVARCHAR,
			dimension: 100
		}),
		
		icon: new def_table.Field({
			name: 'ICON',
			type: $.db.types.NVARCHAR,
			dimension: 100
		})
    }

});
this.table = table;