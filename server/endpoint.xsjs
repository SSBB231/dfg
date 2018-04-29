$.import("timp.core.server.api", "api");
var corApi = $.timp.core.server.api.api;
var util = corApi.util;

try {
    $.import('timp.atr.server.api', 'api');
    var atrApi = $.timp.atr.server.api.api;
    var settingModel = atrApi.settings;
    var structureRelationController = atrApi.structureRelationController;
    $.import("timp.mdr.server.api", "api");
    var mdrApi = $.timp.mdr.server.api.api;
    var xsdSchemas = mdrApi.xsdSchemas;
    var zipFiles = mdrApi.zipFiles;
    var schemasProperties = mdrApi.schemasProperties;

    $.import('timp.dfg.server.controllers', 'setting');
    var setting = $.timp.dfg.server.controllers.setting;

    $.import('timp.dfg.server.controllers', 'layout');
    var layout = $.timp.dfg.server.controllers.layout;



    $.import('timp.dfg.server.controllers', 'AN3');
    var an3 = $.timp.dfg.server.controllers.AN3;

    $.import('timp.dfg.server.controllers', 'newAN4');
    var an4 = $.timp.dfg.server.controllers.newAN4;

    $.import('timp.dfg.server.controllers', 'digitalFile');
    var digitalFile = $.timp.dfg.server.controllers.digitalFile;

    $.import('timp.dfg.server.controllers', 'digitalFileType');
    var digitalFileType = $.timp.dfg.server.controllers.digitalFileType;

    $.import('timp.dfg.server.controllers', 'panel');
    var panel = $.timp.dfg.server.controllers.panel;

    $.import('timp.dfg.server.controllers', 'external');
    var external = $.timp.dfg.server.controllers.external;


    $.import("timp.bre.server.api", "api");
    var breApi = $.timp.bre.server.api.api;
    var BREexternal = breApi.external;

    $.import("timp.bfb.server.api", "api");
    var bfbApi = $.timp.bfb.server.api.api;
    var BFBexternal = bfbApi.external;
    $.import('timp.dfg.server.controllers', 'output');
    var output = $.timp.dfg.server.controllers.output;

    $.import('timp.dfg.server.controllers', 'xmlDigitalFile');
    var xmlFile = $.timp.dfg.server.controllers.xmlDigitalFile;

    $.import("timp.dfg.server.controllers", "SPED");
    var SPEDController = $.timp.dfg.server.controllers.SPED;
    $.import("timp.dfg.server.controllers", "variants");
    var variantController = $.timp.dfg.server.controllers.variants;


    util.CallbackDecorator();

    var router = new util.URLRouter({
        routes: [{
                // Digital File Type
                url: "^digitalFileType/list/$",
                view: digitalFileType.list,
                privileges: ["digitalFileType.read"],
                ctx: digitalFileType
            }, {
                url: "^digitalFileType/dropDigitalFileType/$",
                view: digitalFileType.dropDigitalFileType,
                privileges: ["digitalFileType.delete"],
                ctx: digitalFileType
            }, {
                // Layout
                url: "^layout/list/$",
                view: layout.list,
                privileges: ["layout.read"],
                ctx: layout
            }, {
                url: "^layout/listFiles/$",
                view: layout.listFiles,
                privileges: ["layout.read"],
                ctx: layout
            }, {
                url: "^layout/getLayouts/$",
                view: layout.getLayouts,
                privileges: ["layout.read"],
                ctx: layout
            }, {
                url: "^layout/createDialog/$",
                view: layout.createDialog,
                privileges: ["layout.create"],
                ctx: layout
            }, {
                url: "^layout/create/$",
                view: layout.create,
                privileges: ["layout.create"],
                ctx: layout
            }, {
                url: "^layout/read/$",
                view: layout.read,
                privileges: ["layout.read"],
                ctx: layout
            }, {
                url: "^layout/update/$",
                view: layout.update,
                privileges: ["layout.update"],
                ctx: layout
            }, {
                url: "^layout/updateFile/$",
                view: layout.updateFile,
                privileges: ["layout.update"],
                ctx: layout
            }, {
                url: "^layout/copy/$",
                view: layout.copy,
                privileges: ["layout.create"],
                ctx: layout
            }, {
                url: "^filters/$",
                view: layout.filters,
                privileges: [],
                ctx: layout
            }, {
                url: "^layout/filters/$",
                view: layout.filters,
                privileges: [],
                ctx: layout
            }, {
                url: "^layout/setFavorite/$",
                view: layout.setFavorite,
                privileges: ["layout.update"],
                ctx: layout
            }, {
                url: "^layout/removeFavorite/$",
                view: layout.removeFavorite,
                privileges: ["layout.update"],
                ctx: layout
            }, {
                url: "^layout/getLastVersion/$",
                view: layout.getLastVersion,
                privileges: ["layout.read"],
                ctx: layout
            }, {
                url: "^layout/getValidDates/$",
                view: layout.getValidDates,
                privileges: [],
                ctx: layout
            }, {
                url: "^layout/createLayoutVersion/$",
                view: layout.createLayoutVersion,
                privileges: ["layout.create"],
                ctx: layout
            }, {
                url: "^layout/CounterFolders/$",
                view: layout.CounterFolders,
                privileges: [],
                ctx: layout
            },{
                url: "^layout/structureMigration/$",
                view: layout.structureMigration,
                privileges: [],
                ctx: layout
            }, {
                // Setting
                url: "^setting/list/$",
                view: setting.list,
                privileges: ["setting.read"],
                ctx: setting
            }, {
                // Setting
                url: "^setting/setFavorite/$",
                view: setting.setFavorite,
                privileges: ["setting.update"],
                ctx: setting
            }, {
                url: "^setting/listFiles/$",
                view: setting.listFiles,
                privileges: ["setting.read"],
                ctx: setting
            }, {
                url: "^setting/createDialog/$",
                view: setting.createDialog,
                privileges: ["setting.create"],
                ctx: setting
            }, {
                url: "^setting/create/$",
                view: setting.create,
                privileges: ["setting.create"],
                ctx: setting
            }, {
                url: "^setting/editDialog/$",
                view: setting.editDialog,
                privileges: ["setting.update"],
                ctx: setting
            }, {
                url: "^setting/read/$",
                view: setting.read,
                privileges: ["setting.read"],
                ctx: setting
            }, {
                url: "^setting/update/$",
                view: setting.update,
                privileges: ["setting.update"],
                ctx: layout
            }, {
                url: "^setting/updateSettingData/$",
                view: setting.updateSettingData,
                privileges: ["setting.update"],
                ctx: layout
            }, {
                url: "^setting/updateFile/$",
                view: setting.updateFile,
                privileges: ["setting.update"],
                ctx: layout
            }, {
                url: "^setting/filters/$",
                view: setting.filters,
                privileges: [],
                ctx: setting
            }, {
                url: "^setting/executeDF/$",
                view: setting.executeDF,
                privileges: ["setting.execute"],
                ctx: setting
            }, {
                url: "^setting/formCache/$",
                view: setting.formCache,
                privileges: ["setting.execute"],
                ctx: setting
            }, {
                url: "^setting/deleteOldCache/$",
                view: setting.deleteOldCache,
                privileges: [],
                ctx: setting
            }, {
                url: "^setting/deleteCacheTable/$",
                view: setting.deleteCacheTable,
                privileges: [],
                ctx: setting
            }, {
                url: "^setting/evaluateBusinessRules/$",
                view: setting.evaluateBusinessRules,
                privileges: [],
                ctx: setting
            }, {
                url: "^setting/copy/$",
                view: setting.copy,
                privileges: ["setting.create"],
                ctx: setting
            }, {
                url: "^setting/getValidDates/$",
                view: setting.getValidDates,
                privileges: [],
                ctx: setting
            },

            {
                url: "^setting/getVersions/$",
                view: setting.getVersions,
                privileges: ["setting.read"],
                ctx: setting
            }, {
                url: "^setting/getSettings/$",
                view: setting.getSettings,
                privileges: ["setting.read"],
                ctx: setting
            }, {
                // Digital File
                url: "^digitalFile/list/$",
                view: digitalFile.list,
                privileges: ["digitalFile.read"],
                ctx: digitalFile
            }, {
                url: "^digitalFile/listFiles/$",
                view: digitalFile.listFiles,
                privileges: ["digitalFile.read"],
                ctx: digitalFile
            }, {
                url: "^digitalFile/issue/$",
                view: digitalFile.issue,
                privileges: ["digitalFile.issue"],
                ctx: digitalFile
            }, {
                url: "^digitalFile/officialize/$",
                view: digitalFile.officialize,
                privileges: ["digitalFile.officialize"],
                ctx: digitalFile
            }, {
                url: "^digitalFile/send/$",
                view: digitalFile.send,
                privileges: ["digitalFile.send"],
                ctx: digitalFile
            }, {
                url: "^digitalFile/rectify/$",
                view: digitalFile.updateRectification,
                privileges: ["digitalFile.rectify"],
                ctx: digitalFile
            }, {
                url: "^digitalFile/read/$",
                view: digitalFile.read,
                privileges: ["digitalFile.read"],
                ctx: digitalFile
            }, {
                url: "^digitalFile/export/$",
                view: digitalFile.export,
                privileges: ["digitalFile.export"],
                ctx: digitalFile
            }, {
                url: "^digitalFile/filters/$",
                view: digitalFile.filters,
                privileges: [],
                ctx: digitalFile
            }, {
                url: "^digitalFile/setFavorite/$",
                view: digitalFile.setFavorite,
                privileges: ["digitalFile.update"],
                ctx: digitalFile
            }, {
                url: "^digitalFile/removeFavorite/$",
                view: digitalFile.removeFavorite,
                privileges: ["digitalFile.update"],
                ctx: digitalFile
            }, {
                url: "^digitalFile/update/$",
                view: digitalFile.update,
                privileges: ["digitalFile.update"],
                ctx: digitalFile
            }, {
                url: "^digitalFile/updateFile/$",
                view: digitalFile.updateFile,
                privileges: ["digitalFile.update"],
                ctx: digitalFile
            }, {
                url: "^digitalFile/getDigitalFiles/$",
                view: digitalFile.getDigitalFiles,
                privileges: ["digitalFile.read"],
                ctx: digitalFile
            }, {
                url: "^uf/list/$",
                view: external.listUF,
                privileges: [],
                ctx: external
            }, {
                url: "^branch/list/$",
                view: external.listBranch,
                privileges: [],
                ctx: external
            }, {
                url: "^tax/list/$",
                view: external.listTax,
                privileges: [],
                ctx: external
            }, {
                url: "^external/getBFBLayoutXDFGLayout/$",
                view: BFBexternal.getBFBLayoutXDFGLayout,
                privileges: [],
                ctx: BFBexternal
            }, {
                url: "^external/listRulesByStructure/$",
                view: BREexternal.listRulesByStructure,
                privileges: [],
                ctx: BREexternal
            }, {
                url: "^exteneral/listDFGBusinessRules/$",
                view: BREexternal.listDFGBusinessRules,
                privileges: [],
                ctx: BREexternal
            }, {
                url: "^external/mapping/$",
                view: external.getStructureFieldMapping,
                privileges: [],
                ctx: external
            }, {
                url: "^external/getCentralizedBranches/$",
                view: external.getCentralizedBranches,
                privileges: [],
                ctx: external
            }, {
                url: "^external/listRulesTranscripts/$",
                view: BREexternal.listRulesTranscripts,
                privileges: [],
                ctx: BREexternal
            }, {
                url: "^Output/listOutputType/$",
                view: output.listOutputType,
                privileges: [],
                ctx: output
            }, {
                url: "^Output/listCompany/$",
                view: output.listCompany,
                privileges: [],
                ctx: output
            }, {
                url: "^Output/listUF/$",
                view: output.listUF,
                privileges: [],
                ctx: output
            }, {
                url: "^Output/listBranch/$",
                view: output.listBranch,
                privileges: [],
                ctx: output
            }, {
                url: "^Output/listTax/$",
                view: output.listTax,
                privileges: [],
                ctx: output
            }, {
                url: "^Output/listValues/$",
                view: output.listValues,
                privileges: [],
                ctx: output
                // AN4
            }, {
                url: "^an4/createDialog/$",
                view: an4.createDialog,
                privileges: ["an4.create"],
                ctx: an4
            }, {
                url: "^an4/create/$",
                view: an4.create,
                privileges: ["an4.create"],
                ctx: an4
            }, {
                url: "^an4/favorite/$",
                view: an4.setFavorite,
                privileges: ["an4.update"],
                ctx: an4
            }, {
                url: "^an4/unmarkfavorite/$",
                view: an4.unmarkfavorite,
                privileges: ["an4.update"],
                ctx: an4
            }, {
                url: "^an4/update/$",
                view: an4.update,
                privileges: ["an4.update"],
                ctx: an4
            }, {
                url: "^an4/updateFile/$",
                view: an4.updateFile,
                privileges: ["an4.update"],
                ctx: an4
            }, {
                url: "^an4/read/$",
                view: an4.read,
                privileges: ["an4.read"],
                ctx: an4
            }, {
                url: "^an4/copy/$",
                view: an4.copy,
                privileges: ["an4.create"],
                ctx: an4
            }, {
                url: "^an4/listFiles/$",
                view: an4.listFiles,
                privileges: ["an4.read"],
                ctx: an4
            }, {
                url: "^an4/listFilesByRule/$",
                view: an4.listFilesByRule,
                privileges: ["an4.read"],
                ctx: an4
            }, {
                url: "^an4/execute/$",
                view: an4.execute,
                privileges: ["an4.restore"],
                ctx: an4
            }, {
                url: "^an4/saveRawFile/$",
                view: an4.saveRawFile,
                privileges: [],
                ctx: an4
            }, {
                url: "^an4/listCompanies/$",
                view: an4.listCompanies,
                privileges: [],
                ctx: an4
            }, {
                url: "^an4/listLayoutsbyRule/$",
                view: an4.listLayoutsbyRule,
                privileges: [],
                ctx: an4
            }, {
                url: "^an4/createReport/$",
                view: an4.createAN4Report,
                privileges: ["an4.createReport"],
                ctx: an4
            } //AN3
            , {
                url: "^an3/createDialog/$",
                view: an3.createDialog,
                privileges: ["an3.create"],
                ctx: an3
            }, {
                url: "^an3/create/$",
                view: an3.create,
                privileges: ["an3.create"],
                ctx: an3
            }, {
                url: "^an3/createReport/$",
                view: an3.createAN3Report,
                privileges: ["an3.createReport"],
                ctx: an3
            }, {
                url: "^an3/update/$",
                view: an3.update,
                privileges: ["an3.update"],
                ctx: an3
            }, {
                url: "^an3/setFavorite/$",
                view: an3.setFavorite,
                privileges: ["an3.update"],
                ctx: an3
            }, {
                url: "^an3/unmarkfavorite/$",
                view: an3.removeFavorite,
                privileges: ["an3.update"],
                ctx: an3
            }, {
                url: "^an3/updateFile/$",
                view: an3.updateFile,
                privileges: ["an3.update"],
                ctx: an3
            }, {
                url: "^an3/read/$",
                view: an3.read,
                privileges: ["an3.read"],
                ctx: an3
            }, {
                url: "^an3/copy/$",
                view: an3.copy,
                privileges: ["an3.create"],
                ctx: an3
            }, {
                url: "^an3/listFiles/$",
                view: an3.listFiles,
                privileges: ["an3.read"],
                ctx: an3
            }, {
                url: "^an3/execute/$",
                view: an3.execute,
                privileges: ["an3.execute"],
                ctx: an3
            }, {
                url: "^an3/visualize/$",
                view: an3.visualize,
                privileges: [],
                ctx: an3
            }, //SPED 
            {
                url: "^sped/getSpedExecutions/$",
                view: SPEDController.getSpedExecutions,
                privileges: [],
                ctx: SPEDController
            },
            {
                url: "^sped/evaluateSpedExecutions/$",
                view: SPEDController.evaluateSpedExecutions,
                privileges: [],
                ctx: SPEDController
            },
            {
                url: "^sped/create/$",
                view: SPEDController.create,
                privileges: ["sped.createEFDICMSIPI"],
                ctx: SPEDController
            },
            {
                url: "^sped/list/$",
                view: SPEDController.list,
                privileges: ["sped.readEFDICMSIPI"],
                ctx: SPEDController
            }, {
                url: "^sped/getSPEDs/$",
                view: SPEDController.getSPEDs,
                privileges: ["sped.readEFDICMSIPI"],
                ctx: SPEDController
            }, {
                url: "^sped/update/$",
                view: SPEDController.update,
                privileges: ["sped.updateEFDICMSIPI"],
                ctx: SPEDController
            }, {
                url: "^sped/deleteSPED/$",
                view: SPEDController.deleteSPED,
                privileges: ["sped.deleteEFDICMSIPI"],
                ctx: SPEDController
            }, {
                url: "^sped/sendToTrash/$",
                view: SPEDController.sendToTrash,
                privileges: ["sped.trashEFDICMSIPI"],
                ctx: SPEDController
            },  {
                url: "^sped/exportXML/$",
                view: SPEDController.exportXML,
                privileges: [],
                ctx: SPEDController
            }, {
                url: "^sped/eSocialSend/$",
                view: SPEDController.eSocialSend,
                privileges: ['sped.eSocialSend'],
                ctx: SPEDController
            }, {
                url: "^sped/eSocialList/$",
                view: SPEDController.list,
                privileges: ['sped.eSocialRead'],
                ctx: SPEDController
            }, {
                url: "^sped/restore/$",
                view: SPEDController.restore,
                privileges: ["sped.restoreEFDICMSIPI"],
                ctx: SPEDController
            }, {
                url: "^sped/createDialog/$",
                view: SPEDController.createDialog,
                privileges: ["sped.createEFDICMSIPI"],
                ctx: SPEDController
            }, {
                url: "^sped/getTDFTableColumns/$",
                view: SPEDController.getTableColumns,
                privileges: [],
                ctx: SPEDController
            }, {
                url: "^sped/createDialogEFDICMSIPIVariant/$",
                view: variantController.createDialogEFDICMSIPIVariant,
                privileges: [],
                ctx: variantController
            }, {
                url: "^sped/createVariant/$",
                view: variantController.createVariant,
                privileges: [],
                ctx: variantController
            }, {
                url: "^sped/execute/$",
                view: SPEDController.execute,
                privileges: ["sped.executeEFDICMSIPI"],
                ctx: SPEDController
            }, {
                url: "^sped/executeCalculationBlock/$",
                view: SPEDController.executeCalculationBlock,
                privileges: ["sped.executeEFDICMSIPI"],
                ctx: SPEDController
            }, {
                url: "^sped/createDialogEFDContributionsVariant/$",
                view: variantController.createDialogEFDContributionsVariant,
                privileges: [],
                ctx: variantController
            }, {
                url: "^sped/executeEFDContributions/$",
                view: SPEDController.executeEFDContributions,
                privileges: ["sped.executeEFDContributions"],
                ctx: SPEDController
            }, {
                url: "^sped/executeECF/$",
                view: SPEDController.executeECF,
                privileges: ["sped.executeECF"],
                ctx: SPEDController
            }, {
                url: "^sped/createDialogECDVariant/$",
                view: variantController.createDialogECDVariant,
                privileges: [],
                ctx: variantController
            }, {
                url: "^sped/executeECD/$",
                view: SPEDController.executeECD,
                privileges: ["sped.executeECF"],
                ctx: SPEDController
            }, {
                url: "^sped/createDialogEFCVariant/$",
                view: variantController.createDialogEFCVariant,
                privileges: [],
                ctx: variantController
            }, {
                url: "^sped/updateSPEDTables/$",
                view: SPEDController.updateSPEDTables,
                privileges: [],
                ctx: SPEDController
            }, {
                url: "^sped/saveRunId/$",
                view: SPEDController.saveRunId,
                privileges: [],
                ctx: SPEDController
            }, {
                url: "^sped/getReportFilesSPED/$",
                view: SPEDController.getReportFilesSPED,
                privileges: [],
                ctx: SPEDController
            }, {
                url: "^sped/exportTOMFile/$",
                view: SPEDController.exportTOMFile,
                privileges: ["sped.exportEFDICMSIPI"],
                ctx: SPEDController
            }, {
                url: "^sped/getTOMFileMetadata/$",
                view: SPEDController.getTOMFileMetadata,
                privileges: [],
                ctx: SPEDController
            }, {
                url: "^sped/dropSPEDLabels/$",
                view: SPEDController.dropSPEDLabels,
                privileges: [],
                ctx: SPEDController
            }, {
                url: "^sped/dropSPEDTDFTables/$",
                view: SPEDController.dropSPEDTDFTables,
                privileges: [],
                ctx: SPEDController
            },
            //END SPED
            {
                url: "^setting/execute1/$",
                view: setting.execute1,
                privileges: [],
                ctx: setting
            }, {
                url: "^layout/testTimeout/$",
                view: layout.testTimeout,
                privileges: [],
                ctx: layout
            }, {
                // Panel
                url: "^panel/listFiles/$",
                view: panel.listFiles,
                privileges: ["panel.read"],
                ctx: panel
            }, {
                url: "^panel/settingDialog/$",
                view: panel.settingDialog,
                privileges: [],
                ctx: panel
            }, {
                url: "^panel/createSettingPanel/$",
                view: panel.createSettingPanel,
                privileges: ["panelSetting.create"],
                ctx: panel
            }, {
                url: "^panel/updateSettingPanel/$",
                view: panel.updateSettingPanel,
                privileges: ["panelSetting.update"],
                ctx: panel
            }, {
                url: "^panel/createPanel/$",
                view: panel.createPanel,
                privileges: ["panel.create"],
                ctx: panel
            }, {
                url: "^panel/readPanel/$",
                view: panel.readPanel,
                privileges: ["panel.read"],
                ctx: panel
            }, {
                url: "^panel/readSettingPanel/$",
                view: panel.readSettingPanel,
                privileges: ["panelSetting.read"],
                ctx: panel
            }, {
                url: "^panel/updatePanel/$",
                view: panel.updatePanel,
                privileges: ["panelSetting.update"],
                ctx: panel
            }, {
                url: "^panel/approve/$",
                view: panel.approve,
                privileges: ["panel.approve"],
                ctx: panel
            }, {
                url: "^panel/readJustify/$",
                view: panel.readJustify,
                privileges: ["panel.justify"],
                ctx: panel
            }, {
                url: "^panel/creatJustify/$",
                view: panel.createJustify,
                privileges: ["panel.justify"],
                ctx: panel
            }, {
                url: "^panel/approvePVA/$",
                view: panel.approvePVA,
                privileges: ["panel.approve"],
                ctx: panel
            }, {
                url: "^panel/favorite/$",
                view: panel.setFavorite,
                privileges: ["panel.update"],
                ctx: panel
            }, {
                url: "^panel/unmarkfavorite/$",
                view: panel.removeFavorite,
                privileges: ["panel.update"],
                ctx: panel
            },

            //XSD Schemas
            {
                url: "^xsdSchemas/listXSDSchemas/$",
                view: xsdSchemas.listXSDSchemas,
                privileges: [],
                ctx: xsdSchemas
            }, //Added 02.06.2016 CMONT
            {
                url: "^xsdSchemas/listXSDSchemasBy/$",
                view: xsdSchemas.listXSDSchemasBy,
                privileges: [],
                ctx: xsdSchemas
            }, //Added 02.06.2016 CMONT

            //Zip Files
            {
                url: "^zipFiles/listZIPFiles/$",
                view: zipFiles.listZIPFiles,
                privileges: [],
                ctx: zipFiles
            }, //Added 11.06.2016 CMONT
            {
                url: "^zipFiles/listZIPFilesBy/$",
                view: zipFiles.listZIPFilesBy,
                privileges: [],
                ctx: zipFiles
            }, //Added 11.06.2016 CMONT
            {
                url: "^zipFiles/getCondensedZipFiles/$",
                view: zipFiles.getCondensedZipFiles,
                privileges: [],
                ctx: zipFiles
            }, //Added 14.08.2016 CMONT

            //Schemas Properties
            {
                url: "^schemasProperties/listSchemasProperties/$",
                view: schemasProperties.listSchemasProperties,
                privileges: [],
                ctx: schemasProperties
            }, //Added 26.07.2016 CMONT
            {
                url: "^schemasProperties/listSchemasPropertiesBy/$",
                view: schemasProperties.listSchemasPropertiesBy,
                privileges: [],
                ctx: schemasProperties
            }, //Added 26.07.2016 CMONT

            {
                url: "^commonFilters/list/$",
                view: external.getCommonFilters,
                privileges: [],
                ctx: external
            },
            {
                url: "^xmlFile/list/$",
                view: xmlFile.list,
                privileges: [],
                ctx: xmlFile
            },
            {
                url: "^xmlFile/createDigitalFile/$",
                view: xmlFile.createDigitalFile,
                privileges: [],
                ctx: xmlFile
            },
            {
                url: "^xmlFile/updateDigitalFile/$",
                view: xmlFile.updateDigitalFile,
                privileges: [],
                ctx: xmlFile
            },
            {
                url: "^xmlFile/deleteDigitalFile/$",
                view: xmlFile.deleteDigitalFile,
                privileges: [],
                ctx: xmlFile
            },
            {
                url: "^xmlFile/getFileByID/$",
                view: xmlFile.getFileByID,
                privileges: [],
                ctx: xmlFile
            },
            {
                url: "^xmlFile/getStructuresAndReportsByFile/$",
                view: xmlFile.getStructuresAndReportsByFile,
                privileges: [],
                ctx: xmlFile
            },

            {
                url: "^digitalFileType/list/$",
                view: digitalFileType.list,
                privileges: [],
                ctx: digitalFileType
            },
            {
                url: "^xmlFile/canShowXMLTab/$",
                view: xmlFile.canShowXMLTab,
                privileges: [],
                ctx: xmlFile
            }, {
                url: "^structureRelation/getStructureRelations/$",
                view: structureRelationController.getStructureRelations,
                privileges: [],
                ctx: structureRelationController
            }, {
                url: "^atr/getMandt/$",
                view: settingModel.table.getMandt,
                privileges: [],
                ctx: settingModel.table
            }
        ],
        "default": function() {
            $.response.status = 404; //404
            $.response.contentType = 'text/plain';
            var response = "<pre>\nUnknown URL:\n\n";
            var urls = [
                '---------------------------------------- LAYOUT ------------------------------------------------------------------',
                'CRUD -------------------------------------------------------------------------------------------------------------',
                '/createLayout/',
                '\tobjetc={"structureId":"1","layoutName":"Layout1","layoutDescription":"DescriptionLayout", "layoutType":1,"company":["company1","company2"],"branch":["branch1","branch2"],"area":["area1","area2"],"legalVersion":"1.1","timpVersion":"V1","versionDescription":"Descricao da versao","validFrom":"2014-07-15","validTo":"2015-07-15","layout":{}}',
                '/createLayoutVersion/',
                '\tobject={"idLayout":1,"legalVersion":"1.1","timpVersion":"V1","versionDescription":"Descricao da versao","validFrom":"2014-07-15","validTo":"2015-07-15","layout":{}}',
                '/readLayout/',
                '\tobject={"id":1}',
                '/readLayoutVersion/',
                '\tobject={"id":1}',
                '/updateLayout/',
                '\tobject = {"id":1,"idStructure":"1","isPublic":1,"layoutName":"Layout1","layoutDescription":"Description Layout","layoutType":1,"company":["company1","company2"],"branch":["branch1","branch2"],"area":["area1","area2"],"isDeleted":0,"areaType":1,"owner":102}',
                '/updateLayoutVersion/',
                '\tobject={"id":1,"idLayout":1,"legalVersion":"1.1","timpVersion":"V1","versionDescription":"Descricao da versao","validFrom":"2014-07-15","validTo":"2015-07-15","layout":{}}',
                '/deleteLayout/',
                '\tobject={"id":1}',
                '/deleteLayoutVersion/',
                '\tobject={"id":1}',
                '/readtLastVersion/',
                '\tobject={"idLayout":1}',
                '/readDefaultVersion/',
                '\tobject={"idLayout":1}',
                '------------------------------------------------------------------------------------------------------------------',
                '\n',
                'List -------------------------------------------------------------------------------------------------------------',
                '/listLayout/',
                '\tPossible values for "type":',
                '\t- simple     - trash',
                '\topcional - object={"type":"simple","idLayoutType":1, "empresa":"001", "filial":"0010", "area":"SP", "areaType":"1"}',
                '\tobject={}',
                '------------------------------------------------------------------------------------------------------------------',
                '\n',
                'Services ---------------------------------------------------------------------------------------------------------',
                '/copyLayout/',
                '\tobject={"id":1}',
                '/activateVersion/',
                '\tobject={"id":1}',
                '/verifyLayoutName/',
                '\tobject={"layoutName":"Nome do Layout"}',
                '/verifyVersionName/',
                '\tobject={"idLayout":1,"timpVersion":"V1","legalVersion":"V1.2.1"}',
                '/verifyDateVersion/',
                '\tobject={"idLayout":1,"validFrom":"2014-01-01","validTo":"2014-05-31"}',
                '/possibleDate/',
                '\tobject={"validFrom":"2014-01-01","validTo":"2014-05-31"}',
                '------------------------------------------------------------------------------------------------------------------',
                '\n',
                'Digital File -----------------------------------------------------------------------------------------------------',
                '/generateDigitalFile/',
                '\tPossible values for "retific":',
                '\t 0 = false     1 = true',
                '\tobject={"idLayout":25,"idVersion":18,"retific":0,"fileName":"Arquivo1","isDeleted":0,"legalVersion":"1.1","timpVersion":"V1","period":"","validFrom":"2014-01-01","validTo":"2020-12-31","layout":{"exemplo":"exemplo"}}',
                '/validateDigitalFileExecuted/',
                '\tobject={"id":1}',
                '------------------------------------------------------------------------------------------------------------------',
                '\n',
                'Layout Type ------------------------------------------------------------------------------------------------------',
                '/createLayoutType/',
                '\tobject={"typeName":"LayoutName","typeDescription":"Description Type"}',
                '/readLayoutType/',
                '\tobject={"id":1}',
                '/updateLayoutType/',
                '\tobject={"id":1,"typeName":"TypeLayoutNameEdited","typeDescription":"Description Type Edited"}',
                '/deleteLayoutType/',
                '\tobject={"id":1}',
                '/listLayoutType/',
                '\tobject={}',
                '------------------------------------------------------------------------------------------------------------------',
                '\n',
                '---------------------------------------- PRIVILEGES --------------------------------------------------------------',
                'CRUD -------------------------------------------------------------------------------------------------------------',
                '/getUserPrivileges/',
                '\tobject={}',
                '------------------------------------------------------------------------------------------------------------------',
                '\n',
                '---------------------------------------- DIGITAL FILE ------------------------------------------------------------',
                'CRUD -------------------------------------------------------------------------------------------------------------',
                '/readDigitalFile/',
                '\tobject={"id"=1}',
                '/deleteDigitalFile/',
                '\tobject={"id"=1}',
                '/rectifyDigitalFile/',
                '\tobject={"id"=1}',
                '/verifyRetific/',
                '\tobject={"idLayout"=1,"idVersion":1}',
                '\n',
                'List -------------------------------------------------------------------------------------------------------------',
                '/listDigitalFile/',
                '\tPossible values for "type":',
                '\t- simple     - trash',
                '\topcional - object={"id":1, "type":"simple", "idLayoutType":1, "idVersion":1}',
                '\tobject={}',
                '------------------------------------------------------------------------------------------------------------------',
                '\n',
                '------------------------------------------------------------------------------------------------------------------',
                '\n',
                'EXECUTE ----------------------------------------------------------------------------------------------------------',
                '/executeDigitalFile/',
                '\tobject={}',
                '/executeDigitalFile2/',
                '\tobject={}',
                '/executeDigitalFileTest/',
                '\tobject={"idLayout":197,"idVersion":88}',
                '/executeAsData/',
                '\tobject={"idLayout":197,"idVersion":88}',
                '/executeCsv/',
                '\tobject={"idLayout":197,"idVersion":88}',
                '/executeXls/',
                '\tobject={"idLayout":197,"idVersion":88}',
                '------------------------------------------------------------------------------------------------------------------'
            ];

            for (var i = 0; i < urls.length; i++) {
                if (urls[i][0] == '\t') {
                    response += urls[i] + "\n";
                } else {
                    response += "<b>" + urls[i] + "</b>\n";
                }
            }
            response += '</pre>';
            $.response.setBody(response);
            $.response.contentType = 'text/html';
        }
    });

    router.parseURL(null, 'dfg');

} catch (e2) {
    try {
        $.response.setBody("Error: " + util.parseError(e2));
    } catch (e) {
        $.response.setBody("Error in util? ");
    }
}