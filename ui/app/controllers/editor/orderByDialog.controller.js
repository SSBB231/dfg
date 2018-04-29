sap.ui.controller("app.controllers.editor.orderByDialog",{
   onInit: function(){
       
   },
   onAfterRendering:function(html){
       var _self = this;
       _self.view = $(html);
       _self.view.orderField = _self.view.find(".order-field-select");
       _self.view.sortType = _self.view.find(".sort-select");
       _self.bindComponents();
   },
   bindComponents: function(){
       var _self = this;
       var data = _self.getData();
       var columns = [];
       var record = _self.coreServices.layoutObject.blocks[data.parentBlockId].records[data.parentRecordId];
       for (var i = 0; i < record.positions.length; i++) {
            if (record.columns[record.positions[i]].fieldId && record.columns[record.positions[i]].fieldId !== null && !isNaN(parseInt(record.columns[record.positions[i]].fieldId,10))) {
                var field = _self.coreServices.structure[record.columns[record.positions[i]].idStructure].fields[record.columns[record.positions[i]].fieldId];
                columns.push({
                    key: field.ID,
                    name: field.label
                });
            } else {
                if (record.columns[record.positions[i]].recordId) {
                    columns.push({
                        key: record.positions[i],
                        name: "ID " + i18n("RECORD")
                    });
                } else if (record.columns[record.positions[i]].filler) {
                    columns.push({
                        key: record.positions[i],
                        name: record.columns[record.positions[i]].filler.name
                    });
                } else if (record.columns[record.positions[i]].manualParam) {
                    columns.push({
                        key: record.positions[i],
                        name: record.columns[record.positions[i]].manualParam.label
                    });
                } else if (record.columns[record.positions[i]].formula) {
                    columns.push({
                        key: record.positions[i],
                        name: record.positions[i]
                    });
                } else if (record.columns[record.positions[i]].fixedManualField) {
                    columns.push({
                        key: record.positions[i],
                        name: record.columns[record.positions[i]].fixedManualField.name
                    });
                } else if (record.columns[record.positions[i]].fixedField) {
                    columns.push({
                        key: record.positions[i],
                        name: record.columns[record.positions[i]].fixedField.name
                    });
                } else if (record.columns[record.positions[i]].version) {
                    columns.push({
                        key: record.positions[i],
                        name: record.columns[record.positions[i]].version.id
                    });
                } else if (record.columns[record.positions[i]].output) {
                    columns.push({
                        key: record.positions[i],
                        name: record.columns[record.positions[i]].output.label
                    });
                } else if (record.columns[record.positions[i]].isRecordsTotals) {
                    columns.push({
                        key: record.positions[i],
                        name: i18n("RECORDTOTAL")
                    });
                } else if (record.columns[record.positions[i]].isBlocksTotals) {
                    columns.push({
                        key: record.positions[i],
                        name: i18n("BLOCKTOTAL")
                    });
                } else if (record.columns[record.positions[i]].isTotalsAll) {
                    columns.push({
                        key: record.positions[i],
                        name: i18n("TOTALALL")
                    });
                } else if (record.columns[record.positions[i]].isReferencePeriod) {
                    columns.push({
                        key: record.positions[i],
                        name: record.columns[record.positions[i]].label
                    });
                } else if (record.columns[record.positions[i]].isFinalDateReference === true) {
                    columns.push({
                        key: record.positions[i],
                        name: i18n("FINALDATEREFERENCE")
                    });
                } else if (record.columns[record.positions[i]].isInitialDateReference === true) {
                    columns.push({
                        key: record.positions[i],
                        name: i18n("INITDATEREFERENCE")
                     });
                } else if (record.columns[record.positions[i]].sequenceField){
                    columns.push({
                        key: record.positions[i],
                        name: i18n("SEQUENCE")
                    });
                }

            }

        }
        _self.view.orderField.ctrl = _self.view.orderField.bindBaseMultipleSelect3({
            required: true,
            disableSort: true,
            options: columns,
            tooltip: i18n('FIELD SELECT TOOLTIP')
        });
        _self.view.sortType.ctrl  = _self.view.sortType.bindBaseSelect({
            required: true,
            disableSort: true,
            options: [{
                key: "ASC",
                name: i18n("ASCENDANT")
            },{
                key: "DESC",
                name: i18n("DESCENDANT")
            }],
            tooltip: i18n("SORT ORDER TOOLTIP")
        });
        if(record.orderBy){
            if(!_.isEmpty(record.orderBy.columns) &&  !_.isNumber(record.orderBy.columns[0])){
                let selected = _.map(record.orderBy.columns, function(order){
                   return  record.columns[order].fieldId;
                });
                
                _self.view.orderField.ctrl.setKey(selected);
                
            }else{
                _self.view.orderField.ctrl.setKey(record.orderBy.columns);
            }
            _self.view.sortType.ctrl.setKey(record.orderBy.order);
        }
   },
   validate: function(){
       var _self = this;
       var valid = true;
       valid =  _self.view.orderField.ctrl.validate();
       valid = _self.view.sortType.ctrl.validate();
       return valid;
   },
   getOrderData: function(){
       var _self = this;
       return  {
           columns: _self.view.orderField.ctrl.getKeys(),
           order: _self.view.sortType.ctrl.getKey()
       };
   }
});