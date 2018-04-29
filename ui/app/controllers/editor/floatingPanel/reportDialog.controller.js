sap.ui.controller("app.controllers.editor.floatingPanel.reportDialog", {
	onInit: function() {
		
	},

	onDataRefactor: function(data) {
		return $.extend(data, this.data);
	},

	onAfterRendering: function(html) {
		var _self = this;
		this.view = html;
		this.view.table = this.view.find('#report-table');
		this.services = this.getData().services;
		this.data = this.getData();
		this.listValuesData = this.coreServices.getListValuesData();
		this.tableData = [];
		this.check = true;

		this.bindElements();
		this.addServices();
	},

	addServices: function(){
		var _self = this;
		this.coreServices.getResult = function() {
			return _self.tableData;
		};
		this.coreServices.getTableSelected = function(){
			var selected;
			$.each(_self.view.table.find('.tbody input:checked'), function(id, element){
				selected = Number($(element).attr('data-id'));
			});
			return selected;
		}
	},

	bindElements: function(){
		var _self = this;
		this.view.table.empty();
		this.loader = this.view.table.baseLoader({
			modal: true
		});
		this.loader.open();
		Data.endpoints.dfg.output.listValues.post(this.listValuesData).success(function(_data){
			_data.forEach(function(element){
				name = element.name ? element.name : element.metadata.name
				description = element.description ? element.description : element.metadata.description
				var _dat = element.values ? element.values : element.outputs;
				_dat.forEach(function(object){
					id = object.id
					value = object.value ? object.value : object.metadata.name
					_self.tableData.push({
						id: id,
						content: [
							name,
							description,
							value
						]
					})
				});
			});
			_self.view.table.ctrl = _self.view.table.bindBaseTable({
				hasActions: false,
				hasCheckboxes: true,
				headers: [{
					text: i18n('NAME'),
					sort: true,
					resizable: true,
					width: "100px",
					type: "text" //number,date,center
				}, {
					text: i18n('DESCRIPTION'),
					sort: true,
					resizable: true,
					width: "100px",
					type: "text" //number,date,center
				}, {
					text: i18n('OBJECT'),
					sort: true,
					resizable: true,
					width: "100px",
					type: "text" //number,date,center
				}],
				body: _self.tableData
			});
			_self.view.table.find('.tbody').find('input:checkbox').off('click').on('click', function() {
				if(_self.check === true){
					_self.check = false;
					_self.view.table.find('.tbody').find('input:checked').click();
					_self.check = true;
				}
			});
			_self.view.table.find('.thead .th.checkbox-header input').off('click');
			_self.loader.close();
		}).error(function(errorMsg){
			$.baseToast({
				isError: true,
				text: msgError
			});
			_self.loader.close();
		})
	}
});