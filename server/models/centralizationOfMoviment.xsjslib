$.import('timp.core.server.api', 'api');
var core_api = $.timp.core.server.api.api;

//$.import('timp.schema.server.api','api');
//var schema_api = $.timp.schema.server.api.api;
//var schema = schema_api.schema;
var schema = core_api.schema;

$.import("timp.atr.server.api", "api");
var atr_api = $.timp.atr.server.api.api;
this.centralizacaoMovimento = atr_api.centralizacaoMovimento;

$.import('timp.tfp.server.api', 'api');
var tfp_api = $.timp.tfp.server.api.api;
var fiscalSubPeriod = tfp_api.fiscalSubPeriod;

this.findCentralizations = function (object){
    var paramsGetDates = {
                idCompany:object.idCompany,
                idBranch:object.idBranch,
                uf:object.uf,
                idTax:object.idTax,
                year:object.year,
                month: object.month,
                subperiod:object.subPeriod
            };
    var periodDates =  fiscalSubPeriod.getDates(paramsGetDates);
    return this.centralizacaoMovimento.centralizacaoMovimento.READ({
        distinct : true,
        where: [
            {field: 'codEmpresa', oper: "=", value: paramsGetDates.idCompany},
            {field: 'inativo', oper: "!=", value: 1},
            {field: 'uf', oper: "=", value: paramsGetDates.uf},
            {field: 'iniVigencia', oper:"<=", value: periodDates.startDate},
            {field: 'fimVigencia', oper:">=", value: periodDates.endDate}
        ]
    });
}