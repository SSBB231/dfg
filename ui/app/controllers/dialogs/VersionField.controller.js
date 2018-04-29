sap.ui.controller("app.controllers.dialogs.VersionField", {
    onInit: function() {},

    onAfterRendering: function(html) {
        var _self = this;
        _self.view = $(html);
        _self.services = _self.getData().services;
        _self.layoutObject = _self.coreServices.layoutObject;
        _self.currentLevel = {};
        _self.initTempVersion();
        _self.initInputs();
    },

    initInputs: function() {
        var _self = this;
        _self.coreServices.inputLabel = $('#dfg-VersionField #VersionField').bindBaseInput({});
        if(!_self._data.initLevel.isNew){
            _self.coreServices.inputLabel.setText(_self._data.initLevel.column.version.label);
        }
    },

    initTempVersion: function() {
        var _self = this;
        _self.VersionObject = {};
        _self.VersionObject.blocks = {}
      
        for (var i in _self.layoutObject.blocks) {
            _self.VersionObject.blocks[i] = {}
            _self.VersionObject.blocks[i].records = {};
            for (var j in _self.layoutObject.blocks[i].records) {
                //console.log(_self.paramObject.blocks[i].records);
                _self.VersionObject.blocks[i].records[j] = {};
                _self.VersionObject.blocks[i].records[j].columns = {};
                for (var k in _self.layoutObject.blocks[i].records[j].columns) {
                    if (_self.layoutObject.blocks[i].records[j].columns[k].fieldId == null && _self.layoutObject.blocks[i].records[j].columns[k].version) {
                        _self.VersionObject.blocks[i].records[j].columns[k] = {
                            version: {}
                        };
                      
                        _self.VersionObject.blocks[i].records[j].columns[k].version.id = _self.layoutObject.blocks[i].records[j].columns[k].version.id;
                        _self.VersionObject.blocks[i].records[j].columns[k].version.label = _self.layoutObject.blocks[i].records[j].columns[k].version.label;
                        
                    }
                }
            }
        }
        if(!_self.VersionObject.blocks[_self._data.initLevel.blockId].records[_self._data.initLevel.recordId].columns[_self._data.initLevel.columnId]){
            _self.VersionObject.blocks[_self._data.initLevel.blockId].records[_self._data.initLevel.recordId].columns[_self._data.initLevel.columnId] = _self._data.initLevel.column;
        }
    },


    updateVersionObject: function() {
        var _self = this;

        var versionColum = _self.VersionObject.blocks[_self.getData().initLevel.blockId].records[_self.getData().initLevel.recordId].columns[_self.getData().initLevel.columnId] || _self._data.initLevel.column;
        versionColum.version.id = _self.getData().initLevel.columnId;
        versionColum.version.label = _self.coreServices.inputLabel.getText();
    },
    validate: function(){
       var _self = this;
       return _self.coreServices.inputLabel.getText().length;
    },
    getColumnData: function(){
        var _self = this;
        var versionColumn = _self.VersionObject.blocks[_self.getData().initLevel.blockId].records[_self.getData().initLevel.recordId].columns[_self.getData().initLevel.columnId] || _self._data.initLevel.column;
        this.updateVersionObject();
        return versionColumn;
    },
    getVersionData: function() {
        var _self = this;
        return _self.VersionObject;
    },
});
