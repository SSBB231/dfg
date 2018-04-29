sap.ui.controller("app.controllers.dialogs.Sequence", {
	onInit: function() {
	},

	onAfterRendering: function(html) {
		var _self = this;
		_self.view = $(html);
		_self.abas();
		if(_self.coreServices.layoutObject.sequence){

			window.thisPosition = _self.coreServices.layoutObject.sequence.position;
			
			if(thisPosition == 'first'){
				window.thisPosition = i18n('FIRST');
			}
			if(thisPosition == 'last'){
				window.thisPosition = i18n('LAST');
			}

			if(_self.coreServices.layoutObject.sequence.format){
				window.thisSize = _self.coreServices.layoutObject.sequence.format.size;
				window.thisAlign = _self.coreServices.layoutObject.sequence.format.align;
				window.thisComplement = _self.coreServices.layoutObject.sequence.format.complement;	

				if(thisAlign == '0'){
					window.thisAlign = i18n('LEFT');
				}
				if(thisAlign == '1'){
					window.thisAlign = i18n('RIGHT');
				}
			}
		}

		
	
		//console.log(thisSize, thisAlign, thisComplement, thisPosition);

		_self.initPosicao();
		_self.initInputs();
	},
	abas: function(){
		$('.tab-content').bindBaseTabs({
			tab: [{
				title: i18n('SETTING'),
				icon: "gear",
				iconColor: "white",
				iconFont: "Display-and-Setting",
				viewName: "app.views.dialogs.SequenceConfig",
				tooltip: i18n('SETTING TAB TOOLTIP')
			}, {
				title: i18n('FORMAT'),
				icon: "coin",
				iconColor: "white",
				iconFont: "Finance-and-Office",
				viewName: "app.views.dialogs.SequenceFormat",
				tooltip: i18n('FORMAT TOOLTIP')
			}],
			type: "boxes",
			wrapperClass: "wrapperClass"
		})
	},
	initPosicao: function(){
		var _self = this;
		_self.selectPosicao = $("#SequenceConfig .selectposicao").bindBaseSelect({
			//placeholder: window.thisPosition,
			options: [{key: 'first', name: i18n('FIRST')}, {key:'last', name: i18n('LAST')}],
            disableSort: true,
			tooltip: i18n('POSITION SELECT TOOLTIP')
		})
		$('#SequenceConfig .selectposicao input').val(window.thisPosition);
		$('.btnClear.sequence').attr('tabindex',0);
		$('.btnClear.sequence').keypress(function(){
			var keyPressed = event.keyCode || event.which;

             if (keyPressed==13) {
			_self.selectPosicao.setKey(null);
			_self.inputLength.setText();
			_self.inputAlign.setKey(null);
			_self.inputFill.setText();}
		});
		$('.btnClear.sequence').click(function(){
			_self.selectPosicao.setKey(null);
			_self.inputLength.setText();
			_self.inputAlign.setKey(null);
			_self.inputFill.setText();
		});
		
	},
	initInputs: function(){
		var _self = this;
		_self.inputLength = $('#SequenceFormat .input-length').bindBaseInput({
			//placeholder: window.thisSize,
			tooltip: i18n('LENGTH INPUT TOOLTIP')
		});
		$('#SequenceFormat .input-length input').val(window.thisSize);

		_self.inputAlign = $('#SequenceFormat .input-align').bindBaseSelect({
			//placeholder: window.thisAlign,
			options: [{key: 0, name: i18n('LEFT')}, {key:1, name: i18n('RIGHT')}],
			tooltip: i18n('ALIGN SELECT TOOLTIP')
		});
		$('#SequenceFormat .input-align input').val(window.thisAlign);

		_self.inputFill = $('#SequenceFormat .input-fill').bindBaseInput({
			//placeholder: window.thisComplement,
			tooltip: i18n('COMPLEMENT INPUT TOOLTIP')
		});
		$('#SequenceFormat .input-fill input').val(window.thisComplement);

		$('.btnClear.format').attr('tabindex',0);

		$('.btnClear.format').keypress(function(){
			var keyPressed = event.keyCode || event.which;

             if (keyPressed==13) {
			_self.inputLength.setText();
			_self.inputAlign.setKey(null);
			_self.inputFill.setText();}

		});
		$('.btnClear.format').click(function(){
			_self.inputLength.setText();
			_self.inputAlign.setKey(null);
			_self.inputFill.setText();
		});

	},
	updateSequence: function(){
		var _self = this;
		var _sequence = _self.coreServices.layoutObject;

		//console.log('LEGHT', _self.inputLength.getText());
		//console.log('ALIGN', _self.inputAlign.getKey());
		//console.log('COMPLEMENT', _self.inputFill.getText());
		//console.log('POSITION', _self.selectPosicao.getKey());

		if(_self.coreServices.layoutObject.sequence){
			if(_self.inputAlign.getKey() == undefined){
				if(thisAlign == i18n('LEFT')){
					_self.inputAlign.setKey(0);
				}
				if(thisAlign == i18n('RIGHT')){
					_self.inputAlign.setKey(1);
				}
			}

			if(_self.selectPosicao.getKey() == undefined){
				if(thisPosition == i18n('FIRST')){
					_self.selectPosicao.setKey('first');
				}
				if(thisPosition == i18n('LAST')){
					_self.selectPosicao.setKey('last');
				}
			}
		}
		_sequence.sequence = {};
		_sequence.sequence.format = {};
		if(_self.inputLength.getText()){
			_sequence.sequence.format.size = _self.inputLength.getText();	
		}
		if(_self.inputFill.getText()){
			_sequence.sequence.format.complement = _self.inputFill.getText();	
		}
		if(_self.inputAlign.getKey() == '0'){
			_sequence.sequence.format.align = _self.inputAlign.getKey(0);	
		}
		if(_self.inputAlign.getKey() == '1'){
			_sequence.sequence.format.align = _self.inputAlign.getKey(1);	
		}
		if(_self.selectPosicao.getKey()){
			_sequence.sequence.position = _self.selectPosicao.getKey();	
		}
		if(_self.inputLength.getText() == '' || _self.inputFill.getText() == ''){
			delete _sequence.sequence.format;
			if(_self.selectPosicao.getKey() == ''){
				delete _sequence.sequence;
			}
		}
		

	}
});