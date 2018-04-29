$.import("timp.core.server.api", "api");
var core_api = $.timp.core.server.api.api;
var util = core_api.util;
var sql = core_api.sql;
$.import('timp.dfg.server.models', 'digitalFileType');
var modelDigitalFileType = $.timp.dfg.server.models.digitalFileType.table;

$.import('timp.dfg.server.models', 'digitalFileTypeText');
var modelDigitalFileTypeText = $.timp.dfg.server.models.digitalFileTypeText.table;

this.dropDigitalFileType = function(object) {
	var schema = core_api.schema;
	try {
		var query = {
			query: "DROP TABLE " + schema.default+'."DFG::DigitalFileType"'
		};
		sql.EXECUTE(query);
		query.query = "DROP SEQUENCE " + schema.default+'."DFG::DigitalFileType::ID"';
		sql.EXECUTE(query);
		query.query = "DROP TABLE " + schema.default+'."DFG::DigitalFileTypeText"';
		sql.EXECUTE(query);
		query.query = "DROP SEQUENCE " + schema.default+'."DFG::DigitalFileTypeText::ID"';
		sql.EXECUTE(query);
		return 1;
	} catch (e) {
		return 0;
	}
};
/*
    service to list the digitalFileTypes,
    uses the lang of the session to get the correct name and description
*/
this.list = function(object) {
	try {
		object = object || $.request.parameters.get("object");
		if (typeof object === "string") {
			object = JSON.parse(object);
		}
		var digitalFileTypes = modelDigitalFileType.READ({
			join: [{
				table: modelDigitalFileTypeText,
				alias: 'digitalFileTypeText',
				on: [{
					left: "id",
					right: "idDigitalFileType"
            }, {
					field: "lang",
					oper: "=",
					value: ($.request.cookies.get("Content-Language") === "ptrbr") ? "ptrbr" : "enus"
            }]
        }],
			// simulate: true,
			order_by: ['id']
		});
		// return digitalFileTypes;
		if (digitalFileTypes.length > 10000) {
			throw "Limit exceeded on object length digitalFileType";
		}
		for (var i = 0; i < digitalFileTypes.length; i++) {
			digitalFileTypes[i].name = digitalFileTypes[i].digitalFileTypeText[0].name;
			digitalFileTypes[i].description = digitalFileTypes[i].digitalFileTypeText[0].description;
			digitalFileTypes[i].lang = digitalFileTypes[i].digitalFileTypeText[0].lang;
			delete digitalFileTypes[i].digitalFileTypeText;
		}
		return digitalFileTypes;
	} catch (e) {
		$.trace.error(e);
		$.messageCodes.push({
			code: "DFG217000",
			type: "E", 
			errorInfo: util.parseError(e)
		});
	}
};

this.tableJoin = function(object) {
	var join = object.array || [];
	join.push({
		outer: 'left',
		table: modelDigitalFileType,
		alias: 'digitalFileType',
		fields: ['id', 'iconFont', 'icon'],
		on: [{
			left_table: (object && object.table) || undefined,
			left: (object && object.field) || 'idDigitalFileType',
			right: 'id'
        }]
	}, {
		outer: 'left',
		table: modelDigitalFileTypeText,
		alias: 'digitalFileTypeText',
		fields: ['id', 'name', 'description', 'lang'],
		on: [{
			left_table: modelDigitalFileType,
			left: 'id',
			right: 'idDigitalFileType'
        }, {
			field: 'lang',
			oper: '=',
			value: $.request.cookies.get('Content-Language') === 'undefined' ? 'ptrbr' : $.request.cookies.get('Content-Language')
        }]
	});
	return join;
};