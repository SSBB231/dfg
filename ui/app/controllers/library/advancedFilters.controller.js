sap.ui.controller("app.controllers.library.advancedFilters", {
	onAfterRendering: function(html) {
		var _self = this;
		_self._view = $(html);
		_self._view.container = _self._view.find("#filters-container");
		_self._view.cleanFilter = _self._view.find("#clean-filters");
		_self.filters = {};
		_self.renderElements();
		_self._view.cleanFilter.attr('tabindex', 0);
		if (_self._data.cleanBtn) {
			setTimeout(function() {
				var btn = document.createElement("button");
				btn.classList.add("clean-filters-btn", "btn", "tras");
				btn.id = "clean-filters";
				var span1 = document.createElement("span");
				span1.classList.add("button-icon", "icon-font-Time-and-Date", "icon-reviewback");
				var span2 = document.createElement("span");
				span2.textContent = i18n("RESET FILTERS");
				btn.appendChild(span1);
				btn.appendChild(span2);
				_self._view[0].appendChild(btn);
				_self._view.cleanFilter = _self._view.find("#clean-filters");
				_self._view.cleanFilter.click(function(event) {
					_self.cleanFilters();
				});
				_self.bindCleanFilter();
			}, 500);

		}

		_self.addServices();
	},
	bindCleanFilter: function() {
		var _self = this;

		_self._view.cleanFilter.baseTooltip({
			class: "dark",
			position: "top",
			text: i18n("LIBRARY CONTENT CLEAN FILTERS TOOLTIP"),
			width: 300

		});
	},
	addServices: function() {
		var _self = this;
		//Get filter Values
		_self.coreServices.getValues = function() {
			var values = {};
			for (var filterKey in _self.filters) {
				if (filterKey.indexOf("Date") === -1) {
					if (_self.filters[filterKey].ctrl._data.isSearchBox) {
						var text = _self.filters[filterKey].ctrl.getText();
						if (text !== "") {
							values[filterKey] = text;
						}

					} else if (_self.filters[filterKey].ctrl._data.type === "checkbox") {
						if (_self.filters[filterKey].ctrl.getChecked()) {
							values[filterKey] = true;
						}
					} else {
						var selectedKey = _self.filters[filterKey].ctrl.getKey();
						if (selectedKey !== undefined) {
							values[filterKey] = selectedKey;
						}
					}
				} else {
					var selectedDate = _self.filters[filterKey].ctrl.getValue().hanaDate;
					if (selectedDate !== undefined) {
						values[filterKey] = selectedDate;
					}
				}
			}
			return values;
		}
		_self.coreServices.clearFilters = function(avoidRendering) {
			_self.cleanFilters(avoidRendering);
		};
	},
	renderElements: function() {
		var _self = this;
		var _data = this.getData();
		if (!_data.withoutFields || _data.withoutFields.indexOf("id") === -1) {
			_self.createInput("id");
		}
		if (!_data.withoutFields || _data.withoutFields.indexOf("name") === -1) {
			_self.createInput("name");
		}

		for (var filterKey in _data.filterOptions) {
			if (filterKey === "users") {
				_self.createSelect("creationUser", _data.filterOptions[filterKey]);
				if (!_data.withoutFields || _data.withoutFields.indexOf("modificationUser") === -1) {
					_self.createSelect("modificationUser", _data.filterOptions[filterKey]);
				}

			} else if (filterKey === "files") {
				var label = i18n("FILE") + " ";
				_self.createSelect("file1", _data.filterOptions[filterKey], label + 1);
				_self.createSelect("file2", _data.filterOptions[filterKey], label + 2);
			} else if(filterKey.indexOf("Date") !== -1){
			    _self.createDatePicker(filterKey);
			}else {
				_self.createSelect(filterKey, _data.filterOptions[filterKey]);
			}
		}
		if (!_data.withoutFields || _data.withoutFields.indexOf("creationDateFrom") === -1) {
			_self.createDatePicker("creationDateFrom");
		}

		if (!_data.withoutFields || _data.withoutFields.indexOf("modificationDateFrom") === -1) {
			_self.createDatePicker("modificationDateFrom");
		}
		if (_self.coreServices.libraryOptions && _self.coreServices.libraryOptions.renderType === "DIGITAL FILE") {
			_self.createCheckBox("sent");
		}

		if (_data.filters) {
			for (var f in _data.filters) {
				if (_self.filters[f]) {
					if (f.indexOf("Date") === -1) {
						if (_self.filters[f].ctrl._data.isSearchBox) {
							_self.filters[f].ctrl.setText(_data.filters[f], true);
						} else if (_self.filters[f].ctrl._data.type === "checkbox") {
							_self.filters[f].ctrl.setChecked(_data.filters[f], true);

						} else {
							_self.filters[f].ctrl.setKey(_data.filters[f], true);
						}
					} else {
						_self.filters[f].ctrl.setDate(_data.filters[f], true);
					}
				}
			}
		}
	},
	createDatePicker: function(key) {
		var _self = this;
		var newDatePicker = $("<div></div>");
		newDatePicker.attr('id', key);
		_self._view.append(newDatePicker);
		newDatePicker.ctrl = newDatePicker.bindBaseDatePicker({
			tooltip: i18n('CLICK PRESS TO') + i18n('SELECT') + ' ' + i18n(key.toUpperCase()),
			placeholder: i18n('SELECT') + ' ' + i18n(key.toUpperCase()),
			onChange: _self.filtersOnChange.bind(_self)
		});
		_self.filters[key] = newDatePicker;
	},
	createInput: function(key) {
		var _self = this;
		var _data = _self.getData();
		var newInput = $("<div></div>");

		newInput.attr('id', key);
		_self._view.append(newInput);
		newInput.ctrl = newInput.bindBaseInput({
			tooltip: i18n('CLICK PRESS TO') + i18n('SELECT') + ' ' + i18n(key.toUpperCase()),
			isSearchBox: true,
			onSearch: function(text) {
				var folderSelected = _self.coreServices.libraryOptions ? _self.coreServices.libraryOptions.dataType[_self.coreServices.libraryOptions
					.renderType] : -1;
				var searchParams = {};
				if (folderSelected.text === "FOLDER") {
					searchParams.idFolder = folderSelected.idFolder;
				}
				searchParams.searchParams = _self.coreServices.getValues();
				if (_self.coreServices.libraryOptions && _self.coreServices.libraryOptions.renderType !== "SPED") {
					_self.coreServices.renderAccordionFiles(searchParams);
				} else {
					if (_data.spedReportFile) {
						_data.parentCtrl.filterReportFileData(searchParams.searchParams);
					} else if (_data.isSpedJob) {
						_data.parentCtrl.filterSpedExecutions(searchParams.searchParams);
					} else {
						var data = {
							type: _self.coreServices.spedType,
							subType: _self.coreServices.spedSubType,
							status: 1,
							order_by: _self.coreServices.orderBy,
							searchParams: searchParams.searchParams,
							getFiltersData: _self.coreServices.spedFilters !== undefined ? false : true,
							counter: _self.coreServices.spedCounter !== undefined ? false : true
						};

						_self.coreServices.getSPEDData(data)
					}
				}

			} //,
			//onRealChange: _self.filtersOnChange
		});
		newInput.find("input").attr("placeholder", i18n('SELECT') + ' ' + i18n(key.toUpperCase()));
		_self.filters[key] = newInput;
	},
	createCheckBox: function(key) {
		var _self = this;
		var newChekBox = $("<div></div>");

		newChekBox.attr('id', key);
		_self._view.append(newChekBox);
		newChekBox.ctrl = newChekBox.bindBaseCheckbox({
			type: "checkbox",
			text: i18n(key.toUpperCase()),
			onChange: _self.filtersOnChange.bind(_self)
		});
		_self.filters[key] = newChekBox;
	},
	createSelect: function(key, options, label) {
		var _self = this;
		var newSelect = $("<div></div>");

		options = _self.mapOptions(options, key);
		newSelect.attr('id', key);
		_self._view.append(newSelect);
		newSelect.ctrl = newSelect.bindBaseSelect({
			options: options,
			tooltip: i18n('CLICK PRESS TO') + i18n('SELECT') + ' ' + (label !== undefined ? label : i18n(key.toUpperCase())),
			placeholder: i18n('SELECT') + ' ' + (label !== undefined ? label : i18n(key.toUpperCase())),
			onChange: _self.filtersOnChange.bind(_self)
		});
		_self.filters[key] = newSelect;
	},
	mapOptions: function(options, key) {
		var _self = this;
		var newOptions = [];
		if (Array.isArray(options)) {
			newOptions = options.map(function(elem) {
				if (_self.coreServices.libraryOptions && _self.coreServices.libraryOptions.renderType === "DIGITAL FILE" && key === "status") {
					elem.name = i18n(elem.name);
				}
				return {
					key: elem.id || elem.key,
					name: elem.hana_user || elem.name || elem.title
				};
			});
		} else {
			for (let key in options) {
				newOptions.push({
					key: key,
					name: i18n(options[key].toUpperCase())
				})
			}
		}
		return newOptions;
	},
	filtersOnChange: function(oldVal, newVal) {
		var _self = this;
		var _data = _self.getData();
		var folderSelected = _self.coreServices.libraryOptions ? _self.coreServices.libraryOptions.dataType[_self.coreServices.libraryOptions.renderType] :
			-1;
		var searchParams = {};
		if (folderSelected.text === "FOLDER") {
			searchParams.idFolder = folderSelected.idFolder;
		}
		searchParams.searchParams = _self.coreServices.getValues();
		if (_self.coreServices.libraryOptions && _self.coreServices.libraryOptions.renderType !== "SPED") {
			_self.coreServices.renderAccordionFiles(searchParams);
		} else {
			if (_data.spedReportFile) {
				_data.parentCtrl.filterReportFileData(searchParams.searchParams);
			} else if (_data.isSpedJob) {
				_data.parentCtrl.filterSpedExecutions(searchParams.searchParams);
			} else {
				var data = {
					type: _self.coreServices.spedType,
					subType: _self.coreServices.spedSubType,
					status: 1,
					order_by: _self.coreServices.orderBy,
					searchParams: searchParams.searchParams,
					getFiltersData: _self.coreServices.spedFilters !== undefined ? false : true,
					counter: _self.coreServices.spedCounter !== undefined ? false : true
				};

				_self.coreServices.getSPEDData(data)
			}
		}
	},
	cleanFilters: function(avoidRendering) {
		var _self = this;
		var _data = _self.getData();
		for (var filterKey in _self.filters) {
			if (_self.filters[filterKey].ctrl._data.type === "checkbox") {
				_self.filters[filterKey].ctrl.setChecked(false, avoidRendering);
			} else if (_self.filters[filterKey].ctrl._data.isSearchBox) {
				_self.filters[filterKey].ctrl.setText("", avoidRendering);
			} else if (filterKey.indexOf("Date") === -1) {
				_self.filters[filterKey].ctrl.setKey(null, avoidRendering);
			} else {
				_self.filters[filterKey].ctrl._cleanDate(avoidRendering);
			}
		}
		if (!avoidRendering) {
			var folderSelected = _self.coreServices.libraryOptions ? _self.coreServices.libraryOptions.dataType[_self.coreServices.libraryOptions.renderType] :
				-1;
			var searchParams = {};
			if (folderSelected.text === "FOLDER") {
				searchParams.idFolder = folderSelected.idFolder;
			}
			if (_self.coreServices.libraryOptions && _self.coreServices.libraryOptions.renderType !== "SPED") {
				_self.coreServices.renderAccordionFiles(searchParams);
			} else {
				if (_data.spedReportFile) {
					_data.parentCtrl.filterReportFileData(searchParams.searchParams);
				} else if (_data.isSpedJob) {
					_data.parentCtrl.filterSpedExecutions(searchParams.searchParams);
				} else {
					var data = {
						type: _self.coreServices.spedType,
						subType: _self.coreServices.spedSubType,
						status: 1,
						order_by: _self.coreServices.orderBy,
						searchParams: searchParams.searchParams,
						getFiltersData: _self.coreServices.spedFilters !== undefined ? false : true,
						counter: _self.coreServices.spedCounter !== undefined ? false : true
					};

					_self.coreServices.getSPEDData(data)
				}

			}
		}
	}
});