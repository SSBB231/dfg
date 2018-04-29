  $.import("timp.core.server.api", "api");
  var core_api = $.timp.core.server.api.api;
  var user = core_api.usersController;
  var util = core_api.util;
  var sql = core_api.sql;
  var fileCRUDFNew = core_api.fileCRUDFNew;
  var fileSystem = core_api.fileSystem;
  this.statusTypes = fileSystem.statusTypes;
  var fileFavsModel = core_api.fileFavs;
  var fileShareModel = core_api.fileShare;
  $.import("timp.atr.server.api", "api");
  var atr_api = $.timp.atr.server.api.api;
  var modelStructure = atr_api.structure.table;
  var structureGroupModel = atr_api.structureGroup;
  var controllerStructure = atr_api.structureController;
  var tributoModel = atr_api.tributo.table;
  var companyBranches = atr_api.companyBranches.table;

  const _ = $.lodash;

  $.import('timp.dfg.server.controllers', 'external');
  var controllerExternal = $.timp.dfg.server.controllers.external;

  $.import('timp.dfg.server.controllers', 'digitalFileType');
  var controllerDigitalFileType = $.timp.dfg.server.controllers.digitalFileType;
   //SETTING 
  $.import("timp.dfg.server.models", "settingVersion");
  var modelSettingVersionTable = $.timp.dfg.server.models.settingVersion.table;
   //LAYOUT VERSION
  $.import("timp.dfg.server.models", "layoutVersion");
  var modelLayoutVersiontable = $.timp.dfg.server.models.layoutVersion.table;
  $.import("timp.dfg.server.models", "layoutXStructure");
  var modelLayoutXStructure = $.timp.dfg.server.models.layoutXStructure;
   //DIGITAL FILE TYPE TEXT
  $.import("timp.dfg.server.models", "digitalFileTypeText");
  var modelDigitalFileTypeTextTable = $.timp.dfg.server.models.digitalFileTypeText.table;
   //DIGITAL FILE
  $.import("timp.dfg.server.models", "digitalFile");
  var modelDigitalFile = $.timp.dfg.server.models.digitalFile;
  $.import('timp.dfg.server.controllers', 'log');
  var logDFG = $.timp.dfg.server.controllers.log.Supervisor;
   //AN4 MODELS
  $.import("timp.dfg.server.models", "an4");
  var an4 = $.timp.dfg.server.models.an4;
  var modelAN4 = $.timp.dfg.server.models.an4.an4Table;
  var modelAN4XBFBLayout = $.timp.dfg.server.models.an4.an4XBFBLayout;
  var modelAN4XDigitalFile = $.timp.dfg.server.models.an4.an4XDigitalFile;
  var modelAN4XExternalFile = $.timp.dfg.server.models.an4.an4XExternalFile;
  var modelAN4XRule = $.timp.dfg.server.models.an4.an4XRule;
  var modelAN4Report = $.timp.dfg.server.models.an4.an4Report;
   //BRE
  $.import('timp.bre.server.api', 'api');
  var bre_api = $.timp.bre.server.api.api;
  var rules = bre_api.rulesController;
  var rulesModel = bre_api.rules;
  $.import("timp.atr.server.api", "api");
  var atr_api = $.timp.atr.server.api.api;
  var modelStructure = atr_api.structure.table;
   //BFB
  $.import("timp.bfb.server.api", 'api');
  var bfb_api = $.timp.bfb.server.api.api;
  var BFBlayoutModel = bfb_api.layoutTable;
   //VIEWS 
  $.import("timp.dfg.server.models.views", "cvAN4");
  var cvAn4 = $.timp.dfg.server.models.views.cvAN4.table;

  var DFG = {};
  this.status = {
  	ACTIVE: 100,
  	EMITTED: 200,
  	OFFICIAL: 300,
  	SENT: 400,
  	LOCKED: 500
  };

  this.searchKeys = {
  	name: "NAME",
  	id: "ID",
  	number: "ID",
  	rules: "ID_RULE",
  	company: "ID_COMPANY",
  	UF: "UF",
  	originReference: "ORIGIN_REFERENCE",
  	originComparison: "ORIGIN_COMPARISON",
  	branch: "ID_BRANCH",
  	tax: "ID_TAX",
  	creationUser: "CREATION_ID_USER",
  	modificationUser: "MODIFICATION_ID_USER",
  	creationDateTo: "CREATION_DATE",
  	creationDateFrom: "CREATION_DATE",
  	modificationDateTo: "MODIFICATION_DATE",
  	modificationDateFrom: "MODIFICATION_DATE"
  };
  /**
   *@param {String} action - Needed action for privilege
   *
   **/
  function getAccess(action) {
  	var hasAccess = true;
  	return hasAccess;
  }

  /**
   *@param {object} object - Endpoint parameter
   * @param {number} object.id - AN4's id
   **/
 this.read = function(object) {
    var an4File;
    const schema = $.schema.slice(1, -1);
    try {
        const an4CVModel = $.createBaseRuntimeModel("_SYS_BIC", "timp.dfg.modeling/CV_AN4", true);
        const an4XRuleModel = $.createBaseRuntimeModel(schema, "DFG::AN4XRule");
        const ruleModel = $.createBaseRuntimeModel(schema, "BRE::Rule");
        const modelLayoutVersion = $.createBaseRuntimeModel(schema, "DFG::LayoutVersion");
        const modelSettingVersion = $.createBaseRuntimeModel(schema, "DFG::SettingVersion");
        const modelDigitalFileTypeText = $.createBaseRuntimeModel(schema, "DFG::DigitalFileTypeText");
        const modelAN4ExternalFile = $.createBaseRuntimeModel(schema, "DFG::AN4XExternalFile");
        const modelAN4Report = $.createBaseRuntimeModel(schema, "DFG::AN4Report");
        const modelLayoutXStructure = $.createBaseRuntimeModel(schema, "DFG::LayoutXStructure");
        const modelStructure = $.createBaseRuntimeModel(schema, "ATR::Structure");
        const modelTribute = $.createBaseRuntimeModel(schema, "ATR::Tributo");
        if (object.hasOwnProperty("id")) {
            object.lang = $.getSessionLanguage();
        }
        var aliases = [{
            "name": "an4CV",
            "collection": an4CVModel.getIdentity(),
            "isPrimary": true
        }, {
            "name": "an4XRule",
            "collection": an4XRuleModel.getIdentity()
        }, {
            "name": "rule",
            "collection": ruleModel.getIdentity()
        }, {
            "name": "layoutVersionReference",
            "collection": modelLayoutVersion.getIdentity()
        }, {
            "name": "layoutVersionComparison",
            "collection": modelLayoutVersion.getIdentity()
        }, {
            "name": "settingReference",
            "collection": modelSettingVersion.getIdentity()
        }, {
            "name": "settingComparison",
            "collection": modelSettingVersion.getIdentity()
        }, {
            "name": "digitalFileTypeTextReference",
            "collection": modelDigitalFileTypeText.getIdentity()
        }, {
            "name": "digitalFileTypeTextComparison",
            "collection": modelDigitalFileTypeText.getIdentity()
        }, {
            "name": "externalFileReference",
            "collection": modelAN4ExternalFile.getIdentity()
        }, {
            "name": "externalFileComparison",
            "collection": modelAN4ExternalFile.getIdentity()
        }, {
            "name": "an4Report",
            "collection": modelAN4Report.getIdentity()
        }];
        //AN4 Fields
        var select = [{
            "field": "ID",
            "as": "id",
            "alias": "an4CV"
        }, {
            "field": "NAME",
            "as": "name",
            "alias": "an4CV"
        }, {
            "field": "DESCRIPTION",
            "as": "description",
            "alias": "an4CV"
        }, {
            "field": "BFB_LAYOUT_NAME_REFERENCE",
            "as": "bfbLayoutNameReference",
            "alias": "an4CV"
        }, {
            "field": "ID_B_F_B_LAYOUT_REFERENCE",
            "as": "idBFBLayoutReference",
            "alias": "an4CV"
        }, {
            "field": "DIGITAL_FILE_NAME_REFERENCE",
            "as": "digitalFileNameReference",
            "alias": "an4CV"
        }, {
            "field": "ID_DIGITAL_FILE_REFERENCE",
            "as": "idDigitalFileReference",
            "alias": "an4CV"
        }, {
            "field": "ID_EXTERNAL_FILE_REFERENCE",
            "as": "idExternalFileReference",
            "alias": "an4CV"
        }, {
            "field": "EXTERNAL_FILE_NAME_REFERENCE",
            "as": "externalFileNameReference",
            "alias": "an4CV"
        }, {
            "field": "ORIGIN_REFERENCE",
            "as": "originReference",
            "alias": "an4CV"
        }, {
            "field": "BFB_LAYOUT_NAME_COMPARISON",
            "as": "bfbLayoutNameComparison",
            "alias": "an4CV"
        }, {
            "field": "ID_B_F_B_LAYOUT_COMPARISON",
            "as": "idBFBLayoutComparison",
            "alias": "an4CV"
        }, {
            "field": "DIGITAL_FILE_NAME_COMPARISON",
            "as": "digitalFileNameComparison",
            "alias": "an4CV"
        }, {
            "field": "ID_DIGITAL_FILE_COMPARISON",
            "as": "idDigitalFileComparison",
            "alias": "an4CV"
        }, {
            "field": "ID_EXTERNAL_FILE_COMPARISON",
            "as": "idExternalFileComparison",
            "alias": "an4CV"
        }, {
            "field": "EXTERNAL_FILE_NAME_COMPARISON",
            "as": "externalFileNameComparison",
            "alias": "an4CV"
        }, {
            "field": "ORIGIN_COMPARISON",
            "as": "originComparison",
            "alias": "an4CV"
        }, {
            "field": "CREATION_USER",
            "as": "creationUser",
            "alias": "an4CV"
        }, {
            "field": "CREATION_ID_USER",
            "as": "creationIdUser",
            "alias": "an4CV"
        }, {
            "field": "CREATION_DATE",
            "as": "creationDate",
            "alias": "an4CV"
        }, {
            "field": "MODIFICATION_USER",
            "as": "modificationUser",
            "alias": "an4CV"
        }, {
            "field": "MODIFICATION_ID_USER",
            "as": "modificationIdUser",
            "alias": "an4CV"
        }, {
            "field": "MODIFICATION_DATE",
            "as": "modificationDate",
            "alias": "an4CV"
        }, {
            "field": "ID_SETTING_VERSION_REFERENCE",
            "as": "idSettingVersionReference",
            "alias": "an4CV"
        }, {
            "field": "ID_DIGITAL_FILE_TYPE_REFERENCE",
            "as": "idDigitalFileTypeReference",
            "alias": "an4CV"
        }, {
            "field": "ID_SETTING_VERSION_COMPARISON",
            "as": "idSettingVersionComparison",
            "alias": "an4CV"
        }, {
            "field": "ID_DIGITAL_FILE_TYPE_COMPARISON",
            "as": "idDigitalFileTypeComparison",
            "alias": "an4CV"
        }, {
            "field": "STATUS",
            "as": "status",
            "alias": "an4CV"
        }, {
            "field": "MONTH_REFERENCE",
            "as": "monthReference",
            "alias": "an4CV"
        }, {
            "field": "YEAR_REFERENCE",
            "as": "yearReference",
            "alias": "an4CV"
        }, {
            "field": "SUBPERIOD_REFERENCE",
            "as": "subperiodReference",
            "alias": "an4CV"
        }, {
            "field": "ID_COMPANY_REFERENCE",
            "as": "idCompanyReference",
            "alias": "an4CV"
        }, {
            "field": "ID_BRANCH_REFERENCE",
            "as": "idBranchReference",
            "alias": "an4CV"
        }, {
            "field": "UF_REFERENCE",
            "as": "ufReference",
            "alias": "an4CV"
        }, {
            "field": "ID_TAX_REFERENCE",
            "as": "idTaxReference",
            "alias": "an4CV"
        }, {
            "field": "ID_LAYOUT_VERSION_REFERENCE",
            "as": "idLayoutVersionReference",
            "alias": "an4CV"
        }, {
            "field": "MONTH_COMPARISON",
            "as": "monthComparison",
            "alias": "an4CV"
        }, {
            "field": "YEAR_COMPARISON",
            "as": "yearComparison",
            "alias": "an4CV"
        }, {
            "field": "SUBPERIOD_COMPARISON",
            "as": "subperiodComparison",
            "alias": "an4CV"
        }, {
            "field": "ID_COMPANY_COMPARISON",
            "as": "idCompanyComparison",
            "alias": "an4CV"
        }, {
            "field": "ID_BRANCH_COMPARISON",
            "as": "idBranchComparison",
            "alias": "an4CV"
        }, {
            "field": "UF_COMPARISON",
            "as": "ufComparison",
            "alias": "an4CV"
        }, {
            "field": "ID_TAX_COMPARISON",
            "as": "idTaxComparison",
            "alias": "an4CV"
        }, {
            "field": "ID_LAYOUT_VERSION_COMPARISON",
            "as": "idLayoutVersionComparison",
            "alias": "an4CV"
        }];
        select.push({
            "field": "ID",
            "as": "id",
            "alias": "rule"
        }, {
            "field": "NAME",
            "as": "name",
            "alias": "rule"
        }, {
            "field": "JSON",
            "as": "json",
            "alias": "layoutVersionReference"
        }, {
            "field": "ID_LAYOUT",
            "as": "idLayout",
            "alias": "layoutVersionReference"
        }, {
            "field": "JSON",
            "as": "json",
            "alias": "layoutVersionComparison"
        }, {
            "field": "ID_LAYOUT",
            "as": "idLayout",
            "alias": "layoutVersionComparison"
        }, {
            "field": "ID_SETTING",
            "as": "idSetting",
            "alias": "settingComparison"
        }, {
            "field": "ID_SETTING",
            "as": "idSetting",
            "alias": "settingReference"
        }, {
            "field": "NAME",
            "as": "name",
            "alias": "digitalFileTypeTextReference"
        }, {
            "field": "NAME",
            "as": "name",
            "alias": "digitalFileTypeTextComparison"
        }, {
            "field": "EXTERNAL_FILE",
            "as": "externalFile",
            "alias": "externalFileReference"
        }, {
            "field": "EXTERNAL_FILE",
            "as": "externalFile",
            "alias": "externalFileComparison"
        }, {
            "field": "ID",
            "as": "id",
            "alias": "an4Report"
        }, {
            "field": "NAME",
            "as": "name",
            "alias": "an4Report"
        }, {
            "field": "DESCRIPTION",
            "as": "description",
            "alias": "an4Report"
        }, {
            "field": "REPORT",
            "as": "report",
            "alias": "an4Report"
        });
        var join = [{
            alias: "an4XRule",
            type: "inner",
            on: [{
                field: "ID_AN4",
                "alias": "an4XRule",
                operator: "$eq",
                "value": {
                    "field": "ID",
                    "alias": "an4CV"
                }
            }]
        }, {
            alias: "rule",
            map: "rule",
            type: "inner",
            on: [{
                "field": "ID",
                "alias": "rule",
                "operator": "$eq",
                "value": {
                    "field": "ID_RULE",
                    "alias": "an4XRule"
                }
            }]
        }, {
            alias: "layoutVersionReference",
            map: "layoutVersionReference",
            type: "inner",
            on: [{
                field: "ID",
                alias: "layoutVersionReference",
                "operator": "$eq",
                "value": {
                    "field": "ID_LAYOUT_VERSION_REFERENCE",
                    "alias": "an4CV"
                }
            }]
        }, {
            alias: "layoutVersionComparison",
            map: "layoutVersionComparison",
            type: "inner",
            on: [{
                field: "ID",
                alias: "layoutVersionComparison",
                "operator": "$eq",
                "value": {
                    "field": "ID_LAYOUT_VERSION_COMPARISON",
                    "alias": "an4CV"
                }
            }]
        }, {
            alias: "settingReference",
            type: "left",
            map: "settingReference",
            on: [{
                field: "ID",
                "alias": "settingReference",
                "operator": "$eq",
                "value": {
                    "field": "ID_SETTING_VERSION_REFERENCE",
                    "alias": "an4CV"
                }
            }]
        }, {
            alias: "settingComparison",
            type: "left",
            map: "settingComparison",
            on: [{
                field: "ID",
                "alias": "settingComparison",
                "operator": "$eq",
                "value": {
                    "field": "ID_SETTING_VERSION_COMPARISON",
                    "alias": "an4CV"
                }
            }]
        }, {
            alias: "digitalFileTypeTextReference",
            map: "digitalFileTypeTextReference",
            type: "inner",
            on: [{
                field: "ID_DIGITAL_FILE_TYPE",
                "alias": "digitalFileTypeTextReference",
                "operator": "$eq",
                value: {
                    "field": "ID_DIGITAL_FILE_TYPE_REFERENCE",
                    "alias": "an4CV"
                }
            }, {
                field: "LANG",
                "alias": "digitalFileTypeTextReference",
                operator: "$eq",
                value: object.lang
            }]
        },  {
            alias: "digitalFileTypeTextComparison",
            map: "digitalFileTypeTextComparison",
            type: "inner",
            on: [{
                field: "ID_DIGITAL_FILE_TYPE",
                "alias": "digitalFileTypeTextComparison",
                "operator": "$eq",
                value: {
                    "field": "ID_DIGITAL_FILE_TYPE_COMPARISON",
                    "alias": "an4CV"
                } 
            }, {
                field: "LANG",
                "alias": "digitalFileTypeTextComparison",
                operator: "$eq",
                value: object.lang
            }]
        }, {
            alias: "externalFileReference",
            map: "externalFileReference",
            type: "left",
            on: [{
                field: "ID",
                "alias": "externalFileReference",
                "operator": "$eq",
                "value": {
                    "field": "ID_EXTERNAL_FILE_REFERENCE",
                    "alias": "an4CV"
                }
            }]
        }, {
            alias: "externalFileComparison",
            map: "externalFileComparison",
            type: "left",
            on: [{
                field: "ID",
                "alias": "externalFileComparison",
                "operator": "$eq",
                "value": {
                    "field": "ID_EXTERNAL_FILE_COMPARISON",
                    "alias": "an4CV"
                }
            }]
        }, {
            alias: "an4Report",
            type: "left",
            map: "reports",
            on: [{
                field: "ID_AN4",
                alias: "an4Report",
                "operator": "$eq",
                "value": {
                    "field": "ID",
                    "alias": "an4CV"
                }
            }, {
                field: "CREATION_USER",
                "alias": "an4Report",
                operator: "$eq",
                value: $.getUserID()
            }]
        }];
        var where = [{
            "field": "ID",
            "alias": "an4CV",
            "operator": "$eq",
            "value": Number(object.id)
        }];
        an4File = an4CVModel.find({
            "aliases": aliases,
            "select": select,
            "join": join,
            "where": where
        });
        if ($.lodash.isEmpty(an4File.errors)) {
            an4File = an4File.results[0];
            if (an4File) {
                var structureIds = modelLayoutXStructure.find({
                    select: [{
                        "field": "ID_STRUCTURE",
                        "as": "idStructure"
                    }],
                    "distinct": true,
                    where: [{
                        "field": "ID_LAYOUT",
                        "operator": "$in",
                        "value": [an4File.layoutVersionComparison[0].idLayout, an4File.layoutVersionReference[0].idLayout]
                    }]
                });
                if ($.lodash.isEmpty(structureIds.errors)) {
                    structureIds = structureIds.results.map(function(s) {
                        return s.idStructure;
                    });
                }
                an4File.structure = modelStructure.find({
                    select: [{
                        "field": "ID",
                        "as": "id"
                    }, {
                        "field": "title",
                        "as": "title"
                    }, {
                        "field": "JSON",
                        'as': "structure"
                    }],
                    "where": [{
                        "field": "ID",
                        "operator": "$in",
                        "value": structureIds
                    }]
                }).results;
                an4File.taxInfoComparison = modelTribute.find({
                    select: [{
                        "field": "COD_TRIBUTO",
                        "as": "codTributo"
                    }, {
                        "field": "DESCR_COD_TRIBUTO_LABEL",
                        "as": "descrCodTributoLabel"
                    }],
                    "where": [{
                        "field": "COD_TRIBUTO",
                        "operator": "$eq",
                        "value": an4File.idTaxComparison
                    }]
                }).results[0];
                an4File.taxInfoReference = modelTribute.find({
                    select: [{
                        "field": "COD_TRIBUTO",
                        "as": "codTributo"
                    }, {
                        "field": "DESCR_COD_TRIBUTO_LABEL",
                        "as": "descrCodTributoLabel"
                    }],
                    "where": [{
                        "field": "COD_TRIBUTO",
                        "operator": "$eq",
                        "value": an4File.idTaxReference
                    }]
                }).results[0];
            }
        }
    } catch (e) {
        $.trace.error(e);
        $.messageCodes.push({
            type: "E",
            code: "DFG215015",
            errorInfo: util.parseError(e)
        });
    }
    return an4File;
};
  /**
   * @param {object} object - Endpoint parameter
   * @param {string} object.key - Key used to identify the type of listing to be done
   * @param {boolean | optional} object.counter - Optional parameter brings count results for all types of AN4 Files
   * @param {object | optional} object.counter - Optional parameter brings the count for a specified type of AN4 Files
   * @return {object} object.counter - Array with list of counters for specified AN4 Files types
   */
  this.listFiles = function(object) {
  	var response = {
  		list: []
  	};
  	const schema = $.schema.slice(1, -1);
  	try {
  		if (!getAccess("read")) {
  			$.messageCodes.push({
  				"code": "DFG213000",
  				"type": "E"
  			});
  			return response;
  		}
  		const an4CVModel = $.createBaseRuntimeModel("_SYS_BIC", "timp.dfg.modeling/CV_AN4", true);
  		const fileShareModel = $.createBaseRuntimeModel(schema, "CORE::FileShare");
  		const fileFavsModel = $.createBaseRuntimeModel(schema, "CORE::FileFavs");
  		const an4XRuleModel = $.createBaseRuntimeModel(schema, "DFG::AN4XRule");
  		const ruleModel = $.createBaseRuntimeModel(schema, "BRE::Rule");
  		var aliases = [{
  			"name": "an4CV",
  			"collection": an4CVModel.getIdentity(),
  			"isPrimary": true
        }, {
  			"name": "fileShare",
  			"collection": fileShareModel.getIdentity()
        }, {
  			"name": "fileFavs",
  			"collection": fileFavsModel.getIdentity()
        }, {
  			"name": "an4XRule",
  			"collection": an4XRuleModel.getIdentity()
        }, {
  			"name": "rule",
  			"collection": ruleModel.getIdentity()
        }];
  		//AN4 Fields
  		var select = [{
  			"field": "ID",
  			"as": "id",
  			"alias": "an4CV"
  		}, {
  			"field": "NAME",
  			"as": "name",
  			"alias": "an4CV"
  		}, {
  			"field": "DESCRIPTION",
  			"as": "description",
  			"alias": "an4CV"
  		}, {
  			"field": "BFB_LAYOUT_NAME_REFERENCE",
  			"as": "bfbLayoutNameReference",
  			"alias": "an4CV"
  		}, {
  			"field": "ID_B_F_B_LAYOUT_REFERENCE",
  			"as": "idBFBLayoutReference",
  			"alias": "an4CV"
  		}, {
  			"field": "DIGITAL_FILE_NAME_REFERENCE",
  			"as": "digitalFileNameReference",
  			"alias": "an4CV"
  		}, {
  			"field": "ID_DIGITAL_FILE_REFERENCE",
  			"as": "idDigitalFileReference",
  			"alias": "an4CV"
  		}, {
  			"field": "ID_EXTERNAL_FILE_REFERENCE",
  			"as": "idExternalFileReference",
  			"alias": "an4CV"
  		}, {
  			"field": "EXTERNAL_FILE_NAME_REFERENCE",
  			"as": "externalFileNameReference",
  			"alias": "an4CV"
  		}, {
  			"field": "ORIGIN_REFERENCE",
  			"as": "originReference",
  			"alias": "an4CV"
  		}, {
  			"field": "BFB_LAYOUT_NAME_COMPARISON",
  			"as": "bfbLayoutNameComparison",
  			"alias": "an4CV"
  		}, {
  			"field": "ID_B_F_B_LAYOUT_COMPARISON",
  			"as": "idBFBLayoutComparison",
  			"alias": "an4CV"
  		}, {
  			"field": "DIGITAL_FILE_NAME_COMPARISON",
  			"as": "digitalFileNameComparison",
  			"alias": "an4CV"
  		}, {
  			"field": "ID_DIGITAL_FILE_COMPARISON",
  			"as": "idDigitalFileComparison",
  			"alias": "an4CV"
  		}, {
  			"field": "ID_EXTERNAL_FILE_COMPARISON",
  			"as": "idExternalFileComparison",
  			"alias": "an4CV"
  		}, {
  			"field": "EXTERNAL_FILE_NAME_COMPARISON",
  			"as": "externalFileNameComparison",
  			"alias": "an4CV"
  		}, {
  			"field": "ORIGIN_COMPARISON",
  			"as": "originComparison",
  			"alias": "an4CV"
  		}, {
  			"field": "CREATION_USER",
  			"as": "creationUser",
  			"alias": "an4CV"
  		}, {
  			"field": "CREATION_ID_USER",
  			"as": "creationIdUser",
  			"alias": "an4CV"
  		}, {
  			"field": "CREATION_DATE",
  			"as": "creationDate",
  			"alias": "an4CV"
  		}, {
  			"field": "MODIFICATION_USER",
  			"as": "modificationUser",
  			"alias": "an4CV"
  		}, {
  			"field": "MODIFICATION_ID_USER",
  			"as": "modificationIdUser",
  			"alias": "an4CV"
  		}, {
  			"field": "MODIFICATION_DATE",
  			"as": "modificationDate",
  			"alias": "an4CV"
  		}, {
  			"field": "ID_SETTING_VERSION_REFERENCE",
  			"as": "idSettingVersionReference",
  			"alias": "an4CV"
  		}, {
  			"field": "ID_DIGITAL_FILE_TYPE_REFERENCE",
  			"as": "idDigitalFileTypeReference",
  			"alias": "an4CV"
  		}, {
  			"field": "ID_SETTING_VERSION_COMPARISON",
  			"as": "idSettingVersionComparison",
  			"alias": "an4CV"
  		}, {
  			"field": "ID_DIGITAL_FILE_TYPE_COMPARISON",
  			"as": "idDigitalFileTypeComparison",
  			"alias": "an4CV"
  		}, {
  			"field": "STATUS",
  			"as": "status",
  			"alias": "an4CV"
  		}, {
  			"field": "MONTH_REFERENCE",
  			"as": "monthReference",
  			"alias": "an4CV"
  		}, {
  			"field": "YEAR_REFERENCE",
  			"as": "yearReference",
  			"alias": "an4CV"
  		}, {
  			"field": "SUBPERIOD_REFERENCE",
  			"as": "subperiodReference",
  			"alias": "an4CV"
  		}, {
  			"field": "ID_COMPANY_REFERENCE",
  			"as": "idCompanyReference",
  			"alias": "an4CV"
  		}, {
  			"field": "ID_BRANCH_REFERENCE",
  			"as": "idBranchReference",
  			"alias": "an4CV"
  		}, {
  			"field": "UF_REFERENCE",
  			"as": "ufReference",
  			"alias": "an4CV"
  		}, {
  			"field": "ID_TAX_REFERENCE",
  			"as": "idTaxReference",
  			"alias": "an4CV"
  		}, {
  			"field": "ID_LAYOUT_VERSION_REFERENCE",
  			"as": "idLayoutVersionReference",
  			"alias": "an4CV"
  		}, {
  			"field": "MONTH_COMPARISON",
  			"as": "monthComparison",
  			"alias": "an4CV"
  		}, {
  			"field": "YEAR_COMPARISON",
  			"as": "yearComparison",
  			"alias": "an4CV"
  		}, {
  			"field": "SUBPERIOD_COMPARISON",
  			"as": "subperiodComparison",
  			"alias": "an4CV"
  		}, {
  			"field": "ID_COMPANY_COMPARISON",
  			"as": "idCompanyComparison",
  			"alias": "an4CV"
  		}, {
  			"field": "ID_BRANCH_COMPARISON",
  			"as": "idBranchComparison",
  			"alias": "an4CV"
  		}, {
  			"field": "UF_COMPARISON",
  			"as": "ufComparison",
  			"alias": "an4CV"
  		}, {
  			"field": "ID_TAX_COMPARISON",
  			"as": "idTaxComparison",
  			"alias": "an4CV"
  		}, {
  			"field": "ID_LAYOUT_VERSION_COMPARISON",
  			"as": "idLayoutVersionComparison",
  			"alias": "an4CV"
  		}];
  		select.push({
  			"field": "ID",
  			"as": "id",
  			"alias": "fileShare"
  		}, {
  			"field": "ID",
  			"as": "id",
  			"alias": "fileFavs"
  		}, {
  			"field": "ID",
  			"as": "id",
  			"alias": "rule"
  		}, {
  			"field": "NAME",
  			"as": "name",
  			"alias": "rule"
  		});
  		var join = [];
  		var where = [];
  		var paginate = {
  		    "field": "ID",
  		    "alias": "an4CV",
  		    "operator": "$in",
  		    "value": {
  		        "collection": an4CVModel.getIdentity(),
  		        "query": {
  		            "select": [{
  		                "field": "ID"
  		            }],
  		            "paginate": {
  		                "offset": (Number(object.number)-1)*15,
  		                "limit": 15
  		            }
  		        }
  		    }
  		};
  		if (object.key && object.key !== "CREATE") {
            where.push(paginate);
  		}
  		if (object.hasOwnProperty("key") && object.key) {
  			var statusValue = [];
  			switch (object.key) {
  				case "PUBLIC":
  					statusValue.push(this.statusTypes.PUBLIC);
  					break;
  				case "CREATE":
  				case "ACTIVE":
  					statusValue.push(this.statusTypes.ACTIVE);
  					statusValue.push(this.statusTypes.PUBLIC);
  					where.push({
  						field: "CREATION_ID_USER",
  						operator: "$eq",
  						"alias": "an4CV",
  						value: $.getUserID()
  					});
  					break;
  				case "TRASH":
  					statusValue.push(this.statusTypes.TRASH);
  					where.push({
  						field: "CREATION_ID_USER",
  						operator: "$eq",
  						alias: "an4CV",
  						value: $.getUserID()
  					});
  					break;
  				case "STANDARD":
  					statusValue.push(this.statusTypes.STANDARD);
  					break;
  				case "FAVORITE":
  					join.push({
  						"alias": "fileFavs",
  						"map": "favorite",
  						"type": "right",
  						"on": [{
  							"field": "ID_FILE",
  							"alias": "fileFavs",
  							"operator": "$eq",
  							"value": {
  								"field": "ID_CORE_FILE",
  								"alias": "an4CV"
  							}
                        }]
  					});
  					where.push({
  						field: "STATUS",
  						alias: "an4CV",
  						operator: "$neq",
  						value: this.statusTypes.TRASH
  					});
  					where.push({
  						field: "STATUS",
  						"alias": "an4CV",
  						operator: "$neq",
  						value: this.statusTypes.DELETED
  					});
  					break;
  				case "SHARED":
  					join.push({
  						alias: "fileShare",
  						"type": "right",
  						"map": "share",
  						on: [{
  							"field": "ID_FILE",
  							"alias": "fileShare",
  							"operator": "$eq",
  							"value": {
  								"field": "ID_CORE_FILE",
  								"alias": "an4CV"
  							}
                        }, {
  							"field": "ID_USER",
  							"operator": "$eq",
  							"alias": "fileShare",
  							"value": $.getUserID()
                        }]
  					});
  					where.push({
  						field: "STATUS",
  						alias: "an4CV",
  						operator: "$neq",
  						value: this.statusTypes.TRASH
  					});
  					where.push({
  						field: "STATUS",
  						alias: "an4CV",
  						operator: "$neq",
  						value: this.statusTypes.DELETED
  					});
  					break;

  			}
  			if (object.key !== "FAVORITE") {
  				join.push({
  					"alias": "fileFavs",
  					"map": "favorite",
  					"type": "left",
  					"on": [{
  						"field": "ID_FILE",
  						"alias": "fileFavs",
  						"operator": "$eq",
  						"value": {
  							"field": "ID_CORE_FILE",
  							"alias": "an4CV"
  						}
                    }, {
  						"field": "ID_USER",
  						"alias": "fileFavs",
  						"value": $.getUserID(),
  						"operator": "$eq"
                    }]
  				});
  			}
  			if (statusValue.length > 0) {
  				where.push({
  					field: "STATUS",
  					alias: "an4CV",
  					operator: "$in",
  					value: statusValue
  				});
  			}

  		}
  		if (object.hasOwnProperty("idFolder") && object.idFolder) {
  			where.push({
  				field: "ID_FOLDER",
  				alias: "an4CV",
  				operator: "$eq",
  				value: object.idFolder
  			});
  			where.push({
  				field: "STATUS",
  				alias: "an4CV",
  				operator: "$neq",
  				value: this.statusTypes.TRASH
  			});
  			where.push({
  				field: "STATUS",
  				alias: "an4CV",
  				operator: "$neq",
  				value: this.statusTypes.DELETED
  			});
  			where.push({
  				field: "CREATION_ID_USER",
  				alias: "an4CV",
  				operator: "$eq",
  				value: $.getUserID()
  			});
  		}
  		
  		
  		
  		join.push({
  			alias: "an4XRule",
  			type: "inner",
  			"on": [{
  				"field": "ID_AN4",
  				"alias": "an4XRule",
  				"operator": "$eq",
  				"value": {
  					"field": "ID",
  					"alias": "an4CV"
  				}
        	}]
  		}, {
  			"alias": "rule",
  			"type": "inner",
  			"map": "rule",
  			"on": [{
  				"field": "ID",
  				"alias": "rule",
  				"operator": "$eq",
  				"value": {
  					"field": "ID_RULE",
  					"alias": "an4XRule"
  				}
  			}]
  		});
  		if (object.searchParams) {
  		    var searchOR = [];
  			for (var p in object.searchParams) {
  				if (this.searchKeys.hasOwnProperty(p) && this.searchKeys[p] && object.searchParams[p] !== "") {
  					switch (this.searchKeys[p]) {
  						case "creationDate":
  						case "modificationDate":
  							where.push({
  								field: this.searchKeys[p],
  								operator: "$gte",
  								alias: "an4CV",
  								value: object.searchParams[p].split("T")[0] + "T00:00.000Z"
  							});
  							where.push({
  								field: this.searchKeys[p],
  								operator: "$lte",
  								alias: "an4CV",
  								value: object.searchParams[p].split("T")[0] + "T23:59.999Z"
  							});
  							break;
  						case "idCompany":
  						case "idBranch":
  						case "uf":
  						case "idTax":
  							where.push([{
  								field: this.searchKeys[p]+"_REFERENCE",
  								operator: "$eq",
  								"alias": "an4CV",
  								value: object.searchParams[p]
 							}, {
  								field: this.searchKeys[p]+ "_COMPARISON",
  								operator: "$eq",
  								alias: "an4CV",
  								value: object.searchParams[p]
 							}]);
  							break;
  						default:
      					//if we receive a name filter, we'll push it as an id
                			if (!isNaN(object.searchParams[p]) && !object.searchParams.hasOwnProperty("id")) {
                				searchOR.push({
                					"field": "ID",
                					"alias": "an4CV",
                					"operator": "$eq",
                					"value": parseInt(object.searchParams[p])
                				});
                
                			}
                			
                			searchOR.push({
                				"field": this.searchKeys[p].toUpperCase(),
                				"operator": isNaN(object.searchParams[p]) ? "$like" : "$eq",
                				"alias": "an4CV",
                				"value": isNaN(object.searchParams[p]) ? ("%" + object.searchParams[p].toUpperCase() + "%") : object.searchParams[p],
                				"maskFn": 'UPPER'
                			});
  					}

  				}
  			}
  			if (searchOR.length) {
                where.push(searchOR);
            }
  		}
  		
  		if (object.hasOwnProperty("searchParams") && object.key === "FOLDER") {
  			where.push({
  				field: "CREATION_ID_USER",
  				alias: "an4CV",
  				operator: "$eq",
  				value: $.getUserID()
  			});
  		}
  		var an4Files = an4CVModel.find({
  			"aliases": aliases,
  			"select": select,
  			"join": join,
  			"where": where,
  			"orderBy": [{
  			    "field": "ID",
  			    "alias": "an4CV",
  			    "type": "asc"
  			}]
  		});
  		if($.lodash.isEmpty(an4Files.errors)){
  		    response.list = an4Files.results;
  		}
  		if (object.hasOwnProperty("counter") && object.counter) {
  		    var parameters = {
  				objectType: "DFG::AN4",
  				counter: true
  			};
  			if (typeof object.counter === "object") {
  				for (var key in object.counter) {
  					if (object.counter.hasOwnProperty(key)) {
  						parameters[key] = object.counter[key];
  					}
  				}
  				response.counters = fileCRUDFNew.getFileCounters(parameters);
  			} else {
  				response.counters = fileCRUDFNew.getFileCounters(parameters);
  			}
  			response.filterOptions = this.filters();
  		}
  		return response;
  	} catch (e) {
        $.trace.error(e);
  		$.messageCodes.push({
  			type: "E",
  			code: "DFG213002",
  			errorInfo: util.parseError(e)
  		});
  	}
  	return response;
  };

  this.createDialog = function() {
  	var response = {
  		an4: [],
  		digitalFileTypes: []
  	};
  	try {
  		response.an4 = this.listFiles({
  			key: "CREATE"
  		}).list;
  		response.digitalFileTypes = controllerDigitalFileType.list();
  	} catch (e) {
  		$.trace.error(e);
  		$.messageCodes.push({
  			type: "E",
  			code: "DFG213002",
  			errorInfo: util.parseError(e)
  		});
  	}
  	return response;
  };
  /**
   * @param{object} object - Endpoint parameter
   * @param{string} object.name
   * @param{string} object.description
   * @param{number} object.idLayoutVersion
   * @param{number} object.origin
   * @param{number | optional} object.idBFBLayout
   * @param{string | optional} object.externalFile
   * @param{number | optional} object.digitalFile
   * @param{array<Integer>} object.idRules
   */
  this.create = function(object) {
  	var response;
  	try {
  		if (!getAccess("create")) {
  			$.messageCodes.push({
  				"code": "DFG213007",
  				"type": "E"
  			});
  			return response;
  		}
  		response = an4.createAN4(object);
  		if (object.idFolder === undefined) {
  			object.idFolder = -1;
  		}
  		if (object.idFolder && response.id) {
  			var objectToCreateFile = {
  				idFolder: object.idFolder,
  				idObject: response.id,
  				objectType: "DFG::AN4"

  			};
  			fileCRUDFNew.createFile(objectToCreateFile);
  		}
  		var logRegister = new logDFG();
  		logRegister.createAN4(response);
  	} catch (e) {
  		$.messageCodes.push({
  			"code": "DFG213012",
  			"type": "E",
  			errorInfo: util.parseError(e)
  		});
  	}
  	return response;
  };
  /**
   * @param {object} object - Endpoint object
   * @param {number} object.idAN4
   * @param {object} object.report
   * @param {string} object.name
   * @param {string} object.description
   **/
  this.createAN4Report = function(object) {
  	var response;
  	try {
  		if (!getAccess("createReport")) {
  			$.messageCodes.push({
  				"code": "DFG213010",
  				"type": "E"
  			});
  			return response;
  		}
  		response = modelAN4Report.createAN4Report(object);
  	} catch (e) {
  		$.messageCodes.push({
  			"code": "DFG213011",
  			"type": "E",
  			errorInfo: util.parseError(e)
  		});
  	}
  	return response;
  };
  /**
 * @param{object} object - Endpoint parameter
 * @param{string} object.name
 * @param{string} object.description

 */
  this.update = function(object) {
  	var response;
  	try {
  		if (!getAccess("update")) {
  			$.messageCodes.push({
  				"code": "DFG213009",
  				"type": "E"
  			});
  			return response;
  		}
  		var where = [{
  			field: "id",
  			oper: "=",
  			value: object.id
         }];
  		response = an4.updateAN4(object, where);

  	} catch (e) {
  		$.messageCodes.push({
  			"code": "DFG213009",
  			"type": "E",
  			errorInfo: util.parseError(e)
  		});
  	}
  	return response;
  };
  /**
   * @param {object} searchParams - endPoint Filters
   * @param {array} where - query Where Clause
   * @param {number} searchParams.rule - idRule
   * @param {date}  searchParams.creationDateFrom - first range for the creationDate clause
   * @param {date} searchParams.creationDateTo - second range for the creationDate clause
   * @param {date}  searchParams.modificationDateFrom - first range for the modificationDate clause
   * @param {date} searchParams.modificationDateTo - second range for the modificationDate clause
   *
  this.evalSearchParams = function(searchParams, where) {
    var searchOR = [];
	for (var i in searchParams) {
	    if (_.isNil(searchParams[i]) || searchParams[i] === '') {
            continue;
	    }
		if (this.searchKeys[i] !== "creationDate" && this.searchKeys[i] !== "modificationDate") {
				if (this.searchKeysLayout.hasOwnProperty(i)) {
			//if we receive a name filter, we'll push it as an id
			if (!isNaN(searchParams[i]) && !searchParams.hasOwnProperty("id")) {
				searchOR.push({
					field: "id",
					oper: "=",
					value: searchParams[i]
				});

			}
			searchOR.push({
				field: this.searchKeysLayout[i],
				oper: i === "name" ? "LIKE" : "=",
				value: i === "name" ? ("%" + searchParams[i].toUpperCase() + "%") : searchParams[i],
				maskFn: 'UPPER'
			});
		} else {
			var date = searchParams[i].split("T")[0];
			where.push({
				field: this.searchKeys[i],
				oper: (i === "creationDateFrom" || i === "modificationDateFrom") ? ">=" : "<=",
				value: date
			});
		}

	}
}

//We push the Or array
		if (searchOR.length) {
            where.push(searchOR);
		}
  };
*/
  /**
   * @param {object} object - Endpoint parameter.
   * @param {number array} object.idObject - Array of file IDs
   * @return {object array} response - Array with all files added to favorites
   */
  this.setFavorite = function(object) {
  	var unFavorites = [];
  	var favorites = [];
  	for (var element = 0; element < object.ids.length; element++) {
  		if (object.ids[element].status) {
  			favorites.push(object.ids[element].id);
  		} else {
  			unFavorites.push(object.ids[element].id);
  		}
  	}
  	var result = {};
  	if (unFavorites.length) {
  		result.favorites = fileCRUDFNew.markFavorite({
  			objectType: "DFG::AN4",
  			idObject: unFavorites
  		});
  	}
  	if (favorites.length) {
  		result.unFavorites = fileCRUDFNew.unmarkFavorite({
  			objectType: "DFG::AN4",
  			idObject: favorites
  		});
  	}
  	return result;
  };

  /**
   * @param {object} object - Endpoint parameter.
   * @param {number array} object.idObject - Array of file IDs
   * @return {object array} response - Array with all files removed from favorites
   */
  this.removeFavorite = function(object) {
  	return fileCRUDFNew.unmarkFavorite({
  		objectType: "DFG::AN4",
  		idObject: object.idObject
  	});
  };

  this.updateFile = function(object) {
  	var response;
  	try {
  		switch (object.status) {
  			case 1:
  				{
  					if (!getAccess("restore")) {
  						$.messageCodes.push({
  							"code": "DFG213003",
  							"type": "E"
  						});
  						return response;
  					}
  					break;
  				}
  			case 2:
  				{
  					if (!getAccess("trash")) {
  						$.messageCodes.push({
  							"code": "DFG213005",
  							"type": "E"
  						});
  						return response;
  					}
  					break;
  				}
  			case 3:
  				{
  					if (!getAccess("delete")) {
  						$.messageCodes.push({
  							"code": "DFG213004",
  							"type": ""
  						});
  						return response;
  					}
  				}
  		}
  		object.objectType = "DFG::AN4";
  		response = fileCRUDFNew.updateFileStatus(object);
  	} catch (e) {
  		$.trace.error(e);
  		$.messageCodes.push({
  			code: "DFG213009",
  			"type": "E",
  			errorInfo: util.parseError(e)
  		});
  	}
  	return response;
  };
  /**
   * @param {string} objectType - Name of the object that you need.
   * @return {number} - ID of object in CORE::ObjectType
   */

  this.filters = function(object) {
  	object = object || $.request.parameters.get("object");
  	if (typeof object === "string") {
  		object = JSON.parse(object);
  	}
  	var response = {
  		company: companyBranches.getCompanyBranchesFilter(),
  		// company: controllerExternal.listCompany(),
  		// UF: controllerExternal.listUF(),
  		// branch: controllerExternal.listBranch(),
  		tax: controllerExternal.listTax(),
  		originReference: [{
  			id: 1,
  			name: "DFG"
		}, {
  			id: 2,
  			name: "External"
		}],
  		originComparison: [{
  			id: 1,
  			name: "DFG"
		}, {
  			id: 2,
  			name: "External"
		}],
  		users: user.listAllUsers()
  	};
  	return response;
  };

   ///AN4 EXECUTOR-KBARA 28/11/2016///////////////////
  this.allRules = {};
  this.allRulesParams = {};
  this.rule_cache = {};
  this.structure_cache = {};
  this.structure_dimensions = {};
  this.structure_types = {};
  this.structure_hanaName = {};
  this.ruleError = "";
  this.execute = function(object) {
  	try {
  		var layoutVersionReference = modelLayoutVersiontable.READ({
  			fields: ["json"],
  			where: [{
  				field: "id",
  				oper: "=",
  				value: object.idLayoutVersionReference
             }]
  		})[0];
  		var layoutVersionComparison = modelLayoutVersiontable.READ({
  			fields: ["json"],
  			where: [{
  				field: "id",
  				oper: "=",
  				value: object.idLayoutVersionComparison
             }]
  		})[0];
  		var layoutJSONReference = JSON.parse(layoutVersionReference.json);
  		var layoutJSONComparison = JSON.parse(layoutVersionComparison.json);
  		var digitalFileReference;
  		var digitalFileComparison;
  		var typeReference = 1;
  		var typeComparison = 1;
  		var structuresReference = [];
  		var structuresComparison = [];
  		var requiredFieldsStructureReference = {};
  		var requiredFieldsStructureComparison = {};
  		var fillStructures = function(layoutJSON, structures, requiredFieldsStructure, that) {
  			for (var b in layoutJSON.blocks) {
  				for (var r in layoutJSON.blocks[b].records) {
  					for (var c in layoutJSON.blocks[b].records[r].columns) {
  						if (layoutJSON.blocks[b].records[r].columns[c].fieldId != null && !isNaN(parseInt(layoutJSON.blocks[b].records[r].columns[c].fieldId,
  							10))) {
  							if (structures.indexOf(layoutJSON.blocks[b].records[r].columns[c].idStructure) === -1 && layoutJSON.blocks[b].records[r].columns[
  								c].idStructure) {
  								structures.push(layoutJSON.blocks[b].records[r].columns[c].idStructure);

  							}
  							if (!requiredFieldsStructure[layoutJSON.blocks[b].records[r].columns[c].idStructure]) {
  								requiredFieldsStructure[layoutJSON.blocks[b].records[r].columns[c].idStructure] = {
  									fields: []
  								};
  							}
  							if (requiredFieldsStructure[layoutJSON.blocks[b].records[r].columns[c].idStructure].fields.indexOf(layoutJSON.blocks[b].records[r]
  								.columns[
  									c].fieldId) === -1) {
  								requiredFieldsStructure[layoutJSON.blocks[b].records[r].columns[c].idStructure].fields.push(layoutJSON.blocks[b].records[r].columns[
  									c].fieldId);
  							}
  							if (!that.structure_types[layoutJSON.blocks[b].records[r].columns[c].idStructure]) {
  								that.structure_types[layoutJSON.blocks[b].records[r].columns[c].idStructure] = {};
  							}

  						}
  					}
  				}
  			}
  		};
  		fillStructures(layoutJSONReference, structuresReference, requiredFieldsStructureReference, this);
  		fillStructures(layoutJSONComparison, structuresComparison, requiredFieldsStructureComparison, this);
  		if (object.hasOwnProperty("originReference")) {
  			if (object.originReference === "DFG" && object.idDigitalFileReference) {
  				digitalFileReference = modelDigitalFile.table.READ({
  					fields: ["digitalFile"],
  					where: [{
  						field: "id",
  						oper: "=",
  						value: object.idDigitalFileReference
                     }]
  				})[0].digitalFile;
  				digitalFileReference = JSON.parse(digitalFileReference).rawFile;
  			} else {
  				digitalFileReference = modelAN4XExternalFile.READ({
  					fields: ["externalFile"],
  					where: [{
  						field: "id",
  						oper: "=",
  						value: object.idExternalFileReference
                     }]
  				})[0].externalFile;
  				typeReference = 2;
  				this.fillStructureDimensions(structuresReference, requiredFieldsStructureReference);
  			}

  		}
  		if (object.hasOwnProperty("originComparison")) {
  			if (object.originComparison === "DFG" && object.idDigitalFileComparison) {
  				digitalFileComparison = modelDigitalFile.table.READ({
  					fields: ["digitalFile"],
  					where: [{
  						field: "id",
  						oper: "=",
  						value: object.idDigitalFileComparison
                     }]
  				})[0].digitalFile;
  				digitalFileComparison = JSON.parse(digitalFileComparison).rawFile;
  			} else {
  				digitalFileComparison = modelAN4XExternalFile.READ({
  					fields: ["externalFile"],
  					where: [{
  						field: "id",
  						oper: "=",
  						value: object.idExternalFileComparison
                     }]
  				})[0].externalFile;
  				typeComparison = 2;
  				this.fillStructureDimensions(structuresComparison, requiredFieldsStructureComparison);
  			}

  		}
  		return this.getExecutionResult({
  			jsonReference: layoutJSONReference,
  			jsonComparison: layoutJSONComparison,
  			digitalFileReference: digitalFileReference,
  			digitalFileComparison: digitalFileComparison,
  			idRule: object.idRule,
  			typeReference: typeReference,
  			typeComparison: typeComparison
  		});
  	} catch (e) {
  		$.trace.error(e);
  		$.messageCodes.push({
  			code: 'DFG213008',
  			type: "E",
  			errorInfo: util.parseError(e)
  		});
  		return this.ruleError;
  	}
  	return {};
  };
  this.getExecutionResult = function(object) {
  	var jsonReference = object.jsonReference;
  	var jsonComparison = object.jsonComparison;
  	var result;
  	var digitalFileReference = object.digitalFileReference;
  	var digitalFileComparison = object.digitalFileComparison;
  	var typeReference = object.typeReference;
  	var typeComparison = object.typeComparison;
  	var idRule = object.idRule;
  	var linesReference = digitalFileReference.split("\r\n");
  	var linesComparison = digitalFileComparison.split("\r\n");
  	var blockDataResponseReference = this.getBlockData({
  		json: jsonReference,
  		type: typeReference,
  		lines: linesReference
  	});
  	var blockDataResponseComparison = this.getBlockData({
  		json: jsonComparison,
  		type: typeComparison,
  		lines: linesComparison
  	});
  	var blockDataReference = blockDataResponseReference.blockData;
  	var lineMappingReference = blockDataResponseReference.lineMapping;
  	var blockDataComparison = blockDataResponseComparison.blockData;
  	var lineMappingComparison = blockDataResponseComparison.lineMapping;

  	this.fillRuleCache(idRule);
  	result = this.evaluateAN4Rules(blockDataReference, blockDataComparison);

  	return {
  		rulesResult: result,
  		blocksDataReference: blockDataReference,
  		lineMappingReference: lineMappingReference,
  		blocksDataComparison: blockDataComparison,
  		lineMappingComparison: lineMappingComparison

  	};
  };
  this.fillStructureDimensions = function(structures, requiredFields) {
  	var structure;
  	var lang = ($.request.cookies.get("Content-Language") === "enus") ? "enus" : "ptrbr";
  	var query = {};
  	var structure_dimensions = {};
  	var structure_types = {};
  	var structure_hanaName = {};
  	var dimensions;
  	var fields = [];

  	for (var i = 0; i < structures.length; i++) {
  		structure = modelStructure.getStructure(structures[i]);
  		this.structure_cache[structures[i]] = structure;
  		if (requiredFields[structures[i]] && requiredFields[structures[i]].fields.length > 0) {
  			structure_types[structures[i]] = {};
  			structure_hanaName[structures[i]] = {};
  			requiredFields[structures[i]].fields.map(function(f) {
  				for (var p = 0; p < structure.fields.length; p++) {
  					if (structure.fields[p].ID === parseInt(f, 10)) {
  						structure_hanaName[structures[i]][structure.fields[p].ID] = structure.fields[p].hanaName;
  						fields.push("\'" + structure.fields[p].hanaName + "\'");
  						structure_types[structures[i]][f] = structure.fields[p].type;
  						break;
  					}
  				}
  			});
  			query.query = "SELECT COLUMN_NAME, LENGTH FROM VIEW_COLUMNS WHERE SCHEMA_NAME='_SYS_BIC' AND VIEW_NAME=\'" + structure.hanaPackage +
  				"/" + structure.hanaName + "\'";
  			query.query += " AND COLUMN_NAME IN (" + fields.toString() + ")";
  			dimensions = sql.SELECT(query);
  			structure_dimensions[structures[i]] = {};
  			dimensions.map(function(d) {
  				structure_dimensions[structures[i]][d[0]] = d[1];
  			});
  		}

  	}
  	for (var t in structure_types) {
  		this.structure_types[t] = structure_types[t];
  	}
  	for (var d in structure_dimensions) {
  		this.structure_dimensions[d] = structure_dimensions[d];
  	}
  	for (var h in structure_hanaName) {
  		this.structure_hanaName[h] = structure_hanaName[h];
  	}
  };
  this.getBlockData = function(object) {
  	var json = object.json;
  	var type = object.type;
  	var separator = json.separator;
  	if (type === 1) {
  		separator.value = separator.value + String.fromCharCode(8204);
  	}
  	var response = {};
  	var lines = object.lines;
  	var line;
  	var index = 0;
  	var index2 = 0;
  	var block, record;
  	var recordXColumns;
  	var lineTemp, columns, recordPositions;
  	var lineMapping = {};
  	var actualBlock, actualRecord;
  	var blockPositions = json.positions;
  	var actualBlock = blockPositions[0];
  	var recordPositions = json.blocks[actualBlock].positions;
  	var actualRecord = recordPositions[0];
  	var identified;
  	for (index; index < lines.length - 1; index++) {
  		line = lines[index];
  		if (type === 1) { //If the digitalFile is generated by DFG
  			lineTemp = line.split("&&::");
  			block = lineTemp[1].split("&:")[0];
  			record = lineTemp[1].split("&:")[1];
  			line = lineTemp[0];
  			lineMapping[index] = block + "." + record;
  		} else { //MUST FIND A WAY TO IDENTIFY BLOCK AND RECORD FOR EXTENRAL DIGITALFILES

  			if (separator.value !== "") {
  				var columns = line.split(separator.value);
  				if (separator.inFirst) {
  					columns.splice(0, 1);
  				}
  				if (separator.inLast) {
  					columns.splice(columns.length - 1, 1);
  				}
  				identified = this.identifyRecordbyColumns(columns, json, actualBlock, actualRecord, lines.length - 1);
  			} else {
  				identified = this.identifyRecord(line, json, actualBlock, actualRecord, lines.length - 1);
  			}
  			if (!identified) {
  				continue;
  			} else {
  				block = identified.actualBlock;
  				record = identified.actualRecord;
  				lineMapping[index] = block + "." + record;
  				actualBlock = identified.actualBlock;
  				actualRecord = identified.actualRecord;
  			}
  		}
  		if (!response[block]) {
  			response[block] = {
  				records: {

  				}
  			};
  		}
  		if (!response[block].records[record]) {
  			response[block].records[record] = {
  				lines: {}
  			};
  		}
  		if (identified) {
  			response[block].records[record].lines[index] = identified.lineValues;
  			continue;
  		}
  		columns = line.split(separator.value);
  		recordPositions = json.blocks[block].records[record].positions;
  		recordXColumns = json.blocks[block].records[record].columns;
  		if (separator.inFirst) {
  			columns.splice(0, 1);
  		}
  		if (separator.inLast) {
  			columns.splice(columns.length - 1, 1);
  		}
  		response[block].records[record].lines[index] = {};
  		index2 = 0;
  		for (index2; index2 < recordPositions.length; index2++) {
  			response[block].records[record].lines[index][recordPositions[index2]] = columns[index2];
  		}
  	}
  	return {
  		blockData: response,
  		lineMapping: lineMapping
  	};

  };
  this.identifyRecord = function(line, json, actualBlock, actualRecord, totalLines) {
  	var lineTotalDimension = line.length;
  	var recordDimension = 0;
  	var columnPositions = json.blocks[actualBlock].records[actualRecord].positions;
  	var columns = json.blocks[actualBlock].records[actualRecord].columns;
  	var size = 0;
  	var format = json.format;
  	var numberFormat = null;
  	var stringFormat = null;
  	var dateFormat = null;
  	if (json.blocks[actualBlock].format && json.blocks[actualBlock].format !== null) {
  		format = json.blocks[actualBlock].format;
  		if (format.number !== null) {
  			numberFormat = format.number;
  		}
  		if (format.string !== null) {
  			stringFormat = format.string;
  		}
  		if (format.date !== null) {
  			dateFormat = format.date;
  		}
  	}
  	if (json.blocks[actualBlock].records[actualRecord].format && json.blocks[actualBlock].records[actualRecord].format !== null) {
  		format = json.blocks[actualBlock].records[actualRecord].format;
  		if (format.number !== null) {
  			numberFormat = format.number;
  		}
  		if (format.string !== null) {
  			stringFormat = format.string;
  		}
  		if (format.date !== null) {
  			dateFormat = format.date;
  		}
  	}

  	var columnType;
  	var hanaName;
  	var initialIndex = 0;
  	var finalIndex = 1;
  	var position = 0;

  	var column = columns[columnPositions[position]];
  	var values = {};
  	var correctRecord = true;
  	var isNewLine = false;
  	do {
  		correctRecord = true;
  		while (finalIndex < line.length && position < columnPositions.length && correctRecord) {
  			if (column.recordId) {
  				var recordName = "";
  				if (typeof column.recordId === "object") {
  					if (column.recordId.blockId) {
  						recordName += json.blocks[actualBlock].name;
  					}
  					if (column.recordId.recordId) {
  						recordName += json.blocks[actualBlock].records[actualRecord].name;
  					}
  				} else {
  					recordName += json.blocks[actualBlock].records[actualRecord].name;
  				}
  				finalIndex += recordName.length - 1;
  				if (finalIndex > line.length || line.substring(initialIndex, finalIndex) !== recordName) {
  					correctRecord = false;
  				} else {
  					values[columnPositions[position]] = recordName;
  					position++;
  					initialIndex = finalIndex;
  					finalIndex++;
  					if (columnPositions.length !== position) {
  						column = columns[columnPositions[position]];
  					}

  				}
  			} else if (column.fieldId !== null && !isNaN(parseInt(column.fieldId, 10))) {
  				columnType = this.structure_types[column.idStructure][column.fieldId];
  				switch (columnType) {
  					case "NVARCHAR":
  					case "VARCHAR":
  						columnType = "string";
  						break;
  					case "DECIMAL":
  					case "INTEGER":
  						columnType = "number";
  						break;
  					case "TIMESTAMP":
  						columnType = "date";
  						break;
  				}
  				var size = 0;
  				var temp;
  				if (column.format && column.format !== null) {
  					temp = getSize(columnType, {
  						number: column.format.number !== null ? column.format.number : numberFormat,
  						string: column.format.string !== null ? column.format.string : stringFormat,
  						date: column.format.date !== null ? column.format.date : dateFormat
  					});
  					if (!temp) {
  						hanaName = this.structure_hanaName[column.idStructure][column.fieldId];
  						size = parseInt(this.structure_dimensions[column.idStructure][hanaName], 10);
  					} else {
  						size = parseInt(temp, 10);
  					}
  				} else {
  					temp = getSize(columnType, {
  						number: numberFormat,
  						string: stringFormat,
  						date: dateFormat
  					});
  					if (!temp) {
  						hanaName = this.structure_hanaName[column.idStructure][column.fieldId];
  						size = parseInt(this.structure_dimensions[column.idStructure][hanaName], 10);
  					} else {
  						size = parseInt(temp, 10);
  					}
  				}
  				finalIndex += size - 1;
  				if (finalIndex > line.length) {
  					correctRecord = false;
  				} else {
  					values[columnPositions[position]] = line.substring(initialIndex, finalIndex);
  					position++;
  					if (columnPositions.length !== position) {
  						column = columns[columnPositions[position]];
  					}
  					initialIndex = finalIndex;
  					finalIndex++;
  				}
  			} else if (column.filler) {
  				finalIndex += column.filler.value.length - 1;
  				if (finalIndex > line.index || line.substring(initialIndex, finalIndex) !== column.filler.value) {
  					correctRecord = false;
  				} else {
  					values[columnPositions[position]] = column.filler.value;
  					position++;
  					initialIndex = finalIndex;
  					finalIndex++;
  					if (columnPositions.length !== position) {
  						column = columns[columnPositions[position]];
  					}

  				}
  			} else if (column.isReferencePeriod || column.finalDateReference || column.initialDateReference || column.fieldId === "DTE") {
  				var size = 0;
  				var separatorCount = -1;
  				if (column.format && column.format !== null && column.format.date !== null) {
  					if (column.format.date.day !== "blank") {
  						size += column.format.date.day.length;
  						separatorCount++;
  					}
  					if (column.format.date.month !== "blank") {
  						size += column.format.date.month.length;
  						separatorCount++;
  					}
  					if (column.format.date.year !== "blank") {
  						size += column.format.date.year.length;
  						separatorCount++;
  					}
  					if (column.format.date.separator !== "" && separatorCount !== -1) {
  						size += separatorCount;
  					}
  				} else {
  					if (dateFormat && dateFormat !== null) {
  						if (dateFormat.day !== "blank") {
  							size += dateFormat.day.length;
  							separatorCount++;
  						}
  						if (dateFormat.month !== "blank") {
  							size += dateFormat.month.length;
  							separatorCount++;
  						}
  						if (dateFormat.year !== "blank") {
  							size += dateFormat.year.length;
  							separatorCount++;
  						}
  						if (dateFormat.separator !== "" && separatorCount !== -1) {
  							size += separatorCount;
  						}
  					} else {
  						correctRecord = false;
  					}
  				}
  				if (correctRecord) {
  					finalIndex += size - 1;
  					if (finalIndex > line.length) {
  						correctRecord = false;
  					} else {
  						values[columnPositions[position]] = line.substring(initialIndex, finalIndex);
  						position++;
  						if (columnPositions.length !== position) {
  							column = columns[columnPositions[position]];
  						}
  						initialIndex = finalIndex;
  						finalIndex++;
  					}
  				}

  			} else if (column.fixedManualField) {
  				var found = false;
  				for (var o = 0; o < column.fixedManualField.options.length; o++) {
  					if (line.substring(initialIndex, finalIndex + column.fixedManualField.options[o].option.length - 1) === column.fixedManualField.options[
  						o].option) {
  						found = true;
  						values[columnPositions[position]] = line.substring(initialIndex, finalIndex + column.fixedManualField.options[o].option.length - 1);
  						initialIndex = finalIndex + column.fixedManualField.options[o].option.length - 1;
  						finalIndex += column.fixedManualField.options[o].option.length;
  						break;
  					}
  				}
  				if (!found && column.fixedManualField.required) {
  					correctRecord = false;
  				} else {
  					position++;
  					if (columnPositions.length !== position) {
  						column = columns[columnPositions[position]];
  					}
  				}

  			} else if (column.manualParam) {
  				finalIndex += parseInt(column.manualParam.length, 10) - 1;
  				if (finalIndex > line.length) {
  					correctRecord = false;
  				} else {
  					values[columnPositions[position]] = line.substring(initialIndex, finalIndex);
  					position++;
  					if (columnPositions.length !== position) {
  						column = columns[columnPositions[position]];
  					}
  					initialIndex = finalIndex;
  					finalIndex++;
  				}
  			} else if (column.isTotalsAll) {
  				finalIndex += ("" + totalLines).length - 1;
  				if (finalIndex > line.length && line.substring(initialIndex, finalIndex) !== "" + totalLines) {
  					correctRecord = false;
  				} else {
  					values[columnPositions[position]] = line.substring(initialIndex, finalIndex);
  					position++;
  					if (columnPositions.length !== position) {
  						column = columns[columnPositions[position]];
  					}
  					initialIndex = finalIndex;
  					finalIndex++;
  				}
  			} else if (column.version) {
  				finalIndex += column.version.label.length - 1;
  				if (finalIndex > line.length || column.version.label !== line.substring(initialIndex, finalIndex)) {
  					correctRecord = false;
  				} else {
  					values[columnPositions[position]] = line.substring(initialIndex, finalIndex);
  					position++;
  					if (columnPositions.length !== position) {
  						column = columns[columnPositions[position]];
  					}
  					initialIndex = finalIndex;
  					finalIndex++;
  				}
  			} else if (column.fieldId === "HRE") {
  				var size = 0;
  				var separatorCount = -1;
  				if (column.format && column.format !== null && column.format.hour !== null) {
  					if (column.format.hour.day !== "blank") {
  						size += column.format.hour.day.length;
  						separatorCount++;
  					}
  					if (column.format.hour.month !== "blank") {
  						size += column.format.hour.month.length;
  						separatorCount++;
  					}
  					if (column.format.hour.year !== "blank") {
  						size += column.format.hour.year.length;
  						separatorCount++;
  					}
  					if (column.format.hour.separator !== "" && separatorCount !== -1) {
  						size += separatorCount;
  					}
  				} else {
  					correctRecord = false;
  				}
  				if (correctRecord) {
  					finalIndex += size - 1;
  					if (finalIndex > line.length) {
  						correctRecord = false;
  					} else {
  						values[columnPositions[position]] = line.substring(initialIndex, finalIndex);
  						position++;
  						if (columnPositions.length !== position) {
  							column = columns[columnPositions[position]];
  						}
  						initialIndex = finalIndex;
  						finalIndex++;
  					}
  				}
  			} else if (column.formula) {
  				columnType = column.formula.type;
  				switch (columnType) {
  					case "NVARCHAR":
  					case "VARCHAR":
  						columnType = "string";
  						break;
  					case "DECIMAL":
  					case "INTEGER":
  						columnType = "number";
  						break;
  					case "TIMESTAMP":
  						columnType = "date";
  						break;
  				}
  				var size = 0;
  				var temp;
  				if (column.format && column.format !== null) {
  					temp = getSize(columnType, {
  						number: column.format.number !== null ? column.format.number : numberFormat,
  						string: column.format.string !== null ? column.format.string : stringFormat,
  						date: column.format.date !== null ? column.format.date : dateFormat
  					});
  					if (!temp) {
  						correctRecord = false;
  					} else {
  						size = parseInt(temp, 10);
  					}
  				} else {
  					temp = getSize(columnType, {
  						number: numberFormat,
  						string: stringFormat,
  						date: dateFormat
  					});
  					if (!temp) {
  						correctRecord = false;
  					} else {
  						size = parseInt(temp, 10);
  					}
  				}
  				if (correctRecord) {
  					finalIndex += size - 1;
  					if (finalIndex > line.length) {
  						correctRecord = false;
  					} else {
  						values[columnPositions[position]] = line.substring(initialIndex, finalIndex);
  						position++;
  						if (columnPositions.length !== position) {
  							column = columns[columnPositions[position]];
  						}
  						initialIndex = finalIndex;
  						finalIndex++;
  					}
  				}
  			} else if (column.output || column.sequenceField || column.isRecordsTotals || column.isBlocksTotals) {
  				var size = 0;
  				var temp;
  				if (column.format && column.format !== null) {
  					temp = getSize("number", {
  						number: column.format.number !== null ? column.format.number : numberFormat,
  						string: column.format.string !== null ? column.format.string : stringFormat,
  						date: column.format.date !== null ? column.format.date : dateFormat
  					});
  					if (!temp) {
  						correctRecord = false;
  					} else {
  						size = parseInt(temp, 10);
  					}
  				} else {
  					temp = getSize("number", {
  						number: numberFormat,
  						string: stringFormat,
  						date: dateFormat
  					});
  					if (!temp) {
  						correctRecord = false;
  					} else {
  						size = parseInt(temp, 10);
  					}
  				}
  				if (correctRecord) {
  					finalIndex += size - 1;
  					if (finalIndex > line.length) {
  						correctRecord = false;
  					} else {
  						values[columnPositions[position]] = line.substring(initialIndex, finalIndex);
  						position++;
  						if (columnPositions.length !== position) {
  							column = columns[columnPositions[position]];
  						}
  						initialIndex = finalIndex;
  						finalIndex++;
  					}
  				}
  			} else if (column.fixedField) {
  				var found = false;
  				for (var o = 0; o < column.fixedField.values.length; o++) {
  					if (line.substring(initialIndex, finalIndex + column.fixedField.values[o].length - 1) === column.fixedField.values[
  						o]) {
  						found = true;
  						values[columnPositions[position]] = line.substring(initialIndex, finalIndex + column.fixedField.values[o].length - 1);
  						initialIndex = finalIndex + column.fixedField.values[o].length - 1;
  						finalIndex += column.fixedField.values[o].length;
  						break;
  					}
  				}
  				if (!found) {
  					correctRecord = false;
  				} else {
  					position++;
  					if (columnPositions.length !== position) {
  						column = columns[columnPositions[position]];
  					}
  				}
  			} else {
  				correctRecord = false;
  			}

  		}
  		if (finalIndex < line.length) {
  			correctRecord = false;
  		}
  		initialIndex = 0;
  		finalIndex = 1;
  		if (columnPositions.length - 1 > position) {
  			for (position; position < columnPositions.length; position++) {
  				column = columns[columnPositions[position]];
  				if (column.isLineBreak) {
  					isNewLine = true;
  					break;
  				}
  			}

  		}
  		if (!correctRecord && !isNewLine) {
  			position = 0;
  			var indexRecord = json.blocks[actualBlock].positions.indexOf(actualRecord);
  			if (indexRecord === json.blocks[actualBlock].positions.length - 1) {
  				var indexBlock = json.positions.indexOf(actualBlock);
  				if (indexBlock === json.positions.length - 1) {
  					correctRecord = false;
  					actualBlock++;
  					actualRecord++;
  				} else {
  					actualBlock = json.positions[indexBlock + 1];
  					actualRecord = json.blocks[actualBlock].positions[0];
  				}
  			} else {
  				actualRecord = json.blocks[actualBlock].positions[indexRecord + 1];
  			}
  			if (json.blocks[actualBlock] && json.blocks[actualBlock].records[actualRecord]) {
  				columnPositions = json.blocks[actualBlock].records[actualRecord].positions;
  				columns = json.blocks[actualBlock].records[actualRecord].columns;
  				column = columns[columnPositions[position]];
  			}
  		} else {
  			if (isNewLine && !correctRecord) {
  				position++;
  				if (position === columnPositions.length) {
  					position = 0;
  					var indexRecord = json.blocks[actualBlock].positions.indexOf(actualRecord);
  					if (indexRecord === json.blocks[actualBlock].positions.length - 1) {
  						var indexBlock = json.positions.indexOf(actualBlock);
  						if (indexBlock === json.positions.length - 1) {
  							correctRecord = false;
  						} else {
  							actualBlock = json.positions[indexBlock + 1];
  							actualRecord = json.blocks[actualBlock].positions[0];
  						}
  					} else {
  						actualRecord = json.blocks[actualBlock].positions[indexRecord + 1];
  					}
  					if (json.blocks[actualBlock].records[actualRecord]) {
  						columnPositions = json.blocks[actualBlock].records[actualRecord].positions;
  						columns = json.blocks[actualBlock].records[actualRecord].columns;
  						column = columns[columnPositions[position]];
  					}
  				} else {
  					column = columns[columnPositions[position]];
  					isNewLine = false;
  				}
  			}
  		}
  		if (!correctRecord) {
  			values = {};
  		}
  	} while (!correctRecord && json.blocks[actualBlock] && json.blocks[actualBlock].records[actualRecord]);
  	if (correctRecord) {
  		return {
  			actualBlock: actualBlock,
  			actualRecord: actualRecord,
  			lineValues: values
  		};
  	}

  };
  this.identifyRecordbyColumns = function(columns, json, actualBlock, actualRecord, totalLines) {
  	var recordDimension = 0;
  	var actualColumnPositions = json.blocks[actualBlock].records[actualRecord].positions;
  	var actualColumns = json.blocks[actualBlock].records[actualRecord].columns;
  	var size = 0;
  	var values = {};
  	var correctRecord = true;
  	var isNewLine = false;
  	var positionIndex = 0;
  	var newLineIndex;
  	do {
  		correctRecord = false;
  		values = {};
  		newLineIndex = actualColumnPositions.indexOf("newline", positionIndex);
  		if (newLineIndex > -1) {
  			if (newLineIndex - positionIndex === columns.length) {
  				for (var i = positionIndex; i < newLineIndex; i++) {
  					values[actualColumnPositions[i]] = columns[i - positionIndex];
  				}
  				correctRecord = true;
  			} else {
  				positionIndex = newLineIndex + 1;
  			}
  		} else {
  			if (actualColumnPositions.length - positionIndex === columns.length) {

  				for (var i = positionIndex; i < actualColumnPositions.length; i++) {
  					values[actualColumnPositions[i]] = columns[i - positionIndex];
  				}
  				var recordIdColumn = actualColumnPositions.toString().match(new RegExp(/recordId[0-9]+/g));
  				if (recordIdColumn) {
  					var positionRecordColumn = actualColumnPositions.indexOf(recordIdColumn[0]);
  					if (positionRecordColumn !== -1) {
  						if (columns[positionRecordColumn - positionIndex] !== json.blocks[actualBlock].records[actualRecord].name) {
  							correctRecord = false;
  							positionIndex = actualColumnPositions.length + 1;
  						} else {
  							correctRecord = true;
  						}
  					} else {
  						correctRecord = true;
  					}
  				} else {
  					correctRecord = true;
  				}

  			} else {
  				positionIndex = actualColumnPositions.length + 1;
  			}
  		}
  		if (!correctRecord) {
  			if (positionIndex >= actualColumnPositions.length) {
  				positionIndex = 0;
  				var indexRecord = json.blocks[actualBlock].positions.indexOf(actualRecord);
  				if (indexRecord === json.blocks[actualBlock].positions.length - 1) {
  					var indexBlock = json.positions.indexOf(actualBlock);
  					if (indexBlock === json.positions.length - 1) {
  						correctRecord = false;
  						actualBlock = null;
  						actualRecord = null;
  					} else {
  						actualBlock = json.positions[indexBlock + 1];
  						actualRecord = json.blocks[actualBlock].positions[0];
  					}
  				} else {
  					actualRecord = json.blocks[actualBlock].positions[indexRecord + 1];
  				}
  				if (json.blocks[actualBlock] && json.blocks[actualBlock].records[actualRecord]) {
  					actualColumnPositions = json.blocks[actualBlock].records[actualRecord].positions;
  				}
  			}
  		}
  	} while (!correctRecord && json.blocks[actualBlock] && json.blocks[actualBlock].records[actualRecord]);
  	if (correctRecord) {
  		return {
  			actualBlock: actualBlock,
  			actualRecord: actualRecord,
  			lineValues: values
  		};
  	}

  };

  function getSize(type, format) {

  	if (type == "number") {
  		if (format && format != null && format.number !== null && format.number.size != "") {
  			return format.number.size;
  		} else {
  			return;
  		}
  	}
  	if (type == "string") {
  		if (format && format != null && format.string !== null && format.string.size != "") {
  			return format.string.size;
  		} else {
  			return;
  		}
  	}
  	if (type == "date") {
  		if (format && format != null && format.date !== null && format.date.size != "") {
  			return format.date.size;
  		} else {
  			return;
  		}
  	}
  }
  this.fillRuleCache = function(AN3Rules) {
  	for (var i = 0; i < AN3Rules.length; i++) {
  		if (!this.rule_cache[AN3Rules[i]]) {
  			this.rule_cache[AN3Rules[i]] = rulesModel.getRule(Number(AN3Rules[i]));
  		}
  		this.allRules[AN3Rules[i]] = this.rule_cache[AN3Rules[i]];
  		this.allRulesParams[AN3Rules[i]] = this.allRules[AN3Rules[i]].getParameters();
  	}
  };
  this.evaluateAN4Rules = function(parsedDataReference, parsedDataComparison) {
  	var ruleResults = {};
  	var rule, path;
  	for (rule in this.allRules) {
  		if (this.allRules.hasOwnProperty(rule)) {
  			ruleResults[rule] = {
  				pathResults: {},
  				name: this.allRules[rule].name
  			};
  			for (path = 0; path < this.allRules[rule].paths.length; path++) {
  				ruleResults[rule].pathResults[path] = this.comparePath(this.allRules[rule].paths[path], parsedDataReference, parsedDataComparison, [],
  					this.allRules[rule].calculated);
  			}
  		}
  	}

  	//Evaluate each rule, compare each line

  	return ruleResults;
  };
  this.comparePath = function(path, parsedDataReference, parsedDataComparison, references, calculatedValues) {
  	var result = {};
  	var condition;
  	var messageResult = {};
  	for (condition = 0; condition < path.conditions.length; condition++) {
  		result[condition] = this.compareConditions(path.conditions[condition], references, parsedDataReference, parsedDataComparison,
  			calculatedValues);
  	}
  	var actualLine, actualLine2;
  	var conflictLine, conflictLine2;
  	for (var c in result[0]) {
  		if (c.split(".").length > 1) {
  			actualLine = c.split(".")[0];
  			conflictLine = c.split(".")[1];
  		} else {
  			actualLine = c;
  		}
  		messageResult[actualLine] = {
  			message: "",
  			conflictLine: "",
  			isValid: result[0][c]
  		};
  		messageResult[actualLine].conflictLine = conflictLine;
  		if (messageResult[actualLine].isValid) {
  			for (var c2 in result) {
  				if (c2 === 0) {
  					continue;
  				} else {
  					for (var c3 in result[c2]) {
  						if (c3.split(".").length > 1) {
  							actualLine2 = c3.split(".")[0];
  							conflictLine2 = c3.split(".")[1];
  							if (actualLine === actualLine2 && conflictLine === conflictLine2) {
  								messageResult[actualLine].isValid = messageResult[actualLine].isValid && result[c2][c3];

  							}
  						} else {
  							actualLine2 = c3;
  							if (actualLine === actualLine2) {
  								messageResult[actualLine].isValid = messageResult[actualLine].isValid && result[c2][c3];
  							}
  						}

  					}
  				}
  			}
  		}
  	}
  	for (var m in messageResult) {
  		if (messageResult[m].isValid) {
  			messageResult[m].message = path.message.value;
  		} 
  	}
  	return messageResult;
  };
  this.compareConditions = function(condition, references, parseDataReference, parseDataComparison, calculatedValues) {
  	var json = $.request.parameters.get("object");
  	if (typeof json === "string") {
  		json = JSON.parse(json);
  	}
  	var pa = condition.pa.id;
  	var pb = condition.pb.id;
  	var oper = condition.oper;
  	var blockReference, recordReference, columnReference;
  	var blockComparison, recordComparison, columnComparison;
  	var formulaReference, formulaComparison;
  	if (isNaN(Number(pa))) {
  		var temp = pa.split("-");
  		blockReference = temp[1];
  		recordReference = temp[2];
  		columnReference = temp[3];
  	} else {
  		formulaReference = calculatedValues[pa].formula;
  		condition.rule.raw.calculated.map(function(c, i) {
  			if (c.id === Number(pa)) {
  				var temp = condition.rule.raw.calculated[i].ID.split("-");
  				blockReference = temp[1];
  				recordReference = temp[2];
  				columnReference = temp[3];
  			}
  		});
  	}
  	if (isNaN(Number(pb))) {
  		var temp = pb.split("-");
  		blockComparison = temp[1];
  		recordComparison = temp[2];
  		columnComparison = temp[3];
  	} else {
  		formulaComparison = calculatedValues[pb].formula;
  		condition.rule.raw.calculated.map(function(c, i) {
  			if (c.id === Number(pb)) {
  				var temp = condition.rule.raw.calculated[i].ID.split("-");
  				blockComparison = temp[1];
  				recordComparison = temp[2];
  				columnComparison = temp[3];
  			}
  		});
  	}
  	if (!parseDataReference[blockReference].records[recordReference]) {
  		this.ruleError = {
  			errorRule: "ERROR WITH REFERENCE RECORD: ",
  			block: blockReference,
  			record: recordReference
  		};
  	}
  	if (!parseDataComparison[blockComparison].records[recordComparison]) {
  		this.ruleError = {
  			errorRule: "ERROR WITH COMPARISON RECORD: ",
  			block: blockComparison,
  			record: recordComparison
  		};
  	}
  	var result = {};
  	var line1, line2;
  	var value1, value2;
  	var isValid = true;
  	for (line1 in parseDataReference[blockReference].records[recordReference].lines) {
  		if (formulaReference) {
  			value1 = this.getFormulaResult(formulaReference, parseDataReference, line1).value;
  		} else {
  			value1 = parseDataReference[blockReference].records[recordReference].lines[line1][columnReference];
  		}
  		for (line2 in parseDataComparison[blockComparison].records[recordComparison].lines) {
  			if (formulaComparison) {
  				value2 = this.getFormulaResult(formulaComparison, parseDataComparison, line2).value;
  			} else {
  				value2 = parseDataComparison[blockComparison].records[recordComparison].lines[line2][columnComparison];
  			}
  			isValid = true;
  			for (var r = 0; r < references.length; r++) {
  				var temp1 = references[r].id.split("-");
  				var temp2 = references[r].id2.split("-");
  				if (parseDataReference[temp1[1]].records[temp1[2]].lines[line1][temp1[3]] !== parseDataComparison[temp2[1]].records[temp2[2]].lines[
  					line2][temp2[3]]) {
  					isValid = false;
  					break;
  				}
  			}
  			result[line1 + "." + line2] = condition.operators[oper](value1, value2) && isValid;
  		}
  	}
  	return result;

  };

  this.getFormulaResult = function(formula, parseData, lineIndex) {
  	var json = $.request.parameters.get("object");
  	if (typeof json == "string") {
  		json = JSON.parse(json);
  	}
  	var lang = json.lang;
  	var block1, record1, column1, columnKey;
  	var formulaParams = formula.params;
  	var formulaValues = {};
  	for (var i = 0; i < formulaParams.length; i++) {
  		columnKey = formulaParams[i].id;
  		block1 = columnKey.split("-")[1];
  		record1 = columnKey.split("-")[2];
  		column1 = columnKey.split("-")[3];
  		if (!lineIndex) {
  			lineIndex = Object.keys(parseData[block1].records[record1].lines)[0];
  		}
  		if (formula.oper === "SUM" || formula.oper === "COUNT") {
  			var values = [];
  			var value;
  			if (parseData[block1]) {
  				if (parseData[block1].records[record1]) {
  					for (var line in parseData[block1].records[record1].lines) {
  						value = parseData[block1].records[record1].lines[line][column1];
  						if (typeof value === "string") {
  							if (value.match(new RegExp(/^([0-9]{1,3})(.[0-9]{3})*(,[0-9]{2})*$/g))) {
  								value = value.replace(".", "");
  								value = value.replace(",", ".");
  							} else if (value.match(new RegExp(/^([0-9]{1,3})(,[0-9]{3})*(.[0-9]{2})*$/g))) {
  								value = value.replace(",", "");
  							}
  							value = parseFloat(value);
  						}
  						values.push(value);
  					}
  				}
  			}
  			if (formula.oper === "COUNT") {
  				formulaValues["S" + columnKey] = values.length;
  			} else {
  				var total = 0;
  				for (var v = 0; v < values.length; v++) {
  					total += values[v];
  				}
  				formulaValues["S" + columnKey] = total;
  			}

  		} else {
  			if (parseData[block1]) {
  				if (parseData[block1].records[record1]) {
  					formulaValues["S" + columnKey] = parseData[block1].records[record1].lines[lineIndex][column1];
  				}
  			}
  		}
  	}
  	return {
  		block: block1,
  		record: record1,
  		value: formula.getValue(formulaValues)

  	};
  };