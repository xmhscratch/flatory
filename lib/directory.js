var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var Q = require('q');
var mkdirp = require('mkdirp');

var iopath = require('./iopath');

var Directory = function(dirpath) {
	dirpath = (dirpath || './');
	this.root = path.normalize(dirpath);
	this.root = path.isAbsolute(this.root) ? this.root : path.join(process.cwd(), this.root);

	return this;
}

Directory.prototype = {
	_stat: null,

	getStat: function() {
		return fs.statSync(this.root);
	},

	getStatAsync: function(done) {
		if (this._stat) done(null, this._stat);
		else fs.stat(this.root, done);
	},

	getChildItems: function(filter) {
		var _super = this;

		return _(fs.readdirSync(this.root))
			.chain()
			.map(function(item) {
				return path.resolve(process.cwd(), _super.root, item);
			})
			.filter(function(item) {
				return _super._parseFilter(filter, item);
			})
			.value();
	},

	ensure: function(mode) {
		return mkdirp.sync(this.root, mode || 0770);
	},

	ensureAsync: function(mode, done) {
		return mkdirp(this.root, mode || 0770, done);
	},

	getDirectoryItems: function(filter, options) {
		options = (options || {});
		_.defaults(options, {
			excludes: ['.git', '.svn', 'node_modules'],
			deep: Number.MAX_VALUE
		});

		var _super = this, directoryItems = {}, level = 1;
		directoryItems[this.root] = this.getChildItems(function(item) {
			return iopath(item).isFile() && _super._parseFilter(filter, item);
		});

		return (function collectItems(srcpath) {
			var directories = (
				new Directory(srcpath)
			).getChildItems(function(item) {
				return iopath(item).isDirectory();
			});

			for (var i = directories.length - 1; i >= 0; i--) {
				var directory = directories[i]
					, excludePattern = new RegExp('.*('+options.excludes.join('|')+').*', 'g')
					, level = _(
						path.relative(_super.root, directory).split(path.sep)
					).chain().compact().size().value()
				;

				if (_.isEqual(excludePattern.test(directory), false)) {
					directoryItems[directory] = (
						new Directory(directory)
					).getChildItems(function(childitem) {
						return iopath(childitem).isFile() && _super._parseFilter(filter, childitem);
					});
				}

				if (level < options.deep) {
					collectItems(directory);
				}
			};

			return directoryItems;
		})(this.root);
	},

	_parseFilter: function(filter, item) {
		if (_.isFunction(filter)) return _(filter(item)).isEqual(true);
		if (_.isRegExp(filter)) return filter.test(item);
		return true;
	}

}

module.exports = Directory;