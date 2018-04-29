 $.import("timp.core.server.api", "api");
 var core_api = $.timp.core.server.api.api;
 var util = core_api.util;
 var def_table = core_api.table_lib;

 //$.import('timp.schema.server.api','api');
 //var schema_api = $.timp.schema.server.api.api;
 //var schema = schema_api.schema;
 var schema = core_api.schema;

 this.status = {
 	ACTIVE: 100,
 	ISSUED: 200,
 	OFFICIAL: 300,
 	SENT: 400,
 	RECTIFIED: 500
 };

 var job_spedExecutionsTable = new def_table.Table({
 	component: 'DFG',
 	name: schema.default+'."DFG::Job_SPEDExecutions"',
 	default_fields: 'common',
 	fields: {
 		id: new def_table.AutoField({
 			name: 'ID',
 			pk: true,
 			auto: schema.default+'."DFG::Job_SPEDExecutions::ID".nextval',
 			type: $.db.types.INTEGER
 		}),
 		idSped: new def_table.Field({
 			name: "ID_SPED",
 			type: $.db.types.INTEGER
 		}),
 		executionData: new def_table.Field({
 			name: 'DIGITAL_FILE',
 			type: $.db.types.NCLOB
 		}),
 		idCompany: new def_table.Field({
 			name: "ID_COMPANY",
 			type: $.db.types.NVARCHAR,
 			dimension: 4
 		}),
 		idBranch: new def_table.Field({
 			name: "ID_BRANCH",
 			type: $.db.types.NVARCHAR,
 			dimension: 4
 		}),
 		subperiod: new def_table.Field({
 			name: "SUBPERIOD",
 			type: $.db.types.NVARCHAR,
 			dimension: 15
 		}),
 		status: new def_table.Field({
 			name: "STATUS",
 			type: $.db.types.INTEGER
 		})
 	}
 });
 this.job_spedExecutionsTable = job_spedExecutionsTable;

 var job_spedExecutionsEEFITable = new def_table.Table({
 	component: 'DFG',
 	name: schema.default+'."DFG::Job_SPEDExecutions_EEFI"',
 	default_fields: 'common',
 	fields: {
     	id: new def_table.AutoField({
     		name: 'ID',
     		pk: true,
     		auto: schema.default+'."DFG::Job_SPEDExecutions::ID".nextval',
     		type: $.db.types.INTEGER
     	}),
     	idSpedExecution: new def_table.Field({
     		name: "ID_SPED_EXECUTION",
     		type: $.db.types.INTEGER
     	}),
     	idCompany: new def_table.Field({
     		name: "ID_COMPANY",
     		type: $.db.types.NVARCHAR,
     		dimension: 4
     	}),
     	uf: new def_table.Field({
     		name: "UF",
     		type: $.db.types.NVARCHAR,
     		dimension: 2
     	}),
     	idBranch: new def_table.Field({
     		name: "ID_BRANCH",
     		type: $.db.types.NVARCHAR,
     		dimension: 4
     	}),
     	idTax: new def_table.Field({
     	    name: "ID_TAX",
     	    type: $.db.types.NVARCHAR,
     		dimension: 2
     	}),
     	idSubperiod: new def_table.Field({
     	    name: "ID_SUBPERIOD",
     	    type: $.db.types.INTEGER
     	})
 	}
 });
 this.job_spedExecutionsEEFITable = job_spedExecutionsEEFITable;
 this.readSpedExecutions = function(object) {
 	if (typeof object === 'number') {
 		return job_spedExecutionsTable.READ({
 			where: [{
 				field: 'id',
 				oper: '=',
 				value: object
			}]
 		})[0];
 	}
 	var options = this.getOptions(object);
 	return this.job_spedExecutionsTable.READ(options);
 };
 this.createSpedExecution = function(object,subperiod) {
 	var createOptions = {
 		executionData: object.executionData,
 		idSped: object.idSped,
 		idCompany: object.idCompany,
 		idBranch: object.idBranch,
 		subperiod: object.subperiod,
 		status: 1
 	};
 	var spedExecution = this.job_spedExecutionsTable.CREATE(createOptions);
 	subperiod.id.map(function(id){
 	    subperiod.eef.map(function(eef){
 	        eef.idSubperiod = id;
 	        eef.idTax = subperiod.idTax[0];
 	        eef.idSpedExecution = spedExecution.id;
 	        job_spedExecutionsEEFITable.CREATE(eef);
 	    });
 	});
 	return spedExecution;
 };
 this.updateSpedExecutionStatus = function(id, status) {
 	var updateOptions = {
 		status: status,
 		id: id
 	};
 	return this.job_spedExecutionsTable.UPDATE(updateOptions);
 };
 this.deleteSpedExecution = function(object) {
 	if (typeof object === 'number') {
 		return this.job_spedExecutionsTable.DELETE(object);
 	}
 	return this.job_spedExecutionsTable.DELETEWHERE(object);
 };
 this.getOptions = function(object) {
 	var options = {};
 	if (!object) {
 		return options;
 	}
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