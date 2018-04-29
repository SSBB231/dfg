sap.ui.controller('app.controllers.an4.editor', {
	onInit: function(){
		this.services = {};
		this._views = {
			leftContent: {
				view: 'app.views.an4.layoutContent',
				wrapper: '.left-wrapper',
				viewData: {
					services: this.services
				}
			},
			centerContent: {
				view: 'app.views.an4.centerContent',
				wrapper: '.center-wrapper',
				viewData: {
					services: this.services
				}
			},
			rightContent: {
				view: 'app.views.an4.layoutContent',
				wrapper: '.right-wrapper',
				viewData: {
					services: this.services
				}
			}
		}
	},
	onAfterRendering: function(html){}
});