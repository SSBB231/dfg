$.import('timp.core.server.api', 'api');
var meta_objects = $.timp.core.server.api.api.meta_object;
$.import('timp.dfg.server.models', 'digitalFile');
var digitalFileModel = $.timp.dfg.server.models.digitalFile.table;

this.DigitalFile = meta_objects.BaseObject({
	name: "DigitalFile",
	table: digitalFileModel,
	parseFields: ["digitalFile","json"],
	dialogPick: {
	    "id": {
	        "i18n": "ID"
	    },
	    "idSettingVersion": {
	    	"i18n": "ID_SETTING_VERSION",
            "i18nPtrbr": "Código Versão Configuração",
            "i18nEnus": "Id Setting Version"
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
	    "idCompany": {
	        "i18n": "ID_COMPANY",
            "i18nPtrbr": "Empresa",
            "i18nEnus": "Company"
	    },
	    "uf": {
	        "i18n": "UF"
	    },
	    "idBranch": {
	        "i18n": "ID_BRANCH",
            "i18nPtrbr": "Filial",
            "i18nEnus": "Branch"
	    },
	    "idTax": {
	        "i18n": "ID_TAX",
            "i18nPtrbr": "Tributo",
            "i18nEnus": "Tax"
	    },
	    "year": {
	        "i18n": "YEAR",
            "i18nPtrbr": "Ano",
            "i18nEnus": "Year"
	    },
	    "month": {
	        "i18n": "MONTH",
            "i18nPtrbr": "Mês",
            "i18nEnus": "Month"
	    },
	    "subperiod": {
	        "i18n": "SUBPERIOD",
            "i18nPtrbr": "Sub Periodo",
            "i18nEnus": "Sub Period"
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