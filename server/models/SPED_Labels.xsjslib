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
	name: schema.default +'."DFG::SPED_Labels"',
	default_fields: 'common',
	fields:{
	    id: new def_table.AutoField({
			name: 'ID',
			auto: schema.default +'."DFG::SPED_Labels::ID".nextval',
			type: $.db.types.INTEGER
		}),
		key: new def_table.Field({
		    name: "KEY",
		    type: $.db.types.NVARCHAR,
		    dimension: 10
		}),
		usLabel: new def_table.Field({
		    name: "US_LABEL",
		    type: $.db.types.NVARCHAR,
		    dimension: 100
		}),
		brLabel: new def_table.Field({
		    name: "BR_LABEL",
		    type: $.db.types.NVARCHAR,
		    dimension: 100
		}),
		type: new def_table.Field({
		    name: "TYPE",
		    type: $.db.types.NVARCHAR,
		    dimension: 150
		})
    }
});
this.table = table;

this.getOptions = function(object) {
    var options = {};
    if (object.fields) {
        options.fields = object.fields;
    }
    if (object.where) {
        options.where = object.where;
    }
    if (object.join) {
        options.join = object.join;
    }
    if (object.count) {
        options.count = object.count;
    }
    if (object.group_by) {
        options.groupBy = object.group_by;
        options.group_by = object.group_by;
    }
    if (object.distinct) {
        options.distinct = object.distinct;
    }
    if (object.simulate) {
        options.simulate = object.simulate;
    }
    if (object.paginate) {
        options.paginate = object.paginate;
    }
    if (object.properties) {
        if (options.where === undefined) {
            options.where = [];
        }
        for (var i = 0; i < object.properties.length; i++) {
            options.where.push({
                field: object.properties[i].field,
                oper: object.properties[i].oper || "=",
                value: object.properties[i].value
            });
        }
    }
    return options;
}; 