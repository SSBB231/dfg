/*global i18n*/
sap.ui.controller("app.controllers.editor.Exhibition", {
    onInit: function() {},
    onAfterRendering: function() {
        var _self = this;
        this.services = {
            //Initializing services to comunicate between controllers
            layoutObject: {},
            processMessages: function(response) {
                var toastMessage = {};
                if (response.hasOwnProperty("messageCodes") && response.messageCodes.length > 0) {
                    toastMessage.text = i18n[response.messageCodes[response.messageCodes.length - 1].code];
                    switch (response.messageCodes[response.messageCodes.length - 1].type) {
                        case 'S':
                            toastMessage.isSuccess = true;
                            break;
                        case 'W':
                            toastMessage.isWarning = true;
                            break;
                        case 'E':
                            toastMessage.isError = true;
                            break;
                        default:
                            toastMessage.isError = true;
                    }
                    $.baseToast(toastMessage);
                } else {
                    $.baseToast({
                        text: i18n('DFG02001'),
                        isError: true
                    });
                }
            }
        };
        let processViews = function() {
            let View = sap.ui.view;
            var view = new View({
                viewName: "app.views.editor.leftContent",
                type: sap.ui.core.mvc.ViewType.HTML
            });
            var view2 = new View({
                viewName: "app.views.editor.floatingPanel",
                type: sap.ui.core.mvc.ViewType.HTML
            });
            var view3 = new View({
                viewName: "app.views.editor.rightContent",
                type: sap.ui.core.mvc.ViewType.HTML
            });
            $('#left-content').empty();
            $('#floating-wrapper').empty();
            $('#right-content').empty();
            var l = $('#left-content').bindView(view, {});
            var f = $('#floating-wrapper').bindView(view2, {});
            var r = $('#right-content').bindView(view3, {});
            _self.view = {
                leftContent: {
                    getController: function() {
                        return l.ctrl;
                    }
                },
                floating: {
                    getController: function() {
                        return f.ctrl;
                    }
                },
                rightContent: {
                    getController: function() {
                        return r.ctrl;
                    }
                }
            };
        };
        $.globalFunctions = sap.ui.controller("app.controllers.dfgExecutor.globalFunctions");
        $.blockBuilder = sap.ui.controller("app.controllers.editor.blockBuilder.blockBuilder");
        if (window.location.hash.indexOf('exhibition') !== -1) {
            _self.coreServices.edition = false;
            _self.coreServices.exhibition = true;
            processViews();
            $('#left-content').parent().hide();
        } else {
            _self.getLock({
                objectType: 'DFG::Layout',
                id: window.parameters.id,
                callback: function(_data) {
                    _self.coreServices.edition = true;
                    _self.coreServices.exhibition = false;
                    if (_data.response === false) {
                        window.location.hash = "/library";
                    } else {
                        _self.coreServices.lock = _data.controller;
                        processViews();
                    }
                }
            });
        }
    }
});