sap.ui.controller("app.controllers.library.an4.createDialog", {
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
        _self.view.copy = _self.view.find(".copy-from-select");
        _self.view.name = _self.view.find(".name-input");
        _self.view.description = _self.view.find("#textareaDescription");
        _self.view.layoutTypeReference = _self.view.find("#inputSelectTypeFileReference");
        _self.view.dfgLayoutReference = _self.view.find(".layout-dfg-selectReference");
        _self.view.dfgLayoutVersionReference = _self.view.find(".version-selectReference");
        _self.view.dfgSettingReference = _self.view.find(".setting-dfg-selectReference");
        _self.view.bfbLayoutReference = _self.view.find(".layout-bfb-selectReference");
        _self.view.originReference = _self.view.find(".origin-selectReference");
        _self.view.filterBtnReference = _self.view.find(".filter-btnReference");
        _self.view.digitalFileReference = _self.view.find(".fileReference");
        _self.view.externalFileReference = _self.view.find(".external-fileReference");
        _self.view.externalFileReference.input = _self.view.externalFileReference.find("input");
        _self.view.layoutTypeComparison = _self.view.find("#inputSelectTypeFileComparison");
        _self.view.dfgLayoutComparison = _self.view.find(".layout-dfg-selectComparison");
        _self.view.dfgLayoutVersionComparison = _self.view.find(".version-selectComparison");
        _self.view.dfgSettingComparison = _self.view.find(".setting-dfg-selectComparison");
        _self.view.bfbLayoutComparison = _self.view.find(".layout-bfb-selectComparison");
        _self.view.originComparison = _self.view.find(".origin-selectComparison");
        _self.view.filterBtnComparison = _self.view.find(".filter-btnComparison");
        _self.view.digitalFileComparison = _self.view.find(".fileComparison");
        _self.view.externalFileComparison = _self.view.find(".external-fileComparison");
        _self.view.externalFileComparison.input = _self.view.externalFileComparison.find("input");
        _self.view.rule = _self.view.find(".rule-select");
        _self.view.filterBtnReference.hide();
        _self.view.digitalFileReference.parent().hide();
        _self.view.externalFileReference.parent().hide();
        _self.view.filterBtnComparison.hide();
        _self.view.digitalFileComparison.parent().hide();
        _self.view.externalFileComparison.parent().hide();

        _self.loader = _self.view.baseLoader({
            modal: true
        });
        _self.bindElements();
        _self.bindEvents();
        _self.loader.open();
        Data.endpoints.dfg.an4.createDialog.post().success(function(data) {
            _self.requiredInformation = data;
            _self.bindComponents();
            if (_data.mode) {
                _self.view.copy.parent().hide();
                _self.renderVisualizationEditMode(_data.item, _data.mode);
            }
            _self.loader.close();
        }).error(function(err) {
            _self.loader.close();
        });
    },
    bindElements: function() {
        var _self = this;
        var _data = _self.getData();
        _self.view.copy.ctrl = _self.view.copy.bindBaseSelect({
            tooltip: i18n('COPY FROM TOOLTIP'),
            placeholder: i18n('COPY FROM'),
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
            tooltip: i18n('FILE NAME TOOLTIP'),
            placeholder: i18n('FILE NAME')
        });
        _self.view.description.ctrl = _self.view.description.find('textarea');
        _self.view.description.ctrl.attr('placeholder', i18n('FILE DESCRIPTION'));
        _self.view.layoutTypeReference.ctrl = _self.view.layoutTypeReference.bindBaseSelect({
            tooltip: i18n("SELECT LAYOUT TYPE TOOLTIP"),
            placeholder: i18n("SELECT LAYOUT TYPE"),
            isLoading: true,
            required: true
        });
        _self.view.dfgLayoutReference.ctrl = _self.view.dfgLayoutReference.bindBaseSelect({
            tooltip: i18n("SELECT LAYOUT TOOLTIP"),
            placeholder: i18n("SELECT LAYOUT"),
            isLoading: true,
            required: true
        });
        _self.view.dfgLayoutVersionReference.ctrl = _self.view.dfgLayoutVersionReference.bindBaseSelect({
            tooltip: i18n("SELECT LAYOUT VERSION"),
            placeholder: i18n("TILE LAYOUT VERSION"),
            isLoading: true,
            required: true
        });
        _self.view.dfgSettingReference.ctrl = _self.view.dfgSettingReference.bindBaseSelect({
            tooltip: i18n("SELECT SETTING"),
            placeholder: i18n("TILE SETTING"),
            isLoading: true
        });

        _self.view.bfbLayoutReference.ctrl = _self.view.bfbLayoutReference.bindBaseSelect({
            tooltip: i18n("SELECT BFB LAYOUT TOOLTIP"),
            placeholder: i18n("SELECT BFB LAYOUT"),
            isLoading: true
        });
        _self.view.originReference.ctrl = _self.view.originReference.bindBaseSelect({
            tooltip: i18n("SELECT ORIGIN TOOLTIP"),
            placeholder: i18n("SELECT ORIGIN"),
            required: true,
            options: [{
                key: 1,
                name: "DFG"
            }, {
                key: 2,
                name: i18n("EXTERNAL")
            }],
            onChange: function(oldVal, newVal) {
                _self.onChangeOrigin(oldVal, newVal, true);
            }
        });
        _self.view.originReference.ctrl.setKey(1);
        if (_data.mode) {
            if (_data.item.originReference === 1) {
                _self.view.originReference.ctrl.setKey(1);
            } else {
                _self.view.originReference.ctrl.setKey(2);
            }
            _self.view.originReference.ctrl.disable();

        }
        _self.view.digitalFileReference.ctrl = _self.view.digitalFileReference.bindBaseSelect({
            tooltip: i18n("SELECT DIGITAL FILE TOOLTIP"),
            placeholder: i18n("SELECT DIGITAL FILE"),
            required: true,
            isLoading: true
        });
        _self.view.layoutTypeComparison.ctrl = _self.view.layoutTypeComparison.bindBaseSelect({
            tooltip: i18n("SELECT LAYOUT TYPE TOOLTIP"),
            placeholder: i18n("SELECT LAYOUT TYPE"),
            isLoading: true,
            required: true
        });
        _self.view.dfgLayoutComparison.ctrl = _self.view.dfgLayoutComparison.bindBaseSelect({
            tooltip: i18n("SELECT LAYOUT TOOLTIP"),
            placeholder: i18n("SELECT LAYOUT"),
            isLoading: true,
            required: true
        });
        _self.view.dfgLayoutVersionComparison.ctrl = _self.view.dfgLayoutVersionComparison.bindBaseSelect({
            tooltip: i18n("SELECT LAYOUT VERSION"),
            placeholder: i18n("TILE LAYOUT VERSION"),
            isLoading: true,
            required: true
        });
        _self.view.dfgSettingComparison.ctrl = _self.view.dfgSettingComparison.bindBaseSelect({
            tooltip: i18n("SELECT SETTING"),
            placeholder: i18n("TILE SETTING"),
            isLoading: true
        });
        _self.view.bfbLayoutComparison.ctrl = _self.view.bfbLayoutComparison.bindBaseSelect({
            tooltip: i18n("SELECT BFB LAYOUT TOOLTIP"),
            placeholder: i18n("SELECT BFB LAYOUT"),
            isLoading: true
        });
        _self.view.originComparison.ctrl = _self.view.originComparison.bindBaseSelect({
            tooltip: i18n("SELECT ORIGIN TOOLTIP"),
            placeholder: i18n("SELECT ORIGIN"),
            required: true,
            options: [{
                key: 1,
                name: "DFG"
            }, {
                key: 2,
                name: i18n("EXTERNAL")
            }],
            onChange: function(oldVal, newVal) {
                _self.onChangeOrigin(oldVal, newVal, false);
            }
        });
        _self.view.originComparison.ctrl.setKey(1);
        if (_data.mode) {
            if (_data.item.originComparison === 1) {
                _self.view.originComparison.ctrl.setKey(1);
            } else {
                _self.view.originComparison.ctrl.setKey(2);
            }
            _self.view.originComparison.ctrl.disable();

        }
        _self.view.digitalFileComparison.ctrl = _self.view.digitalFileComparison.bindBaseSelect({
            tooltip: i18n("SELECT DIGITAL FILE TOOLTIP"),
            placeholder: i18n("SELECT DIGITAL FILE"),
            required: true,
            isLoading: true
        });
        _self.view.rule.ctrl = _self.view.rule.bindBaseMultipleSelect3({
            tooltip: i18n("SELECT RULE TOOLTIP"),
            placeholder: i18n("SELECT RULE"),
            isLoading: true,
            required: true
        });

    },

    bindEvents: function() {
        var _self = this;


        _self.view.filterBtnReference.bind("click", function(evt) {
            if (_self.view.dfgSettingReference.ctrl.getKey()) {
                _self.initializeFilterDialog(true);
            } else {
                $.baseToast({
                    text: i18n("MUST FILL SETTING FIELD")
                });
            }
        });
        _self.view.filterBtnComparison.bind("click", function(evt) {
            if (_self.view.dfgSettingComparison.ctrl.getKey()) {
                _self.initializeFilterDialog();
            } else {
                $.baseToast({
                    text: i18n("MUST FILL SETTING FIELD")
                });
            }
        });
        _self.view.externalFileReference.input.change(function(evt) {
            if (this.filesReference && this.filesReference[0]) {
                _self.view.find(".fileNameReference").text(this.filesReference[0].name);
            }
        });
        _self.view.externalFileComparison.input.change(function(evt) {
            if (this.filesComparison && this.filesComparison[0]) {
                _self.view.find(".fileNameComparison").text(this.filesComparison[0].name);
            }
        });
    },
    initializeFilterDialog: function(isReference) {
        var _self = this;
        _self.dialogFilter = $.baseDialog({
            title: i18n('ADD FILTER TITLE'),
            modal: true,
            size: "big",
            outerClick: 'disabled',
            cssClass: "newFile",
            viewName: "app.views.dialogs.eefiDialog",
            viewData: {
                type: 'an3',
                companyOptions: isReference ? _self.companyOptionsReference : _self.companyOptionsComparison
            },
            buttons: [{
                name: i18n('CANCEL'),
                isCloseButton: true,
                tooltip: i18n('CLICK PRESS CANCEL'),
                click: function() {

                }
            }, {
                name: i18n('APPLY'),
                click: function() {
                    var data = _self.dialogFilter.getInnerController().getEefi();
                    data.idSettingVersion = isReference ? _self.idSettingVersionReference : _self.idSettingVersionComparison;
                    _self.getActiveDigitalFiles(data, isReference);
                    _self.dialogFilter.close();
                },
                tooltip: i18n('CLICK PRESS CONFIRM')
            }]
        });
        _self.dialogFilter.open();
    },
    getActiveDigitalFiles: function(data, isReference) {
        var _self = this;
        var _data = _self.getData();
        Data.endpoints.dfg.digitalFile.getActiveDigitalFiles.post(data).success(function(data) {
            if (isReference) {
                _self.view.digitalFileReference.empty();
                _self.view.digitalFileReference.ctrl = _self.view.digitalFileReference.bindBaseSelect({
                    tooltip: i18n("SELECT DIGITAL FILE TOOLTIP"),
                    placeholder: i18n("SELECT DIGITAL FILE"),
                    required: true,
                    options: data.map(function(file) {
                        return {
                            key: file.id,
                            name: "ID" + file.id + "-" + file.name
                        };
                    })
                });
                if (_data.mode) {
                    _self.view.digitalFileReference.ctrl.setKey(_data.item.idDigitalFileReference);
                    _self.view.digitalFileReference.ctrl.disable();
                }
                if (_self.an4Data) {
                    _self.view.digitalFileReference.ctrl.setKey(_self.an4Data.idDigitalFileReference);
                }
                _self.view.digitalFileReference.ctrl.focus();
            } else {
                _self.view.digitalFileComparison.empty();
                _self.view.digitalFileComparison.ctrl = _self.view.digitalFileComparison.bindBaseSelect({
                    tooltip: i18n("SELECT DIGITAL FILE TOOLTIP"),
                    placeholder: i18n("SELECT DIGITAL FILE"),
                    required: true,
                    options: data.map(function(file) {
                        return {
                            key: file.id,
                            name: "ID" + file.id + "-" + file.name
                        };
                    })
                });
                if (_data.mode) {
                    _self.view.digitalFileComparison.ctrl.setKey(_data.item.idDigitalFileComparison);
                    _self.view.digitalFileComparison.ctrl.disable();
                }
                if (_self.an4Data) {
                    _self.view.digitalFileComparison.ctrl.setKey(_self.an4Data.idDigitalFileComparison);
                }
                _self.view.digitalFileComparison.ctrl.focus();
            }

        });
    },
    bindComponents: function() {
        var _self = this;

        _self.view.copy.empty();
        _self.view.copy.ctrl = _self.view.copy.bindBaseSelect({
            tooltip: i18n('COPY FROM TOOLTIP'),
            placeholder: i18n('COPY FROM'),
            options: _self.requiredInformation.an4.map(function(an4) {
                return {
                    key: an4.id,
                    name: "ID" + an4.id + "-" + an4.name,
                    an4Data: an4
                };
            }),
            onChange: _self.onChangeCopyFrom.bind(_self)
        });
        _self.view.layoutTypeReference.empty();
        _self.view.layoutTypeReference.ctrl = _self.view.layoutTypeReference.bindBaseSelect({
            tooltip: i18n("SELECT LAYOUT TYPE TOOLTIP"),
            placeholder: i18n("SELECT LAYOUT TYPE"),
            options: _self.requiredInformation.digitalFileTypes.map(function(type) {
                return {
                    key: type.id,
                    name: type.name
                };
            }),
            required: true,
            onChange: function(oldVal, newVal) {
                _self.onChangeLayoutType(oldVal, newVal, true);
            }
        });
        _self.view.layoutTypeComparison.empty();
        _self.view.layoutTypeComparison.ctrl = _self.view.layoutTypeComparison.bindBaseSelect({
            tooltip: i18n("SELECT LAYOUT TYPE TOOLTIP"),
            placeholder: i18n("SELECT LAYOUT TYPE"),
            options: _self.requiredInformation.digitalFileTypes.map(function(type) {
                return {
                    key: type.id,
                    name: type.name
                };
            }),
            required: true,
            onChange: function(oldVal, newVal) {
                _self.onChangeLayoutType(oldVal, newVal, false);
            }
        });
    },
    onChangeCopyFrom: function(oldVal, newVal) {
        var _self = this;
        var an4Data = newVal.an4Data;
        _self.view.name.ctrl.setText(i18n("COPY OF") + " " + an4Data.name);
        _self.view.description.ctrl.val(an4Data.description);
        _self.view.layoutType.ctrl.setKey(an4Data.idDigitalFileType);
        _self.an4Data = an4Data;
    },
    onChangeLayoutType: function(oldVal, newVal, isReference) {
        var _self = this;
        var _data = _self.getData();
        Data.endpoints.dfg.layout.getActiveLayouts.post({ idDigitalFileType: newVal.key, noStructure: true }).success(function(data) {
            if (isReference) {
                _self.view.dfgLayoutReference.empty();
                _self.view.dfgLayoutReference.ctrl = _self.view.dfgLayoutReference.bindBaseSelect({
                    tooltip: i18n("SELECT LAYOUT TOOLTIP"),
                    placeholder: i18n("SELECT LAYOUT"),
                    options: data.map(function(layout) {
                        return {
                            key: layout.id,
                            name: "ID" + layout.id + "-" + layout.name,
                            layoutVersions: layout.layoutVersions
                        };
                    }),
                    onChange: function(oldVal, newVal) {
                        _self.onChangeDFGLayout(oldVal, newVal, true);
                    },
                    required: true
                });
                if (_data.mode) {
                    var layoutId;
                    data.map(function(layout) {
                        layout.layoutVersions.map(function(version) {
                            if (version.id === _data.item.idLayoutVersionReference) {
                                layoutId = layout.id;
                            }
                        });
                    });
                    _self.view.dfgLayoutReference.ctrl.setKey(layoutId);
                    _self.view.dfgLayoutReference.ctrl.disable();
                    _self.view.layoutTypeComparison.ctrl.setKey(_data.item.idDigitalFileTypeComparison);
                    _self.view.layoutTypeComparison.ctrl.disable();
                }
                if (_self.an4Data) {
                    var layoutId;
                    data.map(function(layout) {
                        layout.layoutVersions.map(function(version) {
                            if (version.id === _self.an4Data.idLayoutVersionReference) {
                                layoutId = layout.id;
                            }
                        });
                    });
                    _self.view.dfgLayoutReference.ctrl.setKey(layoutId);
                    _self.view.layoutTypeComparison.ctrl.setKey(_self.an4Data.idDigitalFileTypeComparison);
                    _self.view.layoutTypeComparison.ctrl.disable();

                }
            } else {
                _self.view.dfgLayoutComparison.empty();
                _self.view.dfgLayoutComparison.ctrl = _self.view.dfgLayoutComparison.bindBaseSelect({
                    tooltip: i18n("SELECT LAYOUT TOOLTIP"),
                    placeholder: i18n("SELECT LAYOUT"),
                    options: data.map(function(layout) {
                        return {
                            key: layout.id,
                            name: "ID" + layout.id + "-" + layout.name,
                            layoutVersions: layout.layoutVersions
                        };
                    }),
                    onChange: function(oldVal, newVal) {
                        _self.onChangeDFGLayout(oldVal, newVal, false);
                    },
                    required: true
                });
                if (_data.mode) {
                    var layoutId;
                    data.map(function(layout) {
                        layout.layoutVersions.map(function(version) {
                            if (version.id === _data.item.idLayoutVersionComparison) {
                                layoutId = layout.id;
                            }
                        });
                    });
                    _self.view.dfgLayoutComparison.ctrl.setKey(layoutId);
                    _self.view.dfgLayoutComparison.ctrl.disable();
                }
                if (_self.an4Data) {
                    var layoutId;
                    data.map(function(layout) {
                        layout.layoutVersions.map(function(version) {
                            if (version.id === _self.an4Data.idLayoutVersionComparison) {
                                layoutId = layout.id;
                            }
                        });
                    });
                    _self.view.dfgLayoutComparison.ctrl.setKey(layoutId);
                }

            }
        });
    },
    onChangeDFGLayout: function(oldVal, newVal, isReference) {
        var _self = this;
        var _data = _self.getData();
        if (isReference) {
            _self.view.dfgLayoutVersionReference.empty();
            _self.view.dfgLayoutVersionReference.ctrl = _self.view.dfgLayoutVersionReference.bindBaseSelect({
                tooltip: i18n("SELECT LAYOUT VERSION"),
                placeholder: i18n("TILE LAYOUT VERSION"),
                required: true,
                options: newVal.layoutVersions.map(function(version) {
                    return {
                        key: version.id,
                        name: version.version
                    };
                }),
                onChange: function(oldVal, newVal) {
                    _self.onChangeDFGLayoutVersion(oldVal, newVal, true);
                }
            });
            if (_data.mode) {
                _self.view.dfgLayoutVersionReference.ctrl.setKey(_data.item.idLayoutVersionReference);
                _self.view.dfgLayoutVersionReference.ctrl.disable();
            }
            if (_self.an4Data) {
                _self.view.dfgLayoutVersionReference.ctrl.setKey(_self.an4Data.idLayoutVersionReference);
            }

            _self.view.dfgLayoutVersionReference.ctrl.focus();
        } else {
            _self.view.dfgLayoutVersionComparison.empty();
            _self.view.dfgLayoutVersionComparison.ctrl = _self.view.dfgLayoutVersionComparison.bindBaseSelect({
                tooltip: i18n("SELECT LAYOUT VERSION"),
                placeholder: i18n("TILE LAYOUT VERSION"),
                required: true,
                options: newVal.layoutVersions.map(function(version) {
                    return {
                        key: version.id,
                        name: version.version
                    };
                }),
                onChange: function(oldVal, newVal) {
                    _self.onChangeDFGLayoutVersion(oldVal, newVal, false);
                }
            });
            if (_data.mode) {
                _self.view.dfgLayoutVersionComparison.ctrl.setKey(_data.item.idLayoutVersionComparison);
                _self.view.dfgLayoutVersionComparison.ctrl.disable();
            }
            if (_self.an4Data) {
                _self.view.dfgLayoutVersionComparison.ctrl.setKey(_self.an4Data.idLayoutVersionComparison);
            }
            _self.view.dfgLayoutVersionComparison.ctrl.focus();
        }

    },
    onChangeDFGLayoutVersion: function(oldVal, newVal, isReference) {
        var _self = this;
        var _data = _self.getData();
        Data.endpoints.bfb.getBFBLayoutXDFGLayout.post({ idDFGLayoutVersion: newVal.key }).success(function(data) {
            if (isReference) {
                _self.view.bfbLayoutReference.empty();
                _self.view.bfbLayoutReference.ctrl = _self.view.bfbLayoutReference.bindBaseSelect({
                    tooltip: i18n("SELECT BFB LAYOUT TOOLTIP"),
                    placeholder: i18n("SELECT BFB LAYOUT"),
                    options: data.map(function(layout) {
                        return {
                            key: layout.id,
                            name: layout.name
                        };
                    })
                });
            } else {
                _self.view.bfbLayoutComparison.empty();
                _self.view.bfbLayoutComparison.ctrl = _self.view.bfbLayoutComparison.bindBaseSelect({
                    tooltip: i18n("SELECT BFB LAYOUT TOOLTIP"),
                    placeholder: i18n("SELECT BFB LAYOUT"),
                    options: data.map(function(layout) {
                        return {
                            key: layout.id,
                            name: layout.name
                        };
                    })
                });
            }

        }).error(function(err) {
            if (isReference) {
                _self.view.bfbLayoutReference.empty();
                _self.view.bfbLayoutReference.ctrl = _self.view.bfbLayoutReference.bindBaseSelect({
                    tooltip: i18n("SELECT BFB LAYOUT TOOLTIP"),
                    placeholder: i18n("SELECT BFB LAYOUT"),
                    options: []
                });

            } else {
                _self.view.bfbLayoutComparison.empty();
                _self.view.bfbLayoutComparison.ctrl = _self.view.bfbLayoutComparison.bindBaseSelect({
                    tooltip: i18n("SELECT BFB LAYOUT TOOLTIP"),
                    placeholder: i18n("SELECT BFB LAYOUT"),
                    options: []
                });
            }
        })
        if (_data.mode) {
            if (isReference) {
                _self.view.bfbLayoutReference.ctrl.setKey(_data.item.idBFBLayoutReference);
                _self.view.bfbLayoutReference.ctrl.disable();
            } else {
                _self.view.bfbLayoutComparison.ctrl.setKey(_data.item.idBFBLayoutComparison);
                _self.view.bfbLayoutComparison.ctrl.disable();
            }

        }
        if (_self.view.dfgLayoutVersionReference.ctrl.getKey() && _self.view.dfgLayoutVersionComparison.ctrl.getKey()) {
            Data.endpoints.bre.rule.DFGAN4Rules.post({ leftFile: _self.view.dfgLayoutVersionReference.ctrl.getKey(), rightFile: _self.view.dfgLayoutVersionComparison.ctrl.getKey() }).success(function(data) {
                _self.view.rule.empty();
                _self.view.rule.ctrl = _self.view.rule.bindBaseMultipleSelect3({
                    tooltip: i18n("SELECT RULE TOOLTIP"),
                    placeholder: i18n("SELECT RULE"),
                    options: data.map(function(rule) {
                        return {
                            key: rule.id,
                            name: "ID" + rule.id + "-" + rule.name
                        };
                    }),
                    onChange: function(val) {},
                    required: true
                });
                if (_data.mode) {
                    var ruleIds = _data.item.rule.map(function(r) {
                        return r.id;
                    });
                    _self.view.rule.ctrl.setKey(ruleIds);
                    _self.view.rule.ctrl.disable();
                }
                if (_self.an4Data) {
                    var ruleIds = _self.an4Data.rule.map(function(r) {
                        return r.id;
                    });
                    _self.view.rule.ctrl.setKey(ruleIds);
                }

            });
        }

        Data.endpoints.dfg.setting.getActiveSettings.post({ idLayoutVersion: newVal.key }).success(function(data) {
            if (isReference) {
                _self.view.dfgSettingReference.empty();
                _self.view.dfgSettingReference.ctrl = _self.view.dfgSettingReference.bindBaseSelect({
                    tooltip: i18n("SELECT SETTING"),
                    placeholder: i18n("TILE SETTING"),
                    options: data.map(function(setting) {
                        return {
                            key: setting.id,
                            name: 'ID' + setting.id + "-" + setting.name,
                            eefi: setting.eefi,
                            idSettingVersion: setting.version[0].id
                        };
                    }),
                    onChange: function(oldVal, newVal) {
                        if (newVal && newVal.key) {
                            _self.idSettingVersionReference = newVal.idSettingVersion;
                            _self.companyOptionsReference = {};
                            for (var i = 0; i < newVal.eefi.length; i++) {
                                if (!_self.companyOptionsReference[newVal.eefi[i].idCompany]) {
                                    _self.companyOptionsReference[newVal.eefi[i].idCompany] = { uf: {} };
                                }
                                if (!_self.companyOptionsReference[newVal.eefi[i].idCompany].uf[newVal.eefi[i].uf]) {
                                    _self.companyOptionsReference[newVal.eefi[i].idCompany].uf[newVal.eefi[i].uf] = {
                                        idBranch: {}
                                    };
                                }
                                if (!_self.companyOptionsReference[newVal.eefi[i].idCompany].uf[newVal.eefi[i].uf].idBranch[newVal.eefi[i].idBranch]) {
                                    _self.companyOptionsReference[newVal.eefi[i].idCompany].uf[newVal.eefi[i].uf].idBranch[newVal.eefi[i].idBranch] = {
                                        idTax: newVal.eefi[i].idTax
                                    };
                                }
                            }


                        } else {
                            delete _self.companyOptionsReference;
                        }
                    }
                });
                _self.view.dfgSettingReference.ctrl.focus();
                if (_data.mode) {
                    var settingId;
                    data.map(function(setting) {
                        if (setting.version[0].id == _data.item.idSettingVersionReference) {
                            settingId = setting.id;
                        }
                    });
                    _self.view.dfgSettingReference.ctrl.setKey(settingId);
                    _self.view.dfgSettingReference.ctrl.disable();
                    _self.getActiveDigitalFiles(_data.item,true);
                }
                if (_self.an4Data) {
                    var settingId;
                    data.map(function(setting) {
                        if (setting.version[0].id == _self.an4Data.idSettingVersionReference) {
                            settingId = setting.id;
                        }
                    });
                    _self.view.dfgSettingReference.ctrl.setKey(settingId);
                    _self.getActiveDigitalFiles(_self.an4Data, true);
                }

            } else {
                _self.view.dfgSettingComparison.empty();
                _self.view.dfgSettingComparison.ctrl = _self.view.dfgSettingComparison.bindBaseSelect({
                    tooltip: i18n("SELECT SETTING"),
                    placeholder: i18n("TILE SETTING"),
                    options: data.map(function(setting) {
                        return {
                            key: setting.id,
                            name: 'ID' + setting.id + "-" + setting.name,
                            eefi: setting.eefi,
                            idSettingVersion: setting.version[0].id
                        };
                    }),
                    onChange: function(oldVal, newVal) {
                        if (newVal && newVal.key) {
                            _self.idSettingVersionComparison = newVal.idSettingVersion;
                            _self.companyOptionsComparison = {};
                            for (var i = 0; i < newVal.eefi.length; i++) {
                                if (!_self.companyOptionsComparison[newVal.eefi[i].idCompany]) {
                                    _self.companyOptionsComparison[newVal.eefi[i].idCompany] = { uf: {} };
                                }
                                if (!_self.companyOptionsComparison[newVal.eefi[i].idCompany].uf[newVal.eefi[i].uf]) {
                                    _self.companyOptionsComparison[newVal.eefi[i].idCompany].uf[newVal.eefi[i].uf] = {
                                        idBranch: {}
                                    };
                                }
                                if (!_self.companyOptionsComparison[newVal.eefi[i].idCompany].uf[newVal.eefi[i].uf].idBranch[newVal.eefi[i].idBranch]) {
                                    _self.companyOptionsComparison[newVal.eefi[i].idCompany].uf[newVal.eefi[i].uf].idBranch[newVal.eefi[i].idBranch] = {
                                        idTax: newVal.eefi[i].idTax
                                    };
                                }
                            }


                        } else {
                            delete _self.companyOptionsComparison;
                        }
                    }
                });
                if (_data.mode) {
                    var settingId;
                    data.map(function(setting) {
                        if (setting.version[0].id == _data.item.idSettingVersionComparison) {
                            settingId = setting.id;
                        }
                    });
                    _self.view.dfgSettingComparison.ctrl.setKey(settingId);
                    _self.view.dfgSettingComparison.ctrl.disable();
                    _self.getActiveDigitalFiles(_data.item);
                }
                if (_self.an4Data) {
                    var settingId;
                    data.map(function(setting) {
                        if (setting.version[0].id == _self.an4Data.idSettingVersionComparison) {
                            settingId = setting.id;
                        }
                    });
                    _self.view.dfgSettingComparison.ctrl.setKey(settingId);
                    _self.getActiveDigitalFiles(_self.an4Data, false);
                }
                _self.view.dfgSettingComparison.ctrl.focus();

            }
        });

    },
    onChangeOrigin: function(oldVal, newVal, isReference) {
        var _self = this;
        var _data = _self.getData();
        var filterBtn = isReference ? _self.view.filterBtnReference : _self.view.filterBtnComparison;
        var digitalFile = isReference ? _self.view.digitalFileReference : _self.view.digitalFileComparison;
        var externalFile = isReference ? _self.view.externalFileReference : _self.view.externalFileComparison;
        if (newVal.key === 1) {
            if (!_data.mode)
                filterBtn.show();
            digitalFile.parent().show();
            externalFile.parent().hide();
        } else if (newVal.key === 2) {
            filterBtn.hide();
            digitalFile.parent().hide();
            externalFile.parent().show();
        } else {
            filterBtn.hide();
            digitalFile.parent().hide();
            externalFile.parent().hide();
        }
    },
    getAN4Data: function() {
        var _self = this;
        var an4Item = {
            name: _self.view.name.ctrl.getText(),
            description: _self.view.description.ctrl.val(),
            idLayoutVersionReference: _self.view.dfgLayoutVersionReference.ctrl.getKey(),
            idLayoutVersionComparison: _self.view.dfgLayoutVersionComparison.ctrl.getKey(),
            idBFBLayoutReference: _self.view.bfbLayoutReference.ctrl.getKey(),
            idBFBLayoutComparison: _self.view.bfbLayoutComparison.ctrl.getKey(),
            originReference: _self.view.originReference.ctrl.getKey(),
            originComparison: _self.view.originComparison.ctrl.getKey(),
            idDigitalFileReference: _self.view.originReference.ctrl.getKey() === 1 ? _self.view.digitalFileReference.ctrl.getKey() : undefined,
            idDigitalFileComparison: _self.view.originComparison.ctrl.getKey() === 1 ? _self.view.digitalFileComparison.ctrl.getKey() : undefined,
            externalFileNameReference: _self.view.originReference.ctrl.getKey() === 2 && _self.view.externalFileReference.input[0].files[0] ? _self.view.externalFileReference.input[0].files[0].name : "",
            externalFileNameComparison: _self.view.originComparison.ctrl.getKey() === 2 && _self.view.externalFileComparison.input[0].files[0] ? _self.view.externalFileComparison.input[0].files[0].name : "",
            idRules: _self.view.rule.ctrl.getKeys()
        };
        if (_self.view.originReference.ctrl.getKey() === 2) {
            //GET FILE DATA
            an4Item.fileReference = _self.view.externalFileReference.input[0].files[0];
        }
        if (_self.view.originComparison.ctrl.getKey() === 2) {
            //GET FILE DATA
            an4Item.fileComparison = _self.view.externalFileComparison.input[0].files[0];
        }
        return an4Item;
    },
    validate: function() {
        var _self = this;
        var isValid = true;
        isValid = _self.view.name.ctrl.validate();
        isValid = _self.view.layoutTypeReference.ctrl.validate() && isValid;
        isValid = _self.view.dfgLayoutReference.ctrl.validate() && isValid;
        isValid = _self.view.dfgLayoutVersionReference.ctrl.validate() && isValid;
        isValid = _self.view.dfgLayoutVersionReference.ctrl.validate() && isValid;
        isValid = _self.view.originReference.ctrl.validate() && isValid;
        if (_self.view.originReference.ctrl.getKey()) {
            if (_self.view.originReference.ctrl.getKey() === 1) {
                isValid = _self.view.dfgSettingReference.ctrl.validate() && isValid;
                isValid = _self.view.digitalFileReference.ctrl.validate() && isValid;
            } else {
                var externalFileReference = _self.view.externalFileReference.input[0].files;
                isValid = externalFileReference && externalFileReference[0] && isValid;
                //SI SUBIO EL ARCHIVO EXTERNO//
            }
        }
        isValid = _self.view.layoutTypeComparison.ctrl.validate() && isValid;
        isValid = _self.view.dfgLayoutComparison.ctrl.validate() && isValid;
        isValid = _self.view.dfgLayoutVersionComparison.ctrl.validate() && isValid;
        isValid = _self.view.dfgLayoutVersionComparison.ctrl.validate() && isValid;
        isValid = _self.view.originComparison.ctrl.validate() && isValid;
        if (_self.view.originComparison.ctrl.getKey()) {
            if (_self.view.originComparison.ctrl.getKey() === 1) {
                isValid = _self.view.dfgSettingComparison.ctrl.validate() && isValid;
                isValid = _self.view.digitalFileComparison.ctrl.validate() && isValid;
            } else {
                var externalFileComparison = _self.view.externalFileComparison.input[0].files;
                isValid = externalFileComparison && externalFileComparison[0] && isValid;
                //SI SUBIO EL ARCHIVO EXTERNO//
            }
        }
        isValid = _self.view.rule.ctrl.validate() && isValid;
        return isValid;

    },
    renderVisualizationEditMode: function(item, type) {
        var _self = this;
        var disableFlag = type === "visualize";
        _self.view.name.ctrl.setText(item.name);
        _self.view.description.ctrl.val(item.description);
        _self.view.layoutTypeReference.ctrl.setKey(item.idDigitalFileTypeReference);

        if (disableFlag) {
            _self.view.name.ctrl.disable();
            _self.view.description.ctrl.attr("disabled", true);
            _self.view.description.ctrl.css("background-color", "#F3F2F2");

        }
        _self.view.layoutTypeReference.ctrl.disable();

    },
    getEditData: function(item) {
        var _self = this;
        var _data = _self.getData();
        var element = {};
        element.name = _self.view.name.ctrl.getText();
        element.description = _self.view.description.ctrl.val();
        return element;
    }
});
