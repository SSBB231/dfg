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
	name: schema.default +'."DFG::AN4Favorite"',
	default_fields: 'common',
	fields: {
		id: new def_table.AutoField({
			name: 'ID',
			pk: true,
			auto: schema.default +'."DFG::AN4Favorite::ID".nextval',
			type: $.db.types.INTEGER
		}),
        idAN4: new def_table.Field({
			name: 'ID_AN4',
			type: $.db.types.INTEGER
		}),
		creationDate: new def_table.AutoField({
            name: 'CREATION_DATE',
            auto: 'NOW()',
            update: false,
            type: $.db.types.TIMESTAMP
        }),
        creationUser: new def_table.Field({
            name: 'CREATION_USER',
            update: false,
            type: $.db.types.NVARCHAR,
            dimension: 128
        })
    }
});
this.table = table;