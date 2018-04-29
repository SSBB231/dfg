sap.ui.controller("app.controllers.executorSPED.ECF.execute", {
	onInit: function() {},
	onDataRefactor: function(data) {

	},
	onAfterRendering: function(html) {
		var _self = this;
		var data = _self.getData();
		_self.view = $(html);
		_self.view.runSpedECF = _self.view.find(".runSpedECF");
		_self.view.CompanyCode = _self.view.find(".Company-Code");
		_self.view.period = _self.view.find(".period");
		_self.view.finalPeriod = _self.view.find(".final-period");
		_self.view.rootCNPJ = _self.view.find(".rootCNPJ");
		_self.view.financialVersion = _self.view.find(".financial-version");
		_self.view.accountGL = _self.view.find(".initialAccount");
		_self.view.finalAccount = _self.view.find(".finalAccount");
		_self.view.ledger = _self.view.find(".Special-Ledger");
		_self.view.ECFversion = _self.view.find(".ECFversion");
		_self.view.record = _self.view.find(".record");
		_self.view.finalRecord = _self.view.find(".finalRecord");
		_self.view.draftOfficialRb = _self.view.find(".draft-Official-rb");
		_self.view.description = _self.view.find(".description");
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
		_self.bindElements();
		_self.bindComponents();

	},
	bindElements: function() {
		var _self = this;

		_self.view.CompanyCode.ctrl = _self.view.CompanyCode.bindBaseInput({
			required: true
		});
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
		/*_self.view.finalPeriod.ctrl = _self.view.finalPeriod.bindBaseDatePicker({
			required: true,
			onChange: function(oldVal, newVal) {},
			tooltip: {
				class: 'dark',
				position: 'right',
				text: ''
			}
		});*/
		_self.view.rootCNPJ.ctrl = _self.view.rootCNPJ.bindBaseInput({
			required: true
		});
		_self.view.financialVersion.ctrl = _self.view.financialVersion.bindBaseInput({
			required: true
		});
		_self.view.accountGL.ctrl = _self.view.accountGL.bindBaseSelect({

		});
		_self.view.finalAccount.ctrl = _self.view.finalAccount.bindBaseSelect({
		    
		});
		_self.view.ledger.ctrl = _self.view.ledger.bindBaseInput({

		});
		_self.view.ECFversion.ctrl = _self.view.ECFversion.bindBaseSelect({

		});
		_self.view.record.ctrl = _self.view.record.bindBaseInput({

		});
		_self.view.finalRecord.ctrl = _self.view.finalRecord.bindBaseInput({

		});
		_self.view.draftOfficialRb.draft = _self.view.draftOfficialRb.bindBaseRadioButton({
			id: 1,
			name: "draftOfficial_Rb",
			text: i18n("DRAFT"),
			onChange: function(oldVal, newVal) {}
		});
		_self.view.draftOfficialRb.official = _self.view.draftOfficialRb.bindBaseRadioButton({
			id: 1,
			name: "draftOfficial_Rb",
			text: i18n("OFFICIAL"),
			onChange: function(oldVal, newVal) {}
		});
		_self.view.description.ctrl = _self.view.description.bindBaseInput({

		});

	},
	bindComponents: function() {
		var _self = this;

		_self.view.accountGL.empty();
		_self.view.accountGL.ctrl = _self.view.accountGL.bindBaseAutocomplete({
			options: _self.coreServices.requiredInformation.glAccountOptions,
			onChange: function() {}

		});
		_self.view.finalAccount.empty();
		_self.view.finalAccount.ctrl = _self.view.finalAccount.bindBaseAutocomplete({
			options: _self.coreServices.requiredInformation.glAccountOptions,
			onChange: function() {}

		});
		var recordOptions = [];
		for (var i in _self.coreServices.requiredInformation.recordOptions) {
			recordOptions.push(_self.requiredInformation.recordOptions[i]);
		}
		_self.view.record.empty();
		_self.view.record.ctrl = _self.view.record.bindBaseAutocomplete({
			options: recordOptions,
			onChange: function() {}

		});
		_self.view.finalRecord.empty();
		_self.view.finalRecord.ctrl = _self.view.finalRecord.bindBaseAutocomplete({
			options: recordOptions,
			onChange: function() {}

		});
		/* _self.view.rootCNPJ.empty();
		_self.view.rootCNPJ.ctrl = _self.view.rootCNPJ.bindBaseAutocomplete({
		    required: true,
			options: _self.coreServices.requiredInformation.cnpjRootOptions,
			onChange: function() {}

		});*/
		_self.view.period.empty();
		_self.view.period.ctrl = _self.view.period.bindBaseFiscalSubPeriodPicker({
			required: true,
			idCompany: _self.idCompany,
			uf: _self.uf,
			branch: _self.idBranch,
			idTax: _self.idTax,
			component: "DFG",
			privilege: "setting.execute",
			onChange: function() {
				_self.onChangePeriod();
				_self.executeQuiz();
			}
		});
	},
	onChangePeriod: function() {
		var _self = this;
		var value = _self.view.period.ctrl.getValue();
		var startDate = parseDate(value.startDate.split("GMT")[0], "enus");
		var endDate = parseDate(value.endDate.split("GMT")[0], "enus");
		console.log(startDate, endDate);
		var spedStartDate;
		var spedEndDate;
		var spedVersions = [];
		var flag;
		for (var sv in _self.coreServices.requiredInformation.spedVersions) {
			spedStartDate = parseDate(_self.coreServices.requiredInformation.spedVersions[sv].validFrom, "enus");
			spedEndDate = parseDate(_self.coreServices.requiredInformation.spedVersions[sv].validTo, "enus");
			if (_self.compareDates(startDate, spedStartDate) && _self.compareDates(spedEndDate, endDate)) {
				spedVersions.push(_self.coreServices.requiredInformation.spedVersions[sv]);
			}
		}

		_self.view.ECFversion.empty();
		_self.view.ECFversion.ctrl = _self.view.ECFversion.bindBaseAutocomplete({
			options: spedVersions,
			required: true
		});
	},
	compareDates: function(date1, date2) {
		if (parseInt(date1.year, 10) < parseInt(date2.year, 10)) {
			return false;
		}
		if (parseInt(date1.year, 10) === parseInt(date2.year, 10)) {
			if (parseInt(date1.month, 10) < parseInt(date2.month, 10)) {
				return false;
			}
			if (parseInt(date1.month, 10) === parseInt(date2.month, 10)) {
				if (parseInt(date1.date, 10) < parseInt(date2.date, 10)) {
					return false;
				}
			}
		}

		return true;
	},
	executeQuiz: function() {
		var _self = this;
		var valid = false;
		var value = _self.view.period.ctrl.getValue();
		if (value.hasOwnProperty("startDate")) {
			var startDate = parseDate(value.startDate.split("GMT")[0], "enus");
			var endDate = parseDate(value.endDate.split("GMT")[0], "enus");
			var valueStartDate = startDate.ptrbr.reverse().join("");
			var valueEndDate = endDate.ptrbr.reverse().join("");

			for (var k = 0; k < _self.coreServices.quizAnswer.length; k++) {
				if (_self.coreServices.quizAnswer[k].validFromQuest <= valueStartDate &&
					_self.coreServices.quizAnswer[k].validToQuest >= valueEndDate) {
					_self.siblingCtrl.renderQuiz(_self.coreServices.quizAnswer[k]);
					valid = true;
				}
				if (_self.coreServices.quizAnswer.length === 0 || valid === false) {
					_self.siblingCtrl.quizDefault();
				}
			}
		}

	},
	validateForm: function() {
		var _self = this;
		if (!_self.view.CompanyCode.ctrl.getText()) {
			$.baseToast({
				type: 'w',
				text: i18n("MUST FILL FISCAL COMPANY")
			});
			return false;
		}
		var periodValue = _self.view.period.ctrl.getValue();
		if (periodValue.subperiod === "" || !periodValue.subperiod) {
			$.baseToast({
				type: 'w',
				text: i18n("MUST FILL SUBPERIOD")
			});
			return false;
		}
		if (!_self.view.rootCNPJ.ctrl.getKey()) {
			$.baseToast({
				type: 'w',
				text: i18n("MUST FILL CNPJ")
			});
			return false;
		}
		if (!_self.view.financialVersion.ctrl.getText()) {
			$.baseToast({
				type: 'w',
				text: i18n("MUST FILL FINANCIAL VERSION")
			});
			return false;
		}
		if (!_self.view.ECFversion.ctrl.getKey()) {
			$.baseToast({
				type: 'w',
				text: i18n("MUST FILL ECF VERSION")
			});
			return false;
		}
		return true;
	},
	getFormData: function() {
		var _self = this;

		var data = {
			'tmf:ECFreportExecution': {

			}
		};
		data['tmf:ECFreportExecution'].CnpjRoot = _self.view.rootCNPJ.ctrl.getKey();
		data['tmf:ECFreportExecution'].Empresa = _self.view.CompanyCode.ctrl.getKey();

		var periodValue = _self.view.period.ctrl.getValue();
		var startDate = parseDate(periodValue.startDate.split("GMT")[0], "enus");
		var endDate = parseDate(periodValue.endDate.split("GMT")[0], "enus");
		data['tmf:ECFreportExecution'].Dt_de = startDate.ptrbr.reverse().join("");
		data['tmf:ECFreportExecution'].Dt_ate = endDate.ptrbr.reverse().join("");

		data['tmf:ECFreportExecution'].Reg_de = _self.view.record.ctrl.getKey() ? _self.view.record.ctrl.getKey() : '';
		data['tmf:ECFreportExecution'].Reg_ate = _self.view.finalRecord.ctrl.getKey() ? _self.view.finalRecord.ctrl.getKey() : '';
		data['tmf:ECFreportExecution'].Cta_de = _self.view.accountGL.ctrl.getKey() ? _self.view.accountGL.ctrl.getKey() : '';
		data['tmf:ECFreportExecution'].Cta_ate = _self.view.finalAccount.ctrl.getKey() ? _self.view.finalAccount.ctrl.getKey() : '';
		data['tmf:ECFreportExecution'].Ledger = _self.view.ledger.ctrl.getText() ? _self.view.ledger.ctrl.getText() : '';
		data['tmf:ECFreportExecution'].EstrBalanco = _self.view.financialVersion.ctrl.getText() ? _self.view.financialVersion.ctrl.getText() : "";
		if (_self.view.draftOfficialRb.draft.getChecked()) {
			data['tmf:ECFreportExecution'].ExecOficial = '';
		} else {
			data['tmf:ECFreportExecution'].ExecOficial = 'X';
		}

		data['tmf:ECFreportExecution'].Cod_Ver = _self.view.ECFversion.ctrl.getKey() ? _self.view.ECFversion.ctrl.getKey() : '';
		data['tmf:ECFreportExecution'].Descricao = _self.view.description.ctrl.getText() ? _self.view.description.ctrl.getText() : '';
		data['tmf:ECFreportExecution'].UseCtaAlt = '';
		data['tmf:ECFreportExecution'].UseCLucro = '';

	}
});