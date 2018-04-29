/*global i18n*/
sap.ui.controller("app.controllers.dialogs.HeaderData", {
    onInit: function() {},
    onDataRefactor: function(data) {
        return $.extend(data, this.data);
    },
    onAfterRendering: function(html) {
        var _self = this;
        _self.headerData = _self.coreServices.layoutObject;
        _self.view = $(html);
        _self.view.inputName = _self.view.find('#inputName');
        _self.view.inputLayoutType = _self.view.find('#inputLayoutType');
        _self.view.inputStructure = _self.view.find('#inputStructure');
        _self.view.inputStructureGroup = _self.view.find('#inputStructureGroup');
        _self.view.inputDescription = _self.view.find('#inputDescription');
        _self.initInputs();
        // _self.bindEvents();
        // if (_self.coreServices.exhibition) {
        //     _self.processExhibition();
        // }
    },
    bindEvents: function() {
        var _self = this;
        _self.stateRadio.click(function() {
            _self.federalRadio.find('input').removeAttr('checked');
            _self.stateRadio.find('input').attr('checked', 'checked');
            //_self.renderStates();
            _self.inputArea.enable();
        });
        _self.federalRadio.click(function() {
            _self.stateRadio.find('input').removeAttr('checked');
            _self.federalRadio.find('input').attr('checked', 'checked');
            _self.inputArea.setSelectedValues([]);
            _self.inputArea.disable();
        });
    },
    initInputs: function() {
        var _self = this;
        var subStructure = "";
        for (var i = 0; i < _self.headerData.structure.length; i++) {
            if (i !== _self.headerData.structure.length - 1) {
                subStructure = subStructure + _self.headerData.structure[i].title + ",";
            } else {
                subStructure = subStructure + _self.headerData.structure[i].title;
            }
        }
        var _textSGroup = "";
        _self.headerData.structure.forEach(function(item, index) {
            if (index !== _self.headerData.structure.length - 1) {
                _textSGroup += item.parent + ",";
            } else {
                _textSGroup += item.parent;
            }
        });

        _self.view.inputDescription.baseTooltip({
            class: 'dark',
            position: 'top',
            text: i18n('FILE DESCRIPTION TOOLTIP')
        });
        _self.view.inputDescription.text(_self.headerData.description);
        _self.view.inputStructureGroup.ctrl = _self.view.inputStructureGroup.bindBaseInput({
            tooltip: i18n('STRUCTURE TOOLTIP'),
            isDisabled: true
        });
        _self.view.inputStructure.ctrl = _self.view.inputStructure.bindBaseInput({
            tooltip: i18n('STRUCTURE TOOLTIP'),
            isDisabled: true
        });
        _self.view.inputLayoutType.ctrl = _self.view.inputLayoutType.bindBaseInput({
            tooltip: i18n('STRUCTURE TOOLTIP'),
            isDisabled: true
        });
        _self.view.inputName.ctrl = _self.view.inputName.bindBaseInput({
            tooltip: i18n('TILE LAYOUT NAME TOOLTIP')
        });
        _self.view.inputStructureGroup.ctrl.setText(_textSGroup);
        _self.view.inputStructure.ctrl.setText(subStructure);
        _self.view.inputName.ctrl.setText(_self.headerData.name);
        _self.view.inputLayoutType.ctrl.setText(_self.headerData.digitalFileType.name);
    },
    updateHeaderData: function() {
        var _self = this;
        _self.coreServices.layoutObject.name = _self.view.inputName.ctrl.getText();
        _self.coreServices.layoutObject.description = _self.view.inputDescription.val();
    },
    processExhibition: function() {
        var mainCrystal = $('<div>').addClass('dfg-crystal').addClass('dfg-big');
        $('#dfg-header-dialog').append(mainCrystal);
    }
});