/*global i18n Data parseDate _*/
sap.ui.controller("app.controllers.executorSPED.EFDICMSIPI.executeForm", {
    onInit: function() {},
    onAfterRendering: function(html) {
        var _self = this;
        _self.view = $(html);
        _self.view.variant = _self.view.find(".variant-select");
        _self.view.initialRecord = _self.view.find(".initialRecord");
        _self.view.finalRecord = _self.view.find(".finalRecord");
        _self.view.year = _self.view.find(".yearSelect");
        _self.view.period = _self.view.find(".period");
        _self.view.financialVersion = _self.view.find(".financialVersion-input");
        _self.view.layoutVersion = _self.view.find(".layoutVersion-select");
        _self.view.paramRB = _self.view.find(".param-rb");
        _self.view.company = _self.view.find(".company-select");
        _self.view.branch = _self.view.find(".branch-select");
        _self.view.fiscalRegistry = _self.view.find(".fiscal-registry-select");
        _self.view.centralizationBranch = _self.view.find(".centralization-branch-select");
        _self.view.initialDocument = _self.view.find(".initialDocument");
        _self.view.finalDocument = _self.view.find(".finalDocument");
        _self.view.fileCode = _self.view.find(".file-code-select");
        _self.view.recordPrecalculationCB = _self.view.find(".precalculate-cb");
        _self.view.efdCB = _self.view.find(".efd-cb");
        _self.view.blockRB = _self.view.find(".block-rb");
        _self.view.inventoryPeriod = _self.view.find(".inventory-period-select");
        _self.view.plant = _self.view.find(".plant-select");
        _self.view.WIPCB = _self.view.find(".WIP-cb");
        _self.view.precalculatedCB = _self.view.find(".precalculatedE-cb");
        _self.view.runCB = _self.view.find(".run-rb");
        _self.fileData = _self.getData().fileData;
        _self.companyOptions = {};
        _self.idCompany = [];
        _self.idBranch = [];
        _self.uf = []; 
        _self.idTax = [];
        _self.fileData.EEFI.map(function(eefi) {
            if (!_self.companyOptions[eefi.idCompany]) {
                _self.companyOptions[eefi.idCompany] = {
                    key: eefi.idCompany,
                    name: eefi.idCompany,
                    idBranch: {}
                };
            }
            if (_self.idCompany.indexOf(eefi.idCompany) === -1) {
                _self.idCompany.push(eefi.idCompany);
            }
            if (_self.uf.indexOf(eefi.uf) === -1) {
                _self.uf.push(eefi.uf);
            }
            if (_self.idBranch.indexOf(eefi.idBranch) === -1) {
                _self.idBranch.push(eefi.idBranch);
            }
            if (!_self.companyOptions[eefi.idCompany].idBranch[eefi.idBranch]) {
                _self.companyOptions[eefi.idCompany].idBranch[eefi.idBranch] = {
                    key: eefi.idBranch,
                    name: eefi.idBranch,
                    uf: {}
                };
            }
            if (!_self.companyOptions[eefi.idCompany].idBranch[eefi.idBranch].uf[eefi.uf]) {
                _self.companyOptions[eefi.idCompany].idBranch[eefi.idBranch].uf[eefi.uf] = 1;
            }
            if (_self.idTax.indexOf(eefi.idTax) === -1) {
                _self.idTax.push(eefi.idTax);
            }
        });

        _self.bindElements();
        Data.endpoints.dfg.sped.createDialogEFDICMSIPIVariant.post({
            idCompany: _self.idCompany,
            idBranch: _self.idBranch,
            idTax: _self.idTax,
            uf: _self.uf
        }).success(function(data) {
            _self.requiredInformation = data;
            _self.bindComponents();
            _self.view.company.ctrl.disable();
            _self.view.fiscalRegistry.ctrl.disable();
            _self.view.centralizationBranch.ctrl.disable();
        });
    },
    bindElements: function() {
        var _self = this;
        var data = _self.getData();
        _self.view.variant.ctrl = _self.view.variant.bindBaseSelect({
            options: data.variants.map(function(v) {
                return {
                    key: v.id,
                    name: v.name,
                    variantData: v
                };
            }),
            onChange: _self.onChangeVariant.bind(_self)
        });
        _self.view.initialRecord.ctrl = _self.view.initialRecord.bindBaseSelect({
            isLoading: true
        });
        _self.view.finalRecord.ctrl = _self.view.finalRecord.bindBaseSelect({
            isLoading: true
        });

        _self.view.period.ctrl = _self.view.period.bindBaseFiscalSubPeriodPicker({
            required: true,
            idCompany: _self.idCompany,
            uf: _self.uf,
            branch: _self.idBranch,
            idTax: _self.idTax,
            component: "DFG",
            privilege: "setting.execute",
            onChange: _self.onChangePeriod.bind(_self),
            isDisabled: true
        });

        _self.view.financialVersion.ctrl = _self.view.financialVersion.bindBaseInput({});
        _self.view.layoutVersion.ctrl = _self.view.layoutVersion.bindBaseSelect({
            isLoading: true
        });
        _self.view.paramRB.ctrl = _self.view.paramRB.bindBaseInputKat({
            type: 'select',
            required: true,
            options: [{
                key: 'BP',
                name: i18n("BUSINESS SITE")
            }, {
                key: 'IE',
                name: i18n("FISCAL STATE NUMBER")
            }, {
                key: 'CE',
                name: i18n("CENTRAL") + " EFD"
            }],
            tooltip: i18n('ORGANIZATION STRUCTURE'),
            placeholder: i18n('ORGANIZATION STRUCTURE'),
            onChange: function(oldVal, newVal) {
                _self.view.fiscalRegistry.ctrl.setKey(null);
                _self.view.centralizationBranch.ctrl.setKey(null);
                _self.view.company.ctrl.setKey(null);
                _self.view.branch.ctrl.setKey(null);
                _self.view.period.ctrl.setDate(null);
                _self.view.period.ctrl.disable();
                if (newVal && newVal.key) {
                    switch (newVal.key) {
                        case 'BP':
                            _self.view.fiscalRegistry.ctrl.disable();
                            _self.view.centralizationBranch.ctrl.disable();
                            _self.view.company.ctrl.enable();
                            // _self.view.branch.ctrl.enable();
                            break;
                        case 'IE':
                            _self.view.fiscalRegistry.ctrl.enable();
                            _self.view.centralizationBranch.ctrl.disable();
                            _self.view.company.ctrl.disable();
                            _self.view.branch.ctrl.disable();
                            break;
                        case 'CE':
                            _self.view.fiscalRegistry.ctrl.disable();
                            _self.view.centralizationBranch.ctrl.enable();
                            _self.view.company.ctrl.disable();
                            _self.view.branch.ctrl.disable();
                            break;
                    }
                }
            }
        });
        var companyOptions = [];
        _.forEach(_self.companyptions, function(company) {
            companyOptions.push(company);
        });
        _self.view.company.ctrl = _self.view.company.bindBaseSelect({
            options: companyOptions,
            onChange: _self.onChangeCompany.bind(_self)
        });
        _self.view.branch.ctrl = _self.view.branch.bindBaseMultipleSelect3({
            isLoading: true
        });
        _self.view.fiscalRegistry.ctrl = _self.view.fiscalRegistry.bindBaseSelect({
            isDisabled: true
        });
        _self.view.centralizationBranch.ctrl = _self.view.centralizationBranch.bindBaseSelect({
            isDisabled: true
        });
        _self.view.initialDocument.ctrl = _self.view.initialDocument.bindBaseInput({});
        _self.view.finalDocument.ctrl = _self.view.finalDocument.bindBaseInput({});
        _self.view.fileCode.ctrl = _self.view.fileCode.bindBaseSelect({
            options: [{
                key: 0,
                name: i18n("ORIGINAL FILE")
            }, {
                key: 1,
                name: i18n("RECTIFICATION")
            }],
            required: true
        }).setKey(0);
        _self.view.recordPrecalculationCB.ctrl = _self.view.recordPrecalculationCB.bindBaseCheckbox({
            id: 1,
            text: i18n("RECORD PRECALCULATION"),
            onChange: function() {}
        });
        _self.view.recordPrecalculationCB.hide();
        _self.view.efdCB.ctrl = _self.view.efdCB.bindBaseCheckbox({
            id: 1,
            text: i18n("ACTUAL EFD"),
            onChange: function() {}
        });
        _self.view.blockRB.ctrl = _self.view.blockRB.bindBaseInputKat({
            type: 'select',
            required: true,
            options: [{
                key: 'GB',
                name: i18n("GENERATE BLOCK H")
            }, {
                key: 'NGB',
                name: i18n("DO NOT GENERATE BLOCK H")
            }, {
                key: 'FUE',
                name: i18n("END OF LAST BLOCK H")
            }],
            tooltip: i18n('INVENTORY DATA BLOCK H'),
            placeholder: i18n('INVENTORY DATA BLOCK H'),
            onChange: function(oldVal, newVal) {
                _self.view.inventoryPeriod.ctrl.disable();
                _self.view.inventoryPeriod.ctrl.setDate(null);
                if (newVal && newVal.key) {
                    if (newVal.key === 'GB') {
                        _self.view.inventoryPeriod.ctrl.enable();
                    }
                }
            }
        });
        _self.view.WIPCB.ctrl = _self.view.WIPCB.bindBaseCheckbox({
            id: 1,
            text: "WIP",
            onChange: function() {}
        });
        _self.view.precalculatedCB.ctrl = _self.view.precalculatedCB.bindBaseCheckbox({
            id: 1,
            name: "precalculated",
            text: i18n("PRECALCULATED BLOCK E"),
            isChecked: true,
            onChange: function() {}
        });
        _self.view.plant.ctrl = _self.view.plant.bindBaseSelect({
            isLoading: true
        });
        _self.view.inventoryPeriod.ctrl = _self.view.inventoryPeriod.bindBaseFiscalSubPeriodPicker({
            idCompany: _self.idCompany,
            uf: _self.uf,
            branch: _self.idBranch,
            idTax: _self.idTax,
            component: "DFG",
            privilege: "setting.execute",
            required: true
        });
        _self.view.inventoryPeriod.ctrl.disable();
        _self.view.runCB.ctrl = _self.view.runCB.bindBaseInputKat({
            type: 'select',
            required: true,
            options: [{
                key: 'OR',
                name: i18n("OFFICIAL RUN")
            }, {
                key: 'NR',
                name: i18n("DRAFT")
            }],
            tooltip: i18n('INVENTORY DATA BLOCK H'),
            placeholder: i18n('INVENTORY DATA BLOCK H'),
            onChange: function() {}
        });
    },
    bindComponents: function() {
        var _self = this;
        // var recordOptions = [];
        var plantOptions = [];
        for (var p in _self.requiredInformation.plantOptions) {
            plantOptions.push(_self.requiredInformation.plantOptions[p]);
        }
        var stateTaxNumber = [];
        for (var s in _self.requiredInformation.stateTaxNumber) {
            stateTaxNumber.push(_self.requiredInformation.stateTaxNumber[s]);
        }
        var centralEFD = [];
        for (var c in _self.requiredInformation.centralEFD) {
            centralEFD.push(_self.requiredInformation.centralEFD[c]);
        }
        // var spedVersions = [];
        // for (var sv in _self.requiredInformation.spedVersions) {
        //     spedVersions.push(_self.requiredInformation.spedVersions[sv]);
        // }
        _self.view.plant.empty();
        _self.view.plant.ctrl = _self.view.plant.bindBaseSelect({
            options: plantOptions
        });
        _self.view.fiscalRegistry.empty();
        _self.view.fiscalRegistry.ctrl = _self.view.fiscalRegistry.bindBaseSelect({
            options: stateTaxNumber,
            onChange: function(oldVal, newVal) {
                _self.view.period.empty();
                var eef = [{
                    idCompany: newVal.idCompany,
                    idBranch: newVal.idBranch
                }];
                _self.view.period.ctrl = _self.view.period.bindBaseFiscalSubPeriodPicker({
                    required: true,
                    eef: eef,
                    idTax: _self.idTax,
                    component: "DFG",
                    privilege: "setting.execute",
                    onChange: _self.onChangePeriod.bind(_self)
                });
            }
        });
        _self.view.centralizationBranch.empty();
        _self.view.centralizationBranch.ctrl = _self.view.centralizationBranch.bindBaseSelect({
            options: centralEFD,
            onChange: function(oldVal, newVal) {
                _self.view.period.empty();
                var eef = [{
                    idCompany: newVal.idCompany,
                    idBranch: newVal.idBranch
                }];
                _self.view.period.ctrl = _self.view.period.bindBaseFiscalSubPeriodPicker({
                    required: true,
                    eef: eef,
                    idTax: _self.idTax,
                    component: "DFG",
                    privilege: "setting.execute",
                    onChange: _self.onChangePeriod.bind(_self)
                });
            }
        });
        if (window.parameters.subperiod) {
            Data.endpoints.tfpEndpoint.subperiod.getSubperiod.post({
                id: window.parameters.subperiod
            }).success(function(data2) {
                _self.view.company.ctrl.setKey(data2[0].idCompany);
                _self.view.branch.ctrl.setKey([data2[0].idBranch]);
                _self.view.period.ctrl.setValue({
                    idCompany: data2[0].idCompany,
                    uf: data2[0].uf,
                    branch: data2[0].idBranch,
                    idTax: data2[0].tributo.map(function(t) {
                        return t.codTributo;
                    }),
                    year: data2[0].year,
                    month: data2[0].month,
                    subperiod: data2[0].subPeriod,
                    required: true,
                    component: "DFG",
                    privilege: "setting.execute"
                });
            });
        }
    },
    onChangeVariant: function(oldVal, newVal) {
        var _self = this;
        var variantData = newVal.variantData;
        _self.view.initialRecord.ctrl.setKey(variantData.REGISTER_LOW);
        _self.view.finalRecord.ctrl.setKey(variantData.REGISTER_HIGH);
        _self.view.layoutVersion.ctrl.setKey(variantData.SPED_VERSION);
        _self.view.period.ctrl.setValue({
            idCompany: _self.idCompany,
            uf: _self.uf,
            branch: _self.idBranch,
            idTax: _self.idTax,
            year: variantData.YEAREXEC,
            month: variantData.MONTHEXEC,
            subperiod: variantData.SUBPERIODEXEC,
            required: true,
            component: "DFG",
            privilege: "setting.execute"
        });
        _self.view.paramRB.ctrl.setKey(variantData.ORGSTR_PARAM);
        _self.view.company.ctrl.setKey(variantData.BUKRS);
        _self.view.branch.ctrl.setKey([variantData.BRANCH]);
        _self.view.fiscalRegistry.ctrl.setKey(variantData.IE);
        _self.view.centralizationBranch.ctrl.setKey(variantData.CENTRAL_EFD);
        _self.view.initialDocument.ctrl.setText(variantData.DOCNUM_LOW);
        _self.view.finalDocument.ctrl.setText(variantData.DOCNUM_HIGH);
        _self.view.fileCode.ctrl.setKey(variantData.COD_FINALITY);
        if (variantData.EFD_CONTRIB !== "") {
            _self.view.efdCB.ctrl.setChecked(true);
        }
        _self.view.period.ctrl.setValue({
            idCompany: _self.idCompany,
            uf: _self.uf,
            branch: _self.idBranch,
            idTax: _self.idTax,
            year: variantData.IYEAR,
            month: variantData.IMONTH,
            subperiod: variantData.ISUBPERIOD,
            required: true,
            component: "DFG",
            privilege: "setting.execute"
        });
        if (variantData.BLOCKH === "") {
            _self.view.blockRB.ctrl.setKey('NGB');
        } else {
            _self.view.blockRB.ctrl.setKey('GB');
        }
        if (variantData.OFFICIAL_RUN !== "") {
            _self.view.runCB.ctrl.setKey('OR');
        } else {
            _self.view.runCB.ctrl.setKey('NR');
        }
    },
    onChangeCompany: function(oldVal, newVal) {
        var _self = this;
        var branchOptions = [];
        for (var i in newVal.idBranch) {
            branchOptions.push(newVal.idBranch[i]);
        }
        _self.view.branch.empty();
        _self.view.branch.ctrl = _self.view.branch.bindBaseMultipleSelect3({
            options: branchOptions,
            onChange: (function(newVal2) {
                _self.view.period.empty();
                var eef = [];
                newVal2.map(function(nv) {
                    eef.push({
                        idCompany: newVal.key,
                        idBranch: nv.key
                    });
                });
                _self.view.period.ctrl = _self.view.period.bindBaseFiscalSubPeriodPicker({
                    required: true,
                    eef: eef,
                    idTax: _self.idTax,
                    component: "DFG",
                    privilege: "setting.execute",
                    onChange: _self.onChangePeriod.bind(_self)
                });
            }).bind(_self)
        });
        if (branchOptions.length === 1) {
            _self.view.branch.ctrl.setKey([branchOptions[0].key]);
        }
    },
    validateForm: function() {
        var _self = this;
        var periodValue = _self.view.period.ctrl.getValue();
        if (periodValue.subperiod === "" || !periodValue.subperiod) {
            $.baseToast({
                type: 'w',
                text: i18n("MUST FILL SUBPERIOD")
            });
            return false;
        }
        let paramRbOption = _self.view.paramRB.ctrl.getKey();
        let blockRbOption = _self.view.blockRB.ctrl.getKey();
        if (paramRbOption === 'BP') {
            if (!_self.view.company.ctrl.getKey()) {
                $.baseToast({
                    type: 'w',
                    text: i18n("MUST FILL COMPANY")
                });
                return false;
            }
            if (!_self.view.branch.ctrl.getKeys().length) {
                $.baseToast({
                    type: 'w',
                    text: i18n("MUST FILL BRANCH")
                });
                return false;
            }
        }
        if (paramRbOption === 'IE') {
            if (!_self.view.fiscalRegistry.ctrl.getKey()) {
                $.baseToast({
                    type: 'w',
                    text: i18n("MUST FILL STATE TAX NUMBER")
                });
                return false;
            }
        }

        if (_self.view.fileCode.ctrl.getKey() === undefined) {
            $.baseToast({
                type: 'w',
                text: i18n("MUST FILL FILE CODE")
            });
            return false;
        }
        if (paramRbOption === 'CE') {
            if (!_self.view.centralizationBranch.ctrl.getKey()) {
                $.baseToast({
                    type: 'w',
                    text: i18n("MUST FILL CENTRALIZATION BRANCH")
                });
                return false;
            }
        }
        if (blockRbOption === 'GB') {
            var inventoryPeriod = _self.view.inventoryPeriod.ctrl.getValue();
            if (inventoryPeriod.subperiod === "" || !inventoryPeriod.subperiod) {
                $.baseToast({
                    type: 'w',
                    text: i18n("MUST FILL INVENTORY PERIOD")
                });
                return false;
            }
        }
        return true;
    },
    getFormData: function() {
        var _self = this;
        var xmls = {};
        var flag = false;
        var data = {
            'tmf:EFDReportRun': {
                REPORT_ID: '0000000001',
                REPORT_KEY: '',
                ESTR_BALANCO: '',
                DESCRIPTION: '',
                REP_SHADOW_E: ''
            }
        };
        var periodValue = _self.view.period.ctrl.getValue();
        let paramRbOption = _self.view.paramRB.ctrl.getKey();
        let blockRbOption = _self.view.blockRB.ctrl.getKey();
        data['tmf:EFDReportRun'].YEAREXEC = periodValue.year;
        data['tmf:EFDReportRun'].MONTHEXEC = periodValue.month;
        data['tmf:EFDReportRun'].SUBPERIODEXEC = periodValue.subperiod;
        data['tmf:EFDReportRun'].REGISTER_RANGE = {
            SIGN: '',
            OPTION: '',
            LOW: _self.view.initialRecord.ctrl.getKey() ? _self.view.initialRecord.ctrl.getKey() : '',
            HIGH: _self.view.finalRecord.ctrl.getKey() ? _self.view.finalRecord.ctrl.getKey() : ''
        };
        data['tmf:EFDReportRun'].DOCNUM_LOW = _self.view.initialDocument.ctrl.getText() ? _self.view.initialDocument.ctrl.getText() : '';
        data['tmf:EFDReportRun'].DOCNUM_HIGH = _self.view.finalDocument.ctrl.getText() ? _self.view.finalDocument.ctrl.getText() : '';
        data['tmf:EFDReportRun'].COD_FINALITY = _self.view.fileCode.ctrl.getKey();
        data['tmf:EFDReportRun'].SPED_VERSION = _self.view.layoutVersion.ctrl.getKey() ? _self.view.layoutVersion.ctrl.getKey() : '';
        data['tmf:EFDReportRun'].PLANT = _self.view.plant.ctrl.getKey() ? _self.view.plant.ctrl.getKey() : '';
        if (_self.view.efdCB.ctrl.getChecked()) {
            data['tmf:EFDReportRun'].EFD_CONTRIB = 1;
        } else {
            data['tmf:EFDReportRun'].EFD_CONTRIB = '';
        }
        if (_self.view.runCB.ctrl.getKey() === 'OR') {
            data['tmf:EFDReportRun'].OFFICIAL_RUN = 'X';
        } else {
            data['tmf:EFDReportRun'].OFFICIAL_RUN = '';
        }
        if (_self.view.precalculatedCB.ctrl.getChecked()) {
            data['tmf:EFDReportRun'].REP_SHADOW_E = 'X';
        } else {
            data["tmf:EFDReportRun"].REP_SHADOW_E = '';
        }
        if (blockRbOption === 'GB') {
            data['tmf:EFDReportRun'].BLOCKH = 1;
            var inventoryPeriod = _self.view.inventoryPeriod.ctrl.getValue();
            data['tmf:EFDReportRun'].IMONTH = inventoryPeriod.month;
            data['tmf:EFDReportRun'].IYEAR = inventoryPeriod.year;
            data['tmf:EFDReportRun'].ISUBPERIOD = inventoryPeriod.subperiod;
        } else {
            data['tmf:EFDReportRun'].BLOCKH = '';
            data['tmf:EFDReportRun'].IMONTH = '';
            data['tmf:EFDReportRun'].IYEAR = '';
        }
        if (paramRbOption === 'BP') {
            flag = true;
            var keys = _self.view.branch.ctrl.getKeys();
            data['tmf:EFDReportRun'].ORGSTR_PARAM = "BP";
            data['tmf:EFDReportRun'].BUKRS = _self.view.company.ctrl.getKey();
            for (var branch = 0; branch < keys.length; branch++) {
                var n = JSON.parse(JSON.stringify(data));
                var key = data['tmf:EFDReportRun'].BUKRS + "-" + keys[branch];
                n['tmf:EFDReportRun'].BRANCH = keys[branch];
                var stn;
                for (var s in _self.requiredInformation.stateTaxNumber) {
                    stn = _self.requiredInformation.stateTaxNumber[s];
                    if (stn.idCompany === _self.view.company.ctrl.getKey() && stn.idBranch === keys[branch]) {
                        n['tmf:EFDReportRun'].IE = stn.key.split(".").join("");
                        break;
                    }
                }
                xmls[key] = n;
            }
        }
        var value, options, i;
        if (paramRbOption === 'IE') {
            data['tmf:EFDReportRun'].ORGSTR_PARAM = "IE";
            data['tmf:EFDReportRun'].IE = _self.view.fiscalRegistry.ctrl.getKey().split(".").join("");
            options = _self.view.fiscalRegistry.ctrl.getOptions();
            for (i = 0; i < options.length; i++) {
                if (options[i].key === _self.view.fiscalRegistry.ctrl.getKey()) {
                    value = options[i];
                    break;
                }
            }
            data['tmf:EFDReportRun'].BUKRS = value.idCompany;
            data['tmf:EFDReportRun'].BRANCH = value.idBranch;
        }
        value = null;
        if (paramRbOption === 'CE') {
            data['tmf:EFDReportRun'].ORGSTR_PARAM = "CE";
            data['tmf:EFDReportRun'].CENTRAL_EFD = _self.view.centralizationBranch.ctrl.getKey();
            options = _self.view.centralizationBranch.ctrl.getOptions();
            for (i = 0; i < options.length; i++) {
                if (options[i].key === _self.view.centralizationBranch.ctrl.getKey()) {
                    value = options[i];
                    break;
                }
            }
            data['tmf:EFDReportRun'].BUKRS = value.idCompany;
            data['tmf:EFDReportRun'].BRANCH = value.idBranch;
            var stn;
            for (var s in _self.requiredInformation.stateTaxNumber) {
                stn = _self.requiredInformation.stateTaxNumber[s];
                if (stn.idCompany === value.idCompany && stn.idBranch === value.idBranch) {
                    data['tmf:EFDReportRun'].IE = stn.key.split(".").join("");
                    break;
                }
            }
        } else {
            data['tmf:EFDReportRun'].CENTRAL_EFD = '';
        }
        if (!flag) {
            xmls[data['tmf:EFDReportRun'].BUKRS + "-" + data['tmf:EFDReportRun'].BRANCH] = data;
        }
        return xmls;
    },
    onChangePeriod: function() {
        var _self = this;
        var value = _self.view.period.ctrl.getValue();
        var startDate = parseDate(value.startDate.split("GMT")[0], "enus");
        var endDate = parseDate(value.endDate.split("GMT")[0], "enus");
        var spedStartDate;
        var spedEndDate;
        var spedVersions = [];
        // var flag;
        for (var sv in _self.requiredInformation.spedVersions) {
            spedStartDate = parseDate(_self.requiredInformation.spedVersions[sv].validFrom, "enus");
            spedEndDate = parseDate(_self.requiredInformation.spedVersions[sv].validTo, "enus");
            if (_self.compareDates(startDate, spedStartDate) && _self.compareDates(spedEndDate, endDate)) {
                spedVersions.push(_self.requiredInformation.spedVersions[sv]);
            }
        }
        _self.view.layoutVersion.empty();
        _self.view.layoutVersion.ctrl = _self.view.layoutVersion.bindBaseSelect({
            options: spedVersions
        });
    },
    compareDates: function(date1, date2) {
        if (parseInt(date1.year, 10) < parseInt(date2.year, 10)) {
            return false;
        }
        if (parseInt(date1.year, 10) === parseInt(date2.year, 10)) {
            if (parseInt(date1.month, 10) < parseInt(date2.month, 10)) {
                return false;
            }
            if (parseInt(date1.month, 10) === parseInt(date2.month, 10)) {
                if (parseInt(date1.date, 10) < parseInt(date2.date, 10)) {
                    return false;
                }
            }
        }
        return true;
    }
});