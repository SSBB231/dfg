sap.ui.controller("app.controllers.editor.floatingPanel.outputDialog", {
	onInit: function() {
		
	},

	onDataRefactor: function(data) {
		return $.extend(data, this.data);
	},

	onAfterRendering: function(html) {
		var _self = this;
		this.view = html;
		this.view.source = this.view.find('#source-output');
		this.view.type = this.view.find('#type-output');
		this.next = false;
		this.typeData = null;
		this.services = this.getData().services;

		this.bindElements();
		this.addServices();
	},

	addServices: function(){
		var _self = this;
	
		this.coreServices.changeNext = function(value) {
			_self.next = value;
		};
		this.coreServices.getNext = function() {
			return _self.next;
		};
		this.coreServices.getOutputs = function(){
			return { source: _self.view.source.ctrl.getKey(), type: _self.view.type.ctrl.getKey() };
		};
		this.coreServices.setFirstData = function(data){
			_self.view.source.ctrl.setKey(data.source);
			_self.typeData = data.type;
		}
	},

	bindElements: function(){
		var _self = this;
		this.view.source.empty();
		this.view.type.empty();

		this.view.source.ctrl = this.view.source.bindBaseAutocomplete({
			options: [{
				key: 1,
				name: i18n('REPORT')
			}, {
				key: 2,
				name: i18n('FISCAL BOOK')
			}],
			required: true,
			onCompleteChange: function(oldVal, newVal) {
				var loader = _self.view.type.baseLoader({ modal: true });
				loader.open();
				_self.next = false;
				Data.endpoints.dfg.output.listOutputType.post({  }).success(function(data){
					var typeOptions = [];
					data.forEach(function(element, id){
						typeOptions.push({
							key: element.id,
							name: element.name
						})
					});
					_self.view.type.empty();
					_self.view.type.ctrl = _self.view.type.bindBaseAutocomplete({
						options: typeOptions,
						required: true,
						tooltip: i18n('SELECT TYPE OUTPUT'),
						placeholder: i18n('SELECT TYPE OUTPUT'),
						onCompleteChange: function(oldVal, newVal){
							if(newVal){
								_self.next = true;
							}else{
								_self.next = false;
							}
						}
					});
					if(_self.typeData != null){
						_self.view.type.ctrl.setKey(_self.typeData);
						_self.typeData = null;
					}
					loader.close();
				}).error(function(){
					loader.close();
				});
			},
			tooltip: i18n('SELECT SOURCE OUTPUT'),
			placeholder: i18n('SELECT SOURCE OUTPUT')
		});

		this.view.type.ctrl = this.view.type.bindBaseAutocomplete({
			options: [],
			required: true
		});
		this.view.type.ctrl.disable();
	}
});