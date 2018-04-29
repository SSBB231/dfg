jQuery.sap.declare("app.config.endpoints");
jQuery.sap.require("core.config.BaseData");

Data.config = {

    folder: "timp/dfg/server/endpoint.xsjs",
    type: "json",
    endpoints: {
        atr: {
          getStructureRelations: "structureRelation/getStructureRelations/",
          getMandt: "atr/getMandt/"
        },
        bre: {
            folder: "timp/bre/server/endpoint.xsjs/external",
            rule: {
                list: "listRulesByStructure/",
                transcripts: "listRulesTranscripts/",
                DFGBusinessRules: "listDFGBusinessRules/",
                DFGAN3Rules: "listDFGAN3Rules/",
                DFGAN4Rules: "listDFGAN4Rules/",
                outputs: "listRulesOutputs2/"
            },
            regulation: {
                list: "listRegulationsByStructure/",
                listRules: "listRegulationsRules/"
            }
        },
        bfb: {
            folder: "timp/bfb/server/endpoint.xsjs/external",
            getBFBLayoutXDFGLayout: "getBFBLayoutXDFGLayout/"
        },
        dfg: {
            uf: "uf/list/",
            branch: "branch/list/",
            tax: "tax/list/",
            an4: {
                list: "an4/list/",
                listFiles: "an4/listFiles/",
                read: "an4/read/",
                execute: "an4/execute/",
                createDialog: "an4/createDialog/",
                create: "an4/create/",
                createReport: "an4/createReport/",
                update: "an4/update/",
                setFavorite: "an4/favorite/",
                unmarkfavorite: "an4/unmarkfavorite/",
                copy: "an4/copy/",
                recyclebin: "an4/recyclebin/",
                "delete": "an4/delete/",
                restore: "an4/restore/",
                listFilesByRule: "an4/listFilesByRule/",
                saveRawFile: "an4/saveRawFile/",
                listCompanies: "an4/listCompanies/",
                listLayoutsbyRule: "an4/listLayoutsbyRule/",
                updateFile: "an4/updateFile/"
            },
            an3: {
                listFiles: "an3/listFiles/",
                read: "an3/read/",
                execute: "an3/execute/",
                createDialog: "an3/createDialog/",
                create: "an3/create/",
                createReport: "an3/createReport/",
                setFavorite: "an3/setFavorite/",
                removeFavorite: "an3/unmarkfavorite/",
                copy: "an3/copy/",
                restore: "an3/restore/",
                updateFile: "an3/updateFile/",
                update: "an3/update/",
                visualize: "an3/visualize/"
            },
            sped: {
                list: {
                    spedFile: "sped/list/",
                    eSocial: 'sped/eSocialList/'
                },
                create: "sped/create/",
                listFiles: "sped/list/",
                update: "sped/update/",
                delete: "sped/deleteSPED/",
                sendToTrash: "sped/sendToTrash/",
                restore: "sped/restore/",
                createDialog: "sped/createDialog/",
                createDialogEFDICMSIPIVariant: "sped/createDialogEFDICMSIPIVariant/",
                createVariant: "sped/createVariant/",
                execute: "sped/execute/",
                executeCalculationBlock: "sped/executeCalculationBlock/",
                updateSPEDTables: "sped/updateSPEDTables/",
                getTDFTableColumns: "sped/getTDFTableColumns/",
                createDialogEFDContributionsVariant: "sped/createDialogEFDContributionsVariant/",
                executeEFDContributions: "sped/executeEFDContributions/",
                createDialogECDVariant: "sped/createDialogECDVariant/",
                executeECD: "sped/executeECD/",
                createDialogEFCVariant: "sped/createDialogEFCVariant/",
                executeECF: "sped/executeECF/",
                saveRunId: "sped/saveRunId/",
                getReportFilesSPED: "sped/getReportFilesSPED/",
                exportTOMFile: "sped/exportTOMFile/",
                getTOMFileMetadata: "sped/getTOMFileMetadata/",
                getSpedExecutions: "sped/getSpedExecutions/" ,
                exportXML: "sped/exportXML/",
                eSocialSend: 'sped/eSocialSend/'
            },
            output: {
                listOutputType: "Output/listOutputType/",
                listCompany: "Output/listCompany/",
                listUF: "Output/listUF/",
                listBranch: "Output/listBranch/",
                listTax: "Output/listTax/",
                listValues: "Output/listValues/"
            },
            layout: {
                list: "layout/list/",
                listFiles: "layout/listFiles/",
                read: "layout/read/",
                filters: "layout/filters/",
                execute: "layout/execute/",
                createDialog: "layout/createDialog/",
                create: "layout/create/",
                update: "layout/update/",
                favorite: "layout/favorite/",
                unmarkfavorite: "layout/unmarkfavorite/",
                copy: "layout/copy/",
                recyclebin: "layout/recyclebin/",
                "delete": "layout/delete/",
                restore: "layout/restore/",
                getLastVersion: "layout/getLastVersion/",
                createLayoutVersion: "layout/createLayoutVersion/",
                setFavorite: "layout/setFavorite/",
                removeFavorite: "layout/removeFavorite/",
                updateFile: "layout/updateFile/",
                getValidDates: "layout/getValidDates/",
                getActiveLayouts: "layout/getLayouts/"
            },
            setting: {
                list: "setting/list/",
                listFiles: "setting/listFiles/",
                read: "setting/read/",
                filters: "setting/filters/",
                execute: "setting/execute/",
                executeDF: "setting/executeDF/",
                createDialog: "setting/createDialog/",
                create: "setting/create/",
                favorite: "setting/favorite/",
                unmarkfavorite: "setting/unmarkfavorite/",
                copy: "setting/copy/",
                recyclebin: "setting/recyclebin/",
                "delete": "setting/delete/",
                restore: "setting/restore/",
                getVersions: "setting/getVersions/",
                getValidDates: "setting/getValidDates/",
                update: "setting/update/",
                updateSettingData: "setting/updateSettingData/",
                editDialog: "/setting/editDialog/",
                setFavorite: "setting/setFavorite/",
                removeFavorite: "setting/removeFavorite/",
                updateFile: "setting/updateFile/",
                getActiveSettings: "setting/getSettings/",
                evaluateBusinessRules: "setting/evaluateBusinessRules/",
                deleteCache: "setting/deleteCacheTable/",
                formCache: "setting/formCache/",
                deleteOldCache: "setting/deleteOldCache/"
            },
            digitalFile: {
                list: "digitalFile/list/",
                listFiles: "digitalFile/listFiles/",
                read: "digitalFile/read/",
                filters: "digitalFile/filters/",
                execute: "digitalFile/execute/",
                createDialog: "digitalFile/createDialog/",
                setFavorite: "digitalFile/setFavorite/",
                removeFavorite: "digitalFile/removeFavorite/",
                copyFiles: "digitalFile/copy/",
                officialize: "digitalFile/officialize/",
                issue: "digitalFile/issue/",
                analyze: "digitalFile/analyze/",
                "export": "digitalFile/export/",
                send: "digitalFile/send/",
                updateFile: "digitalFile/updateFile/",
                getActiveDigitalFiles: "digitalFile/getDigitalFiles/"
            },
            panel: {
                listFiles: "panel/listFiles/",
                create: "panel/createPanel/",
                read: "panel/readPanel/",
                update: "panel/updatePanel/",
                approve: "panel/approve/",
                setFavorite: "panel/favorite/",
                removeFavorite: "panel/unmarkfavorite/",
                settingDialog: "panel/settingDialog/",
                createSettingPanel:"panel/createSettingPanel/",
                createJustify:"panel/createJustify/",
                readJustify:"panel/readJustify/",
                updateSettingPanel:"panel/updateSettingPanel/",
                readSettingPanel: "panel/readSettingPanel/",
                approvePVA: "panel/approvePVA/"
            },
            digitalFileType: {
                list: "digitalFileType/list/"
            },
            filters: "layout/filters/",
            listBranchByCompanyState: "listBranchByCompanyState/",
            listStructureByGroup: "listStructureByGroup/",
            file: {
                list: "file/list/",
                favorite: "file/favorite/",
                unmarkfavorite: "file/unmarkfavorite/",
                copy: "file/copy/",
                recyclebin: "file/recyclebin/",
                "delete": "file/delete/",
                restore: "file/restore/"
            },
            createDialog: "createDialog/",
            getCommonFilters: "commonFilters/list/",
            xmlFile: {
                list: "xmlFile/list/",
                createDigitalFile: "xmlFile/createDigitalFile/",
                updateDigitalFile: "xmlFile/updateDigitalFile/",
                deleteDigitalFile: "xmlFile/deleteDigitalFile/",
                getFileByID: "xmlFile/getFileByID/",
                getStructuresAndReportsByFile: "xmlFile/getStructuresAndReportsByFile/",
                canShowXMLTab: "xmlFile/canShowXMLTab/"
            }
        },
        mkt: {
            folder: "timp/mkt/server/endpoint.xsjs",
            user: {
                name: "getUser/",
                updatedeleteuser: "updateDeletedUser/",
                list: "listUsers/",
                listSubordinates: "listSubordinates/",
                create: "createUser/",
                update: "updateUser/",
                "delete": "deleteUser/",
                status: "setUserStatus/",
                atr: "listAtrPrivileges/",
                getLoggedUserDetails: "getLoggedUser/",
                validate: "validateUser/",
                validateDelete: "validateDeleteUser/",
                isAdmin: "getLoggedUser/",
                hierarchy: "getUsersHierarchy/",
                listhierarchy: "listUsersHierarchy/",
                getRoot: "getRoot/"
            },
            workteam: {
                name: "getGroup/",
                create: "createGroup/",
                "delete": "deleteGroup/",
                update: "updateGroup/",
                list: "listGroups/",
                validate: "validateUser/"
            },
            companyList: "listOrgCompanyPrivileges/",
            branchList: "listOrgStateBranchPrivileges/",
            listUsers: "listUsers/",
            listGroups: "listGroups/"
        },
        selects: {
            fileTypeList: "listLayoutType/",
            copyList: "listLayout/",
            stateList: "listEstados/"
        },
        structures: {
            listAllStructures: 'structures/listAllStructures/',
            structureList: 'structures/listStructuresName/',
            getStructure: 'structures/getStructure/', // not used
            listStructures: 'structures/listStructures/',
            getMapping: 'external/mapping/'
        },
        centralizationMovement: {
            getCentralizedBranches: "external/getCentralizedBranches/"
        },
        executeDigitalFile: "executeDigitalFile/",
        executeDigitalFile2: "executeDigitalFile2/",
        generateDigitalFile: "generateDigitalFile/",

        listLayout: "listLayout/",
        listVersions: "listVersions/",
        listDigitalFile: "listDigitalFile/",
        getLayoutCount: "getLayoutCount/",
        privileges: "getUserPrivileges/",
        verifyLayoutName: "verifyLayoutName/",
        verifyVersionName: "verifyVersionName/",
        verifyDateVersion: "verifyDateVersion/",
        getXMLShowParameter: "getXMLDFGParameter/",
        mdr: {
            ZIPFiles: {
                listZIPFiles: 'zipFiles/listZIPFiles/',
                listZIPFilesBy: 'zipFiles/listZIPFilesBy/',
                getCondensedZipFiles: 'zipFiles/getCondensedZipFiles/'
            },
            XSDSchemas: {
                listXSDSchemas: 'xsdSchemas/listXSDSchemas/',
                listXSDSchemasBy: 'xsdSchemas/listXSDSchemasBy/'
            },
            SchemasProperties: {
                listSchemasProperties: 'schemasProperties/listSchemasProperties/',
                listSchemasPropertiesBy: 'schemasProperties/listSchemasPropertiesBy/'
            }
        },
        tfpEndpoint: {
            subperiod: {
                folder: 'timp/tfp/server/endpoint.xsjs/fiscalSubPeriod',
                getSubperiod: 'get/'
            }
        }
    }
};
