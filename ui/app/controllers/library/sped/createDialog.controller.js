sap.ui.controller("app.controllers.library.sped.createDialog", {
    onInit: function() {
        this.data = {
            description: {
                'class': "textarea-class",
                id: "textarea-id"
            }
        };
    },
    onDataRefactor: function(data) {

        return $.extend(data, this.data);
    },
    onAfterRendering: function(html) {
        var _self = this;
        var _data = _self.getData();
        _self.view = $(html);
        _self.view.copyFrom = _self.view.find(".copy-from-select");
        _self.view.name = _self.view.find(".name-input");
        _self.view.description = _self.view.find("#textareaDescription");
        _self.view.layout = _self.view.find(".layout-select");
        _self.view.layoutVersion = _self.view.find(".version-select");
        _self.view.company = _self.view.find(".company-select");
        _self.view.uf = _self.view.find(".uf-select");
        _self.view.branch = _self.view.find(".branch-select");
        _self.view.tax = _self.view.find(".tax-select");
        _self.view.validFrom = _self.view.find(".valid-from-select");
        _self.view.validTo = _self.view.find(".valid-to-select");

        if (_data.mode === "visualize" || _data.mode === "edit") {
            _self.view.copyFrom.parent().hide();

        }
        _self.bindElements();
        Data.endpoints.dfg.sped.createDialog.post({ type: _data.type }).success(function(response) {
            _self.requiredInformation = response;
            _self.bindComponents();
            if (_data.mode === "visualize" || _data.mode === "edit") {

                _self.renderVisualizationEditMode(_data.item);
            }
        });
    },
    bindElements: function() {
        var _self = this;
        var _data = _self.getData();
        _self.view.copyFrom.ctrl = _self.view.copyFrom.bindBaseSelect({
            tooltip: i18n('FILE NAME TOOLTIP'),
            placeholder: i18n('FILE NAME PLACEHOLDER'),
            isLoading: true
        });
        _self.view.name.ctrl = _self.view.name.bindBaseInput({
            validatorType: 2,
            errorMsg: i18n("MANDATORY FIELD"),
            required: true,
            validator: function(value) {
                value = value.trim();
                if (value === "" || value.length >= 40) {
                    return false;
                }
                return true;
            },
            tooltip: i18n('NAME TOOLTIP') + " " + _data.subType + (sessionStorage.lang === "enus" ? " Name" : ""),
            placeholder: i18n('NAME PLACEHOLDER') + " " + _data.subType + (sessionStorage.lang === "enus" ? " Name" : "")
        });
        _self.view.description.ctrl = _self.view.description.find('textarea');
        _self.view.description.ctrl.attr('placeholder', i18n('DESCRIPTION PLACEHOLDER') + " " + _data.subType + (sessionStorage.lang === "enus" ? " Description" : ""));
        _self.view.description.ctrl.baseTooltip({
            class: 'dark',
            position: 'top',
            text: i18n('DESCRIPTION TOOLTIP') + " " + _data.subType + (sessionStorage.lang === "enus" ? " Description" : "")
        });
        _self.view.layout.ctrl = _self.view.layout.bindBaseSelect({
            tooltip: i18n("SELECT LAYOUT TOOLTIP"),
            placeholder: i18n("SELECT LAYOUT"),
            isLoading: true,
            required: true
        });
        _self.view.layoutVersion.ctrl = _self.view.layoutVersion.bindBaseSelect({
            tooltip: i18n("SELECT LAYOUT VERSION"),
            placeholder: i18n("TILE LAYOUT VERSION"),
            isLoading: true,
            required: true
        });
        _self.view.company.ctrl = _self.view.company.bindBaseSelect({
            tooltip: i18n("TILE COMPANY TOOLTIP"),
            placeholder: i18n("TILE COMPANY"),
            isLoading: true,
            required: true
        });
        _self.view.uf.ctrl = _self.view.uf.bindBaseSelect({
            tooltip: i18n("TILE UF TOOLTIP"),
            placeholder: i18n("TILE UF"),
            isLoading: true,
            required: true
        });
        _self.view.branch.ctrl = _self.view.branch.bindBaseSelect({
            tooltip: i18n("TILE BRANCH TOOLTIP"),
            placeholder: i18n("TILE BRANCH"),
            isLoading: true,
            required: true
        });
        _self.view.tax.ctrl = _self.view.tax.bindBaseSelect({
            tooltip: i18n("TILE TAX TOOLTIP"),
            placeholder: i18n("TILE TAX"),
            isLoading: true,
            required: true
        });
        _self.view.validFrom.ctrl = _self.view.validFrom.bindBaseDatePicker({
            required: true,
            errorMsg: i18n("MANDATORY FIELD"),
            tooltip: i18n('TILE VALID FROM TOOLTIP'),
            placeholder: i18n('TILE VALID FROM PLACEHOLDER'),
            onChange: function(oldVal, newVal) {
                var newDate = new Date(newVal.month + '/' + newVal.date + '/' + newVal.year);
                if (newVal !== '' && newDate !== 'Invalid Date') {
                    _self.view.validTo.ctrl.enable();
                    if (_self.view.validTo.ctrl.getDate()) {
                        _self.view.validTo.ctrl._validate();
                    }
                } else {
                    _self.view.validTo.ctrl.disable();
                    _self.view.validTo.ctrl._cleanDate();
                }
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
                    return true;
                }

            }

        });

    },
    bindComponents: function() {
        var _self = this;
        _self.view.copyFrom.empty();
        _self.view.copyFrom.ctrl = _self.view.copyFrom.bindBaseSelect({
            tooltip: i18n('COPY FROM TOOLTIP'),
            placeholder: i18n('COPY FROM'),
            options: _self.requiredInformation.copyFrom,
            onChange: _self.onChangeCopyFrom.bind(_self)
        });
        _self.view.layout.empty();
        _self.view.layout.ctrl = _self.view.layout.bindBaseSelect({
            required: true,
            tooltip: i18n("SELECT LAYOUT TOOLTIP"),
            placeholder: i18n("SELECT LAYOUT"),
            options: _self.requiredInformation.layouts,
            onChange: _self.onChangeLayout.bind(_self)
        });
        _self.view.company.empty();
        _self.view.company.ctrl = _self.view.company.bindBaseMultipleSelect3({
            required: true,
            tooltip: i18n("TILE COMPANY TOOLTIP"),
            placeholder: i18n("FILE COMPANY"),
            options: _self.requiredInformation.companies,
            onChange: _self.onChangeCompany.bind(_self)
        });
    },

    onChangeCopyFrom: function(oldVal, newVal) {
        var _self = this;
        var spedData = newVal.data;
        _self.view.name.ctrl.setText(i18n("COPY OF") + " " + spedData.name);
        _self.view.description.ctrl.val(spedData.description);
        _self.view.layout.ctrl.setKey(spedData.idLayout);
        _self.view.layoutVersion.ctrl.setKey(spedData.idLayoutVersion);

    },
    onChangeLayout: function(oldVal, newVal) {
        var _self = this;
        _self.view.layoutVersion.empty();
        _self.view.layoutVersion.ctrl = _self.view.layoutVersion.bindBaseSelect({
            tooltip: i18n("SELECT LAYOUT VERSION"),
            placeholder: i18n("VERSION TOOLTIP"),
            options: newVal.versions,
            required: true
        });
    },
    onChangeCompany: function(newVal) {
        var _self = this;
        var _data = _self.getData();
        Data.endpoints.dfg.uf.post({
            idCompany: newVal.map(function(v) {
                return v.key;
            }),
        }).success(function(data) {
            _self.view.uf.empty();
            _self.view.uf.ctrl = _self.view.uf.bindBaseMultipleSelect3({
                required: true,
                tooltip: i18n('FILE STATE TOOLTIP'),
                placeholder: i18n('FILE STATE'),
                onChange: _self.onChangeUf.bind(_self),
                options: data.map(function(e, i) {
                    e.key = e.id;
                    return e;
                })
            });
            if (_data.mode === "visualize" || _data.mode === "edit") {
                var ufs = [];
                _data.item.EEFI.map(function(eefi) {
                    if (ufs.indexOf(eefi.uf) === -1) {
                        ufs.push(eefi.uf);
                    }
                });
                _self.view.uf.ctrl.setKey(ufs);
                _self.view.uf.ctrl.disable();
            }
        });
    },
    onChangeUf: function(newVal) {
        var _self = this;
        var _data = _self.getData();
        var mode = _data.mode;
        var item = _data.item;
        Data.endpoints.dfg.branch.post({
            idCompany: _self.view.company.ctrl.getKeys(),
            uf: newVal.map(function(v) {
                return v.key;
            })
        }).success(function(data) {
            _self.view.branch.empty();
            _self.view.branch.ctrl = _self.view.branch.bindBaseMultipleSelect3({
                required: true,
                tooltip: i18n('FILE BRANCH TOOLTIP'),
                placeholder: i18n('FILE BRANCH'),
                onChange: _self.onChangeBranch.bind(_self),
                options: data.map(function(e, i) {
                    e.key = e.idCompany + "_" + e.uf + "_" + e.id;
                    return e;
                })
            });
            if (mode === "visualize" || mode === "edit") {
                var idBranches = [];
                item.EEFI.map(function(eefi) {
                    if (idBranches.indexOf(eefi.idCompany + ";" + eefi.uf + ";" + eefi.idBranch) === -1 && idBranches.indexOf(eefi.idCompany + "_" + eefi.uf + "_" + eefi.idBranch) === -1) {
                        idBranches.push(eefi.idCompany + "_" + eefi.uf + "_" + eefi.idBranch);
                    }
                });
                _self.view.branch.ctrl.setKey(idBranches);
                _self.view.branch.ctrl.disable();
            }

        });
    },
    onChangeBranch: function(newVal) {
        var _self = this;
        var _data = _self.getData();
        var mode = _data.mode;
        var item = _data.item;
        _self.view.tax.empty();
        _self.view.tax.ctrl = _self.view.tax.bindBaseMultipleSelect3({
            required: true,
            tooltip: i18n("TILE TAX TOOLTIP"),
            placeholder: i18n("FILE TAX"),
            options: _self.requiredInformation.taxes,
            onChange: function(newVal) {

            }
        });
        if (mode === "visualize" || mode === "edit") {
            var idTaxes = [];
            item.EEFI.map(function(eefi) {
                if (idTaxes.indexOf(eefi.idTax) === -1) {
                    idTaxes.push(eefi.idTax);
                }
            });
            _self.view.tax.ctrl.setKey(idTaxes);
            _self.view.tax.ctrl.disable();
        }
    },
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
    getCreateData: function() {
        var _self = this;
        var _data = _self.getData();
        var element = {
            type: _data.type
        };
        element.name = _self.view.name.ctrl.getText();
        element.description = _self.view.description.ctrl.val();
        element.idLayout = _self.view.layout.ctrl.getKey();
        element.idLayoutVersion = _self.view.layoutVersion.ctrl.getKey();
        element.eefi = {};
        var eefiKeys = _self.view.branch.ctrl.getKeys();
        var taxKeys = _self.view.tax.ctrl.getKeys();
        var keys = [];
        for (var i = 0; i < taxKeys.length; i++) {
            for (var j = 0; j < eefiKeys.length; j++) {
                keys = eefiKeys[j].split("_");
                element.eefi[eefiKeys[j] + "_" + taxKeys[i]] = {
                    idCompany: keys[0],
                    uf: keys[1],
                    idBranch: keys[2],
                    idTax: taxKeys[i].indexOf("G") > -1 ? taxKeys[i].split("G")[0] : taxKeys[i],
                    isTaxGroup: taxKeys[i].indexOf("G") > -1
                };
            }
        }
        element.validFrom = _self.view.validFrom.ctrl.getValue().hanaDate;
        element.validTo = _self.view.validTo.ctrl.getValue().hanaDate;
        return element;
    },
    validateCreateData: function() {
        var _self = this;
        if (_self.view.name.ctrl.getText() === "") {
            return false;
        }
        if (_self.view.layout.ctrl.getKey() === undefined) {
            return false;
        }
        if (_self.view.layoutVersion.ctrl.getKey() === undefined) {
            return false;
        }
        if (_self.view.company.ctrl.getKeys() === undefined) {
            return false;
        }
        if (_self.view.branch.ctrl.getKeys() === undefined) {
            return false;
        }
        if (_self.view.uf.ctrl.getKeys() === undefined) {
            return false;
        }
        if (_self.view.tax.ctrl.getKeys() === undefined) {
            return false;
        }
        if (_self.view.validFrom.ctrl.getDate() === undefined) {
            return false;
        }
        if (!_self.view.validFrom.ctrl._validate()) {
            return false;
        }
        return true;
    },
    renderVisualizationEditMode: function(item, type) {
        var _self = this;
        var disableFlag = type === "visualize";
        _self.view.name.ctrl.setText(item.name);
        _self.view.description.ctrl.val(item.description);
        _self.view.layout.ctrl.setKey(item.idLayout);
        _self.view.layout.ctrl.disable();
        _self.view.layoutVersion.ctrl.setKey(item.idLayoutVersion);
        _self.view.layoutVersion.ctrl.disable();
        var diffKeys = [];
        item.EEFI.map(function(eefi) {
            if(diffKeys.indexOf(eefi.idCompany) === -1){
                diffKeys.push(eefi.idCompany);
            }
        });
        _self.view.company.ctrl.setKey(diffKeys);
        _self.view.company.ctrl.disable();
        _self.view.validFrom.ctrl.setValue({
            "hanaDate": new Date(item.validFrom)
        });
        _self.view.validFrom.ctrl.disable();
        if (item.validTo !== null && item.validTo) {
            _self.view.validTo.ctrl.setValue({
                "hanaDate": new Date(item.validTo)
            });
        }
         if (disableFlag) {
            _self.view.name.ctrl.disable();
            _self.view.description.ctrl.attr("disabled", true);
            _self.view.description.ctrl.css("background-color", "#F3F2F2");
            _self.view.validTo.ctrl.disable();
        }
        
    },
    getEditData: function(item) {
        var _self = this;
        var _data = _self.getData();
        var element = {
            type: _data.type
        };
        element.name = _self.view.name.ctrl.getText();
        element.description = _self.view.description.ctrl.val();
        return element;
    }
});
