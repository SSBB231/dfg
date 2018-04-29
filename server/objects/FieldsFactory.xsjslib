var columnQueryObjectBilder = {};

function QueryObject(fieldOrderPre, fieldOrderPos, sqlQuery, exceptions) {
	this.fieldOrderPre = fieldOrderPre || "";
	this.fieldOrderPos = fieldOrderPos || "";
	this.sqlQuery = sqlQuery || "";
	this.exceptions = exceptions || [];
}

columnQueryObjectBilder.structure = function(column, record) {
	var field = getFieldFromStructure(column, record.structureData);

	var query = "";
	var fieldOrderPos = "";
	var fieldOrderPre = "";
	var exceptions = [];
	//caso tenha relação de sub-records, aplica nome distintos para diferenciação devido ao JOIN 
	//que é feito quando existe relação de sub-records
	if (record.hasOwnProperty('subRecord')) {
		let fieldName = field.hanaName;
		if (record.subRecord.type == 'parent') {
			field.hanaName = "A." + fieldName;
		} else if (record.subRecord.type == 'child') {
			field.hanaName = "B." + fieldName;
		}
	}
	var format = ((column.format) ? JSON.parse(JSON.stringify(column.format)) : record.parsedFormat);
	if ((format instanceof Object) && (Object.keys(format).length > 0)) {
		var formatedField = columnQueryObjectBilder.formatFieldTest(format, field.hanaName, field.type, column.index);
		query = formatedField.field;
		fieldOrderPos = formatedField.field;
		if (formatedField.exceptions !== null) {
			//excessão de formatação (aplicado para campos numéricos com separador de miliar alterado)
			exceptions.push(formatedField.exceptions);
			//excessão de sub-record
			if (record.subRecord != false) {
				record.subRecord.exception.push(formatedField.exceptions);
			}
		}
	} else {
		query += field.hanaName;
		fieldOrderPos = field.hanaName;
	}
	fieldOrderPre = field.hanaName;
	var object = new QueryObject(fieldOrderPre, fieldOrderPos, query, exceptions);
	object.fieldsRecord = [field.hanaName];
	return object;
};

function getFieldFromStructure(column, structureData) {
	for (var z in structureData.fields) {
		if (column.fieldId == structureData.fields[z].ID) {
			var structure = structureData.fields[z];
		}
	}
	return structure;
	return JSON.parse(JSON.stringify(structure));
};

columnQueryObjectBilder.recordId = function(column, record) {
	var query = "'" + column.recordId + "' AS RECORD_ID";
	var object = new QueryObject("RECORD_ID", "RECORD_ID", query, null);
	object.recordId = column.recordId;
	object.sumPostion = true;
	return object;
};

columnQueryObjectBilder.formula = function(column, record) {
	var query = "";
	var fieldOrderPos = "";
	var fieldOrderPre = "";
	var exceptions = [];

	var format = ((column.format) ? JSON.parse(JSON.stringify(column.format)) : record.parsedFormat);
	if ((format instanceof Object) && (Object.keys(format).length > 0)) {
		var formatedField = columnQueryObjectBilder.formatFieldTest(format, column.formula.hana, column.formula.type, column.index);
		var fieldData = JSON.parse(JSON.stringify(formatedField.field));

		var prim = fieldData.charAt(0);
		var ult = fieldData.charAt(fieldData.length - 1);
		if ((prim == "'" || prim == "\"") && (ult == "'" || ult == "\"")) {
			fieldData = fieldData.substring(1, (fieldData.length - 1));
		}

		query += fieldData;
		fieldOrderPos = fieldData;

		if (formatedField.exceptions != null) {
			exceptions.push(formatedField.exceptions);
		}
	} else {
		query += "(" + column.formula.hana + ")";
		fieldOrderPos = column.formula.hana;
	}
	fieldOrderPre = column.formula.hana;
	var object = new QueryObject(fieldOrderPre, fieldOrderPos, query, exceptions);
	return object;
};

