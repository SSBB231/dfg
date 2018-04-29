/*global i18n _*/
sap.ui.controller("app.controllers.library.leftContent", {
    onInit: function() {},
    onAfterRendering: function(html) {
        this._view = $(html);
        this._view.tabs = this._view.find(".tabs-wrapper");
        this.accordionCtrl = {};
        this.addServices();
        this.bindElements();
    },
    addServices: function() {
        var _self = this;
        this.coreServices.renderAccordion = function(type, target) {
            var _text = {
                "LAYOUT": {
                    tooltip: i18n("CLICK PRESS") + i18n("TO VIEW"),
                    text: i18n("LAYOUTS"),
                    identifier: "layout",
                    shared: i18n("MY LAYOUTS")
                },
                "SETTING": {
                    tooltip: i18n("CLICK PRESS") + i18n("TO VIEW"),
                    text: i18n("SETTINGS"),
                    identifier: "setting",
                    shared: i18n("MY SETTING")
                },
                "DIGITAL FILE": {
                    tooltip: i18n("CLICK PRESS") + i18n("TO VIEW"),
                    text: i18n("FILES"),
                    identifier: "digitalFile",
                    shared: i18n("MY FILE")
                },
                "SPED": {
                    tooltip: i18n("CLICK PRESS") + i18n("TO VIEW"),
                    text: "SPED",
                    identifier: "sped"
                },
                "AN3": {
                    tooltip: i18n("CLICK PRESS") + i18n("TO VIEW"),
                    text: i18n("AN3"),
                    identifier: "an3",
                    shared: i18n("MY AN3")
                },
                "AN4": {
                    tooltip: i18n("CLICK PRESS") + i18n("TO VIEW"),
                    text: i18n("AN4"),
                    identifier: "an4",
                    shared: i18n("MY AN4")
                },
                "PANEL": {
                    tooltip: i18n("CLICK PRESS") + i18n("TO VIEW"),
                    text: i18n("PANEL"),
                    identifier: "panel",
                    shared: i18n("MY PANEL")
                }
            };
            var accordionData;
            if (type !== "SPED") {
                accordionData = {
                    accordion: [{
                        customTitle: {
                            name: "core.views.TimpLibrary.libraryAccordionTitle",
                            data: {
                                title: (sessionStorage.lang === "ptrbr" || !sessionStorage.lang) ?
                                    (_text[type].text === "Configurações" || _text[type].text === "AN3") ?
                                    _text[type].text + " " + i18n("PUBLICS").trim() :
                                    _text[type].text + " " + i18n("PUBLIC").trim() + "s" : i18n("PUBLIC") + " " + _text[type].text,
                                iconFont: _self.coreServices.icons.public.iconFont,
                                icon: _self.coreServices.icons.public.icon,
                                number: 0,
                                label: _text[type].text
                            }
                        },
                        identifier: "public-" + _text[type].identifier,
                        tooltip: {
                            position: "right",
                            class: "dark",
                            text: (sessionStorage.lang === "ptrbr" || !sessionStorage.lang) ?
                                (_text[type].text === "Configurações" || _text[type].text === "AN3") ?
                                _text[type].tooltip + _text[type].text + " " + i18n("PUBLICS").trim() :
                                _text[type].tooltip + _text[type].text + " " + i18n("PUBLIC").trim() + "s" : _text[type].tooltip + i18n("PUBLIC") + " " + _text[type].text
                        },
                        onPress: function() {
                            var data = {
                                searchParams: {},
                                counter: {
                                    public: true
                                }
                            };
                            _self.coreServices.libraryOptions.renderType = type;
                            if (_self.coreServices.libraryOptions.dataType[_self.coreServices.libraryOptions.renderType].text === "TRASH" || _self.coreServices
                                .libraryOptions.dataType[_self.coreServices.libraryOptions.renderType].text === "SETTING") {
                                _self.coreServices.libraryOptions.dataType[_self.coreServices.libraryOptions.renderType].text = "PUBLIC";
                                _self.coreServices.renderToolbar();
                            } else {
                                _self.coreServices.libraryOptions.dataType[_self.coreServices.libraryOptions.renderType].text = "PUBLIC";
                            }
                            _self.coreServices.renderAccordionFiles(data);
                        }
                    }, {
                        customTitle: {
                            name: "core.views.TimpLibrary.libraryAccordionTitle",
                            data: {
                                title: _text[type].text + " " + i18n("STANDARD"),
                                iconFont: _self.coreServices.icons.standard.iconFont,
                                icon: _self.coreServices.icons.standard.icon,
                                number: 0,
                                label: _text[type].text
                            }
                        },
                        identifier: "standard-" + _text[type].identifier,
                        tooltip: {
                            position: "right",
                            class: "dark",
                            text: _text[type].tooltip + _text[type].text + " " + i18n("STANDARD")
                        },
                        onPress: function() {
                            var data = {
                                searchParams: {},
                                counter: {
                                    standard: true
                                }
                            };
                            _self.coreServices.libraryOptions.renderType = type;
                            if (_self.coreServices.libraryOptions.dataType[_self.coreServices.libraryOptions.renderType].text === "TRASH" || _self.coreServices
                                .libraryOptions.dataType[_self.coreServices.libraryOptions.renderType].text === "SETTING") {
                                _self.coreServices.libraryOptions.dataType[_self.coreServices.libraryOptions.renderType].text = "STANDARD";
                                _self.coreServices.renderToolbar();
                            } else {
                                _self.coreServices.libraryOptions.dataType[_self.coreServices.libraryOptions.renderType].text = "STANDARD";
                            }
                            _self.coreServices.renderAccordionFiles(data);
                        }
                    }, {
                        customTitle: {
                            name: "core.views.TimpLibrary.libraryAccordionTitle",
                            data: {
                                title: _text[type].shared,
                                iconFont: _self.coreServices.icons.my.iconFont,
                                icon: _self.coreServices.icons.my.icon,
                                number: 0,
                                label: _text[type].text
                            }
                        },
                        identifier: "my-" + _text[type].identifier,
                        items: {
                            accordion: [{
                                customTitle: {
                                    name: "core.views.TimpLibrary.libraryAccordionTitle",
                                    data: {
                                        title: i18n("MY FAVORITES"),
                                        iconFont: _self.coreServices.icons.favorite.iconFont,
                                        icon: _self.coreServices.icons.favorite.icon,
                                        number: 0,
                                        label: _text[type].text
                                    }
                                },
                                identifier: "favorite-" + _text[type].identifier,
                                tooltip: {
                                    position: "right",
                                    class: "dark",
                                    text: _text[type].tooltip + i18n("MY FAVORITES")
                                },
                                onPress: function() {
                                    var data = {
                                        idUser: _self.loggedUser.id,
                                        searchParams: {}
                                    };
                                    _self.coreServices.libraryOptions.renderType = type;
                                    if (_self.coreServices.libraryOptions.dataType[_self.coreServices.libraryOptions.renderType].text === "TRASH" || _self.coreServices
                                        .libraryOptions.dataType[_self.coreServices.libraryOptions.renderType].text === "SETTING") {
                                        _self.coreServices.libraryOptions.dataType[_self.coreServices.libraryOptions.renderType].text = "FAVORITE";
                                        _self.coreServices.renderToolbar();
                                    } else {
                                        _self.coreServices.libraryOptions.dataType[_self.coreServices.libraryOptions.renderType].text = "FAVORITE";
                                    }
                                    _self.coreServices.renderAccordionFiles(data);
                                }
                            }, {
                                customTitle: {
                                    name: "core.views.TimpLibrary.libraryAccordionTitle",
                                    data: {
                                        title: i18n("MY SHARED"),
                                        iconFont: _self.coreServices.icons.shared.iconFont,
                                        icon: _self.coreServices.icons.shared.icon,
                                        number: 0,
                                        label: _text[type].text
                                    }
                                },
                                identifier: "shared-" + _text[type].identifier,
                                tooltip: {
                                    position: "right",
                                    class: "dark",
                                    text: _text[type].tooltip + i18n("MY SHARED")
                                },
                                onPress: function() {
                                    var data = {
                                        idUser: _self.loggedUser.id,
                                        searchParams: {}
                                    };
                                    _self.coreServices.libraryOptions.renderType = type;
                                    if (_self.coreServices.libraryOptions.dataType[_self.coreServices.libraryOptions.renderType].text === "TRASH" || _self.coreServices
                                        .libraryOptions.dataType[_self.coreServices.libraryOptions.renderType].text === "SETTING") {
                                        _self.coreServices.libraryOptions.dataType[_self.coreServices.libraryOptions.renderType].text = "SHARED";
                                        _self.coreServices.renderToolbar();
                                    } else {
                                        _self.coreServices.libraryOptions.dataType[_self.coreServices.libraryOptions.renderType].text = "SHARED";
                                    }
                                    _self.coreServices.renderAccordionFiles(data);
                                }
                            }]
                        }
                    }]
                };
            } else {
                accordionData = {
                    accordion: [{
                        customTitle: {
                            name: 'core.views.TimpLibrary.libraryAccordionTitle',
                            data: {
                                title: "EFD ICMS / IPI",
                                iconFont: "File-and-Folders",
                                icon: "filleddocument",
                                number: 0,
                                label: _text[type].text
                            }
                        },
                        items: {
                            accordion: [{
                                    customTitle: {
                                        name: 'core.views.TimpLibrary.libraryAccordionTitle',
                                        data: {
                                            title: 'EFD ICMS / IPI',
                                            iconFont: "File-and-Folders",
                                            icon: "docversionsetting",
                                            number: 0,
                                            label: _text[type].text
                                        }
                                    },
                                    identifier: "icmsipi",
                                    tooltip: {
                                        position: "right",
                                        class: "dark",
                                        text: _text[type].tooltip + " EFD ICMS / IPI"
                                    },
                                    onPress: function() {
                                        var data = {
                                            type: 1,
                                            subType: "spedFile",
                                            status: 1,
                                            getFiltersData: _self.coreServices.spedFilters !== undefined ? false : true,
                                            counter: _self.coreServices.spedCounter !== undefined ? false : true
                                        };
                                        if (_self.coreServices.libraryOptions.displayType === "LIST") {
                                            data.number = 1;
                                        }
                                        if (_self.coreServices.searchKeysSPED) {
                                            data.searchKeys = _self.coreServices.searchKeysSPED;
                                        }
                                        _self.coreServices.getSPEDData(data);
                                        _self.coreServices.spedType = 1;
                                        _self.coreServices.spedSubType = "spedFile";
                                        _self.coreServices.renderToolbar();
                                    }
                                }, {
                                    customTitle: {
                                        name: 'core.views.TimpLibrary.libraryAccordionTitle',
                                        data: {
                                            title: i18n("CALCULATION BLOCKS"),
                                            iconFont: "File-and-Folders",
                                            icon: "docpile",
                                            number: 0,
                                            label: _text[type].text
                                        }
                                    },
                                    identifier: "icmsipi-calculationBlocks",
                                    tooltip: {
                                        position: "right",
                                        class: "dark",
                                        text: _text[type].tooltip + " " + i18n("CALCULATION BLOCKS")
                                    },
                                    onPress: function() {
                                        var data = {
                                            type: 1,
                                            subType: "calculationBlocks",
                                            status: 1,
                                            getFiltersData: _self.coreServices.spedFilters !== undefined ? false : true,
                                            counter: _self.coreServices.spedCounter !== undefined ? false : true
                                        };
                                        if (_self.coreServices.libraryOptions.displayType === "LIST") {
                                            data.number = 1;
                                        }
                                        if (_self.coreServices.searchKeysSPED) {
                                            data.searchKeys = _self.coreServices.searchKeysSPED;
                                        }
                                        _self.coreServices.getSPEDData(data);
                                        _self.coreServices.spedType = 1;
                                        _self.coreServices.spedSubType = "calculationBlocks";
                                        _self.coreServices.renderToolbar();
                                    }
                                }
                                /* , {
                                     customTitle: {
                                         name: 'core.views.TimpLibrary.libraryAccordionTitle',
                                         data: {
                                             title: i18n("UPDATED STRUCTURES"),
                                             iconFont: "Sign-and-Symbols",
                                             icon: "organizationchartA",
                                             number: 0,
                                             label: _text[type].text
                                         }
                                     },
                                     identifier: "icmsipi-updated-structures",
                                     tooltip: {
                                         position: "right",
                                         class: "dark",
                                         text: _text[type].tooltip + " " + i18n("UPDATED STRUCTURES")
                                     },
                                     onPress: function() {
                                         var data = {
                                             type: 1,
                                             subType: "updatedStructures",
                                             status: 1,
                                             getFiltersData: _self.coreServices.spedFilters !== undefined ? false : true,
                                             counter: _self.coreServices.spedCounter !== undefined ? false : true
                                         };
                                         if (_self.coreServices.libraryOptions.displayType === "LIST") {
                                             data.number = 1;
                                         }
                                         if (_self.coreServices.searchKeysSPED) {
                                             data.searchKeys = _self.coreServices.searchKeysSPED;
                                         }
                                         _self.coreServices.getSPEDData(data);
                                         _self.coreServices.spedType = 1;
                                         _self.coreServices.spedSubType = "updatedStructures";

                                         _self.coreServices.renderToolbar();
                                     }
                                 }, {
                                     customTitle: {
                                         name: 'core.views.TimpLibrary.libraryAccordionTitle',
                                         data: {
                                             title: i18n("EXECUTIONS"),
                                             iconFont: "File-and-Folders",
                                             icon: "checkeddoc",
                                             number: 0,
                                             label: _text[type].text
                                         }
                                     },
                                     identifier: "icmsipi-executions",
                                     tooltip: {
                                         position: "right",
                                         class: "dark",
                                         text: _text[type].tooltip + " " + i18n("EXECUTIONS")
                                     },
                                     onPress: function() {
                                         var data = {
                                             type: 1,
                                             subType: "executions",
                                             status: 1,
                                             getFiltersData: _self.coreServices.spedFilters !== undefined ? false : true,
                                             counter: _self.coreServices.spedCounter !== undefined ? false : true
                                         };
                                         if (_self.coreServices.libraryOptions.displayType === "LIST") {
                                             data.number = 1;
                                         }
                                         if (_self.coreServices.searchKeysSPED) {
                                             data.searchKeys = _self.coreServices.searchKeysSPED;
                                         }
                                         _self.coreServices.getSPEDData(data);
                                         _self.coreServices.spedType = 1;
                                         _self.coreServices.spedSubType = "executions";
                                         _self.coreServices.renderToolbar();
                                     }
                                 }*/
                            ]
                        },
                        identifier: "efd-icmsipi",
                        tooltip: {
                            position: "right",
                            class: "dark",
                            text: _text[type].tooltip + " EFD ICMS / IPI"
                        },
                        onPress: function() {
                            _self.coreServices.spedType = 1;
                            _self.coreServices.spedSubType = "spedFile";
                            var data = {
                                type: 1,
                                subType: "spedFile",
                                status: 1,
                                getFiltersData: _self.coreServices.spedFilters !== undefined ? false : true,
                                counter: _self.coreServices.spedCounter !== undefined ? false : true
                            };
                            if (_self.coreServices.libraryOptions.displayType === "LIST") {
                                data.number = 1;
                            }
                            if (_self.coreServices.searchKeysSPED) {
                                data.searchKeys = _self.coreServices.searchKeysSPED;
                            }
                            _self.coreServices.getSPEDData(data);
                            _self.coreServices.renderToolbar();
                        }
                    }, {
                        customTitle: {
                            name: "core.views.TimpLibrary.libraryAccordionTitle",
                            data: {
                                title: "EFD " + i18n("CONTRIBUTIONS"),
                                iconFont: "File-and-Folders",
                                icon: "filleddocument",
                                number: 0,
                                label: _text[type].text
                            }
                        },
                        items: {
                            accordion: [{
                                    customTitle: {
                                        name: 'core.views.TimpLibrary.libraryAccordionTitle',
                                        data: {
                                            title: "EFD " + i18n("CONTRIBUTIONS"),
                                            iconFont: "File-and-Folders",
                                            icon: "docversionsetting",
                                            number: 0,
                                            label: _text[type].text
                                        }
                                    },
                                    identifier: "contributions",
                                    tooltip: {
                                        position: "right",
                                        class: "dark",
                                        text: _text[type].tooltip + " EFD " + i18n("CONTRIBUTIONS")
                                    },
                                    onPress: function() {
                                        var data = {
                                            type: 2,
                                            subType: "spedFile",
                                            status: 1,
                                            getFiltersData: _self.coreServices.spedFilters !== undefined ? false : true,
                                            counter: _self.coreServices.spedCounter !== undefined ? false : true
                                        };
                                        if (_self.coreServices.libraryOptions.displayType === "LIST") {
                                            data.number = 1;
                                        }
                                        if (_self.coreServices.searchKeysSPED) {
                                            data.searchKeys = _self.coreServices.searchKeysSPED;
                                        }
                                        _self.coreServices.getSPEDData(data);
                                        _self.coreServices.spedType = 2;
                                        _self.coreServices.spedSubType = "spedFile";
                                        _self.coreServices.renderToolbar();
                                    }
                                }, {
                                    customTitle: {
                                        name: 'core.views.TimpLibrary.libraryAccordionTitle',
                                        data: {
                                            title: i18n("CALCULATION BLOCKS"),
                                            iconFont: "File-and-Folders",
                                            icon: "docpile",
                                            number: 0,
                                            label: _text[type].text
                                        }
                                    },
                                    identifier: "contributions-calculationBlocks",
                                    tooltip: {
                                        position: "right",
                                        class: "dark",
                                        text: _text[type].tooltip + " " + i18n("CALCULATION BLOCKS")
                                    },
                                    onPress: function() {
                                        var data = {
                                            type: 2,
                                            subType: "calculationBlocks",
                                            status: 1,
                                            getFiltersData: _self.coreServices.spedFilters !== undefined ? false : true,
                                            counter: _self.coreServices.spedCounter !== undefined ? false : true
                                        };
                                        if (_self.coreServices.libraryOptions.displayType === "LIST") {
                                            data.number = 1;
                                        }
                                        if (_self.coreServices.searchKeysSPED) {
                                            data.searchKeys = _self.coreServices.searchKeysSPED;
                                        }
                                        _self.coreServices.getSPEDData(data);
                                        _self.coreServices.spedType = 2;
                                        _self.coreServices.spedSubType = "calculationBlocks";
                                        _self.coreServices.renderToolbar();
                                    }
                                }
                                /* ,{
                                     customTitle: {
                                         name: 'core.views.TimpLibrary.libraryAccordionTitle',
                                         data: {
                                             title: i18n("UPDATED STRUCTURES"),
                                             iconFont: "Sign-and-Symbols",
                                             icon: "organizationchartA",
                                             number: 0,
                                             label: _text[type].text
                                         }
                                     },
                                     identifier: "contributions-updated-structures",
                                     tooltip: {
                                         position: "right",
                                         class: "dark",
                                         text: _text[type].tooltip + " " + i18n("UPDATED STRUCTURES")
                                     },
                                     onPress: function() {
                                         var data = {
                                             type: 2,
                                             subType: "updatedStructures",
                                             status: 1,
                                             getFiltersData: _self.coreServices.spedFilters !== undefined ? false : true,
                                             counter: _self.coreServices.spedCounter !== undefined ? false : true
                                         };
                                         if (_self.coreServices.libraryOptions.displayType === "LIST") {
                                             data.number = 1;
                                         }
                                         if (_self.coreServices.searchKeysSPED) {
                                             data.searchKeys = _self.coreServices.searchKeysSPED;
                                         }
                                         _self.coreServices.getSPEDData(data);
                                         _self.coreServices.spedType = 2;
                                         _self.coreServices.spedSubType = "updatedStructures";
                                         _self.coreServices.renderToolbar();
                                     }
                                 }, {
                                     customTitle: {
                                         name: 'core.views.TimpLibrary.libraryAccordionTitle',
                                         data: {
                                             title: i18n("EXECUTIONS"),
                                             iconFont: "File-and-Folders",
                                             icon: "checkeddoc",
                                             number: 0,
                                             label: _text[type].text
                                         }
                                     },
                                     identifier: "contributions-executions",
                                     tooltip: {
                                         position: "right",
                                         class: "dark",
                                         text: _text[type].tooltip + " " + i18n("EXECUTIONS")
                                     },
                                     onPress: function() {
                                         var data = {
                                             type: 2,
                                             subType: "executions",
                                             status: 1,
                                             getFiltersData: _self.coreServices.spedFilters !== undefined ? false : true,
                                             counter: _self.coreServices.spedCounter !== undefined ? false : true
                                         };
                                         if (_self.coreServices.libraryOptions.displayType === "LIST") {
                                             data.number = 1;
                                         }
                                         if (_self.coreServices.searchKeysSPED) {
                                             data.searchKeys = _self.coreServices.searchKeysSPED;
                                         }
                                         _self.coreServices.getSPEDData(data);
                                         _self.coreServices.spedType = 2;
                                         _self.coreServices.spedSubType = "executions";
                                         _self.coreServices.renderToolbar();
                                     }
                                 }*/
                            ]
                        },
                        identifier: "efd-contributions",
                        tooltip: {
                            position: "right",
                            class: "dark",
                            text: _text[type].tooltip + " EFD " + i18n("CONTRIBUTIONS")
                        },
                        onPress: function() {
                            var data = {
                                type: 2,
                                subType: "spedFile",
                                status: 1,
                                getFiltersData: _self.coreServices.spedFilters !== undefined ? false : true,
                                counter: _self.coreServices.spedCounter !== undefined ? false : true
                            };
                            if (_self.coreServices.libraryOptions.displayType === "LIST") {
                                data.number = 1;
                            }
                            if (_self.coreServices.searchKeysSPED) {
                                data.searchKeys = _self.coreServices.searchKeysSPED;
                            }
                            _self.coreServices.getSPEDData(data);
                            _self.coreServices.spedType = 2;
                            _self.coreServices.spedSubType = "spedFile";
                            _self.coreServices.renderToolbar();
                        }
                    }, {
                        customTitle: {
                            name: "core.views.TimpLibrary.libraryAccordionTitle",
                            data: {
                                title: "ECD",
                                iconFont: "File-and-Folders",
                                icon: "filleddocument",
                                number: 0,
                                label: _text[type].text
                            }
                        },
                        items: {
                            accordion: [{
                                    customTitle: {
                                        name: 'core.views.TimpLibrary.libraryAccordionTitle',
                                        data: {
                                            title: 'ECD',
                                            iconFont: "File-and-Folders",
                                            icon: "docversionsetting",
                                            number: 0,
                                            label: _text[type].text
                                        }
                                    },
                                    identifier: "ecdItem",
                                    tooltip: {
                                        position: "right",
                                        class: "dark",
                                        text: _text[type].tooltip + " ECD"
                                    },
                                    onPress: function() {
                                        var data = {
                                            type: 3,
                                            subType: "spedFile",
                                            status: 1,
                                            getFiltersData: _self.coreServices.spedFilters !== undefined ? false : true,
                                            counter: _self.coreServices.spedCounter !== undefined ? false : true
                                        };
                                        if (_self.coreServices.libraryOptions.displayType === "LIST") {
                                            data.number = 1;
                                        }
                                        if (_self.coreServices.searchKeysSPED) {
                                            data.searchKeys = _self.coreServices.searchKeysSPED;
                                        }
                                        _self.coreServices.getSPEDData(data);
                                        _self.coreServices.spedType = 3;
                                        _self.coreServices.spedSubType = "spedFile";
                                        _self.coreServices.renderToolbar();
                                    }
                                }, {
                                    customTitle: {
                                        name: 'core.views.TimpLibrary.libraryAccordionTitle',
                                        data: {
                                            title: i18n("CALCULATION BLOCKS"),
                                            iconFont: "File-and-Folders",
                                            icon: "docpile",
                                            number: 0,
                                            label: _text[type].text
                                        }
                                    },
                                    identifier: "ecd-calculationBlocks",
                                    tooltip: {
                                        position: "right",
                                        class: "dark",
                                        text: _text[type].tooltip + " " + i18n("CALCULATION BLOCKS")
                                    },
                                    onPress: function() {
                                        var data = {
                                            type: 3,
                                            subType: "calculationBlocks",
                                            status: 1,
                                            getFiltersData: _self.coreServices.spedFilters !== undefined ? false : true,
                                            counter: _self.coreServices.spedCounter !== undefined ? false : true
                                        };
                                        if (_self.coreServices.libraryOptions.displayType === "LIST") {
                                            data.number = 1;
                                        }
                                        if (_self.coreServices.searchKeysSPED) {
                                            data.searchKeys = _self.coreServices.searchKeysSPED;
                                        }
                                        _self.coreServices.getSPEDData(data);
                                        _self.coreServices.spedType = 3;
                                        _self.coreServices.spedSubType = "calculationBlocks";
                                        _self.coreServices.renderToolbar();
                                    }
                                }
                                /*, {
                                    customTitle: {
                                        name: 'core.views.TimpLibrary.libraryAccordionTitle',
                                        data: {
                                            title: i18n("UPDATED STRUCTURES"),
                                            iconFont: "Sign-and-Symbols",
                                            icon: "organizationchartA",
                                            number: 0,
                                            label: _text[type].text
                                        }
                                    },
                                    identifier: "ecd-updated-structures",
                                    tooltip: {
                                        position: "right",
                                        class: "dark",
                                        text: _text[type].tooltip + " " + i18n("UPDATED STRUCTURES")
                                    },
                                    onPress: function() {
                                        var data = {
                                            type: 3,
                                            subType: "updatedStructures",
                                            status: 1,
                                            getFiltersData: _self.coreServices.spedFilters !== undefined ? false : true,
                                            counter: _self.coreServices.spedCounter !== undefined ? false : true
                                        };
                                        if (_self.coreServices.libraryOptions.displayType === "LIST") {
                                            data.number = 1;
                                        }
                                        if (_self.coreServices.searchKeysSPED) {
                                            data.searchKeys = _self.coreServices.searchKeysSPED;
                                        }
                                        _self.coreServices.getSPEDData(data);
                                        _self.coreServices.spedType = 3;
                                        _self.coreServices.spedSubType = "updatedStructures";
                                        _self.coreServices.renderToolbar();
                                    }
                                }, {
                                    customTitle: {
                                        name: 'core.views.TimpLibrary.libraryAccordionTitle',
                                        data: {
                                            title: i18n("EXECUTIONS"),
                                            iconFont: "File-and-Folders",
                                            icon: "checkeddoc",
                                            number: 0,
                                            label: _text[type].text
                                        }
                                    },
                                    identifier: "ecd-executions",
                                    tooltip: {
                                        position: "right",
                                        class: "dark",
                                        text: _text[type].tooltip + " " + i18n("EXECUTIONS")
                                    },
                                    onPress: function() {
                                        var data = {
                                            type: 3,
                                            subType: "executions",
                                            status: 1,
                                            getFiltersData: _self.coreServices.spedFilters !== undefined ? false : true,
                                            counter: _self.coreServices.spedCounter !== undefined ? false : true
                                        };
                                        if (_self.coreServices.libraryOptions.displayType === "LIST") {
                                            data.number = 1;
                                        }
                                        if (_self.coreServices.searchKeysSPED) {
                                            data.searchKeys = _self.coreServices.searchKeysSPED;
                                        }
                                        _self.coreServices.getSPEDData(data);
                                        _self.coreServices.spedType = 3;
                                        _self.coreServices.spedSubType = "executions";
                                        _self.coreServices.renderToolbar();
                                    }
                                }*/
                            ]
                        },
                        identifier: "ecd",
                        tooltip: {
                            position: "right",
                            class: "dark",
                            text: _text[type].tooltip + " ECD"
                        },
                        onPress: function() {
                            var data = {
                                type: 3,
                                subType: "spedFile",
                                status: 1,
                                getFiltersData: _self.coreServices.spedFilters !== undefined ? false : true,
                                counter: _self.coreServices.spedCounter !== undefined ? false : true
                            };
                            if (_self.coreServices.libraryOptions.displayType === "LIST") {
                                data.number = 1;
                            }
                            if (_self.coreServices.searchKeysSPED) {
                                data.searchKeys = _self.coreServices.searchKeysSPED;
                            }
                            _self.coreServices.getSPEDData(data);
                            _self.coreServices.spedType = 3;
                            _self.coreServices.spedSubType = "spedFile";
                            _self.coreServices.renderToolbar();
                        }
                    }, {
                        customTitle: {
                            name: "core.views.TimpLibrary.libraryAccordionTitle",
                            data: {
                                title: "ECF",
                                iconFont: "File-and-Folders",
                                icon: "filleddocument",
                                number: 0,
                                label: _text[type].text
                            }
                        },
                        items: {
                            accordion: [{
                                    customTitle: {
                                        name: 'core.views.TimpLibrary.libraryAccordionTitle',
                                        data: {
                                            title: 'ECF',
                                            iconFont: "File-and-Folders",
                                            icon: "docversionsetting",
                                            number: 0,
                                            label: _text[type].text
                                        }
                                    },
                                    identifier: "ecfItem",
                                    tooltip: {
                                        position: "right",
                                        class: "dark",
                                        text: _text[type].tooltip + " ECF"
                                    },
                                    onPress: function() {
                                        var data = {
                                            type: 4,
                                            subType: "spedFile",
                                            status: 1,
                                            getFiltersData: _self.coreServices.spedFilters !== undefined ? false : true,
                                            counter: _self.coreServices.spedCounter !== undefined ? false : true
                                        };
                                        if (_self.coreServices.libraryOptions.displayType === "LIST") {
                                            data.number = 1;
                                        }
                                        if (_self.coreServices.searchKeysSPED) {
                                            data.searchKeys = _self.coreServices.searchKeysSPED;
                                        }
                                        _self.coreServices.getSPEDData(data);
                                        _self.coreServices.spedType = 4;
                                        _self.coreServices.spedSubType = "spedFile";
                                        _self.coreServices.renderToolbar();
                                    }
                                }, {
                                    customTitle: {
                                        name: 'core.views.TimpLibrary.libraryAccordionTitle',
                                        data: {
                                            title: i18n("CALCULATION BLOCKS"),
                                            iconFont: "File-and-Folders",
                                            icon: "docpile",
                                            number: 0,
                                            label: _text[type].text
                                        }
                                    },
                                    identifier: "ecf-calculationBlocks",
                                    tooltip: {
                                        position: "right",
                                        class: "dark",
                                        text: _text[type].tooltip + " " + i18n("CALCULATION BLOCKS")
                                    },
                                    onPress: function() {
                                        var data = {
                                            type: 4,
                                            subType: "calculationBlocks",
                                            status: 1,
                                            getFiltersData: _self.coreServices.spedFilters !== undefined ? false : true,
                                            counter: _self.coreServices.spedCounter !== undefined ? false : true
                                        };
                                        if (_self.coreServices.libraryOptions.displayType === "LIST") {
                                            data.number = 1;
                                        }
                                        if (_self.coreServices.searchKeysSPED) {
                                            data.searchKeys = _self.coreServices.searchKeysSPED;
                                        }
                                        _self.coreServices.getSPEDData(data);
                                        _self.coreServices.spedType = 4;
                                        _self.coreServices.spedSubType = "calculationBlocks";
                                        _self.coreServices.renderToolbar();
                                    }
                                }
                                /*, {
                                    customTitle: {
                                        name: 'core.views.TimpLibrary.libraryAccordionTitle',
                                        data: {
                                            title: i18n("UPDATED STRUCTURES"),
                                            iconFont: "Sign-and-Symbols",
                                            icon: "organizationchartA",
                                            number: 0,
                                            label: _text[type].text
                                        }
                                    },
                                    identifier: "ecf-updated-structures",
                                    tooltip: {
                                        position: "right",
                                        class: "dark",
                                        text: _text[type].tooltip + " " + i18n("UPDATED STRUCTURES")
                                    },
                                    onPress: function() {
                                        var data = {
                                            type: 4,
                                            subType: "updatedStructures",
                                            status: 1,
                                            getFiltersData: _self.coreServices.spedFilters !== undefined ? false : true,
                                            counter: _self.coreServices.spedCounter !== undefined ? false : true
                                        };
                                        if (_self.coreServices.libraryOptions.displayType === "LIST") {
                                            data.number = 1;
                                        }
                                        if (_self.coreServices.searchKeysSPED) {
                                            data.searchKeys = _self.coreServices.searchKeysSPED;
                                        }
                                        _self.coreServices.getSPEDData(data);
                                        _self.coreServices.spedType = 4;
                                        _self.coreServices.spedSubType = "updatedStructures";
                                        _self.coreServices.renderToolbar();
                                    }
                                }, {
                                    customTitle: {
                                        name: 'core.views.TimpLibrary.libraryAccordionTitle',
                                        data: {
                                            title: i18n("EXECUTIONS"),
                                            iconFont: "File-and-Folders",
                                            icon: "checkeddoc",
                                            number: 0,
                                            label: _text[type].text
                                        }
                                    },
                                    identifier: "ecf-executions",
                                    tooltip: {
                                        position: "right",
                                        class: "dark",
                                        text: _text[type].tooltip + " " + i18n("EXECUTIONS")
                                    },
                                    onPress: function() {
                                        var data = {
                                            type: 4,
                                            subType: "executions",
                                            status: 1,
                                            getFiltersData: _self.coreServices.spedFilters !== undefined ? false : true,
                                            counter: _self.coreServices.spedCounter !== undefined ? false : true
                                        };
                                        if (_self.coreServices.libraryOptions.displayType === "LIST") {
                                            data.number = 1;
                                        }
                                        if (_self.coreServices.searchKeysSPED) {
                                            data.searchKeys = _self.coreServices.searchKeysSPED;
                                        }
                                        _self.coreServices.getSPEDData(data);
                                        _self.coreServices.spedType = 4;
                                        _self.coreServices.spedSubType = "executions";
                                        _self.coreServices.renderToolbar();
                                    }
                                }*/
                            ]
                        },
                        identifier: "ecf",
                        tooltip: {
                            position: "right",
                            class: "dark",
                            text: _text[type].tooltip + " ECF"
                        },
                        onPress: function() {
                            var data = {
                                type: 4,
                                subType: "spedFile",
                                status: 1,
                                getFiltersData: _self.coreServices.spedFilters !== undefined ? false : true,
                                counter: _self.coreServices.spedCounter !== undefined ? false : true
                            };
                            if (_self.coreServices.libraryOptions.displayType === "LIST") {
                                data.number = 1;
                            }
                            if (_self.coreServices.searchKeysSPED) {
                                data.searchKeys = _self.coreServices.searchKeysSPED;
                            }
                            _self.coreServices.getSPEDData(data);
                            _self.coreServices.spedType = 4;
                            _self.coreServices.spedSubType = "spedFile";
                            _self.coreServices.renderToolbar();
                        }
                    }, {
                        customTitle: {
                            name: "core.views.TimpLibrary.libraryAccordionTitle",
                            data: {
                                title: "REINF",
                                iconFont: "File-and-Folders",
                                icon: "filleddocument",
                                number: 0,
                                label: _text[type].text
                            }
                        },
                        items: {
                            accordion: [{
                                    customTitle: {
                                        name: 'core.views.TimpLibrary.libraryAccordionTitle',
                                        data: {
                                            title: 'REINF',
                                            iconFont: "File-and-Folders",
                                            icon: "docversionsetting",
                                            number: 0,
                                            label: _text[type].text
                                        }
                                    },
                                    identifier: "scancItem",
                                    tooltip: {
                                        position: "right",
                                        class: "dark",
                                        text: _text[type].tooltip + " REINF"
                                    },
                                    onPress: function() {
                                        var data = {
                                            type: 5,
                                            subType: "spedFile",
                                            status: 1,
                                            getFiltersData: _self.coreServices.spedFilters !== undefined ? false : true,
                                            counter: _self.coreServices.spedCounter !== undefined ? false : true
                                        };
                                        if (_self.coreServices.libraryOptions.displayType === "LIST") {
                                            data.number = 1;
                                        }
                                        if (_self.coreServices.searchKeysSPED) {
                                            data.searchKeys = _self.coreServices.searchKeysSPED;
                                        }
                                        _self.coreServices.getSPEDData(data);
                                        _self.coreServices.spedType = 5;
                                        _self.coreServices.spedSubType = "spedFile";
                                        _self.coreServices.renderToolbar();
                                    }
                                }
                                /* {
                                customTitle: {
                                    name: 'core.views.TimpLibrary.libraryAccordionTitle',
                                    data: {
                                        title: i18n("CALCULATION BLOCKS"),
                                        iconFont: "File-and-Folders",
                                        icon: "docpile",
                                        number: 0,
                                        label: _text[type].text
                                    }
                                },
                                identifier: "scanc-calculationBlocks",
                                tooltip: {
                                    position: "right",
                                    class: "dark",
                                    text: _text[type].tooltip + " " + i18n("CALCULATION BLOCKS")
                                },
                                onPress: function() {
                                    var data = {
                                        type: 5,
                                        subType: "calculationBlocks",
                                        status: 1,
                                        getFiltersData: _self.coreServices.spedFilters !== undefined ? false : true,
                                        counter: _self.coreServices.spedCounter !== undefined ? false : true
                                    };
                                    if (_self.coreServices.libraryOptions.displayType === "LIST") {
                                        data.number = 1;
                                    }
                                    if (_self.coreServices.searchKeysSPED) {
                                        data.searchKeys = _self.coreServices.searchKeysSPED;
                                    }
                                    _self.coreServices.getSPEDData(data);
                                    _self.coreServices.spedType = 5;
                                    _self.coreServices.spedSubType = "calculationBlocks";
                                    _self.coreServices.renderToolbar();
                                }
            }*/
                            ]
                        },
                        identifier: "scanc",
                        tooltip: {
                            position: "right",
                            class: "dark",
                            text: _text[type].tooltip + " REINF"
                        },
                        onPress: function() {
                            var data = {
                                type: 5,
                                subType: "spedFile",
                                status: 1,
                                getFiltersData: _self.coreServices.spedFilters !== undefined ? false : true,
                                counter: _self.coreServices.spedCounter !== undefined ? false : true
                            };
                            if (_self.coreServices.libraryOptions.displayType === "LIST") {
                                data.number = 1;
                            }
                            if (_self.coreServices.searchKeysSPED) {
                                data.searchKeys = _self.coreServices.searchKeysSPED;
                            }
                            _self.coreServices.getSPEDData(data);
                            _self.coreServices.spedType = 5;
                            _self.coreServices.spedSubType = "spedFile";
                            _self.coreServices.renderToolbar();
                        }
                    }, {
                        customTitle: {
                            name: 'core.views.TimpLibrary.libraryAccordionTitle',
                            data: {
                                title: "E-SOCIAL",
                                iconFont: "File-and-Folders",
                                icon: "filleddocument",
                                number: 0,
                                label: _text[type].text
                            }
                        },
                        items: {
                            accordion: [{
                                customTitle: {
                                    name: 'core.views.TimpLibrary.libraryAccordionTitle',
                                    data: {
                                        title: i18n('EVENTS'),
                                        iconFont: "File-and-Folders",
                                        icon: "docversionsetting",
                                        number: 0,
                                        label: _text[type].text
                                    }
                                },
                                items: {
                                    accordion: [{
                                        customTitle: {
                                            name: 'core.views.TimpLibrary.libraryAccordionTitle',
                                            data: {
                                                title: i18n('S1070'),
                                                iconFont: "DataManager",
                                                icon: "localspace",
                                                number: 0,
                                                label: _text[type].text
                                            }
                                        },
                                        items: {
                                            accordion: [{
                                                customTitle: {
                                                    name: 'core.views.TimpLibrary.libraryAccordionTitle',
                                                    data: {
                                                        title: i18n('S1070 INSERT'),
                                                        iconFont: "File-and-Folders",
                                                        icon: "docanalisis",
                                                        number: 0,
                                                        label: _text[type].text
                                                    }
                                                },
                                                identifier: "s1070-insert",
                                                tooltip: {
                                                    position: "right",
                                                    class: "dark",
                                                    text: _text[type].tooltip + " S1070 INSERT"
                                                },
                                                onPress: function() {
                                                    var data = {
                                                        type: 6,
                                                        subType: "s1070Insert",
                                                        status: 1,
                                                        getFiltersData: _self.coreServices.spedFilters !== undefined ? false : true,
                                                        counter: _self.coreServices.spedCounter !== undefined ? false : true
                                                    };
                                                    if (_self.coreServices.libraryOptions.displayType === "LIST") {
                                                        data.number = 1;
                                                    }
                                                    if (_self.coreServices.searchKeysSPED) {
                                                        data.searchKeys = _self.coreServices.searchKeysSPED;
                                                    }
                                                    _self.coreServices.getSPEDData(data);
                                                    _self.coreServices.spedType = 6;
                                                    _self.coreServices.spedSubType = "s1070Insert";
                                                    _self.coreServices.renderToolbar();
                                                }
                                            }, {
                                                customTitle: {
                                                    name: 'core.views.TimpLibrary.libraryAccordionTitle',
                                                    data: {
                                                        title: i18n('S1070 ALTER'),
                                                        iconFont: "File-and-Folders",
                                                        icon: "docanalisis",
                                                        number: 0,
                                                        label: _text[type].text
                                                    }
                                                },
                                                identifier: "s1070-alter",
                                                tooltip: {
                                                    position: "right",
                                                    class: "dark",
                                                    text: _text[type].tooltip + " S1070 ALTER"
                                                },
                                                onPress: function() {
                                                    var data = {
                                                        type: 6,
                                                        subType: "s1070Alter",
                                                        status: 1,
                                                        getFiltersData: _self.coreServices.spedFilters !== undefined ? false : true,
                                                        counter: _self.coreServices.spedCounter !== undefined ? false : true
                                                    };
                                                    if (_self.coreServices.libraryOptions.displayType === "LIST") {
                                                        data.number = 1;
                                                    }
                                                    if (_self.coreServices.searchKeysSPED) {
                                                        data.searchKeys = _self.coreServices.searchKeysSPED;
                                                    }
                                                    _self.coreServices.getSPEDData(data);
                                                    _self.coreServices.spedType = 6;
                                                    _self.coreServices.spedSubType = "s1070Alter";
                                                    _self.coreServices.renderToolbar();
                                                }
                                            }, {
                                                customTitle: {
                                                    name: 'core.views.TimpLibrary.libraryAccordionTitle',
                                                    data: {
                                                        title: i18n('S1070 DELETE'),
                                                        iconFont: "File-and-Folders",
                                                        icon: "docanalisis",
                                                        number: 0,
                                                        label: _text[type].text
                                                    }
                                                },
                                                identifier: "s1070-delete",
                                                tooltip: {
                                                    position: "right",
                                                    class: "dark",
                                                    text: _text[type].tooltip + " S1070 DELETE"
                                                },
                                                onPress: function() {
                                                    var data = {
                                                        type: 6,
                                                        subType: "s1070Delete",
                                                        status: 1,
                                                        getFiltersData: _self.coreServices.spedFilters !== undefined ? false : true,
                                                        counter: _self.coreServices.spedCounter !== undefined ? false : true
                                                    };
                                                    if (_self.coreServices.libraryOptions.displayType === "LIST") {
                                                        data.number = 1;
                                                    }
                                                    if (_self.coreServices.searchKeysSPED) {
                                                        data.searchKeys = _self.coreServices.searchKeysSPED;
                                                    }
                                                    _self.coreServices.getSPEDData(data);
                                                    _self.coreServices.spedType = 6;
                                                    _self.coreServices.spedSubType = "s1070Delete";
                                                    _self.coreServices.renderToolbar();
                                                }
                                            }]
                                        },
                                        identifier: "s1070",
                                        tooltip: {
                                            position: "right",
                                            class: "dark",
                                            text: _text[type].tooltip + " S1070"
                                        },
                                        onPress: function() {
                                            var data = {
                                                type: 6,
                                                subType: "s1070Insert",
                                                status: 1,
                                                getFiltersData: _self.coreServices.spedFilters !== undefined ? false : true,
                                                counter: _self.coreServices.spedCounter !== undefined ? false : true
                                            };
                                            if (_self.coreServices.libraryOptions.displayType === "LIST") {
                                                data.number = 1;
                                            }
                                            if (_self.coreServices.searchKeysSPED) {
                                                data.searchKeys = _self.coreServices.searchKeysSPED;
                                            }
                                            _self.coreServices.getSPEDData(data);
                                            _self.coreServices.spedType = 6;
                                            _self.coreServices.spedSubType = "s1070Insert";
                                            _self.coreServices.renderToolbar();
                                        }
                                    }]
                                },
                                identifier: "events",
                                tooltip: {
                                    position: "right",
                                    class: "dark",
                                    text: _text[type].tooltip + " EVENTS"
                                },
                                onPress: function() {
                                    var data = {
                                        type: 6,
                                        subType: "s1070Insert",
                                        status: 1,
                                        getFiltersData: _self.coreServices.spedFilters !== undefined ? false : true,
                                        counter: _self.coreServices.spedCounter !== undefined ? false : true
                                    };
                                    if (_self.coreServices.libraryOptions.displayType === "LIST") {
                                        data.number = 1;
                                    }
                                    if (_self.coreServices.searchKeysSPED) {
                                        data.searchKeys = _self.coreServices.searchKeysSPED;
                                    }
                                    _self.coreServices.getSPEDData(data);
                                    _self.coreServices.spedType = 6;
                                    _self.coreServices.spedSubType = "s1070Insert";
                                    _self.coreServices.renderToolbar();
                                }
                            }]
                        },
                        identifier: "e-social",
                        tooltip: {
                            position: "right",
                            class: "dark",
                            text: _text[type].tooltip + " E-SOCIAL"
                        },
                        onPress: function() {
                            _self.coreServices.spedType = 6;
                            _self.coreServices.spedSubType = "s1070Insert";
                            var data = {
                                type: 6,
                                subType: "s1070Insert",
                                status: 1,
                                getFiltersData: _self.coreServices.spedFilters !== undefined ? false : true,
                                counter: _self.coreServices.spedCounter !== undefined ? false : true
                            };
                            if (_self.coreServices.libraryOptions.displayType === "LIST") {
                                data.number = 1;
                            }
                            if (_self.coreServices.searchKeysSPED) {
                                data.searchKeys = _self.coreServices.searchKeysSPED;
                            }
                            _self.coreServices.getSPEDData(data);
                            _self.coreServices.renderToolbar();
                        }
                    }]
                };
            }
            if (type !== "DIGITAL FILE" && type !== "PANEL") {
                accordionData.accordion.push({
                    customTitle: {
                        name: "core.views.TimpLibrary.libraryAccordionTitle",
                        data: {
                            title: i18n("RECYCLE BIN"),
                            iconFont: _self.coreServices.icons.recycleBin.iconFont,
                            icon: _self.coreServices.icons.recycleBin.icon,
                            number: 0,
                            label: _text[type].text
                        }
                    },
                    identifier: "trash-" + _text[type].identifier,
                    tooltip: {
                        position: "right",
                        class: "dark",
                        text: _text[type].tooltip + i18n("RECYCLE BIN")
                    },
                    onPress: function() {
                        if (_self.coreServices.libraryOptions.renderType === "SPED") {
                            var data = {
                                status: 2,
                                getFiltersData: _self.coreServices.spedFilters !== undefined ? false : true,
                                counter: _self.coreServices.spedCounter !== undefined ? false : true
                            };
                            if (_self.coreServices.libraryOptions.displayType === "LIST") {
                                data.number = 1;
                            }
                            if (_self.coreServices.searchKeysSPED) {
                                data.searchKeys = _self.coreServices.searchKeysSPED;
                            }
                            _self.coreServices.getSPEDData(data);
                        } else {
                            var data = {
                                idUser: _self.loggedUser.id,
                                searchParams: {}
                            };
                            _self.coreServices.libraryOptions.renderType = type;
                            _self.coreServices.libraryOptions.dataType[_self.coreServices.libraryOptions.renderType].text = "TRASH";
                            _self.coreServices.renderAccordionFiles(data);
                        }
                        _self.coreServices.renderToolbar();
                    }
                });
            } else {
                if (type === "DIGITAL FILE") {
                    accordionData.accordion.splice(1, 0, {
                        customTitle: {
                            name: "core.views.TimpLibrary.libraryAccordionTitle",
                            data: {
                                title: i18n("OFFICIAL FILES"),
                                iconFont: _self.coreServices.icons.send.iconFont,
                                icon: _self.coreServices.icons.send.icon,
                                number: 0,
                                label: _text[type].text
                            }
                        },
                        identifier: "official-" + _text[type].identifier,
                        tooltip: {
                            position: "right",
                            class: "dark",
                            text: _text[type].tooltip + i18n("OFFICIAL FILES")
                        },
                        onPress: function() {
                            var data = {
                                idUser: _self.loggedUser.id,
                                searchParams: {},
                                counter: {
                                    official: true
                                }
                            };
                            _self.coreServices.libraryOptions.renderType = type;
                            _self.coreServices.libraryOptions.dataType[_self.coreServices.libraryOptions.renderType].text = "OFFICIAL";
                            _self.coreServices.renderAccordionFiles(data);
                        }
                    });
                } else if (type === "PANEL") {
                    accordionData.accordion.splice(1, 0, {
                        customTitle: {
                            name: "core.views.TimpLibrary.libraryAccordionTitle",
                            data: {
                                title: i18n("SETTING"),
                                iconFont: "Display-and-Setting",
                                icon: "gear",
                                number: 0,
                                label: i18n("SETTING")
                            }
                        },
                        identifier: "setting-panel-" + _text[type].identifier,
                        tooltip: {
                            position: "right",
                            class: "dark",
                            text: _text[type].tooltip + i18n("SETTING")
                        },
                        onPress: function() {
                            var data = {
                                idUser: _self.loggedUser.id,
                                searchParams: {},
                                counter: {
                                    official: true
                                }
                            };
                            _self.coreServices.libraryOptions.renderType = type;
                            _self.coreServices.libraryOptions.dataType[_self.coreServices.libraryOptions.renderType].text = "SETTING";
                            _self.coreServices.renderAccordionFiles(data);
                            _self.coreServices.renderToolbar();
                        }
                    });
                    accordionData.accordion.splice(1, 0, {
                        customTitle: {
                            name: "core.views.TimpLibrary.libraryAccordionTitle",
                            data: {
                                title: i18n("JUSTIFICATION"),
                                iconFont: "Communication",
                                icon: "messagelight",
                                number: 0,
                                label: i18n("JUSTIFICATION")
                            }
                        },
                        identifier: "justify-panel-" + _text[type].identifier,
                        tooltip: {
                            position: "right",
                            class: "dark",
                            text: _text[type].tooltip + i18n("JUSTIFICATION")
                        },
                        onPress: function() {
                            var data = {
                                idUser: _self.loggedUser.id,
                                searchParams: {},
                                counter: {
                                    official: true
                                }
                            };
                            _self.coreServices.libraryOptions.renderType = type;
                            _self.coreServices.libraryOptions.dataType[_self.coreServices.libraryOptions.renderType].text = "JUSTIFY";
                            _self.coreServices.renderAccordionFiles(data);
                            _self.coreServices.renderToolbar();
                        }
                    });
                }
            }
            _self.coreServices.spedType = 1;
            _self.accordionCtrl[type] = target.bindBaseAccordion(accordionData);
        };
        _self.coreServices.updateSPEDCounter = function(type, amount) {
            var itemEFDICMSIPI = $($("[identifier='accordion-item-efd-icmsipi']").find(".value")[0]);
            var itemICMSIPI = $("[identifier='accordion-item-icmsipi']").find(".value");
            var itemICMSIPICalculationBlocks = $("[identifier='accordion-item-icmsipi-calculationBlocks']").find(".value");
            var itemContributions = $("[identifier='accordion-item-contributions']").find(".value");
            var itemECD = $("[identifier='accordion-item-ecdItem']").find(".value");
            var itemECF = $("[identifier='accordion-item-ecfItem']").find(".value");
            var itemSCANC = $("[identifier='accordion-item-scanc']").find(".value");
            switch (type) {
                case 1:
                    itemEFDICMSIPI.text(parseInt(itemEFDICMSIPI.text(), 10) + amount);
                    itemICMSIPI.text(parseInt(itemICMSIPI.text(), 10) + amount);
                    itemICMSIPICalculationBlocks.text(parseInt(itemICMSIPICalculationBlocks.text(), 10) + amount);
                    break;
                case 2:
                    itemContributions.text(parseInt(itemContributions.text(), 10) + amount);
                    break;
                case 3:
                    itemECD.text(parseInt(itemECD.text(), 10) + amount);
                    break;
                case 4:
                    itemECF.text(parseInt(itemECF.text(), 10) + amount);
                    break;
                case 5:
                    itemSCANC.text(parseInt(itemSCANC.text(), 10) + amount);
                    break;
            }
        };
        _self.coreServices.updateSPEDCount = function(counter) {
            var itemEFDICMSIPI = $($("[identifier='accordion-item-efd-icmsipi']").find(".value")[0]);
            var itemICMSIPI = $("[identifier='accordion-item-icmsipi']").find(".value");
            var itemICMSIPICalculationBlocks = $("[identifier='accordion-item-icmsipi-calculationBlocks']").find(".value");
            var itemContributions = $("[identifier='accordion-item-contributions']").find(".value");
            var itemECD = $("[identifier='accordion-item-ecdItem']").find(".value");
            var itemECF = $("[identifier='accordion-item-ecfItem']").find(".value");
            var itemSCANC = $("[identifier='accordion-item-scanc']").find(".value");
            var itemS1070 = $("[identifier='accordion-item-e-social']").find(".value");
            if (counter) {
                for (var i = 0; i < counter.length; i++) {
                    switch (counter[i][0]) {
                        case 1:
                            console.log(itemEFDICMSIPI)
                            itemEFDICMSIPI.text(parseInt(counter[i][2] * 2, 10));
                            itemICMSIPI.text(parseInt(counter[i][2], 10));
                            itemICMSIPICalculationBlocks.text(parseInt(counter[i][2], 10));
                            break;
                        case 2:
                            console.log(itemContributions)
                            itemContributions.text(parseInt(counter[i][2], 10));
                            break;
                        case 3:
                            itemECD.text(parseInt(counter[i][2], 10));
                            break;
                        case 4:
                            itemECF.text(parseInt(counter[i][2], 10));
                            break;
                        case 5:
                            itemSCANC.text(parseInt(counter[i][2], 10));
                            break;
                        case 6:
                            var s1070InsertCount = parseInt(counter[i][1], 10);
                            var s1070AlterCount = parseInt(counter[i][2], 10);
                            var s1070ExcludeCount = parseInt(counter[i][3], 10);
                            var s1070Count = s1070InsertCount + s1070AlterCount + s1070ExcludeCount;
                            itemS1070.text(s1070Count);
                            $("[identifier='accordion-item-e-social']").find('.value').text(s1070Count);
                            $("[identifier='accordion-item-s1070-insert']").find('.value').text(s1070InsertCount);
                            $("[identifier='accordion-item-s1070-alter']").find('.value').text(s1070AlterCount);
                            $("[identifier='accordion-item-s1070-delete']").find('.value').text(s1070ExcludeCount);
                            break;
                    }
                }
            }
        };
        _self.coreServices.updateFileCount = function(renderType, data, index) {
            var type = _self.coreServices.libraryOptions.renderType;
            var myFilesCounter = _self.accordionCtrl[type].getCount("my-" + renderType);
            if (data.public) {
                var publicCounter = _self.accordionCtrl[type].getCount("public-" + renderType);
                if (index !== undefined) {
                    _self.accordionCtrl[type].setCount("public-" + renderType, publicCounter + index);
                } else {
                    _self.accordionCtrl[type].setCount("public-" + renderType, data.public);
                }
            }
            if (data.official) {
                var officialCounter = _self.accordionCtrl[type].getCount("official-" + renderType);
                if (index !== undefined) {
                    _self.accordionCtrl[type].setCount("official-" + renderType, officialCounter + index);
                } else {
                    _self.accordionCtrl[type].setCount("official-" + renderType, data.official);
                }
            }
            if (data.standard) {
                var standardCounter = _self.accordionCtrl[type].getCount("standard-" + renderType);
                if (index !== undefined) {
                    _self.accordionCtrl[type].setCount("standard-" + renderType, standardCounter + index);
                } else {
                    _self.accordionCtrl[type].setCount("standard-" + renderType, data.standard);
                }
            }
            var totalCount = 0;
            if (data.favorite) {
                var favoriteCounter = _self.accordionCtrl[type].getCount("favorite-" + renderType);
                if (index !== undefined) {
                    _self.accordionCtrl[type].setCount("favorite-" + renderType, favoriteCounter + index);
                    totalCount += parseInt(favoriteCounter, 10) + parseInt(index, 10);
                } else {
                    _self.accordionCtrl[type].setCount("favorite-" + renderType, data.favorite);
                    totalCount += parseInt(data.favorite, 10);
                }
            }
            if (data.shared) {
                var sharedCounter = _self.accordionCtrl[type].getCount("shared-" + renderType);
                if (index !== undefined) {
                    _self.accordionCtrl[type].setCount("shared-" + renderType, sharedCounter + index);
                    totalCount += sharedCounter + parseInt(index, 10);
                } else {
                    _self.accordionCtrl[type].setCount("shared-" + renderType, data.shared);
                    totalCount += parseInt(data.shared, 10);
                }
            }
            _self.accordionCtrl[type].setCount("my-" + renderType, totalCount);
            if (data.trash) {
                var trashCounter = $("[identifier='accordion-item-trash-" + renderType + "']").find(".value");
                if (index !== undefined) {
                    trashCounter.text(parseInt(trashCounter.text(), 10) + index);
                } else {
                    trashCounter.text(data.trash);
                }
            }
            if (data.setting) {
                var settingCounter = _self.accordionCtrl[type].getCount("setting-panel-" + renderType);
                if (index !== undefined) {
                    _self.accordionCtrl[type].setCount("setting-panel-" + renderType, settingCounter + index);
                } else {
                    _self.accordionCtrl[type].setCount("setting-panel-" + renderType, data.setting);
                }
            }
            if (data.justify) {
                var justifyCounter = $("[identifier='accordion-item-justify-panel-" + renderType + "']").find(".value");
                if (index !== undefined) {
                    justifyCounter.text(parseInt(justifyCounter.text(), 10) + index);
                } else {
                    justifyCounter.text(data.justify);
                }
            }
        };
        _self.coreServices.renderFolderTree = function(renderType) {
            $(_self.coreServices.libraryOptions.dataType[_self.coreServices.libraryOptions.renderType].folderTreeTarget).empty();
            _self.coreServices.folders[renderType] = $(_self.coreServices.libraryOptions.dataType[_self.coreServices.libraryOptions.renderType].folderTreeTarget)
                .bindBaseFolderTree({
                    objectType: (renderType !== "AN4" && renderType !== "AN3") ? "DFG::" + renderType.toUpperCamelCase() : "DFG::" + renderType,
                    text: (renderType !== "AN4" && renderType !== "AN3") ? i18n(renderType + "S") : (renderType === "AN4" ? i18n("AN4") : i18n("AN3")),
                    onClickFolder: function(id) {
                        if (id === 0) {
                            return;
                        }
                        if (_self.coreServices.libraryOptions.dataType[_self.coreServices.libraryOptions.renderType].text === "TRASH" || _self.coreServices
                            .libraryOptions.dataType[_self.coreServices.libraryOptions.renderType].text === "SETTING") {
                            _self.coreServices.libraryOptions.dataType[renderType].text = "FOLDER";
                            _self.coreServices.renderToolbar();
                        } else {
                            _self.coreServices.libraryOptions.dataType[renderType].text = "FOLDER";
                        }
                        _self.coreServices.libraryOptions.dataType[renderType].idFolder = id;
                        _self.coreServices.renderAccordionFiles({
                            idFolder: id
                        });
                    },
                    shared: true
                });
            console.log("@_self.coreServices.libraryOptions.renderType", _self.coreServices.libraryOptions.renderType);
            _self.coreServices.libraryOptions.dataType[_self.coreServices.libraryOptions.renderType].loadedFolders = true;
            _self.coreServices.renderingFolderTree = false;
        };
    },
    bindElements: function() {
        var _self = this;
        console.log(Object.keys(_self.coreServices.libraryOptions.dataType))
        var actualTab = Object.keys(_self.coreServices.libraryOptions.dataType).indexOf(_self.coreServices.libraryOptions.renderType);
        console.log("@actualTab", actualTab)
        _self._view.tabs.bindBaseTabs({
            tab: [{
                title: i18n("LAYOUTS"),
                viewName: "app.views.library.tabLayouts",
                tooltip: i18n("TAB LAYOUTS TOOLTIP")
            }, {
                title: i18n("SETTINGS"),
                viewName: "app.views.library.tabSettings",
                tooltip: i18n("TAB SETTINGS TOOLTIP")
            }, {
                title: i18n("FILES"),
                viewName: "app.views.library.tabExecuted",
                tooltip: i18n("TAB FILE TOOLTIP")
            }, {
                title: i18n("SPED"),
                viewName: "app.views.library.tabSPED",
                tooltip: i18n("TAB SPED TOOLTIP")
            }, {
                title: "AN3",
                viewName: "app.views.library.tabAN3",
                tooltip: i18n("TAB AN3 TOOLTIP")
            }, {
                title: "AN4",
                viewName: "app.views.library.tabAN4",
                tooltip: i18n("TAB AN4 TOOLTIP")
            }, {
                title: i18n("PANEL"),
                viewName: "app.views.library.tabPanel",
                tooltip: i18n("TAB PANEL TOOLTIP")
            }],
            type: "boxes",
            onChange: function(element, index) {
                console.log("@index", index);
                _self.coreServices.openFilter(true);
                if (_self.coreServices.renderingFolderTree) {
                    return;
                }
                if (_self.coreServices.clearFilters) {
                    _self.coreServices.clearFilters(true);
                }
                switch (index) {
                    case 0:
                        _self.coreServices.libraryOptions.renderType = "LAYOUT";
                        _self.coreServices.orderBy = undefined;
                        break;
                    case 1:
                        _self.coreServices.libraryOptions.renderType = "SETTING";
                        break;
                    case 2:
                        _self.coreServices.libraryOptions.renderType = "DIGITAL FILE";
                        _self.coreServices.orderBy = undefined;
                        break;
                    case 3:
                        _self.coreServices.libraryOptions.renderType = "SPED";
                        break;
                    case 4:
                        _self.coreServices.libraryOptions.renderType = "AN3";
                        break;
                    case 5:
                        _self.coreServices.libraryOptions.renderType = "AN4";
                        break;
                    case 6:
                        _self.coreServices.libraryOptions.renderType = "PANEL";
                        break;
                }
                if (index === 3) {
                    var data = {
                        type: 1,
                        subType: "spedFile",
                        status: 1,
                        getFiltersData: _self.coreServices.spedFilters !== undefined ? false : true,
                        counter: _self.coreServices.spedCounter !== undefined ? false : true
                    };
                    if (_self.coreServices.libraryOptions.displayType === "LIST") {
                        data.number = 1;
                    }
                    if (_self.coreServices.searchKeysSPED) {
                        data.searchKeys = _self.coreServices.searchKeysSPED;
                    }
                    _self.coreServices.getSPEDData(data);
                } else {
                    _self.coreServices.renderAccordionFiles({
                        counter: true
                    });
                    _self.coreServices.libraryOptions.dataType[_self.coreServices.libraryOptions.renderType].text = "FAVORITE";
                    _self.coreServices.libraryOptions.dataType[_self.coreServices.libraryOptions.renderType].idFolder = -1;
                    if (!_self.coreServices.libraryOptions.dataType[_self.coreServices.libraryOptions.renderType].loadedFolders) {
                        _self.coreServices.renderingFolderTree = true;
                        _self.coreServices.renderFolderTree(_self.coreServices.libraryOptions.renderType);
                    }
                }
                console.log(_self.coreServices.libraryOptions.renderType)
                _self.coreServices.renderToolbar();
            }
        }).setSelectedTab(actualTab, true);
		let privs = ['layout', 'setting', 'digitalFile', 'sped', 'an3', 'an4', 'panel'];
		_.forEach(this.privileges, function(priv, key) {
            let privIndex = privs.indexOf(key);
            if (privIndex !== -1) {
                let hasSped = key === 'sped' && (priv.readEFDICMSIPI || priv.readEFDContributions || priv.readECD || priv.readECF || priv.readSCANC);
                if (!priv.read && !hasSped) {
                    _self._view.tabs.find('.baseTabs-box').eq(privIndex).hide();
                }
            }
        });
        _self._view.tabs.find('.baseTabs-box').eq(0).show();
        console.log("@renderType", _self.coreServices.libraryOptions.renderType)
        _self.coreServices.renderFolderTree(_self.coreServices.libraryOptions.renderType);
        $(".leftContent-wrapper .version").text("v." + this.componentVersion);
    }
});