/*global i18n _*/
sap.ui.controller('app.controllers.dialogs.totalRecord', {
    onInit: function() {},
    onAfterRendering: function(html) {
        var _self = this;
        _self.view = $(html);
        _self.view.record = _self.view.find('.record-select');
        _self.bindElements();
    },
    bindElements: function() {
        var _self = this;
        var _data = _self.getData();
        var recordOptions = [];
        if (_data.initLevel.blockId && _data.initLevel.recordId) {
            var recordNames = {};
            // var block = $.blockBuilder.json.blocks[_data.initLevel.blockId];
            var blocks = $.blockBuilder.json.blocks;
            _.forEach(blocks, function(block, blockId) {
                block.positions.map(function(pos) {
                    if (!recordNames[block.records[pos].name]) {
                        recordNames[block.records[pos].name] = 1;
                    }
                    var recordName = block.records[pos].name;
                    if (recordNames[block.records[pos].name] > 1) {
                        recordName += '(' + recordNames[block.records[pos].name] + ')';
                    }
                    recordNames[block.records[pos].name]++;
                    recordOptions.push({
                        key: _data.initLevel.blockId === blockId ? pos : (blockId + '_' + pos),
                        name: recordName
                    });
                });
            });
        }
        _self.view.record.ctrl = _self.view.record.bindBaseInputKat({
            options: recordOptions,
            disableSort: true,
            placeholder: i18n('SELECT RECORD PLACEHOLDER'),
            tooltip: i18n('SELECT RECORD'),
            isMultiple: true
        });
        if (_data.initLevel.columnId) {
            var column = $.blockBuilder.json.blocks[_data.initLevel.blockId].records[_data.initLevel.recordId].columns[_data.initLevel.columnId];
            if (column) {
                if (column.recordIds && column.recordIds.length) {
                    _self.view.record.ctrl.setKey(column.recordIds);
                } else {
                    _self.view.record.ctrl.setKey([_data.initLevel.recordId]);
                }
            }
        }
    },
    validate: function() {
        var _self = this;
        return _self.view.record.ctrl.getKeys().length > 0;
    },
    getColumnData: function() {
        var _self = this;
        var _data = _self.getData();
        if (_self.view.record.ctrl.getKeys().length === 1 && _self.view.record.ctrl.getKeys()[0] === _data.initLevel.recordId) {
            return {
                fieldId: null,
                isRecordsTotals: true
            };
        }
        return {
            fieldId: null,
            isRecordsTotals: true,
            recordIds: _self.view.record.ctrl.getKeys()
        };
    }
});