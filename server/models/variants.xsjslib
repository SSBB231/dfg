$.import("timp.core.server.api", "api");
var core_api = $.timp.core.server.api.api;
var util = core_api.util;
var def_table = core_api.table_lib;

//$.import('timp.schema.server.api','api');
//var schema_api = $.timp.schema.server.api.api;
//var schema = schema_api.schema;
var schema = core_api.schema;
var EFD_ICMSIPI_Variant = new def_table.Table({
	component: "DFG",
	name: schema.default+'."DFG::EFD_ICMSIPI_Variant"',
	default_fields: "common",
	fields: {
		id: new def_table.AutoField({
			name: 'ID',
			pk: true,
			auto: schema.default+'."DFG::SPED::EFD_ICMSIPI_Variant".nextval',
			type: $.db.types.INTEGER
		}),
		name: new def_table.Field({
			name: "NAME",
			type: $.db.types.NVARCHAR,
			dimension: 25
		}),
		DESCRIPTION: new def_table.Field({
			name: "DESCRIPTION",
			type: $.db.types.NVARCHAR,
			dimension: 255
		}),
		SUBPERIODEXEC: new def_table.Field({
		    name: "SUBPERIODEXE",
		    type: $.db.types.NVARCHAR,
		    dimension: 2
		}),
		YEAREXEC: new def_table.Field({
			name: "YEAREXEC",
			type: $.db.types.NVARCHAR,
			dimension: 4
		}),
		MONTHEXEC: new def_table.Field({
			name: "MONTHEXEC",
			type: $.db.types.NVARCHAR,
			dimension: 2
		}),
		BUKRS: new def_table.Field({
			name: "BUKRS",
			type: $.db.types.NVARCHAR,
			dimension: 4
		}),
		BRANCH: new def_table.Field({
			name: "BRANCH",
			type: $.db.types.NVARCHAR,
			dimension: 4
		}),
		IE: new def_table.Field({
			name: "IE",
			type: $.db.types.NVARCHAR,
			dimension: 18
		}),
		CENTRAL_EFD: new def_table.Field({
			name: 'CENTRAL_EFD',
			type: $.db.types.NVARCHAR,
			dimension: 20
		}),
		DOCNUM_LOW: new def_table.Field({
			name: "DOCNUM_LOW",
			type: $.db.types.NVARCHAR,
			dimension: 10
		}),
		DOCNUM_HIGH: new def_table.Field({
			name: "DOCNUM_HIGH",
			type: $.db.types.NVARCHAR,
			dimension: 10
		}),
		REGISTER_LOW: new def_table.Field({
			name: "REGISTER_LOW",
			type: $.db.types.NVARCHAR,
			dimension: 4
		}),
		REGISTER_HIGH: new def_table.Field({
			name: "REGISTER_HIGH",
			type: $.db.types.NVARCHAR,
			dimension: 4
		}),
		COD_FINALITY: new def_table.Field({
			name: "COD_FINALITY",
			type: $.db.types.NVARCHAR,
			dimension: 1
		}),
		EFD_CONTRIB: new def_table.Field({
			name: "EFD_CONTRIB",
			type: $.db.types.NVARCHAR,
			dimension: 1
		}), 
		BLOCKH: new def_table.Field({
			name: "BLOCKH",
			type: $.db.types.NVARCHAR,
			dimension: 1
		}),
		PLANT: new def_table.Field({
			name: "PLANT",
			type: $.db.types.NVARCHAR,
			dimension: 4
		}),
		OFFICIAL_RUN: new def_table.Field({
			name: "OFFICIAL_RUN",
			type: $.db.types.NVARCHAR,
			dimension: 1
		}),
		ORGSTR_PARAM: new def_table.Field({
			name: "ORGSTR_PARAM",
			type: $.db.types.NVARCHAR,
			dimension: 2
		}),
		SPED_VERSION: new def_table.Field({
			name: "SPED_VERSION",
			type: $.db.types.NVARCHAR,
			dimension: 3
		}),
		IMONTH: new def_table.Field({
			name: "IMONTH",
			type: $.db.types.NVARCHAR,
			dimension: 2
		}),
		IYEAR: new def_table.Field({
			name: "IYEAR",
			type: $.db.types.NVARCHAR,
			dimension: 4
		}),
		ISUBPERIOD: new def_table.Field({
		    name: "ISUBPERIOD",
		    type: $.db.types.NVARCHAR,
		    dimension: 2
		})

	}

});

