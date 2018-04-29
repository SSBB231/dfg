sap.ui.controller("app.controllers.editor.leftContent", {
	onInit: function() {
	},

	onAfterRendering: function(html) {
		this._view = html;
		this.loader = $('.editor-wrapper');
		this.loader.ctrl =this.loader.baseLoader({
			modal: true
		});
		this.loader.ctrl.open();
	}
});