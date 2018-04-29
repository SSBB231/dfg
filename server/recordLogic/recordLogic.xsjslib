//---------------------KBARA-29/11/2016----------------------------
$.import('timp.core.server.api', 'api');
var coreApi = $.timp.core.server.api.api;
var sql = coreApi.sql;
var schema = coreApi.schema.default;
var tableLib = coreApi.table_lib;
var _ = coreApi.util;
$.import("timp.atr.server.api", "api");
var atrApi = $.timp.atr.server.api.api;
var modelStructure = atrApi.structure.table;
$.import('timp.dfg.server.controllers', 'util');
var utilDFG = $.timp.dfg.server.controllers.util;
$.import('timp.dfg.server.controllers', 'external');
var controllerExternal = $.timp.dfg.server.controllers.external;

var DFGExecutor = {};
this.DFGExecutor = DFGExecutor;

Function.prototype.inheritsFrom = function(parentClassOrObject) {
	this.prototype = new parentClassOrObject;
	this.prototype.constructor = this;
	this.prototype.parent = parentClassOrObject.prototype;
	return this;
};
var getQueryMonthName = function(field) {
	var lang = $.request.cookies.get("Content-Language") === "ptrbr" ? "ptrbr" : "enus";

	var month = "SUBSTRING(TO_NVARCHAR (" + field + ",\'YYYYMMDD\'),5,2)";
	var months = {
		"enus": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
		"ptrbr": ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro",
            "Dezembro"
        ]
	};
	var query = "CASE( " + month + " )";
	if (months[lang]) {
		for (var i = 0; i < months[lang].length; i++) {
			query += " WHEN '" + (i < 9 ? "0" + (i + 1) : i + 1) + "' THEN '" + months[lang][i] + "'";
		}
	}
	query += " END";
	return query;
};
var _processHanaDate = function(value) {
	var parsedFormat = value;
	var match = parsedFormat.match('aaaa');
	while (match) {
		parsedFormat = parsedFormat.replace('aaaa', '^HANA_YEAR^');
		match = parsedFormat.match('aaaa');
	}
	var match = parsedFormat.match('aa');
	while (match) {
		parsedFormat = parsedFormat.replace('aa', '^HANA_YEAR2^');
		match = parsedFormat.match('aa');
	}
	var match = parsedFormat.match('mm');
	while (match) {
		parsedFormat = parsedFormat.replace('mm', '^HANA_MONTH^');
		match = parsedFormat.match('mm');
	}
	var match = parsedFormat.match('dd');
	while (match) {
		parsedFormat = parsedFormat.replace('dd', '^HANA_DAY^');
		match = parsedFormat.match('dd');
	}
	var elems = parsedFormat.split('^');
	var elemsNoBlanks = [];
	for (var i = 0; i < elems.length; i++) {
		if (elems[i]) {
			elemsNoBlanks.push(elems[i]);
		}
	}
	var hanaFormat = "";
	for (var i = 0; i < elemsNoBlanks.length; i++) {
		if (elemsNoBlanks[i] === 'HANA_YEAR' || elemsNoBlanks[i] === 'HANA_YEAR2' || elemsNoBlanks[i] === 'HANA_MONTH' || elemsNoBlanks[i] ===
			'HANA_DAY') {

		} else {
			elemsNoBlanks[i] = "'" + elemsNoBlanks[i] + "'";
		}
	}
	hanaFormat = elemsNoBlanks.join(" || ");
	return hanaFormat;
};

var processNewFormatDate = function(format, field) {
	var processedDate = "";
	var year = "LEFT(TO_NVARCHAR (" + field + ",\'YYYYMMDD\'), 4)";
	var year2 = "SUBSTRING(TO_NVARCHAR (" + field + ",\'YYYYMMDD\'),3,2)";
	var month = "SUBSTRING(TO_NVARCHAR (" + field + ",\'YYYYMMDD\'),5,2)";
	var day = "SUBSTRING(TO_NVARCHAR (" + field + ",\'YYYYMMDD\'),7,2)";
	var separator = " || '" + format.separator + "'" + " || ";
	var options = ["day", "month", "year"];
	for (var i = 0; i < options.length; i++) {
		if (format.hasOwnProperty(options[i])) {
			switch (format[options[i]]) {
				case "DD":
					{
						processedDate += day;
						processedDate += separator;
						break;
					}
				case "MM":
					{
						processedDate += month;
						processedDate += separator;
						break;
					}
				case "month":
					{

						processedDate += getQueryMonthName(field);
						processedDate += separator;
						break;
					}
				case "AAAA":
					{
						processedDate += year;
						processedDate += separator;
						break;
					}
				case "AA":
					{
						processedDate += year2;
						processedDate += separator;
						break;
					}
			}
		}
	}
	if (processedDate.endsWith(separator)) {
		processedDate = processedDate.substring(0, processedDate.length - separator.length);
	}
	return processedDate;
};

var _processReferencePeriodDate = function(format, field) {
	if (typeof(field) === "string") {
		return field;
	}
	var lang = $.request.cookies.get("Content-Language") === "ptrbr" ? "ptrbr" : "enus";
	var months = {
		"enus": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
		"ptrbr": ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro",
            "Dezembro"
        ]
	};
	var processedDate = "'";
	if (format.day) {
		switch (format.day) {
			case "blank":
				{
					break;
				}
			case "AAAA":
				{
					processedDate += field.year;
					processedDate += format.separator;
					break;
				}
			case "AA":
				{
					processedDate += field.year.slice(-2);
					processedDate += format.separator;
					break;
				}
			case "MM":
				{
					processedDate += field.month;
					processedDate += format.separator;
					break;
				}
			case "month":
				{
					processedDate += months[lang][Number(field.month)];
					processedDate += format.separator;
					break;
				}
			case "DD":
				{
					processedDate += field.day;
					processedDate += format.separator;
					break;
				}
		}
	}
	if (format.month) {
		switch (format.month) {
			case "blank":
				{
					break;
				}
			case "AAAA":
				{
					processedDate += field.year;
					processedDate += format.separator;
					break;
				}
			case "AA":
				{
					processedDate += field.year.slice(-2);
					processedDate += format.separator;
					break;
				}
			case "MM":
				{
					processedDate += field.month;
					processedDate += format.separator;
					break;
				}
			case "month":
				{
					processedDate += months[lang][Number(field.month)];
					processedDate += format.separator;
					break;
				}
			case "DD":
				{
					processedDate += field.day;
					processedDate += format.separator;
					break;
				}
		}
	}
	if (format.year) {
		switch (format.year) {
			case "blank":
				{
					break;
				}
			case "AAAA":
				{
					processedDate += field.year;
					processedDate += format.separator;
					break;
				}
			case "AA":
				{
					processedDate += field.year.slice(-2);
					processedDate += format.separator;
					break;
				}
			case "MM":
				{
					processedDate += field.month;
					processedDate += format.separator;
					break;
				}
			case "month":
				{
					processedDate += months[lang][Number(field.month)];
					processedDate += format.separator;
					break;
				}
			case "DD":
				{
					processedDate += field.day;
					processedDate += format.separator;
					break;
				}
		}
	}
	if (processedDate.endsWith(format.separator) && format.separator !== "") {
		processedDate = processedDate.substring(0, processedDate.length - format.separator.length);
	}
	processedDate += "'";
	return processedDate;
};

