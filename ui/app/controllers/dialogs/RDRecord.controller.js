sap.ui.controller('app.controllers.dialogs.RDRecord', {
	onInit: function(){},
	onDataRefactor: function(data){
		this.records = data.relationRecords;
		this.relation = data.relation;
		this.allRelations = data.allRelations;
		$.extend(data, {
			addFields: {
				class: 'defineClass',
				hasTransition: true,
				iconFont: 'Sign-and-Symbols',
				icon: 'plussign'
			}
		});
	},
	onAfterRendering: function(html){
		var self = this;
		self.view = $(html);

		self.view.header = self.view.find('.recordHeader');
		self.view.parentTitle = self.view.header.find('.recordTitle h4').eq(0);
		self.view.parentTitle.text(i18n('RECORD')+': \n'+self.records.parent.name);
		self.view.parentFieldSelector = self.view.header.find('.parentFieldSelect-wrapper');

		self.view.childTitle = self.view.header.find('.recordTitle h4').eq(1);
		self.view.childTitle.text(i18n('RECORD')+': \n'+self.records.child.name);
		self.view.childFieldSelector = self.view.header.find('.childFieldSelect-wrapper');
		
		self.view.addFieldButton = self.view.header.find('button');

		self.view.fieldList = self.view.find('.fieldList');
		self.view.addFieldRelationButton = self.view.header.find('.addField.hide-selector.hide');
		self.view.addFieldRelationButton.find('span').text(i18n('ADD FIELD RELATION'));
		self.view.remover = self.view.find('.hide-selector.removeItem');
		self.view.remover.find('span').text(i18n('DELETE RECORD'));
		self.view.hider = self.view.find('.hide-selector').eq(1);
		self.view.hider.find('span').text(i18n('HIDE SELECTORS'));

		if (!self.relation.parent.joinFields && !self.relation.child.joinFields) {
			self.relation.parent.joinFields = [];
			self.relation.child.joinFields = [];	
		};
		
		self.bindElements();
		self.bindEvents();

		self.renderFields();
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
		
		self.parentFields = [];
		for (var i = Object.keys(self.records.parent.columns).length - 2; i >= 0; i--) {
			self.parentFields.push({key: i, name:  Object.keys(self.records.parent.columns)[i]});
		};
		var parentField;
		self.parentFieldSelector = self.view.parentFieldSelector.bindBaseSelect({
			options: self.parentFields,
            disableSort: true,
			onChange: function(oldVal, newVal){
				parentField = newVal;
			}
		});

		self.childFields = [];
		for (var i = Object.keys(self.records.child.columns).length - 2; i >= 0; i--) {
			self.childFields.push({key: i, name:  Object.keys(self.records.child.columns)[i]});
		};
		var childField;
		self.childFieldSelector = self.view.childFieldSelector.bindBaseSelect({
			options: self.childFields,
            disableSort: true,
			onChange: function(oldVal, newVal){
				childField = newVal;
			}
		});

		self.view.addFieldButton.click(function(){
			if (parentField && childField) {
				if (getPairPosition(parentField.name, childField.name) == -1) {
					self.addFieldRelation(parentField, childField);
					parentField = null;
					childField = null;
				};
			};
		});

	},
	addFieldRelation: function(parentField, childField){
		var self = this;
		self.relation.parent.joinFields.push(parentField.name);
		self.relation.child.joinFields.push(childField.name);
		self.toggleAddField()();
		self.view.fieldList.bindRelationField({
			relation: self.relation,
			representingRelation: {
				parent: {name: parentField.name, fields: self.parentFields}, 
				child: {name: childField.name, fields: self.childFields}
			}
		});
		self.childFieldSelector.setValue();
		self.parentFieldSelector.setValue();
	},
	toggleAddField: function(){
		var self = this;
		return function(){
			self.view.parentFieldSelector.toggleClass('hide');
			self.view.childFieldSelector.toggleClass('hide');
			self.view.addFieldRelationButton.toggleClass('hide');
			self.view.addFieldButton.toggleClass('hide');
			self.view.hider.addClass('hide');
		}
	},
	bindEvents: function(){
		var self = this;
		self.view.addFieldRelationButton.click(self.toggleAddField());
		self.view.hider.toggleClass('hide');
		self.view.remover.click(function(){
			for (var i = self.allRelations.length - 1; i >= 0; i--) {
				var relPar = self.allRelations[i].parent;
				var relChi = self.allRelations[i].child;
				if ( (relPar.idBlock == self.relation.parent.idBlock && relPar.idRecord == self.relation.parent.idRecord) 
					&& (relChi.idBlock == self.relation.child.idBlock && relChi.idRecord == self.relation.child.idRecord) ) {
					self.allRelations.splice(i,1);
				};
			};
			self.view.remove();
		});
	},
	renderFields: function(){
		var self =this;
		for (var i = self.relation.parent.joinFields.length - 1; i >= 0; i--) {
			self.view.fieldList.bindRelationField({
				relation: self.relation,
				representingRelation: {
					parent: {name: self.relation.parent.joinFields[i], fields: self.parentFields},
					child: {name: self.relation.child.joinFields[i], fields: self.childFields}
				}
			});
		};
	}

});