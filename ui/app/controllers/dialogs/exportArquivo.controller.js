sap.ui.controller("app.controllers.dialogs.exportArquivo", {
    data: {},
    onInit: function() {},
    onAfterRendering: function(html) {
        var _self = this;
        _self.button1 = $("#btn1");
        _self.option = 'text';

        _self.button1.ctrl = _self.button1.bindBaseRadioButton({
            id: 1,
            text: i18n("TEXT"),
            name: 'option',
            //class: 'warning',
            onChange: function(oldVal, newVal) {
                if (newVal)
                    _self.option = 'text';
            }
        });
        _self.button1.ctrl1 = _self.button1.bindBaseRadioButton({
            id: 1,
            text: 'XML',
            name: 'option',
            //class: 'error',
            onChange: function(oldVal, newVal) {
                if (newVal)
                    _self.option = 'xml';
            }
        });
        _self.button1.ctrl2 = _self.button1.bindBaseRadioButton({
            id: 1,
            text: 'XLS',
            name: 'option',
            //class: 'error',
            onChange: function(oldVal, newVal) {
                if (newVal)
                    _self.option = 'xls';
            }
        });


    },
    getSelection: function() {
        var _self = this;
        return _self.option;

    }

});