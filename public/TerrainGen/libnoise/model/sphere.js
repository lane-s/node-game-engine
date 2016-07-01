var Sphere = function(sourceModule) {

	this.sourceModule = sourceModule || null;

};

Sphere.prototype.getValue = function(lat, lon) {

	if(!this.sourceModule) {

		throw new Error('Invalid or missing module!');

	}

	var r = Math.cos(MathConsts.DEG_TO_RAD * lat);

	return this.sourceModule.getValue(
		Math.cos(MathConsts.DEG_TO_RAD * lon) * r,
		Math.sin(MathConsts.DEG_TO_RAD * lat),
		Math.sin(MathConsts.DEG_TO_RAD * lon) * r
	);

};
var MathConsts = require('../mathconsts');

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
	module.exports = Sphere;