/*global i18n*/
sap.ui.controller("app.controllers.dialogs.editFixedManualField", {
	onInit: function() {

	},
	onDataRefactor: function(data) {

	},
	onAfterRendering: function(html) {
		var _self = this;
		_self.view = $(html);
		_self.view.editOptionInput = _self.view.find(".edit-option-input");
		_self.view.editDescriptionInput = _self.view.find(".edit-description-input");
		_self.view.editLengthInput = _self.view.find(".edit-length-input");
		_self._bindEditOptionDescription();
	},
	_bindEditOptionDescription: function() {
		var _self = this;
		var data = _self.getData();

		_self.view.editOptionInput.ctrl = _self.view.editOptionInput.bindBaseInputKat({
			tooltip: i18n("ADD OPTION VALUE PLACEHOLDER"),
			label: i18n("OPTION")+":",
			placeholder: i18n("ADD OPTION VALUE PLACEHOLDER"),
			errorMsg: i18n("INVALID LENGTH"),
		});
		_self.view.editOptionInput.ctrl.setText(data.option);

		_self.view.editDescriptionInput.ctrl = _self.view.editDescriptionInput.bindBaseInputKat({
			tooltip: i18n("OPTION DESCRIPTION"),
			label: i18n("OPTION DESCRIPTION LABEL")+":",
			placeholder: i18n("OPTION DESCRIPTION"),
			errorMsg: i18n("INVALID LENGTH"),
		});
		_self.view.editDescriptionInput.ctrl.setText(data.description);
		_self.view.editLengthInput.ctrl = _self.view.editLengthInput.bindBaseInputKat({
		    label: i18n("CHARACTERS")+":",
			tooltip: i18n("OPTION DESCRIPTION LENGTH"),
			placeholder: i18n("OPTION DESCRIPTION LENGTH"),
			onChange: function(oldVal, newVal) {
				if (!isNaN(newVal) && newVal !== "") {
					_self.view.editLengthInput.ctrl.hideError();
					_self.view.editDescriptionInput.ctrl.input._input.attr('maxlength', newVal);
					if (_self.view.editDescriptionInput.ctrl.getText().length > parseInt(newVal, 10)) {
						_self.view.editDescriptionInput.ctrl.showError();
					} else {
						_self.view.editDescriptionInput.ctrl.hideError();
					}
				}else{
				    _self.view.editLengthInput.ctrl.showError();
				}
			}
		});
		_self.view.editLengthInput.ctrl.setText(data.descriptionLength || 150);
		_self.view.editOptionInput.ctrl.input._input.attr('maxlength', 12);
		_self.view.editDescriptionInput.ctrl.input._input.attr('maxlength', data.descriptionLength || 150);
	},
	validate: function(){
	    var _self = this;
	    if(isNaN(_self.view.editLengthInput.ctrl.getText()) || _self.view.editLengthInput.ctrl.getText() === ""){
	        $.baseToast({
	            type: "W",
	            text: i18n("FILL WITH A VALID LENGTH")
	        });
	        return false;
	    }
	    if(_self.view.editDescriptionInput.ctrl.getText().length > parseInt(_self.view.editLengthInput.ctrl.getText(),10)){
	        $.baseToast({
                  type: "W",
                  text: i18n("INVALID DESCRIPTION LENGTH")
              });
	        return false;
	    }
	    return true;
	},
	getOwnData: function() {
		var _self = this;

		var newOption = {
			option: _self.view.editOptionInput.ctrl.getText(),
			description: _self.view.editDescriptionInput.ctrl.getText(),
			descriptionLength: _self.view.editLengthInput.ctrl.getText()
		};
		return newOption;
	}

});