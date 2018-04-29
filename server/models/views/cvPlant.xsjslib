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
    name: '"_SYS_BIC"."timp.dfg.modeling/CV_PLANT"',
    fields: {
        mandt: new view_lib.Field({
            name: "MANDT",
            type: $.db.types.NVARCHAR,
            dimension: 4
        }),
        plantName: new view_lib.Field({
            name: "PLANT_NAME",
            type: $.db.types.NVARCHAR,
            dimension: 30
        }),
        idPlant: new view_lib.Field({
            name: "ID_PLANT",
            type: $.db.types.NVARCHAR,
            dimension: 4
        }),
        uf: new view_lib.Field({
            name: "UF",
            type: $.db.types.NVARCHAR,
            dimension: 4
        }),
        idBranch: new view_lib.Field({
            name: "ID_BRANCH",
            type: $.db.types.NVARCHAR,
            dimension: 4
        }),
        idCompany: new view_lib.Field({
            name: "ID_COMPANY",
            type: $.db.types.NVARCHAR,
            dimension: 4
        }),
        fiscalState: new view_lib.Field({
            name: "STATE_INSC",
            type: $.db.types.NVARCHAR,
            dimension: 18
        })
    }
});
this.table = table;