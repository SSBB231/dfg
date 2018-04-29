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
	name: schema.default +'."DFG::LayoutVersion"',
	default_fields: 'common',
	fields: {
		id: new def_table.AutoField({
			name: 'ID',
			auto: schema.default +'."DFG::LayoutVersion::ID".nextval',
			type: $.db.types.INTEGER,
			pk: true
		}),
		idLayout: new def_table.Field({
			name: 'ID_LAYOUT',
			type: $.db.types.INTEGER
		}),
		json: new def_table.Field({
			name: 'JSON',
			type: $.db.types.NCLOB
		}),
		backupJson: new def_table.Field({
			name: 'BACKUP_JSON',
			type: $.db.types.NCLOB
		}),
		version: new def_table.Field({
            name: 'VERSION',
            type: $.db.types.NVARCHAR,
			dimension: 100
        }),
        validityStart: new def_table.Field({
            name: 'VALIDITY_START',
            type: $.db.types.TIMESTAMP
        }),
        validityFinish: new def_table.Field({
            name: 'VALIDITY_FINISH',
            type: $.db.types.TIMESTAMP
        }),
        description: new def_table.Field({
			name: 'DESCRIPTION',
			type: $.db.types.NVARCHAR,
			dimension: 250
		}),
		idDigitalFile: new def_table.Field({
			name: 'ID_DIGITAL_FILE',
			type: $.db.types.INTEGER
		})
	}
});
this.table = table;

this.readLayoutVersion = function(object) {
    if (typeof object === "number") {
        return this.table.READ({
			where: [{
				field: 'id',
				oper: '=',
				value: object
			}]
		})[0];
    }
    var options = this.getOptions(object);
    return this.table.READ(options);
};

this.createLayoutVersion = function(object) {
    
	if (object.hasOwnProperty("validityStart")) {
	    if(object.validityStart !== null){
	        object.validityStart = new Date(object.validityStart.toString());
	    }
	}
	if (object.hasOwnProperty("validityFinish")) {
	    if(object.validityFinish !== null){
		    object.validityFinish = new Date(object.validityFinish.toString());
	    }
	}
    var createOptions = {
        idLayout: object.idLayout || null,
        json: object.json || null,
        version: object.version || null,
        validityStart: object.validityStart || null,
        validityFinish: object.validityFinish || null,
        description: object.description || null,
        idDigitalFile: object.idDigitalFile || null
	};
	return this.table.CREATE(createOptions);
};
 
this.updateLayoutVersion = function(object, where) {
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

this.deleteLayoutVersion = function(object) {
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
    if (object.top) {
        options.top = object.top;
    }
    if (object.group_by) {
        options.groupBy = object.group_by;
        options.group_by = object.group_by;
    }
    if (object.order_by) {
        options.orderBy = object.order_by;
        options.order_by = object.order_by;
    }
    if (object.descending) {
        options.descending = object.descending;
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
                oper: object.properties[i].oper || '=',
                value: object.properties[i].value
            });
        }
    }
    return options;
};