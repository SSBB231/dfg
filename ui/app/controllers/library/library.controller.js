/*global i18n Data _ disableBackTabIndex enableBackTabIndex*/
sap.ui.controller("app.controllers.library.library", {
    onInit: function() {
        this._views = {
            leftContent: {
                view: "app.views.library.leftContent",
                wrapper: "#left-content"
            },
            rightContent: {
                view: "app.views.library.rightContent",
                wrapper: "#right-content"
            }
        };
    },
    onAfterRendering: function() {
        var _self = this;
        _self.addServices();
        $('#main-title').html(i18n('DFG LIBRARY TITLE'));
        if (_self.privileges && !_self.privileges.Access) {
            $.baseToast({
                type: "W",
                text: i18n("NO ACCESS PRIVILEGES FOUND")
            });
            window.location = "/timp/tkb/#/content";
        }
        Data.endpoints.dfg.setting.deleteOldCache.post().success(function(data) {
            console.log('Deleted cache', data);
        });
        
    },
    addServices: function() {
        var _self = this;
        this.coreServices.icons = {
            "addFolder": {
                iconFont: "File-and-Folders",
                icon: "addfolder"
            },
            "manageFolders": {
                iconFont: "File-and-Folders",
                icon: "foldersetting"
            },
            "moveFolder": {
                iconFont: "File-and-Folders",
                icon: "folder"
            },
            "public": {
                iconFont: "Misc",
                icon: "globe"
            },
            "standard": {
                iconFont: "File-and-Folders",
                icon: "docversionsetting"
            },
            "my": {
                iconFont: "User",
                icon: "user"
            },
            "favorite": {
                iconFont: "Performance",
                icon: "star"
            },
            "shared": {
                iconFont: "User",
                icon: "meeting"
            },
            "recycleBin": {
                iconFont: "Finance-and-Office",
                icon: "trash"
            },
            "unmarkFavorite": {
                iconFont: "Performance",
                icon: "starline"
            },
            "collapsedown": {
                iconFont: "Sign-and-Symbols",
                icon: "collapsedown"
            },
            "collapseup": {
                iconFont: "Sign-and-Symbols",
                icon: "collapseup"
            },
            "create": {
                iconFont: "Sign-and-Symbols",
                icon: "plussign"
            },
            "openClose": {
                iconFont: "DataManager",
                icon: "dataset"
            },
            "copy": {
                iconFont: "File-and-Folders",
                icon: "copydoc"
            },
            "remove": {
                iconFont: "Finance-and-Office",
                icon: "trash"
            },
            "delete": {
                iconFont: "Sign-and-Symbols",
                icon: "persign"
            },
            "restore": {
                iconFont: "Misc",
                icon: "recycle"
            },
            "detail": {
                iconFont: "Sign-and-Symbols",
                icon: "info-52"
            },
            "execute": {
                iconFont: "Media",
                icon: "play"
            },
            "edit": {
                iconFont: "Formatting-and-Tool",
                icon: "pensil"
            },
            "visualization": {
                icon: "magnifierplus",
                iconFont: "Sign-and-Symbols"
            },
            "tile": {
                icon: "filleddocument",
                iconFont: "File-and-Folders"
            },
            "search": {
                iconFont: "Sign-and-Symbols",
                icon: "magnifier"
            },
            "checkMark": {
                iconFont: "Sign-and-Symbols",
                icon: "check-44"
            },
            "pending": {
                iconFont: "Sign-and-Symbols",
                icon: "pendingalert"
            },
            "error": {
                iconFont: "Sign-and-Symbols",
                icon: "alert-46"
            },
            "send": {
                iconFont: "Communication",
                icon: "send"
            },
            "preview": {
                iconFont: "Display-and-Setting",
                icon: "preview"
            },
            "approve": {
                iconFont: "File-and-Folders",
                icon: "checkeddoc"
            }
        };
        this.coreServices.folders = {};
        this.coreServices.folderShared = {};
        this.coreServices.libraryOptions = {
            displayType: "LIST",
            dataType: {
                "LAYOUT": {
                    text: "FAVORITE",
                    idFolder: -1,
                    folderTreeTarget: ".layoutsFolders-wrapper",
                    sharedFolderTreeTarget: ".layoutsSharedFolders-wrapper",
                    loadedFolders: false
                },
                "SETTING": {
                    text: "FAVORITE",
                    idFolder: -1,
                    folderTreeTarget: ".settingFolders-wrapper",
                    sharedFolderTreeTarget: ".settingSharedFolders-wrapper",
                    loadedFolders: false
                },
                "DIGITAL FILE": {
                    text: "FAVORITE",
                    idFolder: -1,
                    folderTreeTarget: ".fileFolders-wrapper",
                    sharedFolderTreeTarget: ".fileSharedFolders-wrapper",
                    loadedFolders: false
                },
                "SPED": {
                    text: "EFDICMSIPI"
                },
                "AN3": {
                    text: "FAVORITE",
                    idFolder: -1,
                    folderTreeTarget: ".an3Folders-wrapper",
                    sharedFolderTreeTarget: ".an3SharedFolders-wrapper",
                    loadedFolders: false
                },
                "AN4": {
                    text: "FAVORITE",
                    idFolder: -1,
                    folderTreeTarget: ".an4Folders-wrapper",
                    sharedFolderTreeTarget: ".an4SharedFolders-wrapper",
                    loadedFolders: false
                },

                "PANEL": {
                    text: "FAVORITE",
                    idFolder: -1,
                    folderTreeTarget: ".panelFolders-wrapper",
                    sharedFolderTreeTarget: ".panelSharedFolders-wrapper",
                    loadedFolders: false
                }
            },
            renderType: "LAYOUT"
        };
        if (window.parameters.restoreSettings && localStorage.lastLibrarySettings) {
            var lastLibrarySettings = JSON.parse(localStorage.lastLibrarySettings);
            _self.coreServices.libraryOptions = lastLibrarySettings.libraryOptions;
            _.forEach(_self.coreServices.libraryOptions.dataType, function(option) {
                option.loadedFolders = false;
            });
        }
        this.coreServices.hideLeftPanel = function() {
            $(".main-wrapper").toggleClass("left-collapsed");
            if ($(".base-layout").hasClass("left-collapsed")) {
                disableBackTabIndex($("#left-content"));
            } else {
                enableBackTabIndex($("#left-content"));
            }
            $("#base-baseTooltip-wrapper").empty();
        };
    }
});