sap.ui.controller("app.controllers.editor.spedMapping", {
    onInit: function() {

    },
    onAfterRendering: function(html) {
        var _self = this;
        _self.view = $(html);
        _self.view.block = _self.view.find(".block-select");
        _self.view.record = _self.view.find(".record-select");
        _self.view.fieldWrapper = _self.view.find(".field-wrapper");
        _self.loader = _self.view.baseLoader({
            modal: true
        });
        _self.bindElements();
    },
    bindElements: function() {
        var _self = this;
        var layoutObject = _self.coreServices.layoutObject;
        var blocks = $.globalFunctions.getBlockOptions(_self.coreServices.layoutObject,true,true,true); 
        _self.view.block.ctrl = _self.view.block.bindBaseSelect({
            options: blocks,
            disableSort: true,
            tooltip: i18n("SELECT BLOCK"),
            placeholder: i18n("SELECT BLOCK"),
            onChange: _self.onChangeBlock.bind(_self)
        });
        _self.view.record.ctrl = _self.view.record.bindBaseSelect({
            options: [],
            isLoading: true,

        });

    },
    onChangeBlock: function(oldVal, newVal) {
        var _self = this;
        var layoutObject = _self.coreServices.layoutObject;
        var block = layoutObject.blocks[newVal.key];
        var records = newVal.records;
        _self.view.record.empty();
        _self.view.record.ctrl = _self.view.record.bindBaseSelect({
            options: records,
            disableSort: true,
            tooltip: i18n("SELECT RECORD"),
            placeholder: i18n("SELECT RECORD"),
            onChange: _self.onChangeRecord.bind(_self)
        });
    },
    onChangeRecord: function(oldVal, newVal) {
        var _self = this;
        _self.view.fieldWrapper.empty();
        var layoutObject = _self.coreServices.layoutObject;
        var block = layoutObject.blocks[_self.view.block.ctrl.getKey()];
        var record = block.records[newVal.key];
        var columns = newVal.columns; 
        _self.mapping = [];
        _self.rows = [];
        _self.loader.open();
        Data.endpoints.dfg.sped.getTDFTableColumns.post({ recordName: record.name }).success(function(data) {
            var row;
            var columnLayoutSelect;
            var columnSpedInput;
            _self.rowCtrls = {};
            for (var i = 0; i < data.length; i++) {
                row = document.createElement("div");
                row.setAttribute("class", "row-mapping");
                columnLayoutSelect = document.createElement("div");
                columnLayoutSelect.setAttribute("class", "column-layout-select");
                columnSpedInput = document.createElement("div");
                columnSpedInput.setAttribute("class", "column-sped-select");
                _self.rowCtrls[i] = {};
                _self.rowCtrls[i].columnLayoutSelect = $(columnLayoutSelect).bindBaseAutocomplete({
                    options: columns,
                    disableSort: true
                });
                _self.rowCtrls[i].columnSpedInput = $(columnSpedInput).bindBaseSelect({
                    options: [data[i]],
                    disableSort: true,
                    isDisabled: true
                }).setKey(data[i].key);
                row.appendChild(columnLayoutSelect);
                row.appendChild(columnSpedInput);
                _self.view.fieldWrapper.append(row);
                if (record.spedMapping !== undefined) {
                	if(record.spedMapping[data[i].key]){
                		_self.rowCtrls[i].columnLayoutSelect.setKey(record.spedMapping[data[i].key]);
                	}
                }
            }
              _self.loader.close();

        }).error(function(err) {
            $.baseToast({
                type: 'w',
                text: i18n("RECORD TABLE DOESN'T EXISTS")
            });
            _self.loader.close();
        });
    },
    getColumnMapping: function() {
        var _self = this;
        var mapping = {};
        if(_self.rowCtrls.length == 0){
        	return ;
        }
        for (var i in _self.rowCtrls) {
            mapping[_self.rowCtrls[i].columnSpedInput.getKey()] = _self.rowCtrls[i].columnLayoutSelect.getKey();
        }
        return {
            mapping: mapping,
            block: _self.view.block.ctrl.getKey(),
            record: _self.view.record.ctrl.getKey()
        };
    }
});