var numericFormat = function(field, format, hasHidingRule) {
	var decimal = format.decimal;
	var decimalSeparator = format.decimalSeparator;
	var miliarSeparator = format.miliarSeparator;
	var size = format.size;
	var sizeDecimal, sizeMiliar;
	var align = (format.align === undefined || format.align === "") ? 1 : format.align;
	var alignQuery;
	var originalField = field;
	var searchFor = format.searchFor;
	var replaceWith = format.replaceWith;
	var completeCase = 0;
	var complement = format.complement;
	if (!isNaN(parseInt(field, 10))) {
		field += "";
	}
	if (!size) {
		size = "LENGTH(" + field + ")";
		sizeDecimal = "LENGTH(TO_DECIMAL(" + (field.match(new RegExp(/\'\'/g)) ? 0 : field) + ",10," + decimal + "))";
		sizeMiliar = 0;
	} else {
		completeCase = 1;
		sizeMiliar = size;
		sizeDecimal = size;
	}
	if (complement && !align) {
		align = 0;
	}
	if (!complement) {
		complement = "";
	} else if (complement === "space") {
		complement = " ";
	}
	if (align === 0) {
		alignQuery = 'LPAD';
	} else if (align === 1) {
		alignQuery = 'RPAD';
	}
	if (decimal) {
		if (decimal !== '0') {
			field = "(RPAD(TO_DECIMAL(" + (field.match(new RegExp(/\'\'/g)) ? 0 : field) + ",10," + decimal + "),LENGTH(FLOOR(" + (field.match(new RegExp(
				/\'\'/g)) ? 0 : field) + "))+" + decimal + "+1,0))";
			size = sizeDecimal;
		} else {
			field = "(RPAD(TO_DECIMAL(" + (field.match(new RegExp(/\'\'/g)) ? 0 : field) + ",10," + decimal + "),LENGTH(FLOOR(" + (field.match(new RegExp(
				/\'\'/g)) ? 0 : field) + "))+" + decimal + ",0))";
		}
	}
	if (decimalSeparator) {
		field = "(REPLACE(" + field + ",'.','" + decimalSeparator + "'))";
	}
	if (searchFor) {
		if (typeof searchFor === "string") {
			searchFor = [searchFor];
		}
		if (replaceWith) {
			if (typeof replaceWith === "string") {
				replaceWith = [replaceWith];
			}
			for (var i = 0; i < searchFor.length; i++) {
				if (searchFor[i]) {
					field = "(REPLACE(" + field + ",'" + searchFor[i] + "','" + replaceWith[i] + "'))";
				}

			}
		} else {
			for (var i = 0; i < searchFor.length; i++) {
				if (searchFor[i]) {
					field = "(REPLACE(" + field + ",'" + searchFor[i] + "',''))";
				}

			}
		}
	}
	if (alignQuery) {
		field = alignQuery + "(" + field + "," + size + ",'" + complement + "')";
	}
	if (!hasHidingRule) {
		if (completeCase === 1) {
			field = "CASE WHEN " + originalField + " IS NULL THEN NULL ELSE (" + field + ") END";

		}

	}
	return field;
};

var stringFormat = function(field, format, hasHidingRule) {
	var originalField = field;
	var isUpper = format.isUpper;
	var isLower = format.isLower;
	var size = format.size;
	var align = format.align;
	var alignQuery;
	var searchFor = format.searchFor;
	var replaceWith = format.replaceWith;
	var completeCase = 0;
	var complement = format.complement;
	if (!size) {
		size = "LENGTH(" + field + ")";
	} else {
		completeCase = 1;
	}
	if (complement !== undefined && !align) {
		align = 0;
	}
	if (complement === undefined) {
		complement = "";
	} else if (complement === "space") {
		complement = " ";
	}

	if (align === 1) {
		alignQuery = 'LPAD';
	} else if (align === 0) {
		alignQuery = 'RPAD';
	}
	if (searchFor) {
		if (typeof searchFor === "string") {
			searchFor = [searchFor];
		}
		if (replaceWith) {
			if (typeof replaceWith === "string") {
				replaceWith = [replaceWith];
			}
			for (var i = 0; i < searchFor.length; i++) {
				if (searchFor[i]) {
					field = "(REPLACE(" + field + ",'" + searchFor[i] + "','" + replaceWith[i] + "'))";
				}

			}
		} else {
			for (var i = 0; i < searchFor.length; i++) {
				if (searchFor[i]) {
					field = "(REPLACE(" + field + ",'" + searchFor[i] + "',''))";
				}

			}
		}
	}
	if (complement !== undefined && alignQuery) {
		field = alignQuery + "(" + field + "," + size + ",'" + complement + "')";
	}
	if (isUpper === true) {
		field = "UPPER(" + field + ")";
	}
	if (isLower === true) {
		field = "LOWER(" + field + ")";
	}
	if (!hasHidingRule) {
		if (completeCase === 1) {
			field = "CASE WHEN " + originalField + " IS NULL THEN NULL ELSE (" + field + ") END";
		}
	}
	return field;
};
var dateFormat = function(field, format, hasHidingRule, isReferencePeriod) {
	var originalField = field;
	var datePattern = format.dateFormat || format;
	var size = format.size;
	var sizeDate;
	var complement = format.complement;
	var align = format.align;
	var alignQuery;
	var searchFor = format.searchFor;
	var replaceWith = format.replaceWith;
	var completeCase = 0;
	sizeDate = size || null;
	if (!complement) {
		complement = "";
	} else if (complement === "space") {
		complement = " ";
	}

	if (align === 1) {
		alignQuery = 'LPAD';
	} else if (align === 0) {
		alignQuery = 'RPAD';
	}
	if (datePattern && typeof(datePattern) === "string") {
		var year = "LEFT(TO_NVARCHAR (" + field + ",\'YYYYMMDD\') , 4)";
		var year2 = "SUBSTRING(TO_NVARCHAR (" + field + ",\'YYYYMMDD\') ,3,2)";
		var month = "SUBSTRING(TO_NVARCHAR (" + field + ",\'YYYYMMDD\') ,5,2)";
		var day = "SUBSTRING(TO_NVARCHAR (" + field + ",\'YYYYMMDD\') ,7,2)";
		var formattedDate = _processHanaDate(datePattern);
		formattedDate = formattedDate.replace('HANA_YEAR', year);
		formattedDate = formattedDate.replace('HANA_YEAR2', year2);
		formattedDate = formattedDate.replace('HANA_MONTH', month);
		formattedDate = formattedDate.replace('HANA_DAY', day);
		if (sizeDate) {
			field = "(" + alignQuery.toString() + "(" + formattedDate + "," + sizeDate + ",'" + complement + "'))";
		} else {
			field = formattedDate;
		}
	} else {
		if (datePattern) {
			if (isReferencePeriod !== true) {
				field = processNewFormatDate(datePattern, field);
			} else {
				field = _processReferencePeriodDate(datePattern, originalField);
			}
		}
	}
	if (searchFor) {
		if (replaceWith) {
			field = "(REPLACE(" + field + ",'" + searchFor + "','" + replaceWith + "'))";
		} else {
			field = "(REPLACE(" + field + ",'" + searchFor + "',''))";
		}
	}
	if (complement !== "" && alignQuery) {
		field = alignQuery + "(" + field + "," + size + ",'" + complement + "')";
	}
	if (!hasHidingRule) {
		if (completeCase === 1) {
			field = "CASE WHEN " + originalField + " IS NULL THEN NULL ELSE (" + field + ") END";
		}
	}
	return field;
};

var hourFormat = function(format, time) {
	var processTime = "";
	var options = ["day", "month", "year"];
	for (var i = 0; i < options.length; i++) {
		if (format.hasOwnProperty(options[i])) {
			switch (format[options[i]]) {
				case "HH":
					{
						processTime += time[0] + format.separator;
						break;
					}
				case "MI":
					{
						processTime += time[1] + format.separator;
						break;
					}
				case "SS":
					{
						processTime += time[2] + format.separator;
						break;
					}
			}
		}
	}
	if (processTime.endsWith(format.separator)) {
		processTime = processTime.substring(0, processTime.length - format.separator.length);
	}
	return processTime;
};

/**
 *raw = {eefi: {}, json: {}, mapConfig:{}, generatedRecords:{}}
 *record = {columns:{},positions:{}, filters:{},format:{},groups:{}, manualParams:{}, hidingRule:{}, isDistinct: boolean, name: "", positions:[]}
 *
 **/
DFGExecutor.Record = function(raw, record) {
	if (arguments.length !== 0) {
		this.__init__(raw, record);
	}
	return this;
};
DFGExecutor.Record.prototype = {
	__init__: function(raw, record) {
		this.raw = raw;
		this.record = record;
		this.structureNames = {};
		this.fromStructures = {};
		this.fieldIdMapStructureNames = {};
		this.structureXFilteredColumns = {};
		this.groupTableCache = [];
		this.newTablesXFilters = {};
		this.specialFields = {};
		this.queries = [];
		this.hasListRecord = false;
		this.record.groupersRecords = {};
		this.viewPlaceholders = $.getViewPlaceholder(['IP_MANDANTE', 'IP_DATE_FROM', 'IP_LANGUAGE', 'IP_YEAR_FROM', 'IP_YEAR2_FROM']);
        if(record.dependentFieldsValues && Object.keys(record.dependentFieldsValues)){
            this.dependentRecordsCache = this.createDependentRecordsCache(record.dependentFieldsValues,record.dependentFieldsDimensions);
        }
		if (this.record.groups && this.record.groups.structures) {
			for (var s in this.record.groups.structures) {
				if (this.record.groups.structures[s] && this.record.groups.structures[s].groups) {
					for (var g = 0; g < this.record.groups.structures[s].groups.length; g++) {
						var newTotals = [];
						if (this.record.groups.structures[s].groups[g] && this.record.groups.structures[s].groups[g].totals) {
							for (var t = 0; t < this.record.groups.structures[s].groups[g].totals.length; t++) {
								var columnId = this.record.groups.structures[s].groups[g].totals[t];
								if (this.record.columns[columnId]) {
									if (this.record.columns[columnId].formula) {
										if (!this.record.columns[columnId].formula.raw) {
											this.record.columns[columnId].formula.raw = "\'\'";
										}
										if (Array.isArray(this.record.columns[columnId].formula.idStructure) && this.record.columns[columnId].formula.idStructure.length >
											1) {
											if (this.record.columns[columnId].formula.idStructure.length > 1) {
												var ids = this.record.columns[columnId].formula.raw.match(/ID_[0-9]+(_[0-9]+)?/g);
												for (var id = 0; id < ids.length; id++) {
													var idStructure = ids[id].split("_")[2];
													if (Number(idStructure) === Number(s)) {
														if (newTotals.indexOf(ids[id].split("_")[1]) === -1 && this.record.groups.structures[s].groups[g].totals.indexOf(ids[id].split(
															"_")[1])) {
															newTotals.push(ids[id].split("_")[1]);
														}
													}
												}
											} else {
												newTotals.push(columnId);
											}
										} else if (!Array.isArray(this.record.columns[columnId].formula.idStructure) && Number(this.record.columns[columnId].formula.idStructure) ===
											Number(s)) {
											newTotals.push(columnId);
										}
									} else {
										newTotals.push(columnId);
									}
								}
							}
							this.record.groups.structures[s].groups[g].totals = newTotals;
						}

					}
				}
			}
		}
		this.listFields = [];
		for (var c in this.record.columns) {
			record.columns[c].columnId = c;
			if (this.record.format && !record.columns[c].format) {
				record.columns[c].format = this.record.format;
			} else {
				if (this.record.format && record.columns[c].format) {
					record.columns[c].number = record.columns[c].format.number || this.record.format.number;
					record.columns[c].format.string = record.columns[c].format.string || this.record.format.string;
					record.columns[c].format.date = record.columns[c].format.date || this.record.format.date;
				}
			}
			record.columns[c].hidingRule = record.columns[c].hidingRule || record.hidingRule;
			let hR = record.columns[c].hidingRule;
			if (!hR || (!hR.hide && !hR.hideAllLine && !hR.hideValue && !hR.hideField)) {
                record.columns[c].hidingRule = record.hidingRule;
			}
			var column;
			if (record.positions.indexOf(c) !== -1 || (!isNaN(parseInt(c, 10)) && record.positions.indexOf(parseInt(c, 10) !== -1))) {
				if (record.columns[c].formula) {
					column = new DFGExecutor.FormulaColumn(record.columns[c], this);
				} else {
					var type = this.getColumnType(c);
					column = new DFGExecutor[type](record.columns[c], this);
				}
				if (record.columns[c].listField) {
					this.listFields.push(record.columns[c].listField);
				}

				column.addField();
				this.record.columns[c] = column;
			} else {
				delete this.record.columns[c];
			}
		}

	},
	columnRegex: {
		"^[0-9]+S[0-9]+C[0-9]+$": "StructureFieldColumn",
		"^(recordId)[0-9]+$": "RecordIdColumn",
		"^m[0-9]+$": "ManualParamColumn",
		"^fmf[0-9]+$": "FixedManualFieldColumn",
		"^fxf[0-9]+$": "FixedFieldColumn",
		"^sf[0-9]+$": "SequenceFieldColumn",
		"^f[0-9]+$": "FillerColumn",
		"^v[0-9]+$": "VersionColumn",
		"^sp[0-9]+$": "ReferencePeriodColumn",
		"^recordsTotals[0-9]*$": "RecordTotalColumn",
		"^initialDateReference[0-9]*$": "InitialDateReferenceColumn",
		"^finalDateReference[0-9]*$": "FinalDateReferenceColumn",
		"^blockTotal[0-9]*$": "BlockTotalColumn",
		"^totalsAll[0-9]*$": "TotalAllColumn",
		"^totalChildRecord[0-9]*$": "TotalChildRecord",
		"^recordCounter[0-9]*$": "RecordCounter",
		"^recordList[0-9]*$": "RecordList",
		"^newline[0-9]*$": "LineBreakColumn",
		"^DTE[0-9]*$": "ExecutionDateColumn",
		"^HRE[0-9]*$": "ExecutionHourColumn",
		"^O[0-9]+$": "OutputColumn",
		"^BCB_[0-9]+$": "OutputColumn",
		"^BFB_[0-9]+$": "OutputColumn",
		"^lf[0-9]+$": "ListFieldColumn",
		"^groupedLines[0-9]*$": "GroupedLinesColumn"
	},
	getColumnType: function(columnId) {
		for (var regex in this.columnRegex) {
			if (columnId.match(new RegExp(regex)) !== null) {
				return this.columnRegex[regex];
			}
		}
	},
	processListFields: function() {
		var limit = 10000;
		var structXFields = {};
		var listFieldMapping = {};
		for (var lf = 0; lf < this.listFields.length; lf++) {
			listFieldMapping[this.listFields[lf].name] = lf;
			for (var f = 0; f < this.listFields[lf].fields.length; f++) {
				if (!structXFields[this.listFields[lf].fields[f].idStructure]) {
					structXFields[this.listFields[lf].fields[f].idStructure] = {};
				}
				if (!structXFields[this.listFields[lf].fields[f].idStructure][this.listFields[lf].name]) {
					structXFields[this.listFields[lf].fields[f].idStructure][this.listFields[lf].name] = [];
				}
				if (structXFields[this.listFields[lf].fields[f].idStructure][this.listFields[lf].name].indexOf(this.listFields[lf].fields[f].id) === -1) {
					structXFields[this.listFields[lf].fields[f].idStructure][this.listFields[lf].name].push(this.listFields[lf].fields[f].id);
				}
			}
		}
		var structXRelation = {};
		if (this.record.structureRelation) {
			for (var rs = 0; rs < this.record.structureRelation.length; rs++) {
				var idStructure1 = this.record.structureRelation[rs].structureId1;
				var idStructure2 = this.record.structureRelation[rs].structureId2;
				if (structXFields[idStructure1] || structXFields[idStructure2]) {
					if (structXFields[idStructure1]) {
						if (!structXRelation[idStructure1]) {
							structXRelation[idStructure1] = {};
						}
						structXRelation[idStructure1][idStructure2] = {};
						for (var f in this.record.structureRelation[rs].fields) {
							structXRelation[idStructure1][idStructure2][this.record.structureRelation[rs].fields[f].field2.id] = this.record.structureRelation[
								rs].fields[f].field1.id;
						}
					} else {
						if (!structXRelation[idStructure2]) {
							structXRelation[idStructure2] = {};
						}
						structXRelation[idStructure2][idStructure1] = {};
						for (var f in this.record.structureRelation[rs].fields) {
							structXRelation[idStructure2][idStructure1][this.record.structureRelation[rs].fields[f].field1.id] = this.record.structureRelation[
								rs].fields[f].field2.id;
						}
					}
				}

			}
		}
		var mergeRelations = {};
		for (var s in structXRelation) {
			for (var r in structXRelation[s]) {
				for (var s2 in structXRelation) {
					if (s !== s2) {
						if (structXRelation[s2][r]) {
							if (!mergeRelations[r]) {
								mergeRelations[r] = {
									fields: {}
								};
							}
							for (var f in structXRelation[s][r]) {
								if (structXRelation[s2][r][f]) {
									if (!mergeRelations[r].fields[f]) {
										mergeRelations[r].fields[f] = {};
									}
									mergeRelations[r].fields[f][s] = structXRelation[s][r][f];
									mergeRelations[r].fields[f][s2] = structXRelation[s2][r][f];
								}
							}
						}
					}
				}
			}
		}

		var queries = [];
		var allFields = [];
		for (var s in structXFields) {
			var q = {
				query: "",
				fields: {

				},
				positions: {

				}
			};
			var fields = [];
			for (var n in structXFields[s]) {
				for (var f = 0; f < structXFields[s][n].length; f++) {
					fields.push("C_" + structXFields[s][n][f] + " AS \"" + n + "\"");
					q.fields[n] = fields.length - 1;

					if (allFields.indexOf(n) === -1) {
						allFields.push(n);
					}

				}
			}
			if (structXRelation[s]) {
				for (var r in structXRelation[s]) {
					for (var f in structXRelation[s][r]) {
						fields.push("C_" + structXRelation[s][r][f] + " AS \"C_" + structXRelation[s][r][f] + "\"");
						q.fields[f] = fields.length - 1;
						if (allFields.indexOf(f) === -1) {
							allFields.push(f);
						}
					}

				}
			}
			if (!this.raw.eefiConditions.mapConfigFields[s] || !this.raw.eefiConditions.mapConfigFields[s].company) {
				fields.push("\"C_Company\"");
			} else {
				fields.push(this.raw.eefiConditions.mapConfigFields[s].company);
			}
			if (fields.length && this.raw.structureMapCache[s] && this.raw.structureMapCache[s].tableName) {
				q.query = "SELECT " + fields.toString() + " ,COUNT(1) OVER()" + " FROM " + this.raw.structureMapCache[s].tableName + " LIMIT " + limit +
					" OFFSET " + 0;
				q.idStructure = s;
				queries.push(q);
			}
		}

		var values = {};
		var queryXvalues = {};
		for (var q = 0; q < queries.length; q++) {
			values[queries[q].idStructure] = sql.SELECT(queries[q]);
			queryXvalues[queries[q].idStructure] = q;
		}
		var data = [];

		var i = 0;
		var result = this.createListFieldsCache(allFields, mergeRelations);
		var lineNumber = 0;
		for (var v in values) {
			var totalLines, pageCount = 0;
			for (var d = 0; d < values[v].length; d++) {
				var row = [];
				if (d === 0) {
					totalLines = values[v][d][values[v][d].length - 1];

					pageCount = Math.ceil(totalLines / limit);
				}
				values[v][d].splice(values[v][d].length - 1, 1);
				for (var af = 0; af < allFields.length; af++) {
					if (queries[i].fields[allFields[af]] !== undefined) {
						row.push(values[v][d][queries[i].fields[allFields[af]]]);
					} else {
						row.push("");
					}
				}
				row.push(values[v][d][values[v][d].length - 1]); //por default se agrega el campo de empresa
				data.push(row);

			}
			this.insertListFieldsCache(data, result.table, result.fields, result.insertPositions, lineNumber);
			lineNumber += data.length;
			queries[queryXvalues[v]].query = queries[queryXvalues[v]].query.split(" ,COUNT(1) OVER()").join(" ");
			data = [];
			for (var p = 1; p < pageCount; p++) {
				queries[queryXvalues[v]].query = queries[queryXvalues[v]].query.split("OFFSET")[0] + " OFFSET " + (p * limit);
				var queryResult = sql.SELECT(queries[queryXvalues[v]]);
				for (var qr = 0; qr < queryResult.length; qr++) {
					row = [];
					for (var af = 0; af < allFields.length; af++) {
						if (queries[i].fields[allFields[af]] !== undefined) {
							row.push(queryResult[qr][queries[queryXvalues[v]].fields[allFields[af]]]);
						} else {
							row.push("");
						}
					}
					row.push(queryResult[qr][queryResult[qr].length - 1]);
					data.push(row);
				}
				this.insertListFieldsCache(data, result.table, result.fields, result.insertPositions, lineNumber);
				lineNumber += (data.length - 1);
				data = [];
			}

			i++;
		}

	},
	createDependentRecordsCache: function(dependentFieldsValues,dependentFieldsDimensions){
	    var tablesNames = {};
	    for(var block in dependentFieldsValues){
	        tablesNames[block] = {};
	        for(var record in dependentFieldsValues[block]){
                if(block === this.record.blockId && record === this.record.recordId){
                    continue;
                }
                this.record.groupersRecords[block + '_' + record] = true;
	            var executionTime = new Date();
        		var execString = "" + executionTime.getFullYear();
        		if (executionTime.getMonth() + 1 < 10) {
        			execString += "0" + (executionTime.getMonth() + 1);
        		} else {
        			execString += (executionTime.getMonth() + 1);
        		}
        		if (executionTime.getDate() < 10) {
        			execString += "0" + executionTime.getDate();
        		} else {
        			execString += executionTime.getDate();
        		}
        		var tableName = schema + '."DFG::Cache_' + $.getUserID() + block+record + executionTime.getTime() + "_" +
        			execString + '"'; //Unique name for table;
        		var sequenceName = schema + '."DFG::Cache_' + $.getUserID() + block+record + executionTime.getTime() + "_" +
        			execString + '::ID"';
        		var insertPositions = [];
        		var options = {
        			name: tableName,
        			fields: {
        				id: new tableLib.AutoField({
        					name: 'ID',
        					auto: sequenceName + '.nextval',
        					type: $.db.types.INTEGER,
        					pk: true
        				})
        			}
        		};
        		for(var column in dependentFieldsDimensions[block][record]){
        		    insertPositions.push(column);
        		    this.fieldIdMapStructureNames[block+"-"+record+"-"+column] = "B"+block+"R"+record;
        		    options.fields[column] = new tableLib.Field({
        				name: "C_" + column,
        				type: $.db.types[dependentFieldsDimensions[block][record][column].type],
        				dimension: dependentFieldsDimensions[block][record][column].dimension,
        				precision:  dependentFieldsDimensions[block][record][column].precision
        			}); 
        		}
        		options.fields.Company = new tableLib.Field({
        			name: "C_Company",
        			type: $.db.types.NVARCHAR, 
        			dimension: 4
        		});
        		insertPositions.push("Company");
		        insertPositions.push("id");
		        var table = new tableLib.Table(options);
		        tablesNames[block][record] = table.name;
		        this.fromStructures["B"+block+"R"+record] = tableName;
        		var create = table.CREATE_STATEMENT();
        		sql.EXECUTE({
        			query: create
        		});
        		sql.EXECUTE({
        			query: "CREATE SEQUENCE " + sequenceName
        		});
        		var fields = [];
        		for (var i = 0; i < insertPositions.length; i++) {
        			fields.push(table.fields[insertPositions[i]]);
        		}
        		var data = [];
        		for(var  line  = 0; line < dependentFieldsValues[block][record].length ; line++){
        		    var values = [];
        		    for(var f = 0; f < insertPositions.length; f++){
        		        if(insertPositions[f] === "Company"){
        		            break;
        		        }
        		        if(dependentFieldsValues[block][record][line][insertPositions[f]] !== undefined){
        		            values.push(dependentFieldsValues[block][record][line][insertPositions[f]]);
        		        }else{
        		            if(dependentFieldsDimensions[block][record][insertPositions[f]] === "INTEGER"){
        		                values.push(0);
        		            }else{
        		                values.push("");
        		            }
        		        }
        		    }
        		    values.push(this.raw.eefi.idCompany);
        		    values.push(data.length+1);
        		    data.push(values);
        		}
        		sql.BATCH_INSERT({
    				table: table.name,
    				fields: fields,
    				values: data
    			});
	        }
	    }
	    return tablesNames;
	    
	},
	createListFieldsCache: function(fields, mergeRelations) {
		var executionTime = new Date();
		var execString = "" + executionTime.getFullYear();
		if (executionTime.getMonth() + 1 < 10) {
			execString += "0" + (executionTime.getMonth() + 1);
		} else {
			execString += (executionTime.getMonth() + 1);
		}
		if (executionTime.getDate() < 10) {
			execString += "0" + executionTime.getDate();
		} else {
			execString += executionTime.getDate();
		}
		var tableName = schema + '."DFG::Cache_' + $.getUserID() + "listFieldTable" + executionTime.getTime() + "_" +
			execString + '"'; //Unique name for table;
		var sequenceName = schema + '."DFG::Cache_' + $.getUserID() + "listFieldTable" + executionTime.getTime() + "_" +
			execString + '::ID"';
		var insertPositions = [];
		var options = {
			name: tableName,
			fields: {
				id: new tableLib.AutoField({
					name: 'ID',
					auto: sequenceName + '.nextval',
					type: $.db.types.INTEGER,
					pk: true
				})
			}
		};
		for (var af = 0; af < fields.length; af++) {
			insertPositions.push(fields[af]);
			options.fields[fields[af]] = new tableLib.Field({
				name: "C_" + fields[af],
				type: $.db.types.NVARCHAR,
				dimension: 50
			});
		}
		options.fields.Company = new tableLib.Field({
			name: "C_Company",
			type: $.db.types.NVARCHAR,
			dimension: 50
		});
		insertPositions.push("Company");
		insertPositions.push("id");
		var table = new tableLib.Table(options);
		var create = table.CREATE_STATEMENT();
		sql.EXECUTE({
			query: create
		});
		sql.EXECUTE({
			query: "CREATE SEQUENCE " + sequenceName
		});

		var fields = [];
		for (var i = 0; i < insertPositions.length; i++) {
			fields.push(table.fields[insertPositions[i]]);
		}
		this.raw.structureMapCache.listFieldsTable = {
			tableName: tableName,
			fields: insertPositions,
			relatedFields: mergeRelations
		};
		return {
			table: table,
			fields: fields,
			insertPositions: insertPositions
		};
	},
	insertListFieldsCache: function(data, table, fields, insertPositions, id, hasCount) {
		if ((data && data.length > 0) && table) {
			for (var i = 0; i < data.length; i++) {
				if (hasCount) {
					data[i].splice(data[i].length - 1, 1);
				}
				if (data[i].concat) {
					data[i] = data[i].concat([id + 1]);
					id++;
				}
				for (var column = 0; column < data[i].length; column++) {
					if (Array.isArray(data[i][column])) {
						data[i][column] = JSON.stringify(data[i][column]);
					}
					if (table.fields[insertPositions[column]].type === $.db.types.INTEGER) {
						data[i][column] = parseInt(data[i][column], 10);
					}
					if (table.fields[insertPositions[column]].type === $.db.types.DECIMAL) {
						data[i][column] = parseFloat(data[i][column]);
					}
				}

			}

			sql.BATCH_INSERT({
				table: table.name,
				fields: fields,
				values: data
			});

		}
	},
	isGroupBy: function(idStructure, fieldId) {
		if (this.record.groups && this.record.groups.structures[idStructure] && this.record.groups.structures[idStructure].groups) {
			for (var g = 0; g < this.record.groups.structures[idStructure].groups.length; g++) {
				if (this.record.groups.structures[idStructure].groups[g].groupBy.indexOf(Number(fieldId)) !== -1 || this.record.groups.structures[
					idStructure].groups[g].groupBy.indexOf(fieldId + "") !== -1) {
					return true;
				}
				if (this.record.groups.structures[idStructure].groups[g].groupByDate && Number(this.record.groups.structures[idStructure].groups[g].groupByDate
					.fieldId) === Number(fieldId)) {
					return true;
				}
			}
		}
		return false;
	},
	isTotal: function(idStructure, fieldId) {
		if (this.record.groups && this.record.groups.structures[idStructure] && this.record.groups.structures[idStructure].groups) {
			for (var g = 0; g < this.record.groups.structures[idStructure].groups.length; g++) {
				if (this.record.groups.structures[idStructure].groups[g].totals.indexOf(Number(fieldId)) !== -1 || this.record.groups.structures[
					idStructure].groups[g].totals.indexOf(fieldId + "") !== -1) {
					return true;
				}
			}
		}
		return false;
	},
	getGroupID: function(idStructure, fieldId) {
		if (this.record.groups && this.record.groups.structures[idStructure] && this.record.groups.structures[idStructure].groups) {
			for (var g = 0; g < this.record.groups.structures[idStructure].groups.length; g++) {
				if (this.record.groups.structures[idStructure].groups[g].totals.indexOf(Number(fieldId)) !== -1 || this.record.groups.structures[
					idStructure].groups[g].totals.indexOf(fieldId + "") !== -1 || this.record.groups.structures[idStructure].groups[g].groupBy.indexOf(
					Number(fieldId)) !== -1 || this.record.groups.structures[idStructure].groups[g].groupBy.indexOf(fieldId + "") !== -1) {
					return this.record.groups.structures[idStructure].groups[g].ID;
				}
				if (this.record.groups.structures[idStructure].groups[g].groupByDate && Number(this.record.groups.structures[idStructure].groups[g].groupByDate
					.fieldId) === Number(fieldId)) {
					return this.record.groups.structures[idStructure].groups[g].ID;
				}
			}
		}
		return undefined;
	},
	getGroup: function(idStructure, fieldId) {
		if (this.record.groups && this.record.groups.structures[idStructure] && this.record.groups.structures[idStructure].groups) {
			for (var g = 0; g < this.record.groups.structures[idStructure].groups.length; g++) {
				if (this.record.groups.structures[idStructure].groups[g].totals.indexOf(Number(fieldId)) !== -1 || this.record.groups.structures[
					idStructure].groups[g].groupBy.indexOf(Number(fieldId)) !== -1 || this.record.groups.structures[idStructure].groups[g].totals.indexOf(
					fieldId + "") !== -1 || this.record.groups.structures[
					idStructure].groups[g].groupBy.indexOf(fieldId + "") !== -1) {
					return this.record.groups.structures[idStructure].groups[g];
				}
				if (this.record.groups.structures[idStructure].groups[g].groupByDate && Number(this.record.groups.structures[idStructure].groups[g].groupByDate
					.fieldId) === Number(fieldId)) {
					return this.record.groups.structures[idStructure].groups[g];
				}
			}
		}
		return undefined;
	},
	addStructureField: function(idStructure, column) {
		var groupID = this.getGroupID(idStructure, column.raw.columnId);
		var group = this.getGroup(idStructure, column.raw.columnId);
		var filterGC;
		if (group !== undefined && group.columnFilters && group.columnFilters[column.raw.columnId] && group.columnFilters[column.raw.columnId].length) {
			filterGC = group.columnFilters[column.raw.columnId];
		}
		let inputParameters, inputParam;
		inputParameters = !this.raw.structureMapCache ? this.raw.structureCache[idStructure].inputParameters : undefined;
		if (column.raw.filters && column.raw.filters.length || filterGC) {
			var filtersS;
			if (filterGC) {
				filtersS = filterGC;
			}
			if (column.raw.filters && column.raw.filters.length) {
				filtersS = column.raw.filters;
			}
			var temp = {};
			temp[column.raw.idStructure] = $.lodash.cloneDeep(filtersS); 
			filtersS = this.mergeFilters(this.record.filters, temp);
			var filters = this.processStructureFilters(filtersS[column.raw.idStructure], column.raw.idStructure);
			if (!this.structureXFilteredColumns[idStructure]) {
				this.structureXFilteredColumns[idStructure] = {};
			}
			if (!this.structureXFilteredColumns[idStructure][filters]) {
				this.structureXFilteredColumns[idStructure][filters] = "T" + (Object.keys(this.structureXFilteredColumns[idStructure]).length + 1) +
					"_" + "S" + idStructure;
				this.newTablesXFilters[this.structureXFilteredColumns[idStructure][filters]] = filters;
			}
			if (!this.structureNames[this.structureXFilteredColumns[idStructure][filters]]) {
				this.structureNames[this.structureXFilteredColumns[idStructure][filters]] = {};
				if (!this.raw.structureMapCache) {
					this.fromStructures[this.structureXFilteredColumns[idStructure][filters]] = "\"_SYS_BIC\".\"" + this.raw.structureCache[idStructure].hanaPackage +
						"/" + this.raw.structureCache[
							idStructure].hanaName + "\"";
					
					this.fromStructures[this.structureXFilteredColumns[idStructure][filters]] += this.viewPlaceholders;
				// 	if (inputParameters && inputParameters.length) {
				// 		this.fromStructures[this.structureXFilteredColumns[idStructure][filters]] += ' (\'PLACEHOLDER\' = (';
				// 		for (inputParam = 0; inputParam < inputParameters.length; inputParam++) {
				// 			this.fromStructures[this.structureXFilteredColumns[idStructure][filters]] += inputParam > 0 ? ',' : '';
				// 			this.fromStructures[this.structureXFilteredColumns[idStructure][filters]] += '\'$$' + inputParameters[inputParam].hanaName + '$$\',';
				// 			if (inputParameters[inputParam].hasOwnProperty("value") && inputParameters[inputParam].value) {
				// 				this.fromStructures[this.structureXFilteredColumns[idStructure][filters]] += '\'' + inputParameters[inputParam].value + '\'';
				// 			} else {
				// 				this.fromStructures[this.structureXFilteredColumns[idStructure][filters]] += '\'*\'';
				// 			}
				// 		}
				// 		this.fromStructures[this.structureXFilteredColumns[idStructure][filters]] += ')) ';
				// 	}
				} else {
					this.fromStructures[this.structureXFilteredColumns[idStructure][filters]] = this.raw.structureMapCache[column.raw.idStructure].tableName;
				}
			}
			if (this.structureNames[this.structureXFilteredColumns[idStructure][filters]]) {
				this.structureNames[this.structureXFilteredColumns[idStructure][filters]][column.raw.columnId] = column;
				this.fieldIdMapStructureNames[column.raw.columnId + "S" + idStructure] = this.structureXFilteredColumns[idStructure][filters];
			}
		} else if (groupID !== undefined) {
			if (!this.structureNames["S" + idStructure + "G" + groupID]) {
				this.structureNames["S" + idStructure + "G" + groupID] = {};
				if (!this.raw.structureMapCache) {
					this.fromStructures["S" + idStructure + "G" + groupID] = "\"_SYS_BIC\".\"" + this.raw.structureCache[idStructure].hanaPackage + "/";
					this.fromStructures["S" + idStructure + "G" + groupID] += this.raw.structureCache[idStructure].hanaName + "\"";
					
					this.fromStructures["S" + idStructure + "G" + groupID] += this.viewPlaceholders;
				// 	if (inputParameters && inputParameters.length) {
				// 		this.fromStructures["S" + idStructure + "G" + groupID] += ' (\'PLACEHOLDER\' = (';
				// 		for (inputParam = 0; inputParam < inputParameters.length; inputParam++) {
				// 			this.fromStructures["S" + idStructure + "G" + groupID] += inputParam > 0 ? ',' : '';
				// 			this.fromStructures["S" + idStructure + "G" + groupID] += '\'$$' + inputParameters[inputParam].hanaName + '$$\',';
				// 			if (inputParameters[inputParam].hasOwnProperty("value") && inputParameters[inputParam].value) {
				// 				this.fromStructures["S" + idStructure + "G" + groupID] += '\'' + inputParameters[inputParam].value + '\'';
				// 			} else {
				// 				this.fromStructures["S" + idStructure + "G" + groupID] += '\'*\'';
				// 			}
				// 		}
				// 		this.fromStructures["S" + idStructure + "G" + groupID] += ')) ';
				// 	}
				} else {
					if (this.raw.structureMapCache[idStructure] && this.raw.structureMapCache[idStructure].tableName) {
						this.fromStructures["S" + idStructure + "G" + groupID] = this.raw.structureMapCache[idStructure].tableName;
					}
				}
			}
			if (this.structureNames["S" + idStructure + "G" + groupID]) {
				this.structureNames["S" + idStructure + "G" + groupID][column.raw.columnId] = column;
				this.fieldIdMapStructureNames[column.raw.columnId + "S" + idStructure] = "S" + idStructure + "G" + groupID;
			}
		} else {
			if (!this.structureNames["S" + idStructure]) {
				if (!this.raw.structureMapCache) {
					this.structureNames["S" + idStructure] = {};
					this.fromStructures["S" + idStructure] = "\"_SYS_BIC\".\"" + this.raw.structureCache[idStructure].hanaPackage + "/" + this.raw.structureCache[
						idStructure].hanaName + "\"";
						
					this.fromStructures["S" + idStructure + "G" + groupID] += this.viewPlaceholders;
				// 	if (inputParameters && inputParameters.length) {
				// 		this.fromStructures["S" + idStructure] += ' (\'PLACEHOLDER\' = (';
				// 		for (inputParam = 0; inputParam < inputParameters.length; inputParam++) {
				// 			this.fromStructures["S" + idStructure] += inputParam > 0 ? ',' : '';
				// 			this.fromStructures["S" + idStructure] += '\'$$' + inputParameters[inputParam].hanaName + '$$\',';
				// 			if (inputParameters[inputParam].hasOwnProperty("value") && inputParameters[inputParam].value) {
				// 				this.fromStructures["S" + idStructure] += '\'' + inputParameters[inputParam].value + '\'';
				// 			} else {
				// 				this.fromStructures["S" + idStructure] += '\'*\'';
				// 			}
				// 		}
				// 		this.fromStructures["S" + idStructure] += ')) ';
				// 	}
				} else {
					if (this.raw.structureMapCache[idStructure] && this.raw.structureMapCache[idStructure].tableName) {
						this.structureNames["S" + idStructure] = {};
						this.fromStructures["S" + idStructure] = this.raw.structureMapCache[idStructure].tableName;
					}
				}
			}
			if (this.structureNames["S" + idStructure]) {
				this.structureNames["S" + idStructure][column.raw.columnId] = column;
				this.fieldIdMapStructureNames[column.raw.columnId + "S" + idStructure] = "S" + idStructure;
			}

		}
	},
	getStructureFields: function(structureResult) {
		var fields = structureResult.fields.reduce(function(o, v) {
			o[v.ID] = v;
			o.hashTable[v.hanaName] = v.ID;
			return o;
		}, {
			hashTable: {}
		});
		return fields;
	},
	addSpecialField: function(column) {
		this.specialFields[column.raw.columnId] = column;
	},
	setFieldIds: function(fields, object) {
		for (var i in object) {
			if (object[i] && object[i].field) {
				if (i !== 'subPeriod') {
					for (var j in fields) {
						if (object[i].field === fields[j].hanaName) {
							object[i].fieldId = j;
							object[i].type = fields[j].type;
							object[i].hanaName = object[i].field;
							break;
						}
					}
				} else {
					object[i].fieldId = [];
					object[i].subPeriodType = object[i].type;
					object[i].type = [];
					object[i].hanaName = [];
					for (var k = 0; k < object[i].field.length; k++) {
						for (var j in fields) {
							if (object[i].field[k] === fields[j].hanaName) {
								object[i].fieldId.push(j);
								object[i].type.push(fields[j].type);
								object[i].hanaName.push(object[i].field[k]);
								break;
							}
						}
					}
				}
			}
		}
	},
	getBRBParameters: function(object) {
		var BRBParameters = [];
		var i, parameter;
		for (i in object) {
			if (object[i] && object[i].fieldId) {

				if (i !== "subPeriod") {
					parameter = {
						fieldId: object[i].fieldId,
						type: object[i].type,
						hanaName: object[i].hanaName,
						conditions: []
					};
					if (Array.isArray(object[i].value)) {
						for (var j = 0; j < object[i].value.length; j++) {
							if (j == 0) {
								parameter.conditions.push({
									logicOperator: null,
									operator: '=',
									value: object[i].value[j]
								});
							} else {
								parameter.conditions.push({
									logicOperator: "OR",
									operator: '=',
									value: object[i].value[j]
								});
							}

						}
					} else {
						parameter.conditions.push({
							logicOperator: null,
							operator: '=',
							value: object[i].value
						});
					}

					BRBParameters.push(parameter);
				} else {
					var date1;
					if (object[i].subPeriodType === 0) {
						parameter = {
							fieldId: object[i].fieldId[0],
							type: object[i].type[0],
							hanaName: object[i].hanaName[0],
							conditions: []
						};
						if (object[i].initSubPeriod) {
							date1 = utilDFG.toJSONDate(new Date(object[i].initSubPeriod));
							parameter.conditions.push({
								logicOperator: null,
								operator: '>=',
								value: "" + date1.year + date1.month + date1.day
							});
						}
						if (object[i].endSubPeriod) {
							date1 = utilDFG.toJSONDate(new Date(object[i].endSubPeriod));
							parameter.conditions.push({
								logicOperator: "AND",
								operator: '<=',
								value: "" + date1.year + date1.month + date1.day
							});
						}
						BRBParameters.push(parameter);
					} else {
						if (object[i].initSubPeriod) {
							parameter = {
								fieldId: object[i].fieldId[0],
								type: object[i].type[0],
								hanaName: object[i].hanaName[0],
								conditions: []
							};
							date1 = utilDFG.toJSONDate(new Date(object[i].initSubPeriod));
							parameter.conditions.push({
								logicOperator: null,
								operator: '>=',
								value: "" + date1.year + date1.month + date1.day
							});
							BRBParameters.push(parameter);
						}
						if (object[i].endSubPeriod) {
							parameter = {
								fieldId: object[i].fieldId[1],
								type: object[i].type[1],
								hanaName: object[i].hanaName[1],
								conditions: []
							};
							date1 = utilDFG.toJSONDate(new Date(object[i].endSubPeriod));
							parameter.conditions.push({
								logicOperator: null,
								operator: '<=',
								value: "" + date1.year + date1.month + date1.day
							});
							BRBParameters.push(parameter);
						}
					}
				}
			}
		}
		return BRBParameters;
	},
	getQueries: function() {
		var queries = [];
		if (this.record.groups) {
			this.analizeGroups();
		}
		var selectClause = "SELECT ";
		if (this.record.isDistinct) {
			selectClause += " DISTINCT ";
		}
		var mainClause = this.getSelectClause();
		selectClause += mainClause.clause;
		if (this.raw.eefi.getCount) {
			selectClause += ",COUNT(1) OVER()";
		}
		selectClause  += ","+this.getSelectClause(true).clause;
		
		var query;

		if (Object.keys(this.specialFields).length > 0 || Object.keys(this.fromStructures).length) {
			// for (var e = 0; e < this.raw.eefiConditions.eefiKeys.length; e++) {
			//     query = {
			//         query: selectClause + " FROM " + this.getFromClause(this.raw.eefiConditions.eefiKeys[e]) + this.getOrderByClause() + " LIMIT " + this.raw.eefi.limit + " OFFSET " + this.raw.eefi.offset
			//     };

			//     queries.push(query);
			// }//PARA MULTIPLAS EMPRESAS
			query = {
				query: selectClause + " FROM " + this.getFromClause(this.raw.eefiConditions.eefiKeys[0]) + this.getOrderByClause() + " LIMIT " + this.raw
					.eefi.limit + " OFFSET " + this.raw.eefi.offset
			}; //PARA OBTENER RESULTADO PARA UN SOLA EMPRESA

			queries.push(query);
			if (this.raw.eefiConditions.eefiKeys.length === 0 && Object.keys(this.fromStructures).length === 0) {
				query = {
					query: selectClause + " FROM " + this.getFromClause() + this.getOrderByClause() + " LIMIT " + this.raw.eefi.limit + " OFFSET " + this.raw
						.eefi.offset
				};
				queries.push(query);
			}
		}
		return {
			queries: queries,
			columnAmount: mainClause.columnAmount,
			groupTableCache: this.groupTableCache,
			dependentRecordsCache: this.dependentRecordsCache,
			listFieldsTable: this.raw.structureMapCache.listFieldsTable
		};
	},
	analizeGroups: function() {
		var cachedGroups = [];
		for (var s in this.record.groups.structures) {
			for (var g = 0; g < this.record.groups.structures[s].groups.length; g++) {
				var group = this.record.groups.structures[s].groups[g];
				var fieldsInDifferentTable = false;
				var groupByInDifferentTable = false;
				var lastTable = "";
				var groupTable = "";
				for (var gb = 0; gb < group.groupBy.length; gb++) {
					if (gb === 0) {
						lastTable = this.fieldIdMapStructureNames[group.groupBy[gb] + "S" + s];
						groupTable = lastTable;
					} else {
						if (this.fieldIdMapStructureNames[group.groupBy[gb] + "S" + s] !== lastTable) {
							fieldsInDifferentTable = true;
							groupByInDifferentTable = true;
							break;
						}
					}
				}
				if (!fieldsInDifferentTable) {
					//	lastTable = "";
					for (var t = 0; t < group.totals.length; t++) {
						if (groupTable && this.fieldIdMapStructureNames[group.totals[t] + "S" + s] !== groupTable) {
							groupByInDifferentTable = true;
						}
						if (lastTable === "" && t === 0) {
							lastTable = this.fieldIdMapStructureNames[group.totals[t] + "S" + s];
						} else {
							if (this.fieldIdMapStructureNames[group.totals[t] + "S" + s] !== lastTable) {
								fieldsInDifferentTable = true;
								break;
							}

						}
					}
				}

				if (fieldsInDifferentTable) {
					cachedGroups.push({
						idStructure: s,
						groupByInDifferentTable: groupByInDifferentTable,
						group: group
					});
				}
			}
		}
		if (cachedGroups.length) {
			this.createGroupCache(cachedGroups);
		}
	},
	createGroupCache: function(cachedGroups) {
		for (var c = 0; c < cachedGroups.length; c++) {
			var group = $.lodash.cloneDeep(cachedGroups[c].group);
			var groupByFilters = [];
			var fieldsXTable = {};
			var fields = {};
			var structureNames = [];
			var formulaFields = [];
			if (cachedGroups[c].groupByInDifferentTable) {
				for (var gb = 0; gb < group.groupBy.length; gb++) {
					if (this.newTablesXFilters[this.fieldIdMapStructureNames[group.groupBy[gb] + "S" + cachedGroups[c].idStructure]]) {
						groupByFilters.push(this.newTablesXFilters[this.fieldIdMapStructureNames[group.groupBy[gb] + "S" + cachedGroups[c].idStructure]]);
					}

				}

			}
			fieldsXTable = {};
			var allQuery = "SELECT ";
			var totalFields = {};
			var totalFieldsCount = {};
			var totalFields2 = {
				"GLOBAL_FIELDS": []
			};
			for (var g = 0; g < group.groupBy.length; g++) {
				var groupFieldId = group.groupBy[g];
				if (groupFieldId.match(new RegExp(/[0-9]+S[0-9]+C[0-9]+/g))) {
					groupFieldId = groupFieldId.split("S")[1].split("C")[0];
				}
				totalFields2.GLOBAL_FIELDS.push("\'\' AS \"C_" + groupFieldId + "\"");

			}
			totalFields2["GLOBAL_FIELDS"].push("'" + this.raw.eefiConditions.eefiKeys[
				0].split(";")[0] + "' AS " + this.raw.eefiConditions.mapConfigFields[cachedGroups[c].idStructure].company);
			var totalsQuery = "";
			var groupByClause = [];
			var first = true;
			var newTotals = [];
			for (var f = 0; f < group.totals.length; f++) {
				var fieldId = group.totals[f];
				var isFormula = false;
				if (fieldId.match(new RegExp(/[0-9]+S[0-9]+C[0-9]+/g))) {
					fieldId = fieldId.split("S")[1].split("C")[0];
				} else if (fieldId.match(new RegExp(/f[0-9]+/g))) {
					isFormula = true;
				}
				fields[group.totals[f]] = (this.raw.structureMapCache && this.raw.structureMapCache[cachedGroups[c].idStructure] && this.raw.structureMapCache[
						cachedGroups[c].idStructure]
					.type && this.raw.structureMapCache[cachedGroups[c].idStructure].type[group.totals[f]]) ? this.raw.structureMapCache[cachedGroups[c].idStructure]
					.type[group.totals[f]] : {
						type: "DECIMAL",
						dimension: 15,
						precision: 2
				};
				if (!fieldsXTable[this.fieldIdMapStructureNames[group.totals[f] + "S" + cachedGroups[c].idStructure]]) {
					fieldsXTable[this.fieldIdMapStructureNames[group.totals[f] + "S" + cachedGroups[c].idStructure]] = [];
					totalFields2[this.fieldIdMapStructureNames[group.totals[f] + "S" + cachedGroups[c].idStructure]] = [];
					fieldsXTable[this.fieldIdMapStructureNames[group.totals[f] + "S" + cachedGroups[c].idStructure]].push(this.raw.eefiConditions.mapConfigFields[
						cachedGroups[c].idStructure].company);
					totalFields2[this.fieldIdMapStructureNames[group.totals[f] + "S" + cachedGroups[c].idStructure]].push("'" + this.raw.eefiConditions.eefiKeys[
						0].split(";")[0] + "' AS " + this.raw.eefiConditions.mapConfigFields[cachedGroups[c].idStructure].company);
					for (var g = 0; g < group.groupBy.length; g++) {
						var groupFieldId = group.groupBy[g];
						if (groupFieldId.match(new RegExp(/[0-9]+S[0-9]+C[0-9]+/g))) {
							groupFieldId = groupFieldId.split("S")[1].split("C")[0];
						}
						fieldsXTable[this.fieldIdMapStructureNames[group.totals[f] + "S" + cachedGroups[c].idStructure]].push("\"C_" + groupFieldId + "\"");
						totalFields2[this.fieldIdMapStructureNames[group.totals[f] + "S" + cachedGroups[c].idStructure]].push("\'\' AS \"C_" + groupFieldId +
							"\"");

					}
				}
				if (!totalFieldsCount[fieldId]) {
					totalFieldsCount[fieldId] = 0;
				}
				if (!isFormula) {
					fieldsXTable[this.fieldIdMapStructureNames[group.totals[f] + "S" + cachedGroups[c].idStructure]].push("SUM(C_" + fieldId +
						") AS C_" + fieldId + "C" + totalFieldsCount[fieldId]);

					totalFields[group.totals[f]] = "CASE WHEN " + this.fieldIdMapStructureNames[group.totals[f] + "S" + cachedGroups[c].idStructure] +
						".C_" + fieldId + "C" + totalFieldsCount[fieldId] + " IS NULL THEN 0 ELSE " + this.fieldIdMapStructureNames[group.totals[f] + "S" +
							cachedGroups[c].idStructure] + ".C_" + fieldId + "C" + totalFieldsCount[fieldId] + " END AS " +
						"\"C_" + group.totals[f] + "\"";
				} else {
					var formula = this.record.columns[fieldId].formatFormula();
					fieldsXTable[this.fieldIdMapStructureNames[group.totals[f] + "S" + cachedGroups[c].idStructure]].push("SUM(" + formula + ") AS C_" +
						fieldId);
					totalFields[group.totals[f]] = "CASE WHEN " + this.fieldIdMapStructureNames[group.totals[f] + "S" +
						cachedGroups[c].idStructure] + ".C_" + fieldId + " IS NULL THEN 0 ELSE " + this.fieldIdMapStructureNames[group.totals[f] + "S" +
						cachedGroups[c].idStructure] + ".C_" + fieldId + " END AS " +
						"\"C_" + group.totals[f] + "\"";

				}
				totalFields2[this.fieldIdMapStructureNames[group.totals[f] + "S" + cachedGroups[c].idStructure]].push("NULL AS C_" + fieldId + "C" +
					totalFieldsCount[fieldId]);

				totalFieldsCount[fieldId]++;
			}
			for (var g = 0; g < group.groupBy.length; g++) {
				fields[group.groupBy[g]] = (this.raw.structureMapCache && this.raw.structureMapCache[cachedGroups[c].idStructure] && this.raw.structureMapCache[
						cachedGroups[c].idStructure]
					.type && this.raw.structureMapCache[cachedGroups[c].idStructure].type[group.groupBy[g]]) ? this.raw.structureMapCache[cachedGroups[c].idStructure]
					.type[group.groupBy[
						g]] : {
						type: "NVARCHAR",
						dimension: 50
				};
				var groupFieldId = group.groupBy[g];
				if (groupFieldId.match(new RegExp(/[0-9]+S[0-9]+C[0-9]+/g))) {
					groupFieldId = groupFieldId.split("S")[1].split("C")[0];
				}
				totalFields[group.groupBy[g]] = "GLOBAL_FIELDS.C_" +
					groupFieldId + " AS \"" +
					"C_" + group.groupBy[g] + "\"";
				groupByClause.push("C_" + groupFieldId);
			}
			var idCompany = this.raw.eefiConditions.mapConfigFields[cachedGroups[c].idStructure].company.split("C_")[1];
			if (group.groupBy.length) {
				totalFields[idCompany] = "GLOBAL_FIELDS." + this.raw.eefiConditions
					.mapConfigFields[
						cachedGroups[c].idStructure].company + " AS " + this.raw.eefiConditions.mapConfigFields[cachedGroups[c].idStructure].company;
				groupByClause.push(this.raw.eefiConditions.mapConfigFields[cachedGroups[c].idStructure].company);
				if (groupByClause.length) {
					fieldsXTable.GLOBAL_FIELDS = groupByClause;
				}
			} else {
				totalFields[idCompany] = this.fieldIdMapStructureNames[group.totals[0] + "S" + cachedGroups[c].idStructure] + '.' + this.raw.eefiConditions
					.mapConfigFields[cachedGroups[c].idStructure].company + " AS " + this.raw.eefiConditions.mapConfigFields[cachedGroups[c].idStructure].company;
			}
			fields[idCompany] = (this.raw.structureMapCache && this.raw.structureMapCache[cachedGroups[c].idStructure] && this.raw.structureMapCache[
					cachedGroups[c].idStructure].type &&
				this.raw.structureMapCache[cachedGroups[c].idStructure].type[idCompany]) ? this.raw.structureMapCache[cachedGroups[c].idStructure].type[
				idCompany] : {
				type: "NVARCHAR",
				dimension: 4
			};
			var selectFields = [];
			for (var tf in totalFields) {
				selectFields.push(totalFields[tf]);
			}
			allQuery += selectFields.join(",") + " FROM ";
			var firstTable = "";
			var fieldsXTablePositions = [];
			var tmpFrom = false;
			if (fieldsXTable.GLOBAL_FIELDS) {
				fieldsXTablePositions = ["GLOBAL_FIELDS"];
			}
			for (var f in fieldsXTable) {
				if (f !== "GLOBAL_FIELDS") {
					fieldsXTablePositions.push(f);
				}
			}
			for (var t = 0; t < fieldsXTablePositions.length; t++) {
				f = fieldsXTablePositions[t];
				if (!first) {
					allQuery += " LEFT OUTER JOIN ";
				}
				structureNames.push(f);
				if (f === "GLOBAL_FIELDS") {
					allQuery += " (SELECT " + fieldsXTable[f].join(",") + " FROM " + this.fromStructures["S" + cachedGroups[c].idStructure + "G" + c];
				} else {
					allQuery += " (SELECT " + fieldsXTable[f].join(",") + " FROM " + this.fromStructures[f];
				}

				if (this.newTablesXFilters[f]) {
					allQuery += " WHERE " + this.newTablesXFilters[f];
				}
				if (groupByFilters.length) {
					if (!this.newTablesXFilters[f]) {
						allQuery += " WHERE ";
					} else {
						allQuery += " AND ";
					}
					allQuery += groupByFilters.join(" AND ");
				}
				if (groupByClause.length) {
					allQuery += " GROUP BY " + groupByClause.join(",");
				}else {
				    allQuery += " GROUP BY " + "C_"+idCompany;
				}
				if (f === "GLOBAL_FIELDS") {
					allQuery += " UNION ALL SELECT " + totalFields2[f].join(",") + " FROM DUMMY WHERE NOT EXISTS (SELECT 1 FROM " + this.fromStructures[(
						"S" + cachedGroups[c].idStructure + "G" + c)];
				} else {
					allQuery += " UNION ALL SELECT " + totalFields2[f].join(",") + " FROM DUMMY WHERE NOT EXISTS (SELECT 1 FROM " + this.fromStructures[f];
				}
				if (this.newTablesXFilters[f]) {
					allQuery += " WHERE " + this.newTablesXFilters[f];
				}
				if (groupByFilters.length) {
					if (!this.newTablesXFilters[f]) {
						allQuery += " WHERE ";
					} else {
						allQuery += " AND ";
					}
					allQuery += groupByFilters.join(" AND ");
				}
				allQuery += " )) AS " + f;
				tmpFrom = tmpFrom && tmpFrom.indexOf && tmpFrom.indexOf('undefined') !== -1 ? tmpFrom : (this.fromStructures['S' + cachedGroups[c].idStructure + 'G' + c] || this.fromStructures[f]);
				if (first) {
					firstTable = f;
					first = false;
				} else {

					var onClause = [];
					if(groupByClause.length === 0){
					    groupByClause.push("C_"+idCompany);
					}
					for (var gc = 0; gc < groupByClause.length; gc++) {
						onClause.push(firstTable + "." + groupByClause[gc] + " = " + f + "." + groupByClause[gc]);
					}
					//onClause.push(firstTable+"."+groupByClause[groupByClause.length-1] +" = " +  f+"."+groupByClause[groupByClause.length-1]);
					if (onClause.length) {
						allQuery += " ON " + onClause.join(" AND ");
					}
				}
			}
			tmpFrom = tmpFrom || this.fromStructures['S' + cachedGroups[c].idStructure];
			if ([undefined, 'undefined'].indexOf(tmpFrom) !== -1) {
                $.lodash.forEach(this.fromStructures, function(table) {
                    tmpFrom = [undefined, 'undefined'].indexOf(tmpFrom) !== -1 ? table : tmpFrom;
                });
			}
			allQuery = allQuery.replace(/undefined/g, tmpFrom);
			var groupData = sql.SELECT({
				query: allQuery
			});
			var result = this.createGroupCacheTable(fields, groupData, group.ID, cachedGroups[c].idStructure);
			for (var field in fields) {
				this.fieldIdMapStructureNames[field + "S" + cachedGroups[c].idStructure] = "S" + cachedGroups[c].idStructure + "G" + group.ID;
			}
			formulaFields.map(function(field) {
				this.fieldIdMapStructureNames[field + "S" + cachedGroups[c].idStructure] = "S" + cachedGroups[c].idStructure + "G" + group.ID;
			}, this);
			for (var s = 0; s < structureNames.length; s++) {
				if (structureNames[s] !== "GLOBAL_FIELDS") {
					if (structureNames[s] !== "S" + cachedGroups[c].idStructure + "G" + group.ID) {
						for (var id in this.structureNames[structureNames[s]]) {
							if (fields[id]) {
								if (!this.structureNames["S" + cachedGroups[c].idStructure + "G" + group.ID]) {
									this.structureNames["S" + cachedGroups[c].idStructure + "G" + group.ID] = {};
								}
								this.structureNames["S" + cachedGroups[c].idStructure + "G" + group.ID][id] = this.record.columns[id];
								delete this.structureNames[structureNames[s]][id];
							}
						}
						if (Object.keys(this.structureNames[structureNames[s]]).length === 0) {
							delete this.structureNames[structureNames[s]];
							delete this.fromStructures[structureNames[s]];
						}
					}
				}
			}
			this.fromStructures["S" + cachedGroups[c].idStructure + "G" + group.ID] = result.tableName;
			this.groupTableCache.push(result.tableName);
			// sql.EXECUTE({
			//     query: "DROP TABLE "+result.tableName
			// });
			// sql.EXECUTE({
			//     query: "DROP SEQUENCE "+result.sequenceName
			// });
			return group;
		}
	},
	createGroupCacheTable: function(fields, data, idGroup, idStructure) {
		var executionTime = new Date();
		var execString = "" + executionTime.getFullYear();
		if (executionTime.getMonth() + 1 < 10) {
			execString += "0" + (executionTime.getMonth() + 1);
		} else {
			execString += (executionTime.getMonth() + 1);
		}
		if (executionTime.getDate() < 10) {
			execString += "0" + executionTime.getDate();
		} else {
			execString += executionTime.getDate();
		}
		var tableName = schema + '."DFG::Cache_' + $.getUserID() + idGroup + idStructure + executionTime.getTime() + "_" +
			execString + '"'; //Unique name for table;
		var sequenceName = schema + '."DFG::Cache_' + $.getUserID() + idGroup + idStructure + executionTime.getTime() + "_" +
			execString + '::ID"';
		var options = {
			name: tableName,
			fields: {
				id: new tableLib.AutoField({
					name: 'ID',
					auto: sequenceName + '.nextval',
					type: $.db.types.INTEGER,
					pk: true
				})
			}
		};
		var orderedFields = [];
		for (var f in fields) {
			if (fields.hasOwnProperty(f)) {
				options.fields[f] = new tableLib.Field({
					name: "C_" + f,
					type: $.db.types[fields[f].type],
					dimension: fields[f].dimension,
					precision: fields[f].precision
				});
				orderedFields.push(options.fields[f]);
			}
		}
		orderedFields.push(options.fields["id"]);
		var table = new tableLib.Table(options);
		var create = table.CREATE_STATEMENT();
		var table_fields_array = Object.keys(table.fields);
		sql.EXECUTE({
			query: create
		});
		sql.EXECUTE({
			query: "CREATE SEQUENCE " + sequenceName
		});
		if ((data && data.length > 0) && table) {
			for (var i = 0; i < data.length; i++) {
				if (data[i].concat) {
					data[i] = data[i].concat([i + 1]);
				}
				for (var column = 0; column < data[i].length; column++) {
					if (Array.isArray(data[i][column])) {
						data[i][column] = JSON.stringify(data[i][column]);
					}
					if (orderedFields[column].type === $.db.types.INTEGER) {
						data[i][column] = parseInt(data[i][column], 10);
					}
					if (orderedFields[column].type === $.db.types.DECIMAL) {
						data[i][column] = parseFloat(data[i][column]);
					}
				}

			}

			sql.BATCH_INSERT({
				table: table.name,
				fields: orderedFields,
				// values: [[data[i]]]
				values: data
			});

		}
		return {
			tableName: tableName,
			sequenceName: sequenceName
		};
	},
	getSelectClause: function(withoutFormat) {
		var selectClause = "";
		var columnValues = [];
		for (var p = 0; p < this.record.positions.length; p++) {
            if (this.record.columns[this.record.positions[p]]) {
                let columnValue = this.record.columns[this.record.positions[p]].getColumnSql(withoutFormat);
				columnValues.push(columnValue);
				if (this.record.columns[this.record.positions[p]].hasListRecord) {
                    this.hasListRecord = true;
				}
			}
		}
		if (this.record.relationsInfo) {
			for (var i = 0; i < this.record.relationsInfo.fields.length; i++) {
				var fieldKey = this.record.relationsInfo.fields[i];
				var idStructure = fieldKey.split("S")[0];
				var idField = fieldKey;
				var found = false;
				for (var name in this.structureNames) {
					if (name.indexOf("G") !== -1) {
						if (name.split("G")[0] === "S" + idStructure && this.structureNames[name][idField]) {
							if (this.raw.structureMapCache) {
								columnValues.push(name + ".C_" + idField + " AS R" + i);
							} else {
								columnValues.push(name + "." + this.raw.structureCache[idStructure].fields[idField].hanaName + " AS R" + i);
							}
							found = true;
							break;
						}
					} else if (name === "S" + idStructure && this.structureNames[name][idField]) {
						if (this.raw.structureMapCache) {
							columnValues.push(name + ".C_" + idField + " AS R" + i);
						} else {
							columnValues.push(name + "." + this.raw.structureCache[idStructure].fields[idField].hanaName + " AS R" + i);
						}
						found = true;
						break;
					}
				}
				if (!found) {
					columnValues.push("'' AS R" + i);
				}
			}
		}
		selectClause = columnValues.join(",");
		return {
		    clause: selectClause,
		    columnAmount: columnValues.length
		};
	},
	getFromClause: function(eefiKey) {
		var fromClause = "";
		var idStructure;
		var firstStructure = {};
		var getTotalAmount = function(date1, date2, type) {
			var diff = Math.floor(date1.getTime() - date2.getTime());
			var day = 1000 * 60 * 60 * 24;
			if (type === "DAY") {
				return Math.floor(diff / day);
			}
			if (type === "MONTH") {
				return Math.floor((diff / day) / 31);
			}
			if (type === "YEAR") {
				return Math.floor(((diff / day) / 31) / 12);
			}
			return 0;
		};
		if (Object.keys(this.fromStructures).length === 0) {
			return "DUMMY";
		} else {
			if (Object.keys(this.specialFields).length !== 0) {
				fromClause = " DUMMY ";
			}
			var addedStructures = [];
			var addedFromStructures = [];
			let actualStructureIndex = -1;
			for (var f in this.fromStructures) {
                actualStructureIndex++;
				if (f.match(/^S[0-9]+(G[0-9]+)$/g)) {
					idStructure = f.split("G")[0].split("S")[1];
				} else {
					idStructure = f.split("S")[1];
				}
				var isBlockRecordCache = f.match(/^B[0-9]+R[0-9]+$/g) !== null;
				addedStructures.push(idStructure + '');
				addedFromStructures.push(f);
				var structureRelations = [];
				if (this.record.structureRelation && this.record.structureRelation.length) {

					for (var relation = 0; relation < this.record.structureRelation.length; relation++) {
						if (this.record.structureRelation[relation].structureId1 + '' === idStructure + '' || this.record.structureRelation[relation].structureId2 +
							'' === idStructure + '') {
							structureRelations.push(this.record.structureRelation[relation]);
						}
					}
				}
				var requiredFields = [];
				var mapConfigFields = [];
				var mapConfigFieldsAdded = [];
				// for (var a in this.raw.eefiConditions.mapConfigFields[idStructure]) {
				//     mapConfigFields.push(this.raw.eefiConditions.mapConfigFields[idStructure][a]);
				// }
				if (isBlockRecordCache || !this.raw.eefiConditions.mapConfigFields[idStructure].company) {
					mapConfigFields.push("\"C_Company\"");
				} else {
					mapConfigFields.push(this.raw.eefiConditions.mapConfigFields[idStructure].company);
				}

				var groupByFields = [];
				var havingFields = [];
				var group;
				var hasTotals = false;
				var groupByDate;

				for (var fieldId in this.fieldIdMapStructureNames) {
					var originalName = fieldId.split("S")[0];
					var columnId = fieldId.split("S")[0];
					if (fieldId.match(new RegExp(/[0-9]+S[0-9]+C[0-9]+S[0-9]/g))) {
						columnId = fieldId.split("S")[1].split("C")[0];
						originalName = fieldId.split("S")[0] + "S" + fieldId.split("S")[1];
					}
					if (this.fieldIdMapStructureNames[fieldId] === f) {
						var isTotal = this.isTotal(idStructure, originalName);
						if (!group) {
							group = this.getGroup(idStructure, originalName);
							if (group && group.groupByDate) {
								groupByDate = group.groupByDate;
							}
						}

						var fieldName = "";
						if(isBlockRecordCache){
						    fieldId = fieldId.split("-")[2];
						    fieldName = "\"C_"+fieldId + "\"";
						}else{
						    fieldName = !this.raw.structureMapCache ? this.raw.structureCache[idStructure].fields[columnId].hanaName : (isNaN(
								Number(columnId)) ? this.raw.structureMapCache[idStructure].mapConfigFields[columnId].hanaName : "C_" +
							columnId);
						}
						var fieldGroupByDateName = fieldName;
						var fieldName2;
						if (isTotal) {
							hasTotals = true;
							var isGroupTable = false;
							if (this.groupTableCache) {
								for (var gt = 0; gt < this.groupTableCache.length; gt++) {
									if (this.groupTableCache[gt] === this.fromStructures[f]) {
										isGroupTable = true;
									}
								}
							}
							var totalFieldName = fieldName;
							if (isGroupTable) {
								totalFieldName = "C_" + originalName;
							}
							if (this.record.columns[originalName] && this.record.columns[originalName].raw.hidingRule && this.record.columns[originalName].raw.hidingRule
								.hide) {
								if (this.record.columns[originalName].raw.formula) {
									havingFields.push("SUM(" + (totalFieldName.indexOf(" AS ") > -1 ? totalFieldName.split(" AS ")[0] : totalFieldName) + ") != 0");
								} else {
									havingFields.push("SUM(\"" + (totalFieldName.indexOf(" AS ") > -1 ? totalFieldName.split(" AS ")[0] : totalFieldName) + "\") != 0");
								}
							}
							if (totalFieldName.indexOf(" AS ") > -1) {
								fieldName2 = totalFieldName.split(" AS ")[0];
								if (this.record.columns[originalName].raw.formula) {
									fieldName = "SUM(" + totalFieldName.split(" AS ")[0] + ") AS \"" + originalName + "\"";
								} else {
									fieldName = "SUM(\"" + totalFieldName.split(" AS ")[0] + "\") AS \"" + (!this.raw.structureMapCache ? this.raw.structureCache[
											idStructure].fields[
											columnId].hanaName.split(" AS ")[1] : this.raw.structureMapCache[idStructure].mapConfigFields[columnId]
										.hanaName.split(" AS ")[1]) + "\"";
								}
							} else {
								fieldName2 = fieldName;
								if (this.record.columns[originalName].raw.formula) {
									fieldName = "SUM(\"" + totalFieldName + "\") AS \"" + originalName + "\"";
								} else {
									fieldName = "SUM(\"" + totalFieldName + "\") AS \"" + (!this.raw.structureMapCache ? this.raw.structureCache[idStructure].fields[
										columnId].hanaName : "C_" + originalName) + "\"";
								}
							}
							if (groupByDate) {
								var date2 = new Date(this.raw.eefi.initSubPeriod);
								var date1 = new Date(this.raw.eefi.endSubPeriod);
								var amountTotals = getTotalAmount(date1, date2, groupByDate.groupBy);
								var init = 0;
								switch (groupByDate.groupBy) {
									case "DAY":
										init = date2.getDate();
										break;
									case "MONTH":
										init = date2.getMonth() + 1;
										break;
									case "YEAR":
										init = date2.getFullYear();
										break;
								}
								var allCases = [];
								for (init; init <= amountTotals + 1; init++) {
									var caseQ = "SUM (CASE " + groupByDate.groupBy + "(to_date(" + (!this.raw.structureMapCache ? this.raw.structureCache[idStructure]
										.fields[groupByDate.fieldId].hanaName : "C_" + groupByDate.fieldId) + ")) WHEN " + init + " THEN " + fieldName2 + " ELSE 0 END)";
									if (this.record.columns[fieldId.split("S")[0]].raw.format && this.record.columns[fieldId.split("S")[0]].raw.format["number"] &&
										this.record.columns[fieldId.split("S")[0]].raw.format["number"] !== null) {
										caseQ = this.record.columns[columnId].formatFunctions["number"](caseQ, this.record.columns[columnId].raw
											.format["number"], this.record.columns[columnId].raw.hidingRule);
									}
									allCases.push(caseQ);

								}
								fieldName = allCases.join(" ||'" + this.raw.separator.value + String.fromCharCode(8205) + "'||") + " AS " + originalName;
							}

						}
						if (this.isGroupBy(idStructure, originalName)) {
							var isGroupTable = false;
							if (this.groupTableCache) {
								for (var gt = 0; gt < this.groupTableCache.length; gt++) {
									if (this.groupTableCache[gt] === this.fromStructures[f]) {
										isGroupTable = true;
									}
								}
							}
							var groupByFieldName = fieldName;
							if (isGroupTable) {
								groupByFieldName = "C_" + originalName;
							}
							groupByFields.push("\"" + (!this.raw.structureMapCache ? this.raw.structureCache[idStructure].fields[columnId].hanaName :
								groupByFieldName) + "\"");
							fieldName = groupByFieldName;

						}

						if (mapConfigFields.indexOf(fieldName) !== -1) {
							mapConfigFieldsAdded.push(fieldName);
						}
						if (fieldName.indexOf(" AS ") === -1 && !isBlockRecordCache) {
							fieldName += " AS \"C_" + originalName + "\"";
						}else if(fieldName.indexOf(" AS ") === -1){
						    fieldName += " AS "+fieldName ;
						}
						requiredFields.push(fieldName);

					}
				}
				if (groupByFields && groupByFields.length && requiredFields.length) {
					if (groupByFields.length) {

						requiredFields.push("COUNT(NULLIF(" + groupByFields[0] + ',\'1\'' + ")) AS GROUP_COUNT");
					} else {
						requiredFields.push("0 AS GROUP_COUNT");
					}
				}
				var innerFrom = "";
				var fromS = "";
				if (this.raw.structureMapCache.listFieldsTable && this.raw.structureMapCache.listFieldsTable.tableName && this.raw.structureMapCache.listFieldsTable
					.relatedFields) {
					if (this.raw.structureMapCache.listFieldsTable.relatedFields[idStructure]) {
						for (var fr in this.raw.structureMapCache.listFieldsTable.relatedFields[idStructure].fields) {
							if (requiredFields.indexOf("C_" + fr) === -1) {
								requiredFields.push("C_" + fr);
							}

						}
					}
				}
				var otherFields = [];
				for (var added = 0; added < mapConfigFields.length; added++) {
					if (mapConfigFieldsAdded.indexOf(mapConfigFields[added]) === -1) {
						otherFields.push(mapConfigFields[added]);
					} else {
						if (requiredFields.indexOf(mapConfigFields[added] + " AS \"" + mapConfigFields[added] + "\"") === -1) {
							requiredFields.push(mapConfigFields[added] + " AS \"" + mapConfigFields[added] + "\"");
						}

					}
				}
				for (var sr = 0; sr < structureRelations.length; sr++) {
					for (var fieldsR in structureRelations[sr].fields) {
						if (structureRelations[sr].structureId1 + '' === idStructure + '') {
							if (requiredFields.indexOf("C_" + structureRelations[sr].fields[fieldsR].field1.id + " AS \"C_" + structureRelations[sr].fields[
								fieldsR].field1.id + "\"") === -1 && requiredFields.indexOf("C_" + structureRelations[sr].fields[fieldsR].field1.id) === -1) {
								if (otherFields.indexOf("C_" + structureRelations[sr].fields[fieldsR].field1.id + " AS \"C_" + structureRelations[sr].fields[
									fieldsR].field1.id + "\"") === -1 && otherFields.indexOf("C_" + structureRelations[sr].fields[fieldsR].field1.id) === -1) {
									requiredFields.push("C_" + structureRelations[sr].fields[fieldsR].field1.id + " AS \"C_" + structureRelations[sr].fields[fieldsR].field1
										.id + "\"");
								}
							}
						} else if (structureRelations[sr].structureId2 + '' === idStructure + '') {
							if (requiredFields.indexOf("C_" + structureRelations[sr].fields[fieldsR].field2.id + " AS \"C_" + structureRelations[sr].fields[
								fieldsR].field2.id + "\"") === -1 && requiredFields.indexOf("C_" + structureRelations[sr].fields[fieldsR].field2.id) === -1) {
								if (otherFields.indexOf("C_" + structureRelations[sr].fields[fieldsR].field2.id + " AS \"C_" + structureRelations[sr].fields[
									fieldsR].field2.id + "\"") === -1 && otherFields.indexOf("C_" + structureRelations[sr].fields[fieldsR].field2.id) === -1) {
									requiredFields.push("C_" + structureRelations[sr].fields[fieldsR].field2.id + " AS \"C_" + structureRelations[sr].fields[fieldsR].field2
										.id + "\"");
								}
							}
						}
					}

				}
				fromS += "( SELECT " + (this.record.isDistinct ? " DISTINCT " : "") + requiredFields.join(",");

				if (requiredFields.length && otherFields.length) {
					fromS += ",";
				}
				fromS += otherFields.join(",");
				innerFrom = " FROM " + this.fromStructures[f];
				if (this.raw.eefiConditions.where[idStructure + "S" + eefiKey] && this.raw.eefiConditions.where[idStructure + "S" + eefiKey][0]) {
					/*ANTES SE PONIAN FILTROS DE FILIAL Y UF*/
					//var filters = this.raw.eefiConditions.where[idStructure + "S" + eefiKey];
					//innerFrom += " WHERE " + filters.join(" AND ");
					/*AHORA SOLO SE PONEN FILTRO DE EMPRESA(SI LLEGA UNA FEATURE DE MULTIPLAS EMPRESAS ES UTIL)*/
					var filters = this.raw.eefiConditions.where[idStructure + "S" + eefiKey][0];
					innerFrom += " WHERE " + filters;
				}
				var t;

				if (!isBlockRecordCache && this.groupTableCache.indexOf(this.fromStructures[f]) === -1 && ((this.record.filters && this.record.filters[idStructure]) || (group && group.filters && group.filters[idStructure]) || this.newTablesXFilters[
					f])) {
					var filterGroups = this.record.filters && this.record.filters[idStructure] ? this.record.filters : undefined;
					if (group && group.filters && group.filters[idStructure]) {
						filterGroups = this.mergeFilters(filterGroups, group.filters);
					}
					if (filterGroups) {
						t = this.processFilters(filterGroups, idStructure);
						if (innerFrom.indexOf("WHERE") === -1) {
							innerFrom += " WHERE " + t;
						} else {
							innerFrom += " AND " + t;
						}
					}
					if (this.newTablesXFilters[f]) {
						if (innerFrom.indexOf("WHERE") === -1) {
							innerFrom += " WHERE " + this.newTablesXFilters[f];
						} else {
							innerFrom += " AND " + this.newTablesXFilters[f];
						}
					}
				}
				fromS += innerFrom;
				if (groupByFields.length) {
					fromS += " GROUP BY " + groupByFields.join(",") + "," + mapConfigFields.join(",");
				} else {
					if (hasTotals) {
						fromS += " GROUP BY " + mapConfigFields.join(",");
					}

				}
				if (havingFields.length) {
					fromS += " HAVING " + havingFields.join(" OR ");
				}
				fromS += " UNION ALL SELECT ";
				var innerQuerySelect = [];
				for (var r = 0; r < requiredFields.length; r++) {
					if (requiredFields[r].indexOf(" AS ") > -1) {
						if (mapConfigFields.indexOf(requiredFields[r].split(" AS ")[0]) === -1) {
							innerQuerySelect.push(" NULL AS " + requiredFields[r].substring(requiredFields[r].indexOf(" AS ") + 4));
						} else if ("\"" + requiredFields[r].split(" AS ")[0] + "\"" !== requiredFields[r].split(" AS ")[1]) {
							innerQuerySelect.push(" NULL AS " + requiredFields[r].substring(requiredFields[r].indexOf(" AS ") + 4));
						}
					} else {
						if (mapConfigFields.indexOf(requiredFields[r]) === -1) {
							innerQuerySelect.push(" NULL AS " + requiredFields[r]);
						} else {
							innerQuerySelect.push(" NULL AS " + requiredFields[r] + r);
						}
					}
				}
				for (var mf = 0; mf < mapConfigFields.length; mf++) {
					innerQuerySelect.push("\'" + eefiKey.split(";")[mf] + "\' AS " + mapConfigFields[mf]);
				}
				
				fromS += innerQuerySelect.join(",") + " FROM DUMMY WHERE NOT EXISTS ( SELECT 1 " + innerFrom + " )";
				fromS += ") AS " + f;
                let structureIndex = 0;
                if (this.record.dependentFieldsValues && this.record.groupers && (actualStructureIndex !== Object.keys(this.fromStructures).length - 1)) {
                    structureIndex = actualStructureIndex;
                }
				if (Object.keys(this.fromStructures)[structureIndex] === f) {
					if (Object.keys(this.specialFields).length !== 0) {
						fromClause += " LEFT OUTER JOIN ";
					}
					fromClause += fromS;
					if (Object.keys(this.specialFields).length !== 0) {
						fromClause += " ON 1=1 ";
					}
                    if (actualStructureIndex === 0) {
                        firstStructure.name = f;
                        firstStructure.id = idStructure;
                        firstStructure.isBlockRecordCache = isBlockRecordCache;
                    }
				} else {
                    if (this.record.dependentFieldsValues && this.record.groupers) {
                        fromClause += " RIGHT OUTER JOIN " + fromS + " ON ";
                    } else {
                        fromClause += " INNER JOIN " + fromS + " ON ";
                    }

					var companyField2 = "";
					if (isBlockRecordCache || !this.raw.eefiConditions.mapConfigFields[idStructure].company) {
						companyField2 = "\"C_Company\"";
					} else {
						companyField2 = this.raw.eefiConditions.mapConfigFields[idStructure].company;
					}
					var companyField1 = "";
					if (firstStructure.isBlockRecordCache || !this.raw.eefiConditions.mapConfigFields[firstStructure.id].company) {
						companyField1 = "\"C_Company\"";
					} else {
						companyField1 = this.raw.eefiConditions.mapConfigFields[firstStructure.id].company;
					}
					fromClause += firstStructure.name + "." + companyField1 + " = " + f + "." + companyField2;
                    if (this.record.dependentFieldsValues && this.record.groupers) {
                        let _self = this;
                        let onStatementsGroupers = [];
                        $.lodash.forEach(this.record.groupers, function(grouperContent, grouperId) {
                            if (!$.lodash.isEmpty(grouperContent) && _self.record.groupersRecords[grouperId]) {
                                let groupGrouper = grouperId.split('_');
                                let recordGrouper = groupGrouper[1];
                                groupGrouper = groupGrouper[0];
                                $.lodash.forEach(grouperContent, function(gropr) {
                                    onStatementsGroupers.push('B' + groupGrouper + 'R' + recordGrouper + '."C_' + gropr + '" = ' + f + '."C_' + gropr + '"');
                                });
                            }
                        });
                        if (onStatementsGroupers.length) {
                            fromClause += ' AND ' + onStatementsGroupers.join(' AND ');
                        }
                    }
					if (structureRelations.length !== 0) {
						var onStatements = [];
						for (var sr = 0; sr < structureRelations.length; sr++) {
							var add = false;
							var fromStructureName = '';
							var isFirstStruct = true;
							if (structureRelations[sr].structureId1 + '' === idStructure + '') {
								if (addedStructures.indexOf(structureRelations[sr].structureId2 + '') !== -1) {
									add = true;
									fromStructureName = addedFromStructures[addedStructures.indexOf(structureRelations[sr].structureId2 + '')];

								}
							} else if (addedStructures.indexOf(structureRelations[sr].structureId1 + '') !== -1) {
								add = true;
								fromStructureName = addedFromStructures[addedStructures.indexOf(structureRelations[sr].structureId1 + '')];
								isFirstStruct = false;
							}
							if (add) {
								for (var fieldsr in structureRelations[sr].fields) {
									if (isFirstStruct) {
										onStatements.push(f + ".C_" + structureRelations[sr].fields[fieldsr].field1.id + " = " + fromStructureName + ".C_" +
											structureRelations[sr].fields[fieldsr].field2.id);
									} else {
										onStatements.push(f + ".C_" + structureRelations[sr].fields[fieldsr].field2.id + " = " + fromStructureName + ".C_" +
											structureRelations[sr].fields[fieldsr].field1.id);
									}
								}
							}
						}
						if (onStatements.length) {
							fromClause += " AND " + onStatements.join(" AND ");
						}
					}
					/*YA NO SE OBTIENEN RESULTADOS POR FILIAL Y UF*/
					// fromClause += " AND " + firstStructure.name + "." + this.raw.eefiConditions.mapConfigFields[firstStructure.id].uf + " = " + f + "." + this.raw.eefiConditions.mapConfigFields[idStructure].uf;
					// fromClause += " AND " + firstStructure.name + "." + this.raw.eefiConditions.mapConfigFields[firstStructure.id].filial + " = " + f + "." + this.raw.eefiConditions.mapConfigFields[idStructure].filial;
				}

			}
			if (this.raw.structureMapCache.listFieldsTable && this.raw.structureMapCache.listFieldsTable.tableName) {
				var companyField1 = "";
				if (!this.raw.eefiConditions.mapConfigFields[firstStructure.id].company) {
					companyField1 = "\"C_Company\"";
				} else {
					companyField1 = this.raw.eefiConditions.mapConfigFields[firstStructure.id].company;
				}
				var fieldsR = [];
				for (var f = 0; f < this.raw.structureMapCache.listFieldsTable.fields.length; f++) {
					if (this.raw.structureMapCache.listFieldsTable.fields[f] !== "id") {
						fieldsR.push("\"C_" + this.raw.structureMapCache.listFieldsTable.fields[f] + "\"");
					}
				}
				fromClause += " INNER JOIN (SELECT " + (this.record.isDistinct ? " DISTINCT " : "") + fieldsR.toString() + " FROM " + this.raw.structureMapCache
					.listFieldsTable.tableName + ") AS LFT ON " + firstStructure.name + "." + companyField1 + "= LFT.\"C_Company\"";
				var relationFields = [];
				if (this.raw.structureMapCache.listFieldsTable.relatedFields) {
					for (var s in this.raw.structureMapCache.listFieldsTable.relatedFields) {
						if (this.fromStructures["S" + s]) {
							for (var f in this.raw.structureMapCache.listFieldsTable.relatedFields[s].fields) {
								relationFields.push("S" + s + ".C_" + f + "=" + "LFT.C_" + f);
							}
						}
					}
					if (relationFields.length) {
						fromClause += " AND " + relationFields.join(" AND ");
					}
				}
			}
			//  fromClause += " FULL OUTER JOIN " + fromS + " ON 1=1";
		}
		return fromClause;
	},
	getOrderByClause: function() {
		if (this.record.orderBy) {
			var orderFields = [];
			for (var o = 0; o < this.record.orderBy.columns.length; o++) {
				if (isNaN(parseInt(this.record.orderBy.columns[o], 10))) {
					orderFields.push("C_" + this.record.orderBy.columns[o]);
				} else {
					var idStructure = this.record.columns[this.record.orderBy.columns[o]].raw.idStructure;
					var tableName = this.fieldIdMapStructureNames[this.record.orderBy.columns[o] + "S" + idStructure];
					if (tableName) {
						if (this.raw.structureMapCache[idStructure]) {
							orderFields.push(tableName + ".C_" + this.record.orderBy.columns[o]);
						} else {
							orderFields.push(tableName + "." + this.raw.structureCache[idStructure].fields[this.record.orderBy.columns[o]].hanaName);
						}
					}
				}
			}
			return orderFields.length ? " ORDER BY " + orderFields.join(",") + " " + this.record.orderBy.order : "";
		}
		return "";
	},
	mergeFilters: function(globalFilters, mainFilters) {
		if (!globalFilters) {
			return mainFilters;
		}
		if (!mainFilters) {
			return globalFilters;
		}
		var newFilters = JSON.parse(JSON.stringify(mainFilters));

		for (var i in globalFilters) {
			if (globalFilters.hasOwnProperty(i)) {
				if (!newFilters[i]) {
					newFilters[i] = globalFilters[i];
				} else {

					for (var j = 0; j < globalFilters[i].length; j++) {
						var filter = JSON.parse(JSON.stringify(globalFilters[i][j]));
						for (var k = 0; k < globalFilters[i][j].group.length; k++) {
							var found = false;
							for (var m = 0; m < mainFilters[i].length; m++) {
								for (var l = 0; l < mainFilters[i][m].group.length; l++) {
									if (mainFilters[i][m].group[l].fieldId === globalFilters[i][j].group[k].fieldId) {
										found = true;
										break;
									}
								}
								if (found) {
									break;
								}
							}
							if (found) {
								filter.group[k] = undefined;
							}

						}
						filter.group = filter.group.filter(function(g) {
							if (g) {
								return true;
							}
							return false;
						});
						if (filter.group.length > 0) {
							newFilters[i].push(filter);
						}
					}
				}
			}
		}
		return newFilters;

	},
	processFilters: function(structureGroup, idStructure) {
		return this.processStructureFilters(structureGroup[idStructure], idStructure);
	},
	processStructureFilters: function(structureGroup, idStructure) {
		let structureResult = [];
		for (let k = 0; k < structureGroup.length; k++) {
			let group = structureGroup[k].group;
			let groupResult = this.processGroupFilter(group, idStructure);
			if (groupResult !== "") {
				structureResult.push(" ( " + groupResult + ") ");
			}

		}
		return structureResult.join(" AND ");
	},
	processGroupFilter: function(group, structureId) {
		let groupResult = [];
		if (group) {
			for (let i = 0; i < group.length; i++) {
				let structureField;
				if (this.raw.structureMapCache || this.raw.structureCache[structureId]) {
					structureField = this.raw.structureMapCache ? undefined : this.raw.structureCache[structureId].fields[group[i].fieldId];
					let fieldName = this.raw.structureMapCache ? "C_" + group[i].fieldId : structureField.hanaName;
					let fieldType = this.raw.structureMapCache[structureId].type[group[i].fieldId] ? this.raw.structureMapCache[structureId].type[group[i]
						.fieldId].type : "NVARCHAR";
					let conditions = group[i].conditions;
					let conditionResult = this.processCondition(conditions, fieldName, fieldType);
					if (conditionResult !== "") {
						groupResult.push(conditionResult);
					}

				}
			}
		}
		return groupResult.join(" AND ");
	},
	processCondition: function(conditions, fieldName, fieldType) {
		let conditionResult = "";
		for (let j = 0; j < conditions.length; j++) {
			let value = this.getValue(conditions[j].value, conditions[j].operator, fieldName);
			let operator = this.getOperator(conditions[j].operator);
			if (conditions[j].logicOperator) {
				conditionResult += " " + conditions[j].logicOperator + " ";
			}
			if (conditions[j].operator === "IN" || conditions[j].operator === "NOT IN") {
				conditionResult += " " + operator + " " + value;
			} else {
				conditionResult += fieldName + " " + operator + " " + value;
				if (value === "" || value === "''") {
					if (operator === "=") {
						conditionResult += " OR " + fieldName + " IS NULL";
					} else if (operator === "!=") {
						conditionResult += " AND " + fieldName + " IS NOT NULL";
					}
					if (fieldType === "TIMESTAMP") {
						if (operator === "=") {
							conditionResult += " OR " + fieldName + " = '00000000'";
						} else if (operator === "!=") {
							conditionResult += " AND " + fieldName + "!= '00000000'";
						}
					}
				}
			}

		}
		return conditionResult;
	},
	getOperator: function(operator) {
		if (operator === "&lt;=") {
			return "<=";
		}
		if (operator === "&lt;") {
			return "<";
		}
		if (operator === "&gt;=") {
			return ">=";
		}
		if (operator === "IN") {
			operator = "";
		} else if (operator === "NOT IN") {
			operator = " NOT";
		} else if (/[a-zA-Z]/.test(operator) && operator !== '&lt;&gt;') {
			operator = 'LIKE_REGEXPR';
		} else if (operator === "<>" || operator === '&lt;&gt;') {
			operator = "!=";
		}
		return operator;
	},
	getValue: function(value, operator, fieldName) {
		if (operator === "IN" || operator === "NOT IN") {
			let newValue = "(";
			for (let i = 0; i < value.values.length; i++) {
				if (i > 0) {
					newValue += " AND ";
				}
				newValue += fieldName + " " + this.getOperator(value.values[i].oper) + " " + this.getValue(value.values[i].name, value.values[i].oper);
			}
			newValue = newValue + ")";
			return newValue;
		}
		if (operator === "CONTAINS") {
			value = ".*" + value + ".*";
		} else if (operator === "NOT CONTAINS") {
			value = "^((?!" + value + ").)*$";
		} else if (operator === "BW") {
			value = "^" + value + ".*";
		} else if (operator === "NOT BW") {
			value = "^(?!^" + value + ").*$";
		} else if (operator === "FW") {
			value = value + "$";
		} else if (operator === "NOT FW") {
			value = "^(?!.*" + value + "$).*$";
		}
		return "'" + value + "'";
	}
};

DFGExecutor.Column = function(raw, record) {
	this.__init__(raw, record);
	return this;
};
DFGExecutor.Column.prototype = {
	__init__: function(raw, record) {
		this.raw = raw;
		this.record = record;
	},
	addField: function() {
		this.record.addSpecialField(this);
	},
	executeOutputs: function(output) {
		var executeOutput = {};
		try {
			if (!output.outputId && output.idOutput) {
				output.outputId = output.idOutput;
			}
			if (!output.outputId && output.id) {
				output.outputId = output.id;
			}
			if (this.raw.columnId.match(/^O/g)) {
				output.isBRBOutput = true;
			} else if (this.raw.columnId.match(/^BFB_/g)) {
				output.isBFBOutput = true;
			} else if (this.raw.columnId.match(/^BCB_/g)) {
				output.isBCBOutput = true;
			}

			if (output.isBRBOutput) {
				if (!this.record.raw.eefiConditions.BRBParameters[output.metadata.structureId || output.metadata.idStructure]) {
					var mapping = controllerExternal.getStructureFieldMapping({
						idStructure: output.metadata.structureId || output.metadata.idStructure,
						idTax: this.record.raw.eefi.idTax,
						startDate: this.record.raw.eefi.initSubPeriod,
						endDate: this.record.raw.eefi.endSubPeriod
					});
					if (mapping && mapping !== null && mapping.length) {
						let mapConfig = mapping[0].mapping;
						let params = {

							company: {
								value: this.record.raw.eefi.idCompany,
								field: mapConfig.empresa.length !== 0 ? mapConfig.empresa[0] : undefined
							},
							uf: {
								value: this.record.raw.eefi.uf,
								field: mapConfig.ufFilial.length !== 0 ? mapConfig.ufFilial[0] : undefined
							},
							branch: {
								value: this.record.raw.eefi.idBranch,
								field: mapConfig.filial.length !== 0 ? mapConfig.filial[0] : undefined
							},
							subPeriod: {
								field: mapConfig.data.length > 0 ? mapConfig.data : mapConfig.dataVigencia,
								type: mapConfig.data.length > 0 ? 0 : 1,
								year: this.record.raw.eefi.year,
								month: this.record.raw.eefi.month,
								subperiod: this.record.raw.eefi.subPeriod,
								initSubPeriod: this.record.raw.eefi.initSubPeriod,
								endSubPeriod: this.record.raw.eefi.endSubPeriod
							},
							tax: {
								value: this.record.raw.eefi.idTax
							}
						};

						let structureFields = this.record.getStructureFields(modelStructure.getStructure(output.metadata.structureId || output.metadata.idStructure));

						this.record.setFieldIds(structureFields, params);
						this.record.raw.eefiConditions.BRBParameters[output.metadata.structureId || output.metadata.idStructure] = this.record.getBRBParameters(
							params);
					}
				}
				executeOutput = controllerExternal.executeOutputs(output.outputId, this.record.raw.eefiConditions.BRBParameters[output.metadata.structureId ||
						output.metadata.idStructure],
					true);
				if (executeOutput === null) {
					return 0;
				}
			} else if (output.isBCBOutput) {
				executeOutput.value = controllerExternal.executeBCBOutput({
					id: output.outputId,
					eefi: this.record.raw.eefi
				}).outputValue;
			} else if (output.isBFBOutput) {
				executeOutput.value = controllerExternal.executeBFBOutput({
					id: output.outputId,
					eefi: this.record.raw.eefi
				});
			} else {
				executeOutput.value = controllerExternal.executeTCCOutput(output.outputId).outputValue;
			}
			return executeOutput.value || 0;
		} catch (e) {
			$.messageCodes.push({
				"code": "DFG204000",
				"type": "E",
				"errorInfo": _.parseError(e)
			});
			return 0;
		}
		return 0;
	},
	applyHidingRule: function(hidingRule, field, type) {
		if (hidingRule.hide === true || hidingRule.hideValue) {
			return field;
		} else {
			var selectQuery = "CASE WHEN " + field + " IS NULL ";
			if (!type) {
				selectQuery += " OR " + field + " = '' ";
				selectQuery += " OR " + field + " = '0' ";
			} else {
				if (type === "string") {
					selectQuery += " OR " + field + " = '' ";
				} else {
					if (type === "number") {
						selectQuery += " OR " + field + " = '0' ";
					}
				}
			}
			if (isNaN(parseInt(hidingRule.size, 10))) {
				return field;
			}
			return selectQuery + " THEN RPAD(''," + hidingRule.size + ",'" + hidingRule.character + "')ELSE (" + field + ") END";
		}
	},
	getColumnType: function() {
		return "string";
	},
	formatFunctions: {
		"number": numericFormat,
		"string": stringFormat,
		"date": dateFormat,
		"hour": hourFormat
	}
};
DFGExecutor.StructureFieldColumn = function(raw, record) {
	this.__init__(raw, record);
};
DFGExecutor.StructureFieldColumn.inheritsFrom(DFGExecutor.Column);
DFGExecutor.StructureFieldColumn.prototype.addField = function() {
	if (this.record.raw.structureMapCache) {
		if (this.record.raw.structureMapCache[this.raw.idStructure] && this.record.raw.structureMapCache[this.raw.idStructure].tableName) {
			this.record.addStructureField(this.raw.idStructure, this);
		}
	} else {
		if (this.record.raw.structureCache[this.raw.idStructure] && this.record.raw.structureCache[this.raw.idStructure].fields[this.raw.fieldId]) {
			this.record.addStructureField(this.raw.idStructure, this);
		}
	}

};
DFGExecutor.StructureFieldColumn.prototype.getColumnSql = function(withoutFormat) {
	if (this.record.raw.structureMapCache && this.record.raw.structureMapCache[this.raw.idStructure] && this.record.raw.structureMapCache[this
		.raw.idStructure].tableName) {
		var fieldName = this.raw.columnId;
		fieldName = this.record.fieldIdMapStructureNames[this.raw.columnId + "S" + this.raw.idStructure] + ".\"C_" + this.raw.columnId + "\"";
		var fieldType = this.record.raw.structureMapCache[this.raw.idStructure].type[this.raw.fieldId].type;
		var applyFormat = true;
		if (this.record.isTotal(this.raw.idStructure, this.raw.columnId)) {
			var group = this.record.getGroup(this.raw.idStructure, this.raw.columnId);
			if (group.groupByDate) {
				applyFormat = false;
			}
		}

		switch (fieldType) {
			case "NVARCHAR":
			case "VARCHAR":
				fieldType = "string";
				break;
			case "INTEGER":
			case "DECIMAL":
				fieldType = "number";
				break;
			case "TIMESTAMP":
			case "DATE":
				fieldType = "date";
				break;
			default:
				fieldType = "string";
		}
		if (!withoutFormat && this.raw.format && this.raw.format[fieldType] && this.raw.format[fieldType] !== null && applyFormat) {
			fieldName = this.formatFunctions[fieldType](fieldName, this.raw.format[fieldType], this.raw.hidingRule);
		}
		if (this.raw.hidingRule) {
			this.applyHidingRule(this.raw.hidingRule, fieldName, fieldType);
		}
		if (withoutFormat) {
		    return fieldName + " AS " + "C_" + this.raw.columnId+"_UNFORMAT";
		    
		}
		return fieldName + " AS " + "C_" + this.raw.columnId;
	} else {
		if (this.record.raw.structureCache[this.raw.idStructure] && this.record.raw.structureCache[this.raw.idStructure].fields[this.raw.fieldId]) {
			var fieldName = this.record.raw.structureCache[this.raw.idStructure].fields[this.raw.fieldId].hanaName;
			fieldName = this.record.fieldIdMapStructureNames[this.raw.fieldId + "S" + this.raw.idStructure] + "." + fieldName;
			var fieldType = this.record.raw.structureCache[this.raw.idStructure].fields[this.raw.fieldId].type;

			switch (fieldType) {
				case "NVARCHAR":
				case "VARCHAR":
					fieldType = "string";
					break;
				case "INTEGER":
				case "DECIMAL":
					fieldType = "number";
					break;
				case "TIMESTAMP":
				case "DATE":
					fieldType = "date";
					break;
				default:
					fieldType = "string";
			}
			if (!withoutFormat && this.raw.format && this.raw.format[fieldType] && this.raw.format[fieldType] !== null) {
				fieldName = this.formatFunctions[fieldType](fieldName, this.raw.format[fieldType], this.raw.hidingRule);

			}
			if (this.raw.hidingRule) {
				this.applyHidingRule(this.raw.hidingRule, fieldName, fieldType);
			}
			if (withoutFormat) {
			    return fieldName + " AS " + this.record.raw.structureCache[this.raw.idStructure].fields[this.raw.fieldId].hanaName+"_UNFORMAT";
			}
			return fieldName + " AS " + this.record.raw.structureCache[this.raw.idStructure].fields[this.raw.fieldId].hanaName;
		}
	}
	return "\'\'";
};
DFGExecutor.StructureFieldColumn.prototype.getColumnType = function() {
	var fieldType;
	if (this.record.raw.structureMapCache && this.record.raw.structureMapCache[this.raw.idStructure] && this.record.raw.structureMapCache[this
		.raw.idStructure].tableName) {
		fieldType = this.record.raw.structureMapCache[this.raw.idStructure].type[this.raw.fieldId].type;
	} else {
		if (this.record.raw.structureCache[this.raw.idStructure] && this.record.raw.structureCache[this.raw.idStructure].fields[this.raw.fieldId]) {
			fieldType = this.record.raw.structureCache[this.raw.idStructure].fields[this.raw.fieldId].type;
		}
	}
	switch (fieldType) {
		case "NVARCHAR":
		case "VARCHAR":
			fieldType = "string";
			break;
		case "INTEGER":
		case "DECIMAL":
			fieldType = "number";
			break;
		case "TIMESTAMP":
		case "DATE":
			fieldType = "date";
			break;
		default:
			fieldType = "string";
	}
	return fieldType;
};
DFGExecutor.FormulaColumn = function(raw, record) {
	this.__init__(raw, record);
};
DFGExecutor.FormulaColumn.inheritsFrom(DFGExecutor.Column);
DFGExecutor.FormulaColumn.prototype.addField = function() {
	var column = this.raw;
	if (!column.formula.raw) {
		column.formula.raw = "\'\'";
	}
	var raw_copy = column.formula.raw;
	this.raw.formula.block_record = [];
	var blockRecordIds = column.formula.raw.match(/\`ID_[0-9]+-[0-9]-[\d\w_]+\`/g);
	if(blockRecordIds){
    	blockRecordIds.map(function(id){
    	    raw_copy = raw_copy.replace(new RegExp(id),'block_record_id');
    	});  
	} 
	var ids = raw_copy.match(/ID_[0-9]+(_[0-9]+)?/g);
	if (Array.isArray(this.raw.formula.idStructure)) {
		if (this.raw.formula.idStructure.length === 1 && !blockRecordIds) {
			this.raw.formula.idStructure = this.raw.formula.idStructure[0];
		}
	}
	if(!Array.isArray(this.raw.formula.idStructure)&& blockRecordIds){
	    this.raw.formula.idStructure = [this.raw.formula.idStructure];
	}
    
	if ((blockRecordIds || ids) && Array.isArray(this.raw.formula.idStructure)) {
		for (var id = 0; ids && id < ids.length; id++) {
			if (this.record.raw.structureMapCache) {
				if (this.record.raw.structureMapCache[ids[id].split("_")[2]] && this.record.raw.structureMapCache[ids[id].split("_")[2]].tableName) {
					this.record.addStructureField(ids[id].split("_")[2], {
						raw: {
							columnId: ids[id].split("_")[1],
							fieldId: ids[id].split("_")[1]
						}
					});
				}
			} else {
				if (this.record.raw.structureCache[ids[id].split("_")[2]] && this.record.raw.structureCache[ids[id].split("_")[2]].fields[ids[id].split(
					"_")[1]]) {
					this.record.addStructureField(ids[id].split("_")[2], {
						raw: {
							columnId: ids[id].split("_")[1],
							fieldId: ids[id].split("_")[1]
						}
					});
				}
			}
		}

	} else {
	   this.record.addStructureField(this.raw.formula.idStructure, this);
	}

};
DFGExecutor.FormulaColumn.prototype.formatFormula = function() {
	var column = this.raw;
	var manualParameters = this.record.raw.manualParameters;
	var formula = column.formula;
	if(!this.formatted){
	    formula.hana = column.formula.raw;
    	formula.hana = formula.hana.replace(/&gt;/g, '>').replace(/&lt;/g, '<');
    	formula.hana = coreApi.formulaParser.FormulaParser.parse(formula.hana).toSQL();
    	if (this.record.raw.structureMapCache) {
    		
    		if (column.formula.raw.match(/ID_[0-9]+(_[0-9]+)?/g)) {
    			var ids = column.formula.raw.match(/ID_[0-9]+(_[0-9]+)?/g);
    			var structureXIds = {};
    			for (var i = 0; i < ids.length; i++) {
    				var idStructure = ids[i].split("_")[2];
    				var idField = ids[i].split("_")[1];
    				if (!structureXIds[idStructure]) {
    					structureXIds[idStructure] = [];
    				}
    				structureXIds[idStructure].push(idField);
    			}
    			if (Object.keys(structureXIds).length) {
    				for (var s in structureXIds) {
    					for (var f = 0; f < structureXIds[s].length; f++) {
    						if (Object.keys(structureXIds).length === 1) {
    							formula.hana = formula.hana.replace(RegExp("ID_" + structureXIds[s][f] + "_" + s, "g"), "C_" + structureXIds[s][f]);
    						} else {
    							var fieldTable = this.record.fieldIdMapStructureNames[structureXIds[s][f] + "S" + s];
    							formula.hana = formula.hana.replace(RegExp("ID_" + structureXIds[s][f] + "_" + s, "g"), fieldTable + ".C_" + structureXIds[s][f]);
    						}
    
    					}
    				}
    
    			}
    			this.raw.formula.structureXIds = structureXIds;
    		} else {
    
    			formula.hana = formula.hana.replace(RegExp("ID", "g"), "C");
    		}
    
    	}
    	if (formula.hasOwnProperty("idManualParams") && formula.idManualParams.length > 0) {
    		formula.idManualParams.forEach(function(manualParam, key) {
    			if (manualParameters.hasOwnProperty(manualParam)) {
    				let formulaHana = manualParameters[manualParam].value;
    				if (formula.type === "NVARCHAR") {
    					formulaHana = "\'" + formulaHana + "\'";
    				}
    				formula.hana = formula.hana.replace(RegExp(manualParam, "g"), formulaHana);
    			} else {
    				if (formula.type === "NVARCHAR") {
    					formula.hana = formula.hana.replace(RegExp(manualParam, "g"), "\'\'");
    				} else {
    					formula.hana = formula.hana.replace(RegExp(manualParam, "g"), 0);
    				}
    			}
    		});
    	}
    	if (formula.hasOwnProperty("outputs") && Object.keys(formula.outputs).length > 0) {
    		for (var outputKey in formula.outputs) {
    		    if(outputKey.match(/^\`ID_\d+-\d+-.+\`$/g)){
    		        var columnId = outputKey.split("-")[2].split("`")[0];
    		        var blockId = outputKey.split("ID_")[1].split("-")[0];
    		        var recordId = outputKey.split("-")[1];
    		        var replace = "";
    		        if(this.record.record.blockId === blockId && this.record.record.recordId === recordId){
    		            replace = this.record.record.columns[columnId].getColumnSql(true).split("AS")[0];
    		        }else{
    		            replace = this.record.fieldIdMapStructureNames[blockId+"-"+recordId+"-"+columnId]+".\"C_"+columnId+"\"";
    		        }
    		        formula.hana = formula.hana.replace(new RegExp(outputKey, 'g'),replace);
    		    }else if (formula.outputs.hasOwnProperty(outputKey) && outputKey.match(/^ID_\d+_\d+$/g) === null) {
    				let componentKey = outputKey.slice(0, 3);
    				let outputParameters = {
    					outputId: outputKey.split(componentKey + "ID_")[1],
    					metadata: formula.outputs[outputKey].metadata || formula.outputs[outputKey].data,
    					isBRBOutput: componentKey === "BRB",
    					isBFBOutput: componentKey === "BFB",
    					isBCBOutput: componentKey === "BCB"
    				};
    				outputParameters["is" + componentKey + "Output"] = true;
    				let outputValue = this.executeOutputs(outputParameters);
    				formula.hana = formula.hana.replace(new RegExp(outputKey, 'g'), outputValue);
    			}
    		}
    	}
        this.formatted = true;
	}
	return formula.hana;
};

DFGExecutor.FormulaColumn.prototype.getColumnSql = function(withoutFormat) {
	var fieldName = this.formatFormula();
	var fieldType = this.raw.formula.type;
	if (Array.isArray(this.raw.formula.idStructure)) {
		if (this.raw.formula.idStructure.length === 1) {
			this.raw.formula.idStructure = this.raw.formula.idStructure[0];
		}
	}
	if (!Array.isArray(this.raw.formula.idStructure)) {
		if (this.record.raw.structureMapCache) {
			if (this.record.raw.structureMapCache[this.raw.formula.idStructure] && this.record.raw.structureMapCache[this.raw.formula.idStructure].tableName) {
				this.record.raw.structureMapCache[this.raw.formula.idStructure].mapConfigFields[this.raw.columnId] = {
					hanaName: fieldName + " AS  \"" + this.raw.columnId + "\"",
					type: fieldType
				};
			}
		} else {
			this.record.raw.structureCache[this.raw.formula.idStructure].fields[this.raw.columnId] = {
				hanaName: fieldName + " AS \"" + this.raw.columnId + "\"",
				type: fieldType
			};

		}
		if (this.record.fieldIdMapStructureNames[this.raw.columnId + "S" + this.raw.formula.idStructure]) {
			fieldName = this.raw.columnId;
			fieldName = this.record.fieldIdMapStructureNames[this.raw.columnId + "S" + this.raw.formula.idStructure] + ".\"" + fieldName + "\"";
		}
	}
	fieldType = fieldType === "NVARCHAR" ? "string" : "number";

	if (!withoutFormat && this.raw.format && this.raw.format[fieldType] && this.raw.format[fieldType] !== null) {
		fieldName = this.formatFunctions[fieldType](fieldName, this.raw.format[fieldType], this.raw.hidingRule);
	}
	if (this.raw.hidingRule) {
		this.applyHidingRule(this.raw.hidingRule, fieldName, fieldType);
	}
	fieldName = 'IFNULL(' + fieldName + ', ' + (fieldType === 'number' && $.lodash.isNil(this.ras.formula) ? 0 : '\'0\'') + ')';
	if (withoutFormat) {
	    return fieldName + " AS C_" + this.raw.columnId+"_UNFORMAT";
	}
	return fieldName + " AS C_" + this.raw.columnId;
};
DFGExecutor.FormulaColumn.prototype.getColumnType = function() {
	var fieldType = this.raw.formula.type;
	fieldType = fieldType === "NVARCHAR" ? "string" : "number";
	return fieldType;
};
DFGExecutor.RecordIdColumn = function(raw, record) {
	this.__init__(raw, record);
};
DFGExecutor.RecordIdColumn.inheritsFrom(DFGExecutor.Column);

DFGExecutor.RecordIdColumn.prototype.getColumnSql = function(withoutFormat) {
	if (typeof this.raw.recordId === "string") {
	    if (withoutFormat) {
	        return "\'" + this.record.record.name + "\' AS C_" + this.raw.columnId+"_UNFORMAT";
	    }
		return "\'" + this.record.record.name + "\' AS C_" + this.raw.columnId;
	} else {
		if (this.raw.recordId.blockId && this.raw.recordId.recordId) {
		    if (withoutFormat) {
    	       return "\'" + this.raw.recordId.blockId + this.record.record.name + "\' AS C_" + this.raw.columnId+"_UNFORMAT";
    	    }
			return "\'" + this.raw.recordId.blockId + this.record.record.name + "\' AS C_" + this.raw.columnId;
		}
		if (this.raw.recordId.blockId) {
		    if (withoutFormat) {
		        return "\'" + this.raw.recordId.blockId + "\' AS C_" + this.raw.columnId +"_UNFORMAT";
		    }
			return "\'" + this.raw.recordId.blockId + "\' AS C_" + this.raw.columnId;
		}
		if (this.raw.recordId.recordId) {
		    if (withoutFormat) {
		        return "\'" + this.record.record.name + "\' AS C_" + this.raw.columnId+"_UNFORMAT";
		    }
			return "\'" + this.record.record.name + "\' AS C_" + this.raw.columnId;
		}
	}
	if (withoutFormat) {
	    return "\'\' AS C_" + this.raw.columnId + "_UNFORMAT";
	}
	return "\'\' AS C_" + this.raw.columnId;
};

DFGExecutor.ManualParamColumn = function(raw, record) {
	this.__init__(raw, record);
};
DFGExecutor.ManualParamColumn.inheritsFrom(DFGExecutor.Column);
DFGExecutor.ManualParamColumn.prototype.applyParamFormat = function(fieldName, fill, align) {
	var alignQuery = align === 0 ? "LPAD" : "RPAD";
	fieldName = alignQuery + "(" + fieldName + "," + (this.raw.manualParam.length === undefined ? 0 : this.raw.manualParam.length) + ",'" + (
		fill === undefined ? "" : fill) + "')";
	return fieldName;
};
DFGExecutor.ManualParamColumn.prototype.getColumnSql = function(withoutFormat) {
	let fieldName = (this.record.raw.manualParameters[this.raw.columnId]) ? "\'" + this.record.raw.manualParameters[this.raw.columnId].value +
		"\'" : null;
	let fieldType = this.raw.manualParam.type;
	switch (fieldType) {
		case 'NVARCHAR':
			fieldType = 'string';
			break;
		case "TIMESTAMP":
			fieldType = 'date';
			fieldName = utilDFG.toJSONDate(new Date(fieldName));
			break;
		default:
			fieldType = 'number';
			fieldName = parseFloat(fieldName.substring(1,fieldName.length-1));
			if(isNaN(fieldName)){
			    fieldName = 0;
			}
	}
	
	if (fieldType === "number" && fieldName === "") {
		fieldName = "NULL";
	}
	if(!withoutFormat)
	    fieldName = this.applyParamFormat(fieldName, this.raw.manualParam.fill, this.raw.manualParam.align);
	if (!withoutFormat && this.raw.format && this.raw.format[fieldType] && this.raw.format[fieldType] !== null) {
		fieldName = this.formatFunctions[fieldType](fieldName, this.raw.format[fieldType], this.raw.hidingRule);
	}
	if (this.raw.hidingRule) {
		this.applyHidingRule(this.raw.hidingRule, fieldName, fieldType);
	}
    if (withoutFormat) {
        return fieldName + " AS C_" + this.raw.columnId+"_UNFORMAT";
    }
	return fieldName + " AS C_" + this.raw.columnId;

};
DFGExecutor.ManualParamColumn.prototype.getColumnType = function() {
	let fieldType = this.raw.manualParam.type;
	switch (fieldType) {
		case 'NVARCHAR':
			fieldType = 'string';
			break;
		default:
			fieldType = 'number';
	}
	return fieldType;
};
DFGExecutor.FixedManualFieldColumn = function(raw, record) {
	this.__init__(raw, record);
};
DFGExecutor.FixedManualFieldColumn.inheritsFrom(DFGExecutor.Column);
DFGExecutor.FixedManualFieldColumn.prototype.getColumnSql = function(withoutFormat) {
	var fieldName = (this.record.raw.manualParameters[this.raw.columnId]) ? "\'" + this.record.raw.manualParameters[this.raw.columnId].value +
		"\'" : null;
	var fieldType = "string";
	if (!withoutFormat && this.raw.format && this.raw.format[fieldType] && this.raw.format[fieldType] !== null) {
		fieldName = this.formatFunctions[fieldType](fieldName, this.raw.format[fieldType], this.raw.hidingRule);
	}
	if (this.raw.hidingRule) {
		this.applyHidingRule(this.raw.hidingRule, fieldName, fieldType);
	}
	if (withoutFormat) {
	    return fieldName + " AS C_" + this.raw.columnId +"_UNFORMAT";
	    
	}
	return fieldName + " AS C_" + this.raw.columnId;
};
DFGExecutor.FixedFieldColumn = function(raw, record) {
	this.__init__(raw, record);
};
DFGExecutor.FixedFieldColumn.inheritsFrom(DFGExecutor.Column);
DFGExecutor.FixedFieldColumn.prototype.getColumnSql = function(withoutFormat) {
	var fieldName = this.raw.fixedField.values.length === 1 ? "\'" + this.raw.fixedField.values[0] + "\'" : "\'\'";

	var fieldType = this.raw.fixedField.type;
	switch (fieldType) {
		case 'NVARCHAR':
			fieldType = 'string';
			break;
		default:
			fieldType = 'number';
	}
	if (!withoutFormat && this.raw.format && this.raw.format[fieldType] && this.raw.format[fieldType] !== null) {
		fieldName = this.formatFunctions[fieldType](fieldName, this.raw.format[fieldType], this.raw.hidingRule);
	}
	if (this.raw.hidingRule) {
		this.applyHidingRule(this.raw.hidingRule, fieldName, fieldType);
	}
	if (this.record.record.businessRules && this.record.record.businessRules[this.raw.columnId] && this.record.record.businessRules[this.raw.columnId]
		.idRule) {
		fieldName = "\'*" + this.raw.columnId.toUpperCase() + "*\'";
	}
	if (withoutFormat) {
	    return fieldName + " AS C_" + this.raw.columnId+"_UNFORMAT";
	}
	return fieldName + " AS C_" + this.raw.columnId;
};
DFGExecutor.FixedFieldColumn.prototype.getColumnType = function() {
	var fieldType = this.raw.fixedField.type;
	switch (fieldType) {
		case 'NVARCHAR':
			fieldType = 'string';
			break;
		default:
			fieldType = 'number';
	}
	return fieldType;
};
DFGExecutor.SequenceFieldColumn = function(raw, record) {
	this.__init__(raw, record);
};
DFGExecutor.SequenceFieldColumn.inheritsFrom(DFGExecutor.Column);
DFGExecutor.SequenceFieldColumn.prototype.getColumnSql = function(withoutFormat) {
    if (withoutFormat) {
       return "'SEQUENCE-" + this.record.raw.eefi.actualBlock + "_" + this.record.raw.eefi.actualRecord + "' AS C_" + this.raw.columnId+"_UNFORMAT";
    }
	return "'SEQUENCE-" + this.record.raw.eefi.actualBlock + "_" + this.record.raw.eefi.actualRecord + "' AS C_" + this.raw.columnId;
};
DFGExecutor.FillerColumn = function(raw, record) {
	this.__init__(raw, record);
};
DFGExecutor.FillerColumn.inheritsFrom(DFGExecutor.Column);
DFGExecutor.FillerColumn.prototype.getColumnSql = function(withoutFormat) {
	var fieldName = "'" + this.raw.filler.value + "'";
	var fieldType = "string";
	if (!withoutFormat && this.raw.format && this.raw.format[fieldType] && this.raw.format[fieldType] !== null) {
		fieldName = this.formatFunctions[fieldType](fieldName, this.raw.format[fieldType], this.raw.hidingRule);
	}
	if (this.raw.hidingRule) {
		this.applyHidingRule(this.raw.hidingRule, fieldName, fieldType);
	}
	if (withoutFormat) {
	    return fieldName + " AS C_" + this.raw.columnId+"_UNFORMAT";
	}
	return fieldName + " AS C_" + this.raw.columnId;
};
DFGExecutor.VersionColumn = function(raw, record) {
	this.__init__(raw, record);

};
DFGExecutor.VersionColumn.inheritsFrom(DFGExecutor.Column);
DFGExecutor.VersionColumn.prototype.getColumnSql = function(withoutFormat) {
	var fieldName = "'" + this.raw.version.label + "'";
	var fieldType = "string";
	if (!withoutFormat && this.raw.format && this.raw.format[fieldType] && this.raw.format[fieldType] !== null) {
		fieldName = this.formatFunctions[fieldType](fieldName, this.raw.format[fieldType], this.raw.hidingRule);
	}
	if (this.raw.hidingRule) {
		this.applyHidingRule(this.raw.hidingRule, fieldName, fieldType);
	}
	if (withoutFormat) {
	    return fieldName + " AS C_" + this.raw.columnId+"_UNFORMAT";
	}
	return fieldName + " AS C_" + this.raw.columnId;
};
DFGExecutor.ReferencePeriodColumn = function(raw, record) {
	this.__init__(raw, record);
};
DFGExecutor.ReferencePeriodColumn.inheritsFrom(DFGExecutor.Column);
DFGExecutor.ReferencePeriodColumn.prototype.getColumnSql = function(withoutFormat) {
	var fieldName = utilDFG.toJSONDate(new Date(this.record.raw.eefi.initSubPeriod));
	var fieldType = "date";
	if (!withoutFormat && this.raw.format && this.raw.format[fieldType] && this.raw.format[fieldType] !== null) {
		fieldName = this.formatFunctions[fieldType](fieldName, this.raw.format[fieldType], this.raw.hidingRule, true);
	} else {
		fieldName = "\'" + fieldName.year + fieldName.month + fieldName.day + "\'";
	}
	if (this.raw.hidingRule) {
		this.applyHidingRule(this.raw.hidingRule, fieldName, fieldType);
	}
	if (withoutFormat) {
	    return fieldName + " AS C_" + this.raw.columnId +"_UNFORMAT";
	}
	return fieldName + " AS C_" + this.raw.columnId;
};
DFGExecutor.ReferencePeriodColumn.prototype.getColumnType = function() {
	return "date";
};
DFGExecutor.RecordTotalColumn = function(raw, record) {
	this.__init__(raw, record);
};
DFGExecutor.RecordTotalColumn.inheritsFrom(DFGExecutor.Column);
DFGExecutor.RecordTotalColumn.prototype.getColumnSql = function(withoutFormat) {
	if (this.raw.totalData) {
	    if (withoutFormat) {
	        return "'TOTAL_RECORD-" + this.raw.totalData.block + "_" + this.raw.totalData.record + "' AS C_" + this.raw.columnId+"_UNFORMAT";
	    }
		return "'TOTAL_RECORD-" + this.raw.totalData.block + "_" + this.raw.totalData.record + "' AS C_" + this.raw.columnId;
	} else {
	    if (withoutFormat) {
	        return "'TOTAL_RECORD-" + this.record.raw.eefi.actualBlock + "_" + this.record.raw.eefi.actualRecord + "' AS C_" + this.raw.columnId+"_UNFORMAT";
	    }
		return "'TOTAL_RECORD-" + this.record.raw.eefi.actualBlock + "_" + this.record.raw.eefi.actualRecord + "' AS C_" + this.raw.columnId;
	}

};
DFGExecutor.InitialDateReferenceColumn = function(raw, record) {
	this.__init__(raw, record);
};
DFGExecutor.InitialDateReferenceColumn.inheritsFrom(DFGExecutor.Column);
DFGExecutor.InitialDateReferenceColumn.prototype.getColumnSql = function(withoutFormat) {
	var fieldName = utilDFG.toJSONDate(new Date(this.record.raw.eefi.initSubPeriod));
	var fieldType = "date";
	if (!withoutFormat && this.raw.format && this.raw.format[fieldType] && this.raw.format[fieldType] !== null) {
		fieldName = this.formatFunctions[fieldType](fieldName, this.raw.format[fieldType], this.raw.hidingRule, true);
	} else {
		fieldName = "\'" + fieldName.year + fieldName.month + fieldName.day + "\'";
	}
	if (this.raw.hidingRule) {
		this.applyHidingRule(this.raw.hidingRule, fieldName, fieldType);
	}
	if (withoutFormat) {
	    return fieldName + " AS C_" + this.raw.columnId+"_UNFORMAT";
	}
	return fieldName + " AS C_" + this.raw.columnId;
};
DFGExecutor.InitialDateReferenceColumn.prototype.getColumnType = function() {
	return "date";
};
DFGExecutor.FinalDateReferenceColumn = function(raw, record) {
	this.__init__(raw, record);
};
DFGExecutor.FinalDateReferenceColumn.inheritsFrom(DFGExecutor.Column);
DFGExecutor.FinalDateReferenceColumn.prototype.getColumnSql = function(withoutFormat) {
	var fieldName = utilDFG.toJSONDate(new Date(this.record.raw.eefi.endSubPeriod));
	var fieldType = "date";
	if (!withoutFormat && this.raw.format && this.raw.format[fieldType] && this.raw.format[fieldType] !== null) {
		fieldName = this.formatFunctions[fieldType](fieldName, this.raw.format[fieldType], this.raw.hidingRule, true);
	} else {
		fieldName = "\'" + fieldName.year + fieldName.month + fieldName.day + "\'";
	}
	if (this.raw.hidingRule) {
		this.applyHidingRule(this.raw.hidingRule, fieldName, fieldType);
	}
	if (withoutFormat) {
	    return fieldName + " AS C_" + this.raw.columnId+"_UNFORMAT";
	}
	return fieldName + " AS C_" + this.raw.columnId;
};
DFGExecutor.FinalDateReferenceColumn.prototype.getColumnType = function() {
	return "date";
};
DFGExecutor.BlockTotalColumn = function(raw, record) {
	this.__init__(raw, record);
};
DFGExecutor.BlockTotalColumn.inheritsFrom(DFGExecutor.Column);
DFGExecutor.BlockTotalColumn.prototype.getColumnSql = function(withoutFormat) {
	if (this.raw.totalData) {
	    if (withoutFormat) {
	      return "'TOTAL_BLOCK-" + this.raw.totalData.block + "' AS C_" + this.raw.columnId+"_UNFORMAT";  
	    }
		return "'TOTAL_BLOCK-" + this.raw.totalData.block + "' AS C_" + this.raw.columnId;
	} else {
	    if (withoutFormat) {
	        return "'TOTAL_BLOCK-" + this.record.raw.eefi.actualBlock + "' AS C_" + this.raw.columnId + "_UNFORMAT";
	    }
		return "'TOTAL_BLOCK-" + this.record.raw.eefi.actualBlock + "' AS C_" + this.raw.columnId;
	}
};
DFGExecutor.TotalAllColumn = function(raw, record) {
	this.__init__(raw, record);
};
DFGExecutor.TotalAllColumn.inheritsFrom(DFGExecutor.Column);
DFGExecutor.TotalAllColumn.prototype.getColumnSql = function(withoutFormat) {
    if (withoutFormat) {
        return "'TOTAL_FILE' AS C_" + this.raw.columnId + "_UNFORMAT";
    }
	return "'TOTAL_FILE' AS C_" + this.raw.columnId;
};
DFGExecutor.TotalChildRecord = function(raw, record) {
	this.__init__(raw, record);
};
DFGExecutor.TotalChildRecord.inheritsFrom(DFGExecutor.Column);
DFGExecutor.TotalChildRecord.prototype.getColumnSql = function(withoutFormat) {
    if (withoutFormat) {
        return "'TOTAL_CHILD_RECORD' AS C_" + this.raw.columnId + "_UNFORMAT";
    }
	return "'TOTAL_CHILD_RECORD' AS C_" + this.raw.columnId;
};
DFGExecutor.RecordCounter = function(raw, record) {
	this.__init__(raw, record);
};
DFGExecutor.RecordCounter.inheritsFrom(DFGExecutor.Column);
DFGExecutor.RecordCounter.prototype.getColumnSql = function(withoutFormat) {
    if (withoutFormat) {
        return "'RECORD_COUNTER' AS C_" + this.raw.columnId + "_UNFORMAT";
    }
	return "'RECORD_COUNTER' AS C_" + this.raw.columnId;
};
DFGExecutor.RecordList = function(raw, record) {
	this.__init__(raw, record);
};
DFGExecutor.RecordList.inheritsFrom(DFGExecutor.Column);
DFGExecutor.RecordList.prototype.getColumnSql = function(withoutFormat) {
    this.hasListRecord = true;
    if (withoutFormat) {
        return "'LIST_RECORD' AS C_" + this.raw.columnId + "_UNFORMAT";
    }
	return "'LIST_RECORD' AS C_" + this.raw.columnId;
};
DFGExecutor.LineBreakColumn = function(raw, record) {
	this.__init__(raw, record);
};
DFGExecutor.LineBreakColumn.inheritsFrom(DFGExecutor.Column);
DFGExecutor.LineBreakColumn.prototype.getColumnSql = function(withoutFormat) {
	return "'LINE_BREAK'";
};
DFGExecutor.DFGOutputColumn = function(raw, record) {
	this.__init__(raw, record);
};
DFGExecutor.DFGOutputColumn.inheritsFrom(DFGExecutor.Column);
DFGExecutor.DFGOutputColumn.prototype.getColumnSql = function(withoutFormat) {
	let outputAggregate = this.raw.output.operation;
	let outputFieldId = this.raw.output.fieldId;
	let outputStructureId = this.raw.output.idStructure;
	let structureField = this.record.raw.structureCache[outputStructureId][outputFieldId];
	var fieldName = outputAggregate + "(" + structureField.hanaName + ") ";
	var fieldType = "number";
	if (!withoutFormat && this.raw.format && this.raw.format[fieldType] && this.raw.format[fieldType] !== null) {
		fieldName = this.formatFunctions[fieldType](fieldName, this.raw.format[fieldType], this.raw.hidingRule);
	}
	if (this.raw.hidingRule) {
		this.applyHidingRule(this.raw.hidingRule, fieldName, fieldType);
	}
	if (withoutFormat) {
	    return fieldName + " AS C_" + this.raw.columnId+"_UNFORMAT";
	}
	return fieldName + " AS C_" + this.raw.columnId;
};
DFGExecutor.DFGOutputColumn.prototype.getColumnType = function() {
	return "number";
};
//No se que hace eso
DFGExecutor.ExecutionDateColumn = function(raw, record) {
	this.__init__(raw, record);
};
DFGExecutor.ExecutionDateColumn.inheritsFrom(DFGExecutor.Column);
DFGExecutor.ExecutionDateColumn.prototype.getColumnSql = function(withoutFormat) {
	let executionDate = new Date();
	var month = executionDate.getMonth() + 1 < 10 ? "0" + (executionDate.getMonth() + 1) : executionDate.getMonth() + 1;
	var day = executionDate.getDate() < 10 ? "0" + executionDate.getDate() : executionDate.getDate();
	executionDate = "'" + executionDate.getFullYear() + month + day + "'";
	var fieldName;
	var fieldType = "date";
	if (!withoutFormat && this.raw.format && this.raw.format[fieldType] && this.raw.format[fieldType] !== null) {
		fieldName = this.formatFunctions[fieldType](executionDate, this.raw.format[fieldType], this.raw.hidingRule, false);
	} else {
		fieldName = executionDate;
	}
	if (this.raw.hidingRule) {
		this.applyHidingRule(this.raw.hidingRule, fieldName, fieldType);
	}
	if (withoutFormat) {
	    return fieldName + " AS C_" + this.raw.columnId+"_UNFORMAT";
	}
	return fieldName + " AS C_" + this.raw.columnId;
};
DFGExecutor.ExecutionDateColumn.prototype.getColumnType = function() {
	return "date";
};
DFGExecutor.ExecutionHourColumn = function(raw, record) {
	this.__init__(raw, record);
};

DFGExecutor.ExecutionHourColumn.inheritsFrom(DFGExecutor.Column);
DFGExecutor.ExecutionHourColumn.prototype.getColumnSql = function(withoutFormat) {
	let executionTime = new Date();
	executionTime = executionTime.toTimeString();
	executionTime = executionTime.split(" ")[0].split(":");
	var fieldType = "hour";
	var fieldName;
	if (!withoutFormat && this.raw.format && this.raw.format[fieldType] && this.raw.format[fieldType] !== null) {
		fieldName = this.formatFunctions[fieldType](this.raw.format.hour || this.raw.format.date, executionTime);
	} else {
		fieldName = executionTime.join(" ");
	}
	if (this.raw.hidingRule) {
		this.applyHidingRule(this.raw.hidingRule, fieldName, fieldType);
	}
	if (withoutFormat) {
	    return "\'" + fieldName + "\'" + " AS C_" + this.raw.columnId+"_UNFORMAT";
	}
	return "\'" + fieldName + "\'" + " AS C_" + this.raw.columnId;
};
DFGExecutor.ExecutionHourColumn.prototype.getColumnType = function() {
	return "hour";
};
DFGExecutor.GroupedLinesColumn = function(raw, record) {
	this.__init__(raw, record);
};

DFGExecutor.GroupedLinesColumn.inheritsFrom(DFGExecutor.Column);
DFGExecutor.GroupedLinesColumn.prototype.getColumnSql = function(withoutFormat) {
	if (this.record.fromStructures["S" + this.raw.groupedLines.structureId + "G" + this.raw.groupedLines.groupId]) {
		var fieldName = "S" + this.raw.groupedLines.structureId + "G" + this.raw.groupedLines.groupId + ".\"GROUP_COUNT\"";
		var fieldType = "number";
		if (!withoutFormat && this.raw.format && this.raw.format[fieldType] && this.raw.format[fieldType] !== null) {
			fieldName = this.formatFunctions[fieldType](fieldName, this.raw.format[fieldType]);
		}
		if (withoutFormat) {
		    return fieldName + " AS C_" + this.raw.columnId+"_UNFORMAT";
		}
		return fieldName + " AS C_" + this.raw.columnId;
	}
	return "0";
};
DFGExecutor.OutputColumn = function(raw, record) {
	this.__init__(raw, record);
};
DFGExecutor.OutputColumn.inheritsFrom(DFGExecutor.Column);
DFGExecutor.OutputColumn.prototype.getColumnSql = function(withoutFormat) {
	var fieldName = this.executeOutputs(this.raw.output); 
	var fieldType = "number";
	if (!withoutFormat && this.raw.format && this.raw.format[fieldType] && this.raw.format[fieldType] !== null) {
		fieldName = this.formatFunctions[fieldType](fieldName, this.raw.format[fieldType], this.raw.hidingRule);
	}
	if (this.raw.hidingRule) {
		this.applyHidingRule(this.raw.hidingRule, fieldName, fieldType);
	}
	if (withoutFormat) {
	    return fieldName + " AS C_" + this.raw.columnId+"_UNFORMAT";
	}
	return fieldName + " AS C_" + this.raw.columnId;
};
DFGExecutor.OutputColumn.prototype.getColumnType = function() {
	return "number";
};

DFGExecutor.ListFieldColumn = function(raw, record) {
	this.__init__(raw, record);
};
DFGExecutor.ListFieldColumn.inheritsFrom(DFGExecutor.Column);
DFGExecutor.ListFieldColumn.prototype.getColumnSql = function(withoutFormat) {
	if (this.record.raw.structureMapCache.listFieldsTable) {
		return "LFT.\"C_" + this.raw.listField.name + "\"";
	}
	return "\'\'"; //esto es temporal;
};
DFGExecutor.ListFieldColumn.prototype.getColumnType = function() {
	return "string";
};