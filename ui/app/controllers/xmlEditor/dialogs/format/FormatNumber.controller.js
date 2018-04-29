sap.ui.controller("app.controllers.xmlEditor.dialogs.format.FormatNumber", {
	onInit: function() {

	},

	onDataRefactor: function(data) {
        return $.extend(data, this.data);
    },

	onAfterRendering: function(html) {
		var _self = this;
		_self.format = _self.getData().format;
		_self.initInputs();
		if(_self.getData().format){
			_self.initValues();
		}
	},
	initInputs: function(){
		var _self = this;
		_self.inputLength = $('.f-number .input-length').bindBaseInput({
			tooltip: i18n('LENGTH INPUT TOOLTIP'),
			placeholder : i18n('LENGTH')
		});
		_self.inputAlign = $('.f-number .input-align').bindBaseSelect({
			options: [{key: 0, name: i18n('LEFT')}, {key:1, name: i18n('RIGHT')}],
			tooltip: i18n('ALIGN SELECT TOOLTIP')
		});
		_self.inputFill = $('.f-number .input-fill').bindBaseInput({
			tooltip: i18n('COMPLEMENT INPUT TOOLTIP'),
			placeholder : i18n('FILL')
		});
		_self.inputSearchFor = $('.f-number .input-search-for').bindBaseInput({
			tooltip: i18n('REPLACE INPUT TOOLTIP'),
			placeholder : i18n('REPLACE')
		});
		_self.inputReplaceWith = $('.f-number .input-replace-with').bindBaseInput({
			tooltip: i18n('WITH INPUT TOOLTIP'),
			placeholder : i18n('WITH')
		});
		_self.inputDecimals = $('.f-number .input-decimals').bindBaseInput({
			tooltip: i18n('DECIMALS INPUT TOOLTIP'),
			placeholder : i18n('DECIMALS')
		});
		_self.inputDecimalSeparator = $('.f-number .input-decimal-separator').bindBaseInput({
			tooltip: i18n('DECIMALS SEPARATOR INPUT TOOLTIP'),
			placeholder : i18n('DECIMAL SEPARATOR PLACEHOLDER')
		});
		_self.inputThousandSeparator = $('.f-number .input-thousand-separator').bindBaseInput({
			tooltip: i18n('THOUSAND INPUT TOOLTIP'),
			placeholder : i18n('THOUSAND SEPARATOR PLACEHOLDER')
		});



		$('.btnClear').on('keydown', function(){
			 var keyPressed = event.keyCode || event.which;

              if (keyPressed==13) {
             		_self.inputLength.setText('');
					_self.inputAlign.setKey(0);
					_self.inputFill.setText('');
					_self.inputSearchFor.setText('');
					_self.inputReplaceWith.setText('');
					_self.inputDecimals.setText('');
					_self.inputDecimalSeparator.setText('');
					_self.inputThousandSeparator.setText('');              };
		});

		$('.btnClear').click(function(e){
			_self.inputLength.setText('');
			_self.inputAlign.setKey(0);
			_self.inputFill.setText('');
			_self.inputSearchFor.setText('');
			_self.inputReplaceWith.setText('');
			_self.inputDecimals.setText('');
			_self.inputDecimalSeparator.setText('');
			_self.inputThousandSeparator.setText('');
		});
	},
	initValues: function(){
		var _self = this;
		_self.inputLength.setText(_self.format.size);
		if(_self.format.align === 0 || _self.format.align == 1){
			_self.inputAlign.setKey(_self.format.align);
		}
		_self.inputFill.setText(_self.format.complement);
		_self.inputSearchFor.setText(_self.format.searchFor);
		_self.inputReplaceWith.setText(_self.format.replaceWith);
		_self.inputDecimals.setText(_self.format.decimal);
		_self.inputDecimalSeparator.setText(_self.format.decimalSeparator);
		_self.inputThousandSeparator.setText(_self.format.miliarSeparator);
	},
	getOwnData: function(){
		var _self = this;
		var returnFormat = {};

		returnFormat.size =	_self.inputLength.getText();
		returnFormat.align =_self.inputAlign.getKey();
		returnFormat.complement = _self.inputFill.getText()
		returnFormat.searchFor = _self.inputSearchFor.getText();
		returnFormat.replaceWith = _self.inputReplaceWith.getText();
		returnFormat.decimal = _self.inputDecimals.getText();
		returnFormat.decimalSeparator = _self.inputDecimalSeparator.getText();
		returnFormat.miliarSeparator = _self.inputThousandSeparator.getText();
		var isNull = true;
		for(var i in returnFormat){
			if(returnFormat[i]){
				isNull = false;
			}
		}
		if(isNull){
			return null;
		}else{
			return returnFormat;
		}
	}
})
