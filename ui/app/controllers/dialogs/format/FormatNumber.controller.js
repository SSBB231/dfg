sap.ui.controller("app.controllers.dialogs.format.FormatNumber", {
    onInit: function() {

    },

    onDataRefactor: function(data) {
        return $.extend(data, this.data);
    },

    onAfterRendering: function(html) {
        var _self = this;
        _self.view = $(".f-number");
        _self.view.replaceRow = _self.view.find(".replace-row");
        _self.replaceRowsCtrls = {};
         _self.lastIndex = 1;
        _self.format = _self.getData().format;
        _self.initInputs();
        if (_self.getData().format) {
            _self.initValues();
        }
        _self.view.replaceRow.find(".delete-icon").bind("click", _self.removeReplaceRow.bind(_self));
        _self.view.replaceRow.find(".delete-icon").baseTooltip({
            class: 'dark',
            position: 'top',
            text: i18n('REMOVE REPLACE VALUE TOOLTIP')
        });
        _self.view.replaceRow.find(".add-icon").bind("click", _self.addReplaceRow.bind(_self));
        _self.view.replaceRow.find(".add-icon").baseTooltip({
            class: 'dark',
            position: 'top',
            text: i18n('ADD REPLACE VALUE TOOLTIP')
        });
    },
    addReplaceRow: function(e, index) {
        var _self = this;
        var target = e ? e.currentTarget.parentElement.getAttribute("data-id") : index;

        _self.lastIndex++;
        var newElement = document.createElement("div");
        newElement.className = "envolve replace-row";
        newElement.setAttribute("data-id", _self.lastIndex);
        var container1 = document.createElement("div");
        container1.className = "big-half";
        var label1 = document.createElement("div");
        label1.className = "left";
        label1.textContent = i18n("REPLACE");
        var input1 = document.createElement("div");
        input1.className = "input-search-for inputs medium";
        container1.append(label1);
        container1.append(input1);
        var container2 = document.createElement("div");
        container2.className = "big-half";
        var label2 = document.createElement("div");
        label2.className = 'left';
        label2.textContent = i18n("WITH");
        var input2 = document.createElement("div");
        input2.className = "input-search-for inputs medium";
        container2.append(label2);
        container2.append(input2);
        var deleteIcon = document.createElement("div");
        var iconD = document.createElement("span");
        iconD.className = "icon icon-font-Sign-and-Symbols icon-persign icon-btn btn flat trans";
        deleteIcon.append(iconD);
        deleteIcon.setAttribute("id", "delete-icon");
        deleteIcon.className = "delete-icon";
        $(deleteIcon).bind("click", _self.removeReplaceRow.bind(_self));
        var addIcon = document.createElement("div");
        var iconA = document.createElement("span");
        iconA.className = "icon icon-font-Sign-and-Symbols icon-plussign icon-btn btn flat trans";
        addIcon.setAttribute("id", "add-icon");
        addIcon.className = "add-icon";
        $(addIcon).bind("click", _self.addReplaceRow.bind(_self));
        addIcon.append(iconA);
        newElement.append(container1);
        newElement.append(container2);
        newElement.append(deleteIcon);
        newElement.append(addIcon);
        var parent = e ? e.currentTarget.parentElement : $(".replace-row[data-id=\"" + index + "\"]");
        $(newElement).insertAfter(parent);
        _self.replaceRowsCtrls[_self.lastIndex] = {};
        _self.replaceRowsCtrls[_self.lastIndex].inputSearchFor = $(input1).bindBaseInput({
            tooltip: i18n('REPLACE INPUT TOOLTIP'),
            placeholder: i18n('REPLACE')
        });
        _self.replaceRowsCtrls[_self.lastIndex].inputReplaceWith = $(input2).bindBaseInput({
            tooltip: i18n('WITH INPUT TOOLTIP'),
            placeholder: i18n('WITH')
        });



    },
    removeReplaceRow: function(e, index) {
        var target = e ? e.currentTarget.parentElement.getAttribute("data-id") : index;
        if (target === "1")
            return;
        if (e) {
            $(e.currentTarget.parentElement).remove();
        } else {
            $(".replace-row[data-id=\"" + index + "\"]").remove();
        }

        delete this.replaceRowsCtrls[target];
    },
    initInputs: function() {
        var _self = this;
        _self.inputLength = $('.f-number .input-length').bindBaseInput({
            tooltip: i18n('LENGTH INPUT TOOLTIP'),
            placeholder: i18n('LENGTH')
        });
        _self.inputAlign = $('.f-number .input-align').bindBaseSelect({
            options: [{ key: 0, name: i18n('LEFT') }, { key: 1, name: i18n('RIGHT') }],
            disableSort: true,
            tooltip: i18n('ALIGN SELECT TOOLTIP')
        });
        _self.inputFill = $('.f-number .input-fill').bindBaseInput({
            tooltip: i18n('COMPLEMENT INPUT TOOLTIP'),
            placeholder: i18n('FILL')
        });
        _self.inputSearchFor = $('.f-number .input-search-for').bindBaseInput({
            tooltip: i18n('REPLACE INPUT TOOLTIP'),
            placeholder: i18n('REPLACE')
        });
        _self.inputReplaceWith = $('.f-number .input-replace-with').bindBaseInput({
            tooltip: i18n('WITH INPUT TOOLTIP'),
            placeholder: i18n('WITH')
        });
        _self.inputDecimals = $('.f-number .input-decimals').bindBaseInput({
            tooltip: i18n('DECIMALS INPUT TOOLTIP'),
            placeholder: i18n('DECIMALS')
        });
        _self.inputDecimalSeparator = $('.f-number .input-decimal-separator').bindBaseInput({
            tooltip: i18n('DECIMALS SEPARATOR INPUT TOOLTIP'),
            placeholder: i18n('DECIMAL SEPARATOR PLACEHOLDER')
        });
        _self.inputThousandSeparator = $('.f-number .input-thousand-separator').bindBaseInput({
            tooltip: i18n('THOUSAND INPUT TOOLTIP'),
            placeholder: i18n('THOUSAND SEPARATOR PLACEHOLDER')
        });
        
        $('.btnClear').on('keydown', function() {
            var keyPressed = event.keyCode || event.which;

            if (keyPressed == 13) {
                _self.inputLength.setText('');
                _self.inputAlign.setKey(0);
                _self.inputFill.setText('');
                _self.inputSearchFor.setText('');
                _self.inputReplaceWith.setText('');
                for (var i in _self.replaceRowsCtrls) {
                    _self.removeReplaceRow(i);
                }
                _self.inputDecimals.setText('');
                _self.inputDecimalSeparator.setText('');
                _self.inputThousandSeparator.setText('');
            };
        });

        $('.btnClear').click(function(e) {
            _self.inputLength.setText('');
            _self.inputAlign.setKey(0);
            _self.inputFill.setText('');
            _self.inputSearchFor.setText('');
            _self.inputReplaceWith.setText('');
            for (var i in _self.replaceRowsCtrls) {
                _self.removeReplaceRow(i);
            }
            _self.inputDecimals.setText('');
            _self.inputDecimalSeparator.setText('');
            _self.inputThousandSeparator.setText('');
        });
         _self.view.find('.btnClear').baseTooltip({
            class: 'dark',
            position: 'top',
            text: i18n('CLEAR DATA TOOLTIP')
        });
    },
    initValues: function() {
        var _self = this;
        _self.inputLength.setText(_self.format.size);
        if (_self.format.align === 0 || _self.format.align == 1) {
            _self.inputAlign.setKey(_self.format.align);
        }
        _self.inputFill.setText(_self.format.complement);
        if (typeof _self.format.searchFor === "string" && typeof _self.format.replaceWith === "string") {
            _self.inputSearchFor.setText(_self.format.searchFor);
            _self.inputReplaceWith.setText(_self.format.replaceWith);
        } else {
            _self.inputSearchFor.setText(_self.format.searchFor[0]);
            _self.inputReplaceWith.setText(_self.format.replaceWith[0]);
            for (var i = 1; i < _self.format.searchFor.length; i++) {
                _self.addReplaceRow(undefined, i);
                _self.replaceRowsCtrls[i + 1].inputSearchFor.setText(_self.format.searchFor[i]);
                _self.replaceRowsCtrls[i + 1].inputReplaceWith.setText(_self.format.replaceWith[i]);
            }
            _self.lastIndex = _self.format.searchFor.length;
        }
        _self.inputDecimals.setText(_self.format.decimal);
        _self.inputDecimalSeparator.setText(_self.format.decimalSeparator);
        _self.inputThousandSeparator.setText(_self.format.miliarSeparator);
    },
    getOwnData: function() {
        var _self = this;
        var returnFormat = {};

        returnFormat.size = _self.inputLength.getText();
        returnFormat.align = _self.inputAlign.getKey();
        returnFormat.complement = _self.inputFill.getText()
        returnFormat.searchFor = [_self.inputSearchFor.getText()];
        returnFormat.replaceWith = [_self.inputReplaceWith.getText()];
        for (var i in _self.replaceRowsCtrls) {
            returnFormat.searchFor.push(_self.replaceRowsCtrls[i].inputSearchFor.getText());
            returnFormat.replaceWith.push(_self.replaceRowsCtrls[i].inputReplaceWith.getText());
        }
        returnFormat.decimal = _self.inputDecimals.getText();
        returnFormat.decimalSeparator = _self.inputDecimalSeparator.getText();
        returnFormat.miliarSeparator = _self.inputThousandSeparator.getText();
        var isNull = true;
        for (var i in returnFormat) {
            if (returnFormat[i]) {
                isNull = false;
            }
        }
        if (isNull) {
            return null;
        } else {
            return returnFormat;
        }
    }
})
