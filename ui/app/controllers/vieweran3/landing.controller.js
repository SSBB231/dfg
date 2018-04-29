sap.ui.controller("app.controllers.vieweran3.landing", {
	onInit: function() {
		this.services = {
			layoutObject: {},
			processMessages: function(response){
				var toastMessage = {};
				if(response.hasOwnProperty("messageCodes") && response.messageCodes.length > 0){
					toastMessage.text = i18n[response.messageCodes[response.messageCodes.length-1].code];
					switch(response.messageCodes[response.messageCodes.length-1].type){
						case "S":
							toastMessage.isSuccess = true;
							break;
						case "W":
							toastMessage.isWarning = true;
							break;
						case "E":
							toastMessage.isError = true;
							break;
						default:
							toastMessage.isError = true;
							break;
					}
					$.baseToast(toastMessage);
				}else{
					$.baseToast({text: i18n.DFG02001, isError: true});
				}
			}
		};
		this._views = {
			rightContent: {
				view: "app.views.vieweran3.rightContent",
				viewData: {
					services: this.services
				},
				wrapper: "#right-content"
			}
		};
	}
});
