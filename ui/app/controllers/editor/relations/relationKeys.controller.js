sap.ui.controller('app.controllers.editor.relations.relationKeys', {
    onInit: function() {

    },
    onDataRefactor: function() {

    },
    onAfterRendering: function(html) {
        var _self = this;
        var data = _self.getData();
        _self.view = $(html);
        _self.view.keyWrapper = _self.view.find('.key-wrapper');
        _self.view.fatherKey = _self.view.find('.fatherKey');
        _self.key = data.row ? data.row : {};

        _self.view.sonKey = _self.view.find('.sonKey');
        _self.view.addKey = _self.view.find('#add-icon');
        _self.view.removeKey = _self.view.find('#delete-icon');
        _self.view.filterKey = _self.view.find('#filter-icon');
         _self.view.filterKey.hide();
        _self.bindElements();
        _self.bindEvents();

    },
    bindElements: function() {
        var _self = this;
        var fatherColumns = _self.getData().fatherColumns;
        var sonColumns = _self.getData().sonColumns;
        _self.view.fatherKey.ctrl = _self.view.fatherKey.bindBaseSelect({
            options: fatherColumns ? fatherColumns : [],
            disableSort: true,
            isDisabled: fatherColumns ? false : true,
            tooltip: i18n('SELECT KEY TOOLTIP'),
            onChange: function(oldVal, newVal) {
                _self.key.fatherKey = newVal;
            }

        });
        _self.view.sonKey.ctrl = _self.view.sonKey.bindBaseSelect({
            options: sonColumns ? sonColumns : [],
            disableSort: true,
            isDisabled: sonColumns ? false : true,
            tooltip: i18n('SELECT KEY TOOLTIP'),
            onChange: function(oldVal, newVal) {
                _self.key.sonKey = newVal;
            }
        });
        if (_self.key.fatherKey) {
            _self.view.fatherKey.ctrl.setKey(_self.key.fatherKey.key);
        }
        if (_self.key.sonKey) {
            _self.view.sonKey.ctrl.setKey(_self.key.sonKey.key);
        }
        if (_self.key.filter) {
            _self.filter = _self.key.filter;
        }
    },
    showFilterBtn: function(flag){
        var _self = this;
        if(flag)
            _self.view.filterKey.show();
        else
            _self.view.filterKey.hide();
    },
    bindEvents: function() {
        var _self = this;
        _self.view.removeKey.click(_self.removeKey.bind(this));
        _self.view.removeKey.baseTooltip({
            class: 'dark',
            position: 'top',
            text: i18n('REMOVE KEY TOOLTIP')
        });
        _self.view.removeKey.keydown(function(ev) {
            if (ev.keyCode === 13 || ev.keyCode === 32) {
                this.click();
            }
        });
        _self.view.addKey.click(_self.addKey.bind(this));
        _self.view.addKey.baseTooltip({
            class: 'dark',
            position: 'top',
            text: i18n('ADD KEY TOOLTIP')
        });
        _self.view.addKey.keydown(function(ev) {
            if (ev.keyCode === 13 || ev.keyCode === 32) {
                this.click();
            }
        });
        _self.view.filterKey.click(_self.filterKey.bind(this));
        _self.view.filterKey.baseTooltip({
            class: 'dark',
            position: 'top',
            text: i18n('ADD KEY TOOLTIP')
        });
        _self.view.filterKey.keydown(function(ev) {
            if (ev.keyCode === 13 || ev.keyCode === 32) {
                this.click();
            }
        });
    },
    addKey: function() {
        var _self = this;
        _self.parentController.addNewKey(_self.view.index());

    },
    filterKey: function() {
        var _self = this;
        var filterDialog = $.baseDialog({
            title: i18n('FILTER KEYS DIALOG'),
            modal: true,
            disableOuterClick: true,
            cssClass: "filter-dialog",
            size: 'big',
            viewName: "app.views.editor.relations.filterRelation",
            viewData: {
                filter: _self.filter || {}
            },
            buttons: [{
                name: i18n('CANCEL'),
                isCloseButton: true,
                click: function() {
                    filterDialog.close();
                },
                tooltip: i18n('CLICK PRESS CANCEL')
            }, {
                name: i18n('APPLY'),
                click: function() {

                    _self.key.filter = filterDialog.getInnerController().getFilterData();
                    _self.filter =_self.key.filter;
                    filterDialog.close();
                },
                tooltip: i18n('CLICK PRESS CONFIRM')
            }]
        });
        filterDialog.open();

    },
    removeKey: function(evt) {
        var _self = this;
        var keyRow = $(evt.currentTarget).parents(".key-wrapper");
        var keyIndex = keyRow.index();
        if (keyRow.siblings().length !== 0) {
            keyRow.detach();
            _self.parentController.keysController.splice(keyIndex, 1);
        }
    },
    addKeyOptions: function(father, options) {
        var _self = this;
        if (father) {
            _self.view.fatherKey.empty();
            _self.view.fatherKey.ctrl = _self.view.fatherKey.bindBaseSelect({
                options: options,
                disableSort: true,
                tooltip: i18n('SELECT KEY TOOLTIP'),
                onChange: function(oldVal, newVal) {
                    _self.key.fatherKey = newVal;
                }
            });

        } else {
            _self.view.sonKey.empty();
            _self.view.sonKey.ctrl = _self.view.sonKey.bindBaseSelect({
                options: options,
                disableSort: true,
                tooltip: i18n('SELECT KEY TOOLTIP'),
                onChange: function(oldVal, newVal) {
                    _self.key.sonKey = newVal;
                }
            });
        }
    },
    getKey: function() {
        var _self = this;
        return _self.key;
    },
    isValid: function() {
        var _self = this;
        return _self.view.fatherKey.ctrl.getKey() && _self.view.sonKey.ctrl.getKey();
    }
});
