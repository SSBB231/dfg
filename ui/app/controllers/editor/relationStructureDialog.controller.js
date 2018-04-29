sap.ui.controller("app.controllers.editor.relationStructureDialog",{
   onInit: function(){
       
   },
   onAfterRendering: function(html){
       var _self = this;
       var _data = _self.getData();
       _self.view = $(html);
       _self.view.relationStructureSelect = _self.view.find(".relation-structure-select");
       _self.bindElements();
       var idStructure = _self.coreServices.layoutObject.blocks[_data.parentBlockId].records[_data.parentRecordId].idStructure;
       
       _self.loader = _self.view.baseLoader({
           modal: true
       });
       _self.loader.open();
       Data.endpoints.atr.getStructureRelations.post({idStructure: idStructure}).success(function(data){
           var validRelations = [];
           for(var relation = 0; relation < data.length; relation++){
               if((idStructure.indexOf(data[relation].structureId1)!==-1 ||idStructure.indexOf(data[relation].structureId1 +"")!==-1 ) && (idStructure.indexOf(data[relation].structureId2) !== -1 || idStructure.indexOf(data[relation].structureId2+"") !== -1)){
                   validRelations.push({
                        key: data[relation].id,
                        name: data[relation].structure1.title + " - "+data[relation].structure2.title
                   });
               }
           }
           if(validRelations.length){
               _self.bindComponents(validRelations);
           }
           _self.loader.close();
       });
   },
   bindElements: function(){
       var _self = this;
       _self.view.relationStructureSelect.ctrl = _self.view.relationStructureSelect.bindBaseMultipleSelect3({
           tooltip: i18n("SELECT STRUCTURE RELATION TOOLTIP"),
           placeholder: i18n("SELECT STRUCTURE RELATION"),
           isLoading: true,
           isRequired: true
       });
   },
   bindComponents: function(validRelations){
       var _self = this;
       var _data = _self.getData();
       _self.view.relationStructureSelect.empty();
       _self.view.relationStructureSelect.ctrl = _self.view.relationStructureSelect.bindBaseMultipleSelect3({
           tooltip: i18n("SELECT STRUCTURE RELATION TOOLTIP"),
           placeholder: i18n("SELECT STRUCTURE RELATION"),
           options: validRelations,
           isRequired: true
       });
       if(_self.coreServices.layoutObject.blocks[_data.parentBlockId].records[_data.parentRecordId].structureRelation){
           _self.view.relationStructureSelect.ctrl.setKey(_self.coreServices.layoutObject.blocks[_data.parentBlockId].records[_data.parentRecordId].structureRelation);
       }
   },
   validate: function(){
       var self = this;
       return self.view.relationStructureSelect.ctrl.validate();
   },
   getStructureRelation: function(){
       var self = this;
       return self.view.relationStructureSelect.ctrl.getKeys();
   }
});