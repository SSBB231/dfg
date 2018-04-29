sap.ui.controller("app.controllers.editor.floatingPanel.fiscalBookDialog", {
	onInit: function() {
		this.data = {
			federal: {
				id: "federal-option",
				name: "fiscal-options",
				value: "1",
				isChecked: true,
				isDisabled: true,
				text: i18n('FEDERAL')
			},
			uf: {
				id: "uf-option",
				name: "fiscal-options",
				value: "2",
				isChecked: false,
				isDisabled: true,
				text: i18n('UF')
			}
		};
		this.components = {};
		this.listValuesData = {};
	},

	onDataRefactor: function(data) {
		return $.extend(data, this.data);
	},

	onAfterRendering: function(html) {
		var _self = this;
		this.view = html;
		this.view.company = this.view.find('#fiscal-company');
		this.view.federalOption = this.view.find('#fiscal-federal-option');
		this.view.ufOption = this.view.find('#fiscal-uf-option');
		this.view.uf = this.view.find('#fiscal-uf-select');
		this.view.branch = this.view.find('#fiscal-branch');
		this.view.tax = this.view.find('#fiscal-tax');
		this.view.period = this.view.find('#fiscal-period');
		this.view.table = this.view.find('#fiscal-table');
		//this.coreServices = this.getData().services;
		this.data = this.getData();
		this.listValuesData.idOutputType = this.data.outputs.type;
		this.listValuesData.objectType = this.data.outputs.source;
		this.next = false;
		_self.ufData = null;
		_self.branchData = null;
		_self.taxData = null;
		_self.option = 1;
		_self.periodData = null;

		this.bindElements();
		this.addServices();
	},

	addServices: function(){
		var _self = this;
		var components = this.components;
		this.coreServices.changeNext = function(value) {
			_self.next = value;
		};
		this.coreServices.getFiscalNext = function() {
			return _self.next;
		};
		this.coreServices.getOutputsFiscal = function(){
			var ret = {
				company: components.company.getKey(),
				uf: components.uf.getKey(),
				branch: components.branch.getKey(),
				tax: components.tax.getKey(),
				federalOption: components.federalOption.find('input').prop('checked'),
				ufOption: components.ufOption.find('input').prop('checked'),
				period: components.period.getValue()
			};
			return ret;
		};
		this.coreServices.setSecondData = function(data){
			components.company.setKey(data.company);
			_self.ufData = data.uf;
			_self.branchData = data.branch;
			_self.taxData = data.tax;
			_self.option = data.federalOption ? 1 : 2;
			_self.periodData = data.period;
		};
		this.coreServices.getListValuesData = function(){
			_self.listValuesData.executionPeriod = components.period.getValue();
			return _self.listValuesData;
		};
	},

	bindElements: function() {
		var _self = this;
		this.view.company.empty();
		this.view.uf.empty();
		this.view.branch.empty();
		this.view.tax.empty();
		this.view.period.empty();
		this.view.table.empty();
		this.view.company.ctrl = this.view.company.bindBaseAutocomplete({
			options: _self.data.companies.map(function(element, id) {
				return {
					key: element.id,
					name: element.name
				}
			}),
			required: true,
			tooltip: i18n('TOOLTIP FILTER BY COMPANY'),
			placeholder: i18n('TOOLTIP FILTER BY COMPANY'),
			onCompleteChange: function(oldVal, newVal) {
				_self.loader = _self.view.uf.baseLoader({
					modal: true
				});
				_self.loader.open();
				_self.createBranchSelect(null, true);
				_self.createTaxSelect(null, true);
				_self.createPeriod(true);
				_self.listValuesData.idCompany = newVal.key;
				Data.endpoints.dfg.output.listUF.post({ codEmpresa: newVal.key }).success(function(_data) {
					_self.ufList = _data;
					_self.view.federalOption.find('input:disabled').removeAttr('disabled');
					_self.view.ufOption.find('input:disabled').removeAttr('disabled');
					Data.endpoints.dfg.output.listBranch.post({ codEmpresa: newVal.key }).success(function(_list){
						_self.branchList = _list;
						if(_self.option === 2 || _self.view.ufOption.find('input').prop('checked')){
							_self.option = 1;
							if(!_self.view.ufOption.find('input').prop('checked'))
								_self.view.ufOption.find('input').click();
							else
								_self.createUfSelect(_self.ufList, false);
						}else{
							_self.createBranchSelect(_list);
							if(_self.branchData){
								_self.view.branch.ctrl.setKey(_self.branchData);
								_self.branchData = null;
							}
						}
						_self.loader.close();
					}).error(function(errorMsg) {
						$.baseToast({
							isError: true,
							text: msgError
						});
						_self.loader.close();
					});
				}).error(function(errorMsg) {
					$.baseToast({
						isError: true,
						text: msgError
					});
					_self.loader.close();
				});
			}
		});
		this.components.company = this.view.company.ctrl;

		this.view.federalOption.off('click').on('click', function(evt) {
			if (_self.view.federalOption.find('input:disabled').length || _self.view.federalOption.find('input').prop('checked'))
				return
			_self.createUfSelect(null, true);
			_self.createTaxSelect(null, true);
			_self.createPeriod(true);
			_self.createBranchSelect(_self.branchList, false);
		});
		this.components.federalOption = this.view.federalOption;
		this.view.ufOption.off('click').on('click', function(evt) {
			_self.ufClick();
		});
		this.components.ufOption = this.view.ufOption;
		this.createUfSelect(null, true);
		this.createBranchSelect(null, true);
		this.createTaxSelect(this.data.taxes, true);
		this.createPeriod(true);
		// this.view.table.ctrl = this.view.table.bindBase({});
	},

	ufClick: function() {
		if (this.view.ufOption.find('input:disabled').length || this.view.ufOption.find('input').prop('checked'))
			return
		this.createUfSelect(this.ufList, false);
		this.view.branch.empty();
		this.createBranchSelect(null, true);
		this.createTaxSelect(null, true);
		this.createPeriod(true);
		if (this.ufData) {
			this.view.uf.ctrl.setKey(this.ufData);
			this.ufData = null;
		}
	},

	createBranchSelect: function(_data, isNull){
		var _self = this;
		this.view.branch.empty();
		if(isNull){
			this.view.branch.ctrl = this.view.branch.bindBaseAutocomplete({
				options: [],
				required: true
			});
			this.view.branch.ctrl.disable();
			this.components.branch = this.view.branch.ctrl;
			return;
		}
		this.view.branch.ctrl = this.view.branch.bindBaseAutocomplete({
			options: !_data ? [] : _data.map(function(element, id) {
				return {
					key: element.id,
					name: element.name
				}
			}),
			required: true,
			tooltip: i18n('TOOLTIP FILTER BY BRANCH'),
			placeholder: i18n('TOOLTIP FILTER BY BRANCH'),
			onCompleteChange: function(oldVal, newVal) {
				_self.createTaxSelect(_self.data.taxes, false);
				_self.createPeriod(true);
				_self.listValuesData.idBranch = newVal.key;
				if(_self.taxData){
					_self.view.tax.ctrl.setKey(_self.taxData);
					_self.taxData = null;
				}
			}
		});
		this.components.branch = this.view.branch.ctrl;
	},

	createUfSelect: function(_data, isNull){
		var _self = this;
		this.view.uf.empty();
		if(isNull){
			this.view.uf.ctrl = this.view.uf.bindBaseAutocomplete({
				options: []
			});
			this.view.uf.ctrl.disable();
			this.components.uf = this.view.uf.ctrl;
			return;
		}
		this.view.uf.ctrl = this.view.uf.bindBaseAutocomplete({
			options: !_data ? [] : _data.map(function(element, id) {
				return {
					key: element.id,
					name: element.name
				}
			}),
			required: true,
			tooltip: i18n('TOOLTIP FILTER BY UF'),
			placeholder: i18n('TOOLTIP FILTER BY UF'),
			onCompleteChange: function(oldVal, newVal) {
				_self.loader.open();
				_self.listValuesData.uf = newVal.key;
				_self.createTaxSelect(null, true);
				_self.createPeriod(true);
				Data.endpoints.dfg.output.listBranch.post({
					codEmpresa: _self.view.company.ctrl.getKey(),
					codFilial: newVal.key
				}).success(function(_list) {
					_self.branchList = _list;
					_self.createBranchSelect(_list);
					if(_self.branchData){
						_self.view.branch.ctrl.setKey(_self.branchData);
						_self.branchData = null;
					}
					_self.loader.close();
				}).error(function(errorMsg) {
					$.baseToast({
						isError: true,
						text: msgError
					});
					_self.loader.close();
				});
			}
		});
		this.components.uf = this.view.uf.ctrl;
	},

	createTaxSelect: function(_data, isNull){
		var _self = this;
		this.view.tax.empty();
		if(isNull){
			this.view.tax.ctrl = this.view.tax.bindBaseAutocomplete({
				options: [],
				required: true
			});
			this.view.tax.ctrl.disable();
			this.components.tax = this.view.tax.ctrl;
			return;
		}
		this.view.tax.ctrl = this.view.tax.bindBaseAutocomplete({
			options: !_data ? [] : _data.map(function(element, id) {
				return {
					key: element.codTributo,
					name: element.descrCodTributo
				}
			}),
			required: true,
			tooltip: i18n('TOOLTIP FILTER BY TAX'),
			placeholder: i18n('TOOLTIP FILTER BY TAX'),
			onCompleteChange: function(oldVal, newVal) {
				_self.createPeriod(false);
				_self.listValuesData.idTax = newVal.key;
				if(_self.periodData){
					_self.view.period.ctrl.setValue(_self.periodData);
					_self.periodData = null;
				}
				_self.next = true;
			}
		});
		this.components.tax = this.view.tax.ctrl;
	},

	createPeriod: function(isNull){
		var _self = this;
		this.view.period.empty();
		if(isNull){
			this.view.period.ctrl = this.view.period.bindBaseFiscalSubPeriodPicker({});
			this.components.period = this.view.period.ctrl;
			this.view.period.ctrl.disable();
			return;
		}
		this.view.period.ctrl = this.view.period.bindBaseFiscalSubPeriodPicker({
			idCompany: _self.view.company.ctrl.getKey(),
			uf: _self.view.uf.ctrl.getKey(),
			branch: _self.view.branch.ctrl.getKey(),
			idTax: _self.view.tax.ctrl.getKey(),
			onChange: function(oldVal, newVal){
				console.log(oldVal, newVal)
			}
		});
		this.components.period = this.view.period.ctrl;
	}
});