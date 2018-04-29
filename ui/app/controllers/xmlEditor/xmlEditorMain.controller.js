sap.ui.controller("app.controllers.xmlEditor.xmlEditorMain", {
	onInit: function() {},

	onAfterRendering: function(html) {
		var _self = this;
		// this.coreServices.layoutObject = {};
		// this.coreServices.processMessages = function(response) {
		//     var toastMessage = {};
		//     if (response.hasOwnProperty("messageCodes") && response.messageCodes.length > 0) {
		//         toastMessage.text = i18n[response.messageCodes[response.messageCodes.length - 1].code];
		//         switch (response.messageCodes[response.messageCodes.length - 1].type) {
		//             case 'S':
		//                 toastMessage.isSuccess = true;
		//                 break;
		//             case 'W':
		//                 toastMessage.isWarning = true;
		//                 break;
		//             case 'E':
		//                 toastMessage.isError = true;
		//                 break;
		//             default:
		//                 toastMessage.isError = true;
		//         }
		//         $.baseToast(toastMessage);
		//     } else {
		//         $.baseToast({
		//             text: i18n['DFG02001'],
		//             isError: true
		//         });
		//     }
		// };
		// this.getLock({
		//     objectType: 'ATR::SchemasProperties',
		//     id: window.parameters.id,
		//     callback: function(_data) {
		//         if (_data.response === false) {
		//             window.location.hash = "/library";
		//         } else {
		//             _self.coreServices.lock = _data.controller;
		var view = new sap.ui.view({
			viewName: "app.views.xmlEditor.structuresReports",
			type: sap.ui.core.mvc.ViewType.HTML
		});
		// 		var view2 = new sap.ui.view({
		// 			viewName: "app.views.editor.floatingPanel",
		// 			type: sap.ui.core.mvc.ViewType.HTML
		// 		});
		var view3 = new sap.ui.view({
			viewName: "app.views.xmlEditor.xmlEditor",
			type: sap.ui.core.mvc.ViewType.HTML
		});
		$('#left-content').empty();
		$('#floating-wrapper').empty();
		$('#right-content').empty();
		var l = $('#left-content').bindView(view, {});
		// 		var f = $('#floating-wrapper').bindView(view2, {});
		var r = $('#right-content').bindView(view3, {});
		_self.view = {
			leftContent: {
				getController: function() {
					return l.ctrl;
				}
			},
			// 			floating: {
			// 				getController: function() {
			// 					return f.ctrl;
			// 				}
			// 			},
			rightContent: {
				getController: function() {
					return r.ctrl;
				}
			}
		};
		//         }
		//     }
		// });
	},
});