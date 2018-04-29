//CORE 
$.import("timp.core.server.api", "api");
var core_api = $.timp.core.server.api.api;
var util = core_api.util;
var sql = core_api.sql;

//ATR
$.import('timp.atr.server.api', 'api');
var atr_api = $.timp.atr.server.api.api;
var cvMovimiento = atr_api.cvCentralizacaoMovimento.table;

//VIEWS 
$.import("timp.dfg.server.models.views", "cvPlant");
var cvPlant = $.timp.dfg.server.models.views.cvPlant.table;


$.import("timp.dfg.server.models.views", "cvSpedVersions");
var cvSpedVersions = $.timp.dfg.server.models.views.cvSpedVersions.table;
$.import("timp.dfg.server.models.views", "cvCNPJ");
var cvCNPJ = $.timp.dfg.server.models.views.cvCNPJ.table;
$.import("timp.dfg.server.models.views", "cvGLAccountNumber");
var cvGLAccountNumber = $.timp.dfg.server.models.views.cvGLAccountNumber.table;
$.import("timp.dfg.server.models.views", "cvLedger");
var cvLedger = $.timp.dfg.server.models.views.cvLedger.table;
//SPED MODELS
$.import("timp.dfg.server.models", "variants");
var modelEFDICMSIPIVariant = $.timp.dfg.server.models.variants.EFD_ICMSIPI_Variant;
var modelEFDContributionsVariant = $.timp.dfg.server.models.variants.EFD_Contributions_Variant;

$.import("timp.dfg.server.models", "SPED_Labels");
var modelSPEDLabels = $.timp.dfg.server.models.SPED_Labels.table;

//CONTROLLERS
$.import("timp.dfg.server.controllers", "external");
var controllerExternal = $.timp.dfg.server.controllers.external;

