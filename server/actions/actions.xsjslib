$.import('timp.core.server.api', 'api');
var core_api = $.timp.core.server.api.api;
var meta_action = core_api.meta_action;
var util = core_api.util;

this.issueDigitalFile =  meta_action.BaseAction({
    input: ['DFG::Setting', 'TFP::FiscalSubPeriod'],
    output: ['DFG::DigitalFile'],
    type: 1,
    close: 0,
    nameEnus: "Create Digital File",
    namePtbr: "Criar Arquivo Digital",
    action: function (setting, period) {
        $.import('timp.dfg.server.controllers', 'setting');
        var controllerSetting = $.timp.dfg.server.controllers.setting;
        $.import('timp.dfg.server.controllers', 'digitalFile');
        var controllerDigitalFile = $.timp.dfg.server.controllers.digitalFile;
        var settingCurr = controllerSetting.read({
            id: setting.id
        });
        period.subperiod = period.subPeriod;
        var execution = controllerSetting.execute({
            id: setting.id,
            filters: settingCurr.json.filters,
            company: period.idCompany,
            uf: period.uf,
            branch: period.idBranch,
            tax: period.idTax,
            subPeriod: period
        });
        var digitalFile = controllerDigitalFile.issue({
            idSetting: setting.version.id,
            name: settingCurr.name + ', ' + period.month + '/' + period.year,
            description: settingCurr.description,
            idCompany: period.idCompany,
            uf: period.uf,
            idBranch: period.idBranch,
            idTax: period.idTax,
            year: period.year,
            month: period.month,
            subperiod: period.subPeriod,
            digitalFile: execution,
            json: setting.json
        });
        var response = core_api.meta_object.BaseObject.getObject({type: 'DFG::DigitalFile', id: Number(digitalFile.id)});
        return [response];
    }
});

this.analyzeDigitalFile = meta_action.BaseAction({
    input: ['DFG::DigitalFile'],
    output: [],
    flags: {
        executed: "true",
        analyze: "true"
    },
    nameEnus: "Analyze Digital File",
    namePtbr: "Analisar Arquivo Digital",
    type: 0,
    close: 0,
    action: function (digitalFile) {
    }
});

this.analyzeDigitalFile.getURL = function (digitalFile) {
    return '/timp/dfg/#/executor?id=' + digitalFile.id + '&executed=' + this.flags.executed + '&analyze=' + this.flags.analyze;
};

this.executeDigitalFile = meta_action.BaseAction({
    input: ['DFG::DigitalFile'],
    output: ['DFG::DigitalFile'],
    flags: {
        executed: "true"
    },
    nameEnus: "Execute Digital File",
    namePtbr: "Executar Arquivo Digital",
    type: 0,
    close: 1,
    action: function (digitalFile) {
    }
});

this.executeDigitalFile.getURL = function (digitalFile) {
    return '/timp/dfg/#/executor?id=' + digitalFile.id + '&executed=' + this.flags.executed;
};

this.editDigitalFile = meta_action.BaseAction({
    input: ['DFG::DigitalFile'],
    output: [],
    type: 0,
    close: 1,
    nameEnus: "Edit Digital File",
    namePtbr: "Editar Arquivo Digital",
    action: function (digitalFile) {
    }
});

this.editDigitalFile.getURL = function (digitalFile) {
     return '/timp/dfg/#/editor?id=' + digitalFile.id;
};

this.executeLayout = meta_action.BaseAction({
    input: ['BFB::Layout','TFP::FiscalSubPeriod'],
    output: [],
    type: 0,
    close: 1,
    nameEnus: "Execute Layout",
    namePtbr: "Executar Layout",
    action: function (Layout) {
    }
});

this.executeLayout.getURL = function (Layout) {
     return '/timp/dfg/#/executor?id=' + Layout.id;
};

