$.import('timp.core.server.api', 'api');
var meta_objects = $.timp.core.server.api.api.meta_object;
$.import('timp.dfg.server.models', 'layoutVersion');
var layoutVersionModel = $.timp.dfg.server.models.layoutVersion;

this.LayoutVersion = meta_objects.BaseObject({
	name: "LayoutVersion",
	table: layoutVersionModel.table,
	parseFields: ["layout"],
	dialogPick: {
	    "id": {
	        "i18n": "ID"
	    },
	    "idLayout": {
	        "i18n": "IDLAYOUT"
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
	    "isDeleted": {
	        "i18n": "ISDELETED"
	    },
	    "isActive": {
	        "i18n": "ISACTIVE"
	    },
	    "isDefault": {
	        "i18n": "ISDEFAULT"
	    },
	    "legalVersion": {
	        "i18n": "LEGALVERSION"
	    },
	    "timpVersion": {
	        "i18n": "TIMPVERSION"
	    },
	    "versionDescription": {
	        "i18n": "VERSIONDESCRIPTION"
	    },
	    "validFrom": {
	        "i18n": "VALIDFROM"
	    },
	    "validTo": {
	        "i18n": "VALIDTO"
	    }
	}
});