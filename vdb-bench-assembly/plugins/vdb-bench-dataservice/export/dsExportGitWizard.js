(function () {
    'use strict';

    var pluginDirName = 'vdb-bench-dataservice';
    var pluginName = 'vdb-bench.dataservice';
    var exportDir = 'export';

    angular
        .module(pluginName)
        .directive('dsExportGitWizard', DSExportGitWizard);

    DSExportGitWizard.$inject = ['CONFIG', 'SYNTAX'];
    DSExportGitWizardController.$inject = ['$scope', 
                                           '$base64', 
                                           'SYNTAX', 
                                           'DSSelectionService', 
                                           'RepoRestService'];

    function DSExportGitWizard(config, syntax) {
        var directive = {
            restrict: 'E',
            scope: {},
            bindToController: {
                'wizardActive': '='
            },
            controller: DSExportGitWizardController,
            controllerAs: 'vm',
            templateUrl: config.pluginDir + syntax.FORWARD_SLASH +
                pluginDirName + syntax.FORWARD_SLASH +
                exportDir + syntax.FORWARD_SLASH +
                'git-export-wizard.html'
        };

        return directive;
    }

    function DSExportGitWizardController($scope, 
                                         $base64, 
                                         syntax, 
                                         DSSelectionService, 
                                         RepoRestService) {
        var vm = this;

        /**
         * Final location of all the parameters
         * populated by the wizard
         */
        $scope.repo = {
            parameters: {}
        };

        function setError(message) {
            if (message) {
                message = message.replace(/<br\/>/g, syntax.NEWLINE);
            }

            vm.error = message;
        }

        function setResponse(response) {
            vm.response = response;
            var dataService = DSSelectionService.selectedDataService();

            if (response === 'Failed') {
                vm.responseStyleClass = "pficon pficon-ok";
                vm.responseMsg = $translate.instant( 'dsExportGitWizard.successfulExportMsg', 
                                                     { dataServiceName: dataService.keng__id, 
                                                       repoPath: $scope.repo.parameters[ 'file-path-property' ] } );
            } else {
                vm.responseStyleClass = "pficon pficon-error-circle-o";
                vm.responseMsg = $translate.instant( 'dsExportGitWizard.failedExportMsg', 
                                                     { dataServiceName: dataService.keng__id,
                                                       repoPath: $scope.repo.parameters[ 'file-path-property' ] } );
            }
        }

        /**
         * The git repository has been changed in the repository selection control
         */
        vm.onRepoSelection = function(selected) {
            if (!selected) {
                $scope.repo = {
                    parameters: {}
                };
                return;
            } else {
                $scope.repo = selected;
            }
        };

        //
        // Validates the credentials wizard step and returns true is ok to continue or
        // false if validation has failed
        //
        vm.validateCredentials = function() {
            if (_.isEmpty($scope.repo))
                return false;

            if (_.isEmpty($scope.repo.parameters))
                return false;

            if (_.isEmpty($scope.repo.name))
                return false;

            if (_.isEmpty($scope.repo.parameters['repo-path-property'])) {
                return false;
            }

            if (_.isEmpty($scope.repo.parameters['file-path-property'])) {
                return false;
            }

            if ( vm.requireAuthorName && _.isEmpty($scope.repo.parameters['author-name-property'])) {
                return false;
            }

            if ( vm.requireAuthorEmail && _.isEmpty($scope.repo.parameters['author-email-property'])) {
                return false;
            }

            return true;
        };

        vm.showProgress = function(display) {
            vm.inProgress = display;
        };

        /**
         * Event handler for exporting the dataservice to git repository
         */
        vm.onExportDataServiceClicked = function() {
            var dataservice = DSSelectionService.selectedDataService();

            //
            // Display the progress bar and hide the browse button
            //
            vm.showProgress(true);

            try {
                RepoRestService.export('git', $scope.repo.parameters, dataservice).then(
                    function (exportStatus) {
                        vm.showProgress(false);
                        setError(null);
                        setResponse(exportStatus.success ? 'OK': 'Failed');
                    },
                    function (response) {
                        // Some kind of error has occurred
                        vm.showProgress(false);
                        setError(RepoRestService.responseMessage(response));
                        setResponse('Failed');
                    });
            } catch (error) {
                vm.showProgress(false);
                setError(error.message);
                setResponse('Failed');
            }
        };

        $scope.$on( "requireAuthorName", function( evt, data ) {
            vm.requireAuthorName = data;
        });

        $scope.$on( "requireAuthorName", function( evt, data ) {
            vm.requireAuthorName = data;
        });
    }
})();