this.EFD_ICMSIPI_Variant = EFD_ICMSIPI_Variant;

var EFD_Contributions_Variant = new def_table.Table({
    component: "DFG",
    name: schema.default+'."DFG::EFD_Contributions_Variant"',
    default_fields: "common",
    fields: {
        id: new def_table.AutoField({
            name: 'ID',
            pk: true,
            auto: schema.default+'."DFG::SPED::EFD_Contributions_Variant".nextval',
            type: $.db.types.INTEGER
        }),
        name: new def_table.Field({
            name: "NAME",
            type: $.db.types.NVARCHAR,
            dimension: 25
        }),
        description: new def_table.Field({
            name: "DESCRIPTION",
            type: $.db.types.NVARCHAR,
            dimension: 255
        }),
        SUBPERIOD: new def_table.Field({
            name: "SUBPERIOD",
            type: $.db.types.NVARCHAR,
            dimension: 2
        }),
        YEAR: new def_table.Field({
            name: "YEAR",
            type: $.db.types.NVARCHAR,
            dimension: 4
        }),
        MONTH: new def_table.Field({
            name: "MONTH",
            type: $.db.types.NVARCHAR,
            dimension: 2
        }),
        BUKRS: new def_table.Field({
            name: "BUKRS",
            type: $.db.types.NVARCHAR,
            dimension: 4
        }),
        ESTRBA: new def_table.Field({
            name: "ESTRBA",
            type: $.db.types.NVARCHAR,
            dimension: 4
        }),
        CNPJ: new def_table.Field({
            name: "CNPJ",
            type: $.db.types.NVARCHAR,
            dimension: 8
        }),
        TP_ESC: new def_table.Field({
            name: 'TP_ESC',
            type: $.db.types.NVARCHAR,
            dimension: 1
        }),
        CODVER: new def_table.Field({
            name: "CODVER",
            type: $.db.types.NVARCHAR,
            dimension: 3
        }),
        NUMREC: new def_table.Field({
            name: "NUMREC",
            type: $.db.types.NVARCHAR,
            dimension: 41
        }),
        REGISTER_LOW: new def_table.Field({
            name: "REGISTER_LOW",
            type: $.db.types.NVARCHAR,
            dimension: 4
        }),
        REGISTER_HIGH: new def_table.Field({
            name: "REGISTER_HIGH",
            type: $.db.types.NVARCHAR,
            dimension: 4
        }),
        CONSOL: new def_table.Field({
            name: "CONSOL",
            type: $.db.types.NVARCHAR,
            dimension: 1
        }),
        BLOC_M: new def_table.Field({
            name: "BLOC_M",
            type: $.db.types.NVARCHAR,
            dimension: 1
        }),
        INCTRI: new def_table.Field({
            name: "INCTRI",
            type: $.db.types.NVARCHAR,
            dimension: 1
        }),
        APROCR: new def_table.Field({
            name: "APROCR",
            type: $.db.types.NVARCHAR,
            dimension: 1
        }),
        OFFICIAL_RUN: new def_table.Field({
            name: "OFFICIAL_RUN",
            type: $.db.types.NVARCHAR,
            dimension: 1
        }),
        ORGSTR_PARAM: new def_table.Field({
            name: "ORGSTR_PARAM",
            type: $.db.types.NVARCHAR,
            dimension: 2
        }),
        TIPCON: new def_table.Field({
            name: "TIPCON",
            type: $.db.types.NVARCHAR,
            dimension: 1
        }),
        REGCUM: new def_table.Field({
            name: "REGCUM",
            type: $.db.types.NVARCHAR,
            dimension: 1
        }),
        CODSCP: new def_table.Field({
            name: "CODSCP",
            type: $.db.types.NVARCHAR,
            dimension: 14
        })

    }

});

this.EFD_Contributions_Variant = EFD_Contributions_Variant;
