sap.ui.controller('app.controllers.dialogs.filters.CBValue', {
	onInit: function() {

	},
	onBeforeRendering: function() {

	},

	onAfterRendering: function(html) {
		var _self = this;
		this.view = $(html);
		var data = _self.getData();
		_self.parentCtrl = data.parentCtrl;
		_self.valueList = {values:[]};
		_self.valueData = _self.getData().valueData;

		_self.listValues = _self.getData().listValues;
		if(_self.valueData && _self.valueData.value.isListOfValues){
			_self.valueList = _self.valueData.value;
		}
		_self.view.addBtn = _self.view.find('.insert');
		_self.view.deleteBtn = _self.view.find('.delete');
		_self.view.listBtn = _self.view.find('.list');
		_self.initData();
		_self.initListDialog();

		_self.view.addBtn.attr('tabindex', '0');
		_self.view.addBtn.baseTooltip({
			class: "dark",
			position: "top",
			text: i18n('ADD VALUE TOOLTIP'),
			width: 300
		});
		_self.view.addBtn.keydown(function(ev){
			if (ev.keyCode == 32 || ev.keyCode == 13) {
				this.click();
			}
		});

		_self.view.deleteBtn.attr('tabindex', '0');
		_self.view.deleteBtn.baseTooltip({
			class: "dark",
			position: "top",
			text: i18n('DELETE VALUE TOOLTIP'),
			width: 300
		});
		_self.view.deleteBtn.keydown(function(ev){
			if (ev.keyCode == 32 || ev.keyCode == 13) {
				this.click();
			}
		});

		this.view.find('.insert').click(function(){
			//alert('cliquei');
			_self.getData().parentAddValue();
		});

		var dialog = $.baseDialog({
			title: i18n("ERROR"),
			modal: true,
			size: "small",
			text: i18n('DFG102002'),
			buttons: [{
				name: "Ok",
				isCloseButton: true,
				/*click: function(){
					dialog.close();
				},*/
				tooltip: i18n('CLICK PRESS CONFIRM')
			}]
		});

		this.view.find('.delete').click(function(){
			var QtdadeCampos = $(this).closest('.list-values').find('.value-wrapper').size();

			if(QtdadeCampos == '1'){
				dialog.open();
			}else{
				_self.parentCtrl.deleteValue($(this).closest('.value-wrapper').index());
				$(this).closest('.value-wrapper').remove();
			}
		});	
	},

	initData: function(){
		var _self = this;

		_self.inputLogicOperator = _self.view.find(".inputLogicOperator").bindBaseSelect({
			options: [{key: "AND", name: i18n("AND")}, 
					{key: "OR", name: i18n("OR")}],
            disableSort: true,
			onChange: function(oldVal, newVal) {
			},
			tooltip: i18n('LOGIC OPERATOR SELECT TOOLTIP')
		});
		_self.inputLogicOperator.setKey('AND');

		_self.inputOperator = _self.view.find(".inputOperator").bindBaseSelect({
			options: [{key: "=",name: "="}, 
			{key: "!=", name: "≠"}, 
			{ key: ">", name: ">"}, 
			{ key: ">=", name: "≥"}, 
			{ key: "<", name: "<"},
			{ key: "<=", name: "≤"},
			{ key: "IN", name: i18n('IN')},
			{ key: "NOT IN", name: i18n('NOT IN')},
			{ key: "CONTAINS", name: i18n('CONTAINS')},
			{ key: "NOT CONTAINS", name: i18n('NOT CONTAINS')},
			{ key: "BW", name: i18n('BW')},
			{ key: "NOT BW", name: i18n('NOT BW')},
			{ key: "FW", name: i18n('FW')},
			{ key: "NOT FW", name: i18n('NOT FW')}],
            disableSort: true,
			onChange: function(oldVal, newVal) {
			    if(newVal.key === 'IN' || newVal.key === 'NOT IN'){
					_self.renderListButton();
				}else{
					_self.renderInput();
				}
			},
			tooltip: i18n('OPERATOR SELECT TOOLTIP')
		});
		_self.inputOperator.setKey('=');

		_self.inputValue = _self.view.find(".inputValue").bindBaseInput({
			onChange: function (oldVal, newVal) {
			},
			tooltip: i18n('CONSTANT INPUT TOOLTIP')
		});
		
		if(_self.valueData){
			if(_self.valueData.logicOperator){
				_self.inputLogicOperator.setKey(_self.valueData.logicOperator);
			}
			if(_self.valueData.operator === "<>" || _self.valueData.operator === "&lt;&gt;" ){
			    _self.valueData.operator = "!=";
			}else if (_self.valueData.operator === "&lt;="){
			    _self.valueData.operator = "<=";
			}else if(_self.valueData.operator === "&gt;="){
			    _self.valueData.operator = ">=";
			}else if(_self.valueData.operator === "&lt;"){
			    _self.valueData.operator = "<";
			}else if(_self.valueData.operator === "&gt;"){
			    _self.valueData.opertor = ">";
			}
			_self.inputOperator.setKey(_self.valueData.operator);
			_self.inputValue.setText(_self.valueData.value);
		}
	},

	renderInput: function() {
		var _self = this;
		_self.view.listBtn.hide();
		_self.view.find(".inputValue").show();
	},

	renderListButton: function(){
		var _self = this;
		_self.view.find(".inputValue").hide();
		_self.view.listBtn.show();
		_self.view.listBtn.bind('click', _self.openListDialog.bind(this));
	},

	addValue: function(data){
		var _self = this;
		_self.listValues.bindCBValue({
			services:_self.getData().services,
			listValues: _self.listValues
		});

	},
	getOwnData: function(){
		var _self = this;
		var returnObject = {};
		returnObject.logicOperator = _self.inputLogicOperator.getKey();
		returnObject.operator = _self.inputOperator.getKey();
		if(returnObject.operator === 'IN' || returnObject.operator === 'NOT IN'){
			returnObject.value = _self.valueList;
		}else{
			returnObject.value = _self.inputValue.getText();
		}

		return returnObject
	},
	openListDialog: function() {
		var _self = this;
		_self.dialog.open();
		_self.dialog._dialog.height(350);
		_self.dialog._content.height(260);
	},
	initListDialog: function(){
		var _self = this;
		_self.dialog = $.baseDialog({
			title: i18n('COND LIST DIALOG TITLE'),
			modal: true,
			disableOuterClick: true,
			cssClass: "list-dialog",
			size: 'medium',
			viewName: "app.views.dialogs.filters.ValueList",
			disableOuterClick: true,
			viewData: {
				operatorsOptions: _self.inputOperator._data.options,
				valueList: _self.valueList.values
			},
			buttons: [{
				name: i18n('CANCEL'),
				isCloseButton: true,
				click: function() {
					_self.dialog.close();
				},
				tooltip: i18n('CLICK PRESS CANCEL')
			}, {
				name: i18n('APPLY'),
				click: function() {
					_self.valueList = _self.dialog._innerView.ctrl.getValues();
					console.log(_self.valueList);
					_self.dialog.close();
				},
				tooltip: i18n('CLICK PRESS CONFIRM')
			}]
		});
	}
});