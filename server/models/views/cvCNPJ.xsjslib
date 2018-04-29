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
    name: '"_SYS_BIC"."timp.dfg.modeling/CV_CNPJ"',
    fields: {
        mandt: new view_lib.Field({
            name: "MANDT",
            type: $.db.types.NVARCHAR,
            dimension: 4
        }),
        cnpjRoot: new view_lib.Field({
            name: "CNPJ_ROOT",
            type: $.db.types.NVARCHAR,
            dimension: 8
        }),
        cnpj: new view_lib.Field({
            name: "CNPJ",
            type: $.db.types.NVARCHAR,
            dimension: 14
        }),
        idCompany: new view_lib.Field({
            name: "ID_COMPANY",
            type: $.db.types.NVARCHAR,
            dimension:4
        }),
        uf: new view_lib.Field({
            name: "UF",
            type: $.db.types.NVARCHAR,
            dimension: 3
        }),
        idBranch: new view_lib.Field({
            name: "ID_BRANCH",
            type: $.db.types.NVARCHAR,
            dimension: 4
        }),
        ie: new view_lib.Field({
            name: "IE",
            type: $.db.types.NVARCHAR,
            dimension: 18
        }),
        validFrom: new view_lib.Field({
            name: "VALID_FROM",
            type: $.db.types.NVARCHAR,
            dimension: 4
        }),
        validTo: new view_lib.Field({
            name: "VALID_TO",
            type: $.db.types.NVARCHAR,
            dimension: 4
        }),
        ecfType: new view_lib.Field({
            name: "TIP_ECF",
            type: $.db.types.NVARCHAR,
            dimension: 1
        }),
        codSCP: new view_lib.Field({
            name: "COD_SCP",
            type: $.db.types.NVARCHAR,
            dimension: 14
        }),
        AFCI: new view_lib.Field({
            name: "IND_ADM_FUN_CLU",
            type: $.db.types.NVARCHAR,
            dimension: 1
        }),
        aliqCSLL: new view_lib.Field({
            name: "IND_ALIQ_CSLL",
            type: $.db.types.NVARCHAR,
            dimension: 1
        }),
        freeCommerceArea: new view_lib.Field({
            name: "IND_AREA_COM",
            type: $.db.types.NVARCHAR,
            dimension: 1
        }),
        exteriorActive: new view_lib.Field({
            name: "IND_ATIV_EXT",
            type: $.db.types.NVARCHAR,
            dimension: 1
        }),
        ruralActive: new view_lib.Field({
            name: "IND_ATIV_RURAL",
            type: $.db.types.NVARCHAR,
            dimension: 1
        }),
        computerTraining: new view_lib.Field({
            name: "IND_CAP_INF",
            type: $.db.types.NVARCHAR,
            dimension: 1
        }),
        comercialExport: new view_lib.Field({
            name: "IND_COM_EXP",
            type: $.db.types.NVARCHAR,
            dimension:1
        }),
        donationsCampaigns: new view_lib.Field({
            name: "IND_DOA_ELEIT",
            type: $.db.types.NVARCHAR,
            dimension: 1
        }),
        eCommerce: new view_lib.Field({
            name: "IND_E_COM_TI",
            type: $.db.types.NVARCHAR,
            dimension: 1
        }),
        existanceFin: new view_lib.Field({
            name: "IND_FIN",
            type: $.db.types.NVARCHAR,
            dimension: 1
        }),
        technologyInnovation: new view_lib.Field({
            name: "IND_INOV_TEC",
            type: $.db.types.NVARCHAR,
            dimension: 1
        }),
        explorationProfit: new view_lib.Field({
            name: "IND_LUC_EXP",
            type: $.db.types.NVARCHAR,
            dimension: 1
        }),
        exteriorOperations: new view_lib.Field({
            name: "IND_OP_EXT",
            type: $.db.types.NVARCHAR,
            dimension: 1
        }),
        linkedOperations: new view_lib.Field({
            name: "IND_OP_VINC",
            type: $.db.types.NVARCHAR,
            dimension: 1
        }),
        participationConsortia: new view_lib.Field({
            name: "IND_PART_CONS",
            type: $.db.types.NVARCHAR,
            dimension: 1
        }),
        exteriorParticipation: new view_lib.Field({
            name: "IND_PART_EXT",
            type: $.db.types.NVARCHAR,
            dimension: 1
        }),
        exteriorPayments: new view_lib.Field({
            name: "IND_PGTO_EXT",
            type: $.db.types.NVARCHAR,
            dimension: 1
        }),
        shipmentPayments: new view_lib.Field({
            name: "IND_PGTO_REM",
            type: $.db.types.NVARCHAR,
            dimension: 1
        }),
        framedPJ: new view_lib.Field({
            name: "IND_PJ_ENQUAD",
            type: $.db.types.NVARCHAR,
            dimension: 1
        }),
        enabledPJ: new view_lib.Field({
            name: "IND_PJ_HAB",
            type: $.db.types.NVARCHAR,
            dimension: 1
        }),
        industrialPole: new view_lib.Field({
            name: "IND_POLO_AM",
            type: $.db.types.NVARCHAR,
            dimension: 1
        }),
        scpQuantity: new view_lib.Field({
            name: "IND_QTE_SCP",
            type: $.db.types.NVARCHAR,
            dimension: 3
        }),
        exteriorIncome: new view_lib.Field({
            name: "IND_REC_EXT",
            type: $.db.types.NVARCHAR,
            dimension: 1
        }),
        taxExemption: new view_lib.Field({
            name: "IND_RED_ISEN",
            type: $.db.types.NVARCHAR,
            dimension: 1
        }),
        incomeServices: new view_lib.Field({
            name: "IND_REND_SERV",
            type: $.db.types.NVARCHAR,
            dimension: 1
        }),
        royaltiesPayments: new view_lib.Field({
            name: "IND_ROY_PAG",
            type: $.db.types.NVARCHAR,
            dimension: 1
        }),
        receivedRoyalties: new view_lib.Field({
            name: "IND_ROY_REC",
            type: $.db.types.NVARCHAR,
            dimension: 1
        }),
        exportSales: new view_lib.Field({
            name: "IND_VEND_EXP",
            type: $.db.types.NVARCHAR,
            dimension: 1
        }),
        exportZones: new view_lib.Field({
            name: "IND_ZON_EXP",
            type: $.db.types.NVARCHAR,
            dimension: 1
        }),
        lastReceipt: new view_lib.Field({
            name: "NUM_REC",
            type: $.db.types.NVARCHAR,
            dimension: 41
        }),
        retifier: new view_lib.Field({
            name: "RETIFICADORA",
            type: $.db.types.NVARCHAR,
            dimension: 1
        }),
        validFromQuest: new view_lib.Field({
            name: "VALID_FROM_QUEST",
            type: $.db.types.NVARCHAR,
            dimension: 8
        }),
        validToQuest: new view_lib.Field({
            name: "VALID_TO_QUEST",
            type: $.db.types.NVARCHAR,
            dimension: 8
        })
    }
});
this.table = table;