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

var table = new def_table.Table({
	component: 'DFG',
	name: schema.default+'."DFG::DigitalFile"',
	default_fields: 'common',
	fields: {
		id: new def_table.AutoField({
			name: 'ID',
			pk: true,
			auto: schema.default+'."DFG::DigitalFile::ID".nextval',
			type: $.db.types.INTEGER
		}),
		idSettingVersion: new def_table.Field({
			name: 'ID_SETTING_VERSION',
			pk: true,
			type: $.db.types.INTEGER
		}),
		isSPED: new def_table.Field({
		   name: "IS_SPED",
		   type: $.db.types.INTEGER
		}),
		idDigitalFileType: new def_table.Field({
			name: 'ID_DIGITAL_FILE_TYPE',
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
		digitalFile: new def_table.Field({
			name: 'DIGITAL_FILE',
			type: $.db.types.NCLOB
		}),
		json: new def_table.Field({
			name: 'JSON',
			type: $.db.types.NCLOB
		}),
		month: new def_table.Field({
			name: 'MONTH',
			type: $.db.types.NVARCHAR,
			dimension: 2
		}),
		months: new def_table.Field({
			name: 'MONTHS',
			type: $.db.types.NCLOB
		}),
		year: new def_table.Field({
			name: 'YEAR',
			type: $.db.types.NVARCHAR,
			dimension: 4
		}),
		subperiod: new def_table.Field({
			name: 'SUBPERIOD',
			type: $.db.types.NVARCHAR,
			dimension: 2
		}),
		idCompany: new def_table.Field({
			name: 'ID_COMPANY',
			type: $.db.types.NVARCHAR,
			dimension: 4
		}),
		uf: new def_table.Field({
			name: 'UF',
			type: $.db.types.NVARCHAR,
			dimension: 2
		}),
		idBranch: new def_table.Field({
			name: 'ID_BRANCH',
			type: $.db.types.NVARCHAR,
			dimension: 4
		}),
		idTax: new def_table.Field({
			name: 'ID_TAX',
			type: $.db.types.NVARCHAR,
			dimension: 3
		}),
		status: new def_table.Field({
			name: 'STATUS',
			type: $.db.types.NVARCHAR,
			dimension: 3
		}),
		dateSent: new def_table.Field({
			name: "DATE_SENT",
			type: $.db.types.TIMESTAMP
		}),
		rectifier: new def_table.Field({ /*Stores the id for the last digital file that rectifies the current digital file*/
			name: "RECTIFIER",
			type: $.db.types.INTEGER
		}),
		originalFile: new def_table.Field({
			name: "ORIGINAL_FILE",
			type: $.db.types.INTEGER
		})
	}

});
var digitalFileXBranch = new def_table.Table({
	component: 'DFG',
	name: schema.default+'."DFG::DigitalFileXBranch"',
	default_fields: 'common',
	fields: {
		id: new def_table.AutoField({
			name: 'ID',
			pk: true,
			auto: schema.default+'."DFG::DigitalFileXBranch::ID".nextval',
			type: $.db.types.INTEGER
		}),
		idDigitalFile: new def_table.Field({
			name: 'ID_DIGITAL_FILE',
			pk: true,
			type: $.db.types.INTEGER
		}),
		idBranch: new def_table.Field({
			name: 'ID_BRANCH',
			type: $.db.types.NVARCHAR,
			dimension: 4
		})
	}
});
var digitalFileXUf = new def_table.Table({
	component: 'DFG',
	name: schema.default+'."DFG::DigitalFileXUf"',
	default_fields: 'common',
	fields: {
		id: new def_table.AutoField({
			name: 'ID',
			pk: true,
			auto: schema.default+'."DFG::DigitalFileXUf::ID".nextval',
			type: $.db.types.INTEGER
		}),
		idDigitalFile: new def_table.Field({
			name: 'ID_DIGITAL_FILE',
			pk: true,
			type: $.db.types.INTEGER
		}),
		uf: new def_table.Field({
			name: 'UF',
			type: $.db.types.NVARCHAR,
			dimension: 2
		})
	}
});
this.digitalFileXUf = digitalFileXUf;
this.digitalFileXBranch = digitalFileXBranch;
this.table = table;

this.readDigitalFile = function(object) {
	if (typeof object === 'number') {
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

this.createDigitalFile = function(object) {
	var createOptions = {
		idSettingVersion: object.idSettingVersion || null,
		isSPED: object.isSPED || 0,
		idDigitalFileType: object.idDigitalFileType || null,
		name: object.name || null,
		description: object.description || null,
		digitalFile: object.digitalFile || null,
		json: object.json || null,
		month: object.month || null,
		months: object.months || null,
		year: object.year || null,
		subperiod: object.subperiod || null,
		idCompany: object.idCompany || null,
		uf: object.uf ? (Array.isArray(object.uf) ? object.uf[0] : object.uf) : null,
		idBranch: object.idBranch ? (Array.isArray(object.idBranch) ? object.idBranch[0] : object.idBranch) : null,
		idTax: object.idTax || null,
		status: object.status || this.status.ISSUED,
		dateSent: object.dateSent || null,
		rectifier: object.rectifier || null,
		originalFile: object.originalFile || null
	};
	var digitalFile = this.table.CREATE(createOptions);
	if (object.idBranch && Array.isArray(object.idBranch)) {
		var branches = [];
		for (var b = 0; b < object.idBranch.length; b++) {
			branches.push(this.digitalFileXBranch.CREATE({
				idDigitalFile: digitalFile.id,
				idBranch: object.idBranch[b]
			}));
		}
		digitalFile.branches = branches;
	} else if (object.idBranch) {
		digitalFile.branches = [this.digitalFileXBranch.CREATE({
			idDigitalFile: digitalFile.id,
			idBranch: object.idBranch
		})];
	}
	if (object.uf && Array.isArray(object.uf)) {
		var ufs = [];
		for (var b = 0; b < object.uf.length; b++) {
			ufs.push(this.digitalFileXUf.CREATE({
				idDigitalFile: digitalFile.id,
				uf: object.uf[b]
			}));
		}
		digitalFile.ufs = ufs;
	} else if (object.uf) {
		digitalFile.ufs = [this.digitalFileXUf.CREATE({
			idDigitalFile: digitalFile.id,
			uf: object.uf
		})];
	}

	return digitalFile;
};

this.updateDigitalFile = function(object, where) {
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

this.deleteDigitalFile = function(object) {
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
				oper: object.properties[i].oper || '=',
				value: object.properties[i].value
			});
		}
	}
	return options;
};