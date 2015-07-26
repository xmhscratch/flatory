var fs = require('fs');
var path = require('path');

var Directory = require('./lib/directory');
var File = require('./lib/file');

module.exports = function(fspath) {
	fspath = path.join(process.cwd(), fspath);
	fspath = path.normalize(fspath);

	if (/\.[^\/\\.]+$/g.test(fspath)) {
		return new File(fspath);
	}else{
		return new Directory(fspath);
	}

	return false;
}