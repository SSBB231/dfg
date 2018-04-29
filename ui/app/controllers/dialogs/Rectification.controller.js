sap.ui.controller("app.controllers.dialogs.Rectification", {
	onInit: function() {
	},
	onAfterRendering: function(html) {
		var _self = this;
		_self.view = $(html);
		_self.view.originalFile =  _self.view.find("#originalFile");
		_self.view.rectifier =  _self.view.find("#rectifier");		
		_self.bindElements();
		_self.addServices();
	},
	bindElements: function(){
		var _self = this;
		_self.bindSelect("originalFile", [], i18n('FILE TOOLTIP'), i18n('LOADING DATA'), true);
		_self.bindSelect("rectifier", [], i18n('FILE TOOLTIP'), i18n('LOADING DATA'), true);
		Data.endpoints.dfg.digitalFile.listFiles.post({
			fields: ['id', 'name']
		}).success(function(response) {
			var index = 0;
			var options = [];
            $.each(response, function(index, element) {
                options.push({
                    key: element.id,
                    name: element.name
                });
            });
            _self.listFiles = options;
            _self.view.originalFile.empty();
			_self.view.rectifier.empty();		
			_self.bindSelect("originalFile", _self.listFiles, i18n('FILE TOOLTIP'), i18n('SELECT FILE'), false);	
			_self.bindSelect("rectifier", _self.listFiles, i18n('FILE TOOLTIP'), i18n('SELECT FILE'), false);			
	    	if (_self.coreServices.allVersionData.originalFile){
	        	_self.view.originalFile.ctrl.setKey(_self.coreServices.allVersionData.originalFile);
	    	}
	    	if (_self.coreServices.allVersionData.rectifier){
	        	_self.view.rectifier.ctrl.setKey(_self.coreServices.allVersionData.rectifier);
	    	}
        }).error(function(response) {
        	
        });
	},
	bindSelect: function(element, options, tooltip, placeholder, isDisabled){
		var _self = this;
		_self.view[element].ctrl = _self.view[element].bindBaseSelect({
            options: options,
            disableSort: true,
            tooltip: tooltip,
            placeholder: placeholder,
            required: true,
            isDisabled: isDisabled,
            onChange: function(oldVal, newVal){
               	if(element === "originalFile"){
	            	var tempOptions =  _self.listFiles.slice(0);
	            	for (var index = 0; index < tempOptions.length; index++){
	            		if(tempOptions[index].key === newVal.key){
	            			tempOptions.splice(index,1);
	            			break;
	            		}
	            	}
	            	_self.view.rectifier.empty();
	            	_self.bindSelect("rectifier", tempOptions, i18n('FILE TOOLTIP'), i18n('SELECT FILE'), false);
            	}
            }
        });
	},
	addServices: function(){
		var _self = this;
		_self.coreServices.rectifyDigitalFile = function (){
			var idOriginalFile = _self.view.originalFile.ctrl.getKey();
			var idRectifier = _self.view.rectifier.ctrl.getKey();
			Data.endpoints.dfg.digitalFile.rectify.post({
				id: window.parameters.id,
				idOriginalFile: idOriginalFile,
				idRectifier: idRectifier 
			}).success(function(response) {
				$.baseToast({
                    type: "S",
                    text: i18n("RECTIFICATION SUCCESSFUL")
                });
                _self.coreServices.allVersionData.originalFile = idOriginalFile;
                _self.coreServices.allVersionData.rectifier = idRectifier;
			}).error(function(response) {
				$.baseToast({
                    type: "E",
                    text: i18n("RECITIFCATION FAILED")
                });
	    	});
		};
	}
});