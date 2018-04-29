sap.ui.controller('app.controllers.an4.layoutRecord', {
	onInit: function(){},
	onDataRefactor: function(data){
		this.data = data.representingRecord;
	},
	onAfterRendering: function(html) {
		var self = this;
		self.view = $(html);
		self.view.recordDetails = self.view.find('.record-details');
		self.view.toggleIcon = self.view.recordDetails.find('span.icon.icon-toright');
		self.view.recordName = self.view.recordDetails.find('.recordName');
		self.view.recordFieldList = self.view.find('.recordField-list');
		self.view.recordName.text(self.data.name);

		self.bindElements();
		self.bindEvents();
	},
	bindElements: function(){
		var self = this;

		var fields = Object.keys(self.data.columns);
		for (var i = fields.length - 1; i >= 0; i--) {
			self.view.recordFieldList.bindLayoutField({
				representingField: fields[i]
			})
		};
	},
	bindEvents: function(){
		var self = this;
		self.view.recordDetails.click(function(){
			self.view.toggleIcon.toggleClass('icon-toright icon-todown');
			self.view.recordFieldList.slideToggle();
		});
	}
});