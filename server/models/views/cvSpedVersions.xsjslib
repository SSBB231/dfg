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
    name: '"_SYS_BIC"."timp.dfg.modeling/CV_SPED_VERSION"',
    fields: {
        mandt: new view_lib.Field({
            name: "MANDT",
            type: $.db.types.NVARCHAR,
            dimension: 4
        }),
        spedVersion: new view_lib.Field({
            name: "VERSION_SPED",
            type: $.db.types.NVARCHAR,
            dimension: 4
        }),
        idReport: new view_lib.Field({
            name: "ID_REPORT",
            type: $.db.types.INTEGER
        }),
        spedRecord: new view_lib.Field({
            name: "RECORD",
            type: $.db.types.NVARCHAR,
            dimension: 4
        }),
        validFrom: new view_lib.Field({
            name: "VALID_FROM",
            type: $.db.types.NVARCHAR,
            dimension: 8
        }),
        validTo: new view_lib.Field({
            name: "VALID_TO",
            type: $.db.types.NVARCHAR,
            dimension: 8
        })
    }
});
this.table = table;