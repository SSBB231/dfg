/*global i18n _*/
sap.ui.controller("app.controllers.editor.body.DFGBlockUnit", {
    onInit: function() {},
    onAfterRendering: function(html) {
        var _self = this;
        this.view = $(html);
        $(this.view).data('id', _self.getData().parentBlockId);
        this.view.input = this.view.find('.block-head .block-input');
        this.view.addRegisterBtn = this.view.find('.block-footer .btn-add-register');
        this.view.registerList = this.view.find('.block-body .register-list-wrapper');
        this.view.expandBtn = this.view.find('.block-head .btn-expand');
        this.view.collapseBtn = this.view.find('.block-head .btn-collapse');
        this.view.deleteBtn = this.view.find('.block-head .delete-block');
        this.isPreview = this.coreServices.exhibition;
        _self.renderRecords();
        this.bindElements();
        this.bindEvents();
        this.alive = true;
    },
    _sortableRegisters: function() {
        var _self = this;
        if (this.isPreview) {
            return;
        }
        _self.view.registerList.sortable({
            handle: '.register-head',
            axis: 'y',
            helper: function(e, ui) {
                var _clone = $(ui).html();
                var holder = $('<div>').addClass('register-sortable-helper').addClass('register-wrapper').width($(ui).width());
                holder.append(_clone);
                this.holder = holder;
                return holder;
            },
            items: '.register-wrapper',
            containment: $('.builder-wrapper'),
            placeholder: 'register-placeholder'
            // start: function(event, ui) {
            //  $(ui.item).show();
            // },
            // change: function(event, ui) {
            // },
            // over: function(event, ui) {
            // },
            // update: function(event, ui) {
            // },
            // stop: function(event, ui) {
            // }
        });
    },
    bindElements: function() {
        var _self = this;
        this.view.input.ctrl = this.view.input.bindBaseInput({
            isDisabled: !_self.isPreview,
            tooltip: i18n('BLOCK INPUT TOOLTIP'),
            onChange: function(oldVal, newVal) {
                if (newVal !== _self.coreServices.layoutObject.blocks[_self.getData().parentBlockId].name) {
                    _self.coreServices.hasChanged = true;
                }
            }
        }).setText(_self.coreServices.layoutObject.blocks[_self.getData().parentBlockId].name);
        _self.view.addRegisterBtn.baseTooltip({
            class: 'dark',
            position: 'top',
            text: i18n('ADD RECORD TOOLTIP')
        });
        _self.view.deleteBtn.attr('tabindex', '0');
        _self.view.deleteBtn.baseTooltip({
            class: 'dark',
            position: 'top',
            text: i18n('DELETE BLOCK TOOLTIP')
        });
        _self.DropDialog = $.baseDialog({
            title: i18n('DROP FIELDS'),
            modal: true,
            size: "medium",
            outerClick: 'disabled',
            viewName: "app.views.editor.DropDialog",
            buttons: [{
                name: i18n('CANCEL'),
                isCloseButton: true,
                tooltip: i18n('CLICK PRESS CANCEL'),
                click: function() {
                    _self.DropDialog.close();
                }
            }, {
                name: i18n('DROP'),
                click: function() {
                    _self.DropDialog.close();
                    _self.coreServices.buildField(_self.coreServices.field, _self.coreServices.target);
                }
            }]
        });
        _self.coreServices.addCopyRecord = function(blockId, copy) {
            _self.addCopyRecord(blockId, copy);
        };
    },
    addCopyRecord: function(blockId, copy) {
        var _self = this;
        if (!Array.isArray(blockId)) {
            blockId = [blockId];
        }
        for (var b = 0; b < blockId.length; b++) {
            var block = _self.coreServices.blocks[_self.coreServices.layoutObject.positions.indexOf(blockId[b])];
            var newRecordId = block.getRecordId();
            _self.coreServices.layoutObject.blocks[blockId[[b]]].records[newRecordId] = copy;
            block.addRecord(blockId[b], newRecordId, true);
            block._sortableRegisters();
            if (_self.coreServices.totals.blockStarter && Object.keys(_self.coreServices.layoutObject.blocks[blockId[b]].records).length === 1) {
                block.addBlockStarter();
            }
            _self.coreServices.hasChanged = true;
            $('#block-list-wrapper > div > div > div.block-body > div > div:nth-child(' + parseInt(block.getRecordId(), 10) +
                ') > div > div.register-head > div.register-input > div > div > input[type="text"]').focus();
        }
        $('.delete-record').on('click', function() {
            var sizeBlocks = $('.block-wrapper').size();
            var sizeRegister = $('.register-wrapper').size();
            $('div.controladoresTop .totalblocks .num').html(sizeBlocks);
            $('div.controladoresTop .totalrecords .num').html(sizeRegister);
        });
    },
    bindEvents: function() {
        var _self = this;
        this.view.collapseBtn.click(function() {
            _self.view.addClass('collapsed');
        });
        this.view.expandBtn.click(function() {
            _self.view.removeClass('collapsed');
        });
        if (this.isPreview) {
            this.view.addRegisterBtn.off('click').addClass('disabled');
            this.view.deleteBtn.off('click').off('keydown').addClass('disabled');
            return;
        }
        this.view.addRegisterBtn.click(function() {
            var newRecordId = _self.getRecordId();
            //get initial structure for the Record
            var initialStructure = Object.keys(_self.coreServices.structure)[0];
            _self.coreServices.layoutObject.blocks[_self.getData().parentBlockId].records[newRecordId] = {
                name: "",
                columns: {},
                positions: [],
                idStructure: initialStructure,
                isDistinct: false
            };
            _self.addRecord(_self.getData().parentBlockId, newRecordId, true);
            _self._sortableRegisters();
            $('.delete-record').on('click', function() {
                var sizeBlocks = $('.block-wrapper').size();
                var sizeRegister = $('.register-wrapper').size();
                $('div.controladoresTop .totalblocks .num').html(sizeBlocks);
                $('div.controladoresTop .totalrecords .num').html(sizeRegister);
            });
            if (_self.coreServices.totals.blockStarter && Object.keys(_self.coreServices.layoutObject.blocks[_self.getData().parentBlockId].records).length === 1) {
                _self.addBlockStarter();
            }
            _self.coreServices.hasChanged = true;
            $('#block-list-wrapper > div > div > div.block-body > div > div:nth-child(' + Number(_self.getRecordId()) +
                ') > div > div.register-head > div.register-input > div > div > input[type="text"]').focus();
        });
        _self.view.deleteBtn.click(function() {
            var blockName = _self.coreServices.layoutObject.blocks[_self.getData().parentBlockId].name;
            _self.coreServices.lastChanges.push({
                message: {
                    enus: "A block was removed",
                    ptrbr: "Um bloco foi removido"
                },
                blockName: blockName,
                type: 4
            });
            _self.removeBlock();

            _self.coreServices.hasChanged = true;
        });
        _self.view.deleteBtn.keydown(function(ev) {
            if (ev.keyCode === 32 || ev.keyCode === 13) {
                this.click();
            }
        });
        _self.coreServices.block = $('#block-list-wrapper');
        $($('.field-wrapper').parent()).keypress(function(ev) {
            if (ev.keyCode === 32 || ev.keyCode === 13) {
                _self.coreServices.field = $($(this).children()).data();
                _self.DropDialog.open();
            }
        });
    },
    removeBlock: function() {
        var _self = this;
        _self.view.remove();
        delete _self.coreServices.layoutObject.blocks[_self.getData().parentBlockId];
        var sizeBlocks = $('.block-wrapper').size();
        var sizeRegister = $('.register-wrapper').size();
        $('div.controladoresTop .totalblocks .num').html(sizeBlocks);
        $('div.controladoresTop .totalrecords .num').html(sizeRegister);
        this.alive = false;
    },
    getRecordId: function() {
        var _self = this;
        var blocks = _self.coreServices.layoutObject.blocks[_self.getData().parentBlockId].records;
        var newRecordId = -1;
        var found = false;
        while (!found) {
            newRecordId++;
            found = true;
            for (var i in blocks) {
                if (Number(newRecordId) === Number(i)) {
                    found = false;
                }
            }
        }
        return newRecordId + "";
    },
    addRecord: function(parentBlockId, recordId, log) {
        var _self = this;
        var newRecord = _self.view.registerList.bindDFGRegisterUnit({
            parentBlockId: parentBlockId,
            parentRecordId: recordId
        });
        if (log) {
            _self.coreServices.lastChanges.push({
                message: {
                    enus: "A new record was added",
                    ptrbr: "Um novo registro foi adicionado"
                },
                blockId: parentBlockId,
                recordId: recordId,
                type: 2
            });
        }
        _self.records.push(newRecord);
        return newRecord;
    },
    renderRecords: function() {
        var _self = this;
        var currentBlock = _self.coreServices.layoutObject.blocks[_self.getData().parentBlockId];
        var currentRecord;
        _self.records = [];
        for (var i = 0; i < currentBlock.positions.length; i++) {
            //for(var i in currentBlock.records){
            currentRecord = _self.addRecord(_self.getData().parentBlockId, currentBlock.positions[i]);
            if (currentBlock.records[currentBlock.positions[i]].name == '900') {
                _self.countingRecord = currentRecord;
                _self.coreServices.totals.records = true;
            } else if (currentBlock.records[currentBlock.positions[i]].name == '990') {
                _self.coreServices.totals.blockRecord = currentRecord;
                _self.coreServices.totals.blocks = true;
            } else if (currentBlock.records[currentBlock.positions[i]].name == '999') {
                _self.coreServices.totals.allRecord = currentRecord;
                _self.coreServices.totals.all = true;
            }
            if (currentBlock.records[currentBlock.positions[i]].columns.blockStarter) {
                _self.blockStarter = currentRecord;
                _self.coreServices.totals.blockStarter = true;
            }
        }
        _self._sortableRegisters();
    },
    addCountRecord: function() {
        var _self = this;
        var newRecordId = _self.getRecordId();
        var initialStructure = Object.keys(_self.coreServices.structure)[0];
        _self.coreServices.layoutObject.blocks[_self.getData().parentBlockId].records[newRecordId] = {
            name: "990",
            columns: {},
            positions: [],
            idStructure: initialStructure,
            isDistinct: false
        };
        _self.countingRecord = _self.addRecord(_self.getData().parentBlockId, newRecordId);
        _self.countingRecord.buildField({
            id: 'recordId',
            label: i18n('RECORDID')
        }, _self.countingRecord.view.fieldList);
        _self.countingRecord.buildField({
            id: 'blockTotal',
            label: i18n('BLOCKTOTAL')
        }, _self.countingRecord.view.fieldList);
        if (_self.records.length === 1 && _self.coreServices.totals.blockStarter) {
            _self.addBlockStarter();
        }
    },
    removeCountRecord: function() {
        if (this.countingRecord) {
            this.countingRecord.removeRegister();
        }
    },
    addBlockStarter: function() {
        var _self = this;
        // var recordId;
        // var thisBlock = _self.coreServices.layoutObject.blocks[_self.getData().parentBlockId];
        for (var i = 0; i < _self.records.length; i++) {
            // recordId = _self.records[i].getData().parentRecordId;
            if (_self.records[i].alive) {
                _self.blockStarter = _self.records[i];
                _self.blockStarter.addBlockStarter();
                break;
            }
        }
    },
    removeBlockStarter: function() {
        if (this.blockStarter) {
            if (this.coreServices.layoutObject.blocks[this.getData().parentBlockId].records[this.blockStarter.getData().parentRecordId]) {
                this.blockStarter.removeBlockStarter();
            }
        }
    }
});