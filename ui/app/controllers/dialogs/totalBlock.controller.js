/*global i18n _*/
sap.ui.controller('app.controllers.dialogs.totalBlock', {
    onInit: function() {},
    onAfterRendering: function(html) {
        var _self = this;
        _self.view = $(html);
        _self.view.includeCB = _self.view.find(".include-cb");
        _self.view.record = _self.view.find('.block-select');
        _self.bindComponents();
    },
    bindComponents: function() {
        var _self = this;
        var _data = _self.getData();
        var blockOptions = [];
        if (_data.initLevel.blockId && _data.initLevel.recordId) {
            var blockNames = {};
            var blocks = $.blockBuilder.json.blocks;
            _.forEach(blocks, function(block, blockId) {
                if (!blockNames[block.name]) {
                    blockNames[block.name] = 1;
                }
                var blockName = block.name;
                if (blockNames[block.name] > 1) {
                    blockName += '(' + blockNames[block.name] + ')';
                }
                blockNames[block.name]++;
                blockOptions.push({
                    key: blockId,
                    name: blockName
                });
            });
        }
        _self.view.record.ctrl = _self.view.record.bindBaseInputKat({
            options: blockOptions,
            disableSort: true,
            placeholder: i18n('SELECT RECORD PLACEHOLDER'),
            tooltip: i18n('SELECT RECORD'),
            isMultiple: true
        });
        _self.view.includeCB.ctrl = _self.view.includeCB.bindBaseCheckbox({
            "text": i18n("DO NOT INCLUDE RECORD"),
            "tooltip": i18n("DO NOT INCLUDE RECORD TOOLTIP"),
            "id": 1
        });
        if (_data.initLevel.column) {
            _self.view.includeCB.ctrl.setChecked(_data.initLevel.column.notInclude);
        }
        if (_data.initLevel.columnId) {
            var column = $.blockBuilder.json.blocks[_data.initLevel.blockId].records[_data.initLevel.recordId].columns[_data.initLevel.columnId];
            if (column) {
                if (column.blockId || column.blockIds) {
                    if (column.blockIds && column.blockIds.length) {
                        _self.view.record.ctrl.setKey(column.blockIds);
                    } else {
                        _self.view.record.ctrl.setKey([_data.initLevel.blockId]);
                    }
                } else {
                    let keys = _.keys($.blockBuilder.json.blocks);
                    if (column.notInclude) {
                        keys = [_data.initLevel.blockId];
                        _self.view.record.ctrl.setKey(keys);
                    } else {
                        _self.view.record.ctrl.setKey(keys);
                    }
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
        let keys = _self.view.record.ctrl.getKeys();
        if (keys.length === 1 && keys[0] === _data.initLevel.blockId) {
            return {
                fieldId: null,
                isBlocksTotal: true,
                blockId: keys[0],
                notInclude: _self.view.includeCB.ctrl.getChecked()
            };
        }
        return {
            fieldId: null,
            isBlocksTotal: true,
            blockIds: keys,
            notInclude: _self.view.includeCB.ctrl.getChecked()
        };
    }
});