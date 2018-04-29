sap.ui.controller("app.controllers.executorSPED.ECD.generalData", {
	onInit: function() {

	},
	onDataRefactor: function(data) {
		var _self = this;
		data.monthOptions = [{
			key: "01",
			name: i18n("JANUARY")
        }, {
			key: "02",
			name: i18n("FEBRUARY")
        }, {
			key: "03",
			name: i18n("MARCH")
        }, {
			key: "04",
			name: i18n("APRIL")
        }, {
			key: "05",
			name: i18n("MAY")
        }, {
			key: '06',
			name: i18n("JUNE")
        }, {
			key: '07',
			name: i18n("JULY")
        }, {
			key: '08',
			name: i18n("AUGUST")
        }, {
			key: "09",
			name: i18n("SEPTEMBER")
        }, {
			key: "10",
			name: i18n("OCTOBER")
        }, {
			key: "11",
			name: i18n("NOVEMBER")
        }, {
			key: "12",
			name: i18n("DECEMBER")
        }];
		return $.extend(data, this.data);
	},
	onAfterRendering: function(html) {
		var _self = this;
		var data = _self.getData();
		_self.view = $(html);
		_self.view.initialRecord = _self.view.find(".initialRecord");
		_self.view.finalRecord = _self.view.find(".finalRecord");
		_self.view.period = _self.view.find(".period");
		_self.view.executionYear = _self.view.find(".execution-year");
		_self.view.executionMonthHigh = _self.view.find(".execution-monthHigh");
		_self.view.executionMonthLow = _self.view.find(".execution-monthLow");
		_self.view.organizationalParams = _self.view.find(".params-rb");
		_self.view.company = _self.view.find(".company-select");
		_self.view.cnpj = _self.view.find(".cnpj-select");
		_self.view.initialAccount = _self.view.find(".initialAccount");
		_self.view.finalAccount = _self.view.find(".finalAccount");
		_self.view.ledger = _self.view.find(".ledger");
		_self.fileData = data.fileData;
		_self.companyOptions = {};
		_self.idCompany = [],
		_self.idBranch = [],
		_self.uf = [], _self.idTax = [];

		_self.fileData.EEFI.map(function(eefi) {
			if (!_self.companyOptions[eefi.idCompany]) {
				_self.companyOptions[eefi.idCompany] = {
					key: eefi.idCompany,
					name: eefi.idCompany,
					idBranch: {}
				}
			}
			if (_self.idCompany.indexOf(eefi.idCompany) === -1) {
				_self.idCompany.push(eefi.idCompany);
			}
			if (_self.uf.indexOf(eefi.uf) === -1) {
				_self.uf.push(eefi.uf);
			}
			if (_self.idBranch.indexOf(eefi.idBranch) === -1) {
				_self.idBranch.push(eefi.idBranch);
			}
			if (!_self.companyOptions[eefi.idCompany].idBranch[eefi.idBranch]) {
				_self.companyOptions[eefi.idCompany].idBranch[eefi.idBranch] = {
					key: eefi.idBranch,
					name: eefi.idBranch
				}
			}
			if (_self.idTax.indexOf(eefi.idTax) === -1) {
				_self.idTax.push(eefi.idTax);
			}
		});
		_self.view.cnpj.parent().hide();

		_self.bindElements();
		_self.bindComponents();
	},
	bindElements: function() {
		var _self = this;
		var data = _self.getData();
		_self.view.initialRecord.ctrl = _self.view.initialRecord.bindBaseSelect({
			
		});
		_self.view.finalRecord.ctrl = _self.view.finalRecord.bindBaseSelect({
			
		});

		var actualYear = (new Date()).getFullYear();
		var yearOptions = [];
		for (var i = actualYear - 3; i <= actualYear; i++) {
			yearOptions.push({
				key: i,
				name: i
			});
		}
		for (var i = actualYear + 1; i <= actualYear + 3; i++) {
			yearOptions.push({
				key: i,
				name: i
			});
		}
		_self.view.period.ctrl = _self.view.period.bindBaseFiscalSubPeriodPicker({
			required: true,
			idCompany: _self.idCompany,
			uf: _self.uf,
			branch: _self.idBranch,
			idTax: _self.idTax,
			component: "DFG",
			privilege: "setting.execute",
			onChange: function(val) {}

		});
		/* _self.view.executionYear.ctrl = _self.view.executionYear.bindBaseSelect({
            options: yearOptions,
            required: true
        });
        _self.view.executionMonthHigh.ctrl = _self.view.executionMonthHigh.bindBaseSelect({
            options: data.monthOptions,
            required: true,
            onChange: _self.onChangeMonthHigh.bind(_self)
        });
        _self.view.executionMonthLow.ctrl = _self.view.executionMonthLow.bindBaseSelect({
            isLoading: true
        }); */
		_self.view.organizationalParams.company = _self.view.organizationalParams.bindBaseRadioButton({
			id: 1,
			name: "params",
			text: i18n("EXECUTE REPORT BY") + " " + i18n("COMPANY"),
			onChange: function(oldVal, newVal) {
				_self.view.company.parent().show();
				_self.view.cnpj.parent().hide();

			}
		});
		_self.view.organizationalParams.cnpj = _self.view.organizationalParams.bindBaseRadioButton({
			id: 1,
			name: "params",
			text: i18n("EXECUTE REPORT BY") + " " + i18n("ROOT CNPJ"),
			onChange: function(oldVal, newVal) {
				_self.view.cnpj.parent().show();
				_self.view.company.parent().hide();

			}
		});
		var companyOptions = [];
		for (var i in _self.companyOptions) {
			companyOptions.push(_self.companyOptions[i]);
		}
		_self.view.company.ctrl = _self.view.company.bindBaseSelect({
			options: companyOptions,
			onChange: _self.onChangeCompany.bind(_self),
			required: true
		});
		_self.view.cnpj.ctrl = _self.view.cnpj.bindBaseSelect({
			isLoading: true
		});
		_self.view.initialAccount.ctrl = _self.view.initialAccount.bindBaseSelect({
		
		});
		_self.view.finalAccount.ctrl = _self.view.finalAccount.bindBaseSelect({
			
		});
		_self.view.ledger.ctrl = _self.view.ledger.bindBaseSelect({
			required: true
		});

	},
	bindComponents: function() {
		var _self = this;

	  _self.view.ledger.empty();
		_self.view.ledger.ctrl = _self.view.ledger.bindBaseAutocomplete({
			options: _self.coreServices.requiredInformation.ledgerOptions,
			required: true,
			onChange: function() {

			}

		});
		_self.view.ledger.find('input').attr("maxlength", 2);
		_self.view.initialAccount.empty();
		_self.view.initialAccount.ctrl = _self.view.initialAccount.bindBaseAutocomplete({
		    options: _self.coreServices.requiredInformation.glAccountOptions
		});
		_self.view.finalAccount.empty();
		_self.view.finalAccount.ctrl = _self.view.finalAccount.bindBaseAutocomplete({
		    options: _self.coreServices.requiredInformation.glAccountOptions
		});
		_self.view.cnpj.empty();
		_self.view.cnpj.ctrl = _self.view.cnpj.bindBaseAutocomplete({
		    options: _self.coreServices.requiredInformation.cnpjOptions
		});
	},
	onChangeMonthHigh: function(oldVal, newVal) {
		var _self = this;
		var data = _self.getData();
		var monthOptions = [];
		for (var i = parseInt(newVal.key, 10) + 1; i < data.monthOptions.length; i++) {
			monthOptions.push(data.monthOptions[i]);
		}
		_self.view.executionMonthLow.empty();
		_self.view.executionMonthLow.ctrl = _self.view.executionMonthLow.bindBaseSelect({
			options: monthOptions
		});
	},
	onChangeCompany: function() {

	},
	renderSubperiod: function() {
		var _self = this;
		_self.view.period.empty();
		_self.view.period.ctrl = _self.view.period.bindBaseFiscalSubPeriodPicker({
			required: true,
			idCompany: _self.idCompany,
			uf: _self.uf,
			branch: _self.idBranch,
			idTax: _self.idTax,
			component: "DFG",
			privilege: "setting.execute",
			onChange: function(val) {
				_self.siblingCtrl.onChangePeriod(_self.view.period.ctrl.getValue());

			}

		});
	},
	getFormData: function() {
		var _self = this;
		var xmls = {};
		var data = {
			'tmf:ECDReportRun': {
				REPORT_ID: '0000000002',
				REPORT_KEY: '',
				ESTR_BALANCO: '',
				DESCRIPTION: '',
				REP_SHADOW_E: ''
			}
		};
		data['tmf:ECDReportRun'].REGISTER_RANGE = {
			SIGN: '',
			OPTION: '',
			LOW: _self.view.recordHigh.ctrl.getKey() ? _self.view.recordHigh.ctrl.getKey() : '',
			HIGH: _self.view.recordLow.ctrl.getKey() ? _self.view.recordLow.ctrl.getKey() : ''
		};
		data['tmf:ECDReportRun'].RUN_ID = '';
		var periodValue = _self.view.period.ctrl.getValue();
		data['tmf:ECDReportRun'].YEAR = periodValue.year;
		data['tmf:ECDReportRun'].MONTH_LOW = periodValue.endDate;
		data['tmf:ECDReportRun'].MONTH_HIGH = periodValue.startDate;

		if (_self.view.organizationalParams.cnpj.getChecked()) {
			data['tmf:ECDReportRun'].CNPJ = _self.view.cnpj.ctrl.getKey();
			var value;
			var options = _self.view.cnpj.ctrl.getOptions();
			for (var i = 0; i < options.length; i++) {
				if (options[i].key === _self.view.cnpj.ctrl.getKey()) {
					value = options[i];
					break;
				}
			}
			data['tmf:ECDReportRun'].BUKRS = value.idCompany;
		} else {
			data['tmf:ECDReportRun'].BUKRS = _self.view.company.ctrl.getKey();
		}
		data['tmf:ECDReportRun'].COD_CTA_INI = _self.view.initialAccount.getKey() ? _self.view.initialAccount.getKey() : '';
		data['tmf:ECDReportRun'].COD_CTA_FIN = _self.view.finalAccount.getKey() ? _self.view.finalAccount.getKey() : '';
		data['tmf:ECDReportRun'].LEDGER = _self.view.ledger.getKey() ? _self.view.ledger.getKey() : '';

		if (_self.view.organizationalParams.company.getChecked()) {
			data['tmf:ECDReportRun'].ORGSTR_PARAM = 'CE';
		} else {
			data['tmf:ECDReportRun'].ORGSTR_PARAM = 'ROOT';
		}
		data['tmf:ECDReportRun'].CTAALT = '';
		data['tmf:ECDReportRun'].CODVER = '';
		data['tmf:ECDReportRun'].CLUCRO = '';

	}
});