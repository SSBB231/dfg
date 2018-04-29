sap.ui.controller("app.controllers.dialogs.eefiDialog", {
    onInit: function() {},
    onAfterRendering: function(html) {
        var _self = this;
        var _data = _self.getData();
        _self.view = $(html);
        _self.view.version = _self.view.find("#inputVersion");
        _self.view.company = _self.view.find("#inputCompany");
        _self.view.state = _self.view.find("#inputState");
        _self.view.branch = _self.view.find("#inputBranch");
        _self.view.tax = _self.view.find("#taxSelect");
        _self.view.subPeriod = _self.view.find("#subPeriodPic");
        if (_data.type === "an3") {
            _self.view.version.parent().hide();
            _self.bindElements();
        }
        _self.eefiData = {};


    },
    bindElements: function() {
        var _self = this;
        var data = _self.getData();

        var companyOptions = [];
        for (var c in data.companyOptions) {
            companyOptions.push({
                key: c,
                name: c,
                ufOptions: data.companyOptions[c].uf
            });
        }
        _self.view.company.empty();
        _self.view.company.ctrl = _self.view.company.bindBaseSelect({
            options: companyOptions,
            tooltip: i18n('FILE COMPANY TOOLTIP'),
            placeholder: i18n('FILE COMPANY'),
            onChange: _self.onChangeCompany.bind(_self),
            required: true,
        });
        

        _self.view.state.empty();
        _self.view.state.ctrl = _self.view.state.bindBaseSelect({
            options: [],
            tooltip: i18n('FILE STATE TOOLTIP'),
            placeholder: i18n('FILE STATE'),
            isLoading: true,
            required: true
        });
        _self.view.branch.empty();
        _self.view.branch.ctrl = _self.view.branch.bindBaseSelect({
            options: [],
            tooltip: i18n('FILE BRANCH TOOLTIP'),
            placeholder: i18n('FILE BRANCH'),
            required: true,
            isDisabled: true
        });
        _self.view.tax.empty();
        _self.view.tax.ctrl = _self.view.tax.bindBaseSelect({
            options: [],
            tooltip: i18n('FILE TAX TOOLTIP'),
            placeholder: i18n('FILE TAX'),
            required: true,
            isDisabled: true
        });
        _self.view.subPeriod.empty();
        _self.view.subPeriod.ctrl = _self.view.subPeriod.bindBaseFiscalSubPeriodPicker({

            isEditable: false,
            isDisabled: true
        });
        if (companyOptions.length === 1) {
            _self.view.company.ctrl.setKey(companyOptions[0].key);
        }
    },
    setLayout: function(id, side) {
        var _self = this;
        _self.idLayout = id;
        _self.side = side;
        _self.bindElements();
    },
    onChangeCompany: function(oldVal, newVal) {
        var _self = this;
        var ufOptions = [];

        for (var u in newVal.ufOptions) {
            ufOptions.push({
                key: u,
                name: u,
                branchOptions: newVal.ufOptions[u].idBranch
            });
        }
        _self.view.state.empty();
        _self.view.state.ctrl = _self.view.state.bindBaseSelect({
            options: ufOptions,
            tooltip: i18n('FILE STATE TOOLTIP'),
            placeholder: i18n('FILE STATE'),
            onChange: _self.onChangeUf.bind(_self),
            required: true
        });
        if (ufOptions.length === 1) {
            _self.view.state.ctrl.setKey(ufOptions[0].key);
        }
    },
    onChangeUf: function(oldVal, newVal) {
        var _self = this;
        var branchOptions = [];
        for (var b in newVal.branchOptions) {
            branchOptions.push({
                key: b,
                name: b,
                idTax: newVal.branchOptions[b].idTax
            });
        }

        _self.view.branch.empty();
        _self.view.branch.ctrl = _self.view.branch.bindBaseSelect({
            options: branchOptions,
            tooltip: i18n('FILE BRANCH TOOLTIP'),
            placeholder: i18n('FILE BRANCH'),
            required: true,
            onChange: _self.onChangeBranch.bind(_self)
        });
        if (branchOptions.length === 1) {
            _self.view.branch.ctrl.setKey(branchOptions[0].key);
        }
    },
    onChangeBranch: function(oldVal, newVal) {
        var _self = this;
        Data.endpoints.dfg.tax.post().success(function(data) {
            var taxOptions = [];
            for (var i = 0; i < data.length; i++) {
                if (newVal.idTax == data[i].key) {
                    taxOptions.push(data[i]);
                    break;
                }
            }
            _self.view.tax.empty();
            _self.view.tax.ctrl = _self.view.tax.bindBaseSelect({
                options: taxOptions,
                tooltip: i18n('FILE TAX TOOLTIP'),
                placeholder: i18n('FILE TAX'),
                required: true,
                onChange: _self.onChangeTax.bind(_self)
            });
            if (taxOptions.length === 1) {
                _self.view.tax.ctrl.setKey(taxOptions[0].key);
            }
        });

    },
    onChangeTax: function(oldVal, newVal) {
        var _self = this;
        _self.view.subPeriod.empty();
        _self.view.subPeriod.ctrl = _self.view.subPeriod.bindBaseFiscalSubPeriodPicker({
            idCompany: _self.view.company.ctrl.getKey(),
            uf: _self.view.state.ctrl.getKey(),
            branch: _self.view.branch.ctrl.getKey(),
            idTax: _self.view.tax.ctrl.getKey(),
            component: "DFG",
            privilege: "setting.execute",
            required: true,
            isEditable: true
        });
    },
    getEefi: function() {
        var data = {};
        var _self = this;
        var _data = _self.getData();
        if (_data.type === "an4") {
            _self.eefiData.idLayout1 = _self.idLayout;
            _self.eefiData.idRule = _self.getData().idRule;
            data.eefiData = _self.eefiData;
            data.side = _self.side;
        } else {
            var subperiod = _self.view.subPeriod.ctrl.getValue();
            data = {
                idCompany: _self.view.company.ctrl.getKey(),
                uf: _self.view.state.ctrl.getKey(),
                idBranch: _self.view.branch.ctrl.getKey(),
                idTax: _self.view.tax.ctrl.getKey(),
                subperiod: subperiod.subperiod,
                month: subperiod.month,
                year: subperiod.year
            };
        }

        return data;
    }
});
