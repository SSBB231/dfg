/*global i18n*/
sap.ui.controller("app.controllers.dialogs.groupedLinesDialog",{
   onInit: function(){
       
   },
   onAfterRendering: function(html){
       var _self = this;
       _self.view = $(html);
       _self.view.name = _self.view.find(".input-name");
       _self.view.structure = _self.view.find(".structure-select");
       _self.view.group = _self.view.find(".group-select");
       _self.bindElements();
   },
   bindElements: function(){
       var _self = this;
       var _data = _self.getData();
       _self.view.name.ctrl = _self.view.name.bindBaseInputKat({
           "label": i18n("NAME"),
           "placeholder": i18n("TILE LAYOUT NAME TOOLTIP"),
           "required": true,
           "tooltip": i18n("CLICK/PRESS TO")+ " "+i18n("TILE LAYOUT NAME TOOLTIP")
       });
       _self.view.name.ctrl.setValue(i18n("GROUPED LINES FIELD"));
       if(_data.initLevel.blockId && _data.initLevel.recordId){
           var structures = [];
           var addedIds = [];
           var blockId = _data.initLevel.blockId;
           var recordId = _data.initLevel.recordId;
           var structureIds = $.blockBuilder.json.blocks[blockId].records[recordId].idStructure;
           structureIds.map(function(id){
               if(addedIds.indexOf(id+"") === -1){
                   addedIds.push(id+"");
                   structures.push({
                       key: id,
                       "name": _self.coreServices.structure[id].title
                   });
               } 
           });
           _self.view.structure.ctrl = _self.view.structure.bindBaseInputKat({
               "options": structures,
               "label": i18n("STRUCTURE"),
               "placeholder": i18n("FILE STRUCTURE"),
               "tooltip": i18n("FILE STRUCTURE TOOLTIP"),
               "required": true,
               "onChange": _self.onChangeStructure.bind(_self)
           });
       }
       _self.view.group.ctrl = _self.view.group.bindBaseInputKat({
           "label": i18n("GROUP"),
           "options": [],
           "isDisabled": true,
           "placeholder": i18n("SELECT GROUP"),
           "tooltip": i18n("CLICK/PRESS TO")+ " " + i18n("SELECT GROUP")
       });
       if(_data.initLevel.columnId){
           var column = $.blockBuilder.json.blocks[_data.initLevel.blockId].records[_data.initLevel.recordId].columns[_data.initLevel.columnId];
           if(column){
             _self.view.name.ctrl.setValue(column.label);
             _self.view.structure.ctrl.setKey(column.groupedLines.structureId);
           }
       }
      
   },
   onChangeStructure: function(oldVal, newVal){
       var _self = this;
       var _data = _self.getData();
       _self.view.group.empty();
       var groups = [];
       if(_data.initLevel.blockId && _data.initLevel.recordId){
           var blockId = _data.initLevel.blockId;
           var recordId = _data.initLevel.recordId;
           if($.blockBuilder.json.groups && $.blockBuilder.json.groups.blocks[blockId] && 
           $.blockBuilder.json.groups.blocks[blockId].records[recordId] &&
            $.blockBuilder.json.groups.blocks[blockId].records[recordId].structures[newVal.key]){
                if( $.blockBuilder.json.groups.blocks[blockId].records[recordId].structures[newVal.key].groups &&  $.blockBuilder.json.groups.blocks[blockId].records[recordId].structures[newVal.key].groups.length){
                     $.blockBuilder.json.groups.blocks[blockId].records[recordId].structures[newVal.key].groups.map(function(group){
                         groups.push({
                             "key": group.ID,
                             "name": group.name
                         });
                     });
                }
            }
       }
       _self.view.group.ctrl = _self.view.group.bindBaseInputKat({
           "label": i18n("GROUP"), 
           "options": groups,
            disableSort: true,
           "placeholder": i18n("SELECT GROUP"),
           "required": true,
           "tooltip": i18n("CLICK/PRESS TO")+ " " + i18n("SELECT GROUP")
       });
        if(_data.initLevel.columnId){
           var column = $.blockBuilder.json.blocks[_data.initLevel.blockId].records[_data.initLevel.recordId].columns[_data.initLevel.columnId];
           if(column){
                _self.view.group.ctrl.setKey(column.groupedLines.groupId);
            }
       }
   },
   getColumnData: function(){
       var _self = this;
       return {
           "label": _self.view.name.ctrl.getValue(),
           "groupedLines": {
               "structureId": _self.view.structure.ctrl.getKey(),
               "groupId": _self.view.group.ctrl.getKey()
           }
       };
   },
   validate: function(){
       var _self = this;
       if(_self.view.name.ctrl.getText() === ""){
           return false;
       }
       if(_self.view.structure.ctrl.getKey() === undefined || _self.view.structure.ctrl.getKey() === null){
           return false;
       }
       if(_self.view.group.ctrl.getKey() === undefined || _self.view.group.ctrl.getKey() === null){
           return false;
       }
       return true;
   }
});