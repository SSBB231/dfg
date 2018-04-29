sap.ui.controller("app.controllers.dialogs.PanelSetting", {
    onInit: function() {
        this.data = {
            description: {
                'class': "textarea-class",
                id: "textarea-id"
            }
        };
    },
    onDataRefactor: function(data) {
        data.typeW = "justify";
        if( data.type === "setting" )
            data.typeW = "setting";
        if( data.type === "approvePva" || data.type === "signaturePva" ||
            data.type === "transmissionPva" || data.type === "savePva" )
            data.typeW = "pva";
        return $.extend(data, this.data);
    },
    onAfterRendering: function(html) {
        var _self = this;
        _self.loader = $('#create-file-dialog').parent().parent().baseLoader({
            modal: true
        });
        _self.view = $(html);
        _self.view.layoutDescription = _self.view.find('#textareaDescription');

        var data = _self.getData();
        if( data.type === "setting" ){
            _self.view.layoutType = _self.view.find('#inputSelectTypeFile');
            _self.view.link = _self.view.find('#inputLink');
            _self.view.component = _self.view.find('#inputComponent');
            _self.view.tribute = _self.view.find('#inputTribute');
        }else{
            _self.view.inputCheckGood = _self.view.find('#inputCheckGood');
            _self.view.inputCheckError = _self.view.find('#inputCheckError');
        }
        _self.loader.open();
        _self.bindElements();
        _self.bindTooltips();
        if( data.type === "setting" )
            _self.fillData();
        else
            _self.loader.close();
    },
    getFormData: function() {
        var _self = this;
        if (!_self.validate()) {
            return false;
        }

        if( _self.getData().typeW === "setting" ){
            var ret = {
                idDigitalFileType: _self.view.layoutType.ctrl.getKey(),
                origin: _self.view.component.ctrl.getKey(),
                link: _self.view.link.ctrl.getText(),
                idTax: _self.view.tribute.ctrl.getKeys(),
                description: _self.view.layoutDescription.ctrl.val()
            };
            if(_self.getData().setting)
                ret.id = _self.getData().setting.id;
            return ret;
        }else if( _self.getData().typeW === "pva" ){
            return {
                success: _self.view.inputCheckGood.ctrl.getChecked(),
                error: _self.view.inputCheckError.ctrl.getChecked(),
                comment: _self.view.layoutDescription.ctrl.val()
            };
        }else if( _self.getData().typeW === "justify" ){
            return {
                justify: _self.view.layoutDescription.ctrl.val()
            };
        }
    },
    validate: function() {
        var _self = this;
        var data = _self.getData();
        if( data.typeW === "setting" && (!_self.view.layoutType.ctrl.validate() || !_self.view.component.ctrl.validate()
            || !_self.view.tribute.ctrl.validate() || !_self.view.link.ctrl.validate()) )
            return false;
        else if( data.typeW === "pva" ){
            if( (data.type === "approvePva" || data.type === "signaturePva" ||
            data.type === "transmissionPva" || data.type === "savePva") && 
            (!_self.view.inputCheckGood.ctrl.getChecked() && !_self.view.inputCheckError.ctrl.getChecked()) )
                return false;
        }else if( data.typeW === "justify" ){
            if( !_self.view.layoutDescription.ctrl.val() )
                return false;
        }

        return true;
    },
    bindElements: function() {
        var _self = this;
        _self.view.layoutDescription.ctrl = _self.view.layoutDescription.find('textarea');
        _self.view.layoutDescription.ctrl.attr('placeholder', i18n('FOLDERDESCRIPTION TOOLTIP'));

        var data = _self.getData();
        if( data.typeW === "setting" ){
            _self.view.layoutType.ctrl = _self.view.layoutType.bindBaseSelect({
                options: [],
                tooltip: i18n('LAYOUT TYPE TOOLTIP'),
                placeholder: i18n('LAYOUT TYPE'),
                isLoading: true,
                required: true
            });

            _self.view.component.ctrl = _self.view.component.bindBaseSelect({
                options: [{key: 1, name: "DFG"},{key: 2, name: "External"}],
                disableSort: true,
                tooltip: i18n('COMPONENT TOOLTIP'),
                placeholder: i18n('COMPONENT'),
                required: true
            });

            _self.view.link.ctrl = _self.view.link.bindBaseInput({
                required: true,
                placeholder: i18n("LINK"),
                tooltip: i18n("LINK TOOLTIP")
            });

            _self.view.tribute.ctrl = _self.view.tribute.bindBaseMultipleSelect3({
                options: [],
                tooltip: i18n('TILE TAX TOOLTIP'),
                placeholder: i18n('TILE TAX'),
                isLoading: true,
                required: true
            });
        }else{
            var textTitle = "", textTitleError = "";
            if( data.type === "approvePva" ){
                textTitleError = i18n('APPROVE PVA ERRORS');
                textTitle = i18n('APPROVE PVA NO ERRORS');
            }else if( data.type === "signaturePva" ){
                textTitleError = i18n('SIGNATURE PVA ERRORS');
                textTitle = i18n('SIGNATURE PVA NO ERRORS');
            }else if( data.type === "transmissionPva" ){
                textTitleError = i18n('TRANSMISSION PVA ERRORS');
                textTitle = i18n('TRANSMISSION PVA NO ERRORS');
            }else if( data.type === "savePva" ){
                textTitleError = i18n('SAVE PVA ERRORS');
                textTitle = i18n('SAVE PVA NO ERRORS');
            }
            _self.view.inputCheckError.ctrl = _self.view.inputCheckError.bindBaseCheckbox({
                id: 1,
                text: textTitleError,
                onChange: function(old, newValue) {
                    if( newValue )
                        _self.view.inputCheckGood.ctrl.setChecked(false);
                }
            });
            _self.view.inputCheckGood.ctrl = _self.view.inputCheckGood.bindBaseCheckbox({
                id: 2,
                text: textTitle,
                onChange: function(old, newValue) {
                    if( newValue )
                        _self.view.inputCheckError.ctrl.setChecked(false);
                }
            });
        }
    },
    bindTooltips: function() {
        var self = this;
        $('#textarea-id').attr('tabindex', '0');
        $('#textarea-id').baseTooltip({
            class: 'dark',
            position: 'top',
            text: i18n('FOLDERDESCRIPTION TOOLTIP')
        });
    },
    fillData: function() {
        var _self = this;
        Data.endpoints.dfg.panel.settingDialog.post().success(function(data) {
            _self.view.layoutType.empty();
            _self.view.layoutType.ctrl = _self.view.layoutType.bindBaseSelect({
                options: data.digitalFileTypes.map(function(value){
                    return {
                        key: value.id,
                        name: value.name
                    };
                }),
                tooltip: i18n('LAYOUT TYPE TOOLTIP'),
                placeholder: i18n('LAYOUT TYPE'),
                required: true
            });

            _self.view.tribute.empty();
            _self.view.tribute.ctrl = _self.view.tribute.bindBaseMultipleSelect3({
                options: data.taxes,
                tooltip: i18n('TILE TAX TOOLTIP'),
                placeholder: i18n('TILE TAX'),
                required: true
            });

            var _data = _self.getData();
            if( _data.setting ){
                _self.view.link.ctrl.setText(_data.setting.link);
                _self.view.component.ctrl.setKey(_data.setting.origin === "DFG" ? 1 : 2);
                _self.view.layoutDescription.ctrl.val(_data.setting.description);
                _self.view.tribute.ctrl.setKey(JSON.parse(_data.setting.idTax));
                _self.view.layoutType.ctrl.setKey(_data.setting.idDigitalFileType);
            }
            _self.loader.close();
        }).error(function(data) {
            _self.loader.close();
        });
    }
});