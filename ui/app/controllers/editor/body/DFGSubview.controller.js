sap.ui.controller("app.controllers.editor.body.DFGSubview", {
    // data:{
    // 	subRegister:{
    // 		text: i18n('ADD SUBRECORD'),
    // 		class: "btn-text",
    // 		iconFont: "Sign-and-Symbols",
    // 		icon: "plussign",
    // 		hasTransition: true/false
    // 	}
    // },

    onDataRefactor: function(data) {
        return $.extend(data, this.data)
    },

    onInit: function() {},

    onAfterRendering: function(html) {
        var _self = this;
        _self.loader = $("body").baseLoader({
            modal: true
        });

        _self.layoutObject = _self.services.layoutObject;
        _self.unique = false;
        this.view = $(html);
        $(this.view).data('id', _self.getData().recordId);
        this.view.input = this.view.find('.register-head .register-input');
        this.view.addRegisterBtn = this.view.find('.register-body .btn-add-subregister');
        this.view.registerList = this.view.find('.register-body .register-list-wrapper');
        this.view.fieldList = this.view.find('.register-body .field-list-wrapper');
        this.view.expandBtn = this.view.find('.register-head .btn-expand');
        this.view.collapseBtn = this.view.find('.register-head .btn-collapse');
        this.view.deleteBtn = this.view.find('.register-head .delete-record');
        this.view.defineKeysBtn = this.view.find('.btn-def-keys');
        this.renderFields();
        this.bindElements();
        this.bindEvents();
        $('.register-button .btn-add-subregister').hide();

    },
    bindElements: function() {
        var _self = this;

        if (!_self.coreServices.layoutObject.blocks[_self.getData().parentBlockId].records[_self.getData().parentRecordId].subRecord) {
            _self.view.input.ctrl = _self.view.input.bindBaseInput({
                tooltip: i18n('SUB RECORD INPUT TOOLTIP'),
                onChange:function(oldVal,newVal){
                    if(oldVal!==newVal){
                        _self.coreServices.hasChanged = true;                          
                    }
                }
            })
        } else {
            _self.view.input.ctrl = _self.view.input.bindBaseInput({
                tooltip: i18n('SUB RECORD INPUT TOOLTIP'),
                onChange:function(oldVal,newVal){
                    if(oldVal!==newVal){
                        _self.coreServices.hasChanged = true;                               
                    }
                }
            })
                .setText(_self.coreServices.layoutObject.blocks[_self.getData().parentBlockId].records[_self.getData().parentRecordId].subRecord.child);
        }
        _self.view.fieldList.droppable({
            accept: '.field-wrapper',
            // activeClass: "",
            hoverClass: 'droppable-active',
            activeClass: 'droppable-active',
            drop: function(e, ui) {

                var field = $(ui.draggable).data();
                if ($(ui.draggable).find('.field-label')[0]) {
                    field.label = $(ui.draggable).find('.field-label')[0].innerHTML;
                }
                var target = $(e.target);
                // var fieldData = {
                // 	id: $(field).data('id'),
                // 	label: $(field).find('.field-label')[0].innerHTML,
                // 	type: $(field).data('type'),
                // 	hanaName: $(field).data('hananame')
                // }
                _self.buildField(field, target);
                _self.coreServices.hasChanged = true;
            }
        });
        _self.view.deleteBtn.attr('tabindex', '0');
        _self.view.deleteBtn.baseTooltip({
            class: 'dark',
            position: 'top',
            text: i18n('DELETE RECORD TOOLTIP')
        });
        _self.view.defineKeysBtn.attr('tabindex', '0');
        _self.view.defineKeysBtn.baseTooltip({
            class: 'dark',
            position: 'top',
            text: i18n('ADD RULE TOOLTIP')
        });
    },

    _sortableFields: function() {
        var _self = this;
        _self.view.fieldList.sortable({
            // handle: '.icon-drag',
            helper: function(e, ui) {
                var _clone = $(ui).html();
                var holder = $('<div>').addClass('field-sortable-helper').addClass('record-field-wrapper').width($(ui).outerWidth());
                holder.append(_clone);
                this.holder = holder;
                return holder;
            },
            items: '.record-field-wrapper',
            containment: _self.view.fieldList,
            placeholder: 'record-field-placeholder',
            // start: function(event, ui) {
            // },
            // change: function(event, ui) {
            // },
            // over: function(event, ui) {
            // },
            // update: function(event, ui) {
            // },
            // stop: function(event, ui) {
            // }
        });
    },
    buildField: function(field, ele) {

        var _self = this;
        var fieldData = {};
        var currentColumns = _self.layoutObject.blocks[_self.getData().parentBlockId].records[_self.getData().parentRecordId].columns;
        var currentColumnsParam = _self.layoutObject.blocks[_self.getData().parentBlockId].records[_self.getData().parentRecordId].columns;

        if (field.id == 'formula') {
            fieldData.id = "f" + _self.getFormulaId();
            fieldData.label = field.label + ' ' + fieldData.id;
            currentColumns[fieldData.id] = {
                fieldId: null,
                formula: {}
            };
        } else if (field.id == 'recordId') {
            fieldData.id = field.id;
            fieldData.label = field.label;
            currentColumns[fieldData.id] = {
                fieldId: fieldData.id
            };
        } else if (field.id == 'manualParam') {
            fieldData.id = "m" + _self.getmanualParamId();
            fieldData.label = field.label + ' ' + fieldData.id;
            currentColumns[fieldData.id] = {
                fieldId: null,
                manualParam: {}
            };
        } else if (field.id == 'version') {
            fieldData.id = "v" + _self.getVersionId();
            fieldData.label = field.label + ' ' + fieldData.id;
            currentColumns[fieldData.id] = {
                fieldId: null,
                isVersion: true
            };
        } else if (field.id === 'newline') {
            fieldData.id = field.id;
            fieldData.label = field.label;
            currentColumns[field.id] = {
                fieldId: null,
                isLineBreak: true
            };
        } else if (field.id == 'blockTotal') {
            fieldData.id = field.id;
            fieldData.label = field.label;
            currentColumns[field.id] = {
                fieldId: null,
                isBlocksTotal: true
            };
        } else if (field.id == 'recordsTotals') {
            fieldData.id = field.id;
            fieldData.label = field.label;
            currentColumns[fieldData.id] = {
                fieldId: null,
                isRecordsTotals: true
            };
        } else if (field.id == 'totalsAll') {
            fieldData.id = field.id;
            fieldData.label = field.label;
            currentColumns[fieldData.id] = {
                fieldId: null,
                isTotalsAll: true
            };
        } else if (field.id == 'initialDateReference') {
            fieldData.id = field.id;
            fieldData.label = field.label;
            currentColumns[fieldData.id] = {
                fieldId: null,
                isInitialDateReference: true
            };
        } else if (field.id === 'finalDateReference') {
            fieldData.id = field.id;
            fieldData.label = field.label;
            currentColumns[fieldData.id] = {
                fieldId: null,
                isFinalDateReference: true
            };
        } else if (field.id == 'blockStarter') {
            fieldData.id = field.id;
            fieldData.label = field.label;
            currentColumns[fieldData.id] = {
                fieldId: null,
                blockStarter: true,
                format: {
                    number: {
                        size: 10,
                        align: 1,
                        complement: 0,
                        searchFor: '',
                        replaceWith: '',
                        decimal: '',
                        decimalSeparator: '',
                        miliarSeparator: ''
                    }
                }
            };
        } else {
            var currStructure = field.idstructure;
            if (currStructure != _self.layoutObject.blocks[_self.getData().parentBlockId].records[_self.getData().parentRecordId].idStructure) {
                $.baseToast({
                    text: i18n['DFG102003'],
                    isError: true
                });
                return;
            }
            fieldData = _self.services.structure[currStructure].fields[field.id];
            currentColumns[fieldData.id] = {
                fieldId: fieldData.id
            };
        }

        var newField = _self.loadField(ele, fieldData);
        _self.layoutObject.fields[fieldData.id] = fieldData;
        _self._sortableFields();

        if (currentColumns[fieldData.id].formula) {
            _self.services.openFormulaDialog(_self.getData().parentBlockId, _self.getData().parentRecordId, fieldData.id);
        }
        if (currentColumnsParam[fieldData.id].manualParam) {
            _self.services.openParamDialog(_self.getData().parentBlockId, _self.getData().parentRecordId, fieldData.id);
        }
        if (currentColumnsParam[fieldData.id].filler) {
            _self.services.openFillerDialog(_self.getData().parentBlockId, _self.getData().parentRecordId, fieldData.id);
        }
        if (currentColumnsParam[fieldData.id].sequenceField) {
            _self.services.openSequenceFieldDialog(_self.getData().parentBlockId, _self.getData().parentRecordId, fieldData.id);
        }
        if (currentColumnsParam[fieldData.id].fixedField) {
            _self.services.openFixedFieldDialog(_self.getData().parentBlockId, _self.getData().parentRecordId, fieldData.id);
        }
        if (currentColumns[fieldData.id].version) {
            _self.services.openVersionDialog(_self.getData().parentBlockId, _self.getData().parentRecordId, fieldData.id);
        }
        return newField;
    },

    loadField: function(target, fieldData) {
        var _self = this;
        return $(target).bindDFGFieldUnit({
            fieldData: fieldData,
            blockId: _self.getData().parentBlockId,
            recordId: _self.getData().parentRecordId,
            services: _self.services
        });
    },

    bindEvents: function() {
        var _self = this;

        _self.view.addRegisterBtn.click(function() {
            if (!_self.unique) {
                _self.unique = true;

                var subView = new sap.ui.view({
                    viewName: "app.views.editor.body.DFGSubview",
                    type: sap.ui.core.mvc.ViewType.HTML
                });
                _self.view.registerList.bindView(subView, {});

                // _self.view.registerList.bindDFGRegisterUnit({});

            } else {
                // console.log("Already clicked.");
            }
        });
        this.view.collapseBtn.click(function() {
            _self.view.addClass('collapsed');
        });
        this.view.expandBtn.click(function() {
            _self.view.removeClass('collapsed');
        });
        var sizeRegister = $('.register-wrapper').size();
        $('div.controladoresTop .totalrecords .num').html(sizeRegister);
        _self.view.deleteBtn.click(function() {
            _self.getData().register.unique = false;
            _self.removeRegister();
            _self.coreServices.hasChanged = true;
        });
        _self.view.deleteBtn.keydown(function(ev) {
            if (ev.keyCode == 32 || ev.keyCode == 13) {
                this.click();
            }
        });
        _self.view.defineKeysBtn.keydown(function(ev) {
            if (ev.keyCode == 32 || ev.keyCode == 13) {
                this.click();
            }
        });
        _self.view.defineKeysBtn.click(function() {
            _self.openRelationsDialog();
        });
    },
    openRelationsDialog: function() {
        var _self = this;

        _self.relationsDialog = $.baseDialog({
            title: i18n('RECORD RELATIONS'),
            modal: true,
            size: 'big',
            outerClick: 'disabled',
            viewName: 'app.views.dialogs.RecordRelations',
            viewData: {
                block: _self.layoutObject.blocks[_self.getData().parentBlockId],
                services: _self.services,
                layoutObject: _self.coreServices.layoutObject
            },
            buttons: [{
                name: i18n('CANCEL'),
                isCloseButton: true,
                /*click: function(){
                	_self.relationsDialog.close();
                },*/
                tooltip: i18n('CLICK PRESS CANCEL')
            }, {
                name: i18n('APPLY'),
                click: function() {
                    _self.coreServices.layoutObject.relations = _self.relationsDialog.getInnerController().getRelationChanges();
                    _self.relationsDialog.close();
                    _self.coreServices.hasChanged = true;
                },
                tooltip: i18n('CLICK PRESS CONFIRM')
            }]
        });
        _self.relationsDialog.open();
    },
    // designRulesDialog: function(){
    // 	var _self = this;

    // 		console.log(_self.layoutObject.blocks[_self.getData().parentBlockId]);


    // 	_self.DesignRules = $.baseDialog({
    // 		title: i18n("RECORDTIONS"),
    // 		modal: true,
    // 		size: "wide",
    // 		outerClick: 'disabled',
    // 		viewName: "app.views.editor.recordRelations",
    // 		cssClass: "newFile Rules",
    // 		viewData: {
    // 			block:_self.layoutObject.blocks[_self.getData().parentBlockId],
    // 			services: _self.services,
    // 			estrutura: _self.idEstrutura
    // 		},
    // 		buttons: [{
    // 			name: i18n('CANCEL'),
    // 			click: function(){
    // 				_self.DesignRules.close();
    // 			},
    // 			tooltip: i18n('CLICK PRESS CANCEL')
    // 		},{
    // 			name: i18n('NEXT'),
    // 			click: function(){
    // 				if (_self.getRules())
    // 				{
    // 					_self.createRulesDescScreen();
    // 				}
    // 			},
    // 			tooltip: i18n('CLICK PRESS CONFIRM')
    // 		}]
    // 	});
    // 	_self.DesignRules.open();
    // 	_self.firstButton = $(_self.DesignRules._buttons).find("button")[0];
    // 	_self.secondButton = $(_self.DesignRules._buttons).find("button")[1];
    // },
    setButtonsClick: function(obj) {
        var _self = this;

        if (obj.first) {
            $(_self.firstButton).unbind("click").on("click", obj.first);
        }
        if (obj.second) {
            $(_self.secondButton).unbind("click").on("click", obj.second);
        }
    },
    changeButtonsLabel: function(obj) {
        var _self = this;
        if (obj.first) {
            $(_self.firstButton).text(obj.first)
        }
        if (obj.second) {
            $(_self.secondButton).text(obj.second);
        }
    },
    addRulesScreen: function() {
        var _self = this;

        function afterEndpoint() {
            // _self.dialog._title.text(_self.listItemSelected.find("label").text());
            _self.DesignRules._content.empty();
            _self.changeButtonsLabel({
                first: i18n("CANCEL"),
                second: i18n("NEXT")
            })
            _self.setButtonsClick({
                first: function() {
                    _self.DesignRules.close();
                },
                second: function() {
                    if (_self.getRules()) {
                        _self.createRulesDescScreen();
                    }
                }
            });
            var view = new sap.ui.view({
                viewName: "app.views.editor.DesignRules",
                type: sap.ui.core.mvc.ViewType.HTML
            });
            _self.descController = _self.DesignRules._content.bindView(view, {
                services: _self.services,
                estrutura: _self.idEstrutura,
                cssClass: "newFile Rules",
                _selected_rules: _self._selected_rules
            });
        }
        _self._temp_rules = [];
        _self.loader.open();
        Data.endpoints.bre.rule.list.post({
            structure: _self.idEstrutura,
            type: "AN3"
        }).success(function(_data_structures) {
            _self.descData = [];
            if (_data_structures) {
                _data_structures.map(function(_rule) {
                    _self._temp_rules[_rule.id] = _rule;
                });
            }
            Data.endpoints.bre.rule.transcripts.post({
                lang: _self.lang,
                rules: _self._selected_rules
            }).success(function(data) {
                _self.loader.close();
                if (data) {
                    Object.keys(data).forEach(function(_t) {
                        _self.descData.push({
                            id: _t,
                            name: _self._temp_rules[_t].name,
                            description: _self._temp_rules[_t].description,
                            formula: data[_t]
                        })
                    });
                }
                afterEndpoint();
            }).error(function(data) {
                _self.loader.close();
                // console.log(data);
            });
        }).error(function(data) {
            _self.loader.close();
            // console.log(data);
        });
        //call endpoint!
    },
    createRulesObject: function() {
        var _self = this;
        var rulesObj = [];
        $.each(_self._selected_rules, function(index, val) {
            rulesObj[val] = {
                type: 0
            };
        });
        _self.services.rulesObj = rulesObj;
    },
    createRulesDescScreen: function() {
        var _self = this;

        function afterEndpoint() {
            // _self.dialog._title.text(_self.listItemSelected.find("label").text());
            _self.DesignRules._content.empty();
            _self.changeButtonsLabel({
                first: i18n("BACK"),
                second: i18n("APPLY")
            })
            _self.setButtonsClick({
                first: function() {
                    _self.addRulesScreen();
                },
                second: function() {
                    // _self.createRulesParametersScreen();
                    _self.createRulesObject();
                    _self.DesignRules.close();
                }
            });
            _self.descView = new sap.ui.view({
                viewName: "app.views.editor.DesignRulesDesc",
                type: sap.ui.core.mvc.ViewType.HTML

            });
            _self.descController = _self.DesignRules._content.bindView(_self.descView, _self.descData);
        }
        _self._temp_rules = [];
        _self.loader.open();
        Data.endpoints.bre.rule.list.post({
            structure: _self.idEstrutura,
            type: "AN3"
        }).success(function(_data_structures) {
            _self.descData = [];
            if (_data_structures) {
                _data_structures.map(function(_rule) {
                    _self._temp_rules[_rule.id] = _rule;
                });
            }
            Data.endpoints.bre.rule.transcripts.post({
                lang: _self.lang,
                rules: _self._selected_rules
            }).success(function(data) {
                _self.loader.close();
                if (data) {
                    Object.keys(data).forEach(function(_t) {
                        _self.descData.push({
                            id: _t,
                            name: _self._temp_rules[_t].name,
                            description: _self._temp_rules[_t].description,
                            formula: data[_t]
                        })
                    });
                }
                afterEndpoint();
            }).error(function(data) {
                _self.loader.close();
                // console.log(data);
            });
        }).error(function(data) {
            _self.loader.close();
            // console.log(data);
        });
        //call endpoint!
    },
    getRules: function() {
        var _self = this;
        var result = true;
        _self._selected_rules = [];
        var tableRules = $("#TableRules");
        tableRules.find('.base-table .tbody .tr').each(function(_index, _val) {
            if ($(_val).find('.td.checkbox input').prop("checked")) {
                var _rule_id = $(_val).data('id');
                _self._selected_rules.push($(_val).data('id'));
            }
        });
        if (_self._selected_rules.length == 0) {
            $.baseToast({
                text: i18n['WARNING NO ' + (_self.paramJson_rules ? 'RULE' : 'REGULATION')],
                isWarning: true
            });
            result = false;
        }
        return result;
    },
    removeRegister: function() {
        var _self = this;
        _self.view.remove();
        if (_self.coreServices.layoutObject.blocks[_self.getData().parentBlockId]) {
            delete _self.coreServices.layoutObject.blocks[_self.getData().parentBlockId].records[_self.getData().recordId];
            delete _self.coreServices.layoutObject.blocks[_self.getData().parentBlockId].records[_self.getData().parentRecordId].subRecord;
            _self.unique = false;
        }
        var sizeRegister = $('.register-wrapper').size();
        $('div.controladoresTop .totalrecords .num').html(sizeRegister);
        _self.coreServices.hasChanged = true;
    },
    renderFields: function() {
        var _self = this;
        var currentRecord = _self.coreServices.layoutObject.blocks[_self.getData().parentBlockId].records[_self.getData().recordId];
        var parentRecord = _self.coreServices.layoutObject.blocks[_self.getData().parentBlockId].records[_self.getData().parentRecordId];
        var fields = _self.coreServices.structure[parentRecord.idStructure].fields;
        var target = _self.view.fieldList;

        var positions = currentRecord.positions;

        for (var i = 0; i < positions.length; i++) {
            var currCol = parentRecord.columns[positions[i]];
            if (currCol.fieldId) {
                fields[currCol.fieldId].id = fields[currCol.fieldId].ID;
                _self.loadField(target, fields[currCol.fieldId]);
            } else if (currCol.recordId) {
                _self.loadField(target, {
                    id: positions[i],
                    label: i18n('RECORDID')
                });
            } else if (currCol.formula) {
                _self.loadField(target, {
                    id: positions[i],
                    label: i18n('FORMULA') + ' ' + positions[i]
                });
            } else if (currCol.manualParam) {
                _self.loadField(target, {
                    id: positions[i],
                    label: i18n('PARAMETRO') + ' ' + positions[i]
                });
            } else if (currCol.version) {
                _self.loadField(target, {
                    id: positions[i],
                    label: i18n('VERSION') + ' ' + positions[i]
                });
            }else if (currCol.isBlocksTotal) {
                _self.loadField(target, {
                    id: positions[i],
                    label: i18n('BLOCKTOTAL')
                });
            } else if (currCol.isTotalsAll) {
                _self.loadField(target, {
                    id: positions[i],
                    label: i18n('TOTALALL')
                });
            } else if (currCol.isRecordsTotals) {
                _self.loadField(target, {
                    id: positions[i],
                    label: i18n('RECORDTOTAL')
                });
            } else if (currCol.blockStarter) {
                _self.loadField(target, {
                    id: positions[i],
                    label: i18n('BLOCKSTARTER')
                });
            }else if (currCol.fixedField) {
                _self.loadField(target, {
                    id: positions[i],
                    label: i18n('FIXED FIELD')
                });
            }
        }
        _self._sortableFields();
    },
    getFormulaId: function() {
        var _self = this;
        var currColumns = _self.layoutObject.blocks[_self.getData().parentBlockId].records[_self.getData().parentRecordId].columns;
        var newFormulaCols = {};
        var countFormula = 0;
        for (var i in currColumns) {
            if (currColumns[i].formula) {
                newFormulaCols["f" + countFormula] = currColumns[i];
                delete currColumns[i];
                countFormula++;
            }
        }
        for (var i in newFormulaCols) {
            currColumns[i] = newFormulaCols[i];
        }
        return countFormula;
    },
    getVersionId: function() {
        var _self = this;
        var currColumns = _self.layoutObject.blocks[_self.getData().parentBlockId].records[_self.getData().parentRecordId].columns;
        var newFormulaCols = {};
        var countVersion = 0;
        for (var i in currColumns) {
            if (currColumns[i].version) {
                newFormulaCols["v" + countVersion] = currColumns[i];
                delete currColumns[i];
                countVersion++;
            }
        }
        for (var i in newFormulaCols) {
            currColumns[i] = newFormulaCols[i];
        }
        return countVersion;
    },
    getmanualParamId: function() {
        var _self = this;
        var currColumns = _self.layoutObject.blocks[_self.getData().parentBlockId].records[_self.getData().parentRecordId].columns;
        var newFormulaCols = {};
        var countParam = 0;
        for (var i in currColumns) {
            if (currColumns[i].manualParam) {
                newFormulaCols["m" + countParam] = currColumns[i];
                delete currColumns[i];
                countParam++;
            }
        }
        for (var i in newFormulaCols) {
            currColumns[i] = newFormulaCols[i];
        }
        return countParam;
    },
    addBlockStarter: function() {
        var _self = this;
        _self.blockStarter = _self.buildField({
            id: 'blockStarter',
            label: i18n('BLOCKSTARTER')
        }, _self.view.fieldList);
    },
    removeBlockStarter: function() {
        if (this.blockStarter) {
            this.blockStarter.removeRegister();
        };
    }

});
