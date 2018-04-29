$.import("timp.core.server.api", "api");
var coreApi = $.timp.core.server.api.api;
var util = coreApi.util;
var defTable = coreApi.table_lib;

//$.import('timp.schema.server.api','api');
//var schemaApi = $.timp.schema.server.api.api;
//var schema = schemaApi.schema;
var schema = coreApi.schema;

var table = new defTable.Table({
    component: "DFG",
    name: schema.default + '."DFG::SPED"',
    default_fields: "common",
    fields: {
        id: new defTable.AutoField({
            name: 'ID',
            pk: true,
            auto: schema.default + '."DFG::SPED::ID".nextval',
            type: $.db.types.INTEGER
        }),
        name: new defTable.Field({
            name: 'NAME',
            type: $.db.types.NVARCHAR,
            dimension: 100
        }),
        description: new defTable.Field({
            name: 'DESCRIPTION',
            type: $.db.types.NVARCHAR,
            dimension: 250
        }),
        type: new defTable.Field({
            name: 'TYPE',
            type: $.db.types.INTEGER,
            translate: {
                1: 'EFD ICMS / IPI',
                2: 'EFD Contributions',
                3: 'ECD',
                4: 'ECF',
                5: "REINF"
            }
        }),
        idLayout: new defTable.Field({
            name: "ID_LAYOUT",
            type: $.db.types.INTEGER
        }),
        idLayoutVersion: new defTable.Field({
            name: 'ID_LAYOUT_VERSION',
            type: $.db.types.INTEGER
        }),
        validFrom: new defTable.Field({
            name: 'VALID_FROM',
            type: $.db.types.TIMESTAMP
        }),
        validTo: new defTable.Field({
            name: 'VALID_TO',
            type: $.db.types.TIMESTAMP
        }),
        status: new defTable.Field({
            name: "STATUS",
            type: $.db.types.INTEGER,
            translate: {
                1: 'ACTIVE',
                2: 'TRASH',
                3: 'DELETED'
            }
        })
    }
});
this.table = table;

var runSPEDTable = new defTable.Table({
    component: "DFG",
    name: schema.default + '."DFG::SPEDXRun"',
    default_fields: "common",
    fields: {
        id: new defTable.AutoField({
            name: "ID",
            pk: true,
            auto: schema.default + '."DFG::SPEDXRun::ID".nextval',
            type: $.db.types.INTEGER
        }),
        idSped: new defTable.Field({
            name: "SPED_ID",
            type: $.db.types.INTEGER
        }),
        idRun: new defTable.Field({
            name: "RUN_ID",
            type: $.db.types.NVARCHAR,
            dimension: 32
        })
    }
});

var runXTask = new defTable.Table({
    component: "DFG",
    name: schema.default + '."DFG::RunXTask"',
    default_fields: "common",
    fields: {
        id: new defTable.AutoField({
            name: "ID",
            pk: true,
            auto: schema.default + '."DFG::RunXTask::ID".nextval',
            type: $.db.types.INTEGER
        }),
        idTask: new defTable.Field({
            name: "TASK_ID",
            type: $.db.types.INTEGER
        }),
        idProcess: new defTable.Field({
            name: "PROCESS_ID",
            type: $.db.types.INTEGER
        }),
        idRun: new defTable.Field({
            name: "RUN_ID",
            type: $.db.types.NVARCHAR,
            dimension: 32
        })
    }
});

var eSocialTable = new defTable.Table({
    component: "DFG",
    name: schema.default + '."DFG::E_SOCIAL_CHECKED"',
    fields: {
        id: new defTable.AutoField({
            name: "ID",
            pk: true,
            auto: schema.default + '."DFG::E_SOCIAL_CHECKED::ID".nextval',
            type: $.db.types.INTEGER
        }),
        eSocialId: new defTable.Field({
            name: "E_SOCIAL_ID",
            type: $.db.types.INTEGER
        }),
        eSocialType: new defTable.Field({
            name: "E_SOCIAL_TYPE",
            type: $.db.types.TINYINT,
            translate: {
                1: 'INSERT',
                2: 'ALTER',
                3: 'EXCLUDE'
            }
        }),
        date: new defTable.Field({
            name: "DATE",
            type: $.db.types.DATE
        })
    }
});
this.eSocialTable = eSocialTable;

runXTask.createRunTask = function(object) {
    if (object.hasOwnProperty("idTask") && object.idTask && object.hasOwnProperty("idRun") && object.idRun) {
        var where = [{
            field: 'idTask',
            oper: '=',
            value: object.idTask
        }];
        if (runXTask.READ({
                where: where
            }).length === 0) {
            return runXTask.CREATE(object);
        } else {
            return runXTask.UPDATEWHERE(object, where);
        }
    }

};
this.runXTaskTable = runXTask;

this.readSPED = function(object) {
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

this.getSPEDCounter = function() {
    return this.table.READ({
        count: true,
        fields: ["type"],
        group_by: ["type", "status"]
    });
};

this.verifyTypeFiles = function(type) {
    var result = this.table.READ({
        fields: ["id"],
        where: [{
            field: 'type',
            oper: "=",
            value: type
        }]
    });
    if (result.length === 0) {
        return false;
    }
    return true;
};

this.createSPED = function(object) {
    var createOptions = {
        name: object.name || null,
        description: object.description || null,
        idLayout: object.idLayout || null,
        idLayoutVersion: object.idLayoutVersion || null,
        type: object.type || null,
        status: object.status || 1,
        validFrom: object.validFrom || null,
        validTo: object.validTo || null
    };
    return this.table.CREATE(createOptions);
};

this.updateSPED = function(object, where) {
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

this.deleteSPED = function(object) {
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

runSPEDTable.createRun = function(object) {
    if (object.idTask) {
        runXTask.createRunTask({
            idRun: object.idRun,
            idTask: object.idTask
        });
        delete object.idTask;
    }

    return runSPEDTable.CREATE(object);
};
this.runSPEDTable = runSPEDTable;