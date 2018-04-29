sap.ui.controller("app.controllers.dialogs.sequenceFieldDialog", {
    onInit: function() {

    },
    onAfterRendering: function(html) {
        var _self = this;
        var _data = _self.getData();
        _self.view = $(html);
        _self.view.sequenceName = _self.view.find(".sequence-name");
        
        _self.view.sequenceName.ctrl = _self.view.sequenceName.bindBaseInput({
            required: true,
            tooltip: i18n("CLICK/PRESS ENTER TO FILL COLUMN NAME")
        });
        if (_data.initLevel.column) {
             _self.view.sequenceName.ctrl.setText((_data.initLevel.column.label) || i18n("SEQUENCE"));
        }
        _self.view.radioButtonContainer = _self.view.find(".sequence-typeCB");
        _self.relationCB = _self.view.radioButtonContainer.bindBaseRadioButton({
            id: 1,
            text: i18n("RELATION"),
            name: "options",
            onChange: function(old, newValue) {
                _self.relationOptionCtrl = _self.relationCB._html.find(".relation-option").bindBaseCheckbox({
                    id: 1,
                    text: i18n("APPLY SEQUENCE RELATION"),
                    onChange: function(old, newValue) {

                    }
                });
            }
        });
        _self.relationOption = document.createElement("div");
        _self.relationOption.setAttribute("class", "relation-option");
        _self.relationOptionCtrl = $(_self.relationOption).bindBaseCheckbox({
            id: 1,
            text: i18n("APPLY SEQUENCE RELATION"),
            onChange: function(old, newValue) {

            }
        });
        _self.relationCB._html.append(_self.relationOption);
        _self.recordCB = _self.view.radioButtonContainer.bindBaseRadioButton({
            id: 1,
            text: i18n("RECORD"),
            name: "options",
            onChange: function(old, newValue) {
                $(_self.relationOption).empty();
                _self.relationOptionCtrl = undefined;
            }
        });
        _self.lineCB = _self.view.radioButtonContainer.bindBaseRadioButton({
            id: 1,
            text: i18n("LINE SEQUENCE"),
            name: "options",
            onChange: function(old, newValue) {
                $(_self.relationOption).empty();
                _self.relationOptionCtrl = undefined;
            }
        });
    
        if (_data.initLevel.field) {
            if (_data.initLevel.field.relation) {
                if (_data.initLevel.field.applyRelation) {
                    _self.relationCB.setChecked(true);
                    if (_data.initLevel.field.applyToChildren) {
                        _self.relationOptionCtrl.setChecked(true);
                    } else {
                        _self.relationOptionCtrl.setChecked(false);
                    }
                }
            } else {
                if (_data.initLevel.field.recordSequence) {
                    _self.recordCB.setChecked(true);
                } else {
                    _self.lineCB.setChecked(true);
                }
            }

        }
    },
    validate: function(){
        return true;
    },
    getColumnData: function(){
        this._data.initLevel.column.sequenceField = this.getSequenceField();    
        return this._data.initLevel.column;
    },
    getSequenceField: function() {
        var _self = this;
        if (_self.relationCB.getChecked()) {
            if (_self.relationOptionCtrl && _self.relationOptionCtrl.getChecked()) {
                return {
                    label: _self.view.sequenceName.ctrl.getText(),
                    recordSequence: false,
                    lineSequence: false,
                    relation: {
                        applyRelation: true,
                        applyToChildren: true
                    }
                };
            } else {
                return {
                    label: _self.view.sequenceName.ctrl.getText(),
                    recordSequence: false,
                    lineSequence: false,
                    relation: {
                        applyRelation: true,
                        applyToChildren: false
                    }
                };
            }
        }
        if (_self.recordCB.getChecked()) {
            return {
                label: _self.view.sequenceName.ctrl.getText(),
                recordSequence: true,
                lineSequence: false
            }; 
        }
        return {
            label: _self.view.sequenceName.ctrl.getText(),
            recordSequence: false,
            lineSequence: true
        };
    }
});
