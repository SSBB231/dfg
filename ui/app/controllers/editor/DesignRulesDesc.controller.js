sap.ui.controller("app.controllers.editor.DesignRulesDesc", {
	onInit: function() {
	},
	onDataRefactor: function(data){

		return $.extend(data.data, this.data);
	},
	onAfterRendering: function( html ){
		var _self = this;
		_self.view = $(html);
		_self.view.find('textarea').each(function(_i, _v){
			$(_v).height(_v.scrollHeight + 10);
		});
		_self.view.find('.transcript-header').each(function(_i, _v){
			$(_v).click(function(e){
				var id = $(this).data('id');
				var content = _self.view.find('.rules-content.descScreen[data-id=' + id + ']');
				if(content.is(':visible')){
					content.hide();
				} else {
					content.show();
				}
			});
		});
	},


});