 $.import("timp.core.server.api", "api");
 var core_api = $.timp.core.server.api.api;
 var util = core_api.util;
 var def_table = core_api.table_lib;

 //$.import('timp.schema.server.api','api');
 //var schema_api = $.timp.schema.server.api.api;
 //var schema = schema_api.schema;
 var schema = core_api.schema;

 var an4Table = new def_table.Table({
     component: "DFG",
     name: schema.default+'."DFG::AN4"',
     default_fields: "common",
     fields: {
         id: new def_table.AutoField({
             name: 'ID',
             pk: true,
             auto: schema.default+'."DFG::AN4::ID".nextval',
             type: $.db.types.INTEGER
         }),
         name: new def_table.Field({
             name: 'NAME',
             type: $.db.types.NVARCHAR,
             dimension: 100
         }),
         description: new def_table.Field({
             name: 'DESCRIPTION',
             type: $.db.types.NVARCHAR,
             dimension: 250
         }),
         idLayoutVersionReference: new def_table.Field({
             name: 'ID_LAYOUT_VERSION_REFERENCE',
             type: $.db.types.INTEGER
         }),
         originReference: new def_table.Field({
             name: 'ORIGIN_REFERENCE',
             type: $.db.types.INTEGER,
             translate: { 1: 'DFG', 2: 'EXTERNAL' }
         }),
         idLayoutVersionComparison: new def_table.Field({
             name: 'ID_LAYOUT_VERSION_COMPARISON',
             type: $.db.types.INTEGER
         }),
         originComparison: new def_table.Field({
             name: 'ORIGIN_COMPARISON',
             type: $.db.types.INTEGER,
             translate: { 1: 'DFG', 2: 'EXTERNAL' }
         })
     }
 });
 this.an4Table = an4Table;

 var an4XBFBLayout = new def_table.Table({
     component: "DFG",
     name: schema.default+'."DFG::AN4XBFBLayout"',
     default_fields: "common",
     fields: {
         id: new def_table.AutoField({
             name: 'ID',
             pk: true,
             auto: schema.default+'."DFG::AN4XBFBLayout::ID".nextval',
             type: $.db.types.INTEGER
         }),
         idBFBLayout: new def_table.Field({
             name: 'ID_BFB_LAYOUT',
             type: $.db.types.INTEGER
         }),
         idAN4: new def_table.Field({
             name: 'ID_AN4',
             type: $.db.types.INTEGER
         }),
         isReference: new def_table.Field({
             name: 'IS_REFERENCE',
             type: $.db.types.INTEGER
         })
     }
 });
 this.an4XBFBLayout = an4XBFBLayout;

 var an4XDigitalFile = new def_table.Table({
     component: "DFG",
     name: schema.default+'."DFG::AN4XDigitalFile"',
     default_fields: "common",
     fields: {
         id: new def_table.AutoField({
             name: 'ID',
             pk: true,
             auto: schema.default+'."DFG::AN4XDigitalFile::ID".nextval',
             type: $.db.types.INTEGER
         }),
         idDigitalFile: new def_table.Field({
             name: 'ID_DIGITAL_FILE',
             type: $.db.types.INTEGER
         }),
         idAN4: new def_table.Field({
             name: 'ID_AN4',
             type: $.db.types.INTEGER
         }),
         isReference: new def_table.Field({
             name: 'IS_REFERENCE',
             type: $.db.types.INTEGER
         })
     }
 });

 this.an4XDigitalFile = an4XDigitalFile;
 var an4XExternalFile = new def_table.Table({
     component: "DFG",
     name: schema.default+'."DFG::AN4XExternalFile"',
     default_fields: "common",
     fields: {
         id: new def_table.AutoField({
             name: 'ID',
             pk: true,
             auto: schema.default+'."DFG::AN4XExternalFile::ID".nextval',
             type: $.db.types.INTEGER
         }),
         idAN4: new def_table.Field({
             name: 'ID_AN4',
             type: $.db.types.INTEGER
         }),
         externalFileName: new def_table.Field({
             name: "EXTERNAL_FILE_NAME",
             type: $.db.types.NVARCHAR,
             dimension: 100
         }),
         externalFile: new def_table.Field({
             name: 'EXTERNAL_FILE',
             type: $.db.types.NCLOB
         }),
         isReference: new def_table.Field({
             name: 'IS_REFERENCE',
             type: $.db.types.INTEGER
         })
     }
 });
 this.an4XExternalFile = an4XExternalFile;
 var an4XRule = new def_table.Table({
     component: "DFG",
     name: schema.default+'."DFG::AN4XRule"',
     default_fields: "common",
     fields: {
         id: new def_table.AutoField({
             name: 'ID',
             pk: true,
             auto: schema.default+'."DFG::AN4XRule::ID".nextval',
             type: $.db.types.INTEGER
         }),
         idAN4: new def_table.Field({
             name: 'ID_AN4',
             type: $.db.types.INTEGER
         }),
         idRule: new def_table.Field({
             name: 'ID_RULE',
             type: $.db.types.INTEGER
         })
     }
 });
 this.an4XRule = an4XRule;

 var an4Report = new def_table.Table({
     component: "DFG",
     name: schema.default+'."DFG::AN4Report"',
     default_fields: "common",
     fields: {
         id: new def_table.AutoField({
             name: 'ID',
             pk: true,
             auto: schema.default+'."DFG::AN4Report::ID".nextval',
             type: $.db.types.INTEGER
         }),
         idAN4: new def_table.Field({
             name: 'ID_AN4',
             type: $.db.types.INTEGER
         }),
         name: new def_table.Field({
             name: 'NAME',
             type: $.db.types.NVARCHAR,
             dimension: 50
         }),
         description: new def_table.Field({
             name: 'DESCRIPTION',
             type: $.db.types.NVARCHAR,
             dimension: 150
         }),
         report: new def_table.Field({
             name: "REPORT",
             type: $.db.types.NCLOB
         })
     }
 });
 this.an4Report = an4Report;
 this.an4Report.createAN4Report = function(object) {
     var createOptions = {
         name: object.name || null,
         description: object.description || null,
         idAN4: object.idAN4 || null,
         report: object.report || null
     };
     var report = this.CREATE(createOptions);
     return report;
 };
 this.readAN4 = function(object) {
     if (typeof object === "number") {
         return this.an4Table.READ({
             where: [{
                 field: "id",
                 oper: "=",
                 value: object
             }]
         })[0];
     }
     var options = this.getOptions(object);
     return this.an4Table.READ(options);
 };

 this.createAN4 = function(object) {
     var createOptions = {
         name: object.name || null,
         description: object.description || null,
         idLayoutVersionReference: object.idLayoutVersionReference || null,
         idLayoutVersionComparison: object.idLayoutVersionComparison || null,
         originReference: object.originReference || null,
         originComparison: object.originComparison || null
     };
     var an4 = this.an4Table.CREATE(createOptions);
     if (object.hasOwnProperty("idBFBLayoutReference") && object.idBFBLayoutReference) {
         var createOptionsAN4XBFB = {
             idAN4: an4.id,
             idBFBLayout: object.idBFBLayoutReference,
             isReference: 1
         };
         an4.AN4XBFB = this.an4XBFBLayout.CREATE(createOptionsAN4XBFB);
     }
     if(object.hasOwnProperty("idBFBLayoutComparison") && object.idBFBLayoutComparison) {
         var createOptionsAN4XBFB = {
             idAN4: an4.id,
             idBFBLayout: object.idBFBLayoutComparison,
             isReference: 0
         };
         an4.AN4XBFB = this.an4XBFBLayout.CREATE(createOptionsAN4XBFB);
     }
     if (object.hasOwnProperty("externalFileReference") && object.externalFileReference && object.externalFileReference !== "") {
         var createOptionsAN4XExternalFile = {
             idAN4: an4.id,
             externalFile: object.externalFileReference || null,
             externalFileName: object.externalFileNameReference || null,
             isReference: 1
         };
         an4.AN4XExternalFile = this.an4XExternalFile.CREATE(createOptionsAN4XExternalFile);
     }
     if (object.hasOwnProperty("externalFileComparison") && object.externalFileComparison && object.externalFileComparison !== "") {
         var createOptionsAN4XExternalFile = {
             idAN4: an4.id,
             externalFile: object.externalFileComparison || null,
             externalFileName: object.externalFileNameComparison || null,
             isReference: 0
         };
         an4.AN4XExternalFile = this.an4XExternalFile.CREATE(createOptionsAN4XExternalFile);
     }
     if (object.hasOwnProperty("idDigitalFileReference") && object.idDigitalFileReference) {
         var createOptionsAN4XDigitalFile = {
             idAN4: an4.id,
             idDigitalFile: object.idDigitalFileReference,
             isReference: 1
         };
         an4.AN4XDigitalFile = this.an4XDigitalFile.CREATE(createOptionsAN4XDigitalFile);
     }
     if (object.hasOwnProperty("idDigitalFileComparison") && object.idDigitalFileComparison) {
         var createOptionsAN4XDigitalFile = {
             idAN4: an4.id,
             idDigitalFile: object.idDigitalFileComparison,
             isReference: 0
         };
         an4.AN4XDigitalFile = this.an4XDigitalFile.CREATE(createOptionsAN4XDigitalFile);
     }
     if (object.hasOwnProperty("idRules") && object.idRules) {
         var createOptionsAN4XRule = {
             idAN4: an4.id
         };
         an4.AN4XRules = [];
         for (var i = 0; i < object.idRules.length; i++) {
             createOptionsAN4XRule.idRule = object.idRules[i];
             an4.AN4XRules.push(this.an4XRule.CREATE(createOptionsAN4XRule));
         }
     }
     return an4;
 };

 this.updateAN4 = function(object, where) {
     var properties = Object.keys(this.an4Table.fields);
     var options = {
         id: object.id
     };
     for (var i = 0; i < properties.length; i++) {
         if (object[properties[i]]) {
             options[properties[i]] = object[properties[i]];
         }
     }
     if (where !== undefined) {
         return this.an4Table.UPDATEWHERE(options, where);
     }
     return this.an4Table.UPDATE(options);
 };



 this.getOptions = function(object) {
     var options = {};
     if (object.fields) {
         options.fields = object.fields;
     }
     if (object.where) {
         options.where = object.where;
     }
     if (object.join) {
         options.join = object.join;
     }
     if (object.count) {
         options.count = object.count;
     }
     if (object.order_by) {
         options.order_by = object.order_by;
         options.orderBy = object.order_by;
     }
     if (object.group_by) {
         options.groupBy = object.group_by;
         options.group_by = object.group_by;
     }
     if (object.distinct) {
         options.distinct = object.distinct;
     }
     if (object.paginate) {
         options.paginate = object.paginate;
     }
     if (object.simulate) {
         options.simulate = object.simulate;
     }
     if (object.properties) {
         if (options.where === undefined) {
             options.where = [];
         }
         for (var i = 0; i < object.properties.length; i++) {
             options.where.push({
                 field: object.properties[i].field,
                 oper: object.properties[i].oper || '=',
                 value: object.properties[i].value
             });
         }
     }
     return options;
 };
