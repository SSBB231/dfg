sap.ui.controller("app.controllers.library.dialogs.SharedOptions", {
	data: {},
	onInit: function() {},
	onAfterRendering: function(html) {
		var _self = this;
		var datos = _self.getData();
		_self.datos = _self.getData();
		_self.parentV = datos.parentV;
		_self.renderSharedDialog();
		$('#setPrivate').find('label').text(i18n('SET PRIVATE'));
		$('#setPublic').find('label').text(i18n('SET PUBLIC'));
		$('#setShared').find('label').text(i18n('SET SHARED'));
		if( datos.object.shared === 'Private' ){
			$('#setPrivate').hide();
		}else if( datos.object.shared === 'Public' ){
			$('#setPublic').hide();
		}else if( datos.object.shared === 'Shared' ){
			$('#setShared').hide();
		}

		$('#btn1').unbind('click').bind('click', function(){
			if( _self.datos.object.shared === 'Private' ){
				_self.parentV.updateSharedIcon(_self.datos.object, 'Private', 'Public');
				_self.changeStatus("Public");
				// console.log( "popover: ", _self );
			}else if( datos.object.shared === 'Shared' ){
				_self.parentV.updateSharedIcon(_self.datos.object, 'Shared', 'Public');
				_self.changeStatus("Public");
			}
		});
		$('#btn2').unbind('click').bind('click', function(){
			if( datos.object.shared === 'Public' ){
				_self.parentV.updateSharedIcon(_self.datos.object, 'Public', 'Private');
				_self.changeStatus("Private");
			}else if( datos.object.shared === 'Shared' ){
				_self.parentV.updateSharedIcon(_self.datos.object, 'Shared', 'Private');
				_self.changeStatus("Private");
			}
		});
		$('#btn3').unbind('click').bind('click', function(){
			if( _self.datos.object.shared === 'Private' ){
				_self.dialogShared.open();
				$("#basePopover-wrapper").hide();
			}else if( datos.object.shared === 'Public' ){
				_self.dialogShared.open();
				$("#basePopover-wrapper").hide();
			}
		});
		
	},
	renderSharedDialog: function(){
		var _self = this;
		_self.dialogShared = $.baseDialog({
			title: i18n('SHARE LAYOUT'),
			modal: true,
			size: "big",
			outerClick: 'disabled',
			viewName: "app.views.library.dialogs.SelectUsers",
			viewData: {
				currentObject: _self.datos.object,
				pController: _self
			},
			buttons: [{
				name: i18n('CANCEL'),
				isCloseButton: true
				/*click: function(){
					_self.dialogShared.close();
				}*/
			},{
				name: i18n('SHARE LAYOUT'),
				click: function(){
					var dataOpc = _self.dialogShared.getInnerController().getOwnData();
					if( dataOpc === true ){
						// console.log( "Si llego!" );
						_self.dialogShared.close();
						_self.parentV.updateSharedIcon(_self.datos.object, _self.datos.object.shared, 'Shared');
					}
				}
			}]
		});
	},
	changeStatus: function(status){
		var _self = this;
		var object = {
			id_object: _self.datos.object.id_object,
			shared: status
		};
		Data.endpoints.core.objectShare.changeSharedStatus.post(object).success(function(data){
			$.baseToast({text: (status === 'Public') ? i18n['SUCCESS SET PUBLIC'] : (status === 'Private') ? i18n['SUCCESS SET PRIVATE'] : "", isSuccess: true});
		}).error(function(data){
			$.baseToast({text: i18n['ERROR SET PUBLIC'], isError: true});
		});
		$("#basePopover-wrapper").hide();
	},
	onInitTarget: function($target) {},
	render: function(template) {}
});