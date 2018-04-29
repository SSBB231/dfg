sap.ui.controller("app.controllers.editor.groups.groupByDate",{
    onInit: function(){
        
    },
    onDataRefactor: function(data){
        
    },
    onAfterRendering: function(html){
        var _self = this;
        _self.view = $(html);
        _self.view.fieldSelect = _self.view.find(".date-field-select");
        _self.view.groupByRB = _self.view.find(".filter-by-rb");
        _self.bindElements();
    },
    bindElements: function(){
        var _self = this;
        var _data = _self.getData();
        var dateOptions = [];
        for(var i = 0; i < _self.coreServices.layoutObject.structure.length; i++){
            if(Number(_self.coreServices.layoutObject.structure[i].id) === Number(_data.idStructure)){
                for (var field in _self.coreServices.layoutObject.structure[i].fields){
                    if(_self.coreServices.layoutObject.structure[i].fields[field].type === "TIMESTAMP" || _self.coreServices.layoutObject.structure[i].fields[field].type === "DATE")
                    {
                        dateOptions.push({
                            key:_self.coreServices.layoutObject.structure[i].fields[field].ID,
                            name: _self.coreServices.layoutObject.structure[i].fields[field].label
                        });
                    }
                    
                }
                break;
            }
        }
        _self.view.fieldSelect.ctrl = _self.view.fieldSelect.bindBaseSelect({
            tooltip: i18n("FIELD SELECT TOOLTIP"),
            placeholder: i18n("SELECT FIELD PLACEHOLDER"),
            options: dateOptions,
            required: true
        });
        _self.view.groupByRB.day = _self.view.groupByRB.bindBaseRadioButton({
        	id: 1,
        	text: i18n("DAY"),
        	tooltip:  i18n("SELECT DAY TOOLTIP"),
        	name: 'date-rb',
        	onChange: function(oldVal, newVal) {}
        });
        _self.view.groupByRB.month = _self.view.groupByRB.bindBaseRadioButton({
        	id: 1,
        	text: i18n("MONTH"),
        	tooltip:  i18n("SELECT MONTH TOOLTIP"),
        	name: 'date-rb',
        	onChange: function(oldVal, newVal) {}
        });
        _self.view.groupByRB.year = _self.view.groupByRB.bindBaseRadioButton({
        	id: 1,
        	text: i18n("YEAR"),
        	tooltip:  i18n("SELECT YEAR TOOLTIP"),
        	name: 'date-rb',
        	onChange: function(oldVal, newVal) {}
        });
        if(_data.groupByDate){
            _self.view.fieldSelect.ctrl.setKey(_data.groupByDate.fieldId);
            if(_data.groupByDate.groupBy === "DAY"){
                _self.view.groupByRB.day.setChecked(true);
            }
            if(_data.groupByDate.groupBy === "MONTH"){
                _self.view.groupByRB.month.setChecked(true);
            }
            if(_data.groupByDate.groupBy === "YEAR"){
                _self.view.groupByRB.year.setChecked(true);
            }
        }
    },
    isValid: function(){
      var self = this;
      return self.view.fieldSelect.ctrl.validate();
    },
    getGroupByDate: function(){
        var self = this;
        var item = {};
        item.fieldId = self.view.fieldSelect.ctrl.getKey();
        if(self.view.groupByRB.day.getChecked()){
            item.groupBy = "DAY";
        }
        if(self.view.groupByRB.month.getChecked()){
            item.groupBy = "MONTH";
        }
        if(self.view.groupByRB.year.getChecked()){
            item.groupBy = "YEAR";
        }
        return item;
    }
});