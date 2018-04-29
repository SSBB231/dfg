sap.ui.controller("app.controllers.executorSPED.ECF.reports", {
	onInit: function() {},
	onDataRefactor: function(data) {

	},
	onAfterRendering: function(html) {
		var _self = this;
		var data = _self.getData();
		_self.view = $(html); 
		_self.view.table = _self.view.find(".table");
		_self.view.table2 = _self.view.find(".table2");
		_self.bindElements();
		//_self.bindContentTable();

	},
	bindElements: function() {
		var _self = this;

	},
	bindContentTable: function() {
		var _self = this;
		var contentTable = [];
		var content = [];
		var bodyTable = {};
		var data = _self.coreServices.reportFilesECF.files;
		for (var i = 0; i < data.length; i++) {
			for (var k = 0; k < 2099; k++) {  //data[i].reportFiles.length
				contentTable.push({
					content: [
                        data[i].reportFiles[0].fileName ? data[i].reportFiles[0].fileName : "",
                        data[i].reportFiles[0].description ? data[i].reportFiles[0].description : "",
                        data[i].reportFiles[0].idCompany ? data[i].reportFiles[0].idCompany : "",
                        data[i].reportFiles[0].idBranch ? data[i].reportFiles[0].idBranch : "",
                        data[i].reportFiles[0].fiscalState ? data[i].reportFiles[0].fiscalState : "",
                        data[i].reportFiles[0].cnpj ? data[i].reportFiles[0].cnpj : "",
                        data[i].reportFiles[0].initPeriod ? data[i].reportFiles[0].initPeriod : "",
                        data[i].reportFiles[0].endPeriod ? data[i].reportFiles[0].endPeriod : "",
                        data[i].creationUserData[0].name + " " + data[i].creationUserData[0].last_name,
                        parseDate(data[i].creationDate),
                        data[i].modificationUserData[0].name + " " + data[i].modificationUserData[0].last_name,
                        parseDate(data[i].modificationDate)
                ]
				});
			}
		
		}
/*_self.view.table.ctrl = _self.view.table.bindBaseTableReports({ 
      isTotal: true,
     // totals:["", 74637, "", "", 3678],
      notAdjustColumns: true,
      headers: [{
        text: i18n('RRRR'),
        width:"150px",
        type:"string"
      },{
        text: i18n('casa'),
        width:"150px",
        type:"string"
      },{
        text: i18n('animal'),
        width:"150px",
        type:"string"
      },{
        text: i18n('cosa'),
        width:"150px",
        type:"string"
      },{
        text: i18n('fiesta'),
        width:"150px",
        type:"string"
      }],
      body: [{
        content:["25/05/2018","narannnnja","perro",31,"miercoles"]
      },{
        content:["25/05/2018","roja","","21","lunes"]
      },{
        content:["25/05/2018","ququuququququ","ququuququq",30,"luuuquuququuq"]
      },{
        content:["25/05/2018","roja","canario",21,"lunes"]
      },{
        content:["25/05/2018","roja","canario","","lunes"]
      },{
        content:["25/05/2018","roja","canario1","","lunes"]
      },{
        content:["25/05/2018","roja","canario2",21,"lunes"]
      },{
        content:["25/05/2018","roja","1canario",21,"lunes"]
      },{
        content:["25/05/2018","roja","2canario",21,"lunes"]
      },{
        content:["25/05/2018","roja","canario",21,"lunes"]
      },{
        content:["25/04/2018","roja","canario",21,"lunes"]
      },{
        content:["25/05/2018","roja","canario",21,"lunes"]
      },{
        content:["25/05/2018","roja","canario",21,"lunes"]
      },{
        content:["25/05/2018","roja","canario",21,"lunes"]
      },{
        content:["25/05/2016","cc","ccccc",234,"cccc"]
      },{
        content:["24/05/2018","cc","ccccc",234,"cccc"]
      },{
        content:["26/05/2018","cc","ccccc",234,"cccc"]
      },{
        content:["02/05/2011","cc","ccccc",1,"cccc"]
      },{
        content:["14/06/2019","cc","ccccc",234,"cccc"]
      },{
        content:["25/05/2018","cc","ccccc",-234,"cccc"]
      },{
        content:["25/05/2018","cc","ccccc",234,"cccc"]
      },{
        content:["25/05/2018","cc","ccccc",234,"cccc"]
      },{
        content:["25/05/2018","cc","ccccc",234,"cccc"]
      },{
        content:["25/05/2018","cc","ccccc",234,"cccc"]
      },{
        content:["25/05/2018","cc","ccccc",234,"cccc"]
      },{
        content:["25/05/2018","cc","ccccc",234,"cccc"]
      },{
        content:["25/05/2018","cc","ccccc",234,"cccc"]
      },{
        content:["25/05/2018","cc","ccccc",2.34563,"cccc"]
      },{
        content:["25/05/2018","cc","ccccc",234,"cccc"]
      },{
        content:["25/05/2018","cc","ccccc",234,"cccc"]
      },{
        content:["25/05/2018","cc","ccccc",234,"cccc"]
      },{
        content:["25/05/2018","cc","ccccc","234.3245","cccc"]
      },{
        content:["25/05/2018","cc","cc4ccc",234,"cccc"]
      },{
        content:[null,"cc","ccccc",234,"cccc"]
      },{
        content:["25/05/2018","cc","c1cccc",234,"cccc"]
      },{
        content:["","cc","cc1ccc",234,"cccc"]
      },{
        content:["","cc","cc2ccc",234,"cccc"]
      },{
        content:["25/05/2018","cc","c0cccc",234,"cccc"]
      },{
        content:["25/05/2018","cc","ccccc",234,"cccc"]
      },{
        content:["25/05/2018","cc","ccccc",234,"cccc"]
      },{
        content:["25/05/2018","cc","ccccc",234,"cccc"]
      },{
        content:["25/05/2018","cc","ccccc",234,"cccc"]
      },{
        content:["25/05/2018","cc","ccccc",234,"cccc"]
      },{
        content:["25/05/2018","cc","ccccc",234,"cccc"]
      },{
        content:["25/05/2018","cc","ccccc",234,"cccc"]
      },{
        content:["25/05/2018","cc","ccccc",234,"cccc"]
      },{
        content:["11/12/2013","cc","ccccc",234,"cccc"]
      },{
        content:["11/12/2013","cc","ccccc",234,"cccc"]
      },{
        content:["11/12/2013","cc","ccccc",234,"cccc"]
      },{
        content:["11/12/2013","cc","ccccc",234,"cccc"]
      },{
        content:["11/12/2013","cc","ccccc",234,"cccc"]
      },{
        content:["11/12/2013","cc","ccccc",234,"cccc"]
      },{
        content:["11/12/2013","cc","ccccc",234,"cccc"]
      },{
        content:["11/12/2013","cc","ccccc",234,"cccc"]
      },{
        content:["11/12/2013","cc","ccccc",234,"cccc"]
      },{
        content:["11/12/2013","cc","ccccc",234,"cccc"]
      },{
        content:["11/12/2013","cc","ccccc",234,"cccc"]
      },{
        content:["11/12/2013","cc","ccccc",234,"cccc"]
      },{
        content:["11/12/2013","cc","ccccc",234,"cccc"]
      },{
        content:["11/12/2013","cc","ccccc",234,"cccc"]
      },{
        content:["11/12/2013","cc","ccccc",234,"cccc"]
      },{
        content:["11/12/2013","cc","ccccc",234,"cccc"]
      },{
        content:["11/12/2013","cc","ccccc",234,"cccc"]
      },{
        content:["11/12/2013","cbbc","ccbbbbbccc",432,"bgrbb"]
      },{
        content:["11/12/2013","cbbc","ccbbbbbccc",432,"bgrbb"]
      },{
        content:["11/12/2013","cbbc","ccbbbbbccc",432,"bgrbb"]
      },{
        content:["11/12/2013","cbbc","ccbbbbbccc",432,"bgrbb"]
      },{
        content:["11/12/2013","cbbc","ccbbbbbccc",432,"bgrbb"]
      },{
        content:["11/12/2013","cbbc","ccbbbbbccc",432,"bgrbb"]
      },{
        content:["11/12/2013","cbbc","ccbbbbbccc",432,"bgrbb"]
      },{
        content:["11/12/2013","cbbc","ccbbbbbccc",432,"bgrbb"]
      },{
        content:["11/12/2013","cbbc","ccbbbbbccc",432,"bgrbb"]
      },{
        content:["11/12/2013","cbbc","ccbbbbbccc",432,"bgrbb"]
      },{
        content:["11/12/2013","cbbc","ccbbbbbccc",432,"bgrbb"]
      },{
        content:["11/12/2013","cbbc","ccbbbbbccc",432,"bgrbb"]
      },{
        content:["11/12/2013","cbbc","ccbbbbbccc",432,"bgrbb"]
      },{
        content:["11/12/2013","cbbc","ccbbbbbccc",432,"bgrbb"]
      },{
        content:["11/12/2013","cbbc","ccbbbbbccc",432,"bgrbb"]
      },{
        content:["11/12/2013","cbbc","ccbbbbbccc",432,"bgrbb"]
      },{
        content:["11/12/2013","cbbc","ccbbbbbccc",432,"bgrbb"]
      },{
        content:["11/12/2013","cbbc","ccbbbbbccc",432,"bgrbb"]
      },{
        content:["11/12/2013","cbbc","ccbbbbbccc",432,"bgrbb"]
      },{
        content:["11/12/2013","cbbc","ccbbbbbccc",432,"bgrbb"]
      },{
        content:["11/12/2013","cbbc","ccbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbccc",432,"bgrbb"]
      },{
        content:["11/12/2013","cbbc","ccbbbbbccc",432,"bgrbb"]
      },{
        content:["11/12/2003","cbbc","ccbbbbbccc",432,"bgrbb"]
      },{
        content:["11/12/2003","cbbc","ccbbbbbccc",432,"bgrbb"]
      },{
        content:["11/12/2003","cbbc","ccbbbbbccc",432,"bgrbb"]
      },{
        content:["11/12/2003","cbbc","ccbbbbbccc",432,"bgrbb"]
      },{
        content:["11/12/2003","cbbc","ccbbbbbccc",432,"bgrbb"]
      },{
        content:["11/12/2003","cbbc","ccbbbbbccc",432,"bgrbb"]
      },{
        content:["11/12/2003","cbbc","ccbbbbbccc",432,"bgrbb"]
      },{
        content:["11/12/2003","cbbc","ccbbbbbccc",432,"bgrbb"]
      },{
        content:["11/12/2003","cbbc","ccbbbbbccc",432,"bgrbb"]
      },{
        content:["11/12/2003","cbbc","ccbbbbbccc",432,"bgrbb"]
      },{
        content:["11/12/2003","cbbc","ccbbbbbccc",432,"bgrbb"]
      },{
        content:["11/12/2003","cbbc","ccbbbbbccc",432,"bgrbb"]
      },{
        content:["02/01/2003","cbbc","ccbbbbbccc",432,"bgrbb"]
      },{
        content:["02/01/2003","cbbc","ccbbbbbccc",432,"bgrbb"]
      },{
        content:["02/01/2003","cbbc","ccbbbbbccc",432,"bgrbb"]
      },{
        content:["02/01/2003","cbbc","ccbbbbbccc",432,"bgrbb"]
      },{
        content:["02/01/2003","cbbc","ccbbbbbccc",432,"bgrbb"]
      },{
        content:["02/01/2003","cbbc","ccbbbbbccc",432,"bgrbb"]
      },{
        content:["02/01/2003","cbbc","ccbbbbbccc",432,"bgrbb"]
      },{
        content:["02/01/2003","cbbc","ccbbbbbccc",432,"bgrbb"]
      },{
        content:["02/01/2003","cbbc","ccbbbbbccc",432,"bgrbb"]
      },{
        content:["02/01/2003","cbbc","ccbbbbbccc",432,"bgrbb"]
      },{
        content:["02/01/2003","cbbc","ccbbbbbccc",432,"bgrbb"]
      },{
        content:["02/01/2003","cbbc","ccbbbbbccc",432,"bgrbb"]
      },{
        content:["11/12/2013","roja","canario",21,"lunes"]
      },{
        content:["99/99/99999","u","u","",""]
      }]      
    });*/
  _self.view.table.ctrl = _self.view.table.bindBaseTableReports({
    			notAdjustColumns: true,
    			isTotal: true,
    			headers: [{
    				text: i18n('TILE LAYOUT NAME'),
    				width: "220px"
          }, {
    				text: i18n('DESCRIPTION'),
    				width: "220px"
          }, {
    				text: i18n('COMPANY'),
    				width: "135px"
          }, {
    				text: i18n('BRANCH'),
    				width: "104px"
          }, {
    				text: i18n('FISCAL STATE NUMBER'),
    				width: "200px"
          }, {
    				text: i18n('ROOT CNPJ'),
    				width: "135px"
          }, {
    				text: i18n('INITIAL PERIOD'),
    				width: "150px"
          }, {
    				text: i18n('FINAL PERIOD'),
    				width: "160px"
          }, {
    				text: i18n('TILE CREATION BY'),
    				width: "160px"
          }, {
    				text: i18n('TILE CREATION ON'),
    				width: "160px"
          }, {
    				text: i18n('TILE MODIFIED BY'),
    				width: "160px"
          }, {
    				text: i18n('TILE MODIFIED ON'),
    				width: "160px"
          }],
    			body: contentTable
    		});


	}

});