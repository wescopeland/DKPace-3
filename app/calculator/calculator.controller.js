(function() {
    'use strict';

    angular
        .module('DKPace')
        .controller('Calculator', Calculator)

    function Calculator($scope, calculatorService, $timeout) {

        var vm = this;

        vm.configuringMobile = false;
        vm.inputGoal = 1247700;
        vm.mobileKey = null;

        vm.configureMobile = configureMobile;
        vm.refreshView = refreshView;
        vm.resetCalculator = resetCalculator;
        vm.setInitialVariables = setInitialVariables;
        vm.submitScore = submitScore;

        ////////////////

        function configureMobile() {

            // Hide the calculator UI and show the mobile config UI.
            angular.element('#calculatorUI').addClass('animated fadeOutLeft');

            $timeout(function() {
                vm.configuringMobile = true;
                angular.element('#calculatorUI').removeClass('animated fadeOutLeft');
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

            vm.currentLevel = calculatorService.getCurrentLevel();
            vm.deathPoints = calculatorService.getDeathPoints();
            vm.targetScore = calculatorService.getTargetScore();

            vm.inputScoreLabel = 'Input L' + vm.currentLevel + ' Score or Death';

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
            vm.deathPoints = null;
            vm.targetScore = null;
            vm.currentLevel = null;

            vm.inputScoreLabel = 'Input Start Score';

        }

        function submitScore() {

            calculatorService.submitScore(vm.inputScore, vm.inputGoal);

            refreshView();

            vm.inputScore = null;

        }

    }

})();