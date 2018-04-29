//Config
$.import('timp.dfg.server.models', 'config');
this.config = $.timp.dfg.server.models.config;
$.import('timp.dfg.server.objects','classes');
this.classes = $.timp.dfg.server.objects.classes;

$.import('timp.dfg.server.controllers', 'digitalFile');
this.digitalFile = $.timp.dfg.server.controllers.digitalFile;

$.import('timp.dfg.server.controllers', 'digitalFile');
this.digitalFileType = $.timp.dfg.server.controllers.digitalFileType;

$.import('timp.dfg.server.controllers', 'layout');
this.layout = $.timp.dfg.server.controllers.layout;

$.import('timp.dfg.server.controllers', 'setting');
this.setting = $.timp.dfg.server.controllers.setting;

$.import('timp.dfg.server.models', 'layout');
this.modelLayout = $.timp.dfg.server.models.layout;

$.import("timp.dfg.server.models", "layoutVersion");
this.modelLayoutVersion = $.timp.dfg.server.models.layoutVersion;

$.import("timp.dfg.server.models", "layoutXStructure");
this.modelLayoutXStructure = $.timp.dfg.server.models.layoutXStructure;
$.import("timp.dfg.server.models", "SPED");
this.modelSPED =  $.timp.dfg.server.models.SPED;



$.import('timp.dfg.server.install','install');
this.install = $.timp.dfg.server.install.install;
try {
    $.import('timp.dfg.server.actions', 'actions');
    this.componentActions = $.timp.dfg.server.actions.actions;
} catch (e) {
    this.componentActions = e;
}
try {
    $.import('timp.dfg.server.controllers','SPED');
    var spedCtrl = $.timp.dfg.server.controllers.SPED;
    this.job = spedCtrl.evaluateSpedExecutions;
} catch (e) {
    this.job = e;
}
