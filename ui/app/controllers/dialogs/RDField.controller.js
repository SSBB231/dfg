sap.ui.controller('app.controllers.dialogs.RDField',{
	onInit: function(){},
	onDataRefactor: function(data){
		this.relationFields = data.representingRelation;
		this.relation = data.relation;
	},
	onAfterRendering: function(html){
		var self = this;
		self.view = $(html);
		self.view.removeButton = self.view.find('.removeButton');
		function toggleRemove () {
			$(this).find('.icon').toggleClass('icon-font-Display-and-Setting icon-resize').toggleClass('icon-font-Sign-and-Symbols icon-persign');
		}
		self.view.removeButton.hover(toggleRemove, toggleRemove);
		self.view.parentField = self.view.find('.parentField');
		self.view.childField = self.view.find('.childField');

		self.bindElements();
		self.bindEvents();
	},
	bindElements: function(){
		var self = this;

		function getPairPosition(parent, child) {
			var pairPosition = -1;
			for (var i = self.relation.parent.joinFields.length - 1; i >= 0; i--) {
				if ( (parent == self.relation.parent.joinFields[i]) && (child == self.relation.child.joinFields[i]) ) {
					pairPosition = i;
				};
			};
			return pairPosition;
		}

		self.parentSelect = self.view.parentField.bindBaseSelect({
			options: self.relationFields.parent.fields,
            disableSort: true,
			onChange: function(oldVal, newVal){
				if (oldVal.key != undefined && (oldVal.name != newVal.name) ) {
					if (getPairPosition(newVal.name, self.relationFields.child.name) == -1) {
						self.relationFields.parent = newVal;
						self.relation.parent.joinFields[getPairPosition(oldVal.name, self.relationFields.child.name)] = newVal.name; 
					}else{
						self.parentSelect.setValue();
					}
				};
			}
		});
		self.parentSelect.setValue(self.relationFields.parent.name);

		self.childSelect = self.view.childField.bindBaseSelect({
			options: self.relationFields.child.fields,
            disableSort: true,
			onChange: function(oldVal, newVal){
				if (oldVal.key != undefined && (oldVal.name != newVal.name) ) {
					if (getPairPosition(self.relationFields.parent.name, newVal.name) == -1) {
						self.relationFields.child = newVal;
						self.relation.parent.joinFields[getPairPosition(self.relationFields.parent.name, oldVal.name)] = newVal.name;
					}else{
						self.childSelect.setValue();
					}
				}
			}
		});
		self.childSelect.setValue(self.relationFields.child.name);
	},
	bindEvents: function(){
		var self = this;
		self.view.removeButton.click(function(){
			for (var i = self.relation.parent.joinFields.length - 1; i >= 0; i--) {
				if (self.relationFields.parent.name == self.relation.parent.joinFields[i] && self.relationFields.child.name == self.relation.child.joinFields[i]) {
					self.relation.parent.joinFields.splice(i, 1);
					self.relation.child.joinFields.splice(i, 1);
					self.view.remove();
				};
			};
		});	
	}
});