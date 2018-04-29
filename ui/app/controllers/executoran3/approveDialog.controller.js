sap.ui.controller("app.controllers.executoran3.approveDialog", {
    onDataRefactor: function(data){
        return $.extend(data.AN3, this.data);
    },
    onAfterRendering: function(html) {
        var _self = this;
        _self.view = $(html);
        _self.loader = _self.view.baseLoader({
            modal: true
        });
        _self.view.textArea = _self.view.find(".approve-text");
        _self.view.table = _self.view.find(".report-table");
        _self.view.textArea.ctrl = _self.view.textArea.bindBaseTextarea({
            required: true,
            placeholder: i18n("JUSTIFY TOOLTIP"),
            rows: 4,
            value: "",
            tooltip: i18n("JUSTIFY TOOLTIP")
        });
        Data.endpoints.dfg.panel.readJustify.post().success(function(data) {
            _self.comments = data;
            _self.bindTable();
        });
    },
    bindTable: function() {
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
            text: i18n("JUSTIFICATION"),
            sort: true,
            resizable: true,
            width: "150px",
            type: "text"
        }];
        var body = [];
        var actions = [];
        for (var r = 0; r < _self.comments.length; r++) {
            body.push({
                id: "js_" + _self.comments[r].id,
                content: [_self.comments[r].id, _self.comments[r].justify]
            });
        }
        _self.view.table.ctrl = _self.view.table.bindBaseTable({
            hasActions: false,
            hasCheckboxes: true,
            headers: headers,
            body: body
        });
        _self.loader.close();
    },
    validate: function(){
        if( (this.view.textArea.ctrl.getText() == "" || this.view.textArea.ctrl.getText() == null) && this._getTableIdItems().length === 0 ){
            this.view.textArea.ctrl.showError();
            this.view.textArea.ctrl.hideSuccess();
            return false;
        }else{
            this.view.textArea.ctrl.hideError();
            this.view.textArea.ctrl.showSuccess();
            return true;
        }
    },
    _getTableIdItems: function(){
        var elementId = [];
        var _self = this;
        var tableBody = _self.view.table.find(".base-table .tbody").find("input");
        for (var i = 0; i < tableBody.length; i++) {
            var element = parseInt(tableBody[i].getAttribute("data-id").replace('js_', ''), 10);
            if (tableBody[i].checked) {
                elementId.push(element);
            }
        }
        return elementId;
    },
    getItem: function(){
        var selected = this._getTableIdItems();
        var txt = this.view.textArea.ctrl.getText();
       // var _data = _self.getData();
        for( var i = 0; i < selected.length; i++ ){
            for (var r = 0; r < this.comments.length; r++) {
                if( this.comments[r].id == selected[i] ){
                    txt += this.comments[r].justify + "\n";
                    break;
                }
            }
        }
        if(Array.isArray(this._data)){
            var items = [];
            for(var d = 0;  d < this._data.length; d++){
                items.push({
                    idPanel: this._data[d].panel.id,
                    idDigitalFile: this._data[d].idDigitialFile,
                    idReport: this._data[d].executedReportId,
                    comment: txt
                });
            }
            return items;
        }
        return {
            idPanel: this._data.panel.id,
            idDigitalFile: this._data.idDigitalFile,
            idReport: this._data.executedReportId,
            comment: txt
        };
    }
});