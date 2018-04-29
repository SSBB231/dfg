sap.ui.controller('app.controllers.an4.layoutContent', {
	onInit: function(){
		this.left = true;
	},
	onAfterRendering: function(html){
		var self = this;
		self.view = $(html);
		self.view.toolbar = self.view.find('.toolbar');
		self.view.layoutPicker = self.view.find('.layoutPicker');
		self.view.layoutViewer = self.view.find('.layoutViewer');
		self.view.layoutId = self.view.find('.layoutId');
		self.view.layoutTitle = self.view.layoutViewer.find('.layoutTitle');
		self.view.layoutBlockList = self.view.layoutViewer.find('.layoutBlock-list');

		self.bindElements();
	},
	bindElements: function(){
		var self = this;
		self.view.toolbar.bindBaseLibraryToolbar({
			hideList: false,
			leftButtons: [{
				text: 'New Layout',
				icon: 'plussign',
				iconFont: 'Sign-and-Symbols',
				onPress: function(){
					if(self.left){
						self.renderLayout(354);
						self.left = false;
					}else{
						self.renderLayout(355);
					}
				}
			}],
			hideGrid: false
		});

	},
	fillPicker: function(){
		Data.endpoints.listLayout.post({}).success(function(response){
			for (var i = response.length - 1; i >= 50; i--) {
				var layout = response[i];
			}
		}).error(function(errorResponse){
			// console.log('Error while getting Layout List!', errorResponse);
		});
	},
	renderLayout: function(id){
		var self = this;
		Data.endpoints.crud.readLayout.post({id: id}).success(function(response){
			self.view.layoutTitle.text(response.layoutName);
			self.view.layoutId.text(id);
		});
		Data.endpoints.crud.readDefaultVersion.post({idLayout: id}).success(function(response){
			var blocks = Object.keys(response.blocks);
			// console.log(response);
			for (var i = blocks.length - 1; i >= 0; i--) {
				self.view.layoutBlockList.bindLayoutBlock({
					representingBlock: response.blocks[blocks[i]]
				});
			};
		});
	}
});