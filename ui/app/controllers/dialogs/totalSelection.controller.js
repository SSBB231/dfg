sap.ui.controller("app.controllers.dialogs.totalSelection", {
    onInit: function() {

    },
    onAfterRendering: function(html) {
        var _self = this;
        var data = this.getData();
        _self.view = $(html);
        _self.view.blockSelect = _self.view.find(".block-select");
        _self.view.recordSelect = _self.view.find(".record-select");
        if (!data.recordTotal) {
            _self.view.recordSelect.parent().hide();
        }
        _self.bindComponents();
    },
    bindComponents: function() {
        var _self = this;
        var positions = _self.coreServices.layoutObject.positions;
        var data = _self.getData();
        var blockOptions = $.globalFunctions.getBlockOptions(_self.coreServices.layoutObject,true);
        _self.view.blockSelect.ctrl = _self.view.blockSelect.bindBaseSelect({
            placeholder: i18n("SELECT BLOCK PLACEHOLDER"),
            tooltip: i18n("SELECT BLOCK"),
            options: blockOptions,
            disableSort: true,
            onChange: _self.onChangeBlock.bind(_self),
            required: true
        });
        _self.view.recordSelect.ctrl = _self.view.recordSelect.bindBaseSelect({
            isLoading: true,
            placeholder: i18n("SELECT RECORD PLACEHOLDER"),
            tooltip: i18n("SELECT RECORD"),
            options: [],
            required: true
        });
        if (data.initLevel) {
        	if(data.isEdit){
        		var column = _self.coreServices.layoutObject.blocks[data.initLevel.blockId].records[data.initLevel.recordId].columns[data.initLevel.columnId];
        		if(column.totalData){
        			_self.view.blockSelect.ctrl.setKey(column.totalData.block);
        		}else{
        			_self.view.blockSelect.ctrl.setKey(data.initLevel.blockId);
        		}
        	}else{
        		_self.view.blockSelect.ctrl.setKey(data.initLevel.blockId);
        	}
            
        }
    },
    onChangeBlock: function(oldVal, newVal) {
        var _self = this;
        var data = _self.getData();
        _self.view.recordSelect.empty();
        var blockPositions = _self.coreServices.layoutObject.blocks[newVal.key].positions;
        var recordOptions = newVal.records;
        _self.view.recordSelect.ctrl = _self.view.recordSelect.bindBaseSelect({
            placeholder: i18n("SELECT RECORD PLACEHOLDER"),
            tooltip: i18n("SELECT RECORD"),
            options: recordOptions, 
            disableSort: true,
            required: true
        });
        if (data.initLevel) {
        	if(data.isEdit){
        		var column = _self.coreServices.layoutObject.blocks[newVal.key].records[data.initLevel.recordId].columns[data.initLevel.columnId];
        		if(column.totalData)
        			_self.view.recordSelect.ctrl.setKey(column.totalData.record);
        		else if(data.initLevel.blockId === newVal.key)
        			_self.view.recordSelect.ctrl.setKey(data.initLevel.recordId);
        	}else{
        		if(data.initLevel.blockId === newVal.key)
        			_self.view.recordSelect.ctrl.setKey(data.initLevel.recordId);
        	}
            
        }

    },
    validateTotalData: function() {
        var _self = this;
        var data = _self.getData();
        var isValid = true;
        isValid = _self.view.blockSelect.ctrl.validate();
        if (data.recordTotal) {
            isValid = _self.view.recordSelect.ctrl.validate();
        }
        return isValid;
        
    },
    getTotalData: function() {
        var _self = this;
        var data = _self.getData();
        var item = {};
        if (data.recordTotal) {
            item.record = _self.view.recordSelect.ctrl.getKey();
        }
        item.block = _self.view.blockSelect.ctrl.getKey();
        return item;
    }
});
