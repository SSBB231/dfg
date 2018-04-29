sap.ui.controller("app.controllers.vieweran3.rightContent", {
    onInit: function() {},
    onDataRefactor: function(data) {
        return $.extend(data, this.data);
    },
    onAfterRendering: function(html) {
        var _self = this;
        $(".right-content").css("overflow-y", "hidden");
        $("#overlapRight").hide();
        _self.view = $(html);
        _self.view.toolbar = _self.view.find("#toolbarTop");
        _self.view.executorWrapper = _self.view.find(".visualize-wrapper");
        _self.page = _self.view.find(".bfbContainer-container");
        _self.view.paginator = _self.view.find(".paginator");
        _self.loader = _self.view.find(".bfbContainer-container").baseLoader({
            modal: true
        });
        _self.view.paginator.ctrl = _self.view.paginator.bindBasePaginator({
            totalPages: 1,
            actualPage: 1,
        });
        _self.renderToolbar();
        _self.loader.open();
        _self.addServices();
        Data.endpoints.dfg.an3.read.post({
            id: window.parameters.id,
            visualize: true
        }).success(function(data) {
            _self.an3 = data;
            _self.layoutJSON = JSON.parse(data.layoutVersion.json);
            _self.structure = {};
            var tempFields;
            data.structure.map(function(s) {
                _self.structure[s.id] = JSON.parse(s.structure);
                tempFields = {};
                _self.structure[s.id].fields.map(function(f) {
                    tempFields[f.ID] = f;
                });
                _self.structure[s.id].fields = tempFields;
            });
            data.bfbLayout[0].json = JSON.parse(data.bfbLayout[0].json);
            _self.form = _self.page.bindForm({
                services: _self.coreServices,
                form: data.bfbLayout[0] ? data.bfbLayout[0] : {
                    json: {
                        blockFields: [],
                        paperSettings: {
                            gridSize: 0.2,
                            hideGrid: false,
                            hideRuler: false,
                            margin: {
                                top: 1,
                                left: 1,
                                right: 1,
                                bottom: 1
                            },
                            paperSize: "A4",
                            unit: 'cm',
                            orientation: "VER",
                            blockFieldOrigin: 1
                        }
                    }
                }
            });


            _self.abas();
            setTimeout(function() {
                _self.loader.close();
            }, 2000);

        }).error(function(data) {
            window.location = "#/library";
        });

    },
    addServices: function() {
        var _self = this;
    },
    renderToolbar: function() {
        var _self = this;
        var visualizeBtn = {
            text: i18n("VISUALIZE"),
            onPress: _self.visualize.bind(_self),
            isButton: true,
            iconFont: "Sign-and-Symbols",
            icon: "magnifier",
            enabled: _self.privileges.an3.visualize
        };
        var printBtn = {
            text: i18n("PRINT"),
            onPress: _self.print.bind(_self),
            isButton: true,
            iconFont: "Finance-and-Office",
            icon: "Printer",
            enabled: false,
            tooltip: i18n("PRINT TOOLTIP")
        };
        var settingPanelBtn = {
            text: i18n("SETTINGS"),
            onPress: _self.openSettingPanel.bind(_self),
            isButton: true,
            iconFont: "Display-and-Setting",
            icon: "setting",
            enabled: true,
            tooltip: i18n("SETTING TAB TOOLTIP")
        };
        var leftButtons = [visualizeBtn, settingPanelBtn, printBtn];
        var rightButtons = [{
            text: i18n("GO TO LIBRARY"),
            onPress: function() {
                _self.goToLibrary();
            },
            isButton: true,
            enabled: true,
            "class": "nav-button",
            iconFont: "Sign-and-Symbols",
            icon: "toleft",
            tooltip: i18n("GO TO LIBRARY TOOLTIP")
        }];

        _self.view.toolbar.ctrl = _self.view.toolbar.bindBaseLibraryToolbar({
            leftButtons: leftButtons,
            rightButtons: rightButtons,
            hideGrid: true
        });

    },
    openSettingPanel: function() {
        var _self = this;
        _self.openExecuteLateral();
    },
    visualize: function() {
        var _self = this;
        _self.loader.open();
        Data.endpoints.dfg.an3.visualize.post({
            idLayoutVersion: _self.an3.idLayoutVersion,
            origin: _self.an3.origin,
            idDigitalFile: _self.an3.idDigitalFile,
            idExternalFile: _self.an3.idExternalFile,
            idBFBLayout: _self.an3.bfbLayout[0].id
        }).success(function(data) {
            _self.loader.close();
           // _self.view.toolbar.ctrl.enableButton(2);
            _self.pages = data;
            _self.view.paginator.empty();
            _self.view.paginator.ctrl = _self.view.paginator.bindBasePaginator({
                totalPages: Object.keys(_self.pages).length,
                actualPage: 1,
                onPageChange: _self.onPageChange.bind(_self)
            });
      
            _self.onPageChange(0, 1);
        }).error(function(data) {
            _self.loader.close();
        });
    },
    onPageChange: function(lastpage, actualpage) {
        var _self = this;
        var renderPage = _self.pages[actualpage - 1];
        if (renderPage) {
            _self.form.setPageData(renderPage);
        } else {
            $.baseToast({
                type: "w",
                text: i18n("NO RESULTS")
            });
        }
    },
    print: function() {
        var _self = this;
        var page = document.createElement("div");
        var form = $(page).bindForm({
            services: _self.coreServices,
            form: data.bfbLayout[0] ? data.bfbLayout[0] : {
                json: {
                    blockFields: [],
                    paperSettings: {
                        gridSize: 0.2,
                        hideGrid: false,
                        hideRuler: false,
                        margin: {
                            top: 1,
                            left: 1,
                            right: 1,
                            bottom: 1
                        },
                        paperSize: "A4",
                        unit: 'cm',
                        orientation: "VER",
                        blockFieldOrigin: 1
                    }
                }
            }
        });

        function convertImgToBase64(img, width, height) {
            var canvas = document.createElement('CANVAS');
            var ctx = canvas.getContext('2d');

            canvas.height = height;
            canvas.width = width;
            ctx.drawImage(img, 0, 0, width, height);

            var dataURL = canvas.toDataURL('image/png');
            canvas = null;
            return dataURL;
        }

        var canvax = $('canvas');
        if (canvax.length >= 1) {
            for (var i = 0; i < canvax.length; i++) {
                var img = canvax[i].toDataURL('image/png');
                $(canvax[i]).replaceWith('<img src="' + img + '"/>')
            }
        }
        for (var i = 0; i < _self.pages.length; i++) {
            var images = _self.page.find(".form-wrapper").find('img.tool');
            if (images.length) {
                for (var i = 0; i < images.length; i++) {
                    $(images[i]).replaceWith('<img src="' + convertImgToBase64(images[i], $(images[i]).width(), $(images[i]).height()) + '"/>')
                }
            }
           
        }


        _self.page.find(".form").print();

    },
    goToLibrary: function() {
        window.location = "#/library/";
    },
    // setting's executor lateral panel (ew)
    openExecuteLateral: function() {

        var _self = this;
        var noMapConfig = false;
        $("#settings-close").prop('tabindex', 0);
        $("#settings-execute").prop('tabindex', 0);
        $("#overlapRight").removeClass("novisible").addClass("visible");
        $("#overlapRight").show();
        disableBackTabIndex('.library-toolbar-items-right');
        enableBackTabIndex($("#overlapRight"));
        $("#executarArquivo .title #settings-close button").on("click", function() {
            _self.closeButtonClick();
            disableBackTabIndex($("#overlapRight"));
            enableBackTabIndex($('.library-toolbar-items-right'));
            $("#overlapRight").hide();

        });
        $("#settings-close").on('keydown', function() {

            var keyPressed = event.keyCode || event.which;

            if (keyPressed == 13) {
                _self.closeButtonClick();
                disableBackTabIndex($("#overlapRight"));
                $("#overlapRight").hide();
            };
        });

        $("#executarArquivo .footer #settings-reset").hide();

        $("#executarArquivo .footer #settings-execute button").hide();
        $(".input-an3").hide();
    },
    abas: function() {
        var _self = this;
        _self.coreServices.allVersionData = {
            idCompany: _self.an3.idCompany,
            idBranch: _self.an3.idBranch,
            uf: _self.an3.uf,
            idTax: [_self.an3.taxInfo],
            subperiod: _self.an3.subperiod,
            month: _self.an3.month,
            year: _self.an3.year
        };
        $(_self.loader._mask).css("background-color", "rgba(255, 255, 255, 0.4)");
        $(_self.loader._mask).find(".base-loader").css("visibility", "hidden");
        _self.tabController = $("#settings-tabs").bindBaseTabs({
            tab: [{
                title: i18n("GENERAL PARAMS"),
                icon: "gear",
                iconColor: "white",
                iconFont: "Display-and-Setting",
                viewName: "app.views.dialogs.executarArquivo",
                tooltip: i18n("GENERAL PARAMETER TOOLTIP"),
                viewData: { eefiInfo: _self.eefiInfo }
            }],
            type: "boxes",
            wrapperClass: "wrapperClass"
        });

    },
    closeExecuteLateral: function() {
        $("#overlapRight").removeClass("visible").addClass("novisible");
    },
    closeButtonClick: function() {
        var _self = this;
        $(_self.loader._mask).css("background-color", "");
        $(_self.loader._mask).find(".base-loader").css("visibility", "visible");
        _self.closeExecuteLateral();

    }

});
