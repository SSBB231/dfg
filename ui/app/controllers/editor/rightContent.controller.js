/*global i18n Data _ enableBackTabIndex disableBackTabIndex*/
sap.ui.controller("app.controllers.editor.rightContent", {
    onInit: function() {},
    onAfterRendering: function(html) {
        var _self = this;
        _self.view = $(html);
        _self.iconLayout = $('.main-wrapper .left-content.floating-panel .floating-header .floating-icon-right .icon');
        _self.sidebarLeft = $('.main-wrapper .main-inner > .left');
        this.isPreview = _self.coreServices.exhibition;
        _self.renderToolbar();
        _self.loader = _self.view.baseLoader({
            modal: true
        });
        _self.sidebarOpenClose();
        _self.renderTabs();
        _self.initDialogs();
    },
    renderToolbar: function() {
        var _self = this;
        // var _idVersion = window.parameters.idVersion;
        $(".toolbar-top").bindBaseLibraryToolbar({
            leftButtons: [{
                    text: i18n('SAVE'),
                    onPress: function() {
                        _self.coreServices.lock.enableToSave(function(_resp) {
                            if (_resp === true) {
                                _self.saveLayout('SAVE');
                            }
                        });
                    },
                    isButton: true,
                    iconFont: "Finance-and-Office",
                    icon: "floppydisc",
                    enabled: !this.isPreview,
                    tooltip: i18n('SAVE TOOLTIP')
                }, {
                    onPress: function() {
                        if (_self.iconLayout.hasClass('ativo')) {
                            _self.sidebarLeft.css("cssText", "max-width: 320px !important; width: 320px !important;");
                            _self.iconLayout.removeClass('ativo');
                            enableBackTabIndex(_self.sidebarLeft);
                        } else {
                            _self.sidebarLeft.css("cssText", "max-width: 0px !important; width: 0px !important;");
                            _self.iconLayout.addClass('ativo');
                            disableBackTabIndex(_self.sidebarLeft);
                        }
                    },
                    isButton: true,
                    iconFont: "DataManager",
                    icon: "dataset",
                    enabled: true,
                    tooltip: i18n('DATAOBJECTS TOOLTIP')
                }, {
                    text: i18n('HEADER DATA'),
                    onPress: function() {
                        _self.headerDialog.open();
                    },
                    isButton: true,
                    iconFont: "File-and-Folders",
                    icon: "docversionsetting",
                    enabled: true,
                    tooltip: i18n('HEADER DATA TOOLTIP')
                }, {
                    text: i18n('VERSION DATA'),
                    onPress: function() {
                        _self.versionDialog.open();
                    },
                    isButton: true,
                    iconFont: "File-and-Folders",
                    icon: "docversion",
                    enabled: true,
                    tooltip: i18n('VERSION DATA TOOLTIP')
                }, {
                    text: i18n('VERSIONS'),
                    onPress: function() {
                        _self.coreServices.showVersionsDialog.open();
                    },
                    isButton: true,
                    iconFont: "File-and-Folders",
                    icon: "docpile",
                    enabled: true,
                    tooltip: i18n('CLICK PRESS TO') + i18n('SHOW VERSIONS')
                }, {
                    text: i18n('RELATIONS'),
                    onPress: function() {
                        _self.coreServices.showRelationDialog.open();
                    },
                    isButton: true,
                    icon: "docpile",
                    iconFont: "File-and-Folders",
                    enabled: true,
                    tooltip: i18n('CLICK PRESS TO') + i18n('SHOW RELATIONS')
                }, {
                    text: i18n('CREATE VERSION'),
                    onPress: function() {
                        _self.getLastVersion(window.parameters);
                    },
                    isButton: true,
                    iconFont: "Sign-and-Symbols",
                    icon: "plussign",
                    tooltip: i18n('CREATE VERSION TOOLTIP'),
                    enabled: !this.isPreview && _self.enabledVersion(window.parameters)
                }
            ],
            rightButtons: [{
                //  text: i18n('EXECUTE'),
                //  onPress: function() {
                //      _self.saveDialog.open();
                //  },
                //  isButton: true,
                //  iconFont: "Media",
                //  icon: "play",
                //  enabled: true,
                //  tooltip: i18n('EXECUTE TOOLTIP')
                // }, {
                text: i18n('GO TO LIBRARY'),
                onPress: function() {
                    if (!_self.isPreview && _self.coreServices.hasChanged) {
                        _self.saveBeforeLibraryDialog.open();
                    } else {
                        _self.goToLibrary();
                    }
                },
                isButton: true,
                enabled: true,
                'class': 'nav-button',
                iconFont: "Sign-and-Symbols",
                icon: "toleft",
                tooltip: i18n('GO TO LIBRARY TOOLTIP')
            }],
            hideGrid: true
        });
    },
    sidebarOpenClose: function() {
        var _self = this;
        _self.iconLayout.click(function() {
            if (_self.iconLayout.hasClass('ativo')) {
                _self.sidebarLeft.css('max-width', '320px');
                _self.iconLayout.removeClass('ativo');
                enableBackTabIndex(_self.sidebarLeft);
            } else {
                _self.sidebarLeft.css('max-width', '0px');
                _self.iconLayout.addClass('ativo');
                disableBackTabIndex(_self.sidebarLeft);
            }
        });
    },
    initialFocus: function(buttonPress) {
        $(buttonPress).focus();
    },
    initDialogs: function() {
        var _self = this;
        let buttons = [{
            name: i18n('CANCEL'),
            isCloseButton: true,
            tooltip: i18n('CLICK PRESS CANCEL'),
            click: function() {
                _self.initialFocus('#right-content > div > div.toolbar-top > div > ul.library-toolbar-items > li:nth-child(3) > button');
            }
        }];
        if (!this.isPreview) {
            buttons.push({
                name: i18n('APPLY'),
                click: function() {
                    if (_self.headerDialog.getInnerController().updateHeaderData()) {
                        _self.headerDialog.close();
                        _self.coreServices.hasChanged = true;
                        _self.initialFocus('#right-content > div > div.toolbar-top > div > ul.library-toolbar-items > li:nth-child(3) > button');
                    }
                },
                tooltip: i18n('CLICK PRESS CONFIRM')
            });
        }
        _self.headerDialog = $.baseDialog({
            title: i18n('HEADER DATA'),
            modal: true,
            size: "big",
            outerClick: 'disabled',
            viewName: "app.views.dialogs.NewFile",
            cssClass: "newFile",
            viewData: {
                type: "layout",
                isExibition: true,
                idVersion: window.parameters.idVersion,
                idLayout: window.parameters.id
            },
            buttons: buttons
        });

        buttons = [{
            name: i18n('CANCEL'),
            isCloseButton: true,
            tooltip: i18n('CLICK PRESS CANCEL'),
            click: function() {
                _self.initialFocus('#right-content > div > div.toolbar-top > div > ul.library-toolbar-items > li:nth-child(4) > button');
            }
        }];
        if (!this.isPreview) {
            buttons.push({
                name: i18n('APPLY'),
                click: function() {
                    if (_self.versionDialog.getInnerController().updateVersionData()) {
                        _self.versionDialog.close();
                        _self.coreServices.hasChanged = true;
                    }
                    _self.initialFocus('#right-content > div > div.toolbar-top > div > ul.library-toolbar-items > li:nth-child(4) > button');
                },
                tooltip: i18n('CLICK PRESS CONFIRM')
            });
        }
        _self.versionDialog = $.baseDialog({
            title: i18n('VERSION DATA'),
            modal: true,
            size: "big",
            outerClick: 'disabled',
            viewName: "app.views.dialogs.VersionData",
            cssClass: "newFile",
            viewData: {},
            buttons: buttons
        });

        _self.saveDialog = $.baseDialog({
            title: i18n('SYSTEM ALERT'),
            modal: true,
            size: "small",
            outerClick: 'disabled',
            viewName: "app.views.dialogs.Alert",
            cssClass: "dfg-alert",
            viewData: {
                text: i18n('DFG102001')
            },
            buttons: [{
                name: i18n('NO'),
                isCloseButton: true,
                click: function() {
                    _self.goToExecutor();
                },
                tooltip: i18n('CLICK PRESS CANCEL')
            }, {
                name: i18n('YES'),
                click: function() {
                    _self.saveDialog.close();
                    _self.saveLayout('EXECUTE');
                },
                tooltip: i18n('CLICK PRESS CONFIRM')
            }]
        });

        _self.saveBeforeLibraryDialog = $.baseDialog({
            title: i18n('SYSTEM ALERT'),
            modal: true,
            size: "small",
            outerClick: 'disabled',
            viewName: "app.views.dialogs.Alert",
            cssClass: "dfg-alert",
            viewData: {
                text: i18n('DFG102001')
            },
            buttons: [{
                name: i18n('NO'),
                isCloseButton: true,
                click: function() {
                    _self.goToLibrary();
                },
                tooltip: i18n('CLICK PRESS CANCEL')
            }, {
                name: i18n('YES'),
                click: function() {
                    _self.saveBeforeLibraryDialog.close();
                    _self.saveLayout('LIBRARY');
                    _self.initialFocus();
                },
                tooltip: i18n('CLICK PRESS CONFIRM')
            }]
        });
    },
    saveLayout: function(saveOrigin) {
        var _self = this;
        var bool = true;
        _self.coreServices.updateLayoutObject();
        $.each(_self.coreServices.layoutObject.blocks, function(index, element) {
            if (element.name === "") {
                bool = false;
            }
            $.each(element.records, function(index2, element2) {
                if (element2.name === "") {
                    bool = false;
                }
            });
        });
        var _dataSend = {
            json: {
                blocks: _self.coreServices.layoutObject.blocks,
                positions: _self.coreServices.layoutObject.positions,
                format: _self.coreServices.layoutObject.format,
                rules: _self.coreServices.layoutObject.rules,
                fields: _self.coreServices.layoutObject.fields,
                groups: _self.coreServices.layoutObject.groups,
                separator: _self.coreServices.layoutObject.separator,
                mapConfig: _self.coreServices.layoutObject.mapConfig,
                relations: _self.coreServices.layoutObject.relations,
                configIdRecord: _self.coreServices.layoutObject.configIdRecord,
                filters: _self.coreServices.layoutObject.filters,
                outputs: _self.coreServices.layoutObject.outputs,
                manualParams: _self.coreServices.layoutObject.manualParams,
                hasHierarchy: _self.coreServices.layoutObject.hasHierarchy,
                visualization: 	_self.coreServices.visualization.getDataVisualizationMap()
            },
            id: _self.coreServices.layoutObject.id,
            name: _self.coreServices.layoutObject.name,
            description: _self.coreServices.layoutObject.description,
            idVersion: _self.coreServices.layoutObject.idVersion,
            internalVersion: _self.coreServices.layoutObject.internalVersion,
            legalVersion: _self.coreServices.layoutObject.legalVersion,
            newStructs: _self.coreServices.layoutObject.newStructs || [],
            lastChanges: []
        };
        if (_self.coreServices.lastChanges && _self.coreServices.lastChanges.length) {
            for (var change = 0; change < _self.coreServices.lastChanges.length; change++) {
                var lastChange = _self.coreServices.lastChanges[change];
                switch (lastChange.type) {
                    case 1:
                        if (_dataSend.json.blocks[lastChange.blockId]) {
                            lastChange.block = _dataSend.json.blocks[lastChange.blockId].name;
                            delete lastChange.blockId;
                        }
                        break;
                    case 2:
                        if (_dataSend.json.blocks[lastChange.blockId] && _dataSend.json.blocks[lastChange.blockId].records[lastChange.recordId]) {
                            lastChange.block = _dataSend.json.blocks[lastChange.blockId].name;
                            lastChange.record = _dataSend.json.blocks[lastChange.blockId].records[lastChange.recordId].name;
                            delete lastChange.blockId;
                            delete lastChange.recordId;
                        }
                        break;
                    case 3:
                        if (_dataSend.json.blocks[lastChange.blockId] && _dataSend.json.blocks[lastChange.blockId].records[lastChange.recordId] && lastChange.fieldName) {
                            lastChange.block = _dataSend.json.blocks[lastChange.blockId].name;
                            lastChange.record = _dataSend.json.blocks[lastChange.blockId].records[lastChange.recordId].name;
                            lastChange.field = lastChange.fieldName;
                            delete lastChange.blockId;
                            delete lastChange.recordId;
                            delete lastChange.fieldName;
                        }
                        break;
                    case 4:
                        lastChange.block = lastChange.blockName;
                        delete lastChange.blockName;
                        break;
                    case 5:
                        lastChange.block = lastChange.blockName;
                        delete lastChange.blockName;
                        lastChange.record = lastChange.recordName;
                        delete lastChange.recordName;
                        break;
                    case 6:
                        lastChange.block = lastChange.blockName;
                        delete lastChange.blockName;
                        lastChange.record = lastChange.recordName;
                        delete lastChange.recordName;
                        lastChange.field = lastChange.fieldName;
                        delete lastChange.fieldName;
                        break;
                    default:
                        break;
                }
                delete lastChange.type;
                _dataSend.lastChanges.push(lastChange);
            }
        }
        var idVersion = window.parameters.idVersion || _dataSend.idVersion;
        var hasInitDate = true;
        _dataSend.internalVersion.forEach(function(version) {
            if (version.id === idVersion) {
                if (!version.validityStart) {
                    hasInitDate = false;
                    return;
                }
            }
        });
        if (!hasInitDate) {
            $.baseToast({
                text: i18n("DFG102012"),
                isError: true
            });
            return;
        }
        if (bool) {
            _self.loader.open();
            delete _self.coreServices.layoutObject.newStructs;
            Data.endpoints.dfg.layout.update.post(_dataSend).success(function() {
                _self.coreServices.hasChanged = false;
                _self.loader.close();
                $.baseToast({
                    text: i18n('DFG1010022'),
                    isSuccess: true
                });
                if (saveOrigin === 'EXECUTE') {
                    _self.goToExecutor();
                } else if (saveOrigin === "LIBRARY") {
                    window.location.hash = "/library?restoreSettings=1";
                }
                _self.coreServices.lastChanges = [];
            }).error(function() {
                _self.loader.close();
            });
        } else {
            $.baseToast({
                text: i18n('NO NAMES'),
                isSuccess: false
            });
        }
    },
    goToLibrary: function() {
        if (this.coreServices.lock) {
            this.coreServices.lock.removeLock();
        }
        window.location = '#/library?restoreSettings=1';
    },
    goToExecutor: function() {
        var idLayout = window.parameters.id;
        var idVersion = window.parameters.idVersion;
        var locationString;
        locationString = '#/executor?id=' + idLayout;
        if (idVersion) {
            locationString += '&idVersion=' + idVersion;
        }
        window.location = locationString;
    },
    renderTabs: function() {
        var _self = this;
        _self.tabController = $('.tabs-wrapper').bindBaseTabs({
            tab: [{
                title: i18n('FIELD VIEW'),
                icon: "layout",
                iconColor: "white",
                iconFont: "File-and-Folders",
                viewName: "app.views.editor.body.MainContent",
                viewData: {},
                tooltip: i18n('FIELD VIEW TOOLTIP')
            }, {
                title: i18n('DATA VISUALIZATION'),
                icon: "menu",
                iconColor: "white",
                iconFont: "Display-and-Setting",
                viewName: "app.views.editor.body.DataVisualization",
                viewData: {},
                tooltip: i18n('DATA VISUALIZATION')
            }],
            type: "boxes",
            wrapperClass: "wrapperClass"
        });
        //debugger;
        //Get Tab Click
        $(_self.view.find('.baseTabs-box')[1]).click(function() {
            _self.coreServices.updateLayoutObject();
            _self.tabController.getInnerController(1).renderBlockRecordTable();
        });
        $(_self.view.find('.baseTabs-box')[0]).click(function() {
            _self.tabController.getInnerController(0).renderLayout();
        });
    },
    getLastVersion: function(object) {
        var _self = this;
        Data.endpoints.dfg.layout.getLastVersion.post(object).success(function(data) {
            if (data.id.toString() === window.parameters.idVersion && data.idDigitalFile !== null) {
                _self.initializeDialog();
                _self.createDialog.open();
            } else {
                $.baseToast({
                    text: i18n("DFG102013"),
                    isSuccess: false
                });
            }
        }).error(function() {
            if (!_self.privileges.layout.read) {
                $.baseToast({
                    text: i18n("NO READ PRIVILEGE FOR") + " " + i18n("LAYOUTS"),
                    type: "W"
                });
                _self.goToLibrary();
                return;
            }
        });
    },
    enabledVersion: function(object) {
        var _self = this;
        Data.endpoints.dfg.layout.getLastVersion.post(object).success(function(data) {
            if (data.id.toString() === window.parameters.idVersion && data.idDigitalFile !== null) {
                return true;
            } else {
                return false;
            }
        }).error(function() {
            if (!_self.privileges.layout.read) {
                $.baseToast({
                    text: i18n("NO READ PRIVILEGE FOR") + " " + i18n("LAYOUTS"),
                    type: "W"
                });
                _self.goToLibrary();
                return;
            }
        });
    },
    initializeDialog: function() {
        var _self = this;
        _self.createDialog = $.baseDialog({
            title: i18n("CREATE VERSION"),
            modal: true,
            size: "big",
            disableOuterClick: true,
            cssClass: "newFile",
            viewName: "app.views.dialogs.NewFile",
            viewData: {
                type: 'layout',
                isLayoutVersion: true
            },
            buttons: [{
                name: i18n("CANCEL"),
                isCloseButton: true,
                tooltip: i18n("CLICK PRESS CANCEL"),
                click: function() {
                    if (!_self.coreServices.loadingData) {
                        _self.createDialog.close();
                    }
                    _self.initialFocus('#right-content > div > div.toolbar-top > div > ul.library-toolbar-items > li:nth-child(7) > button');
                }
            }, {
                name: i18n("CREATE"),
                click: function() {
                    var dialogData = _self.coreServices.getData();
                    if (dialogData) {
                        _self.coreServices._dataNewFile.idFolder = -1;
                        if (!_self.coreServices.loadingData) {
                            _self.coreServices.loadingData = true;
                            _self.loader.open();
                            Data.endpoints.dfg.layout.createLayoutVersion.post({
                                idVersionOld: window.parameters.idVersion,
                                idLayout: window.parameters.id,
                                versionNew: _self.coreServices._dataNewFile.legalVersion,
                                validFrom: _self.coreServices._dataNewFile.validFrom,
                                validTo: _self.coreServices._dataNewFile.validTo,
                                description: _self.coreServices._dataNewFile.description
                            }).success(function(data) {
                                _self.coreServices.loadingData = false;
                                _self.createDialog.close();
                                _self.loader.close();
                                window.location = "#/editor?id=" + data.idLayout + "&idVersion=" + data.id;
                                $.baseToast({
                                    text: i18n("DFG209010"),
                                    isSuccess: true
                                });
                            }).error(function() {
                                _self.coreServices.loadingData = false;
                                _self.loader.close();
                            });
                        }
                    }
                },
                tooltip: i18n("CLICK PRESS CONFIRM")
            }]
        });
    }
});