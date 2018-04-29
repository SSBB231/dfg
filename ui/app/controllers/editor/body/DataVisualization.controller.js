/* global  i18n,  _ */
sap.ui.controller('app.controllers.editor.body.DataVisualization', {
	onInit: function() {},
	onAfterRendering: function(html) {
		let _self = this;
		_self.view = $(html);
		_self.view.table = _self.view.find('.data-visualization-table');

		_self.coreServices.visualization = {};
		_self.coreServices.visualization.tableVisualizationMap = {};
		_self.coreServices.visualization.renderTable = function() {
			_self.renderTable($.blockBuilder);
		};

		_self.coreServices.visualization.getDataVisualizationMap = function() {
			return _self.coreServices.visualization.tableVisualizationMap;
		};

		_self.coreServices.visualization.deleteRecord = function(blockID, recordID) {
			_self.deleteRecord(blockID, recordID);
		};

		_self.coreServices.visualization.deleteBlock = function(blockID) {
			_self.deleteRecord(blockID);
		};
		
		_self.coreServices.visualization.setMapping = function(data){
		    _self.setMapping(data);
		};
	},
	renderTable: function(data) {
		let _self = this;
		_self.view.table.empty();
		let table = _self.renderTableWrapper(data);
		$('.data-visualization-table').append(table);
		$('#tbody-id span').css({
			position: 'relative'
		});
		$('#tbody-id input ').css({
			position: 'relative'
		});
	},
	setMapping: function(data){
	    let _self = this;
	    if(data){
	        _self.coreServices.visualization.tableVisualizationMap = _.cloneDeep(data);
	    }
	},
	renderTableWrapper: function(data) {
		let _self = this;
		let base_table_content = $('<div></div>');
		let base_table = $('<div></div>');
		let base_table_wrapper = $('<div></div>');
		base_table_content.addClass('base-table-content');
		base_table_wrapper.addClass('base-table-wrapper');
		base_table.addClass('base-table');
		let thead = _self.renderHeaders();
		let tbody;
		if (_.has(data.json, 'blocks') && !_.isEmpty(data.json.blocks)) {
			tbody = _self.renderBody(data.json.blocks);
		} else {
			tbody = _self.renderBody([]);
		}

		base_table.append(thead);
		base_table.append(tbody);
		base_table_wrapper.append(base_table);
		base_table_content.append(base_table_wrapper);
		return base_table_content;
	},
	deleteRecord: function(blockID, recordID) {
		let _self = this;
		if (_self.coreServices.visualization.tableVisualizationMap[blockID + '-' + recordID]) {
			delete _self.coreServices.visualization.tableVisualizationMap[blockID + '-' + recordID];
		}
	},
	deleteBlock: function(blockID) {
		let _self = this;
		let keys = _.keys(_self.coreServices.visualization.tableVisualizationMap);
		_.forEach(keys, function(key) {
			let block = key.split('-')[0];
			if (block === blockID) {
				if (_self.coreServices.visualization.tableVisualizationMap[key]) {
					delete _self.coreServices.visualization.tableVisualizationMap[key];
				}
			}
		});
	},
	renderHeaders: function() {
		let thead = $('<div></div>');
		let tr = $('<div></div>');
		let headers = [{
			text: i18n('BLOCK'),
			sort: true,
			width: '100px',
			type: 'text'
		}, {
			text: i18n('RECORD'),
			sort: true,
			width: '100px',
			type: 'text'
		}, {
			text: i18n('RELEVANT'),
			width: '100px',
			type: 'text'
		}, {
			text: i18n('HIDE FIELD LABEL'),
			width: '100px',
			type: 'text'
		}];

		thead.addClass('thead');
		thead.css({
			'border-top': '0px'
		});
		tr.addClass('tr');
		tr.css({
			'width': '100%'
		});

		_.forEach(headers, function(header) {

			let th = $('<div></div>');
			let span = $('<span></span>');
			let header_wrapper = $('<div></div>');
			th.addClass('th');
			th.css({
				'width': '20%',
				'min-width': '20%'
			});
			header_wrapper.addClass('header-wrapper');
			span.text(header.text);
			header_wrapper.append(span);
			th.append(header_wrapper);
			tr.append(th);
		});

		thead.append(tr);
		return thead;
	},
	renderBody: function(blocks) {
		let _self = this;
		let tbody = $('<div></div>');
		tbody.addClass('tbody');
		tbody.attr('id', 'tbody-id');
		if (!_.isEmpty(blocks)) {
			_.forEach(blocks, function(block, key) {
				_.forEach(block.records, function(record, recordKey) {
					let tr = $('<div></div>');
					tr.attr('id', key + '-' + record.name + '-tr');
					let cell_wrappers = [$('<div></div>'), $('<div></div>'), $('<div></div>'), $('<div></div>')];
					tr.addClass('tr');
					tr.css({
						'width': '100%'
					});

					cell_wrappers[0].text(block.name);
					cell_wrappers[1].text(record.name);

					if (!_self.coreServices.visualization.tableVisualizationMap[key + '-' + recordKey]) {
						_self.coreServices.visualization.tableVisualizationMap[key + '-' + recordKey] = {
							relevant: false,
							hide: false						
						};
					}

					let checkboxRelevant = cell_wrappers[2].bindBaseCheckbox({
						id: key + '-' + record.name + '-relevant-checkbox',
						value: _self.coreServices.visualization.tableVisualizationMap[key + '-' + recordKey] ? _self.coreServices.visualization.tableVisualizationMap[
							key + '-' + recordKey].relevant : '',
						onChange: function(old, newValue) {
							if (!_self.coreServices.visualization.tableVisualizationMap[key + '-' + recordKey]) {
								_self.coreServices.visualization.tableVisualizationMap[key + '-' + recordKey] = {
									relevant: false,
									hide: false
								};
							}
							_self.coreServices.visualization.tableVisualizationMap[key + '-' + recordKey].relevant = newValue;
						}
					});
					let checkboxShow = cell_wrappers[3].bindBaseCheckbox({
						id: key + '-' + record.name + '-show-checkbox',
						onChange: function(old, newValue) {
							if (!_self.coreServices.visualization.tableVisualizationMap[key + '-' + recordKey]) {
								_self.coreServices.visualization.tableVisualizationMap[key + '-' + recordKey] = {
									relevant: false,
									hide: false
								};

							}
							_self.coreServices.visualization.tableVisualizationMap[key + '-' + recordKey].hide = newValue;
						}
					});

					

					if (_self.coreServices.visualization.tableVisualizationMap[key + '-' + recordKey]) {
						checkboxRelevant.setChecked(_self.coreServices.visualization.tableVisualizationMap[key + '-' + recordKey].relevant);
						checkboxShow.setChecked(_self.coreServices.visualization.tableVisualizationMap[key + '-' + recordKey].hide);
					}
					
					if(_self.coreServices.exhibition){
					    checkboxRelevant.disable();
					    checkboxShow.disable();
					}else{
					    checkboxRelevant.enable();
					    checkboxShow.enable();
					}

					_.forEach(cell_wrappers, function(cell_wrapper) {
						let td = $('<div></div>');
						td.addClass('td center');
						td.css({
							'width': '100px',
							'min-width': '100px'
						});
						cell_wrapper.addClass('cell-wrapper');
						td.append(cell_wrapper);
						tr.append(td);
					});

					tbody.append(tr);
				});
			});

		}
		return tbody;
	}
});