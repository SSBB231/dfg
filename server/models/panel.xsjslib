$.import("timp.core.server.api","api");
var core_api = $.timp.core.server.api.api;
var util = core_api.util;
var def_table = core_api.table_lib;

//$.import('timp.schema.server.api','api');
//var schema_api = $.timp.schema.server.api.api;
//var schema = schema_api.schema;
var schema = core_api.schema;

var panelTable = new def_table.Table({
    component: "DFG",
	name: schema.default +'."DFG::Panel"',
	default_fields: "common",
	fields: {
		id: new def_table.AutoField({
			name: 'ID',
			pk: true,
			auto: schema.default +'."DFG::Panel::ID".nextval',
			type: $.db.types.INTEGER
		}),
		idDigitalFile: new def_table.Field({
		   name: "ID_DIGITAL_FILE",
		   type: $.db.types.INTEGER
		}),
		idReport: new def_table.Field({
		   name: "ID_REPORT",
		   type: $.db.types.INTEGER
		}),
		status: new def_table.Field({
		    name: "STATUS",
		    type: $.db.types.INTEGER
		})
    }
});
this.panelTable = panelTable;

this.readPanel = function(object) {
    if (typeof object === "number") {
        return this.panelTable.READ({
			where: [{
				field: "id",
				oper: "=",
				value: object
			}]
		})[0];
    }
    var options = this.getOptions(object);
    return this.panelTable.READ(options);
};
this.getPanelCounter = function(){
    return this.panelTable.READ({
        count: true,
        fields: ["type"],
        group_by: ["type","status"]
    });
};
this.createPanel = function(object) {
    var createOptions = {
        idDigitalFile: object.idDigitalFile || null,
        idReport: object.idReport || null,
        status: object.status || 1
	};
	return this.panelTable.CREATE(createOptions);
};
this.updatePanel = function(object, where) {
    var properties = Object.keys(this.panelTable.fields);
    var update = function(item,a){
        
        var options = {
            id: item.id || item.idPanel
        };
        for (var p = 0; p < properties.length; p++) {
            if (item[properties[p]]) {
                options[properties[p]] = item[properties[p]];
            }
        }
        if (where !== undefined) {
            return a.panelTable.UPDATEWHERE(options, where);
        }
        return a.panelTable.UPDATE(options);
    };
    if(Array.isArray(object.item)){
        var result = {};
        for(var i = 0; i < object.item.length; i++){
            result[object.item[i].id] = update(object.item[i],this);
        }
        return result;
    }else{
        return update(object.item,this);
    }
};
this.deletePanel = function(object) {
    if (typeof object === "number") {
        return this.panelTable.DELETE(object);
    }
    return this.panelTable.DELETEWHERE(object);
};

var panelJustifyTable = new def_table.Table({
    component: "DFG",
	name: schema.default + '."DFG::PanelJustify"',
	default_fields: "common",
	fields: {
		id: new def_table.AutoField({
			name: 'ID',
			pk: true,
			auto: schema.default + '."DFG::PanelJustify::ID".nextval',
			type: $.db.types.INTEGER
		}),
		justify: new def_table.Field({
		    name: "JUSTIFY",
		    type: $.db.types.NVARCHAR,
		    dimension: 255
		}),
		lang: new def_table.Field({
			name: 'LANG',
			type: $.db.types.NVARCHAR,
			dimension: 5
		})
    }
});
this.panelJustifyTable = panelJustifyTable;
this.readJustifyPanel = function(object) {
    if (typeof object === "number") {
        return this.panelJustifyTable.READ({
			where: [{
				field: "id",
				oper: "=",
				value: object
			}]
		})[0];
    }
    var options = this.getOptions(object);
    return this.panelJustifyTable.READ(options);
};
this.createJustifyPanel = function(object) {
    var createOptions = {
        justify: object.justify || ""
	};
	return this.panelJustifyTable.CREATE(createOptions);
};
this.updateJustifyPanel = function(object, where) {
    var properties = Object.keys(this.panelJustifyTable.fields);
    var options = {
        id: object.id
    };
    for (var i = 0; i < properties.length; i++) {
        if (object[properties[i]]) {
            options[properties[i]] = object[properties[i]];
        }
    }
    if (where !== undefined) {
        return this.panelJustifyTable.UPDATEWHERE(options, where);
    }
    return this.panelJustifyTable.UPDATE(options);
};

