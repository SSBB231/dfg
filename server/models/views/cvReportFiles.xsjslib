 $.import('timp.core.server.api', 'api');
var core_api = $.timp.core.server.api.api;
var util = core_api.util;
var sql = core_api.sql;
var view_lib = core_api.view_lib;

// $.import('timp.schema.server.api','api');
// var schema_api = $.timp.schema.server.api.api;
// var schema = schema_api.schema;
var schema = core_api.schema;


var table = new view_lib.View({
    component: 'DFG',
    name: '"_SYS_BIC"."timp.dfg.modeling/CV_REPORT_FILES"',
    fields: {
        
        idRun: new view_lib.Field({
            name: "RUN_ID",
            type: $.db.types.NVARCHAR,
            dimension: 32
        }),
        id: new view_lib.Field({
            name: "FILE_ID",
            type: $.db.types.NVARCHAR,
            dimension: 32
        }),
         idFile: new view_lib.Field({
            name: "FILE_ID",
            type: $.db.types.NVARCHAR,
            dimension: 32
        }),
        idTask: new view_lib.Field({
            name: "TASK_ID",
            type: $.db.types.INTEGER
        }),
        idProcess: new view_lib.Field({
            name: "PROCESS_ID",
            type: $.db.types.INTEGER
        }),
        reportKey: new view_lib.Field({
            name: "REPORT_KEY",
            type: $.db.types.NVARCHAR,
            dimension: 255
        }),
        fileName: new view_lib.Field({
            name: "FILENAME",
            type: $.db.types.NVARCHAR,
            dimension: 100
        }),
        description: new view_lib.Field({
           name: "DESCRIPTION",
           type: $.db.types.NVARCHAR,
           dimension: 100
        }),
        idCompany: new view_lib.Field({
            name: "ID_COMPANY",
            type: $.db.types.NVARCHAR,
            dimension: 4
        }),
        idBranch: new view_lib.Field({
            name: "ID_BRANCH",
            type: $.db.types.NVARCHAR,
            dimension: 4
        }),
        cnpj:   new view_lib.Field({
           name: "CNPJ_ROOT",
           type: $.db.types.NVARCHAR,
           dimension: 8
        }),
        fiscalState: new view_lib.Field({
            name: "IE",
            type: $.db.types.NVARCHAR,
            dimension: 18
        }),
        centralEFD: new view_lib.Field({
            name: "CENTRAL_EFD",
            type: $.db.types.NVARCHAR,
            dimension: 20
        }),
        initPeriod: new view_lib.Field({
            name: "PERIOD_INI",
            type: $.db.types.NVARCHAR,
            dimension: 8
        }),
        endPeriod: new view_lib.Field({
            name: "PERIOD_FIN",
            type: $.db.types.NVARCHAR,
            dimension: 8
        })
    }
});
this.table = table;