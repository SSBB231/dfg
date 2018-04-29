sap.ui.controller("app.controllers.dialogs.filters.ValueListRow", {
	onAfterRendering: function(html) {
		var _self = this;
		_self.view = html;
		_self.view.name = _self.view.find(".name");
		_self.view.category = _self.view.find(".category");
		_self.view.removeButton = _self.view.find(".remove");
		_self.view.removeButton.attr('tabindex', 0);
		_self.view.removeButton.bind('keyup', _self._keyOptions.bind(this));
		_self.view.removeButton.baseTooltip({
			class: 'dark',
			position: 'top',
			text: i18n('COND REMOVE FIELD TOOLTIP')
		});

		_self._initializeFields();
		_self._bindEvents();
	},
	_keyOptions: function(evt){
		var _self = this;
		var keycode = (evt.keyCode ? evt.keyCode : evt.which);
		if (keycode == undefined && (keycode != '13' || keycode != '9') ) {
			return;
		}

		if( keycode && keycode == '13' ){
			_self._onRemoveRow(this);
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
	_initializeFields: function() {
		var _self = this;
		var value = _self.getData();

		_self.view.name.text(value.name);
		_self.view.category.text( value.label );
	},
	_bindEvents: function() {
		var _self = this;
		_self.view.removeButton.click(_self._onRemoveRow.bind(_self));
	},
	_onRemoveRow: function() {
		var _self = this;
		var data = _self.getData();
		_self.coreServices.listEditor.deleteValue(_self.view.index());
		_self.view.remove();
		_self.destroy();
	}
});