sap.ui.controller('app.controllers.dialogs.filters.CBGroup', {
	onInit: function() {

	},

	onAfterRendering: function(html) {
		var _self = this;
		_self.view = $(html);
		
		_self.fieldArea = _self.view.find('.list-fields');
		_self.fieldsRef = [];
		_self.groupData = _self.getData().groupData;
	
		_self.initData();
		_self.view.editBtn = _self.view.find(".iconEdit");
		_self.view.deleteBtn = _self.view.find('.iconDelete');

		_self.view.editBtn.attr('tabindex', '0');
		_self.view.editBtn.baseTooltip({
			class: "dark",
			position: "top",
			text: i18n('EDIT GROUP TOOLTIP'),
			width: 300
		});
		_self.view.editBtn.keydown(function(ev){
			if (ev.keyCode == 32 || ev.keyCode == 13) {
				this.click();
			}
		});

		_self.view.deleteBtn.attr('tabindex', '0');
		_self.view.deleteBtn.baseTooltip({
			class: "dark",
			position: "top",
			text: i18n('DELETE GROUP TOOLTIP'),
			width: 300
		});
		_self.view.deleteBtn.keydown(function(ev){
			if (ev.keyCode == 32 || ev.keyCode == 13) {
				this.click();
			}
		});

		_self.view.find('span.icon.icon-right').click(function(){
			if($(this).next().next().next('.list-fields').is(':visible')){
				$(this).removeClass('icon-down').addClass('icon-right');
			}else{
				$(this).removeClass('icon-right').addClass('icon-down');
			}
			$(this).next().next().next('.list-fields').slideToggle();
		});
		_self.view.find('span.icon.icon-down').click(function(){
			if($(this).next().next().next('.list-fields').is(':visible')){
				$(this).removeClass('icon-down').addClass('icon-right');
			}else{
				$(this).removeClass('icon-right').addClass('icon-down');
			}
			$(this).next().next().next('.list-fields').slideToggle();
		});

		_self.view.find('.icons .iconEdit').click(function(){
			if($(this).hasClass('ativo')){
				$(this).parent().parent().find('.nomeCase').removeClass('ativo').attr('disabled','disabled');
				$(this).find('.icon').removeClass('icon-font-Sign-and-Symbols').removeClass('icon-check-43').addClass('icon-font-Formatting-and-Tool').addClass('icon-pensil');	
				$(this).removeClass('ativo');
			}else{
				$(this).parent().parent().find('.nomeCase').removeAttr('disabled').addClass('ativo');
				$(this).find('.icon').removeClass('icon-pensil').removeClass('icon-font-Formatting-and-Tool').addClass('icon-check-43').addClass('icon-font-Sign-and-Symbols');
				$(this).addClass('ativo');
			}
		});

		_self.view.dblclick(function(){
			if($(this).hasClass('ativo')){
				$(this).find('.nomeCase').removeClass('ativo').attr('disabled','disabled');
				$(this).find('.iconEdit .icon').removeClass('icon-font-Sign-and-Symbols').removeClass('icon-check-43').addClass('icon-font-Formatting-and-Tool').addClass('icon-pensil');	
				$(this).removeClass('ativo');
			}else{
				$(this).find('.nomeCase').removeAttr('disabled').addClass('ativo');
				$(this).find('.iconEdit .icon').removeClass('icon-pensil').removeClass('icon-font-Formatting-and-Tool').addClass('icon-check-43').addClass('icon-font-Sign-and-Symbols');
				$(this).addClass('ativo');
			}
		});

		_self.view.find('.nomeCase').keypress(function(e) {
		    if(e.which == 13) {
		        if($(this).hasClass('ativo')){
					$(this).removeClass('ativo').attr('disabled','disabled');
					$(this).next().find('.icon.icon-check-43').removeClass('icon-font-Sign-and-Symbols').removeClass('icon-check-43').addClass('icon-font-Formatting-and-Tool').addClass('icon-pensil');	
					$(this).removeClass('ativo');
				}else{
					$(this).removeAttr('disabled').addClass('ativo');
					$(this).next().find('.icon.icon-pensil').removeClass('icon-pensil').removeClass('icon-font-Formatting-and-Tool').addClass('icon-check-43').addClass('icon-font-Sign-and-Symbols');
					$(this).addClass('ativo');
				}
		    }
		});

		_self.view.find('.icons .iconDelete').click(function(){
			_self.coreServices.deleteGroup($(this).closest('li.filter-group').index());
			$(this).closest('li.filter-group').remove();
		});

	},
	initData: function(){
		var _self = this;
		if(_self.groupData){
			_self.view.find('input.nomeCase').val(_self.groupData.name);
			for(var i = 0; i<_self.groupData.group.length; i++){
				_self.addField(_self.groupData.group[i]);
			}
		}else{
			_self.addField();
		}
	},
	addField: function(data){
		var _self = this;
		_self.fieldsRef.push(_self.fieldArea.bindCBField({
				parentFieldArea: _self.fieldArea,
				parentCtrl: _self,
				fieldData: data,
				structureFields: _self.getData().structureFields,
				recordFields: _self.getData().recordFields,
				parentAddField: function(){_self.addField()}
			})
		);
	},
	deleteField: function(fieldIndex){
		var _self = this;
		var newRef = []
		for (var i=0; i<_self.fieldsRef.length;i++){
			if(i != fieldIndex){
				newRef.push(_self.fieldsRef[i]);
			}
		}
		_self.fieldsRef = newRef;
		if(_self.fieldsRef.length === 0){
		    _self.view.find('.icons .iconDelete').click();
		}
	},
	getOwnData: function(){
		var _self = this;
		var returnObject = {};
		returnObject.name = _self.view.find('input.nomeCase').val();
		returnObject.group = [];
		for (var i=0; i<_self.fieldsRef.length; i++){
			returnObject.group.push(_self.fieldsRef[i].getOwnData());
		}
		return returnObject;
	}
});