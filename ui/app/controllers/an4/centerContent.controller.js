sap.ui.controller('app.controllers.an4.centerContent', {
	onInit: function(){
	},
	onDataRefactor: function(data){
		this.data = {
		    "ruleTest": {
		        "params": {
		            "m0": {
		                "type": "NVARCHAR",
		                "text": "Empresa1"
		            },
		            "m1": {
		                "type": "NVARCHAR",
		                "text": "CFOP1"
		            },
		            "m2": {
		                "type": "INTEGER",
		                "text": "ValorICMS1"
		            },
		            "m3": {
		                "type": "NVARCHAR",
		                "text": "Empresa2"
		            },
		            "m4": {
		                "type": "INTEGER",
		                "text": "ValorICMS2"
		            },
		        }
		    }
		};
		$.extend(data, {
			addButton: {
				class: 'defineClass',
				hasTransition: true,
				iconFont: 'Sign-and-Symbols',
				icon: 'plussign',
				text: 'Add Rule'
			}
		});
	},
	onAfterRendering: function(html){
		var self = this;
		self.view = $(html);

		self.view.ruleToolbar = self.view.find('.ruleToolbar');
		self.view.ruleList = self.view.find('.rule-list');

		self.bindElements();
	},
	bindElements: function(){
		var self = this;

		var rules = Object.keys(self.data.ruleTest.params);
		for (var i = rules.length - 1; i >= 0; i--) {
			self.view.ruleList.bindLayoutRule(
				$.extend(self.data.ruleTest.params[rules[i]], {
					id: rules[i]
				})
			);
		};
	}
});