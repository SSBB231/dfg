sap.ui.controller("app.controllers.dialogs.Filler", {
	onInit: function() {
	},

	onAfterRendering: function(html) {
		var _self = this;
		_self.view = $(html);
		_self.services = _self.getData().services;
		_self.layoutObject = _self.coreServices.layoutObject;
		_self.currentLevel = {};
		_self.initFiller();
		_self.initInputs();
	},

	initInputs: function(){
		var _self = this;
		_self.coreServices.inputLabel = $('#dfg-Filler .label.inputs').bindBaseInput({
			validator: function(value){
				var regex = /^([A-Za-z0-9 ])+$/i;
				return regex.test(value);
			},
			required: true
		});
		_self.coreServices.inputName = $('#dfg-Filler .label.inputName').bindBaseInput({
			validator: function(value){
				var regex = /^([A-Za-z0-9 ])+$/i;
				return regex.test(value);
			},
			required: true
		});
		if(_self.layoutObject.blocks[_self._data.initLevel.blockId].records[_self._data.initLevel.recordId].columns[_self._data.initLevel.columnId]){
		    _self.coreServices.inputLabel.setText(_self.fillerObject.blocks[_self._data.initLevel.blockId].records[_self._data.initLevel.recordId].columns[_self._data.initLevel.columnId].filler.value);
	        _self.coreServices.inputName.setText(_self.fillerObject.blocks[_self._data.initLevel.blockId].records[_self._data.initLevel.recordId].columns[_self._data.initLevel.columnId].filler.name);
		}
	},

	initFiller: function(){
		var _self = this;
		_self.fillerObject = {};
		_self.fillerObject.blocks = {};
		
		for(var i in _self.layoutObject.blocks){
			_self.fillerObject.blocks[i] = {};
			_self.fillerObject.blocks[i].records = {};
			for(var j in _self.layoutObject.blocks[i].records){
				_self.fillerObject.blocks[i].records[j] = {};
				_self.fillerObject.blocks[i].records[j].columns = {};
				for(var k in _self.layoutObject.blocks[i].records[j].columns){
					if(_self.layoutObject.blocks[i].records[j].columns[k].filler){
						_self.fillerObject.blocks[i].records[j].columns[k] = {filler: {}};						
						_self.fillerObject.blocks[i].records[j].columns[k].filler.id = _self.layoutObject.blocks[i].records[j].columns[k].filler.id;
						_self.fillerObject.blocks[i].records[j].columns[k].filler.value = _self.layoutObject.blocks[i].records[j].columns[k].filler.value;
						_self.fillerObject.blocks[i].records[j].columns[k].filler.name = _self.layoutObject.blocks[i].records[j].columns[k].filler.name;
					}
				}
			}
		}
		if(_self._data.initLevel){
		    if(_self._data.initLevel.blockId && _self._data.initLevel.recordId && _self._data.initLevel.columnId){
		        if(!_self.fillerObject.blocks[_self._data.initLevel.blockId].records[_self._data.initLevel.recordId].columns[_self._data.initLevel.columnId]){
		            _self.fillerObject.blocks[_self._data.initLevel.blockId].records[_self._data.initLevel.recordId].columns[_self._data.initLevel.columnId] = {
		                "fieldId": null,
		                "filler": {
		                    "id": _self._data.initLevel.columnId,
		                    "value": "",
		                    "name": ""
		                }
		            };
		        }
		    }
		}
	},


	updateFillerObject: function(){
		var _self = this;
		var fillerColumn = _self.fillerObject.blocks[_self.getData().initLevel.blockId].records[_self.getData().initLevel.recordId].columns[_self.getData().initLevel.columnId];
		fillerColumn.filler.id = _self.getData().initLevel.columnId;
		fillerColumn.filler.value = _self.coreServices.inputLabel.getText();
		fillerColumn.filler.name = _self.coreServices.inputName.getText();
	},
    validate: function(){
        var _self = this;
		var value = _self.coreServices.inputLabel.getText();
		var name = _self.coreServices.inputName.getText();
		if((!value || !name)){
	        return false;
		}
		return true;
    },
    getColumnData: function(){
        var _self = this;
        _self.updateFillerObject();
        return _self.fillerObject.blocks[_self.getData().initLevel.blockId].records[_self.getData().initLevel.recordId].columns[_self.getData().initLevel.columnId];
    },
	getFillerData: function(validate){
		var _self = this;
		var value = _self.coreServices.inputLabel.getText();
		var name = _self.coreServices.inputName.getText();
		if((!value || !name) && validate){
			$.baseToast({
	            type: 'W',
	            text: i18n('FILL ALL FIELDS')
	        });
	        return false;
		}
		return _self.fillerObject;
	},
});