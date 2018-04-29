sap.ui.controller("app.controllers.dialogs.Separator", {


	onInit: function() {

	},

	onDataRefactor: function(data) {
        return $.extend(data, this.data);
    },

	onAfterRendering: function(html) {
		var _self = this;
		this.initServices();
		this.bindEvents();

		if(_self.coreServices.exhibition){
			_self.processExhibition();
		}
	},

	bindEvents: function(){
		var _self = this;
	},

	initServices: function() {

		var _self = this;
		var separatorData = _self.coreServices.layoutObject.separator;
		_self.inputSeparator = $("#inputSeparator").bindBaseInput({
			placeholder: i18n('NOSEPARATOR'),
			tooltip: i18n('NOSEPARATOR TOOLTIP')
		});
		if(typeof separatorData != "undefined")
			_self.inputSeparator.setText(separatorData.value);
			_self.inputSeparator._html.width(90);
		_self.inputBol = $('#chkBol').bindBaseCheckbox({
			id: "idChkBol", 
			text: i18n('CHKBOL'),
			tooltip: i18n('START OF LINE TOOLTIP')
		});
		$(_self.inputBol._html).css('padding-top', '10px');
		_self.inputEol = $('#chkEol').bindBaseCheckbox({
			id: "idChkEol", 
			text: i18n('CHKEOL'),
			tooltip: i18n('END OF LINE TOOLTIP')
		});
		$(_self.inputEol._html).css('padding-top', '10px');
		if(typeof separatorData != "undefined"){
			_self.inputBol.setChecked(separatorData.inFirst);
			_self.inputEol.setChecked(separatorData.inLast);
		}
		$('.btnClear').attr('tabindex',0);
		
        $('.btnClear').baseTooltip({
            class: 'dark',
            position: 'top',
            text: i18n('CLEAR DATA TOOLTIP')
        });
        
		$('.btnClear').keypress(function(){
		var keyPressed = event.keyCode || event.which;

              if (keyPressed==13) {
			_self.inputSeparator.setText('');
			_self.inputBol.setChecked(false);
			_self.inputEol.setChecked(false);}
		});
		$('.btnClear').click(function(e){
			_self.inputSeparator.setText('');
			_self.inputBol.setChecked(false);
			_self.inputEol.setChecked(false);
		});
	},
	getOwnData: function(){
		var _self = this;
		var returnData = {};
		returnData.value = _self.inputSeparator.getText();
		returnData.inFirst = _self.inputBol.getChecked();
		returnData.inLast = _self.inputEol.getChecked();
		return returnData;
	},
	processExhibition: function(){
		var mainCrystal = $('<div>').addClass('dfg-crystal').addClass('dfg-separator');
		$('.newFile .dialog-content').append(mainCrystal);
	}

});
