/*global i18n Data*/
sap.ui.controller("app.controllers.executor.an3Dialog.an3Dialog", {
	onInit: function() {
		this.data = {
			description: {
				'class': "textarea-class",
				id: "textarea-id"
			}
		};
	},
	onDataRefactor: function(data) {

		return $.extend(data, this.data);
	},
	onAfterRendering: function(html) {
		var _self = this;
		_self.view = $(html);
		_self.loader = _self.view.baseLoader({
			modal: true
		});
		_self.view.name = _self.view.find(".name-input");
		_self.view.description = _self.view.find(".description-input");
		_self.view.rule = _self.view.find(".rule-input");
		_self.bindComponents();
	},
	bindComponents: function() {
		var _self = this;
		var _data = _self.getData();
		_self.view.name.ctrl = _self.view.name.bindBaseInput({
			required: true,
			tooltip: i18n("FILL IN FILE NAME TOOLTIP"),
			placeholder: i18n("FILL IN FILE NAME")
		});
		_self.view.description.ctrl = _self.view.description.find('textarea');
		_self.view.description.ctrl.attr('placeholder', i18n('FILE DESCRIPTION'));
		_self.view.rule.ctrl = _self.view.rule.bindBaseMultipleSelect3({
			required: true,
			tooltip: i18n("SELECT RULE TOOLTIP"),
			placeholder: i18n("SELECT RULE"),
			options: _data.rules.map(function(rule) {
				return {
					key: rule.id,
					name: "ID"+rule.id+"-"+rule.name
				};
			})
		});
	},
	createAN3: function() {
		var _self = this;
		var data = _self.getData();
		if (_self.validate()) {
			var an3 = {
				name: _self.view.name.ctrl.getText(),
				description: _self.view.description.ctrl.val(),
				idLayoutVersion: data.idLayoutVersion,
				origin: 1,
				idRules: _self.view.rule.ctrl.getKeys(),
				digitalFile: data.digitalFile
			};
			_self.loader.open(); 

			Data.endpoints.dfg.an3.create.post(an3).success(function(data) {
				_self.loader.close();
                _self.getParentDialog().close();
                window.location = "#/executoran3?id="+data.id;
				return;
			}).error(function(error) {
				_self.loader.close();
			});
		} else {
			$.baseToast({
				type: "W",
				text: i18n("FILL ALL REQUIRED FIELDS")
			});
		}
	},
	validate: function() {
		var _self = this;
		return _self.view.name.ctrl.getText() !== "" && _self.view.rule.ctrl.getKeys().length !== 0;
	}
});