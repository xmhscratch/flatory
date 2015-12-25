var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var rimraf = require('rimraf');

var Directory = function(root, stat) {
	this.root = root;
	this.stat = stat || fs.statSync(root);

	return this;
}

Directory.prototype = {
	type: 0,

	ensure: function(mode) {
		// return mkdirp.sync(this.root, mode || 0770);
	},

	delete: function() {
		return rimraf.sync(this.root);
	},

	deleteAsync: function(done) {
		return rimraf(this.root, done);
	},

	joinPaths: function(dirs) {
		dirs = _.chain(arguments)
			.toArray()
			.compact()
			.flatten()
			.value();
		dirs.unshift(this.root);
		return path.join.apply(this, dirs);
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

	getItems: function(filter, options) {
		options = (options || {});
		_.defaults(options, {
			excludes: ['.git', '.svn', 'node_modules'],
			deep: Number.MAX_VALUE
		});

		var _super = this, directoryItems = {}, level = 1;

		return (function collectItems(srcpath) {
			var excludePattern = new RegExp('.*('+options.excludes.join('|')+').*', 'g');

			var level = _.chain(
				path.relative(_super.root, srcpath).split(path.sep)
			).compact().size().value();

			if (level >= options.deep) return;

			var items = (new Directory(srcpath)).getChildItems(true);

			directoryItems[srcpath] = _.filter(items, function(item) {
				return fs.statSync(item).isFile() && _super._parseFilter(filter, item);
			});
			
			var directories = _.filter(items, function(item) {
				return fs.statSync(item).isDirectory() && _.isEqual(excludePattern.test(item), false);
			});

			_.forEach(directories, collectItems);

			return directoryItems;
		})(this.root);
	},

	_parseFilter: function(filter, item) {
		if (_.isFunction(filter)) return _(filter(item)).isEqual(true);
		if (_.isRegExp(filter)) return (new RegExp(filter)).test(item);
		return true;
	}

}

module.exports = Directory;