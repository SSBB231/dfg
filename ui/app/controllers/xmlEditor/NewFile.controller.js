sap.ui.controller("app.controllers.xmlEditor.NewFile", {
	onInit: function() {
		this.data = {
			description: {
				'class': "textarea-class",
				id: "textarea-id"
			}
		};
	},

	onDataRefactor: function(data) {
		// if (data.type !== undefined && (data.type == 'setting' || data.type == 'an4'))
		//     data.fullType = true;
		// if (data.type !== undefined && (data.type == 'setting' || data.type == 'layout'))
		//     data.slType = true;
		// if (data.type !== undefined && (data.type == 'setting' || data.type == 'layout' || data.type == 'an4'))
		//     data.taxAll = true;
		// return $.extend(data, this.data);
	},

	onAfterRendering: function(html) {
		var _self = this;
		this.loader = $('#create-file-dialog').parent().parent().baseLoader({
			modal: true
		});
		_self.view = $(html);

		// _self.view.layoutCopyFrom = _self.view.find('#inputCopyFrom');
		// _self.view.copyVersion = _self.view.find('#copiaVersion')
		_self.view.layoutName = _self.view.find('#inputTextFileName');
		_self.view.layoutDescription = _self.view.find('#textareaDescription');
		// _self.view.layoutType = _self.view.find('#inputSelectTypeFile');
		_self.view.layoutStructureGroup = _self.view.find('#inputStructureParent');
		_self.view.layoutStructure = _self.view.find('#inputStructureChild');
		_self.view.layoutCompany = _self.view.find('#inputSelectCompany');
		// _self.stateRadio = _self.view.find('.state');
		// _self.federalRadio = _self.view.find('.federal');
		_self.view.layoutState = _self.view.find('#inputSelectState');
		_self.view.layoutBranch = _self.view.find('#inputSelectFilial');
		_self.view.layoutTax = _self.view.find('#inputSelectTax');
		// _self.view.layoutRule = _self.view.find('#inputSelectRule');
		// _self.view.file1 = _self.view.find('#inputfile1');
		// _self.view.file2 = _self.view.find('#inputfile2');
		_self.view.zip = _self.view.find('#inputSelectZip');
		// _self.view.layout2 = _self.view.find('#inputSelectLayout2');
		// _self.view.version1 = _self.view.find("#inputSelectVersion1");
		// _self.view.version2 = _self.view.find('#inputSelectVersion2');
		// _self.view.validFrom = _self.view.find('#inputValidFrom');
		// _self.view.validTo = _self.view.find('#inputValidTo');
		_self.view.inputZipVersion = _self.view.find('#inputZipVersion');
		// _self.view.subPeriod = _self.view.find('#subPeriodPic');
		// _self.view.addFilter1 = _self.view.find('.btn-filter1');
		// _self.view.addFilter2 = _self.view.find('.btn-filter2');
		_self.view.inputSchemaName = _self.view.find("#inputSchemaName");
		_self.view.validFrom = _self.view.find('#inputValidFrom');
		_self.view.validTo = _self.view.find('#inputValidTo');
		_self.type = _self.getData().type === undefined ? 'layout' : _self.getData().type;
		_self.loader.open();
		_self.addServices();
		Data.endpoints.dfg.digitalFileType.list.post().success(function(data) {
			data.map(function(fileType) {
				if (fileType.name === "XML") {
					_self.coreServices._dataNewFile.idDigitalFileType = fileType.id;
				}
			});
			_self.bindElements();
			_self.bindTooltips();
		}).error(function(error) {
			self.coreServices._dataNewFile.idDigitalFileType = undefined;
			_self.bindElements();
			_self.bindTooltips();
		});
	},

	bindEvents: function() {
		var _self = this;
		_self.stateRadio.click(function() {
			_self.federalRadio.find('input').removeAttr('checked');
			_self.stateRadio.find('input').attr('checked', 'checked');
			//_self.renderStates();
			_self.view.layoutState.ctrl.enable();
			if (_self.company && _self.state)
				_self.view.layoutBranch.ctrl.enable();
		});
		_self.federalRadio.click(function() {
			_self.stateRadio.find('input').removeAttr('checked');
			_self.federalRadio.find('input').attr('checked', 'checked');
			_self.view.layoutState.ctrl.disable();
			_self.view.layoutBranch.ctrl.disable();
		});
	},

	addServices: function() {
		var self = this;
		self.coreServices._dataNewFile = {};
		self.coreServices.getData = function() {
			if (self.view.layoutName.ctrl.validate() &&
				self.view.layoutStructureGroup.ctrl.validate() &&
				self.view.layoutStructure.ctrl.validate() &&
				self.view.layoutCompany.ctrl.validate() &&
				self.view.layoutState.ctrl.validate() &&
				self.view.layoutBranch.ctrl.validate() &&
				self.view.layoutTax.ctrl.validate() &&
				self.view.zip.ctrl.validate() &&
				self.view.inputZipVersion.ctrl.validate() &&
				self.view.inputSchemaName.ctrl.validate() &&
				self.view.validFrom.ctrl.isValid() &&
				self.view.validTo.ctrl.isValid()) {
				var data = {};
				data.name = self.view.layoutName.ctrl.getValue();
				data.description = self.view.layoutDescription.ctrl.getText();
				self.coreServices._dataNewFile.description = self.view.layoutDescription.ctrl.getText();
				data.zip = self.view.zip.ctrl.getValue();
				data.zipVersion = self.coreServices._dataNewFile.zipID;
				data.structureGroup = self.view.layoutStructureGroup.ctrl.getKey();
				data.structure = self.view.layoutStructure.ctrl.getSelectIds();
				data.schemaFileID = self.coreServices._dataNewFile.schemaFileID;
				data.validFrom = self.view.validFrom.ctrl.getValue().hanaDate;
				data.validTo = self.view.validTo.ctrl.getValue().hanaDate;
				if (data.validTo) {
					if (data.validFrom > data.validTo) {
						$.baseToast({
							type: 'W',
							text: i18n('ERROR DATE RANGE')
						});
						return false;
					}
				}
				data.company = self.view.layoutCompany.ctrl.getSelectIds();
				data.state = self.view.layoutState.ctrl.getSelectIds();
				data.branch = self.view.layoutBranch.ctrl.getSelectIds();
				data.tax = self.view.layoutTax.ctrl.getKey();
				data.eefi = self.coreServices._dataNewFile.eefi;
				data.idFolder = -1;
				data.idDigitalFileType = self.coreServices._dataNewFile.idDigitalFileType;
				return data;
			} else {
				self.view.layoutName.ctrl.validate();
				self.view.layoutStructureGroup.ctrl.validate();
				self.view.layoutStructure.ctrl.validate();
				self.view.layoutCompany.ctrl.validate();
				self.view.layoutState.ctrl.validate();
				self.view.layoutBranch.ctrl.validate();
				self.view.layoutTax.ctrl.validate();
				self.view.zip.ctrl.validate();
				self.view.inputZipVersion.ctrl.validate();
				self.view.inputSchemaName.ctrl.validate();
				self.view.validFrom.ctrl.isValid();
				return false;
			}
		};
	},

	bindElements: function() {
		var _self = this;
		//_self._loader.open();

		//Inputs that do not need Endpoint Data
		_self.view.layoutName.empty();
		_self.view.layoutName.ctrl = _self.view.layoutName.bindBaseInput({
			validatorType: 2,
			errorMsg: i18n('MANDATORY FIELD'),
			validator: function(value) {
				value = value.trim();
				return (value !== "");
			},
			required: true,
			onChange: function(oldVal, newVal) {
				_self.coreServices._dataNewFile.name = newVal;
			},
			tooltip: i18n('FILE NAME TOOLTIP'),
			placeholder: i18n('FILE NAME')
		});
		_self.view.layoutDescription.empty();
		_self.view.layoutDescription.ctrl = _self.view.layoutDescription.bindBaseTextarea({
			required: false,
			placeholder: i18n('FILE DESCRIPTION'),
			rows: 5,
			tooltip: i18n('FILE DESCRIPTION TOOLTIP'),
		});
		$("#textareaDescription").removeAttr("style");
		_self.view.layoutStructureGroup.empty();
		_self.view.layoutStructureGroup.ctrl = _self.view.layoutStructureGroup.bindBaseSelect({
			options: [],
			tooltip: i18n('FILE STRUCTURE GROUP TOOLTIP'),
			placeholder: i18n('FILE STRUCTURE GROUP'),
			isLoading: true,
			required: true
		});
		_self.view.layoutStructure.empty();
		_self.view.layoutStructure.ctrl = _self.view.layoutStructure.bindBaseSelect({
			options: [],
			tooltip: i18n('FILE STRUCTURE TOOLTIP'),
			placeholder: i18n('FILE STRUCTURE'),
			isDisabled: true,
			required: true
		});
		_self.view.layoutCompany.empty();
		_self.view.layoutCompany.ctrl = _self.view.layoutCompany.bindBaseSelect({
			options: [],
			tooltip: i18n('FILE COMPANY TOOLTIP'),
			placeholder: i18n('FILE COMPANY'),
			isLoading: true,
			required: true
		});
		_self.view.layoutState.empty();
		_self.view.layoutState.ctrl = _self.view.layoutState.bindBaseSelect({
			options: [],
			tooltip: i18n('FILE STATE TOOLTIP'),
			placeholder: i18n('FILE STATE'),
			isLoading: true,
			required: true
		});
		_self.view.layoutBranch.empty();
		_self.view.layoutBranch.ctrl = _self.view.layoutBranch.bindBaseSelect({
			options: [],
			tooltip: i18n('FILE BRANCH TOOLTIP'),
			placeholder: i18n('FILE BRANCH'),
			required: true,
			isDisabled: true
		});
		_self.view.layoutTax.empty();
		_self.view.layoutTax.ctrl = _self.view.layoutTax.bindBaseSelect({
			options: [],
			tooltip: i18n('FILE TAX TOOLTIP'),
			placeholder: i18n('FILE TAX'),
			required: true,
			isDisabled: true
		});
		_self.view.inputZipVersion.empty();
		_self.view.inputZipVersion.ctrl = _self.view.inputZipVersion.bindBaseSelect({
			options: [],
			tooltip: i18n('ZIP VERSION TOOLTIP'),
			placeholder: i18n('ZIP VERSION'),
			isDisabled: true,
			required: true,
			onChange: function(oldVal, newVal) {
				_self.coreServices._dataNewFile.zipID = newVal;
			},
		});
		_self.view.inputSchemaName.empty();
		_self.view.inputSchemaName.ctrl = _self.view.inputSchemaName.bindBaseSelect({
			options: [],
			tooltip: i18n('SCHEMA NAME TOOLTIP'),
			placeholder: i18n('TILE SCHEMA NAME'),
			isDisabled: true,
			required: true,
			onChange: function(oldVal, newVal) {
				_self.coreServices._dataNewFile.schemaFileID = newVal;
			},
		});
		_self.view.validFrom.ctrl = _self.view.validFrom.bindBaseDatePicker({
			isDisabled: true,
			required: true,
			errorMsg: i18n('MANDATORY FIELD'),
			tooltip: i18n('VALID ON TOOLTIP'),
			placeholder: i18n('VALID ON'),
			onChange: function(oldVal, newVal) {
				_self.view.validTo.ctrl.hideError();
				var dateFrom;
				var dateTo;
				if (_self.validFrom !== null && _self.validFrom !== undefined) {
					dateFrom = new Date(_self.validFrom);
				}
				if (_self.validTo !== null && _self.validTo !== undefined) {
					dateTo = new Date(_self.validTo);
				}
				if (!dateFrom) {
					this.hideError();
					_self.view.validTo.ctrl.enable();
					_self.coreServices._dataNewFile.validFrom = parseDate(newVal, "Date");
					_self.coreServices.datesValidation = true;
					return;
				}

				if (!dateTo) {
					if (!_self.checkDateValidityRange(dateFrom, newVal)) {
						this.showError(i18n('ERROR DATE RANGE'));
						_self.coreServices.datesValidation = false;
						return;
					} else {
						this.hideError();
						_self.view.validTo.ctrl.enable();
						_self.coreServices._dataNewFile.validFrom = parseDate(newVal, "Date");
						_self.coreServices.datesValidation = true;
						return;
					}
				} else {

					if (!_self.checkDateValidityRangeSetting(dateFrom, newVal, dateTo)) {
						this.showError(i18n('ERROR DATE SETTING'));
						_self.coreServices.datesValidation = false;
						return;
					} else {
						this.hideError();
						_self.view.validTo.ctrl.enable();
						_self.view.validTo.ctrl.setDate(parseDate(_self.coreServices._dataNewFile.validTo, "object"));
						_self.coreServices._dataNewFile.validFrom = parseDate(newVal, "Date");
						_self.coreServices.datesValidation = true;
						return;
					}
				}

			}
		});
		_self.view.validTo.ctrl = _self.view.validTo.bindBaseDatePicker({
			isDisabled: true,
		    required: true,
			tooltip: i18n('VALID ON END TOOLTIP'),
			placeholder: i18n('VALID ON END'),
			onChange: function(oldVal, newVal) {
				var dateValidFrom = _self.view.validFrom.ctrl.getDate();
				var fdate;
				if (_self.validTo != null) {
					fdate = new Date(_self.validTo);
				};
				if (!dateValidFrom) {
					this.showError(i18n('ERROR FILL IN DATE FROM'));
					_self.coreServices.datesValidation = false;
					return;
				}
				if (!fdate) {
					if (!_self.checkDateValidityRange(dateValidFrom.month + '/' + dateValidFrom.date + '/' + dateValidFrom.year, newVal)) {
						this.showError(i18n('ERROR DATE RANGE'));
						_self.coreServices.datesValidation = false;
						return;
					} else {
						this.hideError();
						_self.coreServices._dataNewFile.validTo = parseDate(newVal, "Date");
						_self.coreServices.datesValidation = true;
						return;
					}
				} else {
					if (!_self.checkDateValidityRangeSetting(dateValidFrom.month + '/' + dateValidFrom.date + '/' + dateValidFrom.year, newVal, fdate)) {
						this.showError(i18n('ERROR DATE SETTING'));
						_self.coreServices.datesValidation = false;
						return;
					} else {
						this.hideError();
						_self.coreServices._dataNewFile.validTo = parseDate(newVal, "Date");
						_self.coreServices.datesValidation = true;
						return;
					}
				}
			}
		});
		Data.endpoints.mdr.ZIPFiles.getCondensedZipFiles.post().success(function(data) {
			var options = [];
			var length = data.length;
			for (var i = 0; i < length; i++) {
				options.push({
					key: i,
					name: data[i].fileName
				});
			};
			_self.view.zip.empty();
			_self.view.zip.ctrl = _self.view.zip.bindBaseSelect({
				options: options,
				tooltip: i18n('ZIP TOOLTIP'),
				placeholder: i18n('ZIP'),
				isDisabled: false,
				required: true,
				onChange: function(oldVal, newVal) {
					var options = data[newVal.key].versions;
					_self.view.inputZipVersion.empty();
					_self.view.inputZipVersion.ctrl = _self.view.inputZipVersion.bindBaseSelect({
						options: options,
						tooltip: i18n('ZIP VERSION TOOLTIP'),
						placeholder: i18n('ZIP VERSION'),
						isDisabled: false,
						required: true,
						onChange: function(oldVal, newVal) {
							_self.coreServices._dataNewFile.zipID = newVal;
							var params = {
								parentFileID: newVal.key
							};
							_self.loader.open();
							Data.endpoints.mdr.XSDSchemas.listXSDSchemasBy.post(params).success(function(data) {
								var options = data.map(function(xsd) {
									return {
										key: xsd.id,
										name: xsd.fileName
									}
								})
								_self.view.inputSchemaName.empty();
								_self.view.inputSchemaName.ctrl = _self.view.inputSchemaName.bindBaseSelect({
									options: options,
									tooltip: i18n('SCHEMA NAME TOOLTIP'),
									placeholder: i18n('TILE SCHEMA NAME'),
									isDisabled: false,
									required: true,
									onChange: function(oldVal, newVal) {
										_self.coreServices._dataNewFile.schemaFileID = newVal;
										_self.view.validFrom.ctrl.enable();
									},
								});
								_self.loader.close();
							}).error(function(error) {
								$.baseToast({
									text: error,
									isError: true
								});
								_self.loader.close();
							});
						},
					});
				},
			});
			_self.view.inputZipVersion.empty();
			_self.view.inputZipVersion.ctrl = _self.view.inputZipVersion.bindBaseSelect({
				options: [],
				tooltip: i18n('ZIP TOOLTIP'),
				placeholder: i18n('ZIP'),
				isDisabled: true,
				required: true,
				onChange: function(oldVal, newVal) {
					_self.coreServices._dataNewFile.zipID = newVal;
				},
			});
			Data.endpoints.dfg.getCommonFilters.post().success(function(data) {
				_self.commonFilters = data;
				_self.view.layoutCompany.empty();
				_self.view.layoutCompany.ctrl = _self.view.layoutCompany.bindBaseMultipleSelect3({
					options: data.company.map(function(e) {
						return {
							id: e.id,
							key: e.id,
							name: e.name
						};
					}),
					tooltip: i18n('FILE COMPANY TOOLTIP'),
					placeholder: i18n('FILE COMPANY'),
					//isLoading: true,
					required: true,
					onChange: _self._onChangeCompanySettings.bind(_self)
				});
				_self.view.layoutState.empty();
				_self.view.layoutState.ctrl = _self.view.layoutState.bindBaseSelect({
					options: [],
					tooltip: i18n('FILE STATE TOOLTIP'),
					placeholder: i18n('FILE STATE'),
					isLoading: true,
					required: true
				});
				_self.view.layoutBranch.empty();
				_self.view.layoutBranch.ctrl = _self.view.layoutBranch.bindBaseSelect({
					options: [],
					tooltip: i18n('FILE BRANCH TOOLTIP'),
					placeholder: i18n('FILE BRANCH'),
					required: true,
					isDisabled: true
				});
				Data.endpoints.dfg.tax.post().success(function(data) {
					_self.taxData = data;
					Data.endpoints.dfg.layout.createDialog.post().success(function(data) {
						_self.coreServices.loadingData = false;
						_self.createDialogData = data;
						options = data.structures.map(function(val, idx) {
							val.key = val.id;
							val.name = val.title;
							return val;
						});
						_self.view.layoutStructureGroup.empty();
						_self.view.layoutStructureGroup.ctrl = _self.view.layoutStructureGroup.bindBaseSelect({
							options: options,
							tooltip: i18n('FILE STRUCTURE GROUP TOOLTIP'),
							placeholder: i18n('FILE STRUCTURE GROUP'),
							required: true,
							isDisabled: false,
							onChange: function(oldVal, newVal) {
								_self.coreServices._dataNewFile.idStructureGroup = newVal.id;
								options = newVal.structure.map(function(val) {
									val.key = val.id;
									val.name = val.title;
									return val;
								});
								_self.view.layoutStructure.empty();
								_self.view.layoutStructure.ctrl = _self.view.layoutStructure.bindBaseMultipleSelect3({
									options: options,
									tooltip: i18n('FILE STRUCTURE TOOLTIP'),
									placeholder: i18n('FILE STRUCTURE'),
									required: true,
									isDisabled: false,
									onChange: function(oldVal, newVal) {
										_self.coreServices._dataNewFile.idStructure = oldVal.map(function(val) {
											return val.id;
										});
									}
								});
							}
						});
						_self.loader.close();
					}).error(function(error) {
						_self.coreServices.loadingData = false;
						$.baseToast({
							text: i18n('ERROR GETTING CREATE FIELDS'),
							isError: true
						});
						_self.loader.close();
					});
				}).error(function(error) {
					_self.coreServices.loadingData = false;
					$.baseToast({
						text: i18n('ERROR GETTING CREATE FIELDS'),
						isError: true
					});
					_self.loader.close();
				});
				_self.loader.close();
			}).error(function(error) {
				$.baseToast({
					text: error,
					isError: true
				});
				_self.loader.close();
			});
		}).error(function(error) {
			$.baseToast({
				text: error,
				isError: true
			});
			_self.loader.close();
		});

		_self.coreServices.loadingData = true;
	},

	validate: function() {
		var _self = this;
		var _formfields = [];
		var flag = true;

		_formfields.push(_self.view.validFrom.ctrl._validate());
		_formfields.push(_self.view.validTo.ctrl._validate());
		_formfields.push(_self.view.validTo._validate());
		if (!_self.view.validFrom.ctrl._validate())
			_self.view.validFrom.ctrl.showError();

		$.each(_formfields, function(ind, val) {
			if (val == false) {
				flag = false;
				return;
			}
		});
		return flag;
	},

	checkDateValidityRange: function(beginRange, endRange) {
		if (endRange.year && endRange.month) {
			endRange = [endRange.month, endRange.date, endRange.year].join('/');
			if (beginRange !== null && endRange) {
				var date1 = (new Date(endRange)).toJSON();
				date1 = date1.split("T")[0];
				var date2 = (new Date(beginRange)).toJSON();
				date2 = date2.split("T")[0];
				if (date2 > date1) {
					return false;
				}
			}
		}
		return true;
	},

	checkDateValidityRangeSetting: function(beginRange, DateCompare, endRange) {
		DateCompare = [DateCompare.month, DateCompare.date, DateCompare.year].join('/');
		if (beginRange !== null && DateCompare) {
			var date1 = (new Date(DateCompare)).toJSON();
			date1 = date1.split("T")[0];
			var date2 = (new Date(beginRange)).toJSON();
			date2 = date2.split("T")[0];
			if (date2 > date1) {
				return false;
			}
		}
		if (endRange !== null && DateCompare) {
			var date1 = (new Date(DateCompare)).toJSON();
			date1 = date1.split("T")[0];
			var date2 = (new Date(endRange)).toJSON();
			date2 = date2.split("T")[0];
			if (date2 < date1) {
				return false;
			}
		}
		return true;
	},

	_renderSettingsSelectsEmpty: function(key, loading) {
		var _self = this;

		//key is where the onChange is called
		//order asc --> tax , branch , uf , company

		//tax is commented because select is not added
		_self.view.layoutTax.empty();
		_self.view.layoutTax.ctrl = _self.view.layoutTax.bindBaseSelect({
			options: [],
			tooltip: i18n('FILE TAX TOOLTIP'),
			placeholder: i18n('FILE TAX'),
			required: true,
			isDisabled: true,
			isLoading: key === 'branch' && loading ? true : false
		});

		if (key === 'branch') {
			return;
		}

		_self.view.layoutBranch.empty();
		_self.view.layoutBranch.crtl = _self.view.layoutBranch.bindBaseSelect({
			options: [],
			tooltip: i18n('FILE BRANCH TOOLTIP'),
			placeholder: i18n('FILE BRANCH'),
			required: true,
			isDisabled: true,
			isLoading: key === 'uf' && loading ? true : false
		});

		if (key === 'uf') {
			return;
		}

		_self.view.layoutState.empty();
		_self.view.layoutState.ctrl = _self.view.layoutState.bindBaseSelect({
			options: [],
			tooltip: i18n('FILE STATE TOOLTIP'),
			placeholder: i18n('FILE STATE'),
			required: true,
			isDisabled: true,
			isLoading: key === 'company' && loading ? true : false
		});
	},
	_onChangeCompanySettings: function(newVal) {
		var _self = this;
		if (newVal.length === 0) {
			_self._renderSettingsSelectsEmpty("company");
			_self.coreServices._dataNewFile.idCompany = [];
			_self.coreServices._dataNewFile.uf = [];
			_self.coreServices._dataNewFile.eefi = [];
			return;
		}
		var opt = newVal.map(function(e, i) {
			return e.id;
		});
		var isNew = _self._compareArraysSelect(newVal, _self.coreServices._dataNewFile.idCompany);
		if (!isNew) {
			return;
		}
		_self.coreServices._dataNewFile.idCompany = opt;
		_self.coreServices._dataNewFile.uf = [];
		_self._renderSettingsSelectsEmpty('company', true);

		Data.endpoints.dfg.uf.post({
			idCompany: opt,
		}).success(function(data) {
			_self.view.layoutState.empty();
			_self.view.layoutState.ctrl = _self.view.layoutState.bindBaseMultipleSelect3({
				required: true,
				tooltip: i18n('FILE STATE TOOLTIP'),
				placeholder: i18n('FILE STATE'),
				onChange: _self._onChangeUfSettings.bind(_self),
				options: data.map(function(e, i) {
					e.key = e.id;
					return e;
				})
			});
		});
	},
	_onChangeUfSettings: function(newVal) {
		var _self = this;
		if (newVal.length === 0) {
			_self._renderSettingsSelectsEmpty("uf");
			_self.coreServices._dataNewFile.uf = [];
			_self.coreServices._dataNewFile.eefi = [];
			return;
		}
		var opt = newVal.map(function(e, i) {
			return e.id;
		});
		var isNew = _self._compareArraysSelect(newVal, _self.coreServices._dataNewFile.uf);
		if (!isNew) {
			return;
		}
		_self.coreServices._dataNewFile.uf = opt;
		_self.coreServices._dataNewFile.eefi = [];
		_self._renderSettingsSelectsEmpty("uf", true);
		Data.endpoints.dfg.branch.post({
			idCompany: _self.coreServices._dataNewFile.idCompany,
			uf: opt
		}).success(function(data) {
			_self.view.layoutBranch.empty();
			_self.view.layoutBranch.ctrl = _self.view.layoutBranch.bindBaseMultipleSelect3({
				required: true,
				tooltip: i18n('FILE BRANCH TOOLTIP'),
				placeholder: i18n('FILE BRANCH'),
				onChange: _self._onChangeBranchSetting.bind(_self),
				options: data.map(function(e, i) {
					e.key = e.idCompany + e.uf + e.id;
					return e;
				})
			});
		});

	},

	_onChangeBranchSetting: function(newVal) {
		var _self = this;
		if (newVal.length === 0) {
			_self._renderSettingsSelectsEmpty("branch");
			_self.coreServices._dataNewFile.eefi = [];
			return;
		}

		var isNew = _self._compareArraysSelect(newVal, _self.coreServices._dataNewFile.eefi);
		if (!isNew) {
			return;
		}
		_self.coreServices._dataNewFile.eefi = newVal;
		_self._renderSettingsSelectsEmpty("branch", true);

		Data.endpoints.dfg.tax.post().success(function(data) {
			_self.view.layoutTax.empty();
			_self.view.layoutTax.ctrl = _self.view.layoutTax.bindBaseSelect({
				options: data,
				required: true,
				tooltip: i18n('FILE TAX TOOLTIP'),
				placeholder: i18n('FILE TAX'),
				onChange: function(oldVal, newVal) {
					_self.coreServices._dataNewFile.eefi = _self.coreServices._dataNewFile.eefi.map(function(e, i) {
						e.idBranch = e.id;
						e.idTax = newVal.key;
						return e;
					});
				}
			});
		});

	},
	_onChangeZip: function(newVal) {

	},
	_compareArraysSelect: function(array1, array2) {
		if (array2 === undefined) {
			array2 = [];
		}
		var isDiferent = false;
		var newArray1 = array1.map(function(e) {
			return e.key === undefined ? e : e.key;
		});

		var newArray2 = array2.length === 0 ? [] : array2.map(function(e) {
			return e.key === undefined ? e : e.key;
		});

		var tamanio = array1.length > array2.length ? array1.length : array2.length;

		for (var i = 0; i < tamanio; i++) {
			if (newArray2.indexOf(newArray1[i]) === -1 && !isDiferent) {
				isDiferent = true;
			}
		}
		return isDiferent;
	},
	getOwnData: function() {
		var _self = this;
		var ownData = {};
		ownData.validFrom = _self.inputValidFrom.getDate();

		ownData.validTo = _self.inputValidTo.getDate();
		//converting dates to backend format
		if (ownData.validFrom) {
			ownData.validFrom = _self.inputValidFrom._jsonToDate(ownData.validFrom);
			ownData.validFrom = ownData.validFrom.replace(/^(\d{2})\/(\d{2})\/(\d{4})$/, '$3-$2-$1');
		}
		if (ownData.validTo) {
			ownData.validTo = _self.inputValidTo._jsonToDate(ownData.validTo);
			ownData.validTo = ownData.validTo.replace(/^(\d{2})\/(\d{2})\/(\d{4})$/, '$3-$2-$1');
		} else {
			ownData.validTo = '9999-12-31';
		}
		if (_self.federalRadio.find('input').attr('checked') == 'checked') {
			ownData.areaType = 'federal';
			ownData.area = "[]";
		} else {
			ownData.areaType = 'estadual';
			ownData.area = JSON.stringify(_self.inputState.getSelectedValues());
		}
		ownData.idStructureGroup = _self.inputStructure.getKey();
		if (_self.inputStructureChild && _self.inputStructureChild.getSelectedValues) {
			ownData.idStructure = JSON.stringify(_self.inputStructureChild.getSelectedValues());
		}
		if (_self.inputCompany) {
			ownData.company = JSON.stringify(_self.inputCompany.getSelectedValues());
		}
		if (_self.inputBranch && _self.inputBranch.getSelectedValues) {
			ownData.branch = JSON.stringify(_self.inputBranch.getSelectedValues());
		}

		//ownData.layoutCopyFrom = _self.inputs.copyFrom;
		ownData.layoutType = _self.inputs.layoutType;
		ownData.layoutName = _self.inputs.layoutName.getText();
		ownData.layoutDescription = $('#textareaDescription textarea').val();
		//validate fields
		_self.inputs.layoutName.validate();
		_self.inputValidFrom.isValid();
		_self.inputLayoutType.validate();
		_self.inputStructure.validate();
		if (ownData.validFrom > ownData.validTo) {
			$.baseToast({
				text: i18n("DFG101009"),
				type: 'E'
			});
		}
		if (ownData.validFrom && ownData.layoutType && ownData.layoutName && ownData.idStructure && (ownData.validFrom <= ownData.validTo)) {
			return ownData;
		} else {
			return null;
		}
	},

	initInputs: function() {
		var _self = this;
		// if (_self.initData.layoutName) {
		//     // _self.view.layoutName.ctrl.setText(i18n('COPY OF') + ' ' + _self.initData.layoutName);
		// }
		if (_self.initData.layoutDescription) {
			$('#textareaDescription textarea').val(_self.initData.layoutDescription);
		}
		// if (_self.initData.validFrom) {
		//     _self.view.layoutValidFrom.ctrl.setDate(parseDate(_self.initData.validFrom, "object"));

		// }
		// if (_self.initData.validTo) {
		//     _self.view.layoutValidTo.ctrl.setDate(parseDate(_self.initData.validTo, "object"));
		// }

		// if (_self.initData.areaType == 'federal') {
		//     _self.federalRadio.find('input').attr('checked', 'checked');
		//     //_self.inputState.disable();
		// } else if (_self.initData.areaType == 'estadual') {
		//     _self.stateRadio.find('input').attr('checked', 'checked');
		//     //_self.inputState.enable();
		// }
	},

	bindTooltips: function() {
		var self = this;
		$('#textarea-id').attr('tabindex', '0');
		$('#textarea-id').baseTooltip({
			class: 'dark',
			position: 'top',
			text: i18n('FILE DESCRIPTION TOOLTIP')
		});
	},
	updateHeaderData: function() {
		var _self = this;

		_self.coreServices.layoutObject.name = _self.view.layoutName.ctrl.getText();
		_self.coreServices.layoutObject.description = _self.view.layoutDescription.ctrl.val();
	},

	validate: function() {
		var self = this;
		var flag = true;
		var keys = Object.keys(self.view);
		$.each(keys, function(ind, key) {
			if (self.view[key].length > 0 && self.view[key].ctrl && self.view[key].ctrl.validate) {
				if (self.view[key].ctrl.validate()) {
					if (self.view[key].ctrl.showSuccess)
						self.view[key].ctrl.showSuccess();
				} else {
					if (self.view[key].ctrl.showError)
						self.view[key].ctrl.showError();
					if (self.view[key].ctrl.getData().required)
						flag = false;
				}
			}

			if (self.view[key].length > 0 && self.view[key].ctrl && self.view[key].ctrl._validate) {
				if (self.view[key].ctrl._validate()) {
					if (self.view[key].ctrl.showSuccess)
						self.view[key].ctrl.showSuccess();
				} else {
					if (self.view[key].ctrl.showError && self.view[key].ctrl.getData().required) {
						self.view[key].ctrl.showError();
						flag = false;
					}
				}
			}
		});

		return flag;
	},
	_getEefiStructure: function(eefi) {
		var _self = this;
		var object = {};
		eefi.forEach(function(e) {
			if (!object.hasOwnProperty(e.idCompany)) {
				object[e.idCompany] = {};
			}

			if (!object[e.idCompany].hasOwnProperty(e.uf)) {
				object[e.idCompany][e.uf] = {};
			}

			if (!object[e.idCompany][e.uf].hasOwnProperty(e.idBranch)) {
				object[e.idCompany][e.uf][e.idBranch] = {
					tax: ''
				};
			}
			object[e.idCompany][e.uf][e.idBranch]["tax"] = e.idTax;
		});

		return object;
	},
	_getStructure: function(subStructureId) {
		var _self = this;
		var array = [];
		_self.createDialogData.structures.forEach(function(_element, _ind) {
			_element.structure.forEach(function(_sub) {
				if (subStructureId == _sub.id) {
					array.push({
						key: _element.id,
						name: _element.title
					});
				}
			});
		});
		return array[0];
	},
	setVersionOptions: function(layoutId) {
		var _self = this;
		Data.endpoints.dfg.setting.getVersions.post({
			idLayout: layoutId
		}).success(function(_versions) {
			var _opt = [];
			_versions.forEach(function(_versions_item) {
				_opt.push({
					key: _versions_item.id,
					name: _versions_item.version
				});
			});
			_self.view.timpVersion.empty();
			_self.view.timpVersion.ctrl = _self.view.timpVersion.bindBaseSelect({
				options: _opt,
				required: true,
				onChange: function(oldVal, newVal) {
					_self.coreServices._dataNewFile.idLayoutVersion = newVal.key;
				},
				tooltip: i18n('VERSION INPUT TOOLTIP'),
				placeholder: i18n('VERSION INPUT TOOLTIP')
			});
		}).error(function() {});
	},
	_initializeElements: function(data) {
		var _self = this;
		var newVal = _self.getData().setting;
		var currentLayoutCopy = newVal.layout
		var eefi = newVal.eefi[0];
		_self.view.layoutName.ctrl.setText(newVal.name);
		_self.view.layoutDescription.ctrl.val(newVal.description);

		if (_self.getData().isView) {
			_self.view.layoutName.ctrl.setText("ID " + newVal.id + "- " + newVal.name);
			_self.view.layoutName.ctrl.disable();
			_self.view.validTo.disable();
			_self.view.layoutDescription.ctrl.attr("disabled", "disabled");
			$("textarea").css("background-color", "#F3F2F2");
			_self.view.layoutType.ctrl.setKey(newVal.layout.id);
			_self.view.timpVersion.ctrl.setKey(newVal.layout.legalVersion);
		}

		//setkey and callbacks        
		// if (newVal.version.validFrom && newVal.version.validFrom !== null) {
		//     _self.view.validFrom.ctrl.setValue({
		//         "hanaDate": new Date(newVal.version.validFrom)
		//     });
		// }

		// if (newVal.version.validTo && newVal.version.validTo !== null) {
		//     _self.view.validTo.setValue({
		//         "hanaDate": new Date(newVal.version.validTo)
		//     });
		// }

		//disable selects
		_self.view.layoutCompany.ctrl.disable();
		_self.view.validFrom.ctrl.disable();

		_self.view.layoutCompany.ctrl.setValue(_self.companyKeys);
		_self.view.layoutState.ctrl.setKey(_self.ufKeys);
		_self.view.layoutBranch.ctrl.setKey(_self.branchKeys);
		_self.view.layoutTax.ctrl.setKey(eefi.idTax)
		_self.coreServices._dataNewFile.id = newVal.id;
		_self.loader.close();
	}
});