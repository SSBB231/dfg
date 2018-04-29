sap.ui.controller("app.controllers.library.dialogs.NewVersion", {
	onInit: function() {
	},

	onDataRefactor: function(data) {
        return $.extend(data, this.data);
    },

	onAfterRendering: function(html) {
		var _self = this;
		_self.services = _self.getData().services;
		_self.versionNameValid = true;
		_self.dateValid = true;
		_self.inputDescription = html.find('#inputDescription');
		//_self.versionData = _self.services.layoutObject.versionData;
		_self.initInputs();
		_self.initData();
	},
	initInputs: function(){
		var _self = this;
		// console.log('init inputs')
		_self.inputValidFrom = $('#inputValidFrom').bindBaseDatePicker({
			required: true,
			errorMsg: i18n('DFG101010'),
			tooltip: i18n('VALID ON TOOLTIP')
		});
		_self.inputValidTo = $('#inputValidTo').bindBaseDatePicker({
			errorMsg: i18n('DFG101010'),
			tooltip: i18n('VALID ON TOOLTIP')
		});
		_self.inputLayoutVersion = $('#inputLayoutVersion').bindBaseInput({
			validatorType: 2,
			errorMsg: i18n('DFG101011'),
			validator: function(value) {
				return _self.versionNameValid;
			},
			tooltip: i18n('VERSION INPUT TOOLTIP')
		});
		_self.inputTimpVersion = $('#inputTimpVersion').bindBaseInput({
			validatorType: 2,
			errorMsg: i18n('DFG101011'),
			validator: function(value) {
				return _self.versionNameValid;
			},
			tooltip: i18n('TIMP VERSION INPUT TOOLTIP')
		});
		_self.inputOpen = $('#inputOpen').bindBaseCheckbox({
			id: "idChkOpen", 
			text: i18n('OPEN'),
			onChange: function(oldVal, newVal){
				if(newVal){
					_self.inputValidTo.setDate('');
					// _self.inputValidTo.disable();
				}else{
					// _self.inputValidTo.enable();
				}
			},
			tooltip: i18n('OPEN CHECKBOX TOOLTIP')
		});
		_self.inputDescription.attr('tabindex', '0');
		_self.inputDescription.baseTooltip({
			class: 'dark',
			position: 'top',
			text: i18n('VERSION DESCRIPTION TOOLTIP')
		});
	},
	getOwnData: function(){
		var _self = this;
		var returnObject = {};
		returnObject.legalVersion = _self.inputLayoutVersion.getText();
		returnObject.timpVersion = _self.inputTimpVersion.getText();
		returnObject.versionDescription = _self.inputDescription.val();
		returnObject.validFrom = _self.inputValidFrom.getDate();
		if(returnObject.validFrom){
			returnObject.validFrom = _self.inputValidFrom._jsonToDate(returnObject.validFrom);
			returnObject.validFrom = returnObject.validFrom.replace(/^(\d{2})\/(\d{2})\/(\d{4})$/,'$3-$2-$1');
		}
		returnObject.validTo = _self.inputValidTo.getDate();
		if(returnObject.validTo){
			returnObject.validTo = _self.inputValidTo._jsonToDate(returnObject.validTo);
			returnObject.validTo = returnObject.validTo.replace(/^(\d{2})\/(\d{2})\/(\d{4})$/,'$3-$2-$1');
		}else{
			returnObject.validTo = '9999-12-31';
		}
		var validateDate = {};
		validateDate.idLayout = _self.getData().idLayout;
		validateDate.validFrom = returnObject.validFrom;
		validateDate.validTo = returnObject.validTo;

		var validateVersion = {};
		validateVersion.idLayout = _self.getData().idLayout;
		validateVersion.timpVersion = returnObject.timpVersion;
		validateVersion.legalVersion = returnObject.legalVersion;
		Data.endpoints.verifyDateVersion.post(validateDate).success(function(serviceData) {
			// console.log('Validou', serviceData);
			if(serviceData){
				_self.inputValidFrom.isValid();
				_self.inputValidTo.isValid();
			}
		}).error(function(d, m, s, xhr){
		});
		Data.endpoints.verifyVersionName.post(validateVersion).success(function(serviceData) {
			// console.log('validou name', serviceData)
			if(serviceData){
				_self.versionNameValid = false;
				_self.inputLayoutVersion.validate();
				_self.inputTimpVersion.validate();
			}else{
				_self.versionNameValid = true;
				_self.inputLayoutVersion.validate();
				_self.inputTimpVersion.validate();
			}
		}).error(function(d, m, s, xhr){
		});
		if(returnObject.validFrom){
			return returnObject;
		}else{
			return null;
		}
		// console.log(_self.services, _self.getData().idLayout);
	},
	initData: function(){
		// var _self = this;
		
		// if(_self.versionData.legalVersion){
		// 	_self.inputTimpVersion.setText(_self.versionData.legalVersion);
		// }
		// if(_self.versionData.timpVersion){
		// 	_self.inputLayoutVersion.setText(_self.versionData.timpVersion);
		// }
		// if(_self.versionData.versionDescription){
		// 	_self.inputDescription.val(_self.versionData.versionDescription);
		// }
		// var dateVal = "";
		
		// if(_self.versionData.validFrom){
		// 	if(_self.versionData.validFrom.length != 10){
		// 		dateVal = Date.toBaseDate(_self.versionData.validFrom);
		// 	}else{
		// 		dateVal = _self.versionData.validFrom;
		// 	}
		// 	_self.inputValidFrom.setDate(_self.inputValidFrom._dateToJson(dateVal));
			
		// }
		// if(_self.versionData.validTo){
		// 	if(_self.versionData.validTo.length != 10){
		// 		dateVal = Date.toBaseDate(_self.versionData.validTo);
		// 	}else{
		// 		dateVal = _self.versionData.validTo;
		// 	}
		// 	_self.inputValidTo.setDate(_self.inputValidTo._dateToJson(dateVal));
		// }
	}
});
