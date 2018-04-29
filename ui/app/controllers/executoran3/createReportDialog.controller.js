sap.ui.controller("app.controllers.executoran3.createReportDialog", {
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
        _self.view = $(html);
        _self.view.name = _self.view.find(".name-input");
        _self.view.description = _self.view.find("#textareaDescription");
        _self.bindElements();
    },
    bindElements: function() {
        var _self = this;
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
    },
    validate: function() {
        var _self = this;
        var isValid = true;
        isValid = _self.view.name.ctrl.validate();
        return isValid;
    },
    getItem: function() {
    	var _self = this;
    	var item = {
    		name: _self.view.name.ctrl.getText(),
    		description: _self.view.description.ctrl.val()
    	};
    	return item;
    }
});
