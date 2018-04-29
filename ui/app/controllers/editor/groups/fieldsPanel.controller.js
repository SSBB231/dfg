sap.ui.controller('app.controllers.editor.groups.fieldsPanel', {
    onInit: function() {

    },
    onAfterRendering: function(html) {
        var _self = this;
        _self.view = $(html);
        _self.view.fieldsContainer = _self.view.find(".fields-draggable");
        _self.bindComponents();
        _self.addDraggable();
        _self.addDroppable();
    },
    bindComponents: function() {
        var _self = this;
        var data = _self.getData();
        var fields = data.fields;
      
        for (var i in fields) {
            var fieldWrapper = document.createElement("div");
            var fieldLabel = document.createElement("label");
         
            fieldWrapper.setAttribute("data-id", i);
            fieldWrapper.setAttribute("class", "group-field");
            fieldLabel.textContent = fields[i].label;
            fieldWrapper.appendChild(fieldLabel);
            _self.view.fieldsContainer.append(fieldWrapper);
        }



    },
    bindFields: function() {
        var _self = this;
    },
    addDraggable: function() {
        var _self = this;
        var fieldWrappers = document.querySelectorAll('#group-container .group-field');
        [].forEach.call(fieldWrappers, function(field) {
            $(field).attr("draggable", true);
            field.addEventListener('dragstart', function(e) {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData("dataId", e.target.getAttribute('data-id'))
                _self.coreServices.currentFieldDragId = e.target.getAttribute('data-id');
                e.dataTransfer.setDragImage(e.target, 0, 0);
                this.style.opacity = '0.7';
            }, false);
            field.addEventListener('dragend', function(e) {
                this.style.opacity = '1';
                _self.view.fieldsContainer.removeClass("over");
                $('.groupBy-droppable').removeClass("over");
                $('.totals-droppable').removeClass("over");
            }, false);
        });

    },
    addDroppable: function() {
        var _self = this;
        var fieldDraggableSelector = document.querySelectorAll('.fields-draggable')[0];
        fieldDraggableSelector.addEventListener('dragenter', function(e) {

            this.classList.add('over');
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            return false;
        }, false);
        fieldDraggableSelector.addEventListener('drop', function(e) {
            fieldDraggableSelector.appendChild(document.querySelectorAll('.group-field[data-id="' + _self.coreServices.currentFieldDragId + '"]')[0]);
            this.classList.remove('over');
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            return false;
        }, false);
        fieldDraggableSelector.addEventListener('dragover', function(e) {

            if (e.preventDefault) {
                e.preventDefault();
            }
            e.dataTransfer.dropEffect = 'move';
            return false;
        }, false);
    },
    resetFields: function() {
        var self = this;
    }
});
