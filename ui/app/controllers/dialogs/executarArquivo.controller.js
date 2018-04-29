/*globals i18n _ Data*/
sap.ui.controller("app.controllers.dialogs.executarArquivo", {

    onInit: function() {
        this.data = {
            chkExecuteAn3: {
                id: "chkExecuteAn3",
                name: "chkExecuteAn3",
                value: "chkExecuteAn3",
                isChecked: false,
                text: "&nbsp;"

            },
            chkMovementCentralization: {
                id: "chkMovementCentralization",
                name: "chkMovementCentralization",
                value: "chkMovementCentralization",
                isChecked: false,
                text: "&nbsp;"


            }
        };
    },
    onDataRefactor: function(data) {
        return $.extend(data, this.data);
    },

    onAfterRendering: function(html) {
        var _self = this;
        _self.initData = _self.getData().initData;
        if (_self.getData().noMapConfig) {
            $.baseToast({
                text: i18n['DFG103002'],
                isWarning: true
            });
        }
        _self.view = html;
        _self.view.company = _self.view.find('#inputCompany');
        _self.view.stateUf = _self.view.find('#inputState');
        _self.view.branch = _self.view.find('#inputBranch');
        _self.view.tax = _self.view.find('#taxSelect');
        _self.view.subPeriod = _self.view.find('#subPeriodPic');
        _self.view.chkMovementCentralization = _self.view.find(":checkbox");


        _self.addServices();
        _self.bindElements();
        _self.bindEvents();
        _self.bindTooltips();

    },
    addServices: function() {
        var _self = this;
        if (window.parameters.calculationBlocks) {
            var companyOptions = _self.getData().eefiInfo;
            _self.eefiSPEDStructure = [];
            for (var i in companyOptions) {
                _self.eefiSPEDStructure.push(companyOptions[i]);
            }

        } else {
            _self.retrieveEEFI();
        }

        _self.coreServices.getDataGenParams = _self.getOwnData.bind(_self);
    },
    retrieveEEFI: function() {
        var _self = this;
        var bruteEEFI = _self.coreServices.eefi;
        _self.eefiStructure = undefined;
        if (bruteEEFI != undefined) {
            _self.eefiStructure = _self._getEefiStructure(bruteEEFI);
        }
    },
    bindElements: function() {

        var _self = this;
        _self.view.company.empty();



        if (_self.eefiStructure != undefined) {
            var keys = undefined;
            keys = $.map(_self.eefiStructure, function(item, key) {
                return key;
            });
            _self.view.company.ctrl = _self.view.company.bindBaseAutocomplete({
                required: false,
                tooltip: i18n('TILE COMPANY TOOLTIP'),
                options: keys.map(function(e) {
                    return {
                        key: e,
                        name: e
                    };
                }),
                isDisabled: false,
                onChange: _self.onChangeCompany.bind(_self)
            });

        } else {
            if (_self.eefiSPEDStructure) {
                _self.view.company.ctrl = _self.view.company.bindBaseAutocomplete({
                    required: false,
                    tooltip: i18n('TILE COMPANY TOOLTIP'),
                    options: _self.eefiSPEDStructure,
                    isDisabled: false,
                    onChange: _self.onChangeCompany.bind(_self)
                });

            } else {
                var data = _self.coreServices.allVersionData;
                var companyOptions = [];
                companyOptions.push({
                    key: data.idCompany,
                    name: data.idCompany
                });
                _self.view.company.empty();
                _self.view.company.ctrl = _self.view.company.bindBaseAutocomplete({
                    required: false,
                    tooltip: i18n('TILE COMPANY TOOLTIP'),
                    options: companyOptions,
                    isDisabled: true,
                    onChange: _self.onChangeCompany.bind(_self)
                });
            }


        }

        _self.view.stateUf.empty();
        _self.view.stateUf.ctrl = _self.view.stateUf.bindBaseMultipleSelect3({
            required: false,
            tooltip: i18n('STATE TOOLTIP'),
            isDisabled: true
        });

        _self.view.branch.empty();
        _self.view.branch.ctrl = _self.view.branch.bindBaseMultipleSelect3({
            required: false,
            tooltip: i18n('TILE BRANCH TOOLTIP'),
            isDisabled: true
        });
        _self.view.tax.empty();
        _self.view.tax.ctrl = _self.view.tax.bindBaseAutocomplete({
            required: false,
            tooltip: i18n('TILE TAX TOOLTIP'),
            isDisabled: true
        });
        _self.view.subPeriod.empty();
        _self.view.subPeriod.ctrl = _self.view.subPeriod.bindBaseFiscalSubPeriodPicker({
            required: true,
            idCompany: _self.view.company.ctrl.getKey(),
            uf: _self.view.stateUf.ctrl.getKeys(),
            branch: _self.view.branch.ctrl.getKeys(),
            idTax: _self.view.tax.ctrl.getKey(),
            tooltip: i18n('TILE SUBPERIOD TOOLTIP'),
            placeholder: i18n('TILE SUBPERIOD'),
            isEditable: false,
            isDisabled: true
        });
        $('.subPeriodPic').height(40);
        if (_self.eefiSPEDStructure) {
            if (_self.eefiSPEDStructure.length === 1) {
                _self.view.company.ctrl.setKey(_self.eefiSPEDStructure[0].key);
            }
        } else {
            if (_self.eefiStructure == undefined) {
                _self.view.company.ctrl.setKey(data.idCompany);
            } else {
                if (_self.view.company.ctrl._data.options.length == 1) {
                    _self.view.company.ctrl.setKey(_self.view.company.ctrl._data.options[0].key);
                }
            }
        }


        //
        // $('#create-file-dialog .movementCentralization').empty();
        // _self.chkMovementCentralization = $('#create-file-dialog .movementCentralization').bindBaseCheckbox({
        //     id: "chkMovementCentralization",
        //     name: "chkMovementCentralization",
        //     value: "chkMovementCentralization",
        //     text: i18n('MOVEMENT CENTRALIZATION'),
        //     tooltip: i18n('MOVEMENT CENTRALIZATION TOOLTIP')
        // });
        if (_self.coreServices.subPeriodData) {
            _self.view.company.ctrl.setKey(_self.coreServices.subPeriodData.idCompany);
        }

    },
    onChangeCompany: function(oldVal, newVal) {
        var _self = this;
        _self.view.stateUf.empty();
        if (_self.eefiStructure != undefined) {
            //console.log(_self.eefiStructure);
            var statesKeys = Object.keys(_self.eefiStructure[newVal.key]) ;

            _self.view.stateUf.ctrl = _self.view.stateUf.bindBaseMultipleSelect3({
                required: false,
                tooltip: i18n('STATE TOOLTIP'),
                options: statesKeys.map(function(e) {
                    return {
                        key: e,
                        name: e
                    };
                }),
                onChange: _self.onChangeUf.bind(_self)
            });
            if (_self.view.stateUf.ctrl._data.options.length == 1) {
                _self.view.stateUf.ctrl.setKey([_self.view.stateUf.ctrl._data.options[0].name]);
            }

        } else {
            if (_self.eefiSPEDStructure) {
                var options = newVal.uf;
                var ufOptions = [];
                for (var i in newVal.uf) {
                    ufOptions.push(newVal.uf[i]);
                }
                _self.view.stateUf.ctrl = _self.view.stateUf.bindBaseMultipleSelect3({
                    required: false,
                    tooltip: i18n('STATE TOOLTIP'),
                    options: ufOptions,
                    onChange: _self.onChangeUf.bind(_self)
                });
                if (_self.view.stateUf.ctrl._data.options.length == 1) {
                    _self.view.stateUf.ctrl.setKey([_self.view.stateUf.ctrl._data.options[0].name]);
                }
            } else {
                var data = _self.coreServices.allVersionData;
                // console.log(data)
                var stateOptions = [];
                stateOptions.push({
                    key: data.uf,
                    name: data.uf
                });

                _self.view.stateUf.ctrl = _self.view.stateUf.bindBaseMultipleSelect3({
                    required: false,
                    tooltip: i18n('STATE TOOLTIP'),
                    options: stateOptions,
                    isDisabled: true,
                    onChange: _self.onChangeUf.bind(_self)
                });
                _self.view.stateUf.ctrl.setKey([data.uf]);
            }


        }
        if (_self.coreServices.subPeriodData) {
            _self.view.stateUf.ctrl.setKey([_self.coreServices.subPeriodData.uf]);
        }
    },
    onChangeUf: function(oldVal, newVal) {
        var _self = this;
        _self.view.branch.empty();
        if (_self.eefiStructure != undefined) {
            var company = _self.view.company.ctrl.getKey();
            var state = _self.view.stateUf.ctrl.getKeys();
            var branchesKeys = [];
            for(var s = 0 ; s <state.length;s++){
                branchesKeys = branchesKeys.concat(Object.keys(_self.eefiStructure[company][state[s]]));
            }
           var branchesKeys2 = [];
            $.each(branchesKeys, function(i, el){
                if($.inArray(el, branchesKeys2) === -1) {
                    branchesKeys2.push(el);
                }
            });
            _self.view.branch.ctrl = _self.view.branch.bindBaseMultipleSelect3({
                required: false,
                tooltip: i18n('TILE BRANCH TOOLTIP'),
                options: branchesKeys2.map(function(e) {
                    return {
                        key: e,
                        name: e
                    };
                }),
                onChange: _self.onChangeBranch.bind(_self)
            });
            if (_self.view.branch.ctrl._data.options.length == 1) {
                _self.view.branch.ctrl.setKey([_self.view.branch.ctrl._data.options[0].name]);
            }


        } else {
            if (_self.eefiSPEDStructure) {
                var options;
                var branchCache = {};
                var idBranchOptions = [];
                for (var j = 0; j < oldVal.length; j++) {
                    options = oldVal[j].idBranch;
                    for (var i in options) {
                        if (!branchCache[i]) {
                            idBranchOptions.push(options[i]);
                            branchCache[i] = i;
                        }

                    }
                }


                _self.view.branch.ctrl = _self.view.branch.bindBaseMultipleSelect3({
                    required: false,
                    tooltip: i18n('TILE BRANCH TOOLTIP'),
                    options: idBranchOptions,
                    onChange: _self.onChangeBranch.bind(_self)
                });
                if (_self.view.branch.ctrl._data.options.length == 1) {
                    _self.view.branch.ctrl.setKey([_self.view.branch.ctrl._data.options[0].name]);
                }

            } else {
                var data = _self.coreServices.allVersionData;
                var branchOptions = [];
                branchOptions.push({
                    key: data.idBranch,
                    name: data.idBranch
                });

                _self.view.branch.ctrl = _self.view.branch.bindBaseMultipleSelect3({
                    required: false,
                    tooltip: i18n('TILE BRANCH TOOLTIP'),
                    options: branchOptions,
                    isDisabled: true,
                    onChange: _self.onChangeBranch.bind(_self)
                });
                if (_self.view.branch.ctrl._data.options.length == 1) {
                    _self.view.branch.ctrl.setKey([_self.view.branch.ctrl._data.options[0].name]);
                }
            }

        }
        if (_self.coreServices.subPeriodData) {
            _self.view.branch.ctrl.setKey([_self.coreServices.subPeriodData.idBranch]);
        }
    },
    onChangeBranch: function(oldValue, newVal) {
        var _self = this;
        var taxOptions = [];
        _self.view.tax.empty();
        var bool;
        if (_self.eefiSPEDStructure) {
            var options = oldValue[0].idTax;
            var idTaxOptions = [];
            for (var i in options) {
                idTaxOptions.push(options[i]);
            }
            _self.view.tax.ctrl = _self.view.tax.bindBaseAutocomplete({
                required: false,
                tooltip: i18n('TILE TAX TOOLTIP'),
                options: idTaxOptions,
                isDisabled: bool,
                onChange: _self.onChangeTax.bind(_self)
            });

        } else {
            var data = _self.coreServices.allVersionData;

            if (data.idTax.length !== undefined) {
                $.each(data.idTax, function(index, element) {
                    taxOptions.push({
                        key: element.codTributo,
                        name: element.descrCodTributoLabel
                    });

                });
                bool = true;
            } else {
                taxOptions.push({
                    key: data.idTax.codTributo,
                    name: data.idTax.descrCodTributoLabel
                });
                bool = false;
            }


            _self.view.tax.ctrl = _self.view.tax.bindBaseAutocomplete({
                required: false,
                tooltip: i18n('TILE TAX TOOLTIP'),
                options: taxOptions,
                isDisabled: bool,
                onChange: _self.onChangeTax.bind(_self)
            });


            if (_self.view.tax.ctrl._data.options.length == 1) {
                _self.view.tax.ctrl.setKey(_self.view.tax.ctrl._data.options[0].key);
            }

        }

        if (_self.coreServices.subPeriodData) {
            _self.view.tax.ctrl.setKey(_self.coreServices.subPeriodData.tributo[0].codTributo);
        }

    },
    onChangeTax: function(oldVal, newVal) {
        var _self = this;
        _self.view.subPeriod.empty();
        var isGroupTax = false;
        if(_self.coreServices.eefi){
            if(_self.coreServices.eefi[0].isTaxGroup){
                isGroupTax = true;
            }
        }
        var companyKey = _self.view.company.ctrl.getKey();
        var company;
        if (!_.isNil(_self.eefiStructure)) {
            company = _self.eefiStructure[companyKey];   
        } else {
            company = _.filter(_self.eefiSPEDStructure, function(item) {
                return item.key === companyKey;
            });
        }
        var ufs = _self.view.stateUf.ctrl.getKeys();
        var branches = _self.view.branch.ctrl.getKeys();
        var eef = _.reduce(ufs, function(prev, uf) {
            if (!_.isNil(company) && !_.isNil(company[uf])) {
                _.forEach(branches, function(branch) {
                    if (!_.isNil(company[uf][branch])) {
                        prev.push({
                           idCompany:  companyKey,
                           idBranch: branch,
                           uf: uf
                        });   
                    }
                });
            }

            return prev;
        }, []);

        _self.view.subPeriod.ctrl = _self.view.subPeriod.bindBaseFiscalSubPeriodPicker({
            required: true,
            tooltip: i18n('TILE SUBPERIOD TOOLTIP'),
            placeholder: i18n('TILE SUBPERIOD'),
            eef: eef,
            idTax: isGroupTax ? undefined :[newVal.key],
            idTaxGrouping: isGroupTax ? newVal.key : undefined,
            component: "DFG",
            privilege: "setting.execute",
            isEditable: true,
            onChange: function(value) {

                var data = _self.view.subPeriod.ctrl.getValue();
                _self.subPeriodDate = {
                    startDate: data.startDate,
                    endDate: data.endDate
                };
            }
        });
        if (_self.eefiSPEDStructure) {
            _self.view.subPeriod.empty();
            _self.view.subPeriod.ctrl = _self.view.subPeriod.bindBaseFiscalSubPeriodPicker({
                required: true,
                tooltip: i18n('TILE SUBPERIOD TOOLTIP'),
                placeholder: i18n('TILE SUBPERIOD'),
                eef: eef,
                idTax: newVal.isTaxGroup ? undefined : [newVal.key],
                idTaxGrouping: newVal.isTaxGroup ? newVal.key : undefined,
                isDisabled: false,
                component: "DFG",
                privilege: "setting.execute"
            });
        } else {
            if (_self.eefiStructure == undefined) {
                _self.view.subPeriod.empty();
                _self.view.subPeriod.ctrl = _self.view.subPeriod.bindBaseFiscalSubPeriodPicker({
                    required: true,
                    tooltip: i18n('TILE SUBPERIOD TOOLTIP'),
                    placeholder: i18n('TILE SUBPERIOD'),
                    eef:eef,
                    idTax: [newVal.key],
                    isDisabled: true
                });
                var data = _self.coreServices.allVersionData;
                _self.view.subPeriod.ctrl.setValue({
                    tooltip: i18n("TILE SUBPERIOD TOOLTIP"),
                    placeholder: i18n('TILE SUBPERIOD'),
                    eef: eef,
                    idTax: [newVal.key],
                    year: data.year,
                    month: parseInt(data.month),
                    subperiod: data.subperiod,
                    isEditable: false,
                    required: true,
                    component: "DFG",
                    privilege: "setting.execute"
                });
            }

        }
        if (_self.coreServices.subPeriodData) {

            _self.view.subPeriod.ctrl.setValue({
                tooltip: i18n("TILE SUBPERIOD TOOLTIP"),
                placeholder: i18n('TILE SUBPERIOD'),
                eef: eef,
                idTax: _self.view.tax.ctrl.getKey(),
                year: _self.coreServices.subPeriodData.year,
                month: parseInt(_self.coreServices.subPeriodData.month),
                subperiod: _self.coreServices.subPeriodData.subPeriod,
                component: "DFG",
                privilege: "setting.execute"
            });
             $("#chkMovementCentralization").attr("checked",true);
             
        }
        
    },
    bindTooltips: function() {
        var _self = this;
        $("#create-file-dialog .inputs.executeAn3 input").baseTooltip({
            class: "dark",
            position: "top",
            text: i18n("CLICK PRESS ENTER TO") + " " + i18n("EXECUTE AN3"),
            tooltip: i18n('EXECUTE AN3 TOOLTIP'),
            width: 300
        });
 

    },
    bindEvents: function() {
        var _self = this;
    },
    initInputs: function() {
        var _self = this;
        _self.inputCompany = $('#inputCompany').bindBaseAutocomplete({
            tooltip: i18n('TILE COMPANY TOOLTIP')
        });
        _self.inputBranch = $('#inputBranch').bindBaseSelect({
            isDisabled: true,
            tooltip: i18n('TILE BRANCH TOOLTIP')
        });
        _self.inputState = $('#inputState').bindBaseSelect({
            tooltip: i18n('STATE TOOLTIP')
        });

        _self.subPeriod = $('#subPeriodPic input').bindBaseSelect({
            tooltip: i18n('TILE SUBPERIOD TOOLTIP')
        });
    },
    initServices: function() {
        var _self = this;

        Data.endpoints.selects.stateList.post().success(function(data) {
            var _options = [];
            data.map(function(_state) {
                _options.push({
                    key: _state.id,
                    name: _state.id
                });
            });
            $('#inputState').html('');
            _self.inputState = $('#inputState').bindBaseSelect({
                options: _options,
                tooltip: i18n('STATE TOOLTIP')
            });
            if (_self.initData && _self.initData.area) {
                _self.inputState.setKey(_self.initData.area);
            }
        }).error(function(data) {
            // TODO implement the error codes
        });
        Data.endpoints.mkt.companyList.post().success(function(data) {
            var _options = [];
            data.map(function(_company) {
                _options.push({
                    key: _company.id,
                    name: _company.name,
                    title: _company.mandt
                });
            });
            $('#inputCompany').html('');
            _self.inputCompany = $('#inputCompany').bindBaseAutocomplete({
                options: _options,
                // required: true,
                onChange: function(oldVal, newVal) {
                    Data.endpoints.mkt.branchList.post({
                        id_company: [newVal.key]
                    }).success(function(data) {
                        var _options = [];
                        data[0].branch.map(function(_branch) {
                            _options.push({
                                key: _branch.id,
                                name: _branch.name
                            }); 
                        });
                        $("#inputBranch").html('');
                        _self.inputBranch = $("#inputBranch").bindBaseAutocomplete({
                            options: _options
                        });
                        if (_self.initData && _self.initData.branch) {
                            _self.inputBranch.setKey(_self.initData.branch);
                        }
                    }).error(function(data) {});
                },
                tooltip: i18n('TILE BRANCH TOOLTIP')
            });
            if (_self.initData && _self.initData.company) {
                _self.inputCompany.setKey(_self.initData.company);
            }
        }).error(function(data) {});
        if (_self.initData && _self.initData.company) {
            Data.endpoints.mkt.branchList.post({
                    id_company: [_self.initData.company]
                })
                .success(function(data) {
                    var _options = [];
                    data[0].branch.map(function(_branch) {
                        _options.push({
                            key: _branch.id,
                            name: _branch.name
                        });
                    });
                    $("#inputBranch").html('');
                    _self.inputBranch = $("#inputBranch").bindBaseAutocomplete({
                        options: _options,
                        tooltip: i18n('TILE BRANCH TOOLTIP')
                    });
                    if (_self.initData && _self.initData.branch) {
                        _self.inputBranch.setKey(_self.initData.branch);
                    }
                }).error(function(data) {});
        }


        _self.executorRangePicker = $('#executorRangePicker').bindBaseExecutionRangePicker({

            required: true,
            isEditable: true,
            placeholder: i18n('TILE SUBPERIOD'),
            tooltip: i18n('TILE SUBPERIOD TOOLTIP')
        });
    },
    getOwnData: function() {
        var _self = this;
        var ownData = {};
        ownData.company = _self.view.company.ctrl.getKey();
        ownData.uf = _self.view.stateUf.ctrl.getKeys();
        ownData.branch = _self.view.branch.ctrl.getKeys();
        ownData.tax = _self.view.tax.ctrl.getKey();
        ownData.subPeriod = _self.view.subPeriod.ctrl.getValue();
        ownData.initSubPeriod = ownData.subPeriod.startDate;
        ownData.endSubPeriod = ownData.subPeriod.endDate;
        ownData.centralizationMovement = $("#chkMovementCentralization")[0].checked;
        return ownData;
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
            object[e.idCompany][e.uf][e.idBranch]['tax'] = e.idTax;
        });
        //console.log(object);
        return object;
    },
    clearFields: function() {
        var _self = this;

        /*_self.inputCompany.select._input.val("");
        delete _self.inputCompany.select._input.data().key;
        _self.inputBranch.select._input.val("");
        delete _self.inputBranch.select._input.data().key;
        _self.inputState.select._input.val("");
        delete _self.inputState.select._input.data().key;

        _self.inputValidFrom._cleanDate();
        _self.inputValidTo._cleanDate();*/
       // $("#chkExecuteAn3").removeAttr('checked');
        $("#chkMovementCentralization").removeAttr('checked');
        _self.bindElements();
    },
    executionValuesSetter: function() {
        var _self = this;

        var data = _self.coreServices.allVersionData;
        var companyOptions = [];
        companyOptions.push({
            key: data.idCompany,
            name: data.idCompany
        });

        _self.view.company.empty();
        _self.view.company.ctrl = _self.view.company.bindBaseAutocomplete({
            required: false,
            tooltip: i18n('TILE COMPANY TOOLTIP'),
            placeholder: i18n('TILE COMPANY'),
            options: companyOptions
        });
        _self.view.company.ctrl.setKey(data.idCompany);
    },
    validateMappingSubPeriod: function(callback) {
        var _self = this;
        var map;
        var toShortDate = function(date) {
            return new Date(new Date(date).toISOString().split("T")[0]);
        };
        var version;
        if(window.parameters.calculationBlocks){
            version = _self.coreServices.validData;
        }else{
             version = _self.coreServices.allVersionData.version;
        }
        var dateInitSubPeriod = toShortDate(_self.view.subPeriod.ctrl.getValue().startDate);
        var dateFinishSubPeriod = toShortDate(_self.view.subPeriod.ctrl.getValue().endDate);
        var dateInitValid = version.validFrom ? toShortDate(version.validFrom) : null;
        var dateFinishValid = version.validTo ? toShortDate(version.validTo) : null;
        var isValid = false;
        if (dateInitValid !== null) {
            if (dateInitSubPeriod >= dateInitValid) {
                if (dateFinishValid !== null) {
                    if (dateFinishSubPeriod <= dateFinishValid) {
                        isValid = true;
                    }
                } else {
                    isValid = true;
                }
            }
        } else {
            isValid = true;
        }
        if (_self.view.tax.ctrl.getKey() === undefined) {
            isValid = false;
        }
        if (!isValid) {
            $.baseToast({
                text: i18n("DFG210006"),
                isError: true
            });
            return;
        }

        Data.endpoints.structures.getMapping.post({
            idStructure: _self.coreServices.idStructure,
            startDate: _self.view.subPeriod.ctrl.getValue().startDate,
            idTax: _self.view.tax.ctrl.getKey(),
            endDate: _self.view.subPeriod.ctrl.getValue().endDate
        }).success(function(response) {
            callback(response);
        });
    }
});
