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
		name: '"_SYS_BIC"."timp.dfg.modeling/CV_AN4"',
		fields: {
			id: new view_lib.Field({
				name: "ID",
				type: $.db.types.INTEGER
			}),
			idCoreFile: new view_lib.Field({
    			name: "ID_CORE_FILE",
    			type: $.db.types.INTEGER
    		}),
			idLayoutVersionReference: new view_lib.Field({
				name: "ID_LAYOUT_VERSION_REFERENCE",
				type: $.db.types.INTEGER
			}),
			bfbLayoutNameReference: new view_lib.Field({
				name: "BFB_LAYOUT_NAME_REFERENCE",
				type: $.db.types.NVARCHAR,
				dimension: 100
			}),
			idBFBLayoutReference: new view_lib.Field({
				name: "ID_BFB_LAYOUT_REFERENCE",
				type: $.db.types.INTEGER
			}),
			digitalFileNameReference: new view_lib.Field({
				name: "DIGITAL_FILE_NAME_REFERENCE",
				type: $.db.types.NVARCHAR,
				dimension: 100
			}),
			idDigitalFileReference: new view_lib.Field({
				name: "ID_DIGITAL_FILE_REFERENCE",
				type: $.db.types.INTEGER
			}),
			idExternalFileReference: new view_lib.Field({
				name: "ID_EXTERNAL_FILE_REFERENCE",
				type: $.db.types.INTEGER
			}),
			externalFileNameReference: new view_lib.Field({
				name: "EXTERNAL_FILE_NAME_REFERENCE",
				type: $.db.types.NVARCHAR,
				dimension: 100
			}),
			idLayoutVersionComparison: new view_lib.Field({
				name: "ID_LAYOUT_VERSION_COMPARISON",
				type: $.db.types.INTEGER
			}),
			bfbLayoutNameComparison: new view_lib.Field({
				name: "BFB_LAYOUT_NAME_COMPARISON",
				type: $.db.types.NVARCHAR,
				dimension: 100
			}),
			idBFBLayoutComparison: new view_lib.Field({
				name: "ID_BFB_LAYOUT_COMPARISON",
				type: $.db.types.INTEGER
			}),
			digitalFileNameComparison: new view_lib.Field({
				name: "DIGITAL_FILE_NAME_COMPARISON",
				type: $.db.types.NVARCHAR,
				dimension: 100
			}),
			idDigitalFileComparison: new view_lib.Field({
				name: "ID_DIGITAL_FILE_COMPARISON",
				type: $.db.types.INTEGER
			}),
			idExternalFileComparison: new view_lib.Field({
				name: "ID_EXTERNAL_FILE_COMPARISON",
				type: $.db.types.INTEGER
			}),
			externalFileNameComparison: new view_lib.Field({
				name: "EXTERNAL_FILE_NAME_COMPARISON",
				type: $.db.types.NVARCHAR,
				dimension: 100
			}),
			idFolder: new view_lib.Field({
				name: "ID_FOLDER",
				type: $.db.types.INTEGER
			}),

			idDigitalFileTypeReference: new view_lib.Field({
				name: "ID_DIGITAL_FILE_TYPE_REFERENCE",
				type: $.db.types.INTEGER
			}),
			idSettingVersionReference: new view_lib.Field({
				name: "ID_SETTING_VERSION_REFERENCE",
				type: $.db.types.INTEGER
			}),
			idDigitalFileTypeComparison: new view_lib.Field({
				name: "ID_DIGITAL_FILE_TYPE_COMPARISON",
				type: $.db.types.INTEGER
			}),
			idSettingVersionComparison: new view_lib.Field({
				name: "ID_SETTING_VERSION_COMPARISON",
				type: $.db.types.INTEGER
			}),
			status: new view_lib.Field({
				name: "STATUS",
				type: $.db.types.TINYINT,
				translate: {
					0: 'Standard',
					1: 'Active',
					2: 'Trash',
					3: 'Deleted',
					4: 'Public'
				}
			}),
			originReference: new view_lib.Field({
				name: "ORIGIN_REFERENCE",
				type: $.db.types.INTEGER,
				translate: {
					1: 'DFG',
					2: 'EXTERNAL'
				}
			}),
			originComparison: new view_lib.Field({
				name: "ORIGIN_COMPARISON",
				type: $.db.types.INTEGER,
				translate: {
					1: 'DFG',
					2: 'EXTERNAL'
				}
			}),
			name: new view_lib.Field({
				name: "NAME",
				type: $.db.types.NVARCHAR,
				dimension: 100
			}),
			description: new view_lib.Field({
				name: "DESCRIPTION",
				type: $.db.types.NVARCHAR,
				dimension: 250
			}),
			creationIdUser: new view_lib.Field({
				name: "CREATION_ID_USER",
				type: $.db.types.INTEGER
			}),
			creationUser: new view_lib.Field({
				name: "CREATION_USER",
				type: $.db.types.NVARCHAR,
				dimension: 50
			}),
			modificationIdUser: new view_lib.Field({
				name: "MODIFICATION_ID_USER",
				type: $.db.types.INTEGER
			}),
			modificationUser: new view_lib.Field({
				name: "MODIFICATION_USER",
				type: $.db.types.NVARCHAR,
				dimension: 50
			}),
			creationDate: new view_lib.Field({
				name: "CREATION_DATE",
				type: $.db.types.TIMESTAMP
			}),
			modificationDate: new view_lib.Field({
				name: "MODIFICATION_DATE",
				type: $.db.types.TIMESTAMP
			}),
			monthReference: new view_lib.Field({
				name: 'MONTH_REFERENCE',
				type: $.db.types.NVARCHAR,
				dimension: 2
			}),

			yearReference: new view_lib.Field({
				name: 'YEAR_REFERENCE',
				type: $.db.types.NVARCHAR,
				dimension: 4
			}),
			subperiodReference: new view_lib.Field({
				name: 'SUBPERIOD_REFERENCE',
				type: $.db.types.NVARCHAR,
				dimension: 2
			}),
			idCompanyReference: new view_lib.Field({
				name: 'ID_COMPANY_REFERENCE',
				type: $.db.types.NVARCHAR,
				dimension: 4
			}),
			ufReference: new view_lib.Field({
				name: 'UF_REFERENCE',
				type: $.db.types.NVARCHAR,
				dimension: 2
			}),
			idBranchReference: new view_lib.Field({
				name: 'ID_BRANCH_REFERENCE',
				type: $.db.types.NVARCHAR,
				dimension: 4
			}),
			idTaxReference: new view_lib.Field({
				name: 'ID_TAX_REFERENCE',
				type: $.db.types.NVARCHAR,
				dimension: 3
			}),
			monthComparison: new view_lib.Field({
				name: 'MONTH_COMPARISON',
				type: $.db.types.NVARCHAR,
				dimension: 2
			}),

			yearComparison: new view_lib.Field({
				name: 'YEAR_COMPARISON',
				type: $.db.types.NVARCHAR,
				dimension: 4
			}),
			subperiodComparison: new view_lib.Field({
				name: 'SUBPERIOD_COMPARISON',
				type: $.db.types.NVARCHAR,
				dimension: 2
			}),
			idCompanyComparison: new view_lib.Field({
				name: 'ID_COMPANY_COMPARISON',
				type: $.db.types.NVARCHAR,
				dimension: 4
			}),
			ufComparison: new view_lib.Field({
				name: 'UF_COMPARISON',
				type: $.db.types.NVARCHAR,
				dimension: 2
			}),
			idBranchComparison: new view_lib.Field({
				name: 'ID_BRANCH_COMPARISON',
				type: $.db.types.NVARCHAR,
				dimension: 4
			}),
			idTaxComparison: new view_lib.Field({
				name: 'ID_TAX_COMPARISON',
				type: $.db.types.NVARCHAR,
				dimension: 3
			})

		}
	});
	this.table = table;