sap.ui.controller("app.controllers.executorSPED.variant", {
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
        _self.view.name = _self.view.find(".name");
        _self.view.description = _self.view.find("#textareaDescription");
        _self.bindElements();
    },
    bindElements: function() {
        var _self = this;
        _self.view.name.ctrl = _self.view.name.bindBaseInput({
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
    validateVariant: function(){
    	var _self = this;
    	if(_self.view.name.ctrl.getText() === ""){
    		return false; 
    	}
    	return true;
    },
    getVariantData: function(){
    	var _self = this;
    	return {
    		name: _self.view.name.ctrl.getText(),
    		DESCRIPTION: _self.view.description.ctrl.val()
    	}
    }

})
