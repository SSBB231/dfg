sap.ui.controller("app.controllers.dialogs.filters.ValueList", {
	onAfterRendering: function(html) {
		var _self = this;

		_self.view = html;
		_self.view.autocomplete = _self.view.find('.select-fields');
		_self.view.select = _self.view.find('.select-types');
		_self.view.oper = _self.view.find('.select-oper');
		_self.view.box = _self.view.find('#box');
		_self.view.listContainer = _self.view.find('.list-container');
		_self._initServices();
		_self._bindComponents();
		_self._bindEvents();
		_self._initializeElements();

	},

	_initServices: function() {
		var _self = this;

		_self.coreServices.listEditor = {
			deleteValue: function(idx) {
				_self.values.splice(idx, 1);
				if(!_self.values.length){
					_self.view.addClass("no-value");
				}
			}
		};
	},

	_initializeElements: function() {
		var _self = this;
		var data = _self.getData();
		_self.values = data.valueList;
		_self.originalValues = [];
		_self._renderValues(_self.values);
	},

	_bindComponents: function() {
		var _self = this;
		var data = _self.getData();
		_self.components = {};
		_self.components.oper = _self.view.oper.bindBaseSelect({
			options: data.operatorsOptions.filter(function(element) {
					return element.key !== "IN" && element.key !== "NOT IN";
				}),
            disableSort: true,
			tooltip: i18n('OPERATOR SELECT TOOLTIP')
		});
		_self.components.oper.setKey( "=" );
	},

	_bindEvents: function() {
		var _self = this;
		_self.view.box.keyup(_self._onTextareaKeyUp.bind(this));
	},

	_renderValues: function(values) {
		var _self = this;
		var data = _self.getData();
		if (_self.view.hasClass("no-value")){
			_self.view.removeClass("no-value");
		}
		values.forEach(function(value) {
			value.getEspecialValue = data.getEspecialValue;
			_self.view.listContainer.bindValueListRow(value);
		});
		_self.view.box.val("");
	},

	_onTextareaKeyUp: function(evt) {
		var _self = this;
		var data = _self.getData();
		
		var invOp = {
			"<": ">",
			">": "<",
			"≤": "≥",
			"≥": "≤",
	        "=": "≠",
	        "≠": "="
		};
		var especialOpers = {
		    "BW": "=",
		    "NOT BW": "≠",
		    "FW": "=",
		    "NOT FW": "≠",
		    "Contains": "=",
		    "NOT CONTAINS": "≠"
		};
		if (evt.keyCode == 13) {
			var rawText = _self.view.box.val().trim();
			var values = rawText.split("\n");

			values = values.map(function(value) {

				var obj = {
					_: "Condition",
					oper: _self.components.oper.getKey(),
					name: value,
					label: _self.components.oper.getValue()
				};
				
				return obj;
			});
			values.forEach(function(value) {
				_self.values.push(value);
			});
			
			_self._renderValues( values );
		}
	},
	getOriginalValue: function(idEspecial, value){
		switch( idEspecial ){
            case "FW":
            case "NOT FW":
                return "*" + value;
            case "BW":
            case "NOT BW":
                return value + "*";
            case "Contains":
            case "NOT Contains":
                return "*" + value + "*";
            default: return value;
        }
	},

	getValues: function( cancel ) {
		var _self = this;
		var data = _self.getData();
		return {
			isListOfValues: ( data.oper !== "IN" && data.oper !== "NOT IN" ),
			values: cancel ? _self.originalValues : _self.values
		};
	}
});