(function() {
    'use strict';

    angular
        .module('DKPace')
        .service('calculatorService', calculatorService);

    /* @ngInject */
    function calculatorService() {

    	var _deaths = [];
    	var _levelAverage = null;
    	var _levels = [];
        var _levelDeathSum = 0;
    	var _neededAverage = null;
    	var _projection = null;
    	var _projectionChange = null;
    	var _scores = [];
    	var _startScore = null;

    	this.calculateLevelAverage = calculateLevelAverage;
    	this.calculateNeededAverage = calculateNeededAverage;
    	this.calculateProjection = calculateProjection;
    	this.convertShorthandNumber = convertShorthandNumber;
    	this.getLevelAverage = getLevelAverage;
    	this.getNeededAverage = getNeededAverage;
    	this.getPreviousLevel = getPreviousLevel;
    	this.getProjection = getProjection;
    	this.getStart = getStart;
    	this.isStart = isStart;
    	this.resetServiceVariables = resetServiceVariables;
        this.submitScore = submitScore;

        ////////////////

        function calculateLevelAverage() {

        	var levelSum = 0;
        	for (var i = 0; i < _levels.length; i++) {
        		levelSum += _levels[i];
        	}

        	var unroundedAverage = levelSum / _levels.length;
        	_levelAverage = Math.round(unroundedAverage / 100) * 100;

        }

        function calculateNeededAverage(inputGoal) {

        	var levelSum = 0;
        	for (var i = 0; i < _levels.length; i++) {
        		levelSum += _levels[i];
        	}

        	var deathSum = 0;
        	for (var i = 0; i < _deaths.length; i++) {
        		deathSum += _deaths[i];
        	}

        	var unroundedNeededAverage = ((inputGoal - _startScore) - levelSum - deathSum) / (17 - _levels.length);

        	_neededAverage = Math.round(unroundedNeededAverage / 100) * 100;

        }

        function calculateProjection() {

        	if (_projection) {
        		var oldProjection = _projection;
        	}

        	var deathSum = 0;
        	for (var i = 0; i < _deaths.length; i++) {
        		deathSum += _deaths[i];
        	}

        	calculateLevelAverage();

        	_projection = (_levelAverage * 17) + _startScore + deathSum;

        }

        function convertShorthandNumber(inputNumber) {

        	var returnArguments = [0, false];
        	var modifiedInput = inputNumber;

        	// Is this a death?
        	if (modifiedInput.indexOf('d') > -1) {

        		// Truncate the 'd'.
        		modifiedInput = modifiedInput.replace('d', '');

        		// Mark argument 1 that this is a death.
        		returnArguments[0] = 0;
        		returnArguments[1] = true;

        	}

    		// Process the number.
    		// Shorthand: 637.1 = 637,100
    		if (modifiedInput.indexOf('.') > -1) {
    			var inputSplit = modifiedInput.split('.');
    			modifiedInput = (inputSplit[0] * 1000) + (inputSplit[1] * 100);
    		} else {
    			modifiedInput *= 1000;
    		}

    		returnArguments[0] = modifiedInput;

    		// Argument 0: The actual converted number.
    		// Argument 1: We need to tell the submit function if this was a death so
    		//             that can be properly handled.
        	return returnArguments;

        }

        function getLevelAverage() {
        	return _levelAverage;
        }

        function getNeededAverage() {
        	return _neededAverage;
        }

        function getPreviousLevel() {
        	return _levels[_levels.length - 1];
        }

        function getProjection() {
        	return _projection;
        }

        function getStart() {
        	return _startScore;
        }

        function isStart() {
        	return ( _scores.length === 0 ? true : false );
        }

        function resetServiceVariables() {
        	_deaths = [];
	    	_levelAverage = null;
	    	_levels = [];
            _levelDeathSum = 0;
	    	_neededAverage = null;
	    	_projection = null;
	    	_projectionChange = null;
	    	_scores = [];
	    	_startScore = null;
        }

        function submitScore(inputScore, inputGoal) {

        	var conversionReturn = convertShorthandNumber(inputScore);
        	var score = conversionReturn[0]
        	var isDeath = conversionReturn[1];

        	// If this is a death
        	if (isDeath) {
        		_deaths.push(score);
                _levelDeathSum += score;
        		calculateNeededAverage(inputGoal);
        		calculateProjection();
        		return;
        	}

        	// If _startScore is null, then this is the player's start.
        	if (!_startScore) {
        		_startScore = score;
        		calculateNeededAverage(inputGoal);
        		return;
        	}

        	// Push the input score into the scores array.
        	_scores.push(score);

        	// Figure out the level score and push it to the levels array.
        	if (_scores.length === 1) {
        		_levels.push(_scores[0] - _startScore - _levelDeathSum);
        	} else {
        		_levels.push(_scores[_scores.length - 1] - _scores[_scores.length - 2] - _levelDeathSum);
        	}

            _levelDeathSum = 0;

        	// Calculate the new projected endgame and new needed average.
        	calculateProjection();
        	calculateNeededAverage(inputGoal);

        }

    }

})();