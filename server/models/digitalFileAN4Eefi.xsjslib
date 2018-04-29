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
	name: schema.default +'."DFG::AN4Eefi"',
	default_fields: 'common',
	fields: {
		id: new def_table.AutoField({
			name: 'ID',
			pk: true,
			auto: schema.default +'."DFG::AN4Eefi::ID".nextval',
			type: $.db.types.INTEGER
		}),
        idAN4: new def_table.Field({
			name: 'ID_AN4',
			type: $.db.types.INTEGER
		}),
		idCompany: new def_table.Field({
			name: 'ID_COMPANY',
			type: $.db.types.NVARCHAR,
			dimension: 4
		}),
		uf: new def_table.Field({
			name: 'UF',
			type: $.db.types.NVARCHAR,
            dimension: 4
		}),
        idBranch: new def_table.Field({
			name: 'ID_BRANCH',
			type: $.db.types.NVARCHAR,
			dimension: 4
		}),
		idTax: new def_table.Field({
			name: 'ID_TAX',
			type: $.db.types.NVARCHAR,
			dimension: 2
		}),
		month: new def_table.Field({
			name: 'MONTH',
			type: $.db.types.NVARCHAR,
			dimension: 2
		}),
		year: new def_table.Field({
			name: 'YEAR',
			type: $.db.types.NVARCHAR,
			dimension: 4
		}),
		subperiod: new def_table.Field({
			name: 'SUBPERIOD',
			type: $.db.types.NVARCHAR,
			dimension: 2
		})
    }
});
this.table = table;