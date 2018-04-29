sap.ui.controller("app.controllers.dialogs.VersionData", {
	onInit: function() {
	},

	onDataRefactor: function(data) {
		if( data.allVersions == undefined)
			data.allVersions = false;
		if( data.dataVersions == undefined )
			data.dataVersions = this.coreServices.layoutObject.internalVersion;
        return $.extend(data, this.data);
    },

	onAfterRendering: function(html) {
		var _self = this;
		this._view = $(html);
		_self.id = window.parameters.id;
		_self.idVersion = window.parameters.idVersion;
		_self.versionData = _self.coreServices.layoutObject;
		if( this.getData().allVersions == false ){
			_self.initInputs();
			_self.initData();
		}else{
			this.renderEvents();
		}
		if(_self.services.exhibition){
			_self.processExhibition();
		}
	},
	initInputs: function(){
		var _self = this;

		_self.inputValidFrom = $('#inputValidFrom').bindBaseDatePicker({
			tooltip: i18n('DATE PICKER INITIAL TOOLTIP')
		});
		_self.inputValidTo = $('#inputValidTo').bindBaseDatePicker({
			tooltip: i18n('DATE PICKER FINAL TOOLTIP')
		});
		_self.inputLayoutVersion = $('#inputLayoutVersion').bindBaseInput({
			tooltip: i18n('VERSION INPUT TOOLTIP')
		});
		_self.inputTimpVersion = $('#inputTimpVersion').bindBaseInput({
			tooltip: i18n('TIMP VERSION INPUT TOOLTIP'),
			isDisabled: true
		});
		_self.inputDescription = $('#inputDescription');
		_self.inputDescription.baseTooltip({
			class: 'dark',
			position: 'top',
			text: i18n('VERSION DESCRIPTION TOOLTIP')
		});
		_self.inputDefault = $('#inputDefault').bindBaseCheckbox({
			id: "idChkDefault", 
			text: i18n('DEFAULT VERSION'),
			onChange: function(oldVal, newVal){
			}
		});
	},
	updateVersionData: function(){
		var _self = this;

		if(_self.inputValidFrom.getDate() != null){
			_self.coreServices.layoutObject.internalVersion[_self.idVersion].validityStart = parseDate(_self.inputValidFrom.getDate(), "Date").toISOString();
		}else{
			$.baseToast({
				text: i18n("DFG102012"),
				isError: true
			});
			return false;	
		}
		_self.coreServices.layoutObject.legalVersion = _self.inputLayoutVersion.getText();
		_self.coreServices.layoutObject.internalVersion[_self.idVersion].version = _self.inputTimpVersion.getText();
		_self.coreServices.layoutObject.internalVersion[_self.idVersion].description = _self.inputDescription.val();
		if(_self.inputValidTo.getDate() != null){
			_self.coreServices.layoutObject.internalVersion[_self.idVersion].validityFinish = parseDate(_self.inputValidTo.getDate(), "Date").toISOString();
		}
		return true;
	},
	initData: function(){
		var _self = this;
		var _foundId;
		if( !_self.idVersion ){
			_foundId = _self.versionData.internalVersion.length - 1;
		}else{
			_self.versionData.internalVersion.forEach(function(_dataVersion, index){
				if( _dataVersion.id == _self.idVersion ){
					_foundId = index;
					return;
				}
			});
		}
		_self.idVersion = _foundId;
		if(_self.versionData.legalVersion){
			_self.inputLayoutVersion.setText(_self.versionData.legalVersion);
		}
		if(_self.versionData.internalVersion[_foundId].version){
			_self.inputTimpVersion.setText(_self.versionData.internalVersion[_foundId].version);
		}
		if(_self.versionData.internalVersion[_foundId].description){
			_self.inputDescription.val(_self.versionData.internalVersion[_foundId].description);
		}
		if(_self.versionData.internalVersion[_foundId].validityStart){
			var date = new Date(_self.versionData.internalVersion[_foundId].validityStart);
            var newDate = {};
            newDate.date = date.getDate();
            newDate.month = date.getMonth() + 1;
            newDate.year = date.getFullYear();
			_self.inputValidFrom.setDate(newDate);
			_self.inputValidFrom.disable();
			
		}
		if(_self.versionData.internalVersion[_foundId].validityFinish){
			var date = new Date(_self.versionData.internalVersion[_foundId].validityFinish);
            var newDate = {};
            newDate.date = date.getDate();
            newDate.month = date.getMonth() + 1;
            newDate.year = date.getFullYear();
			_self.inputValidTo.setDate(newDate);
		}
	},
	renderEvents: function(){
		var _self = this;
		var _target = this._view.find('.inputs');
		for( var i = 0; i < _target.length; i++ ){
			$(_target[i]).baseTooltip({
				class: 'dark',
				position: 'top',
				text: i18n('CLICK PRESS') + i18n('TO SHOW VERSION')
			});
			$(_target[i]).on('click', function(e){
				window.location = "#/editor?id="+_self.id+"&idVersion="+$(e.target).attr('data-id');
			});
		}
	},
	processExhibition: function(){
		var mainCrystal = $('<div>').addClass('dfg-crystal').addClass('dfg-big');
		$('#dfg-version-dialog').append(mainCrystal);
	}
})
