sap.ui.controller('app.controllers.dialogs.RecordsTotals',{

	onInit: function(){
	},
	onDataRefactor: function(data){
		var self = this;
		var totalStatus = this.coreServices.totals;
		$.extend(data, {
			blockTotal: {
				id: 'block',
				name: 'blockTotal',
				checked: totalStatus.blocks
			},
			recordTotal: {
				id: 'record',
				name: 'recordTotal',
				checked: totalStatus.records
			},
			allTotal: {
				id: 'all',
				name: 'allTotal',
				checked: totalStatus.all
			},
			blockStarter: {
				id: 'bStarter',
				name: 'blockStarter',
				checked: totalStatus.blockStarter
			}
		});
	},
	onAfterRendering: function(html){
		var self = this;
		self.view = $(html);
		self.view.blocks = self.view.find('.blockTotal input');
		self.view.records = self.view.find('.recordTotal input');
		self.view.all = self.view.find('.allTotal input');
		self.view.bStarter = self.view.find('.bStarter input');
		self.view.find('.blockTotal h4').text(i18n('SET BLOCKTOTAL'));
		self.view.find('.recordTotal h4').text(i18n('SET RECORDTOTAL'));
		self.view.find('.allTotal h4').text(i18n('SET ALLTOTAL'));
		self.view.find('.bStarter h4').text(i18n('SET BLOCKSTARTER'));
	},
	getTotalSwitches: function(){
		var self = this;
		return {
			blocks: self.view.blocks.is(':checked'),
			records: self.view.records.is(':checked'),
			all: self.view.all.is(':checked'),
			blockStarter: self.view.bStarter.is(':checked')
		};
	}

});