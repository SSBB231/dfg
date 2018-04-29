 $.import('timp.core.server.api', 'api');
var meta_objects = $.timp.core.server.api.api.meta_object;
$.import('timp.dfg.server.models', 'SPED');
var modelSPED = $.timp.dfg.server.models.SPED.table;

this.Sped = meta_objects.BaseObject({
	name: "SPED",
	table: modelSPED,
	parseFields: ["json"],
	dialogPick: {
	    "id": {
	        "i18n": "ID"
	    },
	    "name": {
	        "i18n": "NAME",
            "i18nPtrbr": "Nome",
            "i18nEnus": "Name"
	    },
	    "description": {
	        "i18n": "DESCRIPTION",
            "i18nPtrbr": "Descrição",
            "i18nEnus": "Description"
	    },
	    
	    "type": {
	        "i18n": "TYPE",
            "i18nPtrbr": "Tipo",
            "i18nEnus": "Type"
	    },
	   // "json": {
	   //     "i18n": "JSON"
	   // },
	    "creationDate": {
	        "i18n": "CREATIONDATE",
            "i18nPtrbr": "Data de Criação",
            "i18nEnus": "Creation Date"
	    },
	    "creationUser": {
	        "i18n": "CREATIONUSER",
            "i18nPtrbr": "Usuário de Criação",
            "i18nEnus": "Creation User"
	    },
	    "modificationDate": {
	        "i18n": "MODIFICATIONDATE",
            "i18nPtrbr": "Data de Modificação",
            "i18nEnus": "Modification Date"
	    },
	    "modificationUser": {
	        "i18n": "MODIFICATIONUSER",
            "i18nPtrbr": "Usuário de Modificação",
            "i18nEnus": "Modification User"
	    }
	}
});