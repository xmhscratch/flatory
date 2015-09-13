var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');

var Directory = require('./directory');
var File = require('./file');

var ITEM_TYPE_DIRECTORY = 0;
var ITEM_TYPE_FILE = 1;
var ITEM_TYPE_SYMLINK = 2;

var Item = function(root) {
	this.root = this.toAbsolutePath(root);
	return this;
}

Item.prototype = {
	root: null,

	toAbsolutePath: function(fspath) {
		var absPath = (false === path.isAbsolute(fspath))
			? path.join(process.cwd(), fspath)
			: fspath;
		return path.normalize(absPath);
	},

	toInstance: function(type) {
		var instance;

		try {
			fs.accessSync(this.root);
			var stat = fs.statSync(this.root);

			if (stat.isDirectory()) {
				instance = new Directory(this.root, stat);
			}else if(stat.isFile()) {
				instance = new File(this.root, stat);
			}else if(stat.isSymbolicLink()) {
				return;
			}else{
				return false;
			}
		}catch(e) {
			type = type || this.getTypeByPath();
			switch(type) {
				case ITEM_TYPE_DIRECTORY: {
					mkdirp.sync(this.root);
					instance = new Directory(this.root);
					return;
				}
				default: return false;
			}
		}

		return instance;
	},

	getTypeByPath: function() {
		return /\.[^.]+$/g.test(this.root) ? ITEM_TYPE_FILE : ITEM_TYPE_DIRECTORY;
	}
}

Item.TYPE_DIRECTORY = ITEM_TYPE_DIRECTORY;
Item.TYPE_FILE = ITEM_TYPE_FILE;
Item.TYPE_SYMLINK = ITEM_TYPE_SYMLINK;

module.exports = Item;