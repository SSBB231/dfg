 $.import("timp.core.server.api","api");
var core_api = $.timp.core.server.api.api;
var util = core_api.util;
var def_table = core_api.table_lib;

//$.import('timp.schema.server.api','api');
//var schema_api = $.timp.schema.server.api.api;
//var schema = schema_api.schema;
var schema = core_api.schema;

var an3Table = new def_table.Table({
    component: "DFG",
	name: schema.default +'."DFG::AN3"',
	default_fields: "common",
	fields: {
		id: new def_table.AutoField({
			name: 'ID',
			pk: true,
			auto: schema.default +'."DFG::AN3::ID".nextval',
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
		idLayoutVersion: new def_table.Field({
			name: 'ID_LAYOUT_VERSION',
			type: $.db.types.INTEGER
		}),
        origin: new def_table.Field({
			name: 'ORIGIN',
            type: $.db.types.INTEGER,
            translate: {1 : 'DFG', 2 : 'EXTERNAL'}
		})
    }
});
this.an3Table = an3Table;

var an3XBFBLayout = new def_table.Table({
    component: "DFG",
    name: schema.default +'."DFG::AN3XBFBLayout"',
    default_fields: "common",
    fields: {
        id: new def_table.AutoField({
            name: 'ID',
            pk: true,
            auto: schema.default +'."DFG::AN3XBFBLayout::ID".nextval',
            type: $.db.types.INTEGER
        }),
        idBFBLayout: new def_table.Field({
            name: 'ID_BFB_LAYOUT',
            type: $.db.types.INTEGER
        }),
        idAN3: new def_table.Field({
            name: 'ID_AN3',
            type: $.db.types.INTEGER
        })
    }
});
this.an3XBFBLayout = an3XBFBLayout;

var an3XDigitalFile = new def_table.Table({
    component: "DFG",
    name: schema.default +'."DFG::AN3XDigitalFile"',
    default_fields: "common",
    fields: {
        id: new def_table.AutoField({
            name: 'ID',
            pk: true,
            auto: schema.default +'."DFG::AN3XDigitalFile::ID".nextval',
            type: $.db.types.INTEGER
        }),
        idDigitalFile: new def_table.Field({
            name: 'ID_DIGITAL_FILE',
            type: $.db.types.INTEGER
        }),
        idAN3: new def_table.Field({
            name: 'ID_AN3',
            type: $.db.types.INTEGER
        })
    }
});

this.an3XDigitalFile = an3XDigitalFile;
var an3XExternalFile = new def_table.Table({
    component: "DFG",
    name: schema.default +'."DFG::AN3XExternalFile"',
    default_fields: "common",
    fields: {
        id: new def_table.AutoField({
            name: 'ID',
            pk: true,
            auto: schema.default +'."DFG::AN3XExternalFile::ID".nextval',
            type: $.db.types.INTEGER
        }),
        idAN3: new def_table.Field({
            name: 'ID_AN3',
            type: $.db.types.INTEGER
        }),
        externalFileName: new def_table.Field({
            name: "EXTERNAL_FILE_NAME",
            type: $.db.types.NVARCHAR,
            dimension: 100
        }),
        externalFile: new def_table.Field({
            name: 'EXTERNAL_FILE',
            type: $.db.types.NCLOB
        })
    }
});
this.an3XExternalFile = an3XExternalFile;
var an3XRule = new def_table.Table({
    component: "DFG",
    name: schema.default +'."DFG::AN3XRule"',
    default_fields: "common",
    fields: {
        id: new def_table.AutoField({
            name: 'ID',
            pk: true,
            auto: schema.default +'."DFG::AN3XRule::ID".nextval',
            type: $.db.types.INTEGER
        }),
        idAN3: new def_table.Field({
            name: 'ID_AN3',
            type: $.db.types.INTEGER
        }),
        idRule: new def_table.Field({
            name: 'ID_RULE',
            type: $.db.types.INTEGER
        })
    }
});
this.an3XRule = an3XRule;

var an3Report = new def_table.Table({
    component: "DFG",
    name: schema.default +'."DFG::AN3Report"',
    default_fields: "common",
    fields: {
        id: new def_table.AutoField({
            name: 'ID',
            pk: true,
            auto: schema.default +'."DFG::AN3Report::ID".nextval',
            type: $.db.types.INTEGER
        }),
        idAN3: new def_table.Field({
            name: 'ID_AN3',
            type: $.db.types.INTEGER
        }),
        name: new def_table.Field({
            name: 'NAME',
            type: $.db.types.NVARCHAR,
            dimension: 50
        }),
        description: new def_table.Field({
            name: 'DESCRIPTION',
            type: $.db.types.NVARCHAR,
            dimension: 150
        }),
        report: new def_table.Field({
            name: "REPORT",
            type: $.db.types.NCLOB
        })
    }
});
this.an3Report = an3Report;
this.an3Report.createAN3Report = function(object){
    var createOptions = {
        name: object.name || null,
        description: object.description || null,
        idAN3: object.idAN3 || null,
        report: object.report || null
    };
    var report = this.CREATE(createOptions);
    return report;
};
this.readAN3 = function(object) {
    if (typeof object === "number") {
        return this.an3Table.READ({
			where: [{
				field: "id",
				oper: "=",
				value: object
			}]
		})[0];
    }
    var options = this.getOptions(object);
    return this.an3Table.READ(options);
};

this.createAN3 = function(object) {
    var createOptions = {
        name: object.name || null,
        description: object.description || null,
        idLayoutVersion: object.idLayoutVersion || null,
        origin: object.origin || null
	};
	var an3 = this.an3Table.CREATE(createOptions);
	if(object.hasOwnProperty("idBFBLayout") && object.idBFBLayout){
	    var createOptionsAN3XBFB = {
	        idAN3: an3.id,
	        idBFBLayout: object.idBFBLayout
	    };
	    an3.AN3XBFB = this.an3XBFBLayout.CREATE(createOptionsAN3XBFB);
	}
	if(object.hasOwnProperty("externalFile") && object.externalFile && object.externalFile !== ""){
	    var createOptionsAN3XExternalFile = {
	        idAN3: an3.id,
	        externalFile: object.externalFile || null,
	        externalFileName: object.externalFileName || null
	    };
	    an3.AN3XExternalFile = this.an3XExternalFile.CREATE(createOptionsAN3XExternalFile);
	}
	if(object.hasOwnProperty("idDigitalFile") && object.idDigitalFile){
	    var createOptionsAN3XDigitalFile = {
	        idAN3: an3.id,
	        idDigitalFile: object.idDigitalFile
	    };
	    an3.AN3XDigitalFile = this.an3XDigitalFile.CREATE(createOptionsAN3XDigitalFile);
	}
	if(object.hasOwnProperty("idRules") && object.idRules){
	    var createOptionsAN3XRule = {
	        idAN3: an3.id
	    };
	    an3.AN3XRules = [];
	    for(var i = 0 ; i  < object.idRules.length; i++){
	        createOptionsAN3XRule.idRule = object.idRules[i];
	        an3.AN3XRules.push(this.an3XRule.CREATE(createOptionsAN3XRule));
	    }
	}
	return an3;
};
 
this.updateAN3 = function(object, where) {
    var properties = Object.keys(this.an3Table.fields);
    var options = {
        id: object.id
    };
    for (var i = 0; i < properties.length; i++) {
        if (object[properties[i]]) {
            options[properties[i]] = object[properties[i]];
        }
    }
    if (where !== undefined) {
        return this.an3Table.UPDATEWHERE(options, where);
    }
    return this.an3Table.UPDATE(options);
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