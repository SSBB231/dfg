sap.ui.controller("app.controllers.editor.DesignRules", {
	onInit: function() {
		this.lang = (sessionStorage.getItem('lang') && sessionStorage.getItem('lang') !== 'undefined' && sessionStorage.getItem('lang') !== 'null') ? sessionStorage.getItem('lang') : "ptrbr";
	},
	onDataRefactor: function(data) {
		return data;
	},
	createFields: function(){
		var _self = this;
		$(".rules-header-search").bindBaseInput({
			placeholder: i18n('RULES SEARCH'),
			isSearchBox: true,
			onChange: function(oldVal, newVal) {
				if (_self.listWrapper_ctrl) {
					_self.listWrapper_ctrl.filter(newVal);
				}
			}
		});
	},
	checkRulesAlreadySelected: function(){
		var _self = this;
		if (typeof(_self.getData()._selected_rules) != "undefined")
		{
			$.each(_self.getData()._selected_rules,function(index,val){
				$("#cb_"+val).attr('checked','checked');
			});
		}
	},
	renderTable: function(){
		var _self = this;
		_self.loader.open();

		Data.endpoints.bre.rule.list.post({
				lang: _self.lang,
				structure: _self.estrutura,
				type: "AN3"
		}).success(function(_data_structures) {
			_self.loader.close();
			var bodyData = [];
			var currLine = {};
			_self.coreServices.rules = _data_structures;
			console.log(_self.coreServices.rules);
			$.each(_data_structures, function(index, val){
				currLine = {};

				currLine.id = [];
				currLine.id.push({
					id: "cb" + val.id
				});

				currLine.content = [];
				currLine.id = val.id;
				currLine.content.push(val.id);
				currLine.content.push(val.name);
				currLine.content.push(val.description);
				currLine.content.push(val.creationUser);
				currLine.content.push(val.creationDate===null?"":parseDate(val.creationDate));

				bodyData.push(currLine);
			});
			$('#TableRules').html('');
			_self.listWrapper_ctrl = $('#TableRules').bindBaseTable({
				hasActions: false,
				hasCheckboxes: true,
				headers: [{
					text: 'ID',
					sort: true,
					type: 'text',
					width: 50
				},{
					text: i18n('RULE NAME'),
					sort: true,
					width: "100px",
					type: "text" 
				}, {
					text: i18n('RULE DESCRIPTION'),
					sort: true,
					width: "100px",
					type: "text" 
				}, {
					text: i18n('CREATED BY'),
					sort: true,
					width: "50px",
					type: "text" 
				}, {
					text: i18n('CREATED ON'),
					sort: true,
					width: "50px",
					type: "text" 
				}],	
				body: bodyData
			});
			_self.checkRulesAlreadySelected();
		});
	},
	onAfterRendering: function(html) {
		var _self = this;
		_self.loader = $("body").baseLoader({
		    modal: true
		});
		_self.createFields();
		_self.view = $(html);
		_self.services = _self.getData().services;
		_self.estrutura = _self.getData().estrutura
		_self.renderTable();
	}
});