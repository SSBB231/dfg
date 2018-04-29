sap.ui.controller("app.controllers.xmlEditor.structuresReports", {
	onInit: function() {
		this.autoCompleteData = {
			options: [],
			placeholder: i18n('SEARCH'),
			cssClass: 'editor-search-autocomplete',
			boxCssClass: 'editor-search-box-autocomplete',
			hideOverlay: true
		};
		this.searchText = null;
		this.accordionStructureData = {
			fields: [],
			accordion: [],
			items: []
		};
	},

	onAfterRendering: function(html) {
		var _self = this;
		this.view = html;
		this.outputData = {};
		this.renderSearch();
		this._loader = $('#accordion').baseLoader({
			modal: true
		});
		this.renderTooltips();
		_self.coreServices.initDataStructure = function(structures) {
			_self.getDataStructure(structures);
		};
		this.bindEvents();

	},
	
	renderAccordion: function(_structure_data) {
        var _self = this;
        _self.accordionStructureData.fields = _structure_data.fields;
        _self.accordionStructureData.accordion = [];
        var specialFields = [{
            id: 'formula',
            label: 'FORMULA',
            iconFont: 'Finance-and-Office',
            icon: 'function'
        }, {
            id: 'recordId',
            label: 'RECORDID',
            iconFont: 'Finance-and-Office',
            icon: 'tableview'
        }, {
            id: 'filler',
            label: 'FILLER',
            iconFont: 'File-and-Folders',
            icon: 'fullbox'
        }, {
            id: 'manualParam',
            label: 'PARAMETRO',
            iconFont: 'Formatting-and-Tool',
            icon: 'textandtext'
        }, {
            id: 'blockTotal',
            label: 'BLOCKTOTAL'
        }, {
            id: 'recordsTotals',
            label: 'RECORDTOTAL'
        }, {
            id: 'totalsAll',
            label: 'TOTALALL'
        }, {
            id: 'initialDateReference',
            label: 'INITDATEREFERENCE'
        }, {
            id: 'finalDateReference',
            label: 'FINALDATEREFERENCE'
        }, {
            id: 'output',
            label: 'OUTPUT',
            iconFont: 'DataManager',
            icon: 'downloadtodataset'
        }, {
            id: 'blockStarter',
            label: 'BLOCKSTARTER'
        }, {
            id: 'version',
            label: 'VERSION'
        }, {
            id: 'HRE',
            label: "HR_EXECUCAO"
        }, {
            id: 'DTE',
            label: "DT_EXECUCAO"
        }, {
            id: 'referencePeriod',
            label: 'REFERENCE PERIOD'
        }, {
            id: 'fixedField',
            label: 'FIXED FIELD',
            iconFont: 'Sign-and-Symbols',
            icon: 'locked'
        }, {
            id: 'fixedManualField',
            label: 'FIXED MANUAL FIELD',
            iconFont: 'Display-and-Setting',
            icon: 'orderedlist'
        }, {
            id: 'newline',
            label: 'NEWLINE'
        }];
        var specials = {
            customTitle: {
                name: 'app.views.editor.AccTitle',
                data: {
                    title: i18n('SPECIAL FIELDS'),
                    icon: {
                        category: 'Formatting-and-Tool',
                        name: 'edit'
                    }
                }
            },
            items: {
                accordion: []
            }
        };

        specialFields.forEach(function(Sfield) {
            specials.items.accordion.push({
                customTitle: {
                    name: 'app.views.editor.AccField',
                    data: {
                        ID: Sfield.id,
                        label: i18n(Sfield.label),
                        iconFont: Sfield.iconFont,
                        icon: Sfield.icon,
                        simpleType: "SPECIAL"
                    }
                }
            });
        });
        _self.accordionStructureData.accordion.push(specials);
        var reports = {
            customTitle: {
                name: 'app.views.editor.AccTitle',
                data: {
                    title: i18n('REPORT'),
                    items: {
                        accordion: {
                            length: _self.coreServices.layoutObject.reports.length
                        }
                    },
                    icon: {
                        category: 'Formatting-and-Tool',
                        name: 'edit'
                    }
                }
            },
            items: {
                accordion: []
            }
        };
        var count = 0;
        var hourfield = {
            ID: 'HRE',
            active: true,
            hanaName: "HR_EXECUCAO",
            id: 'HRE',
            idStructure: "3",
            isKey: false,
            isMeasure: false,
            label: "Hora da Execução do Arquivo",
            labelEN: "Execution Hour",
            labelPT: "Hora da Execução do Arquivo",
            precision: 0,
            simpleType: "STRING",
            type: "VARCHAR"
        };
        var newFields = [];
        for (var i in _structure_data) {
            var length = Object.keys(_structure_data[i].fields).length;
            if (count === 0) {
                _structure_data[i].fields.HRE = hourfield;
            }
            _self.accordionStructureData.accordion.push({
                customTitle: {
                    name: 'app.views.editor.AccTitle',
                    data: {
                        ID: Date.now() + _structure_data[i].title,
                        title: _structure_data[i].title,
                        description: _structure_data[i].description,
                        items: {
                            accordion: {
                                length: Object.keys(_structure_data[i].fields).length
                            }
                        },
                        icon: {
                            category: "Finance-and-Office",
                            name: "fiscaldocument"
                        }
                    }
                },
                items: {
                    accordion: []
                }
            });

            _self._options = [];
            if (_structure_data[i].levels[0] !== undefined && count == 0) {
                for (var j = 0; j < _structure_data[i].levels[0].fields.length; j++) {
                    var name = "";
                    for (var k in _structure_data[i].fields) {
                        if (_structure_data[i].levels[0].fields[j].ID === _structure_data[i].fields[k].ID) {
                            name = _structure_data[i].fields[k].label;
                            break;
                        }
                    }
                    if (sessionStorage.getItem('lang') === 'ptrbr') {
                        if (hourfield.labelPT < name && newFields.indexOf(hourfield) > -1) {
                            _structure_data[i].levels[0].fields.splice(j, 0, {
                                ID: "HRE"
                            });
                            newFields.splice(newFields.indexOf(hourfield), 1);
                        }
                    } else {
                        if (hourfield.labelEN < name && newFields.indexOf(hourfield) > -1) {

                            _structure_data[i].levels[0].fields.splice(j, 0, {
                                ID: "HRE"
                            });
                            newFields.splice(newFields.indexOf(hourfield), 1);
                        }
                    }
                    if (newFields.length === 0)
                        break;
                }

            }
            _self._options = [];
            _structure_data[i].levels.forEach(function(level) {
                _self._levelToAccordion(_self.accordionStructureData.accordion[_self.accordionStructureData.accordion.length - 1].items.accordion, level, _structure_data[i].fields, i);
            });
            count++;
        }
        _self.coreServices.layoutObject.reports.forEach(function(report) {
            var reportTile = {
                customTitle: {
                    name: "app.views.editor.AccTitle",
                    data: {
                        ID: report.sourceId,
                        title: report.metadata.name,
                        description: "ID - " + report.sourceId,
                        items: {
                            accordion: {
                                length: report.outputs.length
                            }
                        },
                        icon: {
                            category: 'File-and-Folders',
                            name: 'reportdoc'
                        }
                    }
                },
                items: {
                    accordion: []
                }
            };
            report.outputs.forEach(function(output) {
                output.metadata.reportName = report.metadata.name;
                output.isOutputField = true;
                reportTile.items.accordion.push({
                    customTitle: {
                        name: "app.views.editor.AccField",
                        data: {
                            ID: output.id,
                            label: output.metadata.name,
                            description: output.metadata.description,
                            type: "BRB:OUTPUT",
                            index: i
                        }
                    }
                });
            });
            reports.items.accordion.push(reportTile);
        });

        _self.accordionStructureData.accordion.push(reports);
        _self.autoCompleteData.options = _self._options;

        $('#accordion').empty().bindBaseAccordion(_self.accordionStructureData);
        this.addDragNDrop();
    },
	
	getDataStructure: function(validStructures) {
		var _self = this;
        _self._loader.open();
        _self.coreServices.structure = {};
        var _simpleType = {
            DECIMAL: 'NUMBER',
            INTEGER: 'NUMBER',
            TINYINT: 'NUMBER',
            VARCHAR: 'STRING',
            NVARCHAR: 'STRING',
            TEXT: 'STRING',
            TIMESTAMP: 'DATE',
            DATE: 'DATE'
        };
        validStructures.map(function(e) {
            _self.coreServices.structure[e.id] = e;
            var fields = {};
            var outputs = {};
            e.fields.map(function(f) {
                f.simpleType = _simpleType[f.type];
                f.id = f.ID;
                fields[f.ID] = f;
            });
            e.fields = fields;
        });
        _self.coreServices.outputs = {};
        _self.coreServices.layoutObject.reports.map(function(reports) {
            reports.outputs.map(function(output) {
                output.reportId = output.sourceId;
                _self.coreServices.outputs[output.id] = output;
            });
        });

        _self.renderAccordion(_self.coreServices.structure);
	},
	
	_levelToAccordion: function(_accordion, _level_data, fields, idStructure) {
		var _self = this;
		var _total_fields = _level_data.fields.length;
		var node = {
			customTitle: {
				name: 'app.views.editor.AccInnerTitle',
				data: {
					ID: Date.now() + _level_data.name,
					title: _level_data.name,
					description: _level_data.description,
					items: {
						accordion: {
							length: 0
						}
					}
				}
			},
			items: {
				accordion: []
			}
		};
		_level_data.fields.forEach(function(field) {
			var _field = fields[field.ID];

			_field.idStructure = idStructure;
			// _field.btnRemove = {
			//    text: i18n("EDITOR FIELDS REMOVE BUTTON"),
			//    class: "btn-link",
			//    hasTransition: true
			// }
			// _field.btnAdd = {
			//    text: i18n("EDITOR FIELDS ADD BUTTON"),
			//    class: "btn-link",
			//    hasTransition: true
			// }
			node.items.accordion.push({
				customTitle: {
					name: 'app.views.editor.AccField',
					data: _field
				}
			});
			_self._options.push({
				key: _field.ID,
				name: _field.label
			});
		});
		_accordion.push(node);
		_level_data.levels.forEach(function(level) {
			_total_fields += _self._levelToAccordion(node.items.accordion, level, fields, idStructure);
		});
		node.customTitle.data.items.accordion.length = _total_fields;
		return _level_data.fields.length;
	},
	
	_getFieldData: function(id) {
		var field;
		this.accordionStructureData.fields.forEach(function(_field) {
			if (_field.ID == id) {
				field = _field;
				return false;
			}
		});
		return field || {};
	},
	
	addDragNDrop: function() {
		$('#accordion li').attr('tabindex', 0);
		$('.field-wrapper').draggable({
			revert: 'invalid',
			helper: function(e) {
				var _clone = $(e.currentTarget).html();
				var holder = $('<div>').addClass('draggable-helper').addClass('field-wrapper').width($(e.currentTarget).outerWidth());
				holder.append(_clone);
				this.holder = holder;
				return holder;
			}
			// drag: function(e, ui) {

			// }
		});

	},
	_refreshSearch: function() {
		var _self = this;

		$("#report-search input").unbind('keyup').bind('keyup', function(e) {
			_self.searchText = $(this).val();

			_self._filterOperation(_self.accordionStructureData.accordion);
			if ($(this).val() == "") {
				$("#delete-auto").addClass("hide");
			} else {
				$("#delete-auto").removeClass("hide");
			}
			$('#accordion li').removeClass('collapsed');
		});

		$("#report-search input").unbind('change').bind('change', function(e) {
			_self.searchText = $(this).val();
			_self._filterOperation(_self.accordionStructureData.accordion);
		});
	},
	_filterOperation: function(_accordion) {
		var _self = this;

		var _total_fields = 0;
		var regex = new RegExp("(" + _self.searchText.toLowerCase() + ")", "g");
		_accordion.forEach(function(_level) {
			var currField;

			if (_level.customTitle.data.idStructure) {
				currField = $('.field-wrapper[data-id="' + _level.customTitle.data.ID + '"][data-idStructure="' + _level.customTitle.data.idStructure +
					'"]');

			} else {
				currField = $('.field-wrapper[data-id="' + _level.customTitle.data.ID + '"][data-type="BRB:OUTPUT"]');

			}
			var fieldLabel = currField.find(".field-label").text();
			if (fieldLabel) {

				if (fieldLabel.toLowerCase().match(regex) === null) {
					currField.removeClass('visible');
					currField.parent().addClass('hide-border');
				} else {

					currField.addClass('visible');
					currField.parent().removeClass('hide-border');
					_total_fields++;
				}
			}
			if (_level.items && _level.items.accordion) {
				var num = _self._filterOperation(_level.items.accordion);
				_total_fields += num;
				$('.header-wrapper[data-id="' + _level.customTitle.data.ID + '"], .inner-header-wrapper[data-id="' + _level.customTitle.data.ID +
					'"]')
					.find('.amount-label .value').html(num);
			}
		});
		return _total_fields;
	},
	renderSearch: function() {
		this.autoCompleteData.isSearchBox = true;
		this.autoComplete = $("#report-search").bindBaseInput(this.autoCompleteData);
	},
	renderTooltips: function() {
		var tooltips = this.view.tooltips = {
			leftPanel: this.view.find('#sh-left-panel'),
			leftPanelDock: this.view.find('.floating-icon-left'),
			filterAll: this.view.find('#filter-btn-all'),
			filterNumber: this.view.find('#filter-btn-number'),
			filterString: this.view.find('#filter-btn-string'),
			filterDate: this.view.find('#filter-btn-calendar'),
			filterReport: this.view.find('#filter-btn-report'),
			filterNoReport: this.view.find('#filter-btn-noreport'),
			userSettings: this.view.find('#user-settings'),
			support: this.view.find('#support-icon'),
			floatingHideBtnLabel: this.view.find('.floating-icon-right'),
		};

		var _createTooltip = function(obj, text, position, width, className) {
			obj.ctrl = obj.baseTooltip({
				text: text,
				class: className || 'dark report-tile-tooltip',
				position: position || 'top',
				// wrapperWidth: width || 75
			});
		};

		_createTooltip(tooltips.leftPanel, i18n('OPEN CLOSE GRID'), 'left');
		_createTooltip(tooltips.leftPanelDock, i18n('DOCK UNDOCK GRID'), 'right', 115);
		_createTooltip(tooltips.filterAll, i18n('DATA ALL'), 'right', 90);
		_createTooltip(tooltips.filterNumber, i18n('DATA NUMBER'), 'right', 90);
		_createTooltip(tooltips.filterString, i18n('DATA STRING'), 'right', 90);
		_createTooltip(tooltips.filterDate, i18n('DATA CALENDAR'), 'right', 90);
		_createTooltip(tooltips.filterReport, i18n('FIELDS IN THE REPORT'), 'right', 90);
		_createTooltip(tooltips.filterNoReport, i18n('FIELDS NO IN REPORT'), 'right', 90);
		_createTooltip(tooltips.userSettings, i18n('USER SETTINGS'), 'left', 115);
		_createTooltip(tooltips.support, i18n('UES'), 'bottom');
		_createTooltip(tooltips.floatingHideBtnLabel, i18n('OPEN CLOSE GRID'), 'left');
		//Setting Tab Indexes for Navigation
		tooltips.floatingHideBtnLabel.attr('tabindex', '0');
		tooltips.floatingHideBtnLabel.keydown(function(ev) {
			if (ev.keyCode == 32 || ev.keyCode == 13) {
				tooltips.floatingHideBtnLabel.find('#floating-hide-btn-label span').eq(1).click();
			}
		});
		tooltips.leftPanelDock.attr('tabindex', '0');
		tooltips.leftPanelDock.keydown(function(ev) {
			if (ev.keyCode == 32 || ev.keyCode == 13) {
				tooltips.leftPanelDock.find('#floating-dock-btn-label').click();
			}
		});
		tooltips.filterAll.attr('tabindex', '0');
		tooltips.filterNumber.attr('tabindex', '0');
		tooltips.filterString.attr('tabindex', '0');
		tooltips.filterDate.attr('tabindex', '0');
		tooltips.filterReport.attr('tabindex', '0');
		tooltips.filterNoReport.attr('tabindex', '0');
	},
	bindEvents: function() {
		var _self = this;

		function setPressed(button) {
			var button = $(button);
			button.parent().find(".pressed").removeClass("pressed");
			button.children().addClass("pressed");
		}
		$('#filter-btn-all').unbind('click').bind('click', function() {
			_self._applyButtonFilter('all');
			setPressed(this);
		});
		$('#filter-btn-number').unbind('click').bind('click', function() {
			_self._applyButtonFilter('number');
			setPressed(this);
		});
		$('#filter-btn-string').unbind('click').bind('click', function() {
			_self._applyButtonFilter('string');
			setPressed(this);
		});
		$('#filter-btn-calendar').unbind('click').bind('click', function() {
			_self._applyButtonFilter('date');
			setPressed(this);
		});
		$('#filter-btn-report').unbind('click').bind('click', function() {
			_self._applyButtonFilter('report');
			setPressed(this);
		});
		$('#filter-btn-noreport').unbind('click').bind('click', function() {
			_self._applyButtonFilter('noreport');
			setPressed(this);
		});
		$.each($('#filter-btn-all,#filter-btn-number,#filter-btn-string,#filter-btn-calendar,#filter-btn-report,#filter-btn-noreport'),
			function(ind, ele) {
				$(ele).keydown(function(ev) {
					if (ev.keyCode == 32 || ev.keyCode == 13) {
						$(ele).click();
					}
				});
			});
	},
	_applyButtonFilter: function(key) {
		var _self = this;
		if (key && key == 'report') {
			_self._not_selected_fields = false;
		} else if (key && key == 'noreport') {
			_self._not_selected_fields = true;
		} else if (key) {
			_self._types = [];
		}
		if (key && (!key.localeCompare('number') || !key.localeCompare('all'))) {
			_self._types.push('DECIMAL');
			_self._types.push('INTEGER');
			_self._types.push('TINYINT');
		}
		if (key && (!key.localeCompare('string') || !key.localeCompare('all'))) {
			_self._types.push('VARCHAR');
			_self._types.push('NVARCHAR');
			_self._types.push('TEXT');
		}
		if (key && (!key.localeCompare('date') || !key.localeCompare('all'))) {
			_self._types.push('TIMESTAMP');
			_self._types.push('DATE');
		}

		var _buttonFilterOperation = function(_accordion) {
			var _total_fields = 0;
			_accordion.forEach(function(_level) {
				if (_level.customTitle.data.type) {
					if (_self._types.lastIndexOf(_level.customTitle.data.type) == -1) {
						$('.field-wrapper[data-id="' + _level.customTitle.data.ID + '"]').removeClass('visible');
						$('.field-wrapper[data-id="' + _level.customTitle.data.ID + '"]').parent().attr('tabindex', '-1');
						$('.field-wrapper[data-id="' + _level.customTitle.data.ID + '"]').parent().css('border', 'none');
					} else {
						if (_self._not_selected_fields) { //&& !$.designController.columnEditor.getColumn(_level.customTitle.data.ID)) {
							if (_self.searchText && _level.customTitle.data.label.toLowerCase().lastIndexOf(_self.searchText.toLowerCase()) == -1) {
								$('.field-wrapper[data-id="' + _level.customTitle.data.ID + '"]').removeClass('visible');
								$('.field-wrapper[data-id="' + _level.customTitle.data.ID + '"]').parent().attr('tabindex', '-1');
								$('.field-wrapper[data-id="' + _level.customTitle.data.ID + '"]').parent().css('border', 'none');
							} else {
								$('.field-wrapper[data-id="' + _level.customTitle.data.ID + '"]').addClass('visible');
								$('.field-wrapper[data-id="' + _level.customTitle.data.ID + '"]').parent().attr('tabindex', '0');
								$('.field-wrapper[data-id="' + _level.customTitle.data.ID + '"]').parent().css('border', '');
								_total_fields++;
							}
						} else if (!_self._not_selected_fields) { //&& $.designController.columnEditor.getColumn(_level.customTitle.data.ID)) {
							if (_self.searchText && _level.customTitle.data.label.toLowerCase().lastIndexOf(_self.searchText.toLowerCase()) == -1) {
								$('.field-wrapper[data-id="' + _level.customTitle.data.ID + '"]').removeClass('visible');
								$('.field-wrapper[data-id="' + _level.customTitle.data.ID + '"]').parent().attr('tabindex', '-1');
								$('.field-wrapper[data-id="' + _level.customTitle.data.ID + '"]').parent().css('border', 'none');
							} else {
								$('.field-wrapper[data-id="' + _level.customTitle.data.ID + '"]').addClass('visible');
								$('.field-wrapper[data-id="' + _level.customTitle.data.ID + '"]').parent().attr('tabindex', '0');
								$('.field-wrapper[data-id="' + _level.customTitle.data.ID + '"]').parent().css('border', '');
								_total_fields++;
							}
						} else {
							$('.field-wrapper[data-id="' + _level.customTitle.data.ID + '"]').removeClass('visible');
							$('.field-wrapper[data-id="' + _level.customTitle.data.ID + '"]').parent().attr('tabindex', '-1');
							$('.field-wrapper[data-id="' + _level.customTitle.data.ID + '"]').parent().css('border', 'none');
						}
					}
				}
				if (_level.items && _level.items.accordion) {
					var num = _buttonFilterOperation(_level.items.accordion);
					_total_fields += num;
					$('.header-wrapper[data-id="' + _level.customTitle.data.ID + '"], .inner-header-wrapper[data-id="' + _level.customTitle.data.ID +
						'"]')
						.find('.amount-label .value').html(num);
				}
			});
			return _total_fields;
		}
		_buttonFilterOperation(this.accordionStructureData.accordion);
	},
	
	renderOutputDialog: function() {
        var _self = this;
        var dialog = $.baseDialog({
            title: i18n('ADD OUTPUT'),
            modal: true,
            size: "medium",
            disableOuterClick: true,
            viewName: "app.views.editor.floatingPanel.outputDialog",
            viewData: {},
            // text: i18n('ADD OUTPUT'),
            buttons: [{
                name: i18n('CANCEL'),
                isCloseButton: true,
                click: function() {
                    _self.outputData = {};

                }
            }, {
                name: i18n('NEXT'),
                click: function() {
                    if (_self.coreServices.getNext()) {
                        var loader = $('#outputDialog').parent().parent().baseLoader({
                            modal: true
                        });
                        loader.open();
                        _self.outputData.first = _self.coreServices.getOutputs();
                        Data.endpoints.dfg.output.listCompany.get().success(function(companies) {
                            Data.endpoints.dfg.output.listTax.get().success(function(taxes) {
                                var fiscalDialog = $.baseDialog({
                                    title: i18n('ADD OUTPUT FISCAL BOOK'),
                                    modal: true,
                                    size: "medium",
                                    disableOuterClick: true,
                                    viewName: "app.views.editor.floatingPanel.fiscalBookDialog",
                                    viewData: {
                                        companies: companies,
                                        taxes: taxes,
                                        outputs: _self.outputData.first
                                    },
                                    buttons: [{
                                        name: i18n('GO BACK'),
                                        click: function() {
                                            fiscalDialog.close();
                                            dialog.open();
                                            _self.outputData.second = _self.coreServices.getOutputsFiscal();
                                            _self.coreServices.setFirstData(_self.outputData.first);
                                        }
                                    }, {
                                        name: i18n('NEXT'),
                                        click: function() {
                                            if (_self.coreServices.getFiscalNext()) {
                                                _self.outputData.second = _self.coreServices.getOutputsFiscal();
                                                var reportDialog = $.baseDialog({
                                                    title: i18n('ADD OUTPUT REPORT'),
                                                    modal: true,
                                                    size: "big",
                                                    disableOuterClick: true,
                                                    viewName: "app.views.editor.floatingPanel.reportDialog",
                                                    viewData: {},
                                                    buttons: [{
                                                        name: i18n('GO BACK'),
                                                        click: function() {
                                                            reportDialog.close();
                                                            fiscalDialog.open();
                                                            _self.coreServices.setSecondData(_self.outputData.second);
                                                        }
                                                    }, {
                                                        name: i18n('APPLY'),
                                                        click: function() {
                                                            reportDialog.close();
                                                            _self.outputData = {};
                                                            _self.coreServices.layoutObject.idOutput = _self.coreServices.getTableSelected();
                                                        }
                                                    }]
                                                });
                                                fiscalDialog.close();
                                                reportDialog.open();
                                            } else {
                                                $.baseToast({
                                                    isError: true,
                                                    text: i18n('DIALOG TEXT')
                                                });
                                            }
                                        }
                                    }]
                                });
                                loader.close();
                                dialog.close();
                                fiscalDialog.open();
                                if (_self.outputData.second) {
                                    _self.coreServices.setSecondData(_self.outputData.second);
                                }
                            }).error(function(msgError) {
                                loader.close();
                                $.baseToast({
                                    isError: true,
                                    text: msgError
                                });
                            });
                        }).error(function(msgError) {
                            loader.close();
                            $.baseToast({
                                isError: true,
                                text: msgError
                            });
                        });
                    } else {
                        $.baseToast({
                            isError: true,
                            text: i18n('DIALOG TEXT')
                        });
                    }
                }
            }]
        });
        dialog.open();
    },
	
});