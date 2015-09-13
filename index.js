var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');

var Directory = require('./lib/directory');
var File = require('./lib/file');

var ITEM_TYPE_DIRECTORY = 0;
var ITEM_TYPE_FILE = 1;
var ITEM_TYPE_SYMLINK = 2;

function toAbsolutePath(fspath) {
	var absPath = (false === path.isAbsolute(fspath))
		? path.join(process.cwd(), fspath)
		: fspath;
	return path.normalize(absPath);
}

module.exports = function(root, type) {
	var item;
	root = toAbsolutePath(root);
	try {
		fs.accessSync(root);
		var stat = fs.statSync(root);

		if (stat.isDirectory()) {
			item = new Directory(root, stat);
		}else if(stat.isFile()) {
			item = new File(root, stat);
		}else if(stat.isSymbolicLink()) {
			return;
		}else{
			return false;
		}
	}catch(e) {
		type = (type || (/\.[^.]+$/g.test(root) ? ITEM_TYPE_FILE : ITEM_TYPE_DIRECTORY));
		switch(type) {
			case ITEM_TYPE_DIRECTORY: {
				mkdirp.sync(root);
				item = new Directory(root);
				return;
			}
			default: return false;
		}
	}

	return item;
}

module.exports.TYPE_DIRECTORY = ITEM_TYPE_DIRECTORY;
module.exports.TYPE_FILE = ITEM_TYPE_FILE;
module.exports.TYPE_SYMLINK = ITEM_TYPE_SYMLINK;