this.createDialogEFDICMSIPIVariant = function(object) {
	var result = {
		recordOptions: {},
		centralEFD: {},
		plantOptions: {},
		stateTaxNumber: {},
		spedVersions: {}
	};
	try {
		let companyOptions = object.idCompany;
		if (!object.idCompany) {
			companyOptions = controllerExternal.listCompany().map(function(c) {
				return c.id;
			});
		}
		let ufOptions = object.uf;
		if (!object.uf) {
			ufOptions = controllerExternal.listUF({
				idCompany: companyOptions
			}).map(function(u) {
				return u.id;
			});
		}
		let branchOptions = object.idBranch;
		if (!object.idBranch) {
			branchOptions = controllerExternal.listBranch().map(function(b) {
				return b.id;
			});
		}
		let taxOptions = object.idTax;
		let taxData = controllerExternal.listTax();
		if (!object.taxOptions) {
			taxOptions = taxData.map(function(b) {
				return b.key;
			});
		}
		let plantResult = cvPlant.READ({
			where: [{
				field: "idCompany",
				oper: "=",
				value: companyOptions
            }, {
				field: "uf",
				oper: "=",
				value: ufOptions
            }, {
				field: "idBranch",
				oper: "=",
				value: branchOptions
            }]
		});

		plantResult.map(function(p) {
			if (!result.plantOptions[p.idPlant]) {
				result.plantOptions[p.idPlant] = {
					key: p.idPlant,
					name: p.plantName
				};
			}
			if (!result.stateTaxNumber[p.fiscalState]) {
				result.stateTaxNumber[p.fiscalState] = {
					key: p.fiscalState,
					name: p.fiscalState,
					idCompany: p.idCompany,
					idBranch: p.idBranch
				};
			}
		});
		let centralization = cvMovimiento.READ({
			fields: ["codEmpresa", "uf", "codFilial", "codFilialCentralizadora"],
			where: [{
				field: "codEmpresa",
				oper: "=",
				value: companyOptions
           }, {
				field: "uf",
				oper: "=",
				value: ufOptions
           }, {
				field: "codFilial",
				oper: "=",
				value: branchOptions
           }, {
				field: "idTributo",
				oper: "=",
				value: taxOptions
           }]
		});
		centralization.map(function(c) {
			if (!result.centralEFD[c.codFilialCentralizadora]) {
				result.centralEFD[c.codFilialCentralizadora] = {
					key: c.codFilialCentralizadora,
					name: c.codFilialCentralizadora,
					idCompany: c.codEmpresa,
					idBranch: c.codFilial
				};
			}
		});

		let spedVersions = cvSpedVersions.READ({
			where: [{
				field: "idReport",
				oper: "=",
				value: 1
			}]
		});
		for (var i = 0; i < spedVersions.length; i++) {
			if (!result.spedVersions[spedVersions[i].spedVersion]) {
				result.spedVersions[spedVersions[i].spedVersion] = {
					key: spedVersions[i].spedVersion,
					name: spedVersions[i].spedVersion,
					validFrom: spedVersions[i].validFrom,
					validTo: spedVersions[i].validTo
				};
			}
			if (!result.recordOptions[spedVersions[i].spedRecord]) {
				result.recordOptions[spedVersions[i].spedRecord] = {
					key: spedVersions[i].spedRecord,
					name: spedVersions[i].spedRecord,
					validFrom: spedVersions[i].validFrom,
					validTo: spedVersions[i].validTo
				};
			}
		}

	} catch (e) {
		$.trace.error(e);
		$.messageCodes.push({
			type: "E",
			code: 'DFG214014'
		});
	}
	return result;
};
this.createDialogEFDContributionsVariant = function(object) {
	var result = {
		recordOptions: {},
		cnpjOptions: [],
		taxOccurrence: [],
		bookKeeping: [],
		creditAllocation: [],
		adoptedCriteria: [],
		contribution: [],
		spedVersions: {}
	};
	try {
		var lang = ($.request.cookies.get("Content-Language") === "enus") ? "enus" : "ptrbr";
		let spedVersions = cvSpedVersions.READ({
			where: [{
				field: "idReport",
				oper: "=",
				value: 4
			}]
		});
		for (var i = 0; i < spedVersions.length; i++) {
			if (!result.spedVersions[spedVersions[i].spedVersion]) {
				result.spedVersions[spedVersions[i].spedVersion] = {
					key: spedVersions[i].spedVersion,
					name: spedVersions[i].spedVersion
				};

			}
			if (!result.recordOptions[spedVersions[i].spedRecord]) {
				result.recordOptions[spedVersions[i].spedRecord] = {
					key: spedVersions[i].spedRecord,
					name: spedVersions[i].spedRecord
				};
			}
		}
		let labels = modelSPEDLabels.READ({
			fields: ["type", "key", lang === "enus" ? "usLabel" : "brLabel"]
		});
		for (var j = 0; j < labels.length; j++) {
			switch (labels[j].type) {
				case "ADOPTED CRITERIA":
					result.adoptedCriteria.push({
						key: labels[j].key,
						name: labels[j].usLabel || labels[j].brLabel
					});
					break;
				case "CONTRIBUTION":
					result.contribution.push({
						key: labels[j].key,
						name: labels[j].usLabel || labels[j].brLabel
					});
					break;
				case "TAX OCCURRENCE":
					result.taxOccurrence.push({
						key: labels[j].key,
						name: labels[j].usLabel || labels[j].brLabel
					});
					break;
				case "BOOKKEEPING":
					result.bookKeeping.push({
						key: labels[j].key,
						name: labels[j].usLabel || labels[j].brLabel
					});
					break;
				case "CREDIT ALLOCATION":
					result.creditAllocation.push({
						key: labels[j].key,
						name: labels[j].usLabel || labels[j].brLabel
					});
					break;
			}
		}
		let companyOptions = object.idCompany;
		if (!object.idCompany) {
			companyOptions = controllerExternal.listCompany().map(function(c) {
				return c.id;
			});
		}
		let ufOptions = object.uf;
		if (!object.uf) {
			ufOptions = controllerExternal.listUF({
				idCompany: companyOptions
			}).map(function(u) {
				return u.id;
			});
		}
		let branchOptions = object.idBranch;
		if (!object.idBranch) {
			branchOptions = controllerExternal.listBranch().map(function(b) {
				return b.id;
			});
		}
		let cnpjRoot = cvCNPJ.READ({
			fields: ["cnpjRoot", "idCompany", "idBranch", "validFrom", "validTo"],
			where: [{
				field: "idCompany",
				oper: "=",
				value: companyOptions
 	    	}, {
				field: "idBranch",
				oper: "=",
				value: branchOptions
 	    	}, {
				field: "uf",
				oper: "=",
				value: ufOptions
 		    }]
		}); 
		for (var k = 0; k < cnpjRoot.length; k++) {
			result.cnpjOptions.push({
				key: cnpjRoot[k].cnpjRoot,
				name: cnpjRoot[k].cnpjRoot,
				idCompany: cnpjRoot[k].idCompany,
				idBranch: cnpjRoot[k].idBranch,
				validFrom: cnpjRoot[k].validFrom,
				validTo: cnpjRoot[k].validTo
			});
		}

	} catch (e) {

	}
	return result;
};
this.createDialogECDVariant = function(object) {
	var result = {
		recordOptions: {},
	    cnpjOptions: [],
		glAccountOptions: [],
		ledgerOptions: [],
		bookKeepingType: [],
		demonstrativeType: [],
		bookKeepingPurpose: [],
		typeECD: [],
		situationBeginning: [],
		largeCompanyIndicator: [],
		accountingIdentification: [],
		spedVersions: {}
	};
	try {
		var lang = ($.request.cookies.get("Content-Language") === "enus") ? "enus" : "ptrbr";
		let spedVersions = cvSpedVersions.READ({
			where: [{
				field: "idReport",
				oper: "=",
				value: 2
			}]
		});
		for (var i = 0; i < spedVersions.length; i++) {
			if (!result.spedVersions[spedVersions[i].spedVersion]) {
				result.spedVersions[spedVersions[i].spedVersion] = {
					key: spedVersions[i].spedVersion,
					name: spedVersions[i].spedVersion
				};
			}
			if (!result.recordOptions[spedVersions[i].spedRecord]) {
				result.recordOptions[spedVersions[i].spedRecord] = {
					key: spedVersions[i].spedRecord,
					name: spedVersions[i].spedRecord
				};
			}
		}
		let labels = modelSPEDLabels.READ({
			fields: ["type", "key", lang === "enus" ? "usLabel" : "brLabel"]
		});
		for (var j = 0; j < labels.length; j++) {
			switch (labels[j].type) {
				case "BOOKKEEPING ECD":
					result.bookKeepingType.push({
						key: labels[j].key,
						name: labels[j].usLabel || labels[j].brLabel
					});
					break;
				case "DEMONSTRATIVE":
					result.demonstrativeType.push({
						key: labels[j].key,
						name: labels[j].usLabel || labels[j].brLabel
					});
					break;
				case "BOOKKEEPING PURPOSE":
					result.bookKeepingPurpose.push({
						key: labels[j].key,
						name: labels[j].usLabel || labels[j].brLabel
					});
					break;
				case "ECD TYPE":
					result.typeECD.push({
						key: labels[j].key,
						name: labels[j].usLabel || labels[j].brLabel
					});
					break;
				case "SITUATION BEGINNING":
					result.situationBeginning.push({
						key: labels[j].key,
						name: labels[j].usLabel || labels[j].brLabel
					});
					break;
				case "LARGE COMPANY INDICATOR":
					result.largeCompanyIndicator.push({
						key: labels[j].key,
						name: labels[j].usLabel || labels[j].brLabel
					});
					break;
				case "ACCOUNTING IDENTIFICATION":
					result.accountingIdentification.push({
						key: labels[j].key,
						name: labels[j].usLabel || labels[j].brLabel
					});
					break;
			}
		}
		let companyOptions = object.idCompany;
		if (!object.idCompany) {
			companyOptions = controllerExternal.listCompany().map(function(c) {
				return c.id;
			});
		}
		let ufOptions = object.uf;
		if (!object.uf) {
			ufOptions = controllerExternal.listUF({
				idCompany: companyOptions
			}).map(function(u) {
				return u.id;
			});
		}
		let branchOptions = object.idBranch;
		if (!object.idBranch) {
			branchOptions = controllerExternal.listBranch().map(function(b) {
				return b.id;
			});
		}
		let glAccount = cvGLAccountNumber.READ({
			fields: ["idCompany", "idBranch", "glAccount"],
			where: [{
				field: "idCompany",
				oper: "=",
				value: companyOptions
			}, {
				field: "idBranch",
				oper: "=",
				value: branchOptions
			}]
		});

		for (var k = 0; k < glAccount.length; k++) {
			result.glAccountOptions.push({
				key: glAccount[k].glAccount,
				name: glAccount[k].glAccount,
				idCompany: glAccount[k].idCompany,
				idBranch: glAccount[k].idBranch
			});
		}
		let ledger = cvLedger.READ({
			fields: ["idCompany", "ledger"],
			where: [{
				field: "idCompany",
				oper: "=",
				value: companyOptions
			}]
		});
		for (var k = 0; k < ledger.length; k++) {
			result.ledgerOptions.push({
				key: ledger[k].ledger,
				name: ledger[k].ledger,
				idCompany: ledger[k].idCompany
			});
		}
		let cnpjRoot = cvCNPJ.READ({
			fields: ["cnpjRoot", "idCompany", "idBranch", "validFrom", "validTo"],
			where: [{
				field: "idCompany",
				oper: "=",
				value: companyOptions
 	    	}, {
				field: "idBranch",
				oper: "=",
				value: branchOptions
 	    	}, {
				field: "uf",
				oper: "=",
				value: ufOptions
 		    }]
		}); 
		for (var k = 0; k < cnpjRoot.length; k++) {
			result.cnpjOptions.push({
				key: cnpjRoot[k].cnpjRoot,
				name: cnpjRoot[k].cnpjRoot,
				idCompany: cnpjRoot[k].idCompany,
				idBranch: cnpjRoot[k].idBranch,
				validFrom: cnpjRoot[k].validFrom,
				validTo: cnpjRoot[k].validTo
			});
		}
	} catch (e) {
	    return e;}
	return result;
};
this.createDialogEFCVariant = function(object){
    var result = {
      cnpjRootOptions: [],
      glAccountOptions: [],
      spedVersions: {},
      recordOptions: {}
    };
    try{
        var lang = ($.request.cookies.get("Content-Language") === "enus") ? "enus" : "ptrbr";
		let spedVersions = cvSpedVersions.READ({
			where: [{
				field: "idReport",
				oper: "=",
				value: 3
			}]
		});
		for (var i = 0; i < spedVersions.length; i++) {
			if (!result.spedVersions[spedVersions[i].spedVersion]) {
				result.spedVersions[spedVersions[i].spedVersion] = {
					key: spedVersions[i].spedVersion,
					name: spedVersions[i].spedVersion
				};
			}
			if (!result.recordOptions[spedVersions[i].spedRecord]) {
				result.recordOptions[spedVersions[i].spedRecord] = {
					key: spedVersions[i].spedRecord,
					name: spedVersions[i].spedRecord
				};
			}
		}
		let companyOptions = object.idCompany;
		if (!object.idCompany) {
			companyOptions = controllerExternal.listCompany().map(function(c) {
				return c.id;
			});
		}
		let ufOptions = object.uf;
		if (!object.uf) {
			ufOptions = controllerExternal.listUF({
				idCompany: companyOptions
			}).map(function(u) {
				return u.id;
			});
		}
		let branchOptions = object.idBranch;
		if (!object.idBranch) {
			branchOptions = controllerExternal.listBranch().map(function(b) {
				return b.id;
			});
		}
		let glAccount = cvGLAccountNumber.READ({
			fields: ["idCompany", "idBranch", "glAccount"],
			where: [{
				field: "idCompany",
				oper: "=",
				value: companyOptions
			}, {
				field: "idBranch",
				oper: "=",
				value: branchOptions
			}]
		});

		for (var k = 0; k < glAccount.length; k++) {
			result.glAccountOptions.push({
				key: glAccount[k].glAccount,
				name: glAccount[k].glAccount,
				idCompany: glAccount[k].idCompany,
				idBranch: glAccount[k].idBranch
			});
		}
		let cnpjRoot = cvCNPJ.READ({
			where: [{
				field: "idCompany",
				oper: "=",
				value: companyOptions
 	    	}, {
				field: "idBranch",
				oper: "=",
				value: branchOptions
 	    	}, {
				field: "uf",
				oper: "=",
				value: ufOptions
 		    }]
		}); 
		var cnpjRootOptions = {};
		var notQFields = ["cnpjRoot","cnpj","idCompany","idBranch","validFrom","uf","ie","validTo","mandt"];
		for (var k = 0; k < cnpjRoot.length; k++) {
		    if(!cnpjRootOptions [cnpjRoot[k].cnpjRoot]){
		        cnpjRootOptions [cnpjRoot[k].cnpjRoot] = {
		            	key: cnpjRoot[k].cnpjRoot,
				name: cnpjRoot[k].cnpjRoot,
				idCompany: cnpjRoot[k].idCompany,
				idBranch: cnpjRoot[k].idBranch,
				ie: cnpjRoot[k].ie,
				uf: cnpjRoot[k].uf,
				validFrom: cnpjRoot[k].validFrom,
				validTo: cnpjRoot[k].validTo,
    				questionaries: []
		        };
		    }
		    var quest = {};
		    for(var p in cnpjRoot[k]){
		        if(notQFields.indexOf(p) === -1){
		            quest[p] = cnpjRoot[k][p];
		        }
		    }
		    cnpjRootOptions [cnpjRoot[k].cnpjRoot].questionaries.push(quest);
			
		}
		for(var root in cnpjRootOptions){
		    result.cnpjRootOptions.push(cnpjRootOptions[root]);
		}
    }catch(e){
        return e;
    }
    return result;
    
};
this.createVariant = function(object) {
	var result = {};
	if (object.variants.type) {
		try {
			switch (object.variants.type) {
				case 1:
					result = modelEFDICMSIPIVariant.CREATE(object.variants);
					break;
				case 2:
					result = modelEFDContributionsVariant.CREATE(object.variants);
					break;
				default:
					break;
			}

		} catch (e) {
            return e;
		}
	} else {
		for (var v in object.variants) {
			try {
				switch (object.variants[v].type) {
					case 1:
						result = modelEFDICMSIPIVariant.CREATE(object.variants[v]);
						break;
					case 2:
						result = modelEFDContributionsVariant.CREATE(object.variants[v]);
						break;
					default:
						break;
				}

			} catch (e) {

			}
		}
	}
	return result;
};