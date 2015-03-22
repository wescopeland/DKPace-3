(function() {
    'use strict';

    angular
        .module('DKPace')
        .controller('Calculator', Calculator);

    /* @ngInject */
    function Calculator(calculatorService, $timeout) {

        var vm = this;

        vm.inputGoal = 1100000;

        vm.refreshView = refreshView;
        vm.resetCalculator = resetCalculator;
        vm.setInitialVariables = setInitialVariables;
        vm.submitScore = submitScore;

        ////////////////

        function refreshView() {

        	// Update all UI-facing variables based on what is living inside our service.
        	if (calculatorService.isStart()) {

        		vm.start = calculatorService.getStart();
        		angular.element('#startDisplay').addClass('animated rubberBand');

        		vm.neededAverage = calculatorService.getNeededAverage();
        		angular.element('#neededAverageDisplay').addClass('animated rubberBand');

        		vm.inputScoreLabel = 'Input Score';

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

        	// Remove all animation classes so we can show them again later.
    		$timeout(function() {

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

        function submitScore() {

        	calculatorService.submitScore(vm.inputScore, vm.inputGoal);

        	refreshView();

        	vm.inputScore = null;

        }

    }

})();