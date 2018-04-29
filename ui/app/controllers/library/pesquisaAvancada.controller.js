sap.ui.controller("app.controllers.library.pesquisaAvancada", {

    onInit: function() {
        this.data = {
            advanced: {
                text: i18n('ADVANCED FILTER'),
                hasTransition: true,
                iconFont: "Sign-and-Symbols",
                icon: "collapsedown"
            },
            reload: {
                text: i18n('UPDATE SEARCH'),
                hasTransition: true,
                iconFont: "Sign-and-Symbols",
                icon: "magnifier"
            },
            reset: {
                text: i18n('RESET SEARCH'),
                hasTransition: true,
                iconFont: "Time-and-Date",
                icon: "reviewback"
            },
            federal: {
                id: "federal",
                name: "rbg1",
                value: "federal",
                isChecked: true,
                text: i18n('FEDERAL')
            },
            state: {
                id: "state",
                name: "rbg1",
                value: "state",
                isChecked: false,
                text: i18n('ESTADUAL')
            }
        }
    },

    onDataRefactor: function(data) {
        return $.extend(data, this.data);
    },

    onAfterRendering: function(html) {
        var _self = this;
        _self.services = _self.getData().services;
        _self.view = $(html);

        _self.enableFilial = [false, false];
        _self.view.filterBuilder = _self.view.find('.filterBuilder');
        _self.view.searchFilter = _self.view.find('#inputPesquisa');
        _self.view.privacyFilter = _self.view.find('.inputPrivacy');
        _self.view.fileTypeFilter = _self.view.find('.inputFileType');
        _self.view.companyFilter = _self.view.find('.inputCompany');
        _self.view.ufFilter = _self.view.find('.inputUf');
        _self.view.branchFilter = _self.view.find('.inputBranch');
        _self.view.validDateFilter = _self.view.find('.inputDate');
        _self.view.structureGroupFilter = _self.view.find('.inputStructureGroup');
        _self.view.structureFilter = _self.view.find('.inputStructure');

        _self.view.creationDateFilter = _self.view.find('.inputCreationDate');
        //_self.view.creationEndDateFilter = _self.view.find('.inputEndCreationDate');
        _self.view.modifiedDateFilter = _self.view.find('.inputModifiedDate');
        //_self.view.modifiedEndDateFilter = _self.view.find('.inputModifiedEndDate');

        _self.view.stateFilter = _self.view.find('.inputState');

        _self.stateRadio = _self.view.find('.stateRadio');
        _self.federalRadio = _self.view.find('.federalRadio');
        _self.libraryTable = $('#libraryview');
        _self.advancedPanel = $('.advanced-filters');
        _self._showAdvancedFilters = false;
        _self.view.advancedFilterButton = $('.advanced-filters-button button');
        _self.view.searchButton = _self.view.find('.btnRefreshSearch');
        _self.view.resetButton = _self.view.find('div.btnRsetSearch');

        _self.filterRequest = {
            filters: {}
        };

        // this.pesquisaAvancada();
        // _self.renderTooltips();
        // this.bindEvents();
    },

    bindEvents: function() {
        var _self = this;
        _self.stateRadio.click(function() {
            // console.log('entro y desabilito')
            // _self.federalRadio.find('input').removeAttr('checked');
            // _self.stateRadio.find('input').attr('checked', 'checked');
            _self.inputState.enable();
            _self.view.stateFilter.find('.base-select').baseTooltip({
                class: "dark",
                position: "top",
                text: i18n('STATE TOOLTIP'),
                width: 300
            })
            _self.filterRequest.filters.federal = false;
            delete _self.filterRequest.filters.state;
            _self.inputState.select._input.val("");
            delete _self.inputState.select._input.data().key;
        });
        _self.federalRadio.click(function() {
            // _self.stateRadio.find('input').removeAttr('checked');
            // _self.federalRadio.find('input').attr('checked', 'checked');
            _self.inputState.disable();
            _self.view.stateFilter.find('.base-select').baseTooltip({
                class: "dark",
                position: "top",
                text: i18n('DISABLED ACTION'),
                width: 300
            })
            _self.filterRequest.filters.federal = true;
        });
        _self.bindTooltipsForRadioButtons();
    },
    bindTooltipsForRadioButtons: function() {
        var _self = this;

        _self.view.searchButton.click(function() {
            _self.refreshSearch();
        });

        _self.view.resetButton.click(function() {
            _self.clearFields();
            _self.refreshSearch();
        });


        $(".federalRadio").baseTooltip({
            class: "dark",
            position: "right",
            text: i18n("CLICK PRESS ENTER TO") + " " + i18n("SELECT") + " " + i18n("FEDERAL"),
            width: 300
        });
        $(".stateRadio").baseTooltip({
            class: "dark",
            position: "right",
            text: i18n("CLICK PRESS ENTER TO") + " " + i18n("SELECT") + " " + i18n("ESTADUAL"),
            width: 300
        });

    },
    pesquisaAvancada: function() {
        var _self = this;
        _self.inputPesquisa = $('#inputPesquisa').bindBaseInput({
            isSearchBox: true,
            onChange: function(oldVal, newVal) {
                _self.services.filterTable(newVal);
            }
        });

        //Getting the full filters options
        Data.endpoints.dfg.filters.post().success(function(data) {
            // console.log('data from fiters endpoints ', data);

            //Map options for Layout Type Select Filter
            var options = data.listLayoutType.map(function(type) {
                return {
                    key: type.id,
                    name: type.typeName,
                    title: type.typeDescription
                };
            });
            _self.view.fileTypeFilter.html('');
            _self.inputFileType = _self.view.fileTypeFilter.bindBaseSelect({
                placeholder: i18n('FILE TYPE'),
                options: options,
                isLoading: options.length <= 1,
                onChange: function(oldVal, newVal) {
                    _self.filterRequest.filters.layoutType = [newVal.key];
                },
                tooltip: i18n('FILE TYPE TOOLTIP')
            });


            //Map options for Companies Select Filter
            options = data.company.map(function(company) {
                return {
                    key: company.id,
                    name: company.name,
                    title: company.mandt
                };
            });
            _self.view.companyFilter.html('');
            _self.inputCompany = _self.view.companyFilter.bindBaseSelect({
                placeholder: i18n('TILE COMPANY'),
                options: options,
                onChange: function(oldVal, newVal) {
                    //_self.inputs.company = newVal.key;
                    //Map options for Branch of an specific Company in Branch Select Filter
                    _self.enableFilial[0] = true;
                    _self.filterRequest.filters.company = [newVal.key];
                    if (_self.enableFilial[1]) {
                        fillFilial(newVal.key, 'company');
                    }
                },
                tooltip: i18n('TILE COMPANY TOOLTIP')
            });

            options = data.uf.map(function(uf) {
                return {
                    key: uf.id,
                    name: uf.name,
                    title: uf.mandt
                };
            });
            _self.view.ufFilter.html('');
            _self.inputUf = _self.view.ufFilter.bindBaseSelect({
                placeholder: i18n('TILE UF'),
                options: options,
                onChange: function(oldVal, newVal) {
                    //_self.inputs.uf = newVal.key;
                    //Map options for Branch of an specific Uf in Branch Select Filter 
                },
                tooltip: i18n('TILE COMPANY TOOLTIP')
            });

            //Branch Type disabled and empty filter
            _self.view.branchFilter.html('');
            _self.inputBranch = _self.view.branchFilter.bindBaseSelect({
                placeholder: i18n('TILE BRANCH'),
                isLoading: true,
                onChange: function() {},
                tooltip: i18n('TILE BRANCH TOOLTIP')
            });


            //Map options for State Select Filter
            options = data.uf.map(function(state) {
                return {
                    key: state.id,
                    name: state.id
                };
            });
            _self.view.stateFilter.html('');
            _self.inputState = _self.view.stateFilter.bindBaseSelect({
                placeholder: i18n('STATE'),
                isLoading: options.length <= 1,
                isDisabled: true,
                options: options,
                onChange: function(oldVal, newVal) {
                    _self.enableFilial[1] = true;
                    _self.filterRequest.filters.state = [newVal.key];
                    if (_self.enableFilial[0]) {
                        fillFilial(newVal.key, 'state');
                    }
                },
                tooltip: i18n('STATE TOOLTIP')
            });

            //Map options for Structure Filter
            options = [];
            data.structure.map(function(struct) {
                options.push({
                    key: options.length,
                    name: struct.title
                });
            });
            _self.view.structureGroupFilter.html('');
            _self.inputStructureGroup = _self.view.structureGroupFilter.bindBaseSelect({
                placeholder: i18n('STRUCTURE GROUP'),
                options: options,
                isLoading: options.length <= 1,
                onChange: function(oldVal, newVal) {
                    _self.view.structureFilter.html('');
                    var structureOptions = data.structure[newVal.key].sub.map(function(structure) {
                        return {
                            key: structure.id,
                            name: structure.title
                        };
                    });
                    _self.inputStructure = _self.view.structureFilter.bindBaseSelect({
                        placeholder: i18n('STRUCTURE'),
                        options: structureOptions,
                        onChange: function(oldValue, newValue) {
                            _self.filterRequest.filters.structure = [newValue.key];
                        },
                        tooltip: i18n('STRUCTURE TOOLTIP')
                    });
                },
                tooltip: i18n('STRUCTURE GROUP TOOLTIP')
            });
            _self.view.structureFilter.html('');
            _self.inputStructure = _self.view.structureFilter.bindBaseSelect({
                placeholder: i18n('STRUCTURE'),
                options: options,
                isLoading: true,
                onChange: function(oldVal, newVal) {},
                tooltip: i18n('STRUCTURE TOOLTIP')
            });



        }).error(function(error) {
            $.baseToast({
                text: error,
                isError: true
            });
        });

        /*
        Privacy Filter Selector, BE not yet implemented
        var privacyOptions = [
            {key: -1, name: i18n('ALL')},
            {key: 0, name: i18n('PUBLIC')},
            {key: 1, name: i18n('SHARED')},
            {key: 2, name: i18n('ONLY ME')}];
        _self.inputProvacy = _self.view.privacyFilter..bindBaseSelect({
            placeholder: i18n('PRIVACY'),
            options: privacyOptions,
            onChange: function(oldVal, newVal){},
            tooltip: i18n('PRIVACY TOOLTIP')
        });
        */

        _self.inputValidDate = _self.view.validDateFilter.bindBaseRangePicker({
            placeholder: i18n('VALID ON'),
            noPreset: true,
            onChange: function(oldVal, newVal) {
                _self.filterRequest.filters.validFrom = parseDate(newVal, "Date");
            },
            tooltip: i18n('VALID ON TOOLTIP')
        });

        _self.inputCreationDate = _self.view.creationDateFilter.bindBaseRangePicker({
            placeholder: i18n('CREATION DATE'),
            noPreset: true,
            onChange: function(oldVal, newVal) {
                _self.filterRequest.filters.creationDate = parseDate(newVal, "Date");
            },
            tooltip: i18n('CREATION DATE ON TOOLTIP')
        });

        _self.inputModifiedDate = _self.view.modifiedDateFilter.bindBaseRangePicker({
            noPreset: true,
            placeholder: i18n('MODIFICATION DATE'),
            onChange: function(oldVal, newVal) {
                _self.filterRequest.filters.modifiedDate = parseDate(newVal, "Date");
            },
            tooltip: i18n('MODIFICATION DATE ON TOOLTIP')
        });

        _self.view.advancedFilterButton.unbind('click').bind('click', function() {
            var icon = $('.advanced-filters-button .icon');
            if (!_self._showAdvancedFilters) {
                _self.advancedPanel.slideDown(300);
                _self.libraryTable.css('top', 310);
                icon.removeClass('icon-collapsedown');
                icon.addClass('icon-collapseup');
            } else {
                _self.libraryTable.css('top', 120);
                _self.advancedPanel.slideUp(300);
                icon.removeClass('icon-collapseup');
                icon.addClass('icon-collapsedown');
            }
            _self._showAdvancedFilters = !_self._showAdvancedFilters;
        });
        // buttonFilderAdvanced.click(function(){
        //     if(buttonFilderAdvanced.hasClass('ativo')){
        //         buttonFilderAdvanced.parent().next('.advanced-filters').fadeOut(function(){
        //             $('#libraryview').css('top', 120);
        //         });
        //         buttonFilderAdvanced.removeClass('ativo');

        //     }else{
        //         buttonFilderAdvanced.parent().next('.advanced-filters').fadeIn(function(){

        //         });
        //         buttonFilderAdvanced.addClass('ativo');
        //         $('#libraryview').css('top', 230);
        //     }
        // });
        var btnRefreshSearch = $('.btnRefreshSearch').click(function() {
            _self.refreshSearch();
        })
        $('div.btnRsetSearch').click(function() {
            _self.clearFields();
            _self.refreshSearch();
        });
        var fillFilial = function(val, select) {
            if (select == 'state') {
                var empresa = _self.inputCompany.getKey();
                var state = val;
            } else {
                var empresa = val;
                var state = _self.inputState.getKey();;
            }
            var object = {
                state: state,
                codEmpresa: empresa
            };
            var _listFilials = [];
            Data.endpoints.dfg.listBranchByCompanyState.post(object).success(function(_data) {
                _self.view.branchFilter.html('');
                Object.keys(_data).map(function(_val) {
                    _listFilials.push({
                        key: _data[_val].codFilial,
                        name: _data[_val].nomeFantasia
                    });
                });
                _self.inputBranch = _self.view.branchFilter.bindBaseSelect({
                    placeholder: i18n('TILE BRANCH'),
                    options: _listFilials,
                    onChange: function(oldVal, newVal) {
                        _self.filterRequest.filters.branch = [newVal.key];
                    },
                    tooltip: i18n('TILE BRANCH TOOLTIP')
                });
            }).error(function(e) {
                $.baseToast({
                    title: i18n('ERROR'),
                    type: 'E'
                });
            });
        }
    },

    clearFields: function() {
        var _self = this;
        $("#inputPesquisa input").val("");
        _self.inputFileType.select._input.val("");
        delete _self.inputFileType.select._input.data().key;

        _self.inputCompany.select._input.val("");
        delete _self.inputCompany.select._input.data().key;

        // _self.inputUf.select._input.val("");
        // delete _self.inputUf.select._input.data().key;

        _self.inputBranch.select._input.val("");
        delete _self.inputBranch.select._input.data().key;

        _self.inputState.select._input.val("");
        delete _self.inputState.select._input.data().key;

        _self.inputStructure.select._input.val("");
        delete _self.inputStructure.select._input.data().key;

        _self.inputStructureGroup.select._input.val("");
        delete _self.inputStructureGroup.select._input.data().key;

        _self.view.validDateFilter.find('input').val('');
        _self.view.creationDateFilter.find('input').val('');
        _self.view.modifiedDateFilter.find('input').val('');

        $('#federal').click();

        _self.filterRequest = {
            filters: {}
        };
    },

    refreshSearch: function() {
        var _self = this;
        var searchObject = {};


        searchObject.type = _self.inputFileType.getKey();
        searchObject.company = _self.inputCompany.getKey();
        searchObject.filial = _self.inputBranch.getKey();
        searchObject.state = _self.inputState.getKey();
        searchObject.structureGroup = _self.inputStructureGroup.getKey();
        searchObject.structure = _self.inputStructure.getKey();
        // console.log(_self.inputValidDate)
        if (_self.inputValidDate.getRange()) {
            searchObject.validFrom = parseDate(_self.inputValidDate.getRange().startDate, "Date");
            searchObject.validTo = parseDate(_self.inputValidDate.getRange().endDate, "Date");
        }
        if (_self.inputCreationDate.getRange()) {
            searchObject.creationDateFrom = parseDate(_self.inputCreationDate.getRange().startDate, "Date");
            searchObject.creationDateTo = parseDate(_self.inputCreationDate.getRange().endDate, "Date");
        }
        if (_self.inputModifiedDate.getRange()) {
            searchObject.modificationDateFrom = parseDate(_self.inputModifiedDate.getRange().startDate, "Date");
            searchObject.modificationDateTo = parseDate(_self.inputModifiedDate.getRange().endDate, "Date");
        }


        //converting dates to backend format
        // if (searchObject.validDate) {
        //     searchObject.validDate = _self.inputValidDate._jsonToDate(searchObject.validDate);
        //     searchObject.validDate = searchObject.validDate.replace(/^(\d{2})\/(\d{2})\/(\d{4})$/, '$3-$2-$1');
        // } else {
        //     delete searchObject.validDate;
        // }

        if (_self.federalRadio.find('#federal').attr('checked') == 'checked') {
            searchObject.areaType = 'federal';
            //searchObject.area = null;
        } else {
            searchObject.areaType = 'estadual';
            searchObject.area = _self.inputState.getKey();
        }

        _self.services.renderList(_self.filterRequest); //searchObject);
    },

    renderTooltips: function() {
        var _self = this;
        $('.advanced-filters-button button').baseTooltip({
            class: 'dark',
            position: 'top',
            text: i18n('ADVANCED FILTER TOOLTIP')
        });
        $('.advanced-filter.btnRefreshSearch button').baseTooltip({
            class: 'dark',
            position: 'top',
            text: i18n('UPDATE SEARCH TOOLTIP')
        });
        $('.advanced-filter.btnRsetSearch button').baseTooltip({
            class: 'dark',
            position: 'top',
            text: i18n('RESET SEARCH TOOLTIP')
        });
    }

});