var fs = require('fs');
var path = require('path');
var _ = require('underscore');

module.exports = function(srcpath) {
	return _.extend({}, fs.statSync(srcpath));
}