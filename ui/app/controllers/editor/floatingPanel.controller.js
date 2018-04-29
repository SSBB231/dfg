sap.ui.controller("app.controllers.editor.floatingPanel", {
	onInit: function() {
		this.autoCompleteData = {
			options: [],
			placeholder: i18n('SEARCH'),
			cssClass: 'editor-search-autocomplete',
			boxCssClass: 'editor-search-box-autocomplete',
			hideOverlay: true
		}
		this.searchText = null;
		this.accordionStructureData = {
			fields: [],
			accordion: [],
			items: []
		}
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
		this.floatingPanelEvents();
		_self.coreServices.initDataStructure = function(structures) {
			_self.getDataStructure(structures);
		};
		this.bindEvents();
		$("#report-search").hide();
		$(".filter-wrapper").hide();
	},
	floatingPanelEvents: function() {
		var iconLayout = $('.main-wrapper .left-content.floating-panel .floating-header .floating-icon-right .icon');
		var sidebarLeft = $('.main-wrapper .main-inner > .left');
		var _floatingPanel = $('.floating-panel');
		var _leftContent = $('.main-inner > .left');
		var _floatingFooter = _floatingPanel.find('.footer-handle');

		_floatingPanel.draggable({
			handle: '.floating-header',
			containment: 'body'
		});

		_floatingFooter.draggable({
			axis: 'y',
			containment: '.floating-panel',
			start: function(e) {
				this.lastY = e.clientY;
				this.computedH = _floatingPanel.height();
				e.stopPropagation();
			},
			drag: function(e) {
				var minHeight = 250;
				this.computedH += e.clientY - this.lastY;

				if (this.computedH < minHeight)
					this.computedH = minHeight;

				_floatingPanel.css('height', this.computedH + 'px');

				this.lastY = e.clientY;
				e.stopPropagation();
			},
			stop: function(e) {
				e.stopPropagation();
			}
		});

		_floatingPanel.draggable('disable');
		_floatingPanel.css({
			opacity: 1
		});
		_floatingPanel.find('#floating-dock-btn-label').click(function() {
			_floatingPanel.draggable('disable');
			_leftContent.toggleClass('floating-panel-active');
			if (!_leftContent.hasClass('floating-panel-active')) {
				_floatingPanel.css({
					left: "0px",
					top: "0px"
				})
				_floatingPanel.find("#floating-hide-btn-label").click();
			} else {
				_floatingPanel.draggable('enable');
				if (_floatingPanel.css('top') == '0px' && _floatingPanel.css('left') == '0px') {
					_floatingPanel.css({
						top: $('.main-header').height(),
						left: $('.main-content .main-inner').css('margin-left')
					});
				}
			}
		});
	},
	renderAccordion: function(_structure_data) {
		var _self = this;
		var structureAccordions = [];
		var iconByType = function(type) {
			var icon = {};
			if (type === "DECIMAL" || type === "NUMBER" || type === "INTEGER" || type === "DOUBLE") {
				return {
					icon: "number",
					iconFont: "Sign-and-Symbols"
				};
			}
			if (type === "NVARCHAR" || type === "VARCHAR" || type === "TEXT") {
				return {
					icon: "string",
					iconFont: "Sign-and-Symbols"
				};
			}
			if (type === "TIMESTAMP" || type === "DATE") {
				return {
					icon: "calendar",
					iconFont: "Time-and-Date"
				};
			}
			return icon;
		};
		var getItemsByLevel = function(level, currentId, parent) {
			var amount = 0;

			var items = [];
			for (var f = 0; f < level.fields.length; f++) {
				var subItem = {
					metadata: {
						id: currentId + "_" + level.fields[f].ID,
						icon: iconByType(parent.fields[level.fields[f].ID].type),
						name: {
							text: parent.fields[level.fields[f].ID].label
						}
					},
					data_attributes: {
						ID: parent.fields[level.fields[f].ID].ID,
						hanaName: parent.fields[level.fields[f].ID].hanaName,
						label: parent.fields[level.fields[f].ID].label,
						type: parent.fields[level.fields[f].ID].type,
						columnType: "StructureFieldColumn",
						idStructure: parent.id,
						isMeasure: parent.fields[level.fields[f].ID].isMeasure
					}
				};
				amount++;
				items.push(subItem);
			}
			if (!_.isEmpty(level.levels)) {
				for (var l = 0; l < level.levels.length; l++) {
					var subItem = getItemsByLevel(level.levels[l], currentId + "_" + l, parent);
					items.push(subItem.item);
					amount += subItem.amount;
				}
			}
			var item = {
				metadata: {
					id: currentId,
					name: {
						text: level.name,
						description: level.description
					},
					count: {
						amount: amount,
						description: i18n("FIELDS")
					}
				},
				hasExpandIcon: true,
				items: items
			};
			return {
				item: item,
				amount: amount
			};
		};
		var specialFields = [{
			id: 'formula',
			columnType: "FormulaColumn",
			label: 'FORMULA',
			iconFont: 'Finance-and-Office',
			icon: 'function'
        }, {
			id: 'recordId',
			columnType: "RecordIdColumn",
			label: 'RECORDID',
			iconFont: 'Finance-and-Office',
			icon: 'tableview'
        }, {
			id: 'f',
			columnType: "FillerColumn",
			label: 'FILLER',
			iconFont: 'File-and-Folders',
			icon: 'fullbox'
        }, {
			id: 'm',
			columnType: "ManualParamColumn",
			label: 'PARAMETRO',
			iconFont: 'Formatting-and-Tool',
			icon: 'textandtext'
        }, {
			id: 'blockTotal',
			columnType: "BlockTotalColumn",
			label: 'BLOCKTOTAL',
			iconFont: 'Sign-and-Symbols',
			icon: 'number'
        }, {
			id: 'recordsTotals',
			columnType: "RecordTotalColumn",
			label: 'RECORDTOTAL',
			iconFont: 'Sign-and-Symbols',
			icon: 'number'
        }, {
			id: 'totalsAll',
			columnType: "TotalAllColumn",
			label: 'TOTALALL',
			iconFont: 'Sign-and-Symbols',
			icon: 'number'
        }, {
			id: 'totalChildRecord',
			columnType: "TotalChildRecord",
			label: 'TOTALCHILDRECORD',
			iconFont: 'Sign-and-Symbols',
			icon: 'number'
        }, {
			id: 'recordCounter',
			columnType: "RecordCounter",
			label: 'RECORDCOUNTER',
			iconFont: 'Sign-and-Symbols',
			icon: 'number'
        }, {
			id: 'recordList',
			columnType: "RecordList",
			label: 'RECORDLIST',
			iconFont: 'Display-and-Setting',
			icon: 'orderedlist'
        }, {
			id: 'initialDateReference',
			columnType: "InitialDateReferenceColumn",
			label: 'INITDATEREFERENCE',
			iconFont: 'Time-and-Date',
			icon: 'calendar'
        }, {
			id: 'finalDateReference',
			columnType: "FinalDateReferenceColumn",
			label: 'FINALDATEREFERENCE',
			iconFont: 'Time-and-Date',
			icon: 'calendar'
        }, {
			id: 'v',
			columnType: "VersionColumn",
			label: 'VERSION',
			iconFont: 'File-and-Folders',
			icon: 'docversion'

        }, {
			id: 'HRE',
			columnType: "ExecutionHourColumn",
			label: "HR_EXECUCAO",
			iconFont: 'Time-and-Date',
			icon: 'clock'
        }, {
			id: 'DTE',
			columnType: "ExecutionDateColumn",
			label: "DT_EXECUCAO",
			iconFont: 'Time-and-Date',
			icon: 'calendar'
        }, {
			id: 'sp',
			columnType: "ReferencePeriodColumn",
			label: 'REFERENCE PERIOD',
			iconFont: 'Time-and-Date',
			icon: 'calendar'
        }, {
			id: 'fxf',
			columnType: "FixedFieldColumn",
			label: 'FIXED FIELD',
			iconFont: 'Sign-and-Symbols',
			icon: 'locked'
        }, {
			id: 'fmf',
			columnType: "FixedManualFieldColumn",
			label: 'FIXED MANUAL FIELD',
			iconFont: 'Display-and-Setting',
			icon: 'orderedlist'
        }, {
			id: 'newline',
			columnType: "LineBreakColumn",
			label: 'NEWLINE',
			iconFont: 'Display-and-Setting',
			icon: 'indent'
        }, {
			id: 'sf',
			columnType: "SequenceFieldColumn",
			label: 'SEQUENCE',
			iconFont: "Sign-and-Symbols",
			icon: 'flow'
        },{
            id: "groupedLines",
            columnType: "GroupedLinesColumn",
            label: "GROUPED LINES FIELD",
          	iconFont: 'Sign-and-Symbols', 
			icon: 'number'
        }];
		//-------------------- SPECIAL FIELDS SUB ACCORDION----------------------------------//
		var specialFieldAccordion = {
			metadata: {
				id: "special-fields",
				icon: {
					icon: "edit",
					iconFont: "Formatting-and-Tool"
				},
				name: {
					text: i18n('SPECIAL FIELDS')
				}
			},
			items: specialFields.map(function(sf) {
				return {
					metadata: {
						id: sf.id,
						icon: {
							icon: sf.icon,
							iconFont: sf.iconFont
						},
						name: {
							text: i18n(sf.label)
						}
					},
					data_attributes: {
					    label: sf.label,
					    columnType: sf.columnType
					}
				};
			})
		};
		structureAccordions.push(specialFieldAccordion);
		//--------------------- STRUCTURE FIELDS SUB ACCORDION-------------------------------//
		for (var structure in _structure_data) {
			var items = [];
			var amount = 0;
			for (var l = 0; l < _structure_data[structure].levels.length; l++) {
				var subItem = getItemsByLevel(_structure_data[structure].levels[l], structure + "_" + l, _structure_data[structure]);
				items.push(subItem.item);
				amount += subItem.amount;
			}
			var structureAccordion = {
				metadata: {
					id: structure,
					icon: {
						iconFont: "Finance-and-Office",
						icon: "fiscaldocument"
					},
					name: {
						text: _structure_data[structure].title,
						description: _structure_data[structure].description
					},
					count: {
						amount: amount,
						description: i18n("FIELDS")
					}
				},
				items: items
			};
			structureAccordions.push(structureAccordion);

		}
		//----------------------BRB OUTPUTS SUB ACCORDION------------------------------------//
		var reportAccordion = {
			metadata: {
				id: "REPORT",
				icon: {
					iconFont: 'Formatting-and-Tool',
					icon: "edit"
				},
				name: {
					text: i18n('REPORT')
				},
				count: {
					amount: _self.coreServices.layoutObject.reports.length,
					description: i18n("FIELDS")
				}
			},
			items: _self.coreServices.layoutObject.reports.map(function(report) {
				var item = {
					metadata: {
						id: report.sourceId,
						icon: {
							iconFont: 'File-and-Folders',
							icon: 'reportdoc'
						},
						name: {
							text: report.metadata.name,
							description: "ID-" + report.sourceId
						},
						count: {
							amount: report.outputs.length,
							description: i18n("FIELDS")
						}
					},
					items: report.outputs.map(function(output) {
						return {
							metadata: {
								id: output.id,
								name: {
									text: output.metadata.name
								}
							},
							data_attributes: {
								"type": "BRB:OUTPUT",
								label: output.metadata.name,
								outputMetadata: JSON.stringify(output),
								"columnType": "OutputColumn"
							}
						};
					})
				};
				return item;
			})
		};
		structureAccordions.push(reportAccordion);
		//----------------------BCB OUTPUTS SUB ACCORDION------------------------------------//
		var bcbAccordion = {
			metadata: {
				id: "BCB_OUTPUTS",
				icon: {
					iconFont: "Formatting-and-Tool",
					icon: "edit"
				},
				name: {
					text: "BCB " + i18n("OUTPUTS")
				},
				count: {
					amount: _self.coreServices.layoutObject.outputsBCB.length,
					description: i18n("FIELDS")
				}
			},
			items: _self.coreServices.layoutObject.outputsBCB.map(function(bcbReport) {
				return {
					metadata: {
						id: bcbReport.id,
						icon: {
							iconFont: 'File-and-Folders',
							icon: 'reportdoc'
						},
						name: {
							text: bcbReport.name,
							description: "ID-"+bcbReport.id
						},
						count: {
							amount: bcbReport.outputs.length,
							description: i18n("FIELDS")
						}
					},
					items: bcbReport.outputs.map(function(output) {
						return {
							metadata: {
								id: output.id,
								name: {
									text: output.name
								}
							},
							data_attributes: {
								type: "DECIMAL",
								"type": "BCB:OUTPUT",
								"columnType": "OutputColumn",
								outputMetadata: JSON.stringify(output),
								"label": output.name
							} 
						};
					})
				};
			})
		};
		structureAccordions.push(bcbAccordion);
		//---------------------BFB OUTPUTS SUB ACCORDION-------------------------------------//
		var bfbAccordion = {
			metadata: {
				id: "BFB_OUTPUTS",
				icon: {
					iconFont: "Formatting-and-Tool",
					icon: "edit"
				},
				name: {
					text: "BFB " + i18n("OUTPUTS")
				},
				count: {
					amount: _self.coreServices.layoutObject.outputsBFB.length,
					description: i18n("FIELDS")
				}
			},
			items: _self.coreServices.layoutObject.outputsBFB.map(function(bfbReport) {
				return {
					metadata: {
						id: bfbReport.id,
						icon: {
							iconFont: 'File-and-Folders',
							icon: 'reportdoc'
						},
						name: {
							text: bfbReport.name,
							description: "ID-"+bfbReport.id
						},
						count: {
							amount: bfbReport.outputs.length,
							description: i18n("FIELDS")
						}
					},
					items: bfbReport.outputs.map(function(output) {
						return {
							metadata: {
								id: output.id,
								name: {
									text: output.name
								}
							},
							data_attributes: {
								type: "DECIMAL",
								"type": "BFB:OUTPUT",
								"columnType":"OutputColumn",
								outputMetadata: JSON.stringify(output),
								"label": output.name
							}
						};
					})
				};
			})
		};
		structureAccordions.push(bfbAccordion);

		$('#accordion').empty().bindBaseAccordionKat({
			accordion: structureAccordions,
			hasSearch: true,
			hasFilters: true,
			draggable: true
		});

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
	getDataStructure: function(validStructures, outputs) {
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
		$.globalFunctions.setStructure(_self.coreServices.structure);
		_self.coreServices.outputs = {};
		_self.coreServices.layoutObject.reports.map(function(reports) {
			reports.outputs.map(function(output) {
				output.reportId = output.sourceId;
				_self.coreServices.outputs[output.id] = output;
			});
		});
		_self.coreServices.outputsBCB = {};
		_self.coreServices.layoutObject.outputsBCB.map(function(outputsBCB) {
			outputsBCB.outputs.map(function(output) {
				output.metadata = {
					sourceId: outputsBCB.id,
					reportName: outputsBCB.name
				};
				output.bcbId = outputsBCB.id;
				_self.coreServices.outputsBCB[output.id] = output;
			});
		});
		_self.coreServices.outputsBFB = {};
		_self.coreServices.layoutObject.outputsBFB.map(function(outputsBFB) {
			outputsBFB.outputs.map(function(output) {
				output.metadata = {
					sourceId: outputsBFB.id,
					reportName: outputsBFB.name
				};
				output.bfbId = outputsBFB.id;
				_self.coreServices.outputsBFB[output.id] = output;
			});
		});

		_self.renderAccordion(_self.coreServices.structure);

		_self._loader.close();
		if (_self.exhibition) {
			_self.processExhibition();
		}
		_self.coreServices.renderLayout();
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
			},
			// drag: function(e, ui) {

			// }
		})

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
	processExhibition: function() {
		var mainCrystal = $('<div>').addClass('dfg-crystal');

		$('#dfg .left #accordion').append(mainCrystal);
	}
});