(function() {
    'use strict';

    angular
        .module('DKPace')
        .controller('Calculator', Calculator)
        .element(document).ready(function() {
            angular.element('.tooltipped').tooltip( {delay: 0} );
        });

    function Calculator($scope, calculatorService, $firebaseObject, $timeout) {

        var vm = this;

        vm.configuringMobile = false;
        vm.inputGoal = 1100000;
        vm.mobileKey = null;

        vm.configureMobile = configureMobile;
        vm.generateMobileKey = generateMobileKey;
        vm.goBackToCalculator = goBackToCalculator;
        vm.refreshView = refreshView;
        vm.resetCalculator = resetCalculator;
        vm.setInitialVariables = setInitialVariables;
        vm.submitQuickDeath = submitQuickDeath;
        vm.submitScore = submitScore;

        ////////////////

        function configureMobile() {

            // Hide the calculator UI and show the mobile config UI.
            angular.element('#calculatorUI').addClass('animated fadeOutLeft');

            $timeout(function() {
                vm.configuringMobile = true;
                angular.element('#calculatorUI').removeClass('animated fadeOutLeft');
                angular.element('#mobileConfigUI').addClass('animated fadeInRight');
            }, 750);

        }

        function generateMobileKey() {

            var FBURL = 'https://dkpace.firebaseio.com/';

            // Generate a six character numeric key.
            vm.mobileKey = '';
            for (vm.mobileKey; vm.mobileKey.length < 6;) {
                vm.mobileKey += Math.random().toString(5).substr(2, 1);
            }

            // Track the remote inputScore that lives on Firebase.
            console.debug(FBURL + '331200' + '/inputScore');
            //var remoteDataRef = new Firebase(FBURL + vm.mobileKey + '/inputScore');
            var inputScoreRef = new Firebase(FBURL + '331200' + '/inputScore');
            var inputScoreSyncObject = $firebaseObject(inputScoreRef);
            inputScoreSyncObject.$bindTo($scope, 'firebaseInputScore');

            // Track a variable from Firebase responsible for function triggers.
            var functionTriggerRef = new Firebase(FBURL + '331200' + '/functionTrigger');
            var functionTriggerSyncObject = $firebaseObject(functionTriggerRef);
            functionTriggerSyncObject.$bindTo($scope, 'functionTrigger').then(function() {

                functionTriggerSyncObject.$watch(function() {

                    if ($scope.functionTrigger.$value === 'submitScore()') {
                        vm.inputScore = $scope.firebaseInputScore.$value;
                        submitScore();
                        $scope.functionTrigger.$value = '';
                        $scope.firebaseInputScore.$value = '';
                    }

                    if ($scope.functionTrigger.$value === 'submitQuickDeath(1.6)') {
                        submitQuickDeath(1.6);
                        $scope.functionTrigger.$value = '';
                    }

                    if ($scope.functionTrigger.$value === 'submitQuickDeath(4)') {
                        submitQuickDeath(4);
                        $scope.functionTrigger.$value = '';
                    }

                    if ($scope.functionTrigger.$value === 'submitQuickDeath(8.5)') {
                        submitQuickDeath(8.5);
                        $scope.functionTrigger.$value = '';
                    }

                    if ($scope.functionTrigger.$value === 'resetCalculator()') {
                        resetCalculator();
                        $scope.functionTrigger.$value = '';
                    }

                });

            });

            angular.element('#inputScore').focus();
            vm.keySuccess = true;
            //vm.configuringMobile = false;

            angular.element('#mobileConfigSuccess').addClass('animated bounceInUp');

        }

        function goBackToCalculator() {

            // Hide the mobile config UI and show the calculator UI.
            angular.element('#mobileConfigUI').addClass('fadeOutRight');

            $timeout(function() {
                vm.configuringMobile = false;
                angular.element('#mobileConfigUI').removeClass('animated fadeOutRight');
                angular.element('#calculatorUI').addClass('animated fadeInLeft');
            }, 750);

        }

        function refreshView() {

            // Update all UI-facing variables based on what is living inside our service.
            if (calculatorService.isStart()) {

                vm.start = calculatorService.getStart();
                angular.element('#startDisplay').addClass('animated rubberBand');

                vm.neededAverage = calculatorService.getNeededAverage();
                angular.element('#neededAverageDisplay').addClass('animated rubberBand');

            } else {

                vm.neededAverage = calculatorService.getNeededAverage();
                angular.element('#neededAverageDisplay').addClass('animated rubberBand');

                vm.projectedFinal = calculatorService.getProjection();
                angular.element('#projectionDisplay').addClass('animated rubberBand');

                // Do not animate level average and previous level if this is a death.
                if (vm.inputScore.indexOf('d') === -1) {

                    vm.levelAverage = calculatorService.getLevelAverage();
                    angular.element('#levelAverageDisplay').addClass('animated rubberBand');

                    vm.previousLevel = calculatorService.getPreviousLevel();
                    angular.element('#previousLevelDisplay').addClass('animated rubberBand');

                }

            }

            var currentLevel = calculatorService.getCurrentLevel();
            vm.inputScoreLabel = 'Input L' + currentLevel + ' Score or Death';

            // Remove all animation classes so we can show them again later.
            $timeout(function() {

                angular.element('#startDisplay').removeClass('animated rubberBand');
                angular.element('#levelAverageDisplay').removeClass('animated rubberBand');
                angular.element('#neededAverageDisplay').removeClass('animated rubberBand');
                angular.element('#previousLevelDisplay').removeClass('animated rubberBand');
                angular.element('#projectionDisplay').removeClass('animated rubberBand');

            }, 2000);

        }

        function resetCalculator() {

            setInitialVariables();
            calculatorService.resetServiceVariables();

        }

        function setInitialVariables() {

            vm.start = null;
            vm.levelAverage = null;
            vm.neededAverage = null;
            vm.previousLevel = null;
            vm.projectedFinal = null;

            vm.inputScoreLabel = 'Input Start Score';

        }

        function submitQuickDeath(inputDeathPoints) {

            calculatorService.submitQuickDeath(inputDeathPoints, vm.inputGoal);

            refreshView();

            angular.element('#inputScore').focus();

        }

        function submitScore() {

            calculatorService.submitScore(vm.inputScore, vm.inputGoal);

            refreshView();

            vm.inputScore = null;

        }

    }

})();