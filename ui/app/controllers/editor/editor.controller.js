sap.ui.controller("app.controllers.editor.editor", {

  onInit: function() {
    this._views = {
     leftContent: {
      view: "app.views.editor.leftContent",
      wrapper: "#left-content"
     },
     rightContent: {
      view: "app.views.editor.rightContent",
      wrapper: "#right-content"
     },
     pesquisaAvancada: {
      view: "app.views.editor.pesquisaAvancada",
      wrapper: "#PesquisaAvancada"
     }
    }
  },

  onAfterRendering: function(html) {
    this.initServices();
  },

  initServices: function() {
    var _self = this;
    if(_self.privileges && !_self.privileges.Access){
		    $.baseToast({
		        type: "W",
		        text: i18n("NO ACCESS PRIVILEGES FOUND")
		    });
		    window.location = "/timp/tkb/#/content";
		} 
	if(_self.privileges && !_self.privileges.layout.edit){
	     $.baseToast({
		        type: "W",
		        text: i18n("NO EDIT PRIVILEGES FOUND")
		    });
		    this.coreServices.lock.removeLock();
            window.location = '#/library?restoreSettings=1';
            return;
	}
    app.services = {
      libraryListView:function(){
      //_self._views.libraryListView.controller.libraryListView(users);
        
        Data.endpoints.listLayout.post({type: 'simple'}).success(function(_data_structures) {
          var bodyData = [];
          $.each(_data_structures, function(index, val){
            var currLine = {};
            currLine.actions = [{
              iconfont:"Sign-and-Symbols",
              icon:"info-52",
              text:"Nova Action",
              onPress:function(){alert("yay")}
            }];
            currLine.id = val.id;
            currLine.content = [];
            currLine.content.push(val.layoutName);
            currLine.content.push(val.layoutType);
            currLine.content.push("");
            currLine.content.push(val.area);
            currLine.content.push("");
            currLine.content.push(val.company);
            currLine.content.push(val.branch);
            currLine.content.push("");
            currLine.content.push(val.isPublic);
            
            currLine.versions = [];
            $.each(val.versions, function(index, versionVal){
              var versionLine = {};
              versionLine.actions = [{
                iconfont:"Sign-and-Symbols",
                icon:"info-52",
                text:"Nova Ac",
                onPress:function(){alert("Version")}
              }];
              versionLine.id = versionVal.idVersion;
              versionLine.content = [];
              versionLine.content.push("");
              versionLine.content.push("");
              versionLine.content.push(versionVal.legalVersion);
              versionLine.content.push("");
              versionLine.content.push(versionVal.validFrom + " - " + versionVal.validTo);
              versionLine.content.push("");
              versionLine.content.push("");
              versionLine.content.push(versionVal.timpVersion);
              versionLine.content.push("");
              currLine.versions.push(versionLine);
            });
            
            bodyData.push(currLine);
          });
          //console.log("TUDO", bodyData);
          
          $("#libraryview").bindDfgLibraryListView({
            hasActions: true,
            hasCheckboxes: true,
            hasExpand: true,
            headers: [{
              title: i18n['TILE LAYOUT NAME'],
              sort: true
            },{
              title: i18n['TILE LAYOUT TYPE'],
              sort: true
            },{
              title: i18n['TILE LAYOUT VERSION'],
              sort: true
            },{
              title: i18n['TILE AREA'],
              sort: true
            },{
              title: i18n['TILE VALID'],
              sort: true
            },{
              title: i18n['TILE COMPANY'],
              sort: true
            },{
              title: i18n['TILE BRANCH'],
              sort: true
            },{
              title: i18n['TILE TIMP VERSION'],
              sort: true
            },{
              title: i18n['TILE SHARED'],
              sort: true
            }],
            body: bodyData
          });
        })
      }
    }
    app.services.libraryListView();
  }
});