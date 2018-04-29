$.import('timp.core.server.api', 'api');
var meta_objects = $.timp.core.server.api.api.meta_object;
$.import('timp.dfg.server.models', 'layout');
var modelLayout = $.timp.dfg.server.models.layout.table;

this.Layout = meta_objects.BaseObject({
	name: "Layout",
	table: modelLayout,
	parseFields: ["json"],
	dialogPick: {
	    "id": {
	        "i18n": "ID"
	    },
	    "name": {
	        "i18n": "NAME"
	    },
	    "description": {
	        "i18n": "DESCRIPTION"
	    },
	    
	    "idDigitalFile": {
	        "i18n": "ID_DIGITAL_FILE_TYPE"
	    },
	   // "json": {
	   //     "i18n": "JSON"
	   // },
	    "creationDate": {
	        "i18n": "CREATION.DATE"
	    },
	    "creationUser": {
	        "i18n": "CREATION.ID_USER"
	    },
	    "modificationDate": {
	        "i18n": "MODIFICATION.DATE"
	    },
	    "modificationUser": {
	        "i18n": "MODIFICATION.ID_USER"
	    }
	}
});