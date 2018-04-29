sap.ui.controller("app.controllers.executorSPED.ECD.creationFileControl", {
	onInit: function() {},
	onDataRefactor: function(data) {

	},
	onAfterRendering: function(html) {
		var _self = this;
		var data = _self.getData();
		_self.view = $(html);
		_self.view.bookkeepingType = _self.view.find(".bookkeeping-type");
		_self.view.ecdType = _self.view.find(".ecd-type");
		_self.view.demonstrativeType = _self.view.find(".demonstrative-type");
		_self.view.scpCode = _self.view.find(".scp-code");
		_self.view.bookkeepingFinality = _self.view.find(".bookkeeping-finality");
		_self.view.financialVersion = _self.view.find(".financial-version");
		_self.view.layoutVersion = _self.view.find(".layout-version");
		_self.view.closingDocumentType = _self.view.find(".closing-document-type");
		_self.view.startingSituation = _self.view.find(".starting-situation");
		_self.view.activationDate = _self.view.find(".activation-date");
		_self.view.outputRb = _self.view.find(".output-rb");
		_self.view.fileName = _self.view.find(".file-name");
		_self.view.namFile = _self.view.find(".name-file");
		_self.view.runRb = _self.view.find(".run-rb");

		_self.bindElements();
		_self.bindComponents();
	},
	bindElements: function() {
		_self = this;
		_self.view.bookkeepingType.ctrl = _self.view.bookkeepingType.bindBaseSelect({
			required: true
		});
		_self.view.ecdType.ctrl = _self.view.ecdType.bindBaseSelect({

		});
		_self.view.demonstrativeType.ctrl = _self.view.demonstrativeType.bindBaseSelect({

		});
		_self.view.scpCode.ctrl = _self.view.scpCode.bindBaseInput({

		});
		_self.view.bookkeepingFinality.ctrl = _self.view.bookkeepingFinality.bindBaseSelect({

		});
		_self.view.financialVersion.ctrl = _self.view.financialVersion.bindBaseInput({
			required: true
		});
		_self.view.layoutVersion.ctrl = _self.view.layoutVersion.bindBaseSelect({
			required: true,
			isLoading: true
		});
		_self.view.closingDocumentType.ctrl = _self.view.closingDocumentType.bindBaseInput({
			required: true
		});
		_self.view.startingSituation.ctrl = _self.view.startingSituation.bindBaseSelect({
			required: true
		});
		_self.view.activationDate.ctrl = _self.view.activationDate.bindBaseDatePicker({
			onChange: function(oldVal, newVal) {
			    console.log(newVal);
			    var f = _self.view.activationDate.ctrl.getValue();
			    if(sessionStorage.lang === "ptrbr" || !sessionStorage.lang){
			        
    			    var fecha = f.timpDate.split("/");
                    var ReverseDate = fecha.reverse().join("");
                    console.log(ReverseDate);    
			    }else{
			        var fecha = f.timpDate.split("/");
			        var newFecha = fecha.splice(2,1);
			        fecha.splice(0, 0, newFecha);
			        var reverseDate = fecha.join("");
			        console.log(reverseDate);
			    }
			    
			},
			tooltip: {
				class: 'dark',
				position: 'right',
				text: ''
			}
		});
		_self.view.outputRb.ctrl = _self.view.outputRb.bindBaseRadioButton({
			id: 1,
			name: "output_Rb",
			text: i18n("WRITE FOR PRESENTATION SERVER"),
			onChange: function(oldVal, newVal) {}
		});
		_self.view.outputRb.ctrl = _self.view.outputRb.bindBaseRadioButton({
			id: 1,
			name: "output_Rb",
			text: i18n("WRITE TO THE APPLICATION SERVER"),
			onChange: function(oldVal, newVal) {}
		});
		_self.view.fileName.ctrl = _self.view.fileName.bindBaseInput({

		});
		_self.view.namFile.ctrl = _self.view.namFile.bindBaseInput({

		});
		_self.view.runRb.test = _self.view.runRb.bindBaseRadioButton({
			id: 1,
			name: "run_Rb",
			text: i18n("SCREEN OUTPUT TEST"),
			onChange: function(oldVal, newVal) {}
		});
		_self.view.runRb.official = _self.view.runRb.bindBaseRadioButton({
			id: 1,
			name: "run_Rb",
			text: i18n("OFFICIAL RACE"),
			onChange: function(oldVal, newVal) {}
		});

	},
	bindComponents: function() {
		var _self = this;
		var recordOptions = [];

		_self.view.bookkeepingType.empty();
		_self.view.bookkeepingType.ctrl = _self.view.bookkeepingType.bindBaseAutocomplete({
			options: _self.coreServices.requiredInformation.bookKeepingType,
			required: true,
			onChange: function(){}
		});
		_self.view.ecdType.empty();
		_self.view.ecdType.ctrl = _self.view.ecdType.bindBaseAutocomplete({
			options: _self.coreServices.requiredInformation.typeECD
		});
		_self.view.demonstrativeType.empty();
		_self.view.demonstrativeType.ctrl = _self.view.demonstrativeType.bindBaseAutocomplete({
			options: _self.coreServices.requiredInformation.demonstrativeType
		});
		_self.view.bookkeepingFinality.empty();
		_self.view.bookkeepingFinality.ctrl = _self.view.bookkeepingFinality.bindBaseAutocomplete({
			options: _self.coreServices.requiredInformation.bookKeepingPurpose
		});
		_self.view.startingSituation.empty();
		_self.view.startingSituation.ctrl = _self.view.startingSituation.bindBaseAutocomplete({
			options: _self.coreServices.requiredInformation.situationBeginning,
			required: true
		});
		/* _self.view.layoutVersion.empty(); 
            _self.view.layoutVersion.ctrl = _self.view.layoutVersion.bindBaseAutocomplete({
                options:  _self.coreServices.requiredInformation.spedVersions
            }); */

	},
	onChangePeriod: function(value) {
		var _self = this;
	//	var value = _self.siblingCtrl.view.period.ctrl.getValue();
		var startDate = parseDate(value.startDate.split("GMT")[0], "enus");
		var endDate = parseDate(value.endDate.split("GMT")[0], "enus");
		var spedStartDate;
		var spedEndDate;
		var spedVersions = [];
		var flag;
		for (var sv in _self.coreServices.requiredInformation.spedVersions) {
			spedStartDate = parseDate(_self.coreServices.requiredInformation.spedVersions[sv].validFrom, "enus");
			spedEndDate = parseDate(_self.coreServices.requiredInformation.spedVersions[sv].validTo, "enus");
			if (_self.compareDates(startDate, spedStartDate) && _self.compareDates(spedEndDate, endDate)) {
				spedVersions.push(_self.coreServices.requiredInformation.spedVersions[sv]);
			}
		}

		_self.view.layoutVersion.empty();
		_self.view.layoutVersion.ctrl = _self.view.layoutVersion.bindBaseAutocomplete({
			options: _self.coreServices.spedVersions,
			required: true
		});
	},
	compareDates: function(date1, date2) {
		if (parseInt(date1.year, 10) < parseInt(date2.year, 10)) {
			return false;
		}
		if (parseInt(date1.year, 10) === parseInt(date2.year, 10)) {
			if (parseInt(date1.month, 10) < parseInt(date2.month, 10)) {
				return false;
			}
			if (parseInt(date1.month, 10) === parseInt(date2.month, 10)) {
				if (parseInt(date1.date, 10) < parseInt(date2.date, 10)) {
					return false;
				}
			}
		}

		return true;
	},
	getFormData: function(data){
	    var _self = this;
	    data['tmf:ECDReportRun'].INDESC = _self.view.bookkeepingType.getKey() ? _self.view.bookkeepingType.getKey() : '';
        data['tmf:ECDReportRun'].INDTIP = _self.view.demonstrativeType.getKey() ? _self.view.demonstrativeType.getKey() : '';
        data['tmf:ECDReportRun'].INDPUR = _self.view.bookkeepingFinality.getKey() ? _self.view.bookkeepingFinality.getKey() : '';   
        data['tmf:ECDReportRun'].LAYOUT = _self.view.layoutVersion.getKey() ? _self.view.layoutVersion.getKey() : '';
        data['tmf:ECDReportRun'].TIPECD = _self.view.ecdType.getKey() ? _self.view.ecdType.getKey() : '';
        data['tmf:ECDReportRun'].CODSCP = _self.view.scpCode.getText() ? _self.view.scpCode.getText() : '';
        data['tmf:ECDReportRun'].ESTRBA = _self.view.financialVersion.getText() ? _self.view.financialVersion.getText() : '';
	    data['tmf:ECDReportRun'].CLSDOC = _self.view.closingDocumentType.getText() ? _self.view.closingDocumentType.getText() : '';
	    data['tmf:ECDReportRun'].INDPSI = _self.view.startingSituation.getKey() ? _self.view.startingSituation.getKey() : '';
	            var f = _self.view.activationDate.ctrl.getValue();
			    var fecha = f.timpDate.split("/");
                var ReverseDate = fecha.reverse().join(".");
                console.log(ReverseDate);
	   // data['tmf:ECDReportRun'].DTRES = _self.view.activationDate.getKey() ? _self.view.activationDate.getKey() : '';
	    if(_self.view.runRb.test.getChecked()){
	        data['tmf:ECDReportRun'].OFFICIAL_RUN = '';
	    }else{
	        data['tmf:ECDReportRun'].OFFICIAL_RUN = 'X';
	    }
	}

}); //end