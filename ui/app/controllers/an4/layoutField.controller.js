sap.ui.controller('app.controllers.an4.layoutField', {
	onInit: function(){},
	onDataRefactor: function(data){
		this.data = data.representingField;
	},
	onAfterRendering: function(html){
		var self = this;
		self.view = $(html);

		self.view.fieldName = self.view.find('.field-details .fieldName');
		self.view.fieldName.text(this.data);

		self.view.draggable({
			appendTo: 'body',
			revert: true,
			helper: 'clone',
			
		});
	}
});