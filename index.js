var fs = require('fs');
var path = require('path');

var Directory = require('./lib/directory');
var File = require('./lib/file');

module.exports = function(fspath) {
	fspath = (false === path.isAbsolute(fspath))
		? path.join(process.cwd(), fspath)
		: fspath;
	fspath = path.normalize(fspath);

	try	{
		fs.accessSync(fspath);
		var stat = fs.statSync(fspath);

		if (stat.isFile()) {
			return new File(fspath, stat);
		}else if(stat.isDirectory()) {
			return new Directory(fspath, stat);
		}
	}catch(e) {}

	return false;
}