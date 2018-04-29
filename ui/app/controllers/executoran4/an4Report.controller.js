//AN4 REPORT CONTROLLER ------- KBARA 25/11/2016 --------------
sap.ui.controller("app.controllers.executoran4.an4Report", {
	onInit: function() {},
	onDataRefactor: function(data) {
		return $.extend(data, this.data);
	},
	onAfterRendering: function(html) {

		var _self = this;
		var data = _self.getData();
		_self.an4 = data.an4;
		_self.view = $(html);
		//HEADER
		_self.view.header = _self.view.find(".header");
		_self.view.header.company = _self.view.header.find(".company");
		_self.view.header.branch = _self.view.header.find(".branch");
		_self.view.header.digitalFileTypeReference = _self.view.header.find(".digital-file-typeReference");
		_self.view.header.digitalFileTypeComparison = _self.view.header.find(".digital-file-typeComparison");
		_self.view.header.auditoryDate = _self.view.header.find(".auditory-date");
		_self.view.header.auditoryHour = _self.view.header.find(".auditory-hour");
		_self.view.header.fileNameReference = _self.view.header.find(".fileNameReference");
		_self.view.header.fileNameComparison = _self.view.header.find(".fileNameComparison");
		_self.view.header.idLayoutReference = _self.view.header.find(".idlayoutReference");
		_self.view.header.idSettingReference = _self.view.header.find(".idsettingReference");
		_self.view.header.idLayoutComparison = _self.view.header.find(".idlayoutComparison");
		_self.view.header.idSettingComparison = _self.view.header.find(".idsettingComparison");
		_self.view.header.originReference = _self.view.header.find(".originReference");
		_self.view.header.originComparison = _self.view.header.find(".originComparison");
		//METADATA
		_self.view.metadata = _self.view.find(".report-metadata");
		_self.view.metadata.ruleCode = _self.view.metadata.find(".rule-code");
		_self.view.metadata.ruleName = _self.view.metadata.find(".rule-name");
		_self.view.metadata.foundResult = _self.view.metadata.find(".found-result");
		//REPORT TABLE
		_self.view.reportTable = _self.view.find(".report-table");
		_self.view.reportTable.table = _self.view.reportTable.find("table");
		_self.bindDrillDowns();
		//renderElements
		if (data.header) {
			_self.renderReportHeader(data.header);
		}
		if (data.metadata) {
			_self.renderReportMetadata(data.metadata);
		}
		if (data.reportTable) {
			_self.renderReportTable(data.reportTable);
		}

	},
	bindDrillDowns: function() {
		var _self = this;
		_self.view.metadata.ruleCode.bind("dblclick", function(e) {
			if (_self.view.metadata.ruleCode.text() !== "") {
				var url = '/timp/bre/#/editorAN4?id=' + _self.view.metadata.ruleCode.text().split("ID")[1];
				window.open(url, '_blank');
			}
		});
		_self.view.header.idLayoutReference.bind("dblclick",function(e){
		    if(_self.view.header.idLayoutReference.text()!== ""){
		        var url = '/timp/dfg/#/editor?id=' + _self.view.header.idLayoutReference.text().split("ID")[1];
				window.open(url, '_blank');
		    } 
		});
		_self.view.header.idLayoutComparison.bind("dblclick",function(e){
		    if(_self.view.header.idLayoutComparison.text()!== ""){
		        var url = '/timp/dfg/#/editor?id=' + _self.view.header.idLayoutComparison.text().split("ID")[1];
				window.open(url, '_blank');
		    } 
		});
		_self.view.header.idSettingReference.bind("dblclick",function(e){
		    if(_self.view.header.idSettingReference.text()!== ""){
		        var url = '/timp/dfg/#/executor?id=' + _self.view.header.idSettingReference.text().split("ID")[1];
				window.open(url, '_blank');
		    } 
		});
		_self.view.header.idSettingComparison.bind("dblclick",function(e){
		    if(_self.view.header.idSettingComparison.text()!== ""){
		        var url = '/timp/dfg/#/executor?id=' + _self.view.header.idSettingComparison.text().split("ID")[1];
				window.open(url, '_blank');
		    } 
		});

	},
	buildContextMenu: function() {
		var _self = this;
		var container = document.createElement("nav");
		container.className = "context-menu";
		var optionList = document.createElement("ul");
		optionList.className = "context-menu__items";
		container.appendChild(optionList);
		_self.contextMenu = $(container);
		var appendMenuItem = function(menu, itemName, actions, fieldId, columnId) {
			var listItem = document.createElement("li");
			listItem.className = "context-menu__item";
			listItem.setAttribute("field-id", fieldId);
			listItem.setAttribute("column-id", columnId);
			var itemLink = document.createElement("a");
			itemLink.className = "context-menu__link";
			var i = document.createElement("i");
			itemLink.appendChild(i);
			itemLink.textContent = itemName;
			for (var action = 0; action < actions.length; action++) {
				$(listItem).bind(actions[action].action, actions[action].function);
			}

			listItem.appendChild(itemLink);
			menu.find(".context-menu__items").append(listItem);
		};
		var removeMenuItem = function(menu, child) {
			menu.find(".context-menu__items")[0].removeChild(child);
		};

		_self.view.append(_self.contextMenu);
		var showColumns = function() {
			var hiddenColumns = $(".an3Report-column.header:hidden");
			if (hiddenColumns.length) {
				if (_self.contextMenu.find(".context-menu__items")[0].childElementCount !== 1) {
					removeMenuItem(_self.contextMenu, _self.contextMenu.find(".context-menu__items")[0].children[1]);
					_self.view.find(".submenu").remove();
				}
				container = document.createElement("nav");
				container.className = "context-menu submenu";
				optionList = document.createElement("ul");
				optionList.className = "context-menu__items";
				container.appendChild(optionList);
				_self.contextSubMenu = $(container);

				for (var h = 0; h < hiddenColumns.length; h++) {

					appendMenuItem(_self.contextSubMenu, hiddenColumns[h].textContent, [{
						function: function(e) {
							var rows = $(".an3Report-column").parent();
							var columnPosition = this.getAttribute("column-id");
							var columnFieldId = this.getAttribute("field-id");

							for (var r = 0; r < rows.length; r++) {
								$(rows[r].children[columnPosition]).show();
							}
							_self.getData().parentController.removeHiddenColumn(_self.view.metadata.ruleCode.text(), columnFieldId);
							_self.contextSubMenu.removeClass("context-menu--active");
							this.remove();
							if (!$(".an3Report-column.header:hidden").length) {
								removeMenuItem(_self.contextMenu, _self.contextMenu.find(".context-menu__items")[0].children[1]);
								_self.view.find(".submenu").remove();
							}
						},
						action: "click"
					}], hiddenColumns[h].getAttribute("field-id"), hiddenColumns[h].getAttribute("column-id"));
				}
				_self.view.append(_self.contextSubMenu);
				_self.contextSubMenu.bind("mouseleave", function(e) {
					_self.contextSubMenu.removeClass("context-menu--active");
				});
				appendMenuItem(_self.contextMenu, i18n("SHOW HIDDEN COLUMNS"), [{
					function: function(e) {

						_self.bindMenu(_self.contextSubMenu, e, true, this);
					},
					action: "mouseover"
				}, {
					function: function(e) {
						if (!e.toElement.parentElement.parentElement.parentElement.classList.contains("submenu")) {
							_self.contextSubMenu.removeClass("context-menu--active");
						}
						// _self.contextSubMenu.removeClass("context-menu--active")
					},
					action: "mouseleave"
				}]);
			}
		};
		appendMenuItem(_self.contextMenu, i18n("HIDE COLUMN"), [{
			function: function(e) {
				e.stopPropagation();
				_self.contextMenu.removeClass("context-menu--active");
				var rows = $(".an3Report-column").parent();
				var hiddenColumns = [];
				for (var i = 0; i < _self.selectedColumns.length; i++) {
					var columnPosition = _self.selectedColumns[i].getAttribute("column-id");
					var columnFieldId = _self.selectedColumns[i].getAttribute("field-id");
					hiddenColumns.push(columnFieldId);
					for (var r = 0; r < rows.length; r++) {
						$(rows[r].children[columnPosition]).hide();
					}
				}
				_self.getData().parentController.addHiddenColumns(_self.view.metadata.ruleCode.text(), hiddenColumns);
				showColumns();
			},
			action: "click"
		}]);
		showColumns();
	},
	/**
     @params {object} header
     @params {String} header.digitalFileTypeReference
     @params {String} header.digitalFileTypeComparison
     @params {String} header.auditoryDate
     @params {String} header.auditoryHour
     @params {String} header.fileNameReference
     @params {String} header.fileNameComparison
     @params {String} header.idLayoutReference
     @params {String} header.idLayoutComparison
     @params {String} header.idSettingReference
     @params {String} header.idSettingComparison
     @params {String} header.originReference
     @params {String} header.originComparison
     @params {String} header.company
     @params {String} header.branch
    **/
	renderReportHeader: function(header) {
		var _self = this;
		for (var h in header) {
			_self.view.header[h].text(header[h]);
		}
	},
	/**
    @params {object} metadata
    @params {String} metadata.ruleCode
    @params {String} metadata.block
    @params {String} metadata.record
    @params {String} metadata.ruleName
    @params {String} metadata.foundResults
    **/
	renderReportMetadata: function(metadata) {
		var _self = this;
		for (var m in metadata) {
			_self.view.metadata[m].text(metadata[m]);
		}
	},
	/**
        @params {object} reportTable
        @params {object} reportTable.columns
        @params {array[string]} reportTable.columnPositions
        example of reportTable.columns
                {
                   columnId: {
                        columnName: String,
                        width: Number (default -> auto),
                        columnClass: String | optional,
                   }
                }
        @params {object} reportTable.values

     **/
	renderReportTable: function(reportTable) {
		var _self = this;
		var columnHeader = document.createElement("tr");
		var column;
		_self.selectedColumns = [];
		
		var bindColumnMenu = function(e) {

            _self.bindMenu(_self.contextMenu,e,false,this);
			_self.selectedColumns.push(e.target);
		};
		var addToSelectedColumns = function(e) {
			if (e.ctrlKey) {
				_self.selectedColumns.push(e.target);
				$(e.target).css("background-color", "#aaa9a9");
			} else {
				for (var i = 0; i < _self.selectedColumns.length; i++) {
					$(_self.selectedColumns[i]).css("background-color", "#f3f2f2");
				}
				_self.selectedColumns = [];
			}
		};
		document.addEventListener("click", function(e) {
			if (e.target.className !== "context-menu--active" && e.target.className !== "an3Report-column header" && !e.ctrlKey) {
				_self.contextMenu.removeClass("context-menu--active");
				for (var i = 0; i < _self.selectedColumns.length; i++) {
					$(_self.selectedColumns[i]).css("background-color", "#f3f2f2");
				}
				_self.selectedColumns = [];
			}
		});
		_self.view.reportTable.table.empty();
		for (var c = 0; c < reportTable.columnPositions.length; c++) {
			column = document.createElement("td");
			column.setAttribute("column-id", c);
			if (reportTable.columns[reportTable.columnPositions[c]].columnClass) {
				column.classList = "an3Report-column " + reportTable.columns[reportTable.columnPositions[c]].columnClass;
			} else {
				column.className = "an3Report-column";
			}
			if (reportTable.columns[reportTable.columnPositions[c]].width) {
				column.setAttribute("width", reportTable.columns[reportTable.columnPositions[c]].width + "px");
			} else {
				column.setAttribute("width", "auto");
			}
			if (reportTable.columns[reportTable.columnPositions[c]].hide) {
				$(column).hide();
			}
			column.textContent = reportTable.columns[reportTable.columnPositions[c]].name;
			$(column).contextmenu(bindColumnMenu);
			$(column).bind("click", addToSelectedColumns);
			columnHeader.appendChild(column);
		}

		_self.view.reportTable.table.append(columnHeader);
		_self.renderReportTableValues(reportTable.values, reportTable.columnPositions);
	},
	bindMenu: function(menu,e,isSubMenu,currentElement) {
	    var getPosition = function(e) {
			var posx = 0;
			var posy = 0;

			if (!e) var e = window.event;

			if (e.pageX || e.pageY) {
				posx = e.pageX; 
				posy = e.pageY;
			} else if (e.clientX || e.clientY) {
				posx = e.clientX + document.body.scrollLeft +
					document.documentElement.scrollLeft;
				posy = e.clientY + document.body.scrollTop +
					document.documentElement.scrollTop;
			}

			return {
				x: posx,
				y: posy
			};
		};
	    e.preventDefault();
		if(!isSubMenu){
    	
    		var clickCoords;
    		var clickCoordsX;
    		var clickCoordsY;
    		clickCoords = getPosition(e);
    		clickCoordsX = clickCoords.x;
    		clickCoordsY = clickCoords.y;
    
    		var menuWidth = menu[0].offsetWidth + 4;
    		var menuHeight = menu[0].offsetHeight + 4;
    
    		var windowWidth = window.innerWidth;
    		var windowHeight = window.innerHeight;
    
    		if ((windowWidth - clickCoordsX) < menuWidth) {
    			menu.css("left", windowWidth - menuWidth + "px");
    		} else {
    			menu.css("left", clickCoordsX + "px");
    
    		}
    
    		if ((windowHeight - clickCoordsY) < menuHeight) {
    			menu.css("bottom", windowHeight - menuHeight + "px");
    
    		} else {
    			menu.css("bottom", clickCoordsY + "px");
    
    		}
	
		}else{
			var nav = e.target.parentElement.parentElement.parentElement;
			menu.css("left",$(nav).position().left+$(nav).width()- 30+"px");
			menu.css("top",$(nav).position().top+$(nav).height() - 30 +"px");
		}
			menu.addClass("context-menu--active");
	},
	renderReportTableValues: function(values, columnPositions) {
		var _self = this;
		var row, column;
		for (var v in values) {
			row = document.createElement("tr");
			row.setAttribute("line-id",v);
			$(row).bind("dblclick", function(e) {
        			if (_self.an4 && _self.an4.idDigitalFileReference && _self.an4.idDigitalFileReference !== null) {
        				var url = '/timp/dfg/#/executor?executed=true&id=' + _self.an4.idDigitalFileReference + "&line_id="+this.getAttribute("line-id").split(".")[0];
        				window.open(url, '_blank');
        			}
        			if (_self.an4 && _self.an4.idDigitalFileComparison && _self.an4.idDigitalFileComparison !== null) {
        				var url2 = '/timp/dfg/#/executor?executed=true&id=' + _self.an4.idDigitalFileComparison + "&line_id="+this.getAttribute("line-id").split(".")[1];
        				window.open(url2, '_blank');
        			}
        	});
			for (var c = 0; c < columnPositions.length; c++) {
				column = document.createElement("td");
				if (Array.isArray(values[v][columnPositions[c]])) {
					column.textContent = values[v][columnPositions[c]].join(", ");
				} else {
					column.textContent = values[v][columnPositions[c]];
				}

				if (columnPositions[c] === "messageColumn") {
						column.className = "an3Report-column message-column";
					} else {
						column.className = "an3Report-column";
					}
				row.appendChild(column);
			}
			_self.view.reportTable.table.append(row);
		}
		if(_self.contextMenu){
		    _self.contextMenu.remove();
		}
		_self.contextMenu = undefined;
		_self.buildContextMenu();
	}
});