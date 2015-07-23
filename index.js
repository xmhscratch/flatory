var fs = require('fs');
var path = require('path');
var _ = require('underscore');

var Directory = require('./lib/directory');
var File = require('./lib/file');

module.exports = function(fspath) {
	fspath = path.join(process.cwd(), fspath);
	fspath = path.normalize(fspath);

	var stats = fs.statSync(fspath);

	if (stats.isDirectory()) return new Directory(fspath);
	else if(stats.isFile()) return new File(fspath);
	else return;
}