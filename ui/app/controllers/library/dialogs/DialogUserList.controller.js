sap.ui.controller("app.controllers.library.dialogs.DialogUserList", {
  data: {},
  onDataRefactor: function(data) {
    data = this.getView().getViewData();
    this.Users = this.getView().getViewData().dialogUsers;
    return $.extend(data, this.data)
  },
  onAfterRendering: function(html) {
    var _daddy = this;
    var bodycont = [];
    $.each(_daddy.Users, function(index, value) {
      bodycont.push({
        id: "u_" + value.id,
        content: [value.name, value.last_name, value.cargo]
      });
    });
    $('#User-table').bindBaseTable({
      hasActions: false,
      hasCheckboxes: true,
      headers: [{
        text: i18n('NAME'),
        sort: true,
        width: "298px"
      }, {
        text: i18n('LAST NAME'),
        sort: true,
        width: "218px"
      }, {
        text: i18n('POSITION'),
        sort: true,
        width: "218px"
      }],
      body: bodycont
    });

    $("#User-table .tbody").find(".tr").on('dblclick', function() {
      var check = $(this).find("input");
      if (check.prop("checked")) {
        check.prop("checked", false);
      } else
        check.prop("checked", true);
    });

    $("#User-table .thead .tr .checkbox").on("click", function() {
      $("#User-table .tbody .tr").each(function(ind, val) {
        if ($(this).find("input").attr("checked")) {
          $(val).find("input").prop("checked", true);
        } else {
          $(val).find("input").prop("checked", false);
        }
      });
    });

  }
});
