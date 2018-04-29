$.import('timp.core.server.api', 'api');
const coreApi = $.timp.core.server.api.api;
const Installer = coreApi.Installer;
const util = coreApi.util;
const _this = this;
$.import('timp.dfg.server.install.models', 'modelIndex');
const modelIndex = $.timp.dfg.server.install.models.modelIndex.models;

$.import('timp.dfg.server.install.objectActions', 'component');
$.import('timp.dfg.server.install.privileges', 'privileges');
$.import('timp.dfg.server.install.seeders', 'digitalFileType');
$.import('timp.dfg.server.install.seeders', 'digitalFileTypeText');
$.import('timp.dfg.server.install.seeders', 'panelJustify');
$.import('timp.dfg.server.install.seeders', 'panelStatus');
$.import('timp.dfg.server.install.seeders', 'panelStatusText');
$.import('timp.dfg.server.install.seeders', 'spedLabels');
$.import('timp.dfg.server.install.seeders', 'spedTDFTables');
$.import("timp.dfg.server.controllers", "SPED");
_this.metadata = {
    name: 'DFG',
    labelEnus: 'Digital File Generator',
    labelPtbr: 'Gestor de Obrigações'
};

_this.install = function(page) {
    const beforeInstall = function() {
        $.timp.dfg.server.controllers.SPED.dropSPEDTDFTables();
    };

    let seeder = coreApi.getParsedSeeder([
        $.timp.dfg.server.install.seeders.spedLabels.seeder,
        $.timp.dfg.server.install.seeders.spedTDFTables.seeder,
        $.timp.dfg.server.install.seeders.digitalFileType.seeder,
        $.timp.dfg.server.install.seeders.digitalFileTypeText.seeder,
        $.timp.dfg.server.install.seeders.panelStatus.seeder,
        $.timp.dfg.server.install.seeders.panelStatusText.seeder,
        $.timp.dfg.server.install.seeders.panelJustify.seeder
    ]);
    const component = _this.metadata;
    const i18n = [];
    const labels = [];

    const afterInstall = function() {
        const spedTdfTables = $.createBaseRuntimeModel(coreApi.schema.default.slice(1, -1), 'DFG::SPED_TDFTables');
        const spedLabels = $.createBaseRuntimeModel(coreApi.schema.default.slice(1, -1), 'DFG::SPED_Labels');
        const panelStatusText = $.createBaseRuntimeModel(coreApi.schema.default.slice(1, -1), 'DFG::PanelStatusText');
        const panelStatus = $.createBaseRuntimeModel(coreApi.schema.default.slice(1, -1), 'DFG::PanelStatus');
        const panelJustify = $.createBaseRuntimeModel(coreApi.schema.default.slice(1, -1), 'DFG::PanelJustify');
        const digitalFileType = $.createBaseRuntimeModel(coreApi.schema.default.slice(1, -1), 'DFG::DigitalFileType');
        const digitalFileTypeText = $.createBaseRuntimeModel(coreApi.schema.default.slice(1, -1), 'DFG::DigitalFileTypeText');
        const userModel = $.createBaseRuntimeModel(coreApi.schema.default.slice(1, -1), 'CORE::USER', false, true);
        let userId = userModel.find({
            where: [{
                field: 'hanaUser',
                operator: '$eq',
                value: coreApi.schema.default.slice(1, -1)
            }]
        }).results[0].id;
        let afterInstallResponse;
        $.lodash.forEach([spedTdfTables, spedLabels,
            panelStatusText,
            panelStatus,
            panelJustify,
            digitalFileType,
            digitalFileTypeText
        ], function(model) {
            afterInstallResponse = model.find({
                select: [{
                    field: 'ID'
                }],
                where: [{
                    field: 'CREATION.DATE',
                    operator: '$eq',
                    value: null
                }, {
                    field: 'CREATION.ID_USER',
                    operator: '$eq',
                    value: null
                }, {
                    field: 'MODIFICATION.DATE',
                    operator: '$eq',
                    value: null
                }, {
                    field: 'MODIFICATION.ID_USER',
                    operator: '$eq',
                    value: null
                }]
            });
            let ids = $.lodash.reduce(afterInstallResponse.results, function(status, result) {
                if ($.lodash.isInteger(result.ID)) {
                    status.push(result.ID);
                }
                return status;
            }, []);
            if (!$.lodash.isEmpty(ids)) {
                model.update({
                    'CREATION.DATE': 'current_date',
                    'MODIFICATION.DATE': 'current_date',
                    'CREATION.ID_USER': userId,
                    'MODIFICATION.ID_USER': userId
                }, {
                    where: [{
                        field: 'ID',
                        operator: '$in',
                        value: ids
                    }]
                });
            }
        });
    };

    let response = new Installer({
        models: modelIndex,
        beforeInstall: beforeInstall,
        afterInstall: afterInstall,
        seeder: seeder,
        component: component,
        i18n: i18n,
        privileges: $.timp.dfg.server.install.privileges.privileges.values,
        labels: labels,
		objectActions: $.timp.dfg.server.install.objectActions.component.component,
        page: page
    }, {
        returnSeederInstances: true
    }).install();

    return response;
};