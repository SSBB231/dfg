sap.ui.controller('app.controllers.an4.layoutRule', {
	onInit: function(){},
	onDataRefactor: function(data){
		this.data = data;
		this.data.typeIcons = {
			NVARCHAR: 'icon-string',
			INTEGER: 'icon-number'
		};
	},
	onAfterRendering: function(html){
		var self = this;
		self.view = $(html);

		self.view.ruleDetails = self.view.find('.rule-details');
		self.view.ruleId = self.view.ruleDetails.find('.rule-id small');
		self.view.ruleId.text(self.data.id);
		self.view.ruleName = self.view.ruleDetails.find('.rule-name');
		self.view.ruleName.text(self.data.text);
		self.view.ruleDrop = self.view.find('.rule-drop');
		self.view.typeIcon = self.view.ruleDrop.find('.type-icon');
		self.view.typeIcon.addClass(self.data.typeIcons[self.data.type]);

		self.view.ruleDrop.droppable({
			accept: '.fieldWrapper',
			activeClass: 'draggable-acceptable',
			hoverClass: 'acceptable-hover'
		});
	}
});