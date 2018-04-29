$.import('timp.core.server.api', 'api');
var meta_objects = $.timp.core.server.api.api.meta_object;
$.import('timp.dfg.server.models', 'layoutHeader');
var layoutHeaderModel = $.timp.dfg.server.models.layoutHeader;

this.LayoutHeader = meta_objects.BaseObject({
	name: "LayoutHeader",
	table: layoutHeaderModel.table,
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
	    "isPublic": {
	        "i18n": "ISPUBLIC"
	    },
	    "isDeleted": {
	        "i18n": "ISDELETED"
	    },
	    "areaType": {
	        "i18n": "AREATYPE"
	    },
	    "owner": {
	        "i18n": "OWNER"
	    },
	    "idStructure": {
	        "i18n": "IDSTRUCTURE"
	    },
	    "layoutName": {
	        "i18n": "LAYOUTNAME"
	    },
	    "layoutDescription": {
	        "i18n": "LAYOUTDESCRIPTION"
	    },
	    "layoutType": {
	        "i18n": "LAYOUTTYPE"
	    },
	    "company": {
	        "i18n": "COMPANY"
	    },
	    "branch": {
	        "i18n": "BRANCH"
	    },
	    "area": {
	        "i18n": "AREA"
	    }
	}
});