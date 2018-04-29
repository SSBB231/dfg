sap.ui.controller("app.controllers.executorSPED.EFD-Contributions.executeForm", {
	onInit: function() {

	},
	onAfterRendering: function(html) {
		var _self = this;
		_self.view = $(html);
		_self.view.variant = _self.view.find(".variant-select");
		_self.view.initialRecord = _self.view.find(".initialRecord");
		_self.view.finalRecord = _self.view.find(".finalRecord");
		_self.view.period = _self.view.find(".period");
		_self.view.occurrence = _self.view.find(".occurrence-select");
		_self.view.allocation = _self.view.find(".allocation-select");
		_self.view.contributionType = _self.view.find(".contributionType-select");
		_self.view.criteria = _self.view.find(".criteria-select");
		_self.view.SCPCode = _self.view.find(".scp-code");
		_self.view.financialVersion = _self.view.find(".financialVersion-input");
		_self.view.paramRB = _self.view.find(".param-rb");
		_self.view.company = _self.view.find(".company-select");
		_self.view.cnpj = _self.view.find(".cnpj-select");
		_self.view.branch = _self.view.find(".branch-select");
		_self.view.bookKeepingType = _self.view.find(".bookkeeping-type");
		_self.view.lastReceipt = _self.view.find(".last-receipt");
		_self.view.reportVersion = _self.view.find(".report-version");
		_self.view.generateCB = _self.view.find(".generate-cb");
		_self.view.outputRB = _self.view.find(".output-rb");
		_self.view.fileName = _self.view.find(".file-name");
		_self.view.runRB = _self.view.find(".run-rb");
		_self.view.cnpj.parent().hide();
		_self.fileData = _self.getData().fileData;
		_self.companyOptions = {};
		_self.idCompany = [];
		_self.idBranch = [];
		_self.uf = [];
		_self.idTax = [];

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
		Data.endpoints.dfg.sped.createDialogEFDContributionsVariant.post({
			idCompany: _self.idCompany,
			idBranch: _self.idBranch,
			idTax: _self.idTax,
			uf: _self.uf
		}).success(function(data) {
			_self.requiredInformation = data;
			_self.bindComponents();
		});
		_self.bindElements();
	},
	bindElements: function() {
		var _self = this;
		var data = _self.getData();
		_self.view.variant.ctrl = _self.view.variant.bindBaseSelect({
			options: data.variants.map(function(v) {
				return {
					key: v.id,
					name: v.name,
					variantData: v
				};
			}),
			onChange: _self.onChangeVariant.bind(_self)
		});
		_self.view.initialRecord.ctrl = _self.view.initialRecord.bindBaseSelect({
			isLoading: true
		});
		_self.view.finalRecord.ctrl = _self.view.finalRecord.bindBaseSelect({
			isLoading: true
		});
		_self.view.period.ctrl = _self.view.period.bindBaseFiscalSubPeriodPicker({
			required: true,
			idCompany: _self.idCompany,
			uf: _self.uf,
			branch: _self.idBranch,
			idTax: _self.idTax,
			component: "DFG",
			privilege: "setting.execute"
		});

		_self.view.occurrence.ctrl = _self.view.occurrence.bindBaseSelect({
			isLoading: true
		});
		_self.view.allocation.ctrl = _self.view.allocation.bindBaseSelect({
			isLoading: true
		});
		_self.view.contributionType.ctrl = _self.view.contributionType.bindBaseSelect({
			isLoading: true
		});
		_self.view.criteria.ctrl = _self.view.criteria.bindBaseSelect({
			isLoading: true
		});
		_self.view.SCPCode.ctrl = _self.view.SCPCode.bindBaseInput({

		});
		_self.view.financialVersion.ctrl = _self.view.financialVersion.bindBaseInput({

		});
		_self.view.paramRB.company = _self.view.paramRB.bindBaseRadioButton({
			name: "params",
			text: i18n("COMPANY"),
			onChange: function(oldVal, newVal) {
				_self.view.company.parent().show();
				_self.view.cnpj.parent().hide();
			}
		});
		_self.view.paramRB.cnpj = _self.view.paramRB.bindBaseRadioButton({
			name: "params",
			text: i18n("ROOT CNPJ"),
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
			isLoading: true,
			required: true
		});
		_self.view.branch.ctrl = _self.view.branch.bindBaseSelect({
			isLoading: true
		});
		_self.view.bookKeepingType.ctrl = _self.view.bookKeepingType.bindBaseSelect({
			isLoading: true,
			required: true
		});
		_self.view.lastReceipt.ctrl = _self.view.lastReceipt.bindBaseInput({

		});
		_self.view.reportVersion.ctrl = _self.view.reportVersion.bindBaseSelect({
			isLoading: true
		});
		_self.view.generateCB.consolidated = _self.view.generateCB.bindBaseCheckbox({
			text: i18n("CONSOLIDATED VIEW"),
			onChange: function(oldVal, newVal) {

			}
		});
		_self.view.generateCB.generateM = _self.view.generateCB.bindBaseCheckbox({
			text: i18n("GENERATE BLOCK M"),
			onChange: function(oldVal, newVal) {

			}
		});

		_self.view.runRB.official = _self.view.runRB.bindBaseRadioButton({
			text: i18n("OFFICIAL RUN"),
			name: "run",
			onChange: function(oldVal, newVal) {

			}
		});
		_self.view.runRB.test = _self.view.runRB.bindBaseRadioButton({
			text: i18n("DRAFT"),
			name: "run",
			onChange: function(oldVal, newVal) {

			}
		});
	},
	onChangeVariant: function(oldVal, newVal) {
		var _self = this;
		var variantData = newVal.variantData;
		_self.view.initialRecord.ctrl.setKey(variantData.REGISTER_LOW);
		_self.view.finalRecord.ctrl.setKey(variantData.REGISTER_HIGH);
		_self.view.period.ctrl.setValue({
			idCompany: _self.idCompany,
			uf: _self.uf,
			branch: _self.idBranch,
			idTax: _self.idTax,
			year: variantData.YEAR,
			month: variantData.MONTH,
			subperiod: variantData.SUBPERIOD,
			required: true,
			component: "DFG",
			privilege: "setting.execute"
		});
		_self.view.company.ctrl.setKey(variantData.BUKRS);
		_self.view.branch.ctrl.setKey(variantData.ESTRBA);
		_self.view.reportVersion.ctrl.setKey(variantData.CODVER);
		_self.view.cnpj.ctrl.setKey(variantData.CNPJ);
		_self.view.lastReceipt.ctrl.setText(variantData.NUMREC);
		_self.view.generateCB.consolidated.setChecked(variantData.CONSOL);
		_self.view.generateCB.generateM.setChecked(variantData.BLOCK_M);
		_self.view.occurrence.ctrl.setKey(variantData.INCTRI);
		_self.view.allocation.ctrl.setKey(variantData.APROCR);
		_self.view.contributionType.ctrl.setKey(variantData.TIPCON);
		_self.view.criteria.ctrl.setKey(variantData.REGCUM);
		_self.view.SCPCode.ctrl.setText(variantData.CODSCP);
		_self.view.runRB.official.setChecked(variantData.OFFICIAL_DATA);
		_self.view.runRB.test.setChecked(variantData.OFFICIAL_DATA);

	},
	bindComponents: function() {
		var _self = this;
		var recordOptions = [];
		for (var i in _self.requiredInformation.recordOptions) {
			recordOptions.push(_self.requiredInformation.recordOptions[i]);
		}
		_self.view.initialRecord.empty();
		_self.view.initialRecord.ctrl = _self.view.initialRecord.bindBaseAutocomplete({
			options: recordOptions

		});
		_self.view.finalRecord.empty();
		_self.view.finalRecord.ctrl = _self.view.finalRecord.bindBaseAutocomplete({
			options: recordOptions

		});
		_self.view.occurrence.empty();
		_self.view.occurrence.ctrl = _self.view.occurrence.bindBaseSelect({
			options: _self.requiredInformation.taxOccurrence
		});
		_self.view.allocation.empty();
		_self.view.allocation.ctrl = _self.view.allocation.bindBaseSelect({
			options: _self.requiredInformation.creditAllocation
		});
		_self.view.contributionType.empty();
		_self.view.contributionType.ctrl = _self.view.contributionType.bindBaseSelect({
			options: _self.requiredInformation.contribution
		});
		_self.view.criteria.empty();
		_self.view.criteria.ctrl = _self.view.criteria.bindBaseSelect({
			options: _self.requiredInformation.adoptedCriteria
		});
		_self.view.bookKeepingType.empty();
		_self.view.bookKeepingType.ctrl = _self.view.bookKeepingType.bindBaseSelect({
			options: _self.requiredInformation.bookKeeping,
			required: true
		});
		var spedVersions = [];
		for (var sv in _self.requiredInformation.spedVersions) {
			spedVersions.push(_self.requiredInformation.spedVersions[sv]);
		}
		_self.view.reportVersion.empty();
		_self.view.reportVersion.ctrl = _self.view.reportVersion.bindBaseSelect({
			options: spedVersions
		});
		_self.view.period.empty();
		_self.view.period.ctrl = _self.view.period.bindBaseFiscalSubPeriodPicker({
			required: true,
			idCompany: _self.idCompany,
			uf: _self.uf,
			branch: _self.idBranch,
			idTax: _self.idTax,
			component: "DFG",
			privilege: "setting.execute",
			onChange: _self.onChangePeriod.bind(_self)
		});
	},
	onChangeCompany: function(oldVal, newVal) {
		var _self = this;
		var branchOptions = [];
		for (var i in newVal.idBranch) {
			branchOptions.push(newVal.idBranch[i]);
		}
		_self.view.branch.empty();
		_self.view.branch.ctrl = _self.view.branch.bindBaseSelect({
			options: branchOptions
		});
		if (branchOptions.length === 1) {
			_self.view.branch.ctrl.setKey(branchOptions[0].key);
		}
	},
	onChangePeriod: function(val) {
		var _self = this;
		var cnpjOptions = _self.requiredInformation.cnpjOptions;
		var value = _self.view.period.ctrl.getValue();
		var pStartDate = parseDate(value.startDate, "enus");
		var pEndDate = parseDate(value.startDate, "enus")
		var cStartDate, cEndDate, valid;
		var validCNPJ = [];
		for (var i = 0; i < cnpjOptions.length; i++) {
			cStartDate = parseDate(cnpjOptions[i].validFrom, "enus");
			cEndDate = parseDate(cnpjOptions[i].validTo, "enus");
			if (_self.compareDates(pStartDate, cStartDate) && _self.compareDates(cEndDate, pEndDate)) {
				validCNPJ.push(cnpjOptions[i]);
			}
		}
		_self.view.cnpj.empty();
		_self.view.cnpj.ctrl = _self.view.cnpj.bindBaseSelect({
			options: validCNPJ,
			onChange: _self.onChangeCNPJ.bind(_self),
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
	onChangeCNPJ: function(oldVal, newVal) {
		var _self = this;
		var _self = this;
		var branchOptions = [{
			key: newVal.idBranch,
			name: newVal.idBranch
        }];
		_self.view.branch.empty();
		_self.view.branch.ctrl = _self.view.branch.bindBaseSelect({
			options: branchOptions
		});
		if (branchOptions.length === 1) {
			_self.view.branch.ctrl.setKey(branchOptions[0].key);
		}
	},
	validateForm: function() {
		var _self = this;
		var periodValue = _self.view.period.ctrl.getValue();
		if (periodValue.subperiod === "" || !periodValue.subperiod) {
			$.baseToast({
				type: 'w',
				text: i18n("MUST FILL SUBPERIOD")
			});
			return false;
		}
		if (!_self.view.bookKeepingType.ctrl.getKey()) {
			$.baseToast({
				type: 'w',
				text: i18n("MUST FILL BOOKKEEPING TYPE")
			});
			return false;
		}
		if (_self.view.paramRB.cnpj.getChecked()) {
			if (!_self.view.cnpj.ctrl.getKey()) {
				$.baseToast({
					type: 'w',
					text: i18n("MUST FILL CNPJ")
				});
				return false;
			}
		} else {
			if (!_self.view.company.ctrl.getKey()) {
				$.baseToast({
					type: 'w',
					text: i18n("MUST FILL COMPANY")
				});
				return false;
			}
		}

		return true;
	},
	getFormData: function() {
		var _self = this;
		var data = {
			'tmf:PCOReportRun': {

			}
		};
		var periodValue = _self.view.period.ctrl.getValue();
		data['tmf:PCOReportRun'].YEAR = periodValue.year;
		data['tmf:PCOReportRun'].MONTH = periodValue.month;
		data['tmf:PCOReportRun'].SUBPERIOD = periodValue.subperiod;
		data['tmf:PCOReportRun'].REGISTER_RANGE = {
			SIGN: '',
			OPTION: '',
			LOW: _self.view.initialRecord.ctrl.getKey() ? _self.view.initialRecord.ctrl.getKey() : '',
			HIGH: _self.view.finalRecord.ctrl.getKey() ? _self.view.finalRecord.ctrl.getKey() : ''
		};
		data['tmf:PCOReportRun'].CODVER = _self.view.reportVersion.ctrl.getKey() ? _self.view.reportVersion.ctrl.getKey() : '';
		data['tmf:PCOReportRun'].ORGSTR_PARAM = 'CC';
		if (_self.view.paramRB.cnpj.getChecked()) {
			data['tmf:PCOReportRun'].CNPJ = _self.view.cnpj.ctrl.getKey();
			data['tmf:PCOReportRun'].ORGSTR_PARAM = 'ROOT';
			var value;
			var options = _self.view.cnpj.ctrl.getOptions();
			for (var i = 0; i < options.length; i++) {
				if (options[i].key === _self.view.cnpj.ctrl.getKey()) {
					value = options[i];
					break;
				}
			}
			data['tmf:PCOReportRun'].BUKRS = value.idCompany; 
		} else {
			data['tmf:PCOReportRun'].BUKRS = _self.view.company.ctrl.getKey();
		}
		data['tmf:PCOReportRun'].ESTRBA = _self.view.financialVersion.ctrl.getText();
		data['tmf:PCOReportRun'].TP_ESC = _self.view.bookKeepingType.ctrl.getKey() || "";
		data['tmf:PCOReportRun'].NUMREC = _self.view.lastReceipt.ctrl.getText();
		data['tmf:PCOReportRun'].CONSOL = _self.view.generateCB.consolidated.getChecked() ? "X" : "";
		data['tmf:PCOReportRun'].BLOCK_M = _self.view.generateCB.generateM.getChecked() ? "X" : "";
		data['tmf:PCOReportRun'].INCTRI = _self.view.occurrence.ctrl.getKey() || "";
		data['tmf:PCOReportRun'].APROCR = _self.view.allocation.ctrl.getKey() || "";
		data['tmf:PCOReportRun'].TIPCON = _self.view.contributionType.ctrl.getKey() || "";
		data['tmf:PCOReportRun'].REGCUM = _self.view.criteria.ctrl.getKey() || "";
		data['tmf:PCOReportRun'].CODSCP = _self.view.SCPCode.ctrl.getText();
		if (_self.view.runRB.official.getChecked()) {
			data['tmf:PCOReportRun'].OFFICIAL_RUN = "X";
		} else {
			data['tmf:PCOReportRun'].OFFICIAL_RUN = '';
		}
		return data;
	}
});