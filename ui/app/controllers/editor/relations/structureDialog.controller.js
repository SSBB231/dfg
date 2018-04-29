sap.ui.controller('app.controllers.editor.relations.structureDialog', {
    onInit: function() {

    },
    onDataRefactor: function(data) {
        var _self = this;
        return $.extend(data, this.data);
    },
    onAfterRendering: function(html) {
        var _self = this;
        _self.view = $(html);
        _self.view.blocoSelect = _self.view.find('.block-select');
        _self.view.recordSelect = _self.view.find('.record-select');
        _self.bindElements();
    },
    bindElements: function() {
        var _self = this;
        var data = _self.getData();
        var blocks = _self.getData().blocks;
        var structure = _self.getData().structure;

        if (data.father) {
            _self.view.blocoSelect.ctrl = _self.view.blocoSelect.bindBaseSelect({
                tooltip: i18n("SELECT BLOCK"),
                options: blocks,
                disableSort: true,
                required: true,
                onChange: _self.onChangeBlock.bind(this)

            });
            _self.view.recordSelect.ctrl = _self.view.recordSelect.bindBaseSelect({
                tooltip: i18n("SELECT RECORD"),
                options: [],
                isDisabled: true
            });
        } else {
            _self.view.blocoSelect.ctrl = _self.view.blocoSelect.bindBaseMultipleSelect3({
                tooltip: i18n("SELECT BLOCK"),
                options: blocks,
                disableSort: true,
                required: true,
                onChange: _self.onChangeBlock.bind(this)

            });
            _self.view.recordSelect.ctrl = _self.view.recordSelect.bindBaseMultipleSelect3({
                tooltip: i18n("SELECT RECORD"),
                options: [],
                isDisabled: true
            });
        }

        if (structure)
            if (structure.block) {
                _self.view.blocoSelect.ctrl.setKey(structure.block);
            }
    },
    onChangeBlock: function(oldval, newval) {
        var _self = this;
        var data = _self.getData();
        var structure = _self.getData().structure;
        _self.view.recordSelect.empty();
        if (data.father) {
            _self.view.recordSelect.ctrl = _self.view.recordSelect.bindBaseSelect({
                tooltip: i18n("SELECT RECORD"),
                options: newval.records,
                disableSort: true,
                onChange: function(val) {

                }
            });
        } else {
        	var options = [];
        	for(var i = 0; i < oldval.length; i++){
        		options = options.concat(oldval[i].records);
        	}
            _self.view.recordSelect.ctrl = _self.view.recordSelect.bindBaseMultipleSelect3({
                tooltip: i18n("SELECT RECORD"),
                options: options,
                disableSort: true,
                onChange: function(val) {

                }
            });
        }

        if (structure)
            if (structure.record) {
                _self.view.recordSelect.ctrl.setKey(structure.record);
            }
    },
    getSelectedStructure: function() {
        var _self = this;
        var data = _self.getData();
        return {
            block: data.father ? _self.view.blocoSelect.ctrl.getKey() : _self.view.blocoSelect.ctrl.getKeys(),
            record: data.father ? _self.view.recordSelect.ctrl.getKey() : _self.view.recordSelect.ctrl.getKeys()
        }
    },
    getNameStructure: function() {
        var _self = this;
        return {
            block: _self.view.blocoSelect.ctrl.getValue(),
            record: _self.view.recordSelect.ctrl.getValue()
        }
    }
})