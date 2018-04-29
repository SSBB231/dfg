$.import('timp.core.server.api', 'api');
var meta_objects = $.timp.core.server.api.api.meta_object;
$.import('timp.dfg.server.models', 'layoutType');
var layoutTypeModel = $.timp.dfg.server.models.layoutType;

this.LayoutType = meta_objects.BaseObject({
	name: "LayoutType",
	table: layoutTypeModel.table,
	parseFields: [],
	dialogPick: {
	    "id": {
	        "i18n": "ID"
	    },
	    "creationDate": {
	        "i18n": "CREATIONDATE"
	    },
	    "creationUser": {
	        "i18n": "CREATIONUSER"
	    },
	    "modificationDate": {
	        "i18n": "MODIFICATIONDATE"
	    },
	    "modificationUser": {
	        "i18n": "MODIFICATIONUSER"
	    },
	    "typeName": {
	        "i18n": "TYPENAME"
	    },
	    "typeDescription": {
	        "i18n": "TYPEDESCRIPTION"
	    },
	    "isDeleted": {
	        "i18n": "ISDELETED"
	    }
	}
});