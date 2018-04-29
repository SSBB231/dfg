sap.ui.controller("app.controllers.dialogs.format.FormatDate", {
	onInit: function() {

	},

	onDataRefactor: function(data) {
        return $.extend(data, this.data);
    },

	onAfterRendering: function(html) {
		var _self = this;
		var nameClass = "";
		if(_self.getData().isHourFormat){
			nameClass = ".hour-format";
			$(".f-date").eq($(".f-date").length - 1).addClass("hour-format");
		}
		_self.format = _self.getData().format;
		_self.selects = {};
		_self.selects.day = $('.f-date' + nameClass + ' .select-day');
		_self.selects.month = $('.f-date' + nameClass + ' .select-month');
		_self.selects.year = $('.f-date' + nameClass + ' .select-year');
		_self.inputSeparator = $('.f-date' + nameClass + ' .input-date-separator');
		$('.f-date' + nameClass).find('.btnClear').baseTooltip({
            class: 'dark',
            position: 'top',
            text: i18n('CLEAR DATA TOOLTIP')
        });
		
		$('.btnClear').attr('tabindex',0);
		_self.initInputs();
	},
	initInputs: function(){
		var _self = this;
		_self.createSelect("day");
		_self.createSelect("year");
		_self.createSelect("month");
		
		// _self.inputSeparator.empty();
		_self.inputSeparator.ctrl = _self.inputSeparator.bindBaseInput({
			placeholder: i18n('SEPARATOR'),
			tooltip: i18n('SEPARATOR TOOLTIP'),
			value: _self.format ? _self.format.separator || "" : ""
		});

		$('.btnClear').click(function(e){
			_self.selects.day.ctrl.setKey("blank");
			_self.selects.month.ctrl.setKey("blank");
			_self.selects.year.ctrl.setKey("blank");
			_self.inputSeparator.ctrl.setText('');
		});

		$('.btnClear').on('keydown', function(){
			 var keyPressed = event.keyCode || event.which;

              if (keyPressed==13) {
             	_self.selects.day.ctrl.setKey("blank");
				_self.selects.month.ctrl.setKey("blank");
				_self.selects.year.ctrl.setKey("blank");
				_self.inputSeparator.ctrl.setText('');            
			}
		});
	},

	
	createSelect: function( name ){
		var _self = this;
		var _data = _self.getData();
		var options = [];
		if(_data.isHourFormat){
			options = [{
				key: "blank",
				name: i18n("BLANK")
			},{
				key: "HH",
				name: "HH"
			},{
				key: "MI",
				name: "MI"
			},{
				key: "SS",
				name: "SS"
			}];

		}else{
			options = [{
				key: "blank",
				name: i18n("BLANK")
			},{
				key: "DD",
				name: "DD"
			},{
				key: "MM",
				name: "MM"
			},{
				key: "month",
				name: i18n("TILE MONTH")
			},{
				key: "AAAA",
				name: "AAAA"
			},{
				key: "AA",
				name: "AA"
			}];
		}
		var onChange = function(oldVal, newVal){
			if(newVal.key !== "blank"){
				for(var keySelect in _self.selects){
					if(keySelect !== this._data.id){
						if(_self.selects[keySelect].ctrl.getKey() === newVal.key){
							_self.selects[keySelect].ctrl.setKey("blank");
							break;
						}
					}
				}
			}
		};
		
		// _self.selects[name].empty();		
		_self.selects[name].ctrl = _self.selects[name].bindBaseSelect({
			options: options,
            disableSort: true,
			tooltip: i18n('SELECT TOOLTIP') +" "+ i18n(name.toUpperCase()),
			id: name,
			key: _self.format ? _self.format[name] || "blank" : "blank",
			onChange: onChange
		});
		
	},
	getOwnData: function(){
		var _self = this;
		var isNull = false;
		$.each(_self.selects, function(index, select){
			if(select.ctrl.getKey() !== "blank"){
				isNull = false;
				return false;
			}
			isNull = true;
		});
		if(isNull){
			return null;
		}
		return {
			separator: _self.inputSeparator.ctrl.getText(),
			day: _self.selects.day.ctrl.getKey(),
			month: _self.selects.month.ctrl.getKey(),
			year: _self.selects.year.ctrl.getKey()
		};

	},
	validateDate: function(value){
		
		if(value === 5){
			return true;
		}else{
			return false;
		}
	}
});
