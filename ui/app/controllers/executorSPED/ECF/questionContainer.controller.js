sap.ui.controller("app.controllers.executorSPED.ECF.questionContainer", {
	onInit: function() {},
	onDataRefactor: function(data) {

	},
	onAfterRendering: function(html) {
		var _self = this;
		_self.view = $(html);
		_self.view.answer = _self.view.find(".answer");
		_self.view.answerInput = _self.view.find(".answerInput");
		_self.bindElements();
	},
	bindElements: function() {
		var _self = this;
		var data = _self.getData();

		if (data.id === 31 || data.id === 32 || data.id === 33) {
		    
			_self.view.answer.ctrl = _self.view.answer.bindBaseInput({
			   
			});
			_self.view.answer.attr("id", data.id);

		} else if (data.id === 34) {
			for (var i = 0; i < data.options.length; i++) {
				_self.view.answer.ctrl = _self.view.answer.bindBaseRadioButton({
					id: data.id,
					name: data.id,
					text: data.options[i].name,
					onChange: function(oldVal, newVal) {}
				});
				_self.view.answer.attr("id", data.id);
			}
			_self.view.answerInput.ctrl = _self.view.answerInput.bindBaseInput({});

		} else {
			for (var i = 0; i < data.options.length; i++) {
				_self.view.answer.ctrl = _self.view.answer.bindBaseRadioButton({
					id: data.id,
					name: data.id,
					text: data.options[i].name,
					onChange: function(oldVal, newVal) {

					}
				});
				_self.view.answer.attr("id", data.id);
			}
		}

	}
});