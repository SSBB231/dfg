sap.ui.controller("app.controllers.dialogs.executarParamsManual", {

    onInit: function() {

    },

    onDataRefactor: function(data) {
        return $.extend(data, this.data);
    },

    onAfterRendering: function(html) {
        var _self = this;
        _self.view = $(html);
 
        var idLayout = window.parameters.id;

        _self.layoutObject = _self.getData();
        
        _self.objetoInputs = {};

        for (var i in _self.layoutObject.blocks) {

            var blockName;
            if (_self.layoutObject.blocks[i].name) {
                blockName = _self.layoutObject.blocks[i].name;
                //console.log('blockName', blockName);
            }

            var openCloseBlock = "<div class='controladores'><div class='block' tabindex='0'><span>" + i18n("HIDE") + "</span></div><span class='btn-collapse icon icon-font-Sign-and-Symbols icon-downmenu'></span><span class='btn-expand icon icon-font-Sign-and-Symbols icon-upmenu'></span></div>";             //$('#paramManualList').append('<div class="bloco bloco'+i+'"><span>'+ i18n('BLOCK')+ " " + blockName+'</span>'+openCloseBlock+'<div class="registros"></div></div>');

            _self.objetoInputs[i] = {};

            for (var j in _self.layoutObject.blocks[i].records) {
                var recordName;
                if (_self.layoutObject.blocks[i].records[j].name) {
                    recordName = _self.layoutObject.blocks[i].records[j].name;
                }



                _self.objetoInputs[i][j] = {};

                if ($(".bloco" + i).length === 0)
                    $('#paramManualList').append('<div class="bloco bloco' + i + '"><span>' + i18n('BLOCK') + " " + blockName + '</span>' + openCloseBlock + '<div class="registros"></div></div>');
                $('#paramManualList .bloco' + i + ' .registros').append('<div class="registro registro' + j + '"><span>' + i18n('REGISTER') + " " + recordName + '</span></div>');
                for (var c in _self.layoutObject.blocks[i].records[j].columns) {

                    //console.log('columns',  _self.layoutObject.blocks[i].records[j].columns[c]);
                    var manualLabel;
                    var manualId;
                    var column = _self.layoutObject.blocks[i].records[j].columns[c];
                    if (column.hasOwnProperty('manualParam')) {
                        _self.addManualParam(i, j, c, column);
                    }
                    if (column.hasOwnProperty('fixedManualField')) {
                        _self.addFixedManualParam(i, j, c, column);
                    }
                    if(column.hasOwnProperty('concat')){
                        for (var index = 0; index < column.concat.positions.length; index++) {
                            var concatenatedColumn = column.concat.columns[column.concat.positions[index]];
                            var columnId = column.concat.positions[index];
                            if (concatenatedColumn.hasOwnProperty('manualParam')) {
                                _self.addManualParam(i, j, columnId, concatenatedColumn);
                            }
                        }
                    }
                }
            }

        }

        $('.bloco .controladores').click(function() {
            var registros = $(this).parent().find('.registros');
            if (registros.is(':visible')) {
                $(this).children('.block').children('span').html(i18n('SHOW'));
                $(this).children('.icon-downmenu').hide();
                $(this).children('.icon-upmenu').show();
                registros.hide();
            } else {
                $(this).children('.block').children('span').html(i18n("HIDE"));
                $(this).children('.icon-upmenu').hide();
                $(this).children('.icon-downmenu').show();
                registros.show();
            }
        });
    },

    addManualParam: function(blockId, recordId, columnId, column) {
        var _self = this;
        if(Object.keys(column.manualParam).length === 0 ){
            return;
        }
        $("#paramManualList .noParameters").hide();
        var manualLabel = column.manualParam.label;
        var manualLength = column.manualParam.length;

        var manualId = columnId;
        //console.log('manualLabel', manualLabel);
        //console.log('manualID', manualId);
        var iconSpan = '<div><span class="icon icon-font-Formatting-and-Tool icon-textandtext"></span></div>';
       
        $('#paramManualList .bloco' + blockId + ' .registros .registro' + recordId + '').append('<div class="parametro">'+'<div class="icon-ordered-list-tool">'+iconSpan+'</div><span class="label">' + manualLabel + ':</span><div id="input' + blockId + '_' + recordId + '_' + columnId + '" class="input"></div></div>');

        if (column.manualParam.type === "TIMESTAMP"){
            _self.objetoInputs[blockId][recordId][columnId] = $('#input' + blockId + '_' + recordId + '_' + manualId + '').bindBaseDatePicker({
                placeholder: "" + manualLabel + "",
                onChange: function() {}
            });
        } else {
            _self.objetoInputs[blockId][recordId][columnId] = $('#input' + blockId + '_' + recordId + '_' + manualId + '').bindBaseInput({
                placeholder: "" + manualLabel + "",
                onChange: function() {},
                validator: function(value) {
                    if (manualLength) {
                        return value.length <= parseInt(manualLength) || value.length === 0;
                    } else {
                        return true;
                    }
                }
            });
        }

    },

    addFixedManualParam: function(blockId, recordId, columnId, column) {
       if(!column.fixedManualField.options){
           column.fixedManualField.options = [];
       }
       
        var _self = this;
        $("#paramManualList .noParameters").hide();
        var manualLabel = column.fixedManualField.name;
        var iconSpan = '<span class="icon icon-font-Display-and-Setting icon-orderedlist"></span>';
        $('#paramManualList .bloco' + blockId + ' .registros .registro' + recordId + '').append('<div class="parametro"><div class="icon-ordered-list-tool">'+iconSpan+'</div><span class="label">' + manualLabel + ':</span><div id="input' + blockId + '_' + recordId + '_' + columnId + '" class="input"></div></div>');

        _self.objetoInputs[blockId][recordId][columnId] = $('#input' + blockId + '_' + recordId + '_' + columnId + '').bindBaseSelect({
            placeholder: "" + manualLabel + "",
            options: column.fixedManualField.options.map(function(element){
                if (element === "undefined") {
                   return {
                    key: "",
                    name:""
                } ;
                }
                else{
                return {
                    key: element.option,
                    name: element.option + " - " + element.description
                };}
            })

        });
        column.fixedManualField.options.forEach(function(element){
            if(element.checked){
                _self.objetoInputs[blockId][recordId][columnId].setKey(element.option);
                return;
            }
        });
    },

    getOwnData: function() {
        var _self = this;
        var ownData = {};

        for (var i in _self.layoutObject.blocks) {
            if (_self.layoutObject.blocks[i].name) {
                blockName = _self.layoutObject.blocks[i].name;
            }
            for (var j in _self.layoutObject.blocks[i].records) {
                if (_self.layoutObject.blocks[i].records[j].name) {
                    recordName = _self.layoutObject.blocks[i].records[j].name;
                }
                for (var c in _self.layoutObject.blocks[i].records[j].columns) {
                    if (_self.layoutObject.blocks[i].records[j].columns[c].hasOwnProperty('manualParam')) {
                        var isValid = _self.getManualParam(ownData, i, j, c, _self.layoutObject.blocks[i].records[j].columns[c]);
                        if(!isValid)
                            return false;
                    }
                    if (_self.layoutObject.blocks[i].records[j].columns[c].hasOwnProperty('fixedManualField')) {
                        var isValid = _self.getFixedManualParam(ownData, i, j, c, _self.layoutObject.blocks[i].records[j].columns[c]);
                        if(!isValid)
                            return false;
                    }
                    if(_self.layoutObject.blocks[i].records[j].columns[c].hasOwnProperty('concat')){
                        var column = _self.layoutObject.blocks[i].records[j].columns[c];
                        for (var index = 0; index < column.concat.positions.length; index++) {
                            var concatenatedColumn = column.concat.columns[column.concat.positions[index]];
                            var columnId = column.concat.positions[index];
                            if (concatenatedColumn.hasOwnProperty('manualParam')) {
                                isValid = _self.getManualParam(ownData, i, j, columnId, concatenatedColumn);
                                if(!isValid)
                                    return false;
                            }
                        }
                    }
                }
            }
        }
        return ownData;
    },

    getFixedManualParam: function(ownData, blockId, recordId, columnId, column){
        var _self = this;
        var manualLabel = column.fixedManualField.name;

        var value = _self.objetoInputs[blockId][recordId][columnId].getKey();
        var isRequired = column.fixedManualField.required;

        if (!isRequired || value) {
            ownData[columnId] = {
                "value": value ? value : ""
            };
            return true;
        } else {
            $.baseToast({
                text: i18n("PARAMETER") + " " + manualLabel + " " + i18n('REQUIRED'),
                isError: false,
                type: 'W'
            });
            return false;
        }
    },

    getManualParam: function(ownData, blockId, recordId, columnId, column){
        var _self = this;
        if(Object.keys(column.manualParam).length === 0 ){
            return true;
        }
        var manualLabel = column.manualParam.label;
        var manualId = columnId;

        var value = _self.objetoInputs[blockId][recordId][columnId].getValue();
        if(value.hanaDate){
            value = value.hanaDate;
        }
        var type = column.manualParam.type;
        var isValidated = _self.validateManualParam(value, type);
        if (type !== "TIMESTAMP"){
            if (!_self.objetoInputs[blockId][recordId][columnId].validate()) {
                $.baseToast({
                    text: i18n("DFG103000"),
                    isError: false,
                    type: 'W'
                });
                return false;
            }
        }
        if (isValidated === true) {
            if (type === "TIMESTAMP"){
                value = value.jsonDate !== undefined ? value.jsonDate : "";
            }
            ownData[columnId] = {
                "value": value
            };
            return true;
        } else {
            $.baseToast({
                text: i18n("PARAMETER") + " " + manualLabel + " " + i18n(isValidated),
                isError: false,
                type: 'W'
            });
            return false;
        }
    },

    validateManualParam: function(value, type) {
        var _simpleType = {
            DECIMAL: "NUMBER",
            INTEGER: "NUMBER",
            TINYINT: "NUMBER",
            VARCHAR: "STRING",
            NVARCHAR: "STRING",
            TEXT: "STRING",
            TIMESTAMP: "DATE",
            DATE: "DATE"
        };
        if (value === "") {
            return true;
        }
        switch (_simpleType[type]) {
            case "STRING":
                return true;
            case "NUMBER":
                if (type === "DECIMAL") {
                    if (!isNaN(value)) {
                        return true;
                    } else {
                        return "DFG204018";
                    }
                }
            case "DATE":
                return true;
        }

    },

    bindEvents: function() {
        var _self = this;
    },
    clearFields: function() {
        var _self = this;
        $("#paramManualList input").val("");
    }

});
