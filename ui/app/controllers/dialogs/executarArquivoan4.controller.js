sap.ui.controller("app.controllers.dialogs.executarArquivoan4", {

    onInit: function() {
        this.data = {
            chkExecuteAn3: {
                id: "chkExecuteAn3",
                name: "chkExecuteAn3",
                value: "chkExecuteAn3",
                isChecked: false,
                text: "&nbsp;"

            }
        }
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
        _self.view.subPeriod = _self.view.find('#subPeriodPic');
        _self.view.file1 = _self.view.find('#file1');
        _self.view.file2 = _self.view.find('#file2');
        //_self.initInputs();
        //_self.initServices();
        _self.addServices();
        _self.bindElements();
        _self.bindEvents();
        _self.bindTooltips();

    },
    addServices: function() {
        var _self = this;
        _self.retrieveEEFI();
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
        _self.view.file1.empty();
        _self.view.file1.ctrl = _self.view.file1.bindBaseInput({
            required: false,
            tooltip: i18n('FILE TOOLTIP'),
            isDisabled: true
        });
        _self.view.file1.ctrl.setText(_self.coreServices.allVersionData.leftFile[0].name);
        _self.view.file2.empty();
        _self.view.file2.ctrl = _self.view.file2.bindBaseInput({
            required: false,
            tooltip: i18n('FILE TOOLTIP'),
            isDisabled: true
        });
        _self.view.file2.ctrl.setText(_self.coreServices.allVersionData.rightFile[0].name);
        
            // if (_self.eefiStructure == undefined) {
            //     _self.view.company.ctrl.setKey(data.idCompany);
            // } else {
            //     console.log(_self.coreServices.allVersionData)
            //     if (_self.view.company.ctrl._data.options.length == 1) {
            //         _self.view.company.ctrl.setKey(_self.view.company.ctrl._data.options[0].key);
            //     }
            // }
    },
    // onChangeCompany: function(oldVal, newVal) {
    //     var _self = this;
    //     _self.view.stateUf.empty();
    //     if (_self.eefiStructure != undefined) {
    //         var states = _self.eefiStructure[newVal.key];
    //         //console.log(_self.eefiStructure);
    //         var statesKeys = $.map(states, function(item, key) {
    //             return key;
    //         });

    //         _self.view.stateUf.ctrl = _self.view.stateUf.bindBaseSelect({
    //             required: false,
    //             tooltip: i18n('STATE TOOLTIP'),
    //             options: statesKeys.map(function(e) {
    //                 return {
    //                     key: e,
    //                     name: e
    //                 };
    //             }),
    //             onChange: _self.onChangeUf.bind(_self)
    //         });
    //         if (_self.view.stateUf.ctrl._data.options.length == 1) {
    //             _self.view.stateUf.ctrl.setKey(_self.view.stateUf.ctrl._data.options[0].name);
    //         }
    //     } else {
    //         var data = _self.coreServices.allVersionData;
    //         // console.log(data)
    //         var stateOptions = [];
    //         stateOptions.push({
    //             key: data.uf,
    //             name: data.uf
    //         });

    //         _self.view.stateUf.ctrl = _self.view.stateUf.bindBaseSelect({
    //             required: false,
    //             tooltip: i18n('STATE TOOLTIP'),
    //             options: stateOptions,
    //             isDisabled: true,
    //             onChange: _self.onChangeUf.bind(_self)
    //         });
    //         _self.view.stateUf.ctrl.setKey(data.uf);
    //     }
    // },
    // onChangeUf: function(oldVal, newVal) {
    //     var _self = this;
    //     _self.view.branch.empty();
    //     if (_self.eefiStructure != undefined) {
    //         company = _self.view.company.ctrl.getKey();
    //         state = _self.view.stateUf.ctrl.getKey();

    //         var states = _self.eefiStructure[company];
    //         var branches = states[state];

    //         var branchesKeys = $.map(branches, function(item, key) {
    //             return key;
    //         });

    //         _self.view.branch.ctrl = _self.view.branch.bindBaseSelect({
    //             required: false,
    //             tooltip: i18n('TILE BRANCH TOOLTIP'),
    //             options: branchesKeys.map(function(e) {
    //                 return {
    //                     key: e,
    //                     name: e
    //                 };
    //             }),
    //             onChange: _self.onChangeBranch.bind(_self)
    //         });
    //         if (_self.view.branch.ctrl._data.options.length == 1) {
    //             _self.view.branch.ctrl.setKey(_self.view.branch.ctrl._data.options[0].name);
    //         }

    //     } else {
    //         var data = _self.coreServices.allVersionData;
    //         var branchOptions = [];
    //         branchOptions.push({
    //             key: data.idBranch,
    //             name: data.idBranch
    //         });

    //         _self.view.branch.ctrl = _self.view.branch.bindBaseSelect({
    //             required: false,
    //             tooltip: i18n('TILE BRANCH TOOLTIP'),
    //             options: branchOptions,
    //             isDisabled: true,
    //             onChange: _self.onChangeBranch.bind(_self)
    //         });
    //         if (_self.view.branch.ctrl._data.options.length == 1) {
    //             _self.view.branch.ctrl.setKey(_self.view.branch.ctrl._data.options[0].name);
    //         }
    //     }
    // },
    // onChangeBranch: function(oldValue, newVal) {
    //     var _self = this;
    //     if (_self.eefiStructure != undefined) {
    //         company = _self.view.company.ctrl.getKey();
    //         state = _self.view.stateUf.ctrl.getKey();
    //         branch = _self.view.branch.ctrl.getKey();

    //         var states = _self.eefiStructure[company];
    //         var branches = states[state];
    //         var taxes = branches[branch];
    //         var taxesKeys = $.map(taxes, function(item, key) {
    //             return key;
    //         });
    //         var taxID = taxes[taxesKeys];
    //     }
    //     _self.view.tax.empty();
    //     Data.endpoints.dfg.tax.get({
    //         //"idCompany":company,
    //         //"uf": state,
    //         //"idBranch": branch,
    //     }).success(function(_data) {
    //         _self.view.tax.empty();
    //         if (_data.length) {
    //             filterTaxes = [];
    //             _data.map(function(_b) {
    //                 if (taxID == _b.key) {
    //                     filterTaxes.push(_b);
    //                 }
    //             });
    //             _self.view.tax.ctrl = _self.view.tax.bindBaseAutocomplete({
    //                 required: false,
    //                 onChange: _self.onChangeTax.bind(_self),
    //                 tooltip: i18n('TILE TAX TOOLTIP'),
    //                 //placeholder: i18n('TOOLTIP FILTER BY TAX'),
    //                 options: filterTaxes.map(function(_b) {
    //                     return {
    //                         key: _b.key,
    //                         name: _b.name
    //                     }
    //                 }),
    //             })
    //             if (_self.eefiStructure == undefined) {
    //                 var data = _self.coreServices.allVersionData;
    //                 _self.view.tax.empty();
    //                 _self.view.tax.ctrl = _self.view.tax.bindBaseAutocomplete({
    //                     required: false,
    //                     onChange: _self.onChangeTax.bind(_self),
    //                     tooltip: i18n('TILE TAX TOOLTIP'),
    //                     isDisabled: true,
    //                     //placeholder: i18n('TOOLTIP FILTER BY TAX'),
    //                     options: _data.map(function(_b) {
    //                         return {
    //                             key: _b.codTributo,
    //                             name: _b.descrCodTributo
    //                         }
    //                     }),
    //                 });
    //                 _self.view.tax.ctrl.setKey(data.idTax);
    //             }
    //             if (_self.view.tax.ctrl._data.options.length == 1) {
    //                 _self.view.tax.ctrl.setKey(_self.view.tax.ctrl._data.options[0].key);
    //             }
    //         } else {
    //             _self.view.tax.ctrl = _self.view.tax.bindBaseSelect({
    //                 required: false,
    //                 onChange: _self.onChangeTax.bind(_self),
    //                 tooltip: i18n('TILE TAX TOOLTIP'),
    //                 //placeholder: i18n('TOOLTIP FILTER BY BRANCH'),
    //             })
    //         }
    //         /*if (_self.coreServices.book.json.hasOwnProperty("tax") && _self.coreServices.book.json.tax.value) {
    //             _self.view.tax.ctrl.setKey(_self.coreServices.book.json.tax.value);
    //         }*/
    //     }).error(function(e) {
    //         console.log(e)
    //     });

    // },
    // onChangeTax: function(oldVal, newVal) {
    //     var _self = this;
    //     _self.view.subPeriod.empty();
    //     _self.view.subPeriod.ctrl = _self.view.subPeriod.bindBaseFiscalSubPeriodPicker({
    //         onChange: function(oldVal, newVal) {
        
    //         },
    //         idCompany: _self.view.company.ctrl.getKey(),
    //         uf: _self.view.stateUf.ctrl.getKey(),
    //         branch: _self.view.branch.ctrl.getKey(),
    //         idTax: newVal.key,
    //         isEditable: true
    //     });
    //     if (_self.eefiStructure == undefined) {
    //         _self.view.subPeriod.empty();
    //         _self.view.subPeriod.ctrl = _self.view.subPeriod.bindBaseFiscalSubPeriodPicker({
    //             idCompany: _self.view.company.ctrl.getKey(),
    //             uf: _self.view.stateUf.ctrl.getKey(),
    //             branch: _self.view.branch.ctrl.getKey(),
    //             idTax: newVal.key,
    //             isDisabled: true
    //         });
    //         var data = _self.coreServices.allVersionData;
    //         _self.view.subPeriod.ctrl.setValue({
    //             idCompany: _self.view.company.ctrl.getKey(),
    //             uf: _self.view.stateUf.ctrl.getKey(),
    //             branch: _self.view.branch.ctrl.getKey(),
    //             idTax: newVal.key,
    //             year: data.year,
    //             month: data.month,
    //             subperiod: data.subperiod,
    //             isEditable: false
    //         });
    //     }
    // },
    bindTooltips: function() {
        var _self = this;
        $("#create-file-dialog .inputs.executeAn3 label").baseTooltip({
            class: "dark",
            position: "top",
            text: i18n("CLICK PRESS ENTER TO") + " " + i18n("EXECUTE AN3"),
            width: 300
        });
    },
    bindEvents: function() {
        var _self = this;
    },
    initInputs: function() {
        var _self = this;
        _self.inputCompany = $('#inputCompany').bindBaseSelect({
            tooltip: i18n('TILE COMPANY TOOLTIP')
        });
        _self.inputBranch = $('#inputBranch').bindBaseSelect({
            isDisabled: true,
            tooltip: i18n('TILE BRANCH TOOLTIP')
        });
        _self.inputState = $('#inputState').bindBaseSelect({
            tooltip: i18n('STATE TOOLTIP')
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
            _self.inputCompany = $('#inputCompany').bindBaseSelect({
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
                        _self.inputBranch = $("#inputBranch").bindBaseSelect({
                            options: _options,
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
                    _self.inputBranch = $("#inputBranch").bindBaseSelect({
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
        })



    },

    bindEvents: function() {
        var _self = this;
    },
    getOwnData: function() {
        var _self = this;
        var ownData = {};
        ownData.file1 = _self.view.file1.ctrl.getText();
        ownData.file2 = _self.view.file2.ctrl.getText();
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
        $("#chkExecuteAn3").removeAttr('checked');
        _self.bindElements();
    },
    executionValuesSetter: function() {
        var _self = this;
        console.log(_self.coreServices.allVersionData);
        console.log(_self.view.company)
        var data = _self.coreServices.allVersionData;
        var companyOptions = [];
        companyOptions.push({
            key: data.idCompany,
            name: data.idCompany
        });
        console.log(companyOptions.size);
        _self.view.company.empty();
        _self.view.company.ctrl = _self.view.company.bindBaseSelect({
            required: false,
            tooltip: i18n('TILE COMPANY TOOLTIP'),
            options: companyOptions,
            //isDisabled: false,
        });
        _self.view.company.ctrl.setKey(data.idCompany);
    }
});
