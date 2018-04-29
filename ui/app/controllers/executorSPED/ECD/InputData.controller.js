sap.ui.controller("app.controllers.executorSPED.ECD.InputData", {
  onInit: function() {},
  onDataRefactor: function(data) {

  },
  onAfterRendering: function (html) {
  	var _self = this;
    var data = _self.getData();
    _self.view = $(html);
    _self.view.CompanyOpeningDate = _self.view.find(".CompanyOpeningDate");
    _self.view.NIRESubBookkeeping = _self.view.find(".NIRE-SubBookkeeping");
    _self.view.LastModificationSharehold = _self.view.find(".LastModificationSharehold");
    _self.view.HashSubBookkeeping = _self.view.find(".Hash-SubBookkeeping");
    _self.view.LargeBusinessIndicator = _self.view.find(".LargeBusinessIndicator");
    _self.view.BookNumber = _self.view.find(".Book-Number");
    _self.view.FiscalYearClosingDate = _self.view.find(".FiscalYearClosingDate");
    _self.view.BookPurpose = _self.view.find(".Book-Purpose");
    _self.view.IdentificationStatementAccounting = _self.view.find(".IdentificationStatementAccounting");
    _self.view.AccountingStatementHead = _self.view.find(".AccountingStatementHead");
    _self.view.LeiaRb = _self.view.find(".Leia-rb");
    _self.view.FileNameDirectory = _self.view.find(".FileName-Directory");
    _self.view.NameFileDirectory = _self.view.find(".NameFile-Directory");
    

 	_self.bindElements();
 	_self.bindComponents();
 	
  },
  bindElements: function () {
  	var _self = this;

  	_self.view.CompanyOpeningDate.ctrl = _self.view.CompanyOpeningDate.bindBaseDatePicker({      
      onChange: function(oldVal, newVal){
      },
      tooltip: {
        class: 'dark',
        position: 'right',
        text: ''
      }
    });
  	_self.view.NIRESubBookkeeping.ctrl = _self.view.NIRESubBookkeeping.bindBaseInput({
        
    });
    _self.view.NIRESubBookkeeping.find('input').attr("maxlength",11);
    _self.view.LastModificationSharehold.ctrl = _self.view.LastModificationSharehold.bindBaseDatePicker({      
      onChange: function(oldVal, newVal){
      },
      tooltip: {
        class: 'dark',
        position: 'right',
        text: ''
      }
    });
    _self.view.HashSubBookkeeping.ctrl = _self.view.HashSubBookkeeping.bindBaseInput({
      
    }); 
    _self.view.HashSubBookkeeping.find('input').attr("maxlength",40);
    _self.view.LargeBusinessIndicator.ctrl = _self.view.LargeBusinessIndicator.bindBaseSelect({
      required: true
    });
    _self.view.LargeBusinessIndicator.find('input').attr("maxlength",1);
    _self.view.BookNumber.ctrl = _self.view.BookNumber.bindBaseInput({
      
    });
    _self.view.FiscalYearClosingDate.ctrl = _self.view.FiscalYearClosingDate.bindBaseDatePicker({
      required:true,      
      onChange: function(oldVal, newVal){
      },
      tooltip: {
        class: 'dark',
        position: 'right',
        text: ''
      }
    }); 
    _self.view.BookPurpose.ctrl = _self.view.BookPurpose.bindBaseInput({
      
    });
    _self.view.IdentificationStatementAccounting.ctrl = _self.view.IdentificationStatementAccounting.bindBaseSelect({
      
    });
    _self.view.AccountingStatementHead.ctrl = _self.view.AccountingStatementHead.bindBaseInput({
      
    });
    _self.view.LeiaRb.ctrl = _self.view.LeiaRb.bindBaseRadioButton({
      id: 1,
      name: "Leia_rb",      
      text: i18n("READ FROM SERVER PRESENTATION"),
      onChange: function(oldVal, newVal) {}            
    });
    _self.view.LeiaRb.ctrl = _self.view.LeiaRb.bindBaseRadioButton({
      id: 1,
      name: "Leia_rb",      
      text: i18n("READ FROM APPLICATION SERVER"),
      onChange: function(oldVal, newVal) {}            
    });
    _self.view.FileNameDirectory.ctrl = _self.view.FileNameDirectory.bindBaseInput({
      
    });
    _self.view.NameFileDirectory.ctrl = _self.view.NameFileDirectory.bindBaseInput({
      
    });
    


  },
  bindComponents: function(){
        var _self = this;
         var recordOptions = [];
          
            _self.view.IdentificationStatementAccounting.empty();
            _self.view.IdentificationStatementAccounting.ctrl = _self.view.IdentificationStatementAccounting.bindBaseAutocomplete({
                options:  _self.coreServices.requiredInformation.accountingIdentification
            });
             _self.view.LargeBusinessIndicator.empty();
            _self.view.LargeBusinessIndicator.ctrl = _self.view.LargeBusinessIndicator.bindBaseAutocomplete({
                options:  _self.coreServices.requiredInformation.largeCompanyIndicator,
                required: true
            });
      
  },
	getFormData: function(data){
	    var _self = this;
	    data['tmf:ECDReportRun'].DTARQ = _self.view.CompanyOpeningDate.getKey() ? _self.view.CompanyOpeningDate.getKey() : '';
       // data['tmf:ECDReportRun'].DTCONV = _self.view.LastModificationSharehold.getKey() ? _self.view.LastModificationSharehold.getKey() : '';
        data['tmf:ECDReportRun'].INDNIR = '';
        data['tmf:ECDReportRun'].NIRESB = _self.view.NIRESubBookkeeping.getText() ? _self.view.NIRESubBookkeeping.getText() : '';
        data['tmf:ECDReportRun'].HASHSB = _self.view.HashSubBookkeeping.getText() ? _self.view.HashSubBookkeeping.getText() : '';
        data['tmf:ECDReportRun'].GRDPRT = _self.view.LargeBusinessIndicator.getKey() ? _self.view.LargeBusinessIndicator.getKey() : '';
        data['tmf:ECDReportRun'].NUMORD = _self.view.BookNumber.getText() ? _self.view.BookNumber.getText() : '';
        data['tmf:ECDReportRun'].NATLIV = _self.view.BookPurpose.getText() ? _self.view.BookPurpose.getText() : '';
     //   data['tmf:ECDReportRun'].DTEXSO = ;
        data['tmf:ECDReportRun'].IDDEM = _self.view.IdentificationStatementAccounting.getKey() ? _self.view.IdentificationStatementAccounting.getKey() : '';
        data['tmf:ECDReportRun'].CABDEM = _self.view.AccountingStatementHead.getText() ? _self.view.AccountingStatementHead.getText() : '';
        data['tmf:ECDReportRun'].APIN = '';
        data['tmf:ECDReportRun'].GRDPRT = _self.view.LargeBusinessIndicator.getKey() ? _self.view.LargeBusinessIndicator.getKey() : '';
        
	    
	}

});//end