var panelCommentTable = new def_table.Table({
    component: "DFG",
	name: schema.default +'."DFG::PanelComment"',
	default_fields: "common",
	fields: {
		id: new def_table.AutoField({
			name: 'ID',
			pk: true,
			auto: schema.default +'."DFG::PanelComment::ID".nextval',
			type: $.db.types.INTEGER
		}),
		idPanel: new def_table.Field({
		   name: "ID_PANEL",
		   type: $.db.types.INTEGER
		}),
		idDigitalFile: new def_table.Field({
		   name: "ID_DIGITAL_FILE",
		   type: $.db.types.INTEGER
		}),
		idReport: new def_table.Field({
		   name: "ID_REPORT",
		   type: $.db.types.INTEGER
		}),
		comment: new def_table.Field({
		    name: "COMMENT",
		    type: $.db.types.TEXT
		})
    }
});
this.panelCommentTable = panelCommentTable;
this.readCommentPanel = function(object) {
    if (typeof object === "number") {
        return this.panelCommentTable.READ({
			where: [{
				field: "id",
				oper: "=",
				value: object
			}]
		})[0];
    }
    var options = this.getOptions(object);
    return this.panelTable.READ(options);
};
this.createCommentPanel = function(object) {
    if(Array.isArray(object.item)){
        var results = {};
        for(var i = 0; i < object.item.length; i++){
            results[object.item[i].idPanel] = this.panelCommentTable.CREATE({
                idPanel: object.item[i].idPanel || null,
                idDigitalFile: object.item[i].idDigitalFile || null,
                idReport: object.item[i].idReport || null,
                comment: object.item[i].comment || ""
            });
        }
        return results;
    }else{
        var createOptions = {
            idPanel: object.item.idPanel || null,
            idDigitalFile: object.item.idDigitalFile || null,
            idReport: object.item.idReport || null,
            comment: object.item.comment || ""
    	};
    	return this.panelCommentTable.CREATE(createOptions);
    }
};
this.updateCommentPanel = function(object, where) {
    var properties = Object.keys(this.panelTable.fields);
    var options = {
        id: object.id
    };
    for (var i = 0; i < properties.length; i++) {
        if (object[properties[i]]) {
            options[properties[i]] = object[properties[i]];
        }
    }
    if (where !== undefined) {
        return this.panelCommentTable.UPDATEWHERE(options, where);
    }
    return this.panelCommentTable.UPDATE(options);
};

var panelSettingTable = new def_table.Table({
    component: "DFG",
	name: schema.default +'."DFG::PanelSetting"',
	default_fields: "common",
	fields: {
		id: new def_table.AutoField({
			name: 'ID',
			pk: true,
			auto: schema.default +'."DFG::PanelSetting::ID".nextval',
			type: $.db.types.INTEGER
		}),
		idDigitalFileType: new def_table.Field({
		   name: "ID_DIGITAL_FILE_TYPE",
		   type: $.db.types.INTEGER
		}),
		idTax: new def_table.Field({
			name: 'ID_TAX',
			type: $.db.types.NCLOB
		}),
		description: new def_table.Field({
			name: "DESCRIPTION",
			type: $.db.types.NVARCHAR,
			dimension: 250
		}),
		link: new def_table.Field({
			name: "LINK",
			type: $.db.types.NVARCHAR,
			dimension: 250
		}),
		origin: new def_table.Field({
			name: 'ORIGIN',
            type: $.db.types.INTEGER,
            translate: {1 : 'DFG', 2 : 'EXTERNAL'}
		})
    }
});
this.panelSettingTable = panelSettingTable;
this.readPanelSetting = function(object) {
    if (typeof object === "number") {
        return this.panelSettingTable.READ({
			where: [{
				field: "id",
				oper: "=",
				value: object
			}]
		})[0];
    }
    var options = this.getOptions(object);
    return this.panelSettingTable.READ(options);
};
this.createPanelSetting = function(object) {
    var createOptions = {
        idTax: JSON.stringify(object.idTax) || "",
        idDigitalFileType: object.idDigitalFileType || null,
        origin: object.origin || null,
        description: object.description || "",
        link: object.link || ""
	};
	return this.panelSettingTable.CREATE(createOptions);
};
this.updatePanelSetting = function(object, where) {
    var properties = Object.keys(this.panelSettingTable.fields);
    var options = {
        id: object.id
    };
    for (var i = 0; i < properties.length; i++) {
        if (object[properties[i]]) {
            options[properties[i]] = object[properties[i]];
        }
    }
    if (where !== undefined) {
        return this.panelSettingTable.UPDATEWHERE(options, where);
    }
    return this.panelSettingTable.UPDATE(options);
};

