$.import('timp.core.server.api', 'api');
var meta_objects = $.timp.core.server.api.api.meta_object;
$.import('timp.dfg.server.models', 'setting');
var modelSetting = $.timp.dfg.server.models.setting.table;

this.Setting = meta_objects.BaseObject({
	name: "Setting",
	table: modelSetting,
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
	    "idDigitalFile": {
	        "i18n": "ID_DIGITAL_FILE_TYPE",
            "i18nPtrbr": "Id Arquivo Digital",
            "i18nEnus": "Id Digital File"
	    },
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