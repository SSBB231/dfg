sap.ui.controller("app.controllers.library.an3.createDialog", {
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
        _self.view.layoutType = _self.view.find("#inputSelectTypeFile");
        _self.view.dfgLayout = _self.view.find(".layout-dfg-select");
        _self.view.dfgLayoutVersion = _self.view.find(".version-select");
        _self.view.dfgSetting = _self.view.find(".setting-dfg-select");
        _self.view.rule = _self.view.find(".rule-select");
        _self.view.bfbLayout = _self.view.find(".layout-bfb-select");
        _self.view.origin = _self.view.find(".origin-select");
        _self.view.filterBtn = _self.view.find(".filter-btn");
        _self.view.digitalFile = _self.view.find(".file");
        _self.view.externalFile = _self.view.find(".external-file");
        _self.view.externalFile.input = _self.view.externalFile.find("input");
        _self.view.filterBtn.hide();
        _self.view.digitalFile.parent().hide();
        _self.view.externalFile.parent().hide();
        _self.loader = _self.view.baseLoader({
            modal: true
        });
        _self.bindElements();
        _self.bindEvents();
        _self.loader.open();
        Data.endpoints.dfg.an3.createDialog.post().success(function(data) {
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
        _self.view.layoutType.ctrl = _self.view.layoutType.bindBaseSelect({
            tooltip: i18n("SELECT LAYOUT TYPE TOOLTIP"),
            placeholder: i18n("SELECT LAYOUT TYPE"),
            isLoading: true,
            required: true
        });
        _self.view.dfgLayout.ctrl = _self.view.dfgLayout.bindBaseSelect({
            tooltip: i18n("SELECT LAYOUT TOOLTIP"),
            placeholder: i18n("SELECT LAYOUT"),
            isLoading: true,
            required: true
        });
        _self.view.dfgLayoutVersion.ctrl = _self.view.dfgLayoutVersion.bindBaseSelect({
            tooltip: i18n("SELECT LAYOUT VERSION"),
            placeholder: i18n("TILE LAYOUT VERSION"),
            isLoading: true,
            required: true
        });
        _self.view.dfgSetting.ctrl = _self.view.dfgSetting.bindBaseSelect({
            tooltip: i18n("SELECT SETTING"),
            placeholder: i18n("TILE SETTING"),
            isLoading: true
        });
        _self.view.rule.ctrl = _self.view.rule.bindBaseMultipleSelect3({
            tooltip: i18n("SELECT RULE TOOLTIP"),
            placeholder: i18n("SELECT RULE"),
            isLoading: true,
            required: true
        });
        _self.view.bfbLayout.ctrl = _self.view.bfbLayout.bindBaseSelect({
            tooltip: i18n("SELECT BFB LAYOUT TOOLTIP"),
            placeholder: i18n("SELECT BFB LAYOUT"),
            isLoading: true
        });
        _self.view.origin.ctrl = _self.view.origin.bindBaseSelect({
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
            onChange: _self.onChangeOrigin.bind(_self)
        });
        _self.view.origin.ctrl.setKey(1);
        if (_data.mode) {
            if (_data.item.origin === "DFG") {
                _self.view.origin.ctrl.setKey(1);
            } else {
                _self.view.origin.ctrl.setKey(2);
            }
            _self.view.origin.ctrl.disable();

        }
        _self.view.digitalFile.ctrl = _self.view.digitalFile.bindBaseSelect({
            tooltip: i18n("SELECT DIGITAL FILE TOOLTIP"),
            placeholder: i18n("SELECT DIGITAL FILE"),
            required: true,
            isLoading: true
        });

    },

    bindEvents: function() {
        var _self = this;


        _self.view.filterBtn.bind("click", function(evt) {
            if (_self.view.dfgSetting.ctrl.getKey()) {
                _self.initializeFilterDialog();
            } else {
                $.baseToast({
                    text: i18n("MUST FILL SETTING FIELD")
                });
            }
        });
        _self.view.externalFile.input.change(function(evt) {
            if (this.files && this.files[0]) {
                _self.view.find(".fileName").text(this.files[0].name);
            }
        });
    },
    initializeFilterDialog: function() {
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
                companyOptions: _self.companyOptions
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
                    data.idSettingVersion = _self.idSettingVersion;
                    _self.getActiveDigitalFiles(data);
                    _self.dialogFilter.close();
                },
                tooltip: i18n('CLICK PRESS CONFIRM')
            }]
        });
        _self.dialogFilter.open();
    },
    getActiveDigitalFiles: function(data) {
        var _self = this;
        var _data = _self.getData();
        Data.endpoints.dfg.digitalFile.getActiveDigitalFiles.post(data).success(function(data) {
            _self.view.digitalFile.empty();
            _self.view.digitalFile.ctrl = _self.view.digitalFile.bindBaseSelect({
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
                _self.view.digitalFile.ctrl.setKey(_data.item.idDigitalFile);
                _self.view.digitalFile.ctrl.disable();
            }
            if (_self.an3Data) {
                _self.view.digitalFile.ctrl.setKey(_self.an3Data.idDigitalFile);
            }
        });
    },
    bindComponents: function() {
        var _self = this;

        _self.view.copy.empty();
        _self.view.copy.ctrl = _self.view.copy.bindBaseSelect({
            tooltip: i18n('COPY FROM TOOLTIP'),
            placeholder: i18n('COPY FROM'),
            options: _self.requiredInformation.an3.map(function(an3) {
                return {
                    key: an3.id,
                    name: "ID" + an3.id + "-" + an3.name,
                    an3Data: an3
                };
            }),
            onChange: _self.onChangeCopyFrom.bind(_self)
        });
        _self.view.layoutType.empty();
        _self.view.layoutType.ctrl = _self.view.layoutType.bindBaseSelect({
            tooltip: i18n("SELECT LAYOUT TYPE TOOLTIP"),
            placeholder: i18n("SELECT LAYOUT TYPE"),
            options: _self.requiredInformation.digitalFileTypes.map(function(type) {
                return {
                    key: type.id,
                    name: type.name
                };
            }),
            required: true,
            onChange: _self.onChangeLayoutType.bind(_self)
        });
    },
    onChangeCopyFrom: function(oldVal, newVal) {
        var _self = this;
        var an3Data = newVal.an3Data;
        _self.view.name.ctrl.setText(i18n("COPY OF") + " " + an3Data.name);
        _self.view.description.ctrl.val(an3Data.description);
        _self.view.layoutType.ctrl.setKey(an3Data.idDigitalFileType);
        _self.an3Data = an3Data;
    },
    onChangeLayoutType: function(oldVal, newVal) {
        var _self = this;
        var _data = _self.getData();
        Data.endpoints.dfg.layout.getActiveLayouts.post({ idDigitalFileType: newVal.key, noStructure: true }).success(function(data) {
            _self.view.dfgLayout.empty();
            _self.view.dfgLayout.ctrl = _self.view.dfgLayout.bindBaseSelect({
                tooltip: i18n("SELECT LAYOUT TOOLTIP"),
                placeholder: i18n("SELECT LAYOUT"),
                options: data.map(function(layout) {
                    return {
                        key: layout.id,
                        name: "ID" + layout.id + "-" + layout.name,
                        layoutVersions: layout.layoutVersions
                    };
                }),
                onChange: _self.onChangeDFGLayout.bind(_self),
                required: true
            });
            if (_data.mode) {
                var layoutId;
                data.map(function(layout) {
                    layout.layoutVersions.map(function(version) {
                        if (version.id === _data.item.idLayoutVersion) {
                            layoutId = layout.id;
                        }
                    });
                });
                _self.view.dfgLayout.ctrl.setKey(layoutId);
                _self.view.dfgLayout.ctrl.disable();
            }
            if (_self.an3Data) {
                var layoutId;
                data.map(function(layout) {
                    layout.layoutVersions.map(function(version) {
                        if (version.id === _self.an3Data.idLayoutVersion) {
                            layoutId = layout.id;
                        }
                    });
                });
                _self.view.dfgLayout.ctrl.setKey(layoutId);
            }
        });
    },
    onChangeDFGLayout: function(oldVal, newVal) {
        var _self = this;
        var _data = _self.getData();
        _self.view.dfgLayoutVersion.empty();
        _self.view.dfgLayoutVersion.ctrl = _self.view.dfgLayoutVersion.bindBaseSelect({
            tooltip: i18n("SELECT LAYOUT VERSION"),
            placeholder: i18n("TILE LAYOUT VERSION"),
            required: true,
            options: newVal.layoutVersions.map(function(version) {
                return {
                    key: version.id,
                    name: version.version
                };
            }),
            onChange: _self.onChangeDFGLayoutVersion.bind(_self)
        });
        if (_data.mode) {
            _self.view.dfgLayoutVersion.ctrl.setKey(_data.item.idLayoutVersion);
            _self.view.dfgLayoutVersion.ctrl.disable();
        }
        if (_self.an3Data) {
            _self.view.dfgLayoutVersion.ctrl.setKey(_self.an3Data.idLayoutVersion);
        }
    },
    onChangeDFGLayoutVersion: function(oldVal, newVal) {
        var _self = this;
        var _data = _self.getData();
        Data.endpoints.bfb.getBFBLayoutXDFGLayout.post({ idDFGLayoutVersion: newVal.key }).success(function(data) {
            _self.view.bfbLayout.empty();
            _self.view.bfbLayout.ctrl = _self.view.bfbLayout.bindBaseSelect({
                tooltip: i18n("SELECT BFB LAYOUT TOOLTIP"),
                placeholder: i18n("SELECT BFB LAYOUT"),
                options: data.map(function(layout){
                    return {
                        key: layout.id,
                        name: layout.name
                    };
                })
            });
        }).error(function(err) {
            _self.view.bfbLayout.empty();
            _self.view.bfbLayout.ctrl = _self.view.bfbLayout.bindBaseSelect({
                tooltip: i18n("SELECT BFB LAYOUT TOOLTIP"),
                placeholder: i18n("SELECT BFB LAYOUT"),
                options: []
            });
        })
        if (_data.mode) {
            _self.view.bfbLayout.ctrl.setKey(_data.item.idBFBLayout);
            _self.view.bfbLayout.ctrl.disable();
        }
        Data.endpoints.bre.rule.DFGAN3Rules.post({ idLayout: newVal.key }).success(function(data) {
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
            if (_self.an3Data) {
                var ruleIds = _self.an3Data.rule.map(function(r) {
                    return r.id;
                });
                _self.view.rule.ctrl.setKey(ruleIds);
            }

        });
        Data.endpoints.dfg.setting.getActiveSettings.post({ idLayoutVersion: newVal.key,withSPEDs: true }).success(function(data) {
            _self.view.dfgSetting.empty();
            var options = [];
            if(data.settings && data.SPEDs){
                data.settings.map(function(s){
                    options.push({ 
                        key: "SETTING"+s.id,
                        name: "ID"+ s.id+"-"+s.name,   
                        eefi: s.eefi,
                        idSettingVersion: s.version[0].id
                    });
                });
                data.SPEDs.map(function(s){
                   options.push({
                       key: "SPED"+s.id,
                        name: "ID"+s.id+"-"+s.name+ " (SPED)",
                        isSPED: true,
                        eefi: s.eefi,
                        idSettingVersion: s.id
                   });
                });
            }else{
                options = data.map(function(setting) {
                    return {
                        key: setting.id,
                        name: 'ID' + setting.id + "-" + setting.name,
                        eefi: setting.eefi,
                        idSettingVersion: setting.version[0].id
                    };
                });
            }
            _self.view.dfgSetting.ctrl = _self.view.dfgSetting.bindBaseSelect({
                tooltip: i18n("SELECT SETTING"),
                placeholder: i18n("TILE SETTING"),
                options: options,
                onChange: function(oldVal, newVal) {
                    if (newVal && newVal.key) {
                        _self.idSettingVersion = newVal.idSettingVersion;
                        _self.isSPED = newVal.isSPED;
                        _self.companyOptions = {};
                        for (var i = 0; i < newVal.eefi.length; i++) {
                            if (!_self.companyOptions[newVal.eefi[i].idCompany]) {
                                _self.companyOptions[newVal.eefi[i].idCompany] = { uf: {} };
                            }
                            if (!_self.companyOptions[newVal.eefi[i].idCompany].uf[newVal.eefi[i].uf]) {
                                _self.companyOptions[newVal.eefi[i].idCompany].uf[newVal.eefi[i].uf] = {
                                    idBranch: {}
                                };
                            }
                            if (!_self.companyOptions[newVal.eefi[i].idCompany].uf[newVal.eefi[i].uf].idBranch[newVal.eefi[i].idBranch]) {
                                _self.companyOptions[newVal.eefi[i].idCompany].uf[newVal.eefi[i].uf].idBranch[newVal.eefi[i].idBranch] = {
                                    idTax: newVal.eefi[i].idTax
                                };
                            }
                        }


                    } else {
                        delete _self.companyOptions;
                    }
                }
            });
            if (_data.mode) {
                var settingId;
                if(data.settings && data.SPEDs){
                    if(_data.item.isSPED){
                        data.SPEDs.map(function(s){
                            if(s.id === _data.item.idSettingVersion){
                                settingId = "SPED"+s.id;
                            }
                        });
                    }else{
                        data.settings.map(function(s){
                            if(s.version[0].id === _data.item.idSettingVersion){
                                settingId = "SETTING"+s.id;
                            }
                        });
                    }
                }else{
                    if(!_data.item.isSPED){
                        data.map(function(setting) {
                            if (setting.version[0].id === _data.item.idSettingVersion) {
                                settingId = setting.id;
                            }
                        });
                    }
                }
                
                _self.view.dfgSetting.ctrl.setKey(settingId);
                _self.view.dfgSetting.ctrl.disable();
                _self.getActiveDigitalFiles(_data.item);
            }
            if (_self.an3Data) {
                var settingId;
                if(data.settings && data.SPEDs){
                    if(_self.an3Data.isSPED){
                        data.SPEDs.map(function(sped) {
                            if (sped.id === _self.an3Data.idSettingVersion) {
                                settingId = "SPED"+sped.id;
                            }
                        });
                    }else{
                       data.settings.map(function(setting) {
                        if (setting.version[0].id === _self.an3Data.idSettingVersion) {
                            settingId = "SETTING"+setting.id;
                        }
                        }); 
                    }
                }else{
                    data.map(function(setting) {
                        if (setting.version[0].id == _self.an3Data.idSettingVersion) {
                            settingId = setting.id;
                        }
                    });
                }
                
                _self.view.dfgSetting.ctrl.setKey(settingId);
                _self.getActiveDigitalFiles(_self.an3Data);
            }
        });
    },
    onChangeOrigin: function(oldVal, newVal) {
        var _self = this;
        var _data = _self.getData();
        if (newVal.key === 1) {
            if (!_data.mode)
                _self.view.filterBtn.show();
            _self.view.digitalFile.parent().show();
            _self.view.externalFile.parent().hide();
        } else if (newVal.key === 2) {
            _self.view.filterBtn.hide();
            _self.view.digitalFile.parent().hide();
            _self.view.externalFile.parent().show();
        } else {
            _self.view.filterBtn.hide();
            _self.view.digitalFile.parent().hide();
            _self.view.externalFile.parent().hide();
        }
    },
    getAN3Data: function() {
        var _self = this;
        var an3Item = {
            name: _self.view.name.ctrl.getText(),
            description: _self.view.description.ctrl.val(),
            idLayoutVersion: _self.view.dfgLayoutVersion.ctrl.getKey(),
            idBFBLayout: _self.view.bfbLayout.ctrl.getKey(),
            origin: _self.view.origin.ctrl.getKey(),
            idDigitalFile: _self.view.origin.ctrl.getKey() === 1 ? _self.view.digitalFile.ctrl.getKey() : undefined,
            externalFileName: _self.view.origin.ctrl.getKey() === 2 && _self.view.externalFile.input[0].files[0] ? _self.view.externalFile.input[0].files[0].name : "",
            idRules: _self.view.rule.ctrl.getKeys(),
            isSPED: _self.isSPED
        };
        if (_self.view.origin.ctrl.getKey() === 2) {
            //GET FILE DATA
            
            an3Item.file = _self.view.externalFile.input[0].files[0];
        }
        return an3Item;
    },
    validate: function() {
        var _self = this;
        var isValid = true;
        isValid = _self.view.name.ctrl.validate();
        isValid = _self.view.layoutType.ctrl.validate() && isValid;
        isValid = _self.view.dfgLayout.ctrl.validate() && isValid;
        isValid = _self.view.dfgLayoutVersion.ctrl.validate() && isValid;
        isValid = _self.view.dfgLayoutVersion.ctrl.validate() && isValid;
        isValid = _self.view.origin.ctrl.validate() && isValid;
        if (_self.view.origin.ctrl.getKey()) {
            if (_self.view.origin.ctrl.getKey() === 1) {
                isValid = _self.view.dfgSetting.ctrl.validate() && isValid;
                isValid = _self.view.digitalFile.ctrl.validate() && isValid;
            } else {
                var externalFile = _self.view.externalFile.input[0].files;
                isValid = externalFile && externalFile[0] && isValid;
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
        _self.view.layoutType.ctrl.setKey(item.idDigitalFileType);
        if (disableFlag) {
            _self.view.name.ctrl.disable();
            _self.view.description.ctrl.attr("disabled", true);
            _self.view.description.ctrl.css("background-color", "#F3F2F2");

        }
        _self.view.layoutType.ctrl.disable();
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
