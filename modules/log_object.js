/**
 * Console logs out deep nested objects
 * See: http://stackoverflow.com/a/27534731
 *
 * Accepts one or two params:
 * 	One: Object
 * 	Two: Label string and Object
 *
 * @return {Void}
 */
var log_obj = function () {
	"use strict";
	var label;

	console.log();
	if (arguments.length > 1) {
		label = "** " + arguments[0] + " **: ";
		console.log(label, JSON.stringify(arguments[1], undefined, 2));
	}
	else {
		console.log(JSON.stringify(arguments[0], undefined, 2));
	}
};

module.exports = log_obj;