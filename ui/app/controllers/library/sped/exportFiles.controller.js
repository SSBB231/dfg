/*global i18n Data parseDate getTDFServiceLocation*/
sap.ui.controller("app.controllers.library.sped.exportFiles", {
	onInit: function() {

	},
	onDataRefactor: function() {

	},
	onAfterRendering: function(html) {
		var _self = this;
		_self.view = $(html);
		_self.view.tableContainer = _self.view.find(".table-container");
		_self.view.advancedFilters = _self.view.find(".advanced-filter-container");
		_self.view.refreshBtn = _self.view.find(".reload-btn");
		_self.view.search = _self.view.find("#search");
		_self.view.search.input = _self.view.search.find(".search-input");
		_self.view.search.button = _self.view.search.find("#advanced-filters-btn");
		_self.view.loader = _self.view.baseLoader({
			modal: true
		});
		_self.actualPage = 1;
        _self.searchParams = {};
		_self.renderFilters();
		_self.bindEvents();
		_self.renderTable();

	},
	bindEvents: function() {
		var _self = this;
		_self.view.refreshBtn.bind("click", function() {
			_self.refreshData();
		});
	},
	refreshData: function(page) {
		var _self = this;
		_self.view.loader.open();
		if (_self._data.isJob) {
			Data.endpoints.dfg.sped.getSpedExecutions.post({
				idSped: _self._data.id,
				page: page,
				searchParams: _self.searchParams
			}).success(function(data) {
				_self.renderTable(data.files, data.pageCount);
				_self.view.loader.close();
			}).error(function(d) {
				_self.view.loader.close();
			});
		} else {
			Data.endpoints.dfg.sped.getReportFilesSPED.post({
				idSped: _self._data.id,
				page: page,
				searchParams: _self.searchParams
			}).success(function(data) {
				_self.renderTable(data.files, data.pageCount);
				_self.view.loader.close();
			}).error(function(d) {
				_self.view.loader.close();
			});
		}
	},
	renderFilters: function() {
		var _self = this;
		var data = _self.getData();
		_self.view.search.button.unbind('click').bind('click', function() {
			_self.openFilter(false);
		});
		_self.view.search.button.baseTooltip({
			class: 'dark',
			position: 'top',
			text: i18n('CLICK PRESS TO') + "  " + i18n('LIBRARY CONTENT ADVANCED FILTERS TOOLTIP')
		});
		_self.view.advancedFilters.empty();
		data.filterOptions.executionDate = true;
		_self.view.advancedFilters.ctrl = _self.view.advancedFilters.bindAdvancedFilters({
			filterOptions: data.filterOptions,
			spedReportFile: !_self._data.isJob,
			withoutFields: ["id","name","modificationUser","modificationDateFrom","creationDateFrom"],
			isSpedJob: _self._data.isJob,
			parentCtrl: _self,
			cleanBtn: true
		});
	},
	filterReportFileData: function(searchParams) {
		var _self = this;
		var _data = _self.getData();
		_self.view.loader.open();
		Data.endpoints.dfg.sped.getReportFilesSPED.post({
			idSped: _data.id,
			noFilters: true,
			searchParams: searchParams
		}).success(function(data) {
			_self.renderTable(data.files,data.pageCount);
			_self.view.loader.close();
		});
	},
	filterSpedExecutions: function(searchParams) {
		var _self = this;
		var _data = _self.getData();
		_self.view.loader.open();
		_self.searchParams = searchParams;
		_self.actualPage = 1;
		Data.endpoints.dfg.sped.getSpedExecutions.post({
			idSped: _self._data.id,
			page: _self.actualPage,
			searchParams: searchParams
		}).success(function(data) {
			_self.renderTable(data.files,data.pageCount);
			_self.view.loader.close();
		}).error(function(d) {
			_self.view.loader.close(); 
		});
	},
	openFilter: function(close) {
		var _self = this;
		if (!close && !_self.view.hasClass('open2')) {
			_self.view.addClass("open2");

		} else {
			_self.view.removeClass('open2');
		}

		var icon = _self.view.search.button.find(".icon");

		if (!close && icon.hasClass("icon-collapsedown")) {
			_self.view.search.button.find(".icon").toggleClass("icon-collapsedown");
			_self.view.search.button.find(".icon").toggleClass("icon-collapseup");
		} else if (icon.hasClass("icon-collapseup")) {
			_self.view.search.button.find(".icon").toggleClass("icon-collapseup");
			_self.view.search.button.find(".icon").toggleClass("icon-collapsedown");
		}
	},
	renderTable: function(files, pageCount) {
		var _self = this;
		var data = _self.getData();
		_self.view.tableContainer.empty();
		if(pageCount === 0){
		    pageCount = 1;
		}
		var headers = [];
		var pushHeader = function(headers, text, sort, height) {
			headers.push({
				text: text,
				sort: (sort !== undefined) ? sort : true,
				width: (height !== undefined) ? height : "130px"
			});
		};
		var bodyData = [];
		data.files = files || data.files;
		if (!data.isJob) {
			data.files.map(function(val) {
				if (!Array.isArray(val.reportFiles)) {
					val.reportFiles = [val.reportFiles];
				}
				for (var i = 0; i < val.reportFiles.length; i++) {
					var actions = [];
					if (!data.isVisualization) {
						actions.push({
							iconFont: "DataManager",
							icon: "download",
							text: i18n("EXPORT"),
							onPress: function() {
								_self.view.loader.open();
								var fileid = this.currentTarget.parentElement.parentElement.dataset.id;
								var callBack = function(formData) {
									Data.endpoints.dfg.sped.exportTOMFile.post({
										idFile: fileid,
										adapter: formData.adapter,
										destination: formData.destination
									}).success(function(data2) {
										if (data2.file) {

											// 		var downloadFile = function(fileName, urlData) {
											// 			var a = document.createElement('a');
											// 			document.body.appendChild(a);
											// 			a.download = fileName;
											// 			a.href = urlData;
											// 			a.click();
											// 		};
											var fileName = "";
											for (var i = 0; i < data.files.length; i++) {
												for (var j = 0; j < data.files[i].reportFiles.length; j++) {
													if (data.files[i].reportFiles[j].idFile === fileid) {
														fileName = data.files[i].reportFiles[j].fileName;
													}
												}
											}
											// 		downloadFile(fileName, "data:text/csv;charset=UTF-8," + encodeURIComponent(data2.file));
											var blob = new Blob([data2.file], {
												type: 'data:text/csv;charset=UTF-8,'
											});
											saveAs(blob, fileName);
										} else {
											$.baseToast({
												text: i18n("COULD NOT DOWNLOAD FILE"),
												type: "e"
											});
										}
										_self.view.loader.close();
									}).error(function() {
										_self.view.loader.close();
										$.baseToast({
											text: i18n("ERROR GETTING FILE"),
											type: "e"
										});
									});
								};
								// $.baseWebServiceDialog({
								//                 			title: i18n('SERVICE'),
								//                 			viewData: {
								//                 				serviceName: "TMFTOMExportFile",
								//                 				noLocation: true,
								//                 				callBack: function(formData) {
								//                 					callBack(formData);
								//                 				}
								//                 			}
								//                 		});
								getTDFServiceLocation(
									"TMFTOMExportFile",
									function(adapterId, location, serviceDestinationId) {
										callBack({
											adapter: adapterId,
											destination: serviceDestinationId
										});
									},
									function() {},
									true
								);
							}
						});
					} else {
						actions.push({
							iconFont: "Display-and-Setting",
							icon: "preview",
							text: i18n("VISUALIZE"),
							onPress: function() {

								var url = '/timp/dfg/#/executor?idSPEDFile=' + this.currentTarget.parentElement.parentElement.dataset.id;
								window.open(url, '_blank');
							}
						});
					}

					bodyData.push({
						actions: actions,
						id: val.reportFiles[i].idFile,
						position: bodyData.length,
						content: [
                            val.reportFiles[i].fileName,
                            val.reportFiles[i].description,
                            val.reportFiles[i].idCompany,
                            val.reportFiles[i].idBranch,
                            val.reportFiles[i].fiscalState,
                            val.reportFiles[i].cnpj,
                            val.reportFiles[i].initPeriod,
                            val.reportFiles[i].endPeriod,
                            val.creationUserData[0].name + " " + val.creationUserData[0].last_name,
                            parseDate(val.creationDate),
                            val.modificationUserData[0].name + " " + val.modificationUserData[0].last_name,
                            parseDate(val.modificationDate)

                        ]
					});
				}
			});
			pushHeader(headers, i18n("TILE LAYOUT NAME"));
			pushHeader(headers, i18n("TILE DESCRIPTION"));
			pushHeader(headers, i18n("COMPANY"));
			pushHeader(headers, i18n("BRANCH"));
			pushHeader(headers, i18n("FISCAL STATE NUMBER"));
			pushHeader(headers, i18n("ROOT CNPJ"));
			pushHeader(headers, i18n("TILE INITIAL FROM"));
			pushHeader(headers, i18n("TILE DATE TO"));
			pushHeader(headers, i18n('TILE CREATION BY'));
			pushHeader(headers, i18n('TILE CREATION ON'));
			pushHeader(headers, i18n('TILE MODIFIED BY'));
			pushHeader(headers, i18n('TILE MODIFIED ON'));
		} else {
			data.files.map(function(val) {
				var creationDate = new Date(val.creationDate);
				bodyData.push({
					id: val.id,
					content: [
                            val.id,
                            val.status === 1 ? i18n("IN PROCESS") : val.status === 2 ? i18n("COMPLETED") : val.status === 3 ? i18n("ERROR") :
						i18n("REVERTED"),
                            val.idCompany,
                            val.uf,
                            val.idBranch,
                            val.subperiod,
                            val.creationUser,
						(creationDate.getHours() % 12 || 12) + ":" + creationDate.getMinutes() + ":" + creationDate.getSeconds(),
						(creationDate.getDate() < 10 ? "0" + creationDate.getDate() : creationDate.getDate()) + "/" + ((creationDate.getMonth() + 1 < 10) ?
							"0" + (creationDate.getMonth() + 1) : creationDate.getMonth() + 1) + "/" + creationDate.getFullYear()
                        ]
				});

			});
			pushHeader(headers, i18n("ID"));
			pushHeader(headers, i18n("STATUS"));
			pushHeader(headers, i18n("COMPANY"));
			pushHeader(headers, i18n("TILE UF"));
			pushHeader(headers, i18n("BRANCH"));
			pushHeader(headers, i18n("SUBPERIOD"));
			pushHeader(headers, i18n("CREATED BY"));
			pushHeader(headers, i18n("EXECUTION HOUR"));
			pushHeader(headers, i18n("EXECUTION DATE"));
		}
		_self.renderedTable = _self.view.tableContainer.bindBaseTable({
			hasActions: !data.isJob,
			hasExpand: true,
			actualPage: _self.actualPage,
			hasPagination: true,
			totalPages: pageCount || data.pageCount,
			onPageChange: function(oldVal, newVal) {
				_self.actualPage = Number(newVal);
				_self.refreshData(_self.actualPage);
			},
			headers: headers,
			body: bodyData
		});
	}
});