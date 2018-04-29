sap.ui.controller("app.controllers.xmlEditor.dialogs.format.FormatString", {
	onInit: function() {

	},

	onDataRefactor: function(data) {
        return $.extend(data, this.data);
    },

	onAfterRendering: function(html) {
		var _self = this;
		$('.btnClear').prop('tabindex',0);
		
		_self.format = _self.getData().format;
		_self.initInputs();
		if(_self.getData().format){
			_self.initValues();
		}
	},
	initInputs: function(){
		var _self = this;
		_self.inputLength = $('.f-string .input-length').bindBaseInput({
			tooltip: i18n('LENGTH INPUT TOOLTIP'),
			placeholder : i18n('LENGTH')
		});
		_self.inputAlign = $('.f-string .input-align').bindBaseSelect({
			options: [{key: 0, name: i18n('LEFT')}, {key:1, name: i18n('RIGHT')}],
			tooltip: i18n('ALIGN SELECT TOOLTIP')
		});
		_self.inputFill = $('.f-string .input-fill').bindBaseInput({
			tooltip: i18n('COMPLEMENT INPUT TOOLTIP'),
			placeholder : i18n('FILL')
		});
		_self.inputSearchFor = $('.f-string .input-search-for').bindBaseInput({
			tooltip: i18n('REPLACE INPUT TOOLTIP'),
			placeholder : i18n('REPLACE')
		});
		_self.inputReplaceWith = $('.f-string .input-replace-with').bindBaseInput({
			tooltip: i18n('WITH INPUT TOOLTIP'),
			placeholder : i18n('WITH')
		});
		_self.inputUpper = $('.f-string .input-to-upper').bindBaseCheckbox({
			id: "idChkUpper", 
			text: i18n('UPPER'),
			tooltip: i18n('UPPER TOOLTIP')
		});
		_self.inputLower = $('.f-string .input-to-lower').bindBaseCheckbox({
			id: "idChkLower", 
			text: i18n('LOWER'),
			tooltip: i18n('LOWER TOOLTIP')
		});
		
		$('.btnClear').on('keydown', function(){
			 var keyPressed = event.keyCode || event.which;

              if (keyPressed==13) {
             		_self.inputLength.setText('');
					_self.inputAlign.setKey(null);
					_self.inputAlign._html.find("input").val("");
					_self.inputFill.setText('');
					_self.inputSearchFor.setText('');
					_self.inputReplaceWith.setText('');
					_self.inputUpper.setChecked(false);
					_self.inputLower.setChecked(false);              };
		});

		$('.btnClear').click(function(e){
			_self.inputLength.setText('');
			_self.inputAlign.setKey(null);
			_self.inputAlign._html.find("input").val("");
			_self.inputFill.setText('');
			_self.inputSearchFor.setText('');
			_self.inputReplaceWith.setText('');
			_self.inputUpper.setChecked(false);
			_self.inputLower.setChecked(false);
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
		_self.inputUpper.setChecked(_self.format.isUpper);
		_self.inputLower.setChecked(_self.format.isLower);
	},
	getOwnData: function(){
		var _self = this;
		var returnFormat = {};

		returnFormat.size =	_self.inputLength.getText();
		returnFormat.align =_self.inputAlign.getKey();
		returnFormat.complement = _self.inputFill.getText()
		returnFormat.searchFor = _self.inputSearchFor.getText();
		returnFormat.replaceWith = _self.inputReplaceWith.getText();
		returnFormat.isUpper = _self.inputUpper.getChecked();
		returnFormat.isLower = _self.inputLower.getChecked();
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
