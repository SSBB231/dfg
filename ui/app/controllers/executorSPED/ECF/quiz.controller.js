sap.ui.controller("app.controllers.executorSPED.ECF.quiz", {
	onInit: function() {},
	onDataRefactor: function(data) {

	},
	onAfterRendering: function(html) {
		var _self = this;
		var data = _self.getData();
		_self.view = $(html);
		_self.view.questions = _self.view.find(".questions");
		
		_self.bindElements();
		//_self.renderQuiz();
	},
	bindElements: function() {
		var _self = this;
		_self.ArrayQuestions = [];

		_self.answerYesNo = [{
			key: "a",
			name: i18n("YES")
                   }, {
			key: "b",
			name: i18n("NO")
                   }];
		_self.questionsAnswer = [
			{
				id: 1,
				question: i18n("ECF TYPE"),
				options: [{
						key: "a",
						name: i18n("ECF COMPANY WITH NOT SCP PARTICIPANT AS LEAD PARTNER")
               }, {
						key: "b",
						name: i18n("ECF SCP PARTICIPANT COMPANY AS LEAD PARTNER")
               }, {
						key: "c",
						name: i18n("ECF OF SCP ECF COMPANY WITH NO SCP PARTICIPANT AS LEAD PARTNER")
               }
        ]
      }, {
				id: 2,
				question: i18n("SUBJECT TO 15% RATE OF CSLL")
      }, {
				id: 3,
				question: i18n("IS COMPANY PART OF A CONSORTIUM")
      }, {
				id: 4,
				question: i18n("ADMINISTRATOR OF FUNDS OR INVESTMENTS CLUB")
      }, {
				id: 5,
				question: i18n("EXTERNAL OPERATIONS")
      }, {
				id: 6,
				question: i18n("COMPANY INCLUDED IN TAX INCENTIVES")
      }, {
				id: 7,
				question: i18n("COMPANY RELATED IN ARTICLES 48 OR 49 RFB")
      }, {
				id: 8,
				question: i18n("TRANSACTIONS ARE LINKED TO PEOPLE/COUNTRY")
      }, {
				id: 9,
				question: i18n("RURAL ACTIVITY")
      }, {
				id: 10,
				question: i18n("EXTERNAL HOLDINGS")
      }, {
				id: 11,
				question: i18n("REDUCTION AND EXEMPTIONS FOR PRESUMED PROFIT")
      }, {
				id: 12,
				question: i18n("EXPLORATION PROFIT")
      }, {
				id: 13,
				question: i18n("DONATION TO POLITICAL PARTY")
      }, {
				id: 14,
				question: i18n("HAVE FINOR/FINAM/FUNRES")
      }, {
				id: 15,
				question: i18n("EXTERNAL INCOME OR NON-RESIDENT")
      }, {
				id: 16,
				question: i18n("EXPORT SALES")
      }, {
				id: 17,
				question: i18n("EXPORTING COMPANY")
      }, {
				id: 18,
				question: i18n("EXTERNAL ASSETS")
      }, {
				id: 19,
				question: i18n("HAVE E-COMMERCE TECHNOLOGY")
      }, {
				id: 20,
				question: i18n("PAYMENTS ABROAD OR TO NON-RESIDENTS")
      }, {
				id: 21,
				question: i18n("DISTRIBUTE PROFITS TO BRAZILIANS OR EXTERNAL BENEFICIARIES")
      }, {
				id: 22,
				question: i18n("RECEIVES ROYALTIES IN BRAZIL OR ABROAD")
      }, {
				id: 23,
				question: i18n("PAYMENTS OR REMITTANCES TO SERVICES INTEREST AND DIV")
      }, {
				id: 24,
				question: i18n("INCOME AND DIVIDENDS IN BRAZIL OR ABROAD")
      }, {
				id: 25,
				question: i18n("DIGITAL INCLUSION TRAINING")
      }, {
				id: 26,
				question: i18n("TECHNOLOGICAL DEVELOPMENT COMPANY")
      }, {
				id: 27,
				question: i18n("EXPORT PROCESSING ZONE")
      }, {
				id: 28,
				question: i18n("IS THIS IN MANAUS INDUSTRIAL HUB AND WESTERN AMAZON")
      }, {
				id: 29,
				question: i18n("RECTIFIER"),
				options: [{
						key: "a",
						name: i18n("ECF RECTIFIER")

               }, {
						key: "b",
						name: i18n("ORIGINAL ECF")
               }, {
						key: "c",
						name: i18n("ECF ORIGINAL WITH CHANGE OF TAXATION FORM")
               }
        ]
      }, {
				id: 30,
				question: i18n("FREE TRADE ZONE")
      }, {
				id: 31,
				question: i18n("NUMBER OF PREVIOUS RECEIPT")
      }, {
				id: 32,
				question: i18n("COMPANY SCP AMOUNT")
      }, {
				id: 33,
				question: i18n("SCP CODE")
      }

    ];
		for (var i = 0; i < _self.questionsAnswer.length; i++) {
			if (_self.questionsAnswer[i].id === 1 || _self.questionsAnswer[i].id === 29) {
				_self.ArrayQuestions.push(
					_self.view.questions.bindQuestionContainer(
						_self.questionsAnswer[i]
					)
				);
			} else if (_self.questionsAnswer[i].id === 31 || _self.questionsAnswer[i].id === 32 || _self.questionsAnswer[i].id === 33) {
				_self.ArrayQuestions.push(
					_self.view.questions.bindQuestionContainer(
						_self.questionsAnswer[i]
					)
				);

			} else {
				_self.questionsAnswer[i].options = _self.answerYesNo;
				_self.ArrayQuestions.push(
					_self.view.questions.bindQuestionContainer(
						_self.questionsAnswer[i]
					)
				);
			}
		}

	},
	renderQuiz: function(value) {
		var _self = this;

		_self.newoptions = [];

		function numberQuestion(val) {

			switch (val) {
				case "AFCI":
					return 4;
				case "aliqCSLL":
					return 2;
				case "codSCP":
					return 33;
				case "comercialExport":
					return 17;
				case "computerTraining":
					return 25;
				case "donationsCampaigns":
					return 13;
				case "eCommerce":
					return 19;
				case "ecfType":
					return 1;
				case "enabledPJ":
					return 6;
				case "existanceFin":
					return 14;
				case "explorationProfit":
					return 12;
				case "exportSales":
					return 16;
				case "exportZones":
					return 27;
				case "exteriorActive":
					return 18;
				case "exteriorIncome":
					return 15;
				case "exteriorOperations":
					return 5;
				case "exteriorParticipation":
					return 10;
				case "exteriorPayments":
					return 20;
				case "framedPJ":
					return 7;
				case "freeCommerceArea":
					return 30;
				case "incomeServices":
					return 24;
				case "industrialPole":
					return 28;
				case "lastReceipt":
					return 31;
				case "linkedOperations":
					return 8;
				case "participationConsortia":
					return 3;
				case "receivedRoyalties":
					return 22;
				case "retifier":
					return 29;
				case "royaltiesPayments":
					return 21;
				case "ruralActive":
					return 9;
				case "scpQuantity":
					return 32;
				case "shipmentPayments":
					return 23;
				case "taxExemption":
					return 11;
				case "technologyInnovation":
					return 26;
				default:
					return 0;
			}

		}

		for (var index in value) {
			if (value[index] === "S" && index !== "retifier") {
				var object = {
					name: index,
					id: numberQuestion(index),
					yes: true,
					no: false
				};
				_self.newoptions.push(object);
			} else
			if (value[index] === "N" && index !== "retifier") {
				object = {
					name: index,
					id: numberQuestion(index),
					yes: false,
					no: true
				};
				_self.newoptions.push(object);
			}
			if (value[index] === "" && index !== "codSCP" && index !== "lastReceipt" && index !== "scpQuantity") {
				object = {
					name: index,
					id: numberQuestion(index),
					yes: true,
					no: false
				};
				_self.newoptions.push(object);
			}
			if (index === "aliqCSLL" && value[index] === "0" || index === "aliqCSLL" && value[index] === "1" || index === "aliqCSLL" && value[index] ===
				"2") {
				_self.view.find('.question#2')[0].textContent = i18n("ALIQCSLL");
				_self.view.find('.answer#2').empty();

				var options = [{
					key: "a",
					name: "9% " + i18n("OF") + " CSLL"
			        }, {
					key: "b",
					name: "17% " + i18n("OF") + " CSLL"
			        }, {
					key: "c",
					name: "20% " + i18n("OF") + " CSLL"
			        }]
				for (var k = 0; k < options.length; k++) {
					_self.view.find('.answer#2').bindBaseRadioButton({
						id: 2,
						name: 2,
						text: options[k].name,
						onChange: function(oldVal, newVal) {}
					});
				}
			} else if (index === "aliqCSLL" && value[index] === "S" || index === "aliqCSLL" && value[index] === "N") {
				_self.view.find('.question#2')[0].textContent = i18n("SUBJECT TO 15% RATE OF CSLL");
				_self.view.find('.answer#2').empty();
				for (var j = 0; j < _self.answerYesNo.length; j++) {
					_self.view.find('.answer#2').bindBaseRadioButton({
						id: 2,
						name: 2,
						text: _self.answerYesNo[j].name,
						onChange: function(oldVal, newVal) {}
					});
				}
			}
			if (value[index] === "S" && index === "retifier" || value[index] === "0") {
				object = {
					name: index,
					id: numberQuestion(index),
					op1: true,
					op2: false,
					op3: false
				};
				_self.newoptions.push(object);
			}

			if (value[index] === "N" && index === "retifier" || value[index] === "1") {
				object = {
					name: index,
					id: numberQuestion(index),
					op1: false,
					op2: true,
					op3: false
				};
				_self.newoptions.push(object);
			}
			if (value[index] === "F" && index === "retifier" || value[index] === "2") {
				object = {
					name: index,
					id: numberQuestion(index),
					op1: false,
					op2: false,
					op3: true
				};
				_self.newoptions.push(object);
			}
			if (index === "codSCP" || index === "lastReceipt" || index === "scpQuantity") {
				object = {
					name: index,
					id: numberQuestion(index),
					text: value[index]
				};
				_self.newoptions.push(object);
			}

		}
		for (var i = 0; i < _self.newoptions.length; i++) {

			if (_self.newoptions[i].id === 1 || _self.newoptions[i].id === 2 && _self.newoptions[i].hasOwnProperty("op1") || _self.newoptions[i].id ===
				29) {
				$(_self.view.find('input#' + _self.newoptions[i].id)[0]).prop("checked", _self.newoptions[i].op1);
				$(_self.view.find('input#' + _self.newoptions[i].id)[1]).prop("checked", _self.newoptions[i].op2);
				$(_self.view.find('input#' + _self.newoptions[i].id)[2]).prop("checked", _self.newoptions[i].op3);

			} else if (_self.newoptions[i].id === 31 || _self.newoptions[i].id === 32 || _self.newoptions[i].id === 33) {
				_self.view.find('.answer#' + _self.newoptions[i].id).find('input')[0].value = _self.newoptions[i].text;
			} else {
				$(_self.view.find('input#' + _self.newoptions[i].id)[0]).prop("checked", _self.newoptions[i].yes);
				$(_self.view.find('input#' + _self.newoptions[i].id)[1]).prop("checked", _self.newoptions[i].no);
			}
		}

	},
	quizDefault: function() {
		var _self = this;
		_self.view.find('.question#2')[0].textContent = i18n("SUBJECT TO 15% RATE OF CSLL");
		_self.view.find('.answer#2').empty();
		for (var j = 0; j < _self.answerYesNo.length; j++) {
			_self.view.find('.answer#2').bindBaseRadioButton({
				id: 2,
				name: 2,
				text: _self.answerYesNo[j].name,
				onChange: function(oldVal, newVal) {}
			});
		}
		for (var i = 0; i < _self.questionsAnswer.length; i++) {

			if (_self.questionsAnswer[i].id === 1 || _self.questionsAnswer[i].id === 29) {
				$(_self.view.find('input#' + _self.questionsAnswer[i].id)[0]).prop("checked", true);
				$(_self.view.find('input#' + _self.questionsAnswer[i].id)[1]).prop("checked", false);
				$(_self.view.find('input#' + _self.questionsAnswer[i].id)[2]).prop("checked", false);

			} else if (_self.questionsAnswer[i].id === 31 || _self.questionsAnswer[i].id === 32 || _self.questionsAnswer[i].id === 33) {
				_self.view.find('.answer#' + _self.questionsAnswer[i].id).find('input')[0].value = "";
			} else {
				$(_self.view.find('input#' + _self.questionsAnswer[i].id)[0]).prop("checked", true);
				$(_self.view.find('input#' + _self.questionsAnswer[i].id)[1]).prop("checked", false);
			}
		}
	}
});