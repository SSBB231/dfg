sap.ui.controller("app.controllers.library.dialogs.SelectUsers", {
    onInit: function() {
        this.data = {
            rb_user: {
                id: "rbu",
                name: "rb-all",
                value: "",
                isChecked: true,
                text: i18n('USERS'),
            },
            rb_wrkteam: {
                id: "rbw",
                name: "rb-all",
                value: "",
                isChecked: false,
                text: i18n('WORKTEAMS')
            },
        };
    },
    onDataRefactor: function(data) {
        return $.extend(data, this.data);
    },
    onAfterRendering: function(html) {
        var controller = this;
        controller.View = $(html);
        controller.ArrayUsers = [];
        controller.dialog = controller.getData().pController.dialog;
        controller.currentObject = controller.getData().currentObject;
        $(".priv-cont").hide();
        controller.searchController = $(".cont-users").bindBaseInput({
            placeholder: i18n('SEARCH'),
            icon: "magnifier",
            iconFont: "Sign-and-Symbols",
            iconLeft: true,
            onChange: function() {
                controller.searchBox();
            }
        });
        controller.View.input = controller.View.find(":input");
        controller.View.input.prop("readonly", true);
        controller.View.input.addClass("input-cont-users");
        controller.View.User = controller.View.find(".users-list");
        controller.addUsers();
        controller.selectedView = "users";
        controller.checkUserOrGroups();
        controller.usersId = [];
        controller.groupsId = [];
    },
    addUsers: function() {
        var controller = this;
        controller.View.User.empty();
        var listitem;
        var row;
        var label;
        Data.endpoints.mkt.user.list.get().success(function(data) {
            controller.Groups = [];
            controller.Users = data;

            $('.main-cont .cont-list #list-loading').fadeOut(function() {
                $('.main-cont .cont-list #letters').fadeIn();
                $('.main-cont .cont-list cont-users-list').animate({
                    opacity: 1
                }, 'fast', function() {
                    $(this).css('display', 'table');
                });
            });

            var userListView = new sap.ui.view({
                viewName: "app.views.library.dialogs.DialogUserList",
                type: sap.ui.core.mvc.ViewType.HTML,
                viewData: {
                    dialogUsers: data,
                    label: i18n('NAME'),
                    label2: i18n('FUNCTION'),
                    parentController: controller
                }
            });

            $(".cont-users-list").empty();
            $(".cont-users-list").bindView(userListView, {
                dialogUsers: data,
                label: i18n('NAME'),
                label2: i18n('FUNCTION'),
                parentController: controller
            });
            $("#rbu").click();

            Data.endpoints.mkt.workteam.list.get().success(function(data) {
                $(data).each(function(index, item) {
                    controller.Groups.push(item);
                });

                $(".cont-wt-list").empty();
                var groupListView = new sap.ui.view({
                    viewName: "app.views.library.dialogs.DialogGroupList",
                    type: sap.ui.core.mvc.ViewType.HTML,
                    viewData: {
                        dialogGroups: controller.Groups,
                        label: i18n('NAME'),
                        label2: i18n('FUNCTION'),
                        parentController: controller
                    }
                });
                $(".cont-wt-list").bindView(groupListView, {
                    dialogGroups: controller.Groups,
                    label: i18n('NAME'),
                    label2: i18n('FUNCTION'),
                    parentController: controller
                });
            });
        });
    },
    checkUserOrGroups: function() {
        var controller = this;
        $("#rbu").on("click", function() {
            controller.getGroupIds();
            $(".cont-wt-list").hide();
            $(".cont-users-list").show();
            controller.selectedView = "users";
            controller.searchController.onChange();
        });
        $("#rbw").on("click", function() {
            controller.getUsersIds();
            $(".cont-users-list").hide();
            $(".cont-wt-list").show();
            controller.selectedView = "groups";
            controller.searchController.onChange();
        });
    },
    getUsersIds: function() {
        var controller = this;

        controller.usersId = [];
        if (controller.selectedView == "users") {
            $("#User-table").find(".tr").each(function(index, item) {
                if ($(this).find("input").prop("checked"))
                    controller.usersId.push(parseInt($(item).attr("data-id").replace(/u_/, '')));
            });
        }
    },
    getGroupIds: function() {
        var controller = this;

        controller.groupsId = [];
        if (controller.selectedView !== "users") {
            $("#Groups-table .tr").each(function(index, item) {
                if ($(this).find("input").prop("checked"))
                    controller.groupsId.push(parseInt($(item).attr("data-id").replace(/g_/, '')));
            });
        }
    },
    getOwnData: function() {
        var controller = this;

        if (controller.groupsId.length === 0) {
            if (controller.selectedView === "users") {} else {
                controller.getGroupIds();
            }
        }
        if (controller.usersId.length === 0) {
            if (controller.selectedView === "users") {
                controller.getUsersIds();
            }
        }

        var saveData = {
            id_object: controller.currentObject.id_object,
            id_users: controller.usersId,
            id_groups: controller.groupsId
        };
        Data.endpoints.core.objectShare.updateShare.post(saveData).success(function(msg) {
            $.baseToast({
                text: i18n('SUCCESS SET SHARED'),
                isSuccess: true
            });
            _self.close();
            return true;
        }).error(function() {
            $.baseToast({
                text: i18n('ERROR SET SHARED'),
                isError: true
            });
            return false;
        });
    },
    searchBox: function() {
        var controller = this;
        var searchInput = $(".top-cont .cont-users").find("input");
        var rows = $("#User-table .tbody .tr");
        var fields = $("#User-table .tbody .tr .td");
        var parentClass = $("#User-table .tbody .tr");
        if (controller.selectedView == "groups") {
            searchInput = $(".top-cont .cont-users").find("input");
            rows = $("#Groups-table.tbody.tr");
            fields = $("#Groups-table.tbody.tr.td");
            parentClass = "#Groups-table.tbody.tr";
        }

        if (searchInput.val()) {
            $(rows).each(function(index, item) {
                $(item).hide();
            });

            $(fields).each(function(index, item) {
                if ($(item).text().toLowerCase().indexOf(searchInput.val().toLowerCase()) > -1) {
                    $(item).parents(parentClass).show();
                }
            });
        } else {
            $(rows).each(function(index, item) {
                $(item).show();
            });
        }
    }
});
