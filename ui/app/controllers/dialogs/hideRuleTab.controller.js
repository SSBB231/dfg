/*global i18n _*/
sap.ui.controller('app.controllers.dialogs.hideRuleTab', {
    onInit: function() {},
    onAfterRendering: function(html) {
        var _self = this;
        _self.view = $(html);
        _self.characterInput = _self.view.find(".character-input");
        _self.hideCb = _self.view.find(".hide-cb");
        _self.hideValue = _self.view.find(".hide-value-cb");
        _self.sizeInput = _self.view.find(".size-input");
        _self.bindComponents();
    },
    bindComponents: function() {
        var _self = this;
        let enableInput = function() {
            let hideRecord = _self.hideValue.hideCb.getChecked();
            let hideField = _self.hideValue.hideField.getChecked();
            let hideValue = _self.hideValue.ctrl.getChecked();
            let hideAllLine = _self.hideValue.hideAllLine.getChecked();
            if (!hideRecord && !hideValue && !hideField && !hideAllLine) {
                _self.characterInput.ctrl.enable();
                if (_self.coreServices.needsSize) {
                    _self.sizeInput.ctrl.enable();
                } else {
                    _self.sizeInput.ctrl.disable();
                }
            }
        };
        let disableInput = function() {
            _self.characterInput.ctrl.setText("");
            _self.characterInput.ctrl.disable();
            _self.sizeInput.ctrl.setText("");
            _self.sizeInput.ctrl.disable();
        };
        _self.characterInput.ctrl = _self.characterInput.bindBaseInput({
            tooltip: i18n('VALUE TOOLTIP')
        });
        _self.sizeInput.ctrl = _self.sizeInput.bindBaseInput({
            isDisabled: true,
            isRequired: true,
            type: "number",
            validatorType: "number",
            tooltip: i18n('VALUE SIZE TOOLTIP'),
            validator: function(oldVal, newVal) {
                if (isNaN(parseInt(newVal, 10))) {
                    this.showError();
                    return false;
                }
                if (parseInt(newVal, 10) < 0) {
                    this.showError();
                    return false;
                }
                this.hideError();
                return true;
            },
            errorMsg: i18n("FIXED FIELD SIZE ERROR")
        });

        _self.hideValue.hideCb = _self.hideValue.bindBaseCheckbox({
            text: i18n("HIDE RECORD"),
            tooltip: i18n('HIDE RECORD TOOLTIP'),
            onChange: function(oldVal) {
                if (oldVal) {
                    if (!_self.hideValue.ctrl.getChecked()) {
                        _self.hideValue.hideField.enable();
                    }
                    if (!_self.hideValue.hideField.getChecked()) {
                        _self.hideValue.ctrl.enable();
                    }
                    _self.hideValue.keepSeparator.enable();
                    enableInput();
                } else {
                    disableInput();
                    _self.hideValue.hideField.disable();
                    _self.hideValue.hideField.setChecked(false);
                    if (_self.hideValue.ctrl.getChecked()) {
                        _self.hideValue.keepSeparator.disable();
                        _self.hideValue.keepSeparator.setChecked(false);
                    } else if (_self.hideValue.keepSeparator.getChecked()) {
                        _self.hideValue.ctrl.disable();
                        _self.hideValue.ctrl.setChecked(false);
                    }
                }
            }
        });
        _self.hideValue.hideField = _self.hideValue.bindBaseCheckbox({
            text: i18n("HIDE FIELD"),
            tooltip: i18n('HIDE FIELD TOOLTIP'),
            onChange: function(oldVal) {
                if (oldVal) {
                    _self.hideValue.hideCb.enable();
                    _self.hideValue.ctrl.enable();
                    enableInput();
                } else {
                    disableInput();
                    _self.hideValue.hideCb.disable();
                    _self.hideValue.hideCb.setChecked(false);
                    _self.hideValue.ctrl.disable();
                    _self.hideValue.ctrl.setChecked(false);
                }
            }
        });
        _self.hideValue.ctrl = _self.hideValue.bindBaseCheckbox({
            text: i18n("HIDE VALUE"),
            tooltip: i18n('HIDE VALUE TOOLTIP'),
            onChange: function(oldVal) {
                if (oldVal) {
                    _self.hideValue.keepSeparator.enable();
                    if (!_self.hideValue.hideCb.getChecked()) {
                        _self.hideValue.hideField.enable();
                    }
                    if (!_self.hideValue.hideField.getChecked()) {
                        _self.hideValue.hideCb.enable();
                    }
                    enableInput();
                } else {
                    disableInput();
                    _self.hideValue.hideField.disable();
                    _self.hideValue.hideField.setChecked(false);
                    if (_self.hideValue.hideCb.getChecked()) {
                        _self.hideValue.keepSeparator.disable();
                        _self.hideValue.keepSeparator.setChecked(false);
                    } else if (_self.hideValue.keepSeparator.getChecked()) {
                        _self.hideValue.hideCb.disable();
                        _self.hideValue.hideCb.setChecked(false);
                    }
                }
            }
        });
        _self.hideValue.keepSeparator = _self.hideValue.bindBaseCheckbox({
            text: i18n("KEEP SEPARATOR"),
            tooltip: i18n('KEEP SEPARATOR'),
            onChange: function(oldVal) {
                if (oldVal) {
                    if (!_self.hideValue.hideCb.getChecked()) {
                        _self.hideValue.hideField.enable();
                    }
                    if (!_self.hideValue.hideField.getChecked()) {
                        _self.hideValue.ctrl.enable();
                        _self.hideValue.hideCb.enable();
                    }
                    enableInput();
                } else {
                    disableInput();
                    if (_self.hideValue.hideCb.getChecked()) {
                        _self.hideValue.ctrl.disable();
                        _self.hideValue.ctrl.setChecked(false);
                    } else if (_self.hideValue.ctrl.getChecked()) {
                        _self.hideValue.hideCb.disable();
                        _self.hideValue.hideCb.setChecked(false);
                    }
                }
            }
        });
        _self.hideValue.hideAllLine = _self.hideValue.bindBaseCheckbox({
            text: i18n("HIDE LINE WITH ALL NULL FIELDS"),
            tooltip: i18n('HIDE LINE TOOLTIP'),
            onChange: function(oldVal) {
                if (oldVal) {
                    enableInput();
                } else {
                    disableInput();
                }
            }
        });
        _self.hideValue.hideAllLine._html.hide();
    },
    enableSizeInput: function() {
        var _self = this;
        _self.sizeInput.ctrl.enable();
    },
    showHideLine: function() {
        var _self = this;
        _self.hideValue.hideAllLine._html.show();
    },
    hideHideLine: function() {
        var _self = this;
        _self.hideValue.hideAllLine.setChecked(false);
        _self.hideValue.hideAllLine._html.hide();
    },
    disableSizeInput: function() {
        var _self = this;
        _self.sizeInput.ctrl.disable();
    },
    setRuleConfig: function(config) {
        var _self = this;
        if (!config) {
            _self.characterInput.ctrl.setText("");
            _self.sizeInput.ctrl.setText("");
            _self.hideValue.hideCb.setChecked(false);
            _self.hideValue.ctrl.setChecked(false);
            _self.hideValue.hideAllLine.setChecked(false);
            _self.hideValue.hideField.setChecked(false);
            _self.hideValue.keepSeparator.setChecked(false);
            return;
        }
        if (config.character) {
            _self.characterInput.ctrl.enable();
            _self.characterInput.ctrl.setText(config.character);
        }
        if (config.size) {
            _self.sizeInput.ctrl.enable();
            _self.sizeInput.ctrl.setText(config.size);
        }
        if (config.hide !== undefined) {
            _self.hideValue.hideCb.setChecked(config.hide);
        } else {
            _self.hideValue.hideCb.setChecked(false);
        }
        if (config.hideValue !== undefined) {
            _self.hideValue.ctrl.setChecked(config.hideValue);
        } else {
            _self.hideValue.ctrl.setChecked(false);
        }
        if (config.hideAllLine !== undefined) {
            _self.hideValue.hideAllLine.setChecked(config.hideAllLine);
        } else {
            _self.hideValue.hideAllLine.setChecked(false);
        }
        if (config.hideField !== undefined) {
            _self.hideValue.hideField.setChecked(config.hideField);
        } else {
            _self.hideValue.hideField.setChecked(false);
        }
        if (config.keepSeparator !== undefined) {
            _self.hideValue.keepSeparator.setChecked(config.keepSeparator);
        } else {
            _self.hideValue.keepSeparator.setChecked(false);
        }
    },
    getRuleConfig: function() {
        var _self = this;
        return {
            character: _self.characterInput.ctrl.getText(),
            size: _self.sizeInput.ctrl.getText(),
            hide: _self.hideValue.hideCb.getChecked(),
            hideField: _self.hideValue.hideField.getChecked(),
            hideValue: _self.hideValue.ctrl.getChecked(),
            keepSeparator: _self.hideValue.keepSeparator.getChecked(),
            hideAllLine: _self.hideValue.hideAllLine.getChecked()
        };
    }
});