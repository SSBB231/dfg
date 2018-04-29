sap.ui.controller("app.controllers.dialogs.IdRecordDialog", {
	onAfterRendering: function( html ){
		var _self = this;
		_self.typeConfigIdRecord = {
			NONE: 0,
			ONLY_BLOCK: 1,
			ONLY_RECORD: 2,
			BOTH: 3,
		};
		$.extend( _self, _self.getData() );
		if(_self.initLevel){
		    for(var p in _self.initLevel){
		        _self[p] = _self.initLevel[p];
		    }
		}
		_self.block = JSON.parse(JSON.stringify(_self.coreServices.layoutObject.blocks[ _self.blockId ]));
		_self.record = _self.block.records[ _self.recordId ];
		_self.column = _self.record.columns[ _self.columnId ] || {
		    "recordId": {}
		};
		_self.view = $(html);
		_self.view.chkBloco = _self.view.find("#chkBloco");
		_self.view.chkRegistro = _self.view.find("#chkRegistro");
		_self.view.chkLayout = _self.view.find("#chkLayout");
		_self.bindElements();
	},
	bindElements: function(){
		var _self = this;
		_self.view.chkBloco.ctrl = _self.view.chkBloco.bindBaseCheckbox({
			text: i18n("BLOCK"),
			onChange: function( oldVal, newVal ){}
		});
		_self.view.chkRegistro.ctrl = _self.view.chkRegistro.bindBaseCheckbox({
			text: i18n("RECORD"),
			onChange: function( oldVal, newVal ){}
		});
		_self.view.chkLayout.ctrl = _self.view.chkLayout.bindBaseCheckbox({
			text: i18n("REPLICATE FOR ALL LAYOUT"),
			onChange: function( oldVal, newVal ){}
		});
		_self.initElements();
	},
	initElements: function(){
		var _self = this;
		var hasRecordId = false;
		var hasBlockId = false;
		if( _self.column.hasOwnProperty("recordId") ){
			if( typeof( _self.column.recordId ) !== "object" ){
				hasRecordId = true;
			}else{
				if( _self.column.recordId.hasOwnProperty("recordId") ){
					hasRecordId = true;
				}
				if( _self.column.recordId.hasOwnProperty("blockId") ){
					hasBlockId = true;
				}
			}
		}
		_self.view.chkBloco.ctrl.setChecked( hasBlockId );
		_self.view.chkRegistro.ctrl.setChecked( hasRecordId );
		_self.view.chkLayout.ctrl.setChecked( Boolean(_self.coreServices.layoutObject.configIdRecord ) );
	},
	validate: function(){
	    return true;
	},
	getColumnData: function(){
	    var _self = this;
        var block = _self.coreServices.layoutObject.blocks[_self.blockId];
        var record = block.records[_self.recordId];
	    _self.updateIdRecord();
	    var column = _self.column;
	   
	    switch (_self.idNewConfig) {
            case _self.typeConfigIdRecord.ONLY_BLOCK:
                column.recordId = {
                    blockId: block.name
                };
                break;
            case _self.typeConfigIdRecord.ONLY_RECORD:
                column.recordId = record.name;
                break;
            case _self.typeConfigIdRecord.BOTH:
                column.recordId = {
                    recordId: record.name,
                    blockId: block.name
                };
                break;

        }
	    return  column ; 
	},
	updateIdRecord: function(){
		var _self = this;
		var idNewConfig = _self.typeConfigIdRecord.NONE;
		var isSelectedBloco = _self.view.chkBloco.ctrl.getChecked(); 
		var isSelectedRecord = _self.view.chkRegistro.ctrl.getChecked(); 
		if( isSelectedBloco || isSelectedRecord ){
			if( isSelectedBloco ){
				idNewConfig = _self.typeConfigIdRecord.ONLY_BLOCK;
				if( isSelectedRecord ){
					idNewConfig = _self.typeConfigIdRecord.BOTH;
				}
			}
			if( isSelectedRecord ){
				if( !isSelectedBloco ){
					idNewConfig = _self.typeConfigIdRecord.ONLY_RECORD;
				}
			}
			_self.idNewConfig = idNewConfig;
			if( !_self.view.chkLayout.ctrl.getChecked() ){
				_self.coreServices.layoutObject.configIdRecord = _self.typeConfigIdRecord.NONE;
			}else if( idNewConfig !==  _self.coreServices.layoutObject.configIdRecord){
				var alertDialog = $.baseDialog({
					title: i18n("SYSTEM ALERT"),
					modal: true,
					size: "small",
					disableOuterClick: true,
					text: i18n("DFG102007"),
					buttons: [{
						name: i18n("NO"),
						isCloseButton: true,
					},{
						name: i18n("YES"),
						click: function(){
						    
						    _self.coreServices.layoutObject.positions.map(function(pos){
						        var block = _self.coreServices.layoutObject.blocks[pos];
						        block.positions.map(function(recordPos){
						            var record = block.records[recordPos];
						            for(var c in record.columns){
						                if(record.columns[c].recordId){
						                    _self.setIdRecordConfig(pos,recordPos,c,idNewConfig);
						                }
						            }
						        })
						    });
							_self.coreServices.layoutObject.configIdRecord = idNewConfig;				
							alertDialog.close();
							_self.getParentDialog().close();
						}
					}]
				});
				alertDialog.open();
				return false;
			}else{
				_self.coreServices.layoutObject.configIdRecord = idNewConfig;				
			}
			
			return true;			
		}else{
			$.baseToast({
				text: i18n("DFG102008"),
				isError: true
			});
			return false;
		}
	},
	setIdRecordConfig: function(blockId,recordId,columnId,newIdConfig){
	     var _self = this;
        var block = _self.coreServices.layoutObject.blocks[blockId];
        var record = block.records[recordId];
        var column = record.columns[columnId];
        if (!column.hasOwnProperty("recordId")) { 
            return;  
        }
        var label = $(".record-wrapper[block-id='"+blockId+"'][record-id='"+recordId+"'] [column-id='"+columnId+"'] .field-label")[0];
        switch (newIdConfig) {
            case _self.typeConfigIdRecord.ONLY_BLOCK:
                column.recordId = {
                    blockId: block.name
                };
                label.textContent = "ID " + i18n("BLOCK");
                break;
            case _self.typeConfigIdRecord.ONLY_RECORD:
                column.recordId = record.name;
                label.textContent= "ID " + i18n("RECORD");
                break;
            case _self.typeConfigIdRecord.BOTH:
                column.recordId = {
                    recordId: record.name,
                    blockId: block.name
                };
                label.textContent = "ID " + i18n("BLOCK") + " + ID " + i18n("RECORD");
                break;

        }
	}
});