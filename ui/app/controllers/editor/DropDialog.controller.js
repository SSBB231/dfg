sap.ui.controller('app.controllers.editor.DropDialog', {
    onInit: function() {

    },
    onDataRefactor: function(data) {
        return $.extend(data, this.data);
    },
    onAfterRendering: function(html) {
        var _self = this;
        _self.view = $(html);
        _self.blocks = _self.coreServices.block.children();

        _self.view.blocks = _self.view.find('#selectbloco');
        _self.view.records = _self.view.find('#selectrecord');
        _self.bindElements();
    },
    bindElements: function() {
        var _self = this;
        _self.view.blocks.ctrl = _self.view.blocks.bindBaseSelect({
            options: [],
            tooltip: i18n('SELECT BLOCK'),
            errorMsg: i18n('MANDATORY FIELD'),
            required: true
        });
        _self.view.records.ctrl = _self.view.records.bindBaseSelect({
            options: [],
            tooltip: i18n('SELECT RECORD'),
            errorMsg: i18n('MANDATORY FIELD'),
            required: true,
            isDisabled: true
        });
        var blocks = [];
        for (var i = 0; i < _self.blocks.length; i++) {
            var blockname = $($($(_self.blocks[i]).children()).find('.block-head .block-input .base-input-wrapper .base-input input')).val();
            if (blockname !== '') {
                blocks.push({
                    key: i,
                    name: blockname
                });
            }

        }

        _self.view.blocks.empty();
        _self.view.blocks.ctrl = _self.view.blocks.bindBaseSelect({
            options: blocks,
            tooltip: i18n('SELECT BLOCK'),
            errorMsg: i18n('MANDATORY FIELD'),
            required: true,
            onChange: function(oldval, newval) {
            	_self.idblock = newval;
                var records = $($(_self.blocks[newval.key]).find('.block-inner .block-body .register-list-wrapper')).children();
                var optionrecords = [];
                for (var i = 0; i < records.length; i++) {
                    var recordname = $($($(records[i]).children()).find('.register-head .register-input .base-input-wrapper .base-input input')).val();
                    if (recordname !== '') {
                        optionrecords.push({
                            key: i,
                            name: recordname
                        });
                    }
                }
                _self.view.records.empty();
                _self.view.records.ctrl = _self.view.records.bindBaseSelect({
                    options: optionrecords,
                    tooltip: i18n('SELECT RECORD'),
                    errorMsg: i18n('MANDATORY FIELD'),
                    required: true,
                    isDisabled: false,
                    onChange: function(oldval,newval){
                    	
                    	var a = $($(_self.blocks[_self.idblock.key]).find('.block-inner .block-body .register-list-wrapper')).children()[newval.key];
                    	_self.coreServices.target = $(a).find('.register-inner .register-body .register-fields');
                    }
                });


            }
        });
    }
});
