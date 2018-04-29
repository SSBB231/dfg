sap.ui.controller('app.controllers.an4.layoutBlock', {
	onInit: function(){},
	onDataRefactor: function(data){
		this.data = data.representingBlock;
	},
	onAfterRendering: function(html){
		var self = this;
		self.view = $(html);
		self.view.blockDetails = self.view.find('.blockDetails');
		self.view.toggleIcon = self.view.blockDetails.find('span.icon.icon-right');
		self.view.blockName = self.view.blockDetails.find('.blockName');
		self.view.blockRecordList = self.view.find('.blockRecord-list');
		self.view.blockName.text(self.data.name);

		self.bindElements();
		self.bindEvents();
	},
	bindElements: function(){
		var self = this;

		var records = Object.keys(self.data.records);
		for (var i = records.length - 1; i >= 0; i--) {
			self.view.blockRecordList.bindLayoutRecord({
				representingRecord: self.data.records[records[i]]
			})
		};
	},
	bindEvents: function(){
		var self = this;

		self.view.blockDetails.click(function(){
			self.view.toggleIcon.toggleClass('icon-right icon-down');
			self.view.blockRecordList.slideToggle();
		});
	}
})