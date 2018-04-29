$.import('timp.dfg.server.models', 'setting');
$.import('timp.dfg.server.models', 'settingVersion');
$.import('timp.dfg.server.models', 'settingXEefi');
$.import('timp.dfg.server.models', 'layout');
$.import('timp.dfg.server.models', 'layoutVersion');
$.import('timp.dfg.server.models', 'layoutXStructure');
$.import('timp.dfg.server.models', 'digitalFile');
$.import('timp.dfg.server.models', 'panel');
$.import('timp.dfg.server.models', 'digitalFileType');
$.import('timp.dfg.server.models', 'digitalFileTypeText');
$.import('timp.dfg.server.models', 'digitalFileAN4');
$.import('timp.dfg.server.models', 'digitalFileAN4Favorite');
$.import('timp.dfg.server.models', 'digitalFileAN4Eefi');
$.import('timp.dfg.server.models', 'xmlDigitalFile');
$.import("timp.dfg.server.models", "SPED");
$.import("timp.dfg.server.models", "SPEDXEefi");
$.import("timp.dfg.server.models", "variants");
$.import("timp.dfg.server.models", "SPED_TDFTables");
$.import("timp.dfg.server.models", "SPED_Labels");
$.import("timp.dfg.server.models", "job_SPEDExecutions");
$.import("timp.dfg.server.models", "an3");
$.import("timp.dfg.server.models", "an4");

this.models = [
	$.timp.dfg.server.models.setting.table,
	$.timp.dfg.server.models.settingVersion.table,
	$.timp.dfg.server.models.settingXEefi.table,
	$.timp.dfg.server.models.layout.table,
	$.timp.dfg.server.models.layoutVersion.table,
	$.timp.dfg.server.models.layoutXStructure.table,
	$.timp.dfg.server.models.digitalFile.table,
	$.timp.dfg.server.models.digitalFile.digitalFileXBranch,
	$.timp.dfg.server.models.digitalFile.digitalFileXUf,
	$.timp.dfg.server.models.panel.panelTable,
	$.timp.dfg.server.models.panel.panelSettingTable,
	$.timp.dfg.server.models.panel.panelJustifyTable,
	$.timp.dfg.server.models.panel.panelCommentTable,
	$.timp.dfg.server.models.panel.approvePanelTable,
	$.timp.dfg.server.models.panel.panelStatusTable,
	$.timp.dfg.server.models.panel.panelStatusTextTable,
	$.timp.dfg.server.models.digitalFileType.table,
	$.timp.dfg.server.models.digitalFileTypeText.table,
	$.timp.dfg.server.models.digitalFileAN4.table,
	$.timp.dfg.server.models.digitalFileAN4Favorite.table,
	$.timp.dfg.server.models.digitalFileAN4Eefi.table,
	$.timp.dfg.server.models.xmlDigitalFile.table,
	$.timp.dfg.server.models.SPED.table,
	$.timp.dfg.server.models.SPED.runSPEDTable,
	$.timp.dfg.server.models.SPED.runXTaskTable,
	$.timp.dfg.server.models.SPEDXEefi.table,
	$.timp.dfg.server.models.variants.EFD_ICMSIPI_Variant,
	$.timp.dfg.server.models.variants.EFD_Contributions_Variant,
	$.timp.dfg.server.models.SPED_TDFTables.table,
	$.timp.dfg.server.models.SPED_Labels.table,
	$.timp.dfg.server.models.job_SPEDExecutions.job_spedExecutionsTable,
	$.timp.dfg.server.models.job_SPEDExecutions.job_spedExecutionsEEFITable,
	$.timp.dfg.server.models.an3.an3Table,
	$.timp.dfg.server.models.an3.an3XBFBLayout,
	$.timp.dfg.server.models.an3.an3XDigitalFile,
	$.timp.dfg.server.models.an3.an3XExternalFile,
	$.timp.dfg.server.models.an3.an3XRule,
	$.timp.dfg.server.models.an3.an3Report,
	$.timp.dfg.server.models.an4.an4Table,
	$.timp.dfg.server.models.an4.an4XBFBLayout,
	$.timp.dfg.server.models.an4.an4XDigitalFile,
	$.timp.dfg.server.models.an4.an4XExternalFile,
	$.timp.dfg.server.models.an4.an4XRule,
	$.timp.dfg.server.models.an4.an4Report
];