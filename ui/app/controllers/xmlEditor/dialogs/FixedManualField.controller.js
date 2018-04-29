sap.ui.controller("app.controllers.xmlEditor.dialogs.FixedManualField", {
    onInit: function() {

    },
    onDataRefactor: function(data) {

    },
    onAfterRendering: function(html) {
        var _self = this;
        _self.services = _self.getData().services;
        _self.layoutObject = _self.coreServices.layoutObject;
        _self.options = [];
        _self.view = $(html);
        _self.view.fieldInput = _self.view.find(".field-input");
        _self.view.requiredCheckbox = _self.view.find(".required-checkbox");
        _self.view.optionInput = _self.view.find(".option-input");
        _self.view.descriptionInput = _self.view.find(".description-input");
        _self.view.optionsTable = _self.view.find(".options-table");
        _self.view.addButton = _self.view.find(".add-button");
        _self.modified = false;
        _self._bindComponents();
        _self._bindTable(_self.options);
        _self.addEvents();
    },
    _bindComponents: function() {
        var _self = this;
        var fixedField = _self.getData().fixedField;

        _self.view.fieldInput.ctrl = _self.view.fieldInput.bindBaseInput({
            required: true,
            errorMsg: i18n("INVALID LENGTH"),
        });
        _self.view.fieldInput.ctrl.input._input.attr('maxlength',40);
       
     
        _self.view.requiredCheckbox.ctrl = _self.view.requiredCheckbox.bindBaseCheckbox({
            id: 1,
            text:  i18n('REQUIRED FILL')
        });
        _self._bindOptionDescription();
    },
    _bindOptionDescription: function(){
        var _self = this;

         _self.view.optionInput.ctrl = _self.view.optionInput.bindBaseInput({
            tooltip: i18n("ADD OPTION VALUE PLACEHOLDER"),
            placeholder: i18n("ADD OPTION VALUE PLACEHOLDER"),
            errorMsg: i18n("INVALID LENGTH"),
        });

        _self.view.descriptionInput.ctrl = _self.view.descriptionInput.bindBaseInput({
            tooltip: i18n("OPTION DESCRIPTION"),
            placeholder: i18n("OPTION DESCRIPTION"),
            errorMsg: i18n("INVALID LENGTH"),
        });
        
        _self.view.optionInput.ctrl.input._input.attr('maxlength',12);
        _self.view.descriptionInput.ctrl.input._input.attr('maxlength',60);
        
    },
    _bindTable: function(options) {
        var _self = this;
        var options = _self.prepareOptions(options);
        _self.view.optionsTable.empty();

        _self.view.optionsTable.ctrl = _self.view.optionsTable.bindBaseTable({
            hasCheckboxes: true,
            hasActions:true,
            hasFlags: true,
           
            headers:[ 
           
            {
                text: i18n('OPTION'),
                width:"70px",
                type:"text" 
            },{
                text: i18n('DESCRIPTION'),
                width:"330px",
                type:"text" 
            }
            ],

            body: options
        });
        _self.view.optionsTable.checkboxHeader = _self.view.optionsTable.find('.checkbox-header .header-wrapper');
        _self.view.optionsTable.checkboxHeader.empty();
        _self.view.optionsTable.checkboxHeader.html("Default");
        _self.view.optionsTable.checkboxes = _self.view.optionsTable.find(".td.checkbox>input");
       

        _self.addTableEvents();
    },
    onCheckboxClick: function() {
        var _self = this;
        _self.view.optionsTable.checkboxes.removeAttr('checked');
        for (var i = 0; i < _self.options.length; i++) {
            _self.options[i].checked = false;
        }
    },
    addEvents: function() {
        var _self = this;
        var action = [];
     

        _self.view.addButton.on('click', function() {
            var newOption = {
                option: _self.view.optionInput.ctrl.getText(),
                description: _self.view.descriptionInput.ctrl.getText()  
            }
            _self.options.push(newOption);
            _self._bindTable(_self.options);
            _self.view.optionInput.empty();
            _self.view.descriptionInput.empty();
            _self._bindOptionDescription();
        });
    },
    addTableEvents: function() {
        var _self = this;
        _self.view.optionsTable.checkboxes.unbind( "click" );
        _self.view.optionsTable.find('.td.checkbox').unbind('dblclick');

        _self.view.optionsTable.checkboxes.on('click', function(event) {
            var rowindex = $(this).closest('.tr').index();
            
            var isChecked = $(this).is(':checked');
            _self.onCheckboxClick();
            if(isChecked){
                $(this).attr('checked', 'checked');
                _self.options[rowindex].checked = true;
            }
            event.stopPropagation();
        });

        _self.view.optionsTable.find('.td.checkbox').on('dblclick', function(event) {
            var rowindex = $(this).closest('.tr').index();
            
            var isChecked = $(this).find('input').is(':checked');
            _self.onCheckboxClick();
            if(!isChecked){
                $(this).find('input').attr('checked', 'checked');
                _self.options[rowindex].checked = true;
            }
            event.stopPropagation();
        });
    },
    prepareOptions: function(options){
        var id = 0;
        var _self = this;

        var processedOptions = options.map(function(element){
            var option = {};
            option.actions =[];
            option.id = id++;
             option.actions.push({
                iconFont: "Sign-and-Symbols",
                icon: "persign",
                onPress: function() {
                    _self.deleteField(option.id);
                   
                },
                color : "#1B425E",
                tooltip: i18n('TRASH')
                });
           
            option.content = [];
            option.content.push(element.option);
            option.content.push(element.description);
            return option;
        });
 
        return processedOptions;
    },
    validateFixedManualField: function() {
        var _self = this;
        if (_self.view.fieldInput.ctrl.getText() === "") {
            return false;
        }
        if (_self.options.length <= 0) {
            return false;
        }
        return true;
    },
    getFixedManualFieldData: function() {
        var _self = this;
        if (_self.validateFixedManualField()) {
            return _self.getOwnData();
        }
        $.baseToast({
            type: 'W',
            text: i18n('FILL ALL REQUIRED FIELDS')
        });

    },
    getOwnData: function() {
        var _self = this;
        var data = {
            name: _self.view.fieldInput.ctrl.getText(),
            required: _self.view.requiredCheckbox.ctrl.getChecked(),
            options: _self.options
        }
        return data;
    },
    setFixedManualFieldData: function(fixedManualField) {
        var _self = this;
        if (fixedManualField) {
            _self.view.fieldInput.ctrl.setText(fixedManualField.name);
            _self.view.requiredCheckbox.ctrl.setChecked(fixedManualField.required);
            _self.options = fixedManualField.options;
            _self._bindTable(_self.options);
            _self.updateCheckboxes();
        }
    },
    updateCheckboxes: function() {
        var _self = this;
        var rows = _self.view.find('.tr');
        for (let i = 0; i < _self.options.length; i++) {
            if(_self.options[i].checked){
                rows.eq(i + 1).find('.td.checkbox>input').attr('checked', 'checked');;
                return;
            }
        }
    },
    deleteField : function(idRow){
        var _self = this;
            var id = 0;
        _self.options.map(function(element){
            if( idRow === id ){
              _self.options.splice(id, 1)
            }
            id++;
        });             
        _self._bindTable(_self.options); 
    }
});
