 $.import('timp.core.server.api', 'api');
var meta_objects = $.timp.core.server.api.api.meta_object;
$.import("timp.dfg.server.models", "variants");
var modelEFDICMSIPIVariant = $.timp.dfg.server.models.variants.EFD_ICMSIPI_Variant;
 
this.EFDICMSIPIVariant = meta_objects.BaseObject({
	name: "EFDICMSIPIVariant",
	table: modelEFDICMSIPIVariant,
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
	    }
	}
});