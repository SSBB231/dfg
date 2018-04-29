jQuery.sap.registerModulePath("app", "ui/app");
jQuery.sap.require("js.formulaParser");
jQuery.sap.require("lib.FileSaver");
jQuery.sap.registerModulePath("js", "ui/js");
jQuery.sap.require('app.config.endpoints');
jQuery.sap.require("sap.ui.app.Application");
sap.ui.app.Application.extend("DFG", {
    config: null,
    /*Functions*/
    init: function() {
        this.config = {
            components: {
                dfgAccordion: "app.views.library.accordion",
                dfgFloatingPanel: "app.views.editor.floatingPanel",
                DFGFieldUnit: 'app.views.editor.body.DFGFieldUnit',
                DFGBlockUnit: 'app.views.editor.body.DFGBlockUnit',
                DFGRegisterUnit: 'app.views.editor.body.DFGRegisterUnit',
                CBGroup: 'app.views.dialogs.filters.CBGroup',
                CBField: 'app.views.dialogs.filters.CBField',
                CBValue: 'app.views.dialogs.filters.CBValue',
                ValueListRow: 'app.views.dialogs.filters.ValueListRow',
                RelationRecord: 'app.views.dialogs.RDRecord',
                RelationBlock: 'app.views.dialogs.RDBlock',
                RelationField: 'app.views.dialogs.RDField',
                LayoutBlock: 'app.views.an4.layoutBlock',
                LayoutRecord: 'app.views.an4.layoutRecord',
                LayoutField: 'app.views.an4.layoutField',
                LayoutRule: 'app.views.an4.layoutRule',
                keyRow: "app.views.editor.relations.relationKeys",
                relationRow: "app.views.editor.relations.relationStructures",
                relationConditionRow: "app.views.editor.relations.conditionFilter",
                advancedFilters: "app.views.library.advancedFilters",
                concatFieldSelect: 'app.views.dialogs.concat.concatFieldSelect',
                fieldPanel: 'app.views.editor.groups.fieldsPanel',
                an3Report: 'app.views.executoran3.an3Report',
                an4Report: 'app.views.executoran4.an4Report',
                /*API BFB*/
                form: "bfb.views.form",
                questionContainer: "app.views.executorSPED.ECF.questionContainer",
                fileECF: "app.views.executorSPED.fileECF",
                paginatorExecutor: "app.views.executor.paginator"
            },
            indexRoute: 'library',
            routes: {
                'library': {
                    layout: 'app.views.layouts.layout',
                    controller: 'app.controllers.library.library'
                },
                'editor': {
                    layout: 'app.views.layouts.editorLayout',
                    controller: 'app.controllers.editor.editorMain'
                },
                'exhibition': {
                    layout: 'app.views.layouts.editorLayout',
                    controller: 'app.controllers.editor.Exhibition'
                },
                'executor': {
                    layout: 'app.views.layouts.executorLayout',
                    controller: 'app.controllers.executor.landing'
                },
                'executoran3': {
                    layout: 'app.views.layouts.executorLayout',
                    controller: 'app.controllers.executoran3.landing'
                },
                'vieweran3': {
                    layout: "app.views.layouts.executorLayout",
                    controller: "app.controllers.vieweran3.landing"
                },
                'vieweran4': {
                    layout: "app.views.layouts.executorLayout",
                    controller: "app.controllers.vieweran4.landing"
                },
                'executoran4': {
                    layout: 'app.views.layouts.executorLayout',
                    controller: 'app.controllers.executoran4.landing'
                },
                'executorSPED': {
                    layout: 'app.views.layouts.executorLayout',
                    controller: 'app.controllers.executorSPED.landing'
                },
                'executorSCANC': {
                    layout: 'app.views.layouts.executorLayout',
                    controller: 'app.controllers.executorSPED.SCANC.landing' 
                },
                'editoran4': {
                    layout: 'app.views.layouts.an4Layout',
                    controller: 'app.controllers.an4.editor'
                },
                'xmlEditor': {
                    layout: 'app.views.layouts.editorLayout',
                    controller: 'app.controllers.xmlEditor.xmlEditorMain'
                },
                'xmlExecutor': {
                    layout: 'app.views.layouts.executorLayout',
                    controller: 'app.controllers.xmlExecutor.landing'
                }
            }
        };
    },
    main: function() {
        allTaxApp.init(this.config);
        String.prototype.toCamelCase = function() {
            return this.toLowerCase()
                .replace(/\s(.)/g, function($1) {
                    return $1.toUpperCase();
                })
                .replace(/\s/g, '')
                .replace(/^(.)/, function($1) {
                    return $1.toLowerCase();
                });
        };
        String.prototype.toUpperCamelCase = function() {
            return this.toCamelCase().capitalizeFirstLetter();
        };
        String.prototype.capitalizeFirstLetter = function() {
            return this.charAt(0).toUpperCase() + this.slice(1);
        };
    }
});
