sap.ui.controller('app.controllers.dialogs.RecordRelations', {
	onInit: function(){},
	onDataRefactor: function(data){
		this.data = data.layoutObject.versionData;
		this.relations = data.layoutObject.versionData.relations?data.layoutObject.versionData.relations.slice(0):[];
		this.displayingBlocks = [];
		$.extend(data, {
			addBlocks: {
				class: 'defineClass',
				hasTransition: true,
				iconFont: 'Sign-and-Symbols',
				icon: 'plussign'
			}
		});
	},
	onAfterRendering: function(html){
		$('.dialog-content.big').css('overflow-x', 'hidden');
		//X Overflow of Dialog Fix!!
		var self = this;
		self.view = $(html);
		self.view.find('h3').eq(0).text(i18n('PARENT'));
		self.view.find('h3').eq(1).text(i18n('CHILD'));
		self.view.parentView = self.view.find('.parentRecord');
		self.view.parentBlockSelector = self.view.parentView.find('.blockSelector-wrapper');
		self.view.parentBlockList = self.view.parentView.find('.blockList');
		self.view.childView = self.view.find('.childRecord');
		self.view.childBlockSelector = self.view.childView.find('.blockSelector-wrapper');
		self.view.blockList = self.view.find('.blockList');
		self.view.addButton = self.view.find('button.defineClass');
		self.bindElements();

		self.renderBlocks();
	},

	bindElements: function(){
		var self = this;
		var blocks = [];
		for(var i in Object.keys(self.data.blocks)){
			if (self.data.blocks[i]) {
				blocks.push({key: i, name: self.data.blocks[i].name});
			}
		}

		var block = self.getData().block;

		var blockObject = {key: 1, name: block.name};


		var parentBlock = blockObject;
		self.parentBlockSelector = self.view.parentBlockSelector.bindBaseSelect({
			options: blocks,
            disableSort: true,
			onChange: function(oldVal, newVal){
				parentBlock = newVal;
			}
		});

		var childBlock = blockObject;
		self.childBlockSelector = self.view.childBlockSelector.bindBaseSelect({
			options: blocks,
            disableSort: true,
			onChange: function(oldVal, newVal){
				childBlock = newVal;
			}
		});
		

		function findBlock(blocksId){
			for (var i = self.displayingBlocks.length - 1; i >= 0; i--) {
				if (self.displayingBlocks[i] == blocksId) {
					return true;
				};
			};
			return false;
		}

		// 	console.log(parentBlock);
		// console.log(childBlock);
			if (parentBlock && childBlock) {
				if (!findBlock(parentBlock.key+'&'+childBlock.key)) {
					var blockIds = {
							parent: parentBlock.key,
							child: childBlock.key
					};
					self.view.blockList.bindRelationBlock({
						relationBlocks: {
							parent: block,
							child: block
						},
						blockIds: blockIds,
						allRelations: self.relations 
					});
					self.displayingBlocks.push( parentBlock.key+'&'+childBlock.key ); 
					self.parentBlockSelector.setValue();
					self.childBlockSelector.setValue();	
				};
			}
	},
	renderBlocks: function(){
		var self = this;
		for (var i = self.relations.length - 1; i >= 0; i--) {
			var rel = self.relations[i];
			if (self.displayingBlocks.indexOf(rel.parent.idBlock+'&'+rel.child.idBlock) == -1) {
				self.view.blockList.bindRelationBlock({
					relationBlocks: {
						parent: self.data.blocks[rel.parent.idBlock],
						child: self.data.blocks[rel.child.idBlock]
					},
					blockIds: {
						parent: rel.parent.idBlock, 
						child: rel.child.idBlock
					},
					allRelations: self.relations
				});
				self.displayingBlocks.push( rel.parent.idBlock+'&'+rel.child.idBlock );
			}; 
		};
	},
	getRelationChanges: function(){
		return this.relations;
	}
});