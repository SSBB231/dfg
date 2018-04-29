$.import("timp.core.server.api","api");
var core_api = $.timp.core.server.api.api;
var util = core_api.util;
var def_table = core_api.table_lib;

//$.import('timp.schema.server.api','api');
//var schema_api = $.timp.schema.server.api.api;
//var schema = schema_api.schema;
var schema = core_api.schema;

var table = new def_table.Table({
    component: "DFG",
	name: schema.default +'."DFG::AN4"',
	default_fields: "common",
	fields: {
		id: new def_table.AutoField({
			name: 'ID',
			pk: true,
			auto: schema.default +'."DFG::AN4::ID".nextval',
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
		idLeftFile: new def_table.Field({
			name: 'ID_LEFT_FILE',
			type: $.db.types.INTEGER
		}),
        idRightFile: new def_table.Field({
			name: 'ID_RIGHT_FILE',
			type: $.db.types.INTEGER
		}),
		idRule: new def_table.Field({
			name: 'ID_RULE',
			type: $.db.types.INTEGER
		}),
		digitalFile: new def_table.Field({
			name: 'DIGITAL_FILE',
			type: $.db.types.NCLOB
		}),
		status: new def_table.Field({
			name: 'STATUS',
			type: $.db.types.NVARCHAR,
			dimension: 3
		})
    }
});
this.table = table;

this.readAN4 = function(object) {
    if (typeof object === "number") {
        return this.table.READ({
			where: [{
				field: "id",
				oper: "=",
				value: object
			}]
		})[0];
    }
    var options = this.getOptions(object);
    return this.table.READ(options);
};

this.createAN4 = function(object) {
    var createOptions = {
        name: object.name || null,
        description: object.description || null,
        idLeftFile: object.idLeftFile || null,
        idRightFile: object.idRightFile || null,
        idRule: object.idRule || null,
        digitalFile: object.digitalFile || null,
        status: object.status || null
	};
	return this.table.CREATE(createOptions);
};
 
this.updateAN4 = function(object, where) {
    var properties = Object.keys(this.table.fields);
    var options = {
        id: object.id
    };
    for (var i = 0; i < properties.length; i++) {
        if (object[properties[i]]) {
            options[properties[i]] = object[properties[i]];
        }
    }
    if (where !== undefined) {
        return this.table.UPDATEWHERE(options, where);
    }
    return this.table.UPDATE(options);
};

this.deleteAN4 = function(object) {
    if (typeof object === "number") {
        return this.table.DELETE(object);
    }
    return this.table.DELETEWHERE(object);
};

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
    if (object.order_by) {
        options.order_by = object.order_by;
        options.orderBy = object.order_by;
    }
    if (object.group_by) {
        options.groupBy = object.group_by;
        options.group_by = object.group_by;
    }
    if (object.distinct) {
        options.distinct = object.distinct;
    }
    if (object.paginate) {
        options.paginate = object.paginate;
    }
    if (object.simulate) {
        options.simulate = object.simulate;
    }
    if (object.properties) {
        if (options.where === undefined) {
            options.where = [];
        }
        for (var i = 0; i < object.properties.length; i++) {
            options.where.push({
                field: object.properties[i].field,
                oper: object.properties[i].oper || '=',
                value: object.properties[i].value
            });
        }
    }
    return options;
};