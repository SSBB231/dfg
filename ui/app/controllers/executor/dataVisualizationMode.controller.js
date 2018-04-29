/*global _ i18n*/
sap.ui.controller('app.controllers.executor.dataVisualizationMode', {
    onInit: function() {
        this.blockRecordLines = $.dfgExecutor.blockRecordLines;
        this.selectedBlock = 0;
        this.selectedRecord = 0;
        this.selectedLine = 0;
        this.linesMap = {};
        this.typesMap = {
            NVARCHAR: 'input',
            DECIMAL: 'input',
            TIMESTAMP: 'datepicker'
        };
    },
    onAfterRendering: function(html) {
        let _self = this;
        let blocks = !_.isNil($.dfgExecutor.layoutJSON) ? $.dfgExecutor.layoutJSON.blocks : null;

        _self.view = $(html);
        _self.fieldsWrapper = _self.view.find('.fields-wrapper');
        if (!_.isNil(blocks)) {
            _self.view.blockPaginator = _self.generatePaginator('block', blocks, function(oldBlock, newBlock) {
                _self.selectedBlock = newBlock;
                _self.updateRecordPaginator(blocks);
                _self.refreshData();
            });

            _self.selectedBlock = _self.block[0];
            _self.updateRecordPaginator(blocks);
            _self.refreshData();
        }
    },
    bindFields: function(block, record, line) {
        let _self = this;
        let visualization = $.dfgExecutor.layoutJSON.visualization;
        let fieldsKeys = _.keys(_self.fields);
        let rows = [];

        for (let i = 0; i < fieldsKeys.length; i += 2) {
            let key = fieldsKeys[i];
            let row = {};

            let field = _self.fields[key];
            field.dataType = field.type;
            field.type = _self.typesMap[field.type];

            let text = field.label;


            if (visualization && visualization[_self.selectedBlock + '-' + _self.selectedRecord] && visualization[_self.selectedBlock + '-' + _self.selectedRecord].hide) {
                text = "";
            }

            row[key] = {
                label: text,
                type: field.type || "input",
                tooltip: field.label,
                placeholder: field.label,
                isDisabled: true
            };
            key = fieldsKeys[i + 1];
            if (!_.isNil(key)) {
                field = _self.fields[key];
                field.type = _self.typesMap[field.type] || "input";
                text = field.label;
                if (visualization && visualization[_self.selectedBlock + '-' + _self.selectedRecord] && visualization[_self.selectedBlock + '-' + _self.selectedRecord].hide) {
                    text = "";
                }
                row[key] = {
                    label: text,
                    type: field.type,
                    tooltip: field.label,
                    placeholder: field.label,
                    isDisabled: true
                };
            }
            rows.push(row);
        }

        _self.fieldsWrapper.empty();

        _self.fieldsWrapper.ctrl = _self.fieldsWrapper.bindBaseFormBuilder({
            sections: [{
                title: i18n('BLOCK') + ' ' + block + ' ' + i18n('RECORD') + ' ' + record + ' ' + i18n('LINE') + ' ' + (line + 1),
                rows: rows
            }]
        });

        if (!_.isNil(_self.fieldsWrapper.ctrl) && !_.isNil(_self.fieldsWrapper.ctrl.view)) {
            _.forEach(_self.fieldsWrapper.ctrl.view.fieldCtrls, function(ctrl, key) {
                key = _.split(key, '_')[0];
                if (_self.fields[key].type === 'datepicker') {
                    ctrl.setDate(_self.fields[key].value);
                } else {
                    ctrl.setText(_self.fields[key].value);
                }
            });
        }
    },
    generatePaginator: function(selector, objectsCollection, onPageChange) {
        let paginator = this.view.find('.paginators ' + '.' + selector + '-paginator');
        let pages = _.isArray(objectsCollection) ? objectsCollection : _.keys(objectsCollection);
        this[selector] = pages;


        paginator.empty();
        paginator.ctrl = paginator.bindPaginatorExecutor({
            totalPages: pages.length,
            actualPage: 1,
            keys: pages,
            values: _.map(objectsCollection, function(object, key) {
                return object.name || +(key) + 1;
            }),
            onPageChange: onPageChange
        });

        return paginator;
    },
    updateRecordPaginator: function(blocks) {
        let _self = this;
        let block = blocks[this.selectedBlock];
        let visualization = $.dfgExecutor.layoutJSON.visualization;
        if (!_.isNil(block)) {
            let result = {};
            let records = _.forEach(block.records, function(record, recordName) {
                let blockName = _self.selectedBlock;
                if (!visualization || visualization && visualization[blockName + '-' + recordName] && !visualization[blockName + '-' + recordName].relevant){
                    result[recordName] =  record;
                }
            });


            this.view.recordPaginator = this.generatePaginator('record', result, this.onRecordChange());
            this.selectedRecord = this.record[0];

            this.updateLinePaginator();
        }
    },
    onRecordChange: function() {
        let _self = this;
        return function(oldValue, newValue) {
            _self.selectedRecord = newValue;
            _self.updateLinePaginator();
        };
    },
    updateLinePaginator: function() {
        let record = _.isNil(this.blockRecordLines) ? null : this.blockRecordLines[this.selectedBlock + ';' + this.selectedRecord];
        if (!_.isNil(record)) {
            this.view.linePaginator = this.generatePaginator('line', record.lines, this.onLineChange());
            this.selectedLine = this.line[0];
            this.refreshData();
        }
    },
    onLineChange: function() {
        let _self = this;
        return function(oldValue, newValue) {
            _self.selectedLine = newValue;
            _self.refreshData();
        };
    },
    refreshData: function() {
        let data = $.dfgExecutor.parseLineDataToObject(this.selectedBlock, this.selectedRecord, this.selectedLine);
        if (!_.isNil(data)) {
            this.fields = data.fields;
            this.bindFields(data.block, data.record, data.line);
        }
    }
});