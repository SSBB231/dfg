/*global _ i18n*/
sap.ui.controller('app.controllers.executor.displayTable', {
    onInit: function() {
        let _self = this;
        _self.blockRecordLines = $.dfgExecutor.blockRecordLines;
        _self.layoutJSON = $.dfgExecutor.layoutJSON;
        _self.blockRecordLines = $.dfgExecutor.blockRecordLines;
        _self.selectedBlock = 0;
        _self.selectedRecord = 0;
        _self.linesMap = {};
        _self.typesMap = {
            NVARCHAR: 'input',
            DECIMAL: 'input',
            TIMESTAMP: 'datepicker'
        };
    },
    onAfterRendering: function(html) {
        let _self = this;
        _self.view = $(html);
        _self.view.blockSelect = _self.view.find('#selector-block');
        _self.view.recordSelect = _self.view.find('#selector-record');
        _self.view.table = _self.view.find('#table-space');
        _self.bindElements();
    }, 
    bindElements: function(){
        let _self = this;
        let blocks = _.map(_self.layoutJSON.blocks, function(value, key) {
            return {
                key: key,
                name: value.name,
                metadata: value
            };
        });

        _self.renderBlockSelect(blocks);
    },
    renderBlockSelect: function(blocks) {
        let _self = this;
        _self.view.blockSelect.empty();
        _self.view.blockSelect.ctrl = _self.view.blockSelect.bindBaseSelect({
            options: blocks,
            onChange: function(oldVal, newVal) {
                _self.selectedBlock = newVal.key;
                _self.renderRecord(newVal);
            }
        });


        _self.selectedBlock = blocks[0].key;
        _self.view.blockSelect.ctrl.setKey(blocks[0].key);
    },
    renderRecord: function(block){
        let _self = this;
        let metadata = block.metadata;
        _self.view.recordSelect.empty();
        let records = _.map(metadata.records, function(value, key){
            return {
                key: key, 
                name: value.name, 
                metadata: value
            };
        });

        _self.view.recordSelect.ctrl =  _self.view.recordSelect .bindBaseSelect({
            options: records,
            onChange: function(oldVal, newVal) {
                _self.selectedRecord  = newVal.key;
                _self.renderLines(newVal);
            }
        });

        _self.selectedRecord  = records[0].key;
        _self.view.recordSelect.ctrl.setKey(records[0].key);
    },
    renderLines: function(){
        let _self = this;
        let lines  = [];
        let headers = [];
        let body = [];
        let insertHeaders = true;
        let record = _.isNil(_self.blockRecordLines) ? null : _self.blockRecordLines[_self.selectedBlock + ';' + _self.selectedRecord];
        if(!_.isNil(record)){
            _self.view.table.empty();
            _.forEach(record.lines, function(value, key){
                lines.push($.dfgExecutor.parseLineDataToObject(_self.selectedBlock, _self.selectedRecord, key));
            });

            _.forEach(lines, function(line){
                let row = {
                    content: []
                };
                
                _.forEach(line.fields, function(field){
                    if(insertHeaders){
                        headers.push({
                            text: field.label, 
                            type: 'TEXT',
                            width: '200px'
                        });
                    }

                    row.content.push(field.value);
                });

                insertHeaders = false;
                body.push(row);
            });

           
            _self.view.table.ctrl = _self.view.table.bindBaseTableReports({
                title: '',
                headers: headers,
                body: body,
                resizable: false
            }); 
        }
    }
});