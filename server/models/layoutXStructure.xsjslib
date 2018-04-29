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
	name: schema.default +'."DFG::LayoutXStructure"',
	default_fields: 'common',
	fields:{
	    id: new def_table.AutoField({
			name: 'ID',
			auto: schema.default +'."DFG::LayoutXStructure::ID".nextval',
			type: $.db.types.INTEGER
		}),
		idLayout: new def_table.Field({
            name: 'ID_LAYOUT',
            pk: true,
            type: $.db.types.INTEGER
        }),
		idStructure: new def_table.Field({
			name: 'ID_STRUCTURE',
		    pk: true,
            type: $.db.types.INTEGER
		})
    }

});
this.table = table;

this.readLayoutXStructure = function(object) {
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

this.createLayoutXStructure = function(object) {
    var createOptions = {
        idLayout: object.idLayout || null,
        idStructure: object.idStructure || null
	};
	return this.table.CREATE(createOptions);
};
 
this.updateLayoutXStructure = function(object, where) {
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

this.deleteLayoutXStructure = function(object) {
    if (typeof object === 'number') {
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