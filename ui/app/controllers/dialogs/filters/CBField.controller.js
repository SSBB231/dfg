sap.ui.controller('app.controllers.dialogs.filters.CBField', {
	onInit: function() {

	},
	onBeforeRendering: function() {

	},

	onDataRefactor: function(data) {
        return $.extend(data, this.data);
    },

	onAfterRendering: function(html) {
		var _self = this;
		this.view = $(html);
		var data = _self.getData();
		_self.parentCtrl = data.parentCtrl;
		_self.valuesRef = [];
		_self.fieldData = _self.getData().fieldData;
		_self.listValues = this.view.find('.list-values');
		this.view.fieldBtn = this.view.find('.field');
		this.view.deleteBtn = this.view.find('.delete');

		this.view.fieldBtn.click(function(){
			_self.getData().parentAddField();
		});
		_self.view.deleteBtn.click(function(){
			_self.parentCtrl.deleteField($(this).closest('.field-wrapper').index());
			$(this).closest('.field-wrapper').remove();
		});
		this.filtersInputs();
		_self.view.fieldBtn.attr('tabindex', '0');
		_self.view.fieldBtn.baseTooltip({
			class: "dark",
			position: "top",
			text: i18n('ADD FIELD TOOLTIP'),
			width: 300
		});
		_self.view.fieldBtn.keydown(function(ev){
			if (ev.keyCode == 32 || ev.keyCode == 13) {
				this.click();
			}
		});
		_self.view.deleteBtn.attr('tabindex', '0');
		_self.view.deleteBtn.baseTooltip({
			class: 'dark',
			position: 'top',
			text: i18n('DELETE FIELD TOOLTIP')
		});
		_self.view.deleteBtn.keydown(function(ev){
			if (ev.keyCode == 32 || ev.keyCode == 13) {
				this.click();
			}
		});
		// _self.view.find(".field-wrapper .delete").baseTooltip({
		// 	class: "dark",
		// 	position: "top",
		// 	text: i18n('DELETE FIELD'),
		// 	width: 300
		// });

	},

	addValue: function(data){
		var _self = this;
		_self.valuesRef.push(_self.listValues.bindCBValue({
		        parentCtrl: _self,
				listValues: _self.listValues,
				fieldData: _self.fieldData,
				valueData: data,
				parentAddValue: function(){_self.addValue()}
			})
		);
	},

	filtersInputs: function(){
		var _self = this;
		var options = [];
		for(var i=0; i<_self.getData().structureFields.length; i++){
			options.push({key: _self.getData().structureFields[i].id, name: _self.getData().structureFields[i].label})
		}
		// var fixedOptions = [];
		// if(_self.getData().recordFields){
		// 	for(var i=0; i<_self.getData().recordFields.length; i++){
		// 		fixedOptions.push({key: _self.getData().recordFields[i].id, name: _self.getData().recordFields[i].label})
		// 	}
		// }
		_self.inputFields = _self.view.find(".inputFields").bindBaseAutocomplete({
			options: options,
            disableSort: true,
			//fixedOptions: fixedOptions,
			onChange: function(oldVal, newVal) {
			},
			tooltip: i18n('FIELD INPUT TOOLTIP')
		});
		

		if(_self.fieldData){
			if(_self.fieldData.fieldId && _self.fieldData.fieldId != "recordId"){
				_self.inputFields.setKey(_self.fieldData.fieldId);
				for(var i = 0; i<_self.fieldData.conditions.length; i++){
					_self.addValue(_self.fieldData.conditions[i]);
				}
			}
		}else{
			_self.addValue();
		}
	},
	addField: function(data){
		var _self = this;
		_self.getData().parentFieldArea.bindCBField({
			services:_self.getData().services,
			parentFieldArea: _self.getData().parentFieldArea,
			structureFields: _self.getData().structureFields,
		});

	},
	deleteValue: function(valueIndex){
		var _self = this;
		var newRef = []
		for (var i=0; i<_self.valuesRef.length;i++){
			if(i != valueIndex){
				newRef.push(_self.valuesRef[i]);
			}
		}
		_self.valuesRef = newRef;
	},
	getOwnData: function(){
		var _self = this;
		var returnObject = {};
		returnObject.fieldId = _self.inputFields.getKey();
		returnObject.conditions = [];
		for(var i=0; i<_self.valuesRef.length; i++){
			returnObject.conditions.push(_self.valuesRef[i].getOwnData());
		}
		returnObject.conditions[0].logicOperator = null;

		return returnObject;
	}
});