  sap.ui.controller("app.controllers.executorSPED.ECF.checklist", {
  onInit: function() {},
  onDataRefactor: function(data) {

  },
  onAfterRendering: function (html) {
  	var _self = this;
    var data = _self.getData();
    _self.view = $(html);
    _self.view.questions = _self.view.find(".questions");
    _self.view.table = _self.view.find(".table");
    _self.bindElements();
  },
  bindElements: function () {
  	var _self = this;
  	_self.view.questions.bindQuestionContainer(
      
      { id: 34,
        question: i18n("FINANCIAL PERIOD CLOSED"),
        options: [{
                  key:"a",
                  name: i18n("YES")
               },{
                  key:"b",
                  name: i18n("NO")
               }
        ]
      }

      
    );
 /*   _self.view.table.ctrl = _self.view.table.bindBaseTableReports({ 
      isTotal: true,
      totals:["", 74637, "", "", 3678],
      
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
        content:["aaarbol","narannnnja","perro","31","miercoles"]
      },{
        content:["lol","roja","canario","21","lunes"]
      },{
        content:["lol","roja","canario","21","lunes"]
      },{
        content:["lol","roja","canario","21","lunes"]
      },{
        content:["lol","roja","canario","21","lunes"]
      },{
        content:["lol","roja","canario","21","lunes"]
      },{
        content:["lol","roja","canario","21","lunes"]
      },{
        content:["lol","roja","canario","21","lunes"]
      },{
        content:["lol","roja","canario","21","lunes"]
      },{
        content:["lol","roja","canario","21","lunes"]
      },{
        content:["lol","roja","canario","21","lunes"]
      },{
        content:["lol","roja","canario","21","lunes"]
      },{
        content:["lol","roja","canario","21","lunes"]
      },{
        content:["lol","roja","canario","21","lunes"]
      },{
        content:["lol","roja","canario","21","lunes"]
      }]      
    });*/

  }
});