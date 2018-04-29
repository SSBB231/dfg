//AN3 REPORT CONTROLLER ------- KBARA 09/11/2016 --------------
sap.ui.controller("app.controllers.executoran3.an3Report", {
	onInit: function() {},
	onDataRefactor: function(data) {
		return $.extend(data, this.data);
	},
	onAfterRendering: function(html) {

		var _self = this;
		var data = _self.getData();
		_self.an3 = data.an3;
		_self.view = $(html);
		//HEADER
		_self.view.header = _self.view.find(".header");
		_self.view.header.digitalFileType = _self.view.header.find(".digital-file-type");
		_self.view.header.auditoryDate = _self.view.header.find(".auditory-date");
		_self.view.header.auditoryHour = _self.view.header.find(".auditory-hour");
		_self.view.header.idLayout = _self.view.header.find(".idlayout");
		_self.view.header.idSetting = _self.view.header.find(".idsetting");
		_self.view.header.origin = _self.view.header.find(".origin");
		_self.view.header.company = _self.view.header.find(".company");
		_self.view.header.branch = _self.view.header.find(".branch");
		//METADATA
		_self.view.metadata = _self.view.find(".report-metadata");
		_self.view.metadata.ruleCode = _self.view.metadata.find(".rule-code");
		_self.view.metadata.block = _self.view.metadata.find(".block");
		_self.view.metadata.record = _self.view.metadata.find(".record");
		_self.view.metadata.ruleName = _self.view.metadata.find(".rule-name");
		_self.view.metadata.foundResult = _self.view.metadata.find(".found-result");
		//REPORT TABLE
		_self.view.reportTable = _self.view.find(".report-table");
		_self.view.reportTable.table = _self.view.reportTable.find("table");
		_self.bindDrillDowns();
		_self.hiddenColumns = [];
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
	buildContextMenu: function() {
		var _self = this;
		var container = document.createElement("nav");
		container.className = "context-menu";
		var optionList = document.createElement("ul");
		optionList.className = "context-menu__items";
		container.appendChild(optionList);
		_self.contextMenu = $(container);
		var appendMenuItem = function(menu, itemName, actions,fieldId,columnId) {
            var listItem = document.createElement("li");
            listItem.className = "context-menu__item";
            listItem.setAttribute("field-id", fieldId);
            listItem.setAttribute("column-id",columnId);
            var itemLink = document.createElement("a");
            itemLink.className = "context-menu__link";
            var i = document.createElement("i");
            itemLink.appendChild(i);
            itemLink.textContent = itemName;
            for(var action = 0; action < actions.length;action++){
                 $(listItem).bind(actions[action].action,actions[action].function);
            } 
           
            listItem.appendChild(itemLink);
            menu.find(".context-menu__items").append(listItem);
        };
        var removeMenuItem = function(menu, child) {
            menu.find(".context-menu__items")[0].removeChild(child);
        };

		_self.view.append(_self.contextMenu);
		var showColumns = function(){
		    var hiddenColumns = $(".an3Report-column.header:hidden");
		    if (hiddenColumns.length) {
				if (_self.contextMenu.find(".context-menu__items")[0].childElementCount !== 1) {
					removeMenuItem(_self.contextMenu,_self.contextMenu.find(".context-menu__items")[0].children[1]);
					_self.view.find(".submenu").remove();
				}
			    container = document.createElement("nav");
				container.className = "context-menu submenu";
				optionList = document.createElement("ul");
				optionList.className = "context-menu__items";
				container.appendChild(optionList);
				_self.contextSubMenu = $(container);

				for(var h = 0; h < hiddenColumns.length; h++){
		
				    appendMenuItem(_self.contextSubMenu,hiddenColumns[h].textContent,[{function: function(e){
				        var rows = $(".an3Report-column").parent();
				        var columnPosition = this.getAttribute("column-id");
        				var columnFieldId = this.getAttribute("field-id");
        			
        				for (var r = 0; r < rows.length; r++) {
        					$(rows[r].children[columnPosition]).show();
        				}
        				_self.getData().parentController.removeHiddenColumn(_self.view.metadata.ruleCode.text(), columnFieldId);
				        _self.contextSubMenu.removeClass("context-menu--active");
				        this.remove();
				        if(!$(".an3Report-column.header:hidden").length){
				            	removeMenuItem(_self.contextMenu,_self.contextMenu.find(".context-menu__items")[0].children[1]);
					            _self.view.find(".submenu").remove();
				        }
				    }, action:"click"}],hiddenColumns[h].getAttribute("field-id"),hiddenColumns[h].getAttribute("column-id"));
				}
				_self.view.append(_self.contextSubMenu);
				_self.contextSubMenu.bind("mouseleave", function(e){
				    _self.contextSubMenu.removeClass("context-menu--active");
				});
			   appendMenuItem(_self.contextMenu,i18n("SHOW HIDDEN COLUMNS"), [{function: function(e) {
			         
				     _self.bindMenu(_self.contextSubMenu,e,true,this);
				},action: "mouseover"},{function: function(e){
				    if(!e.toElement.parentElement.parentElement.parentElement.classList.contains("submenu")){
				        _self.contextSubMenu.removeClass("context-menu--active");
				    }
				   // _self.contextSubMenu.removeClass("context-menu--active")
				},action: "mouseleave"}]);
			}
		}
		appendMenuItem(_self.contextMenu,i18n("HIDE COLUMN"), [{function:function(e) {
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
		},action: "click"}]);
        showColumns();
	},
	bindDrillDowns: function() {
		var _self = this;
		_self.view.metadata.ruleCode.bind("dblclick", function(e) {
			if (_self.view.metadata.ruleCode.text() !== "") {
				var url = '/timp/bre/#/editor?id=' + _self.view.metadata.ruleCode.text().split("ID")[1];
				window.open(url, '_blank');
			}
		});
		_self.view.metadata.block.bind("dblclick", function(e) {
			if (_self.view.header.idLayout.text() !== "") {
				var url = '/timp/dfg/#/exhibition?id=' + _self.view.header.idLayout.text().split("ID")[1];
				window.open(url, '_blank');
			}
		});
		_self.view.metadata.record.bind("dblclick", function(e) {
			if (_self.view.header.idLayout.text() !== "") {
				var url = '/timp/dfg/#/exhibition?id=' + _self.view.header.idLayout.text().split("ID")[1];
				window.open(url, '_blank');
			}
		});
		
	},
	/**
     @params {object} header
     @params {String} header.digitalFileType
     @params {String} header.auditoryDate
     @params {String} header.auditoryHour
     @params {String} header.idLayout
     @params {String} header.idSetting
     @params {String} header.origin
     @params {String} header.company
     @params {String} header.branch
    **/
	renderReportHeader: function(header) {
		var _self = this;
		for (var h in header) {
			if (_self.view.header.hasOwnProperty(h)) {
				_self.view.header[h].text(header[h]);
			}

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
			if (_self.view.metadata.hasOwnProperty(m)) {
				_self.view.metadata[m].text(metadata[m]);
			}
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
			column.setAttribute("field-id", reportTable.columnPositions[c]);
			if (reportTable.columns[reportTable.columnPositions[c]].columnClass) {
				column.className = "an3Report-column " + reportTable.columns[reportTable.columnPositions[c]].columnClass;
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
		_self.renderReportTableValues(reportTable.values, reportTable.columnPositions, reportTable.columns);
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
	renderReportTableValues: function(values, columnPositions, columns) {
		var _self = this;
		var row, column;
		for (var v in values) {
			if (values.hasOwnProperty(v)) {
				row = document.createElement("tr");
				row.setAttribute("line-id",v);
				$(row).bind("dblclick", function(e) {
        			if (_self.an3 && _self.an3.idDigitalFile && _self.an3.idDigitalFile !== null) {
        				var url = '/timp/dfg/#/executor?executed=true&id=' + _self.an3.idDigitalFile + "&line_id="+this.getAttribute("line-id");
        				window.open(url, '_blank');
        			}
        		});
				for (var c = 0; c < columnPositions.length; c++) {
					column = document.createElement("td");
					if (Array.isArray(values[v][columnPositions[c]])) {
						column.innerText = values[v][columnPositions[c]].join(", ");
					} else {
					  
						column.innerText = values[v][columnPositions[c]];
					}
					if (columnPositions[c] === "messageColumn") {
						column.className = "an3Report-column message-column";
					} else {
						column.className = "an3Report-column";
					}
					if (columns[columnPositions[c]].hide) {
						$(column).hide();
					}
					row.appendChild(column);
				}
				_self.view.reportTable.table.append(row);
			}
		}
		if(_self.contextMenu){
		    _self.contextMenu.remove();
		}
		_self.contextMenu = undefined;
		_self.buildContextMenu();
	}
});