var approvePanelTable = new def_table.Table({
    component: "DFG",
	name: schema.default +'."DFG::ApprovePanel"',
	default_fields: "common",
	fields: {
		id: new def_table.AutoField({
			name: 'ID',
			pk: true,
			auto: schema.default +'."DFG::ApprovePanel::ID".nextval',
			type: $.db.types.INTEGER
		}),
		idPanel: new def_table.Field({
		   name: "ID_PANEL",
		   type: $.db.types.INTEGER
		}),
		success: new def_table.Field({
		   name: "SUCCESS",
		   type: $.db.types.TINYINT
		}),
		comment: new def_table.Field({
		    name: "COMMENT",
		    type: $.db.types.TEXT
		}),
		status: new def_table.Field({
		    name: "STATUS",
		    type: $.db.types.INTEGER,
		    translate: {
		        1: 'GENERATED',
		        2: 'INTERRUPTED',
		        3: 'VALIDATING',
		        4: 'SIGNED',
		        5: 'PVA',
		        6: 'SIGNATURE',
		        7: 'TRANSMISSION',
		        8: 'SAVE'
		    }
		})
    }
});
this.approvePanelTable = approvePanelTable;
this.readApprovePanel = function(object) {
    if (typeof object === "number") {
        return this.approvePanelTable.READ({
			where: [{
				field: "id",
				oper: "=",
				value: object
			}]
		})[0];
    }
    var options = this.getOptions(object);
    return this.approvePanelTable.READ(options);
};
this.createApprovePanel = function(object) {
    var createOptions = {
        idPanel: object.idPanel || null,
        success: object.success || false,
        comment: object.comment || ""
	};
	return this.approvePanelTable.CREATE(createOptions);
};
this.updateApprovePanel = function(object, where) {
    var properties = Object.keys(this.approvePanelTable.fields);
    var options = {
        id: object.id
    };
    for (var i = 0; i < properties.length; i++) {
        if (object[properties[i]]) {
            options[properties[i]] = object[properties[i]];
        }
    }
    if (where !== undefined) {
        return this.approvePanelTable.UPDATEWHERE(options, where);
    }
    return this.approvePanelTable.UPDATE(options);
};

var panelStatusTable = new def_table.Table({
    component: "DFG",
	name: schema.default +'."DFG::PanelStatus"',
	default_fields: "common",
	fields: {
		id: new def_table.AutoField({
			name: 'ID',
			pk: true,
			auto: schema.default +'."DFG::PanelStatus::ID".nextval',
			type: $.db.types.INTEGER
		}),
		name: new def_table.Field({
		    name: "NAME",
		    type: $.db.types.NVARCHAR,
			dimension: 255
		})
    }
});
this.panelStatusTable = panelStatusTable;

var panelStatusTextTable = new def_table.Table({
    component: "DFG",
	name: schema.default +'."DFG::PanelStatusText"',
	default_fields: "common",
	fields: {
		id: new def_table.AutoField({
			name: 'ID',
			pk: true,
			auto: schema.default +'."DFG::PanelStatusText::ID".nextval',
			type: $.db.types.INTEGER
		}),
		name: new def_table.Field({
		    name: "NAME",
		    type: $.db.types.NVARCHAR,
			dimension: 255
		}),
		lang: new def_table.Field({
			name: 'LANG',
			type: $.db.types.NVARCHAR,
			dimension: 5
		}),
		idPanelStatus: new def_table.Field({
		   name: "ID_PANEL_STATUS",
		   type: $.db.types.INTEGER
		})
    }
});
this.panelStatusTextTable = panelStatusTextTable;

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
    if(object.order_by){
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