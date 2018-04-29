sap.ui.controller('app.controllers.dialogs.RDBlock', {
	onInit: function(){},
	onDataRefactor: function(data){
		var self = this;
		self.blocks = data.relationBlocks;
		self.relation = data.blockIds;
		self.allRelations = data.allRelations;
		$.extend(data, {
			addRecords: {
				class: 'defineClass',
				hasTransition: true,
				iconFont: 'Sign-and-Symbols',
				icon: 'plussign'
			}
		});
		self.areSameBlock = self.blocks.parent.name == self.blocks.child.name;
	},
	onAfterRendering: function(html){
		var self = this;
		self.view = $(html);

		self.view.parentRecordSelector = self.view.find('.parentRecordSelect-wrapper');
		self.view.parentRecordSelector.find('h4').text(i18n('BLOCK')+': '+self.blocks.parent.name);
		
		self.view.childRecordSelector = self.view.find('.childRecordSelect-wrapper');
		self.view.childRecordSelector.find('h4').text(i18n('BLOCK')+': '+self.blocks.child.name);

		self.view.recordList = self.view.find('.recordList');		
		self.view.addButton = self.view.find('button.defineClass');
		self.view.hider = self.view.find('.hide-selector').eq(1);
		self.view.hider.find('span').text(i18n('HIDE SELECTORS'));
		self.view.remover = self.view.find('.hide-selector.removeItem');
		self.view.remover.find('span').text(i18n('DELETE BLOCK'));

		self.bindElements();
		self.bindEvents();

		self.renderRecords();

		//Focus this New Block
		$('.dialog-content.big').scrollTop(self.view.position().top);
	},
	bindElements: function(){
		var self = this;

		var parentRecords = [];
		for(var i in Object.keys(self.blocks.parent.records) ){
			if (self.blocks.parent.records[i]) {
				parentRecords.push({ key: i, name: self.blocks.parent.records[i].name });
			}
		}
		var parentRecord;
		self.parentRecordSelector = self.view.parentRecordSelector.bindBaseSelect({
			options: parentRecords,
            disableSort: true,
			onChange: function(oldVal, newVal){
				parentRecord = newVal;
				self.coreServices.hasChanged = true;
			}
		});

		var childRecords = [];
		for(var i in Object.keys(self.blocks.child.records) ){
			if (self.blocks.child.records[i]) {
				childRecords.push({ key: i, name: self.blocks.child.records[i].name });
			}
		}
		var childRecord;
		self.childRecordSelector = self.view.childRecordSelector.bindBaseSelect({
			options: childRecords,
            disableSort: true,
			onChange: function(oldVal, newVal){
				childRecord = newVal;
				self.coreServices.hasChanged = true;
			}
		});

		function findRelation(parentBlock, parentRecord, childBlock, childRecord){
			for (var i = self.allRelations.length - 1; i >= 0; i--) {
				var rel = self.allRelations[i];
				if ( (rel.parent.idBlock == parentBlock && rel.parent.idRecord == parentRecord) 
					&& (rel.child.idBlock == childBlock && rel.child.idRecord == childRecord) ) {
					return true;
				};
			};
			return false;
		}

		self.view.addButton.click(function(){
			if (parentRecord && childRecord) {
				if ( (!self.areSameBlock || parentRecord.name != childRecord.name) 
					&& !findRelation(self.relation.parent, parentRecord.key, self.relation.child, childRecord.key) ){
					var newRelation = {
						parent: {
							idBlock: self.relation.parent,
							idRecord: parentRecord.key
						},
						child: {
							idBlock: self.relation.child,
							idRecord: childRecord.key
						}
					};
					self.view.recordList.bindRelationRecord({
						relation: newRelation,
						relationRecords: {
							parent: self.blocks.parent.records[parentRecord.key],
							child: self.blocks.child.records[childRecord.key]
						},
						allRelations: self.allRelations
					});
					self.allRelations.push( newRelation );
					parentRecord = childRecord = null;
					self.parentRecordSelector.setValue();
					self.childRecordSelector.setValue();
				}
			};
		});
	},
	bindEvents: function(){
		var self = this;
		self.view.hider.click(function hideSelector(){
			self.view.parentRecordSelector.find('.base-select').toggleClass('hide');
			self.view.childRecordSelector.find('.base-select').toggleClass('hide');
			self.view.addButton.toggleClass('hide');
		});
		self.view.remover.click(function(){
			for (var i = self.allRelations.length - 1; i >= 0; i--) {
				if (self.allRelations[i].parent.idBlock == self.relation.parent && 
					self.allRelations[i].child.idBlock == self.relation.child) {
					self.allRelations.splice(i,1);
				};
			};
			self.view.remove();
			self.coreServices.hasChanged = true;
		});
	},
	renderRecords: function(){
		var self = this;

		for (var i = self.allRelations.length - 1; i >= 0; i--) {
			if (self.allRelations[i].parent.idBlock == self.relation.parent 
				&& self.allRelations[i].child.idBlock == self.relation.child) {
				self.view.recordList.bindRelationRecord({
					relation: self.allRelations[i],
					relationRecords: {
						parent: self.blocks.parent.records[self.allRelations[i].parent.idRecord],
						child: self.blocks.child.records[self.allRelations[i].child.idRecord]
					},
					allRelations: self.allRelations
				});
			};	
		};
	}

});