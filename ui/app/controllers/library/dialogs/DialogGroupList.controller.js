sap.ui.controller("app.controllers.library.dialogs.DialogGroupList", {
  onInit: function() {
    this.data = {
      loaderData: {
        color: "blue"
      }
    }
  },

  onDataRefactor: function(data) {
    data = this.getView().getViewData();
    this.Groups = this.getView().getViewData().dialogGroups;
    return $.extend(data, this.data)
  },

  onAfterRendering: function(html) {
    var _daddy = this;
    var bodycont = [];
    $.each(_daddy.Groups, function(index, value) {
      bodycont.push({
        id: "g_" + value.id,
        content: [value.name, value.description]
      });
    });

    $('#Groups-table').bindBaseTable({
      hasActions: false,
      hasCheckboxes: true,
      headers: [{
        text: i18n('NAME'),
        sort: true,
        width: "268px"
      }, {
        text: i18n('DESCRIPTION'),
        sort: true,
        width: "308px"
      }],
      body: bodycont
    });

    $("#Groups-table").find(".tr").on('dblclick', function() {
      var check = $(this).find("input");
      if (check.prop("checked")){
        check.prop("checked", false);
      }
      else
        check.prop("checked", true);
    });
  }

});
