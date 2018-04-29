 $.import('timp.core.server.api', 'api');
var meta_objects = $.timp.core.server.api.api.meta_object;
$.import('timp.dfg.server.models.views', 'cvReportFiles');
var modelSPEDExternalFile = $.timp.dfg.server.models.views.cvReportFiles.table;

this.SpedExternalFile = meta_objects.BaseObject({
	name: "SPEDExternalFile",
	table: modelSPEDExternalFile,
	dialogPick: {
	    "id": {
	        "i18n": "ID FILE",
	        "i18nPtrbr": "ID do Arquivo",
	        "i18nEnus": "ID File"
	    },
	    "fileName": {
	        "i18n": "FILE NAME",
            "i18nPtrbr": "Nome do Arquivo",
            "i18nEnus": "File Name"
	    },
	    "description": {
	        "i18n": "DESCRIPTION",
            "i18nPtrbr": "Descrição",
            "i18nEnus": "Description"
	    },
	    
	    "idCompany": {
	        "i18n": "COMPANY",
            "i18nPtrbr": "Empresa",
            "i18nEnus": "Company"
	    },
	   // "json": {
	   //     "i18n": "JSON"
	   // },
	    "idBranch": {
	        "i18n": "BRANCH",
            "i18nPtrbr": "Filial",
            "i18nEnus": "Branch"
	    },
	    "cnpj": {
	        "i18n": "CNPJ ROOT",
            "i18nPtrbr": "CNPJ Raíz",
            "i18nEnus": "CNPJ Root"
	    },
	    "initPeriod": {
	        "i18n": "INITIAL FROM",
            "i18nPtrbr": "Data Inicial",
            "i18nEnus": "Initial Date"
	    },
	    "endPeriod": {
	        "i18n": "DATE TO",
            "i18nPtrbr": "Data final",
            "i18nEnus": "Final Date"
	    }
	}
});