columnQueryObjectBilder.manualParam = function(column, record) {
	var query = "";
	var fieldOrderPos = "";
	var fieldOrderPre = "";
	var exceptions = [];

	var manualParameter = record.manualParam[column.manualParam.id];
	var hanaName = "'" + manualParameter.value + "'";

	var format = ((column.format) ? JSON.parse(JSON.stringify(column.format)) : record.parsedFormat);
	if (format.hasOwnProperty('string') && format.string != null) {
		var formatedField = columnQueryObjectBilder.formatFieldTest(format, hanaName, manualParameter.type, column.index);
		var fieldData = JSON.parse(JSON.stringify(formatedField.field));

		var prim = fieldData.charAt(0);
		var ult = fieldData.charAt(fieldData.length - 1);
		if ((prim == "'" || prim == "\"") && (ult == "'" || ult == "\"")) {
			fieldData = fieldData.substring(1, (fieldData.length - 1));
		}

		query = fieldData;
		fieldOrderPos = fieldData;

		if (formatedField.exceptions != null) {
			exceptions.push(formatedField.exceptions);
		}
	} else {
		query = hanaName;
		fieldOrderPos = hanaName;
	}
	fieldOrderPre = hanaName;
	var object = new QueryObject(fieldOrderPre, fieldOrderPos, query, exceptions);
	return object;
};

columnQueryObjectBilder.filler = function(column, record) {
	var hanaName = "'" + column.filler.value + "'";
	return new QueryObject(hanaName, hanaName, hanaName, null);
};

columnQueryObjectBilder.version = function(column, record) {
	var hanaName = "'" + column.version.label + "'";
	return new QueryObject(hanaName, hanaName, hanaName, null);
};

columnQueryObjectBilder.isBlocksTotal = function(column, record) {
	var field = "TOTAL_BLOCK";
	var object = new QueryObject("", "", field, null);
	object.blockTotal = true;
	return object;
};

columnQueryObjectBilder.isRecordsTotals = function(column, record) {
	var field = "TOTAL_RECORD";
	var object = new QueryObject("", "", field, null);
	object.recordsTotals = true;
	return object;
};

columnQueryObjectBilder.isTotalsAll = function(column, record) {
	var field = "'TOTAL_ALL'";
	var object = new QueryObject("", "", field, null);
	object.totalsAll = true;
	return object;
};

columnQueryObjectBilder.isSequence = function(column, record) {
	var exceptions = [];

	var size = "";
	var align = "";
	var complement = "";
	var format = ((column.format) ? JSON.parse(JSON.stringify(column.format)) : record.parsedFormat);

	if (column.format) {
		size = format.number.size;
		align = format.number.align;
		complement = format.number.complement;
	}

	var field = "'IS_SEQUENCE'";

	var exception = {
		position: column.index,
		type: 'sequence',
		size: size,
		align: align,
		complement: complement

	};
	exceptions.push(exceptions);
	return new QueryObject("", "", field, exceptions);
};

columnQueryObjectBilder.blockStarter = function(column, record) {
	var field = "'BLOCK_STARTER'";
	var object = new QueryObject("", "", field, null);
	object.blockStarter = true;
	return object;
};

