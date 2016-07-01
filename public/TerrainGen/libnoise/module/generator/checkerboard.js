var Checkerboard = function() {};

Checkerboard.prototype.getValue = function(x, y, z) {

	var ix = Math.floor(MathFuncs.makeInt32Range(x));
	var iy = Math.floor(MathFuncs.makeInt32Range(y));
	var iz = Math.floor(MathFuncs.makeInt32Range(z));

    return (ix & 1 ^ iy & 1 ^ iz & 1) ? -1.0 : 1.0;

};

var MathFuncs   = require('../../mathfuncs');

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
	module.exports  = Checkerboard;