sap.ui.controller("app.controllers.xmlEditor.dialogs.VersionField", {
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
    },


    updateVersionObject: function() {
        var _self = this;

        var versionColum = _self.VersionObject.blocks[_self.getData().initLevel.blockId].records[_self.getData().initLevel.recordId].columns[_self.getData().initLevel.columnId];
        versionColum.version.id = _self.getData().initLevel.columnId;
        versionColum.version.label = _self.coreServices.inputLabel.getText();
 

    },

    getVersionData: function() {
        var _self = this;
        return _self.VersionObject;
    },
});
