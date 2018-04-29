/*global i18n _ Data parseDate*/
sap.ui.controller("app.controllers.dialogs.NewFile", {
    onInit: function() {
        this.data = {
            description: {
                'class': "textarea-class",
                id: "textarea-id"
            }
        };
    },
    onDataRefactor: function(data) {
        if (data.type !== undefined && (data.type == 'setting' || data.type == 'an4'))
            data.fullType = true;
        if (data.type !== undefined && (data.type == 'setting' || data.type == 'layout'))
            data.slType = true;
        if (data.type !== undefined && (data.type == 'setting' || data.type == 'layout' || data.type == 'an4'))
            data.taxAll = true;
        return $.extend(data, this.data);
    },
    onAfterRendering: function(html) {
        var _self = this;
        this.loader = $('#create-file-dialog').parent().parent().baseLoader({
            modal: true
        });
        _self.view = $(html);

        _self.view.layoutCopyFrom = _self.view.find('#inputCopyFrom');
        _self.view.copyVersion = _self.view.find('#copiaVersion');
        _self.view.layoutName = _self.view.find('#inputTextFileName');
        _self.view.layoutDescription = _self.view.find('#textareaDescription');
        _self.view.layoutType = _self.view.find('#inputSelectTypeFile');
        _self.view.layoutStructureGroup = _self.view.find('#inputStructureParent');
        _self.view.layoutStructure = _self.view.find('#inputStructureChild');
        _self.view.layoutCompany = _self.view.find('#inputSelectCompany');
        _self.stateRadio = _self.view.find('.state');
        _self.federalRadio = _self.view.find('.federal');
        _self.view.layoutState = _self.view.find('#inputSelectState');
        _self.view.layoutBranch = _self.view.find('#inputSelectFilial');
        _self.view.layoutTax = _self.view.find('#inputSelectTax');
        _self.view.layoutRule = _self.view.find('#inputSelectRule');
        _self.view.file1 = _self.view.find('#inputfile1');
        _self.view.file2 = _self.view.find('#inputfile2');
        _self.view.layout1 = _self.view.find('#inputSelectLayout1');
        _self.view.layout2 = _self.view.find('#inputSelectLayout2');
        _self.view.version1 = _self.view.find("#inputSelectVersion1");
        _self.view.version2 = _self.view.find('#inputSelectVersion2');
        _self.view.validFrom = _self.view.find('#inputValidFrom');
        _self.view.validTo = _self.view.find('#inputValidTo');
        _self.view.layoutVersion = _self.view.find('#inputLayoutVersion');
        _self.view.timpVersion = _self.view.find('#inputTimpVersion');
        _self.view.subPeriod = _self.view.find('#subPeriodPic');
        _self.view.addFilter1 = _self.view.find('.btn-filter1');
        _self.view.addFilter2 = _self.view.find('.btn-filter2');
        _self.type = _self.getData().type === undefined ? 'layout' : _self.getData().type;
        _self.loader.open();
        this.addServices();
        _self.validTo;

        _self.validFrom;

        this.bindElements();
        _self.bindTooltips();
    },
    bindEvents: function() {
        var _self = this;
        _self.stateRadio.click(function() {
            _self.federalRadio.find('input').removeAttr('checked');
            _self.stateRadio.find('input').attr('checked', 'checked');
            //_self.renderStates();
            _self.view.layoutState.ctrl.enable();
            if (_self.company && _self.state)
                _self.view.layoutBranch.ctrl.enable();
        });
        _self.federalRadio.click(function() {
            _self.stateRadio.find('input').removeAttr('checked');
            _self.federalRadio.find('input').attr('checked', 'checked');
            _self.view.layoutState.ctrl.disable();
            _self.view.layoutBranch.ctrl.disable();
        });
    },
    addServices: function() {
        var self = this;
        self.coreServices._dataNewFile = {};
        self.coreServices.getData = function() {
            if (!self.validate()) {
                return false;
            }

            var data = {};
            data.name = self.view.layoutName.ctrl.getValue();
            data.description = self.view.layoutDescription.ctrl.val();
            data.type = self.view.layoutType.ctrl.getKey();
            self.coreServices._dataNewFile.description = self.view.layoutDescription.ctrl.val();
            if (self.type == 'layout') {
                data.structureGroup = self.view.layoutStructureGroup.ctrl.getKey();
                data.structure = self.view.layoutStructure.ctrl.getSelectIds();
                self.coreServices._dataNewFile.legalVersion = self.view.layoutVersion.ctrl.getValue();
            }

            if (self.type == 'setting') {
                var validFrom = self.view.validFrom.ctrl.getValue().hanaDate;
                var validTo = self.view.validTo.getValue().hanaDate;
                if (validTo) {
                    if (validFrom > validTo) {
                        $.baseToast({
                            type: 'W',
                            text: i18n('ERROR DATE RANGE')
                        });
                        return false;
                    }
                }

                data.company = self.view.layoutCompany.ctrl.getSelectIds();
                data.state = self.view.layoutState.ctrl.getSelectIds();
                data.branch = self.view.layoutBranch.ctrl.getSelectIds();
                data.validFrom = self.view.validFrom.ctrl.getValue().hanaDate;
                data.validTo = self.view.validTo.getValue().hanaDate;
                self.coreServices._dataNewFile.validTo = self.view.validTo.getValue().hanaDate;
            }
            if (self.type == 'an4') {
                self.coreServices._dataNewFile.description = self.view.layoutDescription.ctrl.val();
            }

            return data;
        };
    },
    bindElements: function() {
        var _self = this;
        //_self._loader.open();

        //Inputs that do not need Endpoint Data
        _self.view.layoutName.ctrl = _self.view.layoutName.bindBaseInput({
            isDisabled: _self.coreServices.exhibition,
            validatorType: 2,
            errorMsg: i18n('MANDATORY FIELD'),
            validator: function(value) {
                value = value.trim();
                return (value !== "");
            },
            required: true,
            onChange: function(oldVal, newVal) {
                _self.coreServices._dataNewFile.name = newVal;
            },
            tooltip: i18n(_self.type.toUpperCase() + ' NAME TOOLTIP'),
            placeholder: i18n(_self.type.toUpperCase() + ' ' + 'NAME PLACEHOLDER')
        });
        if (_self.type == 'layout') {
            _self.view.layoutVersion.ctrl = _self.view.layoutVersion.bindBaseInput({
                isDisabled: _self.coreServices.exhibition,
                validatorType: 2,
                errorMsg: i18n('MANDATORY FIELD'),
                validator: function(value) {
                    value = value.trim();
                    return (value !== "");
                },
                required: true,
                onChange: function(oldVal, newVal) {
                    _self.coreServices._dataNewFile.legalVersion = newVal;
                },
                tooltip: i18n('VERSION INPUT TOOLTIP'),
                placeholder: i18n('VERSION INPUT TOOLTIP')
            });

            _self.view.validFrom.ctrl = _self.view.validFrom.bindBaseDatePicker({
                isDisabled: _self.coreServices.exhibition,
                required: true,
                errorMsg: i18n('MANDATORY FIELD'),
                tooltip: i18n('TILE VALID FROM TOOLTIP'),
                placeholder: i18n('TILE VALID FROM PLACEHOLDER'),
                onChange: function(oldVal, newVal) {
                    var newDate = new Date(newVal.month + '/' + newVal.date + '/' + newVal.year);
                    if (newVal != '' && newDate !== 'Invalid Date') {
                        _self.view.validTo.ctrl.enable();
                        if (_self.view.validTo.ctrl.getDate()) {
                            _self.view.validTo.ctrl._validate();
                        }
                    } else {
                        _self.view.validTo.ctrl.disable();
                        _self.view.validTo.ctrl._cleanDate();
                    }
                    _self.coreServices._dataNewFile.validFrom = parseDate(newVal, "Date").toISOString();
                }
            });
            _self.view.validTo.ctrl = _self.view.validTo.bindBaseDatePicker({
                isDisabled: true,
                tooltip: i18n('TILE VALID TO TOOLTIP'),
                placeholder: i18n('TILE VALID TO PLACEHOLDER'),
                onChange: function(oldVal, newVal) {
                    var fdate = _self.view.validFrom.ctrl.getDate();
                    if (!fdate) {
                        this.showError(i18n('ERROR FILL IN DATE FROM'));
                        return false;
                    }
                    if (!_self.checkDateValidityRange(fdate.month + '/' + fdate.date + '/' + fdate.year, newVal)) {
                        this.showError(i18n('ERROR  DATE'));
                        return false;
                    } else {
                        this.hideError();
                        _self.coreServices._dataNewFile.validTo = parseDate(newVal, "Date").toISOString();
                        return true;
                    }
                }
            });
        }
        _self.view.layoutDescription.ctrl = _self.view.layoutDescription.find('textarea');
        _self.view.layoutDescription.ctrl.attr('placeholder', i18n(_self.type.toUpperCase() + " DESCRIPTION PLACEHOLDER"));

        if (_self.type == 'setting') {
            _self.view.validFrom.ctrl = _self.view.validFrom.bindBaseDatePicker({
                isDisabled: true,
                required: true,
                errorMsg: i18n('MANDATORY FIELD'),
                tooltip: i18n('TILE VALID FROM TOOLTIP'),
                placeholder: i18n('TILE VALID FROM PLACEHOLDER'),
                onChange: function(oldVal, newVal) {
                    // _self.view.validTo._cleanDate();
                    _self.view.validTo.hideError();
                    var dateFrom;
                    var dateTo;
                    if (_self.validFrom != null) {
                        dateFrom = new Date(_self.validFrom);
                    }
                    if (_self.validTo != null) {
                        dateTo = new Date(_self.validTo);
                    }
                    if (!dateFrom) {
                        this.hideError();
                        _self.view.validTo.enable();
                        _self.coreServices._dataNewFile.validFrom = parseDate(newVal, "Date");
                        return true;
                    }
                    if (!dateTo) {
                        if (!_self.checkDateValidityRange(dateFrom, newVal)) {
                            this.showError(i18n('ERROR DATE RANGE'));
                            return false;
                        } else {
                            this.hideError();
                            _self.view.validTo.enable();
                            _self.coreServices._dataNewFile.validFrom = parseDate(newVal, "Date");
                            return true;
                        }
                    } else {
                        if (!_self.checkDateValidityRangeSetting(dateFrom, newVal, dateTo)) {
                            this.showError(i18n('ERROR DATE SETTING'));
                            return false;
                        } else {
                            this.hideError();
                            _self.view.validTo.enable();
                            _self.view.validTo.setDate(parseDate(_self.coreServices._dataNewFile.validTo, "object"));
                            _self.coreServices._dataNewFile.validFrom = parseDate(newVal, "Date");
                            return true;
                        }
                    }
                }
            });
            _self.view.validTo = _self.view.validTo.bindBaseDatePicker({
                isDisabled: true,
                tooltip: i18n('TILE VALID TO TOOLTIP'),
                placeholder: i18n('TILE VALID TO PLACEHOLDER'),
                onChange: function(oldVal, newVal) {
                    var dateValidFrom = _self.view.validFrom.ctrl.getDate();
                    var fdate;
                    if (_self.validTo != null) {
                        fdate = new Date(_self.validTo);
                    };
                    if (!dateValidFrom) {
                        this.showError(i18n('ERROR FILL IN DATE FROM'));
                        return false;
                    }
                    if (!fdate) {
                        if (!_self.checkDateValidityRange(dateValidFrom.month + '/' + dateValidFrom.date + '/' + dateValidFrom.year, newVal)) {
                            this.showError(i18n('ERROR DATE RANGE'));
                            return false;
                        } else {
                            this.hideError();
                            _self.coreServices._dataNewFile.validTo = parseDate(newVal, "Date");
                            return true;
                        }
                    } else {
                        if (!_self.checkDateValidityRangeSetting(dateValidFrom.month + '/' + dateValidFrom.date + '/' + dateValidFrom.year, newVal, fdate)) {
                            this.showError(i18n('ERROR DATE SETTING'));
                            return false;
                        } else {
                            this.hideError();
                            _self.coreServices._dataNewFile.validTo = parseDate(newVal, "Date");
                            return true;
                        }
                    }
                }
            });
        }
        if (_self.type == 'an4') {
            _self.view.addFilter1.baseTooltip({
                text: i18n('CLICK PRESS TO') + i18n('ADD FILTER TITLE'),
                class: "dark",
                position: "top"
            });
            _self.view.addFilter2.baseTooltip({
                text: i18n('CLICK PRESS TO') + i18n('ADD FILTER TITLE'),
                class: "dark",
                position: "top"
            });
            _self.view.file1.ctrl = _self.view.file1.bindBaseSelect({
                isDisabled: _self.coreServices.exhibition,
                options: [],
                tooltip: i18n('FILE TOOLTIP'),
                placeholder: i18n('SELECT FILE'),
                isLoading: true,
                required: true
            });
            _self.view.file2.ctrl = _self.view.file2.bindBaseSelect({
                isDisabled: _self.coreServices.exhibition,
                options: [],
                tooltip: i18n('FILE STATE TOOLTIP'),
                placeholder: i18n('SELECT FILE'),
                isLoading: true,
                required: true
            });
        }
        _self.view.layoutCopyFrom.bindBaseAutocomplete({
            isDisabled: _self.coreServices.exhibition,
            options: [],
            tooltip: i18n('COPY FROM TOOLTIP'),
            placeholder: i18n('COPY FROM'),
            isLoading: true
        });
        _self.view.layoutType.ctrl = _self.view.layoutType.bindBaseSelect({
            isDisabled: _self.coreServices.exhibition,
            options: [],
            tooltip: i18n('LAYOUT TYPE TOOLTIP'),
            placeholder: i18n('LAYOUT TYPE'),
            isLoading: true,
            required: true
        });
        _self.view.layoutStructureGroup.bindBaseSelect({
            isDisabled: _self.coreServices.exhibition,
            options: [],
            tooltip: i18n('FILE STRUCTURE GROUP TOOLTIP'),
            placeholder: i18n('FILE STRUCTURE GROUP'),
            isLoading: true,
            required: true
        });
        _self.view.layout1.bindBaseSelect({
            options: [],
            tooltip: i18n('Layout 1 TOOLTIP'),
            placeholder: i18n('LAYOUT 1'),
            isDisabled: true,
            required: true
        });

        _self.view.layout2.bindBaseSelect({
            options: [],
            tooltip: i18n('Layout 2 TOOLTIP'),
            placeholder: i18n('LAYOUT 2'),
            isDisabled: true,
            required: true

        });
        _self.view.timpVersion.bindBaseSelect({
            options: [],
            required: _self.type != 'layout',
            tooltip: i18n('VERSION INPUT TOOLTIP'),
            placeholder: i18n('VERSION INPUT TOOLTIP'),
            isDisabled: true,
            isLoading: true
        });
        _self.view.version1.bindBaseSelect({
            options: [],
            tooltip: i18n('version 1 TOOLTIP'),
            placeholder: i18n('VERSION 1'),
            isDisabled: true,
            required: true

        });
        _self.view.version2.bindBaseSelect({
            options: [],
            tooltip: i18n('version 2 TOOLTIP'),
            placeholder: i18n('VERSION 2'),
            isDisabled: true,
            required: true

        });
        _self.view.layoutStructure.bindBaseSelect({
            options: [],
            tooltip: i18n('FILE STRUCTURE TOOLTIP'),
            placeholder: i18n('FILE STRUCTURE'),
            isDisabled: true,
            required: true
        });
        _self.view.layoutCompany.bindBaseSelect({
            isDisabled: _self.coreServices.exhibition,
            options: [],
            tooltip: i18n('FILE COMPANY TOOLTIP'),
            placeholder: i18n('FILE COMPANY'),
            isLoading: true,
            required: true
        });
        _self.view.layoutState.bindBaseSelect({
            isDisabled: _self.coreServices.exhibition,
            options: [],
            tooltip: i18n('FILE STATE TOOLTIP'),
            placeholder: i18n('FILE STATE'),
            isLoading: true,
            required: true
        });
        _self.view.layoutBranch.bindBaseSelect({
            options: [],
            tooltip: i18n('FILE BRANCH TOOLTIP'),
            placeholder: i18n('FILE BRANCH'),
            required: true,
            isDisabled: true
        });
        _self.view.layoutTax.bindBaseSelect({
            options: [],
            tooltip: i18n('FILE TAX TOOLTIP'),
            placeholder: i18n('FILE TAX'),
            required: true,
            isDisabled: true
        });
        if (_self.type == 'an4') {
            _self.view.layoutRule.bindBaseSelect({
                options: [],
                tooltip: i18n('FILE RULE TOOLTIP'),
                placeholder: i18n('FILE RULE'),
                required: true,
                isDisabled: true
            });
        }
        _self.coreServices.loadingData = true;
        if (_self.type == 'layout') {
            _self.view.css('overflow-y', 'auto');
            _self.controlFormCreateLayout();
        } else if (_self.type == 'setting') {
            _self.view.find('.envolve .left').eq(3).html(i18n('LAYOUTS'));
            _self.controlFormCreateSetting();
        } else if (_self.type == 'an4') {
            // _self.view.find('.envolve .left').eq(3).html(i18n('LAYOUTS'));
            _self.controlFormCreateAN4();
        }
        if (_self.getData().isEdit || _self.getData().isView) {
            _self.view.find('.envolve').eq(0).hide();
        }
    },
    bindCopyVersion: function() {
        var _self = this;
        _self.view.timpVersion.empty();
        _self.view.timpVersion.bindBaseSelect({
            options: [],
            required: _self.type != 'layout',
            tooltip: i18n('VERSION INPUT TOOLTIP'),
            placeholder: i18n('VERSION INPUT TOOLTIP'),
            isDisabled: true,
            isLoading: true
        });
        _self.view.copyVersion.text(i18n('TILE COPY LAYOUT VERSION'));
    },
    // validate: function() {
    //     var _self = this;
    //     var _formfields = [];
    //     var flag = true;

    //     _formfields.push(_self.view.validFrom.ctrl._validate());
    //     _formfields.push(_self.view.validTo.ctrl._validate());
    //     _formfields.push(_self.view.validTo._validate());
    //     if (!_self.view.validFrom.ctrl._validate())
    //         _self.view.validFrom.ctrl.showError();

    //     $.each(_formfields, function(ind, val) {
    //         if (val == false) {
    //             flag = false;
    //             return;
    //         }
    //     });
    //     return flag;
    // },
    checkDateValidityRange: function(beginRange, endRange) {
        if (endRange.year && endRange.month) {
            endRange = [endRange.month, endRange.date, endRange.year].join('/');
            if (beginRange !== null && endRange) {
                var date1 = (new Date(endRange)).toJSON();
                date1 = date1.split("T")[0];
                var date2 = (new Date(beginRange)).toJSON();
                date2 = date2.split("T")[0];
                if (date2 > date1) {
                    return false;
                }
            }
        }
        return true;
    },
    checkDateValidityRangeSetting: function(beginRange, DateCompare, endRange) {
        DateCompare = [DateCompare.month, DateCompare.date, DateCompare.year].join('/');

        if (beginRange !== null && DateCompare) {
            var date1 = (new Date(DateCompare)).toJSON();
            date1 = date1.split("T")[0];
            var date2 = (new Date(beginRange)).toJSON();
            date2 = date2.split("T")[0];
            if (date2 > date1) {
                return false;
            }
        }

        if (endRange !== null && !isNaN(endRange) && DateCompare) {
            var date1 = (new Date(DateCompare)).toJSON();
            date1 = date1.split("T")[0];
            var date2 = (new Date(endRange)).toJSON();
            date2 = date2.split("T")[0];
            if (date2 < date1) {
                return false;
            }
        }

        return true;

    },
    controlFormCreateLayout: function() {
        var _self = this;
        var _data = _self.getData();
        Data.endpoints.dfg.tax.post().success(function(data) {
            _self.taxData = data;
            Data.endpoints.dfg.layout.createDialog.post().success(function(data) {
                _self.coreServices.loadingData = false;
                _self.createDialogData = data;

                var options = data.list.map(function(val) {
                    return {
                        key: val.id,
                        name: "ID " + val.id + "-" + val.name
                    };
                });

                _self.view.layoutCopyFrom.empty();
                _self.view.layoutCopyFrom.ctrl = _self.view.layoutCopyFrom.bindBaseAutocomplete({
                    options: options,
                    tooltip: i18n('COPY FROM TOOLTIP'),
                    placeholder: i18n('COPY FROM'),
                    onChange: function(oldVal, newVal) {
                        _self.view.copyVersion.parent().removeClass("hidden-div");
                        _self.view.layoutName.ctrl.setText(i18n('COPY OF') + ' ' + newVal.name);
                        var currentLayoutCopy = data.list.filter(function(e) {
                            return e.id == newVal.key;
                        });
                        _self.setVersionOptions(newVal.key);
                        var structure = _self._getStructure(currentLayoutCopy[0].structure[0].id);
                        _self.view.layoutStructureGroup.ctrl.setKey(structure.key);
                        _self.view.layoutStructure.ctrl.setKey(currentLayoutCopy[0].structure.map(function(e) {
                            return e.id.toString();
                        }));
                        _self.view.layoutType.ctrl.setValue(currentLayoutCopy[0].digitalFileTypeText[0].name);
                        //disable selected selects
                        _self.view.layoutStructureGroup.ctrl.disable();
                        _self.view.layoutStructure.ctrl.disable();
                        _self.view.layoutType.ctrl.disable();

                        //set value in coreServices
                        _self.coreServices._dataNewFile.idCopy = newVal.key;
                        _self.bindCopyVersion();

                    }
                });

                options = data.digitalFileTypes.map(function(val) {
                    return {
                        key: val.id,
                        name: val.name
                    };
                });
                _self.view.layoutType.empty();
                _self.view.layoutType.ctrl = _self.view.layoutType.bindBaseSelect({
                    options: options,
                    tooltip: i18n('LAYOUT TYPE TOOLTIP'),
                    placeholder: i18n('LAYOUT TYPE'),
                    required: true,
                    isDisabled: _data.isExibition,
                    onChange: function(oldVal, newVal) {
                        _self.coreServices._dataNewFile.idDigitalFileType = newVal.key;
                    }
                });


                options = data.structures.map(function(val, idx) {
                    val.key = val.id;
                    val.name = val.title;
                    return val;
                });
                _self.view.layoutStructureGroup.empty();
                _self.view.layoutStructureGroup.ctrl = _self.view.layoutStructureGroup.bindBaseSelect({
                    options: options,
                    tooltip: i18n('FILE STRUCTURE GROUP TOOLTIP'),
                    placeholder: i18n('FILE STRUCTURE GROUP'),
                    required: true,
                    isDisabled: _data.isExibition,
                    onChange: function(oldVal, newVal) {
                        _self.coreServices._dataNewFile.idStructureGroup = newVal.id;
                        options = newVal.structure.map(function(val) {
                            val.key = val.id;
                            val.name = val.title;
                            return val;
                        });
                        _self.view.layoutStructure.empty();
                        
                        _self.view.layoutStructure.ctrl = _self.view.layoutStructure.bindBaseMultipleSelect3({
                            options: options,
                            tooltip: i18n('FILE STRUCTURE TOOLTIP'),
                            placeholder: i18n('FILE STRUCTURE'),
                            required: true,
                            onChange: function(newVal) {
                                var ids = [];
                                _self.coreServices._dataNewFile.idStructure = newVal.map(function(val) {
                                    ids.push(parseInt(val.id,10));
                                    return val.id;
                                });
                                if(_self.baseLayout){
                                    var newIds = [];
                                    var oldIds = [];
                                    var n = 0 ;
                                    for(var i = 0 ;i < ids.length;i++){
                                        if(_self.baseLayout.structures.indexOf(ids[i]) === -1 && (!_self.coreServices.layoutObject.newStructs || _self.coreServices.layoutObject.newStructs.indexOf(ids[i]) === -1)){
                                            newIds.push(ids[i]);
                                        }else{
                                            oldIds.push(ids[i]);
                                        }
                                    }
                                    if(_self.coreServices.layoutObject.newStructs){
                                        for(var i = 0 ; i < _self.baseLayout.structures.length; i++){
                                            if(_self.coreServices.layoutObject.newStructs.indexOf(_self.baseLayout.structures[i]) !== -1){
                                                n++;
                                            }
                                        }
                                    }
                                    if(oldIds.length !== _self.baseLayout.structures.length-n){
                                        _self.validStructs = false;
                                        delete _self.newStructs;
                                    }else{
                                        _self.validStructs = true;
                                        _self.newStructs = newIds;
                                    }
                                }
                                _self.view.layoutTax.parents(".envolve").empty();
                                // _self.view.layoutTax.crtl = _self.view.layoutTax.bindBaseSelect({
                                //     options: _self.taxData,
                                //     tooltip: i18n('FILE TAX TOOLTIP'),
                                //     placeholder: i18n('FILE TAX'),
                                //     required: true,
                                //     isDisabled: false
                                // });
                            }
                        });
                    }
                });

                _self.view.layoutStructure.empty();
                _self.view.layoutStructure.ctrl = _self.view.layoutStructure.bindBaseMultipleSelect3({
                    options: [],
                    tooltip: i18n('FILE STRUCTURE TOOLTIP'),
                    placeholder: i18n('FILE STRUCTURE'),
                    required: true,
                    isDisabled: _data.isExibition,
                    onChange: function(oldVal, newVal) {}
                });
                if (_self.getData().copyFrom !== undefined) {
                    _self.view.layoutCopyFrom.ctrl.setKey(_self.getData().copyFrom);
                }
                _self.loader.close();
                if (_data.isExibition === true) { 
                    var actualLayout = {
                        name: "",
                        description: "",
                        idStructureGroup: null,
                        structures: [],
                        validFrom: "",
                        validTo: "",
                        layoutVersion: ""
                    };
                    if (_data.hasOwnProperty("actualLayout")) {
                        $.extend(actualLayout, _data.actualLayout);

                        _self.view.layoutName.ctrl.disable();
                        _self.view.layoutDescription.ctrl.attr("disabled", "disabled");
                        $("textarea").css("background-color", "#F3F2F2");

                        _self.view.layoutType.ctrl.setValue(actualLayout.type);
                        if (actualLayout.idStructureGroup !== undefined && actualLayout.idStructureGroup !== null) {
                            actualLayout.idStructureGroup = actualLayout.idStructureGroup;
                        } else {
                            actualLayout.idStructureGroup = _self._getStructure(actualLayout.structure[0].idStructure).key;
                        }
                        actualLayout.structures = actualLayout.structure.map(function(item) {
                            return item.idStructure;
                        });
                        if(_self.coreServices.layoutObject.newStructs ){
                            actualLayout.structures  = actualLayout.structures.concat(_self.coreServices.layoutObject.newStructs);
                        }
                    } else {

                        $.extend(actualLayout, _self.coreServices.layoutObject);
                        _self.view.layoutType.ctrl.setKey(actualLayout.idDigitalFileType);

                        if (_data.idVersion) {


                            Data.endpoints.dfg.layout.getValidDates.post({
                                idVersion: _data.idVersion
                            }).success(function(_date) {
                                _date.forEach(function(_dates_item) {
                                    if (_dates_item.validityStart) {
                                        _self.view.validFrom.ctrl.setDate(_dates_item.validityStart);
                                        _self.view.validFrom.ctrl.disable();
                                    }
                                    if (_dates_item.validityFinish) {
                                        _self.view.validTo.ctrl.setDate(_dates_item.validityFinish);
                                        _self.view.validTo.ctrl.disable();
                                    }
                                

                                });
                            });

                            //Set version
                            actualLayout.internalVersion.forEach(function(versions) {
                                if (versions.id.toString() === _data.idVersion) {
                                    _self.view.layoutVersion.ctrl.setText(versions.version);
                                    _self.view.layoutVersion.ctrl.disable();
                                }
                            });

                        } else {
                            Data.endpoints.dfg.setting.getValidDates.post({
                                id: _data.idLayout
                            }).success(function(_dates) {
                                _dates.forEach(function(_dates_item) {
                                    if (_dates_item.validFrom) {
                                        _self.view.validFrom.ctrl.setDate(_dates_item.validFrom);
                                        _self.view.validFrom.ctrl.disable();
                                    }
                                    if (_dates_item.validTo) {
                                        _self.view.validTo.ctrl.setDate(_dates_item.validTo);
                                        _self.view.validTo.ctrl.disable();
                                    }

                                });
                            });

                            //Set version
                            actualLayout.internalVersion.forEach(function(versions) {
                                _self.view.layoutVersion.ctrl.setText(versions.version);
                                _self.view.layoutVersion.ctrl.disable();

                            });

                        }
    
                        if(!actualLayout.idStructureGroup){
                            actualLayout.idStructureGroup = _self._getStructure(actualLayout.structure[0].id).key;
                        }
                        actualLayout.structures = actualLayout.structure.map(function(item) {
                            return item.id;
                        });
                        if(_self.coreServices.layoutObject.newStructs ){
                            actualLayout.structures  = actualLayout.structures.concat(_self.coreServices.layoutObject.newStructs);
                        }
                    }

                    //Set Values
                    _self.baseLayout = actualLayout;
                    _self.validStructs = true;
                    _self.view.layoutName.ctrl.setText(actualLayout.name);
                    _self.view.layoutDescription.ctrl.val(actualLayout.description);
                    _self.view.layoutStructureGroup.ctrl.setKey(actualLayout.idStructureGroup);
                    _self.view.layoutStructure.ctrl.setKey(actualLayout.structures);
 



                    //Disable Fields and delete the unnecessary fields

                    _self.view.layoutCopyFrom.parents(".envolve").empty();
                    _self.view.timpVersion.parents(".envolve").empty();

                    _self.loader.close();

                }
                if (_data.view === true) {

                    _self.view.timpVersion.empty();
                    _self.view.copyVersion.empty();
                }
                if (_data.isLayoutVersion === true) {

                    var actualLayout = _self.coreServices.layoutObject;
                    _self.view.layoutCopyFrom.parents(".envolve").empty();
                    _self.view.timpVersion.parents(".envolve").empty();

                    _self.view.layoutName.ctrl.setText(actualLayout.name);
                    _self.view.layoutName.ctrl.disable();

                    _self.view.layoutType.ctrl.setKey(actualLayout.idDigitalFileType);
                    _self.view.layoutType.ctrl.disable();



                    _self.view.layoutStructureGroup.ctrl.setKey(actualLayout.idStructureGroup);
                    _self.view.layoutStructureGroup.ctrl.disable();
                    [0].parent;

                    var structures = actualLayout.structure.map(function(item) {
                        return item.id;
                    });
                    _self.view.layoutStructure.ctrl.setKey(structures);
                    _self.view.layoutStructure.ctrl.disable();
                }

                if (_data.fromLibrary) {
                    _self.view.layoutName.ctrl.disable();
                    _self.view.layoutDescription.ctrl.attr("disabled", "disabled");
                    $("textarea").css("background-color", "#F3F2F2");
                    _self.view.validFrom.ctrl.disable();
                    _self.view.validTo.ctrl.disable();
                }


            }).error(function(error) {
                _self.coreServices.loadingData = false;
                $.baseToast({
                    text: i18n('ERROR GETTING CREATE FIELDS'),
                    isError: true
                });
                _self.loader.close();
            });
        }).error(function(error) {
            _self.coreServices.loadingData = false;
            $.baseToast({
                text: i18n('ERROR GETTING CREATE FIELDS'),
                isError: true
            });
            _self.loader.close();
        });
    },
    controlFormCreateSetting: function() {
        var _self = this;
        if (_self.getData().isEdit || _self.getData().isView) {
            if (_self.getData().isEdit) {
                Data.endpoints.dfg.setting.editDialog.post().success(function(data) {
                    _self.coreServices.loadingData = false;
                    var options = data.layouts.list.map(function(val) {
                        return {
                            idDigitalFileType: val.idDigitalFileType,
                            key: val.id,
                            name: "ID " + val.id + "-" + val.name
                        };
                    });

                    //Layout type now it layouts
                    _self.view.layoutType.empty();
                    _self.view.layoutType.ctrl = _self.view.layoutType.bindBaseSelect({
                        options: options,
                        tooltip: i18n('SELECT LAYOUT TOOLTIP'),
                        placeholder: i18n('SELECT LAYOUT'),
                        required: true,
                        onChange: function(oldVal, newVal) {
                            _self.coreServices._dataNewFile.idLayout = newVal.key;
                            _self.coreServices._dataNewFile.idDigitalFileType = newVal.idDigitalFileType;

                            Data.endpoints.dfg.setting.getVersions.post({
                                idLayout: newVal.key
                            }).success(function(_versions) {
                                var _opt = [];
                                _versions.forEach(function(_versions_item) {
                                    _opt.push({
                                        key: _versions_item.id,
                                        name: _versions_item.version
                                    });
                                });
                                _self.view.timpVersion.empty();
                                _self.view.timpVersion.ctrl = _self.view.timpVersion.bindBaseSelect({
                                    options: _opt,
                                    required: true,
                                    onChange: function(oldVal, newVal) {
                                        _self.coreServices._dataNewFile.idLayoutVersion = newVal.key;
                                    },
                                    tooltip: i18n('VERSION INPUT TOOLTIP'),
                                    placeholder: i18n('VERSION INPUT TOOLTIP')
                                });
                            }).error(function() {});
                        }
                    });
                    _self._initializeElements(data);
                    _self.loader.close();
                });
            } else {

                _self.view.layoutType.empty();


                _self.view.layoutType.ctrl = _self.view.layoutType.bindBaseSelect({
                    options: [{
                        key: _self.getData().setting.layout.id,
                        name: "ID " + _self.getData().setting.layout.id + "-" + _self.getData().setting.layout.name
                    }],
                    tooltip: i18n('SELECT LAYOUT TOOLTIP'),
                    placeholder: i18n('SELECT LAYOUT'),
                    required: true,
                    isDisabled: true
                });
                _self.view.timpVersion.empty();
                _self.view.timpVersion.ctrl = _self.view.timpVersion.bindBaseSelect({
                    options: [{
                        key: _self.getData().setting.layout.legalVersion,
                        name: _self.getData().setting.layout.legalVersion
                    }],
                    required: true,
                    isDisabled: true,
                    tooltip: i18n('VERSION INPUT TOOLTIP'),
                    placeholder: i18n('VERSION INPUT TOOLTIP')
                });
                _self.loader.close();
            }
            var companyoptions = [];
            var ufoptions = [];
            var branchoptions = [];
            _self.companyKeys = [];
            _self.ufKeys = [];
            _self.branchKeys = [];
            $.each(_self.getData().setting.eefi, function(index, element) {
                var bool = true;
                var company = {
                    key: element.idCompany,
                    name: element.idCompany
                };
                var uf = {
                    key: element.uf,
                    name: element.uf
                };
                var branch = {
                    key: element.idBranch,
                    name: element.idBranch
                };
                for (var i = 0; i < companyoptions.length; i++) {
                    if (JSON.stringify(companyoptions[i]) === JSON.stringify(company)) {
                        bool = false;
                        break;
                    }
                }
                if (bool) {
                    companyoptions.push(company);
                    _self.companyKeys.push(element.idCompany);
                } else
                    bool = true;
                for (var i = 0; i < ufoptions.length; i++) {
                    if (JSON.stringify(ufoptions[i]) === JSON.stringify(uf)) {
                        bool = false;
                        break;
                    }
                }
                if (bool) {
                    ufoptions.push(uf);
                    _self.ufKeys.push(element.uf);
                } else
                    bool = true;
                for (var i = 0; i < branchoptions.length; i++) {
                    if (JSON.stringify(branchoptions[i]) === JSON.stringify(branch)) {
                        bool = false;
                        break;
                    }
                }
                if (bool) {
                    branchoptions.push(branch);
                    _self.branchKeys.push(element.idBranch);
                } else
                    bool = true;

            });

            _self.view.layoutCompany.empty();
            _self.view.layoutCompany.ctrl = _self.view.layoutCompany.bindBaseMultipleSelect3({
                tooltip: i18n('FILE COMPANY TOOLTIP'),
                placeholder: i18n('FILE COMPANY'),
                options: companyoptions,
                required: true

            });

            _self.view.layoutState.empty();
            _self.view.layoutState.ctrl = _self.view.layoutState.bindBaseMultipleSelect3({
                options: ufoptions,
                tooltip: i18n('FILE STATE TOOLTIP'),
                placeholder: i18n('FILE STATE'),
                required: true,
                isDisabled: true
            });

            _self.view.layoutBranch.empty();
            _self.view.layoutBranch.ctrl = _self.view.layoutBranch.bindBaseMultipleSelect3({
                options: branchoptions,
                tooltip: i18n('FILE BRANCH TOOLTIP'),
                placeholder: i18n('FILE BRANCH'),
                required: true,
                isDisabled: true
            });
            var optionctrl = [];
            optionctrl.push({
                key: _self.getData().setting.eefi[0].idTax,
                name: _self.getData().setting.tax
            });
            _self.view.layoutTax.empty();
            _self.view.layoutTax.ctrl = _self.view.layoutTax.bindBaseSelect({
                options: optionctrl,
                tooltip: i18n('FILE TAX TOOLTIP'),
                placeholder: i18n('FILE TAX'),
                required: true,
                isDisabled: true
            });
            if (_self.getData().isView)
                _self._initializeElements();

        } else {
            //View/Edit selected setting info
            if (_self.getData().content && _self.getData().operation) {
                Data.endpoints.dfg.setting.createDialog.post().success(function(data) {
                    var content = _self.getData().content;
                    _self.coreServices._updatedSetting = $.extend({}, content); //Object.assign({}, content);
                    _self.coreServices.layoutObject = {};
                    var viewMode = (_self.getData().operation === 'isViewing') ? true : false;

                    var setLayoutOption = function() {
                        var ownLayout = [];
                        var allLayouts = data.layouts.map(function(layout) {
                            return {
                                key: layout.id,
                                name: 'ID ' + layout.id + '-' + layout.name
                            };
                        });

                        if (content.version.length) {
                            var layoutId = content.version[0].idLayout;
                            var layout = data.layouts.filter(function(value) {
                                return value.id == layoutId;
                            });

                            if (layout.length) {
                                ownLayout = [{
                                    key: layout[0].id,
                                    name: 'ID ' + layoutId + '-' + layout[0].name
                                }];
                            }
                        }

                        _self.view.layoutType.empty();
                        _self.view.layoutType.ctrl = _self.view.layoutType.bindBaseSelect({
                            options: allLayouts,
                            tooltip: i18n('LAYOUT TYPE TOOLTIP'),
                            placeholder: i18n('LAYOUT TYPE'),
                            required: true,
                            isDisabled: viewMode,
                            onChange: function(oldVal, newVal) {
                                if (_self.coreServices._updatedSetting.version.length) {
                                    _self.coreServices._updatedSetting.version[0].idLayout = newVal.key;
                                }

                                _self.view.timpVersion.empty();
                                _self.view.timpVersion.ctrl = _self.view.timpVersion.bindBaseSelect({
                                    options: [],
                                    required: true,
                                    tooltip: i18n('VERSION INPUT TOOLTIP'),
                                    placeholder: i18n('VERSION INPUT TOOLTIP'),
                                    isDisabled: viewMode
                                });

                                Data.endpoints.dfg.setting.getVersions.post({
                                    idLayout: newVal.key
                                }).success(function(_versions) {
                                    var versions = _versions.map(function(value) {
                                        return {
                                            key: value.version,
                                            name: value.version
                                        };
                                    });

                                    _self.view.timpVersion.empty();
                                    _self.view.timpVersion.ctrl = _self.view.timpVersion.bindBaseSelect({
                                        options: versions,
                                        required: true,
                                        tooltip: i18n('VERSION INPUT TOOLTIP'),
                                        placeholder: i18n('VERSION INPUT TOOLTIP'),
                                        isDisabled: viewMode
                                    });

                                    _self.view.timpVersion.ctrl.setValue(versions.length ? versions[0].name : []);
                                }).error(function() {});
                            }
                        });

                        //just options that are in common between the endpoint result and the saved data
                        var validOwnLayout = ownLayout.filter(function(layout) {
                            return allLayouts.map(function(e) {
                                return e.name;
                            }).indexOf(layout.name) > -1;
                        });

                        _self.view.layoutType.ctrl.setValue(validOwnLayout.length ? validOwnLayout[0].name : []);
                    };

                    var setCompaniesOptions = function() {
                        var allCompanies = data.companies;
                        var ownCompanies = [];

                        content.EEFI.forEach(function(value) {
                            if (ownCompanies.map(function(e) {
                                    return e.name;
                                }).indexOf(value.idCompany) === -1) {
                                ownCompanies.push({
                                    key: value.idCompany,
                                    name: value.idCompany
                                });
                            }
                        });

                        _self.view.layoutCompany.empty();
                        _self.view.layoutCompany.ctrl = _self.view.layoutCompany.bindBaseMultipleSelect3({
                            tooltip: i18n('FILE COMPANY TOOLTIP'),
                            placeholder: i18n('FILE COMPANY'),
                            options: allCompanies.map(function(company) {
                                company.key = company.id;
                                return company;
                            }),
                            required: true,
                            isDisabled: viewMode,
                            onChange: function(oldVal, newVal) {
                                _self._renderSettingsSelectsEmpty();

                                if ((newVal && newVal.length) || (oldVal && oldVal.length && !newVal)) {
                                    setStatesOptions();
                                }
                            }
                        });

                        //just options that are in common between the endpoint result and the saved data
                        var validOwnCompanies = ownCompanies.filter(function(company) {
                            return allCompanies.map(function(e) {
                                return e.name;
                            }).indexOf(company.name) > -1;
                        });

                        _self.view.layoutCompany.ctrl.setValue(validOwnCompanies.map(function(e) {
                            return e.name;
                        }));
                    };

                    var setStatesOptions = function() {
                        var selectedCompanies = _self.view.layoutCompany.ctrl.getValue();

                        Data.endpoints.dfg.uf.post({
                            idCompany: selectedCompanies,
                        }).success(function(allStates) {
                            var ownStates = [];

                            selectedCompanies.forEach(function(selectedCompany) {
                                content.EEFI.forEach(function(value) {
                                    if ((selectedCompany == value.idCompany) &&
                                        (ownStates.map(function(e) {
                                            return e.name;
                                        }).indexOf(value.uf) === -1)) {
                                        ownStates.push({
                                            key: value.uf,
                                            name: value.uf
                                        });
                                    }
                                });
                            });

                            _self.view.layoutState.empty();
                            _self.view.layoutState.ctrl = _self.view.layoutState.bindBaseMultipleSelect3({
                                tooltip: i18n('FILE STATE TOOLTIP'),
                                placeholder: i18n('FILE STATE'),
                                options: allStates.map(function(state) {
                                    state.key = state.id;
                                    return state;
                                }),
                                required: true,
                                isDisabled: viewMode,
                                onChange: function(oldVal, newVal) {
                                    _self._renderSettingsSelectsEmpty('uf');

                                    if ((newVal && newVal.length) || (oldVal && oldVal.length && !newVal)) {
                                        setBranchesOptions();
                                    }
                                }
                            });

                            //just options that are in common between the endpoint result and the saved data
                            var validOwnStates = ownStates.filter(function(state) {
                                return allStates.map(function(e) {
                                    return e.name;
                                }).indexOf(state.name) > -1;
                            });

                            _self.view.layoutState.ctrl.setValue(validOwnStates.map(function(e) {
                                return e.name;
                            }));
                        });
                    };

                    var setBranchesOptions = function() {
                        var selectedCompanies = _self.view.layoutCompany.ctrl.getValue();
                        var selectedStates = _self.view.layoutState.ctrl.getValue();

                        Data.endpoints.dfg.branch.post({
                            idCompany: selectedCompanies,
                            uf: selectedStates
                        }).success(function(allBranches) {
                            var ownBranches = [];

                            selectedCompanies.forEach(function(selectedCompany) {
                                selectedStates.forEach(function(selectedState) {
                                    content.EEFI.forEach(function(value) {
                                        if ((selectedCompany == value.idCompany && selectedState == value.uf) &&
                                            (ownBranches.map(function(e) {
                                                return e.name;
                                            }).indexOf(value.idBranch) === -1)) {
                                            ownBranches.push({
                                                key: selectedCompany + selectedState + value.idBranch,
                                                name: value.idBranch
                                            });
                                        }
                                    });
                                });
                            });

                            _self.view.layoutBranch.empty();
                            _self.view.layoutBranch.ctrl = _self.view.layoutBranch.bindBaseMultipleSelect3({
                                tooltip: i18n('FILE BRANCH TOOLTIP'),
                                placeholder: i18n('FILE BRANCH'),
                                options: allBranches.map(function(branch) {
                                    branch.key = branch.idCompany + branch.uf + branch.id;
                                    return branch;
                                }),
                                required: true,
                                isDisabled: viewMode,
                                onChange: function(oldVal, newVal) {
                                    _self.coreServices._updatedSetting.newEEFI = !newVal ? oldVal : newVal;
                                    _self._renderSettingsSelectsEmpty('branch');

                                    if ((newVal && newVal.length) || (oldVal && oldVal.length && !newVal)) {
                                        setTaxesOptions();
                                    }
                                }
                            });

                            //just options that are in common between the endpoint result and the saved data
                            var validOwnBranches = ownBranches.filter(function(branch) {
                                return allBranches.map(function(e) {
                                    return e.name;
                                }).indexOf(branch.name) > -1;
                            });

                            _self.view.layoutBranch.ctrl.setKey(validOwnBranches.map(function(e) {
                                return e.key;
                            }));
                        });
                    };

                    var setTaxesOptions = function() {
                        Data.endpoints.dfg.tax.post().success(function(allTaxes) {
                            var ownTaxes = [];

                            content.EEFI.forEach(function(value) {
                                if (value.idTax) {
                                    ownTaxes.push({
                                        key: value.idTax,
                                        name: value.idTax
                                    });

                                    return;
                                }
                            });

                            _self.view.layoutTax.empty();
                            _self.view.layoutTax.ctrl = _self.view.layoutTax.bindBaseSelect({
                                tooltip: i18n('FILE TAX TOOLTIP'),
                                placeholder: i18n('FILE TAX'),
                                options: allTaxes,
                                required: true,
                                isDisabled: viewMode,
                                onChange: function(oldVal, newVal) {
                                    _self.coreServices._updatedSetting.newEEFI = _self.coreServices._updatedSetting.newEEFI.map(function(e, i) {
                                        e.idBranch = e.id;
                                        e.isTaxGroup = newVal.key.match(/^[0-9]+G$/g) != null;
                                        e.idTax = newVal.key.match(/^[0-9]+G/g) ? newVal.key.substring(0, newVal.key.length - 1) : newVal.key;
                                        e.idSettingVersion = _self.coreServices._updatedSetting.version.length ? _self.coreServices._updatedSetting.version[0].id : null;
                                        return e;
                                    });
                                }
                            });

                            //just options that are in common between the endpoint result and the saved data
                            var validOwnTaxes = ownTaxes.filter(function(tax) {
                                return allTaxes.map(function(e) {
                                    return e.name;
                                }).indexOf(tax.name) > -1;
                            });

                            _self.view.layoutTax.ctrl.setValue(validOwnTaxes.length ? validOwnTaxes[0].name : []);
                        });
                    };

                    _self.view.layoutCopyFrom.empty();
                    _self.view.layoutCopyFrom.ctrl = _self.view.layoutCopyFrom.bindBaseAutocomplete({
                        options: [],
                        tooltip: i18n('COPY FROM TOOLTIP'),
                        placeholder: i18n('COPY FROM'),
                        onChange: function(oldVal, newVal) {}
                    });

                    _self.view.layoutName.ctrl.setText(content.name);
                    _self.view.layoutDescription.ctrl.val(content.description);

                    _self.view.validFrom.empty();
                    _self.view.validFrom.ctrl = _self.view.validFrom.bindBaseDatePicker({
                        required: true,
                        errorMsg: i18n('MANDATORY FIELD'),
                        tooltip: i18n('TILE VALID FROM TOOLTIP'),
                        placeholder: i18n('TILE VALID FROM PLACEHOLDER'),
                        onChange: function(oldVal, newVal) {
                            var newDate = new Date(newVal.month + '/' + newVal.date + '/' + newVal.year);

                            if (_self.coreServices._updatedSetting.version.length) {
                                _self.coreServices._updatedSetting.version[0].validFrom = newDate.toISOString();
                            }
                        }
                    });

                    _self.view.validTo = _self.view.find('#inputValidTo');
                    _self.view.validTo.empty();
                    _self.view.validTo = _self.view.validTo.bindBaseDatePicker({
                        required: true,
                        errorMsg: i18n('MANDATORY FIELD'),
                        tooltip: i18n('TILE VALID TO TOOLTIP'),
                        placeholder: i18n('TILE VALID TO PLACEHOLDER'),
                        onChange: function(oldVal, newVal) {
                            var newDate = new Date(newVal.month + '/' + newVal.date + '/' + newVal.year);

                            if (_self.coreServices._updatedSetting.version.length) {
                                _self.coreServices._updatedSetting.version[0].validTo = newDate.toISOString();
                            }
                        }
                    });

                    if (content.version.length) {
                        _self.view.validFrom.ctrl.setDate(new Date(content.version[0].validFrom));

                        var validTo = new Date(content.version[0].validTo);

                        if (validTo.getDate()) {
                            _self.view.validTo.setDate(validTo);
                        }
                    }

                    setLayoutOption();
                    setCompaniesOptions();

                    if (viewMode) {
                        _self.view.layoutCopyFrom.ctrl.disable();
                        _self.view.layoutName.ctrl.disable();
                        _self.view.layoutDescription.ctrl.attr("disabled", "disabled");
                        $("textarea").css("background-color", "#F3F2F2");
                        _self.view.validFrom.ctrl.disable();
                        _self.view.validTo.disable();
                    } else {
                        _self.view.layoutCopyFrom.ctrl.disable();
                        _self.view.validFrom.ctrl.enable();
                        _self.view.validTo.enable();
                    }

                    _self.loader.close();
                });
            } else {
                Data.endpoints.dfg.setting.createDialog.post().success(function(data) {

                    _self.coreServices.loadingData = false;

                    var options = data.list.map(function(val) {
                        return {
                            key: val.id,
                            name: val.name
                        };
                    });
                    _self.view.layoutCopyFrom.empty();
                    _self.view.layoutCopyFrom.ctrl = _self.view.layoutCopyFrom.bindBaseAutocomplete({
                        options: options,
                        tooltip: i18n('COPY FROM TOOLTIP'),
                        placeholder: i18n('COPY FROM'),
                        onChange: function(oldVal, newVal) {
                            var currentLayoutCopy = data.list.filter(function(e) {
                                return e.id == newVal.key;
                            });
                            _self.setVersionOptions(newVal.key);
                            _self.view.layoutName.ctrl.setText(i18n('COPY OF') + ' ' + newVal.name);
                            _self.view.layoutType.ctrl.setKey(currentLayoutCopy[0].layout.idLayout);
                            _self.view.layoutType.ctrl.disable();

                            _self.bindCopyVersion();
                            //other part
                            var effiStructure = _self._getEefiStructure(currentLayoutCopy[0].eefi);
                            var keysCompany = Object.keys(effiStructure);
                            var keysUf = [];
                            var keysBranch = [];
                            var tax = false;
                            //clean the options
                            _self.coreServices._dataNewFile.idCompany = [];
                            _self.coreServices._dataNewFile.uf = [];
                            _self.coreServices._dataNewFile.eefi = [];

                            //setkey and callbacks                    
                            Object.keys(effiStructure).forEach(function(company) {
                                Object.keys(effiStructure[company]).forEach(function(uf) {
                                    if (keysUf.indexOf(uf) == -1) {
                                        keysUf.push(uf);
                                    }
                                    Object.keys(effiStructure[company][uf]).forEach(function(branch) {
                                        if (keysBranch.indexOf(branch) == -1) {
                                            keysBranch.push(company + uf + branch);
                                        }
                                        if (!tax) {
                                            tax = effiStructure[company][uf][branch]["tax"];
                                        }
                                    });
                                });
                            });
                            _self.callbacksSettings = {
                                callbackCompany: {
                                    ready: false,
                                    keysCompany: keysCompany,
                                    callback: function() {
                                        _self.view.layoutState.ctrl.setKey(keysUf);
                                        //_self.view.selectUf.ctrl.disable();  
                                    }
                                },
                                callbackUf: {
                                    ready: false,
                                    keysUf: keysUf,
                                    callback: function() {
                                        _self.view.layoutBranch.ctrl.setKey(keysBranch);
                                        //_self.view.selectBranch.ctrl.disable();
                                    }
                                },
                                callbackBranch: {
                                    ready: false,
                                    keysBranch: keysBranch,
                                    callback: function() {
                                        _self.view.layoutTax.ctrl.setKey(tax);
                                        //_self.view.selectTax.ctrl.disable();
                                    }
                                }
                            };
                            // _self.view.selectCompany.ctrl.setKey(currentLayoutCopy[0].eefi[0].idCompany);
                            //disable                   
                            // _self.renderSettings(newVal.key);
                            _self.view.layoutCompany.ctrl.setKey(keysCompany);
                            _self.coreServices._dataNewFile.idCopy = newVal.key;
                        }
                    });

                    options = data.layouts.map(function(val) {
                        return {
                            idDigitalFileType: val.idDigitalFileType,
                            key: val.id,
                            name: "ID " + val.id + "-" + val.name
                        };
                    });

                    //Layout type now it layouts
                    _self.view.layoutType.empty();
                    _self.view.layoutType.ctrl = _self.view.layoutType.bindBaseSelect({
                        options: options,
                        tooltip: i18n('SELECT LAYOUT TOOLTIP'),
                        placeholder: i18n('SELECT LAYOUT'),
                        required: true,
                        onChange: function(oldVal, newVal) {
                            _self.view.validFrom.ctrl._cleanDate();
                            _self.view.validFrom.ctrl.enable();
                            _self.view.validTo._cleanDate();
                            _self.coreServices._dataNewFile.idLayout = newVal.key;
                            _self.coreServices._dataNewFile.idDigitalFileType = newVal.idDigitalFileType;

                            Data.endpoints.dfg.setting.getVersions.post({
                                idLayout: newVal.key
                            }).success(function(_versions) {
                                var _opt = [];
                                _versions.forEach(function(_versions_item) {
                                    _opt.push({
                                        key: _versions_item.id,
                                        name: _versions_item.version
                                    });
                                });
                                _self.view.timpVersion.empty();
                                _self.view.timpVersion.ctrl = _self.view.timpVersion.bindBaseSelect({
                                    options: _opt,
                                    required: true,
                                    onChange: function(oldVal, newVal) {
                                        _self.coreServices._dataNewFile.idLayoutVersion = newVal.key;
                                    },
                                    tooltip: i18n('VERSION INPUT TOOLTIP'),
                                    placeholder: i18n('VERSION INPUT TOOLTIP')
                                });
                            });

                            // This control the date of valid from with respect to Layout  
                            Data.endpoints.dfg.setting.getValidDates.post({
                                id: newVal.key
                            }).success(function(_dates) {
                                _self.validFrom = null;
                                _self.validTo = null;
                                _dates.forEach(function(_dates_item) {
                                    _self.validFrom = _dates_item.validFrom,
                                        _self.validTo = _dates_item.validTo;
                                });
                            });
                        }
                    });

                    _self.view.layoutCompany.empty();
                    _self.view.layoutCompany.ctrl = _self.view.layoutCompany.bindBaseMultipleSelect3({
                        tooltip: i18n('FILE COMPANY TOOLTIP'),
                        placeholder: i18n('FILE COMPANY'),
                        options: data.companies.map(function(e) {
                            return {
                                id: e.id,
                                key: e.id,
                                name: e.name
                            };
                        }),
                        required: true,
                        onChange: _self._onChangeCompanySettings.bind(_self)
                    });
                    _self.view.layoutState.empty();
                    _self.view.layoutState.ctrl = _self.view.layoutState.bindBaseSelect({
                        options: [],
                        tooltip: i18n('FILE STATE TOOLTIP'),
                        placeholder: i18n('FILE STATE'),
                        required: true,
                        isDisabled: true
                    });

                    _self.view.layoutBranch.empty();
                    _self.view.layoutBranch.crtl = _self.view.layoutBranch.bindBaseSelect({
                        options: [],
                        tooltip: i18n('FILE BRANCH TOOLTIP'),
                        placeholder: i18n('FILE BRANCH'),
                        required: true,
                        isDisabled: true
                    });

                    _self.view.layoutTax.empty();
                    _self.view.layoutTax.crtl = _self.view.layoutTax.bindBaseSelect({
                        options: [],
                        tooltip: i18n('FILE TAX TOOLTIP'),
                        placeholder: i18n('FILE TAX'),
                        required: true,
                        isDisabled: true
                    });
                    if (_self.getData().isEdit) {
                        _self._initializeElements(data);
                    } else {
                        _self.loader.close();
                    }

                    if (_self.getData().copyFrom !== undefined) {
                        setTimeout(function() {
                            _self.view.layoutCopyFrom.ctrl.setKey(_self.getData().copyFrom);
                        }, 10);
                    }
                }).error(function(error) {
                    _self.coreServices.loadingData = false;
                    $.baseToast({
                        text: i18n('ERROR GETTING CREATE FIELDS'),
                        isError: true
                    });
                    _self.loader.close();
                });
            }
        }

    },
    controlFormCreateAN4: function() {
        var _self = this;
        _self.coreServices.an4data = {};
        Data.endpoints.dfg.an4.createDialog.post().success(function(data) {
            _self.coreServices.loadingData = false;

            _self.view.layoutRule.empty();

            _self.view.layoutRule.ctrl = _self.view.layoutRule.bindBaseSelect({
                options: data.rules.map(function(e) {
                    return {
                        key: e.id,
                        name: e.name
                    };
                }),
                tooltip: i18n('FILE RULE TOOLTIP'),
                placeholder: i18n('FILE RULE'),
                required: true,
                isDisabled: false,
                onChange: function(oldVal, newVal) {

                    _self.coreServices._dataNewFile.idRule = newVal.key;
                    _self.coreServices.an4data.idRule = newVal.key;
                    Data.endpoints.dfg.an4.listLayoutsbyRule.post({
                        id: newVal.key
                    }).success(function(data2) {

                        _self.view.layout1.empty();
                        _self.dialogFilter = $.baseDialog({
                            title: i18n('ADD FILTER TITLE'),
                            modal: true,
                            size: "big",
                            outerClick: 'disabled',
                            cssClass: "newFile",
                            viewName: "app.views.dialogs.eefiDialog",
                            viewData: {
                                type: 'an4',
                                idRule: _self.coreServices._dataNewFile.idRule

                            },
                            buttons: [{
                                name: i18n('CANCEL'),
                                isCloseButton: true,
                                tooltip: i18n('CLICK PRESS CANCEL'),
                                click: function() {

                                }
                            }, {
                                name: i18n('ADD'),
                                click: function() {
                                    var data = _self.dialogFilter.getInnerController().getEefi();
                                    Data.endpoints.dfg.an4.listFilesByRule.post(data.eefiData).success(function(res) {
                                        if (data.side === 'left') {
                                            _self.view.file1.empty();
                                            _self.view.file1.ctrl = _self.view.file1.bindBaseSelect({
                                                options: res.leftFiles.map(function(object) {
                                                    return {
                                                        key: object.id,
                                                        name: object.name
                                                    };
                                                }),
                                                tooltip: i18n('CLICK PRESS TO') + i18n('SELECT') + i18n('FILE 1'),
                                                placeholder: i18n('FILE 1'),
                                                isDisabled: false,
                                                required: true,
                                                onChange: function(oldVal, newVal) {
                                                    _self.coreServices._dataNewFile.files1 = newVal.key;

                                                }
                                            });

                                        } else {
                                            _self.view.file2.empty();
                                            _self.view.file2.ctrl = _self.view.file2.bindBaseSelect({
                                                options: res.leftFiles.map(function(object) {
                                                    return {
                                                        key: object.id,
                                                        name: object.name
                                                    };
                                                }),
                                                tooltip: i18n('CLICK PRESS TO') + i18n('SELECT') + i18n('FILE 2'),
                                                placeholder: i18n('FILE 2'),
                                                isDisabled: false,
                                                required: true,
                                                onChange: function(oldVal, newVal) {
                                                    _self.coreServices._dataNewFile.files2 = newVal.key;

                                                }
                                            });



                                        }
                                    });

                                    _self.dialogFilter.close();
                                },
                                tooltip: i18n('CLICK PRESS CONFIRM')
                            }]
                        });
                        _self.view.addFilter1.bind("click", function() {
                            _self.dialogFilter.open();
                            _self.dialogFilter.getInnerController().setLayout(data2.leftLayout.id, 'left');
                        });
                        _self.view.addFilter2.bind("click", function() {
                            _self.dialogFilter.open();
                            _self.dialogFilter.getInnerController().setLayout(data2.rightLayout.id, 'right');
                        });
                        var indexRule;
                        $.each(data.rules, function(index, element) {
                            if (element.id === newVal.key)
                                indexRule = index;
                        });
                        _self.view.layout1.ctrl = _self.view.layout1.bindBaseSelect({
                            options: [{
                                key: data2.leftLayout.id,
                                name: data2.leftLayout.name
                            }],
                            tooltip: i18n('Layout 1 TOOLTIP'),
                            placeholder: i18n('LAYOUT 1'),
                            isDisabled: false,
                            required: true,
                            onChange: function(oldVal, newVal) {
                                _self.coreServices.an4data.idLeftFile = newVal.key;
                            }
                        });
                        _self.view.layout1.ctrl.setKey(data2.leftLayout.id);
                        _self.view.layout2.empty();
                        _self.view.layout2.ctrl = _self.view.layout2.bindBaseSelect({
                            options: [{
                                key: data2.rightLayout.id,
                                name: data2.rightLayout.name
                            }],
                            tooltip: i18n('Layout 2 TOOLTIP'),
                            placeholder: i18n('LAYOUT 2'),
                            isDisabled: false,
                            required: true,
                            onChange: function(oldVal, newVal) {
                                _self.coreServices.an4data.idRightFile = newVal.key;

                            }

                        });
                        _self.view.layout2.ctrl.setKey(data2.rightLayout.id);
                        Data.endpoints.dfg.an4.listFilesByRule.post({
                            idRule: _self.coreServices.an4data.idRule,
                            idLayout1: data2.leftLayout.id,
                            idLayout2: data2.rightLayout.id
                        }).success(function(data) {
                            _self.view.file1.empty();
                            _self.view.file1.ctrl = _self.view.file1.bindBaseSelect({
                                options: data.leftFiles.map(function(object) {
                                    return {
                                        key: object.id,
                                        name: object.name
                                    };
                                }),
                                tooltip: i18n('CLICK PRESS TO') + i18n('SELECT') + i18n('FILE 1'),
                                placeholder: i18n('FILE 1'),
                                isDisabled: false,
                                required: true,
                                onChange: function(oldVal, newVal) {
                                    _self.coreServices._dataNewFile.idLeftFile = newVal.key;

                                }
                            });
                            _self.view.file2.empty();
                            _self.view.file2.ctrl = _self.view.file2.bindBaseSelect({
                                options: data.rightFiles.map(function(object) {
                                    return {
                                        key: object.id,
                                        name: object.name
                                    };
                                }),
                                tooltip: i18n('CLICK PRESS TO') + i18n('SELECT') + i18n('FILE 2'),
                                placeholder: i18n('FILE 2'),
                                isDisabled: false,
                                required: true,
                                onChange: function(oldVal, newVal) {
                                    _self.coreServices._dataNewFile.idRightFile = newVal.key;

                                }
                            });
                            if (_self.getData().isEdit) {
                                _self.view.file1.ctrl.setKey(_self.getData().an4.idLeftFile);
                                _self.view.file2.ctrl.setKey(_self.getData().an4.idRightFile);
                            }
                            if (_self.coreServices.index !== undefined) {
                                _self.view.file1.ctrl.setKey(_self.coreServices.list[_self.coreServices.index].idLeftFile);
                                _self.view.file2.ctrl.setKey(_self.coreServices.list[_self.coreServices.index].idRightFile);
                            }
                        });
                    });


                }
            });
            var options = [];
            if (data.list) {
                $.each(data.list, function(index, element) {
                    options.push({
                        key: element.id,
                        name: element.name,
                        index: index
                    });
                });
                _self.view.layoutCopyFrom.empty();
                _self.view.layoutCopyFrom.ctrl = _self.view.layoutCopyFrom.bindBaseAutocomplete({
                    options: options,
                    tooltip: i18n('COPY FROM TOOLTIP'),
                    placeholder: i18n('COPY FROM'),
                    onChange: function(oldVal, newVal) {
                        var currentLayoutCopy = data.list.filter(function(e) {
                            return e.id == newVal.key;
                        });

                        _self.view.layoutRule.ctrl.setKey(data.list[newVal.index].idRule);
                        _self.view.layoutName.ctrl.setText(i18n('COPY OF') + ' ' + data.list[newVal.index].name);
                        _self.view.layoutDescription.ctrl.val(data.list[newVal.index].description);
                        _self.coreServices.index = newVal.index;
                        _self.coreServices.list = data.list;
                        _self.coreServices._dataNewFile.idCopy = newVal.key;


                    }
                });
            }
            if (_self.getData().isEdit) {
                _self.view.layoutRule.ctrl.setKey(_self.getData().an4.idRule);
                _self.view.layoutName.ctrl.setText(_self.getData().an4.name);
                _self.view.layoutDescription.ctrl.val(_self.getData().an4.description);
                _self.coreServices._dataNewFile.id = _self.getData().an4.id;

            }
            if (_self.getData().copyFrom !== undefined) {
                _self.view.layoutCopyFrom.ctrl.setKey(_self.getData().copyFrom);
            }
            _self.loader.close();
        }).error(function(error) {
            _self.coreServices.loadingData = false;
            $.baseToast({
                text: i18n('ERROR GETTING CREATE FIELDS'),
                isError: true
            });
            _self.loader.close();
        });
    },
    _renderSettingsSelectsEmpty: function(key, loading) {
        var _self = this;

        //key is where the onChange is called
        //order asc --> tax , branch , uf , company

        //tax is commented because select is not added
        _self.view.layoutTax.empty();
        _self.view.layoutTax.ctrl = _self.view.layoutTax.bindBaseSelect({
            options: [],
            tooltip: i18n('FILE TAX TOOLTIP'),
            placeholder: i18n('FILE TAX'),
            required: true,
            isDisabled: true,
            isLoading: key == 'branch' && loading ? true : false
        });

        if (key == 'branch') {
            return;
        }

        _self.view.layoutBranch.empty();
        _self.view.layoutBranch.crtl = _self.view.layoutBranch.bindBaseSelect({
            options: [],
            tooltip: i18n('FILE BRANCH TOOLTIP'),
            placeholder: i18n('FILE BRANCH'),
            required: true,
            isDisabled: true,
            isLoading: key == 'uf' && loading ? true : false
        });

        if (key == 'uf') {
            return;
        }

        _self.view.layoutState.empty();
        _self.view.layoutState.ctrl = _self.view.layoutState.bindBaseSelect({
            options: [],
            tooltip: i18n('FILE STATE TOOLTIP'),
            placeholder: i18n('FILE STATE'),
            required: true,
            isDisabled: true,
            isLoading: key == 'company' && loading ? true : false
        });
    },
    _onChangeCompanySettings: function(newVal) {
        var _self = this;

        if (newVal.length === 0) {
            _self._renderSettingsSelectsEmpty("company");
            _self.coreServices._dataNewFile.idCompany = [];
            _self.coreServices._dataNewFile.uf = [];
            _self.coreServices._dataNewFile.eefi = [];
            return;
        }

        if (_self.callbacksSettings && _self.callbacksSettings.callbackCompany.keysCompany.length != newVal.length) {
            return;
        }
        var opt = newVal.map(function(e, i) {
            return e.id;
        });
        var isNew = _self._compareArraysSelect(newVal, _self.coreServices._dataNewFile.idCompany);
        if (!isNew) {
            return;
        }
        _self.coreServices._dataNewFile.idCompany = opt;
        _self.coreServices._dataNewFile.uf = [];
        _self._renderSettingsSelectsEmpty('company', true);

        Data.endpoints.dfg.uf.post({
            idCompany: opt,
        }).success(function(data) {
            _self.view.layoutState.empty();
            if (_self.type != 'an4') {
                _self.view.layoutState.ctrl = _self.view.layoutState.bindBaseMultipleSelect3({
                    required: true,
                    tooltip: i18n('FILE STATE TOOLTIP'),
                    placeholder: i18n('FILE STATE'),
                    onChange: _self._onChangeUfSettings.bind(_self),
                    options: data.map(function(e, i) {
                        e.key = e.id;
                        return e;
                    })
                });

            } else {
                _self.view.layoutState.ctrl = _self.view.layoutState.bindBaseSelect({
                    required: true,
                    tooltip: i18n('FILE STATE TOOLTIP'),
                    placeholder: i18n('FILE STATE'),

                    onChange: function(oldval, newval) {
                        _self.coreServices.an4data.uf = newval.key;
                        var nv = [];
                        nv.push(newval);
                        _self._onChangeUfSettings(nv);
                    },
                    options: data.map(function(e, i) {
                        e.key = e.id;
                        return e;
                    })
                });
            }

            if (_self.callbacksSettings && !_self.callbacksSettings.callbackCompany.ready) {
                _self.callbacksSettings.callbackCompany.ready = true;
                _self.callbacksSettings.callbackCompany.callback();
            }
        });
    },
    _onChangeUfSettings: function(newVal) {
        var _self = this;
        if (newVal.length === 0) {
            _self._renderSettingsSelectsEmpty("uf");
            _self.coreServices._dataNewFile.uf = [];
            _self.coreServices._dataNewFile.eefi = [];
            return;
        }


        if (_self.callbacksSettings && _self.callbacksSettings.callbackUf.keysUf.length != newVal.length) {
            return;
        }
        var opt = newVal.map(function(e, i) {
            return e.id;
        });
        var isNew = _self._compareArraysSelect(newVal, _self.coreServices._dataNewFile.uf);
        if (!isNew) {
            return;
        }
        _self.coreServices._dataNewFile.uf = opt;
        _self.coreServices._dataNewFile.eefi = [];
        _self._renderSettingsSelectsEmpty("uf", true);
        Data.endpoints.dfg.branch.post({
            idCompany: _self.coreServices._dataNewFile.idCompany,
            uf: opt
        }).success(function(data) {
            _self.view.layoutBranch.empty();
            if (_self.type != 'an4') {
                _self.view.layoutBranch.ctrl = _self.view.layoutBranch.bindBaseMultipleSelect3({
                    required: true,
                    tooltip: i18n('FILE BRANCH TOOLTIP'),
                    placeholder: i18n('FILE BRANCH'),
                    onChange: _self._onChangeBranchSetting.bind(_self),
                    options: data.map(function(e, i) {
                        e.key = e.idCompany + e.uf + e.id;
                        return e;
                    })
                });

            } else {
                _self.view.layoutBranch.ctrl = _self.view.layoutBranch.bindBaseSelect({
                    required: true,
                    tooltip: i18n('FILE BRANCH TOOLTIP'),
                    placeholder: i18n('FILE BRANCH'),

                    onChange: function(oldval, newval) {
                        _self.coreServices.an4data.idBranch = newval.name;
                        var nv = [];
                        nv.push(newval);
                        _self._onChangeBranchSetting(nv);
                    },
                    options: data.map(function(e, i) {
                        e.key = e.idCompany + e.uf + e.id;
                        return e;
                    })
                });

            }

            if (_self.callbacksSettings && !_self.callbacksSettings.callbackUf.ready) {
                _self.callbacksSettings.callbackUf.ready = true;
                _self.callbacksSettings.callbackUf.callback();
            }
        });

    },
    _onChangeBranchSetting: function(newVal) {
        var _self = this;
        if (newVal.length === 0) {
            _self._renderSettingsSelectsEmpty("branch");
            _self.coreServices._dataNewFile.eefi = [];
            return;
        }

        if (_self.callbacksSettings && _self.callbacksSettings.callbackBranch.keysBranch.length != newVal.length) {
            return;
        }

        var isNew = _self._compareArraysSelect(newVal, _self.coreServices._dataNewFile.eefi);
        if (!isNew) {
            return;
        }
        _self.coreServices._dataNewFile.eefi = newVal;
        _self._renderSettingsSelectsEmpty("branch", true);

        Data.endpoints.dfg.tax.post().success(function(data) {
            _self.view.layoutTax.empty();
            _self.view.layoutTax.ctrl = _self.view.layoutTax.bindBaseSelect({
                options: data,
                required: true,
                tooltip: i18n('FILE TAX TOOLTIP'),
                placeholder: i18n('FILE TAX'),
                onChange: function(oldVal, newVal) {
                    _self.coreServices._dataNewFile.eefi = _self.coreServices._dataNewFile.eefi.map(function(e, i) {
                        e.idBranch = e.id;
                        e.isTaxGroup = newVal.key.match(/^[0-9]+G$/g) != null;
                        e.idTax = newVal.key.match(/^[0-9]+G/g) ? newVal.key.substring(0, newVal.key.length - 1) : newVal.key;
                        return e;
                    });
                }
            });
            if (_self.callbacksSettings && !_self.callbacksSettings.callbackBranch.ready) {
                _self.callbacksSettings.callbackBranch.ready = true;
                _self.callbacksSettings.callbackBranch.callback();
            }
        });

    },
    _compareArraysSelect: function(array1, array2) {
        if (array2 === undefined) {
            array2 = [];
        }
        var isDiferent = false;
        var newArray1 = array1.map(function(e) {
            return e.key === undefined ? e : e.key;
        });

        var newArray2 = array2.length === 0 ? [] : array2.map(function(e) {
            return e.key === undefined ? e : e.key;
        });

        var tamanio = array1.length > array2.length ? array1.length : array2.length;

        for (var i = 0; i < tamanio; i++) {
            if (newArray2.indexOf(newArray1[i]) === -1 && !isDiferent) {
                isDiferent = true;
            }
        }
        return isDiferent;
    },
    getOwnData: function() {
        var _self = this;
        var ownData = {};
        ownData.validFrom = _self.inputValidFrom.getDate();

        ownData.validTo = _self.inputValidTo.getDate();
        //converting dates to backend format
        if (ownData.validFrom) {
            ownData.validFrom = _self.inputValidFrom._jsonToDate(ownData.validFrom);
            ownData.validFrom = ownData.validFrom.replace(/^(\d{2})\/(\d{2})\/(\d{4})$/, '$3-$2-$1');
        }
        if (ownData.validTo) {
            ownData.validTo = _self.inputValidTo._jsonToDate(ownData.validTo);
            ownData.validTo = ownData.validTo.replace(/^(\d{2})\/(\d{2})\/(\d{4})$/, '$3-$2-$1');
        } else {
            ownData.validTo = '9999-12-31';
        }
        if (_self.federalRadio.find('input').attr('checked') == 'checked') {
            ownData.areaType = 'federal';
            ownData.area = "[]";
        } else {
            ownData.areaType = 'estadual';
            ownData.area = JSON.stringify(_self.inputState.getSelectedValues());
        }
        ownData.idStructureGroup = _self.inputStructure.getKey();
        if (_self.inputStructureChild && _self.inputStructureChild.getSelectedValues) {
            ownData.idStructure = JSON.stringify(_self.inputStructureChild.getSelectedValues());
        }
        if (_self.inputCompany) {
            ownData.company = JSON.stringify(_self.inputCompany.getSelectedValues());
        }
        if (_self.inputBranch && _self.inputBranch.getSelectedValues) {
            ownData.branch = JSON.stringify(_self.inputBranch.getSelectedValues());
        }

        //ownData.layoutCopyFrom = _self.inputs.copyFrom;
        ownData.layoutType = _self.inputs.layoutType;
        ownData.layoutName = _self.inputs.layoutName.getText();
        ownData.layoutDescription = $('#textareaDescription textarea').val();
        //validate fields
        _self.inputs.layoutName.validate();
        _self.inputValidFrom.isValid();
        _self.inputLayoutType.validate();
        _self.inputStructure.validate();
        if (ownData.validFrom > ownData.validTo) {
            $.baseToast({
                text: i18n("DFG101009"),
                type: 'E'
            });
        }
        if (ownData.validFrom && ownData.layoutType && ownData.layoutName && ownData.idStructure && (ownData.validFrom <= ownData.validTo)) {
            return ownData;
        } else {
            return null;
        }
    },
    initInputs: function() {
        var _self = this;
        if (_self.initData.layoutName) {
            _self.view.layoutName.ctrl.setText(i18n('COPY OF') + ' ' + _self.initData.layoutName);
        }
        if (_self.initData.layoutDescription) {
            $('#textareaDescription textarea').val(_self.initData.layoutDescription);
        }
        if (_self.initData.validFrom) {
            _self.view.layoutValidFrom.ctrl.setDate(parseDate(_self.initData.validFrom, "object"));

        }
        if (_self.initData.validTo) {
            _self.view.layoutValidTo.ctrl.setDate(parseDate(_self.initData.validTo, "object"));
        }

        if (_self.initData.areaType == 'federal') {
            _self.federalRadio.find('input').attr('checked', 'checked');
            //_self.inputState.disable();
        } else if (_self.initData.areaType == 'estadual') {
            _self.stateRadio.find('input').attr('checked', 'checked');
            //_self.inputState.enable();
        }
    },
    bindTooltips: function() {
        var self = this;
        $('#textarea-id').attr('tabindex', '0');
        $('#textarea-id').baseTooltip({
            class: 'dark',
            position: 'top',
            text: i18n(this.type.toUpperCase() + ' ' + 'DESCRIPTION TOOLTIP')
        });
    },
    updateHeaderData: function() {
        var _self = this;
        var canEdit = true;
        if(_self.baseLayout){
            if(!_self.validStructs){
                canEdit = false; 
            }
        }
        if(canEdit){
            _self.coreServices.layoutObject.name = _self.view.layoutName.ctrl.getText();
            _self.coreServices.layoutObject.description = _self.view.layoutDescription.ctrl.val();
            _self.coreServices.layoutObject.newStructs = _self.newStructs;
            return true;
        }else{
            
            $.baseToast({
                text: i18n("INVALID STRUCTURES"),
                type: "w"
            });
            return false;
        }
    },
    validate: function() {
        var self = this;
        var flag = true;
        var keys = Object.keys(self.view);
         var canEdit = true;
        if(self.baseLayout){
            if(!self.validStructs){
                canEdit = false;
            }
        }
        $.each(keys, function(ind, key) {
            if (self.view[key].length > 0 && self.view[key].ctrl && self.view[key].ctrl.validate) {
                if (self.view[key].ctrl.validate()) {
                    if (self.view[key].ctrl.showSuccess)
                        self.view[key].ctrl.showSuccess();
                } else {
                    if (self.view[key].ctrl.showError)
                        self.view[key].ctrl.showError();
                    if (self.view[key].ctrl.getData().required)
                        flag = false;
                }
            }

            if (self.view[key].length > 0 && self.view[key].ctrl && self.view[key].ctrl._validate) {
                if (self.view[key].ctrl._validate()) {
                    if (self.view[key].ctrl.showSuccess)
                        self.view[key].ctrl.showSuccess();
                } else {
                    if (self.view[key].ctrl.showError && self.view[key].ctrl.getData().required) {
                        self.view[key].ctrl.showError();
                        flag = false;
                    }
                }
            }
        });
        if(!canEdit){
            flag = false;
            console.log(_self.coreServices.layoutObject);
            $.baseToast({
                text: i18n("INVALID STRUCTURES"),
                type: "w"
            });
        }
        return flag;
    },
    _getEefiStructure: function(eefi) {
        var _self = this;
        var object = {};
        eefi.forEach(function(e) {
            if (!object.hasOwnProperty(e.idCompany)) {
                object[e.idCompany] = {};
            }

            if (!object[e.idCompany].hasOwnProperty(e.uf)) {
                object[e.idCompany][e.uf] = {};
            }

            if (!object[e.idCompany][e.uf].hasOwnProperty(e.idBranch)) {
                object[e.idCompany][e.uf][e.idBranch] = {
                    tax: ''
                };
            }
            object[e.idCompany][e.uf][e.idBranch]["tax"] = e.idTax;
        });

        return object;
    },
    _getStructure: function(subStructureId) {
        var _self = this;
        var array = [];
        _self.createDialogData.structures.forEach(function(_element, _ind) {
            _element.structure.forEach(function(_sub) {
                if (subStructureId == _sub.id) {
                    array.push({
                        key: _element.id,
                        name: _element.title
                    });
                }
            });
        });
        return array[0];
    },
    setVersionOptions: function(layoutId) {
        var _self = this;
        Data.endpoints.dfg.setting.getVersions.post({
            idLayout: layoutId
        }).success(function(_versions) {
            var _opt = [];
            _versions.forEach(function(_versions_item) {
                _opt.push({
                    key: _versions_item.id,
                    name: _versions_item.version
                });
            });
            _self.view.timpVersion.empty();
            _self.view.timpVersion.ctrl = _self.view.timpVersion.bindBaseSelect({
                options: _opt,
                required: true,
                onChange: function(oldVal, newVal) {
                    _self.coreServices._dataNewFile.idLayoutVersion = newVal.key;
                },
                tooltip: i18n('VERSION INPUT TOOLTIP'),
                placeholder: i18n('VERSION INPUT TOOLTIP')
            });
            _self.view.copyVersion.text(i18n('TILE COPY LAYOUT VERSION'));
        }).error(function() {});
    },
    _initializeElements: function(data) {
        var _self = this;
        var newVal = _self.getData().setting;
        var currentLayoutCopy = newVal.layout;
        var eefi = newVal.eefi[0];
        _self.view.layoutName.ctrl.setText(newVal.name);
        _self.view.layoutDescription.ctrl.val(newVal.description);

        if (_self.getData().isView) {
            _self.view.layoutName.ctrl.setText("ID " + newVal.id + "- " + newVal.name);
            _self.view.layoutName.ctrl.disable();
            _self.view.validTo.disable();
            _self.view.layoutDescription.ctrl.attr("disabled", "disabled");
            $("textarea").css("background-color", "#F3F2F2");
            _self.view.layoutType.ctrl.setKey(newVal.layout.id);
            _self.view.timpVersion.ctrl.setKey(newVal.layout.legalVersion);
        }

        //setkey and callbacks        
        if (newVal.version.validFrom && newVal.version.validFrom !== null) {
            _self.view.validFrom.ctrl.setValue({
                "hanaDate": new Date(newVal.version.validFrom)
            });
        }

        if (newVal.version.validTo && newVal.version.validTo !== null) {
            _self.view.validTo.setValue({
                "hanaDate": new Date(newVal.version.validTo)
            });
        }

        //disable selects
        _self.view.layoutCompany.ctrl.disable();
        _self.view.validFrom.ctrl.disable();

        _self.view.layoutCompany.ctrl.setValue(_self.companyKeys);
        _self.view.layoutState.ctrl.setKey(_self.ufKeys);
        _self.view.layoutBranch.ctrl.setKey(_self.branchKeys);
        console.log(eefi)
        _self.view.layoutTax.ctrl.setKey(eefi.idTax);
        _self.coreServices._dataNewFile.id = newVal.id;
        _self.loader.close();
    }
});
