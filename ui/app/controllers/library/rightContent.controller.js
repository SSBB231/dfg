/*global i18n Data _ parseDate allTaxApp saveAs*/
sap.ui.controller("app.controllers.library.rightContent", {
    renderType: {
        digitalFile: "DIGITAL FILE",
        layout: "LAYOUT",
        setting: "SETTING",
        AN4: "AN4",
        AN3: "AN3",
        SPED: "SPED",
        XML: "XML",
        PANEL: "PANEL"
    },
    onInit: function() {},
    onAfterRendering: function(html) {
        var _self = this;
        _self._view = $(html).parent();
        _self.libraryWrapper = _self._view.find("#libraryview");
        _self._view.toolbar = _self._view.find("#toolbar");
        _self._view.search = _self._view.find("#search");
        _self._view.search.input = _self._view.search.find(".search-input");
        _self._view.search.button = _self._view.search.find("#advanced-filters-btn");
        _self._view.cleanFiltersButton = _self._view.find("#reset-filters-btn");
        _self._view.tilesPagination = _self._view.find('.tiles-paginator');
        _self._view.advancedFiltersCont = _self._view.find("#advancedSearch2");
        _self.coreServices.tableBody = {};
        _self.libraryWrapper.empty();
        _self.libraryWrapper.addClass("list-view");
        _self.loader = $("#libraryview").baseLoader({
            modal: true
        });
        _self.renderElements();
    },
    renderElements: function() {
        var _self = this;
        _self.loader = _self.libraryWrapper.baseLoader({
            modal: true
        });
        _self.addServices();
        _self.bindElements();
        if (window.parameters.restoreSettings && localStorage.lastLibrarySettings) {
            var lastLibrarySettings = JSON.parse(localStorage.lastLibrarySettings);
            _self.actualPage = lastLibrarySettings.actualPage;
            _self.renderToolbar(lastLibrarySettings.renderType);
            var folderSelected = lastLibrarySettings.libraryOptions ? lastLibrarySettings.libraryOptions.dataType[lastLibrarySettings.libraryOptions.renderType] : -1;
            var idFolder;
            if (folderSelected.text === "FOLDER") {
                idFolder = folderSelected.idFolder;
            }
            if (lastLibrarySettings.libraryOptions && lastLibrarySettings.libraryOptions.renderType !== "SPED") {
                _self.renderAccordionFiles({
                    counter: true,
                    idFolder: idFolder,
                    fromStoredSettings: true,
                    number: lastLibrarySettings.actualPage,
                    searchParams: lastLibrarySettings.filters
                });
            } else {
                _self.coreServices.spedType = lastLibrarySettings.spedType;
                _self.coreServices.spedSubType = lastLibrarySettings.spedSubType;
                _self.coreServices.orderBy = lastLibrarySettings.orderBy;
                var data = {
                    type: lastLibrarySettings.spedType,
                    subType: lastLibrarySettings.spedSubType,
                    status: 1,
                    number: lastLibrarySettings.actualPage,
                    order_by: lastLibrarySettings.orderBy,
                    searchParams: lastLibrarySettings.filters,
                    getFiltersData: true,
                    counter: true
                };
                console.log('sped data', data);
                _self.coreServices.getSPEDData(data);
            }
        } else {
            delete localStorage.lastLibrarySettings;
            _self.renderToolbar(_self.renderType.layout);
            _self.renderAccordionFiles({
                counter: true,
                searchParams: {}
            });
        }
    },
    addServices: function() {
        var _self = this;
        _self.coreServices.renderTable = function(data, searchParams) {
            _self.renderFilesTable(data, searchParams);
        };
        _self.coreServices.renderXMLTable = function(data) {
            _self.renderTableXML(data);
        };
        _self.coreServices.getSPEDData = function(data) {
            //console.log(data) 
            _self.getSPEDData(data);
        };
        _self.coreServices.renderToolbar = function() {

            _self.renderToolbar(_self.coreServices.libraryOptions.renderType);
        };
        _self.coreServices.renderAccordionFiles = function(params, fromToolbar) {
            _self.libraryWrapper.empty();
            _self.renderAccordionFiles(params, fromToolbar);
        };
        _self.coreServices.openFilter = function(close, filters) {
           
            _self.bindAdvanceFilters(_self.coreServices.libraryOptions.renderType, filters);
            if (!close && !$(".library-advanced-filters-container").is(":visible")) {
                $(".library-tile-container").animate({
                    top: $(".library-advanced-filters-container").height() + $(".library-tile-container").offset().top - 20
                }, 500);
                $(".library-advanced-filters-container").slideDown();
                $(".library-advanced-filters-container").css("display", "block");
            } else {
                $(".library-advanced-filters-container").slideUp();
                $(".library-tile-container").animate({
                    top: 120
                }, 500);
            }
            var icon = _self._view.search.button.find(".icon");
            if (!close && icon.hasClass("icon-collapsedown")) {
                _self._view.search.button.find(".icon").toggleClass("icon-collapsedown");
                _self._view.search.button.find(".icon").toggleClass("icon-collapseup");
            } else if (icon.hasClass("icon-collapseup")) {
                _self._view.search.button.find(".icon").toggleClass("icon-collapseup");
                _self._view.search.button.find(".icon").toggleClass("icon-collapsedown");
            }
        };
    },
    bindElements: function() {
        var _self = this;
        _self._view.search.input.ctrl = this._view.search.input.bindBaseInput({
            isSearchBox: true,
            tooltip: {
                class: "dark",
                position: "top",
                text: i18n("FILL AND PRESS ENTER TO SEARCH BY NAME")
            },
            onSearch: function(oldVal, newVal) {
                var searchParam = {
                    name: oldVal
                };
                if (_self._view.advancedFiltersCont && _self._view.advancedFiltersCont.ctrl) {
                    $.extend(searchParam, _self.coreServices.getValues());
                }
                
                _self.renderAccordionFiles({
                    searchParams: searchParam
                });
            }
        });
        _self._view.search.button.unbind('click').bind('click', function() {
            _self.coreServices.openFilter(false);
        });
        _self._view.search.button.baseTooltip({
            class: 'dark',
            position: 'top',
            text: i18n('CLICK PRESS TO') + "  " + i18n('LIBRARY CONTENT ADVANCED FILTERS TOOLTIP')
        });
        _self._view.cleanFiltersButton.unbind('click').bind('click', function() {
            _self.clearAdvancedFilters();
        });
        _self._view.cleanFiltersButton.baseTooltip({
            class: 'dark',
            position: 'top',
            text: i18n('CLEAN FILTERS TOOLTIP')
        });
    },
    renderToolbar: function(renderType) {
        var _self = this;
        $("#base-baseTooltip-wrapper").remove();
        _self._view.toolbar.empty();
        _self.coreServices.libraryOptions.renderType = renderType;
        _self.setToolbarLogic(_self.coreServices.libraryOptions.renderType);
    },
    setToolbarLogic: function(renderType) {
        var _self = this;
        var toolbarButtons = [];
        let tooltip = '';
        if (renderType !== _self.renderType.digitalFile && renderType !== "XML") {
            if (renderType !== "SPED" && renderType !== "AN3" && renderType !== "AN4" && renderType !== "PANEL") {
                toolbarButtons.push({
                    text: i18n("NEW " + renderType),
                    onPress: function() {
                        _self.initializeDialog();
                        _self.createDialog.open();
                    },
                    isButton: true,
                    icon: _self.coreServices.icons.create.icon,
                    iconFont: _self.coreServices.icons.create.iconFont,
                    tooltip: i18n("NEW " + renderType + " TOOLTIP"),
                    enabled: _self.privileges[renderType.toCamelCase()].create
                });
            } else if (renderType === "AN3") {
                toolbarButtons.push({
                    text: i18n("NEW " + renderType),
                    onPress: function() {
                        _self.initializeAN3Dialog();
                        _self.createDialog.open();
                    },
                    isButton: true,
                    icon: _self.coreServices.icons.create.icon,
                    iconFont: _self.coreServices.icons.create.iconFont,
                    tooltip: i18n("NEW " + renderType + " TOOLTIP"),
                    enabled: _self.privileges[renderType.toCamelCase()].create
                });
            } else if (renderType === "AN4") {
                toolbarButtons.push({
                    text: i18n("NEW " + renderType),
                    onPress: function() {
                        _self.initializeAN4Dialog();
                        _self.createDialog.open();
                    },
                    isButton: true,
                    icon: _self.coreServices.icons.create.icon,
                    iconFont: _self.coreServices.icons.create.iconFont,
                    tooltip: i18n("NEW " + renderType + " TOOLTIP"),
                    enabled: _self.privileges[renderType.toCamelCase()].create
                });
            } else if (_self.coreServices.spedType && renderType !== "PANEL") {
                var title = i18n("NEW");
                var enabled = false;
                let pushButton = true;
                tooltip = "NEW";
                switch (_self.coreServices.spedType) {
                    case 1:
                        title += " EFD ICMS / IPI";
                        tooltip += " EFD ICMS / IPI TOOLTIP";
                        enabled = _self.privileges.sped.createEFDICMSIPI;
                        break;
                    case 2:
                        title += " EFD " + i18n("CONTRIBUTIONS");
                        tooltip += " EFD CONTRIBUTIONS TOOLTIP";
                        enabled = _self.privileges.sped.createEFDContributions;
                        break;
                    case 3:
                        title += " ECD";
                        tooltip += " ECD TOOLTIP";
                        enabled = _self.privileges.sped.createECD;
                        break;
                    case 4:
                        title += " ECF";
                        tooltip += " ECF TOOLTIP";
                        enabled = _self.privileges.sped.createECF;
                        break;
                    case 5:
                        title += " REINF";
                        tooltip += " REINF TOOLTIP";
                        enabled = _self.privileges.sped.createSCANC;
                        break;
                    case 6:
                        pushButton = false;
                        break;
                }
                if (pushButton) {
                    toolbarButtons.push({
                        text: title,
                        onPress: function() {
                            _self.initializeSPEDDialog();
                            _self.createDialog.open();
                        },
                        isButton: true,
                        icon: _self.coreServices.icons.create.icon,
                        iconFont: _self.coreServices.icons.create.iconFont,
                        tooltip: i18n(tooltip),
                        enabled: enabled
                    });
                }
            }
        }
        if (renderType === "PANEL" && (_self.coreServices.libraryOptions.dataType[renderType].text === "SETTING" || _self.coreServices.libraryOptions.dataType[renderType].text === "JUSTIFY")) {
            toolbarButtons.push({
                text: i18n("NEW " + _self.coreServices.libraryOptions.dataType[renderType].text),
                onPress: function() {
                    _self.panelSettingDialog = $.baseDialog({
                        title: i18n("NEW " + _self.coreServices.libraryOptions.dataType[renderType].text),
                        modal: true,
                        size: "big",
                        disableOuterClick: true,
                        cssClass: "newFile",
                        viewName: "app.views.dialogs.PanelSetting",
                        viewData: {
                            type: _self.coreServices.libraryOptions.dataType[renderType].text.toLowerCase()
                        },
                        buttons: [{
                            name: i18n("CANCEL"),
                            isCloseButton: true,
                            tooltip: i18n("CLICK PRESS CANCEL"),
                            click: function() {
                                _self.panelSettingDialog.close();
                            }
                        }, {
                            name: i18n("CREATE"),
                            click: function() {
                                _self.loader.open();
                                var item = _self.panelSettingDialog.getInnerController().getFormData();
                                if (item) {
                                    if (_self.coreServices.libraryOptions.dataType[renderType].text === "SETTING") {
                                        Data.endpoints.dfg.panel.createSettingPanel.post(item).success(function() {
                                            _self.loader.close();
                                            _self.panelSettingDialog.close();
                                        });
                                    } else if (_self.coreServices.libraryOptions.dataType[renderType].text === "JUSTIFY") {
                                        Data.endpoints.dfg.panel.createJustify.post(item).success(function() {
                                            _self.loader.close();
                                            _self.panelSettingDialog.close();
                                        });
                                    }
                                } else {
                                    _self.loader.close();
                                }
                            },
                            tooltip: i18n("CLICK PRESS CONFIRM")
                        }]
                    });
                    _self.panelSettingDialog.open();
                },
                isButton: true,
                icon: _self.coreServices.icons.create.icon,
                iconFont: _self.coreServices.icons.create.iconFont,
                tooltip: i18n("CLICK PRESS ENTER TO") + " " + i18n("CREATE") + " " + i18n("NEW SETTING"),
                enabled: _self.privileges.panelSetting.create
            });
        }
        toolbarButtons.push({
            isButton: true,
            icon: _self.coreServices.icons.openClose.icon,
            iconFont: _self.coreServices.icons.openClose.iconFont,
            enabled: true,
            tooltip: i18n("OPEN CLOSE GRID"),
            onPress: function() {
                _self.coreServices.hideLeftPanel();
            }
        });
        if (renderType !== "SPED" && _self.coreServices.libraryOptions.dataType[renderType].text !== "TRASH") {
            var _isFavoriteView = _self.coreServices.libraryOptions.dataType[_self.coreServices.libraryOptions.renderType].text === "FAVORITE";
            toolbarButtons.push({
                    isButton: true,
                    icon: !_isFavoriteView ? _self.coreServices.icons.favorite.icon : _self.coreServices.icons.unmarkFavorite.icon,
                    iconFont: _self.coreServices.icons.favorite.iconFont,
                    enabled: true,
                    tooltip: !_isFavoriteView ? i18n("SET FAVORITES") : i18n("UNSET FAVORITES"),
                    onPress: function() {
                        var elements = _self.getSelectedItems();
                        if (elements.length > 0) {
                            // var arraySize = elements.length;
                            elements = elements.map(function(a) {
                                return {
                                    id: a,
                                    status: _self.coreServices.tableBody[a].favorite
                                };
                                // if (!_self.coreServices.tableBody[a].favorite) {
                                //  return a;
                                // }
                            });
                            //          if (arraySize != elements.length) {
                            //              $.baseToast({
                            //                  text: i18n("DFG101013"),
                            //                  isWarning: true
                            //              });
                            //          }
                            _self.updateFavorite(elements, true);
                        } else {
                            $.baseToast({
                                text: i18n("DFG101012"),
                                isError: true
                            });
                        }
                    }
                }
                /*, {
                isButton: true,
                icon: _self.coreServices.icons.unmarkFavorite.icon,
                iconFont: _self.coreServices.icons.unmarkFavorite.iconFont,
                enabled: true,
                tooltip: i18n("UNSET FAVORITES"),
                onPress: function() {
                    var elements = _self.getSelectedItems();
                    if (elements.length > 0) {
                        var arraySize = elements.length;
                        elements = elements.filter(function(a) {
                            if (_self.coreServices.tableBody[a].favorite) {
                                return a;
                            }
                        });
                        if (arraySize != elements.length) {
                            $.baseToast({
                                text: i18n("DFG101014"),
                                isWarning: true
                            });
                        }
                        _self.updateFavorite(elements, false);
                    } else {
                        $.baseToast({
                            text: i18n("DFG101012"),
                            isError: true
                        });
                    }
                }
            }*/
            );
            //          if (_self.privileges[renderType.toCamelCase()].create && renderType !== _self.renderType.digitalFile && renderType !== _self.renderType
            //              .PANEL) {
            //              toolbarButtons.push({
            //                  isButton: true,
            //                  icon: _self.coreServices.icons.copy.icon,
            //                  iconFont: _self.coreServices.icons.copy.iconFont,
            //                  enabled: true,
            //                  tooltip: i18n("LIBRARY COPY TOOLTIP"),
            //                  onPress: function() {
            //                      var elements = _self.getSelectedItems();
            //                      if (elements.length > 1) {
            //                          $.baseToast({
            //                              text: i18n("DFG101027"),
            //                              isError: true
            //                          });
            //                      } else if (elements.length) {
            //                          _self.copyFiles(elements[0]);

            //                      } else {
            //                          $.baseToast({
            //                              text: i18n("DFG101012"),
            //                              isError: true
            //                          });
            //                      }
            //                  }
            //              });
            //          }
            if (_self.privileges[renderType.toCamelCase()].trash && renderType !== _self.renderType.digitalFile) {
                toolbarButtons.push({
                    isButton: true,
                    icon: _self.coreServices.icons.recycleBin.icon,
                    iconFont: _self.coreServices.icons.recycleBin.iconFont,
                    enabled: true,
                    tooltip: i18n("CLICK PRESS TO LIBRARY TRASH"),
                    onPress: function() {
                        var elements = _self.getSelectedItems();
                        if (elements.length > 0) {
                            _self.updateFiles(elements, 2, (elements.length > 1) ? "DFG101021" : "DFG101022");
                        } else {
                            $.baseToast({
                                text: i18n("DFG101012"),
                                isError: true
                            });
                        }
                    }
                });
            }
            if (_self.privileges[renderType.toCamelCase()].delete && renderType === _self.renderType.digitalFile) {
                toolbarButtons.push({
                    isButton: true,
                    icon: _self.coreServices.icons.delete.icon,
                    iconFont: _self.coreServices.icons.delete.iconFont,
                    enabled: true,
                    tooltip: i18n("CLICK PRESS TO") + "  " + i18n("DELETE"),
                    onPress: function() {
                        var elements = _self.getSelectedItems();
                        var containsOfficialFiles = false;
                        for (var index = 0; index < elements.length; index++) {
                            var fileStatus = _self.coreServices.tableBody[elements[index]].status;
                            if (fileStatus === "300" || fileStatus === "400") {
                                containsOfficialFiles = true;
                                break;
                            }
                        }
                        if (!containsOfficialFiles) {
                            if (elements.length > 0) {
                                _self.updateFiles(elements, 3, (elements.length > 1) ? "DFG101023" : "DFG101024");
                            } else {
                                $.baseToast({
                                    text: i18n("DFG101012"),
                                    isWarning: true
                                });
                            }
                        } else {
                            $.baseToast({
                                text: i18n("DFG101020"),
                                isWarning: true
                            });
                        }
                    }
                });
            }
        } else {
            if (_self.coreServices.libraryOptions.dataType[renderType].text === "TRASH") {
                if (_self.privileges[renderType.toCamelCase()].restore) {
                    tooltip = '';
                    switch (renderType) {
                        case 'LAYOUT':
                            tooltip = i18n("MULTIPLE RESTORE LAYOUT TOOLTIP");
                            break;
                        case 'SETTING':
                            tooltip = i18n("MULTIPLE RESTORE SETTING TOOLTIP");
                            break;
                        default:
                            tooltip = i18n("MULTIPLE RESTORE FILE TOOLTIP");
                            break;
                    }
                    toolbarButtons.push({
                        isButton: true,
                        icon: _self.coreServices.icons.restore.icon,
                        iconFont: _self.coreServices.icons.restore.iconFont,
                        enabled: true,
                        tooltip: tooltip,
                        onPress: function() {
                            var elements = _self.getSelectedItems();
                            if (elements.length > 0) {
                                _self.updateFiles(elements, 1, (elements.length > 1) ? "DFG101025" : "DFG101008");
                            } else {
                                $.baseToast({
                                    text: i18n("DFG101012"),
                                    isWarning: true
                                });
                            }
                        }
                    });
                }
                if (_self.privileges[renderType.toCamelCase()].delete) {
                    toolbarButtons.push({
                        isButton: true,
                        icon: _self.coreServices.icons.delete.icon,
                        iconFont: _self.coreServices.icons.delete.iconFont,
                        enabled: true,
                        tooltip: i18n("CLICK PRESS TO") + "  " + i18n("DELETE"),
                        onPress: function() {
                            var elements = _self.getSelectedItems();
                            if (elements.length > 0) {
                                _self.updateFiles(elements, 3, (elements.length > 1) ? "DFG101023" : "DFG101024");
                            } else {
                                $.baseToast({
                                    text: i18n("DFG101012"),
                                    isWarning: true
                                });
                            }
                        }
                    });
                }
            }
        }
        if (renderType !== "SPED") {
            toolbarButtons.push({
                isButton: true,
                icon: _self.coreServices.icons.addFolder.icon,
                iconFont: _self.coreServices.icons.addFolder.iconFont,
                tooltip: {
                    "class": "dark mkt-tooltip",
                    position: "top",
                    text: i18n("CLICK PRESS TO") + "  " + i18n("CREATE FOLDER")
                },
                onPress: function() {
                    var dialog = $.baseCreateFolder({
                        idParent: _self.coreServices.folders[_self.coreServices.libraryOptions.renderType].currentId,
                        objectType: (renderType !== "AN4" && renderType !== "AN3") ? "DFG::" + renderType.toUpperCamelCase() : "DFG::" + renderType,
                        onCreateFolder: function() {
                            _self.coreServices.renderFolderTree(renderType);
                        }
                    });
                    dialog.open();
                }
            });
            toolbarButtons.push({
                iconFont: _self.coreServices.icons.manageFolders.iconFont,
                icon: _self.coreServices.icons.manageFolders.icon,
                tooltip: {
                    "class": "dark mkt-tooltip",
                    position: "top",
                    text: i18n("CLICK PRESS TO") + "  " + i18n("MANAGE FOLDER")
                },
                onPress: function() {
                    var dialog = $.baseManageFolder({
                        idFolder: _self.coreServices.folders[_self.coreServices.libraryOptions.renderType].currentId,
                        objectType: (renderType !== "AN4" && renderType !== "AN3") ? "DFG::" + renderType.toUpperCamelCase() : "DFG::" + renderType,
                        onUpdateFolder: function() {
                            _self.coreServices.renderFolderTree(renderType);
                        }
                    });
                    if (_self.coreServices.folders[_self.coreServices.libraryOptions.renderType].currentId !== -1) {
                        dialog.open();
                    } else {
                        $.baseToast({
                            text: i18n("DFG101011"),
                            isWarning: true
                        });
                    }
                }
            });
            toolbarButtons.push({
                iconFont: _self.coreServices.icons.moveFolder.iconFont,
                icon: _self.coreServices.icons.moveFolder.icon,
                tooltip: {
                    "class": "dark mkt-tooltip",
                    position: "top",
                    text: i18n("CLICK PRESS TO") + "  " + i18n("MOVE FOLDER")
                },
                onPress: function() {
                    var dialog = $.baseMoveFolder({
                        idFolder: _self.coreServices.folders[_self.coreServices.libraryOptions.renderType].currentId,
                        objectType: (renderType !== "AN4" && renderType !== "AN3") ? "DFG::" + renderType.toUpperCamelCase() : "DFG::" + renderType,
                        onMoveFolder: function() {
                            _self.coreServices.renderFolderTree(renderType);
                        }
                    });
                    if (_self.coreServices.folders[_self.coreServices.libraryOptions.renderType].currentId !== -1) {
                        dialog.open();
                    } else {
                        $.baseToast({
                            text: i18n("DFG101011"),
                            isWarning: true
                        });
                    }
                }
            });
        }
        if (renderType === "XML") {
            toolbarButtons = [];
            toolbarButtons.push({
                text: i18n("NEW") + " " + "XML" + " " + "FILE",
                onPress: function() {
                    _self.initializeDialogXML();
                    _self.createDialog.open();
                },
                isButton: true,
                icon: _self.coreServices.icons.create.icon,
                iconFont: _self.coreServices.icons.create.iconFont,
                tooltip: i18n("NEW") + " " + "XML" + " " + "FILE" + " " + "TOOLTIP",
                enabled: true
            });
        }
        _self._view.toolbar.bindBaseLibraryToolbar({
            leftButtons: toolbarButtons,
            rightButtons: [],
            listViewAction: function() {
                _self.libraryWrapper.addClass("list-view");
                _self.coreServices.libraryOptions.displayType = "LIST";
                _self.renderAccordionFiles({
                    counter: true,
                    searchParams: {}
                }, true);
            },
            gridViewAction: function() {
                _self.libraryWrapper.removeClass("list-view");
                _self.coreServices.libraryOptions.displayType = "TILE";
                _self.renderAccordionFiles({
                    counter: true,
                    searchParams: {}
                }, true);
            }
        });
        if (_self.coreServices.libraryOptions.displayType === "TILE") {
            $(".list-btn").removeClass("active");
        }
    },
    renderAccordionFiles: function(searchParams, fromToolbar) {
        var _self = this;
        _self.libraryWrapper.empty();
        _self.loader.open();
        searchParams = (searchParams) ? searchParams : {};
        searchParams.name = _self._view.search.input.ctrl ? _self._view.search.input.ctrl.getText() : "";
        searchParams.key = _self.coreServices.libraryOptions.dataType[_self.coreServices.libraryOptions.renderType].text;
        //      if (_self.coreServices.libraryOptions.displayType === "LIST") {
        searchParams.number = searchParams.number ? searchParams.number : 1;
        //      }
        //Sped
        if( _self.coreServices.libraryOptions.renderType === "SPED" && _self.coreServices.spedType === 6){

            //E-social sped
            searchParams.type = _self.coreServices.spedType;
            searchParams.subType = _self.coreServices.spedSubType;
            searchParams.getFiltersData = false;
            searchParams.counter = false;
            
            _self.loader.open();
        Data.endpoints.dfg.sped.list.eSocial.post(searchParams).success(function(response) {
            _self.coreServices.spedFilters = response.filters;
            _self.coreServices.spedCounter = response.counter;
            _self.renderSPEDTable(response, _self.coreServices.spedSubType );
            if (response.counter) {
                _self.coreServices.updateSPEDCount(response.counter);
            }
            _self.loader.close();
        }).error(function() {
            if (_self.coreServices.spedType.type >= 6 && _self.privileges.sped.eSocialRead === false) {
                $.baseToast({
                    type: "e",
                    text: i18n("NO READ PRIVILEGE FOR") + ' ' + 'e-Social'
                });
            }
            _self.coreServices.spedFilters = [];
            _self.coreServices.spedCounter = 1;
            _self.renderSPEDTable({
                list: []
            });
            _self.loader.close();
        });
        } else {
            
        Data.endpoints.dfg[_self.coreServices.libraryOptions.renderType.toCamelCase()].listFiles.post(searchParams).success(function(response) {
            _self.libraryResponse = response;
            _self.coreServices.filterOptions = response.filterOptions;
            //          if (searchParams.fromStoredSettings) {
            var lastLibrarySettings = localStorage.lastLibrarySettings ? JSON.parse(localStorage.lastLibrarySettings) : false;
            _self.actualPage = lastLibrarySettings.actualPage;
            //              if (lastLibrarySettings.filters) {
            if (_self._view.advancedFiltersCont && !_self._view.advancedFiltersCont.ctrl) {
                _self.bindAdvanceFilters(_self.coreServices.libraryOptions.renderType, lastLibrarySettings.filters || {});
                _self.coreServices.openFilter(true);
            }
            //              }
            //          }
            if (!fromToolbar) {
                _self.renderToolbar(_self.coreServices.libraryOptions.renderType);
            }
            if (_self.coreServices.libraryOptions.displayType === "LIST") {
                if( _self.coreServices.libraryOptions.renderType === "SPED"){
                    _self.renderSPEDTable(response);
                } else {
                    _self.renderFilesTable(response, searchParams);
                    _self.loader.close();
                }
                
            } else {
                _self.renderTilesTable(response.list, response.pageCount, searchParams);
                _self.loader.close();
            }
            if (searchParams.counter) {
                _self.coreServices.updateFileCount(_self.coreServices.libraryOptions.renderType.toCamelCase(), response.counters);
            }
        }).error(function() {
            var privilegesName = _self.coreServices.libraryOptions.renderType.toCamelCase();
            if (!_self.privileges[privilegesName].read) {
                $.baseToast({
                    type: "E",
                    text: i18n("NO READ PRIVILEGE FOR") + " " + i18n(privilegesName.toUpperCase() + "S")
                });
            }
            if (_self.coreServices.libraryOptions.displayType === "LIST") {
                _self.renderFilesTable([]);
            } else {
                _self.renderTilesTable([], 1);
            }
            _self.loader.close();
        });
        }

    },
    getActions: function(content) {
        var _self = this;
        var actions = [];
        var privilegesName = _self.coreServices.libraryOptions.renderType.toCamelCase();
        var _renderType = _self.coreServices.libraryOptions.renderType;
        if (_self.coreServices.libraryOptions.dataType[_self.coreServices.libraryOptions.renderType].text === "TRASH") {
            if (_self.privileges[privilegesName].read) {
                if (_self.coreServices.libraryOptions.renderType !== _self.renderType.PANEL) {
                    actions.push({
                        icon: _self.coreServices.icons.detail.icon,
                        iconFont: _self.coreServices.icons.detail.iconFont,
                        text: i18n("INFORMATION"),
                        tooltip: i18n(_renderType.toUpperCase() + " DETAILS TOOLTIP"),
                        onPress: function() {
                            _self.showInformation(content);
                        }
                    });
                }
            }

            if (_self.privileges[privilegesName]["delete"] || _self.coreServices.libraryOptions.renderType === _self.renderType.digitalFile) {
                actions.push({
                    icon: _self.coreServices.icons["delete"].icon,
                    iconFont: _self.coreServices.icons["delete"].iconFont,
                    tooltip: i18n("DELETE TOOLTIP") + " " + i18n(_renderType.toUpperCase()),
                    text: i18n("LIBRARY DELETE"),
                    onPress: function() {
                        if (content.status !== 300 || content.status !== 400) {
                            if (_self.coreServices.libraryOptions.renderType === _self.renderType.layout) {
                                _self.updateFiles([content.idLayout], 3, (content.length > 1) ? "DFG101023" : "DFG101024");
                            } else {
                                _self.updateFiles([content.id], 3, (content.length > 1) ? "DFG101023" : "DFG101024");
                            }

                        } else {
                            $.baseToast({
                                text: i18n("DFG101020"),
                                isWarning: true
                            });
                        }
                    }
                });
            }
            if (_self.privileges[privilegesName].restore) {
                actions.push({
                    icon: _self.coreServices.icons.restore.icon,
                    iconFont: _self.coreServices.icons.restore.iconFont,
                    text: i18n("RESTORE"),
                    onPress: function() {
                        if (_self.coreServices.libraryOptions.renderType === _self.renderType.layout) {
                            _self.updateFiles([content.idLayout], 1, (content.length > 1) ? "DFG101025" : "DFG101008");
                        } else {
                            _self.updateFiles([content.id], 1, (content.length > 1) ? "DFG101025" : "DFG101008");
                        }

                    }
                });
            }
        } else {
            if (_self.privileges[privilegesName].read) {
                if (_self.coreServices.libraryOptions.renderType !== _self.renderType.PANEL) {
                    actions.push({
                        icon: _self.coreServices.icons.detail.icon,
                        iconFont: _self.coreServices.icons.detail.iconFont,
                        text: i18n("INFORMATION"),
                        tooltip: i18n(_renderType.toUpperCase() + " DETAILS TOOLTIP"),
                        onPress: function() {
                            _self.showInformation(content);
                        }
                    });
                }
                if (content.idBFBLayout && content.idBFBLayout != null) {
                    actions.push({
                        icon: _self.coreServices.icons.visualization.icon,
                        iconFont: _self.coreServices.icons.visualization.iconFont,
                        tooltip: i18n(_renderType.toUpperCase() + " VIEW TOOLTIP"),
                        text: i18n("VISUALIZE"),
                        onPress: function() {
                            _self.saveLibraryOptions();
                            window.location = "#/vieweran3?id=" + content.id;
                        }
                    });
                }
                if (_self.coreServices.libraryOptions.renderType === _self.renderType.layout) {
                    actions.push({
                        icon: _self.coreServices.icons.visualization.icon,
                        iconFont: _self.coreServices.icons.visualization.iconFont,
                        text: i18n("LIBRARY DETAIL"),
                        tooltip: i18n(_renderType.toUpperCase() + " VIEW TOOLTIP"),
                        onPress: function() {
                            _self.saveLibraryOptions();
                            if (_self.coreServices.libraryOptions.renderType === _self.renderType.layout) {
                                window.location = "#/exhibition?id=" + content.idLayout;
                            } else {
                                window.location = "#/exhibition?id=" + content.id;
                            }

                        }
                    });
                    //  actions.push({
                    //      icon: _self.coreServices.icons.preview.icon,
                    //      iconFont: _self.coreServices.icons.preview.iconFont,
                    //      text: i18n("LIBRARY DETAIL"),
                    //      onPress: function() {
                    //          if (_self.coreServices.libraryOptions.renderType === _self.renderType.layout) {
                    //              var index = $(this.currentTarget).closest('.tr').index();
                    //              _self.loader.open();
                    //              _self.getLayoutObject(_self.libraryResponse.list[index].idLayout, function() {
                    //                  _self.initializeDialog(undefined, true);
                    //                  _self.createDialog.open();
                    //                  _self.loader.close();
                    //              })
                    //          }
                    //      }
                    //  });
                } else if (_self.coreServices.libraryOptions.renderType === _self.renderType.setting) {
                    actions.push({
                        icon: _self.coreServices.icons.visualization.icon,
                        iconFont: _self.coreServices.icons.visualization.iconFont,
                        text: i18n("LIBRARY DETAIL"),
                        tooltip: i18n(_renderType.toUpperCase() + " VIEW TOOLTIP"),
                        onPress: function() {
                            if (_self.coreServices.libraryOptions.renderType === _self.renderType.setting) {
                                _self.initializeDialog(undefined, true, content, 'isViewing');
                                _self.createDialog.open();
                            }
                        }
                    });
                } else if (_self.coreServices.libraryOptions.renderType === _self.renderType.PANEL) {
                    if (content.status < 4 || content.status === 5) {
                        if (_self.coreServices.libraryOptions.dataType[_self.coreServices.libraryOptions.renderType].text !== "SETTING") {
                            actions.push({
                                icon: _self.coreServices.icons.visualization.icon,
                                iconFont: _self.coreServices.icons.visualization.iconFont,
                                text: i18n("LIBRARY DETAIL"),
                                tooltip: i18n(_renderType.toUpperCase() + " VIEW TOOLTIP"),
                                onPress: function() {
                                    _self.saveLibraryOptions();
                                    window.location = "#/executoran3?id=" + content.idDigitalFile + "&idReport=" + content.idReport;
                                }
                            });
                            actions.push({
                                icon: "messagelight",
                                iconFont: "Communication",
                                text: i18n("JUSTIFICATION"),
                                onPress: function() {
                                    var elements = _self.getSelectedItems();
                                    var body = _self.coreServices.tableBody;

                                    var haveSameStatus = true;
                                    var lastStatus;
                                    var panels = [];
                                    for (var element = 0; element < elements.length; element++) {
                                        if (lastStatus === undefined) {
                                            lastStatus = body[elements[element]].elementData.status;
                                        } else if (lastStatus !== body[elements[element]].elementData.status) {
                                            haveSameStatus = false;
                                            break;
                                        }
                                        panels.push(body[elements[element]].elementData);
                                        panels[element].title = body[elements[element]].elementData.report[0].name;
                                        panels[element].executedReportId = body[elements[element]].elementData.report[0].id;
                                        panels[element].panel = {
                                            id: body[elements[element]].elementData.id
                                        };
                                        panels[element].comments = body[elements[element]].elementData.justify;

                                    }
                                    if (haveSameStatus) {
                                        content.AN3[0].title = content.report[0].name;
                                        content.AN3[0].executedReportId = content.report[0].id;
                                        content.AN3[0].panel = {
                                            id: content.id
                                        }
                                        content.AN3.comments = content.justify;
                                        _self.justifyDialog = $.baseDialog({
                                            title: i18n("JUSTIFICATION"),
                                            modal: true,
                                            size: "big",
                                            outerClick: "disabled",
                                            viewName: "app.views.executoran3.approveDialog",
                                            viewData: {
                                                AN3: elements.length === 0 ? content.AN3[0] : panels
                                            },
                                            buttons: [{
                                                name: i18n("CLOSE"),
                                                isCloseButton: true
                                            }, {
                                                name: i18n("APPLY"),
                                                click: function() {
                                                    if (_self.justifyDialog.getInnerController().validate()) {
                                                        _self.loader.open();
                                                        var item = _self.justifyDialog.getInnerController().getItem();

                                                        Data.endpoints.dfg.panel.approve.post({
                                                            item: item
                                                        }).success(function(data) {
                                                            $.baseToast({
                                                                isSuccess: true,
                                                                text: i18n("SUCCESS APPROVE PANEL")
                                                            });
                                                            _self.loader.close();
                                                            _self.justifyDialog.close();
                                                        }).error(function() {
                                                            _self.loader.close();
                                                        });
                                                    } else {
                                                        $.baseToast({
                                                            type: "w",
                                                            text: i18n("FILL ALL FIELDS")
                                                        });
                                                    }
                                                }
                                            }]
                                        });
                                        _self.justifyDialog.open();
                                    } else {
                                        $.baseToast({
                                            text: i18n("PANELS WITH DIFFERENT STATUS WARNING")
                                        });
                                    }

                                }
                            });
                            actions.push({
                                icon: "analysisdoc",
                                iconFont: "File-and-Folders",
                                text: i18n("INTERRUPT"),
                                onPress: function() {
                                    var elements = _self.getSelectedItems();
                                    var body = _self.coreServices.tableBody;

                                    var haveSameStatus = true;
                                    var lastStatus;
                                    var panels = [];
                                    for (var element = 0; element < elements.length; element++) {
                                        if (lastStatus === undefined) {
                                            lastStatus = body[elements[element]].elementData.status;
                                        } else if (lastStatus !== body[elements[element]].elementData.status) {
                                            haveSameStatus = false;
                                            break;
                                        }
                                        panels.push({
                                            id: body[elements[element]].elementData.id,
                                            status: 3
                                        });

                                    }
                                    if (haveSameStatus) {
                                        _self.interruptDialog = $.baseDialog({
                                            title: i18n("INTERRUPT"),
                                            modal: true,
                                            size: "small",
                                            outerClick: "disabled",
                                            cssClass: "dfg-alert",
                                            viewName: "app.views.dialogs.Alert",
                                            viewData: {
                                                text: panels.length > 1 ? i18n("INTERRUPT PANELS") : i18n("INTERRUPT PANEL")
                                            },
                                            buttons: [{
                                                name: i18n("CANCEL"),
                                                isCloseButton: true
                                            }, {
                                                name: i18n("INTERRUPT"),
                                                click: function() {
                                                    var item = {
                                                        id: content.id,
                                                        status: 3
                                                    };
                                                    _self.loader.open();
                                                    Data.endpoints.dfg.panel.update.post({
                                                        item: elements.length === 0 ? item : panels
                                                    }).success(function(data) {
                                                        $.baseToast({
                                                            isSuccess: true,
                                                            text: i18n("SUCCESS INTERRUPT PANEL")
                                                        });
                                                        _self.loader.close();
                                                        _self.interruptDialog.close();
                                                        _self.coreServices.renderAccordionFiles();
                                                    }).error(function() {
                                                        _self.loader.close();
                                                    });
                                                }
                                            }]
                                        });
                                        _self.interruptDialog.open();
                                    } else {
                                        $.baseToast({
                                            text: i18n("PANELS WITH DIFFERENT STATUS WARNING")
                                        });
                                    }
                                }
                            });
                            actions.push({
                                icon: _self.coreServices.icons.approve.icon,
                                iconFont: _self.coreServices.icons.approve.iconFont,
                                text: i18n("APPROVE"),
                                onPress: function() {
                                    var elements = _self.getSelectedItems();
                                    var body = _self.coreServices.tableBody;

                                    var haveSameStatus = true;
                                    var lastStatus;
                                    var panels = [];
                                    for (var element = 0; element < elements.length; element++) {
                                        if (lastStatus === undefined) {
                                            lastStatus = body[elements[element]].elementData.status;
                                        } else if (lastStatus !== body[elements[element]].elementData.status) {
                                            haveSameStatus = false;
                                            break;
                                        }
                                        panels.push({
                                            id: body[elements[element]].elementData.id,
                                            status: 5
                                        });

                                    }
                                    if (haveSameStatus) {
                                        _self.approveDialog = $.baseDialog({
                                            title: i18n("APPROVE"),
                                            modal: true,
                                            size: "small",
                                            outerClick: "disabled",
                                            cssClass: "dfg-alert",
                                            viewName: "app.views.dialogs.Alert",
                                            viewData: {
                                                text: panels.length > 1 ? i18n("APPROVE PANELS") : i18n("APPROVE PANEL")
                                            },
                                            buttons: [{
                                                name: i18n("NO"),
                                                isCloseButton: true,
                                                click: function() {
                                                    panels = panels.map(function(panel) {
                                                        panel.status = 5;
                                                        return panel;
                                                    });
                                                    var item = {
                                                        id: content.id,
                                                        status: 5
                                                    };
                                                    _self.loader.open();
                                                    Data.endpoints.dfg.panel.update.post({
                                                        item: elements.length === 0 ? item : panels
                                                    }).success(function(data) {
                                                        _self.loader.close();
                                                        _self.approveDialog.close();
                                                        _self.coreServices.renderAccordionFiles();
                                                    }).error(function() {
                                                        _self.loader.close();
                                                    });
                                                }
                                            }, {
                                                name: i18n("APPROVE"),
                                                click: function() {
                                                    panels = panels.map(function(panel) {
                                                        panel.status = 4;
                                                        return panel;
                                                    });
                                                    var item = {
                                                        id: content.id,
                                                        status: 4
                                                    };
                                                    _self.loader.open();
                                                    Data.endpoints.dfg.panel.update.post({
                                                        item: panels.length ? panels : item
                                                    }).success(function(data) {
                                                        $.baseToast({
                                                            isSuccess: true,
                                                            text: i18n("SUCCESS APPROVE PANEL")
                                                        });
                                                        _self.loader.close();
                                                        _self.approveDialog.close();
                                                        _self.coreServices.renderAccordionFiles();
                                                    }).error(function() {
                                                        _self.loader.close();
                                                    });
                                                }
                                            }]
                                        });
                                        _self.approveDialog.open();
                                    } else {
                                        $.baseToast({
                                            text: i18n("PANELS WITH DIFFERENT STATUS WARNING")
                                        });
                                    }
                                }
                            });
                        } else {
                            actions.push({
                                icon: _self.coreServices.icons.detail.icon,
                                iconFont: _self.coreServices.icons.detail.iconFont,
                                text: i18n("INFORMATION"),
                                tooltip: i18n(_renderType.toUpperCase() + " DETAILS TOOLTIP"),
                                onPress: function() {
                                    _self.showInformation(content);
                                }
                            });
                            actions.push({
                                icon: _self.coreServices.icons.edit.icon,
                                iconFont: _self.coreServices.icons.edit.iconFont,
                                tooltip: i18n("EDIT TOOLTIP") + " " + i18n(_renderType.toUpperCase()),
                                text: i18n("LIBRARY EDIT"),
                                onPress: function() {
                                    _self.panelSettingDialog = $.baseDialog({
                                        title: i18n("LIBRARY EDIT"),
                                        modal: true,
                                        size: "big",
                                        disableOuterClick: true,
                                        cssClass: "newFile",
                                        viewName: "app.views.dialogs.PanelSetting",
                                        viewData: {
                                            type: "setting",
                                            setting: content
                                        },
                                        buttons: [{
                                            name: i18n("CANCEL"),
                                            isCloseButton: true,
                                            tooltip: i18n("CLICK PRESS CANCEL"),
                                            click: function() {
                                                _self.panelSettingDialog.close();
                                            }
                                        }, {
                                            name: i18n("APPLY"),
                                            click: function() {
                                                _self.loader.open();
                                                var item = _self.panelSettingDialog.getInnerController().getFormData();
                                                if (item) {
                                                    item.idTax = JSON.stringify(item.idTax);
                                                    Data.endpoints.dfg.panel.updateSettingPanel.post(item).success(function(data) {
                                                        _self.loader.close();
                                                        _self.panelSettingDialog.close();
                                                    });
                                                } else {
                                                    _self.loader.close();
                                                }
                                            },
                                            tooltip: i18n("CLICK PRESS CONFIRM")
                                        }]
                                    });
                                    _self.panelSettingDialog.open();
                                }
                            });
                        }
                    } else {
                        if (content.status === 4 || content.status === 7) {
                            actions.push({
                                icon: "messagelight",
                                iconFont: "Communication",
                                text: i18n("APPROVE") + " PVA",
                                onPress: function() {
                                    var elements = _self.getSelectedItems();
                                    var body = _self.coreServices.tableBody;

                                    var haveSameStatus = true;
                                    var lastStatus;
                                    var panels = [];
                                    for (var element = 0; element < elements.length; element++) {
                                        if (lastStatus === undefined) {
                                            lastStatus = body[elements[element]].elementData.status;
                                        } else if (lastStatus !== body[elements[element]].elementData.status) {
                                            haveSameStatus = false;
                                            break;
                                        }
                                        panels.push({
                                            id: body[elements[element]].elementData.id
                                        });

                                    }
                                    if (haveSameStatus) {
                                        _self.panelSettingDialog = $.baseDialog({
                                            title: i18n("APPROVE") + " PVA",
                                            modal: true,
                                            size: "medium",
                                            disableOuterClick: true,
                                            cssClass: "newFile",
                                            viewName: "app.views.dialogs.PanelSetting",
                                            viewData: {
                                                type: "approvePva"
                                            },
                                            buttons: [{
                                                name: i18n("CANCEL"),
                                                isCloseButton: true,
                                                tooltip: i18n("CLICK PRESS CANCEL"),
                                                click: function() {
                                                    _self.panelSettingDialog.close();
                                                }
                                            }, {
                                                name: i18n("APPROVE"),
                                                click: function() {
                                                    _self.loader.open();
                                                    var item = _self.panelSettingDialog.getInnerController().getFormData();
                                                    if (item) {
                                                        var items = [];
                                                        if (panels.length) {
                                                            panels.map(function(element) {
                                                                items.push(JSON.parse(JSON.stringify(item)));
                                                                items[items.length - 1].status = item.success ? 6 : 7;
                                                                items[items.length - 1].idPanel = element.id;
                                                            })
                                                        }
                                                        item.status = item.success ? 6 : 7;
                                                        item.idPanel = content.id;
                                                        Data.endpoints.dfg.panel.approvePVA.post({
                                                            item: items.length === 0 ? item : items
                                                        }).success(function(data) {
                                                            _self.loader.close();
                                                            _self.panelSettingDialog.close();
                                                            _self.coreServices.renderAccordionFiles();
                                                        });
                                                    } else {
                                                        _self.loader.close();
                                                    }
                                                },
                                                tooltip: i18n("CLICK PRESS CONFIRM")
                                            }]
                                        });
                                        _self.panelSettingDialog.open();
                                    } else {
                                        $.baseToast({
                                            text: i18n("PANELS WITH DIFFERENT STATUS WARNING")
                                        });
                                    }
                                }
                            });
                        } else if (content.status === 6 || content.status === 9) {
                            actions.push({
                                icon: "analysisdoc",
                                iconFont: "File-and-Folders",
                                text: i18n("DIGITAL SIGNATURE"),
                                onPress: function() {

                                    var elements = _self.getSelectedItems();
                                    var body = _self.coreServices.tableBody;

                                    var haveSameStatus = true;
                                    var lastStatus;
                                    var panels = [];
                                    for (var element = 0; element < elements.length; element++) {
                                        if (lastStatus === undefined) {
                                            lastStatus = body[elements[element]].elementData.status;
                                        } else if (lastStatus !== body[elements[element]].elementData.status) {
                                            haveSameStatus = false;
                                            break;
                                        }
                                        panels.push({
                                            id: body[elements[element]].elementData.id,
                                            status: 3
                                        });

                                    }
                                    if (haveSameStatus) {
                                        _self.panelSettingDialog = $.baseDialog({
                                            title: i18n("DIGITAL SIGNATURE"),
                                            modal: true,
                                            size: "medium",
                                            disableOuterClick: true,
                                            cssClass: "newFile",
                                            viewName: "app.views.dialogs.PanelSetting",
                                            viewData: {
                                                type: "signaturePva"
                                            },
                                            buttons: [{
                                                name: i18n("CANCEL"),
                                                isCloseButton: true,
                                                tooltip: i18n("CLICK PRESS CANCEL"),
                                                click: function() {
                                                    _self.panelSettingDialog.close();
                                                }
                                            }, {
                                                name: i18n("APPLY"),
                                                click: function() {
                                                    _self.loader.open();
                                                    var item = _self.panelSettingDialog.getInnerController().getFormData();
                                                    if (item) {
                                                        var items = [];
                                                        if (panels.length) {
                                                            panels.map(function(element) {
                                                                items.push(JSON.parse(JSON.stringify(item)));
                                                                items[items.length - 1].status = item.success ? 8 : 9;
                                                                items[items.length - 1].idPanel = element.id;
                                                            })
                                                        }

                                                        item.status = item.success ? 8 : 9;
                                                        item.idPanel = content.id;
                                                        Data.endpoints.dfg.panel.approvePVA.post({
                                                            item: items.length === 0 ? item : items
                                                        }).success(function(data) {
                                                            _self.loader.close();
                                                            _self.panelSettingDialog.close();
                                                            _self.coreServices.renderAccordionFiles();
                                                        });
                                                    } else {
                                                        _self.loader.close();
                                                    }
                                                },
                                                tooltip: i18n("CLICK PRESS CONFIRM")
                                            }]
                                        });
                                        _self.panelSettingDialog.open();
                                    } else {
                                        $.baseToast({
                                            text: i18n("PANELS WITH DIFFERENT STATUS WARNING")
                                        });
                                    }
                                }
                            });
                        } else if (content.status === 8 || content.status === 11) {
                            actions.push({
                                icon: "filleddocument",
                                iconFont: "File-and-Folders",
                                text: i18n("FILE TRANSMISSION"),
                                onPress: function() {
                                    var elements = _self.getSelectedItems();
                                    var body = _self.coreServices.tableBody;

                                    var haveSameStatus = true;
                                    var lastStatus;
                                    var panels = [];
                                    for (var element = 0; element < elements.length; element++) {
                                        if (lastStatus === undefined) {
                                            lastStatus = body[elements[element]].elementData.status;
                                        } else if (lastStatus !== body[elements[element]].elementData.status) {
                                            haveSameStatus = false;
                                            break;
                                        }
                                        panels.push({
                                            id: body[elements[element]].elementData.id
                                        });

                                    }
                                    if (haveSameStatus) {
                                        _self.panelSettingDialog = $.baseDialog({
                                            title: i18n("FILE TRANSMISSION"),
                                            modal: true,
                                            size: "medium",
                                            disableOuterClick: true,
                                            cssClass: "newFile",
                                            viewName: "app.views.dialogs.PanelSetting",
                                            viewData: {
                                                type: "transmissionPva"
                                            },
                                            buttons: [{
                                                name: i18n("CANCEL"),
                                                isCloseButton: true,
                                                tooltip: i18n("CLICK PRESS CANCEL"),
                                                click: function() {
                                                    _self.panelSettingDialog.close();
                                                }
                                            }, {
                                                name: i18n("APPLY"),
                                                click: function() {
                                                    _self.loader.open();
                                                    var item = _self.panelSettingDialog.getInnerController().getFormData();
                                                    if (item) {
                                                        var items = [];
                                                        if (panels.length) {
                                                            panels.map(function(element) {
                                                                items.push(JSON.parse(JSON.stringify(item)));
                                                                items[items.length - 1].status = item.success ? 10 : 11;
                                                                items[items.length - 1].idPanel = element.id;
                                                            })
                                                        }

                                                        item.status = item.success ? 10 : 11;
                                                        item.idPanel = content.id;
                                                        Data.endpoints.dfg.panel.approvePVA.post({
                                                            item: items.length ? items : item
                                                        }).success(function(data) {
                                                            _self.loader.close();
                                                            _self.panelSettingDialog.close();
                                                            _self.coreServices.renderAccordionFiles();
                                                        });
                                                    } else {
                                                        _self.loader.close();
                                                    }
                                                },
                                                tooltip: i18n("CLICK PRESS CONFIRM")
                                            }]
                                        });
                                        _self.panelSettingDialog.open();
                                    } else {
                                        $.baseToast({
                                            text: i18n("PANELS WITH DIFFERENT STATUS WARNING")
                                        });
                                    }
                                }
                            });
                        } else if (content.status === 10 || content.status === 12 || content.status === 13) {
                            actions.push({
                                icon: "movedoc",
                                iconFont: "File-and-Folders",
                                text: i18n("SAVE"),
                                onPress: function() {
                                    var elements = _self.getSelectedItems();
                                    var body = _self.coreServices.tableBody;

                                    var haveSameStatus = true;
                                    var lastStatus;
                                    var panels = [];
                                    for (var element = 0; element < elements.length; element++) {
                                        if (lastStatus === undefined) {
                                            lastStatus = body[elements[element]].elementData.status;
                                        } else if (lastStatus !== body[elements[element]].elementData.status) {
                                            haveSameStatus = false;
                                            break;
                                        }
                                        panels.push({
                                            id: body[elements[element]].elementData.id
                                        });

                                    }
                                    if (haveSameStatus) {
                                        _self.panelSettingDialog = $.baseDialog({
                                            title: i18n("SAVE"),
                                            modal: true,
                                            size: "medium",
                                            disableOuterClick: true,
                                            cssClass: "newFile",
                                            viewName: "app.views.dialogs.PanelSetting",
                                            viewData: {
                                                type: "savePva"
                                            },
                                            buttons: [{
                                                name: i18n("CANCEL"),
                                                isCloseButton: true,
                                                tooltip: i18n("CLICK PRESS CANCEL"),
                                                click: function() {
                                                    _self.panelSettingDialog.close();
                                                }
                                            }, {
                                                name: i18n("APPLY"),
                                                click: function() {
                                                    _self.loader.open();
                                                    var item = _self.panelSettingDialog.getInnerController().getFormData();
                                                    if (item) {
                                                        var items = [];
                                                        if (panels.length) {
                                                            panels.map(function(element) {
                                                                items.push(JSON.parse(JSON.stringify(item)));
                                                                items[items.length - 1].status = item.success ? 12 : 13;
                                                                items[items.length - 1].idPanel = element.id;
                                                            })
                                                        }
                                                        item.status = item.success ? 12 : 13;
                                                        item.idPanel = content.id;
                                                        Data.endpoints.dfg.panel.approvePVA.post({
                                                            item: items.length ? items : item
                                                        }).success(function(data) {
                                                            _self.loader.close();
                                                            _self.panelSettingDialog.close();
                                                            // _self.coreServices.renderAccordionFiles();
                                                            _self.saveLibraryOptions();
                                                            window.location = "/timp/tbd/";
                                                        });
                                                    } else {
                                                        _self.loader.close();
                                                    }
                                                },
                                                tooltip: i18n("CLICK PRESS CONFIRM")
                                            }]
                                        });
                                        _self.panelSettingDialog.open();
                                    } else {

                                    }
                                }
                            });
                        }
                    }
                }
            }
            if (_self.privileges[privilegesName].update && _self.coreServices.libraryOptions.renderType !== _self.renderType.digitalFile) {
                if (_self.coreServices.libraryOptions.renderType !== _self.renderType.PANEL) {
                    actions.push({
                        icon: _self.coreServices.icons.edit.icon,
                        iconFont: _self.coreServices.icons.edit.iconFont,
                        tooltip: i18n("EDIT TOOLTIP") + " " + i18n(_renderType.toUpperCase()),
                        text: i18n("LIBRARY EDIT"),
                        onPress: function() {
                            if (_self.coreServices.libraryOptions.renderType === _self.renderType.layout) {
                                _self.saveLibraryOptions();
                                window.location = "#/editor?id=" + content.idLayout + "&idVersion=" + content.id;
                            } else if (_self.coreServices.libraryOptions.renderType === _self.renderType.setting) {
                                _self.initializeDialog(undefined, false, content, 'isEditing');
                                _self.createDialog.open();
                            } else if (_self.coreServices.libraryOptions.renderType === _self.renderType.AN3) {
                                _self.initializeAN3Dialog("edit", content);
                                _self.createDialog.open();
                            } else if (_self.coreServices.libraryOptions.renderType === _self.renderType.AN4) {
                                _self.initializeAN4Dialog("edit", content);
                                _self.createDialog.open();
                            }
                        }
                    });
                }
            }
            if (_self.coreServices.libraryOptions.renderType === _self.renderType.digitalFile && _self.privileges.digitalFile.execute) {
                actions.push({
                    icon: _self.coreServices.icons.visualization.icon,
                    iconFont: _self.coreServices.icons.visualization.iconFont,
                    tooltip: i18n(_renderType.toUpperCase() + " VIEW TOOLTIP"),
                    text: i18n("LIBRARY DETAIL"),
                    onPress: function() {
                        _self.saveLibraryOptions();
                        window.location = "#/executor?executed=true&id=" + content.id;
                    }
                });
            }
            if (_self.coreServices.libraryOptions.renderType === _self.renderType.setting && _self.privileges.setting.execute) {
                actions.push({
                    icon: _self.coreServices.icons.execute.icon,
                    iconFont: _self.coreServices.icons.execute.iconFont,
                    tooltip: i18n("EXECUTE TOOLTIP") + " " + i18n(_renderType.toUpperCase()),
                    text: i18n("EXECUTE"),
                    onPress: function() {
                        _self.saveLibraryOptions();
                        window.location = "#/executor?id=" + content.id;
                    }
                });
            }
            if (_self.privileges.an3.execute && _self.coreServices.libraryOptions.renderType === _self.renderType.AN3) {
                actions.push({
                    icon: _self.coreServices.icons.execute.icon,
                    iconFont: _self.coreServices.icons.execute.iconFont,
                    tooltip: i18n("EXECUTE TOOLTIP") + " " + i18n(_renderType.toUpperCase()),
                    text: i18n("EXECUTE"),
                    onPress: function() {
                        _self.saveLibraryOptions();
                        window.location = "#/executoran3?id=" + content.id;
                    }
                });

            }
            if (_self.privileges.an4.execute && _self.coreServices.libraryOptions.renderType === _self.renderType.AN4) {
                actions.push({
                    icon: _self.coreServices.icons.execute.icon,
                    iconFont: _self.coreServices.icons.execute.iconFont,
                    tooltip: i18n("EXECUTE TOOLTIP") + " " + i18n(_renderType.toUpperCase()),
                    text: i18n("EXECUTE"),
                    onPress: function() {
                        _self.saveLibraryOptions();
                        if (content.digitalFile) {
                            window.location = "#/executoran4?executed=true&id=" + content.id;
                        } else {
                            window.location = "#/executoran4?id=" + content.id;
                        }
                    }
                });
            }
            if (_self.privileges[privilegesName].copy) {
                actions.push({
                    icon: _self.coreServices.icons.copy.icon,
                    iconFont: _self.coreServices.icons.copy.iconFont,
                    tooltip: i18n("COPY TOOLTIP") + " " + i18n(_renderType.toUpperCase()),
                    text: i18n('LIBRARY COPY'),
                    onPress: function() {
                        if (_self.coreServices.libraryOptions.renderType === _self.renderType.layout) {
                            _self.copyFiles(content.idLayout);
                        } else {
                            _self.copyFiles(content.id);
                        }

                    }
                });
            }
            if (_self.privileges[privilegesName].create && _self.coreServices.libraryOptions.renderType === _self.renderType.layout) {
                actions.push({
                    icon: _self.coreServices.icons.copy.icon,
                    iconFont: _self.coreServices.icons.copy.iconFont,
                    text: i18n('CREATE COPY'),
                    tooltip: i18n("COPY TOOLTIP") + " " + i18n(_renderType.toUpperCase()),
                    onPress: function() {
                        _self.copyFiles(content.idLayout);
                    }
                });
            }
            if (_self.privileges[privilegesName].trash && _self.coreServices.libraryOptions.renderType !== _self.renderType.digitalFile) {
                actions.push({
                    icon: _self.coreServices.icons.recycleBin.icon,
                    iconFont: _self.coreServices.icons.recycleBin.iconFont,
                    text: i18n("LIBRARY TRASH"),
                    tooltip: i18n("RECICLY BIN TOOLTIP"),
                    onPress: function() {
                        if (_self.coreServices.libraryOptions.renderType === _self.renderType.layout) {
                            _self.updateFiles([content.idLayout], 2, (content.length > 1) ? "DFG101021" : "DFG101022");
                        } else {
                            _self.updateFiles([content.id], 2, (content.length > 1) ? "DFG101021" : "DFG101022");
                        }

                    }
                });
            }
        }
        return actions;
    },
    saveLibraryOptions: function() {
        var _self = this;
        var folderSelected = _self.coreServices.libraryOptions ? _self.coreServices.libraryOptions.dataType[_self.coreServices.libraryOptions.renderType] :
            -1;

        var lastLibrarySettings = {
            renderType: _self.coreServices.libraryOptions.renderType,
            libraryOptions: _self.coreServices.libraryOptions,
            folderSelected: folderSelected,
            actualPage: _self.renderedTable.Table.pagination.ctrl.getActualPage()
        };
        lastLibrarySettings.spedType = _self.coreServices.spedType;
        lastLibrarySettings.spedSubType = _self.coreServices.spedSubType;
        lastLibrarySettings.orderBy = _self.coreServices.orderBy;
        if (_self._view.advancedFiltersCont && _self._view.advancedFiltersCont.ctrl) {
            lastLibrarySettings.filters = _self.coreServices.getValues();
        }
        localStorage.lastLibrarySettings = JSON.stringify(lastLibrarySettings);
    },
    renderTilesTable: function(tableData, pageCount, searchParams) {
        var _self = this;
        _self._view.tilesPagination.empty();
        _self._view.tilesPagination.bindBasePaginator({
            totalPages: pageCount,
            actualPage: searchParams.number,
            onPageChange: function(oldVal, newVal) {
                _self.actualPage = Number(newVal);
                searchParams.number = Number(newVal);
                _self.renderAccordionFiles(searchParams);
            }
        });
        if (tableData.length > 0) {
            $.each(tableData, function(index, element) {
                if (_self.coreServices.libraryOptions.renderType === _self.renderType.layout) {

                    _self.coreServices.tableBody[element.idLayout] = {};

                    _self.coreServices.tableBody[element.idLayout].favorite = (element.favorite && element.favorite.length && element.favorite[0].id !==
                        "undefined") ? true : false;
                    var currentTile = {
                        id: element.idLayout,
                        title: element.Layout.length > 0 ? element.Layout[0].name : "",
                        createdBy: (element.creationUser.length) ? element.creationUser[0].name + " " + element.creationUser[0].last_name : "",
                        modifiedBy: (element.modificationUser.length) ? element.modificationUser[0].name + " " + element.modificationUser[0].last_name : "",
                        lastChanged: parseDate(element.modificationDate),
                        icon: _self.coreServices.icons.tile.icon,
                        iconFont: _self.coreServices.icons.tile.iconFont,
                        background: "#FF9900",
                        isFavorite: element.favorite && element.favorite.length && element.favorite[0].id,
                        onFavorite: _self.coreServices.libraryOptions.dataType[_self.coreServices.libraryOptions.renderType].text === 'TRASH' ? function() {} : function() {
                            _self.coreServices.tableBody[element.idLayout].favorite = !_self.coreServices.tableBody[element.idLayout].favorite;
                            _self.updateFavorite(element, _self.coreServices.tableBody[element.idLayout].favorite);
                        },
                        buttons: _self.getActions(element),
                        check: {
                            id: "check-" + element.idLayout,
                            isChecked: false
                        }
                    };
                } else {
                    _self.coreServices.tableBody[element.id] = {};
                    _self.coreServices.tableBody[element.id].favorite = (element.favorite && element.favorite.length && element.favorite[0].id !==
                        "undefined") ? true : false;
                    var currentTile = {
                        id: element.id,
                        title: element.name,
                        createdBy: (element.creationUser.length) ? element.creationUser[0].name + " " + element.creationUser[0].last_name : "",
                        modifiedBy: (element.modificationUser.length) ? element.modificationUser[0].name + " " + element.modificationUser[0].last_name : "",
                        lastChanged: parseDate(element.modificationDate),
                        icon: _self.coreServices.icons.tile.icon,
                        iconFont: _self.coreServices.icons.tile.iconFont,
                        background: "#FF9900",
                        isFavorite: element.favorite && element.favorite.length && element.favorite[0].id,
                        onFavorite: _self.coreServices.libraryOptions.dataType[_self.coreServices.libraryOptions.renderType].text === 'TRASH' ? function() {} : function() {
                            _self.coreServices.tableBody[element.id].favorite = !_self.coreServices.tableBody[element.id].favorite;
                            _self.updateFavorite(element, _self.coreServices.tableBody[element.id].favorite);
                        },
                        buttons: _self.getActions(element),
                        check: {
                            id: "check-" + element.id,
                            isChecked: false
                        }
                    };
                }

                _self.libraryWrapper.bindBaseLibraryTile(currentTile);
            });
        } else {
            var _emptyDataDiv = $("<div></div>");
            _emptyDataDiv.addClass("library-no-data");
            _emptyDataDiv.html(i18n("NO RESULT"));

            $(".library-tile-container").empty();
            $(".library-tile-container").append(_emptyDataDiv);
        }
    },
    renderFilesTable: function(response, searchParams) {
        var _self = this;
        var tableData = response.list || [];
        var headers = [];
        var bodyData = [];
        _self.libraryWrapper.empty();
        var pushHeader = function(headers, text, sort, height) {
            headers.push({
                text: text,
                sort: (sort !== undefined) ? sort : true,
                width: (height !== undefined) ? height : "130px"
            });
        };
        switch (_self.coreServices.libraryOptions.renderType) {
            case "DIGITAL FILE":
                {
                    pushHeader(headers, i18n("ID"));
                    pushHeader(headers, i18n("TILE STATUS"), false);
                    pushHeader(headers, i18n("TILE LAYOUT NAME"));
                    pushHeader(headers, i18n("TILE DESCRIPTION"));
                    pushHeader(headers, i18n("TILE LAYOUT TYPE"));
                    pushHeader(headers, i18n("TILE COMPANY"));
                    pushHeader(headers, i18n("TILE UF"));
                    pushHeader(headers, i18n("TILE BRANCH"));
                    pushHeader(headers, i18n("TILE YEAR"));
                    pushHeader(headers, i18n("TILE MONTH"));
                    pushHeader(headers, i18n("TILE PERIOD"));
                    pushHeader(headers, i18n("TILE FILE USE"), false);
                    pushHeader(headers, i18n("TILE ORIGINAL FILE"), false);
                    pushHeader(headers, i18n("TILE SENT"), false);
                    pushHeader(headers, i18n("TILE RECTIFIED FILE"), false);
                    pushHeader(headers, i18n("TILE SENT FILE"), false);
                    pushHeader(headers, i18n('TILE CREATION BY'));
                    pushHeader(headers, i18n('TILE CREATION ON'));
                    pushHeader(headers, i18n('TILE MODIFIED BY'));
                    pushHeader(headers, i18n('TILE MODIFIED ON'));
                    pushHeader(headers, i18n("TILE DATE SENT"));
                    pushHeader(headers, i18n("TILE CONDITION"), false);
                    break;
                }
            case "LAYOUT":
                {
                    pushHeader(headers, i18n("ID"));
                    pushHeader(headers, i18n("VERSION"));
                    pushHeader(headers, i18n("TILE LAYOUT NAME"));
                    pushHeader(headers, i18n("TILE DESCRIPTION"));
                    pushHeader(headers, i18n("TILE LAYOUT TYPE"));
                    pushHeader(headers, i18n('TILE CREATION BY'));
                    pushHeader(headers, i18n('TILE CREATION ON'));
                    pushHeader(headers, i18n('TILE MODIFIED BY'));
                    pushHeader(headers, i18n('TILE MODIFIED ON'));
                    break;
                }
            case "SETTING":
                {
                    pushHeader(headers, i18n("ID"));
                    pushHeader(headers, i18n("TILE LAYOUT NAME"));
                    pushHeader(headers, i18n("TILE DESCRIPTION"));
                    pushHeader(headers, i18n("TILE LAYOUT TYPE"));
                    pushHeader(headers, i18n("TILE COMPANY"), false);
                    pushHeader(headers, i18n("TILE AREA"), false);
                    pushHeader(headers, i18n("TILE BRANCH"), false);
                    pushHeader(headers, i18n("TILE TAX"), false);
                    pushHeader(headers, i18n("TILE VALID FROM"), false);
                    pushHeader(headers, i18n("TILE VALID TO"), false);
                    pushHeader(headers, i18n('TILE CREATION BY'));
                    pushHeader(headers, i18n('TILE CREATION ON'));
                    pushHeader(headers, i18n('TILE MODIFIED BY'));
                    pushHeader(headers, i18n('TILE MODIFIED ON'));
                    break;
                }
            case "AN3":
                pushHeader(headers, i18n("ID"));
                pushHeader(headers, i18n("TILE LAYOUT NAME"));
                pushHeader(headers, i18n("TILE DESCRIPTION"));
                pushHeader(headers, i18n("TILE LAYOUT ORIGIN"));
                pushHeader(headers, i18n("FILE"));
                pushHeader(headers, i18n("TILE LAYOUT BFB"));
                pushHeader(headers, i18n("RULE"));
                pushHeader(headers, i18n('TILE CREATION BY'));
                pushHeader(headers, i18n('TILE CREATION ON'));
                pushHeader(headers, i18n('TILE MODIFIED BY'));
                pushHeader(headers, i18n('TILE MODIFIED ON'));
                break;
            case "AN4":
                {
                    pushHeader(headers, i18n("ID"));
                    pushHeader(headers, i18n("TILE LAYOUT NAME"));
                    pushHeader(headers, i18n("TILE DESCRIPTION"));
                    pushHeader(headers, i18n("TILE LAYOUT ORIGIN") + " " + i18n("REFERENCE"));
                    pushHeader(headers, i18n("TILE LAYOUT ORIGIN") + " " + i18n("COMPARISON"));
                    pushHeader(headers, i18n("FILE") + " " + i18n("REFERENCE"));
                    pushHeader(headers, i18n("FILE") + " " + i18n("COMPARISON"));
                    pushHeader(headers, i18n("TILE LAYOUT BFB") + " " + i18n("REFERENCE"));
                    pushHeader(headers, i18n("TILE LAYOUT BFB") + " " + i18n("COMPARISON"));
                    pushHeader(headers, i18n("RULE"));
                    pushHeader(headers, i18n('TILE CREATION BY'));
                    pushHeader(headers, i18n('TILE CREATION ON'));
                    pushHeader(headers, i18n('TILE MODIFIED BY'));
                    pushHeader(headers, i18n('TILE MODIFIED ON'));

                    break;
                }
            case "PANEL":
                {
                    if (_self.coreServices.libraryOptions.dataType[_self.coreServices.libraryOptions.renderType].text === "JUSTIFY") {
                        pushHeader(headers, i18n("ID"));
                        pushHeader(headers, i18n("JUSTIFICATION"));
                    } else if (_self.coreServices.libraryOptions.dataType[_self.coreServices.libraryOptions.renderType].text !== "SETTING") {
                        pushHeader(headers, i18n("ID"));
                        pushHeader(headers, i18n("TILE LAYOUT NAME"));
                        pushHeader(headers, i18n("TILE DESCRIPTION"));
                        pushHeader(headers, i18n("STATUS"));
                        pushHeader(headers, i18n("TILE LAYOUT TYPE"));
                        pushHeader(headers, i18n("TILE COMPANY"));
                        pushHeader(headers, i18n("TILE UF"));
                        pushHeader(headers, i18n("TILE BRANCH"));
                        pushHeader(headers, i18n("TILE YEAR"));
                        pushHeader(headers, i18n("TILE MONTH"));
                        pushHeader(headers, i18n("TILE PERIOD"));
                    } else if (_self.coreServices.libraryOptions.dataType[_self.coreServices.libraryOptions.renderType].text === "SETTING") {
                        pushHeader(headers, i18n("ID"));
                        pushHeader(headers, i18n("TILE SETTING TYPE"));
                        pushHeader(headers, i18n("DESCRIPTION"));
                        pushHeader(headers, i18n("LINK"));
                        pushHeader(headers, i18n("COMPONENT"));
                        pushHeader(headers, i18n("TILE TAX"));
                    }
                    break;
                }
            default:
                pushHeader(headers, i18n("ID"));
                    break;
        }

        if (_self.coreServices.libraryOptions.renderType === _self.renderType.AN3) {
            bodyData = _self.processAN3TableBody(tableData, _self.coreServices.libraryOptions.dataType[_self.coreServices.libraryOptions.renderType].text);
        } else if (_self.coreServices.libraryOptions.renderType === _self.renderType.AN4) {
            bodyData = _self.processAN4TableBody(tableData, _self.coreServices.libraryOptions.dataType[_self.coreServices.libraryOptions.renderType].text);
        } else {
            bodyData = _self.processTableBody(tableData, _self.coreServices.libraryOptions.dataType[_self.coreServices.libraryOptions.renderType].text);
        }
        _self.renderedTable = _self.libraryWrapper.bindBaseTable({
            hasActions: true,
            hasCheckboxes: true,
            hasExpand: true,
            hasFlags: true,
            hasPagination: true,
            hasShowHide: true,
            totalPages: response.pageCount,
            actualPage: searchParams ? searchParams.number || 1 : 1,
            sortData: _self.coreServices.orderBy,
            onSort: function(order) {
                var columns = [];
                switch (_self.coreServices.libraryOptions.renderType) {
                    case "DIGITAL FILE":
                        columns = [
                            ['id'],
                            ['name'],
                            ['description'],
                            ['type'],
                            ['idCompany'],
                            ['uf'],
                            ['idBranch'],
                            ['year'],
                            ['month'],
                            ['subperiod'],
                            ['creationUser'],
                            ['creationDate'],
                            ['modificationUser'],
                            ['modificationDate'],
                            ['dateSent']
                        ];
                        break;
                    case "LAYOUT":
                        columns = [
                            ['id'],
                            ['legalVersion'],
                            ['idDigitalFile'],
                            ['name'],
                            ['description'],
                            ['type'],
                            ['creationUser'],
                            ['creationDate'],
                            ['modificationUser'],
                            ['modificationDate']
                        ];
                        break;
                    case "SETTING":
                        columns = [
                            ['id'],
                            ['name'],
                            ['description'],
                            ['type'],
                            ['creationUser'],
                            ['creationDate'],
                            ['modificationUser'],
                            ['modificationDate']
                        ];
                        break;
                    case "AN4":
                        columns = [
                            ['id'],
                            ['name'],
                            ['description'],
                            ['idRule'],
                            ['creationUser'],
                            ['creationDate'],
                            ['modificationUser'],
                            ['modificationDate']
                        ];
                        break;
                    case "PANEL":
                        {
                            if (_self.coreServices.libraryOptions.dataType[_self.coreServices.libraryOptions.renderType].text !== "SETTING") {
                                columns = [
                                    ['id'],
                                    ['status'],
                                    ['an3.digitalFileTypeText.name'],
                                    ['an3.idCompany'],
                                    ['an3.uf'],
                                    ['an3.idBranch'],
                                    ['an3.year'],
                                    ['an3.month'],
                                    ['an3.subperiod']
                                ];
                            } else {
                                columns = [
                                    ['id'],
                                    ['status'],
                                    ['an3.digitalFileTypeText.name'],
                                    ['an3.idCompany'],
                                    ['an3.uf'],
                                    ['an3.idBranch'],
                                    ['an3.year'],
                                    ['an3.month'],
                                    ['an3.subperiod']
                                ];
                            }
                            break;
                            
                            
                        }
                        default: 
                        columns = [
                            ['id']
                        ];
                }
                var items = [];
                order.forEach(function(column) {
                    columns[column.header].forEach(function(item) {
                        if (item.field) {
                            item.field = (column.isAscendent ? '' : '-') + item.field;
                            items.push(item);
                        } else {
                            items.push((column.isAscendent ? '' : '-') + item);
                        }
                    });
                });
                _self.coreServices.orderBy = order;
                _self.order = items && items.length ? items : null;
                searchParams.order_by = _self.order;
                _self.renderAccordionFiles(searchParams);
            },
            onPageChange: function(oldVal, newVal) {
                _self.actualPage = Number(newVal);
                searchParams.number = Number(newVal);
                _self.renderAccordionFiles(searchParams);
            },
            flags: [{}, {}],
            headers: headers,
            body: bodyData
        });
    },
    processAN3TableBody: function(tableData, renderType) {
        var _self = this;
        var bodyData = [];
        tableData.forEach(function(element, index) {
            var currentLine = {};
            _self.coreServices.tableBody[element.id] = {};
            currentLine.actions = _self.getActions(element);
            currentLine.id = element.id;
            currentLine.content = [];
            var dateCreation = new Date(element.creationDate);
            var dateModification = new Date(element.modificationDate);
            if (renderType !== "TRASH") {
                if (element.favorite && element.favorite.length && element.favorite[0].id !== "undefined") {
                    _self.coreServices.tableBody[element.id].favorite = true;
                    currentLine.content.push({
                        iconFont: _self.coreServices.icons.favorite.iconFont,
                        icon: _self.coreServices.icons.favorite.icon,
                        color: "#1B425E",
                        onPress: function() {
                            _self.updateFavorite(element, !_self.coreServices.tableBody[element.id].favorite);
                        },
                        tooltip: i18n("UNSET FAVORITES")
                    });
                } else {
                    _self.coreServices.tableBody[element.id].favorite = false;
                    currentLine.content.push({
                        iconFont: _self.coreServices.icons.unmarkFavorite.iconFont,
                        icon: _self.coreServices.icons.unmarkFavorite.icon,
                        color: "#1B425E",
                        onPress: function() {
                            _self.updateFavorite(element, !_self.coreServices.tableBody[element.id].favorite);
                        },
                        tooltip: i18n("SET FAVORITES")
                    });
                }
                if (element.share && element.share.length && element.share[0].id !== "undefined") {
                    _self.coreServices.tableBody[element.id].fileStatus = "Shared";
                    currentLine.content.push({
                        iconFont: _self.coreServices.icons.shared.iconFont,
                        icon: _self.coreServices.icons.shared.icon,
                        color: "#1B425E",
                        tooltip: i18n("SHARED TITLE"),
                        onPress: function() {
                            if (_self.loggedUser.id === element.creationIdUser) {
                                _self.updateShare(element);
                            }
                        }
                    });
                } else if (element.status === "Public") {
                    _self.coreServices.tableBody[element.id].fileStatus = "Public";
                    currentLine.content.push({
                        iconFont: _self.coreServices.icons.public.iconFont,
                        icon: _self.coreServices.icons.public.icon,
                        color: "#1B425E",
                        tooltip: i18n("PUBLIC TITLE"),
                        onPress: function() {
                            if (_self.loggedUser.id === element.creationIdUser) {
                                _self.updateShare(element);
                            }
                        }
                    });
                } else {
                    _self.coreServices.tableBody[element.id].fileStatus = "Private";
                    currentLine.content.push({
                        iconFont: _self.coreServices.icons.my.iconFont,
                        icon: _self.coreServices.icons.my.icon,
                        color: "#1B425E",
                        tooltip: i18n("PRIVATE TITLE"),
                        onPress: function() {
                            if (_self.loggedUser.id === element.creationIdUser) {
                                _self.updateShare(element);
                            }
                        }
                    });
                }
            } else {
                currentLine.content.push({}, {});
            }
            currentLine.content.push(element.id);
            currentLine.content.push(element.name);
            currentLine.content.push(element.description ? element.description : "");
            currentLine.content.push(i18n(element.origin));
            if (element.origin === "DFG") {
                currentLine.content.push(element.digitalFileName ? element.digitalFileName : "");
            } else {
                currentLine.content.push(element.externalFileName ? element.externalFileName : "");
            }
            currentLine.content.push(element.bfbLayoutName ? element.bfbLayoutName : "");
            var rules = element.rule.map(function(r) {
                return "<li>" + r.name + "</li>";
            }).join("");
            currentLine.content.push(rules);
            currentLine.content.push(element.creationUser);
            currentLine.content.push(parseDate(dateCreation));
            currentLine.content.push(element.modificationUser);
            currentLine.content.push(parseDate(dateModification));
            bodyData.push(currentLine);
        });
        return bodyData;
    },
    processAN4TableBody: function(tableData, renderType) {
        var _self = this;
        var bodyData = [];
        tableData.forEach(function(element, index) {
            var currentLine = {};
            _self.coreServices.tableBody[element.id] = {};
            currentLine.actions = _self.getActions(element);
            currentLine.id = element.id;
            currentLine.content = [];
            var dateCreation = new Date(element.creationDate);
            var dateModification = new Date(element.modificationDate);
            if (renderType !== "TRASH") {
                if (element.favorite && element.favorite.length && element.favorite[0].id !== "undefined") {

                    _self.coreServices.tableBody[element.id].favorite = true;

                    currentLine.content.push({
                        iconFont: _self.coreServices.icons.favorite.iconFont,
                        icon: _self.coreServices.icons.favorite.icon,
                        color: "#1B425E",
                        onPress: function() {
                            _self.updateFavorite(element, !_self.coreServices.tableBody[element.id].favorite);

                        },
                        tooltip: i18n("UNSET FAVORITES")
                    });
                } else {
                    _self.coreServices.tableBody[element.id].favorite = false;
                    currentLine.content.push({
                        iconFont: _self.coreServices.icons.unmarkFavorite.iconFont,
                        icon: _self.coreServices.icons.unmarkFavorite.icon,
                        color: "#1B425E",
                        onPress: function() {
                            _self.updateFavorite(element, !_self.coreServices.tableBody[element.id].favorite);

                        },
                        tooltip: i18n("SET FAVORITES")
                    });
                }
                if (element.share && element.share.length && element.share[0].id !== "undefined") {

                    _self.coreServices.tableBody[element.id].fileStatus = "Shared";

                    currentLine.content.push({
                        iconFont: _self.coreServices.icons.shared.iconFont,
                        icon: _self.coreServices.icons.shared.icon,
                        color: "#1B425E",
                        tooltip: i18n("SHARED TITLE"),
                        onPress: function() {
                            if (_self.loggedUser.id === element.creationIdUser) {
                                _self.updateShare(element);
                            }
                        }
                    });
                } else if (element.status === "Public") {

                    _self.coreServices.tableBody[element.id].fileStatus = "Public";

                    currentLine.content.push({
                        iconFont: _self.coreServices.icons.public.iconFont,
                        icon: _self.coreServices.icons.public.icon,
                        color: "#1B425E",
                        tooltip: i18n("PUBLIC TITLE"),
                        onPress: function() {
                            if (_self.loggedUser.id === element.creationIdUser) {
                                _self.updateShare(element);
                            }
                        }
                    });
                } else {

                    _self.coreServices.tableBody[element.id].fileStatus = "Private";

                    currentLine.content.push({
                        iconFont: _self.coreServices.icons.my.iconFont,
                        icon: _self.coreServices.icons.my.icon,
                        color: "#1B425E",
                        tooltip: i18n("PRIVATE TITLE"),
                        onPress: function() {
                            if (_self.loggedUser.id === element.creationIdUser) {
                                _self.updateShare(element);
                            }
                        }
                    });
                }
            } else {
                currentLine.content.push({}, {});
            }
            currentLine.content.push(element.id);
            currentLine.content.push(element.name);
            currentLine.content.push(element.description ? element.description : "");
            currentLine.content.push(i18n(element.originReference === 1 ? "DFG" : "EXTERNAL"));
            currentLine.content.push(i18n(element.originComparison === 1 ? "DFG" : "EXTERNAL"));
            if (element.originReference === 1)
                currentLine.content.push(element.digitalFileNameReference ? element.digitalFileNameReference : "");
            else
                currentLine.content.push(element.externalFileNameReference ? element.externalFileNameReference : "");

            if (element.originComparison === 1)
                currentLine.content.push(element.digitalFileNameComparison ? element.digitalFileNameComparison : "");
            else
                currentLine.content.push(element.externalFileNameComparison ? element.externalFileNameComparison : "");
            currentLine.content.push(element.bfbLayoutNameReference ? element.bfbLayoutNameReference : "");
            currentLine.content.push(element.bfbLayoutNameComparison ? element.bfbLayoutNameComparison : "");
            var rules = element.rule.map(function(r) {
                return "<li>" + r.name + "</li>";
            }).join("");
            currentLine.content.push(rules);
            currentLine.content.push(element.creationUser);
            currentLine.content.push(parseDate(dateCreation));
            currentLine.content.push(element.modificationUser);
            currentLine.content.push(parseDate(dateModification));
            bodyData.push(currentLine);
        });
        return bodyData;
    },
    processTableBody: function(tableData, renderType) {
        var _self = this;
        var bodyData = [];
        tableData.forEach(function(element, index) {
            var currentLine = {};

            if (_self.coreServices.libraryOptions.renderType === _self.renderType.layout) {
                _self.coreServices.tableBody[element.idLayout] = {};
                currentLine.actions = _self.getActions(element);
                currentLine.id = element.idLayout;
            } else {
                _self.coreServices.tableBody[element.id] = {
                    elementData: element
                };
                currentLine.actions = _self.getActions(element);
                currentLine.id = element.id;
            }

            currentLine.content = [];
            var dateCreation = new Date(element.creationDate);
            var dateModification = new Date(element.modificationDate);
            if (renderType !== "TRASH") {
                if (element.favorite && element.favorite.length && element.favorite[0].id !== "undefined") {
                    if (_self.coreServices.libraryOptions.renderType === _self.renderType.layout) {
                        _self.coreServices.tableBody[element.idLayout].favorite = true;
                    } else {
                        _self.coreServices.tableBody[element.id].favorite = true;
                    }

                    currentLine.content.push({
                        iconFont: _self.coreServices.icons.favorite.iconFont,
                        icon: _self.coreServices.icons.favorite.icon,
                        color: "#1B425E",
                        onPress: function() {
                            if (_self.coreServices.libraryOptions.renderType === _self.renderType.layout) {
                                _self.updateFavorite(element, !_self.coreServices.tableBody[element.idLayout].favorite);
                            } else {
                                _self.updateFavorite(element, !_self.coreServices.tableBody[element.id].favorite);
                            }

                        },
                        tooltip: i18n("UNSET FAVORITES")
                    });
                } else {
                    if (_self.coreServices.libraryOptions.renderType === _self.renderType.layout) {
                        _self.coreServices.tableBody[element.idLayout].favorite = false;
                    } else {
                        _self.coreServices.tableBody[element.id].favorite = false;
                    }
                    currentLine.content.push({
                        iconFont: _self.coreServices.icons.unmarkFavorite.iconFont,
                        icon: _self.coreServices.icons.unmarkFavorite.icon,
                        color: "#1B425E",
                        onPress: function() {
                            if (_self.coreServices.libraryOptions.renderType === _self.renderType.layout) {
                                _self.updateFavorite(element, !_self.coreServices.tableBody[element.idLayout].favorite);
                            } else {
                                _self.updateFavorite(element, !_self.coreServices.tableBody[element.id].favorite);
                            }

                        },
                        tooltip: i18n("SET FAVORITES")
                    });
                }
                if (element.share && element.share.length && element.share[0].id !== "undefined") {
                    if (_self.coreServices.libraryOptions.renderType === _self.renderType.layout) {
                        _self.coreServices.tableBody[element.idLayout].fileStatus = "Shared";
                    } else {
                        _self.coreServices.tableBody[element.id].fileStatus = "Shared";
                    }
                    currentLine.content.push({
                        iconFont: _self.coreServices.icons.shared.iconFont,
                        icon: _self.coreServices.icons.shared.icon,
                        color: "#1B425E",
                        tooltip: i18n("SHARED TITLE"),
                        onPress: function() {
                            if (_self.loggedUser.id === element.creationUser[0].id) {
                                _self.updateShare(element);
                            }
                        }
                    });
                } else if (element.fileStatus === "Public") {
                    if (_self.coreServices.libraryOptions.renderType === _self.renderType.layout) {
                        _self.coreServices.tableBody[element.idLayout].fileStatus = "Public";
                    } else {
                        _self.coreServices.tableBody[element.id].fileStatus = "Public";
                    }
                    currentLine.content.push({
                        iconFont: _self.coreServices.icons.public.iconFont,
                        icon: _self.coreServices.icons.public.icon,
                        color: "#1B425E",
                        tooltip: i18n("PUBLIC TITLE"),
                        onPress: function() {
                            if (_self.loggedUser.id === element.creationUser[0].id) {
                                _self.updateShare(element);
                            }
                        }
                    });
                } else {
                    if (_self.coreServices.libraryOptions.renderType === _self.renderType.layout) {
                        _self.coreServices.tableBody[element.idLayout].fileStatus = "Private";
                    } else {
                        _self.coreServices.tableBody[element.id].fileStatus = "Private";
                    }

                    currentLine.content.push({
                        iconFont: _self.coreServices.icons.my.iconFont,
                        icon: _self.coreServices.icons.my.icon,
                        color: "#1B425E",
                        tooltip: i18n("PRIVATE TITLE"),
                        onPress: function() {
                            if (_self.loggedUser.id === element.creationUser[0].id) {
                                _self.updateShare(element);
                            }
                        }
                    });
                }
            } else {
                currentLine.content.push({}, {});
            }
            if (_self.coreServices.libraryOptions.renderType === _self.renderType.digitalFile) {
                if (_self.coreServices.libraryOptions.renderType === _self.renderType.layout) {
                    currentLine.content.push(element.idLayout);
                    _self.coreServices.tableBody[element.idLayout].status = element.status;
                } else {
                    currentLine.content.push(element.id);
                    _self.coreServices.tableBody[element.id].status = element.status;
                }

                switch (element.status) {
                    case "100":
                    case "200":
                        {
                            currentLine.content.push({
                                iconFont: _self.coreServices.icons.pending.iconFont,
                                icon: _self.coreServices.icons.pending.icon,
                                color: "yellow",
                                tooltip: i18n("NEW"),
                                isFlag: true
                            });
                            element.statusName = i18n("NEW");
                            break;
                        }
                    case "300":
                    case "400":
                        {
                            currentLine.content.push({
                                iconFont: _self.coreServices.icons.checkMark.iconFont,
                                icon: _self.coreServices.icons.checkMark.icon,
                                color: "green",
                                tooltip: i18n("STATUS COMPLETED"),
                                isFlag: true
                            });
                            element.statusName = i18n("STATUS COMPLETED");
                            break;
                        }
                    case "500":
                        {
                            currentLine.content.push({
                                iconFont: _self.coreServices.icons.error.iconFont,
                                icon: _self.coreServices.icons.error.icon,
                                color: "#D05050",
                                tooltip: i18n("ERROR"),
                                isFlag: true
                            });
                            element.statusName = i18n("ERROR");
                            break;
                        }
                    default:
                        {
                            currentLine.content.push("");
                        }
                }

                currentLine.content.push(element.name);
                // currentLine.content.push(element.statusName);
                currentLine.content.push(element.description ? element.description : "");
                currentLine.content.push((element.type) ? element.type.name : "");
                currentLine.content.push(element.idCompany);
                currentLine.content.push(element.uf);
                currentLine.content.push(element.idBranch);
                currentLine.content.push(element.year);
                if (element.months) {
                    currentLine.content.push(JSON.parse(element.months).join(","));
                } else {
                    currentLine.content.push(element.month);
                }
                currentLine.content.push(element.subperiod);
                currentLine.content.push((element.originalFile) ? i18n("RECTIFIED") : i18n("ORIGINAL"));
                currentLine.content.push({
                    iconFont: _self.coreServices.icons.tile.iconFont,
                    icon: _self.coreServices.icons.tile.icon,
                    tooltip: i18n("TILE ORIGINAL FILE"),
                    isFlag: true,
                    onPress: function() {
                        _self.exportDigitalFile(element.id);
                    }
                });
                currentLine.content.push((element.status === 400) ? i18n("YES") : i18n("NO"));
                if (element.originalFile) {
                    currentLine.content.push({
                        iconFont: _self.coreServices.icons.tile.iconFont,
                        icon: _self.coreServices.icons.tile.icon,
                        tooltip: i18n("TILE RECTIFIED FILE"),
                        isFlag: true,
                        onPress: function() {
                            _self.exportDigitalFile(element.originalFile);
                        }
                    });
                } else {
                    currentLine.content.push("");
                }
                if (element.rectifier) {
                    currentLine.content.push({
                        iconFont: _self.coreServices.icons.tile.iconFont,
                        icon: _self.coreServices.icons.tile.icon,
                        tooltip: i18n("TILE SENT FILE"),
                        isFlag: true,
                        onPress: function() {
                            _self.exportDigitalFile(element.rectifier);
                        }
                    });
                } else {
                    currentLine.content.push("");
                }
                currentLine.content.push((element.creationUser.length) ? element.creationUser[0].name + " " + element.creationUser[0].last_name : "");
                currentLine.content.push(parseDate(element.creationDate));
                currentLine.content.push((element.modificationUser.length) ? element.modificationUser[0].name + " " + element.modificationUser[0].last_name :
                    "");
                currentLine.content.push(parseDate(element.modificationDate));
                if (element.dateSent) {
                    currentLine.content.push(parseDate(element.dateSent));
                } else {
                    currentLine.content.push("");
                }
                currentLine.content.push((element.status === "300" || element.status === "400") ? i18n("OFFICIAL") : i18n("NOT OFFICIAL"));
            }
            if (_self.coreServices.libraryOptions.renderType === _self.renderType.layout) {
                currentLine.content.push(element.idLayout);
                currentLine.content.push(element.version);
                currentLine.content.push(element.Layout[0].name);
                currentLine.content.push(element.Layout[0].description ? element.Layout[0].description : "");
                currentLine.content.push(element.type ? element.type.name : "");
                currentLine.content.push((element.creationUser.length) ? element.creationUser[0].name + " " + element.creationUser[0].last_name : "");
                currentLine.content.push(parseDate(element.creationDate));
                currentLine.content.push((element.modificationUser.length) ? element.modificationUser[0].name + " " + element.modificationUser[0].last_name :
                    "");
                currentLine.content.push(parseDate(element.modificationDate));
            }
            if (_self.coreServices.libraryOptions.renderType === _self.renderType.setting) {
                var eefiSettings = _self.getEEFIConfiguration(element);
                currentLine.content.push(element.id);
                currentLine.content.push(element.name);
                currentLine.content.push(element.description ? element.description : "");
                currentLine.content.push(element.type ? element.type.name : "");
                currentLine.content.push(eefiSettings.company);
                currentLine.content.push(eefiSettings.states);
                currentLine.content.push(eefiSettings.branches);
                currentLine.content.push(eefiSettings.taxes);
                currentLine.content.push((element.version[0].validFrom) ? parseDate(element.version[0].validFrom) : "");
                currentLine.content.push((element.version[0].validTo) ? parseDate(element.version[0].validTo) : "");
                currentLine.content.push((element.creationUser.length) ? element.creationUser[0].name + " " + element.creationUser[0].last_name : "");
                currentLine.content.push(parseDate(element.creationDate));
                currentLine.content.push((element.modificationUser.length) ? element.modificationUser[0].name + " " + element.modificationUser[0].last_name :
                    "");
                currentLine.content.push(parseDate(element.modificationDate));
            }
            if (_self.coreServices.libraryOptions.renderType === _self.renderType.AN4) {
                currentLine.content.push(element.id);
                currentLine.content.push(element.name);
                currentLine.content.push(element.description);
                currentLine.content.push(element.rule.name);
                currentLine.content.push(element.leftFile.name);
                currentLine.content.push(element.rightFile.name);
                currentLine.content.push((element.creationUser.length) ? element.creationUser[0].name + " " + element.creationUser[0].last_name : "");
                currentLine.content.push(parseDate(element.creationDate));
                currentLine.content.push((element.modificationUser.length) ? element.modificationUser[0].name + " " + element.modificationUser[0].last_name :
                    "");
                currentLine.content.push(parseDate(element.modificationDate));
            }
            if (_self.coreServices.libraryOptions.renderType === _self.renderType.PANEL) {
                if (_self.coreServices.libraryOptions.dataType[_self.coreServices.libraryOptions.renderType].text === "JUSTIFY") {
                    currentLine.content.push(element.id);
                    currentLine.content.push(element.justify);
                } else if (_self.coreServices.libraryOptions.dataType[_self.coreServices.libraryOptions.renderType].text !== "SETTING") {
                    currentLine.content.push(element.id);
                    currentLine.content.push(element.report.length ? element.report[0].name : "");
                    currentLine.content.push(element.report.length ? element.report[0].description : "");
                    currentLine.content.push(element.statusText.length ? element.statusText[0].name : "");
                    currentLine.content.push((element.digitalFileTypeText && element.digitalFileTypeText.name) ? element.digitalFileTypeText.name : "");
                    currentLine.content.push(element.AN3[0].idCompany);
                    currentLine.content.push(element.AN3[0].uf);
                    currentLine.content.push(element.AN3[0].idBranch);
                    currentLine.content.push(element.AN3[0].year);
                    if (element.AN3[0].months) {
                        currentLine.content.push(JSON.parse(element.AN3[0].months).join(","));
                    } else {
                        currentLine.content.push(element.AN3[0].month);
                    }
                    currentLine.content.push(element.AN3[0].subperiod);
                } else if (_self.coreServices.libraryOptions.dataType[_self.coreServices.libraryOptions.renderType].text === "SETTING") {
                    currentLine.content.push(element.id);
                    currentLine.content.push(element.digitalFileType.length ? element.digitalFileType[0].name : "");
                    currentLine.content.push(element.description);
                    currentLine.content.push(element.link);
                    currentLine.content.push(element.origin);
                    currentLine.content.push(JSON.parse(element.idTax).map(function(element) {
                        return "<li>" + element + "</li>";
                    }).join(""));
                }
            }

            bodyData.push(currentLine);
        });
        return bodyData;
    },
    bindAdvanceFilters: function(renderType, filters) {
        var _self = this;
        _self._view.advancedFiltersCont.empty();
        _self._view.advancedFiltersCont.ctrl = _self._view.advancedFiltersCont.bindAdvancedFilters({
            type: renderType,
            filterOptions: _self.coreServices.filterOptions,
            filters: filters
        });

    },
    updateFavorite: function(elements, mark) {

        var _self = this;
        var parameters = {};

        if (elements.id) {
            parameters.ids = [{
                id: elements.idLayout || elements.id,
                status: !mark
            }];
        } else {
            parameters.ids = elements;
            //          for (var i = 0; i < elements.length; i++) {
            //              parameters.idObject.push(elements[i]);
            //          }
        }
        var favorites = 0;
        Data.endpoints.dfg[_self.coreServices.libraryOptions.renderType.toCamelCase()].setFavorite.post(
            parameters).success(function(response) {
            var length = parameters.ids.length;
            for (var index = 0; index < length; index++) {
                var favoriteIcon = [];
                if (_self.coreServices.libraryOptions.displayType === "LIST") {
                    favoriteIcon = _self.libraryWrapper.find(".base-table .tbody .tr[data-id=" + parameters.ids[index].id + "] .icon-font-Performance");
                } else {
                    favoriteIcon = _self.libraryWrapper.find(".library-tile[id='" + parameters.ids[index].id + "'] .favorite .icon-font-Performance");
                }
                if (!parameters.ids[index].status) {
                    favoriteIcon.removeClass("icon-starline").addClass("icon-star");
                } else {
                    favoriteIcon.removeClass('icon-star').addClass("icon-starline");
                }
                _self.coreServices.tableBody[parameters.ids[index].id].favorite = !parameters.ids[index].status;
                if (parameters.ids[index].status) {
                    favorites--;
                } else {
                    favorites++;
                }
            }
            if (!parameters.ids[index]) {
                $.baseToast({
                    text: (parameters.ids.length === 1) ? i18n("DFG101002") : i18n("DFG101003"),
                    isSuccess: true
                });
                _self.coreServices.updateFileCount(
                    _self.coreServices.libraryOptions.renderType.toCamelCase(), {
                        favorite: true
                    }, favorites
                );
            } else {
                $.baseToast({
                    text: (parameters.ids.length > 1) ? i18n("DFG101009") : i18n("DFG101010"),
                    isSuccess: true
                });
                if (_self.coreServices.libraryOptions.dataType[_self.coreServices.libraryOptions.renderType].text === "FAVORITE") {
                    var data = {
                        searchParams: {},
                        counter: true
                    };
                    _self.coreServices.renderAccordionFiles(data);
                }
                _self.coreServices.updateFileCount(
                    _self.coreServices.libraryOptions.renderType.toCamelCase(), {
                        favorite: true
                    }, favorites
                );
            }

            //          _self.coreServices.libraryOptions.dataType[_self.coreServices.libraryOptions.renderType].text = "FAVORITE";
            _self.coreServices.renderAccordionFiles({
                counter: true
            });
        }).error(function() {
            $.baseToast({
                text: i18n("DFG101001"),
                isError: true
            });
        });
    },
    updateShare: function(element) {
        var _self = this;
        var renderType = _self.coreServices.libraryOptions.renderType;

        var shareBuilder = $.baseShareBuilder({
            idObject: (renderType === "LAYOUT") ? element.idLayout : element.id,
            objectType: (renderType !== "AN4" && renderType !== "AN3") ? "DFG::" + renderType.toUpperCamelCase() : "DFG::" + renderType,
            onApply: function(status) {
                var searchParams = {};
                if (_self.coreServices.libraryOptions.dataType[renderType].text === "FOLDER") {
                    searchParams.idFolder = _self.coreServices.libraryOptions.dataType[renderType].idFolder;
                    searchParams.number = _self.actualPage;
                }
                if (renderType === "AN3" && status == "Public") {
                    if (element.setting && element.setting.idSetting) {
                        Data.endpoints.fileSystem.updateFileStatus.post({
                            "idObject": element.setting.idSetting,
                            "status": 4,
                            "objectType": "DFG::Setting"
                        }).success(function(_data) {});
                    }
                    if (element.layoutVersion && element.layoutVersion.idLayout) {
                        Data.endpoints.fileSystem.updateFileStatus.post({
                            "idObject": element.layoutVersion.idLayout,
                            "status": 4,
                            "objectType": "DFG::Layout"
                        }).success(function(_data) {});
                    }
                    if (element.idDigitalFile) {
                        Data.endpoints.fileSystem.updateFileStatus.post({
                            "idObject": element.idDigitalFile,
                            "status": 4,
                            "objectType": "DFG::DigitalFile"
                        }).success(function(_data) {});
                    }
                }
                searchParams.counter = true;
                _self.coreServices.renderAccordionFiles(searchParams);
            }
        });
        shareBuilder.open();
    },
    copyFiles: function(elements) {
        var _self = this;
        _self.initializeDialog(elements);
        _self.createDialog.open();
        // Data.endpoints.dfg[_self.coreServices.libraryOptions.renderType.toCamelCase()].copy.post({
        //  idObject: elements
        // }).success(function(response){
        //  _self.coreServices.libraryOptions.dataType[_self.coreServices.libraryOptions.renderType].text = "FOLDER";
        //  _self.coreServices.libraryOptions.dataType[_self.coreServices.libraryOptions.renderType].idFolder = -1;
        //  _self.coreServices.renderAccordionFiles({
        //      idFolder: -1
        //  });
        //  $.baseToast({
        //      text: (elements.length === 1) ? i18n("DFG101015") : i18n("DFG101016"),
        //      isSuccess: true
        //  });
        // });
    },
    updateFiles: function(elements, status, code) {
        var _self = this;
        Data.endpoints.dfg[_self.coreServices.libraryOptions.renderType.toCamelCase()].updateFile.post({
            idObject: elements,
            status: status
        }).success(function(response) {
            var searchParams = {};
            if (_self.coreServices.libraryOptions.dataType[_self.coreServices.libraryOptions.renderType].text === "FOLDER") {
                searchParams.idFolder = _self.coreServices.libraryOptions.dataType[_self.coreServices.libraryOptions.renderType].idFolder;
            }
            searchParams.counter = true;
            _self.coreServices.renderAccordionFiles(searchParams);
            $.baseToast({
                text: i18n(code),
                isSuccess: true
            });
        });
    },
    getEEFIConfiguration: function(setting, processType) {
        var _self = this;
        var companies = [];
        var states = [];
        var branches = [];
        var taxes = [];
        for (var i = 0; i < setting.EEFI.length; i++) {
            if (companies.indexOf(setting.EEFI[i].idCompany) === -1) {
                companies.push(setting.EEFI[i].idCompany);
            }
            if (states.indexOf(setting.EEFI[i].uf) === -1) {
                states.push(setting.EEFI[i].uf);
            }
            if (branches.indexOf(setting.EEFI[i].idBranch) === -1) {
                branches.push(setting.EEFI[i].idBranch);
            }
            if (taxes.indexOf(setting.EEFI[i].idTax) === -1) {
                taxes.push(setting.EEFI[i].idTax);
            }
        }
        if (processType === "array") {
            response = {
                company: companies,
                states: states,
                branches: branches,
                taxes: taxes
            };
            return response;
        }
        var response = {};
        response.company = companies.map(function(element) {
            return "<li>" + element + "</li>";
        }).join("");
        response.states = states.map(function(element) {
            return "<li>" + element + "</li>";
        }).join("");
        response.branches = branches.map(function(element) {
            return "<li>" + element + "</li>";
        }).join("");
        response.taxes = taxes.map(function(element) {
            return "<li>" + element + "</li>";
        }).join("");
        return response;
    },
    showInformation: function(element) {
        var _self = this;
        if (_self.loadingData) {
            $.baseToast(i18n('LOADING DATA'));
            return;
        }
        var fillSectionData = function(informationPanelData, name, content) {
            var section = {};
            section.name = name;
            section.content = [];
            for (var index = 0; index < content.length; index++) {
                section.content.push({
                    name: content[index]
                });
            }
            informationPanelData.sections.push(section);
            return informationPanelData;
        };
        $('#info-content').empty();
        _self.loadingData = true;
        _self.loader.open();
        var creationDate = new Date(element.creationDate);
        var modificationDate = new Date(element.modificationDate);
        var informationPanelData = {};
        informationPanelData.id = element.id;
        informationPanelData.name = element.name;
        informationPanelData.history = [{
            modificationUser: (_.isArray(element.modificationUser) && element.modificationUser.length) ? element.modificationUser[0].name + " " + element.modificationUser[0].last_name : (_.isString(element.modificationUser) ? element.modificationUser : ""),
            modificationDate: {
                date: modificationDate.getDate(),
                month: modificationDate.getMonth() + 1,
                year: modificationDate.getFullYear()
            },
            creationUser: (_.isArray(element.creationUser) && element.creationUser.length) ? element.creationUser[0].name + " " + element.creationUser[0].last_name : (_.isString(element.creationUser) ? element.creationUser : ""),
            creationDate: {
                date: creationDate.getDate(),
                month: creationDate.getMonth() + 1,
                year: creationDate.getFullYear()
            }
        }];
        informationPanelData.sections = [];
        informationPanelData = fillSectionData(informationPanelData, i18n("TILE DESCRIPTION"), [element.description ? element.description : ""]);
        if (_self.coreServices.libraryOptions.renderType !== _self.renderType.AN4) {
            informationPanelData = fillSectionData(informationPanelData, i18n("TILE LAYOUT TYPE"), [element.type ? element.type.name : ""]);
        }
        switch (_self.coreServices.libraryOptions.renderType) {
            case _self.renderType.digitalFile:
                {
                    informationPanelData = fillSectionData(informationPanelData, i18n("TILE COMPANY"), [element.idCompany]);
                    informationPanelData = fillSectionData(informationPanelData, i18n("TILE UF"), [element.uf]);
                    informationPanelData = fillSectionData(informationPanelData, i18n("TILE BRANCH"), [element.idBranch]);
                    informationPanelData = fillSectionData(informationPanelData, i18n("TILE CONDITION"), [(element.status === "300" || element.status ===
                        "400") ? i18n("OFFICIAL") : i18n("NOT OFFICIAL")]);
                    break;
                }
            case _self.renderType.layout:
                {
                    break;
                }
            case _self.renderType.setting:
                {
                    var eefiConfiguration = _self.getEEFIConfiguration(element, "array");
                    informationPanelData = fillSectionData(informationPanelData, i18n("TILE COMPANY"), eefiConfiguration.company);
                    informationPanelData = fillSectionData(informationPanelData, i18n("TILE UF"), eefiConfiguration.states);
                    informationPanelData = fillSectionData(informationPanelData, i18n("TILE BRANCH"), eefiConfiguration.branches);
                    informationPanelData = fillSectionData(informationPanelData, i18n("TILE TAX"), eefiConfiguration.taxes);
                    break;
                }
            case _self.renderType.AN4:
                {
                    informationPanelData = fillSectionData(informationPanelData, i18n("RULE"), [element.rule.name]);
                    informationPanelData = fillSectionData(informationPanelData, i18n("TILE DIGITAL FILES"), [element.digitalFileNameReference || element
                        .externalFileNameReference, element.digitalFileNameComparison || element.externalFileNameComparison
                    ]);
                    break;
                }
            case _self.renderType.SPED:
                {
                    if (_self.coreServices.spedType >= 6) {
                        informationPanelData.sections = [];
                        informationPanelData = fillSectionData(informationPanelData, i18n("TILE PROCESS NUMBER"), [element.processNumber ? element.processNumber : "--"]);
                        informationPanelData = fillSectionData(informationPanelData, i18n("TILE PROCESS TYPE"), [element.processTypeValue && element.processTypeValue.name ? element.processTypeValue.name : "--"]);
                        informationPanelData = fillSectionData(informationPanelData, i18n("TILE PROCESS CLASS"), [element.processClassValue && element.processClassValue.name ? element.processClassValue.name : "--"]);
                    }
                    break;
                }
        }
        $(".main-content .main-inner").bindBaseInformationPanel(informationPanelData);
        _self.loader.close();
        _self.loadingData = false;
    },
    clearAdvancedFilters: function() {
        var _self = this;

        if (_self._view.search.input.ctrl) {
            _self._view.search.input.ctrl.setText("", true);
        }
        if (_self._view.advancedFiltersCont && _self._view.advancedFiltersCont.ctrl) {
            _self._view.advancedFiltersCont.ctrl.cleanFilters();
        }
    },
    getSelectedItems: function() {
        var _self = this;
        var elementId = [];
        if (_self.coreServices.libraryOptions.displayType === "LIST") {
            var tableBody = $(".base-table .tbody").find("input");
            for (var i = 0; i < tableBody.length; i++) {
                var element = parseInt(tableBody[i].getAttribute("data-id"), 10);
                if (tableBody[i].checked) {
                    elementId.push(element);
                }
            }
        } else {
            $("#libraryview .library-tile").each(function(index, element) {
                if ($(element).find("input").prop("checked")) {
                    elementId.push($(this).closest(".library-tile").attr("id"));
                }
            });
        }
        return elementId;
    },
    exportDigitalFile: function(id) {
        var _self = this;
        if (_self.privileges.digitalFile.export) {
            _self.dialogExport = $.baseDialog({
                title: i18n('EXPORT FILE'),
                modal: true,
                size: 'medium',
                outerClick: 'disabled',
                viewName: "app.views.dialogs.exportArquivo",
                viewData: {},
                buttons: [{
                    name: i18n('CANCEL'),
                    isCloseButton: true
                }, {
                    name: i18n('EXPORT'),
                    click: function() {
                        Data.endpoints.dfg.digitalFile.export.post({
                            id: id
                        }).success(function(response) {
                            response.digitalFile = JSON.parse(response.digitalFile);
                            response.json = JSON.parse(response.json);
                            _self.downloadDigitalFile(_self.dialogExport.getInnerController().getSelection(), response);
                        });
                        _self.dialogExport.close();
                    }
                }]
            });
            _self.dialogExport.open();
        } else {
            $.baseToast({
                text: i18n("DFG101006"),
                isError: true
            });
        }
    },
    downloadDigitalFile: function(option, response) {
        var _self = this;
        var downloadFile = function(fileName, urlData) {
            var aLink = document.createElement("a");
            var evt = document.createEvent("HTMLEvents");
            evt.initEvent("click");
            aLink.download = fileName;
            aLink.href = urlData;
            aLink.dispatchEvent(evt);
        };
        if (option === "text") {
            var blob = new Blob([response.digitalFile.rawFile.replace(
                /&&::\d+&:\d+/g,
                "")], {
                type: 'data:text/csv;charset=UTF-8,'
            });
            saveAs(blob, "digitalFile.txt");

        } else {
            if (option === "xml") {
                downloadFile("digitalFile.xml", "data:text/csv;charset=UTF-8," + encodeURIComponent(response.json, response.digitalFile.rawFile.replace(
                    /&&::\d+&:\d+/g, "")));
            } else {
                var BOM = '\uFEFF';
                var dataBlob = BOM += _self.toCSV(_self.coreServices.allVersionData.layout.json, _self.coreServices.executionFileData.rawFile.replace(
                    /&&::\d+&:\d+/g, ""));

                var blob = new Blob([dataBlob], {
                    type: 'text/plain;charset=utf-8'
                });
                saveAs(blob, 'digitalFile.xls');
            }
        }
    },
    toXML: function(json, rawFile) {
        var xml = '<?xml version="1.0" ?>\r\n\t<rawfile>';
        json = JSON.parse(json);
        var records = rawFile.match(/[^\r\n]+/g);

        var separator = json.separator.value;

        if (separator === "") {
            separator = ";";
        }

        for (var i = 0; i < records.length; i++) {
            xml = xml + "\r\n\t\t<record id='" + (i + 1) + "'>";
            var x = records[i].split('&&::');
            var fields = x[0].split(separator);
            if (json.separator.inFirst) {
                fields.splice(0, 1);
            }
            if (json.separator.inLast) {
                fields.splice(fields.length - 1, 1);
            }

            var br = x[1].split('&:');
            var positions = json.blocks[br[0]].records[br[1]].positions;
            for (var j = 0; j < fields.length; j++) {
                var tag = "";
                if (positions[j] === "recordId") {
                    tag = positions[j];
                } else {
                    tag = json.fields[positions[j]].hanaName;
                    tag = tag.replace(new RegExp(" ", "g"), "_");
                }
                xml = xml + "\r\n\t\t\t<" + tag + ">" + fields[j] + "</" + tag + ">";
            }

            xml = xml + "\r\n\t\t</record>";
        }
        xml = xml + '\r\n\t</rawfile>';
        return xml;
    },
    toCSV: function(json, rawfile) {
        if (typeof json === "string") {
            json = JSON.parse(json);
        }
        var separator = json.separator.value;

        var CSV = "\"sep=|\"\n";
        var data = rawfile.split(String.fromCharCode(8204) + separator);
        var values;
        for (var i = 0; i < data.length; i++) {
            if (data[i].indexOf("\r\n") > -1) {
                values = data[i].split("\r\n");
                for (var j = 0; j < values.length; j++) {
                    if (!isNaN(Number(values[j]))) {
                        values[j] = "=\"" + values[j] + "\"|";
                    } else {
                        values[j] = "\"" + values[j] + "\"|";
                    }

                }
                CSV += values.join("\r\n");
            } else {
                if (!isNaN(Number(data[i]))) {
                    CSV += "=\"" + data[i] + "\"|";
                } else {
                    CSV += "\"" + data[i] + "\"|";
                }

            }
        }

        return CSV;
    },
    initializeDialog: function(idCopy, isExibition, content, operation) { //This needs refactoring urgently (just copy pasted it temporarily) I will comeback to fix you I promise!!!
        var _self = this;
        var viewData = {
            type: _self.coreServices.libraryOptions.renderType.toLowerCase(),
            copyFrom: idCopy,
            view: true
        };
        var title = i18n("CREATE " + _self.coreServices.libraryOptions.renderType);
        var confirmButton = i18n("CREATE");
        if (isExibition) {
            viewData.isExibition = true;
            viewData.fromLibrary = true;
            title = i18n("LIBRARY DETAIL");
            confirmButton = i18n('SAVE');
        }
        if (content && operation) {
            viewData.content = content;
            viewData.operation = operation;
            title = (operation === 'isEditing') ? i18n("UPDATE") : title;
            confirmButton = (operation === 'isEditing') ? i18n("UPDATE") : confirmButton;
        }
        _self.createDialog = $.baseDialog({
            title: title,
            modal: true,
            size: "big",
            disableOuterClick: true,
            cssClass: "newFile",
            viewName: "app.views.dialogs.NewFile",
            viewData: viewData,
            buttons: [{
                name: i18n("CANCEL"),
                isCloseButton: true,
                tooltip: i18n("CLICK PRESS CANCEL"),
                click: function() {
                    if (!_self.coreServices.loadingData)
                        _self.createDialog.close();
                }
            }, {
                name: i18n('SAVE BUTTON'),
                click: function() {
                    if (viewData.fromLibrary || (content && operation === 'isViewing')) {
                        _self.createDialog.close();
                        return;
                    } else if (content && operation === 'isEditing') {
                        if (viewData.type === 'setting') {
                            _self.loader.open();

                            _self.createDialog.getInnerController().updateHeaderData();
                            _self.coreServices._updatedSetting.name = _self.coreServices.layoutObject.name;
                            _self.coreServices._updatedSetting.description = _self.coreServices.layoutObject.description;

                            Data.endpoints.dfg.setting.updateSettingData.post(_self.coreServices._updatedSetting).success(function(data) {
                                _self.loader.close();
                                _self.createDialog.close();

                                _self.coreServices.libraryOptions.dataType[_self.coreServices.libraryOptions.renderType].text = "FOLDER";
                                _self.coreServices.renderAccordionFiles({
                                    idFolder: _self.coreServices.folders[_self.coreServices.libraryOptions.renderType].currentId
                                });

                                return;
                            });
                        }
                    }

                    var dialogData = _self.coreServices.getData();
                    if (dialogData) {
                        _self.coreServices._dataNewFile.idFolder = _self.coreServices.folders[_self.coreServices.libraryOptions.renderType].currentId;
                        if (_self.coreServices._dataNewFile.idCopy) {
                            _self.coreServices._dataNewFile.idObject = [_self.coreServices._dataNewFile.idCopy];
                            delete _self.coreServices._dataNewFile.idCopy;
                        }
                        if (!_self.coreServices.loadingData) {
                            _self.coreServices.loadingData = true;
                            _self.loader.open();
                            var action = _self.coreServices._dataNewFile.idObject ? "copy" : "create";
                            if (isExibition) {
                                action = "update";
                                _self.createDialog.getInnerController().updateHeaderData();
                                _self.coreServices._dataNewFile = _self.prepareLayoutObject();
                            }
                            Data.endpoints.dfg[_self.coreServices.libraryOptions.renderType.toCamelCase()][action].post(_self.coreServices._dataNewFile).success(
                                function(data) {
                                    _self.coreServices.loadingData = false;
                                    _self.createDialog.close();
                                    _self.loader.close();
                                    if (_self.coreServices.libraryOptions.renderType === _self.renderType.layout && !isExibition) {
                                        _self.saveLibraryOptions();
                                        window.location = "#/editor?id=" + data.id;
                                    } else {
                                        _self.coreServices.libraryOptions.dataType[_self.coreServices.libraryOptions.renderType].text = "FOLDER";
                                        _self.coreServices.renderAccordionFiles({
                                            idFolder: _self.coreServices.folders[_self.coreServices.libraryOptions.renderType].currentId
                                        });
                                    }
                                    if (isExibition) {
                                        $.baseToast({
                                            text: i18n("DFG1010022"),
                                            isSuccess: true
                                        });
                                    } else {
                                        $.baseToast({
                                            text: i18n("DFG209010"),
                                            isSuccess: true
                                        });
                                    }
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
    },
    initializeDialogXML: function() {
        var _self = this;
        var viewData = {
            type: _self.coreServices.libraryOptions.renderType.toLowerCase(),
            view: true
        };
        var title = i18n("CREATE") + i18n(_self.coreServices.libraryOptions.renderType);
        var confirmButton = i18n("CREATE");
        _self.createDialog = $.baseDialog({
            title: title,
            modal: true,
            size: "big",
            disableOuterClick: true,
            cssClass: "newFile",
            viewName: "app.views.xmlEditor.NewFile",
            viewData: viewData,
            buttons: [{
                name: i18n("CANCEL"),
                isCloseButton: true,
                tooltip: i18n("CLICK PRESS CANCEL"),
                click: function() {
                    if (!_self.coreServices.loadingData)
                        _self.createDialog.close();
                }
            }, {
                name: confirmButton,
                click: function() {

                    var dialogData = _self.coreServices.getData();
                    if (dialogData) {
                        _self.coreServices.loadingData = false;
                        _self.createDialog.close();
                        _self.loader.close();
                    }
                    var params = {
                        fileName: dialogData.name,
                        description: (dialogData.description !== undefined) ? dialogData.description : "",
                        schemaZipID: dialogData.zipVersion.key,
                        schemaFileID: dialogData.schemaFileID.key,
                        idStructureGroup: dialogData.structureGroup,
                        structuresID: JSON.stringify(dialogData.structure),
                        companiesID: JSON.stringify(dialogData.company),
                        ufsID: JSON.stringify(dialogData.state),
                        branchesID: JSON.stringify(dialogData.branch),
                        idTax: dialogData.tax
                    }
                    Data.endpoints.dfg.xmlFile.createDigitalFile.post(params).success(function(data) {
                        _self.saveLibraryOptions();
                        window.location = "#/xmlEditor?id=" + data.id;
                    }).error(function(error) {

                    })
                },
                tooltip: i18n("CLICK PRESS CONFIRM")
            }]
        });
    },
    getLayoutObject: function(idLayout, callback) {
        var _self = this;
        Data.endpoints.dfg.layout.read.post({
            id: idLayout,
            idVersion: undefined,
            structure: true
        }).success(function(serviceData) {
            _self.coreServices.layoutObject = serviceData;
            callback();
        }).error(function(response) {
            if (response == "unauthorized") {
                window.location = '/timp/login/';
            } else {
                $.baseToast({
                    text: response,
                    isError: true
                });
            }
        });
    },
    prepareLayoutObject: function() {
        var _self = this;
        var _dataSend = {
            json: _self.coreServices.layoutObject.json,
            id: _self.coreServices.layoutObject.id,
            name: _self.coreServices.layoutObject.name,
            description: _self.coreServices.layoutObject.description,
            idVersion: _self.coreServices.layoutObject.internalVersion[0].id,
            internalVersion: _self.coreServices.layoutObject.internalVersion,
            legalVersion: _self.coreServices.layoutObject.legalVersion
        };
        return _dataSend;
    },
    renderTableXML: function(data) {
        var _self = this;
        var headers = [];
        var bodyData = [];
        _self.libraryWrapper.empty();
        var pushHeader = function(headers, text, sort, height) {
            headers.push({
                text: text,
                sort: (sort !== undefined) ? sort : true,
                width: (height !== undefined) ? height : "130px"
            });
        };
        data.map(function(val, index) {
            var actions = [];
            //          if (_self.privileges.xml.read) {
            //              actions.push({
            //                  iconFont: "Sign-and-Symbols",
            //                  icon: "info-52",
            //                  text: i18n('INFO'),
            //                  onPress: function() {
            //                      controller._showInfoPanel(file.id);
            //                  }
            //              });
            //          }
            if (_self.privileges.xml.update) {
                actions.push({
                    iconFont: "Finance-and-Office",
                    icon: "floppydisc",
                    text: i18n('EXECUTE'),
                    onPress: function() {
                        var params = {
                            id: val.id
                        }
                        Data.endpoints.dfg.xmlFile.getFileByID.post(params).success(function(data) {
                            _self.saveLibraryOptions();
                            window.location = "#/xmlEditor?id=" + val.id;
                        }).error(function(error) {
                            $.baseToast({
                                text: error,
                                isError: true
                            });
                        });
                    }
                });
            }
            if (_self.privileges.xml.execute) {
                actions.push({
                    iconFont: "Media",
                    icon: "play",
                    text: i18n('EXECUTE'),
                    onPress: function() {
                        var params = {
                            id: val.id
                        }
                        Data.endpoints.dfg.xmlFile.getFileByID.post(params).success(function(data) {
                            //if (data[0].schemaFileID === undefined || data[0].schemaFileID === null) {
                            //window.location = "#/xmlEditor?id=" + val.id;
                            //}
                        }).error(function(error) {
                            $.baseToast({
                                text: error,
                                isError: true
                            });
                        });
                    }
                });
            }

            var modificationDate = (val.modificationDate !== undefined && val.modificationDate !== null) ? parseDate(val.modificationDate) : "";
            var creationDate = (val.creationDate !== undefined && val.creationDate !== null) ? parseDate(val.creationDate) : "";

            var branches = (val.branchesID !== null && val.branchesID !== undefined) ? JSON.parse(val.branchesID) : [];
            branches = branches.map(function(element) {
                return "<li>" + element.substr(6) + "</li>";
            }).join("");
            var companies = (val.companiesID !== undefined && val.companiesID !== null) ? JSON.parse(val.companiesID) : [],
                companies = companies.map(function(element) {
                    return "<li>" + element + "</li>";
                }).join("");
            var ufs = (val.ufsID !== undefined && val.ufsID !== null) ? JSON.parse(val.ufsID) : [],
                ufs = ufs.map(function(element) {
                    return "<li>" + element + "</li>";
                }).join("");
            bodyData.push({
                id: val.id,
                actions: actions,
                content: [
                    val.id,
                    val.fileName,
                    val.description,
                    val.zip.length > 0 ? val.zip[0].fileName : "",
                    val.zip.length > 0 ? val.zip[0].fileVersion : "",
                    companies,
                    ufs,
                    branches,
                    val.tributo.length > 0 ? val.tributo[0].descrCodTributoLabel : "",
                    val.creationUser,
                    creationDate,
                    val.modificationUser,
                    modificationDate
                ]
            });
        });
        pushHeader(headers, i18n("ID"));
        pushHeader(headers, i18n("TILE LAYOUT NAME"));
        pushHeader(headers, i18n("TILE DESCRIPTION"));
        pushHeader(headers, i18n("TILE ZIP"));
        pushHeader(headers, i18n("TILE ZIP VERSION"));
        pushHeader(headers, i18n("TILE COMPANY"));
        pushHeader(headers, i18n("TILE UF"));
        pushHeader(headers, i18n("TILE BRANCH"));
        pushHeader(headers, i18n("TILE TAX"));
        pushHeader(headers, i18n('TILE CREATION BY'));
        pushHeader(headers, i18n('TILE CREATION ON'));
        pushHeader(headers, i18n('TILE MODIFIED BY'));
        pushHeader(headers, i18n('TILE MODIFIED ON'));
        _self.renderedTable = _self.libraryWrapper.bindBaseTable({
            hasActions: true,
            hasCheckboxes: true,
            hasShowHide: true,
            hasExpand: true,
            headers: headers,
            body: bodyData
        });
    },
    //SPED LIBRARY --KBara
    getSPEDData: function(data) {
        var _self = this;
        let endpoint = 'spedFile';
        if (data.type >= 6) {
            endpoint = 'eSocial';
        }
        /*
            data: {
                type,
                subType
                status,
                searchKeys,
                layoutData,
                getFiltersData,
                number,
                counter
            }
        */
        //type can be 1,2,3,4,5,6
        //subType can be spedFile, calculationBlocks, updatedStructures, executions
        //status is 1,2,3
        _self.loader.open();
        Data.endpoints.dfg.sped.list[endpoint].post(data).success(function(response) {
            _self.coreServices.spedFilters = response.filters;
            _self.coreServices.spedCounter = response.counter;
            _self.renderSPEDTable(response, data.subType);
            if (response.counter) {
                _self.coreServices.updateSPEDCount(response.counter);
            }
            _self.loader.close();
        }).error(function() {
            if (data.type >= 6 && _self.privileges.sped.eSocialRead === false) {
                $.baseToast({
                    type: "e",
                    text: i18n("NO READ PRIVILEGE FOR") + ' ' + 'e-Social'
                });
            }
            _self.coreServices.spedFilters = [];
            _self.coreServices.spedCounter = 1;
            _self.renderSPEDTable({
                list: []
            });
            _self.loader.close();
        });
    },
    renderSPEDTable: function(response, subType) {
        var _self = this;
        var headers = [];
        var bodyData = [];
        if (!_self.actualPage) {
            _self.actualPage = 1;
        }
        _self.libraryWrapper.empty();
        var pushHeader = function(headers, text, sort, height) {
            headers.push({
                text: text,
                sort: (sort !== undefined) ? sort : true,
                width: (height !== undefined) ? height : "130px"
            });
        };
        var companiesList,
            ufsList,
            branchesList,
            taxesList;
        var companies,
            ufs,
            branches,
            taxes;
        var modificationDate, creationDate;
        var canEdit = false;
        var canExecute = false;
        var canExport = false;
        switch (_self.coreServices.spedType) {
            case 1:
                canEdit = _self.privileges.sped.updateEFDICMSIPI;
                canExecute = _self.privileges.sped.executeEFDICMSIPI;
                canExport = _self.privileges.sped.exportEFDICMSIPI;
                break;
            case 2:
                canEdit = _self.privileges.sped.updateEFDContributions;
                canExecute = _self.privileges.sped.executeEFDContributions;
                canExport = _self.privileges.sped.exportEFDContributions;
                break;
            case 3:
                canEdit = _self.privileges.sped.updateECD;
                canExecute = _self.privileges.sped.executeECD;
                canExport = _self.privileges.sped.exportECD;
                break;
            case 4:
                canEdit = _self.privileges.sped.updateECF;
                canExecute = _self.privileges.sped.executeECF;
                canExport = _self.privileges.sped.exportECF;
                break;
            case 5:
                canEdit = _self.privileges.sped.updateSCANC;
                canExecute = _self.privileges.sped.executeSCANC;
                canExport = _self.privileges.sped.exportSCANC;
                break;
            case 6:
                canEdit = false;
                canExecute = false;
                canExport = _self.privileges.sped.eSocialExport;
                break;
        }
        response.list.map(function(val) {
            var actions = [];
            actions.push({
                iconFont: "Sign-and-Symbols",
                icon: "info-52",
                text: i18n("INFORMATION"),
                onPress: function() {
                    _self.showInformation(val);
                }
            });
            if (canEdit) {
                actions.push({
                    iconFont: "Formatting-and-Tool",
                    icon: "pensil",
                    text: i18n('EDIT'),
                    onPress: function() {
                        _self.initializeSPEDDialog("edit", val);
                        _self.createDialog.open();
                    }
                });
            }
            if (canExecute) {
                actions.push({
                    iconFont: "Media",
                    icon: "play",
                    text: i18n("EXECUTE"),
                    onPress: function() {
                        _self.saveLibraryOptions();
                        if (_self.coreServices.spedType !== 5) {
                            if (subType === "spedFile") {
                                window.location = "#/executorSPED?id=" + val.id;
                            } else if (subType === "calculationBlocks") {
                                window.location = "#/executorSPED?id=" + val.id + "&calculationBlocks=true";
                            }
                        } else {
                            if (subType === "spedFile") {
                                window.location = "#/executorSCANC?id=" + val.id;
                            }
                        }
                    }
                });
            }
            if (canExport) {
                actions.push({
                    iconFont: "DataManager",
                    icon: "download",
                    text: _self.coreServices.spedType >= 6 ? i18n('EXPORT XML') : i18n("EXPORT FILES"),
                    onPress: function() {
                        if (_self.coreServices.spedType >= 6) {
                            window.location = '#/executorSPED?id=' + val.id + '&eSocial=' + _self.coreServices.spedType + '&eSocialType=' + _self.coreServices.spedSubType;
                            return;
                        }
                        Data.endpoints.dfg.sped.getReportFilesSPED.post({
                            idSped: val.id,
                            page: 1
                        }).success(function(data) {
                            if (data.files.length) {
                                var dialog = $.baseDialog({
                                    title: i18n("EXPORT FILE"),
                                    modal: true,
                                    size: "wide",
                                    disableOuterClick: true,
                                    cssClass: "exportFile",
                                    viewName: "app.views.library.sped.exportFiles",
                                    viewData: {
                                        files: data.files,
                                        filterOptions: data.filterOptions,
                                        pageCount: data.pageCount,
                                        id: val.id
                                    },
                                    buttons: [{
                                        name: i18n("CLOSE"),
                                        isCloseButton: true,
                                        tooltip: i18n("CLICK PRESS CLOSE"),
                                        click: function() {
                                            dialog.close();
                                        }
                                    }]
                                });
                                dialog.open();
                            } else {
                                $.baseToast({
                                    type: "w",
                                    text: i18n("NO FILES TO DOWNLOAD")
                                });
                            }
                        });
                    }
                });
            }
            if (subType === "calculationBlocks") {
                actions.push({
                    iconFont: "Support-Help",
                    icon: "Ticketinprogress2",
                    text: i18n("STRUCTURE UPDATES STATUS"),
                    onPress: function() {
                        Data.endpoints.dfg.sped.getSpedExecutions.post({
                            idSped: val.id,
                            page: 1,
                            filterOptions: true
                        }).success(function(data) {
                            if (data.files.length) {
                                var filterOptions = data.filterOptions;
                                var company = [];
                                var branch = [];
                                var uf = [];
                                for (var c in allTaxApp.coreData.organizationalPrivileges) {
                                    if (company.indexOf(c) === -1) {
                                        company.push(c);
                                    }
                                    allTaxApp.coreData.organizationalPrivileges[c].branches.map(function(b) {
                                        if (branch.indexOf(b.id) === -1) {
                                            branch.push(b.id);
                                        }
                                        if (uf.indexOf(b.state) === -1) {
                                            uf.push(b.state);
                                        }
                                    });
                                }
                                filterOptions.company = company.map(function(c) {
                                    return {
                                        id: c,
                                        name: c
                                    };
                                });
                                filterOptions.branch = branch.map(function(b) {
                                    return {
                                        id: b,
                                        name: b
                                    };
                                });
                                filterOptions.uf = uf.map(function(u) {
                                    return {
                                        id: u,
                                        name: u
                                    };
                                });
                                filterOptions.status = [{
                                    "id": 1,
                                    "name": i18n("IN PROCESS")
                                }, {
                                    "id": 2,
                                    "name": i18n("COMPLETED")
                                }, {
                                    "id": 3,
                                    "name": i18n("ERROR")
                                }];
                                var dialog = $.baseDialog({
                                    title: i18n("STRUCTURE UPDATES STATUS"),
                                    modal: true,
                                    size: "wide",
                                    disableOuterClick: true,
                                    cssClass: "exportFile",
                                    viewName: "app.views.library.sped.exportFiles",
                                    viewData: {
                                        files: data.files,
                                        pageCount: data.pageCount,
                                        filterOptions: filterOptions,
                                        isJob: true,
                                        id: val.id
                                    },
                                    buttons: [{
                                        name: i18n("CLOSE"),
                                        isCloseButton: true,
                                        tooltip: i18n("CLICK PRESS CLOSE"),
                                        click: function() {
                                            dialog.close();
                                        }
                                    }]
                                });
                                dialog.open();
                            } else {
                                $.baseToast({
                                    type: "w",
                                    text: i18n("NO STRUCTURE UPDATES")
                                });
                            }
                        });
                    }
                });
            }
            if (_.isNaN(Number(_self.coreServices.spedType)) || _self.coreServices.spedType < 6) {
                actions.push({
                    iconFont: "Sign-and-Symbols",
                    icon: "magnifierplus",
                    text: i18n('VISUALIZE'),
                    onPress: function() {
                        _self.initializeSPEDDialog("visualize", val);
                        _self.createDialog.open();
                    }
                });
            }
            let content = [];
            modificationDate = (val.modificationDate !== undefined && val.modificationDate !== null) ? parseDate(val.modificationDate) : "";
            creationDate = (val.creationDate !== undefined && val.creationDate !== null) ? parseDate(val.creationDate) : "";
            if (_self.coreServices.spedType < 6) {
                companiesList = "";
                ufsList = "";
                branchesList = "";
                taxesList = "";
                companies = [];
                ufs = [];
                branches = [];
                taxes = [];
                val.EEFI.map(function(eefi) {
                    if (companies.indexOf(eefi.idCompany) === -1) {
                        companies.push(eefi.idCompany);
                        companiesList += "<li>" + eefi.idCompany + "</li> ";
                    }
                    if (ufs.indexOf(eefi.uf) === -1) {
                        ufs.push(eefi.uf);
                        ufsList += "<li>" + eefi.uf + "</li> ";
                    }
                    if (branches.indexOf(eefi.idBranch) === -1) {
                        branches.push(eefi.idBranch);
                        branchesList += "<li>" + eefi.idBranch + "</li> ";
                    }
                    if (taxes.indexOf(eefi.idTax) === -1) {
                        taxes.push(eefi.idTax);
                        taxesList += "<li>" + eefi.taxName + "</li> ";
                    }
                });
                content = [
                    val.id,
                    val.name,
                    val.description,
                    val.type,
                    "",
                    "",
                    "",
                    companiesList,
                    ufsList,
                    branchesList,
                    taxesList,
                    (val.validFrom) ? parseDate(val.validFrom) : "",
                    (val.validTo) ? parseDate(val.validTo) : "",
                    val.creationUserData && val.creationUserData[0] ? val.creationUserData[0].name + " " + val.creationUserData[0].last_name :
                    "",
                    creationDate,
                    val.modificationUserData && val.modificationUserData[0] ? val.modificationUserData[0].name + " " + val.modificationUserData[
                        0].last_name : "",
                    modificationDate
                ];
            } else {
                content = [
                    val.id,
                    val.processNumber || '--',
                    val.processTypeValue.name || '--',
                    val.processClassValue.name || '--',
                    val.companies,
                    val.uf,
                    _.map(val.branches, function(branch) {
                        return branch.split('_')[2] || branch;
                    }),
                    val.checked ? i18n('SEND') : i18n('NO SEND'),
                    val.checked ? parseDate(val.checked.date) : '--'
                ];
            }
            bodyData.push({
                actions: actions,
                id: val.id,
                content: content
            });
        });
        if (_self.coreServices.spedType < 6) {
            pushHeader(headers, "ID");
            pushHeader(headers, i18n("TILE LAYOUT NAME"));
            pushHeader(headers, i18n("TILE DESCRIPTION"));
            pushHeader(headers, i18n("TILE LAYOUT TYPE"));
            pushHeader(headers, i18n("TILE STATUS"));
            pushHeader(headers, i18n("TILE DATE SENT"), false);
            pushHeader(headers, i18n("TILE RECTIFIER"), false);
            pushHeader(headers, i18n("TILE COMPANY"), false);
            pushHeader(headers, i18n("TILE AREA"), false);
            pushHeader(headers, i18n("TILE BRANCH"), false);
            pushHeader(headers, i18n("TILE TAX"), false);
            pushHeader(headers, i18n("TILE VALID FROM"));
            pushHeader(headers, i18n("TILE VALID TO"));
            pushHeader(headers, i18n('TILE CREATION BY'));
            pushHeader(headers, i18n('TILE CREATION ON'));
            pushHeader(headers, i18n('TILE MODIFIED BY'));
            pushHeader(headers, i18n('TILE MODIFIED ON'));
        } else {
            pushHeader(headers, "ID");
            pushHeader(headers, i18n("TILE PROCESS NUMBER"));
            pushHeader(headers, i18n("TILE PROCESS TYPE"));
            pushHeader(headers, i18n("TILE PROCESS CLASS"));
            pushHeader(headers, i18n("TILE COMPANY"), false);
            pushHeader(headers, i18n("TILE AREA"), false);
            pushHeader(headers, i18n("TILE BRANCH"), false);
            pushHeader(headers, i18n("TILE STATUS"));
            pushHeader(headers, i18n("TILE DATE SENT"), false);
        }
        _self.renderedTable = _self.libraryWrapper.bindBaseTable({
            hasActions: true,
            hasShowHide: true,
            hasCheckboxes: true,
            hasExpand: true,
            hasPagination: true,
            sortData: _self.orderBy,
            onSort: function(order) {
                var columns = (_self.coreServices.spedType < 6) ? [
                    ['id'],
                    ['name'],
                    ['description'],
                    ['type'],
                    ['status'],
                    ['validFrom'],
                    ['validTo'],
                    ['creationUser'],
                    ['creationDate'],
                    ['modificationUser'],
                    ['modificationDate']
                ] : [
                    ['id'],
                    ['processNumber'],
                    ['processTypeValue'],
                    ['processClassValue'],
                    ['checked'],
                    ['date']
                ];
                var items = [];
                order.forEach(function(column) {
                    columns[column.header].forEach(function(item) {
                        if (item.field) {
                            item.field = (column.isAscendent ? '' : '-') + item.field;
                            items.push(item);
                        } else {
                            items.push((column.isAscendent ? '' : '-') + item);
                        }
                    });
                });
                _self.orderBy = order;
                _self.order = items && items.length ? items : null;
                _self.coreServices.orderBy = _self.order;
                var data = {
                    type: _self.coreServices.spedType,
                    subType: _self.coreServices.spedSubType,
                    status: 1,
                    order_by: _self.coreServices.orderBy,
                    searchParams: _self.coreServices.getValues !== undefined ? _self.coreServices.getValues() : undefined,
                    getFiltersData: _self.coreServices.spedFilters !== undefined ? false : true,
                    counter: _self.coreServices.spedCounter !== undefined ? false : true
                };
                _self.coreServices.getSPEDData(data);
            },
            totalPages: response.pageCount,
            actualPage: _self.actualPage,
            onPageChange: function(oldVal, newVal) {
                _self.actualPage = Number(newVal);
                var data = {
                    type: _self.coreServices.spedType,
                    subType: subType,
                    status: 1,
                    getFiltersData: _self.coreServices.spedFilters !== undefined ? false : true,
                    counter: _self.coreServices.spedCounter !== undefined ? false : true
                };
                if (_self.coreServices.libraryOptions.displayType === "LIST") {
                    data.number = Number(newVal);
                }
                if (_self.coreServices.searchKeysSPED) {
                    data.searchKeys = _self.coreServices.searchKeysSPED;
                }
                _self.getSPEDData(data);
            },
            headers: headers,
            body: bodyData
        });
    },
    initializeSPEDDialog: function(mode, item) {
        var _self = this;
        var type = "";
        switch (_self.coreServices.spedType) {
            case 1:
                type = "EFD ICMS / IPI";
                break;
            case 2:
                type = "EFD " + i18n("CONTRIBUTIONS");
                break;
            case 3:
                type = "ECD";
                break;
            case 4:
                type = "ECF";
                break;
            case 5:
                type = "REINF";
                break;
        }
        var title = i18n("CREATE");

        var confirmButton = i18n("CREATE");
        var buttons = [{
            name: i18n("CANCEL"),
            isCloseButton: true,
            tooltip: i18n("CLICK PRESS CANCEL"),
            click: function() {
                if (!_self.coreServices.loadingData)
                    _self.createDialog.close();
            }
        }, {
            name: i18n("SAVE BUTTON"),
            click: function() {
                var innerCtrl = _self.createDialog.getInnerController();
                if (innerCtrl.validateCreateData()) {
                    var element = innerCtrl.getCreateData()
                    _self.loader.open();
                    Data.endpoints.dfg.sped.create.post(element).success(function(data) {
                        var data = {
                            type: _self.coreServices.spedType,
                            subType: "spedFile",
                            status: 1,
                            getFiltersData: _self.coreServices.spedFilters !== undefined ? false : true,
                            counter: true
                        };
                        if (_self.coreServices.libraryOptions.displayType === "LIST") {
                            data.number = 1;
                        }
                        _self.loader.close();
                        _self.coreServices.updateSPEDCounter(_self.coreServices.spedType, 1);
                        _self.coreServices.getSPEDData(data);
                        $.baseToast({
                            isSuccess: true,
                            text: i18n("SUCCESS CREATING SPED")
                        });
                    }).error(function(error) {
                        console.log(error)
                        _self.loader.close();

                    });
                    _self.createDialog.close();
                } else {
                    $.baseToast({
                        type: "w",
                        text: i18n("FILL ALL FIELDS")
                    });
                }
            },
            tooltip: i18n("CLICK PRESS CONFIRM")
        }];

        if (mode) {
            if (mode === "visualize") {
                title = i18n("VISUALIZE");
                buttons = [{
                    name: i18n("CLOSE"),
                    isCloseButton: true,
                    tooltip: i18n("CLICK PRESS CLOSE"),
                }];
            } else {
                title = i18n("EDIT");
                buttons = [{
                    name: i18n("CLOSE"),
                    isCloseButton: true,
                    tooltip: i18n("CLICK PRESS CLOSE"),
                }, {
                    name: i18n("EDIT"),
                    click: function() {
                        var innerCtrl = _self.createDialog.getInnerController();
                        if (innerCtrl.validateCreateData()) {
                            var element = innerCtrl.getEditData();
                            element.id = item.id;
                            _self.loader.open();
                            Data.endpoints.dfg.sped.update.post(element).success(function(data) {
                                var data = {
                                    type: _self.coreServices.spedType,
                                    subType: "spedFile",
                                    status: 1,
                                    getFiltersData: _self.coreServices.spedFilters !== undefined ? false : true,
                                    counter: true
                                };
                                if (_self.coreServices.libraryOptions.displayType === "LIST") {
                                    data.number = 1;
                                }
                                _self.loader.close();
                                _self.coreServices.getSPEDData(data);
                                $.baseToast({
                                    isSuccess: true,
                                    text: i18n("SUCCESS EDITING SPED")
                                });
                            }).error(function(error) {

                                _self.loader.close();

                            });
                            _self.createDialog.close();
                        } else {
                            $.baseToast({
                                type: "w",
                                text: i18n("FILL ALL FIELDS")
                            });
                        }
                    }
                }];
            }

        }
        title += " " + type;
        _self.createDialog = $.baseDialog({
            title: title,
            modal: true,
            size: "big",
            disableOuterClick: true,
            cssClass: "newFile",
            viewName: "app.views.library.sped.createDialog",
            viewData: {
                type: _self.coreServices.spedType,
                subType: type,
                mode: mode,
                item: item
            },
            buttons: buttons
        });
    },
    initializeAN3Dialog: function(mode, item) {
        var _self = this;

        var title = i18n("CREATE AN3");

        var confirmButton = i18n("CREATE");
        var buttons = [{
            name: i18n("CANCEL"),
            isCloseButton: true,
            tooltip: i18n("CLICK PRESS CANCEL"),
            click: function() {
                if (!_self.coreServices.loadingData)
                    _self.createDialog.close();
            }
        }, {
            name: confirmButton,
            click: function() {
                var innerCtrl = _self.createDialog.getInnerController();
                if (innerCtrl.validate()) {
                    var element = innerCtrl.getAN3Data();
                    _self.loader.open();
                    element.idFolder = _self.coreServices.folders[_self.coreServices.libraryOptions.renderType].currentId;

                    if (element.externalFileName != undefined && element.externalFileName != "") {
                        try {
                            var file = element.file;
                            var fileReader = new FileReader();
                            fileReader.onload = function() {
                                element.externalFile = fileReader.result;
                                Data.endpoints.dfg.an3.create.post(element).success(function(data) {
                                    _self.loader.close();
                                    _self.coreServices.libraryOptions.dataType[_self.coreServices.libraryOptions.renderType].text = "FOLDER";
                                    _self.coreServices.renderAccordionFiles({
                                        idFolder: _self.coreServices.folders[_self.coreServices.libraryOptions.renderType].currentId
                                    });

                                    return;
                                }).error(function(error) {
                                    console.log(error)
                                    _self.loader.close();

                                });
                            };
                            fileReader.readAsText(file)
                        } catch (e) {
                            _self.loader.close();
                            $.baseToast({
                                isError: true,
                                text: i18n("ERROR UPLOADING FILE")
                            });

                        }
                    } else {
                        Data.endpoints.dfg.an3.create.post(element).success(function(data) {
                            _self.loader.close();
                            _self.coreServices.libraryOptions.dataType[_self.coreServices.libraryOptions.renderType].text = "FOLDER";
                            _self.coreServices.renderAccordionFiles({
                                idFolder: _self.coreServices.folders[_self.coreServices.libraryOptions.renderType].currentId
                            });

                            return;
                        }).error(function(error) {
                            console.log(error)
                            _self.loader.close();

                        });
                    }

                    _self.createDialog.close();
                } else {
                    $.baseToast({
                        type: "w",
                        text: i18n("FILL ALL FIELDS")
                    });
                }
            },
            tooltip: i18n("CLICK PRESS CONFIRM")
        }];

        if (mode) {
            if (mode === "visualize") {
                title = i18n("VISUALIZE");
                buttons = [{
                    name: i18n("CLOSE"),
                    isCloseButton: true,
                    tooltip: i18n("CLICK PRESS CLOSE"),
                }];
            } else {
                title = i18n("EDIT");
                buttons = [{
                    name: i18n("CLOSE"),
                    isCloseButton: true,
                    tooltip: i18n("CLICK PRESS CLOSE"),
                }, {
                    name: i18n("EDIT"),
                    click: function() {
                        var innerCtrl = _self.createDialog.getInnerController();
                        if (innerCtrl.validate()) {
                            var element = innerCtrl.getEditData();
                            element.id = item.id;
                            _self.loader.open();
                            Data.endpoints.dfg.an3.update.post(element).success(function(data) {

                                _self.loader.close();
                                _self.coreServices.libraryOptions.dataType[_self.coreServices.libraryOptions.renderType].text = "FOLDER";
                                _self.coreServices.renderAccordionFiles({
                                    idFolder: _self.coreServices.folders[_self.coreServices.libraryOptions.renderType].currentId
                                });
                                $.baseToast({
                                    isSuccess: true,
                                    text: i18n("SUCCESS EDITING AN3")
                                });
                            }).error(function(error) {

                                _self.loader.close();

                            });
                            _self.createDialog.close();
                        } else {
                            $.baseToast({
                                type: "w",
                                text: i18n("FILL ALL FIELDS")
                            });
                        }
                    }
                }];
            }

        }
        _self.createDialog = $.baseDialog({
            title: title,
            modal: true,
            size: "big",
            disableOuterClick: true,
            cssClass: "newFile",
            viewName: "app.views.library.an3.createDialog",
            viewData: {
                mode: mode,
                item: item
            },
            buttons: buttons
        });
    },
    initializeAN4Dialog: function(mode, item) {
        var _self = this;

        var title = i18n("CREATE AN4");

        var confirmButton = i18n("CREATE");
        var buttons = [{
            name: i18n("CANCEL"),
            isCloseButton: true,
            tooltip: i18n("CLICK PRESS CANCEL"),
            click: function() {
                if (!_self.coreServices.loadingData)
                    _self.createDialog.close();
            }
        }, {
            name: confirmButton,
            click: function() {
                var innerCtrl = _self.createDialog.getInnerController();
                if (innerCtrl.validate()) {
                    var element = innerCtrl.getAN4Data();
                    _self.loader.open();
                    element.idFolder = _self.coreServices.folders[_self.coreServices.libraryOptions.renderType].currentId;

                    if (element.externalFileNameReference != "" || element.externalFileNameComparison != "") {
                        try {
                            var fileReference = element.fileReference;
                            var fileComparison = element.fileComparison;
                            var fileReader1 = new FileReader();
                            var fileReader2 = new FileReader();
                            if (fileReference && !fileComparison) {
                                fileReader1.onload = function() {
                                    element.externalFileReference = fileReader1.result;
                                    Data.endpoints.dfg.an4.create.post(element).success(function(data) {
                                        _self.loader.close();
                                        _self.coreServices.libraryOptions.dataType[_self.coreServices.libraryOptions.renderType].text = "FOLDER";
                                        _self.coreServices.renderAccordionFiles({
                                            idFolder: _self.coreServices.folders[_self.coreServices.libraryOptions.renderType].currentId
                                        });

                                        return;
                                    }).error(function(error) {
                                        console.log(error)
                                        _self.loader.close();

                                    });
                                };
                                fileReader1.readAsText(fileReference)
                            } else if (fileComparison && !fileReference) {
                                fileReader2.onload = function() {
                                    element.externalFileComparison = fileReader2.result;
                                    Data.endpoints.dfg.an4.create.post(element).success(function(data) {
                                        _self.loader.close();
                                        _self.coreServices.libraryOptions.dataType[_self.coreServices.libraryOptions.renderType].text = "FOLDER";
                                        _self.coreServices.renderAccordionFiles({
                                            idFolder: _self.coreServices.folders[_self.coreServices.libraryOptions.renderType].currentId
                                        });

                                        return;
                                    }).error(function(error) {
                                        console.log(error)
                                        _self.loader.close();

                                    });
                                };
                                fileReader2.readAsText(fileComparison)
                            } else {
                                fileReader1.onload = function() {
                                    element.externalFileReference = fileReader1.result;
                                    fileReader2.onload = function() {
                                        element.externalFileComparison = fileReader2.result;
                                        Data.endpoints.dfg.an4.create.post(element).success(function(data) {
                                            _self.loader.close();
                                            _self.coreServices.libraryOptions.dataType[_self.coreServices.libraryOptions.renderType].text = "FOLDER";
                                            _self.coreServices.renderAccordionFiles({
                                                idFolder: _self.coreServices.folders[_self.coreServices.libraryOptions.renderType].currentId
                                            });

                                            return;
                                        }).error(function(error) {
                                            console.log(error)
                                            _self.loader.close();

                                        });
                                    };
                                    fileReader2.readAsText(fileComparison)
                                };
                                fileReader1.readAsText(fileReference)
                            }
                        } catch (e) {
                            _self.loader.close();
                            $.baseToast({
                                isError: true,
                                text: i18n("ERROR UPLOADING FILE")
                            });

                        }
                    } else {
                        Data.endpoints.dfg.an4.create.post(element).success(function(data) {
                            _self.loader.close();
                            _self.coreServices.libraryOptions.dataType[_self.coreServices.libraryOptions.renderType].text = "FOLDER";
                            _self.coreServices.renderAccordionFiles({
                                idFolder: _self.coreServices.folders[_self.coreServices.libraryOptions.renderType].currentId
                            });

                            return;
                        }).error(function(error) {
                            console.log(error)
                            _self.loader.close();

                        });
                    }

                    _self.createDialog.close();
                } else {
                    $.baseToast({
                        type: "w",
                        text: i18n("FILL ALL FIELDS")
                    });
                }
            },
            tooltip: i18n("CLICK PRESS CONFIRM")
        }];

        if (mode) {
            if (mode === "visualize") {
                title = i18n("VISUALIZE");
                buttons = [{
                    name: i18n("CLOSE"),
                    isCloseButton: true,
                    tooltip: i18n("CLICK PRESS CLOSE"),
                }];
            } else {
                title = i18n("EDIT");
                buttons = [{
                    name: i18n("CLOSE"),
                    isCloseButton: true,
                    tooltip: i18n("CLICK PRESS CLOSE"),
                }, {
                    name: i18n("EDIT"),
                    click: function() {
                        var innerCtrl = _self.createDialog.getInnerController();
                        if (innerCtrl.validate()) {
                            var element = innerCtrl.getEditData();
                            element.id = item.id;
                            _self.loader.open();
                            Data.endpoints.dfg.an4.update.post(element).success(function(data) {

                                _self.loader.close();
                                _self.coreServices.libraryOptions.dataType[_self.coreServices.libraryOptions.renderType].text = "FOLDER";
                                _self.coreServices.renderAccordionFiles({
                                    idFolder: _self.coreServices.folders[_self.coreServices.libraryOptions.renderType].currentId
                                });
                                $.baseToast({
                                    isSuccess: true,
                                    text: i18n("SUCCESS EDITING AN4")
                                });
                            }).error(function(error) {
                                _self.loader.close();
                            });
                            _self.createDialog.close();
                        } else {
                            $.baseToast({
                                type: "w",
                                text: i18n("FILL ALL FIELDS")
                            });
                        }
                    }
                }];
            }

        }
        _self.createDialog = $.baseDialog({
            title: title,
            modal: true,
            size: "bienpinchewide wide",
            disableOuterClick: true,
            cssClass: "newFile",
            viewName: "app.views.library.an4.createDialog",
            viewData: {
                mode: mode,
                item: item
            },
            buttons: buttons
        });
    }
});