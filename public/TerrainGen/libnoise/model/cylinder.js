var Cylinder = function(sourceModule) {

	this.sourceModule = sourceModule || null;

};

Cylinder.prototype.getValue = function(angle, y) {

	if(!this.sourceModule) {

		throw new Error('Invalid or missing module!');

	}

	var i = parseFloat(angle) * MathConsts.DEG_TO_RAD;

	return this.sourceModule.getValue(Math.cos(i), y, Math.sin(i));

};

var MathConsts = require('../mathconsts');

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
	module.exports = Cylinder;
