try {
	$.import('timp.dfg.server.objects','layout');
	this.layout = $.timp.dfg.server.objects.layout;
	$.import('timp.dfg.server.objects','setting');
	this.setting = $.timp.dfg.server.objects.setting;
	$.import('timp.dfg.server.objects','digitalFile');
	this.digitalFile = $.timp.dfg.server.objects.digitalFile;
	$.import('timp.dfg.server.objects','sped');
	this.sped = $.timp.dfg.server.objects.sped;
	$.import("timp.dfg.server.objects","spedExternalFile");
	this.spedExternalFile = $.timp.dfg.server.objects.spedExternalFile;
	$.import("timp.dfg.server.objects","an3");
	this.aN3 = $.timp.dfg.server.objects.an3;
	$.import("timp.dfg.server.objects","spedVariant");
	this.eFDICMSIPIVariant = $.timp.dfg.server.objects.spedVariant;
} catch (e) {
	this.error = e;
}