this.executeSetting = meta_action.BaseAction({
    input: ['DFG::Setting','TFP::FiscalSubPeriod'],
    output: [],
    type: 0,
    close: 1,
    nameEnus: "Execute Setting",
    namePtbr: "Executar Configuração",
    action: function (Setting) {
    }
});
this.executeSetting.getURL = function (setting, SubPeriod) {
     return '/timp/dfg/#/executor?id=' + setting.id + '&subperiod=' + SubPeriod.id;
};
this.executeSPED = meta_action.BaseAction({
    input: ['DFG::Sped','TFP::FiscalSubPeriod'],
    output: [],
    flags: {
        calculationBlocks: "true"
    },
    type: 0,
    close: 1,
    nameEnus: "Execute SPED",
    namePtbr: "Executar SPED",
    action: function(SPED){
        
    }
});
this.executeSPED.getURL = function(sped, SubPeriod) {
    return '/timp/dfg/#/executorSPED?id='+sped.id + '&subperiod='+SubPeriod.id;
};
this.executeCalculationBlock = meta_action.BaseAction({
    input: ['DFG::Sped','TFP::FiscalSubPeriod'],
    output: [],
    output: [],
    flags: {
        calculationBlocks: "true"
    },
    type: 0,
    close: 1,
    nameEnus: "Execute Calculation Block ",
    namePtbr: "Execução Bloco de Apuração",
    action: function(SPED){
        
    }
});
this.executeCalculationBlock.getURL = function(sped, SubPeriod) {
    return '/timp/dfg/#/executorSPED?id='+sped.id + '&subperiod='+SubPeriod.id+'&calculationBlocks=' + this.flags.calculationBlocks;
};
this.executeSPEDWebService = meta_action.BaseAction({
    input: ['DFG::Sped','TFP::FiscalSubPeriod'],
    output: [],
    type: 0,
    close: 1,
    nameEnus: "Execute Job SPED",
    namePtbr: "Executar Job SPED",
    action: function(SPED){
        
    }
});
this.executeSPEDWebService.getURL = function(sped, SubPeriod) {
    return '/timp/dfg/#/executorSPED?id='+sped.id + '&subperiod='+SubPeriod.id;
};
this.visualizeSPEDExternalFile = meta_action.BaseAction({
    input: ["DFG::Sped"],
    output: [],
    type: 0, 
    close: 1, 
    nameEnus: "Visualize Generated SPED File ",
    namePtbr: "Visualizar Arquivo do SPED Gerado",
    flags: {
       visualizeFile: "true"
    },
    action: function(SPED){
         
    }
}); 
this.visualizeSPEDExternalFile.getURL = function(sped){ 
    return '/timp/dfg/#/executor?idSPED='+sped.id;
};
this.executeAN3 = meta_action.BaseAction({
    input: ["DFG::AN3"],
    output: [],
    type: 0,
    close: 1,
    nameEnus: "Execute AN3",
    namePtbr: "Executar AN3",
    action: function(AN3){
        
    }
});
this.executeAN3.getURL = function(an3){
    return '/timp/dfg/#/executoran3?id='+an3.id;
};
this.sendDigitalFile = meta_action.BaseAction({
    input: ['DFG::DigitalFile'],
    output: ['DFG::DigitalFile'],
    flags: {
        executed: "true"
    },
    type: 0,
    close: 1,
    nameEnus: "Send Digital File",
    namePtbr: "Enviar Arquivo Digital",
    action: function (digitalFile) {
    }
});

this.sendDigitalFile.getURL = function (digitalFile) {
    return '/timp/dfg/#/executor?id=' + digitalFile.id + '&executed=' + this.flags.executed;
};

this.officializeDigitalFile = meta_action.BaseAction({
    input: ['DFG::DigitalFile'],
    output: ['DFG::DigitalFile'],
    flags: {
        executed: "true"
    },
    type: 0,
    close: 1,
     nameEnus: "Officialize Digital File",
    namePtbr: "Oficializar Arquivo Digital",
    action: function (digitalFile) {
    }
});

this.officializeDigitalFile.getURL = function (digitalFile) {
    return '/timp/dfg/#/executor?id=' + digitalFile.id + '&executed=' + this.flags.executed;
};