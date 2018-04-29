try {
    $.import('timp.dfg.server.models.tables', 'layoutHeader');
    this.layoutHeader = $.timp.dfg.server.models.tables.layoutHeader;
} catch (e) {
    this.layoutHeader = e;
}

try {
    $.import('timp.dfg.server.models.tables', 'layoutVersion');
    this.layoutVersion = $.timp.dfg.server.models.tables.layoutVersion;
} catch (e) {
    this.layoutVersion = e;
}

try {
    $.import('timp.dfg.server.models.tables', 'digitalFile');
    this.digitalFile = $.timp.dfg.server.models.tables.digitalFile;
} catch (e) {
    this.digitalFile = e;
}

try {
    $.import('timp.dfg.server.models.tables', 'layoutType');
    this.layoutType = $.timp.dfg.server.models.tables.layoutType;
} catch (e) {
    this.layoutType = e;
}


