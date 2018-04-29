sap.ui.controller("app.controllers.editor.Outputs", {

    onBeforeRendering: function(htmlToRender) {
        return htmlToRender;
    },

    onAfterRendering: function(renderedTarget) {
        var _self = this;
        var _data = _self.getData();
        _self._view = $(renderedTarget);
        _self.textarea = $('textarea');
        _self.renderElements();
    },

    renderElements: function() {
        var _self = this;
        var _data = _self.getData();
        setTimeout(function() {
            $(".output-browser").bind('dblclick', function(event) {
                if (_data.isTCCOutputs) {
                    _self.textarea.val(_self.textarea.val() + '<' + _data.outputs[$(this).data().id].label + ">");
                } else {
                    if (_data.isBCBOutput) {
                        _self.textarea.val(_self.textarea.val() + '|' + _data.outputs[$(this).data().id].label + "|");
                    } else if (_data.isBFBOutput) {
                        _self.textarea.val(_self.textarea.val() + '$' + _data.outputs[$(this).data().id].label + "$");
                    } else {
                        _self.textarea.val(_self.textarea.val() + '[' + _data.outputs[$(this).data().id].label + "]");
                    }
                }

                _self.coreServices.validate(_self.textarea.val());
            });
        }, 300);
    }
});
