 sap.ui.controller("app.controllers.executorSPED.SCANC.landing", {
	onInit: function() {
		this.services = {
			//Initializing services to comunicate between controllers
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
				view: "app.views.executorSPED.SCANC.rightContent",
				viewData: {
					services: this.services
				},
				wrapper: "#right-content"
			}
		};
		$.dfgExecutor = sap.ui.controller("app.controllers.dfgExecutor.dfgExecutor");
		$.globalFunctions = sap.ui.controller("app.controllers.dfgExecutor.globalFunctions");
	}
});
