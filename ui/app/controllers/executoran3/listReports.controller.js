sap.ui.controller("app.controllers.executoran3.listReports", {
    onAfterRendering: function(html) {
        var _self = this;
        var data = _self.getData();
        _self.view = $(html);
        _self.loader = _self.view.baseLoader({
            modal: true
        });
        _self.view.table = _self.view.find(".report-table");
        _self.reports = data.reports;
        _self.bindElements();
    },
    bindElements: function() {
        var _self = this;
        _self.loader.open();
        _self.view.table.empty();
        var headers = [{
            text: "ID",
            sort: true,
            resizable: true,
            width: "150px",
            type: "text"
        }, {
            text: i18n("TILE LAYOUT NAME"),
            sort: true,
            resizable: true,
            width: "150px",
            type: "text"
        }, {
            text: i18n("DESCRIPTION"),
            sort: true,
            width: "150px",
            type: "text"
        }];
        var body = [];
        var actions = [];
        for (var r = 0; r < _self.reports.length; r++) {

            body.push({
                actions: [{
                    iconFont: "File-and-Folders",
                    icon: "docanalisis",
                    text: i18n("VISUALIZE REPORT"),
                    id: _self.reports[r].id,
                    onPress: function() {
                        var id = this.target.parentNode.parentNode.parentNode.getAttribute("data-id");
                        var report;
                        for (var r2 = 0; r2 < _self.reports.length; r2++) {
                            if (_self.reports[r2].id + "" === id) {
                                report = JSON.parse(_self.reports[r2].report);
                                break;
                            }

                        }
                        _self.coreServices.renderExecutedReport(report);
                    }
                }],
                id: _self.reports[r].id,
                content: [_self.reports[r].id, _self.reports[r].name, _self.reports[r].description]
            });
        }
        _self.view.table.ctrl = _self.view.table.bindBaseTable({
            hasActions: true,
            headers: headers,
            body: body
        });
        _self.loader.close();
    }
});
