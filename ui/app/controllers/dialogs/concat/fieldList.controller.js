sap.ui.controller('app.controllers.dialogs.concat.fieldList', {
	onInit: function() {
		
	},

	onAfterRendering: function(html) {
		var _self = this;
		_self.view = $(html);
		_self.fieldArea = _self.view.find('.list-fields');
		_self.fields = [];
		_self.coreServices.deleteField = function(fieldIndex){
			_self.deleteField(fieldIndex);
		}
		_self.initData();
		_self.renderField();
		_self.bindEvents();
		_self.coreServices.renderMainFieldSelect = function(key){
			_self.renderField(key);
		}
		_self.coreServices.deleteAllFields = function() {
			_self.deleteAllFields();
		}
		_self.coreServices.getFields = function() {
			return _self.fields;
		}
		_self.coreServices.concatenateField = function(value) {
			_self.addField(value);
		}
	},
	renderField: function(key) {
		$('#comboConcatField').empty();
		var _self = this;
		_self.comboField = $('#comboConcatField').bindBaseSelect({
			options: this.coreServices.comboOptions.fields,
			isDisabled: true,
			onChange: function(oldVal, newVal) {
			},
			tooltip: i18n('FIELD SELECT TOOLTIP')
		});
		_self.comboField.setKey(key);
	},
	bindEvents: function() {
		var _self = this;
		$('.icon-add-concat').unbind( "click" );
		$('.icon-delete-concat').unbind( "click" );

		_self.addFieldBtn = $('.icon-add-concat').click(function(e){
			_self.addField();
		});
		$('.icon-add-concat').baseTooltip({
            class: 'dark',
            position: 'top',
            text: i18n('ADD CONCAT FIELD TOOLTIP')
        });
	},
	deleteAllFields: function() {
		var _self = this;
		$('.concat-field-wrapper').remove();
		_self.fields = [];
	},
	initData: function(){
		var _self = this;
	},
	addField: function(data){
		var _self = this;
		_self.fields.push(_self.fieldArea.bindConcatFieldSelect({
				parentFieldArea: _self.fieldArea,
				parentAddField: function(){_self.addField()},
				parentData: _self._data.parentData,
				selectedOption:data
			})
		);
		$('.icon-add-concat').eq(_self.fields.length).baseTooltip({
            class: 'dark',
            position: 'top',
            text: i18n('ADD CONCAT FIELD TOOLTIP')
        });
        
		$('.icon-delete-concat').eq(_self.fields.length - 1).baseTooltip({
            class: 'dark',
            position: 'top',
            text: i18n('DELETE CONCAT FIELD TOOLTIP')
        });
        
        $('.icon-edit-concat').eq(_self.fields.length - 1).baseTooltip({
            class: 'dark',
            position: 'top',
            text: i18n('EDIT CONCAT FIELD TOOLTIP')
        });
	},
	deleteField: function(fieldIndex){
		var _self = this;
		var newRef = []
		for (var i=0; i<_self.fields.length;i++){
			if(i != fieldIndex){
				newRef.push(_self.fields[i]);
			}
		}
		_self.fields = newRef;
	},
	getOwnData: function(){
		var _self = this;
	}
});