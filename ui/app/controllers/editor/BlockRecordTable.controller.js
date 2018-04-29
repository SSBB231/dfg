sap.ui.controller("app.controllers.editor.BlockRecordTable", {
	onInit: function() {
	},

	onAfterRendering: function(html) {
		var _self = this;
		_self.view = $(html);
	},
	renderBlockRecordTable: function(){
		var _self = this;
	
		_self.layoutObject = _self.coreServices.layoutObject;
		
		//Prepare table Data
		var bodyData = [];

		for(var i in _self.layoutObject.blocks){
			var blockName;
			if(_self.layoutObject.blocks[i].name){
				blockName = _self.layoutObject.blocks[i].name;
			}else{
				blockName = i;
			}
			for(var j in _self.layoutObject.blocks[i].records){
				var recordName;
				if(_self.layoutObject.blocks[i].records[j].name){
					recordName = _self.layoutObject.blocks[i].records[j].name;
				}else{
					recordName = j;
				}

				var currLine = {};
				currLine.id = i + '-' + j;
				currLine.content = [];
				currLine.content.push(blockName);
				currLine.content.push(recordName);
				currLine.content.push('');
				currLine.content.push('');
				bodyData.push(currLine);
			}
		}
		
		$(".block-record-table-wrapper").html('');
		_self.blockRecordTable = $(".block-record-table-wrapper").bindBaseTable({
			//hasActions: true,
			hasCheckboxes: true,
			hasExpand: true,
			headers: [{
				text: i18n('BLOCK'),
				sort: true,
				width: "50px"
			},{
				text: i18n('RECORD'),
				sort: true,
				width: "50px"
			},{
				text: i18n('STRUCTURE'),
				sort: true,
				width: "200px"
			},{
				text: i18n('DISTINCT'),
				sort: true,
				width: "50px"
			}],
			body: bodyData
		});
		_self.structureSelects = [];
		_self.distinctChecks = [];
		var structureOptions = [];
		for(var i in _self.coreServices.structure){
			structureOptions.push({
				key: i,
				name: _self.coreServices.structure[i].title
			})
		}

		_self.view.find('.tr').each(function(index, val){

			if(index > 0){
				var currId = $(val).data('id').split('-');
				//Process Selects for the structures
				_self.structureSelects.push(
					$(val).find('div:nth-child(4)').bindBaseSelect({
						options: structureOptions,
						onChange: function(oldVal, newVal) {
							console.log(val)
							var _selfSelect = this;
							if(oldVal.key && oldVal.key != newVal.key && newVal.key != _self.layoutObject.blocks[this.getData().blockId].records[this.getData().recordId].idStructure){
								var currColumns = _self.layoutObject.blocks[this.getData().blockId].records[this.getData().recordId].columns;
								var hasColumns = false;
								for(var i in currColumns){
									if(i != 'recordId' && currColumns[i].fieldId){
										hasColumns = true;
									}
								}
								if(hasColumns){
									_self.changeDialog =  $.baseDialog({
										title: i18n('SYSTEM ALERT'),
										modal: true,
										size: "small",
										outerClick: 'disabled',
										viewName: "app.views.dialogs.Alert",
										cssClass: "dfg-alert",
										viewData: {
											text: i18n('CHANGE STRUCTURE WARNING')
										},	
										buttons: [{
											name: i18n('NO'),
											isCloseButton: true,
											click: function(){
												//_self.changeDialog.close();
												_selfSelect.setKey(oldVal.key);
												$.baseToast({text: i18n('STRUCTURE NOT CHANGED'), isSuccess: true});
											}
										},{
											name: i18n('YES'),
											click: function(){
												_self.changeDialog.close();
												for(var i in currColumns){
													if(i != 'recordId'){
														delete currColumns[i];
													}
												}
												_self.layoutObject.blocks[_selfSelect.getData().blockId].records[_selfSelect.getData().recordId].positions = []
												for(var i in currColumns){
													_self.layoutObject.blocks[_selfSelect.getData().blockId].records[_selfSelect.getData().recordId].positions.push(i);
												}
												_self.layoutObject.blocks[_selfSelect.getData().blockId].records[_selfSelect.getData().recordId].idStructure = newVal.key;
												$.baseToast({text: i18n('FIELD DELETED SUCCESSFULLY'), isSuccess: true});
											}
										}]
									});
									_self.changeDialog.open();
								}else{
									_self.layoutObject.blocks[this.getData().blockId].records[this.getData().recordId].idStructure = newVal.key;
								}
								if(oldVal !== newVal){
									_self.coreServices.hasChanged = true;
								}
							}
						},
						blockId: currId[0],
						recordId: currId[1]
					})
				)
			
				_self.structureSelects[index - 1].setKey(_self.layoutObject.blocks[currId[0]].records[currId[1]].idStructure);

				//Process Checks for Distinct
				_self.distinctChecks.push(
					$(val).find('div:nth-child(5)').bindBaseCheckbox({
						id: "dcb" + index - 1,
						onChange: function(oldVal, newVal){
							_self.layoutObject.blocks[this.getData().blockId].records[this.getData().recordId].isDistinct = newVal;
							if(oldVal!==newVal){
								_self.coreServices.hasChanged = true;								
							}
						},
						blockId: currId[0],
						recordId: currId[1]
					})
				);
				_self.distinctChecks[index - 1].setChecked(_self.layoutObject.blocks[currId[0]].records[currId[1]].isDistinct);
			}
		})
	}
});