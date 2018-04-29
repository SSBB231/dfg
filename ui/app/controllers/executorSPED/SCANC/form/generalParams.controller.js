sap.ui.controller("app.controllers.executorSPED.SCANC.form.generalParams", {
	onInit: function() {

	},
	onAfterRendering: function(html) {
		var _self = this;
		_self.view = $(html);
		_self.view.company = _self.view.find(".company-select");
		_self.view.branch = _self.view.find(".branch-select");
		_self.view.uf = _self.view.find(".uf-select");
		_self.view.tax = _self.view.find(".tax-select");
		_self.view.subperiod = _self.view.find(".subperiod-select");
		_self.view.executionTypeRB = _self.view.find(".exeuction-type-rb");
		_self.view.manualParamsWrapper = _self.view.find(".manual-params-wrapper");
		_self.view.expandElement = _self.view.find(".expand-element");
		_self.bindElements();
		_self.bindManualParams();
	},
	bindElements: function() {
		var _self = this;
		var _data = _self.getData();
		var companyOptions = [];
		for (var eefi in _data.eefiInfo) {
			companyOptions.push(_data.eefiInfo[eefi]);
		}
		_self.view.company.ctrl = _self.view.company.bindBaseSelect({
			options: companyOptions,
			tooltip: i18n("TILE COMPANY TOOLTIP"),
			required: true,
			placeholder: i18n("TILE COMPANY"),
			onChange: _self.onChangeCompany.bind(this)
		});
		_self.view.branch.ctrl = _self.view.branch.bindBaseMultipleSelect3({
			isLoading: true,
			isDisabled: true,
			tooltip: i18n("TILE BRANCH TOOLTIP"),
			placeholder: i18n("TILE BRANCH")
		});
		_self.view.uf.ctrl = _self.view.uf.bindBaseMultipleSelect3({
			isLoading: true,
			isDisabled: true,
			tooltip: i18n("TILE UF TOOLTIP"),
			placeholder: i18n("TILE UF")
		});
		_self.view.tax.ctrl = _self.view.tax.bindBaseSelect({
			isLoading: true,
			tooltip: i18n("TILE TAX TOOLTIP"),
			placeholder: i18n("TILE TAX")
		});
		_self.view.subperiod.ctrl = _self.view.subperiod.bindBaseFiscalSubPeriodPicker({
			required: true,
			isLoading: true,
			idCompany: _self.idCompany,
			uf: _self.uf,
			branch: _self.idBranch,
			idTax: _self.idTax,
			component: "DFG",
			privilege: "setting.execute"
		});
		_self.view.expandElement.click(function(e) {
			var icon;
			if ($(this).find(".icon-expand").length) {
				_self.view.manualParamsWrapper.find(".mp-records-wrapper").slideDown();
				_self.view.manualParamsWrapper.find(".mp-manualParamInputContainer").slideDown();
				icon = $(this).find(".icon-expand");
				icon.removeClass("icon-expand");
				icon.addClass("icon-collapse");
				var ib = _self.view.manualParamsWrapper.find(".expand-icon").find(".icon");
				ib.removeClass("icon-downmenu");
				ib.addClass("icon-upmenu");
			} else {
				_self.view.manualParamsWrapper.find(".mp-records-wrapper").slideUp();
				_self.view.manualParamsWrapper.find(".mp-manualParamInputContainer").slideUp();
				icon = $(this).find(".icon-collapse");
				icon.removeClass("icon-collapse");
				icon.addClass("icon-expand");
				var ib = _self.view.manualParamsWrapper.find(".expand-icon").find(".icon");
				ib.removeClass("icon-upmenu");
				ib.addClass("icon-downmenu");
			}
		});
	},
	bindManualParams: function() {
		var _self = this;
		var _data = _self.getData();
		var json = JSON.parse(_data.fileData.layout[0].json);
		var manualParams = {};
		for (var block = 0; block < json.positions.length; block++) {
			for (var record = 0; record < json.blocks[json.positions[block]].positions.length; record++) {
				var recordObject = json.blocks[json.positions[block]].records[json.blocks[json.positions[block]].positions[record]];
				for (var column = 0; column < recordObject.positions.length; column++) {
					if (recordObject.columns[recordObject.positions[column]].hasOwnProperty('manualParam') || recordObject.columns[recordObject.positions[
						column]].hasOwnProperty('fixedManualField')) {
						if (!manualParams[json.positions[block]]) {
							manualParams[json.positions[block]] = {
								name: json.blocks[json.positions[block]].name,
								records: {}
							};
						}
						if (!manualParams[json.positions[block]].records[json.blocks[json.positions[block]].positions[record]]) {
							manualParams[json.positions[block]].records[json.blocks[json.positions[block]].positions[record]] = {
								name: recordObject.name,
								manualParams: [],
								manualParamsIds: [],
								manualParamsCtrl: [],
								fixedManualFields: [],
								fixedManualFieldsIds: [],
								fixedManualFieldsCtrl: []
							};
						}
						if (recordObject.columns[recordObject.positions[column]].hasOwnProperty('manualParam')) {
							manualParams[json.positions[block]].records[json.blocks[json.positions[block]].positions[record]].manualParams.push(recordObject.columns[
								recordObject.positions[column]]);
							manualParams[json.positions[block]].records[json.blocks[json.positions[block]].positions[record]].manualParamsIds.push(recordObject
								.positions[column]);
						}
						if (recordObject.columns[recordObject.positions[column]].hasOwnProperty('fixedManualField')) {
							manualParams[json.positions[block]].records[json.blocks[json.positions[block]].positions[record]].fixedManualFields.push(
								recordObject.columns[recordObject.positions[column]]);
							manualParams[json.positions[block]].records[json.blocks[json.positions[block]].positions[record]].fixedManualFieldsIds.push(
								recordObject.positions[column]);

						}
					}

				}
			}
		}
		for (var b in manualParams) {
			var blockContainer = document.createElement("div");
			blockContainer.className = "mp-blockContainer";
			var blockName = document.createElement('div');
			blockName.className = "mp-blockName";
			var labelBlockName = document.createElement("label");
			labelBlockName.textContent = manualParams[b].name;
			var recordWrapper = document.createElement("div");
			recordWrapper.className = "mp-records-wrapper";
			blockName.append(labelBlockName);
			blockContainer.appendChild(blockName);
			var divExpand = document.createElement("div");
			var iconExpand = document.createElement("span");
			iconExpand.className = "icon icon-font-Sign-and-Symbols icon-upmenu";
			divExpand.append(iconExpand);
			divExpand.className = "expand-icon";
			blockName.appendChild(divExpand);

			$(divExpand).click(function(e) {
				var icon;
				if ($(this).find(".icon-upmenu").length) {
					$(this).parent().parent().find(".mp-records-wrapper").slideUp();
					icon = $(this).find(".icon-upmenu");
					icon.removeClass("icon-upmenu");
					icon.addClass("icon-downmenu");
				} else {
					$(this).parent().parent().find(".mp-records-wrapper").slideDown();
					icon = $(this).find(".icon-downmenu");
					icon.removeClass("icon-downmenu");
					icon.addClass("icon-upmenu");
				}

			});
			for (var r in manualParams[b].records) {
				var recordContainer = document.createElement("div");
				recordContainer.className = "mp-recordContainer";
				var recordName = document.createElement("div");
				recordName.className = "mp-recordName";
				var labelRecordName = document.createElement("label");
				labelRecordName.textContent = manualParams[b].records[r].name;
				recordName.append(labelRecordName);
				recordContainer.appendChild(recordName);
				var divExpandR = document.createElement("div");
				var iconExpandR = document.createElement("span");
				iconExpandR.className = "icon icon-font-Sign-and-Symbols icon-upmenu";
				divExpandR.append(iconExpandR);
				divExpandR.className = "expand-icon";
				recordName.appendChild(divExpandR);
				$(divExpandR).click(function(e) {
					var icon;
					if ($(this).find(".icon-upmenu").length) {
						$(this).parent().parent().find(".mp-manualParamInputContainer").slideUp();
						icon = $(this).find(".icon-upmenu");
						icon.removeClass("icon-upmenu");
						icon.addClass("icon-downmenu");
					} else {
						$(this).parent().parent().find(".mp-manualParamInputContainer").slideDown();
						icon = $(this).find(".icon-downmenu");
						icon.removeClass("icon-downmenu");
						icon.addClass("icon-upmenu");
					}

				});
				var manualParamInputContainer = document.createElement("div");
				manualParamInputContainer.className = "mp-manualParamInputContainer";
				var fixedManualFieldInputContainer = document.createElement("div");
				fixedManualFieldInputContainer.className = "mp-manualParamInputContainer";
				for (var mp = 0; mp < manualParams[b].records[r].manualParams.length; mp++) {
					var manualParamContainer = document.createElement("div");
					manualParamContainer.className = "mp-manualParamContainer";
					var manualParamName = document.createElement("div");
					manualParamName.className = "mp-manualParamLabel";
					var labelManualParamName = document.createElement("label");
					labelManualParamName.textContent = manualParams[b].records[r].manualParams[mp].manualParam.label;
					var manualParamInput = document.createElement("div");
					manualParamInput.className = "mp-manualParamInput";
					manualParamName.append(labelManualParamName);
					manualParamContainer.appendChild(manualParamName);
					manualParamContainer.appendChild(manualParamInput);
					switch (manualParams[b].records[r].manualParams[mp].manualParam.type) {
						case "NVARCHAR":
						case "DECIMAL":
							manualParams[b].records[r].manualParamsCtrl.push($(manualParamInput).bindBaseInput({
								tooltip: i18n("ADD FIELD TOOLTIP") + " " + manualParams[b].records[r].manualParams[mp].manualParam.label,
								placeholder: manualParams[b].records[r].manualParams[mp].manualParam.label
							}));
							break;
						case "TIMESTAMP":
							manualParams[b].records[r].manualParamsCtrl.push($(manualParamInput).bindBaseDatePicker({
								tooltip: i18n("ADD FIELD TOOLTIP") + " " + manualParams[b].records[r].manualParams[mp].manualParam.label,
								placeholder: manualParams[b].records[r].manualParams[mp].manualParam.label
							}));
							break;
					}
					manualParamInputContainer.appendChild(manualParamContainer);

				}
				for (var fm = 0; fm < manualParams[b].records[r].fixedManualFields.length; fm++) {
					var fixedManualFieldContainer = document.createElement("div");
					fixedManualFieldContainer.className = "mp-manualParamContainer";
					var fixedManualFieldName = document.createElement("div");
					fixedManualFieldName.className = "mp-manualParamLabel";
					var labelFixedManualFieldName = document.createElement("label");
					labelFixedManualFieldName.textContent = manualParams[b].records[r].fixedManualFields[fm].fixedManualField.name;
					var fixedManualFieldInput = document.createElement("div");
					fixedManualFieldInput.className = "mp-manualParamInput";
					fixedManualFieldName.append(labelFixedManualFieldName);
					fixedManualFieldContainer.appendChild(fixedManualFieldName);
					fixedManualFieldContainer.appendChild(fixedManualFieldInput);
					var defaultOption = null;
					manualParams[b].records[r].fixedManualFieldsCtrl.push($(fixedManualFieldInput).bindBaseSelect({
						tooltip: i18n("ADD FIELD TOOLTIP") + " " + manualParams[b].records[r].fixedManualFields[fm].fixedManualField.name,
						placeholder: manualParams[b].records[r].fixedManualFields[fm].fixedManualField.name,
						required: manualParams[b].records[r].fixedManualFields[fm].fixedManualField.required,
						options: manualParams[b].records[r].fixedManualFields[fm].fixedManualField.options.map(function(o) {
						    if(o.checked){
						        defaultOption = o.optionNumber;
						    }
							return {
								key: o.optionNumber,
								name: o.option
							};
						})
					}));
					if(defaultOption !== null){
					    manualParams[b].records[r].fixedManualFieldsCtrl[manualParams[b].records[r].fixedManualFieldsCtrl.length-1].setKey(defaultOption);
					}
					fixedManualFieldInputContainer.appendChild(fixedManualFieldContainer);

				}

				recordContainer.appendChild(manualParamInputContainer);
				recordContainer.appendChild(fixedManualFieldInputContainer);
				recordWrapper.appendChild(recordContainer);
			}
			blockContainer.appendChild(recordWrapper);
			_self.view.manualParamsWrapper.append(blockContainer);
		}
		_self.manualParams = manualParams;
		if(Object.keys(manualParams).length === 0){
		    _self.view.manualParamsWrapper.parent().hide();
		}
	},
	onChangeCompany: function(oldVal, newVal) {
		var _self = this;
		_self.view.branch.empty();
		var branchOptions = [];
		var branch = [],
			idTax = [],
			uf = [];

		for (var b in newVal.idBranch) {
			branchOptions.push(newVal.idBranch[b]);
			branch.push(b);
			for (var u in newVal.idBranch[b].uf) {
				uf.push(u);
				for (var t in newVal.idBranch[b].uf[u].idTax) {
					idTax.push(t);
				}
			}
		}
		_self.view.branch.ctrl = _self.view.branch.bindBaseMultipleSelect3({
			options: branchOptions,
			tooltip: i18n("TILE BRANCH TOOLTIP"),
			placeholder: i18n("TILE BRANCH"),
			onChange: _self.onChangeBranch.bind(_self)
		});
		_self.view.uf.empty();
		_self.view.uf.ctrl = _self.view.uf.bindBaseMultipleSelect3({
			isLoading: true,
			isDisabled: true,
			tooltip: i18n("TILE UF TOOLTIP"),
			placeholder: i18n("TILE UF")
		});
		_self.view.tax.empty();
		_self.view.tax.ctrl = _self.view.tax.bindBaseSelect({
			isLoading: true,
			tooltip: i18n("TILE TAX TOOLTIP"),
			placeholder: i18n("TILE TAX")
		});
		_self.view.subperiod.empty();
		_self.view.subperiod.ctrl = _self.view.subperiod.bindBaseFiscalSubPeriodPicker({
			required: true,
			idCompany: newVal.key,
			uf: uf,
			branch: branch,
			idTax: idTax,
			component: "DFG",
			privilege: "setting.execute"
		});
	},
	onChangeBranch: function(newVal) {
		var _self = this;
		var ufOptions = [];
		var idTax = [],
			uf = [];
		for (var k = 0; k < newVal.length; k++) {
			for (var u in newVal[k].uf) {
				ufOptions.push(newVal[k].uf[u]);
				uf.push(u);
				for (var t in newVal[k].uf[u].idTax) {
					idTax.push(t);
				}
			}
		}

		_self.view.uf.empty();
		_self.view.uf.ctrl = _self.view.uf.bindBaseMultipleSelect3({
			options: ufOptions,
			tooltip: i18n("TILE UF TOOLTIP"),
			placeholder: i18n("TILE UF"),
			onChange: _self.onChangeUF.bind(this)
		});
		_self.view.tax.empty();
		_self.view.tax.ctrl = _self.view.tax.bindBaseSelect({
			isLoading: true,
			tooltip: i18n("TILE TAX TOOLTIP"),
			placeholder: i18n("TILE TAX")
		});
		_self.view.subperiod.empty();
		_self.view.subperiod.ctrl = _self.view.subperiod.bindBaseFiscalSubPeriodPicker({
			required: true,
			idCompany: _self.view.company.ctrl.getKey(),
			uf: uf,
			branch: _self.view.branch.ctrl.getKeys(),
			idTax: idTax,
			component: "DFG",
			privilege: "setting.execute"
		});

	},
	onChangeUF: function(newVal) {
		var idTaxOptions = [],
			idTax = [];
		var _self = this;
		for (var k = 0; k < newVal.length; k++) {
			for (var t in newVal[k].idTax) {
				idTaxOptions.push(newVal[k].idTax[t]);
				idTax.push(t);
			}

		}
		_self.view.tax.empty();
		_self.view.tax.ctrl = _self.view.tax.bindBaseSelect({
			options: idTaxOptions,
			tooltip: i18n("TILE TAX TOOLTIP"),
			placeholder: i18n("TILE TAX"),
			onChange: _self.onChangeTax.bind(_self)
		});
		_self.view.subperiod.empty();
		_self.view.subperiod.ctrl = _self.view.subperiod.bindBaseFiscalSubPeriodPicker({
			required: true,
			idCompany: _self.view.company.ctrl.getKey(),
			uf: _self.view.uf.ctrl.getKeys(),
			branch: _self.view.branch.ctrl.getKeys(),
			idTax: idTax,
			component: "DFG",
			privilege: "setting.execute"
		});
	},
	onChangeTax: function(olcVal, newVal) {
		var _self = this;
		_self.view.subperiod.empty();
		_self.view.subperiod.ctrl = _self.view.subperiod.bindBaseFiscalSubPeriodPicker({
			required: true,
			idCompany: _self.view.company.ctrl.getKey(),
			uf: _self.view.uf.ctrl.getKeys(),
			branch: _self.view.branch.ctrl.getKeys(),
			idTax: newVal.key,
			component: "DFG",
			privilege: "setting.execute"
		});
	},
	validate: function() {
		var _self = this;
		if(!_self.view.company.ctrl.validate() || !_self.view.subperiod.ctrl.getValue().subperiod){
		    $.baseToast({
		        text: i18n("FILL ALL FIELDS"),
		        type: "w"
		    });
		    return false;
		}
		return _self.view.company.ctrl.validate() && _self.view.subperiod.ctrl.getValue().subperiod && _self.validateManualParams();
	},
	getOrganizationParams: function() {
		var _self = this;
		var subPeriodVal = _self.view.subperiod.ctrl.getValue();
		var params = {
			company: _self.view.company.ctrl.getKey(),
			branch: _self.view.branch.ctrl.getKeys(),
			uf: _self.view.uf.ctrl.getKeys(),
			tax: _self.view.tax.ctrl.getKey(),
			subPeriod: subPeriodVal,
			initSubPeriod: subPeriodVal.startDate,
			endSubPeriod: subPeriodVal.endDate
		};
		if(params.branch.length === 0){
		    delete params.branch;
		}
		if(params.uf.length === 0){
		    delete params.uf;
		}
		return params;
	},
	validateManualParams: function() {
		var _self = this;
		var manualParams = _self.manualParams;
		var areValid = true;
		for (var b in manualParams) {
			for (var r in manualParams[b].records) {
				var manualParamsFields = manualParams[b].records[r].manualParams;
				for (var mp = 0; mp < manualParamsFields.length; mp++) {
					var value = manualParams[b].records[r].manualParamsCtrl[mp].getValue();
					if(value && value.hasOwnProperty("hanaDate")){
					    value = value.hanaDate;
					}
					if (value !== "" && value !== undefined) {
						switch (manualParamsFields[mp].manualParam.type) {
							case "NVARCHAR":
								if (value.length > parseInt(manualParamsFields[mp].manualParam.length, 10)) {
									areValid = false;
									$.baseToast({
										text: i18n("INVALID LENGTH FOR") + " " + manualParamsFields[mp].manualParam.label,
										type: "w"
									});
								}
								break;
							case "DECIMAL":
								if (isNaN(parseInt(value, 10))) {
									areValid = false;
									$.baseToast({
										text: i18n("INVALID TYPE FOR") + " " + manualParamsFields[mp].manualParam.label,
										type: "w"
									});
								} else if (value.length > parseInt(manualParamsFields[mp].manualParam.length, 10)) {
									areValid = false;
									$.baseToast({
										text: i18n("INVALID LENGTH FOR") + " " + manualParamsFields[mp].manualParam.label,
										type: "w"
									});
								}
								break;
							case "TIMESTAMP":
								break;
						}

					}
					if (!areValid) {
						return areValid;
					}
				}
				var fixedManualFields = manualParams[b].records[r].fixedManualFields;
				for (var fm = 0; fm < fixedManualFields.length; fm++) {
					if (fixedManualFields[fm].fixedManualField.required) {
						areValid = manualParams[b].records[r].fixedManualFieldsCtrl[fm].validate();
						if (!areValid) {
							$.baseToast({
								text: i18n("FILL OBLIGATORY FIELD") + " " + fixedManualFields[fm].fixedManualField.name,
								type: "w"
							});
						}
					}
					if (!areValid) {
						return areValid;
					}
				}
			}
		}
		return areValid;
	},
	getManualParams: function() {
		var _self = this;
		var manualParams = _self.manualParams;
		var data = {};
		for (var b in manualParams) {
			data[b] = {
				records: {}
			};
			for (var r in manualParams[b].records) {
				data[b].records[r] = {};
				var manualParamsFields = manualParams[b].records[r].manualParams;
				for (var mp = 0; mp < manualParamsFields.length; mp++) {
					var value = manualParams[b].records[r].manualParamsCtrl[mp].getValue();
					if(value && value.hasOwnProperty("hanaDate")){
					    value = value.hanaDate;
					}
					if (value !== "" && value !== undefined) {
						data[b].records[r][manualParams[b].records[r].manualParamsIds[mp]] = {
									value: value
						};

					} else {
						data[b].records[r][manualParams[b].records[r].manualParamsIds[mp]] = {
							value: ""
						};
					}
				}
				var fixedManualFields = manualParams[b].records[r].fixedManualFields;
				for (var fm = 0; fm < fixedManualFields.length; fm++) {
					if (manualParams[b].records[r].fixedManualFieldsCtrl[fm].getKey()) {
						data[b].records[r][manualParams[b].records[r].fixedManualFieldsIds[fm]] = {
							value: manualParams[b].records[r].fixedManualFieldsCtrl[fm].getSelectedOption().name
						};
					} else {
						data[b].records[r][manualParams[b].records[r].fixedManualFieldsIds[fm]] = {
							value: ""
						};
					}

				}
			}
		}
		return data;

	}
});