columnQueryObjectBilder.formatFieldTest = function(format, field, type, position) {

    var response;
    var useFormat;
    var isUpper;
    var isLower;
    var decimal;
    var decimalSeparator;
    var miliarSeparator;
    var stringField = {};
    var datePattern;

    if (type == 'NVARCHAR' || type == 'VARCHAR') {
        useFormat = format.string;
        if (useFormat !== null && useFormat !== undefined) {
            isUpper = useFormat.isUpper;
            isLower = useFormat.isLower;
        }

    } else if (type == 'DECIMAL' || type == 'INTEGER') {
        useFormat = format.number;
        if (useFormat !== null && useFormat !== undefined) {
            decimal = useFormat.decimal;
            decimalSeparator = useFormat.decimalSeparator;
            miliarSeparator = useFormat.miliarSeparator;
        }

    } else if (type == 'TIMESTAMP') {
        useFormat = format.date;
        if (useFormat !== null && useFormat !== undefined) {
            datePattern = useFormat.datePattern;
        }
    }

    stringField.field = field;

    if (useFormat) {


        var size = useFormat.size;
        var sizeDate;
        var complement = useFormat.complement;
        var align = useFormat.align;
        var alignQuery;
        var searchFor = useFormat.searchFor;
        var replaceWith = useFormat.replaceWith;
        var completeCase = 0;
        var sizeMiliar;
        var sizeDecimal;

        if (!size) {
            size = "LENGTH(" + field + ")";
            sizeDecimal = "LENGTH(TO_DECIMAL(" + field + ",10," + decimal + "))";
            sizeDate = null;
            sizeMiliar = 0;
        } else {
            sizeDate = size;
            completeCase = 1;
            sizeMiliar = size;
            sizeDecimal = size;
        }

        if (!complement) {
            complement = "";
        } else if (complement == "space") {
            complement = " ";
        }

        if (align === 1) {
            alignQuery = 'LPAD';
        } else if (align == 0) {
            alignQuery = 'RPAD';
        } else {
            alignQuery = 'LPAD';
        }

        if (miliarSeparator) {
            size = sizeMiliar;
            stringField.exceptions = {
                position: position,
                type: "miliarSeparator",
                miliarSeparator: miliarSeparator,
                decimalSeparator: decimalSeparator,
                size: size,
                align: align,
                complement: complement,
                decimal: decimal
            }
            //stringField.field = this.quoteHanaName(field);
            stringField.field = field;
            return stringField;

        } else {
            stringField.exceptions = null;
        }

        if (decimal) {
            if (decimal != 0) {
                stringField.field = "(RPAD(TO_DECIMAL(" + stringField.field + ",10," + decimal + "),LENGTH(FLOOR(" + field + "))+" + decimal + "+1,0))";
                size = sizeDecimal;
            } else {
                stringField.field = "(RPAD(TO_DECIMAL(" + stringField.field + ",10," + decimal + "),LENGTH(FLOOR(" + field + "))+" + decimal + ",0))";
            }
        }

        if (decimalSeparator) {
            stringField.field = "(REPLACE(" + stringField.field + ",'.','" + decimalSeparator + "'))";
        }

        if (datePattern) {
            var year = "LEFT(" + stringField.field + ", 4)";
            var year2 = "SUBSTRING(" + stringField.field + ",3,2)";
            var month = "SUBSTRING(" + stringField.field + ",5,2)";
            var day = "SUBSTRING(" + stringField.field + ",7,2)";
            var formattedDate = this._processHanaDate(datePattern);
            formattedDate = formattedDate.replace('HANA_YEAR', year);
            formattedDate = formattedDate.replace('HANA_YEAR2', year2);
            formattedDate = formattedDate.replace('HANA_MONTH', month);
            formattedDate = formattedDate.replace('HANA_DAY', day);

            if (sizeDate) {
                stringField.field = "(" + alignQuery.toString() + "(" + formattedDate + "," + sizeDate + ",'" + complement + "'))";
            } else {
                stringField.field = formattedDate;
            }
            // stringField.field = "(SUBSTRING ("+stringField.field+",7,2)||'-'||SUBSTRING ("+stringField.field+",5,2) ||'-'||SUBSTRING ("+stringField.field+",0,4))";
            // stringField.field = "(TO_DATE("+stringField.field+",'"+datePattern+"'))";
        } else { //Problemas com o comprimento da date com Formato
            stringField.field = "(" + alignQuery.toString() + "(" + stringField.field + "," + size + ",'" + complement + "'))";
        }

        if (searchFor) {
            if (replaceWith) {
                stringField.field = "(REPLACE(" + stringField.field + ",'" + searchFor + "','" + replaceWith + "'))";
            } else {
                stringField.field = "(REPLACE(" + stringField.field + ",'" + searchFor + "',''))";
            }
        }

        if (isUpper == 1) {
            stringField.field = "UPPER(" + stringField.field + ")";
        }

        if (isLower == 1) {
            stringField.field = "LOWER(" + stringField.field + ")";
        }

        if (completeCase == 1) {
            stringField.field = "CASE WHEN " + field + " IS NULL THEN RPAD(''," + size + ",' ')ELSE (" + stringField.field + ") END";
        }

    } else {
        //stringField.field = this.quoteHanaName(field);
        stringField.field = field;
        stringField.exceptions = null;
    }

    response = stringField;
    return response;
};